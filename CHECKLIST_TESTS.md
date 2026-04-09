# ✅ CHECKLIST DE TESTS - NODUS GAME

## 🎯 Tests Fonctionnels de Base

### 1. Smart Contract - Initialization
- [ ] Le vault peut être initialisé
- [ ] Le vault ne peut pas être initialisé deux fois
- [ ] Les PDAs sont correctement dérivés
- [ ] Le rent est correctement calculé

### 2. Smart Contract - Deposit
- [ ] Premier deposit démarre le cycle
- [ ] Deposit change le leader
- [ ] Deposit reset le timer
- [ ] Deposit augmente la pression de 1
- [ ] Deposit coûte ENTRY_LAMPORTS (0.01 SOL)
- [ ] Deposit bloqué pendant shield actif
- [ ] Deposit trigger un snipe si actif

### 3. Smart Contract - Shield
- [ ] Shield uniquement pour le leader
- [ ] Shield bloque les deposits pendant 30 slots
- [ ] Shield ne peut être utilisé qu'une fois par cycle
- [ ] Shield coûte ENTRY_LAMPORTS
- [ ] Shield augmente la pression de 1

### 4. Smart Contract - Sabotage
- [ ] Sabotage uniquement pour non-leader
- [ ] Sabotage coupe le timer de moitié
- [ ] Sabotage limité à 2 fois par wallet par cycle
- [ ] Sabotage coûte ENTRY_LAMPORTS
- [ ] Sabotage augmente la pression de 1

### 5. Smart Contract - Anchor
- [ ] Anchor uniquement pour le leader
- [ ] Anchor reset le timer au maximum (450 slots)
- [ ] Anchor limité à 2 fois par cycle (total)
- [ ] Anchor ne peut être utilisé qu'une fois par wallet par cycle
- [ ] Anchor coûte ANCHOR_LAMPORTS (0.02 SOL)
- [ ] Anchor augmente la pression de 2

### 6. Smart Contract - ArmSnipe
- [ ] ArmSnipe peut être armé par n'importe qui
- [ ] ArmSnipe bloque si un snipe est déjà actif
- [ ] ArmSnipe escrow ENTRY_LAMPORTS
- [ ] ArmSnipe trigger sur le prochain deposit
- [ ] ArmSnipe donne le leadership au sniper
- [ ] ArmSnipe augmente la pression de 2
- [ ] ArmSnipe peut être reclaim si expiré ou terminal lock

### 7. Smart Contract - Curse
- [ ] Curse peut être utilisé par n'importe qui
- [ ] Curse limité à 5 par cycle
- [ ] Curse ne peut être utilisé qu'une fois par wallet par cycle
- [ ] Curse réduit le payout du gagnant
- [ ] Curse crée un carry-over pour le cycle suivant
- [ ] Curse coûte ENTRY_LAMPORTS
- [ ] Curse augmente la pression de 1

### 8. Smart Contract - Blizzard
- [ ] Blizzard peut être utilisé par n'importe qui
- [ ] Blizzard augmente le pot sans changer le leader
- [ ] Blizzard coûte ENTRY_LAMPORTS
- [ ] Blizzard augmente la pression de 1

### 9. Smart Contract - Resolve
- [ ] Resolve uniquement quand timer = 0
- [ ] Resolve bloqué si snipe actif
- [ ] Resolve bloqué si pas de leader
- [ ] Resolve calcule correctement le protocol fee (2%)
- [ ] Resolve calcule correctement le carry-over (curse_count %)
- [ ] Resolve distribue le payout au leader
- [ ] Resolve envoie le protocol fee au fee wallet
- [ ] Resolve reset le vault pour nouveau cycle
- [ ] Resolve incrémente le cycle number
- [ ] Resolve stocke last_resolved_winner et last_resolved_payout

### 10. Smart Contract - Cooldown
- [ ] Cooldown augmente avec le nombre d'actions
- [ ] Cooldown bloque les actions trop rapides
- [ ] Cooldown reset à chaque nouveau cycle

### 11. Smart Contract - Terminal Lock
- [ ] Terminal lock activé à 40 pression
- [ ] Terminal lock bloque toutes les actions sauf Resolve
- [ ] Terminal lock permet de reclaim snipe

