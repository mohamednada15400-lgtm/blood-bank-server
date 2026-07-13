const https = require('https');
const fs = require('fs');
const path = require('path');

const HOST = 'blood-bank-server-e47d.onbelmo.uk';
let sid = null;

function request(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: HOST, port: 443, path: urlPath, method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (sid) opts.headers['Cookie'] = `connect.sid=${sid}`;
    const req = https.request(opts, res => {
      const setCookie = res.headers['set-cookie'];
      if (setCookie) {
        const m = setCookie[0].match(/connect\.sid=([^;]+)/);
        if (m) sid = m[1];
      }
      let buf = Buffer.alloc(0);
      res.on('data', chunk => buf = Buffer.concat([buf, chunk]));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(buf.toString('utf8')) }); }
        catch (e) { resolve({ status: res.statusCode, raw: buf.toString('utf8').substring(0,200) }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(Buffer.from(JSON.stringify(body), 'utf8'));
    req.end();
  });
}

(async () => {
  console.log('Logging in...');
  const login = await request('POST', '/api/login', { username: 'admin', password: '123' });
  console.log('Login:', login.status, login.data?.user?.name || login.raw);

  console.log('Downloading data...');
  const exp = await request('GET', '/api/sync/export');
  console.log('Export:', exp.status, 'Size:', JSON.stringify(exp.data).length);

  if (exp.data && exp.data.data) {
    const outPath = path.join(__dirname, 'db.json');
    fs.writeFileSync(outPath, JSON.stringify(exp.data.data, null, 2), 'utf8');
    const stats = fs.statSync(outPath);
    console.log('Saved to db.json:', (stats.size / 1024).toFixed(0), 'KB');
    
    const d = exp.data.data;
    console.log('Users:', d.users?.length);
    console.log('Hospitals:', d.hospitals?.length);
    console.log('Archives:', d.archives?.length);
    console.log('Daily reports:', d.daily_reports?.length);
    console.log('Donors:', d.donors?.length);
    console.log('Donations:', d.donations?.length);
    console.log('Employee statements:', d.employee_statements?.length);
    console.log('Big indicators:', d.monthly_big_indicators?.length);
    console.log('Small indicators:', d.monthly_small_indicators?.length);
    console.log('Consumption:', d.monthly_consumption?.length);
    console.log('Readiness occasions:', d.readiness_occasions?.length);
    console.log('Readiness reports:', d.readiness_reports?.length);
    console.log('time_offset:', d.app_config?.time_offset);
    
    // Check Arabic names
    if (d.users && d.users[0]) {
      console.log('First user name:', d.users[0].name);
      console.log('Name is valid Arabic:', /[\u0600-\u06FF]/.test(d.users[0].name));
    }
    if (d.hospitals && d.hospitals[0]) {
      console.log('First hospital:', d.hospitals[0].name);
    }
  }
})();
