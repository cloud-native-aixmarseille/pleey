#!/bin/bash
# Uninstallation script for QuizMaster Helm chart
# Usage: ./scripts/helm-uninstall.sh [--delete-data]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
NAMESPACE="quiz-app"
RELEASE_NAME="quiz-app"
DELETE_DATA=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --delete-data)
            DELETE_DATA=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Usage: $0 [--delete-data]"
            exit 1
            ;;
    esac
done

echo -e "${YELLOW}QuizMaster Helm Chart Uninstallation${NC}"
echo "======================================"
echo ""

# Check if helm is installed
if ! command -v helm &> /dev/null; then
    echo -e "${RED}Error: Helm is not installed${NC}"
    exit 1
fi

# Check if release exists
if ! helm list -n "$NAMESPACE" | grep -q "$RELEASE_NAME"; then
    echo -e "${YELLOW}Warning: Release ${RELEASE_NAME} not found in namespace ${NAMESPACE}${NC}"
    exit 0
fi

# Confirm uninstallation
echo "This will uninstall the QuizMaster application from namespace: ${NAMESPACE}"
if [ "$DELETE_DATA" = true ]; then
    echo -e "${RED}WARNING: This will also delete all persistent data!${NC}"
fi
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Uninstallation cancelled"
    exit 0
fi

echo ""
echo "Uninstalling Helm release..."
helm uninstall "$RELEASE_NAME" -n "$NAMESPACE"
echo -e "${GREEN}✓${NC} Helm release uninstalled"
echo ""

# Delete PVCs if requested
if [ "$DELETE_DATA" = true ]; then
    echo -e "${YELLOW}Deleting persistent volumes...${NC}"
    kubectl delete pvc -n "$NAMESPACE" --all
    echo -e "${GREEN}✓${NC} Persistent volumes deleted"
    echo ""
fi

# Ask to delete namespace
read -p "Delete namespace ${NAMESPACE}? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    kubectl delete namespace "$NAMESPACE"
    echo -e "${GREEN}✓${NC} Namespace deleted"
else
    echo "Namespace ${NAMESPACE} preserved"
fi

echo ""
echo -e "${GREEN}Uninstallation complete!${NC}"
