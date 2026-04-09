# 📦 Fichiers à Copier dans Solana Playground

## 🎯 Liste des Fichiers

Voici les **8 fichiers** à copier dans Solana Playground:

### 1️⃣ Cargo.toml (racine du projet)
📁 Chemin: `Cargo.toml`
📄 Fichier: `programs/nodus/Cargo.toml`

### 2️⃣ src/lib.rs
📁 Chemin: `src/lib.rs`
📄 Fichier: `programs/nodus/src/lib.rs`

### 3️⃣ src/entrypoint.rs
📁 Chemin: `src/entrypoint.rs`
📄 Fichier: `programs/nodus/src/entrypoint.rs`

### 4️⃣ src/processor.rs ⭐ (AVEC AUTO-RESOLVE)
📁 Chemin: `src/processor.rs`
📄 Fichier: `programs/nodus/src/processor.rs`

### 5️⃣ src/state.rs
📁 Chemin: `src/state.rs`
📄 Fichier: `programs/nodus/src/state.rs`

### 6️⃣ src/instruction.rs
📁 Chemin: `src/instruction.rs`
📄 Fichier: `programs/nodus/src/instruction.rs`

### 7️⃣ src/error.rs
📁 Chemin: `src/error.rs`
📄 Fichier: `programs/nodus/src/error.rs`

### 8️⃣ src/utils.rs
📁 Chemin: `src/utils.rs`
📄 Fichier: `programs/nodus/src/utils.rs`

## 📋 Ordre de Copie Recommandé

1. **Cargo.toml** (pour les dépendances)
2. **error.rs** (codes d'erreur)
3. **utils.rs** (fonctions utilitaires)
4. **state.rs** (structures de données)
5. **instruction.rs** (instructions)
6. **processor.rs** (logique principale - AVEC AUTO-RESOLVE!)
7. **entrypoint.rs** (point d'entrée)
8. **lib.rs** (exports)

## 🚀 Procédure Rapide

### Sur Solana Playground:

1. **Créer le projet**
   - Va sur https://beta.solpg.io/
   - "Create a new project" → **Native** (pas Anchor!)
   - Nom: `nodus-game`

2. **Copier Cargo.toml**
   - Ouvre `Cargo.toml` dans Playground
   - Supprime le contenu par défaut
   - Copie-colle le contenu de `programs/nodus/Cargo.toml`

3. **Copier les fichiers src/**
   - Pour chaque fichier dans `programs/nodus/src/`:
     - Crée le fichier dans Playground (si pas déjà là)
     - Copie-colle le contenu

4. **Build**
   - Clique sur 🔨 Build
   - Attends 1-2 minutes
   - ✅ "Build successful"

5. **Deploy**
   - Assure-toi d'être sur **Devnet**
   - Clique sur 🚀 Deploy
   - Confirme dans ton wallet
   - ✅ Copie le Program ID!

## 📝 Checklist

- [ ] Cargo.toml copié
- [ ] src/lib.rs copié
- [ ] src/entrypoint.rs copié
- [ ] src/processor.rs copié (AVEC AUTO-RESOLVE!)
- [ ] src/state.rs copié
- [ ] src/instruction.rs copié
- [ ] src/error.rs copié
- [ ] src/utils.rs copié
- [ ] Build réussi ✅
- [ ] Deploy réussi ✅
- [ ] Program ID sauvegardé

## 🎯 Après le Deploy

1. **Copie le Program ID**
   Exemple: `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU`

2. **Mets à jour Vercel**
   - Dashboard Vercel → Settings → Environment Variables
   - `NEXT_PUBLIC_NODUS_PROGRAM_ID` = ton nouveau Program ID
   - Redéploie l'app

3. **Teste!**
   - Va sur ton site
   - Fais un Deposit
   - Attends que le timer arrive à 0:00
   - Fais un nouveau Deposit
   - ✅ Le cycle devrait se résoudre automatiquement!

## 💡 Astuce

Si tu veux vérifier que tous les fichiers sont bien copiés, regarde dans Playground:
- Tu devrais avoir **8 fichiers** au total
- Le build ne devrait avoir **aucune erreur**
- Le deploy devrait te donner un **Program ID valide**

C'est tout! 🎉
