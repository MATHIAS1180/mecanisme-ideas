# 🚀 Guide de Déploiement - Auto-Resolve

## ⚡ Déploiement Rapide

### 1. Recompiler le Smart Contract

```bash
cd programs/nodus
cargo build-sbf
```

### 2. Déployer sur Devnet

```bash
# Depuis la racine du projet
solana program deploy target/deploy/nodus.so --url devnet
```

Ou utilise le script PowerShell :
```powershell
.\deploy-devnet.ps1
```

### 3. Mettre à jour le Program ID

Si tu déploies un nouveau programme, copie le Program ID et mets-le à jour dans :
- `apps/web/.env.local` : `NEXT_PUBLIC_NODUS_PROGRAM_ID=<ton_program_id>`
- `PROGRAM_ID.txt`

### 4. Redémarrer l'application web

```bash
cd apps/web
npm run dev
```

## 🧪 Tester l'Auto-Resolve

### Test 1 : Cycle expiré + Deposit

1. Démarre un cycle avec un Deposit
2. Attends que le timer arrive à 0:00
3. Fais un nouveau Deposit avec un autre wallet
4. ✅ Le cycle devrait se résoudre automatiquement
5. ✅ Le nouveau Deposit devrait s'exécuter sur le nouveau cycle

### Test 2 : Vérifier les logs

Dans l'explorateur Solana (devnet), cherche ta transaction et regarde les logs :
```
Program log: nodus: cycle auto-resolved, new cycle #2
Program log: nodus: deposit accepted
```

### Test 3 : Vérifier le payout

1. Note le solde du leader avant l'expiration
2. Attends l'expiration
3. Fais un Deposit
4. ✅ Le leader devrait avoir reçu son payout

## 🔍 Debugging

### Problème : "ResolveRequired" error

Si tu vois encore cette erreur, c'est que :
- Le smart contract n'a pas été redéployé
- Tu utilises l'ancien Program ID

**Solution :** Redéploie et vérifie le Program ID

### Problème : "InvalidLeaderAccount" error

L'auto-resolve a besoin du compte leader dans les accounts.

**Solution :** Vérifie que `buildActionInstruction` passe bien le `leader_account`

### Problème : Le cycle ne se résout pas

Vérifie que :
1. Le timer est bien à 0
2. Il y a un leader (pas `11111...1`)
3. Aucun snipe n'est actif

## 📊 Monitoring

Pour surveiller le jeu en production :

```bash
# Voir les logs en temps réel
solana logs <program_id> --url devnet
```

Cherche ces messages :
- `"nodus: cycle auto-resolved, new cycle #X"` ✅ Auto-resolve fonctionne
- `"nodus: deposit accepted"` ✅ Action exécutée
- `"nodus: cycle resolved"` ℹ️ Resolve manuel (toujours possible)

## 🎯 Checklist de Déploiement

- [ ] Code compilé sans erreurs
- [ ] Smart contract déployé sur devnet
- [ ] Program ID mis à jour dans `.env.local`
- [ ] Application web redémarrée
- [ ] Test 1 : Cycle expiré + Deposit ✅
- [ ] Test 2 : Logs vérifiés ✅
- [ ] Test 3 : Payout reçu ✅

## 🔄 Rollback

Si tu veux revenir à l'ancienne version :

```bash
git checkout 27b13f0  # Commit avant auto-resolve
cargo build-sbf
solana program deploy target/deploy/nodus.so --url devnet
```

## 💡 Notes

- L'instruction `Resolve` existe toujours et peut être appelée manuellement
- L'auto-resolve économise du gas (1 transaction au lieu de 2)
- Le carry-over est correctement transféré au nouveau cycle
- Les frais de protocole sont toujours prélevés
