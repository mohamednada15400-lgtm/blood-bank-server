var XLSX = require('xlsx');
var fs = require('fs');

var MONTH_MAP = {
  'يناير': 1, 'فبراير': 2, 'مارس': 3, 'إبريل': 4, 'ابريل': 4,
  'أبريل': 4, 'مايو': 5, 'يونيو': 6, 'يوليو': 7,
  'أغسطس': 8, 'اغسطس': 8, 'سبتمبر': 9, 'أكتوبر': 10, 'اكتوبر': 10,
  'نوفمبر': 11, 'ديسمبر': 12
};
var SURE_HEADERS = ['الشهر', 'الفرع', 'اسم بنك الدم', 'المجموع', 'معدل'];

function clean(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/[\u200E\u200F]/g, '').trim();
}

function monthNum(s) {
  s = clean(s);
  if (!s) return 0;
  if (MONTH_MAP[s]) return MONTH_MAP[s];
  var n = parseInt(s);
  return isNaN(n) ? 0 : n;
}

function parseSheet(ws, year) {
  var data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  var curGov = '', curName = '';
  var rows = [];
  for (var i = 0; i < data.length; i++) {
    var r = data[i];
    var c0 = clean(r[0]);
    var c1 = clean(r[1]);
    var c2 = clean(r[2]);
    if (SURE_HEADERS.indexOf(c2) >= 0) continue;
    if (c2 === 'الإجمالي العام') continue;
    if (c0 && c0 !== 'الفرع' && c0.length > 2) {
      if (isNaN(parseInt(c0.replace(/[^0-9]/g, '')))) curGov = c0;
    }
    if (c1 && c1 !== 'اسم بنك الدم' && c1.length > 2) curName = c1;
    if (!c2) continue;
    var mn = monthNum(c2);
    if (!mn) continue;
    if (!curName || !curGov) continue;
    rows.push({
      gov: curGov, name: curName, year: year, month: mn,
      a_plus: parseInt(r[3]) || 0, a_minus: parseInt(r[4]) || 0,
      b_plus: parseInt(r[5]) || 0, b_minus: parseInt(r[6]) || 0,
      o_plus: parseInt(r[7]) || 0, o_minus: parseInt(r[8]) || 0,
      ab_plus: parseInt(r[9]) || 0, ab_minus: parseInt(r[10]) || 0
    });
  }
  return rows;
}

// Read DB hospitals
var db = JSON.parse(fs.readFileSync('data/db.json', 'utf8'));
var dbH = {};
db.hospitals.forEach(function(h) { dbH[h.name] = h; });

var MANUAL = {
  'الحياه بور فواد': 'الحياة بورفؤاد *',
  'القنطره غرب التخصصي': 'القنطرة غرب التخصصي',
  'القنطره شرق التخصصي': 'القنطرة شرق التخصصي',
  'مجمع السويس': 'مجمع السويس الطبي *',
  'رأس سدر': 'راس سدر *',
  'اسوان الصداقه': 'اسوان التخصصي (الصداقه)',
  'المسله التخصصي': 'المسلة التخصصي',
  'النصر': 'النصر'
};

function findHospital(name) {
  if (dbH[name]) return dbH[name];
  if (MANUAL[name]) return dbH[MANUAL[name]];
  var c = name.replace(/[\s*]/g, '');
  for (var key in dbH) {
    if (key.replace(/[\s*]/g, '') === c) return dbH[key];
  }
  for (var key in dbH) {
    if (key.indexOf(name.replace(/[ *]/g,'')) >= 0 || name.indexOf(key.replace(/[ *]/g,'')) >= 0) return dbH[key];
  }
  return null;
}

var wb = XLSX.readFile('C:/Users/PC/Desktop/منصرف الفصائل 2025.xlsx');

var allRows = [];
var allMapped = [];

wb.SheetNames.forEach(function(sheetName) {
  var year = parseInt(sheetName);
  if (isNaN(year)) { console.log('Skip sheet:', sheetName); return; }
  var ws = wb.Sheets[sheetName];
  var rows = parseSheet(ws, year);
  console.log(year + ': ' + rows.length + ' rows');
  allRows = allRows.concat(rows);
});

// Collect unique hospitals per year
var byYear = {};
allRows.forEach(function(r) {
  if (!byYear[r.year]) byYear[r.year] = {};
  byYear[r.year][r.name] = true;
});
console.log('\n=== Hospitals per year ===');
Object.keys(byYear).sort().forEach(function(y) {
  var names = Object.keys(byYear[y]);
  console.log(y + ': ' + names.length + ' hospitals');
});

// Map all rows
console.log('\n=== Mapping ===');
var seen = {};
allRows.forEach(function(r) {
  var found = findHospital(r.name);
  if (!found) return;
  var key = found.id + '_' + r.year + '_' + r.month;
  if (seen[key]) return;
  seen[key] = true;
  allMapped.push({
    hospital_id: found.id,
    hospital_name: found.name,
    governorate: found.governorate,
    year: r.year,
    month: r.month,
    blood_types: {'A+':r.a_plus,'A-':r.a_minus,'B+':r.b_plus,'B-':r.b_minus,'AB+':r.ab_plus,'AB-':r.ab_minus,'O+':r.o_plus,'O-':r.o_minus}
  });
});

console.log('Mapped records:', allMapped.length);
console.log('Unmapped rows:', allRows.length - allMapped.length);

var missed = {};
allRows.forEach(function(r) {
  var found = findHospital(r.name);
  if (!found) missed[r.name] = (missed[r.name]||0) + 1;
});
var missNames = Object.keys(missed);
if (missNames.length) {
  console.log('\nUnmapped hospitals:');
  missNames.forEach(function(n) { console.log('  ' + n + ' (' + missed[n] + ' rows)'); });
}

fs.writeFileSync('scripts/import_consumption.json', JSON.stringify(allMapped, null, 2));
console.log('\nSaved to scripts/import_consumption.json');
