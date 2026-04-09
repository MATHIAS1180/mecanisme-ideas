# 🎮 FLOW VISUEL DU JEU - NODUS

## 📊 Diagramme Complet du Cycle de Jeu

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                         🎮 NODUS GAME FLOW                                ║
╚═══════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  PHASE 1: INITIALISATION                                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  1. Déploiement du Smart Contract                              │  │
│  │     └─> Program ID généré                                       │  │
│  │                                                                  │  │
│  │  2. Initialize Vault (une seule fois)                           │  │
│  │     ├─> Vault PDA créé                                          │  │
│  │     ├─> Protocol Fee: 2%                                        │  │
│  │     ├─> Cycle Number: 1                                         │  │
│  │     └─> Leader: 11111...1 (default)                             │  │
│  │                                                                  │  │
│  │  3. État Initial                                                │  │
│  │     ├─> Timer: 0                                                │  │
│  │     ├─> Pot: 0 SOL                                              │  │
│  │     ├─> Pressure: 0                                             │  │
│  │     └─> Terminal Lock: false                                    │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│                              ↓                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  PHASE 2: ATTENTE DU PREMIER JOUEUR                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                                                                  │  │
│  │                         🎮                                       │  │
│  │                  (Animation float)                               │  │
│  │                                                                  │  │
│  │              Aucun cycle actif                                   │  │
│  │                                                                  │  │
│  │     Sois le premier à démarrer un nouveau cycle!                │  │
│  │                                                                  │  │
│  │     Clique sur "💰 Deposit" pour prendre le leadership          │  │
│  │     et démarrer le timer.                                       │  │
│  │                                                                  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│                              ↓                                          │
│                      [Joueur A fait Deposit]                            │
│                              ↓                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  PHASE 3: CYCLE ACTIF                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  État après Premier Deposit:                                    │  │
│  │  ├─> Leader: Joueur A                                           │  │
│  │  ├─> Timer: 450 slots (~3.4 minutes)                            │  │
│  │  ├─> Pot: 0.01 SOL                                              │  │
│  │  ├─> Pressure: 1                                                │  │
│  │  └─> Toutes les actions débloquées                              │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  Actions Disponibles:                                           │  │
│  │                                                                  │  │
│  │  Pour le Leader (Joueur A):                                     │  │
│  │  ├─> 🛡️ Shield (bloque deposits 30 slots)                      │  │
│  │  └─> ⚓ Anchor (reset timer au max)                             │  │
│  │                                                                  │  │
│  │  Pour les Non-Leaders:                                          │  │
│  │  ├─> 💰 Deposit (prendre le lead)                               │  │
│  │  └─> 💣 Sabotage (couper le timer)                              │  │
│  │                                                                  │  │
│  │  Pour Tous:                                                      │  │
│  │  ├─> 🎯 ArmSnipe (piéger le prochain)                           │  │
│  │  ├─> 👻 Curse (réduire gains)                                   │  │
│  │  └─> ❄️ Blizzard (augmenter pot)                                │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│                              ↓                                          │
│                    [Actions des joueurs]                                │
│                              ↓                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  SCÉNARIOS POSSIBLES PENDANT LE CYCLE                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                         │
│  Scénario A: Compétition Simple                                        │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  1. Joueur A fait Deposit → Leader                              │  │
│  │  2. Joueur B fait Deposit → Prend le lead                       │  │
│  │  3. Joueur A fait Deposit → Reprend le lead                     │  │
│  │  4. Timer expire → Joueur A gagne                               │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  Scénario B: Shield Defense                                            │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  1. Joueur A fait Deposit → Leader                              │  │
│  │  2. Joueur A fait Shield → Bloque deposits                      │  │
│  │  3. Joueur B essaie Deposit → ❌ BLOQUÉ                         │  │
│  │  4. Attendre 30 slots → Shield expire                           │  │
│  │  5. Joueur B peut maintenant Deposit                            │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  Scénario C: Sabotage Attack                                           │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  1. Joueur A fait Deposit → Leader, Timer: 450 slots           │  │
│  │  2. Joueur B fait Sabotage → Timer: 225 slots                  │  │
│  │  3. Joueur C fait Sabotage → Timer: 112 slots                  │  │
│  │  4. Pression augmente rapidement                                │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  Scénario D: Snipe Trap                                                │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  1. Joueur A fait Deposit → Leader                              │  │
│  │  2. Joueur B fait ArmSnipe → Piège armé                         │  │
│  │  3. Joueur C fait Deposit → 💥 PIÉGÉ !                          │  │
│  │  4. Joueur B devient leader avec +2 pression                    │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  Scénario E: Terminal Lock                                             │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  1. Pression atteint 40                                         │  │
│  │  2. Terminal Lock activé 🔒                                     │  │
│  │  3. Plus d'actions possibles sauf Resolve                       │  │
│  │  4. Attendre timer = 0                                          │  │
│  │  5. Auto-resolve déclenché                                      │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  PHASE 4: TIMER EXPIRE                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                                                                  │  │
│  │                         ⏱️                                       │  │
│  │                  (Animation pulse)                               │  │
│  │                                                                  │  │
│  │                  Cycle Terminé                                   │  │
│  │                                                                  │  │
│  │           En attente de résolution...                            │  │
│  │                                                                  │  │
│  │     ⏳ Résolution automatique en cours...                        │  │
│  │                                                                  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│                              ↓                                          │
│                      [Auto-resolve déclenché]                           │
│                              ↓                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  PHASE 5: RESOLVE (Distribution des Gains)                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  Calcul des Gains:                                              │  │
│  │                                                                  │  │
│  │  Pot Total: 0.50 SOL                                            │  │
│  │  ├─> Protocol Fee (2%): 0.01 SOL → Fee Wallet                  │  │
│  │  ├─> Carry-over (3 curses): 0.015 SOL → Cycle suivant          │  │
│  │  └─> Payout: 0.475 SOL → Leader (Gagnant)                      │  │
│  │                                                                  │  │
│  │  Distribution:                                                   │  │
│  │  ├─> Vault → Leader: 0.475 SOL                                 │  │
│  │  ├─> Vault → Fee Wallet: 0.01 SOL                              │  │
│  │  └─> Carry-over stocké dans vault                               │  │
│  │                                                                  │  │
│  │  Reset du Vault:                                                │  │
│  │  ├─> Leader: 11111...1 (default)                                │  │
│  │  ├─> Timer: 0                                                   │  │
│  │  ├─> Pressure: 0                                                │  │
│  │  ├─> Terminal Lock: false                                       │  │
│  │  ├─> Shield: 0                                                  │  │
│  │  ├─> Anchors: 0                                                 │  │
│  │  ├─> Curses: 0                                                  │  │
│  │  ├─> Snipe: cleared                                             │  │
│  │  └─> Cycle Number: +1                                           │  │
│  │                                                                  │  │
│  │  Stockage Historique:                                           │  │
│  │  ├─> Last Resolved Winner: Joueur A                            │  │
│  │  ├─> Last Resolved Payout: 0.475 SOL                           │  │
│  │  ├─> Last Cycle Pot: 0.50 SOL                                  │  │
│  │  └─> Last Cycle Pressure: 35                                   │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│                              ↓                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  PHASE 6: NOTIFICATION DU GAGNANT                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                         │
│  ╔═══════════════════════════════════════════════════════════════╗    │
│  ║                                                               ║    │
│  ║                         🏆                                    ║    │
│  ║                                                               ║    │
│  ║                  CYCLE TERMINÉ !                              ║    │
│  ║                                                               ║    │
│  ║  ┌─────────────────────────────────────────────────────────┐ ║    │
│  ║  │  Gagnant                                                │ ║    │
│  ║  │  7xKX...AsU                                             │ ║    │
│  ║  └─────────────────────────────────────────────────────────┘ ║    │
│  ║                                                               ║    │
│  ║  ┌─────────────────────────────────────────────────────────┐ ║    │
│  ║  │  Gains                                                  │ ║    │
│  ║  │  0.475 SOL                                              │ ║    │
│  ║  └─────────────────────────────────────────────────────────┘ ║    │
│  ║                                                               ║    │
│  ║  Un nouveau cycle commence maintenant !                       ║    │
│  ║                                                               ║    │
│  ║  [Continuer]                                                  ║    │
│  ║                                                               ║    │
│  ║  🎊 🎉 ✨ 🎊 🎉 ✨ 🎊 🎉                                      ║    │
│  ║  (Confettis animés)                                           ║    │
│  ║                                                               ║    │
│  ╚═══════════════════════════════════════════════════════════════╝    │
│                                                                         │
│                              ↓                                          │
│                    [Auto-fermeture après 8s]                            │
│                              ↓                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  PHASE 7: NOUVEAU CYCLE                                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  Retour à l'État d'Attente:                                     │  │
│  │  ├─> Cycle Number: 2                                            │  │
│  │  ├─> Leader: 11111...1 (default)                                │  │
│  │  ├─> Timer: 0                                                   │  │
│  │  ├─> Pot: 0.015 SOL (carry-over du cycle précédent)            │  │
│  │  ├─> Pressure: 0                                                │  │
│  │  └─> En attente du premier deposit                              │  │
│  │                                                                  │  │
│  │  User States Reset:                                             │  │
│  │  ├─> Tous les flags reset pour le nouveau cycle                │  │
│  │  ├─> Shield used: false                                         │  │
│  │  ├─> Sabotage count: 0                                          │  │
│  │  ├─> Anchor used: false                                         │  │
│  │  ├─> Curse used: false                                          │  │
│  │  └─> Action count: 0                                            │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│                              ↓                                          │
│                    [Retour à la Phase 2]                                │
│                              ↓                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════════════════╗
║                         🔄 LE CYCLE RECOMMENCE                            ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 📊 Diagramme de Pression

