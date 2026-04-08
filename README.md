# Nodus Protocol

Nodus Protocol is a deterministic on-chain coordination protocol on Solana devnet.

## 🎮 Live on Devnet

**Program ID:** `5jtFgAFEeHn7Y7Qh5gS5axc8gWVPRnuekFey1P4cee2x`  
**Network:** Solana Devnet  
**RPC:** https://api.devnet.solana.com

## What is Nodus?

Nodus is a live cycle where participants compete for leadership through timing and strategic actions. The last participant holding leadership when the timer expires wins the redistribution. Every action is visible on-chain, costs a fixed entry, and affects the cycle dynamics through the pressure system.

## Core Mechanics

- **Fixed Entry:** 0.01 SOL per action (devnet)
- **Pressure System:** Accumulates with each action, compressing future timer resets
- **Terminal Lock:** At pressure 40, no more paid actions accepted - cycle must resolve
- **Redistribution:** Winner receives 98% of pot minus curses, 2% protocol fee
- **Carry-over:** Up to 5% of pot can carry to next cycle via curse mechanic

## Special Actions

- **Deposit:** Take leadership, reset timer (1 entry)
- **Shield:** Leader-only, block deposits temporarily (1 entry)
- **Sabotage:** Non-leader, halve remaining time (1 entry, max 2/wallet)
- **Anchor:** Leader-only, reset to max time (2 entries, max 2/cycle)
- **Curse:** Reduce winner payout, add to next cycle (1 entry, max 5/cycle)
- **Blizzard:** Add to pot without leadership (1 entry)
- **ArmSnipe:** Trap next deposit (1 entry, 60s expiry)

## Session Wallet

The protocol uses a session wallet system for smooth UX:
1. Fund a session wallet once from your main wallet
2. All cycle actions are signed locally by the session wallet
3. No popup for each action
4. Sweep remaining balance back to main wallet anytime

## Getting Started

1. Connect Phantom or Solflare wallet
2. Fund a session wallet with your chosen budget
3. Open the terminal at `/play`
4. Take actions during active cycles

## Network

- **Cluster:** Solana devnet
- **Program ID:** Set via environment variable
- **RPC:** Devnet public RPC
- **Wallets:** Phantom, Solflare

## Important Notes

- This is a **devnet beta** - all SOL is devnet SOL (no real value)
- Every action is an on-chain transaction
- Outcomes are deterministic, not random
- No external oracles or off-chain dependencies

## Documentation

- `WHITEPAPER.md` - Original specification
- `volta_whitepaper_v2.md` - Complete V2 specification with all mechanics
- `/faq` - Frequently asked questions
- `/about` - Protocol overview

## Stack

- Frontend: Next.js 15, React 19, TypeScript
- Program: Rust native (solana-program)
- SDK: TypeScript (@nodus/sdk)
- Wallets: Solana wallet adapter

## License

See repository for license information.
