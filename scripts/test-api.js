const http = require('http');
http.get('http://localhost:3001/api/archive', function(res) {
  var d = '';
  res.on('data', function(c) { d += c; });
  res.on('end', function() {
    try {
      var a = JSON.parse(d);
      if (!Array.isArray(a)) {
        console.log('Not an array:', typeof a, JSON.stringify(a).slice(0, 300));
        return;
      }
      var matched = a.filter(function(x) {
        return x.type === 'مؤشرات تجميعيه' && x.id >= 99;
      });
      matched.forEach(function(x) {
        console.log(x.id, x.title, JSON.parse(x.data).length + ' records');
      });
      if (!matched.length) {
        console.log('No entries >= 99 found');
        a.filter(function(x) {
          return x.type === 'مؤشرات تجميعيه';
        }).forEach(function(x) {
          console.log('  existing:', x.id, x.title);
        });
      }
    } catch (e) {
      console.log('Parse error:', e.message);
      console.log('Response:', d.slice(0, 300));
    }
  });
}).on('error', function(e) {
  console.log('Request error:', e.message);
});
