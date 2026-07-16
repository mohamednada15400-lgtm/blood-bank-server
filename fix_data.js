var fs = require('fs');
var dbPath = __dirname + '/data/db.json';
var db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 1. monthly_consumption → keep June 2026 only
var oldCons = db.monthly_consumption || [];
db.monthly_consumption = oldCons.filter(function(c) { return c.year === 2026 && c.month === 6; });
console.log('Consumption: ' + oldCons.length + ' → ' + db.monthly_consumption.length);

// 2. monthly_big_indicators → keep June 2026 only
var oldBi = db.monthly_big_indicators || [];
db.monthly_big_indicators = oldBi.filter(function(r) { return r.year === 2026 && r.month === 6; });
console.log('Big indicators: ' + oldBi.length + ' → ' + db.monthly_big_indicators.length);

// 3. monthly_small_indicators → keep June 2026 only
var oldSi = db.monthly_small_indicators || [];
db.monthly_small_indicators = oldSi.filter(function(r) { return r.year === 2026 && r.month === 6; });
console.log('Small indicators: ' + oldSi.length + ' → ' + db.monthly_small_indicators.length);

// 4. Archives untouched
console.log('Archives: ' + (db.archives || []).length);

// Save
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('\n✅ Saved');
