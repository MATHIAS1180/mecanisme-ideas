"use client";

import {
  ANCHOR_LAMPORTS,
  DEFAULT_RPC_URL,
  ENTRY_LAMPORTS,
  FEE_WALLET,
  NodusInstruction,
  decodeVault,
  encodeInstruction,
  getUserStatePda,
  getVaultPda,
} from "@nodus/sdk";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  type SendOptions,
} from "@solana/web3.js";

export function getRpcUrl() {
  return process.env.NEXT_PUBLIC_SOLANA_RPC_URL || DEFAULT_RPC_URL;
}

export function getProgramId() {
  const raw = process.env.NEXT_PUBLIC_NODUS_PROGRAM_ID;
  if (!raw) return null;
  try {
    return new PublicKey(raw);
  } catch {
    return null;
  }
}

export async function fetchVault(connection: Connection, programId: PublicKey) {
  const [vaultPda] = getVaultPda(programId);
  const account = await connection.getAccountInfo(vaultPda);
  if (!account?.data) return null;
  return decodeVault(account.data);
}

export function getNodusAccounts(programId: PublicKey, signer: PublicKey) {
  const [vault] = getVaultPda(programId);
  const [userState] = getUserStatePda(programId, signer);
  return { vault, userState };
}

export function buildInitializeInstruction(programId: PublicKey, payer: PublicKey) {
  const [vault] = getVaultPda(programId);
  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: vault, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: encodeInstruction(NodusInstruction.Initialize),
  });
}

export function buildActionInstruction({
  action,
  programId,
  signer,
  leader,
  snipeExpirySlot,
}: {
  action: keyof typeof NodusInstruction;
  programId: PublicKey;
  signer: PublicKey;
  leader?: PublicKey;
  snipeExpirySlot?: bigint;
}) {
  const { vault, userState } = getNodusAccounts(programId, signer);
  const keys = [
    { pubkey: signer, isSigner: true, isWritable: true },
    { pubkey: vault, isSigner: false, isWritable: true },
    { pubkey: userState, isSigner: false, isWritable: true },
    { pubkey: new PublicKey(FEE_WALLET), isSigner: false, isWritable: true },
    { pubkey: leader || signer, isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];

  const tag = NodusInstruction[action];
  const data = action === "ArmSnipe" ? encodeInstruction(tag, snipeExpirySlot) : encodeInstruction(tag);

  return new TransactionInstruction({ programId, keys, data });
}

export async function buildFundSessionTransaction({
  connection,
  owner,
  sessionWallet,
  lamports,
}: {
  connection: Connection;
  owner: PublicKey;
  sessionWallet: Keypair;
  lamports: number;
}) {
  const { blockhash } = await connection.getLatestBlockhash();
  return new Transaction({ feePayer: owner, recentBlockhash: blockhash }).add(
    SystemProgram.transfer({
      fromPubkey: owner,
      toPubkey: sessionWallet.publicKey,
      lamports,
    }),
  );
}

export async function signAndSendWithSession({
  connection,
  sessionWallet,
  instruction,
  options,
}: {
  connection: Connection;
  sessionWallet: Keypair;
  instruction: TransactionInstruction;
  options?: SendOptions;
}) {
  const { blockhash } = await connection.getLatestBlockhash();
  const transaction = new Transaction({
    feePayer: sessionWallet.publicKey,
    recentBlockhash: blockhash,
  }).add(instruction);
  transaction.sign(sessionWallet);
  return connection.sendRawTransaction(transaction.serialize(), options);
}

export const ACTION_COSTS = {
  Deposit: ENTRY_LAMPORTS,
  Shield: ENTRY_LAMPORTS,
  Sabotage: ENTRY_LAMPORTS,
  Anchor: ANCHOR_LAMPORTS,
  ArmSnipe: ENTRY_LAMPORTS,
  Curse: ENTRY_LAMPORTS,
  Blizzard: ENTRY_LAMPORTS,
};
