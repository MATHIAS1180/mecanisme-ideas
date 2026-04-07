import React from "react";

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
          <div className="cycle">Aucun historique on-chain disponible pour le moment.</div>
        </div>
      </section>
    </>
  );
}
