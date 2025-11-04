#!/bin/bash

# Automated deployment script for QuizMaster
# Usage: ./deploy.sh [dev|prod]
# Updated for Docker Compose V2

set -e  # Stop on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
ENVIRONMENT=${1:-dev}
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
COMPOSE_CMD="docker compose"

# Functions
print_step() {
    echo -e "${BLUE}==>${NC} ${GREEN}$1${NC}"
}

print_error() {
    echo -e "${RED}❌ Error: $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Check Docker
check_docker() {
    print_step "Checking Docker..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    # Check for Docker Compose V2
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose V2 is not installed"
        print_warning "Install Docker Compose V2 or use 'docker-compose'"
        exit 1
    fi
    
    print_success "Docker & Docker Compose V2 OK"
}

# Check required files
check_files() {
    print_step "Checking required files..."
    
    if [ ! -f ".env" ]; then
        print_warning ".env not found, creating from .env.example"
        cp .env.example .env
        print_warning "⚠️  Don't forget to change JWT_SECRET in .env!"
        read -p "Press Enter to continue..."
    fi
    
    print_success "Files OK"
}

# Database backup
backup_database() {
    print_step "Backing up database..."
    
    mkdir -p "$BACKUP_DIR"
    
    if docker ps | grep -q quiz-postgres || docker ps | grep -q quiz-backend; then
        $COMPOSE_CMD exec -T postgres pg_dump -U ${POSTGRES_USER:-quizapp} ${POSTGRES_DB:-quizdb} > "$BACKUP_DIR/quiz-backup-$TIMESTAMP.sql" 2>/dev/null || true
        
        if [ -f "$BACKUP_DIR/quiz-backup-$TIMESTAMP.sql" ]; then
            print_success "Backup created: $BACKUP_DIR/quiz-backup-$TIMESTAMP.sql"
        else
            print_warning "No backup (empty database or first installation)"
        fi
    else
        print_warning "Database not started, backup skipped"
    fi
}

# Development deployment
deploy_dev() {
    print_step "🚀 Deploying in DEVELOPMENT mode"
    
    $COMPOSE_CMD down
    $COMPOSE_CMD build
    $COMPOSE_CMD up -d
    
    print_success "Application started in development mode"
}

# Production deployment
deploy_prod() {
    print_step "🚀 Deploying in PRODUCTION mode"
    
    # Check JWT_SECRET
    if grep -q "votre_secret_jwt" .env; then
        print_error "JWT_SECRET has not been changed in .env!"
        print_warning "Generate a secret with: openssl rand -base64 32"
        exit 1
    fi
    
    # Backup before deployment
    backup_database
    
    # Stop services
    $COMPOSE_CMD -f compose.prod.yaml down
    
    # Build images
    print_step "Building images..."
    DOCKER_BUILDKIT=1 $COMPOSE_CMD -f compose.prod.yaml build --no-cache
    
    # Start services
    print_step "Starting services..."
    $COMPOSE_CMD -f compose.prod.yaml up -d
    
    print_success "Application started in production mode"
}

# Check health
check_health() {
    print_step "Checking application health..."
    
    # Wait for services to start
    sleep 10
    
    # Check backend
    if curl -sf http://localhost:3001/health/live > /dev/null; then
        print_success "Backend OK"
    else
        print_error "Backend not accessible"
        $COMPOSE_CMD logs backend
        exit 1
    fi
    
    # Check frontend (dev mode on port 5173, prod on port 80)
    if [ "$ENVIRONMENT" = "dev" ]; then
        FRONTEND_URL="http://localhost:5173"
    else
        FRONTEND_URL="http://localhost"
    fi
    
    if curl -sf $FRONTEND_URL > /dev/null; then
        print_success "Frontend OK"
    else
        print_error "Frontend not accessible"
        $COMPOSE_CMD logs frontend
        exit 1
    fi
}

# Display information
display_info() {
    echo ""
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo ""
    echo -e "🌐 URLs:"
    if [ "$ENVIRONMENT" = "dev" ]; then
        echo -e "   Frontend: ${YELLOW}http://localhost:5173${NC}"
        echo -e "   Backend:  ${YELLOW}http://localhost:3001${NC}"
    else
        echo -e "   Frontend: ${YELLOW}http://localhost${NC}"
        echo -e "   Backend:  ${YELLOW}http://localhost:3001${NC}"
    fi
    echo ""
    echo -e "👤 Default admin account:"
    echo -e "   Email:    ${YELLOW}admin@quiz.com${NC}"
    echo -e "   Password: ${YELLOW}admin123${NC}"
    echo ""
    echo -e "📊 Useful commands:"
    echo -e "   make logs        - View logs"
    echo -e "   make ps          - Container status"
    echo -e "   make backup      - Backup database"
    echo -e "   make restart     - Restart services"
    echo ""
    
    if [ "$ENVIRONMENT" = "prod" ]; then
        echo -e "${YELLOW}⚠️  In production, remember to:${NC}"
        echo -e "   - Configure SSL/HTTPS"
        echo -e "   - Change admin password"
        echo -e "   - Set up automatic backups"
        echo -e "   - Configure firewall"
        echo ""
    fi
}

# Main function
main() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════╗"
    echo "║     QuizMaster - Deployment          ║"
    echo "╚═══════════════════════════════════════╝"
    echo -e "${NC}"
    
    check_docker
    check_files
    
    case $ENVIRONMENT in
        dev)
            deploy_dev
            ;;
        prod)
            deploy_prod
            ;;
        *)
            print_error "Invalid environment: $ENVIRONMENT"
            echo "Usage: $0 [dev|prod]"
            exit 1
            ;;
    esac
    
    check_health
    display_info
}

# Error handling
trap 'print_error "Deployment failed"; exit 1' ERR

# Execute
main