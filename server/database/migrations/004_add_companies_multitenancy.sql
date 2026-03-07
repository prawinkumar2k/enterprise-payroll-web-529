-- ============================================================
-- Migration 004: Multi-Company / Multi-Tenant Support
-- Run once against your MySQL database.
-- ============================================================

-- 1. Companies master table
CREATE TABLE IF NOT EXISTS companies (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    company_code  VARCHAR(50)  UNIQUE NOT NULL,
    company_name  VARCHAR(100) NOT NULL,
    is_active     TINYINT(1)   NOT NULL DEFAULT 1,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add company_id to userdetails (if not already present)
ALTER TABLE userdetails
    ADD COLUMN IF NOT EXISTS company_id INT NOT NULL DEFAULT 1
        COMMENT 'FK → companies.id';

-- 3. Foreign-key constraint (skip if re-running)
ALTER TABLE userdetails
    ADD CONSTRAINT fk_userdetails_company
        FOREIGN KEY (company_id) REFERENCES companies(id)
        ON DELETE CASCADE;

-- 4. Composite unique index  (company_id + UserID must be unique)
ALTER TABLE userdetails
    ADD CONSTRAINT uq_company_userid UNIQUE (company_id, UserID);

-- 5. Seed a default company so existing rows remain valid
INSERT IGNORE INTO companies (id, company_code, company_name)
VALUES (1, 'DEFAULT', 'Default Company');

-- 6. (Optional) seed a second sample company
-- INSERT IGNORE INTO companies (company_code, company_name)
-- VALUES ('COMP002', 'Levroun Innovations LLP');
