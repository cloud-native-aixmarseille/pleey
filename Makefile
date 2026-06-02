# Makefile for Pleey
# Using Docker Compose V2

.PHONY: help setup build up down restart logs ps rebuild shell setup-traefik traefik health migrate seed db-shell graphql-types ci lint lint-fix linter-fix test test-watch test-ui test-ci test-chart test-install e2e-report

# Docker Compose command (V2)
COMPOSE := docker compose
APP_EXEC := $(COMPOSE) exec -T
APP_START_WAIT_TIMEOUT ?= 180

CHART_TEST_CT_CONFIG ?= ct.yaml
CHART_TEST_NAMESPACE_PREFIX ?= test-chart
CHART_TEST_KEEP_KIND ?= 0
CHART_TEST_BACKEND_IMAGE_REPOSITORY ?= pleey-backend-chart-test
CHART_TEST_BACKEND_IMAGE_TAG ?= chart-test
CHART_TEST_FRONTEND_IMAGE_REPOSITORY ?= pleey-frontend-chart-test
CHART_TEST_FRONTEND_IMAGE_TAG ?= chart-test

# Colors for display
GREEN=\033[0;32m
YELLOW=\033[1;33m
RED=\033[0;31m
NC=\033[0m # No Color

define run_node_scope_mode
	@set -e; \
	case "$(MODE)" in \
		default) \
			echo "$(GREEN)Running $(1) tests...$(NC)"; \
			$(MAKE) --no-print-directory _run-node DIR=$(2) SCRIPT=test SERVICE=$(3); \
			echo "$(GREEN)✓ $(1) tests completed$(NC)"; \
			;; \
		watch) \
			echo "$(GREEN)Starting $(1) tests in watch mode...$(NC)"; \
			$(MAKE) --no-print-directory _run-node DIR=$(2) SCRIPT=test:watch SERVICE=$(3) TTY=1; \
			;; \
		ci) \
			echo "$(GREEN)Running $(1) tests like CI...$(NC)"; \
			$(MAKE) --no-print-directory _run-node DIR=$(2) SCRIPT=test:ci SERVICE=$(3); \
			echo "$(GREEN)✓ $(1) CI test runs completed$(NC)"; \
			;; \
		ui) \
			echo "$(GREEN)Opening $(1) test UI...$(NC)"; \
			$(MAKE) --no-print-directory _run-node DIR=$(2) SCRIPT=test:ui SERVICE=$(3) TTY=1; \
			;; \
		smoke) \
			echo "$(YELLOW)Smoke mode is not available for $(4) tests$(NC)"; \
			exit 1; \
			;; \
		*) \
			echo "$(RED)Unknown MODE '$(MODE)' for $(4)$(NC)"; \
			exit 1; \
			;; \
	esac
endef

define run_e2e_scope_mode
	@set -e; \
	case "$(MODE)" in \
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
			echo "$(YELLOW)Mode '$(MODE)' is not supported for E2E tests$(NC)"; \
			exit 1; \
			;; \
		*) \
			echo "$(RED)Unknown MODE '$(MODE)' for e2e$(NC)"; \
			exit 1; \
			;; \
	esac
endef

help: ## Display this help
	@echo "$(GREEN)Pleey - Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

# ==========================================
# Manage stack
# ==========================================

setup: setup-traefik build up migrate seed graphql-types ## Prepare stack to run
	@echo "$(GREEN)═══════════════════════════════════════$(NC)"
	@echo "$(GREEN)✓ Installation completed successfully!$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════$(NC)"
	@echo ""
	@echo "Application available at:"
	@echo "  Frontend: $(YELLOW)http://pleey.localhost$(NC)"
	@echo "  Backend:  $(YELLOW)http://pleey.localhost/api$(NC)"
	@echo "  Traefik dashboard: $(YELLOW)http://traefik.localhost$(NC) (managed by setup-traefik)"
	@echo ""
	@echo "Default admin account:"
	@echo "  Email:    $(YELLOW)admin@pleey.com$(NC)"
	@echo "  Password: $(YELLOW)admin123$(NC)"
	@echo ""
	@echo "Test player account:"
	@echo "  Email:    $(YELLOW)player@pleey.com$(NC)"
	@echo "  Password: $(YELLOW)player123$(NC)"
	@echo ""


