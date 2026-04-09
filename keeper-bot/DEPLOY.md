# Guide de Déploiement - Keeper Bot

Ce guide te montre comment déployer le keeper bot sur différentes plateformes.

## Prérequis

1. Keeper wallet créé et fundé
2. Private key en base58
3. Compte GitHub (pour Railway/Render)

## Étape 1: Créer le Keeper Wallet

```bash
cd keeper-bot
npm install
node create-wallet.js
```

Tu verras:
```
🎉 Keeper Wallet créé!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Public Key (adresse):
5s0BkFHa...

🔑 Private Key (base58) - GARDE ÇA SECRET:
3Xj8k9L2m...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**IMPORTANT**: Copie et garde la Private Key en sécurité!

## Étape 2: Funder le Keeper Wallet

### Sur Devnet

```bash
solana airdrop 1 <KEEPER_ADDRESS> --url devnet
```

Ou utilise le faucet: https://faucet.solana.com/

### Sur Mainnet

Envoie ~0.1 SOL depuis ton wallet principal.

## Étape 3: Choisir une Plateforme

### Option A: Railway.app (Recommandé) ⭐

**Avantages**: Gratuit, simple, fiable, 500h/mois

#### 1. Créer un compte

Va sur https://railway.app et connecte-toi avec GitHub.

#### 2. Nouveau projet

- Clique "New Project"
- Sélectionne "Deploy from GitHub repo"
- Autorise Railway à accéder à ton repo
- Sélectionne le repo `mecanisme-ideas`

#### 3. Configuration

Railway va détecter automatiquement le projet Node.js.

- Root Directory: `keeper-bot`
- Build Command: `npm install && npm run build`
- Start Command: `npm run deploy`

#### 4. Variables d'environnement

Clique sur "Variables" et ajoute:

```
SOLANA_RPC_URL=https://api.devnet.solana.com
NODUS_PROGRAM_ID=By9yf8mRvJq3mXG2QE8nagNyZ5PCUJrfsikZUzk8otTo
KEEPER_PRIVATE_KEY=<ta_private_key_base58>
```

#### 5. Deploy

Clique "Deploy" et c'est parti! 🚀

#### 6. Vérifier les logs

Clique sur "Deployments" > "View Logs" pour voir:

```
🤖 Keeper Bot initialized
📍 Vault PDA: 8T7zNaa7...
👛 Keeper Wallet: 5s0BkFHa...
💰 Keeper balance: 1.0 SOL
🚀 Keeper Bot started
⏱️ Cycle #1: 45s remaining
```

---

### Option B: Render.com

**Avantages**: Gratuit, bon uptime

#### 1. Créer un compte

Va sur https://render.com et connecte-toi avec GitHub.

#### 2. Nouveau service

- Clique "New +"
- Sélectionne "Background Worker"
- Connect ton repo GitHub
- Sélectionne le repo `mecanisme-ideas`

#### 3. Configuration

```
Name: nodus-keeper-bot
Root Directory: keeper-bot
Build Command: npm install && npm run build
Start Command: npm run deploy
```

#### 4. Variables d'environnement

Ajoute les mêmes variables que Railway:

```
SOLANA_RPC_URL=https://api.devnet.solana.com
NODUS_PROGRAM_ID=By9yf8mRvJq3mXG2QE8nagNyZ5PCUJrfsikZUzk8otTo
KEEPER_PRIVATE_KEY=<ta_private_key_base58>
```

#### 5. Deploy

Clique "Create Background Worker" et c'est parti! 🚀

---

### Option C: Fly.io

**Avantages**: Gratuit (3 apps), performant

#### 1. Installer Fly CLI

```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

#### 2. Login

```bash
fly auth login
```

#### 3. Créer l'app

```bash
cd keeper-bot
fly launch --no-deploy
```

Réponds aux questions:
- App name: `nodus-keeper-bot` (ou autre)
- Region: Choisis la plus proche
- PostgreSQL: Non
- Redis: Non

#### 4. Configurer les secrets

```bash
fly secrets set KEEPER_PRIVATE_KEY=<ta_private_key_base58>
fly secrets set NODUS_PROGRAM_ID=By9yf8mRvJq3mXG2QE8nagNyZ5PCUJrfsikZUzk8otTo
fly secrets set SOLANA_RPC_URL=https://api.devnet.solana.com
```

