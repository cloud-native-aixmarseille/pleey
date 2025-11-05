---
sidebar_position: 3
---

# 🐳 Docker Guide - QuizMaster

Complete guide to the Docker setup and container management for QuizMaster.

:::tip Primary Interface
**Use `make` commands for all operations.** This guide shows the underlying Docker commands for reference and troubleshooting.
:::

## 📋 Prerequisites

- Docker (version 20.10+)
- Docker Compose V2 (version 2.0+)
- Make (usually pre-installed on Linux/macOS)

Check installations:
```bash
docker --version
docker compose version
make --version
```

### Install Docker Compose V2 (if needed)

```bash
# Linux
sudo apt-get update
sudo apt-get install docker-compose-plugin

# macOS (via Homebrew)
brew install docker-compose

# Verify installation
docker compose version
```

## 🚀 Getting Started

### Quick Setup (Recommended)

```bash
# 1. Clone and enter directory
git clone <repo-url> && cd quiz-app

# 2. Copy environment configuration
cp .env.example .env

# 3. Install everything
make install
```

The `make install` command handles:
- ✅ Environment setup
- ✅ Docker image building
- ✅ Service startup
- ✅ Database migrations
- ✅ Database seeding

### Access Points

After installation, access the application at:

- **Frontend**: http://frontend.quiz-master.localhost
- **Backend API**: http://backend.quiz-master.localhost
- **Traefik Dashboard**: http://localhost:8080
- **Health Check**: http://backend.quiz-master.localhost/api/health/live

:::info Traefik Reverse Proxy
This project uses **Traefik** for domain-based routing instead of port binding. The `.localhost` TLD automatically resolves to `127.0.0.1` (RFC 6761). No hosts file configuration needed!
:::

## 📋 Essential Make Commands

All Docker operations are simplified through `make` targets:

### Daily Operations

```bash
make up              # Start all services
make down            # Stop all services
make restart         # Restart all services
make ps              # Check services status
make logs            # View real-time logs (all services)
make logs-backend    # View backend logs only
make logs-frontend   # View frontend logs only
```

:::info Advanced
Use `make logs SERVICE=<name>` to target any service without relying on predefined aliases.
:::

### Development Tasks

```bash
make build           # Build Docker images
make rebuild         # Rebuild images and restart
make seed            # Seed database with sample data
make shell-backend   # Access backend container shell
make shell-frontend  # Access frontend container shell
make db-shell        # Access PostgreSQL shell
```

:::info Advanced
`make shell SERVICE=<name>` is available when you want a single command that works for any container.
:::

### Maintenance

```bash
make clean           # Clean up (keep data volumes)
make clean-all       # Deep clean (removes all data)
make backup          # Backup PostgreSQL database
make restore         # Restore latest backup
make health          # Check application health
```

### Complete Command List

```bash
make help            # Display all available commands
```

## 📁 Docker Architecture

### File Structure

```
quiz-app/
├── compose.yaml                # Main services configuration
├── compose.prod.yaml           # Production overrides
├── compose.monitoring.yaml     # Monitoring stack (optional)
├── .env.example               # Environment variables template
├── Makefile                   # Make commands (primary interface)
│
├── backend/
│   ├── Dockerfile            # Multi-stage NestJS build
│   ├── .dockerignore
│   ├── src/
│   ├── prisma/
│   └── package.json
│
└── frontend/
    ├── Dockerfile            # Multi-stage React + Nginx build
    ├── .dockerignore
    ├── nginx.conf           # Development Nginx config
    ├── nginx.prod.conf      # Production Nginx config
    ├── src/
    └── package.json
```

### Services Overview

The application runs 5 services:

| Service | Purpose | Exposed |
|---------|---------|---------|
| **traefik** | Reverse proxy & routing | Dashboard: :8080 |
| **backend** | NestJS API + WebSockets | Via Traefik |
| **frontend** | React app (dev/prod) | Via Traefik |
| **postgres** | PostgreSQL 16 database | Internal only |
| **otel-collector** | OpenTelemetry collector | Internal only |

### Multi-Stage Dockerfiles

Both backend and frontend use optimized multi-stage builds:

