/**
 * incomeExpense.controller.js
 * CRUD + summary for income/expense entries (per-tenant).
 */
import dbManager from '../database/dbManager.js';

// ─────────────────────────────────────────────
// GET /api/income-expense?type=income|expense&month_year=MM-YYYY&page=1&limit=50
// ─────────────────────────────────────────────
export async function getAll(req, res) {
    try {
        const { type, month_year, page = 1, limit = 100 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let where = 'WHERE deleted_at IS NULL';
        const params = [];

        if (type && (type === 'income' || type === 'expense')) {
            where += ' AND type = ?';
            params.push(type);
        }
        if (month_year) {
            where += ' AND month_year = ?';
            params.push(month_year);
        }

        const countSql = `SELECT COUNT(*) AS total FROM income_expense ${where}`;
        const dataSql  = `SELECT * FROM income_expense ${where} ORDER BY transaction_date DESC, id DESC LIMIT ? OFFSET ?`;

        const [[countRow]] = await dbManager.query(countSql, params);
        const [rows]       = await dbManager.query(dataSql, [...params, parseInt(limit), offset]);

        res.json({ success: true, data: rows, total: countRow.total, page: parseInt(page), limit: parseInt(limit) });
    } catch (err) {
        console.error('[incomeExpense] getAll error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
}

// ─────────────────────────────────────────────
// GET /api/income-expense/summary?month_year=MM-YYYY
// Returns totals per type/category for a given month
// ─────────────────────────────────────────────
export async function getSummary(req, res) {
    try {
        const { month_year } = req.query;
        let where = 'WHERE deleted_at IS NULL';
        const params = [];
        if (month_year) {
            where += ' AND month_year = ?';
            params.push(month_year);
        }

        const sql = `
            SELECT
                type,
                category,
                SUM(amount) AS total_amount,
                COUNT(*) AS entry_count
            FROM income_expense
            ${where}
            GROUP BY type, category
            ORDER BY type, total_amount DESC
        `;
        const [rows] = await dbManager.query(sql, params);

        // Aggregate totals
        let totalIncome  = 0;
        let totalExpense = 0;
        for (const r of rows) {
            if (r.type === 'income')  totalIncome  += parseFloat(r.total_amount);
            if (r.type === 'expense') totalExpense += parseFloat(r.total_amount);
        }

        res.json({
            success: true,
            data: rows,
            totalIncome,
            totalExpense,
            netBalance: totalIncome - totalExpense,
        });
    } catch (err) {
        console.error('[incomeExpense] getSummary error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
}

// ─────────────────────────────────────────────
// POST /api/income-expense
// ─────────────────────────────────────────────
export async function create(req, res) {
    try {
        const {
            type, category, description, amount,
            transaction_date, month_year, reference_no, remarks
        } = req.body;

        if (!type || !category || !amount || !transaction_date || !month_year) {
            return res.status(400).json({ success: false, message: 'type, category, amount, transaction_date, month_year are required' });
        }
        if (type !== 'income' && type !== 'expense') {
            return res.status(400).json({ success: false, message: 'type must be "income" or "expense"' });
        }
        if (parseFloat(amount) <= 0) {
            return res.status(400).json({ success: false, message: 'amount must be greater than 0' });
        }

        const created_by = req.user?.username || req.user?.UserID || 'system';

        const [result] = await dbManager.query(
            `INSERT INTO income_expense
             (type, category, description, amount, transaction_date, month_year, reference_no, remarks, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [type, category, description || null, parseFloat(amount), transaction_date, month_year,
             reference_no || null, remarks || null, created_by]
        );

        const [[newRow]] = await dbManager.query('SELECT * FROM income_expense WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: newRow, message: `${type} entry created successfully` });
    } catch (err) {
        console.error('[incomeExpense] create error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
}

// ─────────────────────────────────────────────
// PUT /api/income-expense/:id
// ─────────────────────────────────────────────
export async function update(req, res) {
    try {
        const { id } = req.params;
        const {
            type, category, description, amount,
            transaction_date, month_year, reference_no, remarks
        } = req.body;

        // Ensure record exists and not deleted
        const [[existing]] = await dbManager.query(
            'SELECT id FROM income_expense WHERE id = ? AND deleted_at IS NULL', [id]
        );
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Entry not found' });
        }

        if (type && type !== 'income' && type !== 'expense') {
            return res.status(400).json({ success: false, message: 'type must be "income" or "expense"' });
        }
        if (amount !== undefined && parseFloat(amount) <= 0) {
            return res.status(400).json({ success: false, message: 'amount must be greater than 0' });
        }

        await dbManager.query(
            `UPDATE income_expense SET
                type             = COALESCE(?, type),
                category         = COALESCE(?, category),
                description      = COALESCE(?, description),
                amount           = COALESCE(?, amount),
                transaction_date = COALESCE(?, transaction_date),
                month_year       = COALESCE(?, month_year),
                reference_no     = COALESCE(?, reference_no),
                remarks          = COALESCE(?, remarks),
                updated_at       = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [type || null, category || null, description !== undefined ? description : null,
             amount !== undefined ? parseFloat(amount) : null,
             transaction_date || null, month_year || null,
             reference_no !== undefined ? reference_no : null,
             remarks !== undefined ? remarks : null, id]
        );

        const [[updated]] = await dbManager.query('SELECT * FROM income_expense WHERE id = ?', [id]);
        res.json({ success: true, data: updated, message: 'Entry updated successfully' });
    } catch (err) {
        console.error('[incomeExpense] update error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
}

// ─────────────────────────────────────────────
// DELETE /api/income-expense/:id  (soft delete)
// ─────────────────────────────────────────────
export async function remove(req, res) {
    try {
        const { id } = req.params;

        const [[existing]] = await dbManager.query(
            'SELECT id, type FROM income_expense WHERE id = ? AND deleted_at IS NULL', [id]
        );
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Entry not found' });
        }

        await dbManager.query(
            'UPDATE income_expense SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]
        );
        res.json({ success: true, message: `${existing.type} entry deleted` });
    } catch (err) {
        console.error('[incomeExpense] remove error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
}

// ─────────────────────────────────────────────
// GET /api/income-expense/categories
// Returns distinct categories for autocomplete
// ─────────────────────────────────────────────
export async function getCategories(req, res) {
    try {
        const { type } = req.query;
        let where = 'WHERE deleted_at IS NULL';
        const params = [];
        if (type) { where += ' AND type = ?'; params.push(type); }

        const [rows] = await dbManager.query(
            `SELECT DISTINCT category FROM income_expense ${where} ORDER BY category`, params
        );
        res.json({ success: true, data: rows.map(r => r.category) });
    } catch (err) {
        console.error('[incomeExpense] getCategories error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
}
