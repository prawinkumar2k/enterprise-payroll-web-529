-- Migration: 001_multi_tenant_support
-- Purpose: Add multi-tenancy support for SaaS transformation

-- 1. Update Employee Table
ALTER TABLE empdet ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'local';
CREATE INDEX IF NOT EXISTS idx_empdet_tenant ON empdet(tenant_id);

-- 2. Update Salary Table
ALTER TABLE emppay ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'local';
CREATE INDEX IF NOT EXISTS idx_emppay_tenant ON emppay(tenant_id);

-- 3. Update Attendance Table
ALTER TABLE staffattendance ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'local';
CREATE INDEX IF NOT EXISTS idx_attendance_tenant ON staffattendance(tenant_id);

-- 4. Update Audit Logs Table
ALTER TABLE audit_logs ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'local';
CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_logs(tenant_id);
