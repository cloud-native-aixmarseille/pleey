# Makefile for QuizMaster
# Using Docker Compose V2

.PHONY: help install setup build up down restart logs ps rebuild shell setup-traefik migrate seed openapi linter-fix test test-install

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

# ==========================================
# Manage stack
# ==========================================

install: setup setup-traefik build up migrate seed openapi ## Complete installation (first time)
	@echo "$(GREEN)═══════════════════════════════════════$(NC)"
	@echo "$(GREEN)✓ Installation completed successfully!$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════$(NC)"
	@echo ""
	@echo "Application available at:"
	@echo "  Frontend: $(YELLOW)http://quiz-app.localhost$(NC)"
	@echo "  Backend:  $(YELLOW)http://quiz-app.localhost/api$(NC)"
	@echo "  Traefik dashboard: $(YELLOW)http://traefik.localhost$(NC) (managed by setup-traefik)"
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
	@if [ "$(TTY)" = "1" ]; then \
		TTY_FLAG=""; \
	fi;
	@echo "$(GREEN)Starting application...$(NC)"
	$(COMPOSE) up -d
	@echo "$(GREEN)Backend API ready$(NC)"
	@echo "$(GREEN)✓ Application started$(NC)"

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

ps: ## Display container status
	$(COMPOSE) ps

rebuild: down build up ## Rebuild and restart

shell: ## Open a service shell (set SERVICE=<name>)
	@if [ -z "$(SERVICE)" ]; then \
		echo "$(YELLOW)Usage: make shell SERVICE=backend$(NC)"; \
		exit 1; \
	fi
	$(COMPOSE) exec $(SERVICE) sh

shell-%: ## Shortcut to open a specific service shell (e.g. make shell-backend)
	@$(MAKE) --no-print-directory shell SERVICE=$*

# ==========================================
# Network
# ==========================================

setup-traefik: ## Setup traefik
	@TRAEFIK_NETWORK=traefik-proxy; \
	TRAEFIK_NAME=traefik-local; \
	docker network ls | grep $$TRAEFIK_NETWORK > /dev/null || (echo "Creating traefik network" && docker network create $$TRAEFIK_NETWORK ); \
	if docker ps -a | grep $$TRAEFIK_NAME > /dev/null; then \
		echo "Traefik container already exists"; \
		if docker ps -a | grep $$TRAEFIK_NAME | grep Exited > /dev/null; then echo "Starting traefik container" && docker start $$TRAEFIK_NAME; fi; \
		if ! docker inspect -f '{{json .NetworkSettings.Networks}}' $$TRAEFIK_NAME | grep -q '"'$$TRAEFIK_NETWORK'"'; then \
			echo "Traefik container is not connected to '$$TRAEFIK_NETWORK' network" && exit 1; \
		fi; \
	else \
		echo "Creating traefik container" \
		&& docker pull traefik \
		&& docker run -itd \
			-p 80:80 -p 8080:8080 \
			-v /var/run/docker.sock:/var/run/docker.sock:ro \
			--restart unless-stopped --name $$TRAEFIK_NAME --network=$$TRAEFIK_NETWORK \
			--label "traefik.enable=true" --label "traefik.http.routers.traefik.rule=Host(\`traefik.localhost\`)" --label "traefik.http.routers.traefik.service=api@internal" \
			traefik \
			--api.insecure=true --providers.docker.exposedByDefault=false --providers.docker.network=$$TRAEFIK_NETWORK --accessLog=true; \
	fi

traefik: ## Open Traefik dashboard
	@echo "$(GREEN)Opening Traefik dashboard...$(NC)"
	@command -v xdg-open >/dev/null 2>&1 && xdg-open http://traefik.localhost || open http://traefik.localhost || echo "Open http://traefik.localhost"

health: ## Check application health
	@echo "$(GREEN)Checking status...$(NC)"
	@curl -s http://quiz-app.localhost/api/health/live | jq '.' || echo "$(YELLOW)Backend unavailable$(NC)"
	@curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://quiz-app.localhost/

# ==========================================
# Database
# ==========================================

migrate: ## Apply database migrations
	@echo "$(GREEN)Applying database migrations...$(NC)"
	@$(COMPOSE) exec -T backend npm run db:migrate
	@$(COMPOSE) exec -T backend npm run db:generate
	@echo "$(GREEN)✓ Migrations applied$(NC)"

