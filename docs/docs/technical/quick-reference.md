---
sidebar_position: 10
---

# ⚡ QuizMaster - Quick Reference Guide

Fast reference for all essential development commands.

:::tip Primary Interface
**Use `make` commands for all operations.** They provide a simpler, consistent interface to the underlying Docker and npm commands.
:::

## 🚀 Quick Start

### First-Time Installation

```bash
git clone <repo-url> && cd quiz-app
cp .env.example .env
make install
```

**Access:**
- Frontend: http://frontend.quiz-master.localhost
- Backend: http://backend.quiz-master.localhost
- Traefik Dashboard: http://localhost:8080
- Admin: admin@quiz.com / admin123

---

## 📋 Essential Make Commands

### Daily Operations

```bash
make up                # Start all services
make down              # Stop all services
make restart           # Restart all services
make ps                # Check services status
make logs              # View real-time logs (all)
make logs-backend      # View backend logs only
make logs-frontend     # View frontend logs only
```

### Development

```bash
make install           # Complete installation (first time)
make build             # Build Docker images
make rebuild           # Rebuild images and restart
make seed              # Seed database with sample data
make shell-backend     # Access backend container shell
make shell-frontend    # Access frontend container shell
make db-shell          # Access PostgreSQL database shell
```

### Maintenance

```bash
make clean             # Clean up (keep data volumes)
make clean-all         # Deep clean (⚠️ removes all data)
make backup            # Backup PostgreSQL database
make restore           # Restore latest backup
make health            # Check application health
make help              # Display all available commands
```

### Monitoring (Optional)

```bash
make monitoring-up     # Start with monitoring stack
make monitoring-down   # Stop monitoring
make grafana           # Open Grafana dashboard
make prometheus        # Open Prometheus
```

### Documentation

```bash
make docs              # Open Docusaurus documentation
```

---

## 🎯 Common Workflows

### Starting Your Day

```bash
make up                # Start everything
make logs              # Check if everything is running
```

### Making Code Changes

```bash
# Just edit code - hot-reload is enabled!
# View logs to see changes:
make logs-backend      # For backend changes
make logs-frontend     # For frontend changes
```

### Resetting Database

```bash
make seed              # Applies migrations + seeds data
```

### Full Reset

```bash
make clean-all         # Remove everything (including data)
make install           # Fresh installation
```

### Debugging Issues

```bash
make ps                # Check service status
make logs              # Check all logs
make logs-backend      # Check backend logs
make health            # Test health endpoints
```

---

## � Service Access

### Application URLs

- **Frontend**: http://frontend.quiz-master.localhost
- **Backend API**: http://backend.quiz-master.localhost
- **Traefik Dashboard**: http://localhost:8080
- **Health Check**: http://backend.quiz-master.localhost/api/health/live

### Default Credentials

- **Admin Email**: admin@quiz.com
- **Admin Password**: admin123

:::warning Change Password
Change the admin password after first login!
:::

---

## 🗄️ Database Operations

### Using Make Commands (Recommended)

```bash
make db-shell          # Access PostgreSQL shell
make seed              # Apply migrations + seed data
make backup            # Create database backup
make restore           # Restore latest backup
```

### Direct Prisma Commands

```bash
# Access backend container first
make shell-backend

# Then run Prisma commands:
npx prisma migrate deploy    # Apply migrations
npx prisma generate          # Generate Prisma Client
npx prisma studio            # Open Prisma Studio
npm run seed                 # Seed database
```

---

## 📊 Monitoring & Debugging

### Check Service Status

```bash
make ps                # Service status
docker stats           # Resource usage
make health            # Application health check
```

### View Logs

```bash
make logs              # All services
make logs-backend      # Backend only
make logs-frontend     # Frontend only

# Follow specific service logs
docker compose logs -f backend | grep ERROR
```

### Container Shell Access

```bash
make shell-backend     # Backend container
make shell-frontend    # Frontend container
make db-shell          # PostgreSQL database
```

---

## 🔧 Advanced Operations

:::tip Prefer Make Commands
These Docker commands work but `make` commands are simpler and more consistent.
:::

### Docker Compose Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Rebuild specific service
docker compose build backend --no-cache
docker compose up -d backend

# Execute command in service
docker compose exec backend npm run test

# View service status
docker compose ps

