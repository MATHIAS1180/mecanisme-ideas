# Nodus Keeper Bot

Service automatique qui résout les cycles expirés en envoyant des transactions Deposit.

## Comment ça marche

1. Le keeper bot surveille le vault toutes les 5 secondes
2. Quand le timer expire (0:00), il envoie automatiquement un Deposit
3. Le Deposit déclenche l'auto-resolve dans le smart contract
4. Le cycle est résolu, un nouveau cycle démarre
5. Le keeper devient le leader du nouveau cycle

## Installation

### 1. Créer un Keeper Wallet

```bash
cd keeper-bot
npm install
node create-wallet.js
```

Copie la Private Key affichée (garde-la secrète!).

### 2. Funder le Keeper Wallet

Sur devnet:
```bash
solana airdrop 1 <KEEPER_ADDRESS> --url devnet
```

Sur mainnet:
```bash
# Envoie ~0.1 SOL depuis ton wallet
```

### 3. Configuration

Crée un fichier `.env`:

```bash
cp .env.example .env
```

Édite `.env` et ajoute ta KEEPER_PRIVATE_KEY.

### 4. Test Local

```bash
npm run dev
```

Tu devrais voir:
```
🤖 Keeper Bot initialized
📍 Vault PDA: 8T7zNaa7WJQXPJkBrp4GAUDKDgj32p8RjSxyhX8Rr6zP
👛 Keeper Wallet: <ton_adresse>
💰 Keeper balance: 1.0 SOL
🚀 Keeper Bot started
⏱️ Cycle #1: 45s remaining
```

## Déploiement

### Option 1: Railway.app (Recommandé)

1. Crée un compte sur https://railway.app
2. New Project > Deploy from GitHub
3. Sélectionne ton repo
4. Configure les variables d'environnement:
   - `SOLANA_RPC_URL`
   - `NODUS_PROGRAM_ID`
   - `KEEPER_PRIVATE_KEY`
5. Deploy!

**Coût**: Gratuit (500h/mois)

### Option 2: Render.com

1. Crée un compte sur https://render.com
2. New > Background Worker
3. Connect GitHub repo
4. Build Command: `npm install && npm run build`
5. Start Command: `npm run deploy`
6. Ajoute les variables d'environnement
7. Deploy!

**Coût**: Gratuit

### Option 3: Fly.io

```bash
# Installe Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch
fly launch

# Set secrets
fly secrets set KEEPER_PRIVATE_KEY=<key>
fly secrets set NODUS_PROGRAM_ID=By9yf8mRvJq3mXG2QE8nagNyZ5PCUJrfsikZUzk8otTo

# Deploy
fly deploy
```

**Coût**: Gratuit (3 apps)

## Monitoring

Le keeper bot log toutes ses actions:

```
⏱️ Cycle #1: 30s remaining
⏱️ Cycle #1: 15s remaining
⏱️ Cycle #1: 0s remaining
⚡ Cycle #1 expired! Sending Deposit to trigger auto-resolve...
✅ Deposit sent! Signature: 2ZE7x...
🔗 https://explorer.solana.com/tx/2ZE7x...?cluster=devnet
🎉 Cycle #1 resolved! Keeper is now leader of new cycle.
```

## Sécurité

- ✅ Wallet dédié (pas ton wallet principal)
- ✅ Balance minimale (~0.1 SOL suffit)
- ✅ Private key en variable d'environnement
- ✅ Pas de risque de perte (juste des frais de transaction)

## Coûts

### Devnet
- Hébergement: Gratuit
- Transactions: Gratuit
- Total: 0€/mois

### Mainnet
- Hébergement: Gratuit
- Transactions: ~0.000005 SOL par resolve
- Total: ~0.01 SOL/mois (~$2-3/mois)

## Troubleshooting

### "Insufficient balance"
Fund le keeper wallet:
```bash
solana airdrop 1 <KEEPER_ADDRESS> --url devnet
```

### "Vault not found"
Vérifie que le NODUS_PROGRAM_ID est correct.

### "Timer not expired"
Normal! Le keeper attend que le timer expire.

## Support

Pour plus d'infos, voir `KEEPER_BOT_SOLUTION.md` dans le repo principal.
