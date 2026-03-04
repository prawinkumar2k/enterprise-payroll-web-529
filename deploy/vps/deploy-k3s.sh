#!/bin/bash
# ============================================================
# deploy-k3s.sh
# Build Docker images → Push to local registry → Deploy to K3s
# MySQL-Only Production Deployment
# Run this on VPS in the project root: /opt/payroll/src/
# ============================================================
set -euo pipefail

REGISTRY="localhost:5000"
TAG="${1:-latest}"
PROJECT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

log() { echo -e "\033[1;34m[$(date '+%H:%M:%S')] $*\033[0m"; }
ok()  { echo -e "\033[1;32m✔ $*\033[0m"; }
err() { echo -e "\033[1;31m✘ $*\033[0m"; exit 1; }
warn(){ echo -e "\033[1;33m⚠ $*\033[0m"; }

export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

# ─── Preflight Checks ──────────────────────────────────────
log "Running preflight checks..."
command -v docker >/dev/null || err "Docker not found. Run setup-k3s-vps.sh first"
command -v kubectl >/dev/null || err "kubectl not found. Run setup-k3s-vps.sh first"
k3s kubectl cluster-info >/dev/null 2>&1 || err "K3s cluster not running"
curl -s http://localhost:5000/v2/ >/dev/null || err "Local Docker registry not running. Start with: docker run -d --restart=always --name registry -p 5000:5000 registry:2"
ok "All checks passed"

cd "${PROJECT_DIR}"

# ─── Step 1: Build Server Docker Image ─────────────────────
log "Building server Docker image (MySQL-only, no native addons)..."
docker build \
    -t ${REGISTRY}/payroll-server:${TAG} \
    -f server/Dockerfile \
    ./server
ok "Server image built"

# ─── Step 2: Build Client Docker Image ─────────────────────
log "Building client Docker image..."
docker build \
    -t ${REGISTRY}/payroll-client:${TAG} \
    -f client/Dockerfile \
    ./client
ok "Client image built"

# ─── Step 3: Push to Local Registry ────────────────────────
log "Pushing images to local registry..."
docker push ${REGISTRY}/payroll-server:${TAG}
docker push ${REGISTRY}/payroll-client:${TAG}
ok "Images pushed to ${REGISTRY}"

# ─── Step 4: Create MySQL Init ConfigMap ───────────────────
log "Creating MySQL init SQL ConfigMap..."
kubectl create namespace payroll 2>/dev/null || true
kubectl -n payroll delete configmap mysql-init-sql 2>/dev/null || true
kubectl -n payroll create configmap mysql-init-sql \
    --from-file=billing_db.sql=server/database/billing_db.sql
ok "MySQL init SQL ConfigMap created"

# ─── Step 5: Create App Directories on Host ────────────────
log "Creating persistent directories..."
mkdir -p /opt/payroll/{mysql-data,backups,logs}
chmod 755 /opt/payroll
chmod 777 /opt/payroll/mysql-data /opt/payroll/backups /opt/payroll/logs
ok "Directories ready"

# ─── Step 6: Apply K8s Manifests ───────────────────────────
log "Applying Kubernetes manifests..."

# Namespace
kubectl apply -f k8s/namespace.yaml
sleep 2

# Storage (PVCs)
kubectl apply -f k8s/storage.yaml
sleep 2

# Secrets
kubectl apply -f k8s/secrets.yaml
sleep 2

# MySQL deployment (must come before server)
kubectl apply -f k8s/mysql-deployment.yaml
log "Waiting for MySQL to be ready (this may take 60-90s on first run)..."
kubectl -n payroll rollout status deployment/payroll-mysql --timeout=180s || warn "MySQL deployment still rolling out"
sleep 10

# Server deployment
kubectl apply -f k8s/server-deployment.yaml
sleep 3

# Client deployment
kubectl apply -f k8s/client-deployment.yaml
sleep 3

# Ingress routes
kubectl apply -f k8s/ingress.yaml
sleep 2

ok "All manifests applied"

# ─── Step 7: Wait for Pods to be Ready ─────────────────────
log "Waiting for all pods to be ready..."
kubectl -n payroll rollout status deployment/payroll-server --timeout=180s || warn "Server still starting..."
kubectl -n payroll rollout status deployment/payroll-client --timeout=60s || warn "Client still starting..."

# ─── Step 8: Verify Health ─────────────────────────────────
log "Running health checks..."
sleep 10

SERVER_POD=$(kubectl -n payroll get pod -l app=payroll-server -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true)
if [ -n "${SERVER_POD}" ]; then
    if kubectl -n payroll exec ${SERVER_POD} -- wget -q -O- http://localhost:5005/api/health 2>/dev/null | grep -q 'success'; then
        ok "Backend health check PASSED ✓"
    else
        warn "Backend health check pending (MySQL may still be initializing)"
        echo "  → Check logs: kubectl -n payroll logs ${SERVER_POD}"
    fi
fi

# ─── Step 9: Print Status ──────────────────────────────────
log ""
log "══════════════════════════════════════════════════════"
log "📊 DEPLOYMENT STATUS"
log "══════════════════════════════════════════════════════"
echo ""
kubectl -n payroll get pods -o wide
echo ""
kubectl -n payroll get svc
echo ""

VPS_IP=$(curl -s ifconfig.me 2>/dev/null || echo "72.61.229.231")
log "══════════════════════════════════════════════════════"
log "🚀 DEPLOYMENT COMPLETE! (MySQL-Only Mode)"
log ""
log "Access your app:"
log "  HTTP:  http://${VPS_IP}"
log "  HTTPS: https://${VPS_IP}"
log "  API:   http://${VPS_IP}/api/health"
log ""
log "Useful commands:"
log "  kubectl -n payroll get pods             # List pods"
log "  kubectl -n payroll logs -f <pod>        # Stream logs"
log "  kubectl -n payroll exec -it <mysql-pod> -- mysql -u root -p billing_db"
log "  k9s                                     # Interactive cluster UI"
log "══════════════════════════════════════════════════════"
