# 🔧 Fix: Vault Not Initialized (Error 0x1773)

## 🐛 Problème

Erreur lors du Deposit:
```
custom program error: 0x1773
```

**0x1773 = 6003 = VaultNotInitialized**

## 💡 Cause

Le vault n'a pas été initialisé. C'est la première étape obligatoire avant de pouvoir utiliser le jeu.

## ✅ Solution

### Option 1: Via l'UI (Recommandé)

1. Va sur ton site
2. Connecte ton wallet principal (Phantom/Solflare)
3. Tu devrais voir un message:
   ```
   ⚠️ Le vault n'est pas initialisé. Clique sur le bouton ci-dessous...
   ```
4. Clique sur **"🚀 Initialize Vault"**
5. Confirme la transaction dans ton wallet
6. ✅ Le vault est maintenant initialisé!
7. Tu peux maintenant Fund ton session wallet et faire des Deposits

### Option 2: Via Solana CLI

```bash
# Pas encore implémenté - utilise l'UI
```

## 📝 Notes Importantes

### Qui peut initialiser?
- N'importe quel wallet peut initialiser le vault
- C'est une opération **une seule fois** par programme
- Une fois initialisé, il ne peut plus être réinitialisé

### Coût
- Rent pour le compte vault (~0.002 SOL)
- Frais de transaction (~0.000005 SOL)
- Total: ~0.002 SOL

### Après l'initialisation
1. Le vault est créé avec:
   - `initialized = true`
   - `protocol_fee_bps = 200` (2%)
   - `cycle_number = 0`
   - Tous les autres champs à zéro/défaut

2. Tu peux maintenant:
   - Fund un session wallet
   - Faire des Deposits
   - Utiliser toutes les actions du jeu

## 🔍 Vérification

### Vérifier que le vault est initialisé

1. **Via l'UI:**
   - Rafraîchis la page
   - Le message d'erreur devrait disparaître
   - Tu devrais voir "Cycle #0" dans la télémétrie

2. **Via Solana Explorer:**
   ```
   https://explorer.solana.com/address/VAULT_PDA?cluster=devnet
   ```
   - Le compte devrait exister
   - Il devrait avoir des données (pas vide)

## 🎯 Checklist

- [ ] Wallet principal connecté
- [ ] Bouton "Initialize Vault" visible
- [ ] Transaction Initialize confirmée
- [ ] Message de succès affiché
- [ ] Vault visible dans la télémétrie (Cycle #0)
- [ ] Prêt à Fund le session wallet
- [ ] Prêt à faire le premier Deposit

## 🚀 Après l'Initialisation

1. **Fund ton session wallet:**
   - Entre 0.03 SOL (ou plus)
   - Clique sur "Fund"
   - Confirme la transaction

2. **Fais le premier Deposit:**
   - Clique sur "💰 Deposit"
   - Tu deviens le premier leader!
   - Le timer démarre
   - Le jeu commence! 🎉

## 🐛 Troubleshooting

### "Transaction failed"
- Vérifie que tu as assez de SOL dans ton wallet principal
- Vérifie que tu es sur devnet
- Vérifie le Program ID dans Vercel

### "Vault already initialized"
- C'est normal si quelqu'un d'autre a déjà initialisé
- Rafraîchis la page
- Tu peux directement Fund et Deposit

### Le bouton n'apparaît pas
- Vérifie que le Program ID est correct
- Vérifie que tu es connecté
- Rafraîchis la page (Ctrl+R)

## 📚 Références

- Code d'erreur: `programs/nodus/src/error.rs` ligne 8
- Fonction Initialize: `programs/nodus/src/processor.rs` ligne 45
- UI Initialize: `apps/web/src/app/play/page.tsx` ligne 227
