# 🎮 Déploiement sur Solana Playground - Guide Rapide

## 🚀 Étape par Étape

### 1. Ouvrir Solana Playground
Aller sur: **https://beta.solpg.io**

### 2. Créer un Nouveau Projet
- Cliquer sur l'icône "+" en haut à gauche
- Choisir "Anchor (Rust)"
- Nom du projet: `nodus`

### 3. Copier les Fichiers

#### Fichier 1: `src/lib.rs`
Copier le contenu de: `programs/nodus/src/lib.rs`

#### Fichier 2: `src/entrypoint.rs`
Créer un nouveau fichier dans `src/` et copier: `programs/nodus/src/entrypoint.rs`

#### Fichier 3: `src/processor.rs`
Créer un nouveau fichier dans `src/` et copier: `programs/nodus/src/processor.rs`

#### Fichier 4: `src/instruction.rs`
Créer un nouveau fichier dans `src/` et copier: `programs/nodus/src/instruction.rs`

#### Fichier 5: `src/state.rs`
Créer un nouveau fichier dans `src/` et copier: `programs/nodus/src/state.rs`

#### Fichier 6: `src/utils.rs`
Créer un nouveau fichier dans `src/` et copier: `programs/nodus/src/utils.rs`

#### Fichier 7: `src/error.rs`
Créer un nouveau fichier dans `src/` et copier: `programs/nodus/src/error.rs`

#### Fichier 8: `Cargo.toml`
Remplacer le contenu de `Cargo.toml` par: `programs/nodus/Cargo.toml`

### 4. Build
- Cliquer sur l'icône "Build" (🔨) dans la barre latérale gauche
- Attendre 1-2 minutes pour la compilation
- Vérifier qu'il n'y a pas d'erreurs

### 5. Deploy sur Devnet
- Cliquer sur "Deploy" dans la barre latérale
- Sélectionner "Devnet" comme réseau
- Cliquer sur "Deploy"
- **COPIER LE PROGRAM ID AFFICHÉ**

### 6. Sauvegarder le Program ID
Exemple: `By9yf8mRvJq3mXG2QE8nagNyZ5PCUJrfsikZUzk8otTo`

## 📝 Après le Déploiement

### Mettre à jour le Frontend (Vercel)
1. Aller sur Vercel Dashboard
2. Settings → Environment Variables
3. Modifier `NEXT_PUBLIC_NODUS_PROGRAM_ID` avec le nouveau Program ID
4. Redéployer l'application

### Mettre à jour le Keeper Bot (Railway)
1. Aller sur Railway Dashboard
2. Variables → `NODUS_PROGRAM_ID`
3. Modifier avec le nouveau Program ID
4. Le service va redémarrer automatiquement

### Initialiser le Vault
1. Aller sur le frontend
2. Se connecter avec le wallet admin
3. Cliquer sur "Initialize Vault" (si c'est un nouveau Program ID)

## ✅ Test Final

1. **Faire un Deposit** (0.01 SOL)
   - Devrait fonctionner SANS erreur
   - Timer devrait démarrer

2. **Attendre l'expiration**
   - Le keeper bot va résoudre automatiquement
   - Un nouveau cycle va démarrer

3. **Vérifier les logs Railway**
   - Devrait voir: "✅ Cycle resolved successfully"

## 🎯 C'est Tout!

Le smart contract est maintenant déployé avec le fix du keeper bot. Plus d'erreur "sum of account balances do not match"!
