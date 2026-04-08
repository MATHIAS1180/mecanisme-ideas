export const homepageStats = [
  { label: "Entry", value: "0.01 SOL", note: "fixed unit" },
  { label: "Protocol fee", value: "2%", note: "on settlement" },
  { label: "Minimum timer", value: "~19s", note: "pressure floor" },
  { label: "Session signing", value: "1 popup", note: "then local actions" },
];

export const features = [
  {
    title: "Deterministic redistribution",
    body: "No oracle, no randomness, no off-chain event source. Leadership, pressure and resolution are derived only from Solana state.",
  },
  {
    title: "Strategic asymmetry",
    body: "Shield, sabotage, anchor, curse, blizzard and snipe modify tempo without ever introducing luck.",
  },
  {
    title: "Session wallet UX",
    body: "The primary wallet signs the budget transfer once. The session keypair signs every cycle action locally after that.",
  },
  {
    title: "Live terminal interface",
    body: "Real-time cycle telemetry with pressure tracking, countdown timer, and immediate on-chain action feedback.",
  },
];

export const faq = [
  {
    q: "What is Nodus Protocol?",
    a: "Nodus is a deterministic on-chain coordination protocol on Solana. The last participant to hold leadership when the timer expires wins the cycle. Every action is visible, irreversible and affects the cycle dynamics.",
  },
  {
    q: "Is this a lottery?",
    a: "No. The protocol is deterministic. Outcomes depend on wallet actions, timing, cooldown and the encoded cycle rules. There is no randomness.",
  },
  {
    q: "How do I participate?",
    a: "Connect your Phantom or Solflare wallet, fund a session wallet with a budget you choose, then use the terminal to take actions during active cycles.",
  },
  {
    q: "What is a session wallet?",
    a: "A temporary keypair that signs cycle actions locally without requiring popup approval for each transaction. You fund it once from your main wallet with a capped budget.",
  },
  {
    q: "What actions can I take?",
    a: "Deposit (take leadership), Shield (protect your position), Sabotage (cut opponent's time), Anchor (buy more time), Curse (reduce winner payout), Blizzard (add to pot), and ArmSnipe (trap next deposit).",
  },
  {
    q: "How much does each action cost?",
    a: "Most actions cost 0.01 SOL (one entry). Anchor costs 0.02 SOL (two entries). All costs are fixed and visible before you act.",
  },
  {
    q: "What is pressure?",
    a: "A counter that increases with each irreversible action. Higher pressure compresses the timer, making future resets shorter. At pressure 40, the cycle enters terminal lock.",
  },
  {
    q: "What is terminal lock?",
    a: "When pressure reaches 40, no more paid actions are accepted. The cycle must resolve. This guarantees every cycle ends.",
  },
  {
    q: "How do I win?",
    a: "Be the leader when the timer expires. The winner receives 98% of the pot minus any active curses. 2% goes to the protocol.",
  },
  {
    q: "What is carry-over?",
    a: "Each curse reduces the winner's payout by 1% and adds that amount to the next cycle's starting pot. Maximum 5 curses per cycle.",
  },
  {
    q: "Can I get my session wallet funds back?",
    a: "Yes. Use the sweep function to return any remaining balance to your main wallet at any time.",
  },
  {
    q: "Is this on mainnet?",
    a: "No. This is a devnet beta. All transactions use devnet SOL which has no real value. This is for testing and validation only.",
  },
];

export const legalBullets = [
  "Devnet beta - all SOL is devnet SOL (no real value).",
  "No promise of passive yield or guaranteed profit.",
  "Every action is a user-initiated Solana transaction.",
  "Outcomes are deterministic, not random.",
  "Session wallet budget is capped - sweep remaining funds anytime.",
];
