# 🚀 GUIDE DE DÉMARRAGE RAPIDE - NODUS GAME

## 📦 Installation et Configuration

### 1. Prérequis
```bash
# Node.js 18+ et npm
node --version
npm --version

# Solana CLI
solana --version

# Rust et Cargo (pour le smart contract)
rustc --version
cargo --version
```

### 2. Installation des Dépendances
```bash
cd mecanisme-ideas
npm install
```

### 3. Configuration de l'Environnement

Crée un fichier `.env.local` dans `apps/web/` :

```env
# RPC URL (devnet)
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Program ID (après déploiement)
NEXT_PUBLIC_NODUS_PROGRAM_ID=VotreProgramIdIci
```

---

## 🔨 Déploiement du Smart Contract

### Option 1 : Utiliser le Script PowerShell (Windows)
```powershell
.\deploy-devnet.ps1
```

### Option 2 : Utiliser le Script Bash (Linux/Mac)
```bash
chmod +x scripts/deploy-devnet.sh
./scripts/deploy-devnet.sh
```

### Option 3 : Déploiement Manuel
```bash
# 1. Build le programme
cd programs/nodus
cargo build-sbf

# 2. Déploie sur devnet
solana config set --url devnet
solana program deploy target/deploy/nodus.so

# 3. Note le Program ID affiché
# Exemple: Program Id: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

### 4. Copie le Program ID
```bash
# Copie le Program ID dans .env.local
echo "NEXT_PUBLIC_NODUS_PROGRAM_ID=TonProgramIdIci" >> apps/web/.env.local
```

---

## 🎮 Lancement de l'Application Web

### 1. Démarre le Serveur de Développement
```bash
cd apps/web
npm run dev
```

### 2. Ouvre ton Navigateur
```
http://localhost:3000
```

### 3. Configure ton Wallet
- Installe Phantom ou Solflare
- Passe en mode Devnet
- Obtiens des SOL de test : https://faucet.solana.com/

---

## 🎯 Premier Test du Jeu

### Étape 1 : Initialiser le Vault
1. Connecte ton wallet (bouton en haut à droite)
2. Va sur la page `/play`
3. Clique sur "Initialize" (si nécessaire)
4. Confirme la transaction

### Étape 2 : Créer un Session Wallet
1. Entre un budget (ex: 0.1 SOL)
2. Clique sur "Fund"
3. Confirme la transaction
4. Le session wallet est maintenant actif ✅

### Étape 3 : Démarrer un Cycle
1. Clique sur "💰 Deposit"
2. Le cycle démarre automatiquement
3. Le timer commence à décompter
4. Tu es maintenant le leader ! 👑

### Étape 4 : Tester les Actions

#### Actions Leader (quand tu es leader) :
- **🛡️ Shield** : Bloque les deposits pendant ~13 secondes
- **⚓ Anchor** : Reset le timer au maximum (coûte 2x)

#### Actions Non-Leader (quand tu n'es pas leader) :
- **💰 Deposit** : Prends le leadership
- **💣 Sabotage** : Coupe le temps restant de moitié
- **🎯 ArmSnipe** : Piège le prochain deposit

#### Actions Disponibles pour Tous :
- **👻 Curse** : Réduit les gains du gagnant (max 5)
- **❄️ Blizzard** : Augmente le pot sans prendre le lead

### Étape 5 : Fin du Cycle
1. Attends que le timer arrive à 0
2. Le cycle se résout automatiquement
3. Une notification affiche le gagnant 🏆
4. Un nouveau cycle peut commencer

---

## 🧪 Scénarios de Test

### Test 1 : Cycle Basique
```
1. Joueur A fait Deposit → devient leader
2. Attendre que timer expire
3. Joueur A gagne le pot
4. Vérifier la notification
```

### Test 2 : Compétition
```
1. Joueur A fait Deposit → leader
2. Joueur B fait Deposit → prend le lead
3. Joueur A fait Deposit → reprend le lead
4. Timer expire → Joueur A gagne
```

### Test 3 : Shield
```
1. Joueur A fait Deposit → leader
2. Joueur A fait Shield
3. Joueur B essaie Deposit → BLOQUÉ pendant 30 slots
4. Attendre expiration du shield
5. Joueur B peut maintenant Deposit
```

### Test 4 : Sabotage
```
1. Joueur A fait Deposit → leader, timer = 450 slots
2. Joueur B fait Sabotage → timer réduit de moitié
3. Timer maintenant ~225 slots
4. Pression augmente
```

### Test 5 : Snipe
```
1. Joueur A fait Deposit → leader
2. Joueur B fait ArmSnipe (piège armé)
3. Joueur C fait Deposit → PIÉGÉ !
4. Joueur B devient leader avec +2 pression
```

### Test 6 : Terminal Lock
```
1. Faire 40 actions au total
2. Terminal Lock activé 🔒
3. Plus d'actions possibles sauf Resolve
4. Attendre timer = 0
5. Auto-resolve déclenché
```

---

## 🐛 Dépannage

### Problème : "No program ID configured"
**Solution** : Vérifie que `NEXT_PUBLIC_NODUS_PROGRAM_ID` est dans `.env.local`

### Problème : "Vault not initialized"
**Solution** : Clique sur "Initialize" pour créer le vault

### Problème : "Insufficient funds"
**Solution** : 
1. Vérifie le solde de ton session wallet
2. Clique sur "Fund" pour ajouter des SOL
3. Minimum recommandé : 0.03 SOL

### Problème : "429 Too Many Requests"
**Solution** : 
1. Le jeu pause automatiquement pendant 10s
2. Utilise un RPC privé (Helius, QuickNode)
3. Réduis la fréquence de polling

### Problème : Transaction échoue
**Solution** :
1. Vérifie que tu es sur devnet
2. Vérifie que tu as assez de SOL
3. Regarde les logs dans la console (F12)
4. Vérifie l'explorateur Solana

---

## 📊 Monitoring

### Vérifier l'État du Vault
```bash
solana account <VAULT_PDA> --url devnet
```

### Vérifier les Transactions
```
https://explorer.solana.com/address/<PROGRAM_ID>?cluster=devnet
```

### Logs en Temps Réel
```bash
solana logs <PROGRAM_ID> --url devnet
```

---

## 🎨 Personnalisation

### Changer les Couleurs
Édite `apps/web/src/components/cycle-graph-enhanced.css`

### Modifier les Coûts
Édite `packages/sdk/src/constants.ts`
```typescript
export const ENTRY_LAMPORTS = 10_000_000; // 0.01 SOL
export const ANCHOR_LAMPORTS = 20_000_000; // 0.02 SOL
```

### Ajuster le Timer
Édite `packages/sdk/src/constants.ts`
```typescript
export const MIN_RESET_SLOTS = 38; // ~17 secondes
export const MAX_RESET_SLOTS = 450; // ~3.4 minutes
```

---

## 🚀 Déploiement en Production

### 1. Build l'Application
```bash
cd apps/web
npm run build
```

### 2. Déploie sur Vercel/Netlify
```bash
# Vercel
vercel deploy

# Netlify
netlify deploy --prod
```

### 3. Configure les Variables d'Environnement
```
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_NODUS_PROGRAM_ID=<MAINNET_PROGRAM_ID>
```

---

## 📚 Ressources Utiles

- **Solana Docs** : https://docs.solana.com/
- **Anchor Framework** : https://www.anchor-lang.com/
- **Solana Cookbook** : https://solanacookbook.com/
- **Devnet Faucet** : https://faucet.solana.com/
- **Explorer** : https://explorer.solana.com/

---

## 💡 Conseils Pro

1. **Utilise un RPC privé** pour éviter les rate limits
2. **Teste avec plusieurs wallets** pour simuler la compétition
3. **Surveille les logs** pour débugger rapidement
4. **Commence avec de petits montants** sur devnet
5. **Documente tes tests** pour reproduire les bugs

---

## 🎉 C'est Parti !

Tu es maintenant prêt à jouer à Nodus ! 🚀

Pour toute question, consulte :
- `ANALYSE_ET_AMELIORATIONS_FINALES.md` - Analyse complète
- `WHITEPAPER.md` - Mécanismes du jeu
- `README.md` - Documentation générale

**Bon jeu ! 🎮**
