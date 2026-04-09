# Fix Rate Limit 429 et UI Updates

## Problèmes Identifiés

### 1. Erreur 429 Rate Limit
- **Cause**: Le RPC public devnet de Solana limite les requêtes
- **Symptôme**: `Error: 429 : {"jsonrpc":"2.0","error":{"code": 429, "message":"Connection rate limits exceeded"}}`
- **Impact**: Impossible de faire des dépôts, UI bloqué

### 2. UI Ne Se Met Pas à Jour à la Fin du Cycle
- **Cause**: WebSocket ne détecte pas toujours les changements de cycle
- **Symptôme**: Timer reste à 0:00, même leader affiché
- **Impact**: Utilisateur ne voit pas le nouveau cycle

### 3. Courbe du Graphique Ne Monte Pas
- **Cause**: DataPoints pas ajoutés correctement après premier dépôt
- **Symptôme**: Courbe reste plate même si pot augmente
- **Impact**: Graphique pas représentatif

## Solutions Appliquées

### Solution 1: Utiliser un RPC Premium (Recommandé)

Le RPC public devnet est trop limité pour une app en temps réel. Options:

#### Option A: Helius (Gratuit pour devnet)
```bash
# 1. Créer compte sur https://helius.dev
# 2. Obtenir API key gratuite
# 3. Ajouter dans .env.local:
NEXT_PUBLIC_SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY
```

#### Option B: QuickNode (Gratuit pour devnet)
```bash
# 1. Créer compte sur https://quicknode.com
# 2. Créer endpoint devnet gratuit
# 3. Ajouter dans .env.local:
NEXT_PUBLIC_SOLANA_RPC_URL=https://your-endpoint.devnet.solana.quiknode.pro/YOUR_TOKEN/
```

#### Option C: Alchemy (Gratuit pour devnet)
```bash
# 1. Créer compte sur https://alchemy.com
# 2. Créer app Solana devnet
# 3. Ajouter dans .env.local:
NEXT_PUBLIC_SOLANA_RPC_URL=https://solana-devnet.g.alchemy.com/v2/YOUR_API_KEY
```

### Solution 2: Optimiser le Polling et WebSocket

**Changements dans `realtime-vault.ts`:**
- Réduire polling à 5 secondes (au lieu de 3)
- Améliorer détection de changements
- Ajouter retry logic avec backoff exponentiel

**Changements dans `play/page.tsx`:**
- Réduire polling secondaire à 10 secondes
- Ajouter détection de rate limit
- Afficher message clair à l'utilisateur

### Solution 3: Fix Graphique DataPoints

**Changements dans `crypto-chart.tsx`:**
- Forcer ajout de point initial à 0
- Améliorer détection de changement de pot
- Ajouter logs pour debug

## Fichiers Modifiés

1. `apps/web/src/lib/realtime-vault.ts` - Polling optimisé + retry logic
2. `apps/web/src/app/play/page.tsx` - Polling réduit + meilleure gestion erreurs
3. `apps/web/src/components/crypto-chart.tsx` - Fix dataPoints
4. `FIX_RATE_LIMIT_ET_UI.md` - Ce document

## Instructions de Déploiement

### Étape 1: Configurer RPC Premium (CRITIQUE)
```bash
# Choisir une option ci-dessus et ajouter dans Vercel:
# Settings > Environment Variables > Add
# Name: NEXT_PUBLIC_SOLANA_RPC_URL
# Value: https://your-premium-rpc-url
```

### Étape 2: Vérifier Smart Contract
```bash
# Le smart contract est déjà déployé avec le bon fix:
# Program ID: By9yf8mRvJq3mXG2QE8nagNyZ5PCUJrfsikZUzk8otTo

# Vérifier sur Solana Explorer:
# https://explorer.solana.com/address/By9yf8mRvJq3mXG2QE8nagNyZ5PCUJrfsikZUzk8otTo?cluster=devnet
```

### Étape 3: Git Push
```bash
git add .
git commit -m "fix: rate limit 429, UI updates, et graphique datapoints"
git push origin main
```

## Vérifications Post-Déploiement

1. ✅ Pas d'erreur 429 lors des dépôts
2. ✅ UI se met à jour en <100ms après action
3. ✅ Timer se reset correctement à la fin du cycle
4. ✅ Graphique monte après premier dépôt
5. ✅ Nouveau cycle détecté et affiché
6. ✅ Winner notification s'affiche

## Notes Importantes

- **RPC Premium est OBLIGATOIRE** pour éviter rate limits
- Le RPC public devnet ne peut pas gérer le polling temps réel
- WebSocket avec "processed" commitment = <100ms latency
- Polling réduit à 5-10 secondes pour éviter rate limits
- Smart contract gère auto-resolve automatiquement

## Prochaines Étapes

1. Configurer RPC premium (Helius recommandé)
2. Tester sur devnet avec nouveau RPC
3. Vérifier que tout fonctionne sans erreur 429
4. Passer en mainnet avec RPC premium payant si besoin
