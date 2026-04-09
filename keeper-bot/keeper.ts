/**
 * NODUS KEEPER BOT
 * 
 * Service automatique qui résout les cycles expirés.
 * Tourne en continu, surveille le vault, et envoie des transactions Resolve.
 */

import "dotenv/config";
import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import bs58 from "bs58";

// Configuration
const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const PROGRAM_ID = process.env.NODUS_PROGRAM_ID || "By9yf8mRvJq3mXG2QE8nagNyZ5PCUJrfsikZUzk8otTo";
const KEEPER_PRIVATE_KEY = process.env.KEEPER_PRIVATE_KEY; // Base58 encoded
const CHECK_INTERVAL = 5000; // Check every 5 seconds

// Vault PDA
const VAULT_SEED = Buffer.from("vault");

// Decode vault from account data
// IMPORTANT: Order must match VaultState in state.rs!
function decodeVault(data: Buffer) {
  let offset = 0;
  
  // Read initialized (1 byte)
  const initialized = data.readUInt8(offset) === 1;
  offset += 1;
  
  // Read leader (32 bytes)
  const leader = new PublicKey(data.slice(offset, offset + 32)).toBase58();
  offset += 32;
  
  // Read leader_since_slot (8 bytes)
  const leaderSinceSlot = data.readBigUInt64LE(offset);
  offset += 8;
  
  // Read timer_start_slot (8 bytes)
  const timerStartSlot = data.readBigUInt64LE(offset);
  offset += 8;
  
  // Read timer_reset_slots (8 bytes)
  const timerResetSlots = data.readBigUInt64LE(offset);
  offset += 8;
  
  // Read pressure_count (8 bytes)
  const pressureCount = data.readBigUInt64LE(offset);
  offset += 8;
  
  // Read cycle_number (8 bytes)
  const cycleNumber = data.readBigUInt64LE(offset);
  offset += 8;
  
  // Read terminal_lock (1 byte)
  const terminalLock = data.readUInt8(offset) === 1;
  offset += 1;
  
  // Read shield_expires_slot (8 bytes)
  const shieldExpiresSlot = data.readBigUInt64LE(offset);
  offset += 8;
  
  // Read anchor_count (1 byte)
  const anchorCount = data.readUInt8(offset);
  offset += 1;
  
  // Read curse_count (1 byte)
  const curseCount = data.readUInt8(offset);
  offset += 1;
  
  // Read carry_over_lamports (8 bytes)
  const carryOverLamports = data.readBigUInt64LE(offset);
  offset += 8;
  
  // Read active_snipe_wallet (32 bytes)
  const activeSnipeWallet = new PublicKey(data.slice(offset, offset + 32)).toBase58();
  offset += 32;
  
  // Read active_snipe_expiry_slot (8 bytes)
  const activeSnipeExpirySlot = data.readBigUInt64LE(offset);
  offset += 8;
  
  // Read protocol_fee_bps (2 bytes)
  const protocolFeeBps = data.readUInt16LE(offset);
  offset += 2;
  
  // Read active_snipe_escrow_lamports (8 bytes)
  const activeSnipeEscrowLamports = data.readBigUInt64LE(offset);
  offset += 8;
  
  // Read last_resolved_winner (32 bytes)
  const lastResolvedWinner = new PublicKey(data.slice(offset, offset + 32)).toBase58();
  offset += 32;
  
  // Read last_resolved_payout (8 bytes)
  const lastResolvedPayout = data.readBigUInt64LE(offset);
  offset += 8;
  
  // Read last_cycle_pot (8 bytes)
  const lastCyclePot = data.readBigUInt64LE(offset);
  offset += 8;
  
  // Read last_cycle_pressure (8 bytes)
  const lastCyclePressure = data.readBigUInt64LE(offset);
  offset += 8;
  
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

class KeeperBot {
  private connection: Connection;
  private programId: PublicKey;
  private keeperWallet: Keypair;
  private vaultPda: PublicKey;
  private isRunning = false;

  constructor() {
    this.connection = new Connection(RPC_URL, "confirmed");
    this.programId = new PublicKey(PROGRAM_ID);
    
    // Load keeper wallet from env
    if (!KEEPER_PRIVATE_KEY) {
      throw new Error("KEEPER_PRIVATE_KEY not set in environment");
    }
    
    const secretKey = bs58.decode(KEEPER_PRIVATE_KEY);
    this.keeperWallet = Keypair.fromSecretKey(secretKey);
    
    // Derive vault PDA
    const [vaultPda] = PublicKey.findProgramAddressSync(
      [VAULT_SEED],
      this.programId
    );
    this.vaultPda = vaultPda;
    
    console.log("🤖 Keeper Bot initialized");
    console.log("📍 Vault PDA:", this.vaultPda.toBase58());
    console.log("👛 Keeper Wallet:", this.keeperWallet.publicKey.toBase58());
  }

  /**
   * Start the keeper bot
   */
  async start() {
    this.isRunning = true;
    console.log("🚀 Keeper Bot started");
    
    // Check keeper wallet balance
    const balance = await this.connection.getBalance(this.keeperWallet.publicKey);
    console.log(`💰 Keeper balance: ${balance / 1e9} SOL`);
    
    if (balance < 0.01 * 1e9) {
      console.warn("⚠️ Low balance! Fund keeper wallet:", this.keeperWallet.publicKey.toBase58());
    }
    
    // Start monitoring loop
    this.monitorLoop();
  }

  /**
   * Stop the keeper bot
   */
  stop() {
    this.isRunning = false;
    console.log("🛑 Keeper Bot stopped");
  }

  /**
   * Main monitoring loop
   */
  private async monitorLoop() {
    while (this.isRunning) {
      try {
        await this.checkAndResolve();
      } catch (error) {
        console.error("❌ Error in monitor loop:", error);
      }
      
      // Wait before next check
      await this.sleep(CHECK_INTERVAL);
    }
  }

  /**
   * Check if cycle needs resolving and resolve it
   */
  private async checkAndResolve() {
    try {
      // Fetch vault state
      const accountInfo = await this.connection.getAccountInfo(this.vaultPda, "confirmed");
      if (!accountInfo?.data) {
        console.log("⚠️ Vault not found");
        return;
      }

      const vault = decodeVault(accountInfo.data);
      
      // Check if there's an active cycle
      if (!vault.leader || vault.leader === "11111111111111111111111111111111") {
        console.log("ℹ️ No active cycle");
        return;
      }

      // Check if timer expired
      const currentSlot = await this.connection.getSlot("confirmed");
      const slotEnd = Number(vault.timerStartSlot) + Number(vault.timerResetSlots);
      const slotsLeft = Math.max(0, slotEnd - currentSlot);
      
      if (slotsLeft > 0) {
        const secondsLeft = Math.floor(slotsLeft * 0.45);
        console.log(`⏱️ Cycle #${vault.cycleNumber}: ${secondsLeft}s remaining`);
        return;
      }

      // Timer expired! Resolve the cycle
      console.log(`⚡ Cycle #${vault.cycleNumber} expired! Resolving...`);
      await this.resolveCycle(vault);
      
    } catch (error) {
      console.error("❌ Error checking cycle:", error);
    }
  }

  /**
   * Resolve an expired cycle by sending a Resolve instruction
   */
  private async resolveCycle(vault: any) {
    try {
      console.log(`⚡ Sending Resolve to settle expired cycle...`);
      
      // Parse leader from vault
      const currentLeader = new PublicKey(vault.leader);
      
      // Build Resolve transaction
      const transaction = this.buildResolveInstruction(currentLeader);
      transaction.feePayer = this.keeperWallet.publicKey;
      
      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash("finalized");
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;
      
      // Sign and send
      transaction.sign(this.keeperWallet);
      const signature = await this.connection.sendRawTransaction(
        transaction.serialize(),
        {
          skipPreflight: false,
          maxRetries: 3,
        }
      );
      
      console.log(`✅ Resolve sent! Signature: ${signature}`);
      console.log(`🔗 https://explorer.solana.com/tx/${signature}?cluster=devnet`);
      
      // Wait for confirmation
      await this.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, "confirmed");
      
      console.log(`🎉 Cycle #${vault.cycleNumber} resolved! Winner: ${currentLeader.toBase58().slice(0, 8)}...`);
      
    } catch (error: any) {
      console.error("❌ Error resolving cycle:", error.message || error);
      
      // Log specific errors
      if (error.message?.includes("insufficient")) {
        console.error("💰 Insufficient balance! Fund keeper wallet:", this.keeperWallet.publicKey.toBase58());
      }
    }
  }

  /**
   * Build Resolve instruction
   */
  private buildResolveInstruction(currentLeader: PublicKey) {
    const PROTOCOL_FEE_WALLET = new PublicKey("FC2km6B1ub8fBf4FdLFs1hbJjmLx6EJbdAzN9Ajnb8nt");
    const SYSTEM_PROGRAM = new PublicKey("11111111111111111111111111111111");
    
    // Derive user state PDA for keeper
    const USER_STATE_SEED = Buffer.from("user_state");
    const [userStatePda] = PublicKey.findProgramAddressSync(
      [USER_STATE_SEED, this.keeperWallet.publicKey.toBuffer()],
      this.programId
    );
    
    const keys = [
      { pubkey: this.keeperWallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: this.vaultPda, isSigner: false, isWritable: true },
      { pubkey: userStatePda, isSigner: false, isWritable: true },
      { pubkey: PROTOCOL_FEE_WALLET, isSigner: false, isWritable: true },
      { pubkey: currentLeader, isSigner: false, isWritable: true },
      { pubkey: SYSTEM_PROGRAM, isSigner: false, isWritable: false },
    ];
    
    // Resolve instruction discriminator (instruction #9)
    const data = Buffer.from([9]);
    
    return new Transaction().add({
      keys,
      programId: this.programId,
      data,
    });
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  console.log("🤖 Starting Nodus Keeper Bot...");
  
  const keeper = new KeeperBot();
  await keeper.start();
  
  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down...");
    keeper.stop();
    process.exit(0);
  });
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
}

export { KeeperBot };
