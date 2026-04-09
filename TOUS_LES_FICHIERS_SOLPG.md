# 📁 Tous les Fichiers pour Solana Playground

Copie ces fichiers EXACTEMENT comme indiqué:

---

## 1. `src/lib.rs`

```rust
pub mod entrypoint;
pub mod error;
pub mod instruction;
pub mod processor;
pub mod state;
pub mod utils;
```

---

## 2. `src/entrypoint.rs`

```rust
use solana_program::{account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, pubkey::Pubkey};

use crate::processor::Processor;

entrypoint!(process_instruction);

fn process_instruction<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    instruction_data: &[u8],
) -> ProgramResult {
    Processor::process(program_id, accounts, instruction_data)
}
```

---

## 3. `src/error.rs`

```rust
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
    TimerExpired = 6029,
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
```

---

## 4. `src/instruction.rs`

Voir le fichier: `programs/nodus/src/instruction.rs`

---

## 5. `src/utils.rs`

Voir le fichier: `programs/nodus/src/utils.rs`

---

## 6. `src/state.rs`

Voir le fichier: `programs/nodus/src/state.rs`

---

## 7. `src/processor.rs`

Voir le fichier: `programs/nodus/src/processor.rs` (AVEC LE FIX - pas d'auto-resolve)

---

## 8. `Cargo.toml`

Voir le fichier: `programs/nodus/Cargo.toml`

---

## ⚠️ IMPORTANT

Le fichier `processor.rs` doit contenir le FIX:
- PAS d'appel à `auto_resolve_cycle` dans les actions payantes
- `assert_cycle_can_accept_paid_action` retourne `TimerExpired` si le timer est expiré

Une fois tous les fichiers copiés:
1. Build
2. Deploy
3. Copier le nouveau Program ID
4. Mettre à jour Vercel et Railway avec le nouveau Program ID