seed: ## Seed the database
	@echo "$(GREEN)Seeding database...$(NC)"
	@$(COMPOSE) exec -T backend npm run db:seed
	@echo "$(GREEN)✓ Database seeded$(NC)"

db-shell: ## Access PostgreSQL database shell
	$(COMPOSE) exec postgres psql -U ${POSTGRES_USER:-quizapp} -d ${POSTGRES_DB:-quizdb}

# ==========================================
# Backend
# ==========================================

openapi: ## Generate OpenAPI types
	@echo "$(GREEN)Waiting for backend OpenAPI endpoint...$(NC)"
	@ATTEMPTS=0; \
	sleep 1; \
	until $(COMPOSE) exec -T frontend sh -c "curl -sf http://backend:3001/api/openapi.json >/dev/null"; do \
		ATTEMPTS=$$((ATTEMPTS+1)); \
		if [ $$ATTEMPTS -gt 30 ]; then \
			echo "$(RED)Backend API did not become ready in time$(NC)"; \
			exit 1; \
		fi; \
		echo "$(YELLOW)Waiting for backend API (attempt $$ATTEMPTS)...$(NC)"; \
		sleep 2; \
	done
	@echo "$(GREEN)Generating OpenAPI documentation...$(NC)"
	@$(COMPOSE) exec -T frontend npm run openapi:generate
	@echo "$(GREEN)✓ OpenAPI documentation generated$(NC)"

# ==========================================
# Linting Commands
# ==========================================

ci: ## Prepare for CI
	$(MAKE) lint-fix
	$(MAKE) test

lint: ## Execute linting
	@$(COMPOSE) exec -T backend npm run lint
	@$(COMPOSE) exec -T frontend npm run lint
	@if command -v ct >/dev/null 2>&1; then \
		if command -v yamale >/dev/null 2>&1; then ct lint; else echo "$(YELLOW)yamale not installed; skipping chart lint$(NC)"; fi; \
	else \
		echo "$(YELLOW)ct not installed; skipping chart lint$(NC)"; \
	fi
	$(call run_linter, )

lint-fix: ## Execute linting and fix (alias for linter-fix)
	@$(COMPOSE) exec -T backend npm run lint:fix
	@$(COMPOSE) exec -T frontend npm run lint:fix
	@if command -v helm-docs >/dev/null 2>&1; then helm-docs; else echo "$(YELLOW)helm-docs not installed; skipping helm docs generation$(NC)"; fi
	@if command -v ct >/dev/null 2>&1; then \
		if command -v yamale >/dev/null 2>&1; then ct lint; else echo "$(YELLOW)yamale not installed; skipping chart lint$(NC)"; fi; \
	else \
		echo "$(YELLOW)ct not installed; skipping chart lint$(NC)"; \
	fi
	@$(MAKE) linter-fix

linter-fix: ## Execute linting and fix
	$(call run_linter, \
		-e FIX_MARKDOWN=true \
		-e FIX_PRETTIER=true \
		-e FIX_YAML_PRETTIER=true \
		-e FIX_CSS_PRETTIER=true \
		-e FIX_HTML_PRETTIER=true \
		-e FIX_JSON_PRETTIER=true \
		-e FIX_MARKDOWN_PRETTIER=true \
		-e FIX_NATURAL_LANGUAGE=true \
		-e FIX_SHELL_SHFMT=true \
	)

define run_linter
	DEFAULT_WORKSPACE="$(CURDIR)"; \
	LINTER_IMAGE="linter:latest"; \
	VOLUME="$$DEFAULT_WORKSPACE:$$DEFAULT_WORKSPACE"; \
	docker build --build-arg UID=$(shell id -u) --build-arg GID=$(shell id -g) --tag $$LINTER_IMAGE .; \
	docker run \
		-e DEFAULT_WORKSPACE="$$DEFAULT_WORKSPACE" \
		-e FILTER_REGEX_INCLUDE="$(filter-out $@,$(MAKECMDGOALS))" \
		-e IGNORE_GITIGNORED_FILES=true \
		-e VALIDATE_TSX=false \
		-e VALIDATE_JSX_PRETTIER=false \
		-e VALIDATE_JAVASCRIPT_PRETTIER=false \
		-e VALIDATE_TYPESCRIPT_PRETTIER=false \
		-e VALIDATE_TYPESCRIPT_ES=false \
		$(1) \
		-v $$VOLUME \
		--rm \
		$$LINTER_IMAGE
endef

