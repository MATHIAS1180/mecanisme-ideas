#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROGRAM_KEYPAIR="${PROGRAM_KEYPAIR:-$ROOT_DIR/keys/nodus-devnet-program.json}"
RPC_URL="${RPC_URL:-https://api.devnet.solana.com}"
MANIFEST_PATH="$ROOT_DIR/programs/nodus/Cargo.toml"
PROGRAM_SO_DEFAULT_NAME="nodus_program.so"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_command cargo
require_command solana
require_command solana-keygen
require_command node

mkdir -p "$(dirname "$PROGRAM_KEYPAIR")"

if [[ ! -f "$PROGRAM_KEYPAIR" ]]; then
  echo "Creating devnet program keypair at $PROGRAM_KEYPAIR"
  solana-keygen new --no-bip39-passphrase -o "$PROGRAM_KEYPAIR" --silent
fi

echo "Using RPC: $RPC_URL"
solana config set --url "$RPC_URL" >/dev/null

echo "Building Nodus program for Solana SBF"
cargo build-sbf --manifest-path "$MANIFEST_PATH"

PROGRAM_SO="$(find "$ROOT_DIR" -path "*/target/deploy/$PROGRAM_SO_DEFAULT_NAME" | head -n 1)"
if [[ -z "$PROGRAM_SO" ]]; then
  echo "Unable to locate built program binary: $PROGRAM_SO_DEFAULT_NAME" >&2
  exit 1
fi

PROGRAM_ID="$(solana address -k "$PROGRAM_KEYPAIR")"
echo "Program ID: $PROGRAM_ID"
echo "Deploying $PROGRAM_SO to devnet"
solana program deploy --program-id "$PROGRAM_KEYPAIR" "$PROGRAM_SO"

echo "Writing web env file"
node "$ROOT_DIR/scripts/set-web-devnet-env.mjs" "$PROGRAM_ID" "$RPC_URL"

echo "Done. Next steps:"
echo "1. npm run build"
echo "2. commit the code changes only, not apps/web/.env.local"
echo "3. expose NEXT_PUBLIC_NODUS_PROGRAM_ID and NEXT_PUBLIC_SOLANA_RPC_URL in Vercel"
