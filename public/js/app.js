const API_BASE = '/api';

function esc(str) {
  if (str == null) return '';
  return String(str).replace(/[&<>"']/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    if (m === '"') return '&quot;';
    if (m === "'") return '&#x27;';
    return m;
  });
}

function slink(url) {
  return url ? url.replace(/[<>"'()]/g, '') : '';
}

async function api(method, url, data) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (data) opts.body = JSON.stringify(data);
  const res = await fetch(API_BASE + url, opts);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'خطأ في الطلب');
  return json;
}

let _dpurify;
function sanitize(str) {
  if (!str) return '';
  if (typeof DOMPurify !== 'undefined') {
    if (!_dpurify) _dpurify = DOMPurify;
    return _dpurify.sanitize(str);
  }
  return esc(str);
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', isDark ? '1' : '0');
  document.getElementById('darkModeBtn').innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}
function applyDarkMode() {
  const isDark = localStorage.getItem('darkMode') === '1';
  if (isDark) { document.body.classList.add('dark-mode'); }
  const btn = document.getElementById('darkModeBtn');
  if (btn) btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}
document.addEventListener('DOMContentLoaded', applyDarkMode);

const PERM_PAGES = [
  { key: 'daily_stock', label: 'المخزون اليومي', cat: 'daily', icon: 'fa-chart-bar' },
  { key: 'daily_total', label: 'إجمالي المخزون', cat: 'daily', icon: 'fa-chart-pie' },
  { key: 'daily_statement', label: 'البيان اليومي', cat: 'daily', icon: 'fa-file-lines' },
  { key: 'daily_branch', label: 'بيان الفرع', cat: 'daily', icon: 'fa-store' },
  { key: 'monthly_indicators', label: 'مؤشرات شهرية', cat: 'monthly', icon: 'fa-chart-line' },
  { key: 'monthly_consumption', label: 'منصرف فصائل الدم', cat: 'monthly', icon: 'fa-droplet' },
  { key: 'monthly_big', label: 'مؤشرات تجميعيه', cat: 'monthly', icon: 'fa-chart-simple' },
  { key: 'monthly_small', label: 'مؤشرات تخزينيه', cat: 'monthly', icon: 'fa-chart-bar' },
  { key: 'employees', label: 'بيان العاملين', cat: 'other', icon: 'fa-users' },
  { key: 'readiness', label: 'شيت الجاهزيه', cat: 'other', icon: 'fa-clipboard-check' },
  { key: 'equipment', label: 'أجهزة بنك الدم', cat: 'other', icon: 'fa-microscope' },
  { key: 'archive', label: 'أرشيف', cat: 'other', icon: 'fa-folder-open' },
  { key: 'strategic_stock', label: 'الرصيد الاستراتيجي', cat: 'other', icon: 'fa-shield' },
  { key: 'inventory', label: 'المخزون', cat: 'admin', icon: 'fa-boxes-stacked' },
  { key: 'users', label: 'المستخدمين', cat: 'admin', icon: 'fa-users-gear' },
  { key: 'role_perms', label: 'صلاحيات الأدوار', cat: 'admin', icon: 'fa-shield-check' },
  { key: 'hospitals', label: 'المستشفيات', cat: 'admin', icon: 'fa-hospital' },
  { key: 'governorates', label: 'المحافظات', cat: 'admin', icon: 'fa-location-dot' },
  { key: 'supervisor_data', label: 'بيانات المشرفين', cat: 'admin', icon: 'fa-address-card' }
];

const PERM_ACTIONS = [
  { key: 'v', label: 'عرض', cls: 'active-view', color: '#17a2b8' },
  { key: 'a', label: 'إضافة', cls: 'active-add', color: '#28a745' },
  { key: 'e', label: 'تعديل', cls: 'active-edit', color: '#ffc107' },
  { key: 'd', label: 'حذف', cls: 'active-delete', color: '#dc3545' },
  { key: 'x', label: 'تصدير', cls: 'active-export', color: '#6f42c1' }
];

const PERM_CATS = [
  { key: 'daily', label: 'يومي', icon: 'fa-sun', color: '#dc3545' },
  { key: 'monthly', label: 'شهري', icon: 'fa-moon', color: '#17a2b8' },
  { key: 'other', label: 'أخرى', icon: 'fa-ellipsis-h', color: '#6c757d' },
  { key: 'admin', label: 'الإدارة', icon: 'fa-lock', color: '#28a745' }
];

function hasPerm(section, action) {
  const p = window._user?.permissions;
  if (!p) return false;
  const s = p[section];
  if (!s) return false;
  if (action === 'view') return s.v === 1;
  if (action === 'add') return s.a === 1;
  if (action === 'edit') return s.e === 1;
  if (action === 'delete') return s.d === 1;
  if (action === 'export') return s.x === 1;
  return false;
}

function openModal(title, body, footer) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = body || '';
  document.getElementById('modalFooter').innerHTML = footer || '';
  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

async function doLogin() {
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value.trim();
  if (!username || !password) {
    document.getElementById('loginError').textContent = 'يرجى إدخال اسم المستخدم وكلمة المرور';
    return;
  }
  const btn = document.getElementById('loginBtn');
  const original = btn.textContent;
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الدخول...';
  try {
    const res = await api('POST', '/login', { username, password });
    window._user = res.user;
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('appPage').style.display = '';
    const u = window._user;
    document.getElementById('userBadge').textContent = u.name + ' (' + u.role + ')';
    const now = new Date();
    document.getElementById('dateDisplay').textContent = now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    applyDarkMode(); showMenu();
  } catch (e) {
    document.getElementById('loginError').textContent = e.message || 'اسم المستخدم أو كلمة المرور خطأ';
  } finally {
    btn.disabled = false; btn.textContent = original;
  }
}

function doLogout() {
  api('POST', '/logout').catch(() => {});
  window._user = null;
  document.getElementById('appPage').style.display = 'none';
  document.getElementById('loginPage').style.display = '';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginError').textContent = '';
}

const ITEM_COLORS = {
  daily_stock: '#e74c3c', daily_total: '#c0392b', daily_statement: '#e91e63', daily_branch: '#f39c12',
  monthly_storage: '#2196f3', monthly_aggregate: '#00bcd4', monthly_indicators: '#3f51b5',   monthly_consumption: '#e91e63', monthly_big: '#dc3545', monthly_small: '#17a2b8',
  consumption: '#ff9800', archive: '#795548', strategic_stock: '#2e7d32', employees: '#795548', readiness: '#1565c0',
  inventory: '#4caf50', users: '#009688', role_perms: '#673ab7', hospitals: '#f44336', governorates: '#9e9e9e'
};

const MENU_CATS = [
  { key: 'daily', label: 'يومي', icon: 'fa-sun', color: '#dc3545',
    items: [
      { key: 'daily_stock', label: 'STOCK Mang', icon: 'fa-chart-bar', page: 'renderDailyStock' },
      { key: 'daily_total', label: 'total STOCK Mang', icon: 'fa-chart-pie', page: 'renderTotal' },
      { key: 'daily_statement', label: 'البيان اليومي', icon: 'fa-file-lines', page: 'renderDailyStatement' },
      { key: 'daily_branch', label: 'بيان الفرع', icon: 'fa-store', page: 'renderBranchStatement' }
    ]
  },
  { key: 'monthly', label: 'شهري', icon: 'fa-moon', color: '#17a2b8',
    items: [
      { key: 'monthly_indicators', label: 'مؤشرات الأداء', icon: 'fa-chart-line',
        subitems: [
          { key: 'monthly_big', label: 'مؤشرات تجميعيه', icon: 'fa-chart-simple', page: 'renderBigIndicators' },
          { key: 'monthly_small', label: 'مؤشرات تخزينيه', icon: 'fa-chart-bar', page: 'renderSmallIndicators' }
        ]
      },
      { key: 'monthly_consumption', label: 'منصرف فصائل الدم', icon: 'fa-droplet', page: 'renderBloodConsumption' }
    ]
  },
  { key: 'archive', label: 'أرشيف', icon: 'fa-folder-open', color: '#795548', page: 'renderArchive',
    items: [
      { key: 'archive_consumption', label: 'منصرف الفصائل', icon: 'fa-droplet', page: 'showArchiveConsumption' },
      { key: 'archive_indicators', label: 'مؤشرات الأداء', icon: 'fa-chart-line', page: 'showArchiveIndicators' }
    ]
  },
  { key: 'other', label: 'أخرى', icon: 'fa-ellipsis-h', color: '#6c757d',
    items: [
      { key: 'employees', label: 'بيان العاملين', icon: 'fa-users', page: 'renderEmployeeStatement' },
      { key: 'readiness', label: 'شيت الجاهزيه', icon: 'fa-clipboard-check', page: 'renderReadinessSheet' },
      { key: 'equipment', label: 'أجهزة بنك الدم', icon: 'fa-microscope', page: 'renderBloodBankEquipment' },
      { key: 'strategic_stock', label: 'الرصيد الاستراتيجي', icon: 'fa-shield', page: 'renderStrategicStock' },
      { key: 'sync', label: 'مزامنة مع Drive', icon: 'fa-cloud-upload-alt', page: 'showSyncDialog' }
    ]
  },
  { key: 'admin', label: 'الصلاحيات', icon: 'fa-lock', color: '#28a745',
    items: [
      { key: 'users', label: 'المستخدمين', icon: 'fa-users-gear', page: 'renderUsers' },
      { key: 'role_perms', label: 'صلاحيات الأدوار', icon: 'fa-shield-check', page: 'renderRolePerms' },
      { key: 'hospitals', label: 'المستشفيات', icon: 'fa-hospital', page: 'renderHospitals' },
      { key: 'governorates', label: 'المحافظات', icon: 'fa-location-dot', page: 'renderGovernorates' },
      { key: 'supervisor_data', label: 'بيانات المشرفين', icon: 'fa-address-card', page: 'renderSupervisorData' }
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

function navigateTo(pageName, catKey, subKey) {
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

function showToast(msg) {
  let container = document.getElementById('toastContainer');
  if (!container) { container = document.createElement('div'); container.id = 'toastContainer'; document.body.appendChild(container); }
  const el = document.createElement('div');
  el.className = 'toast-msg';
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, 2500);
}

function showMenu() { _navStack = [];
  let html = '<div id="alertArea" style="overflow-x:auto;overflow-y:hidden;white-space:nowrap;height:26px;line-height:26px;margin-bottom:4px;scrollbar-width:thin"></div><div class="main-icons-grid">';
  MENU_CATS.forEach(c => {
    const itemsTip = (c.items || []).filter(i => hasPerm(i.key, 'view'));
    if (c.page && !itemsTip.length) {
      html += `<div class="main-icon-card" onclick="navigateTo('${c.page}','${c.key}')">
        <div class="main-icon-circle" style="background:${c.color}"><i class="fas ${c.icon}"></i></div>
        <div class="main-icon-label">${c.label}</div>
      </div>`;
    } else {
      html += `<div class="main-icon-card" onclick="${c.page ? "navigateTo('"+c.page+"','"+c.key+"')" : "showSubMenu('"+c.key+"')"}">
        <div class="main-icon-circle" style="background:${c.color}"><i class="fas ${c.icon}"></i></div>
        <div class="main-icon-label">${c.label}</div>
        ${itemsTip.length ? `<div class="main-icon-tip">${itemsTip.map(i => `<span class="tip-item"><i class="fas ${i.icon}"></i> ${i.label}</span>`).join('')}</div>` : ''}
      </div>`;
    }
  });
  html += '</div>';
  document.getElementById('mainContent').innerHTML = html;
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
    const now = new Date();
    const today = now.toISOString().slice(0,10);
    const curMonth = now.getMonth() + 1;
    const curYear = now.getFullYear();
    let prevMonth = curMonth - 1;
    let prevYear = curYear;
    if (prevMonth === 0) { prevMonth = 12; prevYear--; }
    const months = ['','يناير','فبراير','مارس','ابريل','مايو','يونيو','يوليو','اغسطس','سبتمبر','اكتوبر','نوفمبر','ديسمبر'];
    let alerts = [];
    // Filter hospitals by user role
    let myHospitals = hospitals;
    if (me.role === 'hospital') myHospitals = hospitals.filter(h => h.id === me.hospitalId);
    else if (me.role === 'branch_supervisor') myHospitals = hospitals.filter(h => h.governorate === me.governorate);
    // Check daily stock - hospitals without today's report
    const todayIds = reports.filter(r => r.date === today).map(r => r.hospital_id);
    const missStock = myHospitals.filter(h => !todayIds.includes(h.id));
    if (missStock.length > 0) {
      alerts.push({ icon: 'fa-chart-bar', color: '#e74c3c', title: 'لم يتم تحديث STOCK Mang', detail: missStock.slice(0,5).map(h => h.name).join('، ') + (missStock.length > 5 ? ' +' + (missStock.length - 5) : ''), all: missStock.map(h => h.name) });
    }
    // Check monthly consumption - hospitals without data for previous month (also check archives)
    const prevConsumed = consumption.filter(r => r.year === prevYear && r.month === prevMonth).map(r => r.hospital_id);
    // Also check archives in case records were auto-archived
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
    // Check monthly indicators (big & small)
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
    // Check employee statements - hospitals without monthly review
    try {
      const empRes = await api('GET', '/employee-statements');
      const isHospital = window.me?.user?.role === 'hospital';
      const myHospId = window.me?.user?.hospitalId;
      const curMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const overdueEmp = (empRes.hospitalStatus||[]).filter(h => h.employeeCount > 0 && !h.monthlyUpdated && (!h.lastUpdate || new Date(h.lastUpdate) < curMonthStart));
      if (overdueEmp.length > 0) {
        const isMyHosp = isHospital && overdueEmp.some(h => h.id === myHospId);
        alerts.push({ icon: 'fa-users', color: '#dc3545', title: isMyHosp ? '⚠ يجب مراجعة بيان العاملين لمستشفاك هذا الشهر' : 'بيان العاملين: ' + overdueEmp.length + ' بنك لم يراجع هذا الشهر', detail: overdueEmp.slice(0,5).map(h => h.name).join('، ') + (overdueEmp.length > 5 ? ' +' + (overdueEmp.length - 5) : ''), all: overdueEmp.map(h => h.name) });
      }
      // Show red card for hospital user who hasn't reviewed this month
      if (isHospital && myHospId) {
        const myHospStatus = (empRes.hospitalStatus||[]).find(h => h.id === myHospId);
        if (myHospStatus && !myHospStatus.monthlyUpdated && myHospStatus.employeeCount > 0) {
          const mainEl = document.getElementById('mainContent');
          if (mainEl && !mainEl.querySelector('.emp-review-card')) {
            const card = document.createElement('div');
            card.className = 'emp-review-card';
            card.style.cssText = 'margin-bottom:10px;border:2px solid #dc3545;border-radius:10px;background:linear-gradient(135deg,#fff5f5,#ffe8e8);padding:16px;text-align:center';
            card.innerHTML = '<div style="font-size:22px;color:#dc3545;margin-bottom:6px"><i class="fas fa-users"></i></div>'
              + '<div style="font-size:16px;font-weight:700;color:#b71c1c;margin-bottom:4px">برجاء ادخال بيانات العاملين الخاصة بكم</div>'
              + '<div style="font-size:13px;color:#c62828;margin-bottom:12px">يرجى مراجعة وتحديث بيانات العاملين لديك لهذا الشهر</div>'
              + '<button onclick="navigateTo(\'renderEmployeeStatement\',\'other\');this.closest(\'.emp-review-card\').remove()" style="background:#dc3545;color:#fff;border:none;border-radius:8px;padding:8px 28px;font-size:14px;font-weight:600;cursor:pointer"><i class="fas fa-eye"></i> مراجعه</button>';
            mainEl.insertBefore(card, mainEl.firstChild);
          }
        }
      }
    } catch (e) { /* ignore */ }
    // Readiness notifications
    try {
      const rdnNotifs = await api('GET', '/readiness-notifications');
      if (rdnNotifs && rdnNotifs.length > 0) {
        rdnNotifs.forEach(n => {
          if (n.missing_count > 0) {
            alerts.push({
              icon: 'fa-clipboard-list', color: '#e65100',
              title: n.dynamic_message,
              detail: 'المستشفيات: ' + n.missing_hospitals.join('، ') + (n.missing_count > 5 ? ' +' + (n.missing_count - 5) : ''),
              all: n.all_missing || [], notifId: n.id, occasionId: n.occasion_id,
              isReadiness: true
            });
          } else {
            alerts.push({
              icon: 'fa-check-circle', color: '#2e7d32',
              title: n.dynamic_message,
              detail: '', all: [], notifId: n.id, occasionId: n.occasion_id,
              isReadiness: true
            });
          }
        });
      }
    } catch (e) { /* ignore */ }
    window._alertsData = alerts;
    const al = alerts.map((a, i) => a.isReadiness && a.notifId
      ? `<div style="display:inline-flex;align-items:center;gap:3px;background:${a.missing_count>0?'#fff3e0':'#e8f5e9'};border-right:3px solid ${a.color};border-radius:4px;padding:2px 6px;margin-left:4px;font-size:10px;white-space:nowrap;transition:0.15s">
          <span style="cursor:pointer" onclick="showAlertList(${i})" onmouseover="this.style.background='#ffe0b2'" onmouseout="this.style.background='transparent'">
            <i class="fas ${a.icon}" style="color:${a.color};font-size:9px"></i>
            <span style="color:#1565c0;font-weight:600">${sanitize(a.title)}</span>
          </span>
          <i class="fas fa-times" style="cursor:pointer;color:#999;font-size:8px;margin-right:2px" onclick="event.stopPropagation();rdnDismissNotif(${a.notifId},this)"></i>
        </div>`
      : `<span style="display:inline-flex;align-items:center;gap:3px;background:${a.missing_count>0?'#fff3e0':'#e8f5e9'};border-right:3px solid ${a.color};border-radius:4px;padding:2px 6px;margin-left:4px;font-size:10px;white-space:nowrap;transition:0.15s;cursor:pointer" onclick="showAlertList(${i})" onmouseover="this.style.background='#ffe0b2'" onmouseout="this.style.background='#fff3e0'">
          <i class="fas ${a.icon}" style="color:${a.color};font-size:9px"></i>
          <span style="color:#1565c0;font-weight:600">${sanitize(a.title)}</span>
        </span>`).join('');
    el.innerHTML = alerts.length === 0
      ? '<span style="background:#e8f5e9;border-radius:4px;padding:4px 12px;font-size:12px;color:#2e7d32;display:inline-flex;align-items:center;gap:4px"><i class="fas fa-check-circle" style="font-size:12px"></i> كل البيانات محدثة ✓</span>'
      : al;
  } catch (e) { /* ignore */ }
}

function showAlertList(idx) {
  const a = window._alertsData && window._alertsData[idx];
  if (!a || !a.all || a.all.length === 0) return;
  openModal(sanitize(a.title),
    `<div style="max-height:400px;overflow-y:auto;direction:ltr"><ol style="direction:rtl;text-align:right;font-size:13px;padding-right:20px;margin:0">${a.all.map(n => `<li style="padding:4px 0">${sanitize(n)}</li>`).join('')}</ol></div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">إغلاق</button>`);
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
  let html = `<div class="page-actions"><button class="btn-back" onclick="goBack()"><i class="fas fa-arrow-right"></i> رجوع</button></div>
    <div class="sub-icons-grid">`;
  items.forEach(item => {
    if (item.subitems) {
      if (!item.subitems.some(si => hasPerm(si.key, 'view'))) return;
      const ic = ITEM_COLORS[item.key] || cat.color;
      html += `<div class="sub-icon-card" onclick="showSubMenu('${catKey}','${item.key}')">
        <div class="sub-icon-circle" style="background:${ic}"><i class="fas ${item.icon}"></i></div>
        <div class="sub-icon-label">${item.label}</div>
      </div>`;
    } else if (hasPerm(item.key, 'view')) {
      const ic = ITEM_COLORS[item.key] || cat.color;
      html += `<div class="sub-icon-card" onclick="navigateTo('${item.page}','${catKey}'${isNested ? ",'"+subKey+"'" : ''})">
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

// ============== DAILY STOCK (رصيد يومى) ==============

const BTYPES = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];
const PTYPES = ['A','B','AB','O'];

function calcAvail(bd, t) { return (bd[t]?.previous||0) + (bd[t]?.incoming||0) - (bd[t]?.outgoing||0) - (bd[t]?.disposal||0); }

function tryParse(v) {
  if (!v) return null;
  if (typeof v === 'string') try { return JSON.parse(v); } catch(e) { return null; }
  return v;
}

async function renderDailyStock() {
  const el = document.getElementById('mainContent');
  try {
    const canAdd = hasPerm('daily_stock', 'add');
    const canEdit = hasPerm('daily_stock', 'edit');
    const canExport = hasPerm('daily_stock', 'export');
    el.innerHTML = `<div class="page-actions"><button class="btn-back" onclick="goBack()"><i class="fas fa-arrow-right"></i> الرئيسية</button>
      ${canAdd ? '<button class="btn btn-primary" onclick="showAddDailyModal()"><i class="fas fa-plus"></i> إضافة</button>' : ''}
      ${canExport ? '<button class="btn btn-success" onclick="exportStockExcel()"><i class="fas fa-file-excel"></i> Excel</button>' : ''}</div>
      <div class="card"><div class="card-body table-scroll" id="dailyStockWrap"></div></div>`;
    const reports = await api('GET', '/daily-reports');
    const SUB = ['رصيد سابق', 'وارد', 'منصرف', 'اعدام', 'رصيد متاح'];
    const SUB_TOT = ['رصيد سابق', 'وارد', 'منصرف', 'اعدام', 'رصيد متاح'];
    let h = '<table class="data-table" id="dailyStockTable"><thead>';
    h += '<tr><th rowspan="3">الفرع</th><th rowspan="3">اسم بنك الدم</th><th colspan="2">تاريخ الإرسال</th><th rowspan="3">تحت فحص</th>';
    h += `<th colspan="${BTYPES.length * 5}" class="blood-header">رصيــــــد الـــــــــــدم</th>`;
    h += '<th colspan="5" class="total-header">المجموع</th>';
    h += `<th colspan="${PTYPES.length * 5}" class="plasma-header">رصيد البلازما المفحوص</th>`;
    h += '<th colspan="5" class="total-header">المجموع</th>';
    h += '<th rowspan="3">الصفائح</th><th rowspan="3">الكرايو</th><th rowspan="3">الترخيص</th><th rowspan="3">وضع الترخيص</th></tr>';
    h += '<tr><th>اليوم</th><th>الوقت</th>';
    BTYPES.forEach(t => h += `<th colspan="5">${t}</th>`);
    SUB_TOT.forEach(l => h += `<th>${l}</th>`);
    PTYPES.forEach(t => h += `<th colspan="5">${t}</th>`);
    SUB_TOT.forEach(l => h += `<th>${l}</th>`);
    h += '</tr>';
    h += '<tr><th></th><th></th>';
    for (let i = 0; i < BTYPES.length; i++) SUB.forEach(l => h += `<th>${l}</th>`);
    for (let i = 0; i < 5; i++) h += '<th></th>';
    for (let i = 0; i < PTYPES.length; i++) SUB.forEach(l => h += `<th>${l}</th>`);
    for (let i = 0; i < 5; i++) h += '<th></th>';
    h += '</tr></thead><tbody>';
    const groups = {};
    reports.forEach(r => {
      const g = r.governorate || 'غير محدد';
      if (!groups[g]) groups[g] = [];
      groups[g].push(r);
    });
    Object.entries(groups).forEach(([gov, reps], govIdx) => {
      reps.forEach((r, idx) => {
        const bd = tryParse(r.blood_data) || {};
        const pd = tryParse(r.plasma_data) || {};
        const bTot = { previous: 0, incoming: 0, outgoing: 0, disposal: 0, available: 0 };
        const pTot = { previous: 0, incoming: 0, outgoing: 0, disposal: 0, available: 0 };
        h += `<tr class="data-row gov-${govIdx % 2 === 0 ? 'even' : 'odd'}" data-rid="${r.id}">`;
        if (idx === 0) h += `<td class="gov-cell" rowspan="${reps.length}">${gov}</td>`;
        const todayStr = new Date().toISOString().slice(0,10);
        const dateStyle = r.date && r.date !== todayStr ? ' style="color:red;font-weight:700"' : '';
        h += `<td>${r.hospital_name || ''}</td><td data-role="date"${dateStyle}>${r.date || ''}</td><td data-role="time">${r.time || ''}</td>`;
        h += `<td class="${canEdit ? 'editable' : ''}" data-group="meta" data-sub="under_inspection" data-rid="${r.id}">${r.under_inspection || 0}</td>`;
        BTYPES.forEach(t => {
          const d = bd[t] || {};
          bTot.previous += d.previous || 0; bTot.incoming += d.incoming || 0;
          bTot.outgoing += d.outgoing || 0; bTot.disposal += d.disposal || 0;
          const av = calcAvail(bd, t); bTot.available += av;
          h += `<td class="${canEdit ? 'editable' : ''}" data-group="blood" data-type="${t}" data-sub="previous" data-rid="${r.id}">${d.previous || 0}</td>`;
          h += `<td class="${canEdit ? 'editable' : ''}" data-group="blood" data-type="${t}" data-sub="incoming" data-rid="${r.id}">${d.incoming || 0}</td>`;
          h += `<td class="${canEdit ? 'editable' : ''}" data-group="blood" data-type="${t}" data-sub="outgoing" data-rid="${r.id}">${d.outgoing || 0}</td>`;
          h += `<td class="${canEdit ? 'editable' : ''}" data-group="blood" data-type="${t}" data-sub="disposal" data-rid="${r.id}">${d.disposal || 0}</td>`;
          h += `<td class="avail-cell" data-group="blood" data-type="${t}" data-sub="available" data-rid="${r.id}">${av}</td>`;
        });
        h += `<td class="total-cell" data-role="btotal" data-sub="previous">${bTot.previous}</td><td class="total-cell" data-role="btotal" data-sub="incoming">${bTot.incoming}</td><td class="total-cell" data-role="btotal" data-sub="outgoing">${bTot.outgoing}</td><td class="total-cell" data-role="btotal" data-sub="disposal">${bTot.disposal}</td><td class="total-cell" data-role="btotal" data-sub="available">${bTot.available}</td>`;
        PTYPES.forEach(t => {
          const d = pd[t] || {};
          pTot.previous += d.previous || 0; pTot.incoming += d.incoming || 0;
          pTot.outgoing += d.outgoing || 0; pTot.disposal += d.disposal || 0;
          const av = calcAvail(pd, t); pTot.available += av;
          h += `<td class="${canEdit ? 'editable' : ''}" data-group="plasma" data-type="${t}" data-sub="previous" data-rid="${r.id}">${d.previous || 0}</td>`;
          h += `<td class="${canEdit ? 'editable' : ''}" data-group="plasma" data-type="${t}" data-sub="incoming" data-rid="${r.id}">${d.incoming || 0}</td>`;
          h += `<td class="${canEdit ? 'editable' : ''}" data-group="plasma" data-type="${t}" data-sub="outgoing" data-rid="${r.id}">${d.outgoing || 0}</td>`;
          h += `<td class="${canEdit ? 'editable' : ''}" data-group="plasma" data-type="${t}" data-sub="disposal" data-rid="${r.id}">${d.disposal || 0}</td>`;
          h += `<td class="avail-cell" data-group="plasma" data-type="${t}" data-sub="available" data-rid="${r.id}">${av}</td>`;
        });
        h += `<td class="total-cell" data-role="ptotal" data-sub="previous">${pTot.previous}</td><td class="total-cell" data-role="ptotal" data-sub="incoming">${pTot.incoming}</td><td class="total-cell" data-role="ptotal" data-sub="outgoing">${pTot.outgoing}</td><td class="total-cell" data-role="ptotal" data-sub="disposal">${pTot.disposal}</td><td class="total-cell" data-role="ptotal" data-sub="available">${pTot.available}</td>`;
        h += `<td class="${canEdit ? 'editable' : ''}" data-group="plat_cryo" data-sub="platelets" data-rid="${r.id}">${r.platelets || 0}</td><td class="${canEdit ? 'editable' : ''}" data-group="plat_cryo" data-sub="cryo" data-rid="${r.id}">${r.cryo || 0}</td><td class="${canEdit ? 'editable' : ''}" data-group="license" data-sub="license_type" data-rid="${r.id}">${r.license_type || ''}</td><td class="${canEdit ? 'editable' : ''}" data-group="license" data-sub="license_status" data-rid="${r.id}">${r.license_status || ''}</td></tr>`;
      });
    });
    if (!Object.keys(groups).length) h += '<tr><td colspan="79" class="empty-msg">لا توجد بيانات</td></tr>';
    h += '</tbody></table>';
    document.getElementById('dailyStockWrap').innerHTML = h;
    if (canEdit) setupInlineEdit();
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

function setupInlineEdit() {
  const table = document.getElementById('dailyStockTable');
  if (!table) return;
  table.addEventListener('click', function(e) {
    const td = e.target.closest('td.editable');
    if (!td || td.contentEditable === 'true') return;
    const orig = td.textContent.trim();
    const isText = td.dataset.group === 'license';
    td.contentEditable = true;
    td.focus();
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(td);
    sel.removeAllRanges();
    sel.addRange(range);
    const finish = () => {
      td.contentEditable = false;
      if (isText) {
        // Keep text as-is
      } else {
        const newVal = parseInt(td.textContent.trim()) || 0;
        td.textContent = newVal;
      }
      const rid = parseInt(td.dataset.rid);
      const group = td.dataset.group;
      const type = td.dataset.type;
      const sub = td.dataset.sub;
      collectGroupData(table, rid);
    };
    td.onblur = finish;
    td.onkeydown = function(ev) {
      if (ev.key === 'Enter') { ev.preventDefault(); td.blur(); }
      if (ev.key === 'Escape') { td.textContent = orig; td.contentEditable = false; }
    };
  });
}

async function collectGroupData(table, rid) {
  const bd = {}; const pd = {};
  BTYPES.forEach(t => { bd[t] = { previous: 0, incoming: 0, outgoing: 0, disposal: 0, available: 0 }; });
  PTYPES.forEach(t => { pd[t] = { previous: 0, incoming: 0, outgoing: 0, disposal: 0, available: 0 }; });
  let under_inspection = 0; let platelets = null; let cryo = null; let license_type = null; let license_status = null;
  const cells = table.querySelectorAll(`[data-rid="${rid}"]`);
  cells.forEach(cell => {
    const g = cell.dataset.group;
    const t = cell.dataset.type;
    const s = cell.dataset.sub;
    const v = parseInt(cell.textContent.trim()) || 0;
    const tv = cell.textContent.trim();
    if (g === 'blood' && bd[t]) bd[t][s] = v;
    if (g === 'plasma' && pd[t]) pd[t][s] = v;
    if (g === 'meta' && s === 'under_inspection') under_inspection = v;
    if (g === 'plat_cryo' && s === 'platelets') platelets = v;
    if (g === 'plat_cryo' && s === 'cryo') cryo = v;
    if (g === 'license' && s === 'license_type') license_type = tv;
    if (g === 'license' && s === 'license_status') license_status = tv;
  });
  BTYPES.forEach(t => { bd[t].available = calcAvail(bd, t); });
  PTYPES.forEach(t => { pd[t].available = calcAvail(pd, t); });
  const bTot = { previous: 0, incoming: 0, outgoing: 0, disposal: 0, available: 0 };
  const pTot = { previous: 0, incoming: 0, outgoing: 0, disposal: 0, available: 0 };
  BTYPES.forEach(t => { bTot.previous += bd[t].previous; bTot.incoming += bd[t].incoming; bTot.outgoing += bd[t].outgoing; bTot.disposal += bd[t].disposal; bTot.available += bd[t].available; });
  PTYPES.forEach(t => { pTot.previous += pd[t].previous; pTot.incoming += pd[t].incoming; pTot.outgoing += pd[t].outgoing; pTot.disposal += pd[t].disposal; pTot.available += pd[t].available; });
  const now = new Date();
  const date = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Cairo' });
  try {
    const body = { blood: bd, plasma: pd, underInspection: under_inspection, date, time };
    if (platelets !== null) body.platelets = platelets;
    if (cryo !== null) body.cryo = cryo;
    if (license_type !== null) body.licenseType = license_type;
    if (license_status !== null) body.licenseStatus = license_status;
    await api('PUT', '/daily-reports/' + rid, body);
    const row = table.querySelector(`tr[data-rid="${rid}"]`);
    if (row) updateRow(row, bd, pd, bTot, pTot, under_inspection, date, time);
  } catch(e) { console.error(e); }
}
function updateRow(row, bd, pd, bTot, pTot, under_inspection, date, time) {
  const todayStr = new Date().toISOString().slice(0,10);
  const dateCell = row.querySelector('[data-role="date"]');
  dateCell.textContent = date;
  dateCell.style.color = date && date.slice(0,10) !== todayStr ? 'red' : '';
  dateCell.style.fontWeight = date && date.slice(0,10) !== todayStr ? '700' : '';
  row.querySelector('[data-role="time"]').textContent = time;
  row.querySelector('[data-group="meta"][data-sub="under_inspection"]').textContent = under_inspection;
  BTYPES.forEach(t => {
    const cell = row.querySelector(`[data-group="blood"][data-type="${t}"][data-sub="available"]`);
    if (cell) cell.textContent = calcAvail(bd, t);
  });
  PTYPES.forEach(t => {
    const cell = row.querySelector(`[data-group="plasma"][data-type="${t}"][data-sub="available"]`);
    if (cell) cell.textContent = calcAvail(pd, t);
  });
  row.querySelector('[data-role="btotal"][data-sub="previous"]').textContent = bTot.previous;
  row.querySelector('[data-role="btotal"][data-sub="incoming"]').textContent = bTot.incoming;
  row.querySelector('[data-role="btotal"][data-sub="outgoing"]').textContent = bTot.outgoing;
  row.querySelector('[data-role="btotal"][data-sub="disposal"]').textContent = bTot.disposal;
  row.querySelector('[data-role="btotal"][data-sub="available"]').textContent = bTot.available;
  row.querySelector('[data-role="ptotal"][data-sub="previous"]').textContent = pTot.previous;
  row.querySelector('[data-role="ptotal"][data-sub="incoming"]').textContent = pTot.incoming;
  row.querySelector('[data-role="ptotal"][data-sub="outgoing"]').textContent = pTot.outgoing;
  row.querySelector('[data-role="ptotal"][data-sub="disposal"]').textContent = pTot.disposal;
  row.querySelector('[data-role="ptotal"][data-sub="available"]').textContent = pTot.available;
}

async function showAddDailyModal() {
  const hospitals = await api('GET', '/hospitals');
  const now = new Date();
  const d = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });
  const t = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Cairo' });
  let html = `<div class="form-group"><label>المستشفى</label><select class="form-control" id="addDailyHospital">
    ${hospitals.map(h => `<option value="${h.id}">${h.name}</option>`).join('')}</select></div>
    <div class="form-group"><label>التاريخ</label><input type="date" class="form-control" id="addDailyDate" value="${d}"></div>
    <div class="form-group"><label>الوقت</label><input type="text" class="form-control" id="addDailyTime" value="${t}"></div>`;
  openModal('إضافة تقرير يومي', html,
    `<button class="btn btn-secondary" onclick="closeModal()">إلغاء</button><button class="btn btn-primary" onclick="createDailyReport()">حفظ</button>`);
}

async function createDailyReport() {
  const hospitalId = parseInt(document.getElementById('addDailyHospital').value);
  const date = document.getElementById('addDailyDate').value;
  const time = document.getElementById('addDailyTime').value.trim();
  if (!hospitalId || !date) { alert('اختر المستشفى والتاريخ'); return; }
  try {
    await api('POST', '/daily-reports', { hospitalId, date, time });
    closeModal();
    renderDailyStock();
  } catch(e) { alert(e.message); }
}

// ============== الرصيد الاستراتيجي (Strategic Reserve) ==============

let strategicViewMode = 'all';
let strategicViewGov = '';
let strategicViewHosp = '';

async function renderStrategicStock() {
  const el = document.getElementById('mainContent');
  const canExport = hasPerm('strategic_stock', 'export');
  try {
    const [reports, hospitals, srData] = await Promise.all([
      api('GET', '/daily-reports'),
      api('GET', '/hospitals'),
      api('GET', '/strategic-reserves').catch(() => ({ reserves: [], settings: null }))
    ]);
    const strategicMap = {};
    (srData.reserves || []).forEach(sr => { strategicMap[sr.hospital_id] = sr.values; });
    const strategicSettings = srData.settings;

    // Auto-calculate if quarter changed
    if (strategicSettings && hasPerm('strategic_stock', 'edit')) {
      const now = new Date();
      const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 3, 1);
      const qEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 0);
      const expectedQuarter = qStart.toISOString().split('T')[0] + ' / ' + qEnd.toISOString().split('T')[0];
      if (strategicSettings.quarter !== expectedQuarter) {
        try {
          await api('POST', '/calculate-strategic', { formula: strategicSettings.formula, holidayDays: strategicSettings.holidayDays });
          const fresh = await api('GET', '/strategic-reserves');
          Object.assign(strategicMap, ...(fresh.reserves || []).map(sr => ({ [sr.hospital_id]: sr.values })));
          strategicSettings.quarter = fresh.settings.quarter;
          strategicSettings.calculated_at = fresh.settings.calculated_at;
        } catch (e) { /* silent */ }
      }
    }
    const latest = {};
    reports.forEach(r => {
      const key = r.hospital_id;
      if (!latest[key] || (r.date || '') > (latest[key].date || '')) latest[key] = r;
    });
    const todayStr = new Date().toISOString().slice(0,10);
    const govOrder = ['بورسعيد','الإسماعيلية','السويس','الأقصر','جنوب سيناء','أسوان'];
    const groups = {};
    hospitals.forEach(h => {
      const g = h.governorate || 'غير محدد';
      if (!groups[g]) groups[g] = [];
      groups[g].push(h);
    });
    const sortedGovs = Object.keys(groups).sort((a,b) => {
      const ai = govOrder.indexOf(a); const bi = govOrder.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });

    function buildHospitalRows(gov, h, idx, r, govIdx, isLast) {
      const bd = r ? (tryParse(r.blood_data) || {}) : {};
      const sr = strategicMap[h.id] || {};
      const dateStyle = r && r.date && r.date !== todayStr ? ' style="color:red;font-weight:700"' : '';
      const timeStyle = r && r.date && r.date !== todayStr ? ' style="font-weight:700"' : '';
      const curVals = r ? BTYPES.map(t => calcAvail(bd, t)) : BTYPES.map(() => 0);
      const strVals = BTYPES.map(t => sr[t] || 0);
      const availVals = BTYPES.map((t, i) => curVals[i] - strVals[i]);
      const rowClass = govIdx % 2 === 0 ? 'row-light' : 'row-dark';
      const sepStyle = isLast ? 'border-bottom:2px solid #bbb' : '';
      return `<tr class="${rowClass}" style="${sepStyle}">
        ${idx === 0 ? `<td class="gov-cell" rowspan="${groups[gov].length * 3 + (showPerGovTotals ? 3 : 0)}">${gov}</td>` : ''}
        <td rowspan="3" style="vertical-align:middle;font-weight:600;font-size:12px">${h.name}</td>
        <td rowspan="3" style="vertical-align:middle;font-size:11px"${dateStyle}>${r ? (r.date || '') : ''}</td>
        <td rowspan="3" style="vertical-align:middle;font-size:11px"${timeStyle}>${r ? (r.time || '') : ''}</td>
        <th scope="row" class="label-cur">الرصيد الحالي</th>
        ${curVals.map(v => `<td class="cell-cur">${v}</td>`).join('')}
        <td rowspan="3" class="cell-under">${r ? (r.under_inspection || 0) : 0}</td>
      </tr>
      <tr class="${rowClass}">
        <th scope="row" class="label-str">الاستراتيجي</th>
        ${strVals.map(v => `<td class="cell-str">${v}</td>`).join('')}
      </tr>
      <tr class="${rowClass}">
        <th scope="row" class="label-avail">حال الرصيد</th>
        ${availVals.map(v => { const c = v < 0 ? 'color:red;font-weight:700' : 'color:#1b5e20;font-weight:700'; return `<td style="${c}">${v}</td>`; }).join('')}
      </tr>`;
    }

    function buildTotalsRow(gov, totCur, totStr, totAvail, totUnder) {
      return `<tr class="totals-row" style="border-top:2px solid #999">
        <td colspan="2" class="totals-title">إجمالي ${gov}</td><td></td>
        <th scope="row" class="label-cur-tot">الرصيد الحالي</th>
        ${totCur.map(v => `<td class="totals-val">${v}</td>`).join('')}
        <td class="totals-val">${totUnder}</td>
      </tr>
      <tr class="totals-row">
        <td colspan="2"></td><td></td>
        <th scope="row" class="label-str-tot">الاستراتيجي</th>
        ${totStr.map(v => `<td class="cell-str-tot">${v}</td>`).join('')}
        <td></td>
      </tr>
      <tr class="totals-row" style="border-bottom:2px solid #999">
        <td colspan="2"></td><td></td>
        <th scope="row" class="label-avail-tot">حال الرصيد</th>
        ${totAvail.map(v => { const c = v < 0 ? 'color:red;font-weight:700' : 'color:#1b5e20;font-weight:700'; return `<td class="totals-val" style="${c}">${v}</td>`; }).join('')}
        <td></td>
      </tr>`;
    }

    function calcGovTotals(gov) {
      const totCur = BTYPES.map(() => 0);
      const totStr = BTYPES.map(() => 0);
      const totAvail = BTYPES.map(() => 0);
      let totUnder = 0;
      groups[gov].forEach(h => {
        const rpt = latest[h.id] || null;
        const bd = rpt ? (tryParse(rpt.blood_data) || {}) : {};
        const sr2 = strategicMap[h.id] || {};
        BTYPES.forEach((t, i) => {
          const cur = rpt ? calcAvail(bd, t) : 0;
          totCur[i] += cur;
          totStr[i] += sr2[t] || 0;
          totAvail[i] += cur - (sr2[t] || 0);
        });
        totUnder += rpt ? (rpt.under_inspection || 0) : 0;
      });
      return { totCur, totStr, totAvail, totUnder };
    }

    function calcGrandTotal() {
      const grandCur = BTYPES.map(() => 0);
      const grandStr = BTYPES.map(() => 0);
      const grandAvail = BTYPES.map(() => 0);
      let grandUnder = 0;
      Object.values(groups).forEach(hs => {
        hs.forEach(h => {
          const rpt = latest[h.id] || null;
          const bd = rpt ? (tryParse(rpt.blood_data) || {}) : {};
          const sr2 = strategicMap[h.id] || {};
          BTYPES.forEach((t, i) => {
            const cur = rpt ? calcAvail(bd, t) : 0;
            grandCur[i] += cur;
            grandStr[i] += sr2[t] || 0;
            grandAvail[i] += cur - (sr2[t] || 0);
          });
          grandUnder += rpt ? (rpt.under_inspection || 0) : 0;
        });
      });
      return { grandCur, grandStr, grandAvail, grandUnder };
    }

    function buildGrandRow(gc, gs, ga, gu) {
      return `<tr class="grand-row" style="border-top:2px solid #1b5e20">
        <td colspan="2" class="grand-title">الرصيد في الهيئة</td><td></td><td></td>
        <th scope="row" class="label-cur-grand">الرصيد الحالي</th>
        ${gc.map(v => `<td class="grand-val">${v}</td>`).join('')}
        <td class="grand-val">${gu}</td>
      </tr>
      <tr class="grand-row">
        <td colspan="2"></td><td></td><td></td>
        <th scope="row" class="label-str-grand">الاستراتيجي</th>
        ${gs.map(v => `<td class="grand-str-val">${v}</td>`).join('')}
        <td></td>
      </tr>
      <tr class="grand-row" style="border-bottom:2px solid #1b5e20">
        <td colspan="2"></td><td></td><td></td>
        <th scope="row" class="label-avail-grand">حال الرصيد</th>
        ${ga.map(v => { const c = v < 0 ? 'color:red;font-weight:700' : 'color:#1b5e20;font-weight:700'; return `<td class="grand-val" style="${c}">${v}</td>`; }).join('')}
        <td></td>
      </tr>`;
    }

    const viewMode = strategicViewMode || 'all';
    const viewGov = strategicViewGov || '';
    const viewHosp = strategicViewHosp || '';

    const showDates = viewMode !== 'govtotals';
    const showPerGovTotals = viewMode !== 'all' && viewMode !== 'hospital';

    let bodyHtml = '';
    if (viewMode === 'hospital' && viewHosp) {
      const h = hospitals.find(x => x.id == viewHosp);
      if (h) {
        bodyHtml += buildHospitalRows(h.governorate || '', h, 0, latest[h.id] || null, 0, true);
      }
    } else if (viewMode === 'gov' && viewGov && groups[viewGov]) {
      groups[viewGov].forEach((h, idx) => {
        bodyHtml += buildHospitalRows(viewGov, h, idx, latest[h.id] || null, sortedGovs.indexOf(viewGov), idx === groups[viewGov].length - 1);
      });
      const t = calcGovTotals(viewGov);
      bodyHtml += buildTotalsRow(viewGov, t.totCur, t.totStr, t.totAvail, t.totUnder);
    } else if (viewMode === 'govtotals') {
      sortedGovs.forEach((gov, gi) => {
        const t = calcGovTotals(gov);
        const lastStyle = gi === sortedGovs.length - 1 ? 'border-bottom:2px solid #999' : '';
        bodyHtml += `<tr class="totals-row" style="border-top:2px solid #999">
          <td class="totals-title" style="text-align:right">${gov}</td>
          <th scope="row" class="label-cur-tot">الرصيد الحالي</th>
          ${t.totCur.map(v => `<td class="totals-val">${v}</td>`).join('')}
          <td class="totals-val">${t.totUnder}</td>
        </tr>
        <tr class="totals-row">
          <td style="border-right:none;border-left:none"></td>
          <th scope="row" class="label-str-tot">الاستراتيجي</th>
          ${t.totStr.map(v => `<td class="cell-str-tot">${v}</td>`).join('')}
          <td></td>
        </tr>
        <tr class="totals-row" style="${lastStyle}">
          <td style="border-right:none;border-left:none"></td>
          <th scope="row" class="label-avail-tot">حال الرصيد</th>
          ${t.totAvail.map((v,i) => { const c = v < 0 ? 'color:red;font-weight:700' : 'color:#1b5e20;font-weight:700'; return `<td class="totals-val" style="${c}">${v}</td>`; }).join('')}
          <td></td>
        </tr>`;
      });
      const g = calcGrandTotal();
      bodyHtml += `<tr class="grand-row" style="border-top:2px solid #1b5e20">
        <td class="grand-title" style="text-align:right">الرصيد في الهيئة</td>
        <th scope="row" class="label-cur-grand">الرصيد الحالي</th>
        ${g.grandCur.map(v => `<td class="grand-val">${v}</td>`).join('')}
        <td class="grand-val">${g.grandUnder}</td>
      </tr>
      <tr class="grand-row">
        <td style="border-right:none;border-left:none"></td>
        <th scope="row" class="label-str-grand">الاستراتيجي</th>
        ${g.grandStr.map(v => `<td class="grand-str-val">${v}</td>`).join('')}
        <td></td>
      </tr>
      <tr class="grand-row" style="border-bottom:2px solid #1b5e20">
        <td style="border-right:none;border-left:none"></td>
        <th scope="row" class="label-avail-grand">حال الرصيد</th>
        ${g.grandAvail.map((v,i) => { const c = v < 0 ? 'color:red;font-weight:700' : 'color:#1b5e20;font-weight:700'; return `<td class="grand-val" style="${c}">${v}</td>`; }).join('')}
        <td></td>
      </tr>`;
    } else if (viewMode === 'grand') {
      const g = calcGrandTotal();
      bodyHtml += buildGrandRow(g.grandCur, g.grandStr, g.grandAvail, g.grandUnder);
    } else {
      sortedGovs.forEach((gov, govIdx) => {
        const hs = groups[gov];
        hs.forEach((h, idx) => {
          bodyHtml += buildHospitalRows(gov, h, idx, latest[h.id] || null, govIdx, idx === hs.length - 1);
        });
      });
      const g = calcGrandTotal();
      bodyHtml += buildGrandRow(g.grandCur, g.grandStr, g.grandAvail, g.grandUnder);
    }

    const colCount = showDates ? 14 : 11;
    const dateHead = showDates ? `<th rowspan="2">اسم بنك الدم</th><th colspan="2">اخر تحديث</th>` : '';
    const dateSub = showDates ? `<th>اليوم</th><th>الوقت</th>` : '';

    el.innerHTML = `<div class="page-actions"><button class="btn-back" onclick="goBack()"><i class="fas fa-arrow-right"></i> الرئيسية</button>
      ${canExport ? '<button class="btn btn-success" onclick="exportStrategicExcel()"><i class="fas fa-file-excel"></i> Excel</button><button class="btn btn-danger" onclick="exportStrategicPDF()" style="margin-right:6px"><i class="fas fa-file-pdf"></i> PDF</button>' : ''}</div>
      <div class="page-title"><i class="fas fa-shield" style="color:#2e7d32"></i> الرصيد الاستراتيجي</div>
      <div class="card"><div class="card-body">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px">
          <button class="btn ${viewMode === 'all' ? 'btn-primary' : 'btn-outline'}" onclick="strategicViewMode='all';renderStrategicStock()">كل المحافظات</button>
          <button class="btn ${viewMode === 'gov' ? 'btn-primary' : 'btn-outline'}" onclick="strategicViewMode='gov';renderStrategicStock()">فرع</button>
          <button class="btn ${viewMode === 'govtotals' ? 'btn-primary' : 'btn-outline'}" onclick="strategicViewMode='govtotals';renderStrategicStock()">إجمالي المحافظات</button>
          <button class="btn ${viewMode === 'grand' ? 'btn-primary' : 'btn-outline'}" onclick="strategicViewMode='grand';renderStrategicStock()">إجمالي الهيئة</button>
          <button class="btn ${viewMode === 'hospital' ? 'btn-primary' : 'btn-outline'}" onclick="strategicViewMode='hospital';renderStrategicStock()">مستشفى</button>
          ${viewMode === 'gov' ? `<select class="form-control" style="width:auto;display:inline-block" onchange="strategicViewGov=this.value;strategicViewMode='gov';renderStrategicStock()"><option value="">اختر الفرع</option>${sortedGovs.map(g => `<option value="${g}" ${viewGov === g ? 'selected' : ''}>${g}</option>`).join('')}</select>` : ''}
          ${viewMode === 'hospital' ? `<select class="form-control" style="width:auto;display:inline-block" onchange="strategicViewHosp=this.value;renderStrategicStock()"><option value="">اختر المستشفى</option>${hospitals.filter(h => !viewGov || h.governorate === viewGov).map(h => `<option value="${h.id}" ${viewHosp == h.id ? 'selected' : ''}>${h.name}</option>`).join('')}</select>` : ''}
          ${hasPerm('strategic_stock', 'edit') ? `<button class="btn btn-primary" style="margin-right:auto" onclick="showStrategicCalcModal()"><i class="fas fa-calculator"></i> حساب الرصيد الاستراتيجي</button>` : ''}
        </div>
        ${strategicSettings ? `<div style="font-size:12px;color:#666;margin-bottom:8px;text-align:center">آخر حساب: الربع ${strategicSettings.quarter || ''} — تاريخ: ${strategicSettings.calculated_at ? new Date(strategicSettings.calculated_at).toLocaleDateString('ar-EG') : ''}</div>` : ''}
        <div class="table-scroll"><div id="strategicTableWrap"><table class="strategic-table" id="strategicTable"><thead>
        <tr><th rowspan="2">الفرع</th>${dateHead}<th rowspan="2">النوع</th><th colspan="8">الرصيـــــــد</th>
          <th rowspan="2">تحت الفحص</th></tr>
        <tr>${dateSub}${BTYPES.map(t => `<th>${t}</th>`).join('')}</tr>
      </thead><tbody>
        ${bodyHtml || '<tr><td colspan="' + colCount + '" class="empty-msg">لا توجد بيانات</td></tr>'}
      </tbody></table></div></div></div>`;
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

async function showStrategicCalcModal() {
  try {
    const res = await api('GET', '/strategic-reserves');
    const curFormula = res.settings?.formula || 1;
    const curDays = res.settings?.holidayDays || '';
    const html = `<div style="padding:8px">
      <div class="form-group"><label>اختر المعادلة:</label>
        <select class="form-control" id="calcFormula">
          <option value="1" ${curFormula === 1 ? 'selected' : ''}>المعادلة 1: (المتوسط + 20%) × أيام الإجازات</option>
          <option value="2" ${curFormula === 2 ? 'selected' : ''}>المعادلة 2: (المتوسط) + (20% × المتوسط × أيام الإجازات)</option>
        </select></div>
      <div class="form-group"><label>عدد أيام الإجازات:</label>
        <input type="number" class="form-control" id="calcHolidayDays" value="${curDays}" min="0" placeholder="أدخل عدد الأيام"></div>
      <div style="font-size:12px;color:#666;margin-top:8px">سيتم حساب الرصيد الاستراتيجي لكل مستشفى بناءً على متوسط الاستهلاك اليومي لآخر ربع سنوي</div>
    </div>`;
    openModal('حساب الرصيد الاستراتيجي', html,
      `<button class="btn btn-secondary" onclick="closeModal()">إلغاء</button><button class="btn btn-primary" onclick="doStrategicCalc()">حساب وحفظ</button>`);
  } catch (e) { alert('حدث خطأ: ' + e.message); }
}

async function doStrategicCalc() {
  const formula = parseInt(document.getElementById('calcFormula').value);
  const holidayDays = parseInt(document.getElementById('calcHolidayDays').value);
  if (!holidayDays || holidayDays < 0) { alert('يرجى إدخال عدد أيام الإجازات'); return; }
  closeModal();
  const el = document.getElementById('mainContent');
  el.innerHTML = '<div class="empty-msg" style="padding:40px"><i class="fas fa-spinner fa-spin" style="font-size:24px"></i><br>جاري حساب الرصيد الاستراتيجي...</div>';
  try {
    await api('POST', '/calculate-strategic', { formula, holidayDays });
    renderStrategicStock();
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

function exportStrategicExcel() {
  const wrap = document.getElementById('strategicTableWrap');
  if (!wrap) return;
  const dateStr = new Date().toLocaleDateString('ar-EG');
  const tbl = wrap.querySelector('table');
  if (!tbl) return;
  let html = tbl.outerHTML;
  // Add inline styles to all cells for Excel
  html = html.replace(/<table/g, '<table style="border-collapse:collapse;width:100%;font-family:\'Segoe UI\',Arial;font-size:12px"');
  html = html.replace(/<th(?!\s)/g, '<th style="background:#2e7d32;color:#fff;font-weight:700;padding:6px 8px;border:1px solid #1b5e20;text-align:center;white-space:nowrap"');
  html = html.replace(/<th\s+([^>]*)>/g, (m, a) => `<th ${a} style="background:#2e7d32;color:#fff;font-weight:700;padding:6px 8px;border:1px solid #1b5e20;text-align:center;white-space:nowrap">`);
  html = html.replace(/<td(?!\s)/g, '<td style="padding:4px 6px;border:1px solid #999;text-align:center;font-size:12px"');
  html = html.replace(/<td\s+([^>]*)>/g, (m, a) => `<td ${a} style="padding:4px 6px;border:1px solid #999;text-align:center;font-size:12px">`);
  // Style the total rows
  html = html.replace(/إجمالي/g, '<b style="color:#1b5e20">إجمالي</b>');
  html = html.replace(/الرصيد في الهيئة/g, '<b style="color:#1b5e20;font-size:13px">الرصيد في الهيئة</b>');
  const fullHtml = `<html dir="rtl"><head><meta charset="utf-8"><style>
    .gov-even td { background:#f9f9f9 } .gov-odd td { background:#fff }
  </style></head><body>
    <table style="width:100%;margin-bottom:10px"><tr><td style="text-align:center;font-size:18px;font-weight:700;color:#2e7d32;border:none">الرصيد الاستراتيجي</td></tr>
      <tr><td style="text-align:center;font-size:12px;color:#666;border:none">تاريخ التقرير: ${dateStr}</td></tr></table>
    ${html}
    <table style="width:100%;margin-top:12px"><tr><td style="text-align:center;font-size:11px;color:#888;border:none">إعداد و برمجة محمد ندا 01068880999</td></tr></table>
    </body></html>`;
  const blob = new Blob(['\ufeff' + fullHtml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'strategic-stock.xls'; a.click();
  URL.revokeObjectURL(url);
}

function exportStrategicPDF() {
  const wrap = document.getElementById('strategicTableWrap');
  if (!wrap) return;
  const w = window.open('', '_blank');
  if (!w) return;
  const dateStr = new Date().toLocaleDateString('ar-EG');
  const tbl = wrap.querySelector('table');
  if (!tbl) { w.close(); return; }
  let html = tbl.outerHTML;
  // Add inline styles
  html = html.replace(/<table/g, '<table style="border-collapse:collapse;width:100%;font-family:\'Segoe UI\',Arial;font-size:11px"');
  html = html.replace(/<th(?!\s)/g, '<th style="background:#2e7d32;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #1b5e20;text-align:center"');
  html = html.replace(/<th\s+([^>]*)>/g, (m, a) => `<th ${a} style="background:#2e7d32;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #1b5e20;text-align:center">`);
  html = html.replace(/<td(?!\s)/g, '<td style="padding:3px 5px;border:1px solid #ccc;text-align:center;font-size:11px"');
  html = html.replace(/<td\s+([^>]*)>/g, (m, a) => `<td ${a} style="padding:3px 5px;border:1px solid #ccc;text-align:center;font-size:11px">`);
  w.document.write(`<html dir="rtl"><head><meta charset="utf-8"><style>
    @page { size: landscape; margin: 10mm 8mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 10px; }
    .header { text-align:center; margin-bottom:10px }
    .header h2 { color:#2e7d32; margin:0 0 3px 0; font-size:16px }
    .header p { color:#666; margin:0; font-size:11px }
    table { border-collapse:collapse; width:100%; font-size:11px }
    td, th { padding:3px 5px; border:1px solid #ccc; text-align:center }
    .footer { text-align:center; margin-top:10px; font-size:10px; color:#888 }
    .blood-cell { font-weight:600 }
    .pos { color:#2e7d32 } .neg { color:#dc3545 }
  </style></head><body>
    <div class="header"><h2>الرصيد الاستراتيجي</h2><p>تاريخ التقرير: ${dateStr}</p></div>
    ${html}
    <div class="footer">إعداد و برمجة محمد ندا 01068880999</div>
    </body></html>`);
  w.document.close();
  setTimeout(() => { w.print(); w.close(); }, 600);
}

// ============== TOTAL STOCK (total STOCK Mang) ==============

async function renderTotal() {
  const el = document.getElementById('mainContent');
  const canExport = hasPerm('daily_total', 'export');
  try {
    el.innerHTML = `<div class="page-actions"><button class="btn-back" onclick="goBack()"><i class="fas fa-arrow-right"></i> الرئيسية</button>
      ${canExport ? '<button class="btn btn-success" onclick="exportTotalExcel()"><i class="fas fa-file-excel"></i> Excel</button>' : ''}
      ${canExport ? '<button class="btn btn-danger" onclick="exportTotalPDF()"><i class="fas fa-file-pdf"></i> PDF</button>' : ''}</div>
      <div class="card"><div class="card-body table-scroll"><table id="totalTable"><thead id="totalThead"></thead><tbody id="totalTbody"></tbody></table></div></div>`;
    const data = await api('GET', '/daily-reports');
    renderTotalTable(data);
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

renderTotal = renderTotal;

function renderTotalTable(data) {
  const nCols = 5 + BTYPES.length + 1 + PTYPES.length + 1 + 4;
  document.getElementById('totalThead').innerHTML = `
    <tr><th rowspan="2">الفرع</th><th rowspan="2">اسم بنك الدم</th><th rowspan="2">اليوم</th><th rowspan="2">الوقت</th><th rowspan="2">تحت فحص</th>
      <th colspan="${BTYPES.length}" class="blood-header">رصيــــــد الـــــــــــدم</th>
      <th rowspan="2" class="total-header">المجموع</th>
      <th colspan="${PTYPES.length}" class="plasma-header">رصيد البلازما المفحوص</th>
      <th rowspan="2" class="total-header">المجموع</th>
      <th rowspan="2">الصفائح</th><th rowspan="2">الكرايو</th><th rowspan="2">الترخيص</th><th rowspan="2">وضع الترخيص</th></tr>
    <tr>${BTYPES.map(t => `<th>${t}</th>`).join('')}
      ${PTYPES.map(t => `<th>${t}</th>`).join('')}</tr>`;

  const groups = {};
  data.forEach(r => {
    const g = r.governorate || 'غير محدد';
    if (!groups[g]) groups[g] = [];
    groups[g].push(r);
  });

  let tbody = '';
  Object.entries(groups).forEach(([gov, reports], govIdx) => {
    reports.forEach((r, idx) => {
      const bd = tryParse(r.blood_data) || {};
      const pd = tryParse(r.plasma_data) || {};
      const bAvail = BTYPES.map(t => calcAvail(bd, t));
      const bTotal = bAvail.reduce((s, v) => s + v, 0);
      const pAvail = PTYPES.map(t => calcAvail(pd, t));
      const pTotal = pAvail.reduce((s, v) => s + v, 0);
      tbody += `<tr class="data-row ${govIdx % 2 === 0 ? 'gov-light' : 'gov-dark'}">`;
      if (idx === 0) tbody += `<td class="gov-cell gov-${govIdx % 2 === 0 ? 'even' : 'odd'}" rowspan="${reports.length}">${gov}</td>`;
      const todayStr = new Date().toISOString().slice(0,10);
      const isOld = r.date && r.date.slice(0,10) !== todayStr;
      const dateStyle = isOld ? ' style="color:red;font-weight:700"' : '';
      const timeStyle = isOld ? ' style="font-weight:700"' : '';
      tbody += `<td class="hosp-name">${r.hospital_name || ''}</td><td class="date-cell"${dateStyle}>${r.date ? r.date.slice(5) : ''}</td><td${timeStyle}>${r.time || ''}</td><td>${r.under_inspection || 0}</td>`;
      bAvail.forEach(v => tbody += `<td class="avail-cell">${v}</td>`);
      tbody += `<td class="total-cell">${bTotal}</td>`;
      pAvail.forEach(v => tbody += `<td class="avail-cell">${v}</td>`);
      tbody += `<td class="total-cell">${pTotal}</td>`;
      tbody += `<td>${r.platelets || 0}</td><td>${r.cryo || 0}</td><td>${r.license_type || ''}</td><td>${r.license_status || ''}</td></tr>`;
    });
  });

  if (!tbody) tbody = `<tr><td colspan="${nCols}" class="empty-msg">لا توجد بيانات</td></tr>`;
  document.getElementById('totalTbody').innerHTML = tbody;
}

function exportTotalExcel() {
  const table = document.getElementById('totalTable');
  if (!table) return;
  const dateStr = new Date().toLocaleDateString('ar-EG');
  let html = table.outerHTML;
  html = html.replace(/<table/g, '<table style="border-collapse:collapse;width:100%;font-family:\'Segoe UI\',Arial;font-size:11px"');
  html = html.replace(/<th(?!\s)/g, '<th style="background:#2e7d32;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #1b5e20;text-align:center;white-space:nowrap"');
  html = html.replace(/<th\s+([^>]*)>/g, (m, a) => `<th ${a} style="background:#2e7d32;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #1b5e20;text-align:center;white-space:nowrap">`);
  html = html.replace(/<td(?!\s)/g, '<td style="padding:3px 5px;border:1px solid #999;text-align:center"');
  html = html.replace(/<td\s+([^>]*)>/g, (m, a) => `<td ${a} style="padding:3px 5px;border:1px solid #999;text-align:center">`);
  const full = `<html dir="rtl"><head><meta charset="utf-8"></head><body>
    <table style="width:100%;margin-bottom:8px"><tr><td style="text-align:center;font-size:16px;font-weight:700;color:#2e7d32;border:none">إجمالي الرصيد ببنوك الدم</td></tr>
      <tr><td style="text-align:center;font-size:11px;color:#666;border:none">تاريخ التقرير: ${dateStr}</td></tr></table>
    ${html}
    <table style="width:100%;margin-top:10px"><tr><td style="text-align:center;font-size:10px;color:#888;border:none">إعداد و برمجة محمد ندا 01068880999</td></tr></table></body></html>`;
  const blob = new Blob(['\ufeff' + full], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'total-stock.xls'; a.click();
  URL.revokeObjectURL(url);
}

function exportTotalPDF() {
  const table = document.getElementById('totalTable');
  if (!table) return;
  const dateStr = new Date().toLocaleDateString('ar-EG');
  let html = table.outerHTML;
  html = html.replace(/<table/g, '<table style="border-collapse:collapse;width:100%;font-family:\'Segoe UI\',Arial;font-size:10px"');
  html = html.replace(/<th(?!\s)/g, '<th style="background:#2e7d32;color:#fff;font-weight:700;padding:4px 6px;border:1px solid #1b5e20;text-align:center;white-space:nowrap"');
  html = html.replace(/<th\s+([^>]*)>/g, (m, a) => `<th ${a} style="background:#2e7d32;color:#fff;font-weight:700;padding:4px 6px;border:1px solid #1b5e20;text-align:center;white-space:nowrap">`);
  html = html.replace(/<td(?!\s)/g, '<td style="padding:3px 4px;border:1px solid #ccc;text-align:center;font-size:10px"');
  html = html.replace(/<td\s+([^>]*)>/g, (m, a) => `<td ${a} style="padding:3px 4px;border:1px solid #ccc;text-align:center;font-size:10px">`);
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`<html dir="rtl"><head><meta charset="utf-8"><title>إجمالي الرصيد</title>
    <style>
      @page { size: landscape; margin: 8mm 6mm; }
      body { font-family: 'Segoe UI', Arial, sans-serif; padding: 8px; }
      .header { text-align:center; margin-bottom:8px }
      .header h2 { color:#2e7d32; margin:0 0 2px; font-size:15px }
      .header p { color:#666; margin:0; font-size:10px }
      .footer { text-align:center; margin-top:10px; font-size:10px; color:#888 }
      @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style></head><body>
    <div class="header"><h2>إجمالي الرصيد ببنوك الدم</h2><p>تاريخ التقرير: ${dateStr}</p></div>
    ${html}
    <div class="footer">إعداد و برمجة محمد ندا 01068880999</div>
    <script>window.print();window.close();</scr` + `ipt></body></html>`);
  win.document.close();
}

// ============== DAILY STATEMENT (بيان يومى) ==============

async function renderDailyStatement() {
  const el = document.getElementById('mainContent');
  const canExport = hasPerm('daily_statement', 'export');
  const prevId = document.getElementById('stmtHospital')?.value || '';
  try {
    const [hospitals, data] = await Promise.all([
      api('GET', '/hospitals'),
      api('GET', '/daily-reports')
    ]);
    el.innerHTML = `
      <div style="margin-bottom:16px"><button class="btn-back" onclick="goBack()"><i class="fas fa-arrow-right"></i> الرئيسية</button>
        ${canExport ? '<button class="btn btn-danger" onclick="printStatement()"><i class="fas fa-print"></i> طباعة</button>' : ''}</div>
      <div class="page-actions">
        <select class="search-input" id="stmtHospital" onchange="renderDailyStatement()">
          ${hospitals.map(h => `<option value="${h.id}" ${String(h.id) === prevId ? 'selected' : ''}>${h.name}</option>`).join('')}
        </select>
      </div>
      <div class="card"><div class="card-body table-scroll" id="stmtReport"></div></div>`;
    renderStatementReport(data, hospitals);
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

function renderStatementReport(data, hospitals) {
  const hId = parseInt(document.getElementById('stmtHospital').value);
  const hosp = hospitals.find(h => h.id === hId);
  if (!hosp) { document.getElementById('stmtReport').innerHTML = '<div class="empty-msg">اختر المستشفى</div>'; return; }
  const report = data.find(r => r.hospital_id === hId);
  if (!report) { document.getElementById('stmtReport').innerHTML = '<div class="empty-msg">لا يوجد تقرير لهذا المستشفى</div>'; return; }
  const bd = tryParse(report.blood_data) || {};
  const pd = tryParse(report.plasma_data) || {};
  const pdData = tryParse(report.plat_data) || {};
  const reportDate = report.date || new Date().toISOString().split('T')[0];
  const dayNames = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const d = new Date(reportDate);
  const dayName = dayNames[d.getDay()];
  const [y, m, dd] = reportDate.split('-');
  const canEdit = hasPerm('daily_stock', 'edit');

  const rows = [
    { label: 'الرصيد السابق', key: 'previous' },
    { label: 'الوارد', key: 'incoming' },
    { label: 'المنصرف', key: 'outgoing' },
    { label: 'الاعدام', key: 'disposal' },
    { label: 'الرصيد المتاح', key: 'available' }
  ];

  function getPlat(cat, pkey) { return (pdData[cat] && pdData[cat][pkey]) || 0; }

  function calcPlatAvail(pkey) {
    return getPlat('previous', pkey) + getPlat('incoming', pkey) - getPlat('outgoing', pkey) - getPlat('disposal', pkey);
  }

  let html = `
    <div class="stmt-header">
      <div class="stmt-title">البيان اليومي</div>
      <div><strong>المستشفى</strong> ${hosp.name}</div>
      <div><strong>عن يوم</strong> ${dd} ${dayName} ${m} ${y} الموافق ${reportDate} الساعة ${report.time || ''}</div>
    </div>
    <table class="stmt-table" id="stmtReportTable">
      <thead>
        <tr>
          <th rowspan="2">البيان</th>
          <th colspan="9">الدم</th>
          <th colspan="5">البلازما</th>
          <th colspan="5">الصفائح الدموية</th>
          <th rowspan="2">CRYO</th>
        </tr>
        <tr>
          ${BTYPES.map(t => `<th>${t}</th>`).join('')}<th>مجموع</th>
          ${PTYPES.map(t => `<th>${t}</th>`).join('')}<th>مجموع</th>
          ${PTYPES.map(t => `<th>${t}</th>`).join('')}<th>مجموع</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => {
          const isAvail = r.key === 'available';
          const bloodVals = BTYPES.map(t => isAvail ? calcAvail(bd, t) : ((bd[t] && bd[t][r.key]) || 0));
          const bloodTotal = bloodVals.reduce((s, v) => s + v, 0);
          const plasmaVals = PTYPES.map(t => isAvail ? calcAvail(pd, t) : ((pd[t] && pd[t][r.key]) || 0));
          const plasmaTotal = plasmaVals.reduce((s, v) => s + v, 0);
          const platA = isAvail ? Math.max(0, calcPlatAvail('A')) : getPlat(r.key, 'A');
          const platB = isAvail ? Math.max(0, calcPlatAvail('B')) : getPlat(r.key, 'B');
          const platO = isAvail ? Math.max(0, calcPlatAvail('O')) : getPlat(r.key, 'O');
          const platAB = isAvail ? Math.max(0, calcPlatAvail('AB')) : getPlat(r.key, 'AB');
          const pTotal = platA + platB + platO + platAB;
          const cryoVal = isAvail ? (report.cryo || 0) : 0;
          const editable = canEdit && !isAvail;
          return `<tr class="${isAvail ? 'avail-row' : ''}">
            <td class="stmt-label">${r.label}</td>
            ${bloodVals.map(v => `<td>${v}</td>`).join('')}<td class="total-cell">${bloodTotal}</td>
            ${plasmaVals.map(v => `<td>${v}</td>`).join('')}<td class="total-cell">${plasmaTotal}</td>
            <td data-rid="${report.id}" data-cat="${r.key}" data-pkey="A" class="${editable ? 'plat-editable' : ''}">${platA}</td>
            <td data-rid="${report.id}" data-cat="${r.key}" data-pkey="B" class="${editable ? 'plat-editable' : ''}">${platB}</td>
            <td data-rid="${report.id}" data-cat="${r.key}" data-pkey="O" class="${editable ? 'plat-editable' : ''}">${platO}</td>
            <td data-rid="${report.id}" data-cat="${r.key}" data-pkey="AB" class="${editable ? 'plat-editable' : ''}">${platAB}</td>
            <td class="total-cell plat-total" data-cat="${r.key}">${pTotal}</td>
            <td class="${canEdit && isAvail ? 'cryo-editable' : ''}" data-rid="${report.id}" data-pkey="cryo">${cryoVal}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
  document.getElementById('stmtReport').innerHTML = html;

  if (canEdit) {
    document.getElementById('stmtReportTable').onclick = function(e) {
      const td = e.target.closest('td.plat-editable, td.cryo-editable');
      if (!td) return;
      if (td.contentEditable === 'true') return;
      const orig = td.textContent.trim();
      td.contentEditable = true;
      td.focus();
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(td);
      sel.removeAllRanges();
      sel.addRange(range);
      const finish = () => {
        td.contentEditable = false;
        const newVal = parseInt(td.textContent.trim()) || 0;
        td.textContent = newVal;
        td.classList.add('plat-editable', 'cryo-editable');
        const row = td.closest('tr');
        const cat = td.dataset.cat;
        if (cat) {
          const cells = row.querySelectorAll(`.plat-editable[data-cat="${cat}"]`);
          let sum = 0;
          cells.forEach(c => { sum += parseInt(c.textContent.trim()) || 0; });
          row.querySelector(`.plat-total[data-cat="${cat}"]`).textContent = sum;
        }
        saveStatementPlat(report.id);
      };
      td.onblur = finish;
      td.onkeydown = function(ev) {
        if (ev.key === 'Enter') { ev.preventDefault(); td.blur(); }
        if (ev.key === 'Escape') { td.textContent = orig; td.contentEditable = false; td.classList.add('plat-editable', 'cryo-editable'); }
      };
    };
  }
}

async function saveStatementPlat(rid) {
  const table = document.getElementById('stmtReportTable');
  if (!table) return;
  const rows = table.querySelectorAll('tbody tr');
  const platData = {};
  rows.forEach(row => {
    const cat = row.querySelector('.plat-editable')?.dataset.cat;
    if (!cat) return;
    const cells = row.querySelectorAll(`.plat-editable[data-cat="${cat}"]`);
    const obj = {};
    cells.forEach(c => { obj[c.dataset.pkey] = parseInt(c.textContent.trim()) || 0; });
    platData[cat] = obj;
  });
  const cryo = parseInt(table.querySelector('.cryo-editable')?.textContent.trim()) || 0;
  try {
    await api('PUT', '/daily-reports/' + rid, { platData, cryo });
  } catch(e) { alert(e.message); }
}

function printStatement() {
  const table = document.getElementById('stmtReportTable');
  const header = document.querySelector('.stmt-header');
  if (!table) return;
  const win = window.open('', '_blank');
  win.document.write(`
    <html dir="rtl"><head><title>بيان يومي</title>
    <style>
      body { font-family: Tahoma, Arial, sans-serif; padding: 20px; }
      .stmt-header { margin-bottom: 15px; font-size: 14px; line-height: 2; }
      .stmt-header div { margin-bottom: 5px; }
      table { border-collapse: collapse; width: 100%; font-size: 11px; }
      th, td { border: 1px solid #333; padding: 5px 7px; text-align: center; }
      th { background: #4472C4; color: #fff; font-weight: 700; font-size: 10px; }
      tr:nth-child(2) th { background: #5B9BD5; }
      .total-cell { font-weight: 700; background: #fff3cd !important; }
      .avail-row td { background: #e8f5e9 !important; font-weight: 600; }
      .stmt-label { font-weight: 700; text-align: right; min-width: 90px; background: #f8f9fa !important; }
      .signature { text-align: center; font-size: 11px; color: #555; margin-top: 20px; }
      @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style></head><body>
    ${header ? header.outerHTML : ''}
    ${table.outerHTML}
    <div class="signature">إعداد و برمجة محمد ندا 01068880999</div>
    <script>window.print();window.close();</scr` + `ipt></body></html>`);
  win.document.close();
}

// ============== BRANCH STATEMENT (بيان الفرع) ==============

async function renderBranchStatement() {
  const el = document.getElementById('mainContent');
  try {
    const me = (await api('GET', '/me')).user;
    const isMaster = me.id === 1;
    let gov = me.governorate;
    if (!gov && !isMaster) { el.innerHTML = '<div class="empty-msg">لا توجد فرع مرتبطة بحسابك</div>'; return; }

    // Check if dropdown already exists (master switching governorates)
    const existingSel = document.getElementById('branchGovSelect');
    if (existingSel) { gov = existingSel.value; }
    else if (!gov && isMaster) {
      const govs = await api('GET', '/governorates');
      const arr = Array.isArray(govs) ? govs : [];
      if (!arr.length) { el.innerHTML = `<div class="page-actions"><button class="btn-back" onclick="goBack()"><i class="fas fa-arrow-right"></i> الرئيسية</button></div><div class="empty-msg">لا توجد محافظات</div>`; return; }
      gov = arr[0];
      el.innerHTML = `<div class="page-actions"><button class="btn-back" onclick="goBack()"><i class="fas fa-arrow-right"></i> الرئيسية</button>
        <div style="display:inline-block;margin-right:10px"><select class="form-control" id="branchGovSelect" style="display:inline-block;width:auto" onchange="renderBranchStatement()">${arr.map(g => `<option value="${g}" ${g===gov?'selected':''}>${g}</option>`).join('')}</select></div></div>
        <div class="branch-stmt-report" id="branchStmtReport"></div>`;
    } else if (!existingSel) {
      el.innerHTML = `<div class="page-actions"><button class="btn-back" onclick="goBack()"><i class="fas fa-arrow-right"></i> الرئيسية</button></div>
        <div class="branch-stmt-report" id="branchStmtReport"></div>`;
    }
    const reports = await api('GET', '/daily-reports');
    const govHospIds = [...new Set(reports.filter(r => r.governorate === gov).map(r => r.hospital_id))];
    if (!govHospIds.length) { document.getElementById('branchStmtReport').innerHTML = `<div class="empty-msg">لا توجد تقارير للفرع: ${gov}</div>`; return; }
    const now = new Date();
    const dayNames = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    const dd = now.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
    const dayName = dayNames[now.getDay()];
    const period = now.getHours() < 12 ? 'الصباحية' : 'المسائية';

    const grouped = {};
    govHospIds.forEach(hid => {
      const hr = reports.filter(r => r.hospital_id === hid).sort((a, b) => new Date(b.date) - new Date(a.date));
      if (hr.length) grouped[hid] = hr[0];
    });

    let html = `<div class="stmt-header">
      <div class="stmt-title">بيان بنوك الدم عن فرع ${gov}</div>
      <div>${dayName} الموافق ${dd} الفترة ${period}</div>
    </div>
    <table class="stmt-table">
      <thead>
        <tr>
          <th rowspan="2">اسم بنك الدم</th>
          <th rowspan="2">نوع المشتق</th>
          ${BTYPES.map(t => `<th>${t}</th>`).join('')}
          <th rowspan="2">الاجمالي</th>
          <th rowspan="2">المنصرف</th>
          <th colspan="2">اخر تحديث</th>
        </tr>
        <tr>
          <th colspan="8"></th>
          <th>اليوم</th><th>الوقت</th>
        </tr>
      </thead>
      <tbody>`;
    let grandBTotal = 0, grandPTotal = 0, grandBDisp = 0, grandPDisp = 0;
    let grandBVals = {}; BTYPES.forEach(t => grandBVals[t] = 0);
    let grandPVals = {}; PTYPES.forEach(t => grandPVals[t] = 0);
    Object.entries(grouped).forEach(([hid, r]) => {
      const bd = tryParse(r.blood_data) || {};
      const pd = tryParse(r.plasma_data) || {};
      const bVals = BTYPES.map(t => { const v = calcAvail(bd, t); grandBVals[t] += v; return v; });
      const pVals = PTYPES.map(t => { const v = calcAvail(pd, t); grandPVals[t] += v; return v; });
      const bSum = bVals.reduce((s, v) => s + v, 0);
      const pSum = pVals.reduce((s, v) => s + v, 0);
      const bOut = BTYPES.reduce((s, t) => s + ((bd[t]?.outgoing || 0)), 0);
      const pOut = PTYPES.reduce((s, t) => s + ((pd[t]?.outgoing || 0)), 0);
      grandBTotal += bSum; grandPTotal += pSum;
      grandBDisp += bOut; grandPDisp += pOut;
      const dateParts = r.date ? r.date.split('-') : [];
      const d = dateParts.length >= 3 ? `${dateParts[2]}-${dateParts[1]}` : (r.date || '');
      const todayStr = new Date().toISOString().slice(0,10);
      const isOld = r.date && r.date.slice(0,10) !== todayStr;
      const dtStyle = isOld ? ' style="color:red;font-weight:700"' : '';
      const tmStyle = isOld ? ' style="font-weight:700"' : '';
      html += `<tr>
        <td rowspan="2">${r.hospital_name || ''}</td>
        <td class="deriv-label">الدم</td>
        ${bVals.map(v => `<td>${v}</td>`).join('')}
        <td class="total-cell">${bSum}</td><td>${bOut}</td>
        <td rowspan="2"${dtStyle}>${d}</td><td rowspan="2"${tmStyle}>${r.time || ''}</td>
      </tr>
      <tr>
        <td class="deriv-label">البلازما</td>
        ${pVals.map(v => `<td colspan="2">${v}</td>`).join('')}
        <td class="total-cell">${pSum}</td><td>${pOut}</td>
      </tr>`;
    });
    html += `<tr class="avail-row">
      <td>الاجمالي</td>
      <td class="deriv-label">الدم</td>
      ${BTYPES.map(t => `<td>${grandBVals[t]}</td>`).join('')}
      <td class="total-cell">${grandBTotal}</td><td>${grandBDisp}</td><td></td><td></td>
    </tr>
    <tr class="avail-row">
      <td></td>
      <td class="deriv-label">البلازما</td>
      ${PTYPES.map(t => `<td colspan="2">${grandPVals[t]}</td>`).join('')}
      <td class="total-cell">${grandPTotal}</td><td>${grandPDisp}</td><td></td><td></td>
    </tr>`;
    html += '</tbody></table>';
    document.getElementById('branchStmtReport').innerHTML = html;
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

// ============== OTHER PAGES (read-only) ==============

async function renderMonthlyStorage() {
  const el = document.getElementById('mainContent');
  try {
    el.innerHTML = `<div class="page-actions"><button class="btn-back" onclick="goBack()"><i class="fas fa-arrow-right"></i> الرئيسية</button></div>
      <div class="card"><div class="card-body table-scroll"><table class="data-table"><thead><tr><th>#</th><th>المستشفى</th><th>السنة</th><th>الشهر</th></tr></thead><tbody id="msBody"></tbody></table></div></div>`;
    const items = await api('GET', '/monthly-storage');
    document.getElementById('msBody').innerHTML = items.map((r, i) => `<tr><td>${i+1}</td><td>${r.hospital_name || ''}</td><td>${r.year}</td><td>${r.month}</td></tr>`).join('');
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

async function renderMonthlyAggregate() {
  const el = document.getElementById('mainContent');
  try {
    el.innerHTML = `<div class="page-actions"><button class="btn-back" onclick="goBack()"><i class="fas fa-arrow-right"></i> الرئيسية</button></div>
      <div class="card"><div class="card-body table-scroll"><table class="data-table"><thead><tr><th>#</th><th>المستشفى</th><th>السنة</th><th>الشهر</th></tr></thead><tbody id="maBody"></tbody></table></div></div>`;
    const items = await api('GET', '/monthly-aggregate');
    document.getElementById('maBody').innerHTML = items.map((r, i) => `<tr><td>${i+1}</td><td>${r.hospital_name || ''}</td><td>${r.year}</td><td>${r.month}</td></tr>`).join('');
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

async function renderConsumption() {
  const el = document.getElementById('mainContent');
  try {
    el.innerHTML = `<div class="page-actions"><button class="btn-back" onclick="goBack()"><i class="fas fa-arrow-right"></i> الرئيسية</button></div>
      <div class="card"><div class="card-body table-scroll"><table class="data-table"><thead><tr><th>#</th><th>المستشفى</th><th>السنة</th><th>الشهر</th><th>فصيلة</th><th>الكمية</th></tr></thead><tbody id="consBody"></tbody></table></div></div>`;
    const items = await api('GET', '/consumption');
    document.getElementById('consBody').innerHTML = items.map((r, i) => `<tr><td>${i+1}</td><td>${r.hospital_name || ''}</td><td>${r.year}</td><td>${r.month}</td><td>${r.blood_type}</td><td>${r.quantity}</td></tr>`).join('');
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

async function renderBloodConsumption() {
  const el = document.getElementById('mainContent');
  try {
    const me = await api('GET', '/me');
    const user = me.user;
    const hospitals = await api('GET', '/hospitals');
    const months = ['يناير','فبراير','مارس','ابريل','مايو','يونيو','يوليو','اغسطس','سبتمبر','اكتوبر','نوفمبر','ديسمبر'];
    const canEdit = hasPerm('monthly_consumption', 'add');
    const canDelete = hasPerm('monthly_consumption', 'delete');
    const isHospital = user.role === 'hospital';
    const isBranchSup = user.role === 'branch_supervisor';

    let filteredHospitals = hospitals;
    if (isHospital) filteredHospitals = hospitals.filter(h => h.id === user.hospitalId);
    else if (isBranchSup) filteredHospitals = hospitals.filter(h => h.governorate === user.governorate);

    el.innerHTML = `<div class="page-actions"><button class="btn-back" onclick="goBack()"><i class="fas fa-arrow-right"></i> الرئيسية</button>
    </div>`;

    if (canEdit) {
      const year = 2026;
      el.innerHTML += `<div class="card" style="margin-bottom:16px;border-right:4px solid #e91e63">
        <div class="card-header" style="padding:10px 16px"><strong><i class="fas fa-edit"></i> إدخال منصرف فصائل الدم</strong></div>
        <div class="card-body" style="padding:10px 16px">
          <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end">
            <div class="form-group"><label>السنة</label>
              <select class="form-control" id="bcYear" style="width:100px" onchange="loadExistingConsumption()">${[2026,2025,2024,2023,2022].map(y => `<option value="${y}" ${y===year?'selected':''}>${y}</option>`).join('')}</select></div>
            <div class="form-group"><label>الشهر</label>
              <select class="form-control" id="bcMonth" style="width:120px" onchange="loadExistingConsumption()">${months.map((m,i) => `<option value="${i+1}">${m}</option>`).join('')}</select></div>
            ${isHospital 
              ? `<div class="form-group" style="min-width:200px"><label>بنك الدم</label><div style="padding:6px 0;font-weight:600">${user.name}</div></div>`
              : `<div class="form-group" style="flex:1;min-width:200px"><label>بنك الدم</label>
                  <select class="form-control" id="bcHosp" onchange="loadExistingConsumption()">${filteredHospitals.map(h => `<option value="${h.id}">${h.name}</option>`).join('')}</select></div>`
            }
            ${['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(t => 
              `<div style="width:65px"><label style="font-size:11px;font-weight:600">${t}</label>
              <input class="form-control bc-inp" id="bc${t.replace('+','P').replace('-','N')}" type="number" style="height:32px;font-size:12px;text-align:center"></div>`
            ).join('')}
            <button class="btn btn-primary" onclick="saveBloodConsumption()" style="height:32px"><i class="fas fa-save"></i> حفظ</button>
          </div>
        </div>
      </div>`;
    }

    el.innerHTML += `<div class="card"><div class="card-body table-scroll">
      <table class="data-table consumption-table"><thead>
        <tr><th colspan="14" style="text-align:center;background:#e91e63;color:#fff;font-size:14px">معدل إستهلاك الفصائل ببنوك دم هيئة الرعاية الصحية</th></tr>
        <tr><th>الفرع</th><th>اسم بنك الدم</th><th>الشهر</th>
          ${['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(t => `<th>${t}</th>`).join('')}
          <th>المجموع</th>${canDelete ? '<th></th>' : ''}</tr>
      </thead><tbody id="bcBody"></tbody></table>
    </div></div>`;

    const items = await api('GET', '/monthly-consumption');
    window._bcItems = items;
    window._bcArchiveItems = await api('GET', '/archive');
    window._bcMe = me;
    // Auto-load existing data when form first appears
    setTimeout(loadExistingConsumption, 50);
    const body = document.getElementById('bcBody');
    if (items.length === 0) {
      body.innerHTML = '<tr><td colspan="' + (canDelete ? 14 : 13) + '" class="empty-msg">لا توجد بيانات</td></tr>';
    } else {
      body.innerHTML = items.map(r => {
        const bt = (typeof r.blood_types === 'string' ? tryParse(r.blood_types) : r.blood_types) || {};
        const total = Object.values(bt).reduce((s, v) => s + (parseInt(v) || 0), 0);
        return `<tr>
          <td style="text-align:right;font-weight:600">${r.governorate || ''}</td>
          <td style="text-align:right">${r.hospital_name || ''}</td>
          <td>${months[(r.month||1)-1]} ${r.year||''}</td>
          ${['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(t => `<td style="text-align:center">${bt[t] || 0}</td>`).join('')}
          <td style="text-align:center;font-weight:bold">${total}</td>
          ${canDelete ? `<td><button class="btn btn-sm btn-outline" onclick="deleteBloodConsumption(${r.id})" style="color:#dc3545"><i class="fas fa-trash"></i></button></td>` : ''}
        </tr>`;
      }).join('');
    }
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

function loadExistingConsumption() {
  const hospEl = document.getElementById('bcHosp');
  const me = window._bcMe;
  const hospitalId = hospEl ? parseInt(hospEl.value) : (me ? me.user.hospitalId : 0);
  const year = parseInt(document.getElementById('bcYear').value);
  const month = parseInt(document.getElementById('bcMonth').value);
  const items = window._bcItems || [];
  let record = items.find(r => r.hospital_id === hospitalId && r.year === year && r.month === month);
  let fromArchive = false;
  let archiveId = null;
  if (!record) {
    const archItems = window._bcArchiveItems || [];
    for (const arch of archItems) {
      if (arch.type !== 'منصرف فصائل الدم') continue;
      const data = (typeof arch.data === 'string' ? tryParse(arch.data) : arch.data) || [];
      record = data.find(r => r.hospital_id === hospitalId && r.year === year && r.month === month);
      if (record) {
        fromArchive = true;
        archiveId = arch.id;
        // Add archiveId to record for editing
        record._archiveId = archiveId;
        break;
      }
    }
  }
  window._bcEditingRecord = record ? { record, fromArchive } : null;
  const bt = record ? ((typeof record.blood_types === 'string' ? tryParse(record.blood_types) : record.blood_types) || {}) : {};
  ['A+','A-','B+','B-','O+','O-','AB+','AB-'].forEach(t => {
    const el = document.getElementById('bc' + t.replace('+','P').replace('-','N'));
    if (el) el.value = bt[t] || 0;
  });
  // Update save button to reflect edit mode
  const saveBtn = document.querySelector('button[onclick="saveBloodConsumption()"]');
  if (saveBtn) {
    if (record) {
      saveBtn.innerHTML = '<i class="fas fa-edit"></i> تعديل';
      saveBtn.className = 'btn btn-warning';
    } else {
      saveBtn.innerHTML = '<i class="fas fa-save"></i> حفظ';
      saveBtn.className = 'btn btn-primary';
    }
  }
}

async function saveBloodConsumption() {
  const me = await api('GET', '/me');
  const hospEl = document.getElementById('bcHosp');
  const hospitalId = hospEl ? parseInt(hospEl.value) : me.user.hospitalId;
  const year = parseInt(document.getElementById('bcYear').value);
  const month = parseInt(document.getElementById('bcMonth').value);
  const bloodTypes = {};
  ['A+','A-','B+','B-','O+','O-','AB+','AB-'].forEach(t => {
    bloodTypes[t] = parseInt(document.getElementById('bc' + t.replace('+','P').replace('-','N')).value) || 0;
  });
  try {
    const editing = window._bcEditingRecord;
    if (editing && editing.fromArchive) {
      const arc = editing.record;
      // Fetch the archive row to get full data array
      const archItems = await api('GET', '/archive');
      const arch = archItems.find(a => a.id === arc._archiveId);
      if (arch) {
        let data = (typeof arch.data === 'string' ? tryParse(arch.data) : arch.data) || [];
        const idx = data.findIndex(r => r.hospital_id === hospitalId && r.year === year && r.month === month);
        if (idx >= 0) {
          data[idx].blood_types = bloodTypes;
          await api('PUT', '/archive/' + arc._archiveId, { data });
          showToast('✅ تم تعديل البيانات بنجاح');
          renderBloodConsumption();
          return;
        }
      }
    }
    // Check if record already exists for same hospital/month/year in current table
    const existing = window._bcItems || [];
    const dup = existing.find(r => r.hospital_id === hospitalId && r.year === year && r.month === month);
    if (dup && !confirm('⚠ تم إدخال بيانات هذا الشهر مسبقاً!\n\nهل تريد تعديل البيانات؟ اضغط OK للتعديل، أو إلغاء للرجوع.')) return;
    await api('POST', '/monthly-consumption', { hospitalId, year, month, bloodTypes });
    showToast(dup ? '✅ تم تعديل البيانات بنجاح' : '✅ تم حفظ البيانات بنجاح');
    renderBloodConsumption();
  } catch (e) { alert(e.message); }
}

async function deleteBloodConsumption(id) {
  if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
  try { await api('DELETE', '/monthly-consumption/' + id); renderBloodConsumption(); }
  catch (e) { alert(e.message); }
}

const MONTHS_AR = ['يناير','فبراير','مارس','ابريل','مايو','يونيو','يوليو','اغسطس','سبتمبر','اكتوبر','نوفمبر','ديسمبر'];

async function renderEmployeeStatement() {
  const el = document.getElementById('mainContent');
  const canAdd = hasPerm('employees', 'add');
  const canEdit = hasPerm('employees', 'edit');
  const canDelete = hasPerm('employees', 'delete');
  el.innerHTML = `<div class="page-actions"><button class="btn-back" onclick="goBack()"><i class="fas fa-arrow-right"></i> رجوع</button>
    ${canAdd ? `<button class="btn btn-info" onclick="empShowAddModal()" style="height:32px"><i class="fas fa-plus"></i> إضافة موظف</button>` : ''}
    <button class="btn btn-primary" onclick="printEmployeeTable()" style="height:32px"><i class="fas fa-print"></i> طباعة / PDF</button>
    <button class="btn btn-success" onclick="exportEmployeeExcel()" style="height:32px"><i class="fas fa-file-excel"></i> تحميل Excel</button>
    ${window.me?.user?.role === 'hospital' ? `<button class="btn btn-warning" id="empReviewBtn" onclick="markEmployeeMonthReview()" style="height:32px;background:#17a2b8;color:#fff"><i class="fas fa-check-circle"></i> تمت المراجعه</button>` : ''}
  </div>
  <div class="page-title"><i class="fas fa-users" style="color:#795548"></i> بيان العاملين</div>
  <div id="empReviewStatus" style="margin-bottom:8px"></div>
  <div id="empLoading" style="text-align:center;padding:40px;color:#999"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>
  <div id="empContent"></div>`;
  try {
    const res = await api('GET', '/employee-statements');
    let { rows: data, hospitalStatus } = res;
    const userHospitalId = window.me?.user?.hospitalId;
    // If hospital role, filter to their own hospital
    if (window.me?.user?.role === 'hospital') {
      data = data.filter(d => d.hospital_id === userHospitalId);
      hospitalStatus = hospitalStatus.filter(h => h.id === userHospitalId);
    }
    if (window.me?.user?.role === 'branch_supervisor' && window.me?.user?.governorate) {
      const gov = window.me.user.governorate;
      data = data.filter(d => d.governorate === gov);
      hospitalStatus = hospitalStatus.filter(h => h.governorate === gov);
    }
    // Check monthly updates
    const now = new Date();
    const curMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const overdueHospitals = hospitalStatus.filter(h => h.employeeCount > 0 && (!h.lastUpdate || new Date(h.lastUpdate) < curMonthStart));
    // Scan for missing data in existing records (all fields)
    const missingFieldDefs = ['الفرع','بنك الدم','الاسم','الفئه','التصنيف','الرقم القومي','التليفون','البريد'];
    const missingFields = {};
    missingFieldDefs.forEach(f => missingFields[f] = 0);
    const missingFieldMap = { 'الفرع': d => !d.governorate, 'بنك الدم': d => !d.hospital_name, 'الاسم': d => !d.employee, 'الفئه': d => !d.category, 'التصنيف': d => !d.classification, 'الرقم القومي': d => !d.national_id, 'التليفون': d => !d.phone, 'البريد': d => !d.email };
    data.forEach(d => { Object.entries(missingFieldMap).forEach(([field, check]) => { if (check(d)) missingFields[field]++; }); });
    const totalMissing = Object.values(missingFields).reduce((a,b)=>a+b, 0);
    const hasMissingData = Object.values(missingFields).some(c => c > 0);
    // Build stats
    const cats = {}; data.forEach(d => { cats[d.category] = (cats[d.category] || 0) + 1; });
    const catsSorted = Object.entries(cats).sort((a,b) => b[1] - a[1]);
    const classes = {}; data.forEach(d => { classes[d.classification] = (classes[d.classification] || 0) + 1; });
    const govs = [...new Set(data.map(d => d.governorate))].sort();
    const hospNames = [...new Set(data.map(d => d.hospital_name))].sort();
    const allCats = [...new Set(data.map(d => d.category))].sort();
    const allClasses = [...new Set(data.map(d => d.classification))].sort();
    const hospGovMap = {}; data.forEach(d => { if (d.hospital_name) hospGovMap[d.hospital_name] = d.governorate; });
    
    // Get branch supervisors from employee records where category = مشرف فرع
    const branchSupervisors = data.filter(d => d.category === 'مشرف فرع');
    // Missing data for supervisors
    const branchSupMissingFieldsList = [{field:'governorate',label:'الفرع'},{field:'employee',label:'الاسم'},{field:'classification',label:'التصنيف'},{field:'category',label:'الفئه'},{field:'national_id',label:'الرقم القومي'},{field:'phone',label:'التليفون'},{field:'email',label:'البريد'}];
    const branchSupMissingFields = {};
    branchSupMissingFieldsList.forEach(f => branchSupMissingFields[f.label] = 0);
    branchSupervisors.forEach(s => { branchSupMissingFieldsList.forEach(f => { if (!s[f.field]) branchSupMissingFields[f.label]++; }); });
    const branchSupHasMissingData = Object.values(branchSupMissingFields).some(c => c > 0);
    const branchSupMissingData = branchSupHasMissingData;
const branchSupMissingRecords = branchSupHasMissingData ? branchSupervisors.filter(s => branchSupMissingFieldsList.some(f => !s[f.field])) : [];
    
    let html = '';
    if (overdueHospitals.length > 0) {
      const isMyHospital = window.me?.user?.role === 'hospital' && overdueHospitals.length === 1 && overdueHospitals[0].id === window.me?.user?.hospitalId;
      html += `<div class="card" style="margin-bottom:8px;border-right:5px solid #dc3545;background:#fff5f5">
        <div class="card-body" style="padding:12px 16px;font-size:14px;color:#b71c1c">
          <i class="fas fa-exclamation-triangle" style="font-size:18px;margin-left:8px"></i>
          <strong>${isMyHospital ? 'مطلوب تحديث بيانات العاملين لهذا الشهر' : 'تنبيه: لم يتم تحديث بيان العاملين لـ ' + overdueHospitals.length + ' بنك دم هذا الشهر'}</strong>
          ${isMyHospital ? '<div style="margin-top:6px;font-size:13px;color:#c62828">يرجى التأكد من إضافة أو تعديل بيانات العاملين لديك لهذا الشهر</div>'
            : `<div style="margin-top:4px;font-size:12px;color:#c62828;line-height:1.6">${overdueHospitals.map(h => '🔴 ' + h.name).join('<br>')}</div>`}
        </div>
      </div>`;
    }
    if (hasMissingData) {
      const lines = Object.entries(missingFields).filter(([,c]) => c > 0).map(([f,c]) => `${f}: ${c}`).join(' | ');
      const missingRecords = data.filter(d => missingFieldDefs.some(f => missingFieldMap[f](d)));
      const allFields = ['governorate','hospital_name','employee','category','classification','national_id','phone','email'];
      const fieldLabels = ['الفرع','بنك الدم','الاسم','الفئه','التصنيف','الرقم القومي','التليفون','البريد'];
      html += `<div class="card" style="margin-bottom:12px;border-right:4px solid #ff9800">
        <div class="card-body" style="padding:10px 14px;font-size:13px;color:#e65100;cursor:pointer" onclick="toggleMissingData()">
          <i class="fas fa-exclamation-circle"></i> <strong>بيانات ناقصة:</strong> ${totalMissing} حقل فارغ — ${lines}
          <span style="float:left;font-size:11px"><i class="fas fa-chevron-down" id="missingDataIcon"></i> <span id="missingDataLabel">اضغط للعرض</span></span>
        </div>
        <div id="missingDataDetails" style="display:none;padding:0 14px 14px;font-size:12px;overflow-x:auto">
          <table class="data-table" style="font-size:10px;white-space:nowrap">
            <thead><tr style="background:#fff3e0">${fieldLabels.map(f => `<th>${f}</th>`).join('')}<th>الحقول الناقصة</th></tr></thead>
            <tbody>${missingRecords.map((r,i) => {
              const miss = fieldLabels.filter((f,fi) => !r[allFields[fi]]).join('، ');
              return `<tr>${allFields.map((f,fi) => `<td${r[f]?'':' style="background:#ffe0b2;color:#e65100"'}>${r[f]||'---'}</td>`).join('')}<td style="color:#e65100">${miss}</td></tr>`;
            }).join('')}</tbody>
          </table>
        </div>
      </div>`;
    }
    html += `<!-- Stats -->
    <div class="card" style="margin-bottom:12px">
      <div class="card-body" style="padding:10px 14px">
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:12px">
          <span style="font-weight:700;font-size:14px">إجمالي: ${data.length}</span>
          ${catsSorted.map(([k,v]) => `<span class="badge badge-cat" style="background:#e8d5f5;color:#6a1b9a;padding:2px 8px;border-radius:12px;font-size:11px">${k}: ${v}</span>`).join('')}
          <span style="color:#999;margin-right:8px">|</span>
          <span style="color:#666">التصنيف: ${Object.entries(classes).map(([k,v]) => `${k} (${v})`).join(' | ')}</span>
        </div>
      </div>
    </div>
    <!-- Branch Supervisor Table -->
    <div class="card" style="margin-bottom:12px">
      <div class="card-header" style="padding:10px 16px;background:#e8f5e9;cursor:pointer" onclick="toggleSupSection()">
        <strong><i class="fas fa-user-shield"></i> بيانات مشرفي الفروع <span id="supSectionIcon" style="font-size:11px;margin-right:8px"><i class="fas fa-chevron-up"></i></span></strong>
      </div>
      <div id="supSectionBody" class="card-body" style="padding:8px 12px">
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:8px">
          <input id="supSearch" type="text" placeholder="🔍 بحث بالاسم..." oninput="applySupFilter()" style="padding:4px 8px;border:1px solid #ccc;border-radius:6px;font-size:12px;flex:1;min-width:120px">
          <select id="supFilterGov" onchange="applySupFilter()" style="padding:4px 8px;border:1px solid #ccc;border-radius:6px;font-size:12px">
            <option value="">كل الفروع</option>
            ${govs.map(g => `<option value="${g}">${g}</option>`).join('')}
          </select>
          ${canAdd ? `<button class="btn btn-info" onclick="showAddSupInEmpPage()" style="height:32px"><i class="fas fa-plus"></i> إضافة مشرف فرع</button>` : ''}
        </div>
        ${branchSupMissingData ? `
        <div class="card" style="margin-bottom:8px;border-right:4px solid #ff9800;background:#fff8e1">
          <div class="card-body" style="padding:8px 12px;font-size:12px;color:#e65100;cursor:pointer" onclick="toggleSupMissingData()">
            <i class="fas fa-exclamation-circle"></i> <strong>بيانات ناقصة:</strong> ${Object.entries(branchSupMissingFields).filter(([,c]) => c > 0).map(([f,c]) => `${f}: ${c}`).join(' | ')}
            <span style="float:left;font-size:11px"><i class="fas fa-chevron-down" id="supMissingIcon"></i> <span id="supMissingLabel">اضغط للعرض</span></span>
          </div>
          <div id="supMissingDetails" style="display:none;padding:0 12px 12px;font-size:11px;overflow-x:auto">
            <table class="data-table" style="font-size:10px;white-space:nowrap">
              <thead><tr style="background:#fff3e0">${['الفرع','الاسم','التصنيف','الفئه','الرقم القومي','التليفون','البريد'].map(f => `<th>${f}</th>`).join('')}<th>الحقول الناقصة</th></tr></thead>
              <tbody>${branchSupMissingRecords.map((r,i) => {
                const supMiss = branchSupMissingFieldsList.filter(f => !r[f.field]).map(f => f.label).join('، ');
                return `<tr>${branchSupMissingFieldsList.map(f => `<td${r[f.field]?'':' style="background:#ffe0b2;color:#e65100"'}>${r[f.field]||'---'}</td>`).join('')}<td style="color:#e65100">${supMiss}</td></tr>`;
              }).join('')}</tbody>
            </table>
          </div>
        </div>` : ''}
        <div class="table-scroll"><table class="data-table" id="supTable" style="font-size:12px">
          <thead><tr style="background:#f5f5f5">
            <th>#</th><th>الفرع</th><th>مشرف الفرع</th><th>التصنيف</th><th>الفئه</th><th>الرقم القومي</th><th>رقم التليفون</th><th>البريد الإلكتروني</th>${(canEdit||canDelete) ? '<th>إجراءات</th>' : ''}
          </tr></thead>
          <tbody id="supTbody"></tbody>
        </table></div>
      </div>
    </div>
    <div class="card" style="margin-bottom:12px">
      <div class="card-body" style="padding:8px 12px">
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
          <select id="empFilterGov" onchange="empFilterGovChanged()" style="padding:4px 8px;border:1px solid #ccc;border-radius:6px;font-size:12px"><option value="">كل الفروع</option>${govs.map(g => `<option value="${g}">${g}</option>`).join('')}</select>
          <select id="empFilterHosp" onchange="applyEmpFilter()" style="padding:4px 8px;border:1px solid #ccc;border-radius:6px;font-size:12px"><option value="">كل بنوك الدم</option>${hospNames.map(h => `<option value="${h}">${h}</option>`).join('')}</select>
          <select id="empFilterCat" onchange="applyEmpFilter()" style="padding:4px 8px;border:1px solid #ccc;border-radius:6px;font-size:12px"><option value="">كل الفئات</option>${allCats.map(c => `<option value="${c}">${c}</option>`).join('')}</select>
          <select id="empFilterClass" onchange="applyEmpFilter()" style="padding:4px 8px;border:1px solid #ccc;border-radius:6px;font-size:12px"><option value="">كل التصنيفات</option>${allClasses.map(c => `<option value="${c}">${c}</option>`).join('')}</select>
          <input type="text" id="empSearch" placeholder="بحث بالاسم أو الرقم القومي..." oninput="applyEmpFilter()" style="padding:4px 8px;border:1px solid #ccc;border-radius:6px;font-size:12px;flex:1;min-width:150px">
        </div>
      </div>
    </div>
    <div class="card" style="margin-bottom:12px"><div class="card-body" style="padding:0">
      <div class="table-scroll"><table class="data-table" id="empTable" style="font-size:12px">
        <thead><tr style="background:#f5f5f5">
          <th>#</th><th>الفرع</th><th>بنك الدم</th><th>العاملين</th><th>الفئه</th><th>التصنيف</th><th>الرقم القومي</th><th>التليفون</th><th>البريد الالكتروني</th>${canEdit||canDelete?'<th>إجراءات</th>':''}
        </tr></thead>
        <tbody id="empTbody"></tbody>
      </table></div>
    </div></div>`;
    document.getElementById('empLoading').style.display = 'none';
    document.getElementById('empContent').innerHTML = html;
    window._empData = data;
    window._empCanEdit = canEdit;
    window._empCanDelete = canDelete;
    window._empHospGovMap = hospGovMap;
    window._branchSupervisors = branchSupervisors;
    // Update monthly review status
    const reviewStatusEl = document.getElementById('empReviewStatus');
    const reviewBtn = document.getElementById('empReviewBtn');
    if (window.me?.user?.role === 'hospital') {
      const myStatus = (hospitalStatus||[]).find(h => h.id === window.me.user.hospitalId);
      if (myStatus && myStatus.monthlyUpdated) {
        if (reviewStatusEl) reviewStatusEl.innerHTML = '<div style="background:#e8f5e9;border-right:5px solid #2e7d32;border-radius:6px;padding:10px 14px;font-size:13px;color:#1b5e20"><i class="fas fa-check-circle" style="color:#2e7d32"></i> <strong>✓ تمت المراجعة</strong> — تمت مراجعة بيانات العاملين لهذا الشهر</div>';
        if (reviewBtn) reviewBtn.style.display = 'none';
      } else {
        if (reviewStatusEl) reviewStatusEl.innerHTML = '<div style="background:#fff3e0;border-right:5px solid #e65100;border-radius:6px;padding:10px 14px;font-size:13px;color:#bf360c"><i class="fas fa-exclamation-circle" style="color:#e65100"></i> <strong>يرجى مراجعة بيانات العاملين</strong> — لم يتم تأكيد مراجعة هذا الشهر بعد</div>';
        if (reviewBtn) reviewBtn.style.display = '';
      }
    }
    applySupFilter();
    applyEmpFilter();
  } catch (e) {
    document.getElementById('empLoading').innerHTML = `<span style="color:#dc3545"><i class="fas fa-exclamation-circle"></i> ${e.message}</span>`;
  }
}

async function markEmployeeMonthReview() {
  try {
    await api('POST', '/employee-statements/mark-updated');
    showToast('✅ تم تأكيد مراجعة بيانات العاملين لهذا الشهر');
    renderEmployeeStatement();
  } catch (e) {
    showToast('❌ ' + e.message);
  }
}

function empFilterGovChanged() {
  const gov = document.getElementById('empFilterGov')?.value || '';
  const hospEl = document.getElementById('empFilterHosp');
  const hospGovMap = window._empHospGovMap || {};
  const allHospNames = [...new Set(Object.keys(hospGovMap))];
  const filtered = gov ? allHospNames.filter(h => hospGovMap[h] === gov) : allHospNames;
  const curVal = hospEl.value;
  hospEl.innerHTML = '<option value="">كل بنوك الدم</option>' + filtered.map(h => `<option value="${h}" ${h === curVal ? 'selected' : ''}>${h}</option>`).join('');
  if (gov && curVal && !filtered.includes(curVal)) hospEl.value = '';
  applyEmpFilter();
}

function toggleSupSection() {
  const body = document.getElementById('supSectionBody');
  const icon = document.getElementById('supSectionIcon');
  if (!body) return;
  const shown = body.style.display !== 'none';
  body.style.display = shown ? 'none' : 'block';
  if (icon) icon.innerHTML = shown ? '<i class="fas fa-chevron-down"></i>' : '<i class="fas fa-chevron-up"></i>';
}

function toggleSupMissingData() {
  const el = document.getElementById('supMissingDetails');
  const icon = document.getElementById('supMissingIcon');
  const label = document.getElementById('supMissingLabel');
  if (!el) return;
  const shown = el.style.display !== 'none';
  el.style.display = shown ? 'none' : 'block';
  if (icon) icon.className = shown ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
  if (label) label.textContent = shown ? 'اضغط للعرض' : 'اضغط للإخفاء';
}

async function showAddSupInEmpPage() {
  try {
    const [govs, hospitals] = await Promise.all([
      api('GET', '/governorates'),
      api('GET', '/hospitals')
    ]);
    window._supHospitals = hospitals;
    const govOptions = govs.map(g => `<option value="${g}">${g}</option>`).join('');
    openModal('إضافة مشرف فرع',
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;max-width:450px">
      <div style="grid-column:1/-1"><label style="font-size:12px;color:#666">الفرع</label>
        <select id="supAddGov" class="modal-input" style="width:100%" onchange="supGovChanged()">
          <option value="">-- اختر الفرع --</option>
          ${govOptions}
        </select></div>
      <div style="grid-column:1/-1"><label style="font-size:12px;color:#666">الاسم</label><input id="supAddName" class="modal-input" style="width:100%"></div>
      <div><label style="font-size:12px;color:#666">الفئه</label><input class="modal-input" style="width:100%;background:#e8f5e9" value="مشرف فرع" readonly></div>
      <div><label style="font-size:12px;color:#666">التصنيف</label><select id="supAddClass" class="modal-input" style="width:100%"><option value="">-- اختر --</option><option value="تعاقد">تعاقد</option><option value="اساسي">اساسي</option><option value="منتدب">منتدب</option></select></div>
      <div style="grid-column:1/-1"><label style="font-size:12px;color:#666">الرقم القومي</label><input id="supAddNid" class="modal-input" style="width:100%"></div>
      <div><label style="font-size:12px;color:#666">رقم التليفون</label><input id="supAddPhone" class="modal-input" style="width:100%"></div>
      <div><label style="font-size:12px;color:#666">البريد الالكتروني</label><input id="supAddEmail" class="modal-input" style="width:100%"></div>
    </div>
    <div style="margin-top:12px;text-align:left">
      <button class="btn btn-primary" onclick="doAddSupInEmpPage()"><i class="fas fa-save"></i> حفظ</button>
    </div>`,
    () => {}
  );
  } catch(e) { showToast('❌ ' + e.message); }
}
function supGovChanged() {
  const gov = document.getElementById('supAddGov')?.value;
  const hospitals = window._supHospitals || [];
}
async function doAddSupInEmpPage() {
  try {
    const gov = document.getElementById('supAddGov')?.value;
    const name = document.getElementById('supAddName')?.value?.trim();
    const classification = document.getElementById('supAddClass')?.value?.trim();
    const national_id = document.getElementById('supAddNid')?.value?.trim();
    const phone = document.getElementById('supAddPhone')?.value?.trim();
    const email = document.getElementById('supAddEmail')?.value?.trim();
    const missing = [];
    if (!gov) missing.push('الفرع');
    if (!name) missing.push('الاسم');
    if (!classification) missing.push('التصنيف');
    if (!national_id) missing.push('الرقم القومي');
    if (missing.length) { showToast('❌ البيانات الناقصة: ' + missing.join('، ')); return; }
    const hospitals = window._supHospitals || [];
    const govHospitals = hospitals.filter(h => h.governorate === gov);
    if (!govHospitals.length) { showToast('❌ لا يوجد بنوك دم في هذا الفرع'); return; }
    const hospitalId = govHospitals[0].id;
    await api('POST', '/employee-statements', {
      hospital_id: hospitalId,
      employee: name,
      category: 'مشرف فرع',
      classification: classification,
      national_id: national_id || '',
      phone: phone || '',
      email: email || ''
    });
    closeModal();
    showToast('✅ تم إضافة مشرف فرع');
    renderEmployeeStatement();
  } catch (e) { showToast('❌ ' + e.message); }
}

async function showEditSupInEmpPage(id) {
  try {
  const data = window._empData || [];
  const rec = data.find(r => r.id === id);
  if (!rec) { showToast('❌ السجل غير موجود'); return; }
  const [govs, hospitals] = await Promise.all([
    api('GET', '/governorates'),
    api('GET', '/hospitals')
  ]);
  window._supHospitals = hospitals;
  const govOptions = govs.map(g => `<option value="${g}" ${rec.governorate === g ? 'selected' : ''}>${g}</option>`).join('');
  openModal('تعديل مشرف فرع',
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;max-width:450px">
      <div style="grid-column:1/-1"><label style="font-size:12px;color:#666">الفرع</label>
        <select id="supEditGov" class="modal-input" style="width:100%" onchange="supEditGovChanged()">
          <option value="">-- اختر الفرع --</option>
          ${govOptions}
        </select></div>
      <div style="grid-column:1/-1"><label style="font-size:12px;color:#666">الاسم</label><input id="supEditName" class="modal-input" style="width:100%" value="${String(rec.employee||'').replace(/"/g,'&quot;')}"></div>
      <div><label style="font-size:12px;color:#666">الفئه</label><input class="modal-input" style="width:100%;background:#e8f5e9" value="مشرف فرع" readonly></div>
      <div><label style="font-size:12px;color:#666">التصنيف</label><select id="supEditClass" class="modal-input" style="width:100%"><option value="">-- اختر --</option><option value="تعاقد" ${rec.classification==='تعاقد'?'selected':''}>تعاقد</option><option value="اساسي" ${rec.classification==='اساسي'?'selected':''}>اساسي</option><option value="منتدب" ${rec.classification==='منتدب'?'selected':''}>منتدب</option></select></div>
      <div style="grid-column:1/-1"><label style="font-size:12px;color:#666">الرقم القومي</label><input id="supEditNid" class="modal-input" style="width:100%" value="${String(rec.national_id||'').replace(/"/g,'&quot;')}"></div>
      <div><label style="font-size:12px;color:#666">رقم التليفون</label><input id="supEditPhone" class="modal-input" style="width:100%" value="${String(rec.phone||'').replace(/"/g,'&quot;')}"></div>
      <div><label style="font-size:12px;color:#666">البريد الالكتروني</label><input id="supEditEmail" class="modal-input" style="width:100%" value="${String(rec.email||'').replace(/"/g,'&quot;')}"></div>
    </div>
    <div style="margin-top:12px;text-align:left">
      <button class="btn btn-primary" onclick="doEditSupInEmpPage(${id})"><i class="fas fa-save"></i> حفظ</button>
    </div>`,
    () => {}
  );
  } catch(e) { showToast('❌ ' + e.message); }
}
function supEditGovChanged() {
  const gov = document.getElementById('supEditGov')?.value;
}
async function doEditSupInEmpPage(id) {
  try {
    const gov = document.getElementById('supEditGov')?.value;
    const name = document.getElementById('supEditName')?.value?.trim();
    const classification = document.getElementById('supEditClass')?.value?.trim();
    const national_id = document.getElementById('supEditNid')?.value?.trim();
    const phone = document.getElementById('supEditPhone')?.value?.trim();
    const email = document.getElementById('supEditEmail')?.value?.trim();
    const missing = [];
    if (!gov) missing.push('الفرع');
    if (!name) missing.push('الاسم');
    if (!classification) missing.push('التصنيف');
    if (!national_id) missing.push('الرقم القومي');
    if (missing.length) { showToast('❌ البيانات الناقصة: ' + missing.join('، ')); return; }
    const hospitals = window._supHospitals || [];
    const govHospitals = hospitals.filter(h => h.governorate === gov);
    const hospitalId = govHospitals.length ? govHospitals[0].id : null;
    if (!hospitalId) { showToast('❌ لا يوجد بنوك دم في هذا الفرع'); return; }
    await api('PUT', '/employee-statements/' + id, {
      hospital_id: hospitalId,
      employee: name,
      category: 'مشرف فرع',
      classification: classification,
      national_id: national_id || '',
      phone: phone || '',
      email: email || ''
    });
    closeModal();
    showToast('✅ تم التعديل');
    renderEmployeeStatement();
  } catch (e) { showToast('❌ ' + e.message); }
}
function showDeleteSupInEmpPage(id) {
  if (!confirm('هل أنت متأكد من حذف مشرف الفرع؟')) return;
  empDeleteRecord(id);
}

function applySupFilter() {
  const gov = document.getElementById('supFilterGov')?.value || '';
  const search = (document.getElementById('supSearch')?.value || '').trim().toLowerCase();
  const sups = window._branchSupervisors || [];
  let filtered = gov ? sups.filter(s => s.governorate === gov) : sups;
  if (search) filtered = filtered.filter(s => s.employee && s.employee.toLowerCase().includes(search));
  const tbody = document.getElementById('supTbody');
  if (!tbody) return;
  const canEditDel = window._empCanEdit || window._empCanDelete;
  if (!filtered.length) { tbody.innerHTML = `<tr><td colspan="${canEditDel ? 9 : 8}" style="text-align:center;padding:10px;color:#999">لا يوجد مشرفين لهذا الفرع</td></tr>`; return; }
  tbody.innerHTML = filtered.map((s,i) => `<tr${i%2?' style="background:#fafafa"':''}>
    <td>${i+1}</td>
    <td>${s.governorate}</td>
    <td><strong>${s.employee}</strong></td>
    <td>${s.classification||''}</td>
    <td>${s.category||''}</td>
    <td style="direction:ltr;font-family:monospace">${s.national_id||''}</td>
    <td style="direction:ltr">${s.phone||''}</td>
    <td style="direction:ltr;font-size:11px">${s.email||''}</td>
    ${canEditDel ? `<td style="white-space:nowrap">
      <button class="btn btn-sm btn-outline" onclick="showEditSupInEmpPage(${s.id})" style="color:#1976d2;font-size:10px;margin:1px" title="تعديل"><i class="fas fa-edit"></i></button>
      <button class="btn btn-sm btn-outline" onclick="showDeleteSupInEmpPage(${s.id})" style="color:#dc3545;font-size:10px;margin:1px" title="حذف"><i class="fas fa-trash"></i></button>
    </td>` : ''}
  </tr>`).join('');
}

function applyEmpFilter() {
  const gov = document.getElementById('empFilterGov')?.value || '';
  const hosp = document.getElementById('empFilterHosp')?.value || '';
  const cat = document.getElementById('empFilterCat')?.value || '';
  const cls = document.getElementById('empFilterClass')?.value || '';
  const search = (document.getElementById('empSearch')?.value || '').trim().toLowerCase();
  const data = window._empData || [];
  const canEdit = window._empCanEdit;
  const canDelete = window._empCanDelete;
  const filtered = data.filter(d => {
    if (gov && d.governorate !== gov) return false;
    if (hosp && d.hospital_name !== hosp) return false;
    if (cat && d.category !== cat) return false;
    if (cls && d.classification !== cls) return false;
    if (search && (!d.employee || !d.employee.toLowerCase().includes(search)) && !(d.national_id||'').includes(search)) return false;
    return true;
  });
  
  // Update stats header dynamically
  updateEmpStats(filtered);
  
  const tbody = document.getElementById('empTbody');
  if (!tbody) return;
  const colSpan = canEdit||canDelete ? 10 : 9;
  if (!filtered.length) { tbody.innerHTML = `<tr><td colspan="${colSpan}" style="text-align:center;padding:20px;color:#999">لا توجد نتائج</td></tr>`; return; }
  tbody.innerHTML = filtered.map((d,i) => `<tr${i%2?' style="background:#fafafa"':''}>
    <td>${i+1}</td>
    <td>${d.governorate}</td>
    <td>${d.hospital_name}</td>
    <td><strong>${d.employee}</strong></td>
    <td>${d.category}</td>
    <td>${d.classification}</td>
    <td style="direction:ltr;font-family:monospace">${d.national_id||''}</td>
    <td style="direction:ltr">${d.phone||''}</td>
    <td style="direction:ltr;font-size:11px">${d.email||''}</td>
    ${canEdit||canDelete ? `<td style="white-space:nowrap">
      ${canEdit ? `<button class="btn btn-sm btn-outline" onclick="empShowEditModal(${d.id})" style="color:#1976d2;font-size:10px;margin:1px"><i class="fas fa-edit"></i></button>` : ''}
      ${canDelete ? `<button class="btn btn-sm btn-outline" onclick="empDeleteRecord(${d.id})" style="color:#dc3545;font-size:10px;margin:1px"><i class="fas fa-trash"></i></button>` : ''}
    </td>` : ''}
  </tr>`).join('');
}

function updateEmpStats(filtered) {
  const cats = {}; filtered.forEach(d => { cats[d.category] = (cats[d.category] || 0) + 1; });
  const catsSorted = Object.entries(cats).sort((a,b) => b[1] - a[1]);
  const classes = {}; filtered.forEach(d => { classes[d.classification] = (classes[d.classification] || 0) + 1; });
  
  const statsEl = document.getElementById('empStatsCard')?.querySelector('.card-body');
  if (statsEl) {
    statsEl.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:8px">
        <span style="font-weight:700;font-size:15px">إجمالي: ${filtered.length}</span>
        ${catsSorted.map(([k,v]) => `<span class="badge badge-cat" style="background:#e8d5f5;color:#6a1b9a;padding:3px 10px;border-radius:12px;font-size:12px">${k}: ${v}</span>`).join('')}
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:12px;color:#666">
        <span>التصنيف: ${Object.entries(classes).map(([k,v]) => `${k} (${v})`).join(' | ')}</span>
      </div>
    `;
  }
}

function printEmployeeTable() {
  const data = window._empData || [];
  if (!data.length) return showToast('لا توجد بيانات للطباعة');
  
  // Filter by current filter
  const gov = document.getElementById('empFilterGov')?.value || '';
  const hosp = document.getElementById('empFilterHosp')?.value || '';
  const cat = document.getElementById('empFilterCat')?.value || '';
  const cls = document.getElementById('empFilterClass')?.value || '';
  const search = (document.getElementById('empSearch')?.value || '').trim().toLowerCase();
  
  const filtered = data.filter(d => {
    if (gov && d.governorate !== gov) return false;
    if (hosp && d.hospital_name !== hosp) return false;
    if (cat && d.category !== cat) return false;
    if (cls && d.classification !== cls) return false;
    if (search && (!d.employee || !d.employee.toLowerCase().includes(search)) && !(d.national_id||'').includes(search)) return false;
    return true;
  });
  
  // Create print window with styled table
  const printWindow = window.open('', '_blank');
  const branchName = gov || 'جميع الفروع';
  const hospitalName = hosp || 'جميع بنوك الدم';
  
  let html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>بيان العاملين - ${branchName} - ${hospitalName}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 20px; direction: rtl; }
    .header { text-align: center; margin-bottom: 20px; }
    .header h1 { color: #795548; margin: 5px 0; font-size: 24px; }
    .header .subtitle { color: #666; font-size: 14px; margin: 2px 0; }
    .info-row { display: flex; justify-content: space-between; margin: 10px 0; font-size: 13px; }
    .info-row span { font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
    th, td { border: 1px solid #ddd; padding: 6px 4px; text-align: center; }
    th { background: #f5f5f5; font-weight: bold; color: #333; }
    tr:nth-child(even) { background: #fafafa; }
    .stats { display: flex; flex-wrap: wrap; gap: 10px; margin: 10px 0; font-size: 12px; }
    .badge { background: #e8d5f5; color: #6a1b9a; padding: 3px 8px; border-radius: 12px; font-size: 11px; }
    @media print {
      .no-print { display: none; }
      body { margin: 0; padding: 15px; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
      thead { display: table-header-group; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1><i class="fas fa-users"></i> بيان العاملين ببنوك الدم</h1>
    <div class="subtitle">نظام إدارة بنوك الدم - هيئة التامين الصحي الشامل</div>
    <div class="subtitle">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
  </div>
  <div class="info-row">
    <span>الفرع:</span> <span>${branchName}</span>
    <span>بنك الدم:</span> <span>${hospitalName}</span>
    <span>إجمالي السجلات:</span> <span>${filtered.length}</span>
  </div>
  <div class="stats">
`;

  // Add category badges
  const cats = {}; filtered.forEach(d => { cats[d.category] = (cats[d.category] || 0) + 1; });
  Object.entries(cats).sort((a,b) => b[1] - a[1]).forEach(([k,v]) => {
    html += `<span class="badge">${k}: ${v}</span>`;
  });
  
  html += `
  </div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>الفرع</th>
        <th>بنك الدم</th>
        <th>الموظف</th>
        <th>الفئة</th>
        <th>التصنيف</th>
        <th>الرقم القومي</th>
        <th>التليفون</th>
        <th>البريد الإلكتروني</th>
      </tr>
    </thead>
    <tbody>
`;

  filtered.forEach((d, i) => {
    html += `
      <tr>
        <td>${i+1}</td>
        <td>${d.governorate || ''}</td>
        <td>${d.hospital_name || ''}</td>
        <td><strong>${d.employee || ''}</strong></td>
        <td>${d.category || ''}</td>
        <td>${d.classification || ''}</td>
        <td style="direction:ltr;font-family:monospace">${d.national_id || ''}</td>
        <td style="direction:ltr">${d.phone || ''}</td>
        <td style="direction:ltr;font-size:10px">${d.email || ''}</td>
      </tr>
    `;
  });
  
  html += `
    </tbody>
  </table>
  <div style="text-align:center;margin-top:15px;font-size:10px;color:#888">إعداد و برمجة محمد ندا 01068880999</div>
  <div class="no-print" style="margin-top:20px;text-align:center">
    <button onclick="window.print()" style="padding:10px 20px;background:#795548;color:white;border:none;border-radius:4px;cursor:pointer;font-size:14px">
      <i class="fas fa-print"></i> طباعة / حفظ PDF
    </button>
    <button onclick="downloadExcel()" style="padding:10px 20px;background:#28a745;color:white;border:none;border-radius:4px;cursor:pointer;font-size:14px;margin-right:10px">
      <i class="fas fa-file-excel"></i> تحميل Excel
    </button>
  </div>
  <script>
    function downloadExcel() {
      let csv = '\\uFEFFالفرع,بنك الدم,الموظف,الفئة,التصنيف,الرقم القومي,التليفون,البريد الإلكتروني\\n';
      const rows = document.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const esc = v => '"' + (v || '').replace(/"/g, '""') + '"';
        csv += [esc(cells[1].textContent), esc(cells[2].textContent), esc(cells[3].textContent), esc(cells[4].textContent), esc(cells[5].textContent), esc(cells[6].textContent), esc(cells[7].textContent), esc(cells[8].textContent)].join(',') + '\\n';
      });
      csv += '\\n"إعداد و برمجة محمد ندا 01068880999"\\n';
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'بيان_العاملين_' + new Date().toISOString().slice(0,10) + '.csv';
      a.click();
    }
    window.onload = function() { window.print(); };
  </script>
</body>
</html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
}

function exportEmployeeExcel() {
  const data = window._empData || [];
  if (!data.length) return showToast('لا توجد بيانات');
  const gov = document.getElementById('empFilterGov')?.value || '';
  const hosp = document.getElementById('empFilterHosp')?.value || '';
  const cat = document.getElementById('empFilterCat')?.value || '';
  const cls = document.getElementById('empFilterClass')?.value || '';
  const search = (document.getElementById('empSearch')?.value || '').trim().toLowerCase();
  const filtered = data.filter(d => {
    if (gov && d.governorate !== gov) return false;
    if (hosp && d.hospital_name !== hosp) return false;
    if (cat && d.category !== cat) return false;
    if (cls && d.classification !== cls) return false;
    if (search && (!d.employee || !d.employee.toLowerCase().includes(search)) && !(d.national_id||'').includes(search)) return false;
    return true;
  });
  let csv = '\uFEFFالمحافظة,بنك الدم,الموظف,الفئه,التصنيف,الرقم القومي,التليفون,البريد الالكتروني\n';
  filtered.forEach(d => {
    const esc = v => `"${String(v||'').replace(/"/g,'""')}"`;
    csv += [esc(d.governorate), esc(d.hospital_name), esc(d.employee), esc(d.category), esc(d.classification), esc(d.national_id||''), esc(d.phone||''), esc(d.email||'')].join(',') + '\n';
  });
  csv += '\n"إعداد و برمجة محمد ندا 01068880999"\n';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'بيان_العاملين.csv'; a.click();
  showToast('✅ تم التحميل');
}

async function empShowAddModal(defaultCategory) {
  const userHospitalId = window.me?.user?.hospitalId;
  const isHospital = window.me?.user?.role === 'hospital';
  const userGov = window.me?.user?.governorate;
  const [govs, hospitals] = await Promise.all([
    api('GET', '/governorates'),
    api('GET', '/hospitals')
  ]);
  const empHospitals = hospitals;
  const govOptions = govs.map(g => `<option value="${g}" ${userGov === g ? 'selected' : ''}>${g}</option>`).join('');
  const hospOptions = isHospital ? '' : '<option value="">اختر المستشفى أولاً</option>';
  openModal('إضافة موظف',
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;max-width:500px">
      <div style="grid-column:1/-1"><label style="font-size:12px;color:#666">الفرع</label>
        <select id="empAddGov" class="modal-input" style="width:100%" onchange="empGovChanged('add')" ${isHospital ? 'disabled' : ''}>
          <option value="">-- اختر الفرع --</option>
          ${govOptions}
        </select></div>
      <div style="grid-column:1/-1"><label style="font-size:12px;color:#666">بنك الدم</label>
        <select id="empAddHosp" class="modal-input" style="width:100%" ${isHospital ? 'disabled' : ''}>
          ${isHospital ? '<option value="' + userHospitalId + '" selected>' + (hospitals.find(h => h.id === userHospitalId)?.name || '') + '</option>' : '<option value="">-- اختر الفرع أولاً --</option>'}
        </select></div>
      <div><label style="font-size:12px;color:#666">الاسم</label><input id="empAddName" class="modal-input" style="width:100%"></div>
      <div><label style="font-size:12px;color:#666">الفئه</label><select id="empAddCat" class="modal-input" style="width:100%"><option value="">-- اختر --</option>${['مشرف فرع','مدير بنك','استشاري','اخصائي','طبيب مقيم','كميائي','اخصائي تكنولوجي','فني','تمريض','اداري'].map(c => `<option value="${c}" ${defaultCategory === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
      <div><label style="font-size:12px;color:#666">التصنيف</label><select id="empAddClass" class="modal-input" style="width:100%"><option value="">-- اختر --</option><option value="تعاقد">تعاقد</option><option value="اساسي">اساسي</option><option value="منتدب">منتدب</option></select></div>
      <div><label style="font-size:12px;color:#666">الرقم القومي</label><input id="empAddNid" class="modal-input" style="width:100%"></div>
      <div><label style="font-size:12px;color:#666">التليفون</label><input id="empAddPhone" class="modal-input" style="width:100%"></div>
      <div><label style="font-size:12px;color:#666">البريد الالكتروني</label><input id="empAddEmail" class="modal-input" style="width:100%"></div>
    </div>
    <div style="margin-top:12px;text-align:left">
      <button class="btn btn-primary" onclick="empDoAdd()"><i class="fas fa-save"></i> حفظ</button>
    </div>`,
    () => {}
  );
  window._empHospitals = empHospitals;
  // If hospital user, already populated. If admin and gov selected, load hospitals
  if (!isHospital && userGov) {
    empGovChanged('add');
  }
}

function empGovChanged(mode) {
  const gov = document.getElementById('empAddGov')?.value;
  const hosp = document.getElementById('empAddHosp');
  const hospitals = window._empHospitals || [];
  if (gov) {
    const filtered = hospitals.filter(h => h.governorate === gov);
    hosp.innerHTML = '<option value="">-- اختر بنك الدم --</option>' + filtered.map(h => '<option value="' + h.id + '">' + h.name + '</option>').join('');
    hosp.disabled = false;
  } else {
    hosp.innerHTML = '<option value="">-- اختر الفرع أولاً --</option>';
    hosp.disabled = true;
  }
}

async function empDoAdd() {
  const name = document.getElementById('empAddName')?.value?.trim();
  const hospitalId = parseInt(document.getElementById('empAddHosp')?.value);
  const category = document.getElementById('empAddCat')?.value?.trim();
  const classification = document.getElementById('empAddClass')?.value?.trim();
  const national_id = document.getElementById('empAddNid')?.value?.trim();
  const missing = [];
  if (!name) missing.push('الاسم');
  if (!hospitalId) missing.push('الفرع / بنك الدم');
  if (!category) missing.push('الفئه');
  if (!classification) missing.push('التصنيف');
  if (!national_id) missing.push('الرقم القومي');
  if (missing.length) { showToast('❌ البيانات الناقصة: ' + missing.join('، ')); return; }
  try {
    await api('POST', '/employee-statements', {
      hospital_id: hospitalId,
      employee: name,
      category: category || '',
      classification: classification || '',
      national_id: national_id || '',
      phone: document.getElementById('empAddPhone')?.value?.trim() || '',
      email: document.getElementById('empAddEmail')?.value?.trim() || ''
    });
    closeModal();
    showToast('✅ تمت الإضافة');
    renderEmployeeStatement();
  } catch (e) { showToast('❌ ' + e.message); }
}

async function empShowEditModal(id) {
  try {
  const data = window._empData || [];
  const rec = data.find(r => r.id === id);
  if (!rec) { showToast('❌ السجل غير موجود'); return; }
  const [govs, hospitals] = await Promise.all([
    api('GET', '/governorates'),
    api('GET', '/hospitals')
  ]);
  const empHospitals = hospitals;
  const govOptions = govs.map(g => `<option value="${g}" ${rec.governorate === g ? 'selected' : ''}>${g}</option>`).join('');
  const filteredH = hospitals.filter(h => h.governorate === rec.governorate);
  const hospOptions = filteredH.map(h => `<option value="${h.id}" ${h.id === rec.hospital_id ? 'selected' : ''}>${h.name}</option>`).join('');
  openModal('تعديل بيانات الموظف',
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;max-width:500px">
      <div style="grid-column:1/-1"><label style="font-size:12px;color:#666">الفرع</label>
        <select id="empEditGov" class="modal-input" style="width:100%" onchange="empGovChangedEdit()">
          <option value="">-- اختر الفرع --</option>
          ${govOptions}
        </select></div>
      <div style="grid-column:1/-1"><label style="font-size:12px;color:#666">بنك الدم</label>
        <select id="empEditHosp" class="modal-input" style="width:100%">
          <option value="">-- اختر بنك الدم --</option>
          ${hospOptions}
        </select></div>
      <div><label style="font-size:12px;color:#666">الاسم</label><input id="empEditName" class="modal-input" style="width:100%" value="${String(rec.employee||'').replace(/"/g,'&quot;')}"></div>
      <div><label style="font-size:12px;color:#666">الفئه</label><select id="empEditCat" class="modal-input" style="width:100%"><option value="">-- اختر --</option><option value="مشرف فرع" ${rec.category==='مشرف فرع'?'selected':''}>مشرف فرع</option><option value="مدير بنك" ${rec.category==='مدير بنك'?'selected':''}>مدير بنك</option><option value="استشاري" ${rec.category==='استشاري'?'selected':''}>استشاري</option><option value="اخصائي" ${rec.category==='اخصائي'?'selected':''}>اخصائي</option><option value="طبيب مقيم" ${rec.category==='طبيب مقيم'?'selected':''}>طبيب مقيم</option><option value="كميائي" ${rec.category==='كميائي'?'selected':''}>كميائي</option><option value="اخصائي تكنولوجي" ${rec.category==='اخصائي تكنولوجي'?'selected':''}>اخصائي تكنولوجي</option><option value="فني" ${rec.category==='فني'?'selected':''}>فني</option><option value="تمريض" ${rec.category==='تمريض'?'selected':''}>تمريض</option><option value="اداري" ${rec.category==='اداري'?'selected':''}>اداري</option></select></div>
      <div><label style="font-size:12px;color:#666">التصنيف</label><select id="empEditClass" class="modal-input" style="width:100%"><option value="">-- اختر --</option><option value="تعاقد" ${rec.classification==='تعاقد'?'selected':''}>تعاقد</option><option value="اساسي" ${rec.classification==='اساسي'?'selected':''}>اساسي</option><option value="منتدب" ${rec.classification==='منتدب'?'selected':''}>منتدب</option></select></div>
      <div><label style="font-size:12px;color:#666">الرقم القومي</label><input id="empEditNid" class="modal-input" style="width:100%" value="${String(rec.national_id||'').replace(/"/g,'&quot;')}"></div>
      <div><label style="font-size:12px;color:#666">التليفون</label><input id="empEditPhone" class="modal-input" style="width:100%" value="${String(rec.phone||'').replace(/"/g,'&quot;')}"></div>
      <div><label style="font-size:12px;color:#666">البريد الالكتروني</label><input id="empEditEmail" class="modal-input" style="width:100%" value="${String(rec.email||'').replace(/"/g,'&quot;')}"></div>
    </div>
    <div style="margin-top:12px;text-align:left">
      <button class="btn btn-primary" onclick="empDoEdit(${id})"><i class="fas fa-save"></i> حفظ</button>
    </div>`,
    () => {}
  );
  window._empHospitals = empHospitals;
  } catch(e) { showToast('❌ ' + e.message); }
}

function empGovChangedEdit() {
  const gov = document.getElementById('empEditGov')?.value;
  const hosp = document.getElementById('empEditHosp');
  const hospitals = window._empHospitals || [];
  if (gov) {
    const filtered = hospitals.filter(h => h.governorate === gov);
    hosp.innerHTML = '<option value="">-- اختر بنك الدم --</option>' + filtered.map(h => '<option value="' + h.id + '">' + h.name + '</option>').join('');
    hosp.disabled = false;
  } else {
    hosp.innerHTML = '<option value="">-- اختر بنك الدم --</option>';
    hosp.disabled = true;
  }
}

async function empDoEdit(id) {
  const name = document.getElementById('empEditName')?.value?.trim();
  const hospitalId = parseInt(document.getElementById('empEditHosp')?.value);
  const category = document.getElementById('empEditCat')?.value?.trim();
  const classification = document.getElementById('empEditClass')?.value?.trim();
  const national_id = document.getElementById('empEditNid')?.value?.trim();
  const missing = [];
  if (!name) missing.push('الاسم');
  if (!hospitalId) missing.push('الفرع / بنك الدم');
  if (!category) missing.push('الفئه');
  if (!classification) missing.push('التصنيف');
  if (!national_id) missing.push('الرقم القومي');
  if (missing.length) { showToast('❌ البيانات الناقصة: ' + missing.join('، ')); return; }
  try {
    await api('PUT', '/employee-statements/' + id, {
      hospital_id: hospitalId,
      employee: name,
      category: category || '',
      classification: classification || '',
      national_id: national_id || '',
      phone: document.getElementById('empEditPhone')?.value?.trim() || '',
      email: document.getElementById('empEditEmail')?.value?.trim() || ''
    });
    closeModal();
    showToast('✅ تم التعديل');
    renderEmployeeStatement();
  } catch (e) { showToast('❌ ' + e.message); }
}

async function empDeleteRecord(id) {
  if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
  try {
    await api('DELETE', '/employee-statements/' + id);
    showToast('✅ تم الحذف');
    renderEmployeeStatement();
  } catch (e) { showToast('❌ ' + e.message); }
}

function toggleMissingData() {
  const el = document.getElementById('missingDataDetails');
  const icon = document.getElementById('missingDataIcon');
  const label = document.getElementById('missingDataLabel');
  if (!el) return;
  const shown = el.style.display !== 'none';
  el.style.display = shown ? 'none' : 'block';
  if (icon) icon.className = shown ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
  if (label) label.textContent = shown ? 'اضغط للعرض' : 'اضغط للإخفاء';
}

function showAddBranchSupervisor() {
  api('GET', '/governorates').then(govs => {
    const govArr = Array.isArray(govs) ? govs : [];
    openModal('إضافة مشرف فرع',
      `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;max-width:400px">
        <div style="grid-column:1/-1"><label style="font-size:12px;color:#666">الاسم</label><input id="bsName" class="modal-input" style="width:100%"></div>
        <div><label style="font-size:12px;color:#666">اسم المستخدم</label><input id="bsUser" class="modal-input" style="width:100%"></div>
        <div><label style="font-size:12px;color:#666">كلمة المرور</label><input id="bsPass" class="modal-input" style="width:100%" value="123456"></div>
        <div style="grid-column:1/-1"><label style="font-size:12px;color:#666">المحافظة</label>
          <select id="bsGov" class="modal-input" style="width:100%"><option value="">-- اختر المحافظة --</option>${govArr.map(g => `<option value="${g}">${g}</option>`).join('')}</select></div>
        <div><label style="font-size:12px;color:#666">التليفون</label><input id="bsPhone" class="modal-input" style="width:100%"></div>
        <div><label style="font-size:12px;color:#666">البريد الالكتروني</label><input id="bsEmail" class="modal-input" style="width:100%"></div>
      </div>
      <div style="margin-top:12px;text-align:left">
        <button class="btn btn-primary" onclick="doAddBranchSupervisor()"><i class="fas fa-save"></i> حفظ</button>
      </div>`,
      () => {}
    );
  });
}

async function doAddBranchSupervisor() {
  const name = document.getElementById('bsName')?.value?.trim();
  const username = document.getElementById('bsUser')?.value?.trim();
  const password = document.getElementById('bsPass')?.value?.trim();
  const governorate = document.getElementById('bsGov')?.value;
  const phone = document.getElementById('bsPhone')?.value?.trim();
  const email = document.getElementById('bsEmail')?.value?.trim();
  const missing = [];
  if (!name) missing.push('الاسم');
  if (!username) missing.push('اسم المستخدم');
  if (!password) missing.push('كلمة المرور');
  if (!governorate) missing.push('المحافظة');
  if (missing.length) { showToast('❌ البيانات الناقصة: ' + missing.join('، ')); return; }
  try {
    await api('POST', '/users', { username, password, name, role: 'branch_supervisor', governorate, hospitalId: null, viewPermission: 'governorate', phone, email });
    closeModal();
    showToast('✅ تم إضافة مشرف فرع');
    renderSupervisorData();
  } catch (e) { showToast('❌ ' + e.message); }
}

async function editSupervisorUser(id) {
  const [users, govs] = await Promise.all([api('GET', '/users'), api('GET', '/governorates')]);
  const u = users.find(x => x.id === id);
  if (!u) return;
  const govArr = Array.isArray(govs) ? govs : [];
  openModal('تعديل مستخدم',
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;max-width:400px">
      <div style="grid-column:1/-1"><label style="font-size:12px;color:#666">الاسم</label><input id="euName" class="modal-input" style="width:100%" value="${String(u.name||'').replace(/"/g,'&quot;')}"></div>
      <div><label style="font-size:12px;color:#666">اسم المستخدم</label><input id="euUser" class="modal-input" style="width:100%" value="${u.username}"></div>
      <div><label style="font-size:12px;color:#666">كلمة المرور</label><input id="euPass" class="modal-input" style="width:100%" value="${u.password||''}"></div>
      <div style="grid-column:1/-1"><label style="font-size:12px;color:#666">المحافظة</label>
        <select id="euGov" class="modal-input" style="width:100%"><option value="">-- اختر --</option>${govArr.map(g => `<option value="${g}" ${u.governorate===g?'selected':''}>${g}</option>`).join('')}</select></div>
      <div><label style="font-size:12px;color:#666">التليفون</label><input id="euPhone" class="modal-input" style="width:100%" value="${String(u.phone||'').replace(/"/g,'&quot;')}"></div>
      <div><label style="font-size:12px;color:#666">البريد</label><input id="euEmail" class="modal-input" style="width:100%" value="${String(u.email||'').replace(/"/g,'&quot;')}"></div>
    </div>
    <div style="margin-top:12px;text-align:left">
      <button class="btn btn-primary" onclick="doEditSupervisorUser(${id})"><i class="fas fa-save"></i> حفظ</button>
    </div>`,
    () => {}
  );
}

async function doEditSupervisorUser(id) {
  const name = document.getElementById('euName')?.value?.trim();
  const username = document.getElementById('euUser')?.value?.trim();
  const password = document.getElementById('euPass')?.value?.trim();
  const governorate = document.getElementById('euGov')?.value;
  const phone = document.getElementById('euPhone')?.value?.trim();
  const email = document.getElementById('euEmail')?.value?.trim();
  const missing = [];
  if (!name) missing.push('الاسم');
  if (!username) missing.push('اسم المستخدم');
  if (missing.length) { showToast('❌ البيانات الناقصة: ' + missing.join('، ')); return; }
  try {
    await api('PUT', '/users/' + id, { username, password, name, governorate, phone, email });
    closeModal();
    showToast('✅ تم التعديل');
    renderSupervisorData();
  } catch (e) { showToast('❌ ' + e.message); }
}

async function deleteSupervisorUser(id) {
  if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
  try {
    await api('DELETE', '/users/' + id);
    showToast('✅ تم الحذف');
    renderSupervisorData();
  } catch (e) { showToast('❌ ' + e.message); }
}

async function renderArchive() {
  const el = document.getElementById('mainContent');
  try {
    window.location.hash = '#archive';
    const items = await api('GET', '/archive');
    const countCons = items.filter(r => r.type === 'منصرف فصائل الدم').length;

    el.innerHTML = `<div class="page-actions"><button class="btn-back" onclick="goBack()"><i class="fas fa-arrow-right"></i> الرئيسية</button></div>
      <div class="page-title"><i class="fas fa-archive" style="color:#607d8b"></i> الأرشيف</div>
      <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:20px;justify-content:center">
      <div class="menu-item" onclick="showArchiveConsumption()" style="width:140px;height:120px;cursor:pointer">
        <div class="menu-icon"><i class="fas fa-droplet" style="color:#e91e63;font-size:32px"></i></div>
        <div class="menu-label">أرشيف منصرف الفصائل</div>
        <div style="font-size:11px;color:#999">${countCons} أرشيف</div>
      </div>
      <div class="menu-item" onclick="showArchiveIndicators()" style="width:140px;height:120px;cursor:pointer">
        <div class="menu-icon"><i class="fas fa-chart-line" style="color:#3f51b5;font-size:32px"></i></div>
        <div class="menu-label">أرشيف مؤشرات الأداء</div>
        <div style="font-size:11px;color:#999">${items.filter(r => r.type === 'مؤشرات الأداء' || r.type === 'مؤشرات تجميعيه' || r.type === 'مؤشرات تخزينيه').length} أرشيف</div>
      </div>
    </div>`;
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

async function showArchiveConsumption() {
  const el = document.getElementById('mainContent');
  try {
    const me = await api('GET', '/me');
    const items = await api('GET', '/archive');
    const consumptionArchives = items.filter(r => r.type === 'منصرف فصائل الدم').reverse();
    const isAdmin = me.user.id === 1;
    window._isArchiveAdmin = isAdmin;

    el.innerHTML = `<div class="page-actions">
      <button class="btn-back" onclick="renderArchive()"><i class="fas fa-arrow-right"></i> الأرشيف</button>
    </div>
    <div class="page-title"><i class="fas fa-droplet" style="color:#e91e63"></i> أرشيف منصرف فصائل الدم</div>
    ${isAdmin ? `
    <div class="card" style="margin-bottom:16px;border-right:4px solid #795548">
      <div class="card-header" style="padding:10px 16px;background:#efebe9"><strong><i class="fas fa-pen"></i> إدخال بيانات سابقة</strong></div>
      <div class="card-body" style="padding:10px 16px">
        <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end">
          <div class="form-group"><label>السنة</label>
            <select class="form-control" id="addArchYear" style="width:100px">${[2026,2025,2024,2023,2022].map(y => `<option value="${y}">${y}</option>`).join('')}</select></div>
          <div class="form-group"><label>الفترة</label>
            <select class="form-control" id="addArchPeriod" onchange="toggleAddArchMonth()" style="width:120px">
              <option value="monthly">شهري</option>
              <option value="h1">نصف سنوي أول</option>
              <option value="h2">نصف سنوي ثاني</option>
              <option value="yearly">سنوي</option>
            </select></div>
          <div class="form-group" id="addArchMonthGroup"><label>الشهر</label>
            <select class="form-control" id="addArchMonth" style="width:120px">${MONTHS_AR.map((m,i) => `<option value="${i+1}">${m}</option>`).join('')}</select></div>
          <div class="form-group" style="flex:1;min-width:200px"><label>بنك الدم</label>
            <select class="form-control" id="addArchHosp"></select></div>
          ${['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(t => 
            `<div style="width:65px"><label style="font-size:11px;font-weight:600">${t}</label>
            <input class="form-control" id="addArch${t.replace('+','P').replace('-','N')}" type="number" value="0" style="height:32px;font-size:12px;text-align:center"></div>`
          ).join('')}
          <button class="btn btn-primary" onclick="saveArchiveConsumption()" style="height:32px"><i class="fas fa-save"></i> حفظ في الأرشيف</button>
        </div>
      </div>
    </div>` : ''}
    <div class="card" style="margin-bottom:16px">
      <div class="card-header" style="padding:10px 16px;background:#e8f5e9"><strong><i class="fas fa-filter"></i> فلترة البيانات</strong></div>
      <div class="card-body" style="padding:10px 16px">
        <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end">
          <div class="form-group"><label>الفرع</label>
            <select class="form-control" id="filterGov" onchange="onArchiveFilterChange()" style="width:150px"><option value="">الكل</option></select></div>
          <div class="form-group"><label>السنة</label>
            <select class="form-control" id="filterYear" onchange="onArchiveFilterChange()" style="width:100px"><option value="">الكل</option></select></div>
          <div class="form-group"><label>الشهر</label>
            <select class="form-control" id="filterMonth" onchange="onArchiveFilterChange()" style="width:120px"><option value="">الكل</option>
              ${MONTHS_AR.map((m,i) => `<option value="${i+1}">${m}</option>`).join('')}</select></div>
          <div class="form-group"><label>الفترة</label>
            <select class="form-control" id="filterPeriod" onchange="onArchiveFilterChange()" style="width:120px">
              <option value="all">الكل</option>
              <option value="">شهري</option>
              <option value="q1">الربع الأول</option>
              <option value="q2">الربع الثاني</option>
              <option value="q3">الربع الثالث</option>
              <option value="q4">الربع الرابع</option>
              <option value="h1">النصف الأول</option>
              <option value="h2">النصف الثاني</option>
              <option value="year">سنوي</option>
            </select></div>
          <div class="form-group" style="flex:1;min-width:200px"><label>بنك الدم</label>
            <select class="form-control" id="filterHosp" onchange="onArchiveFilterChange()"><option value="">الكل</option></select></div>
        </div>
      </div>
    </div>
    <div id="archConsTable"></div>`;

    if (isAdmin) {
      const hospitals = await api('GET', '/hospitals');
      document.getElementById('addArchHosp').innerHTML = hospitals.map(h => `<option value="${h.id}">${h.name}</option>`).join('');
    }

    // Populate filter dropdowns
    const govs = [...new Set((await api('GET', '/hospitals')).map(h => h.governorate))];
    const govEl = document.getElementById('filterGov');
    govs.forEach(g => { govEl.innerHTML += `<option value="${g}">${g}</option>`; });
    [2026,2025,2024,2023,2022].forEach(y => { document.getElementById('filterYear').innerHTML += `<option value="${y}">${y}</option>`; });

    // Populate hospital filter (all initially)
    const hospEl = document.getElementById('filterHosp');
    (await api('GET', '/hospitals')).forEach(h => { hospEl.innerHTML += `<option value="${h.id}">${h.name}</option>`; });

    renderArchiveConsumptionTable();
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

function toggleAddArchMonth() {
  const v = document.getElementById('addArchPeriod').value;
  document.getElementById('addArchMonthGroup').style.display = v === 'monthly' ? '' : 'none';
}

function onArchiveFilterChange() {
  // Update hospital dropdown based on selected governorate
  const gov = document.getElementById('filterGov').value;
  const savedHosp = document.getElementById('filterHosp').value;
  api('GET', '/hospitals').then(hospitals => {
    const filtered = gov ? hospitals.filter(h => h.governorate === gov) : hospitals;
    const el = document.getElementById('filterHosp');
    el.innerHTML = '<option value="">الكل</option>';
    filtered.forEach(h => {
      el.innerHTML += `<option value="${h.id}" ${h.id == savedHosp && filtered.some(f=>f.id==savedHosp) ? 'selected' : ''}>${h.name}</option>`;
    });
    renderArchiveConsumptionTable();
  }).catch(() => renderArchiveConsumptionTable());
}

function periodLabel(r) {
  if (r.period === 'yearly') return 'سنوي ' + (r.year || '');
  if (r.period === 'h1') return 'نصف سنوي أول ' + (r.year || '');
  if (r.period === 'h2') return 'نصف سنوي ثاني ' + (r.year || '');
  return MONTHS_AR[(r.month||1)-1] + ' ' + (r.year||'');
}

async function renderArchiveConsumptionTable() {
  const el = document.getElementById('archConsTable');
  if (!el) return;
  const fGov = document.getElementById('filterGov')?.value || '';
  const fYear = document.getElementById('filterYear')?.value || '';
  const fMonth = document.getElementById('filterMonth')?.value || '';
  const fPeriod = document.getElementById('filterPeriod')?.value || '';
  const fHosp = document.getElementById('filterHosp')?.value || '';

  const PERIODS = {
    'q1': { label: 'الربع الأول', months: [1,2,3] },
    'q2': { label: 'الربع الثاني', months: [4,5,6] },
    'q3': { label: 'الربع الثالث', months: [7,8,9] },
    'q4': { label: 'الربع الرابع', months: [10,11,12] },
    'h1': { label: 'النصف الأول', months: [1,2,3,4,5,6] },
    'h2': { label: 'النصف الثاني', months: [7,8,9,10,11,12] },
    'year': { label: 'سنوي', months: [1,2,3,4,5,6,7,8,9,10,11,12] }
  };

  const BP = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];

  try {
    const items = await api('GET', '/archive');
    const allRecords = [];
    items.filter(r => r.type === 'منصرف فصائل الدم').forEach(a => {
      const records = tryParse(a.data) || [];
      records.forEach(r => { r._archiveId = a.id; r._archiveTitle = a.title; r._archiveDate = a.date; });
      allRecords.push(...records);
    });

    let filtered = allRecords;
    if (fGov) filtered = filtered.filter(r => r.governorate === fGov);
    if (fYear) filtered = filtered.filter(r => r.year === parseInt(fYear));
    if (fHosp) filtered = filtered.filter(r => r.hospital_id === parseInt(fHosp));

    // Apply period filter
    if (fPeriod === '') {
      // شهري - show only monthly records
      filtered = filtered.filter(r => !r.period || r.period === 'monthly');
    } else if (fPeriod && PERIODS[fPeriod]) {
      // Period aggregation — also include pre-aggregated records that match
      const periodMap = { year: ['yearly','h1','h2'], h1: ['h1'], h2: ['h2'] };
      const matchPeriods = periodMap[fPeriod] || [];
      const monthlyRecs = filtered.filter(r => !r.period || r.period === 'monthly').filter(r => PERIODS[fPeriod].months.includes(r.month));
      const preAggRecs = matchPeriods.length ? filtered.filter(r => matchPeriods.includes(r.period)) : [];
      const agg = {};
      monthlyRecs.forEach(r => {
        const bt = (typeof r.blood_types === 'string' ? tryParse(r.blood_types) : r.blood_types) || {};
        const key = r.governorate + '|' + r.hospital_id + '|' + (r.hospital_name || '') + '|' + r.year;
        if (!agg[key]) {
          agg[key] = { governorate: r.governorate, hospital_id: r.hospital_id, hospital_name: r.hospital_name, year: r.year, _period: PERIODS[fPeriod].label, _bloodTypesSum: {} };
          BP.forEach(b => agg[key]._bloodTypesSum[b] = 0);
        }
        BP.forEach(b => { agg[key]._bloodTypesSum[b] += parseInt(bt[b]) || 0; });
      });
      const aggList = Object.values(agg);
      aggList.forEach(r => { r.blood_types = r._bloodTypesSum; r._displayPeriod = r._period; delete r._bloodTypesSum; });
      filtered = [...aggList, ...preAggRecs];
    } else if (fMonth) {
      filtered = filtered.filter(r => !r.period || r.period === 'monthly');
      filtered = filtered.filter(r => r.month === parseInt(fMonth));
    }
    // else (fPeriod === 'all') show all: monthly, half-yearly, yearly

    el.innerHTML = !filtered.length ? '<div class="empty-msg">لا توجد بيانات مطابقة</div>' :
      `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span style="font-size:13px;color:#666">إجمالي السجلات: ${filtered.length}</span>
        <div>
          <button class="btn btn-sm btn-outline" onclick="exportExcel()" style="color:#2e7d32"><i class="fas fa-file-excel"></i> تحميل Excel</button>
          <button class="btn btn-sm btn-outline" onclick="exportPDF()" style="color:#c62828;margin-right:6px"><i class="fas fa-file-pdf"></i> طباعة PDF</button>
        </div>
      </div>
      <div class="table-scroll" id="exportTable"><table class="data-table consumption-table"><thead><tr>
        <th>الفرع</th><th>اسم بنك الدم</th><th>الفترة</th>
        ${BP.map(t => `<th>${t}</th>`).join('')}
        <th>المجموع</th><th></th></tr></thead><tbody>
      ${filtered.map(r => {
        const bt = (typeof r.blood_types === 'string' ? tryParse(r.blood_types) : r.blood_types) || {};
        const total = Object.values(bt).reduce((s, v) => s + (parseInt(v) || 0), 0);
        return `<tr>
          <td style="text-align:right;font-weight:600">${r.governorate || ''}</td>
          <td style="text-align:right">${r.hospital_name || ''}</td>
          <td>${r._displayPeriod || periodLabel(r)}</td>
          ${BP.map(t => `<td style="text-align:center">${bt[t] || 0}</td>`).join('')}
          <td style="text-align:center;font-weight:bold">${total}</td>
          <td>${r._archiveId && r.hospital_id && window._isArchiveAdmin ? `<button class="btn btn-sm btn-outline" onclick="editArchiveRecord(${r._archiveId},${r.hospital_id},${r.year},${r.month||0},'${(r.period||'monthly')}')" style="color:#1976d2;font-size:10px;margin-left:4px"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-outline" onclick="deleteArchiveRecord(${r._archiveId},${r.hospital_id},${r.year},${r.month||0},'${(r.period||'monthly')}')" style="color:#dc3545;font-size:10px"><i class="fas fa-trash"></i></button>` : ''}</td>
        </tr>`;
      }).join('')}
      </tbody></table></div>`;
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

async function editArchiveRecord(archiveId, hospitalId, year, month, period) {
  try {
    const items = await api('GET', '/archive');
    const arch = items.find(a => a.id === archiveId);
    if (!arch) { alert('لم يتم العثور على الأرشيف'); return; }
    let data = tryParse(arch.data) || [];
    const record = data.find(r => r.hospital_id === hospitalId && r.year === year && (month > 0 ? r.month === month : true) && (r.period || 'monthly') === (period || 'monthly'));
    if (!record) { alert('لم يتم العثور على السجل'); return; }
    const bt = typeof record.blood_types === 'string' ? tryParse(record.blood_types) : record.blood_types || {};
    const BP = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];
    openModal('تعديل بيانات الأرشيف',
      `<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end">
        <div><label style="font-size:11px;font-weight:600">بنك الدم</label><div style="padding:6px 0;font-weight:600">${record.hospital_name || ''}</div></div>
        <div><label style="font-size:11px;font-weight:600">الفترة</label><div style="padding:6px 0">${record._displayPeriod || periodLabel(record)}</div></div>
        ${BP.map(t => `<div style="width:65px"><label style="font-size:11px;font-weight:600">${t}</label>
        <input class="form-control edArcInp" id="edArc${t.replace('+','P').replace('-','N')}" type="number" value="${bt[t]||0}" style="height:32px;font-size:12px;text-align:center"></div>`).join('')}
      </div>`,
      `<button class="btn btn-secondary" onclick="closeModal()">إلغاء</button>
      <button class="btn btn-primary" onclick="saveEditArchiveRecord(${archiveId},${hospitalId},${year},${month},'${period}')">حفظ</button>`);
  } catch (e) { alert(e.message); }
}

async function saveEditArchiveRecord(archiveId, hospitalId, year, month, period) {
  try {
    const bloodTypes = {};
    ['A+','A-','B+','B-','O+','O-','AB+','AB-'].forEach(t => {
      bloodTypes[t] = parseInt(document.getElementById('edArc' + t.replace('+','P').replace('-','N')).value) || 0;
    });
    const items = await api('GET', '/archive');
    const arch = items.find(a => a.id === archiveId);
    if (!arch) { alert('لم يتم العثور على الأرشيف'); return; }
    let data = tryParse(arch.data) || [];
    data = data.map(r => {
      if (r.hospital_id === hospitalId && r.year === year && (month > 0 ? r.month === month : true) && (r.period || 'monthly') === (period || 'monthly')) {
        return { ...r, blood_types: bloodTypes };
      }
      return r;
    });
    await api('PUT', '/archive/' + archiveId, { data });
    closeModal();
    showToast('✅ تم تعديل البيانات في الأرشيف بنجاح');
    renderArchiveConsumptionTable();
  } catch (e) { alert(e.message); }
}

async function deleteArchiveRecord(archiveId, hospitalId, year, month, period) {
  if (!confirm('هل أنت متأكد من حذف هذا السجل من الأرشيف؟')) return;
  try {
    const items = await api('GET', '/archive');
    const arch = items.find(a => a.id === archiveId);
    if (!arch) { alert('لم يتم العثور على الأرشيف'); return; }
    let data = tryParse(arch.data) || [];
    data = data.filter(r => {
      if (r.hospital_id !== hospitalId) return true;
      if (r.year !== year) return true;
      if (month > 0 && r.month !== month) return true;
      const rPeriod = r.period || 'monthly';
      const btnPeriod = period || 'monthly';
      if (rPeriod !== btnPeriod) return true;
      return false;
    });
    if (data.length === 0) {
      await api('DELETE', '/archive/' + archiveId);
    } else {
      await api('PUT', '/archive/' + archiveId, { data });
    }
    renderArchiveConsumptionTable();
  } catch (e) { alert(e.message); }
}

async function saveArchiveConsumption() {
  const hospitalId = parseInt(document.getElementById('addArchHosp').value);
  const year = parseInt(document.getElementById('addArchYear').value);
  const period = document.getElementById('addArchPeriod').value;
  const month = period === 'monthly' ? parseInt(document.getElementById('addArchMonth').value) : null;
  const bloodTypes = {};
  ['A+','A-','B+','B-','O+','O-','AB+','AB-'].forEach(t => {
    bloodTypes[t] = parseInt(document.getElementById('addArch' + t.replace('+','P').replace('-','N')).value) || 0;
  });
  try {
    await api('POST', '/monthly-consumption/archive-direct', { hospitalId, year, month, period, bloodTypes });
    ['A+','A-','B+','B-','O+','O-','AB+','AB-'].forEach(t => {
      document.getElementById('addArch' + t.replace('+','P').replace('-','N')).value = 0;
    });
    showToast('✅ تم حفظ البيانات في الأرشيف بنجاح');
    renderArchiveConsumptionTable();
  } catch (e) { alert(e.message); }
}

// ============== أرشيف مؤشرات الأداء ==============

async function showArchiveIndicators() {
  const el = document.getElementById('mainContent');
  try {
    const me = await api('GET', '/me');
    const isAdmin = me.user.id === 1;
    window._isArchiveAdmin = isAdmin;
    if (window._archiveEditLocked === undefined) window._archiveEditLocked = true;

    el.innerHTML = `<div class="page-actions">
      <button class="btn-back" onclick="renderArchive()"><i class="fas fa-arrow-right"></i> الأرشيف</button>
    </div>
    <div class="page-title"><i class="fas fa-chart-line" style="color:#3f51b5"></i> أرشيف مؤشرات الأداء</div>
    ${isAdmin ? `
    <div class="card" style="margin-bottom:16px;border-right:4px solid #795548">
      <div class="card-header" style="padding:10px 16px;background:#efebe9"><strong><i class="fas fa-pen"></i> إدخال بيانات سابقة</strong></div>
      <div class="card-body" style="padding:10px 16px">
        <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin-bottom:10px">
          <div class="form-group"><label>السنة</label>
            <select class="form-control" id="addIndArchYear" style="width:100px">${[2026,2025,2024,2023,2022].map(y => `<option value="${y}">${y}</option>`).join('')}</select></div>
          <div class="form-group"><label>الشهر</label>
            <select class="form-control" id="addIndArchMonth" style="width:120px">${MONTHS_AR.map((m,i) => `<option value="${i+1}">${m}</option>`).join('')}</select></div>
          <div class="form-group" style="min-width:200px"><label>بنك الدم</label>
            <select class="form-control" id="addIndArchHosp"></select></div>
          <div class="form-group"><label>النوع</label>
            <select class="form-control" id="addIndArchType" onchange="toggleIndArchForm()" style="width:120px">
              <option value="big">تجميعي</option>
              <option value="small">تخزيني</option>
            </select></div>
        </div>
        <div id="addIndArchFormWrap"></div>
        <div style="margin-top:10px"><button class="btn btn-primary" onclick="saveArchiveIndicators()" style="height:32px"><i class="fas fa-save"></i> حفظ في الأرشيف</button></div>
      </div>
    </div>` : ''}
    <div class="card" style="margin-bottom:16px">
      <div class="card-header" style="padding:10px 16px;background:#e8f5e9"><strong><i class="fas fa-filter"></i> فلترة البيانات</strong></div>
      <div class="card-body" style="padding:10px 16px">
        <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end">
          <div class="form-group"><label>الفرع</label>
            <select class="form-control" id="filterIndGov" onchange="onIndicatorsArchiveFilterChange()" style="width:150px"><option value="">الكل</option></select></div>
          <div class="form-group"><label>السنة</label>
            <select class="form-control" id="filterIndYear" onchange="onIndicatorsArchiveFilterChange()" style="width:100px"><option value="">الكل</option></select></div>
          <div class="form-group"><label>الشهر</label>
            <select class="form-control" id="filterIndMonth" onchange="onIndicatorsArchiveFilterChange()" style="width:120px"><option value="">الكل</option>
              ${MONTHS_AR.map((m,i) => `<option value="${i+1}">${m}</option>`).join('')}</select></div>
          <div class="form-group"><label>الفترة</label>
            <select class="form-control" id="filterIndPeriod" onchange="onIndicatorsArchiveFilterChange()" style="width:120px">
              <option value="all">الكل</option>
              <option value="">شهري</option>
              <option value="q1">الربع الأول</option>
              <option value="q2">الربع الثاني</option>
              <option value="q3">الربع الثالث</option>
              <option value="q4">الربع الرابع</option>
              <option value="h1">النصف الأول</option>
              <option value="h2">النصف الثاني</option>
              <option value="year">سنوي</option>
            </select></div>
          <div class="form-group"><label>النوع</label>
            <select class="form-control" id="filterIndType" onchange="onIndicatorsArchiveFilterChange()" style="width:120px">
              <option value="">الكل</option>
              <option value="تجميعي">تجميعي</option>
              <option value="تخزيني">تخزيني</option>
            </select></div>
          <div class="form-group" style="flex:1;min-width:200px"><label>بنك الدم</label>
            <select class="form-control" id="filterIndHosp" onchange="onIndicatorsArchiveFilterChange()"><option value="">الكل</option></select></div>
          <div class="form-group" style="display:flex;align-items:end;padding-bottom:4px">
            <label style="display:flex;align-items:center;gap:4px;font-weight:400;cursor:pointer;font-size:13px">
              <input type="checkbox" id="filterIndGovAgg" onchange="renderArchiveIndicatorsTable()"> إجمالي الفرع
            </label>
          </div>
          ${isAdmin ? `
          <div class="form-group" style="display:flex;align-items:end;padding-bottom:4px">
            <button id="lockToggleBtn" class="btn btn-sm ${window._archiveEditLocked ? 'btn-secondary' : 'btn-warning'}" onclick="toggleArchiveEditLock()" style="font-size:11px">
              <i class="fas ${window._archiveEditLocked ? 'fa-lock' : 'fa-lock-open'}"></i> ${window._archiveEditLocked ? 'قفل التعديل' : 'فتح التعديل'}
            </button>
          </div>` : ''}
        </div>
      </div>
    </div>
    <div id="archIndTable"></div>`;

    if (isAdmin) {
      const hospitals = await api('GET', '/hospitals');
      document.getElementById('addIndArchHosp').innerHTML = hospitals.map(h => `<option value="${h.id}">${h.name}</option>`).join('');
      toggleIndArchForm();
    }

    const govs = [...new Set((await api('GET', '/hospitals')).map(h => h.governorate))];
    const govEl = document.getElementById('filterIndGov');
    govs.forEach(g => { govEl.innerHTML += `<option value="${g}">${g}</option>`; });
    [2026,2025,2024,2023,2022].forEach(y => { document.getElementById('filterIndYear').innerHTML += `<option value="${y}">${y}</option>`; });

    const hospEl = document.getElementById('filterIndHosp');
    (await api('GET', '/hospitals')).forEach(h => { hospEl.innerHTML += `<option value="${h.id}">${h.name}</option>`; });

    renderArchiveIndicatorsTable();
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

function toggleIndArchForm() {
  const type = document.getElementById('addIndArchType').value;
  const wrap = document.getElementById('addIndArchFormWrap');
  const defs = type === 'big' ? BIG_COL_DEFS : SMALL_COL_DEFS;
  wrap.innerHTML = buildIndicatorFormHTML(defs, 'archIndInput', '');
}

async function saveArchiveIndicators() {
  const hospitalId = parseInt(document.getElementById('addIndArchHosp').value);
  const year = parseInt(document.getElementById('addIndArchYear').value);
  const month = parseInt(document.getElementById('addIndArchMonth').value);
  const type = document.getElementById('addIndArchType').value;
  const colDefs = type === 'big' ? BIG_COL_DEFS : SMALL_COL_DEFS;
  const data = collectIndicatorFormData('archIndInput', colDefs);
  try {
    const endpoint = type === 'big' ? '/monthly-big-indicators/archive-direct' : '/monthly-small-indicators/archive-direct';
    await api('POST', endpoint, { hospitalId, year, month, data });
    // Reset form fields to 0
    colDefs.filter(c => !c.formula && c.key !== 'governorate' && c.key !== 'hospital_name').forEach(c => {
      const el = document.getElementById('archIndInput_' + c.key);
      if (el) el.value = 0;
    });
    showToast('✅ تم حفظ البيانات في الأرشيف بنجاح');
    renderArchiveIndicatorsTable();
  } catch (e) { alert(e.message); }
}

function onIndicatorsArchiveFilterChange() {
  const gov = document.getElementById('filterIndGov').value;
  const savedHosp = document.getElementById('filterIndHosp').value;
  api('GET', '/hospitals').then(hospitals => {
    const filtered = gov ? hospitals.filter(h => h.governorate === gov) : hospitals;
    const el = document.getElementById('filterIndHosp');
    el.innerHTML = '<option value="">الكل</option>';
    filtered.forEach(h => {
      el.innerHTML += `<option value="${h.id}" ${h.id == savedHosp && filtered.some(f=>f.id==savedHosp) ? 'selected' : ''}>${h.name}</option>`;
    });
    renderArchiveIndicatorsTable();
  }).catch(() => renderArchiveIndicatorsTable());
}

function renderArchiveIndicatorsTable() {
  const el = document.getElementById('archIndTable');
  if (!el) return;
  const fGov = document.getElementById('filterIndGov')?.value || '';
  const fYear = document.getElementById('filterIndYear')?.value || '';
  const fPeriod = document.getElementById('filterIndPeriod')?.value || '';
  const fType = document.getElementById('filterIndType')?.value || '';
  const fHosp = document.getElementById('filterIndHosp')?.value || '';
  const fMonth = document.getElementById('filterIndMonth')?.value || '';

  const PERIODS = {
    q1: { label: 'الربع الأول', months: [1,2,3] },
    q2: { label: 'الربع الثاني', months: [4,5,6] },
    q3: { label: 'الربع الثالث', months: [7,8,9] },
    q4: { label: 'الربع الرابع', months: [10,11,12] },
    h1: { label: 'النصف الأول', months: [1,2,3,4,5,6] },
    h2: { label: 'النصف الثاني', months: [7,8,9,10,11,12] },
    year: { label: 'سنوي', months: [1,2,3,4,5,6,7,8,9,10,11,12] }
  };
  const months = ['يناير','فبراير','مارس','ابريل','مايو','يونيو','يوليو','اغسطس','سبتمبر','اكتوبر','نوفمبر','ديسمبر'];

  Promise.all([api('GET', '/archive'), getArchHospitals()]).then(([items, hospitals]) => {
    const bigRecords = [];
    const smallRecords = [];
    items.filter(r => r.type === 'مؤشرات الأداء' || r.type === 'مؤشرات تجميعيه' || r.type === 'مؤشرات تخزينيه' || r.type === 'مؤشرات 2026').forEach(a => {
      const recs = tryParse(a.data) || [];
      recs.forEach(r => {
        if (!r.governorate && r.h_governorate) r.governorate = r.h_governorate;
        if (!r.hospital_name && r.h_name) r.hospital_name = r.h_name;
        if (!r.hospital_id && r.h_id) r.hospital_id = r.h_id;
        r._archiveId = a.id; r._archiveTitle = a.title; r._archiveDate = a.date;
        if (a.type === 'مؤشرات تجميعيه' || a.type === 'مؤشرات 2026') {
          bigRecords.push(r);
        } else if (a.type === 'مؤشرات تخزينيه') {
          smallRecords.push(r);
        } else if (a.type === 'مؤشرات الأداء') {
          const d = typeof r.data === 'string' ? tryParse(r.data) : r.data || {};
          const hasBigKeys = ['inc_blood','out_blood_int','collect_total'].some(k => k in d);
          const hasSmallKeys = ['inc_collected','inc_regional','out_blood'].some(k => k in d);
          if (hasBigKeys) bigRecords.push(r);
          else if (hasSmallKeys) smallRecords.push(r);
        }
      });
    });

    function applyFilters(records) {
      let filtered = records;
      if (fGov) filtered = filtered.filter(r => r.governorate === fGov);
      if (fYear) filtered = filtered.filter(r => r.year === parseInt(fYear));
      if (fHosp) filtered = filtered.filter(r => parseInt(r.hospital_id) === parseInt(fHosp));
      if (fMonth) filtered = filtered.filter(r => (r.month || 0) === parseInt(fMonth));
      if (fPeriod && fPeriod !== 'all' && PERIODS[fPeriod]) {
        filtered = filtered.filter(r => PERIODS[fPeriod].months.includes(r.month));
      }
      return filtered;
    }

    let filteredBig = applyFilters(bigRecords);
    let filteredSmall = applyFilters(smallRecords);
    const isAdmin = window._isArchiveAdmin;
    const fGovAgg = document.getElementById('filterIndGovAgg')?.checked || false;

    function aggregateByGovernorate(records) {
      const agg = {};
      records.forEach(r => {
        if (r._isAggregate) return;
        const gov = r.governorate || 'بدون فرع';
        if (!agg[gov]) {
          agg[gov] = { governorate: gov, hospital_name: 'إجمالي الفرع', _isAggregate: true, _aggData: {}, hospital_id: null, year: r.year, month: null };
        }
        const d = typeof r.data === 'string' ? tryParse(r.data) : r.data || {};
        Object.keys(d).forEach(k => {
          if (typeof d[k] === 'number') agg[gov]._aggData[k] = (agg[gov]._aggData[k] || 0) + d[k];
        });
      });
      return Object.values(agg).map(r => { r.data = r._aggData; delete r._aggData; return r; });
    }

    if (fGovAgg) {
      filteredBig = aggregateByGovernorate(filteredBig);
      filteredSmall = aggregateByGovernorate(filteredSmall);
    }

    function addPeriodTotals(records) {
      if (!fPeriod || fPeriod === 'all' || fPeriod === '' || fMonth) return records;
      if (fGovAgg) return records;
      const periodInfo = PERIODS[fPeriod];
      if (!periodInfo || periodInfo.months.length <= 1) return records;
      const agg = {};
      records.forEach(r => {
        const d = typeof r.data === 'string' ? tryParse(r.data) : r.data || {};
        const key = (r.governorate || '') + '|' + (r.hospital_id || '') + '|' + (r.hospital_name || '');
        if (!agg[key]) {
          agg[key] = { governorate: r.governorate, hospital_id: r.hospital_id, hospital_name: r.hospital_name, _archiveId: null, _isAggregate: true, _aggData: {}, _childArchiveIds: [] };
        }
        if (r._archiveId) agg[key]._childArchiveIds.push(r._archiveId);
        Object.keys(d).forEach(k => {
          if (typeof d[k] === 'number') agg[key]._aggData[k] = (agg[key]._aggData[k] || 0) + d[k];
        });
      });
      Object.values(agg).forEach(r => { r.data = r._aggData; delete r._aggData; });
      return records.concat(Object.values(agg));
    }

    filteredBig = addPeriodTotals(filteredBig);
    filteredSmall = addPeriodTotals(filteredSmall);
    const totalCount = filteredBig.length + filteredSmall.length;

    if (!totalCount) {
      el.innerHTML = '<div class="empty-msg">لا توجد بيانات مطابقة</div>';
      return;
    }

    function renderGroup(records, colDefs, computeFn, title) {
      if (!records.length) return '';
      records.sort((a, b) => (a.year || 0) * 100 + (a.month || 0) - (b.year || 0) * 100 - (b.month || 0));
      const canEditDel = isAdmin;
      const mh = makeGroupHeader(colDefs).replace(/(rowspan="[23]">بنك الدم<\/th>)/, '$1<th rowspan="3" style="min-width:44px;font-size:11px;color:#5A7A9A">الشهر</th>');
      let h = `<div style="margin-top:20px"><div class="table-scroll"><table class="data-table ind-table" style="min-width:800px"><thead>
        <tr><th colspan="${colDefs.length + 1 + (canEditDel ? 1 : 0)}" style="text-align:center;background:linear-gradient(135deg,#5A7A9A,#7A9ABA);color:#fff;font-size:13px">${title}</th></tr>
        ${mh}
      </thead><tbody>`;
      h += records.map(r => {
        const d = typeof r.data === 'string' ? tryParse(r.data) : r.data || {};
        const f = computeFn(d);
        const isAgg = r._isAggregate;
        const m = isAgg ? (PERIODS[fPeriod]?.label || 'إجمالي') : (months[(r.month||1)-1] + ' ' + (r.year||''));
        const rowStyle = isAgg ? ' style="background:#fff3cd;font-weight:700"' : '';
        const rowId = r._archiveId && !isAgg ? ` data-archid="${r._archiveId}" data-hid="${r.hospital_id}" data-y="${r.year}" data-m="${r.month||0}" data-p="${r.period||'monthly'}"` : '';
        return `<tr${rowStyle}${rowId}>
          ${colDefs.map((c, ci) => {
            const val = c.formula ? (f[c.key] ?? 0) : (c.key === 'governorate' ? (r.governorate || '') : c.key === 'hospital_name' ? (r.hospital_name || '') : (d[c.key] ?? 0));
            let display = val;
            let style = '';
            if (c.formula && val != null) {
              const n = parseFloat(val);
              if (!isNaN(n) && (c.key.startsWith('pct_') || c.key.startsWith('child_pct_') || c.key.startsWith('ratio_'))) {
                display = formatFormulaVal(c.key, n);
                if (isAboveTarget(colDefs, c.key, n)) { style = ' style="color:#e74c3c;font-weight:700;background:#ffeaea"'; }
              } else if (!isNaN(n)) {
                display = formatFormulaVal(c.key, n);
              }
            }
            let cls = c.formula ? 'class="formula-cell"' : '';
            const isEditable = !c.formula && !isAgg && c.key !== 'governorate' && c.key !== 'hospital_name' && !window._archiveEditLocked && window._isArchiveAdmin;
            const contentEdit = isEditable ? ' contenteditable="true" directinput="true" onfocus="archiveCellFocus(this)" onblur="saveArchiveCell(this)" onpaste="handleArchivePaste(event)" onkeydown="if(event.key==\'Enter\'){event.preventDefault();this.blur()}"' : '';
            const edCls = isEditable ? ' class="editable-cell"' : '';
            let td = `<td style="text-align:center;${c.key === 'governorate' || c.key === 'hospital_name' ? 'text-align:right;font-weight:600' : ''}" ${cls}${style}${contentEdit}${edCls} data-key="${c.key}">${display}</td>`;
            if (ci === 1) td += `<td style="white-space:nowrap;font-size:11px;color:#5A7A9A;font-weight:600">${m}</td>`;
            return td;
          }).join('')}
          ${canEditDel && isAgg && r._childArchiveIds && r._childArchiveIds.length
            ? `<td style="text-align:center"><button class="btn btn-sm btn-outline" onclick="if(confirm('حذف كل سجلات ${PERIODS[fPeriod]?.label || 'الفترة'} لهذا المستشفى؟')){deleteArchiveIndicatorGroup([${r._childArchiveIds.join(',')}])}" style="color:#dc3545;font-size:10px"><i class="fas fa-trash"></i> حذف المجموعة</button></td>`
            : (canEditDel && r._archiveId && !isAgg
              ? `<td><button class="btn btn-sm btn-outline" onclick="editIndicatorArchiveRecord(${r._archiveId},${r.hospital_id},${r.year},${r.month||0},'${(r.period||'monthly')}')" style="color:#1976d2;font-size:10px;margin-left:4px"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-outline" onclick="deleteIndicatorArchiveRecord(${r._archiveId},${r.hospital_id},${r.year},${r.month||0},'${(r.period||'monthly')}')" style="color:#dc3545;font-size:10px"><i class="fas fa-trash"></i></button></td>`
              : '<td></td>')}
        </tr>`;
      }).join('');
      h += '</tbody></table></div></div>';
      return h;
    }

    let html = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <span style="font-size:13px;color:#666">إجمالي السجلات: ${totalCount}</span>
      <div>
        <button class="btn btn-success btn-sm" onclick="exportArchiveIndicatorsExcel()" style="font-size:11px"><i class="fas fa-file-excel"></i> تحميل Excel</button>
      </div>
    </div>`;
    if (!fType || fType === 'تجميعي') html += renderGroup(filteredBig, BIG_COL_DEFS, computeBigFormulas, 'مؤشرات أداء البنوك التجميعية');
    if (!fType || fType === 'تخزيني') html += renderGroup(filteredSmall, SMALL_COL_DEFS, computeSmallFormulas, 'مؤشرات أداء البنوك التخزينية');
    el.innerHTML = html;
  }).catch(e => { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; });
}

async function deleteArchiveIndicatorGroup(archiveIds) {
  if (!archiveIds.length) return;
  try {
    for (const aid of archiveIds) {
      await api('DELETE', '/archive/' + aid);
    }
    showToast('✅ تم حذف جميع سجلات الفترة');
    renderArchiveIndicatorsTable();
  } catch (e) { alert(e.message); }
}

let _archiveCellOldValue = '';

function archiveCellFocus(el) {
  _archiveCellOldValue = el.textContent.trim();
}

function handleArchivePaste(ev) {
  if (!window._isArchiveAdmin || window._archiveEditLocked) return;
  ev.preventDefault();
  const data = (ev.clipboardData || window.clipboardData).getData('Text');
  if (!data) return;
  const td = ev.currentTarget;
  const tr = td.closest('tr');
  if (!tr) return;
  const table = tr.closest('table');
  if (!table) return;
  const rows = data.split(/\r?\n/).filter(r => r.trim() !== '');
  if (!rows.length) return;
  const parsed = rows.map(r => r.split('\t'));
  const isColumn = parsed.length > 1 && parsed.every(p => p.length <= 1);
  if (isColumn) {
    const vals = parsed.map(p => p[0] || '');
    let currentTr = tr;
    for (let i = 0; i < vals.length; i++) {
      if (!currentTr) break;
      const cells = currentTr.querySelectorAll('td[contenteditable="true"]');
      const idx = Array.from(cells).indexOf(td);
      if (idx >= 0 && idx < cells.length) cells[idx].textContent = vals[i].trim();
      if (i < vals.length - 1) {
        let next = currentTr.nextElementSibling;
        while (next && !next.querySelector('td[contenteditable="true"]')) next = next.nextElementSibling;
        currentTr = next;
      }
    }
    setTimeout(async () => {
      currentTr = tr;
      for (let i = 0; i < vals.length; i++) {
        if (!currentTr) break;
        const cells = currentTr.querySelectorAll('td[contenteditable="true"]');
        const idx = Array.from(cells).indexOf(td);
        if (idx >= 0 && idx < cells.length) {
          _archiveCellOldValue = '';
          await saveArchiveCell(cells[idx]);
        }
        if (i < vals.length - 1) {
          let next = currentTr.nextElementSibling;
          while (next && !next.querySelector('td[contenteditable="true"]')) next = next.nextElementSibling;
          currentTr = next;
        }
      }
    }, 100);
  } else {
    let currentTr = tr;
    for (let ri = 0; ri < parsed.length; ri++) {
      if (!currentTr) break;
      const vals = parsed[ri];
      const cells = Array.from(currentTr.querySelectorAll('td[contenteditable="true"]'));
      const start = ri === 0 ? cells.indexOf(td) : 0;
      vals.forEach((v, i) => {
        const ci = start + i;
        if (ci < cells.length) cells[ci].textContent = v.trim();
      });
      if (ri < parsed.length - 1) {
        let next = currentTr.nextElementSibling;
        while (next && !next.querySelector('td[contenteditable="true"]')) next = next.nextElementSibling;
        currentTr = next;
      }
    }
    setTimeout(async () => {
      currentTr = tr;
      for (let ri = 0; ri < parsed.length; ri++) {
        if (!currentTr) break;
        const vals = parsed[ri];
        const cells = Array.from(currentTr.querySelectorAll('td[contenteditable="true"]'));
        const start = ri === 0 ? cells.indexOf(td) : 0;
        for (let i = 0; i < vals.length; i++) {
          const ci = start + i;
          if (ci < cells.length) {
            _archiveCellOldValue = '';
            await saveArchiveCell(cells[ci]);
          }
        }
        if (ri < parsed.length - 1) {
          let next = currentTr.nextElementSibling;
          while (next && !next.querySelector('td[contenteditable="true"]')) next = next.nextElementSibling;
          currentTr = next;
        }
      }
    }, 100);
  }
}

function toggleArchiveEditLock() {
  window._archiveEditLocked = !window._archiveEditLocked;
  const btn = document.getElementById('lockToggleBtn');
  if (btn) {
    btn.className = `btn btn-sm ${window._archiveEditLocked ? 'btn-secondary' : 'btn-warning'}`;
    btn.innerHTML = `<i class="fas ${window._archiveEditLocked ? 'fa-lock' : 'fa-lock-open'}"></i> ${window._archiveEditLocked ? 'قفل التعديل' : 'فتح التعديل'}`;
  }
  if (window._archiveEditLocked) {
    document.querySelectorAll('#archIndTable td[contenteditable]').forEach(td => td.blur());
  }
  renderArchiveIndicatorsTable();
}

async function saveArchiveCell(el) {
  const tr = el.closest('tr');
  if (!tr) return;
  const archiveId = parseInt(tr.dataset.archid);
  const hospitalId = parseInt(tr.dataset.hid);
  const year = parseInt(tr.dataset.y);
  const month = parseInt(tr.dataset.m);
  const period = tr.dataset.p || 'monthly';
  const key = el.dataset.key;
  const newVal = el.textContent.trim();
  if (newVal === _archiveCellOldValue) return;
  const num = parseInt(newVal) || 0;
  try {
    const items = await api('GET', '/archive');
    const arch = items.find(a => a.id === archiveId);
    if (!arch) { el.textContent = _archiveCellOldValue; return; }
    const dataArr = tryParse(arch.data) || [];
    const updated = dataArr.map(r => {
      if (parseInt(r.hospital_id) === hospitalId && r.year === year && (month > 0 ? r.month === month : true) && (r.period || 'monthly') === period) {
        const d = typeof r.data === 'string' ? tryParse(r.data) : Object.assign({}, r.data || {});
        d[key] = num;
        return { ...r, data: d };
      }
      return r;
    });
    await api('PUT', '/archive/' + archiveId, { data: updated });
    showToast('✅ تم الحفظ');
  } catch (e) {
    el.textContent = _archiveCellOldValue;
    alert(e.message);
  }
}

function exportArchiveIndicatorsExcel() {
  const tables = document.querySelectorAll('#archIndTable table.ind-table');
  if (!tables.length) return;
  let csv = '\uFEFF';
  csv += '"أرشيف مؤشرات الأداء"\n';
  csv += '"\n';
  tables.forEach((table, ti) => {
    if (ti > 0) csv += '"\n';
    const rows = table.querySelectorAll('tr');
    rows.forEach(tr => {
      const cells = tr.querySelectorAll('th, td');
      const cols = Array.from(cells).slice(0, -1);
      csv += cols.map(c => '"' + (c.textContent || '').replace(/"/g, '""') + '"').join('\t') + '\n';
    });
  });
  csv += '\n';
  csv += '"إعداد و برمجة محمد ندا 01068880999"\n';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const now = new Date();
  a.download = 'ارشيف_مؤشرات_الاداء_' + now.toLocaleDateString('ar-EG').replace(/\//g, '-') + '.xls';
  a.click();
}
function exportExcel() {
  const table = document.querySelector('#exportTable table');
  if (!table) return;
  const fGov = document.getElementById('filterGov')?.value || '';
  const fYear = document.getElementById('filterYear')?.value || '';
  const fPeriod = document.getElementById('filterPeriod')?.value || '';
  const fHosp = document.getElementById('filterHosp')?.value || '';
  const periodLabels = { '': 'شهري', q1: 'الربع الأول', q2: 'الربع الثاني', q3: 'الربع الثالث', q4: 'الربع الرابع', h1: 'النصف الأول', h2: 'النصف الثاني', year: 'سنوي', all: 'الكل' };
  const hospName = fHosp ? document.getElementById('filterHosp')?.selectedOptions[0]?.text : '';
  let title = 'معدل صرف فصائل الدم';
  const parts = [];
  if (fYear) parts.push('سنة ' + fYear);
  if (fPeriod !== undefined && periodLabels[fPeriod]) parts.push(periodLabels[fPeriod]);
  if (fGov) parts.push('فرع ' + fGov);
  if (hospName) parts.push(hospName);
  if (parts.length) title += ' (' + parts.join(' - ') + ')';
  let csv = '\uFEFF';
  csv += '"' + title + '"\n';
  csv += '"\n';
  const rows = table.querySelectorAll('tr');
  rows.forEach(tr => {
    const cells = tr.querySelectorAll('th, td');
    const cols = Array.from(cells).slice(0, -1);
    csv += cols.map(c => '"' + (c.textContent || '').replace(/"/g, '""') + '"').join('\t') + '\n';
  });
  csv += '\n';
  csv += '"إعداد و برمجة محمد ندا 01068880999"\n';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'منصرف_فصائل_الدم_' + new Date().toLocaleDateString('ar-EG') + '.xls';
  a.click();
}

function exportPDF() {
  const table = document.querySelector('#exportTable table');
  if (!table) return;
  const fGov = document.getElementById('filterGov')?.value || '';
  const fYear = document.getElementById('filterYear')?.value || '';
  const fPeriod = document.getElementById('filterPeriod')?.value || '';
  const fHosp = document.getElementById('filterHosp')?.value || '';
  const periodLabels = { '': 'شهري', q1: 'الربع الأول', q2: 'الربع الثاني', q3: 'الربع الثالث', q4: 'الربع الرابع', h1: 'النصف الأول', h2: 'النصف الثاني', year: 'سنوي', all: 'الكل' };
  const hospName = fHosp ? document.getElementById('filterHosp')?.selectedOptions[0]?.text : '';
  let subtitle = '';
  const parts = [];
  if (fYear) parts.push('سنة ' + fYear);
  if (fPeriod !== undefined && periodLabels[fPeriod]) parts.push(periodLabels[fPeriod]);
  if (fGov) parts.push('فرع ' + fGov);
  if (hospName) parts.push(hospName);
  if (parts.length) subtitle = ' (' + parts.join(' - ') + ')';
  let html = table.outerHTML;
  html = html.replace(/<table/g, '<table style="border-collapse:collapse;width:100%;font-family:\'Traditional Arabic\',Arial;font-size:11px"');
  html = html.replace(/<th(?!\s)/g, '<th style="background:#2e7d32;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #1b5e20;text-align:center"');
  html = html.replace(/<th\s+([^>]*)>/g, (m, a) => `<th ${a} style="background:#2e7d32;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #1b5e20;text-align:center">`);
  html = html.replace(/<td(?!\s)/g, '<td style="padding:3px 5px;border:1px solid #ccc;text-align:center"');
  html = html.replace(/<td\s+([^>]*)>/g, (m, a) => `<td ${a} style="padding:3px 5px;border:1px solid #ccc;text-align:center">`);
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(`<html dir="rtl"><head><meta charset="utf-8"><title>منصرف فصائل الدم${subtitle}</title>
    <style>
      @page { size: landscape; margin: 8mm 6mm; }
      body { font-family: 'Traditional Arabic', Arial, sans-serif; padding: 8px; }
      .header { text-align:center; margin-bottom:8px }
      .header h2 { color:#2e7d32; margin:0 0 2px; font-size:15px }
      .header h3 { color:#666; margin:0; font-weight:normal; font-size:12px }
      .footer { text-align:center; margin-top:10px; font-size:10px; color:#888 }
      @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style></head><body>
    <div class="header"><h2>معدل صرف الفصائل ببنوك دم هيئة الرعاية الصحية</h2>
    ${subtitle ? '<h3>' + subtitle.replace(/[()]/g,'') + '</h3>' : ''}</div>
    ${html}
    <div class="footer">إعداد و برمجة محمد ندا 01068880999</div>
    <script>window.print();window.close();</scr` + `ipt></body></html>`);
  w.document.close();
}

async function renderUsers() {
  const el = document.getElementById('mainContent');
  try {
    const me = (await api('GET', '/me')).user;
    const isMaster = me.id === 1;
    const roles = ['admin','hospital','branch_supervisor','org_supervisor','visitor'];
    const roleLabels = { admin:'مدير', hospital:'مستشفى', branch_supervisor:'مشرف فرع', org_supervisor:'مشرف هيئة', visitor:'زائر' };
    el.innerHTML = `<div class="page-actions"><button class="btn-back" onclick="goBack()"><i class="fas fa-arrow-right"></i> الرئيسية</button>
      ${isMaster ? '<button class="btn btn-primary" onclick="showAddUserModal()"><i class="fas fa-plus"></i> إضافة</button>' : ''}</div>
      <div class="card"><div class="card-body table-scroll"><table class="data-table"><thead><tr><th>#</th><th>الاسم</th><th>اسم المستخدم</th><th>كلمة المرور</th><th>الدور</th><th>التليفون</th><th>البريد</th><th>المستشفى</th><th>الفرع</th><th></th></tr></thead><tbody id="usersBody"></tbody></table></div></div>`;
    const [users, hospitals] = await Promise.all([api('GET', '/users'), api('GET', '/hospitals')]);
    const hospMap = {};
    hospitals.forEach(h => hospMap[h.id] = h.name);
    document.getElementById('usersBody').innerHTML = users.map((u, i) => {
      const canEdit = isMaster || (me.role === 'branch_supervisor' && u.role === 'hospital' && u.governorate === me.governorate);
      const canEditSelf = me.id === u.id;
      const showEdit = canEdit || canEditSelf;
      const showKey = canEdit || canEditSelf || (me.role === 'branch_supervisor' && u.role === 'hospital' && u.governorate === me.governorate);
      return `<tr>
      <td>${i+1}</td><td>${u.name || ''}</td><td>${u.username}</td><td>${u.password || ''}</td><td>${roleLabels[u.role] || u.role}</td><td style="direction:ltr">${u.phone || ''}</td><td style="direction:ltr;font-size:11px">${u.email || ''}</td><td>${hospMap[u.hospital_id] || u.hospital_id || ''}</td><td>${u.governorate || ''}</td>
      <td>${!showEdit && !showKey ? '' :
        `${showEdit ? `<button class="btn btn-sm btn-outline" onclick="editUser(${u.id})"><i class="fas fa-edit"></i></button>` : ''}
        ${showKey ? `<button class="btn btn-sm btn-outline" onclick="changeUserPassword(${u.id})"><i class="fas fa-key"></i></button>` : ''}
        ${isMaster && u.id !== 1 ? `<button class="btn btn-sm btn-outline" onclick="deleteUser(${u.id})"><i class="fas fa-trash"></i></button>` : ''}`}</td></tr>`;
    }).join('');
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}
function showAddUserModal() {
  api('GET', '/hospitals').then(hospitals => {
    api('GET', '/governorates').then(govs => {
      const roles = ['hospital','branch_supervisor','org_supervisor','visitor'];
      const roleLabels = { hospital:'مستشفى', branch_supervisor:'مشرف فرع', org_supervisor:'مشرف هيئة', visitor:'زائر' };
      openModal('إضافة مستخدم',
        `<div class="form-group"><label>الاسم</label><input class="form-control" id="auName"></div>
        <div class="form-group"><label>اسم المستخدم</label><input class="form-control" id="auUsername"></div>
        <div class="form-group"><label>كلمة المرور</label><input class="form-control" id="auPassword" value="123456"></div>
        <div class="form-group"><label>الدور</label><select class="form-control" id="auRole" onchange="toggleUserFields()">
          ${roles.map(r => `<option value="${r}">${roleLabels[r]}</option>`).join('')}</select></div>
        <div class="form-group" id="auGovGroup" style="display:none"><label>الفرع</label><select class="form-control" id="auGov">
          ${Array.isArray(govs) ? govs.map(g => { const n = typeof g === 'string' ? g : g.name; return `<option value="${n}">${n}</option>`; }).join('') : ''}</select></div>
        <div class="form-group" id="auHospGroup" style="display:none"><label>المستشفى</label><select class="form-control" id="auHosp">
          <option value="">بدون مستشفى</option>${hospitals.map(h => `<option value="${h.id}">${h.name}</option>`).join('')}</select></div>
        <div class="form-group"><label>التليفون</label><input class="form-control" id="auPhone" dir="ltr"></div>
        <div class="form-group"><label>البريد الالكتروني</label><input class="form-control" id="auEmail" dir="ltr"></div>`,
        `<button class="btn btn-secondary" onclick="closeModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="createUser()">حفظ</button>`);
      toggleUserFields();
    });
  });
}
function toggleUserFields() {
  const r = document.getElementById('auRole').value;
  document.getElementById('auGovGroup').style.display = r === 'branch_supervisor' ? '' : 'none';
  document.getElementById('auHospGroup').style.display = r === 'hospital' ? '' : 'none';
}
async function createUser() {
  const name = document.getElementById('auName').value.trim();
  const username = document.getElementById('auUsername').value.trim();
  const password = document.getElementById('auPassword').value.trim();
  const role = document.getElementById('auRole').value;
  const hospitalId = parseInt(document.getElementById('auHosp').value) || null;
  const gov = document.getElementById('auGov').value || null;
  const phone = document.getElementById('auPhone').value.trim();
  const email = document.getElementById('auEmail').value.trim();
  if (!username) { alert('اسم المستخدم مطلوب'); return; }
  try {
    await api('POST', '/users', { username, password, name, role, hospitalId, governorate: gov, viewPermission: role === 'visitor' ? 'limited' : 'all', phone, email });
    closeModal(); renderUsers();
  } catch(e) { alert(e.message); }
}
async function deleteUser(id) {
  if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
  try { await api('DELETE', '/users/' + id); renderUsers(); } catch(e) { alert(e.message); }
}
function editUser(id) {
  Promise.all([api('GET', '/me'), api('GET', '/users'), api('GET', '/hospitals'), api('GET', '/governorates')]).then(([me, users, hospitals, govs]) => {
    const u = users.find(x => x.id === id); if (!u) return;
    const isMaster = me.user.id === 1;
    const roles = ['admin','hospital','branch_supervisor','org_supervisor','visitor'];
    const roleLabels = { admin:'مدير', hospital:'مستشفى', branch_supervisor:'مشرف فرع', org_supervisor:'مشرف هيئة', visitor:'زائر' };
    const govArr = Array.isArray(govs) ? govs : [];
    openModal('تعديل المستخدم - ' + u.name,
      `<div class="form-group"><label>الاسم</label><input class="form-control" id="euName" value="${String(u.name||'').replace(/"/g,'&quot;')}"></div>
      ${isMaster ? `<div class="form-group"><label>الدور</label><select class="form-control" id="euRole" onchange="toggleEditUserFields()">
        ${roles.map(r => `<option value="${r}" ${r===u.role?'selected':''}>${roleLabels[r]}</option>`).join('')}</select></div>` : ''}
      <div class="form-group"><label>كلمة المرور الجديدة (اتركه فارغاً إن لم ترد التغيير)</label><input class="form-control" id="euPassword" type="password" placeholder="أدخل كلمة المرور الجديدة"></div>
      ${isMaster ? `<div class="form-group" id="euGovGroup" style="${u.role==='branch_supervisor'?'':'display:none'}"><label>الفرع</label><select class="form-control" id="euGov">${govArr.map(g => `<option value="${g}" ${g===u.governorate?'selected':''}>${g}</option>`).join('')}</select></div>` : ''}
      ${isMaster ? `<div class="form-group" id="euHospGroup" style="${u.role==='hospital'?'':'display:none'}"><label>المستشفى</label><select class="form-control" id="euHosp">${hospitals.map(h => `<option value="${h.id}" ${h.id===u.hospital_id?'selected':''}>${h.name}</option>`).join('')}</select></div>` : ''}
      <div class="form-group"><label>التليفون</label><input class="form-control" id="euPhone" value="${String(u.phone||'').replace(/"/g,'&quot;')}" dir="ltr"></div>
      <div class="form-group"><label>البريد الالكتروني</label><input class="form-control" id="euEmail" value="${String(u.email||'').replace(/"/g,'&quot;')}" dir="ltr"></div>
      ${isMaster ? `<div style="margin-top:8px;padding:8px 10px;background:#e8f5e9;border-radius:8px;font-size:12px;color:#2e7d32"><i class="fas fa-info-circle"></i> الصلاحيات تتحكم فيها من <strong>صلاحيات الأدوار</strong></div>` : ''}`,
      `<button class="btn btn-secondary" onclick="closeModal()">إلغاء</button>
      <button class="btn btn-primary" onclick="saveUser(${id})">حفظ</button>`);
  });
}
function toggleEditUserFields() {
  const r = document.getElementById('euRole').value;
  document.getElementById('euGovGroup').style.display = r === 'branch_supervisor' ? '' : 'none';
  document.getElementById('euHospGroup').style.display = r === 'hospital' ? '' : 'none';
}
async function saveUser(id) {
  const name = document.getElementById('euName').value.trim();
  const password = document.getElementById('euPassword').value.trim();
  const me = await api('GET', '/me');
  const isMaster = me.user.id === 1;
  const body = { name };
  const phone = document.getElementById('euPhone').value.trim();
  const email = document.getElementById('euEmail').value.trim();
  if (phone) body.phone = phone;
  if (email) body.email = email;
  if (password && password.length >= 4) body.password = password;
  if (isMaster) {
    const role = document.getElementById('euRole').value;
    body.role = role;
    const govEl = document.getElementById('euGov');
    if (govEl) body.governorate = govEl.value;
    const hospEl = document.getElementById('euHosp');
    if (hospEl) { const hv = parseInt(hospEl.value); body.hospitalId = isNaN(hv) ? null : hv; }
  }
  try {
    await api('PUT', '/users/' + id, body);
    closeModal(); renderUsers();
  } catch(e) { alert(e.message); }
}
function changeUserPassword(id) {
  openModal('تغيير كلمة المرور',
    `<div class="form-group"><label>كلمة المرور الجديدة</label><input class="form-control" id="cpPassword" type="password"></div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">إلغاء</button>
    <button class="btn btn-primary" onclick="savePassword(${id})">حفظ</button>`);
}
async function savePassword(id) {
  const pwd = document.getElementById('cpPassword').value.trim();
  if (pwd.length < 4) { alert('كلمة المرور قصيرة (4 أحرف على الأقل)'); return; }
  try { await api('PUT', '/users/' + id + '/password', { password: pwd }); alert('تم تغيير كلمة المرور بنجاح'); closeModal(); } catch(e) { alert(e.message); }
}

async function renderHospitals() {
  const el = document.getElementById('mainContent');
  try {
    const me = (await api('GET', '/me')).user;
    const isMaster = me.id === 1;
    el.innerHTML = `<div class="page-actions"><button class="btn-back" onclick="goBack()"><i class="fas fa-arrow-right"></i> الرئيسية</button>
      ${isMaster ? '<button class="btn btn-primary" onclick="showAddHospitalModal()"><i class="fas fa-plus"></i> إضافة</button>' : ''}
      ${isMaster ? '<button class="btn btn-outline" onclick="showHospitalTypesModal()" style="margin-right:6px"><i class="fas fa-tag"></i> أنواع البنوك</button>' : ''}</div>
      <div class="card"><div class="card-body table-scroll"><table class="data-table"><thead><tr><th>#</th><th>الكود</th><th>الاسم</th><th>الفرع</th><th>النوع</th>${isMaster?'<th></th>':''}</tr></thead><tbody id="hospBody"></tbody></table></div></div>`;
    const h = await api('GET', '/hospitals');
    document.getElementById('hospBody').innerHTML = h.map((x, i) => `<tr><td>${i+1}</td><td>${x.code || x.id}</td><td>${x.name}</td><td>${x.governorate}</td><td class="${x.type === 'تجميعي' ? 'agg-cell' : ''}">${x.type || 'تخزيني'}</td>
      ${isMaster ? `<td><button class="btn btn-sm btn-outline" onclick="editHospital(${x.id})"><i class="fas fa-edit"></i></button>
      <button class="btn btn-sm btn-outline" onclick="deleteHospital(${x.id})"><i class="fas fa-trash"></i></button></td>` : ''}</tr>`).join('');
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}
function showAddHospitalModal() {
  Promise.all([api('GET', '/governorates'), api('GET', '/hospital-types')]).then(([govs, types]) => {
    const arr = Array.isArray(govs) ? govs : [];
    const typeArr = Array.isArray(types) ? types : [];
    openModal('إضافة مستشفى',
      `<div class="form-group"><label>الكود (أي رقم أو حرف)</label><input class="form-control" id="ahCode" placeholder="مثال: A1"></div>
      <div class="form-group"><label>الاسم</label><input class="form-control" id="ahName"></div>
      <div class="form-group"><label>الفرع</label><select class="form-control" id="ahGov">${arr.map(g => `<option value="${g}">${g}</option>`).join('')}</select></div>
      <div class="form-group"><label>النوع</label><select class="form-control" id="ahType">${typeArr.map(t => `<option value="${t.name}">${t.name}</option>`).join('')}</select></div>`,
      `<button class="btn btn-secondary" onclick="closeModal()">إلغاء</button>
      <button class="btn btn-primary" onclick="addHospital()">حفظ</button>`);
  });
}
async function addHospital() {
  const name = document.getElementById('ahName').value.trim();
  if (!name) { alert('الاسم مطلوب'); return; }
  try {
    await api('POST', '/hospitals', { name, code: document.getElementById('ahCode').value.trim(), governorate: document.getElementById('ahGov').value, type: document.getElementById('ahType').value });
    closeModal(); renderHospitals();
  } catch(e) { alert(e.message); }
}
function editHospital(id) {
  Promise.all([api('GET', '/hospitals'), api('GET', '/governorates'), api('GET', '/hospital-types')]).then(([h, govs, types]) => {
    const x = h.find(v => v.id === id); if (!x) return;
    const arr = Array.isArray(govs) ? govs : [];
    const typeArr = Array.isArray(types) ? types : [];
    openModal('تعديل المستشفى - ' + x.name,
      `<div class="form-group"><label>الكود (أي رقم أو حرف)</label><input class="form-control" id="ehCode" value="${x.code || ''}"></div>
      <div class="form-group"><label>الاسم</label><input class="form-control" id="ehName" value="${x.name}"></div>
      <div class="form-group"><label>الفرع</label><select class="form-control" id="ehGov">${arr.map(g => `<option value="${g}" ${g===x.governorate?'selected':''}>${g}</option>`).join('')}</select></div>
      <div class="form-group"><label>النوع</label><select class="form-control" id="ehType">${typeArr.map(t => `<option value="${t.name}" ${t.name === (x.type || 'تخزيني') ? 'selected' : ''}>${t.name}</option>`).join('')}</select></div>`,
      `<button class="btn btn-secondary" onclick="closeModal()">إلغاء</button>
      <button class="btn btn-primary" onclick="saveHospital(${id})">حفظ</button>`);
  });
}
async function saveHospital(id) {
  const name = document.getElementById('ehName').value.trim();
  if (!name) { alert('الاسم مطلوب'); return; }
  try {
    await api('PUT', '/hospitals/' + id, { name, code: document.getElementById('ehCode').value.trim(), governorate: document.getElementById('ehGov').value, type: document.getElementById('ehType').value.trim() || 'تخزيني' });
    closeModal(); renderHospitals();
  } catch(e) { alert(e.message); }
}
async function deleteHospital(id) {
  if (!confirm('هل أنت متأكد من حذف هذا المستشفى؟')) return;
  try { await api('DELETE', '/hospitals/' + id); renderHospitals(); } catch(e) { alert(e.message); }
}

async function showHospitalTypesModal() {
  const types = await api('GET', '/hospital-types');
  const typeArr = Array.isArray(types) ? types : [];
  openModal('إدارة أنواع البنوك',
    `<div style="margin-bottom:12px;display:flex;gap:8px">
      <input class="form-control" id="newTypeName" placeholder="اسم النوع الجديد" style="flex:1">
      <button class="btn btn-primary" onclick="addHospitalType()">إضافة</button>
    </div>
    <div id="typeListWrap">${typeArr.map(t => `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #eee">
      <span>${t.name}</span>
      <button class="btn btn-sm btn-outline" onclick="deleteHospitalType(${t.id})"><i class="fas fa-times"></i></button>
    </div>`).join('')}</div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">إغلاق</button>`);
}

async function addHospitalType() {
  const name = document.getElementById('newTypeName').value.trim();
  if (!name) { alert('الاسم مطلوب'); return; }
  try {
    await api('POST', '/hospital-types', { name });
    showHospitalTypesModal();
  } catch(e) { alert(e.message); }
}

async function deleteHospitalType(id) {
  if (!confirm('هل أنت متأكد؟')) return;
  try { await api('DELETE', '/hospital-types/' + id); showHospitalTypesModal(); } catch(e) { alert(e.message); }
}

async function renderGovernorates() {
  const el = document.getElementById('mainContent');
  try {
    const me = (await api('GET', '/me')).user;
    const isMaster = me.id === 1;
    el.innerHTML = `<div class="page-actions"><button class="btn-back" onclick="goBack()"><i class="fas fa-arrow-right"></i> الرئيسية</button>
      ${isMaster ? '<button class="btn btn-primary" onclick="showAddGovModal()"><i class="fas fa-plus"></i> إضافة</button>' : ''}</div>
      <div class="card"><div class="card-body table-scroll"><table class="data-table"><thead><tr><th>#</th><th>الاسم</th>${isMaster?'<th></th>':''}</tr></thead><tbody id="govBody"></tbody></table></div></div>`;
    const g = await api('GET', '/governorates');
    const arr = Array.isArray(g) ? g : [];
    document.getElementById('govBody').innerHTML = arr.map((x, i) => {
      const n = typeof x === 'string' ? x : (x.name || x);
      return `<tr><td>${i+1}</td><td>${n}</td>
        ${isMaster ? `<td><button class="btn btn-sm btn-outline" onclick="deleteGovernorate('${n}')"><i class="fas fa-trash"></i></button></td>` : ''}</tr>`;
    }).join('');
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}
function showAddGovModal() {
  openModal('إضافة فرع',
    `<div class="form-group"><label>الاسم</label><input class="form-control" id="agName"></div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">إلغاء</button>
    <button class="btn btn-primary" onclick="addGovernorate()">حفظ</button>`);
}
async function addGovernorate() {
  const name = document.getElementById('agName').value.trim();
  if (!name) { alert('الاسم مطلوب'); return; }
  try { await api('POST', '/governorates', { name }); closeModal(); renderGovernorates(); } catch(e) { alert(e.message); }
}
async function deleteGovernorate(name) {
  if (!confirm('هل أنت متأكد من حذف فرع "' + name + '"؟')) return;
  try { await api('DELETE', '/governorates/' + encodeURIComponent(name)); renderGovernorates(); } catch(e) { alert(e.message); }
}

async function renderSupervisorData() {
  const el = document.getElementById('mainContent');
  try {
    const [me, users, hospitals, govs] = await Promise.all([api('GET', '/me'), api('GET', '/users'), api('GET', '/hospitals'), api('GET', '/governorates')]);
    const isMaster = me.user.id === 1;
    if (!isMaster) { el.innerHTML = '<div class="empty-msg">غير مصرح</div>'; return; }
    const govArr = Array.isArray(govs) ? govs : [];
    const hospMap = {}; hospitals.forEach(h => hospMap[h.id] = h.name);
    const roleLabels = { admin:'مدير', hospital:'مستشفى', branch_supervisor:'مشرف فرع', org_supervisor:'مشرف هيئة', visitor:'زائر' };

    el.innerHTML = `<div class="page-actions"><button class="btn-back" onclick="goBack()"><i class="fas fa-arrow-right"></i> الرئيسية</button>
      <button class="btn btn-primary" onclick="showAddBranchSupervisor()" style="height:32px"><i class="fas fa-plus"></i> إضافة مشرف فرع</button>
    </div>
      <div class="card">
        <div class="card-body">
          <div style="margin-bottom:12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center">
            <span style="font-weight:600;font-size:13px"><i class="fas fa-filter"></i> اختر المحافظات:</span>
            <div id="govCheckboxes" style="display:flex;flex-wrap:wrap;gap:6px;flex:1"></div>
            <button class="btn btn-sm btn-primary" onclick="selectAllGovs(true)">اختر الكل</button>
            <button class="btn btn-sm btn-outline" onclick="selectAllGovs(false)">إلغاء الكل</button>
            <button class="btn btn-sm btn-success" onclick="copySupervisorData()"><i class="fas fa-copy"></i> نسخ البيانات</button>
          </div>
          <div class="table-scroll">
            <table class="data-table" id="supervisorTable">
              <thead><tr><th>#</th><th>الاسم</th><th>الدور</th><th>اسم المستخدم</th><th>كلمة المرور</th><th>التليفون</th><th>البريد</th><th>المستشفى</th><th>الفرع</th><th>إجراءات</th></tr></thead>
              <tbody id="supervisorBody"></tbody>
            </table>
          </div>
        </div>
      </div>`;

    const chkDiv = document.getElementById('govCheckboxes');
    chkDiv.innerHTML = govArr.map(g => `<label style="display:inline-flex;align-items:center;gap:3px;font-size:12px;cursor:pointer;padding:3px 8px;background:#f0f0f0;border-radius:4px">
      <input type="checkbox" class="govChk" value="${g}" onchange="filterSupervisorData()" checked> ${g}</label>`).join('');

    window._supervisorData = { users, hospitals: hospMap, roleLabels, govArr };
    filterSupervisorData();
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

function selectAllGovs(sel) {
  document.querySelectorAll('.govChk').forEach(c => c.checked = sel);
  filterSupervisorData();
}

function filterSupervisorData() {
  const sel = Array.from(document.querySelectorAll('.govChk:checked')).map(c => c.value);
  const { users, hospitals: hospMap, roleLabels } = window._supervisorData || {};
  if (!users) return;
  const filtered = users.filter(u => sel.length === 0 || sel.includes(u.governorate));
  const tbody = document.getElementById('supervisorBody');
  if (!tbody) return;
  tbody.innerHTML = filtered.map((u, i) => `<tr>
    <td>${i+1}</td>
    <td>${u.name || ''}</td>
    <td>${roleLabels[u.role] || u.role}</td>
    <td style="direction:ltr;text-align:left">${u.username}</td>
    <td style="direction:ltr;text-align:left;font-family:monospace">${u.password || ''}</td>
    <td style="direction:ltr">${u.phone || ''}</td>
    <td style="direction:ltr;font-size:11px">${u.email || ''}</td>
    <td>${hospMap[u.hospital_id] || u.hospital_id || ''}</td>
    <td>${u.governorate || ''}</td>
    <td style="white-space:nowrap">
      <button class="btn btn-sm btn-outline" onclick="editSupervisorUser(${u.id})" style="color:#1976d2;font-size:10px;margin:1px" title="تعديل"><i class="fas fa-edit"></i></button>
      <button class="btn btn-sm btn-outline" onclick="deleteSupervisorUser(${u.id})" style="color:#dc3545;font-size:10px;margin:1px" title="حذف"><i class="fas fa-trash"></i></button>
    </td>
  </tr>`).join('');
}

async function copySupervisorData() {
  const sel = Array.from(document.querySelectorAll('.govChk:checked')).map(c => c.value);
  const { users, hospitals: hospMap, roleLabels } = window._supervisorData || {};
  if (!users) return;
  const filtered = users.filter(u => sel.length === 0 || sel.includes(u.governorate));
  let text = 'بيانات المشرفين\n';
  text += '='.repeat(60) + '\n';
  text += '#\tالاسم\tالدور\tاسم المستخدم\tكلمة المرور\tالتليفون\tالبريد\tالمستشفى\tالفرع\n';
  filtered.forEach((u, i) => {
    text += `${i+1}\t${u.name||''}\t${roleLabels[u.role]||u.role}\t${u.username}\t${u.password||''}\t${u.phone||''}\t${u.email||''}\t${hospMap[u.hospital_id]||u.hospital_id||''}\t${u.governorate||''}\n`;
  });
  try {
    await navigator.clipboard.writeText(text);
    showToast('تم نسخ البيانات (' + filtered.length + ' مستخدم)');
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showToast('تم نسخ البيانات (' + filtered.length + ' مستخدم)');
  }
}

async function renderInventory() {
  const el = document.getElementById('mainContent');
  try {
    el.innerHTML = `<div class="page-actions"><button class="btn-back" onclick="goBack()"><i class="fas fa-arrow-right"></i> الرئيسية</button></div>
      <div class="card"><div class="card-body table-scroll"><table class="data-table"><thead><tr><th>فصيلة</th><th>المخزون</th><th>إجمالي الوارد</th><th>إجمالي المستهلك</th></tr></thead><tbody id="invBody"></tbody></table></div></div>`;
    const inv = await api('GET', '/inventory');
    const arr = Object.entries(inv || {});
    document.getElementById('invBody').innerHTML = arr.map(([bt, v]) => `<tr><td>${bt}</td><td>${v.storage ?? 0}</td><td>${v.totalReceived ?? 0}</td><td>${v.totalConsumed ?? 0}</td></tr>`).join('');
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

// =============== Monthly Indicators (كبار + صغار) ===============

async function renderRolePerms() {
  const el = document.getElementById('mainContent');
  try {
    const [rolePerms, users] = await Promise.all([api('GET', '/role-permissions'), api('GET', '/users')]);
    const defaultLabels = { admin:'مدير', hospital:'مستشفى', branch_supervisor:'مشرف فرع', org_supervisor:'مشرف هيئة', visitor:'زائر' };
    const defaultColors = { admin:'#dc3545', hospital:'#17a2b8', branch_supervisor:'#fd7e14', org_supervisor:'#28a745', visitor:'#6c757d' };
    const defaultIcons = { admin:'fa-crown', hospital:'fa-hospital', branch_supervisor:'fa-user-check', org_supervisor:'fa-building', visitor:'fa-eye' };
    el.innerHTML = `<div class="page-actions"><button class="btn-back" onclick="goBack()"><i class="fas fa-arrow-right"></i> الرئيسية</button>
      <button class="btn btn-primary" onclick="saveAllRolePerms()" id="saveRolePermsBtn"><i class="fas fa-save"></i> حفظ الكل</button>
      <button class="btn btn-success" onclick="showAddRoleModal()"><i class="fas fa-plus"></i> إضافة دور</button></div>
      <div id="rolePermsContainer"></div>`;
    const container = document.getElementById('rolePermsContainer');
    let html = '';
    rolePerms.forEach(rp => {
      const perms = typeof rp.permissions === 'string' ? JSON.parse(rp.permissions) : (rp.permissions || {});
      const color = defaultColors[rp.role] || '#6c757d';
      const icon = defaultIcons[rp.role] || 'fa-user';
      const userCount = users.filter(u => u.role === rp.role).length;
      html += `<div class="card" style="margin-bottom:16px">
        <div class="card-header" style="background:${color};color:#fff;border-radius:12px 12px 0 0;display:flex;justify-content:space-between;align-items:center">
          <span><i class="fas ${icon}"></i> ${defaultLabels[rp.role] || rp.role}</span>
          <span style="font-size:11px;opacity:0.9">${userCount} مستخدم ${rp.role !== 'admin' ? `<i class="fas fa-times" style="cursor:pointer;margin-right:8px" onclick="deleteRole('${rp.role}')"></i>` : ''}</span>
        </div>
        <div class="card-body" style="padding:12px">`;
      PERM_CATS.forEach(c => {
        const pages = PERM_PAGES.filter(p => p.cat === c.key);
        if (!pages.length) return;
        html += `<div style="margin-bottom:10px"><div style="font-size:12px;font-weight:700;color:${c.color};margin-bottom:6px;display:flex;align-items:center;gap:4px"><i class="fas ${c.icon}"></i> ${c.label}</div>`;
        pages.forEach(p => {
          const pv = perms[p.key] || {v:0,a:0,e:0,d:0,x:0};
          html += `<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f0f0f0;font-size:12px">
            <span><i class="fas ${p.icon}" style="margin-left:4px;color:${c.color};width:16px;text-align:center"></i>${p.label}</span>
            <div style="display:flex;gap:3px">`;
          PERM_ACTIONS.forEach(a => {
            const checked = pv[a.key] === 1;
            html += `<label class="perm-toggle ${checked ? a.cls : ''}">
              <input type="checkbox" data-role="${rp.role}" data-page="${p.key}" data-action="${a.key}" ${checked?'checked':''} onchange="this.parentElement.className='perm-toggle'+(this.checked?' ${a.cls}':'')">
              <span class="toggle-track"></span>
              <span class="toggle-label">${a.label}</span>
            </label>`;
          });
          html += `</div></div>`;
        });
        html += `</div>`;
      });
      html += `</div></div>`;
    });
    container.innerHTML = html;
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

function showAddRoleModal() {
  openModal('إضافة دور جديد',
    `<div class="form-group"><label>اسم الدور (بالإنجليزية)</label><input class="form-control" id="arKey" placeholder="مثال: supervisor"></div>
    <div class="form-group"><label>الاسم المعروض (بالعربية)</label><input class="form-control" id="arName" placeholder="مثال: مشرف"></div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">إلغاء</button>
    <button class="btn btn-primary" onclick="addNewRole()">إضافة</button>`);
}

async function addNewRole() {
  const key = document.getElementById('arKey').value.trim();
  const label = document.getElementById('arName').value.trim();
  if (!key) { alert('اسم الدور مطلوب'); return; }
  if (!label) { alert('الاسم المعروض مطلوب'); return; }
  try {
    await api('PUT', '/role-permissions', { role: key, permissions: {} });
    closeModal();
    renderRolePerms();
    showToast('تم إضافة الدور "' + label + '" بنجاح');
  } catch(e) { alert(e.message); }
}

async function deleteRole(role) {
  if (role === 'admin') { alert('لا يمكن حذف دور المدير'); return; }
  if (!confirm('هل أنت متأكد من حذف دور "' + role + '"؟')) return;
  try {
    await api('DELETE', '/role-permissions/' + encodeURIComponent(role));
    renderRolePerms();
    showToast('تم حذف الدور "' + role + '"');
  } catch(e) { alert(e.message); }
}

async function saveAllRolePerms() {
  const btn = document.getElementById('saveRolePermsBtn');
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
  const rolePerms = {};
  document.querySelectorAll('#rolePermsContainer input[type="checkbox"]').forEach(cb => {
    const role = cb.dataset.role; const page = cb.dataset.page; const action = cb.dataset.action;
    if (!rolePerms[role]) rolePerms[role] = {};
    if (!rolePerms[role][page]) rolePerms[role][page] = {v:0,a:0,e:0,d:0,x:0};
    rolePerms[role][page][action] = cb.checked ? 1 : 0;
  });
  try {
    for (const [role, permissions] of Object.entries(rolePerms)) {
      await api('PUT', '/role-permissions', { role, permissions });
    }
    alert('تم حفظ صلاحيات الأدوار بنجاح');
    renderRolePerms();
  } catch(e) { alert(e.message); }
}

async function renderMonthly() {
  document.getElementById('mainContent').innerHTML = '<div style="text-align:center;padding:40px"><i class="fas fa-spinner fa-spin" style="font-size:32px"></i></div>';
  renderMonthlyIndicators();
}

function pct(a, b) { return b ? Math.round((a / b) * 10000) / 100 : 0; }

function isAboveTarget(colDefs, key, val) {
  const def = colDefs.find(c => c.key === key);
  if (!def || !def.target) return val > 0;
  const t = def.target;
  if (t === '> last') return false;
  const num = parseFloat(t.replace(/[<>=%\s]/g, ''));
  if (isNaN(num)) return false;
  if (t.startsWith('<')) return val > num;
  if (t.startsWith('>')) return val < num;
  return val > num;
}

function computeSmallFormulas(d) {
  if (!d) return {};
  const bloodIn = (d.inc_collected||0)+(d.inc_regional||0);
  const mainOut = d.out_blood || 0;
  const childOut = d.child_out_blood || 0;
  return {
    ct: d.compatibility ? Math.round(((d.out_blood || 0) / d.compatibility) * 100) / 100 : 0,
    child_ct: d.child_compatibility ? Math.round(((d.child_out_blood || 0) / d.child_compatibility) * 100) / 100 : 0,
    pct_exp: pct(d.disp_exp_blood||0, bloodIn),
    pct_returned: pct(d.disp_returned||0, mainOut),
    pct_reaction: pct(d.disp_reaction||0, mainOut),
    pct_open: pct(d.disp_open||0, mainOut),
    pct_other: pct(d.disp_other||0, mainOut),
    child_pct_exp: pct(d.child_disp_exp||0, childOut),
    child_pct_returned: pct(d.child_disp_returned||0, childOut),
    child_pct_reaction: pct(d.child_disp_reaction||0, childOut),
    child_pct_open: pct(d.child_disp_open||0, childOut),
    child_pct_other: pct(d.child_disp_other||0, childOut)
  };
}

function recalcBigFormulas() {
  const d = collectIndicatorFormData('bi', BIG_COL_DEFS);
  const f = computeBigFormulas(d);
  BIG_COL_DEFS.filter(c => c.formula).forEach(c => {
    const el = document.getElementById('bi_' + c.key);
    if (el) {
      const val = f[c.key] ?? 0;
      el.textContent = formatFormulaVal(c.key, val);
      const n = parseFloat(val);
      const warn = isAboveTarget(BIG_COL_DEFS, c.key, n);
      el.style.color = warn ? '#e74c3c' : '';
      el.style.fontWeight = warn ? '700' : '';
    }
  });
}

function recalcSmallFormulas() {
  const d = collectIndicatorFormData('si', SMALL_COL_DEFS);
  const f = computeSmallFormulas(d);
  SMALL_COL_DEFS.filter(c => c.formula).forEach(c => {
    const el = document.getElementById('si_' + c.key);
    if (el) {
      const val = f[c.key] ?? 0;
      el.textContent = formatFormulaVal(c.key, val);
      const n = parseFloat(val);
      const warn = isAboveTarget(SMALL_COL_DEFS, c.key, n);
      el.style.color = warn ? '#e74c3c' : '';
      el.style.fontWeight = warn ? '700' : '';
    }
  });
}

function formatFormulaVal(key, val) {
  const n = parseFloat(val);
  if (isNaN(n)) return val ?? '';
  if (key.startsWith('pct_') || key.startsWith('child_pct_') || key.startsWith('ratio_')) {
    const s = String(n);
    const dec = s.includes('.') ? s.split('.')[1] : '';
    if (dec.length <= 1) return n.toFixed(1) + '%';
    return n + '%';
  }
  return n;
}

function buildIndicatorFormHTML(colDefs, prefix, recalcFn) {
  const inputFields = colDefs.filter(c => c.key !== 'governorate' && c.key !== 'hospital_name');
  const groups = [];
  let currentGroup = null;
  inputFields.forEach(f => {
    const g = f.group || 'أخرى';
    if (!currentGroup || currentGroup.label !== g) {
      currentGroup = { label: g, groups: [], formulaCount: 0, totalCount: 0 };
      groups.push(currentGroup);
    }
    currentGroup.totalCount++;
    if (f.formula) currentGroup.formulaCount++;
    const sg = f.sg || '___main___';
    let sub = currentGroup.groups.find(s => s.label === sg);
    if (!sub) { sub = { label: sg, fields: [] }; currentGroup.groups.push(sub); }
    sub.fields.push(f);
  });
  let html = '<div class="ind-form-wrap">';
  groups.forEach(g => {
    const isF = g.formulaCount > 0 && g.formulaCount >= g.totalCount / 2;
    html += `<div class="ind-form-box ${isF ? 'formula-box' : 'input-box'}">
      <div class="ind-form-header ${isF ? 'formula-header' : 'input-header'}">${g.label}${isF ? ' <span style="font-weight:400;font-size:10px;opacity:0.8">(معادلات)</span>' : ''}</div>
      <div class="ind-form-body">`;
    g.groups.forEach(sub => {
      if (sub.label === '___main___') {
        sub.fields.forEach(f => {
          const fi = f.formula;
          html += `<div class="ind-form-field ${fi ? 'formula-field' : ''}">
            <div class="ind-form-label">${f.label}${fi && f.target ? ` <span class="target-badge">${f.target}</span>` : ''}</div>`;
          if (fi) {
            html += `<span class="ind-form-input formula-val ${prefix}-inp" id="${prefix}_${f.key}">0%</span></div>`;
          } else {
            html += `<input class="ind-form-input ${prefix}-inp" id="${prefix}_${f.key}" type="number" value="0"${recalcFn ? ` oninput="${recalcFn}()"` : ''}></div>`;
          }
        });
      } else {
        html += `<div class="ind-form-sub ${isF ? 'formula-sub' : ''}">
          <div class="ind-form-sub-header">${sub.label}</div>
          <div class="ind-form-sub-body">`;
        sub.fields.forEach(f => {
          const fi = f.formula;
          html += `<div class="ind-form-field ${fi ? 'formula-field' : ''}">
            <div class="ind-form-label">${f.label}${fi && f.target ? ` <span class="target-badge">${f.target}</span>` : ''}</div>`;
          if (fi) {
            html += `<span class="ind-form-input formula-val ${prefix}-inp" id="${prefix}_${f.key}">0%</span></div>`;
          } else {
            html += `<input class="ind-form-input ${prefix}-inp" id="${prefix}_${f.key}" type="number" value="0"${recalcFn ? ` oninput="${recalcFn}()"` : ''}></div>`;
          }
        });
        html += '</div></div>';
      }
    });
    html += '</div></div>';
  });
  html += '</div>';
  return html;
}

function loadIndicatorFormData(record, prefix, colDefs, recalcFn) {
  const fields = colDefs.filter(c => c.key !== 'governorate' && c.key !== 'hospital_name');
  const d = record ? ((typeof record.data === 'string' ? tryParse(record.data) : record.data) || {}) : {};
  fields.forEach(f => {
    const el = document.getElementById(prefix + '_' + f.key);
    if (el && !f.formula) el.value = d[f.key] ?? 0;
  });
  if (recalcFn) window[recalcFn]();
}

function collectIndicatorFormData(prefix, colDefs) {
  const fields = colDefs.filter(c => c.key !== 'governorate' && c.key !== 'hospital_name' && !c.formula);
  const data = {};
  fields.forEach(f => {
    const el = document.getElementById(prefix + '_' + f.key);
    const val = el ? el.value : 0;
    if (f.formula) {
      data[f.key] = parseFloat(val) || 0;
    } else {
      data[f.key] = parseInt(val) || 0;
    }
  });
  return data;
}

async function renderBigIndicators() {
  const el = document.getElementById('mainContent');
  try {
    const me = await api('GET', '/me');
    const user = me.user;
    const hospitals = await api('GET', '/hospitals');
    const months = ['يناير','فبراير','مارس','ابريل','مايو','يونيو','يوليو','اغسطس','سبتمبر','اكتوبر','نوفمبر','ديسمبر'];
    const canEdit = hasPerm('monthly_big', 'add');
    const canDelete = hasPerm('monthly_big', 'delete');
    const isHospital = user.role === 'hospital';
    const isBranchSup = user.role === 'branch_supervisor';
    const bigHospitals = hospitals.filter(h => h.type === 'تجميعي');
    let filteredHospitals = bigHospitals;
    if (isHospital) filteredHospitals = bigHospitals.filter(h => h.id === user.hospitalId);
    else if (isBranchSup) filteredHospitals = bigHospitals.filter(h => h.governorate === user.governorate);

    el.innerHTML = `<div class="page-actions"><button class="btn-back" onclick="goBack()"><i class="fas fa-arrow-right"></i> رجوع</button>
    </div>`;

    if (canEdit) {
      const now = new Date();
      const year = now.getFullYear();
      const prevMonth = (now.getMonth() + 11) % 12; // month before current
      el.innerHTML += `<div class="card" style="margin-bottom:16px;border-right:4px solid #dc3545">
        <div class="card-header" style="padding:10px 16px"><strong><i class="fas fa-edit"></i> إدخال مؤشرات تجميعيه</strong></div>
        <div class="card-body" style="padding:10px 16px">
          <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin-bottom:12px">
            <div class="form-group"><label>السنة</label>
              <select class="form-control" id="biYear" style="width:100px" onchange="loadExistingBigIndicator()">${[2026,2025,2024,2023,2022].map(y => `<option value="${y}" ${y===year?'selected':''}>${y}</option>`).join('')}</select></div>
            <div class="form-group"><label>الشهر</label>
              <select class="form-control" id="biMonth" style="width:120px" onchange="loadExistingBigIndicator()">${months.map((m,i) => `<option value="${i+1}" ${i===prevMonth?'selected':''}>${m}</option>`).join('')}</select></div>
            ${isHospital 
              ? `<div class="form-group" style="min-width:200px"><label>بنك الدم</label><div style="padding:6px 0;font-weight:600">${user.name}</div></div>`
              : `<div class="form-group" style="flex:1;min-width:200px"><label>بنك الدم</label>
                  <select class="form-control" id="biHosp" onchange="loadExistingBigIndicator()">${filteredHospitals.map(h => `<option value="${h.id}">${h.name}</option>`).join('')}</select></div>`
            }
          </div>
          ${buildIndicatorFormHTML(BIG_COL_DEFS, 'bi', 'recalcBigFormulas')}
          <div style="margin-top:10px"><button class="btn btn-primary" onclick="saveBigIndicator()" style="height:32px"><i class="fas fa-save"></i> حفظ</button></div>
        </div>
      </div>`;
    }

    const mh = makeGroupHeader(BIG_COL_DEFS).replace(/(rowspan="[23]">بنك الدم<\/th>)/, '$1<th rowspan="3" style="min-width:44px;font-size:11px;color:#5A7A9A">الشهر</th>');
    el.innerHTML += `<div class="card"><div class="card-body table-scroll">
      <table class="data-table ind-table" style="min-width:800px"><thead>
        <tr><th colspan="${BIG_COL_DEFS.length + 1 + (canDelete ? 1 : 0)}" style="text-align:center;background:linear-gradient(135deg,#5A7A9A,#7A9ABA);color:#fff;font-size:13px">مؤشرات أداء البنوك التجميعية</th></tr>
        ${mh}
      </thead><tbody id="biBody"></tbody></table>
    </div></div>`;

    const items = await api('GET', '/monthly-big-indicators');
    window._biItems = items;
    window._biMe = me;
    setTimeout(function() { loadExistingBigIndicator(); }, 50);
    const body = document.getElementById('biBody');
    const now = new Date();
    const prevDbMonth = (now.getMonth() + 11) % 12 + 1;
    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    let displayedItems = items.filter(r => r.month === prevDbMonth && r.year === prevYear);
    if (isHospital) displayedItems = displayedItems.filter(r => r.hospital_id === user.hospitalId);
    else if (isBranchSup) displayedItems = displayedItems.filter(r => r.governorate === user.governorate);
    if (displayedItems.length === 0) {
      body.innerHTML = '<tr><td colspan="' + (BIG_COL_DEFS.length + 1 + (canDelete ? 1 : 0)) + '" class="empty-msg">لا توجد بيانات</td></tr>';
    } else {
      body.innerHTML = displayedItems.map(r => {
        const d = (typeof r.data === 'string' ? tryParse(r.data) : r.data) || {};
        const f = computeBigFormulas(d);
        const m = months[(r.month||1)-1] + ' ' + (r.year||'');
        return `<tr>
          ${BIG_COL_DEFS.map((c, ci) => {
            const val = c.formula ? (f[c.key] ?? 0) : (c.key === 'governorate' ? (r.governorate || '') : c.key === 'hospital_name' ? (r.hospital_name || '') : (d[c.key] ?? 0));
            let display = val;
            let style = '';
            if (c.formula && val != null) {
              const n = parseFloat(val);
              if (!isNaN(n) && (c.key.startsWith('pct_') || c.key.startsWith('child_pct_') || c.key.startsWith('ratio_'))) {
                display = formatFormulaVal(c.key, n);
                if (isAboveTarget(BIG_COL_DEFS, c.key, n)) { style = ' style="color:#e74c3c;font-weight:700;background:#ffeaea"'; }
              } else if (!isNaN(n)) {
                display = formatFormulaVal(c.key, n);
              }
            }
            let cls = c.formula ? 'class="formula-cell"' : '';
            let td = `<td style="text-align:center;${c.key === 'governorate' || c.key === 'hospital_name' ? 'text-align:right;font-weight:600' : ''}" ${cls}${style}>${display}</td>`;
            if (ci === 1) td += `<td style="white-space:nowrap;font-size:11px;color:#5A7A9A;font-weight:600">${m}</td>`;
            return td;
          }).join('')}
          ${canDelete ? `<td><button class="btn btn-sm btn-outline" onclick="deleteBigIndicator(${r.id})" style="color:#dc3545"><i class="fas fa-trash"></i></button></td>` : ''}
        </tr>`;
      }).join('');
    }
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

function loadExistingBigIndicator() {
  const hospEl = document.getElementById('biHosp');
  const me = window._biMe;
  const hospitalId = hospEl ? parseInt(hospEl.value) : (me ? me.user.hospitalId : 0);
  const year = parseInt(document.getElementById('biYear').value);
  const month = parseInt(document.getElementById('biMonth').value);
  const items = window._biItems || [];
  let record = items.find(r => r.hospital_id === hospitalId && r.year === year && r.month === month);
  window._biEditingRecord = record;
  loadIndicatorFormData(record, 'bi', BIG_COL_DEFS, 'recalcBigFormulas');
  const saveBtn = document.querySelector('button[onclick="saveBigIndicator()"]');
  if (saveBtn) {
    if (record) {
      saveBtn.innerHTML = '<i class="fas fa-edit"></i> تعديل';
      saveBtn.className = 'btn btn-warning';
    } else {
      saveBtn.innerHTML = '<i class="fas fa-save"></i> حفظ';
      saveBtn.className = 'btn btn-primary';
    }
  }
}

async function saveBigIndicator() {
  const me = await api('GET', '/me');
  const hospEl = document.getElementById('biHosp');
  const hospitalId = hospEl ? parseInt(hospEl.value) : me.user.hospitalId;
  const year = parseInt(document.getElementById('biYear').value);
  const month = parseInt(document.getElementById('biMonth').value);
  const data = collectIndicatorFormData('bi', BIG_COL_DEFS);
  try {
    const editing = window._biEditingRecord;
    const existing = window._biItems || [];
    const dup = existing.find(r => r.hospital_id === hospitalId && r.year === year && r.month === month && (!editing || r.id !== editing.id));
    if (dup && !confirm('⚠ تم إدخال بيانات هذا الشهر مسبقاً!\n\nهل تريد تعديل البيانات؟')) return;
    await api('POST', '/monthly-big-indicators', { hospitalId, year, month, data });
    showToast(dup ? '✅ تم تعديل البيانات بنجاح' : '✅ تم حفظ البيانات بنجاح');
    renderBigIndicators();
  } catch (e) { alert(e.message); }
}

async function deleteBigIndicator(id) {
  if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
  try { await api('DELETE', '/monthly-big-indicators/' + id); renderBigIndicators(); }
  catch (e) { alert(e.message); }
}

async function renderSmallIndicators() {
  const el = document.getElementById('mainContent');
  try {
    const me = await api('GET', '/me');
    const user = me.user;
    const hospitals = await api('GET', '/hospitals');
    const months = ['يناير','فبراير','مارس','ابريل','مايو','يونيو','يوليو','اغسطس','سبتمبر','اكتوبر','نوفمبر','ديسمبر'];
    const canEdit = hasPerm('monthly_small', 'add');
    const canDelete = hasPerm('monthly_small', 'delete');
    const isHospital = user.role === 'hospital';
    const isBranchSup = user.role === 'branch_supervisor';
    const smallHospitals = hospitals.filter(h => h.type === 'تخزيني');
    let filteredHospitals = smallHospitals;
    if (isHospital) filteredHospitals = smallHospitals.filter(h => h.id === user.hospitalId);
    else if (isBranchSup) filteredHospitals = smallHospitals.filter(h => h.governorate === user.governorate);

    el.innerHTML = `<div class="page-actions"><button class="btn-back" onclick="goBack()"><i class="fas fa-arrow-right"></i> رجوع</button>
    </div>`;

    if (canEdit) {
      const now = new Date();
      const year = now.getFullYear();
      const prevMonth = (now.getMonth() + 11) % 12;
      el.innerHTML += `<div class="card" style="margin-bottom:16px;border-right:4px solid #17a2b8">
        <div class="card-header" style="padding:10px 16px"><strong><i class="fas fa-edit"></i> إدخال مؤشرات تخزينيه</strong></div>
        <div class="card-body" style="padding:10px 16px">
          <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin-bottom:12px">
            <div class="form-group"><label>السنة</label>
              <select class="form-control" id="siYear" style="width:100px" onchange="loadExistingSmallIndicator()">${[2026,2025,2024,2023,2022].map(y => `<option value="${y}" ${y===year?'selected':''}>${y}</option>`).join('')}</select></div>
            <div class="form-group"><label>الشهر</label>
              <select class="form-control" id="siMonth" style="width:120px" onchange="loadExistingSmallIndicator()">${months.map((m,i) => `<option value="${i+1}" ${i===prevMonth?'selected':''}>${m}</option>`).join('')}</select></div>
            ${isHospital 
              ? `<div class="form-group" style="min-width:200px"><label>بنك الدم</label><div style="padding:6px 0;font-weight:600">${user.name}</div></div>`
              : `<div class="form-group" style="flex:1;min-width:200px"><label>بنك الدم</label>
                  <select class="form-control" id="siHosp" onchange="loadExistingSmallIndicator()">${filteredHospitals.map(h => `<option value="${h.id}">${h.name}</option>`).join('')}</select></div>`
            }
          </div>
          ${buildIndicatorFormHTML(SMALL_COL_DEFS, 'si', 'recalcSmallFormulas')}
          <div style="margin-top:10px"><button class="btn btn-primary" onclick="saveSmallIndicator()" style="height:32px"><i class="fas fa-save"></i> حفظ</button></div>
        </div>
      </div>`;
    }

    const smh = makeGroupHeader(SMALL_COL_DEFS).replace(/(rowspan="[23]">بنك الدم<\/th>)/, '$1<th rowspan="3" style="min-width:44px;font-size:11px;color:#5A7A9A">الشهر</th>');
    el.innerHTML += `<div class="card"><div class="card-body table-scroll">
      <table class="data-table ind-table" style="min-width:800px"><thead>
        <tr><th colspan="${SMALL_COL_DEFS.length + 1 + (canDelete ? 1 : 0)}" style="text-align:center;background:linear-gradient(135deg,#5A7A9A,#7A9ABA);color:#fff;font-size:13px">مؤشرات أداء البنوك التخزينية</th></tr>
        ${smh}
      </thead><tbody id="siBody"></tbody></table>
    </div></div>`;

    const items = await api('GET', '/monthly-small-indicators');
    window._siItems = items;
    window._siMe = me;
    setTimeout(function() { loadExistingSmallIndicator(); }, 50);
    const body = document.getElementById('siBody');
    const now = new Date();
    const prevDbMonth = (now.getMonth() + 11) % 12 + 1;
    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    let displayedItems = items.filter(r => r.month === prevDbMonth && r.year === prevYear);
    if (isHospital) displayedItems = displayedItems.filter(r => r.hospital_id === user.hospitalId);
    else if (isBranchSup) displayedItems = displayedItems.filter(r => r.governorate === user.governorate);
    if (displayedItems.length === 0) {
      body.innerHTML = '<tr><td colspan="' + (SMALL_COL_DEFS.length + 1 + (canDelete ? 1 : 0)) + '" class="empty-msg">لا توجد بيانات</td></tr>';
    } else {
      body.innerHTML = displayedItems.map(r => {
        const d = (typeof r.data === 'string' ? tryParse(r.data) : r.data) || {};
        const f = computeSmallFormulas(d);
        const m = months[(r.month||1)-1] + ' ' + (r.year||'');
        return `<tr>
          ${SMALL_COL_DEFS.map((c, ci) => {
            const val = c.formula ? (f[c.key] ?? 0) : (c.key === 'governorate' ? (r.governorate || '') : c.key === 'hospital_name' ? (r.hospital_name || '') : (d[c.key] ?? 0));
            let display = val;
            let style = '';
            if (c.formula && val != null) {
              const n = parseFloat(val);
              if (!isNaN(n) && (c.key.startsWith('pct_') || c.key.startsWith('child_pct_') || c.key.startsWith('ratio_'))) {
                display = formatFormulaVal(c.key, n);
                if (isAboveTarget(SMALL_COL_DEFS, c.key, n)) { style = ' style="color:#e74c3c;font-weight:700;background:#ffeaea"'; }
              } else if (!isNaN(n)) {
                display = formatFormulaVal(c.key, n);
              }
            }
            let cls = c.formula ? 'class="formula-cell"' : '';
            let td = `<td style="text-align:center;${c.key === 'governorate' || c.key === 'hospital_name' ? 'text-align:right;font-weight:600' : ''}" ${cls}${style}>${display}</td>`;
            if (ci === 1) td += `<td style="white-space:nowrap;font-size:11px;color:#5A7A9A;font-weight:600">${m}</td>`;
            return td;
          }).join('')}
          ${canDelete ? `<td><button class="btn btn-sm btn-outline" onclick="deleteSmallIndicator(${r.id})" style="color:#dc3545"><i class="fas fa-trash"></i></button></td>` : ''}
        </tr>`;
      }).join('');
    }
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

function loadExistingSmallIndicator() {
  const hospEl = document.getElementById('siHosp');
  const me = window._siMe;
  const hospitalId = hospEl ? parseInt(hospEl.value) : (me ? me.user.hospitalId : 0);
  const year = parseInt(document.getElementById('siYear').value);
  const month = parseInt(document.getElementById('siMonth').value);
  const items = window._siItems || [];
  let record = items.find(r => r.hospital_id === hospitalId && r.year === year && r.month === month);
  window._siEditingRecord = record;
  loadIndicatorFormData(record, 'si', SMALL_COL_DEFS, 'recalcSmallFormulas');
  const saveBtn = document.querySelector('button[onclick="saveSmallIndicator()"]');
  if (saveBtn) {
    if (record) {
      saveBtn.innerHTML = '<i class="fas fa-edit"></i> تعديل';
      saveBtn.className = 'btn btn-warning';
    } else {
      saveBtn.innerHTML = '<i class="fas fa-save"></i> حفظ';
      saveBtn.className = 'btn btn-primary';
    }
  }
}

async function saveSmallIndicator() {
  const me = await api('GET', '/me');
  const hospEl = document.getElementById('siHosp');
  const hospitalId = hospEl ? parseInt(hospEl.value) : me.user.hospitalId;
  const year = parseInt(document.getElementById('siYear').value);
  const month = parseInt(document.getElementById('siMonth').value);
  const data = collectIndicatorFormData('si', SMALL_COL_DEFS);
  try {
    const editing = window._siEditingRecord;
    const existing = window._siItems || [];
    const dup = existing.find(r => r.hospital_id === hospitalId && r.year === year && r.month === month && (!editing || r.id !== editing.id));
    if (dup && !confirm('⚠ تم إدخال بيانات هذا الشهر مسبقاً!\n\nهل تريد تعديل البيانات؟')) return;
    await api('POST', '/monthly-small-indicators', { hospitalId, year, month, data });
    showToast(dup ? '✅ تم تعديل البيانات بنجاح' : '✅ تم حفظ البيانات بنجاح');
    renderSmallIndicators();
  } catch (e) { alert(e.message); }
}

async function deleteSmallIndicator(id) {
  if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
  try { await api('DELETE', '/monthly-small-indicators/' + id); renderSmallIndicators(); }
  catch (e) { alert(e.message); }
}

function indExtractVal(el) {
  const t = el.type;
  if (t === 'number') return parseInt(el.value) || 0;
  return el.value;
}

async function onMonIndSelChange() {
  const hospId = document.getElementById('monIndHosp').value;
  const year = document.getElementById('monIndYear').value;
  const month = document.getElementById('monIndMonth').value;
  if (!hospId || !year || !month) return;
  try {
    const data = await api('GET', '/monthly-indicators?' + new URLSearchParams({ hospitalId: hospId, year, month }).toString());
    const r = data[0];
    const d = r ? (r.data || {}) : {};
    INDICATOR_FIELDS.filter(f => f.key !== 'day' && f.key !== 'time').forEach(f => {
      const el = document.getElementById('monInd_' + f.key);
      if (el) el.value = (d[f.key] ?? 0);
    });
    CHILD_FIELDS.forEach(f => {
      const el = document.getElementById('monIndChild_' + f.key);
      if (el) el.value = (d[f.key] ?? 0);
    });
  } catch (e) { /* ignore */ }
}

async function renderMonthlyIndicators(presetType) {
  const el = document.getElementById('mainContent');
  try {
    const hospitals = await api('GET', '/hospitals');
    window._monIndHospitals = hospitals;
    const now = new Date();
    const canEdit = hasPerm('monthly_indicators', 'edit');
    const canDelete = hasPerm('monthly_indicators', 'delete');
    const govs = [...new Set(hospitals.map(h => h.governorate))];
    el.innerHTML = `
      <div style="margin-bottom:16px"><button class="btn-back" onclick="goBack()"><i class="fas fa-arrow-right"></i> الرئيسية</button></div>
      <div class="page-title"><i class="fas fa-chart-line" style="color:#3f51b5"></i> مؤشرات شهرية</div>
      ${canEdit ? `
      <div class="card" style="margin-bottom:16px">
        <div class="card-header" style="padding:10px 16px;background:linear-gradient(135deg,#e8eaf6,#f3e5f5)"><strong><i class="fas fa-pen"></i> إدخال مؤشرات الأداء</strong></div>
        <div class="card-body" style="padding:10px 16px">
          <div class="filter-bar" style="margin-bottom:10px">
            <div class="form-group" style="margin:0"><label style="font-size:11px">الفرع</label>
              <select class="form-control" id="monIndGov" onchange="onMonIndGovChange()" style="width:140px;height:32px;font-size:12px">
                <option value="">الكل</option>${govs.map(g => `<option value="${g}">${g}</option>`).join('')}
              </select></div>
            <div class="form-group" style="margin:0"><label style="font-size:11px">بنك الدم</label>
              <select class="form-control" id="monIndHosp" onchange="onMonIndSelChange()" style="min-width:180px;height:32px;font-size:12px"></select></div>
            <div class="form-group" style="margin:0"><label style="font-size:11px">السنة</label>
              <input type="number" class="form-control" id="monIndYear" value="${now.getFullYear()}" onchange="onMonIndSelChange()" style="width:90px;height:32px;font-size:12px"></div>
            <div class="form-group" style="margin:0"><label style="font-size:11px">الشهر</label>
              <select class="form-control" id="monIndMonth" onchange="onMonIndSelChange()" style="width:110px;height:32px;font-size:12px">
                ${MONTHS_AR.map((m, i) => `<option value="${i+1}" ${i === now.getMonth() ? 'selected' : ''}>${m}</option>`).join('')}
              </select></div>
          </div>
          <div style="margin-bottom:8px;font-size:12px;color:#3f51b5;font-weight:600"><i class="fas fa-database"></i> بيانات المؤشرات</div>
          <div class="ind-form-grid" style="max-height:300px;overflow-y:auto;border:1px solid #e0e0e0;padding:8px;border-radius:6px">
            ${INDICATOR_FIELDS.filter(f => f.key !== 'day' && f.key !== 'time').map(f =>
              `<div class="form-group"><label style="font-size:10px">${f.label}</label><input type="${f.type}" class="form-control" id="monInd_${f.key}" value="0" style="height:30px;font-size:11px;text-align:center"></div>`
            ).join('')}
            ${CHILD_FIELDS.map(f =>
              `<div class="form-group"><label style="font-size:10px;color:#17a2b8">${f.label}</label><input type="${f.type}" class="form-control" id="monIndChild_${f.key}" value="0" style="height:30px;font-size:11px;text-align:center"></div>`
            ).join('')}
          </div>
          <div style="display:flex;gap:8px;margin-top:10px">
            <button class="btn btn-primary" onclick="saveMonthlyIndicatorDirect()"><i class="fas fa-save"></i> حفظ</button>
            <button class="btn btn-outline" onclick="onMonIndSelChange()"><i class="fas fa-sync-alt"></i> تحميل البيانات</button>
          </div>
        </div>
      </div>` : ''}
      <div class="page-actions">
        ${canDelete ? '<button class="btn btn-outline" onclick="archiveAllIndicators()" style="color:#795548"><i class="fas fa-archive"></i> أرشفة الكل</button>' : ''}
        <select class="search-input" id="indTypeFilter" onchange="renderMonthlyIndicators()">
          <option value="">كل الأنواع</option>
          <option value="تجميعي" ${presetType === 'تجميعي' ? 'selected' : ''}>تجميعي</option>
          <option value="تخزيني" ${presetType === 'تخزيني' ? 'selected' : ''}>تخزيني</option>
        </select>
        <select class="search-input" id="indGovFilter" onchange="indGovFilterChanged()">
          <option value="">كل المحافظات</option>          ${govs.map(g => `<option value="${g}">${g}</option>`).join('')}
        </select>
        <select class="search-input" id="indHospitalFilter" onchange="renderMonthlyIndicators()">
          <option value="">كل المستشفيات</option>${hospitals.map(h => `<option value="${h.id}">${h.name}</option>`).join('')}
        </select>
        <input type="number" class="search-input" id="indYearFilter" value="${now.getFullYear()}" style="width:80px" onchange="renderMonthlyIndicators()">
        <select class="search-input" id="indMonthFilter" onchange="renderMonthlyIndicators()">
          ${MONTHS_AR.map((m, i) => `<option value="${i+1}" ${i === now.getMonth() ? 'selected' : ''}>${m}</option>`).join('')}
        </select>
      </div>
      <div class="card"><div class="card-body table-scroll" id="indTableWrap"></div></div>`;
    if (canEdit) {
      const hospSel = document.getElementById('monIndHosp');
      const fillHosp = () => {
        const gov = document.getElementById('monIndGov').value;
        hospSel.innerHTML = hospitals.filter(h => !gov || h.governorate === gov).map(h => `<option value="${h.id}">${h.name} (${h.type || ''})</option>`).join('');
        onMonIndSelChange();
      };
      window.onMonIndGovChange = fillHosp;
      fillHosp();
    }
    const params = new URLSearchParams({ year: document.getElementById('indYearFilter').value, month: document.getElementById('indMonthFilter').value });
    const hId = document.getElementById('indHospitalFilter').value;
    if (hId) params.set('hospitalId', hId);
    const data = await api('GET', '/monthly-indicators?' + params.toString());
    renderIndicatorsTable(hospitals, data, canEdit, presetType);
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

function indGovFilterChanged() {
  const gov = document.getElementById('indGovFilter')?.value || '';
  const hospEl = document.getElementById('indHospitalFilter');
  const hospitals = window._monIndHospitals || [];
  const filtered = gov ? hospitals.filter(h => h.governorate === gov) : hospitals;
  const curVal = hospEl.value;
  hospEl.innerHTML = '<option value="">كل المستشفيات</option>' + filtered.map(h => `<option value="${h.id}">${h.name}</option>`).join('');
  if (gov && curVal && !filtered.some(h => h.id == curVal)) hospEl.value = '';
  renderMonthlyIndicators();
}

async function saveMonthlyIndicatorDirect() {
  const hospitalId = parseInt(document.getElementById('monIndHosp').value);
  const year = parseInt(document.getElementById('monIndYear').value);
  const month = parseInt(document.getElementById('monIndMonth').value);
  if (!hospitalId) { showToast('⚠️ اختر بنك الدم'); return; }
  const data = {};
  INDICATOR_FIELDS.filter(f => f.key !== 'day' && f.key !== 'time').forEach(f => {
    data[f.key] = indExtractVal(document.getElementById('monInd_' + f.key));
  });
  CHILD_FIELDS.forEach(f => {
    data[f.key] = indExtractVal(document.getElementById('monIndChild_' + f.key));
  });
  try {
    await api('POST', '/monthly-indicators', { hospitalId, year, month, data });
    showToast('✅ تم الحفظ بنجاح');
    renderMonthlyIndicators();
  } catch (e) { showToast('❌ ' + e.message); }
}

async function archiveAllIndicators() {
  if (!confirm('هل أنت متأكد من أرشفة جميع مؤشرات الأداء؟')) return;
  try {
    const res = await api('POST', '/monthly-indicators/archive');
    showToast('✅ ' + res.message);
    renderMonthlyIndicators();
  } catch (e) { alert(e.message); }
}

function safeDiv(a, b) { return (b && b !== 0) ? ((a || 0) / b).toFixed(4) : ''; }

function computeBigFormulas(d) {
  if (!d) return {};
  const collectTotal = d.collect_total || 0;
  const incBlood = d.inc_blood || 0;
  const outBloodInt = d.out_blood_int || 0;
  const donationTherapeutic = d.donation_therapeutic || 0;
  const uncompleted = d.uncompleted || 0;
  const refusedFatty = d.refused_fatty || 0;
  const refusedIcteric = d.refused_icteric || 0;
  const virologyC = d.virology_c || 0;
  const virologyB = d.virology_b || 0;
  const virologyI = d.virology_i || 0;
  const virologyDollar = d.virology_dollar || 0;
  const dispExpBlood = d.disp_exp_blood || 0;
  const dispReturned = d.disp_returned || 0;
  const dispReaction = d.disp_reaction || 0;
  const dispOpen = d.disp_open || 0;
  const dispOther = d.disp_other || 0;

  const tested = collectTotal - refusedIcteric - refusedFatty - uncompleted - donationTherapeutic;
  const totalOut = (d.out_blood_int||0) + (d.out_blood_ext||0);
  const compat = d.compatibility || 0;

  return {
    total_blood: collectTotal,
    tested: tested,
    ct: totalOut ? Math.round((compat / totalOut) * 100) / 100 : 0,
    ratio_uncompleted: pct(uncompleted, collectTotal - donationTherapeutic),
    ratio_refused: pct(refusedFatty + refusedIcteric, collectTotal - donationTherapeutic - uncompleted),
    ratio_c: pct(virologyC, tested),
    ratio_b: pct(virologyB, tested),
    ratio_i: pct(virologyI, tested),
    ratio_dollar: pct(virologyDollar, tested),
    virology_total: virologyC + virologyB + virologyI + virologyDollar,
    ratio_exp: pct(dispExpBlood, (collectTotal + incBlood) - (donationTherapeutic + uncompleted + refusedIcteric + virologyC + virologyB + virologyI + virologyDollar)),
    ratio_returned: pct(dispReturned, outBloodInt),
    ratio_reaction: pct(dispReaction, outBloodInt),
    ratio_open: pct(dispOpen, outBloodInt),
    ratio_other: pct(dispOther, outBloodInt),

    // ===== أطفال =====
    child_ct: (d.child_compatibility||0) ? Math.round(((d.child_out_blood||0) / (d.child_compatibility||0)) * 100) / 100 : 0,
    child_pct_exp: pct(d.child_disp_exp, d.child_out_blood),
    child_pct_returned: pct(d.child_disp_returned, d.child_out_blood),
    child_pct_reaction: pct(d.child_disp_reaction, d.child_out_blood),
    child_pct_open: pct(d.child_disp_open, d.child_out_blood),
    child_pct_other: pct(d.child_disp_other, d.child_out_blood)
  };
}

const BIG_COL_DEFS = [
  { key: 'governorate', label: 'الفرع', cls: 'gov-col', group: '' },
  { key: 'hospital_name', label: 'بنك الدم', cls: 'hosp-col', group: '' },

  // ===== التجميع =====
  { key: 'collect_total', label: 'التجميع', group: 'التجميع' },

  // ===== إجمالي الوارد =====
  { key: 'inc_blood', label: 'دم', group: 'إجمالي الوارد' },
  { key: 'inc_plasma', label: 'بلازما', group: 'إجمالي الوارد' },
  { key: 'inc_sdp', label: 'SDP', group: 'إجمالي الوارد', sg: 'صفائح' },
  { key: 'inc_rdp', label: 'RDP', group: 'إجمالي الوارد', sg: 'صفائح' },

  // ===== إجمالي المنصرف =====
  { key: 'out_blood_int', label: 'داخلي', group: 'إجمالي المنصرف', sg: 'دم' },
  { key: 'out_blood_branch', label: 'فرع', group: 'إجمالي المنصرف', sg: 'دم' },
  { key: 'out_blood_auth', label: 'هيئة', group: 'إجمالي المنصرف', sg: 'دم' },
  { key: 'out_blood_ext', label: 'خارجي', group: 'إجمالي المنصرف', sg: 'دم' },
  { key: 'out_plasma_int', label: 'داخلي', group: 'إجمالي المنصرف', sg: 'بلازما' },
  { key: 'out_plasma_ext', label: 'خارجي', group: 'إجمالي المنصرف', sg: 'بلازما' },
  { key: 'out_sdp', label: 'SDP', group: 'إجمالي المنصرف', sg: 'صفائح' },
  { key: 'out_rdp', label: 'RDP', group: 'إجمالي المنصرف', sg: 'صفائح' },

  // ===== الفصائل، التوافق، C/T =====
  { key: 'blood_groups', label: 'الفصائل', group: 'الفصائل والتوافق' },
  { key: 'compatibility', label: 'التوافق', group: 'الفصائل والتوافق' },
  { key: 'ct', label: 'C/T', formula: true, group: 'الفصائل والتوافق', target: '<2' },

  // ===== عينات غير مفحوصة =====
  { key: 'donation_therapeutic', label: 'تبرع علاجي', group: 'عينات غير مفحوصة' },
  { key: 'uncompleted', label: 'لم يكتمل', group: 'عينات غير مفحوصة' },
  { key: 'refused_fatty', label: 'دهون', group: 'عينات غير مفحوصة', sg: 'عينات مرفوضة' },
  { key: 'refused_icteric', label: 'Icteric', group: 'عينات غير مفحوصة', sg: 'عينات مرفوضة' },

  // ===== الإعدامات =====
  { key: 'disp_exp_blood', label: 'دم', group: 'الإعدامات', sg: 'إنتهاء الصلاحيه' },
  { key: 'disp_exp_plasma', label: 'بلازما', group: 'الإعدامات', sg: 'إنتهاء الصلاحيه' },
  { key: 'disp_exp_sdp', label: 'SDP', group: 'الإعدامات', sg: 'إنتهاء الصلاحيه' },
  { key: 'disp_exp_rdp', label: 'RDP', group: 'الإعدامات', sg: 'إنتهاء الصلاحيه' },
  { key: 'disp_returned', label: 'مرتجع', group: 'الإعدامات' },
  { key: 'disp_reaction', label: 'تفاعل', group: 'الإعدامات' },
  { key: 'disp_open', label: 'نظام مفتوح', group: 'الإعدامات' },
  { key: 'disp_other', label: 'أخرى', group: 'الإعدامات' },
  { key: 'virology_c', label: 'C', group: 'الإعدامات', sg: 'الفيروسات' },
  { key: 'virology_b', label: 'B', group: 'الإعدامات', sg: 'الفيروسات' },
  { key: 'virology_i', label: 'I', group: 'الإعدامات', sg: 'الفيروسات' },
  { key: 'virology_dollar', label: '$', group: 'الإعدامات', sg: 'الفيروسات' },
  { key: 'virology_total', label: 'إجمالي', group: 'الإعدامات', sg: 'الفيروسات', formula: true },

  // ===== تحليل نسب المؤشرات / الإعدام =====
  { key: 'tested', label: 'المفحوص', formula: true, cls: 'formula-cell', group: 'تحليل نسب المؤشرات', target: '> last' },
  { key: 'ratio_uncompleted', label: 'لم يكتمل', formula: true, cls: 'formula-cell', group: 'تحليل نسب المؤشرات', target: '<2%' },
  { key: 'ratio_refused', label: 'مرفوضه', formula: true, cls: 'formula-cell', group: 'تحليل نسب المؤشرات', target: '<1%' },
  { key: 'ratio_c', label: 'C', formula: true, cls: 'formula-cell', group: 'تحليل نسب المؤشرات', sg: 'الفيروسات', target: '<3%' },
  { key: 'ratio_b', label: 'B', formula: true, cls: 'formula-cell', group: 'تحليل نسب المؤشرات', sg: 'الفيروسات', target: '<1%' },
  { key: 'ratio_i', label: 'I', formula: true, cls: 'formula-cell', group: 'تحليل نسب المؤشرات', sg: 'الفيروسات', target: '<0.5%' },
  { key: 'ratio_dollar', label: '$', formula: true, cls: 'formula-cell', group: 'تحليل نسب المؤشرات', sg: 'الفيروسات', target: '<0.5%' },
  { key: 'ratio_exp', label: 'Exp', formula: true, cls: 'formula-cell', group: 'تحليل نسب المؤشرات', target: '0' },
  { key: 'ratio_returned', label: 'مرتجع', formula: true, cls: 'formula-cell', group: 'تحليل نسب المؤشرات', target: '<1%' },
  { key: 'ratio_reaction', label: 'تفاعل', formula: true, cls: 'formula-cell', group: 'تحليل نسب المؤشرات', target: '<2%' },
  { key: 'ratio_open', label: 'مفتوح', formula: true, cls: 'formula-cell', group: 'تحليل نسب المؤشرات', target: '<1%' },
  { key: 'ratio_other', label: 'أخرى', formula: true, cls: 'formula-cell', group: 'تحليل نسب المؤشرات', target: '<1%' },

  // ===== مؤشرات وحدات دم الأطفال =====
  { key: 'child_inc_collected', label: 'تجميعي', group: 'مؤشرات وحدات دم الأطفال', sg: 'وارد الدم' },
  { key: 'child_inc_regional', label: 'إقليمي', group: 'مؤشرات وحدات دم الأطفال', sg: 'وارد الدم' },
  { key: 'child_out_blood', label: 'منصرف الدم', group: 'مؤشرات وحدات دم الأطفال' },
  { key: 'child_blood_groups', label: 'الفصائل', group: 'مؤشرات وحدات دم الأطفال' },
  { key: 'child_compatibility', label: 'التوافق', group: 'مؤشرات وحدات دم الأطفال' },
  { key: 'child_ct', label: 'C/T', group: 'مؤشرات وحدات دم الأطفال', formula: true, target: '<2' },
  { key: 'child_disp_exp', label: 'EXP', group: 'مؤشرات وحدات دم الأطفال', sg: 'اعدامات الدم' },
  { key: 'child_disp_returned', label: 'مرتجع', group: 'مؤشرات وحدات دم الأطفال', sg: 'اعدامات الدم' },
  { key: 'child_disp_reaction', label: 'تفاعل', group: 'مؤشرات وحدات دم الأطفال', sg: 'اعدامات الدم' },
  { key: 'child_disp_open', label: 'نظام مفتوح', group: 'مؤشرات وحدات دم الأطفال', sg: 'اعدامات الدم' },
  { key: 'child_disp_other', label: 'أخرى', group: 'مؤشرات وحدات دم الأطفال', sg: 'اعدامات الدم' },

  // ===== النسب المئوية للاعدام - أطفال =====
  { key: 'child_pct_exp', label: 'Exp الدم', formula: true, cls: 'formula-cell', group: 'النسب المئوية للاعدام - أطفال', target: '0%' },
  { key: 'child_pct_returned', label: 'مرتجع', formula: true, cls: 'formula-cell', group: 'النسب المئوية للاعدام - أطفال', target: '<2%' },
  { key: 'child_pct_reaction', label: 'تفاعل', formula: true, cls: 'formula-cell', group: 'النسب المئوية للاعدام - أطفال', target: '<1%' },
  { key: 'child_pct_open', label: 'نظام مفتوح', formula: true, cls: 'formula-cell', group: 'النسب المئوية للاعدام - أطفال', target: '<1%' },
  { key: 'child_pct_other', label: 'أخرى', formula: true, cls: 'formula-cell', group: 'النسب المئوية للاعدام - أطفال', target: '<1%' }
];

const SMALL_COL_DEFS = [
  { key: 'governorate', label: 'الفرع', cls: 'gov-col' },
  { key: 'hospital_name', label: 'بنك الدم', cls: 'hosp-col' },

  // ===== إجمالي الوارد =====
  { key: 'inc_collected', label: 'تجميعي', group: 'إجمالي الوارد', sg: 'دم' },
  { key: 'inc_regional', label: 'إقليمي', group: 'إجمالي الوارد', sg: 'دم' },
  { key: 'inc_plasma', label: 'بلازما', group: 'إجمالي الوارد' },
  { key: 'inc_sdp', label: 'SDP', group: 'إجمالي الوارد', sg: 'صفائح' },
  { key: 'inc_rdp', label: 'RDP', group: 'إجمالي الوارد', sg: 'صفائح' },

  // ===== إجمالي المنصرف =====
  { key: 'out_blood', label: 'دم', group: 'إجمالي المنصرف' },
  { key: 'out_plasma', label: 'بلازما', group: 'إجمالي المنصرف' },
  { key: 'out_sdp', label: 'SDP', group: 'إجمالي المنصرف', sg: 'صفائح' },
  { key: 'out_rdp', label: 'RDP', group: 'إجمالي المنصرف', sg: 'صفائح' },

  // ===== الفصائل، التوافق، C/T =====
  { key: 'blood_groups', label: 'الفصائل', group: 'الفصائل والتوافق' },
  { key: 'compatibility', label: 'التوافق', group: 'الفصائل والتوافق' },
  { key: 'ct', label: 'C/T', formula: true, group: 'الفصائل والتوافق', target: '<2' },

  // ===== الإعدامات =====
  { key: 'disp_exp_blood', label: 'الدم', group: 'الإعدامات', sg: 'انتهاء الصلاحيه' },
  { key: 'disp_exp_plasma', label: 'بلازما', group: 'الإعدامات', sg: 'انتهاء الصلاحيه' },
  { key: 'disp_exp_sdp', label: 'SDP', group: 'الإعدامات', sg: 'انتهاء الصلاحيه' },
  { key: 'disp_exp_rdp', label: 'RDP', group: 'الإعدامات', sg: 'انتهاء الصلاحيه' },
  { key: 'disp_returned', label: 'مرتجع', group: 'الإعدامات' },
  { key: 'disp_reaction', label: 'تفاعل', group: 'الإعدامات' },
  { key: 'disp_open', label: 'نظام مفتوح', group: 'الإعدامات' },
  { key: 'disp_other', label: 'أخرى', group: 'الإعدامات' },

  // ===== النسب المئوية للاعدام =====
  { key: 'pct_exp', label: 'Exp الدم', formula: true, cls: 'formula-cell', group: 'النسب المئوية للاعدام', target: '0%' },
  { key: 'pct_returned', label: 'مرتجع', formula: true, cls: 'formula-cell', group: 'النسب المئوية للاعدام', target: '<2%' },
  { key: 'pct_reaction', label: 'تفاعل', formula: true, cls: 'formula-cell', group: 'النسب المئوية للاعدام', target: '<1%' },
  { key: 'pct_open', label: 'نظام مفتوح', formula: true, cls: 'formula-cell', group: 'النسب المئوية للاعدام', target: '<1%' },
  { key: 'pct_other', label: 'أخرى', formula: true, cls: 'formula-cell', group: 'النسب المئوية للاعدام', target: '<1%' },

  // ===== مؤشرات وحدات دم الأطفال =====
  { key: 'child_inc_collected', label: 'تجميعي', group: 'مؤشرات وحدات دم الأطفال', sg: 'وارد الدم' },
  { key: 'child_inc_regional', label: 'إقليمي', group: 'مؤشرات وحدات دم الأطفال', sg: 'وارد الدم' },
  { key: 'child_out_blood', label: 'منصرف الدم', group: 'مؤشرات وحدات دم الأطفال' },
  { key: 'child_blood_groups', label: 'الفصائل', group: 'مؤشرات وحدات دم الأطفال' },
  { key: 'child_compatibility', label: 'التوافق', group: 'مؤشرات وحدات دم الأطفال' },
  { key: 'child_ct', label: 'C/T', group: 'مؤشرات وحدات دم الأطفال', formula: true, target: '<2' },
  { key: 'child_disp_exp', label: 'EXP', group: 'مؤشرات وحدات دم الأطفال', sg: 'اعدامات الدم' },
  { key: 'child_disp_returned', label: 'مرتجع', group: 'مؤشرات وحدات دم الأطفال', sg: 'اعدامات الدم' },
  { key: 'child_disp_reaction', label: 'تفاعل', group: 'مؤشرات وحدات دم الأطفال', sg: 'اعدامات الدم' },
  { key: 'child_disp_open', label: 'نظام مفتوح', group: 'مؤشرات وحدات دم الأطفال', sg: 'اعدامات الدم' },
  { key: 'child_disp_other', label: 'أخرى', group: 'مؤشرات وحدات دم الأطفال', sg: 'اعدامات الدم' },

  // ===== النسب المئوية للاعدام (أطفال) =====
  { key: 'child_pct_exp', label: 'Exp الدم', formula: true, cls: 'formula-cell', group: 'النسب المئوية للاعدام - أطفال', target: '0%' },
  { key: 'child_pct_returned', label: 'مرتجع', formula: true, cls: 'formula-cell', group: 'النسب المئوية للاعدام - أطفال', target: '<2%' },
  { key: 'child_pct_reaction', label: 'تفاعل', formula: true, cls: 'formula-cell', group: 'النسب المئوية للاعدام - أطفال', target: '<1%' },
  { key: 'child_pct_open', label: 'نظام مفتوح', formula: true, cls: 'formula-cell', group: 'النسب المئوية للاعدام - أطفال', target: '<1%' },
  { key: 'child_pct_other', label: 'أخرى', formula: true, cls: 'formula-cell', group: 'النسب المئوية للاعدام - أطفال', target: '<1%' }
];

function makeGroupHeader(colDefs) {
  const groups = [];
  let currentGroup = null;
  colDefs.forEach(c => {
    const g = c.group || '';
    if (!currentGroup || currentGroup.label !== g) {
      currentGroup = { label: g, cols: [], subs: new Map() };
      groups.push(currentGroup);
    }
    currentGroup.cols.push(c);
    if (c.sg) {
      if (!currentGroup.subs.has(c.sg)) currentGroup.subs.set(c.sg, []);
      currentGroup.subs.get(c.sg).push(c);
    }
  });
  const hasSub = groups.some(g => g.subs.size > 0);
  let r1 = '<tr class="grp1">';
  let r2 = '<tr class="grp2">';
  let r3 = '<tr class="grp3">';
  groups.forEach(g => {
    if (!g.label) {
      g.cols.forEach(c => { r1 += `<th rowspan="${hasSub ? 3 : 2}">${c.label}</th>`; });
    } else if (g.subs.size > 0) {
      r1 += `<th colspan="${g.cols.length}" class="grp-parent" data-group="${g.label}">${g.label}</th>`;
      let colIdx = 0;
      while (colIdx < g.cols.length) {
        const c = g.cols[colIdx];
        if (c.sg && g.subs.has(c.sg)) {
          const subCols = g.subs.get(c.sg);
          r2 += `<th colspan="${subCols.length}" class="grp-child" data-sg="${c.sg}">${c.sg}</th>`;
          subCols.forEach(sc => { r3 += `<th class="grp-detail">${sc.label}</th>`; });
          colIdx += subCols.length;
        } else {
          r2 += `<th rowspan="2" class="grp-child">${c.label}</th>`;
          colIdx++;
        }
      }
    } else if (g.cols.length > 1) {
      r1 += `<th colspan="${g.cols.length}" class="grp-parent" data-group="${g.label}">${g.label}</th>`;
      g.cols.forEach(c => { r2 += `<th rowspan="${hasSub ? 2 : 1}" class="grp-child">${c.label}</th>`; });
    } else {
      r1 += `<th rowspan="${hasSub ? 3 : 2}" data-group="${g.label}">${g.label}</th>`;
    }
  });
  return r1 + '</tr>' + r2 + '</tr>' + (hasSub ? r3 + '</tr>' : '');
}

function renderIndicatorsTable(hospitals, data, canEdit, presetType) {
  const wrap = document.getElementById('indTableWrap');
  const dataMap = {};
  data.forEach(r => { dataMap[r.hospital_id] = r; });
  const hFilter = document.getElementById('indHospitalFilter')?.value;
  const typeFilter = document.getElementById('indTypeFilter')?.value || presetType;
  let showHospitals;
  if (hFilter) showHospitals = hospitals.filter(h => h.id == hFilter);
  else if (typeFilter) showHospitals = hospitals.filter(h => h.type === typeFilter);
  else showHospitals = hospitals;
  const tableType = presetType || typeFilter;
  const canDelete = hasPerm('monthly_indicators', 'delete');
  const COL_KEYS = [];

  function getCellValue(hosp, r, d, f, c) {
    if (c.key === 'governorate') return hosp.governorate || '';
    if (c.key === 'hospital_name') return hosp.name || '';
    if (c.formula) return (f[c.key] ?? '');
    return (d[c.key] ?? '');
  }

  function renderTable(colDefs, label, computeFn, type) {
    const t = type === 'child' ? 'child' : 'big';
    const months = ['يناير','فبراير','مارس','ابريل','مايو','يونيو','يوليو','اغسطس','سبتمبر','اكتوبر','نوفمبر','ديسمبر'];
    const filtYear = document.getElementById('indYearFilter')?.value || '';
    const filtMonth = parseInt(document.getElementById('indMonthFilter')?.value) || 1;
    let headerHtml = makeGroupHeader(colDefs);
    headerHtml = headerHtml.replace(/(rowspan="[23]">بنك الدم<\/th>)/, '$1<th rowspan="3" style="min-width:44px;font-size:11px;color:#5A7A9A">الشهر</th>');
    let h = `<h3 style="margin:24px 0 10px;font-size:16px;color:#2c3e50;border-right:4px solid #dc3545;padding-right:10px">${label}</h3>
      <div class="table-wrap"><table class="ind-table"><thead>${headerHtml}</thead><tbody>`;
    showHospitals.forEach(hosp => {
      const r = dataMap[hosp.id];
      const d = r ? (r.data || {}) : {};
      const f = computeFn(d);
      const hasData = !!r;
      const m = r ? (months[(r.month||1)-1] + ' ' + (r.year||'')) : (months[filtMonth-1] + ' ' + filtYear);
      h += `<tr data-rid="${r ? r.id : ''}" data-hid="${hosp.id}" data-type="${t}">`;
      let colIdx = 0;
      colDefs.forEach(c => {
        let val = getCellValue(hosp, r, d, f, c);
        const isEditable = canEdit && !c.formula && c.key !== 'governorate' && c.key !== 'hospital_name';
        let cls = c.cls || (c.formula ? 'formula-cell' : '');
        let style = '';
        if (c.formula && val !== '' && val != null) {
          const n = parseFloat(val);
          if (!isNaN(n) && (c.key.startsWith('pct_') || c.key.startsWith('child_pct_') || c.key.startsWith('ratio_'))) {
            val = n + '%';
            if (n > 0) { cls += ' warn-pct'; style = ' style="color:#e74c3c;font-weight:700;background:#ffeaea"'; }
          }
        }
        if (isEditable) {
          const dataKey = COL_KEYS.includes(c.key) ? 'col:' + c.key : c.key;
          h += `<td class="${cls} editable-cell" data-key="${dataKey}"${style}>${val}</td>`;
        } else {
          h += `<td class="${cls}"${style}>${val}</td>`;
        }
        colIdx++;
        if (colIdx === 2) h += `<td style="white-space:nowrap;font-size:11px;color:#5A7A9A;font-weight:600">${m}</td>`;
      });
      const addBtn = canEdit && !hasData ? `<button class="btn btn-sm btn-outline" onclick="showAddIndModal(${hosp.id},'${t}')"><i class="fas fa-plus"></i></button>` : '';
      const delBtn = canDelete && hasData ? `<button class="btn btn-sm btn-outline-danger" onclick="deleteIndicator(${r.id})" style="margin-right:4px"><i class="fas fa-trash"></i></button>` : '';
      h += `<td style="white-space:nowrap">${delBtn}${addBtn}</td>`;
      h += '</tr>';
    });
    if (!showHospitals.length) h += `<tr><td colspan="${colDefs.length + 2}" class="empty-msg">لا توجد مستشفيات</td></tr>`;
    h += '</tbody></table></div>';
    return h;
  }

  if (tableType === 'تجميعي') {
    wrap.innerHTML = renderTable(BIG_COL_DEFS, 'مؤشرات أداء البنوك التجميعية', computeBigFormulas, 'big');
  } else if (tableType === 'تخزيني') {
    wrap.innerHTML = renderTable(SMALL_COL_DEFS, 'مؤشرات أداء البنوك التخزينية', computeSmallFormulas, 'child');
  } else {
    wrap.innerHTML = renderTable(BIG_COL_DEFS, 'التجميعي - مؤشرات أداء البنوك التجميعية', computeBigFormulas, 'big') +
      renderTable(SMALL_COL_DEFS, 'التخزيني - مؤشرات أداء البنوك التخزينية', computeSmallFormulas, 'child');
  }

  if (canEdit) {
    wrap.querySelectorAll('.editable-cell, .formula-cell').forEach(td => {
      td.addEventListener('click', function(ev) {
        if (td.classList.contains('formula-cell')) {
          showToast('⚠️ غير مسموح التعديل - هذه الخلية تحتوي على معادلة');
          return;
        }
        if (this.contentEditable === 'true') return;
        const orig = this.textContent.trim();
        this.contentEditable = true;
        this.focus();
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(this);
        sel.removeAllRanges();
        sel.addRange(range);
        const finish = () => {
          this.contentEditable = false;
          const newVal = this.textContent.trim();
          if (newVal === orig) return;
          const tr = this.closest('tr');
          const hid = parseInt(tr.dataset.hid);
          const rid = tr.dataset.rid ? parseInt(tr.dataset.rid) : null;
          const key = this.dataset.key;
          const isColKey = key.startsWith('col:');
          const fieldKey = isColKey ? key.slice(4) : key;
          saveIndicatorCell(hid, rid, fieldKey, newVal, isColKey, tr, tr.dataset.type);
        };
        this.onblur = finish;
        this.onkeydown = function(ev) {
          if (ev.key === 'Enter') { ev.preventDefault(); this.blur(); }
          if (ev.key === 'Escape') { this.textContent = orig; this.contentEditable = false; this.classList.remove('editing'); }
        };
      });
    });
  }
}

async function saveIndicatorCell(hospitalId, recordId, fieldKey, newValue, isColKey, rowElement, type) {
  try {
    let savedData;
    if (recordId) {
      const items = await api('GET', '/monthly-indicators');
      const r = items.find(x => x.id === recordId);
      if (!r) return;
      const mergedData = { ...(r.data || {}) };
      const body = { data: mergedData, day: r.day, time: r.time };
      if (isColKey) {
        body[fieldKey] = isNaN(newValue) ? newValue : (parseInt(newValue) || 0);
      } else {
        mergedData[fieldKey] = isNaN(newValue) ? newValue : (parseInt(newValue) || 0);
      }
      const result = await api('PUT', '/monthly-indicators/' + recordId, body);
      savedData = result.data || {};
    } else {
      const year = parseInt(document.getElementById('indYearFilter')?.value) || new Date().getFullYear();
      const month = parseInt(document.getElementById('indMonthFilter')?.value) || new Date().getMonth() + 1;
      const data = {};
      if (!isColKey) data[fieldKey] = isNaN(newValue) ? newValue : (parseInt(newValue) || 0);
      const body = { hospitalId, year, month, data };
      if (isColKey) body[fieldKey] = isNaN(newValue) ? newValue : (parseInt(newValue) || 0);
      const result = await api('POST', '/monthly-indicators', body);
      if (rowElement) rowElement.dataset.rid = result.id;
      savedData = result.data || {};
    }
    // Update formula cells in this row
    if (rowElement) {
      const colDefs = type === 'child' ? SMALL_COL_DEFS : BIG_COL_DEFS;
      const computeFn = type === 'child' ? computeSmallFormulas : computeBigFormulas;
      const cells = rowElement.querySelectorAll('td');
      const recData = typeof savedData === 'string' ? tryParse(savedData) : savedData;
      const f = computeFn(recData);
      colDefs.forEach((c, i) => {
        if (c.formula && cells[i]) {
          cells[i].textContent = f[c.key] ?? '';
        }
      });
    }
  } catch (e) {
    alert(e.message);
  }
}

const INDICATOR_FIELDS = [
  { key: 'collect_total', label: 'التجميع', type: 'number' },
  { key: 'inc_regional', label: 'وارد إقليمي', type: 'number' },
  { key: 'inc_blood', label: 'وارد الدم', type: 'number' },
  { key: 'inc_plasma', label: 'وارد بلازما', type: 'number' },
  { key: 'inc_sdp', label: 'وارد SDP', type: 'number' },
  { key: 'inc_rdp', label: 'وارد RDP', type: 'number' },
  { key: 'out_blood_int', label: 'منصرف دم داخلي', type: 'number' },
  { key: 'out_blood_branch', label: 'منصرف دم فرع', type: 'number' },
  { key: 'out_blood_auth', label: 'منصرف دم هيئة', type: 'number' },
  { key: 'out_blood_ext', label: 'منصرف دم خارجي', type: 'number' },
  { key: 'out_plasma_int', label: 'منصرف بلازما داخلي', type: 'number' },
  { key: 'out_plasma_ext', label: 'منصرف بلازما خارجي', type: 'number' },
  { key: 'out_sdp', label: 'منصرف SDP', type: 'number' },
  { key: 'out_rdp', label: 'منصرف RDP', type: 'number' },
  { key: 'blood_groups', label: 'الفصائل', type: 'number' },
  { key: 'compatibility', label: 'التوافق', type: 'number' },
  { key: 'ct', label: 'C/T', type: 'number' },
  { key: 'donation_therapeutic', label: 'تبرع علاجي', type: 'number' },
  { key: 'uncompleted', label: 'لم يكتمل', type: 'number' },
  { key: 'refused_fatty', label: 'دهون', type: 'number' },
  { key: 'refused_icteric', label: 'Icteric', type: 'number' },
  { key: 'refused_all', label: 'All', type: 'number' },
  { key: 'virology_c', label: 'C', type: 'number' },
  { key: 'virology_b', label: 'B', type: 'number' },
  { key: 'virology_i', label: 'I', type: 'number' },
  { key: 'virology_dollar', label: '$', type: 'number' },
  { key: 'disp_exp_blood', label: 'Exp دم', type: 'number' },
  { key: 'disp_exp_plasma', label: 'Exp بلازما', type: 'number' },
  { key: 'disp_exp_sdp', label: 'Exp SDP', type: 'number' },
  { key: 'disp_exp_rdp', label: 'Exp RDP', type: 'number' },
  { key: 'disp_returned', label: 'مرتجع', type: 'number' },
  { key: 'disp_reaction', label: 'تفاعل', type: 'number' },
  { key: 'disp_open', label: 'مفتوح', type: 'number' },
  { key: 'disp_other', label: 'أخري', type: 'number' }
];

const CHILD_FIELDS = [
  { key: 'child_inc_collected', label: 'وارد تجميعي', type: 'number' },
  { key: 'child_inc_storage', label: 'وارد تخزيني', type: 'number' },
  { key: 'child_out_blood', label: 'منصرف الدم', type: 'number' },
  { key: 'child_blood_groups', label: 'الفصائل', type: 'number' },
  { key: 'child_compatibility', label: 'التوافق', type: 'number' },
  { key: 'child_ct', label: 'C/T', type: 'number' },
  { key: 'child_disp_exp', label: 'إعدام EXP', type: 'number' },
  { key: 'child_disp_returned', label: 'إعدام مرتجع', type: 'number' },
  { key: 'child_disp_reaction', label: 'إعدام تفاعل', type: 'number' },
  { key: 'child_disp_open', label: 'إعدام نظام مفتوح', type: 'number' },
  { key: 'child_disp_other', label: 'إعدام أخرى', type: 'number' }
];

async function showAddIndModal(hospitalId, type) {
  const hospitals = await api('GET', '/hospitals');
  let html = '<div class="form-group"><label>المستشفى</label><select class="form-control" id="fIndHospital">';
  hospitals.forEach(h => {
    html += `<option value="${h.id}" ${h.id == hospitalId ? 'selected' : ''}>${h.name} (${h.type || ''})</option>`;
  });
  const now = new Date();
  html += `</select></div>
    <div class="form-group"><label>السنة</label><input type="number" class="form-control" id="fIndYear" value="${now.getFullYear()}"></div>
    <div class="form-group"><label>الشهر</label><select class="form-control" id="fIndMonth">
      ${['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'].map((m, i) => `<option value="${i+1}" ${i === now.getMonth() ? 'selected' : ''}>${m}</option>`).join('')}
    </select></div>
    `;
  if (type === 'child') {
    html += '<h4 style="margin:16px 0 8px;color:#17a2b8">التخزيني - مؤشرات أداء البنوك التخزينية</h4><div class="ind-form-grid">';
    CHILD_FIELDS.forEach(f => {
      html += `<div class="form-group"><label>${f.label}</label><input type="${f.type}" class="form-control" id="fInd_${f.key}" value="0"></div>`;
    });
  } else {
    html += '<h4 style="margin:16px 0 8px;color:#dc3545">التجميعي - مؤشرات أداء البنوك التجميعية</h4><div class="ind-form-grid">';
    INDICATOR_FIELDS.forEach(f => {
      html += `<div class="form-group"><label>${f.label}</label><input type="${f.type}" class="form-control" id="fInd_${f.key}" value="0"></div>`;
    });
  }
  html += '</div>';
  const title = type === 'child' ? 'إضافة مؤشرات صغار' : 'إضافة مؤشرات كبار';
  openModal(title, html,
    `<button class="btn btn-secondary" onclick="closeModal()">إلغاء</button><button class="btn btn-primary" onclick="createIndicator('${type}')">حفظ</button>`);
}

async function createIndicator(type) {
  const hospitalId = parseInt(document.getElementById('fIndHospital').value);
  const year = parseInt(document.getElementById('fIndYear').value);
  const month = parseInt(document.getElementById('fIndMonth').value);
  if (!hospitalId) { alert('اختر المستشفى'); return; }
  const data = {};
  const fields = type === 'child' ? CHILD_FIELDS : INDICATOR_FIELDS;
  fields.forEach(f => {
    const el = document.getElementById('fInd_' + f.key);
    if (!el) return;
    const val = f.type === 'number' ? (parseInt(el.value) || 0) : el.value;
    data[f.key] = val;
  });
  try {
    await api('POST', '/monthly-indicators', { hospitalId, year, month, data });
    closeModal();
    renderMonthlyIndicators();
  } catch (e) { alert(e.message); }
}

async function editIndicator(id, type) {
  const items = await api('GET', '/monthly-indicators');
  const r = items.find(x => x.id === id);
  if (!r) return;
  const d = r.data || {};
  let html = '';
  if (type === 'child') {
    html += '<h4 style="margin:16px 0 8px;color:#17a2b8">التخزيني - مؤشرات أداء البنوك التخزينية</h4><div class="ind-form-grid">';
    CHILD_FIELDS.forEach(f => {
      html += `<div class="form-group"><label>${f.label}</label><input type="${f.type}" class="form-control" id="fInd_${f.key}" value="${d[f.key] ?? 0}"></div>`;
    });
  } else {
    html += '<h4 style="margin:16px 0 8px;color:#dc3545">التجميعي - مؤشرات أداء البنوك التجميعية</h4><div class="ind-form-grid">';
    INDICATOR_FIELDS.forEach(f => {
      html += `<div class="form-group"><label>${f.label}</label><input type="${f.type}" class="form-control" id="fInd_${f.key}" value="${d[f.key] ?? 0}"></div>`;
    });
  }
  html += '</div>';
  const title = type === 'child' ? 'تعديل مؤشرات صغار' : 'تعديل مؤشرات كبار';
  openModal(title, html,
    `<button class="btn btn-secondary" onclick="closeModal()">إلغاء</button><button class="btn btn-primary" onclick="updateIndicator(${id})">حفظ</button>`);
}

async function updateIndicator(id) {
  const data = {};
  INDICATOR_FIELDS.forEach(f => {
    const el = document.getElementById('fInd_' + f.key);
    if (!el) return;
    const val = f.type === 'number' ? (parseInt(el.value) || 0) : el.value;
    data[f.key] = val;
  });
  try {
    await api('PUT', '/monthly-indicators/' + id, { data });
    closeModal();
    renderMonthlyIndicators();
  } catch (e) { alert(e.message); }
}

async function deleteIndicator(id) {
  if (!confirm('هل أنت متأكد من حذف هذه المؤشرات؟')) return;
  try {
    await api('DELETE', '/monthly-indicators/' + id);
    renderMonthlyIndicators();
  } catch (e) { alert(e.message); }
}

// ============== Archive edit/delete for indicators ==============

async function editIndicatorArchiveRecord(archiveId, hospitalId, year, month, period) {
  try {
    const items = await api('GET', '/archive');
    const arch = items.find(a => a.id === archiveId);
    if (!arch) { alert('لم يتم العثور على الأرشيف'); return; }
    let dataArr = tryParse(arch.data) || [];
    const record = dataArr.find(r => parseInt(r.hospital_id) === hospitalId && r.year === year && (month > 0 ? r.month === month : true) && (r.period || 'monthly') === (period || 'monthly'));
    if (!record) { alert('لم يتم العثور على السجل'); return; }
    const d = typeof record.data === 'string' ? tryParse(record.data) : record.data || {};

    const hospitals = await api('GET', '/hospitals');
    let html = `<div class="form-group"><label>بنك الدم</label>
      <select class="form-control" id="fIndArchHosp"><option value="">اختر</option>
      ${hospitals.map(h => `<option value="${h.id}" ${h.id === hospitalId ? 'selected' : ''}>${h.name} (${h.type || ''})</option>`).join('')}</select></div>
      <div class="form-group"><label>اليوم</label><input type="text" class="form-control" id="fIndArchDay" value="${record.day || ''}"></div>
      <div class="form-group"><label>الوقت</label><input type="text" class="form-control" id="fIndArchTime" value="${record.time || ''}"></div>`;
    html += '<h4 style="margin:16px 0 8px;color:#3f51b5">البيانات</h4><div class="ind-form-grid">';
    INDICATOR_FIELDS.filter(f => f.key !== 'day' && f.key !== 'time').forEach(f => {
      html += `<div class="form-group"><label>${f.label}</label><input type="${f.type}" class="form-control" id="fIndArch_${f.key}" value="${d[f.key] ?? 0}"></div>`;
    });
    html += '</div>';
    html += '<h4 style="margin:16px 0 8px;color:#17a2b8">صغار - وحدات دم الأطفال</h4><div class="ind-form-grid">';
    CHILD_FIELDS.forEach(f => {
      html += `<div class="form-group"><label>${f.label}</label><input type="${f.type}" class="form-control" id="fIndArch_${f.key}" value="${d[f.key] ?? 0}"></div>`;
    });
    html += '</div>';
    openModal('تعديل بيانات مؤشرات الأداء في الأرشيف', html,
      `<button class="btn btn-secondary" onclick="closeModal()">إلغاء</button>
      <button class="btn btn-primary" onclick="saveEditIndicatorArchive(${archiveId},${hospitalId},${year},${month},'${period}')">حفظ</button>`);
  } catch (e) { alert(e.message); }
}

async function saveEditIndicatorArchive(archiveId, hospitalId, year, month, period) {
  try {
    const data = {};
    let day = (document.getElementById('fIndArchDay')?.value || '').trim();
    let time = (document.getElementById('fIndArchTime')?.value || '').trim();
    INDICATOR_FIELDS.forEach(f => {
      const el = document.getElementById('fIndArch_' + f.key);
      if (!el) return;
      if (f.key === 'day') { if (!day) day = el.value; }
      else if (f.key === 'time') { if (!time) time = el.value; }
      else data[f.key] = f.type === 'number' ? (parseInt(el.value) || 0) : el.value;
    });
    CHILD_FIELDS.forEach(f => {
      const el = document.getElementById('fIndArch_' + f.key);
      if (el) data[f.key] = f.type === 'number' ? (parseInt(el.value) || 0) : el.value;
    });
    const items = await api('GET', '/archive');
    const arch = items.find(a => a.id === archiveId);
    if (!arch) { alert('لم يتم العثور على الأرشيف'); return; }
    let dataArr = tryParse(arch.data) || [];
    dataArr = dataArr.map(r => {
      if (parseInt(r.hospital_id) === hospitalId && r.year === year && (month > 0 ? r.month === month : true) && (r.period || 'monthly') === (period || 'monthly')) {
        return { ...r, data: JSON.stringify(data), day, time };
      }
      return r;
    });
    await api('PUT', '/archive/' + archiveId, { data: dataArr });
    closeModal();
    showToast('✅ تم تعديل البيانات في الأرشيف بنجاح');
    renderArchiveIndicatorsTable();
  } catch (e) { alert(e.message); }
}

async function deleteIndicatorArchiveRecord(archiveId, hospitalId, year, month, period) {
  if (!confirm('هل أنت متأكد من حذف هذا السجل من الأرشيف؟')) return;
  try {
    const items = await api('GET', '/archive');
    const arch = items.find(a => a.id === archiveId);
    if (!arch) { alert('لم يتم العثور على الأرشيف'); return; }
    let dataArr = tryParse(arch.data) || [];
    dataArr = dataArr.filter(r => {
      if (parseInt(r.hospital_id) !== hospitalId) return true;
      if (r.year !== year) return true;
      if (month > 0 && r.month !== month) return true;
      if ((r.period || 'monthly') !== (period || 'monthly')) return true;
      return false;
    });
    if (dataArr.length === 0) {
      await api('DELETE', '/archive/' + archiveId);
    } else {
      await api('PUT', '/archive/' + archiveId, { data: dataArr });
    }
    renderArchiveIndicatorsTable();
  } catch (e) { alert(e.message); }
}

// === Readiness Sheet ===
// === Readiness Sheet ===
let _rdn = { occasions: [], hospitals: [], employees: [], reports: [] };

async function renderReadinessSheet() {
  const el = document.getElementById('mainContent');
  el.innerHTML = `<div class="page-actions"><button class="btn-back" onclick="goBack()"><i class="fas fa-arrow-right"></i> رجوع</button>
     <button class="btn btn-success" onclick="rdnExportXlsx()" style="height:32px"><i class="fas fa-file-excel"></i> تحميل Excel</button>
     <button class="btn btn-primary" onclick="rdnPrint()" style="height:32px"><i class="fas fa-print"></i> طباعة</button>
  </div>
  <div class="page-title"><i class="fas fa-clipboard-check" style="color:#1565c0"></i> شيت الجاهزيه</div>
  <div id="rdnLoading" style="text-align:center;padding:40px;color:#999"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>
  <div id="rdnContent"></div>`;
  try {
    const [occasions, hospitals, reports] = await Promise.all([
      api('GET', '/readiness-occasions'),
      api('GET', '/hospitals'),
      api('GET', '/readiness-reports')
    ]);
    _rdn = { occasions, hospitals, reports, employees: [] };
    renderRdnMain();
  } catch (e) {
    document.getElementById('rdnLoading').innerHTML = `<span style="color:#dc3545"><i class="fas fa-exclamation-circle"></i> ${e.message}</span>`;
  }
}

function rdnFmtDate(d) {
  if (!d) return '';
  const parts = d.split('-');
  if (parts.length !== 3) return d;
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

function renderRdnMain() {
  const { occasions, hospitals, reports } = _rdn;
  let html = `<div style="background:#e3f2fd;border:1px solid #1565c0;border-radius:8px;padding:8px 12px;font-size:12px;color:#0d47a1;margin-bottom:10px;display:flex;align-items:center;gap:6px">
    <i class="fas fa-info-circle"></i> في حال عدم ظهور أسماء العاملين لمستشفى معين، برجاء إضافتهم أولاً في <strong>بيان العاملين</strong> من القائمة الرئيسية
  </div>
  <div class="card" style="margin-bottom:12px"><div class="card-body" style="padding:10px 14px">
    <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
      <span style="font-weight:700;font-size:13px"><i class="fas fa-calendar-alt"></i> المناسبة:</span>
      <select id="rdnOccasionSel" onchange="rdnOccasionChanged()" style="padding:4px 8px;border:1px solid #ccc;border-radius:6px;font-size:12px;min-width:180px">
        <option value="">-- جميع المناسبات --</option>
        ${occasions.map(o => `<option value="${o.id}">${o.name} ${o.date_from ? '('+rdnFmtDate(o.date_from)+'→'+rdnFmtDate(o.date_to)+')' : ''}</option>`).join('')}
      </select>
      <button class="btn btn-sm btn-info" onclick="rdnShowAddOccasion()" style="font-size:12px"><i class="fas fa-plus"></i> إضافة مناسبة</button>
      <button class="btn btn-sm btn-secondary" onclick="rdnRefresh()" style="font-size:12px"><i class="fas fa-sync"></i></button>
    </div>
  </div></div>
  <div id="rdnBody"></div>`;
  document.getElementById('rdnLoading').style.display = 'none';
  document.getElementById('rdnContent').innerHTML = html;
  if (occasions.length > 0) {
    document.getElementById('rdnOccasionSel').value = occasions[0].id;
    rdnOccasionChanged();
  }
}

async function rdnOccasionChanged() {
  const occId = parseInt(document.getElementById('rdnOccasionSel')?.value);
  const occ = occId ? _rdn.occasions.find(o => o.id === occId) : null;
  const occReports = occId ? _rdn.reports.filter(r => r.occasion_id === occId) : _rdn.reports;
  const days = occ?.day_labels || [];
  let html = '';

  // Occasion info bar
  if (occ) {
    html += `<div class="card" style="margin-bottom:10px;border-right:4px solid #1565c0;background:#e3f2fd">
      <div class="card-body" style="padding:8px 14px;font-size:12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center">
        <span style="font-weight:700">${occ.name}</span>
        ${occ.date_from ? `<span class="badge" style="background:#1565c0;color:#fff;padding:2px 8px;border-radius:8px">من ${rdnFmtDate(occ.date_from)}</span>` : ''}
        ${occ.date_to ? `<span class="badge" style="background:#1565c0;color:#fff;padding:2px 8px;border-radius:8px">إلى ${rdnFmtDate(occ.date_to)}</span>` : ''}
        ${days.map((d,i) => `<span class="badge" style="background:#fff;border:1px solid #1565c0;padding:2px 8px;border-radius:8px">اليوم ${i+1}: ${d}</span>`).join('')}
        <button class="btn btn-sm btn-warning" onclick="rdnShowEditOccasion(${occ.id})" style="font-size:11px;margin-right:auto"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-danger" onclick="rdnDeleteOccasion(${occ.id})" style="font-size:11px"><i class="fas fa-trash"></i></button>
      </div>
    </div>`;
  }

  // Governorate + Hospital selectors
  const govs = [...new Set(_rdn.hospitals.map(h => h.governorate).filter(Boolean))].sort((a,b) => a.localeCompare(b,'ar'));
  html += `<div class="card" style="margin-bottom:10px"><div class="card-body" style="padding:8px 14px">
    <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
      <span style="font-weight:700;font-size:13px"><i class="fas fa-map-marker-alt"></i> المحافظة:</span>
      <select id="rdnGovSel" onchange="rdnGovChanged()" style="padding:4px 8px;border:1px solid #ccc;border-radius:6px;font-size:12px;min-width:150px">
        <option value="">-- الكل --</option>
        ${govs.map(g => `<option value="${g}">${g}</option>`).join('')}
      </select>
      <span style="font-weight:700;font-size:13px;margin-right:8px"><i class="fas fa-hospital"></i> المستشفى:</span>
      <select id="rdnHospSel" onchange="rdnHospChanged()" style="padding:4px 8px;border:1px solid #ccc;border-radius:6px;font-size:12px;min-width:200px;flex:1">
        <option value="">-- اختر المستشفى --</option>
        ${_rdn.hospitals.sort((a,b)=>(a.governorate||'').localeCompare(b.governorate||'','ar') || a.name.localeCompare(b.name,'ar')).map(h => {
          const hasReport = occReports.some(r => r.hospital_id === h.id);
          return `<option value="${h.id}" data-gov="${h.governorate||''}" style="${hasReport?'background:#e8f5e9':''}">${h.name} ${hasReport?'✓':''}</option>`;
        }).join('')}
      </select>
      <button class="btn btn-sm btn-info" onclick="rdnAddHospitalReport()" style="font-size:12px" id="rdnAddHospBtn" disabled><i class="fas fa-plus"></i> إضافة</button>
    </div>
  </div></div>`;

  // Initial filter
  setTimeout(rdnGovChanged, 50);

  // Full print table of all saved reports
  if (occReports.length > 0) {
    const occName = occ ? occ.name : 'جميع المناسبات';
    html += `<div class="card" id="rdnSummaryTable" style="margin-bottom:10px;border:2px solid #1565c0">
      <div class="card-header" style="background:#1565c0;color:#fff;padding:8px 14px;font-weight:700;font-size:14px;text-align:center">
        <i class="fas fa-print"></i> بيان بجاهزية بنوك دم الهيئة بمناسبة ${occName} ${occ ? `من ${occ.date_from||''} إلى ${occ.date_to||''}` : ''} (${occReports.length} مستشفى)
      </div>
      <div class="card-body" style="padding:6px 8px;font-size:12px;overflow-x:auto">
        <table class="rdn-print-table" style="width:100%;border-collapse:collapse;min-width:900px" dir="rtl">
          <thead><tr style="background:#e3f2fd">
            <th style="border:1px solid #999;padding:4px 6px;text-align:center;width:70px">المحافظة</th>
            <th style="border:1px solid #999;padding:4px 6px;text-align:center;width:100px">المستشفى</th>
            <th style="border:1px solid #999;padding:4px 6px;text-align:center">القوة البشرية</th>
            <th style="border:1px solid #999;padding:4px 6px;text-align:center;width:160px">الرصيد</th>
            <th style="border:1px solid #999;padding:4px 6px;text-align:center;width:130px">مراجعة الصيانة</th>
            <th style="border:1px solid #999;padding:4px 6px;text-align:center;width:160px">الأعطال</th>
            <th style="border:1px solid #999;padding:4px 6px;text-align:center;width:160px">المستهلكات</th>
          </tr></thead>
          <tbody>${occReports.slice().sort((a,b) => (a.governorate||'').localeCompare(b.governorate||'','ar') || (a.hospital_name||'').localeCompare(b.hospital_name||'','ar')).map(r => {
            const staffData = JSON.parse(r.staff_data || '[]');
            const bd = (() => { try { return JSON.parse(r.breakdowns || '{}'); } catch { return {}; } })();
            const stockNeg = r.stock === 'غير كافي';
            const maintNeg = r.maintenance === 'لم تتم';
            const bdNeg = bd.has === 'يوجد';
            const consNeg = r.consumables === 'غير كافية';
            const dayCount = days.length || 1;
            return `<tr>
              <td style="border:1px solid #999;padding:4px 6px;vertical-align:top;text-align:center;font-size:11px">${r.governorate||''}</td>
              <td style="border:1px solid #999;padding:4px 6px;vertical-align:top;text-align:center;font-size:11px;font-weight:600"><a href="#" onclick="rdnEditReport(${r.id});return false" style="color:#1565c0;text-decoration:none">${r.hospital_name||'?'}</a></td>
              <td style="border:1px solid #999;padding:3px 4px;vertical-align:top">
                <table style="width:100%;border-collapse:collapse">
                  <thead><tr style="background:#f5f5f5">
                    <th style="border:1px solid #999;padding:1px 3px;font-size:9px">#</th>
                    <th style="border:1px solid #999;padding:1px 3px;font-size:9px">الاسم</th>
                    <th style="border:1px solid #999;padding:1px 3px;font-size:9px">التليفون</th>
                    ${days.map((d,i) => `<th style="border:1px solid #999;padding:2px 4px;font-size:9px">اليوم ${i+1}<br>${d}</th>`).join('')}
                  </tr></thead>
                  <tbody>${staffData.length ? staffData.map((s,i) => {
                    const sc = s.schedule || [];
                    return `<tr>
                      <td style="border:1px solid #999;padding:1px 3px;text-align:center;font-size:9px">${i+1}</td>
                      <td style="border:1px solid #999;padding:1px 3px;font-size:9px">${s.name}</td>
                      <td style="border:1px solid #999;padding:1px 3px;font-size:9px;direction:ltr">${s.phone}</td>
                      ${days.map((_,di) => `<td style="border:1px solid #999;padding:1px 2px;text-align:center;font-size:9px">${sc[di]||''}</td>`).join('')}
                    </tr>`;
                  }).join('') : '<tr><td colspan="'+(dayCount+3)+'" style="border:1px solid #999;padding:3px 4px;text-align:center;color:#999;font-size:9px">لم يتم إضافة موظفين بعد</td></tr>'}
                  </tbody>
                </table>
              </td>
              <td style="border:1px solid #999;padding:4px 6px;vertical-align:top">
                <div style="font-weight:600;font-size:10px;margin-bottom:2px">الحالة:</div>
                <span style="font-size:12px${stockNeg ? ';color:#d32f2f;font-weight:700' : ''}">${r.stock||'---'}</span>
                ${stockNeg ? `<div style="font-weight:600;font-size:10px;margin-top:3px">السبب:</div><span style="font-size:11px">${r.stock_reason||'---'}</span>` : ''}
                <div style="font-weight:600;font-size:10px;margin-top:3px">بيان الرصيد:</div>
                <span style="font-size:11px;word-break:break-all">${r.stock_details||'---'}</span>
              </td>
              <td style="border:1px solid #999;padding:4px 6px;vertical-align:top">
                <div style="font-weight:600;font-size:10px;margin-bottom:2px">الحالة:</div>
                <span style="font-size:12px${maintNeg ? ';color:#d32f2f;font-weight:700' : ''}">${r.maintenance||'---'}</span>
                ${maintNeg ? `<div style="font-weight:600;font-size:10px;margin-top:3px">السبب:</div><span style="font-size:11px">${r.maint_reason||'---'}</span>` : ''}
              </td>
              <td style="border:1px solid #999;padding:4px 6px;vertical-align:top">
                <span style="font-size:12px${bdNeg ? ';color:#d32f2f;font-weight:700' : ''}">${bd.has||'---'}</span>
                ${bdNeg ? `<div style="margin-top:2px"><div style="font-weight:600;font-size:10px">ذكر العطل:</div><span style="font-size:11px">${bd.desc||'---'}</span><div style="font-weight:600;font-size:10px;margin-top:2px">التأثير:</div><span style="font-size:11px">${bd.impact||'---'}</span></div>` : ''}
              </td>
              <td style="border:1px solid #999;padding:4px 6px;vertical-align:top">
                <span style="font-size:12px${consNeg ? ';color:#d32f2f;font-weight:700' : ''}">${r.consumables||'---'}</span>
                ${consNeg ? `<div style="margin-top:2px"><div style="font-weight:600;font-size:10px">مدى التأثير:</div><span style="font-size:11px">${r.cons_impact||'---'}</span><div style="font-weight:600;font-size:10px;margin-top:2px">الحذف:</div><span style="font-size:11px">${r.cons_correction||'---'}</span></div>` : ''}
              </td>
            </tr>`;
          }).join('')}</tbody>
        </table>
        <div style="font-size:10px;color:#999;text-align:center;margin-top:3px">
          إعداد وبرمجة / محمد ندا 0106888.0999
        </div>
      </div>
    </div>`;
  }

  html += '<div id="rdnReportArea"></div>';
  document.getElementById('rdnBody').innerHTML = html;
}

function rdnGovChanged() {
  const gov = document.getElementById('rdnGovSel')?.value || '';
  const opts = document.querySelectorAll('#rdnHospSel option[data-gov]');
  opts.forEach(o => {
    o.style.display = (!gov || o.getAttribute('data-gov') === gov) ? '' : 'none';
  });
  const sel = document.getElementById('rdnHospSel');
  if (gov && sel.value) {
    const opt = sel.options[sel.selectedIndex];
    if (opt && opt.getAttribute('data-gov') !== gov) { sel.value = ''; rdnHospChanged(); }
  }
}

async function rdnHospChanged() {
  const hospId = parseInt(document.getElementById('rdnHospSel')?.value);
  const occId = parseInt(document.getElementById('rdnOccasionSel')?.value);
  if (!hospId || !occId) { document.getElementById('rdnReportArea').innerHTML = ''; return; }
  const hosp = _rdn.hospitals.find(h => h.id === hospId);
  const existing = _rdn.reports.find(r => r.occasion_id === occId && r.hospital_id === hospId);
  document.getElementById('rdnAddHospBtn').disabled = !!(existing) || window._user?.role === 'branch_supervisor';

  // Load stock data from total stock management
  _rdn.currentStock = null;
  try {
    const stockRes = await api('GET', '/daily-reports?hospital_id=' + hospId);
    _rdn.currentStock = stockRes[0] || null;
  } catch (e) { _rdn.currentStock = null; }

  if (existing) {
    rdnEditReport(existing.id);
  } else {
    // Load employees for this hospital
    try {
      const empRes = await api('GET', '/employee-statements?hospital_id=' + hospId);
      _rdn.employees = empRes.rows || [];
    } catch (e) { _rdn.employees = []; }
    rdnShowForm(hosp, occId, null);
  }
}

function rdnShowForm(hosp, occId, existing) {
  const occ = _rdn.occasions.find(o => o.id === occId);
  const days = occ?.day_labels || [];
  const staffData = existing ? JSON.parse(existing.staff_data || '[]') : [];
  const html = `
    <div class="card" style="margin-bottom:10px;border-right:4px solid #1565c0">
      <div class="card-header" style="background:#e3f2fd;padding:8px 14px;font-weight:700;font-size:13px">
        <i class="fas fa-users"></i> العاملين — ${hosp.name}
      </div>
      <div class="card-body" style="padding:8px 14px">
        <table class="data-table" style="font-size:12px;white-space:nowrap;min-width:500px;margin-bottom:8px">
          <thead><tr style="background:#f5f5f5">
            <th style="width:30px">#</th>
            <th>الاسم</th>
            <th>التليفون</th>
            ${days.map((d,i) => `<th style="font-size:10px">اليوم ${i+1}<br>${d}</th>`).join('')}
            <th style="width:40px"></th>
          </tr></thead>
          <tbody id="rdnStaffBody">
            ${staffData.map((s, i) => rdnStaffRowHtml(s, i, days.length)).join('')}
            <tr id="rdnStaffAddRow">
              <td style="color:#999">${staffData.length+1}</td>
              <td><select id="rdnEmpSel" onchange="rdnEmpSelected()" style="width:100%;padding:2px 4px;font-size:11px">
                <option value="">-- اختر --</option>
                ${(_rdn.employees||[]).map(e => `<option value="${e.id}" data-phone="${e.phone||''}">${e.employee}</option>`).join('')}
              </select></td>
              <td><input id="rdnNewPhone" style="width:100%;padding:2px 4px;font-size:11px;direction:ltr" readonly></td>
              ${days.map(() => `<td class="rdn-day-cell">${rdnDayCellHtml('')}</td>`).join('')}
              <td><button class="btn btn-sm btn-success" onclick="rdnAddStaff()" style="font-size:10px;padding:2px 6px"><i class="fas fa-plus"></i></button></td>
            </tr>
          </tbody>
        </table>
        ${(!_rdn.employees || _rdn.employees.length === 0) ? `<div style="background:#fff3e0;border:1px solid #ff9800;border-radius:4px;padding:8px 12px;font-size:12px;color:#e65100;margin-bottom:8px"><i class="fas fa-exclamation-triangle"></i> لم يتم العثور على موظفين لهذا المستشفى — برجاء إضافتهم في <strong>شيت العاملين</strong> أولاً</div>` : ''}
      </div>
    </div>

    <div class="card" style="margin-bottom:10px"><div class="card-body" style="padding:10px 14px">
      <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:8px">
        <span style="font-weight:700;font-size:13px"><i class="fas fa-tint"></i> الرصيد من إجمالي المخزون</span>
        ${_rdn.currentStock ? `<span style="font-size:11px;color:#666">آخر تحديث: ${_rdn.currentStock.date||''} ${_rdn.currentStock.time||''}</span>` : '<span style="font-size:11px;color:#999">لا توجد بيانات مخزون متاحة</span>'}
      </div>
      ${_rdn.currentStock ? (() => {
        const bd = _rdn.currentStock.blood_data ? (typeof _rdn.currentStock.blood_data === 'string' ? JSON.parse(_rdn.currentStock.blood_data) : _rdn.currentStock.blood_data) : {};
        const parts = ['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => {
          const d = bd[bt] || {};
          const avail = (d.previous||0) + (d.incoming||0) - (d.outgoing||0) - (d.disposal||0);
          return `${bt}${avail}`;
        });
        return `<div style="margin-bottom:8px;padding:6px 10px;background:#f5f5f5;border-radius:4px;font-size:13px;font-weight:600;direction:ltr;text-align:center;letter-spacing:2px">${parts.join(' - ')}</div>`;
      })() : ''}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px">
        <div><label>حال الرصيد:</label>
          <select id="rdnStock" onchange="rdnToggleStockReason()" style="padding:2px 4px;border:1px solid #ccc;border-radius:4px;width:100%">
            <option value="">--</option>
            <option value="كافي" ${existing?.stock==='كافي'?'selected':''}>كافي</option>
            <option value="غير كافي" ${existing?.stock==='غير كافي'?'selected':''}>غير كافي</option>
          </select>
          <div id="rdnStockReasonRow" style="margin-top:4px;display:${existing?.stock==='غير كافي'?'block':'none'}">
            <input id="rdnStockReason" style="padding:2px 4px;border:1px solid #ccc;border-radius:4px;width:100%;box-sizing:border-box" placeholder="سبب نقص الرصيد" value="${existing?.stock_reason||''}">
          </div></div>
        <div><label>بيان الرصيد:</label>
          <input id="rdnStockDetails" style="padding:2px 4px;border:1px solid #ccc;border-radius:4px;width:100%" value="${existing?.stock_details || (_rdn.currentStock ? (()=>{const bd=_rdn.currentStock.blood_data?(typeof _rdn.currentStock.blood_data==='string'?JSON.parse(_rdn.currentStock.blood_data):_rdn.currentStock.blood_data):{};return ['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt=>{const d=bd[bt]||{};return bt+((d.previous||0)+(d.incoming||0)-(d.outgoing||0)-(d.disposal||0))}).join(' - ')})() : '')}"></div>
        <div><label>مراجعة الصيانة:</label>
          <select id="rdnMaintenance" onchange="rdnToggleMaintReason();rdnColorNeg(this)" style="padding:2px 4px;border:1px solid #ccc;border-radius:4px;width:100%">
            <option value="">--</option>
            <option value="تم" ${existing?.maintenance==='تم'?'selected':''}>تم</option>
            <option value="لم تتم" ${existing?.maintenance==='لم تتم'?'selected':''}>لم تتم</option>
          </select>
          <div id="rdnMaintReasonRow" style="margin-top:4px;display:${existing?.maintenance==='لم تتم'?'block':'none'}">
            <input id="rdnMaintReason" style="padding:2px 4px;border:1px solid #ccc;border-radius:4px;width:100%;box-sizing:border-box" placeholder="سبب عدم الصيانة" value="${existing?.maint_reason||''}">
          </div></div>
        <div><label>الأعطال:</label>
          <select id="rdnBdHas" onchange="rdnToggleBd();rdnColorNeg(this)" style="padding:2px 4px;border:1px solid #ccc;border-radius:4px;width:100%;margin-bottom:4px">
            <option value="">--</option>
            <option value="لا يوجد" ${(()=>{try{const b=JSON.parse(existing?.breakdowns||'{}');return b.has==='لا يوجد'?'selected':''}catch{return existing?.breakdowns==='لا يوجد'?'selected':''}})()}>لا يوجد</option>
            <option value="يوجد" ${(()=>{try{const b=JSON.parse(existing?.breakdowns||'{}');return b.has==='يوجد'?'selected':''}catch{return existing?.breakdowns!=='لا يوجد'&&existing?.breakdowns?'selected':''}})()}>يوجد</option>
          </select>
          <div id="rdnBdDetails" style="display:${(()=>{try{const b=JSON.parse(existing?.breakdowns||'{}');return b.has==='يوجد'?'block':'none'}catch{return existing?.breakdowns&&existing?.breakdowns!=='لا يوجد'?'block':'none'}})()}">
            <input id="rdnBdDesc" style="padding:2px 4px;border:1px solid #ccc;border-radius:4px;width:100%;margin-bottom:4px;box-sizing:border-box" placeholder="ذكر العطل" value="${(()=>{try{const b=JSON.parse(existing?.breakdowns||'{}');return b.desc||''}catch{return existing?.breakdowns||''}})()}">
            <input id="rdnBdImpact" style="padding:2px 4px;border:1px solid #ccc;border-radius:4px;width:100%;box-sizing:border-box" placeholder="تأثيره على العمل" value="${(()=>{try{const b=JSON.parse(existing?.breakdowns||'{}');return b.impact||''}catch{return ''}})()}">
          </div></div>
        <div><label>المستهلكات:</label>
          <select id="rdnConsumables" onchange="rdnToggleConsImpact();rdnColorNeg(this)" style="padding:2px 4px;border:1px solid #ccc;border-radius:4px;width:100%">
            <option value="">--</option>
            <option value="كافية" ${existing?.consumables==='كافية'?'selected':''}>كافية</option>
            <option value="غير كافية" ${existing?.consumables==='غير كافية'?'selected':''}>غير كافية</option>
          </select>
          <div id="rdnConsImpactRow" style="margin-top:4px;display:${existing?.consumables==='غير كافية'?'block':'none'}">
            <input id="rdnConsImpact" style="padding:2px 4px;border:1px solid #ccc;border-radius:4px;width:100%;margin-bottom:4px;box-sizing:border-box" placeholder="مدى التأثير" value="${existing?.cons_impact||''}">
            <input id="rdnConsCorrection" style="padding:2px 4px;border:1px solid #ccc;border-radius:4px;width:100%;box-sizing:border-box" placeholder="الحذف" value="${existing?.cons_correction||''}">
          </div></div>
      </div>
    </div></div>

    <div style="text-align:left;margin-bottom:12px;display:flex;gap:6px;justify-content:flex-end">
      ${(()=>{const __role = window._user?.role; return (__role === 'admin' || __role === 'org_supervisor' || __role === 'hospital' || __role === 'branch_supervisor') ? 
        `<button class="btn btn-success" onclick="rdnSaveReport(${occId}, ${hosp.id}, '${hosp.name.replace(/'/g,"\\'")}', '${(hosp.governorate||'').replace(/'/g,"\\'")}', ${existing?.id||'null'})" style="font-size:13px"><i class="fas fa-save"></i> حفظ</button>` 
        : ''})()}
      ${(()=>{const __role = window._user?.role; return (__role === 'admin' || __role === 'org_supervisor' || __role === 'hospital') && existing?.id ? 
        `<button class="btn btn-danger" onclick="rdnDeleteReport(${existing.id})" style="font-size:13px"><i class="fas fa-trash"></i> حذف التقرير</button>` : ''})()}
    </div>

    ${rdnRenderPrintTable(existing, hosp, occ, !!existing)}
    `;
  document.getElementById('rdnReportArea').innerHTML = html;
  // Apply role-based field permissions
  const role = window._user?.role;
  if (role) {
    // For branch_supervisor: disable all fields
    if (role === 'branch_supervisor') {
      document.querySelectorAll('#rdnReportArea input, #rdnReportArea select').forEach(el => { el.disabled = true; });
      const saveBtn = document.querySelector('#rdnReportArea button[onclick*="rdnSaveReport"]');
      if (saveBtn) saveBtn.disabled = false;
    }
  }
  // Color existing negative values in form
  document.querySelectorAll('#rdnStock,#rdnMaintenance,#rdnConsumables,#rdnBdHas').forEach(el => rdnColorNeg(el));
  // Sync form values to print table initially
  rdnSyncFormToPrintTable();
  // Add change listeners for real-time sync
  document.querySelectorAll('#rdnReportArea input, #rdnReportArea select').forEach(el => {
    el.addEventListener('change', rdnSyncFormToPrintTable);
    el.addEventListener('input', rdnSyncFormToPrintTable);
  });
  // Override toggle functions to also sync print table
  const origToggleBd = rdnToggleBd;
  rdnToggleBd = function() { origToggleBd(); rdnSyncFormToPrintTable(); };
  const origToggleMaint = rdnToggleMaintReason;
  rdnToggleMaintReason = function() { origToggleMaint(); rdnSyncFormToPrintTable(); };
  const origToggleStock = rdnToggleStockReason;
  rdnToggleStockReason = function() { origToggleStock(); rdnSyncFormToPrintTable(); };
  const origToggleCons = rdnToggleConsImpact;
  rdnToggleConsImpact = function() { origToggleCons(); rdnSyncFormToPrintTable(); };
  // Enter key → save
  const saveBtn = document.querySelector('#rdnReportArea button[onclick*="rdnSaveReport"]');
  if (saveBtn) {
    document.querySelectorAll('#rdnReportArea input:not(textarea), #rdnReportArea select').forEach(el => {
      el.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !this.disabled) { e.preventDefault(); saveBtn.click(); }
      });
    });
  }
}

function rdnColorNeg(el) {
  if (!el) return;
  const v = el.value;
  const neg = (v === 'غير كافي' || v === 'غير كافية' || v === 'لم تتم' || v === 'يوجد');
  el.style.color = neg ? '#d32f2f' : '';
  el.style.fontWeight = neg ? '700' : '';
}
function rdnRenderPrintTable(existing, hosp, occ, showActions) {
  const days = occ?.day_labels || [];
  const staffData = existing ? JSON.parse(existing.staff_data || '[]') : [];
  const bd = existing ? (() => { try { return JSON.parse(existing.breakdowns || '{}'); } catch { return {}; } })() : {};
  const reportId = existing?.id;
  const stockNeg = existing?.stock === 'غير كافي';
  const maintNeg = existing?.maintenance === 'لم تتم';
  const bdNeg = bd.has === 'يوجد';
  const consNeg = existing?.consumables === 'غير كافية';
  const hospNameSafe = (hosp.name || '').replace(/'/g, "\\'");
  return `<div class="card" id="rdnPrintTable" style="margin-bottom:10px;border:2px solid #1565c0">
  <div class="card-header" style="background:#1565c0;color:#fff;padding:8px 14px;font-weight:700;font-size:14px;text-align:center">
    <i class="fas fa-print"></i> بيان بجاهزية بنوك دم الهيئة بمناسبة ${occ.name} من ${occ.date_from||''} إلى ${occ.date_to||''}
    ${showActions && reportId ? `<span style="float:left">
      <button class="btn btn-sm btn-light" onclick="rdnEditReport(${reportId})" style="font-size:11px;padding:2px 8px;margin-right:6px"><i class="fas fa-edit"></i> تعديل</button>
      <button class="btn btn-sm btn-light" onclick="rdnDeleteReport(${reportId})" style="font-size:11px;padding:2px 8px"><i class="fas fa-trash"></i> حذف</button>
    </span>` : ''}
  </div>
  <div class="card-body" style="padding:6px 8px;font-size:12px;overflow-x:auto">
    <table class="rdn-print-table" style="width:100%;border-collapse:collapse;min-width:900px" dir="rtl">
      <thead><tr style="background:#e3f2fd">
        <th style="border:1px solid #999;padding:4px 6px;text-align:center;width:70px">المحافظة</th>
        <th style="border:1px solid #999;padding:4px 6px;text-align:center;width:100px">المستشفى</th>
        <th style="border:1px solid #999;padding:4px 6px;text-align:center">القوة البشرية</th>
        <th style="border:1px solid #999;padding:4px 6px;text-align:center;width:160px">الرصيد</th>
        <th style="border:1px solid #999;padding:4px 6px;text-align:center;width:130px">مراجعة الصيانة</th>
        <th style="border:1px solid #999;padding:4px 6px;text-align:center;width:160px">الأعطال</th>
        <th style="border:1px solid #999;padding:4px 6px;text-align:center;width:160px">المستهلكات</th>
      </tr></thead>
      <tbody><tr>
        <td style="border:1px solid #999;padding:4px 6px;vertical-align:top;text-align:center;font-size:11px">${hosp.governorate||''}</td>
        <td style="border:1px solid #999;padding:4px 6px;vertical-align:top;text-align:center;font-size:11px;font-weight:600">${hosp.name}</td>
        <td style="border:1px solid #999;padding:3px 4px;vertical-align:top">
          <table style="width:100%;border-collapse:collapse">
            <thead><tr style="background:#f5f5f5">
              <th style="border:1px solid #999;padding:1px 3px;font-size:9px">#</th>
              <th style="border:1px solid #999;padding:1px 3px;font-size:9px">الاسم</th>
              <th style="border:1px solid #999;padding:1px 3px;font-size:9px">التليفون</th>
              ${days.map((d,i) => `<th style="border:1px solid #999;padding:2px 4px;font-size:9px">اليوم ${i+1}<br>${d}</th>`).join('')}
            </tr></thead>
            <tbody id="rdnPtStaffBody">${staffData.length ? staffData.map((s,i) => {
              const sc = s.schedule || [];
              return `<tr>
                <td style="border:1px solid #999;padding:1px 3px;text-align:center;font-size:9px">${i+1}</td>
                <td style="border:1px solid #999;padding:1px 3px;font-size:9px">${s.name}</td>
                <td style="border:1px solid #999;padding:1px 3px;font-size:9px;direction:ltr">${s.phone}</td>
                ${days.map((_,di) => `<td style="border:1px solid #999;padding:1px 2px;text-align:center;font-size:9px">${sc[di]||''}</td>`).join('')}
              </tr>`;
            }).join('') : '<tr><td colspan="'+(days.length+3)+'" style="border:1px solid #999;padding:3px 4px;text-align:center;color:#999;font-size:9px">لم يتم إضافة موظفين بعد</td></tr>'}
            </tbody>
          </table>
        </td>
        <td style="border:1px solid #999;padding:4px 6px;vertical-align:top">
          <div style="font-weight:600;font-size:10px;margin-bottom:2px">الحالة:</div>
          <span id="rdnPtStockVal" style="font-size:12px${stockNeg ? ';color:#d32f2f;font-weight:700' : ''}">${existing?.stock||'---'}</span>
          <div id="rdnPtStockReasonRow" style="${stockNeg ? '' : 'display:none'};margin-top:3px">
            <div style="font-weight:600;font-size:10px">السبب:</div>
            <span id="rdnPtStockReasonVal" style="font-size:11px">${existing?.stock_reason||'---'}</span>
          </div>
          <div style="font-weight:600;font-size:10px;margin-top:3px">بيان الرصيد:</div>
          <span id="rdnPtStockDetailsVal" style="font-size:11px;word-break:break-all">${existing?.stock_details||'---'}</span>
        </td>
        <td style="border:1px solid #999;padding:4px 6px;vertical-align:top">
          <div style="font-weight:600;font-size:10px;margin-bottom:2px">الحالة:</div>
          <span id="rdnPtMaintVal" style="font-size:12px${maintNeg ? ';color:#d32f2f;font-weight:700' : ''}">${existing?.maintenance||'---'}</span>
          <div id="rdnPtMaintReasonRow" style="${maintNeg ? '' : 'display:none'};margin-top:3px">
            <div style="font-weight:600;font-size:10px">السبب:</div>
            <span id="rdnPtMaintReasonVal" style="font-size:11px">${existing?.maint_reason||'---'}</span>
          </div>
        </td>
        <td style="border:1px solid #999;padding:4px 6px;vertical-align:top">
          <span id="rdnPtBdHasVal" style="font-size:12px${bdNeg ? ';color:#d32f2f;font-weight:700' : ''}">${bd.has||'---'}</span>
          <div id="rdnPtBdDetails" style="${bdNeg ? '' : 'display:none'};margin-top:2px">
            <div style="font-weight:600;font-size:10px">ذكر العطل:</div>
            <span id="rdnPtBdDescVal" style="font-size:11px">${bd.desc||'---'}</span>
            <div style="font-weight:600;font-size:10px;margin-top:2px">التأثير:</div>
            <span id="rdnPtBdImpactVal" style="font-size:11px">${bd.impact||'---'}</span>
          </div>
        </td>
        <td style="border:1px solid #999;padding:4px 6px;vertical-align:top">
          <span id="rdnPtConsVal" style="font-size:12px${consNeg ? ';color:#d32f2f;font-weight:700' : ''}">${existing?.consumables||'---'}</span>
          <div id="rdnPtConsImpactRow" style="${consNeg ? '' : 'display:none'};margin-top:2px">
            <div style="font-weight:600;font-size:10px">مدى التأثير:</div>
            <span id="rdnPtConsImpactVal" style="font-size:11px">${existing?.cons_impact||'---'}</span>
            <div style="font-weight:600;font-size:10px;margin-top:2px">الحذف:</div>
            <span id="rdnPtConsCorrectionVal" style="font-size:11px">${existing?.cons_correction||'---'}</span>
          </div>
        </td>
      </tr></tbody>
    </table>
    <div style="font-size:10px;color:#999;text-align:center;margin-top:3px">
      إعداد وبرمجة / محمد ندا 0106888.0999
    </div>
  </div></div>`;
}

function rdnSyncFormToPrintTable() {
  // Sync field values from form to print table display spans
  const pairs = [
    ['rdnStock', 'rdnPtStockVal'],
    ['rdnStockReason', 'rdnPtStockReasonVal'],
    ['rdnStockDetails', 'rdnPtStockDetailsVal'],
    ['rdnMaintenance', 'rdnPtMaintVal'],
    ['rdnMaintReason', 'rdnPtMaintReasonVal'],
    ['rdnBdHas', 'rdnPtBdHasVal'],
    ['rdnBdDesc', 'rdnPtBdDescVal'],
    ['rdnBdImpact', 'rdnPtBdImpactVal'],
    ['rdnConsumables', 'rdnPtConsVal'],
    ['rdnConsImpact', 'rdnPtConsImpactVal'],
    ['rdnConsCorrection', 'rdnPtConsCorrectionVal']
  ];
  pairs.forEach(([fid, pid]) => {
    const f = document.getElementById(fid);
    const p = document.getElementById(pid);
    if (f && p) p.textContent = f.value || '---';
  });
  // Toggle visibility of sub-rows
  const ptStockRow = document.getElementById('rdnPtStockReasonRow');
  if (ptStockRow) ptStockRow.style.display = (document.getElementById('rdnStock')?.value === 'غير كافي') ? '' : 'none';
  const ptMaintRow = document.getElementById('rdnPtMaintReasonRow');
  if (ptMaintRow) ptMaintRow.style.display = (document.getElementById('rdnMaintenance')?.value === 'لم تتم') ? '' : 'none';
  const ptBdRow = document.getElementById('rdnPtBdDetails');
  if (ptBdRow) ptBdRow.style.display = (document.getElementById('rdnBdHas')?.value === 'يوجد') ? '' : 'none';
  const ptConsRow = document.getElementById('rdnPtConsImpactRow');
  if (ptConsRow) ptConsRow.style.display = (document.getElementById('rdnConsumables')?.value === 'غير كافية') ? '' : 'none';
  // Sync staff table
  rdnSyncPtStaff();
}

function rdnSyncPtStaff() {
  const ptBody = document.getElementById('rdnPtStaffBody');
  if (!ptBody) return;
  const formRows = document.querySelectorAll('#rdnStaffBody tr:not(#rdnStaffAddRow)');
  const occId = parseInt(document.getElementById('rdnOccasionSel')?.value);
  const occ = occId ? _rdn.occasions.find(o => o.id === occId) : null;
  const days = occ?.day_labels || [];
  if (formRows.length) {
    ptBody.innerHTML = Array.from(formRows).map((tr, i) => {
      const inputs = tr.querySelectorAll('input');
      const name = inputs[0]?.value || '';
      const phone = inputs[1]?.value || '';
      const dayCells = tr.querySelectorAll('td.rdn-day-cell');
      const schedule = Array.from(dayCells).map(td => {
        const el = td.querySelector('input, select');
        return el ? el.value : '';
      });
      return `<tr>
        <td style="border:1px solid #999;padding:1px 3px;text-align:center;font-size:9px">${i+1}</td>
        <td style="border:1px solid #999;padding:1px 3px;font-size:9px">${name}</td>
        <td style="border:1px solid #999;padding:1px 3px;font-size:9px;direction:ltr">${phone}</td>
        ${days.map((_,di) => `<td style="border:1px solid #999;padding:1px 2px;text-align:center;font-size:9px">${schedule[di]||''}</td>`).join('')}
      </tr>`;
    }).join('');
  } else {
    ptBody.innerHTML = '<tr><td colspan="'+(days.length+3)+'" style="border:1px solid #999;padding:3px 4px;text-align:center;color:#999;font-size:9px">لم يتم إضافة موظفين بعد</td></tr>';
  }
}

async function rdnDeleteReport(reportId) {
  if (!confirm('هل أنت متأكد من حذف هذا التقرير؟')) return;
  try {
    await api('DELETE', '/readiness-reports/' + reportId);
    showToast('✅ تم حذف التقرير');
    rdnRefresh();
  } catch (e) { showToast('❌ ' + e.message); }
}

function rdnToggleBd() {
  const has = document.getElementById('rdnBdHas')?.value;
  const details = document.getElementById('rdnBdDetails');
  if (details) details.style.display = has === 'يوجد' ? 'block' : 'none';
}
function rdnToggleMaintReason() {
  const el = document.getElementById('rdnMaintenance');
  const row = document.getElementById('rdnMaintReasonRow');
  if (row) row.style.display = el?.value === 'لم تتم' ? 'block' : 'none';
}

function rdnToggleStockReason() {
  const el = document.getElementById('rdnStock');
  const row = document.getElementById('rdnStockReasonRow');
  if (row) row.style.display = el?.value === 'غير كافي' ? 'block' : 'none';
}

function rdnToggleConsImpact() {
  const el = document.getElementById('rdnConsumables');
  const row = document.getElementById('rdnConsImpactRow');
  if (row) row.style.display = el?.value === 'غير كافية' ? 'block' : 'none';
}

const RDN_SHIFT_OPTS = ['12A','12P','24 AP','AB','6L 12P'];

function rdnDayCellHtml(value) {
  const matched = RDN_SHIFT_OPTS.includes(value);
  if (value && !matched) {
    return `<input style="width:55px;padding:2px;font-size:11px;text-align:center" value="${value}" onchange="rdnDayInputChanged(this)" placeholder="أخرى">`;
  }
  return `<select style="width:60px;padding:2px;font-size:11px" onchange="rdnDaySelChanged(this)">
    <option value="">--</option>
    ${RDN_SHIFT_OPTS.map(o => `<option value="${o}" ${value===o?'selected':''}>${o}</option>`).join('')}
    <option value="__other__">أخرى</option>
  </select>`;
}

function rdnDaySelChanged(sel) {
  if (sel.value === '__other__') {
    const td = sel.parentNode;
    const inp = document.createElement('input');
    inp.style.cssText = 'width:55px;padding:2px;font-size:11px;text-align:center';
    inp.placeholder = 'أخرى';
    inp.onchange = function() { rdnDayInputChanged(this); };
    td.innerHTML = '';
    td.appendChild(inp);
    inp.focus();
  }
  rdnSyncPtStaff();
}

function rdnDayInputChanged(inp) {
  // Value is stored in the DOM - no extra action needed
}

function rdnStaffRowHtml(s, i, dayCount) {
  const schedule = s.schedule || [];
  return `<tr id="rdnStaffRow${i}">
    <td style="color:#999">${i+1}</td>
    <td><input style="width:120px;padding:2px 4px;font-size:11px" value="${s.name}" onchange="rdnUpdateStaff(${i},'name',this.value)"></td>
    <td><input style="width:100px;padding:2px 4px;font-size:11px;direction:ltr" value="${s.phone}" onchange="rdnUpdateStaff(${i},'phone',this.value)"></td>
    ${Array.from({length: dayCount}, (_, di) => `<td class="rdn-day-cell">${rdnDayCellHtml(schedule[di]||'')}</td>`).join('')}
    <td><button class="btn btn-sm btn-danger" onclick="rdnRemoveStaff(${i})" style="font-size:10px;padding:2px 6px"><i class="fas fa-times"></i></button></td>
  </tr>`;
}

let _rdnStaff = [];

function rdnEmpSelected() {
  const sel = document.getElementById('rdnEmpSel');
  const opt = sel?.selectedOptions?.[0];
  if (opt) document.getElementById('rdnNewPhone').value = opt.dataset.phone || '';
}

function rdnAddStaff() {
  const sel = document.getElementById('rdnEmpSel');
  const opt = sel?.selectedOptions?.[0];
  if (!opt || !opt.value) return;
  const name = opt.text;
  const phone = opt.dataset.phone || document.getElementById('rdnNewPhone').value;
  const days = _rdn.occasions.find(o => o.id === parseInt(document.getElementById('rdnOccasionSel')?.value))?.day_labels || [];
  const dayCells = document.querySelectorAll('#rdnStaffAddRow td.rdn-day-cell');
  const schedule = Array.from(dayCells).map(td => {
    const el = td.querySelector('input, select');
    return el ? el.value : '';
  });
  // Add row
  const staffRows = document.getElementById('rdnStaffBody');
  const idx = staffRows.children.length - 1; // minus the add row
  const tr = document.createElement('tr');
  tr.innerHTML = rdnStaffRowHtml({name, phone, schedule}, idx, days.length);
  staffRows.insertBefore(tr, staffRows.lastElementChild);
  // Reset add row
  sel.value = '';
  document.getElementById('rdnNewPhone').value = '';
  dayCells.forEach(td => {
    const el = td.querySelector('input, select');
    if (el) el.value = '';
  });
  // Update indices
  rdnRenumberStaff();
}

function rdnRemoveStaff(idx) {
  const row = document.getElementById('rdnStaffRow' + idx);
  if (row) row.remove();
  rdnRenumberStaff();
}

async function rdnDismissNotif(notifId, el) {
  try {
    await api('PUT', '/readiness-notifications/' + notifId + '/dismiss');
    const wrapper = el.closest('div') || el.closest('span');
    if (wrapper) wrapper.style.display = 'none';
  } catch (e) { showToast('❌ فشل إخفاء التنبيه'); }
}

function rdnRenumberStaff() {
  const tbody = document.getElementById('rdnStaffBody');
  if (!tbody) return;
  const rows = tbody.querySelectorAll('tr:not(#rdnStaffAddRow)');
  rows.forEach((tr, i) => {
    const td = tr.querySelector('td:first-child');
    if (td) td.textContent = i + 1;
    tr.id = 'rdnStaffRow' + i;
  });
  rdnSyncPtStaff();
}

function rdnUpdateStaff(idx, field, val) {
  // handled by onchange on input
}

async function rdnSaveReport(occId, hospId, hospName, governorate, existingId) {
  try {
    // Branch supervisor can only edit existing reports, not create new ones
    if (window._user?.role === 'branch_supervisor' && !existingId) {
      showToast('❌ ليس لديك صلاحية إنشاء تقرير جديد');
      return;
    }
    // Validate: require at least some data
    const stock = document.getElementById('rdnStock')?.value || '';
    const maintenance = document.getElementById('rdnMaintenance')?.value || '';
    const bdHas = document.getElementById('rdnBdHas')?.value || '';
    const consumables = document.getElementById('rdnConsumables')?.value || '';
    const staffBody = document.getElementById('rdnStaffBody');
    const hasStaff = staffBody?.querySelectorAll('tr:not(#rdnStaffAddRow) input:first-child').length > 0;
    if (!stock && !maintenance && !bdHas && !consumables && !hasStaff) {
      showToast('❌ لم يتم إدخال أي بيانات بعد');
      return;
    }
    // Collect staff
    const tbody = document.getElementById('rdnStaffBody');
    const rows = tbody?.querySelectorAll('tr:not(#rdnStaffAddRow)') || [];
    const staffData = [];
    rows.forEach(tr => {
      const inputs = tr.querySelectorAll('input');
      if (inputs.length < 2) return;
      const name = inputs[0]?.value?.trim();
      if (!name) return;
      const phone = inputs[1]?.value?.trim() || '';
      const dayCells = tr.querySelectorAll('td.rdn-day-cell');
      const schedule = Array.from(dayCells).map(td => {
        const el = td.querySelector('input, select');
        return el ? el.value : '';
      });
      staffData.push({ name, phone, schedule });
    });
    const body = {
      occasion_id: occId,
      hospital_id: hospId,
      hospital_name: hospName,
      governorate,
      staff_data: JSON.stringify(staffData),
      stock,
      stock_details: document.getElementById('rdnStockDetails')?.value || '',
      stock_reason: document.getElementById('rdnStockReason')?.value || '',
      maintenance,
      maint_reason: document.getElementById('rdnMaintReason')?.value || '',
      breakdowns: JSON.stringify({
        has: bdHas,
        desc: document.getElementById('rdnBdDesc')?.value || '',
        impact: document.getElementById('rdnBdImpact')?.value || ''
      }),
      consumables,
      cons_impact: document.getElementById('rdnConsImpact')?.value || '',
      cons_correction: document.getElementById('rdnConsCorrection')?.value || ''
    };
    let saved;
    if (existingId) {
      saved = await api('PUT', '/readiness-reports/' + existingId, body);
      showToast('✅ تم تحديث البيانات');
    } else {
      saved = await api('POST', '/readiness-reports', body);
      showToast('✅ تم حفظ البيانات');
    }
    // Construct saved report object
    const rep = saved?.report || { id: existingId || Date.now(), occasion_id: occId, hospital_id: hospId, hospital_name: hospName, governorate, staff_data: JSON.stringify(staffData), stock: body.stock, stock_details: body.stock_details, stock_reason: body.stock_reason, maintenance: body.maintenance, maint_reason: body.maint_reason, breakdowns: body.breakdowns, consumables: body.consumables, cons_impact: body.cons_impact, cons_correction: body.cons_correction };
    if (existingId) {
      const idx = _rdn.reports.findIndex(r => r.id === existingId);
      if (idx >= 0) _rdn.reports[idx] = { ..._rdn.reports[idx], ...rep };
    } else {
      _rdn.reports.push(rep);
    }
    // Rebuild print table with saved data
    const occ = _rdn.occasions.find(o => o.id === occId);
    const hosp = _rdn.hospitals.find(h => h.id === hospId);
    const ptHtml = rdnRenderPrintTable(rep, hosp || { name: hospName, governorate }, occ, true);
    const oldPt = document.getElementById('rdnPrintTable');
    if (oldPt) oldPt.outerHTML = ptHtml;
    // Remove all cards in the report area (keep print table)
    const formCards = document.querySelectorAll('#rdnReportArea .card');
    formCards.forEach(c => { if (c.id !== 'rdnPrintTable') c.style.display = 'none'; });
    // Add success banner
    const newPt = document.getElementById('rdnPrintTable');
    if (newPt) {
      const banner = document.createElement('div');
      banner.id = 'rdnSavedBanner';
      banner.style.cssText = 'background:#e8f5e9;border:2px solid #2e7d32;border-radius:8px;padding:10px 14px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between';
      banner.innerHTML = `<span style="color:#2e7d32;font-weight:700"><i class="fas fa-check-circle"></i> تم حفظ تقرير ${hospName}</span>
        <button class="btn btn-sm btn-outline-primary" onclick="rdnBackToSummary()"><i class="fas fa-arrow-right"></i> رجوع</button>`;
      newPt.parentNode.insertBefore(banner, newPt);
    }
    // Hide save/delete buttons
    const btnDiv = document.querySelector('#rdnReportArea > div[style*="text-align"]');
    if (btnDiv) btnDiv.style.display = 'none';
    // Scroll to print table
    if (newPt) newPt.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) {
    showToast('❌ ' + e.message);
  }
}

function rdnBackToSummary() {
  rdnRefresh();
}

async function rdnAddHospitalReport() {
  const hospId = parseInt(document.getElementById('rdnHospSel')?.value);
  const occId = parseInt(document.getElementById('rdnOccasionSel')?.value);
  const hosp = _rdn.hospitals.find(h => h.id === hospId);
  if (!hosp || !occId) return;
  _rdn.currentStock = null;
  try {
    const [empRes, stockRes] = await Promise.all([
      api('GET', '/employee-statements?hospital_id=' + hospId),
      api('GET', '/daily-reports?hospital_id=' + hospId)
    ]);
    _rdn.employees = empRes.rows || [];
    _rdn.currentStock = stockRes[0] || null;
  } catch (e) { _rdn.employees = []; }
  document.getElementById('rdnAddHospBtn').disabled = true;
  rdnShowForm(hosp, occId, null);
}

async function rdnEditReport(reportId) {
  const existing = _rdn.reports.find(r => r.id === reportId);
  if (!existing) return;
  const hosp = _rdn.hospitals.find(h => h.id === existing.hospital_id);
  if (!hosp) return;
  _rdn.currentStock = null;
  try {
    const [empRes, stockRes] = await Promise.all([
      api('GET', '/employee-statements?hospital_id=' + existing.hospital_id),
      api('GET', '/daily-reports?hospital_id=' + existing.hospital_id)
    ]);
    _rdn.employees = empRes.rows || [];
    _rdn.currentStock = stockRes[0] || null;
  } catch (e) { _rdn.employees = []; }
  rdnShowForm(hosp, existing.occasion_id, existing);
  // Scroll to form
  setTimeout(() => {
    const area = document.getElementById('rdnReportArea');
    if (area) area.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 300);
}

// === Occasion modals ===
function rdnShowAddOccasion() {
  openModal('إضافة مناسبة جديدة',
    `<div style="display:grid;gap:8px;max-width:400px">
      <label style="font-size:12px;color:#666">اسم المناسبة</label>
      <input id="rdnOccName" class="modal-input" style="width:100%" placeholder="مثال: عيد الأضحى 2026">
      <label style="font-size:12px;color:#666">من تاريخ</label>
      <input id="rdnOccFrom" class="modal-input" style="width:100%" type="date" onchange="rdnAutoGenDays()">
      <label style="font-size:12px;color:#666">إلى تاريخ</label>
      <input id="rdnOccTo" class="modal-input" style="width:100%" type="date" onchange="rdnAutoGenDays()">
      <label style="font-size:12px;color:#666">أيام الإجازة (بواصلة)</label>
      <input id="rdnOccDays" class="modal-input" style="width:100%" placeholder="مثال: الثلاثاء 30-06, الاربعاء 01-07">
      <div style="font-size:11px;color:#999">يتم تعبئة الأيام تلقائياً عند اختيار التاريخ</div>
    </div>`,
    `<button class="btn btn-primary" onclick="rdnDoAddOccasion()"><i class="fas fa-save"></i> حفظ</button>`);
}

async function rdnDoAddOccasion() {
  const name = document.getElementById('rdnOccName')?.value?.trim();
  if (!name) { showToast('❌ اسم المناسبة مطلوب'); return; }
  const date_from = document.getElementById('rdnOccFrom')?.value || '';
  const date_to = document.getElementById('rdnOccTo')?.value || '';
  const daysStr = document.getElementById('rdnOccDays')?.value || '';
  const day_labels = daysStr.split(',').map(s => s.trim()).filter(Boolean);
  try {
    await api('POST', '/readiness-occasions', { name, date_from, date_to, day_labels });
    closeModal();
    showToast('✅ تم إضافة المناسبة');
    rdnRefresh();
  } catch (e) { showToast('❌ ' + e.message); }
}

const RDN_ARABIC_DAYS = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
function rdnAutoGenDays() {
  const from = document.getElementById('rdnOccFrom')?.value;
  const to = document.getElementById('rdnOccTo')?.value;
  if (!from || !to) return;
  const d1 = new Date(from + 'T00:00:00');
  const d2 = new Date(to + 'T00:00:00');
  if (d1 > d2) return;
  const labels = [];
  const cur = new Date(d1);
  while (cur <= d2) {
    const dayName = RDN_ARABIC_DAYS[cur.getDay()];
    const dd = String(cur.getDate()).padStart(2, '0');
    const mm = String(cur.getMonth() + 1).padStart(2, '0');
    labels.push(dayName + ' ' + dd + '-' + mm);
    cur.setDate(cur.getDate() + 1);
  }
  document.getElementById('rdnOccDays').value = labels.join(', ');
}

function rdnShowEditOccasion(id) {
  const occ = _rdn.occasions.find(o => o.id === id);
  if (!occ) return;
  openModal('تعديل المناسبة',
    `<div style="display:grid;gap:8px;max-width:400px">
      <label style="font-size:12px;color:#666">اسم المناسبة</label>
      <input id="rdnOccName" class="modal-input" style="width:100%" value="${occ.name}">
      <label style="font-size:12px;color:#666">من تاريخ</label>
      <input id="rdnOccFrom" class="modal-input" style="width:100%" type="date" value="${occ.date_from||''}" onchange="rdnAutoGenDays()">
      <label style="font-size:12px;color:#666">إلى تاريخ</label>
      <input id="rdnOccTo" class="modal-input" style="width:100%" type="date" value="${occ.date_to||''}" onchange="rdnAutoGenDays()">
      <label style="font-size:12px;color:#666">أيام الإجازة (بواصلة)</label>
      <input id="rdnOccDays" class="modal-input" style="width:100%" value="${(occ.day_labels||[]).join(', ')}">
      <div style="font-size:11px;color:#999">يتم تعبئة الأيام تلقائياً عند تغيير التاريخ</div>
    </div>`,
    `<button class="btn btn-primary" onclick="rdnDoEditOccasion(${id})"><i class="fas fa-save"></i> حفظ</button>`);
}

async function rdnDoEditOccasion(id) {
  const name = document.getElementById('rdnOccName')?.value?.trim();
  if (!name) { showToast('❌ اسم المناسبة مطلوب'); return; }
  const date_from = document.getElementById('rdnOccFrom')?.value || '';
  const date_to = document.getElementById('rdnOccTo')?.value || '';
  const daysStr = document.getElementById('rdnOccDays')?.value || '';
  const day_labels = daysStr.split(',').map(s => s.trim()).filter(Boolean);
  try {
    await api('PUT', '/readiness-occasions/' + id, { name, date_from, date_to, day_labels });
    closeModal();
    showToast('✅ تم تعديل المناسبة');
    rdnRefresh();
  } catch (e) { showToast('❌ ' + e.message); }
}

async function rdnDeleteOccasion(id) {
  if (!confirm('هل أنت متأكد من حذف المناسبة وجميع تقاريرها؟')) return;
  try {
    await api('DELETE', '/readiness-occasions/' + id);
    showToast('✅ تم الحذف');
    rdnRefresh();
  } catch (e) { showToast('❌ ' + e.message); }
}

async function rdnRefresh() {
  try {
    const [occasions, reports] = await Promise.all([
      api('GET', '/readiness-occasions'),
      api('GET', '/readiness-reports')
    ]);
    _rdn.occasions = occasions;
    _rdn.reports = reports;
    renderRdnMain();
  } catch (e) { showToast('❌ ' + e.message); }
}

// === Print & Export ===
function rdnPrint() {
  const content = document.getElementById('rdnContent')?.innerHTML;
  if (!content) return;
  const tmp = document.createElement('div');
  tmp.innerHTML = content;
  // Prefer summary table (all hospitals), fall back to individual print table
  let printSource = tmp.querySelector('#rdnSummaryTable') || tmp.querySelector('#rdnPrintTable');
  if (!printSource) { showToast('❌ لا توجد بيانات للطباعة'); return; }
  const printContent = printSource.outerHTML;
  const w = window.open('', '', 'width=1200,height=800');
  w.document.write('<html dir="rtl"><head><meta charset="utf-8"><title>شيت الجاهزيه</title>');
  w.document.write('<style>'+
    '@media print{body{font-size:12px;padding:30px 40px}} '+
    '.page-actions,.btn,.btn-back,.btn-info,.btn-success,.btn-warning,.btn-danger,.btn-secondary,#rdnAddHospBtn,.rdn-export-bar{display:none!important} '+
    '.card{border:1px solid #999;margin-bottom:10px;border-radius:6px} '+
    '.rdn-print-table{border-collapse:collapse;width:100%;font-family:"Traditional Arabic",Arial,sans-serif} '+
    '.rdn-print-table td,.rdn-print-table th{border:1px solid #666;padding:6px 8px;text-align:right;font-size:12px} '+
    '.rdn-print-table th{background:#e3f2fd!important;font-weight:700;text-align:center;-webkit-print-color-adjust:exact;print-color-adjust:exact} '+
    '#rdnPrintTable input,#rdnPrintTable select{background:transparent!important;border:none!important;font-size:12px!important;color:#000!important;-webkit-appearance:none;-moz-appearance:none;appearance:none} '+
    '.card-header{background:#1565c0!important;color:#fff!important;padding:10px 16px;font-weight:700;font-size:15px;text-align:center;-webkit-print-color-adjust:exact;print-color-adjust:exact} '+
    '.rdn-footer{text-align:center;margin-top:12px;padding-top:8px;border-top:2px solid #1565c0;font-size:11px;color:#555;font-family:"Traditional Arabic",Arial,sans-serif} '+
    '.badge{display:inline-block;padding:2px 8px;border-radius:8px;font-size:10px}</style>');
  w.document.write('</head><body>' + printContent + 
    '<div class="rdn-footer">إعداد وبرمجة / محمد ندا 0106888.0999</div>' +
    '</body></html>');
  w.document.close();
  setTimeout(() => { w.print(); w.close(); }, 500);
}

function rdnExportXlsx() {
  showToast('⏳ جاري تحضير ملف Excel...');
  fetch('/api/readiness-export/xlsx', { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') } })
    .then(r => {
      if (!r.ok) return r.json().then(e => { throw new Error(e.error || 'فشل التحميل'); });
      return r.blob();
    })
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'شيت_الجاهزيه.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('✅ تم تحميل ملف Excel');
    })
    .catch(e => showToast('❌ ' + e.message));
}

// === Sync Dialog (Drive) ===
async function showSyncDialog() {
  const cont = document.getElementById('mainContent');
  cont.innerHTML = '<div class="section-card"><div class="card-body" style="padding:20px"><div id="syncContent"><div style="text-align:center;padding:40px"><i class="fas fa-spinner fa-spin fa-3x"></i><p style="margin-top:12px">جاري تحميل حالة المزامنة...</p></div></div></div></div>';
  try {
    const st = await api('GET', '/sync/status');
    const html = `
      <h3 style="margin-bottom:16px"><i class="fas fa-cloud-upload-alt"></i> مزامنة مع Google Drive</h3>
      <div style="background:#f8f9fa;padding:16px;border-radius:8px;margin-bottom:16px">
        <table style="width:100%;font-size:14px">
          <tr><td style="padding:4px 8px;color:#666">الجهاز</td><td style="padding:4px 8px">${sanitize(st.device)}</td></tr>
          <tr><td style="padding:4px 8px;color:#666">المستشفيات</td><td style="padding:4px 8px">${st.hospitals}</td></tr>
          <tr><td style="padding:4px 8px;color:#666">التقارير</td><td style="padding:4px 8px">${st.reports}</td></tr>
          <tr><td style="padding:4px 8px;color:#666">المستخدمين</td><td style="padding:4px 8px">${st.users}</td></tr>
          <tr><td style="padding:4px 8px;color:#666">حجم البيانات</td><td style="padding:4px 8px">${(st.dataSize / 1024).toFixed(1)} KB</td></tr>
          <tr><td style="padding:4px 8px;color:#666">آخر تعديل</td><td style="padding:4px 8px">${new Date(st.lastModified).toLocaleString('ar-EG')}</td></tr>
        </table>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="syncExport()"><i class="fas fa-download"></i> تصدير البيانات (JSON)</button>
        <button class="btn btn-secondary" onclick="document.getElementById('syncImportInput').click()"><i class="fas fa-upload"></i> استيراد بيانات</button>
        <input type="file" id="syncImportInput" accept=".json" style="display:none" onchange="syncImport(event)">
      </div>
      <div id="syncResult" style="margin-top:12px"></div>
    `;
    document.getElementById('syncContent').innerHTML = html;
  } catch (e) {
    document.getElementById('syncContent').innerHTML = `<div class="alert alert-error">❌ ${sanitize(e.message)}</div>`;
  }
}

async function syncExport() {
  showToast('⏳ جاري تصدير البيانات...');
  try {
    const res = await fetch('/api/sync/export', { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') } });
    if (!res.ok) throw new Error('فشل التصدير');
    const j = await res.json();
    const blob = new Blob([JSON.stringify(j.data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'db_backup_' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('✅ تم تصدير البيانات');
  } catch (e) {
    showToast('❌ ' + e.message);
  }
}

async function syncImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  showToast('⏳ جاري استيراد البيانات...');
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    const res = await fetch('/api/sync/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') },
      body: JSON.stringify({ data })
    });
    if (!res.ok) throw new Error('فشل الاستيراد');
    document.getElementById('syncResult').innerHTML = '<div class="alert alert-success">✅ تم استيراد البيانات بنجاح</div>';
    showToast('✅ تم استيراد البيانات');
  } catch (e) {
    document.getElementById('syncResult').innerHTML = '<div class="alert alert-error">❌ ' + sanitize(e.message) + '</div>';
  }
  event.target.value = '';
}

// === Blood Bank Equipment ===
async function renderBloodBankEquipment() {
  const main = document.getElementById('mainContent');
  main.innerHTML = `<div class="page-header"><h2><i class="fas fa-microscope"></i> أجهزة بنوك الدم</h2></div>
    <div id="eqToolbar" style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px;padding:8px 12px;background:var(--card-bg);border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1)"></div>
    <div id="eqStats" style="display:flex;gap:12px;margin-bottom:12px;flex-wrap:wrap"></div>
    <div id="eqContent" class="loading" style="text-align:center;padding:40px;color:#999">جاري التحميل...</div>`;
  try {
    const data = await api('GET', '/blood-bank-equipment');
    if (!data || !data.hospitals || !data.hospitals.length) {
      document.getElementById('eqContent').innerHTML = '<div class="alert alert-info">لا توجد بيانات أجهزة — قم باستيراد ملف Excel</div>';
      return;
    }
    const { types, hospitals } = data;
    types.sort((a,b) => a.id - b.id);
    // Compute stats
    const total = hospitals.length;
    const eqCounts = {};
    types.forEach(t => { eqCounts[t.id] = { ok: 0, bad: 0, total: 0 }; });
    hospitals.forEach(h => {
      if (!h.equipment) return;
      Object.entries(h.equipment).forEach(([tid, eq]) => {
        if (eq.status && eq.status !== 'غير كفئ' && eq.status !== 'غير' && eq.status !== 0) eqCounts[tid].ok++;
        else if (eq.status) eqCounts[tid].bad++;
        eqCounts[tid].total++;
      });
    });
    // Stats cards
    const allOk = Object.values(eqCounts).reduce((s, c) => s + c.ok, 0);
    const allBad = Object.values(eqCounts).reduce((s, c) => s + c.bad, 0);
    const allTotal = Object.values(eqCounts).reduce((s, c) => s + c.total, 0);
    const statsHtml = [
      { label: 'بنوك الدم', value: total, icon: 'fa-hospital', color: '#17a2b8' },
      { label: 'أجهزة "كفء"', value: allOk, icon: 'fa-check-circle', color: '#27ae60' },
      { label: 'أجهزة "غير كفء"', value: allBad, icon: 'fa-exclamation-triangle', color: '#e74c3c' },
      { label: 'إجمالي الأجهزة', value: allTotal, icon: 'fa-microscope', color: '#6c757d' },
    ].map(s => `<div style="flex:1;min-width:120px;padding:10px 12px;background:var(--card-bg);border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1);text-align:center;border-right:3px solid ${s.color}">
      <div style="font-size:11px;color:#888;margin-bottom:2px"><i class="fas ${s.icon}" style="color:${s.color}"></i> ${s.label}</div>
      <div style="font-size:20px;font-weight:bold;color:${s.color}">${s.value}</div>
    </div>`).join('');
    document.getElementById('eqStats').innerHTML = statsHtml;
    // Toolbar
    const govs = [...new Set(hospitals.map(h => h.governorate).filter(Boolean))];
    const toolbarHtml = [
      `<span style="font-size:13px;color:var(--text-color)"><i class="fas fa-microscope" style="color:#795548"></i> <strong>أجهزة بنوك الدم</strong></span>`,
      `<select id="eqGovFilter" onchange="renderEqTable()" style="padding:5px 8px;border:1px solid #ddd;border-radius:4px;font-size:12px">
        <option value="">كل المحافظات</option>${govs.map(g => `<option value="${g}">${g}</option>`).join('')}</select>`,
      `<input id="eqSearch" placeholder="بحث..." oninput="renderEqTable()" style="padding:5px 8px;border:1px solid #ddd;border-radius:4px;font-size:12px;min-width:150px">`,
      `<span id="eqResultCount" style="font-size:12px;color:#888"></span>`,
    ].join(' | ');
    document.getElementById('eqToolbar').innerHTML = toolbarHtml;
    // Type filter chips
    let chipHtml = '<div style="margin-bottom:8px;display:flex;flex-wrap:wrap;gap:4px">';
    types.forEach(t => {
      const c = eqCounts[t.id];
      const pct = c.total ? Math.round(c.ok / c.total * 100) : 0;
      chipHtml += `<span class="eq-type-chip" data-id="${t.id}" onclick="toggleEqType(${t.id})" style="cursor:pointer;padding:3px 8px;border-radius:12px;font-size:11px;background:${pct >= 80 ? '#e8f8e8' : pct >= 50 ? '#fff8e1' : '#fde8e8'};color:${pct >= 80 ? '#27ae60' : pct >= 50 ? '#f39c12' : '#e74c3c'};border:1px solid ${pct >= 80 ? '#a3d9a5' : pct >= 50 ? '#f0d58c' : '#f5a3a3'}">
        ${t.name} <small>(${c.ok}/${c.total})</small>
      </span>`;
    });
    chipHtml += '</div>';
    document.getElementById('eqToolbar').insertAdjacentHTML('afterend', chipHtml);
    window._eqData = { types, hospitals, eqCounts, typeFilter: new Set(types.map(t => t.id)) };
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
  });
  renderEqTable();
}

function renderEqTable() {
  const { types, hospitals, eqCounts, typeFilter } = window._eqData || {};
  if (!hospitals) return;
  const gov = document.getElementById('eqGovFilter')?.value || '';
  const q = (document.getElementById('eqSearch')?.value || '').trim().toLowerCase();
  let filtered = hospitals;
  if (gov) filtered = filtered.filter(h => h.governorate === gov);
  if (q) filtered = filtered.filter(h => h.name.toLowerCase().includes(q) || (h.governorate || '').toLowerCase().includes(q));
  document.getElementById('eqResultCount').textContent = filtered.length + '/' + hospitals.length;
  const visibleTypes = types.filter(t => typeFilter.has(t.id));
  let html = '<div style="overflow-x:auto;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1)">';
  html += '<table style="border-collapse:collapse;width:100%;font-size:12px;min-width:' + (visibleTypes.length * 90 + 300) + 'px">';
  html += '<thead><tr style="background:var(--card-bg);position:sticky;top:0;z-index:2">';
  html += '<th style="padding:8px 6px;border:1px solid var(--border);text-align:center;min-width:110px">المحافظة</th>';
  html += '<th style="padding:8px 6px;border:1px solid var(--border);text-align:center;min-width:160px">بنك الدم</th>';
  html += '<th style="padding:8px 4px;border:1px solid var(--border);text-align:center;width:50px">صلاحية</th>';
  visibleTypes.forEach(t => {
    const c = eqCounts[t.id];
    const pct = c.total ? Math.round(c.ok / c.total * 100) : 0;
    html += `<th style="padding:6px 4px;border:1px solid var(--border);text-align:center;min-width:80px;font-size:11px;background:${pct >= 80 ? '#e8f8e8' : pct >= 50 ? '#fff8e1' : '#fde8e8'}">${t.name} <small style="color:#999">${c.ok}/${c.total}</small></th>`;
  });
  html += '</tr></thead><tbody>';
  filtered.forEach(h => {
    const eq = h.equipment || {};
    const vals = Object.values(eq);
    const totalEq = vals.length;
    const badEq = vals.filter(v => v && (v.status === 'غير كفئ' || v.status === 'غير' || v.status === 0 || v.status === 'غير كفء')).length;
    const goodEq = totalEq - badEq;
    const pct = totalEq ? Math.round(goodEq / totalEq * 100) : 0;
    html += '<tr style="border-bottom:1px solid var(--border);cursor:pointer" onclick="eqEditHospital(\'' + esc(h.name) + '\')">';
    html += `<td style="padding:6px;border:1px solid var(--border);text-align:center;font-size:11px">${esc(h.governorate || '')}</td>`;
    html += `<td style="padding:6px 8px;border:1px solid var(--border);text-align:right;font-weight:bold">${esc(h.name)}</td>`;
    html += `<td style="padding:6px;border:1px solid var(--border);text-align:center"><span style="display:inline-block;padding:1px 8px;border-radius:10px;font-size:11px;font-weight:bold;color:#fff;background:${pct >= 80 ? '#27ae60' : pct >= 50 ? '#f39c12' : '#e74c3c'}">${goodEq}/${totalEq}</span></td>`;
    visibleTypes.forEach(t => {
      const e = eq[t.id];
      if (!e) {
        html += '<td style="padding:4px;border:1px solid var(--border);text-align:center;color:#ddd">-</td>';
      } else {
        const count = e.count;
        const status = e.status;
        const isBad = !status || status === 'غير كفئ' || status === 'غير' || status === 0 || status === 'غير كفء';
        const isMid = status === 'متوسط';
        const bg = isBad ? '#fde8e8' : isMid ? '#fff8e1' : '#e8f8e8';
        const clr = isBad ? '#e74c3c' : isMid ? '#f39c12' : '#27ae60';
        let info = count != null ? count : '';
        if (e.brand) info += ' ' + e.brand.substring(0, 12);
        html += `<td style="padding:3px 4px;border:1px solid var(--border);text-align:center;background:${bg};font-size:11px">
          <div style="font-weight:bold;color:${clr}">${info || '-'}</div>
          ${status ? `<div style="font-size:10px;color:${clr}">${status}</div>` : ''}
        </td>`;
      }
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  html += '<div style="margin-top:8px;text-align:center;font-size:11px;color:#999">انقر على أي مستشفى لعرض وتعديل الأجهزة</div>';
  document.getElementById('eqContent').innerHTML = html;
}

function eqEditHospital(name) {
  const { types, hospitals } = window._eqData || {};
  const hos = hospitals.find(h => h.name === name);
  if (!hos) return;
  const eq = hos.equipment || {};
  let body = `<div style="max-height:70vh;overflow-y:auto">
    <div style="margin-bottom:12px;padding:8px 12px;background:#f5f5f5;border-radius:6px">
      <strong>${esc(hos.name)}</strong>
      <span style="color:#888;font-size:12px;margin-right:12px">${esc(hos.governorate || '')}</span>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      <thead><tr style="background:#e9ecef">
        <th style="padding:6px;border:1px solid #ddd;text-align:center">الجهاز</th>
        <th style="padding:6px;border:1px solid #ddd;text-align:center;width:60px">العدد</th>
        <th style="padding:6px;border:1px solid #ddd;text-align:center">الماركة</th>
        <th style="padding:6px;border:1px solid #ddd;text-align:center;width:70px">السعة</th>
        <th style="padding:6px;border:1px solid #ddd;text-align:center;width:90px">الحالة</th>
      </tr></thead><tbody>`;
  types.forEach(t => {
    const e = eq[t.id] || {};
    body += `<tr>
      <td style="padding:6px;border:1px solid #ddd;text-align:right;font-weight:bold">${t.name}</td>
      <td style="padding:6px;border:1px solid #ddd;text-align:center"><input type="number" id="eq_${t.id}_count" value="${e.count || 0}" min="0" style="width:50px;text-align:center;padding:4px;border:1px solid #ccc;border-radius:4px"></td>
      <td style="padding:6px;border:1px solid #ddd;text-align:center"><input type="text" id="eq_${t.id}_brand" value="${esc(e.brand || '')}" style="width:100%;padding:4px;border:1px solid #ccc;border-radius:4px"></td>
      <td style="padding:6px;border:1px solid #ddd;text-align:center"><input type="text" id="eq_${t.id}_capacity" value="${esc(e.capacity || '')}" style="width:60px;text-align:center;padding:4px;border:1px solid #ccc;border-radius:4px"></td>
      <td style="padding:6px;border:1px solid #ddd;text-align:center">
        <select id="eq_${t.id}_status" style="padding:4px;border:1px solid #ccc;border-radius:4px">
          <option value="كفئ" ${e.status === 'كفئ' ? 'selected' : ''}>كفء</option>
          <option value="متوسط" ${e.status === 'متوسط' ? 'selected' : ''}>متوسط</option>
          <option value="غير كفئ" ${e.status === 'غير كفئ' || e.status === 'غير كفء' ? 'selected' : ''}>غير كفء</option>
          <option value="" ${!e.status ? 'selected' : ''}>---</option>
        </select>
      </td>
    </tr>`;
  });
  body += '</tbody></table></div>';
  const footer = `<button class="btn btn-success" onclick="eqSaveHospital('${esc(name)}')"><i class="fas fa-save"></i> حفظ</button>`;
  openModal('تعديل أجهزة ' + name, body, footer);
}

async function eqSaveHospital(name) {
  const { types } = window._eqData || {};
  const equipment = {};
  types.forEach(t => {
    const count = parseInt(document.getElementById('eq_' + t.id + '_count')?.value) || 0;
    const brand = document.getElementById('eq_' + t.id + '_brand')?.value || '';
    const capacity = document.getElementById('eq_' + t.id + '_capacity')?.value || '';
    const status = document.getElementById('eq_' + t.id + '_status')?.value || '';
    equipment[t.id] = { count, brand, capacity, status };
  });
  try {
    await api('PUT', '/blood-bank-equipment/hospital', { name, equipment });
    closeModal();
    renderBloodBankEquipment();
    showToast('✅ تم حفظ التعديلات');
  } catch (e) {
    showToast('❌ ' + e.message);
  }
}

let _archHospitals = null;
async function getArchHospitals() {
  if (!_archHospitals) _archHospitals = await api('GET', '/hospitals');
  return _archHospitals;
}
