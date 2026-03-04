import dbManager from '../database/dbManager.js';
import bcrypt from 'bcryptjs';

/**
 * Get All Users — Runtime immune: returns empty array on DB error
 */
export const getUsers = async (req, res) => {
    try {
        const [users] = await dbManager.query('SELECT * FROM userdetails ORDER BY created_at DESC');
        const safeUsers = (users || []).map(u => {
            const { Password, ...rest } = u;
            return rest;
        });
        res.json({ success: true, data: safeUsers });
    } catch (error) {
        console.error('[Users] getUsers error:', error.message);
        res.json({ success: true, data: [] });
    }
};

/**
 * Create User
 */
export const createUser = async (req, res) => {
    const { UserID, Password, UserName, Qualification, Department, Role, Contact, Remark } = req.body;

    if (!UserID || !Password || !UserName || !Role) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        const [existing] = await dbManager.query('SELECT id FROM userdetails WHERE UserID = ?', [UserID]);
        if (existing && existing.length > 0) {
            return res.status(409).json({ success: false, message: 'UserID already exists' });
        }

        const hashedPassword = await bcrypt.hash(Password, 10);
        const now = new Date();

        const result = await dbManager.execute(
            `INSERT INTO userdetails 
            (UserID, Password, UserName, Qualification, Department, Role, Contact, Remark, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [UserID, hashedPassword, UserName, Qualification, Department, Role, Contact, Remark, now, now]
        );

        if (req.audit) {
            await req.audit('USER_MGMT', 'CREATE', `Created new user record for: ${UserID}`);
        }

        res.status(201).json({ success: true, message: 'User created successfully', id: result.insertId });
    } catch (error) {
        console.error('[Users] createUser error:', error.message);
        const isDupe = error.code === 'ER_DUP_ENTRY' || error.code === 'SQLITE_CONSTRAINT';
        res.status(isDupe ? 409 : 400).json({ success: false, message: isDupe ? 'UserID already exists' : error.message });
    }
};

/**
 * Update User
 */
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { UserID, Password, UserName, Qualification, Department, Role, Contact, Remark } = req.body;

    try {
        const [current] = await dbManager.query('SELECT * FROM userdetails WHERE id = ?', [id]);
        if (!current || current.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        let finalPassword = current[0].Password;
        if (Password && Password.trim() !== '') {
            finalPassword = await bcrypt.hash(Password, 10);
        }

        const now = new Date();

        await dbManager.execute(
            `UPDATE userdetails SET 
            UserID=?, Password=?, UserName=?, Qualification=?, Department=?, Role=?, Contact=?, Remark=?, updated_at=?
            WHERE id=?`,
            [UserID, finalPassword, UserName, Qualification, Department, Role, Contact, Remark, now, id]
        );

        if (req.audit) {
            await req.audit('USER_MGMT', 'UPDATE', `Updated user record for: ${UserID}`);
        }

        res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        console.error('[Users] updateUser error:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * Delete User
 */
export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const [user] = await dbManager.query('SELECT UserID FROM userdetails WHERE id = ?', [id]);
        if (!user || user.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await dbManager.execute('DELETE FROM userdetails WHERE id = ?', [id]);

        if (req.audit) {
            await req.audit('USER_MGMT', 'DELETE', `Deleted user account: ${user[0].UserID}`);
        }

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('[Users] deleteUser error:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};
