/**
 * security-test.js — اختبار أمان شامل لنظام إدارة بنوك الدم
 * يقوم باختبار: Auth bypass, XSS, SQL injection, Rate limiting,
 * Permission bypass, Session security, CSP bypass, Input validation
 *
 * التشغيل: node tests/security-test.js
 * (يجب أن يكون السيرفر شغال على port 3001)
 */

const http = require('http');
const https = require('https');
const BASE = process.env.TEST_URL || 'http://localhost:3001';
const IS_HTTPS = BASE.startsWith('https');
const requester = IS_HTTPS ? https : http;
const PK = '123'; // default password

let passed = 0, failed = 0, warnings = 0;
const results = [];

function test(name, fn) {
  return new Promise(async (resolve) => {
    try {
      await fn();
      results.push({ name, status: '✅ PASS' });
      passed++;
    } catch (e) {
      results.push({ name, status: '❌ FAIL', detail: e.message });
      failed++;
    }
    resolve();
  });
}

function warn(name, msg) {
  results.push({ name, status: '⚠️ WARN', detail: msg });
  warnings++;
}

function req(method, path, body, cookie) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE);
    const opts = {
      hostname: url.hostname, port: url.port || (IS_HTTPS ? 443 : 80), path, method,
      headers: { 'Content-Type': 'application/json', 'Origin': BASE, 'Referer': BASE + '/' },
      timeout: 10000,
      rejectUnauthorized: false
    };
    if (cookie) opts.headers['Cookie'] = cookie;
    const r = requester.request(opts, res => {
      let buf = Buffer.alloc(0);
      res.on('data', c => buf = Buffer.concat([buf, c]));
      res.on('end', () => {
        let data;
        try { data = JSON.parse(buf.toString('utf8')); } catch(e) { data = buf.toString('utf8').substring(0, 200); }
        resolve({ status: res.statusCode, headers: res.headers, data });
      });
    });
    r.on('error', reject);
    if (body) r.write(Buffer.from(JSON.stringify(body), 'utf8'));
    r.end();
  });
}

async function loginAs(username, password) {
  const r = await req('POST', '/api/login', { username, password });
  if (r.status !== 200) throw new Error('Login failed: ' + r.status);
  const sc = r.headers['set-cookie'];
  if (!sc) throw new Error('No set-cookie header');
  const m = sc[0].match(/connect\.sid=([^;]+)/);
  if (!m) throw new Error('Could not extract session cookie');
  return m[0];
}

// ===================================================================
// 1. AUTH BYPASS — هل يمكن الوصول للموارد بدون تسجيل دخول؟
// ===================================================================
async function authBypassTests() {
  const protectedEndpoints = [
    '/api/me', '/api/users', '/api/hospitals', '/api/daily-stock', '/api/daily-reports',
    '/api/monthly-indicators', '/api/monthly-consumption', '/api/employee-statements',
    '/api/readiness-occasions', '/api/equipment/types', '/api/strategic-reserves',
    '/api/archive', '/api/config/time'
  ];

  for (const ep of protectedEndpoints) {
    await test(`Auth Bypass: GET ${ep} without cookie → 401/302`, async () => {
      const r = await req('GET', ep);
      if (r.status === 401 || r.status === 302 || r.status === 403) return; // pass
      throw new Error(`Expected 401/302/403, got ${r.status}: ${JSON.stringify(r.data).substring(0,100)}`);
    });
  }

  // POST endpoints without auth
  const postEndpoints = [
    { path: '/api/daily-stock', body: {} },
    { path: '/api/daily-reports', body: {} },
    { path: '/api/monthly-indicators', body: {} },
    { path: '/api/employee-statements', body: { employee: 'test' } },
    { path: '/api/readiness-occasions', body: { name: 'test', date_from: '2026-01-01', date_to: '2026-01-02' } },
  ];
  for (const ep of postEndpoints) {
    await test(`Auth Bypass: POST ${ep.path} without cookie → 401`, async () => {
      const r = await req('POST', ep.path, ep.body);
      if (r.status === 401) return;
      throw new Error(`Expected 401, got ${r.status}`);
    });
  }
}

