import { homepageStats, timeline } from "../../lib/site";

export default function DocsPage() {
  return (
    <>
      <section className="page-title shell">
        <p className="eyebrow">Operating model</p>
        <h1>Whitepaper execution notes.</h1>
        <p>
          This page condenses the V1 build assumptions directly from the whitepaper so operators, designers and devs
          can reason about the product without re-reading the full document every time.
        </p>
      </section>

      <section className="section shell">
        <div className="docs-grid">
          <article className="copy-block">
            <h2>Cycle mechanics</h2>
            <ul className="docs-list">
              <li>Deposit takes leadership and resets the timer according to current pressure.</li>
              <li>Shield, sabotage, curse and blizzard are paid actions that do not reset the timer.</li>
              <li>Anchor costs two entries and restores breathing room without clearing pressure.</li>
              <li>Terminal lock blocks new paid actions once pressure reaches the hard threshold.</li>
              <li>Resolve can be called by anyone after expiry.</li>
            </ul>
          </article>

          <article className="copy-block">
            <h2>Session wallet policy</h2>
            <ul className="docs-list">
              <li>One main wallet signature to fund a bounded session budget.</li>
              <li>All cycle actions are then signed locally by the session keypair.</li>
              <li>The site never gets unlimited approval over the main wallet.</li>
              <li>Users should sweep the remaining session balance when finished.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section shell">
        <div className="card-grid">
          {homepageStats.map((stat) => (
            <article key={stat.label} className="card">
              <h3>{stat.label}</h3>
              <p>{stat.value}</p>
              <p className="muted">{stat.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section shell">
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
