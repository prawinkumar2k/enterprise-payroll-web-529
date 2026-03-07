# 🚀 Enterprise-Grade Payroll & HRMS Ecosystem

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Stack: React + Node + Electron](https://img.shields.io/badge/Stack-React_|_Node_|_Electron-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Database: SQL-Adaptive](https://img.shields.io/badge/Database-MySQL_|_SQLite-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)

A high-precision, offline-first Enterprise Resource Planning (ERP) platform designed for large-scale workforce management and automated payroll disbursement. This system features a hybrid architecture allowing seamless transition between standalone desktop operation and cloud-synchronized enterprise deployments.

---

## 💎 Core Technical Achievements

### 1. Hybrid Persistence Engine (Offline-First)
Built a custom **Mode Manager** that allows the application to detect its environment. It uses **SQLite** for secure local desktop operation (isolated data) and scales to **MySQL/MariaDB** for cloud-based multi-tenant setups.

### 2. High-Fidelity Payroll Print System
Architected a sophisticated rendering engine in React that handles complex multidimensional data (Pay Bill Registers, Bank Statements, License Reports). Features include:
*   **A4 Precision:** Exact pixel-perfect layout for official printing.
*   **Screen Preview Simulation:** A professional "Page-View" mode with shadows and dynamic margins for user UI/UX.
*   **Staged Rendering:** Progressive rendering for 100+ page reports to maintain 60FPS UI responsiveness.

### 3. Commercial Security & Licensing
Implemented a **Machine-Binding Hardware Fingerprint system** (`LicenseService`). 
*   Generates unique IDs based on CPU and Disk serial numbers.
*   Enforces tiered product levels (Trial, Pro, Enterprise).
*   Protects revenue through offline activation tokens and tamper-resistant state files.

### 4. Real-Time Analytics Dashboard
A data-driven "Payroll Intelligence" hub using **Recharts**.
*   **Dynamic KPIs:** Live workforce counts, net disbursement metrics, and statutory breakdowns (EPF, ESI, IT).
*   **Audit Intelligence:** Real-time visibility into the system's internal audit logs.
*   **Compliance Monitoring:** Automated alerts for missing statutory data or payroll discrepancies.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Tailwind CSS, Vite, Lucide-React, Recharts |
| **Backend** | Node.js, Express, JWT, Zod Validation, Pino Logging |
| **Desktop** | Electron, Electron-Builder (NSIS Installer), Auto-Updater |
| **Database** | Knex.js, MySQL 8.0, SQLite 3 |
| **DevOps** | Docker, Git, REST API Architecture |

---

## 📂 Architecture Overview

```text
├── client/              # React Dashboard & Reporting UI
│   ├── components/      # UI Components (Custom Print Engine)
│   ├── pages/           # Module Controllers (Attendance, Reports)
│   └── lib/             # API Interceptors & Context Providers
├── server/              # Enterprise Business Logic
│   ├── services/        # Licensing, Sync, & Payroll Engines
│   ├── controllers/     # API Endpoints
│   └── database/        # Adaptive Persistence Layer
└── electron/            # Desktop Shell & Main Process
```

---

# 🚀 Enterprise-Grade Payroll & HRMS (Web)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Stack: React + Node](https://img.shields.io/badge/Stack-React_|_Node-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Database: SQL-Adaptive](https://img.shields.io/badge/Database-MySQL_|_SQLite-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)

A high-precision, web-first Enterprise Resource Planning (ERP) platform designed for large-scale workforce management and automated payroll disbursement. This repository targets web and server deployments (no desktop builds).

---

## 💎 Core Technical Achievements

### 1. Adaptive Persistence Engine
Built a modular persistence layer that supports local and cloud databases (SQLite for local tests, MySQL for production).

### 2. High-Fidelity Payroll Print System
Robust React rendering engine for complex reports with A4-accurate print layouts and progressive rendering for large documents.

### 3. Security & Licensing
Pluggable licensing and audit systems designed for enterprise compliance and tamper resistance.

### 4. Analytics Dashboard
Real-time dashboards powered by Recharts and server-side audit streams.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Tailwind CSS, Vite, Lucide-React, Recharts |
| **Backend** | Node.js, Express, JWT, Zod Validation, Pino Logging |
| **Database** | Knex.js, MySQL 8.0, SQLite 3 |
| **DevOps** | Docker, Git, REST API Architecture |

---

## 📂 Architecture Overview

```text
├── client/              # React Dashboard & Reporting UI
├── server/              # Enterprise Business Logic
└── (legacy) electron/   # desktop shell removed — project is web-only
```

---

## 🚀 Installation & Deployment

### For Developers
1. Clone the repository
2. Install dependencies: `npm install`
3. Run in dev mode: `npm run dev`

### For Production
Build the web client and deploy the `client/dist/` output to your web server or hosting provider:
```bash
npm run build
```

---

## 🤝 Contribution & License
Developed and Engineered by **Prawin Kumar**.
License: MIT
