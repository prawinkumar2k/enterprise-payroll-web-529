import pool from '../db.js';
import { logAction } from '../middleware/log.middleware.js';

/**
 * Report Controller
 * Handles Pay Bill Detail Report generation
 */

export const getPayBillDetail = async (req, res) => {
    const { monthYear, category } = req.query;
    const user = req.user;

    if (!monthYear) {
        return res.status(400).json({ success: false, message: 'Month and Year required' });
    }

    try {
        // Mapping legacy labels to DGroup values (seen as numeric in screenshots) or AbsGroup
        let query = 'SELECT * FROM emppay WHERE MONTHYEAR = ?';
        let queryParams = [monthYear];

        if (category && category !== 'All') {
            // Mapping Logic (based on observed DGroup values in screenshot)
            let groupVal = null;
            if (category === 'Cheque with PF') groupVal = 2; // Usually Group 2
            else if (category === 'Cheque without PF') groupVal = 3; // Usually Group 3
            else if (category === 'Cash without PF') groupVal = 4; // Usually Group 4

            if (groupVal) {
                query += ' AND (DGroup = ? OR AbsGroup LIKE ?)';
                queryParams.push(groupVal);
                queryParams.push(`${groupVal}%`); // Handle '2.Teaching' etc.
            }
        }

        query += ' ORDER BY CAST(EMPNO AS UNSIGNED) ASC';

        const [rows] = await pool.query(query, queryParams);

        // Log view action
        if (user) {
            await logAction({
                userId: user.username,
                username: user.name || user.username,
                role: user.role,
                module: 'REPORTS',
                actionType: 'VIEW',
                description: `Pay Bill Viewed for ${monthYear} - Category: ${category || 'All'}`,
                ip: req.socket.remoteAddress
            });
        }

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Report Fetch Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching pay bill' });
    }
};

export const logPrintAction = async (req, res) => {
    const { monthYear, category } = req.body;
    const user = req.user;

    try {
        await logAction({
            userId: user.username,
            username: user.name || user.username,
            role: user.role,
            module: 'REPORTS',
            actionType: 'PRINT',
            description: `Pay Bill Printed for ${monthYear} - Category: ${category || 'All'}`,
            ip: req.socket.remoteAddress
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};
