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
      const account = await this.connection.getAccountInfo(this.vaultPda, "processed");
      if (account?.data) {
        const vault = decodeVault(account.data);
        this.lastVault = vault;
        this.notifyListeners(vault);
      }

      // Subscribe to changes via WebSocket avec "processed" commitment
      // "processed" = ~50-100ms après confirmation on-chain (le plus rapide!)
      // "confirmed" = ~400ms (plus sûr mais plus lent)
      // "finalized" = ~13s (très sûr mais trop lent pour UX)
      this.subscriptionId = this.connection.onAccountChange(
        this.vaultPda,
        (accountInfo) => {
          try {
            if (accountInfo.data) {
              const vault = decodeVault(accountInfo.data);
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
    return (
      a.cycleNumber === b.cycleNumber &&
      a.leader === b.leader &&
      a.timerStartSlot === b.timerStartSlot &&
      a.pressureCount === b.pressureCount &&
      a.terminalLock === b.terminalLock &&
      a.curseCount === b.curseCount &&
      a.carryOverLamports === b.carryOverLamports
    );
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
   */
  async refresh() {
    try {
      const account = await this.connection.getAccountInfo(this.vaultPda, "processed");
      if (account?.data) {
        const vault = decodeVault(account.data);
        this.queueUpdate(vault);
      }
    } catch (error) {
      console.error("Error refreshing vault:", error);
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
