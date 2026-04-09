# 🚀 Redéployer avec les Optimisations

## ⚠️ IMPORTANT

Les constantes du smart contract ont changé (timer). Tu DOIS redéployer le smart contract!

## 📋 Étapes Rapides

### 1. Copier les Nouveaux Fichiers dans Solana Playground

Tu dois copier les fichiers modifiés:

#### Fichiers à Mettre à Jour:
- ✅ `src/utils.rs` (nouvelles constantes timer)

C'est le SEUL fichier modifié dans le smart contract!

#### Procédure:
1. Va sur https://beta.solpg.io/
2. Ouvre ton projet `nodus-game`
3. Ouvre `src/utils.rs`
4. Remplace les lignes 11-13:
   ```rust
   // ANCIEN
   pub const MAX_RESET_SLOTS: u64 = 450;
   pub const MIN_RESET_SLOTS: u64 = 38;
   pub const RESET_DECAY_SLOTS: u64 = 12;
   
   // NOUVEAU
   pub const MAX_RESET_SLOTS: u64 = 100; // ~45 secondes
   pub const MIN_RESET_SLOTS: u64 = 20;  // ~9 secondes minimum
   pub const RESET_DECAY_SLOTS: u64 = 3; // Decay plus rapide
   ```

### 2. Build

- Clique sur 🔨 **Build**
- Attends 1-2 minutes
- ✅ "Build successful"

### 3. Deploy

- Clique sur 🚀 **Deploy** (Devnet)
- Confirme la transaction
- ✅ Copie le nouveau Program ID!

### 4. Mets à Jour Vercel

Dashboard Vercel → Settings → Environment Variables:
```
NEXT_PUBLIC_NODUS_PROGRAM_ID = TON_NOUVEAU_PROGRAM_ID
```
→ Save → Redeploy

### 5. Initialise le Vault

Une fois Vercel redéployé:
1. Va sur ton site
2. Connecte ton wallet
3. Clique sur "🚀 Initialize Vault"
4. ✅ C'est fait!

### 6. Teste!

- Fais un Deposit
- Le timer devrait démarrer à ~45 secondes (au lieu de 3 minutes)
- Le nouveau SVG devrait s'afficher (sobre et pro)
- ✅ Tout fonctionne!

## 🎯 Résultat Attendu

### Timer
- Premier deposit: ~45 secondes ✅
- Après plusieurs actions: ~20-30 secondes
- Minimum: ~9 secondes
- Beaucoup plus rapide et dynamique!

### SVG
- Design sobre et minimaliste ✅
- Barre de progression avec gradient
- Timer central en gros
- Stats en bas (Pot, Leader, Pressure)
- Professionnel et fluide!

### Coût
- Premier deposit: 0.0123 SOL (normal, inclut rent User State)
- Deposits suivants: 0.01 SOL exactement
- Transparent et juste!

## 📝 Checklist Complète

- [ ] `src/utils.rs` mis à jour dans Playground
- [ ] Build réussi
- [ ] Deploy réussi
- [ ] Nouveau Program ID copié
- [ ] Variable Vercel mise à jour
- [ ] Vercel redéployé
- [ ] Vault initialisé
- [ ] Test: Timer à ~45 secondes
- [ ] Test: Nouveau SVG s'affiche
- [ ] Test: Gradient de couleur fonctionne
- [ ] ✅ Tout fonctionne!

## 💡 Astuce

Sauvegarde le nouveau Program ID:
```bash
echo "TON_NOUVEAU_PROGRAM_ID" > PROGRAM_ID.txt
git add PROGRAM_ID.txt
git commit -m "📝 Nouveau Program ID avec timer optimisé"
git push
```

## 🎉 C'est Tout!

Une fois redéployé:
- ✅ Jeu 4x plus rapide
- ✅ Design sobre et pro
- ✅ Expérience optimale
- ✅ Prêt pour les joueurs!
