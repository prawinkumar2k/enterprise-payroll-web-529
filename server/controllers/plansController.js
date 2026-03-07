import dbManager from '../database/dbManager.js';

/** GET /api/superadmin/plans */
export const listPlans = async (req, res) => {
    try {
        const [rows] = await dbManager.query('SELECT * FROM plans ORDER BY price ASC', []);
        res.json({ success: true, plans: rows });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Failed to fetch plans.' });
    }
};

/** POST /api/superadmin/plans */
export const createPlan = async (req, res) => {
    const { plan_name, max_users, max_storage_mb, max_records, price, duration_days } = req.body;
    if (!plan_name) return res.status(400).json({ success: false, message: 'plan_name is required.' });
    try {
        const result = await dbManager.execute(
            'INSERT INTO plans (plan_name,max_users,max_storage_mb,max_records,price,duration_days) VALUES (?,?,?,?,?,?)',
            [plan_name, max_users || 10, max_storage_mb || 500, max_records || 5000, price || 0, duration_days || 365]
        );
        res.status(201).json({ success: true, id: result.insertId, message: 'Plan created.' });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Failed to create plan.' });
    }
};

/** PUT /api/superadmin/plans/:id */
export const updatePlan = async (req, res) => {
    const { id } = req.params;
    const { plan_name, max_users, max_storage_mb, max_records, price, duration_days } = req.body;
    try {
        await dbManager.execute(
            `UPDATE plans SET plan_name=COALESCE(?,plan_name), max_users=COALESCE(?,max_users),
             max_storage_mb=COALESCE(?,max_storage_mb), max_records=COALESCE(?,max_records),
             price=COALESCE(?,price), duration_days=COALESCE(?,duration_days) WHERE id=?`,
            [plan_name||null, max_users||null, max_storage_mb||null, max_records||null, price||null, duration_days||null, id]
        );
        res.json({ success: true, message: 'Plan updated.' });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Failed to update plan.' });
    }
};

/** DELETE /api/superadmin/plans/:id */
export const deletePlan = async (req, res) => {
    const { id } = req.params;
    try {
        await dbManager.execute('DELETE FROM plans WHERE id=?', [id]);
        res.json({ success: true, message: 'Plan deleted.' });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Failed to delete plan.' });
    }
};
