"use client";

import "./play.css";
import Link from "next/link";
import { startTransition, useEffect, useState, useRef, useCallback } from "react";
import { ACTION_COSTS, buildActionInstruction, buildFundSessionTransaction, buildInitializeInstruction, fetchVault, getProgramId, getNodusAccounts } from "../../lib/nodus-client";
import { buildSweepTransaction, clearSessionWallet, createSessionWallet, loadSessionWallet } from "../../lib/session-wallet";
import { formatCountdown, formatSolFromLamports, shortenAddress } from "../../lib/format";
import { DEFAULT_RPC_URL, FEE_WALLET, MIN_RESET_SLOTS, MAX_RESET_SLOTS, ENTRY_LAMPORTS, type NodusVault } from "@nodus/sdk";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { CryptoChart } from "../../components/crypto-chart";
import { WinnerNotification } from "../../components/winner-notification";
import { Toast } from "../../components/toast";
import { RealtimeVault } from "../../lib/realtime-vault";

const ACTION_BUTTONS = [
  ["Deposit", "Claim leadership and reset the countdown timer", "💰"],
  ["Shield", "Leader-only protection that blocks incoming deposits", "🛡️"],
  ["Sabotage", "Reduce remaining time without claiming leadership", "💣"],
  ["Anchor", "Leader-only double-entry reset for maximum time", "⚓"],
  ["ArmSnipe", "Escrow one entry and trap the next challenger", "🎯"],
  ["Curse", "Reduce winner share and increase carry-over pool", "👻"],
  ["Blizzard", "Increase pot and pressure without taking the lead", "❄️"],
] as const;

