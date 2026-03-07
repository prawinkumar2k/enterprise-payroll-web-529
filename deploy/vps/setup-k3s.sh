#!/bin/bash
# setup-k3s.sh — Install k3s (lightweight Kubernetes) on a fresh VPS
# Tested on Ubuntu 22.04 LTS
# Run as root: sudo bash setup-k3s.sh

set -e

###########################################################################
# CONFIG — edit before running
###########################################################################
DOCKER_REGISTRY="docker.io"          # or your private registry
REGISTRY_USER="your-dockerhub-user"  # Docker Hub username
K3S_VERSION="v1.28.5+k3s1"           # Pin a tested version
###########################################################################

echo "================================================================"
echo "  Enterprise Payroll — k3s VPS Setup"
echo "================================================================"

# ── 1. System update ──────────────────────────────────────────────────────────
echo "[1/8] Updating system packages..."
apt-get update -qq && apt-get upgrade -y -qq

# ── 2. Install dependencies ───────────────────────────────────────────────────
echo "[2/8] Installing Docker + tools..."
apt-get install -y -qq curl git docker.io ufw fail2ban

# Start and enable Docker
systemctl enable --now docker

# ── 3. Add deployer user ──────────────────────────────────────────────────────
echo "[3/8] Creating 'deployer' user..."
if ! id "deployer" &>/dev/null; then
    useradd -m -s /bin/bash deployer
    usermod -aG docker deployer
    echo "  Created user 'deployer'"
else
    echo "  User 'deployer' already exists"
fi

# ── 4. Firewall (UFW) ─────────────────────────────────────────────────────────
echo "[4/8] Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw allow 6443/tcp    # k3s API server (kubectl remote access)
ufw --force enable
echo "  Firewall configured."

# ── 5. Install k3s ────────────────────────────────────────────────────────────
echo "[5/8] Installing k3s ${K3S_VERSION}..."
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION="${K3S_VERSION}" sh -s - \
    --write-kubeconfig-mode 644 \
    --disable traefik             # We use the bundled Traefik by default
                                  # Remove '--disable traefik' to keep it

# Wait for k3s to be ready
echo "  Waiting for k3s to initialize..."
sleep 15
k3s kubectl get nodes

# ── 6. Configure kubeconfig for deployer ─────────────────────────────────────
echo "[6/8] Configuring kubectl for deployer..."
mkdir -p /home/deployer/.kube
cp /etc/rancher/k3s/k3s.yaml /home/deployer/.kube/config
chown -R deployer:deployer /home/deployer/.kube
chmod 600 /home/deployer/.kube/config

# Set KUBECONFIG in deployer's shell
echo 'export KUBECONFIG=$HOME/.kube/config' >> /home/deployer/.bashrc

# Also make kubectl alias work for root
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

# ── 7. Docker registry login ──────────────────────────────────────────────────
echo "[7/8] Docker registry login..."
echo "  Log in to Docker Hub as '${REGISTRY_USER}':"
docker login -u "${REGISTRY_USER}" "${DOCKER_REGISTRY}"

# ── 8. Verify ─────────────────────────────────────────────────────────────────
echo "[8/8] Verifying k3s install..."
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
kubectl get nodes
kubectl get pods -A

echo ""
echo "================================================================"
echo "  k3s installed successfully!"
echo ""
echo "  Next step: run 'bash k3s-deploy.sh' to deploy the app."
echo "================================================================"