**Backend Stages:**
- `base` - Common dependencies layer
- `development` - Dev with hot-reload
- `builder` - TypeScript compilation
- `production` - Optimized (~180MB)
- `ci` - Testing environment

**Frontend Stages:**
- `base` - Common dependencies layer
- `development` - Vite dev server with HMR
- `builder` - Production build
- `production` - Nginx serving (~45MB)
- `ci` - Testing environment

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

## 🔧 Advanced Operations

### Database Management

```bash
# Apply migrations
make shell-backend
npm run db:migrate

# Seed database
make seed

# Access database shell
make db-shell

# Backup database
make backup

# Restore database
make restore
```

:::tip Direct Commands
If you prefer Docker commands directly:

```bash
# Migrations
docker compose exec backend npx prisma migrate deploy

# Seed
docker compose exec backend npm run seed

# Database shell
docker compose exec postgres psql -U quizapp -d quizdb
```
:::

### Prisma Operations

```bash
# Generate Prisma Client
docker compose exec backend npx prisma generate

# View database in Prisma Studio
docker compose exec backend npx prisma studio
```

### Viewing Logs

```bash
# All services
make logs

# Specific service
make logs-backend
make logs-frontend

# Follow logs with filtering
docker compose logs -f backend | grep ERROR

# Last 100 lines
docker compose logs --tail 100 backend
```

### Resource Monitoring

```bash
# Real-time resource usage
docker stats

# Service status
make ps

# Detailed service info
docker compose ps --all
```

## 🔐 Production Deployment

### Production Configuration

```bash
# Build images with production optimisations
make build

# Use production overrides
docker compose -f compose.yaml -f compose.prod.yaml up -d
```

### Security Checklist

- ✅ **Change JWT_SECRET**: Generate with `openssl rand -base64 32`
- ✅ **Use HTTPS**: Configure SSL/TLS certificates
- ✅ **Update passwords**: Change default admin password
- ✅ **Enable firewall**: Restrict access to necessary ports only
- ✅ **Resource limits**: Apply CPU and memory constraints
- ✅ **Regular backups**: Schedule automated database backups

### Resource Limits (Production)

The `compose.prod.yaml` includes resource constraints:

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

## 📊 Data Persistence

### Volumes Used

- **postgres-data**: PostgreSQL database (persistent)
- **backend-node-modules**: Backend dependencies (development only)
- **frontend-node-modules**: Frontend dependencies (development only)

### Volume Management

```bash
# List volumes
docker volume ls | grep quiz

# Inspect volume
docker volume inspect quiz-app_postgres-data

# Remove unused volumes
docker volume prune
```

:::warning Data Loss
`make clean-all` removes all volumes including the database. Use `make clean` to preserve data.
:::

## 🌐 Networking

### Traefik Reverse Proxy (Development)

The development environment uses **Traefik v3.1** as a reverse proxy.

**Benefits:**
- ✅ No port binding conflicts
- ✅ Clean, semantic URLs
- ✅ Run multiple projects simultaneously
- ✅ Production-like setup
- ✅ Automatic service discovery

**Access Points:**
- Frontend: `http://frontend.quiz-master.localhost`
- Backend: `http://backend.quiz-master.localhost`
- Traefik Dashboard: `http://localhost:8080`

:::info DNS Resolution
The `.localhost` TLD automatically resolves to `127.0.0.1` (RFC 6761). No hosts file configuration needed!
:::

### Service Discovery

Traefik automatically discovers services using Docker labels:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.backend.rule=Host(`backend.quiz-master.localhost`)"
  - "traefik.http.services.backend.loadbalancer.server.port=3001"
```

### Database Access

PostgreSQL is not exposed externally. Access via:

```bash
# Using Make command (recommended)
make db-shell

# Or Docker directly
docker compose exec postgres psql -U quizapp -d quizdb
```
```

## 🔐 Production security

### 1. Use production compose file

```bash
# Production deployment
docker compose -f compose.yaml -f compose.prod.yaml up -d
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
# Using Make command (recommended)
make update

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

### Services Not Starting

```bash
# Check all service logs
make logs

# Check specific service
make logs-backend
make logs-frontend

# Check service status
make ps

# Rebuild from scratch
make clean-all
make install
```

### Cannot Access Application

**Issue: `*.quiz-master.localhost` not accessible**

```bash
# 1. Verify Traefik is running
make ps | grep traefik

