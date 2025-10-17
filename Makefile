# Makefile pour QuizMaster

.PHONY: help build up down restart logs clean backup restore

# Couleurs pour l'affichage
GREEN=\033[0;32m
YELLOW=\033[1;33m
NC=\033[0m # No Color

help: ## Afficher cette aide
	@echo "$(GREEN)QuizMaster - Commandes disponibles:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

setup: ## Configuration initiale (première installation)
	@echo "$(GREEN)Configuration de l'environnement...$(NC)"
	@cp -n .env.example .env || true
	@echo "$(YELLOW)⚠️  N'oubliez pas de modifier le JWT_SECRET dans .env$(NC)"
	@mkdir -p backend/data

build: ## Construire les images Docker
	@echo "$(GREEN)Construction des images...$(NC)"
	docker-compose build

up: ## Démarrer l'application
	@echo "$(GREEN)Démarrage de l'application...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Application démarrée$(NC)"
	@echo "Frontend: http://localhost"
	@echo "Backend: http://localhost:3001"

down: ## Arrêter l'application
	@echo "$(YELLOW)Arrêt de l'application...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ Application arrêtée$(NC)"

restart: ## Redémarrer l'application
	@echo "$(YELLOW)Redémarrage...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✓ Application redémarrée$(NC)"

logs: ## Afficher les logs en temps réel
	docker-compose logs -f

logs-backend: ## Logs du backend uniquement
	docker-compose logs -f backend

logs-frontend: ## Logs du frontend uniquement
	docker-compose logs -f frontend

ps: ## Afficher le status des conteneurs
	docker-compose ps

rebuild: down build up ## Reconstruire et redémarrer

clean: ## Nettoyer (sans supprimer les données)
	@echo "$(YELLOW)Nettoyage...$(NC)"
	docker-compose down
	docker system prune -f
	@echo "$(GREEN)✓ Nettoyage terminé$(NC)"

clean-all: ## Nettoyer tout (y compris les volumes de données)
	@echo "$(YELLOW)⚠️  Suppression de toutes les données...$(NC)"
	@read -p "Êtes-vous sûr? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		rm -rf backend/data; \
		echo "$(GREEN)✓ Tout a été supprimé$(NC)"; \
	fi

backup: ## Sauvegarder la base de données
	@echo "$(GREEN)Création du backup...$(NC)"
	@mkdir -p backups
	@docker-compose exec -T backend cat /app/data/quiz.db > backups/quiz-backup-$$(date +%Y%m%d-%H%M%S).db
	@echo "$(GREEN)✓ Backup créé dans backups/$(NC)"

restore: ## Restaurer la dernière sauvegarde
	@echo "$(YELLOW)Restauration du dernier backup...$(NC)"
	@LATEST=$$(ls -t backups/quiz-backup-*.db 2>/dev/null | head -1); \
	if [ -z "$$LATEST" ]; then \
		echo "$(YELLOW)Aucun backup trouvé$(NC)"; \
		exit 1; \
	fi; \
	docker cp $$LATEST quiz-backend:/app/data/quiz.db && \
	docker-compose restart backend && \
	echo "$(GREEN)✓ Backup restauré: $$LATEST$(NC)"

shell-backend: ## Accéder au shell du backend
	docker-compose exec backend sh

shell-frontend: ## Accéder au shell du frontend
	docker-compose exec frontend sh

db: ## Accéder à la base de données SQLite
	docker-compose exec backend sh -c "cd data && sqlite3 quiz.db"

health: ## Vérifier la santé de l'application
	@echo "$(GREEN)Vérification de l'état...$(NC)"
	@curl -s http://localhost:3001/api/health | jq '.' || echo "$(YELLOW)Backend non disponible$(NC)"
	@curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost/

install: setup build up ## Installation complète (première fois)
	@echo "$(GREEN)═══════════════════════════════════════$(NC)"
	@echo "$(GREEN)✓ Installation terminée avec succès!$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════$(NC)"
	@echo ""
	@echo "Application disponible sur:"
	@echo "  Frontend: $(YELLOW)http://localhost$(NC)"
	@echo "  Backend:  $(YELLOW)http://localhost:3001$(NC)"
	@echo ""
	@echo "Compte admin par défaut:"
	@echo "  Email:    $(YELLOW)admin@quiz.com$(NC)"
	@echo "  Password: $(YELLOW)admin123$(NC)"
	@echo ""
	@echo "$(YELLOW)⚠️  N'oubliez pas de changer le JWT_SECRET dans .env !$(NC)"

dev: ## Mode développement (logs en temps réel)
	docker-compose up

prod: build up ## Déploiement production
	@echo "$(GREEN)✓ Déployé en production$(NC)"

update: ## Mettre à jour l'application
	@echo "$(GREEN)Mise à jour...$(NC)"
	git pull
	$(MAKE) rebuild
	@echo "$(GREEN)✓ Mise à jour terminée$(NC)"

monitoring-up: ## Démarrer avec monitoring
	@echo "$(GREEN)Démarrage avec monitoring...$(NC)"
	docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
	@echo "$(GREEN)✓ Monitoring activé$(NC)"
	@echo "Grafana: http://localhost:3000 (admin/admin123)"
	@echo "Prometheus: http://localhost:9090"

monitoring-down: ## Arrêter le monitoring
	docker-compose -f docker-compose.monitoring.yml down

monitoring-logs: ## Logs du monitoring
	docker-compose -f docker-compose.monitoring.yml logs -f

grafana: ## Ouvrir Grafana
	@echo "$(GREEN)Ouverture de Grafana...$(NC)"
	@command -v xdg-open >/dev/null 2>&1 && xdg-open http://localhost:3000 || open http://localhost:3000 || echo "Ouvrez http://localhost:3000"

prometheus: ## Ouvrir Prometheus
	@echo "$(GREEN)Ouverture de Prometheus...$(NC)"
	@command -v xdg-open >/dev/null 2>&1 && xdg-open http://localhost:9090 || open http://localhost:9090 || echo "Ouvrez http://localhost:9090"