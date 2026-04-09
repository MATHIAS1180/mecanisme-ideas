use std::str::FromStr;

use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program::invoke_signed,
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction, system_program,
    sysvar::Sysvar,
};

use crate::{
    error::NodusError,
    instruction::NodusInstruction,
    state::{UserState, VaultState},
    utils::{
        checked_add, checked_sub, compute_cooldown_slots, compute_reset_slots, current_slot, remaining_slots,
        transfer_lamports, ANCHOR_LAMPORTS, ENTRY_LAMPORTS, MAX_ANCHORS_PER_CYCLE, MAX_CURSES,
        MAX_RESET_SLOTS, MAX_SABOTAGE_PER_WALLET, PROTOCOL_FEE_WALLET, SHIELD_DURATION_SLOTS,
        TERMINAL_LOCK_PRESSURE, USER_STATE_SEED, VAULT_SEED,
    },
};

pub struct Processor;

impl Processor {
    pub fn process<'a>(program_id: &Pubkey, accounts: &'a [AccountInfo<'a>], instruction_data: &[u8]) -> ProgramResult {
        match NodusInstruction::unpack(instruction_data)? {
            NodusInstruction::Initialize => Self::process_initialize(program_id, accounts),
            NodusInstruction::Deposit => Self::process_deposit(program_id, accounts),
            NodusInstruction::Shield => Self::process_shield(program_id, accounts),
            NodusInstruction::Sabotage => Self::process_sabotage(program_id, accounts),
            NodusInstruction::Anchor => Self::process_anchor(program_id, accounts),
            NodusInstruction::ArmSnipe { expiry_slot } => Self::process_arm_snipe(program_id, accounts, expiry_slot),
            NodusInstruction::ReclaimSnipe => Self::process_reclaim_snipe(program_id, accounts),
            NodusInstruction::Curse => Self::process_curse(program_id, accounts),
            NodusInstruction::Blizzard => Self::process_blizzard(program_id, accounts),
            NodusInstruction::Resolve => Self::process_resolve(program_id, accounts),
        }
    }

    fn process_initialize<'a>(program_id: &Pubkey, accounts: &'a [AccountInfo<'a>]) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let payer = next_account_info(account_info_iter)?;
        let vault_account = next_account_info(account_info_iter)?;
        let system_program_account = next_account_info(account_info_iter)?;

        if !payer.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }
        if *system_program_account.key != system_program::id() {
            return Err(ProgramError::IncorrectProgramId);
        }

        let (vault_pda, vault_bump) = Pubkey::find_program_address(&[VAULT_SEED], program_id);
        if *vault_account.key != vault_pda {
            return Err(NodusError::InvalidPda.into());
        }

        if vault_account.owner != program_id {
            Self::create_pda_account(
                payer,
                vault_account,
                system_program_account,
                program_id,
                &[VAULT_SEED, &[vault_bump]],
                VaultState::LEN,
            )?;
        } else {
            let existing = VaultState::unpack(&vault_account.try_borrow_data()?)?;
            if existing.initialized {
                return Err(NodusError::VaultAlreadyInitialized.into());
            }
        }

