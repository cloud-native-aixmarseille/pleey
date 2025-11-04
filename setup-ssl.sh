#!/bin/bash

# SSL Configuration Script with Let's Encrypt
# Usage: ./setup-ssl.sh your-domain.com your-email@example.com

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_step() {
    echo -e "${GREEN}==>${NC} $1"
}

print_error() {
    echo -e "${RED}❌ Error: $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check arguments
if [ $# -lt 2 ]; then
    echo "Usage: $0 <domain> <email>"
    echo "Example: $0 quiz.example.com admin@example.com"
    exit 1
fi

DOMAIN=$1
EMAIL=$2
SSL_DIR="./nginx/ssl"
CERTBOT_DIR="./certbot"

print_step "SSL configuration for $DOMAIN"

# Create directories
mkdir -p "$SSL_DIR"
mkdir -p "$CERTBOT_DIR/conf"
mkdir -p "$CERTBOT_DIR/www"

# Vérifier que le domaine pointe vers ce serveur
print_step "Checking DNS..."
SERVER_IP=$(curl -s http://icanhazip.com)
DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)

if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
    print_warning "The domain $DOMAIN does not point to this server ($SERVER_IP)"
    print_warning "Domain IP: $DOMAIN_IP"
    print_warning "Continue only if you are sure"
    read -p "Continuer? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create temporary docker compose for Certbot
cat > docker compose.certbot.yml << EOF
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

# Create temporary Nginx config for ACME challenge
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

print_step "Stopping existing services..."
docker compose down 2>/dev/null || true

print_step "Starting temporary server for ACME challenge..."
docker compose -f docker compose.certbot.yml up -d nginx-temp
sleep 3

print_step "Obtaining SSL certificates..."
docker compose -f docker compose.certbot.yml run --rm certbot

# Check that certificates were created
if [ ! -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    print_error "Failed to obtain certificates"
    docker compose -f docker compose.certbot.yml down
    exit 1
fi

print_step "Certificates obtained successfully!"

# Copy certificates to SSL folder
cp "./certbot/conf/live/$DOMAIN/fullchain.pem" "$SSL_DIR/"
cp "./certbot/conf/live/$DOMAIN/privkey.pem" "$SSL_DIR/"

# Stop temporary server
docker compose -f docker compose.certbot.yml down

# Mettre à jour la configuration Nginx
print_step "Mise à jour de la configuration Nginx..."
sed -i "s/your-domain.com/$DOMAIN/g" frontend/nginx.prod.conf

# Créer un cron job pour le renouvellement automatique
print_step "Configuring automatic renewal..."

cat > renew-ssl.sh << 'EOF'
#!/bin/bash
docker compose -f docker compose.certbot.yml run --rm certbot renew
docker compose restart frontend
EOF

chmod +x renew-ssl.sh

# Add to crontab (renewal every day at 2am)
CRON_JOB="0 2 * * * cd $(pwd) && ./renew-ssl.sh >> /var/log/certbot-renew.log 2>&1"
(crontab -l 2>/dev/null | grep -v "renew-ssl.sh"; echo "$CRON_JOB") | crontab -

print_step "Cleaning up..."
rm -f nginx-temp.conf docker compose.certbot.yml

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ SSL configured successfully!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "📁 Certificates:"
echo -e "   $SSL_DIR/fullchain.pem"
echo -e "   $SSL_DIR/privkey.pem"
echo ""
echo -e "🔄 Automatic renewal configured (cron)"
echo ""
echo -e "🚀 Next steps:"
echo -e "   1. Start application: ${YELLOW}./deploy.sh prod${NC}"
echo -e "   2. Test HTTPS: ${YELLOW}https://$DOMAIN${NC}"
echo ""