```
Pression: 0 ──────────────────────────────────────────────> 40 (Terminal Lock)
          │                                                  │
          │                                                  │
          ├─────┬─────┬─────┬─────┬─────┬─────┬─────┬──────┤
          0     5    10    15    20    25    30    35    40
          │                                                  │
          │                                                  │
Timer:  450 ──────────────────────────────────────────────> 38
      (~3.4m)                                            (~17s)

Formule: Timer = MAX_RESET_SLOTS - (pressure × DECAY_SLOTS)
         Timer = 450 - (pressure × 12)

Exemples:
- Pressure 0  → Timer 450 slots (~3.4 minutes)
- Pressure 10 → Timer 330 slots (~2.5 minutes)
- Pressure 20 → Timer 210 slots (~1.6 minutes)
- Pressure 30 → Timer 90 slots (~40 secondes)
- Pressure 40 → Timer 38 slots (~17 secondes) + TERMINAL LOCK 🔒
```

---

## 🎯 Diagramme des Actions

```
┌─────────────────────────────────────────────────────────────────┐
│                     ACTIONS PAR RÔLE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  LEADER UNIQUEMENT:                                             │
│  ├─> 🛡️ Shield (0.01 SOL)                                      │
│  │   ├─> Bloque deposits pendant 30 slots                      │
│  │   ├─> +1 pression                                           │
│  │   └─> 1 fois par cycle par wallet                           │
│  │                                                              │
│  └─> ⚓ Anchor (0.02 SOL)                                       │
│      ├─> Reset timer au maximum (450 slots)                    │
│      ├─> +2 pression                                           │
│      ├─> 1 fois par cycle par wallet                           │
│      └─> 2 fois max par cycle (total)                          │
│                                                                 │
│  NON-LEADER UNIQUEMENT:                                         │
│  └─> 💣 Sabotage (0.01 SOL)                                    │
│      ├─> Coupe le timer de moitié                              │
│      ├─> +1 pression                                           │
│      └─> 2 fois max par cycle par wallet                       │
│                                                                 │
│  TOUS:                                                          │
│  ├─> 💰 Deposit (0.01 SOL)                                     │
│  │   ├─> Prend le leadership                                   │
│  │   ├─> Reset le timer                                        │
│  │   └─> +1 pression                                           │
│  │                                                              │
│  ├─> 🎯 ArmSnipe (0.01 SOL)                                    │
│  │   ├─> Piège le prochain deposit                             │
│  │   ├─> Escrow 0.01 SOL                                       │
│  │   └─> Si trigger: +2 pression et leadership                 │
│  │                                                              │
│  ├─> 👻 Curse (0.01 SOL)                                       │
│  │   ├─> Réduit les gains du gagnant de 1%                     │
│  │   ├─> +1 pression                                           │
│  │   ├─> Max 5 par cycle                                       │
│  │   └─> 1 fois par cycle par wallet                           │
│  │                                                              │
│  └─> ❄️ Blizzard (0.01 SOL)                                    │
│      ├─> Augmente le pot sans prendre le lead                  │
│      └─> +1 pression                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💰 Diagramme de Distribution des Gains

```
┌─────────────────────────────────────────────────────────────────┐
│                  DISTRIBUTION DES GAINS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Pot Total: 1.00 SOL                                            │
│  │                                                              │
│  ├─> Protocol Fee (2%): 0.02 SOL                               │
│  │   └─> Envoyé au Fee Wallet                                  │
│  │                                                              │
│  ├─> Carry-over (3 curses = 3%): 0.03 SOL                      │
│  │   └─> Stocké dans le vault pour le cycle suivant            │
│  │                                                              │
│  └─> Payout (95%): 0.95 SOL                                    │
│      └─> Envoyé au Leader (Gagnant)                            │
│                                                                 │
│  Formule:                                                       │
│  ├─> Protocol Fee = Pot × 2%                                   │
│  ├─> Carry-over = Pot × curse_count%                           │
│  └─> Payout = Pot - Protocol Fee - Carry-over                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Diagramme de Cooldown

