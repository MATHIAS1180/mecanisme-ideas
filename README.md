# Nodus Protocol

Nodus Protocol est un protocole de redistribution on-chain sur Solana, déployé d'abord sur devnet, avec une interface web pensée pour Vercel et une expérience de type terminal financier.

La source de vérité fonctionnelle du mécanisme est WHITEPAPER.md. Ce dépôt contient la base de développement complète : application web, SDK TypeScript et programme Solana natif.

## Stack

- Frontend : Next.js, React, TypeScript
- Wallets : Phantom, Solflare
- Réseau : Solana devnet
- Programme : Rust natif avec solana-program uniquement côté on-chain
- Déploiement web : Vercel

## Structure

- WHITEPAPER.md : spécification fonctionnelle et économique
- docs/DEPLOY_DEVNET.md : procédure de déploiement devnet et wiring du program id
- apps/web : application Next.js
- packages/sdk : constantes protocole, PDA, codecs et helpers d'instructions
- programs/nodus : programme Solana natif

## Paramètres V1 figés

- Nom : Nodus Protocol
- Entrée fixe : 0.01 SOL
- Fee protocole : 2 %
- Wallet fee : FC2km6B1ub8fBf4FdLFs1hbJjmLx6EJbdAzN9Ajnb8nt
- Timer minimum cible : 15 secondes en devnet
- Wallet de session : obligatoire pour une UX acceptable

## Démarrage local

Installer les dépendances puis lancer le frontend :

```bash
npm install
npm run dev
```

Build de validation :

```bash
npm run build
```

## Déploiement devnet

Voir docs/DEPLOY_DEVNET.md.

Scripts utiles :

- npm run deploy:devnet : build et déploie le programme sur devnet depuis une machine équipée du Solana CLI
- npm run web:env:devnet -- <PROGRAM_ID> : écrit apps/web/.env.local avec le program id et le RPC devnet

Variables publiques utilisées par le web :

- NEXT_PUBLIC_SOLANA_RPC_URL
- NEXT_PUBLIC_NODUS_PROGRAM_ID

## Programme Solana

Le programme est développé en Rust natif sous programs/nodus. L'environnement Rust et le Solana CLI doivent être présents pour compiler et déployer sur devnet.

## Objectif produit

Le protocole ne doit pas ressembler à un casino. Toute l'UX, les textes et les composants sont cadrés comme un outil de coordination financière on-chain : pression, leadership, timer, cycle, redistribution et protocol fee.

## État du repo

Le repo contient déjà :

- une base frontend responsive complète
- un terminal /play branché pour passer du mode preview au mode devnet réel via le program id
- un SDK TypeScript partagé
- un programme Solana natif aligné sur la V1 du whitepaper
- une procédure de déploiement devnet prête à l'emploi
