# Makefile for QuizMaster

.PHONY: help build up down restart logs clean backup restore seed

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
	docker-compose build

up: ## Start the application
	@echo "$(GREEN)Starting application...$(NC)"
	docker-compose up -d	
	@echo "$(GREEN)✓ Application started$(NC)"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend: http://localhost:3001"

down: ## Stop the application
	@echo "$(YELLOW)Stopping application...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ Application stopped$(NC)"

restart: ## Restart the application
	@echo "$(YELLOW)Restarting...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✓ Application restarted$(NC)"

logs: ## Display logs in real-time
	docker-compose logs -f

logs-backend: ## Backend logs only
	docker-compose logs -f backend

logs-frontend: ## Frontend logs only
	docker-compose logs -f frontend

seed: ## Populate database with Prisma fixtures
	@echo "$(GREEN)Running Prisma seed...$(NC)"
	docker-compose exec -T backend npx prisma db seed
	@echo "$(GREEN)✓ Fixtures inserted$(NC)"

ps: ## Display container status
	docker-compose ps

rebuild: down build up ## Rebuild and restart

clean: ## Clean (without deleting data)
	@echo "$(YELLOW)Cleaning...$(NC)"
	docker-compose down
	docker system prune -f
	@echo "$(GREEN)✓ Cleaning completed$(NC)"

clean-all: ## Clean everything (including data volumes)
	@echo "$(YELLOW)⚠️  Deleting all data...$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		rm -rf backend/data; \
		echo "$(GREEN)✓ Everything deleted$(NC)"; \
	fi

backup: ## Backup the database
	@echo "$(GREEN)Creating backup...$(NC)"
	@mkdir -p backups
	@docker-compose exec -T backend cat /app/data/quiz.db > backups/quiz-backup-$$(date +%Y%m%d-%H%M%S).db
	@echo "$(GREEN)✓ Backup created in backups/$(NC)"

restore: ## Restore the latest backup
	@echo "$(YELLOW)Restoring latest backup...$(NC)"
	@LATEST=$$(ls -t backups/quiz-backup-*.db 2>/dev/null | head -1); \
	if [ -z "$$LATEST" ]; then \
		echo "$(YELLOW)No backup found$(NC)"; \
		exit 1; \
	fi; \
	docker cp $$LATEST quiz-backend:/app/data/quiz.db && \
	docker-compose restart backend && \
	echo "$(GREEN)✓ Backup restored: $$LATEST$(NC)"

shell-backend: ## Access backend shell
	docker-compose exec backend sh

shell-frontend: ## Access frontend shell
	docker-compose exec frontend sh

db: ## Access SQLite database
	docker-compose exec backend sh -c "cd data && sqlite3 quiz.db"

health: ## Check application health
	@echo "$(GREEN)Checking status...$(NC)"
	@curl -s http://localhost:3001/api/health | jq '.' || echo "$(YELLOW)Backend unavailable$(NC)"
	@curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost/

install: setup build up ## Complete installation (first time)
	@echo "$(GREEN)═══════════════════════════════════════$(NC)"
	@echo "$(GREEN)✓ Installation completed successfully!$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════$(NC)"
	@echo ""
	@echo "Application available at:"
	@echo "  Frontend: $(YELLOW)http://localhost:5173$(NC)"
	@echo "  Backend:  $(YELLOW)http://localhost:3001$(NC)"
	@echo ""
	@echo "Default admin account:"
	@echo "  Email:    $(YELLOW)admin@quiz.com$(NC)"
	@echo "  Password: $(YELLOW)admin123$(NC)"
	@echo ""
	@echo "$(YELLOW)⚠️  Don't forget to change JWT_SECRET in .env !$(NC)"

dev: ## Development mode (real-time logs)
	docker-compose up

prod: build up ## Production deployment
	@echo "$(GREEN)✓ Deployed to production$(NC)"

update: ## Update the application
	@echo "$(GREEN)Updating...$(NC)"
	git pull
	$(MAKE) rebuild
	@echo "$(GREEN)✓ Update completed$(NC)"

monitoring-up: ## Start with monitoring
	@echo "$(GREEN)Starting with monitoring...$(NC)"
	docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
	@echo "$(GREEN)✓ Monitoring enabled$(NC)"
	@echo "Grafana: http://localhost:3000 (admin/admin123)"
	@echo "Prometheus: http://localhost:9090"

monitoring-down: ## Stop monitoring
	docker-compose -f docker-compose.monitoring.yml down

monitoring-logs: ## Monitoring logs
	docker-compose -f docker-compose.monitoring.yml logs -f

grafana: ## Open Grafana
	@echo "$(GREEN)Opening Grafana...$(NC)"
	@command -v xdg-open >/dev/null 2>&1 && xdg-open http://localhost:3000 || open http://localhost:3000 || echo "Open http://localhost:3000"

prometheus: ## Open Prometheus
	@echo "$(GREEN)Opening Prometheus...$(NC)"
	@command -v xdg-open >/dev/null 2>&1 && xdg-open http://localhost:9090 || open http://localhost:9090 || echo "Open http://localhost:9090"