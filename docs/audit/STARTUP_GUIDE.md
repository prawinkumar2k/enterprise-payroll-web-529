# 🚀 Quick Start Guide

## Running the Application

You have **TWO options** to run the application:

---

## ✅ Option 1: Run Everything Together (RECOMMENDED)

From the **root directory** (`enterprise-payroll-web-529`):

```bash
npm run dev
```

This will start:
- ✅ Backend server on http://localhost:5001
- ✅ Frontend client on http://localhost:5173 (or 5174/5175 if port is busy)

---

## ✅ Option 2: Run Client and Server Separately

### Terminal 1 - Start Backend Server

```bash
cd server
npm start
```

Backend will run on: **http://localhost:5001**

### Terminal 2 - Start Frontend Client

```bash
cd client
npm run dev
```

Frontend will run on: **http://localhost:5173**

---

## 🛑 If You Get Port Conflicts

If you see `EADDRINUSE` error, stop all node processes:

```powershell
# PowerShell
Stop-Process -Name node -Force
```

Then restart the application.

---

## 📍 Access Points

- **Frontend (Login Page)**: http://localhost:5173/login
- **Backend API**: http://localhost:5001/api
- **Health Check**: http://localhost:5001/api/health

---

## 🔐 Test Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | admin |
| prawin | prawin | admin |
| gandhi | hr123 | hr_officer |

---

## 📂 Project Structure

```
enterprise-payroll-web-529/
├── client/              # Frontend (React + Vite)
│   ├── public/         # Static assets (favicons, images)
│   ├── shared/         # Shared frontend logic and types
│   ├── netlify/        # Netlify deployment functions
│   ├── deployment/     # Nginx and other deployment configs
│   ├── package.json    # Client-specific scripts
│   └── ...
├── server/              # Backend (Express)
│   ├── scripts/        # Database and maintenance scripts
│   ├── billing_db.sql  # Database schema and data dump
│   ├── package.json    # Server-specific scripts
│   └── ...
├── package.json         # Root scripts (runs both concurrently)
└── README.md           # Main project documentation
```

---

## 🎯 Available Scripts

### Root Directory Scripts
```bash
npm run dev      # Run both client and server
npm run client   # Run only frontend
npm run server   # Run only backend
```

### Server Directory Scripts
```bash
cd server
npm start        # Start server (production)
npm run dev      # Start server with nodemon (development)
```

### Client Directory Scripts
```bash
cd client
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm start        # Start Vite dev server (alias)
```

---

## ✅ Verification Steps

1. **Check if server is running:**
   ```bash
   curl http://localhost:5001/api/health
   ```
   Should return: `{"success":true,"status":"ok"...}`

2. **Check if client is running:**
   Open browser to: http://localhost:5173

3. **Test login:**
   - Go to http://localhost:5173/login
   - Enter: `admin` / `admin123`
   - Should redirect to dashboard

---

## 🐛 Troubleshooting

### Problem: Port 5001 already in use
**Solution:**
```powershell
Stop-Process -Name node -Force
npm run dev
```

### Problem: Cannot find module
**Solution:**
```bash
# In root directory
npm install

# In server directory
cd server
npm install

# In client directory
cd client
npm install
```

### Problem: Database connection error
**Solution:**
- Ensure MySQL is running
- Check `.env` file has correct credentials
- Verify `billing_db` database exists

---

## 📖 Documentation

- **README.md** - This file
- **AUTH_DOCUMENTATION.md** - Complete API documentation
- **.env** - Environment configuration

---

**Last Updated**: 2026-02-06
**Status**: ✅ Ready to Use
