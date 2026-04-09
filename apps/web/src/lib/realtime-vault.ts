"use client";

import { Connection, PublicKey } from "@solana/web3.js";
import { decodeVault, type NodusVault } from "@nodus/sdk";

export class RealtimeVault {
  private connection: Connection;
  private vaultPda: PublicKey;
  private subscriptionId: number | null = null;
  private listeners: Set<(vault: NodusVault | null) => void> = new Set();
  private lastVault: NodusVault | null = null;
  private updateQueue: NodusVault[] = [];
  private rafId: number | null = null;
  private lastUpdateTime = 0;
  private retryCount = 0;
  private maxRetries = 3;
  private retryDelay = 1000; // Start with 1 second

  constructor(connection: Connection, vaultPda: PublicKey) {
    this.connection = connection;
    this.vaultPda = vaultPda;
  }

  /**
   * Subscribe to vault changes in real-time via WebSocket
   * Ultra-fast updates with "processed" commitment (<100ms latency)
   */
  async subscribe() {
    if (this.subscriptionId !== null) {
      console.warn("Already subscribed to vault changes");
      return;
    }

    try {
      // Initial fetch avec "processed" pour vitesse maximale
      console.log("⚡ Fetching initial vault state...");
      const account = await this.connection.getAccountInfo(this.vaultPda, "processed");
      if (account?.data) {
        const vault = decodeVault(account.data);
        console.log("✅ Initial vault loaded:", {
          cycle: vault.cycleNumber.toString(),
          leader: vault.leader,
          timerStart: vault.timerStartSlot.toString(),
        });
        this.lastVault = vault;
        this.notifyListeners(vault);
      } else {
        console.error("❌ Vault account not found!");
      }

      // Subscribe to changes via WebSocket avec "processed" commitment
      console.log("📡 Subscribing to WebSocket updates...");
      this.subscriptionId = this.connection.onAccountChange(
        this.vaultPda,
        (accountInfo) => {
          try {
            if (accountInfo.data) {
              const vault = decodeVault(accountInfo.data);
              console.log("📡 WebSocket update:", {
                cycle: vault.cycleNumber.toString(),
                leader: vault.leader,
                timerStart: vault.timerStartSlot.toString(),
              });
              this.queueUpdate(vault);
            }
          } catch (error) {
            console.error("Error decoding vault:", error);
          }
        },
        "processed" // ⚡ ULTRA-FAST: Updates en <100ms!
      );

      console.log("⚡ Subscribed to vault changes (WebSocket, processed commitment, <100ms latency)");
    } catch (error) {
      console.error("Error subscribing to vault:", error);
    }
  }

  /**
   * Queue update pour batch processing (évite les re-renders inutiles)
   */
  private queueUpdate(vault: NodusVault) {
    // Vérifier si c'est vraiment un changement significatif
    if (this.lastVault && this.isIdenticalVault(this.lastVault, vault)) {
      return; // Skip si aucun changement réel
    }

    this.updateQueue.push(vault);

    // Utiliser requestAnimationFrame pour batch les updates à 60 FPS max
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => this.processQueue());
    }
  }

  /**
   * Process queued updates en batch
   */
  private processQueue() {
    this.rafId = null;

    if (this.updateQueue.length === 0) return;

    // Prendre le dernier update (le plus récent)
    const latestVault = this.updateQueue[this.updateQueue.length - 1];
    this.updateQueue = [];

    // Throttle: max 1 update toutes les 16ms (60 FPS)
    const now = Date.now();
    if (now - this.lastUpdateTime < 16) {
      // Re-queue si trop rapide
      this.updateQueue.push(latestVault);
      this.rafId = requestAnimationFrame(() => this.processQueue());
      return;
    }

    this.lastUpdateTime = now;
    this.lastVault = latestVault;
    this.notifyListeners(latestVault);
  }

  /**
   * Vérifier si deux vaults sont identiques (évite les updates inutiles)
   */
  private isIdenticalVault(a: NodusVault, b: NodusVault): boolean {
    // Comparaison stricte de tous les champs critiques
    const identical = (
      a.cycleNumber === b.cycleNumber &&
      a.leader === b.leader &&
      a.timerStartSlot === b.timerStartSlot &&
      a.timerResetSlots === b.timerResetSlots &&
      a.pressureCount === b.pressureCount &&
      a.terminalLock === b.terminalLock &&
      a.curseCount === b.curseCount &&
      a.carryOverLamports === b.carryOverLamports &&
      a.lastResolvedWinner === b.lastResolvedWinner
    );
    
    if (!identical) {
      console.log("🔄 Vault changed:", {
        cycleChanged: a.cycleNumber !== b.cycleNumber,
        leaderChanged: a.leader !== b.leader,
        timerChanged: a.timerStartSlot !== b.timerStartSlot,
        pressureChanged: a.pressureCount !== b.pressureCount,
      });
    }
    
    return identical;
  }

  /**
   * Unsubscribe from vault changes
   */
  async unsubscribe() {
    if (this.subscriptionId !== null) {
      try {
        await this.connection.removeAccountChangeListener(this.subscriptionId);
        this.subscriptionId = null;
        
        // Cleanup RAF
        if (this.rafId) {
          cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }
        
        console.log("✅ Unsubscribed from vault changes");
      } catch (error) {
        console.error("Error unsubscribing:", error);
      }
    }
  }

  /**
   * Add a listener for vault changes
   */
  addListener(callback: (vault: NodusVault | null) => void) {
    this.listeners.add(callback);
  }

  /**
   * Remove a listener
   */
  removeListener(callback: (vault: NodusVault | null) => void) {
    this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of a vault change
   */
  private notifyListeners(vault: NodusVault | null) {
    this.listeners.forEach((callback) => callback(vault));
  }

  /**
   * Manual refresh (fallback) - utilise aussi "processed" pour vitesse
   * Avec retry logic et backoff exponentiel pour gérer rate limits
   */
  async refresh() {
    try {
      console.log("🔄 Manual refresh triggered");
      const account = await this.connection.getAccountInfo(this.vaultPda, "processed");
      if (account?.data) {
        const vault = decodeVault(account.data);
        console.log("✅ Refresh complete:", {
          cycle: vault.cycleNumber.toString(),
          leader: vault.leader,
        });
        this.queueUpdate(vault);
        this.retryCount = 0; // Reset retry count on success
        this.retryDelay = 1000; // Reset delay
      } else {
        console.error("❌ Vault account not found during refresh!");
      }
    } catch (error: any) {
      // Détection rate limit 429
      if (error?.message?.includes("429") || error?.message?.includes("rate limit")) {
        console.warn(`⚠️ Rate limit hit (429), retry ${this.retryCount + 1}/${this.maxRetries}`);
        
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          // Backoff exponentiel: 1s, 2s, 4s
          const delay = this.retryDelay * Math.pow(2, this.retryCount - 1);
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          
          setTimeout(() => {
            this.refresh();
          }, delay);
        } else {
          console.error("❌ Max retries reached, giving up");
          this.retryCount = 0;
          this.retryDelay = 1000;
        }
      } else {
        console.error("Error refreshing vault:", error);
      }
    }
  }

  /**
   * Optimistic update - applique un changement immédiatement avant confirmation
   * Utile pour feedback instantané après une action utilisateur
   */
  applyOptimisticUpdate(updater: (vault: NodusVault) => Partial<NodusVault>) {
    if (!this.lastVault) return;

    const optimisticVault = {
      ...this.lastVault,
      ...updater(this.lastVault),
    };

    this.notifyListeners(optimisticVault);
  }
}
