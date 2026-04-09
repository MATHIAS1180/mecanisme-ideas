# 🔑 Initialiser le Vault (ADMIN SEULEMENT)

## ⚠️ Important

Cette opération doit être faite **UNE SEULE FOIS** par le déployeur du smart contract (TOI).

Les joueurs n'auront JAMAIS à initialiser le vault. Ils pourront directement jouer après que tu l'aies initialisé.

## 🎯 Quand Initialiser?

Tu dois initialiser le vault:
- ✅ Après chaque nouveau déploiement du smart contract
- ✅ Une seule fois par Program ID
- ❌ JAMAIS à chaque cycle (les cycles se réinitialisent automatiquement)

## 🚀 Comment Initialiser

### Option 1: Via ton Site (Recommandé)

1. **Attends que Vercel finisse le déploiement**
   - Va sur https://vercel.com/
   - Vérifie que le build est terminé
   - Status: "Ready"

2. **Va sur ton site**
   - Ouvre ton site Vercel
   - Tu devrais voir un message:
     ```
     ⚠️ Le vault n'est pas initialisé...
     ```

3. **Connecte TON wallet de déploiement**
   - Clique sur "Connect Wallet"
   - Choisis Phantom ou Solflare
   - Assure-toi d'être sur **Devnet**
   - Connecte le wallet qui a déployé le programme

4. **Clique sur "🚀 Initialize Vault"**
   - Le bouton devrait être visible
   - Clique dessus
   - Confirme la transaction dans ton wallet

5. **Attends la confirmation**
   - La transaction prend ~2-3 secondes
   - Tu verras un message de succès
   - Le message d'avertissement disparaît

6. **✅ C'est fait pour toujours!**
   - Le vault est maintenant initialisé
   - Les joueurs peuvent commencer à jouer
   - Tu n'auras plus jamais à le faire (sauf nouveau déploiement)

### Option 2: Via Solana CLI

```bash
# Pas encore implémenté - utilise l'option 1
```

## 💰 Coût

- **Rent du vault**: ~0.002 SOL (récupérable si tu fermes le programme)
- **Frais de transaction**: ~0.000005 SOL
- **Total**: ~0.002 SOL

## ✅ Vérification

### Comment savoir si c'est initialisé?

1. **Via l'UI:**
   - Rafraîchis la page
   - Le message d'avertissement a disparu
   - Tu vois "Cycle #0" dans la télémétrie
   - Les joueurs peuvent faire des Deposits

2. **Via Solana Explorer:**
   ```
   https://explorer.solana.com/address/VAULT_PDA?cluster=devnet
   ```
   - Le compte existe
   - Il a des données (pas vide)
   - Taille: ~200 bytes

## 🎮 Après l'Initialisation

Une fois le vault initialisé:

### Les Joueurs Peuvent:
- ✅ Créer un session wallet (ils paient le rent)
- ✅ Fund leur session wallet (montant de leur choix)
- ✅ Faire des Deposits (0.001 SOL par action)
- ✅ Utiliser toutes les actions du jeu
- ✅ Jouer sans limite!

### Ce qui se Passe Automatiquement:
- ✅ Premier Deposit → Cycle #1 démarre
- ✅ Timer compte à rebours
- ✅ Timer à 0:00 → Auto-resolve
- ✅ Gagnant reçoit son payout
- ✅ Cycle #2 démarre automatiquement
- ✅ Et ainsi de suite, à l'infini!

### Ce que les Joueurs Paient:
- ✅ Rent du session wallet: ~0.002 SOL (une fois, récupérable)
- ✅ Fund du session wallet: montant de leur choix (ex: 0.03 SOL)
- ✅ Actions du jeu: 0.001 SOL par Deposit/Shield/Sabotage/etc.
- ❌ AUCUN frais d'initialisation
- ❌ AUCUN frais de cycle

## 🐛 Troubleshooting

### Le bouton n'apparaît pas
- Vérifie que Vercel a fini le déploiement
- Rafraîchis la page (Ctrl+R)
- Vide le cache (Ctrl+Shift+R)
- Vérifie que tu es sur devnet

### "Transaction failed"
- Vérifie que tu as assez de SOL (~0.01 SOL minimum)
- Vérifie que tu es sur devnet
- Vérifie le Program ID dans Vercel

### "Vault already initialized"
- C'est normal si tu as déjà initialisé
- Ou si quelqu'un d'autre l'a fait
- Rafraîchis la page
- Les joueurs peuvent maintenant jouer

### Les joueurs voient encore le message
- Attends 1-2 minutes pour la propagation
- Demande-leur de rafraîchir la page
- Vérifie que le vault est bien initialisé (Explorer)

## 📝 Checklist Admin

- [ ] Smart contract déployé sur devnet
- [ ] Program ID mis à jour dans Vercel
- [ ] Vercel build terminé avec succès
- [ ] Site accessible
- [ ] Wallet de déploiement connecté
- [ ] Bouton "Initialize Vault" visible
- [ ] Transaction Initialize confirmée
- [ ] Message de succès affiché
- [ ] Vault visible dans la télémétrie (Cycle #0)
- [ ] Message d'avertissement disparu
- [ ] ✅ Les joueurs peuvent jouer!

## 🎉 Résultat Final

Après l'initialisation:
- ✅ Le vault est prêt pour toujours
- ✅ Les cycles se gèrent automatiquement
- ✅ Les joueurs n'ont aucun frais d'initialisation
- ✅ Le jeu est 100% opérationnel
- ✅ Tu n'as plus rien à faire!

## 🔄 Quand Réinitialiser?

Tu dois réinitialiser SEULEMENT si:
- ✅ Tu déploies un nouveau smart contract (nouveau Program ID)
- ✅ Tu changes de réseau (devnet → mainnet)
- ❌ JAMAIS entre les cycles (c'est automatique!)
- ❌ JAMAIS pour les joueurs (ils jouent directement!)

---

**Note:** Le vault est initialisé UNE FOIS pour TOUJOURS. Les cycles se réinitialisent automatiquement à l'infini grâce à l'auto-resolve. Les joueurs ne paient que leurs actions, rien d'autre!
