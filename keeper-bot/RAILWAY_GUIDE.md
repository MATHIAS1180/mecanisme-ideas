# Guide Railway - Étape par Étape

## ✅ Wallet Créé!

**Adresse**: `8LU1VDFn5aUCAQkLA2pdnvve4Fz4zav49Qer8aHeYkBP`

## Étape 1: Airdrop 1 SOL sur Devnet

Ouvre ton terminal et exécute:

```bash
solana airdrop 1 8LU1VDFn5aUCAQkLA2pdnvve4Fz4zav49Qer8aHeYkBP --url devnet
```

Ou utilise le faucet web: https://faucet.solana.com/

## Étape 2: Push sur GitHub

Avant de déployer sur Railway, assure-toi que ton code est sur GitHub:

```bash
cd mecanisme-ideas
git add .
git commit -m "Add keeper bot"
git push
```

## Étape 3: Créer un Compte Railway

1. Va sur **https://railway.app**
2. Clique sur **"Login"** en haut à droite
3. Choisis **"Login with GitHub"**
4. Autorise Railway à accéder à ton compte GitHub

## Étape 4: Créer un Nouveau Projet

1. Une fois connecté, clique sur **"New Project"** (gros bouton violet)
2. Sélectionne **"Deploy from GitHub repo"**
3. Si c'est la première fois, clique sur **"Configure GitHub App"**
4. Autorise Railway à accéder à ton repo `mecanisme-ideas`
5. Retourne sur Railway et sélectionne le repo **`mecanisme-ideas`**

## Étape 5: Configuration du Service

Railway va détecter automatiquement que c'est un projet Node.js.

### 5.1 Configurer le Root Directory

1. Clique sur le service qui vient d'être créé
2. Va dans l'onglet **"Settings"**
3. Trouve la section **"Root Directory"**
4. Entre: `keeper-bot`
5. Clique sur **"Save"**

### 5.2 Configurer les Commandes (optionnel)

Dans **Settings** > **Build & Deploy**:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run deploy`

(Railway devrait les détecter automatiquement)

## Étape 6: Ajouter les Variables d'Environnement

C'est l'étape la plus importante!

1. Clique sur l'onglet **"Variables"**
2. Clique sur **"New Variable"** (ou le bouton +)
3. Ajoute ces 3 variables une par une:

### Variable 1: SOLANA_RPC_URL
```
Name: SOLANA_RPC_URL
Value: https://api.devnet.solana.com
```

### Variable 2: NODUS_PROGRAM_ID
```
Name: NODUS_PROGRAM_ID
Value: By9yf8mRvJq3mXG2QE8nagNyZ5PCUJrfsikZUzk8otTo
```

### Variable 3: KEEPER_PRIVATE_KEY
```
Name: KEEPER_PRIVATE_KEY
Value: H2eFiFDhaqqWH8zmNVRVgH9RbUYFwMHnMf4zBKJLd13LQXW6TUkNyDBNdEuDcwaP8yQNTNamvJbipiu4Mg98c53
```

⚠️ **IMPORTANT**: Copie-colle exactement la private key sans espaces!

## Étape 7: Déployer

1. Une fois les variables ajoutées, Railway va automatiquement redéployer
2. Ou clique sur **"Deploy"** si ce n'est pas automatique
3. Attends 1-2 minutes que le build se termine

## Étape 8: Vérifier les Logs

1. Clique sur l'onglet **"Deployments"**
2. Clique sur le dernier déploiement (celui en cours)
3. Clique sur **"View Logs"**

Tu devrais voir:

```
🤖 Keeper Bot initialized
📍 Vault PDA: 8T7zNaa7WJQXPJkBrp4GAUDKDgj32p8RjSxyhX8Rr6zP
👛 Keeper Wallet: 8LU1VDFn5aUCAQkLA2pdnvve4Fz4zav49Qer8aHeYkBP
💰 Keeper balance: 1.0 SOL
🚀 Keeper Bot started
⏱️ Cycle #1: 45s remaining
```

## ✅ C'est Tout!

Le keeper bot est maintenant déployé et fonctionne! 🎉

Il va:
- ✅ Surveiller le vault automatiquement
- ✅ Résoudre les cycles expirés
- ✅ Garder ton jeu fluide

## Troubleshooting

### "KEEPER_PRIVATE_KEY not set"
Vérifie que tu as bien ajouté la variable dans l'onglet "Variables".

### "Insufficient balance"
Le wallet n'a pas reçu le SOL. Refais l'airdrop:
```bash
solana airdrop 1 8LU1VDFn5aUCAQkLA2pdnvve4Fz4zav49Qer8aHeYkBP --url devnet
```

### "Build failed"
Vérifie que le Root Directory est bien `keeper-bot`.

### "Cannot find module"
Railway n'a pas installé les dépendances. Vérifie que `package.json` existe dans `keeper-bot/`.

## Monitoring

Pour voir ce que fait le keeper:
1. Va sur Railway
2. Clique sur ton projet
3. Clique sur "Deployments"
4. Clique sur "View Logs"

Tu verras en temps réel quand le keeper résout les cycles!

## Arrêter le Keeper

Si tu veux arrêter le keeper:
1. Va dans "Settings"
2. Scroll en bas
3. Clique sur "Remove Service"

## Redémarrer le Keeper

Si tu veux redémarrer:
1. Va dans "Deployments"
2. Clique sur les 3 points "..."
3. Clique sur "Restart"

---

**Questions?** Vérifie `DEPLOY.md` pour plus de détails!