build: ## Build Docker images
	@echo "$(GREEN)Building images...$(NC)"
	$(COMPOSE) build

up: ## Start the application
	@echo "$(GREEN)Starting application...$(NC)"
	$(COMPOSE) up -d --force-recreate --wait --wait-timeout $(APP_START_WAIT_TIMEOUT)
	@echo "$(GREEN)Backend API ready$(NC)"
	@echo "$(GREEN)Frontend ready$(NC)"
	@echo "$(GREEN)✓ Application started$(NC)"

down: ## Stop the application
	@echo "$(YELLOW)Stopping application...$(NC)"
	$(COMPOSE) down $(filter-out $@,$(MAKECMDGOALS))
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
	@curl -s http://pleey.localhost/ready | jq '.' || echo "$(YELLOW)Backend unavailable$(NC)"
	@curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://pleey.localhost/

# ==========================================
# Database
# ==========================================

migrate: ## Apply database migrations
	@echo "$(GREEN)Applying database migrations...$(NC)"
	@$(APP_EXEC) backend npm run db:migrate
	@$(APP_EXEC) backend npm run db:generate
	@echo "$(GREEN)✓ Migrations applied$(NC)"

seed: ## Seed the database
	@echo "$(GREEN)Seeding database...$(NC)"
	@$(APP_EXEC) backend npm run db:seed
	@echo "$(GREEN)✓ Database seeded$(NC)"

db-shell: ## Access PostgreSQL database shell
	$(COMPOSE) exec postgres psql -U pleeyapp -d pleeydb

# ==========================================
# Backend
# ==========================================

graphql-types: ## Generate GraphQL types
	@echo "$(GREEN)Generating GraphQL types...$(NC)"
	@$(APP_EXEC) frontend npm run graphql:codegen
	@echo "$(GREEN)✓ GraphQL types generated$(NC)"

# ==========================================
# Linting Commands
# ==========================================

ci: ## Prepare for CI
	$(MAKE) lint-fix
	$(MAKE) test

lint: ## Execute linting
	@$(APP_EXEC) backend npm run lint
	@$(APP_EXEC) frontend npm run lint
	$(call run_linter, )

lint-fix: ## Execute linting and fix (alias for linter-fix)
	@$(APP_EXEC) backend npm run lint:fix
	@$(APP_EXEC) frontend npm run lint:fix
	@if command -v helm-docs >/dev/null 2>&1; then helm-docs; else echo "$(YELLOW)helm-docs not installed; skipping helm docs generation$(NC)"; fi
	@$(MAKE) linter-fix

