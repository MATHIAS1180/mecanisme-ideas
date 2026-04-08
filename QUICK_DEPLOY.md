# Déploiement Rapide - Nodus Protocol

## ⚠️ IMPORTANT: PowerShell en Administrateur

Le build du programme Solana nécessite des droits administrateur pour installer les platform-tools.

## 🚀 Déploiement en 3 étapes

### 1. Ouvrir PowerShell en Administrateur

- Clique droit sur l'icône PowerShell
- Sélectionne "Exécuter en tant qu'administrateur"

### 2. Naviguer vers le projet

```powershell
cd "C:\Users\mouki\Desktop\Claude Prompt\mecanisme-ideas"
```

### 3. Exécuter le script de déploiement

```powershell
.\deploy-devnet.ps1
```

Le script va:
1. ✅ Vérifier Solana CLI
2. ✅ Vérifier le solde devnet (3 SOL disponibles)
3. ✅ Builder le programme
4. ✅ Créer une keypair pour le programme
5. ✅ Déployer sur devnet
6. ✅ Afficher le Program ID

## 📋 Après le déploiement

Le script affichera quelque chose comme:

```
=== DÉPLOIEMENT RÉUSSI ===

Program ID: AbCdEf123456789...

Prochaines étapes:
1. Copie ce Program ID
2. Va sur Vercel → Settings → Environment Variables
3. Ajoute/modifie: NEXT_PUBLIC_NODUS_PROGRAM_ID=AbCdEf123456789...
4. Redéploie l'application sur Vercel
```

Le Program ID sera aussi sauvegardé dans `PROGRAM_ID.txt`

## 🔧 Configuration Vercel

1. Va sur https://vercel.com/dashboard
2. Sélectionne ton projet
3. Settings → Environment Variables
4. Ajoute ou modifie:
   - **Name:** `NEXT_PUBLIC_NODUS_PROGRAM_ID`
   - **Value:** Le Program ID du déploiement
5. Clique sur "Save"
6. Redéploie l'application (Deployments → ... → Redeploy)

## ❓ En cas de problème

### Erreur "privilège nécessaire"
→ Relance PowerShell en ADMINISTRATEUR

### Erreur "Pas assez de SOL"
→ Tu as déjà 3 SOL, ça devrait suffire. Sinon demande plus sur https://faucet.solana.com/

### Erreur "cargo-build-sbf not found"
→ Vérifie que Solana CLI est bien installé: `solana --version`

### Le build prend trop de temps
→ C'est normal, le premier build peut prendre 5-10 minutes

## 📝 Wallet Info

**Adresse du wallet:** 7Zk4Bp98Lu7KeMT7W69rKfD2Bn64NwZMrvjFyPoHPQQ1
**Solde actuel:** 3 SOL devnet
**Réseau:** Devnet

## 🔐 Sécurité

- La keypair du wallet est dans: `C:\Users\mouki\.config\solana\id.json`
- La keypair du programme sera dans: `keys\nodus-devnet-program.json`
- **IMPORTANT:** Ne partage JAMAIS ces fichiers!

## ✅ Vérification après déploiement

Une fois déployé, tu peux vérifier le programme:

```powershell
solana program show <PROGRAM_ID>
```

Et voir les logs en temps réel:

```powershell
solana logs <PROGRAM_ID>
```

---

**Prêt?** Lance PowerShell en admin et exécute `.\deploy-devnet.ps1` ! 🚀
