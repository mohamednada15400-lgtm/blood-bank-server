const ITEM_COLORS = {
  daily_stock: '#dc3545', daily_total: '#c0392b', daily_statement: '#e91e63', daily_branch: '#e67e22',
  monthly_indicators: '#0d7377', monthly_consumption: '#e91e63', monthly_big: '#dc3545', monthly_small: '#795548',
  archive: '#5d4037', strategic_stock: '#1565c0', employees: '#5d4037', readiness: '#7b1fa2', equipment: '#e65100',
  users: '#00695c', role_perms: '#4a148c', hospitals: '#c62828', governorates: '#37474f',
  sync: '#1a73e8', emp_accounts: '#28a745', time_config: '#f39c12',
  about: '#6c757d'
};

const MENU_CATS = [
  { key: 'daily', label: 'يومي', icon: 'fa-calendar-day', color: ['#dc3545','#e74c3c'],
    items: [
      { key: 'daily_stock', label: 'STOCK Mang', icon: 'fa-vial', page: 'renderDailyStock' },
      { key: 'daily_total', label: 'TOTAL STOCK Mang', icon: 'fa-cubes', page: 'renderTotal' },
      { key: 'daily_statement', label: 'البيان اليومي', icon: 'fa-file-waveform', page: 'renderDailyStatement' },
      { key: 'daily_branch', label: 'بيان الفرع', icon: 'fa-code-branch', page: 'renderBranchStatement' }
    ]
  },
  { key: 'monthly', label: 'شهري', icon: 'fa-calendar-alt', color: ['#0d7377','#17a2b8'],
    items: [
      { key: 'monthly_indicators', label: 'مؤشرات الأداء', icon: 'fa-gauge-high',
        subitems: [
          { key: 'monthly_big', label: 'مؤشرات تجميعيه', icon: 'fa-chart-simple', page: 'renderBigIndicators' },
          { key: 'monthly_small', label: 'مؤشرات تخزينيه', icon: 'fa-boxes-stacked', page: 'renderSmallIndicators' }
        ]
      },
      { key: 'monthly_consumption', label: 'منصرف فصائل الدم', icon: 'fa-hand-holding-droplet', page: 'renderBloodConsumption' }
    ]
  },
  { key: 'archive', label: 'أرشيف', icon: 'fa-folder-open', color: ['#5d4037','#8d6e63'], page: 'renderArchive',
    items: [
      { key: 'archive_consumption', label: 'منصرف الفصائل', icon: 'fa-box-archive', page: 'showArchiveConsumption' },
      { key: 'archive_indicators', label: 'مؤشرات الأداء', icon: 'fa-clock-rotate', page: 'showArchiveIndicators' }
    ]
  },
  { key: 'other', label: 'أخرى', icon: 'fa-ellipsis-h', color: ['#546e7a','#78909c'],
    items: [
      { key: 'employees', label: 'بيان العاملين', icon: 'fa-user-tie', page: 'renderEmployeeStatement' },
      { key: 'readiness', label: 'شيت الجاهزية', icon: 'fa-clipboard-check', page: 'renderReadinessSheet' },
      { key: 'equipment', label: 'الأجهزة', icon: 'fa-tools', page: 'renderEquipment' },
      { key: 'strategic_stock', label: 'الرصيد الاستراتيجي', icon: 'fa-shield-halved', page: 'renderStrategicStock' }
    ]
  },
  { key: 'admin', label: 'الإدارة', icon: 'fa-gear', color: ['#1565c0','#1e88e5'],
    items: [
      { key: 'users', label: 'المستخدمين', icon: 'fa-users', page: 'renderUsers' },
      { key: 'role_perms', label: 'الصلاحيات', icon: 'fa-lock', page: 'renderRolePerms' },
      { key: 'hospitals', label: 'المستشفيات', icon: 'fa-hospital', page: 'renderHospitals' },
      { key: 'governorates', label: 'المحافظات', icon: 'fa-map', page: 'renderGovernorates' },
      { key: 'sync', label: 'المزامنة مع Drive', icon: 'fa-cloud-upload-alt', page: 'showSyncDialog' },
      { key: 'emp_accounts', label: 'حسابات الموظفين', icon: 'fa-user-plus', page: 'renderEmployeeAccounts' },
      { key: 'time_config', label: 'ضبط التوقيت', icon: 'fa-clock', page: 'renderTimeConfig' },
      { key: 'about', label: 'حول النظام', icon: 'fa-info-circle', page: 'showAbout' }
    ]
  }
];

