#!/bin/bash
# k3s-deploy.sh — Build Docker images, push to registry, deploy to k3s
# Run from the project ROOT directory: bash deploy/vps/k3s-deploy.sh
#
# Prerequisites:
#   - k3s installed (run setup-k3s.sh first)
#   - Docker + Docker Hub login active
#   - KUBECONFIG set to k3s config

set -e

###########################################################################
# CONFIG — edit these values before running
###########################################################################
REGISTRY="yourdockerhub"           # Docker Hub username or registry URL
IMAGE_TAG="${IMAGE_TAG:-latest}"   # Override via: IMAGE_TAG=v1.2 bash k3s-deploy.sh
DOMAIN="payroll.yourdomain.com"    # Your actual domain
K8S_DIR="./deploy/k8s"
###########################################################################

SERVER_IMAGE="${REGISTRY}/payroll-server:${IMAGE_TAG}"
CLIENT_IMAGE="${REGISTRY}/payroll-client:${IMAGE_TAG}"

echo "================================================================"
echo "  Enterprise Payroll — k3s Deployment"
echo "  Registry : ${REGISTRY}"
echo "  Tag      : ${IMAGE_TAG}"
echo "  Domain   : ${DOMAIN}"
echo "================================================================"

# Detect project root (must run from root)
if [ ! -f "package.json" ]; then
    echo "ERROR: Run this script from the project root directory."
    echo "Usage: bash deploy/vps/k3s-deploy.sh"
    exit 1
fi

# ── 1. Build server image ─────────────────────────────────────────────────────
echo ""
echo "[1/6] Building server image → ${SERVER_IMAGE}..."
docker build \
    --platform linux/amd64 \
    --tag "${SERVER_IMAGE}" \
    --file ./server/Dockerfile \
    ./server

# ── 2. Build client image ─────────────────────────────────────────────────────
echo "[2/6] Building client image → ${CLIENT_IMAGE}..."
docker build \
    --platform linux/amd64 \
    --tag "${CLIENT_IMAGE}" \
    --file ./client/Dockerfile \
    ./client

# ── 3. Push images to registry ───────────────────────────────────────────────
echo "[3/6] Pushing images to registry..."
docker push "${SERVER_IMAGE}"
docker push "${CLIENT_IMAGE}"

# ── 4. Patch k8s manifests with actual image names ───────────────────────────
echo "[4/6] Patching k8s manifests with image names..."

# Patch server deployment
sed -i "s|YOUR_REGISTRY/payroll-server:latest|${SERVER_IMAGE}|g" \
    "${K8S_DIR}/04-server.yaml"

# Patch client deployment
sed -i "s|YOUR_REGISTRY/payroll-client:latest|${CLIENT_IMAGE}|g" \
    "${K8S_DIR}/05-client.yaml"

# Patch domain in ingress
sed -i "s|payroll.yourdomain.com|${DOMAIN}|g" \
    "${K8S_DIR}/06-ingress.yaml"

# ── 5. Apply k8s manifests ────────────────────────────────────────────────────
echo "[5/6] Applying Kubernetes manifests..."
kubectl apply -f "${K8S_DIR}/00-namespace.yaml"
kubectl apply -f "${K8S_DIR}/01-secrets.yaml"
kubectl apply -f "${K8S_DIR}/02-configmap.yaml"
kubectl apply -f "${K8S_DIR}/03-mysql.yaml"
kubectl apply -f "${K8S_DIR}/04-server.yaml"
kubectl apply -f "${K8S_DIR}/05-client.yaml"
kubectl apply -f "${K8S_DIR}/06-ingress.yaml"

echo ""
echo "[6/6] Waiting for all pods to be ready (up to 3 minutes)..."
kubectl rollout status deployment/payroll-server -n payroll --timeout=180s
kubectl rollout status deployment/payroll-client -n payroll --timeout=180s

# ── 6. Verify ─────────────────────────────────────────────────────────────────
echo ""
echo "================================================================"
echo "  Deployed pods:"
kubectl get pods -n payroll -o wide
echo ""
echo "  Services:"
kubectl get services -n payroll
echo ""
echo "  Ingress:"
kubectl get ingress -n payroll
echo ""
echo "  App URL: http://${DOMAIN}"
echo "================================================================"
