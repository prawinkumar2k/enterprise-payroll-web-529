import db from '../database/dbManager.js';
import { randomUUID } from 'crypto';
import cache from '../services/cache.service.js';

/**
 * Get all leave types (config)
 */
export const getLeaveTypes = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM leave_types ORDER BY type_name ASC');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Submit a new leave request (Employee ESS)
 */
export const applyLeave = async (req, res) => {
    const { leave_type_id, start_date, end_date, reason } = req.body;
    const emp_no = req.user.username; // ESS user's employee number

    if (!leave_type_id || !start_date || !end_date) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    try {
        // 1. Check for overlapping requests
        const [overlap] = await db.query(
            `SELECT id FROM leave_requests 
             WHERE emp_no = ? AND status IN ('PENDING', 'APPROVED')
             AND (start_date <= ? AND end_date >= ?)`,
            [emp_no, end_date, start_date]
        );

        if (overlap.length > 0) {
            return res.status(409).json({ success: false, message: 'Overlapping leave request already exists for this period.' });
        }

        // 2. Calculate duration
        const start = new Date(start_date);
        const end = new Date(end_date);
        const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

        // 3. Atomic Insert
        await db.execute(
            `INSERT INTO leave_requests (uuid, emp_no, leave_type_id, start_date, end_date, total_days, reason, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [randomUUID(), emp_no, leave_type_id, start_date, end_date, diffDays, reason || '', 'PENDING']
        );

        res.json({ success: true, message: `Leave request for ${diffDays} day(s) submitted.` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Approve/Reject Leave (HR/Admin)
 */
export const processLeave = async (req, res) => {
    const { id, status, rejection_reason } = req.body;
    const approver = req.user.username;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get Request details
        const [rows] = await connection.query('SELECT * FROM leave_requests WHERE id = ?', [id]);
        if (!rows.length) throw new Error('Request not found.');
        const request = rows[0];

        // 2. Update status
        await connection.execute(
            'UPDATE leave_requests SET status = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP, rejection_reason = ? WHERE id = ?',
            [status, approver, rejection_reason || null, id]
        );

        // 3. If APPROVED, automatically mark attendance as Leave for those dates
        if (status === 'APPROVED') {
            const startStr = request.start_date.toISOString().split('T')[0];
            const endStr = request.end_date.toISOString().split('T')[0];
            
            // Logic: In a real system, we'd loop through dates or mark as 'L'
            // For now, we invalidate attendance cache
            await cache.invalidate('attendance:');
            await cache.invalidate('summary:');
        }

        await connection.commit();
        res.json({ success: true, message: `Leave ${status.toLowerCase()} successfully.` });
    } catch (error) {
        await connection.rollback();
        res.status(400).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

/**
 * Get leave summary for employee
 */
export const getMyLeaveHistory = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT lr.*, lt.type_name, lt.color_code 
             FROM leave_requests lr
             JOIN leave_types lt ON lr.leave_type_id = lt.id
             WHERE lr.emp_no = ?
             ORDER BY lr.created_at DESC`,
            [req.user.username]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
