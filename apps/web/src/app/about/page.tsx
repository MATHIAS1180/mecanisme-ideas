export default function AboutPage() {
  return (
    <>
      <section className="page-title shell">
        <p className="eyebrow">About</p>
        <h1>A deterministic coordination protocol.</h1>
        <p>
          Nodus is a live on-chain cycle where timing, pressure and strategic actions determine outcomes.
          No randomness. No external oracles. Pure on-chain coordination.
        </p>
      </section>

      <section className="section shell">
        <div className="dual-grid">
          <article className="copy-block">
            <h2>How it works</h2>
            <p>
              Each cycle starts when someone takes leadership. The timer counts down based on current pressure.
              Other participants can take leadership, use special actions to modify the cycle, or wait for the right moment.
              The last leader when the timer expires wins the redistribution.
            </p>
          </article>
          <article className="copy-block">
            <h2>Core principles</h2>
            <p>
              Every action costs a fixed entry (0.01 SOL on devnet). Every action is visible on-chain immediately.
              Pressure accumulates with each action, compressing future timer resets. Terminal lock at pressure 40
              guarantees every cycle ends.
            </p>
          </article>
        </div>
      </section>

      <section className="section shell">
        <div className="copy-block">
          <h2>Special actions</h2>
          <ul className="docs-list">
            <li><strong>Deposit:</strong> Take leadership and reset the timer based on current pressure.</li>
            <li><strong>Shield:</strong> Leader-only. Block deposits temporarily (costs 1 entry).</li>
            <li><strong>Sabotage:</strong> Non-leader only. Cut remaining time in half (costs 1 entry, max 2 per wallet).</li>
            <li><strong>Anchor:</strong> Leader-only. Reset timer to maximum (costs 2 entries, max 2 per cycle).</li>
            <li><strong>Curse:</strong> Reduce winner payout by 1%, add to next cycle (costs 1 entry, max 5 per cycle).</li>
            <li><strong>Blizzard:</strong> Add to pot without taking leadership (costs 1 entry).</li>
            <li><strong>ArmSnipe:</strong> Trap the next deposit attempt (costs 1 entry, expires after 60s).</li>
          </ul>
        </div>
      </section>

      <section className="section shell">
        <div className="copy-block">
          <h2>Devnet beta</h2>
          <p>
            This is a beta deployment on Solana devnet. All SOL used is devnet SOL (no real value).
            The protocol is being tested for timing, UX and cycle dynamics before any mainnet consideration.
          </p>
        </div>
      </section>
    </>
  );
}
