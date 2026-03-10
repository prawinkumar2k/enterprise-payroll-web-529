# 🚀 Enterprise Payroll – VPS Deployment Guide

**VPS:** `72.61.229.231` | Ubuntu 24.04 | KVM 8 | 8 vCPU | 32 GB RAM | 400 GB SSD  
**Stack:** Docker → k3s (lightweight Kubernetes) → Traefik v2 (HTTPS) → GitHub Actions CI/CD

---

## Architecture Overview

```
GitHub Push (main)
       │
       ▼
GitHub Actions CI/CD (.github/workflows/deploy.yml)
       │
       ├─ Test → Build Docker images
       ├─ Push images → ghcr.io (GitHub Container Registry)
       └─ SSH → kubectl apply → k3s on VPS
                      │
         ┌────────────┴────────────┐
         │       k3s Cluster       │
         │  namespace: payroll     │
         │                         │
         │  ┌─────────────────┐    │
         │  │ Traefik Ingress  │◄──┼── :443 HTTPS (TLS via Let's Encrypt)
         │  └────────┬────────┘    │
         │           │             │
         │    ┌──────┴──────┐      │
         │    │             │      │
         │  [client]   [server]    │
         │  nginx:8080  node:5001  │
         │                │        │
         │          [SQLite PVC]   │
         │          /app/data      │
         └─────────────────────────┘
```

---

## STEP 1 – Domain Setup (5 minutes)

1. Log in to your DNS provider
2. Add an **A record**:

   | Type | Name | Value | TTL |
   |------|------|-------|-----|
   | A | `payroll` | `72.61.229.231` | 300 |

   Example: `payroll.yourdomain.com` → `72.61.229.231`

3. Verify propagation: `nslookup payroll.yourdomain.com`

---

## STEP 2 – VPS Initial Setup (SSH into VPS)

```bash
# 1. SSH into your VPS
ssh root@72.61.229.231

# 2. Clone your repository
git clone https://github.com/prawinkumar2k/enterprise-payroll-web-529.git /opt/payroll-app
cd /opt/payroll-app

# 3. Run the automated k3s setup script
chmod +x deploy/vps/setup-k3s-vps.sh
./deploy/vps/setup-k3s-vps.sh payroll.yourdomain.com admin@yourdomain.com
```

> The script will:
> - Harden the firewall (UFW + Fail2ban)
> - Install **k3s** (lightweight Kubernetes)
> - Install **Helm**
> - Install **Traefik v2** (ingress + auto TLS)
> - Create app directories at `/opt/payroll`
> - Print your `KUBECONFIG_B64` secret for GitHub Actions

---

## STEP 3 – Configure GitHub Secrets

Go to your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Value |
|---|---|
| `KUBECONFIG_B64` | Base64 output from setup script (printed at end) |

> **Note:** `GITHUB_TOKEN` is automatic — no action needed.

---

## STEP 4 – Update k8s Configuration

Edit [k8s/secrets.yaml](../k8s/secrets.yaml) with your real values:

```yaml
stringData:
  JWT_SECRET: "your-64-char-secret-here"
  ALLOWED_ORIGINS: "https://payroll.yourdomain.com"
```

