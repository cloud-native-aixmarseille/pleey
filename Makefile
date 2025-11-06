# Makefile for QuizMaster
# Using Docker Compose V2

.PHONY: help setup build up down restart logs clean clean-all backup restore seed ps rebuild monitoring-up monitoring-down monitoring-logs grafana prometheus test test-watch test-ui test-cov test-e2e-smoke test-e2e-ui shell db-shell traefik install health _test-scope _run-node _run-e2e

# Docker Compose command (V2)
COMPOSE := docker compose

# Colors for display
GREEN=\033[0;32m
YELLOW=\033[1;33m
RED=\033[0;31m
NC=\033[0m # No Color

help: ## Display this help
	@echo "$(GREEN)QuizMaster - Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

install: setup build up migrate seed openapi ## Complete installation (first time)
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
	@echo "Test player account:"
	@echo "  Email:    $(YELLOW)player@quiz.com$(NC)"
	@echo "  Password: $(YELLOW)player123$(NC)"
	@echo ""
	@echo "$(YELLOW)⚠️  Don't forget to change JWT_SECRET in .env !$(NC)"

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
	@echo "$(GREEN)Waiting for backend OpenAPI endpoint...$(NC)"
	@ATTEMPTS=0; \
	until $(COMPOSE) exec -T backend sh -c "curl -sf http://localhost:3001/api/openapi.json >/dev/null"; do \
		ATTEMPTS=$$((ATTEMPTS+1)); \
		if [ $$ATTEMPTS -gt 30 ]; then \
			echo "$(RED)Backend API did not become ready in time$(NC)"; \
			exit 1; \
		fi; \
		echo "$(YELLOW)Waiting for backend API (attempt $$ATTEMPTS)...$(NC)"; \
		sleep 2; \
	done
	@echo "$(GREEN)Backend API ready$(NC)"
	@echo "$(GREEN)✓ Application started$(NC)"
	@echo "Frontend: http://frontend.quiz-master.localhost"
	@echo "Backend: http://backend.quiz-master.localhost"
	@echo "Traefik Dashboard: http://localhost:8080"

migrate: ## Apply database migrations
	@echo "$(GREEN)Applying database migrations...$(NC)"
	@$(COMPOSE) exec -T backend npm run db:migrate
	@echo "$(GREEN)✓ Migrations applied$(NC)"

seed: ## Seed the database
	@echo "$(GREEN)Seeding database...$(NC)"
	@$(COMPOSE) exec -T backend npm run db:seed
	@echo "$(GREEN)✓ Database seeded$(NC)"

openapi: ## Generate OpenAPI types
	@echo "$(GREEN)Generating OpenAPI documentation...$(NC)"
	@$(COMPOSE) exec -T frontend npm run openapi:generate
	@echo "$(GREEN)✓ OpenAPI documentation generated$(NC)"

down: ## Stop the application
	@echo "$(YELLOW)Stopping application...$(NC)"
	$(COMPOSE) down
	@echo "$(GREEN)✓ Application stopped$(NC)"

restart: ## Restart the application
	@echo "$(YELLOW)Restarting...$(NC)"
	$(COMPOSE) restart
	@echo "$(GREEN)✓ Application restarted$(NC)"

logs: ## Display logs (set SERVICE=<name> for a specific service)
	@if [ -n "$(SERVICE)" ]; then \
		echo "$(GREEN)Tailing logs for '$(SERVICE)'...$(NC)"; \
		$(COMPOSE) logs -f $(SERVICE); \
	else \
		$(COMPOSE) logs -f; \
	fi

logs-%: ## Shortcut to tail logs for a specific service (e.g. make logs-backend)
	@$(MAKE) --no-print-directory logs SERVICE=$*

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

shell: ## Open a service shell (set SERVICE=<name>)
	@if [ -z "$(SERVICE)" ]; then \
		echo "$(YELLOW)Usage: make shell SERVICE=backend$(NC)"; \
		exit 1; \
	fi
	$(COMPOSE) exec $(SERVICE) sh

shell-%: ## Shortcut to open a specific service shell (e.g. make shell-backend)
	@$(MAKE) --no-print-directory shell SERVICE=$*

db-shell: ## Access PostgreSQL database shell
	$(COMPOSE) exec postgres psql -U ${POSTGRES_USER:-quizapp} -d ${POSTGRES_DB:-quizdb}

traefik: ## Open Traefik dashboard
	@echo "$(GREEN)Opening Traefik dashboard...$(NC)"
	@command -v xdg-open >/dev/null 2>&1 && xdg-open http://localhost:8080 || open http://localhost:8080 || echo "Open http://localhost:8080"

health: ## Check application health
	@echo "$(GREEN)Checking status...$(NC)"
	@curl -s http://backend.quiz-master.localhost/health/live | jq '.' || echo "$(YELLOW)Backend unavailable$(NC)"
	@curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://frontend.quiz-master.localhost/

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

# ==========================================
# Testing Commands
# ==========================================

test: ## Run tests (SCOPE=all|backend|frontend|e2e, MODE=default|watch|cov|ui|smoke)
	@set -e; \
	TARGET_SCOPE="$(SCOPE)"; \
	TARGET_MODE="$(MODE)"; \
	if [ -z "$$TARGET_SCOPE" ]; then \
		TARGET_SCOPE="all"; \
	fi; \
	if [ -z "$$TARGET_MODE" ]; then \
		TARGET_MODE="default"; \
	fi; \
	if [ "$$TARGET_SCOPE" = "all" ]; then \
		case "$$TARGET_MODE" in \
			default) \
				echo "$(GREEN)Running all tests...$(NC)"; \
				echo "$(YELLOW)Note: Ensure containers are running (make up) or install dependencies locally$(NC)"; \
				$(MAKE) --no-print-directory _test-scope SCOPE=backend MODE=default; \
				$(MAKE) --no-print-directory _test-scope SCOPE=frontend MODE=default; \
				$(MAKE) --no-print-directory _test-scope SCOPE=e2e MODE=default; \
				echo "$(GREEN)✓ All tests completed successfully!$(NC)"; \
				;; \
			cov) \
				echo "$(GREEN)Running tests with coverage...$(NC)"; \
				$(MAKE) --no-print-directory _test-scope SCOPE=backend MODE=cov; \
				echo ""; \
				$(MAKE) --no-print-directory _test-scope SCOPE=frontend MODE=cov; \
				echo "$(GREEN)✓ Coverage reports generated$(NC)"; \
				;; \
			*) \
				echo "$(YELLOW)Mode '$$TARGET_MODE' requires SCOPE=backend|frontend|e2e$(NC)"; \
				exit 1; \
				;; \
		esac; \
	else \
		$(MAKE) --no-print-directory _test-scope SCOPE=$$TARGET_SCOPE MODE=$$TARGET_MODE; \
	fi

test-%: ## Run tests for a specific scope (supports MODE, e.g. make test-backend MODE=watch)
	@$(MAKE) --no-print-directory test SCOPE=$* MODE=$(MODE)

test-%-watch: ## Run tests in watch mode for a scope (e.g. make test-backend-watch)
	@$(MAKE) --no-print-directory test-$* MODE=watch

test-%-cov: ## Run coverage for a scope (e.g. make test-frontend-cov)
	@$(MAKE) --no-print-directory test-$* MODE=cov

test-%-ui: ## Run test UI for a scope (e.g. make test-frontend-ui)
	@$(MAKE) --no-print-directory test-$* MODE=ui

test-%-smoke: ## Run smoke tests for a scope (e.g. make test-e2e-smoke)
	@$(MAKE) --no-print-directory test-$* MODE=smoke

test-watch: ## Run tests in watch mode (set SCOPE=backend|frontend)
	@if [ -z "$(SCOPE)" ]; then \
		echo "$(YELLOW)Usage: make test-watch SCOPE=backend|frontend$(NC)"; \
		exit 1; \
	fi
	@$(MAKE) --no-print-directory test SCOPE=$(SCOPE) MODE=watch

test-ui: ## Run Vitest UI (set SCOPE=backend|frontend|e2e)
	@if [ -z "$(SCOPE)" ]; then \
		echo "$(YELLOW)Usage: make test-ui SCOPE=backend|frontend|e2e$(NC)"; \
		exit 1; \
	fi
	@$(MAKE) --no-print-directory test SCOPE=$(SCOPE) MODE=ui

test-cov: ## Run backend and frontend coverage (alias for make test MODE=cov)
	@$(MAKE) --no-print-directory test MODE=cov

test-install: ## Install test dependencies for all projects
	@echo "$(GREEN)Installing test dependencies...$(NC)"
	@cd backend && npm install
	@cd frontend && npm install
	@cd e2e && npm install
	@echo "$(GREEN)✓ Test dependencies installed$(NC)"

_run-node:
	@TTY_FLAG="-T"; \
	if [ "$(TTY)" = "1" ]; then \
		TTY_FLAG=""; \
	fi; \
	if [ -d "$(DIR)/node_modules" ]; then \
		cd $(DIR) && npm run $(SCRIPT); \
	elif $(COMPOSE) ps $(SERVICE) | grep -q "Up"; then \
		$(COMPOSE) exec $$TTY_FLAG $(SERVICE) npm run $(SCRIPT); \
	else \
		echo "$(RED)Error: $(SERVICE) container not running and local dependencies not found$(NC)"; \
		echo "$(YELLOW)Run 'make up' to start containers, or 'cd $(DIR) && npm install' for local testing$(NC)"; \
		exit 1; \
	fi

_run-e2e:
	@if [ -d "e2e/node_modules" ]; then \
		cd e2e && npm run $(SCRIPT); \
	else \
		echo "$(YELLOW)Installing E2E dependencies...$(NC)"; \
		cd e2e && npm install && npm run $(SCRIPT); \
	fi

_test-scope:
	@set -e; \
	TARGET_SCOPE="$(SCOPE)"; \
	TARGET_MODE="$(MODE)"; \
	if [ -z "$$TARGET_SCOPE" ]; then \
		echo "$(RED)Error: SCOPE is required$(NC)"; \
		exit 1; \
	fi; \
	if [ -z "$$TARGET_MODE" ]; then \
		TARGET_MODE="default"; \
	fi; \
	case "$$TARGET_SCOPE" in \
		backend) \
			case "$$TARGET_MODE" in \
				default) \
					echo "$(GREEN)Running backend tests...$(NC)"; \
					$(MAKE) --no-print-directory _run-node DIR=backend SCRIPT=test SERVICE=backend; \
					echo "$(GREEN)✓ Backend tests completed$(NC)"; \
					;; \
				watch) \
					echo "$(GREEN)Starting backend tests in watch mode...$(NC)"; \
					$(MAKE) --no-print-directory _run-node DIR=backend SCRIPT=test:watch SERVICE=backend TTY=1; \
					;; \
				cov) \
					echo "$(GREEN)Running backend tests with coverage...$(NC)"; \
					$(MAKE) --no-print-directory _run-node DIR=backend SCRIPT=test:cov SERVICE=backend; \
					echo "$(GREEN)✓ Backend coverage report: backend/coverage/index.html$(NC)"; \
					;; \
				ui) \
					echo "$(GREEN)Opening backend test UI...$(NC)"; \
					$(MAKE) --no-print-directory _run-node DIR=backend SCRIPT=test:ui SERVICE=backend TTY=1; \
					;; \
				smoke) \
					echo "$(YELLOW)Smoke mode is not available for backend tests$(NC)"; \
					exit 1; \
					;; \
				*) \
					echo "$(RED)Unknown MODE '$$TARGET_MODE' for backend$(NC)"; \
					exit 1; \
					;; \
			esac; \
			;; \
		frontend) \
			case "$$TARGET_MODE" in \
				default) \
					echo "$(GREEN)Running frontend tests...$(NC)"; \
					$(MAKE) --no-print-directory _run-node DIR=frontend SCRIPT=test SERVICE=frontend; \
					echo "$(GREEN)✓ Frontend tests completed$(NC)"; \
					;; \
				watch) \
					echo "$(GREEN)Starting frontend tests in watch mode...$(NC)"; \
					$(MAKE) --no-print-directory _run-node DIR=frontend SCRIPT=test:watch SERVICE=frontend TTY=1; \
					;; \
				cov) \
					echo "$(GREEN)Running frontend tests with coverage...$(NC)"; \
					$(MAKE) --no-print-directory _run-node DIR=frontend SCRIPT=test:cov SERVICE=frontend; \
					echo "$(GREEN)✓ Frontend coverage report: frontend/coverage/index.html$(NC)"; \
					;; \
				ui) \
					echo "$(GREEN)Opening frontend test UI...$(NC)"; \
					$(MAKE) --no-print-directory _run-node DIR=frontend SCRIPT=test:ui SERVICE=frontend TTY=1; \
					;; \
				smoke) \
					echo "$(YELLOW)Smoke mode is not available for frontend tests$(NC)"; \
					exit 1; \
					;; \
				*) \
					echo "$(RED)Unknown MODE '$$TARGET_MODE' for frontend$(NC)"; \
					exit 1; \
					;; \
			esac; \
			;; \
		e2e) \
			case "$$TARGET_MODE" in \
				default) \
					echo "$(GREEN)Running E2E tests...$(NC)"; \
					$(MAKE) --no-print-directory _run-e2e SCRIPT=test; \
					echo "$(GREEN)✓ E2E tests completed$(NC)"; \
					;; \
				ui) \
					echo "$(GREEN)Opening Playwright UI...$(NC)"; \
					$(MAKE) --no-print-directory _run-e2e SCRIPT=test:ui; \
					;; \
				smoke) \
					echo "$(GREEN)Running smoke tests...$(NC)"; \
					$(MAKE) --no-print-directory _run-e2e SCRIPT=test:smoke; \
					echo "$(GREEN)✓ Smoke tests completed$(NC)"; \
					;; \
				watch|cov) \
					echo "$(YELLOW)Mode '$$TARGET_MODE' is not supported for E2E tests$(NC)"; \
					exit 1; \
					;; \
				*) \
					echo "$(RED)Unknown MODE '$$TARGET_MODE' for e2e$(NC)"; \
					exit 1; \
					;; \
			esac; \
			;; \
		*) \
			echo "$(RED)Unknown SCOPE '$$TARGET_SCOPE'$(NC)"; \
			exit 1; \
			;; \
	esac