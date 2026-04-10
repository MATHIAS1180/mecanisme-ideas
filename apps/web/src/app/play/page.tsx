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
  ["Deposit", "Take leadership and reset the timer.", "💰"],
  ["Shield", "Leader-only protection that blocks deposits briefly.", "🛡️"],
  ["Sabotage", "Cut the remaining time without taking leadership.", "💣"],
  ["Anchor", "Leader-only two-entry reset to full breathing room.", "⚓"],
  ["ArmSnipe", "Escrow one entry and trap the next challenger.", "🎯"],
  ["Curse", "Reduce the winner share and feed carry-over.", "👻"],
  ["Blizzard", "Increase pot and pressure without taking the lead.", "❄️"],
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
  
  // Session wallet notification (stays in wallet block)
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  
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

  // Timer update
  useEffect(() => {
    if (!vault || !vault.leader || vault.leader === "11111111111111111111111111111111") {
      setRemainingSeconds(0);
      return;
    }

    const updateTimer = async () => {
      try {
        const currentSlot = await connection.getSlot("confirmed");
        const slotEnd = Number(vault.timerStartSlot) + Number(vault.timerResetSlots);
        const slotsLeft = Math.max(0, slotEnd - currentSlot);
        const secondsLeft = Math.floor(slotsLeft * 0.45);
        
        setRemainingSeconds(secondsLeft);
      } catch (error) {
        console.error("Error updating timer:", error);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [vault, connection, remainingSeconds]);

  // Fallback polling when timer = 0
  useEffect(() => {
    if (remainingSeconds !== 0 || !realtimeVaultRef.current) return;

    const fallbackInterval = setInterval(() => {
      realtimeVaultRef.current?.refresh(true);
    }, 10000);

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
      showToast("Connect a wallet and configure NEXT_PUBLIC_NODUS_PROGRAM_ID first.", "error");
      return;
    }

    setLoading(true);
    try {
      const instruction = buildInitializeInstruction(programId, publicKey);
      const transaction = await sendTransaction(new Transaction().add(instruction), connection);
      setLatestSignature(transaction);
      showToast("Vault initialize transaction sent.", "success");
    } catch (initializeError) {
      showToast(initializeError instanceof Error ? initializeError.message : "Initialize failed.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleFundSession() {
    if (!connected || !publicKey || !sendTransaction) {
      showToast("Connect a wallet before funding a session wallet.", "error");
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
      setSessionNotice("✅ Session wallet funded!");
      showToast("Session wallet funded! Confirmation en cours...", "success");
      
      setTimeout(async () => {
        const bal = await connection.getBalance(wallet.publicKey);
        setSessionBalance(formatSolFromLamports(bal));
      }, 1000);
      
    } catch (fundError) {
      showToast(fundError instanceof Error ? fundError.message : "Funding failed.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSweepSession() {
    if (!sessionWallet || !publicKey) {
      showToast("No active session wallet found.", "error");
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
        showToast("Session wallet is already empty.", "info");
        return;
      }
      const signature = await connection.sendRawTransaction(transaction.serialize());
      clearSessionWallet();
      setSessionWallet(null);
      setLatestSignature(signature);
      setSessionNotice(null);
      showToast("Remaining session balance sent back to the connected wallet.", "success");
    } catch (sweepError) {
      showToast(sweepError instanceof Error ? sweepError.message : "Sweep failed.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action: keyof typeof ACTION_COSTS | "Resolve") {
    if (!programId || !sessionWallet) {
      showToast("Program ID and funded session wallet are required before sending cycle actions.", "error");
      return;
    }

    setLoading(true);
    
    if (realtimeVaultRef.current && vault) {
      const optimisticUpdates: Record<string, Partial<NodusVault>> = {
        Deposit: {
          leader: sessionWallet.publicKey.toBase58(),
          pressureCount: BigInt(Math.min(40, Number(vault.pressureCount) + 1)),
        },
        Shield: {
          terminalLock: true,
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

    try {
      const actionLabel = String(action);
      const expiry = BigInt((await connection.getSlot("finalized")) + 90);
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
      
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("finalized");
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
      showToast(`${actionLabel} envoyé! Confirmation en cours...`, "success");
      
      if (sessionWallet) {
        setTimeout(async () => {
          const bal = await connection.getBalance(sessionWallet.publicKey);
          setSessionBalance(formatSolFromLamports(bal));
        }, 1000);
      }
      
    } catch (actionError: any) {
      const errorMessage = actionError instanceof Error ? actionError.message : String(actionError);
      
      if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
        showToast("RPC Rate Limit Atteint - Réessaye dans quelques secondes.", "warning");
      } else {
        showToast(`Erreur ${String(action)}: ${errorMessage}`, "error");
      }
      
      if (realtimeVaultRef.current) {
        console.log("❌ Action failed, WebSocket will restore correct state");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="section shell">
        {!programId && (
          <div className="notice notice--warning">⚠️ Aucun program ID configuré.</div>
        )}
        
        {programId && vault === null && !loading && (
          <div className="notice notice--warning">
            ⚠️ Le vault n&apos;est pas initialisé.
            <button 
              className="button button--primary" 
              onClick={handleInitialize} 
              disabled={!connected || loading}
              style={{marginTop: '0.5rem'}}
            >
              🚀 Initialize Vault
            </button>
          </div>
        )}

        {/* Stats bar en haut */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-label">Cycle</span>
            <strong className="stat-value">{vault ? String(vault.cycleNumber) : "-"}</strong>
          </div>
          <div className="stat-item">
            <span className="stat-label">Leader</span>
            <strong className="stat-value">{shortenAddress(vault?.leader || "Live")}</strong>
          </div>
          <div className="stat-item">
            <span className="stat-label">Timer</span>
            <strong className="stat-value">{formatCountdown(remainingSeconds)}</strong>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pot</span>
            <strong className="stat-value">{pot} SOL</strong>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pressure</span>
            <strong className="stat-value">{vault ? String(vault.pressureCount) : "-"}/40</strong>
          </div>
        </div>

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
              
              {/* Session wallet notification stays here */}
              {sessionNotice && (
                <div className="wallet-notice" style={{
                  marginTop: '0.75rem',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(140, 245, 197, 0.15)',
                  border: '1px solid rgba(140, 245, 197, 0.3)',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: '#8cf5c5'
                }}>
                  {sessionNotice}
                </div>
              )}
              
              {/* Transaction signature link stays here */}
              {latestSignature && (
                <div className="wallet-notice" style={{
                  marginTop: '0.75rem',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(125, 211, 255, 0.15)',
                  border: '1px solid rgba(125, 211, 255, 0.3)',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: '#7dd3ff'
                }}>
                  🔗 <a 
                    href={`https://explorer.solana.com/tx/${latestSignature}?cluster=devnet`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#7dd3ff', textDecoration: 'underline' }}
                  >
                    View on Explorer
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
                  <h3>Aucun cycle actif</h3>
                  <p>Clique sur &quot;Deposit&quot; pour démarrer!</p>
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
                  return (
                    <button
                      key={action}
                      onClick={() => handleAction(action as keyof typeof ACTION_COSTS)}
                      disabled={loading || !sessionWallet || !programId}
                      className="action-btn-vertical"
                      title={desc}
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
          duration={3000}
        />
      )}
    </>
  );
}
