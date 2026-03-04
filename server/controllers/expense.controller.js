/**
 * expense.controller.js — Expense Management API
 */

import dbManager from '../database/dbManager.js';
import { logAudit } from '../utils/auditLogger.js';
import cache from '../services/cache.service.js';
import { randomUUID } from 'crypto';

function getCurrentFY(date = new Date()) {
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    return m >= 4 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

function getMonthYear(dateStr) {
    const d = new Date(dateStr);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${m}-${d.getFullYear()}`;
}

// GET /api/expense
export const listExpenses = async (req, res) => {
    try {
        const { month, year, category, status, page = 1, limit = 50, search } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let sql = `
            SELECT ee.*, ec.name as category_name, ec.code as category_code, ec.budget_monthly
            FROM expense_entries ee
            JOIN expense_categories ec ON ee.category_id = ec.id
            WHERE ee.is_deleted = 0
        `;
        const params = [];

        if (month && year) {
            sql += ' AND ee.month_year = ?';
            params.push(`${month.padStart(2, '0')}-${year}`);
        }
        if (category) { sql += ' AND ee.category_id = ?'; params.push(category); }
        if (status) { sql += ' AND ee.approval_status = ?'; params.push(status); }
        if (search) {
            sql += ' AND (ee.description LIKE ? OR ee.paid_to LIKE ? OR ee.invoice_no LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const [countRows] = await dbManager.query(
            sql.replace('ee.*, ec.name as category_name, ec.code as category_code, ec.budget_monthly', 'COUNT(*) as total'),
            params
        );
        const total = countRows?.[0]?.total || 0;

        sql += ' ORDER BY ee.expense_date DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [rows] = await dbManager.query(sql, params);

        res.json({
            success: true, data: rows, total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            hasNext: offset + rows.length < total,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/expense
export const createExpense = async (req, res) => {
    try {
        const {
            category_id, amount, description, paid_to,
            payment_mode = 'BANK', reference_no, expense_date,
            bank_reference, invoice_no, currency = 'INR',
        } = req.body;

        if (!category_id || !amount || !expense_date) {
            return res.status(400).json({ success: false, message: 'category_id, amount, and expense_date are required.' });
        }
        if (parseFloat(amount) <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be greater than 0.' });
        }

        const id = randomUUID();
        const monthYear = getMonthYear(expense_date);
        const financialYear = getCurrentFY(new Date(expense_date));

        await dbManager.execute(
            `INSERT INTO expense_entries
             (id, category_id, amount, currency, description, reference_no, expense_date,
              paid_to, payment_mode, bank_reference, invoice_no, financial_year, month_year,
              approval_status, created_by)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [id, category_id, amount, currency, description || '', reference_no || '',
                expense_date, paid_to || '', payment_mode, bank_reference || '',
                invoice_no || '', financialYear, monthYear, 'PENDING', req.user.username]
        );

        cache.invalidate('finance:');
        cache.invalidate(`expense:${monthYear}`);

        await logAudit({
            userId: req.user.username, username: req.user.name || req.user.username,
            actionType: 'CREATE_EXPENSE', module: 'EXPENSE',
            description: `Created expense ₹${amount} paid to ${paid_to}`,
            newValue: { category_id, amount, expense_date },
        });

        res.status(201).json({ success: true, message: 'Expense entry created. Pending approval.', id });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/expense/:id
export const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await dbManager.query(
            'SELECT * FROM expense_entries WHERE id = ? AND is_deleted = 0', [id]
        );
        if (!rows?.length) return res.status(404).json({ success: false, message: 'Expense not found.' });
        if (rows[0].approval_status === 'APPROVED') {
            return res.status(400).json({ success: false, message: 'Cannot edit an approved expense.' });
        }

        const { category_id, amount, description, paid_to, payment_mode,
            reference_no, expense_date, bank_reference, invoice_no } = req.body;

        await dbManager.execute(
            `UPDATE expense_entries SET
             category_id = COALESCE(?, category_id),
             amount = COALESCE(?, amount),
             description = COALESCE(?, description),
             paid_to = COALESCE(?, paid_to),
             payment_mode = COALESCE(?, payment_mode),
             reference_no = COALESCE(?, reference_no),
             expense_date = COALESCE(?, expense_date),
             bank_reference = COALESCE(?, bank_reference),
             invoice_no = COALESCE(?, invoice_no),
             updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [category_id || null, amount || null, description || null, paid_to || null,
            payment_mode || null, reference_no || null, expense_date || null,
            bank_reference || null, invoice_no || null, id]
        );

        cache.invalidate('finance:');
        res.json({ success: true, message: 'Expense updated.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /api/expense/:id
export const deleteExpense = async (req, res) => {
    try {
        await dbManager.execute(
            'UPDATE expense_entries SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [req.params.id]
        );
        cache.invalidate('finance:');
        res.json({ success: true, message: 'Expense deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/expense/:id/approve
export const approveExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { remark } = req.body;

        await dbManager.execute(
            `UPDATE expense_entries SET approval_status = 'APPROVED', approved_by = ?,
             updated_at = CURRENT_TIMESTAMP WHERE id = ? AND is_deleted = 0`,
            [req.user.username, id]
        );

        await logAudit({
            userId: req.user.username, username: req.user.name || req.user.username,
            actionType: 'APPROVE_EXPENSE', module: 'EXPENSE',
            description: `Approved expense ${id}`,
        });

        cache.invalidate('finance:');
        res.json({ success: true, message: 'Expense approved.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/expense/:id/reject
export const rejectExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejection_reason } = req.body;
        if (!rejection_reason) {
            return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
        }

        await dbManager.execute(
            `UPDATE expense_entries SET approval_status = 'REJECTED', approved_by = ?,
             rejection_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND is_deleted = 0`,
            [req.user.username, rejection_reason, id]
        );

        cache.invalidate('finance:');
        res.json({ success: true, message: 'Expense rejected.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/expense/summary/:monthyear
export const getExpenseSummary = async (req, res) => {
    try {
        const { monthyear } = req.params;
        const cacheKey = `expense:${monthyear}:summary`;
        const cached = cache.get(cacheKey);
        if (cached) return res.json({ success: true, ...cached });

        const [rows] = await dbManager.query(
            `SELECT ec.name, ec.code, ec.budget_monthly,
                    SUM(CASE WHEN ee.approval_status='APPROVED' THEN ee.amount ELSE 0 END) as approved_total,
                    SUM(ee.amount) as requested_total,
                    COUNT(*) as count,
                    COUNT(CASE WHEN ee.approval_status='PENDING' THEN 1 END) as pending_count
             FROM expense_entries ee
             JOIN expense_categories ec ON ee.category_id = ec.id
             WHERE ee.month_year = ? AND ee.is_deleted = 0
             GROUP BY ec.id, ec.name, ec.code, ec.budget_monthly`,
            [monthyear]
        );

        const [totRow] = await dbManager.query(
            `SELECT SUM(CASE WHEN approval_status='APPROVED' THEN amount ELSE 0 END) as approved_total,
                    SUM(amount) as total,
                    COUNT(*) as count,
                    COUNT(CASE WHEN approval_status='PENDING' THEN 1 END) as pending_count
             FROM expense_entries WHERE month_year = ? AND is_deleted = 0`,
            [monthyear]
        );

        const summary = {
            monthYear: monthyear,
            total: totRow?.[0]?.total || 0,
            approvedTotal: totRow?.[0]?.approved_total || 0,
            count: totRow?.[0]?.count || 0,
            pendingCount: totRow?.[0]?.pending_count || 0,
            byCategory: rows,
        };

        cache.set(cacheKey, summary, cache.TTL.SUMMARY);
        res.json({ success: true, ...summary });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/expense/categories
export const getExpenseCategories = async (req, res) => {
    try {
        const [rows] = await dbManager.query(
            'SELECT * FROM expense_categories WHERE is_active = 1 ORDER BY name', []
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/finance/dashboard
export const getFinanceDashboard = async (req, res) => {
    try {
        const { year, month } = req.query;
        const now = new Date();
        const qYear = year || now.getFullYear();
        const qMonth = month ? month.padStart(2, '0') : String(now.getMonth() + 1).padStart(2, '0');
        const monthYear = `${qMonth}-${qYear}`;

        const cacheKey = `finance:dashboard:${monthYear}`;
        const cached = cache.get(cacheKey);
        if (cached) return res.json({ success: true, data: cached });

        // Total income for month
        const [incomeRows] = await dbManager.query(
            `SELECT SUM(amount) as total, COUNT(*) as count FROM income_entries
             WHERE month_year = ? AND is_deleted = 0`, [monthYear]
        );

        // Total expense for month (approved only)
        const [expenseRows] = await dbManager.query(
            `SELECT SUM(amount) as total, COUNT(*) as count FROM expense_entries
             WHERE month_year = ? AND is_deleted = 0 AND approval_status = 'APPROVED'`, [monthYear]
        );

        // Payroll cost from emppay
        const [payrollRows] = await dbManager.query(
            `SELECT SUM(CAST(NETSAL AS DECIMAL(15,2))) as total, COUNT(*) as count
             FROM emppay WHERE MONTHYEAR = ? AND deleted_at IS NULL`, [monthYear]
        );

        // Monthly trend (last 6 months)
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(parseInt(qYear), parseInt(qMonth) - 1 - i, 1);
            const my = `${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
            months.push(my);
        }

        const trendData = await Promise.all(months.map(async (my) => {
            const [inc] = await dbManager.query(
                `SELECT SUM(amount) as t FROM income_entries WHERE month_year = ? AND is_deleted = 0`, [my]
            );
            const [exp] = await dbManager.query(
                `SELECT SUM(amount) as t FROM expense_entries WHERE month_year = ? AND is_deleted = 0 AND approval_status = 'APPROVED'`, [my]
            );
            const [pay] = await dbManager.query(
                `SELECT SUM(CAST(NETSAL AS DECIMAL(15,2))) as t FROM emppay WHERE MONTHYEAR = ? AND deleted_at IS NULL`, [my]
            );
            return { month: my, income: inc?.[0]?.t || 0, expense: exp?.[0]?.t || 0, payroll: pay?.[0]?.t || 0 };
        }));

        const totalIncome = incomeRows?.[0]?.total || 0;
        const totalExpense = (expenseRows?.[0]?.total || 0) + (payrollRows?.[0]?.total || 0);
        const payrollCost = payrollRows?.[0]?.total || 0;

        const data = {
            monthYear,
            income: { total: totalIncome, count: incomeRows?.[0]?.count || 0 },
            expense: { total: expenseRows?.[0]?.total || 0, count: expenseRows?.[0]?.count || 0 },
            payrollCost,
            totalExpense,
            netProfit: totalIncome - totalExpense,
            payrollPct: totalExpense > 0 ? ((payrollCost / totalExpense) * 100).toFixed(1) : '0',
            monthlyTrend: trendData,
        };

        cache.set(cacheKey, data, cache.TTL.DASHBOARD);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
