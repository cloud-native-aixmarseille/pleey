# QuizMaster Helm Chart

This Helm chart deploys the QuizMaster application on Kubernetes, including the backend (NestJS), frontend (React), PostgreSQL database, and optional monitoring components.

## Prerequisites

- Kubernetes 1.23+
- Helm 3.8+
- PV provisioner support in the underlying infrastructure (for PostgreSQL persistence)
- Ingress controller (NGINX recommended)
- cert-manager (optional, for TLS certificates)

## Quick Start

### Add Bitnami Repository

The chart depends on Bitnami's PostgreSQL chart:

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

### Install the Chart

#### Basic Installation (Development)

```bash
# Install with default values
helm install quiz-app ./deploy/helm/quiz-app

# Or with development values
helm install quiz-app ./deploy/helm/quiz-app -f ./deploy/helm/quiz-app/values-dev.yaml
```

#### Production Installation

```bash
# Create namespace
kubectl create namespace quiz-app

# Install with production values
helm install quiz-app ./deploy/helm/quiz-app \
  -f ./deploy/helm/quiz-app/values-prod.yaml \
  --namespace quiz-app \
  --set backend.secrets.jwtSecret="your-super-secret-jwt-key" \
  --set postgresql.auth.password="your-secure-database-password"
```

### Access the Application

After installation, follow the instructions displayed in the NOTES section:

```bash
# Get the application URL
kubectl get ingress -n quiz-app

# Or use port-forward for testing
kubectl port-forward -n quiz-app svc/quiz-app-frontend 8080:80
```

Visit `http://localhost:8080` in your browser.

## Configuration

### Key Configuration Parameters

#### Global Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| `global.imageRegistry` | Global Docker image registry | `""` |
| `global.imagePullPolicy` | Global image pull policy | `IfNotPresent` |
| `global.imagePullSecrets` | Global Docker registry secret names | `[]` |
| `global.storageClass` | Global storage class for PVCs | `""` |

#### Backend Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `backend.enabled` | Enable backend deployment | `true` |
| `backend.replicaCount` | Number of backend replicas | `2` |
| `backend.image.repository` | Backend image repository | `cloud-native-aixmarseille/quiz-app/backend` |
| `backend.image.tag` | Backend image tag | `latest` |
| `backend.service.type` | Kubernetes service type | `ClusterIP` |
| `backend.service.port` | Backend service port | `3001` |
| `backend.secrets.jwtSecret` | JWT secret for authentication | `change-me-in-production` |
| `backend.resources.limits.cpu` | CPU limit | `1000m` |
| `backend.resources.limits.memory` | Memory limit | `512Mi` |
| `backend.autoscaling.enabled` | Enable horizontal pod autoscaling | `false` |

#### Frontend Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `frontend.enabled` | Enable frontend deployment | `true` |
| `frontend.replicaCount` | Number of frontend replicas | `2` |
| `frontend.image.repository` | Frontend image repository | `cloud-native-aixmarseille/quiz-app/frontend` |
| `frontend.image.tag` | Frontend image tag | `latest` |
| `frontend.service.type` | Kubernetes service type | `ClusterIP` |
| `frontend.service.port` | Frontend service port | `80` |
| `frontend.resources.limits.cpu` | CPU limit | `500m` |
| `frontend.resources.limits.memory` | Memory limit | `256Mi` |

#### PostgreSQL Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `postgresql.enabled` | Enable PostgreSQL subchart | `true` |
| `postgresql.auth.username` | PostgreSQL username | `quizapp` |
| `postgresql.auth.password` | PostgreSQL password | `quizapp_password` |
| `postgresql.auth.database` | PostgreSQL database name | `quizdb` |
| `postgresql.auth.existingSecret` | Use existing secret for credentials | `""` |
| `postgresql.primary.persistence.enabled` | Enable persistence | `true` |
| `postgresql.primary.persistence.size` | PVC size | `8Gi` |

#### Ingress Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `ingress.enabled` | Enable ingress | `true` |
| `ingress.className` | Ingress class name | `nginx` |
| `ingress.annotations` | Ingress annotations | See values.yaml |
| `ingress.hosts` | Ingress hostnames and paths | See values.yaml |
| `ingress.tls` | TLS configuration | See values.yaml |

### Environment-Specific Configurations

The chart includes pre-configured values files for different environments:

- **Development**: `values-dev.yaml` - Minimal resources, no autoscaling
- **Staging**: `values-staging.yaml` - Production-like setup with moderate resources
- **Production**: `values-prod.yaml` - Full production setup with HA, autoscaling, and monitoring

## Examples

### Install with Custom Values

```bash
helm install quiz-app ./deploy/helm/quiz-app \
  --set backend.replicaCount=3 \
  --set frontend.replicaCount=3 \
  --set postgresql.primary.persistence.size=20Gi
```

### Install with External Database

```bash
helm install quiz-app ./deploy/helm/quiz-app \
  --set postgresql.enabled=false \
  --set backend.secrets.databaseUrl="postgresql://user:pass@external-db:5432/quizdb"
```

### Enable Autoscaling

```bash
helm install quiz-app ./deploy/helm/quiz-app \
  --set backend.autoscaling.enabled=true \
  --set backend.autoscaling.minReplicas=2 \
  --set backend.autoscaling.maxReplicas=10 \
  --set frontend.autoscaling.enabled=true
```

