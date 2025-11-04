#!/bin/bash

# Script de tests automatisés pour QuizMaster
# Usage: ./test.sh

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variables
BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost"
TEST_USER_EMAIL="test@example.com"
TEST_USER_PASSWORD="test123"
TESTS_PASSED=0
TESTS_FAILED=0

# Fonctions
print_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((TESTS_PASSED++))
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((TESTS_FAILED++))
}

print_section() {
    echo ""
    echo -e "${YELLOW}══════════════════════════════════════${NC}"
    echo -e "${YELLOW}  $1${NC}"
    echo -e "${YELLOW}══════════════════════════════════════${NC}"
}

# Tests
test_backend_health() {
    print_test "Backend health check"
    
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/health")
    
    if [ "$RESPONSE" = "200" ]; then
        print_pass "Backend is healthy (HTTP 200)"
    else
        print_fail "Backend unhealthy (HTTP $RESPONSE)"
    fi
}

test_backend_response_time() {
    print_test "Backend response time"
    
    TIME=$(curl -o /dev/null -s -w '%{time_total}\n' "$BACKEND_URL/api/health")
    
    if (( $(echo "$TIME < 1.0" | bc -l) )); then
        print_pass "Response time: ${TIME}s (< 1s)"
    else
        print_fail "Response time too slow: ${TIME}s"
    fi
}

test_frontend_accessible() {
    print_test "Frontend accessibility"
    
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
    
    if [ "$RESPONSE" = "200" ]; then
        print_pass "Frontend is accessible (HTTP 200)"
    else
        print_fail "Frontend not accessible (HTTP $RESPONSE)"
    fi
}

test_api_register() {
    print_test "User registration API"
    
    RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/register" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"testuser\",\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_USER_PASSWORD\"}" \
        -w "%{http_code}")
    
    HTTP_CODE="${RESPONSE: -3}"
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "400" ]; then
        print_pass "Registration endpoint working (HTTP $HTTP_CODE)"
    else
        print_fail "Registration failed (HTTP $HTTP_CODE)"
    fi
}

test_api_login() {
    print_test "User login API"
    
    RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"admin@quiz.com\",\"password\":\"admin123\"}")
    
    if echo "$RESPONSE" | grep -q "token"; then
        print_pass "Login successful (token received)"
        export TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    else
        print_fail "Login failed (no token)"
    fi
}

test_api_quizzes() {
    print_test "Quizzes API (authenticated)"
    
    if [ -z "$TOKEN" ]; then
        print_fail "No token available (login test must pass first)"
        return
    fi
    
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/quizzes" \
        -H "Authorization: Bearer $TOKEN")
    
    if [ "$RESPONSE" = "200" ]; then
        print_pass "Quizzes API working (HTTP 200)"
    else
        print_fail "Quizzes API failed (HTTP $RESPONSE)"
    fi
}

test_docker_containers() {
    print_test "Docker containers status"
    
    BACKEND_STATUS=$(docker inspect -f '{{.State.Running}}' quiz-backend 2>/dev/null || echo "false")
    FRONTEND_STATUS=$(docker inspect -f '{{.State.Running}}' quiz-frontend 2>/dev/null || echo "false")
    
    if [ "$BACKEND_STATUS" = "true" ] && [ "$FRONTEND_STATUS" = "true" ]; then
        print_pass "All containers running"
    else
        print_fail "Some containers not running (Backend: $BACKEND_STATUS, Frontend: $FRONTEND_STATUS)"
    fi
}

test_database_exists() {
    print_test "Database file exists"
    
    if docker exec quiz-backend test -f /app/data/quiz.db; then
        print_pass "Database file exists"
    else
        print_fail "Database file not found"
    fi
}

test_database_tables() {
    print_test "Database tables integrity"
    
    TABLES=$(docker exec quiz-backend sqlite3 /app/data/quiz.db ".tables" 2>/dev/null || echo "")
    
    if echo "$TABLES" | grep -q "users" && \
       echo "$TABLES" | grep -q "quizzes" && \
       echo "$TABLES" | grep -q "questions"; then
        print_pass "All required tables exist"
    else
        print_fail "Missing database tables"
    fi
}

test_admin_user_exists() {
    print_test "Admin user in database"
    
    COUNT=$(docker exec quiz-backend sqlite3 /app/data/quiz.db \
        "SELECT COUNT(*) FROM users WHERE email='admin@quiz.com';" 2>/dev/null || echo "0")
    
    if [ "$COUNT" -gt 0 ]; then
        print_pass "Admin user exists in database"
    else
        print_fail "Admin user not found"
    fi
}