# Validate configuration
docker compose config
```

### Docker Cleanup

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes (⚠️ deletes data)
docker volume prune

# Clean everything (⚠️ deletes all data)
docker system prune -a --volumes
```

---

## 📁 Project Structure

```
quiz-app/
├── Makefile                   # Primary command interface
├── compose.yaml               # Docker services configuration
├── .env.example              # Environment template
│
├── backend/
│   ├── src/                   # NestJS source code
│   │   ├── domain/           # Domain layer (DDD)
│   │   ├── application/      # Use cases
│   │   ├── infrastructure/   # External services
│   │   └── main.ts          # Entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Database migrations
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # React application
│   │   ├── main.jsx
│   │   ├── domains/          # Domain logic (DDD)
│   │   ├── features/         # Feature modules
│   │   └── shared/           # Shared components
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── monitoring/
│   ├── prometheus.yml
│   ├── loki-config.yml
│   └── promtail-config.yml
│
├── compose.yaml         # Dev composition
├── compose.prod.yaml    # Production composition
├── compose.monitoring.yaml
├── .env.example               # Environment variables
├── Makefile                   # Simplified commands
├── deploy.sh                  # Deployment script
├── setup-ssl.sh               # SSL configuration
└── README.md                  # Documentation
```

---

## 🔧 Environment variables

```bash
# .env
JWT_SECRET=your_super_secret_key_change_me_in_production
NODE_ENV=production
PORT=3001
```

**Generate a JWT secret:**
```bash
openssl rand -base64 32
```

---

## 🔐 Default accounts

### Admin
- Email: `admin@quiz.com`
- Password: `admin123`
- ⚠️ **Change in production!**

### Grafana (if monitoring)
- URL: http://localhost:3000
- User: `admin`
- Password: `admin123`

---

## 📊 Important URLs

| Service | Dev URL | Prod URL |
|---------|---------|----------|
| Frontend | http://localhost:5173 | http://localhost |
| Backend | http://localhost:3001 | http://localhost:3001 |
| Health Check | http://localhost:3001/health | |
| Grafana | http://localhost:3000 | |
| Prometheus | http://localhost:9090 | |
| cAdvisor | http://localhost:8080 | |

---

## 🛠️ Deployment

### Development
```bash
docker compose up -d
```

### Production
```bash
./deploy.sh prod
# or
docker compose -f compose.prod.yaml up -d
```

### With SSL
```bash
./setup-ssl.sh your-domain.com email@example.com
./deploy.sh prod
```

---

## 💾 Backup & Restore

### Manual backup
```bash
make backup
# or
docker compose exec db pg_dump -U quizuser quizdb > backup-$(date +%Y%m%d).sql
```

### Automatic backup (cron)
```bash
# Add to crontab
0 3 * * * cd /path/to/quiz-app && docker compose exec db pg_dump -U quizuser quizdb > /path/to/backups/quiz-$(date +\%Y\%m\%d).sql 2>&1
```

### Restore
```bash
make restore
# or
docker compose exec -T db psql -U quizuser -d quizdb < backup.sql
```

---

## 🔍 Debugging

### Logs

```bash
# All logs
make logs

# Backend only
docker compose logs -f backend

# Errors only
docker compose logs | grep -i error

# Last 100 lines
docker compose logs --tail=100

# From a date
docker compose logs --since="2024-01-01T00:00:00"
```

### Check health

```bash
# Health check
curl http://localhost:3001/health

# Container status
docker compose ps

# Resource usage
docker stats

# Complete script
make health
```

### Access database

```bash
# Via Make
make db

# Or manually
docker compose exec db psql -U quizuser -d quizdb

# PostgreSQL commands
\dt                              # List tables
\d users                         # Table schema
SELECT * FROM users;             # Query
SELECT COUNT(*) FROM quizzes;    # Count
\q                               # Exit
```

---

## 🚨 Troubleshooting

### Services Not Starting

```bash
# Check status
make ps

# View logs
make logs

# Full reset
make clean-all
make install
```

### Cannot Access Application

**Problem: `*.quiz-master.localhost` URLs not working**

```bash
# Check Traefik is running
make ps | grep traefik

# View Traefik dashboard
# Open: http://localhost:8080

# Test DNS resolution
ping frontend.quiz-master.localhost
# Should resolve to 127.0.0.1

# Restart Traefik
docker compose restart traefik
```

### Backend Not Responding

