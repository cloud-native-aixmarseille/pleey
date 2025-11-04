# Makefile for QuizMaster
# Using Docker Compose V2

.PHONY: help build up down restart logs clean backup restore seed docs

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