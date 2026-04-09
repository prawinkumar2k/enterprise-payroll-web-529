import axios from 'axios';
import http from 'http';

const BASE_URL = 'http://127.0.0.1:5005/api'; // Testing production port 5005
const CONCURRENT_USERS = 2000;

const agent = new http.Agent({ keepAlive: true, maxSockets: 500 });

async function stressTestLogin(id) {
    const start = Date.now();
    try {
        await axios.post(`${BASE_URL}/auth/login`, {
            userId: `stress_user_${id}`,
            password: 'password123'
        }, { httpAgent: agent });
        return { success: true, time: Date.now() - start, status: 200 };
    } catch (err) {
        return { success: false, status: err.response?.status || 500, time: Date.now() - start };
    }
}

async function triggerPayrollJob() {
    try {
        const res = await axios.post(`${BASE_URL}/salary/generate`, { monthYear: '03-2026' }, { httpAgent: agent });
        return res.data?.jobId;
    } catch (e) { return null; }
}

async function runHighScaleSimulation() {
    console.log(`[STRESS] Starting High-Scale Simulation: ${CONCURRENT_USERS} concurrent requests...`);
    
    // 1. Concurrent API Stress
    const start = Date.now();
    const loginPromises = [];
    for (let i = 0; i < CONCURRENT_USERS; i++) {
        loginPromises.push(stressTestLogin(i));
    }
    
    // 2. Simultaneous Payroll Jobs
    console.log(`[STRESS] Triggering 5 concurrent payroll generation jobs...`);
    const jobPromises = [];
    for (let i = 0; i < 5; i++) {
        jobPromises.push(triggerPayrollJob());
    }

    const [results, jobs] = await Promise.all([
        Promise.all(loginPromises),
        Promise.all(jobPromises)
    ]);
    
    const end = Date.now();
    const duration = (end - start) / 1000;
    const rateLimited = results.filter(r => r.status === 429).length;
    const errors = results.filter(r => r.status >= 500).length;

    console.log(`\n--- SIMULATION RESULTS ---`);
    console.log(`Total Requests: ${CONCURRENT_USERS}`);
    console.log(`Duration: ${duration.toFixed(2)}s`);
    console.log(`Throughput: ${(CONCURRENT_USERS / duration).toFixed(2)} req/sec`);
    console.log(`Rate Limited (429): ${rateLimited}`);
    console.log(`Server Errors (500): ${errors}`);
    console.log(`Jobs Enqueued: ${jobs.filter(j => j).length}`);
    console.log(`--------------------------\n`);
}

runHighScaleSimulation().catch(err => console.error('[FATAL]', err.message));
