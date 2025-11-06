---
sidebar_position: 8
---

# Kubernetes Deployment Guide

Complete guide for deploying QuizMaster on Kubernetes using Helm.

## Overview

QuizMaster provides an umbrella Helm chart that orchestrates all required components:
- **Backend**: NestJS application with WebSocket support
- **Frontend**: React SPA served by Nginx
- **PostgreSQL**: Database (bundled or external)
- **Ingress**: NGINX Ingress Controller configuration
- **Monitoring**: Optional Prometheus/Grafana integration

## Prerequisites

Before deploying QuizMaster on Kubernetes, ensure you have:

### Required Components

- **Kubernetes cluster**: v1.23 or higher
- **kubectl**: Configured to access your cluster
- **Helm**: v3.8 or higher
- **Storage provisioner**: For PostgreSQL persistence
- **Ingress controller**: NGINX Ingress Controller (recommended)

### Optional Components

- **cert-manager**: For automatic TLS certificate management
- **Prometheus Operator**: For monitoring and metrics
- **External Secrets Operator**: For secrets management

### Verify Prerequisites

```bash
# Check Kubernetes version
kubectl version --short

# Check Helm version
helm version --short

# Check cluster access
kubectl cluster-info

# Check available storage classes
kubectl get storageclass
```

## Quick Start

### 1. Add Helm Repository

```bash
# Add Bitnami repository (for PostgreSQL dependency)
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

### 2. Install the Chart

#### Basic Installation (Development)

```bash
# Clone the repository
git clone https://github.com/cloud-native-aixmarseille/quiz-app.git
cd quiz-app

# Install with development values
helm install quiz-app ./charts/application \
  -f ./charts/application/values-dev.yaml \
  --create-namespace \
  --namespace quiz-app
```

#### Production Installation

```bash
# Create namespace
kubectl create namespace quiz-app

# Create secrets (recommended approach)
kubectl create secret generic quiz-app-backend \
  --from-literal=jwt-secret="$(openssl rand -base64 32)" \
  --namespace quiz-app

kubectl create secret generic quiz-app-postgresql-secret \
  --from-literal=password="$(openssl rand -base64 32)" \
  --from-literal=postgres-password="$(openssl rand -base64 32)" \
  --namespace quiz-app

# Install with production values
helm install quiz-app ./charts/application \
  -f ./charts/application/values-prod.yaml \
  --namespace quiz-app \
  --set ingress.hosts[0].host=quiz.example.com \
  --set ingress.tls[0].hosts[0]=quiz.example.com
```

### 3. Verify Installation

```bash
# Check pod status
kubectl get pods -n quiz-app

# Check services
kubectl get svc -n quiz-app

# Check ingress
kubectl get ingress -n quiz-app

# View logs
kubectl logs -n quiz-app -l app.kubernetes.io/component=backend -f
```

### 4. Access the Application

```bash
# Get the application URL
kubectl get ingress -n quiz-app

# Or use port-forward for testing
kubectl port-forward -n quiz-app svc/quiz-app-frontend 8080:80
# Visit http://localhost:8080
```

## Installation Options

### Environment-Specific Deployments

The chart includes pre-configured values files for different environments:

#### Development Environment

```bash
helm install quiz-app ./charts/application \
  -f ./charts/application/values-dev.yaml \
  --namespace quiz-app
```

Features:
- Single replica for all components
- Minimal resource allocation
- No TLS/HTTPS
- Local ingress hostname
- No autoscaling

#### Staging Environment

```bash
helm install quiz-app ./charts/application \
  -f ./charts/application/values-staging.yaml \
  --namespace quiz-app-staging \
  --set postgresql.auth.existingSecret=quiz-app-postgresql-secret
```

Features:
- 2 replicas for HA
- Autoscaling enabled
- TLS with Let's Encrypt staging
- Production-like configuration
- Monitoring enabled

#### Production Environment

```bash
helm install quiz-app ./charts/application \
  -f ./charts/application/values-prod.yaml \
  --namespace quiz-app-prod \
  --set postgresql.auth.existingSecret=quiz-app-postgresql-secret \
  --set ingress.hosts[0].host=quiz.example.com
```

Features:
- 3+ replicas for HA
- Autoscaling (2-10 pods)
- TLS with Let's Encrypt production
- Resource limits and requests
- Read replicas for PostgreSQL
- Network policies
- Pod disruption budgets
- Monitoring and alerting

### Using External Database

If you prefer using a managed database service (RDS, Cloud SQL, etc.):

```bash
helm install quiz-app ./charts/application \
  --set postgresql.enabled=false \
  --set backend.secrets.databaseUrl="postgresql://user:pass@db-host:5432/quizdb" \
  --namespace quiz-app
```

### Custom Values

Create a custom `my-values.yaml` file:

```yaml
backend:
  replicaCount: 3
  image:
    tag: "v1.2.3"
  
  secrets:
    jwtSecret: "my-super-secret-jwt-key"
  
  resources:
    limits:
      cpu: 2000m
      memory: 1Gi

