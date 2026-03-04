#!/bin/bash
# ============================================================
# setup-k3s-vps.sh
# One-shot hardened VPS setup for Enterprise Payroll System
# Ubuntu 24.04 – Run as root on a fresh VPS
# VPS: 72.61.229.231 | 8 vCPU | 32 GB RAM | 400 GB SSD
# ============================================================
set -euo pipefail
IFS=$'\n\t'

DOMAIN="${1:-payroll.yourdomain.com}"   # pass your domain as first arg
EMAIL="${2:-admin@yourdomain.com}"       # let's encrypt email
PAYROLL_DIR="/opt/payroll"

log() { echo -e "\033[1;34m[$(date '+%H:%M:%S')] $*\033[0m"; }
ok()  { echo -e "\033[1;32m✔ $*\033[0m"; }
err() { echo -e "\033[1;31m✘ $*\033[0m"; exit 1; }

[[ $EUID -ne 0 ]] && err "Run this script as root"

# ─── 1. System Update ──────────────────────────────────────
log "Updating system..."
apt-get update -qq && apt-get upgrade -y -qq
apt-get install -y -qq curl wget git unzip ufw fail2ban htop \
    ca-certificates gnupg lsb-release apt-transport-https

# ─── 2. Firewall ───────────────────────────────────────────
log "Configuring UFW firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp     comment 'SSH'
ufw allow 80/tcp     comment 'HTTP'
ufw allow 443/tcp    comment 'HTTPS'
ufw allow 6443/tcp   comment 'k3s API server'
ufw allow 8472/udp   comment 'k3s Flannel VXLAN'
ufw allow 10250/tcp  comment 'k3s kubelet metrics'
ufw --force enable
ok "Firewall configured"

# ─── 3. Fail2ban ───────────────────────────────────────────
log "Configuring fail2ban..."
cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
EOF
systemctl enable --now fail2ban
ok "Fail2ban active"

# ─── 4. Install k3s (lightweight Kubernetes) ───────────────
log "Installing k3s..."
# Install with Traefik (default ingress) + Let's Encrypt support
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="\
  server \
  --tls-san ${DOMAIN} \
  --tls-san 72.61.229.231 \
  --write-kubeconfig-mode 644 \
  --disable servicelb \
  --disable traefik" sh -   # We'll install Traefik v2 manually for better config

# Wait for k3s to be ready
sleep 10
k3s kubectl wait --for=condition=Ready node --all --timeout=60s
ok "k3s installed and running"

# ─── 5. Configure kubectl for root ─────────────────────────
mkdir -p ~/.kube
cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
chmod 600 ~/.kube/config
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
echo 'export KUBECONFIG=/etc/rancher/k3s/k3s.yaml' >> ~/.bashrc
ok "kubectl configured"

# ─── 6. Install Helm ───────────────────────────────────────
log "Installing Helm..."
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
ok "Helm installed"

# ─── 7. Install Traefik v2 (ingress + auto TLS) ────────────
log "Installing Traefik v2 via Helm..."
helm repo add traefik https://traefik.github.io/charts
helm repo update

cat > /tmp/traefik-values.yaml <<EOF
deployment:
  replicas: 1

ports:
  web:
    redirectTo:
      port: websecure
  websecure:
    tls:
      enabled: true

providers:
  kubernetesCRD:
    enabled: true
  kubernetesIngress:
    enabled: true

certificatesResolvers:
  letsencrypt:
    acme:
      email: ${EMAIL}
      storage: /data/acme.json
      httpChallenge:
        entryPoint: web

persistence:
  enabled: true
  storageClass: local-path
  size: 128Mi

resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 300m
    memory: 256Mi

additionalArguments:
  - "--log.level=INFO"
  - "--api.dashboard=true"
  - "--api.insecure=false"
EOF

kubectl create namespace traefik 2>/dev/null || true
helm upgrade --install traefik traefik/traefik \
  --namespace traefik \
  --values /tmp/traefik-values.yaml \
  --wait --timeout 120s

ok "Traefik v2 installed with Let's Encrypt"

# ─── 8. Create App Directories ─────────────────────────────
log "Creating application directories..."
mkdir -p ${PAYROLL_DIR}/{data,backups,logs}
chmod 755 ${PAYROLL_DIR}
chmod 777 ${PAYROLL_DIR}/data ${PAYROLL_DIR}/backups ${PAYROLL_DIR}/logs
ok "Directories created at ${PAYROLL_DIR}"

# ─── 9. Install Kubernetes Dashboard (optional) ────────────
log "Installing lightweight k9s CLI..."
K9S_VER=$(curl -s https://api.github.com/repos/derailed/k9s/releases/latest | grep '"tag_name"' | cut -d'"' -f4)
wget -q "https://github.com/derailed/k9s/releases/download/${K9S_VER}/k9s_Linux_amd64.tar.gz" -O /tmp/k9s.tar.gz
tar -xzf /tmp/k9s.tar.gz -C /tmp
mv /tmp/k9s /usr/local/bin/
ok "k9s installed (run 'k9s' to manage cluster)"

# ─── 10. Automatic Daily Backups ───────────────────────────
log "Setting up automatic database backups..."
cat > /etc/cron.d/payroll-backup <<EOF
# Daily backup of SQLite database at 2 AM
0 2 * * * root /bin/bash -c 'kubectl exec -n payroll \$(kubectl get pod -n payroll -l app=payroll-server -o jsonpath="{.items[0].metadata.name}") -- cp /app/data/payroll.db /app/backups/payroll-\$(date +\%Y\%m\%d).db 2>/dev/null; find /opt/payroll/backups -name "*.db" -mtime +30 -delete'
EOF
ok "Daily backup cron configured"

# ─── 11. Print kubeconfig for GitHub Actions ───────────────
log "══════════════════════════════════════════════════════"
log "k3s SETUP COMPLETE!"
log ""
log "Next steps:"
log "  1. Point your domain: ${DOMAIN} → 72.61.229.231 (A record)"
log "  2. Copy the kubeconfig below into GitHub Secret: KUBECONFIG_B64"
log ""
echo "KUBECONFIG_B64 (base64 encoded):"
cat /etc/rancher/k3s/k3s.yaml | sed "s/127.0.0.1/72.61.229.231/g" | base64 -w 0
echo ""
log ""
log "  3. Add GitHub Secrets (Settings → Secrets → Actions):"
log "     - KUBECONFIG_B64: (the base64 above)"
log ""
log "  4. Apply manifests: kubectl apply -f k8s/"
log ""
log "Dashboard: https://${DOMAIN}"
log "k3s API:   https://72.61.229.231:6443"
log "══════════════════════════════════════════════════════"