let _navStack = [];

function pushNav(fn) { _navStack.push(fn); }

function goBack() {
  const fn = _navStack.pop();
  if (fn) fn();
  else showMenu();
}
function refreshCurrentPage() {
  const fn = _navStack.length ? _navStack[_navStack.length - 1] : null;
  if (fn) fn();
  else showMenu();
}

let _prevPageName = null;
function navigateTo(pageName, catKey, subKey) {
  if (pageName !== 'renderTimeConfig') _prevPageName = pageName;
  const cat = MENU_CATS.find(c => c.key === catKey);
  if (cat && cat.page) {
    pushNav(showMenu);
  } else if (subKey) {
    pushNav(() => showSubMenu(catKey, subKey));
  } else {
    pushNav(() => showSubMenu(catKey));
  }
  window[pageName]();
}

function showEmptyState(container, icon, title, desc) {
  if (typeof container === 'string') container = document.getElementById(container);
  if (!container) return;
  container.innerHTML = `<div class="empty-state"><div class="empty-state-icon"><i class="fas ${icon}"></i></div><div class="empty-state-title">${esc(title)}</div><div class="empty-state-desc">${esc(desc || '')}</div></div>`;
}

function showPageLoading(container, msg) {
  if (typeof container === 'string') container = document.getElementById(container);
  if (!container) return;
  container.innerHTML = `<div class="page-loading"><i class="fas fa-spinner fa-pulse"></i><div>${esc(msg || 'جاري التحميل...')}</div></div>`;
}

function showToast(msg, type) {
  let container = document.getElementById('toastContainer');
  if (!container) { container = document.createElement('div'); container.id = 'toastContainer'; document.body.appendChild(container); }
  const el = document.createElement('div');
  el.className = 'toast-msg';
  if (type === 'success' || type === 'error' || type === 'warning' || type === 'info') el.classList.add('toast-' + type);
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  el.textContent = (icons[type] || '') + ' ' + msg;
  container.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, 3000);
}

function grad(arr) { return `linear-gradient(135deg,${arr[0]},${arr[1]})`; }

function showMenu() { _navStack = [];
  const m = document.getElementById('mainContent');
  const menuHtml = '<div id="alertArea" style="overflow-x:auto;overflow-y:hidden;white-space:nowrap;height:26px;line-height:26px;margin-bottom:4px;scrollbar-width:thin"></div><div class="main-icons-grid">' + MENU_CATS.map(c => {
    const bg = Array.isArray(c.color) ? grad(c.color) : c.color;
    const itemsTip = (c.items || []).filter(i => hasPerm(i.key, 'view'));
    const catHasView = (c.page ? hasPerm(c.key, 'view') : false) || itemsTip.length > 0;
    if (!catHasView) return '';
    const tipContent = itemsTip.length ? itemsTip.map(i => `<span class="tip-item"><i class="fas ${i.icon}"></i> ${i.label}</span>`).join('') : `<span class="tip-item">${c.label}</span>`;
    return `<div class="main-icon-card" data-click="${c.page ? 'navigateTo' : 'showSubMenu'}" data-args="${c.page ? c.page+','+c.key : c.key}"><div class="main-icon-circle" style="background:${bg}"><i class="fas ${c.icon}"></i></div><div class="main-icon-label">${c.label}</div><div class="main-icon-tip">${tipContent}</div></div>`;
  }).join('') + '</div>';
  m.innerHTML = menuHtml;
  checkAlerts();
}

