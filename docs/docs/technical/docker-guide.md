---
sidebar_position: 3
---

# 🐳 Docker Guide - QuizMaster

Complete guide to deploy the QuizMaster application with Docker and Docker Compose.

## 📋 Prerequisites

- Docker (version 20.10+)
- Docker Compose (version 2.0+)

Check installations:
```bash
docker --version
docker-compose --version
```

## 📁 Docker files structure

```
quiz-app/
├── docker-compose.yml          # Services orchestration
├── .env.example               # Environment variables
│
├── backend/
│   ├── Dockerfile            # Backend image
│   ├── .dockerignore         # Files to exclude
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── Dockerfile            # Multi-stage frontend image
    ├── .dockerignore         # Files to exclude
    ├── nginx.conf            # Nginx config
    ├── src/
    └── package.json
```

## 🚀 Quick start

### 1. Environment variables configuration

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file and CHANGE the JWT_SECRET
nano .env
```

### 2. Start the application

```bash
# Build and start containers
docker-compose up -d --build

# Check everything is working
docker-compose ps
```

### 3. Access the application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3001
- **Health check**: http://localhost:3001/api/health

### 4. Default admin account

- Email: `admin@quiz.com`
- Password: `admin123`

## 🔧 Useful Docker commands

### Container management

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Logs for a specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Rebuild images
docker-compose build --no-cache

# Stop and remove everything (including volumes)
docker-compose down -v
```

### Monitoring and debugging

```bash
# Container status
docker-compose ps

# Resources used
docker stats

# Enter a container
docker-compose exec backend sh
docker-compose exec frontend sh

# View processes in a container
docker-compose top backend
```

### Database

```bash
# Access SQLite database
docker-compose exec backend sh
cd data
sqlite3 quiz.db

# Database backup
docker-compose exec backend cat /app/data/quiz.db > backup_$(date +%Y%m%d).db

# Restore a backup
docker cp backup.db quiz-backend:/app/data/quiz.db
```

## 🔐 Production security

### 1. Change JWT_SECRET

```bash
# Generate a random secret
openssl rand -base64 32

# Update .env
JWT_SECRET=your_new_generated_secret
```

### 2. Use HTTPS

Add a reverse proxy like Nginx or Traefik with Let's Encrypt:

```yaml
# Example with Traefik (to add to docker-compose.yml)
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

### 3. Limit resources

Modify `docker-compose.yml`:

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

## 📊 Volumes and persistence

### Data volume

The `quiz-data` volume persists the SQLite database:

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect quiz-app_quiz-data

# Volume backup
docker run --rm -v quiz-app_quiz-data:/data -v $(pwd):/backup alpine tar czf /backup/quiz-data-backup.tar.gz /data

# Restore volume
docker run --rm -v quiz-app_quiz-data:/data -v $(pwd):/backup alpine tar xzf /backup/quiz-data-backup.tar.gz -C /
```

## 🌐 Network configuration

### Ports used

- **80**: Frontend (Nginx)
- **3001**: Backend (Node.js)

### Change ports

Modify in `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Use port 8080 instead of 80
  
  backend:
    ports:
      - "3002:3001"  # Use port 3002 instead of 3001
```

## 🔄 Updates

### Application update

```bash
# 1. Stop services
docker-compose down

# 2. Get latest changes
git pull

# 3. Rebuild images
docker-compose build --no-cache

# 4. Restart
docker-compose up -d

# 5. Check logs
docker-compose logs -f
```

### Database migration

If you modify the database structure:

```bash
# 1. Backup
docker-compose exec backend cat /app/data/quiz.db > backup.db

# 2. Stop backend
docker-compose stop backend

# 3. Apply migrations (if needed)
# ...

# 4. Restart
docker-compose start backend
```

## 🐛 Troubleshooting

### Containers won't start

```bash
# Check logs
docker-compose logs

# Check container status
docker-compose ps

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Backend/frontend connection issues

```bash
# Check backend is accessible
curl http://localhost:3001/api/health

# Check network connections
docker network inspect quiz-app_quiz-network

# Restart network
docker-compose down
docker-compose up -d
```

### Corrupted database

```bash
# Restore from backup
docker cp backup.db quiz-backend:/app/data/quiz.db
docker-compose restart backend

# Or delete and recreate
docker-compose down -v
docker-compose up -d
```

### Insufficient disk space

```bash
# Clean unused images
docker image prune -a

# Clean everything not in use
docker system prune -a --volumes

# See used space
docker system df
```

## 🚀 Production deployment

### With Docker Swarm

```bash
# Initialize Swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml quiz-app

# View services
docker stack services quiz-app
```

### With Kubernetes

Convert with Kompose:

```bash
# Install kompose
curl -L https://github.com/kubernetes/kompose/releases/download/v1.31.2/kompose-linux-amd64 -o kompose
chmod +x kompose
sudo mv ./kompose /usr/local/bin/kompose

# Convert
kompose convert -f docker-compose.yml
```

## 📈 Monitoring

### Centralized logs

Use a system like ELK or Loki:

```yaml
# Add to docker-compose.yml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Health checks

Health checks are already configured in `docker-compose.yml`:

```bash
# Check container health
docker-compose ps
```

## 🔒 Security checklist

- [ ] JWT_SECRET changed and secured
- [ ] Environment variables not committed
- [ ] HTTPS configured with valid certificates
- [ ] Firewall configured (ports 80, 443 only)
- [ ] Logs rotated and backed up
- [ ] Automatic database backups
- [ ] Admin passwords changed
- [ ] Rate limiting configured
- [ ] Docker images regularly updated

## 📚 Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker best practices](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js Docker best practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)