# 2. Check Traefik dashboard
# Open: http://localhost:8080
# Navigate to HTTP → Routers

# 3. Test DNS resolution (should return 127.0.0.1)
ping frontend.quiz-master.localhost

# 4. View Traefik logs
make logs | grep traefik
```

**Issue: Frontend can't connect to backend**

```bash
# Verify backend API URL environment variable
docker compose exec frontend env | grep VITE_API_URL
# Should show: VITE_API_URL=http://backend.quiz-master.localhost

# If incorrect, rebuild frontend
docker compose build frontend --no-cache
make restart
```

### Database Issues

```bash
# Check database is running
make ps | grep postgres

# Access database shell
make db-shell

# Reset database (⚠️ deletes all data)
make clean-all
make install
```

### Permission Errors

Containers run as non-root users (UID 1000:1000). If you encounter permission issues:

```bash
# Fix ownership of volumes
docker compose down -v
sudo chown -R 1000:1000 backend/data
make up
```

### Performance Issues

```bash
# View resource usage
docker stats

# Check available disk space
df -h

# Clean up unused Docker resources
docker system prune -a
```

## 🔄 Updates and Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
make rebuild

# Check everything is working
make ps
make health
```

### Database Migrations

```bash
# Migrations are automatically applied by `make seed`
# Or run manually:
docker compose exec backend npx prisma migrate deploy

# Check migration status
docker compose exec backend npx prisma migrate status
```

### Backup and Restore

```bash
# Create backup
make backup
# Creates: backups/quiz-backup-YYYYMMDD-HHMMSS.sql

# Restore latest backup
make restore

# Restore specific backup
docker compose exec -T postgres psql -U quizapp -d quizdb < backups/quiz-backup-20241104-210000.sql
make restart
```

## 📚 Reference: Docker Compose Commands

:::tip Use Make Commands
While these Docker Compose commands work, **use `make` commands** for simpler, consistent operations.
:::

### If You Need Docker Compose Directly

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f [service_name]

# Rebuild service
docker compose build [service_name] --no-cache

# Restart service
docker compose restart [service_name]

# Execute command in service
docker compose exec [service_name] [command]

# Service status
docker compose ps

# Validate configuration
docker compose config
```

### Monitoring Stack (Optional)

```bash
# Start with monitoring
make monitoring-up

# Access monitoring tools
make grafana      # Opens Grafana (admin/admin123)
make prometheus   # Opens Prometheus

# View monitoring logs
make monitoring-logs

# Stop monitoring
make monitoring-down
```

## 🎓 Best Practices

### Development Workflow

1. **Start your day**: `make up`
2. **View logs**: `make logs`
3. **Make changes**: Edit code (hot-reload enabled)
4. **Test changes**: Changes reflect immediately
5. **Reset database**: `make seed` (if needed)
6. **End your day**: `make down`

### When Things Go Wrong

1. **Check logs**: `make logs` or `make logs-backend`
2. **Check status**: `make ps`
3. **Restart services**: `make restart`
4. **Full reset**: `make clean-all && make install`

### Performance Tips

- **Use BuildKit**: Already enabled in project
- **Keep Docker images updated**: `docker system prune -a` monthly
- **Monitor resources**: `docker stats`
- **Backup regularly**: `make backup`

## 📖 Related Documentation

- **[Quick Reference](quick-reference)** - Command cheat sheet
- **[Architecture](architecture/index)** - System architecture
- **[Deployment](deployment)** - Production deployment guide
- **[Monitoring](monitoring)** - Monitoring and observability
- **[Security](security)** - Security best practices

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

### Standard Docker Compose flow

```bash
# Build images (optional when using BuildKit cache)
make build

# Launch with production overrides
docker compose -f compose.yaml -f compose.prod.yaml up -d
```

Recommended manual steps after the stack is running:
- Validate `.env` (especially `JWT_SECRET`, database credentials, telemetry endpoints)
- Run `make backup` before major upgrades
- Watch container start logs: `make logs` or `docker compose logs --tail=100`
- Verify health endpoints (`curl http://backend.quiz-master.localhost/api/health`)
- Confirm the frontend is accessible via Traefik (`http://frontend.quiz-master.localhost`)

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