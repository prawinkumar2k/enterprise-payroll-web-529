#!/bin/bash
# k3s-update.sh — Rolling update (zero-downtime) for server or client
# Usage:
#   bash deploy/vps/k3s-update.sh server    → update only the API server
#   bash deploy/vps/k3s-update.sh client    → update only the React client
#   bash deploy/vps/k3s-update.sh all       → update both

set -e

###########################################################################
# CONFIG
###########################################################################
REGISTRY="yourdockerhub"
DOMAIN="payroll.yourdomain.com"
###########################################################################

TARGET="${1:-all}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
SERVER_IMAGE="${REGISTRY}/payroll-server:${IMAGE_TAG}"
CLIENT_IMAGE="${REGISTRY}/payroll-client:${IMAGE_TAG}"

echo "================================================================"
echo "  Enterprise Payroll — Rolling Update  (target: ${TARGET})"
echo "================================================================"

update_server() {
    echo "[Server] Building image → ${SERVER_IMAGE}..."
    docker build --platform linux/amd64 -t "${SERVER_IMAGE}" -f ./server/Dockerfile ./server
    docker push "${SERVER_IMAGE}"
    echo "[Server] Triggering rolling update..."
    kubectl set image deployment/payroll-server \
        server="${SERVER_IMAGE}" \
        -n payroll
    kubectl rollout status deployment/payroll-server -n payroll --timeout=120s
    echo "[Server] ✅ Rolling update complete."
}

update_client() {
    echo "[Client] Building image → ${CLIENT_IMAGE}..."
    docker build --platform linux/amd64 -t "${CLIENT_IMAGE}" -f ./client/Dockerfile ./client
    docker push "${CLIENT_IMAGE}"
    echo "[Client] Triggering rolling update..."
    kubectl set image deployment/payroll-client \
        client="${CLIENT_IMAGE}" \
        -n payroll
    kubectl rollout status deployment/payroll-client -n payroll --timeout=120s
    echo "[Client] ✅ Rolling update complete."
}

case "$TARGET" in
    server) update_server ;;
    client) update_client ;;
    all)
        update_server
        update_client
        ;;
    *)
        echo "Usage: $0 [server|client|all]"
        exit 1
        ;;
esac

echo ""
echo "Current pod status:"
kubectl get pods -n payroll
