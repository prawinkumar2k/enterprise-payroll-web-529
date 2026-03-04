#!/bin/bash
# ============================================================
# setup-k3s-vps.sh
# One-shot hardened VPS setup for Enterprise Payroll System
# Ubuntu 24.04 – Run as root on Hostinger VPS
# VPS: 72.61.229.231 | 8 vCPU | 32 GB RAM | 400 GB SSD
# ============================================================
set -euo pipefail
IFS=$'\n\t'

DOMAIN="${1:-72.61.229.231}"          # pass your domain as first arg, or uses IP
EMAIL="${2:-admin@yourdomain.com}"     # let's encrypt email
PAYROLL_DIR="/opt/payroll"
VPS_IP="72.61.229.231"

log() { echo -e "\033[1;34m[$(date '+%H:%M:%S')] $*\033[0m"; }
ok()  { echo -e "\033[1;32m✔ $*\033[0m"; }
err() { echo -e "\033[1;31m✘ $*\033[0m"; exit 1; }
warn(){ echo -e "\033[1;33m⚠ $*\033[0m"; }

[[ $EUID -ne 0 ]] && err "Run this script as root"

# ─── 1. Stop HestiaCP (conflicts with ports 80/443) ────────
log "Stopping HestiaCP to free ports 80/443..."
if systemctl is-active --quiet hestia 2>/dev/null; then
    systemctl stop hestia
    systemctl disable hestia
    # Stop HestiaCP's nginx that holds port 80
    systemctl stop nginx 2>/dev/null || true
    systemctl disable nginx 2>/dev/null || true
    ok "HestiaCP stopped and disabled (K3s will manage everything)"
else
    warn "HestiaCP not found or already stopped"
fi

# Kill anything on port 80/443 to be safe
fuser -k 80/tcp 2>/dev/null || true
fuser -k 443/tcp 2>/dev/null || true
sleep 2

# ─── 2. System Update ──────────────────────────────────────
log "Updating system packages..."
apt-get update -qq && apt-get upgrade -y -qq
apt-get install -y -qq curl wget git unzip ufw fail2ban htop \
    ca-certificates gnupg lsb-release apt-transport-https \
    build-essential python3 net-tools
ok "System updated"

# ─── 3. Install Docker ─────────────────────────────────────
log "Installing Docker..."
if ! command -v docker &>/dev/null; then
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker root
    ok "Docker installed"
else
    ok "Docker already installed"
fi

# Configure Docker log rotation
cat > /etc/docker/daemon.json <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-address-pools": [
    {"base": "172.30.0.0/16", "size": 24}
  ]
}
EOF

systemctl enable docker
systemctl restart docker
ok "Docker configured"

# ─── 4. Firewall ───────────────────────────────────────────
log "Configuring UFW firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp     comment 'SSH'
ufw allow 80/tcp     comment 'HTTP'
ufw allow 443/tcp    comment 'HTTPS'
ufw allow 6443/tcp   comment 'K3s API server'
ufw allow 8472/udp   comment 'K3s Flannel VXLAN'
ufw allow 10250/tcp  comment 'K3s Kubelet metrics'
ufw allow 5000/tcp   comment 'Local Docker Registry'
ufw --force enable
ok "Firewall configured"

# ─── 5. Fail2ban ───────────────────────────────────────────
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

# ─── 6. Install k3s ────────────────────────────────────────
log "Installing K3s (lightweight Kubernetes)..."
# Stop any existing k3s first
/usr/local/bin/k3s-uninstall.sh 2>/dev/null || true
sleep 3

# Install K3s with embedded Traefik for ingress
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="\
  server \
  --tls-san ${DOMAIN} \
  --tls-san ${VPS_IP} \
  --write-kubeconfig-mode 644 \
  --kube-apiserver-arg service-node-port-range=80-32767 \
  --docker" sh -

# Wait for k3s to be ready
log "Waiting for K3s to be ready..."
sleep 15
k3s kubectl wait --for=condition=Ready node --all --timeout=120s
ok "K3s installed and running"

# ─── 7. Configure kubectl ──────────────────────────────────
mkdir -p ~/.kube
cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
chmod 600 ~/.kube/config
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
echo 'export KUBECONFIG=/etc/rancher/k3s/k3s.yaml' >> ~/.bashrc
echo 'alias k="kubectl"' >> ~/.bashrc

# Shortcut
alias k="kubectl"
ok "kubectl configured"

