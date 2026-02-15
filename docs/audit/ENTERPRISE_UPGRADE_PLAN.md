# 🚀 Enterprise Upgrade Implementation Plan

This document outlines the step-by-step roadmap to transform the CURRENT Payroll System into a stable, offline-first, future-cloud-ready enterprise product, as defined in the **Final Master Prompt**.

---

## 📅 Roadmap: 30-Day Enhancement Plan

### Phase 1: Structural Foundation (Days 1–7)
*   **Repo Rearrangement**: Move `client` to `/frontend`, `server` to `/backend`.
*   **Backend Layering**: Introduce `services/`, `models/`, and `utils/` within `/backend`.
*   **Database Schema Evolution**: Batch migration to add UUIDs, sync flags, and soft-delete columns.
*   **Global Error Handling**: Implement centralized Express error middleware and structured logging (Winston).

### Phase 2: Offline-First & Sync Engine (Days 8–15)
*   **Electron Integration**: Set up the Electron wrapper for the desktop environment.
*   **Offline Detection**: Implement React hooks for network status monitoring.
*   **Sync Logic Implementation**:
    *   `is_synced` and `updated_at` tracking on all DB operations.
    *   `/api/v1/sync/push` and `/api/v1/sync/pull` endpoints.
*   **Conflict Resolution**: Server-authoritative logic.

### Phase 3: Payroll Hardening & Security (Days 16–22)
*   **Transaction Logic Refactor**: Ensure all payroll runs use MySQL transactions.
*   **Audit Logging**: Implement a dedicated `audit_logs` table tracking sensitive changes (salary, status).
*   **RBAC (Role Based Access Control)**: Enforce JWT permissions (Admin vs Accountant).
*   **Validation**: Add Zod/Joi schema validation for all API inputs.

### Phase 4: Production Polish & Cloud Prep (Days 23–30)
*   **Dockerization**: Create production-ready `Dockerfile` and `docker-compose.yml`.
*   **Frontend Optimization**: Implement pagination and virtualized lists for large datasets.
*   **System Audit**: Verify data integrity across sync states.
*   **Final Documentation**: API specs and deployment guides.

---

## 🗄 1. Updated Database Schema Design (Sample: `empdet`)

All tables will be modified to follow this enterprise-standard metadata structure:

```sql
ALTER TABLE empdet 
  ADD COLUMN uuid CHAR(36) UNIQUE BEFORE EMPNO,
  ADD COLUMN device_id VARCHAR(100) DEFAULT 'MASTER',
  ADD COLUMN is_synced BOOLEAN DEFAULT FALSE,
  ADD COLUMN sync_version INT DEFAULT 1,
  ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;

-- Indexing for Sync Performance
CREATE INDEX idx_empdet_sync ON empdet (is_synced, updated_at);
CREATE INDEX idx_empdet_uuid ON empdet (uuid);
```

---

## 🔄 2. Sync Engine Logic (Push/Pull)

### Client Side (Frontend)
1.  **Operation Record**: Every local change (Add/Update/Delete) marks the row as `is_synced = false`.
2.  **Sync Trigger**: Browser detects `Online` -> Calls `POST /sync/push` with all rows where `is_synced = false`.
3.  **Success Callback**: Upon successful response, client updates local rows to `is_synced = true`.

### Server Side (Backend)
1.  **Push Endpoint**: Receives records. If record exists (match UUID), it checks `sync_version`. If server version > client version (and not forced), it requests conflict resolution or overwrites based on rule.
2.  **Pull Endpoint**: Client sends `last_sync_timestamp`. Server returns all records where `updated_at > last_sync_timestamp`.

---

## 🏗 3. Refactored Backend Structure

```text
/backend
├── /config         # DB Pool, Env Var Parsing
├── /controllers    # HTTP Request Handling (Thin Layer)
├── /middleware     # Auth, RBAC, Validation, Error Handler
├── /models         # Data Access Objects (DB Queries)
├── /services       # Business Logic (Payroll Calculations)
├── /sync-engine    # Push/Pull Reconciliation Logic
├── /utils          # Logger, Date formatters, Crypto
└── index.js        # Server Entry
```

---

## ⚡ 4. Payroll Transaction Design

```javascript
// Example Service Logic
async function runPayroll(params) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        // 1. Calculate LOP/Gross/Net
        // 2. Insert into payroll_runs
        // 3. Insert into payroll_line_items
        // 4. Update employee YTD totals
        
        await connection.commit();
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}
```

---

## ☁️ 5. Future Cloud Readiness Checklist

*   [ ] **Statelessness**: Ensure no local storage of files/sessions (use S3/Redis later).
*   [ ] **Env Separation**: Use `.env.production` for cloud DB credentials.
*   [ ] **API Versioning**: Every endpoint starts with `/api/v1/`.
*   [ ] **Container-Ready**: No dependency on hardcoded host IP/Paths.
