const API_BASE = '/api';
let _timeOffset = 2;
let _clockInterval = null;

function getCairoDate() {
  return new Date(Date.now() + _timeOffset * 3600000);
}
function fmtCairoDate(fmt) {
  const d = getCairoDate();
  const pad = n => String(n).padStart(2, '0');
  const dayNames = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const monthNames = ['يناير','فبراير','مارس','ابريل','مايو','يونيو','يوليو','اغسطس','سبتمبر','اكتوبر','نوفمبر','ديسمبر'];
  if (fmt === 'date') return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`;
  if (fmt === 'time') { const h = d.getUTCHours(); const a = h >= 12 ? 'م' : 'ص'; return `${pad(h % 12 || 12)}:${pad(d.getUTCMinutes())} ${a}`; }
  if (fmt === 'full') return `${dayNames[d.getUTCDay()]}، ${d.getUTCDate()} ${monthNames[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  return d.toLocaleDateString('ar-EG');
}
function curMonthCairo() {
  const d = getCairoDate();
  return d.getUTCFullYear() * 100 + d.getUTCMonth() + 1;
}
function updateClock() {
  const el = document.getElementById('clockDisplay');
  if (el) el.textContent = fmtCairoDate('time');
}
async function toggleTime() {
  const prev = _timeOffset;
  _timeOffset = _timeOffset === 1 ? 2 : 1;
  try {
    await api('POST', '/config/time', { time_offset: _timeOffset });
    updateClock();
    const dd = document.getElementById('dateDisplay');
    if (dd) dd.textContent = fmtCairoDate('full');
    showToast('✅ تم تغيير التوقيت إلى ' + (_timeOffset === 1 ? 'شتوي' : 'صيفي'));
  } catch(e) {
    _timeOffset = prev;
    showToast('❌ فشل تغيير التوقيت');
  }
}

function renderTimeConfig() {
  const m = document.getElementById('mainContent');
  if (!m) return;
  m.innerHTML = '<div class="page-loading"><i class="fas fa-spinner fa-spin"></i> جاري تحميل إعدادات التوقيت...</div>';
api('GET', '/config/time').then(res => {
    const offset = res.time_offset;
    m.innerHTML = `
      <div class="page-actions"><button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> الرئيسية</button></div>
      <div class="page-header"><h2><i class="fas fa-clock"></i> ضبط التوقيت</h2></div>
      <div class="card" style="max-width:500px;margin:20px auto">
        <div style="text-align:center;padding:24px">
          <div style="font-size:64px;color:var(--primary);margin-bottom:16px"><i class="fas fa-clock"></i></div>
          <h3 style="margin-bottom:12px">التوقيت الحالي: <strong>${offset === 1 ? 'شتوي (+1)' : 'صيفي (+2)'}</strong></h3>
          <p style="color:#999;margin-bottom:20px">اختر التوقيت المناسب (صيفي / شتوي)</p>
          <div style="display:flex;gap:12px;justify-content:center">
            <button class="btn ${offset === 2 ? 'btn-primary' : 'btn-outline'}" data-click="setTimeConfig" data-args="2">
              <i class="fas fa-sun"></i> توقيت صيفي (+2)
            </button>
            <button class="btn ${offset === 1 ? 'btn-primary' : 'btn-outline'}" data-click="setTimeConfig" data-args="1">
              <i class="fas fa-moon"></i> توقيت شتوي (+1)
            </button>
          </div>
          <div style="margin-top:24px;padding:12px;background:var(--bg-card);border-radius:8px">
            <div style="font-size:13px;color:var(--text-muted)">
              <i class="fas fa-info-circle"></i> الوقت الحالي: <strong id="tcClock">${fmtCairoDate('time')}</strong>
              — التاريخ: <strong id="tcDate">${fmtCairoDate('full')}</strong>
            </div>
          </div>
        </div>
      </div>`;
    if (_clockInterval) clearInterval(_clockInterval);
    _clockInterval = setInterval(() => {
      const c = document.getElementById('tcClock'); if (c) c.textContent = fmtCairoDate('time');
      const d = document.getElementById('tcDate'); if (d) d.textContent = fmtCairoDate('full');
    }, 1000);
  }).catch(() => {
    m.innerHTML = '<div class="page-error">فشل تحميل الإعدادات</div>';
  });
}

async function setTimeConfig(newOffset) {
  _timeOffset = newOffset;
  try {
    await api('POST', '/config/time', { time_offset: newOffset });
    renderTimeConfig();
    updateClock();
    const dd = document.getElementById('dateDisplay');
    if (dd) dd.textContent = fmtCairoDate('full');
    showToast('✅ تم تغيير التوقيت إلى ' + (newOffset === 1 ? 'شتوي' : 'صيفي'));
  } catch(e) {
    showToast('❌ فشل تغيير التوقيت');
  }
}

function startStockClock() {
  const el = document.getElementById('stockClock');
  if (!el) return;
  const tick = () => { el.textContent = fmtCairoDate('time'); };
  tick();
  if (_clockInterval) clearInterval(_clockInterval);
  _clockInterval = setInterval(tick, 1000);
}

async function api(method, url, data) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (data) opts.body = JSON.stringify(data);
  const res = await fetch(API_BASE + url, opts);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'خطأ في الطلب');
  return json;
}

function esc(v) {
  if (v == null) return '';
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
function sanitize(v) {
  if (v == null) return '';
  if (typeof DOMPurify !== 'undefined' && DOMPurify.sanitize) return DOMPurify.sanitize(v);
  return esc(v);
}

function togglePasswordVisibility(fieldId, el) {
  const inp = document.getElementById(fieldId);
  if (!inp) return;
  const isPass = inp.type === 'password';
  inp.type = isPass ? 'text' : 'password';
  let btn = el || (typeof this !== 'undefined' && this && this.nodeType ? this : null);
  if (btn) btn.innerHTML = isPass ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
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
async function checkSession() {
  try {
    const res = await api('GET', '/me');
    if (res.user) initApp(res.user);
  } catch(e) {
    applyDarkMode();
  }
}