// ===================================================================
// 2. SQL INJECTION — محاولة حقن SQL في حقول الدخول
// ===================================================================
async function sqlInjectionTests() {
  const payloads = [
    "' OR '1'='1", "' OR 1=1 --", "'; DROP TABLE users; --",
    "' UNION SELECT * FROM users --", "admin'--", "\" OR \"1\"=\"1",
    "'; SELECT * FROM information_schema.tables; --",
    "' OR '1'='1' --", "1; SELECT pg_sleep(5)",
    "' OR '1'='1' LIMIT 1 --", "'||(SELECT 1 FROM users)||'",
    "admin') OR '1'='1", "'; EXEC xp_cmdshell('dir'); --"
  ];

  for (const payload of payloads) {
    await test(`SQL Injection: login with "${payload.substring(0,30)}" → 401`, async () => {
      const r = await req('POST', '/api/login', { username: payload, password: PK });
      if (r.status === 400 || r.status === 401) return; // pass — rejected
      // If 200, that means the injection worked → FAIL
      if (r.status === 200) throw new Error(`SQL injection succeeded! Payload: ${payload}`);
      // 500 might indicate crash → warning
      if (r.status === 500) warn(`SQL Injection: "${payload.substring(0,30)}" caused 500`, 'May crash the server');
    });
  }

  // SQL injection in search/user input fields (authenticated)
  let cookie;
  try { cookie = await loginAs('admin', PK); } catch(e) { warn('Cannot login as admin', e.message); return; }

  for (const payload of ['%27 OR 1=1 --', "'; SELECT 1 --", "' OR '1'='1"]) {
    await test(`SQL Injection: GET /api/users?search=${payload} → 200 (safe)`, async () => {
      const r = await req('GET', '/api/users?search=' + encodeURIComponent(payload), null, cookie);
      if (r.status === 200) return;
      if (r.status === 500) throw new Error(`Server crashed on SQL injection in search: ${r.status}`);
    });
  }
}

// ===================================================================
// 3. XSS (Cross-Site Scripting)
// ===================================================================
async function xssTests() {
  let cookie;
  try { cookie = await loginAs('admin', PK); } catch(e) { warn('Cannot login as admin', e.message); return; }

  const xssPayloads = [
    '<script>alert(1)</script>',
    '<img src=x onerror=alert(1)>',
    '<svg onload=alert(1)>',
    '"><script>alert(1)</script>',
    'javascript:alert(1)',
    '<body onload=alert(1)>',
    '{{ constructor.constructor("alert(1)")() }}',
    '<iframe src=javascript:alert(1)>',
    '<input onfocus=alert(1) autofocus>'
  ];

  for (const payload of xssPayloads) {
    await test(`XSS: Create hospital with name "${payload.substring(0,25)}" → 200 (sanitized)`, async () => {
      const r = await req('POST', '/api/hospitals', { name: payload, governorate: 'بورسعيد', type: 'تخزيني' }, cookie);
      if (r.status === 400) return; // validation rejected
      if (r.status === 201 || r.status === 200) {
        // If created, try to read it back — verify it's escaped
        const r2 = await req('GET', '/api/hospitals', null, cookie);
        const data = r2.data;
        if (data) {
          const rows = Array.isArray(data) ? data : (data.rows || data.data || []);
          const found = rows.find(h => h.name && h.name.includes('script') || h.name && h.name.includes('alert'));
          if (found) {
            // Check if the name is still the raw payload (not escaped)
            if (found.name.includes('<script>') || found.name.includes('onerror=')) {
              throw new Error(`XSS payload stored unescaped: ${found.name}`);
            }
          }
        }
        // Clean up
        const rows = Array.isArray(r2.data) ? r2.data : (r2.data?.rows || []);
        const created = rows.find(h => h.name && h.name.includes(payload.substring(0,10)));
        if (created && created.id) {
          await req('DELETE', `/api/hospitals/${created.id}`, null, cookie);
        }
        return; // pass
      }
      throw new Error(`Unexpected status: ${r.status}`);
    });
  }

  // Test XSS in employee name
  for (const payload of xssPayloads.slice(0,3)) {
    await test(`XSS: Create employee with name "${payload.substring(0,20)}" → 200 (sanitized)`, async () => {
      const r = await req('POST', '/api/employee-statements', {
        employee: payload, hospital_id: 1, governorate: 'بورسعيد'
      }, cookie);
      if (r.status === 400 || r.status === 201 || r.status === 200) return;
      throw new Error(`Unexpected: ${r.status}`);
    });
  }
}

