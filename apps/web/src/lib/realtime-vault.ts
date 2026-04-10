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
  private minFetchInterval = 2000; // Minimum 2s entre fetches manuels
  private isSubscribed = false;

  constructor(connection: Connection, vaultPda: PublicKey) {
    this.connection = connection;
    this.vaultPda = vaultPda;
  }

  /**
   * Subscribe to vault changes in real-time via WebSocket
   * STRATÉGIE: WebSocket ULTRA-RAPIDE avec "processed" commitment
   * Target: 100ms latency
   */
  async subscribe() {
    if (this.subscriptionId !== null) {
      console.warn("Already subscribed to vault changes");
      return;
    }

    try {
      // Initial fetch UNIQUE (pas de retry pour économiser RPC)
      console.log("⚡ Fetching initial vault state (ONE TIME)...");
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
      // "processed" = ULTRA-RAPIDE (~100ms) mais peut être rollback
      console.log("📡 Subscribing to WebSocket updates (processed = ULTRA-FAST 100ms)...");
      this.subscriptionId = this.connection.onAccountChange(
        this.vaultPda,
        (accountInfo) => {
          try {
            if (accountInfo.data) {
              const vault = decodeVault(accountInfo.data);
              console.log("⚡ WebSocket update (100ms):", {
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

      console.log("⚡ WebSocket subscribed (processed, ~100ms latency, NO POLLING)");
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
   * Manual refresh - THROTTLED pour éviter rate limits
   * Utilisé UNIQUEMENT en cas d'urgence (WebSocket déconnecté ou cycle bloqué)
   */
  async refresh(force = false) {
    // Throttle: minimum 2s entre refreshes (sauf si force=true)
    const now = Date.now();
    if (!force && now - this.lastFetchTime < this.minFetchInterval) {
      console.log("⏸️ Refresh throttled (too soon), relying on WebSocket");
      return;
    }

    // Si WebSocket fonctionne ET pas forcé, pas besoin de refresh manuel
    if (!force && this.isSubscribed && this.lastVault) {
      console.log("✅ WebSocket active, skipping manual refresh");
      return;
    }

    try {
      console.log(force ? "🔄 FORCE refresh (cycle bloqué)" : "🔄 Manual refresh (WebSocket fallback)");
      this.lastFetchTime = now;
      
      const account = await this.connection.getAccountInfo(this.vaultPda, "processed");
      if (account?.data) {
        const vault = decodeVault(account.data);
        console.log("✅ Refresh complete:", {
          cycle: vault.cycleNumber.toString(),
          leader: vault.leader,
        });
        this.queueUpdate(vault);
      }
    } catch (error: any) {
      if (error?.message?.includes("429") || error?.message?.includes("rate limit")) {
        console.warn("⚠️ Rate limit hit - WebSocket will handle updates");
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
