# 🔎 ERP Desktop Beta Distribution Plan (v1.0.0-rc1)

This document outlines the strategy for distributing the first Release Candidate of the Enterprise Payroll System for internal beta testing.

## 📦 Package Specification
- **Version**: `1.0.0-rc1` (Release Candidate 1)
- **Format**: Portable Windows Binary (`.zip`)
- **Compatibility**: Windows 10/11 x64
- **Final Unpacked Size**: ~274 MB

## 🔐 Resilience & Control Features
We have implemented several "Enterprise Shell" features to manage the beta lifecycle:

### 1. Local Crash Reporting
- **Main Process**: Unhandled exceptions are captured in `%APPDATA%/enterprise-payroll-system/crash-report.log`.
- **Backend**: Server-side failures are logged in `%APPDATA%/enterprise-payroll-system/server-crash.log`.
- **Instruction**: If the app crashes, testers should provide these two files.

### 2. Beta Feedback Interface
- **API Endpoint**: `/api/beta/feedback`
- **Mechanism**: Captured feedback is stored locally in `beta-feedback.log`.
- **Status Check**: Navigating to `/api/beta/status` provides version and license verification.

### 3. Versioning & Identity
- High-visibility **v1.0.0-rc1** badge in Sidebar.
- **Internal Beta** status pulse indicator to remind users of the pre-release nature.

### 4. Data Residency
- All database files (`billing_db.sqlite`), logs, and feedback are isolated in the user's local application data directory.
- No trace is left in `Program Files`.

## 🚀 Beta Rollout Steps
1. **Packaging**: Run `npm run build:desktop` (Staging -> Electron Packager).
2. **Tagging**: The binary is marked as `rc1`.
3. **Distribution**: Zip the `dist-release/Enterprise Payroll System-win32-x64/` folder.
4. **Validation**: Testers must verify:
   - App starts without Admin rights.
   - Sync works with provided cloud credentials.
   - Crash logs are generated if "Forced Crash" is simulated.

## 🛡 License & Terms
- **Type**: Proprietary Internal Beta.
- **Expiry**: 2026-12-31 (Enforced by built-in status check).
- **Compliance**: No sensitive credentials (JWT secrets, DB passwords) are stored in plaintext within the bundle; they are managed by the secure Electron wrapper.

---
*Authorized by Enterprise Systems Team | 2026-02-12*