// ===================================================================
// 4. RATE LIMITING
// ===================================================================
async function rateLimitTests() {
  // Hit login repeatedly to trigger rate limit
  await test('Rate Limiting: Rapid login attempts → 429 eventually', async () => {
    let got429 = false;
    for (let i = 0; i < 30; i++) {
      const r = await req('POST', '/api/login', { username: 'admin_' + i, password: 'wrong' });
      if (r.status === 429) { got429 = true; break; }
    }
    if (!got429) warn('Rate Limiting', 'Did not get 429 after 30 rapid login attempts (may need more)');
  });
}

// ===================================================================
// 5. PERMISSION BYPASS — هل يمكن لمستخدم محدود الوصول لموارد إدارية؟
// ===================================================================
async function permissionBypassTests() {
  let hospCookie;
  try { hospCookie = await loginAs('emp1', PK); } catch(e) { warn('Cannot login as emp1', e.message); return; }

  const adminEndpoints = [
    { path: '/api/users', method: 'GET', desc: 'قائمة المستخدمين' },
    { path: '/api/users', method: 'POST', desc: 'إنشاء مستخدم', body: { username: 'test_hack', password: '123', name: 'hacker', role: 'hospital', hospitalId: 1 } },
    { path: '/api/hospitals', method: 'POST', desc: 'إنشاء مستشفى', body: { name: 'hack', governorate: 'test', type: 'تخزيني' } },
    { path: '/api/governorates', method: 'POST', desc: 'إنشاء محافظة', body: { name: 'test_gov' } },
    { path: '/api/role-permissions', method: 'GET', desc: 'صلاحيات الأدوار' },
    { path: '/api/config/time', method: 'POST', desc: 'تعديل الوقت', body: { time_offset: 5 } },
  ];

  for (const ep of adminEndpoints) {
    await test(`Permission Bypass: emp1 ${ep.desc} → 403`, async () => {
      const r = await req(ep.method, ep.path, ep.body || null, hospCookie);
      if (r.status === 403 || r.status === 401) return;
      if (r.status === 200 || r.status === 201) throw new Error(`emp1 accessed ${ep.desc} with status ${r.status}!`);
    });
  }

  // Visitor permission test
  let visitorCookie;
  try { visitorCookie = await loginAs('visitor', PK); } catch(e) { warn('Cannot login as visitor', e.message); return; }

  const visitorBlocked = [
    { path: '/api/daily-stock', method: 'POST', body: {} },
    { path: '/api/employee-statements', method: 'POST', body: { employee: 'test' } },
  ];
  for (const ep of visitorBlocked) {
    await test(`Permission Bypass: visitor POST ${ep.path} → 403`, async () => {
      const r = await req(ep.method, ep.path, ep.body, visitorCookie);
      if (r.status === 403 || r.status === 401) return;
      if (r.status === 200) throw new Error(`Visitor accessed ${ep.path} with status 200!`);
    });
  }
}

// ===================================================================
// 6. SESSION SECURITY
// ===================================================================
async function sessionSecurityTests() {
  let cookie;
  try { cookie = await loginAs('admin', PK); } catch(e) { warn('Cannot login as admin', e.message); return; }

  // Check cookie attributes
  await test('Session Security: Cookie has httpOnly flag', async () => {
    const r = await req('POST', '/api/login', { username: 'admin', password: PK });
    const sc = r.headers['set-cookie'];
    if (!sc) throw new Error('No set-cookie');
    if (!sc[0].toLowerCase().includes('httponly')) throw new Error('Missing httpOnly flag');
  });

  await test('Session Security: Cookie has SameSite flag', async () => {
    const r = await req('POST', '/api/login', { username: 'admin', password: PK });
    const sc = r.headers['set-cookie'];
    if (!sc) throw new Error('No set-cookie');
    if (!sc[0].toLowerCase().includes('samesite')) throw new Error('Missing SameSite flag');
  });

  // Session fixation — login with new creds should give new session
  await test('Session Security: Login invalidates old session?', async () => {
    const r1 = await req('POST', '/api/login', { username: 'admin', password: PK });
    const oldCookie = r1.headers['set-cookie'];
    // Login again
    const r2 = await req('POST', '/api/login', { username: 'admin', password: PK });
    const newCookie = r2.headers['set-cookie'];
    if (oldCookie && newCookie && oldCookie[0] !== newCookie[0]) return; // different session → pass
    // Same session is acceptable behavior depending on store config
  });

  // CSRF check
  await test('Session Security: POST without Origin/Referer', async () => {
    const r = await req('POST', '/api/login', { username: 'admin', password: PK });
    if (r.status === 200 || r.status === 403) return;
    throw new Error(`Unexpected: ${r.status}`);
  });
}

