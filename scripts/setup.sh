#!/bin/bash

# ProjectKAF Setup Script
set -e

echo "🔧 Setting up ProjectKAF development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ] || [ "$NODE_VERSION" -ge 20 ]; then
        log_error "Node.js version 18.x is required for compatibility. Current version: $(node -v)"
        log_error "Please install Node.js 18.x using: nvm install 18 && nvm use 18"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_warn "Docker is not installed. You'll need Docker to run the database locally."
    fi
    
    log_info "Prerequisites check completed ✅"
}

# Install dependencies
install_dependencies() {
    log_step "Installing dependencies..."
    
    # Install root dependencies
    log_info "Installing root dependencies..."
    npm install
    
    # Build packages
    log_info "Building packages..."
    npm run build
    
    log_info "Dependencies installed ✅"
}

# Setup environment files
setup_environment() {
    log_step "Setting up environment files..."
    
    # API environment
    if [ ! -f "apps/api/.env" ]; then
        log_info "Creating API environment file..."
        cp apps/api/.env.example apps/api/.env
        log_info "✅ Created apps/api/.env"
        log_warn "Please update the database URL and other settings in apps/api/.env"
    else
        log_info "API environment file already exists"
    fi
    
    # Web environment
    if [ ! -f "apps/web/.env" ]; then
        log_info "Creating Web environment file..."
        cp apps/web/.env.example apps/web/.env
        log_info "✅ Created apps/web/.env"
    else
        log_info "Web environment file already exists"
    fi
    
    # Control Plane environment
    if [ ! -f "apps/control-plane/.env" ]; then
        log_info "Creating Control Plane environment file..."
        cp apps/control-plane/.env.example apps/control-plane/.env
        log_info "✅ Created apps/control-plane/.env"
    else
        log_info "Control Plane environment file already exists"
    fi
    
    log_info "Environment setup completed ✅"
}

# Setup database
setup_database() {
    log_step "Setting up database..."
    
    if command -v docker &> /dev/null; then
        log_info "Starting database with Docker..."
        docker-compose -f docker-compose.staging.yml up -d postgres redis
        
        # Wait for database to be ready
        log_info "Waiting for database to be ready..."
        sleep 10
        
        # Generate Prisma client
        log_info "Generating Prisma client..."
        cd packages/db && npm run db:generate && cd ../..
        
        # Push database schema
        log_info "Pushing database schema..."
        cd packages/db && npm run db:push && cd ../..
        
        log_info "Database setup completed ✅"
    else
        log_warn "Docker not available. Please set up PostgreSQL manually and update the DATABASE_URL in apps/api/.env"
    fi
}

# Create initial data
create_initial_data() {
    log_step "Creating initial data..."
    
    # This would typically run seed scripts
    log_info "Initial data creation would go here..."
    log_info "You can add seed data by running: npm run db:seed (when implemented)"
    
    log_info "Initial data setup completed ✅"
}

# Main setup process
main() {
    log_info "Starting ProjectKAF setup..."
    
    check_prerequisites
    install_dependencies
    setup_environment
    setup_database
    create_initial_data
    
    log_info ""
    log_info "🎉 ProjectKAF setup completed successfully!"
    log_info ""
    log_info "Next steps:"
    log_info "1. Review and update environment files:"
    log_info "   - apps/api/.env"
    log_info "   - apps/web/.env"
    log_info "   - apps/control-plane/.env"
    log_info ""
    log_info "2. Start the development servers:"
    log_info "   npm run dev"
    log_info ""
    log_info "3. Access the applications:"
    log_info "   - API: http://localhost:8000"
    log_info "   - Web App: http://localhost:3000"
    log_info "   - Control Plane: http://localhost:3001"
    log_info ""
    log_info "For more information, see the README.md file."
}

# Run main function
main "$@"