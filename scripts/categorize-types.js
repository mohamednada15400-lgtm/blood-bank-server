const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'data', 'db.json');
const d = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const types = d.blood_bank_equipment?.types || [];

const CATEGORIES = {
  'تبريد': [1, 2, 3, 4, 15],       // فريزر بلازما, ثلاجة دم, ثلاجة مستهلكات, ثلاجة اعدام, سنترفيوج مبرد
  'أجهزة فصل': [7, 8, 16, 6],         // نظام مغلق, عاصر انبوب, جهاز فصل يدوي, جهاز تسييح البلازما
  'أجهزة قياس': [9, 10, 11, 12, 13, 14, 19],  // التوافق, pipettes, ميزان, هيموجلوبين
};

const HOSPITAL_TYPE_SPECIAL = {
  // Only collection hospitals need these
  'تجميعي': [7, 8, 16, 6],  // فصل equipment
};

let changes = 0;
types.forEach(t => {
  let changed = false;
  // Find category
  for (const [cat, ids] of Object.entries(CATEGORIES)) {
    if (ids.includes(t.id)) {
      if (t.category !== cat) { t.category = cat; changed = true; }
      break;
    }
  }
  // Find hospital_type
  for (const [ht, ids] of Object.entries(HOSPITAL_TYPE_SPECIAL)) {
    if (ids.includes(t.id)) {
      if (t.hospital_type !== ht) { t.hospital_type = ht; changed = true; }
      break;
    }
  }
  if (!t.hospital_type) { t.hospital_type = 'both'; changed = true; }
  if (changed) changes++;
});

console.log(`Updated ${changes} types`);
types.forEach(t => console.log(`  ${t.id}: ${t.name} → ${t.category || '-'} | ${t.hospital_type}`));

fs.writeFileSync(dbPath, JSON.stringify(d, null, 2), 'utf8');
console.log('\nSaved!');
