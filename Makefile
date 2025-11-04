# Makefile for QuizMaster
# Using Docker Compose V2

.PHONY: help build up down restart logs clean backup restore seed docs test test-backend test-frontend test-e2e test-all test-watch test-cov

# Docker Compose command (V2)
COMPOSE := docker compose

# Colors for display
GREEN=\033[0;32m
YELLOW=\033[1;33m
NC=\033[0m # No Color

help: ## Display this help
	@echo "$(GREEN)QuizMaster - Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

setup: ## Initial setup (first installation)
	@echo "$(GREEN)Configuring environment...$(NC)"
	@cp -n .env.example .env || true
	@echo "$(YELLOW)⚠️  Don't forget to modify JWT_SECRET in .env$(NC)"

build: ## Build Docker images
	@echo "$(GREEN)Building images...$(NC)"
	$(COMPOSE) build

up: ## Start the application
	@echo "$(GREEN)Starting application...$(NC)"
	$(COMPOSE) up -d	
	@echo "$(GREEN)✓ Application started$(NC)"
	@echo "Frontend: http://frontend.quiz-master.localhost"
	@echo "Backend: http://backend.quiz-master.localhost"
	@echo "Traefik Dashboard: http://localhost:8080"

down: ## Stop the application
	@echo "$(YELLOW)Stopping application...$(NC)"
	$(COMPOSE) down
	@echo "$(GREEN)✓ Application stopped$(NC)"

restart: ## Restart the application
	@echo "$(YELLOW)Restarting...$(NC)"
	$(COMPOSE) restart
	@echo "$(GREEN)✓ Application restarted$(NC)"

logs: ## Display logs in real-time
	$(COMPOSE) logs -f

logs-backend: ## Backend logs only
	$(COMPOSE) logs -f backend

logs-frontend: ## Frontend logs only
	$(COMPOSE) logs -f frontend

seed: ## Populate database with Prisma fixtures
	@echo "$(GREEN)Applying migrations and seeding database...$(NC)"
	@$(COMPOSE) exec -T backend npm run db:seed 2>&1 | grep -v "warn The configuration property" | grep -v "For more information, see: https://pris.ly/prisma-config" | grep -v "warn The Prisma config file" || true
	@echo "$(GREEN)✓ Fixtures inserted$(NC)"

ps: ## Display container status
	$(COMPOSE) ps

rebuild: down build up ## Rebuild and restart

clean: ## Clean (without deleting data)
	@echo "$(YELLOW)Cleaning...$(NC)"
	$(COMPOSE) down
	docker system prune -f
	@echo "$(GREEN)✓ Cleaning completed$(NC)"

clean-all: ## Clean everything (including data volumes)
	@echo "$(YELLOW)⚠️  Deleting all data...$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		$(COMPOSE) down -v; \
		rm -rf backend/data; \
		echo "$(GREEN)✓ Everything deleted$(NC)"; \
	fi

backup: ## Backup the database
	@echo "$(GREEN)Creating backup...$(NC)"
	@mkdir -p backups
	@$(COMPOSE) exec -T postgres pg_dump -U ${POSTGRES_USER:-quizapp} ${POSTGRES_DB:-quizdb} > backups/quiz-backup-$$(date +%Y%m%d-%H%M%S).sql
	@echo "$(GREEN)✓ Backup created in backups/$(NC)"

restore: ## Restore the latest backup
	@echo "$(YELLOW)Restoring latest backup...$(NC)"
	@LATEST=$$(ls -t backups/quiz-backup-*.sql 2>/dev/null | head -1); \
	if [ -z "$$LATEST" ]; then \
		echo "$(YELLOW)No backup found$(NC)"; \
		exit 1; \
	fi; \
	$(COMPOSE) exec -T postgres psql -U ${POSTGRES_USER:-quizapp} -d ${POSTGRES_DB:-quizdb} < $$LATEST && \
	$(COMPOSE) restart backend && \
	echo "$(GREEN)✓ Backup restored: $$LATEST$(NC)"

shell-backend: ## Access backend shell
	$(COMPOSE) exec backend sh

shell-frontend: ## Access frontend shell
	$(COMPOSE) exec frontend sh

db-shell: ## Access PostgreSQL database shell
	$(COMPOSE) exec postgres psql -U ${POSTGRES_USER:-quizapp} -d ${POSTGRES_DB:-quizdb}

traefik: ## Open Traefik dashboard
	@echo "$(GREEN)Opening Traefik dashboard...$(NC)"
	@command -v xdg-open >/dev/null 2>&1 && xdg-open http://localhost:8080 || open http://localhost:8080 || echo "Open http://localhost:8080"

health: ## Check application health
	@echo "$(GREEN)Checking status...$(NC)"
	@curl -s http://backend.quiz-master.localhost/health/live | jq '.' || echo "$(YELLOW)Backend unavailable$(NC)"
	@curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://frontend.quiz-master.localhost/

install: setup build up ## Complete installation (first time)
	@echo "$(GREEN)═══════════════════════════════════════$(NC)"
	@echo "$(GREEN)✓ Installation completed successfully!$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════$(NC)"
	@echo ""
	@echo "Application available at:"
	@echo "  Frontend: $(YELLOW)http://frontend.quiz-master.localhost$(NC)"
	@echo "  Backend:  $(YELLOW)http://backend.quiz-master.localhost$(NC)"
	@echo "  Traefik:  $(YELLOW)http://localhost:8080$(NC)"
	@echo ""
	@echo "Default admin account:"
	@echo "  Email:    $(YELLOW)admin@quiz.com$(NC)"
	@echo "  Password: $(YELLOW)admin123$(NC)"
	@echo ""
	@echo "$(YELLOW)⚠️  Don't forget to change JWT_SECRET in .env !$(NC)"

dev: ## Development mode (real-time logs)
	$(COMPOSE) up

prod: build up ## Production deployment
	@echo "$(GREEN)✓ Deployed to production$(NC)"

update: ## Update the application
	@echo "$(GREEN)Updating...$(NC)"
	git pull
	$(MAKE) rebuild
	@echo "$(GREEN)✓ Update completed$(NC)"

monitoring-up: ## Start with monitoring
	@echo "$(GREEN)Starting with monitoring...$(NC)"
	$(COMPOSE) -f compose.yaml -f compose.monitoring.yaml up -d
	@echo "$(GREEN)✓ Monitoring enabled$(NC)"
	@echo "Grafana: http://localhost:3000 (admin/admin123)"
	@echo "Prometheus: http://localhost:9090"

monitoring-down: ## Stop monitoring
	$(COMPOSE) -f compose.monitoring.yaml down

monitoring-logs: ## Monitoring logs
	$(COMPOSE) -f compose.monitoring.yaml logs -f

grafana: ## Open Grafana
	@echo "$(GREEN)Opening Grafana...$(NC)"
	@command -v xdg-open >/dev/null 2>&1 && xdg-open http://localhost:3000 || open http://localhost:3000 || echo "Open http://localhost:3000"

prometheus: ## Open Prometheus
	@echo "$(GREEN)Opening Prometheus...$(NC)"
	@command -v xdg-open >/dev/null 2>&1 && xdg-open http://localhost:9090 || open http://localhost:9090 || echo "Open http://localhost:9090"

docs: ## Open documentation (Docusaurus)
	@echo "$(GREEN)Opening documentation...$(NC)"
	@if [ ! -d "docs/node_modules" ]; then \
		echo "$(YELLOW)Installing documentation dependencies...$(NC)"; \
		cd docs && npm install; \
	fi
	@cd docs && npm run start

# ==========================================
# Testing Commands
# ==========================================

test: ## Run all tests (backend + frontend + e2e)
	@echo "$(GREEN)Running all tests...$(NC)"
	@echo "$(YELLOW)Note: Ensure containers are running (make up) or install dependencies locally$(NC)"
	@FAILED=0; \
	$(MAKE) test-backend || FAILED=$$((FAILED + 1)); \
	$(MAKE) test-frontend || FAILED=$$((FAILED + 1)); \
	$(MAKE) test-e2e || FAILED=$$((FAILED + 1)); \
	if [ $$FAILED -eq 0 ]; then \
		echo "$(GREEN)✓ All tests completed successfully!$(NC)"; \
	else \
		echo "$(RED)✗ $$FAILED test suite(s) failed$(NC)"; \
		exit 1; \
	fi

test-backend: ## Run backend unit tests
	@echo "$(GREEN)Running backend tests...$(NC)"
	@if [ -d "backend/node_modules/.bin/vitest" ]; then \
		cd backend && npm test; \
	elif docker compose ps backend | grep -q "Up"; then \
		docker compose exec -T backend npm test; \
	else \
		echo "$(RED)Error: Backend container not running and local dependencies not found$(NC)"; \
		echo "$(YELLOW)Run 'make up' to start containers, or 'cd backend && npm install' for local testing$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✓ Backend tests completed$(NC)"

test-frontend: ## Run frontend unit tests
	@echo "$(GREEN)Running frontend tests...$(NC)"
	@if [ -d "frontend/node_modules/.bin/vitest" ]; then \
		cd frontend && npm test; \
	elif docker compose ps frontend | grep -q "Up"; then \
		docker compose exec -T frontend npm test; \
	else \
		echo "$(RED)Error: Frontend container not running and local dependencies not found$(NC)"; \
		echo "$(YELLOW)Run 'make up' to start containers, or 'cd frontend && npm install' for local testing$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✓ Frontend tests completed$(NC)"

test-e2e: ## Run end-to-end tests
	@echo "$(GREEN)Running E2E tests...$(NC)"
	@if [ -d "e2e/node_modules" ]; then \
		cd e2e && npm test; \
	else \
		echo "$(YELLOW)Installing E2E dependencies...$(NC)"; \
		cd e2e && npm install && npm test; \
	fi
	@echo "$(GREEN)✓ E2E tests completed$(NC)"

test-e2e-ui: ## Run E2E tests in UI mode
	@echo "$(GREEN)Opening Playwright UI...$(NC)"
	@cd e2e && npm run test:ui

test-e2e-smoke: ## Run smoke tests only
	@echo "$(GREEN)Running smoke tests...$(NC)"
	@cd e2e && npm run test:smoke
	@echo "$(GREEN)✓ Smoke tests completed$(NC)"

test-watch: ## Run tests in watch mode (backend + frontend)
	@echo "$(GREEN)Which tests to watch?$(NC)"
	@echo "  1) Backend"
	@echo "  2) Frontend"
	@read -p "Choose [1-2]: " choice; \
	case $$choice in \
		1) $(MAKE) test-backend-watch ;; \
		2) $(MAKE) test-frontend-watch ;; \
		*) echo "$(YELLOW)Invalid choice$(NC)" ;; \
	esac

