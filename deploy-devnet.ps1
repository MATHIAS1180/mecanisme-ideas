# Script de déploiement Nodus sur Devnet
# À exécuter en PowerShell ADMINISTRATEUR

Write-Host "=== Déploiement Nodus Protocol sur Devnet ===" -ForegroundColor Cyan
Write-Host ""

# Configuration des variables d'environnement
$env:HOME = $env:USERPROFILE
$env:PATH = "$env:USERPROFILE\.local\share\solana\install\releases\2.1.7\solana-release\bin;$env:PATH"

# Vérifier Solana
Write-Host "1. Vérification de Solana CLI..." -ForegroundColor Yellow
solana --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Solana CLI non trouvé!" -ForegroundColor Red
    exit 1
}

# Vérifier le solde
Write-Host ""
Write-Host "2. Vérification du solde devnet..." -ForegroundColor Yellow
$balance = solana balance
Write-Host "Solde: $balance" -ForegroundColor Green
if ($balance -match "^0") {
    Write-Host "ERREUR: Pas assez de SOL devnet!" -ForegroundColor Red
    Write-Host "Demande des SOL sur: https://faucet.solana.com/" -ForegroundColor Yellow
    exit 1
}

# Aller dans le dossier du programme
Write-Host ""
Write-Host "3. Navigation vers le programme..." -ForegroundColor Yellow
Set-Location -Path "programs\nodus"

# Builder le programme
Write-Host ""
Write-Host "4. Build du programme (cela peut prendre quelques minutes)..." -ForegroundColor Yellow
cargo-build-sbf
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Build échoué!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Si l'erreur est 'privilège nécessaire', relance PowerShell en ADMINISTRATEUR" -ForegroundColor Yellow
    exit 1
}

# Créer le dossier keys s'il n'existe pas
Write-Host ""
Write-Host "5. Préparation du déploiement..." -ForegroundColor Yellow
if (-not (Test-Path "..\..\keys")) {
    New-Item -ItemType Directory -Path "..\..\keys" | Out-Null
}

# Créer une keypair pour le programme si elle n'existe pas
if (-not (Test-Path "..\..\keys\nodus-devnet-program.json")) {
    Write-Host "Création d'une nouvelle keypair pour le programme..." -ForegroundColor Yellow
    solana-keygen new -o "..\..\keys\nodus-devnet-program.json" --no-bip39-passphrase --force
}

# Déployer
Write-Host ""
Write-Host "6. Déploiement sur devnet..." -ForegroundColor Yellow
Write-Host "Cela peut prendre 1-2 minutes..." -ForegroundColor Gray

$deployOutput = solana program deploy target\deploy\nodus.so --program-id ..\..\keys\nodus-devnet-program.json 2>&1
Write-Host $deployOutput

# Extraire le Program ID
$programId = $deployOutput | Select-String -Pattern "Program Id: (\w+)" | ForEach-Object { $_.Matches.Groups[1].Value }

if ($programId) {
    Write-Host ""
    Write-Host "=== DÉPLOIEMENT RÉUSSI ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Program ID: $programId" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Prochaines étapes:" -ForegroundColor Yellow
    Write-Host "1. Copie ce Program ID" -ForegroundColor White
    Write-Host "2. Va sur Vercel → Settings → Environment Variables" -ForegroundColor White
    Write-Host "3. Ajoute/modifie: NEXT_PUBLIC_NODUS_PROGRAM_ID=$programId" -ForegroundColor White
    Write-Host "4. Redéploie l'application sur Vercel" -ForegroundColor White
    Write-Host ""
    
    # Sauvegarder dans un fichier
    $programId | Out-File -FilePath "..\..\PROGRAM_ID.txt" -Encoding UTF8
    Write-Host "Program ID sauvegardé dans: PROGRAM_ID.txt" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "ERREUR: Déploiement échoué!" -ForegroundColor Red
    Write-Host "Vérifie les logs ci-dessus pour plus de détails" -ForegroundColor Yellow
    exit 1
}

# Retour au dossier racine
Set-Location -Path "..\..\"

Write-Host ""
Write-Host "Script terminé!" -ForegroundColor Green
