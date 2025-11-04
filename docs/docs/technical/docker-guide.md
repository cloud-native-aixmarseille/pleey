---
sidebar_position: 3
---

# 🐳 Docker Guide - QuizMaster

Complete guide to deploy the QuizMaster application with Docker and Docker Compose V2.

:::info Docker Compose V2 Migration
This project uses **Docker Compose V2** (command: `docker compose` without hyphen).
All Dockerfiles have been optimized with multi-stage builds and BuildKit for better performance and security.
:::

## 📋 Prerequisites

- Docker (version 20.10+)
- Docker Compose V2 (version 2.0+)

Check installations:
```bash
docker --version
docker compose version  # Note: no hyphen in V2!
```

### Install Docker Compose V2 (if needed)

```bash
# Linux
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Verify installation
docker compose version
```

## 📁 Docker files structure

```
quiz-app/
├── compose.yaml                # Development services (Docker Compose V2)
├── compose.prod.yaml           # Production configuration
├── compose.monitoring.yaml     # Monitoring stack (optional)
├── .env.example               # Environment variables template
│
├── backend/
│   ├── Dockerfile            # Multi-stage backend image
│   ├── .dockerignore         # Build context exclusions
│   ├── src/                  # NestJS source code
│   ├── prisma/               # Prisma schema and migrations
│   └── package.json
│
└── frontend/
    ├── Dockerfile            # Multi-stage frontend image
    ├── .dockerignore         # Build context exclusions
    ├── nginx.prod.conf       # Nginx production config
    ├── src/
    └── package.json
```

## 🎯 Multi-Stage Dockerfiles

Both backend and frontend use optimized multi-stage builds with 5 targets:

### Backend Stages
- **base**: Common dependencies layer
- **development**: Dev environment with hot-reload
- **builder**: TypeScript compilation
- **production**: Optimized production image (~180MB)
- **ci**: CI/CD testing environment

### Frontend Stages
- **base**: Common dependencies layer
- **development**: Vite dev server with hot-reload
- **builder**: Production build
- **production**: Nginx-based image (~45MB)
- **ci**: CI/CD testing environment

### BuildKit Optimizations
- Cache mounts for NPM dependencies
- Layer caching for faster rebuilds
- Non-root users for security
- Minimal production images

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
# Using Makefile (recommended)
make up

# Or using docker compose directly
docker compose up -d

# Check everything is working
docker compose ps
```

### 3. Access the application

:::info Traefik Reverse Proxy
This project uses **Traefik** as a reverse proxy to avoid port conflicts. Services are accessed via domain names instead of direct ports.
:::

- **Frontend**: http://frontend.quiz-master.localhost
- **Backend API**: http://backend.quiz-master.localhost
- **Traefik Dashboard**: http://localhost:8080
- **Health check**: http://backend.quiz-master.localhost/health/live

:::tip DNS Resolution
The `.localhost` TLD and its subdomains automatically resolve to `127.0.0.1` (RFC 6761). No hosts file configuration needed!
:::

### 4. Default admin account

- Email: `admin@quiz.com`
- Password: `admin123`

## 🔧 Docker Compose V2 Commands

:::warning Command Syntax Change
Docker Compose V2 uses `docker compose` (space, no hyphen) instead of `docker-compose` (hyphen).
:::

### Container management

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Logs for a specific service
docker compose logs -f backend
docker compose logs -f frontend

# Restart a service
docker compose restart backend

# Rebuild images
docker compose build --no-cache

# Stop and remove everything (including volumes)
docker compose down -v
```

### Makefile shortcuts

All Makefile commands have been updated for V2:

```bash
make up              # Start application
make down            # Stop application
make build           # Build images
make rebuild         # Rebuild and restart
make logs            # View all logs
make logs-backend    # Backend logs only
make logs-frontend   # Frontend logs only
make ps              # Container status
make clean           # Clean up
make clean-all       # Deep clean with volumes
make backup          # Backup database
make restore         # Restore database
```

### Monitoring and debugging

```bash
# Container status
docker compose ps

# Resources used
docker stats

# Enter a container
docker compose exec backend sh
docker compose exec frontend sh

# View processes in a container
docker compose top backend

# Validate compose file
docker compose config

# View effective configuration
docker compose config --services
```

### Build targets

```bash
# Build development images (default)
docker compose build

# Build production images
docker compose -f compose.prod.yaml build

# Build specific stage
docker build --target production -t quiz-backend:prod ./backend
docker build --target ci -t quiz-backend:ci ./backend

# Enable BuildKit for faster builds
export DOCKER_BUILDKIT=1
docker compose build
```

### Database

