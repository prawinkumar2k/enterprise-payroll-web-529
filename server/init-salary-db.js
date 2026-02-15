import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Prawin@2k4',
    database: process.env.DB_NAME || 'billing_db'
};

async function initSalaryDB() {
    console.log('Initializing Salary Table for:', config.database);

    let connection;
    try {
        connection = await mysql.createConnection(config);

        const schema = `
            CREATE TABLE IF NOT EXISTS emppay (
                id INT AUTO_INCREMENT PRIMARY KEY,
                MONTHYEAR VARCHAR(20) NOT NULL,
                EMPNO VARCHAR(20) NOT NULL,
                SNAME VARCHAR(100),
                Designation VARCHAR(100),
                DGroup VARCHAR(50),
                NoofDays INT DEFAULT 0,
                LeaveDays INT DEFAULT 0,
                WorkingDays INT DEFAULT 0,
                PAY DECIMAL(10, 2) DEFAULT 0,
                GradePay DECIMAL(10, 2) DEFAULT 0,
                PHD DECIMAL(10, 2) DEFAULT 0,
                MPHIL DECIMAL(10, 2) DEFAULT 0,
                HATA DECIMAL(10, 2) DEFAULT 0,
                Allowance DECIMAL(10, 2) DEFAULT 0,
                DA DECIMAL(10, 2) DEFAULT 0,
                SPECIAL DECIMAL(10, 2) DEFAULT 0,
                INTERIM DECIMAL(10, 2) DEFAULT 0,
                GROSSPAY DECIMAL(10, 2) DEFAULT 0,
                EPF DECIMAL(10, 2) DEFAULT 0,
                ESI DECIMAL(10, 2) DEFAULT 0,
                ESIM DECIMAL(10, 2) DEFAULT 0,
                IT DECIMAL(10, 2) DEFAULT 0,
                PT DECIMAL(10, 2) DEFAULT 0,
                Advance DECIMAL(10, 2) DEFAULT 0,
                LIC DECIMAL(10, 2) DEFAULT 0,
                RECOVERY DECIMAL(10, 2) DEFAULT 0,
                OTHERS DECIMAL(10, 2) DEFAULT 0,
                TOTDED DECIMAL(10, 2) DEFAULT 0,
                NETSAL DECIMAL(10, 2) DEFAULT 0,
                AccountNo VARCHAR(50),
                BankName VARCHAR(100),
                IFSCCode VARCHAR(20),
                OtherAccNo VARCHAR(50),
                Remark TEXT,
                InterimPay DECIMAL(10, 2) DEFAULT 0,
                DAper DECIMAL(5, 2) DEFAULT 0,
                AbsGroup VARCHAR(50),
                Bonus DECIMAL(10, 2) DEFAULT 0,
                CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_salary_entry (MONTHYEAR, EMPNO)
            );
        `;

        await connection.query(schema);
        console.log('✅ Salary table (emppay) initialized successfully!');

    } catch (error) {
        console.error('❌ Salary DB Initialization failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

initSalaryDB();
