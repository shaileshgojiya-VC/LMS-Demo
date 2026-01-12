#!/bin/bash

# Dockerized Deployment Script for LMS Backend
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 Starting LMS Backend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ .env file created. Please edit it with your configuration.${NC}"
        echo -e "${YELLOW}⚠️  Press Enter after editing .env to continue, or Ctrl+C to exit...${NC}"
        read
    else
        echo -e "${RED}❌ .env.example not found. Please create .env manually.${NC}"
        exit 1
    fi
fi

# Check Docker and Docker Compose
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Use docker compose (v2) if available, otherwise docker-compose (v1)
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo -e "${GREEN}✅ Docker and Docker Compose found${NC}"

# Build images
echo -e "${YELLOW}📦 Building Docker images...${NC}"
$DOCKER_COMPOSE build

# Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
$DOCKER_COMPOSE up -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check MySQL health
echo -e "${YELLOW}🔍 Checking MySQL health...${NC}"
for i in {1..30}; do
    if $DOCKER_COMPOSE exec -T mysql mysqladmin ping -h localhost -u root -prootpassword &> /dev/null; then
        echo -e "${GREEN}✅ MySQL is healthy${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ MySQL failed to become healthy${NC}"
        exit 1
    fi
    sleep 2
done

# Check Redis health
echo -e "${YELLOW}🔍 Checking Redis health...${NC}"
for i in {1..30}; do
    if $DOCKER_COMPOSE exec -T redis redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✅ Redis is healthy${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Redis failed to become healthy${NC}"
        exit 1
    fi
    sleep 2
done

# Run migrations
echo -e "${YELLOW}📊 Running database migrations...${NC}"
$DOCKER_COMPOSE exec -T backend alembic upgrade head || {
    echo -e "${YELLOW}⚠️  Migrations failed or no migrations to run. Continuing...${NC}"
}

# Check backend health
echo -e "${YELLOW}🔍 Checking backend health...${NC}"
sleep 5
for i in {1..30}; do
    if curl -f http://localhost:8000/health &> /dev/null; then
        echo -e "${GREEN}✅ Backend is healthy${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Backend failed to become healthy${NC}"
        echo -e "${YELLOW}📋 Checking logs...${NC}"
        $DOCKER_COMPOSE logs backend | tail -20
        exit 1
    fi
    sleep 2
done

# Final status
echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo "📋 Service URLs:"
echo "   Backend API:     http://localhost:8000"
echo "   API Docs:        http://localhost:8000/docs"
echo "   Health Check:    http://localhost:8000/health"
echo ""
echo "📊 Service Status:"
$DOCKER_COMPOSE ps
echo ""
echo "📝 Useful commands:"
echo "   View logs:        $DOCKER_COMPOSE logs -f"
echo "   Stop services:    $DOCKER_COMPOSE down"
echo "   Restart:          $DOCKER_COMPOSE restart"
echo ""