```bash
# Access PostgreSQL database
docker compose exec postgres psql -U quizapp -d quizdb

# Database backup
docker compose exec postgres pg_dump -U quizapp quizdb > backup_$(date +%Y%m%d).sql

# Or use Makefile
make backup

# Restore a backup
docker compose exec -T postgres psql -U quizapp -d quizdb < backup.sql

# Or use Makefile
make restore

# Run Prisma migrations
docker compose exec backend npx prisma migrate deploy

# Generate Prisma Client
docker compose exec backend npx prisma generate

# View database schema
docker compose exec backend npx prisma studio
```

## 🔐 Production security

### 1. Use production compose file

```bash
# Production deployment
docker compose -f compose.prod.yaml up -d

# Or use deployment script
./deploy.sh prod
```

### 2. Change JWT_SECRET

```bash
# Generate a random secret
openssl rand -base64 32

# Update .env
JWT_SECRET=your_new_generated_secret
```

### 3. Security features in Dockerfiles

- ✅ **Non-root users**: Backend runs as `nestjs` (UID 1001), frontend as `nginx` (UID 101)
- ✅ **Minimal images**: Alpine-based images for smaller attack surface
- ✅ **Security updates**: Automated security patches in base images
- ✅ **Multi-stage builds**: Only production dependencies in final image
- ✅ **Health checks**: Built-in container health monitoring

### 4. Use HTTPS

Add a reverse proxy like Nginx or Traefik with Let's Encrypt:

```yaml
# Example with Traefik (to add to compose.prod.yaml)
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

### 5. Limit resources

Modify `compose.prod.yaml` (already configured):

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

### Data volumes

The application uses the following volumes:

- `postgres-data`: Persists PostgreSQL database
- `backend-node-modules`: Caches backend dependencies (development)
- `frontend-node-modules`: Caches frontend dependencies (development)

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect quiz-app_postgres-data

# Volume backup (PostgreSQL)
docker-compose exec db pg_dump -U quizuser quizdb > backup_$(date +%Y%m%d).sql

# Restore volume
docker run --rm -v quiz-app_quiz-data:/data -v $(pwd):/backup alpine tar xzf /backup/quiz-data-backup.tar.gz -C /
```

## 🌐 Network configuration

### Traefik Reverse Proxy (Development)

The development environment uses **Traefik v3.1** as a reverse proxy to avoid port conflicts and provide clean URLs.

#### Services exposed via Traefik:

- **Frontend**: `http://frontend.quiz-master.localhost` → Container port 5173
- **Backend**: `http://backend.quiz-master.localhost` → Container port 3001
- **Traefik Dashboard**: `http://localhost:8080` → Admin interface

#### Benefits:
- ✅ No port binding conflicts
- ✅ Run multiple projects simultaneously
- ✅ Clean, semantic URLs
- ✅ Production-like reverse proxy setup
- ✅ Automatic service discovery

#### Traefik Configuration:

The `compose.yaml` includes Traefik with automatic Docker service discovery:

```yaml
services:
  traefik:
    image: traefik:v3.1
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
    ports:
      - "80:80"      # HTTP traffic
      - "8080:8080"  # Dashboard
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
```

#### Service Routing:

Services use Traefik labels for routing:

```yaml
services:
  backend:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`backend.quiz-master.localhost`)"
      - "traefik.http.services.backend.loadbalancer.server.port=3001"
  
  frontend:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`frontend.quiz-master.localhost`)"
      - "traefik.http.services.frontend.loadbalancer.server.port=5173"
```

#### Database Access:

PostgreSQL is not exposed externally. Use these methods:

```bash
# CLI access via docker exec
docker exec -it quiz-postgres psql -U quizapp -d quizdb

# Or use Makefile shortcut
make db-shell
```

#### Troubleshooting Traefik:

**Issue: Cannot access `*.quiz-master.localhost`**

Solution:
```bash
# 1. Check Traefik is running
docker ps | grep traefik

# 2. Check dashboard for routes
# Visit: http://localhost:8080
# Navigate to HTTP → Routers

# 3. Test DNS resolution (should resolve to 127.0.0.1)
ping frontend.quiz-master.localhost

# 4. Check service logs
docker logs quiz-traefik
```

**Issue: Frontend can't connect to backend**

Solution:
```bash
# Verify environment variable
docker exec quiz-frontend env | grep VITE_API_URL
# Should show: VITE_API_URL=http://backend.quiz-master.localhost

# Rebuild if needed
docker compose build frontend --no-cache
docker compose up -d frontend
```

### Ports used (Production without Traefik)

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
# Using deployment script (recommended)
./deploy.sh dev   # or ./deploy.sh prod

