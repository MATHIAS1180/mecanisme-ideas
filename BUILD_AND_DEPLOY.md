# 🚀 Build et Deploy du Smart Contract Nodus

## Bug Critique Corrigé

**Problème:** "sum of account balances before and after instruction do not match"

**Cause:** Le `carry_over_lamports` n'était pas correctement géré lors de la résolution. Les lamports étaient transférés mais le carry n'était pas conservé dans le vault.

**Solution:** 
- Calculer le pot disponible = balance - rent - ancien carry
- Transférer seulement payout + fee
- Garder le carry dans le vault
- Nouveau carry = ancien carry + nouveau carry du cycle

## Build du Programme

```bash
cd mecanisme-ideas
cargo build-sbf
```

## Deploy sur Devnet

```bash
solana program deploy target/deploy/nodus.so --program-id programs/nodus/target/deploy/nodus-keypair.json --url devnet
```

## Ou générer un nouveau Program ID

```bash
# Générer une nouvelle keypair
solana-keygen new -o programs/nodus/target/deploy/nodus-keypair-new.json

# Récupérer le program ID
solana address -k programs/nodus/target/deploy/nodus-keypair-new.json

# Mettre à jour dans lib.rs
# declare_id!("NOUVEAU_PROGRAM_ID_ICI");

# Build
cargo build-sbf

# Deploy
solana program deploy target/deploy/nodus.so --program-id programs/nodus/target/deploy/nodus-keypair-new.json --url devnet
```

## Nouveau Program ID (Déployé)

```
By9yf8mRvJq3mXG2QE8nagNyZ5PCUJrfsikZUzk8otTo
```

**Déployé sur:** Devnet  
**Date:** Aujourd'hui  
**Statut:** ✅ Actif avec fix carry-over

## Mettre à jour l'UI

Mettre à jour `.env.local` dans `apps/web/`:

```
NEXT_PUBLIC_NODUS_PROGRAM_ID=By9yf8mRvJq3mXG2QE8nagNyZ5PCUJrfsikZUzk8otTo
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

## Initialiser le Vault

```bash
# Depuis Solana Playground ou l'UI
# Appeler l'instruction Initialize avec le wallet admin
```

## Vérifications

1. ✅ Carry-over correctement géré
2. ✅ Lamports balancés après chaque transaction
3. ✅ Auto-resolve fonctionne sans erreur
4. ✅ Pas de blocage de cycle
5. ✅ WebSocket + Polling pour UI ultra-réactive

## Optimisations Appliquées

- Calcul correct des lamports disponibles
- Gestion cumulative du carry-over
- Logs détaillés pour debugging
- Vérifications de sécurité renforcées
