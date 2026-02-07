import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Prawin@2k4',
    database: process.env.DB_NAME || 'billing_db',
    multipleStatements: true
};

async function initDB() {
    console.log('Initializing database schema for:', config.database);

    let connection;
    try {
        // First connect without DB to create it if missing
        const { database, ...serverConfig } = config;
        connection = await mysql.createConnection(serverConfig);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
        await connection.end();

        // Connect to the DB
        connection = await mysql.createConnection(config);

        const schema = `
            CREATE TABLE IF NOT EXISTS userdetails (
                id INT AUTO_INCREMENT PRIMARY KEY,
                UserID VARCHAR(50) NOT NULL UNIQUE,
                Password VARCHAR(255) NOT NULL,
                UserName VARCHAR(100) NOT NULL,
                Qualification VARCHAR(100),
                Department VARCHAR(100),
                Role VARCHAR(20) NOT NULL,
                Contact VARCHAR(20),
                Remark TEXT,
                CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS userlogs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                LogDate DATE,
                LogTime TIME,
                UserID VARCHAR(50),
                UserName VARCHAR(100),
                Module VARCHAR(50),
                ActionType VARCHAR(20),
                Description TEXT,
                IPAddress VARCHAR(45),
                Role VARCHAR(20),
                CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS empdet (
                id INT AUTO_INCREMENT PRIMARY KEY,
                SLNO INT,
                EMPNO VARCHAR(20) UNIQUE,
                SNAME VARCHAR(100) NOT NULL,
                DESIGNATION VARCHAR(100),
                AbsGroup VARCHAR(50),
                DGroup VARCHAR(50),
                PAY DECIMAL(10, 2),
                GradePay DECIMAL(10, 2),
                Category VARCHAR(50),
                PANCARD VARCHAR(20),
                AccountNo VARCHAR(30),
                BankName VARCHAR(100),
                IFSCCode VARCHAR(20),
                OtherAccNo VARCHAR(30),
                DOB DATE,
                JDATE DATE,
                RDATE DATE,
                LDATE DATE,
                CheckStatus VARCHAR(20),
                DA DECIMAL(10, 2),
                EPF DECIMAL(10, 2),
                ESI DECIMAL(10, 2),
                MPHIL VARCHAR(10),
                PHD VARCHAR(10),
                HATA DECIMAL(10, 2),
                Allowance DECIMAL(10, 2),
                SPECIAL DECIMAL(10, 2),
                INTERIM DECIMAL(10, 2),
                OD INT,
                CL INT,
                ML INT, 
                MaL INT,
                RH INT,
                SL INT,
                LOP INT,
                LopDate DATE,
                CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS emptrash LIKE empdet;
        `;

        await connection.query(schema);
        console.log('✅ Database schema initialized successfully!');

        // Create default admin user if not exists
        const [users] = await connection.query('SELECT * FROM userdetails WHERE UserID = ?', ['admin']);
        if (users.length === 0) {
            // Hash password 'admin123' manually or use bcrypt in app. 
            // Since this script doesn't import bcrypt, I'll insert a placeholder or let the user register via API.
            // But wait, userController.js uses bcrypt.
            // I'll skip user creation to avoid dependency on bcrypt here.
            console.log('ℹ️  No admin found. Please register/create a user via API or manually.');
        } else {
            console.log('ℹ️  Admin user already exists.');
        }

    } catch (error) {
        console.error('❌ Initialization failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

initDB();
