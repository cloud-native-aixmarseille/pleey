# Health Checks with NestJS Terminus

This module provides comprehensive health check endpoints for the QuizMaster backend using [NestJS Terminus](https://docs.nestjs.com/recipes/terminus).

## 📚 Documentation

**Complete documentation is available in the [centralized docs](/docs):**
- **[Architecture](/docs/docs/technical/architecture.md)** - System architecture
- **[Deployment](/docs/docs/technical/deployment.md)** - Deployment guide with health checks
- **[Monitoring](/docs/docs/technical/monitoring.md)** - Monitoring and observability

## Overview

Health checks are essential for monitoring the application's status in production environments, especially in containerized deployments with orchestration platforms like Kubernetes.

## Endpoints

### 1. General Health Check
```
GET /health
```

Performs comprehensive health checks including:
- **Database** - Verifies Prisma/PostgreSQL connection
- **Disk Storage** - Ensures disk usage is below 90%
- **Memory (Heap)** - Checks heap memory usage (threshold: 300MB)
- **Memory (RSS)** - Checks resident set size (threshold: 500MB)

**Response Example:**
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up",
      "message": "Database connection is healthy"
    },
    "disk": {
      "status": "up",
      "path": "/",
      "thresholdPercent": 0.9,
      "percent": 0.45
    },
    "memory_heap": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up",
      "message": "Database connection is healthy"
    },
    "disk": {
      "status": "up",
      "path": "/",
      "thresholdPercent": 0.9,
      "percent": 0.45
    },
    "memory_heap": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    }
  }
}
```

### 2. Readiness Probe
```
GET /health/ready
```

Used by Kubernetes readiness probes to determine if the application is ready to receive traffic.

Checks:
- **Database connection** - Ensures the database is accessible

**Use Case:** Kubernetes won't route traffic to the pod until this endpoint returns OK.

### 3. Liveness Probe
```
GET /health/live
```

Used by Kubernetes liveness probes to determine if the application is alive and should be restarted if unhealthy.

Checks:
- **Memory (Heap)** - Ensures the application hasn't consumed excessive memory (threshold: 500MB)

**Use Case:** Kubernetes will restart the pod if this endpoint fails consistently.

## Architecture

### Components

1. **HealthModule** (`health.module.ts`)
   - Imports TerminusModule from @nestjs/terminus
   - Provides health check infrastructure

2. **HealthController** (`health.controller.ts`)
   - Exposes health check endpoints
   - Orchestrates different health indicators

3. **PrismaHealthIndicator** (`prisma-health.indicator.ts`)
   - Custom health indicator for Prisma/PostgreSQL
   - Executes a simple query to verify database connectivity

## Kubernetes Integration

### Example Deployment YAML

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: quiz-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: quiz-backend
  template:
    metadata:
      labels:
        app: quiz-backend
    spec:
      containers:
      - name: backend
        image: quiz-backend:latest
        ports:
        - containerPort: 3000
        
        # Readiness probe
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        
        # Liveness probe
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 30
          timeoutSeconds: 5
          failureThreshold: 3
```

## Docker Health Check

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

EXPOSE 3000

# Health check configuration
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health/live || exit 1

CMD ["node", "dist/main"]
```

### docker-compose.yaml

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health/live"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 30s
    depends_on:
      postgres:
        condition: service_healthy
```

## Testing Health Checks

### Local Testing

```bash
# Start the application
npm run start:dev

# Test general health
curl http://localhost:3000/health

# Test readiness
curl http://localhost:3000/health/ready

# Test liveness
curl http://localhost:3000/health/live
```

### Expected HTTP Status Codes

- **200 OK** - All health checks passed
- **503 Service Unavailable** - One or more health checks failed

## Monitoring Integration

### Prometheus

Health check metrics can be exposed for Prometheus scraping:

```typescript
// Example: Custom metrics exporter (optional)
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    HealthModule,
    PrometheusModule.register({
      path: '/metrics',
    }),
  ],
})
export class AppModule {}
```

### Grafana

Create dashboards to visualize:
- Health check success/failure rates
- Database connection status
- Memory and disk usage trends
- Response times for health endpoints

## Customization

### Adding Custom Health Indicators

```typescript
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly redisClient: RedisClient) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.redisClient.ping();
      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError(
        'Redis check failed',
        this.getStatus(key, false),
      );
    }
  }
}
```

### Adjusting Thresholds

Modify the thresholds in `health.controller.ts`:

```typescript
// Disk threshold (90% = 0.9)
this.diskHealthIndicator.checkStorage('disk', {
  path: '/',
  thresholdPercent: 0.8, // Changed to 80%
})

// Memory thresholds
this.memoryHealthIndicator.checkHeap('memory_heap', 500 * 1024 * 1024) // 500MB
this.memoryHealthIndicator.checkRSS('memory_rss', 1024 * 1024 * 1024) // 1GB
```

## Best Practices

1. **Separate Endpoints** - Use different endpoints for readiness and liveness probes
2. **Lightweight Checks** - Keep health checks fast to avoid timeout issues
3. **Appropriate Thresholds** - Set realistic memory and disk thresholds based on your application
4. **Startup Time** - Configure appropriate `initialDelaySeconds` in Kubernetes probes
5. **Monitoring** - Integrate with monitoring systems for alerting on health check failures

## Troubleshooting

### Health Check Fails Due to Database

```json
{
  "status": "error",
  "error": {
    "database": {
      "status": "down",
      "message": "Database connection failed: connect ECONNREFUSED"
    }
  }
}
```

**Solutions:**
- Check DATABASE_URL environment variable
- Verify PostgreSQL is running
- Check network connectivity
- Review database credentials

### Memory Threshold Exceeded

```json
{
  "status": "error",
  "error": {
    "memory_heap": {
      "status": "down"
    }
  }
}
```

**Solutions:**
- Investigate memory leaks in application
- Increase memory threshold if appropriate
- Optimize application memory usage
- Consider horizontal scaling

## References

- [NestJS Terminus Documentation](https://docs.nestjs.com/recipes/terminus)
- [Kubernetes Liveness and Readiness Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Docker Health Checks](https://docs.docker.com/engine/reference/builder/#healthcheck)
