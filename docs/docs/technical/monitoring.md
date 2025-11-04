---
sidebar_position: 8
---

# 📊 Monitoring Guide - QuizMaster

Complete guide for monitoring and observability of the QuizMaster application.

## 🎯 Monitoring stack

- **Prometheus**: Metrics collection
- **Grafana**: Visualization and dashboards
- **Loki**: Log aggregation
- **Promtail**: Log collection
- **Node Exporter**: System metrics
- **cAdvisor**: Docker metrics

## 🚀 Installation

### Start with monitoring

```bash
# Start application with monitoring
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d

# Or with Makefile
make monitoring-up
```

### Access interfaces

- **Grafana**: http://localhost:3000 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **cAdvisor**: http://localhost:8080
- **Loki**: http://localhost:3100

## 📈 Collected metrics

### Backend metrics (Node.js)

- HTTP requests (total, errors, latency)
- Active WebSocket connections
- Connected users
- Active quizzes
- Database performance
- Memory/CPU usage

### System metrics (Node Exporter)

- CPU utilization
- Memory (used, available)
- Disk (I/O, space)
- Network (traffic, errors)
- System load

### Docker metrics (cAdvisor)

- CPU usage per container
- Memory per container
- Network per container
- Disk per container
- Overall performance

## 📊 Grafana configuration

### 1. First login

```
URL: http://localhost:3000
User: admin
Pass: admin123
```

Change the password immediately!

### 2. Add Prometheus as data source

1. Configuration → Data Sources
2. Add data source → Prometheus
3. URL: `http://prometheus:9090`
4. Save & Test

### 3. Add Loki for logs

1. Configuration → Data Sources
2. Add data source → Loki
3. URL: `http://loki:3100`
4. Save & Test

### 4. Import dashboards

**Docker Dashboard:**
- Dashboard ID: 193 (for cAdvisor)
- Or create a custom dashboard

**Node Exporter Dashboard:**
- Dashboard ID: 1860
- Data source: Prometheus

## 🔍 Useful Prometheus queries

### Backend performance

```promql
# Request rate per second
rate(http_requests_total[5m])

# Average latency
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# Connected users
websocket_connections_active
```

### System resources

```promql
# CPU utilization
100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Available memory
node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100

# Free disk space
node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} * 100
```

### Docker containers

```promql
# CPU per container
rate(container_cpu_usage_seconds_total[5m])

# Memory per container
container_memory_usage_bytes

# Network received
rate(container_network_receive_bytes_total[5m])
```

## 📝 Logs with Loki

### Useful LogQL queries

```logql
# All backend logs
{container="quiz-backend"}

# Errors only
{container="quiz-backend"} |= "error" or "ERROR"

# Logs from last 5 minutes
{container="quiz-backend"} [5m]

# Error rate
rate({container="quiz-backend"} |= "error" [5m])

# Pattern search
{container="quiz-backend"} |~ "user.*login"
```

## 🚨 Alerts (Advanced configuration)

### Create an alert in Grafana

1. Create a dashboard with a query
2. Edit Panel → Alert tab
3. Configure conditions
4. Define notifications

### Alert examples

**Backend down:**
```promql
up{job="backend"} == 0
```

**High CPU usage:**
```promql
100 - (avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
```

**Low memory:**
```promql
node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100 < 10
```

**High error rate:**
```promql
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
```

## 📧 Notifications

### Configure Slack

1. Grafana → Alerting → Contact points
2. New contact point
3. Type: Slack
4. Webhook URL: your Slack webhook
5. Test & Save

### Configure Email

1. Modify `grafana.ini` or environment variables:

```yaml
environment:
  - GF_SMTP_ENABLED=true
  - GF_SMTP_HOST=smtp.gmail.com:587
  - GF_SMTP_USER=your-email@gmail.com
  - GF_SMTP_PASSWORD=your-password
  - GF_SMTP_FROM_ADDRESS=your-email@gmail.com
```

## 🔧 Custom dashboard

### Create a dashboard for QuizMaster

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

## 🎨 Recommended widgets

1. **Single Stat**: Active users count
2. **Graph**: HTTP requests over time
3. **Gauge**: CPU/Memory usage
4. **Table**: Top errors
5. **Logs**: Real-time log stream
6. **Heatmap**: Latency distribution

## 📊 Business metrics

### Add custom metrics to backend

Modify `server.js` to expose metrics:

```javascript
const promClient = require('prom-client');

// Create registry
const register = new promClient.Registry();

// Default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
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

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Update metrics
io.on('connection', () => {
  activeUsers.inc();
});

io.on('disconnect', () => {
  activeUsers.dec();
});
```

## 🔍 Debugging with logs

### Visualize logs in real-time

```bash
# In Grafana Explore
{container="quiz-backend"} | json

# Filter by level
{container="quiz-backend"} | json | level="error"

# Count errors
count_over_time({container="quiz-backend"} |= "error" [1h])
```

## 📈 Performance tracking

### KPIs to monitor

1. **Availability**: Uptime > 99.9%
2. **Latency**: P95 < 200ms
3. **Error rate**: < 1%
4. **Active users**: Trend
5. **Completed quizzes**: Per day
6. **WebSocket connections**: Stability

## 🛠️ Maintenance

### Log rotation

Loki retains logs according to configuration. To manage manually:

```bash
# Clean old logs
docker exec quiz-loki rm -rf /loki/chunks/fake/*/

# Restart Loki
docker-compose restart loki
```

### Grafana dashboard backup

```bash
# Export dashboards
docker exec quiz-grafana grafana-cli admin export-dashboard > dashboards-backup.json

# Volume backup
docker run --rm -v quiz-app_grafana-data:/data -v $(pwd):/backup alpine tar czf /backup/grafana-backup.tar.gz /data
```

## 🚀 Production mode

### Production monitoring checklist

- [ ] Alerts configured (CPU, memory, errors)
- [ ] Notifications (Slack/Email) tested
- [ ] Log retention configured
- [ ] Dashboards created and shared
- [ ] Business metrics added
- [ ] Automatic Grafana backup
- [ ] Alert documentation
- [ ] Log rotation enabled
- [ ] SSL on Grafana (reverse proxy)
- [ ] Enhanced authentication

## 📚 Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Tutorials](https://grafana.com/tutorials/)
- [Loki Documentation](https://grafana.com/docs/loki/)
- [PromQL Cheat Sheet](https://promlabs.com/promql-cheat-sheet/)
- [LogQL Guide](https://grafana.com/docs/loki/latest/logql/)