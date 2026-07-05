const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const { JSONDB } = require('../jsondb');

const COL_MAP = {
  3:'collect_total', 4:'inc_blood', 5:'inc_plasma', 6:'inc_sdp', 7:'inc_rdp',
  8:'out_blood_int', 9:'out_blood_branch', 10:'out_blood_auth', 11:'out_blood_ext',
  12:'out_plasma_int', 13:'out_plasma_ext', 14:'out_sdp', 15:'out_rdp',
  16:'blood_groups', 17:'compatibility', 18:'ct',
  19:'donation_therapeutic', 20:'uncompleted', 21:'refused_fatty', 22:'refused_icteric',
  // col23 = 'All' (skip)
  24:'virology_c', 25:'virology_b', 26:'virology_i', 27:'virology_dollar',
  28:'disp_exp_blood', 29:'disp_exp_plasma', 30:'disp_exp_sdp', 31:'disp_exp_rdp',
  32:'disp_returned', 33:'disp_reaction', 34:'disp_open', 35:'disp_other',
  // col36 = collect_total repeat (skip)
  37:'tested', 38:'ratio_uncompleted', 39:'ratio_refused', 40:'ratio_c',
  41:'ratio_b', 42:'ratio_i', 43:'ratio_dollar', 44:'ratio_exp',
  45:'ratio_returned', 46:'ratio_reaction', 47:'ratio_open', 48:'ratio_other'
};

// Mapping from Excel sheet names to month numbers
const MONTH_SHEETS = { 'Mar 2026':3, 'Apr 2026':4, 'May 2026':5, 'Jun 2026':6 };

// Fix governorate names to match db
const GOV_FIX = { 'الاسماعيلية':'الإسماعيلية', 'اسوان':'أسوان' };

// Name overrides for hospitals whose Excel name differs from db
const NAME_OVERRIDES = {
  'مجمع الإسماعلية': 'المجمع الطبي *',
  'طيبه التخصصي': 'طيبة التخصصي *',
  'النيل (حورس ادفو)': 'النيل التخصصي*(حورس ادفو)'
};

const filePath = path.join(process.env.USERPROFILE, 'Desktop', 'مؤشرات تجميعي  2026 (1).xlsx');
const wb = XLSX.readFile(filePath);

const db = new JSONDB('./data/db.json');
db.init();

// Build hospital lookup: by governorate, match by normalized name fuzzy
var hospByGov = {};
db.data.hospitals.forEach(function(h) {
  if (!hospByGov[h.governorate]) hospByGov[h.governorate] = [];
  hospByGov[h.governorate].push(h);
});

// Fuzzy match: find hospital whose db name contains the Excel name (normalized)
function findHosp(gov, hospName) {
  // Check name overrides first
  var override = NAME_OVERRIDES[hospName];
  if (override) {
    var list = hospByGov[gov] || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].name === override) return list[i];
    }
  }
  var list = hospByGov[gov] || [];
  var normExcel = hospName.replace(/[أإآا]/g, 'ا').replace(/[هة]/g, 'ه').replace(/\s+/g, '').replace(/[ـ─—]/g, '').replace(/[\*\(\)]/g, '').trim();
  var best = null;
  list.forEach(function(h) {
    var normDb = h.name.replace(/[أإآا]/g, 'ا').replace(/[هة]/g, 'ه').replace(/\s+/g, '').replace(/[ـ─—]/g, '').replace(/[\*\(\)]/g, '').trim();
    if (normDb.indexOf(normExcel) !== -1 || normExcel.indexOf(normDb) !== -1) best = h;
  });
  return best;
}

// Delete old 95-98 entries
const newItems = [];
db.data.archives.forEach(function(a) {
  if (a.type === 'مؤشرات تجميعيه' && a.id >= 95 && a.id <= 98) {
    console.log('Delete: ' + a.title + ' (id=' + a.id + ')');
  } else {
    newItems.push(a);
  }
});
db.data.archives = newItems;

var unmatched = {};
var nextId = db.data._counters?.archives || db.data.archives.length + 1;

function cleanGov(raw) {
  var g = String(raw || '')
    .replace(/[ـ─—]/g, '')
    .replace(/‌/g, '')
    .replace(/\s+/g, ' ').trim();
  return GOV_FIX[g] || g;
}

var totalRecords = 0;
var entries = [];

Object.keys(MONTH_SHEETS).forEach(function(sheetName) {
  var month = MONTH_SHEETS[sheetName];
  var ws = wb.Sheets[sheetName];
  if (!ws) { console.log('Sheet not found: ' + sheetName); return; }
  var rows = XLSX.utils.sheet_to_json(ws, { header:1, defval:'' });
  var currentGov = '';
  var seen = {};
  var records = [];

  for (var r = 5; r < rows.length; r++) {
    var row = rows[r];
    var rawGov = String(row[0] || '').trim();
    var rawHosp = String(row[1] || '').trim();
    if (rawGov && rawGov !== 'المحافظة' && rawHosp) currentGov = cleanGov(rawGov);
    if (!rawHosp || !currentGov) continue;
    // Skip if already processed this hospital+month
    var key = currentGov + '|' + rawHosp;
    if (seen[key]) continue;
    seen[key] = true;

    // Check if any data exists
    var hasData = false;
    var data = {};
    for (var c = 3; c <= 48; c++) {
      var k = COL_MAP[c];
      if (!k) continue;
      var v = row[c];
      if (typeof v === 'string' && (v.trim() === '' || /dat/i.test(v))) v = 0;
      v = Number(v);
      if (isNaN(v)) v = 0;
      data[k] = v;
      if (v !== 0) hasData = true;
    }

    if (!hasData) {
      console.log('  Skip (no data): ' + rawHosp + ' in ' + currentGov);
      continue;
    }

    // Match hospital_id
    var hosp = findHosp(currentGov, rawHosp);

    records.push({
      governorate: currentGov,
      hospital_name: hosp ? hosp.name : rawHosp,
      hospital_id: hosp ? hosp.id : undefined,
      year: 2026,
      month: month,
      period: 'monthly',
      data: data
    });
    if (!hosp) unmatched[currentGov + '|' + rawHosp] = rawHosp + ' / ' + currentGov;
    totalRecords++;
    console.log('  ' + currentGov + ' | ' + rawHosp + ': ' + data.collect_total + ' units');
  }

  var monthNames = ['','يناير','فبراير','مارس','ابريل','مايو','يونيو','يوليو','اغسطس','سبتمبر','اكتوبر','نوفمبر','ديسمبر'];
  entries.push({
    id: nextId++,
    type: 'مؤشرات تجميعيه',
    title: 'مؤشرات ' + monthNames[month] + ' 2026',
    date: new Date().toISOString(),
    data: JSON.stringify(records),
    archived: 0,
    created_at: new Date().toISOString()
  });
});

// Reverse to maintain chronological order (Mar first)
entries.reverse().forEach(function(e) {
  db.data.archives.unshift(e);
});

if (!db.data._counters) db.data._counters = {};
db.data._counters.archives = nextId;

db._write();
console.log('Done! Imported ' + totalRecords + ' records across ' + entries.length + ' months.');
if (Object.keys(unmatched).length > 0) {
  console.log('\nUNMATCHED hospitals:');
  Object.keys(unmatched).forEach(function(k) { console.log('  ' + k + ' -> ' + unmatched[k]); });
}
