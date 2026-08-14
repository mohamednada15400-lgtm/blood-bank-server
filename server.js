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
const PORT = process.env.PORT || process.env.ALWAYSDATA_HTTPD_PORT || 3001;
const HOST = process.env.ALWAYSDATA_HTTPD_IP || '0.0.0.0';
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

// Mirror console output to DATA_DIR/server.log so cloud crashes are diagnosable
// even when the platform log stream is unavailable.
(function bootLogMirror() {
  const file = path.join(DATA_DIR, 'server.log');
  const ts = () => new Date().toISOString();
  try { fs.appendFileSync(file, ts() + ' [BOOT] server.js loading\n', 'utf8'); } catch {}
  ['log', 'warn', 'error'].forEach((m) => {
    const orig = console[m].bind(console);
    console[m] = (...args) => {
      try { fs.appendFileSync(file, ts() + ' [' + m.toUpperCase() + '] ' + args.map(String).join(' ') + '\n', 'utf8'); } catch {}
      orig(...args);
    };
  });
})();
function loadOrCreateSecret() {
  // Persist a random secret in the writable data dir so sessions survive restarts
  // without shipping a hardcoded fallback in source.
  const file = path.join(DATA_DIR, '.session-secret');
  try {
    if (fs.existsSync(file)) {
      const s = fs.readFileSync(file, 'utf8').trim();
      if (s.length >= 32) return s;
    }
    const fresh = crypto.randomBytes(32).toString('hex');
    try { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(file, fresh, { encoding: 'utf8', mode: 0o600 }); } catch {}
    return fresh;
  } catch {
    return crypto.randomBytes(32).toString('hex');
  }
}
const SESSION_SECRET = process.env.SESSION_SECRET || loadOrCreateSecret();
// Consistent error sanitization: secure by default — hide details unless SHOW_ERROR_DETAILS=true
const showError = process.env.SHOW_ERROR_DETAILS === 'true';
function errMsg(e) { return showError ? e.message : 'خطأ في الخادم'; }
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
const FormulaEngine = require('./public/js/formula.js');
const IndicatorDefs = require('./public/js/indicator-defs.js');
let query;

// ============== Indicator Columns (العمليات الحسابية) ==============
let FORMULA_KEYS = new Set();

async function refreshFormulaKeys() {
  try {
    const rows = await db.query("SELECT col_key FROM indicator_columns WHERE formula = 1");
    FORMULA_KEYS = new Set(rows.rows.map(r => r.col_key));
  } catch (e) {
    console.error('refreshFormulaKeys error:', e.message);
  }
}

function normalizeIndicatorCol(raw) {
  return {
    id: raw.id,
    category: raw.category,
    key: raw.col_key,
    label: raw.label,
    ord: raw.ord || 0,
    enabled: raw.enabled === 1 || raw.enabled === true ? 1 : 0,
    static: raw.static === 1 || raw.static === true ? 1 : 0,
    formula: raw.formula === 1 || raw.formula === true ? 1 : 0,
    formula_expr: raw.formula_expr || '',
    unit: raw.unit || '',
    target: raw.target || '',
    group: raw.grp || '',
    sg: raw.sg || '',
    ssg: raw.ssg || '',
    cls: raw.cls || ''
  };
}

async function getIndicatorColumns(category) {
  const rows = await db.query('SELECT * FROM indicator_columns WHERE category = $1 ORDER BY ord ASC, id ASC', [category]);
  return rows.rows.map(normalizeIndicatorCol);
}

async function ensureIndicatorColumns() {
  try {
    const count = await db.query('SELECT COUNT(*) as cnt FROM indicator_columns');
    if (count.rows.length > 0 && parseInt(count.rows[0].cnt) > 0) return;
    const defs = [
      ...IndicatorDefs.DEFAULT_BIG_DEFS.map((c, i) => Object.assign({}, c, { category: 'big', ord: i })),
      ...IndicatorDefs.DEFAULT_SMALL_DEFS.map((c, i) => Object.assign({}, c, { category: 'small', ord: i }))
    ];
    let added = 0;
    for (const d of defs) {
      await db.query(
        'INSERT INTO indicator_columns (category, col_key, label, ord, enabled, static, formula, formula_expr, unit, target, grp, sg, ssg, cls) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)',
        [d.category, d.key, d.label, d.ord, d.enabled === 1 || d.enabled === true ? 1 : 0, d.static === 1 || d.static === true ? 1 : 0, d.formula ? 1 : 0, d.formula_expr || '', d.unit || '', d.target || '', d.group || '', d.sg || '', d.ssg || '', d.cls || '']
      );
      added++;
    }
    console.log(`✅ Seeded ${added} indicator columns`);
  } catch (e) {
    console.error('ensureIndicatorColumns error:', e.message);
  }
}

async function startServer() {
  await db.init();
  await restoreFromDrive(); // pull latest data from Drive before anything else
  await ensureIndicatorColumns();
  await refreshFormulaKeys();
  const isPG = db.mode === 'pg';

  // Session store: Redis → PostgreSQL → memorystore (priority order)
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
  query = async (text, params) => { return db.query(text, params); };
  
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
    if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).json({ error: 'ليس لديك صلاحية' });
    next();
  };
}