#### 5. Deploy

```bash
fly deploy
```

#### 6. Vérifier les logs

```bash
fly logs
```

---

### Option D: VPS (DigitalOcean, Hetzner, etc.)

**Avantages**: Plus de contrôle
**Coût**: ~$5-10/mois

#### 1. Créer un VPS

Crée un VPS Ubuntu 22.04 sur DigitalOcean, Hetzner, ou autre.

#### 2. Se connecter

```bash
ssh root@<ip_du_vps>
```

#### 3. Installer Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
```

#### 4. Cloner le repo

```bash
git clone https://github.com/<ton_username>/mecanisme-ideas.git
cd mecanisme-ideas/keeper-bot
npm install
npm run build
```

#### 5. Créer .env

```bash
cat > .env << EOF
SOLANA_RPC_URL=https://api.devnet.solana.com
NODUS_PROGRAM_ID=By9yf8mRvJq3mXG2QE8nagNyZ5PCUJrfsikZUzk8otTo
KEEPER_PRIVATE_KEY=<ta_private_key_base58>
EOF
```

#### 6. Installer PM2

```bash
npm install -g pm2
```

#### 7. Lancer le keeper

```bash
pm2 start dist/keeper.js --name nodus-keeper
pm2 save
pm2 startup
```

#### 8. Vérifier les logs

```bash
pm2 logs nodus-keeper
```

---

## Monitoring

### Vérifier que le keeper fonctionne

#### Railway/Render
- Va dans "Logs" sur le dashboard
- Tu devrais voir les messages du keeper

#### Fly.io
```bash
fly logs
```

#### VPS
```bash
pm2 logs nodus-keeper
```

### Logs normaux

```
⏱️ Cycle #1: 30s remaining
⏱️ Cycle #1: 15s remaining
⏱️ Cycle #1: 0s remaining
⚡ Cycle #1 expired! Sending Deposit to trigger auto-resolve...
✅ Deposit sent! Signature: 2ZE7x...
🔗 https://explorer.solana.com/tx/2ZE7x...?cluster=devnet
🎉 Cycle #1 resolved! Keeper is now leader of new cycle.
```

### Alertes

Si tu vois:
- `⚠️ Low balance!` → Fund le keeper wallet
- `❌ Error` → Vérifie les logs et la config

## Maintenance

### Mettre à jour le keeper

#### Railway/Render
Push sur GitHub, le redéploiement est automatique.

#### Fly.io
```bash
fly deploy
```

#### VPS
```bash
cd mecanisme-ideas/keeper-bot
git pull
npm install
npm run build
pm2 restart nodus-keeper
```

### Vérifier le balance

```bash
solana balance <KEEPER_ADDRESS> --url devnet
```

Si < 0.01 SOL, refund:
```bash
solana airdrop 1 <KEEPER_ADDRESS> --url devnet
```

## Troubleshooting

### "Insufficient balance"
```bash
solana airdrop 1 <KEEPER_ADDRESS> --url devnet
```

### "Vault not found"
Vérifie que `NODUS_PROGRAM_ID` est correct.

### "Cannot find module '@nodus/sdk'"
Le keeper bot a besoin du SDK. Assure-toi que le monorepo est bien configuré:
```bash
cd mecanisme-ideas
npm install
```

### Le keeper ne démarre pas
Vérifie les variables d'environnement:
```bash
echo $KEEPER_PRIVATE_KEY
echo $NODUS_PROGRAM_ID
```

## Coûts

| Plateforme | Devnet | Mainnet |
|------------|--------|---------|
| Railway    | Gratuit | Gratuit |
| Render     | Gratuit | Gratuit |
| Fly.io     | Gratuit | Gratuit |
| VPS        | $5-10/mois | $5-10/mois |

Transactions:
- Devnet: Gratuit
- Mainnet: ~0.000005 SOL par resolve (~$0.001)

## Sécurité

✅ Utilise un wallet dédié (pas ton wallet principal)
✅ Garde la private key secrète
✅ Ne commit JAMAIS la private key dans Git
✅ Utilise des variables d'environnement
✅ Balance minimale (~0.1 SOL suffit)

## Support

Questions? Voir `KEEPER_BOT_SOLUTION.md` ou ouvre une issue sur GitHub.
