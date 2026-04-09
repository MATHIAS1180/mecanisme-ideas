# Setup RPC Premium pour Éviter Rate Limit 429

## Pourquoi un RPC Premium?

Le RPC public devnet de Solana (`https://api.devnet.solana.com`) a des limites strictes:
- ❌ Max 100 requêtes par 10 secondes
- ❌ Pas adapté pour WebSocket temps réel
- ❌ Cause des erreurs 429 fréquentes
- ❌ Bloque l'app complètement

Les RPC premium offrent:
- ✅ Limites beaucoup plus élevées (millions de requêtes/jour)
- ✅ WebSocket stable pour temps réel
- ✅ Latence plus faible (<100ms)
- ✅ **GRATUIT pour devnet!**

## Option 1: Helius (Recommandé) 🚀

### Avantages
- Tier gratuit généreux pour devnet
- Excellente documentation
- Support WebSocket natif
- Dashboard avec analytics

### Setup
1. Créer un compte sur https://helius.dev
2. Créer une nouvelle API key
3. Copier l'URL devnet: `https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY`

### Configuration Vercel
```bash
# Dans Vercel Dashboard:
# Settings > Environment Variables > Add New

Name: NEXT_PUBLIC_SOLANA_RPC_URL
Value: https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY
```

### Configuration Locale (.env.local)
```bash
NEXT_PUBLIC_SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY
```

## Option 2: QuickNode

### Avantages
- Interface simple
- Endpoints dédiés
- Bonne performance

### Setup
1. Créer un compte sur https://quicknode.com
2. Créer un endpoint Solana Devnet
3. Copier l'URL: `https://your-endpoint.devnet.solana.quiknode.pro/YOUR_TOKEN/`

### Configuration
```bash
NEXT_PUBLIC_SOLANA_RPC_URL=https://your-endpoint.devnet.solana.quiknode.pro/YOUR_TOKEN/
```

## Option 3: Tatum (Simple et Rapide) ⚡

### Avantages
- Setup ultra-simple (pas d'API key pour devnet)
- Bonne performance
- Stable et fiable
- Gratuit pour devnet

### Setup
**C'est le plus simple! Pas besoin de compte ni d'API key pour devnet:**

### Configuration
```bash
NEXT_PUBLIC_SOLANA_RPC_URL=https://solana-devnet.gateway.tatum.io
```

C'est tout! Pas de compte à créer, pas d'API key à gérer.

## Option 4: Alchemy

### Avantages
- Plateforme mature
- Bons outils de monitoring
- Support multi-chain

### Setup
1. Créer un compte sur https://alchemy.com
2. Créer une app Solana Devnet
3. Copier l'URL: `https://solana-devnet.g.alchemy.com/v2/YOUR_API_KEY`

### Configuration
```bash
NEXT_PUBLIC_SOLANA_RPC_URL=https://solana-devnet.g.alchemy.com/v2/YOUR_API_KEY
```

## Vérification

### 1. Tester localement
```bash
# Ajouter dans .env.local
NEXT_PUBLIC_SOLANA_RPC_URL=https://your-premium-rpc-url

# Redémarrer le serveur
npm run dev

# Tester un dépôt - devrait fonctionner sans erreur 429
```

### 2. Vérifier dans la console
```javascript
// Ouvrir DevTools > Console
// Tu devrais voir:
"⚡ Subscribed to vault changes (WebSocket, processed commitment, <100ms latency)"
"📡 WebSocket update reçu: ..."
"✅ Refresh complete: ..."

// PAS d'erreur 429!
```

### 3. Tester les actions
- ✅ Deposit fonctionne sans erreur
- ✅ UI se met à jour en <100ms
- ✅ Timer se reset correctement
- ✅ Graphique monte après dépôt
- ✅ Nouveau cycle détecté

## Déploiement Vercel

### Étape 1: Ajouter Variable d'Environnement
1. Aller sur https://vercel.com/dashboard
2. Sélectionner ton projet
3. Settings > Environment Variables
4. Add New:
   - Name: `NEXT_PUBLIC_SOLANA_RPC_URL`
   - Value: `https://your-premium-rpc-url`
   - Environments: Production, Preview, Development

### Étape 2: Redéployer
```bash
git add .
git commit -m "feat: add premium RPC for rate limit fix"
git push origin main

# Vercel va auto-déployer avec la nouvelle variable
```

### Étape 3: Vérifier
- Ouvrir l'app déployée
- Tester un dépôt
- Vérifier qu'il n'y a pas d'erreur 429

## Comparaison des RPC

| Provider | Gratuit Devnet | Requêtes/Jour | WebSocket | Latence | Setup | Recommandé |
|----------|----------------|---------------|-----------|---------|-------|------------|
| Public Devnet | ✅ | ~10,000 | ⚠️ Instable | ~200ms | Aucun | ❌ |
| Tatum | ✅ | 500,000+ | ✅ Stable | <100ms | **Aucun!** | ✅✅ |
| Helius | ✅ | 1,000,000+ | ✅ Stable | <100ms | Compte | ✅ |
| QuickNode | ✅ | 500,000+ | ✅ Stable | <100ms | Compte | ✅ |
| Alchemy | ✅ | 300,000+ | ✅ Stable | <100ms | Compte | ✅ |

## Troubleshooting

### Erreur: "Failed to fetch"
- Vérifier que l'API key est correcte
- Vérifier que l'URL est complète avec le protocole https://
- Vérifier que la variable d'environnement est bien définie

### Erreur: "Invalid API key"
- Régénérer l'API key sur le dashboard du provider
- Mettre à jour la variable d'environnement
- Redéployer

### Toujours des erreurs 429
- Vérifier que la variable `NEXT_PUBLIC_SOLANA_RPC_URL` est bien utilisée
- Vérifier dans le code que `connection` utilise bien cette URL
- Vérifier dans DevTools > Network que les requêtes vont vers le bon RPC

## Code de Vérification

Ajouter ce code temporaire dans `play/page.tsx` pour vérifier:

```typescript
useEffect(() => {
  console.log("🔍 RPC URL:", connection.rpcEndpoint);
  console.log("🔍 Expected:", process.env.NEXT_PUBLIC_SOLANA_RPC_URL);
}, [connection]);
```

Tu devrais voir ton RPC premium dans la console, pas `api.devnet.solana.com`.

## Prochaines Étapes

1. ✅ Choisir un provider (Helius recommandé)
2. ✅ Créer un compte et obtenir API key
3. ✅ Ajouter dans .env.local pour test local
4. ✅ Tester localement
5. ✅ Ajouter dans Vercel Environment Variables
6. ✅ Git push pour déployer
7. ✅ Vérifier en production

## Support

Si tu as des problèmes:
- Helius: https://docs.helius.dev
- QuickNode: https://www.quicknode.com/docs
- Alchemy: https://docs.alchemy.com/docs/solana-quickstart