test-backend-watch: ## Run backend tests in watch mode
	@echo "$(GREEN)Starting backend tests in watch mode...$(NC)"
	@if [ -d "backend/node_modules" ]; then \
		cd backend && npm run test:watch; \
	else \
		$(COMPOSE) exec backend npm run test:watch; \
	fi

test-frontend-watch: ## Run frontend tests in watch mode
	@echo "$(GREEN)Starting frontend tests in watch mode...$(NC)"
	@if [ -d "frontend/node_modules" ]; then \
		cd frontend && npm run test:watch; \
	else \
		$(COMPOSE) exec frontend npm run test:watch; \
	fi

test-cov: ## Run tests with coverage (backend + frontend)
	@echo "$(GREEN)Running tests with coverage...$(NC)"
	@echo "$(YELLOW)Backend coverage:$(NC)"
	@if [ -d "backend/node_modules" ]; then \
		cd backend && npm run test:cov; \
	else \
		$(COMPOSE) exec -T backend npm run test:cov; \
	fi
	@echo ""
	@echo "$(YELLOW)Frontend coverage:$(NC)"
	@if [ -d "frontend/node_modules" ]; then \
		cd frontend && npm run test:cov; \
	else \
		$(COMPOSE) exec -T frontend npm run test:cov; \
	fi
	@echo "$(GREEN)✓ Coverage reports generated$(NC)"