```
┌─────────────────────────────────────────────────────────────────┐
│                     SYSTÈME DE COOLDOWN                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Formule: Cooldown = action_count_this_cycle × 2 slots         │
│                                                                 │
│  Action #1:  0 slots de cooldown  (immédiat)                   │
│  Action #2:  2 slots de cooldown  (~0.9 secondes)              │
│  Action #3:  4 slots de cooldown  (~1.8 secondes)              │
│  Action #4:  6 slots de cooldown  (~2.7 secondes)              │
│  Action #5:  8 slots de cooldown  (~3.6 secondes)              │
│  Action #6: 10 slots de cooldown  (~4.5 secondes)              │
│  ...                                                            │
│                                                                 │
│  Reset: À chaque nouveau cycle                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎮 Résumé Visuel

```
╔═══════════════════════════════════════════════════════════════╗
║                    NODUS GAME - RÉSUMÉ                        ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  🎯 Objectif: Être le leader quand le timer expire           ║
║                                                               ║
║  💰 Coût d'entrée: 0.01 SOL (la plupart des actions)         ║
║                                                               ║
║  ⏱️ Timer: 450 slots max → 38 slots min                      ║
║                                                               ║
║  ⚡ Pression: 0 → 40 (Terminal Lock)                          ║
║                                                               ║
║  🏆 Gains: Pot - Protocol Fee (2%) - Carry-over (curses)     ║
║                                                               ║
║  🔄 Cycle: Infini (nouveau cycle après chaque resolve)       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

**Date** : 2024  
**Version** : 1.0.0  
**Statut** : ✅ PRÊT POUR DEVNET
