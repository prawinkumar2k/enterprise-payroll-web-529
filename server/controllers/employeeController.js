import db from '../database/dbManager.js';
import bcrypt from 'bcryptjs';

// Distance calculation
function getDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371e3; // meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

/** ── ESS: Self-Service ── **/

export const punchIn = async (req, res) => {
    const { lat, lng, selfie } = req.body;
    const today = new Date().toISOString().split('T')[0];
    try {
        const [existing] = await db.query('SELECT id FROM employee_attendance_logs WHERE employee_id = ? AND DATE(punch_in_time) = ?', [req.user.id, today]);
        if (existing.length > 0) return res.status(400).json({ success: false, message: 'Already punched in today.' });

        const [rows] = await db.query('SELECT setting_key, setting_value FROM app_settings WHERE setting_key IN ("office_lat", "office_lng", "geofence_radius")');
        const settings = Object.fromEntries(rows.map(r => [r.setting_key, r.setting_value]));
        const dist = getDistance(lat, lng, parseFloat(settings.office_lat), parseFloat(settings.office_lng));
        const isRemote = dist > (parseFloat(settings.geofence_radius) || 500);

        await db.execute('INSERT INTO employee_attendance_logs (employee_id, punch_in_time, in_lat, in_lng, in_selfie_url, is_remote) VALUES (?, NOW(), ?, ?, ?, ?)', [req.user.id, lat, lng, selfie, isRemote]);
        res.json({ success: true, message: 'Uplink established. Punch-in recorded.', isRemote });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const punchOut = async (req, res) => {
    const { lat, lng, selfie, description } = req.body;
    const today = new Date().toISOString().split('T')[0];
    try {
        const [logs] = await db.query('SELECT id FROM employee_attendance_logs WHERE employee_id = ? AND DATE(punch_in_time) = ? AND punch_out_time IS NULL', [req.user.id, today]);
        if (!logs.length) return res.status(400).json({ success: false, message: 'No active session found.' });

        await db.execute('UPDATE employee_attendance_logs SET punch_out_time = NOW(), out_lat = ?, out_lng = ?, out_selfie_url = ?, status = "PRESENT" WHERE id = ?', [lat, lng, selfie, logs[0].id]);
        if (description) {
            const filePath = req.file ? `/uploads/work/${req.file.filename}` : null;
            await db.execute('INSERT INTO work_submissions (attendance_id, employee_id, description, file_path) VALUES (?, ?, ?, ?)', [logs[0].id, req.user.id, description, filePath]);
        }
        res.json({ success: true, message: 'Shift terminated. Work data archived.' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getMyAttendance = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM employee_attendance_logs WHERE employee_id = ? ORDER BY created_at DESC LIMIT 30', [req.user.id]);
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getMySalary = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM emppay WHERE EMPNO = ? ORDER BY created_at DESC LIMIT 6', [req.user.username]);
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getMyWorkSubmissions = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM work_submissions WHERE employee_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const applyLeave = async (req, res) => {
    const { leave_type, from_date, to_date, reason } = req.body;
    try {
        await db.execute('INSERT INTO employee_leaves (employee_id, leave_type, from_date, to_date, reason) VALUES (?, ?, ?, ?, ?)', [req.user.id, leave_type, from_date, to_date, reason]);
        res.json({ success: true, message: 'Leave request registered.' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getMyLeaves = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM employee_leaves WHERE employee_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const applyPermission = async (req, res) => {
    const { date, from_time, to_time, reason } = req.body;
    try {
        await db.execute('INSERT INTO employee_permissions (employee_id, date, from_time, to_time, reason) VALUES (?, ?, ?, ?, ?)', [req.user.id, date, from_time, to_time, reason]);
        res.json({ success: true, message: 'Permission request registered.' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getMyPermissions = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM employee_permissions WHERE employee_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};


/** ── ADMIN: Management ── **/

export const getEmployees = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM empdet WHERE deleted_at IS NULL ORDER BY CAST(EMPNO as UNSIGNED) DESC');
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const createEmployee = async (req, res) => {
    const data = req.body;
    try {
        const fields = Object.keys(data);
        const placeholders = fields.map(() => '?').join(', ');
        const sql = `INSERT INTO empdet (${fields.join(', ')}) VALUES (${placeholders})`;
        const [result] = await db.execute(sql, Object.values(data));
        
        await db.execute('INSERT IGNORE INTO users (UserID, Password, UserName, Role) VALUES (?, ?, ?, "EMPLOYEE")', [data.EMPNO, await bcrypt.hash(data.EMPNO, 10), data.SNAME]);
        res.json({ success: true, id: result.insertId });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const updateEmployee = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
        const values = [...Object.values(data), id];
        await db.execute(`UPDATE empdet SET ${fields} WHERE id = ?`, values);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const deleteEmployee = async (req, res) => {
    try {
        await db.execute('UPDATE empdet SET deleted_at = NOW() WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getTrashedEmployees = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM empdet WHERE deleted_at IS NOT NULL');
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const restoreEmployee = async (req, res) => {
    try {
        await db.execute('UPDATE empdet SET deleted_at = NULL WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getNextEmpno = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT MAX(CAST(EMPNO as UNSIGNED)) as max_no FROM empdet');
        const next = (rows[0].max_no || 0) + 1;
        res.json({ success: true, next: next.toString() });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
