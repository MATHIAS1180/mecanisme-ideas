# 🎯 Étapes pour Tester le Jeu

## ⚡ Quick Start

### 1. Redéploie l'App Vercel
Le code a été mis à jour avec le bouton Initialize.

👉 Dashboard Vercel → Deployments → ... → **Redeploy**

Attends que le build soit terminé (~2 minutes).

### 2. Va sur ton Site
Une fois le redéploiement terminé, va sur ton site Vercel.

### 3. Connecte ton Wallet
- Clique sur "Connect Wallet"
- Choisis Phantom ou Solflare
- Assure-toi d'être sur **Devnet**

### 4. Initialize le Vault (PREMIÈRE FOIS SEULEMENT)
Tu devrais voir un message:
```
⚠️ Le vault n'est pas initialisé. Clique sur le bouton ci-dessous...
```

- Clique sur **"🚀 Initialize Vault"**
- Confirme la transaction dans ton wallet
- Coût: ~0.002 SOL
- ✅ Attends la confirmation

### 5. Fund ton Session Wallet
Une fois le vault initialisé:
- Entre un budget (ex: **0.03 SOL**)
- Clique sur **"Fund"**
- Confirme la transaction
- ✅ Le session wallet est maintenant financé

### 6. Fais ton Premier Deposit
- Clique sur **"💰 Deposit"**
- ✅ Tu deviens le leader!
- ✅ Le timer démarre (ex: 0:15)
- ✅ Le pot augmente
- ✅ Le jeu commence! 🎉

### 7. Teste l'Auto-Resolve
- Attends que le timer arrive à **0:00**
- Fais un nouveau **Deposit** (même wallet ou autre)
- ✅ Le cycle se résout automatiquement
- ✅ Le gagnant reçoit son payout
- ✅ Un nouveau cycle démarre
- ✅ Pas d'erreur!

## 📋 Checklist Complète

### Avant de Tester
- [ ] App Vercel redéployée
- [ ] Program ID: `8T7zNaa7WJQXPJkBrp4GAUDKDgj32p8RjSxyhX8Rr6zP`
- [ ] Variable Vercel configurée
- [ ] Wallet sur Devnet
- [ ] Au moins 0.05 SOL dans le wallet

### Tests à Faire
- [ ] ✅ Initialize Vault (une seule fois)
- [ ] ✅ Fund Session Wallet
- [ ] ✅ Premier Deposit (devenir leader)
- [ ] ✅ Timer démarre et compte à rebours
- [ ] ✅ Attendre timer à 0:00
- [ ] ✅ Nouveau Deposit (auto-resolve)
- [ ] ✅ Cycle se résout automatiquement
- [ ] ✅ Nouveau cycle démarre
- [ ] ✅ Notification gagnant s'affiche

### Actions Spéciales à Tester
- [ ] Shield (leader only)
- [ ] Sabotage (non-leader only)
- [ ] Anchor (leader only, 2x entry)
- [ ] Curse (réduit la part du gagnant)
- [ ] Blizzard (augmente le pot)

## 🎮 Scénarios de Test

### Scénario 1: Cycle Complet
1. Initialize (si pas déjà fait)
2. Fund session wallet (0.03 SOL)
3. Deposit → Tu es leader
4. Attends 15 secondes (timer à 0:00)
5. Deposit → Auto-resolve + nouveau cycle
6. ✅ Succès!

### Scénario 2: Bataille entre 2 Wallets
1. Wallet A: Deposit (devient leader)
2. Wallet B: Deposit (prend le leadership)
3. Wallet A: Sabotage (coupe le timer)
4. Wallet B: Shield (se protège)
5. Attends timer à 0:00
6. Wallet A: Deposit → Auto-resolve
7. ✅ Wallet B gagne (était leader)

### Scénario 3: Curse et Carry-Over
1. Wallet A: Deposit (leader)
2. Wallet B: Curse (réduit la part du gagnant)
3. Wallet C: Curse (encore -1%)
4. Attends timer à 0:00
5. Deposit → Auto-resolve
6. ✅ Wallet A gagne mais avec 2% de moins
7. ✅ 2% vont au carry-over du prochain cycle

## 🐛 Si ça ne Marche Pas

### Erreur: "Vault not initialized" (0x1773)
- Redéploie l'app Vercel
- Rafraîchis la page
- Le bouton Initialize devrait apparaître
- Clique dessus et confirme

### Erreur: "Insufficient funds"
- Vérifie le solde de ton session wallet
- Fund à nouveau si nécessaire
- Minimum: 0.03 SOL

### Erreur: "Program ID not found"
- Vérifie la variable Vercel
- Vérifie que tu es sur devnet
- Redéploie l'app

### Le timer ne compte pas
- Rafraîchis la page
- Vérifie la connexion RPC
- Attends quelques secondes

### L'auto-resolve ne fonctionne pas
- Vérifie que le timer est bien à 0:00
- Vérifie qu'il y a un leader (pas 11111...1)
- Fais un Deposit
- Regarde les logs de transaction

## 🎉 Résultat Attendu

Après tous les tests:
- ✅ Le vault est initialisé
- ✅ Les Deposits fonctionnent
- ✅ Le timer compte correctement
- ✅ L'auto-resolve fonctionne (pas d'erreur à 0:00)
- ✅ Les cycles s'enchaînent automatiquement
- ✅ Les notifications s'affichent
- ✅ Le jeu est fluide et sans blocage

**🚀 LE JEU EST OPÉRATIONNEL!**

## 📝 Notes

- Le vault n'a besoin d'être initialisé qu'**une seule fois**
- Si quelqu'un d'autre l'a déjà initialisé, tu peux directement Fund et Deposit
- L'auto-resolve se déclenche automatiquement à chaque action après expiration
- Le session wallet évite de confirmer chaque action dans ton wallet principal

## 🔗 Liens Utiles

- Explorer: https://explorer.solana.com/address/8T7zNaa7WJQXPJkBrp4GAUDKDgj32p8RjSxyhX8Rr6zP?cluster=devnet
- Guide complet: `FIX_VAULT_NOT_INITIALIZED.md`
- Vérification: `VERIFICATION_CHECKLIST.md`
