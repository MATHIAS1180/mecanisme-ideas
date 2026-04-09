# 🎮 Guide Solana Playground - Build & Deploy

## 📋 Structure du Projet

Ton smart contract a **7 fichiers** à copier dans Solana Playground:

```
src/
├── lib.rs           (point d'entrée principal)
├── entrypoint.rs    (entrypoint Solana)
├── processor.rs     (logique du jeu - AVEC AUTO-RESOLVE)
├── state.rs         (structures de données)
├── instruction.rs   (instructions du programme)
├── error.rs         (codes d'erreur)
└── utils.rs         (fonctions utilitaires)

Cargo.toml           (dépendances)
```

## 🚀 Étapes sur Solana Playground

### 1. Aller sur Solana Playground
👉 https://beta.solpg.io/

### 2. Créer un Nouveau Projet
- Clique sur "Create a new project"
- Choisis **"Native"** (PAS Anchor!)
- Nom: `nodus-game`

### 3. Copier les Fichiers

#### 📄 Cargo.toml
```toml
[package]
name = "nodus-program"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]

[dependencies]
solana-program = "2.1.11"
```

#### 📄 src/lib.rs
Copie le contenu de `programs/nodus/src/lib.rs`

#### 📄 src/entrypoint.rs
Copie le contenu de `programs/nodus/src/entrypoint.rs`

#### 📄 src/processor.rs
Copie le contenu de `programs/nodus/src/processor.rs` (AVEC AUTO-RESOLVE!)

#### 📄 src/state.rs
Copie le contenu de `programs/nodus/src/state.rs`

#### 📄 src/instruction.rs
Copie le contenu de `programs/nodus/src/instruction.rs`

#### 📄 src/error.rs
Copie le contenu de `programs/nodus/src/error.rs`

#### 📄 src/utils.rs
Copie le contenu de `programs/nodus/src/utils.rs`

### 4. Build
- Clique sur le bouton **"Build"** (🔨)
- Attends la compilation (peut prendre 1-2 minutes)
- ✅ Tu devrais voir "Build successful"

### 5. Deploy
- Assure-toi d'être sur **Devnet** (en haut à droite)
- Clique sur **"Deploy"** (🚀)
- Confirme la transaction dans ton wallet
- ✅ Note le **Program ID** qui s'affiche!

### 6. Copier le Program ID
Exemple: `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU`

## 🔧 Mettre à Jour Vercel

### Option 1: Via Dashboard Vercel
1. Va sur https://vercel.com/
2. Sélectionne ton projet
3. Settings → Environment Variables
4. Trouve `NEXT_PUBLIC_NODUS_PROGRAM_ID`
5. Clique sur "Edit"
6. Colle ton nouveau Program ID
7. Clique sur "Save"
8. **Redéploie** ton app (Deployments → ... → Redeploy)

### Option 2: Via CLI Vercel
```bash
vercel env add NEXT_PUBLIC_NODUS_PROGRAM_ID
# Colle ton Program ID
# Choisis: Production, Preview, Development (ou tous)

# Redéploie
vercel --prod
```

### Option 3: Via .env.local (pour dev local)
```bash
cd apps/web
echo "NEXT_PUBLIC_NODUS_PROGRAM_ID=TON_PROGRAM_ID_ICI" > .env.local
npm run dev
```

## ✅ Vérification

### 1. Tester le Program ID
```bash
solana program show TON_PROGRAM_ID --url devnet
```

### 2. Vérifier sur l'App
1. Va sur ton site Vercel
2. Ouvre la console (F12)
3. Vérifie que le Program ID est correct
4. Fais un Deposit pour tester

### 3. Vérifier l'Auto-Resolve
1. Démarre un cycle
2. Attends que le timer arrive à 0:00
3. Fais un nouveau Deposit
4. ✅ Le cycle devrait se résoudre automatiquement!

## 🐛 Troubleshooting

### Erreur: "Build failed"
- Vérifie que tu as bien copié TOUS les fichiers
- Vérifie qu'il n'y a pas de fautes de frappe
- Regarde les erreurs dans la console

### Erreur: "Insufficient funds"
- Ton wallet Playground doit avoir des SOL devnet
- Demande des SOL: `solana airdrop 2 --url devnet`

### Erreur: "Program ID not found"
- Vérifie que tu as bien copié le Program ID complet
- Vérifie que tu es sur devnet (pas mainnet!)

### L'app ne voit pas le nouveau Program ID
- Vérifie que tu as bien redéployé sur Vercel
- Vide le cache du navigateur (Ctrl+Shift+R)
- Attends 1-2 minutes pour la propagation

## 📝 Checklist Complète

- [ ] Projet créé sur Solana Playground (Native)
- [ ] Cargo.toml copié
- [ ] 7 fichiers .rs copiés dans src/
- [ ] Build réussi ✅
- [ ] Deploy réussi ✅
- [ ] Program ID copié
- [ ] Variable Vercel mise à jour
- [ ] App redéployée sur Vercel
- [ ] Test: Deposit fonctionne
- [ ] Test: Auto-resolve fonctionne (timer à 0 → Deposit)

## 🎯 Résultat Final

Une fois tout fait:
- ✅ Smart contract avec auto-resolve déployé sur devnet
- ✅ App Vercel connectée au nouveau program
- ✅ Le jeu ne se bloque plus jamais à 0:00
- ✅ Expérience fluide pour les joueurs

## 💡 Astuce Pro

Sauvegarde ton Program ID dans `PROGRAM_ID.txt` à la racine du projet:
```bash
echo "TON_PROGRAM_ID_ICI" > PROGRAM_ID.txt
git add PROGRAM_ID.txt
git commit -m "📝 Nouveau Program ID avec auto-resolve"
git push
```

Comme ça tu ne le perds jamais! 🎉
