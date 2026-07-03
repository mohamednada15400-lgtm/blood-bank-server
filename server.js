require('express-async-errors');
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const os = require('os');
const app = express();
const PORT = process.env.PORT || 0;
const isProd = !!process.env.DATABASE_URL;

// Portable mode — writable data folder alongside the EXE
const isPkg = !!process.pkg;
const PORTABLE_DIR = isPkg ? path.dirname(process.execPath) : __dirname;
const dataDir = process.env.DATA_DIR || path.join(PORTABLE_DIR, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

console.log(`📁 Blood Bank Portable v1.0`);
console.log(`   Mode: ${isPkg ? 'Packaged EXE' : 'Development'}`);
console.log(`   Data: ${dataDir}`);
const SESSION_SECRET = process.env.SESSION_SECRET || 'blood-bank-secret-key-2026';
const BCRYPT_ROUNDS = 10;

let query, db;
if (isProd) {
  const { Pool } = require('pg');
  const pgSession = require('connect-pg-simple')(session);
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  app.use(session({
    store: new pgSession({ pool, tableName: 'user_sessions', createTableIfMissing: true }),
    secret: SESSION_SECRET, resave: false, saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000, secure: true, httpOnly: true, sameSite: 'strict' }
  }));
  query = async (text, params) => { const r = await pool.query(text, params); return r; };
} else {
  const MemoryStore = require('memorystore')(session);
  app.use(session({
    store: new MemoryStore({ checkPeriod: 86400000 }),
    secret: SESSION_SECRET, resave: false, saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' }
  }));
  const { JSONDB } = require('./jsondb');
  db = new JSONDB(path.join(dataDir, 'db.json'));
  db.init();
  query = async (text, params) => db.query(text, params);
}

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 15,
  message: { error: 'محاولات كثيرة جداً. حاول بعد 15 دقيقة' },
  standardHeaders: true, legacyHeaders: false
});

function requireAuth(roles) {
  return (req, res, next) => {
    if (!req.session.user) return res.status(401).json({ error: 'غير مصرح' });
    if (roles && !roles.includes(req.session.user.role)) return res.status(403).json({ error: 'ليس لديك صلاحية' });
    next();
  };
}

const ACTION_KEY = { view:'v', add:'a', edit:'e', delete:'d', export:'x' };

function requirePerm(section, action) {
  return (req, res, next) => {
    const user = req.session.user;
    if (!user) return res.status(401).json({ error: 'غير مصرح' });
    const perms = user.permissions || {};
    const sec = perms[section];
    if (!sec) return res.status(403).json({ error: 'ليس لديك صلاحية' });
    const key = ACTION_KEY[action];
    if (!key || !sec[key]) return res.status(403).json({ error: `ليس لديك صلاحية ${action}` });
    next();
  };
}

app.post('/api/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور خطأ' });
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور خطأ' });
    const u = result.rows[0];
    let pwMatch = false;
    if (u.password && (u.password.startsWith('$2a$') || u.password.startsWith('$2b$') || u.password.startsWith('$2y$'))) {
      pwMatch = await bcrypt.compare(password, u.password);
    } else {
      pwMatch = (u.password === password);
      if (pwMatch) {
        try {
          const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
          await query('UPDATE users SET password = $1 WHERE id = $2', [hash, u.id]);
        } catch (e) { /* continue on hash failure */ }
      }
    }
    if (!pwMatch) return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور خطأ' });
    const rpResult = await query("SELECT * FROM role_perms WHERE role = $1", [u.role]);
    const perms = rpResult.rows.length > 0 ? rpResult.rows[0].permissions : {};
    req.session.user = { id: u.id, username: u.username, name: u.name, role: u.role, hospitalId: u.hospital_id, governorate: u.governorate, viewPermission: u.view_permission, permissions: perms };
    res.json({ user: req.session.user });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'غير مصرح' });
  res.json({ user: req.session.user });
});

function requireMaster() {
  return (req, res, next) => {
    if (!req.session.user || req.session.user.id !== 1) return res.status(403).json({ error: 'ليس لديك صلاحية' });
    next();
  };
}

app.get('/api/users', requireAuth(), async (req, res) => {
  const user = req.session.user;
  let rows;
  if (user.id === 1) {
    const result = await query('SELECT * FROM users ORDER BY id');
    rows = result.rows;
  } else if (user.role === 'branch_supervisor') {
    const result = await query("SELECT * FROM users WHERE (role IN ('hospital','hospital_manager') AND governorate = $1) OR id = $2 ORDER BY id", [user.governorate || '', user.id]);
    rows = result.rows;
  } else {
    return res.status(403).json({ error: 'ليس لديك صلاحية' });
  }
  if (Array.isArray(rows)) rows = rows.map(u => { const { password, ...rest } = u; return rest; });
  res.json(rows);
});

app.post('/api/users', requireAuth(), requireMaster(), async (req, res) => {
  const { username, password, name, role, hospitalId, governorate, viewPermission, phone, email } = req.body;
  if (role === 'branch_supervisor' && governorate) {
    const existSup = await query("SELECT id FROM users WHERE role = 'branch_supervisor' AND governorate = $1", [governorate]);
    if (existSup.rows.length > 0) return res.status(400).json({ error: 'يوجد مشرف فرع بالفعل لهذا الفرع' });
  }
  const exist = await query('SELECT id FROM users WHERE username = $1', [username]);
  if (exist.rows.length > 0) return res.status(400).json({ error: 'اسم المستخدم موجود' });
  const result = await query(
    "INSERT INTO users (username, password, name, role, hospital_id, governorate, view_permission, phone, email) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, username, name, role, hospital_id, governorate, view_permission, phone, email",
    [username, password || '123456', name, role, hospitalId || null, governorate || null, viewPermission || 'own', phone || '', email || '']
  );
  res.json(result.rows[0]);
});

app.put('/api/users/:id', requireAuth(), async (req, res) => {
  const user = req.session.user;
  const targetId = parseInt(req.params.id);
  const { password, name, role, hospitalId, governorate, viewPermission, phone, email } = req.body;

  // Master can update anything
  if (user.id === 1) {
    const sets = []; const vals = []; let idx = 1;
    if (phone !== undefined) { sets.push(`phone = $${idx++}`); vals.push(phone); }
    if (email !== undefined) { sets.push(`email = $${idx++}`); vals.push(email); }
    if (name) { sets.push(`name = $${idx++}`); vals.push(name); }
    if (role) { sets.push(`role = $${idx++}`); vals.push(role); }
    if (password) { sets.push(`password = $${idx++}`); vals.push(password); }
    if (hospitalId !== undefined) { sets.push(`hospital_id = $${idx++}`); vals.push(hospitalId); }
    if (governorate !== undefined) { sets.push(`governorate = $${idx++}`); vals.push(governorate); }
    if (viewPermission) { sets.push(`view_permission = $${idx++}`); vals.push(viewPermission); }
    vals.push(targetId);
    const result = await query(`UPDATE users SET ${sets.join(', ')} WHERE id = $${idx} RETURNING id, username, name, role, hospital_id, governorate, view_permission, phone, email`, vals);
    if (result.rows.length === 0) return res.status(404).json({ error: 'غير موجود' });
    return res.json(result.rows[0]);
  }

  // Branch supervisor can update name and password for hospital/hospital_manager in their governorate
  if (user.role === 'branch_supervisor') {
    const target = await query('SELECT * FROM users WHERE id = $1', [targetId]);
    if (target.rows.length === 0) return res.status(404).json({ error: 'غير موجود' });
    const t = target.rows[0];
    if (!['hospital', 'hospital_manager'].includes(t.role)) return res.status(403).json({ error: 'لا يمكن تعديل هذا المستخدم' });
    if (t.governorate !== user.governorate) return res.status(403).json({ error: 'المستخدم ليس في محافظتك' });

    const sets = []; const vals = []; let idx = 1;
    if (name) { sets.push(`name = $${idx++}`); vals.push(name); }
    if (password) { sets.push(`password = $${idx++}`); vals.push(password); }
    if (sets.length === 0) return res.status(400).json({ error: 'لا يوجد بيانات للتحديث' });
    vals.push(targetId);
    const result = await query(`UPDATE users SET ${sets.join(', ')} WHERE id = $${idx} RETURNING id, username, name, role, hospital_id, governorate, view_permission`, vals);
    return res.json(result.rows[0]);
  }

  return res.status(403).json({ error: 'ليس لديك صلاحية' });
});

app.delete('/api/users/:id', requireAuth(), requireMaster(), async (req, res) => {
  await query('DELETE FROM users WHERE id = $1', [parseInt(req.params.id)]);
  res.json({ ok: true });
});

app.get('/api/role-permissions', requireAuth(), requireMaster(), async (req, res) => {
  const rpResult = await query('SELECT * FROM role_perms ORDER BY role');
  res.json(rpResult.rows);
});

app.put('/api/role-permissions', requireAuth(), requireMaster(), async (req, res) => {
  const { role, permissions } = req.body;
  const exist = await query('SELECT * FROM role_perms WHERE role = $1', [role]);
  if (exist.rows.length > 0) {
    await query('UPDATE role_perms SET permissions = $1 WHERE role = $2', [JSON.stringify(permissions), role]);
  } else {
    await query('INSERT INTO role_perms (role, permissions) VALUES ($1, $2)', [role, JSON.stringify(permissions)]);
  }
  // Update current user's session if role matches
  if (req.session.user && req.session.user.role === role) {
    req.session.user.permissions = permissions;
  }
  res.json({ ok: true });
});

app.put('/api/users/:id/password', requireAuth(), async (req, res) => {
  const user = req.session.user;
  const targetId = parseInt(req.params.id);
  const { password } = req.body;
  if (!password || password.length < 4) return res.status(400).json({ error: 'كلمة المرور قصيرة' });

  // Get target user
  const target = await query('SELECT * FROM users WHERE id = $1', [targetId]);
  if (target.rows.length === 0) return res.status(404).json({ error: 'المستخدم غير موجود' });
  const t = target.rows[0];

  // Only admin or branch_supervisor can change passwords
  if (user.id !== 1 && user.role !== 'branch_supervisor') return res.status(403).json({ error: 'ليس لديك صلاحية' });

  // Branch supervisor can only change hospital/hospital_manager in their governorate
  if (user.role === 'branch_supervisor') {
    if (!['hospital', 'hospital_manager'].includes(t.role)) return res.status(403).json({ error: 'لا يمكن تغيير كلمة سر هذا الدور' });
    if (t.governorate !== user.governorate) return res.status(403).json({ error: 'المستخدم ليس في محافظتك' });
  }

  await query('UPDATE users SET password = $1 WHERE id = $2', [password, targetId]);
  res.json({ ok: true, message: 'تم تغيير كلمة المرور بنجاح' });
});

app.get('/api/hospitals', requireAuth(), async (req, res) => {
  const user = req.session.user;
  let sql = 'SELECT * FROM hospitals'; const params = [];
  if (user.role === 'hospital') { sql += ' WHERE id = $1'; params.push(user.hospitalId); }
  else if (user.role === 'branch_supervisor') { sql += ' WHERE governorate = $1'; params.push(user.governorate); }
  else if (user.role === 'visitor' && user.viewPermission === 'limited') { sql += ' WHERE 1=0'; }
  const result = await query(sql, params);
  result.rows.sort((a, b) => {
    if (a.governorate !== b.governorate) {
      const ai = GOV_ORDER.indexOf(a.governorate);
      const bi = GOV_ORDER.indexOf(b.governorate);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    }
    const ha = HOSP_ORDER[a.governorate] || [];
    const hi = ha.indexOf(a.name);
    const hj = ha.indexOf(b.name);
    return (hi === -1 ? 999 : hi) - (hj === -1 ? 999 : hj);
  });
  res.json(result.rows);
});

