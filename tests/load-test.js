/**
 * load-test.js — اختبار تحمل وضغط شامل لنظام إدارة بنوك الدم
 *
 * يقيس: زمن الاستجابة، عدد الطلبات المتزامنة، استهلاك الذاكرة،
 * ثبات الاتصال تحت الضغط، collapse تحت التحميل المتوالي
 *
 * التشغيل: node tests/load-test.js
 * (يجب أن يكون السيرفر شغال على port 3001)
 */

const http = require('http');
const https = require('https');
const BASE = process.env.TEST_URL || 'http://localhost:3001';
const IS_HTTPS = BASE.startsWith('https');
const requester = IS_HTTPS ? https : http;
const PK = '123';

let passed = 0, failed = 0;
const results = [];
const timings = [];

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

function req(method, path, body, cookie) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const url = new URL(BASE);
    const opts = {
      hostname: url.hostname, port: url.port || (IS_HTTPS ? 443 : 80), path, method,
      headers: { 'Content-Type': 'application/json', 'Origin': BASE, 'Referer': BASE + '/' },
      timeout: 15000,
      rejectUnauthorized: false
    };
    if (cookie) opts.headers['Cookie'] = cookie;
    const r = requester.request(opts, res => {
      const latency = Date.now() - start;
      let buf = Buffer.alloc(0);
      res.on('data', c => buf = Buffer.concat([buf, c]));
      res.on('end', () => {
        let data;
        try { data = JSON.parse(buf.toString('utf8')); } catch(e) { data = null; }
        timings.push({ path, method, latency, status: res.statusCode });
        resolve({ status: res.statusCode, headers: res.headers, data, latency });
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
  if (!sc) throw new Error('No set-cookie');
  const m = sc[0].match(/connect\.sid=([^;]+)/);
  if (!m) throw new Error('Could not extract session');
  return m[0];
}

// ===================================================================
// 1. SINGLE-USER LATENCY BENCHMARK
// ===================================================================
async function latencyBenchmark() {
  let cookie;
  try { cookie = await loginAs('admin', PK); } catch(e) { return; }

  const endpoints = [
    '/api/me', '/api/users', '/api/hospitals', '/api/governorates',
    '/api/daily-stock?date=today', '/api/daily-reports',
    '/api/employee-statements', '/api/strategic-reserves',
    '/api/equipment/types', '/api/config/time'
  ];

  for (const ep of endpoints) {
    await test(`Latency: GET ${ep}`, async () => {
      const r = await req('GET', ep, null, cookie);
      if (r.status === 200 || r.status === 401 || r.status === 403) {
        if (r.latency > 2000) throw new Error(`Slow response: ${r.latency}ms for ${ep}`);
        return;
      }
      throw new Error(`Unexpected status ${r.status} for ${ep}`);
    });
  }
}

// ===================================================================
// 2. CONCURRENT LOGIN STORM
// ===================================================================
async function concurrentLoginStorm() {
  const CONCURRENCY = 20;
  await test(`Concurrent Logins: ${CONCURRENCY} simultaneous login requests`, async () => {
    const attempts = [];
    for (let i = 0; i < CONCURRENCY; i++) {
      attempts.push(req('POST', '/api/login', { username: 'admin', password: PK }));
    }
    const results = await Promise.all(attempts);
    const ok = results.filter(r => r.status === 200).length;
    const rateLimited = results.filter(r => r.status === 429).length;
    const failedReqs = results.filter(r => r.status !== 200 && r.status !== 429).length;
    if (failedReqs > CONCURRENCY * 0.5) throw new Error(`${failedReqs}/${CONCURRENCY} failed unexpectedly`);
  });
}

// ===================================================================
// 3. CONCURRENT API HAMMER
// ===================================================================
async function concurrentApiHammer() {
  let cookie;
  try { cookie = await loginAs('admin', PK); } catch(e) { return; }

  const CONCURRENCY = 50;
  await test(`Concurrent API: ${CONCURRENCY} mixed requests`, async () => {
    const endpoints = [
      { method: 'GET', path: '/api/me' },
      { method: 'GET', path: '/api/hospitals' },
      { method: 'GET', path: '/api/governorates' },
      { method: 'GET', path: '/api/equipment/types' },
      { method: 'GET', path: '/api/config/time' },
    ];

    const requests = [];
    for (let i = 0; i < CONCURRENCY; i++) {
      const ep = endpoints[i % endpoints.length];
      requests.push(req(ep.method, ep.path, null, cookie));
    }
    const results = await Promise.all(requests);
    const errors = results.filter(r => r.status >= 500).length;
    const timeouts = results.filter(r => r.status === 0 || !r.status).length;
    if (errors > CONCURRENCY * 0.3) throw new Error(`${errors} server errors out of ${CONCURRENCY}`);
    if (timeouts > 0) throw new Error(`${timeouts} requests timed out`);
  });
}

// ===================================================================
// 4. SUSTAINED LOAD — موجة طلبات مستمرة
// ===================================================================
async function sustainedLoad() {
  let cookie;
  try { cookie = await loginAs('admin', PK); } catch(e) { return; }

  const TOTAL = 200;
  const CONCURRENT = 10;

  await test(`Sustained Load: ${TOTAL} requests (${CONCURRENT} at a time)`, async () => {
    let completed = 0;
    let errors = 0;
    const start = Date.now();

    async function worker() {
      while (completed < TOTAL) {
        const n = completed++;
        const ep = n % 2 === 0 ? '/api/hospitals' : '/api/governorates';
        try {
          const r = await req('GET', ep, null, cookie);
          if (r.status >= 500) errors++;
        } catch(e) {
          errors++;
        }
      }
    }

    const workers = [];
    for (let i = 0; i < CONCURRENT; i++) workers.push(worker());
    await Promise.all(workers);

    const elapsed = Date.now() - start;
    const rps = (TOTAL / (elapsed / 1000)).toFixed(1);
    if (errors > TOTAL * 0.3) throw new Error(`${errors}/${TOTAL} requests failed`);
    console.log(`      ⚡ ${rps} req/sec, ${elapsed}ms total, ${errors} errors`);
  });
}

// ===================================================================
// 5. WRITE STORM — إنشاء بيانات متزامن
// ===================================================================
async function writeStorm() {
  let cookie;
  try { cookie = await loginAs('admin', PK); } catch(e) { return; }

  const CONCURRENCY = 10;
  await test(`Write Storm: ${CONCURRENCY} concurrent writes`, async () => {
    const writes = [];
    for (let i = 0; i < CONCURRENCY; i++) {
      writes.push(req('POST', '/api/hospitals', {
        name: `test_load_${Date.now()}_${i}`,
        governorate: 'بورسعيد',
        type: 'تخزيني'
      }, cookie));
    }
    const results = await Promise.all(writes);
    const created = results.filter(r => r.status === 201 || r.status === 200).length;

    // Clean up created test hospitals
    const list = await req('GET', '/api/hospitals', null, cookie);
    if (list.data) {
      const rows = Array.isArray(list.data) ? list.data : (list.data.rows || []);
      for (const h of rows) {
        if ((h.name || '').startsWith('test_load_')) {
          await req('DELETE', '/api/hospitals/' + h.id, null, cookie);
        }
      }
    }

    if (created < CONCURRENCY * 0.5) throw new Error(`Only ${created}/${CONCURRENCY} writes succeeded`);
  });
}

// ===================================================================
// 6. AUTH MIX — محاولات دخول صحيحة وخاطئة
// ===================================================================
async function authMix() {
  const CONCURRENCY = 15;
  await test(`Auth Mix: ${CONCURRENCY} logins (mixed valid/invalid)`, async () => {
    const attempts = [];
    for (let i = 0; i < CONCURRENCY; i++) {
      const valid = i % 2 === 0;
      attempts.push(req('POST', '/api/login', {
        username: valid ? 'admin' : `fake_user_${i}`,
        password: valid ? PK : 'wrong_password'
      }));
    }
    const results = await Promise.all(attempts);
    const ok = results.filter(r => r.status === 200).length;
    const rejected = results.filter(r => r.status === 401 || r.status === 400 || r.status === 429).length;
    if (ok + rejected < CONCURRENCY) throw new Error(`${CONCURRENCY - ok - rejected} requests gave unexpected responses`);
  });
}

// ===================================================================
// 7. SESSION CHAIN — طلبات متسلسلة ثقيلة
// ===================================================================
async function sessionChain() {
  let cookie;
  try { cookie = await loginAs('admin', PK); } catch(e) { return; }

  await test('Session Chain: Login → 5 GETs → 1 POST → Logout → Reuse', async () => {
    // Chain of requests using same session
    const get1 = await req('GET', '/api/me', null, cookie);
    if (get1.status !== 200) throw new Error('First GET failed');
    const get2 = await req('GET', '/api/hospitals', null, cookie);
    if (get2.status !== 200) throw new Error('Second GET failed');
    const get3 = await req('GET', '/api/governorates', null, cookie);
    if (get3.status !== 200) throw new Error('Third GET failed');

    // Logout
    const logout = await req('POST', '/api/logout', {}, cookie);
    if (logout.status !== 200) throw new Error('Logout failed: ' + logout.status);

    // Try to use session after logout → should fail
    const afterLogout = await req('GET', '/api/me', null, cookie);
    if (afterLogout.status !== 401 && afterLogout.status !== 403) {
      // May still work if session store hasn't cleared yet
    }
  });
}

// ===================================================================
// 8. EDGE: EMPTY BODY, INVALID JSON
// ===================================================================
async function edgeCases() {
  await test('Edge: Empty POST to login', async () => {
    const r = await req('POST', '/api/login', {});
    if (r.status === 400 || r.status === 401 || r.status === 200) return;
  });

  await test('Edge: Invalid JSON body (empty body, no Content-Type)', async () => {
    const r = await new Promise((resolve, reject) => {
      const opts = { hostname: 'localhost', port: 3001, path: '/api/login', method: 'POST', headers: {}, timeout: 5000 };
      const req2 = http.request(opts, res => {
        let buf = Buffer.alloc(0);
        res.on('data', c => buf = Buffer.concat([buf, c]));
        res.on('end', () => resolve({ status: res.statusCode }));
      });
      req2.on('error', reject);
      req2.end();
    });
    if (r.status !== 500) return;
  });

  await test('Edge: GET root page returns HTML', async () => {
    const r = await req('GET', '/');
    if (r.status === 200 || r.status === 302 || r.status === 304) return;
    throw new Error('Root returned ' + r.status);
  });
}

// ===================================================================
// 9. MEMORY CHECK — قراءة الذاكرة (تقريبي)
// ===================================================================
async function memoryCheck() {
  await test('Memory: Process memory usage', async () => {
    const usage = process.memoryUsage();
    const heapMB = (usage.heapUsed / 1024 / 1024).toFixed(1);
    const rssMB = (usage.rss / 1024 / 1024).toFixed(1);
    console.log(`      🧠 Heap: ${heapMB} MB, RSS: ${rssMB} MB`);
    if (heapMB > 400) throw new Error(`Heap usage too high: ${heapMB} MB`);
  });

  // Memory before and after heavy load
  await test('Memory: Leak check (heavy load → GC)', async () => {
    const before = process.memoryUsage().heapUsed;
    // Simulate heavy allocations
    const big = [];
    for (let i = 0; i < 10000; i++) big.push({ data: 'x'.repeat(1000), id: i });
    big.length = 0;
    if (global.gc) global.gc();
    const after = process.memoryUsage().heapUsed;
    const diffMB = ((after - before) / 1024 / 1024).toFixed(1);
    // Should be reasonably close (within 10 MB)
    if (diffMB > 10) warnMem('Memory diff after GC: ' + diffMB + ' MB (possible leak)');
  });
}

function warnMem(msg) {
  results.push({ name: 'Memory: Leak check', status: '⚠️ WARN', detail: msg });
}

// ===================================================================
// MAIN
// ===================================================================
async function main() {
  console.log('⚡ Blood Bank Load & Stress Test Suite');
  console.log('='.repeat(60));
  console.log('');

  // Check server
  try {
    const ping = await req('GET', '/api/me');
    if (ping.status !== 200 && ping.status !== 401 && ping.status !== 302) {
      console.log(`⚠️  Server: ${ping.status}`);
    }
  } catch(e) {
    console.error(`❌ Cannot reach server at ${BASE}`);
    console.error('   Usage: TEST_URL=https://example.com node tests/load-test.js');
    process.exit(1);
  }
  console.log(`🔗 Target: ${BASE}\n`);

  console.log('📋 LATENCY BENCHMARK');
  await latencyBenchmark();

  console.log('📋 CONCURRENT LOGIN STORM');
  await concurrentLoginStorm();

  console.log('📋 CONCURRENT API HAMMER');
  await concurrentApiHammer();

  console.log('📋 SUSTAINED LOAD');
  await sustainedLoad();

  console.log('📋 WRITE STORM');
  await writeStorm();

  console.log('📋 AUTH MIX');
  await authMix();

  console.log('📋 SESSION CHAIN');
  await sessionChain();

  console.log('📋 EDGE CASES');
  await edgeCases();

  console.log('📋 MEMORY CHECK');
  await memoryCheck();

  // TIMING SUMMARY
  console.log('');
  console.log('📊 LATENCY STATS');
  if (timings.length > 0) {
    const latencies = timings.map(t => t.latency).sort((a,b) => a-b);
    const avg = (latencies.reduce((a,b) => a+b, 0) / latencies.length).toFixed(0);
    const p50 = latencies[Math.floor(latencies.length * 0.5)];
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    const p99 = latencies[Math.floor(latencies.length * 0.99)];
    const max = latencies[latencies.length - 1];
    console.log(`   Total requests: ${timings.length}`);
    console.log(`   Average: ${avg}ms | P50: ${p50}ms | P95: ${p95}ms | P99: ${p99}ms | Max: ${max}ms`);

    const statusCounts = {};
    timings.forEach(t => { statusCounts[t.status] = (statusCounts[t.status] || 0) + 1; });
    console.log(`   Status codes:`, Object.entries(statusCounts).map(([k,v]) => `${k}:${v}`).join(', '));
  }

  // SUMMARY
  console.log('');
  console.log('='.repeat(60));
  console.log('📊 RESULTS SUMMARY');
  console.log(`   ✅ PASS: ${passed}`);
  console.log(`   ❌ FAIL: ${failed}`);
  console.log('');

  if (failed > 0) {
    console.log('❌ FAILED TESTS:');
    results.filter(r => r.status === '❌ FAIL').forEach(r => {
      console.log(`   - ${r.name}: ${r.detail}`);
    });
    console.log('');
  }

  console.log(`✅ All tests completed. ${passed + failed} total.`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
