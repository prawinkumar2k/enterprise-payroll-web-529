# 🔎 ERP Desktop Beta Control Framework (v1.0.0-rc1)

The system has been upgraded to **ENTERPRISE_CONTROLLED_BETA** status. This version includes advanced governance, diagnostic, and resilience mechanisms.

## 🛡 1. Governance & Compliance
- **Beta Expiry**: Enforced for **2026-12-31**. The application will automatically block access after this date to ensure all testers transition to stable releases.
- **Identity & Tagging**: Every build is tagged `v1.0.0-rc1`. A persistent "Internal Beta" badge is visible in the sidebar.

## 🚀 2. Operational Resilience
- **Crash Loop Protection**: If the application crashes more than 3 times in 5 minutes, it automatically enters **Safe Mode**.
- **Safe Mode (Recovery)**:
    - Displays a prominent "Recovery Mode" banner.
    - Disables background sync engines to prevent data corruption.
    - Throttles heavy backend processes.
    - Provides immediate access to "Export Debug Log".
- **Self-Health Monitoring**: background monitoring pings core services every 60 seconds; memory usage and connectivity are tracked.

## 🔍 3. Diagnostic Intelligence
- **Diagnostic Export System**: Users can export a complete troubleshooting package (Logs + DB Snapshot + System Info) directly to their Desktop.
- **Structured Crash Capture**: All Main and Backend processes now log unhandled exceptions in structured JSON format with **Correlation IDs**.
- **Data Integrity Verification**: On every startup, the system runs a `PRAGMA integrity_check` on the SQLite database and validates critical table schemas.

## 📁 4. Distribution Manifest
- **Binary**: `Enterprise Payroll System.exe`
- **Location**: `%AppData%/enterprise-payroll-system/`
- **Primary Logs**:
    - `crash-report.log` (Shell crashes)
    - `server-crash.log` (Logic/API crashes)
    - `beta-feedback.log` (User-submitted feedback)
    - `app-state.json` (Persistence for crash counters/Safe Mode status)

## 🏁 Beta Support Workflow
1. **Issue Detected**: User encounters an error or crash loop.
2. **Safe Mode**: App restarts in Safe Mode.
3. **Diagnostic Export**: User clicks "Export Diagnostics" on the banner or sidebar.
4. **Submission**: User sends the generated ZIP file to the development team.
5. **Recovery**: Dev team analyzes JSON logs and DB state via the correlation IDs.

---
*Authorized by Enterprise Systems Team | Status: CONTROLLED_BETA | 2026-02-12*