app.post('/api/hospitals', requireAuth(), requireMaster(), async (req, res) => {
  const { name, governorate, type, code } = req.body;
  const result = await query('INSERT INTO hospitals (name, governorate, type, code) VALUES ($1,$2,$3,$4) RETURNING *', [name, governorate, type || 'تخزيني', code || '']);
  const newHosp = result.rows[0];
  
  // Auto-create hospital user
  const hospUname = 'hosp' + newHosp.id;
  const existHospUser = await query('SELECT id FROM users WHERE username = $1', [hospUname]);
  if (existHospUser.rows.length === 0) {
    await query(
      "INSERT INTO users (username, password, name, role, hospital_id, governorate, view_permission) VALUES ($1,$2,$3,'hospital',$4,$5,'own') RETURNING id",
      [hospUname, '123456', newHosp.name, newHosp.id, newHosp.governorate]
    );
  }
  
  // Auto-create branch_supervisor for this governorate if not exists
  const existingSup = await query("SELECT id FROM users WHERE governorate = $1 AND role = 'branch_supervisor'", [newHosp.governorate]);
  if (existingSup.rows.length === 0) {
    const uname = 'sup_' + newHosp.governorate.replace(/[^a-zA-Z\u0621-\u064A0-9]/g, '_').toLowerCase().replace(/_+/g, '_').replace(/^_|_$/g, '');
    await query(
      "INSERT INTO users (username, password, name, role, governorate, view_permission) VALUES ($1,$2,$3,'branch_supervisor',$4,'governorate')",
      [uname, '123456', 'مشرف ' + newHosp.governorate, newHosp.governorate]
    );
  }
  
  res.json(newHosp);
});

app.put('/api/hospitals/:id', requireAuth(), requireMaster(), async (req, res) => {
  const { name, governorate, type, code } = req.body;
  const result = await query('UPDATE hospitals SET name=$1, governorate=$2, type=$3, code=$4 WHERE id=$5 RETURNING *', [name, governorate, type || 'تخزيني', code || '', parseInt(req.params.id)]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'غير موجود' });
  res.json(result.rows[0]);
});

app.delete('/api/hospitals/:id', requireAuth(), requireMaster(), async (req, res) => {
  const id = parseInt(req.params.id);
  await query("DELETE FROM users WHERE hospital_id = $1 AND role = 'hospital'", [id]);
  await query('DELETE FROM daily_reports WHERE hospital_id = $1', [id]);
  await query('DELETE FROM monthly_big_indicators WHERE hospital_id = $1', [id]);
  await query('DELETE FROM monthly_small_indicators WHERE hospital_id = $1', [id]);
  await query('DELETE FROM monthly_indicators WHERE hospital_id = $1', [id]);
  await query('DELETE FROM hospitals WHERE id = $1', [id]);
  res.json({ ok: true });
});

app.get('/api/governorates', requireAuth(), requirePerm('governorates', 'view'), async (req, res) => {
  const result = await query('SELECT name FROM governorates ORDER BY name');
  const names = result.rows.map(r => r.name);
  names.sort((a, b) => {
    const ai = GOV_ORDER.indexOf(a);
    const bi = GOV_ORDER.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });
  res.json(names);
});

app.post('/api/governorates', requireAuth(), requireMaster(), async (req, res) => {
  const { name } = req.body;
  await query('INSERT INTO governorates (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [name]);
  
  // Auto-create branch_supervisor for this governorate
  const existingSup = await query("SELECT id FROM users WHERE governorate = $1 AND role = 'branch_supervisor'", [name]);
  if (existingSup.rows.length === 0) {
    const uname = 'sup_' + name.replace(/[^a-zA-Z\u0621-\u064A0-9]/g, '_').toLowerCase().replace(/_+/g, '_').replace(/^_|_$/g, '');
    await query(
      "INSERT INTO users (username, password, name, role, governorate, view_permission) VALUES ($1,$2,$3,'branch_supervisor',$4,'governorate')",
      [uname, '123456', 'مشرف ' + name, name]
    );
  }
  
  const result = await query('SELECT name FROM governorates ORDER BY name');
  const names = result.rows.map(r => r.name);
  names.sort((a, b) => {
    const ai = GOV_ORDER.indexOf(a);
    const bi = GOV_ORDER.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });
  res.json(names);
});

app.delete('/api/governorates/:name', requireAuth(), requireMaster(), async (req, res) => {
  await query('DELETE FROM governorates WHERE name = $1', [req.params.name]);
  res.json({ ok: true });
});

// Hospital types
app.get('/api/hospital-types', requireAuth(), async (req, res) => {
  if (isProd) {
    const result = await query('SELECT * FROM hospital_types ORDER BY name', []);
    res.json(result.rows);
  } else {
    if (!db.data.hospital_types || db.data.hospital_types.length === 0) db.data.hospital_types = [{ id: 1, name: 'تجميعي' }, { id: 2, name: 'تخزيني' }];
    res.json(db.data.hospital_types);
  }
});

app.post('/api/hospital-types', requireAuth(), requireMaster(), async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'الاسم مطلوب' });
  if (isProd) {
    const result = await query('INSERT INTO hospital_types (name) VALUES ($1) RETURNING *', [name.trim()]);
    res.json(result.rows[0]);
  } else {
    const id = db.data._counters.hospital_types++;
    const item = { id, name: name.trim() };
    db.data.hospital_types.push(item);
    db._save();
    res.json(item);
  }
});

app.delete('/api/hospital-types/:id', requireAuth(), requireMaster(), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isProd) {
    await query('DELETE FROM hospital_types WHERE id = $1', [id]);
  } else {
    db.data.hospital_types = db.data.hospital_types.filter(t => t.id !== id);
    db._save();
  }
  res.json({ ok: true });
});

async function filterByRole(user, baseSql, params = []) {
  if (user.role === 'admin' || user.role === 'org_supervisor') return { sql: baseSql, params };
  if (user.role === 'branch_supervisor') {
    const result = await query('SELECT id FROM hospitals WHERE governorate = $1', [user.governorate]);
    const ids = result.rows.map(r => r.id);
    if (ids.length === 0) return { sql: baseSql + ' AND 1=0', params };
    const placeholders = ids.map((_, i) => `$${params.length + i + 1}`).join(',');
    return { sql: `${baseSql} AND hospital_id IN (${placeholders})`, params: [...params, ...ids] };
  } else if (user.role === 'hospital') {
    return { sql: baseSql + ` AND hospital_id = $${params.length + 1}`, params: [...params, user.hospitalId] };
  } else if (user.role === 'visitor' && user.viewPermission === 'limited') {
    return { sql: baseSql + ' AND 1=0', params };
  }
  return { sql: baseSql, params };
}

app.get('/api/inventory', requireAuth(), requirePerm('inventory', 'view'), async (req, res) => {
  const result = await query('SELECT * FROM inventory ORDER BY blood_type');
  const inv = {};
  result.rows.forEach(r => { inv[r.blood_type] = { storage: r.storage, totalReceived: r.total_received, totalConsumed: r.total_consumed }; });
  res.json(inv);
});

app.put('/api/inventory', requireAuth(), requirePerm('inventory', 'edit'), async (req, res) => {
  const { bloodType, storage } = req.body;
  await query('UPDATE inventory SET storage = $1 WHERE blood_type = $2', [storage, bloodType]);
  const result = await query('SELECT * FROM inventory ORDER BY blood_type');
  const inv = {};
  result.rows.forEach(r => { inv[r.blood_type] = { storage: r.storage, totalReceived: r.total_received, totalConsumed: r.total_consumed }; });
  res.json(inv);
});

app.post('/api/daily-stock', requireAuth(), requirePerm('daily_total', 'edit'), async (req, res) => {
  const { hospitalId, bloodType, quantity, type } = req.body;
  const user = req.session.user;
  if (user.role === 'hospital' && user.hospitalId !== hospitalId) return res.status(403).json({ error: 'غير مصرح' });
  const result = await query('INSERT INTO daily_stock (hospital_id, blood_type, quantity, type, user_id, user_name) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', [hospitalId, bloodType, quantity, type || 'داخل', user.id, user.name]);
  if (type === 'داخل') await query('UPDATE inventory SET storage = storage + $1, total_received = total_received + $1 WHERE blood_type = $2', [quantity, bloodType]);
  else await query('UPDATE inventory SET storage = GREATEST(0, storage - $1) WHERE blood_type = $2', [quantity, bloodType]);
  res.json(result.rows[0]);
});

app.get('/api/daily-stock', requireAuth(), requirePerm('daily_total', 'view'), async (req, res) => {
  const user = req.session.user;
  let sql = 'SELECT ds.*, h.name as hospital_name FROM daily_stock ds JOIN hospitals h ON h.id = ds.hospital_id WHERE 1=1';
  let params = [];
  const f = await filterByRole(user, sql, params);
  sql = f.sql; params = f.params;
  if (req.query.date) { sql += ` AND ds.date::date = $${params.length + 1}::date`; params.push(req.query.date); }
  if (req.query.hospitalId) { sql += ` AND ds.hospital_id = $${params.length + 1}`; params.push(parseInt(req.query.hospitalId)); }
  if (req.query.bloodType) { sql += ` AND ds.blood_type = $${params.length + 1}`; params.push(req.query.bloodType); }
  sql += ' ORDER BY ds.date DESC LIMIT 200';
  const result = await query(sql, params);
  res.json(result.rows);
});

app.delete('/api/daily-stock/:id', requireAuth(), requirePerm('daily_total', 'edit'), async (req, res) => {
  const row = await query('SELECT * FROM daily_stock WHERE id = $1', [parseInt(req.params.id)]);
  if (row.rows.length === 0) return res.status(404).json({ error: 'غير موجود' });
  const r = row.rows[0];
  if (r.type === 'داخل') await query('UPDATE inventory SET storage = GREATEST(0, storage - $1) WHERE blood_type = $2', [r.quantity, r.blood_type]);
  else await query('UPDATE inventory SET storage = storage + $1 WHERE blood_type = $2', [r.quantity, r.blood_type]);
  await query('DELETE FROM daily_stock WHERE id = $1', [parseInt(req.params.id)]);
  res.json({ ok: true });
});

app.get('/api/daily-stock/total', requireAuth(), requirePerm('daily_total', 'view'), async (req, res) => {
  const user = req.session.user;
  let sql = "SELECT blood_type, type, SUM(quantity) as total FROM daily_stock WHERE 1=1";
  let params = [];
  const f = await filterByRole(user, sql, params);
  sql = f.sql; params = f.params;
  if (req.query.date) { sql += ` AND date::date = $${params.length + 1}::date`; params.push(req.query.date); }
  sql += ' GROUP BY blood_type, type ORDER BY blood_type';
  const result = await query(sql, params);
  const totals = {};
  result.rows.forEach(r => {
    if (!totals[r.blood_type]) totals[r.blood_type] = { bloodType: r.blood_type, داخل: 0, خارج: 0 };
    totals[r.blood_type][r.type] = parseInt(r.total);
  });
  res.json(Object.values(totals));
});

const EMPTY_BLOOD = () => ({ previous: 0, incoming: 0, outgoing: 0, disposal: 0, available: 0 });
const EMPTY_REPORT = () => {
  const bt = {};
  ['A+','A-','B+','B-','AB+','AB-','O+','O-'].forEach(t => bt[t] = EMPTY_BLOOD());
  const pl = {};
  ['A','B','O','AB'].forEach(t => pl[t] = EMPTY_BLOOD());
  return { under_inspection: 0, blood: bt, plasma: pl, platelets: 0, cryo: 0, license_type: 'تخزيني', license_status: '' };
};

