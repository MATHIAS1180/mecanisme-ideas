use solana_program::program_error::ProgramError;

use crate::error::NodusError;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum NodusInstruction {
    Initialize,
    Deposit,
    Shield,
    Sabotage,
    Anchor,
    ArmSnipe { expiry_slot: u64 },
    ReclaimSnipe,
    Curse,
    Blizzard,
    Resolve,
}

impl NodusInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (tag, rest) = input
            .split_first()
            .ok_or::<ProgramError>(NodusError::InvalidInstruction.into())?;

        Ok(match *tag {
            0 => Self::Initialize,
            1 => Self::Deposit,
            2 => Self::Shield,
            3 => Self::Sabotage,
            4 => Self::Anchor,
            5 => {
                if rest.len() < 8 {
                    return Err(NodusError::InvalidInstruction.into());
                }
                let expiry_slot = u64::from_le_bytes(rest[..8].try_into().map_err(|_| NodusError::InvalidInstruction)?);
                Self::ArmSnipe { expiry_slot }
            }
            6 => Self::ReclaimSnipe,
            7 => Self::Curse,
            8 => Self::Blizzard,
            9 => Self::Resolve,
            _ => return Err(NodusError::InvalidInstruction.into()),
        })
    }
}
