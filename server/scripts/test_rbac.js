import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set. RBAC tests cannot run.');
    process.exit(1);
}


async function testRBAC() {
    const BASE_URL = 'http://localhost:5001/api';
    console.log('🛡️ Starting RBAC Verification Suite...');

    // Generate tokens
    const adminToken = jwt.sign({ id: 1, username: 'admin', role: 'admin' }, SECRET);
    const employeeToken = jwt.sign({ id: 2, username: 'emp1', role: 'employee' }, SECRET);

    const tests = [
        {
            name: 'Admin access to /salary/generate',
            run: async () => {
                const res = await fetch(`${BASE_URL}/salary/generate`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ monthYear: '02-2026' })
                });
                return res.status !== 401 && res.status !== 403;
            }
        },
        {
            name: 'Employee access to /salary/generate (Should be 403)',
            run: async () => {
                const res = await fetch(`${BASE_URL}/salary/generate`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${employeeToken}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ monthYear: '02-2026' })
                });
                return res.status === 403;
            }
        },
        {
            name: 'Employee access to /sync/push (Should be 403)',
            run: async () => {
                const res = await fetch(`${BASE_URL}/sync/push`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${employeeToken}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ device_id: 'test', tables: {} })
                });
                return res.status === 403;
            }
        },
        {
            name: 'Admin access to /sync/status',
            run: async () => {
                const res = await fetch(`${BASE_URL}/sync/status`, {
                    headers: { 'Authorization': `Bearer ${adminToken}` }
                });
                return res.status === 200;
            }
        }
    ];

    let passed = 0;
    for (const test of tests) {
        try {
            const success = await test.run();
            console.log(`${success ? '✅' : '❌'} ${test.name}`);
            if (success) passed++;
        } catch (e) {
            console.log(`❌ ${test.name} - Error: ${e.message}`);
        }
    }

    console.log(`\nRBAC Summary: ${passed}/${tests.length} tests passed.`);
}

testRBAC();
