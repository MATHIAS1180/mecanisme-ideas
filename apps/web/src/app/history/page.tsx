import { mockCycles } from "../../lib/mock-data";

export default function HistoryPage() {
  return (
    <>
      <section className="page-title shell">
        <p className="eyebrow">History</p>
        <h1>Settlement memory is the moat.</h1>
        <p>
          The long-term product advantage is not only code. It is the growing public archive of cycles, winners,
          pressure profiles and settlement credibility.
        </p>
      </section>

      <section className="section shell">
        <div className="history-grid">
          {mockCycles.map((cycle) => (
            <article key={`${cycle.cycle}-${cycle.status}`} className="card">
              <p className="eyebrow">Cycle {cycle.cycle}</p>
              <h3>{cycle.status === "active" ? "Active cycle" : "Resolved cycle"}</h3>
              <div className="metric-row">
                <span>Pot</span>
                <strong>{cycle.potSol} SOL</strong>
              </div>
              <div className="metric-row">
                <span>Winner</span>
                <strong>{cycle.winner}</strong>
              </div>
              <div className="metric-row">
                <span>Payout</span>
                <strong>{cycle.payoutSol}</strong>
              </div>
              <div className="metric-row">
                <span>Pressure</span>
                <strong>{cycle.pressure}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
