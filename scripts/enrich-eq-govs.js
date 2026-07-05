const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'data', 'db.json');
const d = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const eq = d.blood_bank_equipment;
const mh = d.hospitals || [];

// manual overrides for cases where fuzzy match fails
const MANUAL = {
  'المجمع الطبي الاقصر': 'الأقصر',
  'مجمع الفيروز *': 'بورسعيد',
  'دهب': 'جنوب سيناء',
  'اسوان (الصداقه)': 'أسوان',
  'التل الكبير التخصصي': 'الإسماعيلية'
};

const manualKeys = Object.keys(MANUAL);
const mhMap = {};
mh.forEach(h => { mhMap[h.name] = h.governorate; });

let matched = 0, manual = 0, unmatched = [];

(eq.hospitals || []).forEach(h => {
  if (h.governorate && h.governorate.trim()) return; // already has gov
  const name = h.name.trim();

  // 1) Manual override
  const manualGov = MANUAL[name];
  if (manualGov) {
    h.governorate = manualGov;
    manual++;
    return;
  }

  // 2) Exact match
  if (mhMap[name]) {
    h.governorate = mhMap[name];
    matched++;
    return;
  }

  // 3) Fuzzy: find the best match
  const candidates = mh.filter(m =>
    m.name.includes(name) || name.includes(m.name)
  );
  if (candidates.length === 1) {
    h.governorate = candidates[0].governorate;
    matched++;
    return;
  }

  // 4) If multiple, pick longest name match
  if (candidates.length > 1) {
    const sorted = candidates.sort((a, b) => b.name.length - a.name.length);
    h.governorate = sorted[0].governorate;
    matched++;
    return;
  }

  unmatched.push(name);
});

fs.writeFileSync(dbPath, JSON.stringify(d, null, 2), 'utf8');
console.log('Done!');
console.log('Matched automatically:', matched);
console.log('Manual overrides:', manual);
console.log('Unmatched:', unmatched.length);
unmatched.forEach(u => console.log(' -', u));