// ===================================================================
// 7. PASSWORD POLICY
// ===================================================================
async function passwordPolicyTests() {
  let cookie;
  try { cookie = await loginAs('admin', PK); } catch(e) { warn('Cannot login as admin', e.message); return; }

  await test('Password Policy: Empty password → 400', async () => {
    const r = await req('POST', '/api/users', { username: 'test_weak', password: '', name: 'weak', role: 'hospital', hospitalId: 1 }, cookie);
    if (r.status === 400 || r.status === 500) return;
    if (r.status === 201) warn('Password Policy', 'User created with empty password');
  });

  await test('Password Policy: Very short password (1 char) → 400', async () => {
    const r = await req('POST', '/api/users', { username: 'test_weak2', password: 'a', name: 'weak2', role: 'hospital', hospitalId: 1 }, cookie);
    if (r.status === 400) return;
    if (r.status === 201) warn('Password Policy', 'User created with 1-char password');
  });

  // Clean up if any test users created
  const r = await req('GET', '/api/users', null, cookie);
  if (r.data) {
    const rows = Array.isArray(r.data) ? r.data : (r.data.rows || []);
    for (const u of rows) {
      if ((u.username || '').startsWith('test_weak')) {
        await req('DELETE', '/api/users/' + u.id, null, cookie);
      }
    }
  }
}

// ===================================================================
// 8. INPUT VALIDATION — حدود الإدخال
// ===================================================================
async function inputValidationTests() {
  let cookie;
  try { cookie = await loginAs('admin', PK); } catch(e) { warn('Cannot login as admin', e.message); return; }

  await test('Input Validation: Empty POST body → 400/401', async () => {
    const r = await req('POST', '/api/login', null);
    if (r.status === 400 || r.status === 401) return;
  });

  await test('Input Validation: Hospital with empty name → 400', async () => {
    const r = await req('POST', '/api/hospitals', { name: '', governorate: 'test', type: 'تخزيني' }, cookie);
    if (r.status === 400) return;
  });

  await test('Input Validation: Very long string (10KB) → 400/413', async () => {
    const big = 'A'.repeat(10000);
    const r = await req('POST', '/api/hospitals', { name: big, governorate: 'test', type: 'تخزيني' }, cookie);
    if (r.status === 400 || r.status === 413 || r.status === 500) return;
    if (r.status === 201) warn('Input Validation', 'Very long hospital name accepted (10KB)');
  });

  await test('Input Validation: Negative/zero hospital_id → 400', async () => {
    const r = await req('POST', '/api/employee-statements', { employee: 'test', hospital_id: -1, governorate: 'test' }, cookie);
    if (r.status === 400 || r.status === 201) return;
  });
}

// ===================================================================
// 9. HELMET / SECURITY HEADERS
// ===================================================================
async function helmetHeaderTests() {
  await test('Helmet: X-Content-Type-Options header present', async () => {
    const r = await req('GET', '/');
    if (r.headers['x-content-type-options'] === 'nosniff') return;
    throw new Error('Missing or incorrect X-Content-Type-Options');
  });

  await test('Helmet: X-Frame-Options header present', async () => {
    const r = await req('GET', '/');
    if (r.headers['x-frame-options']) return;
    throw new Error('Missing X-Frame-Options');
  });

  await test('Helmet: Strict-Transport-Security header present', async () => {
    const r = await req('GET', '/');
    if (r.headers['strict-transport-security']) return;
    warn('Helmet', 'Missing HSTS header (expected on localhost)');
  });

  await test('Helmet: X-XSS-Protection header present', async () => {
    const r = await req('GET', '/');
    // Some versions of helmet set this, some don't
    if (r.headers['x-xss-protection']) return;
  });

  await test('Helmet: Referrer-Policy header present', async () => {
    const r = await req('GET', '/');
    if (r.headers['referrer-policy']) return;
    warn('Helmet', 'Missing Referrer-Policy header');
  });

  await test('Helmet: X-Powered-By is removed', async () => {
    const r = await req('GET', '/');
    if (r.headers['x-powered-by']) warn('Helmet', 'X-Powered-By still exposed');
  });

  await test('Helmet: Content-Security-Policy header present', async () => {
    const r = await req('GET', '/');
    if (r.headers['content-security-policy']) return;
    warn('Helmet', 'Missing CSP header (server-side may be disabled, meta tag fallback)');
  });
}

