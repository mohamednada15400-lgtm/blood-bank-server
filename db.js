const path = require('path');
const fs = require('fs');
const os = require('os');

let DB_MODE = 'json'; // 'json' or 'pg'
let pool = null;
let jsondb = null;
const PREFERRED_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
let DATA_DIR = PREFERRED_DIR;
try {
  const test = path.join(PREFERRED_DIR, '.write-test');
  fs.writeFileSync(test, 'ok', 'utf8');
  fs.unlinkSync(test);
} catch {
  DATA_DIR = path.join(os.tmpdir(), 'bloodbank-data');
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
}

// ============== PostgreSQL Table Definitions ==============
const PG_TABLES = [
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(200) NOT NULL DEFAULT '',
    role VARCHAR(50) NOT NULL DEFAULT 'hospital',
    hospital_id INTEGER,
    governorate VARCHAR(100),
    view_permission VARCHAR(50) DEFAULT 'own',
    national_id VARCHAR(20) DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    email VARCHAR(200) DEFAULT '',
    permissions JSONB DEFAULT '{}'
  )`,
  `CREATE TABLE IF NOT EXISTS hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    governorate VARCHAR(100) NOT NULL,
    type VARCHAR(50) DEFAULT 'تخزيني',
    code VARCHAR(50) DEFAULT ''
  )`,
  `CREATE TABLE IF NOT EXISTS governorates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS hospital_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS daily_stock (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER NOT NULL,
    blood_type VARCHAR(10) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    type VARCHAR(20) DEFAULT 'داخل',
    date TIMESTAMP DEFAULT NOW(),
    user_id INTEGER,
    user_name VARCHAR(200)
  )`,
  `CREATE TABLE IF NOT EXISTS daily_reports (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    time VARCHAR(10) DEFAULT '',
    under_inspection INTEGER DEFAULT 0,
    blood_data JSONB DEFAULT '{}',
    plasma_data JSONB DEFAULT '{}',
    platelets INTEGER DEFAULT 0,
    cryo INTEGER DEFAULT 0,
    license_type VARCHAR(50) DEFAULT 'تخزيني',
    license_status VARCHAR(200) DEFAULT '',
    plat_data JSONB DEFAULT '{}',
    user_id INTEGER,
    updated_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS daily_statements (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER NOT NULL,
    content TEXT DEFAULT '',
    type VARCHAR(50) DEFAULT 'بيان',
    date TIMESTAMP DEFAULT NOW(),
    user_id INTEGER,
    user_name VARCHAR(200)
  )`,
  `CREATE TABLE IF NOT EXISTS monthly_storage (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    blood_types JSONB DEFAULT '{}',
    user_id INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS monthly_aggregate (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    data JSONB DEFAULT '{}',
    user_id INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS monthly_indicators (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    day VARCHAR(10) DEFAULT '',
    time VARCHAR(10) DEFAULT '',
    data JSONB DEFAULT '{}',
    date TIMESTAMP DEFAULT NOW(),
    user_id INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS monthly_consumption (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    blood_types JSONB DEFAULT '{}',
    user_id INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS monthly_big_indicators (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    data JSONB DEFAULT '{}',
    user_id INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS monthly_small_indicators (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    data JSONB DEFAULT '{}',
    user_id INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS consumption (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    blood_type VARCHAR(10) NOT NULL,
    quantity INTEGER DEFAULT 0,
    user_id INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS archives (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    data JSONB DEFAULT '[]',
    date TIMESTAMP DEFAULT NOW(),
    user_id INTEGER,
    user_name VARCHAR(200)
  )`,
  `CREATE TABLE IF NOT EXISTS employee_statements (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER,
    hospital_name VARCHAR(200) DEFAULT '',
    governorate VARCHAR(100) DEFAULT '',
    employee VARCHAR(200) NOT NULL,
    category VARCHAR(100) DEFAULT '',
    classification VARCHAR(100) DEFAULT '',
    shift VARCHAR(50) DEFAULT '',
    shifts_count INTEGER DEFAULT 0,
    national_id VARCHAR(20) DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    email VARCHAR(200) DEFAULT '',
    reviewed BOOLEAN DEFAULT false,
    review_month VARCHAR(10) DEFAULT '',
    updated_at TIMESTAMP DEFAULT NOW(),
    user_id INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS equipment_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) DEFAULT 'تجميعي'
  )`,
  `CREATE TABLE IF NOT EXISTS equipment_hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    governorate VARCHAR(100) NOT NULL DEFAULT '',
    equipment JSONB DEFAULT '{}',
    reviewed BOOLEAN DEFAULT false,
    review_month VARCHAR(10) DEFAULT '',
    last_updated TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS readiness_occasions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    day_labels JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    user_id INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS readiness_reports (
    id SERIAL PRIMARY KEY,
    occasion_id INTEGER NOT NULL,
    hospital_id INTEGER NOT NULL,
    hospital_name VARCHAR(200) DEFAULT '',
    governorate VARCHAR(100) DEFAULT '',
    staff_data JSONB DEFAULT '[]',
    stock VARCHAR(50) DEFAULT '',
    shortage TEXT DEFAULT '',
    maintenance VARCHAR(50) DEFAULT '',
    breakdowns TEXT DEFAULT '',
    consumables VARCHAR(50) DEFAULT '',
    correction TEXT DEFAULT '',
    notes_manager TEXT DEFAULT '',
    notes_branch TEXT DEFAULT '',
    notes_authority TEXT DEFAULT '',
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS readiness_notifications (
    id SERIAL PRIMARY KEY,
    occasion_id INTEGER NOT NULL,
    occasion_name VARCHAR(200) DEFAULT '',
    message TEXT DEFAULT '',
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    dismissed BOOLEAN DEFAULT false
  )`,
  `CREATE TABLE IF NOT EXISTS app_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB DEFAULT '{}'
  )`,
  `CREATE TABLE IF NOT EXISTS strategic_settings (
    id SERIAL PRIMARY KEY,
    formula INTEGER DEFAULT 1,
    holiday_days INTEGER DEFAULT 14,
    calculated_at TIMESTAMP,
    quarter VARCHAR(100) DEFAULT ''
  )`,
  `CREATE TABLE IF NOT EXISTS strategic_reserves (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER NOT NULL,
    hospital_name VARCHAR(200) DEFAULT '',
    governorate VARCHAR(100) DEFAULT '',
    values JSONB DEFAULT '{}',
    formula INTEGER DEFAULT 1,
    holiday_days INTEGER DEFAULT 14
  )`,
  `CREATE TABLE IF NOT EXISTS role_perms (
    id SERIAL PRIMARY KEY,
    role VARCHAR(100) UNIQUE NOT NULL,
    permissions JSONB DEFAULT '{}'
  )`,
  `CREATE TABLE IF NOT EXISTS hospital_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS indicator_columns (
    id SERIAL PRIMARY KEY,
    category VARCHAR(10) NOT NULL,
    col_key VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(200) NOT NULL,
    ord INTEGER NOT NULL DEFAULT 0,
    enabled INTEGER DEFAULT 1,
    static INTEGER DEFAULT 0,
    formula INTEGER DEFAULT 0,
    formula_expr TEXT DEFAULT '',
    unit VARCHAR(20) DEFAULT '',
    target VARCHAR(50) DEFAULT '',
    grp VARCHAR(200) DEFAULT '',
    sg VARCHAR(200) DEFAULT '',
    ssg VARCHAR(200) DEFAULT '',
    cls VARCHAR(50) DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS kv_store (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB DEFAULT '{}'
  )`,
  `CREATE TABLE IF NOT EXISTS blood_bags (
    id SERIAL PRIMARY KEY,
    bag_no VARCHAR(100) NOT NULL,
    barcode VARCHAR(200) DEFAULT '',
    hospital_id INTEGER NOT NULL,
    source_hospital_id INTEGER NOT NULL,
    source_name VARCHAR(200) DEFAULT '',
    collection_date DATE,
    expiry_date DATE,
    blood_type VARCHAR(10) DEFAULT '',
    product_type VARCHAR(30) DEFAULT 'دم',
    units INTEGER DEFAULT 1,
    unit_category VARCHAR(20) DEFAULT 'كبار',
    donation_id INTEGER,
    donor_id INTEGER,
    donor_name VARCHAR(200) DEFAULT '',
    donor_national_id VARCHAR(20) DEFAULT '',
    donor_age INTEGER,
    donor_gender VARCHAR(10) DEFAULT '',
    status VARCHAR(50) DEFAULT 'collected',
    test_hcv VARCHAR(20) DEFAULT '',
    test_hbv VARCHAR(20) DEFAULT '',
    test_hiv VARCHAR(20) DEFAULT '',
    test_syphilis VARCHAR(20) DEFAULT '',
    test_nat VARCHAR(20) DEFAULT '',
    tested_at TIMESTAMP,
    tested_by VARCHAR(200) DEFAULT '',
    dispatch_from INTEGER,
    dispatch_to INTEGER,
    dispatched_at TIMESTAMP,
    received_at TIMESTAMP,
    received_by VARCHAR(200) DEFAULT '',
    recipient_id INTEGER,
    recipient_name VARCHAR(200) DEFAULT '',
    issued_at TIMESTAMP,
    issued_by VARCHAR(200) DEFAULT '',
    issue_type VARCHAR(20) DEFAULT '',
    return_reason VARCHAR(200) DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    user_id INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS blood_bag_events (
    id SERIAL PRIMARY KEY,
    bag_id INTEGER NOT NULL,
    bag_no VARCHAR(100) DEFAULT '',
    event VARCHAR(200) NOT NULL,
    from_hospital_id INTEGER,
    to_hospital_id INTEGER,
    detail TEXT DEFAULT '',
    user_id INTEGER,
    user_name VARCHAR(200) DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    national_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    gender VARCHAR(10) DEFAULT '',
    birth_date DATE,
    age INTEGER,
    blood_type VARCHAR(10) DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    governorate VARCHAR(100) DEFAULT '',
    hospital_id INTEGER,
    department VARCHAR(100) DEFAULT '',
    notes TEXT DEFAULT '',
    bt_cards INTEGER DEFAULT 0,
    bt_date DATE,
    req_rbc INTEGER DEFAULT 0,
    req_plasma INTEGER DEFAULT 0,
    req_plt INTEGER DEFAULT 0,
    req_cryo INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS bag_reservations (
    id SERIAL PRIMARY KEY,
    bag_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    patient_name VARCHAR(200) DEFAULT '',
    hospital_id INTEGER NOT NULL,
    reserved_at TIMESTAMP DEFAULT NOW(),
    reserved_until TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    compat_cards INTEGER DEFAULT 0,
    issued_at TIMESTAMP,
    issued_by VARCHAR(200) DEFAULT '',
    issued_department VARCHAR(200) DEFAULT '',
    released_at TIMESTAMP,
    user_id INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS hospital_departments (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER NOT NULL,
    name VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS donors (
    id SERIAL PRIMARY KEY,
    national_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    birth_date DATE,
    age INTEGER,
    blood_type VARCHAR(10) DEFAULT '',
    governorate VARCHAR(100) DEFAULT '',
    gender VARCHAR(10) DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    address VARCHAR(300) DEFAULT '',
    notes TEXT DEFAULT '',
    donor_status VARCHAR(20) DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS donations (
    id SERIAL PRIMARY KEY,
    donor_id INTEGER NOT NULL,
    hospital_id INTEGER,
    user_id INTEGER,
    status VARCHAR(20) DEFAULT 'مقبول',
    deferral_reason VARCHAR(200) DEFAULT '',
    deferral_duration INTEGER,
    return_date DATE,
    screening JSONB DEFAULT '{}',
    rejection_reason VARCHAR(200) DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
  )`
];

// ============== Database Class ==============
class Database {
  constructor() {
    this.mode = 'json';
    this.db = null;
    this._initialized = false;
  }
  async init() {
    if (this._initialized) return;
    this._initialized = true;

    let dbUrl = process.env.DATABASE_URL;

    // If DATABASE_URL points to localhost (Belmo default), ignore it and use pg_connection_string
    if (dbUrl && (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1') || dbUrl.includes('0.0.0.0'))) {
      console.log('⚠️ Ignoring DATABASE_URL env var (localhost), will use pg_connection_string from db.json');
      dbUrl = null;
    }

    // Try connecting; if env var fails, fall back to pg_connection_string from db.json
    async function tryConnect(url) {
      const { Pool } = require('pg');
      const p = new Pool({
        connectionString: url,
        ssl: url.includes('localhost') ? false : { rejectUnauthorized: false },
        max: 2,
        connectionTimeoutMillis: 5000
      });
      try {
        const c = await p.connect();
        c.release();
        return p;
      } catch (e) {
        try { await p.end(); } catch(_) {}
        throw e;
      }
    }

    async function connectPG(url) {
      pool = await tryConnect(url);
      pool.options.max = 20;
      pool.options.idleTimeoutMillis = 30000;
      this.mode = 'pg';
      DB_MODE = 'pg';

      const client = await pool.connect();
      try {
        for (const sql of PG_TABLES) {
          await client.query(sql);
        }
        // Migration: add view_hospital_ids column
        try { await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS view_hospital_ids JSONB DEFAULT '[]'"); } catch(e) {}
        // Migration: patients blood-type date + requested product quantities
        try { await client.query("ALTER TABLE patients ADD COLUMN IF NOT EXISTS bt_date DATE"); } catch(e) {}
        try { await client.query("ALTER TABLE patients ADD COLUMN IF NOT EXISTS req_rbc INTEGER DEFAULT 0"); } catch(e) {}
        try { await client.query("ALTER TABLE patients ADD COLUMN IF NOT EXISTS req_plasma INTEGER DEFAULT 0"); } catch(e) {}
        try { await client.query("ALTER TABLE patients ADD COLUMN IF NOT EXISTS req_plt INTEGER DEFAULT 0"); } catch(e) {}
        try { await client.query("ALTER TABLE patients ADD COLUMN IF NOT EXISTS req_cryo INTEGER DEFAULT 0"); } catch(e) {}
        // Migration: NAT test result on blood bags
        try { await client.query("ALTER TABLE blood_bags ADD COLUMN IF NOT EXISTS test_nat VARCHAR(20) DEFAULT ''"); } catch(e) {}
        // Migration: adult/child unit category on blood bags
        try { await client.query("ALTER TABLE blood_bags ADD COLUMN IF NOT EXISTS unit_category VARCHAR(20) DEFAULT 'كبار'"); } catch(e) {}
        // Migration: donor linkage on blood bags (donation card)
        try { await client.query("ALTER TABLE blood_bags ADD COLUMN IF NOT EXISTS donor_id INTEGER"); } catch(e) {}
        // Migration: department the bag was issued to on reservations
        try { await client.query("ALTER TABLE bag_reservations ADD COLUMN IF NOT EXISTS issued_department VARCHAR(200) DEFAULT ''"); } catch(e) {}
        // Migration: last-update timestamp on daily reports (آخر تحديث note)
        try { await client.query("ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()"); } catch(e) {}
        // Migration: rename hospital users h{id} → emp{seq}
        try {
          await client.query("UPDATE users SET username = 'emp' || seq.num FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY id)::text as num FROM users WHERE role = 'hospital' AND username ~ '^h\\d+$') seq WHERE users.id = seq.id AND users.username LIKE 'h%'");
        } catch(e) {}
        const userCount = await client.query('SELECT COUNT(*) FROM users');
        if (parseInt(userCount.rows[0].count) === 0) {
          await this._seedPG(client);
        }
        // Migration: fix missing + zeroed-out pages in role_perms
        const ALL_PAGES = ['daily_stock','daily_total','daily_statement','daily_branch','monthly_indicators','monthly_consumption','monthly_big','monthly_small','indicator_analysis','employees','archive','strategic_stock','users','hospitals','governorates','role_perms','readiness','equipment','time_config','emp_accounts','indicator_columns'];
        const { DEF_PERMS: PG_DEF_PERMS } = require('./jsondb');
        const rpResult = await client.query('SELECT role, permissions FROM role_perms');
        for (const row of rpResult.rows) {
          let perms = typeof row.permissions === 'string' ? JSON.parse(row.permissions) : row.permissions;
          let changed = false;
          const defPerms = PG_DEF_PERMS[row.role];
          for (const k of ALL_PAGES) {
            if (perms[k] === undefined) {
              perms[k] = JSON.parse(JSON.stringify(defPerms?.[k] || (row.role === 'admin' ? { v: 1, a: 1, e: 1, d: 1, x: 1 } : { v: 0, a: 0, e: 0, d: 0, x: 0 })));
              changed = true;
            } else if (defPerms?.[k]) {
              const cur = perms[k];
              const def = defPerms[k];
              const isZeroed = cur.v===0 && cur.a===0 && cur.e===0 && cur.d===0 && cur.x===0;
              const shouldHaveAccess = def.v===1 || def.a===1 || def.e===1 || def.d===1 || def.x===1;
              if (isZeroed && shouldHaveAccess) {
                perms[k] = JSON.parse(JSON.stringify(def));
                changed = true;
              }
            }
          }
          if (changed) {
            await client.query('UPDATE role_perms SET permissions = $1 WHERE role = $2', [JSON.stringify(perms), row.role]);
            console.log(`🔧 Fixed role_perms: ${row.role}`);
          }
        }
      } finally {
        client.release();
      }
      console.log('✅ PostgreSQL connected');
      return true;
    }

    // Try DATABASE_URL env var first
    if (dbUrl) {
      try {
        await connectPG.call(this, dbUrl);
        return;
      } catch (e) {
        console.log('⚠️ DATABASE_URL env var failed:', e.message);
        dbUrl = null;
      }
    }

    // Fall back to pg_connection_string from db.json
    if (!dbUrl) {
      try {
        const cfgPath = path.join(DATA_DIR, 'db.json');
        if (fs.existsSync(cfgPath)) {
          const raw = fs.readFileSync(cfgPath, 'utf8');
          const cfg = JSON.parse(raw);
          if (cfg.app_config && cfg.app_config.pg_connection_string) {
            dbUrl = cfg.app_config.pg_connection_string;
            console.log('📦 DATABASE_URL loaded from db.json app_config');
            try {
              await connectPG.call(this, dbUrl);
              return;
            } catch (e) {
              console.log('⚠️ pg_connection_string from db.json failed:', e.message);
              dbUrl = null;
            }
          }
        }
      } catch (e) {
        console.log('⚠️ Could not read pg_connection_string from db.json:', e.message);
      }
    }

    // Fall back to JSON mode
    console.log('⚠️ PostgreSQL not available, falling back to JSON mode');
    const { JSONDB } = require('./jsondb');
    const dbPath = path.join(DATA_DIR, 'db.json');
    jsondb = new JSONDB(dbPath);
    jsondb.init();
    this.db = jsondb;
    console.log('✅ JSON database loaded');
  }

  async _seedPG(client) {
    const bcrypt = require('bcryptjs');
    const pwdHash = bcrypt.hashSync('123', 10);

    // Seed users
    await client.query(`INSERT INTO users (id, username, password, name, role, hospital_id, governorate, view_permission) VALUES
      (1,'admin',$1,'المدير العام','admin',NULL,NULL,'all'),
      (2,'por',$2,'مشرف بورسعيد','branch_supervisor',NULL,'بورسعيد','governorate'),
      (3,'ism',$3,'مشرف الإسماعيلية','branch_supervisor',NULL,'الإسماعيلية','governorate'),
      (4,'lux',$4,'مشرف الأقصر','branch_supervisor',NULL,'الأقصر','governorate'),
      (5,'south',$5,'مشرف جنوب سيناء','branch_supervisor',NULL,'جنوب سيناء','governorate'),
      (6,'asw',$6,'مشرف أسوان','branch_supervisor',NULL,'أسوان','governorate'),
      (7,'org',$7,'مشرف الهيئة','org_supervisor',NULL,NULL,'all'),
      (8,'visitor',$8,'زائر','visitor',NULL,NULL,'limited')
    `, [pwdHash, pwdHash, pwdHash, pwdHash, pwdHash, pwdHash, pwdHash, pwdHash]);

    // Seed hospitals
    await client.query(`INSERT INTO hospitals (id, name, governorate, type) VALUES
      (1,'التضامن (مجمع الشفاء)*','بورسعيد','تجميعي'),
      (2,'النصر *','بورسعيد','تجميعي'),
      (3,'الحياة بورفؤاد *','بورسعيد','تجميعي'),
      (4,'الزهور','بورسعيد','تخزيني'),
      (5,'٣٠ يونيو','بورسعيد','تخزيني'),
      (6,'السلام','بورسعيد','تخزيني'),
      (7,'المجمع الطبي *','الإسماعيلية','تجميعي'),
      (8,'طوارئ ابو خليفه','الإسماعيلية','تخزيني'),
      (9,'مركز 30 يونيو','الإسماعيلية','تخزيني'),
      (10,'فايد التخصصي','الإسماعيلية','تخزيني'),
      (11,'القصاصين التخصصي','الإسماعيلية','تخزيني'),
      (12,'القنطرة غرب التخصصي','الإسماعيلية','تخزيني'),
      (13,'القنطرة شرق التخصصي','الإسماعيلية','تخزيني'),
      (14,'التل الكبيرالتخصصي','الإسماعيلية','تخزيني'),
      (15,'مجمع السويس الطبي *','السويس','تجميعي'),
      (16,'المرأه والطفل ( حوض الدرس )','السويس','تخزيني'),
      (17,'المناظير و الجهاز الهضمي','السويس','تخزيني'),
      (18,'طيبة التخصصي *','الأقصر','تجميعي'),
      (19,'المجمع الطبي الاقصر','الأقصر','تخزيني'),
      (20,'ايزيس التخصصي','الأقصر','تخزيني'),
      (21,'الاطفال التخصصي','الأقصر','تخزيني'),
      (22,'الكرنك الدولي *','الأقصر','تجميعي'),
      (23,'حورس','الأقصر','تخزيني'),
      (24,'راس سدر *','جنوب سيناء','تجميعي'),
      (25,'شرم الشيخ الدولي','جنوب سيناء','تخزيني'),
      (26,'طابا','جنوب سيناء','تخزيني'),
      (27,'سانت كاترين','جنوب سيناء','تخزيني'),
      (28,'مجمع الفيروز *','جنوب سيناء','تجميعي'),
      (29,'دهب','جنوب سيناء','تخزيني'),
      (30,'النيل التخصصي*(حورس ادفو)','أسوان','تجميعي'),
      (31,'اسوان التخصصي (الصداقه)','أسوان','تخزيني'),
      (32,'كوم امبو *','أسوان','تجميعي'),
      (33,'دراو','أسوان','تخزيني'),
      (34,'معهد الاورام','أسوان','تخزيني'),
      (35,'ابوسمبل الدولي','أسوان','تخزيني'),
      (36,'المسلة التخصصي','أسوان','تخزيني'),
      (37,'السباعية التخصصي','أسوان','تخزيني'),
      (38,'صحة المرأة','بورسعيد','تخزيني'),
      (39,'الطور','جنوب سيناء','تخزيني')
    `);

    // Seed governorates
    await client.query(`INSERT INTO governorates (id, name) VALUES
      (1,'بورسعيد'),(2,'الإسماعيلية'),(3,'السويس'),(4,'الأقصر'),(5,'جنوب سيناء'),(6,'أسوان')
    `);

    // Seed hospital_types
    await client.query(`INSERT INTO hospital_types (id, name) VALUES (1,'تجميعي'),(2,'تخزيني')`);

    // Seed equipment_types
    await client.query(`INSERT INTO equipment_types (id, name, category) VALUES
      (1,'فريزر بلازما','تخزيني'),(2,'ثلاجة دم','تخزيني'),(3,'ثلاجة مستهلكات','تخزيني'),
      (4,'ثلاجة اعدام','تخزيني'),(5,'حضان للصفائح الدموية','تجميعي'),
      (6,'جهاز تسييح البلازما','تجميعي'),
      (7,'نظام مغلق Close sys','تجميعي'),(8,'عاصر انبوب Tube Stripper','تجميعي'),
      (9,'التوافق Cm set','تجميعي'),(10,'Pipette Fixed 50µ','تخزيني'),
      (11,'Pipette Variable 100-1000µ','تخزيني'),(12,'Pipette Variable 20-200µ','تخزيني'),
      (13,'Pipette Variable 10-100µ','تخزيني'),(14,'ميزان ديجيتال Lab Balance','تخزيني'),
      (15,'سنترفيوج مبرد','تخزيني'),(16,'جهاز فصل يدوي Extractor','تخزيني'),
      (17,'سرير متبرع','تجميعي'),(18,'جهاز هزاز وميزان قرب الدم','تجميعي'),
      (19,'جهاز قياس هيموجلوبين','تجميعي'),(20,'Adult Sphygmomanometer','تجميعي'),
      (21,'Stethoscope','تجميعي'),(22,'ميزان أشخاص','تجميعي')
    `);

    // Seed role_perms
    const DEF_PERMS = {
      admin: { v:1,a:1,e:1,d:1,x:1 },
      org_supervisor: Object.fromEntries(['daily_stock','daily_total','daily_statement','daily_branch','monthly_indicators','monthly_consumption','monthly_big','monthly_small','indicator_analysis','employees','archive','strategic_stock','inventory','role_perms','readiness','equipment','time_config','emp_accounts'].map(k => [k, {v:1,a:0,e:0,d:0,x:1}])),
      branch_supervisor: Object.fromEntries(['daily_stock','daily_total','daily_branch','monthly_indicators','monthly_consumption','monthly_big','monthly_small','indicator_analysis','strategic_stock','readiness','equipment','time_config','emp_accounts','employees'].map(k => [k, {v:1,a:1,e:1,d:1,x:1}])),
      hospital: Object.fromEntries(['daily_stock','daily_total','daily_branch','monthly_indicators','monthly_consumption','monthly_big','monthly_small','indicator_analysis','readiness','time_config','emp_accounts'].map(k => [k, {v:1,a:1,e:1,d:1,x:1}])),
      hospital_manager: Object.fromEntries(['daily_stock','daily_total','daily_branch','monthly_indicators','monthly_consumption','monthly_big','monthly_small','indicator_analysis','readiness','time_config','emp_accounts'].map(k => [k, {v:1,a:1,e:1,d:1,x:1}])),
      visitor: Object.fromEntries(['daily_stock','daily_total','daily_branch','monthly_indicators','monthly_consumption','monthly_big','monthly_small','indicator_analysis','readiness','time_config','emp_accounts'].map(k => [k, {v:1,a:0,e:0,d:0,x:0}]))
    };
    // Fix overrides
    DEF_PERMS.org_supervisor['users'] = {v:1,a:0,e:0,d:0,x:0};
    DEF_PERMS.org_supervisor['hospitals'] = {v:1,a:0,e:0,d:0,x:1};
    DEF_PERMS.org_supervisor['governorates'] = {v:1,a:0,e:0,d:0,x:1};
    DEF_PERMS.branch_supervisor['archive'] = {v:1,a:0,e:0,d:0,x:1};
    DEF_PERMS.branch_supervisor['users'] = {v:0,a:0,e:0,d:0,x:0};
    DEF_PERMS.branch_supervisor['hospitals'] = {v:1,a:0,e:0,d:0,x:1};
    DEF_PERMS.branch_supervisor['governorates'] = {v:1,a:0,e:0,d:0,x:1};
    DEF_PERMS.hospital['archive'] = {v:1,a:0,e:0,d:0,x:0};
    DEF_PERMS.hospital['users'] = {v:0,a:0,e:0,d:0,x:0};
    DEF_PERMS.hospital['hospitals'] = {v:0,a:0,e:0,d:0,x:0};
    DEF_PERMS.hospital['governorates'] = {v:0,a:0,e:0,d:0,x:0};
    DEF_PERMS.hospital_manager['archive'] = {v:1,a:0,e:0,d:0,x:1};
    DEF_PERMS.hospital_manager['employees'] = {v:1,a:1,e:1,d:1,x:1};
    DEF_PERMS.hospital_manager['users'] = {v:0,a:0,e:0,d:0,x:0};
    DEF_PERMS.hospital_manager['hospitals'] = {v:0,a:0,e:0,d:0,x:0};
    DEF_PERMS.hospital_manager['governorates'] = {v:0,a:0,e:0,d:0,x:0};

    for (const [role, perms] of Object.entries(DEF_PERMS)) {
      await client.query('INSERT INTO role_perms (role, permissions) VALUES ($1, $2) ON CONFLICT (role) DO NOTHING',
        [role, JSON.stringify(perms)]);
    }

    // Seed app_config
    await client.query("INSERT INTO app_config (key, value) VALUES ('time_offset', '2') ON CONFLICT (key) DO NOTHING");
  }

  async query(text, params) {
    if (this.mode === 'pg') {
      try {
        const result = await pool.query(text, params);
        return result;
      } catch (err) {
        console.error('PG Error:', err.message, 'SQL:', text.slice(0, 200));
        throw err;
      }
    } else {
      if (!jsondb) return { rows: [] };
      return await jsondb.query(text, params);
    }
  }

  async getNextId(table) {
    if (this.mode === 'pg') {
      const result = await this.query(`SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM ${table}`);
      return parseInt(result.rows[0].next_id);
    } else {
      return jsondb._nextId(table);
    }
  }

  async save() {
    if (this.mode === 'json' && jsondb) {
      jsondb._save();
    }
    // PG mode: auto-committed
  }

  async flush() {
    if (this.mode === 'json' && jsondb) {
      if (jsondb._saveTimer) clearTimeout(jsondb._saveTimer);
      jsondb._saveTimer = null;
      jsondb._write();
    }
    // PG mode: auto-committed
  }

  async reload() {
    // For sync import: reload database
    if (this.mode === 'json' && jsondb) {
      const data = JSON.parse(fs.readFileSync(jsondb.filePath, 'utf8'));
      jsondb.data = data;
      jsondb._ensureTables();
    }
    // PG mode: no-op (already reading from DB)
  }

  // ===== Legacy compatibility: db.data.X → query() calls =====
  // These exist for the few places in server.js that still need
  // direct array/object access. New code should use query().
  async getTable(name) {
    if (this.mode === 'pg') {
      const result = await this.query(`SELECT * FROM ${name} ORDER BY id`);
      return result.rows;
    } else {
      return jsondb ? (jsondb.data[name] || []) : [];
    }
  }

  async getConfig(key) {
    if (this.mode === 'pg') {
      const r = await this.query('SELECT value FROM app_config WHERE key = $1', [key]);
      if (r.rows.length > 0) return r.rows[0].value;
      return null;
    } else {
      return jsondb ? (jsondb.data.app_config ? jsondb.data.app_config[key] : null) : null;
    }
  }

  async setConfig(key, value) {
    if (this.mode === 'pg') {
      await this.query('INSERT INTO app_config (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO UPDATE SET value = $2::jsonb',
        [key, JSON.stringify(value)]);
    } else {
      if (!jsondb) return;
      if (!jsondb.data.app_config) jsondb.data.app_config = {};
      jsondb.data.app_config[key] = value;
      jsondb._save();
    }
  }

  async getEquipment() {
    if (this.mode === 'pg') {
      const types = await this.query('SELECT * FROM equipment_types ORDER BY id');
      const hospitals = await this.query('SELECT * FROM equipment_hospitals ORDER BY governorate, name');
      const lastUpdated = await this.query("SELECT value FROM app_config WHERE key = 'equipment_last_updated'");
      return {
        types: types.rows,
        hospitals: hospitals.rows,
        lastUpdated: lastUpdated.rows.length > 0 ? lastUpdated.rows[0].value : null
      };
    } else {
      return jsondb ? (jsondb.data.blood_bank_equipment || { types: [], hospitals: [], lastUpdated: null }) : { types: [], hospitals: [], lastUpdated: null };
    }
  }

  async setEquipmentTypes(types) {
    if (this.mode === 'pg') {
      await this.query('DELETE FROM equipment_types');
      for (const t of types) {
        await this.query('INSERT INTO equipment_types (id, name, category) VALUES ($1, $2, $3)',
          [t.id, t.name, t.category || 'تجميعي']);
      }
    } else {
      if (!jsondb) return;
      if (!jsondb.data.blood_bank_equipment) jsondb.data.blood_bank_equipment = { types: [], hospitals: [], lastUpdated: null };
      jsondb.data.blood_bank_equipment.types = types;
      jsondb._save();
    }
  }

  async setEquipmentHospital(hosp) {
    if (this.mode === 'pg') {
      await this.query(`INSERT INTO equipment_hospitals (name, governorate, equipment, reviewed, review_month, last_updated)
        VALUES ($1,$2,$3::jsonb,$4,$5,NOW())
        ON CONFLICT (name) DO UPDATE SET governorate=$2, equipment=$3::jsonb, reviewed=$4, review_month=$5, last_updated=NOW()`,
        [hosp.name, hosp.governorate || '', JSON.stringify(hosp.equipment || {}), hosp.reviewed || false, hosp.review_month || null]);
      await this.query("INSERT INTO app_config (key, value) VALUES ('equipment_last_updated', $1::jsonb) ON CONFLICT (key) DO UPDATE SET value = $1::jsonb",
        [JSON.stringify(new Date().toISOString())]);
    } else {
      if (!jsondb) return;
      if (!jsondb.data.blood_bank_equipment) jsondb.data.blood_bank_equipment = { types: [], hospitals: [], lastUpdated: null };
      let entry = jsondb.data.blood_bank_equipment.hospitals.find(h => h.name === hosp.name);
      if (entry) {
        Object.assign(entry, hosp);
      } else {
        jsondb.data.blood_bank_equipment.hospitals.push(hosp);
      }
      jsondb.data.blood_bank_equipment.lastUpdated = new Date().toISOString();
      jsondb._save();
    }
  }

  async deleteEquipmentHospital(name) {
    if (this.mode === 'pg') {
      await this.query('DELETE FROM equipment_hospitals WHERE name = $1', [name]);
    } else {
      if (!jsondb || !jsondb.data.blood_bank_equipment) return;
      jsondb.data.blood_bank_equipment.hospitals = jsondb.data.blood_bank_equipment.hospitals.filter(h => h.name !== name);
      jsondb._save();
    }
  }

  async getReadinessOccasions() {
    if (this.mode === 'pg') {
      const r = await this.query("SELECT id, name, TO_CHAR(date_from, 'YYYY-MM-DD') as date_from, TO_CHAR(date_to, 'YYYY-MM-DD') as date_to, day_labels, created_at, updated_at, user_id FROM readiness_occasions ORDER BY id DESC");
      return r.rows;
    }
    return jsondb ? (jsondb.data.readiness_occasions || []).sort((a, b) => b.id - a.id) : [];
  }

  async getReadinessReports(occasionId, hospitalId) {
    if (this.mode === 'pg') {
      let sql = 'SELECT * FROM readiness_reports WHERE 1=1';
      const params = [];
      if (occasionId) { sql += ' AND occasion_id = $' + (params.length + 1); params.push(occasionId); }
      if (hospitalId) { sql += ' AND hospital_id = $' + (params.length + 1); params.push(hospitalId); }
      sql += ' ORDER BY id DESC';
      const r = await this.query(sql, params);
      return r.rows;
    }
    let rows = jsondb ? [...(jsondb.data.readiness_reports || [])] : [];
    if (occasionId) rows = rows.filter(r => r.occasion_id === occasionId);
    if (hospitalId) rows = rows.filter(r => r.hospital_id === hospitalId);
    return rows;
  }

  async shutdown() {
    if (pool) {
      await pool.end();
    }
  }
}

const database = new Database();

module.exports = database;
