use solana_program::{
    account_info::AccountInfo,
    clock::Clock,
    entrypoint::ProgramResult,
    program::invoke,
    system_instruction,
    sysvar::Sysvar,
};

use crate::error::NodusError;

pub const ENTRY_LAMPORTS: u64 = 10_000_000;
pub const ANCHOR_LAMPORTS: u64 = ENTRY_LAMPORTS * 2;
pub const MAX_RESET_SLOTS: u64 = 450;
pub const MIN_RESET_SLOTS: u64 = 38;
pub const RESET_DECAY_SLOTS: u64 = 12;
pub const TERMINAL_LOCK_PRESSURE: u64 = 40;
pub const SHIELD_DURATION_SLOTS: u64 = 30;
pub const USER_COOLDOWN_BASE_SLOTS: u64 = 3;
pub const MAX_CURSES: u8 = 5;
pub const MAX_ANCHORS_PER_CYCLE: u8 = 2;
pub const MAX_SABOTAGE_PER_WALLET: u8 = 2;

pub const VAULT_SEED: &[u8] = b"nodus_vault";
pub const USER_STATE_SEED: &[u8] = b"user_state";
pub const PROTOCOL_FEE_WALLET: &str = "FC2km6B1ub8fBf4FdLFs1hbJjmLx6EJbdAzN9Ajnb8nt";

pub fn checked_add(lhs: u64, rhs: u64) -> Result<u64, solana_program::program_error::ProgramError> {
    lhs.checked_add(rhs).ok_or_else(|| NodusError::ArithmeticOverflow.into())
}

pub fn checked_sub(lhs: u64, rhs: u64) -> Result<u64, solana_program::program_error::ProgramError> {
    lhs.checked_sub(rhs).ok_or_else(|| NodusError::ArithmeticOverflow.into())
}

pub fn compute_reset_slots(pressure: u64) -> u64 {
    if pressure <= 1 {
        return MAX_RESET_SLOTS;
    }

    let decay = RESET_DECAY_SLOTS.saturating_mul(pressure.saturating_sub(1));
    MAX_RESET_SLOTS.saturating_sub(decay).max(MIN_RESET_SLOTS)
}

pub fn remaining_slots(now_slot: u64, timer_start_slot: u64, timer_reset_slots: u64) -> u64 {
    let elapsed = now_slot.saturating_sub(timer_start_slot);
    timer_reset_slots.saturating_sub(elapsed)
}

pub fn compute_cooldown_slots(action_count: u8) -> u64 {
    let n = action_count.saturating_sub(1) as u64;
    match n {
        0 => 0,
        1 => USER_COOLDOWN_BASE_SLOTS,
        2 => 8,
        3 => 15,
        4 => 24,
        5 => 36,
        6 => 49,
        _ => 64,
    }
}

pub fn transfer_lamports<'a>(
    from: &AccountInfo<'a>,
    to: &AccountInfo<'a>,
    system_program: &AccountInfo<'a>,
    lamports: u64,
) -> ProgramResult {
    invoke(
        &system_instruction::transfer(from.key, to.key, lamports),
        &[from.clone(), to.clone(), system_program.clone()],
    )
}

pub fn current_slot() -> Result<u64, solana_program::program_error::ProgramError> {
    Ok(Clock::get()?.slot)
}