```bash
# Check backend logs
make logs-backend

# Check health endpoint
curl http://backend.quiz-master.localhost/api/health/live

# Restart backend
docker compose restart backend

# Rebuild if needed
docker compose build backend --no-cache
make restart
```

### Frontend Not Loading

```bash
# Check frontend logs
make logs-frontend

# Verify environment variables
docker compose exec frontend env | grep VITE_API_URL
# Should show: VITE_API_URL=http://backend.quiz-master.localhost

# Rebuild if needed
docker compose build frontend --no-cache
make restart
```

### Database Issues

```bash
# Check database status
make ps | grep postgres

# Access database
make db-shell

# Reset database (⚠️ deletes all data)
make clean-all
make install
```

### WebSocket Not Working

```bash
# Check backend is listening
docker compose exec backend netstat -an | grep 3001

# Check WebSocket configuration in frontend
# Verify VITE_API_URL is set correctly

# Restart services
make restart
```

### Port Conflicts

:::info No Port Conflicts with Traefik
Traefik eliminates port conflicts by using domain-based routing. Only port 80 and 8080 are exposed.
:::

```bash
# If port 80 is in use:
sudo lsof -i :80
sudo kill -9 <PID>

# Or stop conflicting service
sudo systemctl stop nginx  # if another nginx is running
```

### Memory / Performance Issues

```bash
# Check resource usage
docker stats

# Clean up Docker
docker system prune -a

# Restart Docker
sudo systemctl restart docker
make up
```

---

## � Security Checklist

### Pre-Production

- [ ] Change JWT_SECRET in `.env`
- [ ] Change admin password (admin@quiz.com)
- [ ] Configure HTTPS/SSL
- [ ] Enable firewall (ports 80, 443 only)
- [ ] Verify `.env` is not in git
- [ ] Enable rate limiting
- [ ] Configure automated backups
- [ ] Set up monitoring

### Configure Firewall

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

### Key metrics

```bash
# CPU, RAM, Disk
docker stats

# HTTP requests
curl http://localhost:9090/api/v1/query?query=rate(http_requests_total[5m])

# Active users
curl http://localhost:9090/api/v1/query?query=websocket_connections_active
```

### Grafana Dashboards

1. Import Docker dashboard (ID: 193)
2. Import Node Exporter dashboard (ID: 1860)
3. Create custom dashboard for QuizMaster

---

## 🔄 Update

```bash
# Simple method
make update

# Or manual
make backup
git pull
docker compose build --no-cache
docker compose up -d
```

---

## 📚 Complete documentation

- [Documentation Home](../functional/intro) - Overview
- [Docker Guide](docker-guide) - Docker guide
- [Monitoring Guide](monitoring) - Monitoring
- [Deployment Checklist](deployment) - Deployment
- [Architecture](architecture) - Architecture
- See main repository for CONTRIBUTING.md

---

## 🆘 Support

### Diagnostic order

1. Check logs: `make logs`
2. Check health check: `make health`
3. Check resources: `docker stats`
4. Consult documentation
5. Search in GitHub issues
6. Create new issue

### Information to provide for support

```bash
# Docker version
docker --version
docker compose --version

# Operating system
uname -a

# Logs
docker compose logs --tail=100

# Configuration
cat compose.yaml

# Status
docker compose ps
```

---

## ⚡ Pro tips

### Useful aliases

Add to `~/.bashrc` or `~/.zshrc`:

```bash
alias dcu='docker compose up -d'
alias dcd='docker compose down'
alias dcl='docker compose logs -f'
alias dcp='docker compose ps'
alias dcr='docker compose restart'
alias qm='cd /path/to/quiz-app'
```

### Watch mode for logs

```bash
# Follow errors in real-time
watch -n 1 'docker compose logs --tail=20 | grep -i error'
```

### Quick backup before changes

```bash
# One-liner
docker exec quiz-backend cat /app/data/quiz.db > backup-before-change.db && echo "Backup OK"
```

### Performance test

```bash
# Apache Bench
ab -n 1000 -c 10 http://localhost:3001/api/health

# Wrk
wrk -t12 -c400 -d30s http://localhost:3001/api/health
```

---

## 📞 Contacts

- **Issues**: https://github.com/OWNER/quiz-app/issues
- **Discussions**: https://github.com/OWNER/quiz-app/discussions
- **Email**: support@example.com

---

**Last updated**: October 2024