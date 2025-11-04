---
sidebar_position: 10
---

# ⚡ QuizMaster - Quick Reference Guide

Ultra-fast guide for all essential commands.

## 🚀 Quick start

### Installation in 3 commands

```bash
git clone <repo-url> && cd quiz-app
cp .env.example .env
make install
```

**Access:**
- Frontend: http://localhost
- Backend: http://localhost:3001
- Admin: admin@quiz.com / admin123

---

## 📋 Make commands

```bash
make help              # List all commands
make install           # Complete installation (first time)
make up                # Start application
make down              # Stop application
make restart           # Restart
make logs              # View logs (real-time)
make ps                # Container status
make build             # Build images
make rebuild           # Rebuild and restart
make backup            # Backup database
make restore           # Restore latest backup
make clean             # Clean (keep data)
make clean-all         # Delete everything (⚠️ data included)
make health            # Check app status
make shell-backend     # Access backend shell
make shell-frontend    # Access frontend shell
make db                # Access PostgreSQL database
make monitoring-up     # Start with monitoring
make grafana           # Open Grafana
make prometheus        # Open Prometheus
make docs              # Open documentation (Docusaurus)
```

---

## 🐳 Docker commands

### Container management

```bash
# Start
docker compose up -d

# Stop
docker compose down

# Restart
docker compose restart

# View logs
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend

# Status
docker compose ps

# Real-time stats
docker stats

# Rebuild
docker compose build --no-cache
docker compose up -d --force-recreate
```

### Debug

```bash
# Shell in a container
docker exec -it quiz-backend sh
docker exec -it quiz-frontend sh

# View processes
docker compose top

# Inspect a container
docker inspect quiz-backend

# Copy files
docker cp file.txt quiz-backend:/app/
docker cp quiz-backend:/app/backup.sql ./backup.sql
```

### Cleanup

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Clean everything
docker system prune -a --volumes
```

---

## 📁 File structure

```
quiz-app/
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

## 🚨 Common issues

### Backend won't start

```bash
# Check logs
docker compose logs backend

# Recreate container
docker compose down
docker compose up -d

# Check permissions
docker exec quiz-backend ls -la /app/data
```

### Frontend doesn't load

```bash
# Check Nginx
docker compose logs frontend

# Rebuild
docker compose build frontend --no-cache
docker compose up -d frontend
```

### WebSocket not working

```bash
# Check backend is listening
netstat -tlnp | grep 3001

# Check active connections
docker exec quiz-backend netstat -an | grep 3001

# Test manually
wscat -c ws://localhost:3001/socket.io/?transport=websocket
```

### Error "Port already in use"

```bash
# Find which process is using the port
sudo lsof -i :3001
sudo lsof -i :80

# Stop the process
sudo kill -9 <PID>

# Or change port in compose.yaml
```

### Corrupted database

```bash
# Restore a backup
make restore

# Or recreate
docker compose down -v
docker compose up -d
```

### Insufficient memory

```bash
# Free memory
docker system prune -a

# See usage
docker stats

# Limit resources in compose.yaml
deploy:
  resources:
    limits:
      memory: 512M
```

---

## 🔒 Security

### Pre-production checklist

- [ ] JWT_SECRET changed
- [ ] Admin passwords changed
- [ ] SSL/HTTPS configured
- [ ] Firewall enabled (ports 80, 443 only)
- [ ] `.env` not committed
- [ ] Logs don't contain sensitive data
- [ ] Automatic backups configured
- [ ] Monitoring enabled
- [ ] Rate limiting configured

### Configure firewall

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