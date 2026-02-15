#!/bin/bash
# vps-setup.sh - Hardened VPS Initialization (Ubuntu 22.04)
# Run this as root on your fresh VPS

set -e

echo "🚀 Starting Hardened VPS Setup..."

# 1. Update System
apt update && apt upgrade -y

# 2. Install Security & Core Tools
apt install -y ufw fail2ban curl git docker.io docker-compose-v2 nginx certbot python3-certbot-nginx net-tools

# 3. Create Deployer User (if not exists)
if ! id "deployer" >/dev/null 2>&1; then
    useradd -m -s /bin/bash deployer
    usermod -aG docker deployer
    echo "✅ Created 'deployer' user."
else
    echo "ℹ️ 'deployer' user already exists."
fi

# 4. UFW Firewall Configuration
echo "🛡 Configuring Firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 5. Docker Log Rotation (Prevent disk fill-up)
echo "🐳 Configuring Docker log rotation..."
cat <<EOF > /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
systemctl restart docker

# 6. Enable Docker at boot
systemctl enable docker

echo "✅ VPS Hardened & Prepared."
echo "⚠️  REMINDER: Manually disable root password login in /etc/ssh/sshd_config after adding your SSH key to /home/deployer/.ssh/authorized_keys."
