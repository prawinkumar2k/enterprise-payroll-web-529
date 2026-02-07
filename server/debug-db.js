import mysql from 'mysql2/promise';

async function debugConnection() {
    const config = {
        host: '127.0.0.1',
        user: 'root',
        password: 'Prawin@2k4',
        database: 'billing_db'
    };

    console.log('Testing connection with config:', config);

    try {
        const connection = await mysql.createConnection(config);
        console.log('Successfully connected!');
        await connection.end();
    } catch (error) {
        console.error('Connection failed:', error.message);
        console.error('Error Code:', error.code);
    }
}

debugConnection();
