# Solution Keeper Bot - Auto-Resolve Automatique

## Problème

Le cycle reste bloqué à 0:00 car personne n'envoie de transaction pour déclencher l'auto-resolve du smart contract.

## Solution: Keeper Bot

Un service backend qui surveille le vault et envoie automatiquement un **Deposit** quand le timer expire. Le Deposit déclenche l'auto-resolve dans le smart contract!

### Pourquoi Deposit et pas Resolve?

1. **Pas besoin de modifier le smart contract** - Le Deposit déclenche déjà l'auto-resolve
2. **Déploiement immédiat** - Pas besoin de redéployer le program
3. **Simple et efficace** - Le keeper devient aussi un joueur
4. **Récupération des fonds** - Le keeper peut récupérer ses SOL après

## Architecture

```
┌─────────────────┐
│   Keeper Bot    │
│  (Backend Node) │
└────────┬────────┘
         │
         │ Surveille via WebSocket
         ▼
┌─────────────────┐
│   Vault PDA     │
│  (On-Chain)     │
└────────┬────────┘
         │
         │ Timer = 0?
         ▼
┌─────────────────┐
│ Envoie Deposit  │
│ → Auto-Resolve  │
│ → Nouveau Cycle │
└─────────────────┘
```

## Fonctionnement

### 1. Surveillance Continue

Le keeper bot check le vault toutes les 5 secondes:

```typescript
while (true) {
  const vault = await fetchVault();
  const slotsLeft = calculateRemainingSlots(vault);
  
  if (slotsLeft === 0 && vault.leader !== default) {
    // Timer expiré! Envoyer Deposit
    await sendDeposit();
  }
  
  await sleep(5000);
}
```

### 2. Envoi Automatique

Quand timer = 0, le keeper envoie un Deposit:

```typescript
// Le Deposit va:
// 1. Déclencher auto-resolve (smart contract)
// 2. Résoudre le cycle
// 3. Démarrer nouveau cycle
// 4. Keeper devient leader
const tx = await sendDeposit(keeperWallet);
```

### 3. Smart Contract Auto-Resolve

Le smart contract détecte que le timer est expiré:

```rust
// Dans process_deposit:
let needs_auto_resolve = vault.leader != Pubkey::default() 
    && remaining_slots(...) == 0;

if needs_auto_resolve {
    vault = auto_resolve_cycle(...); // Résout le cycle
}

// Puis continue avec le deposit normal
vault.leader = signer.key;
vault.pressure_count += 1;
```

### 4. Résultat

- ✅ Cycle résolu automatiquement
- ✅ Nouveau cycle démarré
- ✅ Keeper devient leader
- ✅ UI se met à jour via WebSocket
- ✅ Tout est automatique!

## Déploiement

### Option 1: Railway.app (Recommandé)

**Gratuit, simple, fiable**

1. Créer compte sur https://railway.app
2. New Project > Deploy from GitHub
3. Sélectionner le repo
4. Ajouter variables d'environnement:
   ```
   SOLANA_RPC_URL=https://api.devnet.solana.com
   NODUS_PROGRAM_ID=By9yf8mRvJq3mXG2QE8nagNyZ5PCUJrfsikZUzk8otTo
   KEEPER_PRIVATE_KEY=<base58_private_key>
   ```
5. Deploy!

**Coût**: Gratuit (500h/mois)

### Option 2: Render.com

**Gratuit, bon uptime**

1. Créer compte sur https://render.com
2. New > Background Worker
3. Connect GitHub repo
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Ajouter variables d'environnement
7. Deploy!

**Coût**: Gratuit

### Option 3: Fly.io

**Gratuit, performant**

1. Installer Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Launch: `fly launch`
4. Set secrets:
   ```bash
   fly secrets set KEEPER_PRIVATE_KEY=<key>
   fly secrets set NODUS_PROGRAM_ID=<id>
   ```
5. Deploy: `fly deploy`

**Coût**: Gratuit (3 apps)

### Option 4: VPS (DigitalOcean, Hetzner, etc.)

**Plus de contrôle, payant**

```bash
# Sur le serveur
git clone <repo>
cd keeper-bot
npm install
npm run build

# Créer .env
echo "KEEPER_PRIVATE_KEY=<key>" > .env
echo "NODUS_PROGRAM_ID=<id>" >> .env

# Lancer avec PM2
npm install -g pm2
pm2 start dist/keeper.js --name nodus-keeper
pm2 save
pm2 startup
```

**Coût**: ~$5-10/mois

## Configuration

### 1. Créer Keeper Wallet

