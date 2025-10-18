#!/bin/bash

# E2E Test Runner Script for QuizMaster
# This script ensures the application is running before executing e2e tests

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost"
MAX_WAIT_TIME=60
POLL_INTERVAL=2

echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   QuizMaster E2E Tests Runner        ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"
echo ""

# Check if docker-compose is running
check_docker_running() {
    echo -e "${BLUE}[1/3]${NC} Checking Docker containers..."
    
    if ! docker ps | grep -q quiz-backend || ! docker ps | grep -q quiz-frontend; then
        echo -e "${YELLOW}⚠ Warning: Containers not running${NC}"
        echo -e "${YELLOW}Starting docker-compose...${NC}"
        docker-compose up -d
        echo -e "${GREEN}✓ Containers started${NC}"
        sleep 5
    else
        echo -e "${GREEN}✓ Containers are running${NC}"
    fi
}

# Wait for backend to be healthy
wait_for_backend() {
    echo -e "${BLUE}[2/3]${NC} Waiting for backend to be ready..."
    
    elapsed=0
    while [ $elapsed -lt $MAX_WAIT_TIME ]; do
        if curl -s "$BACKEND_URL/health" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Backend is ready${NC}"
            return 0
        fi
        
        sleep $POLL_INTERVAL
        elapsed=$((elapsed + POLL_INTERVAL))
        echo -n "."
    done
    
    echo ""
    echo -e "${RED}✗ Backend did not become ready in time${NC}"
    echo -e "${YELLOW}Check logs: docker-compose logs backend${NC}"
    exit 1
}

# Wait for frontend to be healthy
wait_for_frontend() {
    echo -e "${BLUE}[3/3]${NC} Waiting for frontend to be ready..."
    
    elapsed=0
    while [ $elapsed -lt $MAX_WAIT_TIME ]; do
        if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Frontend is ready${NC}"
            return 0
        fi
        
        sleep $POLL_INTERVAL
        elapsed=$((elapsed + POLL_INTERVAL))
        echo -n "."
    done
    
    echo ""
    echo -e "${RED}✗ Frontend did not become ready in time${NC}"
    echo -e "${YELLOW}Check logs: docker-compose logs frontend${NC}"
    exit 1
}

# Run e2e tests
run_tests() {
    echo ""
    echo -e "${BLUE}Running E2E tests...${NC}"
    echo ""
    
    cd e2e
    
    # Run tests based on argument
    case "${1:-all}" in
        smoke)
            echo -e "${YELLOW}Running smoke tests only${NC}"
            npm run test:smoke
            ;;
        ui)
            echo -e "${YELLOW}Running in UI mode${NC}"
            npm run test:ui
            ;;
        debug)
            echo -e "${YELLOW}Running in debug mode${NC}"
            npm run test:debug
            ;;
        headed)
            echo -e "${YELLOW}Running in headed mode${NC}"
            npm run test:headed
            ;;
        *)
            echo -e "${YELLOW}Running all tests${NC}"
            npm test
            ;;
    esac
    
    TEST_EXIT_CODE=$?
    cd ..
    
    if [ $TEST_EXIT_CODE -eq 0 ]; then
        echo ""
        echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║   ✓ All E2E tests passed!           ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
    else
        echo ""
        echo -e "${RED}╔═══════════════════════════════════════╗${NC}"
        echo -e "${RED}║   ✗ Some E2E tests failed           ║${NC}"
        echo -e "${RED}╚═══════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${YELLOW}View detailed report: cd e2e && npm run report${NC}"
    fi
    
    exit $TEST_EXIT_CODE
}

# Show usage
show_usage() {
    echo "Usage: ./test-e2e.sh [MODE]"
    echo ""
    echo "Modes:"
    echo "  all      - Run all e2e tests (default)"
    echo "  smoke    - Run only smoke tests (fast)"
    echo "  ui       - Run with Playwright UI"
    echo "  debug    - Run in debug mode"
    echo "  headed   - Run with visible browser"
    echo ""
    echo "Examples:"
    echo "  ./test-e2e.sh          # Run all tests"
    echo "  ./test-e2e.sh smoke    # Run smoke tests only"
    echo "  ./test-e2e.sh ui       # Run with UI"
}

# Main execution
main() {
    if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
        show_usage
        exit 0
    fi
    
    check_docker_running
    wait_for_backend
    wait_for_frontend
    run_tests "$1"
}

main "$@"
