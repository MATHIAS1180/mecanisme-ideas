# Fix: Cycle Logic & Error 0x1788 (NoLeader)

## Date: 2026-04-08

## 🎯 Problème Principal

Le cycle restait bloqué après résolution avec l'erreur:
```
Error processing Instruction 0: custom program error: 0x1788
```

L'utilisateur ne comprenait pas pourquoi il devait "initialiser" le jeu à chaque cycle.

## 🔍 Analyse du Problème

### Erreur 0x1788 = NoLeader

Dans `programs/nodus/src/error.rs`:
```rust
NoLeader = 6024  // 0x1788 en hexadécimal
```

Cette erreur est levée dans `process_resolve()` quand:
```rust
if vault.leader == Pubkey::default() {
    return Err(NodusError::NoLeader.into());
}
```

### Pourquoi ça arrivait?

1. **Après un Resolve réussi**, le smart contract reset le vault:
   ```rust
   vault.leader = Pubkey::default();  // Adresse vide
   vault.timer_start_slot = 0;
   vault.timer_reset_slots = 0;
   vault.cycle_number += 1;
   ```

2. **L'UI continuait à essayer d'auto-resolve** même quand `leader == Pubkey::default()`

3. **Le smart contract rejetait** avec `NoLeader` car il n'y a personne à payer

## ✅ Solution Implémentée

### 1. Vérification stricte dans l'auto-resolve

**Fichier:** `apps/web/src/app/play/page.tsx`

```typescript
// AVANT (bugué)
if (remainingSeconds === 0 && !autoResolving && programId && sessionWallet)

// APRÈS (corrigé)
if (
  remainingSeconds === 0 && 
  !autoResolving && 
  programId && 
  sessionWallet && 
  vault && 
  vault.leader && 
  vault.leader !== "11111111111111111111111111111111"  // ← Vérification critique
)
```

### 2. État vide visuel

Quand `vault.leader == "11111111111111111111111111111111"`:
- Affiche une icône de jeu flottante
- Message: "Aucun cycle actif"
- Instructions: "Sois le premier à démarrer un nouveau cycle!"
- Pas de graphique animé (évite la confusion)

### 3. Clear des messages entre cycles

```typescript
if (isNewCycle) {
  setNotice(null);
  setError(null);
  setAutoResolving(false);
  setCycleStatus("");
}
```

### 4. Bouton Initialize conditionnel

```typescript
{!vault?.initialized && (
  <div className="button-row">
    <button onClick={handleInitialize}>Initialize vault</button>
  </div>
)}
```

## 📊 Flow Complet du Cycle

```
┌─────────────────────────────────────────────────────────────┐
│ 1. VAULT INITIALISÉ (une seule fois au début)              │
│    vault.initialized = true                                 │
│    vault.leader = Pubkey::default()                         │
│    vault.cycle_number = 1                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ÉTAT VIDE (prêt pour un nouveau cycle)                  │
│    UI: Affiche icône flottante + message                   │
│    Auto-resolve: DÉSACTIVÉ (pas de leader)                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ Joueur clique "Deposit"
┌─────────────────────────────────────────────────────────────┐
│ 3. CYCLE ACTIF                                              │
│    vault.leader = joueur.publicKey                          │
│    vault.timer_start_slot = current_slot                    │
│    vault.timer_reset_slots = 450                            │
│    UI: Graphique animé + timer                              │
│    Auto-resolve: ACTIVÉ (leader existe)                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ Actions (Deposit, Shield, etc.)
┌─────────────────────────────────────────────────────────────┐
│ 4. ACTIONS PENDANT LE CYCLE                                 │
│    - Deposit: Change leader, reset timer                    │
│    - Shield: Bloque deposits (leader-only)                  │
│    - Sabotage: Divise timer par 2 (non-leader)             │
│    - Anchor: Reset timer au max (leader-only, 2 entrées)   │
│    - Curse: Réduit gain du gagnant                          │
│    - Blizzard: Ajoute au pot sans prendre leadership       │
│    - ArmSnipe: Piège le prochain deposit                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ Timer = 0
┌─────────────────────────────────────────────────────────────┐
│ 5. FIN DU CYCLE                                             │
│    Condition: current_slot >= timer_start + timer_reset     │
│    Auto-resolve: Envoie automatiquement Resolve             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. RESOLVE (distribution des gains)                         │
│    Gagnant: pot * (98% - curse_count%)                      │
│    Protocole: pot * 2%                                      │
│    Carry-over: pot * curse_count%                           │
│                                                              │
│    RESET DU VAULT:                                          │
│    vault.leader = Pubkey::default() ← Retour à l'état vide │
│    vault.timer_start_slot = 0                               │
│    vault.timer_reset_slots = 0                              │
│    vault.pressure_count = 0                                 │
│    vault.cycle_number += 1                                  │
│    vault.carry_over_lamports = carry (conservé)             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ Retour à l'étape 2
```

## 🎮 Expérience Utilisateur Corrigée

### Avant (bugué)
1. Joueur fait un deposit → Cycle démarre
2. Timer arrive à 0 → Auto-resolve
3. **Erreur 0x1788** → Cycle bloqué
4. UI confuse, joueur ne sait pas quoi faire
5. Joueur pense qu'il faut réinitialiser

### Après (corrigé)
1. Joueur fait un deposit → Cycle démarre
2. Timer arrive à 0 → Auto-resolve réussit
3. **Nouveau cycle prêt** → État vide affiché
4. UI claire: "Aucun cycle actif, clique Deposit pour démarrer"
5. Joueur comprend qu'il peut démarrer un nouveau cycle

## 🔧 Pas de Réinitialisation Nécessaire

**Important:** Le vault n'a besoin d'être initialisé qu'UNE SEULE FOIS.

- ✅ `Initialize` crée le vault PDA
- ✅ Le vault reste initialisé pour toujours
- ✅ Les cycles s'enchaînent automatiquement
- ✅ Après chaque `Resolve`, le vault est prêt pour un nouveau cycle
- ✅ L'utilisateur n'a qu'à faire `Deposit` pour démarrer un nouveau cycle

## 📝 Fichiers Modifiés

1. **apps/web/src/app/play/page.tsx**
   - Ajout de la vérification `vault.leader !== "11111111111111111111111111111111"`
   - Ajout de l'état vide visuel
   - Clear des messages entre cycles
   - Bouton Initialize conditionnel

2. **FIXES_APPLIED.md**
   - Documentation complète du problème et de la solution
   - Explication de la logique du cycle
   - Section troubleshooting

3. **CYCLE_LOGIC_FIX.md** (ce fichier)
   - Analyse détaillée du problème
   - Flow complet du cycle
   - Comparaison avant/après

## 🚀 Déploiement

**Program ID:** `5jtFgAFEeHn7Y7Qh5gS5axc8gWVPRnuekFey1P4cee2x`  
**Network:** Solana Devnet  
**Status:** ✅ Déployé et fonctionnel

**Variables Vercel:**
```
NEXT_PUBLIC_NODUS_PROGRAM_ID=5jtFgAFEeHn7Y7Qh5gS5axc8gWVPRnuekFey1P4cee2x
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

## ✅ Résultat

- ✅ Plus d'erreur 0x1788
- ✅ Cycles qui s'enchaînent automatiquement
- ✅ UX claire pour les nouveaux joueurs
- ✅ Pas besoin de réinitialiser entre les cycles
- ✅ État vide visuellement distinct
- ✅ Messages d'erreur qui se clear automatiquement

Le jeu fonctionne maintenant comme prévu! 🎉
