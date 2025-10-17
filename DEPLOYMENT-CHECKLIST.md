# ✅ Checklist de déploiement - QuizMaster

Guide complet pour déployer QuizMaster en production de manière sécurisée.

## 📋 Avant le déploiement

### Prérequis serveur

- [ ] Serveur Linux (Ubuntu 20.04+ recommandé)
- [ ] Docker 20.10+ installé
- [ ] Docker Compose 2.0+ installé
- [ ] Domaine configuré pointant vers le serveur
- [ ] Ports 80 et 443 ouverts dans le firewall
- [ ] Au moins 2GB RAM et 20GB disque disponible
- [ ] Accès SSH configuré

### Configuration initiale

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo apt install docker-compose-plugin

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER
```

## 🔐 Sécurité

### Variables d'environnement

- [ ] Copier `.env.example` vers `.env`
- [ ] Générer un JWT_SECRET fort : `openssl rand -base64 32`
- [ ] Mettre à jour JWT_SECRET dans `.env`
- [ ] Vérifier que `.env` est dans `.gitignore`
- [ ] Ne JAMAIS commiter `.env`

### SSL/HTTPS

- [ ] Domaine configuré et DNS propagé
- [ ] Exécuter `./setup-ssl.sh votre-domaine.com votre-email@example.com`
- [ ] Vérifier les certificats dans `nginx/ssl/`
- [ ] Tester HTTPS : `curl -I https://votre-domaine.com`
- [ ] Configurer le renouvellement automatique (cron)

### Firewall

```bash
# Installer UFW
sudo apt install ufw

# Configurer les règles
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activer
sudo ufw enable
sudo ufw status
```

### Utilisateurs et mots de passe

- [ ] Changer le mot de passe admin de l'application
- [ ] Changer le mot de passe Grafana (si monitoring)
- [ ] Désactiver les comptes de test/développement
- [ ] Utiliser des mots de passe forts (16+ caractères)

## 🚀 Déploiement

### Méthode 1 : Script automatique

```bash
# Cloner le projet
git clone <votre-repo>
cd quiz-app

# Rendre les scripts exécutables
chmod +x deploy.sh setup-ssl.sh

# Déployer
./deploy.sh prod
```

### Méthode 2 : Manuel

```bash
# 1. Configuration
cp .env.example .env
nano .env  # Modifier JWT_SECRET

# 2. SSL (optionnel mais recommandé)
./setup-ssl.sh votre-domaine.com email@example.com

# 3. Build et démarrage
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# 4. Vérifier
docker-compose ps
curl http://localhost:3001/api/health
```

## 🔍 Vérifications post-déploiement

### Services

- [ ] Backend répond : `curl http://localhost:3001/api/health`
- [ ] Frontend accessible : `curl http://localhost`
- [ ] WebSocket fonctionne (tester un quiz)
- [ ] Base de données créée : `docker exec quiz-backend ls -la /app/data/`

### Performance

```bash
# Vérifier l'utilisation des ressources
docker stats

# Logs sans erreurs
docker-compose logs --tail=100

# Temps de réponse
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/api/health
```

Créer `curl-format.txt` :
```
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_appconnect:  %{time_appconnect}\n
time_pretransfer:  %{time_pretransfer}\n
time_redirect:  %{time_redirect}\n
time_starttransfer:  %{time_starttransfer}\n
time_total:  %{time_total}\n
```

### Sécurité

- [ ] HTTPS fonctionne (certificat valide)
- [ ] Headers de sécurité présents
- [ ] Pas de données sensibles dans les logs
- [ ] Firewall actif : `sudo ufw status`
- [ ] Containers ne tournent pas en root

### Base de données

```bash
# Vérifier la base
docker exec -it quiz-backend sh
cd /app/data
sqlite3 quiz.db
> .tables
> SELECT COUNT(*) FROM users;
> .quit
```

## 📊 Monitoring (Optionnel)

- [ ] Démarrer le monitoring : `make monitoring-up`
- [ ] Accéder à Grafana : http://localhost:3000
- [ ] Configurer les alertes
- [ ] Tester les notifications
- [ ] Créer les dashboards

## 💾 Backups

### Configuration automatique

