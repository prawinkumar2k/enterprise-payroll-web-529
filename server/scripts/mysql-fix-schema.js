import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(path.join(__dirname, '..'));
dotenv.config({ path: path.join(root, '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'billing_db',
  waitForConnections: true,
  connectionLimit: 5
});

async function columnExists(conn, table, column) {
  const [rows] = await conn.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [process.env.DB_NAME, table, column]
  );
  return rows.length > 0;
}

async function indexExists(conn, table, idx) {
  const [rows] = await conn.query(
    `SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [process.env.DB_NAME, table, idx]
  );
  return rows.length > 0;
}

async function ensureColumn(conn, table, columnDef) {
  const { name, definition } = columnDef;
  if (!(await columnExists(conn, table, name))) {
    console.log(`Adding column ${name} to ${table}`);
    await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN ${name} ${definition}`);
  } else {
    console.log(`Column ${name} already exists on ${table}`);
  }
}

async function ensureIndex(conn, table, idxName, cols) {
  if (!(await indexExists(conn, table, idxName))) {
    console.log(`Creating index ${idxName} on ${table}(${cols})`);
    await conn.query(`CREATE INDEX \`${idxName}\` ON \`${table}\`(${cols})`);
  } else {
    console.log(`Index ${idxName} already exists on ${table}`);
  }
}

async function run() {
  const conn = await pool.getConnection();
  try {
    // Ensure tenant_id columns (use VARCHAR instead of TEXT to allow DEFAULT)
    await ensureColumn(conn, 'empdet', { name: 'tenant_id', definition: "VARCHAR(64) NOT NULL DEFAULT 'local'" });
    await ensureColumn(conn, 'emppay', { name: 'tenant_id', definition: "VARCHAR(64) NOT NULL DEFAULT 'local'" });
    await ensureColumn(conn, 'staffattendance', { name: 'tenant_id', definition: "VARCHAR(64) NOT NULL DEFAULT 'local'" });
    await ensureColumn(conn, 'audit_logs', { name: 'tenant_id', definition: "VARCHAR(64) NOT NULL DEFAULT 'local'" });

    // Ensure sync columns
    await ensureColumn(conn, 'audit_logs', { name: 'sync_version', definition: 'INT NOT NULL DEFAULT 1' });
    await ensureColumn(conn, 'audit_logs', { name: 'is_synced', definition: 'TINYINT(1) NOT NULL DEFAULT 1' });

    // Ensure uuid columns exist (VARCHAR to support indexes)
    await ensureColumn(conn, 'empdet', { name: 'uuid', definition: "VARCHAR(64) DEFAULT NULL" });
    await ensureColumn(conn, 'emppay', { name: 'uuid', definition: "VARCHAR(64) DEFAULT NULL" });
    await ensureColumn(conn, 'staffattendance', { name: 'uuid', definition: "VARCHAR(64) DEFAULT NULL" });
    await ensureColumn(conn, 'audit_logs', { name: 'uuid', definition: "VARCHAR(64) DEFAULT NULL" });

    // Ensure indexes
    await ensureIndex(conn, 'empdet', 'idx_empdet_tenant', 'tenant_id');
    await ensureIndex(conn, 'emppay', 'idx_emppay_tenant', 'tenant_id');
    await ensureIndex(conn, 'staffattendance', 'idx_attendance_tenant', 'tenant_id');
    await ensureIndex(conn, 'audit_logs', 'idx_audit_tenant', 'tenant_id');

    // Composite indexes for tenant+uuid
    await ensureIndex(conn, 'empdet', 'idx_empdet_tenant_uuid', 'tenant_id, uuid');
    await ensureIndex(conn, 'emppay', 'idx_emppay_tenant_uuid', 'tenant_id, uuid');
    await ensureIndex(conn, 'staffattendance', 'idx_attendance_tenant_uuid', 'tenant_id, uuid');
    await ensureIndex(conn, 'audit_logs', 'idx_audit_tenant_uuid', 'tenant_id, uuid');

    console.log('Schema fix completed');
  } catch (err) {
    console.error('Schema fix error:', err.message);
  } finally {
    conn.release();
    await pool.end();
  }
}

run().catch(e => { console.error(e); process.exit(1); });