frontend:
  replicaCount: 3
  image:
    tag: "v1.2.3"

ingress:
  hosts:
    - host: quiz.mycompany.com
      # ... rest of ingress config
```

Install with custom values:

```bash
helm install quiz-app ./charts/application \
  -f my-values.yaml \
  --namespace quiz-app
```

## Configuration

### Key Configuration Parameters

Refer to the [Helm Chart README](../../charts/application/README.md) for a complete list of configuration parameters.

### Common Customizations

#### Change Image Tag

```bash
helm upgrade quiz-app ./charts/application \
  --set backend.image.tag=v1.2.0 \
  --set frontend.image.tag=v1.2.0 \
  --namespace quiz-app
```

#### Scale Replicas

```bash
helm upgrade quiz-app ./charts/application \
  --set backend.replicaCount=5 \
  --set frontend.replicaCount=5 \
  --namespace quiz-app
```

#### Enable Autoscaling

```bash
helm upgrade quiz-app ./charts/application \
  --set backend.autoscaling.enabled=true \
  --set backend.autoscaling.minReplicas=2 \
  --set backend.autoscaling.maxReplicas=10 \
  --namespace quiz-app
```

#### Update Resource Limits

```bash
helm upgrade quiz-app ./charts/application \
  --set backend.resources.limits.cpu=2000m \
  --set backend.resources.limits.memory=1Gi \
  --namespace quiz-app
```

## Secrets Management

### Option 1: Kubernetes Secrets (Basic)

```bash
# Create backend secret
kubectl create secret generic quiz-app-backend \
  --from-literal=jwt-secret="your-secure-jwt-secret" \
  --from-literal=database-url="postgresql://..." \
  --namespace quiz-app

# Reference in values
helm install quiz-app ./charts/application \
  --namespace quiz-app
```

### Option 2: External Secrets Operator (Recommended for Production)

Install External Secrets Operator:

```bash
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets \
  external-secrets/external-secrets \
  --namespace external-secrets-system \
  --create-namespace
```

Create ExternalSecret:

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: quiz-app-backend
  namespace: quiz-app
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secretsmanager
    kind: SecretStore
  target:
    name: quiz-app-backend
    creationPolicy: Owner
  data:
    - secretKey: jwt-secret
      remoteRef:
        key: quiz-app/jwt-secret
    - secretKey: database-url
      remoteRef:
        key: quiz-app/database-url
```

### Option 3: Sealed Secrets

Install Sealed Secrets controller:

```bash
helm repo add sealed-secrets https://bitnami-labs.github.io/sealed-secrets
helm install sealed-secrets sealed-secrets/sealed-secrets \
  --namespace kube-system
```

Create a sealed secret:

```bash
# Create regular secret
kubectl create secret generic quiz-app-backend \
  --from-literal=jwt-secret="your-secret" \
  --dry-run=client -o yaml > secret.yaml

# Seal it
kubeseal -f secret.yaml -w sealed-secret.yaml

# Apply sealed secret
kubectl apply -f sealed-secret.yaml -n quiz-app
```

## Ingress Configuration

### NGINX Ingress Controller

#### Install NGINX Ingress Controller

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace
```

#### Configure DNS

Point your domain to the ingress controller's external IP:

```bash
# Get external IP
kubectl get svc -n ingress-nginx ingress-nginx-controller

# Create DNS A record
# quiz.example.com -> <EXTERNAL-IP>
```

### TLS/HTTPS Configuration

#### Install cert-manager

```bash
helm repo add jetstack https://charts.jetstack.io
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true
```

#### Create ClusterIssuer

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx
```

Apply the ClusterIssuer:

```bash
kubectl apply -f cluster-issuer.yaml
```

The chart is pre-configured to use cert-manager with the annotation:
```yaml
cert-manager.io/cluster-issuer: "letsencrypt-prod"
```

## Monitoring

### Enable Monitoring

```bash
helm upgrade quiz-app ./charts/application \
  --set monitoring.enabled=true \
  --set monitoring.serviceMonitor.enabled=true \
  --namespace quiz-app
```

### Install Prometheus Stack

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install kube-prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace
```

### Access Grafana

```bash
# Get Grafana password
kubectl get secret -n monitoring kube-prometheus-grafana \
  -o jsonpath="{.data.admin-password}" | base64 --decode

# Port-forward Grafana
kubectl port-forward -n monitoring svc/kube-prometheus-grafana 3000:80
# Visit http://localhost:3000
```

## Upgrading

### Update Helm Chart

```bash
# Pull latest code
git pull

# Upgrade release
helm upgrade quiz-app ./charts/application \
  -f ./charts/application/values-prod.yaml \
  --namespace quiz-app
```

### Update Application Version

```bash
helm upgrade quiz-app ./charts/application \
  --set backend.image.tag=v1.3.0 \
  --set frontend.image.tag=v1.3.0 \
  --namespace quiz-app
```

### Check Upgrade Status

```bash
# View release history
helm history quiz-app -n quiz-app

