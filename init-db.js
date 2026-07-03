const { Pool } = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bloodbank';

async function init() {
  const pool = new Pool({ connectionString });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL,
      name VARCHAR(200) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'hospital',
      hospital_id INTEGER,
      governorate VARCHAR(100),
      view_permission VARCHAR(50) DEFAULT 'own'
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS hospitals (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      governorate VARCHAR(100) NOT NULL,
      is_aggregation BOOLEAN DEFAULT FALSE,
      code VARCHAR(50) DEFAULT ''
    );
    -- Add code column if missing (for existing DBs)
    BEGIN; ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS code VARCHAR(50) DEFAULT ''; COMMIT;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS governorates (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory (
      id SERIAL PRIMARY KEY,
      blood_type VARCHAR(5) NOT NULL,
      storage INTEGER DEFAULT 0,
      total_received INTEGER DEFAULT 0,
      total_consumed INTEGER DEFAULT 0,
      UNIQUE(blood_type)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS daily_stock (
      id SERIAL PRIMARY KEY,
      hospital_id INTEGER REFERENCES hospitals(id),
      blood_type VARCHAR(5) NOT NULL,
      quantity INTEGER NOT NULL,
      type VARCHAR(20) DEFAULT 'داخل',
      date TIMESTAMP DEFAULT NOW(),
      user_id INTEGER REFERENCES users(id),
      user_name VARCHAR(200)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS daily_statements (
      id SERIAL PRIMARY KEY,
      hospital_id INTEGER REFERENCES hospitals(id),
      content TEXT,
      type VARCHAR(50) DEFAULT 'بيان',
      date TIMESTAMP DEFAULT NOW(),
      user_id INTEGER REFERENCES users(id),
      user_name VARCHAR(200)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS daily_reports (
      id SERIAL PRIMARY KEY,
      hospital_id INTEGER REFERENCES hospitals(id),
      date DATE,
      time VARCHAR(20),
      under_inspection INTEGER DEFAULT 0,
      blood_data JSONB,
      plasma_data JSONB,
      platelets INTEGER DEFAULT 0,
      cryo INTEGER DEFAULT 0,
      license_type VARCHAR(50),
      license_status VARCHAR(50),
      plat_data JSONB,
      user_id INTEGER REFERENCES users(id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS monthly_storage (
      id SERIAL PRIMARY KEY,
      hospital_id INTEGER REFERENCES hospitals(id),
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      blood_types JSONB,
      date TIMESTAMP DEFAULT NOW(),
      user_id INTEGER REFERENCES users(id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS monthly_aggregate (
      id SERIAL PRIMARY KEY,
      hospital_id INTEGER REFERENCES hospitals(id),
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      data JSONB,
      date TIMESTAMP DEFAULT NOW(),
      user_id INTEGER REFERENCES users(id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS monthly_indicators (
      id SERIAL PRIMARY KEY,
      hospital_id INTEGER REFERENCES hospitals(id),
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      day VARCHAR(20),
      time VARCHAR(20),
      data JSONB,
      date TIMESTAMP DEFAULT NOW(),
      user_id INTEGER REFERENCES users(id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS consumption (
      id SERIAL PRIMARY KEY,
      hospital_id INTEGER REFERENCES hospitals(id),
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      blood_type VARCHAR(5) NOT NULL,
      quantity INTEGER NOT NULL,
      date TIMESTAMP DEFAULT NOW(),
      user_id INTEGER REFERENCES users(id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS archives (
      id SERIAL PRIMARY KEY,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(200),
      data JSONB,
      date TIMESTAMP DEFAULT NOW(),
      user_id INTEGER REFERENCES users(id),
      user_name VARCHAR(200)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      sid VARCHAR PRIMARY KEY,
      sess JSON NOT NULL,
      expire TIMESTAMP(6) NOT NULL
    );
  `);

  const existingUsers = await pool.query('SELECT COUNT(*) FROM users');
  if (parseInt(existingUsers.rows[0].count) === 0) {
    await pool.query(`INSERT INTO users (username, password, name, role, hospital_id, governorate, view_permission) VALUES
      ('admin', 'admin123', 'المدير العام', 'admin', NULL, NULL, 'all'),
      ('hospital1', '123456', 'مستشفى الملك فهد', 'hospital', 1, 'الرياض', 'own'),
      ('hospital2', '123456', 'مستشفى النور', 'hospital', 2, 'مكة', 'own'),
      ('branch', '123456', 'مشرف الرياض', 'branch_supervisor', NULL, 'الرياض', 'governorate'),
      ('org', '123456', 'مشرف الهيئة', 'org_supervisor', NULL, NULL, 'all'),
      ('visitor', '123456', 'زائر', 'visitor', NULL, NULL, 'limited');`);
  }

  const existingHospitals = await pool.query('SELECT COUNT(*) FROM hospitals');
  if (parseInt(existingHospitals.rows[0].count) === 0) {
    await pool.query(`INSERT INTO hospitals (name, governorate) VALUES
      ('مستشفى الملك فهد', 'الرياض'),
      ('مستشفى النور', 'مكة'),
      ('مستشفى الملك عبدالعزيز', 'جدة');`);
  }

  const existingGovs = await pool.query('SELECT COUNT(*) FROM governorates');
  if (parseInt(existingGovs.rows[0].count) === 0) {
    await pool.query(`INSERT INTO governorates (name) VALUES
      ('الرياض'), ('مكة'), ('جدة'), ('المدينة'), ('الدمام');`);
  }

  const existingInv = await pool.query('SELECT COUNT(*) FROM inventory');
  if (parseInt(existingInv.rows[0].count) === 0) {
    const types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    for (const t of types) {
      await pool.query('INSERT INTO inventory (blood_type, storage, total_received, total_consumed) VALUES ($1, 0, 0, 0)', [t]);
    }
  }

  console.log('✅ Database initialized successfully');
  await pool.end();
}

init().catch(err => { console.error('❌ Init error:', err); process.exit(1); });
