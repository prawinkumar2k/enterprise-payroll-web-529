# 🚀 Industrial-Grade Deployment Guide (Hostinger VPS)

This guide outlines the professional deployment strategy for the Enterprise Payroll System. This configuration ensures that the **same codebase** works in both local development and production without manual code edits.

## 🏗️ Architecture Overview
- **Frontend:** React (Vite) built to static files, served by Nginx.
- **Backend:** Node.js (Express) running on `127.0.0.1:5001`.
- **Database:** MySQL running locally on the VPS.
- **Reverse Proxy:** Nginx handling SSL (HTTPS), SPA routing, and API proxying.

---

## 1. 🛡️ VPS Preparation
Connect to your Hostinger VPS via SSH and install the core stack:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (LTS), Nginx, and MySQL
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx mysql-server git pm2

# Verify installations
node -v
npm -v
nginx -v
```

---

## 2. 🗄️ Database Setup
Secure your MySQL installation and create the database:

```bash
sudo mysql_secure_installation

# Create Database and User
sudo mysql -u root -p
```

Inside MySQL:
```sql
CREATE DATABASE enterprise_payroll;
CREATE USER 'payroll_user'@'localhost' IDENTIFIED BY 'STRONG_SECRET_PASSWORD';
GRANT ALL PRIVILEGES ON enterprise_payroll.* TO 'payroll_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Import your schema:
```bash
mysql -u payroll_user -p enterprise_payroll < billing_db.sql
```

---

## 3. 📂 Project Deployment
Clone the repository and install dependencies:

```bash
cd /var/www
sudo git clone <your-repo-url> enterprise-payroll
sudo chown -R $USER:$USER /var/www/enterprise-payroll
cd enterprise-payroll

# Install and build
npm install
cd client && npm install && npm run build
cd ../server && npm install
```

---

## 4. 🔑 Environment Configuration
Create the production environment files. **NEVER** edit the JSX/JS source code directly for IP changes.

### Server Environment (`server/.env`)
```bash
nano /var/www/enterprise-payroll/server/.env
```
Copy-paste this:
```ini
PORT=5001
HOST=127.0.0.1
NODE_ENV=production
DB_HOST=localhost
DB_USER=payroll_user
DB_PASSWORD=STRONG_SECRET_PASSWORD
DB_NAME=enterprise_payroll
JWT_SECRET=GENERATED_LONG_SECRET_KEY
JWT_EXPIRES_IN=24h
```

---

## 5. ⚙️ Nginx Reverse Proxy
Nginx acts as the entry point. It serves the static React files and redirects `/api` requests to the internal Express server.

```bash
sudo nano /etc/nginx/sites-available/enterprise-payroll
```
Paste the config from `deployment/nginx.conf`. Ensure `root` matches `/var/www/enterprise-payroll/client/dist`.

```bash
# Enable the site and test
sudo ln -s /etc/nginx/sites-available/enterprise-payroll /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 6. 🔄 Process Management (PM2)
Keep the backend running 24/7 with PM2.

```bash
cd /var/www/enterprise-payroll/server
pm2 start index.js --name "payroll-api"
pm2 save
pm2 startup
```

---

## 7. 🔒 SSL (HTTPS) with Certbot
Hostinger VPS usually runs Ubuntu/Debian. Certbot is the standard:

```bash
sudo apt install python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## ✅ Deployment Checklist
- [ ] Backend is listening on `127.0.0.1` (Not accessible publicly on port 5001).
- [ ] Frontend API calls use relative paths (e.g., `/api/auth/login`).
- [ ] Vite `dist` folder is correctly mapped in Nginx.
- [ ] Database credentials in `server/.env` are secure and functional.
- [ ] Firewall (`ufw`) allows only `80`, `443`, and `22`.

## 💡 Industrial Standards
1. **Zero Hardcoding:** No IPs or `localhost` strings in `.jsx` files.
2. **Stateless Backend:** Authentication handled via JWT in headers.
3. **Internal Only:** The Express server is shielded from the public internet by Nginx.
