# Hostinger VPS Deployment Checklist - SearchFirst Payroll System

Follow these steps to deploy the application to your Hostinger VPS.

## 1. System Preparation
- [ ] Connect via SSH: `ssh root@YOUR_VPS_IP`
- [ ] Update system: `sudo apt update && sudo apt upgrade -y`
- [ ] Install Node.js (LTS): 
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```
- [ ] Install MySQL Server: `sudo apt install mysql-server -y`
- [ ] Install Nginx: `sudo apt install nginx -y`
- [ ] Install PM2 (Process Manager): `sudo npm install -g pm2`

## 2. Database Setup
- [ ] Secure MySQL: `sudo mysql_secure_installation`
- [ ] Create Database:
  ```sql
  CREATE DATABASE billing_db;
  -- Import your SQL file
  mysql -u root -p billing_db < server/billing_db.sql
  ```

## 3. Project Deployment
- [ ] Clone Repository: `cd /var/www && git clone <your-repo-url> enterprise-payroll`
- [ ] Install Dependencies:
  ```bash
  cd /var/www/enterprise-payroll
  npm install
  ```
- [ ] Set Environment Variables:
  - [ ] Copy `.env` to `server/.env`
  - [ ] Update `server/.env` with production values:
    - `DB_PASSWORD` (VPS MySQL password)
    - `JWT_SECRET` (Use a strong random string)
    - `NODE_ENV=production`
    - `HOST=127.0.0.1`

## 4. Frontend Build
- [ ] Build React App:
  ```bash
  cd /var/www/enterprise-payroll/client
  npm run build
  ```
  *The output will be in `/var/www/enterprise-payroll/client/dist`.*

## 5. Backend Process Management
- [ ] Start Backend with PM2:
  ```bash
  cd /var/www/enterprise-payroll/server
  pm2 start index.js --name "payroll-api"
  pm2 save
  pm2 startup
  ```

## 6. Nginx Configuration
- [ ] Create Config: `sudo nano /etc/nginx/sites-available/payroll`
- [ ] Paste contents from `deployment/payroll.nginx.conf`
- [ ] Enable Site:
  ```bash
  sudo ln -s /etc/nginx/sites-available/payroll /etc/nginx/sites-enabled/
  sudo nginx -t
  sudo systemctl restart nginx
  ```

## 7. Security (UFW Firewall)
- [ ] Allow necessary ports:
  ```bash
  sudo ufw allow 'Nginx Full'
  sudo ufw allow OpenSSH
  sudo ufw enable
  ```

## 8. Optional: SSL (HTTPS)
- [ ] Install Certbot: `sudo apt install certbot python3-certbot-nginx -y`
- [ ] Get Certificate: `sudo certbot --nginx -d yourdomain.com`

---
**Note:** Since the frontend calls `/api`, and Nginx proxies `/api` to `localhost:5001`, you NEVER need to change the IP or URL inside the code.
