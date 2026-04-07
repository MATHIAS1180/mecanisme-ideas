"use client";

import { Keypair, PublicKey, SystemProgram, Transaction, type Connection } from "@solana/web3.js";

const SESSION_STORAGE_KEY = "nodus.session.secret";

function toBase64(secret: Uint8Array) {
  return Buffer.from(secret).toString("base64");
}

function fromBase64(value: string) {
  return Uint8Array.from(Buffer.from(value, "base64"));
}

export function loadSessionWallet() {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    return Keypair.fromSecretKey(fromBase64(raw));
  } catch {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function createSessionWallet() {
  const keypair = Keypair.generate();
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, toBase64(keypair.secretKey));
  }
  return keypair;
}

export function clearSessionWallet() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

export async function buildSweepTransaction({
  connection,
  sessionWallet,
  destination,
}: {
  connection: Connection;
  sessionWallet: Keypair;
  destination: PublicKey;
}) {
  const balance = await connection.getBalance(sessionWallet.publicKey);
  const { blockhash } = await connection.getLatestBlockhash();
  const feeLamports = 5_000;
  const transferable = Math.max(0, balance - feeLamports);
  if (transferable === 0) {
    return null;
  }

  const transaction = new Transaction({
    feePayer: sessionWallet.publicKey,
    recentBlockhash: blockhash,
  }).add(
    SystemProgram.transfer({
      fromPubkey: sessionWallet.publicKey,
      toPubkey: destination,
      lamports: transferable,
    }),
  );

  transaction.sign(sessionWallet);
  return transaction;
}
