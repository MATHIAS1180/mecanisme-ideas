# ⚡ Quick Start - Solana Playground

## 🎯 En 5 Minutes

### 1. Va sur Solana Playground
👉 https://beta.solpg.io/

### 2. Crée un Projet Native
- "Create a new project"
- Choisis **"Native"** (PAS Anchor!)
- Nom: `nodus-game`

### 3. Copie 8 Fichiers

#### Cargo.toml
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

#### src/ (7 fichiers)
Copie le contenu de chaque fichier depuis `programs/nodus/src/`:
- ✅ lib.rs
- ✅ entrypoint.rs
- ✅ processor.rs (AVEC AUTO-RESOLVE!)
- ✅ state.rs
- ✅ instruction.rs
- ✅ error.rs
- ✅ utils.rs

### 4. Build
Clique sur 🔨 **Build** → Attends 1-2 min → ✅ Success

### 5. Deploy
Clique sur 🚀 **Deploy** (Devnet) → Confirme → ✅ Copie le Program ID

### 6. Mets à Jour Vercel
Dashboard Vercel → Settings → Environment Variables:
```
NEXT_PUBLIC_NODUS_PROGRAM_ID = TON_PROGRAM_ID_ICI
```
→ Save → Redeploy

### 7. Teste!
- Va sur ton site
- Fais un Deposit
- Attends timer à 0:00
- Fais un nouveau Deposit
- ✅ Auto-resolve fonctionne!

## 🎉 C'est Tout!

Le jeu ne se bloque plus jamais. Les cycles se résolvent automatiquement.

---

**Besoin d'aide?** Lis `SOLANA_PLAYGROUND_GUIDE.md` pour plus de détails.
