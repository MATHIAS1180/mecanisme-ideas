use solana_program::program_error::ProgramError;

#[repr(u32)]
pub enum NodusError {
    InvalidInstruction = 6000,
    InvalidPda = 6001,
    VaultAlreadyInitialized = 6002,
    VaultNotInitialized = 6003,
    UserStateAuthorityMismatch = 6004,
    ShieldActive = 6005,
    CooldownActive = 6006,
    TerminalLockActive = 6007,
    TimerNotExpired = 6008,
    ResolveRequired = 6009,
    NotLeader = 6010,
    LeaderOnlyAction = 6011,
    NonLeaderOnlyAction = 6012,
    ShieldAlreadyUsed = 6013,
    AnchorAlreadyUsed = 6014,
    AnchorLimitReached = 6015,
    CurseAlreadyUsed = 6016,
    CurseLimitReached = 6017,
    SabotageLimitReached = 6018,
    SnipeAlreadyActive = 6019,
    SnipeNotActive = 6020,
    SnipeNotExpired = 6021,
    SnipeStillActive = 6022,
    InvalidProtocolFeeWallet = 6023,
    NoLeader = 6024,
    ArithmeticOverflow = 6025,
    InvalidLeaderAccount = 6026,
    InvalidExpiry = 6027,
    CycleNotStarted = 6028,
}

impl From<NodusError> for ProgramError {
    fn from(value: NodusError) -> Self {
        ProgramError::Custom(value as u32)
    }
}
