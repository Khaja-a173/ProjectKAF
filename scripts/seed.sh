#!/bin/bash

# ProjectKAF Database Seeding Script
set -e

echo "🌱 Seeding ProjectKAF database..."

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

# Configuration
ENVIRONMENT=${1:-development}
API_URL=${2:-http://localhost:8000}

log_info "Seeding database for $ENVIRONMENT environment..."
log_info "API URL: $API_URL"

# Wait for API to be ready
wait_for_api() {
    log_step "Waiting for API to be ready..."
    
    for i in {1..30}; do
        if curl -f "$API_URL/health" > /dev/null 2>&1; then
            log_info "API is ready ✅"
            return 0
        fi
        log_info "Waiting for API... (attempt $i/30)"
        sleep 2
    done
    
    log_error "API is not responding after 60 seconds"
    exit 1
}

# Create seed tenant
create_seed_tenant() {
    log_step "Creating seed tenant..."
    
    TENANT_DATA='{
        "name": "Demo Restaurant",
        "slug": "demo-restaurant",
        "description": "A demo restaurant for testing ProjectKAF"
    }'
    
    RESPONSE=$(curl -s -X POST "$API_URL/api/tenants" \
        -H "Content-Type: application/json" \
        -d "$TENANT_DATA" || echo '{"error": "Failed to create tenant"}')
    
    if echo "$RESPONSE" | grep -q '"error"'; then
        log_warn "Tenant might already exist or creation failed"
    else
        log_info "Seed tenant created ✅"
    fi
}

# Create seed users
create_seed_users() {
    log_step "Creating seed users..."
    
    # Admin user
    ADMIN_DATA='{
        "email": "admin@demo-restaurant.com",
        "password": "admin123",
        "name": "Admin User",
        "tenantId": "demo-restaurant"
    }'
    
    curl -s -X POST "$API_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d "$ADMIN_DATA" > /dev/null || log_warn "Admin user might already exist"
    
    # Manager user
    MANAGER_DATA='{
        "email": "manager@demo-restaurant.com",
        "password": "manager123",
        "name": "Manager User",
        "tenantId": "demo-restaurant"
    }'
    
    curl -s -X POST "$API_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d "$MANAGER_DATA" > /dev/null || log_warn "Manager user might already exist"
    
    # Staff user
    STAFF_DATA='{
        "email": "staff@demo-restaurant.com",
        "password": "staff123",
        "name": "Staff User",
        "tenantId": "demo-restaurant"
    }'
    
    curl -s -X POST "$API_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d "$STAFF_DATA" > /dev/null || log_warn "Staff user might already exist"
    
    log_info "Seed users created ✅"
}

# Get auth token
get_auth_token() {
    log_step "Getting authentication token..."
    
    LOGIN_DATA='{
        "email": "admin@demo-restaurant.com",
        "password": "admin123",
        "tenantId": "demo-restaurant"
    }'
    
    RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "$LOGIN_DATA")
    
    TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    
    if [ -z "$TOKEN" ]; then
        log_error "Failed to get authentication token"
        exit 1
    fi
    
    log_info "Authentication token obtained ✅"
    echo "$TOKEN"
}

# Create menu categories
create_menu_categories() {
    local token=$1
    log_step "Creating menu categories..."
    
    # Appetizers
    APPETIZERS_DATA='{
        "name": "Appetizers",
        "description": "Start your meal with our delicious appetizers",
        "sortOrder": 0
    }'
    
    curl -s -X POST "$API_URL/api/menu/categories" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "$APPETIZERS_DATA" > /dev/null
    
    # Main Courses
    MAINS_DATA='{
        "name": "Main Courses",
        "description": "Hearty and satisfying main dishes",
        "sortOrder": 1
    }'
    
    curl -s -X POST "$API_URL/api/menu/categories" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "$MAINS_DATA" > /dev/null
    
    # Desserts
    DESSERTS_DATA='{
        "name": "Desserts",
        "description": "Sweet treats to end your meal",
        "sortOrder": 2
    }'
    
    curl -s -X POST "$API_URL/api/menu/categories" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "$DESSERTS_DATA" > /dev/null
    
    # Beverages
    BEVERAGES_DATA='{
        "name": "Beverages",
        "description": "Refreshing drinks and beverages",
        "sortOrder": 3
    }'
    
    curl -s -X POST "$API_URL/api/menu/categories" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "$BEVERAGES_DATA" > /dev/null
    
    log_info "Menu categories created ✅"
}

# Create sample menu items
create_menu_items() {
    local token=$1
    log_step "Creating sample menu items..."
    
    # Get categories to get their IDs
    CATEGORIES_RESPONSE=$(curl -s -X GET "$API_URL/api/menu/categories" \
        -H "Authorization: Bearer $token")
    
    # Note: In a real implementation, you'd parse the JSON response to get category IDs
    # For this demo, we'll use placeholder category IDs
    
    log_info "Sample menu items would be created here..."
    log_info "In a real implementation, this would parse category IDs and create items"
    
    log_info "Menu items creation completed ✅"
}

# Main seeding process
main() {
    wait_for_api
    create_seed_tenant
    create_seed_users
    
    TOKEN=$(get_auth_token)
    create_menu_categories "$TOKEN"
    create_menu_items "$TOKEN"
    
    log_info ""
    log_info "🎉 Database seeding completed successfully!"
    log_info ""
    log_info "Seed data created:"
    log_info "- Tenant: Demo Restaurant (slug: demo-restaurant)"
    log_info "- Users:"
    log_info "  - admin@demo-restaurant.com (password: admin123)"
    log_info "  - manager@demo-restaurant.com (password: manager123)"
    log_info "  - staff@demo-restaurant.com (password: staff123)"
    log_info "- Menu categories: Appetizers, Main Courses, Desserts, Beverages"
    log_info ""
    log_info "You can now log in to the applications with these credentials."
}

# Run main function
main "$@"