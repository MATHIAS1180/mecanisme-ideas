# 🎮 GUIDE UTILISATEUR - NODUS GAME

## 🌟 Qu'est-ce que Nodus ?

Nodus est un jeu on-chain sur Solana où les joueurs s'affrontent pour contrôler un pot grandissant. Le dernier joueur à tenir le leadership quand le timer expire remporte le pot !

---

## 🎯 Objectif du Jeu

**Devenir et rester le leader jusqu'à l'expiration du timer pour remporter le pot.**

Chaque action augmente la pression et modifie le timer. À 40 de pression, le cycle entre en "Terminal Lock" - plus aucune action n'est possible sauf attendre l'expiration.

---

## 🚀 Démarrage Rapide

### 1. Prérequis
- Un wallet Solana (Phantom ou Solflare recommandés)
- Quelques SOL sur devnet (utilise un faucet : https://faucet.solana.com)
- Navigateur web moderne

### 2. Configuration
1. Connecte ton wallet en cliquant sur "Connect Wallet"
2. Entre un budget (minimum 0.03 SOL recommandé)
3. Clique sur "Fund" pour créer ton session wallet
4. Tu es prêt à jouer ! 🎉

### 3. Premier Cycle
- Si aucun cycle n'est actif, clique sur **"Deposit"** pour démarrer
- Tu deviens le leader et le timer commence
- D'autres joueurs peuvent maintenant te défier !

---

## 🎮 Actions Disponibles

### 💰 Deposit (0.01 SOL)
**Disponible** : Toujours  
**Effet** : 
- Tu deviens le nouveau leader
- Le timer se reset selon la pression actuelle
- +1 pression
- Si un snipe est actif, il se déclenche (le sniper devient leader avec +2 pression)

**Quand l'utiliser** : Pour prendre le contrôle ou prolonger ton leadership

---

### 🛡️ Shield (0.01 SOL)
**Disponible** : Leader uniquement, 1 fois par cycle  
**Effet** :
- Bloque tous les deposits pendant ~13.5 secondes (30 slots)
- +1 pression

**Quand l'utiliser** : Quand tu es leader et veux te protéger temporairement

---

### 💣 Sabotage (0.01 SOL)
**Disponible** : Non-leader uniquement, 2 fois max par wallet  
**Effet** :
- Coupe le timer restant en 2
- +1 pression

**Quand l'utiliser** : Pour forcer le leader à réagir rapidement

---

### ⚓ Anchor (0.02 SOL)
**Disponible** : Leader uniquement, 2 fois max par cycle  
**Effet** :
- Reset le timer au maximum (450 slots = ~3.4 minutes)
- +2 pression

**Quand l'utiliser** : Quand tu veux sécuriser ta position avec beaucoup de temps

---

### 🎯 ArmSnipe (0.01 SOL)
**Disponible** : Toujours  
**Effet** :
- Met 0.01 SOL en escrow
- Le prochain deposit déclenche le snipe
- Tu deviens leader avec +2 pression
- Si pas déclenché, tu peux récupérer avec ReclaimSnipe

**Quand l'utiliser** : Pour piéger le prochain joueur qui dépose

---

### 😈 Curse (0.01 SOL)
**Disponible** : Toujours, 5 fois max par cycle  
**Effet** :
- Réduit le payout du gagnant de 1%
- L'argent va dans le carry-over du prochain cycle
- +1 pression

**Quand l'utiliser** : Quand tu ne peux pas gagner mais veux réduire les gains du leader

---

### ❄️ Blizzard (0.01 SOL)
**Disponible** : Toujours  
**Effet** :
- Augmente le pot sans changer le leader
- +1 pression

**Quand l'utiliser** : Pour augmenter le pot tout en mettant la pression

---

### ✅ Resolve (Gratuit)
**Disponible** : Quand le timer est à 0  
**Effet** :
- Distribue le pot au leader (moins 2% de frais)
- Applique les curses (carry-over)
- Démarre un nouveau cycle

**Note** : Cette action se fait automatiquement ! Tu n'as pas besoin de cliquer.

---

## 📊 Comprendre l'Interface

### Graphique Principal
- **Courbe** : Historique du timer sur la dernière minute
- **Couleur** : Change selon l'urgence (vert → jaune → orange → rouge)
- **Barre de pression** : À droite, montre la pression (0-40)
- **Particules** : Apparaissent lors des augmentations de pression

### Terminal Telemetry
- **Cycle #** : Numéro du cycle actuel
- **Leader** : Qui contrôle actuellement le pot
- **Countdown** : Temps restant avant expiration
- **Pot** : Montant total à gagner
- **Pressure** : Niveau de pression (40 = Terminal Lock)
- **Terminal Lock** : Quand actif, plus aucune action possible
- **Carry-over** : Montant reporté du cycle précédent
- **Curses** : Nombre de curses actives (max 5)

### Session Wallet
- **Main wallet** : Ton wallet principal connecté
- **Session signer** : Wallet temporaire pour les actions rapides
- **Budget** : Montant que tu veux allouer
- **Solde session** : Combien il reste dans le session wallet
- **Mise en cours** : Ta participation au cycle actuel

---

## 💡 Stratégies

### 🏆 Pour Gagner
1. **Timing** : Dépose juste avant que le timer expire
2. **Shield** : Utilise-le stratégiquement pour bloquer les attaques
3. **Anchor** : Donne-toi beaucoup de temps si tu as les moyens
4. **Snipe** : Piège les joueurs agressifs

### 🎯 Pour Maximiser le Pot
1. **Blizzard** : Augmente le pot sans risque
2. **Patience** : Laisse les autres se battre
3. **Dernière minute** : Entre quand le pot est gros

### 😈 Pour Perturber
1. **Sabotage** : Force le leader à réagir
2. **Curse** : Réduis les gains du gagnant
3. **Snipe** : Piège les deposits

---

## ⚠️ Mécaniques Importantes

### Pression (0-40)
- Chaque action augmente la pression
- Plus de pression = timer plus court
- À 40 : Terminal Lock (plus d'actions possibles)

### Timer Dynamique
- **Formule** : 450 - (12 × (pression - 1)) slots
- **Maximum** : 450 slots (~3.4 minutes)
- **Minimum** : 38 slots (~17 secondes)
- **1 slot** ≈ 0.45 secondes

### Cooldown
Après chaque action, tu dois attendre :
- 1ère action : 0 slots
- 2ème action : 3 slots (~1.4s)
- 3ème action : 8 slots (~3.6s)
- 4ème action : 15 slots (~6.8s)
- 5ème action : 24 slots (~10.8s)
- 6ème action : 36 slots (~16.2s)
- 7ème action : 49 slots (~22s)
- 8ème+ action : 64 slots (~28.8s)

### Distribution des Gains
1. **Pot brut** = Solde du vault - rent reserve
2. **Frais protocole** = 2% du pot brut
3. **Carry-over** = 1% par curse (max 5%)
4. **Payout** = Pot brut - frais - carry-over

**Exemple** :
- Pot : 1 SOL
- Frais : 0.02 SOL (2%)
- Curses : 3 (3%)
- Carry-over : 0.03 SOL
- Gagnant reçoit : 0.95 SOL

---

## 🔧 Dépannage

### "Solde insuffisant dans le session wallet"
➡️ Clique sur "Fund" pour ajouter des SOL

### "Cycle terminé : il faut d'abord résoudre"
➡️ Attends quelques secondes, l'auto-resolve va se déclencher

### "Trop de requêtes RPC (429)"
➡️ Le système met automatiquement en pause pendant 10s

### "Cooldown Active"
➡️ Attends quelques secondes entre chaque action

### "Shield Active"
➡️ Le leader a activé son shield, attends qu'il expire

### "Terminal Lock Active"
➡️ La pression est à 40, attends que le timer expire

---

## 🎨 Indicateurs Visuels

### Couleurs du Timer
- 🟢 **Vert/Cyan** : Beaucoup de temps (>90s)
- 🟡 **Jaune** : Temps modéré (45-90s)
- 🟠 **Orange** : Urgent (20-45s)
- 🔴 **Rouge** : Critique (<20s)
- 💀 **Rouge intense** : Expiré (0s)

### Barre de Pression
- 🟢 **Vert** : Faible (0-40%)
- 🟡 **Jaune** : Modéré (40-65%)
- 🟠 **Orange** : Élevé (65-85%)
- 🔴 **Rouge** : Critique (85-100%)
- 💀 **Rouge pulsant** : Terminal Lock (100%)

---

## 🏆 Notification de Victoire

Quand un cycle se termine, une notification apparaît avec :
- 🎉 Confettis animés
- 🏆 Icône trophée
- 👑 Adresse du gagnant
- 💰 Montant des gains
- ✨ Message de félicitations

La notification se ferme automatiquement après 8 secondes ou tu peux cliquer sur "Continuer".

---

## 📱 Responsive

Le jeu fonctionne sur :
- 💻 Desktop (expérience optimale)
- 📱 Tablet (adapté)
- 📱 Mobile (fonctionnel)

---

## 🔐 Sécurité

### Session Wallet
- Créé localement dans ton navigateur
- Stocké dans sessionStorage (effacé à la fermeture)
- Utilisé uniquement pour les actions du jeu
- Tu peux récupérer les fonds à tout moment avec "Sweep"

### Smart Contract
- Code open-source et auditable
- Déployé sur Solana devnet
- Pas de backdoor ou fonction admin
- Distribution automatique des gains

---

## 🎯 Conseils Pro

1. **Garde toujours du SOL en réserve** pour les actions de dernière minute
2. **Observe les patterns** des autres joueurs
3. **Utilise le snipe** quand tu vois un joueur agressif
4. **Ne gaspille pas tes anchors** trop tôt
5. **Le shield est puissant** mais limité à 1 fois
6. **Les curses sont méchantes** mais coûtent cher
7. **Le blizzard est safe** pour augmenter le pot
8. **Timing > Montant** - mieux vaut déposer au bon moment

---

## 🆘 Support

Des questions ? Problèmes ?
- 📖 Lis le whitepaper : `WHITEPAPER.md`
- 🔧 Consulte les docs techniques : `AMELIORATIONS_COMPLETES.md`
- 💬 Rejoins la communauté Discord (si disponible)

---

## 🎮 Bon Jeu !

Maintenant que tu connais toutes les règles, lance-toi et deviens le maître de Nodus ! 🏆

**Que le meilleur stratège gagne ! 🚀**