> **Security:** For production, use [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets) or [External Secrets Operator](https://external-secrets.io/) — never commit real secrets to git.

Update the domain in [k8s/ingress.yaml](../k8s/ingress.yaml):

```yaml
- match: Host(`payroll.yourdomain.com`)
```

---

## STEP 5 – Deploy via CI/CD

```bash
# Simply push to main branch — CI/CD handles everything
git add -A
git commit -m "Configure production deployment"
git push origin main
```

**GitHub Actions will automatically:**
1. Run tests + lint
2. Build Docker images (multi-stage, optimized)
3. Push to `ghcr.io` (GitHub Container Registry)
4. SSH into VPS and apply k3s manifests
5. Rolling deploy (zero downtime)
6. Verify rollout

---

## STEP 6 – Manual k8s Deployment (first time only)

If you want to deploy manually before CI/CD is set up:

```bash
# On the VPS (after setup script):
cd /opt/payroll-app

# Apply all manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/storage.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/server-deployment.yaml
kubectl apply -f k8s/client-deployment.yaml
kubectl apply -f k8s/ingress.yaml

# Check status
kubectl get pods -n payroll
kubectl get svc -n payroll
kubectl logs -n payroll -l app=payroll-server --tail=50
```

---

## Option B – Docker Compose (simpler, no k3s)

If you prefer Docker Compose instead of k3s:

```bash
# On the VPS:
cd /opt/payroll-app

# Install Docker
apt install -y docker.io docker-compose-v2

# Create required directories
mkdir -p /opt/payroll/{data,backups,logs}

# Set environment
cp .env.production .env.production.local
nano .env.production.local   # set your real passwords

# Pull and start
docker compose --env-file .env.production.local pull
docker compose --env-file .env.production.local up -d

# SSL with Certbot
apt install -y certbot
certbot certonly --standalone -d payroll.yourdomain.com --email admin@yourdomain.com --agree-tos
```

---

## Monitoring & Maintenance

### View logs
```bash
# k3s mode
kubectl logs -n payroll -l app=payroll-server -f
kubectl logs -n payroll -l app=payroll-client -f

# Docker Compose mode
docker compose logs -f server
```

### Use k9s (cluster dashboard)
```bash
k9s   # interactive TUI for k3s cluster
```

### Manual backup
```bash
kubectl exec -n payroll \
  $(kubectl get pod -n payroll -l app=payroll-server -o jsonpath="{.items[0].metadata.name}") \
  -- cp /app/data/payroll.db /app/backups/payroll-manual-$(date +%Y%m%d-%H%M%S).db
```

### Scale frontend replicas
```bash
kubectl scale deployment payroll-client -n payroll --replicas=3
```

### Rolling restart (pick up new image)
```bash
kubectl rollout restart deployment/payroll-server -n payroll
kubectl rollout restart deployment/payroll-client -n payroll
```

### Check resource usage
```bash
kubectl top pods -n payroll
kubectl top nodes
```

---

## Troubleshooting

| Problem | Command |
|---|---|
| Pod not starting | `kubectl describe pod -n payroll <pod-name>` |
| App error | `kubectl logs -n payroll <pod-name> --previous` |
| TLS not working | `kubectl logs -n traefik <traefik-pod>` |
| SQLite locked | Ensure `replicas: 1` for server deployment |
| Image pull error | Check GHCR secret: `kubectl get secret ghcr-secret -n payroll` |

---

## File Structure

```
.github/workflows/deploy.yml   ← GitHub Actions CI/CD pipeline
docker-compose.yml              ← Docker Compose (Option B)
k8s/
  namespace.yaml                ← k8s namespace
  storage.yaml                  ← PersistentVolumeClaims
  secrets.yaml                  ← App secrets (replace values!)
  server-deployment.yaml        ← Backend deployment + service
  client-deployment.yaml        ← Frontend deployment + service
  ingress.yaml                  ← Traefik IngressRoute + TLS
deploy/
  vps/setup-k3s-vps.sh         ← One-shot VPS setup script
  nginx/nginx.conf              ← Nginx main config (Compose mode)
  nginx/conf.d/payroll.conf     ← Nginx virtual host (Compose mode)
server/Dockerfile               ← Production server image
client/Dockerfile               ← Production client image (exists)
```

---

## Security Checklist

- [x] Non-root containers (UID 1001)
- [x] Firewall (UFW) – only 22, 80, 443 open
- [x] Fail2ban – SSH brute force protection
- [x] HTTPS enforced (HTTP → redirect)
- [x] Security headers (HSTS, X-Frame, CSP)
- [x] Rate limiting on API and auth endpoints
- [x] JWT token expiry configured
- [x] Docker image size minimized (multi-stage builds)
- [ ] Replace secrets.yaml values before applying
- [ ] Add SSH key to VPS, disable root password login
- [ ] Enable Dependabot on GitHub for dependency updates
