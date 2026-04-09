export const NODUS_SEEDS = {
  vault: "nodus_vault",
  userState: "user_state",
} as const;

export const LAMPORTS_PER_SOL = 1_000_000_000;
export const ENTRY_LAMPORTS = 10_000_000;
export const ANCHOR_LAMPORTS = ENTRY_LAMPORTS * 2;
export const PROTOCOL_FEE_BPS = 200;
export const MAX_CURSES = 5;
export const MAX_TOTAL_ANCHORS = 2;
export const MAX_SABOTAGE_PER_WALLET = 2;
export const SHIELD_DURATION_SLOTS = 30;
export const TERMINAL_LOCK_PRESSURE = 40;
export const MIN_RESET_SLOTS = 20;
export const MAX_RESET_SLOTS = 100;
export const RESET_DECAY_SLOTS = 3;
export const DEFAULT_RPC_URL = "https://api.devnet.solana.com";
export const FEE_WALLET = "FC2km6B1ub8fBf4FdLFs1hbJjmLx6EJbdAzN9Ajnb8nt";
