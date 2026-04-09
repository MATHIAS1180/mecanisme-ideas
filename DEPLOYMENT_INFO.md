# 🚀 Deployment Info - Auto-Resolve Version

## 📋 Informations de Déploiement

### Program ID (Devnet)
```
8T7zNaa7WJQXPJkBrp4GAUDKDgj32p8RjSxyhX8Rr6zP
```

### Date de Déploiement
9 Avril 2026

### Version
v1.0.0 - Auto-Resolve

### Réseau
Solana Devnet

### Déployé via
Solana Playground (https://beta.solpg.io/)

## ✨ Fonctionnalités

### Auto-Resolve ✅
Le smart contract résout automatiquement les cycles expirés dès qu'une action est effectuée.

### Actions Disponibles
- ✅ Initialize - Initialiser le vault
- ✅ Deposit - Prendre le leadership et reset le timer
- ✅ Shield - Protection leader contre les deposits
- ✅ Sabotage - Couper le temps restant
- ✅ Anchor - Reset complet du timer (leader only)
- ✅ ArmSnipe - Piège pour le prochain challenger
- ✅ ReclaimSnipe - Récupérer un snipe expiré
- ✅ Curse - Réduire la part du gagnant
- ✅ Blizzard - Augmenter le pot sans prendre le lead
- ✅ Resolve - Résoudre manuellement (optionnel, auto-resolve actif)

## 🔗 Liens Utiles

### Explorer Solana
```
https://explorer.solana.com/address/8T7zNaa7WJQXPJkBrp4GAUDKDgj32p8RjSxyhX8Rr6zP?cluster=devnet
```

### Vérifier le Programme
```bash
solana program show 8T7zNaa7WJQXPJkBrp4GAUDKDgj32p8RjSxyhX8Rr6zP --url devnet
```

### Voir les Logs en Temps Réel
```bash
solana logs 8T7zNaa7WJQXPJkBrp4GAUDKDgj32p8RjSxyhX8Rr6zP --url devnet
```

## 🎯 Configuration Vercel

### Variable d'Environnement
```
NEXT_PUBLIC_NODUS_PROGRAM_ID=By9yf8mRvJq3mXG2QE8nagNyZ5PCUJrfsikZUzk8otTo
```

### Statut
✅ Configuré et déployé sur Vercel

## 🧪 Tests à Effectuer

### Test 1: Deposit Initial
1. Connecte ton wallet
2. Fund le session wallet (0.03 SOL minimum)
3. Clique sur "Deposit"
4. ✅ Tu deviens leader, timer démarre

### Test 2: Auto-Resolve
1. Attends que le timer arrive à 0:00
2. Fais un nouveau Deposit (avec un autre wallet si possible)
3. ✅ Le cycle se résout automatiquement
4. ✅ Le gagnant reçoit son payout
5. ✅ Nouveau cycle démarre immédiatement

### Test 3: Actions Spéciales
1. En tant que leader, teste Shield
2. En tant que non-leader, teste Sabotage
3. Teste Curse pour réduire la part du gagnant
4. ✅ Toutes les actions fonctionnent

### Test 4: Notification Gagnant
1. Laisse un cycle se terminer
2. Fais un Deposit pour déclencher l'auto-resolve
3. ✅ Une notification devrait apparaître avec le gagnant et le payout

## 📊 Métriques

### Coûts des Actions
- Deposit: 0.001 SOL
- Shield: 0.001 SOL
- Sabotage: 0.001 SOL
- Anchor: 0.002 SOL
- ArmSnipe: 0.001 SOL
- Curse: 0.001 SOL
- Blizzard: 0.001 SOL
- Resolve: Gratuit (mais auto-resolve actif)

### Frais de Protocole
- 2% du pot (200 bps)

### Carry-Over
- 1% par Curse (max 5 Curses = 5%)

## 🔄 Historique des Versions

### v1.0.0 - Auto-Resolve (Actuel)
- ✅ Auto-résolution des cycles expirés
- ✅ Notification gagnant améliorée
- ✅ UI/UX optimisée
- ✅ Graphique cycle enhanced

### v0.1.0 - Version Initiale
- ❌ Résolution manuelle requise
- ❌ Cycles bloqués à 0:00

## 🎉 Statut

**✅ DÉPLOYÉ ET OPÉRATIONNEL**

Le jeu est maintenant live sur devnet avec l'auto-resolve activé!
