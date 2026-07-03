const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const SRC = 'C:\\Users\\PC\\Downloads\\اجهزة 26.xlsx';
const wb = XLSX.readFile(SRC);

// ====== EQUIPMENT TYPES (from the columns structure) ======
const TYPES = [
  { id: 1, name: 'فريزر بلازما', sub: ['عدد', 'حالة'] },
  { id: 2, name: 'ثلاجة دم', sub: ['عدد', 'حالة'] },
  { id: 3, name: 'ثلاجة مستهلكات', sub: ['عدد', 'حالة'] },
  { id: 4, name: 'ثلاجة اعدام', sub: ['عدد', 'حالة'] },
  { id: 5, name: 'حضان للصفائح الدموية', sub: ['عدد', 'حالة'] },
  { id: 6, name: 'جهاز تسييح البلازما', sub: ['عدد', 'حالة'] },
  { id: 7, name: 'نظام مغلق Close sys', sub: ['عدد', 'حالة'] },
  { id: 8, name: 'عاصر انبوب Tube Stripper', sub: ['عدد', 'حالة'] },
  { id: 9, name: 'التوافق Cm set', sub: ['عدد', 'حالة'] },
  { id: 10, name: 'Pipette Fixed 50µ', sub: ['عدد', 'حالة'] },
  { id: 11, name: 'Pipette Variable 100-1000µ', sub: ['عدد', 'حالة'] },
  { id: 12, name: 'Pipette Variable 20-200µ', sub: ['عدد', 'حالة'] },
  { id: 13, name: 'Pipette Variable 10-100µ', sub: ['عدد', 'حالة'] },
  { id: 14, name: 'ميزان ديجيتال Lab Balance', sub: ['عدد', 'حالة'] },
  { id: 15, name: 'سنترفيوج مبرد', sub: ['عدد', 'حالة'] },
  { id: 16, name: 'جهاز فصل يدوي Extractor', sub: ['عدد', 'حالة'] },
  { id: 17, name: 'سرير متبرع', sub: ['عدد', 'حالة'] },
  { id: 18, name: 'جهاز هزاز وميزان قرب الدم', sub: ['عدد', 'حالة'] },
  { id: 19, name: 'جهاز قياس هيموجلوبين', sub: ['عدد', 'حالة'] },
  { id: 20, name: 'Adult Sphygmomanometer', sub: ['عدد', 'حالة'] },
  { id: 21, name: 'Stethoscope', sub: ['عدد', 'حالة'] },
  { id: 22, name: 'ميزان أشخاص', sub: ['عدد', 'حالة'] },
];

// Column mapping for equipment sheet
const TYPES_COLS = [
  { typeId: 1, startCol: 7 },   // فريزر بلازما
  { typeId: 2, startCol: 9 },   // ثلاجة دم
  { typeId: 3, startCol: 11 },  // ثلاجة مستهلكات
  { typeId: 4, startCol: 13 },  // ثلاجة اعدام
  { typeId: 5, startCol: 15 },  // حضان للصفائح
  { typeId: 6, startCol: 17 },  // جهاز تسييح البلازما
  { typeId: 7, startCol: 19 },  // نظام مغلق
  { typeId: 8, startCol: 23 },  // Tube Stripper
  { typeId: 9, startCol: 25 },  // Cm set
  { typeId: 10, startCol: 29 }, // Pipette 50µ
  { typeId: 11, startCol: 31 }, // Pipette 100-1000
  { typeId: 12, startCol: 33 }, // Pipette 20-200
  { typeId: 13, startCol: 35 }, // Pipette 10-100
  { typeId: 14, startCol: 37 }, // Balance
  { typeId: 15, startCol: 40 }, // سنترفيوج مبرد
  { typeId: 16, startCol: 42 }, // Extractor
  { typeId: 17, startCol: 44 }, // سرير متبرع
  { typeId: 18, startCol: 46 }, // جهاز هزاز
  { typeId: 19, startCol: 48 }, // هيموجلوبين
  { typeId: 20, startCol: 50 }, // Sphygmomanometer
  { typeId: 21, startCol: 52 }, // Stethoscope
  { typeId: 22, startCol: 54 }, // ميزان أشخاص
];

