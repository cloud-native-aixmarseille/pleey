# ⚡ QuizMaster - Guide de référence rapide

Guide ultra-rapide pour toutes les commandes essentielles.

## 🚀 Démarrage rapide

### Installation en 3 commandes

```bash
git clone <repo-url> && cd quiz-app
cp .env.example .env
make install
```

**Accès :**
- Frontend : http://localhost
- Backend : http://localhost:3001
- Admin : admin@quiz.com / admin123

---

## 📋 Commandes Make

```bash
make help              # Liste toutes les commandes
make install           # Installation complète (première fois)
make up                # Démarrer l'application
make down              # Arrêter l'application
make restart           # Redémarrer
make logs              # Voir les logs (temps réel)
make ps                # Status des conteneurs
make build             # Construire les images
make rebuild           # Reconstruire et redémarrer
make backup            # Sauvegarder la base de données
make restore           # Restaurer le dernier backup
make clean             # Nettoyer (garde les données)
make clean-all         # Tout supprimer (⚠️ données incluses)
make health            # Vérifier l'état de l'app
make shell-backend     # Accéder au shell backend
make shell-frontend    # Accéder au shell frontend
make db                # Accéder à la base SQLite
make monitoring-up     # Démarrer avec monitoring
make grafana           # Ouvrir Grafana
make prometheus        # Ouvrir Prometheus
```

---

## 🐳 Commandes Docker

### Gestion des conteneurs

```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Redémarrer
docker-compose restart

# Voir les logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend

# Status
docker-compose ps

# Stats temps réel
docker stats

# Reconstruire
docker-compose build --no-cache
docker-compose up -d --force-recreate
```

### Debug

```bash
# Shell dans un conteneur
docker exec -it quiz-backend sh
docker exec -it quiz-frontend sh

# Voir les processus
docker-compose top

# Inspecter un conteneur
docker inspect quiz-backend

# Copier des fichiers
docker cp fichier.txt quiz-backend:/app/
docker cp quiz-backend:/app/data/quiz.db ./backup.db
```

### Nettoyage

```bash
# Supprimer les conteneurs arrêtés
docker container prune

# Supprimer les images non utilisées
docker image prune -a

# Supprimer les volumes non utilisés
docker volume prune

# Tout nettoyer
docker system prune -a --volumes
```

---

## 📁 Structure des fichiers

```
quiz-app/
├── backend/
│   ├── server.js              # Serveur principal
│   ├── package.json
│   ├── Dockerfile
│   └── data/
│       └── quiz.db           # Base de données SQLite
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Application React
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── monitoring/
│   ├── prometheus.yml
│   ├── loki-config.yml
│   └── promtail-config.yml
│
├── docker-compose.yml         # Composition dev
├── docker-compose.prod.yml    # Composition production
├── docker-compose.monitoring.yml
├── .env.example               # Variables d'environnement
├── Makefile                   # Commandes simplifiées
├── deploy.sh                  # Script de déploiement
├── setup-ssl.sh               # Configuration SSL
└── README.md                  # Documentation
```

---

## 🔧 Variables d'environnement

```bash
# .env
JWT_SECRET=your_super_secret_key_change_me_in_production
NODE_ENV=production
PORT=3001
```

**Générer un secret JWT :**
```bash
openssl rand -base64 32
```

---

## 🔐 Comptes par défaut

### Admin
- Email : `admin@quiz.com`
- Password : `admin123`
- ⚠️ **À changer en production !**

### Grafana (si monitoring)
- URL : http://localhost:3000
- User : `admin`
- Password : `admin123`

---

## 📊 URLs importantes

| Service | URL Dev | URL Prod |
|---------|---------|----------|
| Frontend | http://localhost:5173 | http://localhost |
| Backend | http://localhost:3001 | http://localhost:3001 |
| Health Check | http://localhost:3001/api/health | |
| Grafana | http://localhost:3000 | |
| Prometheus | http://localhost:9090 | |
| cAdvisor | http://localhost:8080 | |

---

## 🛠️ Déploiement

### Développement
```bash
docker-compose up -d
```

### Production
```bash
./deploy.sh prod
# ou
docker-compose -f docker-compose.prod.yml up -d
```

### Avec SSL
```bash
./setup-ssl.sh votre-domaine.com email@example.com
./deploy.sh prod
```

---

## 💾 Backup & Restore

### Backup manuel
```bash
make backup
# ou
docker exec quiz-backend cat /app/data/quiz.db > backup-$(date +%Y%m%d).db
```

### Backup automatique (cron)
```bash
# Ajouter au crontab
0 3 * * * cd /path/to/quiz-app && make backup >> /var/log/quiz-backup.log 2>&1
```

### Restaurer
```bash
make restore
# ou
docker cp backup.db quiz-backend:/app/data/quiz.db
docker-compose restart backend
```

---

## 🔍 Debugging

### Logs

```bash
# Tous les logs
make logs

# Backend uniquement
docker-compose logs -f backend

# Erreurs uniquement
docker-compose logs | grep -i error

# Dernières 100 lignes
docker-compose logs --tail=100

# Depuis une date
docker-compose logs --since="2024-01-01T00:00:00"
```