test-backend-cov: ## Run backend tests with coverage
	@echo "$(GREEN)Running backend tests with coverage...$(NC)"
	@if [ -d "backend/node_modules" ]; then \
		cd backend && npm run test:cov; \
	else \
		$(COMPOSE) exec -T backend npm run test:cov; \
	fi
	@echo "$(GREEN)✓ Backend coverage report: backend/coverage/index.html$(NC)"

test-frontend-cov: ## Run frontend tests with coverage
	@echo "$(GREEN)Running frontend tests with coverage...$(NC)"
	@if [ -d "frontend/node_modules" ]; then \
		cd frontend && npm run test:cov; \
	else \
		$(COMPOSE) exec -T frontend npm run test:cov; \
	fi
	@echo "$(GREEN)✓ Frontend coverage report: frontend/coverage/index.html$(NC)"

test-ui: ## Run tests with UI (backend or frontend)
	@echo "$(GREEN)Which tests UI to open?$(NC)"
	@echo "  1) Backend"
	@echo "  2) Frontend"
	@read -p "Choose [1-2]: " choice; \
	case $$choice in \
		1) cd backend && npm run test:ui ;; \
		2) cd frontend && npm run test:ui ;; \
		*) echo "$(YELLOW)Invalid choice$(NC)" ;; \
	esac

test-install: ## Install test dependencies for all projects
	@echo "$(GREEN)Installing test dependencies...$(NC)"
	@cd backend && npm install
	@cd frontend && npm install
	@cd e2e && npm install
	@echo "$(GREEN)✓ Test dependencies installed$(NC)"