const XLSX = require('xlsx');
const path = require('path');
const { JSONDB } = require('../jsondb');

const COL_MAP = {
  3:'collect_total',4:'inc_blood',5:'inc_plasma',6:'inc_sdp',7:'inc_rdp',
  8:'out_blood_int',9:'out_blood_branch',10:'out_blood_auth',11:'out_blood_ext',
  12:'out_plasma_int',13:'out_plasma_ext',14:'out_sdp',15:'out_rdp',
  16:'blood_groups',17:'compatibility',18:'ct',
  19:'donation_therapeutic',20:'uncompleted',21:'refused_fatty',22:'refused_icteric',
  23:'virology_c',24:'virology_b',25:'virology_i',26:'virology_dollar',
  27:'disp_exp_blood',28:'disp_exp_plasma',29:'disp_exp_sdp',30:'disp_exp_rdp',
  31:'disp_returned',32:'disp_reaction',33:'disp_open',34:'disp_other',
  35:'tested',36:'ratio_uncompleted',37:'ratio_refused',38:'ratio_c',
  39:'ratio_b',40:'ratio_i',41:'ratio_dollar',42:'ratio_exp',
  43:'ratio_returned',44:'ratio_reaction',45:'ratio_open',46:'ratio_other'
};

const MONTH_MAP = { 'Mar':3,'Apr':4,'May':5,'Jun':6, 'مارس':3, 'ابريل':4, 'مايو':5, 'يونيو':6 };
const ARABIC_MONTHS = { 3:'مارس',4:'ابريل',5:'مايو',6:'يونيو' };

async function main() {
  const db = new JSONDB(path.join(__dirname, '..', 'data', 'db.json'));
  db.init();

  const filePath = path.join(process.env.USERPROFILE, 'Desktop', 'مؤشرات تجميعي  2026 (1).xlsx');
  const wb = XLSX.readFile(filePath);

  let totalInserted = 0;

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws, { header:1, defval:'' });
    const monthName = sheetName.split(' ')[0];
    const month = MONTH_MAP[monthName];
    if (!month) { console.log('⚠ Unknown month in sheet:', sheetName); continue; }

    let currentGov = '';
    const seen = new Set();
    const records = [];

    for (let r = 5; r < data.length; r++) {
      const row = data[r];
      const rawGov = String(row[0] || '').trim();
      const rawHosp = String(row[1] || '').trim();
      if (rawGov && rawGov !== 'المحافظة') currentGov = rawGov;
      if (!rawHosp || rawHosp === 'اسم المستشفي' || rawHosp === 'بنك الدم') continue;
      const key = currentGov + '|' + rawHosp;
      if (seen.has(key)) continue;
      seen.add(key);

      const vals = {};
      for (let c = 3; c < Math.min(row.length, 48); c++) {
        const k = COL_MAP[c];
        if (!k) continue;
        let v = row[c];
        if (typeof v === 'string' && (v.trim() === '' || /dat/i.test(v))) { vals[k] = 0; continue; }
        v = Number(v);
        vals[k] = isNaN(v) ? 0 : v;
      }
      records.push({
        governorate: currentGov.replace(/[─\-]/g, '').replace(/ـ/g, '').replace(/\s+/g, ' ').trim(),
        hospital_name: rawHosp.replace(/\s+/g, ' ').trim(),
        year: 2026,
        month: month,
        data: vals
      });
    }

    if (!records.length) { console.log(`⚠ ${sheetName}: no records`); continue; }

    // Create archive entry
    const title = `مؤشرات ${ARABIC_MONTHS[month]} 2026`;
    const archiveId = db._nextId('archives');
    const archiveEntry = {
      id: archiveId,
      type: 'مؤشرات تجميعيه',
      title: title,
      data: JSON.stringify(records),
      date: new Date().toISOString(),
      user_id: 1,
      user_name: 'ادخال تلقائي'
    };
    db.data.archives.unshift(archiveEntry);
    db._write();
    totalInserted += records.length;
    console.log(`✓ ${title}: ${records.length} records (archive id ${archiveId})`);
  }

  console.log(`\n✅ Done! ${totalInserted} total records imported.`);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
