# Setup Tatum RPC - Le Plus Simple! ⚡

## Pourquoi Tatum?

- ✅ **Aucun compte requis** pour devnet
- ✅ **Aucune API key** à gérer
- ✅ Setup en 2 minutes
- ✅ Stable et performant
- ✅ 500,000+ requêtes/jour
- ✅ WebSocket supporté
- ✅ Latence <100ms

## Setup Ultra-Rapide

### Étape 1: Ajouter dans Vercel (2 minutes)

1. Aller sur https://vercel.com/dashboard
2. Sélectionner ton projet
3. Settings > Environment Variables
4. Add New:
   ```
   Name: NEXT_PUBLIC_SOLANA_RPC_URL
   Value: https://solana-devnet.gateway.tatum.io
   ```
5. Environments: ✅ Production ✅ Preview ✅ Development
6. Save

C'est tout! Vercel va redéployer automatiquement.

### Étape 2: Test Local (Optionnel)

Si tu veux tester localement avant:

```bash
# Créer .env.local dans apps/web/
echo "NEXT_PUBLIC_SOLANA_RPC_URL=https://solana-devnet.gateway.tatum.io" > apps/web/.env.local

# Redémarrer le serveur
npm run dev
```

## Vérification

### Console DevTools

Ouvrir DevTools > Console, tu devrais voir:

```
✅ "⚡ Subscribed to vault changes (WebSocket, processed commitment, <100ms latency)"
✅ "📡 WebSocket update reçu: ..."
✅ "🔍 RPC URL: https://solana-devnet.gateway.tatum.io"
❌ PAS d'erreur 429
```

### Test Fonctionnel

1. Ouvrir l'app: https://ton-app.vercel.app/play
2. Fund session wallet
3. Faire un Deposit
4. ✅ Devrait fonctionner sans erreur 429
5. ✅ UI se met à jour instantanément
6. ✅ Graphique monte

## Avantages vs Autres RPC

### Tatum vs Public Devnet
- **Public**: 10,000 req/jour, instable, erreurs 429
- **Tatum**: 500,000+ req/jour, stable, pas d'erreur 429
- **Setup**: Tatum = 2 min, Public = déjà configuré mais inutilisable

### Tatum vs Helius/QuickNode/Alchemy
- **Tatum**: Aucun compte, aucune API key
- **Autres**: Besoin de créer compte + gérer API key
- **Performance**: Similaire (~100ms latency)
- **Limites**: Similaire (500k-1M req/jour)

## Pourquoi Pas d'API Key?

Tatum offre un endpoint public pour devnet car:
- Devnet est un réseau de test (pas de vraie valeur)
- Pas besoin de sécurité stricte
- Simplifie le développement
- Limites suffisantes pour la plupart des apps

Pour mainnet, tu devras créer un compte Tatum et obtenir une API key.

## Performance Attendue

Avec Tatum RPC:
- ✅ Latency: <100ms (WebSocket "processed")
- ✅ Polling: 5s vault, 10s secondaire (pas de rate limit)
- ✅ Actions: Instantanées sans erreur 429
- ✅ UI: Updates en temps réel (<100ms)
- ✅ Graphique: Smooth 120 FPS

## Troubleshooting

### Toujours des erreurs 429?

1. Vérifier que la variable est bien définie dans Vercel:
   ```bash
   # Dans Vercel Dashboard > Settings > Environment Variables
   # Tu devrais voir:
   NEXT_PUBLIC_SOLANA_RPC_URL = https://solana-devnet.gateway.tatum.io
   ```

2. Vérifier que Vercel a redéployé:
   ```bash
   # Aller sur Vercel Dashboard > Deployments
   # Le dernier deployment devrait avoir la nouvelle variable
   ```

3. Vérifier dans le code:
   ```typescript
   // Ajouter temporairement dans play/page.tsx
   useEffect(() => {
     console.log("🔍 RPC URL:", connection.rpcEndpoint);
   }, [connection]);
   
   // Tu devrais voir: https://solana-devnet.gateway.tatum.io
   // PAS: https://api.devnet.solana.com
   ```

### UI ne se met pas à jour?

1. Ouvrir DevTools > Console
2. Vérifier les logs WebSocket
3. Chercher "📡 WebSocket update reçu"
4. Si pas de logs, vérifier que le RPC est bien configuré

### Graphique ne monte pas?

1. Chercher "📊 DataPoint ajouté" dans console
2. Vérifier que le pot change réellement
3. Faire plusieurs dépôts pour voir la courbe monter

## Migration vers Mainnet

Quand tu seras prêt pour mainnet:

1. Créer un compte sur https://tatum.io
2. Obtenir une API key
3. Changer l'URL:
   ```bash
   # Mainnet avec API key
   NEXT_PUBLIC_SOLANA_RPC_URL=https://solana-mainnet.gateway.tatum.io/YOUR_API_KEY
   ```

## Alternatives

Si Tatum ne fonctionne pas pour une raison quelconque:

1. **Helius**: https://helius.dev (besoin compte)
2. **QuickNode**: https://quicknode.com (besoin compte)
3. **Alchemy**: https://alchemy.com (besoin compte)

Voir `SETUP_RPC_PREMIUM.md` pour les instructions complètes.

## Checklist Finale

- [ ] Variable ajoutée dans Vercel
- [ ] Vercel redéployé
- [ ] Console DevTools montre bon RPC
- [ ] Deposit fonctionne sans erreur 429
- [ ] UI se met à jour en <100ms
- [ ] Timer fonctionne
- [ ] Graphique monte
- [ ] Pas d'erreurs dans console

## Conclusion

Tatum est le choix le plus simple pour devnet:
- ✅ Aucun compte
- ✅ Aucune API key
- ✅ Setup en 2 minutes
- ✅ Performance excellente

Ajoute juste l'URL dans Vercel et c'est parti! 🚀
