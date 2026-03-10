/**
 * income.controller.js — Income Management API
 */

import dbManager from '../database/dbManager.js';
import { logAudit } from '../utils/auditLogger.js';
import cache from '../services/cache.service.js';
import { randomUUID } from 'crypto';

function getCurrentFY(date = new Date()) {
    const m = date.getMonth() + 1; // 1-12
    const y = date.getFullYear();
    return m >= 4 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

function getMonthYear(dateStr) {
    const d = new Date(dateStr);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${m}-${d.getFullYear()}`;
}

// GET /api/income?month=&year=&category=&page=&limit=
export const listIncome = async (req, res) => {
    try {
        const { month, year, category, page = 1, limit = 50, search } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let sql = `
            SELECT ie.*, ic.name as category_name, ic.code as category_code
            FROM income_entries ie
            JOIN income_categories ic ON ie.category_id = ic.id
            WHERE ie.is_deleted = 0
        `;
        const params = [];

        if (month && year) {
            sql += ' AND ie.month_year = ?';
            params.push(`${month.padStart(2, '0')}-${year}`);
        } else if (year) {
            sql += ' AND ie.financial_year = ?';
            params.push(getCurrentFY(new Date(parseInt(year), 0)));
        }

        if (category) { sql += ' AND ie.category_id = ?'; params.push(category); }
        if (search) {
            sql += ' AND (ie.description LIKE ? OR ie.received_from LIKE ? OR ie.reference_no LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Count query
        const [countRows] = await dbManager.query(sql.replace('ie.*, ic.name as category_name, ic.code as category_code', 'COUNT(*) as total'), params);
        const total = countRows?.[0]?.total || 0;

        sql += ' ORDER BY ie.received_date DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [rows] = await dbManager.query(sql, params);

        res.json({
            success: true,
            data: rows,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            hasNext: offset + rows.length < total,
        });
    } catch (err) {
        console.error('[Income] listIncome error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/income
export const createIncome = async (req, res) => {
    try {
        const {
            category_id, amount, description, received_from,
            payment_mode = 'BANK', reference_no, received_date,
            bank_reference, currency = 'INR',
        } = req.body;

        if (!category_id || !amount || !received_date) {
            return res.status(400).json({ success: false, message: 'category_id, amount, and received_date are required.' });
        }
        if (parseFloat(amount) <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be greater than 0.' });
        }

        const id = randomUUID();
        const monthYear = getMonthYear(received_date);
        const financialYear = getCurrentFY(new Date(received_date));

        await dbManager.execute(
            `INSERT INTO income_entries
             (id, category_id, amount, currency, description, reference_no, received_date,
              received_from, payment_mode, bank_reference, financial_year, month_year, created_by)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [id, category_id, amount, currency, description || '', reference_no || '',
                received_date, received_from || '', payment_mode, bank_reference || '',
                financialYear, monthYear, req.user.username]
        );

        cache.invalidate(`finance:`);
        cache.invalidate(`income:${monthYear}`);

        await logAudit({
            userId: req.user.username, username: req.user.name || req.user.username,
            actionType: 'CREATE_INCOME', module: 'INCOME',
            description: `Created income entry ₹${amount} from ${received_from}`,
            newValue: { category_id, amount, received_date },
        });

        res.status(201).json({ success: true, message: 'Income entry created.', id });
    } catch (err) {
        console.error('[Income] createIncome error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/income/:id
export const updateIncome = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_id, amount, description, received_from, payment_mode,
            reference_no, received_date, bank_reference } = req.body;

        const [rows] = await dbManager.query('SELECT * FROM income_entries WHERE id = ? AND is_deleted = 0', [id]);
        if (!rows?.length) return res.status(404).json({ success: false, message: 'Entry not found.' });

        if (amount && parseFloat(amount) <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be greater than 0.' });
        }

        await dbManager.execute(
            `UPDATE income_entries SET
             category_id = COALESCE(?, category_id),
             amount = COALESCE(?, amount),
             description = COALESCE(?, description),
             received_from = COALESCE(?, received_from),
             payment_mode = COALESCE(?, payment_mode),
             reference_no = COALESCE(?, reference_no),
             received_date = COALESCE(?, received_date),
             bank_reference = COALESCE(?, bank_reference),
             updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [category_id || null, amount || null, description || null,
            received_from || null, payment_mode || null, reference_no || null,
            received_date || null, bank_reference || null, id]
        );

        cache.invalidate('finance:');
        res.json({ success: true, message: 'Income entry updated.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /api/income/:id (soft delete)
export const deleteIncome = async (req, res) => {
    try {
        await dbManager.execute(
            'UPDATE income_entries SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [req.params.id]
        );
        cache.invalidate('finance:');
        res.json({ success: true, message: 'Income entry deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/income/summary/:monthyear
export const getIncomeSummary = async (req, res) => {
    try {
        const { monthyear } = req.params;
        const cacheKey = `income:${monthyear}:summary`;
        const cached = cache.get(cacheKey);
        if (cached) return res.json({ success: true, ...cached });

        const [rows] = await dbManager.query(
            `SELECT ic.name, ic.code, SUM(ie.amount) as total, COUNT(*) as count
             FROM income_entries ie
             JOIN income_categories ic ON ie.category_id = ic.id
             WHERE ie.month_year = ? AND ie.is_deleted = 0
             GROUP BY ic.id, ic.name, ic.code`,
            [monthyear]
        );

        const [totRow] = await dbManager.query(
            `SELECT SUM(amount) as total, COUNT(*) as count FROM income_entries
             WHERE month_year = ? AND is_deleted = 0`,
            [monthyear]
        );

        const summary = {
            monthYear: monthyear,
            total: totRow?.[0]?.total || 0,
            count: totRow?.[0]?.count || 0,
            byCategory: rows,
        };

        cache.set(cacheKey, summary, cache.TTL.SUMMARY);
        res.json({ success: true, ...summary });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/income/categories
export const getIncomeCategories = async (req, res) => {
    try {
        const [rows] = await dbManager.query(
            'SELECT * FROM income_categories WHERE is_active = 1 ORDER BY name', []
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
