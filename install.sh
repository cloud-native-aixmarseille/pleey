#!/bin/bash

# QuizMaster Automatic Installation Script
# Usage: curl -fsSL https://raw.githubusercontent.com/OWNER/quiz-app/main/install.sh | bash
# Updated for Docker Compose V2

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variables
REPO_URL="https://github.com/OWNER/quiz-app.git"
INSTALL_DIR="$HOME/quiz-app"
MIN_DOCKER_VERSION="20.10"
MIN_COMPOSE_VERSION="2.0"
COMPOSE_CMD="docker compose"

# Display Functions
print_banner() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                                                          ║"
    echo "║              Interactive Quiz Application                ║"
    echo "║                                                          ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "\n${BLUE}▶${NC} ${GREEN}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC}  $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC}  $1"
}

# Check prerequisites
check_os() {
    print_step "Checking operating system..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_success "Linux detected"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        print_success "macOS detected"
    else
        print_warning "Untested OS : $OSTYPE"
    fi
}

check_docker() {
    print_step "Checking Docker..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        echo ""
        echo "Installing Docker..."
        
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            curl -fsSL https://get.docker.com -o get-docker.sh
            sudo sh get-docker.sh
            sudo usermod -aG docker $USER
            rm get-docker.sh
            print_success "Docker installed"
            print_warning "You must log out/log in to use Docker without sudo"
            read -p "Press Enter to continue..."
        else
            print_error "Please install Docker Desktop manually"
            print_info "https://docs.docker.com/get-docker/"
            exit 1
        fi
    else
        DOCKER_VERSION=$(docker --version | awk '{print $3}' | sed 's/,//')
        print_success "Docker $DOCKER_VERSION installé"
    fi
}

check_docker_compose() {
    print_step "Checking Docker Compose V2..."
    
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose V2 is not installed"
        
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            echo "Installing Docker Compose V2..."
            sudo apt-get update
            sudo apt-get install -y $COMPOSE_CMD-plugin
            print_success "Docker Compose V2 installed"
        else
            print_error "Please install Docker Compose V2 manually"
            exit 1
        fi
    else
        COMPOSE_VERSION=$(docker compose version --short)
        print_success "Docker Compose $COMPOSE_VERSION installé"
    fi
}

check_git() {
    print_step "Checking Git..."
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            echo "Installing Git..."
            sudo apt-get update
            sudo apt-get install -y git
            print_success "Git installed"
        else
            print_error "Please install Git manually"
            exit 1
        fi
    else
        GIT_VERSION=$(git --version | awk '{print $3}')
        print_success "Git $GIT_VERSION installé"
    fi
}

# Installation
clone_repository() {
    print_step "Téléchargement de QuizMaster..."
    
    if [ -d "$INSTALL_DIR" ]; then
        print_warning "Le répertoire $INSTALL_DIR existe déjà"
        read -p "Voulez-vous le supprimer et réinstaller ? [y/N] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$INSTALL_DIR"
        else
            print_info "Installation annulée"
            exit 0
        fi
    fi
    
    git clone "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    print_success "QuizMaster téléchargé dans $INSTALL_DIR"
}

configure_environment() {
    print_step "Configuring environment..."
    
    if [ ! -f ".env" ]; then
        cp .env.example .env
        
        # Générer un JWT_SECRET aléatoire
        if command -v openssl &> /dev/null; then
            JWT_SECRET=$(openssl rand -base64 32)
            sed -i.bak "s|votre_secret_jwt_super_securise_changez_moi|$JWT_SECRET|g" .env
            rm .env.bak 2>/dev/null || true
            print_success "JWT_SECRET généré automatiquement"
        else
            print_warning "Veuillez modifier JWT_SECRET dans .env"
        fi
        
        print_success ".env file created"
    else
        print_info ".env existe déjà"
    fi
}

build_and_start() {
    print_step "Construction et démarrage de l'application..."
    
    echo ""
    print_info "Cela peut prendre quelques minutes..."
    echo ""
    
    $COMPOSE_CMD build
    $COMPOSE_CMD up -d
    
    print_success "Application démarrée"
}

wait_for_services() {
    print_step "Attente du démarrage des services..."
    
    echo -n "Backend: "
    for i in {1..30}; do
        if curl -sf http://localhost:3001/api/health > /dev/null 2>&1; then
            print_success "OK"
            break
        fi
        echo -n "."
        sleep 2
    done
    
    echo -n "Frontend: "
    for i in {1..30}; do
        if curl -sf http://localhost > /dev/null 2>&1; then
            print_success "OK"
            break
        fi
        echo -n "."
        sleep 2
    done
}

