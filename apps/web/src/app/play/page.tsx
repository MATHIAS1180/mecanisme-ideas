"use client";

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
import { RealtimeVault } from "../../lib/realtime-vault";

const ACTION_BUTTONS = [
  ["Deposit", "Take leadership and reset the timer."],
  ["Shield", "Leader-only protection that blocks deposits briefly."],
  ["Sabotage", "Cut the remaining time without taking leadership."],
  ["Anchor", "Leader-only two-entry reset to full breathing room."],
  ["ArmSnipe", "Escrow one entry and trap the next challenger."],
  ["Curse", "Reduce the winner share and feed carry-over."],
  ["Blizzard", "Increase pot and pressure without taking the lead."],
  ["Resolve", "Settle the cycle once the timer has expired."],
] as const;

export default function PlayPage() {
  const { connection } = useConnection();
  const { connected, publicKey, sendTransaction } = useWallet();
  const [sessionWallet, setSessionWallet] = useState(() => loadSessionWallet());
  const [budget, setBudget] = useState("0.03");
  const [vault, setVault] = useState<NodusVault | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [latestSignature, setLatestSignature] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(15);
  const [pot, setPot] = useState<string>("0.0000");
  const [sessionBalance, setSessionBalance] = useState<string>("0.0000");
  const [userStake, setUserStake] = useState<string>("0.0000");
  const [cycleStatus, setCycleStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [lastTimerStart, setLastTimerStart] = useState<bigint | null>(null);
  const [lastCycleNumber, setLastCycleNumber] = useState<bigint | null>(null);
  const [showWinnerNotification, setShowWinnerNotification] = useState(false);
  const [winnerData, setWinnerData] = useState<{ winner: string; payout: string } | null>(null);

  const programId = getProgramId();
  const realtimeVaultRef = useRef<RealtimeVault | null>(null);
  const lastZeroTimeRef = useRef<number | null>(null); // Track quand timer atteint 0

  // ⚡ WEBSOCKET UNIQUEMENT - PAS DE POLLING!
  // Le WebSocket gère TOUS les updates en temps réel
  useEffect(() => {
    if (!programId) return;

    const { vault: vaultPda } = getNodusAccounts(programId, programId);
    const realtimeVault = new RealtimeVault(connection, vaultPda);
    realtimeVaultRef.current = realtimeVault;

    // Listener pour les changements de vault
    const handleVaultChange = (nextVault: NodusVault | null) => {
      if (!nextVault) return;

      console.log("📡 WebSocket update reçu:", {
        cycle: nextVault.cycleNumber.toString(),
        leader: nextVault.leader,
        timerStart: nextVault.timerStartSlot.toString(),
        timerReset: nextVault.timerResetSlots.toString(),
      });

      // Détecte si c'est un nouveau cycle
      const isNewCycle = vault && nextVault.cycleNumber !== vault.cycleNumber;
      
      if (isNewCycle) {
        console.log("🎉 NOUVEAU CYCLE DÉTECTÉ!", {
          ancien: vault.cycleNumber.toString(),
          nouveau: nextVault.cycleNumber.toString(),
        });
      }
      
      // Si nouveau cycle ET qu'il y a un gagnant précédent, afficher la notification
      if (isNewCycle && nextVault.lastResolvedWinner && nextVault.lastResolvedWinner !== "11111111111111111111111111111111") {
        setWinnerData({
          winner: nextVault.lastResolvedWinner,
          payout: formatSolFromLamports(Number(nextVault.lastResolvedPayout)),
        });
        setShowWinnerNotification(true);
      }
      
      setVault(nextVault);
      setLastTimerStart(nextVault.timerStartSlot);
      setLastCycleNumber(nextVault.cycleNumber);

      // Si nouveau cycle, clear les messages
      if (isNewCycle) {
        setNotice(null);
        setError(null);
        setCycleStatus("");
      }
    };

    realtimeVault.addListener(handleVaultChange);
    realtimeVault.subscribe();

    return () => {
      realtimeVault.removeListener(handleVaultChange);
      realtimeVault.unsubscribe();
    };
  }, [programId, connection, vault]);

  // ⏱️ Timer update continu + AUTO-RESOLVE automatique
  useEffect(() => {
    if (!vault || !vault.leader || vault.leader === "11111111111111111111111111111111") {
      setRemainingSeconds(0);
      return;
    }

    const updateTimer = async () => {
      try {
        const currentSlot = await connection.getSlot("finalized");
        const slotEnd = Number(vault.timerStartSlot) + Number(vault.timerResetSlots);
        const slotsLeft = Math.max(0, slotEnd - currentSlot);
        const secondsLeft = Math.floor(slotsLeft * 0.45);
        
        // 🚨 AUTO-RESOLVE: Si timer à 0 depuis >3s ET session wallet disponible
        if (secondsLeft === 0 && remainingSeconds === 0 && sessionWallet) {
          const now = Date.now();
          if (!lastZeroTimeRef.current) {
            lastZeroTimeRef.current = now;
          } else if (now - lastZeroTimeRef.current > 3000 && !loading) {
            // Timer à 0 depuis >3s = envoyer un Deposit pour trigger auto-resolve
            console.log("⚡ AUTO-RESOLVE: Envoi Deposit automatique pour résoudre le cycle...");
            lastZeroTimeRef.current = now + 10000; // Éviter spam (10s cooldown)
            
            // Envoyer Deposit en arrière-plan (va trigger auto-resolve dans smart contract)
            handleAction("Deposit").catch(err => {
              console.error("❌ Auto-resolve failed:", err);
              // Retry dans 5s
              setTimeout(() => {
                lastZeroTimeRef.current = Date.now() - 2000; // Reset pour retry
              }, 5000);
            });
          }
        } else if (secondsLeft > 0) {
          // Reset le compteur si timer > 0
          lastZeroTimeRef.current = null;
        }
        
        setRemainingSeconds(secondsLeft);
      } catch (error) {
        console.error("Error updating timer:", error);
      }
    };

    // Update immédiat
    updateTimer();

    // Update toutes les secondes
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [vault, connection, remainingSeconds, sessionWallet, loading]);

  // 💾 CACHE STRATEGY: Fetch données secondaires UNIQUEMENT après actions utilisateur
  // Pas de polling automatique pour économiser RPC
  const fetchSecondaryData = useCallback(async () => {
    if (!programId) return;

    try {
      // Pot (calculé depuis vault state, pas de RPC call!)
      if (vault) {
        const rentReserve = 2_000_000;
        const carryOver = Number(vault.carryOverLamports);
        // On utilise une estimation basée sur le vault state
        const estimatedBalance = rentReserve + carryOver + (Number(vault.pressureCount) * ENTRY_LAMPORTS);
        const actualPot = Math.max(0, estimatedBalance - rentReserve - carryOver);
        setPot(formatSolFromLamports(actualPot));
      }

      // Session wallet balance (fetch UNIQUEMENT si nécessaire)
      if (sessionWallet && !sessionBalance) {
        const bal = await connection.getBalance(sessionWallet.publicKey);
        setSessionBalance(formatSolFromLamports(bal));
      }
    } catch (error: any) {
      console.error("Error fetching secondary data:", error);
    }
  }, [programId, connection, sessionWallet, vault, sessionBalance]);

  // Fetch initial data ONCE
  useEffect(() => {
    fetchSecondaryData();
  }, [vault?.cycleNumber, fetchSecondaryData]); // Re-fetch seulement au changement de cycle



  async function handleInitialize() {
    if (!connected || !publicKey || !sendTransaction || !programId) {
      setError("Connect a wallet and configure NEXT_PUBLIC_NODUS_PROGRAM_ID first.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const instruction = buildInitializeInstruction(programId, publicKey);
      const transaction = await sendTransaction(new Transaction().add(instruction), connection);
      setLatestSignature(transaction);
      setNotice("Vault initialize transaction sent.");
    } catch (initializeError) {
      setError(initializeError instanceof Error ? initializeError.message : "Initialize failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFundSession() {
    if (!connected || !publicKey || !sendTransaction) {
      setError("Connect a wallet before funding a session wallet.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const wallet = sessionWallet ?? createSessionWallet();
      const lamports = Math.max(0.03, Number(budget || "0.03")) * 1_000_000_000;
      
      // ⚡ OPTIMISATION: Build transaction avec blockhash "finalized"
      const { blockhash } = await connection.getLatestBlockhash("finalized");
      const transaction = await buildFundSessionTransaction({
        connection,
        owner: publicKey,
        sessionWallet: wallet,
        lamports: Math.round(lamports),
      });
      transaction.recentBlockhash = blockhash;
      
      // ⚡ OPTIMISATION: sendTransaction sans attendre confirmation
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        maxRetries: 2,
      });
      
      setSessionWallet(wallet);
      setLatestSignature(signature);
      setNotice("✅ Session wallet funded! Confirmation en cours...");
      
      // Update balance après 1s
      setTimeout(async () => {
        const bal = await connection.getBalance(wallet.publicKey);
        setSessionBalance(formatSolFromLamports(bal));
      }, 1000);
      
    } catch (fundError) {
      setError(fundError instanceof Error ? fundError.message : "Funding failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve() {
    if (!programId || !publicKey || !sendTransaction) {
      setError("Connect your main wallet to resolve the cycle.");
      return;
    }

    if (!vault || !vault.leader || vault.leader === "11111111111111111111111111111111") {
      setError("No active cycle to resolve.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const leader = new PublicKey(vault.leader);
      const feeWallet = new PublicKey(FEE_WALLET);
      
      const instruction = buildActionInstruction({
        action: "Resolve",
        programId,
        signer: publicKey,
        leader,
        snipeExpirySlot: BigInt(0),
      });
      
      const transaction = new Transaction().add(instruction);
      transaction.feePayer = publicKey;
      
      const { blockhash } = await connection.getLatestBlockhash("finalized");
      transaction.recentBlockhash = blockhash;
      
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        maxRetries: 2,
      });
      
      setLatestSignature(signature);
      setNotice("✅ Cycle résolu! Nouveau cycle en cours...");
      
      // Force refresh après 1s
      setTimeout(() => {
        realtimeVaultRef.current?.refresh(true);
      }, 1000);
      
    } catch (resolveError: any) {
      const errorMessage = resolveError instanceof Error ? resolveError.message : String(resolveError);
      setError(`❌ Erreur Resolve: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSweepSession() {
    if (!sessionWallet || !publicKey) {
      setError("No active session wallet found.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const transaction = await buildSweepTransaction({
        connection,
        sessionWallet,
        destination: publicKey,
      });
      if (!transaction) {
        setNotice("Session wallet is already empty.");
        return;
      }
      const signature = await connection.sendRawTransaction(transaction.serialize());
      clearSessionWallet();
      setSessionWallet(null);
      setLatestSignature(signature);
      setNotice("Remaining session balance sent back to the connected wallet.");
    } catch (sweepError) {
      setError(sweepError instanceof Error ? sweepError.message : "Sweep failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action: keyof typeof ACTION_COSTS | "Resolve") {
    if (!programId || !sessionWallet) {
      setError("Program ID and funded session wallet are required before sending cycle actions.");
      return;
    }

    setLoading(true);
    setError(null);
    
    // 🚀 OPTIMISTIC UPDATE: Feedback instantané AVANT la confirmation on-chain
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
      const expiry = BigInt((await connection.getSlot("finalized")) + 90); // Use finalized for slot
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
      
      // ⚡ OPTIMISATION: Utiliser getLatestBlockhash avec "finalized" pour éviter rate limits
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("finalized");
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;
      
      transaction.sign(sessionWallet);
      
      // ⚡ OPTIMISATION: sendRawTransaction avec skipPreflight pour vitesse maximale
      const signature = await connection.sendRawTransaction(
        transaction.serialize(),
        {
          skipPreflight: false, // Keep preflight for safety
          maxRetries: 2, // Reduce retries
        }
      );
      
      setLatestSignature(signature);
      setNotice(`✅ ${actionLabel} envoyé! Confirmation en cours...`);
      
      // ⚡ OPTIMISATION: Pas d'attente de confirmation, le WebSocket va update
      // Refresh session balance après action
      if (sessionWallet) {
        setTimeout(async () => {
          const bal = await connection.getBalance(sessionWallet.publicKey);
          setSessionBalance(formatSolFromLamports(bal));
        }, 1000);
      }
      
    } catch (actionError: any) {
      // Détection spécifique des erreurs rate limit
      const errorMessage = actionError instanceof Error ? actionError.message : String(actionError);
      
      if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
        setError(`⚠️ RPC Rate Limit Atteint

Le RPC public devnet est surchargé. Réessaye dans quelques secondes.

💡 Pour éviter ce problème, utilise un RPC premium gratuit:
• Tatum: https://solana-devnet.gateway.tatum.io (pas de compte!)
• Helius: https://helius.dev
• QuickNode: https://quicknode.com`);
      } else {
        setError(`❌ Erreur ${String(action)}: ${errorMessage}`);
      }
      
      // Rollback optimistic update en cas d'erreur
      if (realtimeVaultRef.current) {
        // Le WebSocket va refresh automatiquement
        console.log("❌ Action failed, WebSocket will restore correct state");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="page-title shell">
        <p className="eyebrow">Play terminal</p>
        <h1>Operate the live cycle.</h1>
        <p>
          The terminal is wired for Phantom and Solflare on devnet. Configure the program ID, fund a bounded
          session wallet, then send cycle actions without repeating a main wallet popup.
        </p>
      </section>

      <section className="section section--tight shell">
        {!programId ? (
          <div className="notice notice--warning">
            ⚠️ Aucun program ID configuré. Définis NEXT_PUBLIC_NODUS_PROGRAM_ID pour passer en mode devnet live.
          </div>
        ) : null}
        {programId && vault === null && !loading ? (
          <div className="notice notice--warning">
            ⚠️ Le vault n&apos;est pas initialisé. Clique sur le bouton ci-dessous pour l&apos;initialiser (une seule fois).
            <button 
              className="button button--primary" 
              onClick={handleInitialize} 
              disabled={!connected || loading}
              style={{marginTop: '1rem', display: 'block'}}
            >
              🚀 Initialize Vault
            </button>
          </div>
        ) : null}
        {notice ? <div className="notice notice--success">{notice}</div> : null}
        {error ? <div className="notice notice--danger">{error}</div> : null}
        {latestSignature && (
          <div className="notice notice--info">
            🔗 Transaction: <a href={`https://explorer.solana.com/tx/${latestSignature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" style={{color: '#8cf5c5', textDecoration: 'underline'}}>
              {latestSignature.slice(0, 8)}...{latestSignature.slice(-8)}
            </a>
          </div>
        )}
      </section>

      <section className="section shell">
        <div className="play-container">
          {/* Graphique principal */}
          <div className="play-main">
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
                  <p>Sois le premier à démarrer un nouveau cycle!</p>
                  <p className="muted">Clique sur &quot;Deposit&quot; pour prendre le leadership et démarrer le timer.</p>
                </div>
              </div>
            )}
          </div>

          <div className="play-sidebar">
            <article className="terminal">
              <p className="eyebrow">Cycle telemetry</p>
              
              <div className="terminal__row">
                <span className="terminal__label">Cycle #</span>
                <strong className="terminal__value">{vault ? String(vault.cycleNumber) : "-"}</strong>
              </div>
              <div className="terminal__row">
                <span className="terminal__label">Leader</span>
                <strong className="terminal__value">{shortenAddress(vault?.leader || "Live")}</strong>
              </div>
              <div className="terminal__row">
                <span className="terminal__label">Countdown</span>
                <strong className="terminal__value">
                  {formatCountdown(remainingSeconds)}
                </strong>
              </div>
              <div className="terminal__row">
                <span className="terminal__label">Pot</span>
                <strong className="terminal__value">{pot} SOL</strong>
              </div>
              <div className="terminal__row">
                <span className="terminal__label">Pressure</span>
                <strong className="terminal__value">{vault ? String(vault.pressureCount) : "-"} / 40</strong>
              </div>
              <div className="terminal__row">
                <span className="terminal__label">Terminal lock</span>
                <strong className="terminal__value">{vault?.terminalLock ? "🔒 ACTIVE" : "Inactive"}</strong>
              </div>
              <div className="terminal__row">
                <span className="terminal__label">Carry-over</span>
                <strong className="terminal__value">{vault ? `${formatSolFromLamports(vault.carryOverLamports)} SOL` : "0.0000 SOL"}</strong>
              </div>
              <div className="terminal__row">
                <span className="terminal__label">Curses</span>
                <strong className="terminal__value">{vault ? `${vault.curseCount} / 5` : "0 / 5"}</strong>
              </div>
              {cycleStatus && (
                <div className="terminal__row">
                  <span className="terminal__label">Statut</span>
                  <strong className="terminal__value">{cycleStatus}</strong>
                </div>
              )}
            </article>

            <article className="metric-board">
              <h3>Session wallet</h3>
              <div className="session-row">
                <span>Main wallet</span>
                <strong>{connected && publicKey ? shortenAddress(publicKey.toBase58()) : "Disconnected"}</strong>
              </div>
              <div className="session-row">
                <span>Session signer</span>
                <strong>{sessionWallet ? shortenAddress(sessionWallet.publicKey.toBase58()) : "Not funded"}</strong>
              </div>
              <div className="session-row">
                <span>Budget (prévu)</span>
                <strong>{budget} SOL</strong>
              </div>
              <div className="session-row">
                <span>Solde session</span>
                <strong>{sessionBalance} SOL</strong>
              </div>
              <div className="session-row">
                <span>Mise en cours</span>
                <strong>{userStake} SOL</strong>
              </div>
              <p style={{ fontSize: '0.85em', color: '#888', marginTop: '8px', marginBottom: '12px' }}>
                💡 Minimum recommandé: 0.03 SOL (couvre rent + plusieurs actions)
              </p>
              <div className="button-row">
                <label className="input-shell">
                  <span>Budget</span>
                  <input value={budget} onChange={(event) => setBudget(event.target.value)} inputMode="decimal" />
                </label>
                <button className="button button--primary" onClick={handleFundSession} disabled={loading}>
                  Fund
                </button>
                <button className="button button--secondary" onClick={handleSweepSession} disabled={loading || !sessionWallet}>
                  Sweep
                </button>
              </div>
            </article>

            <article className="metric-board">
              <h3>Cycle actions</h3>
              <p style={{ fontSize: '0.85em', color: '#888', marginBottom: '1rem' }}>
                💡 Chaque action a un coût et un effet unique sur le cycle
              </p>
              <div className="action-grid">
                {ACTION_BUTTONS.filter(([action]) => action !== "Resolve").map(([action, body]) => {
                  const cost = action in ACTION_COSTS ? `${formatSolFromLamports(ACTION_COSTS[action as keyof typeof ACTION_COSTS])} SOL` : "network call";
                  const disabled = loading || !sessionWallet || !programId;
                  
                  // Emoji pour chaque action
                  const actionEmoji: Record<string, string> = {
                    "Deposit": "💰",
                    "Shield": "🛡️",
                    "Sabotage": "💣",
                    "Anchor": "⚓",
                    "ArmSnipe": "🎯",
                    "Curse": "👻",
                    "Blizzard": "❄️",
                  };
                  
                  return (
                    <button
                      key={action}
                      onClick={() => handleAction(action as keyof typeof ACTION_COSTS)}
                      disabled={disabled}
                      title={body}
                    >
                      <strong>{actionEmoji[action] || "🎮"} {action}</strong>
                      <small>{body}</small>
                      <small style={{color: '#8cf5c5', fontWeight: 600}}>💵 {cost}</small>
                    </button>
                  );
                })}
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Winner Notification */}
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
    </>
  );
}
