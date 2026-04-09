import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: 'c:/Users/Hp/Documents/enterprise-payroll-web-529/server/.env' });

async function checkLogin() {
    const PORT = process.env.PORT || 5005;
    const baseURL = `http://localhost:${PORT}/api`;
    
    try {
        const loginRes = await axios.post(`${baseURL}/auth/login`, {
            userId: 'admin',
            password: 'password@123',
            loginMode: 'company'
        });
        console.log('Login Response Keys:', Object.keys(loginRes.data));
        console.log('Login Result:', loginRes.data);
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) console.log('Response Data:', err.response.data);
    }
}
checkLogin();