# Or manually:
# 1. Stop services
docker compose down

# 2. Get latest changes
git pull

# 3. Rebuild images with BuildKit
export DOCKER_BUILDKIT=1
docker compose build --no-cache

# 4. Restart
docker compose up -d

# 5. Check logs
docker compose logs -f
```

### Database migration

If you modify the database structure:

```bash
# 1. Backup
make backup

# 2. Stop backend
docker compose stop backend

# 3. Apply migrations
docker compose exec backend npx prisma migrate deploy

# 4. Restart
docker compose start backend
```

## ⚡ BuildKit Performance Tips

### Enable BuildKit (recommended)

```bash
# Enable permanently in your shell
echo 'export DOCKER_BUILDKIT=1' >> ~/.bashrc
echo 'export COMPOSE_DOCKER_CLI_BUILD=1' >> ~/.bashrc
source ~/.bashrc

# Or per-command
DOCKER_BUILDKIT=1 docker compose build
```

### Cache benefits

- **NPM cache mounts**: Dependencies aren't re-downloaded between builds
- **Layer caching**: Only changed layers are rebuilt
- **Parallel builds**: Multiple stages build concurrently
- **50-80% faster** rebuild times

### Image size comparison

| Image | Before | After | Savings |
|-------|--------|-------|---------|
| Backend | ~450 MB | ~180 MB | **60%** |
| Frontend | ~150 MB | ~45 MB | **70%** |

## 🐛 Troubleshooting

### "docker-compose: command not found"

You need Docker Compose V2:

```bash
# Linux
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Verify
docker compose version
```

### Containers won't start

```bash
# Check logs
docker compose logs

# Check container status
docker compose ps

# Rebuild from scratch
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

### Backend/frontend connection issues

```bash
# Check backend is accessible
curl http://localhost:3001/health/live

# Check network connections
docker network inspect quiz-app_quiz-network

# Restart network
docker compose down
docker compose up -d
```

### Permission issues with non-root users

The containers now run as non-root users:

```bash
# Fix backend permissions (if needed)
sudo chown -R 1001:1001 ./backend/data

# Fix frontend permissions (if needed)
sudo chown -R 101:101 ./frontend/dist
```

### Build cache not working

```bash
# Enable BuildKit
export DOCKER_BUILDKIT=1

# Rebuild with cache
docker compose build
```

### Corrupted database

```bash
# Restore from backup
make restore

# Or manually
docker compose exec -T postgres psql -U quizapp -d quizdb < backup.sql
docker compose restart backend

# Or delete and recreate
docker compose down -v
docker compose up -d
```

### Insufficient disk space

```bash
# Clean unused images
docker image prune -a

# Clean everything not in use
docker system prune -a --volumes

# See used space
docker system df

# Remove old build cache
docker builder prune -af
```

## 🚀 Production deployment

### Using deployment script

```bash
# Development
./deploy.sh dev

# Production
./deploy.sh prod
```

The script automatically:
- Validates configuration
- Backs up database
- Builds optimized images
- Runs health checks
- Shows deployment info

### With Docker Swarm

```bash
# Initialize Swarm
docker swarm init

# Deploy stack
docker stack deploy -c compose.prod.yaml quiz-app

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
kompose convert -f compose.yaml
```

## 📈 Monitoring

### With monitoring stack

```bash
# Start with monitoring
make monitoring-up

# Or manually
docker compose -f compose.yaml -f compose.monitoring.yaml up -d

# Access dashboards
# Grafana: http://localhost:3000 (admin/admin123)
# Prometheus: http://localhost:9090
```

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

Health checks are built into the Dockerfiles and compose files:

```bash
# Check container health
docker compose ps

# Check specific service health
curl http://localhost:3001/health/live   # Backend
curl http://localhost:5173                # Frontend (dev)
```

## 🔒 Security checklist

- [ ] Docker Compose V2 installed
- [ ] BuildKit enabled for optimized builds
- [ ] JWT_SECRET changed and secured
- [ ] Environment variables not committed
- [ ] HTTPS configured with valid certificates
- [ ] Firewall configured (ports 80, 443 only)
- [ ] Logs rotated and backed up
- [ ] Automatic database backups configured
- [ ] Admin passwords changed
- [ ] Rate limiting configured
- [ ] Docker images regularly updated
- [ ] Non-root users verified (nestjs:1001, nginx:101)
- [ ] Container security scanning enabled

## 📚 Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose V2 Documentation](https://docs.docker.com/compose/)
- [BuildKit Documentation](https://docs.docker.com/build/buildkit/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

**Updated**: November 4, 2025 - Docker Compose V2 Migration Complete