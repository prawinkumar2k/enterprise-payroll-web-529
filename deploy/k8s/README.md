# Enterprise Payroll — k3s Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the Enterprise Payroll System on a VPS using **k3s** (lightweight Kubernetes).

## Architecture

```
Internet
   │
   ▼
Traefik (k3s built-in ingress)
   │
   ├── /api/*  →  payroll-server:5005  (Node.js/Express)
   │
   └── /*      →  payroll-client:8080  (React + nginx)
                         │
              payroll-server:5005
                         │
                    mysql:3306 (StatefulSet + PVC)
```

## Manifest Files

| File | Purpose |
|------|---------|
| `00-namespace.yaml` | Creates the `payroll` namespace |
| `01-secrets.yaml` | MySQL password + JWT secret (base64) |
| `02-configmap.yaml` | App environment config |
| `03-mysql.yaml` | MySQL 8.0 StatefulSet + headless Service + PVC |
| `04-server.yaml` | Node.js API Deployment + ClusterIP Service |
| `05-client.yaml` | React/nginx Deployment + ClusterIP Service |
| `06-ingress.yaml` | Traefik IngressRoute + HTTPS redirect Middleware |

## Prerequisites

1. VPS with Ubuntu 22.04+
2. k3s installed (`bash deploy/vps/setup-k3s.sh`)
3. Docker Hub account (or other registry)

## Quick Deploy

```bash
# 1. Configure your values
export REGISTRY="yourdockerhub"
export DOMAIN="payroll.yourdomain.com"
export IMAGE_TAG="v1.0.0"

# 2. Update secrets BEFORE deploying
# Edit 01-secrets.yaml — replace MYSQL_ROOT_PASSWORD and JWT_SECRET with your values:
#   echo -n 'your-strong-password' | base64
#   echo -n 'your-jwt-secret-32-chars-min' | base64

# 3. Deploy
bash deploy/vps/k3s-deploy.sh

# 4. Check status
kubectl get pods -n payroll
```

## Updating the App (Rolling Update)

```bash
# Update only the server
bash deploy/vps/k3s-update.sh server

# Update only the client
bash deploy/vps/k3s-update.sh client

# Update both
bash deploy/vps/k3s-update.sh all
```

## Useful kubectl Commands

```bash
# Watch pods
kubectl get pods -n payroll -w

# Server logs
kubectl logs -f deployment/payroll-server -n payroll

# Client logs
kubectl logs -f deployment/payroll-client -n payroll

# MySQL shell
kubectl exec -it statefulset/mysql -n payroll -- mysql -u root -p

# Restart server without rebuild
kubectl rollout restart deployment/payroll-server -n payroll

# Full teardown
kubectl delete namespace payroll
```

## Custom Domain + HTTPS (Let's Encrypt)

1. Point your domain DNS A record to the VPS IP address.
2. Install cert-manager:
   ```bash
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml
   ```
3. Create a `ClusterIssuer` for Let's Encrypt.
4. Uncomment the `tls:` block in `06-ingress.yaml`.

## Storage

MySQL data is persisted via a `PersistentVolumeClaim` using k3s's built-in `local-path` StorageClass.
Data survives pod restarts. Data lives at `/var/lib/rancher/k3s/storage/` on the VPS host.
