#!/bin/bash
# deploy.sh - Docker Compose Production Deployment (without k3s)
# Use this for simple single-server deployments without Kubernetes.
# For k3s/Kubernetes deployment, use k3s-deploy.sh instead.
#
# Run as 'deployer' user from the project root on VPS.

set -e

echo "Starting Docker Compose Production Deployment..."

# 1. Pull latest code (uncomment if using git)
# git pull origin main

# 2. Build and start all containers
docker compose -f docker-compose.yml build --no-cache
docker compose -f docker-compose.yml up -d

# 3. Wait for services to stabilize
echo "Waiting for services to stabilize..."
sleep 20

# 4. Verify server health
if curl -sf http://localhost:5005/api/health | grep -q 'success'; then
    echo "Backend is HEALTHY."
else
    echo "Backend health check FAILED. Showing logs:"
    docker compose -f docker-compose.yml logs server
    exit 1
fi

echo "Deployment SUCCESSFUL."
echo "Access your app at: http://$(curl -s ifconfig.me) or your configured domain."