### 12. Smart Contract - User State
- [ ] User state créé automatiquement au premier usage
- [ ] User state sync avec le cycle number
- [ ] User state reset les flags à chaque nouveau cycle
- [ ] User state track correctement les actions

---

## 🎨 Tests UI/UX

### 1. Page Play - Affichage
- [ ] Le graphique s'affiche correctement
- [ ] Le timer décompte en temps réel
- [ ] Le pot s'affiche correctement
- [ ] La pression s'affiche correctement
- [ ] Le leader s'affiche correctement
- [ ] Le cycle number s'affiche correctement

### 2. Page Play - État Vide
- [ ] Message "Aucun cycle actif" s'affiche
- [ ] Icône animée visible
- [ ] Instructions claires affichées
- [ ] Seul Deposit est disponible

### 3. Page Play - Cycle Actif
- [ ] Graphique animé avec courbe
- [ ] Barre de pression remplie correctement
- [ ] Couleurs changent selon l'urgence
- [ ] Particules explosives sur augmentation pression
- [ ] Toutes les actions disponibles

### 4. Page Play - Cycle Terminé
- [ ] Overlay "Cycle Terminé" s'affiche
- [ ] Auto-resolve se déclenche
- [ ] Message de résolution affiché
- [ ] Winner notification apparaît

### 5. Page Play - Session Wallet
- [ ] Session wallet peut être créé
- [ ] Session wallet peut être financé
- [ ] Solde session wallet affiché correctement
- [ ] Session wallet peut être sweep
- [ ] Session wallet persiste en sessionStorage

### 6. Page Play - Actions
- [ ] Tous les boutons d'actions affichés
- [ ] Emojis corrects pour chaque action
- [ ] Coûts affichés correctement
- [ ] Tooltips fonctionnent
- [ ] Boutons désactivés quand approprié
- [ ] Loading state pendant transaction

### 7. Page Play - Notifications
- [ ] Notifications de succès (vert)
- [ ] Notifications d'erreur (rouge)
- [ ] Notifications d'info (bleu)
- [ ] Notifications d'avertissement (jaune)
- [ ] Lien vers explorateur Solana
- [ ] Auto-dismiss après quelques secondes

### 8. Winner Notification
- [ ] Modal s'affiche à la fin du cycle
- [ ] Confettis animés
- [ ] Gagnant affiché correctement
- [ ] Payout affiché correctement
- [ ] Auto-fermeture après 8 secondes
- [ ] Bouton "Continuer" fonctionne

### 9. Cycle Graph Enhanced
- [ ] SVG responsive
- [ ] Animations fluides
- [ ] Pas de lag sur mobile
- [ ] Particules de fond (étoiles)
- [ ] Effet glow sur les éléments
- [ ] Grille de fond visible

---

## 🔄 Tests d'Intégration

### 1. Flux Complet - Solo
```
1. Connecter wallet
2. Initialiser vault (si nécessaire)
3. Créer session wallet
4. Faire Deposit (démarrer cycle)
5. Attendre timer = 0
6. Vérifier auto-resolve
7. Vérifier winner notification
8. Vérifier nouveau cycle prêt
```
- [ ] Flux complet fonctionne sans erreur

### 2. Flux Complet - Multi-joueurs
```
1. Joueur A fait Deposit
2. Joueur B fait Deposit (prend lead)
3. Joueur A fait Shield
4. Joueur B essaie Deposit (bloqué)
5. Attendre expiration shield
6. Joueur B fait Deposit
7. Joueur A fait Sabotage
8. Timer réduit
9. Attendre timer = 0
10. Vérifier gagnant
```
- [ ] Flux multi-joueurs fonctionne

### 3. Flux Snipe
```
1. Joueur A fait Deposit
2. Joueur B fait ArmSnipe
3. Joueur C fait Deposit
4. Vérifier que B devient leader
5. Vérifier pression +2
```
- [ ] Snipe fonctionne correctement

### 4. Flux Terminal Lock
```
1. Faire 40 actions
2. Vérifier terminal lock actif
3. Essayer une action (bloquée)
4. Attendre timer = 0
5. Vérifier auto-resolve
```
- [ ] Terminal lock fonctionne