```bash
# Créer le script de backup
cat > /usr/local/bin/backup-quizmaster.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/quizmaster"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup base de données
docker exec quiz-backend cat /app/data/quiz.db > $BACKUP_DIR/quiz-$DATE.db

# Backup .env
cp /path/to/quiz-app/.env $BACKUP_DIR/env-$DATE

# Nettoyer les vieux backups (garder 30 jours)
find $BACKUP_DIR -name "quiz-*.db" -mtime +30 -delete

# Log
echo "$DATE: Backup completed" >> $BACKUP_DIR/backup.log
EOF

chmod +x /usr/local/bin/backup-quizmaster.sh

# Ajouter au cron (tous les jours à 3h)
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/local/bin/backup-quizmaster.sh") | crontab -
```

### Backup manuel

```bash
# Créer un backup maintenant
make backup

# Ou manuellement
docker exec quiz-backend cat /app/data/quiz.db > backup-$(date +%Y%m%d).db
```

### Restauration

```bash
# Restaurer le dernier backup
make restore

# Ou manuellement
docker cp backup.db quiz-backend:/app/data/quiz.db
docker-compose restart backend
```

## 🔄 Mises à jour

### Mise à jour de l'application

```bash
# Méthode simple
make update

# Ou manuel
make backup
git pull
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
docker-compose logs -f
```

### Mise à jour des dépendances

```bash
# Mettre à jour les images Docker
docker-compose pull
docker-compose up -d
```

## 📈 Optimisations

### Performance

- [ ] Activer la compression gzip (déjà dans nginx.conf)
- [ ] Configurer le cache navigateur
- [ ] Limiter les ressources des conteneurs
- [ ] Utiliser un CDN pour les assets statiques
- [ ] Optimiser les images (compression)

### Scalabilité

```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      replicas: 3  # 3 instances du backend
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

## 🚨 Troubleshooting

### Backend ne démarre pas

```bash
# Vérifier les logs
docker-compose logs backend

# Vérifier les permissions
docker exec -it quiz-backend ls -la /app/data

# Recréer le conteneur
docker-compose down
docker-compose up -d
```

### Certificat SSL expiré

```bash
# Renouveler manuellement
./renew-ssl.sh

# Ou avec certbot
docker-compose -f docker-compose.certbot.yml run --rm certbot renew
docker-compose restart frontend
```

### Base de données corrompue

```bash
# Restaurer un backup
make restore

# Ou recréer
docker-compose down -v
docker-compose up -d
```

### Mémoire insuffisante

```bash
# Vérifier l'utilisation
docker stats

# Augmenter les limites ou libérer de la mémoire
docker system prune -a
```

## 📞 Support et maintenance

### Logs centralisés

```bash
# Tous les logs
make logs

# Logs spécifiques
docker-compose logs -f backend
docker-compose logs -f frontend

# Erreurs uniquement
docker-compose logs | grep -i error
```

### Surveillance continue

```bash
# Créer un script de health check
cat > /usr/local/bin/check-quizmaster.sh << 'EOF'
#!/bin/bash
if ! curl -sf http://localhost:3001/api/health > /dev/null; then
    echo "Backend DOWN! Restarting..."
    docker-compose restart backend
    # Envoyer une alerte (email, Slack, etc.)
fi
EOF

# Exécuter toutes les 5 minutes
*/5 * * * * /usr/local/bin/check-quizmaster.sh
```

## 🎉 Lancement

### Checklist finale

- [ ] Tous les tests passent
- [ ] SSL configuré et testé
- [ ] Backups automatiques en place
- [ ] Monitoring actif
- [ ] Alertes configurées
- [ ] Documentation à jour
- [ ] Mots de passe changés
- [ ] Firewall activé
- [ ] Logs vérifiés
- [ ] Performance testée

### Communication

- [ ] Annoncer la mise en production
- [ ] Fournir les URLs
- [ ] Documenter les comptes de test
- [ ] Préparer un guide utilisateur
- [ ] Mettre en place un canal de support

## 📚 Documentation

- [README.md](README.md) - Guide général
- [DOCKER-GUIDE.md](DOCKER-GUIDE.md) - Guide Docker
- [MONITORING-GUIDE.md](MONITORING-GUIDE.md) - Guide monitoring
- [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md) - Cette checklist

## 🆘 Contacts

- Issues : GitHub Issues
- Email : support@example.com
- Documentation : https://docs.example.com