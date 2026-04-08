# Script pour mettre à jour Rust et déployer
# À exécuter en PowerShell ADMINISTRATEUR

Write-Host "=== Mise à jour de Rust ===" -ForegroundColor Cyan
Write-Host ""

# Vérifier la version actuelle
Write-Host "Version actuelle de Rust:" -ForegroundColor Yellow
rustc --version

Write-Host ""
Write-Host "Mise à jour de Rust vers la dernière version stable..." -ForegroundColor Yellow
rustup update stable
rustup default stable

Write-Host ""
Write-Host "Nouvelle version de Rust:" -ForegroundColor Green
rustc --version

Write-Host ""
Write-Host "Mise à jour de Cargo..." -ForegroundColor Yellow
cargo --version

Write-Host ""
Write-Host "=== Rust mis à jour avec succès ===" -ForegroundColor Green
Write-Host ""
Write-Host "Maintenant, relance le script de déploiement:" -ForegroundColor Yellow
Write-Host ".\deploy-devnet.ps1" -ForegroundColor Cyan