### Enable Monitoring

```bash
helm install quiz-app ./deploy/helm/quiz-app \
  --set monitoring.enabled=true \
  --set monitoring.serviceMonitor.enabled=true \
  --set postgresql.metrics.enabled=true
```

## Upgrading

### Upgrade the Release

```bash
# Upgrade with new values
helm upgrade quiz-app ./deploy/helm/quiz-app \
  -f ./deploy/helm/quiz-app/values-prod.yaml \
  --namespace quiz-app

# Upgrade with specific image tags
helm upgrade quiz-app ./deploy/helm/quiz-app \
  --set backend.image.tag=v1.1.0 \
  --set frontend.image.tag=v1.1.0
```

### Rollback

```bash
# List releases
helm history quiz-app -n quiz-app

# Rollback to previous version
helm rollback quiz-app -n quiz-app

# Rollback to specific revision
helm rollback quiz-app 2 -n quiz-app
```

## Uninstalling

```bash
# Uninstall the release
helm uninstall quiz-app -n quiz-app

# Delete the namespace (if created)
kubectl delete namespace quiz-app
```

**Note**: By default, PersistentVolumeClaims are not deleted. To delete them:

```bash
kubectl delete pvc -n quiz-app --all
```

## Security Considerations

### Production Secrets

**DO NOT** use default values for secrets in production. Use one of these approaches:

#### 1. External Secrets Operator

```yaml
# Install External Secrets Operator first
# Then create ExternalSecret resources
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: quiz-app-secrets
spec:
  secretStoreRef:
    name: aws-secretsmanager
    kind: SecretStore
  target:
    name: quiz-app-backend
  data:
    - secretKey: jwt-secret
      remoteRef:
        key: quiz-app/jwt-secret
```

#### 2. Sealed Secrets

```bash
# Install Sealed Secrets controller
# Create a sealed secret
echo -n "my-super-secret-jwt-key" | kubectl create secret generic quiz-app-backend \
  --dry-run=client --from-file=jwt-secret=/dev/stdin -o yaml | \
  kubeseal -o yaml > sealed-secret.yaml
```

#### 3. Helm Values with Encryption

```bash
# Use helm-secrets plugin
helm secrets install quiz-app ./deploy/helm/quiz-app -f secrets.yaml
```

### Network Policies

Enable network policies in production:

```yaml
networkPolicy:
  enabled: true
```

### Pod Security

The chart follows security best practices:
- Non-root containers
- Read-only root filesystem (where applicable)
- Dropped capabilities
- Resource limits

## Troubleshooting

### Check Pod Status

```bash
kubectl get pods -n quiz-app
kubectl describe pod <pod-name> -n quiz-app
kubectl logs <pod-name> -n quiz-app
```

### Check Services

```bash
kubectl get svc -n quiz-app
kubectl get ingress -n quiz-app
```

### Database Connection Issues

```bash
# Check PostgreSQL pod
kubectl logs -n quiz-app quiz-app-postgresql-0

# Connect to PostgreSQL
kubectl exec -it -n quiz-app quiz-app-postgresql-0 -- psql -U quizapp -d quizdb

# Test database connection from backend
kubectl exec -it -n quiz-app <backend-pod> -- sh
# Inside the pod:
npx prisma db pull
```

### Common Issues

1. **ImagePullBackOff**: Check image name and registry credentials
2. **CrashLoopBackOff**: Check logs with `kubectl logs`
3. **Database connection failed**: Verify DATABASE_URL and PostgreSQL pod status
4. **Ingress not working**: Verify ingress controller is installed and hostname is correct

## Monitoring

### Prometheus Integration

When `monitoring.enabled=true`, the chart creates ServiceMonitor resources for Prometheus Operator:

```bash
# Check ServiceMonitors
kubectl get servicemonitor -n quiz-app

# Access Prometheus (if installed)
kubectl port-forward -n monitoring svc/prometheus-operated 9090:9090
```

### Grafana Dashboards

Import the provided Grafana dashboards (if monitoring is enabled):

```bash
# Dashboards are available in the monitoring/ directory
kubectl create configmap quiz-app-dashboards \
  --from-file=monitoring/grafana/ \
  -n monitoring
```

## Development

### Linting the Chart

```bash
# Lint the chart
helm lint ./deploy/helm/quiz-app

# Template the chart to check output
helm template quiz-app ./deploy/helm/quiz-app \
  -f ./deploy/helm/quiz-app/values-dev.yaml > output.yaml
```

### Testing with Kind

```bash
# Create a local cluster
kind create cluster --name quiz-test

# Install NGINX Ingress
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Install the chart
helm install quiz-app ./deploy/helm/quiz-app -f ./deploy/helm/quiz-app/values-dev.yaml
```

## Support

- **Documentation**: [https://github.com/cloud-native-aixmarseille/quiz-app/docs](https://github.com/cloud-native-aixmarseille/quiz-app/docs)
- **Issues**: [https://github.com/cloud-native-aixmarseille/quiz-app/issues](https://github.com/cloud-native-aixmarseille/quiz-app/issues)

## License

MIT