export default function PlayPage() {
  const { connection } = useConnection();
  const { connected, publicKey, sendTransaction } = useWallet();
  const [sessionWallet, setSessionWallet] = useState(() => loadSessionWallet());
  const [budget, setBudget] = useState("0.03");
  const [vault, setVault] = useState<NodusVault | null>(null);
  const [latestSignature, setLatestSignature] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(15);
  const [pot, setPot] = useState<string>("0.0000");
  const [sessionBalance, setSessionBalance] = useState<string>("0.0000");
  const [loading, setLoading] = useState(false);
  const [showWinnerNotification, setShowWinnerNotification] = useState(false);
  const [winnerData, setWinnerData] = useState<{ winner: string; payout: string } | null>(null);
  
  // Toast notification system
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | "info" | "warning">("info");
  
  const programId = getProgramId();
  const realtimeVaultRef = useRef<RealtimeVault | null>(null);

  // Helper to show toast notifications
  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
    setToastMessage(message);
    setToastType(type);
  };

  // WebSocket setup
  useEffect(() => {
    if (!programId) return;

    const { vault: vaultPda } = getNodusAccounts(programId, programId);
    const realtimeVault = new RealtimeVault(connection, vaultPda);
    realtimeVaultRef.current = realtimeVault;

    const handleVaultChange = (nextVault: NodusVault | null) => {
      if (!nextVault) return;

      const isNewCycle = vault && nextVault.cycleNumber !== vault.cycleNumber;
      
      if (isNewCycle && nextVault.lastResolvedWinner && nextVault.lastResolvedWinner !== "11111111111111111111111111111111") {
        setWinnerData({
          winner: nextVault.lastResolvedWinner,
          payout: formatSolFromLamports(Number(nextVault.lastResolvedPayout)),
        });
        setShowWinnerNotification(true);
      }
      
      setVault(nextVault);

      if (isNewCycle) {
        setLatestSignature(null);
      }
    };

    realtimeVault.addListener(handleVaultChange);
    realtimeVault.subscribe();

    return () => {
      realtimeVault.removeListener(handleVaultChange);
      realtimeVault.unsubscribe();
    };
  }, [programId, connection, vault]);

  // Timer update - OPTIMISÉ
  useEffect(() => {
    if (!vault || !vault.leader || vault.leader === "11111111111111111111111111111111") {
      setRemainingSeconds(0);
      return;
    }

    let isMounted = true;

    const updateTimer = async () => {
      if (!isMounted) return;
      
      try {
        const currentSlot = await connection.getSlot("processed");
        const slotEnd = Number(vault.timerStartSlot) + Number(vault.timerResetSlots);
        const slotsLeft = Math.max(0, slotEnd - currentSlot);
        const secondsLeft = Math.floor(slotsLeft * 0.45);
        
        if (isMounted) {
          setRemainingSeconds(secondsLeft);
        }
      } catch (error) {
        console.error("Error updating timer:", error);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000); // Update toutes les 1s
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [vault?.timerStartSlot, vault?.timerResetSlots, vault?.leader, connection]);

  // Fallback polling when timer = 0 - RÉDUIT pour économiser RPC
  useEffect(() => {
    if (remainingSeconds !== 0 || !realtimeVaultRef.current) return;

    const fallbackInterval = setInterval(() => {
      realtimeVaultRef.current?.refresh(true);
    }, 5000); // Réduit à 5s pour économiser RPC

    return () => clearInterval(fallbackInterval);
  }, [remainingSeconds]);

  // Fetch secondary data
  const fetchSecondaryData = useCallback(async () => {
    if (!programId) return;

    try {
      if (vault) {
        const rentReserve = 2_000_000;
        const carryOver = Number(vault.carryOverLamports);
        const estimatedBalance = rentReserve + carryOver + (Number(vault.pressureCount) * ENTRY_LAMPORTS);
        const actualPot = Math.max(0, estimatedBalance - rentReserve - carryOver);
        setPot(formatSolFromLamports(actualPot));
      }

      if (sessionWallet && !sessionBalance) {
        const bal = await connection.getBalance(sessionWallet.publicKey);
        setSessionBalance(formatSolFromLamports(bal));
      }
    } catch (error: any) {
      console.error("Error fetching secondary data:", error);
    }
  }, [programId, connection, sessionWallet, vault, sessionBalance]);

  useEffect(() => {
    fetchSecondaryData();
  }, [vault?.cycleNumber, fetchSecondaryData]);

  async function handleInitialize() {
    if (!connected || !publicKey || !sendTransaction || !programId) {
      showToast("Connect wallet to initialize protocol", "error");
      return;
    }

    setLoading(true);
    try {
      const instruction = buildInitializeInstruction(programId, publicKey);
      const transaction = await sendTransaction(new Transaction().add(instruction), connection);
      setLatestSignature(transaction);
      showToast("Protocol vault initialized successfully", "success");
    } catch (initializeError) {
      showToast(initializeError instanceof Error ? initializeError.message : "Initialize failed", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleFundSession() {
    if (!connected || !publicKey || !sendTransaction) {
      showToast("Connect wallet to fund session", "error");
      return;
    }

    setLoading(true);
    try {
      const wallet = sessionWallet ?? createSessionWallet();
      const lamports = Math.max(0.03, Number(budget || "0.03")) * 1_000_000_000;
      
      const { blockhash } = await connection.getLatestBlockhash("finalized");
      const transaction = await buildFundSessionTransaction({
        connection,
        owner: publicKey,
        sessionWallet: wallet,
        lamports: Math.round(lamports),
      });
      transaction.recentBlockhash = blockhash;
      
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        maxRetries: 2,
      });
      
      setSessionWallet(wallet);
      setLatestSignature(signature);
      showToast("Session wallet funded successfully", "success");
      
      setTimeout(async () => {
        const bal = await connection.getBalance(wallet.publicKey);
        setSessionBalance(formatSolFromLamports(bal));
      }, 1000);
      
    } catch (fundError) {
      showToast(fundError instanceof Error ? fundError.message : "Funding failed", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSweepSession() {
    if (!sessionWallet || !publicKey) {
      showToast("No active session wallet found", "error");
      return;
    }

    setLoading(true);
    try {
      const transaction = await buildSweepTransaction({
        connection,
        sessionWallet,
        destination: publicKey,
      });
      if (!transaction) {
        showToast("Session wallet is empty", "info");
        return;
      }
      const signature = await connection.sendRawTransaction(transaction.serialize());
      clearSessionWallet();
      setSessionWallet(null);
      setLatestSignature(signature);
      showToast("Session balance returned to main wallet", "success");
    } catch (sweepError) {
      showToast(sweepError instanceof Error ? sweepError.message : "Sweep failed", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action: keyof typeof ACTION_COSTS | "Resolve") {
    if (!programId || !sessionWallet) {
      showToast("Session wallet required for protocol actions", "error");
      return;
    }

    setLoading(true);
    
    // UPDATE OPTIMISTE INSTANTANÉ - Afficher les changements IMMÉDIATEMENT
    if (vault) {
      const currentPot = parseFloat(pot);
      const actionCost = action in ACTION_COSTS ? ACTION_COSTS[action as keyof typeof ACTION_COSTS] : 0;
      const newPotValue = currentPot + (actionCost / 1_000_000_000);
      
      // Mettre à jour le POT instantanément (optimiste)
      setPot(newPotValue.toFixed(4));
      
      // Mettre à jour le vault instantanément (optimiste)
      if (realtimeVaultRef.current) {
        const optimisticUpdates: Record<string, Partial<NodusVault>> = {
          Deposit: {
            leader: sessionWallet.publicKey.toBase58(),
            pressureCount: BigInt(Math.min(40, Number(vault.pressureCount) + 1)),
          },
          Shield: {
            terminalLock: true,
            pressureCount: BigInt(Math.min(40, Number(vault.pressureCount) + 1)),
          },
          Sabotage: {
            pressureCount: BigInt(Math.min(40, Number(vault.pressureCount) + 1)),
          },
          Curse: {
            curseCount: Math.min(5, vault.curseCount + 1),
            pressureCount: BigInt(Math.min(40, Number(vault.pressureCount) + 1)),
          },
          Blizzard: {
            pressureCount: BigInt(Math.min(40, Number(vault.pressureCount) + 1)),
          },
        };

        if (action in optimisticUpdates) {
          realtimeVaultRef.current.applyOptimisticUpdate(() => optimisticUpdates[action]);
        }
      }
      
      // Mettre à jour le balance instantanément (optimiste)
      const currentBalance = parseFloat(sessionBalance);
      const newBalance = currentBalance - (actionCost / 1_000_000_000) - 0.000005; // -5000 lamports de frais
      setSessionBalance(Math.max(0, newBalance).toFixed(4));
    }

    try {
      const actionLabel = String(action);
      
      // Utiliser "processed" au lieu de "finalized" pour vitesse maximale
      const [expiry, { blockhash, lastValidBlockHeight }] = await Promise.all([
        connection.getSlot("processed").then(slot => BigInt(slot + 90)),
        connection.getLatestBlockhash("processed"), // ULTRA-RAPIDE
      ]);
      
      const leader = vault?.leader ? new PublicKey(vault.leader) : sessionWallet.publicKey;
      const instruction = buildActionInstruction({
        action,
        programId,
        signer: sessionWallet.publicKey,
        leader,
        snipeExpirySlot: expiry,
      });
      
      const transaction = new Transaction().add(instruction);
      transaction.feePayer = sessionWallet.publicKey;
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;
      
      transaction.sign(sessionWallet);
      
      const signature = await connection.sendRawTransaction(
        transaction.serialize(),
        {
          skipPreflight: false,
          maxRetries: 2,
        }
      );
      
      setLatestSignature(signature);
      showToast(`${actionLabel} executed successfully`, "success");
      
      // Attendre la confirmation puis refresh pour corriger si besoin
      connection.confirmTransaction(signature, "processed").then(() => {
        if (realtimeVaultRef.current) {
          realtimeVaultRef.current.refresh(true);
        }
        
        // Mettre à jour le balance réel
        if (sessionWallet) {
          connection.getBalance(sessionWallet.publicKey).then(bal => {
            setSessionBalance(formatSolFromLamports(bal));
          });
        }
      }).catch(err => {
        console.error("Confirmation error:", err);
        // En cas d'erreur, forcer un refresh pour revenir à l'état réel
        if (realtimeVaultRef.current) {
          realtimeVaultRef.current.refresh(true);
        }
      });
      
    } catch (actionError: any) {
      const errorMessage = actionError instanceof Error ? actionError.message : String(actionError);
      
      if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
        showToast("RPC rate limit reached - retry in a moment", "warning");
      } else {
        showToast(`${String(action)} failed: ${errorMessage}`, "error");
      }
      
      // En cas d'erreur, restaurer l'état réel
      if (realtimeVaultRef.current) {
        realtimeVaultRef.current.refresh(true);
      }
      
      // Restaurer le balance réel
      if (sessionWallet) {
        const bal = await connection.getBalance(sessionWallet.publicKey);
        setSessionBalance(formatSolFromLamports(bal));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="section shell">
        {!programId && (
          <div className="notice notice--warning">⚠️ No program ID configured</div>
        )}
        
        {programId && vault === null && !loading && (
          <div className="notice notice--warning">
            ⚠️ Protocol vault not initialized
            <button 
              className="button button--primary" 
              onClick={handleInitialize} 
              disabled={!connected || loading}
              style={{marginTop: '0.5rem'}}
            >
              🚀 Initialize Protocol Vault
            </button>
          </div>
        )}

        {/* Layout principal: Chart au centre, contrôles sur les côtés */}
        <div className="game-layout">
          {/* Sidebar gauche: Wallet */}
          <div className="sidebar-left">
            <div className="control-card">
              <h3>💳 Wallet</h3>
              <div className="compact-stats">
                <div><span>Main</span><strong>{connected && publicKey ? shortenAddress(publicKey.toBase58()) : "Disconnected"}</strong></div>
                <div><span>Session</span><strong>{sessionWallet ? shortenAddress(sessionWallet.publicKey.toBase58()) : "Not funded"}</strong></div>
                <div><span>Balance</span><strong>{sessionBalance} SOL</strong></div>
              </div>
              
              {/* Transaction signature link - integrated nicely */}
              {latestSignature && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, rgba(125, 211, 255, 0.1) 0%, rgba(140, 245, 197, 0.1) 100%)',
                  border: '1px solid rgba(125, 211, 255, 0.3)',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '0.4rem',
                    color: '#7dd3ff',
                    fontWeight: '600',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    <span>🔗</span>
                    <span>Latest Transaction</span>
                  </div>
                  <a 
                    href={`https://explorer.solana.com/tx/${latestSignature}?cluster=devnet`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: '#8cf5c5',
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      fontFamily: 'monospace',
                      display: 'block',
                      padding: '0.4rem 0.6rem',
                      background: 'rgba(140, 245, 197, 0.1)',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease',
                      wordBreak: 'break-all'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(140, 245, 197, 0.2)';
                      e.currentTarget.style.transform = 'translateX(2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(140, 245, 197, 0.1)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    {latestSignature.slice(0, 12)}...{latestSignature.slice(-12)}
                  </a>
                </div>
              )}
              
              <div className="wallet-actions">
                <input 
                  type="text" 
                  value={budget} 
                  onChange={(e) => setBudget(e.target.value)} 
                  placeholder="0.03"
                  className="compact-input"
                />
                <button className="btn-compact btn-primary" onClick={handleFundSession} disabled={loading}>Fund</button>
                <button className="btn-compact btn-secondary" onClick={handleSweepSession} disabled={loading || !sessionWallet}>Sweep</button>
              </div>
            </div>
            
            {/* Nouveau bloc: Cycle Info */}
            <div className="control-card">
              <h3>📊 Cycle Info</h3>
              <div className="compact-stats">
                <div><span>Cycle</span><strong>#{vault ? String(vault.cycleNumber) : "-"}</strong></div>
                <div><span>Pressure</span><strong>{vault ? String(vault.pressureCount) : "-"} / 40</strong></div>
              </div>
            </div>
          </div>

          {/* Chart central */}
          <div className="game-chart">
            {vault && vault.leader && vault.leader !== "11111111111111111111111111111111" ? (
              <CryptoChart
                remainingSeconds={remainingSeconds}
                maxSeconds={vault ? Number(vault.timerResetSlots) * 0.45 : MAX_RESET_SLOTS * 0.45}
                pressure={vault ? Number(vault.pressureCount) : 0}
                pot={pot}
                leader={shortenAddress(vault?.leader || "Waiting...")}
                isActive={remainingSeconds > 0}
              />
            ) : (
              <div className="cycle-graph">
                <div className="cycle-graph__empty">
                  <div className="cycle-graph__empty-icon">🎮</div>
                  <h3>No Active Cycle</h3>
                  <p>Click &quot;Deposit&quot; to start a new cycle!</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar droite: Actions */}
          <div className="sidebar-right">
            <div className="control-card">
              <h3>⚡ Actions</h3>
              <div className="actions-vertical">
                {ACTION_BUTTONS.map(([action, desc, emoji]) => {
                  const cost = action in ACTION_COSTS ? formatSolFromLamports(ACTION_COSTS[action as keyof typeof ACTION_COSTS]) : "0";
                  
                  // Logique de blocage des actions:
                  // 1. Si pas de cycle actif (leader = 1111...1111) → Seul Deposit autorisé
                  // 2. Si cycle actif mais user n'est pas le leader → Seul Deposit autorisé (pour prendre le leadership)
                  // 3. Si user est le leader → Toutes les actions autorisées
                  
                  const cycleActive = !!(vault && vault.leader && vault.leader !== "11111111111111111111111111111111");
                  const userIsLeader = !!(sessionWallet && vault && vault.leader === sessionWallet.publicKey.toBase58());
                  
                  // Bloquer toutes les actions sauf Deposit si:
                  // - Pas de cycle actif OU
                  // - Cycle actif mais user n'est pas le leader
                  const isBlocked = action !== "Deposit" && (!cycleActive || !userIsLeader);
                  
                  return (
                    <button
                      key={action}
                      onClick={() => handleAction(action as keyof typeof ACTION_COSTS)}
                      disabled={loading || !sessionWallet || !programId || isBlocked}
                      className="action-btn-vertical"
                      title={isBlocked ? (cycleActive ? "Vous devez être le leader pour utiliser cette action" : "Faites un Deposit pour démarrer un cycle") : desc}
                    >
                      <span className="action-emoji">{emoji}</span>
                      <div className="action-info">
                        <span className="action-name">{action}</span>
                        <span className="action-cost">{cost} SOL</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {showWinnerNotification && winnerData && (
        <WinnerNotification
          winner={shortenAddress(winnerData.winner)}
          payout={winnerData.payout}
          onClose={() => {
            setShowWinnerNotification(false);
            setWinnerData(null);
          }}
        />
      )}

      {/* Toast notifications - centered, non-displacing */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
          duration={1000}
        />
      )}
    </>
  );
}
