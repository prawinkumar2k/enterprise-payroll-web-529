import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(path.join(__dirname, '..', '..'));
dotenv.config({ path: path.join(root, '.env') });

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'enterprise_payroll',
    waitForConnections: true,
    connectionLimit: 5
  });

  const migrationsDir = path.join(root, 'server', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.error('No migrations directory found:', migrationsDir);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    console.log('Applying migration:', file);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    // Split on semicolon but keep simple — avoid trying to parse complex SQL
    const statements = sql.split(/;\s*\n/).map(s => s.trim()).filter(s => s.length);

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const stmt of statements) {
        try {
          // MySQL may not support some SQLite-specific syntax; attempt and continue on failure
          await conn.query(stmt);
        } catch (err) {
          console.warn(`Statement failed (continuing): ${err.message}\n--- SQL: ${stmt.substring(0,200)}`);
        }
      }
      await conn.commit();
      console.log(`✓ Applied ${file}`);
    } catch (err) {
      console.error('Migration transaction failed for', file, err.message);
      try { await conn.rollback(); } catch (e) {}
    } finally {
      conn.release();
    }
  }

  await pool.end();
  console.log('Migrations complete.');
}

run().catch(err => { console.error(err); process.exit(1); });
