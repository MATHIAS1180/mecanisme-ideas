# Nodus Program

Programme Solana natif pour la V1 devnet de Nodus Protocol.

## Objectif

Le programme implémente le coeur économique décrit dans le whitepaper : vault PDA unique, user state PDA par wallet de session, pression, timer, terminal lock, coups spéciaux et redistribution avec fee protocole hard-codé.

## Build

Pré-requis :

- Rust installé via rustup
- Solana CLI installé et configuré sur devnet
- target BPF/SBF disponible selon la version du toolchain Solana

Exemples de commandes :

```bash
cd programs/nodus
cargo build
```

Pour un déploiement devnet réel, il faut utiliser une machine disposant du Solana CLI, puis suivre [docs/DEPLOY_DEVNET.md](../../docs/DEPLOY_DEVNET.md).

## Notes V1

- Entrée fixe : 0.01 SOL
- Fee protocole : 2 %
- Wallet fee : FC2km6B1ub8fBf4FdLFs1hbJjmLx6EJbdAzN9Ajnb8nt
- Le reclaim de snipe doit être exécuté avant resolve si un snipe reste armé

## Déploiement

Depuis la racine du repo, le chemin opérateur recommandé est :

```bash
npm run deploy:devnet
```

Ce script construit le programme, déploie sur devnet et écrit le program id dans `apps/web/.env.local`.