const GOV_ORDER = ['بورسعيد', 'الإسماعيلية', 'السويس', 'الأقصر', 'جنوب سيناء', 'أسوان'];
const HOSP_ORDER = {
  'بورسعيد': ['التضامن (مجمع الشفاء)', 'النصر *', 'الحياة بورفؤاد *', 'صحة المرأة', 'الزهور', '٣٠ يونيو', 'السلام'],
  'الإسماعيلية': ['المجمع الطبي *', 'طوارئ ابو خليفه', 'مركز 30 يونيو', 'فايد التخصصي', 'القصاصين التخصصي', 'القنطرة غرب التخصصي', 'القنطرة شرق التخصصي', 'التل الكبيرالتخصصي'],
  'السويس': ['مجمع السويس الطبي *', 'المرأه والطفل ( حوض الدرس )', 'المناظير و الجهاز الهضمي'],
  'الأقصر': ['طيبة التخصصي *', 'المجمع الطبي الاقصر', 'ايزيس التخصصي', 'الاطفال التخصصي', 'الكرنك الدولي *', 'حورس'],
  'جنوب سيناء': ['راس سدر *', 'شرم الشيخ الدولي', 'طابا', 'سانت كاترين', 'مجمع الفيروز *', 'الطور', 'دهب'],
  'أسوان': ['مجمع السويس', 'النيل التخصصي*(حورس ادفو)', 'اسوان التخصصي (الصداقه)', 'كوم امبو *', 'دراو', 'معهد الاورام', 'ابوسمبل الدولي', 'المسلة التخصصي', 'السباعية التخصصي']
};

app.get('/api/daily-reports', requireAuth(), requirePerm('daily_stock', 'view'), async (req, res) => {
  const user = req.session.user;
  let sql = 'SELECT dr.*, h.name as hospital_name, h.governorate, h.type FROM daily_reports dr JOIN hospitals h ON h.id = dr.hospital_id WHERE 1=1';
  let params = [];
  const f = await filterByRole(user, sql, params);
  sql = f.sql; params = f.params;
  if (req.query.date) { sql += ` AND dr.date = $${params.length + 1}`; params.push(req.query.date); }
  if (req.query.hospital_id) { sql += ` AND dr.hospital_id = $${params.length + 1}`; params.push(parseInt(req.query.hospital_id)); }
  const result = await query(sql, params);
  // Keep only latest report per hospital
  const latest = {};
  result.rows.forEach(r => {
    const key = r.hospital_id;
    if (!latest[key] || (r.date + ' ' + (r.time || '')) > (latest[key].date + ' ' + (latest[key].time || ''))) {
      latest[key] = r;
    }
  });
  const deduped = Object.values(latest);
  // Sort by custom governorate and hospital order
  deduped.sort((a, b) => {
    const gi = (GOV_ORDER.indexOf(a.governorate) - GOV_ORDER.indexOf(b.governorate));
    if (gi !== 0) return gi;
    const ha = HOSP_ORDER[a.governorate] || [];
    const hi = ha.indexOf(a.hospital_name) - ha.indexOf(b.hospital_name);
    if (hi !== 0) return hi;
    return (b.date || '').localeCompare(a.date || '');
  });
  res.json(deduped);
});

app.post('/api/daily-reports', requireAuth(), requirePerm('daily_stock', 'edit'), async (req, res) => {
  const { hospitalId, date, time } = req.body;
  const user = req.session.user;
  if (user.role === 'hospital' && user.hospitalId !== hospitalId) return res.status(403).json({ error: 'غير مصرح' });
  const d = date || new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });
  const t = time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Cairo' });
  const def = EMPTY_REPORT();
  const result = await query(
    'INSERT INTO daily_reports (hospital_id, date, time, under_inspection, blood_data, plasma_data, platelets, cryo, license_type, license_status, user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',
    [hospitalId, d, t, def.under_inspection, JSON.stringify(def.blood), JSON.stringify(def.plasma), def.platelets, def.cryo, def.license_type, def.license_status, user.id]
  );
  res.json(result.rows[0]);
});

app.put('/api/daily-reports/:id', requireAuth(), requirePerm('daily_stock', 'edit'), async (req, res) => {
  const { date, time, underInspection, blood, plasma, platelets, cryo, licenseType, licenseStatus, platData, strategicReserve } = req.body;
  const sets = []; const vals = []; let idx = 1;
  if (date !== undefined) { sets.push(`date = $${idx++}`); vals.push(date); }
  if (time !== undefined) { sets.push(`time = $${idx++}`); vals.push(time); }
  if (underInspection !== undefined) { sets.push(`under_inspection = $${idx++}`); vals.push(underInspection); }
  if (blood !== undefined) { sets.push(`blood_data = $${idx++}`); vals.push(JSON.stringify(blood)); }
  if (plasma !== undefined) { sets.push(`plasma_data = $${idx++}`); vals.push(JSON.stringify(plasma)); }
  if (platelets !== undefined) { sets.push(`platelets = $${idx++}`); vals.push(platelets); }
  if (cryo !== undefined) { sets.push(`cryo = $${idx++}`); vals.push(cryo); }
  if (licenseType !== undefined) { sets.push(`license_type = $${idx++}`); vals.push(licenseType); }
  if (licenseStatus !== undefined) { sets.push(`license_status = $${idx++}`); vals.push(licenseStatus); }
  if (platData !== undefined) { sets.push(`plat_data = $${idx++}`); vals.push(JSON.stringify(platData)); }
  if (sets.length === 0) return res.json({ ok: true });
  vals.push(parseInt(req.params.id));
  const result = await query(`UPDATE daily_reports SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`, vals);
  if (result.rows.length === 0) return res.status(404).json({ error: 'غير موجود' });
  res.json(result.rows[0]);
});

// Allow anyone to edit platelets & cryo
app.patch('/api/daily-reports/:id/pc', requireAuth(), async (req, res) => {
  const { platelets, cryo } = req.body;
  const sets = []; const vals = []; let idx = 1;
  if (platelets !== undefined) { sets.push(`platelets = $${idx++}`); vals.push(platelets); }
  if (cryo !== undefined) { sets.push(`cryo = $${idx++}`); vals.push(cryo); }
  if (sets.length === 0) return res.json({ ok: true });
  vals.push(parseInt(req.params.id));
  const result = await query(`UPDATE daily_reports SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`, vals);
  if (result.rows.length === 0) return res.status(404).json({ error: 'غير موجود' });
  res.json(result.rows[0]);
});

app.delete('/api/daily-reports/:id', requireAuth(), requirePerm('daily_stock', 'edit'), async (req, res) => {
  await query('DELETE FROM daily_reports WHERE id = $1', [parseInt(req.params.id)]);
  res.json({ ok: true });
});

app.post('/api/daily-statement', requireAuth(), requirePerm('daily_statement', 'edit'), async (req, res) => {
  const { hospitalId, content, type } = req.body;
  const user = req.session.user;
  if (user.role === 'hospital' && user.hospitalId !== hospitalId) return res.status(403).json({ error: 'غير مصرح' });
  const result = await query('INSERT INTO daily_statements (hospital_id, content, type, user_id, user_name) VALUES ($1,$2,$3,$4,$5) RETURNING *', [hospitalId, content, type || 'بيان', user.id, user.name]);
  res.json(result.rows[0]);
});

app.get('/api/daily-statement', requireAuth(), requirePerm('daily_statement', 'view'), async (req, res) => {
  const user = req.session.user;
  let sql = 'SELECT ds.*, h.name as hospital_name FROM daily_statements ds JOIN hospitals h ON h.id = ds.hospital_id WHERE 1=1';
  let params = [];
  const f = await filterByRole(user, sql, params);
  sql = f.sql; params = f.params;
  if (req.query.date) { sql += ` AND ds.date::date = $${params.length + 1}::date`; params.push(req.query.date); }
  if (req.query.hospitalId) { sql += ` AND ds.hospital_id = $${params.length + 1}`; params.push(parseInt(req.query.hospitalId)); }
  sql += ' ORDER BY ds.date DESC LIMIT 200';
  const result = await query(sql, params);
  res.json(result.rows);
});

app.delete('/api/daily-statement/:id', requireAuth(), requirePerm('daily_statement', 'edit'), async (req, res) => {
  await query('DELETE FROM daily_statements WHERE id = $1', [parseInt(req.params.id)]);
  res.json({ ok: true });
});

app.post('/api/monthly-storage', requireAuth(), requirePerm('monthly_storage', 'edit'), async (req, res) => {
  const { hospitalId, year, month, bloodTypes } = req.body;
  const result = await query('INSERT INTO monthly_storage (hospital_id, year, month, blood_types, user_id) VALUES ($1,$2,$3,$4,$5) RETURNING *', [hospitalId, year, month, JSON.stringify(bloodTypes), req.session.user.id]);
  res.json(result.rows[0]);
});

app.get('/api/monthly-storage', requireAuth(), requirePerm('monthly_storage', 'view'), async (req, res) => {
  const user = req.session.user;
  let sql = 'SELECT ms.*, h.name as hospital_name FROM monthly_storage ms JOIN hospitals h ON h.id = ms.hospital_id WHERE 1=1';
  let params = [];
  const f = await filterByRole(user, sql, params);
  sql = f.sql; params = f.params;
  if (req.query.year) { sql += ` AND ms.year = $${params.length + 1}`; params.push(parseInt(req.query.year)); }
  if (req.query.month) { sql += ` AND ms.month = $${params.length + 1}`; params.push(parseInt(req.query.month)); }
  if (req.query.hospitalId) { sql += ` AND ms.hospital_id = $${params.length + 1}`; params.push(parseInt(req.query.hospitalId)); }
  sql += ' ORDER BY ms.year DESC, ms.month DESC, ms.id DESC';
  const result = await query(sql, params);
  res.json(result.rows);
});

app.delete('/api/monthly-storage/:id', requireAuth(), requirePerm('monthly_storage', 'edit'), async (req, res) => {
  await query('DELETE FROM monthly_storage WHERE id = $1', [parseInt(req.params.id)]);
  res.json({ ok: true });
});

app.post('/api/monthly-aggregate', requireAuth(), requirePerm('monthly_aggregate', 'edit'), async (req, res) => {
  const { hospitalId, year, month, data } = req.body;
  const result = await query('INSERT INTO monthly_aggregate (hospital_id, year, month, data, user_id) VALUES ($1,$2,$3,$4,$5) RETURNING *', [hospitalId, year, month, JSON.stringify(data), req.session.user.id]);
  res.json(result.rows[0]);
});

app.get('/api/monthly-aggregate', requireAuth(), requirePerm('monthly_aggregate', 'view'), async (req, res) => {
  const user = req.session.user;
  let sql = 'SELECT ma.*, h.name as hospital_name FROM monthly_aggregate ma JOIN hospitals h ON h.id = ma.hospital_id WHERE 1=1';
  let params = [];
  const f = await filterByRole(user, sql, params);
  sql = f.sql; params = f.params;
  if (req.query.year) { sql += ` AND ma.year = $${params.length + 1}`; params.push(parseInt(req.query.year)); }
  if (req.query.month) { sql += ` AND ma.month = $${params.length + 1}`; params.push(parseInt(req.query.month)); }
  sql += ' ORDER BY ma.year DESC, ma.month DESC, ma.id DESC';
  const result = await query(sql, params);
  res.json(result.rows);
});

