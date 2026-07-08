var fs = require('fs');
var mapped = JSON.parse(fs.readFileSync('scripts/import_consumption.json', 'utf8'));
var db = JSON.parse(fs.readFileSync('data/db.json', 'utf8'));

db.monthly_consumption = db.monthly_consumption || [];
if (!db._counters) db._counters = {};
if (!db._counters.monthly_consumption) {
  var maxId = 0;
  db.monthly_consumption.forEach(function(x) { if (x.id > maxId) maxId = x.id; });
  db._counters.monthly_consumption = maxId;
}

var inserted = 0, updated = 0;
mapped.forEach(function(rec) {
  var idx = db.monthly_consumption.findIndex(function(x) {
    return x.hospital_id === rec.hospital_id && x.year === rec.year && x.month === rec.month;
  });
  if (idx >= 0) {
    db.monthly_consumption[idx].blood_types = rec.blood_types;
    db.monthly_consumption[idx].hospital_name = rec.hospital_name;
    db.monthly_consumption[idx].governorate = rec.governorate;
    updated++;
  } else {
    db._counters.monthly_consumption++;
    db.monthly_consumption.push({
      id: db._counters.monthly_consumption,
      hospital_id: rec.hospital_id,
      hospital_name: rec.hospital_name,
      governorate: rec.governorate,
      year: rec.year,
      month: rec.month,
      blood_types: rec.blood_types,
      user_id: 1
    });
    inserted++;
  }
});

console.log('Inserted: ' + inserted + ', Updated: ' + updated);
console.log('Total monthly_consumption: ' + db.monthly_consumption.length);

// Create separate archives per year
var byYear = {};
mapped.forEach(function(rec) {
  if (!byYear[rec.year]) byYear[rec.year] = [];
  byYear[rec.year].push({
    id: rec.hospital_id,
    hospital_id: rec.hospital_id,
    hospital_name: rec.hospital_name,
    governorate: rec.governorate,
    year: rec.year,
    month: rec.month,
    blood_types: rec.blood_types,
    user_id: 1
  });
});

db.archives = db.archives || [];
Object.keys(byYear).sort().forEach(function(year) {
  var archTitle = 'منصرف فصائل الدم - ' + year;
  var existingArch = db.archives.find(function(a) { return a.type === 'منصرف فصائل الدم' && a.title === archTitle; });
  var data = byYear[year];
  if (existingArch) {
    data.forEach(function(rec) {
      var idx = existingArch.data.findIndex(function(x) { return x.hospital_id === rec.hospital_id && x.month === rec.month; });
      if (idx >= 0) existingArch.data[idx] = rec;
      else existingArch.data.push(rec);
    });
    console.log('Archive updated: ' + archTitle + ' (' + existingArch.data.length + ' records)');
  } else {
    if (!db._counters.archives) {
      var maxId2 = 0;
      (db.archives || []).forEach(function(x) { if (x.id > maxId2) maxId2 = x.id; });
      db._counters.archives = maxId2;
    }
    db._counters.archives++;
    db.archives.push({
      id: db._counters.archives,
      type: 'منصرف فصائل الدم',
      title: archTitle,
      data: data,
      user_id: 1,
      user_name: 'admin',
      date: new Date().toISOString()
    });
    console.log('Archive created: ' + archTitle + ' (' + data.length + ' records)');
  }
});

// Also update existing archive entries for 2025 to use the new data
// (if they already had partial 2025 data from auto-archive)

fs.writeFileSync('data/db.json', JSON.stringify(db, null, 2));
console.log('\nDone!');