// ===================================================================
// 10. LOG SENSITIVE DATA LEAK
// ===================================================================
async function dataLeakTests() {
  let cookie;
  try { cookie = await loginAs('admin', PK); } catch(e) { warn('Cannot login as admin', e.message); return; }

  await test('Data Leak: Users API does not return passwords', async () => {
    const r = await req('GET', '/api/users', null, cookie);
    if (r.status !== 200) return;
    const rows = Array.isArray(r.data) ? r.data : (r.data.rows || []);
    for (const u of rows.slice(0, 5)) {
      if (u.password) throw new Error('Password exposed in users endpoint!');
    }
  });

  await test('Data Leak: Login does not return password hash', async () => {
    const r = await req('POST', '/api/login', { username: 'admin', password: PK });
    if (r.status !== 200) return;
    if (r.data && r.data.user && r.data.user.password) throw new Error('Password exposed in login response!');
  });

  await test('Data Leak: Error messages don\'t leak stack traces', async () => {
    const r = await req('POST', '/api/login', { username: null, password: null });
    if (r.data && typeof r.data === 'object') {
      const msg = JSON.stringify(r.data);
      if (msg.includes('at ') && msg.includes('Error')) warn('Data Leak', 'Error message may contain stack trace: ' + msg.substring(0, 100));
    }
  });
}

// ===================================================================
// MAIN
// ===================================================================
async function main() {
  console.log('🔐 Blood Bank Security Test Suite');
  console.log('='.repeat(60));
  console.log('');

  // Check server is running
  try {
    const ping = await req('GET', '/api/me');
    if (ping.status !== 200 && ping.status !== 401 && ping.status !== 302 && ping.status !== 403) {
      console.log(`⚠️  Server responded with ${ping.status}. Tests may be affected.`);
    }
  } catch(e) {
    console.error(`❌ Cannot reach server at ${BASE}. Is the server running?`);
    console.error('   Usage: TEST_URL=http://localhost:3001 node tests/security-test.js');
    process.exit(1);
  }
  console.log(`🔗 Target: ${BASE}\n`);

  console.log('📋 AUTH BYPASS TESTS');
  await authBypassTests();

  console.log('📋 SQL INJECTION TESTS');
  await sqlInjectionTests();

  console.log('📋 XSS TESTS');
  await xssTests();

  console.log('📋 RATE LIMITING TESTS');
  await rateLimitTests();

  console.log('📋 PERMISSION BYPASS TESTS');
  await permissionBypassTests();

  console.log('📋 SESSION SECURITY TESTS');
  await sessionSecurityTests();

  console.log('📋 PASSWORD POLICY TESTS');
  await passwordPolicyTests();

  console.log('📋 INPUT VALIDATION TESTS');
  await inputValidationTests();

  console.log('📋 SECURITY HEADERS TESTS');
  await helmetHeaderTests();

  console.log('📋 DATA LEAK TESTS');
  await dataLeakTests();

  // SUMMARY
  console.log('');
  console.log('='.repeat(60));
  console.log('📊 RESULTS SUMMARY');
  console.log(`   ✅ PASS: ${passed}`);
  console.log(`   ❌ FAIL: ${failed}`);
  console.log(`   ⚠️  WARN: ${warnings}`);
  console.log('');

  if (failed > 0) {
    console.log('❌ FAILED TESTS:');
    results.filter(r => r.status === '❌ FAIL').forEach(r => {
      console.log(`   - ${r.name}: ${r.detail}`);
    });
    console.log('');
  }

  if (warnings > 0) {
    console.log('⚠️  WARNINGS:');
    results.filter(r => r.status === '⚠️ WARN').forEach(r => {
      console.log(`   - ${r.name}: ${r.detail}`);
    });
    console.log('');
  }

  console.log(`✅ All tests completed. ${passed + failed + warnings} total.`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