### Vérifier la santé

```bash
# Health check
curl http://localhost:3001/api/health

# Status des conteneurs
docker-compose ps

# Utilisation des ressources
docker stats

# Script complet
make health
```

### Accéder à la base de données

```bash
# Via Make
make db

# Ou manuellement
docker exec -it quiz-backend sh
cd /app/data
sqlite3 quiz.db

# Commandes SQLite
.tables                          # Liste des tables
.schema users                    # Schéma d'une table
SELECT * FROM users;             # Requête
SELECT COUNT(*) FROM quizzes;    # Compter
.exit                            # Quitter
```

---

## 🚨 Problèmes courants

### Backend ne démarre pas

```bash
# Vérifier les logs
docker-compose logs backend

# Recréer le conteneur
docker-compose down
docker-compose up -d

# Vérifier les permissions
docker exec quiz-backend ls -la /app/data
```

### Frontend ne charge pas

```bash
# Vérifier Nginx
docker-compose logs frontend

# Reconstruire
docker-compose build frontend --no-cache
docker-compose up -d frontend
```

### WebSocket ne fonctionne pas

```bash
# Vérifier que le backend écoute
netstat -tlnp | grep 3001

# Vérifier les connexions actives
docker exec quiz-backend netstat -an | grep 3001

# Tester manuellement
wscat -c ws://localhost:3001/socket.io/?transport=websocket
```

### Erreur "Port already in use"

```bash
# Trouver quel processus utilise le port
sudo lsof -i :3001
sudo lsof -i :80

# Arrêter le processus
sudo kill -9 <PID>

# Ou changer le port dans docker-compose.yml
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
# Libérer de la mémoire
docker system prune -a

# Voir l'utilisation
docker stats

# Limiter les ressources dans docker-compose.yml
deploy:
  resources:
    limits:
      memory: 512M
```

---

## 🔒 Sécurité

### Checklist avant la production

- [ ] JWT_SECRET changé
- [ ] Mots de passe admin changés
- [ ] SSL/HTTPS configuré
- [ ] Firewall activé (ports 80, 443 uniquement)
- [ ] `.env` non commité
- [ ] Logs ne contiennent pas de données sensibles
- [ ] Backups automatiques configurés
- [ ] Monitoring activé
- [ ] Rate limiting configuré

### Configurer le firewall

```bash
# UFW (Ubuntu)
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

---

## 📈 Monitoring

### Métriques clés

```bash
# CPU, RAM, Disque
docker stats

# Requêtes HTTP
curl http://localhost:9090/api/v1/query?query=rate(http_requests_total[5m])

# Utilisateurs actifs
curl http://localhost:9090/api/v1/query?query=websocket_connections_active
```

### Grafana Dashboards

1. Importer dashboard Docker (ID: 193)
2. Importer dashboard Node Exporter (ID: 1860)
3. Créer dashboard custom pour QuizMaster

---

## 🔄 Mise à jour

```bash
# Méthode simple
make update

# Ou manuel
make backup
git pull
docker-compose build --no-cache
docker-compose up -d
```

---

## 📚 Documentation complète

- [README.md](README.md) - Vue d'ensemble
- [DOCKER-GUIDE.md](DOCKER-GUIDE.md) - Guide Docker
- [MONITORING-GUIDE.md](MONITORING-GUIDE.md) - Monitoring
- [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md) - Déploiement
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution

---

## 🆘 Support

### Ordre de diagnostic

1. Vérifier les logs : `make logs`
2. Vérifier le health check : `make health`
3. Vérifier les ressources : `docker stats`
4. Consulter la documentation
5. Chercher dans les issues GitHub
6. Créer une nouvelle issue

### Informations à fournir pour le support

```bash
# Version Docker
docker --version
docker-compose --version

# Système d'exploitation
uname -a

# Logs
docker-compose logs --tail=100

# Configuration
cat docker-compose.yml

# Status
docker-compose ps
```

---

## ⚡ Astuces Pro

### Alias utiles

Ajouter dans `~/.bashrc` ou `~/.zshrc` :

```bash
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
alias dcl='docker-compose logs -f'
alias dcp='docker-compose ps'
alias dcr='docker-compose restart'
alias qm='cd /path/to/quiz-app'
```

### Watch mode pour les logs

```bash
# Suivre les erreurs en temps réel
watch -n 1 'docker-compose logs --tail=20 | grep -i error'
```

### Backup rapide avant modifications

```bash
# One-liner
docker exec quiz-backend cat /app/data/quiz.db > backup-before-change.db && echo "Backup OK"
```

### Test de performance

```bash
# Apache Bench
ab -n 1000 -c 10 http://localhost:3001/api/health

# Wrk
wrk -t12 -c400 -d30s http://localhost:3001/api/health
```

---

## 📞 Contacts

- **Issues** : https://github.com/OWNER/quiz-app/issues
- **Discussions** : https://github.com/OWNER/quiz-app/discussions
- **Email** : support@example.com

---

**Dernière mise à jour** : Octobre 2024