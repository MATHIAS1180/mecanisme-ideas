import Link from "next/link";
import { features, homepageStats, timeline } from "../lib/site";

export default function HomePage() {
  return (
    <>
      <section className="hero shell">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Solana coordination protocol</p>
            <h1>Pressure becomes market structure.</h1>
            <p>
              Nodus Protocol turns timing, pressure and visible conviction into a deterministic on-chain cycle.
              No oracle. No randomness. No casino framing. Just a live terminal built for devnet first.
            </p>
            <div className="hero-actions">
              <Link href="/play" className="button button--primary">
                Open terminal
              </Link>
              <Link href="/docs" className="button button--secondary">
                Read the operating model
              </Link>
            </div>
          </div>

          <div className="hero-panel">
            <div className="terminal">
              <p className="eyebrow">Cycle state preview</p>
              <div className="terminal__row">
                <span className="terminal__label">Current leader</span>
                <strong className="terminal__value">8wQd...Jx5n</strong>
              </div>
              <div className="terminal__row">
                <span className="terminal__label">Pressure</span>
                <strong className="terminal__value">27</strong>
              </div>
              <div className="terminal__row">
                <span className="terminal__label">Reset if challenged now</span>
                <strong className="terminal__value">00:50</strong>
              </div>
              <div className="terminal__row">
                <span className="terminal__label">Carry-over loaded</span>
                <strong className="terminal__value">0.1200 SOL</strong>
              </div>
              <div className="terminal__row">
                <span className="terminal__label">Frame</span>
                <strong className="terminal__value">Devnet / Live</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tight shell">
        <div className="card-grid">
          {homepageStats.map((stat) => (
            <div key={stat.label} className="stat-pill">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
              <p className="muted">{stat.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section shell">
        <div className="page-title">
          <p className="eyebrow">Why this product exists</p>
          <h2>Built as a market terminal, not a toy.</h2>
          <p>
            Nodus is framed around leadership, timer compression, pressure and redistribution. The interface uses
            financial language end to end so the product stays aligned with the whitepaper and your positioning.
          </p>
        </div>
        <div className="card-grid">
          {features.map((feature) => (
            <article key={feature.title} className="card feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section shell">
        <div className="dual-grid">
          <article className="copy-block">
            <p className="eyebrow">Core cycle</p>
            <h2>One fixed entry, visible pressure, hard terminal lock.</h2>
            <p>
              The cycle starts when a participant takes leadership. Every irreversible action increases pressure.
              Deposit, anchor and a triggered snipe reset the timer. Blizzard, sabotage, shield and curse change
              the strategic surface without luck.
            </p>
            <ul className="docs-list">
              <li>Entry unit fixed at 0.01 SOL.</li>
              <li>2% protocol fee to the hard-coded wallet on settlement.</li>
              <li>Up to 5 active curses produce carry-over into the next cycle.</li>
              <li>Terminal lock guarantees finitude.</li>
            </ul>
          </article>

          <article className="metric-board">
            <h3>Launch profile</h3>
            <div className="metric-row">
              <span>Cluster</span>
              <strong>Solana devnet</strong>
            </div>
            <div className="metric-row">
              <span>Wallet UX</span>
              <strong>Session keypair</strong>
            </div>
            <div className="metric-row">
              <span>Frontend deployment</span>
              <strong>Vercel</strong>
            </div>
            <div className="metric-row">
              <span>Primary wallets</span>
              <strong>Phantom / Solflare</strong>
            </div>
          </article>
        </div>
      </section>

      <section className="section shell">
        <div className="page-title">
          <p className="eyebrow">Build path</p>
          <h2>Whitepaper first. Devnet execution second.</h2>
        </div>
        <div className="docs-grid">
          {timeline.map((item) => (
            <article key={item.phase} className="timeline-item">
              <p className="eyebrow">{item.phase}</p>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
