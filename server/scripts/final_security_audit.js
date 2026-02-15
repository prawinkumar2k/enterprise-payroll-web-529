

async function runSecurityAuditSimulation() {
    const BASE_URL = 'http://localhost:5001/api';
    console.log('🛡️ Running Final Security Audit Simulation...');

    const tests = [
        {
            name: 'SQL Injection: Login Bypass',
            run: async () => {
                const res = await fetch(`${BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: "' OR '1'='1", password: 'any' })
                });
                const data = await res.json();
                return res.status === 401 && data.code === 'AUTH_INVALID_CREDENTIALS';
            }
        },
        {
            name: 'RBAC: Unauthorized Access to Salary',
            run: async () => {
                const res = await fetch(`${BASE_URL}/salary/generate`, { method: 'POST' });
                const data = await res.json();
                return res.status === 401 && data.code === 'AUTH_REQUIRED';
            }
        },
        {
            name: 'Rate Limiting Check',
            run: async () => {
                // Not doing a full DDOS, but just checking if the header exists
                const res = await fetch(`${BASE_URL}/auth/login`, { method: 'POST', body: '{}', headers: { 'Content-Type': 'application/json' } });
                return res.headers.get('x-ratelimit-limit') !== null;
            }
        },
        {
            name: 'Error Sanitization (Trigger 404)',
            run: async () => {
                const res = await fetch(`${BASE_URL}/non-existent-route`);
                const data = await res.json();
                return res.status === 404 && data.success === false && !data.stack;
            }
        },
        {
            name: 'Helmet Security Headers',
            run: async () => {
                const res = await fetch(`${BASE_URL}/health`);
                return res.headers.get('x-dns-prefetch-control') !== null;
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

runSecurityAuditSimulation();