# Check rollout status
kubectl rollout status deployment/quiz-app-backend -n quiz-app
kubectl rollout status deployment/quiz-app-frontend -n quiz-app
```

### Rollback

```bash
# Rollback to previous version
helm rollback quiz-app -n quiz-app

# Rollback to specific revision
helm rollback quiz-app 3 -n quiz-app
```

## Maintenance

### Database Backup

```bash
# Backup database
kubectl exec -n quiz-app quiz-app-postgresql-0 -- \
  pg_dump -U quizapp quizdb > backup-$(date +%Y%m%d).sql

# Restore database
kubectl exec -i -n quiz-app quiz-app-postgresql-0 -- \
  psql -U quizapp quizdb < backup-20241106.sql
```

### View Logs

```bash
# Backend logs
kubectl logs -n quiz-app -l app.kubernetes.io/component=backend -f

# Frontend logs
kubectl logs -n quiz-app -l app.kubernetes.io/component=frontend -f

# PostgreSQL logs
kubectl logs -n quiz-app quiz-app-postgresql-0 -f

# All pods
kubectl logs -n quiz-app --all-containers=true -f
```

### Resource Monitoring

```bash
# Pod resource usage
kubectl top pods -n quiz-app

# Node resource usage
kubectl top nodes

# Describe pods
kubectl describe pods -n quiz-app
```

## Troubleshooting

### Common Issues

#### Pods Not Starting

```bash
# Check pod status
kubectl get pods -n quiz-app

# Describe pod for events
kubectl describe pod <pod-name> -n quiz-app

# Check logs
kubectl logs <pod-name> -n quiz-app
```

#### Database Connection Issues

```bash
# Test database connectivity
kubectl exec -it -n quiz-app quiz-app-postgresql-0 -- psql -U quizapp -d quizdb

# Check database logs
kubectl logs -n quiz-app quiz-app-postgresql-0

# Verify secret
kubectl get secret quiz-app-backend -n quiz-app -o yaml
```

#### Ingress Not Working

```bash
# Check ingress status
kubectl get ingress -n quiz-app
kubectl describe ingress quiz-app -n quiz-app

# Check ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller

# Verify DNS resolution
nslookup quiz.example.com
```

#### Image Pull Errors

```bash
# Check image pull secrets
kubectl get secrets -n quiz-app

# Describe pod for image pull errors
kubectl describe pod <pod-name> -n quiz-app

# Create image pull secret if needed
kubectl create secret docker-registry regcred \
  --docker-server=ghcr.io \
  --docker-username=<username> \
  --docker-password=<password> \
  --namespace quiz-app
```

### Debug Commands

```bash
# Interactive shell in backend pod
kubectl exec -it -n quiz-app <backend-pod> -- sh

# Interactive shell in PostgreSQL pod
kubectl exec -it -n quiz-app quiz-app-postgresql-0 -- bash

# Port-forward for local testing
kubectl port-forward -n quiz-app svc/quiz-app-backend 3001:3001
kubectl port-forward -n quiz-app svc/quiz-app-frontend 8080:80
```

## Uninstalling

### Remove Release

```bash
# Uninstall Helm release
helm uninstall quiz-app -n quiz-app

# Delete namespace (optional)
kubectl delete namespace quiz-app
```

### Clean Up Persistent Data

```bash
# List PVCs
kubectl get pvc -n quiz-app

# Delete PVCs
kubectl delete pvc -n quiz-app --all
```

## Best Practices

### Security

1. **Use External Secrets**: Never commit secrets to git
2. **Enable Network Policies**: Restrict pod-to-pod communication
3. **Use Pod Security Standards**: Run containers as non-root
4. **Enable TLS**: Always use HTTPS in production
5. **Scan Images**: Regularly scan container images for vulnerabilities

### High Availability

1. **Multiple Replicas**: Run at least 3 replicas in production
2. **Pod Disruption Budgets**: Ensure minimum availability during updates
3. **Anti-Affinity Rules**: Spread pods across nodes
4. **Health Checks**: Configure liveness and readiness probes
5. **Resource Limits**: Set appropriate CPU/memory limits

### Performance

1. **Autoscaling**: Enable HPA for dynamic scaling
2. **Resource Requests**: Set appropriate requests for scheduling
3. **Database Tuning**: Configure PostgreSQL for your workload
4. **CDN**: Use a CDN for static assets
5. **Caching**: Implement caching strategies

### Monitoring

1. **Enable Metrics**: Use Prometheus for metrics collection
2. **Set Up Alerts**: Configure alerts for critical issues
3. **Log Aggregation**: Use centralized logging (ELK, Loki)
4. **Tracing**: Enable distributed tracing with OpenTelemetry
5. **Dashboards**: Create Grafana dashboards for visibility

## Additional Resources

- [Helm Chart README](../../charts/application/README.md)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [cert-manager](https://cert-manager.io/docs/)
- [Prometheus Operator](https://prometheus-operator.dev/)

## Support

For issues and questions:
- GitHub Issues: https://github.com/cloud-native-aixmarseille/quiz-app/issues
- Documentation: https://github.com/cloud-native-aixmarseille/quiz-app/docs
