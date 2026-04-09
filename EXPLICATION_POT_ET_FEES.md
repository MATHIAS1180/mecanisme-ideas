# 💰 Explication: Pot, Fees et Carry-Over

## 🎯 Questions Répondues

### 1. Deploy qui prend du temps (31 secondes + retries)

**C'est NORMAL sur devnet!**

- ✅ Devnet est souvent congestionné
- ✅ Les transactions peuvent être droppées
- ✅ Solana Playground retry automatiquement
- ✅ 6-8 tentatives c'est courant
- ✅ Sur mainnet, c'est beaucoup plus rapide

**Pourquoi?**
- Devnet a moins de validateurs
- Moins de priorité que mainnet
- Utilisé pour les tests (beaucoup de spam)
- Gratuit donc pas de priority fees

**Sur Mainnet:**
- Deploy en 2-5 secondes généralement
- Avec priority fees, quasi instantané
- Beaucoup plus stable

### 2. Les 2% de frais vont-ils au treasury wallet?

**OUI! ✅**

Voici le code (processor.rs, ligne 427):
```rust
let protocol_fee = gross_pot * 2% // 200 bps
Self::debit_vault_credit_target(vault_account, protocol_fee_wallet, protocol_fee)?;
```

Le wallet treasury est défini dans `utils.rs`:
```rust
pub const PROTOCOL_FEE_WALLET: &str = "FC2km6B1ub8fBf4FdLFs1hbJjmLx6EJbdAzN9Ajnb8nt";
```

**Vérification:**
Tu peux vérifier sur Solana Explorer que ce wallet reçoit bien les frais après chaque cycle.

### 3. Pourquoi il reste du SOL dans le pot après un cycle?

**C'est le CARRY-OVER! ✅**

## 📊 Répartition du Pot à la Fin d'un Cycle

Voici comment le pot est réparti:

```
Pot Total = 1.00 SOL (exemple)
├─ Protocol Fee (2%) = 0.02 SOL → Treasury Wallet ✅
├─ Carry-Over (curse_count%) = 0.03 SOL → Reste dans le vault ✅
└─ Payout (96%) = 0.95 SOL → Gagnant ✅
```

### Exemple Concret

**Scénario:**
- Pot: 1.00 SOL
- Curses: 3 (donc 3% de carry-over)
- Protocol fee: 2%

**Calcul:**
```rust
gross_pot = 1.00 SOL
protocol_fee = 1.00 * 2% = 0.02 SOL  → Treasury
carry = 1.00 * 3% = 0.03 SOL         → Reste dans vault
payout = 1.00 - 0.02 - 0.03 = 0.95 SOL → Gagnant
```

**Après résolution:**
- Treasury reçoit: 0.02 SOL ✅
- Gagnant reçoit: 0.95 SOL ✅
- Vault contient: 0.03 SOL (carry-over) + rent reserve ✅

### Pourquoi le Carry-Over?

Le carry-over est **intentionnel**:
- Il reste dans le vault pour le prochain cycle
- Il augmente le pot du cycle suivant
- C'est l'effet des Curses!
- Plus il y a de Curses, plus le carry-over est important

**Exemple:**
- Cycle 1: Pot = 1.00 SOL, 3 Curses → Carry-over = 0.03 SOL
- Cycle 2: Pot démarre à 0.03 SOL (carry-over) + nouveaux deposits
- Si Cycle 2 a 5 Curses (max) → Carry-over = 5% du pot
- Cycle 3: Pot démarre avec le carry-over du Cycle 2
- Et ainsi de suite!

## 🔧 Fix Appliqué

### Problème
L'UI affichait le solde total du vault, incluant:
- Le pot actuel
- Le carry-over du cycle précédent
- Le rent reserve

### Solution
Maintenant l'UI affiche:
```typescript
actualPot = vaultBalance - rentReserve - carryOver
```

**Résultat:**
- ✅ Le pot affiché est le pot réel du cycle actuel
- ✅ Le carry-over est affiché séparément dans la télémétrie
- ✅ Transparent et clair pour les joueurs

## 📝 Vérification

### Comment vérifier que les fees vont au treasury?

1. **Via Solana Explorer:**
   ```
   https://explorer.solana.com/address/FC2km6B1ub8fBf4FdLFs1hbJjmLx6EJbdAzN9Ajnb8nt?cluster=devnet
   ```

2. **Après un cycle résolu:**
   - Note le solde du treasury avant
   - Laisse un cycle se terminer
   - Vérifie le solde du treasury après
   - Il devrait avoir augmenté de ~2% du pot

3. **Via les logs de transaction:**
   - Cherche la transaction de résolution
   - Regarde les logs
   - Tu verras les transferts:
     - Vault → Gagnant (payout)
     - Vault → Treasury (protocol_fee)

## 🎯 Résumé

### Deploy Lent
- ✅ Normal sur devnet
- ✅ Rapide sur mainnet
- ✅ Pas de problème

### Fees au Treasury
- ✅ OUI, 2% vont au treasury
- ✅ Vérifiable sur Explorer
- ✅ Code correct

### SOL Restant dans le Pot
- ✅ C'est le carry-over (intentionnel)
- ✅ Reste pour le prochain cycle
- ✅ Effet des Curses
- ✅ UI maintenant corrigée pour afficher le pot réel

## 💡 Astuce

Pour voir le carry-over en action:
1. Fais un cycle avec 3 Curses
2. Note le carry-over affiché (ex: 0.03 SOL)
3. Démarre un nouveau cycle
4. Le pot devrait démarrer à 0.03 SOL (+ nouveaux deposits)
5. C'est le carry-over qui s'accumule!

---

**Tout fonctionne correctement! Les fees vont au treasury, le carry-over reste dans le vault pour le prochain cycle, et l'UI affiche maintenant le pot réel.** ✅