app.delete('/api/monthly-aggregate/:id', requireAuth(), requirePerm('monthly_aggregate', 'edit'), async (req, res) => {
  await query('DELETE FROM monthly_aggregate WHERE id = $1', [parseInt(req.params.id)]);
  res.json({ ok: true });
});

app.post('/api/monthly-indicators', requireAuth(), requirePerm('monthly_indicators', 'edit'), async (req, res) => {
  const { hospitalId, year, month, data, day, time } = req.body;
  const d = data || {};
  const result = await query('INSERT INTO monthly_indicators (hospital_id, year, month, day, time, data, user_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
    [hospitalId, year, month, day || d.day || '', time || d.time || '', JSON.stringify(d), req.session.user.id]);
  res.json(result.rows[0]);
});

app.get('/api/monthly-indicators', requireAuth(), requirePerm('monthly_indicators', 'view'), async (req, res) => {
  const user = req.session.user;
  // Auto-archive on 25th of each month only
  const now = new Date();
  if (now.getDate() >= 25) {
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;
    let cutoffMonth = curMonth - 1;
    let cutoffYear = curYear;
    if (cutoffMonth === 0) { cutoffMonth = 12; cutoffYear--; }
    const all = await query('SELECT mi.*, h.name as hospital_name, h.governorate FROM monthly_indicators mi JOIN hospitals h ON h.id = mi.hospital_id');
    const toArchive = all.rows.filter(r => r.year < cutoffYear || (r.year === cutoffYear && r.month < cutoffMonth));
    if (toArchive.length > 0) {
      const todayStr = new Date().toISOString().slice(0,10);
      const title = 'مؤشرات الأداء - أرشيف تلقائي ' + todayStr;
      const existingArch = await query('SELECT id, data FROM archives WHERE type = $1 AND title = $2', ['مؤشرات الأداء', title]);
      if (existingArch.rows.length > 0) {
        const oldData = JSON.parse(existingArch.rows[0].data) || [];
        await query('UPDATE archives SET data = $1 WHERE id = $2', [JSON.stringify([...oldData, ...toArchive]), existingArch.rows[0].id]);
      } else {
        await query('INSERT INTO archives (type, title, data, user_id, user_name) VALUES ($1,$2,$3,$4,$5)',
          ['مؤشرات الأداء', title, JSON.stringify(toArchive), user.id, user.name]);
      }
      for (const r of toArchive) {
        await query('DELETE FROM monthly_indicators WHERE id = $1', [r.id]);
      }
    }
  }
  let sql = 'SELECT mi.*, h.name as hospital_name FROM monthly_indicators mi JOIN hospitals h ON h.id = mi.hospital_id WHERE 1=1';
  let params = [];
  const f = await filterByRole(user, sql, params);
  sql = f.sql; params = f.params;
  if (req.query.year) { sql += ` AND mi.year = $${params.length + 1}`; params.push(parseInt(req.query.year)); }
  if (req.query.month) { sql += ` AND mi.month = $${params.length + 1}`; params.push(parseInt(req.query.month)); }
  sql += ' ORDER BY mi.year DESC, mi.month DESC, mi.id DESC';
  const result = await query(sql, params);
  res.json(result.rows);
});

app.put('/api/monthly-indicators/:id', requireAuth(), requirePerm('monthly_indicators', 'edit'), async (req, res) => {
  const { data, day, time } = req.body;
  await query('UPDATE monthly_indicators SET data = $1, day = $2, time = $3 WHERE id = $4',
    [JSON.stringify(data || {}), day || '', time || '', parseInt(req.params.id)]);
  const result = await query('SELECT mi.id, mi.hospital_id, mi.year, mi.month, mi.day, mi.time, mi.data, mi.date, mi.user_id, h.name as hospital_name, h.governorate FROM monthly_indicators mi JOIN hospitals h ON mi.hospital_id = h.id WHERE mi.id = $1', [parseInt(req.params.id)]);
  res.json(result.rows[0]);
});

app.delete('/api/monthly-indicators/:id', requireAuth(), requirePerm('monthly_indicators', 'edit'), async (req, res) => {
  await query('DELETE FROM monthly_indicators WHERE id = $1', [parseInt(req.params.id)]);
  res.json({ ok: true });
});

app.post('/api/monthly-indicators/archive', requireAuth(), requirePerm('monthly_indicators', 'delete'), async (req, res) => {
  const records = await query('SELECT mi.*, h.name as hospital_name, h.governorate FROM monthly_indicators mi JOIN hospitals h ON h.id = mi.hospital_id');
  if (records.rows.length === 0) return res.json({ ok: true, message: 'لا توجد بيانات للأرشفة' });
  const title = 'مؤشرات الأداء - ' + new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  await query('INSERT INTO archives (type, title, data, user_id, user_name) VALUES ($1,$2,$3,$4,$5)',
    ['مؤشرات الأداء', title, JSON.stringify(records.rows), req.session.user.id, req.session.user.name]);
  await query('DELETE FROM monthly_indicators');
  res.json({ ok: true, message: 'تم أرشفة ' + records.rows.length + ' سجل' });
});

app.post('/api/monthly-indicators/archive-direct', requireAuth(), async (req, res) => {
  if (req.session.user.role !== 'admin') return res.status(403).json({ error: 'غير مصرح - فقط المدير' });
  const { hospitalId, year, month, data, day, time } = req.body;
  if (!hospitalId || !year || !data) return res.status(400).json({ error: 'البيانات غير مكتملة' });
  const period = req.body.period || 'monthly';
  const title = 'مؤشرات الأداء - أرشيف ' + year + (period === 'yearly' ? '/سنوي' : period === 'h1' ? '/نصف أول' : period === 'h2' ? '/نصف ثاني' : '/' + month);
  const existing = await query('SELECT id, data FROM archives WHERE type = $1 AND title = $2', ['مؤشرات الأداء', title]);
  const hosp = await query('SELECT name, governorate FROM hospitals WHERE id = $1', [hospitalId]);
  const record = { hospital_id: hospitalId, hospital_name: hosp.rows[0]?.name || '', governorate: hosp.rows[0]?.governorate || '', year, month, period, data: JSON.stringify(data), day: day || '', time: time || '', user_id: req.session.user.id };
  if (existing.rows.length > 0) {
    const archData = JSON.parse(existing.rows[0].data);
    const idx = archData.findIndex(r => r.hospital_id === hospitalId && r.year === year && (r.month === month || r.period === period));
    if (idx >= 0) archData[idx] = record; else archData.push(record);
    await query('UPDATE archives SET data = $1 WHERE id = $2', [JSON.stringify(archData), existing.rows[0].id]);
  } else {
    await query('INSERT INTO archives (type, title, data, user_id, user_name) VALUES ($1,$2,$3,$4,$5)',
      ['مؤشرات الأداء', title, JSON.stringify([record]), req.session.user.id, req.session.user.name]);
  }
  res.json({ ok: true, message: 'تم حفظ البيانات في الأرشيف' });
});

