const https = require('https');
const fs = require('fs');
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
  const login = await request('POST', '/api/login', { username: 'admin', password: '123' });
  console.log('Login:', login.status, login.data?.user?.name);

  const db = JSON.parse(fs.readFileSync('C:/Users/PC/Documents/nada/blood-bank-server/data/db.json', 'utf8'));
  console.log('Local db:', db.users.length, 'users,', db.hospitals.length, 'hospitals');
  console.log('Sample user:', db.users[0].name);
  console.log('Sample hosp:', db.hospitals[0].name);

  const importResult = await request('POST', '/api/sync/import', { data: db });
  console.log('Import:', importResult.status, importResult.data?.message || importResult.raw);

  // Verify
  const verify = await request('GET', '/api/hospitals');
  if (verify.data && verify.data[0]) {
    console.log('Verified hospital:', verify.data[0].name);
    console.log('Arabic OK:', /[\u0600-\u06FF]/.test(verify.data[0].name));
  }

  const arch = await request('GET', '/api/archive');
  console.log('Archives after import:', arch.data?.length);
})();
