"use client";

import Link from "next/link";
import { startTransition, useEffect, useState, useRef } from "react";
import { ACTION_COSTS, buildActionInstruction, buildFundSessionTransaction, buildInitializeInstruction, fetchVault, getProgramId, getNodusAccounts } from "../../lib/nodus-client";
import { buildSweepTransaction, clearSessionWallet, createSessionWallet, loadSessionWallet } from "../../lib/session-wallet";
import { formatCountdown, formatSolFromLamports, shortenAddress } from "../../lib/format";
import { DEFAULT_RPC_URL, FEE_WALLET, MIN_RESET_SLOTS, MAX_RESET_SLOTS, ENTRY_LAMPORTS, type NodusVault } from "@nodus/sdk";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { CycleGraphPro } from "../../components/cycle-graph-pro";
import { WinnerNotification } from "../../components/winner-notification";

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
  const [autoResolving, setAutoResolving] = useState(false);
  const [lastTimerStart, setLastTimerStart] = useState<bigint | null>(null);
  const [lastCycleNumber, setLastCycleNumber] = useState<bigint | null>(null);
  const [showWinnerNotification, setShowWinnerNotification] = useState(false);
  const [winnerData, setWinnerData] = useState<{ winner: string; payout: string } | null>(null);

  const programId = getProgramId();

  // Expose refreshLive pour pouvoir l'appeler après resolve
  const refreshLiveRef = useRef<() => void>(() => {});
  // Auto-resolve : dès que le timer arrive à zéro, on envoie l'instruction automatiquement
  useEffect(() => {
    // Ne pas auto-resolve si:
    // - Pas de vault
    // - Pas de leader (cycle pas commencé ou déjà résolu)
    // - Déjà en train de résoudre
    // - Leader est l'adresse par défaut (11111...1)
    if (
      remainingSeconds === 0 && 
      !autoResolving && 
      programId && 
      sessionWallet && 
      vault && 
      vault.leader && 
      vault.leader !== "11111111111111111111111111111111"
    ) {
      setAutoResolving(true);
      (async () => {
        try {
          setNotice("⏳ Résolution automatique du cycle en cours...");
          const leader = new PublicKey(vault.leader);
          const expiry = BigInt((await connection.getSlot()) + 90);
          const instruction = buildActionInstruction({
            action: "Resolve",
            programId,
            signer: sessionWallet.publicKey,
            leader,
            snipeExpirySlot: expiry,
          });
          const transaction = new Transaction().add(instruction);
          transaction.feePayer = sessionWallet.publicKey;
          transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
          transaction.sign(sessionWallet);
          await connection.sendRawTransaction(transaction.serialize());
          setNotice("✅ Cycle résolu avec succès ! Nouveau cycle prêt.");
          setError(null);
          // Forcer un refresh immédiat après resolve
          setTimeout(() => {
            if (refreshLiveRef.current) refreshLiveRef.current();
          }, 1500);
        } catch (err) {
          setError("❌ Erreur lors de la résolution automatique : " + (err instanceof Error ? err.message : String(err)));
        } finally {
          setTimeout(() => setAutoResolving(false), 2500);
        }
      })();
    }
  }, [remainingSeconds, autoResolving, programId, sessionWallet, vault, connection]);

  // Timer et données live : tout est recalculé à chaque tick (2s)
  useEffect(() => {
    let active = true;
    let poller: number | null = null;
    let pauseTimeout: number | null = null;

    async function refreshLive() {
      // Expose la fonction pour l'auto-resolve
      refreshLiveRef.current = refreshLive;
      if (!programId) return;
      
      try {
        // 1. Vault (leader, slots...)
        const nextVault = await fetchVault(connection, programId);
        if (!active) return;
        
        // Détecte si c'est un nouveau cycle
        const isNewCycle = nextVault && vault && nextVault.cycleNumber !== vault.cycleNumber;
        
        // Si nouveau cycle ET qu'il y a un gagnant précédent, afficher la notification
        if (isNewCycle && nextVault.lastResolvedWinner && nextVault.lastResolvedWinner !== "11111111111111111111111111111111") {
          setWinnerData({
            winner: nextVault.lastResolvedWinner,
            payout: formatSolFromLamports(Number(nextVault.lastResolvedPayout)),
          });
          setShowWinnerNotification(true);
        }
        
        setVault(nextVault);
        setLastTimerStart(nextVault ? nextVault.timerStartSlot : null);
        setLastCycleNumber(nextVault ? nextVault.cycleNumber : null);

        // 2. Pot = solde du compte vault (PDA)
        const { vault: vaultPda } = getNodusAccounts(programId, programId);
        const vaultBalance = await connection.getBalance(vaultPda);
        setPot(formatSolFromLamports(vaultBalance));

        // 3. Timer live
        const currentSlot = await connection.getSlot();
        let secondsLeft = 0;
        if (nextVault) {
          const slotEnd = Number(nextVault.timerStartSlot) + Number(nextVault.timerResetSlots);
          const slotsLeft = Math.max(0, slotEnd - currentSlot);
          secondsLeft = Math.floor(slotsLeft * 0.45);
        }
        setRemainingSeconds(secondsLeft);

        // 4. Solde session wallet
        if (sessionWallet) {
          const bal = await connection.getBalance(sessionWallet.publicKey);
          setSessionBalance(formatSolFromLamports(bal));
        } else {
          setSessionBalance("0.0000");
        }

        // 5. Mise utilisateur (userState)
        if (sessionWallet && programId) {
          try {
            const { userState } = getNodusAccounts(programId, sessionWallet.publicKey);
            const acc = await connection.getAccountInfo(userState);
            if (acc && acc.data) {
              setUserStake("? (voir userState)");
            } else {
              setUserStake("0.0000");
            }
          } catch {
            setUserStake("0.0000");
          }
        } else {
          setUserStake("0.0000");
        }

        // 6. Statut du cycle (gagné/perdu)
        if (nextVault && sessionWallet) {
          // Seulement afficher le statut si un cycle vient de se terminer (leader existe encore)
          const cycleActive = nextVault.leader !== "11111111111111111111111111111111";
          if (secondsLeft === 0 && cycleActive && !isNewCycle) {
            if (nextVault.leader === sessionWallet.publicKey.toBase58()) {
              setCycleStatus("Cycle gagné ! 🎉");
            } else {
              setCycleStatus("Cycle perdu.");
            }
          } else if (!cycleActive) {
            // Pas de cycle actif, clear le statut
            setCycleStatus("");
          }
        } else {
          setCycleStatus("");
        }
        
        // Si nouveau cycle détecté, clear les messages et états
        if (isNewCycle) {
          setNotice(null);
          setError(null);
          setAutoResolving(false);
          setCycleStatus("");
        }
      } catch (err) {
        if (!active) return;
        // Gestion spéciale du 429 : pause le polling 10s
        if (err && typeof err === "object" && "message" in err && String(err.message).includes("429")) {
          setError("Trop de requêtes RPC (429). Pause 10s...");
          if (poller) window.clearInterval(poller);
          poller = null;
          if (pauseTimeout) window.clearTimeout(pauseTimeout);
          pauseTimeout = window.setTimeout(() => {
            setError(null);
            if (active && !poller) {
              poller = window.setInterval(refreshLive, 2000);
            }
          }, 10000);
        } else {
          setError(err instanceof Error ? err.message : "Erreur de rafraîchissement live.");
        }
      }
    }

    refreshLive(); // Premier appel immédiat
    poller = window.setInterval(refreshLive, 2000);
    return () => {
      active = false;
      if (poller) window.clearInterval(poller);
      if (pauseTimeout) window.clearTimeout(pauseTimeout);
    };
  }, [connection, programId, sessionWallet, vault]);



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
      const transaction = await buildFundSessionTransaction({
        connection,
        owner: publicKey,
        sessionWallet: wallet,
        lamports: Math.round(lamports),
      });
      const signature = await sendTransaction(transaction, connection);
      setSessionWallet(wallet);
      setLatestSignature(signature);
      setNotice("Session wallet funded. Future cycle actions can now use the local signer.");
    } catch (fundError) {
      setError(fundError instanceof Error ? fundError.message : "Funding failed.");
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

    // Vérifier le solde du session wallet avant l'action
    const sessionBalance = await connection.getBalance(sessionWallet.publicKey);
    const actionCost = action === "Resolve" ? 0 : (action in ACTION_COSTS ? ACTION_COSTS[action as keyof typeof ACTION_COSTS] : ENTRY_LAMPORTS);
    if (sessionBalance < actionCost) {
      setError(`💰 Solde insuffisant dans le session wallet.\n📊 Besoin: ${formatSolFromLamports(actionCost)} SOL\n💵 Disponible: ${formatSolFromLamports(sessionBalance)} SOL\n\n👉 Clique sur "Fund" pour ajouter des SOL.`);
      return;
    }

    // Si le timer est à zéro ET qu'un leader existe ET ce n'est pas un deposit, bloquer
    const cycleActive = vault && vault.leader && vault.leader !== "11111111111111111111111111111111";
    if (remainingSeconds === 0 && cycleActive && action !== "Resolve" && action !== "Deposit") {
      setError("⏱️ Cycle terminé : il faut d'abord résoudre (Resolve) avant toute autre action.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const actionLabel = String(action);
      const expiry = BigInt((await connection.getSlot()) + 90);
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
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      transaction.sign(sessionWallet);
      const signature = await connection.sendRawTransaction(transaction.serialize());
      setLatestSignature(signature);
      setNotice(`✅ ${actionLabel} envoyé avec succès !`);
      // Si c'est un resolve, force un refresh immédiat pour afficher le nouveau cycle
      if (action === "Resolve") {
        setTimeout(() => {
          if (refreshLiveRef.current) refreshLiveRef.current();
        }, 1500);
      }
    } catch (actionError) {
      setError(`❌ Erreur ${String(action)} : ` + (actionError instanceof Error ? actionError.message : `${String(action)} a échoué.`));
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
              <CycleGraphPro
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
                <strong className="terminal__value">{formatCountdown(remainingSeconds)}</strong>
                {error && error.includes("429") && (
                  <span style={{ color: '#ff6b6b', fontSize: '0.9em', marginLeft: 8 }}>Trop de requêtes RPC (429)</span>
                )}
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
                  // Désactive les actions si:
                  // - Loading ou auto-resolving
                  // - Pas de session wallet ou program ID
                  // - Timer=0 ET leader existe (cycle terminé, besoin de resolve)
                  // MAIS: Deposit est toujours autorisé si pas de leader (pour démarrer un nouveau cycle)
                  const cycleActive = !!(vault && vault.leader && vault.leader !== "11111111111111111111111111111111");
                  const cycleEnded = remainingSeconds === 0 && cycleActive;
                  const disabled = loading || autoResolving || !sessionWallet || !programId || (cycleEnded && action !== "Deposit");
                  
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
                {autoResolving && (
                  <div style={{color: '#ffb100', marginTop: 8, fontWeight: 500, gridColumn: '1 / -1', textAlign: 'center'}}>
                    ⏳ Résolution automatique du cycle en cours...
                  </div>
                )}
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
