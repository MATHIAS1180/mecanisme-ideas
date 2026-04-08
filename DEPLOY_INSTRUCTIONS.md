# Instructions de Déploiement - Nodus Protocol sur Devnet

## Prérequis

Tu dois installer Solana CLI et Rust pour déployer le programme.

## 1. Installation de Solana CLI

### Sur Windows (PowerShell en tant qu'administrateur):

```powershell
# Télécharger et installer Solana
cmd /c "curl https://release.anza.xyz/stable/solana-install-init-x86_64-pc-windows-msvc.exe --output C:\solana-install-tmp\solana-install-init.exe --create-dirs"

# Exécuter l'installeur
C:\solana-install-tmp\solana-install-init.exe v2.1.7
```

### Ou via WSL (Linux sous Windows):

```bash
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
```

Après installation, redémarre ton terminal et vérifie:

```bash
solana --version
```

## 2. Configuration du Wallet Devnet

### Créer ou utiliser un wallet existant:

```bash
# Créer un nouveau wallet (sauvegarde la seed phrase!)
solana-keygen new -o ~/.config/solana/id.json

# Ou récupérer un wallet existant
solana-keygen recover -o ~/.config/solana/id.json
```

### Configurer pour devnet:

```bash
solana config set --url https://api.devnet.solana.com
```

### Obtenir des SOL devnet (gratuit):

```bash
solana airdrop 2
```

Répète cette commande plusieurs fois pour avoir ~5-10 SOL devnet (nécessaire pour le déploiement).

### Vérifier le solde:

```bash
solana balance
```

## 3. Installation de Rust (si pas déjà installé)

```bash
# Windows
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Ajouter les targets nécessaires
rustup target add bpf-unknown-unknown
```

## 4. Build du Programme

```bash
cd mecanisme-ideas/programs/nodus

# Build le programme Solana
cargo build-sbf
```

Le fichier compilé sera dans: `target/deploy/nodus.so`

## 5. Déploiement sur Devnet

### Option A: Déploiement avec keypair persistante (recommandé)

```bash
# Créer une keypair pour le programme (si pas déjà fait)
solana-keygen new -o keys/nodus-devnet-program.json

# Déployer avec cette keypair
solana program deploy target/deploy/nodus.so --program-id keys/nodus-devnet-program.json
```

### Option B: Déploiement simple (nouvelle adresse à chaque fois)

```bash
solana program deploy target/deploy/nodus.so
```

## 6. Récupérer le Program ID

Après le déploiement, tu verras un message comme:

```
Program Id: AbCdEf123456789...
```

**C'est ce Program ID que tu dois mettre dans Vercel!**

## 7. Configuration Vercel

Va sur Vercel → Ton projet → Settings → Environment Variables

Ajoute ou modifie:

```
NEXT_PUBLIC_NODUS_PROGRAM_ID=<TON_PROGRAM_ID_ICI>
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

Puis redéploie l'application sur Vercel.

## 8. Initialiser le Vault

Une fois déployé, va sur ton site et clique sur "Initialize vault" pour créer le compte vault PDA.

## Commandes Utiles

### Vérifier le programme déployé:

```bash
solana program show <PROGRAM_ID>
```

### Voir les logs du programme:

```bash
solana logs <PROGRAM_ID>
```

### Mettre à jour le programme (après modifications):

```bash
# Rebuild
cargo build-sbf

# Redéployer (même program ID)
solana program deploy target/deploy/nodus.so --program-id keys/nodus-devnet-program.json
```

### Vérifier le coût de déploiement:

```bash
solana program deploy target/deploy/nodus.so --dry-run
```

## Coûts Estimés

- Déploiement initial: ~2-3 SOL devnet
- Mise à jour: ~1-2 SOL devnet
- Initialisation vault: ~0.01 SOL devnet

## Troubleshooting

### Erreur "Insufficient funds":

```bash
solana airdrop 2
```

### Erreur "Program is not upgradeable":

Le programme a été déployé avec `--final`. Tu dois déployer un nouveau programme.

### Erreur de build:

```bash
# Nettoyer et rebuilder
cargo clean
cargo build-sbf
```

### RPC rate limit:

Utilise un RPC premium comme:
- https://rpc.ankr.com/solana_devnet
- https://devnet.helius-rpc.com/?api-key=<YOUR_KEY>

## Script Automatique (Optionnel)

Tu peux créer un script pour automatiser:

```bash
#!/bin/bash
# deploy.sh

echo "Building program..."
cd programs/nodus
cargo build-sbf

echo "Deploying to devnet..."
PROGRAM_ID=$(solana program deploy target/deploy/nodus.so --program-id keys/nodus-devnet-program.json | grep "Program Id:" | awk '{print $3}')

echo "Program deployed!"
echo "Program ID: $PROGRAM_ID"
echo ""
echo "Add this to Vercel:"
echo "NEXT_PUBLIC_NODUS_PROGRAM_ID=$PROGRAM_ID"
```

Rends-le exécutable:

```bash
chmod +x deploy.sh
./deploy.sh
```

## Notes Importantes

1. **Sauvegarde ta keypair**: Le fichier `keys/nodus-devnet-program.json` est crucial. Si tu le perds, tu ne pourras plus mettre à jour le programme.

2. **Devnet SOL**: Les SOL devnet n'ont aucune valeur réelle. Tu peux en obtenir gratuitement via airdrop.

3. **Program ID**: Une fois déployé, le Program ID ne change pas (sauf si tu déploies un nouveau programme).

4. **Upgradeable**: Par défaut, le programme est upgradeable. Pour le rendre final (non-modifiable), utilise `--final` lors du déploiement.

## Support

Si tu rencontres des problèmes:
1. Vérifie que Solana CLI est bien installé: `solana --version`
2. Vérifie que tu es sur devnet: `solana config get`
3. Vérifie ton solde: `solana balance`
4. Regarde les logs: `solana logs`

---

Une fois le déploiement réussi, envoie-moi le Program ID et je t'aiderai à le configurer sur Vercel!
