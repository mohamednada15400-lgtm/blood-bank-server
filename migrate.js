/**
 * Migration script: db.json → PostgreSQL
 * Run: node migrate.js
 * Requires DATABASE_URL environment variable
 * Optional: DB_JSON_PATH = path to db.json (default: data/db.json)
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const DB_JSON_PATH = process.env.DB_JSON_PATH || path.join(__dirname, 'data', 'db.json');
const BATCH_SIZE = 100;

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable required');
    process.exit(1);
  }

  // Read source data
  console.log('📖 Reading', DB_JSON_PATH);
  let source;
  try {
    source = JSON.parse(fs.readFileSync(DB_JSON_PATH, 'utf8'));
  } catch (e) {
    console.error('❌ Failed to read db.json:', e.message);
    process.exit(1);
  }

  console.log(`✅ Loaded ${Object.keys(source).length} tables from db.json`);
  console.log(`   Users: ${(source.users||[]).length}, Hospitals: ${(source.hospitals||[]).length}`);

  // Connect to PostgreSQL
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
    max: 10
  });

  const client = await pool.connect();
  try {
    console.log('🔌 Connected to PostgreSQL');

    // 1. Create tables (using same schema as db.js)
    const PG_TABLES = [
      `CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username VARCHAR(100) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, name VARCHAR(200) NOT NULL DEFAULT '', role VARCHAR(50) NOT NULL DEFAULT 'hospital', hospital_id INTEGER, governorate VARCHAR(100), view_permission VARCHAR(50) DEFAULT 'own', national_id VARCHAR(20) DEFAULT '', phone VARCHAR(50) DEFAULT '', email VARCHAR(200) DEFAULT '', permissions JSONB DEFAULT '{}')`,
      `CREATE TABLE IF NOT EXISTS hospitals (id SERIAL PRIMARY KEY, name VARCHAR(200) NOT NULL, governorate VARCHAR(100) NOT NULL, type VARCHAR(50) DEFAULT 'تخزيني', code VARCHAR(50) DEFAULT '')`,
      `CREATE TABLE IF NOT EXISTS governorates (id SERIAL PRIMARY KEY, name VARCHAR(100) UNIQUE NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS hospital_types (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS daily_stock (id SERIAL PRIMARY KEY, hospital_id INTEGER NOT NULL, blood_type VARCHAR(10) NOT NULL, quantity INTEGER NOT NULL DEFAULT 0, type VARCHAR(20) DEFAULT 'داخل', date TIMESTAMP DEFAULT NOW(), user_id INTEGER, user_name VARCHAR(200))`,
      `CREATE TABLE IF NOT EXISTS daily_reports (id SERIAL PRIMARY KEY, hospital_id INTEGER NOT NULL, date DATE DEFAULT CURRENT_DATE, time VARCHAR(10) DEFAULT '', under_inspection INTEGER DEFAULT 0, blood_data JSONB DEFAULT '{}', plasma_data JSONB DEFAULT '{}', platelets INTEGER DEFAULT 0, cryo INTEGER DEFAULT 0, license_type VARCHAR(50) DEFAULT 'تخزيني', license_status VARCHAR(200) DEFAULT '', plat_data JSONB DEFAULT '{}', user_id INTEGER)`,
      `CREATE TABLE IF NOT EXISTS daily_statements (id SERIAL PRIMARY KEY, hospital_id INTEGER NOT NULL, content TEXT DEFAULT '', type VARCHAR(50) DEFAULT 'بيان', date TIMESTAMP DEFAULT NOW(), user_id INTEGER, user_name VARCHAR(200))`,
      `CREATE TABLE IF NOT EXISTS monthly_storage (id SERIAL PRIMARY KEY, hospital_id INTEGER NOT NULL, year INTEGER NOT NULL, month INTEGER NOT NULL, blood_types JSONB DEFAULT '{}', user_id INTEGER)`,
      `CREATE TABLE IF NOT EXISTS monthly_aggregate (id SERIAL PRIMARY KEY, hospital_id INTEGER NOT NULL, year INTEGER NOT NULL, month INTEGER NOT NULL, data JSONB DEFAULT '{}', user_id INTEGER)`,
      `CREATE TABLE IF NOT EXISTS monthly_indicators (id SERIAL PRIMARY KEY, hospital_id INTEGER NOT NULL, year INTEGER NOT NULL, month INTEGER NOT NULL, day VARCHAR(10) DEFAULT '', time VARCHAR(10) DEFAULT '', data JSONB DEFAULT '{}', date TIMESTAMP DEFAULT NOW(), user_id INTEGER)`,
      `CREATE TABLE IF NOT EXISTS monthly_consumption (id SERIAL PRIMARY KEY, hospital_id INTEGER NOT NULL, year INTEGER NOT NULL, month INTEGER NOT NULL, blood_types JSONB DEFAULT '{}', user_id INTEGER)`,
      `CREATE TABLE IF NOT EXISTS monthly_big_indicators (id SERIAL PRIMARY KEY, hospital_id INTEGER NOT NULL, year INTEGER NOT NULL, month INTEGER NOT NULL, data JSONB DEFAULT '{}', user_id INTEGER)`,
      `CREATE TABLE IF NOT EXISTS monthly_small_indicators (id SERIAL PRIMARY KEY, hospital_id INTEGER NOT NULL, year INTEGER NOT NULL, month INTEGER NOT NULL, data JSONB DEFAULT '{}', user_id INTEGER)`,
      `CREATE TABLE IF NOT EXISTS consumption (id SERIAL PRIMARY KEY, hospital_id INTEGER NOT NULL, year INTEGER NOT NULL, month INTEGER NOT NULL, blood_type VARCHAR(10) NOT NULL, quantity INTEGER DEFAULT 0, user_id INTEGER)`,
      `CREATE TABLE IF NOT EXISTS archives (id SERIAL PRIMARY KEY, type VARCHAR(100) NOT NULL, title VARCHAR(200) NOT NULL, data JSONB DEFAULT '[]', date TIMESTAMP DEFAULT NOW(), user_id INTEGER, user_name VARCHAR(200))`,
      `CREATE TABLE IF NOT EXISTS employee_statements (id SERIAL PRIMARY KEY, hospital_id INTEGER, hospital_name VARCHAR(200) DEFAULT '', governorate VARCHAR(100) DEFAULT '', employee VARCHAR(200) NOT NULL, category VARCHAR(100) DEFAULT '', classification VARCHAR(100) DEFAULT '', shift VARCHAR(50) DEFAULT '', shifts_count INTEGER DEFAULT 0, national_id VARCHAR(20) DEFAULT '', phone VARCHAR(50) DEFAULT '', email VARCHAR(200) DEFAULT '', reviewed BOOLEAN DEFAULT false, review_month VARCHAR(10) DEFAULT '', updated_at TIMESTAMP DEFAULT NOW(), user_id INTEGER)`,
      `CREATE TABLE IF NOT EXISTS equipment_types (id SERIAL PRIMARY KEY, name VARCHAR(200) NOT NULL, category VARCHAR(50) DEFAULT 'تجميعي')`,
      `CREATE TABLE IF NOT EXISTS equipment_hospitals (id SERIAL PRIMARY KEY, name VARCHAR(200) NOT NULL UNIQUE, governorate VARCHAR(100) NOT NULL DEFAULT '', equipment JSONB DEFAULT '{}', reviewed BOOLEAN DEFAULT false, review_month VARCHAR(10) DEFAULT '', last_updated TIMESTAMP DEFAULT NOW())`,
      `CREATE TABLE IF NOT EXISTS readiness_occasions (id SERIAL PRIMARY KEY, name VARCHAR(200) NOT NULL, date_from DATE NOT NULL, date_to DATE NOT NULL, day_labels JSONB DEFAULT '[]', created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW(), user_id INTEGER)`,
      `CREATE TABLE IF NOT EXISTS readiness_reports (id SERIAL PRIMARY KEY, occasion_id INTEGER NOT NULL, hospital_id INTEGER NOT NULL, hospital_name VARCHAR(200) DEFAULT '', governorate VARCHAR(100) DEFAULT '', staff_data JSONB DEFAULT '[]', stock VARCHAR(50) DEFAULT '', shortage TEXT DEFAULT '', maintenance VARCHAR(50) DEFAULT '', breakdowns TEXT DEFAULT '', consumables VARCHAR(50) DEFAULT '', correction TEXT DEFAULT '', notes_manager TEXT DEFAULT '', notes_branch TEXT DEFAULT '', notes_authority TEXT DEFAULT '', created_by INTEGER, created_at TIMESTAMP DEFAULT NOW())`,
      `CREATE TABLE IF NOT EXISTS readiness_notifications (id SERIAL PRIMARY KEY, occasion_id INTEGER NOT NULL, occasion_name VARCHAR(200) DEFAULT '', message TEXT DEFAULT '', created_by INTEGER, created_at TIMESTAMP DEFAULT NOW(), dismissed BOOLEAN DEFAULT false)`,
      `CREATE TABLE IF NOT EXISTS app_config (key VARCHAR(100) PRIMARY KEY, value JSONB DEFAULT '{}')`,
      `CREATE TABLE IF NOT EXISTS strategic_settings (id SERIAL PRIMARY KEY, formula INTEGER DEFAULT 1, holiday_days INTEGER DEFAULT 14, calculated_at TIMESTAMP, quarter VARCHAR(100) DEFAULT '')`,
      `CREATE TABLE IF NOT EXISTS strategic_reserves (id SERIAL PRIMARY KEY, hospital_id INTEGER NOT NULL, hospital_name VARCHAR(200) DEFAULT '', governorate VARCHAR(100) DEFAULT '', values JSONB DEFAULT '{}', formula INTEGER DEFAULT 1, holiday_days INTEGER DEFAULT 14)`,
      `CREATE TABLE IF NOT EXISTS role_perms (id SERIAL PRIMARY KEY, role VARCHAR(100) UNIQUE NOT NULL, permissions JSONB DEFAULT '{}')`
    ];

    for (const sql of PG_TABLES) {
      await client.query(sql);
    }
    console.log('✅ Tables created');

    // Helper: insert batch
    async function insertBatch(table, columns, rows) {
      if (rows.length === 0) return;
      const placeholders = rows.map((_, ri) => `(${columns.map((_, ci) => `$${ri * columns.length + ci + 1}`).join(',')})`).join(',');
      const values = rows.flatMap(r => columns.map(c => r[c] !== undefined ? r[c] : null));
      const colStr = columns.map(c => `"${c}"`).join(',');
      await client.query(`INSERT INTO "${table}" (${colStr}) VALUES ${placeholders} ON CONFLICT DO NOTHING`, values);
    }

    // 2. Migrate data table by table
    const TABLES = [
      { name: 'users', columns: ['id','username','password','name','role','hospital_id','governorate','view_permission','national_id','phone','email'] },
      { name: 'hospitals', columns: ['id','name','governorate','type','code'] },
      { name: 'governorates', columns: ['id','name'] },
      { name: 'hospital_types', columns: ['id','name'] },
      { name: 'daily_stock', columns: ['id','hospital_id','blood_type','quantity','type','date','user_id','user_name'] },
      { name: 'daily_reports', columns: ['id','hospital_id','date','time','under_inspection','blood_data','plasma_data','platelets','cryo','license_type','license_status','plat_data','user_id'] },
      { name: 'daily_statements', columns: ['id','hospital_id','content','type','date','user_id','user_name'] },
      { name: 'monthly_storage', columns: ['id','hospital_id','year','month','blood_types','user_id'] },
      { name: 'monthly_aggregate', columns: ['id','hospital_id','year','month','data','user_id'] },
      { name: 'monthly_indicators', columns: ['id','hospital_id','year','month','day','time','data','date','user_id'] },
      { name: 'monthly_consumption', columns: ['id','hospital_id','year','month','blood_types','user_id'] },
      { name: 'monthly_big_indicators', columns: ['id','hospital_id','year','month','data','user_id'] },
      { name: 'monthly_small_indicators', columns: ['id','hospital_id','year','month','data','user_id'] },
      { name: 'consumption', columns: ['id','hospital_id','year','month','blood_type','quantity','user_id'] },
      { name: 'archives', columns: ['id','type','title','data','date','user_id','user_name'] },
      { name: 'employee_statements', columns: ['id','hospital_id','hospital_name','governorate','employee','category','classification','shift','shifts_count','national_id','phone','email','reviewed','review_month','updated_at','user_id'] },
      { name: 'equipment_types', columns: ['id','name','category'] },
      { name: 'equipment_hospitals', columns: ['id','name','governorate','equipment','reviewed','review_month','last_updated'] },
      { name: 'readiness_occasions', columns: ['id','name','date_from','date_to','day_labels','created_at','updated_at','user_id'] },
      { name: 'readiness_reports', columns: ['id','occasion_id','hospital_id','hospital_name','governorate','staff_data','stock','shortage','maintenance','breakdowns','consumables','correction','notes_manager','notes_branch','notes_authority','created_by','created_at'] },
      { name: 'readiness_notifications', columns: ['id','occasion_id','occasion_name','message','created_by','created_at','dismissed'] },
      { name: 'role_perms', columns: ['id','role','permissions'] },
      { name: 'strategic_settings', columns: ['id','formula','holiday_days','calculated_at','quarter'] },
      { name: 'strategic_reserves', columns: ['id','hospital_id','hospital_name','governorate','values','formula','holiday_days'] }
    ];

    for (const table of TABLES) {
      const srcRows = source[table.name];
      if (!srcRows || !Array.isArray(srcRows) || srcRows.length === 0) {
        console.log(`   ⏭️  ${table.name}: 0 rows (empty)`);
        continue;
      }

      // Stringify JSON fields
      const jsonCols = ['blood_data','plasma_data','plat_data','blood_types','data','permissions','day_labels','staff_data','equipment','values'];

      let migrated = 0;
      for (let i = 0; i < srcRows.length; i += BATCH_SIZE) {
        const batch = srcRows.slice(i, i + BATCH_SIZE);
        const processed = batch.map(row => {
          const r = { ...row };
          for (const col of Object.keys(r)) {
            if (jsonCols.includes(col) && typeof r[col] === 'object') {
              r[col] = JSON.stringify(r[col]);
            }
          }
          return r;
        });
        await insertBatch(table.name, table.columns, processed);
        migrated += processed.length;
      }
      console.log(`   ✅ ${table.name}: ${migrated} rows migrated`);
    }

    // Equipment (nested JSON)
    if (source.blood_bank_equipment) {
      const eq = source.blood_bank_equipment;
      // Types already handled above
      // Hospitals
      if (eq.hospitals && Array.isArray(eq.hospitals)) {
        for (const h of eq.hospitals) {
          await client.query(
            `INSERT INTO equipment_hospitals (name, governorate, equipment, reviewed, review_month, last_updated)
             VALUES ($1,$2,$3::jsonb,$4,$5,$6) ON CONFLICT (name) DO UPDATE SET governorate=$2, equipment=$3::jsonb, reviewed=$4, review_month=$5, last_updated=$6`,
            [h.name, h.governorate || '', JSON.stringify(h.equipment || {}), h.reviewed || false, h.review_month || null, source.blood_bank_equipment.lastUpdated || new Date().toISOString()]
          );
        }
        console.log(`   ✅ equipment_hospitals: ${eq.hospitals.length} hospitals migrated`);
      }
    }

    // App config
    if (source.app_config) {
      for (const [key, value] of Object.entries(source.app_config)) {
        await client.query('INSERT INTO app_config (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO UPDATE SET value = $2::jsonb',
          [key, JSON.stringify(value)]);
      }
      console.log('   ✅ app_config migrated');
    }

    // Reset sequences
    const seqTables = ['users','hospitals','governorates','hospital_types','daily_stock','daily_reports','daily_statements','monthly_storage','monthly_aggregate','monthly_indicators','monthly_consumption','monthly_big_indicators','monthly_small_indicators','consumption','archives','employee_statements','equipment_types','equipment_hospitals','readiness_occasions','readiness_reports','readiness_notifications','strategic_settings','strategic_reserves','role_perms'];
    for (const t of seqTables) {
      const maxId = source[t] && Array.isArray(source[t]) ? Math.max(...source[t].map(r => r.id || 0), 0) : 0;
      if (source._counters && source._counters[t]) {
        await client.query(`SELECT setval('${t}_id_seq', ${source._counters[t]}, true)`);
      } else if (maxId > 0) {
        await client.query(`SELECT setval('${t}_id_seq', ${maxId}, true)`);
      }
    }
    console.log('✅ Sequences reset');

    console.log('\n🎉 Migration complete!');
    console.log(`   Total rows migrated: ${Object.keys(source).reduce((sum, k) => sum + (Array.isArray(source[k]) ? source[k].length : 0), 0)}`);
  } catch (e) {
    console.error('❌ Migration failed:', e.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