# ==========================================
# Testing Commands
# ==========================================

test: ## Run tests (SCOPE=all|backend|frontend|e2e, MODE=default|watch|ci|ui|smoke)
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
			ci) \
				echo "$(GREEN)Running tests like CI...$(NC)"; \
				$(MAKE) --no-print-directory _test-scope SCOPE=backend MODE=ci; \
				echo ""; \
				$(MAKE) --no-print-directory _test-scope SCOPE=frontend MODE=ci; \
				echo "$(GREEN)✓ CI test runs completed$(NC)"; \
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

test-%-ci: ## Run test like CI for a scope (e.g. make test-frontend-ci)
	@$(MAKE) --no-print-directory test-$* MODE=ci

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

test-ci: ## Run backend and frontend tests like CI (alias for make test MODE=ci)
	@$(MAKE) --no-print-directory test MODE=ci

test-install: ## Install test dependencies for all projects
	@echo "$(GREEN)Installing test dependencies...$(NC)"
	@cd application/backend && npm install
	@cd application/frontend && npm install
	@cd e2e && npm install
	@echo "$(GREEN)✓ Test dependencies installed$(NC)"

e2e-report: ## Serve Playwright HTML report at http://localhost:9323
	@echo "$(GREEN)Serving Playwright report at $(YELLOW)http://localhost:9323$(GREEN) (Ctrl+C to stop)$(NC)";
	@$(COMPOSE) run --rm --service-ports -T e2e-tests bash -lc "npm ci --no-audit --fund=false && npm run report"

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
	@SCRIPT_NAME="$(SCRIPT)"; \
	if [ -z "$$SCRIPT_NAME" ]; then SCRIPT_NAME="test"; fi; \
	case "$$SCRIPT_NAME" in \
		"test") MODE_ARG="all" ;; \
		"test:smoke") MODE_ARG="smoke" ;; \
		"test:ui") MODE_ARG="ui" ;; \
		"test:debug") MODE_ARG="debug" ;; \
		"test:headed") MODE_ARG="headed" ;; \
		*) echo "$(RED)Unknown E2E script '$$SCRIPT_NAME'$(NC)"; exit 1 ;; \
	esac; \
	echo "$(GREEN)Running E2E tests via docker compose ($(YELLOW)$$MODE_ARG$(GREEN))...$(NC)"; \
	./scripts/test-runner.sh e2e "$$MODE_ARG"

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
					$(MAKE) --no-print-directory _run-node DIR=application/backend SCRIPT=test SERVICE=backend; \
					echo "$(GREEN)✓ Backend tests completed$(NC)"; \
					;; \
				watch) \
					echo "$(GREEN)Starting backend tests in watch mode...$(NC)"; \
					$(MAKE) --no-print-directory _run-node DIR=application/backend SCRIPT=test:watch SERVICE=backend TTY=1; \
					;; \
				ci) \
					echo "$(GREEN)Running backend tests like CI...$(NC)"; \
					$(MAKE) --no-print-directory _run-node DIR=application/backend SCRIPT=test:ci SERVICE=backend; \
					echo "$(GREEN)✓ Backend CI test runs completed$(NC)"; \
					;; \
				ui) \
					echo "$(GREEN)Opening backend test UI...$(NC)"; \
					$(MAKE) --no-print-directory _run-node DIR=application/backend SCRIPT=test:ui SERVICE=backend TTY=1; \
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
					$(MAKE) --no-print-directory _run-node DIR=application/frontend SCRIPT=test SERVICE=frontend; \
					echo "$(GREEN)✓ Frontend tests completed$(NC)"; \
					;; \
				watch) \
					echo "$(GREEN)Starting frontend tests in watch mode...$(NC)"; \
					$(MAKE) --no-print-directory _run-node DIR=application/frontend SCRIPT=test:watch SERVICE=frontend TTY=1; \
					;; \
				ci) \
					echo "$(GREEN)Running frontend tests like CI...$(NC)"; \
					$(MAKE) --no-print-directory _run-node DIR=application/frontend SCRIPT=test:ci SERVICE=frontend; \
					echo "$(GREEN)✓ Frontend CI test runs completed$(NC)"; \
					;; \
				ui) \
					echo "$(GREEN)Opening frontend test UI...$(NC)"; \
					$(MAKE) --no-print-directory _run-node DIR=application/frontend SCRIPT=test:ui SERVICE=frontend TTY=1; \
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