app.get('/api/users', requireAuth(), async (req, res) => {
  const user = req.session.user;
  let rows;
  if (user.role === 'admin') {
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
  const hashPw = bcrypt.hashSync(password || '123456', 10);
  const vhIds = viewHospitalIds && Array.isArray(viewHospitalIds) ? JSON.stringify(viewHospitalIds) : '[]';
  const result = await query(
    "INSERT INTO users (username, password, name, role, hospital_id, governorate, view_permission, phone, email, view_hospital_ids) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id, username, name, role, hospital_id, governorate, view_permission, phone, email, view_hospital_ids",
    [username, hashPw, name, role, hospitalId || null, governorate || null, viewPermission || 'own', phone || '', email || '', vhIds]
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
        const genPassword = bcrypt.hashSync('123', 10);

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
  if (user.role === 'admin') {
    const sets = []; const vals = []; let idx = 1;
    if (phone !== undefined) { sets.push(`phone = $${idx++}`); vals.push(phone); }
    if (email !== undefined) { sets.push(`email = $${idx++}`); vals.push(email); }
    if (name) { sets.push(`name = $${idx++}`); vals.push(name); }
    if (role) { sets.push(`role = $${idx++}`); vals.push(role); }
    if (password) { sets.push(`password = $${idx++}`); vals.push(bcrypt.hashSync(password, 10)); }
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
    if (password) { sets.push(`password = $${idx++}`); vals.push(bcrypt.hashSync(password, 10)); }
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
    if (user.role !== 'admin' && user.role !== 'branch_supervisor') return res.status(403).json({ error: 'ليس لديك صلاحية' });
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
      [hospUname, bcrypt.hashSync('123456', 10), newHosp.name, newHosp.id, newHosp.governorate]
    );
  }
  
  // Auto-create branch_supervisor for this governorate if not exists
  const existingSup = await query("SELECT id FROM users WHERE governorate = $1 AND role = 'branch_supervisor'", [newHosp.governorate]);
  if (existingSup.rows.length === 0) {
    const uname = 'sup_' + newHosp.governorate.replace(/[^a-zA-Z\u0621-\u064A0-9]/g, '_').toLowerCase().replace(/_+/g, '_').replace(/^_|_$/g, '');
    await query(
      "INSERT INTO users (username, password, name, role, governorate, view_permission) VALUES ($1,$2,$3,'branch_supervisor',$4,'governorate')",
      [uname, bcrypt.hashSync('123456', 10), 'مشرف ' + newHosp.governorate, newHosp.governorate]
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
      [uname, bcrypt.hashSync('123456', 10), 'مشرف ' + name, name]
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
  let sql = "SELECT dr.id, dr.hospital_id, TO_CHAR(dr.date, 'YYYY-MM-DD') as date, dr.time, dr.under_inspection, dr.blood_data, dr.plasma_data, dr.platelets, dr.cryo, dr.license_type, dr.license_status, dr.plat_data, dr.user_id, dr.updated_at, h.name as hospital_name, h.governorate, h.type FROM daily_reports dr JOIN hospitals h ON h.id = dr.hospital_id WHERE 1=1";
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
  // تحت الفحص + الوارد + المنصرف + الإعدام: تلقائي من أكياس الدم —
  // تحت الفحص = الدم غير المفحوص (collected) يُحسب كيساً واحداً فقط، بدون صفائح
  // الوارد = الأكياس المتاحة المفحوصة (available) لكل فصيلة — دم بالفصائل الثماني، بلازما بالأربع
  // المنصرف = إرسال كيس لمستشفى آخر (أحداث «إرسال كيس» ناقص «رفض استلام») + صرف كيس لمريض/هيئة (status='issued') — بالفصيلة والمنتج
  // الإعدام = الإعدام قبل/بعد الصرف (نظام مفتوح / أخرى / انتهاء صلاحية / تفاعل) + المرتجع (returned) + Lipemic/Hemolyzed (أسباب البلازما/الكرايو) — بالفصيلة والمنتج
  // يُستثنى إعدام التجميع: فيروسات/نات (positive) و لم يكتمل و دهون و Icteric و تبرع علاجي
  // و ولادة (status='disposed' + return_reason='ولادة') — لا تُحسب في الإعدام
  try {
    const bagRows = await query('SELECT hospital_id, status, product_type, blood_type, return_reason FROM blood_bags');
    const uiCounts = {};
    const incBlood = {};   // hospital_id -> { 'A+': n, ... }
    const incPlasma = {};  // hospital_id -> { 'A': n, ... }
    const outBlood = {};   // hospital_id -> { 'A+': n, ... }
    const outPlasma = {};  // hospital_id -> { 'A': n, ... }
    const disBlood = {};   // hospital_id -> { 'A+': n, ... }
    const disPlasma = {};  // hospital_id -> { 'A': n, ... }
    const isBlood = prod => { const p = (prod || '').trim(); return p === 'دم' || p === 'دم كلي'; };
    const outAdd = (map, hid, prod, bt) => {
      const key = bbNormBt(bt, prod);
      if (!key) return;
      if (isBlood(prod)) { (map.blood[hid] = map.blood[hid] || {})[key] = (map.blood[hid][key] || 0) + 1; }
      else if (prod === 'بلازما') { (map.plasma[hid] = map.plasma[hid] || {})[key] = (map.plasma[hid][key] || 0) + 1; }
    };
    bagRows.rows.forEach(b => {
      const prod = b.product_type || 'دم';
      if (b.status === 'collected' && isBlood(prod)) {
        uiCounts[b.hospital_id] = (uiCounts[b.hospital_id] || 0) + 1;
      } else if (b.status === 'available' && b.blood_type) {
        outAdd({ blood: incBlood, plasma: incPlasma }, b.hospital_id, prod, b.blood_type);
      } else if (b.status === 'issued' && b.blood_type) {
        // صرف لمريض أو لهيئة/جهة — الكيس يبقى في المستشفى بحالة issued
        outAdd({ blood: outBlood, plasma: outPlasma }, b.hospital_id, prod, b.blood_type);
      } else if (b.blood_type && (b.status === 'disposed' || b.status === 'reaction' || b.status === 'returned' || b.status === 'lipemic' || b.status === 'hemolyzed')) {
        // إعدام قبل/بعد الصرف: نظام مفتوح / أخرى / انتهاء صلاحية / تفاعل / مرتجع + Lipemic/Hemolyzed (البلازما والكرايو) — يُحسب لكل كيس مُعدَم أو مُرتجع
        // يُستثنى إعدام التجميع (ولادة: status='disposed' + return_reason='ولادة' تُخزَّن كإعدام جمع-time)
        if (b.status === 'disposed' && b.return_reason === 'ولادة') return;
        outAdd({ blood: disBlood, plasma: disPlasma }, b.hospital_id, prod, b.blood_type);
      }
    });
    // الإرسال لمستشفى آخر من سجل الأحداث (دائم — حتى بعد قبول الاستلام في الوجهة)
    // إرسال كيس = +1 للمصدر؛ رفض استلام (عاد للمصدر) = -1 للمصدر
    const outDelta = (map, hid, prod, bt, delta) => {
      const key = bbNormBt(bt, prod);
      if (!key) return;
      if (isBlood(prod)) { (map.blood[hid] = map.blood[hid] || {})[key] = (map.blood[hid][key] || 0) + delta; }
      else if (prod === 'بلازما') { (map.plasma[hid] = map.plasma[hid] || {})[key] = (map.plasma[hid][key] || 0) + delta; }
    };
    try {
      const evRows = await query("SELECT e.event, e.from_hospital_id, e.to_hospital_id, b.product_type, b.blood_type FROM blood_bag_events e JOIN blood_bags b ON b.id = e.bag_id WHERE e.event IN ('إرسال كيس','رفض استلام')");
      evRows.rows.forEach(e => {
        if (!e.from_hospital_id) return;
        const d = e.event === 'إرسال كيس' ? 1 : -1;
        outDelta({ blood: outBlood, plasma: outPlasma }, e.from_hospital_id, e.product_type || 'دم', e.blood_type, d);
      });
    } catch (ee) { /* blood_bag_events may not exist in legacy DBs */ }
    const BT8 = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
    const PT4 = ['A','B','O','AB'];
    deduped.forEach(r => {
      r.last_update = dailyLastUpdate(r.updated_at);
      r.under_inspection = uiCounts[r.hospital_id] || 0;
      let bd = null, pd = null;
      try { bd = typeof r.blood_data === 'string' ? JSON.parse(r.blood_data) : (r.blood_data || null); } catch(e) { bd = null; }
      try { pd = typeof r.plasma_data === 'string' ? JSON.parse(r.plasma_data) : (r.plasma_data || null); } catch(e) { pd = null; }
      if (bd) {
        const ib = incBlood[r.hospital_id] || {};
        const ob = outBlood[r.hospital_id] || {};
        const db = disBlood[r.hospital_id] || {};
        BT8.forEach(t => { if (bd[t]) { bd[t].incoming = ib[t] || 0; bd[t].outgoing = ob[t] || 0; bd[t].disposal = db[t] || 0; } });
        r.blood_data = bd;
      }
      if (pd) {
        const ip = incPlasma[r.hospital_id] || {};
        const op = outPlasma[r.hospital_id] || {};
        const dp = disPlasma[r.hospital_id] || {};
        PT4.forEach(t => { if (pd[t]) { pd[t].incoming = ip[t] || 0; pd[t].outgoing = op[t] || 0; pd[t].disposal = dp[t] || 0; } });
        r.plasma_data = pd;
      }
    });
  } catch (e) { /* blood_bags table may not exist in legacy DBs */ }
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
    let prevBlood = {}, prevPlasma = {};
    try { prevBlood = typeof prev.blood_data === 'string' ? JSON.parse(prev.blood_data) : (prev.blood_data || {}); } catch { prevBlood = {}; }
    try { prevPlasma = typeof prev.plasma_data === 'string' ? JSON.parse(prev.plasma_data) : (prev.plasma_data || {}); } catch { prevPlasma = {}; }
    ['A+','A-','B+','B-','AB+','AB-','O+','O-'].forEach(t => {
      if (prevBlood[t] && prevBlood[t].available !== undefined) def.blood[t].previous = prevBlood[t].available;
    });
    ['A','B','AB','O'].forEach(t => {
      if (prevPlasma[t] && prevPlasma[t].available !== undefined) def.plasma[t].previous = prevPlasma[t].available;
    });
  }
  const result = await query(
    'INSERT INTO daily_reports (hospital_id, date, time, under_inspection, blood_data, plasma_data, platelets, cryo, license_type, license_status, user_id, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW()) RETURNING *',
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
  sets.push('updated_at = NOW()');
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
    await query(`UPDATE daily_reports SET ${f} = $1, updated_at = NOW() WHERE id = $2`, [value, parseInt(req.params.id)]);
  } else if (group === 'plat_cryo') {
    const ALLOWED_PC = ['platelets', 'cryo'];
    if (!ALLOWED_PC.includes(sub)) return res.status(400).json({ error: 'حقل غير صالح' });
    await query(`UPDATE daily_reports SET ${sub} = $1, updated_at = NOW() WHERE id = $2`, [parseInt(value) || 0, parseInt(req.params.id)]);
  } else {
    const field = group === 'plasma' ? 'plasma_data' : 'blood_data';
    const raw = r[field];
    const data = raw && typeof raw === 'object' ? raw : (raw ? JSON.parse(raw) : {});
    if (!data[type]) data[type] = {};
    data[type][sub] = parseInt(value) || 0;
    await query(`UPDATE daily_reports SET ${field} = $1, updated_at = NOW() WHERE id = $2`, [JSON.stringify(data), parseInt(req.params.id)]);
  }
  res.json({ ok: true });
});

// Allow anyone to edit platelets & cryo
app.patch('/api/daily-reports/:id/pc', requireAuth(), requirePerm('daily_stock', 'edit'), async (req, res) => {
  const { platelets, cryo } = req.body;
  const sets = []; const vals = []; let idx = 1;
  if (platelets !== undefined) { sets.push(`platelets = $${idx++}`); vals.push(platelets); }
  if (cryo !== undefined) { sets.push(`cryo = $${idx++}`); vals.push(cryo); }
  if (sets.length === 0) return res.json({ ok: true });
  sets.push('updated_at = NOW()');
  vals.push(parseInt(req.params.id));
  const result = await query(`UPDATE daily_reports SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`, vals);
  if (result.rows.length === 0) return res.status(404).json({ error: 'غير موجود' });
  res.json(result.rows[0]);
});

app.delete('/api/daily-reports/:id', requireAuth(), requirePerm('daily_stock', 'edit'), async (req, res) => {
  const user = req.session.user;
  const report = await query('SELECT hospital_id FROM daily_reports WHERE id = $1', [parseInt(req.params.id)]);
  if (report.rows.length === 0) return res.status(404).json({ error: 'غير موجود' });
  if (user.role === 'hospital' || user.role === 'hospital_manager') {
    if (report.rows[0].hospital_id !== user.hospitalId) return res.status(403).json({ error: 'ليس لديك صلاحية' });
  }
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



// Archive a monthly indicator table (big/small) into per-month archive records (type تجميعيه/تخزينيه)
// Upserts into an existing archive of the same type+title (merged by hospital_id+year+month), else creates one.
// When cutoffYear/cutoffMonth are provided, only records older/equal to that cutoff are archived.
// expectedType ('تجميعي'/'تخزيني') filters by hospital type so misplaced rows never enter the wrong archive.
async function archiveIndicatorTable(table, typeLabel, cutoffYear, cutoffMonth, user, expectedType) {
  try {
    const all = await query(`SELECT mi.*, h.name as hospital_name, h.governorate, h.type as hosp_type FROM ${table} mi JOIN hospitals h ON h.id = mi.hospital_id`);
    let toArchive = all.rows;
    if (expectedType) toArchive = toArchive.filter(r => r.hosp_type === expectedType);
    if (cutoffYear != null && cutoffMonth != null) {
      toArchive = toArchive.filter(r => r.year < cutoffYear || (r.year === cutoffYear && r.month <= cutoffMonth));
    }
    if (toArchive.length === 0) return 0;
    const byKey = {};
    toArchive.forEach(r => { const k = r.year + '-' + r.month; (byKey[k] = byKey[k] || []).push(r); });
    let archived = 0;
    for (const k in byKey) {
      const [y, m] = k.split('-');
      const title = typeLabel + ' - أرشيف ' + y + '/' + m;
      const recs = byKey[k].map(r => {
        let data = r.data;
        if (typeof data === 'string') { try { data = JSON.parse(data); } catch (e) {} }
        return { data, year: r.year, month: r.month, period: 'monthly', governorate: r.governorate, hospital_id: r.hospital_id, hospital_name: r.hospital_name, user_id: r.user_id };
      });
      const existing = await query('SELECT id, data FROM archives WHERE type = $1 AND title = $2', [typeLabel, title]);
      if (existing.rows.length > 0) {
        let oldData = existing.rows[0].data;
        if (typeof oldData === 'string') { try { oldData = JSON.parse(oldData) || []; } catch (e) { oldData = []; } }
        if (!Array.isArray(oldData)) oldData = [];
        const idxMap = {};
        oldData.forEach((rec, i) => { idxMap[(rec.hospital_id||'') + '_' + (rec.year||'') + '_' + (rec.month||'')] = i; });
        recs.forEach(rec => {
          const ck = (rec.hospital_id||'') + '_' + (rec.year||'') + '_' + (rec.month||'');
          if (ck in idxMap) oldData[idxMap[ck]] = rec; else oldData.push(rec);
        });
        await query('UPDATE archives SET data = $1 WHERE id = $2', [JSON.stringify(oldData), existing.rows[0].id]);
      } else {
        await query('INSERT INTO archives (type, title, data, user_id, user_name) VALUES ($1,$2,$3,$4,$5)',
          [typeLabel, title, JSON.stringify(recs), user.id, user.name]);
      }
      archived += recs.length;
      for (const r of byKey[k]) await query(`DELETE FROM ${table} WHERE id = $1`, [r.id]);
    }
    return archived;
  } catch (e) { console.error('archiveIndicatorTable ' + table + ':', e.message); return 0; }
}

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
  try {
    const now = new Date();
    if (now.getDate() >= 25) {
      const curYear = now.getFullYear();
      const curMonth = now.getMonth() + 1;
      let cutoffMonth = curMonth - 1;
      let cutoffYear = curYear;
      if (cutoffMonth === 0) { cutoffMonth = 12; cutoffYear--; }
      const all = await query('SELECT mi.*, h.name as hospital_name, h.governorate FROM monthly_indicators mi JOIN hospitals h ON h.id = mi.hospital_id');
      const toArchive = all.rows.filter(r => r.year < cutoffYear || (r.year === cutoffYear && r.month <= cutoffMonth));
      if (toArchive.length > 0) {
        const todayStr = new Date().toISOString().slice(0,10);
        const title = 'مؤشرات الأداء - أرشيف تلقائي ' + todayStr;
        const existingArch = await query('SELECT id, data FROM archives WHERE type = $1 AND title = $2', ['مؤشرات الأداء', title]);
        if (existingArch.rows.length > 0) {
          let oldData = existingArch.rows[0].data;
          if (typeof oldData === 'string') { try { oldData = JSON.parse(oldData) || []; } catch (e) { oldData = []; } }
          if (!Array.isArray(oldData)) oldData = [];
          await query('UPDATE archives SET data = $1 WHERE id = $2', [JSON.stringify([...oldData, ...toArchive]), existingArch.rows[0].id]);
        } else {
          await query('INSERT INTO archives (type, title, data, user_id, user_name) VALUES ($1,$2,$3,$4,$5)',
            ['مؤشرات الأداء', title, JSON.stringify(toArchive), user.id, user.name]);
        }
        for (const r of toArchive) {
          await query('DELETE FROM monthly_indicators WHERE id = $1', [r.id]);
        }
      }
      await archiveIndicatorTable('monthly_big_indicators', 'مؤشرات تجميعيه', cutoffYear, cutoffMonth, user, 'تجميعي');
      await archiveIndicatorTable('monthly_small_indicators', 'مؤشرات تخزينيه', cutoffYear, cutoffMonth, user, 'تخزيني');
    }
  } catch (archiveErr) { console.error('Auto-archive indicators skipped:', archiveErr.message); }
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
  const user = req.session.user;
  const records = await query('SELECT mi.*, h.name as hospital_name, h.governorate FROM monthly_indicators mi JOIN hospitals h ON h.id = mi.hospital_id');
  let total = 0;
  if (records.rows.length > 0) {
    const title = 'مؤشرات الأداء - ' + new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    await query('INSERT INTO archives (type, title, data, user_id, user_name) VALUES ($1,$2,$3,$4,$5)',
      ['مؤشرات الأداء', title, JSON.stringify(records.rows), user.id, user.name]);
    await query('DELETE FROM monthly_indicators');
    total += records.rows.length;
  }
  total += await archiveIndicatorTable('monthly_big_indicators', 'مؤشرات تجميعيه', null, null, user, 'تجميعي');
  total += await archiveIndicatorTable('monthly_small_indicators', 'مؤشرات تخزينيه', null, null, user, 'تخزيني');
  if (total === 0) return res.json({ ok: true, message: 'لا توجد بيانات للأرشفة' });
  res.json({ ok: true, message: 'تم أرشفة ' + total + ' سجل' });
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
    let archData = existing.rows[0].data;
    if (typeof archData === 'string') { try { archData = JSON.parse(archData) || []; } catch (e) { archData = []; } }
    if (!Array.isArray(archData)) archData = [];
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
  try {
    const now = new Date();
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
        const existingArch = await query('SELECT id, data FROM archives WHERE type = $1 AND title = $2', ['منصرف فصائل الدم', title]);
        if (existingArch.rows.length > 0) {
          let oldData = existingArch.rows[0].data;
          if (typeof oldData === 'string') { try { oldData = JSON.parse(oldData) || []; } catch (e) { oldData = []; } }
          if (!Array.isArray(oldData)) oldData = [];
          await query('UPDATE archives SET data = $1 WHERE id = $2', [JSON.stringify([...oldData, ...toArchive]), existingArch.rows[0].id]);
        } else {
          await query('INSERT INTO archives (type, title, data, user_id, user_name) VALUES ($1,$2,$3,$4,$5)',
            ['منصرف فصائل الدم', title, JSON.stringify(toArchive), user.id, user.name]);
        }
        for (const r of toArchive) {
          await query('DELETE FROM monthly_consumption WHERE id = $1', [r.id]);
        }
      }
  } catch (archiveErr) { console.error('Auto-archive consumption skipped:', archiveErr.message); }
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

app.post('/api/monthly-consumption/archive-direct', requireAuth(), requirePerm('monthly_consumption', 'add'), async (req, res) => {
  const { hospitalId, year, month, period, bloodTypes } = req.body;
  if (!hospitalId || !year || !bloodTypes) return res.status(400).json({ error: 'البيانات غير مكتملة' });
  const p = period || 'monthly';
  const title = 'منصرف فصائل الدم - أرشيف ' + year + (p === 'yearly' ? '/سنوي' : p === 'h1' ? '/نصف أول' : p === 'h2' ? '/نصف ثاني' : '/' + month);
  const existing = await query('SELECT id, data FROM archives WHERE type = $1 AND title = $2', ['منصرف فصائل الدم', title]);
  const hosp = await query('SELECT name, governorate FROM hospitals WHERE id = $1', [hospitalId]);
  const record = { hospital_id: hospitalId, hospital_name: hosp.rows[0]?.name || '', governorate: hosp.rows[0]?.governorate || '', year, month, period: p, blood_types: bloodTypes, user_id: req.session.user.id };
  if (existing.rows.length > 0) {
    let data = existing.rows[0].data;
    if (typeof data === 'string') { try { data = JSON.parse(data) || []; } catch (e) { data = []; } }
    if (!Array.isArray(data)) data = [];
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

app.delete('/api/monthly-big-indicators/:id', requireAuth(), requirePerm('monthly_big', 'delete'), async (req, res) => {
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
    let oldData = existing.rows[0].data;
    if (typeof oldData === 'string') { try { oldData = JSON.parse(oldData) || []; } catch (e) { oldData = []; } }
    if (!Array.isArray(oldData)) oldData = [];
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

app.delete('/api/monthly-small-indicators/:id', requireAuth(), requirePerm('monthly_small', 'delete'), async (req, res) => {
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
    let oldData = existing.rows[0].data;
    if (typeof oldData === 'string') { try { oldData = JSON.parse(oldData) || []; } catch (e) { oldData = []; } }
    if (!Array.isArray(oldData)) oldData = [];
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

app.put('/api/archive/:id', requireAuth(), requirePerm('archive', 'edit'), async (req, res) => {
  const { data } = req.body;
  if (data) await query('UPDATE archives SET data = $1 WHERE id = $2', [JSON.stringify(data), parseInt(req.params.id)]);
  res.json({ ok: true });
});

app.delete('/api/archive/:id', requireAuth(), requirePerm('archive', 'delete'), async (req, res) => {
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
  if (user.role === 'hospital' || user.role === 'hospital_manager') {
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
  let allHospitals = allHospitalsResult.rows || [];
  if (user.role === 'hospital' || user.role === 'hospital_manager') allHospitals = allHospitals.filter(h => String(h.id) === String(user.hospitalId));
  else if (user.role === 'branch_supervisor' && user.governorate) allHospitals = allHospitals.filter(h => h.governorate === user.governorate);
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
    const ExcelJS = require('exceljs');
    const eq = await db.getEquipment();
    const types = eq.types;
    const hospitals = eq.hospitals;
    const wb = new ExcelJS.Workbook();
    wb.creator = 'نظام بنك الدم';
    wb.created = new Date();
    const ws = wb.addWorksheet('الأجهزة', { views:[{ state:'frozen', ySplit:2, xSplit:1 }] });
    const mc = 2 + types.length * 4;
    ws.getRow(1).height = 28;
    ws.mergeCells(1,1,1,mc);
    ws.getCell(1,1).value = 'أجهزة بنوك الدم';
    ws.getCell(1,1).font = { bold:true, size:14, color:{ argb:'FF2C3E50' } };
    ws.getCell(1,1).alignment = { horizontal:'center', vertical:'middle' };
    ws.getRow(2).height = 22;
    ws.getCell(2,1).value = 'المحافظة'; ws.getCell(2,2).value = 'اسم بنك الدم';
    const borderStyle = { style:'thin', color:{ argb:'FFB0BEC5' } };
    const thinBorder = { top:borderStyle, bottom:borderStyle, left:borderStyle, right:borderStyle };
    [1,2].forEach(ci => {
      const c = ws.getCell(2, ci); c.font = { bold:true, color:{ argb:'FFFFFFFF' }, size:10 };
      c.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF2C3E50' } }; c.alignment = { horizontal:'center', vertical:'middle' }; c.border = thinBorder;
    });
    let cIdx = 3;
    types.forEach(t => {
      ws.mergeCells(2, cIdx, 2, cIdx + 3);
      const tc = ws.getCell(2, cIdx); tc.value = t.name;
      tc.font = { bold:true, color:{ argb:'FFFFFFFF' }, size:10 };
      tc.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF2C3E50' } }; tc.alignment = { horizontal:'center', vertical:'middle' }; tc.border = thinBorder;
      cIdx += 4;
    });
    cIdx = 3;
    const subHeaders = ['عدد','حالة','ماركة','سعة'];
    types.forEach(t => {
      subHeaders.forEach(h => {
        const c = ws.getCell(3, cIdx); c.value = h;
        c.font = { bold:true, color:{ argb:'FFFFFFFF' }, size:9 };
        c.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF34495E' } }; c.alignment = { horizontal:'center', vertical:'middle' }; c.border = thinBorder;
        cIdx++;
      });
    });
    ws.getCell(3,1).value = ''; ws.getCell(3,2).value = '';
    ws.getCell(3,1).font = { bold:true, color:{ argb:'FFFFFFFF' }, size:9 };
    ws.getCell(3,1).fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF34495E' } }; ws.getCell(3,1).border = thinBorder;
    ws.getCell(3,2).font = { bold:true, color:{ argb:'FFFFFFFF' }, size:9 };
    ws.getCell(3,2).fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF34495E' } }; ws.getCell(3,2).border = thinBorder;
    function getEqVal(eq, field) {
      if (Array.isArray(eq)) return eq.map(e => e[field] || '').filter(Boolean).join(', ');
      if (eq && typeof eq === 'object') return eq[field] != null ? eq[field] : '';
      return '';
    }
    const sorted = [...hospitals].sort((a, b) => (a.governorate || '').localeCompare(b.governorate || '', 'ar') || (a.name || '').localeCompare(b.name || '', 'ar'));
    let dr = 4;
    sorted.forEach(h => {
      const row = ws.getRow(dr); row.height = 18;
      ws.getCell(dr,1).value = h.governorate || '';
      ws.getCell(dr,2).value = h.name || '';
      ws.getCell(dr,1).font = { size:9 }; ws.getCell(dr,1).alignment = { horizontal:'right', vertical:'middle' }; ws.getCell(dr,1).border = thinBorder;
      ws.getCell(dr,2).font = { size:9 }; ws.getCell(dr,2).alignment = { horizontal:'right', vertical:'middle' }; ws.getCell(dr,2).border = thinBorder;
      cIdx = 3;
      types.forEach(t => {
        const eqEntry = (h.equipment || {})[t.id];
        ['count','status','brand','capacity'].forEach(f => {
          const c = ws.getCell(dr, cIdx); c.value = getEqVal(eqEntry, f);
          c.font = { size:9 }; c.alignment = { horizontal:'center', vertical:'middle' }; c.border = thinBorder;
          if (dr % 2 === 0) c.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFF8F9FA' } };
          cIdx++;
        });
      });
      dr++;
    });
    ws.getColumn(1).width = 16; ws.getColumn(2).width = 24;
    for (let i = 3; i <= mc; i++) ws.getColumn(i).width = 12;
    ws.mergeCells(dr,1,dr,mc);
    ws.getCell(dr,1).value = 'إعداد و برمجة محمد ندا 01068880999';
    ws.getCell(dr,1).font = { size:9, color:{ argb:'FF95A5A6' }, italic:true }; ws.getCell(dr,1).alignment = { horizontal:'center' };
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="equipment.xlsx"');
    const buf = await wb.xlsx.writeBuffer();
    res.send(Buffer.from(buf));
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
  const user = req.session.user;
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
      continue;
    }
    let scopedMissing = missing;
    if (user.role === 'hospital' || user.role === 'hospital_manager') {
      scopedMissing = missing.filter(h => String(h.id) === String(user.hospitalId));
    } else if (user.role === 'branch_supervisor') {
      scopedMissing = missing.filter(h => h.governorate === user.governorate);
    }
    if (scopedMissing.length > 0) {
      n.message = `جاهزية بنوك الدم بمناسبة "${occasion.name}" من ${occasion.date_from} إلى ${occasion.date_to} - ${scopedMissing.length} بنك دم لم يدخل الجاهزية`;
      n._missingHospitals = scopedMissing.map(h => ({name: h.name, gov: h.governorate}));
      rows.push(n);
    }
  }
  res.json(rows);
});

app.post('/api/readiness-notifications/dismiss/:id', requireAuth(), requirePerm('readiness', 'edit'), async (req, res) => {
  const id = parseInt(req.params.id);
  await query('UPDATE readiness_notifications SET dismissed = true WHERE id = $1', [id]);
  res.json({ ok: true });
});

// --- Excel Export ---
app.get('/api/readiness-export/xlsx', requireAuth(), requirePerm('readiness', 'export'), async (req, res) => {
  try {
    const ExcelJS = require('exceljs');
    const wb = new ExcelJS.Workbook();
    wb.creator = 'نظام بنك الدم';
    wb.created = new Date();
    const occasionsResult = await query('SELECT * FROM readiness_occasions ORDER BY id DESC');
    const occasions = occasionsResult.rows || [];
    const hospitalsResult = await query('SELECT * FROM hospitals ORDER BY governorate, name');
    const hospitals = hospitalsResult.rows || [];
    if (occasions.length === 0) return res.status(400).json({ error: 'لا توجد مناسبات للتصدير' });
    const allReportsResult = await query('SELECT * FROM readiness_reports');
    const allReports = allReportsResult.rows || [];
    const borderStyle = { style:'thin', color:{ argb:'FFB0BEC5' } };
    const thinBorder = { top:borderStyle, bottom:borderStyle, left:borderStyle, right:borderStyle };
    const dayNames = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    occasions.forEach(occ => {
      const reports = allReports.filter(r => r.occasion_id === occ.id);
      const fromDate = new Date(occ.date_from);
      const toDate = new Date(occ.date_to);
      const labels = occ.day_labels || [];
      const days = [];
      let cur = new Date(fromDate);
      while (cur <= toDate) {
        const dStr = cur.toISOString().slice(0,10);
        const dn = dayNames[cur.getDay()];
        days.push(labels[days.length] || `${dn} ${dStr}`);
        cur.setDate(cur.getDate() + 1);
      }
const dayCount = days.length;
      const totalCols = 3 + dayCount + 8;
      const stockIdx = 3 + dayCount;
      const ws = wb.addWorksheet(occ.name.slice(0, 31), { views:[{ state:'frozen', ySplit:2, xSplit:2 }] });
      ws.getRow(1).height = 24; ws.getRow(2).height = 20;
      ws.getCell(1,1).value = 'المحافظة'; ws.getCell(1,1).font = { bold:true, color:{ argb:'FFFFFFFF' }, size:10 };
      ws.getCell(1,1).fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF2C3E50' } }; ws.getCell(1,1).alignment = { horizontal:'center', vertical:'middle' }; ws.getCell(1,1).border = thinBorder;
      ws.getCell(1,2).value = 'اسم بنك الدم'; ws.getCell(1,2).font = { bold:true, color:{ argb:'FFFFFFFF' }, size:10 };
      ws.getCell(1,2).fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF2C3E50' } }; ws.getCell(1,2).alignment = { horizontal:'center', vertical:'middle' }; ws.getCell(1,2).border = thinBorder;
      ws.mergeCells(1, 3, 1, stockIdx);
      ws.getCell(1,3).value = 'القوة البشريه المتواجده فعليا';
      ws.getCell(1,3).font = { bold:true, color:{ argb:'FFFFFFFF' }, size:10 };
      ws.getCell(1,3).fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF1565C0' } }; ws.getCell(1,3).alignment = { horizontal:'center', vertical:'middle' }; ws.getCell(1,3).border = thinBorder;
      const extraHeaders = ['الرصيد','الاجهزه الطبية','','المستهلكات','الاستعاضة لكل بنك','ملاحظات مدير بنك الدم','تعليق مشرف الفرع','تعليق مشرف الهيئة'];
      extraHeaders.forEach((h, i) => {
        if (!h) return;
        ws.getCell(1, stockIdx + i).value = h;
        ws.getCell(1, stockIdx + i).font = { bold:true, color:{ argb:'FFFFFFFF' }, size:10 };
        ws.getCell(1, stockIdx + i).fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF2E7D32' } };
        ws.getCell(1, stockIdx + i).alignment = { horizontal:'center', vertical:'middle' }; ws.getCell(1, stockIdx + i).border = thinBorder;
      });
      ws.mergeCells(1, stockIdx + 1, 1, stockIdx + 2);
      ws.getCell(2,1).value = ''; ws.getCell(2,2).value = '';
      ws.getCell(2,3).value = 'الاسم'; ws.getCell(2,4).value = 'رقم التليفون';
      for (let d = 0; d < dayCount; d++) ws.getCell(2, 5 + d).value = days[d];
      ws.getCell(2, stockIdx + 1).value = 'مراجعة الصيانة';
      ws.getCell(2, stockIdx + 2).value = 'الاعطال';
      for (let ci = 1; ci <= totalCols; ci++) {
        const c = ws.getCell(2, ci);
        c.font = { bold:true, color:{ argb:'FF34495E' }, size:9 };
        c.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFECF0F1' } };
        c.alignment = { horizontal:'center', vertical:'middle' }; c.border = thinBorder;
      }
      let dr = 3;
      const govSorted = [...new Set(hospitals.map(h => h.governorate))].sort((a,b) => a.localeCompare(b, 'ar'));
      govSorted.forEach(gov => {
        const govHospitals = hospitals.filter(h => h.governorate === gov);
        govHospitals.forEach(h => {
          const r = reports.find(rep => rep.hospital_id === h.id);
          let staff = [];
          if (r) {
            const raw = r.staff_data || [];
            staff = Array.isArray(raw) ? raw : (typeof raw === 'string' ? (() => { try { return JSON.parse(raw); } catch(e) { return []; } })() : []);
          }
          if (staff.length === 0) {
            const row = ws.getRow(dr); row.height = 18;
            ws.getCell(dr,1).value = gov; ws.getCell(dr,2).value = h.name;
            ws.getCell(dr,1).font = { size:9 }; ws.getCell(dr,1).alignment = { horizontal:'right', vertical:'middle' }; ws.getCell(dr,1).border = thinBorder;
            ws.getCell(dr,2).font = { size:9 }; ws.getCell(dr,2).alignment = { horizontal:'right', vertical:'middle' }; ws.getCell(dr,2).border = thinBorder;
            for (let ci = 3; ci <= totalCols; ci++) {
              ws.getCell(dr, ci).border = thinBorder;
              if (dr % 2 === 0) ws.getCell(dr, ci).fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFF8F9FA' } };
            }
            dr++;
          } else {
            staff.forEach((s, si) => {
              const row = ws.getRow(dr); row.height = 18;
              ws.getCell(dr,1).value = si === 0 ? gov : '';
              ws.getCell(dr,2).value = si === 0 ? h.name : '';
              ws.getCell(dr,3).value = s.name || '';
              ws.getCell(dr,4).value = s.phone || '';
              for (let d = 0; d < dayCount; d++) {
                ws.getCell(dr, 5 + d).value = (s.shifts && s.shifts[String(d)]) || '';
              }
              if (si === 0) {
                ws.getCell(dr, stockIdx).value = r ? (r.stock || '') : '';
                ws.getCell(dr, stockIdx+1).value = r ? (r.maintenance || '') : '';
                ws.getCell(dr, stockIdx+2).value = r ? (r.breakdowns || '') : '';
                ws.getCell(dr, stockIdx+3).value = r ? (r.consumables || '') : '';
                ws.getCell(dr, stockIdx+4).value = r ? (r.correction || '') : '';
                ws.getCell(dr, stockIdx+5).value = r ? (r.notes_manager || '') : '';
                ws.getCell(dr, stockIdx+6).value = r ? (r.notes_branch || '') : '';
                ws.getCell(dr, stockIdx+7).value = r ? (r.notes_authority || '') : '';
              }
              for (let ci = 1; ci <= totalCols; ci++) {
                ws.getCell(dr, ci).font = { size:9 };
                ws.getCell(dr, ci).alignment = { horizontal:'center', vertical:'middle' };
                ws.getCell(dr, ci).border = thinBorder;
                if (ci <= 2) ws.getCell(dr, ci).alignment = { horizontal:'right', vertical:'middle' };
              }
              if (dr % 2 === 0) {
                for (let ci = 3; ci <= totalCols; ci++) ws.getCell(dr, ci).fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFF8F9FA' } };
              }
              dr++;
            });
          }
        });
      });
      ws.getColumn(1).width = 16; ws.getColumn(2).width = 24; ws.getColumn(3).width = 20; ws.getColumn(4).width = 14;
      for (let d = 0; d < dayCount; d++) ws.getColumn(5 + d).width = 14;
      for (let i = 0; i < 8; i++) ws.getColumn(stockIdx + i).width = 18;
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="readiness.xlsx"');
    const buf = await wb.xlsx.writeBuffer();
    res.send(Buffer.from(buf));
  } catch (e) {
    res.status(500).json({ error: errMsg(e) });
  }
});

// ============== Sync & Google Drive Module ==============

const DRIVE_CONFIG_PATH = path.join(DATA_DIR, 'drive-config.json');
const DRIVE_TOKENS_PATH = path.join(DATA_DIR, 'drive-tokens.json');

function loadDriveConfig() {
  let fileCfg = null;
  try { fileCfg = JSON.parse(fs.readFileSync(DRIVE_CONFIG_PATH, 'utf8')); } catch { fileCfg = null; }
  const envCfg = {};
  if (process.env.DRIVE_CLIENT_ID) envCfg.client_id = process.env.DRIVE_CLIENT_ID;
  if (process.env.DRIVE_CLIENT_SECRET) envCfg.client_secret = process.env.DRIVE_CLIENT_SECRET;
  if (process.env.DRIVE_REDIRECT_URI) envCfg.redirect_uri = process.env.DRIVE_REDIRECT_URI;
  if (!fileCfg && Object.keys(envCfg).length === 0) return null;
  return Object.assign({}, fileCfg || {}, envCfg);
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

// On boot: pull the latest db.json from Google Drive (source of truth) into DATA_DIR,
// so data survives Render free's ephemeral disk / redeploys. Best-effort with a
// bounded timeout so a slow Drive call can never block a cold start.
async function restoreFromDrive() {
  try {
    await Promise.race([
      restoreFromDriveInner(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000))
    ]);
  } catch (e) {
    console.log('💾 Drive restore skipped:', e.message);
  }
}
async function restoreFromDriveInner() {
  if (db.mode === 'pg') return; // PG is the store itself — nothing to restore
  const tokens = loadDriveTokens();
  if (!tokens || !tokens.access_token) return;
  const oauth2Client = createOAuth2Client();
  if (!oauth2Client) return;
  oauth2Client.setCredentials(tokens);

  const { google } = require('googleapis');
  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  const fileName = getDriveDbFileName();

  const listRes = await drive.files.list({
    q: `name='${fileName}' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive'
  });
  if (!listRes.data.files || listRes.data.files.length === 0) {
    console.log('💾 Drive restore skipped: no backup file in Google Drive yet');
    return;
  }
  const fileId = listRes.data.files[0].id;
  const fileRes = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'json' });
  const data = fileRes.data;
  if (!data || !Array.isArray(data.users)) {
    console.log('💾 Drive restore skipped: downloaded file is not a valid database');
    return;
  }
  const dbPath = path.join(DATA_DIR, 'db.json');
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  await db.reload();
  console.log(`✅ Restored ${(data.users || []).length} users from Google Drive`);
}

// GET /api/sync/status
app.get('/api/sync/status', requireAuth(), requireMaster(), async (req, res) => {
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
app.get('/api/sync/export', requireAuth(), requireMaster(), async (req, res) => {
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
        'strategic_reserves', 'equipment_hospitals', 'hospital_departments'
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
app.post('/api/sync/import', requireAuth(), requireMaster(), async (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: 'البيانات مطلوبة' });
  try {
    if (isPG) {
      const tables = ['users','hospitals','governorates','hospital_types','daily_stock','daily_reports','daily_statements','monthly_storage','monthly_aggregate','monthly_indicators','monthly_consumption','monthly_big_indicators','monthly_small_indicators','consumption','archives','employee_statements','equipment_types','readiness_occasions','readiness_reports','readiness_notifications','role_perms','strategic_settings','strategic_reserves','equipment_hospitals','hospital_departments'];
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
app.get('/api/sync/drive/auth-url', requireAuth(), requireMaster(), async (req, res) => {
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
app.post('/api/sync/drive/callback', requireAuth(), requireMaster(), async (req, res) => {
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
app.post('/api/sync/drive/upload', requireAuth(), requireMaster(), async (req, res) => {
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
app.get('/api/sync/drive/download', requireAuth(), requireMaster(), async (req, res) => {
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




// ============== Auto Backup (نسخ احتياطي تلقائي كل ساعة) ==============

const AUTO_BACKUP_INTERVAL = 60 * 60 * 1000;
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

// ---- Daily stock rollover (نقل رصيد اليوم السابق) 08:30 & 20:30 Cairo time ----
function cairoNowParts() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Cairo',
    hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(new Date());
  const m = parts.match(/(\d{4})-(\d{2})-(\d{2}), (\d{2}):(\d{2}):(\d{2})/);
  if (!m) return null;
  return { year: +m[1], month: +m[2], day: +m[3], hour: +m[4], minute: +m[5], second: +m[6] };
}
function cairoMinutesNow() {
  const p = cairoNowParts();
  if (!p) return -1;
  return p.hour * 60 + p.minute;
}
function cairoDateKey() {
  const p = cairoNowParts();
  if (!p) return '';
  return p.year + '-' + String(p.month).padStart(2, '0') + '-' + String(p.day).padStart(2, '0');
}
// Cairo-localized last-update timestamp for the «آخر تحديث» notes (YYYY-MM-DD HH:MM)
function dailyLastUpdate(v) {
  if (!v) return '';
  const d = (v instanceof Date) ? v : new Date(v);
  if (isNaN(d.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Cairo', hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  }).format(d);
  const m = parts.match(/(\d{4})-(\d{2})-(\d{2}),\s*(\d{2}):(\d{2})/);
  if (!m) return '';
  let hh = +m[4]; if (hh >= 24) hh -= 24;
  return m[1] + '-' + m[2] + '-' + m[3] + ' ' + String(hh).padStart(2, '0') + ':' + m[5];
}
const STOCK_ROLLOVER_SLOTS = [510, 1230]; // 08:30 & 20:30 minutes-of-day (Cairo)
let __stockRolloverKey = '';

// Rebuilds the daily rollover object for one blood-type/product key:
// previous = old available, available kept, incoming/outgoing/disposal = 0.
function rolloverField(v) {
  let o = v;
  if (o == null) o = {};
  if (typeof o === 'string') { try { o = JSON.parse(o); } catch (e) { return null; } }
  if (typeof o !== 'object' || Array.isArray(o)) return null;
  const avail = Number(o.available) || 0;
  return { previous: avail, incoming: 0, outgoing: 0, disposal: 0, available: avail };
}

async function performStockRollover() {
  const results = await query('SELECT * FROM daily_reports');
  if (!results.rows || !results.rows.length) return;
  // Apply the rollover to the LATEST report per hospital only —
  // older reports are historical snapshots and must not be rewritten.
  const latestByHosp = {};
  results.rows.forEach(r => {
    const k = String(r.hospital_id);
    const key = (r.date ? String(r.date).slice(0, 10) : '') + ' ' + (r.time || '');
    if (!latestByHosp[k] || key > (latestByHosp[k]._key || '')) { latestByHosp[k] = r; latestByHosp[k]._key = key; }
  });
  const latestRows = Object.values(latestByHosp);
  for (const row of latestRows) {
    const bd = (row.blood_data && typeof row.blood_data === 'object') ? row.blood_data : (row.blood_data ? JSON.parse(row.blood_data) : {});
    const pd = (row.plasma_data && typeof row.plasma_data === 'object') ? row.plasma_data : (row.plasma_data ? JSON.parse(row.plasma_data) : {});
    let bdChanged = false; let pdChanged = false;
    if (typeof bd === 'object' && !Array.isArray(bd)) {
      for (const t of Object.keys(bd)) {
        const nv = rolloverField(bd[t]);
        if (nv) { bd[t] = nv; bdChanged = true; }
      }
    }
    if (typeof pd === 'object' && !Array.isArray(pd)) {
      for (const t of Object.keys(pd)) {
        const nv = rolloverField(pd[t]);
        if (nv) { pd[t] = nv; pdChanged = true; }
      }
    }
    if (bdChanged || pdChanged) {
      await query('UPDATE daily_reports SET blood_data = $1, plasma_data = $2, updated_at = NOW() WHERE id = $3', [
        bdChanged ? JSON.stringify(bd) : row.blood_data,
        pdChanged ? JSON.stringify(pd) : row.plasma_data,
        row.id
      ]);
    }
  }
  console.log('✅ Daily stock rollover completed: ' + new Date().toISOString());
}

function startStockRollover() {
  setInterval(async () => {
    const nowMin = cairoMinutesNow();
    const dayKey = cairoDateKey();
    if (nowMin < 0 || !dayKey) return;
    for (const slot of STOCK_ROLLOVER_SLOTS) {
      if (Math.abs(nowMin - slot) <= 2) {
        const key = 'stock-rollover-' + slot + '-' + dayKey;
        if (key === __stockRolloverKey) return;
        __stockRolloverKey = key;
        try { await performStockRollover(); }
        catch (e) { console.error('❌ Stock rollover failed: ' + e.message); }
        return;
      }
    }
  }, 30000);
}

// GET /api/sync/auto-backup-status
app.get('/api/sync/auto-backup-status', requireAuth(), requireMaster(), async (req, res) => {
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

// ============== Indicator Columns CRUD (العمليات الحسابية) ==============
app.get('/api/indicator-columns', requireAuth(), async (req, res) => {
  try {
    const [big, small] = await Promise.all([getIndicatorColumns('big'), getIndicatorColumns('small')]);
    res.json({ big, small });
  } catch (e) {
    console.error('GET indicator-columns:', e.message);
    res.status(500).json({ error: errMsg(e) });
  }
});

app.post('/api/indicator-columns', requireAuth(), requirePerm('indicator_columns', 'edit'), async (req, res) => {
  try {
    const { category, key, label, formula, formula_expr, unit, target, group, sg, ssg, cls } = req.body || {};
    if (!category || !key || !label) return res.status(400).json({ error: 'بيانات ناقصة' });
    if (category !== 'big' && category !== 'small') return res.status(400).json({ error: 'فئة غير صحيحة' });
    const keyRe = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
    if (!keyRe.test(key)) return res.status(400).json({ error: 'مفتاح العمود غير صالح' });
    const exist = await db.query('SELECT id FROM indicator_columns WHERE col_key = $1', [key]);
    if (exist.rows.length > 0) return res.status(400).json({ error: 'المفتاح موجود بالفعل' });
    let fExpr = '';
    if (formula) {
      if (!formula_expr || !FormulaEngine.parseExpr(formula_expr) || /[\u0600-\u06FF]/.test(formula_expr)) return res.status(400).json({ error: 'معادلة غير صالحة' });
      fExpr = formula_expr;
    }
    const maxOrd = await db.query('SELECT MAX(ord) as m FROM indicator_columns WHERE category = $1', [category]);
    const m = maxOrd.rows[0] ? maxOrd.rows[0].m : null;
    const ord = (m === null || m === undefined || isNaN(parseInt(m))) ? 1 : parseInt(m) + 1;
    await db.query(
      'INSERT INTO indicator_columns (category, col_key, label, ord, enabled, static, formula, formula_expr, unit, target, grp, sg, ssg, cls) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)',
      [category, key, label, ord, 1, 0, formula ? 1 : 0, fExpr, unit || '', target || '', group || '', sg || '', ssg || '', cls || '']
    );
    await refreshFormulaKeys();
    res.json({ ok: true });
  } catch (e) {
    console.error('POST indicator-columns:', e.message);
    res.status(500).json({ error: errMsg(e) });
  }
});

app.put('/api/indicator-columns/:id', requireAuth(), requirePerm('indicator_columns', 'edit'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'معرف غير صالح' });
    const { label, formula, formula_expr, unit, target, group, sg, ssg, cls, enabled } = req.body || {};
    if (!label) return res.status(400).json({ error: 'بيانات ناقصة' });
    let fExpr = '';
    if (formula) {
      if (!formula_expr || !FormulaEngine.parseExpr(formula_expr) || /[\u0600-\u06FF]/.test(formula_expr)) return res.status(400).json({ error: 'معادلة غير صالحة' });
      fExpr = formula_expr;
    }
    await db.query(
      'UPDATE indicator_columns SET label = $1, formula = $2, formula_expr = $3, unit = $4, target = $5, grp = $6, sg = $7, ssg = $8, cls = $9, enabled = $10 WHERE id = $11',
      [label, formula ? 1 : 0, fExpr, unit || '', target || '', group || '', sg || '', ssg || '', cls || '', enabled === 0 || enabled === false ? 0 : 1, id]
    );
    await refreshFormulaKeys();
    res.json({ ok: true });
  } catch (e) {
    console.error('PUT indicator-columns:', e.message);
    res.status(500).json({ error: errMsg(e) });
  }
});

app.delete('/api/indicator-columns/:id', requireAuth(), requirePerm('indicator_columns', 'edit'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'معرف غير صالح' });
    const row = await db.query('SELECT static FROM indicator_columns WHERE id = $1', [id]);
    if (row.rows.length === 0) return res.status(404).json({ error: 'غير موجود' });
    if (row.rows[0].static === 1 || row.rows[0].static === true) return res.status(400).json({ error: 'لا يمكن حذف عمود ثابت' });
    await db.query('DELETE FROM indicator_columns WHERE id = $1', [id]);
    await refreshFormulaKeys();
    res.json({ ok: true });
  } catch (e) {
    console.error('DELETE indicator-columns:', e.message);
    res.status(500).json({ error: errMsg(e) });
  }
});

app.post('/api/indicator-columns/reorder', requireAuth(), requirePerm('indicator_columns', 'edit'), async (req, res) => {
  try {
    const { category, ids } = req.body || {};
    if ((category !== 'big' && category !== 'small') || !Array.isArray(ids)) return res.status(400).json({ error: 'بيانات غير صحيحة' });
    for (let i = 0; i < ids.length; i++) {
      await db.query('UPDATE indicator_columns SET ord = $1 WHERE id = $2 AND category = $3', [i, parseInt(ids[i]), category]);
    }
    await refreshFormulaKeys();
    res.json({ ok: true });
  } catch (e) {
    console.error('POST indicator-columns/reorder:', e.message);
    res.status(500).json({ error: errMsg(e) });
  }
});

// ============== Blood Bags Module (أكياس الدم — التتبع الكامل) ==============
const BB_STATUS_LABELS = {
  collected: 'تم التجميع', incomplete: 'لم يكتمل', therapeutic: 'تبرع علاجي',
  fatty: 'دهون', icteric: 'صفراء', lipemic: 'Lipemic plasma', hemolyzed: 'Hemolyzed plasma',
  positive: 'إيجابي فيروس',
  available: 'متاح', returned: 'مرتجع', dispatched: 'مُرسل', reserved: 'محجوز',
  issued: 'مُصرف', reaction: 'تفاعل', disposed: 'مُعدَم'
};
const BB_STOCK_STATUSES = ['available', 'returned'];
const BB_ISSUE_TYPES = ['داخلي', 'فرع', 'هيئة', 'خارجي'];
const BB_COMPAT = {
  'O-': ['O-'], 'O+': ['O+', 'O-'], 'A-': ['A-', 'O-'], 'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'], 'B+': ['B+', 'B-', 'O+', 'O-'], 'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-']
};
function bbCanDonateTo(donorBt, recipientBt) {
  if (!donorBt || !recipientBt) return true;
  const list = BB_COMPAT[recipientBt];
  if (!list) return donorBt === recipientBt;
  return list.indexOf(donorBt) !== -1;
}
function bbTs() { return new Date().toISOString(); }
const bbPad2 = n => String(n).padStart(2, '0');
async function bbAddEvent(bag, event, detail, user, fromHosp, toHosp) {
  try {
    await db.query(
      'INSERT INTO blood_bag_events (bag_id, bag_no, event, from_hospital_id, to_hospital_id, detail, user_id, user_name, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())',
      [bag.id, bag.bag_no || '', event, fromHosp || null, toHosp || null, detail || '', user ? user.id : null, user ? user.name : '']
    );
  } catch (e) { console.error('bbAddEvent:', e.message); }
}
async function bbAllBags() { const r = await db.query('SELECT * FROM blood_bags'); return r.rows; }
async function bbAllHospitals() { const r = await db.query('SELECT * FROM hospitals ORDER BY id'); return r.rows; }

// الأكياس: نطاق الرؤية حسب الدور — كل مستشفى يشوف متاحه فقط (+ الكيس الوارد إليه من إرسال معلّق)
async function bbAllowedHospitalIds(user) {
  if (!user) return null;
  if (user.role === 'admin' || user.role === 'org_supervisor') return null;
  if (user.role === 'hospital' || user.role === 'hospital_manager') {
    const my = parseInt(user.hospitalId) || 0;
    return my ? [my] : [];
  }
  if (user.role === 'branch_supervisor') {
    const g = user.governorate;
    if (!g) return null;
    return (await bbAllHospitals()).filter(h => h.governorate === g).map(h => h.id);
  }
  if (user.role === 'visitor') {
    const ids = (user.viewHospitalIds || []).map(Number).filter(Boolean);
    if (ids.length > 0) return ids;
    if (user.viewPermission === 'limited') return [];
    return null;
  }
  return null;
}
async function bbRoleFilterBags(bags, user) {
  const allowed = await bbAllowedHospitalIds(user);
  if (!allowed) return bags;
  return bags.filter(b =>
    allowed.indexOf(b.hospital_id) !== -1 ||
    (b.status === 'dispatched' && allowed.indexOf(parseInt(b.dispatch_to)) !== -1)
  );
}
async function bbNextBagNo(hospitalId) {
  for (let tries = 0; tries < 50; tries++) {
    let seq = await db.getConfig('bb_seq');
    if (!seq || isNaN(parseInt(seq))) seq = 1; else seq = parseInt(seq) + 1;
    await db.setConfig('bb_seq', seq);
    const d = new Date();
    const no = 'BB-' + bbPad2(d.getFullYear() % 100) + bbPad2(d.getMonth() + 1) + '-' + String(hospitalId).padStart(2, '0') + '-' + String(seq).padStart(4, '0');
    const ex = await db.query('SELECT id FROM blood_bags WHERE bag_no = $1 LIMIT 1', [no]);
    if (ex.rows.length === 0) return no;
  }
  const d = new Date();
  return 'BB-' + bbPad2(d.getFullYear() % 100) + bbPad2(d.getMonth() + 1) + '-' + String(hospitalId).padStart(2, '0') + '-' + String(Date.now() % 100000).padStart(5, '0');
}

// رقم اللي / الباركود لا يتكرران أبداً — يُستثنى فقط مكوّنات نفس التبرع (نفس المجموعة) التي تتشارك نفس الأرقام
// ملاحظة: استعلامات بسيطة عمود واحد (متوافقة مع jsondb الذي لا يدعم OR عالية المستوى في WHERE)
async function bbCheckUniqueNumbers(bagNo, barcode, excludeIds) {
  const ex = new Set((excludeIds || []).map(Number).filter(Boolean));
  const bNo = bagNo ? String(bagNo).trim() : '';
  const bc = barcode ? String(barcode).trim() : '';
  if (bNo) {
    const rows = (await db.query('SELECT id, bag_no FROM blood_bags WHERE bag_no = $1', [bNo])).rows;
    const hit = rows.find(r => !ex.has(Number(r.id)));
    if (hit) return 'رقم اللي «' + hit.bag_no + '» مستخدم بالفعل لكيس آخر — الأرقام لا تتكرر أبداً';
  }
  if (bc) {
    const rows = (await db.query('SELECT id, barcode FROM blood_bags WHERE barcode = $1', [bc])).rows;
    const hit = rows.find(r => !ex.has(Number(r.id)));
    if (hit) return 'الباركود «' + hit.barcode + '» مستخدم بالفعل لكيس آخر — الأرقام لا تتكرر أبداً';
  }
  return null;
}
// فصيلة المنتجات غير الدم (بلازما / صفائح / كرايو) تكون A/B/O/AB بدون موجب أو سالب — الدم الكلي يحتفظ بالموجب والسالب مثل الدم
function bbNormBt(bt, productType) {
  const s = String(bt || '').trim().toUpperCase();
  if (!s) return '';
  const p = productType || 'دم';
  if (p !== 'دم' && p !== 'دم كلي') return s.replace(/[+-]/g, '');
  return s;
}
// صلاحية الكيس المتوقعة حسب المنتج (بالأيام): دم ودم كلي 35 يوماً، بلازما وكرايو سنة (365)، صفائح 5 أيام
const BB_SHELF_DAYS = { 'دم': 35, 'دم كلي': 35, 'بلازما': 365, 'كرايو': 365, 'صفائح SDP': 5, 'صفائح RDP': 5 };
function bbShelfDays(productType) {
  const p = (productType || '').trim();
  return BB_SHELF_DAYS[p] != null ? BB_SHELF_DAYS[p] : 35;
}
// حساب تاريخ انتهاء الصلاحية = تاريخ الأساس (التجميع/الاستلام) + مدة صلاحية المنتج — يرجع YYYY-MM-DD (اليوم إذا لم يوجد تاريخ أساس)
function bbAddDays(dateStr, days) {
  let d;
  if (dateStr) {
    d = new Date(String(dateStr).slice(0, 10) + 'T00:00:00');
    if (isNaN(d.getTime())) d = null;
  }
  if (!d) d = new Date();
  d.setDate(d.getDate() + days);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function bbDefaultExpiry(dateStr, productType) {
  return bbAddDays(dateStr, bbShelfDays(productType));
}

async function bbReleaseExpiredReservations() {
  try {
    const now = Date.now();
    const res = await db.query("SELECT * FROM bag_reservations WHERE status = 'active'");
    for (const r of res.rows) {
      const until = new Date(r.reserved_until).getTime();
      if (!isNaN(until) && until < now) {
        await db.query("UPDATE bag_reservations SET status = 'expired', released_at = NOW() WHERE id = $1", [r.id]);
        const remaining = (await db.query("SELECT * FROM bag_reservations WHERE bag_id = $1 AND status = 'active' ORDER BY id DESC", [r.bag_id])).rows;
        if (remaining.length) {
          const last = remaining[0];
          await db.query("UPDATE blood_bags SET status = 'reserved', recipient_id = $1, recipient_name = $2 WHERE id = $3", [last.patient_id, last.patient_name || '', r.bag_id]);
        } else {
          await db.query("UPDATE blood_bags SET status = 'available', recipient_id = NULL, recipient_name = '' WHERE id = $1", [r.bag_id]);
        }
        const b = (await db.query('SELECT * FROM blood_bags WHERE id = $1', [r.bag_id])).rows[0];
        if (b) await bbAddEvent(b, 'انتهاء مدة الحجز', 'انتهت مدة الحجز (48 ساعة) وتم تفكيكه تلقائياً' + (remaining.length ? ' — الكيس ما زال محجوزاً لمرضى آخرين (' + remaining.length + ')' : ''), null, null, null);
      }
    }
  } catch (e) { console.error('bbReleaseExpiredReservations:', e.message); }
}
async function bbMarkExpiredBags() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const bags = await bbAllBags();
    for (const b of bags) {
      const exp = b.expiry_date ? String(b.expiry_date).slice(0, 10) : '';
      if (exp && exp < today && ['collected', 'available', 'returned', 'dispatched', 'reserved'].indexOf(b.status) !== -1) {
        if (b.status === 'reserved') {
          await db.query("UPDATE bag_reservations SET status = 'expired', released_at = NOW() WHERE bag_id = $1 AND status = 'active'", [b.id]);
        }
        await db.query("UPDATE blood_bags SET status = 'disposed', return_reason = 'انتهاء الصلاحية' WHERE id = $1", [b.id]);
        await bbAddEvent(b, 'انتهاء الصلاحية', 'تم تحويل الكيس للإعدام لانتهاء الصلاحية', null, null, null);
      }
    }
  } catch (e) { console.error('bbMarkExpiredBags:', e.message); }
}

// ----- الأكياس: القائمة -----
app.get('/api/blood-bags', requireAuth(), requirePerm('blood_bags', 'view'), async (req, res) => {
  try {
    await bbReleaseExpiredReservations();
    await bbMarkExpiredBags();
    const { hospitalId, sourceHospitalId, status, bloodType, q, expiring } = req.query;
    let bags = await bbAllBags();
    bags = await bbRoleFilterBags(bags, req.session.user);
    const hospitals = await bbAllHospitals();
    const hospMap = {}; hospitals.forEach(h => { hospMap[h.id] = h; });
    if (hospitalId) bags = bags.filter(b => b.hospital_id === parseInt(hospitalId));
    if (sourceHospitalId) bags = bags.filter(b => b.source_hospital_id === parseInt(sourceHospitalId));
    if (status) bags = bags.filter(b => b.status === status);
    if (bloodType) bags = bags.filter(b => b.blood_type === bloodType);
    if (q) {
      const ql = String(q).toLowerCase();
      bags = bags.filter(b =>
        (b.bag_no || '').toLowerCase().indexOf(ql) !== -1 ||
        (b.barcode || '').toLowerCase().indexOf(ql) !== -1 ||
        (b.donor_name || '').toLowerCase().indexOf(ql) !== -1 ||
        (b.donor_national_id || '').indexOf(ql) !== -1
      );
    }
    if (expiring) {
      const days = parseInt(expiring) || 10;
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const limit = new Date(today); limit.setDate(limit.getDate() + days);
      bags = bags.filter(b => {
        if (!b.expiry_date || BB_STOCK_STATUSES.concat(['dispatched', 'reserved', 'collected']).indexOf(b.status) === -1) return false;
        const ed = new Date(b.expiry_date); ed.setHours(0, 0, 0, 0);
        return ed <= limit;
      });
    }
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const out = bags.map(b => {
      const hosp = hospMap[b.hospital_id], src = hospMap[b.source_hospital_id];
      let daysLeft = null;
      if (b.expiry_date) { const ed = new Date(b.expiry_date); ed.setHours(0, 0, 0, 0); daysLeft = Math.round((ed - today) / 86400000); }
      return Object.assign({}, b, {
        hospital_name: hosp ? hosp.name : '',
        hospital_governorate: hosp ? hosp.governorate : '',
        hospital_type: hosp ? hosp.type : '',
        source_hospital_name: b.source_hospital_id === 0 ? (b.source_name || 'وارد إقليمي (خارجي)') : (src ? src.name : ''),
        status_label: BB_STATUS_LABELS[b.status] || b.status,
        days_left: daysLeft,
        expiring_soon: daysLeft !== null && daysLeft <= 10 && BB_STOCK_STATUSES.concat(['dispatched', 'reserved', 'collected']).indexOf(b.status) !== -1
      });
    });
    out.sort((a, b) => b.id - a.id);
    res.json({ bags: out });
  } catch (e) { console.error('GET blood-bags:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

// ----- الأكياس: إحصائيات اللوحة -----
app.get('/api/blood-bags/stats', requireAuth(), requirePerm('blood_bags', 'view'), async (req, res) => {
  try {
    await bbReleaseExpiredReservations();
    await bbMarkExpiredBags();
    const { hospitalId } = req.query;
    let bags = await bbAllBags();
    bags = await bbRoleFilterBags(bags, req.session.user);
    const hospitals = await bbAllHospitals();
    const hospMap = {}; hospitals.forEach(h => { hospMap[h.id] = h; });
    if (hospitalId) bags = bags.filter(b => b.hospital_id === parseInt(hospitalId));
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const limit10 = new Date(today); limit10.setDate(limit10.getDate() + 10);
    const byHosp = {};
    bags.forEach(b => {
      if (!byHosp[b.hospital_id]) {
        byHosp[b.hospital_id] = {
          hospital_id: b.hospital_id,
          hospital_name: hospMap[b.hospital_id] ? hospMap[b.hospital_id].name : '',
          governorate: hospMap[b.hospital_id] ? hospMap[b.hospital_id].governorate : '',
          type: hospMap[b.hospital_id] ? hospMap[b.hospital_id].type : '',
          total: 0, available: 0, availableByType: {}, byProduct: {}, availableByProduct: {}, collected: 0, dispatched: 0, reserved: 0, issued: 0, expiring: 0, expired: 0, positive: 0, disposed: 0
        };
      }
      const s = byHosp[b.hospital_id];
      const prod = b.product_type || 'دم';
      s.total++;
      s.byProduct[prod] = (s.byProduct[prod] || 0) + 1;
      if (BB_STOCK_STATUSES.indexOf(b.status) !== -1) {
        s.available++;
        s.availableByType[b.blood_type || 'غير محدد'] = (s.availableByType[b.blood_type || 'غير محدد'] || 0) + 1;
        s.availableByProduct[prod] = (s.availableByProduct[prod] || 0) + 1;
      }
      if (b.status === 'collected') s.collected++;
      if (b.status === 'dispatched') s.dispatched++;
      if (b.status === 'reserved') s.reserved++;
      if (b.status === 'issued') s.issued++;
      if (b.status === 'positive') s.positive++;
      if (b.status === 'disposed') s.disposed++;
      if (b.expiry_date && ['available', 'returned', 'dispatched', 'reserved', 'collected'].indexOf(b.status) !== -1) {
        const ed = new Date(b.expiry_date); ed.setHours(0, 0, 0, 0);
        if (ed <= limit10) s.expiring++;
        if (ed < today) s.expired++;
      }
    });
    const list = Object.values(byHosp).sort((a, b) => (a.hospital_name || '').localeCompare(b.hospital_name || '', 'ar'));
    const totals = { total: 0, available: 0, collected: 0, dispatched: 0, reserved: 0, issued: 0, expiring: 0, positive: 0, disposed: 0, availableByType: {}, byProduct: {}, availableByProduct: {} };
    list.forEach(s => {
      totals.total += s.total; totals.available += s.available; totals.collected += s.collected;
      totals.dispatched += s.dispatched; totals.reserved += s.reserved; totals.issued += s.issued;
      totals.expiring += s.expiring; totals.positive += s.positive; totals.disposed += s.disposed;
      Object.entries(s.availableByType).forEach(([k, v]) => { totals.availableByType[k] = (totals.availableByType[k] || 0) + v; });
      Object.entries(s.byProduct).forEach(([k, v]) => { totals.byProduct[k] = (totals.byProduct[k] || 0) + v; });
      Object.entries(s.availableByProduct).forEach(([k, v]) => { totals.availableByProduct[k] = (totals.availableByProduct[k] || 0) + v; });
    });
    res.json({ hospitals: list, totals });
  } catch (e) { console.error('GET blood-bags/stats:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

// ----- الأكياس: إضافة (تسجيل التجميع — دفعة واحدة) -----
app.post('/api/blood-bags', requireAuth(), requirePerm('blood_bags', 'add'), async (req, res) => {
  try {
    const { hospitalId, collectionDate, bags } = req.body || {};
    const hid = parseInt(hospitalId);
    if (!hid || !Array.isArray(bags) || bags.length === 0) return res.status(400).json({ error: 'بيانات ناقصة' });
    if (bags.length > 500) return res.status(400).json({ error: 'الحد الأقصى 500 كيس في المرة الواحدة' });
    const hosp = (await db.query('SELECT type FROM hospitals WHERE id = $1', [hid])).rows[0];
    if (hosp && hosp.type !== 'تجميعي') return res.status(403).json({ error: 'التجميع متاح لبنوك الدم التجميعية فقط' });
    const user = req.session.user;
    const created = [];
    // تمريرة تحقق مسبقة — لا يُكتب أي شيء قبل التأكد من خلو الأرقام من التكرار (لا تكرار في نفس الدفعة ولا في القاعدة)
    const seen = {};
    for (const item of bags) {
      const productType = (item.product_type || '').trim() || 'دم';
      if (productType !== 'دم' && productType !== 'دم كلي' && productType !== 'صفائح SDP' && productType !== 'صفائح RDP')
        return res.status(400).json({ error: 'في التجميع: البلازما والكرايو تابعتان للدم وتُفصلان تلقائياً من كيس الدم — اختر دم أو دم كلي أو صفائح SDP أو صفائح RDP فقط' });
      const bagNo = (item.bag_no || '').trim();
      const barcode = (item.barcode || '').trim();
      if (bagNo && seen['n:' + bagNo]) return res.status(409).json({ error: 'رقم اللي «' + bagNo + '» مكرر في نفس الدفعة — الأرقام لا تتكرر أبداً' });
      if (barcode && seen['b:' + barcode]) return res.status(409).json({ error: 'الباركود «' + barcode + '» مكرر في نفس الدفعة — الأرقام لا تتكرر أبداً' });
      if (bagNo) seen['n:' + bagNo] = 1;
      if (barcode) seen['b:' + barcode] = 1;
      const dupe = await bbCheckUniqueNumbers(bagNo, barcode, []);
      if (dupe) return res.status(409).json({ error: dupe });
    }
    for (const item of bags) {
      const bagNo = (item.bag_no || '').trim() || await bbNextBagNo(hid);
      const barcode = (item.barcode || '').trim();
      const exp = item.expiry_date || null;
      const makeCryo = !!item.cryo;
      const productType = (item.product_type || '').trim() || 'دم';
      const units = parseInt(item.units) || 1;
      const unitCategory = (item.unit_category || 'كبار').trim() === 'أطفال' ? 'أطفال' : 'كبار';
      // أسباب الإعدام حسب المنتج: دم ودم كلي = أسباب عامة فقط، بلازما/كرايو/صفائح = قد تُعدم بأسباب عامة أو أسباب خاصة بالبلازما
      const generalDiscard = ['incomplete', 'therapeutic', 'fatty', 'icteric'];
      const plasmaDiscard = ['lipemic', 'hemolyzed'];
      const usePlasmaDiscard = productType !== 'دم' && productType !== 'دم كلي';
      const status = usePlasmaDiscard
        ? generalDiscard.concat(plasmaDiscard).indexOf(item.status) !== -1 ? item.status : 'collected'
        : generalDiscard.indexOf(item.status) !== -1 ? item.status : 'collected';
      // الصفائح (SDP/RDP) والدم الكلي تُجمع كيساً واحداً مستقلاً — لا فصل
      if (productType !== 'دم') {
        const cExp = exp || bbDefaultExpiry(collectionDate, productType);
        const r = await db.query(
          `INSERT INTO blood_bags (bag_no, barcode, hospital_id, source_hospital_id, collection_date, expiry_date, blood_type, product_type, units, unit_category, donor_name, donor_national_id, donor_age, donor_gender, status, test_hcv, test_hbv, test_hiv, test_syphilis, notes, created_at, updated_at, user_id, donation_id)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,NOW(),NOW(),$21,NULL)`,
          [bagNo, barcode, hid, hid, collectionDate || null, cExp, bbNormBt(item.blood_type, productType), productType, units, unitCategory, item.donor_name || '', item.donor_national_id || '', item.donor_age != null ? parseInt(item.donor_age) : null, item.donor_gender || '', status, '', '', '', '', item.notes || '', user ? user.id : null]
        );
        const bag = r.rows[0];
        const stLabel = BB_STATUS_LABELS[status] || '';
        const det = 'تم تسجيل الكيس (تجميع) | المنتج: ' + productType + ' | عدد الوحدات: ' + units + ' | رقم اللي: ' + bagNo + (stLabel ? ' | إعدام: ' + stLabel : '');
        await bbAddEvent(bag, 'تسجيل كيس جديد', det, user, null, null);
        created.push(bag);
        continue;
      }
      // كل كيس دم مجمّع يُفصل تلقائياً إلى مكونات (دم + بلازما + كرايو اختياري) بنفس رقم اللي والباركود
      const insertComp = async (productType, donationId) => {
        // حقل الصلاحية في صف التجميع خاص بدم فقط — بلازما/كرايو المفصولة تأخذ دائماً مدة صلاحية منتجها (سنة)
        const cExp = productType === 'دم' ? (exp || bbDefaultExpiry(collectionDate, 'دم')) : bbDefaultExpiry(collectionDate, productType);
        // متبرعة حامل أو ولدت → البلازما والكرايو تُعدمان مباشرة (بدون فحص) بسبب «ولادة» — الدم لا يتأثر
        const birthDiscard = !!item.preg && productType !== 'دم';
        const compStatus = birthDiscard ? 'disposed' : status;
        const compReason = birthDiscard ? 'ولادة' : '';
        const r = await db.query(
          `INSERT INTO blood_bags (bag_no, barcode, hospital_id, source_hospital_id, collection_date, expiry_date, blood_type, product_type, units, unit_category, donor_name, donor_national_id, donor_age, donor_gender, status, test_hcv, test_hbv, test_hiv, test_syphilis, test_nat, notes, created_at, updated_at, user_id, donation_id, return_reason)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,NOW(),NOW(),$22,$23,$24)`,
          [bagNo, barcode, hid, hid, collectionDate || null, cExp, bbNormBt(item.blood_type, productType), productType, 1, unitCategory, item.donor_name || '', item.donor_national_id || '', item.donor_age != null ? parseInt(item.donor_age) : null, item.donor_gender || '', compStatus, '', '', '', '', '', item.notes || '', user ? user.id : null, donationId, compReason]
        );
        return r.rows[0];
      };
      const rb = await insertComp('دم', null);
      const donId = rb.id;
      await db.query('UPDATE blood_bags SET donation_id = $1 WHERE id = $2', [donId, rb.id]);
      const comps = [rb, await insertComp('بلازما', donId)];
      if (makeCryo) comps.push(await insertComp('كرايو', donId));
      for (const c of comps) {
        c.donation_id = donId;
        const stLabel = BB_STATUS_LABELS[status] || '';
        const isBirthComp = !!item.preg && c.product_type !== 'دم';
        const det = isBirthComp
          ? 'تم تسجيل الكيس (جمع — مكون من تبرع مفصول) | المنتج: ' + c.product_type + ' | رقم اللي: ' + bagNo + ' | إعدام مباشر: متبرعة حامل أو ولدت (بدون فحص)'
          : 'تم تسجيل الكيس (جمع — مكون من تبرع مفصول) | المنتج: ' + c.product_type + ' | رقم اللي: ' + bagNo + (makeCryo ? ' | المكونات: دم + بلازما + كرايو' : ' | المكونات: دم + بلازما') + (stLabel ? ' | إعدام: ' + stLabel : '');
        await bbAddEvent(c, 'تسجيل كيس جديد', det, user, null, null);
        created.push(c);
      }
    }
    res.json({ ok: true, bags: created });
  } catch (e) { console.error('POST blood-bags:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

// ----- الأكياس: وارد من خارج النظام (وارد إقليمي) — لأي بنك دم (تجميعي أو تخزيني) -----
app.post('/api/blood-bags/external-in', requireAuth(), requirePerm('blood_bags', 'add'), async (req, res) => {
  try {
    const { hospitalId, sourceName, receivedDate, bags } = req.body || {};
    const hid = parseInt(hospitalId);
    const srcName = (sourceName || '').trim();
    if (!hid || !Array.isArray(bags) || bags.length === 0) return res.status(400).json({ error: 'بيانات ناقصة' });
    if (bags.length > 500) return res.status(400).json({ error: 'الحد الأقصى 500 كيس في المرة الواحدة' });
    const user = req.session.user;
    const created = [];
    // تمريرة تحقق مسبقة — لا يُكتب أي شيء قبل التأكد من خلو الأرقام من التكرار
    const seen = {};
    for (const item of bags) {
      const bagNo = (item.bag_no || '').trim();
      const barcode = (item.barcode || '').trim();
      if (bagNo && seen['n:' + bagNo]) return res.status(409).json({ error: 'رقم اللي «' + bagNo + '» مكرر في نفس الدفعة — الأرقام لا تتكرر أبداً' });
      if (barcode && seen['b:' + barcode]) return res.status(409).json({ error: 'الباركود «' + barcode + '» مكرر في نفس الدفعة — الأرقام لا تتكرر أبداً' });
      if (bagNo) seen['n:' + bagNo] = 1;
      if (barcode) seen['b:' + barcode] = 1;
      const dupe = await bbCheckUniqueNumbers(bagNo, barcode, []);
      if (dupe) return res.status(409).json({ error: dupe });
    }
    for (const item of bags) {
      const bagNo = (item.bag_no || '').trim() || await bbNextBagNo(hid);
      const productType = (item.product_type || '').trim() || 'دم';
      const units = parseInt(item.units) || 1;
      const unitCategory = (item.unit_category || 'كبار').trim() === 'أطفال' ? 'أطفال' : 'كبار';
      const barcode = (item.barcode || '').trim();
      const r = await db.query(
        `INSERT INTO blood_bags (bag_no, barcode, hospital_id, source_hospital_id, source_name, collection_date, expiry_date, blood_type, product_type, units, unit_category, donor_name, donor_national_id, donor_age, donor_gender, status, test_hcv, test_hbv, test_hiv, test_syphilis, received_at, received_by, notes, created_at, updated_at, user_id)
         VALUES ($1,$2,$3,0,$4,NULL,$5,$6,$7,$8,$9,'','',NULL,'','available','','','','',$10,$11,$12,NOW(),NOW(),$13)`,
        [bagNo, barcode, hid, srcName, item.expiry_date || bbDefaultExpiry(receivedDate || null, productType), bbNormBt(item.blood_type, productType), productType, units, unitCategory, receivedDate || null, user ? user.name : '', item.notes || '', user ? user.id : null]
      );
      const bag = r.rows[0];
      const det = srcName ? ('وارد من: ' + srcName) : 'وارد إقليمي (خارجي)';
      await bbAddEvent(bag, 'وارد', det + ' — تم تسجيله متاحاً | المنتج: ' + productType + (units > 1 ? ' | عدد الوحدات: ' + units : '') + (bag.blood_type ? ' | الفصيلة: ' + bag.blood_type : ''), user, null, hid);
      created.push(bag);
    }
    res.json({ ok: true, bags: created });
  } catch (e) { console.error('POST external-in:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

// ----- الأكياس: تعديل بيانات كيس -----
app.put('/api/blood-bags/:id', requireAuth(), requirePerm('blood_bags', 'edit'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'معرف غير صالح' });
    const { bag_no, barcode, donor_name, donor_national_id, donor_age, donor_gender, collection_date, expiry_date, blood_type, product_type, units, notes } = req.body || {};
    const old = (await db.query('SELECT * FROM blood_bags WHERE id = $1', [id])).rows[0];
    if (!old) return res.status(404).json({ error: 'الكيس غير موجود' });
    const newBagNo = (bag_no != null ? String(bag_no).trim() : old.bag_no);
    const newBarcode = (barcode != null ? String(barcode).trim() : old.barcode);
    let groupIds = [id];
    if (old.donation_id) {
      groupIds = (await db.query('SELECT id FROM blood_bags WHERE donation_id = $1', [old.donation_id])).rows.map(r => r.id);
    }
    if (newBagNo && newBagNo !== old.bag_no) {
      const dupe = await bbCheckUniqueNumbers(newBagNo, '', groupIds);
      if (dupe) return res.status(409).json({ error: dupe });
    }
    if (newBarcode && newBarcode !== old.barcode) {
      const dupe = await bbCheckUniqueNumbers('', newBarcode, groupIds);
      if (dupe) return res.status(409).json({ error: dupe });
    }
    const newProd = product_type != null ? (product_type.trim() || 'دم') : (old.product_type || 'دم');
    const newBt = blood_type != null ? bbNormBt(blood_type, newProd) : (old.blood_type || '');
    // الصلاحية: قيمة صريحة يرسلها المستخدم تُحترم، تغيير المنتج يعيد حسابها تلقائياً حسب مدة صلاحية المنتج الجديد
    const newColl = collection_date != null ? collection_date : old.collection_date;
    let newExpiry;
    if (expiry_date != null && String(expiry_date).trim() !== '') {
      newExpiry = expiry_date;
    } else if (newProd !== (old.product_type || 'دم')) {
      newExpiry = bbDefaultExpiry(newColl, newProd);
    } else {
      newExpiry = old.expiry_date;
    }
    await db.query(
      `UPDATE blood_bags SET bag_no = $1, barcode = $2, donor_name = $3, donor_national_id = $4, donor_age = $5, donor_gender = $6, collection_date = $7, expiry_date = $8, blood_type = $9, product_type = $10, units = $11, notes = $12, updated_at = NOW() WHERE id = $13`,
      [bag_no != null ? bag_no : old.bag_no, barcode != null ? barcode : old.barcode, donor_name != null ? donor_name : old.donor_name, donor_national_id != null ? donor_national_id : old.donor_national_id, donor_age != null ? parseInt(donor_age) : old.donor_age, donor_gender != null ? donor_gender : old.donor_gender, newColl, newExpiry, newBt, newProd, units != null ? (parseInt(units) || 1) : (old.units || 1), notes != null ? notes : old.notes, id]
    );
    let synced = false;
    if (old.donation_id) {
      const shared = {
        bag_no: bag_no != null ? bag_no : old.bag_no,
        barcode: barcode != null ? barcode : old.barcode,
        collection_date: newColl,
        blood_type: newBt,
        donor_name: donor_name != null ? donor_name : old.donor_name,
        donor_national_id: donor_national_id != null ? donor_national_id : old.donor_national_id,
        donor_age: donor_age != null ? parseInt(donor_age) : old.donor_age,
        donor_gender: donor_gender != null ? donor_gender : old.donor_gender
      };
      const sibs = (await db.query("SELECT * FROM blood_bags WHERE donation_id = $1 AND id != $2 AND status NOT IN ('dispatched','reserved','issued')", [old.donation_id, id])).rows;
      for (const sib of sibs) {
        const sibBt = blood_type != null ? bbNormBt(blood_type, sib.product_type) : (sib.blood_type || '');
        // لا تُنسخ الصلاحية بين المكونات — كل منتج يحتفظ بمدة صلاحيته الخاصة (دم 35 / بلازما وكرايو سنة / صفائح 5)
        await db.query(
          `UPDATE blood_bags SET bag_no = $1, barcode = $2, collection_date = $3, blood_type = $5, donor_name = $6, donor_national_id = $7, donor_age = $8, donor_gender = $9, updated_at = NOW() WHERE id = $10`,
          [shared.bag_no, shared.barcode, shared.collection_date, sibBt, shared.donor_name, shared.donor_national_id, shared.donor_age, shared.donor_gender, sib.id]
        );
      }
      synced = sibs.length > 0;
    }
    await bbAddEvent(old, 'تعديل بيانات الكيس', 'تم تعديل بيانات الكيس' + (synced ? ' وتم تحديث باقي مكونات نفس التبرع' : ''), req.session.user, null, null);
    res.json({ ok: true });
  } catch (e) { console.error('PUT blood-bags:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

// ----- الأكياس: حذف -----
app.delete('/api/blood-bags/:id', requireAuth(), requirePerm('blood_bags', 'delete'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'معرف غير صالح' });
    await db.query('DELETE FROM blood_bag_events WHERE bag_id = $1', [id]);
    await db.query('DELETE FROM bag_reservations WHERE bag_id = $1', [id]);
    await db.query('DELETE FROM blood_bags WHERE id = $1', [id]);
    res.json({ ok: true });
  } catch (e) { console.error('DELETE blood-bags:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

// ----- الأكياس: الفحص والنتائج -----
app.post('/api/blood-bags/:id/test', requireAuth(), requirePerm('blood_bags', 'edit'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { blood_type, hcv, hbv, hiv, syphilis, test_nat } = req.body || {};
    if (!id) return res.status(400).json({ error: 'معرف غير صالح' });
    if (!blood_type) return res.status(400).json({ error: 'أدخل الفصيلة أولاً' });
    const bag = (await db.query('SELECT * FROM blood_bags WHERE id = $1', [id])).rows[0];
    if (!bag) return res.status(404).json({ error: 'الكيس غير موجود' });
    if (bag.status !== 'collected') return res.status(400).json({ error: 'الفحص متاح فقط للأكياس غير المفحوصة' });
    const bagHosp = (await db.query('SELECT type FROM hospitals WHERE id = $1', [bag.hospital_id])).rows[0];
    if (bagHosp && bagHosp.type !== 'تجميعي') return res.status(403).json({ error: 'الفحص متاح لبنوك الدم التجميعية فقط' });
    const results = [hcv, hbv, hiv, syphilis, test_nat].filter(x => x === 'إيجابي');
    const status = results.length > 0 ? 'positive' : 'available';
    const user = req.session.user;
    // الفحص يسري على التبرع كاملاً: كل مكونات نفس التبرع (نفس donation_id) تتأثر بالنتيجة
    const targets = [];
    if (bag.donation_id) {
      targets.push(...(await db.query('SELECT * FROM blood_bags WHERE donation_id = $1', [bag.donation_id])).rows);
    }
    if (!targets.length) targets.push(bag);
    for (const t of targets) {
      const tBt = bbNormBt(blood_type, t.product_type);
      await db.query(
        `UPDATE blood_bags SET blood_type = $1, test_hcv = $2, test_hbv = $3, test_hiv = $4, test_syphilis = $5, test_nat = $6, status = $7, tested_at = NOW(), tested_by = $8, updated_at = NOW() WHERE id = $9`,
        [tBt, hcv || '', hbv || '', hiv || '', syphilis || '', test_nat || '', status, user ? user.name : '', t.id]
      );
      await bbAddEvent(t, status === 'positive' ? 'نتيجة إيجابية' : 'اكتمال الفحص',
        (status === 'positive' ? 'إيجابي — تم إعدام التبرع كاملاً (كل المكونات)' : 'الفحص سليم — المكون متاح') + ' | المنتج: ' + (t.product_type || 'دم') + ' | الفصيلة: ' + (tBt || 'غير محدد') + (results.length ? ' | إيجابي: ' + results.join(',') : ''), user, null, null);
    }
    res.json({ ok: true, status, affected: targets.length });
  } catch (e) { console.error('POST blood-bags/test:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

// ----- الأكياس: تغيير الحالة (لم يكتمل / تبرع علاجي / دهون / صفراء / إعدام) -----
app.post('/api/blood-bags/:id/status', requireAuth(), requirePerm('blood_bags', 'edit'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, reason, unitCategory } = req.body || {};
    if (!id || !status) return res.status(400).json({ error: 'بيانات ناقصة' });
    const allowed = ['incomplete', 'therapeutic', 'fatty', 'icteric', 'lipemic', 'hemolyzed', 'disposed'];
    if (allowed.indexOf(status) === -1) return res.status(400).json({ error: 'حالة غير مسموحة' });
    const bag = (await db.query('SELECT * FROM blood_bags WHERE id = $1', [id])).rows[0];
    if (!bag) return res.status(404).json({ error: 'الكيس غير موجود' });
    const isStock = ['available', 'returned'].indexOf(bag.status) !== -1;
    const isReserved = bag.status === 'reserved';
    if (bag.status !== 'collected' && !isStock && !(isReserved && status === 'disposed')) return res.status(400).json({ error: 'تغيير الحالة متاح لأكياس التجميع فقط' });
    if (isStock && status !== 'disposed') return res.status(400).json({ error: 'الإعدام من الرصيد المتاح فقط (نظام مفتوح / أخرى / شرخ أو كسر / تم الفك و تصرف / Lipemic / Hemolyzed) — فردي على الكيس' });
    if (isReserved && status === 'disposed') {
      await db.query("UPDATE bag_reservations SET status = 'released', released_at = NOW() WHERE bag_id = $1 AND status = 'active'", [bag.id]);
      await db.query("UPDATE blood_bags SET recipient_id = NULL, recipient_name = '', issue_type = '' WHERE id = $1", [bag.id]);
    }
    const newCat = String(unitCategory || bag.unit_category || 'كبار').trim() === 'أطفال' ? 'أطفال' : 'كبار';
    // أسباب إعدام التبرع كاملاً (تُطبق على كل مكونات التبرع) — دم فقط
    const wholeDonationReasons = ['incomplete', 'therapeutic', 'fatty', 'icteric', 'disposed'];
    let affected = 1;
    let targets = [bag];
    if (bag.status === 'collected' && wholeDonationReasons.indexOf(status) !== -1 && (bag.product_type || 'دم') === 'دم' && bag.donation_id) {
      const grp = (await db.query('SELECT * FROM blood_bags WHERE donation_id = $1', [bag.donation_id])).rows;
      if (grp.length > 1) targets = grp;
    }
    const dispLabel = reason || BB_STATUS_LABELS[status] || status;
    for (const t of targets) {
      await db.query('UPDATE blood_bags SET status = $1, return_reason = $2, unit_category = $3, updated_at = NOW() WHERE id = $4', [status, reason || BB_STATUS_LABELS[status] || '', newCat, t.id]);
      await bbAddEvent(t, 'تغيير حالة', (targets.length > 1 ? 'إعدام — ' + dispLabel + ' (كل مكونات التبرع)' : 'إعدام فردي — ' + dispLabel) + ' | المنتج: ' + (t.product_type || 'دم'), req.session.user, null, null);
    }
    affected = targets.length;
    res.json({ ok: true, affected });
  } catch (e) { console.error('POST blood-bags/status:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

// ----- التراجع: إلغاء الإعدام (disposed → available) / إلغاء الصرف (issued → available) -----
app.post('/api/blood-bags/:id/undo', requireAuth(), requirePerm('blood_bags', 'edit'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { mode } = req.body || {};
    if (!id || !mode) return res.status(400).json({ error: 'بيانات ناقصة' });
    if (mode !== 'dispose' && mode !== 'issue') return res.status(400).json({ error: 'نوع التراجع غير صالح' });
    const bag = (await db.query('SELECT * FROM blood_bags WHERE id = $1', [id])).rows[0];
    if (!bag) return res.status(404).json({ error: 'الكيس غير موجود' });
    const user = req.session.user;
    if (user && user.hospitalId && parseInt(user.hospitalId) !== bag.hospital_id) {
      return res.status(403).json({ error: 'يمكنك تعديل كيس من رصيد مستشفاك فقط' });
    }
    if (mode === 'dispose') {
      if (bag.status !== 'disposed') return res.status(400).json({ error: 'إلغاء الإعدام متاح فقط للكيس المُعدَم' });
      await db.query("UPDATE blood_bags SET status = 'available', return_reason = '', updated_at = NOW() WHERE id = $1", [bag.id]);
      await bbAddEvent(bag, 'إلغاء الإعدام', 'أُلغي الإعدام وأُعيد الكيس إلى الرصيد المتاح | المنتج: ' + (bag.product_type || 'دم'), user, null, null);
    } else {
      if (bag.status !== 'issued') return res.status(400).json({ error: 'إلغاء الصرف متاح فقط للكيس المُصرف' });
      const buyer = bag.recipient_name || '';
      const recipientId = bag.recipient_id;
      await db.query("UPDATE blood_bags SET status = 'available', recipient_id = NULL, recipient_name = '', issued_at = NULL, issued_by = '', issue_type = '', updated_at = NOW() WHERE id = $1", [bag.id]);
      await db.query("UPDATE bag_reservations SET status = 'released', released_at = NOW() WHERE bag_id = $1 AND status = 'issued' AND patient_id = $2", [bag.id, recipientId]);
      await bbAddEvent(bag, 'إلغاء الصرف', 'أُلغي الصرف وأُعيد الكيس إلى الرصيد المتاح' + (buyer ? ' | المصروف إليه: ' + buyer : ''), user, null, null);
    }
    res.json({ ok: true, status: 'available' });
  } catch (e) { console.error('POST blood-bags/undo:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

// ----- الإرسال بين المستشفيات -----
app.post('/api/blood-bags/dispatch', requireAuth(), requirePerm('blood_bags', 'edit'), async (req, res) => {
  try {
    const { bagIds, toHospitalId, note } = req.body || {};
    const to = parseInt(toHospitalId);
    if (!Array.isArray(bagIds) || bagIds.length === 0 || !to) return res.status(400).json({ error: 'بيانات ناقصة' });
    const user = req.session.user;
    const sent = [];
    for (const bid of bagIds) {
      const bag = (await db.query('SELECT * FROM blood_bags WHERE id = $1', [parseInt(bid)])).rows[0];
      if (!bag) continue;
      if (user && user.hospitalId && parseInt(user.hospitalId) !== bag.hospital_id) continue;
      if (BB_STOCK_STATUSES.indexOf(bag.status) === -1) continue;
      if (bag.hospital_id === to) continue;
      await db.query("UPDATE blood_bags SET status = 'dispatched', dispatch_from = $1, dispatch_to = $2, dispatched_at = NOW(), updated_at = NOW() WHERE id = $3", [bag.hospital_id, to, bag.id]);
      await bbAddEvent(bag, 'إرسال كيس', 'أُرسل إلى المستشفى المستقبل' + (note ? ' — ' + note : ''), user, bag.hospital_id, to);
      sent.push(bag.id);
    }
    res.json({ ok: true, sent });
  } catch (e) { console.error('POST blood-bags/dispatch:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

// ----- الاستلام: قبول / رفض -----
app.post('/api/blood-bags/receive', requireAuth(), requirePerm('blood_bags', 'edit'), async (req, res) => {
  try {
    const { items } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'بيانات ناقصة' });
    const user = req.session.user;
    const accepted = [], rejected = [];
    for (const it of items) {
      const bag = (await db.query('SELECT * FROM blood_bags WHERE id = $1', [parseInt(it.id)])).rows[0];
      if (!bag || bag.status !== 'dispatched') continue;
      if (it.action === 'accept') {
        const to = bag.dispatch_to || bag.hospital_id;
        await db.query("UPDATE blood_bags SET status = 'available', hospital_id = $1, dispatch_from = NULL, dispatch_to = NULL, received_at = NOW(), received_by = $2, updated_at = NOW() WHERE id = $3", [to, user ? user.name : '', bag.id]);
        await bbAddEvent(bag, 'قبول كيس', 'تم القبول والاستلام بنجاح', user, bag.dispatch_from, to);
        accepted.push(bag.id);
      } else {
        const back = bag.dispatch_from || bag.hospital_id;
        await db.query("UPDATE blood_bags SET status = 'available', hospital_id = $1, dispatch_from = NULL, dispatch_to = NULL, received_at = NULL, notes = CONCAT(COALESCE(notes, ''), ' رفض الاستلام: ', $2), updated_at = NOW() WHERE id = $3", [back, it.reason || 'بدون سبب', bag.id]);
        await bbAddEvent(bag, 'رفض استلام', 'رُفض الاستلام — عاد للمصدر' + (it.reason ? ' — ' + it.reason : ''), user, bag.dispatch_from, bag.hospital_id);
        rejected.push(bag.id);
      }
    }
    res.json({ ok: true, accepted, rejected });
  } catch (e) { console.error('POST blood-bags/receive:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

// ----- سجل الأحداث لكيس -----
app.get('/api/blood-bags/events', requireAuth(), requirePerm('blood_bags', 'view'), async (req, res) => {
  try {
    const bagId = parseInt(req.query.bagId);
    const r = await db.query('SELECT * FROM blood_bag_events WHERE bag_id = $1 ORDER BY id DESC', [bagId]);
    const hospitals = await bbAllHospitals();
    const hospMap = {}; hospitals.forEach(h => { hospMap[h.id] = h; });
    const out = r.rows.map(e => Object.assign({}, e, {
      from_hospital_name: e.from_hospital_id ? (hospMap[e.from_hospital_id] ? hospMap[e.from_hospital_id].name : '') : '',
      to_hospital_name: e.to_hospital_id ? (hospMap[e.to_hospital_id] ? hospMap[e.to_hospital_id].name : '') : ''
    }));
    res.json({ events: out });
  } catch (e) { console.error('GET blood-bags/events:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

// ----- المرضى: بحث -----
app.get('/api/patients', requireAuth(), requirePerm('blood_bags', 'view'), async (req, res) => {
  try {
    const { q } = req.query;
    const rows = (await db.query('SELECT * FROM patients')).rows;
    let out = rows;
    if (q) {
      const ql = String(q).trim().toLowerCase();
      out = rows.filter(p =>
        (p.national_id || '').indexOf(ql) !== -1 ||
        (p.name || '').toLowerCase().indexOf(ql) !== -1
      );
    }
    out = out.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ar'));
    res.json({ patients: out });
  } catch (e) { console.error('GET patients:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

// ----- المرضى: إنشاء / تحديث (برقم قومي فريد) -----
app.post('/api/patients', requireAuth(), requirePerm('blood_bags', 'add'), async (req, res) => {
  try {
    const { national_id, name, gender, birth_date, age, blood_type, phone, governorate, hospital_id, department, notes, bt_cards, bt_date, req_rbc, req_plasma, req_plt, req_cryo } = req.body || {};
    if (!national_id || !name) return res.status(400).json({ error: 'الرقم القومي والاسم مطلوبان' });
    const btD = bt_date || null;
    const nReq = v => (v != null && v !== '') ? parseInt(v) || 0 : 0;
    const exist = (await db.query('SELECT * FROM patients WHERE national_id = $1', [national_id])).rows[0];
    if (exist) {
      const finalBt = exist.blood_type || blood_type || '';
      await db.query(
        'UPDATE patients SET name = $1, gender = $2, birth_date = $3, age = $4, blood_type = $5, phone = $6, governorate = $7, hospital_id = $8, department = $9, notes = $10, bt_cards = $11, bt_date = $12, req_rbc = $13, req_plasma = $14, req_plt = $15, req_cryo = $16, updated_at = NOW() WHERE id = $17',
        [name, gender || exist.gender, birth_date || exist.birth_date, age != null ? parseInt(age) : exist.age, finalBt, phone || exist.phone, governorate || exist.governorate, hospital_id || exist.hospital_id, department || exist.department, notes != null ? notes : exist.notes, bt_cards != null ? parseInt(bt_cards) : exist.bt_cards, btD, nReq(req_rbc), nReq(req_plasma), nReq(req_plt), nReq(req_cryo), exist.id]
      );
      res.json({ patient: Object.assign({}, exist, { name, gender: gender || exist.gender, birth_date: birth_date || exist.birth_date, age: age != null ? parseInt(age) : exist.age, blood_type: finalBt, phone: phone || exist.phone, governorate: governorate || exist.governorate, hospital_id: hospital_id || exist.hospital_id, department: department || exist.department, notes: notes != null ? notes : exist.notes, bt_cards: bt_cards != null ? parseInt(bt_cards) : exist.bt_cards, bt_date: btD, req_rbc: nReq(req_rbc), req_plasma: nReq(req_plasma), req_plt: nReq(req_plt), req_cryo: nReq(req_cryo) }) });
    } else {
      const r = await db.query(
        'INSERT INTO patients (national_id, name, gender, birth_date, age, blood_type, phone, governorate, hospital_id, department, notes, bt_cards, bt_date, req_rbc, req_plasma, req_plt, req_cryo, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,NOW(),NOW())',
        [national_id, name, gender || '', birth_date || null, age != null ? parseInt(age) : null, blood_type || '', phone || '', governorate || '', hospital_id || null, department || '', notes || '', bt_cards != null ? parseInt(bt_cards) : 0, btD, nReq(req_rbc), nReq(req_plasma), nReq(req_plt), nReq(req_cryo)]
      );
      res.json({ patient: r.rows[0] });
    }
  } catch (e) { console.error('POST patients:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

// ----- الأقسام الخاصة بكل مستشفي -----
app.get('/api/hospital-departments', requireAuth(), requirePerm('blood_bags', 'view'), async (req, res) => {
  try {
    const rows = (await db.query('SELECT * FROM hospital_departments ORDER BY id')).rows;
    res.json({ departments: rows });
  } catch (e) { console.error('GET hospital-departments:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

app.post('/api/hospital-departments', requireAuth(), requirePerm('blood_bags', 'edit'), async (req, res) => {
  try {
    const { hospital_id, name } = req.body || {};
    const hid = parseInt(hospital_id);
    const dname = String(name || '').trim();
    if (!hid || !dname) return res.status(400).json({ error: 'بنك الدم واسم القسم مطلوبان' });
    const r = await db.query('INSERT INTO hospital_departments (hospital_id, name) VALUES ($1,$2) RETURNING *', [hid, dname]);
    res.json({ department: r.rows[0] });
  } catch (e) { console.error('POST hospital-departments:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

app.delete('/api/hospital-departments/:id', requireAuth(), requirePerm('blood_bags', 'delete'), async (req, res) => {
  try {
    await db.query('DELETE FROM hospital_departments WHERE id = $1', [parseInt(req.params.id)]);
    res.json({ ok: true });
  } catch (e) { console.error('DELETE hospital-departments:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

// ----- الحجوزات: القائمة -----
app.get('/api/blood-bags/reservations', requireAuth(), requirePerm('blood_bags', 'view'), async (req, res) => {
  try {
    await bbReleaseExpiredReservations();
    const { hospitalId, status } = req.query;
    let rows = (await db.query('SELECT * FROM bag_reservations')).rows;
    const allowedH = await bbAllowedHospitalIds(req.session.user);
    if (allowedH) rows = rows.filter(r => allowedH.indexOf(r.hospital_id) !== -1);
    if (hospitalId) rows = rows.filter(r => r.hospital_id === parseInt(hospitalId));
    if (status) rows = rows.filter(r => r.status === status);
    const bags = await bbAllBags();
    const bagMap = {}; bags.forEach(b => { bagMap[b.id] = b; });
    const patients = (await db.query('SELECT * FROM patients')).rows;
    const patMap = {}; patients.forEach(p => { patMap[p.id] = p; });
    const hospitals = await bbAllHospitals();
    const hospMap = {}; hospitals.forEach(h => { hospMap[h.id] = h; });
    const now = Date.now();
    const out = rows.map(r => {
      const b = bagMap[r.bag_id] || {};
      const p = patMap[r.patient_id] || {};
      const until = new Date(r.reserved_until).getTime();
      const remainingH = !isNaN(until) ? Math.round((until - now) / 3600000) : null;
      return Object.assign({}, r, {
        bag_no: b.bag_no || '', barcode: b.barcode || '', blood_type: b.blood_type || '',
        product_type: b.product_type || 'دم', units: b.units != null ? b.units : 1,
        unit_category: b.unit_category || 'كبار',
        expiry_date: b.expiry_date || '', hospital_name: hospMap[r.hospital_id] ? hospMap[r.hospital_id].name : '',
        governorate: hospMap[r.hospital_id] ? hospMap[r.hospital_id].governorate : '',
        patient_name: r.patient_name || p.name || '', patient_blood_type: p.blood_type || '',
        patient_national_id: p.national_id || '', patient_age: p.age != null ? p.age : null,
        patient_gender: p.gender || '', patient_department: p.department || '',
        remaining_hours: remainingH, status_label: r.status === 'active' ? 'محجوز' : r.status === 'issued' ? 'مُصرف' : r.status === 'expired' ? 'منتهي' : 'مُحرر'
      });
    });
    out.sort((a, b) => b.id - a.id);
    res.json({ reservations: out });
  } catch (e) { console.error('GET reservations:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

// ----- الحجز (cross-match — 48 ساعة) -----
app.post('/api/blood-bags/reserve', requireAuth(), requirePerm('blood_bags', 'edit'), async (req, res) => {
  try {
    const { bagId, patientId, hospitalId, issueType, compatCards } = req.body || {};
    const bid = parseInt(bagId), pid = parseInt(patientId), hid = parseInt(hospitalId);
    if (!bid || !pid || !hid) return res.status(400).json({ error: 'بيانات ناقصة' });
    const bag = (await db.query('SELECT * FROM blood_bags WHERE id = $1', [bid])).rows[0];
    if (!bag) return res.status(404).json({ error: 'الكيس غير موجود' });
    if (BB_STOCK_STATUSES.indexOf(bag.status) === -1 && bag.status !== 'reserved') return res.status(400).json({ error: 'الكيس غير متاح للحجز' });
    if (bag.hospital_id !== hid) return res.status(400).json({ error: 'هذا الكيس ليس من رصيد بنك الدم المحدد — لا يمكن حجزه' });
    const user = req.session.user;
    if (user && user.hospitalId && parseInt(user.hospitalId) !== bag.hospital_id) {
      return res.status(403).json({ error: 'يمكنك حجز كيس من رصيد مستشفاك فقط' });
    }
    const patient = (await db.query('SELECT * FROM patients WHERE id = $1', [pid])).rows[0];
    if (!patient) return res.status(404).json({ error: 'المريض غير موجود' });
    if (patient.blood_type && bag.blood_type && !bbCanDonateTo(bag.blood_type, patient.blood_type)) {
      return res.status(400).json({ error: 'عدم توافق الفصائل — كيس ' + bag.blood_type + ' لا يصلح لمريض ' + patient.blood_type });
    }
    const dup = (await db.query("SELECT * FROM bag_reservations WHERE bag_id = $1 AND patient_id = $2 AND status = 'active'", [bid, pid])).rows[0];
    if (dup) return res.status(400).json({ error: 'هذا المريض لديه حجز نشط على هذا الكيس بالفعل' });
    const until = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    const cards = compatCards != null ? parseInt(compatCards) : 0;
    const r = await db.query(
      'INSERT INTO bag_reservations (bag_id, patient_id, patient_name, hospital_id, reserved_at, reserved_until, status, compat_cards, user_id) VALUES ($1,$2,$3,$4,NOW(),$5,$6,$7,$8)',
      [bid, pid, patient.name, hid, until, 'active', cards, user ? user.id : null]
    );
    await db.query("UPDATE blood_bags SET status = 'reserved', recipient_id = $1, recipient_name = $2, issue_type = $3, updated_at = NOW() WHERE id = $4", [pid, patient.name, BB_ISSUE_TYPES.indexOf(issueType) !== -1 ? issueType : 'داخلي', bid]);
    await bbAddEvent(bag, 'حجز كيس', 'حجز لمريض: ' + patient.name + ' — ' + bag.blood_type + ' → ' + (patient.blood_type || 'غير محدد') + ' | كروت التوافق: ' + cards + ' | الصرف خلال 48 ساعة', user, null, null);
    res.json({ ok: true, reservation: r.rows[0] });
  } catch (e) { console.error('POST reserve:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

// ----- الصرف للمريض -----
app.post('/api/blood-bags/issue', requireAuth(), requirePerm('blood_bags', 'edit'), async (req, res) => {
  try {
    const { reservationId, issuedDepartment, unitCategory } = req.body || {};
    const rid = parseInt(reservationId);
    if (!rid) return res.status(400).json({ error: 'معرف غير صالح' });
    const resv = (await db.query('SELECT * FROM bag_reservations WHERE id = $1', [rid])).rows[0];
    if (!resv) return res.status(404).json({ error: 'الحجز غير موجود' });
    if (resv.status !== 'active') return res.status(400).json({ error: 'الحجز غير نشط' });
    const bag = (await db.query('SELECT * FROM blood_bags WHERE id = $1', [resv.bag_id])).rows[0];
    if (!bag || bag.status !== 'reserved') return res.status(400).json({ error: 'الكيس غير محجوز' });
    const newCat = String(unitCategory || bag.unit_category || 'كبار').trim() === 'أطفال' ? 'أطفال' : 'كبار';
    const user = req.session.user;
    await db.query("UPDATE blood_bags SET status = 'issued', issued_at = NOW(), issued_by = $1, recipient_id = $2, recipient_name = $3, unit_category = $4, updated_at = NOW() WHERE id = $5",
      [user ? user.name : '', resv.patient_id, resv.patient_name || '', newCat, bag.id]);
    await db.query("UPDATE bag_reservations SET status = 'issued', issued_at = NOW(), issued_by = $1, issued_department = $3 WHERE id = $2", [user ? user.name : '', rid, issuedDepartment || '']);
    const others = (await db.query("SELECT * FROM bag_reservations WHERE bag_id = $1 AND status = 'active' AND id != $2", [bag.id, rid])).rows;
    if (others.length) {
      await db.query("UPDATE bag_reservations SET status = 'released', released_at = NOW() WHERE bag_id = $1 AND status = 'active' AND id != $2", [bag.id, rid]);
      for (const o of others) {
        await bbAddEvent(bag, 'تفكيك حجز', 'تفكك الحجز تلقائياً بعد صرف الكيس لمريض آخر: ' + (o.patient_name || ''), user, null, null);
      }
    }
    await bbAddEvent(bag, 'صرف كيس', 'صُرف للمريض: ' + (resv.patient_name || '') + ' (' + (bag.issue_type || 'داخلي') + ')' + (issuedDepartment ? ' — القسم المصرف له: ' + issuedDepartment : '') + (others.length ? ' — تفككت تلقائياً ' + others.length + ' حجز أخرى' : ''), user, null, null);
    res.json({ ok: true });
  } catch (e) { console.error('POST issue:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

// ----- الصرف المباشر (بلازما / صفائح / كرايو — بدون حجز) -----
app.post('/api/blood-bags/issue-direct', requireAuth(), requirePerm('blood_bags', 'edit'), async (req, res) => {
  try {
    const { bagId, patientId, issueType, issuedDepartment, unitCategory } = req.body || {};
    const bid = parseInt(bagId), pid = parseInt(patientId);
    if (!bid || !pid) return res.status(400).json({ error: 'بيانات ناقصة — الكيس والمريض مطلوبان' });
    const bag = (await db.query('SELECT * FROM blood_bags WHERE id = $1', [bid])).rows[0];
    if (!bag) return res.status(404).json({ error: 'الكيس غير موجود' });
    if (BB_STOCK_STATUSES.indexOf(bag.status) === -1) return res.status(400).json({ error: 'الكيس غير متاح للصرف المباشر' });
    const newCat = String(unitCategory || bag.unit_category || 'كبار').trim() === 'أطفال' ? 'أطفال' : 'كبار';
    if ((bag.product_type || 'دم') === 'دم') return res.status(400).json({ error: 'أكياس الدم تُحجز أولاً (48 ساعة) من تبويب الفصائل والتوافق — الصرف المباشر للبلازما / الصفائح / الكرايو فقط' });
    const user = req.session.user;
    if (user && user.hospitalId && parseInt(user.hospitalId) !== bag.hospital_id) {
      return res.status(403).json({ error: 'يمكنك صرف كيس من رصيد مستشفاك فقط' });
    }
    const patient = (await db.query('SELECT * FROM patients WHERE id = $1', [pid])).rows[0];
    if (!patient) return res.status(404).json({ error: 'المريض غير موجود' });
    const it = BB_ISSUE_TYPES.indexOf(issueType) !== -1 ? issueType : 'داخلي';
    await db.query("UPDATE blood_bags SET status = 'issued', issued_at = NOW(), issued_by = $1, recipient_id = $2, recipient_name = $3, issue_type = $4, unit_category = $5, updated_at = NOW() WHERE id = $6",
      [user ? user.name : '', pid, patient.name, it, newCat, bid]);
    const r = await db.query('INSERT INTO bag_reservations (bag_id, patient_id, patient_name, hospital_id, reserved_at, reserved_until, status, compat_cards, user_id, issued_at, issued_department) VALUES ($1,$2,$3,$4,NOW(),NOW(),$5,0,$6,NOW(),$7) RETURNING *',
      [bid, pid, patient.name, bag.hospital_id, 'issued', user ? user.id : null, issuedDepartment || '']);
    await bbAddEvent(bag, 'صرف كيس', 'صرف مباشر (بدون حجز) — المنتج: ' + (bag.product_type || 'دم') + ' لمريض: ' + patient.name + ' (' + it + ')' + (issuedDepartment ? ' — القسم المصرف له: ' + issuedDepartment : ''), user, null, null);
    res.json({ ok: true, reservation: r.rows[0] });
  } catch (e) { console.error('POST issue-direct:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

// ----- تفكيك الحجز يدوياً -----
app.post('/api/blood-bags/release-reservation', requireAuth(), requirePerm('blood_bags', 'edit'), async (req, res) => {
  try {
    const { reservationId, reason } = req.body || {};
    const rid = parseInt(reservationId);
    if (!rid) return res.status(400).json({ error: 'معرف غير صالح' });
    const resv = (await db.query('SELECT * FROM bag_reservations WHERE id = $1', [rid])).rows[0];
    if (!resv) return res.status(404).json({ error: 'الحجز غير موجود' });
    if (resv.status !== 'active') return res.status(400).json({ error: 'الحجز غير نشط' });
    await db.query("UPDATE bag_reservations SET status = 'released', released_at = NOW() WHERE id = $1", [rid]);
    const remaining = (await db.query("SELECT * FROM bag_reservations WHERE bag_id = $1 AND status = 'active' ORDER BY id DESC", [resv.bag_id])).rows;
    if (remaining.length) {
      const last = remaining[0];
      await db.query("UPDATE blood_bags SET status = 'reserved', recipient_id = $1, recipient_name = $2 WHERE id = $3", [last.patient_id, last.patient_name || '', resv.bag_id]);
    } else {
      await db.query("UPDATE blood_bags SET status = 'available', recipient_id = NULL, recipient_name = '' WHERE id = $1", [resv.bag_id]);
    }
    const bag = (await db.query('SELECT * FROM blood_bags WHERE id = $1', [resv.bag_id])).rows[0];
    if (bag) await bbAddEvent(bag, 'تفكيك حجز', 'تم تفكيك الحجز' + (remaining.length ? ' — الكيس ما زال محجوزاً لمرضى آخرين (' + remaining.length + ')' : ' وإعادة الكيس للرصيد') + (reason ? ' — ' + reason : ''), req.session.user, null, null);
    res.json({ ok: true, remaining: remaining.length });
  } catch (e) { console.error('POST release-reservation:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

// ----- تجديد الحجز (48 ساعة إضافية) -----
app.post('/api/blood-bags/renew-reservation', requireAuth(), requirePerm('blood_bags', 'edit'), async (req, res) => {
  try {
    const { reservationId } = req.body || {};
    const rid = parseInt(reservationId);
    if (!rid) return res.status(400).json({ error: 'معرف غير صالح' });
    const resv = (await db.query('SELECT * FROM bag_reservations WHERE id = $1', [rid])).rows[0];
    if (!resv) return res.status(404).json({ error: 'الحجز غير موجود' });
    if (resv.status !== 'active') return res.status(400).json({ error: 'الحجز غير نشط' });
    const bag = (await db.query('SELECT * FROM blood_bags WHERE id = $1', [resv.bag_id])).rows[0];
    if (!bag || bag.status !== 'reserved') return res.status(400).json({ error: 'الكيس غير محجوز' });
    const until = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    await db.query('UPDATE bag_reservations SET reserved_until = $1, status = \'active\' WHERE id = $2', [until, rid]);
    await bbAddEvent(bag, 'تجديد حجز', 'تم تجديد حجز الكيس لمريض: ' + (resv.patient_name || '') + ' — 48 ساعة إضافية', req.session.user, null, null);
    res.json({ ok: true, reserved_until: until });
  } catch (e) { console.error('POST renew-reservation:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

// ----- المرتجع / التفاعل / أخرى -----
app.post('/api/blood-bags/return', requireAuth(), requirePerm('blood_bags', 'edit'), async (req, res) => {
  try {
    const { bagId, returnType, detail } = req.body || {};
    const bid = parseInt(bagId);
    if (!bid || !returnType) return res.status(400).json({ error: 'بيانات ناقصة' });
    const bag = (await db.query('SELECT * FROM blood_bags WHERE id = $1', [bid])).rows[0];
    if (!bag) return res.status(404).json({ error: 'الكيس غير موجود' });
    if (bag.status !== 'issued') return res.status(400).json({ error: 'المرتجع/التفاعل متاح فقط للكيس المُصرف' });
    // إعدام الكيس المُصرف (مرتجع/تفاعل/نظام مفتوح/أخرى) متاح فقط خلال 4 ساعات من الصرف
    if (bag.issued_at && (Date.now() - new Date(bag.issued_at).getTime()) > 4 * 3600000) {
      return res.status(400).json({ error: 'انتهت فترة الإعدام — يُسمح بالمرتجع / التفاعل / نظام مفتوح / أخرى خلال 4 ساعات فقط من الصرف' });
    }
    let newStatus = 'disposed', label = 'أخرى';
    if (returnType === 'returned') { newStatus = 'returned'; label = 'مرتجع'; }
    else if (returnType === 'reaction') { newStatus = 'reaction'; label = 'تفاعل'; }
    else if (returnType === 'open') { newStatus = 'disposed'; label = 'نظام مفتوح'; }
    await db.query('UPDATE blood_bags SET status = $1, return_reason = $2, notes = CONCAT(COALESCE(notes, \'\'), \' [\', $3, \']\'), updated_at = NOW() WHERE id = $4', [newStatus, label, detail || '', bid]);
    await bbAddEvent(bag, 'إرجاع / إعدام', label + (detail ? ' — ' + detail : ''), req.session.user, null, null);
    res.json({ ok: true, status: newStatus });
  } catch (e) { console.error('POST return:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

// ----- البيانات الشهرية: الحساب التلقائي من الأكياس -----
const BB_BTYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
function bbZeroCons() { const o = {}; BB_BTYPES.forEach(t => { o[t] = 0; }); return o; }
function bbZeroBig() {
  return { collect_total: 0, donation_therapeutic: 0, uncompleted: 0, refused_fatty: 0, refused_icteric: 0, virology_c: 0, virology_b: 0, virology_i: 0, virology_dollar: 0, blood_groups: 0, compatibility: 0, inc_regional: 0, disp_returned: 0, disp_reaction: 0, disp_open: 0, disp_other: 0, disp_exp_blood: 0, child_inc_collected: 0, child_inc_regional: 0, child_out_blood: 0, child_blood_groups: 0, child_compatibility: 0, child_disp_exp: 0, child_disp_returned: 0, child_disp_reaction: 0, child_disp_open: 0, child_disp_other: 0 };
}
function bbZeroSmall() {
  return { inc_collected: 0, inc_regional: 0, out_blood: 0, out_blood_int: 0, out_blood_branch: 0, out_blood_auth: 0, out_blood_ext: 0, compatibility: 0, disp_returned: 0, disp_reaction: 0, disp_open: 0, disp_other: 0, disp_exp_blood: 0, child_inc_collected: 0, child_inc_regional: 0, child_out_blood: 0, child_blood_groups: 0, child_compatibility: 0, child_disp_exp: 0, child_disp_returned: 0, child_disp_reaction: 0, child_disp_open: 0, child_disp_other: 0 };
}
// إعدام «أخرى» في الشهري: Lipemic/Hemolyzed (تجميع) أو أي كيس مُعدَم بغير «نظام مفتوح» و«انتهاء الصلاحية»
// (صرف: أخرى — رصيد: شرخ أو كسر / تم الفك و تصرف / Lipemic / Hemolyzed)
function bbIsDispOther(b) {
  if (b.status === 'lipemic' || b.status === 'hemolyzed') return true;
  if (b.status === 'disposed' && b.return_reason && ['أخرى', 'شرخ أو كسر', 'تم الفك و تصرف', 'Lipemic', 'Hemolyzed'].indexOf(b.return_reason) !== -1) return true;
  return false;
}
async function bbComputeRange(from, to, user) {
  await bbReleaseExpiredReservations();
  await bbMarkExpiredBags();
  let bags = await bbAllBags();
  if (user) bags = await bbRoleFilterBags(bags, user);
  const hospitals = await bbAllHospitals();
  const allowedH = await bbAllowedHospitalIds(user);
  const hospList = allowedH ? hospitals.filter(h => allowedH.indexOf(h.id) !== -1) : hospitals;
  const reservations = (await db.query('SELECT * FROM bag_reservations')).rows;
  const inRange = d => { if (!d) return false; const s = String(d).slice(0, 10); return s >= from && s <= to; };
  const big = {}, small = {}, cons = {};
  hospList.forEach(h => {
    if (h.type === 'تجميعي') big[h.id] = bbZeroBig();
    else if (h.type === 'تخزيني') small[h.id] = bbZeroSmall();
    cons[h.id] = bbZeroCons();
  });
  for (const b of bags) {
    const isChild = (b.unit_category || 'كبار') === 'أطفال';
    // مؤشرات التجميع تُحسب مرة واحدة لكل تبرع (مكوّن الدم فقط) — التبرع الواحد = عملية تجميع واحدة
    if (big[b.source_hospital_id] && inRange(b.collection_date) && (b.product_type || 'دم') === 'دم') {
      const row = big[b.source_hospital_id];
      row.collect_total++;
      if (b.status === 'therapeutic') row.donation_therapeutic++;
      else if (b.status === 'incomplete') row.uncompleted++;
      else if (b.status === 'fatty') row.refused_fatty++;
      else if (b.status === 'icteric') row.refused_icteric++;
      else if (b.test_hcv === 'إيجابي') row.virology_c++;
      else if (b.test_hbv === 'إيجابي') row.virology_b++;
      else if (b.test_hiv === 'إيجابي') row.virology_i++;
      else if (b.test_syphilis === 'إيجابي') row.virology_dollar++;
      if (b.blood_type && b.status !== 'positive') row.blood_groups++;
      if (isChild && b.blood_type && b.status !== 'positive') row.child_blood_groups++;
    }
    // الإعدامات والمرتجعات والتفاعل: لكل وحدة فعلية (المكونات المنفصلة تُحسب كل منها)
    // مرتجع (صرف) → disp_returned، تفاعل (صرف) → disp_reaction، نظام مفتوح (صرف) → disp_open، Lipemic/Hemolyzed (تجميع) أو أخرى (صرف) → disp_other
    // إعدام «انتهاء الصلاحية» يُحسب لاحقاً (يُعدَم تلقائياً كسبب مستقل وليس سبب تجميع/صرف)
    if (big[b.source_hospital_id] && inRange(b.collection_date)) {
      const row = big[b.source_hospital_id];
      if (b.return_reason === 'مرتجع') row.disp_returned++;
      if (b.status === 'reaction') row.disp_reaction++;
      if (b.status === 'disposed' && b.return_reason === 'نظام مفتوح') row.disp_open++;
      if (bbIsDispOther(b)) row.disp_other++;
      if (isChild) {
        if (b.return_reason === 'مرتجع') row.child_disp_returned++;
        if (b.status === 'reaction') row.child_disp_reaction++;
        if (b.status === 'disposed' && b.return_reason === 'نظام مفتوح') row.child_disp_open++;
        if (bbIsDispOther(b)) row.child_disp_other++;
      }
    }
    if (b.source_hospital_id !== 0 && small[b.hospital_id] && inRange(b.received_at)) small[b.hospital_id].inc_collected++;
    if (b.source_hospital_id !== 0 && isChild && small[b.hospital_id] && inRange(b.received_at)) small[b.hospital_id].child_inc_collected++;
    if (b.source_hospital_id !== 0 && isChild && big[b.hospital_id] && inRange(b.received_at)) big[b.hospital_id].child_inc_collected++;
    if (b.source_hospital_id === 0 && small[b.hospital_id] && inRange(b.received_at)) small[b.hospital_id].inc_regional++;
    if (b.source_hospital_id === 0 && isChild && small[b.hospital_id] && inRange(b.received_at)) small[b.hospital_id].child_inc_regional++;
    if (b.source_hospital_id === 0 && big[b.hospital_id] && inRange(b.received_at)) big[b.hospital_id].inc_regional++;
    if (b.source_hospital_id === 0 && isChild && big[b.hospital_id] && inRange(b.received_at)) big[b.hospital_id].child_inc_regional++;
    if (small[b.hospital_id] && inRange(b.issued_at)) {
      const row = small[b.hospital_id];
      row.out_blood++;
      if (isChild) row.child_out_blood++;
      if (b.issue_type === 'فرع') row.out_blood_branch++;
      else if (b.issue_type === 'هيئة') row.out_blood_auth++;
      else if (b.issue_type === 'خارجي') row.out_blood_ext++;
      else row.out_blood_int++;
      if (b.return_reason === 'مرتجع') row.disp_returned++;
      if (b.status === 'reaction') row.disp_reaction++;
      if (b.status === 'disposed' && b.return_reason === 'نظام مفتوح') row.disp_open++;
      if (bbIsDispOther(b)) row.disp_other++;
      if (isChild) {
        if (b.return_reason === 'مرتجع') row.child_disp_returned++;
        if (b.status === 'reaction') row.child_disp_reaction++;
        if (b.status === 'disposed' && b.return_reason === 'نظام مفتوح') row.child_disp_open++;
        if (bbIsDispOther(b)) row.child_disp_other++;
      }
    }
    // إعدام من الرصيد المتاح (كيس لم يُصرف أبداً) — يُحسب في مؤشرات التخزيني حسب تاريخ الوارد
    if (small[b.hospital_id] && !b.issued_at && inRange(b.received_at)) {
      const row = small[b.hospital_id];
      if (b.return_reason === 'مرتجع') row.disp_returned++;
      if (b.status === 'reaction') row.disp_reaction++;
      if (b.status === 'disposed' && b.return_reason === 'نظام مفتوح') row.disp_open++;
      if (bbIsDispOther(b)) row.disp_other++;
      if (isChild) {
        if (b.return_reason === 'مرتجع') row.child_disp_returned++;
        if (b.status === 'reaction') row.child_disp_reaction++;
        if (b.status === 'disposed' && b.return_reason === 'نظام مفتوح') row.child_disp_open++;
        if (bbIsDispOther(b)) row.child_disp_other++;
      }
    }
    if (cons[b.hospital_id] && b.blood_type && inRange(b.issued_at)) cons[b.hospital_id][b.blood_type]++;
  }
  const bagMap = {}; bags.forEach(b => { bagMap[b.id] = b; });
  reservations.forEach(r => {
    if (inRange(r.reserved_at)) {
      const rcat = bagMap[r.bag_id] ? (bagMap[r.bag_id].unit_category || 'كبار') : 'كبار';
      if (big[r.hospital_id]) {
        big[r.hospital_id].compatibility++;
        if (rcat === 'أطفال') big[r.hospital_id].child_compatibility++;
      }
      if (small[r.hospital_id]) {
        small[r.hospital_id].compatibility++;
        if (rcat === 'أطفال') small[r.hospital_id].child_compatibility++;
      }
    }
  });
  return { big, small, cons };
}
async function bbComputeMonthly(year, month, user) {
  const from = year + '-' + bbPad2(month) + '-01';
  const to = year + '-' + bbPad2(month) + '-31';
  return bbComputeRange(from, to, user);
}
app.get('/api/blood-bags/monthly-preview', requireAuth(), requirePerm('blood_bags', 'view'), async (req, res) => {
  try {
    const year = parseInt(req.query.year), month = parseInt(req.query.month);
    if (!year || !month) return res.status(400).json({ error: 'حدد السنة والشهر' });
    const { big, small, cons } = await bbComputeMonthly(year, month, req.session.user);
    const hospitals = await bbAllHospitals();
    const hospMap = {}; hospitals.forEach(h => { hospMap[h.id] = h; });
    res.json({ big, small, cons, hospitals: hospMap });
  } catch (e) { console.error('GET monthly-preview:', e.message); res.status(500).json({ error: errMsg(e) }); }
});
app.post('/api/blood-bags/generate-monthly', requireAuth(), requirePerm('blood_bags', 'edit'), async (req, res) => {
  try {
    const year = parseInt(req.body.year), month = parseInt(req.body.month);
    if (!year || !month) return res.status(400).json({ error: 'حدد السنة والشهر' });
    const user = req.session.user;
    const { big, small, cons } = await bbComputeMonthly(year, month, user);
    let bigCount = 0, smallCount = 0, consCount = 0;
    for (const hid of Object.keys(big)) {
      const id = parseInt(hid);
      const ex = await db.query('SELECT id FROM monthly_big_indicators WHERE hospital_id = $1 AND year = $2 AND month = $3', [id, year, month]);
      if (ex.rows.length) {
        await db.query('UPDATE monthly_big_indicators SET data = $1, user_id = $2 WHERE id = $3', [JSON.stringify(big[id]), user ? user.id : null, ex.rows[0].id]);
      } else {
        await db.query('INSERT INTO monthly_big_indicators (hospital_id, year, month, data, user_id) VALUES ($1,$2,$3,$4,$5)', [id, year, month, JSON.stringify(big[id]), user ? user.id : null]);
      }
      bigCount++;
    }
    for (const hid of Object.keys(small)) {
      const id = parseInt(hid);
      const ex = await db.query('SELECT id FROM monthly_small_indicators WHERE hospital_id = $1 AND year = $2 AND month = $3', [id, year, month]);
      if (ex.rows.length) {
        await db.query('UPDATE monthly_small_indicators SET data = $1, user_id = $2 WHERE id = $3', [JSON.stringify(small[id]), user ? user.id : null, ex.rows[0].id]);
      } else {
        await db.query('INSERT INTO monthly_small_indicators (hospital_id, year, month, data, user_id) VALUES ($1,$2,$3,$4,$5)', [id, year, month, JSON.stringify(small[id]), user ? user.id : null]);
      }
      smallCount++;
    }
    for (const hid of Object.keys(cons)) {
      const id = parseInt(hid);
      const ex = await db.query('SELECT id FROM monthly_consumption WHERE hospital_id = $1 AND year = $2 AND month = $3', [id, year, month]);
      if (ex.rows.length) {
        await db.query('UPDATE monthly_consumption SET blood_types = $1, user_id = $2 WHERE id = $3', [JSON.stringify(cons[id]), user ? user.id : null, ex.rows[0].id]);
      } else {
        await db.query('INSERT INTO monthly_consumption (hospital_id, year, month, blood_types, user_id) VALUES ($1,$2,$3,$4,$5)', [id, year, month, JSON.stringify(cons[id]), user ? user.id : null]);
      }
      consCount++;
    }
    res.json({ ok: true, big: bigCount, small: smallCount, consumption: consCount });
  } catch (e) { console.error('POST generate-monthly:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

// ----- إحصائيات بين فترتين (نطاق تاريخ من/إلى) — الحساب التلقائي من الأكياس -----
app.get('/api/blood-bags/stats-range', requireAuth(), requirePerm('blood_bags', 'view'), async (req, res) => {
  try {
    const from = (req.query.from || '').trim(), to = (req.query.to || '').trim();
    if (!from || !to) return res.status(400).json({ error: 'حدد تاريخ البداية والنهاية' });
    const { big, small, cons } = await bbComputeRange(from, to, req.session.user);
    const hospitals = await bbAllHospitals();
    const hospMap = {}; hospitals.forEach(h => { hospMap[h.id] = h; });
    res.json({ big, small, cons, hospitals: hospMap, from, to });
  } catch (e) { console.error('GET stats-range:', e.message); res.status(500).json({ error: errMsg(e) }); }
});

// ============== Indicator Analysis (تحليل مؤشرات الأداء) ==============
app.get('/api/indicator-analysis', requireAuth(), requirePerm('indicator_analysis', 'view'), async (req, res) => {
  try {
    const { year1, months1, year2, months2, governorate, hospitalId } = req.query;
    if (!year1 || !months1 || !year2 || !months2) return res.status(400).json({ error: 'يجب تحديد الفترتين' });
    const m1 = months1.split(',').map(Number);
    const m2 = months2.split(',').map(Number);
    const y1 = parseInt(year1), y2 = parseInt(year2);

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
            if (FORMULA_KEYS.has(k)) continue;
            if (typeof v === 'number') agg[k] = (agg[k] || 0) + v;
            else if (!agg[k]) agg[k] = v;
          }
        }
        h.data = agg;
        h.monthCount = h.records.length;
      }
      return Object.values(map);
    }

    async function fetchFromArchive(archiveType, year, months) {
      const isPG = db.mode === 'pg';
      if (isPG) {
        try {
          let sql = `SELECT (elem->>'hospital_id')::int as hospital_id,
            elem->>'hospital_name' as hospital_name,
            elem->>'governorate' as governorate,
            (elem->>'year')::int as rec_year,
            (elem->>'month')::int as rec_month,
            elem->'data' as data
            FROM archives, jsonb_array_elements(data) AS elem
            WHERE type = $1
            AND (elem->>'year')::int = $2
            AND (elem->>'month')::int = ANY($3)`;
          const params = [archiveType, year, months];
          if (governorate) { sql += ` AND elem->>'governorate' = $4`; params.push(governorate); }
          if (hospitalId) { sql += ` AND (elem->>'hospital_id')::int = $5`; params.push(parseInt(hospitalId)); }
          sql += ' ORDER BY elem->>\'governorate\', elem->>\'hospital_name\', (elem->>\'month\')::int';
          const rows = (await query(sql, params)).rows;
          if (rows.length > 0) return rows.map(r => ({ hospital_id: r.hospital_id, hospital_name: r.hospital_name, governorate: r.governorate, rec_year: r.rec_year, rec_month: r.rec_month, data: r.data }));
        } catch (e) {}
      }
      const archives = await db.getTable('archives');
      const results = [];
      for (const arch of archives) {
        if (arch.type !== archiveType) continue;
        const raw = typeof arch.data === 'string' ? JSON.parse(arch.data) : arch.data;
        const items = Array.isArray(raw) ? raw : [];
        for (const item of items) {
          if (item.year !== year || !months.includes(item.month)) continue;
          if (governorate && item.governorate !== governorate) continue;
          if (hospitalId && String(item.hospital_id) !== String(parseInt(hospitalId))) continue;
          results.push({ hospital_id: item.hospital_id, hospital_name: item.hospital_name, governorate: item.governorate, rec_year: item.year, rec_month: item.month, data: item.data || {} });
        }
      }
      return results;
    }

    async function fetchFromTable(table, year, months) {
      let sql = `SELECT mi.hospital_id, mi.data, h.name as hospital_name, h.governorate
        FROM ${table} mi JOIN hospitals h ON h.id = mi.hospital_id
        WHERE mi.year = $1 AND mi.month = ANY($2)`;
      const params = [year, months];
      if (governorate) { sql += ` AND h.governorate = $3`; params.push(governorate); }
      if (hospitalId) { sql += ` AND mi.hospital_id = $4`; params.push(parseInt(hospitalId)); }
      sql += ' ORDER BY h.governorate, h.name, mi.month';
      return (await query(sql, params)).rows;
    }

    async function mergeSources(archiveType, table, year, months) {
      const [archRows, tblRows] = await Promise.all([
        fetchFromArchive(archiveType, year, months),
        fetchFromTable(table, year, months)
      ]);
      const tblKeys = new Set();
      for (const r of tblRows) {
        const d = typeof r.data === 'string' ? JSON.parse(r.data) : (r.data || {});
        tblKeys.add(r.hospital_id + ':' + (d.year || year) + ':' + (d.month || 0));
      }
      const merged = [];
      for (const r of archRows) {
        const key = r.hospital_id + ':' + r.rec_year + ':' + r.rec_month;
        if (!tblKeys.has(key)) merged.push(r);
      }
      for (const r of tblRows) merged.push(r);
      return merged;
    }

    async function fetchDispFromArchive(year, months) {
      const isPG = db.mode === 'pg';
      let rows = [];
      if (isPG) {
        try {
          let sql = `SELECT (elem->>'hospital_id')::int as hospital_id,
            elem->>'hospital_name' as hospital_name,
            elem->>'governorate' as governorate,
            (elem->>'year')::int as rec_year,
            (elem->>'month')::int as rec_month,
            elem->'blood_types' as blood_types
            FROM archives, jsonb_array_elements(data) AS elem
            WHERE type = 'منصرف فصائل الدم'
            AND (elem->>'year')::int = $1
            AND (elem->>'month')::int = ANY($2)`;
          const params = [year, months];
          if (governorate) { sql += ` AND elem->>'governorate' = $3`; params.push(governorate); }
          if (hospitalId) { sql += ` AND (elem->>'hospital_id')::int = $4`; params.push(parseInt(hospitalId)); }
          sql += ' ORDER BY elem->>\'governorate\', elem->>\'hospital_name\', (elem->>\'month\')::int';
          rows = (await query(sql, params)).rows;
        } catch (e) {}
      }
      if (!rows.length) {
        const archives = await db.getTable('archives');
        for (const arch of archives) {
          if (arch.type !== 'منصرف فصائل الدم') continue;
          const raw = typeof arch.data === 'string' ? JSON.parse(arch.data) : arch.data;
          const items = Array.isArray(raw) ? raw : [];
          for (const item of items) {
            if (item.year !== year || !months.includes(item.month)) continue;
            if (governorate && item.governorate !== governorate) continue;
            if (hospitalId && String(item.hospital_id) !== String(parseInt(hospitalId))) continue;
            rows.push({ hospital_id: item.hospital_id, hospital_name: item.hospital_name, governorate: item.governorate, rec_year: item.year, rec_month: item.month, blood_types: item.blood_types || {} });
          }
        }
      }
      return rows.map(r => {
        const bt = typeof r.blood_types === 'string' ? JSON.parse(r.blood_types) : (r.blood_types || {});
        return { hospital_id: r.hospital_id, hospital_name: r.hospital_name, governorate: r.governorate, rec_year: r.rec_year, rec_month: r.rec_month, data: bt };
      });
    }

    const [bigP1, bigP2, smallP1, smallP2, dispP1Raw, dispP2Raw] = await Promise.all([
      mergeSources('مؤشرات تجميعيه', 'monthly_big_indicators', y1, m1),
      mergeSources('مؤشرات تجميعيه', 'monthly_big_indicators', y2, m2),
      mergeSources('مؤشرات تخزينيه', 'monthly_small_indicators', y1, m1),
      mergeSources('مؤشرات تخزينيه', 'monthly_small_indicators', y2, m2),
      fetchDispFromArchive(y1, m1),
      fetchDispFromArchive(y2, m2)
    ]);

    res.json({
      big: { period1: aggregateByHospital(bigP1), period2: aggregateByHospital(bigP2) },
      small: { period1: aggregateByHospital(smallP1), period2: aggregateByHospital(smallP2) },
      disp: { period1: aggregateByHospital(dispP1Raw), period2: aggregateByHospital(dispP2Raw) }
    });
  } catch (err) {
    console.error('indicator-analysis error:', err);
    res.status(500).json({ error: errMsg(err) });
  }
});

// API 404 — unknown /api/* routes return JSON (never the SPA shell)
app.use('/api/', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
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
  db.flush().then(() => process.exit(1)).catch(() => process.exit(1));
});

// Listen on the configured port AND common cloud fallbacks (3001/8080) so the
// app answers whichever port the platform routes to (some PaaS inject PORT=3000
// while the public URL forwards to 3001 — this caused a 503 on Suga).
const LISTEN_PORTS = [];
if (PORT && LISTEN_PORTS.indexOf(PORT) === -1) LISTEN_PORTS.push(PORT);
[3001, 8080].forEach((p) => { if (LISTEN_PORTS.indexOf(p) === -1) LISTEN_PORTS.push(p); });

let listenersStarted = 0;
let booted = false;
LISTEN_PORTS.forEach((p) => {
  const srv = app.listen(p, HOST, () => {
    listenersStarted++;
    console.log(`✅ Blood Bank Server listening on port ${p} (${srv.address().address})`);
    if (!booted) {
      booted = true;
      const ip = getLocalIP();
      const isCloud = !!process.env.DATA_DIR || !!process.env.RENDER;
      console.log(`   Mode: ${isCloud ? '☁️ Cloud (persistent disk)' : isPG ? 'PostgreSQL (production)' : '💻 Local (JSON file)'}`);
      if (isCloud) {
        console.log(`   🌍 متاح للجميع على الرابط أعلاه (موبايل/كمبيوتر/تابلت)`);
        console.log(`   ⚡ أي جهاز في العالم يقدر يستخدم النظام`);
      } else {
        console.log(`   📱 افتح http://${ip}:${PORT} من أي جهاز في نفس الشبكة`);
      }
      // Start auto-backup scheduler
      startAutoBackup();
      // Start daily stock rollover scheduler
      startStockRollover();
    }
  });
  srv.on('error', (e) => {
    console.error(`❌ Cannot listen on port ${p}: ${e.code || e.message}`);
  });
});

} // end startServer()

startServer().catch(err => { console.error('Failed to start server:', err); process.exit(1); });

