# 🎮 NODUS - Jeu de Stratégie On-Chain

## 🌟 Vue d'Ensemble

Nodus est un jeu de stratégie compétitif déployé sur Solana, où les joueurs s'affrontent pour contrôler un cycle temporel et remporter le pot. Chaque action influence le timer, la pression et les chances de victoire.

```
┌─────────────────────────────────────────────────────────────┐
│                     🎯 NODUS GAME FLOW                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ⏸️  ATTENTE          →  💰 PREMIER DEPOSIT                │
│  (Vault initialisé)      (Cycle démarre)                   │
│                                                             │
│         ↓                                                   │
│                                                             │
│  🎮 CYCLE ACTIF       →  ⏱️  TIMER EXPIRE                  │
│  (Actions disponibles)   (Auto-resolve)                    │
│                                                             │
│         ↓                                                   │
│                                                             │
│  🏆 GAGNANT           →  🔄 NOUVEAU CYCLE                   │
│  (Notification)          (Retour à l'attente)              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Actions Disponibles

### 💰 Deposit (0.01 SOL)
- Prend le leadership
- Reset le timer
- +1 pression
- Disponible pour tous

### 🛡️ Shield (0.01 SOL)
- Bloque les deposits pendant ~13 secondes
- +1 pression
- Leader uniquement
- 1 fois par cycle par wallet

### 💣 Sabotage (0.01 SOL)
- Coupe le timer de moitié
- +1 pression
- Non-leader uniquement
- 2 fois max par cycle par wallet

### ⚓ Anchor (0.02 SOL)
- Reset le timer au maximum
- +2 pression
- Leader uniquement
- 1 fois par cycle par wallet
- 2 fois max par cycle (total)

### 🎯 ArmSnipe (0.01 SOL)
- Piège le prochain deposit
- Escrow 0.01 SOL
- Si trigger : +2 pression et leadership
- Disponible pour tous

### 👻 Curse (0.01 SOL)
- Réduit les gains du gagnant de 1%
- +1 pression
- Max 5 par cycle
- 1 fois par cycle par wallet

### ❄️ Blizzard (0.01 SOL)
- Augmente le pot sans prendre le lead
- +1 pression
- Disponible pour tous

### ✅ Resolve (Gratuit)
- Termine le cycle
- Distribue les gains
- Auto-déclenché quand timer = 0

---

## 📊 Mécanismes du Jeu

### Timer Dynamique
```
Timer Initial: 450 slots (~3.4 minutes)
Timer Minimum: 38 slots (~17 secondes)

Formule: MAX_RESET_SLOTS - (pressure_count × DECAY_SLOTS)
```

### Pression
```
Pression Max: 40
Terminal Lock: À 40, plus d'actions possibles sauf Resolve

Actions qui augmentent la pression:
- Deposit: +1
- Shield: +1
- Sabotage: +1
- Anchor: +2
- Snipe Trigger: +2
- Curse: +1
- Blizzard: +1
```

### Distribution des Gains
```
Pot Total: Somme de toutes les actions

Distribution:
├─ Protocol Fee: 2% → Fee Wallet
├─ Carry-over: curse_count % → Cycle suivant
└─ Payout: Reste → Leader (Gagnant)
```

### Cooldown
```
Cooldown = action_count_this_cycle × 2 slots