app.post('/api/monthly-consumption', requireAuth(), requirePerm('monthly_consumption', 'edit'), async (req, res) => {
  const { hospitalId, year, month, bloodTypes } = req.body;
  const user = req.session.user;
  if (user.role === 'hospital' && user.hospitalId !== hospitalId) return res.status(403).json({ error: 'غير مصرح' });
  const existing = await query('SELECT id FROM monthly_consumption WHERE hospital_id = $1 AND year = $2 AND month = $3', [hospitalId, year, month]);
  let result;
  if (existing.rows.length > 0) {
    result = await query('UPDATE monthly_consumption SET blood_types = $1, user_id = $2 WHERE id = $3 RETURNING *',
      [JSON.stringify(bloodTypes), user.id, existing.rows[0].id]);
  } else {
    result = await query('INSERT INTO monthly_consumption (hospital_id, year, month, blood_types, user_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [hospitalId, year, month, JSON.stringify(bloodTypes), user.id]);
  }
  const full = await query('SELECT mc.*, h.name as hospital_name, h.governorate FROM monthly_consumption mc JOIN hospitals h ON h.id = mc.hospital_id WHERE mc.id = $1', [result.rows[0].id]);
  res.json(full.rows[0]);
});

app.get('/api/monthly-consumption', requireAuth(), requirePerm('monthly_consumption', 'view'), async (req, res) => {
  const user = req.session.user;
  // Auto-archive: keep current month + previous month visible, archive older
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;
  // Cutoff = previous month (keep current + previous visible)
  let cutoffMonth = curMonth - 1;
  let cutoffYear = curYear;
  if (cutoffMonth === 0) { cutoffMonth = 12; cutoffYear--; }
  const all = await query('SELECT mc.*, h.name as hospital_name, h.governorate FROM monthly_consumption mc JOIN hospitals h ON h.id = mc.hospital_id');
  const toArchive = all.rows.filter(r => r.year < cutoffYear || (r.year === cutoffYear && r.month < cutoffMonth));
  if (toArchive.length > 0) {
    const todayStr = new Date().toISOString().slice(0,10);
    const title = 'منصرف فصائل الدم - أرشيف تلقائي ' + todayStr;
    // Merge with existing archive entry for today if any
    const existingArch = await query('SELECT id, data FROM archives WHERE type = $1 AND title = $2', ['منصرف فصائل الدم', title]);
    if (existingArch.rows.length > 0) {
      const oldData = JSON.parse(existingArch.rows[0].data) || [];
      await query('UPDATE archives SET data = $1 WHERE id = $2', [JSON.stringify([...oldData, ...toArchive]), existingArch.rows[0].id]);
    } else {
      await query('INSERT INTO archives (type, title, data, user_id, user_name) VALUES ($1,$2,$3,$4,$5)',
        ['منصرف فصائل الدم', title, JSON.stringify(toArchive), user.id, user.name]);
    }
    for (const r of toArchive) {
      await query('DELETE FROM monthly_consumption WHERE id = $1', [r.id]);
    }
  }
  let sql = 'SELECT mc.*, h.name as hospital_name, h.governorate FROM monthly_consumption mc JOIN hospitals h ON h.id = mc.hospital_id WHERE 1=1';
  let params = [];
  const f = await filterByRole(user, sql, params);
  sql = f.sql; params = f.params;
  if (req.query.year) { sql += ` AND mc.year = $${params.length + 1}`; params.push(parseInt(req.query.year)); }
  if (req.query.month) { sql += ` AND mc.month = $${params.length + 1}`; params.push(parseInt(req.query.month)); }
  sql += ' ORDER BY h.governorate, h.name, mc.month';
  const result = await query(sql, params);
  res.json(result.rows);
});

app.put('/api/monthly-consumption/:id', requireAuth(), requirePerm('monthly_consumption', 'edit'), async (req, res) => {
  const { bloodTypes } = req.body;
  const sets = []; const vals = []; let idx = 1;
  if (bloodTypes !== undefined) { sets.push(`blood_types = $${idx++}`); vals.push(JSON.stringify(bloodTypes)); }
  if (sets.length === 0) return res.json({ ok: true });
  vals.push(parseInt(req.params.id));
  await query(`UPDATE monthly_consumption SET ${sets.join(', ')} WHERE id = $${idx}`, vals);
  const result = await query('SELECT mc.*, h.name as hospital_name, h.governorate FROM monthly_consumption mc JOIN hospitals h ON h.id = mc.hospital_id WHERE mc.id = $1', [parseInt(req.params.id)]);
  res.json(result.rows[0]);
});

app.delete('/api/monthly-consumption/:id', requireAuth(), requirePerm('monthly_consumption', 'edit'), async (req, res) => {
  await query('DELETE FROM monthly_consumption WHERE id = $1', [parseInt(req.params.id)]);
  res.json({ ok: true });
});

app.post('/api/monthly-consumption/archive', requireAuth(), requirePerm('monthly_consumption', 'delete'), async (req, res) => {
  const records = await query('SELECT mc.*, h.name as hospital_name, h.governorate FROM monthly_consumption mc JOIN hospitals h ON h.id = mc.hospital_id');
  if (records.rows.length === 0) return res.json({ ok: true, message: 'لا توجد بيانات للأرشفة' });
  const title = 'منصرف فصائل الدم - ' + new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  await query('INSERT INTO archives (type, title, data, user_id, user_name) VALUES ($1,$2,$3,$4,$5)',
    ['منصرف فصائل الدم', title, JSON.stringify(records.rows), req.session.user.id, req.session.user.name]);
  await query('DELETE FROM monthly_consumption');
  res.json({ ok: true, message: 'تم أرشفة ' + records.rows.length + ' سجل' });
});

app.post('/api/monthly-consumption/archive-direct', requireAuth(), requirePerm('consumption', 'add'), async (req, res) => {
  const { hospitalId, year, month, period, bloodTypes } = req.body;
  if (!hospitalId || !year || !bloodTypes) return res.status(400).json({ error: 'البيانات غير مكتملة' });
  const p = period || 'monthly';
  const title = 'منصرف فصائل الدم - أرشيف ' + year + (p === 'yearly' ? '/سنوي' : p === 'h1' ? '/نصف أول' : p === 'h2' ? '/نصف ثاني' : '/' + month);
  const existing = await query('SELECT id, data FROM archives WHERE type = $1 AND title = $2', ['منصرف فصائل الدم', title]);
  const hosp = await query('SELECT name, governorate FROM hospitals WHERE id = $1', [hospitalId]);
  const record = { hospital_id: hospitalId, hospital_name: hosp.rows[0]?.name || '', governorate: hosp.rows[0]?.governorate || '', year, month, period: p, blood_types: bloodTypes, user_id: req.session.user.id };
  if (existing.rows.length > 0) {
    const data = JSON.parse(existing.rows[0].data);
    const idx = data.findIndex(r => r.hospital_id === hospitalId && r.year === year && (r.month === month || r.period === p));
    if (idx >= 0) data[idx] = record; else data.push(record);
    await query('UPDATE archives SET data = $1 WHERE id = $2', [JSON.stringify(data), existing.rows[0].id]);
  } else {
    await query('INSERT INTO archives (type, title, data, user_id, user_name) VALUES ($1,$2,$3,$4,$5)',
      ['منصرف فصائل الدم', title, JSON.stringify([record]), req.session.user.id, req.session.user.name]);
  }
  res.json({ ok: true });
});

// ============== Monthly Big Indicators (تجميعي) ==============
const BIG_INDICATOR_TABLE = 'monthly_big_indicators';
app.post('/api/monthly-big-indicators', requireAuth(), requirePerm('monthly_big', 'edit'), async (req, res) => {
  const { hospitalId, year, month, data } = req.body;
  const user = req.session.user;
  if (user.role === 'hospital' && user.hospitalId !== hospitalId) return res.status(403).json({ error: 'غير مصرح' });
  const existing = await query(`SELECT id FROM ${BIG_INDICATOR_TABLE} WHERE hospital_id = $1 AND year = $2 AND month = $3`, [hospitalId, year, month]);
  let result;
  if (existing.rows.length > 0) {
    result = await query(`UPDATE ${BIG_INDICATOR_TABLE} SET data = $1, user_id = $2 WHERE id = $3 RETURNING *`,
      [JSON.stringify(data), user.id, existing.rows[0].id]);
  } else {
    result = await query(`INSERT INTO ${BIG_INDICATOR_TABLE} (hospital_id, year, month, data, user_id) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [hospitalId, year, month, JSON.stringify(data), user.id]);
  }
  const full = await query(`SELECT mi.*, h.name as hospital_name, h.governorate FROM ${BIG_INDICATOR_TABLE} mi JOIN hospitals h ON h.id = mi.hospital_id WHERE mi.id = $1`, [result.rows[0].id]);
  res.json(full.rows[0]);
});

app.get('/api/monthly-big-indicators', requireAuth(), requirePerm('monthly_big', 'view'), async (req, res) => {
  const user = req.session.user;
  let sql = `SELECT mi.*, h.name as hospital_name, h.governorate FROM ${BIG_INDICATOR_TABLE} mi JOIN hospitals h ON h.id = mi.hospital_id WHERE 1=1`;
  let params = [];
  const f = await filterByRole(user, sql, params);
  sql = f.sql; params = f.params;
  if (req.query.year) { sql += ` AND mi.year = $${params.length + 1}`; params.push(parseInt(req.query.year)); }
  if (req.query.month) { sql += ` AND mi.month = $${params.length + 1}`; params.push(parseInt(req.query.month)); }
  if (req.query.hospitalId) { sql += ` AND mi.hospital_id = $${params.length + 1}`; params.push(parseInt(req.query.hospitalId)); }
  sql += ' ORDER BY h.governorate, h.name, mi.month';
  const result = await query(sql, params);
  res.json(result.rows);
});

app.put('/api/monthly-big-indicators/:id', requireAuth(), requirePerm('monthly_big', 'edit'), async (req, res) => {
  const { data } = req.body;
  await query(`UPDATE ${BIG_INDICATOR_TABLE} SET data = $1 WHERE id = $2`, [JSON.stringify(data), parseInt(req.params.id)]);
  const result = await query(`SELECT mi.*, h.name as hospital_name, h.governorate FROM ${BIG_INDICATOR_TABLE} mi JOIN hospitals h ON h.id = mi.hospital_id WHERE mi.id = $1`, [parseInt(req.params.id)]);
  res.json(result.rows[0]);
});

app.delete('/api/monthly-big-indicators/:id', requireAuth(), requirePerm('monthly_big', 'edit'), async (req, res) => {
  await query(`DELETE FROM ${BIG_INDICATOR_TABLE} WHERE id = $1`, [parseInt(req.params.id)]);
  res.json({ ok: true });
});

app.post('/api/monthly-big-indicators/archive', requireAuth(), requirePerm('monthly_big', 'delete'), async (req, res) => {
  const records = await query(`SELECT mi.*, h.name as hospital_name, h.governorate FROM ${BIG_INDICATOR_TABLE} mi JOIN hospitals h ON h.id = mi.hospital_id`);
  if (records.rows.length === 0) return res.json({ ok: true, message: 'لا توجد بيانات للأرشفة' });
  const title = 'مؤشرات تجميعيه - ' + new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  await query('INSERT INTO archives (type, title, data, user_id, user_name) VALUES ($1,$2,$3,$4,$5)',
    ['مؤشرات تجميعيه', title, JSON.stringify(records.rows), req.session.user.id, req.session.user.name]);
  await query(`DELETE FROM ${BIG_INDICATOR_TABLE}`);
  res.json({ ok: true, message: 'تم أرشفة ' + records.rows.length + ' سجل' });
});

app.post('/api/monthly-big-indicators/archive-direct', requireAuth(), requirePerm('monthly_big', 'add'), async (req, res) => {
  const { hospitalId, year, month, period, data } = req.body;
  if (!hospitalId || !year || !data) return res.status(400).json({ error: 'البيانات غير مكتملة' });
  const p = period || 'monthly';
  const title = 'مؤشرات تجميعيه - أرشيف ' + year + (p === 'yearly' ? '/سنوي' : p === 'h1' ? '/نصف أول' : p === 'h2' ? '/نصف ثاني' : '/' + month);
  const existing = await query('SELECT id, data FROM archives WHERE type = $1 AND title = $2', ['مؤشرات تجميعيه', title]);
  const hosp = await query('SELECT name, governorate FROM hospitals WHERE id = $1', [hospitalId]);
  const record = { hospital_id: hospitalId, hospital_name: hosp.rows[0]?.name || '', governorate: hosp.rows[0]?.governorate || '', year, month, period: p, data, user_id: req.session.user.id };
  if (existing.rows.length > 0) {
    const oldData = JSON.parse(existing.rows[0].data) || [];
    const idx = oldData.findIndex(r => r.hospital_id === hospitalId && r.year === year && (r.month === month || r.period === p));
    if (idx >= 0) oldData[idx] = record; else oldData.push(record);
    await query('UPDATE archives SET data = $1 WHERE id = $2', [JSON.stringify(oldData), existing.rows[0].id]);
  } else {
    await query('INSERT INTO archives (type, title, data, user_id, user_name) VALUES ($1,$2,$3,$4,$5)',
      ['مؤشرات تجميعيه', title, JSON.stringify([record]), req.session.user.id, req.session.user.name]);
  }
  res.json({ ok: true });
});

// ============== Monthly Small Indicators (تخزيني) ==============
const SMALL_INDICATOR_TABLE = 'monthly_small_indicators';
app.post('/api/monthly-small-indicators', requireAuth(), requirePerm('monthly_small', 'edit'), async (req, res) => {
  const { hospitalId, year, month, data } = req.body;
  const user = req.session.user;
  if (user.role === 'hospital' && user.hospitalId !== hospitalId) return res.status(403).json({ error: 'غير مصرح' });
  const existing = await query(`SELECT id FROM ${SMALL_INDICATOR_TABLE} WHERE hospital_id = $1 AND year = $2 AND month = $3`, [hospitalId, year, month]);
  let result;
  if (existing.rows.length > 0) {
    result = await query(`UPDATE ${SMALL_INDICATOR_TABLE} SET data = $1, user_id = $2 WHERE id = $3 RETURNING *`,
      [JSON.stringify(data), user.id, existing.rows[0].id]);
  } else {
    result = await query(`INSERT INTO ${SMALL_INDICATOR_TABLE} (hospital_id, year, month, data, user_id) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [hospitalId, year, month, JSON.stringify(data), user.id]);
  }
  const full = await query(`SELECT mi.*, h.name as hospital_name, h.governorate FROM ${SMALL_INDICATOR_TABLE} mi JOIN hospitals h ON h.id = mi.hospital_id WHERE mi.id = $1`, [result.rows[0].id]);
  res.json(full.rows[0]);
});

app.get('/api/monthly-small-indicators', requireAuth(), requirePerm('monthly_small', 'view'), async (req, res) => {
  const user = req.session.user;
  let sql = `SELECT mi.*, h.name as hospital_name, h.governorate FROM ${SMALL_INDICATOR_TABLE} mi JOIN hospitals h ON h.id = mi.hospital_id WHERE 1=1`;
  let params = [];
  const f = await filterByRole(user, sql, params);
  sql = f.sql; params = f.params;
  if (req.query.year) { sql += ` AND mi.year = $${params.length + 1}`; params.push(parseInt(req.query.year)); }
  if (req.query.month) { sql += ` AND mi.month = $${params.length + 1}`; params.push(parseInt(req.query.month)); }
  if (req.query.hospitalId) { sql += ` AND mi.hospital_id = $${params.length + 1}`; params.push(parseInt(req.query.hospitalId)); }
  sql += ' ORDER BY h.governorate, h.name, mi.month';
  const result = await query(sql, params);
  res.json(result.rows);
});

app.put('/api/monthly-small-indicators/:id', requireAuth(), requirePerm('monthly_small', 'edit'), async (req, res) => {
  const { data } = req.body;
  await query(`UPDATE ${SMALL_INDICATOR_TABLE} SET data = $1 WHERE id = $2`, [JSON.stringify(data), parseInt(req.params.id)]);
  const result = await query(`SELECT mi.*, h.name as hospital_name, h.governorate FROM ${SMALL_INDICATOR_TABLE} mi JOIN hospitals h ON h.id = mi.hospital_id WHERE mi.id = $1`, [parseInt(req.params.id)]);
  res.json(result.rows[0]);
});

app.delete('/api/monthly-small-indicators/:id', requireAuth(), requirePerm('monthly_small', 'edit'), async (req, res) => {
  await query(`DELETE FROM ${SMALL_INDICATOR_TABLE} WHERE id = $1`, [parseInt(req.params.id)]);
  res.json({ ok: true });
});

app.post('/api/monthly-small-indicators/archive', requireAuth(), requirePerm('monthly_small', 'delete'), async (req, res) => {
  const records = await query(`SELECT mi.*, h.name as hospital_name, h.governorate FROM ${SMALL_INDICATOR_TABLE} mi JOIN hospitals h ON h.id = mi.hospital_id`);
  if (records.rows.length === 0) return res.json({ ok: true, message: 'لا توجد بيانات للأرشفة' });
  const title = 'مؤشرات تخزينيه - ' + new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  await query('INSERT INTO archives (type, title, data, user_id, user_name) VALUES ($1,$2,$3,$4,$5)',
    ['مؤشرات تخزينيه', title, JSON.stringify(records.rows), req.session.user.id, req.session.user.name]);
  await query(`DELETE FROM ${SMALL_INDICATOR_TABLE}`);
  res.json({ ok: true, message: 'تم أرشفة ' + records.rows.length + ' سجل' });
});

app.post('/api/monthly-small-indicators/archive-direct', requireAuth(), requirePerm('monthly_small', 'add'), async (req, res) => {
  const { hospitalId, year, month, period, data } = req.body;
  if (!hospitalId || !year || !data) return res.status(400).json({ error: 'البيانات غير مكتملة' });
  const p = period || 'monthly';
  const title = 'مؤشرات تخزينيه - أرشيف ' + year + (p === 'yearly' ? '/سنوي' : p === 'h1' ? '/نصف أول' : p === 'h2' ? '/نصف ثاني' : '/' + month);
  const existing = await query('SELECT id, data FROM archives WHERE type = $1 AND title = $2', ['مؤشرات تخزينيه', title]);
  const hosp = await query('SELECT name, governorate FROM hospitals WHERE id = $1', [hospitalId]);
  const record = { hospital_id: hospitalId, hospital_name: hosp.rows[0]?.name || '', governorate: hosp.rows[0]?.governorate || '', year, month, period: p, data, user_id: req.session.user.id };
  if (existing.rows.length > 0) {
    const oldData = JSON.parse(existing.rows[0].data) || [];
    const idx = oldData.findIndex(r => r.hospital_id === hospitalId && r.year === year && (r.month === month || r.period === p));
    if (idx >= 0) oldData[idx] = record; else oldData.push(record);
    await query('UPDATE archives SET data = $1 WHERE id = $2', [JSON.stringify(oldData), existing.rows[0].id]);
  } else {
    await query('INSERT INTO archives (type, title, data, user_id, user_name) VALUES ($1,$2,$3,$4,$5)',
      ['مؤشرات تخزينيه', title, JSON.stringify([record]), req.session.user.id, req.session.user.name]);
  }
  res.json({ ok: true });
});

app.post('/api/consumption', requireAuth(), requirePerm('consumption', 'edit'), async (req, res) => {
  const { hospitalId, year, month, bloodType, quantity } = req.body;
  const result = await query('INSERT INTO consumption (hospital_id, year, month, blood_type, quantity, user_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', [hospitalId, year, month, bloodType, quantity, req.session.user.id]);
  await query('UPDATE inventory SET total_consumed = total_consumed + $1 WHERE blood_type = $2', [quantity, bloodType]);
  res.json(result.rows[0]);
});

app.get('/api/consumption', requireAuth(), requirePerm('consumption', 'view'), async (req, res) => {
  const user = req.session.user;
  let sql = 'SELECT c.*, h.name as hospital_name FROM consumption c JOIN hospitals h ON h.id = c.hospital_id WHERE 1=1';
  let params = [];
  const f = await filterByRole(user, sql, params);
  sql = f.sql; params = f.params;
  if (req.query.year) { sql += ` AND c.year = $${params.length + 1}`; params.push(parseInt(req.query.year)); }
  if (req.query.month) { sql += ` AND c.month = $${params.length + 1}`; params.push(parseInt(req.query.month)); }
  if (req.query.bloodType) { sql += ` AND c.blood_type = $${params.length + 1}`; params.push(req.query.bloodType); }
  sql += ' ORDER BY c.id DESC LIMIT 200';
  const result = await query(sql, params);
  res.json(result.rows);
});

app.delete('/api/consumption/:id', requireAuth(), requirePerm('consumption', 'edit'), async (req, res) => {
  await query('DELETE FROM consumption WHERE id = $1', [parseInt(req.params.id)]);
  res.json({ ok: true });
});

app.get('/api/archive', requireAuth(), requirePerm('archive', 'view'), async (req, res) => {
  const user = req.session.user;
  let sql = 'SELECT * FROM archives WHERE 1=1'; const params = [];
  if (user.role !== 'admin' && user.role !== 'org_supervisor') { sql += ' AND user_id = $1'; params.push(user.id); }
  if (req.query.from) { sql += ` AND date >= $${params.length + 1}`; params.push(req.query.from); }
  if (req.query.to) { sql += ` AND date <= $${params.length + 1}`; params.push(req.query.to); }
  if (req.query.type) { sql += ` AND type = $${params.length + 1}`; params.push(req.query.type); }
  sql += ' ORDER BY date DESC LIMIT 200';
  const result = await query(sql, params);
  res.json(result.rows);
});

app.post('/api/archive', requireAuth(), requirePerm('archive', 'edit'), async (req, res) => {
  const { type, title, data } = req.body;
  const result = await query('INSERT INTO archives (type, title, data, user_id, user_name) VALUES ($1,$2,$3,$4,$5) RETURNING *', [type, title, JSON.stringify(data), req.session.user.id, req.session.user.name]);
  res.json(result.rows[0]);
});

app.put('/api/archive/:id', requireAuth(), async (req, res) => {
  if (req.session.user.role !== 'admin') return res.status(403).json({ error: 'غير مصرح - فقط المدير' });
  const { data } = req.body;
  if (data) await query('UPDATE archives SET data = $1 WHERE id = $2', [JSON.stringify(data), parseInt(req.params.id)]);
  res.json({ ok: true });
});

app.delete('/api/archive/:id', requireAuth(), async (req, res) => {
  if (req.session.user.role !== 'admin') return res.status(403).json({ error: 'غير مصرح - فقط المدير' });
  await query('DELETE FROM archives WHERE id = $1', [parseInt(req.params.id)]);
  res.json({ ok: true });
});

// ============== Strategic Reserve Calculation ==============

function ensureStrategicTable() {
  if (!db.data.strategic_reserves) db.data.strategic_reserves = [];
  if (!db.data.strategic_settings) db.data.strategic_settings = null;
}

app.get('/api/strategic-reserves', requireAuth(), requirePerm('strategic_stock', 'view'), async (req, res) => {
  ensureStrategicTable();
  const settings = db.data.strategic_settings;
  const reserves = db.data.strategic_reserves || [];
  res.json({ settings, reserves });
});

app.post('/api/calculate-strategic', requireAuth(), requirePerm('strategic_stock', 'edit'), async (req, res) => {
  ensureStrategicTable();
  const { formula, holidayDays } = req.body;
  if (!formula || !holidayDays || holidayDays < 0) return res.status(400).json({ error: 'بيانات غير صالحة' });

  const BTYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

  // Last calendar quarter
  const now = new Date();
  const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 3, 1);
  const qEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 0);
  const quarterDays = Math.round((qEnd - qStart) / (1000*60*60*24)) + 1;

  // Get months in quarter
  const qMonths = [];
  for (let m = qStart.getMonth() + 1; m <= qEnd.getMonth() + 1; m++) qMonths.push(m);
  const qYear = qStart.getFullYear();

  // Try monthly_consumption first, fallback to archives
  let monthlyRows = [];
  const mcResult = await query('SELECT * FROM monthly_consumption WHERE year = $1 AND month IN (' + qMonths.map((_,i) => '$' + (i+2)).join(',') + ')', [qYear, ...qMonths]);
  monthlyRows = mcResult.rows || [];

  // If not enough data, try archives
  if (monthlyRows.length < 5) {
    const archResult = await query("SELECT * FROM archives WHERE type = 'منصرف فصائل الدم'", []);
    const archRows = archResult.rows || [];
    archRows.forEach(a => {
      const archData = typeof a.data === 'string' ? JSON.parse(a.data) : (a.data || []);
      (archData || []).forEach(rec => {
        if (rec.year === qYear && qMonths.includes(rec.month)) {
          monthlyRows.push({ hospital_id: rec.hospital_id, year: rec.year, month: rec.month, blood_types: rec.blood_types });
        }
      });
    });
  }

  function parseBT(v) {
    if (!v) return {};
    if (typeof v === 'object' && !Array.isArray(v)) return v;
    try { return JSON.parse(v); } catch { return {}; }
  }

  // Aggregate monthly consumption by hospital
  const hospitalTotals = {};
  monthlyRows.forEach(r => {
    const hid = r.hospital_id;
    if (!hospitalTotals[hid]) hospitalTotals[hid] = {};
    const bt = parseBT(r.blood_types);
    BTYPES.forEach(t => {
      hospitalTotals[hid][t] = (hospitalTotals[hid][t] || 0) + (bt[t] || 0);
    });
  });

  const allHospitals = await query('SELECT id, name, governorate FROM hospitals', []);
  const results = [];
  allHospitals.rows.forEach(h => {
    const hid = h.id;
    const totals = hospitalTotals[hid] || {};
    const values = {};
    BTYPES.forEach(t => {
      const totalOut = totals[t] || 0;
      const avg = totalOut / quarterDays;
      let sr;
      const pct = avg * 0.2;
      if (formula == 1) sr = Math.round((avg + pct) * holidayDays);
      else sr = Math.round(avg + pct * holidayDays);
      values[t] = sr;
    });
    results.push({ hospital_id: hid, hospital_name: h.name, governorate: h.governorate, values, formula, holidayDays });
  });

  db.data.strategic_settings = { formula, holidayDays, calculated_at: new Date().toISOString(), quarter: `${qStart.toISOString().split('T')[0]} / ${qEnd.toISOString().split('T')[0]}` };
  db.data.strategic_reserves = results;
  db._save();

  res.json({ ok: true, settings: db.data.strategic_settings, reserves: results });
});

