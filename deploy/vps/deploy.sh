#!/bin/bash
# deploy.sh - Production Deployment Script
# Run this as 'deployer' user in the project root on VPS

set -e

echo "🚢 Starting Production Deployment..."

# 1. Pull latest (if using git)
# git pull origin main

# 2. Build and start containers
# We use --no-cache to ensure alpine binaries are fresh for the target arch
docker compose -f docker-compose.production.yml build --no-cache
docker compose -f docker-compose.production.yml up -d

# 3. Wait for database and health
echo "⏳ Waiting for services to stabilize..."
sleep 15

# 4. Verify Health
if curl -s http://localhost:5001/api/health | grep -q 'success'; then
    echo "✅ Backend is HEALTHY."
else
    echo "❌ Backend health check FAILED. Check logs."
    docker logs payroll-backend
    exit 1
fi

echo "🚀 Deployment SUCCESSFUL."
echo "🔗 Access your app at: http://$(curl -s ifconfig.me):8081 (Internal) or your domain via HTTPS."
