/**
 * pre-deploy.js — Downloads latest data from Belmo before commit+push
 * Run BEFORE every deploy: node pre-deploy.js
 * This ensures seed data is always up-to-date, preventing data loss on restart.
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const HOST = 'blood-bank-server-e47d.onbelmo.uk';
let sid = null;

function req(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: HOST, port: 443, path: urlPath, method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (sid) opts.headers['Cookie'] = `connect.sid=${sid}`;
    const r = https.request(opts, res => {
      const sc = res.headers['set-cookie'];
      if (sc) { const m = sc[0].match(/connect\.sid=([^;]+)/); if (m) sid = m[1]; }
      let buf = Buffer.alloc(0);
      res.on('data', c => buf = Buffer.concat([buf, c]));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(buf.toString('utf8')) }); }
        catch (e) { resolve({ status: res.statusCode, raw: buf.toString('utf8').substring(0,200) }); }
      });
    });
    r.on('error', reject);
    r.setTimeout(15000, () => { r.destroy(); reject(new Error('timeout')); });
    if (body) r.write(Buffer.from(JSON.stringify(body), 'utf8'));
    r.end();
  });
}

async function main() {
  console.log('🔄 Pre-deploy: downloading latest data from Belmo...');
  
  const login = await req('POST', '/api/login', { username: 'admin', password: '123' });
  if (login.status !== 200) throw new Error('Login failed: ' + (login.raw || login.status));
  console.log('✅ Logged in as:', login.data?.user?.name || 'admin');

  const exp = await req('GET', '/api/sync/export');
  if (exp.status !== 200 || !exp.data) throw new Error('Export failed');
  
  let dbData = exp.data.data || exp.data;
  
  // Merge equipment tables into combined blood_bank_equipment format
  const eqTypes = dbData.equipment_types || [];
  const eqHosps = dbData.equipment_hospitals || [];
  delete dbData.equipment_types;
  delete dbData.equipment_hospitals;
  if (!dbData.blood_bank_equipment || typeof dbData.blood_bank_equipment !== 'object') {
    dbData.blood_bank_equipment = { types: [], hospitals: [], lastUpdated: null };
  }
  if (eqTypes.length > 0) dbData.blood_bank_equipment.types = eqTypes;
  if (eqHosps.length > 0) dbData.blood_bank_equipment.hospitals = eqHosps;

  // Ensure time_offset is set
  if (!dbData.app_config) dbData.app_config = {};
  if (!dbData.app_config.time_offset) dbData.app_config.time_offset = 2;
  
  const outPath = path.join(__dirname, 'data', 'db.json');
  fs.writeFileSync(outPath, JSON.stringify(dbData, null, 2), 'utf8');
  
  const stats = fs.statSync(outPath);
  const counts = {
    users: dbData.users?.length || 0,
    hospitals: dbData.hospitals?.length || 0,
    archives: dbData.archives?.length || 0,
    donors: dbData.donors?.length || 0,
    donations: dbData.donations?.length || 0,
    employees: dbData.employee_statements?.length || 0,
    bigIndicators: dbData.monthly_big_indicators?.length || 0,
    smallIndicators: dbData.monthly_small_indicators?.length || 0,
    consumption: dbData.monthly_consumption?.length || 0,
    readinessOccasions: dbData.readiness_occasions?.length || 0,
    readinessReports: dbData.readiness_reports?.length || 0,
    dailyReports: dbData.daily_reports?.length || 0,
    strategicReserves: dbData.strategic_reserves?.length || 0,
    equipmentHospitals: dbData.blood_bank_equipment?.hospitals?.length || 0,
  };

  console.log('✅ Data downloaded:', (stats.size / 1024).toFixed(0), 'KB');
  console.log('   Users:', counts.users, '| Hospitals:', counts.hospitals);
  console.log('   Archives:', counts.archives, '| Daily reports:', counts.dailyReports);
  console.log('   Donors:', counts.donors, '| Donations:', counts.donations);
  console.log('   Employees:', counts.employees, '| Strategic:', counts.strategicReserves);
  console.log('   Big indicators:', counts.bigIndicators, '| Small:', counts.smallIndicators);
  console.log('   Consumption:', counts.consumption);
  console.log('   Readiness occasions:', counts.readinessOccasions, '| Reports:', counts.readinessReports);
  console.log('   Equipment hospitals:', counts.equipmentHospitals);
  console.log('   time_offset:', dbData.app_config?.time_offset);
  
  // Verify Arabic names
  const nameOk = dbData.users && dbData.users[0] && /[\u0600-\u06FF]/.test(dbData.users[0].name || '');
  console.log('   Arabic names:', nameOk ? '✅ Correct' : '❌ Garbled');
  
  if (!nameOk) {
    console.log('⚠️  WARNING: Arabic names are garbled! Data may be corrupted.');
    console.log('   First user:', dbData.users?.[0]?.name);
  }

  console.log('\n✅ Ready to commit. Run:');
  console.log('   git add data/db.json && git commit -m "update seed data" && git push');
}

main().catch(err => {
  console.error('❌ Pre-deploy failed:', err.message);
  process.exit(1);
});
