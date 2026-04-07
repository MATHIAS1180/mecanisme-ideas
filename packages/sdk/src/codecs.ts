import { PublicKey } from "@solana/web3.js";
import type { NodusVault, UserState } from "./types";

const PUBKEY_LENGTH = 32;
const U64_LENGTH = 8;

const readBool = (view: DataView, offset: number) => view.getUint8(offset) === 1;
const readU8 = (view: DataView, offset: number) => view.getUint8(offset);
const readU16 = (view: DataView, offset: number) => view.getUint16(offset, true);
const readU64 = (view: DataView, offset: number) => view.getBigUint64(offset, true);
const readPubkey = (buffer: Uint8Array, offset: number) =>
  new PublicKey(buffer.slice(offset, offset + PUBKEY_LENGTH)).toBase58();

export const NODUS_VAULT_SIZE = 198;
export const USER_STATE_SIZE = 1 + PUBKEY_LENGTH + U64_LENGTH * 2 + 1 + 1 + 1 + 1 + 1;

export function decodeVault(data: Uint8Array): NodusVault {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let offset = 0;

  const initialized = readBool(view, offset);
  offset += 1;
  const leader = readPubkey(data, offset);
  offset += PUBKEY_LENGTH;
  const leaderSinceSlot = readU64(view, offset);
  offset += U64_LENGTH;
  const timerStartSlot = readU64(view, offset);
  offset += U64_LENGTH;
  const timerResetSlots = readU64(view, offset);
  offset += U64_LENGTH;
  const pressureCount = readU64(view, offset);
  offset += U64_LENGTH;
  const cycleNumber = readU64(view, offset);
  offset += U64_LENGTH;
  const terminalLock = readBool(view, offset);
  offset += 1;
  const shieldExpiresSlot = readU64(view, offset);
  offset += U64_LENGTH;
  const anchorCount = readU8(view, offset);
  offset += 1;
  const curseCount = readU8(view, offset);
  offset += 1;
  const carryOverLamports = readU64(view, offset);
  offset += U64_LENGTH;
  const activeSnipeWallet = readPubkey(data, offset);
  offset += PUBKEY_LENGTH;
  const activeSnipeExpirySlot = readU64(view, offset);
  offset += U64_LENGTH;
  const protocolFeeBps = readU16(view, offset);
  offset += 2;
  const activeSnipeEscrowLamports = readU64(view, offset);
  offset += U64_LENGTH;
  const lastResolvedWinner = readPubkey(data, offset);
  offset += PUBKEY_LENGTH;
  const lastResolvedPayout = readU64(view, offset);
  offset += U64_LENGTH;
  const lastCyclePot = readU64(view, offset);
  offset += U64_LENGTH;
  const lastCyclePressure = readU64(view, offset);

  return {
    initialized,
    leader,
    leaderSinceSlot,
    timerStartSlot,
    timerResetSlots,
    pressureCount,
    cycleNumber,
    terminalLock,
    shieldExpiresSlot,
    anchorCount,
    curseCount,
    carryOverLamports,
    activeSnipeWallet,
    activeSnipeExpirySlot,
    protocolFeeBps,
    activeSnipeEscrowLamports,
    lastResolvedWinner,
    lastResolvedPayout,
    lastCyclePot,
    lastCyclePressure,
  };
}

export function decodeUserState(data: Uint8Array): UserState {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let offset = 0;
  const initialized = readBool(view, offset);
  offset += 1;
  const authority = readPubkey(data, offset);
  offset += PUBKEY_LENGTH;
  const currentCycleNumber = readU64(view, offset);
  offset += U64_LENGTH;
  const actionCountThisCycle = readU8(view, offset);
  offset += 1;
  const lastActionSlot = readU64(view, offset);
  offset += U64_LENGTH;
  const shieldUsed = readBool(view, offset);
  offset += 1;
  const sabotageUsedCount = readU8(view, offset);
  offset += 1;
  const anchorUsed = readBool(view, offset);
  offset += 1;
  const curseUsed = readBool(view, offset);

  return {
    initialized,
    authority,
    currentCycleNumber,
    actionCountThisCycle,
    lastActionSlot,
    shieldUsed,
    sabotageUsedCount,
    anchorUsed,
    curseUsed,
  };
}
