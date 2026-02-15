# ============================================
# DOCKER DESKTOP RECOVERY SCRIPT
# ============================================
# Run as Administrator in PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DOCKER DESKTOP RECOVERY SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill Docker processes
Write-Host "[STEP 1] Killing Docker processes..." -ForegroundColor Yellow
taskkill /F /IM "Docker Desktop.exe" 2>$null
taskkill /F /IM "com.docker.backend.exe" 2>$null
taskkill /F /IM "dockerd.exe" 2>$null
Start-Sleep -Seconds 5

# Step 2: Check WSL2
Write-Host "[STEP 2] Checking WSL2 status..." -ForegroundColor Yellow
wsl --status
wsl --list --verbose

# Step 3: Update WSL2
Write-Host "[STEP 3] Updating WSL2..." -ForegroundColor Yellow
wsl --update
wsl --shutdown
Start-Sleep -Seconds 10

# Step 4: Start Docker Desktop
Write-Host "[STEP 4] Please start Docker Desktop manually now..." -ForegroundColor Yellow
Write-Host "Waiting for Docker Desktop to start..." -ForegroundColor Yellow
Write-Host "Press Enter when Docker Desktop is running..." -ForegroundColor Green
Read-Host

# Step 5: Clean Docker
Write-Host "[STEP 5] Cleaning Docker system..." -ForegroundColor Yellow
docker system prune -a --volumes --force
docker builder prune --all --force

# Step 6: Test Docker
Write-Host "[STEP 6] Testing Docker engine..." -ForegroundColor Yellow

Write-Host "Test 1: Hello World" -ForegroundColor Cyan
docker run --rm hello-world

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Hello World: PASS" -ForegroundColor Green
} else {
    Write-Host "✗ Hello World: FAIL" -ForegroundColor Red
    exit 1
}

Write-Host "Test 2: Node Alpine" -ForegroundColor Cyan
docker run --rm node:20-alpine node -v

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Node Alpine: PASS" -ForegroundColor Green
} else {
    Write-Host "✗ Node Alpine: FAIL" -ForegroundColor Red
    exit 1
}

# Step 7: Build project
Write-Host "[STEP 7] Building project..." -ForegroundColor Yellow
cd C:\Users\Hp\Documents\enterprise-payroll-web-529

Write-Host "Building backend..." -ForegroundColor Cyan
docker compose -f docker-compose.production.yml build backend

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend Build: PASS" -ForegroundColor Green
    
    Write-Host "Building frontend..." -ForegroundColor Cyan
    docker compose -f docker-compose.production.yml build frontend
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Frontend Build: PASS" -ForegroundColor Green
    } else {
        Write-Host "✗ Frontend Build: FAIL" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✗ Backend Build: FAIL" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ DOCKER RECOVERY COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. docker compose -f docker-compose.production.yml up -d" -ForegroundColor Cyan
Write-Host "2. docker compose -f docker-compose.production.yml ps" -ForegroundColor Cyan
Write-Host "3. curl http://localhost/api/health" -ForegroundColor Cyan
