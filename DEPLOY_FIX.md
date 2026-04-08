# Fix et Déploiement - Nodus Protocol

## ❌ Problème rencontré

```
error: failed to parse manifest
feature `edition2024` is required
The package requires Cargo 1.79.0 but needs a more recent version
```

## ✅ Solution en 2 étapes

### Étape 1: Mettre à jour Rust (PowerShell en Admin)

```powershell
# Dans PowerShell ADMINISTRATEUR
cd "C:\Users\mouki\Desktop\Claude Prompt\mecanisme-ideas"

# Lancer le script de mise à jour
.\FIX_RUST.ps1
```

Ou manuellement:

```powershell
rustup update stable
rustup default stable
```

Cela va mettre à jour Rust de 1.79.0 vers 1.94.0 (déjà installé sur ta machine).

### Étape 2: Relancer le déploiement

```powershell
.\deploy-devnet.ps1
```

## 🔧 Alternative: Utiliser Rust 1.94.0 directement

Si rustup ne fonctionne pas, force l'utilisation de la version 1.94.0:

```powershell
rustup default 1.94.0
cargo --version
# Devrait afficher: cargo 1.94.0
```

Puis relance:

```powershell
.\deploy-devnet.ps1
```

## 📝 Vérification

Après la mise à jour, vérifie:

```powershell
rustc --version
# Devrait afficher: rustc 1.94.0 ou plus récent

cargo --version
# Devrait afficher: cargo 1.94.0 ou plus récent
```

## 🚀 Déploiement complet

Une fois Rust mis à jour:

```powershell
# 1. Mise à jour Rust
.\FIX_RUST.ps1

# 2. Déploiement
.\deploy-devnet.ps1

# 3. Le Program ID sera affiché et sauvegardé dans PROGRAM_ID.txt
```

## ⚡ Si ça ne marche toujours pas

Essaie de nettoyer le cache Cargo:

```powershell
cargo clean
Remove-Item -Recurse -Force "$env:USERPROFILE\.cargo\registry\cache"
Remove-Item -Recurse -Force "$env:USERPROFILE\.cargo\registry\src"
```

Puis relance le déploiement.

## 🎯 Résumé rapide

```powershell
# PowerShell en ADMIN
cd "C:\Users\mouki\Desktop\Claude Prompt\mecanisme-ideas"
rustup update stable
.\deploy-devnet.ps1
```

C'est tout! 🚀
