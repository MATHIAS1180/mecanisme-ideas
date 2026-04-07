export const NodusInstruction = {
  Initialize: 0,
  Deposit: 1,
  Shield: 2,
  Sabotage: 3,
  Anchor: 4,
  ArmSnipe: 5,
  ReclaimSnipe: 6,
  Curse: 7,
  Blizzard: 8,
  Resolve: 9,
} as const;

export function encodeInstruction(tag: number, value?: bigint) {
  const buffer = Buffer.alloc(value === undefined ? 1 : 9);
  buffer.writeUInt8(tag, 0);
  if (value !== undefined) {
    buffer.writeBigUInt64LE(value, 1);
  }
  return buffer;
}