// ============== Employee Statements (بيان العاملين) CRUD ==============

const EMPLOYEE_FILE = process.env.EMPLOYEE_FILE || path.join(dataDir, 'بيان العاملين ببنوك دم الهيئة.xlsx');

function ensureEmpTable() {
  if (!db.data.employee_statements) db.data.employee_statements = [];
}

app.get('/api/employee-statements', requireAuth(), requirePerm('employees', 'view'), async (req, res) => {
  ensureEmpTable();
  let rows = [...db.data.employee_statements];
  const user = req.session.user;
  // Hospital managers see only their own employees
  if (user.role === 'hospital') {
    rows = rows.filter(r => r.hospital_id === user.hospitalId);
  }
  // Branch supervisors see only their governorate's employees
  if (user.role === 'branch_supervisor' && user.governorate) {
    rows = rows.filter(r => r.governorate === user.governorate);
  }
  // Optional query filters
  if (req.query.hospital_id) rows = rows.filter(r => r.hospital_id === parseInt(req.query.hospital_id));
  if (req.query.governorate) rows = rows.filter(r => r.governorate === req.query.governorate);
  rows.sort((a, b) => a.id - b.id);
  // Get last update timestamp per hospital
  const lastUpdates = {};
  db.data.employee_statements.forEach(r => {
    if (r.updated_at && (!lastUpdates[r.hospital_id] || r.updated_at > lastUpdates[r.hospital_id])) {
      lastUpdates[r.hospital_id] = r.updated_at;
    }
  });
  // Also get hospitals list with update status for alerts
  const allHospitals = db.data.hospitals || [];
  const hospitalStatus = allHospitals.map(h => ({
    id: h.id,
    name: h.name,
    governorate: h.governorate,
    lastUpdate: lastUpdates[h.id] || null,
    employeeCount: db.data.employee_statements.filter(r => r.hospital_id === h.id).length
  }));
  // Check monthly review status
  const now2 = new Date();
  const curMonth = now2.getMonth() + 1;
  const curYear = now2.getFullYear();
  const monthlyReviewed = {};
  (db.data.employee_monthly_updates || []).forEach(r => {
    if (r.month === curMonth && r.year === curYear) {
      monthlyReviewed[r.hospital_id] = true;
    }
  });
  hospitalStatus.forEach(h => { h.monthlyUpdated = !!monthlyReviewed[h.id]; });
  res.json({ rows, hospitalStatus });
});

