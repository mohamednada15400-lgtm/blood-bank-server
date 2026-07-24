require('express-async-errors');
require('dotenv').config();
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const app = express();
const PORT = process.env.PORT || 3001;
const SESSION_SECRET = process.env.SESSION_SECRET || 'blood-bank-secret-key-2026';
const BASE_DIR = process.pkg ? path.dirname(process.execPath) : __dirname;
const os = require('os');
function getWritableDir() {
  const preferred = process.env.DATA_DIR || path.join(BASE_DIR, 'data');
  try {
    const test = path.join(preferred, '.write-test');
    fs.writeFileSync(test, 'ok', 'utf8');
    fs.unlinkSync(test);
    return preferred;
  } catch {
    // preferred path not writable → use /tmp
    const fallback = path.join(os.tmpdir(), 'bloodbank-data');
    try { fs.mkdirSync(fallback, { recursive: true }); } catch {}
    return fallback;
  }
}
const DATA_DIR = getWritableDir();
// Consistent error sanitization: secure by default — hide details unless SHOW_ERROR_DETAILS=true
const showError = process.env.SHOW_ERROR_DETAILS === 'true';
function errMsg(e) { return e.message; }
function getLocalIP() { const ifs = os.networkInterfaces(); for (const k in ifs) { for (const i of ifs[k]) { if (i.family === 'IPv4' && !i.internal) return i.address; } } return '127.0.0.1'; }

// Copy initial db.json from seed to writable directory if needed
const srcDb = path.join(BASE_DIR, 'data', 'db.json');
const dstDb = path.join(DATA_DIR, 'db.json');
try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
let needsCopy = !fs.existsSync(dstDb);
if (!needsCopy) {
  try {
    const dstData = JSON.parse(fs.readFileSync(dstDb, 'utf8'));
    if (!dstData.users || dstData.users.length < 10) needsCopy = true;
  } catch { needsCopy = true; }
}
if (needsCopy && fs.existsSync(srcDb)) {
  fs.copyFileSync(srcDb, dstDb);
  console.log('📦 Deployed initial db.json from seed to', dstDb);
}

const db = require('./db');
let query;

async function startServer() {
  await db.init();
  const isPG = db.mode === 'pg';

  // Session store: Redis → PostgreSQL → memorystore (priority order)
  let pool;
  const SESSION_CONFIG = {
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 8 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax', secure: false, path: '/' }
  };
  if (process.env.REDIS_URL) {
    const Redis = require('ioredis');
    const RedisStore = require('connect-redis').default;
    const redisClient = new Redis(process.env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 3, retryStrategy: (t) => Math.min(t * 100, 3000) });
    await redisClient.connect().catch(() => console.warn('⚠️ Redis connection failed, sessions will use fallback'));
    if (redisClient.status === 'ready') {
      SESSION_CONFIG.store = new RedisStore({ client: redisClient, prefix: 'bloodbank:sess:' });
      SESSION_CONFIG.cookie.secure = true;
      app.locals.redis = redisClient;
      console.log('✅ Redis session store (horizontal scaling ready)');
    }
  }
  // Use MemoryStore (lightweight, no extra connections)
  if (!SESSION_CONFIG.store) {
    const MemoryStore = require('memorystore')(session);
    SESSION_CONFIG.store = new MemoryStore({ checkPeriod: 86400000 });
  }
  query = async (text, params) => { return isPG && pool ? (await pool.query(text, params)) : db.query(text, params); };
  
  // Warm-up query: establish first connection before handling requests
  if (isPG) {
    db.query('SELECT 1').then(() => console.log('✅ PG warm-up complete')).catch(e => console.log('⚠️ PG warm-up:', e.message));
  }
  
  // Simple in-memory cache for read-heavy endpoints (cleared on writes)
  const cache = { _data: {}, _timestamps: {} };
  const CACHE_TTL = 5000;
  function cacheGet(key) { const v = cache._data[key]; if (v && Date.now() - (cache._timestamps[key]||0) < CACHE_TTL) return v; return null; }
  function cacheSet(key, val) { cache._data[key] = val; cache._timestamps[key] = Date.now(); }
  function cacheClear(key) { if (key) { delete cache._data[key]; delete cache._timestamps[key]; } else { cache._data = {}; cache._timestamps = {}; } }
  // Cache keys are cleared on any POST/PUT/DELETE to the same table
  app.use((req, res, next) => {
    if (['POST','PUT','PATCH','DELETE'].includes(req.method) && req.path.startsWith('/api/')) {
      const parts = req.path.split('/');
      // Clear cache for this resource
      const tableKey = parts[2] || 'general';
      cacheClear(tableKey);
    }
    next();
  });
  app.use(session(SESSION_CONFIG));
  app.disable('x-powered-by');
app.set('trust proxy', 1);

// HTTPS redirect (when behind Cloudflare or proxy — only if forwarded-proto is set)
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] === 'http') {
    return res.redirect(301, 'https://' + req.headers.host + req.originalUrl);
  }
  next();
});

// Morgan request logging
app.use(morgan('[:date[iso]] :method :url :status :res[content-length] - :response-time ms'));

// Nonce generator for CSP (used by template engine)
app.use((req, res, next) => { res.locals.nonce = crypto.randomBytes(16).toString('base64'); next(); });

// Helmet hardening — CSP enabled (all inline handlers converted to data-click)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'", 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net', 'https:'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com', 'https:'],
      fontSrc: ["'self'", 'https://cdnjs.cloudflare.com', 'https:', 'data:'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      reportUri: '/api/csp-violation'
    }
  },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  originAgentCluster: true,
  originAgentCluster: true,
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
}));

// Permissions-Policy header (manually set for broader compatibility)
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), accelerometer=(), gyroscope=(), magnetometer=(), payment=(), usb=(), sync-xhr=()');
  next();
});

// ===== CSRF Protection (Origin/Referer check — no extra dependencies) =====
app.use((req, res, next) => {
  if (['GET','HEAD','OPTIONS'].includes(req.method)) return next();
  // Skip CSRF check for login/logout (they have their own protections)
  if (req.path === '/api/login' || req.path === '/api/logout') return next();
  const origin = req.headers['origin'];
  const referer = req.headers['referer'];
  const host = req.headers.host;
  // Allow if same origin or no origin (direct API calls)
  if (origin && !origin.includes(host)) {
    return res.status(403).json({ error: 'ممنوع (CSRF)' });
  }
  if (referer && !referer.includes(host)) {
    return res.status(403).json({ error: 'ممنوع (CSRF)' });
  }
  next();
});

// Compression for all responses (gzip)
app.use(compression({ level: 6, threshold: 512 }));

// Server-side XSS sanitization — strips HTML tags from all string inputs
function sanitizeStr(v) {
  if (typeof v !== 'string') return v;
  return v.replace(/<[^>]*>/g, '').replace(/javascript\s*:/gi, '').replace(/on\w+\s*=/gi, '');
}
function sanitizeBody(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  for (const k of Object.keys(obj)) {
    if (typeof obj[k] === 'string') obj[k] = sanitizeStr(obj[k]);
    else if (Array.isArray(obj[k])) obj[k] = obj[k].map(sanitizeBody);
    else if (obj[k] && typeof obj[k] === 'object') sanitizeBody(obj[k]);
  }
  return obj;
}
app.use((req, res, next) => {
  if (['POST','PUT','PATCH'].includes(req.method) && req.body) sanitizeBody(req.body);
  next();
});

// Account lockout: 5 failed attempts → 15 min ban (per IP)
const loginAttempts = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of loginAttempts) {
    if (now - data.lockedUntil > 0 && data.lockedUntil > 0) loginAttempts.delete(ip);
    if (now - data.lastAttempt > 900000) loginAttempts.delete(ip);
  }
}, 60000); // cleanup every 60s
function checkLockout(ip) {
  const entry = loginAttempts.get(ip);
  if (!entry) return false;
  if (entry.lockedUntil && Date.now() < entry.lockedUntil) return true;
  if (entry.lockedUntil) { loginAttempts.delete(ip); return false; }
  return false;
}
function recordFailedAttempt(ip) {
  if (!ip) return;
  const entry = loginAttempts.get(ip) || { count: 0, lastAttempt: 0, lockedUntil: 0 };
  entry.count++;
  entry.lastAttempt = Date.now();
  if (entry.count >= 5) entry.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 min
  loginAttempts.set(ip, entry);
}
function clearLockout(ip) { loginAttempts.delete(ip); }

// Body parsing with size limits
function safeInt(v) { const n = parseInt(v); if (isNaN(n)) return null; return n; }
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Static files with cache headers (HTML: no-cache, assets: 24h)
const oneDay = 86400000;
app.use(express.static(path.join(BASE_DIR, 'public'), {
  maxAge: oneDay,
  etag: true,
  lastModified: true,
  setHeaders: (res, p) => {
    if (p.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    if (p.endsWith('.js') || p.endsWith('.css')) res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  }
}));

// ===== Input Validation Middleware =====
function validate(schema) {
  return (req, res, next) => {
    try {
      if (!schema) return next();
      for (const key of Object.keys(schema)) {
        const rules = schema[key];
        const val = req.body[key];
        if (rules.required && (val === undefined || val === null || val === '')) {
          return res.status(400).json({ error: `${key} مطلوب` });
        }
        if (val !== undefined && val !== null && val !== '') {
          if (rules.type === 'string' && typeof val !== 'string') {
            return res.status(400).json({ error: `${key} يجب أن يكون نصاً` });
          }
          if (rules.type === 'number') {
            const n = Number(val);
            if (isNaN(n)) return res.status(400).json({ error: `${key} يجب أن يكون رقماً` });
            req.body[key] = n;
          }
          if (rules.maxLength && typeof val === 'string' && val.length > rules.maxLength) {
            return res.status(400).json({ error: `${key} أقصى طول ${rules.maxLength}` });
          }
          if (rules.pattern && !rules.pattern.test(String(val))) {
            return res.status(400).json({ error: `${key} غير صالح` });
          }
        }
      }
      next();
    } catch (e) { res.status(400).json({ error: 'بيانات غير صالحة' }); }
  };
}

// Rate limiting per-endpoint (not just /api/)
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: Number(process.env.RATE_LIMIT_LOGIN) || 500, message: { error: 'محاولات كثيرة جدًا، حاول بعد 15 دقيقة' }, skip: (req) => !req.body || !req.body.username });
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: Number(process.env.RATE_LIMIT_API) || 3000, message: { error: 'طلبات كثيرة جدًا، حاول بعد دقيقة' } });
const globalLimiter = rateLimit({ windowMs: 60 * 1000, max: 5000, message: { error: 'طلبات كثيرة جدًا' } });
app.use(globalLimiter);
app.use('/api/', apiLimiter);

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

    // Account lockout check
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    if (checkLockout(clientIp)) {
      return res.status(429).json({ error: 'تم قفل الحساب مؤقتاً بسبب محاولات كثيرة فاشلة. حاول بعد 15 دقيقة' });
    }

    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      recordFailedAttempt(clientIp);
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور خطأ' });
    }
    const u = result.rows[0];
    // Migrate plaintext to bcrypt on first login
    let passwordOk = false;
    if (u.password && u.password.startsWith('$2')) {
      passwordOk = await bcrypt.compare(password, u.password);
    } else {
      // Plaintext comparison + migrate
      passwordOk = (u.password === password);
      if (passwordOk) {
        const hash = await bcrypt.hash(password, 10);
        await query("UPDATE users SET password = $1 WHERE id = $2", [hash, u.id]);
      }
    }
    if (!passwordOk) {
      recordFailedAttempt(clientIp);
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور خطأ' });
    }
    // Successful login → clear lockout
    clearLockout(clientIp);
    // Load permissions from role template
    const rpResult = await query("SELECT * FROM role_perms WHERE role = $1", [u.role]);
    let perms = rpResult.rows.length > 0 ? rpResult.rows[0].permissions : {};
    if (typeof perms === 'string') perms = JSON.parse(perms);
    const vIds = u.view_hospital_ids && typeof u.view_hospital_ids === 'string' ? JSON.parse(u.view_hospital_ids) : (u.view_hospital_ids || []);
    req.session.user = { id: u.id, username: u.username, name: u.name, role: u.role, hospitalId: u.hospital_id, governorate: u.governorate, viewPermission: u.view_permission, viewHospitalIds: vIds, permissions: perms };
    res.json({ user: req.session.user });
  } catch (e) { console.error('LOGIN ERROR:', e); res.status(500).json({ error: errMsg(e) }); }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/me', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'غير مصرح' });
  // Re-fetch permissions from DB so new pages are picked up without re-login
  try {
    const rpResult = await query("SELECT * FROM role_perms WHERE role = $1", [req.session.user.role]);
    if (rpResult.rows.length > 0) {
      let freshPerms = rpResult.rows[0].permissions;
      if (typeof freshPerms === 'string') freshPerms = JSON.parse(freshPerms);
      req.session.user.permissions = freshPerms;
    }
  } catch (e) { /* use existing session permissions */ }
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
  // Strip passwords from response
  res.json(rows.map(u => { const { password, ...rest } = u; return rest; }));
});

