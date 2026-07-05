const XLSX = require('xlsx');
const path = require('path');
const { JSONDB } = require('../jsondb');

// Column mapping for March (no time column, data starts at col3)
const COL_MAP_MAR = {
  3:'inc_collected', 4:'inc_regional', 5:'inc_plasma', 6:'inc_sdp', 7:'inc_rdp',
  8:'out_blood', 9:'out_plasma', 10:'out_sdp', 11:'out_rdp',
  12:'blood_groups', 13:'compatibility', 14:'ct',
  15:'disp_exp_blood', 16:'disp_exp_plasma', 17:'disp_exp_sdp', 18:'disp_exp_rdp',
  19:'disp_returned', 20:'disp_reaction', 21:'disp_open', 22:'disp_other',
  23:'pct_exp', 24:'pct_returned', 25:'pct_reaction', 26:'pct_open', 27:'pct_other'
};

// Column mapping for Apr-Jun (with time column, data starts at col4)
const COL_MAP_APR = {
  4:'inc_collected', 5:'inc_regional', 6:'inc_plasma', 7:'inc_sdp', 8:'inc_rdp',
  9:'out_blood', 10:'out_plasma', 11:'out_sdp', 12:'out_rdp',
  13:'blood_groups', 14:'compatibility', 15:'ct',
  16:'disp_exp_blood', 17:'disp_exp_plasma', 18:'disp_exp_sdp', 19:'disp_exp_rdp',
  20:'disp_returned', 21:'disp_reaction', 22:'disp_open', 23:'disp_other',
  24:'pct_exp', 25:'pct_returned', 26:'pct_reaction', 27:'pct_open', 28:'pct_other'
};

const MONTH_SHEETS = { 'Mar 2026':3, 'Apr 2026':4, 'May 2026':5, 'Jun 2026':6 };

function normalizeName(s) {
  // Normalize alif variants, remove tatweel, normalize spaces
  return String(s||'')
    .replace(/[أإآا]/g, 'ا')
    .replace(/[ـ─—]/g, '')
    .replace(/‌/g,'')
    .replace(/\s+/g,' ')
    .trim();
}

function cleanGov(raw) {
  if (!raw) return '';
  var bare = normalizeName(raw);
  return GOV_FIX[bare] || raw;
}

// Gov name normalization map (using bare alif as key)
const GOV_FIX = {
  'الاسماعيلية':'الإسماعيلية',
  'الاسماعليه':'الإسماعيلية',
  'اسوان':'أسوان'
};

function getVal(row, col) {
  if (!row || col >= row.length) return 0;
  var v = row[col];
  if (typeof v === 'string' && (v.trim() === '' || /dat/i.test(v))) return 0;
  var n = Number(v);
  return isNaN(n) ? 0 : n;
}

// Special name overrides (Excel garbled name → db hospital name)
const NAME_OVERRIDES = {
  '45473': '٣٠ يونيو',
  'أسوان (الصداقه)': 'اسوان التخصصي (الصداقه)',
  'المسله التخصصي': 'المسلة التخصصي'
};

var filePath = path.join(process.env.USERPROFILE, 'Desktop', 'مؤشرات تخزيني 2026.xlsx');
var wb = XLSX.readFile(filePath);

var db = new JSONDB('./data/db.json');
db.init();

// Build hospital lookup: normalized name (no spaces) → hospital
var hospLookup = {};
db.data.hospitals.forEach(function(h) {
  var key = normalizeName(h.governorate) + '|' + normalizeName(h.name).replace(/\s+/g, '');
  hospLookup[key] = h;
});

var unmatched = {};
var nextId = db.data._counters?.archives || db.data.archives.length + 1;

var totalRecords = 0;
var entries = [];

Object.keys(MONTH_SHEETS).forEach(function(sheetName) {
  var month = MONTH_SHEETS[sheetName];
  var ws = wb.Sheets[sheetName];
  if (!ws) { console.log('Sheet not found: ' + sheetName); return; }
  var rows = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});
  var currentGov = '';
  var seen = {};
  var records = [];

  var isMar = (sheetName === 'Mar 2026');
  var colMap = isMar ? COL_MAP_MAR : COL_MAP_APR;
  var skipColStart = isMar ? 3 : 4;

  for (var r = 5; r < rows.length; r++) {
    var row = rows[r];
    if (!row) continue;
    var rawGov = String(row[0] || '').trim();
    var rawHosp = String(row[1] || '').trim();

    if (rawGov && rawGov !== 'المحافظة' && rawHosp) {
      currentGov = rawGov;
    }
    currentGov = cleanGov(currentGov);
    var normHosp = normalizeName(rawHosp);
    if (!rawHosp || rawHosp === 'اسم المستشفي' || !currentGov) continue;

    // Apply name override before dedup
    var excelHosp = NAME_OVERRIDES[rawHosp] || rawHosp;
    var normExcel = normalizeName(excelHosp);

    // Dedup by normalized hospital name + governorate (spaces stripped)
    var dedupKey = currentGov + '|' + normExcel.replace(/\s+/g, '');
    if (seen[dedupKey]) continue;
    seen[dedupKey] = true;

    // Match hospital_id from db
    var lookupKey = normalizeName(currentGov) + '|' + normExcel.replace(/\s+/g, '');
    var hosp = hospLookup[lookupKey];

    if (!hosp) {
      unmatched[lookupKey] = (unmatched[lookupKey]||'') + excelHosp + ' / ' + currentGov;
      console.log('  UNMATCHED: ' + excelHosp + ' in ' + currentGov);
      continue;
    }

    var data = {};
    var hasData = false;

    Object.keys(colMap).forEach(function(colStr) {
      var col = parseInt(colStr);
      var k = colMap[col];
      if (!k) return;
      var v = getVal(row, col);
      data[k] = v;
      if (v !== 0) hasData = true;
    });

    if (!hasData) {
      console.log('  Skip (no data): ' + excelHosp + ' in ' + currentGov);
      continue;
    }

    records.push({
      governorate: currentGov,
      hospital_name: hosp.name,
      hospital_id: hosp.id,
      year: 2026,
      month: month,
      period: 'monthly',
      data: data
    });
    totalRecords++;
    console.log('  ' + currentGov + ' | ' + hosp.name + ': ' + (data.inc_collected||'--') + ' / ' + (data.out_blood||'--'));
  }

  var monthNames = ['','يناير','فبراير','مارس','ابريل','مايو','يونيو','يوليو','اغسطس','سبتمبر','اكتوبر','نوفمبر','ديسمبر'];
  entries.push({
    id: nextId++,
    type: 'مؤشرات تخزينيه',
    title: 'مؤشرات تخزينيه - أرشيف 2026/' + month,
    date: new Date().toISOString(),
    data: JSON.stringify(records),
    archived: 0,
    created_at: new Date().toISOString()
  });
});

// Unshift in chronological order
entries.reverse().forEach(function(e) {
  db.data.archives.unshift(e);
});

db.data._counters.archives = nextId;
db._write();
console.log('\nDone! Imported ' + totalRecords + ' records across ' + entries.length + ' months.');
if (Object.keys(unmatched).length > 0) {
  console.log('\nUNMATCHED hospitals:');
  Object.keys(unmatched).forEach(function(k) { console.log('  ' + k + ' -> ' + unmatched[k]); });
}