linter-fix: ## Execute linting and fix
	$(call run_linter, \
		-e FIX_MARKDOWN=true \
		-e FIX_PRETTIER=true \
		-e FIX_YAML_PRETTIER=true \
		-e FIX_CSS_PRETTIER=true \
		-e FIX_HTML_PRETTIER=true \
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
		-e VALIDATE_GRAPHQL_PRETTIER=false \
		-e VALIDATE_JSON_PRETTIER=false \
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

test-chart: ## Run Helm chart lint+install like CI, building app images locally first
	@set -eu; \
	for command in ct helm kind kubectl docker yamale; do \
		if ! command -v "$$command" >/dev/null 2>&1; then \
			echo "$(RED)Error: '$$command' is required for chart CI tests$(NC)"; \
			exit 1; \
		fi; \
	done; \
	CT_ARGS=""; \
	TARGET_BRANCH="$(CHART_TARGET_BRANCH)"; \
	if [ -z "$$TARGET_BRANCH" ]; then \
		TARGET_BRANCH="$$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null | sed 's@^origin/@@')"; \
	fi; \
	if [ -z "$$TARGET_BRANCH" ]; then \
		TARGET_BRANCH="main"; \
	fi; \
	if [ -n "$$TARGET_BRANCH" ]; then \
		CT_ARGS="$$CT_ARGS --target-branch $$TARGET_BRANCH"; \
	fi; \
	if [ -f "$(CHART_TEST_CT_CONFIG)" ]; then \
		CT_ARGS="$$CT_ARGS --config $(CHART_TEST_CT_CONFIG)"; \
	fi; \
	if [ -z "$$CT_ARGS" ]; then \
		CT_ARGS="$$CT_ARGS --all"; \
	fi; \
	KIND_CLUSTER="chart-testing-$$(date +%s)"; \
	NAMESPACE="$(CHART_TEST_NAMESPACE_PREFIX)-$$(date +%s)"; \
	BACKEND_IMAGE="$(CHART_TEST_BACKEND_IMAGE_REPOSITORY):$(CHART_TEST_BACKEND_IMAGE_TAG)"; \
	FRONTEND_IMAGE="$(CHART_TEST_FRONTEND_IMAGE_REPOSITORY):$(CHART_TEST_FRONTEND_IMAGE_TAG)"; \
	HELM_SET_ARGS="backend.image.repository=$(CHART_TEST_BACKEND_IMAGE_REPOSITORY),backend.image.tag=$(CHART_TEST_BACKEND_IMAGE_TAG),backend.image.digest=,backend.image.pullPolicy=IfNotPresent,backend.cloudnativepgOperator.enabled=true,frontend.image.repository=$(CHART_TEST_FRONTEND_IMAGE_REPOSITORY),frontend.image.tag=$(CHART_TEST_FRONTEND_IMAGE_TAG),frontend.image.digest=,frontend.image.pullPolicy=IfNotPresent"; \
	trap 'exit_code=$$?; if [ "$(CHART_TEST_KEEP_KIND)" != "1" ]; then echo "$(YELLOW)Deleting Kind cluster $$KIND_CLUSTER...$(NC)"; kind delete cluster --name "$$KIND_CLUSTER" >/dev/null 2>&1 || true; else echo "$(YELLOW)Keeping Kind cluster $$KIND_CLUSTER for debugging$(NC)"; fi; exit $$exit_code' EXIT; \
	echo "$(GREEN)Building backend image $$BACKEND_IMAGE...$(NC)"; \
	DOCKER_BUILDKIT=1 docker build --target prod --file application/backend/Dockerfile --tag "$$BACKEND_IMAGE" .; \
	echo "$(GREEN)Building frontend image $$FRONTEND_IMAGE...$(NC)"; \
	DOCKER_BUILDKIT=1 docker build --target prod --file application/frontend/Dockerfile --tag "$$FRONTEND_IMAGE" .; \
	echo "$(GREEN)Adding Helm repositories...$(NC)"; \
	helm repo add cloudnative-pg https://cloudnative-pg.github.io/charts --force-update >/dev/null; \
	echo "$(GREEN)Running chart lint...$(NC)"; \
	set -- $$CT_ARGS; \
	ct lint "$$@"; \
	echo "$(GREEN)Creating Kind cluster '$$KIND_CLUSTER'...$(NC)"; \
	kind create cluster --name "$$KIND_CLUSTER" >/dev/null; \
	kind load docker-image --name "$$KIND_CLUSTER" "$$BACKEND_IMAGE" "$$FRONTEND_IMAGE" >/dev/null; \
	kubectl config use-context "kind-$$KIND_CLUSTER" >/dev/null; \
	kubectl create namespace "$$NAMESPACE" >/dev/null; \
	echo "$(GREEN)Running chart install test...$(NC)"; \
	set -- $$CT_ARGS; \
	HELM_EXPERIMENTAL_OCI=true ct install "$$@" --namespace "$$NAMESPACE" --helm-extra-set-args "--set=$$HELM_SET_ARGS"; \
	echo "$(GREEN)✓ Chart CI test flow completed$(NC)"

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
			$(MAKE) --no-print-directory _run-node-scope LABEL=Backend DIR=application/backend SERVICE=backend MODE=$$TARGET_MODE SCOPE_NAME=backend; \
			;; \
		frontend) \
			$(MAKE) --no-print-directory _run-node-scope LABEL=Frontend DIR=application/frontend SERVICE=frontend MODE=$$TARGET_MODE SCOPE_NAME=frontend; \
			;; \
		e2e) \
			$(MAKE) --no-print-directory _run-e2e-scope MODE=$$TARGET_MODE; \
			;; \
		*) \
			echo "$(RED)Unknown SCOPE '$$TARGET_SCOPE'$(NC)"; \
			exit 1; \
			;; \
	esac

_run-node-scope:
	$(call run_node_scope_mode,$(LABEL),$(DIR),$(SERVICE),$(SCOPE_NAME))

_run-e2e-scope:
	$(call run_e2e_scope_mode)