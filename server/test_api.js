import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: 'c:/Users/Hp/Documents/enterprise-payroll-web-529/server/.env' });

async function testApi() {
    const PORT = process.env.PORT || 5005;
    const url = `http://localhost:${PORT}/api/attendance/monthly?month=3&year=2026`;
    
    try {
        console.log(`Testing GET ${url}...`);
        // We need a token since it's likely protected
        // But let's see if 500 happens before 401
        const res = await axios.get(url);
        console.log('Response:', res.data);
    } catch (err) {
        if (err.response) {
            console.log('Status:', err.response.status);
            console.log('Data:', err.response.data);
        } else {
            console.error('Error:', err.message);
        }
    }
}
testApi();
