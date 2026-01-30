#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 HackVeda Docker Deployment${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not available. Please install Docker Compose.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is installed${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}📝 Please edit .env file with your credentials before continuing.${NC}"
        echo -e "${YELLOW}Press Enter when ready to continue...${NC}"
        read
    else
        echo -e "${RED}❌ .env.example not found. Cannot create .env file.${NC}"
        exit 1
    fi
fi

# Stop any running containers
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
docker compose down

# Build and start services
echo -e "${BLUE}🏗️  Building Docker images...${NC}"
docker compose build

echo -e "${BLUE}🚀 Starting services...${NC}"
docker compose up -d

# Wait for services to be healthy
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Check service status
echo ""
echo -e "${GREEN}📊 Service Status:${NC}"
docker compose ps

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}🌐 Access your application:${NC}"
echo -e "  Frontend:  ${GREEN}http://localhost${NC}"
echo -e "  Backend:   ${GREEN}http://localhost:8000${NC}"
echo -e "  API Docs:  ${GREEN}http://localhost:8000/docs${NC}"
echo ""
echo -e "${BLUE}📋 Useful commands:${NC}"
echo -e "  View logs:     ${YELLOW}docker compose logs -f${NC}"
echo -e "  Stop services: ${YELLOW}docker compose down${NC}"
echo -e "  Restart:       ${YELLOW}docker compose restart${NC}"
echo ""
