#!/bin/bash
# Quick installation script for QuizMaster Helm chart
# Usage: ./scripts/helm-install.sh [environment]
# Example: ./scripts/helm-install.sh dev

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="${1:-dev}"
NAMESPACE="quiz-app"
RELEASE_NAME="quiz-app"
CHART_PATH="./deploy/helm/quiz-app"

echo -e "${GREEN}QuizMaster Helm Chart Installation${NC}"
echo "===================================="
echo ""

# Check if helm is installed
if ! command -v helm &> /dev/null; then
    echo -e "${RED}Error: Helm is not installed${NC}"
    echo "Please install Helm: https://helm.sh/docs/intro/install/"
    exit 1
fi

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}Error: kubectl is not installed${NC}"
    echo "Please install kubectl and configure cluster access"
    exit 1
fi

# Check cluster access
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Error: Cannot access Kubernetes cluster${NC}"
    echo "Please configure kubectl to access your cluster"
    exit 1
fi

echo -e "${GREEN}✓${NC} Prerequisites checked"
echo ""

# Add Bitnami repository
echo "Adding Helm repositories..."
if ! helm repo list | grep -q bitnami; then
    helm repo add bitnami https://charts.bitnami.com/bitnami
    echo "Added Bitnami repository"
else
    echo "Bitnami repository already exists"
fi
helm repo update
echo -e "${GREEN}✓${NC} Helm repositories updated"
echo ""

# Select values file based on environment
VALUES_FILE="${CHART_PATH}/values-${ENVIRONMENT}.yaml"

if [ ! -f "$VALUES_FILE" ]; then
    echo -e "${RED}Error: Values file not found: ${VALUES_FILE}${NC}"
    echo "Available environments: dev, staging, prod"
    exit 1
fi

echo "Environment: ${ENVIRONMENT}"
echo "Values file: ${VALUES_FILE}"
echo "Namespace: ${NAMESPACE}"
echo "Release name: ${RELEASE_NAME}"
echo ""

# For production, prompt for secrets
if [ "$ENVIRONMENT" = "prod" ]; then
    echo -e "${YELLOW}Production deployment detected!${NC}"
    echo ""
    read -p "Do you want to set secrets now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -s -p "Enter JWT secret (or press Enter to generate): " JWT_SECRET
        echo
        if [ -z "$JWT_SECRET" ]; then
            JWT_SECRET=$(openssl rand -base64 32)
            echo "Generated JWT secret"
        fi
        
        read -s -p "Enter PostgreSQL password (or press Enter to generate): " PG_PASSWORD
        echo
        if [ -z "$PG_PASSWORD" ]; then
            PG_PASSWORD=$(openssl rand -base64 32)
            echo "Generated PostgreSQL password"
        fi
        
        EXTRA_ARGS="--set backend.secrets.jwtSecret=${JWT_SECRET} --set postgresql.auth.password=${PG_PASSWORD}"
    fi
fi

# Create namespace if it doesn't exist
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo "Creating namespace: ${NAMESPACE}"
    kubectl create namespace "$NAMESPACE"
    echo -e "${GREEN}✓${NC} Namespace created"
else
    echo -e "${GREEN}✓${NC} Namespace exists"
fi
echo ""

# Update chart dependencies
echo "Updating chart dependencies..."
cd "$CHART_PATH"
helm dependency update
cd - > /dev/null
echo -e "${GREEN}✓${NC} Dependencies updated"
echo ""

# Install or upgrade the chart
echo "Installing/Upgrading Helm chart..."
helm upgrade --install "$RELEASE_NAME" "$CHART_PATH" \
    -f "$VALUES_FILE" \
    --namespace "$NAMESPACE" \
    --create-namespace \
    --wait \
    --timeout 10m \
    ${EXTRA_ARGS:-}

echo ""
echo -e "${GREEN}✓${NC} Installation complete!"
echo ""

# Show status
echo "Deployment status:"
kubectl get pods -n "$NAMESPACE"
echo ""

echo "Services:"
kubectl get svc -n "$NAMESPACE"
echo ""

if kubectl get ingress -n "$NAMESPACE" &> /dev/null; then
    echo "Ingress:"
    kubectl get ingress -n "$NAMESPACE"
    echo ""
fi

echo -e "${GREEN}Installation successful!${NC}"
echo ""
echo "Next steps:"
echo "1. Wait for all pods to be ready: kubectl get pods -n ${NAMESPACE} -w"
echo "2. View logs: kubectl logs -n ${NAMESPACE} -l app.kubernetes.io/instance=${RELEASE_NAME} -f"
echo "3. Access the application using the ingress URL or port-forward:"
echo "   kubectl port-forward -n ${NAMESPACE} svc/${RELEASE_NAME}-frontend 8080:80"
echo ""
