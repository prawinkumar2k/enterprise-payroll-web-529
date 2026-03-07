#!/usr/bin/env pwsh
# export-db.ps1 — Export all payroll databases from your local MySQL
# Run this from the project root BEFORE uploading to VPS:
#   powershell -ExecutionPolicy Bypass -File deploy/vps/export-db.ps1
#
# Output: server/database/init/payroll-dump.sql  (auto-imported by MySQL Docker on first run)

$ErrorActionPreference = "Stop"

$MYSQL_USER     = "root"
$MYSQL_PASSWORD = "Prawin@2k4"
$OUTPUT_FILE    = ".\server\database\init\payroll-dump.sql"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Enterprise Payroll — Database Export" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Find mysqldump
$mysqldump = $null
$candidates = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe",
    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqldump.exe",
    "C:\xampp\mysql\bin\mysqldump.exe"
)
foreach ($c in $candidates) {
    if (Test-Path $c) { $mysqldump = $c; break }
}
if (-not $mysqldump) {
    $mysqldump = (Get-Command mysqldump -ErrorAction SilentlyContinue)?.Source
}
if (-not $mysqldump) {
    Write-Host "ERROR: mysqldump not found. Install MySQL or add it to PATH." -ForegroundColor Red
    exit 1
}
Write-Host "Using mysqldump: $mysqldump" -ForegroundColor Gray

Write-Host ""
Write-Host "Exporting databases: billing_db, payroll_DEFAULT, payroll_SF001..." -ForegroundColor Yellow

$env:MYSQL_PWD = $MYSQL_PASSWORD
& $mysqldump `
    --user=$MYSQL_USER `
    --single-transaction `
    --routines `
    --triggers `
    --add-drop-database `
    --databases billing_db payroll_DEFAULT payroll_SF001 `
    --result-file=$OUTPUT_FILE

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: mysqldump failed (exit code $LASTEXITCODE)" -ForegroundColor Red
    exit 1
}

$size = (Get-Item $OUTPUT_FILE).Length / 1MB
Write-Host ""
Write-Host "  Exported to: $OUTPUT_FILE" -ForegroundColor Green
Write-Host "  File size  : $([math]::Round($size, 2)) MB" -ForegroundColor Green
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Next step: run  deploy/vps/upload-to-vps.ps1" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
