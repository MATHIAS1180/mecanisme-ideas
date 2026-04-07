use solana_program::{program_error::ProgramError, pubkey::Pubkey};

use crate::error::NodusError;

pub const PUBKEY_BYTES: usize = 32;
pub const U64_BYTES: usize = 8;
pub const U16_BYTES: usize = 2;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct VaultState {
    pub initialized: bool,
    pub leader: Pubkey,
    pub leader_since_slot: u64,
    pub timer_start_slot: u64,
    pub timer_reset_slots: u64,
    pub pressure_count: u64,
    pub cycle_number: u64,
    pub terminal_lock: bool,
    pub shield_expires_slot: u64,
    pub anchor_count: u8,
    pub curse_count: u8,
    pub carry_over_lamports: u64,
    pub active_snipe_wallet: Pubkey,
    pub active_snipe_expiry_slot: u64,
    pub protocol_fee_bps: u16,
    pub active_snipe_escrow_lamports: u64,
    pub last_resolved_winner: Pubkey,
    pub last_resolved_payout: u64,
    pub last_cycle_pot: u64,
    pub last_cycle_pressure: u64,
}

impl Default for VaultState {
    fn default() -> Self {
        Self {
            initialized: false,
            leader: Pubkey::default(),
            leader_since_slot: 0,
            timer_start_slot: 0,
            timer_reset_slots: 0,
            pressure_count: 0,
            cycle_number: 1,
            terminal_lock: false,
            shield_expires_slot: 0,
            anchor_count: 0,
            curse_count: 0,
            carry_over_lamports: 0,
            active_snipe_wallet: Pubkey::default(),
            active_snipe_expiry_slot: 0,
            protocol_fee_bps: 200,
            active_snipe_escrow_lamports: 0,
            last_resolved_winner: Pubkey::default(),
            last_resolved_payout: 0,
            last_cycle_pot: 0,
            last_cycle_pressure: 0,
        }
    }
}

impl VaultState {
    pub const LEN: usize = 198;

    pub fn unpack(data: &[u8]) -> Result<Self, ProgramError> {
        if data.len() < Self::LEN {
            return Err(NodusError::VaultNotInitialized.into());
        }

        let mut offset = 0usize;
        let initialized = read_bool(data, &mut offset)?;
        let leader = read_pubkey(data, &mut offset)?;
        let leader_since_slot = read_u64(data, &mut offset)?;
        let timer_start_slot = read_u64(data, &mut offset)?;
        let timer_reset_slots = read_u64(data, &mut offset)?;
        let pressure_count = read_u64(data, &mut offset)?;
        let cycle_number = read_u64(data, &mut offset)?;
        let terminal_lock = read_bool(data, &mut offset)?;
        let shield_expires_slot = read_u64(data, &mut offset)?;
        let anchor_count = read_u8(data, &mut offset)?;
        let curse_count = read_u8(data, &mut offset)?;
        let carry_over_lamports = read_u64(data, &mut offset)?;
        let active_snipe_wallet = read_pubkey(data, &mut offset)?;
        let active_snipe_expiry_slot = read_u64(data, &mut offset)?;
        let protocol_fee_bps = read_u16(data, &mut offset)?;
        let active_snipe_escrow_lamports = read_u64(data, &mut offset)?;
        let last_resolved_winner = read_pubkey(data, &mut offset)?;
        let last_resolved_payout = read_u64(data, &mut offset)?;
        let last_cycle_pot = read_u64(data, &mut offset)?;
        let last_cycle_pressure = read_u64(data, &mut offset)?;

        Ok(Self {
            initialized,
            leader,
            leader_since_slot,
            timer_start_slot,
            timer_reset_slots,
            pressure_count,
            cycle_number,
            terminal_lock,
            shield_expires_slot,
            anchor_count,
            curse_count,
            carry_over_lamports,
            active_snipe_wallet,
            active_snipe_expiry_slot,
            protocol_fee_bps,
            active_snipe_escrow_lamports,
            last_resolved_winner,
            last_resolved_payout,
            last_cycle_pot,
            last_cycle_pressure,
        })
    }

    pub fn pack(self, target: &mut [u8]) -> Result<(), ProgramError> {
        if target.len() < Self::LEN {
            return Err(NodusError::VaultNotInitialized.into());
        }

        let mut offset = 0usize;
        write_bool(target, &mut offset, self.initialized)?;
        write_pubkey(target, &mut offset, &self.leader)?;
        write_u64(target, &mut offset, self.leader_since_slot)?;
        write_u64(target, &mut offset, self.timer_start_slot)?;
        write_u64(target, &mut offset, self.timer_reset_slots)?;
        write_u64(target, &mut offset, self.pressure_count)?;
        write_u64(target, &mut offset, self.cycle_number)?;
        write_bool(target, &mut offset, self.terminal_lock)?;
        write_u64(target, &mut offset, self.shield_expires_slot)?;
        write_u8(target, &mut offset, self.anchor_count)?;
        write_u8(target, &mut offset, self.curse_count)?;
        write_u64(target, &mut offset, self.carry_over_lamports)?;
        write_pubkey(target, &mut offset, &self.active_snipe_wallet)?;
        write_u64(target, &mut offset, self.active_snipe_expiry_slot)?;
        write_u16(target, &mut offset, self.protocol_fee_bps)?;
        write_u64(target, &mut offset, self.active_snipe_escrow_lamports)?;
        write_pubkey(target, &mut offset, &self.last_resolved_winner)?;
        write_u64(target, &mut offset, self.last_resolved_payout)?;
        write_u64(target, &mut offset, self.last_cycle_pot)?;
        write_u64(target, &mut offset, self.last_cycle_pressure)?;
        Ok(())
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct UserState {
    pub initialized: bool,
    pub authority: Pubkey,
    pub current_cycle_number: u64,
    pub action_count_this_cycle: u8,
    pub last_action_slot: u64,
    pub shield_used: bool,
    pub sabotage_used_count: u8,
    pub anchor_used: bool,
    pub curse_used: bool,
}

impl Default for UserState {
    fn default() -> Self {
        Self {
            initialized: false,
            authority: Pubkey::default(),
            current_cycle_number: 0,
            action_count_this_cycle: 0,
            last_action_slot: 0,
            shield_used: false,
            sabotage_used_count: 0,
            anchor_used: false,
            curse_used: false,
        }
    }
}

impl UserState {
    pub const LEN: usize = 1 + PUBKEY_BYTES + U64_BYTES + 1 + U64_BYTES + 1 + 1 + 1 + 1;

    pub fn unpack(data: &[u8]) -> Result<Self, ProgramError> {
        if data.len() < Self::LEN {
            return Err(NodusError::InvalidInstruction.into());
        }

        let mut offset = 0usize;
        let initialized = read_bool(data, &mut offset)?;
        let authority = read_pubkey(data, &mut offset)?;
        let current_cycle_number = read_u64(data, &mut offset)?;
        let action_count_this_cycle = read_u8(data, &mut offset)?;
        let last_action_slot = read_u64(data, &mut offset)?;
        let shield_used = read_bool(data, &mut offset)?;
        let sabotage_used_count = read_u8(data, &mut offset)?;
        let anchor_used = read_bool(data, &mut offset)?;
        let curse_used = read_bool(data, &mut offset)?;

        Ok(Self {
            initialized,
            authority,
            current_cycle_number,
            action_count_this_cycle,
            last_action_slot,
            shield_used,
            sabotage_used_count,
            anchor_used,
            curse_used,
        })
    }

    pub fn pack(self, target: &mut [u8]) -> Result<(), ProgramError> {
        if target.len() < Self::LEN {
            return Err(NodusError::InvalidInstruction.into());
        }

        let mut offset = 0usize;
        write_bool(target, &mut offset, self.initialized)?;
        write_pubkey(target, &mut offset, &self.authority)?;
        write_u64(target, &mut offset, self.current_cycle_number)?;
        write_u8(target, &mut offset, self.action_count_this_cycle)?;
        write_u64(target, &mut offset, self.last_action_slot)?;
        write_bool(target, &mut offset, self.shield_used)?;
        write_u8(target, &mut offset, self.sabotage_used_count)?;
        write_bool(target, &mut offset, self.anchor_used)?;
        write_bool(target, &mut offset, self.curse_used)?;
        Ok(())
    }
}

fn read_bool(data: &[u8], offset: &mut usize) -> Result<bool, ProgramError> {
    Ok(read_u8(data, offset)? == 1)
}

fn read_u8(data: &[u8], offset: &mut usize) -> Result<u8, ProgramError> {
    let value = *data.get(*offset).ok_or::<ProgramError>(NodusError::InvalidInstruction.into())?;
    *offset += 1;
    Ok(value)
}

fn read_u16(data: &[u8], offset: &mut usize) -> Result<u16, ProgramError> {
    let end = *offset + U16_BYTES;
    let bytes: [u8; 2] = data.get(*offset..end).ok_or::<ProgramError>(NodusError::InvalidInstruction.into())?.try_into().map_err(|_| NodusError::InvalidInstruction)?;
    *offset = end;
    Ok(u16::from_le_bytes(bytes))
}

fn read_u64(data: &[u8], offset: &mut usize) -> Result<u64, ProgramError> {
    let end = *offset + U64_BYTES;
    let bytes: [u8; 8] = data.get(*offset..end).ok_or::<ProgramError>(NodusError::InvalidInstruction.into())?.try_into().map_err(|_| NodusError::InvalidInstruction)?;
    *offset = end;
    Ok(u64::from_le_bytes(bytes))
}

fn read_pubkey(data: &[u8], offset: &mut usize) -> Result<Pubkey, ProgramError> {
    let end = *offset + PUBKEY_BYTES;
    let bytes: [u8; 32] = data.get(*offset..end).ok_or::<ProgramError>(NodusError::InvalidInstruction.into())?.try_into().map_err(|_| NodusError::InvalidInstruction)?;
    *offset = end;
    Ok(Pubkey::new_from_array(bytes))
}

fn write_bool(target: &mut [u8], offset: &mut usize, value: bool) -> Result<(), ProgramError> {
    write_u8(target, offset, if value { 1 } else { 0 })
}

fn write_u8(target: &mut [u8], offset: &mut usize, value: u8) -> Result<(), ProgramError> {
    let slot = target.get_mut(*offset).ok_or::<ProgramError>(NodusError::InvalidInstruction.into())?;
    *slot = value;
    *offset += 1;
    Ok(())
}

fn write_u16(target: &mut [u8], offset: &mut usize, value: u16) -> Result<(), ProgramError> {
    let end = *offset + U16_BYTES;
    let slot = target.get_mut(*offset..end).ok_or::<ProgramError>(NodusError::InvalidInstruction.into())?;
    slot.copy_from_slice(&value.to_le_bytes());
    *offset = end;
    Ok(())
}

fn write_u64(target: &mut [u8], offset: &mut usize, value: u64) -> Result<(), ProgramError> {
    let end = *offset + U64_BYTES;
    let slot = target.get_mut(*offset..end).ok_or::<ProgramError>(NodusError::InvalidInstruction.into())?;
    slot.copy_from_slice(&value.to_le_bytes());
    *offset = end;
    Ok(())
}

fn write_pubkey(target: &mut [u8], offset: &mut usize, value: &Pubkey) -> Result<(), ProgramError> {
    let end = *offset + PUBKEY_BYTES;
    let slot = target.get_mut(*offset..end).ok_or::<ProgramError>(NodusError::InvalidInstruction.into())?;
    slot.copy_from_slice(value.as_ref());
    *offset = end;
    Ok(())
}
