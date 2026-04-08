# Rapport d'Analyse et Corrections - Nodus Protocol

## Date: 2026-04-08

## 1. VÉRIFICATION DE COHÉRENCE

### ✅ Smart Contract vs Whitepaper

Le smart contract implémente correctement les mécaniques du whitepaper avec quelques différences:

**IMPLÉMENTÉ CORRECTEMENT:**
- ✅ Toutes les 10 instructions (Initialize, Deposit, Shield, Sabotage, Anchor, ArmSnipe, ReclaimSnipe, Curse, Blizzard, Resolve)
- ✅ Système de pression (augmente avec chaque action)
- ✅ Terminal lock à pression 40
- ✅ Limites: 5 curses, 2 anchors, 2 sabotages par wallet
- ✅ Cooldown exponentiel par wallet
- ✅ Carry-over (jusqu'à 5% du pot)
- ✅ Fee protocole de 2%
- ✅ Session wallet support
- ✅ Courbe de compression du timer (MAX_RESET_SLOTS=450, MIN_RESET_SLOTS=38, RESET_DECAY_SLOTS=12)

**NON IMPLÉMENTÉ:**
- ❌ Jitter de résolution (section 6.5 du whitepaper V2) - le whitepaper décrit un jitter de 0-4 slots pour empêcher le bot timing, mais ce n'est pas dans le code
- ❌ Événements Anchor (section 13) - le programme utilise solana-program natif, pas Anchor, donc pas d'events

### ✅ UI vs Smart Contract

L'interface utilisateur reflète correctement l'état du smart contract:

- ✅ Affichage du leader actuel (vault.leader)
- ✅ Calcul du timer à partir des slots (vault.timerStartSlot + vault.timerResetSlots)
- ✅ Affichage du pot (balance du vault - rent reserve)
- ✅ Affichage de la pression (vault.pressureCount)
- ✅ Affichage du carry-over (vault.carryOverLamports)
- ✅ Balance du session wallet
- ✅ Auto-resolve quand le timer expire
- ✅ Tous les boutons d'action correspondent aux instructions du smart contract

## 2. PROBLÈME CRITIQUE CORRIGÉ

### Incohérence des montants d'entrée

**AVANT:**
- Whitepaper V2: 0.1 SOL (100M lamports)
- Smart Contract: 0.01 SOL (10M lamports)
- SDK: 0.01 SOL (10M lamports)
- UI: 0.01 SOL

**APRÈS:**
- ✅ Whitepaper V2 corrigé: 0.01 SOL (cohérent avec l'implémentation)
- ✅ Tous les exemples numériques du whitepaper mis à jour
- ✅ Constantes du programme mises à jour dans le whitepaper

**Fichiers modifiés:**
- `volta_whitepaper_v2.md` - Sections 5.1, 8.3, 8.4, 8.5, 8.7, 8.8, 22.2

## 3. NETTOYAGE POUR VERSION BETA

### Fichiers supprimés (informations de développement)

1. ❌ `apps/web/src/app/docs/page.tsx` - Page expliquant les phases de développement
2. ❌ `docs/DEPLOY_DEVNET.md` - Procédure de déploiement (info développeur)

### Fichiers modifiés (nettoyage du contenu)

1. **README.md**
   - ✅ Transformé en documentation utilisateur
   - ✅ Supprimé les références au déploiement Vercel
   - ✅ Supprimé les détails techniques de développement
   - ✅ Ajouté des instructions claires pour les joueurs

2. **apps/web/src/app/page.tsx** (Homepage)
   - ✅ Supprimé la section "Build path" avec le timeline de développement
   - ✅ Supprimé la référence à Vercel dans "Launch profile"
   - ✅ Changé le bouton "Read the operating model" vers "/faq"
   - ✅ Simplifié le messaging pour les joueurs

3. **apps/web/src/app/about/page.tsx**
   - ✅ Réécrit pour les joueurs (pas les développeurs)
   - ✅ Supprimé les références au "design direction" et "terminal aesthetic"
   - ✅ Ajouté des explications claires sur les mécaniques
   - ✅ Ajouté une section sur le devnet beta

4. **apps/web/src/lib/site.ts**
   - ✅ Supprimé l'export `timeline` (phases de développement)
   - ✅ Mis à jour les stats de la homepage
   - ✅ Étendu la FAQ avec 12 questions pour les joueurs
   - ✅ Simplifié les `legalBullets`

5. **apps/web/src/components/site-header.tsx**
   - ✅ Supprimé le lien vers `/docs`
   - ✅ Navigation simplifiée: Play, History, FAQ, About

### Fichiers conservés (utiles pour les joueurs)

- ✅ `WHITEPAPER.md` - Spécification V1
- ✅ `volta_whitepaper_v2.md` - Spécification complète (corrigée)
- ✅ `/faq` - Questions fréquentes pour les joueurs
- ✅ `/about` - Vue d'ensemble du protocole
- ✅ `/play` - Terminal de jeu
- ✅ `/history` - Historique des cycles
- ✅ `/legal` - Informations légales

## 4. CONSTANTES DU PROTOCOLE (DEVNET)

```rust
ENTRY_LAMPORTS: 10_000_000 (0.01 SOL)
ANCHOR_LAMPORTS: 20_000_000 (0.02 SOL)
PROTOCOL_FEE_BPS: 200 (2%)
MAX_CURSES: 5
MAX_ANCHORS_PER_CYCLE: 2
MAX_SABOTAGE_PER_WALLET: 2
SHIELD_DURATION_SLOTS: 30 (~15s)
TERMINAL_LOCK_PRESSURE: 40
MIN_RESET_SLOTS: 38 (~19s)
MAX_RESET_SLOTS: 450 (~225s)
RESET_DECAY_SLOTS: 12
```

## 5. MÉCANIQUES DU JEU

### Actions disponibles

| Action | Coût | Effet | Limite |
|--------|------|-------|--------|
| Deposit | 0.01 SOL | Prend le leadership, reset timer | Cooldown |
| Shield | 0.01 SOL | Bloque les deposits temporairement | 1x/wallet/cycle, leader only |
| Sabotage | 0.01 SOL | Divise le temps restant par 2 | 2x/wallet/cycle, non-leader |
| Anchor | 0.02 SOL | Reset timer au maximum | 1x/wallet, 2x/cycle, leader only |
| Curse | 0.01 SOL | Réduit le gain du gagnant de 1% | 1x/wallet/cycle, max 5/cycle |
| Blizzard | 0.01 SOL | Ajoute au pot sans prendre leadership | Cooldown |
| ArmSnipe | 0.01 SOL | Piège le prochain deposit | Expire après 60s |

### Système de pression

- Chaque action irréversible augmente la pression
- Plus la pression est élevée, plus les futurs resets sont courts
- À pression 40: terminal lock (plus d'actions payantes)
- Formule de reset: `max(MIN_RESET_SLOTS, MAX_RESET_SLOTS - (pressure-1) * RESET_DECAY_SLOTS)`

### Redistribution

- Gagnant: 98% du pot - (curse_count%)
- Protocole: 2% du pot
- Carry-over: curse_count% du pot → cycle suivant

## 6. BUILD ET DÉPLOIEMENT

### Build réussi ✅

```bash
npm install
npm run build  # dans apps/web
```

**Résultat:**
- ✅ Compilation réussie
- ✅ 9 pages générées
- ✅ Pas d'erreurs TypeScript
- ⚠️ 2 warnings ESLint mineurs (non-bloquants)

### Pages générées

- `/` - Homepage
- `/play` - Terminal de jeu
- `/about` - À propos
- `/faq` - FAQ
- `/history` - Historique
- `/legal` - Légal

## 7. RECOMMANDATIONS

### Implémentation manquante (optionnel)

1. **Jitter de résolution** - Ajouter le jitter de 0-4 slots pour empêcher le bot timing exact
2. **Événements on-chain** - Considérer l'ajout de logs pour le tracking (même sans Anchor)
3. **Viewer mode** - Implémenter `/watch/live` pour les spectateurs (mentionné dans whitepaper V2)

### Améliorations UX

1. Ajouter des tooltips sur les actions pour expliquer les effets
2. Afficher visuellement la courbe de compression du timer
3. Ajouter des animations pour les "moments clipables" (sabotage critique, snipe, etc.)
4. Implémenter la "Resolution Card" auto-générée (section 12 du whitepaper)

### Documentation

1. Créer un guide de démarrage rapide pour les nouveaux joueurs
2. Ajouter des exemples de stratégies dans la FAQ
3. Documenter les cas d'usage de chaque action spéciale

## 8. RÉSUMÉ

✅ **Smart contract vérifié** - Implémente correctement les mécaniques du whitepaper
✅ **UI vérifiée** - Reflète fidèlement l'état du smart contract
✅ **Whitepaper corrigé** - Montants d'entrée cohérents (0.01 SOL)
✅ **Site nettoyé** - Informations de développement supprimées
✅ **Build fonctionnel** - Prêt pour le déploiement devnet
✅ **Documentation joueur** - README et pages web adaptés pour les utilisateurs finaux

Le projet est maintenant prêt pour la version beta sur devnet avec un site web orienté joueurs.
