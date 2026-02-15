# 🚀 PRODUCTION DEPLOYMENT GUIDE

## Prerequisites

- VPS with Docker and Docker Compose installed
- Domain name pointed to VPS IP
- SSL certificate (Let's Encrypt recommended)
- Minimum 2GB RAM, 2 CPU cores, 20GB storage

---

## 📋 Deployment Steps

### 1. Prepare VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Create deployment user
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG docker deploy
```

### 2. Transfer Application

```bash
# On local machine
rsync -avz --exclude 'node_modules' --exclude '.git' \
  ./ deploy@your-vps-ip:/home/deploy/payroll/

# Or use Git
ssh deploy@your-vps-ip
git clone https://github.com/your-repo/enterprise-payroll.git payroll
cd payroll
```

### 3. Configure Environment

```bash
# Copy and edit production environment
cp .env.production.example .env.production

# Generate strong secrets
openssl rand -base64 64  # For JWT_SECRET
openssl rand -base64 32  # For DB_PASSWORD

# Edit .env.production with your values
nano .env.production
```

### 4. Build and Start

```bash
# Build images
docker compose -f docker-compose.production.yml build

# Start services
docker compose -f docker-compose.production.yml up -d

# Check status
docker compose -f docker-compose.production.yml ps

# View logs
docker compose -f docker-compose.production.yml logs -f
```

### 5. Initialize Database

```bash
# Access MySQL container
docker exec -it payroll-mysql mysql -u root -p

# Run initialization scripts if needed
# (Schema should auto-create via backend on first run)
```

### 6. Setup SSL (Nginx Reverse Proxy)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will auto-configure nginx
```

### 7. Configure Nginx (Host Level)

Create `/etc/nginx/sites-available/payroll`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/payroll /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 Security Hardening

### Firewall Setup

```bash
# Enable UFW
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Deny direct access to backend port
sudo ufw deny 5001
```

### Automatic Updates

```bash
# Install unattended-upgrades
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

### Fail2Ban

```bash
# Install fail2ban
sudo apt install fail2ban -y

# Configure for nginx
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 📊 Monitoring

### Health Checks

```bash
# Check backend health
curl http://localhost:5001/api/health

# Check frontend
curl http://localhost:80
```

### View Logs

```bash
# All services
docker compose -f docker-compose.production.yml logs -f

# Specific service
docker compose -f docker-compose.production.yml logs -f backend

# Application logs (inside container)
docker exec payroll-backend cat /app/logs/app.log
docker exec payroll-backend cat /app/logs/error.log
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df
```

---

## 🔄 Backup Strategy

### Database Backup

```bash
# Create backup script
cat > /home/deploy/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker exec payroll-mysql mysqldump -u root -p$DB_PASSWORD billing_db > \
  $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete
EOF

chmod +x /home/deploy/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /home/deploy/backup-db.sh
```

### Volume Backup

```bash
# Backup SQLite and logs
docker run --rm \
  -v payroll_sqlite_data:/data \
  -v payroll_logs:/logs \
  -v /home/deploy/backups:/backup \
  alpine tar czf /backup/volumes_$(date +%Y%m%d).tar.gz /data /logs
```

---

## 🔧 Maintenance

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml up -d

# Remove old images
docker image prune -f
```

### Restart Services

```bash
# Restart all
docker compose -f docker-compose.production.yml restart

# Restart specific service
docker compose -f docker-compose.production.yml restart backend
```

### Scale (Future)

```bash
# Scale backend (requires load balancer)
docker compose -f docker-compose.production.yml up -d --scale backend=3
```

---

## 🚨 Troubleshooting

### Container won't start

```bash
# Check logs
docker compose -f docker-compose.production.yml logs backend

# Check health
docker inspect payroll-backend | grep -A 10 Health
```

### Database connection issues

```bash
# Verify MySQL is running
docker exec payroll-mysql mysql -u root -p -e "SELECT 1"

# Check network
docker network inspect payroll_payroll-network
```

### Permission issues

```bash
# Fix volume permissions
docker exec -u root payroll-backend chown -R nodejs:nodejs /app/logs /app/data
```

---

## 📈 Performance Tuning

### MySQL Optimization

Add to `docker-compose.production.yml` under mysql service:

```yaml
command: >
  --default-authentication-plugin=mysql_native_password
  --max_connections=200
  --innodb_buffer_pool_size=512M
  --innodb_log_file_size=128M
```

### Node.js Optimization

Add to backend environment:

```yaml
NODE_OPTIONS: "--max-old-space-size=512"
UV_THREADPOOL_SIZE: "4"
```

---

## ✅ Success Criteria

- [ ] All containers running (`docker ps`)
- [ ] Health checks passing
- [ ] Frontend accessible via HTTPS
- [ ] Backend API responding
- [ ] Database persisting data
- [ ] Logs being written
- [ ] Backups configured
- [ ] SSL certificate valid
- [ ] Firewall configured
- [ ] Monitoring active

---

## 📞 Support

For issues, check:
1. Container logs
2. Application logs (`/app/logs/`)
3. Nginx error logs (`/var/log/nginx/error.log`)
4. System logs (`journalctl -u docker`)
