import pool from '../db.js';

const EMP_FIELDS = [
    'SLNO', 'EMPNO', 'SNAME', 'DESIGNATION', 'AbsGroup', 'DGroup', 'PAY', 'GradePay', 'Category',
    'PANCARD', 'AccountNo', 'BankName', 'IFSCCode', 'OtherAccNo', 'DOB', 'JDATE', 'RDATE', 'LDATE',
    'CheckStatus', 'DA', 'EPF', 'ESI', 'MPHIL', 'PHD', 'HATA', 'Allowance', 'SPECIAL', 'INTERIM',
    'OD', 'CL', 'ML', 'MaL', 'RH', 'SL', 'LOP', 'LopDate'
];

export const getEmployees = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM empdet ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
    }
};

export const getTrashedEmployees = async (req, res) => {
    try {
        // Safe query with try/catch specific to table existence
        const [rows] = await pool.query('SELECT * FROM emptrash ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
            try {
                // Auto-fix: Create table if it doesn't exist
                await pool.query("CREATE TABLE IF NOT EXISTS emptrash LIKE empdet");
                return res.json([]);
            } catch (createError) {
                console.error('Error creating emptrash table:', createError);
                return res.status(500).json({ error: "Failed to initialize trash", details: createError.message });
            }
        }
        console.error('Error fetching trashed employees:', error);
        res.status(500).json({ error: "Failed to load trash", details: error.message });
    }
};

export const createEmployee = async (req, res) => {
    const data = req.body;
    const keys = EMP_FIELDS.filter(f => data[f] !== undefined);
    const values = keys.map(k => data[k]);
    const placeholders = keys.map(() => '?').join(', ');

    if (keys.length === 0) {
        return res.status(400).json({ error: "No valid fields provided" });
    }

    const query = `INSERT INTO empdet (${keys.join(', ')}) VALUES (${placeholders})`;

    try {
        const [result] = await pool.query(query, values);
        res.status(201).json({ id: result.insertId, ...data });
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateEmployee = async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    const keys = EMP_FIELDS.filter(f => data[f] !== undefined);
    const values = keys.map(k => data[k]);

    if (keys.length === 0) {
        return res.status(400).json({ error: "No valid fields provided" });
    }

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const query = `UPDATE empdet SET ${setClause} WHERE id = ?`;

    try {
        const [result] = await pool.query(query, [...values, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Employee not found" });
        }
        res.json({ id, ...data });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteEmployee = async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [rows] = await connection.query('SELECT * FROM empdet WHERE id = ?', [id]);
        if (rows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Employee not found" });
        }
        const employee = rows[0];

        // Ensure emptrash exists before inserting
        // Ideally this should be a migration, but for safety in this task:
        await connection.query("CREATE TABLE IF NOT EXISTS emptrash LIKE empdet");

        const keys = Object.keys(employee);
        const values = Object.values(employee);
        const placeholders = keys.map(() => '?').join(', ');

        await connection.query(`INSERT INTO emptrash (${keys.join(', ')}) VALUES (${placeholders})`, values);
        await connection.query('DELETE FROM empdet WHERE id = ?', [id]);

        await connection.commit();
        res.json({ message: "Employee moved to trash" });
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

export const restoreEmployee = async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [rows] = await connection.query('SELECT * FROM emptrash WHERE id = ?', [id]);
        if (rows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Employee not found in trash" });
        }
        const employee = rows[0];

        const keys = Object.keys(employee);
        const values = Object.values(employee);
        const placeholders = keys.map(() => '?').join(', ');

        // Use IGNORE in case ID already exists back in empdet (shouldn't happen but safety first)
        await connection.query(`INSERT IGNORE INTO empdet (${keys.join(', ')}) VALUES (${placeholders})`, values);
        await connection.query('DELETE FROM emptrash WHERE id = ?', [id]);

        await connection.commit();
        res.json({ message: "Employee restored from trash" });
    } catch (error) {
        await connection.rollback();
        console.error('Error restoring employee:', error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};
