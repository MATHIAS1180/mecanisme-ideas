export const homepageStats = [
  { label: "Entry", value: "0.01 SOL", note: "fixed unit" },
  { label: "Protocol fee", value: "2%", note: "hard-coded" },
  { label: "Minimum timer", value: "15s", note: "devnet floor" },
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
    title: "Terminal-grade interface",
    body: "The product is framed as a live financial terminal with live pressure, cycle state, countdown and settlement context.",
  },
];

export const timeline = [
  {
    phase: "Phase A",
    title: "Economic core",
    body: "Initialize, deposit, resolve, pressure curve, terminal lock and carry-over.",
  },
  {
    phase: "Phase B",
    title: "Session UX",
    body: "Session wallet funding, sweep, balance view and live countdown.",
  },
  {
    phase: "Phase C",
    title: "Core special actions",
    body: "Blizzard, curse and shield to unlock the first strategic loop.",
  },
  {
    phase: "Phase D",
    title: "Advanced actions",
    body: "Sabotage, anchor, arm snipe and reclaim snipe complete the V1 whitepaper.",
  },
];

export const faq = [
  {
    q: "Is Nodus a lottery?",
    a: "No. The protocol is deterministic. Outcomes depend on wallet actions, timing, cooldown and the encoded cycle rules.",
  },
  {
    q: "Why use a session wallet?",
    a: "Without it, every action would require a main wallet popup. The session wallet keeps the loop playable while preserving a capped explicit budget.",
  },
  {
    q: "Why start on devnet?",
    a: "Devnet is the right place to validate timing, latency, cycle readability and responsive UX before any mainnet hardening.",
  },
  {
    q: "Can the team pause the protocol?",
    a: "The target end state is a non-upgradeable program with fixed rules and a hard-coded 2% protocol fee wallet after audit and mainnet readiness.",
  },
];

export const legalBullets = [
  "Devnet only for the initial launch path.",
  "No promise of passive yield or guaranteed profit.",
  "Every action is a user-initiated Solana transaction.",
  "The site must never use casino language in interface or marketing.",
  "Users should understand the session wallet budget and sweep remaining funds when done.",
];
