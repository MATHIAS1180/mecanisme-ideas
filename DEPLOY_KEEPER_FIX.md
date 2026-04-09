# 🚀 Déploiement du Fix Keeper Bot

## ✅ Changements Effectués

Le smart contract a été corrigé pour supprimer TOUTE la logique d'auto-résolution qui causait l'erreur:
```
sum of account balances before and after instruction do not match
```

### Modifications dans `processor.rs`:

1. **Supprimé tous les appels à `auto_resolve_cycle`** dans:
   - `process_sabotage`
   - `process_anchor`
   - `process_arm_snipe`
   - `process_curse`
   - `process_blizzard`

2. **Modifié `assert_cycle_can_accept_paid_action`**:
   - Retourne maintenant `ProgramResult` (au lieu de `Result<bool, ProgramError>`)
   - Rejette simplement les actions si le timer est expiré (erreur `TimerExpired`)
   - Ne tente PLUS d'auto-résoudre le cycle

3. **Ajouté l'erreur `TimerExpired`** dans `error.rs`:
   - Code: 6029
   - Utilisée pour indiquer qu'un cycle doit être résolu par le keeper bot

### Fonction `auto_resolve_cycle` conservée mais jamais appelée:
- La fonction existe toujours dans le code
- Elle n'est JAMAIS appelée par aucune instruction
- Seul `process_resolve` (appelé par le keeper bot) résout les cycles

## 📋 Étapes de Déploiement

### Option 1: Solana Playground (RECOMMANDÉ - Pas besoin de Rust local)

1. **Aller sur https://beta.solpg.io**

2. **Créer un nouveau projet Anchor**:
   - Cliquer sur "Create a new project"
   - Choisir "Anchor (Rust)"
   - Nom: `nodus`

3. **Copier les fichiers**:
   
   Copier le contenu de ces fichiers dans Solana Playground:
   
   - `programs/nodus/src/lib.rs` → `src/lib.rs`
   - `programs/nodus/src/entrypoint.rs` → `src/entrypoint.rs`
   - `programs/nodus/src/processor.rs` → `src/processor.rs`
   - `programs/nodus/src/instruction.rs` → `src/instruction.rs`
   - `programs/nodus/src/state.rs` → `src/state.rs`
   - `programs/nodus/src/utils.rs` → `src/utils.rs`
   - `programs/nodus/src/error.rs` → `src/error.rs`
   - `programs/nodus/Cargo.toml` → `Cargo.toml`

4. **Build**:
   - Cliquer sur "Build" (icône marteau)
   - Attendre la compilation (1-2 minutes)

5. **Deploy sur Devnet**:
   - Cliquer sur "Deploy"
   - Choisir "Devnet"
   - Copier le Program ID affiché

6. **Sauvegarder le Program ID**:
   ```
   [COLLER ICI LE PROGRAM ID]
   ```

### Option 2: Local (Si Rust est installé)

```powershell
# Dans PowerShell ADMINISTRATEUR
cd mecanisme-ideas/programs/nodus
cargo-build-sbf
solana program deploy target/deploy/nodus.so --program-id ../../keys/nodus-devnet-program.json
```

## 🔧 Mise à Jour du Frontend

Une fois le nouveau Program ID obtenu:

1. **Mettre à jour `.env.local`**:
   ```env
   NEXT_PUBLIC_NODUS_PROGRAM_ID=<NOUVEAU_PROGRAM_ID>
   ```

2. **Mettre à jour Vercel**:
   - Aller sur Vercel Dashboard
   - Settings → Environment Variables
   - Modifier `NEXT_PUBLIC_NODUS_PROGRAM_ID`
   - Redéployer

## 🤖 Mise à Jour du Keeper Bot

1. **Mettre à jour Railway**:
   - Aller sur Railway Dashboard
   - Variables → `NODUS_PROGRAM_ID`
   - Modifier avec le nouveau Program ID
   - Redéployer

## 🧪 Tests à Effectuer

Après le déploiement:

1. **Initialiser le vault** (si nouveau Program ID):
   ```bash
   # Sur le frontend, cliquer sur "Initialize Vault" (admin seulement)
   ```

2. **Tester Deposit**:
   - Faire un Deposit (0.01 SOL)
   - Vérifier qu'il n'y a PLUS l'erreur "sum of account balances"
   - Le timer devrait démarrer normalement

3. **Attendre l'expiration du timer**:
   - Attendre que le timer arrive à 0:00
   - Le keeper bot devrait automatiquement résoudre le cycle
   - Un nouveau cycle devrait démarrer

4. **Vérifier les logs du keeper bot**:
   ```
   # Sur Railway, vérifier les logs
   # Devrait voir: "✅ Cycle resolved successfully"
   ```

## 🎯 Résultat Attendu

Après ce fix:

✅ **Deposit fonctionne** sans erreur de balance
✅ **Timer s'affiche correctement** et compte à rebours
✅ **Keeper bot résout automatiquement** les cycles expirés
✅ **Nouveau cycle démarre** après résolution
✅ **Pas de conflit de lamports** entre auto-resolve et manual resolve

## 📝 Fichiers Modifiés

- `programs/nodus/src/processor.rs` - Supprimé auto-resolve logic
- `programs/nodus/src/error.rs` - Ajouté TimerExpired error

## 🔍 Vérification

Pour vérifier que le fix est appliqué, chercher dans `processor.rs`:

```rust
// ❌ NE DEVRAIT PLUS EXISTER:
let needs_auto_resolve = Self::assert_cycle_can_accept_paid_action(&vault, slot, false)?;
if needs_auto_resolve {
    vault = Self::auto_resolve_cycle(vault_account, protocol_fee_wallet, leader_account, vault)?;
}

// ✅ DEVRAIT ÊTRE:
Self::assert_cycle_can_accept_paid_action(&vault, slot, false)?;
```

La fonction `auto_resolve_cycle` existe toujours mais n'est JAMAIS appelée.
