"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import { ACTION_COSTS, buildActionInstruction, buildFundSessionTransaction, buildInitializeInstruction, fetchVault, getProgramId, getNodusAccounts } from "../../lib/nodus-client";
import { buildSweepTransaction, clearSessionWallet, createSessionWallet, loadSessionWallet } from "../../lib/session-wallet";
import { formatCountdown, formatSolFromLamports, shortenAddress } from "../../lib/format";
import { DEFAULT_RPC_URL, FEE_WALLET, MIN_RESET_SLOTS, type NodusVault } from "@nodus/sdk";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";

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
  const [budget, setBudget] = useState("0.01");
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

  const programId = getProgramId();

  useEffect(() => {
    setSessionWallet(loadSessionWallet());
  }, []);

  // Timer et données live : tout est recalculé à chaque tick (500ms)
  useEffect(() => {
    let active = true;
    let poller: number;


    async function refreshLive() {
      if (!programId) return;
      try {
        // 1. Vault (leader, slots...)
        const nextVault = await fetchVault(connection, programId);
        if (!active) return;
        setVault(nextVault);

        // 2. Pot = solde du compte vault (PDA)
        const { vault: vaultPda } = getNodusAccounts(programId, programId); // le vault est indépendant du signer
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
              // Pas de champ stake direct, on peut afficher le nombre d'actions ce cycle
              // (optionnel: décoder plus finement si besoin)
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
          if (secondsLeft === 0) {
            if (nextVault.leader === sessionWallet.publicKey.toBase58()) {
              setCycleStatus("Cycle gagné ! 🎉");
            } else {
              setCycleStatus("Cycle perdu.");
            }
          } else {
            setCycleStatus("");
          }
        } else {
          setCycleStatus("");
        }
      } catch (err) {
        if (!active) return;
        // Gestion spéciale du 429
        if (err && typeof err === "object" && "message" in err && String(err.message).includes("429")) {
          setError("Trop de requêtes RPC (429). Ralentis le rafraîchissement ou utilise un endpoint RPC privé.");
        } else {
          setError(err instanceof Error ? err.message : "Erreur de rafraîchissement live.");
        }
        // Ne pas reset le timer, garder la dernière valeur connue
      }
    }

    void refreshLive();
    poller = window.setInterval(refreshLive, 2000);
    return () => {
      active = false;
      window.clearInterval(poller);
    };
  }, [connection, programId, sessionWallet]);

  useEffect(() => {
    let active = true;

    async function refresh() {
      if (!programId) {
        return;
      }

      try {
        const nextVault = await fetchVault(connection, programId);
        if (!active) return;

        startTransition(() => {
          setVault(nextVault);
          if (nextVault) {
            const approxSeconds = Math.max(15, Math.floor(Number(nextVault.timerResetSlots) * 0.45));
            setRemainingSeconds(approxSeconds);
          }
        });
      } catch (refreshError) {
        if (!active) return;
        setError(refreshError instanceof Error ? refreshError.message : "Unable to refresh the vault.");
      }
    }

    void refresh();
    const poller = window.setInterval(() => {
      void refresh();
    }, 500);

    return () => {
      active = false;
      window.clearInterval(poller);
    };
  }, [connection, programId]);

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
      const lamports = Math.max(0.01, Number(budget || "0.01")) * 1_000_000_000;
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

    // Si le timer est à zéro et ce n'est pas un resolve, bloquer
    if (remainingSeconds === 0 && action !== "Resolve") {
      setError("Cycle terminé : il faut d'abord résoudre (Resolve) avant toute autre action.");
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
      setNotice(`${actionLabel} transaction sent to devnet.`);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : `${String(action)} failed.`);
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
          <div className="notice">
            No program ID configured yet. Set NEXT_PUBLIC_NODUS_PROGRAM_ID to switch from preview mode to live devnet mode.
          </div>
        ) : null}
        {notice ? <div className="notice">{notice}</div> : null}
        {error ? <div className="notice notice--danger">{error}</div> : null}
      </section>

      <section className="section shell">
        <div className="play-grid">
          <div className="stack">
            <article className="terminal">
              <p className="eyebrow">Cycle telemetry</p>
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
                <strong className="terminal__value">{vault ? String(vault.pressureCount) : "-"}</strong>
              </div>
              <div className="terminal__row">
                <span className="terminal__label">Reset floor</span>
                <strong className="terminal__value">~{Math.floor(MIN_RESET_SLOTS * 0.45)}s</strong>
              </div>
              <div className="terminal__row">
                <span className="terminal__label">Carry-over</span>
                <strong className="terminal__value">{vault ? `${formatSolFromLamports(vault.carryOverLamports)} SOL` : "0.0000 SOL"}</strong>
              </div>
              <div className="terminal__row">
                <span className="terminal__label">Fee wallet</span>
                <strong className="terminal__value">{shortenAddress(FEE_WALLET)}</strong>
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
              <div className="session-row">
                <span>RPC</span>
                <strong>{shortenAddress(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || DEFAULT_RPC_URL, 8)}</strong>
              </div>
              <div className="button-row">
                <label className="input-shell">
                  <span>Session budget</span>
                  <input value={budget} onChange={(event) => setBudget(event.target.value)} inputMode="decimal" />
                </label>
                <button className="button button--primary" onClick={handleFundSession} disabled={loading}>
                  Fund session
                </button>
                <button className="button button--secondary" onClick={handleSweepSession} disabled={loading || !sessionWallet}>
                  Sweep remainder
                </button>
              </div>
            </article>
          </div>

          <div className="stack">
            <article className="metric-board">
              <h3>Program controls</h3>
              <div className="detail-row">
                <span>Program ID</span>
                <strong>{programId ? shortenAddress(programId.toBase58(), 8) : "Missing"}</strong>
              </div>
              <div className="detail-row">
                <span>Vault init</span>
                <strong>{vault ? "Detected" : "Pending"}</strong>
              </div>
              <div className="detail-row">
                <span>Latest signature</span>
                <strong>{latestSignature ? shortenAddress(latestSignature, 8) : "None yet"}</strong>
              </div>
              <div className="button-row">
                <button className="button button--secondary" onClick={handleInitialize} disabled={loading || !connected || !programId}>
                  Initialize vault
                </button>
                <Link href="/docs" className="button button--secondary">
                  Review operator docs
                </Link>
              </div>
            </article>

            <article className="metric-board">
              <h3>Cycle actions</h3>
              <div className="action-grid">
                {ACTION_BUTTONS.map(([action, body]) => {
                  const cost = action in ACTION_COSTS ? `${formatSolFromLamports(ACTION_COSTS[action as keyof typeof ACTION_COSTS])} SOL` : "network call";
                  // Désactive toutes les actions sauf Resolve si le timer est à zéro
                  const isResolve = action === "Resolve";
                  const disabled = loading || !sessionWallet || !programId || (remainingSeconds === 0 && !isResolve);
                  return (
                    <button
                      key={action}
                      onClick={() => handleAction(action as keyof typeof ACTION_COSTS | "Resolve")}
                      disabled={disabled}
                    >
                      <strong>{action}</strong>
                      <small>{body}</small>
                      <small>Cost: {cost}</small>
                    </button>
                  );
                })}
                {/* Message explicite si le cycle est à résoudre */}
                {remainingSeconds === 0 && (
                  <div style={{color: '#ffb100', marginTop: 8, fontWeight: 500}}>
                    Cycle terminé : cliquez sur <b>Resolve</b> pour passer au suivant !
                  </div>
                )}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="dual-grid">
          <article className="copy-block">
            <p className="eyebrow">What to do next</p>
            <h2>From preview mode to live devnet</h2>
            <p>
              The site is already wired to use a real program ID once deployed. Until then, the terminal still acts as a
              complete front-end shell with session wallet flows, action builders, docs and responsive marketing pages.
            </p>
            <ul className="docs-list">
              <li>Deploy the program and expose NEXT_PUBLIC_NODUS_PROGRAM_ID.</li>
              <li>Use a premium devnet RPC if you want tighter live action latency.</li>
              <li>Keep session budgets bounded and sweep the remainder when done.</li>
            </ul>
          </article>

          <article className="metric-board">
            <h3>Recent cycles (live)</h3>
            <div className="history-row">Aucun historique on-chain disponible pour le moment.</div>
          </article>
        </div>
      </section>
    </>
  );
}
