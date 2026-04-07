# Deploy Nodus on Solana Devnet

This document is the operator path for deploying the Nodus program to Solana devnet and wiring the resulting program id into the web app.

## Scope

This procedure covers:

- local prerequisites
- building the native Solana program
- deploying the program to devnet
- wiring NEXT_PUBLIC_NODUS_PROGRAM_ID into the Next.js app
- preparing the same variables for Vercel

## Preconditions

You need these tools on the machine that performs the deploy:

- Rust via rustup
- Solana CLI
- solana-keygen
- Node.js and npm

The current container used for development in this repo has Rust and Node, but not Solana CLI. That means the codebase is ready, but the actual devnet deploy must be run from a machine where Solana CLI is installed.

## 1. Install Solana CLI

Official installer example:

```bash
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
```

Then reload your shell and verify:

```bash
solana --version
solana-keygen --version
```

## 2. Configure your wallet for devnet

If needed, create or choose the deployer keypair:

```bash
solana-keygen new -o ~/.config/solana/id.json
```

Point Solana to devnet:

```bash
solana config set --url https://api.devnet.solana.com
solana config set --keypair ~/.config/solana/id.json
solana balance
```

Fund the deployer wallet with devnet SOL:

```bash
solana airdrop 2
```

## 3. Deploy with the provided script

From the repository root:

```bash
bash scripts/deploy-devnet.sh
```

What this script does:

- creates a persistent program keypair in keys/nodus-devnet-program.json if missing
- builds the Rust program in SBF mode
- deploys the program to Solana devnet
- computes the program id from the program keypair
- writes apps/web/.env.local with:
  - NEXT_PUBLIC_SOLANA_RPC_URL
  - NEXT_PUBLIC_NODUS_PROGRAM_ID

Optional overrides:

```bash
PROGRAM_KEYPAIR=/absolute/path/to/program-keypair.json RPC_URL=https://api.devnet.solana.com bash scripts/deploy-devnet.sh
```

## 4. Manual alternative

If you do not want to use the helper script, the manual flow is:

```bash
cargo build-sbf --manifest-path programs/nodus/Cargo.toml
solana program deploy --program-id keys/nodus-devnet-program.json target/deploy/nodus_program.so
solana address -k keys/nodus-devnet-program.json
node scripts/set-web-devnet-env.mjs <PROGRAM_ID> https://api.devnet.solana.com
```

If the generated .so ends up in a different target directory on your machine, locate it first:

```bash
find . -path '*/target/deploy/nodus_program.so'
```

## 5. Run the web app against devnet

Once apps/web/.env.local exists:

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000/play
```

The Play page will switch from preview mode to live devnet mode as soon as NEXT_PUBLIC_NODUS_PROGRAM_ID is present.

## 6. Configure Vercel

In the Vercel project settings, add these environment variables:

- NEXT_PUBLIC_SOLANA_RPC_URL
- NEXT_PUBLIC_NODUS_PROGRAM_ID

Recommended values for devnet:

- NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
- NEXT_PUBLIC_NODUS_PROGRAM_ID=<your deployed program id>

If you move to a premium RPC later, update the RPC URL in both Vercel and your local .env.local.

## 7. Verification checklist

After deployment, verify:

- solana program show <PROGRAM_ID>
- the landing page builds successfully
- /play no longer shows the missing program id notice
- initialize can be sent from the UI
- the wallet fee displayed in the UI is FC2km6B1ub8fBf4FdLFs1hbJjmLx6EJbdAzN9Ajnb8nt

## 8. Important notes

- Do not commit apps/web/.env.local
- Do not lose keys/nodus-devnet-program.json if you want to keep redeploying the same devnet program id
- Keep the deployer wallet funded on devnet for redeploys
- The current program is compile-checked, but final devnet behavior should still be exercised end to end from the UI

## 9. Recommended next move

After the first deploy, run a full manual flow:

1. initialize
2. fund a session wallet
3. deposit
4. trigger one or two special actions
5. resolve a cycle

That is the fastest way to validate the whitepaper against real devnet timing.