async function checkAlerts() {
  const el = document.getElementById('alertArea');
  if (!el) return;
  try {
    const reports = await api('GET', '/daily-reports');
    const consumption = await api('GET', '/monthly-consumption');
    const archiveItems = await api('GET', '/archive');
    const hospitals = await api('GET', '/hospitals');
    const me = (await api('GET', '/me')).user;
    const now = getCairoDate();
    const today = String(now.getUTCFullYear()).padStart(4,'0')+'-'+String(now.getUTCMonth()+1).padStart(2,'0')+'-'+String(now.getUTCDate()).padStart(2,'0');
    const curMonth = now.getUTCMonth() + 1;
    const curYear = now.getUTCFullYear();
    let prevMonth = curMonth - 1;
    let prevYear = curYear;
    if (prevMonth === 0) { prevMonth = 12; prevYear--; }
    const months = ['','يناير','فبراير','مارس','ابريل','مايو','يونيو','يوليو','اغسطس','سبتمبر','اكتوبر','نوفمبر','ديسمبر'];
    let alerts = [];
    let myHospitals = hospitals;
    if (me.role === 'hospital') myHospitals = hospitals.filter(h => h.id === me.hospitalId);
    else if (me.role === 'branch_supervisor') myHospitals = hospitals.filter(h => h.governorate === me.governorate);
    const todayIds = reports.filter(r => r.date === today).map(r => r.hospital_id);
    const missStock = myHospitals.filter(h => !todayIds.includes(h.id));
    if (missStock.length > 0) {
      alerts.push({ icon: 'fa-chart-bar', color: '#e74c3c', title: 'لم يتم تحديث STOCK Mang', detail: missStock.slice(0,5).map(h => h.name).join('، ') + (missStock.length > 5 ? ' +' + (missStock.length - 5) : ''), all: missStock.map(h => h.name) });
    }
    const prevConsumed = consumption.filter(r => r.year === prevYear && r.month === prevMonth).map(r => r.hospital_id);
    archiveItems.filter(a => a.type === 'منصرف فصائل الدم').forEach(a => {
      const recs = tryParse(a.data) || [];
      recs.filter(r => r.year === prevYear && r.month === prevMonth).forEach(r => {
        if (!prevConsumed.includes(r.hospital_id)) prevConsumed.push(r.hospital_id);
      });
    });
    const missCons = myHospitals.filter(h => !prevConsumed.includes(h.id));
    if (missCons.length > 0) {
      alerts.push({ icon: 'fa-droplet', color: '#e91e63', title: 'لم يتم إدخال منصرف فصائل ' + months[prevMonth] + ' ' + prevYear, detail: missCons.slice(0,5).map(h => h.name).join('، ') + (missCons.length > 5 ? ' +' + (missCons.length - 5) : ''), all: missCons.map(h => h.name) });
    }
    const bigInd = await api('GET', '/monthly-big-indicators');
    const smallInd = await api('GET', '/monthly-small-indicators');
    const prevBig = bigInd.filter(r => r.year === prevYear && r.month === prevMonth).map(r => r.hospital_id);
    archiveItems.filter(a => a.type === 'مؤشرات تجميعيه').forEach(a => {
      (tryParse(a.data) || []).filter(r => r.year === prevYear && r.month === prevMonth).forEach(r => { if (!prevBig.includes(r.hospital_id)) prevBig.push(r.hospital_id); });
    });
    const prevSmall = smallInd.filter(r => r.year === prevYear && r.month === prevMonth).map(r => r.hospital_id);
    archiveItems.filter(a => a.type === 'مؤشرات تخزينيه').forEach(a => {
      (tryParse(a.data) || []).filter(r => r.year === prevYear && r.month === prevMonth).forEach(r => { if (!prevSmall.includes(r.hospital_id)) prevSmall.push(r.hospital_id); });
    });
    const missBig = myHospitals.filter(h => h.type === 'تجميعي' && !prevBig.includes(h.id));
    if (missBig.length > 0) {
      alerts.push({ icon: 'fa-chart-line', color: '#3f51b5', title: 'لم يتم إدخال مؤشرات تجميعي ' + months[prevMonth] + ' ' + prevYear, detail: missBig.slice(0,5).map(h => h.name).join('، ') + (missBig.length > 5 ? ' +' + (missBig.length - 5) : ''), all: missBig.map(h => h.name) });
    }
    const missSmall = myHospitals.filter(h => h.type === 'تخزيني' && !prevSmall.includes(h.id));
    if (missSmall.length > 0) {
      alerts.push({ icon: 'fa-chart-simple', color: '#17a2b8', title: 'لم يتم إدخال مؤشرات تخزيني ' + months[prevMonth] + ' ' + prevYear, detail: missSmall.slice(0,5).map(h => h.name).join('، ') + (missSmall.length > 5 ? ' +' + (missSmall.length - 5) : ''), all: missSmall.map(h => h.name) });
    }
    try {
      const empRes = await api('GET', '/employee-statements');
      const curMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      const hasData = (empRes.rows||[]).length > 0;
      if (!hasData) {
        alerts.push({ icon: 'fa-users', color: '#dc3545', title: 'بيان العاملين: لم يتم إدخال بيانات أي موظف بعد', detail: 'يرجى الدخول إلى بيان العاملين وإضافة البيانات', all: ['بيان العاملين فارغ — يجب إدخال بيانات الموظفين'] });
      } else {
        const overdueEmp = (empRes.hospitalStatus||[]).filter(h => h.employeeCount > 0 && (!h.lastUpdate || new Date(h.lastUpdate) < curMonthStart));
        if (overdueEmp.length > 0) {
          alerts.push({ icon: 'fa-users', color: '#dc3545', title: 'بيان العاملين: ' + overdueEmp.length + ' بنك لم يحدث هذا الشهر', detail: overdueEmp.slice(0,5).map(h => h.name).join('، ') + (overdueEmp.length > 5 ? ' +' + (overdueEmp.length - 5) : ''), all: overdueEmp.map(h => h.name) });
        }
        const nowCD = getCairoDate(); const curMonthCode = nowCD.getUTCFullYear() * 100 + nowCD.getUTCMonth() + 1;
        const unreviewed = (empRes.rows||[]).filter(r => !r.reviewed || r.review_month != curMonthCode);
        if (unreviewed.length > 0) {
          const byHosp = {};
          unreviewed.forEach(r => { const k = r.hospital_name||'غير معروف'; if (!byHosp[k]) byHosp[k] = []; byHosp[k].push(r); });
          const hospKeys = Object.keys(byHosp);
          alerts.push({ icon: 'fa-check-double', color: '#e65100', title: 'بيان العاملين: ' + unreviewed.length + ' موظف لم يُراجع في ' + hospKeys.length + ' بنك', detail: hospKeys.slice(0,5).map(h => h + ' (' + byHosp[h].length + ')').join('، ') + (hospKeys.length > 5 ? ' +' + (hospKeys.length - 5) : ''), all: hospKeys.map(h => h + ': ' + byHosp[h].length + ' موظف') });
        }
      }
    } catch (e) { /* ignore */ }
    try {
      const eqRes = await api('GET', '/equipment');
      const eqHospitals = (eqRes.hospitals||[]);
      if (eqHospitals.length === 0) {
        alerts.push({ icon: 'fa-microscope', color: '#8e44ad', title: 'الأجهزة: لم يتم إدخال بيانات أي مستشفى بعد', detail: 'يرجى الدخول إلى الأجهزة وإضافة البيانات', all: ['بيانات الأجهزة فارغة — يجب إدخال بيانات الأجهزة'] });
      } else {
        const curMonthCode = curMonthCairo();
        const unreviewedEq = eqHospitals.filter(h => !h.reviewed || h.review_month != curMonthCode);
        if (unreviewedEq.length > 0) {
          alerts.push({ icon: 'fa-microscope', color: '#8e44ad', title: 'الأجهزة: ' + unreviewedEq.length + ' مستشفى لم يُراجع أجهزته هذا الشهر', detail: unreviewedEq.slice(0,5).map(h => h.name).join('، ') + (unreviewedEq.length > 5 ? ' +' + (unreviewedEq.length - 5) : ''), all: unreviewedEq.map(h => h.name) });
        }
      }
    } catch (e) { /* ignore */ }
    try {
      const rdnNotifs = await api('GET', '/readiness-notifications');
      rdnNotifs.forEach(n => {
        alerts.push({ icon: 'fa-clipboard-check', color: '#9c27b0', title: n.message, detail: n._missingHospitals ? n._missingHospitals.slice(0,5).join('، ') : '', all: n._missingHospitals || [], _rdnNotifId: n.id, _rdnNotifDismiss: true });
      });
    } catch (e) { /* ignore */ }
    window._alertsData = alerts;
    const sevMap = {
      critical: { bg: '#ffebee', border: '#e53935', dot: '#e53935', label: 'خطير' },
      warning:  { bg: '#fff8e1', border: '#ff8f00', dot: '#ff8f00', label: 'تحذيري' },
      info:     { bg: '#e3f2fd', border: '#1e88e5', dot: '#1e88e5', label: 'تنبيهي' }
    };
    const getSev = a => {
      const t = a.title || '';
      if (t.includes('STOCK') || t.includes('منصرف فصائل') || t.includes('لم يتم إدخال بيانات')) return sevMap.critical;
      if (t.includes('مؤشرات') || t.includes('لم يُراجع') || t.includes('لم يراجع')) return sevMap.warning;
      return sevMap.info;
    };
    const al = alerts.map((a, i) => {
      const sev = getSev(a);
      const count = a.all ? a.all.length : 0;
      return `<span data-click="showAlertList" data-args="${i}" data-mouseover="hoverOn" data-mouseout="hoverOff" data-hover-bg="${sev.bg}" data-hover-off="${sev.bg}" style="cursor:pointer;display:inline-flex;align-items:center;gap:4px;background:${sev.bg};border:1px solid ${sev.border}22;border-right:3px solid ${sev.border};border-radius:6px;padding:4px 8px;margin-left:4px;font-size:10px;white-space:nowrap;transition:0.15s;box-shadow:0 1px 2px #00000008">
        <span style="width:8px;height:8px;border-radius:50%;background:${sev.dot};display:inline-block;flex-shrink:0"></span>
        <i class="fas ${a.icon}" style="color:${sev.dot};font-size:9px;flex-shrink:0"></i>
        <span style="font-weight:600;color:#333">${a.title}</span>
        ${count > 0 ? `<span style="background:${sev.dot};color:#fff;border-radius:10px;padding:0 5px;font-size:9px;font-weight:700;line-height:16px">${count}</span>` : ''}
        ${a._rdnNotifDismiss ? `<i class="fas fa-times" data-click="rdnDismissNotifAlert" data-args="${i}" style="color:#999;font-size:8px;padding:2px;cursor:pointer"></i>` : ''}
      </span>`;
    }).join('');
    el.innerHTML = alerts.length === 0
      ? '<span style="background:#e8f5e9;border:1px solid #a5d6a7;border-radius:6px;padding:4px 12px;font-size:10px;color:#2e7d32;display:inline-flex;align-items:center;gap:4px;box-shadow:0 1px 3px #0000000a"><i class="fas fa-check-circle" style="font-size:11px;color:#43a047"></i> كل البيانات محدثة ✓</span>'
      : al;
  } catch (e) { /* ignore */ }
}

