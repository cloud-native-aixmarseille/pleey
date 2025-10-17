#!/bin/bash

# Script de configuration SSL avec Let's Encrypt
# Usage: ./setup-ssl.sh your-domain.com your-email@example.com

set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_step() {
    echo -e "${GREEN}==>${NC} $1"
}

print_error() {
    echo -e "${RED}❌ Erreur: $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Vérifier les arguments
if [ $# -lt 2 ]; then
    echo "Usage: $0 <domain> <email>"
    echo "Exemple: $0 quiz.example.com admin@example.com"
    exit 1
fi

DOMAIN=$1
EMAIL=$2
SSL_DIR="./nginx/ssl"
CERTBOT_DIR="./certbot"

print_step "Configuration SSL pour $DOMAIN"

# Créer les répertoires
mkdir -p "$SSL_DIR"
mkdir -p "$CERTBOT_DIR/conf"
mkdir -p "$CERTBOT_DIR/www"

# Vérifier que le domaine pointe vers ce serveur
print_step "Vérification DNS..."
SERVER_IP=$(curl -s http://icanhazip.com)
DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)

if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
    print_warning "Le domaine $DOMAIN ne pointe pas vers ce serveur ($SERVER_IP)"
    print_warning "IP du domaine: $DOMAIN_IP"
    print_warning "Continuez uniquement si vous êtes sûr"
    read -p "Continuer? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Créer un docker-compose temporaire pour Certbot
cat > docker-compose.certbot.yml << EOF
version: '3.8'

services:
  certbot:
    image: certbot/certbot
    container_name: certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    command: certonly --webroot -w /var/www/certbot --email $EMAIL --agree-tos --no-eff-email -d $DOMAIN -d www.$DOMAIN

  nginx-temp:
    image: nginx:alpine
    container_name: nginx-temp
    ports:
      - "80:80"
    volumes:
      - ./certbot/www:/var/www/certbot
      - ./nginx-temp.conf:/etc/nginx/conf.d/default.conf
EOF

# Créer une config Nginx temporaire pour le challenge ACME
cat > nginx-temp.conf << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'SSL Setup in progress...';
        add_header Content-Type text/plain;
    }
}
EOF

print_step "Arrêt des services existants..."
docker-compose down 2>/dev/null || true

print_step "Démarrage du serveur temporaire pour le challenge ACME..."
docker-compose -f docker-compose.certbot.yml up -d nginx-temp
sleep 3

print_step "Obtention des certificats SSL..."
docker-compose -f docker-compose.certbot.yml run --rm certbot

# Vérifier que les certificats ont été créés
if [ ! -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    print_error "Échec de l'obtention des certificats"
    docker-compose -f docker-compose.certbot.yml down
    exit 1
fi

print_step "Certificats obtenus avec succès!"

# Copier les certificats dans le dossier SSL
cp "./certbot/conf/live/$DOMAIN/fullchain.pem" "$SSL_DIR/"
cp "./certbot/conf/live/$DOMAIN/privkey.pem" "$SSL_DIR/"

# Arrêter le serveur temporaire
docker-compose -f docker-compose.certbot.yml down

# Mettre à jour la configuration Nginx
print_step "Mise à jour de la configuration Nginx..."
sed -i "s/your-domain.com/$DOMAIN/g" frontend/nginx.prod.conf

# Créer un cron job pour le renouvellement automatique
print_step "Configuration du renouvellement automatique..."

cat > renew-ssl.sh << 'EOF'
#!/bin/bash
docker-compose -f docker-compose.certbot.yml run --rm certbot renew
docker-compose restart frontend
EOF

chmod +x renew-ssl.sh

# Ajouter au crontab (renouvellement tous les jours à 2h du matin)
CRON_JOB="0 2 * * * cd $(pwd) && ./renew-ssl.sh >> /var/log/certbot-renew.log 2>&1"
(crontab -l 2>/dev/null | grep -v "renew-ssl.sh"; echo "$CRON_JOB") | crontab -

print_step "Nettoyage..."
rm -f nginx-temp.conf docker-compose.certbot.yml

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ SSL configuré avec succès !${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "📁 Certificats:"
echo -e "   $SSL_DIR/fullchain.pem"
echo -e "   $SSL_DIR/privkey.pem"
echo ""
echo -e "🔄 Renouvellement automatique configuré (cron)"
echo ""
echo -e "🚀 Prochaines étapes:"
echo -e "   1. Démarrer l'application: ${YELLOW}./deploy.sh prod${NC}"
echo -e "   2. Tester HTTPS: ${YELLOW}https://$DOMAIN${NC}"
echo ""