```bash
# Générer nouveau wallet
solana-keygen new --outfile keeper-wallet.json

# Obtenir l'adresse
solana-keygen pubkey keeper-wallet.json

# Obtenir la private key en base58
# (utiliser un script Node.js pour convertir)
```

### 2. Funder le Keeper Wallet

```bash
# Sur devnet
solana airdrop 1 <keeper_address> --url devnet

# Sur mainnet
# Envoyer ~0.1 SOL depuis ton wallet
```

### 3. Variables d'Environnement

```bash
# .env
SOLANA_RPC_URL=https://api.devnet.solana.com
NODUS_PROGRAM_ID=By9yf8mRvJq3mXG2QE8nagNyZ5PCUJrfsikZUzk8otTo
KEEPER_PRIVATE_KEY=<base58_encoded_private_key>
CHECK_INTERVAL=5000  # Check every 5 seconds
```

## Monitoring

### Logs

Le keeper bot log toutes ses actions:

```
🤖 Keeper Bot initialized
📍 Vault PDA: 8T7zNaa7WJQXPJkBrp4GAUDKDgj32p8RjSxyhX8Rr6zP
👛 Keeper Wallet: 5s0B...kFHa
💰 Keeper balance: 0.5 SOL
🚀 Keeper Bot started

⏱️ Cycle #1: 45s remaining
⏱️ Cycle #1: 30s remaining
⏱️ Cycle #1: 15s remaining
⏱️ Cycle #1: 0s remaining

⚡ Cycle #1 expired! Sending Deposit to trigger auto-resolve...
✅ Deposit sent! Signature: 2ZE7x...
🎉 Cycle #1 resolved! New cycle #2 started
```

### Alertes

Ajouter des alertes pour:
- ✅ Keeper wallet balance < 0.01 SOL
- ✅ Erreurs répétées
- ✅ Keeper offline

## Sécurité

### Keeper Wallet

- ✅ Wallet dédié (pas ton wallet principal)
- ✅ Balance minimale (~0.1 SOL suffit)
- ✅ Private key en variable d'environnement
- ✅ Pas de risque de perte (juste des frais de transaction)

### Smart Contract

- ✅ Pas de modification nécessaire
- ✅ Auto-resolve déjà implémenté
- ✅ Keeper ne peut pas tricher (smart contract vérifie tout)
- ✅ Keeper devient juste un joueur normal

## Coûts

### Devnet

- **Hébergement**: Gratuit (Railway, Render, Fly.io)
- **Transactions**: Gratuit (devnet)
- **Total**: 0€/mois

### Mainnet

- **Hébergement**: Gratuit (Railway, Render, Fly.io)
- **Transactions**: ~0.000005 SOL par resolve
- **Fréquence**: ~1 resolve par cycle (variable)
- **Total**: ~0.01 SOL/mois (~$2-3/mois)

## Avantages

### Pour les Utilisateurs

- ✅ Cycles se résolvent automatiquement
- ✅ Pas besoin d'attendre qu'un joueur fasse une action
- ✅ UI toujours à jour
- ✅ Expérience fluide

### Pour le Projet

- ✅ Pas de modification du smart contract
- ✅ Déploiement immédiat
- ✅ Coût minimal
- ✅ Fiable et automatique

### Pour le Keeper

- ✅ Devient leader à chaque resolve
- ✅ Peut gagner le pot!
- ✅ Récupère ses SOL si perd

## Alternative: Clockwork (Solana Automation)

Pour une solution encore plus décentralisée, tu peux utiliser **Clockwork**:

```rust
// Dans le smart contract
#[derive(Accounts)]
pub struct AutoResolve<'info> {
    #[account(mut)]
    pub vault: Account<'info, VaultState>,
    pub clock: Sysvar<'info, Clock>,
    pub clockwork: Program<'info, Clockwork>,
}

// Clockwork appelle automatiquement resolve quand timer = 0
```

**Avantages**:
- ✅ Complètement décentralisé
- ✅ Pas besoin de serveur
- ✅ Fiable

**Inconvénients**:
- ❌ Nécessite modification smart contract
- ❌ Coût par exécution
- ❌ Plus complexe

## Conclusion

Le **Keeper Bot** est la solution optimale pour:
- ✅ Déploiement immédiat (pas de modif smart contract)
- ✅ Coût minimal (gratuit sur devnet)
- ✅ Fiabilité maximale
- ✅ Expérience utilisateur parfaite

**Prochaines étapes**:
1. Créer keeper wallet
2. Déployer sur Railway/Render
3. Tester sur devnet
4. Profiter des cycles auto-résolus! 🎉
