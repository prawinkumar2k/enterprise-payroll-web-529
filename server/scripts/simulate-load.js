const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'http://127.0.0.1:5005/api'; // Single-tenant port
const CONCURRENT_USERS = 1000;

async function simulateLogin(userId, password) {
    try {
        const start = Date.now();
        const res = await axios.post(`${BASE_URL}/auth/login`, { userId, password });
        return { success: true, time: Date.now() - start };
    } catch (err) {
        return { success: false, status: err.response?.status, time: 0 };
    }
}

async function simulateBiometricSpam() {
    const fakeTemplate = crypto.randomBytes(128).toString('hex');
    try {
        await axios.post(`${BASE_URL}/biometric/login`, {
            sample_data: fakeTemplate,
            biometric_type: 'fingerprint'
        });
        return true;
    } catch (err) {
        return false;
    }
}

async function runSimulation() {
    console.log(`[SIMULATION] Starting load test with ${CONCURRENT_USERS} concurrent requests...`);
    
    // 1. Concurrent Logins
    const loginPromises = [];
    for (let i = 0; i < CONCURRENT_USERS; i++) {
        loginPromises.push(simulateLogin(`admin_${i}`, 'wrong_password'));
    }
    
    const results = await Promise.all(loginPromises);
    const successCount = results.filter(r => r.success).length;
    const rateLimitedCount = results.filter(r => r.status === 429).length;
    const avgTime = results.reduce((acc, r) => acc + r.time, 0) / (CONCURRENT_USERS || 1);
    
    console.log(`[LOGIN RESULTS] Success: ${successCount}, Rate Limited: ${rateLimitedCount}, Total: ${CONCURRENT_USERS}, Avg Time: ${avgTime.toFixed(2)}ms`);

    // 2. Biometric Spam
    console.log(`[SIMULATION] Starting Biometric Spam test (500 requests)...`);
    const bioPromises = [];
    for (let i = 0; i < 500; i++) {
        bioPromises.push(simulateBiometricSpam());
    }
    await Promise.all(bioPromises);
    console.log(`[BIO RESULTS] Finished spamming biometric endpoint.`);
}

runSimulation().catch(console.error);
