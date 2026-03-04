/**
 * salaryRevision.controller.js — Salary Revision History & Approval
 *
 * Tracks salary structure changes per employee with effective dates and approval workflow.
 */

import dbManager from '../database/dbManager.js';
import { logAudit } from '../utils/auditLogger.js';
import { randomUUID } from 'crypto';

// ─── Ensure Tables Exist ─────────────────────────────────────────────────────

export async function ensureRevisionTables() {
    await dbManager.execute(`
        CREATE TABLE IF NOT EXISTS salary_revisions (
            id VARCHAR(50) PRIMARY KEY,
            empno VARCHAR(20) NOT NULL,
            empname VARCHAR(100),
            department VARCHAR(100),
            designation VARCHAR(100),
            effective_from DATE NOT NULL,
            effective_to DATE,
            basic DECIMAL(12,2) DEFAULT 0,
            grade_pay DECIMAL(12,2) DEFAULT 0,
            hata DECIMAL(12,2) DEFAULT 0,
            allowance DECIMAL(12,2) DEFAULT 0,
            da DECIMAL(12,2) DEFAULT 0,
            special DECIMAL(12,2) DEFAULT 0,
            interim DECIMAL(12,2) DEFAULT 0,
            phd DECIMAL(12,2) DEFAULT 0,
            mphil DECIMAL(12,2) DEFAULT 0,
            epf DECIMAL(12,2) DEFAULT 0,
            esi DECIMAL(12,2) DEFAULT 0,
            gross DECIMAL(12,2) DEFAULT 0,
            revision_type ENUM('ANNUAL_INCREMENT','PROMOTION','CORRECTION','JOINING','RESTRUCTURE') DEFAULT 'CORRECTION',
            status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
            reason TEXT,
            revised_by VARCHAR(50),
            approved_by VARCHAR(50),
            approved_at DATETIME,
            rejection_reason TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `, []).catch(() => { });

    // SQLite fallback
    await dbManager.execute(`
        CREATE TABLE IF NOT EXISTS salary_revisions (
            id TEXT PRIMARY KEY,
            empno TEXT NOT NULL,
            empname TEXT,
            department TEXT,
            designation TEXT,
            effective_from TEXT NOT NULL,
            effective_to TEXT,
            basic REAL DEFAULT 0,
            grade_pay REAL DEFAULT 0,
            hata REAL DEFAULT 0,
            allowance REAL DEFAULT 0,
            da REAL DEFAULT 0,
            special REAL DEFAULT 0,
            interim REAL DEFAULT 0,
            phd REAL DEFAULT 0,
            mphil REAL DEFAULT 0,
            epf REAL DEFAULT 0,
            esi REAL DEFAULT 0,
            gross REAL DEFAULT 0,
            revision_type TEXT DEFAULT 'CORRECTION',
            status TEXT DEFAULT 'PENDING',
            reason TEXT,
            revised_by TEXT,
            approved_by TEXT,
            approved_at TEXT,
            rejection_reason TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `, []).catch(() => { });
}

// Ensure tables on module load
ensureRevisionTables().catch(() => { });

// ─── Controller Functions ─────────────────────────────────────────────────────

/**
 * POST /api/salary-revisions
 * Create a new salary revision (starts as PENDING)
 */
