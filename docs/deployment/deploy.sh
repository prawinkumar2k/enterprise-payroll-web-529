#!/bin/bash

# ============================================
# Enterprise Payroll - Production Deployment
# ============================================

set -e  # Exit on error

echo "🚀 Starting Enterprise Payroll Production Deployment..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ Error: .env.production not found${NC}"
    echo "Please create .env.production from .env.production.example"
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install Docker first.${NC}"
    exit 1
fi

# Check Docker Compose
if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose not found. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Load environment
export $(cat .env.production | grep -v '^#' | xargs)

# Build images
echo -e "${YELLOW}📦 Building Docker images...${NC}"
docker compose -f docker-compose.production.yml build

# Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker compose -f docker-compose.production.yml up -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check health
echo -e "${YELLOW}🏥 Checking service health...${NC}"

# Check MySQL
if docker exec payroll-mysql mysqladmin ping -h localhost -u root -p${DB_PASSWORD} --silent; then
    echo -e "${GREEN}✅ MySQL is healthy${NC}"
else
    echo -e "${RED}❌ MySQL health check failed${NC}"
    exit 1
fi

# Check Backend
if curl -f http://localhost:5001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    docker compose -f docker-compose.production.yml logs backend
    exit 1
fi

# Check Frontend
if curl -f http://localhost:${FRONTEND_PORT:-80} > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    docker compose -f docker-compose.production.yml logs frontend
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Deployment Successful!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📊 Service Status:"
docker compose -f docker-compose.production.yml ps
echo ""
echo "🌐 Access Points:"
echo "   Frontend: http://localhost:${FRONTEND_PORT:-80}"
echo "   Backend API: http://localhost:5001/api/health"
echo ""
echo "📝 Useful Commands:"
echo "   View logs: docker compose -f docker-compose.production.yml logs -f"
echo "   Stop services: docker compose -f docker-compose.production.yml down"
echo "   Restart: docker compose -f docker-compose.production.yml restart"
echo ""
