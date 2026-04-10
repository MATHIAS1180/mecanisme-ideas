import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__inner">
        <div>
          <p className="eyebrow">Nodus Protocol</p>
          <p className="muted">
            Coordination under pressure. Solana devnet first, deterministic by design.
          </p>
        </div>

        <div className="footer-links">
          <Link href="/legal">Legal</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/play">Launch terminal</Link>
        </div>
      </div>
    </footer>
  );
}
