"use client";

import "@solana/wallet-adapter-react-ui/styles.css";

import { ReactNode } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { DEFAULT_RPC_URL } from "@nodus/sdk";

const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || DEFAULT_RPC_URL;

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