app.post('/api/employee-statements', requireAuth(), requirePerm('employees', 'add'), async (req, res) => {
  ensureEmpTable();
  const user = req.session.user;
  const { hospital_id, employee, category, classification, shift, shifts_count, national_id, phone, email } = req.body;
  if (!employee) return res.status(400).json({ error: 'اسم الموظف مطلوب' });
  if (!category) return res.status(400).json({ error: 'الفئه مطلوبة' });
  if (!classification) return res.status(400).json({ error: 'التصنيف مطلوب' });
  if (!national_id) return res.status(400).json({ error: 'الرقم القومي مطلوب' });
  // Hospital managers can only add to their own hospital
  const targetHospId = hospital_id || user.hospitalId;
  if (user.role === 'hospital' && targetHospId !== user.hospitalId) {
    return res.status(403).json({ error: 'لا يمكنك الإضافة لمستشفى أخرى' });
  }
  // Branch supervisors can only add to hospitals in their governorate
  const targetHosp = (db.data.hospitals || []).find(h => h.id === targetHospId);
  if (user.role === 'branch_supervisor' && user.governorate && targetHosp && targetHosp.governorate !== user.governorate) {
    return res.status(403).json({ error: 'لا يمكنك الإضافة لمحافظة أخرى' });
  }
  // Look up hospital name & governorate
  const hosp = (db.data.hospitals || []).find(h => h.id === targetHospId);
  const result = await query(
    `INSERT INTO employee_statements (hospital_id, hospital_name, governorate, employee, category, classification, shift, shifts_count, national_id, phone, email, updated_at, user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),$12) RETURNING *`,
    [targetHospId, hosp?.name || '', hosp?.governorate || '', employee, category||'', classification||'', shift||'', shifts_count||'', national_id||'', phone||'', email||'', user.id]
  );
  res.json(result.rows[0]);
});

app.put('/api/employee-statements/:id', requireAuth(), requirePerm('employees', 'edit'), async (req, res) => {
  ensureEmpTable();
  const user = req.session.user;
  const id = parseInt(req.params.id);
  const record = db.data.employee_statements.find(r => r.id === id);
  if (!record) return res.status(404).json({ error: 'السجل غير موجود' });
  // Hospital managers can only edit their own hospital's records
  if (user.role === 'hospital' && record.hospital_id !== user.hospitalId) {
    return res.status(403).json({ error: 'لا يمكنك تعديل سجل لمستشفى أخرى' });
  }
  // Branch supervisors can only edit records in their governorate
  if (user.role === 'branch_supervisor' && user.governorate && record.governorate !== user.governorate) {
    return res.status(403).json({ error: 'لا يمكنك تعديل سجل لمحافظة أخرى' });
  }
  const { hospital_id, employee, category, classification, shift, shifts_count, national_id, phone, email } = req.body;
  if (employee !== undefined && !employee) return res.status(400).json({ error: 'اسم الموظف مطلوب' });
  if (category !== undefined && !category) return res.status(400).json({ error: 'الفئه مطلوبة' });
  if (classification !== undefined && !classification) return res.status(400).json({ error: 'التصنيف مطلوب' });
  if (national_id !== undefined && !national_id) return res.status(400).json({ error: 'الرقم القومي مطلوب' });
  if (hospital_id !== undefined) {
    const hosp = (db.data.hospitals || []).find(h => h.id === hospital_id);
    if (hosp) {
      record.hospital_id = hosp.id;
      record.hospital_name = hosp.name;
      record.governorate = hosp.governorate;
    }
  }
  if (employee !== undefined) record.employee = employee;
  if (category !== undefined) record.category = category;
  if (classification !== undefined) record.classification = classification;
  if (shift !== undefined) record.shift = shift;
  if (shifts_count !== undefined) record.shifts_count = shifts_count;
  if (national_id !== undefined) record.national_id = national_id;
  if (phone !== undefined) record.phone = phone;
  if (email !== undefined) record.email = email;
  record.updated_at = new Date().toISOString();
  db._save();
  res.json(record);
});

app.delete('/api/employee-statements/:id', requireAuth(), requirePerm('employees', 'delete'), async (req, res) => {
  ensureEmpTable();
  const user = req.session.user;
  const id = parseInt(req.params.id);
  const record = db.data.employee_statements.find(r => r.id === id);
  if (!record) return res.status(404).json({ error: 'السجل غير موجود' });
  // Hospital managers can only delete their own hospital's records
  if (user.role === 'hospital' && record.hospital_id !== user.hospitalId) {
    return res.status(403).json({ error: 'لا يمكنك حذف سجل لمستشفى أخرى' });
  }
  // Branch supervisors can only delete records in their governorate
  if (user.role === 'branch_supervisor' && user.governorate && record.governorate !== user.governorate) {
    return res.status(403).json({ error: 'لا يمكنك حذف سجل لمحافظة أخرى' });
  }
  await query('DELETE FROM employee_statements WHERE id = $1', [id]);
  res.json({ ok: true });
});

app.post('/api/employee-statements/mark-updated', requireAuth(), requirePerm('employees', 'edit'), async (req, res) => {
  ensureEmpTable();
  const user = req.session.user;
  if (user.role !== 'hospital') return res.status(403).json({ error: 'فقط المستشفى يمكنها التأكيد' });
  const hospitalId = user.hospitalId;
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  if (!db.data.employee_monthly_updates) db.data.employee_monthly_updates = [];
  let rec = db.data.employee_monthly_updates.find(r => r.hospital_id === hospitalId && r.month === month && r.year === year);
  if (rec) {
    rec.updated_at = now.toISOString();
  } else {
    const id = db._nextId('employee_monthly_updates');
    db.data.employee_monthly_updates.push({ id, hospital_id: hospitalId, month, year, updated_at: now.toISOString() });
  }
  db._save();
  res.json({ ok: true });
});

app.post('/api/employee-statements/track-view', requireAuth(), requirePerm('employees', 'view'), async (req, res) => {
  const user = req.session.user;
  if (!user.hospitalId) return res.json({ ok: true });
  // Mark hospital as having viewed the page this month
  const now = new Date();
  const dateStr = now.toISOString();
  // Update the last employee's updated_at for this hospital to simulate activity
  // Or create a tracking entry in a separate table
  ensureEmpTable();
  const existing = db.data.employee_statements.filter(r => r.hospital_id === user.hospitalId);
  if (existing.length > 0) {
    // Touch the most recent record to reflect view activity
    existing.sort((a,b) => (b.updated_at||'').localeCompare(a.updated_at||''));
    existing[0].updated_at = dateStr;
    db._save();
  }
  res.json({ ok: true, tracked: true });
});

// Keep the old read-only endpoint for backward compatibility
app.get('/api/employee-statement', requireAuth(), requirePerm('employees', 'view'), async (req, res) => {
  try {
    const XLSX = require('xlsx');
    if (!fs.existsSync(EMPLOYEE_FILE)) return res.status(404).json({ error: 'ملف بيان العاملين غير موجود' });
    const wb = XLSX.readFile(EMPLOYEE_FILE);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    while (rows.length && rows[rows.length - 1].every(c => c === '')) rows.pop();
    if (rows.length < 3) return res.status(400).json({ error: 'الملف لا يحتوي على بيانات كافية' });
    const title = rows[0][1] || '';
    const headers = rows[1] || [];
    const data = [];
    let lastGov = '', lastBank = '', lastDate = '', lastTime = '';
    for (let i = 2; i < rows.length; i++) {
      const r = rows[i];
      if (r[0]) lastGov = r[0];
      if (r[1]) lastBank = r[1];
      if (r[2]) lastDate = r[2];
      if (r[3] !== '') lastTime = r[3];
      const name = (r[4] || '').trim();
      if (!name) continue;
      data.push({
        governorate: lastGov, hospital: lastBank, date: lastDate,
        employee: name, category: r[5]||'', classification: r[6]||'',
        shift: r[7]||'', shiftsCount: r[8]||'', nationalId: r[9]||'',
        phone: r[10]||'', email: r[11]||''
      });
    }
    res.json({ title, headers, data });
  } catch (e) {
    res.status(500).json({ error: 'فشل قراءة الملف: ' + e.message });
  }
});

// === Readiness Occasions CRUD ===
function ensureReadiness() {
  if (!db.data.readiness_occasions) db.data.readiness_occasions = [];
  if (!db.data.readiness_reports) db.data.readiness_reports = [];
  if (!db.data.readiness_notifications) db.data.readiness_notifications = [];
}

app.get('/api/readiness-occasions', requireAuth(), requirePerm('readiness', 'view'), async (req, res) => {
  ensureReadiness();
  res.json(db.data.readiness_occasions.sort((a,b) => b.id - a.id));
});

app.post('/api/readiness-occasions', requireAuth(), requirePerm('readiness', 'add'), async (req, res) => {
  ensureReadiness();
  const { name, date_from, date_to, day_labels } = req.body;
  if (!name) return res.status(400).json({ error: 'اسم المناسبة مطلوب' });
  const id = db._nextId('readiness_occasions');
  const now = new Date().toISOString();
  const occasion = { id, name: name.trim(), date_from: date_from || '', date_to: date_to || '', day_labels: day_labels || [], created_at: now, updated_at: now, user_id: req.session.user.id };
  db.data.readiness_occasions.push(occasion);
  // Create notification for all readiness users
  const notifId = db._nextId('readiness_notifications');
  const notification = {
    id: notifId, occasion_id: id, occasion_name: name.trim(),
    message: `تم إضافة مناسبة جديدة: ${name.trim()}`,
    created_by: req.session.user.name || req.session.user.username,
    created_at: now, dismissed: false
  };
  if (!db.data.readiness_notifications) db.data.readiness_notifications = [];
  db.data.readiness_notifications.push(notification);
  db._save();
  res.json(occasion);
});

