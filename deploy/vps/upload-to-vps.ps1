#!/usr/bin/env pwsh
# upload-to-vps.ps1 — Upload project files to VPS via SCP
# Run from the project root:
#   powershell -ExecutionPolicy Bypass -File deploy/vps/upload-to-vps.ps1
#
# Prerequisites: OpenSSH must be installed (built into Windows 10/11)

$VPS_IP   = "72.61.229.231"
$VPS_USER = "root"
$REMOTE   = "/opt/payroll"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Enterprise Payroll — Upload to VPS" -ForegroundColor Cyan
Write-Host "  Target: $VPS_USER@$VPS_IP`:$REMOTE" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Verify DB dump was created
if (-not (Test-Path ".\server\database\init\payroll-dump.sql")) {
    Write-Host "ERROR: Database dump not found." -ForegroundColor Red
    Write-Host "Run this first: powershell -File deploy/vps/export-db.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "[1/3] Creating zip archive (excluding node_modules)..." -ForegroundColor Yellow
$zipPath = "$env:TEMP\payroll-deploy.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath }

# Compress everything except node_modules and dist
$excludeDirs = @("node_modules", "dist", ".git", "logs", "load-test-results", "backups")
$items = Get-ChildItem -Path "." | Where-Object { $_.Name -notin $excludeDirs }
Compress-Archive -Path $items.FullName -DestinationPath $zipPath
$size = (Get-Item $zipPath).Length / 1MB
Write-Host "  Archive: $([math]::Round($size, 2)) MB" -ForegroundColor Gray

Write-Host "[2/3] Uploading zip to VPS..." -ForegroundColor Yellow
scp $zipPath "$VPS_USER@$VPS_IP`:/tmp/payroll-deploy.zip"

Write-Host "[3/3] Extracting on VPS..." -ForegroundColor Yellow
ssh "$VPS_USER@$VPS_IP" @"
apt-get install -y unzip -qq
mkdir -p $REMOTE
cd $REMOTE
unzip -o /tmp/payroll-deploy.zip
rm /tmp/payroll-deploy.zip
echo "Done. Files extracted to $REMOTE"
ls -la $REMOTE
"@

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Upload complete!" -ForegroundColor Green
Write-Host ""
Write-Host "  Now SSH into VPS and run:" -ForegroundColor Cyan
Write-Host "    ssh $VPS_USER@$VPS_IP" -ForegroundColor White
Write-Host "    cd $REMOTE" -ForegroundColor White
Write-Host "    docker compose up -d --build" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan
