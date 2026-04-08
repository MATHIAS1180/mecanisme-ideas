# Corrections Appliquées - Nodus Protocol

## Date: 2026-04-08

## 🐛 Problèmes Résolus

### 1. Erreur 0x1788 (NoLeader) - Cycle bloqué après résolution ✅

**Problème:** Le cycle restait bloqué après résolution avec l'erreur `0x1788` (NoLeader). L'auto-resolve essayait de résoudre un cycle vide.

**Cause Racine:** 
1. Après un `Resolve`, le smart contract reset `vault.leader = Pubkey::default()` (adresse vide)
2. L'UI continuait à essayer d'auto-resolve même quand `leader == "11111111111111111111111111111111"`
3. Le smart contract retourne l'erreur `NoLeader` (0x1788) car il n'y a pas de gagnant à payer

**Solution Complète:**

```typescript
// Condition stricte pour l'auto-resolve
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

**Logique du Cycle:**
1. **Cycle actif:** `vault.leader != Pubkey::default()` → Timer actif, auto-resolve possible
2. **Après resolve:** `vault.leader = Pubkey::default()` → Retour à l'état vide, pas d'auto-resolve
3. **Nouveau cycle:** Un joueur fait `Deposit` → `vault.leader` est assigné, nouveau cycle démarre

### 2. Bouton "Initialize vault" toujours visible ✅

**Problème:** Le bouton "Initialize vault" était toujours affiché même quand le vault était déjà initialisé.

**Solution:** Le bouton n'apparaît maintenant que si `!vault?.initialized`

### 3. Pas d'indication visuelle quand aucun cycle n'est actif ✅

**Problème:** Le graphique affichait des données vides/incorrectes quand personne n'avait encore démarré de cycle.

**Solution:** Ajout d'un état vide avec:
- Icône de jeu animée (flottante)
- Message clair: "Aucun cycle actif"
- Instructions: "Sois le premier à démarrer un nouveau cycle!"
- Indication: "Clique sur Deposit pour prendre le leadership"

### 4. Messages d'erreur persistants entre cycles ✅

**Problème:** Les messages d'erreur et de statut restaient affichés après le début d'un nouveau cycle.

**Solution:** Clear automatique de tous les états lors de la détection d'un nouveau cycle:
```typescript
if (isNewCycle) {
  setNotice(null);
  setError(null);
  setAutoResolving(false);
  setCycleStatus("");
}
```

## 🎨 Améliorations UX

### État vide du graphique

Quand aucun cycle n'est actif, l'utilisateur voit maintenant:
```
🎮 (icône animée)
Aucun cycle actif
Sois le premier à démarrer un nouveau cycle!
Clique sur "Deposit" pour prendre le leadership et démarrer le timer.
```

### Statut du vault plus clair

```
Vault status: ✅ Ready  (au lieu de "Detected")
Current cycle: #1
```

### Suppression du lien "Review operator docs"

Le lien vers `/docs` (qui n'existe plus) a été supprimé.

## 📋 Logique du Jeu Clarifiée

### Comprendre le Cycle de Vie

**Le vault n'a besoin d'être initialisé qu'UNE SEULE FOIS.** Après ça, les cycles s'enchaînent automatiquement sans réinitialisation.

### Cycle de vie d'un cycle:

1. **État initial (après Initialize ou après Resolve):**
   - `vault.initialized = true` ✅
   - `vault.leader = Pubkey::default()` (adresse vide: "11111111111111111111111111111111")
   - `vault.timer_start_slot = 0`
   - `vault.timer_reset_slots = 0`
   - `vault.cycle_number` incrémente à chaque resolve
   - UI affiche l'état vide avec l'icône flottante

2. **Premier deposit (démarrage du cycle):**
   - Un joueur clique sur "Deposit" et paie 0.01 SOL
   - `vault.leader = joueur.publicKey` ← Leader assigné
   - `vault.timer_start_slot = current_slot`
   - `vault.timer_reset_slots = 450` (max = ~3 minutes)
   - `vault.pressure_count = 1`
   - Le graphique s'anime et le timer démarre

3. **Actions pendant le cycle:**
   - **Deposit:** Change le leader, reset le timer (0.01 SOL)
   - **Shield:** Leader-only, bloque les deposits 30 slots (0.01 SOL)
   - **Sabotage:** Non-leader, divise le temps restant par 2 (0.01 SOL)
   - **Anchor:** Leader-only, reset le timer au max (0.02 SOL = 2 entrées)
   - **Curse:** Réduit le gain du gagnant de 1% (0.01 SOL)
   - **Blizzard:** Ajoute au pot sans prendre leadership (0.01 SOL)
   - **ArmSnipe:** Piège le prochain deposit (0.01 SOL en escrow)

4. **Fin du cycle (timer = 0):**
   - **Condition:** `current_slot >= vault.timer_start_slot + vault.timer_reset_slots`
   - **Auto-resolve:** Si `vault.leader != Pubkey::default()`, l'UI envoie automatiquement `Resolve`
   - **Pas d'auto-resolve:** Si `vault.leader == Pubkey::default()`, rien ne se passe (cycle vide)

5. **Resolve (distribution des gains):**
   - Gagnant reçoit: `pot * (98% - curse_count%)`
   - Protocole reçoit: `pot * 2%`
   - Carry-over: `pot * curse_count%` → cycle suivant
   - **Reset du vault:**
     ```rust
     vault.leader = Pubkey::default();  // ← Retour à l'état vide
     vault.timer_start_slot = 0;
     vault.timer_reset_slots = 0;
     vault.pressure_count = 0;
     vault.terminal_lock = false;
     vault.shield_expires_slot = 0;
     vault.anchor_count = 0;
     vault.curse_count = 0;
     vault.cycle_number += 1;  // ← Nouveau cycle
     vault.carry_over_lamports = carry;  // ← Conservé
     ```

6. **Après resolve (nouveau cycle prêt):**
   - Retour à l'état initial (étape 1)
   - Le vault reste initialisé
   - Prêt pour un nouveau deposit
   - Carry-over disponible pour le prochain gagnant

## 🔧 Pas besoin d'initialiser à chaque cycle

**Important:** L'utilisateur n'a besoin d'initialiser le vault qu'UNE SEULE FOIS au tout début. Après ça:

1. ✅ Le vault reste initialisé pour toujours
2. ✅ Les cycles se succèdent automatiquement
3. ✅ Après chaque resolve, un nouveau cycle démarre automatiquement
4. ✅ L'utilisateur n'a qu'à créer son session wallet et jouer

## 🎮 Flow Utilisateur Idéal

```
1. Connecter wallet Phantom/Solflare
   ↓
