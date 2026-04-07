export type NodusVault = {
  initialized: boolean;
  leader: string;
  leaderSinceSlot: bigint;
  timerStartSlot: bigint;
  timerResetSlots: bigint;
  pressureCount: bigint;
  cycleNumber: bigint;
  terminalLock: boolean;
  shieldExpiresSlot: bigint;
  anchorCount: number;
  curseCount: number;
  carryOverLamports: bigint;
  activeSnipeWallet: string;
  activeSnipeExpirySlot: bigint;
  protocolFeeBps: number;
  activeSnipeEscrowLamports: bigint;
  lastResolvedWinner: string;
  lastResolvedPayout: bigint;
  lastCyclePot: bigint;
  lastCyclePressure: bigint;
};

export type UserState = {
  initialized: boolean;
  authority: string;
  currentCycleNumber: bigint;
  actionCountThisCycle: number;
  lastActionSlot: bigint;
  shieldUsed: boolean;
  sabotageUsedCount: number;
  anchorUsed: boolean;
  curseUsed: boolean;
};

export type CycleSnapshot = {
  cycle: number;
  potSol: string;
  winner: string;
  payoutSol: string;
  pressure: number;
  status: "resolved" | "active";
};

export type ActionKind =
  | "deposit"
  | "shield"
  | "sabotage"
  | "anchor"
  | "armSnipe"
  | "reclaimSnipe"
  | "curse"
  | "blizzard"
  | "resolve";