function showAlertList(idx) {
  const a = window._alertsData && window._alertsData[idx];
  if (!a || !a.all || a.all.length === 0) return;
  const sevMap = {
    critical: { dot: '#e53935', bg: '#ffebee' },
    warning:  { dot: '#ff8f00', bg: '#fff8e1' },
    info:     { dot: '#1e88e5', bg: '#e3f2fd' }
  };
  const getSev = t => {
    if (t.includes('STOCK') || t.includes('منصرف فصائل') || t.includes('لم يتم إدخال بيانات')) return sevMap.critical;
    if (t.includes('مؤشرات') || t.includes('لم يُراجع') || t.includes('لم يراجع')) return sevMap.warning;
    return sevMap.info;
  };
  const sev = getSev(a.title);
  openModal(`<span style="display:flex;align-items:center;gap:6px"><span style="width:10px;height:10px;border-radius:50%;background:${sev.dot};display:inline-block"></span> ${a.title}</span>`,
    `<div style="max-height:400px;overflow-y:auto">
      <div style="font-size:11px;color:#666;margin-bottom:8px">إجمالي: <strong>${a.all.length}</strong></div>
      <ol style="direction:rtl;text-align:right;font-size:13px;padding-right:20px;margin:0">${a.all.map(n => `<li style="padding:3px 0;border-bottom:1px solid #f0f0f0">${n}</li>`).join('')}</ol></div>`,
    `<button class="btn btn-secondary" data-click="closeModal">إغلاق</button>`);
}

