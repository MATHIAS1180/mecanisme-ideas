import { faq } from "../../lib/site";

export default function FaqPage() {
  return (
    <>
      <section className="page-title shell">
        <p className="eyebrow">FAQ</p>
        <h1>Questions operators will ask first.</h1>
        <p>
          These answers are written in product language, not legalese, so the user immediately understands the operating
          model and the devnet framing.
        </p>
      </section>

      <section className="section shell">
        <div className="faq-grid">
          {faq.map((item) => (
            <article key={item.q} className="faq-item">
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
