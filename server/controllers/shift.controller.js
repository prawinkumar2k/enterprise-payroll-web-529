import db from '../database/dbManager.js';
import { randomUUID } from 'crypto';

/**
 * Get all shift definitions
 */
export const getShifts = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM shift_definitions ORDER BY id ASC');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Assign a shift to an employee
 */
export const assignShift = async (req, res) => {
    const { emp_no, shift_id, effective_date } = req.body;
    if (!emp_no || !shift_id || !effective_date) return res.status(400).json({ success: false, message: 'Missing fields.' });

    try {
        await db.execute(
            'INSERT INTO employee_shifts (emp_no, shift_id, effective_date) VALUES (?, ?, ?)',
            [emp_no, shift_id, effective_date]
        );
        res.json({ success: true, message: 'Shift assigned successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get current roster for a department
 */
export const getRoster = async (req, res) => {
    const { date } = req.query;
    try {
        const [rows] = await db.query(`
            SELECT es.*, sd.shift_name, sd.start_time, sd.end_time, ed.SNAME 
            FROM employee_shifts es
            JOIN shift_definitions sd ON es.shift_id = sd.id
            JOIN empdet ed ON es.emp_no = ed.EMPNO
            WHERE es.is_active = 1 AND es.effective_date = ?
        `, [date || new Date().toISOString().split('T')[0]]);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
