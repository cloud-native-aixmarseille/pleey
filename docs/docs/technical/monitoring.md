---
sidebar_position: 8
---

# 📊 Guide de Monitoring - QuizMaster

Guide complet pour le monitoring et l'observabilité de l'application QuizMaster.

## 🎯 Stack de monitoring

- **Prometheus** : Collecte des métriques
- **Grafana** : Visualisation et dashboards
- **Loki** : Agrégation des logs
- **Promtail** : Collecte des logs
- **Node Exporter** : Métriques système
- **cAdvisor** : Métriques Docker

## 🚀 Installation

### Démarrage avec monitoring

```bash
# Démarrer l'application avec monitoring
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d

# Ou avec le Makefile
make monitoring-up
```

### Accès aux interfaces

- **Grafana** : http://localhost:3000 (admin/admin123)
- **Prometheus** : http://localhost:9090
- **cAdvisor** : http://localhost:8080
- **Loki** : http://localhost:3100

## 📈 Métriques collectées

### Métriques Backend (Node.js)

- Requêtes HTTP (total, erreurs, latence)
- WebSocket connexions actives
- Utilisateurs connectés
- Quiz en cours
- Performance base de données
- Utilisation mémoire/CPU

### Métriques Système (Node Exporter)

- CPU utilisation
- Mémoire (utilisée, disponible)
- Disque (I/O, espace)
- Réseau (trafic, erreurs)
- Charge système

### Métriques Docker (cAdvisor)

- Utilisation CPU par conteneur
- Mémoire par conteneur
- Réseau par conteneur
- Disque par conteneur
- Performance globale

## 📊 Configuration Grafana

### 1. Première connexion

```
URL: http://localhost:3000
User: admin
Pass: admin123
```

Changez immédiatement le mot de passe !

### 2. Ajouter Prometheus comme source de données

1. Configuration → Data Sources
2. Add data source → Prometheus
3. URL : `http://prometheus:9090`
4. Save & Test

### 3. Ajouter Loki pour les logs

1. Configuration → Data Sources
2. Add data source → Loki
3. URL : `http://loki:3100`
4. Save & Test

### 4. Importer des dashboards

**Dashboard Docker :**
- Dashboard ID: 193 (pour cAdvisor)
- Ou créer un custom dashboard

**Dashboard Node Exporter :**
- Dashboard ID: 1860
- Source de données : Prometheus

## 🔍 Requêtes Prometheus utiles

### Performance Backend

```promql
# Taux de requêtes par seconde
rate(http_requests_total[5m])

# Latence moyenne
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# Taux d'erreur
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# Utilisateurs connectés
websocket_connections_active
```

### Ressources système

```promql
# CPU utilisation
100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Mémoire disponible
node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100

# Disque libre
node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} * 100
```

### Docker conteneurs

```promql
# CPU par conteneur
rate(container_cpu_usage_seconds_total[5m])

# Mémoire par conteneur
container_memory_usage_bytes

# Réseau reçu
rate(container_network_receive_bytes_total[5m])
```

## 📝 Logs avec Loki

### Requêtes LogQL utiles

```logql
# Tous les logs du backend
{container="quiz-backend"}

# Erreurs uniquement
{container="quiz-backend"} |= "error" or "ERROR"

# Logs des 5 dernières minutes
{container="quiz-backend"} [5m]

# Taux d'erreurs
rate({container="quiz-backend"} |= "error" [5m])

# Recherche de pattern
{container="quiz-backend"} |~ "user.*login"
```

## 🚨 Alertes (Configuration avancée)

### Créer une alerte dans Grafana

1. Créer un dashboard avec une requête
2. Edit Panel → Alert tab
3. Configurer les conditions
4. Définir les notifications

### Exemples d'alertes

**Backend down :**
```promql
up{job="backend"} == 0
```

**Haute utilisation CPU :**
```promql
100 - (avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
```

**Mémoire faible :**
```promql
node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100 < 10
```

**Taux d'erreur élevé :**
```promql
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
```

## 📧 Notifications

### Configurer Slack

1. Grafana → Alerting → Contact points
2. New contact point
3. Type : Slack
4. Webhook URL : votre webhook Slack
5. Test & Save

