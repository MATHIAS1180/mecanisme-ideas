import { PublicKey } from "@solana/web3.js";
import { NODUS_SEEDS } from "./constants";

export function getVaultPda(programId: PublicKey) {
  return PublicKey.findProgramAddressSync([Buffer.from(NODUS_SEEDS.vault)], programId);
}

export function getUserStatePda(programId: PublicKey, authority: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(NODUS_SEEDS.userState), authority.toBuffer()],
    programId,
  );
}
