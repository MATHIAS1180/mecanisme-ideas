# 📁 Fichiers à Copier sur Solana Playground

## 🎯 Liste des Fichiers

Voici les 8 fichiers à copier sur Solana Playground:

### 1. `src/lib.rs`
**Chemin local:** `programs/nodus/src/lib.rs`

### 2. `src/entrypoint.rs`
**Chemin local:** `programs/nodus/src/entrypoint.rs`

### 3. `src/processor.rs` ⭐ (MODIFIÉ)
**Chemin local:** `programs/nodus/src/processor.rs`
**Note:** Ce fichier contient le fix (auto-resolve supprimé)

### 4. `src/instruction.rs`
**Chemin local:** `programs/nodus/src/instruction.rs`

### 5. `src/state.rs`
**Chemin local:** `programs/nodus/src/state.rs`

### 6. `src/utils.rs`
**Chemin local:** `programs/nodus/src/utils.rs`

### 7. `src/error.rs` ⭐ (MODIFIÉ)
**Chemin local:** `programs/nodus/src/error.rs`
**Note:** Ce fichier contient la nouvelle erreur `TimerExpired`

### 8. `Cargo.toml`
**Chemin local:** `programs/nodus/Cargo.toml`

## 📝 Instructions Détaillées

### Étape 1: Ouvrir Solana Playground
Aller sur: **https://beta.solpg.io**

### Étape 2: Créer un Nouveau Projet
1. Cliquer sur l'icône "+" en haut à gauche
2. Choisir "Anchor (Rust)"
3. Nom: `nodus`

### Étape 3: Créer les Fichiers

#### A. Fichiers qui existent déjà (remplacer le contenu):

1. **`src/lib.rs`** - Existe déjà, remplacer le contenu
2. **`Cargo.toml`** - Existe déjà, remplacer le contenu

#### B. Fichiers à créer (clic droit sur `src/` → New File):

3. **`src/entrypoint.rs`** - Créer et copier
4. **`src/processor.rs`** - Créer et copier
5. **`src/instruction.rs`** - Créer et copier
6. **`src/state.rs`** - Créer et copier
7. **`src/utils.rs`** - Créer et copier
8. **`src/error.rs`** - Créer et copier

### Étape 4: Build
1. Cliquer sur l'icône "Build" (🔨) dans la barre latérale gauche
2. Attendre 1-2 minutes
3. Vérifier qu'il n'y a pas d'erreurs

### Étape 5: Deploy
1. Cliquer sur "Deploy" dans la barre latérale
2. Sélectionner "Devnet"
3. Cliquer sur "Deploy"
4. **COPIER LE PROGRAM ID**

## 🔍 Vérification des Fichiers Modifiés

### `src/processor.rs`

**Vérifier que ces lignes N'EXISTENT PAS:**
```rust
// ❌ NE DEVRAIT PAS EXISTER:
let needs_auto_resolve = Self::assert_cycle_can_accept_paid_action(&vault, slot, false)?;
if needs_auto_resolve {
    vault = Self::auto_resolve_cycle(vault_account, protocol_fee_wallet, leader_account, vault)?;
}
```

**Vérifier que ces lignes EXISTENT:**
```rust
// ✅ DEVRAIT EXISTER:
Self::assert_cycle_can_accept_paid_action(&vault, slot, false)?;
```

**Vérifier la fonction `assert_cycle_can_accept_paid_action`:**
```rust
// ✅ DEVRAIT CONTENIR:
if vault.leader != Pubkey::default() && remaining_slots(slot, vault.timer_start_slot, vault.timer_reset_slots) == 0 {
    return Err(NodusError::TimerExpired.into()); // ✅ TimerExpired, pas TimerNotExpired
}
```

### `src/error.rs`

**Vérifier que cette ligne EXISTE:**
```rust
// ✅ DEVRAIT EXISTER:
TimerExpired = 6029,
```

## 📊 Taille des Fichiers (Référence)

| Fichier | Lignes | Taille |
|---------|--------|--------|
| `lib.rs` | ~20 | ~500 bytes |
| `entrypoint.rs` | ~15 | ~400 bytes |
| `processor.rs` | ~680 | ~25 KB |
| `instruction.rs` | ~80 | ~2.5 KB |
| `state.rs` | ~150 | ~5 KB |
| `utils.rs` | ~100 | ~3.5 KB |
| `error.rs` | ~40 | ~1.2 KB |
| `Cargo.toml` | ~20 | ~600 bytes |

## 🎯 Après le Déploiement

### 1. Sauvegarder le Program ID
Exemple: `By9yf8mRvJq3mXG2QE8nagNyZ5PCUJrfsikZUzk8otTo`

### 2. Mettre à Jour Vercel
```env
NEXT_PUBLIC_NODUS_PROGRAM_ID=<NOUVEAU_PROGRAM_ID>
```

### 3. Mettre à Jour Railway
```env
NODUS_PROGRAM_ID=<NOUVEAU_PROGRAM_ID>
```

### 4. Initialiser le Vault
Frontend → Connect admin wallet → Initialize Vault

### 5. Tester
Deposit → Timer → Expiration → Keeper bot résout → Nouveau cycle

## 🆘 Problèmes Courants

### Build Error: "cannot find module"
- Vérifier que tous les fichiers `.rs` sont créés
- Vérifier que les noms de fichiers sont corrects (pas d'espaces)

### Build Error: "unresolved import"
- Vérifier que `lib.rs` déclare tous les modules:
  ```rust
  pub mod entrypoint;
  pub mod processor;
  pub mod instruction;
  pub mod state;
  pub mod utils;
  pub mod error;
  ```

### Deploy Error: "insufficient funds"
- Demander des SOL devnet sur https://faucet.solana.com/
- Utiliser le wallet Solana Playground

## ✅ Checklist Finale

- [ ] 8 fichiers copiés sur Solana Playground
- [ ] Build réussi (pas d'erreurs)
- [ ] Deploy réussi sur Devnet
- [ ] Program ID copié
- [ ] Vercel mis à jour
- [ ] Railway mis à jour
- [ ] Vault initialisé
- [ ] Test Deposit réussi
- [ ] Timer fonctionne
- [ ] Keeper bot résout automatiquement

## 🚀 Prêt à Déployer!

Tous les fichiers sont prêts. Il suffit de les copier sur Solana Playground et de suivre les étapes ci-dessus.
