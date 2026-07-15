const PERM_PAGES = [
  { key: 'daily_stock', label: 'STOCK Mang', cat: 'daily', icon: 'fa-vial' },
  { key: 'daily_total', label: 'TOTAL STOCK Mang', cat: 'daily', icon: 'fa-cubes' },
  { key: 'daily_statement', label: 'البيان اليومي', cat: 'daily', icon: 'fa-file-waveform' },
  { key: 'daily_branch', label: 'بيان الفرع', cat: 'daily', icon: 'fa-code-branch' },
  { key: 'monthly_indicators', label: 'مؤشرات شهرية', cat: 'monthly', icon: 'fa-chart-line' },
  { key: 'monthly_consumption', label: 'منصرف فصائل الدم', cat: 'monthly', icon: 'fa-droplet' },
  { key: 'monthly_big', label: 'مؤشرات تجميعيه', cat: 'monthly', icon: 'fa-chart-simple' },
  { key: 'monthly_small', label: 'مؤشرات تخزينيه', cat: 'monthly', icon: 'fa-boxes-stacked' },
  { key: 'employees', label: 'بيان العاملين', cat: 'other', icon: 'fa-user-tie' },
  { key: 'readiness', label: 'شيت الجاهزية', cat: 'other', icon: 'fa-clipboard-check' },
  { key: 'equipment', label: 'الأجهزة', cat: 'other', icon: 'fa-tools' },
  { key: 'archive', label: 'أرشيف', cat: 'other', icon: 'fa-folder-open' },
  { key: 'strategic_stock', label: 'الرصيد الاستراتيجي', cat: 'other', icon: 'fa-shield' },
  { key: 'users', label: 'المستخدمين', cat: 'admin', icon: 'fa-users-gear' },
  { key: 'role_perms', label: 'صلاحيات الأدوار', cat: 'admin', icon: 'fa-shield-check' },
  { key: 'hospitals', label: 'المستشفيات', cat: 'admin', icon: 'fa-hospital' },
  { key: 'governorates', label: 'المحافظات', cat: 'admin', icon: 'fa-location-dot' },
  { key: 'emp_accounts', label: 'حسابات الموظفين', cat: 'admin', icon: 'fa-user-plus' },
  { key: 'time_config', label: 'التوقيت', cat: 'admin', icon: 'fa-clock' },
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
  document.getElementById('modalBody').innerHTML = body;
  document.getElementById('modalFooter').innerHTML = footer || '';
  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

let _confirmCallback = null;

function showConfirmModal(msg, onConfirm) {
  _confirmCallback = onConfirm || null;
  document.getElementById('modalTitle').textContent = 'تأكيد';
  document.getElementById('modalBody').innerHTML = `<div style="font-size:15px;padding:8px 0">${sanitize(msg)}</div>`;
  document.getElementById('modalFooter').innerHTML = `
    <button class="btn btn-secondary" data-click="closeModal" style="margin-left:8px"><i class="fas fa-times"></i> إلغاء</button>
    <button class="btn btn-danger" data-click="doConfirm"><i class="fas fa-check"></i> تأكيد</button>`;
  document.getElementById('modalOverlay').classList.add('active');
}

function doConfirm() {
  closeModal();
  if (typeof _confirmCallback === 'function') _confirmCallback();
  _confirmCallback = null;
}

function initApp(u) {
  window._user = u;
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('appPage').style.display = '';
  const roleLabels = { admin:'مدير', hospital:'مستشفى', branch_supervisor:'مشرف فرع', org_supervisor:'مشرف هيئة', visitor:'زائر' };
  if (u.role === 'hospital') {
    document.getElementById('userBadge').textContent = 'مستخدم: ' + u.name;
  } else {
    document.getElementById('userBadge').textContent = u.name + ' (' + (roleLabels[u.role] || u.role) + ')';
  }
  document.getElementById('dateDisplay').textContent = fmtCairoDate('full');
  if (_clockInterval) clearInterval(_clockInterval);
  _clockInterval = setInterval(updateClock, 10000);
  updateClock();
  applyDarkMode(); showMenu();
  loadTimeConfig();
}

async function doLogin() {
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value.trim();
  if (!username || !password) return;
  try {
    const res = await api('POST', '/login', { username, password });
    initApp(res.user);
  } catch (e) {
    document.getElementById('loginError').textContent = e.message || 'Username or Password خطأ يرجي الاتصال بالمطور';
  }
}

function showMyProfile() {
  const u = window._user;
  if (!u) return;
  const roleLabels = { admin:'مدير', hospital:'مستشفى', branch_supervisor:'مشرف فرع', org_supervisor:'مشرف هيئة', visitor:'زائر' };
  openModal('الملف الشخصي',
    `<div style="text-align:center;margin-bottom:16px"><i class="fas fa-user-circle" style="font-size:64px;color:#dc3545;opacity:0.7"></i>
    <h3 style="margin:8px 0 4px">${esc(u.name || u.username)}</h3>
    <span style="display:inline-block;padding:4px 16px;border-radius:20px;font-size:13px;background:#dc354522;color:#dc3545;font-weight:600">${roleLabels[u.role] || u.role}</span></div>
    <div class="form-group"><label>اسم المستخدم</label><input class="form-control" value="${esc(u.username)}" readonly style="background:#f5f5f5;direction:ltr"></div>
    <div class="form-group"><label>الاسم</label><input class="form-control" id="mpName" value="${esc(u.name || '')}"></div>
    <div class="form-group" style="border-top:1px solid #eee;padding-top:12px;margin-top:12px">
      <button class="btn btn-primary" style="width:100%" data-click="changeUserPassword" data-args="${u.id}"><i class="fas fa-key"></i> تغيير كلمة المرور</button>
    </div>`,
    `<button class="btn btn-secondary" data-click="closeModal">إغلاق</button>
    <button class="btn btn-primary" data-click="saveMyProfile">حفظ التغييرات</button>`);
}
async function saveMyProfile() {
  const name = document.getElementById('mpName').value.trim();
  if (!name) { showToast('⚠ الاسم مطلوب'); return; }
  try {
    await api('PUT', '/users/' + window._user.id, { name });
    window._user.name = name;
    const u = window._user;
    if (u.role === 'hospital') {
      document.getElementById('userBadge').textContent = 'مستخدم: ' + name;
    } else {
      document.getElementById('userBadge').textContent = name + ' (' + ({ admin:'مدير', hospital:'مستشفى', branch_supervisor:'مشرف فرع', org_supervisor:'مشرف هيئة', visitor:'زائر' }[u.role] || u.role) + ')';
    }
    closeModal();
    showToast('تم حفظ الملف الشخصي');
  } catch(e) { showToast('❌ '+e.message); }
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