2. Fund session wallet (une seule fois, ex: 0.1 SOL)
   ↓
3. Cliquer sur "Deposit" pour démarrer/rejoindre un cycle
   ↓
4. Utiliser les actions spéciales (Shield, Sabotage, etc.)
   ↓
5. Le cycle se résout automatiquement quand le timer expire
   ↓
6. Nouveau cycle démarre automatiquement
   ↓
7. Retour à l'étape 3 (tant qu'il reste du budget session)
```

## 📊 Vérifications On-Chain

L'UI reflète maintenant correctement l'état on-chain:

- ✅ Leader actuel: `vault.leader`
- ✅ Timer: Calculé depuis `vault.timer_start_slot + vault.timer_reset_slots`
- ✅ Pression: `vault.pressure_count / 40`
- ✅ Pot: Balance du vault PDA - rent reserve
- ✅ Carry-over: `vault.carry_over_lamports`
- ✅ Curses: `vault.curse_count / 5`
- ✅ Terminal lock: `vault.terminal_lock`
- ✅ Numéro de cycle: `vault.cycle_number`

## 🚀 Déploiement

**Program ID:** `5jtFgAFEeHn7Y7Qh5gS5axc8gWVPRnuekFey1P4cee2x`  
**Network:** Solana Devnet  
**Status:** ✅ Déployé et fonctionnel

## 📝 Variables Vercel

Assure-toi que ces variables sont configurées sur Vercel:

```
NEXT_PUBLIC_NODUS_PROGRAM_ID=5jtFgAFEeHn7Y7Qh5gS5axc8gWVPRnuekFey1P4cee2x
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

## ✅ Tests à Effectuer

1. **Vault vide (aucun cycle actif):**
   - ✅ Affiche l'état vide avec icône animée
   - ✅ Pas d'auto-resolve
   - ✅ Bouton Initialize visible seulement si nécessaire
   - ✅ Message: "Aucun cycle actif"

2. **Premier deposit:**
   - ✅ Le graphique s'affiche
   - ✅ Le timer démarre
   - ✅ La pression augmente
   - ✅ Leader affiché correctement

3. **Fin de cycle:**
   - ✅ Auto-resolve quand timer = 0 ET leader existe
   - ✅ Gagnant reçoit les SOL
   - ✅ Nouveau cycle démarre automatiquement
   - ✅ Pas d'erreur 0x1788

4. **Nouveau cycle:**
   - ✅ Retour à l'état vide
   - ✅ Prêt pour un nouveau deposit
   - ✅ Carry-over affiché si présent
   - ✅ Messages d'erreur précédents effacés

## 🔍 Troubleshooting

### Erreur 0x1788 (NoLeader)

**Symptôme:** "Error processing Instruction 0: custom program error: 0x1788"

**Cause:** L'instruction `Resolve` a été appelée alors qu'aucun leader n'existe (`vault.leader == Pubkey::default()`).

**Solution:** Cette erreur ne devrait plus apparaître grâce à la vérification dans l'auto-resolve. Si elle persiste:
1. Vérifie que le code UI contient bien la condition `vault.leader !== "11111111111111111111111111111111"`
2. Vérifie que le vault est bien initialisé
3. Vérifie qu'un joueur a bien fait un deposit avant que le timer n'expire

### Cycle "bloqué"

**Symptôme:** Le cycle semble bloqué, rien ne se passe.

**Diagnostic:**
1. Vérifie `vault.leader`:
   - Si `"11111111111111111111111111111111"` → Cycle vide, besoin d'un deposit
   - Si autre adresse → Cycle actif
2. Vérifie `remainingSeconds`:
   - Si > 0 → Cycle en cours
   - Si = 0 et leader existe → Auto-resolve devrait se déclencher
   - Si = 0 et pas de leader → État normal (cycle vide)

**Solution:** Clique sur "Deposit" pour démarrer un nouveau cycle.

### Timer ne se met pas à jour

**Symptôme:** Le timer reste figé après un resolve.

**Cause:** Le polling RPC peut être ralenti ou le vault n'est pas encore mis à jour on-chain.

**Solution:** 
1. Attends 2-3 secondes (le polling se fait toutes les 2 secondes)
2. Vérifie que tu n'as pas d'erreur 429 (trop de requêtes RPC)
3. Si le problème persiste, rafraîchis la page

## 🎉 Résultat

Le jeu fonctionne maintenant correctement:
- ✅ Pas d'erreur 0x1788
- ✅ UX claire pour les nouveaux joueurs
- ✅ Cycles qui s'enchaînent automatiquement
- ✅ Graphique qui reflète l'état réel
- ✅ Pas besoin de réinitialiser entre les cycles

Tout est prêt pour jouer! 🚀
