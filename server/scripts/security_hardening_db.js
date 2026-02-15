
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function hardenDB() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    try {
        console.log('🛡️ Hardening Database...');

        const securitySchema = `
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                token VARCHAR(255) NOT NULL UNIQUE,
                user_id INT NOT NULL,
                device_id VARCHAR(100),
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                revoked_at DATETIME,
                replaced_by_token VARCHAR(255),
                INDEX(token),
                INDEX(user_id)
            );

            CREATE TABLE IF NOT EXISTS login_attempts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(50),
                ip_address VARCHAR(45),
                status ENUM('SUCCESS', 'FAILURE') NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        await connection.query(securitySchema);
        console.log('✅ Security tables initialized.');

    } catch (error) {
        console.error('❌ Hardening failed:', error);
    } finally {
        await connection.end();
    }
}

hardenDB();