Exemple:
- 1ère action: 0 slots de cooldown
- 2ème action: 2 slots de cooldown
- 3ème action: 4 slots de cooldown
- etc.
```

---

## 🏗️ Architecture Technique

### Smart Contract (Rust)
```
programs/nodus/src/
├── lib.rs              # Point d'entrée
├── entrypoint.rs       # Entrypoint Solana
├── instruction.rs      # Définition des instructions
├── processor.rs        # Logique métier
├── state.rs            # Structures de données
├── error.rs            # Codes d'erreur
└── utils.rs            # Fonctions utilitaires
```

### SDK (TypeScript)
```
packages/sdk/src/
├── index.ts            # Exports
├── constants.ts        # Constantes du jeu
├── types.ts            # Types TypeScript
├── codecs.ts           # Encodage/Décodage
├── pda.ts              # Dérivation des PDAs
└── instructions.ts     # Construction des instructions
```

### Frontend (Next.js)
```
apps/web/src/
├── app/
│   ├── play/           # Page de jeu
│   ├── about/          # À propos
│   ├── faq/            # FAQ
│   └── history/        # Historique
├── components/
│   ├── cycle-graph-enhanced.tsx    # Graphique principal
│   ├── winner-notification.tsx     # Notification gagnant
│   ├── site-header.tsx             # Header
│   └── site-footer.tsx             # Footer
└── lib/
    ├── nodus-client.ts             # Client Nodus
    ├── session-wallet.ts           # Session wallet
    └── format.ts                   # Formatage
```

---

## 🚀 Installation Rapide

### 1. Cloner le Repo
```bash
git clone https://github.com/MATHIAS1180/mecanisme-ideas.git
cd mecanisme-ideas
```

### 2. Installer les Dépendances
```bash
npm install
```

### 3. Déployer le Smart Contract
```bash
# Windows
.\deploy-devnet.ps1

