import { legalBullets } from "../../lib/site";

export default function LegalPage() {
  return (
    <>
      <section className="page-title shell">
        <p className="eyebrow">Legal and framing</p>
        <h1>Devnet-first disclosure.</h1>
        <p>
          This launch phase is designed for devnet validation. The product copy avoids casino terminology and does not
          promise profit, yield or passive return.
        </p>
      </section>

      <section className="section shell">
        <article className="copy-block">
          <h2>Operator disclosure</h2>
          <ul className="legal-list">
            {legalBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </>
  );
}
