/**
 * Migration 004 — Income & Expense Module Tables
 * Run: node server/migrations/004_income_expense.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const SQL = `

-- ── Income Categories ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS income_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO income_categories (code, name, description) VALUES
    ('SALARY_RECOVERY',    'Salary Recovery',       'Recovery of salary advances or overpayments'),
    ('PROJECT_INCOME',     'Project Income',         'Income from project contracts'),
    ('CONSULTANT_CHARGES', 'Consultant Charges',     'Payments received for consulting services'),
    ('TRAINING_FEES',      'Training Fees',          'Fees collected for training programs'),
    ('GRANTS',             'Grants & Funding',       'Government or external grants received'),
    ('MISC_INCOME',        'Miscellaneous Income',   'Other miscellaneous receipts');

-- ── Expense Categories ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expense_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    budget_monthly DECIMAL(15,2) DEFAULT 0,
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO expense_categories (code, name, description, budget_monthly) VALUES
    ('SALARIES',         'Salaries & Wages',         'Employee payroll costs',               500000),
    ('RENT',             'Rent & Utilities',          'Office rent and utility bills',        50000),
    ('UTILITIES',        'Utilities',                 'Electricity, water, internet',         15000),
    ('TRAVEL',           'Travel & Transport',        'Travel reimbursements and transport',  20000),
    ('IT_INFRA',         'IT Infrastructure',         'Software, hardware, hosting',          30000),
    ('MARKETING',        'Marketing & Advertising',   'Promotional expenses',                 25000),
    ('LEGAL_COMPLIANCE', 'Legal & Compliance',        'Legal fees and compliance costs',      10000),
    ('INSURANCE',        'Insurance',                 'Staff and asset insurance premiums',   20000),
    ('OFFICE_SUPPLIES',  'Office Supplies',           'Stationery and office consumables',    5000),
    ('MISCELLANEOUS',    'Miscellaneous',             'Other operational expenses',           10000);

-- ── Income Entries ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS income_entries (
    id VARCHAR(50) PRIMARY KEY,
    category_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK(amount > 0),
    currency VARCHAR(10) DEFAULT 'INR',
    description TEXT,
    reference_no VARCHAR(100),
    received_date DATE NOT NULL,
    received_from VARCHAR(200),
    payment_mode ENUM('BANK','CASH','CHEQUE','UPI','NEFT','RTGS') DEFAULT 'BANK',
    bank_reference VARCHAR(100),
    financial_year VARCHAR(10),
    month_year VARCHAR(10),
    attachment_path VARCHAR(500),
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES income_categories(id)
);

CREATE INDEX IF NOT EXISTS idx_income_monthyear   ON income_entries(month_year);
CREATE INDEX IF NOT EXISTS idx_income_category    ON income_entries(category_id);
CREATE INDEX IF NOT EXISTS idx_income_date        ON income_entries(received_date);
CREATE INDEX IF NOT EXISTS idx_income_deleted     ON income_entries(is_deleted);

-- ── Expense Entries ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expense_entries (
    id VARCHAR(50) PRIMARY KEY,
    category_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK(amount > 0),
    currency VARCHAR(10) DEFAULT 'INR',
    description TEXT,
    reference_no VARCHAR(100),
    expense_date DATE NOT NULL,
    paid_to VARCHAR(200),
    payment_mode ENUM('BANK','CASH','CHEQUE','UPI','NEFT','RTGS') DEFAULT 'BANK',
    bank_reference VARCHAR(100),
    invoice_no VARCHAR(100),
    financial_year VARCHAR(10),
    month_year VARCHAR(10),
    attachment_path VARCHAR(500),
    approved_by VARCHAR(50),
    approval_status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
    rejection_reason TEXT,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES expense_categories(id)
);

CREATE INDEX IF NOT EXISTS idx_expense_monthyear  ON expense_entries(month_year);
CREATE INDEX IF NOT EXISTS idx_expense_category   ON expense_entries(category_id);
CREATE INDEX IF NOT EXISTS idx_expense_date       ON expense_entries(expense_date);
CREATE INDEX IF NOT EXISTS idx_expense_status     ON expense_entries(approval_status);
CREATE INDEX IF NOT EXISTS idx_expense_deleted    ON expense_entries(is_deleted);

-- ── Budget Targets ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS budget_targets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    category_type ENUM('INCOME','EXPENSE') NOT NULL,
    financial_year VARCHAR(10) NOT NULL,
    month_year VARCHAR(10),
    target_amount DECIMAL(15,2) DEFAULT 0,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_budget (category_id, category_type, financial_year, month_year)
);

-- ── Financial Summary Cache ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS financial_summary_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    financial_year VARCHAR(10) NOT NULL,
    month_year VARCHAR(10),
    total_income DECIMAL(15,2) DEFAULT 0,
    total_expense DECIMAL(15,2) DEFAULT 0,
    net_profit DECIMAL(15,2) DEFAULT 0,
    payroll_cost DECIMAL(15,2) DEFAULT 0,
    non_payroll_expense DECIMAL(15,2) DEFAULT 0,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_fin_summary (financial_year, month_year)
);
`;

async function run() {
    const dbName = process.env.DB_NAME || 'billing_db';
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: dbName,
        multipleStatements: true,
    });

    console.log('\n💰 Migration 004 — Income & Expense Module Tables');
    console.log('═'.repeat(55));

    try {
        await conn.query(SQL);
        console.log('✅ All tables created and seeded successfully.');
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    } finally {
        await conn.end();
    }
}

run();
