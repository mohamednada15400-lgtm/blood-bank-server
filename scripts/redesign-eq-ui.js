const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'public', 'js', 'app.js');
let content = fs.readFileSync(filePath, 'utf8');

// Find the exact boundaries of the three functions
const func1Start = content.indexOf('async function renderBloodBankEquipment()');
const func1End = content.indexOf('\nfunction toggleEqType(id)');
const func2Start = func1End;
const func2End = content.indexOf('\nfunction cleanGov(g)');
const func3Start = func2End;
const func3End = content.indexOf('\nfunction eqEditHospital(name)');

console.log('Boundaries:', func1Start, func1End, func2Start, func2End, func3Start, func3End);

const replacement = `async function renderBloodBankEquipment() {
  const main = document.getElementById('mainContent');
  main.innerHTML = \\\`<div class="page-header"><h2><i class="fas fa-microscope"></i> أجهزة بنوك الدم</h2></div>
    <div id="eqToolbar" style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:10px;padding:10px 14px;background:var(--card-bg);border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,0.06)"></div>
    <div id="eqStats" style="display:flex;gap:10px;margin-bottom:10px;flex-wrap:wrap"></div>
    <div id="eqChips"></div>
    <div id="eqContent" class="loading" style="text-align:center;padding:40px;color:#999">جاري التحميل...</div>\\\`;
  try {
    const data = await api('GET', '/blood-bank-equipment');
    if (!data || !data.hospitals || !data.hospitals.length) {
      document.getElementById('eqContent').innerHTML = '<div class="alert alert-info">لا توجد بيانات أجهزة — قم باستيراد ملف Excel</div>';
      return;
    }
    const { types, hospitals } = data;
    types.sort((a,b) => a.id - b.id);
    const eqCounts = {};
    types.forEach(t => { eqCounts[t.id] = { ok: 0, mid: 0, bad: 0, total: 0 }; });
    hospitals.forEach(h => {
      if (!h.equipment) return;
      Object.entries(h.equipment).forEach(([tid, eq]) => {
        if (!eq.status || eq.status === 'غير كفئ' || eq.status === 'غير' || eq.status === 'غير كفء') eqCounts[tid].bad++;
        else if (eq.status === 'متوسط') eqCounts[tid].mid++;
        else eqCounts[tid].ok++;
        eqCounts[tid].total++;
      });
    });
    const allOk = Object.values(eqCounts).reduce((s, c) => s + c.ok, 0);
    const allMid = Object.values(eqCounts).reduce((s, c) => s + c.mid, 0);
    const allBad = Object.values(eqCounts).reduce((s, c) => s + c.bad, 0);
    const allTotal = Object.values(eqCounts).reduce((s, c) => s + c.total, 0);
    const statsCards = [
      { label: 'بنوك الدم', value: hospitals.length, icon: 'fa-hospital', color: '#1565c0', bg: '#e3f2fd' },
      { label: 'أجهزة كفء', value: allOk, icon: 'fa-check-circle', color: '#27ae60', bg: '#e8f5e9' },
      { label: 'أجهزة متوسط', value: allMid, icon: 'fa-chart-bar', color: '#f39c12', bg: '#fff8e1' },
      { label: 'أجهزة غير كفء', value: allBad, icon: 'fa-exclamation-triangle', color: '#e74c3c', bg: '#fde8e8' },
      { label: 'إجمالي الأجهزة', value: allTotal, icon: 'fa-microscope', color: '#5a6268', bg: '#f5f5f5' },
    ];
    document.getElementById('eqStats').innerHTML = statsCards.map(s => \\\`
      <div style="flex:1;min-width:100px;padding:8px 10px;background:\\\${s.bg};border-radius:10px;text-align:center;box-shadow:0 1px 2px rgba(0,0,0,0.05)">
        <div style="font-size:10px;color:\\\${s.color};margin-bottom:1px;font-weight:bold"><i class="fas \\\${s.icon}"></i> \\\${s.label}</div>
        <div style="font-size:22px;font-weight:bold;color:\\\${s.color}">\\\${s.value}</div>
      </div>\\\`).join('');
    const govs = [...new Set(hospitals.map(h => cleanGov(h.governorate)).filter(Boolean))].sort();
    const toolbarHtml = [
      \\\`<select id="eqGovFilter" onchange="renderEqTable()" style="padding:6px 10px;border:1px solid #d0d0d0;border-radius:6px;font-size:12px;background:#fff">
        <option value="">🌍 كل المحافظات</option>\\\${govs.map(g => \\\`<option value="\\\${g}">\\\${g}</option>\\\`).join('')}</select>\\\`,
      \\\`<select id="eqTypeFilter" onchange="renderEqTable()" style="padding:6px 10px;border:1px solid #d0d0d0;border-radius:6px;font-size:12px;background:#fff">
        <option value="">🏥 كل الأنواع</option>
        <option value="تجميعي">تجميعي</option>
        <option value="تخزيني">تخزيني</option>
      </select>\\\`,
      \\\`<select id="eqStatusFilter" onchange="renderEqTable()" style="padding:6px 10px;border:1px solid #d0d0d0;border-radius:6px;font-size:12px;background:#fff">
        <option value="">🔧 كل الحالات</option>
        <option value="good">كفء فقط</option>
        <option value="mid">متوسط فقط</option>
        <option value="bad">غير كفء فقط</option>
      </select>\\\`,
      \\\`<div style="position:relative;flex:1;min-width:150px"><i class="fas fa-search" style="position:absolute;right:8px;top:8px;color:#aaa;font-size:12px"></i>
      <input id="eqSearch" placeholder="بحث..." oninput="renderEqTable()" style="padding:6px 10px 6px 28px;border:1px solid #d0d0d0;border-radius:6px;font-size:12px;width:100%;background:#fff;box-sizing:border-box"></div>\\\`,
      \\\`<button onclick="eqAddNewType()" style="padding:6px 12px;border:none;border-radius:6px;background:#1565c0;color:#fff;cursor:pointer;font-size:12px;font-weight:bold"><i class="fas fa-plus"></i> إضافة جهاز</button>\\\`,
      \\\`<button onclick="eqExportXlsx()" style="padding:6px 12px;border:none;border-radius:6px;background:#27ae60;color:#fff;cursor:pointer;font-size:12px;font-weight:bold"><i class="fas fa-file-excel"></i> Excel</button>\\\`,
      \\\`<button onclick="eqExportPdf()" style="padding:6px 12px;border:none;border-radius:6px;background:#e74c3c;color:#fff;cursor:pointer;font-size:12px;font-weight:bold"><i class="fas fa-file-pdf"></i> PDF</button>\\\`,
    ].join(' ');
    document.getElementById('eqToolbar').innerHTML = toolbarHtml;
    let chipHtml = '<div style="margin-bottom:6px;display:flex;flex-wrap:wrap;gap:3px">';
    types.forEach(t => {
      const c = eqCounts[t.id];
      const pct = c.total ? Math.round(c.ok / c.total * 100) : 0;
      const cls = pct >= 80 ? ['#27ae60','#e8f5e9','#a5d6a7'] : pct >= 50 ? ['#f39c12','#fff8e1','#ffe082'] : ['#e74c3c','#fde8e8','#ef9a9a'];
      chipHtml += \\\`<span class="eq-type-chip" data-id="\\\${t.id}" onclick="toggleEqType(\\\${t.id})" style="cursor:pointer;padding:3px 10px;border-radius:14px;font-size:11px;background:\\\${cls[1]};color:\\\${cls[0]};border:1px solid \\\${cls[2]};font-weight:bold">
        \\\${t.name} <small>(\\\${c.ok}/\\\${c.total})</small>
      </span>\\\`;
    });
    chipHtml += '</div>';
    document.getElementById('eqChips').innerHTML = chipHtml;
    window._eqData = { types, hospitals, eqCounts, brands: data.brands || {}, typeFilter: new Set(types.map(t => t.id)) };
    renderEqTable();
  } catch (e) {
    document.getElementById('eqContent').innerHTML = '<div class="alert alert-error">' + sanitize(e.message) + '</div>';
  }
}

function toggleEqType(id) {
  const d = window._eqData;
  if (!d) return;
  if (d.typeFilter.has(id)) d.typeFilter.delete(id);
  else d.typeFilter.add(id);
  document.querySelectorAll('.eq-type-chip').forEach(el => {
    const tid = parseInt(el.dataset.id);
    el.style.opacity = d.typeFilter.has(tid) ? '1' : '0.4';
    el.style.transform = d.typeFilter.has(tid) ? 'scale(1)' : 'scale(0.95)';
  });
  renderEqTable();
}

function cleanGov(g) {
  if (!g) return '';
  return g.replace(/[\\s\\-]+/g, ' ').replace(/[\\u0640]/g, '').trim();
}

function renderEqTable() {
  const { types, hospitals, eqCounts, typeFilter } = window._eqData || {};
  if (!hospitals) return;
  const gov = document.getElementById('eqGovFilter')?.value || '';
  const hosType = document.getElementById('eqTypeFilter')?.value || '';
  const statusFilter = document.getElementById('eqStatusFilter')?.value || '';
  const q = (document.getElementById('eqSearch')?.value || '').trim().toLowerCase();
  let filtered = hospitals;
  if (gov) filtered = filtered.filter(h => cleanGov(h.governorate) === gov);
  if (hosType) filtered = filtered.filter(h => h.type === hosType);
  if (statusFilter === 'good') filtered = filtered.filter(h => h.equipment && Object.values(h.equipment).some(e => e.status === 'كفئ'));
  if (statusFilter === 'mid') filtered = filtered.filter(h => h.equipment && Object.values(h.equipment).some(e => e.status === 'متوسط'));
  if (statusFilter === 'bad') filtered = filtered.filter(h => h.equipment && Object.values(h.equipment).some(e => e.status === 'غير كفئ' || e.status === 'غير' || e.status === 'غير كفء'));
  if (q) filtered = filtered.filter(h => h.name.toLowerCase().includes(q) || cleanGov(h.governorate).toLowerCase().includes(q) || (h.type || '').toLowerCase().includes(q));
  const visibleTypes = types.filter(t => typeFilter.has(t.id));
  const colW = Math.max(80, Math.min(120, Math.floor(1200 / Math.max(visibleTypes.length, 1))));
  let html = \\\`<div style="overflow-x:auto;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.06);border:1px solid #eee">
    <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 12px;background:#fafafa;border-bottom:1px solid #eee;font-size:12px;color:#888">
      <span>📊 عرض \\\${filtered.length} من \\\${hospitals.length} بنك دم</span>
      <span onclick="eqExportXlsx()" style="cursor:pointer;color:#27ae60">⬇ تحميل Excel</span>
    </div>\\\`;
  html += '<table style="border-collapse:collapse;width:100%;font-size:12px;min-width:' + (visibleTypes.length * colW + 380) + 'px">';
  html += '<thead>';
  html += \\\`<tr style="background:linear-gradient(135deg,#1a237e,#283593);color:#fff">\\\`;
  html += \\\`<th rowspan="2" style="padding:8px 4px;border:1px solid #3949ab;text-align:center;min-width:110px">🌍 المحافظة</th>\\\`;
  html += \\\`<th rowspan="2" style="padding:8px 6px;border:1px solid #3949ab;text-align:center;min-width:170px">🏥 بنك الدم</th>\\\`;
  html += \\\`<th rowspan="2" style="padding:8px 4px;border:1px solid #3949ab;text-align:center;width:50px">📋 النوع</th>\\\`;
  html += \\\`<th rowspan="2" style="padding:8px 4px;border:1px solid #3949ab;text-align:center;width:65px">✅ الصلاحية</th>\\\`;
  visibleTypes.forEach(t => {
    const c = eqCounts[t.id];
    const pct = c.total ? Math.round(c.ok / c.total * 100) : 0;
    const hdrBg = pct >= 80 ? '#27ae60' : pct >= 50 ? '#f39c12' : '#e74c3c';
    const hdrBorder = pct >= 80 ? '#1b5e20' : pct >= 50 ? '#e65100' : '#b71c1c';
    html += \\\`<th colspan="3" style="padding:5px 2px;border:1px solid \\\${hdrBorder};text-align:center;min-width:\\\${colW}px;background:\\\${hdrBg};color:#fff;font-size:11px;line-height:1.3">
      <div>\\\${t.name}</div>
      <div style="font-size:9px;opacity:0.85;margin-top:1px">\\\${c.ok}/\\\${c.total} كفء</div>
    </th>\\\`;
  });
  html += '</tr>';
  html += \\\`<tr style="background:#303f9f;color:#cfd8dc;font-size:10px">\\\`;
  html += '<th style="display:none"></th><th style="display:none"></th><th style="display:none"></th><th style="display:none"></th>';
  visibleTypes.forEach(() => {
    html += '<th style="padding:3px 1px;border:1px solid #5c6bc0;text-align:center;font-weight:normal">عدد</th>';
    html += '<th style="padding:3px 1px;border:1px solid #5c6bc0;text-align:center;font-weight:normal">ماركة</th>';
    html += '<th style="padding:3px 1px;border:1px solid #5c6bc0;text-align:center;font-weight:normal">حالة</th>';
  });
  html += '</tr></thead><tbody>';
  let rowNum = 0;
  filtered.forEach(h => {
    const eq = h.equipment || {};
    const vals = Object.values(eq);
    const totalEq = vals.filter(v => v && (v.count != null || v.status)).length;
    const badEq = vals.filter(v => v && (v.status === 'غير كفئ' || v.status === 'غير' || v.status === 'غير كفء')).length;
    const goodEq = totalEq - badEq;
    const pct = totalEq ? Math.round(goodEq / totalEq * 100) : 0;
    const hasBad = badEq > 0;
    const rowBg = rowNum++ % 2 === 0 ? '#fff' : '#fafbff';
    html += '<tr style="border-bottom:1px solid #e8eaf6;cursor:pointer;background:' + rowBg + ';transition:background 0.15s" onclick="eqEditHospital(\\'' + esc(h.name) + '\\')" onmouseover="this.style.background=\\'#e8eaf6\\'" onmouseout="this.style.background=\\'' + rowBg + '\\'">';
    html += \\\`<td style="padding:5px 4px;border:1px solid #e8eaf6;text-align:center;font-size:11px;color:#555">\\\${cleanGov(h.governorate)}</td>\\\`;
    html += \\\`<td style="padding:5px 8px;border:1px solid #e8eaf6;text-align:right;font-weight:bold;font-size:12px">
      \\\${hasBad ? '<span style="float:left;color:#e74c3c" title="يوجد أجهزة غير كفء">⚠</span>' : ''}\\\${esc(h.name)}</td>\\\`;
    const typeLabel = h.type === 'تجميعي' ? 'تجميعي' : h.type === 'تخزيني' ? 'تخزيني' : '';
    const typeColor = h.type === 'تجميعي' ? '#1565c0' : h.type === 'تخزيني' ? '#e65100' : '#999';
    html += \\\`<td style="padding:5px;border:1px solid #e8eaf6;text-align:center;font-size:10px;color:\\\${typeColor};font-weight:bold">\\\${typeLabel}</td>\\\`;
    const pctColor = pct >= 80 ? '#27ae60' : pct >= 50 ? '#f39c12' : '#e74c3c';
    html += \\\`<td style="padding:5px;border:1px solid #e8eaf6;text-align:center"><span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:bold;color:#fff;background:\\\${pctColor}">\\\${goodEq}/\\\${totalEq}</span></td>\\\`;
    visibleTypes.forEach(t => {
      const e = eq[t.id];
      if (!e || (e.count == null && !e.status)) {
        html += '<td style="padding:3px 1px;border:1px solid #eee;text-align:center;color:#ddd;font-size:10px" colspan="3">—</td>';
      } else {
        const count = e.count;
        const brand = e.brand || '';
        const status = e.status;
        const isBad = !status || status === 'غير كفئ' || status === 'غير' || status === 'غير كفء';
        const isMid = status === 'متوسط';
        const bg = isBad ? '#fde8e8' : isMid ? '#fff8e1' : '#e8f5e9';
        const clr = isBad ? '#e74c3c' : isMid ? '#f39c12' : '#27ae60';
        const statusIcon = isBad ? '✗' : isMid ? '◐' : '✓';
        html += \\\`<td style="padding:3px 1px;border:1px solid #e8eaf6;text-align:center;background:\\\${bg};font-size:12px;font-weight:bold;color:\\\${clr}">\\\${count != null ? count : '-'}</td>\\\`;
        html += \\\`<td style="padding:3px 1px;border:1px solid #e8eaf6;text-align:center;background:\\\${bg};font-size:10px;color:#555;max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">\\\${brand || '-'}</td>\\\`;
        html += \\\`<td style="padding:3px 1px;border:1px solid #e8eaf6;text-align:center;background:\\\${bg};font-size:11px;color:\\\${clr};font-weight:bold">\\\${statusIcon} \\\${status || '-'}</td>\\\`;
      }
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  html += '<div style="margin-top:8px;display:flex;gap:12px;justify-content:center;font-size:11px;color:#888;flex-wrap:wrap">';
  html += '<span><span style="display:inline-block;width:10px;height:10px;background:#e8f5e9;border-radius:2px;vertical-align:middle;margin-left:3px;border:1px solid #a5d6a7"></span> كفء</span>';
  html += '<span><span style="display:inline-block;width:10px;height:10px;background:#fff8e1;border-radius:2px;vertical-align:middle;margin-left:3px;border:1px solid #ffe082"></span> متوسط</span>';
  html += '<span><span style="display:inline-block;width:10px;height:10px;background:#fde8e8;border-radius:2px;vertical-align:middle;margin-left:3px;border:1px solid #ef9a9a"></span> غير كفء</span>';
  html += '<span>|</span><span style="color:#999">انقر على أي مستشفى لتعديل الأجهزة</span>';
  html += '</div>';
  document.getElementById('eqContent').innerHTML = html;
}

function toggleEqType(id) {
  const d = window._eqData;
  if (!d) return;
  if (d.typeFilter.has(id)) d.typeFilter.delete(id);
  else d.typeFilter.add(id);
  document.querySelectorAll('.eq-type-chip').forEach(el => {
    const tid = parseInt(el.dataset.id);
    el.style.opacity = d.typeFilter.has(tid) ? '1' : '0.4';
    el.style.transform = d.typeFilter.has(tid) ? 'scale(1)' : 'scale(0.95)';
  });
  renderEqTable();
}

function cleanGov(g) {
  if (!g) return '';
  return g.replace(/[\\s\\-]+/g, ' ').replace(/[\\u0640]/g, '').trim();
}

function renderEqTable() {
  const { types, hospitals, eqCounts, typeFilter } = window._eqData || {};
  if (!hospitals) return;
  const gov = document.getElementById('eqGovFilter')?.value || '';
  const hosType = document.getElementById('eqTypeFilter')?.value || '';
  const statusFilter = document.getElementById('eqStatusFilter')?.value || '';
  const q = (document.getElementById('eqSearch')?.value || '').trim().toLowerCase();
  let filtered = hospitals;
  if (gov) filtered = filtered.filter(h => cleanGov(h.governorate) === gov);
  if (hosType) filtered = filtered.filter(h => h.type === hosType);
  if (statusFilter === 'good') filtered = filtered.filter(h => h.equipment && Object.values(h.equipment).some(e => e.status === 'كفئ'));
  if (statusFilter === 'mid') filtered = filtered.filter(h => h.equipment && Object.values(h.equipment).some(e => e.status === 'متوسط'));
  if (statusFilter === 'bad') filtered = filtered.filter(h => h.equipment && Object.values(h.equipment).some(e => e.status === 'غير كفئ' || e.status === 'غير' || e.status === 'غير كفء'));
  if (q) filtered = filtered.filter(h => h.name.toLowerCase().includes(q) || cleanGov(h.governorate).toLowerCase().includes(q) || (h.type || '').toLowerCase().includes(q));
  const visibleTypes = types.filter(t => typeFilter.has(t.id));
  const colW = Math.max(80, Math.min(120, Math.floor(1200 / Math.max(visibleTypes.length, 1))));
  let html = \\\`<div style="overflow-x:auto;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.06);border:1px solid #eee">
    <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 12px;background:#fafafa;border-bottom:1px solid #eee;font-size:12px;color:#888">
      <span>📊 عرض \\\${filtered.length} من \\\${hospitals.length} بنك دم</span>
      <span onclick="eqExportXlsx()" style="cursor:pointer;color:#27ae60">⬇ تحميل Excel</span>
    </div>\\\`;
  html += '<table style="border-collapse:collapse;width:100%;font-size:12px;min-width:' + (visibleTypes.length * colW + 380) + 'px">';
  html += '<thead>';
  html += \\\`<tr style="background:linear-gradient(135deg,#1a237e,#283593);color:#fff">\\\`;
  html += \\\`<th rowspan="2" style="padding:8px 4px;border:1px solid #3949ab;text-align:center;min-width:110px">🌍 المحافظة</th>\\\`;
  html += \\\`<th rowspan="2" style="padding:8px 6px;border:1px solid #3949ab;text-align:center;min-width:170px">🏥 بنك الدم</th>\\\`;
  html += \\\`<th rowspan="2" style="padding:8px 4px;border:1px solid #3949ab;text-align:center;width:50px">📋 النوع</th>\\\`;
  html += \\\`<th rowspan="2" style="padding:8px 4px;border:1px solid #3949ab;text-align:center;width:65px">✅ الصلاحية</th>\\\`;
  visibleTypes.forEach(t => {
    const c = eqCounts[t.id];
    const pct = c.total ? Math.round(c.ok / c.total * 100) : 0;
    const hdrBg = pct >= 80 ? '#27ae60' : pct >= 50 ? '#f39c12' : '#e74c3c';
    const hdrBorder = pct >= 80 ? '#1b5e20' : pct >= 50 ? '#e65100' : '#b71c1c';
    html += \\\`<th colspan="3" style="padding:5px 2px;border:1px solid \\\${hdrBorder};text-align:center;min-width:\\\${colW}px;background:\\\${hdrBg};color:#fff;font-size:11px;line-height:1.3">
      <div>\\\${t.name}</div>
      <div style="font-size:9px;opacity:0.85;margin-top:1px">\\\${c.ok}/\\\${c.total} كفء</div>
    </th>\\\`;
  });
  html += '</tr>';
  html += \\\`<tr style="background:#303f9f;color:#cfd8dc;font-size:10px">\\\`;
  html += '<th style="display:none"></th><th style="display:none"></th><th style="display:none"></th><th style="display:none"></th>';
  visibleTypes.forEach(() => {
    html += '<th style="padding:3px 1px;border:1px solid #5c6bc0;text-align:center;font-weight:normal">عدد</th>';
    html += '<th style="padding:3px 1px;border:1px solid #5c6bc0;text-align:center;font-weight:normal">ماركة</th>';
    html += '<th style="padding:3px 1px;border:1px solid #5c6bc0;text-align:center;font-weight:normal">حالة</th>';
  });
  html += '</tr></thead><tbody>';
  let rowNum = 0;
  filtered.forEach(h => {
    const eq = h.equipment || {};
    const vals = Object.values(eq);
    const totalEq = vals.filter(v => v && (v.count != null || v.status)).length;
    const badEq = vals.filter(v => v && (v.status === 'غير كفئ' || v.status === 'غير' || v.status === 'غير كفء')).length;
    const goodEq = totalEq - badEq;
    const pct = totalEq ? Math.round(goodEq / totalEq * 100) : 0;
    const hasBad = badEq > 0;
    const rowBg = rowNum++ % 2 === 0 ? '#fff' : '#fafbff';
    html += '<tr style="border-bottom:1px solid #e8eaf6;cursor:pointer;background:' + rowBg + ';transition:background 0.15s" onclick="eqEditHospital(\\'' + esc(h.name) + '\\')" onmouseover="this.style.background=\\'#e8eaf6\\'" onmouseout="this.style.background=\\'' + rowBg + '\\'">';
    html += \\\`<td style="padding:5px 4px;border:1px solid #e8eaf6;text-align:center;font-size:11px;color:#555">\\\${cleanGov(h.governorate)}</td>\\\`;
    html += \\\`<td style="padding:5px 8px;border:1px solid #e8eaf6;text-align:right;font-weight:bold;font-size:12px">
      \\\${hasBad ? '<span style="float:left;color:#e74c3c" title="يوجد أجهزة غير كفء">⚠</span>' : ''}\\\${esc(h.name)}</td>\\\`;
    const typeLabel = h.type === 'تجميعي' ? 'تجميعي' : h.type === 'تخزيني' ? 'تخزيني' : '';
    const typeColor = h.type === 'تجميعي' ? '#1565c0' : h.type === 'تخزيني' ? '#e65100' : '#999';
    html += \\\`<td style="padding:5px;border:1px solid #e8eaf6;text-align:center;font-size:10px;color:\\\${typeColor};font-weight:bold">\\\${typeLabel}</td>\\\`;
    const pctColor = pct >= 80 ? '#27ae60' : pct >= 50 ? '#f39c12' : '#e74c3c';
    html += \\\`<td style="padding:5px;border:1px solid #e8eaf6;text-align:center"><span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:bold;color:#fff;background:\\\${pctColor}">\\\${goodEq}/\\\${totalEq}</span></td>\\\`;
    visibleTypes.forEach(t => {
      const e = eq[t.id];
      if (!e || (e.count == null && !e.status)) {
        html += '<td style="padding:3px 1px;border:1px solid #eee;text-align:center;color:#ddd;font-size:10px" colspan="3">—</td>';
      } else {
        const count = e.count;
        const brand = e.brand || '';
        const status = e.status;
        const isBad = !status || status === 'غير كفئ' || status === 'غير' || status === 'غير كفء';
        const isMid = status === 'متوسط';
        const bg = isBad ? '#fde8e8' : isMid ? '#fff8e1' : '#e8f5e9';
        const clr = isBad ? '#e74c3c' : isMid ? '#f39c12' : '#27ae60';
        const statusIcon = isBad ? '✗' : isMid ? '◐' : '✓';
        html += \\\`<td style="padding:3px 1px;border:1px solid #e8eaf6;text-align:center;background:\\\${bg};font-size:12px;font-weight:bold;color:\\\${clr}">\\\${count != null ? count : '-'}</td>\\\`;
        html += \\\`<td style="padding:3px 1px;border:1px solid #e8eaf6;text-align:center;background:\\\${bg};font-size:10px;color:#555;max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">\\\${brand || '-'}</td>\\\`;
        html += \\\`<td style="padding:3px 1px;border:1px solid #e8eaf6;text-align:center;background:\\\${bg};font-size:11px;color:\\\${clr};font-weight:bold">\\\${statusIcon} \\\${status || '-'}</td>\\\`;
      }
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  html += '<div style="margin-top:8px;display:flex;gap:12px;justify-content:center;font-size:11px;color:#888;flex-wrap:wrap">';
  html += '<span><span style="display:inline-block;width:10px;height:10px;background:#e8f5e9;border-radius:2px;vertical-align:middle;margin-left:3px;border:1px solid #a5d6a7"></span> كفء</span>';
  html += '<span><span style="display:inline-block;width:10px;height:10px;background:#fff8e1;border-radius:2px;vertical-align:middle;margin-left:3px;border:1px solid #ffe082"></span> متوسط</span>';
  html += '<span><span style="display:inline-block;width:10px;height:10px;background:#fde8e8;border-radius:2px;vertical-align:middle;margin-left:3px;border:1px solid #ef9a9a"></span> غير كفء</span>';
  html += '<span>|</span><span style="color:#999">انقر على أي مستشفى لتعديل الأجهزة</span>';
  html += '</div>';
  document.getElementById('eqContent').innerHTML = html;
}
`;

// Replace func1+func2+func3 with the new combined content
const newContent = content.substring(0, func1Start) + replacement + content.substring(func3End);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Done! Replaced renderBloodBankEquipment, toggleEqType, cleanGov, renderEqTable');
