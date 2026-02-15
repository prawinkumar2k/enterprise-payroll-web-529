import dbManager from '../database/dbManager.js';
import { logAudit } from '../utils/auditLogger.js';
import { randomUUID } from 'crypto';
import licenseService from '../services/license.service.js';

const EMP_FIELDS = [
    'SLNO', 'EMPNO', 'SNAME', 'DESIGNATION', 'AbsGroup', 'DGroup', 'PAY', 'GradePay', 'Category',
    'PANCARD', 'AccountNo', 'BankName', 'IFSCCode', 'OtherAccNo', 'DOB', 'JDATE', 'RDATE', 'LDATE',
    'CheckStatus', 'DA', 'EPF', 'ESI', 'MPHIL', 'PHD', 'HATA', 'Allowance', 'SPECIAL', 'INTERIM',
    'OD', 'CL', 'ML', 'MaL', 'RH', 'SL', 'LOP', 'LopDate'
];

export const getEmployees = async (req, res) => {
    try {
        const [rows] = await dbManager.query('SELECT * FROM empdet WHERE deleted_at IS NULL ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getTrashedEmployees = async (req, res) => {
    try {
        const [rows] = await dbManager.query('SELECT * FROM empdet WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching trashed employees:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createEmployee = async (req, res) => {
    const data = req.body;
    const user = req.user || { username: 'SYSTEM' };

    // --- COMMERCIAL LIMIT CHECK ---
    const limits = await licenseService.getProductLimits();
    const [countRow] = await dbManager.query('SELECT COUNT(*) as count FROM empdet WHERE deleted_at IS NULL');
    const currentCount = countRow[0].count;

    if (currentCount >= limits.maxEmployees) {
        return res.status(403).json({
            success: false,
            message: `Employee limit reached (${limits.maxEmployees}). Please upgrade your license to add more employees.`,
            isTrial: !limits.isLicensed
        });
    }

    const uuid = randomUUID();
    const keys = [...EMP_FIELDS.filter(f => data[f] !== undefined), 'uuid', 'is_synced', 'device_id'];
    const values = [...EMP_FIELDS.filter(f => data[f] !== undefined).map(k => data[k]), uuid, 0, 'SERVER_01'];
    const placeholders = keys.map(() => '?').join(', ');

    if (keys.length <= 3) {
        return res.status(400).json({ error: "No valid fields provided" });
    }

    const query = `INSERT INTO empdet (${keys.map(k => `\`${k}\``).join(', ')}) VALUES (${placeholders})`;

    try {
        const result = await dbManager.execute(query, values);

        await logAudit({
            userId: user.username,
            username: user.name || user.username,
            actionType: 'CREATE_EMPLOYEE',
            module: 'EMPLOYEE',
            description: `Created employee ${data.EMPNO}`,
            newValue: { ...data, uuid },
            ip: req.socket.remoteAddress
        });

        res.status(201).json({ id: result.insertId, uuid, ...data });
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateEmployee = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const user = req.user || { username: 'SYSTEM' };

    const connection = await dbManager.getConnection();
    try {
        await connection.beginTransaction();

        const [existing] = await connection.query('SELECT * FROM empdet WHERE id = ? FOR UPDATE', [id]);
        if (existing.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Employee not found" });
        }

        const keys = EMP_FIELDS.filter(f => data[f] !== undefined);
        const values = keys.map(k => data[k]);

        if (keys.length === 0) {
            await connection.rollback();
            return res.status(400).json({ error: "No valid fields provided" });
        }

        const setClause = keys.map(k => `\`${k}\` = ?`).join(', ');
        const query = `UPDATE empdet SET ${setClause}, is_synced = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

        await connection.query(query, [...values, id]);
        await connection.commit();

        await logAudit({
            userId: user.username,
            username: user.name || user.username,
            actionType: 'UPDATE_EMPLOYEE',
            module: 'EMPLOYEE',
            description: `Updated employee ${id}`,
            oldValue: existing[0],
            newValue: { ...existing[0], ...data },
            ip: req.socket.remoteAddress
        });

        res.json({ id, ...data });
    } catch (error) {
        await connection.rollback();
        console.error('Error updating employee:', error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

export const deleteEmployee = async (req, res) => {
    const { id } = req.params;
    const user = req.user || { username: 'SYSTEM' };

    try {
        const [existing] = await dbManager.query('SELECT * FROM empdet WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: "Employee not found" });
        }

        await dbManager.execute('UPDATE empdet SET deleted_at = CURRENT_TIMESTAMP, is_synced = 0 WHERE id = ?', [id]);

        await logAudit({
            userId: user.username,
            username: user.name || user.username,
            actionType: 'DELETE_EMPLOYEE',
            module: 'EMPLOYEE',
            description: `Soft deleted employee ${existing[0].EMPNO}`,
            oldValue: existing[0],
            ip: req.socket.remoteAddress
        });

        res.json({ message: "Employee moved to trash" });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: error.message });
    }
};

export const restoreEmployee = async (req, res) => {
    const { id } = req.params;
    const user = req.user || { username: 'SYSTEM' };

    try {
        await dbManager.execute('UPDATE empdet SET deleted_at = NULL, is_synced = 0 WHERE id = ?', [id]);

        await logAudit({
            userId: user.username,
            username: user.name || user.username,
            actionType: 'RESTORE_EMPLOYEE',
            module: 'EMPLOYEE',
            description: `Restored employee ${id}`,
            ip: req.socket.remoteAddress
        });

        res.json({ message: "Employee restored" });
    } catch (error) {
        console.error('Error restoring employee:', error);
        res.status(500).json({ error: error.message });
    }
};

export const permanentDeleteEmployee = async (req, res) => {
    const { id } = req.params;
    const user = req.user || { username: 'SYSTEM' };

    try {
        await dbManager.execute('DELETE FROM empdet WHERE id = ?', [id]);

        await logAudit({
            userId: user.username,
            username: user.name || user.username,
            actionType: 'PERMANENT_DELETE_EMPLOYEE',
            module: 'EMPLOYEE',
            description: `Permanently deleted employee ${id}`,
            ip: req.socket.remoteAddress
        });

        res.json({ message: "Employee deleted permanently" });
    } catch (error) {
        console.error('Error permanently deleting employee:', error);
        res.status(500).json({ error: error.message });
    }
};
