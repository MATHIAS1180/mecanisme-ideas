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
  private retryDelay = 1000;
  private lastFetchTime = 0;
  private minFetchInterval = 100; // 100ms entre fetches pour ultra-rapidité
  private isSubscribed = false;
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor(connection: Connection, vaultPda: PublicKey) {
    this.connection = connection;
    this.vaultPda = vaultPda;
  }

  /**
   * Subscribe to vault changes in real-time via WebSocket + AGGRESSIVE POLLING
   * STRATÉGIE: WebSocket + Polling 100ms pour latence ULTRA-RAPIDE garantie
   * Target: 100ms latency GARANTI
   */
  async subscribe() {
    if (this.subscriptionId !== null) {
      console.warn("Already subscribed to vault changes");
      return;
    }

    try {
      // Initial fetch RAPIDE
      console.log("⚡ Fetching initial vault state...");
      const account = await this.connection.getAccountInfo(this.vaultPda, "processed");
      if (account?.data) {
        const vault = decodeVault(account.data);
        console.log("✅ Initial vault loaded:", {
          cycle: vault.cycleNumber.toString(),
          leader: vault.leader,
        });
        this.lastVault = vault;
        this.lastFetchTime = Date.now();
        this.notifyListeners(vault);
      } else {
        console.error("❌ Vault account not found!");
      }

      // Subscribe to changes via WebSocket avec "processed" commitment
      console.log("📡 Subscribing to WebSocket updates (processed = ULTRA-FAST)...");
      this.subscriptionId = this.connection.onAccountChange(
        this.vaultPda,
        (accountInfo) => {
          try {
            if (accountInfo.data) {
              const vault = decodeVault(accountInfo.data);
              console.log("⚡ WebSocket update:", {
                cycle: vault.cycleNumber.toString(),
                leader: vault.leader,
                pressure: vault.pressureCount.toString(),
              });
              this.queueUpdate(vault);
              this.isSubscribed = true;
            }
          } catch (error) {
            console.error("Error decoding vault:", error);
          }
        },
        "processed" // ULTRA-RAPIDE: ~100ms latency
      );

      // AGGRESSIVE POLLING: 100ms pour garantir latence ultra-rapide
      console.log("🔥 Starting AGGRESSIVE polling (100ms) for guaranteed low latency...");
      this.pollingInterval = setInterval(async () => {
        try {
          const now = Date.now();
          if (now - this.lastFetchTime < 100) return; // Throttle à 100ms
          
          this.lastFetchTime = now;
          const account = await this.connection.getAccountInfo(this.vaultPda, "processed");
          if (account?.data) {
            const vault = decodeVault(account.data);
            this.queueUpdate(vault);
          }
        } catch (error: any) {
          // Ignorer les erreurs de rate limit silencieusement
          if (!error?.message?.includes("429") && !error?.message?.includes("rate limit")) {
            console.error("Polling error:", error);
          }
        }
      }, 100); // Poll toutes les 100ms

      console.log("⚡ ULTRA-FAST mode activated: WebSocket + 100ms polling");
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
   * OPTIMISÉ: Pas de throttle, updates instantanés!
   */
  private processQueue() {
    this.rafId = null;

    if (this.updateQueue.length === 0) return;

    // Prendre le dernier update (le plus récent)
    const latestVault = this.updateQueue[this.updateQueue.length - 1];
    this.updateQueue = [];

    // PAS DE THROTTLE - Updates instantanés pour 100ms latency
    this.lastUpdateTime = Date.now();
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
    // Stop polling
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log("✅ Stopped aggressive polling");
    }

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
   * Manual refresh - DÉSACTIVÉ car polling agressif actif
   */
  async refresh(force = false) {
    // Le polling agressif gère déjà les updates, pas besoin de refresh manuel
    if (!force) {
      console.log("✅ Aggressive polling active, no manual refresh needed");
      return;
    }

    try {
      console.log("🔄 FORCE refresh");
      const account = await this.connection.getAccountInfo(this.vaultPda, "processed");
      if (account?.data) {
        const vault = decodeVault(account.data);
        this.queueUpdate(vault);
      }
    } catch (error: any) {
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
