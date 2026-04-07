import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const [, , programIdArg, rpcUrlArg] = process.argv;

if (!programIdArg) {
  console.error("Usage: node scripts/set-web-devnet-env.mjs <PROGRAM_ID> [RPC_URL]");
  process.exit(1);
}

const targetPath = resolve("apps/web/.env.local");
const rpcUrl = rpcUrlArg || "https://api.devnet.solana.com";
const nextLines = [
  `NEXT_PUBLIC_SOLANA_RPC_URL=${rpcUrl}`,
  `NEXT_PUBLIC_NODUS_PROGRAM_ID=${programIdArg}`,
];

let existing = "";
if (existsSync(targetPath)) {
  existing = readFileSync(targetPath, "utf8");
}

const filtered = existing
  .split(/\r?\n/)
  .filter((line) => line && !line.startsWith("NEXT_PUBLIC_SOLANA_RPC_URL=") && !line.startsWith("NEXT_PUBLIC_NODUS_PROGRAM_ID="));

const output = [...filtered, ...nextLines].join("\n") + "\n";
writeFileSync(targetPath, output, "utf8");
console.log(`Updated ${targetPath}`);
console.log(`Program ID: ${programIdArg}`);
console.log(`RPC URL: ${rpcUrl}`);
