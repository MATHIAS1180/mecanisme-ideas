"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const nav = [
  ["Play", "/play"],
  ["History", "/history"],
  ["FAQ", "/faq"],
  ["About", "/about"],
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link href="/" className="brand-mark" aria-label="Nodus Protocol home">
          <span className="brand-mark__glyph" aria-hidden="true">N</span>
          <span>
            <strong>Nodus</strong>
            <small>Protocol / <span className="devnet-badge">Devnet</span></small>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          {nav.map(([label, href]) => (
            <Link 
              key={href} 
              href={href}
              className={pathname === href ? "active" : ""}
              aria-current={pathname === href ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>

        <WalletMultiButton className="wallet-button" />
      </div>
    </header>
  );
}