test_memory_usage() {
    print_test "Memory usage check"
    
    BACKEND_MEM=$(docker stats --no-stream --format "{{.MemUsage}}" quiz-backend | awk '{print $1}' | sed 's/MiB//')
    
    if (( $(echo "$BACKEND_MEM < 500" | bc -l) )); then
        print_pass "Backend memory usage: ${BACKEND_MEM}MiB (< 500MiB)"
    else
        print_fail "Backend memory usage too high: ${BACKEND_MEM}MiB"
    fi
}

test_ssl_certificates() {
    print_test "SSL certificates (if configured)"
    
    if [ -f "nginx/ssl/fullchain.pem" ] && [ -f "nginx/ssl/privkey.pem" ]; then
        print_pass "SSL certificates found"
    else
        echo -e "${YELLOW}[SKIP]${NC} SSL not configured (optional)"
    fi
}

test_env_file() {
    print_test ".env file configuration"
    
    if [ -f ".env" ]; then
        if grep -q "votre_secret_jwt" .env; then
            print_fail "JWT_SECRET not changed from default"
        else
            print_pass ".env file properly configured"
        fi
    else
        print_fail ".env file not found"
    fi
}

test_websocket_connection() {
    print_test "WebSocket connectivity"
    
    # Test simple de connexion socket.io
    RESPONSE=$(curl -s "$BACKEND_URL/socket.io/?transport=polling" | head -c 10)
    
    if [ -n "$RESPONSE" ]; then
        print_pass "WebSocket endpoint responding"
    else
        print_fail "WebSocket endpoint not responding"
    fi
}

test_cors_headers() {
    print_test "CORS headers"
    
    HEADERS=$(curl -s -I "$BACKEND_URL/api/health")
    
    if echo "$HEADERS" | grep -q "Access-Control-Allow-Origin"; then
        print_pass "CORS headers present"
    else
        print_fail "CORS headers missing"
    fi
}

test_logs_for_errors() {
    print_test "Recent logs for errors"
    
    ERROR_COUNT=$(docker compose logs --tail=100 2>&1 | grep -i error | grep -v "error.log" | wc -l)
    
    if [ "$ERROR_COUNT" -eq 0 ]; then
        print_pass "No errors in recent logs"
    else
        print_fail "Found $ERROR_COUNT errors in logs"
    fi
}

# Tests de performance
test_load_test() {
    print_test "Basic load test (100 requests)"
    
    if command -v ab &> /dev/null; then
        RESULT=$(ab -n 100 -c 10 -q "$BACKEND_URL/api/health" 2>&1)
        FAILED=$(echo "$RESULT" | grep "Failed requests:" | awk '{print $3}')
        
        if [ "$FAILED" = "0" ]; then
            print_pass "Load test passed (0 failed requests)"
        else
            print_fail "Load test failed ($FAILED failed requests)"
        fi
    else
        echo -e "${YELLOW}[SKIP]${NC} Apache Bench not installed"
    fi
}

# Fonction principale
main() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════╗"
    echo "║   QuizMaster - Tests Automatisés     ║"
    echo "╚═══════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Section 1: Services
    print_section "Services Health"
    test_docker_containers
    test_backend_health
    test_backend_response_time
    test_frontend_accessible
    test_websocket_connection
    
    # Section 2: API
    print_section "API Endpoints"
    test_api_register
    test_api_login
    test_api_quizzes
    test_cors_headers
    
    # Section 3: Database
    print_section "Database"
    test_database_exists
    test_database_tables
    test_admin_user_exists
    
    # Section 4: Configuration
    print_section "Configuration"
    test_env_file
    test_ssl_certificates
    
    # Section 5: Performance
    print_section "Performance"
    test_memory_usage
    test_logs_for_errors
    test_load_test
    
    # Résultats
    echo ""
    echo -e "${YELLOW}══════════════════════════════════════${NC}"
    echo -e "${YELLOW}           Test Results               ${NC}"
    echo -e "${YELLOW}══════════════════════════════════════${NC}"
    echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
    echo -e "${RED}Failed: $TESTS_FAILED${NC}"
    echo -e "Total:  $((TESTS_PASSED + TESTS_FAILED))"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✓ All tests passed!${NC}"
        exit 0
    else
        echo ""
        echo -e "${RED}✗ Some tests failed${NC}"
        exit 1
    fi
}

# Vérifier que l'application est lancée
if ! curl -s "$BACKEND_URL/api/health" > /dev/null 2>&1; then
    echo -e "${RED}Error: Application not running${NC}"
    echo "Please start the application first: docker compose up -d"
    exit 1
fi

# Exécution
main