# Linux/Mac
chmod +x scripts/deploy-devnet.sh
./scripts/deploy-devnet.sh
```

### 4. Configurer l'Environnement
```bash
# Créer apps/web/.env.local
echo "NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com" >> apps/web/.env.local
echo "NEXT_PUBLIC_NODUS_PROGRAM_ID=VotreProgramIdIci" >> apps/web/.env.local
```

### 5. Lancer l'Application
```bash
cd apps/web
npm run dev
```

### 6. Ouvrir le Navigateur
```
http://localhost:3000
```

---

## 🎮 Guide de Jeu

### Étape 1 : Préparation
1. Installe Phantom ou Solflare
2. Passe en mode Devnet
3. Obtiens des SOL de test : https://faucet.solana.com/
4. Connecte ton wallet sur le site

### Étape 2 : Session Wallet
1. Entre un budget (ex: 0.1 SOL)
2. Clique sur "Fund"
3. Confirme la transaction
4. Le session wallet est actif ✅

### Étape 3 : Démarrer un Cycle
1. Clique sur "💰 Deposit"
2. Le cycle démarre
3. Tu es maintenant le leader ! 👑

### Étape 4 : Stratégie
- **Si tu es leader** : Utilise Shield ou Anchor pour te protéger
- **Si tu n'es pas leader** : Utilise Deposit pour prendre le lead ou Sabotage pour réduire le temps
- **Pour tous** : Utilise Curse pour réduire les gains du leader ou Blizzard pour augmenter le pot

### Étape 5 : Victoire
- Sois le leader quand le timer arrive à 0
- Le cycle se résout automatiquement
- Tu remportes le pot ! 🏆

---

## 📈 Statistiques du Jeu

### Coûts des Actions
| Action | Coût | Effet Principal |
|--------|------|-----------------|
| Deposit | 0.01 SOL | Prend le leadership |
| Shield | 0.01 SOL | Bloque deposits 30 slots |
| Sabotage | 0.01 SOL | Coupe timer de moitié |
| Anchor | 0.02 SOL | Reset timer au max |
| ArmSnipe | 0.01 SOL | Piège prochain deposit |
| Curse | 0.01 SOL | Réduit gains de 1% |
| Blizzard | 0.01 SOL | Augmente pot |
| Resolve | Gratuit | Termine le cycle |

### Limites par Cycle
| Limite | Valeur |
|--------|--------|
| Curses max | 5 |
| Anchors max (total) | 2 |
| Sabotages max (par wallet) | 2 |
| Shield (par wallet) | 1 |
| Anchor (par wallet) | 1 |
| Curse (par wallet) | 1 |

---

## 🎨 Interface Utilisateur

### Graphique Principal
- Courbe animée du timer
- Barre de pression avec effet liquide
- Particules explosives
- Couleurs dynamiques selon l'urgence
- État vide élégant

### Notifications
- ✅ Succès (vert)
- ❌ Erreur (rouge)
- ℹ️ Info (bleu)
- ⚠️ Avertissement (jaune)

### Winner Notification
- Modal de célébration
- Confettis animés
- Affichage du gagnant et du payout
- Auto-fermeture après 8 secondes

---

## 🔧 Améliorations Apportées

### ✅ Complété
- [x] CSS manquant créé (`cycle-graph-enhanced.css`)
- [x] Messages améliorés avec emojis
- [x] Tooltips sur les boutons d'actions
- [x] Coûts affichés en couleur
- [x] Lien vers explorateur Solana
- [x] Notifications de succès/erreur/info/warning
- [x] État vide élégant
- [x] Auto-resolve fonctionnel
- [x] Winner notification avec animations

### 📝 Documentation
- [x] Analyse complète (`ANALYSE_ET_AMELIORATIONS_FINALES.md`)
- [x] Guide de démarrage rapide (`GUIDE_DEMARRAGE_RAPIDE.md`)
- [x] Checklist de tests (`CHECKLIST_TESTS.md`)
- [x] README final (ce fichier)

---

## 🐛 Dépannage

### Problème : "No program ID configured"
**Solution** : Vérifie que `NEXT_PUBLIC_NODUS_PROGRAM_ID` est dans `.env.local`

### Problème : "Vault not initialized"
**Solution** : Clique sur "Initialize" pour créer le vault

### Problème : "Insufficient funds"
**Solution** : Clique sur "Fund" pour ajouter des SOL au session wallet

### Problème : "429 Too Many Requests"
**Solution** : Le jeu pause automatiquement pendant 10s. Utilise un RPC privé pour éviter ce problème.

---

## 📚 Ressources

### Documentation
- [Analyse Complète](./ANALYSE_ET_AMELIORATIONS_FINALES.md)
- [Guide de Démarrage](./GUIDE_DEMARRAGE_RAPIDE.md)
- [Checklist de Tests](./CHECKLIST_TESTS.md)
- [Whitepaper](./WHITEPAPER.md)

### Liens Utiles
- **Solana Docs** : https://docs.solana.com/
- **Anchor Framework** : https://www.anchor-lang.com/
- **Devnet Faucet** : https://faucet.solana.com/
- **Explorer** : https://explorer.solana.com/

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Crée une branche (`git checkout -b feature/AmazingFeature`)
3. Commit tes changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvre une Pull Request

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 👥 Équipe

- **MATHIAS1180** - Développeur Principal
- **Kiro AI** - Assistant de Développement

---

## 🎉 Remerciements

Merci à tous ceux qui ont contribué à ce projet !

- Solana Foundation
- Anchor Framework
- Next.js Team
- La communauté Solana

---

## 📞 Contact

Pour toute question ou suggestion :
- GitHub : https://github.com/MATHIAS1180/mecanisme-ideas
- Issues : https://github.com/MATHIAS1180/mecanisme-ideas/issues

---

## 🚀 Statut du Projet

```
┌─────────────────────────────────────────┐
│         🎮 NODUS GAME STATUS            │
├─────────────────────────────────────────┤
│                                         │
│  Smart Contract:  ✅ FONCTIONNEL        │
│  Frontend:        ✅ FONCTIONNEL        │
│  Session Wallet:  ✅ FONCTIONNEL        │
│  Auto-resolve:    ✅ FONCTIONNEL        │
│  Notifications:   ✅ FONCTIONNEL        │
│  Documentation:   ✅ COMPLÈTE           │
│                                         │
│  Status:          ✅ PRÊT POUR DEVNET   │
│                                         │
└─────────────────────────────────────────┘
```

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2024  
**Statut** : ✅ PRÊT POUR DEVNET

---

## 🎯 Prochaines Étapes

1. ✅ Déployer sur devnet
2. 🔄 Tester avec plusieurs joueurs
3. 📊 Collecter feedback
4. 🔧 Itérer sur l'UX
5. 🚀 Préparer mainnet

---

**Bon jeu ! 🎮🚀**
