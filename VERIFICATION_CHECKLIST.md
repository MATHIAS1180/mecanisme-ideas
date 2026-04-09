# ✅ Checklist de Vérification - Déploiement Auto-Resolve

## 📋 Program ID
```
8T7zNaa7WJQXPJkBrp4GAUDKDgj32p8RjSxyhX8Rr6zP
```

## 🔍 Vérifications à Faire

### 1. Vérifier le Program sur Solana Explorer
👉 https://explorer.solana.com/address/8T7zNaa7WJQXPJkBrp4GAUDKDgj32p8RjSxyhX8Rr6zP?cluster=devnet

**À vérifier:**
- [ ] Le programme existe
- [ ] Il est déployé sur devnet
- [ ] Il a des données (pas vide)

### 2. Vérifier la Variable Vercel
👉 Dashboard Vercel → Settings → Environment Variables

**À vérifier:**
- [ ] `NEXT_PUBLIC_NODUS_PROGRAM_ID` existe
- [ ] Valeur = `8T7zNaa7WJQXPJkBrp4GAUDKDgj32p8RjSxyhX8Rr6zP`
- [ ] Appliqué à Production, Preview, Development

### 3. Redéployer l'App Vercel
👉 Dashboard Vercel → Deployments → ... → Redeploy

**À vérifier:**
- [ ] Redéploiement lancé
- [ ] Build réussi
- [ ] Déploiement terminé

### 4. Tester sur le Site Live

#### Test A: Connexion
- [ ] Va sur ton site Vercel
- [ ] Connecte ton wallet (Phantom/Solflare)
- [ ] Le wallet se connecte correctement

#### Test B: Session Wallet
- [ ] Entre un budget (ex: 0.03 SOL)
- [ ] Clique sur "Fund"
- [ ] Le session wallet est créé et financé
- [ ] Le solde s'affiche correctement

#### Test C: Premier Deposit
- [ ] Clique sur "Deposit"
- [ ] La transaction passe
- [ ] Tu deviens leader
- [ ] Le timer démarre (ex: 0:15)
- [ ] Le pot augmente

#### Test D: Attendre l'Expiration
- [ ] Attends que le timer arrive à 0:00
- [ ] Le timer affiche bien 0:00
- [ ] Le cycle reste affiché (pas de reset automatique côté UI)

#### Test E: Auto-Resolve (LE TEST CRUCIAL!)
- [ ] Avec le même wallet OU un autre wallet
- [ ] Clique sur "Deposit" quand le timer est à 0:00
- [ ] ✅ La transaction passe (pas d'erreur "ResolveRequired")
- [ ] ✅ Le cycle number augmente (ex: Cycle #1 → Cycle #2)
- [ ] ✅ Le pot se réinitialise
- [ ] ✅ Le nouveau Deposit devient leader du nouveau cycle
- [ ] ✅ Le timer redémarre

#### Test F: Notification Gagnant
- [ ] Après l'auto-resolve
- [ ] Une notification devrait apparaître
- [ ] Elle affiche le gagnant (adresse raccourcie)
- [ ] Elle affiche le payout (en SOL)

#### Test G: Actions Spéciales
- [ ] Teste Shield (leader only)
- [ ] Teste Sabotage (non-leader only)
- [ ] Teste Curse
- [ ] Teste Blizzard
- [ ] Toutes les actions passent

### 5. Vérifier les Logs (Optionnel)

Si tu as accès à la console du navigateur (F12):
- [ ] Ouvre la console
- [ ] Fais un Deposit sur un cycle expiré
- [ ] Regarde les logs de transaction
- [ ] Cherche "cycle auto-resolved" dans les logs

## 🎯 Résultat Attendu

### ✅ Succès si:
1. Le timer arrive à 0:00
2. Tu fais un Deposit
3. Le cycle se résout automatiquement
4. Le nouveau cycle démarre immédiatement
5. Pas d'erreur "ResolveRequired"
6. Le gagnant reçoit son payout

### ❌ Échec si:
1. Erreur "ResolveRequired" quand timer à 0:00
2. Le cycle reste bloqué
3. Le Deposit ne passe pas
4. Le Program ID n'est pas trouvé

## 🐛 Troubleshooting

### Problème: "Program ID not found"
**Solution:**
- Vérifie que tu es sur devnet (pas mainnet)
- Vérifie le Program ID dans Vercel
- Redéploie l'app Vercel
- Vide le cache du navigateur (Ctrl+Shift+R)

### Problème: "ResolveRequired" error
**Solution:**
- Le smart contract n'a pas l'auto-resolve
- Vérifie que tu as bien déployé le bon code
- Vérifie que processor.rs contient `auto_resolve_cycle()`

### Problème: Transaction échoue
**Solution:**
- Vérifie le solde du session wallet
- Vérifie que tu es sur devnet
- Regarde les logs de transaction pour l'erreur exacte

## 📝 Notes

- Le Program ID est sauvegardé dans `PROGRAM_ID.txt`
- Les détails de déploiement sont dans `DEPLOYMENT_INFO.md`
- Le guide complet est dans `AUTO_RESOLVE_IMPLEMENTATION.md`

## 🎉 Validation Finale

Une fois tous les tests passés:
- [ ] ✅ Auto-resolve fonctionne
- [ ] ✅ Le jeu ne se bloque plus
- [ ] ✅ L'expérience est fluide
- [ ] ✅ Les notifications fonctionnent

**🚀 LE JEU EST PRÊT!**
