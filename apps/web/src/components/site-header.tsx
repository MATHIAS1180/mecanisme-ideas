"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const nav = [
  ["Play", "/play"],
  ["Docs", "/docs"],
  ["History", "/history"],
  ["FAQ", "/faq"],
  ["About", "/about"],
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link href="/" className="brand-mark" aria-label="Nodus Protocol home">
          <span className="brand-mark__glyph">N</span>
          <span>
            <strong>Nodus</strong>
            <small>Protocol / Devnet</small>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          {nav.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>

        <WalletMultiButton className="wallet-button" />
      </div>
    </header>
  );
}
