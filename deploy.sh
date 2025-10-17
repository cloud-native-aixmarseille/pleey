#!/bin/bash

# Script de déploiement automatisé pour QuizMaster
# Usage: ./deploy.sh [dev|prod]

set -e  # Arrêter en cas d'erreur

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
ENVIRONMENT=${1:-dev}
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Fonctions
print_step() {
    echo -e "${BLUE}==>${NC} ${GREEN}$1${NC}"
}

print_error() {
    echo -e "${RED}❌ Erreur: $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Vérifier Docker
check_docker() {
    print_step "Vérification de Docker..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker n'est pas installé"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose n'est pas installé"
        exit 1
    fi
    
    print_success "Docker OK"
}

# Vérifier les fichiers requis
check_files() {
    print_step "Vérification des fichiers..."
    
    if [ ! -f ".env" ]; then
        print_warning ".env non trouvé, création depuis .env.example"
        cp .env.example .env
        print_warning "⚠️  N'oubliez pas de modifier JWT_SECRET dans .env !"
        read -p "Appuyez sur Entrée pour continuer..."
    fi
    
    print_success "Fichiers OK"
}

# Backup de la base de données
backup_database() {
    print_step "Backup de la base de données..."
    
    mkdir -p "$BACKUP_DIR"
    
    if docker ps | grep -q quiz-backend; then
        docker-compose exec -T backend cat /app/data/quiz.db > "$BACKUP_DIR/quiz-backup-$TIMESTAMP.db" 2>/dev/null || true
        
        if [ -f "$BACKUP_DIR/quiz-backup-$TIMESTAMP.db" ]; then
            print_success "Backup créé: $BACKUP_DIR/quiz-backup-$TIMESTAMP.db"
        else
            print_warning "Pas de backup (base vide ou première installation)"
        fi
    else
        print_warning "Backend non démarré, backup ignoré"
    fi
}

# Déploiement en développement
deploy_dev() {
    print_step "🚀 Déploiement en mode DÉVELOPPEMENT"
    
    docker-compose down
    docker-compose build
    docker-compose up -d
    
    print_success "Application démarrée en mode développement"
}

# Déploiement en production
deploy_prod() {
    print_step "🚀 Déploiement en mode PRODUCTION"
    
    # Vérifier JWT_SECRET
    if grep -q "votre_secret_jwt" .env; then
        print_error "JWT_SECRET n'a pas été modifié dans .env !"
        print_warning "Générez un secret avec: openssl rand -base64 32"
        exit 1
    fi
    
    # Backup avant déploiement
    backup_database
    
    # Arrêter les services
    docker-compose -f docker-compose.prod.yml down
    
    # Build des images
    print_step "Construction des images..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    # Démarrage
    print_step "Démarrage des services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    print_success "Application démarrée en mode production"
}

# Vérifier la santé
check_health() {
    print_step "Vérification de l'état de l'application..."
    
    # Attendre que les services démarrent
    sleep 5
    
    # Vérifier backend
    if curl -sf http://localhost:3001/api/health > /dev/null; then
        print_success "Backend OK"
    else
        print_error "Backend non accessible"
        docker-compose logs backend
        exit 1
    fi
    
    # Vérifier frontend
    if curl -sf http://localhost > /dev/null; then
        print_success "Frontend OK"
    else
        print_error "Frontend non accessible"
        docker-compose logs frontend
        exit 1
    fi
}

# Afficher les informations
display_info() {
    echo ""
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ Déploiement terminé avec succès !${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo ""
    echo -e "🌐 URLs:"
    echo -e "   Frontend: ${YELLOW}http://localhost${NC}"
    echo -e "   Backend:  ${YELLOW}http://localhost:3001${NC}"
    echo ""
    echo -e "👤 Compte admin par défaut:"
    echo -e "   Email:    ${YELLOW}admin@quiz.com${NC}"
    echo -e "   Password: ${YELLOW}admin123${NC}"
    echo ""
    echo -e "📊 Commandes utiles:"
    echo -e "   make logs        - Voir les logs"
    echo -e "   make ps          - Status des conteneurs"
    echo -e "   make backup      - Sauvegarder la DB"
    echo -e "   make restart     - Redémarrer"
    echo ""
    
    if [ "$ENVIRONMENT" = "prod" ]; then
        echo -e "${YELLOW}⚠️  En production, pensez à:${NC}"
        echo -e "   - Configurer SSL/HTTPS"
        echo -e "   - Changer le mot de passe admin"
        echo -e "   - Mettre en place des sauvegardes automatiques"
        echo -e "   - Configurer un pare-feu"
        echo ""
    fi
}

# Fonction principale
main() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════╗"
    echo "║     QuizMaster - Déploiement         ║"
    echo "╚═══════════════════════════════════════╝"
    echo -e "${NC}"
    
    check_docker
    check_files
    
    case $ENVIRONMENT in
        dev)
            deploy_dev
            ;;
        prod)
            deploy_prod
            ;;
        *)
            print_error "Environnement invalide: $ENVIRONMENT"
            echo "Usage: $0 [dev|prod]"
            exit 1
            ;;
    esac
    
    check_health
    display_info
}

# Gestion des erreurs
trap 'print_error "Déploiement échoué"; exit 1' ERR

# Exécution
main