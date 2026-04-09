# Démarrage Rapide - Keeper Bot

Guide ultra-rapide pour déployer le keeper bot en 5 minutes.

## 1. Créer le Wallet (1 min)

```bash
cd keeper-bot
npm install
node create-wallet.js
```

Copie la **Private Key** affichée.

## 2. Funder le Wallet (1 min)

```bash
solana airdrop 1 <ADRESSE_DU_KEEPER> --url devnet
```

Ou utilise https://faucet.solana.com/

## 3. Déployer sur Railway (3 min)

### A. Créer un compte
- Va sur https://railway.app
- Connecte-toi avec GitHub

### B. Nouveau projet
- Clique "New Project"
- "Deploy from GitHub repo"
- Sélectionne ton repo

### C. Configuration
- Root Directory: `keeper-bot`
- Ajoute les variables:
  ```
  SOLANA_RPC_URL=https://api.devnet.solana.com
  NODUS_PROGRAM_ID=By9yf8mRvJq3mXG2QE8nagNyZ5PCUJrfsikZUzk8otTo
  KEEPER_PRIVATE_KEY=<ta_private_key>
  ```

### D. Deploy
- Clique "Deploy"
- Attends 1-2 minutes
- Vérifie les logs

## 4. Vérifier (30 sec)

Dans les logs Railway, tu devrais voir:

```
🤖 Keeper Bot initialized
📍 Vault PDA: 8T7zNaa7...
👛 Keeper Wallet: 5s0BkFHa...
💰 Keeper balance: 1.0 SOL
🚀 Keeper Bot started
⏱️ Cycle #1: 45s remaining
```

## C'est tout! 🎉

Le keeper bot va maintenant:
- ✅ Surveiller le vault automatiquement
- ✅ Résoudre les cycles expirés
- ✅ Garder le jeu fluide

## Troubleshooting

### "KEEPER_PRIVATE_KEY not set"
Vérifie que tu as bien ajouté la variable sur Railway.

### "Insufficient balance"
Fund le keeper wallet:
```bash
solana airdrop 1 <ADRESSE> --url devnet
```

### "Vault not found"
Vérifie que le NODUS_PROGRAM_ID est correct.

## Prochaines Étapes

- Voir `DEPLOY.md` pour d'autres options de déploiement
- Voir `README.md` pour plus de détails
- Voir `KEEPER_BOT_SOLUTION.md` pour la doc complète