        let mut vault = VaultState::default();
        vault.initialized = true;
        vault.protocol_fee_bps = 200;
        let mut data = vault_account.try_borrow_mut_data()?;
        vault.pack(&mut data)?;
        msg!("nodus: vault initialized");
        Ok(())
    }

    fn process_deposit<'a>(program_id: &Pubkey, accounts: &'a [AccountInfo<'a>]) -> ProgramResult {
        let ActionContext { signer, vault_account, user_state_account, system_program_account, protocol_fee_wallet, leader_account } =
            Self::parse_action_accounts(accounts)?;
        let slot = current_slot()?;
        let mut vault = Self::load_vault(vault_account, program_id)?;
        
        // Vérifier si on doit auto-résoudre le cycle
        let needs_auto_resolve = Self::assert_cycle_can_accept_paid_action(&vault, slot, true)?;
        if needs_auto_resolve {
            vault = Self::auto_resolve_cycle(vault_account, protocol_fee_wallet, leader_account, vault)?;
        }

        if vault.shield_expires_slot > slot {
            return Err(NodusError::ShieldActive.into());
        }

        let mut user = Self::ensure_user_state(program_id, signer, user_state_account, system_program_account, vault.cycle_number)?;
        Self::sync_user_cycle(&mut user, vault.cycle_number);
        Self::enforce_cooldown(&user, slot)?;

        transfer_lamports(signer, vault_account, system_program_account, ENTRY_LAMPORTS)?;

        if vault.active_snipe_wallet != Pubkey::default()
            && vault.active_snipe_expiry_slot >= slot
            && vault.active_snipe_wallet != *signer.key
        {
            vault.pressure_count = checked_add(vault.pressure_count, 2)?;
            vault.leader = vault.active_snipe_wallet;
            vault.leader_since_slot = slot;
            vault.active_snipe_wallet = Pubkey::default();
            vault.active_snipe_expiry_slot = 0;
            vault.active_snipe_escrow_lamports = 0;
            msg!("nodus: snipe triggered");
        } else {
            vault.pressure_count = checked_add(vault.pressure_count, 1)?;
            vault.leader = *signer.key;
            vault.leader_since_slot = slot;
            msg!("nodus: deposit accepted");
        }

        vault.timer_start_slot = slot;
        vault.timer_reset_slots = compute_reset_slots(vault.pressure_count);
        if vault.pressure_count >= TERMINAL_LOCK_PRESSURE {
            vault.terminal_lock = true;
        }

        user.action_count_this_cycle = user.action_count_this_cycle.saturating_add(1);
        user.last_action_slot = slot;

        Self::store_vault(vault_account, vault)?;
        Self::store_user_state(user_state_account, user)?;
        Ok(())
    }

    fn process_shield<'a>(program_id: &Pubkey, accounts: &'a [AccountInfo<'a>]) -> ProgramResult {
        let ActionContext { signer, vault_account, user_state_account, system_program_account, protocol_fee_wallet, leader_account } =
            Self::parse_action_accounts(accounts)?;
        let slot = current_slot()?;
        let mut vault = Self::load_vault(vault_account, program_id)?;
        
        // Vérifier si on doit auto-résoudre le cycle
        let needs_auto_resolve = Self::assert_cycle_can_accept_paid_action(&vault, slot, false)?;
        if needs_auto_resolve {
            vault = Self::auto_resolve_cycle(vault_account, protocol_fee_wallet, leader_account, vault)?;
        }
        
        if vault.leader != *signer.key {
            return Err(NodusError::LeaderOnlyAction.into());
        }

        let mut user = Self::ensure_user_state(program_id, signer, user_state_account, system_program_account, vault.cycle_number)?;
        Self::sync_user_cycle(&mut user, vault.cycle_number);
        Self::enforce_cooldown(&user, slot)?;
        if user.shield_used {
            return Err(NodusError::ShieldAlreadyUsed.into());
        }

        transfer_lamports(signer, vault_account, system_program_account, ENTRY_LAMPORTS)?;
        vault.pressure_count = checked_add(vault.pressure_count, 1)?;
        vault.shield_expires_slot = slot.saturating_add(SHIELD_DURATION_SLOTS);
        if vault.pressure_count >= TERMINAL_LOCK_PRESSURE {
            vault.terminal_lock = true;
        }

        user.shield_used = true;
        user.action_count_this_cycle = user.action_count_this_cycle.saturating_add(1);
        user.last_action_slot = slot;

        Self::store_vault(vault_account, vault)?;
        Self::store_user_state(user_state_account, user)?;
        msg!("nodus: shield activated");
        Ok(())
    }

    fn process_sabotage<'a>(program_id: &Pubkey, accounts: &'a [AccountInfo<'a>]) -> ProgramResult {
        let ActionContext { signer, vault_account, user_state_account, system_program_account, protocol_fee_wallet, leader_account } =
            Self::parse_action_accounts(accounts)?;
        let slot = current_slot()?;
        let mut vault = Self::load_vault(vault_account, program_id)?;
        
        // Vérifier si on doit auto-résoudre le cycle
        let needs_auto_resolve = Self::assert_cycle_can_accept_paid_action(&vault, slot, false)?;
        if needs_auto_resolve {
            vault = Self::auto_resolve_cycle(vault_account, protocol_fee_wallet, leader_account, vault)?;
        }
        
        if vault.leader == *signer.key {
            return Err(NodusError::NonLeaderOnlyAction.into());
        }

        let mut user = Self::ensure_user_state(program_id, signer, user_state_account, system_program_account, vault.cycle_number)?;
        Self::sync_user_cycle(&mut user, vault.cycle_number);
        Self::enforce_cooldown(&user, slot)?;
        if user.sabotage_used_count >= MAX_SABOTAGE_PER_WALLET {
            return Err(NodusError::SabotageLimitReached.into());
        }

        transfer_lamports(signer, vault_account, system_program_account, ENTRY_LAMPORTS)?;
        vault.pressure_count = checked_add(vault.pressure_count, 1)?;
        let remaining = remaining_slots(slot, vault.timer_start_slot, vault.timer_reset_slots);
        let new_remaining = remaining.max(2) / 2;
        vault.timer_start_slot = slot;
        vault.timer_reset_slots = new_remaining.max(1);
        if vault.pressure_count >= TERMINAL_LOCK_PRESSURE {
            vault.terminal_lock = true;
        }

        user.sabotage_used_count = user.sabotage_used_count.saturating_add(1);
        user.action_count_this_cycle = user.action_count_this_cycle.saturating_add(1);
        user.last_action_slot = slot;

        Self::store_vault(vault_account, vault)?;
        Self::store_user_state(user_state_account, user)?;
        msg!("nodus: sabotage executed");
        Ok(())
    }

    fn process_anchor<'a>(program_id: &Pubkey, accounts: &'a [AccountInfo<'a>]) -> ProgramResult {
        let ActionContext { signer, vault_account, user_state_account, system_program_account, protocol_fee_wallet, leader_account } =
            Self::parse_action_accounts(accounts)?;
        let slot = current_slot()?;
        let mut vault = Self::load_vault(vault_account, program_id)?;
        
        // Vérifier si on doit auto-résoudre le cycle
        let needs_auto_resolve = Self::assert_cycle_can_accept_paid_action(&vault, slot, false)?;
        if needs_auto_resolve {
            vault = Self::auto_resolve_cycle(vault_account, protocol_fee_wallet, leader_account, vault)?;
        }
        
        if vault.leader != *signer.key {
            return Err(NodusError::LeaderOnlyAction.into());
        }
        if vault.anchor_count >= MAX_ANCHORS_PER_CYCLE {
            return Err(NodusError::AnchorLimitReached.into());
        }

        let mut user = Self::ensure_user_state(program_id, signer, user_state_account, system_program_account, vault.cycle_number)?;
        Self::sync_user_cycle(&mut user, vault.cycle_number);
        Self::enforce_cooldown(&user, slot)?;
        if user.anchor_used {
            return Err(NodusError::AnchorAlreadyUsed.into());
        }

        transfer_lamports(signer, vault_account, system_program_account, ANCHOR_LAMPORTS)?;
        vault.pressure_count = checked_add(vault.pressure_count, 2)?;
        vault.anchor_count = vault.anchor_count.saturating_add(1);
        vault.timer_start_slot = slot;
        vault.timer_reset_slots = MAX_RESET_SLOTS;
        if vault.pressure_count >= TERMINAL_LOCK_PRESSURE {
            vault.terminal_lock = true;
        }

        user.anchor_used = true;
        user.action_count_this_cycle = user.action_count_this_cycle.saturating_add(1);
        user.last_action_slot = slot;

        Self::store_vault(vault_account, vault)?;
        Self::store_user_state(user_state_account, user)?;
        msg!("nodus: anchor executed");
        Ok(())
    }

    fn process_arm_snipe<'a>(program_id: &Pubkey, accounts: &'a [AccountInfo<'a>], expiry_slot: u64) -> ProgramResult {
        let ActionContext { signer, vault_account, user_state_account, system_program_account, protocol_fee_wallet, leader_account } =
            Self::parse_action_accounts(accounts)?;
        let slot = current_slot()?;
        let mut vault = Self::load_vault(vault_account, program_id)?;
        
        // Vérifier si on doit auto-résoudre le cycle
        let needs_auto_resolve = Self::assert_cycle_can_accept_paid_action(&vault, slot, false)?;
        if needs_auto_resolve {
            vault = Self::auto_resolve_cycle(vault_account, protocol_fee_wallet, leader_account, vault)?;
        }

        if expiry_slot <= slot {
            return Err(NodusError::InvalidExpiry.into());
        }
        if vault.active_snipe_wallet != Pubkey::default() && vault.active_snipe_expiry_slot >= slot {
            return Err(NodusError::SnipeAlreadyActive.into());
        }

        let mut user = Self::ensure_user_state(program_id, signer, user_state_account, system_program_account, vault.cycle_number)?;
        Self::sync_user_cycle(&mut user, vault.cycle_number);
        Self::enforce_cooldown(&user, slot)?;

        transfer_lamports(signer, vault_account, system_program_account, ENTRY_LAMPORTS)?;
        vault.active_snipe_wallet = *signer.key;
        vault.active_snipe_expiry_slot = expiry_slot;
        vault.active_snipe_escrow_lamports = ENTRY_LAMPORTS;

        user.action_count_this_cycle = user.action_count_this_cycle.saturating_add(1);
        user.last_action_slot = slot;

        Self::store_vault(vault_account, vault)?;
        Self::store_user_state(user_state_account, user)?;
        msg!("nodus: snipe armed");
        Ok(())
    }

    fn process_reclaim_snipe<'a>(program_id: &Pubkey, accounts: &'a [AccountInfo<'a>]) -> ProgramResult {
        let ActionContext { signer, vault_account, .. } = Self::parse_action_accounts(accounts)?;
        let slot = current_slot()?;
        let mut vault = Self::load_vault(vault_account, program_id)?;
        if vault.active_snipe_wallet == Pubkey::default() || vault.active_snipe_wallet != *signer.key {
            return Err(NodusError::SnipeNotActive.into());
        }
        if !vault.terminal_lock && vault.active_snipe_expiry_slot > slot {
            return Err(NodusError::SnipeNotExpired.into());
        }

        Self::debit_vault_credit_target(vault_account, signer, vault.active_snipe_escrow_lamports)?;
        vault.active_snipe_wallet = Pubkey::default();
        vault.active_snipe_expiry_slot = 0;
        vault.active_snipe_escrow_lamports = 0;
        Self::store_vault(vault_account, vault)?;
        msg!("nodus: snipe reclaimed");
        Ok(())
    }

    fn process_curse<'a>(program_id: &Pubkey, accounts: &'a [AccountInfo<'a>]) -> ProgramResult {
        let ActionContext { signer, vault_account, user_state_account, system_program_account, protocol_fee_wallet, leader_account } =
            Self::parse_action_accounts(accounts)?;
        let slot = current_slot()?;
        let mut vault = Self::load_vault(vault_account, program_id)?;
        
        // Vérifier si on doit auto-résoudre le cycle
        let needs_auto_resolve = Self::assert_cycle_can_accept_paid_action(&vault, slot, false)?;
        if needs_auto_resolve {
            vault = Self::auto_resolve_cycle(vault_account, protocol_fee_wallet, leader_account, vault)?;
        }
        
        if vault.curse_count >= MAX_CURSES {
            return Err(NodusError::CurseLimitReached.into());
        }

        let mut user = Self::ensure_user_state(program_id, signer, user_state_account, system_program_account, vault.cycle_number)?;
        Self::sync_user_cycle(&mut user, vault.cycle_number);
        Self::enforce_cooldown(&user, slot)?;
        if user.curse_used {
            return Err(NodusError::CurseAlreadyUsed.into());
        }

        transfer_lamports(signer, vault_account, system_program_account, ENTRY_LAMPORTS)?;
        vault.pressure_count = checked_add(vault.pressure_count, 1)?;
        vault.curse_count = vault.curse_count.saturating_add(1);
        if vault.pressure_count >= TERMINAL_LOCK_PRESSURE {
            vault.terminal_lock = true;
        }

        user.curse_used = true;
        user.action_count_this_cycle = user.action_count_this_cycle.saturating_add(1);
        user.last_action_slot = slot;

        Self::store_vault(vault_account, vault)?;
        Self::store_user_state(user_state_account, user)?;
        msg!("nodus: curse added");
        Ok(())
    }

    fn process_blizzard<'a>(program_id: &Pubkey, accounts: &'a [AccountInfo<'a>]) -> ProgramResult {
        let ActionContext { signer, vault_account, user_state_account, system_program_account, protocol_fee_wallet, leader_account } =
            Self::parse_action_accounts(accounts)?;
        let slot = current_slot()?;
        let mut vault = Self::load_vault(vault_account, program_id)?;
        
        // Vérifier si on doit auto-résoudre le cycle
        let needs_auto_resolve = Self::assert_cycle_can_accept_paid_action(&vault, slot, false)?;
        if needs_auto_resolve {
            vault = Self::auto_resolve_cycle(vault_account, protocol_fee_wallet, leader_account, vault)?;
        }

        let mut user = Self::ensure_user_state(program_id, signer, user_state_account, system_program_account, vault.cycle_number)?;
        Self::sync_user_cycle(&mut user, vault.cycle_number);
        Self::enforce_cooldown(&user, slot)?;

        transfer_lamports(signer, vault_account, system_program_account, ENTRY_LAMPORTS)?;
        vault.pressure_count = checked_add(vault.pressure_count, 1)?;
        if vault.pressure_count >= TERMINAL_LOCK_PRESSURE {
            vault.terminal_lock = true;
        }

        user.action_count_this_cycle = user.action_count_this_cycle.saturating_add(1);
        user.last_action_slot = slot;

        Self::store_vault(vault_account, vault)?;
        Self::store_user_state(user_state_account, user)?;
        msg!("nodus: blizzard applied");
        Ok(())
    }

    fn process_resolve<'a>(program_id: &Pubkey, accounts: &'a [AccountInfo<'a>]) -> ProgramResult {
        let ActionContext { vault_account, protocol_fee_wallet, leader_account, .. } = Self::parse_action_accounts(accounts)?;
        let slot = current_slot()?;
        let mut vault = Self::load_vault(vault_account, program_id)?;
        if vault.leader == Pubkey::default() {
            return Err(NodusError::NoLeader.into());
        }
        if vault.active_snipe_wallet != Pubkey::default() {
            return Err(NodusError::SnipeStillActive.into());
        }
        if remaining_slots(slot, vault.timer_start_slot, vault.timer_reset_slots) > 0 {
            return Err(NodusError::TimerNotExpired.into());
        }

        let expected_fee_wallet = Pubkey::from_str(PROTOCOL_FEE_WALLET).map_err(|_| ProgramError::InvalidArgument)?;
        if *protocol_fee_wallet.key != expected_fee_wallet {
            return Err(NodusError::InvalidProtocolFeeWallet.into());
        }
        if *leader_account.key != vault.leader {
            return Err(NodusError::InvalidLeaderAccount.into());
        }

        let rent_reserve = Rent::get()?.minimum_balance(VaultState::LEN);
        let gross_pot = vault_account.lamports().saturating_sub(rent_reserve);
        let protocol_fee = gross_pot.saturating_mul(vault.protocol_fee_bps as u64) / 10_000;
        let carry = gross_pot.saturating_mul(vault.curse_count as u64) / 100;
        let payout = gross_pot.saturating_sub(protocol_fee).saturating_sub(carry);

        Self::debit_vault_credit_target(vault_account, leader_account, payout)?;
        Self::debit_vault_credit_target(vault_account, protocol_fee_wallet, protocol_fee)?;

        vault.last_resolved_winner = vault.leader;
        vault.last_resolved_payout = payout;
        vault.last_cycle_pot = gross_pot;
        vault.last_cycle_pressure = vault.pressure_count;
        vault.carry_over_lamports = carry;
        vault.leader = Pubkey::default();
        vault.leader_since_slot = 0;
        vault.timer_start_slot = 0;
        vault.timer_reset_slots = 0;
        vault.pressure_count = 0;
        vault.terminal_lock = false;
        vault.shield_expires_slot = 0;
        vault.anchor_count = 0;
        vault.curse_count = 0;
        vault.active_snipe_wallet = Pubkey::default();
        vault.active_snipe_expiry_slot = 0;
        vault.active_snipe_escrow_lamports = 0;
        vault.cycle_number = checked_add(vault.cycle_number, 1)?;

        Self::store_vault(vault_account, vault)?;
        msg!("nodus: cycle resolved");
        Ok(())
    }

    fn parse_action_accounts<'a>(accounts: &'a [AccountInfo<'a>]) -> Result<ActionContext<'a>, ProgramError> {
        let account_info_iter = &mut accounts.iter();
        let signer = next_account_info(account_info_iter)?;
        let vault_account = next_account_info(account_info_iter)?;
        let user_state_account = next_account_info(account_info_iter)?;
        let protocol_fee_wallet = next_account_info(account_info_iter)?;
        let leader_account = next_account_info(account_info_iter)?;
        let system_program_account = next_account_info(account_info_iter)?;

        if !signer.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }
        if *system_program_account.key != system_program::id() {
            return Err(ProgramError::IncorrectProgramId);
        }

        Ok(ActionContext {
            signer,
            vault_account,
            user_state_account,
            protocol_fee_wallet,
            leader_account,
            system_program_account,
        })
    }

    fn create_pda_account<'a>(
        payer: &AccountInfo<'a>,
        target: &AccountInfo<'a>,
        system_program_account: &AccountInfo<'a>,
        program_id: &Pubkey,
        seeds: &[&[u8]],
        size: usize,
    ) -> ProgramResult {
        let rent = Rent::get()?;
        let lamports = rent.minimum_balance(size);
        invoke_signed(
            &system_instruction::create_account(payer.key, target.key, lamports, size as u64, program_id),
            &[payer.clone(), target.clone(), system_program_account.clone()],
            &[seeds],
        )
    }

    fn ensure_user_state<'a>(
        program_id: &Pubkey,
        signer: &AccountInfo<'a>,
        user_state_account: &AccountInfo<'a>,
        system_program_account: &AccountInfo<'a>,
        current_cycle_number: u64,
    ) -> Result<UserState, ProgramError> {
        let (expected_pda, bump) = Pubkey::find_program_address(&[USER_STATE_SEED, signer.key.as_ref()], program_id);
        if *user_state_account.key != expected_pda {
            return Err(NodusError::InvalidPda.into());
        }

        if user_state_account.owner != program_id {
            Self::create_pda_account(
                signer,
                user_state_account,
                system_program_account,
                program_id,
                &[USER_STATE_SEED, signer.key.as_ref(), &[bump]],
                UserState::LEN,
            )?;
            let mut user = UserState::default();
            user.initialized = true;
            user.authority = *signer.key;
            user.current_cycle_number = current_cycle_number;
            let mut data = user_state_account.try_borrow_mut_data()?;
            user.pack(&mut data)?;
            return Ok(user);
        }

        let user = UserState::unpack(&user_state_account.try_borrow_data()?)?;
        if user.authority != *signer.key {
            return Err(NodusError::UserStateAuthorityMismatch.into());
        }
        Ok(user)
    }

    fn sync_user_cycle(user: &mut UserState, cycle_number: u64) {
        if user.current_cycle_number != cycle_number {
            user.current_cycle_number = cycle_number;
            user.action_count_this_cycle = 0;
            user.last_action_slot = 0;
            user.shield_used = false;
            user.sabotage_used_count = 0;
            user.anchor_used = false;
            user.curse_used = false;
        }
    }

    fn enforce_cooldown(user: &UserState, slot: u64) -> ProgramResult {
        let cooldown = compute_cooldown_slots(user.action_count_this_cycle);
        if user.last_action_slot != 0 && slot < user.last_action_slot.saturating_add(cooldown) {
            return Err(NodusError::CooldownActive.into());
        }
        Ok(())
    }

    fn assert_cycle_can_accept_paid_action(vault: &VaultState, slot: u64, allow_empty_cycle: bool) -> Result<bool, ProgramError> {
        if !vault.initialized {
            return Err(NodusError::VaultNotInitialized.into());
        }
        if vault.terminal_lock {
            return Err(NodusError::TerminalLockActive.into());
        }
        if vault.leader == Pubkey::default() && !allow_empty_cycle {
            return Err(NodusError::CycleNotStarted.into());
        }
        // Si le timer est expiré et qu'il y a un leader, on doit auto-résoudre
        let needs_auto_resolve = vault.leader != Pubkey::default() 
            && remaining_slots(slot, vault.timer_start_slot, vault.timer_reset_slots) == 0;
        Ok(needs_auto_resolve)
    }

    fn load_vault(vault_account: &AccountInfo, program_id: &Pubkey) -> Result<VaultState, ProgramError> {
        let (expected_pda, _) = Pubkey::find_program_address(&[VAULT_SEED], program_id);
        if *vault_account.key != expected_pda {
            return Err(NodusError::InvalidPda.into());
        }
        if vault_account.owner != program_id {
            return Err(NodusError::VaultNotInitialized.into());
        }
        let vault = VaultState::unpack(&vault_account.try_borrow_data()?)?;
        if !vault.initialized {
            return Err(NodusError::VaultNotInitialized.into());
        }
        Ok(vault)
    }

    fn store_vault(vault_account: &AccountInfo<'_>, vault: VaultState) -> ProgramResult {
        let mut data = vault_account.try_borrow_mut_data()?;
        vault.pack(&mut data)
    }

    fn store_user_state(user_state_account: &AccountInfo<'_>, user: UserState) -> ProgramResult {
        let mut data = user_state_account.try_borrow_mut_data()?;
        user.pack(&mut data)
    }

    fn debit_vault_credit_target(vault_account: &AccountInfo<'_>, target: &AccountInfo<'_>, lamports: u64) -> ProgramResult {
        if lamports == 0 {
            return Ok(());
        }

        let next_vault_balance = checked_sub(vault_account.lamports(), lamports)?;
        let next_target_balance = checked_add(target.lamports(), lamports)?;
        **vault_account.try_borrow_mut_lamports()? = next_vault_balance;
        **target.try_borrow_mut_lamports()? = next_target_balance;
        Ok(())
    }

    fn auto_resolve_cycle(
        vault_account: &AccountInfo<'_>,
        protocol_fee_wallet: &AccountInfo<'_>,
        leader_account: &AccountInfo<'_>,
        mut vault: VaultState,
    ) -> Result<VaultState, ProgramError> {
        msg!("nodus: auto-resolving expired cycle");

        let expected_fee_wallet = Pubkey::from_str(PROTOCOL_FEE_WALLET).map_err(|_| ProgramError::InvalidArgument)?;
        if *protocol_fee_wallet.key != expected_fee_wallet {
            return Err(NodusError::InvalidProtocolFeeWallet.into());
        }
        if *leader_account.key != vault.leader {
            return Err(NodusError::InvalidLeaderAccount.into());
        }

        let rent_reserve = Rent::get()?.minimum_balance(VaultState::LEN);
        let gross_pot = vault_account.lamports().saturating_sub(rent_reserve);
        let protocol_fee = gross_pot.saturating_mul(vault.protocol_fee_bps as u64) / 10_000;
        let carry = gross_pot.saturating_mul(vault.curse_count as u64) / 100;
        let payout = gross_pot.saturating_sub(protocol_fee).saturating_sub(carry);

        Self::debit_vault_credit_target(vault_account, leader_account, payout)?;
        Self::debit_vault_credit_target(vault_account, protocol_fee_wallet, protocol_fee)?;

        vault.last_resolved_winner = vault.leader;
        vault.last_resolved_payout = payout;
        vault.last_cycle_pot = gross_pot;
        vault.last_cycle_pressure = vault.pressure_count;
        vault.carry_over_lamports = carry;
        vault.leader = Pubkey::default();
        vault.leader_since_slot = 0;
        vault.timer_start_slot = 0;
        vault.timer_reset_slots = 0;
        vault.pressure_count = 0;
        vault.terminal_lock = false;
        vault.shield_expires_slot = 0;
        vault.anchor_count = 0;
        vault.curse_count = 0;
        vault.active_snipe_wallet = Pubkey::default();
        vault.active_snipe_expiry_slot = 0;
        vault.active_snipe_escrow_lamports = 0;
        vault.cycle_number = checked_add(vault.cycle_number, 1)?;

        msg!("nodus: cycle auto-resolved, new cycle #{}", vault.cycle_number);
        Ok(vault)
    }
}

struct ActionContext<'a> {
    signer: &'a AccountInfo<'a>,
    vault_account: &'a AccountInfo<'a>,
    user_state_account: &'a AccountInfo<'a>,
    protocol_fee_wallet: &'a AccountInfo<'a>,
    leader_account: &'a AccountInfo<'a>,
    system_program_account: &'a AccountInfo<'a>,
}