---

## 🐛 Tests Edge Cases

### 1. Erreurs Réseau
- [ ] Gestion 429 (rate limiting)
- [ ] Gestion timeout RPC
- [ ] Gestion connexion perdue
- [ ] Retry automatique

### 2. Erreurs Wallet
- [ ] Wallet déconnecté pendant action
- [ ] Wallet sans SOL
- [ ] Transaction rejetée par l'utilisateur
- [ ] Session wallet vide

### 3. Erreurs Smart Contract
- [ ] Action non autorisée (ex: Shield par non-leader)
- [ ] Cooldown actif
- [ ] Limite atteinte (ex: 5 curses)
- [ ] Timer pas expiré pour Resolve

### 4. Concurrence
- [ ] Deux deposits en même temps
- [ ] Snipe et deposit simultanés
- [ ] Resolve pendant qu'une action est en cours

---

## 📱 Tests Responsive

### Desktop (1920x1080)
- [ ] Layout correct
- [ ] Graphique bien dimensionné
- [ ] Tous les éléments visibles
- [ ] Pas de scroll horizontal

### Tablet (768x1024)
- [ ] Layout adapté
- [ ] Graphique responsive
- [ ] Boutons accessibles
- [ ] Navigation fluide

### Mobile (375x667)
- [ ] Layout mobile optimisé
- [ ] Graphique lisible
- [ ] Boutons assez grands
- [ ] Texte lisible
- [ ] Pas de débordement

---

## ⚡ Tests Performance

### 1. Temps de Chargement
- [ ] Page charge en < 3 secondes
- [ ] Graphique s'affiche rapidement
- [ ] Pas de flash de contenu

### 2. Animations
- [ ] 60 FPS sur desktop
- [ ] 30+ FPS sur mobile
- [ ] Pas de jank
- [ ] Transitions fluides

### 3. Mémoire
- [ ] Pas de fuite mémoire
- [ ] Polling n'accumule pas de données
- [ ] Cleanup correct des listeners

### 4. RPC
- [ ] Polling optimisé (2 secondes)
- [ ] Pas de requêtes inutiles
- [ ] Gestion du cache
- [ ] Batch requests si possible

---

## 🔒 Tests Sécurité

### 1. Smart Contract
- [ ] Pas de reentrancy
- [ ] Pas d'overflow/underflow
- [ ] Vérification des signers
- [ ] Vérification des PDAs
- [ ] Vérification des montants

### 2. Frontend
- [ ] Session wallet sécurisé
- [ ] Pas de clés privées exposées
- [ ] Validation des inputs
- [ ] Sanitization des données
- [ ] HTTPS uniquement

---

## 📊 Résultats des Tests

### Statut Global
- [ ] Tous les tests passent
- [ ] Aucun bug critique
- [ ] Performance acceptable
- [ ] UX fluide

### Bugs Trouvés
```
1. [CRITIQUE/MAJEUR/MINEUR] Description du bug
   - Étapes pour reproduire
   - Comportement attendu
   - Comportement observé
   - Solution proposée

2. ...
```

### Améliorations Suggérées
```
1. [UX/PERF/FEATURE] Description
   - Justification
   - Priorité (Haute/Moyenne/Basse)
   - Effort estimé

2. ...
```

---

## 🎯 Critères de Validation

### Pour Devnet
- [x] Smart contract déployé
- [x] UI fonctionnelle
- [x] Toutes les actions marchent
- [x] Auto-resolve fonctionne
- [x] Session wallet opérationnel
- [ ] Tests multi-joueurs validés
- [ ] Pas de bugs critiques

### Pour Mainnet
- [ ] Audit de sécurité complet
- [ ] Tests de charge réussis
- [ ] Documentation complète
- [ ] Support multi-wallets
- [ ] Monitoring en place
- [ ] Plan de rollback

---

## 📝 Notes de Test

### Date : ___________
### Testeur : ___________
### Environnement : Devnet / Mainnet
### Version : ___________

### Observations :
```
- 
- 
- 
```

### Recommandations :
```
- 
- 
- 
```

---

**Dernière mise à jour** : $(date)
**Statut** : ✅ PRÊT POUR TESTS
