


async function runSecurityAudit() {
    const BASE_URL = 'http://localhost:5001/api';
    console.log('🛡️ Starting Security & Identity Audit...');

    const tests = [
        {
            name: 'Auth Bypass: Access /salary/generate without token',
            run: async () => {
                const res = await fetch(`${BASE_URL}/salary/generate`, { method: 'POST' });
                return res.status === 401;
            }
        },
        {
            name: 'Token Manipulation: Modified signature',
            run: async () => {
                const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiJ9.WRONG_SIG';
                const res = await fetch(`${BASE_URL}/sync/status`, {
                    headers: { 'Authorization': `Bearer ${fakeToken}` }
                });
                return res.status === 401;
            }
        },
        {
            name: 'SQL Injection: Login attempt with payload',
            run: async () => {
                const res = await fetch(`${BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: "' OR '1'='1", password: 'password' })
                });
                const data = await res.json();
                return res.status === 401 && data.success === false;
            }
        },
        {
            name: 'Sync Table Leak Protection',
            run: async () => {
                // Try to sync a non-syncable table
                const res = await fetch(`${BASE_URL}/sync/push`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        device_id: 'HACKER',
                        tables: { 'userdetails': [{ uuid: 'trick', SNAME: 'hack' }] }
                    })
                });
                // Should fail due to no token
                return res.status === 401;
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

    console.log(`\nAudit Summary: ${passed}/${tests.length} tests passed.`);
}

runSecurityAudit();
