export default function AboutPage() {
  return (
    <>
      <section className="page-title shell">
        <p className="eyebrow">About</p>
        <h1>A financial coordination product, not a theme.</h1>
        <p>
          Nodus is designed around a simple requirement: keep the mechanism deterministic, legible, on-chain and
          emotionally intense without slipping into lottery framing.
        </p>
      </section>

      <section className="section shell">
        <div className="dual-grid">
          <article className="copy-block">
            <h2>Vision</h2>
            <p>
              The product should feel like a condensed market surface. The user sees pressure, leadership, time risk,
              carry-over and protocol fee in one place, then decides whether to act.
            </p>
          </article>
          <article className="copy-block">
            <h2>Design direction</h2>
            <p>
              The interface deliberately uses a high-end terminal aesthetic: dense telemetry, cold color contrast,
              tactile controls, responsive grids and motion encoded in the information hierarchy rather than casino fluff.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
