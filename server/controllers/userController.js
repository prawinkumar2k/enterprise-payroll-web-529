import pool from '../db.js';
import bcrypt from 'bcryptjs';

/**
 * Get All Users
 */
export const getUsers = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT * FROM userdetails ORDER BY CreatedAt DESC');

        // Remove passwords from response
        const safeUsers = users.map(u => {
            const { Password, ...rest } = u;
            return rest;
        });

        res.json({ success: true, data: safeUsers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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
        // Check if user exists
        const [existing] = await pool.query('SELECT id FROM userdetails WHERE UserID = ?', [UserID]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'UserID already exists' });
        }

        const hashedPassword = await bcrypt.hash(Password, 10);
        const now = new Date();

        const [result] = await pool.query(
            `INSERT INTO userdetails 
            (UserID, Password, UserName, Qualification, Department, Role, Contact, Remark, CreatedAt, UpdatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [UserID, hashedPassword, UserName, Qualification, Department, Role, Contact, Remark, now, now]
        );

        // Enterprise Audit Log
        if (req.audit) {
            await req.audit('USER_MGMT', 'CREATE', `Created new user record for: ${UserID}`);
        }

        res.status(201).json({ success: true, message: 'User created successfully', id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update User
 */
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { UserID, Password, UserName, Qualification, Department, Role, Contact, Remark } = req.body;

    try {
        const [current] = await pool.query('SELECT * FROM userdetails WHERE id = ?', [id]);
        if (current.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

        let finalPassword = current[0].Password;
        if (Password && Password.trim() !== '') {
            finalPassword = await bcrypt.hash(Password, 10);
        }

        const now = new Date();

        await pool.query(
            `UPDATE userdetails SET 
            UserID=?, Password=?, UserName=?, Qualification=?, Department=?, Role=?, Contact=?, Remark=?, UpdatedAt=?
            WHERE id=?`,
            [UserID, finalPassword, UserName, Qualification, Department, Role, Contact, Remark, now, id]
        );

        // Enterprise Audit Log
        if (req.audit) {
            await req.audit('USER_MGMT', 'UPDATE', `Updated user record for: ${UserID}`);
        }

        res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete User
 */
export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const [user] = await pool.query('SELECT UserID FROM userdetails WHERE id = ?', [id]);
        if (user.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

        await pool.query('DELETE FROM userdetails WHERE id = ?', [id]);

        // Enterprise Audit Log
        if (req.audit) {
            await req.audit('USER_MGMT', 'DELETE', `Deleted user account: ${user[0].UserID}`);
        }

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
