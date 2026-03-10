@echo off
title Payroll System - Restart
echo ============================================
echo  Payroll System - Full Restart
echo ============================================
echo.
echo [1/4] Stopping all running Node.js processes...
taskkill /F /IM node.exe /T 2>nul
echo Done.
echo.
echo [2/4] Waiting for ports to free up...
timeout /t 3 /nobreak > nul
echo Done.
echo.
echo [3/4] Starting backend server (port 5005)...
start "Payroll SERVER" cmd /k "cd /d "C:\SF projects\Completed\enterprise-payroll-web-529\server" && npm start"
echo.
echo [4/4] Waiting 5 seconds for server to boot, then starting frontend...
timeout /t 5 /nobreak > nul
start "Payroll CLIENT" cmd /k "cd /d "C:\SF projects\Completed\enterprise-payroll-web-529\client" && npm run dev"
echo.
echo ============================================
echo  Both processes are starting!
echo  Server: http://localhost:5005
echo  Client: http://localhost:5173
echo ============================================
echo.
echo Open your browser to: http://localhost:5173
timeout /t 3 /nobreak > nul
start "" "http://localhost:5173"