### Configurer Email

1. Modifier `grafana.ini` ou variables d'environnement :

```yaml
environment:
  - GF_SMTP_ENABLED=true
  - GF_SMTP_HOST=smtp.gmail.com:587
  - GF_SMTP_USER=your-email@gmail.com
  - GF_SMTP_PASSWORD=your-password
  - GF_SMTP_FROM_ADDRESS=your-email@gmail.com
```

## 🔧 Dashboard personnalisé

### Créer un dashboard pour QuizMaster

```json
{
  "dashboard": {
    "title": "QuizMaster Overview",
    "panels": [
      {
        "title": "Active Users",
        "targets": [
          {
            "expr": "websocket_connections_active"
          }
        ]
      },
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Active Quizzes",
        "targets": [
          {
            "expr": "active_game_sessions"
          }
        ]
      }
    ]
  }
}
```

## 🎨 Widgets recommandés

1. **Single Stat** : Nombre d'utilisateurs actifs
2. **Graph** : Requêtes HTTP dans le temps
3. **Gauge** : Utilisation CPU/Mémoire
4. **Table** : Top erreurs
5. **Logs** : Stream des logs en temps réel
6. **Heatmap** : Distribution des latences

## 📊 Métriques métier

### Ajouter des métriques custom au backend

Modifier `server.js` pour exposer des métriques :

```javascript
const promClient = require('prom-client');

// Créer un registre
const register = new promClient.Registry();

// Métriques par défaut
promClient.collectDefaultMetrics({ register });

// Métriques custom
const activeUsers = new promClient.Gauge({
  name: 'websocket_connections_active',
  help: 'Number of active WebSocket connections',
  registers: [register]
});

const activeQuizzes = new promClient.Gauge({
  name: 'active_game_sessions',
  help: 'Number of active quiz sessions',
  registers: [register]
});

// Endpoint métriques
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Mettre à jour les métriques
io.on('connection', () => {
  activeUsers.inc();
});

io.on('disconnect', () => {
  activeUsers.dec();
});
```

## 🔍 Debugging avec les logs

### Visualiser les logs en temps réel

```bash
# Dans Grafana Explore
{container="quiz-backend"} | json

# Filtrer par niveau
{container="quiz-backend"} | json | level="error"

# Compter les erreurs
count_over_time({container="quiz-backend"} |= "error" [1h])
```

## 📈 Performance tracking

### KPIs à surveiller

1. **Disponibilité** : Uptime > 99.9%
2. **Latence** : P95 < 200ms
3. **Taux d'erreur** : < 1%
4. **Utilisateurs actifs** : Trend
5. **Quiz complétés** : Par jour
6. **WebSocket connexions** : Stabilité

## 🛠️ Maintenance

### Rotation des logs

Loki retient les logs selon la configuration. Pour gérer manuellement :

```bash
# Nettoyer les vieux logs
docker exec quiz-loki rm -rf /loki/chunks/fake/*/

# Redémarrer Loki
docker-compose restart loki
```

### Backup des dashboards Grafana

```bash
# Export des dashboards
docker exec quiz-grafana grafana-cli admin export-dashboard > dashboards-backup.json

# Backup du volume
docker run --rm -v quiz-app_grafana-data:/data -v $(pwd):/backup alpine tar czf /backup/grafana-backup.tar.gz /data
```

## 🚀 Mode production

### Checklist monitoring production

- [ ] Alertes configurées (CPU, mémoire, erreurs)
- [ ] Notifications (Slack/Email) testées
- [ ] Rétention des logs configurée
- [ ] Dashboards créés et partagés
- [ ] Métriques métier ajoutées
- [ ] Backup automatique Grafana
- [ ] Documentation des alertes
- [ ] Rotation des logs activée
- [ ] SSL sur Grafana (reverse proxy)
- [ ] Authentification renforcée

## 📚 Ressources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Tutorials](https://grafana.com/tutorials/)
- [Loki Documentation](https://grafana.com/docs/loki/)
- [PromQL Cheat Sheet](https://promlabs.com/promql-cheat-sheet/)
- [LogQL Guide](https://grafana.com/docs/loki/latest/logql/)