app.put('/api/readiness-occasions/:id', requireAuth(), requirePerm('readiness', 'edit'), async (req, res) => {
  ensureReadiness();
  const id = parseInt(req.params.id);
  const rec = db.data.readiness_occasions.find(r => r.id === id);
  if (!rec) return res.status(404).json({ error: 'غير موجود' });
  const { name, date_from, date_to, day_labels } = req.body;
  if (name !== undefined) rec.name = name.trim();
  if (date_from !== undefined) rec.date_from = date_from;
  if (date_to !== undefined) rec.date_to = date_to;
  if (day_labels !== undefined) rec.day_labels = day_labels;
  rec.updated_at = new Date().toISOString();
  db._save();
  res.json(rec);
});

app.delete('/api/readiness-occasions/:id', requireAuth(), requirePerm('readiness', 'delete'), async (req, res) => {
  ensureReadiness();
  const id = parseInt(req.params.id);
  db.data.readiness_occasions = db.data.readiness_occasions.filter(r => r.id !== id);
  db.data.readiness_reports = db.data.readiness_reports.filter(r => r.occasion_id !== id);
  if (db.data.readiness_notifications) db.data.readiness_notifications = db.data.readiness_notifications.filter(n => n.occasion_id !== id);
  db._save();
  res.json({ ok: true });
});

// === Readiness Notifications ===
app.get('/api/readiness-notifications', requireAuth(), async (req, res) => {
  ensureReadiness();
  const user = req.session.user;
  // Cleanup: remove notifications whose occasion no longer exists
  const existingOccasionIds = new Set((db.data.readiness_occasions || []).map(o => o.id));
  if (db.data.readiness_notifications) {
    const before = db.data.readiness_notifications.length;
    db.data.readiness_notifications = db.data.readiness_notifications.filter(n => existingOccasionIds.has(n.occasion_id));
    if (db.data.readiness_notifications.length !== before) db._save();
  }
  const notifs = (db.data.readiness_notifications || []).filter(n => !n.dismissed);
  const hospitals = db.data.hospitals || [];
  const reports = db.data.readiness_reports || [];
  const result = notifs.sort((a,b) => b.id - a.id).map(n => {
    const occReports = reports.filter(r => r.occasion_id === n.occasion_id);
    const reportedIds = occReports.map(r => r.hospital_id);
    let missing = hospitals.filter(h => !reportedIds.includes(h.id));
    // Auto-dismiss if ALL hospitals have entered data
    if (missing.length === 0 && !n.dismissed) {
      n.dismissed = true;
      db._save();
      return null;
    }
    // Filter by user role
    if (user.role === 'hospital') {
      missing = missing.filter(h => h.id === user.hospitalId);
    } else if (user.role === 'branch_supervisor') {
      missing = missing.filter(h => h.governorate === user.governorate);
    }
    return {
      ...n,
      missing_count: missing.length,
      missing_hospitals: missing.slice(0,5).map(h => h.name),
      all_missing: missing.map(h => h.name),
      dynamic_message: missing.length > 0
        ? `جاهزية ${n.occasion_name}: ${missing.length} مستشفى لم يدخل بعد`
        : `جاهزية ${n.occasion_name}: تم إدخال الكل ✓`
    };
  }).filter(Boolean);
  res.json(result);
});

app.put('/api/readiness-notifications/:id/dismiss', requireAuth(), async (req, res) => {
  ensureReadiness();
  const id = parseInt(req.params.id);
  const rec = (db.data.readiness_notifications || []).find(n => n.id === id);
  if (!rec) return res.status(404).json({ error: 'غير موجود' });
  rec.dismissed = true;
  db._save();
  res.json({ ok: true });
});

// === Readiness Reports CRUD ===
app.get('/api/readiness-reports', requireAuth(), requirePerm('readiness', 'view'), async (req, res) => {
  ensureReadiness();
  const user = req.session.user;
  let rows = [...db.data.readiness_reports];
  // Role-based filtering
  if (user.role === 'hospital') {
    rows = rows.filter(r => r.hospital_id === user.hospitalId);
  } else if (user.role === 'branch_supervisor') {
    rows = rows.filter(r => r.governorate === user.governorate);
  }
  if (req.query.occasion_id) rows = rows.filter(r => r.occasion_id === parseInt(req.query.occasion_id));
  if (req.query.hospital_id) rows = rows.filter(r => r.hospital_id === parseInt(req.query.hospital_id));
  res.json(rows);
});

app.post('/api/readiness-reports', requireAuth(), requirePerm('readiness', 'add'), async (req, res) => {
  ensureReadiness();
  const user = req.session.user;
  const { occasion_id, hospital_id, hospital_name, governorate, staff_data, stock, stock_details, stock_reason, maintenance, maint_reason, breakdowns, consumables, cons_impact, cons_correction } = req.body;
  if (!occasion_id || !hospital_id) return res.status(400).json({ error: 'المناسبة والمستشفى مطلوبان' });
  // Check duplicate
  const dup = db.data.readiness_reports.find(r => r.occasion_id === occasion_id && r.hospital_id === hospital_id);
  if (dup) return res.status(400).json({ error: 'تم إدخال هذا المستشفى لهذه المناسبة مسبقاً' });
  const id = db._nextId('readiness_reports');
  const now = new Date().toISOString();
  const report = {
    id, occasion_id, hospital_id, hospital_name: hospital_name || '', governorate: governorate || '',
    staff_data: staff_data || '[]', stock: stock || '', stock_details: stock_details || '',
    maintenance: maintenance || '', maint_reason: maint_reason || '', breakdowns: breakdowns || '', consumables: consumables || '',
    cons_impact: cons_impact || '', cons_correction: cons_correction || '',
    stock_reason: stock_reason || '',
    created_at: now, updated_at: now, user_id: user.id
  };
  db.data.readiness_reports.push(report);
  db._save();
  res.json(report);
});

app.put('/api/readiness-reports/:id', requireAuth(), requirePerm('readiness', 'edit'), async (req, res) => {
  ensureReadiness();
  const id = parseInt(req.params.id);
  const rec = db.data.readiness_reports.find(r => r.id === id);
  if (!rec) return res.status(404).json({ error: 'غير موجود' });
  const fields = ['hospital_name','governorate','staff_data','stock','stock_details','stock_reason','maintenance','maint_reason','breakdowns','consumables','cons_impact','cons_correction'];
  fields.forEach(f => { if (req.body[f] !== undefined) rec[f] = req.body[f]; });
  rec.updated_at = new Date().toISOString();
  db._save();
  res.json(rec);
});

app.delete('/api/readiness-reports/:id', requireAuth(), requirePerm('readiness', 'delete'), async (req, res) => {
  ensureReadiness();
  const id = parseInt(req.params.id);
  db.data.readiness_reports = db.data.readiness_reports.filter(r => r.id !== id);
  db._save();
  res.json({ ok: true });
});

// === Readiness Export ===
app.get('/api/readiness-export/xlsx', requireAuth(), requirePerm('readiness', 'export'), async (req, res) => {
  try {
    ensureReadiness();
    const XLSX = require('xlsx');
    const wb = XLSX.utils.book_new();
    const occasions = db.data.readiness_occasions || [];
    const reports = db.data.readiness_reports || [];
    occasions.forEach(occ => {
      const occReps = reports.filter(r => r.occasion_id === occ.id);
      if (!occReps.length) return;
      const rows = [['#', 'المستشفى', 'المحافظة', 'الموظفين', 'الرصيد', 'بيان الرصيد', 'سبب نقص الرصيد', 'الصيانة', 'سبب عدم الصيانة', 'الأعطال', 'تأثير الأعطال', 'المستهلكات', 'مدى التأثير', 'الحذف']];
      occReps.forEach((r, i) => {
        let staffStr = '';
        try {
          const st = JSON.parse(r.staff_data || '[]');
          staffStr = st.map(s => s.name + (s.schedule?.length ? ' (' + s.schedule.join('|') + ')' : '')).join('; ');
        } catch (e) { staffStr = ''; }
        let bdStr = '';
        let bdImpact = '';
        try {
          const bd = JSON.parse(r.breakdowns || '{}');
          bdStr = (bd.has || '') + (bd.desc ? ' - ' + bd.desc : '');
          bdImpact = bd.impact || '';
        } catch (e) { bdStr = r.breakdowns || ''; }
        rows.push([i + 1, r.hospital_name, r.governorate, staffStr, r.stock, r.stock_details, r.stock_reason||'', r.maintenance, r.maint_reason||'', bdStr, bdImpact, r.consumables, r.cons_impact||'', r.cons_correction||'']);
      });
      // Add footer
      rows.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
      rows.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'إعداد وبرمجة / محمد ندا 0106888.0999']);
      const ws = XLSX.utils.aoa_to_sheet(rows);
      // Column widths
      ws['!cols'] = [{wch:4},{wch:20},{wch:12},{wch:40},{wch:10},{wch:30},{wch:20},{wch:10},{wch:20},{wch:25},{wch:20},{wch:10},{wch:20},{wch:20}];
      XLSX.utils.book_append_sheet(wb, ws, occ.name);
    });
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', "attachment; filename*=UTF-8''" + encodeURIComponent('شيت_الجاهزيه.xlsx'));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (e) {
    res.status(500).json({ error: 'فشل تصدير Excel: ' + e.message });
  }
});

// === Readiness Sheet (جاهزية بنوك الدم) ===
const READINESS_FILE = path.join(dataDir, 'جاهزية بنوك الدم.xlsx');

app.get('/api/readiness-sheet', requireAuth(), async (req, res) => {
  try {
    const XLSX = require('xlsx');
    if (!fs.existsSync(READINESS_FILE)) {
      return res.status(404).json({ error: 'ملف الجاهزية غير موجود' });
    }
    const wb = XLSX.readFile(READINESS_FILE);
    const sheets = {};
    wb.SheetNames.forEach(name => {
      const ws = wb.Sheets[name];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      while (rows.length && rows[rows.length - 1].every(c => c === '')) rows.pop();
      sheets[name] = rows;
    });
    res.json({ sheetNames: wb.SheetNames, sheets });
  } catch (e) {
    res.status(500).json({ error: 'فشل قراءة ملف الجاهزية: ' + e.message });
  }
});

// === Sync endpoints (Drive / cloud) ===
const MASTER_ONLY = requireMaster();

app.get('/api/sync/status', requireAuth(), async (req, res) => {
  const dbPath = path.join(dataDir, 'db.json');
  const stats = fs.statSync(dbPath);
  res.json({
    device: os.hostname(),
    dataSize: stats.size,
    lastModified: stats.mtime,
    hospitals: (db.data.hospitals || []).length,
    reports: (db.data.readiness_reports || []).length,
    users: (db.data.users || []).length,
  });
});

app.get('/api/sync/export', requireAuth(), MASTER_ONLY, async (req, res) => {
  res.json({ data: db.data, device: os.hostname() });
});

app.post('/api/sync/import', requireAuth(), MASTER_ONLY, async (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: 'لا توجد بيانات' });
  db.data = data;
  db._save();
  res.json({ success: true });
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

// Catch-all — serve index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: err.message || 'خطأ داخلي' });
});

// === Auto-detect port & start ===
function startServer(port) {
  const server = app.listen(port, '0.0.0.0');
  server.on('listening', () => {
    const p = server.address().port;
    console.log(`✅ Blood Bank Server running on port ${p}`);
    console.log(`   Device: ${os.hostname()}`);
    const url = `http://localhost:${p}`;
    // Auto-open browser after 1s
    setTimeout(() => {
      const cmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
      require('child_process').exec(`${cmd} ${url}`, (e) => { if (e) {} });
    }, 1000);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`   Port ${port} in use, trying ${port + 1}`);
      server.close(() => startServer(port + 1));
    } else {
      console.error('❌', err.message);
    }
  });
}
startServer(PORT || 3001);
