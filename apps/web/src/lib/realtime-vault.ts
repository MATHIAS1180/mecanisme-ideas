"use client";

import { Connection, PublicKey } from "@solana/web3.js";
import { decodeVault, type NodusVault } from "@nodus/sdk";

export class RealtimeVault {
  private connection: Connection;
  private vaultPda: PublicKey;
  private subscriptionId: number | null = null;
  private listeners: Set<(vault: NodusVault | null) => void> = new Set();

  constructor(connection: Connection, vaultPda: PublicKey) {
    this.connection = connection;
    this.vaultPda = vaultPda;
  }

  /**
   * Subscribe to vault changes in real-time via WebSocket
   * No RPC spam! Updates only when the account actually changes.
   */
  async subscribe() {
    if (this.subscriptionId !== null) {
      console.warn("Already subscribed to vault changes");
      return;
    }

    try {
      // Initial fetch
      const account = await this.connection.getAccountInfo(this.vaultPda);
      if (account?.data) {
        const vault = decodeVault(account.data);
        this.notifyListeners(vault);
      }

      // Subscribe to changes via WebSocket
      this.subscriptionId = this.connection.onAccountChange(
        this.vaultPda,
        (accountInfo) => {
          try {
            if (accountInfo.data) {
              const vault = decodeVault(accountInfo.data);
              this.notifyListeners(vault);
            }
          } catch (error) {
            console.error("Error decoding vault:", error);
          }
        },
        "confirmed" // Use "confirmed" for faster updates, "finalized" for more security
      );

      console.log("✅ Subscribed to vault changes (WebSocket)");
    } catch (error) {
      console.error("Error subscribing to vault:", error);
    }
  }

  /**
   * Unsubscribe from vault changes
   */
  async unsubscribe() {
    if (this.subscriptionId !== null) {
      try {
        await this.connection.removeAccountChangeListener(this.subscriptionId);
        this.subscriptionId = null;
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
   * Manual refresh (fallback)
   */
  async refresh() {
    try {
      const account = await this.connection.getAccountInfo(this.vaultPda);
      if (account?.data) {
        const vault = decodeVault(account.data);
        this.notifyListeners(vault);
      }
    } catch (error) {
      console.error("Error refreshing vault:", error);
    }
  }
}
