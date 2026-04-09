import axios from 'axios';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config({ path: 'c:/Users/Hp/Documents/enterprise-payroll-web-529/server/.env' });

async function testFullFlow() {
    const PORT = process.env.PORT || 5005;
    const baseURL = `http://localhost:${PORT}/api`;
    const JWT_SECRET = process.env.JWT_SECRET;
    
    try {
        console.log(`Using JWT_SECRET: ${JWT_SECRET.substring(0, 10)}...`);
        console.log('Logging in as admin...');
        const loginRes = await axios.post(`${baseURL}/auth/login`, {
            userId: 'admin',
            password: 'password@123',
            loginMode: 'company'
        });
        const token = loginRes.data.accessToken;
        console.log('Login success. Token acquired.');
        
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            console.log('Token verified locally. Decoded:', decoded);
        } catch (e) {
            console.error('Local Token verification failed:', e.message);
        }

        console.log(`Testing GET ${baseURL}/attendance/monthly?month=3&year=2026...`);
        const attRes = await axios.get(`${baseURL}/attendance/monthly?month=3&year=2026`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Result:', JSON.stringify(attRes.data, null, 2));

    } catch (err) {
        if (err.response) {
            console.log('Status:', err.response.status);
            console.log('Data:', err.response.data);
        } else {
            console.error('Error:', err.message);
        }
    }
}
testFullFlow();
