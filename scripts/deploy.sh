#!/bin/bash

# ProjectKAF Deployment Script
set -e

echo "🚀 Starting ProjectKAF deployment..."

# Configuration
ENVIRONMENT=${1:-staging}
DOCKER_COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    log_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose file exists
if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
    log_error "Docker compose file $DOCKER_COMPOSE_FILE not found!"
    exit 1
fi

log_info "Deploying to $ENVIRONMENT environment..."

# Stop existing containers
log_info "Stopping existing containers..."
docker-compose -f "$DOCKER_COMPOSE_FILE" down

# Pull latest images
log_info "Pulling latest images..."
docker-compose -f "$DOCKER_COMPOSE_FILE" pull

# Build and start services
log_info "Building and starting services..."
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d --build

# Wait for services to be healthy
log_info "Waiting for services to be healthy..."
sleep 30

# Check service health
log_info "Checking service health..."
if docker-compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "unhealthy\|Exit"; then
    log_error "Some services are not healthy. Check logs with: docker-compose -f $DOCKER_COMPOSE_FILE logs"
    exit 1
fi

# Run database migrations
log_info "Running database migrations..."
docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T api npm run db:migrate

log_info "✅ Deployment completed successfully!"
log_info "Services are running at:"
log_info "  - API: http://localhost:8000"
log_info "  - Database: localhost:5432"
log_info "  - Redis: localhost:6379"

# Show running containers
log_info "Running containers:"
docker-compose -f "$DOCKER_COMPOSE_FILE" ps