display_info() {
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}           ✅ Installation completed successfully ! ✅          ${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${CYAN}🌐 Accès à l'application:${NC}"
    echo -e "   Frontend:  ${YELLOW}http://localhost${NC}"
    echo -e "   Backend:   ${YELLOW}http://localhost:3001${NC}"
    echo ""
    echo -e "${CYAN}👤 Compte administrateur par défaut:${NC}"
    echo -e "   Email:     ${YELLOW}admin@quiz.com${NC}"
    echo -e "   Password:  ${YELLOW}admin123${NC}"
    echo -e "   ${RED}⚠️  Changez ce mot de passe en production !${NC}"
    echo ""
    echo -e "${CYAN}📂 Répertoire d'installation:${NC}"
    echo -e "   ${YELLOW}$INSTALL_DIR${NC}"
    echo ""
    echo -e "${CYAN}🛠️  Useful commands:${NC}"
    echo -e "   ${YELLOW}cd $INSTALL_DIR${NC}             - Aller au répertoire"
    echo -e "   ${YELLOW}make help${NC}                   - Liste des commandes"
    echo -e "   ${YELLOW}make logs${NC}                   - View logs"
    echo -e "   ${YELLOW}make restart${NC}                - Restart"
    echo -e "   ${YELLOW}make backup${NC}                 - Sauvegarder la DB"
    echo -e "   ${YELLOW}$COMPOSE_CMD down${NC}         - Stop application"
    echo ""
    echo -e "${CYAN}📚 Documentation:${NC}"
    echo -e "   ${YELLOW}cat README.md${NC}               - Guide complet"
    echo -e "   ${YELLOW}cat QUICK-REFERENCE.md${NC}      - Référence rapide"
    echo ""
    echo -e "${CYAN}🚀 Prochaines étapes:${NC}"
    echo -e "   1. Ouvrir ${YELLOW}http://localhost${NC} dans votre navigateur"
    echo -e "   2. Se connecter avec le compte admin"
    echo -e "   3. Créer votre premier quiz"
    echo -e "   4. Lancer une partie et s'amuser !"
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Menu d'installation
show_menu() {
    echo ""
    echo -e "${CYAN}Options d'installation:${NC}"
    echo "  1) Installation complète (recommandé)"
    echo "  2) Installation avec monitoring"
    echo "  3) Installation avec SSL"
    echo "  4) Quitter"
    echo ""
    read -p "Votre choix [1-4]: " choice
    
    case $choice in
        1)
            INSTALL_TYPE="standard"
            ;;
        2)
            INSTALL_TYPE="monitoring"
            print_info "Le monitoring sera accessible sur:"
            print_info "  Grafana: http://localhost:3000 (admin/admin123)"
            print_info "  Prometheus: http://localhost:9090"
            ;;
        3)
            INSTALL_TYPE="ssl"
            read -p "Votre nom de domaine: " DOMAIN
            read -p "Votre email: " EMAIL
            ;;
        4)
            print_info "Installation annulée"
            exit 0
            ;;
        *)
            print_error "Choix invalide"
            show_menu
            ;;
    esac
}

install_with_monitoring() {
    $COMPOSE_CMD -f $COMPOSE_CMD.yml -f $COMPOSE_CMD.monitoring.yml up -d
    print_success "Application démarrée avec monitoring"
    echo ""
    print_info "Grafana: http://localhost:3000"
    print_info "Prometheus: http://localhost:9090"
}

install_with_ssl() {
    if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
        print_error "Domaine et email requis pour SSL"
        exit 1
    fi
    
    print_step "Configuration SSL pour $DOMAIN..."
    chmod +x setup-ssl.sh
    ./setup-ssl.sh "$DOMAIN" "$EMAIL"
    
    print_step "Démarrage en mode production..."
    $COMPOSE_CMD -f $COMPOSE_CMD.prod.yml up -d
    
    print_success "Application démarrée avec SSL"
    echo ""
    print_info "Accès: https://$DOMAIN"
}

# Fonction principale
main() {
    print_banner
    
    # Vérifications
    check_os
    check_git
    check_docker
    check_docker_compose
    
    # Installation
    clone_repository
    configure_environment
    
    # Menu
    show_menu
    
    # Installation selon le type
    case $INSTALL_TYPE in
        standard)
            build_and_start
            ;;
        monitoring)
            $COMPOSE_CMD build
            install_with_monitoring
            ;;
        ssl)
            $COMPOSE_CMD -f $COMPOSE_CMD.prod.yml build
            install_with_ssl
            ;;
    esac
    
    # Attente et affichage
    wait_for_services
    display_info
    
    # Proposer d'ouvrir le navigateur
    if command -v xdg-open &> /dev/null; then
        read -p "Voulez-vous ouvrir l'application dans le navigateur ? [Y/n] " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            xdg-open http://localhost
        fi
    elif command -v open &> /dev/null; then
        read -p "Voulez-vous ouvrir l'application dans le navigateur ? [Y/n] " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            open http://localhost
        fi
    fi
}

# Gestion des erreurs
trap 'print_error "Installation échouée à la ligne $LINENO"; exit 1' ERR

# Exécution
main

# Fin
print_success "Script terminé"
exit 0