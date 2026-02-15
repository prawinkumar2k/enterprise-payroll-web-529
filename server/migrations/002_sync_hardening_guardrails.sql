-- Migration: 002_sync_hardening_guardrails
-- Purpose: Implement idempotency, transactional integrity, and performance for Cloud Sync

-- 1. Sync Execution Ledger (Idempotency)
CREATE TABLE IF NOT EXISTS sync_batches (
    batch_id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    direction TEXT NOT NULL, -- PUSH or PULL
    status TEXT NOT NULL, -- PENDING, SUCCESS, FAILED
    record_count INTEGER DEFAULT 0,
    started_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    error_message TEXT
);

-- 2. Enhanced Composite Indexes for Multi-Tenant Isolation & Performance
CREATE INDEX IF NOT EXISTS idx_empdet_tenant_uuid ON empdet(tenant_id, uuid);
CREATE INDEX IF NOT EXISTS idx_emppay_tenant_uuid ON emppay(tenant_id, uuid);
CREATE INDEX IF NOT EXISTS idx_attendance_tenant_uuid ON staffattendance(tenant_id, uuid);
CREATE INDEX IF NOT EXISTS idx_audit_tenant_uuid ON audit_logs(tenant_id, uuid);

-- 3. Sync State Persistence on Tables
-- (Already have is_synced, sync_version in many, but ensuring consistency)
-- Some tables might miss sync_version if they were added late.

-- Add sync_version to audit_logs if it doesn't exist (it doesn't in the base schema)
-- SQLite doesn't support 'IF NOT EXISTS' for columns, safely adding via app logic or ignoring if duplicate
-- But for a migration script, we can be explicit.
ALTER TABLE audit_logs ADD COLUMN sync_version INTEGER DEFAULT 1;
ALTER TABLE audit_logs ADD COLUMN is_synced INTEGER DEFAULT 1; -- Audit logs are usually appended, but cloud might sync them back

-- 4. Sync Audit Trail (Deep Visibility)
CREATE TABLE IF NOT EXISTS sync_audit_trail (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id TEXT,
    table_name TEXT,
    record_uuid TEXT,
    action TEXT, -- INSERT, UPDATE, CONFLICT_IGNORED
    status TEXT, -- SUCCESS, ERROR
    tenant_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(batch_id) REFERENCES sync_batches(batch_id)
);
