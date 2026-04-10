import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { Providers } from "../components/providers";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://nodus.protocol'),
  title: {
    default: "Nodus Protocol - Solana Coordination Terminal",
    template: "%s | Nodus Protocol"
  },
  description: "Deterministic on-chain coordination protocol on Solana. Leadership, pressure and redistribution without randomness. Devnet beta.",
  keywords: ["Solana", "DeFi", "coordination protocol", "on-chain", "deterministic", "devnet", "terminal"],
  authors: [{ name: "Nodus Protocol Team" }],
  creator: "Nodus Protocol",
  publisher: "Nodus Protocol",
  
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Nodus Protocol",
    title: "Nodus Protocol - Solana Coordination Terminal",
    description: "Deterministic on-chain coordination protocol on Solana. Leadership, pressure and redistribution without randomness.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nodus Protocol Terminal"
      }
    ]
  },
  
  twitter: {
    card: "summary_large_image",
    title: "Nodus Protocol - Solana Coordination Terminal",
    description: "Deterministic on-chain coordination protocol on Solana.",
    images: ["/twitter-image.png"],
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
    ],
  },
  
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Nodus Protocol",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Deterministic on-chain coordination protocol on Solana devnet",
    "url": "https://nodus.protocol",
    "author": {
      "@type": "Organization",
      "name": "Nodus Protocol"
    }
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${display.variable} ${mono.variable}`}>
        <Providers>
          <div className="page-frame">
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
