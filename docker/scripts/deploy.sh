#!/bin/bash

# KINSAEP POS - Deployment Script
# -----------------------------------------------------------------------------

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Deployment...${NC}"

# 1. Pull latest code (if running from server)
# git pull origin main

# 2. Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found! Copy .env.production.example to .env and edit it.${NC}"
    exit 1
fi

# 3. Build and restart containers
echo -e "${GREEN}Building and starting containers...${NC}"
docker compose up -d --build

# 4. Cleanup old images
echo -e "${GREEN}Cleaning up old images...${NC}"
docker image prune -f

# 5. Run migrations (NestJS / TypeORM)
echo -e "${GREEN}Running database migrations...${NC}"
docker exec kinsaep_pos_api npm run migration:run

echo -e "${GREEN}Deployment Finished Successfully!${NC}"
echo -e "Check logs with: docker compose logs -f api"
