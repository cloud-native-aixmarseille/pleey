#!/bin/bash
# Quick test runner for QuizMaster
# Usage: ./test-quick.sh [backend|frontend|e2e|all]

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to display usage
usage() {
    echo -e "${GREEN}QuizMaster Quick Test Runner${NC}"
    echo ""
    echo "Usage: $0 [option]"
    echo ""
    echo "Options:"
    echo "  backend     Run backend unit tests"
    echo "  frontend    Run frontend unit tests"
    echo "  e2e         Run end-to-end tests"
    echo "  smoke       Run smoke tests only"
    echo "  all         Run all tests (default)"
    echo "  watch       Run tests in watch mode"
    echo "  cov         Run tests with coverage"
    echo ""
    echo "Examples:"
    echo "  $0 backend       # Run backend tests"
    echo "  $0 frontend      # Run frontend tests"
    echo "  $0 all           # Run all tests"
    echo ""
}

# Function to run backend tests
run_backend() {
    echo -e "${GREEN}Running backend tests...${NC}"
    cd backend && npm test
}

# Function to run frontend tests
run_frontend() {
    echo -e "${GREEN}Running frontend tests...${NC}"
    cd frontend && npm test
}

# Function to run e2e tests
run_e2e() {
    echo -e "${GREEN}Running E2E tests...${NC}"
    cd e2e && npm test
}

# Function to run smoke tests
run_smoke() {
    echo -e "${GREEN}Running smoke tests...${NC}"
    cd e2e && npm run test:smoke
}

# Function to run all tests
run_all() {
    echo -e "${GREEN}Running all tests...${NC}"
    run_backend
    run_frontend
    run_e2e
    echo -e "${GREEN}✓ All tests completed!${NC}"
}

# Function to run tests in watch mode
run_watch() {
    echo -e "${GREEN}Choose tests to watch:${NC}"
    echo "  1) Backend"
    echo "  2) Frontend"
    read -p "Enter choice [1-2]: " choice
    case $choice in
        1) cd backend && npm run test:watch ;;
        2) cd frontend && npm run test:watch ;;
        *) echo -e "${RED}Invalid choice${NC}" && exit 1 ;;
    esac
}

# Function to run tests with coverage
run_coverage() {
    echo -e "${GREEN}Running tests with coverage...${NC}"
    echo -e "${YELLOW}Backend coverage:${NC}"
    cd backend && npm run test:cov
    cd ..
    echo ""
    echo -e "${YELLOW}Frontend coverage:${NC}"
    cd frontend && npm run test:cov
    cd ..
    echo ""
    echo -e "${GREEN}✓ Coverage reports generated!${NC}"
    echo "  Backend:  backend/coverage/index.html"
    echo "  Frontend: frontend/coverage/index.html"
}

# Main script
case "${1:-all}" in
    backend)
        run_backend
        ;;
    frontend)
        run_frontend
        ;;
    e2e)
        run_e2e
        ;;
    smoke)
        run_smoke
        ;;
    all)
        run_all
        ;;
    watch)
        run_watch
        ;;
    cov|coverage)
        run_coverage
        ;;
    help|-h|--help)
        usage
        ;;
    *)
        echo -e "${RED}Unknown option: $1${NC}"
        echo ""
        usage
        exit 1
        ;;
esac