app.post('/api/users', requireAuth(), requireMaster(), async (req, res) => {
  const { username, password, name, role, hospitalId, governorate, viewPermission, phone, email, viewHospitalIds } = req.body;
  if (role === 'branch_supervisor' && governorate) {
    const existSup = await query("SELECT id FROM users WHERE role = 'branch_supervisor' AND governorate = $1", [governorate]);
    if (existSup.rows.length > 0) return res.status(400).json({ error: 'يوجد مشرف فرع بالفعل لهذا الفرع' });
  }
  const exist = await query('SELECT id FROM users WHERE username = $1', [username]);
  if (exist.rows.length > 0) return res.status(400).json({ error: 'اسم المستخدم موجود' });
  const vhIds = viewHospitalIds && Array.isArray(viewHospitalIds) ? JSON.stringify(viewHospitalIds) : '[]';
  const result = await query(
    "INSERT INTO users (username, password, name, role, hospital_id, governorate, view_permission, phone, email, view_hospital_ids) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id, username, name, role, hospital_id, governorate, view_permission, phone, email, view_hospital_ids",
    [username, password || '123456', name, role, hospitalId || null, governorate || null, viewPermission || 'own', phone || '', email || '', vhIds]
  );
  res.json(result.rows[0]);
});

app.post('/api/users/batch-create-employees', requireAuth(), requireMaster(), async (req, res) => {
  try {
    const empResult = await query('SELECT * FROM employee_statements');
    const employees = empResult.rows || [];
    if (!employees.length) return res.json({ created: 0, message: 'لا يوجد موظفون في بيان العاملين' });

    // Get hospital info
    const hospResult = await query('SELECT * FROM hospitals ORDER BY id');
    const hospMap = {};
    (hospResult.rows || []).forEach(h => { hospMap[h.id] = h; });

    // Get existing users to avoid duplicates
    const userResult = await query('SELECT * FROM users');
    const existingUsers = userResult.rows || [];
    const existingSet = new Set();
    existingUsers.forEach(u => {
      existingSet.add(u.hospital_id + ':' + u.name);
    });

    // Group employees by hospital
    const byHosp = {};
    employees.forEach(e => {
      const hid = e.hospital_id || 0;
      if (!byHosp[hid]) byHosp[hid] = [];
      byHosp[hid].push(e);
    });

    // Get next counter per hospital
    const nextSeq = {};
    existingUsers.forEach(u => {
      const m = (u.username || '').match(/^h(\d+)_(\d+)$/);
      if (m) {
        const hid = parseInt(m[1]);
        const seq = parseInt(m[2]);
        if (!nextSeq[hid] || seq >= nextSeq[hid]) nextSeq[hid] = seq + 1;
      }
    });

    let created = 0;
    for (const [hidStr, empList] of Object.entries(byHosp)) {
      const hid = parseInt(hidStr);
      if (!hid) continue;
      const hInfo = hospMap[hid];
      const role = 'hospital';
      if (!nextSeq[hid]) nextSeq[hid] = 1;

      for (const emp of empList) {
        const name = (emp.employee || '').trim();
        if (!name) continue;
        const key = hid + ':' + name;
        if (existingSet.has(key)) continue;

        const seq = nextSeq[hid]++;
        const username = 'h' + hid + '_' + seq;
        const genPassword = '123';

        await query(
          "INSERT INTO users (username, password, name, role, hospital_id, governorate, view_permission, phone, email) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
          [username, genPassword, name, role, hid, hInfo ? hInfo.governorate : null, 'own', emp.phone || '', '']
        );
        existingSet.add(key);
        created++;
      }
    }
    res.json({ created, message: created > 0 ? `تم إنشاء ${created} حساب` : 'جميع الموظفين لديهم حسابات بالفعل' });
  } catch (e) { res.status(500).json({ error: errMsg(e) }); }
});

app.put('/api/users/:id', requireAuth(), async (req, res) => {
  const user = req.session.user;
  const targetId = parseInt(req.params.id);
  const { password, name, role, hospitalId, governorate, viewPermission, phone, email, viewHospitalIds } = req.body;

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
    if (viewHospitalIds !== undefined) { sets.push(`view_hospital_ids = $${idx++}`); vals.push(JSON.stringify(viewHospitalIds)); }
    vals.push(targetId);
    const result = await query(`UPDATE users SET ${sets.join(', ')} WHERE id = $${idx} RETURNING id, username, name, role, hospital_id, governorate, view_permission, phone, email, view_hospital_ids`, vals);
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
  const { role, permissions, label } = req.body;
  const perms = { ...(permissions || {}), _label: label || role };
  const exist = await query('SELECT * FROM role_perms WHERE role = $1', [role]);
  if (exist.rows.length > 0) {
    await query('UPDATE role_perms SET permissions = $1 WHERE role = $2', [JSON.stringify(perms), role]);
  } else {
    await query('INSERT INTO role_perms (role, permissions) VALUES ($1, $2)', [role, JSON.stringify(perms)]);
  }
  if (req.session.user && req.session.user.role === role) {
    req.session.user.permissions = perms;
  }
  res.json({ ok: true });
});

app.delete('/api/role-permissions/:role', requireAuth(), requireMaster(), async (req, res) => {
  const { role } = req.params;
  if (role === 'admin') return res.status(400).json({ error: 'لا يمكن حذف دور المدير' });
  await query('DELETE FROM role_perms WHERE role = $1', [role]);
  res.json({ ok: true });
});

app.put('/api/users/:id/password', requireAuth(), async (req, res) => {
  const user = req.session.user;
  const targetId = parseInt(req.params.id);
  const { password, currentPassword } = req.body;
  if (!password || password.length < 4) return res.status(400).json({ error: 'كلمة المرور قصيرة (4 أحرف على الأقل)' });

  // Get target user
  const target = await query('SELECT * FROM users WHERE id = $1', [targetId]);
  if (target.rows.length === 0) return res.status(404).json({ error: 'المستخدم غير موجود' });
  const t = target.rows[0];

  // Self password change: verify current password
  if (user.id === targetId) {
    if (!currentPassword) return res.status(400).json({ error: 'يجب إدخال كلمة المرور الحالية' });
    let passwordOk = false;
    if (t.password && t.password.startsWith('$2')) {
      passwordOk = await bcrypt.compare(currentPassword, t.password);
    } else {
      passwordOk = (t.password === currentPassword);
    }
    if (!passwordOk) return res.status(401).json({ error: 'كلمة المرور الحالية غير صحيحة' });
  } else {
    // Admin or branch_supervisor changing someone else's password
    if (user.id !== 1 && user.role !== 'branch_supervisor') return res.status(403).json({ error: 'ليس لديك صلاحية' });
    if (user.role === 'branch_supervisor') {
      if (!['hospital', 'hospital_manager'].includes(t.role)) return res.status(403).json({ error: 'لا يمكن تغيير كلمة سر هذا الدور' });
      if (t.governorate !== user.governorate) return res.status(403).json({ error: 'المستخدم ليس في محافظتك' });
    }
  }

  // Hash the new password
  const hash = await bcrypt.hash(password, 10);
  await query('UPDATE users SET password = $1 WHERE id = $2', [hash, targetId]);
  res.json({ ok: true, message: 'تم تغيير كلمة المرور بنجاح' });
});

app.get('/api/hospitals', requireAuth(), async (req, res) => {
  const user = req.session.user;
  let sql = 'SELECT * FROM hospitals'; const params = [];
  if (user.role === 'hospital' || user.role === 'hospital_manager') { sql += ' WHERE id = $1'; params.push(user.hospitalId); }
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

app.get('/api/governorates', requireAuth(), async (req, res) => {
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
  const result = await query('SELECT * FROM hospital_types ORDER BY name', []);
  res.json(result.rows);
});

app.post('/api/hospital-types', requireAuth(), requireMaster(), async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'الاسم مطلوب' });
  const result = await query('INSERT INTO hospital_types (name) VALUES ($1) RETURNING *', [name.trim()]);
  res.json(result.rows[0]);
});

app.delete('/api/hospital-types/:id', requireAuth(), requireMaster(), async (req, res) => {
  const id = parseInt(req.params.id);
  await query('DELETE FROM hospital_types WHERE id = $1', [id]);
  res.json({ ok: true });
});

async function filterByRole(user, baseSql, params = [], prefix = '') {
  const col = prefix ? `${prefix}.hospital_id` : 'hospital_id';
  if (user.role === 'admin' || user.role === 'org_supervisor') return { sql: baseSql, params };
  if (user.role === 'branch_supervisor') {
    const result = await query('SELECT id FROM hospitals WHERE governorate = $1', [user.governorate]);
    const ids = result.rows.map(r => r.id);
    if (ids.length === 0) return { sql: baseSql + ' AND 1=0', params };
    const placeholders = ids.map((_, i) => `$${params.length + i + 1}`).join(',');
    return { sql: `${baseSql} AND ${col} IN (${placeholders})`, params: [...params, ...ids] };
  } else if (user.role === 'hospital' || user.role === 'hospital_manager') {
    return { sql: baseSql + ` AND ${col} = $${params.length + 1}`, params: [...params, user.hospitalId] };
  } else if (user.role === 'visitor') {
    if (user.viewHospitalIds && Array.isArray(user.viewHospitalIds) && user.viewHospitalIds.length > 0) {
      const ids = user.viewHospitalIds.map(Number).filter(Boolean);
      if (ids.length > 0) {
        const placeholders = ids.map((_, i) => `$${params.length + i + 1}`).join(',');
        return { sql: `${baseSql} AND ${col} IN (${placeholders})`, params: [...params, ...ids] };
      }
    }
    if (user.viewPermission === 'limited') return { sql: baseSql + ' AND 1=0', params };
  }
  return { sql: baseSql, params };
}

