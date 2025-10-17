# 🐳 Guide Docker - QuizMaster

Guide complet pour déployer l'application QuizMaster avec Docker et Docker Compose.

## 📋 Prérequis

- Docker (version 20.10+)
- Docker Compose (version 2.0+)

Vérifier les installations :
```bash
docker --version
docker-compose --version
```

## 📁 Structure des fichiers Docker

```
quiz-app/
├── docker-compose.yml          # Orchestration des services
├── .env.example               # Variables d'environnement
│
├── backend/
│   ├── Dockerfile            # Image backend
│   ├── .dockerignore         # Fichiers à exclure
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── Dockerfile            # Image frontend multi-stage
    ├── .dockerignore         # Fichiers à exclure
    ├── nginx.conf            # Config Nginx
    ├── src/
    └── package.json
```

## 🚀 Démarrage rapide

### 1. Configuration des variables d'environnement

```bash
# Copier le fichier exemple
cp .env.example .env

# Éditer le fichier .env et CHANGER le JWT_SECRET
nano .env
```

### 2. Lancer l'application

```bash
# Build et démarrage des conteneurs
docker-compose up -d --build

# Vérifier que tout fonctionne
docker-compose ps
```

### 3. Accéder à l'application

- **Frontend** : http://localhost
- **Backend API** : http://localhost:3001
- **Health check** : http://localhost:3001/api/health

### 4. Compte admin par défaut

- Email : `admin@quiz.com`
- Mot de passe : `admin123`

## 🔧 Commandes Docker utiles

### Gestion des conteneurs

```bash
# Démarrer les services
docker-compose up -d

# Arrêter les services
docker-compose down

# Voir les logs
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend

# Redémarrer un service
docker-compose restart backend

# Reconstruire les images
docker-compose build --no-cache

# Arrêter et supprimer tout (y compris volumes)
docker-compose down -v
```

### Monitoring et debug

```bash
# Status des conteneurs
docker-compose ps

# Ressources utilisées
docker stats

# Entrer dans un conteneur
docker-compose exec backend sh
docker-compose exec frontend sh

# Voir les processus dans un conteneur
docker-compose top backend
```

### Base de données

```bash
# Accéder à la base de données SQLite
docker-compose exec backend sh
cd data
sqlite3 quiz.db

# Backup de la base de données
docker-compose exec backend cat /app/data/quiz.db > backup_$(date +%Y%m%d).db

# Restaurer un backup
docker cp backup.db quiz-backend:/app/data/quiz.db
```

## 🔐 Sécurité en production

### 1. Changer le JWT_SECRET

```bash
# Générer un secret aléatoire
openssl rand -base64 32

# Mettre à jour .env
JWT_SECRET=votre_nouveau_secret_genere
```

### 2. Utiliser HTTPS

Ajouter un reverse proxy comme Nginx ou Traefik avec Let's Encrypt :

```yaml
# Exemple avec Traefik (à ajouter au docker-compose.yml)
services:
  traefik:
    image: traefik:v2.10
    command:
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.myresolver.acme.httpchallenge=true"
      - "--certificatesresolvers.myresolver.acme.email=your-email@example.com"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./letsencrypt:/letsencrypt
```

### 3. Limiter les ressources

Modifier `docker-compose.yml` :

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## 📊 Volumes et persistance

### Volume de données

Le volume `quiz-data` persiste la base de données SQLite :

```bash
# Lister les volumes
docker volume ls

# Inspecter le volume
docker volume inspect quiz-app_quiz-data

# Backup du volume
docker run --rm -v quiz-app_quiz-data:/data -v $(pwd):/backup alpine tar czf /backup/quiz-data-backup.tar.gz /data

# Restaurer le volume
docker run --rm -v quiz-app_quiz-data:/data -v $(pwd):/backup alpine tar xzf /backup/quiz-data-backup.tar.gz -C /
```

## 🌐 Configuration réseau

### Ports utilisés

- **80** : Frontend (Nginx)
- **3001** : Backend (Node.js)

### Changer les ports

Modifier dans `docker-compose.yml` :

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Utiliser le port 8080 au lieu de 80
  
  backend:
    ports:
      - "3002:3001"  # Utiliser le port 3002 au lieu de 3001
```

## 🔄 Mises à jour

### Mise à jour de l'application

```bash
# 1. Arrêter les services
docker-compose down

# 2. Récupérer les dernières modifications
git pull

# 3. Reconstruire les images
docker-compose build --no-cache

# 4. Redémarrer
docker-compose up -d

# 5. Vérifier les logs
docker-compose logs -f
```

### Migration de base de données

Si vous modifiez la structure de la base :

```bash
# 1. Backup
docker-compose exec backend cat /app/data/quiz.db > backup.db

# 2. Arrêter le backend
docker-compose stop backend

# 3. Appliquer les migrations (si nécessaire)
# ...

# 4. Redémarrer
docker-compose start backend
```

## 🐛 Dépannage

### Les conteneurs ne démarrent pas

```bash
# Vérifier les logs
docker-compose logs

# Vérifier l'état des conteneurs
docker-compose ps

# Reconstruire depuis zéro
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Problèmes de connexion backend/frontend

```bash
# Vérifier que le backend est accessible
curl http://localhost:3001/api/health

# Vérifier les connexions réseau
docker network inspect quiz-app_quiz-network

# Redémarrer le réseau
docker-compose down
docker-compose up -d
```

### Base de données corrompue

```bash
# Restaurer depuis un backup
docker cp backup.db quiz-backend:/app/data/quiz.db
docker-compose restart backend

# Ou supprimer et recréer
docker-compose down -v
docker-compose up -d
```

### Espace disque insuffisant

```bash
# Nettoyer les images inutilisées
docker image prune -a

# Nettoyer tout ce qui n'est pas utilisé
docker system prune -a --volumes

# Voir l'espace utilisé
docker system df
```

## 🚀 Déploiement en production

### Avec Docker Swarm

```bash
# Initialiser Swarm
docker swarm init

# Déployer la stack
docker stack deploy -c docker-compose.yml quiz-app

# Voir les services
docker stack services quiz-app
```

### Avec Kubernetes

Convertir avec Kompose :

```bash
# Installer kompose
curl -L https://github.com/kubernetes/kompose/releases/download/v1.31.2/kompose-linux-amd64 -o kompose
chmod +x kompose
sudo mv ./kompose /usr/local/bin/kompose

# Convertir
kompose convert -f docker-compose.yml
```

## 📈 Monitoring

### Logs centralisés

Utiliser un système comme ELK ou Loki :

```yaml
# Ajouter au docker-compose.yml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Health checks

Les health checks sont déjà configurés dans le `docker-compose.yml` :

```bash
# Vérifier la santé des conteneurs
docker-compose ps
```

## 🔒 Checklist de sécurité

- [ ] JWT_SECRET changé et sécurisé
- [ ] Variables d'environnement non commitées
- [ ] HTTPS configuré avec certificats valides
- [ ] Firewall configuré (ports 80, 443 uniquement)
- [ ] Logs rotatés et sauvegardés
- [ ] Backups automatiques de la base de données
- [ ] Mots de passe admin changés
- [ ] Rate limiting configuré
- [ ] Images Docker mises à jour régulièrement

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Best practices Docker](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js Docker best practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)