# ─── 8. Setup Local Docker Registry ────────────────────────
log "Starting local Docker registry (no need for GitHub registry)..."
docker run -d --restart=always --name registry \
  -p 5000:5000 \
  -v /opt/registry:/var/lib/registry \
  registry:2 2>/dev/null || true
ok "Local Docker registry running at localhost:5000"

# Configure k3s to trust local registry
mkdir -p /etc/rancher/k3s
cat > /etc/rancher/k3s/registries.yaml <<EOF
mirrors:
  "localhost:5000":
    endpoint:
      - "http://localhost:5000"
  "registry.local:5000":
    endpoint:
      - "http://localhost:5000"
EOF
systemctl restart k3s
sleep 10
ok "K3s configured to use local registry"

# ─── 9. Install Helm ───────────────────────────────────────
log "Installing Helm..."
if ! command -v helm &>/dev/null; then
    curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
fi
ok "Helm installed"

# ─── 10. Create App Directories ────────────────────────────
log "Creating application directories..."
mkdir -p ${PAYROLL_DIR}/{data,backups,logs,src}
chmod 755 ${PAYROLL_DIR}
chmod 777 ${PAYROLL_DIR}/data ${PAYROLL_DIR}/backups ${PAYROLL_DIR}/logs
ok "Directories created at ${PAYROLL_DIR}"

# ─── 11. Install k9s (optional cluster TUI) ────────────────
log "Installing k9s CLI monitor..."
K9S_VER=$(curl -s https://api.github.com/repos/derailed/k9s/releases/latest | grep '"tag_name"' | cut -d'"' -f4)
if [ -n "$K9S_VER" ]; then
    wget -q "https://github.com/derailed/k9s/releases/download/${K9S_VER}/k9s_Linux_amd64.tar.gz" -O /tmp/k9s.tar.gz
    tar -xzf /tmp/k9s.tar.gz -C /tmp
    mv /tmp/k9s /usr/local/bin/
    ok "k9s installed (run 'k9s' to manage cluster)"
else
    warn "k9s download failed, skipping"
fi

# ─── 12. Install Node.js 20 (for building) ─────────────────
log "Installing Node.js 20..."
if ! command -v node &>/dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
ok "Node.js $(node -v) installed"

# ─── 13. Setup automatic daily backups ──────────────────────
log "Setting up automatic database backups..."
cat > /etc/cron.d/payroll-backup <<'EOF'
# Daily backup of SQLite database at 2 AM IST
0 2 * * * root /bin/bash -c 'POD=$(kubectl get pod -n payroll -l app=payroll-server -o jsonpath="{.items[0].metadata.name}" 2>/dev/null) && [ -n "$POD" ] && kubectl exec -n payroll $POD -- cp /app/data/local_payroll.db /app/backups/payroll-$(date +\%Y\%m\%d).db 2>/dev/null; find /opt/payroll/backups -name "*.db" -mtime +30 -delete'
EOF
ok "Daily backup cron configured"

# ─── 14. System Tuning for High Load ───────────────────────
log "Tuning system for high concurrency..."
cat >> /etc/sysctl.conf <<EOF

# === Enterprise Payroll High-Performance Tuning ===
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_tw_reuse = 1
net.ipv4.ip_local_port_range = 1024 65535
net.ipv4.tcp_fin_timeout = 15
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_probes = 5
net.ipv4.tcp_keepalive_intvl = 15
fs.file-max = 2097152
fs.inotify.max_user_watches = 524288
vm.swappiness = 10
vm.overcommit_memory = 1
EOF
sysctl -p

# Raise ulimits
cat >> /etc/security/limits.conf <<EOF
*    soft    nofile    1048576
*    hard    nofile    1048576
root soft    nofile    1048576
root hard    nofile    1048576
EOF
ok "System tuned for high concurrency"

# ─── COMPLETE ──────────────────────────────────────────────
log "══════════════════════════════════════════════════════"
log "✅ K3s VPS SETUP COMPLETE!"
log ""
log "VPS IP:      ${VPS_IP}"
log "K3s Status:  $(k3s kubectl get nodes -o wide 2>/dev/null | tail -1)"
log "Docker:      $(docker --version 2>/dev/null)"
log "Registry:    http://localhost:5000"
log ""
log "Next steps:"
log "  1. Upload project to /opt/payroll/src/"
log "  2. Run: ./deploy-k3s.sh"
log "══════════════════════════════════════════════════════"