app.post('/api/daily-stock', requireAuth(), requirePerm('daily_total', 'edit'), async (req, res) => {
  const { hospitalId, bloodType, quantity, type } = req.body;
  const user = req.session.user;
  if ((user.role === 'hospital' || user.role === 'hospital_manager') && user.hospitalId !== hospitalId) return res.status(403).json({ error: 'غير مصرح' });
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
  let sql = "SELECT dr.id, dr.hospital_id, TO_CHAR(dr.date, 'YYYY-MM-DD') as date, dr.time, dr.under_inspection, dr.blood_data, dr.plasma_data, dr.platelets, dr.cryo, dr.license_type, dr.license_status, dr.plat_data, dr.user_id, h.name as hospital_name, h.governorate, h.type FROM daily_reports dr JOIN hospitals h ON h.id = dr.hospital_id WHERE 1=1";
  let params = [];
  const f = await filterByRole(user, sql, params);
  sql = f.sql; params = f.params;
  if (req.query.date) { sql += ` AND dr.date = $${params.length + 1}`; params.push(req.query.date); }
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
  if ((user.role === 'hospital' || user.role === 'hospital_manager') && user.hospitalId !== hospitalId) return res.status(403).json({ error: 'غير مصرح' });
  const to = (await db.getConfig('time_offset')) || 2;
  const d = date || getOffsetDate(to).toISOString().slice(0, 10);
  const t = time || getOffsetDate(to).toISOString().slice(11, 16);
  const def = EMPTY_REPORT();
  // Auto-fill previous balance from last report's available balance (shift handover)
  const prevRes = await query('SELECT blood_data, plasma_data FROM daily_reports WHERE hospital_id = $1 ORDER BY id DESC LIMIT 1', [hospitalId]);
  if (prevRes.rows.length) {
    const prev = prevRes.rows[0];
    const prevBlood = typeof prev.blood_data === 'string' ? JSON.parse(prev.blood_data) : (prev.blood_data || {});
    const prevPlasma = typeof prev.plasma_data === 'string' ? JSON.parse(prev.plasma_data) : (prev.plasma_data || {});
    ['A+','A-','B+','B-','AB+','AB-','O+','O-'].forEach(t => {
      if (prevBlood[t] && prevBlood[t].available !== undefined) def.blood[t].previous = prevBlood[t].available;
    });
    ['A','B','AB','O'].forEach(t => {
      if (prevPlasma[t] && prevPlasma[t].available !== undefined) def.plasma[t].previous = prevPlasma[t].available;
    });
  }
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

// Auto-save individual cell in daily stock table
app.patch('/api/daily-reports/:id/cell', requireAuth(), requirePerm('daily_stock', 'edit'), async (req, res) => {
  const { group, type, sub, value } = req.body;
  const result = await query('SELECT * FROM daily_reports WHERE id = $1', [parseInt(req.params.id)]);
  if (!result.rows.length) return res.status(404).json({ error: 'غير موجود' });
  const r = result.rows[0];
  if (group === 'license') {
    const f = sub === 'type' ? 'license_type' : 'license_status';
    await query(`UPDATE daily_reports SET ${f} = $1 WHERE id = $2`, [value, parseInt(req.params.id)]);
  } else if (group === 'plat_cryo') {
    await query(`UPDATE daily_reports SET ${sub} = $1 WHERE id = $2`, [parseInt(value) || 0, parseInt(req.params.id)]);
  } else {
    const field = group === 'plasma' ? 'plasma_data' : 'blood_data';
    const data = typeof r[field] === 'object' && r[field] ? r[field] : {};
    if (!data[type]) data[type] = {};
    data[type][sub] = parseInt(value) || 0;
    await query(`UPDATE daily_reports SET ${field} = $1 WHERE id = $2`, [JSON.stringify(data), parseInt(req.params.id)]);
  }
  res.json({ ok: true });
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
  if ((user.role === 'hospital' || user.role === 'hospital_manager') && user.hospitalId !== hospitalId) return res.status(403).json({ error: 'غير مصرح' });
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



app.post('/api/monthly-indicators', requireAuth(), requirePerm('monthly_indicators', 'edit'), async (req, res) => {
  const { hospitalId, year, month, data, day, time } = req.body;
  const d = data || {};
  // Lock after 25th (admin exempt)
  if (req.session.user.role !== 'admin') {
    const _n = new Date();
    if (_n.getDate() >= 25) {
      const _cm = _n.getMonth() + 1, _cy = _n.getFullYear();
      if (year < _cy || (year === _cy && month < _cm)) return res.status(403).json({ error: 'التعديل مغلق بعد يوم 25 من الشهر' });
    }
  }
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
  // Query from all three indicator tables (historical data may be in big/small tables)
  let sql1 = 'SELECT mi.*, h.name as hospital_name, h.governorate, u.name as entered_by FROM monthly_indicators mi JOIN hospitals h ON h.id = mi.hospital_id LEFT JOIN users u ON u.id = mi.user_id WHERE 1=1';
  let sql2 = "SELECT mbi.*, h.name as hospital_name, h.governorate, '' as day, '' as time, NULL as entered_by FROM monthly_big_indicators mbi JOIN hospitals h ON h.id = mbi.hospital_id WHERE 1=1";
  let sql3 = "SELECT msi.*, h.name as hospital_name, h.governorate, '' as day, '' as time, NULL as entered_by FROM monthly_small_indicators msi JOIN hospitals h ON h.id = msi.hospital_id WHERE 1=1";
  let params1 = [], params2 = [], params3 = [];
  // Apply role filters
  const f1 = await filterByRole(user, sql1, params1, 'mi');
  const f2 = await filterByRole(user, sql2, params2, 'mbi');
  const f3 = await filterByRole(user, sql3, params3, 'msi');
  sql1 = f1.sql; params1 = f1.params;
  sql2 = f2.sql; params2 = f2.params;
  sql3 = f3.sql; params3 = f3.params;
  if (req.query.year) {
    sql1 += ` AND mi.year = $${params1.length + 1}`; params1.push(parseInt(req.query.year));
    sql2 += ` AND mbi.year = $${params2.length + 1}`; params2.push(parseInt(req.query.year));
    sql3 += ` AND msi.year = $${params3.length + 1}`; params3.push(parseInt(req.query.year));
  }
  if (req.query.month) {
    sql1 += ` AND mi.month = $${params1.length + 1}`; params1.push(parseInt(req.query.month));
    sql2 += ` AND mbi.month = $${params2.length + 1}`; params2.push(parseInt(req.query.month));
    sql3 += ` AND msi.month = $${params3.length + 1}`; params3.push(parseInt(req.query.month));
  }
  if (req.query.hospitalId || req.query.hospital_id) {
    const hid = parseInt(req.query.hospitalId || req.query.hospital_id);
    sql1 += ` AND mi.hospital_id = $${params1.length + 1}`; params1.push(hid);
    sql2 += ` AND mbi.hospital_id = $${params2.length + 1}`; params2.push(hid);
    sql3 += ` AND msi.hospital_id = $${params3.length + 1}`; params3.push(hid);
  }
  const [r1, r2, r3] = await Promise.all([
    query(sql1, params1),
    query(sql2, params2),
    query(sql3, params3)
  ]);
  // Merge and deduplicate by (hospital_id, year, month) — prefer monthly_indicators
  const merged = [...r1.rows];
  const seen = new Set(merged.map(r => r.hospital_id + '|' + (r.year||'') + '|' + (r.month||'')));
  for (const r of r2.rows) {
    const key = r.hospital_id + '|' + (r.year||'') + '|' + (r.month||'');
    if (!seen.has(key)) { merged.push(r); seen.add(key); }
  }
  for (const r of r3.rows) {
    const key = r.hospital_id + '|' + (r.year||'') + '|' + (r.month||'');
    if (!seen.has(key)) { merged.push(r); seen.add(key); }
  }
  merged.sort((a, b) => (b.year||0)*100+(b.month||0) - (a.year||0)*100-(a.month||0) || (b.id||0)-(a.id||0));
  res.json(merged);
});

app.put('/api/monthly-indicators/:id', requireAuth(), requirePerm('monthly_indicators', 'edit'), async (req, res) => {
  const { data, day, time } = req.body;
  // Lock after 25th (admin exempt)
  if (req.session.user.role !== 'admin') {
    const _rec = await query('SELECT year, month FROM monthly_indicators WHERE id = $1', [parseInt(req.params.id)]);
    if (_rec.rows.length > 0) {
      const _n = new Date();
      if (_n.getDate() >= 25) {
        const _cm = _n.getMonth() + 1, _cy = _n.getFullYear();
        const { year: _y, month: _m } = _rec.rows[0];
        if (_y < _cy || (_y === _cy && _m < _cm)) return res.status(403).json({ error: 'التعديل مغلق بعد يوم 25 من الشهر' });
      }
    }
  }
  await query('UPDATE monthly_indicators SET data = $1, day = $2, time = $3 WHERE id = $4',
    [JSON.stringify(data || {}), day || '', time || '', parseInt(req.params.id)]);
  const result = await query('SELECT mi.id, mi.hospital_id, mi.year, mi.month, mi.day, mi.time, mi.data, mi.date, mi.user_id, h.name as hospital_name, h.governorate, u.name as entered_by FROM monthly_indicators mi JOIN hospitals h ON mi.hospital_id = h.id LEFT JOIN users u ON u.id = mi.user_id WHERE mi.id = $1', [parseInt(req.params.id)]);
  res.json(result.rows[0]);
});

app.delete('/api/monthly-indicators/:id', requireAuth(), requirePerm('monthly_indicators', 'edit'), async (req, res) => {
  if (req.session.user.role !== 'admin') {
    const _rec = await query('SELECT year, month FROM monthly_indicators WHERE id = $1', [parseInt(req.params.id)]);
    if (_rec.rows.length > 0) {
      const _n = new Date();
      if (_n.getDate() >= 25) {
        const _cm = _n.getMonth() + 1, _cy = _n.getFullYear();
        const { year: _y, month: _m } = _rec.rows[0];
        if (_y < _cy || (_y === _cy && _m < _cm)) return res.status(403).json({ error: 'التعديل مغلق بعد يوم 25 من الشهر' });
      }
    }
  }
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
  if ((user.role === 'hospital' || user.role === 'hospital_manager') && user.hospitalId !== hospitalId) return res.status(403).json({ error: 'غير مصرح' });
  // Lock after 25th (admin exempt)
  if (user.role !== 'admin') {
    const _now = new Date();
    if (_now.getDate() >= 25) {
      const _cm = _now.getMonth() + 1, _cy = _now.getFullYear();
      if (year < _cy || (year === _cy && month < _cm)) return res.status(403).json({ error: 'التعديل مغلق بعد يوم 25 من الشهر' });
    }
  }
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
  const now = new Date();
  // Auto-archive on 25th of each month only
  if (now.getDate() >= 25) {
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;
    let cutoffMonth = curMonth - 1;
    let cutoffYear = curYear;
    if (cutoffMonth === 0) { cutoffMonth = 12; cutoffYear--; }
    const all = await query('SELECT mc.*, h.name as hospital_name, h.governorate, u.name as entered_by FROM monthly_consumption mc JOIN hospitals h ON h.id = mc.hospital_id LEFT JOIN users u ON u.id = mc.user_id');
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
  }
  let sql = 'SELECT mc.*, h.name as hospital_name, h.governorate, u.name as entered_by FROM monthly_consumption mc JOIN hospitals h ON h.id = mc.hospital_id LEFT JOIN users u ON u.id = mc.user_id WHERE 1=1';
  let params = [];
  const f = await filterByRole(user, sql, params, 'mc');
  sql = f.sql; params = f.params;
  if (req.query.year) { sql += ` AND mc.year = $${params.length + 1}`; params.push(parseInt(req.query.year)); }
  if (req.query.month) { sql += ` AND mc.month = $${params.length + 1}`; params.push(parseInt(req.query.month)); }
  sql += ' ORDER BY h.governorate, h.name, mc.month';
  const result = await query(sql, params);
  res.json(result.rows);
});

app.put('/api/monthly-consumption/:id', requireAuth(), requirePerm('monthly_consumption', 'edit'), async (req, res) => {
  const { bloodTypes } = req.body;
  // Lock after 25th (admin exempt)
  if (req.session.user.role !== 'admin') {
    const _rec = await query('SELECT year, month FROM monthly_consumption WHERE id = $1', [parseInt(req.params.id)]);
    if (_rec.rows.length > 0) {
      const _n = new Date();
      if (_n.getDate() >= 25) {
        const _cm = _n.getMonth() + 1, _cy = _n.getFullYear();
        const { year: _y, month: _m } = _rec.rows[0];
        if (_y < _cy || (_y === _cy && _m < _cm)) return res.status(403).json({ error: 'التعديل مغلق بعد يوم 25 من الشهر' });
      }
    }
  }
  const sets = []; const vals = []; let idx = 1;
  if (bloodTypes !== undefined) { sets.push(`blood_types = $${idx++}`); vals.push(JSON.stringify(bloodTypes)); }
  if (sets.length === 0) return res.json({ ok: true });
  vals.push(parseInt(req.params.id));
  await query(`UPDATE monthly_consumption SET ${sets.join(', ')} WHERE id = $${idx}`, vals);
  const result = await query('SELECT mc.*, h.name as hospital_name, h.governorate FROM monthly_consumption mc JOIN hospitals h ON h.id = mc.hospital_id WHERE mc.id = $1', [parseInt(req.params.id)]);
  res.json(result.rows[0]);
});

app.delete('/api/monthly-consumption/:id', requireAuth(), requirePerm('monthly_consumption', 'edit'), async (req, res) => {
  if (req.session.user.role !== 'admin') {
    const _rec = await query('SELECT year, month FROM monthly_consumption WHERE id = $1', [parseInt(req.params.id)]);
    if (_rec.rows.length > 0) {
      const _n = new Date();
      if (_n.getDate() >= 25) {
        const _cm = _n.getMonth() + 1, _cy = _n.getFullYear();
        const { year: _y, month: _m } = _rec.rows[0];
        if (_y < _cy || (_y === _cy && _m < _cm)) return res.status(403).json({ error: 'التعديل مغلق بعد يوم 25 من الشهر' });
      }
    }
  }
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
  if ((user.role === 'hospital' || user.role === 'hospital_manager') && user.hospitalId !== hospitalId) return res.status(403).json({ error: 'غير مصرح' });
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
  if ((user.role === 'hospital' || user.role === 'hospital_manager') && user.hospitalId !== hospitalId) return res.status(403).json({ error: 'غير مصرح' });
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



app.get('/api/archive', requireAuth(), requirePerm('archive', 'view'), async (req, res) => {
  let sql = 'SELECT * FROM archives WHERE 1=1'; const params = [];
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

app.get('/api/strategic-reserves', requireAuth(), requirePerm('strategic_stock', 'view'), async (req, res) => {
  const settingsResult = await query('SELECT * FROM strategic_settings ORDER BY id DESC LIMIT 1');
  const settings = settingsResult.rows.length > 0 ? settingsResult.rows[0] : null;
  const reservesResult = await query('SELECT * FROM strategic_reserves ORDER BY id');
  const reserves = reservesResult.rows || [];
  res.json({ settings, reserves });
});

app.post('/api/calculate-strategic', requireAuth(), requirePerm('strategic_stock', 'edit'), async (req, res) => {
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

  const settingsData = { formula, holidayDays, calculated_at: new Date().toISOString(), quarter: `${qStart.toISOString().split('T')[0]} / ${qEnd.toISOString().split('T')[0]}` };
  
  // Upsert settings
  const existSettings = await query('SELECT id FROM strategic_settings ORDER BY id DESC LIMIT 1');
  if (existSettings.rows.length > 0) {
    await query('UPDATE strategic_settings SET formula=$1, holiday_days=$2, calculated_at=$3, quarter=$4 WHERE id=$5',
      [formula, holidayDays, settingsData.calculated_at, settingsData.quarter, existSettings.rows[0].id]);
  } else {
    await query('INSERT INTO strategic_settings (formula, holiday_days, calculated_at, quarter) VALUES ($1,$2,$3,$4)',
      [formula, holidayDays, settingsData.calculated_at, settingsData.quarter]);
  }

  // Replace reserves
  await query('DELETE FROM strategic_reserves');
  for (const r of results) {
    await query('INSERT INTO strategic_reserves (hospital_id, hospital_name, governorate, values, formula, holiday_days) VALUES ($1,$2,$3,$4,$5,$6)',
      [r.hospital_id, r.hospital_name, r.governorate, JSON.stringify(r.values), r.formula, r.holidayDays]);
  }

  res.json({ ok: true, settings: settingsData, reserves: results });
});

// ============== App Config (الإعدادات العامة) ==============
app.get('/api/config/time', requireAuth(), async (req, res) => {
  const timeOffset = await db.getConfig('time_offset');
  res.json({ time_offset: timeOffset || 2, serverTime: Date.now() });
});

app.post('/api/config/time', requireAuth(), requirePerm('time_config', 'edit'), async (req, res) => {
  const { time_offset } = req.body;
  if (time_offset !== 1 && time_offset !== 2) return res.status(400).json({ error: 'القيمة يجب أن تكون 1 (شتوي) أو 2 (صيفي)' });
  await db.setConfig('time_offset', time_offset);
  res.json({ ok: true, time_offset });
});

function getOffsetDate(offset) {
  const now = new Date();
  return new Date(now.getTime() + (offset === 2 ? 3 : 2) * 3600000);
}
// ============== Employee Statements (بيان العاملين) CRUD ==============

const EMPLOYEE_FILE = process.env.EMPLOYEE_FILE || path.join(DATA_DIR, 'بيان العاملين ببنوك دم الهيئة.xlsx');

app.get('/api/employee-statements', requireAuth(), requirePerm('employees', 'view'), async (req, res) => {
  const user = req.session.user;
  let sql = 'SELECT * FROM employee_statements WHERE 1=1';
  const params = [];
  if (user.role === 'hospital') {
    sql += ` AND hospital_id = $${params.length + 1}`;
    params.push(user.hospitalId);
  }
  if (user.role === 'branch_supervisor' && user.governorate) {
    sql += ` AND governorate = $${params.length + 1}`;
    params.push(user.governorate);
  }
  if (req.query.hospital_id) { sql += ` AND hospital_id = $${params.length + 1}`; params.push(parseInt(req.query.hospital_id)); }
  if (req.query.governorate) { sql += ` AND governorate = $${params.length + 1}`; params.push(req.query.governorate); }
  sql += ' ORDER BY id ASC';
  const result = await query(sql, params);
  const rows = result.rows;

  // Get last update timestamp per hospital
  const lastUpdates = {};
  rows.forEach(r => {
    if (r.updated_at && (!lastUpdates[r.hospital_id] || r.updated_at > lastUpdates[r.hospital_id])) {
      lastUpdates[r.hospital_id] = r.updated_at;
    }
  });
  // Also get hospitals list with update status for alerts
  const allHospitalsResult = await query('SELECT * FROM hospitals ORDER BY id');
  const allHospitals = allHospitalsResult.rows || [];
  const hospitalStatus = allHospitals.map(h => ({
    id: h.id,
    name: h.name,
    governorate: h.governorate,
    lastUpdate: lastUpdates[h.id] || null,
    employeeCount: rows.filter(r => r.hospital_id === h.id).length
  }));
  res.json({ rows, hospitalStatus });
});

app.post('/api/employee-statements', requireAuth(), requirePerm('employees', 'add'), async (req, res) => {
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
  if (user.role === 'branch_supervisor' && user.governorate) {
    const targetCheck = await query('SELECT governorate FROM hospitals WHERE id = $1', [targetHospId]);
    if (targetCheck.rows.length > 0 && targetCheck.rows[0].governorate !== user.governorate) {
      return res.status(403).json({ error: 'لا يمكنك الإضافة لمحافظة أخرى' });
    }
  }
  // Look up hospital name & governorate
  const hospResult = await query('SELECT name, governorate FROM hospitals WHERE id = $1', [targetHospId]);
  const hosp = hospResult.rows[0];
  const result = await query(
    `INSERT INTO employee_statements (hospital_id, hospital_name, governorate, employee, category, classification, shift, shifts_count, national_id, phone, email, updated_at, user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),$12) RETURNING *`,
    [targetHospId, hosp?.name || '', hosp?.governorate || '', employee, category||'', classification||'', shift||'', shifts_count||'', national_id||'', phone||'', email||'', user.id]
  );
  // Auto-create user account for this employee
  try {
    const name = employee.trim();
    const existingUser = await query('SELECT id FROM users WHERE hospital_id = $1 AND name = $2', [targetHospId, name]);
    if (existingUser.rows.length === 0) {
      const empCountResult = await query('SELECT COUNT(*) as cnt FROM employee_statements WHERE hospital_id = $1', [targetHospId]);
      const existingUsernames = await query("SELECT username FROM users WHERE username LIKE $1", ['h' + targetHospId + '_%']);
      let seq = 1;
      for (const u of existingUsernames.rows) {
        const m = (u.username || '').match(/^h(\d+)_(\d+)$/);
        if (m && parseInt(m[1]) === targetHospId) {
          const s = parseInt(m[2]);
          if (s >= seq) seq = s + 1;
        }
      }
      if (seq <= 1) {
        const userCountResult = await query('SELECT COUNT(*) as cnt FROM users WHERE hospital_id = $1', [targetHospId]);
        seq = parseInt(userCountResult.rows[0].cnt) + 1;
      }
      const username = 'h' + targetHospId + '_' + seq;
      const pwdHash = bcrypt.hashSync('123', 10);
      await query(
        `INSERT INTO users (username, password, name, role, hospital_id, governorate, view_permission) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [username, pwdHash, name, 'hospital', targetHospId, hosp?.governorate || '', 'own']
      );
    }
  } catch (e) {
    // Don't fail the employee creation if user creation fails
  }
  res.json(result.rows[0]);
});

app.put('/api/employee-statements/:id', requireAuth(), requirePerm('employees', 'edit'), async (req, res) => {
  const user = req.session.user;
  const id = parseInt(req.params.id);
  const recordResult = await query('SELECT * FROM employee_statements WHERE id = $1', [id]);
  if (recordResult.rows.length === 0) return res.status(404).json({ error: 'السجل غير موجود' });
  const record = recordResult.rows[0];
  // Hospital managers can only edit their own hospital's records
  if (user.role === 'hospital' && record.hospital_id !== user.hospitalId) {
    return res.status(403).json({ error: 'لا يمكنك تعديل سجل لمستشفى أخرى' });
  }
  // Branch supervisors can only edit records in their governorate
  if (user.role === 'branch_supervisor' && user.governorate && record.governorate !== user.governorate) {
    return res.status(403).json({ error: 'لا يمكنك تعديل سجل لمحافظة أخرى' });
  }
  const { hospital_id, employee, category, classification, shift, shifts_count, national_id, phone, email, reviewed, review_month } = req.body;
  if (employee !== undefined && !employee) return res.status(400).json({ error: 'اسم الموظف مطلوب' });
  if (category !== undefined && !category) return res.status(400).json({ error: 'الفئه مطلوبة' });
  if (classification !== undefined && !classification) return res.status(400).json({ error: 'التصنيف مطلوب' });
  if (national_id !== undefined && !national_id) return res.status(400).json({ error: 'الرقم القومي مطلوب' });
  const sets = []; const vals = []; let idx = 1;
  if (hospital_id !== undefined) {
    const hosp = await query('SELECT id, name, governorate FROM hospitals WHERE id = $1', [hospital_id]);
    if (hosp.rows.length > 0) {
      sets.push(`hospital_id = $${idx++}`); vals.push(hosp.rows[0].id);
      sets.push(`hospital_name = $${idx++}`); vals.push(hosp.rows[0].name);
      sets.push(`governorate = $${idx++}`); vals.push(hosp.rows[0].governorate);
    }
  }
  if (employee !== undefined) { sets.push(`employee = $${idx++}`); vals.push(employee); }
  if (category !== undefined) { sets.push(`category = $${idx++}`); vals.push(category); }
  if (classification !== undefined) { sets.push(`classification = $${idx++}`); vals.push(classification); }
  if (shift !== undefined) { sets.push(`shift = $${idx++}`); vals.push(shift); }
  if (shifts_count !== undefined) { sets.push(`shifts_count = $${idx++}`); vals.push(shifts_count); }
  if (national_id !== undefined) { sets.push(`national_id = $${idx++}`); vals.push(national_id); }
  if (phone !== undefined) { sets.push(`phone = $${idx++}`); vals.push(phone); }
  if (email !== undefined) { sets.push(`email = $${idx++}`); vals.push(email); }
  if (reviewed !== undefined) { sets.push(`reviewed = $${idx++}`); vals.push(reviewed); }
  if (review_month !== undefined) { sets.push(`review_month = $${idx++}`); vals.push(review_month); }
  sets.push(`updated_at = NOW()`);
  if (sets.length > 1) {
    vals.push(id);
    await query(`UPDATE employee_statements SET ${sets.join(', ')} WHERE id = $${idx}`, vals);
  }
  const updated = await query('SELECT * FROM employee_statements WHERE id = $1', [id]);
  res.json(updated.rows[0]);
});

app.delete('/api/employee-statements/:id', requireAuth(), requirePerm('employees', 'delete'), async (req, res) => {
  const user = req.session.user;
  const id = parseInt(req.params.id);
  const recordResult = await query('SELECT * FROM employee_statements WHERE id = $1', [id]);
  if (recordResult.rows.length === 0) return res.status(404).json({ error: 'السجل غير موجود' });
  const record = recordResult.rows[0];
  // Hospital managers can only delete their own hospital's records
  if (user.role === 'hospital' && record.hospital_id !== user.hospitalId) {
    return res.status(403).json({ error: 'لا يمكنك حذف سجل لمستشفى أخرى' });
  }
  // Branch supervisors can only delete records in their governorate
  if (user.role === 'branch_supervisor' && user.governorate && record.governorate !== user.governorate) {
    return res.status(403).json({ error: 'لا يمكنك حذف سجل لمحافظة أخرى' });
  }
  // Delete related user account
  try {
    const targetUser = await query('SELECT id FROM users WHERE hospital_id = $1 AND name = $2', [record.hospital_id, record.employee]);
    if (targetUser.rows.length > 0) {
      await query('DELETE FROM users WHERE id = $1', [targetUser.rows[0].id]);
    }
  } catch (e) {
    // Don't fail if user deletion fails
  }
  await query('DELETE FROM employee_statements WHERE id = $1', [id]);
  res.json({ ok: true });
});

app.post('/api/employee-statements/track-view', requireAuth(), requirePerm('employees', 'view'), async (req, res) => {
  const user = req.session.user;
  if (!user.hospitalId) return res.json({ ok: true });
  const now = new Date().toISOString();
  // Update the most recent record's updated_at for this hospital
  const existing = await query('SELECT id FROM employee_statements WHERE hospital_id = $1 ORDER BY id DESC LIMIT 1', [user.hospitalId]);
  if (existing.rows.length > 0) {
    await query('UPDATE employee_statements SET updated_at = $1 WHERE id = $2', [now, existing.rows[0].id]);
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
    res.status(500).json({ error: errMsg(e) });
  }
});

// ============== Equipment Management (الأجهزة) =

// Types
app.get('/api/equipment/types', requireAuth(), requirePerm('equipment', 'view'), async (req, res) => {
  const eq = await db.getEquipment();
  res.json(eq.types);
});

app.post('/api/equipment/types', requireAuth(), requirePerm('equipment', 'add'), async (req, res) => {
  const { name, category } = req.body;
  if (!name) return res.status(400).json({ error: 'اسم الجهاز مطلوب' });
  const eq = await db.getEquipment();
  const maxId = eq.types.reduce((m, t) => Math.max(m, t.id), 0);
  const newType = { id: maxId + 1, name: name.trim(), category: category || 'تجميعي' };
  eq.types.push(newType);
  await db.setEquipmentTypes(eq.types);
  res.json(newType);
});

app.put('/api/equipment/types/:id', requireAuth(), requirePerm('equipment', 'edit'), async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, category } = req.body;
  const eq = await db.getEquipment();
  const type = eq.types.find(t => t.id === id);
  if (!type) return res.status(404).json({ error: 'الجهاز غير موجود' });
  if (name) type.name = name.trim();
  if (category) type.category = category;
  await db.setEquipmentTypes(eq.types);
  res.json(type);
});

app.delete('/api/equipment/types/:id', requireAuth(), requirePerm('equipment', 'delete'), async (req, res) => {
  const id = parseInt(req.params.id);
  const eq = await db.getEquipment();
  const idx = eq.types.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'الجهاز غير موجود' });
  eq.types.splice(idx, 1);
  eq.hospitals.forEach(h => { if (h.equipment) delete h.equipment[id]; });
  await db.setEquipmentTypes(eq.types);
  // Also update all hospitals to remove the type reference
  for (const h of eq.hospitals) {
    await db.setEquipmentHospital(h);
  }
  res.json({ ok: true });
});

// Get all equipment data
app.get('/api/equipment', requireAuth(), requirePerm('equipment', 'view'), async (req, res) => {
  const eq = await db.getEquipment();
  const user = req.session.user;
  let hospitals = [...eq.hospitals];
  if (user.role === 'hospital' || user.role === 'hospital_manager') {
    const hospRes = await query('SELECT name FROM hospitals WHERE id = $1', [user.hospitalId]);
    if (hospRes.rows.length > 0) {
      hospitals = hospitals.filter(h => h.name === hospRes.rows[0].name);
    } else {
      hospitals = [];
    }
  } else if (user.role === 'branch_supervisor' && user.governorate) {
    hospitals = hospitals.filter(h => h.governorate === user.governorate);
  }
  res.json({ types: eq.types, hospitals, lastUpdated: eq.lastUpdated });
});

// Get single hospital equipment
app.get('/api/equipment/hospitals/:name', requireAuth(), requirePerm('equipment', 'view'), async (req, res) => {
  const eq = await db.getEquipment();
  const name = req.params.name;
  const entry = eq.hospitals.find(h => h.name === name);
  if (!entry) return res.status(404).json({ error: 'غير موجود' });
  res.json(entry);
});

// Save hospital equipment (upsert)
app.post('/api/equipment/hospitals', requireAuth(), requirePerm('equipment', 'edit'), async (req, res) => {
  const user = req.session.user;
  const { name, governorate, equipment, reviewed, review_month } = req.body;
  if (!name) return res.status(400).json({ error: 'اسم المستشفى مطلوب' });
  if (user.role === 'hospital' || user.role === 'hospital_manager') {
    const hospRes = await query('SELECT name FROM hospitals WHERE id = $1', [user.hospitalId]);
    if (hospRes.rows.length > 0 && hospRes.rows[0].name !== name) {
      return res.status(403).json({ error: 'غير مصرح' });
    }
  }
  const eq = await db.getEquipment();
  let entry = eq.hospitals.find(h => h.name === name);
  if (entry) {
    if (equipment !== undefined) entry.equipment = equipment;
    if (governorate) entry.governorate = governorate;
    if (reviewed !== undefined) entry.reviewed = reviewed;
    if (review_month !== undefined) entry.review_month = review_month;
  } else {
    entry = { name, governorate: governorate || '', equipment: equipment || {}, reviewed: false, review_month: null };
  }
  await db.setEquipmentHospital(entry);
  res.json(entry);
});

// Delete hospital equipment
app.delete('/api/equipment/hospitals/:name', requireAuth(), requirePerm('equipment', 'delete'), async (req, res) => {
  const name = req.params.name;
  await db.deleteEquipmentHospital(name);
  res.json({ ok: true });
});

// Import from Excel (re-runs import-equipment.js logic)
app.post('/api/equipment/import', requireAuth(), requirePerm('equipment', 'add'), async (req, res) => {
  try {
    const XLSX = require('xlsx');
    const eq = await db.getEquipment();
    const src = process.env.EQUIPMENT_FILE || path.join(DATA_DIR, 'اجهزة 26.xlsx');
    if (!fs.existsSync(src)) return res.status(400).json({ error: 'ملف Excel غير موجود: ' + src });
    const wb = XLSX.readFile(src);
    const TYPES = eq.types;
    // Column mapping for equipment sheet (same as import-equipment.js)
    const TYPES_COLS = [
      { typeId: 1, startCol: 7 }, { typeId: 2, startCol: 9 }, { typeId: 3, startCol: 11 },
      { typeId: 4, startCol: 13 }, { typeId: 5, startCol: 15 }, { typeId: 6, startCol: 17 },
      { typeId: 7, startCol: 19 }, { typeId: 8, startCol: 23 }, { typeId: 9, startCol: 25 },
      { typeId: 10, startCol: 29 }, { typeId: 11, startCol: 31 }, { typeId: 12, startCol: 33 },
      { typeId: 13, startCol: 35 }, { typeId: 14, startCol: 37 }, { typeId: 15, startCol: 40 },
      { typeId: 16, startCol: 42 }, { typeId: 17, startCol: 44 }, { typeId: 18, startCol: 46 },
      { typeId: 19, startCol: 48 }, { typeId: 20, startCol: 50 }, { typeId: 21, startCol: 52 },
      { typeId: 22, startCol: 54 },
    ];
    const ws = wb.Sheets['الاجهزة'];
    const raw = XLSX.utils.sheet_to_json(ws, { header: 1 });
    const imported = {};
    for (let r = 4; r < raw.length; r++) {
      const row = raw[r];
      if (!row || !row[1]) continue;
      const governorate = (row[0] || '').toString().trim().replace(/[\s\-]+/g, ' ').trim();
      const name = (row[1] || '').toString().trim().replace(/\s+/g, ' ').trim();
      if (!name) continue;
      const equipment = {};
      TYPES_COLS.forEach(tc => {
        const val1 = row[tc.startCol];
        const val2 = row[tc.startCol + 1];
        if (val1 != null || val2 != null) {
          equipment[tc.typeId] = {
            count: val1 != null && val1 !== '' ? Number(val1) : null,
            status: val2 != null && val2 !== '' ? String(val2).trim() : null,
            capacity: null,
          };
        }
      });
      imported[name] = { governorate, name, equipment };
    }
    // Merge imported data into existing
    for (const [name, data] of Object.entries(imported)) {
      let entry = eq.hospitals.find(h => h.name === name);
      if (entry) {
        Object.entries(data.equipment).forEach(([tid, eqData]) => {
          entry.equipment[tid] = eqData;
        });
      } else {
        eq.hospitals.push(data);
      }
    }
    for (const h of eq.hospitals) {
      await db.setEquipmentHospital(h);
    }
    res.json({ ok: true, count: Object.keys(imported).length, message: '✅ تم استيراد ' + Object.keys(imported).length + ' مستشفى' });
  } catch (e) {
    res.status(500).json({ error: errMsg(e) });
  }
});

// Export to Excel
app.get('/api/equipment/export/xlsx', requireAuth(), requirePerm('equipment', 'export'), async (req, res) => {
  try {
    const XLSX = require('xlsx');
    const eq = await db.getEquipment();
    const wb = XLSX.utils.book_new();
    const types = eq.types;
    const hospitals = eq.hospitals;
    // Header row
    const headers = ['المحافظة', 'اسم بنك الدم'];
    types.forEach(t => { headers.push(t.name + ' (عدد)', t.name + ' (حالة)', t.name + ' (ماركة)', t.name + ' (سعة)'); });
    const rows = [headers];
    // Sort by governorate then name
    const sorted = [...hospitals].sort((a, b) => a.governorate.localeCompare(b.governorate, 'ar') || a.name.localeCompare(b.name, 'ar'));
    function getEqVal(eq, field) {
      if (Array.isArray(eq)) return eq.map(e => e[field] || '').filter(Boolean).join(', ');
      if (eq && typeof eq === 'object') return eq[field] != null ? eq[field] : '';
      return '';
    }
    sorted.forEach(h => {
      const row = [h.governorate, h.name];
      types.forEach(t => {
        const eqEntry = h.equipment[t.id];
        if (eqEntry) {
          row.push(getEqVal(eqEntry, 'count'));
          row.push(getEqVal(eqEntry, 'status'));
          row.push(getEqVal(eqEntry, 'brand'));
          row.push(getEqVal(eqEntry, 'capacity'));
        } else {
          row.push('', '', '', '');
        }
      });
      rows.push(row);
    });
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 14 }, { wch: 22 }];
    for (let i = 0; i < types.length; i++) ws['!cols'].push({ wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 10 });
    XLSX.utils.book_append_sheet(wb, ws, 'الأجهزة');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=equipment.xlsx');
    res.send(buf);
  } catch (e) {
    res.status(500).json({ error: errMsg(e) });
  }
});

// ============== Readiness Sheet (جاهزية بنوك الدم) ==============

// --- Occasions ---
app.get('/api/readiness-occasions', requireAuth(), requirePerm('readiness', 'view'), async (req, res) => {
  const occasions = await db.getReadinessOccasions();
  res.json(occasions);
});

app.post('/api/readiness-occasions', requireAuth(), requirePerm('readiness', 'add'), async (req, res) => {
  const { name, date_from, date_to, day_labels } = req.body;
  if (!name || !date_from || !date_to) return res.status(400).json({ error: 'الاسم والتاريخ مطلوب' });
  const now = new Date().toISOString();
  const result = await query(
    `INSERT INTO readiness_occasions (name, date_from, date_to, day_labels, created_at, updated_at, user_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [name, date_from, date_to, JSON.stringify(day_labels || []), now, now, req.session.user.id]
  );
  const occasion = result.rows[0];
  const allHospitalsResult = await query('SELECT id FROM hospitals');
  const allHospitals = allHospitalsResult.rows || [];
  const msg = `جاهزية بنوك الدم بمناسبة "${name}" من ${date_from} إلى ${date_to} - ${allHospitals.length} بنك دم`;
  await query(
    `INSERT INTO readiness_notifications (occasion_id, occasion_name, message, created_by, created_at, dismissed) VALUES ($1,$2,$3,$4,$5,false)`,
    [occasion.id, name, msg, req.session.user.id, now]
  );
  res.json(occasion);
});

app.put('/api/readiness-occasions/:id', requireAuth(), requirePerm('readiness', 'edit'), async (req, res) => {
  const id = parseInt(req.params.id);
  const occResult = await query('SELECT * FROM readiness_occasions WHERE id = $1', [id]);
  if (occResult.rows.length === 0) return res.status(404).json({ error: 'غير موجود' });
  const { name, date_from, date_to, day_labels } = req.body;
  const sets = []; const vals = []; let idx = 1;
  if (name !== undefined) { sets.push(`name = $${idx++}`); vals.push(name); }
  if (date_from !== undefined) { sets.push(`date_from = $${idx++}`); vals.push(date_from); }
  if (date_to !== undefined) { sets.push(`date_to = $${idx++}`); vals.push(date_to); }
  if (day_labels !== undefined) { sets.push(`day_labels = $${idx++}`); vals.push(JSON.stringify(day_labels)); }
  sets.push(`updated_at = NOW()`);
  vals.push(id);
  await query(`UPDATE readiness_occasions SET ${sets.join(', ')} WHERE id = $${idx}`, vals);
  const updated = await query('SELECT * FROM readiness_occasions WHERE id = $1', [id]);
  res.json(updated.rows[0]);
});

app.delete('/api/readiness-occasions/:id', requireAuth(), requirePerm('readiness', 'delete'), async (req, res) => {
  const id = parseInt(req.params.id);
  await query('DELETE FROM readiness_reports WHERE occasion_id = $1', [id]);
  await query('DELETE FROM readiness_notifications WHERE occasion_id = $1', [id]);
  await query('DELETE FROM readiness_occasions WHERE id = $1', [id]);
  res.json({ ok: true });
});

// --- Reports ---
app.get('/api/readiness-reports', requireAuth(), requirePerm('readiness', 'view'), async (req, res) => {
  const user = req.session.user;
  let sql = 'SELECT * FROM readiness_reports WHERE 1=1';
  const params = [];
  if (req.query.occasion_id) { sql += ` AND occasion_id = $${params.length + 1}`; params.push(parseInt(req.query.occasion_id)); }
  if (req.query.hospital_id) { sql += ` AND hospital_id = $${params.length + 1}`; params.push(parseInt(req.query.hospital_id)); }
  if (user.role === 'hospital') { sql += ` AND hospital_id = $${params.length + 1}`; params.push(user.hospitalId); }
  else if (user.role === 'branch_supervisor' && user.governorate) { sql += ` AND governorate = $${params.length + 1}`; params.push(user.governorate); }
  sql += ' ORDER BY id DESC';
  const result = await query(sql, params);
  result.rows.forEach(r => { if (r.staff_data != null && Array.isArray(r.staff_data)) { r.staff_data = JSON.stringify(r.staff_data); } else if (r.staff_data == null) { r.staff_data = '[]'; } });
  res.json(result.rows);
});

app.post('/api/readiness-reports', requireAuth(), requirePerm('readiness', 'add'), async (req, res) => {
  const user = req.session.user;
  const { occasion_id, hospital_id, hospital_name, governorate, staff_data, stock, shortage, maintenance, breakdowns, consumables, correction, notes_manager, notes_branch, notes_authority } = req.body;
  if (!occasion_id || !hospital_id) return res.status(400).json({ error: 'المناسبة والمستشفى مطلوبان' });
  if (user.role === 'hospital' && user.hospitalId !== hospital_id) return res.status(403).json({ error: 'غير مصرح' });
  const existing = await query('SELECT id FROM readiness_reports WHERE occasion_id = $1 AND hospital_id = $2', [occasion_id, hospital_id]);
  if (existing.rows.length > 0) return res.status(400).json({ error: 'يوجد تقرير جاهزية مسبق لهذا المستشفى في هذه المناسبة' });
  const result = await query(
    `INSERT INTO readiness_reports (occasion_id, hospital_id, hospital_name, governorate, staff_data, stock, shortage, maintenance, breakdowns, consumables, correction, notes_manager, notes_branch, notes_authority, created_by, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW()) RETURNING *`,
    [occasion_id, hospital_id, hospital_name || '', governorate || '', staff_data || [],
     stock || '', shortage || '', maintenance || '', breakdowns || '', consumables || '', correction || '',
     notes_manager || '', notes_branch || '', notes_authority || '', user.id]
  );
  const report = result.rows[0];
  if (report && report.staff_data != null && Array.isArray(report.staff_data)) { report.staff_data = JSON.stringify(report.staff_data); }
  const occReports = await query('SELECT hospital_id FROM readiness_reports WHERE occasion_id = $1', [occasion_id]);
  const allHospitals = await query('SELECT id FROM hospitals');
  const reportHospIds = new Set(occReports.rows.map(r => r.hospital_id));
  const missing = allHospitals.rows.filter(h => !reportHospIds.has(h.id));
  if (missing.length === 0) {
    await query('UPDATE readiness_notifications SET dismissed = true WHERE occasion_id = $1', [occasion_id]);
  }
  res.json(report);
});

app.put('/api/readiness-reports/:id', requireAuth(), requirePerm('readiness', 'edit'), async (req, res) => {
  const user = req.session.user;
  const id = parseInt(req.params.id);
  const reportResult = await query('SELECT * FROM readiness_reports WHERE id = $1', [id]);
  if (reportResult.rows.length === 0) return res.status(404).json({ error: 'غير موجود' });
  if (user.role === 'hospital' && reportResult.rows[0].hospital_id !== user.hospitalId) return res.status(403).json({ error: 'غير مصرح' });
  const { staff_data, stock, shortage, maintenance, breakdowns, consumables, correction, notes_manager, notes_branch, notes_authority } = req.body;
  const sets = []; const vals = []; let idx = 1;
  if (staff_data !== undefined) { sets.push(`staff_data = $${idx++}`); vals.push(staff_data); }
  if (stock !== undefined) { sets.push(`stock = $${idx++}`); vals.push(stock); }
  if (shortage !== undefined) { sets.push(`shortage = $${idx++}`); vals.push(shortage); }
  if (maintenance !== undefined) { sets.push(`maintenance = $${idx++}`); vals.push(maintenance); }
  if (breakdowns !== undefined) { sets.push(`breakdowns = $${idx++}`); vals.push(breakdowns); }
  if (consumables !== undefined) { sets.push(`consumables = $${idx++}`); vals.push(consumables); }
  if (correction !== undefined) { sets.push(`correction = $${idx++}`); vals.push(correction); }
  if (notes_manager !== undefined) { sets.push(`notes_manager = $${idx++}`); vals.push(notes_manager); }
  if (notes_branch !== undefined) { sets.push(`notes_branch = $${idx++}`); vals.push(notes_branch); }
  if (notes_authority !== undefined) { sets.push(`notes_authority = $${idx++}`); vals.push(notes_authority); }
  if (sets.length > 0) {
    vals.push(id);
    await query(`UPDATE readiness_reports SET ${sets.join(', ')} WHERE id = $${idx}`, vals);
  }
  const updated = await query('SELECT * FROM readiness_reports WHERE id = $1', [id]);
  const row = updated.rows[0];
  if (row && row.staff_data != null && Array.isArray(row.staff_data)) { row.staff_data = JSON.stringify(row.staff_data); }
  res.json(row);
});

app.delete('/api/readiness-reports/:id', requireAuth(), requirePerm('readiness', 'delete'), async (req, res) => {
  const user = req.session.user;
  const id = parseInt(req.params.id);
  const reportResult = await query('SELECT * FROM readiness_reports WHERE id = $1', [id]);
  if (reportResult.rows.length === 0) return res.status(404).json({ error: 'غير موجود' });
  if (user.role === 'hospital' && reportResult.rows[0].hospital_id !== user.hospitalId) return res.status(403).json({ error: 'غير مصرح' });
  await query('DELETE FROM readiness_reports WHERE id = $1', [id]);
  res.json({ ok: true });
});

// --- Notifications ---
app.get('/api/readiness-notifications', requireAuth(), requirePerm('readiness', 'view'), async (req, res) => {
  await query(`DELETE FROM readiness_notifications WHERE occasion_id NOT IN (SELECT id FROM readiness_occasions)`);
  const activeNotifs = await query('SELECT * FROM readiness_notifications WHERE dismissed = false ORDER BY id DESC');
  const rows = [];
  for (const n of activeNotifs.rows) {
    const occResult = await query('SELECT * FROM readiness_occasions WHERE id = $1', [n.occasion_id]);
    if (occResult.rows.length === 0) continue;
    const occasion = occResult.rows[0];
    const occReports = await query('SELECT hospital_id FROM readiness_reports WHERE occasion_id = $1', [n.occasion_id]);
    const allHospitals = await query('SELECT id, name, governorate FROM hospitals');
    const reportHospIds = new Set(occReports.rows.map(r => r.hospital_id));
    const missing = allHospitals.rows.filter(h => !reportHospIds.has(h.id));
    if (missing.length === 0) {
      await query('UPDATE readiness_notifications SET dismissed = true WHERE id = $1', [n.id]);
    } else {
      n.message = `جاهزية بنوك الدم بمناسبة "${occasion.name}" من ${occasion.date_from} إلى ${occasion.date_to} - ${missing.length} بنك دم لم يدخل الجاهزية`;
      n._missingHospitals = missing.map(h => ({name: h.name, gov: h.governorate}));
      rows.push(n);
    }
  }
  res.json(rows);
});

app.post('/api/readiness-notifications/dismiss/:id', requireAuth(), requirePerm('readiness', 'view'), async (req, res) => {
  const id = parseInt(req.params.id);
  await query('UPDATE readiness_notifications SET dismissed = true WHERE id = $1', [id]);
  res.json({ ok: true });
});

// --- Excel Export ---
app.get('/api/readiness-export/xlsx', requireAuth(), requirePerm('readiness', 'export'), async (req, res) => {
  try {
    const XLSX = require('xlsx');
    const wb = XLSX.utils.book_new();
    const occasionsResult = await query('SELECT * FROM readiness_occasions ORDER BY id DESC');
    const occasions = occasionsResult.rows || [];
    const hospitalsResult = await query('SELECT * FROM hospitals ORDER BY governorate, name');
    const hospitals = hospitalsResult.rows || [];
    if (occasions.length === 0) return res.status(400).json({ error: 'لا توجد مناسبات للتصدير' });
    // Pre-fetch all readiness reports
    const allReportsResult = await query('SELECT * FROM readiness_reports');
    const allReports = allReportsResult.rows || [];
    occasions.forEach(occ => {
      const reports = allReports.filter(r => r.occasion_id === occ.id);
      const sheetData = [];
      const fromDate = new Date(occ.date_from);
      const toDate = new Date(occ.date_to);
      const labels = occ.day_labels || [];
      // Generate day labels from date range if not provided
      const dayNames = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
      const days = [];
      let cur = new Date(fromDate);
      while (cur <= toDate) {
        const dStr = cur.toISOString().slice(0,10);
        const dn = dayNames[cur.getDay()];
        const label = labels[days.length] || `${dn} ${dStr}`;
        days.push(label);
        cur.setDate(cur.getDate() + 1);
      }
      const dayCount = days.length;
      // Build header — matching Excel template
      const row1 = Array(3 + dayCount + 12).fill('');
      row1[0] = 'المحافظة';
      row1[1] = 'اسم بنك الدم';
      row1[2] = 'القوة البشريه المتواجده فعليا';
      const stockIdx = 3 + dayCount;
      row1[stockIdx] = 'الرصيد';
      row1[stockIdx+1] = 'الاجهزه الطبية';
      row1[stockIdx+3] = 'المستهلكات';
      row1[stockIdx+4] = 'الاستعاضة لكل بنك';
      row1[stockIdx+5] = 'ملاحظات مدير بنك الدم';
      row1[stockIdx+6] = 'تعليق مشرف الفرع';
      row1[stockIdx+7] = 'تعليق مشرف الهيئة';
      sheetData.push(row1);
      const row2 = Array(3 + dayCount + 12).fill('');
      row2[0] = ''; row2[1] = '';
      row2[2] = 'الاسم';
      row2[3] = 'رقم التليفون';
      for (let d = 0; d < dayCount; d++) row2[4 + d] = days[d];
      row2[stockIdx] = '';
      row2[stockIdx+1] = 'مراجعة الصيانة';
      row2[stockIdx+2] = 'الاعطال';
      row2[stockIdx+3] = '';
      row2[stockIdx+4] = '';
      row2[stockIdx+5] = '';
      row2[stockIdx+6] = '';
      row2[stockIdx+7] = '';
      sheetData.push(row2);
      // Data: expand each hospital into multiple staff rows
      const govSorted = [...new Set(hospitals.map(h => h.governorate))].sort((a,b) => a.localeCompare(b, 'ar'));
      govSorted.forEach(gov => {
        const govHospitals = hospitals.filter(h => h.governorate === gov);
        govHospitals.forEach(h => {
          const r = reports.find(rep => rep.hospital_id === h.id);
          const raw = r ? (r.staff_data || []) : []; const staff = Array.isArray(raw) ? raw : (typeof raw === 'string' ? (() => { try { return JSON.parse(raw); } catch(e) { return []; } })() : []);
          if (staff.length === 0) {
            // Empty row
            const row = Array(3 + dayCount + 12).fill('');
            row[0] = gov; row[1] = h.name;
            sheetData.push(row);
          } else {
            staff.forEach((s, si) => {
              const row = Array(3 + dayCount + 12).fill('');
              row[0] = si === 0 ? gov : '';
              row[1] = si === 0 ? h.name : '';
              row[2] = s.name || '';
              row[3] = s.phone || '';
              for (let d = 0; d < dayCount; d++) {
                row[4 + d] = (s.shifts && s.shifts[String(d)]) || '';
              }
              if (si === 0) {
                row[stockIdx] = r ? (r.stock || '') : '';
                row[stockIdx+1] = r ? (r.maintenance || '') : '';
                row[stockIdx+2] = r ? (r.breakdowns || '') : '';
                row[stockIdx+3] = r ? (r.consumables || '') : '';
                row[stockIdx+4] = r ? (r.correction || '') : '';
                row[stockIdx+5] = r ? (r.notes_manager || '') : '';
                row[stockIdx+6] = r ? (r.notes_branch || '') : '';
                row[stockIdx+7] = r ? (r.notes_authority || '') : '';
              }
              sheetData.push(row);
            });
          }
        });
      });
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      ws['!cols'] = [{ wch: 16 }, { wch: 22 }, { wch: 20 }, { wch: 14 }];
      for (let d = 0; d < dayCount; d++) ws['!cols'].push({ wch: 14 });
      for (let i = 0; i < 8; i++) ws['!cols'].push({ wch: 18 });
      XLSX.utils.book_append_sheet(wb, ws, occ.name.slice(0, 31));
    });
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=readiness.xlsx');
    res.send(buf);
  } catch (e) {
    res.status(500).json({ error: errMsg(e) });
  }
});

// ============== Sync & Google Drive Module ==============

const DRIVE_CONFIG_PATH = path.join(DATA_DIR, 'drive-config.json');
const DRIVE_TOKENS_PATH = path.join(DATA_DIR, 'drive-tokens.json');

function loadDriveConfig() {
  try { return JSON.parse(fs.readFileSync(DRIVE_CONFIG_PATH, 'utf8')); } catch { return null; }
}
function loadDriveTokens() {
  try { return JSON.parse(fs.readFileSync(DRIVE_TOKENS_PATH, 'utf8')); } catch { return null; }
}
function saveDriveTokens(tokens) {
  fs.writeFileSync(DRIVE_TOKENS_PATH, JSON.stringify(tokens, null, 2), 'utf8');
}
function createOAuth2Client() {
  const { google } = require('googleapis');
  const config = loadDriveConfig();
  if (!config || !config.client_id || !config.client_secret) return null;
  const redirect = config.redirect_uri || 'http://localhost:3001/api/sync/drive/callback';
  return new google.auth.OAuth2(config.client_id, config.client_secret, redirect);
}
function getDriveDbFileName() {
  return 'blood-bank-db.json';
}

// GET /api/sync/status
app.get('/api/sync/status', requireAuth(), async (req, res) => {
  const dbPath = path.join(DATA_DIR, 'db.json');
  let fileSize = 0, fileDate = null;
  try {
    const stat = fs.statSync(dbPath);
    fileSize = stat.size;
    fileDate = stat.mtime;
  } catch {}
  const tokens = loadDriveTokens();
  const config = loadDriveConfig();
  res.json({
    deviceName: require('os').hostname(),
    fileSize,
    fileDate,
    driveConnected: !!(tokens && tokens.access_token),
    driveConfigured: !!(config && config.client_id)
  });
});

// GET /api/sync/export
app.get('/api/sync/export', requireAuth(), async (req, res) => {
  if (isPG) {
    try {
      // Export from PostgreSQL — query all tables
      const tables = [
        'users', 'hospitals', 'governorates', 'hospital_types',
        'daily_stock', 'daily_reports', 'daily_statements',
        'monthly_storage', 'monthly_aggregate', 'monthly_indicators',
        'monthly_consumption', 'monthly_big_indicators', 'monthly_small_indicators',
        'consumption', 'archives', 'employee_statements',
        'equipment_types', 'readiness_occasions', 'readiness_reports',
        'readiness_notifications', 'role_perms', 'strategic_settings',
        'strategic_reserves', 'equipment_hospitals'
      ];
      const result = {};
      for (const table of tables) {
        const r = await db.query(`SELECT * FROM ${table} ORDER BY id`);
        result[table] = r.rows || [];
      }
      // Parse JSONB fields
      const jsonbTables = ['daily_reports','monthly_storage','monthly_aggregate','monthly_indicators','monthly_consumption','monthly_big_indicators','monthly_small_indicators','archives','readiness_occasions','role_perms','strategic_reserves'];
      for (const t of jsonbTables) {
        if (result[t]) {
          result[t] = result[t].map(row => {
            const r = { ...row };
            for (const key of Object.keys(r)) {
              if (typeof r[key] === 'string' && (r[key].startsWith('{') || r[key].startsWith('['))) {
                try { r[key] = JSON.parse(r[key]); } catch(e) { /* keep as string */ }
              }
            }
            return r;
          });
        }
      }
      // Parse equipment JSONB
      if (result.equipment_hospitals) {
        result.equipment_hospitals = result.equipment_hospitals.map(row => {
          const r = { ...row };
          if (typeof r.equipment === 'string') { try { r.equipment = JSON.parse(r.equipment); } catch(e) { r.equipment = {}; } }
          return r;
        });
      }
      // App config
      const cfgRows = await db.query('SELECT key, value FROM app_config');
      result.app_config = {};
      for (const row of cfgRows.rows || []) {
        let val = row.value;
        if (typeof val === 'string') { try { val = JSON.parse(val); } catch(e) { /* keep */ } }
        result.app_config[row.key] = val;
      }
      // Donors & Donations (may not exist as tables yet)
      try {
        const donors = await db.query('SELECT * FROM donors ORDER BY id');
        result.donors = donors.rows || [];
        const donations = await db.query('SELECT * FROM donations ORDER BY id');
        result.donations = donations.rows || [];
      } catch(e) { result.donors = []; result.donations = []; }
      // Counters
      result._counters = {};
      for (const table of Object.keys(result)) {
        if (Array.isArray(result[table]) && result[table].length > 0) {
          const maxId = Math.max(...result[table].map(r => parseInt(r.id) || 0));
          result._counters[table] = maxId + 1;
        }
      }
      res.json({ data: result });
    } catch (e) {
      res.status(500).json({ error: errMsg(e) });
    }
  } else {
    const dbPath = path.join(DATA_DIR, 'db.json');
    try {
      const data = fs.readFileSync(dbPath, 'utf8');
      res.json({ data: JSON.parse(data) });
    } catch (e) {
      res.status(500).json({ error: errMsg(e) });
    }
  }
});

// POST /api/sync/import
app.post('/api/sync/import', requireAuth(), async (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: 'البيانات مطلوبة' });
  try {
    if (isPG) {
      const tables = ['users','hospitals','governorates','hospital_types','daily_stock','daily_reports','daily_statements','monthly_storage','monthly_aggregate','monthly_indicators','monthly_consumption','monthly_big_indicators','monthly_small_indicators','consumption','archives','employee_statements','equipment_types','readiness_occasions','readiness_reports','readiness_notifications','role_perms','strategic_settings','strategic_reserves','equipment_hospitals'];
      for (const table of tables) {
        const rows = data[table];
        if (Array.isArray(rows) && rows.length > 0) {
          await db.query(`DELETE FROM ${table}`);
          const batchSize = 50;
          for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize);
            const cols = Object.keys(batch[0]).filter(c => c !== '_counters');
            const placeholders = batch.map((_, ri) => `(${cols.map((_, ci) => `$${ri * cols.length + ci + 1}`).join(',')})`).join(',');
            const values = batch.flatMap(r => cols.map(c => r[c] !== undefined && r[c] !== null ? (typeof r[c] === 'object' ? JSON.stringify(r[c]) : r[c]) : null));
            const colStr = cols.map(c => `"${c}"`).join(',');
            await db.query(`INSERT INTO "${table}" (${colStr}) VALUES ${placeholders} ON CONFLICT DO NOTHING`, values);
          }
        }
      }
      // App config
      const ac = data.app_config;
      if (ac && typeof ac === 'object') {
        for (const [key, value] of Object.entries(ac)) {
          await db.query('INSERT INTO app_config (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO UPDATE SET value = $2::jsonb', [key, JSON.stringify(value)]);
        }
      }
      // Reset sequences
      for (const table of tables) {
        const ids = data[table]?.filter(r => r.id).map(r => parseInt(r.id));
        if (ids && ids.length > 0) {
          const maxId = Math.max(...ids);
          try { await db.query(`SELECT setval('${table}_id_seq', ${maxId}, true)`); } catch(e) { /* ignore */ }
        }
      }
    } else {
      const dbPath = path.join(DATA_DIR, 'db.json');
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
      await db.reload();
    }
    res.json({ ok: true, message: '✅ تم استيراد البيانات بنجاح' });
  } catch (e) {
    res.status(500).json({ error: errMsg(e) });
  }
});

// GET /api/sync/drive/auth-url
app.get('/api/sync/drive/auth-url', requireAuth(), async (req, res) => {
  try {
    const oauth2Client = createOAuth2Client();
    if (!oauth2Client) return res.status(400).json({ error: 'لم يتم تكوين Google Drive. الرجاء إضافة client_id و client_secret في data/drive-config.json' });
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.file']
    });
    res.json({ url });
  } catch (e) {
    res.status(500).json({ error: errMsg(e) });
  }
});

// POST /api/sync/drive/callback
app.post('/api/sync/drive/callback', requireAuth(), async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'رمز المصادقة مطلوب' });
  try {
    const oauth2Client = createOAuth2Client();
    if (!oauth2Client) return res.status(400).json({ error: 'لم يتم تكوين Google Drive' });
    const { tokens } = await oauth2Client.getToken(code);
    saveDriveTokens(tokens);
    res.json({ ok: true, message: '✅ تم ربط Google Drive بنجاح' });
  } catch (e) {
    res.status(500).json({ error: errMsg(e) });
  }
});

// POST /api/sync/drive/upload
app.post('/api/sync/drive/upload', requireAuth(), async (req, res) => {
  try {
    const tokens = loadDriveTokens();
    if (!tokens) return res.status(400).json({ error: 'لم يتم ربط Google Drive. الرجاء المصادقة أولاً' });
    const oauth2Client = createOAuth2Client();
    if (!oauth2Client) return res.status(400).json({ error: 'لم يتم تكوين Google Drive' });
    oauth2Client.setCredentials(tokens);

    const { google } = require('googleapis');
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const dbPath = path.join(DATA_DIR, 'db.json');
    const fileContent = fs.readFileSync(dbPath, 'utf8');
    const fileName = getDriveDbFileName();

    // Search for existing file
    const listRes = await drive.files.list({
      q: `name='${fileName}' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    const media = { mimeType: 'application/json', body: fs.createReadStream(dbPath) };

    if (listRes.data.files.length > 0) {
      const fileId = listRes.data.files[0].id;
      await drive.files.update({ fileId, media });
    } else {
      await drive.files.create({
        requestBody: { name: fileName, mimeType: 'application/json' },
        media
      });
    }

    res.json({ ok: true, message: '✅ تم رفع البيانات إلى Google Drive' });
  } catch (e) {
    res.status(500).json({ error: errMsg(e) });
  }
});

// GET /api/sync/drive/download
app.get('/api/sync/drive/download', requireAuth(), async (req, res) => {
  try {
    const tokens = loadDriveTokens();
    if (!tokens) return res.status(400).json({ error: 'لم يتم ربط Google Drive' });
    const oauth2Client = createOAuth2Client();
    if (!oauth2Client) return res.status(400).json({ error: 'لم يتم تكوين Google Drive' });
    oauth2Client.setCredentials(tokens);

    const { google } = require('googleapis');
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const fileName = getDriveDbFileName();

    const listRes = await drive.files.list({
      q: `name='${fileName}' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    if (listRes.data.files.length === 0) {
      return res.status(404).json({ error: 'لا توجد نسخة سابقة في Google Drive' });
    }

    const fileId = listRes.data.files[0].id;
    const fileRes = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'json' });

    const data = fileRes.data;
    const dbPath = path.join(DATA_DIR, 'db.json');
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    await db.reload();

    res.json({ ok: true, message: '✅ تم تنزيل البيانات من Google Drive', recordCount: Object.keys(data).length });
  } catch (e) {
    res.status(500).json({ error: errMsg(e) });
  }
});

// ============== Dashboard API ==============




// ============== Auto Backup (نسخ احتياطي تلقائي كل 24 ساعة) ==============

const AUTO_BACKUP_INTERVAL = 24 * 60 * 60 * 1000;
let lastAutoBackupTime = null;
let autoBackupTimer = null;

async function performAutoBackup() {
  try {
    const tokens = loadDriveTokens();
    if (!tokens || !tokens.access_token) {
      console.log('⏰ Auto backup skipped: Drive not connected');
      return;
    }

    // 1. Local backup
    const backupDir = path.join(DATA_DIR, 'auto-backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    const dateStamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupPath = path.join(backupDir, `backup-${dateStamp}.json`);
    fs.copyFileSync(path.join(DATA_DIR, 'db.json'), backupPath);

    // 2. Upload to Drive
    const oauth2Client = createOAuth2Client();
    if (!oauth2Client) return;
    oauth2Client.setCredentials(tokens);

    const { google } = require('googleapis');
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const dbPath = path.join(DATA_DIR, 'db.json');
    const fileName = getDriveDbFileName();

    const listRes = await drive.files.list({
      q: `name='${fileName}' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    const media = { mimeType: 'application/json', body: fs.createReadStream(dbPath) };

    if (listRes.data.files.length > 0) {
      const fileId = listRes.data.files[0].id;
      await drive.files.update({ fileId, media });
    } else {
      await drive.files.create({
        requestBody: { name: fileName, mimeType: 'application/json' },
        media
      });
    }

    lastAutoBackupTime = new Date().toISOString();
    console.log('✅ Auto backup completed: ' + dateStamp);
  } catch (e) {
    console.error('❌ Auto backup failed: ' + e.message);
  }
}

function startAutoBackup() {
  // First backup after 1 minute (give server time to settle)
  setTimeout(() => {
    performAutoBackup();
    // Then every 24 hours
    autoBackupTimer = setInterval(performAutoBackup, AUTO_BACKUP_INTERVAL);
    console.log('⏰ Auto backup scheduled: every 24 hours');
  }, 60000);
}

// GET /api/sync/auto-backup-status
app.get('/api/sync/auto-backup-status', requireAuth(), async (req, res) => {
  const backupDir = path.join(DATA_DIR, 'auto-backups');
  let backupCount = 0;
  try {
    if (fs.existsSync(backupDir)) {
      backupCount = fs.readdirSync(backupDir).length;
    }
  } catch {}
  res.json({
    lastBackup: lastAutoBackupTime,
    backupCount,
    interval: '24 ساعة',
    enabled: !!loadDriveTokens()
  });
});

// Health check for cloud deployment
app.get('/health', (req, res) => {
  let dbSize = 0;
  try { dbSize = fs.statSync(path.join(DATA_DIR, 'db.json')).size; } catch {}
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    uptime: process.uptime(),
    mode: db.mode || 'json',
    dbSizeBytes: dbSize,
    memory: process.memoryUsage(),
    node: process.version,
    platform: process.platform
  });
});

// CSP violation reporting endpoint (no auth — just logs)
app.post('/api/csp-violation', (req, res) => {
  const report = req.body ? (req.body['csp-report'] || req.body) : null;
  if (report) console.warn('[CSP]', JSON.stringify(report).slice(0, 500));
  res.status(204).end();
});

// ============== Indicator Analysis (تحليل مؤشرات الأداء) ==============
app.get('/api/indicator-analysis', requireAuth(), requirePerm('indicator_analysis', 'view'), async (req, res) => {
  try {
    const { year1, months1, year2, months2, governorate, hospitalId } = req.query;
    if (!year1 || !months1 || !year2 || !months2) return res.status(400).json({ error: 'يجب تحديد الفترتين' });
    const m1 = months1.split(',').map(Number);
    const m2 = months2.split(',').map(Number);
    const y1 = parseInt(year1), y2 = parseInt(year2);

    async function fetchIndicator(table, year, months) {
      let sql = `SELECT mi.hospital_id, mi.data, h.name as hospital_name, h.governorate
        FROM ${table} mi JOIN hospitals h ON h.id = mi.hospital_id
        WHERE mi.year = $1 AND mi.month = ANY($2)`;
      const params = [year, months];
      if (governorate) { sql += ` AND h.governorate = $3`; params.push(governorate); }
      if (hospitalId) { sql += ` AND mi.hospital_id = $4`; params.push(parseInt(hospitalId)); }
      sql += ' ORDER BY h.governorate, h.name, mi.month';
      return (await query(sql, params)).rows;
    }

    function aggregateByHospital(rows) {
      const map = {};
      for (const r of rows) {
        const hid = r.hospital_id;
        if (!map[hid]) map[hid] = { hospital_id: hid, hospital_name: r.hospital_name, governorate: r.governorate, records: [], data: {} };
        map[hid].records.push(r);
      }
      for (const hid of Object.keys(map)) {
        const h = map[hid];
        const agg = {};
        for (const r of h.records) {
          const d = typeof r.data === 'string' ? JSON.parse(r.data) : (r.data || {});
          for (const [k, v] of Object.entries(d)) {
            if (typeof v === 'number') agg[k] = (agg[k] || 0) + v;
            else if (!agg[k]) agg[k] = v;
          }
        }
        h.data = agg;
        h.monthCount = h.records.length;
      }
      return Object.values(map);
    }

    const [bigP1, bigP2, smallP1, smallP2] = await Promise.all([
      fetchIndicator('monthly_big_indicators', y1, m1),
      fetchIndicator('monthly_big_indicators', y2, m2),
      fetchIndicator('monthly_small_indicators', y1, m1),
      fetchIndicator('monthly_small_indicators', y2, m2)
    ]);

    res.json({
      big: { period1: aggregateByHospital(bigP1), period2: aggregateByHospital(bigP2) },
      small: { period1: aggregateByHospital(smallP1), period2: aggregateByHospital(smallP2) }
    });
  } catch (err) {
    console.error('indicator-analysis error:', err);
    res.status(500).json({ error: errMsg(err) });
  }
});

// Catch-all — serve index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(BASE_DIR, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: errMsg(err) });
});

// Global error handlers (prevent crash on unhandled errors)
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.message);
});
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
  process.exit(1);
});

app.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  const isCloud = !!process.env.DATA_DIR || !!process.env.RENDER;
  console.log(`✅ Blood Bank Server running on port ${PORT}`);
  console.log(`   Mode: ${isCloud ? '☁️ Cloud (persistent disk)' : isPG ? 'PostgreSQL (production)' : '💻 Local (JSON file)'}`);
  if (isCloud) {
    console.log(`   🌍 متاح للجميع على الرابط أعلاه (موبايل/كمبيوتر/تابلت)`);
    console.log(`   ⚡ أي جهاز في العالم يقدر يستخدم النظام`);
  } else {
    console.log(`   📱 افتح http://${ip}:${PORT} من أي جهاز في نفس الشبكة`);
  }
  // Start auto-backup scheduler
  startAutoBackup();
});

} // end startServer()

startServer().catch(err => { console.error('Failed to start server:', err); process.exit(1); });

