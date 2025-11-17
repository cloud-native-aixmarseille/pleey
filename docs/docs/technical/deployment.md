---
sidebar_position: 7
---

# ✅ Deployment Checklist - QuizMaster

Comprehensive guide to deploy QuizMaster to production securely.

## 🚀 Deployment

### Core workflow

```bash
# 1. Clone and prepare configuration
git clone <repo-url> && cd quiz-app
cp .env.example .env
${EDITOR:-nano} .env  # Update JWT_SECRET and production env vars

# 2. Build production images (optional if CI delivers them)
docker compose logs --tail=100

# 3. Start the stack with production overrides
docker compose -f compose.yaml -f compose.prod.yaml up -d

# 4. Verify services
make ps
docker compose logs -f backend
docker compose logs -f frontend

Deployment checklist:
docker compose logs | grep -i error
- [ ] `.env` kept out of version control
- [ ] Backups available before upgrades (`make backup`)
- [ ] Health checks return HTTP 200

### SSL/HTTPS

docker compose exec -T postgres psql -U ${POSTGRES_USER:-quizapp} -d ${POSTGRES_DB:-quizdb} < backup.sql
docker compose restart backend
- [ ] `nginx/ssl/fullchain.pem` and `nginx/ssl/privkey.pem` populated
- [ ] `application/frontend/nginx.prod.conf` updated with your domain name
- [ ] HTTPS validated: `curl -I https://your-domain.com`
- [ ] Renewal in place (Certbot cron, managed certificates, or reverse proxy automation)

### Firewall
# Install UFW
sudo apt install ufw
docker compose logs -f backend
docker compose logs -f frontend
# Configure rules
docker compose logs | grep -i error
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable
sudo ufw enable
sudo ufw status
```
  docker compose restart backend
### Users and passwords

- [ ] Change the application admin password
- [ ] Change the Grafana password (if monitoring is enabled)
- [ ] Disable test/development accounts
- [ ] Use strong passwords (16+ characters)

## � Post-deployment checks

### Services

- [ ] Backend responds: `curl http://localhost:3001/api/health`
- [ ] Frontend accessible: `curl http://localhost`
- [ ] WebSocket works (test a quiz)
- [ ] Database created: `docker exec quiz-backend ls -la /app/data/`

### Performance

```bash
# Check resource usage
docker stats

# Logs without errors
docker compose logs --tail=100

# Response time
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/api/health
```

Create `curl-format.txt`:
```
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_appconnect:  %{time_appconnect}\n
time_pretransfer:  %{time_pretransfer}\n
time_redirect:  %{time_redirect}\n
time_starttransfer:  %{time_starttransfer}\n
time_total:  %{time_total}\n
```

### Security

- [ ] HTTPS works (valid certificate)
- [ ] Security headers present
- [ ] No sensitive data in logs
- [ ] Firewall active: `sudo ufw status`
- [ ] Containers don't run as root

### Database

```bash
# Check database connection
docker compose exec backend npx prisma db pull

# Run migrations
docker compose exec backend npx prisma migrate deploy

# Access PostgreSQL
docker compose exec postgres psql -U ${POSTGRES_USER:-quizapp} -d ${POSTGRES_DB:-quizdb}

# Check tables
\dt

# Check user count
SELECT COUNT(*) FROM users;

# Exit
\q
```

## 📊 Monitoring (Optional)

- [ ] Start monitoring: `make monitoring-up`
- [ ] Access Grafana: http://localhost:3000
- [ ] Configure alerts
- [ ] Test notifications
- [ ] Create dashboards

## 💾 Backups

### Automated configuration

```bash
# Create backup script
cat > /usr/local/bin/backup-quizmaster.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/quizmaster"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
docker exec quiz-backend cat /app/data/quiz.db > $BACKUP_DIR/quiz-$DATE.db

# Backup .env
cp /path/to/quiz-app/.env $BACKUP_DIR/env-$DATE

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "quiz-*.db" -mtime +30 -delete

# Log
echo "$DATE: Backup completed" >> $BACKUP_DIR/backup.log
EOF

chmod +x /usr/local/bin/backup-quizmaster.sh

# Add to cron (daily at 3am)
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/local/bin/backup-quizmaster.sh") | crontab -
```

### Manual backup

```bash
# Create a backup now
make backup

# Or manually
docker exec quiz-backend cat /app/data/quiz.db > backup-$(date +%Y%m%d).db
```

### Restore

```bash
# Restore latest backup
make restore

# Or manually
docker compose exec -T postgres psql -U ${POSTGRES_USER:-quizapp} -d ${POSTGRES_DB:-quizdb} < backup.sql
docker compose restart backend
```

## 🔄 Updates

### Application update

```bash
# Simple method
make update

# Or manual
make backup
git pull
docker compose -f compose.yaml -f compose.prod.yaml build --no-cache
docker compose -f compose.yaml -f compose.prod.yaml up -d
docker compose logs -f
```

### Dependencies update

```bash
# Update Docker images
docker compose pull
docker compose up -d
```

## 📈 Optimizations

### Performance

- [ ] Enable gzip compression (already in nginx.conf)
- [ ] Configure browser cache
- [ ] Limit container resources
- [ ] Use CDN for static assets
- [ ] Optimize images (compression)

### Scalability

```yaml
# compose.prod.yaml
services:
  backend:
    deploy:
      replicas: 3  # 3 backend instances
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

## 🚨 Troubleshooting

### Backend won't start

```bash
# Check logs
make logs SERVICE=backend

# Check permissions
docker exec -it quiz-backend ls -la /app/data

# Recreate container
docker compose down
docker compose up -d
```

### SSL certificate expired

- Re-issue certificates with your ACME provider (Certbot, Traefik, Caddy, etc.)
- Replace `nginx/ssl/fullchain.pem` and `nginx/ssl/privkey.pem`
- Reload the stack: `docker compose restart frontend`

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
# Check usage
docker stats

# Increase limits or free memory
docker system prune -a
```

## 📞 Support and maintenance

### Centralized logs

```bash
# All logs
make logs

# Specific logs
docker compose logs -f backend
docker compose logs -f frontend

# Errors only
docker compose logs | grep -i error
```

### Continuous monitoring

```bash
# Create health check script
cat > /usr/local/bin/check-quizmaster.sh << 'EOF'
#!/bin/bash
if ! curl -sf http://localhost:3001/api/health > /dev/null; then
    echo "Backend DOWN! Restarting..."
  docker compose restart backend
    # Send alert (email, Slack, etc.)
fi
EOF

# Run every 5 minutes
*/5 * * * * /usr/local/bin/check-quizmaster.sh
```

## 🎉 Launch

### Final checklist

- [ ] All tests pass
- [ ] SSL configured and tested
- [ ] Automated backups in place
- [ ] Monitoring active
- [ ] Alerts configured
- [ ] Documentation up to date
- [ ] Passwords changed
- [ ] Firewall enabled
- [ ] Logs verified
- [ ] Performance tested

### Communication

- [ ] Announce production deployment
- [ ] Provide URLs
- [ ] Document test accounts
- [ ] Prepare user guide
- [ ] Set up support channel

## 📚 Documentation

- [Documentation Home](../functional/intro) - General guide
- [Docker Guide](docker-guide) - Docker guide
- [Monitoring Guide](monitoring) - Monitoring guide
- [Deployment Checklist](deployment) - This checklist

## 🆘 Contacts

- Issues: GitHub Issues
- Email: support@example.com
- Documentation: https://docs.example.com