export const createRevision = async (req, res) => {
    try {
        const {
            empno, effective_from, revision_type = 'CORRECTION', reason,
            basic = 0, grade_pay = 0, hata = 0, allowance = 0,
            da = 0, special = 0, interim = 0, phd = 0, mphil = 0,
            epf = 0, esi = 0,
        } = req.body;

        if (!empno || !effective_from) {
            return res.status(400).json({ success: false, message: 'empno and effective_from are required.' });
        }

        // Fetch employee details
        const [empRows] = await dbManager.query(
            'SELECT SNAME, DGroup, DESIGNATION FROM empdet WHERE EMPNO = ? LIMIT 1',
            [empno]
        );
        const emp = empRows?.[0] || {};

        const gross = [basic, grade_pay, hata, allowance, da, special, interim, phd, mphil]
            .reduce((s, v) => s + (parseFloat(v) || 0), 0);

        const id = randomUUID();
        await dbManager.execute(
            `INSERT INTO salary_revisions
             (id, empno, empname, department, designation, effective_from, revision_type, reason,
              basic, grade_pay, hata, allowance, da, special, interim, phd, mphil, epf, esi, gross,
              status, revised_by)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [id, empno, emp.SNAME || '', emp.DGroup || '', emp.DESIGNATION || '',
                effective_from, revision_type, reason || '',
                basic, grade_pay, hata, allowance, da, special, interim, phd, mphil, epf, esi, gross,
                'PENDING', req.user.username]
        );

        await logAudit({
            userId: req.user.username,
            username: req.user.name || req.user.username,
            actionType: 'CREATE_SALARY_REVISION',
            module: 'SALARY_REVISION',
            description: `Created salary revision for ${empno} effective ${effective_from}`,
            newValue: { empno, effective_from, revision_type },
        });

        res.status(201).json({ success: true, message: 'Salary revision created. Pending approval.', id });
    } catch (err) {
        console.error('[SalaryRevision] createRevision error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * PUT /api/salary-revisions/:id/approve
 */
export const approveRevision = async (req, res) => {
    try {
        const { id } = req.params;
        const { remark } = req.body;

        const [rows] = await dbManager.query('SELECT * FROM salary_revisions WHERE id = ?', [id]);
        if (!rows?.length) return res.status(404).json({ success: false, message: 'Revision not found.' });

        const rev = rows[0];
        if (rev.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: `Revision is already ${rev.status}.` });
        }

        await dbManager.execute(
            `UPDATE salary_revisions SET status = 'APPROVED', approved_by = ?, approved_at = CURRENT_TIMESTAMP, reason = COALESCE(?, reason)
             WHERE id = ?`,
            [req.user.username, remark || null, id]
        );

        // If effective_from is current month, update empdet immediately
        const now = new Date();
        const effDate = new Date(rev.effective_from);
        if (effDate.getMonth() === now.getMonth() && effDate.getFullYear() === now.getFullYear()) {
            await dbManager.execute(
                `UPDATE empdet SET PAY=?, GradePay=?, HATA=?, Allowance=?, DA=?, SPECIAL=?, INTERIM=?, PHD=?, MPHIL=?, EPF=?, ESI=?, UpdatedAt=CURRENT_TIMESTAMP
                 WHERE EMPNO=?`,
                [rev.basic, rev.grade_pay, rev.hata, rev.allowance, rev.da, rev.special, rev.interim,
                rev.phd, rev.mphil, rev.epf, rev.esi, rev.empno]
            );
        }

        await logAudit({
            userId: req.user.username,
            username: req.user.name || req.user.username,
            actionType: 'APPROVE_SALARY_REVISION',
            module: 'SALARY_REVISION',
            description: `Approved revision ${id} for ${rev.empno}`,
        });

        res.json({ success: true, message: 'Revision approved successfully.' });
    } catch (err) {
        console.error('[SalaryRevision] approveRevision error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * PUT /api/salary-revisions/:id/reject
 */
export const rejectRevision = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejection_reason } = req.body;

        if (!rejection_reason) {
            return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
        }

        await dbManager.execute(
            `UPDATE salary_revisions SET status = 'REJECTED', approved_by = ?, rejection_reason = ?, approved_at = CURRENT_TIMESTAMP
             WHERE id = ? AND status = 'PENDING'`,
            [req.user.username, rejection_reason, id]
        );

        res.json({ success: true, message: 'Revision rejected.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * GET /api/salary-revisions/:empno — Full history for one employee
 */
export const getRevisionsByEmployee = async (req, res) => {
    try {
        const [rows] = await dbManager.query(
            `SELECT * FROM salary_revisions WHERE empno = ? ORDER BY effective_from DESC`,
            [req.params.empno]
        );

        // Add YoY increment calculation
        const enriched = rows.map((r, i) => {
            const prev = rows[i + 1];
            const incrementPct = prev && prev.gross > 0
                ? (((r.gross - prev.gross) / prev.gross) * 100).toFixed(2)
                : null;
            return { ...r, increment_pct: incrementPct };
        });

        res.json({ success: true, data: enriched });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * GET /api/salary-revisions/pending — All pending revisions
 */
export const getAllPendingRevisions = async (req, res) => {
    try {
        const [rows] = await dbManager.query(
            `SELECT * FROM salary_revisions WHERE status = 'PENDING' ORDER BY created_at DESC`,
            []
        );
        res.json({ success: true, data: rows, total: rows.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * GET /api/salary-revisions/bulk?dept=&year=
 */
export const getBulkRevisionReport = async (req, res) => {
    try {
        const { dept, year, status } = req.query;
        let sql = 'SELECT * FROM salary_revisions WHERE 1=1';
        const params = [];

        if (dept) { sql += ' AND department = ?'; params.push(dept); }
        if (year) { sql += ' AND strftime(\'%Y\', effective_from) = ?'; params.push(String(year)); }
        if (status) { sql += ' AND status = ?'; params.push(status); }

        sql += ' ORDER BY empno, effective_from DESC';

        const [rows] = await dbManager.query(sql, params);
        res.json({ success: true, data: rows, total: rows.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