function showSubMenu(catKey, subKey) {
  const cat = MENU_CATS.find(c => c.key === catKey);
  if (!cat) return;
  const isNested = !!subKey;
  let items;
  if (isNested) {
    const parent = cat.items.find(i => i.key === subKey);
    if (!parent || !parent.subitems) return;
    items = parent.subitems;
  } else {
    items = cat.items;
  }
  if (isNested) pushNav(() => showSubMenu(catKey));
  else pushNav(showMenu);
  let html = `<div class="page-actions"><button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> رجوع</button><button class="btn-refresh" data-click="refreshCurrentPage"><i class="fas fa-sync-alt"></i> تحديث</button></div>
    <div class="sub-icons-grid">`;
  items.forEach(item => {
    if (item.subitems) {
      if (!item.subitems.some(si => hasPerm(si.key, 'view'))) return;
      let ic = ITEM_COLORS[item.key];
      if (!ic) ic = Array.isArray(cat.color) ? grad(cat.color) : cat.color;
      else ic = Array.isArray(ic) ? grad(ic) : ic;
      const subTips = item.subitems.filter(si => hasPerm(si.key, 'view')).map(si => si.label).join(' · ');
      html += `<div class="sub-icon-card" title="${sanitize(item.label)} — ${sanitize(subTips)}" data-click="showSubMenu" data-args="'${catKey}','${item.key}'">
        <div class="sub-icon-circle" style="background:${ic}"><i class="fas ${item.icon}"></i></div>
        <div class="sub-icon-label">${item.label}</div>
      </div>`;
    } else if (hasPerm(item.key, 'view') || ((item.key === 'sync' || item.key === 'about') && window._user && window._user.role === 'admin')) {
      let ic = ITEM_COLORS[item.key];
      if (!ic) ic = Array.isArray(cat.color) ? grad(cat.color) : cat.color;
      else ic = Array.isArray(ic) ? grad(ic) : ic;
      html += `<div class="sub-icon-card" title="${sanitize(item.label)}" data-click="navigateTo" data-args="'${item.page}','${catKey}'${isNested ? ",'"+subKey+"'" : ''}">
        <div class="sub-icon-circle" style="background:${ic}"><i class="fas ${item.icon}"></i></div>
        <div class="sub-icon-label">${item.label}</div>
      </div>`;
    }
  });
  html += '</div>';
  document.getElementById('mainContent').innerHTML = html;
}

document.getElementById('loginUser').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
document.getElementById('loginPass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