// ====== Read Sheet 1: الاجهزة ======
const ws = wb.Sheets['الاجهزة'];
const raw = XLSX.utils.sheet_to_json(ws, { header: 1 });
const data = {};

for (let r = 4; r < raw.length; r++) {
  const row = raw[r];
  if (!row || !row[1]) continue;
  const governorate = (row[0] || '').toString().trim();
  const name = (row[1] || '').toString().trim();
  if (!name) continue;
  const key = name.replace(/\s+/g, ' ').trim();
  const equipment = {};
  TYPES_COLS.forEach(tc => {
    const t = TYPES.find(x => x.id === tc.typeId);
    const val1 = row[tc.startCol];
    const val2 = row[tc.startCol + 1];
    if (val1 != null || val2 != null) {
      equipment[tc.typeId] = {
        count: val1 != null && val1 !== '' ? Number(val1) : null,
        status: val2 != null && val2 !== '' ? String(val2).trim() : null,
        brand: null,
        capacity: null,
      };
    }
  });
  data[key] = {
    governorate: governorate.replace(/[\s\-]+/g, ' ').trim(),
    name: key,
    consumption: {
      blood: row[4] != null ? row[4] : null,
      plasma: row[5] != null ? row[5] : null,
      platelets: row[6] != null ? row[6] : null,
    },
    equipment,
  };
}

// ====== Read Sheet 2: ماركات ======
const ws2 = wb.Sheets['ماركات'];
const raw2 = XLSX.utils.sheet_to_json(ws2, { header: 1 });

// Brand columns mapping (from row 4 analysis)
// Each equipment type in brands sheet has: count | brand | capacity | status
const BRAND_COLS = [
  // col indices for: count, brand, capacity, status
  { typeId: 1, count: 7, brand: 8, capacity: 9, status: 10 },
  { typeId: 2, count: 11, brand: 12, capacity: 13, status: 16 },
  { typeId: 3, count: 17, brand: 18, capacity: null, status: 19 },
  { typeId: 5, count: 20, brand: 21, capacity: 22, status: 23 },
  { typeId: 6, count: 24, brand: 25, capacity: null, status: 26 },
  { typeId: 7, count: 27, brand: 28, capacity: null, status: 29 },
  { typeId: 8, count: 30, brand: 31, capacity: null, status: 32 },
  { typeId: 9, count: 36, brand: 37, capacity: null, status: 38 },
  { typeId: 10, count: 42, brand: 43, capacity: null, status: 44 },
  { typeId: 11, count: 45, brand: 46, capacity: null, status: 47 },
  { typeId: 14, count: 54, brand: 55, capacity: null, status: 56 },
  { typeId: 15, count: 58, brand: 60, capacity: null, status: 61 },
  { typeId: 17, count: 65, brand: 66, capacity: null, status: 67 },
];

for (let r = 5; r < raw2.length; r++) {
  const row = raw2[r];
  if (!row || !row[1]) continue;
  const name = String(row[1] || '').trim();
  if (!name) continue;
  const cleanName = name.replace(/\s+/g, ' ').trim();
  const hos = data[cleanName];
  if (!hos) continue;
  BRAND_COLS.forEach(bc => {
    if (hos.equipment[bc.typeId]) {
      const brand = row[bc.brand];
      const capacity = bc.capacity != null ? row[bc.capacity] : null;
      const bStatus = row[bc.status];
      if (brand != null) hos.equipment[bc.typeId].brand = String(brand).trim();
      if (capacity != null) hos.equipment[bc.typeId].capacity = String(capacity).trim();
      if (bStatus != null) hos.equipment[bc.typeId].status = String(bStatus).trim();
    }
  });
}

// ====== Save to db.json ======
const dbPath = path.join(__dirname, 'data', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
db.blood_bank_equipment = {
  types: TYPES,
  hospitals: Object.values(data).sort((a,b) => a.governorate.localeCompare(b.governorate) || a.name.localeCompare(b.name)),
  lastUpdated: new Date().toISOString(),
};
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

console.log(`✅ Imported ${Object.keys(data).length} hospitals`);
console.log(`   ${TYPES.length} equipment types`);
console.log(`   Brands: ${BRAND_COLS.filter(b => b.brand != null).length} equipment types with brand data`);
