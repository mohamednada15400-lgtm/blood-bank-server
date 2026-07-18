/* event delegation for CSP compliance */
(function(){var H={},E={click:1,change:1,input:1,focusin:1,paste:1,focusout:1,keydown:1,mouseover:1,mouseout:1};window._dh=function(n,f){H[n]=f;};for(var K in E){if(E.hasOwnProperty(K)){(function(et){document.addEventListener(et,function(e){try{var attr='data-'+et;if(et==='focusin')attr='data-focus';if(et==='focusout')attr='data-blur';if(et==='keydown')attr='data-keydown';var el=e.target.closest('['+attr+']');if(!el)return;var n=el.getAttribute(attr);if(!n)return;var fn=H[n];if(typeof fn!=='function')fn=window[n];if(typeof fn!=='function')return;var args=el.getAttribute('data-args');var parsed=[];if(args){var parts=args.split(',');for(var i=0;i<parts.length;i++){var a=parts[i].trim();if(a==='null'){parsed.push(null);continue;}if(a==='undefined'){parsed.push(undefined);continue;}if(a==='true'){parsed.push(true);continue;}if(a==='false'){parsed.push(false);continue;}var num=Number(a);if(!isNaN(num)&&a.length>0){parsed.push(num);continue;}var s=a;if((s[0]==='"'&&s[s.length-1]==='"')||(s[0]==="'"&&s[s.length-1]==="'"))s=s.slice(1,-1);parsed.push(s);}}fn.apply(el,parsed);}catch(ex){console.error('[delegation]',et,n,ex.message);}});})(K);}}})();
/* registered handlers for complex inline conversions */
_dh('viewAllStrategic',function(){strategicViewMode='all';renderStrategicStock();});
_dh('viewGovStrategic',function(){strategicViewMode='gov';renderStrategicStock();});
_dh('viewGovTotalsStrategic',function(){strategicViewMode='govtotals';renderStrategicStock();});
_dh('viewGrandStrategic',function(){strategicViewMode='grand';renderStrategicStock();});
_dh('viewHospStrategic',function(){strategicViewMode='hospital';renderStrategicStock();});
_dh('setNameFromEmp',function(n,f){setNameFromEmp(n,f);});
_dh('toggleCatPerms',function(r,c,v){toggleCatPerms(r,c,v);});
_dh('rdnDismissNotifAlert',function(i){rdnDismissNotifAlert(i);});
_dh('rdnDeleteReport',function(id){closeModal();api('DELETE','/readiness-reports/'+id).then(function(){showToast(' تم حذف التقرير');rdnOccasionChanged();}).catch(function(e){showToast(' '+e.message);});});
_dh('renderArchive',function(){renderArchive();});
_dh('editArchiveRecord',function(aid,hid,y,m,p){editArchiveRecord(aid,hid,y,m,p);});
_dh('deleteArchiveRecord',function(aid,hid,y,m,p){deleteArchiveRecord(aid,hid,y,m,p);});
_dh('saveEditArchiveRecord',function(aid,hid,y,m,p){saveEditArchiveRecord(aid,hid,y,m,p);});
_dh('confirmDeleteArchiveGroup',function(l){let rest=Array.prototype.slice.call(arguments,1);confirmDeleteArchiveGroup(l,rest);});
_dh('editIndicatorArchiveRecord',function(aid,hid,y,m,p){editIndicatorArchiveRecord(aid,hid,y,m,p);});
_dh('deleteIndicatorArchiveRecord',function(aid,hid,y,m,p){deleteIndicatorArchiveRecord(aid,hid,y,m,p);});
_dh('saveEditIndicatorArchive',function(aid,hid,y,m,p){saveEditIndicatorArchive(aid,hid,y,m,p);});
_dh('showAddIndModal',function(hid,t){showAddIndModal(hid,t);});
_dh('eqOpenForm',function(n){eqOpenForm(n);});
_dh('eqReviewHospital',function(n){eqReviewHospital(n);});
_dh('showStockHistory',function(hid){showStockHistory(hid);});
_dh('loadStockAudit',function(hid){loadStockAudit(hid);});
_dh('eqRemoveSingleRow',function(tid){eqRemoveSingleRow(tid,this);});
_dh('eqDeleteHosp',function(){eqDeleteHosp(document.getElementById('eqDelHospSelect').value);});
_dh('windowPrint',function(){window.print();});
_dh('hoverOn',function(){this.style.background=this.getAttribute('data-hover-bg');});
_dh('hoverOff',function(){this.style.background=this.getAttribute('data-hover-off');});
_dh('permToggleChanged',function(){/* checkbox state handled by browser accent-color */});
_dh('filterPermPages',function(){filterPermPages(this);});
function filterPermPages(inp){let q=inp.value.trim().toLowerCase();let card=inp.closest('.card');if(!card)return;card.querySelectorAll('div[style*="padding:3px 0"]').forEach(function(row){let label=row.querySelector('span:first-child');if(!label||!label.textContent)return;row.style.display=(!q||label.textContent.toLowerCase().indexOf(q)!==-1)?'':'none';});
let header=card.querySelector('div[style*="padding:2px 0"]');if(header){let has=Array.from(card.querySelectorAll('div[style*="padding:3px 0"]')).some(function(r){return r.style.display!=='none';});header.style.display=has?'':'none';}}
_dh('closeModalAndFilter',function(){closeModal();eqFilterHosp();});
_dh('occFormAction',function(){let a=this.getAttribute('data-args').split(',');if(a[0]==='edit')rdnUpdateOccasion(parseInt(a[1]));else rdnCreateOccasion();});
_dh('syncImport2',function(){showToast('جاري التحميل...');syncImport();});
_dh('strategicGovChanged',function(){strategicViewGov=this.value;strategicViewMode='gov';renderStrategicStock();});
_dh('strategicHospChanged',function(){strategicViewHosp=this.value;renderStrategicStock();});
_dh('empGovChangedAdd',function(){empGovChanged('add');});
_dh('archiveCellEnter',function(e){if(e.key==='Enter'){e.preventDefault();this.blur();}});
_dh('autoFillEmpNameEdit',function(){autoFillEmpName('euName','euHosp');});
_dh('rdnNameSelected',function(){rdnNameSelected(this);});
_dh('rdnShiftChanged',function(){rdnShiftChanged(this);});
_dh('rdnRemoveStaffRow',function(btn){if(typeof btn==='undefined'||btn===null)btn=this;rdnRemoveStaffRow(btn);});
_dh('archiveCellFocus',function(el){if(typeof el==='undefined'||el===null)el=this;archiveCellFocus(el);});
_dh('saveArchiveCell',function(el){if(typeof el==='undefined'||el===null)el=this;saveArchiveCell(el);});

/* mobile-safe download helper */
function downloadBlob(blob, filename) {
  if (window.navigator && window.navigator.msSaveBlob) { window.navigator.msSaveBlob(blob, filename); return; }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
    // Mobile fallback (iOS Safari etc.): open in new tab
    if (/Mobi|iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      window.open(url, '_blank');
    }
    document.body.removeChild(a);
  }, 400);
  setTimeout(function() { URL.revokeObjectURL(url); }, 30000);
}

function downloadPdfMobile(bodyHtml, filename) {
  // Mobile-compatible PDF via HTML blob download
  const fullHtml = '<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>' + filename + '</title><style>@page{size:landscape;margin:8mm 6mm}body{font-family:\'Traditional Arabic\',\'Segoe UI\',Arial,sans-serif;padding:8px;background:#fff;margin:0}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>' + bodyHtml + '</body></html>';
  downloadBlob(new Blob([fullHtml], { type: 'application/octet-stream' }), filename);
}

function downloadPdf(bodyHtml, filename) {
  if (/Mobi|iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    downloadPdfMobile(bodyHtml, filename);
    return;
  }
  const w = window.open('', '_blank');
  if (!w) { downloadPdfMobile(bodyHtml, filename); return; }
  w.document.write('<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>' + filename + '</title><style>@page{size:landscape;margin:8mm 6mm}body{font-family:\'Traditional Arabic\',\'Segoe UI\',Arial,sans-serif;padding:8px;background:#fff;margin:0}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>' + bodyHtml + '<script>window.print();window.close();</' + 'script></body></html>');
  w.document.close();
}

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
    el.innerHTML = `<div class="page-actions"><button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> الرئيسية</button>
      ${canAdd ? '<button class="btn btn-primary" data-click="showAddDailyModal"><i class="fas fa-plus"></i> إضافة</button>' : ''}
      ${canExport ? '<button class="btn btn-success" data-click="exportStockExcel"><i class="fas fa-file-excel"></i> تحميل Excel</button>' : ''}</div>
      <div class="card-body table-scroll" id="dailyStockWrap"></div>`;
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
        const todayStr = fmtCairoDate('date');
        const dateStyle = r.date && r.date !== todayStr ? ' style="color:red;font-weight:700"' : '';
        h += `<td data-click="showStockHistory" data-args="${r.hospital_id}" style="cursor:pointer">${r.hospital_name || ''}</td><td data-role="date"${dateStyle}>${r.date || ''}</td><td data-role="time">${r.time || ''}</td>`;
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

function exportStockExcel() {
  const table = document.getElementById('dailyStockTable');
  if (!table) return;
  let html = table.outerHTML;
  html = html.replace(/<table/g, '<table style="border-collapse:collapse;width:100%;font-family:\'Segoe UI\',Arial;font-size:10px;"');
  html = html.replace(/<th(?!\s)/g, '<th style="background:#2c3e50;color:#fff;font-weight:700;padding:4px 6px;border:1px solid #1a252f;text-align:center;white-space:nowrap"');
  html = html.replace(/<th\s+([^>]*)>/g, (m, a) => `<th ${a} style="background:#2c3e50;color:#fff;font-weight:700;padding:4px 6px;border:1px solid #1a252f;text-align:center;white-space:nowrap">`);
  html = html.replace(/<td(?!\s)/g, '<td style="padding:3px 5px;border:1px solid #bdc3c7;text-align:center;font-size:10px"');
  html = html.replace(/<td\s+([^>]*)>/g, (m, a) => `<td ${a} style="padding:3px 5px;border:1px solid #bdc3c7;text-align:center;font-size:10px">`);
  const dateStr = fmtCairoDate('full');
  const full = `<html dir="rtl"><head><meta charset="utf-8"></head><body>
    <table style="width:100%;margin-bottom:8px"><tr><td style="text-align:center;font-size:16px;font-weight:700;color:#2c3e50;border:none">المخزون اليومي لبنوك الدم</td></tr>
      <tr><td style="text-align:center;font-size:11px;color:#7f8c8d;border:none">${dateStr}</td></tr></table>
    ${html}
    <table style="width:100%;margin-top:10px"><tr><td style="text-align:center;font-size:10px;color:#95a5a6;border:none">إعداد و برمجة محمد ندا 01068880999</td></tr></table></body></html>`;
  downloadBlob(new Blob(['\ufeff' + full], { type: 'application/octet-stream' }), 'stock-management-' + fmtCairoDate('date') + '.xls');
}

async function showStockHistory(hospitalId) {
  const me = (await api('GET', '/me')).user;
  const hospitals = await api('GET', '/hospitals');
  const hosp = hospitals.find(h => h.id === hospitalId);
  const hospName = hosp ? hosp.name : 'المستشفى';
  pushNav(renderDailyStock);
  const el = document.getElementById('mainContent');
  const today = fmtCairoDate('date');
  const firstDay = fmtCairoDate('year') + '-01-01';
  el.innerHTML = `<div class="page-actions">
    <button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> رجوع</button>
    <span style="font-size:16px;font-weight:700;margin-right:12px;color:var(--text,#333)"><i class="fas fa-history" style="color:#2980b9"></i> سجل تغييرات ${esc(hospName)}</span>
  </div>
  <div class="card-body">
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap">
      <label style="font-size:11px;color:#666">من:</label>
      <input type="date" id="auditFrom" value="${firstDay}" style="font-size:11px;padding:4px 8px;border:1px solid #ddd;border-radius:4px">
      <label style="font-size:11px;color:#666">إلى:</label>
      <input type="date" id="auditTo" value="${today}" style="font-size:11px;padding:4px 8px;border:1px solid #ddd;border-radius:4px">
      <button class="btn btn-primary btn-sm" data-click="loadStockAudit" data-args="${hospitalId}" style="font-size:10px"><i class="fas fa-search"></i> عرض</button>
    </div>
    <div id="stockAuditWrap" style="font-size:12px;color:#888;text-align:center;padding:40px 0">اضغط "عرض" لتحميل السجل</div>
  </div>`;
}

async function loadStockAudit(hospitalId) {
  const from = document.getElementById('auditFrom').value;
  const to = document.getElementById('auditTo').value;
  const wrap = document.getElementById('stockAuditWrap');
  try {
    const rows = await api('GET', '/daily-reports/audit?hospitalId=' + hospitalId + '&from=' + from + '&to=' + to);
    if (!rows.length) {
      wrap.innerHTML = '<div style="padding:40px 0;text-align:center;color:#999"><i class="fas fa-inbox" style="font-size:24px;display:block;margin-bottom:8px"></i>لا توجد تغييرات في هذه الفترة</div>';
      return;
    }
    let h = '<table class="data-table" style="font-size:10px"><thead><tr><th>#</th><th>التاريخ</th><th>الوقت</th><th>الحقل</th><th>القيمة القديمة</th><th>القيمة الجديدة</th><th>تم بواسطة</th></tr></thead><tbody>';
    rows.forEach((r, i) => {
      const dt = r.created_at ? r.created_at.slice(0, 10) : '';
      const tm = r.created_at ? r.created_at.slice(11, 16) : '';
      h += `<tr>
        <td>${i + 1}</td>
        <td>${dt}</td>
        <td>${tm}</td>
        <td style="font-weight:600">${esc(r.field_key || '')}</td>
        <td style="color:#e74c3c;max-width:150px;overflow:hidden;text-overflow:ellipsis">${esc(r.old_value || '')}</td>
        <td style="color:#27ae60;max-width:150px;overflow:hidden;text-overflow:ellipsis">${esc(r.new_value || '')}</td>
        <td>${esc(r.user_name || '')}</td>
      </tr>`;
    });
    h += '</tbody></table>';
    wrap.innerHTML = h;
  } catch (e) {
    wrap.innerHTML = '<div style="color:#e74c3c;padding:20px">' + sanitize(e.message) + '</div>';
  }
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
      const newVal = isText ? td.textContent.trim() : (parseInt(td.textContent.trim()) || 0);
      if (!isText) td.textContent = newVal;
      const rid = parseInt(td.dataset.rid);
      const group = td.dataset.group;
      const type = td.dataset.type;
      const sub = td.dataset.sub;
      collectGroupData(table, rid);
      // Auto-save cell
      if (rid && group) {
        api('PATCH', '/daily-reports/' + rid + '/cell', { group, type, sub, value: newVal }).catch(() => {});
      }
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
  const date = fmtCairoDate('date');
  const now = getCairoDate();
  const time = `${String(now.getUTCHours()).padStart(2,'0')}:${String(now.getUTCMinutes()).padStart(2,'0')}`;
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
  const todayStr = fmtCairoDate('date');
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
  const d = fmtCairoDate('date');
  const now = getCairoDate();
  const t = `${String(now.getUTCHours()).padStart(2,'0')}:${String(now.getUTCMinutes()).padStart(2,'0')}`;
  let html = `<div class="form-group"><label>المستشفى</label><select class="form-control" id="addDailyHospital">
    ${hospitals.map(h => `<option value="${h.id}">${h.name}</option>`).join('')}</select></div>
    <div class="form-group"><label>التاريخ</label><input type="date" class="form-control" id="addDailyDate" value="${d}"></div>
    <div class="form-group"><label>الوقت</label><input type="text" class="form-control" id="addDailyTime" value="${t}"></div>`;
  openModal('إضافة تقرير يومي', html,
    `<button class="btn btn-secondary" data-click="closeModal">إلغاء</button><button class="btn btn-primary" data-click="createDailyReport">حفظ</button>`);
}

async function createDailyReport() {
  const hospitalId = parseInt(document.getElementById('addDailyHospital').value);
  const date = document.getElementById('addDailyDate').value;
  const time = document.getElementById('addDailyTime').value.trim();
  if (!hospitalId || !date) { showToast('⚠ اختر المستشفى والتاريخ'); return; }
  try {
    await api('POST', '/daily-reports', { hospitalId, date, time });
    closeModal();
    renderDailyStock();
  } catch(e) { showToast('❌ '+e.message); }
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
      const now = getCairoDate();
      const curYear = now.getUTCFullYear();
      const curMonth = now.getUTCMonth();
      const qStart = new Date(Date.UTC(curYear, Math.floor(curMonth / 3) * 3 - 3, 1));
      const qEnd = new Date(Date.UTC(curYear, Math.floor(curMonth / 3) * 3, 0));
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
    const todayStr = String(getCairoDate().getUTCFullYear()).padStart(4,'0')+'-'+String(getCairoDate().getUTCMonth()+1).padStart(2,'0')+'-'+String(getCairoDate().getUTCDate()).padStart(2,'0');
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

    const ssUser = window._user;
    const ssRole = ssUser?.role || '';
    const ssGov = ssUser?.governorate || '';
    const ssRestricted = ssRole && ssRole !== 'admin' && ssRole !== 'org_supervisor' && ssGov;
    if (ssRestricted) {
      strategicViewMode = 'gov';
      strategicViewGov = ssGov;
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

    el.innerHTML = `<div class="page-actions"><button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> الرئيسية</button>
      ${canExport ? '<button class="btn btn-success" data-click="exportStrategicExcel"><i class="fas fa-file-excel"></i> تحميل Excel</button><button class="btn btn-danger" data-click="exportStrategicPDF" style="margin-right:6px"><i class="fas fa-file-pdf"></i> تحميل PDF</button>' : ''}</div>
      <div class="page-title"><i class="fas fa-shield" style="color:#2e7d32"></i> الرصيد الاستراتيجي</div>
      <div class="card"><div class="card-body">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px">
          ${ssRestricted ? `<span style="font-weight:700;color:#2e7d32;padding:4px 8px;background:#e8f5e9;border-radius:6px"><i class="fas fa-location-dot"></i> ${esc(ssGov)}</span>` :
          `<button class="btn ${viewMode === 'all' ? 'btn-primary' : 'btn-outline'}" data-click="viewAllStrategic">كل المحافظات</button>`}
          <button class="btn ${viewMode === 'gov' ? 'btn-primary' : 'btn-outline'}" data-click="viewGovStrategic">فرع</button>
          <button class="btn ${viewMode === 'govtotals' ? 'btn-primary' : 'btn-outline'}" data-click="viewGovTotalsStrategic">إجمالي المحافظات</button>
          <button class="btn ${viewMode === 'grand' ? 'btn-primary' : 'btn-outline'}" data-click="viewGrandStrategic">إجمالي الهيئة</button>
          <button class="btn ${viewMode === 'hospital' ? 'btn-primary' : 'btn-outline'}" data-click="viewHospStrategic">مستشفى</button>
          ${viewMode === 'gov' ? `<select class="form-control" style="width:auto;display:inline-block" data-change="strategicGovChanged"><option value="">اختر الفرع</option>${(ssRestricted ? [ssGov] : sortedGovs).map(g => `<option value="${g}" ${viewGov === g ? 'selected' : ''}>${g}</option>`).join('')}</select>` : ''}
          ${viewMode === 'hospital' ? `<select class="form-control" style="width:auto;display:inline-block" data-change="strategicHospChanged"><option value="">اختر المستشفى</option>${hospitals.filter(h => (!viewGov || h.governorate === viewGov) && (!ssRestricted || h.governorate === ssGov)).map(h => `<option value="${h.id}" ${viewHosp == h.id ? 'selected' : ''}>${h.name}</option>`).join('')}</select>` : ''}
          ${hasPerm('strategic_stock', 'edit') ? `<button class="btn btn-primary" style="margin-right:auto" data-click="showStrategicCalcModal"><i class="fas fa-calculator"></i> حساب الرصيد الاستراتيجي</button>` : ''}
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
      `<button class="btn btn-secondary" data-click="closeModal">إلغاء</button><button class="btn btn-primary" data-click="doStrategicCalc">حساب وحفظ</button>`);
  } catch (e) { showToast('❌ '+e.message); }
}

async function doStrategicCalc() {
  const formula = parseInt(document.getElementById('calcFormula').value);
  const holidayDays = parseInt(document.getElementById('calcHolidayDays').value);
  if (!holidayDays || holidayDays < 0) { showToast('⚠ يرجى إدخال عدد أيام الإجازات'); return; }
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
  downloadBlob(new Blob(['\ufeff' + fullHtml], { type: 'application/octet-stream' }), 'strategic-stock.xls');
}

function downloadPdf(bodyHtml, filename) {
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write('<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>' + filename + '</title><style>@page{size:landscape;margin:8mm 6mm}body{font-family:\'Traditional Arabic\',\'Segoe UI\',Arial,sans-serif;padding:8px;background:#fff;margin:0}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>' + bodyHtml + '<script>window.print();window.close();</' + 'script></body></html>');
  w.document.close();
}

function exportStrategicPDF() {
  const wrap = document.getElementById('strategicTableWrap');
  if (!wrap) return;
  const dateStr = new Date().toLocaleDateString('ar-EG');
  const tbl = wrap.querySelector('table');
  if (!tbl) return;
  let html = tbl.outerHTML;
  html = html.replace(/<table/g, '<table style="border-collapse:collapse;width:100%;font-family:\'Segoe UI\',Arial;font-size:11px"');
  html = html.replace(/<th(?!\s)/g, '<th style="background:#2e7d32;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #1b5e20;text-align:center"');
  html = html.replace(/<th\s+([^>]*)>/g, (m, a) => `<th ${a} style="background:#2e7d32;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #1b5e20;text-align:center">`);
  html = html.replace(/<td(?!\s)/g, '<td style="padding:3px 5px;border:1px solid #ccc;text-align:center;font-size:11px"');
  html = html.replace(/<td\s+([^>]*)>/g, (m, a) => `<td ${a} style="padding:3px 5px;border:1px solid #ccc;text-align:center;font-size:11px">`);
  const bodyHtml = `<div style="text-align:center;margin-bottom:10px"><h2 style="color:#2e7d32;margin:0 0 3px 0;font-size:16px">الرصيد الاستراتيجي</h2><p style="color:#666;margin:0;font-size:11px">تاريخ التقرير: ${dateStr}</p></div>
    ${html}
    <div style="text-align:center;margin-top:10px;font-size:10px;color:#888">إعداد و برمجة محمد ندا 01068880999</div>`;
  downloadPdf(bodyHtml, 'strategic-stock.pdf');
}

// ============== TOTAL STOCK (total STOCK Mang) ==============

async function renderTotal() {
  const el = document.getElementById('mainContent');
  const canExport = hasPerm('daily_total', 'export');
  try {
    el.innerHTML = `<div class="page-actions"><button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> الرئيسية</button>
      ${canExport ? '<button class="btn btn-success" data-click="exportTotalExcel"><i class="fas fa-file-excel"></i> تحميل Excel</button>' : ''}
      ${canExport ? '<button class="btn btn-danger" data-click="exportTotalPDF"><i class="fas fa-file-pdf"></i> تحميل PDF</button>' : ''}</div>
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
      const cT = getCairoDate(); const todayStr2 = String(cT.getUTCFullYear()).padStart(4,'0')+'-'+String(cT.getUTCMonth()+1).padStart(2,'0')+'-'+String(cT.getUTCDate()).padStart(2,'0');
      const isOld = r.date && r.date.slice(0,10) !== todayStr2;
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
  downloadBlob(new Blob(['\ufeff' + full], { type: 'application/octet-stream' }), 'total-stock.xls');
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
  const bodyHtml = `<div style="text-align:center;margin-bottom:8px"><h2 style="color:#2e7d32;margin:0 0 2px;font-size:15px">إجمالي الرصيد ببنوك الدم</h2><p style="color:#666;margin:0;font-size:10px">تاريخ التقرير: ${dateStr}</p></div>
    ${html}
    <div style="text-align:center;margin-top:10px;font-size:10px;color:#888">إعداد و برمجة محمد ندا 01068880999</div>`;
  downloadPdf(bodyHtml, 'total-stock.pdf');
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
      <div style="margin-bottom:16px"><button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> الرئيسية</button>
        ${canExport ? '<button class="btn btn-danger" data-click="printStatement"><i class="fas fa-print"></i> طباعة</button>' : ''}</div>
      <div class="page-actions">
        <select class="search-input" id="stmtHospital" data-change="renderDailyStatement">
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
  } catch(e) { showToast('❌ '+e.message); }
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
    const canExport = hasPerm('daily_branch', 'export');
    let gov = me.governorate;
    if (!gov && !isMaster) { el.innerHTML = '<div class="empty-msg">لا توجد فرع مرتبطة بحسابك</div>'; return; }

    // Check if dropdown already exists (master switching governorates)
    const existingSel = document.getElementById('branchGovSelect');
    const exportBtns = canExport ? `<button class="btn btn-sm btn-success" data-click="branchExportExcel" style="margin-right:6px;height:32px"><i class="fas fa-file-excel"></i> تحميل Excel</button><button class="btn btn-sm btn-danger" data-click="branchExportPdf" style="margin-right:4px;height:32px"><i class="fas fa-file-pdf"></i> تحميل PDF</button>` : '';
    if (existingSel) { gov = existingSel.value; }
    else if (!gov && isMaster) {
      const govs = await api('GET', '/governorates');
      const arr = Array.isArray(govs) ? govs : [];
      if (!arr.length) { el.innerHTML = `<div class="page-actions"><button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> الرئيسية</button></div><div class="empty-msg">لا توجد محافظات</div>`; return; }
      gov = arr[0];
      el.innerHTML = `<div class="page-actions"><button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> الرئيسية</button>
        ${exportBtns}
        <div style="display:inline-block;margin-right:10px"><select class="form-control" id="branchGovSelect" style="display:inline-block;width:auto" data-change="renderBranchStatement">${arr.map(g => `<option value="${g}" ${g===gov?'selected':''}>${g}</option>`).join('')}</select></div></div>
        <div class="branch-stmt-report" id="branchStmtReport"></div>`;
    } else if (!existingSel) {
      el.innerHTML = `<div class="page-actions"><button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> الرئيسية</button>
        ${exportBtns}</div>
        <div class="branch-stmt-report" id="branchStmtReport"></div>`;
    }
    const reports = await api('GET', '/daily-reports');
    const govHospIds = [...new Set(reports.filter(r => r.governorate === gov).map(r => r.hospital_id))];
    if (!govHospIds.length) { document.getElementById('branchStmtReport').innerHTML = `<div class="empty-msg">لا توجد تقارير للفرع: ${gov}</div>`; return; }
    const now = getCairoDate();
    const dayNames = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    const dd = now.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    const dayName = dayNames[now.getUTCDay()];
    const period = now.getUTCHours() < 12 ? 'الصباحية' : 'المسائية';

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
      const cT2 = getCairoDate(); const todayStr3 = String(cT2.getUTCFullYear()).padStart(4,'0')+'-'+String(cT2.getUTCMonth()+1).padStart(2,'0')+'-'+String(cT2.getUTCDate()).padStart(2,'0');
      const isOld = r.date && r.date.slice(0,10) !== todayStr3;
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

function branchExportExcel() {
  const table = document.querySelector('#branchStmtReport table');
  if (!table) return;
  let html = table.outerHTML;
  html = html.replace(/<table/g, '<table style="border-collapse:collapse;width:100%;font-family:\'Segoe UI\',Arial;font-size:10px"');
  html = html.replace(/<th(?!\s)/g, '<th style="background:#2c3e50;color:#fff;font-weight:700;padding:4px 6px;border:1px solid #1a252f;text-align:center;white-space:nowrap"');
  html = html.replace(/<th\s+([^>]*)>/g, (m, a) => `<th ${a} style="background:#2c3e50;color:#fff;font-weight:700;padding:4px 6px;border:1px solid #1a252f;text-align:center;white-space:nowrap">`);
  html = html.replace(/<td(?!\s)/g, '<td style="padding:3px 5px;border:1px solid #bdc3c7;text-align:center;font-size:10px"');
  html = html.replace(/<td\s+([^>]*)>/g, (m, a) => `<td ${a} style="padding:3px 5px;border:1px solid #bdc3c7;text-align:center;font-size:10px">`);
  const title = document.querySelector('.stmt-title')?.textContent || 'بيان الفرع';
  const full = `<html dir="rtl"><head><meta charset="utf-8"></head><body>
    <table style="width:100%;margin-bottom:8px"><tr><td style="text-align:center;font-size:16px;font-weight:700;color:#2c3e50;border:none">${title}</td></tr></table>
    ${html}
    <table style="width:100%;margin-top:10px"><tr><td style="text-align:center;font-size:10px;color:#95a5a6;border:none">إعداد و برمجة محمد ندا 01068880999</td></tr></table></body></html>`;
  downloadBlob(new Blob(['\ufeff' + full], { type: 'application/octet-stream' }), 'branch-statement-' + fmtCairoDate('date') + '.xls');
}

function branchExportPdf() {
  const table = document.querySelector('#branchStmtReport table');
  if (!table) return;
  const title = document.querySelector('.stmt-title')?.textContent || 'بيان الفرع';
  let html = table.outerHTML;
  html = html.replace(/<table/g, '<table style="border-collapse:collapse;width:100%;font-family:\'Traditional Arabic\',Arial;font-size:11px"');
  html = html.replace(/<th(?!\s)/g, '<th style="background:#2c3e50;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #1a252f;text-align:center"');
  html = html.replace(/<th\s+([^>]*)>/g, (m, a) => `<th ${a} style="background:#2c3e50;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #1a252f;text-align:center">`);
  html = html.replace(/<td(?!\s)/g, '<td style="padding:3px 5px;border:1px solid #ccc;text-align:center;font-size:11px"');
  html = html.replace(/<td\s+([^>]*)>/g, (m, a) => `<td ${a} style="padding:3px 5px;border:1px solid #ccc;text-align:center;font-size:11px">`);
  const bodyHtml = `<div style="text-align:center;margin-bottom:8px"><h2 style="color:#2c3e50;margin:0 0 2px;font-size:15px">${title}</h2></div>
    ${html}
    <div style="text-align:center;margin-top:10px;font-size:10px;color:#888">إعداد و برمجة محمد ندا 01068880999</div>`;
  downloadPdf(bodyHtml, 'branch-statement.pdf');
}

// ============== BLOOD CONSUMPTION (منصرف فصائل الدم) ==============

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

    const now = getCairoDate();
    const isLocked = now.getUTCDate() >= 25;
    // Default to current month
    const year = now.getUTCFullYear();
    const monthVal = now.getUTCMonth() + 1; // 1-indexed

    el.innerHTML = `<div class="page-actions"><button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> الرئيسية</button>
    </div>`;

    if (canEdit) {
      if (isLocked) {
        el.innerHTML += `<div style="background:#fff3cd;color:#856404;padding:10px 16px;border-radius:8px;margin-bottom:12px;font-size:13px;text-align:center"><i class="fas fa-lock"></i> التعديل مغلق بعد يوم 25 — يتم عرض بيانات الشهر السابق</div>`;
      }
      el.innerHTML += `<div class="card" style="margin-bottom:16px;border-right:4px solid #e91e63">
        <div class="card-header" style="padding:10px 16px"><strong><i class="fas fa-edit"></i> إدخال منصرف فصائل الدم</strong></div>
        <div class="card-body" style="padding:10px 16px">
          <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end">
            <div class="form-group"><label>السنة</label>
              <select class="form-control" id="bcYear" style="width:100px" data-change="loadExistingConsumption">${[2026,2025,2024,2023,2022].map(y => `<option value="${y}" ${y===year?'selected':''}>${y}</option>`).join('')}</select></div>
            <div class="form-group"><label>الشهر</label>
              <select class="form-control" id="bcMonth" style="width:120px" data-change="loadExistingConsumption">${months.map((m,i) => `<option value="${i+1}" ${i+1===monthVal?'selected':''}>${m}</option>`).join('')}</select></div>
            ${isHospital 
              ? `<div class="form-group" style="min-width:200px"><label>بنك الدم</label><div style="padding:6px 0;font-weight:600">${user.name}</div></div>`
              : `<div class="form-group" style="flex:1;min-width:200px"><label>بنك الدم</label>
                  <select class="form-control" id="bcHosp" data-change="loadExistingConsumption">${filteredHospitals.map(h => `<option value="${h.id}">${h.name}</option>`).join('')}</select></div>`
            }
            ${['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(t => 
              `<div style="width:65px"><label style="font-size:11px;font-weight:600">${t}</label>
              <input class="form-control bc-inp" id="bc${t.replace('+','P').replace('-','N')}" type="number" style="height:32px;font-size:12px;text-align:center"></div>`
            ).join('')}
            <button class="btn btn-primary" data-click="saveBloodConsumption" style="height:32px"><i class="fas fa-save"></i> حفظ</button>
          </div>
        </div>
      </div>`;
    }

    el.innerHTML += `<div class="card"><div class="card-body table-scroll">
      <table class="data-table consumption-table"><thead>
        <tr><th colspan="15" style="text-align:center;background:#e91e63;color:#fff;font-size:14px">معدل إستهلاك الفصائل ببنوك دم هيئة الرعاية الصحية</th></tr>
        <tr><th>الفرع</th><th>اسم بنك الدم</th><th>الشهر</th>
          ${['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(t => `<th>${t}</th>`).join('')}
          <th>المجموع</th><th>المدخل</th>${canDelete ? '<th></th>' : ''}</tr>
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
      body.innerHTML = '<tr><td colspan="' + (canDelete ? 15 : 14) + '" class="empty-msg">لا توجد بيانات</td></tr>';
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
          <td style="text-align:center;font-size:12px">${r.entered_by || ''}</td>
          ${canDelete ? `<td><button class="btn btn-sm btn-outline" data-click="deleteBloodConsumption" data-args="${r.id}" style="color:#dc3545"><i class="fas fa-trash"></i></button></td>` : ''}
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
  const saveBtn = document.querySelector('button[data-click="saveBloodConsumption"]');
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
    if (dup) {
      showConfirmModal('⚠ تم إدخال بيانات هذا الشهر مسبقاً!\n\nهل تريد تعديل البيانات؟ اضغط OK للتعديل، أو إلغاء للرجوع.', async function() {
        await api('POST', '/monthly-consumption', { hospitalId, year, month, bloodTypes });
        showToast('✅ تم تعديل البيانات بنجاح');
        renderBloodConsumption();
      });
      return;
    }
    await api('POST', '/monthly-consumption', { hospitalId, year, month, bloodTypes });
    showToast('✅ تم حفظ البيانات بنجاح');
    renderBloodConsumption();
  } catch (e) { showToast('❌ '+e.message); }
}

async function deleteBloodConsumption(id) {
  showConfirmModal('هل أنت متأكد من حذف هذا السجل؟', async function() {
    try { await api('DELETE', '/monthly-consumption/' + id); renderBloodConsumption(); }
    catch (e) { showToast('❌ '+e.message); }
  });
}

const MONTHS_AR = ['يناير','فبراير','مارس','ابريل','مايو','يونيو','يوليو','اغسطس','سبتمبر','اكتوبر','نوفمبر','ديسمبر'];

async function renderEmployeeStatement() {
  const el = document.getElementById('mainContent');
  const canAdd = hasPerm('employees', 'add');
  const canEdit = hasPerm('employees', 'edit');
  const canDelete = hasPerm('employees', 'delete');
  el.innerHTML = `<div class="page-actions"><button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> رجوع</button>
    ${canAdd ? `<button class="btn btn-info" data-click="empShowAddModal" style="height:32px"><i class="fas fa-plus"></i> إضافة موظف</button>` : ''}
    ${window._user?.role === 'admin' ? `<button class="btn btn-warning" data-click="toggleEmpInlineEdit" id="empInlineEditBtn" style="height:32px"><i class="fas fa-pen"></i> فتح التعديل</button><button class="btn btn-success" data-click="empInlineSave" id="empInlineSaveBtn" style="height:32px;display:none"><i class="fas fa-save"></i> حفظ التعديلات</button>` : ''}
    <button class="btn btn-danger" data-click="exportEmployeePDF" style="height:32px"><i class="fas fa-file-pdf"></i> تحميل PDF</button>
    <button class="btn btn-success" data-click="exportEmployeeExcel" style="height:32px"><i class="fas fa-file-excel"></i> تحميل Excel</button>
  </div>
  <div class="page-title"><i class="fas fa-users" style="color:#795548"></i> بيان العاملين</div>
  <div id="empLoading" style="text-align:center;padding:40px;color:#999"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>
  <div id="empContent"></div>`;
  try {
    const res = await api('GET', '/employee-statements');
    let { rows: data, hospitalStatus } = res;
    const userHospitalId = window.me?.user?.hospitalId;
    const userGovEmp = window.me?.user?.governorate;
    const userRoleEmp = window.me?.user?.role;
    // If hospital or hospital_manager role, filter to their own hospital
    if ((userRoleEmp === 'hospital' || userRoleEmp === 'hospital_manager') && userHospitalId) {
      data = data.filter(d => d.hospital_id === userHospitalId);
      hospitalStatus = hospitalStatus.filter(h => h.id === userHospitalId);
    }
    if ((userRoleEmp === 'branch_supervisor' || userRoleEmp === 'visitor') && userGovEmp) {
      data = data.filter(d => d.governorate === userGovEmp);
      hospitalStatus = hospitalStatus.filter(h => h.governorate === userGovEmp);
    }
    // Check monthly updates
    const now = getCairoDate();
    const curMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
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
        <div class="card-body" style="padding:10px 14px;font-size:13px;color:#e65100;cursor:pointer" data-click="toggleMissingData">
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
    <!-- Hospital Review Section -->
    <div class="card" style="margin-bottom:12px">
      <div class="card-header" style="padding:10px 16px"><strong><i class="fas fa-check-double"></i> حالة المراجعة حسب المستشفى</strong></div>
      <div class="card-body" style="padding:8px 12px">
        ${(() => {
          const cd = getCairoDate(); const curMonth = cd.getUTCFullYear() * 100 + cd.getUTCMonth() + 1;
          const byHosp = {};
          data.forEach(d => {
            const key = d.hospital_id;
            if (key == null) return;
            if (!byHosp[key]) byHosp[key] = { name: d.hospital_name, gov: d.governorate, employees: [] };
            byHosp[key].employees.push(d);
          });
          const hospIds = Object.keys(byHosp).sort((a, b) => (byHosp[a].gov||'').localeCompare(byHosp[b].gov||''));
          const hospRows = hospIds.map(id => {
            const h = byHosp[id];
            const total = h.employees.length;
            const reviewed = h.employees.filter(e => e.reviewed && e.review_month === curMonth).length;
            const allReviewed = reviewed === total;
            if (allReviewed) return '';
            return `<tr>
              <td>${h.gov||''}</td>
              <td><strong>${h.name||''}</strong></td>
              <td style="text-align:center">${total}</td>
              <td style="text-align:center;color:#dc3545">${reviewed}/${total}</td>
              ${canEdit ? `<td><button class="btn btn-sm btn-outline" data-click="empReviewHospital" data-args="${id}" style="color:#1976d2;font-size:10px"><i class="fas fa-check-double"></i> مراجعة الكل</button></td>` : ''}
            </tr>`;
          }).filter(r => r).join('');
          return hospRows ? `<table class="data-table" style="font-size:12px">
            <thead><tr style="background:#f5f5f5">
              <th>الفرع</th><th>بنك الدم</th><th>العدد</th><th>تمت المراجعة</th>${canEdit ? '<th></th>' : ''}
            </tr></thead>
            <tbody>${hospRows}</tbody>
          </table>` : '<div style="text-align:center;padding:16px;color:#2e7d32;font-size:13px"><i class="fas fa-check-circle"></i> تمت مراجعة جميع المستشفيات</div>';
        })()}
      </div>
    </div>
    <!-- Branch Supervisor Table -->
    <div class="card" style="margin-bottom:12px">
      <div class="card-header" style="padding:10px 16px;background:#e8f5e9;cursor:pointer" data-click="toggleSupSection">
        <strong><i class="fas fa-user-shield"></i> بيانات مشرفي الفروع <span id="supSectionIcon" style="font-size:11px;margin-right:8px"><i class="fas fa-chevron-up"></i></span></strong>
      </div>
      <div id="supSectionBody" class="card-body" style="padding:8px 12px">
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:8px">
          <input id="supSearch" type="text" placeholder="🔍 بحث بالاسم..." data-input="applySupFilter" style="padding:4px 8px;border:1px solid #ccc;border-radius:6px;font-size:12px;flex:1;min-width:120px">
          <select id="supFilterGov" data-change="applySupFilter" style="padding:4px 8px;border:1px solid #ccc;border-radius:6px;font-size:12px">
            <option value="">كل الفروع</option>
            ${govs.map(g => `<option value="${g}">${g}</option>`).join('')}
          </select>
          ${canAdd ? `<button class="btn btn-info" data-click="showAddSupInEmpPage" style="height:32px"><i class="fas fa-plus"></i> إضافة مشرف فرع</button>` : ''}
        </div>
        ${branchSupMissingData ? `
        <div class="card" style="margin-bottom:8px;border-right:4px solid #ff9800;background:#fff8e1">
          <div class="card-body" style="padding:8px 12px;font-size:12px;color:#e65100;cursor:pointer" data-click="toggleSupMissingData">
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
          <select id="empFilterGov" data-change="empFilterGovChanged" style="padding:4px 8px;border:1px solid #ccc;border-radius:6px;font-size:12px"><option value="">كل الفروع</option>${govs.map(g => `<option value="${g}">${g}</option>`).join('')}</select>
          <select id="empFilterHosp" data-change="applyEmpFilter" style="padding:4px 8px;border:1px solid #ccc;border-radius:6px;font-size:12px"><option value="">كل بنوك الدم</option>${hospNames.map(h => `<option value="${h}">${h}</option>`).join('')}</select>
          <select id="empFilterCat" data-change="applyEmpFilter" style="padding:4px 8px;border:1px solid #ccc;border-radius:6px;font-size:12px"><option value="">كل الفئات</option>${allCats.map(c => `<option value="${c}">${c}</option>`).join('')}</select>
          <select id="empFilterClass" data-change="applyEmpFilter" style="padding:4px 8px;border:1px solid #ccc;border-radius:6px;font-size:12px"><option value="">كل التصنيفات</option>${allClasses.map(c => `<option value="${c}">${c}</option>`).join('')}</select>
          <input type="text" id="empSearch" placeholder="بحث بالاسم أو الرقم القومي..." data-input="applyEmpFilter" style="padding:4px 8px;border:1px solid #ccc;border-radius:6px;font-size:12px;flex:1;min-width:150px">
        </div>
      </div>
    </div>
    <div class="card" style="margin-bottom:12px"><div class="card-body" style="padding:0">
      <div class="table-scroll"><table class="data-table" id="empTable" style="font-size:12px">
        <thead><tr style="background:#f5f5f5">
          <th>#</th><th>العاملين</th><th>الفئه</th><th>التصنيف</th><th>الرقم القومي</th><th>التليفون</th><th>البريد الالكتروني</th>${canEdit||canDelete?'<th>إجراءات</th>':''}
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
    applySupFilter();
    applyEmpFilter();
  } catch (e) {
    document.getElementById('empLoading').innerHTML = `<span style="color:#dc3545"><i class="fas fa-exclamation-circle"></i> ${sanitize(e.message)}</span>`;
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
        <select id="supAddGov" class="modal-input" style="width:100%" data-change="supGovChanged">
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
      <button class="btn btn-primary" data-click="doAddSupInEmpPage"><i class="fas fa-save"></i> حفظ</button>
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
    if (!govHospitals.length) { showToast('❌ يوجد بنوك دم في هذا الفرع'); return; }
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
        <select id="supEditGov" class="modal-input" style="width:100%" data-change="supEditGovChanged">
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
      <button class="btn btn-primary" data-click="doEditSupInEmpPage" data-args="${id}"><i class="fas fa-save"></i> حفظ</button>
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
    if (!hospitalId) { showToast('❌ يوجد بنوك دم في هذا الفرع'); return; }
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
  showConfirmModal('هل أنت متأكد من حذف مشرف الفرع؟', function() {
    empDeleteRecord(id);
  });
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
  if (!filtered.length) { tbody.innerHTML = `<tr><td colspan="${canEditDel ? 9 : 8}" style="text-align:center;padding:10px;color:#999">يوجد مشرفين لهذا الفرع</td></tr>`; return; }
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
      <button class="btn btn-sm btn-outline" data-click="showEditSupInEmpPage" data-args="${s.id}" style="color:#1976d2;font-size:10px;margin:1px" title="تعديل"><i class="fas fa-edit"></i></button>
      <button class="btn btn-sm btn-outline" data-click="showDeleteSupInEmpPage" data-args="${s.id}" style="color:#dc3545;font-size:10px;margin:1px" title="حذف"><i class="fas fa-trash"></i></button>
    </td>` : ''}
  </tr>`).join('');
}

function applyEmpFilter() {
  const curMonth = curMonthCairo();
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
  const colSpan = canEdit||canDelete ? 8 : 7;
  if (!filtered.length) { tbody.innerHTML = `<tr><td colspan="${colSpan}" style="text-align:center;padding:20px;color:#999">لا توجد نتائج</td></tr>`; return; }
  // Group by governorate → hospital
  const groups = {};
  filtered.forEach(d => {
    const gk = d.governorate || 'أخرى';
    const hk = d.hospital_name || 'غير معروف';
    if (!groups[gk]) groups[gk] = {};
    if (!groups[gk][hk]) groups[gk][hk] = [];
    groups[gk][hk].push(d);
  });
  const govKeys = Object.keys(groups).sort((a,b) => a.localeCompare(b, 'ar'));
  let html = '', idx = 0;
  govKeys.forEach(g => {
    const hospKeys = Object.keys(groups[g]).sort((a,b) => a.localeCompare(b, 'ar'));
    const totalEmps = hospKeys.reduce((s,k) => s + groups[g][k].length, 0);
    html += `<tr style="background:#e3f2fd;font-weight:700"><td colspan="${colSpan}" style="padding:5px 8px;font-size:12px;color:#1565c0">
      <i class="fas fa-map-marker-alt" style="margin-left:4px"></i> محافظة ${esc(g)}
      <span style="background:#1565c0;color:#fff;border-radius:10px;padding:1px 6px;font-size:9px;margin-right:6px">${totalEmps}</span>
    </td></tr>`;
    hospKeys.forEach(h => {
      const emps = groups[g][h];
      let empRows = '';
      emps.forEach(d => {
        idx++;
        empRows += `<tr${idx%2?' style="background:#fafafa"':''} data-id="${d.id}">
          <td>${idx}</td>
          <td><strong>${esc(d.employee)}</strong></td>
          <td>${esc(d.category)}</td>
          <td>${esc(d.classification)}</td>
          <td style="direction:ltr;font-family:monospace">${esc(d.national_id||'')}</td>
          <td style="direction:ltr">${esc(d.phone||'')}</td>
          <td style="direction:ltr;font-size:11px">${esc(d.email||'')}</td>
          ${canEdit||canDelete ? `<td style="white-space:nowrap">
            ${canEdit ? `<button class="btn btn-sm btn-outline" data-click="empShowEditModal" data-args="${d.id}" style="color:#1976d2;font-size:10px;margin:1px"><i class="fas fa-edit"></i></button>` : ''}
            ${canDelete ? `<button class="btn btn-sm btn-outline" data-click="empDeleteRecord" data-args="${d.id}" style="color:#dc3545;font-size:10px;margin:1px"><i class="fas fa-trash"></i></button>` : ''}
          </td>` : ''}
        </tr>`;
      });
      html += `<tr style="background:#fff8e1;font-weight:600"><td colspan="${colSpan}" style="padding:3px 8px 3px 20px;font-size:11px;color:#e65100">
        <i class="fas fa-hospital" style="margin-left:4px"></i> ${esc(h)}
        <span style="background:#e65100;color:#fff;border-radius:10px;padding:0 5px;font-size:8px;margin-right:6px">${emps.length}</span>
      </td></tr>${empRows}`;
    });
  });
  tbody.innerHTML = html;
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

async function printEmployeeTable() {
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

  // Group by governorate → hospital
  const pg = {};
  filtered.forEach(d => {
    const gk = d.governorate || 'أخرى';
    const hk = d.hospital_name || 'غير معروف';
    if (!pg[gk]) pg[gk] = {};
    if (!pg[gk][hk]) pg[gk][hk] = [];
    pg[gk][hk].push(d);
  });
  const pgKeys = Object.keys(pg).sort((a,b) => a.localeCompare(b, 'ar'));
  let pi = 0;
  pgKeys.forEach(g => {
    const phKeys = Object.keys(pg[g]).sort((a,b) => a.localeCompare(b, 'ar'));
    html += `<tr style="background:#e3f2fd;font-weight:700"><td colspan="7" style="padding:6px 8px;font-size:13px;color:#1565c0">
      <i class="fas fa-map-marker-alt"></i> محافظة ${g}
      <span style="background:#1565c0;color:#fff;border-radius:10px;padding:1px 6px;font-size:9px;margin-right:6px">${phKeys.reduce((s,k) => s + pg[g][k].length, 0)}</span>
    </td></tr>`;
    phKeys.forEach(h => {
      const emps = pg[g][h];
      html += `<tr style="background:#fff8e1;font-weight:600"><td colspan="7" style="padding:3px 8px 3px 20px;font-size:12px;color:#e65100">
        <i class="fas fa-hospital"></i> ${h}
        <span style="background:#e65100;color:#fff;border-radius:10px;padding:0 5px;font-size:8px;margin-right:6px">${emps.length}</span>
      </td></tr>`;
      emps.forEach(d => {
        pi++;
        html += `<tr>
          <td>${pi}</td>
          <td><strong>${d.employee || ''}</strong></td>
          <td>${d.category || ''}</td>
          <td>${d.classification || ''}</td>
          <td style="direction:ltr;font-family:monospace">${d.national_id || ''}</td>
          <td style="direction:ltr">${d.phone || ''}</td>
          <td style="direction:ltr;font-size:10px">${d.email || ''}</td>
        </tr>`;
      });
    });
  });
  
  html += `
    </tbody>
  </table>
  <div style="text-align:center;margin-top:15px;font-size:10px;color:#888">إعداد و برمجة محمد ندا 01068880999</div>
  <div class="no-print" style="margin-top:20px;text-align:center">
    <button data-click="windowPrint" style="padding:10px 20px;background:#795548;color:white;border:none;border-radius:4px;cursor:pointer;font-size:14px">
      <i class="fas fa-print"></i> طباعة / حفظ PDF
    </button>
    <button data-click="downloadExcel" style="padding:10px 20px;background:#28a745;color:white;border:none;border-radius:4px;cursor:pointer;font-size:14px;margin-right:10px">
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
      const blob = new Blob([csv], { type: 'application/octet-stream' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'بيان_العاملين_' + new Date().toISOString().slice(0,10) + '.csv';
      a.style.display = 'none';
      document.body.appendChild(a); a.click();
      setTimeout(function() {
        if (/Mobi|iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
          window.open(a.href, '_blank');
        }
        document.body.removeChild(a);
      }, 400);
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
  const branchName = gov || 'جميع الفروع';
  const hospitalName = hosp || 'جميع بنوك الدم';
  // Group by governorate → hospital
  const egroups = {};
  filtered.forEach(d => {
    const gk = d.governorate || 'أخرى'; const hk = d.hospital_name || 'غير معروف';
    if (!egroups[gk]) egroups[gk] = {};
    if (!egroups[gk][hk]) egroups[gk][hk] = [];
    egroups[gk][hk].push(d);
  });
  const egKeys = Object.keys(egroups).sort((a,b) => a.localeCompare(b, 'ar'));
  let ei = 0, eRows = '';
  const escExcel = v => (v || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  egKeys.forEach(g => {
    const ehKeys = Object.keys(egroups[g]).sort((a,b) => a.localeCompare(b, 'ar'));
    eRows += `<tr style="background:#e3f2fd"><td colspan="7" style="padding:5px 8px;border:1px solid #bdc3c7;font-size:11px;font-weight:700;color:#1565c0;text-align:right">
      📍 محافظة ${escExcel(g)}
      <span style="background:#1565c0;color:#fff;border-radius:10px;padding:0 6px;font-size:9px;margin-right:6px">${ehKeys.reduce((s,k) => s + egroups[g][k].length, 0)}</span>
    </td></tr>`;
    ehKeys.forEach(h => {
      const emps = egroups[g][h];
      eRows += `<tr style="background:#fff8e1"><td colspan="7" style="padding:3px 8px 3px 20px;border:1px solid #bdc3c7;font-size:10px;font-weight:600;color:#e65100;text-align:right">
        🏥 ${escExcel(h)}
        <span style="background:#e65100;color:#fff;border-radius:10px;padding:0 4px;font-size:8px;margin-right:6px">${emps.length}</span>
      </td></tr>`;
      emps.forEach(d => {
        ei++;
        eRows += `<tr>
          <td style="padding:4px 6px;border:1px solid #bdc3c7;text-align:center;font-size:10px">${ei}</td>
          <td style="padding:4px 6px;border:1px solid #bdc3c7;text-align:center;font-size:10px">${escExcel(d.employee)}</td>
          <td style="padding:4px 6px;border:1px solid #bdc3c7;text-align:center;font-size:10px">${escExcel(d.category)}</td>
          <td style="padding:4px 6px;border:1px solid #bdc3c7;text-align:center;font-size:10px">${escExcel(d.classification)}</td>
          <td style="padding:4px 6px;border:1px solid #bdc3c7;text-align:center;font-size:10px;direction:ltr">${escExcel(d.national_id)}</td>
          <td style="padding:4px 6px;border:1px solid #bdc3c7;text-align:center;font-size:10px;direction:ltr">${escExcel(d.phone)}</td>
          <td style="padding:4px 6px;border:1px solid #bdc3c7;text-align:center;font-size:10px;direction:ltr">${escExcel(d.email)}</td>
        </tr>`;
      });
    });
  });
  const dateStr = new Date().toLocaleDateString('ar-EG');
  const full = `<html dir="rtl"><head><meta charset="utf-8"></head><body>
    <table style="width:100%;margin-bottom:8px"><tr><td style="text-align:center;font-size:16px;font-weight:700;color:#795548;border:none">بيان العاملين ببنوك الدم</td></tr>
      <tr><td style="text-align:center;font-size:11px;color:#7f8c8d;border:none">${dateStr} | ${branchName} | ${hospitalName}</td></tr></table>
    <table style="border-collapse:collapse;width:100%;font-family:'Segoe UI',Arial;font-size:10px">
      <thead><tr>
        <th style="background:#795548;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #5d4037;text-align:center;white-space:nowrap">م</th>
        <th style="background:#795548;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #5d4037;text-align:center;white-space:nowrap">الموظف</th>
        <th style="background:#795548;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #5d4037;text-align:center;white-space:nowrap">الفئه</th>
        <th style="background:#795548;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #5d4037;text-align:center;white-space:nowrap">التصنيف</th>
        <th style="background:#795548;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #5d4037;text-align:center;white-space:nowrap">الرقم القومي</th>
        <th style="background:#795548;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #5d4037;text-align:center;white-space:nowrap">التليفون</th>
        <th style="background:#795548;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #5d4037;text-align:center;white-space:nowrap">البريد</th>
      </tr></thead>
      <tbody>${eRows}</tbody></table>
    <table style="width:100%;margin-top:10px"><tr><td style="text-align:center;font-size:10px;color:#95a5a6;border:none">إعداد و برمجة محمد ندا 01068880999</td></tr></table></body></html>`;
  downloadBlob(new Blob(['\ufeff' + full], { type: 'application/octet-stream' }), 'بيان_العاملين.xls');
  showToast('✅ تم التحميل');
}

function exportEmployeePDF() {
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
  const branchName = gov || 'جميع الفروع';
  const hospitalName = hosp || 'جميع بنوك الدم';
  const dateStr = new Date().toLocaleDateString('ar-EG');
  // Group by governorate → hospital
  const pgroups = {};
  filtered.forEach(d => {
    const gk = d.governorate || 'أخرى'; const hk = d.hospital_name || 'غير معروف';
    if (!pgroups[gk]) pgroups[gk] = {};
    if (!pgroups[gk][hk]) pgroups[gk][hk] = [];
    pgroups[gk][hk].push(d);
  });
  const pgKeys = Object.keys(pgroups).sort((a,b) => a.localeCompare(b, 'ar'));
  let pi = 0, pRows = '';
  pgKeys.forEach(g => {
    const phKeys = Object.keys(pgroups[g]).sort((a,b) => a.localeCompare(b, 'ar'));
    pRows += `<tr style="background:#e3f2fd"><td colspan="7" style="padding:5px 8px;border:1px solid #bdc3c7;font-size:11px;font-weight:700;color:#1565c0;text-align:right">📍 محافظة ${g} <span style="background:#1565c0;color:#fff;border-radius:10px;padding:0 6px;font-size:9px;margin-right:6px">${phKeys.reduce((s,k) => s + pgroups[g][k].length, 0)}</span></td></tr>`;
    phKeys.forEach(h => {
      const emps = pgroups[g][h];
      pRows += `<tr style="background:#fff8e1"><td colspan="7" style="padding:3px 8px 3px 20px;border:1px solid #bdc3c7;font-size:10px;font-weight:600;color:#e65100;text-align:right">🏥 ${h} <span style="background:#e65100;color:#fff;border-radius:10px;padding:0 4px;font-size:8px;margin-right:6px">${emps.length}</span></td></tr>`;
      emps.forEach(d => {
        pi++;
        pRows += `<tr>
          <td style="padding:4px 6px;border:1px solid #bdc3c7;text-align:center;font-size:10px">${pi}</td>
          <td style="padding:4px 6px;border:1px solid #bdc3c7;text-align:center;font-size:10px">${d.employee||''}</td>
          <td style="padding:4px 6px;border:1px solid #bdc3c7;text-align:center;font-size:10px">${d.category||''}</td>
          <td style="padding:4px 6px;border:1px solid #bdc3c7;text-align:center;font-size:10px">${d.classification||''}</td>
          <td style="padding:4px 6px;border:1px solid #bdc3c7;text-align:center;font-size:10px;direction:ltr">${d.national_id||''}</td>
          <td style="padding:4px 6px;border:1px solid #bdc3c7;text-align:center;font-size:10px;direction:ltr">${d.phone||''}</td>
          <td style="padding:4px 6px;border:1px solid #bdc3c7;text-align:center;font-size:10px;direction:ltr">${d.email||''}</td>
        </tr>`;
      });
    });
  });
  const bodyHtml = `<div style="text-align:center;margin-bottom:12px">
    <h2 style="color:#795548;margin:0 0 3px 0;font-size:18px">بيان العاملين ببنوك الدم</h2>
    <p style="color:#666;margin:0;font-size:12px">${dateStr} | ${branchName} | ${hospitalName}</p></div>
    <table style="border-collapse:collapse;width:100%;font-family:'Segoe UI',Arial;font-size:10px">
      <thead><tr>
        <th style="background:#795548;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #5d4037;text-align:center;white-space:nowrap">م</th>
        <th style="background:#795548;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #5d4037;text-align:center;white-space:nowrap">الموظف</th>
        <th style="background:#795548;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #5d4037;text-align:center;white-space:nowrap">الفئه</th>
        <th style="background:#795548;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #5d4037;text-align:center;white-space:nowrap">التصنيف</th>
        <th style="background:#795548;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #5d4037;text-align:center;white-space:nowrap">الرقم القومي</th>
        <th style="background:#795548;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #5d4037;text-align:center;white-space:nowrap">التليفون</th>
        <th style="background:#795548;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #5d4037;text-align:center;white-space:nowrap">البريد</th>
      </tr></thead>
      <tbody>${pRows}</tbody></table>
    <div style="text-align:center;margin-top:10px;font-size:10px;color:#888">إعداد و برمجة محمد ندا 01068880999</div>`;
  downloadPdf(bodyHtml, 'بيان_العاملين.pdf');
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
        <select id="empAddGov" class="modal-input" style="width:100%" data-change="empGovChangedAdd" ${isHospital ? 'disabled' : ''}>
          <option value="">-- اختر الفرع --</option>
          ${govOptions}
        </select></div>
      <div style="grid-column:1/-1"><label style="font-size:12px;color:#666">بنك الدم</label>
        <select id="empAddHosp" class="modal-input" style="width:100%" ${isHospital ? 'disabled' : ''}>
          ${isHospital ? '<option value="' + userHospitalId + '" selected>' + (hospitals.find(h => h.id === userHospitalId)?.name || '') + '</option>' : '<option value="">-- اختر الفرع أولاً --</option>'}
        </select></div>
      <div><label style="font-size:12px;color:#666">الاسم</label><input id="empAddName" class="modal-input" style="width:100%"></div>
      <div><label style="font-size:12px;color:#666">الفئه</label><select id="empAddCat" class="modal-input" style="width:100%"><option value="">-- اختر --</option>${['مشرف فرع','مدير بنك','استشاري','اخصائي','طبيب مقيم','كميائي','اخصائي تكنولوجي','اخصائي مختبرات طبيه','فني','تمريض','اداري'].map(c => `<option value="${c}" ${defaultCategory === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
      <div><label style="font-size:12px;color:#666">التصنيف</label><select id="empAddClass" class="modal-input" style="width:100%"><option value="">-- اختر --</option><option value="تعاقد">تعاقد</option><option value="اساسي">اساسي</option><option value="منتدب">منتدب</option></select></div>
      <div><label style="font-size:12px;color:#666">الرقم القومي</label><input id="empAddNid" class="modal-input" style="width:100%"></div>
      <div><label style="font-size:12px;color:#666">التليفون</label><input id="empAddPhone" class="modal-input" style="width:100%"></div>
      <div><label style="font-size:12px;color:#666">البريد الالكتروني</label><input id="empAddEmail" class="modal-input" style="width:100%"></div>
    </div>
    <div style="margin-top:12px;text-align:left">
      <button class="btn btn-primary" data-click="empDoAdd"><i class="fas fa-save"></i> حفظ</button>
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
        <select id="empEditGov" class="modal-input" style="width:100%" data-change="empGovChangedEdit">
          <option value="">-- اختر الفرع --</option>
          ${govOptions}
        </select></div>
      <div style="grid-column:1/-1"><label style="font-size:12px;color:#666">بنك الدم</label>
        <select id="empEditHosp" class="modal-input" style="width:100%">
          <option value="">-- اختر بنك الدم --</option>
          ${hospOptions}
        </select></div>
      <div><label style="font-size:12px;color:#666">الاسم</label><input id="empEditName" class="modal-input" style="width:100%" value="${String(rec.employee||'').replace(/"/g,'&quot;')}"></div>
      <div><label style="font-size:12px;color:#666">الفئه</label><select id="empEditCat" class="modal-input" style="width:100%"><option value="">-- اختر --</option><option value="مشرف فرع" ${rec.category==='مشرف فرع'?'selected':''}>مشرف فرع</option><option value="مدير بنك" ${rec.category==='مدير بنك'?'selected':''}>مدير بنك</option><option value="استشاري" ${rec.category==='استشاري'?'selected':''}>استشاري</option><option value="اخصائي" ${rec.category==='اخصائي'?'selected':''}>اخصائي</option><option value="طبيب مقيم" ${rec.category==='طبيب مقيم'?'selected':''}>طبيب مقيم</option><option value="كميائي" ${rec.category==='كميائي'?'selected':''}>كميائي</option><option value="اخصائي تكنولوجي" ${rec.category==='اخصائي تكنولوجي'?'selected':''}>اخصائي تكنولوجي</option><option value="اخصائي مختبرات طبيه" ${rec.category==='اخصائي مختبرات طبيه'?'selected':''}>اخصائي مختبرات طبيه</option><option value="فني" ${rec.category==='فني'?'selected':''}>فني</option><option value="تمريض" ${rec.category==='تمريض'?'selected':''}>تمريض</option><option value="اداري" ${rec.category==='اداري'?'selected':''}>اداري</option></select></div>
      <div><label style="font-size:12px;color:#666">التصنيف</label><select id="empEditClass" class="modal-input" style="width:100%"><option value="">-- اختر --</option><option value="تعاقد" ${rec.classification==='تعاقد'?'selected':''}>تعاقد</option><option value="اساسي" ${rec.classification==='اساسي'?'selected':''}>اساسي</option><option value="منتدب" ${rec.classification==='منتدب'?'selected':''}>منتدب</option></select></div>
      <div><label style="font-size:12px;color:#666">الرقم القومي</label><input id="empEditNid" class="modal-input" style="width:100%" value="${String(rec.national_id||'').replace(/"/g,'&quot;')}"></div>
      <div><label style="font-size:12px;color:#666">التليفون</label><input id="empEditPhone" class="modal-input" style="width:100%" value="${String(rec.phone||'').replace(/"/g,'&quot;')}"></div>
      <div><label style="font-size:12px;color:#666">البريد الالكتروني</label><input id="empEditEmail" class="modal-input" style="width:100%" value="${String(rec.email||'').replace(/"/g,'&quot;')}"></div>
    </div>
    <div style="margin-top:12px;text-align:left">
      <button class="btn btn-primary" data-click="empDoEdit" data-args="${id}"><i class="fas fa-save"></i> حفظ</button>
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
  showConfirmModal('هل أنت متأكد من حذف هذا الموظف؟', async function() {
    try {
      await api('DELETE', '/employee-statements/' + id);
      showToast('✅ تم الحذف');
      renderEmployeeStatement();
    } catch (e) { showToast('❌ ' + e.message); }
  });
}

let _empInlineEdit = false;

function toggleEmpInlineEdit() {
  _empInlineEdit = !_empInlineEdit;
  const btn = document.getElementById('empInlineEditBtn');
  const saveBtn = document.getElementById('empInlineSaveBtn');
  if (!btn) return;
  if (_empInlineEdit) {
    btn.innerHTML = '<i class="fas fa-lock"></i> قفل التعديل';
    btn.className = 'btn btn-secondary';
    if (saveBtn) saveBtn.style.display = '';
    document.querySelectorAll('#empTbody tr').forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 9) return;
      [1,2,3,4,5,6,7,8].forEach(idx => {
        if (cells[idx]) {
          cells[idx].contentEditable = true;
          cells[idx].style.background = '#fff9c4';
          cells[idx].style.outline = '2px solid #f9a825';
          cells[idx].style.borderRadius = '3px';
        }
      });
    });
  } else {
    btn.innerHTML = '<i class="fas fa-pen"></i> فتح التعديل';
    btn.className = 'btn btn-warning';
    if (saveBtn) saveBtn.style.display = 'none';
    document.querySelectorAll('#empTbody tr').forEach(row => {
      const cells = row.querySelectorAll('td');
      [1,2,3,4,5,6,7,8].forEach(idx => {
        if (cells[idx]) {
          cells[idx].contentEditable = false;
          cells[idx].style.background = '';
          cells[idx].style.outline = '';
          cells[idx].style.borderRadius = '';
        }
      });
    });
  }
}

async function empInlineSave() {
  const data = window._empData || [];
  const rows = document.querySelectorAll('#empTbody tr[data-id]');
  const hospitals = await api('GET', '/hospitals');
  const changes = [];
  for (const row of rows) {
    const id = parseInt(row.getAttribute('data-id'));
    const rec = data.find(r => r.id === id);
    if (!rec) continue;
    const cells = row.querySelectorAll('td');
    if (cells.length < 9) continue;
    const newGov = cells[1].textContent.trim();
    const newHosp = cells[2].textContent.trim();
    const newName = cells[3].textContent.trim();
    const newCat = cells[4].textContent.trim();
    const newClass = cells[5].textContent.trim();
    const newNid = cells[6].textContent.trim();
    const newPhone = cells[7].textContent.trim();
    const newEmail = cells[8].textContent.trim();
    let newHospId = rec.hospital_id;
    if (newHosp !== (rec.hospital_name||'') || newGov !== (rec.governorate||'')) {
      const match = hospitals.find(h => h.name === newHosp && h.governorate === newGov);
      if (match) { newHospId = match.id; }
      else { showToast('⚠ لم يتم العثور على مستشفى "' + newHosp + '" في فرع "' + newGov + '" — تخطي'); continue; }
    }
    if (newName !== (rec.employee||'') || newCat !== (rec.category||'') || newClass !== (rec.classification||'') || newNid !== (rec.national_id||'') || newPhone !== (rec.phone||'') || newEmail !== (rec.email||'') || newHospId !== rec.hospital_id) {
      changes.push({ id: rec.id, hospital_id: newHospId, employee: newName, category: newCat, classification: newClass, national_id: newNid, phone: newPhone, email: newEmail });
    }
  }
  if (!changes.length) { showToast('⚠ لا توجد تغييرات'); return; }
  const changesCount = changes.length;
  showConfirmModal('هل أنت متأكد من حفظ ' + changesCount + ' تعديلات؟', async function() {
    try {
      for (const ch of changes) {
        await api('PUT', '/employee-statements/' + ch.id, ch);
      }
      showToast('✅ تم حفظ ' + changesCount + ' تعديل');
      toggleEmpInlineEdit();
      renderEmployeeStatement();
      if (window._empPendingReviewId) {
        const pendingId = window._empPendingReviewId;
        window._empPendingReviewId = null;
        empToggleReview(pendingId);
      }
    } catch (e) { showToast('❌ ' + e.message); }
  });
}

async function empToggleReview(id) {
  try {
  const data = window._empData || [];
  const rec = data.find(r => r.id === id);
  if (!rec) { showToast('❌ السجل غير موجود'); return; }
  const curMonth = curMonthCairo();
  const isReviewed = rec.reviewed && rec.review_month === curMonth;
  if (isReviewed) { showToast('ℹ️ تمت المراجعة مسبقاً — لا يمكن إلغاؤها'); return; }
  // Validate before marking as reviewed
  const errors = [];
  const name = (rec.employee||'').trim();
  if (!name) errors.push('الاسم ناقص');
  else { const nameParts = name.split(/\s+/); if (nameParts.length < 3) errors.push('الاسم يجب أن يكون ثلاثي (3 أسماء)'); }
  if (!rec.category) errors.push('الفئه ناقصة');
  if (!rec.classification) errors.push('التصنيف ناقص');
  const nid = String(rec.national_id||'').trim();
  if (!nid) errors.push('الرقم القومي ناقص');
  else if (!/^\d{14}$/.test(nid)) errors.push('الرقم القومي يجب أن يكون 14 رقم');
  // if (!rec.shift) errors.push('الوردية ناقصة'); // removed — no shift field in UI
  const phone = String(rec.phone||'').trim();
  if (!phone) errors.push('التليفون ناقص');
  if (errors.length) {
    window._empPendingReviewId = id;
    openModal('❌ لا يمكن المراجعة', `<div style="font-size:14px;line-height:2"><strong>الموظف: ${rec.employee}</strong><br>${errors.map(e => '• ' + e).join('<br>')}</div><div style="margin-top:12px;color:#888;font-size:12px">يرجى تصحيح البيانات من زر التعديل <i class="fas fa-edit"></i> ثم المحاولة مرة أخرى</div>`, () => {});
    return;
  }
  await api('PUT', '/employee-statements/' + id, { reviewed: true, review_month: curMonth });
  rec.reviewed = true; rec.review_month = curMonth;
  showToast('✅ تمت المراجعة');
  renderEmployeeStatement();
  checkAlerts();
  } catch(e) { showToast('❌ ' + e.message); }
}

async function empReviewHospital(hospId) {
  try {
  const data = window._empData || [];
  const curMonth = curMonthCairo();
  const employees = data.filter(d => d.hospital_id === hospId);
  if (!employees.length) { showToast('❌ لا يوجد موظفين لهذا المستشفى'); return; }
  const allReviewed = employees.every(e => e.reviewed && e.review_month === curMonth);
  if (allReviewed) { showToast('ℹ️ تمت المراجعة مسبقاً'); return; }
  const errorsList = [];
  employees.forEach(rec => {
    const errs = [];
    if (!(rec.employee||'').trim()) errs.push('الاسم ناقص');
    else { const parts = (rec.employee||'').trim().split(/\s+/); if (parts.length < 3) errs.push('الاسم يجب أن يكون ثلاثي'); }
    if (!rec.category) errs.push('الفئه ناقصة');
    if (!rec.classification) errs.push('التصنيف ناقص');
    const nid = String(rec.national_id||'').trim();
    if (!nid) errs.push('الرقم القومي ناقص');
    else if (!/^\d{14}$/.test(nid)) errs.push('الرقم القومي يجب أن يكون 14 رقم');
    const phone = String(rec.phone||'').trim();
    if (!phone) errs.push('التليفون ناقص');
    if (errs.length) errorsList.push({ name: rec.employee, errors: errs });
  });
  if (errorsList.length) {
    const body = errorsList.map(e => `<div style="margin-bottom:8px"><strong>${e.name}</strong><br>${e.errors.map(er => '• ' + er).join('<br>')}</div>`).join('<hr style="margin:6px 0">');
    openModal('❌ لا يمكن المراجعة — بيانات ناقصة', `<div style="font-size:13px;line-height:2">${body}</div><div style="margin-top:12px;color:#888;font-size:12px">يرجى تصحيح البيانات من زر التعديل <i class="fas fa-edit"></i> لكل موظف ثم المحاولة مرة أخرى</div>`, () => {});
    return;
  }
  for (const rec of employees) {
    if (rec.reviewed && rec.review_month === curMonth) continue;
    await api('PUT', '/employee-statements/' + rec.id, { reviewed: true, review_month: curMonth });
    rec.reviewed = true; rec.review_month = curMonth;
  }
  showToast('✅ تمت مراجعة ' + employees.length + ' موظف');
  renderEmployeeStatement();
  checkAlerts();
  } catch(e) { showToast('❌ ' + e.message); }
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
        <button class="btn btn-primary" data-click="doAddBranchSupervisor"><i class="fas fa-save"></i> حفظ</button>
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
    renderUsers();
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
      <button class="btn btn-primary" data-click="doEditSupervisorUser" data-args="${id}"><i class="fas fa-save"></i> حفظ</button>
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
    renderUsers();
  } catch (e) { showToast('❌ ' + e.message); }
}

async function deleteSupervisorUser(id) {
  showConfirmModal('هل أنت متأكد من حذف هذا المستخدم؟', async function() {
    try {
      await api('DELETE', '/users/' + id);
      showToast('✅ تم الحذف');
      renderUsers();
    } catch (e) { showToast('❌ ' + e.message); }
  });
}

async function renderArchive() {
  const el = document.getElementById('mainContent');
  try {
    window.location.hash = '#archive';
    const items = await api('GET', '/archive');
    const countCons = items.filter(r => r.type === 'منصرف فصائل الدم').length;

    el.innerHTML = `<div class="page-actions"><button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> الرئيسية</button></div>
      <div class="page-title"><i class="fas fa-archive" style="color:#607d8b"></i> الأرشيف</div>
      <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:20px;justify-content:center">
      <div class="menu-item" data-click="showArchiveConsumption" style="width:140px;height:120px;cursor:pointer">
        <div class="menu-icon"><i class="fas fa-droplet" style="color:#e91e63;font-size:32px"></i></div>
        <div class="menu-label">أرشيف منصرف الفصائل</div>
        <div style="font-size:11px;color:#999">${countCons} أرشيف</div>
      </div>
<div class="menu-item" data-click="showArchiveIndicators" style="width:140px;height:120px;cursor:pointer">
         <div class="menu-icon"><i class="fas fa-chart-line" style="color:#3f51b5;font-size:32px"></i></div>
         <div class="menu-label">أرشيف مؤشرات الأداء</div>
         <div style="font-size:11px;color:#999">${items.filter(r => r.type === 'مؤشرات تجميعيه' || r.type === 'مؤشرات تخزينيه').length} أرشيف</div>
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
    const canSeeAll = me.user.role === 'admin' || me.user.role === 'org_supervisor';
    window._isArchiveAdmin = canSeeAll;

    el.innerHTML = `<div class="page-actions">
      <button class="btn-back" data-click="renderArchive"><i class="fas fa-arrow-right"></i> الأرشيف</button>
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
            <select class="form-control" id="addArchPeriod" data-change="toggleAddArchMonth" style="width:120px">
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
          <button class="btn btn-primary" data-click="saveArchiveConsumption" style="height:32px"><i class="fas fa-save"></i> حفظ في الأرشيف</button>
        </div>
      </div>
    </div>` : ''}
    <div class="card" style="margin-bottom:16px">
      <div class="card-header" style="padding:10px 16px;background:#e8f5e9"><strong><i class="fas fa-filter"></i> فلترة البيانات</strong></div>
      <div class="card-body" style="padding:10px 16px">
        <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end">
          <div class="form-group"><label>الفرع</label>
            <select class="form-control" id="filterGov" data-change="onArchiveFilterChange" style="width:150px">${canSeeAll ? '<option value="">الكل</option>' : ''}</select></div>
          <div class="form-group"><label>السنة</label>
            <select class="form-control" id="filterYear" data-change="onArchiveFilterChange" style="width:100px"><option value="">الكل</option></select></div>
          <div class="form-group"><label>الشهر</label>
            <select class="form-control" id="filterMonth" data-change="onArchiveFilterChange" style="width:120px"><option value="">الكل</option>
              ${MONTHS_AR.map((m,i) => `<option value="${i+1}">${m}</option>`).join('')}</select></div>
          <div class="form-group"><label>الفترة</label>
            <select class="form-control" id="filterPeriod" data-change="onArchiveFilterChange" style="width:120px">
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
            <select class="form-control" id="filterHosp" data-change="onArchiveFilterChange">${canSeeAll ? '<option value="">الكل</option>' : ''}</select></div>
        </div>
      </div>
    </div>
    ${getCairoDate().getUTCDate() >= 25 ? '<div style="background:#fff3cd;color:#856404;padding:10px 16px;border-radius:8px;margin-bottom:12px;font-size:13px;text-align:center"><i class="fas fa-lock"></i> التعديل مغلق بعد يوم 25 — يتم عرض بيانات الشهر السابق</div>' : ''}
    <div id="archConsTable"></div>`;

    if (isAdmin) {
      const hospitals = await api('GET', '/hospitals');
      document.getElementById('addArchHosp').innerHTML = hospitals.map(h => `<option value="${h.id}">${h.name}</option>`).join('');
    }

    // Populate filter dropdowns
    const allHospitals = await api('GET', '/hospitals');
    const govs = [...new Set(allHospitals.map(h => h.governorate))];
    const govEl = document.getElementById('filterGov');
    if (canSeeAll) {
      govs.forEach(g => { govEl.innerHTML += `<option value="${g}">${g}</option>`; });
    } else if (me.user.governorate) {
      govEl.innerHTML = `<option value="${me.user.governorate}" selected>${me.user.governorate}</option>`;
    }
    [2026,2025,2024,2023,2022].forEach(y => { document.getElementById('filterYear').innerHTML += `<option value="${y}">${y}</option>`; });

    // Populate hospital filter (all initially)
const hospEl = document.getElementById('filterHosp');
    if (canSeeAll) {
      allHospitals.forEach(h => { hospEl.innerHTML += `<option value="${h.id}">${h.name}</option>`; });
    }

    // Auto-select governorate for non-admin, non-org_supervisor users
    if (me.user.role !== 'admin' && me.user.role !== 'org_supervisor') {
      document.getElementById('filterGov').value = me.user.governorate || '';
      if (me.user.role === 'hospital' && me.user.hospitalId) {
        document.getElementById('filterHosp').value = me.user.hospitalId;
      }
      onArchiveFilterChange();
    }

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
    el.innerHTML = window._isArchiveAdmin ? '<option value="">الكل</option>' : '';
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
          <button class="btn btn-sm btn-outline" data-click="exportExcel" style="color:#2e7d32"><i class="fas fa-file-excel"></i> تحميل Excel</button>
          <button class="btn btn-sm btn-outline" data-click="exportPDF" style="color:#c62828;margin-right:6px"><i class="fas fa-file-pdf"></i> تحميل PDF</button>
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
          <td>${r._archiveId && r.hospital_id && window._isArchiveAdmin ? `<button class="btn btn-sm btn-outline" data-click="editArchiveRecord" data-args="${r._archiveId},${r.hospital_id},${r.year},${r.month||0},'${r.period||'monthly'}'" style="color:#1976d2;font-size:10px;margin-left:4px"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-outline" data-click="deleteArchiveRecord" data-args="${r._archiveId},${r.hospital_id},${r.year},${r.month||0},'${r.period||'monthly'}'" style="color:#dc3545;font-size:10px"><i class="fas fa-trash"></i></button>` : ''}</td>
        </tr>`;
      }).join('')}
      </tbody></table></div>`;
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

async function editArchiveRecord(archiveId, hospitalId, year, month, period) {
  try {
    const items = await api('GET', '/archive');
    const arch = items.find(a => a.id === archiveId);
    if (!arch) { showToast('⚠ لم يتم العثور على الأرشيف'); return; }
    let data = tryParse(arch.data) || [];
    const record = data.find(r => r.hospital_id === hospitalId && r.year === year && (month > 0 ? r.month === month : true) && (r.period || 'monthly') === (period || 'monthly'));
    if (!record) { showToast('⚠ لم يتم العثور على السجل'); return; }
    const bt = typeof record.blood_types === 'string' ? tryParse(record.blood_types) : record.blood_types || {};
    const BP = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];
    openModal('تعديل بيانات الأرشيف',
      `<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end">
        <div><label style="font-size:11px;font-weight:600">بنك الدم</label><div style="padding:6px 0;font-weight:600">${record.hospital_name || ''}</div></div>
        <div><label style="font-size:11px;font-weight:600">الفترة</label><div style="padding:6px 0">${record._displayPeriod || periodLabel(record)}</div></div>
        ${BP.map(t => `<div style="width:65px"><label style="font-size:11px;font-weight:600">${t}</label>
        <input class="form-control edArcInp" id="edArc${t.replace('+','P').replace('-','N')}" type="number" value="${bt[t]||0}" style="height:32px;font-size:12px;text-align:center"></div>`).join('')}
      </div>`,
      `<button class="btn btn-secondary" data-click="closeModal">إلغاء</button>
      <button class="btn btn-primary" data-click="saveEditArchiveRecord" data-args="${archiveId},${hospitalId},${year},${month},'${period}'">حفظ</button>`);
  } catch (e) { showToast('❌ '+e.message); }
}

async function saveEditArchiveRecord(archiveId, hospitalId, year, month, period) {
  try {
    const bloodTypes = {};
    ['A+','A-','B+','B-','O+','O-','AB+','AB-'].forEach(t => {
      bloodTypes[t] = parseInt(document.getElementById('edArc' + t.replace('+','P').replace('-','N')).value) || 0;
    });
    const items = await api('GET', '/archive');
    const arch = items.find(a => a.id === archiveId);
    if (!arch) { showToast('⚠ لم يتم العثور على الأرشيف'); return; }
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
  } catch (e) { showToast('❌ '+e.message); }
}

async function deleteArchiveRecord(archiveId, hospitalId, year, month, period) {
  showConfirmModal('هل أنت متأكد من حذف هذا السجل من الأرشيف؟', async function() {
    try {
      const items = await api('GET', '/archive');
      const arch = items.find(a => a.id === archiveId);
      if (!arch) { showToast('⚠ لم يتم العثور على الأرشيف'); return; }
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
    } catch (e) { showToast('❌ '+e.message); }
  });
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
  } catch (e) { showToast('❌ '+e.message); }
}

// ============== أرشيف مؤشرات الأداء ==============

async function showArchiveIndicators() {
  const el = document.getElementById('mainContent');
  try {
    const me = await api('GET', '/me');
const isAdmin = me.user.id === 1;
    const canSeeAll = me.user.role === 'admin' || me.user.role === 'org_supervisor';
    window._isArchiveAdmin = canSeeAll;
    if (window._archiveEditLocked === undefined) window._archiveEditLocked = true;

    el.innerHTML = `<div class="page-actions">
      <button class="btn-back" data-click="renderArchive"><i class="fas fa-arrow-right"></i> الأرشيف</button>
    </div>
    <div class="page-title"><i class="fas fa-chart-line" style="color:#3f51b5"></i> أرشيف مؤشرات الأداء</div>
    <div class="card" style="margin-bottom:16px">
      <div class="card-header" style="padding:10px 16px;background:#e8f5e9"><strong><i class="fas fa-filter"></i> فلترة البيانات</strong></div>
      <div class="card-body" style="padding:10px 16px">
        <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end">
          <div class="form-group"><label>الفرع</label>
            <select class="form-control" id="filterIndGov" data-change="onIndicatorsArchiveFilterChange" style="width:150px">${canSeeAll ? '<option value="">الكل</option>' : ''}</select></div>
          <div class="form-group"><label>السنة</label>
            <select class="form-control" id="filterIndYear" data-change="onIndicatorsArchiveFilterChange" style="width:100px"><option value="">الكل</option></select></div>
          <div class="form-group"><label>الشهر</label>
            <select class="form-control" id="filterIndMonth" data-change="onIndicatorsArchiveFilterChange" style="width:120px"><option value="">الكل</option>
              ${MONTHS_AR.map((m,i) => `<option value="${i+1}">${m}</option>`).join('')}</select></div>
          <div class="form-group"><label>الفترة</label>
            <select class="form-control" id="filterIndPeriod" data-change="onIndicatorsArchiveFilterChange" style="width:120px">
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
            <select class="form-control" id="filterIndType" data-change="onIndicatorsArchiveFilterChange" style="width:120px">
              <option value="">الكل</option>
              <option value="تجميعي">تجميعي</option>
              <option value="تخزيني">تخزيني</option>
            </select></div>
          <div class="form-group" style="flex:1;min-width:200px"><label>بنك الدم</label>
            <select class="form-control" id="filterIndHosp" data-change="onIndicatorsArchiveFilterChange">${canSeeAll ? '<option value="">الكل</option>' : ''}</select></div>
          <div class="form-group" style="display:flex;align-items:end;padding-bottom:4px">
            <label style="display:flex;align-items:center;gap:4px;font-weight:400;cursor:pointer;font-size:13px">
              <input type="checkbox" id="filterIndGovAgg" data-change="renderArchiveIndicatorsTable"> إجمالي الفرع
            </label>
          </div>
          ${isAdmin ? `
          <div class="form-group" style="display:flex;align-items:end;padding-bottom:4px">
            <button id="lockToggleBtn" class="btn btn-sm ${window._archiveEditLocked ? 'btn-secondary' : 'btn-warning'}" data-click="toggleArchiveEditLock" style="font-size:11px">
              <i class="fas ${window._archiveEditLocked ? 'fa-lock' : 'fa-lock-open'}"></i> ${window._archiveEditLocked ? 'قفل التعديل' : 'فتح التعديل'}
            </button>
          </div>` : ''}
        </div>
      </div>
    </div>
    ${getCairoDate().getUTCDate() >= 25 ? '<div style="background:#fff3cd;color:#856404;padding:10px 16px;border-radius:8px;margin-bottom:12px;font-size:13px;text-align:center"><i class="fas fa-lock"></i> التعديل مغلق بعد يوم 25 — يتم عرض بيانات الشهر السابق</div>' : ''}
    <div id="archIndTable"></div>`;

    const allHospitals = await api('GET', '/hospitals');
    const govs = [...new Set(allHospitals.map(h => h.governorate))];
    const govEl = document.getElementById('filterIndGov');
    if (canSeeAll) {
      govs.forEach(g => { govEl.innerHTML += `<option value="${g}">${g}</option>`; });
    } else if (me.user.governorate) {
      govEl.innerHTML = `<option value="${me.user.governorate}" selected>${me.user.governorate}</option>`;
    }
[2026,2025,2024,2023,2022].forEach(y => { document.getElementById('filterIndYear').innerHTML += `<option value="${y}">${y}</option>`; });

const hospEl = document.getElementById('filterIndHosp');
    if (canSeeAll) {
      allHospitals.forEach(h => { hospEl.innerHTML += `<option value="${h.id}">${h.name}</option>`; });
    }

    // Auto-select governorate for non-admin, non-org_supervisor users
    if (me.user.role !== 'admin' && me.user.role !== 'org_supervisor') {
      document.getElementById('filterIndGov').value = me.user.governorate || '';
      if (me.user.role === 'hospital' && me.user.hospitalId) {
        document.getElementById('filterIndHosp').value = me.user.hospitalId;
      }
      onIndicatorsArchiveFilterChange();
    }

    renderArchiveIndicatorsTable();
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

function onIndicatorsArchiveFilterChange() {
  const gov = document.getElementById('filterIndGov').value;
  const savedHosp = document.getElementById('filterIndHosp').value;
  api('GET', '/hospitals').then(hospitals => {
    const filtered = gov ? hospitals.filter(h => h.governorate === gov) : hospitals;
    const el = document.getElementById('filterIndHosp');
    el.innerHTML = window._isArchiveAdmin ? '<option value="">الكل</option>' : '';
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
            const contentEdit = isEditable ? ' contenteditable="true" directinput="true" data-focus="archiveCellFocus" data-blur="saveArchiveCell" data-paste="handleArchivePaste" data-keydown="archiveCellEnter"' : '';
            const edCls = isEditable ? ' class="editable-cell"' : '';
            let td = `<td style="text-align:center;${c.key === 'governorate' || c.key === 'hospital_name' ? 'text-align:right;font-weight:600' : ''}" ${cls}${style}${contentEdit}${edCls} data-key="${c.key}">${display}</td>`;
            if (ci === 1) td += `<td style="white-space:nowrap;font-size:11px;color:#5A7A9A;font-weight:600">${m}</td>`;
            return td;
          }).join('')}
          ${canEditDel && isAgg && r._childArchiveIds && r._childArchiveIds.length
            ? `<td style="text-align:center"><button class="btn btn-sm btn-outline" data-click="confirmDeleteArchiveGroup" data-args="'${PERIODS[fPeriod]?.label || 'الفترة'}',${r._childArchiveIds.join(',')}" style="color:#dc3545;font-size:10px"><i class="fas fa-trash"></i> حذف المجموعة</button></td>`
            : (canEditDel && r._archiveId && !isAgg
              ? `<td><button class="btn btn-sm btn-outline" data-click="editIndicatorArchiveRecord" data-args="${r._archiveId},${r.hospital_id},${r.year},${r.month||0},'${r.period||'monthly'}'" style="color:#1976d2;font-size:10px;margin-left:4px"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-outline" data-click="deleteIndicatorArchiveRecord" data-args="${r._archiveId},${r.hospital_id},${r.year},${r.month||0},'${r.period||'monthly'}'" style="color:#dc3545;font-size:10px"><i class="fas fa-trash"></i></button></td>`
              : '<td></td>')}
        </tr>`;
      }).join('');
      h += '</tbody></table></div></div>';
      return h;
    }

    let html = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <span style="font-size:13px;color:#666">إجمالي السجلات: ${totalCount}</span>
      <div>
        <button class="btn btn-success btn-sm" data-click="exportArchiveIndicatorsExcel" style="font-size:11px"><i class="fas fa-file-excel"></i> تحميل Excel</button>
        <button class="btn btn-danger btn-sm" data-click="exportArchiveIndicatorsPdf" style="font-size:11px;margin-right:6px"><i class="fas fa-file-pdf"></i> تحميل PDF</button>
      </div>
    </div>`;
    if (!fType || fType === 'تجميعي') html += renderGroup(filteredBig, BIG_COL_DEFS, computeBigFormulas, 'مؤشرات أداء البنوك التجميعية');
    if (!fType || fType === 'تخزيني') html += renderGroup(filteredSmall, SMALL_COL_DEFS, computeSmallFormulas, 'مؤشرات أداء البنوك التخزينية');
    el.innerHTML = html;
  }).catch(e => { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; });
}

function confirmDeleteArchiveGroup(periodLabel, archiveIds) {
  showConfirmModal('حذف كل سجلات ' + periodLabel + ' لهذا المستشفى؟', function() {
    deleteArchiveIndicatorGroup(archiveIds);
  });
}

async function deleteArchiveIndicatorGroup(archiveIds) {
  if (!archiveIds.length) return;
  try {
    for (const aid of archiveIds) {
      await api('DELETE', '/archive/' + aid);
    }
    showToast('✅ تم حذف جميع سجلات الفترة');
    renderArchiveIndicatorsTable();
  } catch (e) { showToast('❌ '+e.message); }
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
    showToast('❌ '+e.message);
  }
}

function exportArchiveIndicatorsExcel() {
  const tables = document.querySelectorAll('#archIndTable table.ind-table');
  if (!tables.length) return;
  let html = '';
  tables.forEach((table, ti) => {
    let tbl = table.outerHTML;
    tbl = tbl.replace(/<table/g, '<table style="border-collapse:collapse;width:100%;font-family:\'Segoe UI\',Arial;font-size:10px;margin-top:12px"');
    tbl = tbl.replace(/<th(?!\s)/g, '<th style="background:#5A7A9A;color:#fff;font-weight:700;padding:4px 6px;border:1px solid #3a5a7a;text-align:center;white-space:nowrap"');
    tbl = tbl.replace(/<th\s+([^>]*)>/g, (m, a) => `<th ${a} style="background:#5A7A9A;color:#fff;font-weight:700;padding:4px 6px;border:1px solid #3a5a7a;text-align:center;white-space:nowrap">`);
    tbl = tbl.replace(/<td(?!\s)/g, '<td style="padding:3px 5px;border:1px solid #bdc3c7;text-align:center;font-size:10px"');
    tbl = tbl.replace(/<td\s+([^>]*)>/g, (m, a) => `<td ${a} style="padding:3px 5px;border:1px solid #bdc3c7;text-align:center;font-size:10px">`);
    // Remove action buttons column (last td in each row)
    tbl = tbl.replace(/<td[^>]*><button[\s\S]*?<\/button><\/td>/g, '<td></td>');
    html += tbl;
  });
  const full = `<html dir="rtl"><head><meta charset="utf-8"></head><body>
    <table style="width:100%;margin-bottom:8px"><tr><td style="text-align:center;font-size:16px;font-weight:700;color:#5A7A9A;border:none">أرشيف مؤشرات الأداء</td></tr></table>
    ${html}
    <table style="width:100%;margin-top:10px"><tr><td style="text-align:center;font-size:10px;color:#95a5a6;border:none">إعداد و برمجة محمد ندا 01068880999</td></tr></table></body></html>`;
  downloadBlob(new Blob(['\ufeff' + full], { type: 'application/octet-stream' }), 'archive_indicators_' + fmtCairoDate('date') + '.xls');
}

function exportArchiveIndicatorsPdf() {
  const tables = document.querySelectorAll('#archIndTable table.ind-table');
  if (!tables.length) return;
  let html = '';
  tables.forEach(table => {
    let tbl = table.outerHTML;
    tbl = tbl.replace(/<th(?!\s)/g, '<th style="background:#5A7A9A;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #3a5a7a;text-align:center"');
    tbl = tbl.replace(/<th\s+([^>]*)>/g, (m, a) => `<th ${a} style="background:#5A7A9A;color:#fff;font-weight:700;padding:5px 7px;border:1px solid #3a5a7a;text-align:center">`);
    tbl = tbl.replace(/<td(?!\s)/g, '<td style="padding:3px 5px;border:1px solid #ccc;text-align:center;font-size:11px"');
    tbl = tbl.replace(/<td\s+([^>]*)>/g, (m, a) => `<td ${a} style="padding:3px 5px;border:1px solid #ccc;text-align:center;font-size:11px">`);
    tbl = tbl.replace(/<td[^>]*><button[\s\S]*?<\/button><\/td>/g, '<td></td>');
    html += tbl;
  });
  const bodyHtml = `<div style="text-align:center;margin-bottom:8px"><h2 style="color:#5A7A9A;margin:0 0 2px;font-size:15px">أرشيف مؤشرات الأداء</h2></div>
    ${html}
    <div style="text-align:center;margin-top:10px;font-size:10px;color:#888">إعداد و برمجة محمد ندا 01068880999</div>`;
  downloadPdf(bodyHtml, 'indicators-archive.pdf');
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
  let html = table.outerHTML;
  html = html.replace(/<table/g, '<table style="border-collapse:collapse;width:100%;font-family:\'Segoe UI\',Arial;font-size:10px"');
  html = html.replace(/<th(?!\s)/g, '<th style="background:#2e7d32;color:#fff;font-weight:700;padding:4px 6px;border:1px solid #1b5e20;text-align:center;white-space:nowrap"');
  html = html.replace(/<th\s+([^>]*)>/g, (m, a) => `<th ${a} style="background:#2e7d32;color:#fff;font-weight:700;padding:4px 6px;border:1px solid #1b5e20;text-align:center;white-space:nowrap">`);
  html = html.replace(/<td(?!\s)/g, '<td style="padding:3px 5px;border:1px solid #bdc3c7;text-align:center;font-size:10px"');
  html = html.replace(/<td\s+([^>]*)>/g, (m, a) => `<td ${a} style="padding:3px 5px;border:1px solid #bdc3c7;text-align:center;font-size:10px">`);
  // Remove action buttons column (last td)
  html = html.replace(/<td[^>]*><button[\s\S]*?<\/button><\/td>/g, '<td></td>');
  const full = `<html dir="rtl"><head><meta charset="utf-8"></head><body>
    <table style="width:100%;margin-bottom:8px"><tr><td style="text-align:center;font-size:16px;font-weight:700;color:#2e7d32;border:none">${title}</td></tr></table>
    ${html}
    <table style="width:100%;margin-top:10px"><tr><td style="text-align:center;font-size:10px;color:#95a5a6;border:none">إعداد و برمجة محمد ندا 01068880999</td></tr></table></body></html>`;
  downloadBlob(new Blob(['\ufeff' + full], { type: 'application/octet-stream' }), 'consumption_archive_' + fmtCairoDate('date') + '.xls');
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
  html = html.replace(/<td[^>]*><button[\s\S]*?<\/button><\/td>/g, '<td></td>');
  const bodyHtml = `<div style="text-align:center;margin-bottom:8px"><h2 style="color:#2e7d32;margin:0 0 2px;font-size:15px">معدل صرف الفصائل ببنوك دم هيئة الرعاية الصحية</h2>
    ${subtitle ? '<h3 style="color:#666;margin:0;font-weight:normal;font-size:12px">' + subtitle.replace(/[()]/g,'') + '</h3>' : ''}</div>
    ${html}
    <div style="text-align:center;margin-top:10px;font-size:10px;color:#888">إعداد و برمجة محمد ندا 01068880999</div>`;
  downloadPdf(bodyHtml, 'consumption-archive.pdf');
}

async function renderUsers() {
  const el = document.getElementById('mainContent');
  try {
    const me = (await api('GET', '/me')).user;
    const isMaster = me.id === 1;
    const roles = ['admin','hospital_manager','hospital','branch_supervisor','org_supervisor','visitor'];
    const roleLabels = { admin:'مدير عام', hospital_manager:'مدير بنك دم', hospital:'مستخدم مستشفي', branch_supervisor:'مشرف فرع', org_supervisor:'مشرف هيئة', visitor:'زائر' };
    const roleColors = { admin:'#dc3545', hospital_manager:'#6f42c1', hospital:'#17a2b8', branch_supervisor:'#fd7e14', org_supervisor:'#28a745', visitor:'#6c757d' };
    el.innerHTML = `<div class="page-actions"><button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> الرئيسية</button>
      <div class="search-input-wrap" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <input class="search-input" id="userSearchName" placeholder="بحث بالاسم..." data-input="filterUserTable" style="min-width:150px">
        <input class="search-input" id="userSearchUser" placeholder="اسم المستخدم..." data-input="filterUserTable" style="min-width:150px">
        <select class="form-control" id="userFilterRole" data-change="filterUserTable" style="min-width:150px"><option value="">كل الأدوار</option>${roles.map(r => `<option value="${r}">${roleLabels[r]}</option>`).join('')}</select>
        <select class="form-control" id="userFilterGov" data-change="filterUserTable" style="min-width:150px"><option value="">كل المحافظات</option></select>
        <select class="form-control" id="userFilterHosp" data-change="filterUserTable" style="min-width:180px"><option value="">كل المستشفيات</option></select>
      </div>
      ${isMaster ? '<button class="btn btn-primary" data-click="showAddUserModal"><i class="fas fa-plus"></i> إضافة مستخدم</button>' : ''}
      <button class="btn btn-outline" data-click="copyUsersTable" title="نسخ الجدول"><i class="fas fa-copy"></i> نسخ</button>
      <button class="btn btn-outline" data-click="exportUsersExcel" title="تصدير Excel"><i class="fas fa-file-excel"></i> Excel</button>
      <button class="btn btn-outline" data-click="exportUsersPdf" title="تصدير PDF"><i class="fas fa-file-pdf"></i> PDF</button>
      ${isMaster ? '<button class="btn btn-warning" data-click="toggleShowPasswords" id="togglePassBtn" title="إظهار/إخفاء كلمات المرور"><i class="fas fa-eye"></i> عرض الباسوردات</button>' : ''}</div>
      <div class="card"><div class="card-body table-scroll"><table class="data-table" id="userTable"><thead><tr><th>#</th><th>الاسم</th><th>اسم المستخدم</th><th>الدور</th><th>التليفون</th><th>البريد</th><th>المستشفى</th><th>الفرع</th><th>كلمة المرور</th><th>إجراءات</th></tr></thead><tbody id="usersBody"></tbody></table></div></div>`;
    const [users, hospitals, govs] = await Promise.all([api('GET', '/users'), api('GET', '/hospitals'), api('GET', '/governorates')]);
    window._hospitalsCache = hospitals;
    const hospMap = {};
    hospitals.forEach(h => hospMap[h.id] = h.name);
    const govNames = (Array.isArray(govs) ? govs : []).map(g => typeof g === 'string' ? g : g.name);
    govNames.forEach(g => { const opt = document.createElement('option'); opt.value = g; opt.textContent = g; document.getElementById('userFilterGov').appendChild(opt); });
    hospitals.forEach(h => { const opt = document.createElement('option'); opt.value = h.id; opt.textContent = h.name; document.getElementById('userFilterHosp').appendChild(opt); });
    window._usersData = users;
    renderUserRows(users, isMaster, me);
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}
function renderUserRows(users, isMaster, me) {
  const roleLabels = { admin:'مدير عام', hospital_manager:'مدير بنك دم', hospital:'مستخدم مستشفي', branch_supervisor:'مشرف فرع', org_supervisor:'مشرف هيئة', visitor:'زائر' };
  const roleColors = { admin:'#dc3545', hospital_manager:'#6f42c1', hospital:'#17a2b8', branch_supervisor:'#fd7e14', org_supervisor:'#28a745', visitor:'#6c757d' };
  const hospMap = {}; window._hospitalsCache.forEach(h => hospMap[h.id] = h.name);
  document.getElementById('usersBody').innerHTML = users.map((u, i) => {
    const canEdit = isMaster || (me.role === 'branch_supervisor' && u.role === 'hospital' && u.governorate === me.governorate);
    const canEditSelf = me.id === u.id;
    const showEdit = canEdit || canEditSelf;
    const showKey = canEdit || canEditSelf || (me.role === 'branch_supervisor' && u.role === 'hospital' && u.governorate === me.governorate);
    const rc = roleColors[u.role] || '#6c757d';
    const passDisplay = window._showPasswords && isMaster ? (u.password || '123') : '••••••';
    const isEmpUser = /^h\d+_\d+$/.test(u.username);
    const nameDisplay = (isEmpUser ? '<i class="fas fa-user-tie" style="color:#28a745;margin-left:4px" title="حساب موظف"></i> ' : '') + (u.name || '');
    return `<tr data-name="${(u.name||'').toLowerCase()}" data-user="${(u.username||'').toLowerCase()}" data-gov="${(u.governorate||'').toLowerCase()}" data-hosp="${u.hospital_id||''}" data-role="${u.role}">
      <td>${i+1}</td><td><strong>${nameDisplay}</strong></td><td style="direction:ltr">${u.username}</td><td><span style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;background:${rc}22;color:${rc};font-weight:600">${roleLabels[u.role] || u.role}</span></td><td style="direction:ltr">${u.phone || '-'}</td><td style="direction:ltr">${u.email || '-'}</td><td>${hospMap[u.hospital_id] || u.hospital_id || '-'}</td><td>${u.governorate || '-'}</td><td style="direction:ltr;font-family:monospace;font-size:12px" id="pass_${u.id}">${passDisplay}</td>
      <td>${!showEdit && !showKey ? '' :
        `${showEdit ? `<button class="btn btn-sm btn-outline" data-click="editUser" data-args="${u.id}" title="تعديل"><i class="fas fa-edit"></i></button>` : ''}
        ${showKey ? `<button class="btn btn-sm btn-outline" data-click="changeUserPassword" data-args="${u.id}" title="تغيير كلمة المرور"><i class="fas fa-key"></i></button>` : ''}
        ${isMaster && u.id !== 1 ? `<button class="btn btn-sm btn-outline" data-click="deleteUser" data-args="${u.id}" title="حذف"><i class="fas fa-trash"></i></button>` : ''}
        ${isMaster ? `<button class="btn btn-sm btn-outline" data-click="toggleSinglePassword" data-args="${u.id}" title="إظهار/إخفاء"><i class="fas fa-eye"></i></button>` : ''}`}</td></tr>`;
  }).join('');
}
window._showPasswords = false;
function toggleShowPasswords() {
  window._showPasswords = !window._showPasswords;
  const btn = document.getElementById('togglePassBtn');
  if (btn) btn.innerHTML = `<i class="fas fa-${window._showPasswords ? 'eye-slash' : 'eye'}"></i> ${window._showPasswords ? 'إخفاء' : 'عرض'} الباسوردات`;
  const users = window._usersData || [];
  users.forEach(u => {
    const cell = document.getElementById('pass_' + u.id);
    if (cell) cell.textContent = window._showPasswords ? (u.password || '123') : '••••••';
  });
}
function toggleSinglePassword(id) {
  const u = (window._usersData || []).find(x => x.id === id);
  if (!u) return;
  const cell = document.getElementById('pass_' + id);
  if (cell) cell.textContent = cell.textContent === '••••••' ? (u.password || '123') : '••••••';
}
function filterUserTable() {
  const qName = document.getElementById('userSearchName').value.trim().toLowerCase();
  const qUser = document.getElementById('userSearchUser').value.trim().toLowerCase();
  const fRole = document.getElementById('userFilterRole').value;
  const fGov = document.getElementById('userFilterGov').value;
  const fHosp = document.getElementById('userFilterHosp').value;
  document.querySelectorAll('#usersBody tr').forEach(tr => {
    const match = (!qName || tr.dataset.name.includes(qName)) &&
      (!qUser || tr.dataset.user.includes(qUser)) &&
      (!fRole || tr.dataset.role === fRole) &&
      (!fGov || tr.dataset.gov === fGov.toLowerCase()) &&
      (!fHosp || tr.dataset.hosp == fHosp);
    tr.style.display = match ? '' : 'none';
  });
}
function copyUsersTable() {
  const rows = []; const headers = [];
  document.querySelectorAll('#userTable thead th').forEach((th, i) => { if (i < 9) headers.push(th.textContent.trim()); });
  rows.push(headers.join('\t'));
  document.querySelectorAll('#usersBody tr:not([style*="display:none"])').forEach(tr => {
    const cells = [];
    tr.querySelectorAll('td').forEach((td, i) => { if (i < 9) cells.push(td.textContent.trim()); });
    rows.push(cells.join('\t'));
  });
  navigator.clipboard.writeText(rows.join('\n')).then(() => showToast('✅ تم نسخ الجدول'));
}
function exportUsersExcel() {
  const table = document.getElementById('userTable');
  if (!table) return;
  const clone = table.cloneNode(true);
  clone.querySelectorAll('tr').forEach(tr => {
    const last = tr.querySelector('td:last-child, th:last-child');
    if (last) last.remove();
  });
  const html = `<html><meta charset="utf-8"><body>${clone.outerHTML}</body></html>`;
  downloadBlob(new Blob([html], { type: 'application/octet-stream' }), 'users.xls');
}
function exportUsersPdf() {
  const table = document.getElementById('userTable');
  if (!table) return;
  const clone = table.cloneNode(true);
  clone.querySelectorAll('tr').forEach(tr => {
    const last = tr.querySelector('td:last-child, th:last-child');
    if (last) last.remove();
  });
  const html = `<html dir="rtl"><head><meta charset="utf-8"><style>
    body{font-family:'Segoe UI',Arial;font-size:10px;padding:10px} table{border-collapse:collapse;width:100%}
    th,td{border:1px solid #ccc;padding:4px 6px;text-align:right} th{background:#333;color:#fff}
    .role-badge{display:inline-block;padding:1px 6px;border-radius:10px;font-size:9px;font-weight:600}
  </style></head><body><h2 style="text-align:center">قائمة المستخدمين</h2>${clone.outerHTML}</body></html>`;
  const win = window.open('', '_blank'); win.document.write(html); win.document.close(); win.print();
}
function showAddUserModal() {
  api('GET', '/hospitals').then(hospitals => {
    api('GET', '/governorates').then(govs => {
      const roles = ['hospital_manager','hospital','branch_supervisor','org_supervisor','visitor'];
      const roleLabels = { hospital_manager:'مدير بنك دم', hospital:'مستخدم مستشفي', branch_supervisor:'مشرف فرع', org_supervisor:'مشرف هيئة', visitor:'زائر' };
      openModal('إضافة مستخدم',
        `<div class="form-group"><label>الاسم</label><div style="display:flex;gap:6px"><input class="form-control" id="auName" style="flex:1"> <button class="btn btn-sm btn-outline" data-click="pickEmpName" data-args="'auName','auHosp'" title="اختيار الاسم من بيان العاملين" style="white-space:nowrap"><i class="fas fa-user-tie"></i></button></div></div>
        <div class="form-group"><label>اسم المستخدم</label><input class="form-control" id="auUsername"></div>
        <div class="form-group" style="position:relative"><label>كلمة المرور</label><input class="form-control" id="auPassword" value="123" style="padding-left:36px"><span data-click="togglePasswordVisibility" data-args="'auPassword'" style="position:absolute;left:10px;bottom:8px;cursor:pointer;color:#999;font-size:16px"><i class="fas fa-eye"></i></span></div>
        <div class="form-group"><label>الدور</label><select class="form-control" id="auRole" data-change="toggleUserFields">
          ${roles.map(r => `<option value="${r}">${roleLabels[r]}</option>`).join('')}</select></div>
        <div class="form-group" id="auGovGroup" style="display:none"><label>الفرع</label><select class="form-control" id="auGov">
          ${Array.isArray(govs) ? govs.map(g => { const n = typeof g === 'string' ? g : g.name; return `<option value="${n}">${n}</option>`; }).join('') : ''}</select></div>
        <div class="form-group" id="auHospGroup" style="display:none"><label>المستشفى</label><select class="form-control" id="auHosp" data-change="autoFillEmpNameAdd">
          <option value="">بدون مستشفى</option>${hospitals.map(h => `<option value="${h.id}">${h.name}</option>`).join('')}</select></div>
        <div class="form-group" id="auVisHospGroup" style="display:none"><label>المستشفيات المسموحة (للزائر)</label><select class="form-control" id="auVisHospitals" multiple style="height:120px">${hospitals.map(h => `<option value="${h.id}">${h.name}</option>`).join('')}</select><small style="color:var(--text-muted);display:block;margin-top:4px">Ctrl+Click لتحديد أكثر من مستشفى</small></div>
        <div class="form-group"><label>التليفون</label><input class="form-control" id="auPhone" dir="ltr"></div>
        <div class="form-group"><label>البريد الالكتروني</label><input class="form-control" id="auEmail" dir="ltr"></div>`,
        `<button class="btn btn-secondary" data-click="closeModal">إلغاء</button>
        <button class="btn btn-primary" data-click="createUser">حفظ</button>`);
      toggleUserFields();
    });
  });
}
async function autoFillEmpName(nameFieldId, hospSelectId) {
  const hospId = parseInt(document.getElementById(hospSelectId).value);
  const nameField = document.getElementById(nameFieldId);
  if (!hospId || !nameField) return;
  try {
    const res = await api('GET', '/employee-statements?hospital_id=' + hospId);
    const rows = res.rows || [];
    const names = [...new Set(rows.map(r => r.employee).filter(Boolean))];
    if (names.length === 1) {
      nameField.value = names[0];
    } else if (names.length > 1) {
      nameField.value = names[0];
    }
  } catch(e) {}
}
async function pickEmpName(nameFieldId, hospSelectId) {
  const hospId = parseInt(document.getElementById(hospSelectId).value);
  if (!hospId) { showToast('⚠ اختر المستشفى أولاً'); return; }
  try {
    const res = await api('GET', '/employee-statements?hospital_id=' + hospId);
    const rows = res.rows || [];
    if (!rows.length) { showToast('⚠ لا يوجد موظفون في هذه المستشفى'); return; }
    const names = [...new Set(rows.map(r => r.employee).filter(Boolean))];
    if (!names.length) { showToast('⚠ لا يوجد موظفون'); return; }
    let html = names.map((n, i) => `<div class="emp-name-option" data-click="setNameFromEmp" data-args="'${nameFieldId}','${esc(n)}'" data-mouseover="hoverOn" data-mouseout="hoverOff" data-hover-bg="var(--hover-bg)" data-hover-off="" style="padding:8px 12px;cursor:pointer;border-radius:6px;transition:background 0.2s"><i class="fas fa-user"></i> ${esc(n)}</div>`).join('');
    openModal('اختيار الاسم من بيان العاملين',
      `<p style="margin-bottom:12px;color:#666">اختر اسم الموظف:</p><div style="max-height:300px;overflow-y:auto">${html}</div>`,
      `<button class="btn btn-secondary" data-click="closeModal">إلغاء</button>`);
  } catch(e) { showToast('❌ ' + e.message); }
}
function setNameFromEmp(fieldId, name) {
  document.getElementById(fieldId).value = name;
  closeModal();
}
function toggleUserFields() {
  const r = document.getElementById('auRole').value;
  document.getElementById('auGovGroup').style.display = r === 'branch_supervisor' ? '' : 'none';
  document.getElementById('auHospGroup').style.display = (r === 'hospital' || r === 'hospital_manager') ? '' : 'none';
  const visGroup = document.getElementById('auVisHospGroup');
  if (visGroup) visGroup.style.display = r === 'visitor' ? '' : 'none';
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
  if (!username) { showToast('⚠ اسم المستخدم مطلوب'); return; }
  const vIds = role === 'visitor' ? Array.from(document.getElementById('auVisHospitals')?.selectedOptions || []).map(o => parseInt(o.value)).filter(Boolean) : undefined;
  try {
    await api('POST', '/users', { username, password, name, role, hospitalId, governorate: gov, viewPermission: role === 'visitor' ? 'limited' : 'all', phone, email, viewHospitalIds: vIds });
    closeModal(); renderUsers();
  } catch(e) { showToast('❌ '+e.message); }
}
async function deleteUser(id) {
  const users = window._usersData || [];
  const u = users.find(x => x.id === id);
  const name = u ? (u.name || u.username) : 'هذا المستخدم';
  openModal('حذف مستخدم',
    `<div style="text-align:center;padding:16px"><i class="fas fa-user-minus" style="font-size:48px;color:#dc3545;opacity:0.6"></i>
    <p style="margin:12px 0;font-size:15px">هل أنت متأكد من حذف "<strong>${esc(name)}</strong>"؟</p>
    <p style="font-size:12px;color:#999">لا يمكن التراجع عن هذا الإجراء</p></div>`,
    `<button class="btn btn-secondary" data-click="closeModal">إلغاء</button>
    <button class="btn btn-danger" data-click="confirmDeleteUser" data-args="${id}"><i class="fas fa-trash"></i> حذف</button>`);
}
async function confirmDeleteUser(id) {
  closeModal();
  try { await api('DELETE', '/users/' + id); renderUsers(); showToast('✅ تم حذف المستخدم'); } catch(e) { showToast('❌ ' + e.message); }
}

async function renderEmployeeAccounts() {
  const el = document.getElementById('mainContent');
  try {
    const me = (await api('GET', '/me')).user;
    const isMaster = me.id === 1;
    if (!isMaster) { el.innerHTML = '<div class="empty-msg">ليس لديك صلاحية</div>'; return; }
    el.innerHTML = '<div class="page-loading"><i class="fas fa-spinner fa-spin"></i> جاري تحميل بيانات الموظفين...</div>';
    const [empRes, users, hospitals] = await Promise.all([
      api('GET', '/employee-statements'),
      api('GET', '/users'),
      api('GET', '/hospitals')
    ]);
    const rows = empRes.rows || [];
    const hospMap = {};
    hospitals.forEach(h => hospMap[h.id] = h);
    const empUserMap = {};
    users.forEach(u => {
      if (u.hospital_id) {
        if (!empUserMap[u.hospital_id]) empUserMap[u.hospital_id] = {};
        empUserMap[u.hospital_id][u.name] = u;
      }
    });
    const byHosp = {};
    rows.forEach(r => {
      const hid = r.hospital_id || 0;
      if (!byHosp[hid]) byHosp[hid] = [];
      byHosp[hid].push(r);
    });
    const hospIds = Object.keys(byHosp).map(Number).sort((a,b) => a-b);
    el.innerHTML = `<div class="page-actions"><button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> الرئيسية</button>
        <button class="btn btn-success" data-click="batchCreateAllEmployeeAccounts" id="batchEmpBtn"><i class="fas fa-users-gear"></i> إنشاء حسابات الكل</button>
      </div>
      <div class="page-header"><h2><i class="fas fa-user-plus" style="color:#28a745"></i> حسابات الموظفين</h2></div>
      ${hospIds.map(hid => {
        const hInfo = hospMap[hid];
        const empList = byHosp[hid];
        let createdCount = 0, hasAccount = 0;
        empList.forEach(e => {
          if (empUserMap[hid] && empUserMap[hid][e.employee]) hasAccount++;
        });
        return `<div class="card" style="margin-bottom:12px">
          <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--bg-card);border-bottom:1px solid var(--border)">
            <strong><i class="fas fa-hospital"></i> ${esc(hInfo?.name || 'مستشفى ' + hid)}</strong>
            <span style="font-size:12px;color:var(--text-muted)">${hasAccount}/${empList.length} لديه حساب</span>
          </div>
          <div class="card-body" style="padding:0">
            <table class="data-table" style="margin:0">
              <thead><tr><th>#</th><th>الاسم</th><th>اسم المستخدم</th><th>كلمة المرور</th><th>الحالة</th></tr></thead>
              <tbody>${empList.map((e, i) => {
                const existingUser = empUserMap[hid] && empUserMap[hid][e.employee];
                const uname = existingUser ? existingUser.username : ('h' + hid + '_' + (i + 1));
                const hasAcc = !!existingUser;
                return `<tr>
                  <td>${i+1}</td>
                  <td><strong>${esc(e.employee)}</strong></td>
                  <td style="direction:ltr;font-family:monospace;font-size:12px">${hasAcc ? esc(uname) : ('<span style="color:#999">' + esc(uname) + '</span>')}</td>
                  <td style="direction:ltr;font-family:monospace">${hasAcc ? '••••••' : '<span style="color:#999">123</span>'}</td>
                  <td>${hasAcc ? '<span style="color:#28a745;font-weight:600"><i class="fas fa-check-circle"></i> موجود</span>' : '<span style="color:#dc3545;font-weight:600"><i class="fas fa-times-circle"></i> لم ينشأ</span>'}</td>
                </tr>`;
              }).join('')}</tbody>
            </table>
          </div>
        </div>`;
      }).join('')}`;
    window._empAccountsData = { rows, empUserMap, byHosp, hospMap };
  } catch(e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

async function batchCreateAllEmployeeAccounts() {
  try {
    const res = await api('POST', '/users/batch-create-employees');
    showToast('✅ ' + res.message);
    if (res.created > 0) renderEmployeeAccounts();
  } catch(e) { showToast('❌ ' + e.message); }
}
function editUser(id) {
  Promise.all([api('GET', '/me'), api('GET', '/users'), api('GET', '/hospitals'), api('GET', '/governorates')]).then(([me, users, hospitals, govs]) => {
    const u = users.find(x => x.id === id); if (!u) return;
    const isMaster = me.user.id === 1;
    const roles = ['admin','hospital_manager','hospital','branch_supervisor','org_supervisor','visitor'];
    const roleLabels = { admin:'مدير عام', hospital_manager:'مدير بنك دم', hospital:'مستخدم مستشفي', branch_supervisor:'مشرف فرع', org_supervisor:'مشرف هيئة', visitor:'زائر' };
    const govArr = Array.isArray(govs) ? govs : [];
    openModal('تعديل المستخدم - ' + u.name,
      `<div class="form-group"><label>الاسم</label><div style="display:flex;gap:6px"><input class="form-control" id="euName" value="${String(u.name||'').replace(/"/g,'"')}" style="flex:1"> <button class="btn btn-sm btn-outline" data-click="pickEmpName" data-args="'euName','euHosp'" title="اختيار الاسم من بيان العاملين" style="white-space:nowrap"><i class="fas fa-user-tie"></i></button></div></div>
      ${isMaster ? `<div class="form-group"><label>الدور</label><select class="form-control" id="euRole" data-change="toggleEditUserFields">
        ${roles.map(r => `<option value="${r}" ${r===u.role?'selected':''}>${roleLabels[r]}</option>`).join('')}</select></div>` : ''}
      <div class="form-group" style="position:relative"><label>كلمة المرور</label><input class="form-control" id="euPassword" value="123" style="padding-left:36px"><span data-click="togglePasswordVisibility" data-args="'euPassword'" style="position:absolute;left:10px;bottom:8px;cursor:pointer;color:#999;font-size:16px"><i class="fas fa-eye"></i></span></div>
      ${isMaster ? `<div class="form-group" id="euGovGroup" style="${u.role==='branch_supervisor'?'':'display:none'}"><label>الفرع</label><select class="form-control" id="euGov">${govArr.map(g => `<option value="${g}" ${g===u.governorate?'selected':''}>${g}</option>`).join('')}</select></div>` : ''}
      ${isMaster ? `<div class="form-group" id="euHospGroup" style="${(u.role==='hospital' || u.role==='hospital_manager')?'':'display:none'}"><label>المستشفى</label><select class="form-control" id="euHosp" data-change="autoFillEmpNameEdit">${hospitals.map(h => `<option value="${h.id}" ${h.id===u.hospital_id?'selected':''}>${h.name}</option>`).join('')}</select></div>` : ''}
      ${isMaster ? `<div class="form-group" id="euVisHospGroup" style="${u.role==='visitor'?'':'display:none'}"><label>المستشفيات المسموحة (للزائر)</label><select class="form-control" id="euVisHospitals" multiple style="height:120px">${hospitals.map(h => `<option value="${h.id}" ${(u.view_hospital_ids||[]).includes(h.id)?'selected':''}>${h.name}</option>`).join('')}</select><small style="color:var(--text-muted);display:block;margin-top:4px">Ctrl+Click لتحديد أكثر من مستشفى</small></div>` : ''}
      <div class="form-group"><label>التليفون</label><input class="form-control" id="euPhone" value="${String(u.phone||'').replace(/"/g,'"')}" dir="ltr"></div>
      <div class="form-group"><label>البريد الالكتروني</label><input class="form-control" id="euEmail" value="${String(u.email||'').replace(/"/g,'"')}" dir="ltr"></div>
      ${isMaster ? `<div style="margin-top:8px;padding:8px 10px;background:#e8f5e9;border-radius:8px;font-size:12px;color:#2e7d32"><i class="fas fa-info-circle"></i> الصلاحيات تتحكم فيها من <strong>صلاحيات الأدوار</strong></div>` : ''}`,
      `<button class="btn btn-secondary" data-click="closeModal">إلغاء</button>
      <button class="btn btn-primary" data-click="saveUser" data-args="${id}">حفظ</button>`);
  });
}
function toggleEditUserFields() {
  const r = document.getElementById('euRole').value;
  document.getElementById('euGovGroup').style.display = r === 'branch_supervisor' ? '' : 'none';
  document.getElementById('euHospGroup').style.display = (r === 'hospital' || r === 'hospital_manager') ? '' : 'none';
  const visGroup = document.getElementById('euVisHospGroup');
  if (visGroup) visGroup.style.display = r === 'visitor' ? '' : 'none';
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
  if (password && password.length >= 3) body.password = password;
  if (isMaster) {
    const role = document.getElementById('euRole').value;
    body.role = role;
    const govEl = document.getElementById('euGov');
    if (govEl) body.governorate = govEl.value;
    const hospEl = document.getElementById('euHosp');
    const hospGroup = document.getElementById('euHospGroup');
    if (hospEl && hospGroup && hospGroup.style.display !== 'none') {
      const hv = parseInt(hospEl.value);
      body.hospitalId = isNaN(hv) ? null : hv;
    }
    if (role === 'visitor') {
      const visEl = document.getElementById('euVisHospitals');
      if (visEl) body.viewHospitalIds = Array.from(visEl.selectedOptions).map(o => parseInt(o.value)).filter(Boolean);
    }
  }
  try {
    await api('PUT', '/users/' + id, body);
    closeModal(); renderUsers();
  } catch(e) { showToast('❌ '+e.message); }
}
function changeUserPassword(id) {
  Promise.all([api('GET', '/me'), api('GET', '/users')]).then(([me, users]) => {
    const u = users.find(x => x.id === id); if (!u) return;
    const isSelf = me.user.id === id;
    openModal('تغيير كلمة المرور - ' + (u.name || u.username),
      `${isSelf ? `<div class="form-group" style="position:relative"><label>كلمة المرور الحالية</label><input class="form-control" id="cpCurrentPass" type="password" style="padding-left:36px"><span data-click="togglePasswordVisibility" data-args="'cpCurrentPass'" style="position:absolute;left:10px;bottom:8px;cursor:pointer;color:#999;font-size:16px"><i class="fas fa-eye"></i></span></div>` : ''}
      <div class="form-group" style="position:relative"><label>كلمة المرور الجديدة</label><input class="form-control" id="cpPassword" type="password" style="padding-left:36px" placeholder="4 أحرف على الأقل"><span data-click="togglePasswordVisibility" data-args="'cpPassword'" style="position:absolute;left:10px;bottom:8px;cursor:pointer;color:#999;font-size:16px"><i class="fas fa-eye"></i></span></div>
      <div class="form-group" style="position:relative"><label>تأكيد كلمة المرور الجديدة</label><input class="form-control" id="cpConfirm" type="password" style="padding-left:36px"><span data-click="togglePasswordVisibility" data-args="'cpConfirm'" style="position:absolute;left:10px;bottom:8px;cursor:pointer;color:#999;font-size:16px"><i class="fas fa-eye"></i></span></div>`,
      `<button class="btn btn-secondary" data-click="closeModal">إلغاء</button>
      <button class="btn btn-primary" data-click="savePassword" data-args="${id}">حفظ</button>`);
  });
}
async function savePassword(id) {
  const pwd = document.getElementById('cpPassword').value.trim();
  const confirm = document.getElementById('cpConfirm')?.value.trim();
  if (pwd.length < 3) { showToast('⚠ كلمة المرور قصيرة (3 أحرف على الأقل)'); return; }
  if (confirm !== undefined && pwd !== confirm) { showToast('⚠ كلمة المرور غير متطابقة مع التأكيد'); return; }
  const body = { password: pwd };
  const current = document.getElementById('cpCurrentPass');
  if (current) body.currentPassword = current.value;
  try { await api('PUT', '/users/' + id + '/password', body); showToast('✅ تم تغيير كلمة المرور بنجاح'); closeModal(); } catch(e) { showToast('❌ '+e.message); }
}

async function renderHospitals() {
  const el = document.getElementById('mainContent');
  try {
    const me = (await api('GET', '/me')).user;
    const isMaster = me.id === 1;
    el.innerHTML = `<div class="page-actions"><button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> الرئيسية</button>
      ${isMaster ? '<button class="btn btn-primary" data-click="showAddHospitalModal"><i class="fas fa-plus"></i> إضافة</button>' : ''}
      ${isMaster ? '<button class="btn btn-outline" data-click="showHospitalTypesModal" style="margin-right:6px"><i class="fas fa-tag"></i> أنواع البنوك</button>' : ''}</div>
      <div class="card"><div class="card-body table-scroll"><table class="data-table"><thead><tr><th>#</th><th>الكود</th><th>الاسم</th><th>الفرع</th><th>النوع</th>${isMaster?'<th></th>':''}</tr></thead><tbody id="hospBody"></tbody></table></div></div>`;
    const h = await api('GET', '/hospitals');
    document.getElementById('hospBody').innerHTML = h.map((x, i) => `<tr><td>${i+1}</td><td>${x.code || x.id}</td><td>${x.name}</td><td>${x.governorate}</td><td class="${x.type === 'تجميعي' ? 'agg-cell' : ''}">${x.type || 'تخزيني'}</td>
      ${isMaster ? `<td><button class="btn btn-sm btn-outline" data-click="editHospital" data-args="${x.id}"><i class="fas fa-edit"></i></button>
      <button class="btn btn-sm btn-outline" data-click="deleteHospital" data-args="${x.id}"><i class="fas fa-trash"></i></button></td>` : ''}</tr>`).join('');
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
      `<button class="btn btn-secondary" data-click="closeModal">إلغاء</button>
      <button class="btn btn-primary" data-click="addHospital">حفظ</button>`);
  });
}
async function addHospital() {
  const name = document.getElementById('ahName').value.trim();
  if (!name) { showToast('⚠ الاسم مطلوب'); return; }
  try {
    await api('POST', '/hospitals', { name, code: document.getElementById('ahCode').value.trim(), governorate: document.getElementById('ahGov').value, type: document.getElementById('ahType').value });
    closeModal(); renderHospitals();
  } catch(e) { showToast('❌ '+e.message); }
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
      `<button class="btn btn-secondary" data-click="closeModal">إلغاء</button>
      <button class="btn btn-primary" data-click="saveHospital" data-args="${id}">حفظ</button>`);
  });
}
async function saveHospital(id) {
  const name = document.getElementById('ehName').value.trim();
  if (!name) { showToast('⚠ الاسم مطلوب'); return; }
  try {
    await api('PUT', '/hospitals/' + id, { name, code: document.getElementById('ehCode').value.trim(), governorate: document.getElementById('ehGov').value, type: document.getElementById('ehType').value.trim() || 'تخزيني' });
    closeModal(); renderHospitals();
  } catch(e) { showToast('❌ '+e.message); }
}
async function deleteHospital(id) {
  showConfirmModal('هل أنت متأكد من حذف هذا المستشفى؟', async function() {
    try { await api('DELETE', '/hospitals/' + id); renderHospitals(); } catch(e) { showToast('❌ '+e.message); }
  });
}

async function showHospitalTypesModal() {
  const types = await api('GET', '/hospital-types');
  const typeArr = Array.isArray(types) ? types : [];
  openModal('إدارة أنواع البنوك',
    `<div style="margin-bottom:12px;display:flex;gap:8px">
      <input class="form-control" id="newTypeName" placeholder="اسم النوع الجديد" style="flex:1">
      <button class="btn btn-primary" data-click="addHospitalType">إضافة</button>
    </div>
    <div id="typeListWrap">${typeArr.map(t => `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #eee">
      <span>${t.name}</span>
      <button class="btn btn-sm btn-outline" data-click="deleteHospitalType" data-args="${t.id}"><i class="fas fa-times"></i></button>
    </div>`).join('')}</div>`,
    `<button class="btn btn-secondary" data-click="closeModal">إغلاق</button>`);
}

async function addHospitalType() {
  const name = document.getElementById('newTypeName').value.trim();
  if (!name) { showToast('⚠ الاسم مطلوب'); return; }
  try {
    await api('POST', '/hospital-types', { name });
    showHospitalTypesModal();
  } catch(e) { showToast('❌ '+e.message); }
}

async function deleteHospitalType(id) {
  showConfirmModal('هل أنت متأكد؟', async function() {
    try { await api('DELETE', '/hospital-types/' + id); showHospitalTypesModal(); } catch(e) { showToast('❌ '+e.message); }
  });
}

async function renderGovernorates() {
  const el = document.getElementById('mainContent');
  try {
    const me = (await api('GET', '/me')).user;
    const isMaster = me.id === 1;
    el.innerHTML = `<div class="page-actions"><button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> الرئيسية</button>
      ${isMaster ? '<button class="btn btn-primary" data-click="showAddGovModal"><i class="fas fa-plus"></i> إضافة</button>' : ''}</div>
      <div class="card"><div class="card-body table-scroll"><table class="data-table"><thead><tr><th>#</th><th>الاسم</th>${isMaster?'<th></th>':''}</tr></thead><tbody id="govBody"></tbody></table></div></div>`;
    const g = await api('GET', '/governorates');
    const arr = Array.isArray(g) ? g : [];
    document.getElementById('govBody').innerHTML = arr.map((x, i) => {
      const n = typeof x === 'string' ? x : (x.name || x);
      return `<tr><td>${i+1}</td><td>${n}</td>
        ${isMaster ? `<td><button class="btn btn-sm btn-outline" data-click="deleteGovernorate" data-args="'${n}'"><i class="fas fa-trash"></i></button></td>` : ''}</tr>`;
    }).join('');
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}
function showAddGovModal() {
  openModal('إضافة فرع',
    `<div class="form-group"><label>الاسم</label><input class="form-control" id="agName"></div>`,
    `<button class="btn btn-secondary" data-click="closeModal">إلغاء</button>
    <button class="btn btn-primary" data-click="addGovernorate">حفظ</button>`);
}
async function addGovernorate() {
  const name = document.getElementById('agName').value.trim();
  if (!name) { showToast('⚠ الاسم مطلوب'); return; }
  try { await api('POST', '/governorates', { name }); closeModal(); renderGovernorates(); } catch(e) { showToast('❌ '+e.message); }
}
async function deleteGovernorate(name) {
  showConfirmModal('هل أنت متأكد من حذف فرع "' + name + '"؟', async function() {
    try { await api('DELETE', '/governorates/' + encodeURIComponent(name)); renderGovernorates(); } catch(e) { showToast('❌ '+e.message); }
  });
}

// supervisor_data page removed — المستخدمين تغني عنه

// =============== Monthly Indicators (كبار + صغار) ===============

async function renderRolePerms() {
  const el = document.getElementById('mainContent');
  try {
    const [rolePerms, users] = await Promise.all([api('GET', '/role-permissions'), api('GET', '/users')]);
    const defaultLabels = { admin:'مدير', hospital:'مستشفى', branch_supervisor:'مشرف فرع', org_supervisor:'مشرف هيئة', visitor:'زائر' };
    const defaultColors = { admin:'#dc3545', hospital:'#17a2b8', branch_supervisor:'#fd7e14', org_supervisor:'#28a745', visitor:'#6c757d' };
    const defaultIcons = { admin:'fa-crown', hospital:'fa-hospital', branch_supervisor:'fa-user-check', org_supervisor:'fa-building', visitor:'fa-eye' };
    el.innerHTML = `<div class="page-actions"><button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> الرئيسية</button>
      <button class="btn btn-primary" data-click="saveAllRolePerms" id="saveRolePermsBtn"><i class="fas fa-save"></i> حفظ الكل</button>
      <button class="btn btn-success" data-click="showAddRoleModal"><i class="fas fa-plus"></i> إضافة دور</button></div>
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
          <span style="font-size:11px;opacity:0.9">${userCount} مستخدم ${rp.role !== 'admin' ? `<i class="fas fa-times" style="cursor:pointer;margin-right:8px" data-click="deleteRole" data-args="'${rp.role}'"></i>` : ''}</span>
        </div>
        <div class="card-body" style="padding:12px">
        <input type="text" data-input="filterPermPages" data-role="${rp.role}" placeholder="🔍 بحث عن صفحة..." style="width:100%;padding:6px 10px;border:1px solid #ddd;border-radius:8px;font-size:12px;margin-bottom:10px;box-sizing:border-box">`;
      PERM_CATS.forEach(c => {
        const pages = PERM_PAGES.filter(p => p.cat === c.key);
        if (!pages.length) return;
        html += `<div style="margin-bottom:10px"><div style="font-size:12px;font-weight:700;color:${c.color};margin-bottom:6px;display:flex;align-items:center;gap:4px"><i class="fas ${c.icon}"></i> ${c.label}
          <span style="margin-right:auto;font-size:11px;font-weight:400;display:flex;gap:4px">
            <span data-click="toggleCatPerms" data-args="'${rp.role}','${c.key}',1" style="cursor:pointer;color:#28a745;padding:1px 6px;border-radius:4px;border:1px solid #28a74555;font-size:10px"><i class="fas fa-check"></i> الكل</span>
            <span data-click="toggleCatPerms" data-args="'${rp.role}','${c.key}',0" style="cursor:pointer;color:#dc3545;padding:1px 6px;border-radius:4px;border:1px solid #dc354555;font-size:10px"><i class="fas fa-times"></i> إلغاء</span>
          </span>
        </div>`;
        html += `<div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;border-bottom:1px solid #f0f0f0;font-size:11px;color:#999">
            <span style="flex:1">الصفحة</span>
            ${PERM_ACTIONS.map(a => `<span style="width:28px;text-align:center;font-size:9px" title="${a.label}">${a.label}</span>`).join('')}
          </div>`;
        pages.forEach(p => {
          const pv = perms[p.key] || {v:0,a:0,e:0,d:0,x:0};
          html += `<div style="display:flex;align-items:center;padding:3px 0;border-bottom:1px solid #f0f0f0;font-size:12px">
            <span style="flex:1"><i class="fas ${p.icon}" style="margin-left:4px;color:${c.color};width:16px;text-align:center"></i>${p.label}</span>`;
          PERM_ACTIONS.forEach(a => {
            const checked = pv[a.key] === 1;
            html += `<label style="width:28px;height:20px;display:flex;align-items:center;justify-content:center;cursor:pointer" title="${a.label}">
              <input type="checkbox" data-role="${rp.role}" data-page="${p.key}" data-action="${a.key}" ${checked?'checked':''} data-change="permToggleChanged" style="width:16px;height:16px;cursor:pointer;accent-color:${a.color}">
            </label>`;
          });
          html += `</div>`;
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
    `<button class="btn btn-secondary" data-click="closeModal">إلغاء</button>
    <button class="btn btn-primary" data-click="addNewRole">إضافة</button>`);
}

async function addNewRole() {
  const key = document.getElementById('arKey').value.trim();
  const label = document.getElementById('arName').value.trim();
  if (!key) { showToast('⚠ اسم الدور مطلوب'); return; }
  if (!label) { showToast('⚠ الاسم المعروض مطلوب'); return; }
  try {
    await api('PUT', '/role-permissions', { role: key, permissions: {} });
    closeModal();
    renderRolePerms();
    showToast('تم إضافة الدور "' + label + '" بنجاح');
  } catch(e) { showToast('❌ '+e.message); }
}

async function deleteRole(role) {
  if (role === 'admin') { showToast('⚠ لا يمكن حذف دور المدير'); return; }
  const defaultLabels = { admin:'مدير', hospital:'مستشفى', branch_supervisor:'مشرف فرع', org_supervisor:'مشرف هيئة', visitor:'زائر' };
  openModal('حذف الدور',
    `<div style="text-align:center;padding:16px"><i class="fas fa-exclamation-triangle" style="font-size:48px;color:#dc3545;opacity:0.6"></i>
    <p style="margin:12px 0;font-size:15px">هل أنت متأكد من حذف دور "<strong>${defaultLabels[role] || role}</strong>"؟</p>
    <p style="font-size:12px;color:#999">المستخدمون المرتبطون بهذا الدور سيبقون بدون تغيير</p></div>`,
    `<button class="btn btn-secondary" data-click="closeModal">إلغاء</button>
    <button class="btn btn-danger" data-click="confirmDeleteRole" data-args="'${role}'"><i class="fas fa-trash"></i> حذف</button>`);
}
async function confirmDeleteRole(role) {
  closeModal();
  try {
    await api('DELETE', '/role-permissions/' + encodeURIComponent(role));
    renderRolePerms();
    showToast('✅ تم حذف الدور بنجاح');
  } catch(e) { showToast('❌ ' + e.message); }
}

function toggleCatPerms(role, catKey, val) {
  const pages = PERM_PAGES.filter(p => p.cat === catKey);
  const prefix = `[data-role="${role}"]`;
  pages.forEach(p => {
    document.querySelectorAll(`${prefix}[data-page="${p.key}"]`).forEach(cb => {
      cb.checked = val === 1;
    });
  });
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
    showToast('✅ تم حفظ صلاحيات الأدوار بنجاح');
    renderRolePerms();
  } catch(e) { showToast('❌ '+e.message); }
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
            html += `<input class="ind-form-input ${prefix}-inp" id="${prefix}_${f.key}" type="number" value="0"${recalcFn ? ` data-input="${recalcFn}"` : ''}></div>`;
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
            html += `<input class="ind-form-input ${prefix}-inp" id="${prefix}_${f.key}" type="number" value="0"${recalcFn ? ` data-input="${recalcFn}"` : ''}></div>`;
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

    el.innerHTML = `<div class="page-actions"><button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> رجوع</button>
    </div>`;

    if (canEdit) {
      const now = getCairoDate();
      const year = now.getUTCFullYear();
      const prevMonth = (now.getUTCMonth() + 11) % 12; // month before current
      el.innerHTML += `<div class="card" style="margin-bottom:16px;border-right:4px solid #dc3545">
        <div class="card-header" style="padding:10px 16px"><strong><i class="fas fa-edit"></i> إدخال مؤشرات تجميعيه</strong></div>
        <div class="card-body" style="padding:10px 16px">
          <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin-bottom:12px">
            <div class="form-group"><label>السنة</label>
              <select class="form-control" id="biYear" style="width:100px" data-change="loadExistingBigIndicator">${[2026,2025,2024,2023,2022].map(y => `<option value="${y}" ${y===year?'selected':''}>${y}</option>`).join('')}</select></div>
            <div class="form-group"><label>الشهر</label>
              <select class="form-control" id="biMonth" style="width:120px" data-change="loadExistingBigIndicator">${months.map((m,i) => `<option value="${i+1}" ${i===prevMonth?'selected':''}>${m}</option>`).join('')}</select></div>
            ${isHospital 
              ? `<div class="form-group" style="min-width:200px"><label>بنك الدم</label><div style="padding:6px 0;font-weight:600">${user.name}</div></div>`
              : `<div class="form-group" style="flex:1;min-width:200px"><label>بنك الدم</label>
                  <select class="form-control" id="biHosp" data-change="loadExistingBigIndicator">${filteredHospitals.map(h => `<option value="${h.id}">${h.name}</option>`).join('')}</select></div>`
            }
          </div>
          ${buildIndicatorFormHTML(BIG_COL_DEFS, 'bi', 'recalcBigFormulas')}
          <div style="margin-top:10px"><button class="btn btn-primary" data-click="saveBigIndicator" style="height:32px"><i class="fas fa-save"></i> حفظ</button></div>
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
    const now = getCairoDate();
    const prevDbMonth = (now.getUTCMonth() + 11) % 12 + 1;
    const prevYear = now.getUTCMonth() === 0 ? now.getUTCFullYear() - 1 : now.getUTCFullYear();
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
          ${canDelete ? `<td><button class="btn btn-sm btn-outline" data-click="deleteBigIndicator" data-args="${r.id}" style="color:#dc3545"><i class="fas fa-trash"></i></button></td>` : ''}
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
  const saveBtn = document.querySelector('button[data-click="saveBigIndicator"]');
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
    if (dup) {
      showConfirmModal('⚠ تم إدخال بيانات هذا الشهر مسبقاً!\n\nهل تريد تعديل البيانات؟', async function() {
        await api('POST', '/monthly-big-indicators', { hospitalId, year, month, data });
        showToast('✅ تم تعديل البيانات بنجاح');
        renderBigIndicators();
      });
      return;
    }
    await api('POST', '/monthly-big-indicators', { hospitalId, year, month, data });
    showToast('✅ تم حفظ البيانات بنجاح');
    renderBigIndicators();
  } catch (e) { showToast('❌ '+e.message); }
}

async function deleteBigIndicator(id) {
  showConfirmModal('هل أنت متأكد من حذف هذا السجل؟', async function() {
    try { await api('DELETE', '/monthly-big-indicators/' + id); renderBigIndicators(); }
    catch (e) { showToast('❌ '+e.message); }
  });
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

    el.innerHTML = `<div class="page-actions"><button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> رجوع</button>
    </div>`;

    if (canEdit) {
      const now = getCairoDate();
      const year = now.getUTCFullYear();
      const prevMonth = (now.getUTCMonth() + 11) % 12;
      el.innerHTML += `<div class="card" style="margin-bottom:16px;border-right:4px solid #17a2b8">
        <div class="card-header" style="padding:10px 16px"><strong><i class="fas fa-edit"></i> إدخال مؤشرات تخزينيه</strong></div>
        <div class="card-body" style="padding:10px 16px">
          <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin-bottom:12px">
            <div class="form-group"><label>السنة</label>
              <select class="form-control" id="siYear" style="width:100px" data-change="loadExistingSmallIndicator">${[2026,2025,2024,2023,2022].map(y => `<option value="${y}" ${y===year?'selected':''}>${y}</option>`).join('')}</select></div>
            <div class="form-group"><label>الشهر</label>
              <select class="form-control" id="siMonth" style="width:120px" data-change="loadExistingSmallIndicator">${months.map((m,i) => `<option value="${i+1}" ${i===prevMonth?'selected':''}>${m}</option>`).join('')}</select></div>
            ${isHospital 
              ? `<div class="form-group" style="min-width:200px"><label>بنك الدم</label><div style="padding:6px 0;font-weight:600">${user.name}</div></div>`
              : `<div class="form-group" style="flex:1;min-width:200px"><label>بنك الدم</label>
                  <select class="form-control" id="siHosp" data-change="loadExistingSmallIndicator">${filteredHospitals.map(h => `<option value="${h.id}">${h.name}</option>`).join('')}</select></div>`
            }
          </div>
          ${buildIndicatorFormHTML(SMALL_COL_DEFS, 'si', 'recalcSmallFormulas')}
          <div style="margin-top:10px"><button class="btn btn-primary" data-click="saveSmallIndicator" style="height:32px"><i class="fas fa-save"></i> حفظ</button></div>
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
    const now = getCairoDate();
    const prevDbMonth = (now.getUTCMonth() + 11) % 12 + 1;
    const prevYear = now.getUTCMonth() === 0 ? now.getUTCFullYear() - 1 : now.getUTCFullYear();
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
          ${canDelete ? `<td><button class="btn btn-sm btn-outline" data-click="deleteSmallIndicator" data-args="${r.id}" style="color:#dc3545"><i class="fas fa-trash"></i></button></td>` : ''}
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
  const saveBtn = document.querySelector('button[data-click="saveSmallIndicator"]');
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
    if (dup) {
      showConfirmModal('⚠ تم إدخال بيانات هذا الشهر مسبقاً!\n\nهل تريد تعديل البيانات؟', async function() {
        await api('POST', '/monthly-small-indicators', { hospitalId, year, month, data });
        showToast('✅ تم تعديل البيانات بنجاح');
        renderSmallIndicators();
      });
      return;
    }
    await api('POST', '/monthly-small-indicators', { hospitalId, year, month, data });
    showToast('✅ تم حفظ البيانات بنجاح');
    renderSmallIndicators();
  } catch (e) { showToast('❌ '+e.message); }
}

async function deleteSmallIndicator(id) {
  showConfirmModal('هل أنت متأكد من حذف هذا السجل؟', async function() {
    try { await api('DELETE', '/monthly-small-indicators/' + id); renderSmallIndicators(); }
    catch (e) { showToast('❌ '+e.message); }
  });
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
    const now = getCairoDate();
    const prevMonth = (now.getUTCMonth() + 11) % 12; // month before current
    const prevMonthVal = prevMonth + 1;
    const prevYear = now.getUTCMonth() === 0 ? now.getUTCFullYear() - 1 : now.getUTCFullYear();
    const canEdit = hasPerm('monthly_indicators', 'edit');
    const canDelete = hasPerm('monthly_indicators', 'delete');
    const govs = [...new Set(hospitals.map(h => h.governorate))];
    const myRole = me?.user?.role || '';
    const myGov = me?.user?.governorate || '';
    const isRestricted = myRole && myRole !== 'admin' && myRole !== 'org_supervisor' && myGov;
    el.innerHTML = `
      <div style="margin-bottom:16px"><button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> الرئيسية</button></div>
      <div class="page-title"><i class="fas fa-chart-line" style="color:#3f51b5"></i> مؤشرات شهرية</div>
      ${canEdit ? `
      ${getCairoDate().getUTCDate() >= 25 ? '<div style="background:#fff3cd;color:#856404;padding:10px 16px;border-radius:8px;margin-bottom:12px;font-size:13px;text-align:center"><i class="fas fa-lock"></i> التعديل مغلق بعد يوم 25 — يتم عرض بيانات الشهر السابق</div>' : ''}
      <div class="card" style="margin-bottom:16px">
        <div class="card-header" style="padding:10px 16px;background:linear-gradient(135deg,#e8eaf6,#f3e5f5)"><strong><i class="fas fa-pen"></i> إدخال مؤشرات الأداء</strong></div>
        <div class="card-body" style="padding:10px 16px">
          <div class="filter-bar" style="margin-bottom:10px">
            <div class="form-group" style="margin:0"><label style="font-size:11px">الفرع</label>
              <select class="form-control" id="monIndGov" data-change="onMonIndGovChange" style="width:140px;height:32px;font-size:12px">
                ${isRestricted ? `<option value="${myGov}" selected>${myGov}</option>` : '<option value="">الكل</option>' + govs.map(g => `<option value="${g}">${g}</option>`).join('')}
              </select></div>
            <div class="form-group" style="margin:0"><label style="font-size:11px">بنك الدم</label>
              <select class="form-control" id="monIndHosp" data-change="onMonIndSelChange" style="min-width:180px;height:32px;font-size:12px"></select></div>
            <div class="form-group" style="margin:0"><label style="font-size:11px">السنة</label>
              <input type="number" class="form-control" id="monIndYear" value="${prevYear}" data-change="onMonIndSelChange" style="width:90px;height:32px;font-size:12px"></div>
            <div class="form-group" style="margin:0"><label style="font-size:11px">الشهر</label>
              <select class="form-control" id="monIndMonth" data-change="onMonIndSelChange" style="width:110px;height:32px;font-size:12px">
                ${MONTHS_AR.map((m, i) => `<option value="${i+1}" ${i === prevMonth ? 'selected' : ''}>${m}</option>`).join('')}
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
            <button class="btn btn-primary" data-click="saveMonthlyIndicatorDirect"><i class="fas fa-save"></i> حفظ</button>
            <button class="btn btn-outline" data-click="onMonIndSelChange"><i class="fas fa-sync-alt"></i> تحميل البيانات</button>
          </div>
        </div>
      </div>` : ''}
      <div class="page-actions">
        ${canDelete ? '<button class="btn btn-outline" data-click="archiveAllIndicators" style="color:#795548"><i class="fas fa-archive"></i> أرشفة الكل</button>' : ''}
        <select class="search-input" id="indTypeFilter" data-change="renderMonthlyIndicators">
          <option value="">كل الأنواع</option>
          <option value="تجميعي" ${presetType === 'تجميعي' ? 'selected' : ''}>تجميعي</option>
          <option value="تخزيني" ${presetType === 'تخزيني' ? 'selected' : ''}>تخزيني</option>
        </select>
        <select class="search-input" id="indGovFilter" data-change="indGovFilterChanged">
          ${isRestricted ? `<option value="${myGov}" selected>${myGov}</option>` : '<option value="">كل المحافظات</option>' + govs.map(g => `<option value="${g}">${g}</option>`).join('')}
        </select>
        <select class="search-input" id="indHospitalFilter" data-change="renderMonthlyIndicators">
          ${isRestricted ? hospitals.filter(h => h.governorate === myGov).map(h => `<option value="${h.id}">${h.name}</option>`).join('') : '<option value="">كل المستشفيات</option>' + hospitals.map(h => `<option value="${h.id}">${h.name}</option>`).join('')}
        </select>
        <input type="number" class="search-input" id="indYearFilter" value="${now.getUTCFullYear()}" style="width:80px" data-change="renderMonthlyIndicators">
        <select class="search-input" id="indMonthFilter" data-change="renderMonthlyIndicators">
          <option value="">الشهرين الأخيرين</option>
          ${MONTHS_AR.map((m, i) => `<option value="${i+1}">${m}</option>`).join('')}
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
    const filtMonth = document.getElementById('indMonthFilter').value;
    const params = new URLSearchParams({ year: document.getElementById('indYearFilter').value });
    if (filtMonth) params.set('month', filtMonth);
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
  showConfirmModal('هل أنت متأكد من أرشفة جميع مؤشرات الأداء؟', async function() {
    try {
      const res = await api('POST', '/monthly-indicators/archive');
      showToast('✅ ' + res.message);
      renderMonthlyIndicators();
    } catch (e) { showToast('❌ '+e.message); }
  });
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
  const totalOut = (d.out_blood_int||0) + (d.out_blood_branch||0) + (d.out_blood_auth||0) + (d.out_blood_ext||0);
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
  const hospRecords = {};
  data.forEach(r => {
    if (!hospRecords[r.hospital_id]) hospRecords[r.hospital_id] = [];
    hospRecords[r.hospital_id].push(r);
  });
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
    const filtMonth = parseInt(document.getElementById('indMonthFilter')?.value) || 0;
    let headerHtml = makeGroupHeader(colDefs);
    headerHtml = headerHtml.replace(/(rowspan="[23]">بنك الدم<\/th>)/, '$1<th rowspan="3" style="min-width:44px;font-size:11px;color:#5A7A9A">الشهر</th><th rowspan="3" style="min-width:55px;font-size:11px;color:#5A7A9A">المدخل</th>');
    let h = `<h3 style="margin:24px 0 10px;font-size:16px;color:#2c3e50;border-right:4px solid #dc3545;padding-right:10px">${label}</h3>
      <div class="table-wrap"><table class="ind-table"><thead>${headerHtml}</thead><tbody>`;
    showHospitals.forEach(hosp => {
      const records = (hospRecords[hosp.id] || []).sort((a, b) => (b.year||0)- (a.year||0) || (b.month||0)- (a.month||0));
      if (!records.length) {
        const d = {}, f = computeFn(d);
        h += `<tr data-rid="" data-hid="${hosp.id}" data-type="${t}">`;
        let colIdx = 0;
        colDefs.forEach(c => {
          let val = getCellValue(hosp, null, d, f, c);
          const isEditable = canEdit && !c.formula && c.key !== 'governorate' && c.key !== 'hospital_name';
          let cls = c.cls || (c.formula ? 'formula-cell' : '');
          h += `<td class="${cls}">${val}</td>`;
          colIdx++;
          if (colIdx === 2) { h += '<td style="white-space:nowrap;font-size:11px;color:#5A7A9A;font-weight:600">—</td><td style="white-space:nowrap;font-size:11px;color:#555;text-align:center"></td>'; }
        });
        const addBtn = canEdit ? `<button class="btn btn-sm btn-outline" data-click="showAddIndModal" data-args="${hosp.id},'${t}'"><i class="fas fa-plus"></i></button>` : '';
        h += `<td style="white-space:nowrap">${addBtn}</td></tr>`;
        return;
      }
      records.forEach(r => {
        const d = r ? (r.data || {}) : {};
        const f = computeFn(d);
        const m = months[(r.month||1)-1] + ' ' + (r.year||'');
        h += `<tr data-rid="${r.id}" data-hid="${hosp.id}" data-type="${t}">`;
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
          if (colIdx === 2) { h += `<td style="white-space:nowrap;font-size:11px;color:#5A7A9A;font-weight:600">${m}</td><td style="white-space:nowrap;font-size:11px;color:#555;text-align:center">${r.entered_by || ''}</td>`; }
        });
        const delBtn = canDelete ? `<button class="btn btn-sm btn-outline-danger" data-click="deleteIndicator" data-args="${r.id}" style="margin-right:4px"><i class="fas fa-trash"></i></button>` : '';
        h += `<td style="white-space:nowrap">${delBtn}</td></tr>`;
      });
    });
    if (!showHospitals.length) h += `<tr><td colspan="${colDefs.length + 3}" class="empty-msg">لا توجد مستشفيات</td></tr>`;
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
      const year = parseInt(document.getElementById('indYearFilter')?.value) || getCairoDate().getUTCFullYear();
      const month = parseInt(document.getElementById('indMonthFilter')?.value) || getCairoDate().getUTCMonth() + 1;
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
    showToast('❌ '+e.message);
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
  const now = getCairoDate();
  html += `</select></div>
    <div class="form-group"><label>السنة</label><input type="number" class="form-control" id="fIndYear" value="${now.getUTCFullYear()}"></div>
    <div class="form-group"><label>الشهر</label><select class="form-control" id="fIndMonth">
      ${['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'].map((m, i) => `<option value="${i+1}" ${i === now.getUTCMonth() ? 'selected' : ''}>${m}</option>`).join('')}
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
    `<button class="btn btn-secondary" data-click="closeModal">إلغاء</button><button class="btn btn-primary" data-click="createIndicator" data-args="'${type}'">حفظ</button>`);
}

async function createIndicator(type) {
  const hospitalId = parseInt(document.getElementById('fIndHospital').value);
  const year = parseInt(document.getElementById('fIndYear').value);
  const month = parseInt(document.getElementById('fIndMonth').value);
  if (!hospitalId) { showToast('⚠ اختر المستشفى'); return; }
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
  } catch (e) { showToast('❌ '+e.message); }
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
    `<button class="btn btn-secondary" data-click="closeModal">إلغاء</button><button class="btn btn-primary" data-click="updateIndicator" data-args="${id}">حفظ</button>`);
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
  } catch (e) { showToast('❌ '+e.message); }
}

async function deleteIndicator(id) {
  showConfirmModal('هل أنت متأكد من حذف هذه المؤشرات؟', async function() {
    try {
      await api('DELETE', '/monthly-indicators/' + id);
      renderMonthlyIndicators();
    } catch (e) { showToast('❌ '+e.message); }
  });
}

// ============== Archive edit/delete for indicators ==============

async function editIndicatorArchiveRecord(archiveId, hospitalId, year, month, period) {
  try {
    const items = await api('GET', '/archive');
    const arch = items.find(a => a.id === archiveId);
    if (!arch) { showToast('⚠ لم يتم العثور على الأرشيف'); return; }
    let dataArr = tryParse(arch.data) || [];
    const record = dataArr.find(r => parseInt(r.hospital_id) === hospitalId && r.year === year && (month > 0 ? r.month === month : true) && (r.period || 'monthly') === (period || 'monthly'));
    if (!record) { showToast('⚠ لم يتم العثور على السجل'); return; }
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
      `<button class="btn btn-secondary" data-click="closeModal">إلغاء</button>
      <button class="btn btn-primary" data-click="saveEditIndicatorArchive" data-args="${archiveId},${hospitalId},${year},${month},'${period}'">حفظ</button>`);
  } catch (e) { showToast('❌ '+e.message); }
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
    if (!arch) { showToast('⚠ لم يتم العثور على الأرشيف'); return; }
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
  } catch (e) { showToast('❌ '+e.message); }
}

async function deleteIndicatorArchiveRecord(archiveId, hospitalId, year, month, period) {
  showConfirmModal('هل أنت متأكد من حذف هذا السجل من الأرشيف؟', async function() {
    try {
      const items = await api('GET', '/archive');
      const arch = items.find(a => a.id === archiveId);
      if (!arch) { showToast('⚠ لم يتم العثور على الأرشيف'); return; }
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
    } catch (e) { showToast('❌ '+e.message); }
  });
}

// ============== Equipment Management (الأجهزة) ==============

const EQ_GOV_COLORS = {
  'بورسعيد':'#3498db','الإسماعيلية':'#e67e22','السويس':'#2ecc71',
  'الأقصر':'#9b59b6','جنوب سيناء':'#f39c12','أسوان':'#e74c3c'
};
function eqGovSort(a,b){let ia=GOV_ORDER.indexOf(a),ib=GOV_ORDER.indexOf(b);if(ia===-1&&ib===-1)return a.localeCompare(b,'ar');if(ia===-1)return 1;if(ib===-1)return -1;return ia-ib;}
const GOV_ORDER = ['بورسعيد','الإسماعيلية','السويس','الأقصر','جنوب سيناء','أسوان'];
function eqStatusColor(s) {
  if (!s) return '#bbb';
  if (s==='يعمل'||s.includes('جيد')||s.includes('ممتاز')||s.includes('كفئ')) return '#27ae60';
  return '#e74c3c';
}

function eqDeviceDot(eq) {
  if (!eq || (eq.count == null && !eq.status)) return '<span class="eq-dot" style="background:#eee;border:1px solid #ddd" title="لا توجد بيانات"></span>';
  const sc = eqStatusColor(eq.status);
  const cnt = eq.count != null ? eq.count : '?';
  return `<span class="eq-dot" style="background:${sc}" title="العدد: ${cnt} | الحالة: ${eq.status||'—'}">${cnt}</span>`;
}

async function renderEquipment() {
  const el = document.getElementById('mainContent');
  const canAdd = hasPerm('equipment', 'add');
  const canEdit = hasPerm('equipment', 'edit');
  const canDelete = hasPerm('equipment', 'delete');
  const canExport = hasPerm('equipment', 'export');
  try {
    const data = await api('GET', '/equipment');
    const types = data.types || [];
    const hospitals = data.hospitals || [];
    const typeList = types.map(function(t){return t.name;}).sort();
    // Collect unique device types from actual data
    let allDeviceNames = [];
    hospitals.forEach(function(h){Object.keys(h.equipment).forEach(function(tid){const t=types.find(function(tp){return tp.id===parseInt(tid);});if(t&&!allDeviceNames.includes(t.name))allDeviceNames.push(t.name);});});
    allDeviceNames.sort();
    const govKeys = [...new Set(hospitals.map(function(h){return h.governorate||'أخرى';}))].sort(eqGovSort);
    const eqUserObj = window._user;
    const eqRole = eqUserObj?.role || '';
    const eqGov = eqUserObj?.governorate || '';
    const eqRestricted = eqRole && eqRole !== 'admin' && eqRole !== 'org_supervisor' && eqGov;
    const showCount = localStorage.getItem('eq_showCount')!=='0';
    const showBrand = localStorage.getItem('eq_showBrand')!=='0';
    const showStatus = localStorage.getItem('eq_showStatus')!=='0';
    el.innerHTML = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap">'+
      '<button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> الرئيسية</button>'+
      '<span style="font-size:15px;font-weight:700;color:#2c3e50;margin-left:auto"><i class="fas fa-microchip" style="margin-left:6px;color:#2c3e50"></i>أجهزة بنوك الدم</span>'+
      (canEdit?'<button class="btn btn-sm btn-primary" data-click="eqManageTypes" style="padding:4px 10px;font-size:11px"><i class="fas fa-cog"></i> إدارة الأنواع</button>':'')+
      (canAdd?'<button class="btn btn-sm btn-primary" data-click="eqOpenForm" style="padding:4px 10px;font-size:11px"><i class="fas fa-plus"></i> إضافة</button>':'')+
      (canDelete?'<button class="btn btn-sm btn-danger" data-click="eqShowDeleteForm" style="padding:4px 10px;font-size:11px"><i class="fas fa-trash"></i> حذف</button>':'')+
      (canExport?'<button class="btn btn-sm btn-success" data-click="eqExportXlsx" style="padding:4px 10px;font-size:11px"><i class="fas fa-file-excel"></i> Excel</button>':'')+
      (canExport?'<button class="btn btn-sm btn-danger" data-click="eqExportPdf" style="padding:4px 10px;font-size:11px"><i class="fas fa-file-pdf"></i> PDF</button>':'')+
    '</div>'+
    // Filters + toggles row
    '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;align-items:center;background:#f8f9fa;border-radius:8px;padding:8px 10px">'+
      '<select id="eqGovFilter" data-change="eqFilterHosp" class="form-control" style="width:auto;font-size:11px;padding:3px 8px">'+
        (eqRestricted ?
          '<option value="'+esc(eqGov)+'">'+esc(eqGov)+'</option>' :
          '<option value="">كل المحافظات ('+hospitals.length+')</option>'+
          govKeys.map(function(g){return '<option value="'+esc(g)+'">'+esc(g)+'</option>';}).join(''))+
      '</select>'+
      '<select id="eqCatFilter" data-change="eqFilterHosp" class="form-control" style="width:auto;font-size:11px;padding:3px 8px">'+
        '<option value="">كل الأنواع</option>'+
        '<option value="تجميعي">تجميعي</option>'+
        '<option value="تخزيني">تخزيني</option>'+
        '<option value="تجميعي وتخزيني">تجميعي وتخزيني</option>'+
      '</select>'+
      '<select id="eqStatusFilter" data-change="eqFilterHosp" class="form-control" style="width:auto;font-size:11px;padding:3px 8px">'+
        '<option value="">كل الحالات</option>'+
        '<option value="يعمل">يعمل</option>'+
        '<option value="لا يعمل">لا يعمل</option>'+
      '</select>'+
      '<select id="eqTypeFilter" data-change="eqFilterHosp" class="form-control" style="width:auto;font-size:11px;padding:3px 8px">'+
        '<option value="">كل الأجهزة</option>'+
        allDeviceNames.map(function(n){return '<option value="'+esc(n)+'">'+esc(n)+'</option>';}).join('')+
      '</select>'+
      '<select id="eqBrandFilter" data-change="eqFilterHosp" class="form-control" style="width:auto;font-size:11px;padding:3px 8px;display:none">'+
        '<option value="">كل الماركات</option>'+
      '</select>'+
      '<span style="margin-right:auto"></span>'+
      (window._user&&(window._user.role==='admin'||window._user.role==='org_supervisor'||window._user.role==='branch_supervisor')?
        '<label style="display:flex;align-items:center;gap:3px;font-size:10px;color:#555;cursor:pointer"><input type="checkbox" id="eqGroupView" data-change="eqToggleGroup"'+(localStorage.getItem('eq_groupView')!=='0'?' checked':'')+'> <i class="fas fa-chart-pie" style="font-size:9px;color:#2c3e50"></i> عرض الملخص</label>':'')+
    '</div>'+
    // review section rendered inside eqRenderTable
    '' +
    '<div id="eqTable"></div>'
    try { window.__eqData = { types: types, hospitals: hospitals }; } catch(e){}
    eqRenderTable(types, hospitals);
    const _eqU = window._user;
    if (_eqU && (_eqU.role === 'hospital' || _eqU.role === 'hospital_manager') && _eqU.hospitalId) {
      api('GET', '/hospitals').then(function(allH) {
        const hospName = allH.find(function(h){return h.id === _eqU.hospitalId;})?.name;
        if (hospName) {
          const mh = hospitals.find(function(h){return h.name === hospName;});
          if (mh) setTimeout(function(){eqOpenForm(mh.name);},300);
        }
      }).catch(function(){});
    }
  } catch (e) { el.innerHTML = '<div class="empty-msg">'+esc(e.message)+'</div>'; }
}

function eqToggleGroup() {
  const cb = document.getElementById('eqGroupView');
  if (cb) localStorage.setItem('eq_groupView', cb.checked?'1':'0');
  const d = window.__eqData;
  if (d) eqRenderTable(d.types, d.hospitals);
}

function eqToggleCol() {
  const c = document.getElementById('eqToggleCount'); if (c) localStorage.setItem('eq_showCount', c.checked?'1':'0');
  const s = document.getElementById('eqToggleStatus'); if (s) localStorage.setItem('eq_showStatus', s.checked?'1':'0');
  const d = window.__eqData;
  if (d) eqRenderTable(d.types, d.hospitals);
}

function eqFilterHosp() {
  const d = window.__eqData;
  if (d) eqRenderTable(d.types, d.hospitals);
}

// --- Unified equipment table ---
function eqRenderTable(allTypes, hospitals) {
  window.__eqData = { types: allTypes, hospitals: hospitals };
  const wrap = document.getElementById('eqTable');
  if (!wrap) return;
  const govF = document.getElementById('eqGovFilter')?.value || '';
  const catF = document.getElementById('eqCatFilter')?.value || '';
  const statusF = document.getElementById('eqStatusFilter')?.value || '';
  const typeF = document.getElementById('eqTypeFilter')?.value || '';
  const showCount = document.getElementById('eqToggleCount')?.checked !== false;
  const showBrand = document.getElementById('eqToggleBrand')?.checked !== false;
  const showStatus = document.getElementById('eqToggleStatus')?.checked !== false;
  let rows = [];
  hospitals.forEach(function(h){
    if (govF && (h.governorate||'أخرى') !== govF) return;
    Object.keys(h.equipment).forEach(function(tid){
      let e = h.equipment[tid];
      if (!e) return;
      const t = allTypes.find(function(tp){return tp.id===parseInt(tid);});
      if (!t) return;
      if (catF && t.category !== catF) return;
      // Handle both array (new format) and object (old format)
      let entries = Array.isArray(e) ? e : [];
      if (!Array.isArray(e) && typeof e === 'object') {
        let cnt = e.count || 1;
        for (let i = 0; i < cnt; i++) entries.push({ brand: e.brand || '', status: e.status || '' });
      }
      entries.forEach(function(entry){
        if (statusF && entry.status !== statusF) return;
        rows.push({ hospital: h.name, gov: h.governorate||'', type: t.name, cat: t.category||'', count: 1, brand: entry.brand||'', status: entry.status||'' });
      });
    });
  });
  let reviewHtml = '';
  let groupHtml = '';
  if (!rows.length) {
    // Still render the pivot table structure (with headers only) so export works
    let h = '';
    if (reviewHtml || groupHtml) {
      h += '<div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap">'+
        (reviewHtml || '') + (groupHtml || '') +
      '</div>';
    }
    h += '<div id="eqPivotTable" style="background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);margin-top:12px">'+
      '<div style="background:#1a1a2e;color:#fff;padding:7px 12px;font-size:12px;display:flex;align-items:center;gap:6px">'+
      '<i class="fas fa-table"></i> <strong>الأجهزة بالمستشفيات</strong></div>'+
      '<div style="overflow-x:auto"><table class="eq-pivot" style="width:100%;border-collapse:collapse;font-size:10px">'+
      '<thead><tr style="background:#2c3e50;color:#fff">'+
      '<th style="padding:5px 6px;border:1px solid #1a252f;color:#fff">المحافظة</th>'+
      '<th style="padding:5px 6px;border:1px solid #1a252f;color:#fff">المستشفى</th>'+
      '<th style="padding:5px 6px;border:1px solid #1a252f;color:#fff">لا توجد بيانات</th>'+
      '</tr></thead><tbody></tbody></table></div></div>';
    wrap.innerHTML = h;
    return;
  }
  if (typeF) rows = rows.filter(function(r){return r.type===typeF;});
  // Brand filter
  let brandsSet = new Set();
  rows.forEach(function(r){ if (r.brand) brandsSet.add(r.brand); });
  let brandFilter = document.getElementById('eqBrandFilter');
  if (brandFilter) {
    brandFilter.style.display = brandsSet.size ? '' : 'none';
    while (brandFilter.options.length > 1) brandFilter.remove(1);
    brandsSet.forEach(function(b){
      let opt = document.createElement('option');
      opt.value = b; opt.text = b;
      brandFilter.appendChild(opt);
    });
  }
  let brandF = brandFilter?.value || '';
  if (brandF) rows = rows.filter(function(r){return r.brand===brandF;});
  const groupView = document.getElementById('eqGroupView')?.checked;
  const _canEdit = hasPerm('equipment', 'edit');
  const _canExport = hasPerm('equipment', 'export');
  let typeAgg = {};
  rows.forEach(function(r){
    if (!typeAgg[r.type]) typeAgg[r.type] = { total: 0, good: 0, bad: 0 };
    typeAgg[r.type].total++;
    if (r.status&&(r.status==='يعمل'||r.status.includes('جيد')||r.status.includes('ممتاز')||r.status.includes('كفئ'))) typeAgg[r.type].good++;
    else if (r.status&&(r.status==='لا يعمل'||r.status.includes('سيئ')||r.status.includes('عطل')||r.status.includes('غير كفئ'))) typeAgg[r.type].bad++;
  });
  let typeNames = Object.keys(typeAgg).sort();
  // Build review + group summary (side by side)
  let topHtml = '';
  if (_canEdit) {
    const curMonthCheck = curMonthCairo();
    const unreviewed = hospitals.filter(function(hr){ return !hr.reviewed || hr.review_month !== curMonthCheck; });
    const byGov = {};
    unreviewed.forEach(function(hr){
      const g = hr.governorate || 'أخرى';
      if (!byGov[g]) byGov[g] = [];
      byGov[g].push(hr);
    });
    const rowsHtml = Object.keys(byGov).sort().map(function(g){
      return byGov[g].map(function(hr){
        return '<tr data-click="eqOpenForm" data-args="\''+esc(hr.name)+'\'" style="cursor:pointer">'+
          '<td style="padding:2px 6px;font-size:9px">'+esc(g)+'</td>'+
          '<td style="padding:2px 6px;font-size:9px"><strong>'+esc(hr.name)+'</strong></td>'+
          '<td style="padding:2px 6px;text-align:center;font-size:9px">'+(hr.equipment?Object.keys(hr.equipment).length:'0')+' جهاز</td>'+
          '<td style="padding:2px 6px;text-align:center"><button class="btn btn-xs" data-click="eqReviewHospital" data-args="\''+esc(hr.name)+'\'" style="color:#fff;background:#1976d2;border:none;padding:2px 8px;border-radius:4px;font-size:9px;cursor:pointer"><i class="fas fa-check"></i></button></td>'+
        '</tr>';
      }).join('');
    }).join('');
    if (rowsHtml) {
      reviewHtml = '<div style="flex:1;min-width:280px;background:#fff;border-radius:6px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-right:3px solid #1976d2">'+
        '<div style="background:#e3f2fd;padding:4px 8px;font-size:10px;display:flex;align-items:center;gap:4px">'+
        '<i class="fas fa-check-double" style="color:#1976d2;font-size:9px"></i> <strong style="color:#1565c0;font-size:10px">مراجعة الأجهزة</strong>'+
        '<span style="margin-right:auto;font-size:9px;color:#999">'+unreviewed.length+' مستشفى</span></div>'+
        '<div style="overflow-x:auto;max-height:210px;overflow-y:auto"><table style="width:100%;font-size:9px;border-collapse:collapse">'+
        '<thead><tr style="background:#f5f5f5;position:sticky;top:0"><th style="padding:2px 6px;text-align:right;font-size:9px">الفرع</th><th style="padding:2px 6px;text-align:right;font-size:9px">بنك الدم</th><th style="padding:2px 6px;text-align:center;font-size:9px">الأجهزة</th><th style="padding:2px 6px;text-align:center;font-size:9px"></th></tr></thead>'+
        '<tbody>'+rowsHtml+'</tbody></table></div></div>';
    } else {
      reviewHtml = '<div style="flex:1;min-width:280px;background:#f0fdf4;border-radius:6px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-right:3px solid #2e7d32;display:flex;align-items:center;justify-content:center;padding:8px">'+
        '<span style="color:#2e7d32;font-size:10px;display:flex;align-items:center;gap:4px"><i class="fas fa-check-circle"></i> تمت المراجعة</span></div>';
    }
  }
  if (groupView) {
    groupHtml = '<div style="flex:1;min-width:280px;background:#fff;border-radius:6px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-right:3px solid #1a1a2e">'+
      '<div style="background:#1a1a2e;color:#fff;padding:4px 8px;font-size:10px;display:flex;align-items:center;gap:4px">'+
      '<i class="fas fa-chart-pie" style="font-size:9px"></i> <strong style="font-size:10px">ملخص الأجهزة</strong>'+
      '<span style="margin-right:auto;font-size:9px;color:rgba(255,255,255,0.5)">'+rows.length+' سجل</span></div>'+
      '<div style="overflow-x:auto;max-height:210px;overflow-y:auto"><table style="width:100%;font-size:9px;border-collapse:collapse">'+
      '<thead><tr style="background:#f5f6fa;position:sticky;top:0;z-index:1">'+
      '<th style="padding:2px 6px;text-align:right;border-bottom:1px solid #ddd;color:#2c3e50;font-size:9px">الجهاز</th>'+
      '<th style="padding:2px 6px;text-align:center;border-bottom:1px solid #ddd;color:#2c3e50;font-size:9px">النوع</th>'+
      '<th style="padding:2px 6px;text-align:center;border-bottom:1px solid #ddd;color:#2c3e50;font-size:9px">الإجمالي</th>'+
      '<th style="padding:2px 6px;text-align:center;border-bottom:1px solid #ddd;color:#27ae60;font-size:9px">يعمل</th>'+
      '<th style="padding:2px 6px;text-align:center;border-bottom:1px solid #ddd;color:#e74c3c;font-size:9px">لا يعمل</th></tr></thead><tbody>';
    typeNames.forEach(function(tn){
      const a = typeAgg[tn];
      const tObj = allTypes.find(function(tp){return tp.name===tn;});
      const cat = tObj?tObj.category||'—':'—';
      const catColor = cat==='تجميعي وتخزيني'?'#8e44ad':(cat==='تخزيني'?'#2980b9':'#27ae60');
      groupHtml += '<tr style="border-bottom:1px solid #f0f0f0">'+
        '<td style="padding:2px 6px;font-weight:600;color:#2c3e50;font-size:9px">'+esc(tn)+'</td>'+
        '<td style="padding:2px 6px;text-align:center;font-size:9px"><span style="display:inline-block;padding:0 6px;border-radius:6px;font-size:8px;color:#fff;background:'+catColor+'">'+esc(cat)+'</span></td>'+
        '<td style="padding:2px 6px;text-align:center;font-weight:700;font-size:9px">'+a.total+'</td>'+
        '<td style="padding:2px 6px;text-align:center;color:#27ae60;font-size:9px">'+a.good+'</td>'+
        '<td style="padding:2px 6px;text-align:center;color:#e74c3c;font-size:9px">'+a.bad+'</td></tr>';
    });
    groupHtml += '</tbody></table></div></div>';
  }
  // Side-by-side row: review | group summary
  let h = '';
  if (reviewHtml || groupHtml) {
    h += '<div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap">'+
      (reviewHtml || '') + (groupHtml || '') +
    '</div>';
  }
  // --- Pivot table (one row per hospital, one column per type) ---
  // Build type list: show all unfiltered types (or filtered if typeF specified)
  let pivotTypes = allTypes.filter(function(t){
    if (catF && t.category !== catF) return false;
    if (typeF && t.name !== typeF) return false;
    return true;
  });
  // Sort types by category then name (collection first, then storage)
  pivotTypes.sort(function(a,b){
    let ca = a.category==='تجميعي'?0:(a.category==='تجميعي وتخزيني'?1:2);
    let cb = b.category==='تجميعي'?0:(b.category==='تجميعي وتخزيني'?1:2);
    if (ca !== cb) return ca - cb;
    return a.name.localeCompare(b.name, 'ar');
  });
  let pivotCols = 3 + pivotTypes.length + (_canEdit?1:0);
  // Build hospital rows (one per hospital)
  let hospMap = {};
  rows.forEach(function(r){
    let key = r.hospital + '|' + (r.gov||'');
    if (!hospMap[key]) hospMap[key] = { hospital: r.hospital, gov: r.gov||'', devByType: {} };
    hospMap[key].devByType[r.type] = { count: r.count, brand: r.brand, status: r.status };
  });
  let hospArr = Object.keys(hospMap).sort().map(function(k){return hospMap[k];});
  h += '<div id="eqPivotTable" style="background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,0.08);margin-top:12px">'+
    '<div style="background:#1a1a2e;color:#fff;padding:7px 12px;font-size:12px;display:flex;align-items:center;gap:6px">'+
    '<i class="fas fa-table"></i> <strong>الأجهزة بالمستشفيات</strong>'+
    '<span style="margin-right:auto;font-size:11px;color:rgba(255,255,255,0.55)"><a href="javascript:void(0)" data-click="eqOpenForm" style="color:rgba(255,255,255,0.7);text-decoration:none"><i class="fas fa-plus-circle"></i> إضافة</a></span>' +
    '<div style="display:flex;gap:4px">' +
      (_canExport ? '<button class="btn btn-sm" data-click="eqExportXlsx" style="background:#10b981;color:#fff;border:none;padding:3px 8px;border-radius:4px;font-size:9px;display:flex;align-items:center;gap:4px"><i class="fas fa-file-excel"></i> تنزيل Excel</button>' : '') +
      (_canExport ? '<button class="btn btn-sm" data-click="eqExportPdf" style="background:#ef4444;color:#fff;border:none;padding:3px 8px;border-radius:4px;font-size:9px;display:flex;align-items:center;gap:4px"><i class="fas fa-file-pdf"></i> تنزيل PDF</button>' : '') +
    '</div>' +
    '</div>' +
    '<div style="overflow-x:auto"><table class="eq-pivot" style="width:100%;border-collapse:collapse;font-size:10px">'+
    '<thead><tr style="background:#2c3e50;position:sticky;top:0;z-index:1;color:#fff">'+
    '<th rowspan="2" style="padding:5px 6px;text-align:right;border:1px solid #1a252f;color:#fff;min-width:70px">المحافظة</th>'+
    '<th rowspan="2" style="padding:5px 6px;text-align:right;border:1px solid #1a252f;color:#fff;min-width:100px">المستشفى</th>';
  pivotTypes.forEach(function(t){
    h += '<th rowspan="1" style="padding:5px 3px;text-align:center;border:1px solid #1a252f;color:#fff;min-width:70px;font-weight:600;background:#2c3e50;word-break:break-word;white-space:normal;line-height:1.3"><span style="font-size:9px">'+esc(t.name)+'</span></th>';
  });
  h += (_canEdit?'<th rowspan="2" style="padding:5px 6px;text-align:center;border:1px solid #1a252f;color:#fff;width:36px"></th>':'')+
    '</tr><tr style="background:#2c3e50;position:sticky;top:32px;z-index:1;color:#fff">';
  pivotTypes.forEach(function(t){
    h += '<th style="padding:3px 2px;text-align:center;border:1px solid #1a252f;color:rgba(255,255,255,0.8);font-size:8px;font-weight:400">عدد</th>';
  });
  h += '</tr></thead><tbody>';
  // Group by governorate with rowspan
  let hospByGov = {};
  hospArr.forEach(function(hr){let g=hr.gov||'أخرى';if(!hospByGov[g])hospByGov[g]=[];hospByGov[g].push(hr);});
  let hGovKeys = Object.keys(hospByGov).sort(eqGovSort);
  let rowIdx = 0;
  hGovKeys.forEach(function(gov){
    const gc = EQ_GOV_COLORS[gov] || '#6c757d';
    hospByGov[gov].forEach(function(hr, idx){
      if (idx === 0) {
        h += '<tr style="border-bottom:1px solid #eee;background:'+ (rowIdx%2===0?'#fff':'#f8f9fa') +'">'+
          '<td style="padding:4px 6px;color:#888;font-size:9px;border:1px solid #f0f0f0" rowspan="'+hospByGov[gov].length+'"><span style="color:'+gc+';font-weight:600">'+esc(hr.gov)+'</span></td>'+
          '<td style="padding:4px 6px;font-weight:600;border:1px solid #f0f0f0"><a href="javascript:void(0)" data-click="eqOpenForm" data-args="\''+esc(hr.hospital)+'\'" style="color:#2c3e50;text-decoration:none">'+esc(hr.hospital)+'</a></td>';
      } else {
        h += '<tr style="border-bottom:1px solid #eee;background:'+ (rowIdx%2===0?'#fff':'#f8f9fa') +'">'+
          '<td style="padding:4px 6px;font-weight:600;border:1px solid #f0f0f0"><a href="javascript:void(0)" data-click="eqOpenForm" data-args="\''+esc(hr.hospital)+'\'" style="color:#2c3e50;text-decoration:none">'+esc(hr.hospital)+'</a></td>';
      }
      pivotTypes.forEach(function(t){
        let d = hr.devByType[t.name];
        if (d) {
          let sc = '#bbb';
          if (d.status==='لا يعمل'||d.status.includes('سيئ')||d.status.includes('عطل')||d.status.includes('غير كفئ')) sc = '#e74c3c';
          else if (d.status==='يعمل'||d.status.includes('جيد')||d.status.includes('ممتاز')||d.status.includes('كفئ')) sc = '#27ae60';
          let cnt = d.count!=null?d.count:'—';
          h += '<td style="padding:3px 4px;text-align:center;border:1px solid #f0f0f0">'+
            '<span style="font-weight:700;font-size:11px;color:'+sc+'">'+cnt+'</span>'+
            '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:'+sc+';margin-right:3px;vertical-align:middle"></span></td>';
        } else {
          h += '<td style="padding:3px 4px;text-align:center;border:1px solid #f0f0f0;color:#ddd;font-size:9px">—</td>';
        }
      });
      h += (_canEdit?'<td style="padding:3px 4px;text-align:center;border:1px solid #f0f0f0"><button class="btn btn-xs" data-click="eqOpenForm" data-args="\''+esc(hr.hospital)+'\'" style="color:#3498db;background:none;border:none;cursor:pointer;padding:2px" title="تعديل"><i class="fas fa-edit"></i></button></td>':'')+
        '</tr>';
      rowIdx++;
    });
  });
  h += '</tbody></table></div></div>';
  wrap.innerHTML = h;
}

// --- Modal-based edit form ---

function eqSyncDeviceRows(tid) {
  const list = document.getElementById('eqDevList_' + tid);
  const countInput = document.getElementById('eqCount_' + tid);
  if (!list || !countInput) return;
  let target = parseInt(countInput.value) || 0;
  if (target < 0) target = 0;
  let current = list.querySelectorAll('.eq-dev-row').length;
  while (current < target) {
    const div = document.createElement('div');
    div.className = 'eq-dev-row';
    div.dataset.tid = tid;
    div.style.cssText = 'display:flex;gap:4px;align-items:center;margin-bottom:3px';
    div.innerHTML = '<input type="text" class="form-input eq-dev-brand" style="flex:1;font-size:10px;padding:2px 4px" list="eqBrandList" autocomplete="off" placeholder="الماركة">' +
      '<select class="form-input eq-dev-status" style="width:70px;font-size:10px;padding:2px 4px"><option value="">—</option><option value="يعمل">يعمل</option><option value="لا يعمل">لا يعمل</option></select>' +
      '<button type="button" data-click="eqRemoveSingleRow" data-args="' + tid + '" style="background:none;border:none;color:#e74c3c;cursor:pointer;padding:2px;font-size:12px" title="حذف"><i class="fas fa-times"></i></button>';
    list.appendChild(div);
    current++;
  }
  while (current > target) {
    const last = list.querySelector('.eq-dev-row:last-child');
    if (last) last.remove();
    current--;
  }
  const badge = document.getElementById('eqBadge_' + tid);
  if (badge) badge.textContent = '(' + target + ')';
}

function eqRemoveSingleRow(tid, btn) {
  const row = btn.closest('.eq-dev-row');
  if (row) row.remove();
  const list = document.getElementById('eqDevList_' + tid);
  if (list) {
    const remaining = list.querySelectorAll('.eq-dev-row').length;
    const countInput = document.getElementById('eqCount_' + tid);
    if (countInput) countInput.value = remaining;
    const badge = document.getElementById('eqBadge_' + tid);
    if (badge) badge.textContent = '(' + remaining + ')';
  }
}

function eqOpenForm(hospName) {
  const canEdit = hasPerm('equipment', 'edit');
  if (!canEdit) { showToast('⚠ غير مصرح لك بالتعديل'); return; }
  (async () => {
    try {
      const data = await api('GET', '/equipment');
      const types = data.types || [];
      let entry = hospName ? data.hospitals.find(h => h.name === hospName) : null;
      if (!entry && hospName) {
        const allH = await api('GET', '/hospitals');
        const h = allH.find(hh => hh.name === hospName);
        entry = { name: hospName, governorate: h ? h.governorate : '', equipment: {} };
      }
      let bodyHtml = '';
      if (!hospName) {
        bodyHtml = `<div style="padding:10px">
          <label>اختر المستشفى:</label>
          <select id="eqNewHospSelect" class="form-input" style="width:100%;margin:8px 0">
            <option value="">-- اختر --</option>`;
        const allH = await api('GET', '/hospitals');
        allH.forEach(h => {
          bodyHtml += `<option value="${esc(h.name)}" data-gov="${esc(h.governorate)}">${esc(h.name)} (${esc(h.governorate)})</option>`;
        });
        bodyHtml += `</select>
          <button class="btn btn-primary" data-click="eqCreateNewEntry" style="width:100%"><i class="fas fa-check"></i> بدء</button>
        </div>`;
      } else {
        const stTypes = types.filter(t => t.category === 'تجميعي وتخزيني' || t.category === 'تخزيني');
        const ctTypes = types.filter(t => t.category === 'تجميعي');
        let allBrands = [];
        data.hospitals.forEach(function(h) { Object.values(h.equipment).forEach(function(e) { if (e) { let arr=Array.isArray(e)?e:[e]; arr.forEach(function(d){if(d.brand&&!allBrands.includes(d.brand))allBrands.push(d.brand);}); } }); });
        allBrands.sort();
        bodyHtml = `<div style="display:none" id="eqFormData" data-name="${esc(entry.name)}" data-gov="${esc(entry.governorate)}"></div>`;
        bodyHtml += `<datalist id="eqBrandList">${allBrands.map(function(b) { return '<option value="'+esc(b)+'">'; }).join('')}</datalist>`;
        function _eqOpt(v, cur) { return `<option value="${v}" ${cur===v?'selected':''}>${v}</option>`; }
        function eqDevicesHtml(tArr, color, label) {
          let h = `<div style="margin-bottom:8px;border:1px solid ${color};border-radius:6px;overflow:hidden">
            <div style="background:${color};color:#fff;padding:5px 8px;font-size:11px">${label}</div>
            <div style="padding:6px">`;
          tArr.forEach(function(t){
            let devs = entry.equipment[t.id];
            if (!devs || !Array.isArray(devs)) {
              if (devs && typeof devs === 'object') {
                let cnt = devs.count || 1;
                let origBrand = devs.brand || '';
                let origStatus = devs.status || '';
                devs = [];
                for (let i = 0; i < cnt; i++) devs.push({ brand: origBrand, status: origStatus });
              } else {
                devs = [];
              }
            }
            h += `<div style="background:#f9f9f9;border-radius:4px;margin-bottom:4px;padding:4px 6px">
              <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px">
                <strong style="font-size:11px">${esc(t.name)}</strong>
                <span id="eqBadge_${t.id}" style="margin-right:auto;font-size:9px;color:#999">(${devs.length})</span>
              </div>
              <div style="margin-bottom:4px">
                <label style="font-size:10px;color:#555">عدد الأجهزة:</label>
                <input type="number" id="eqCount_${t.id}" value="${devs.length}" min="0" max="99" style="width:50px;font-size:10px;padding:2px 4px;border:1px solid #ddd;border-radius:3px;text-align:center" data-input="eqSyncDeviceRows" data-args="${t.id}">
              </div>
              <div id="eqDevList_${t.id}">`;
            devs.forEach(function(d, di){
              h += `<div class="eq-dev-row" data-tid="${t.id}" style="display:flex;gap:4px;align-items:center;margin-bottom:3px">
                <span style="font-size:9px;color:#888;min-width:14px">${di+1}</span>
                <input type="text" class="form-input eq-dev-brand" style="flex:1;font-size:10px;padding:2px 4px" value="${esc(d.brand || '')}" list="eqBrandList" autocomplete="off" placeholder="الماركة">
                <select class="form-input eq-dev-status" style="width:70px;font-size:10px;padding:2px 4px">${_eqOpt('',d.status)}${_eqOpt('يعمل',d.status)}${_eqOpt('لا يعمل',d.status)}</select>
                <button type="button" data-click="eqRemoveSingleRow" data-args="${t.id}" style="background:none;border:none;color:#e74c3c;cursor:pointer;padding:2px;font-size:12px" title="حذف"><i class="fas fa-times"></i></button>
              </div>`;
            });
            h += `</div></div>`;
          });
          h += `</div></div>`;
          return h;
        }
        bodyHtml += eqDevicesHtml(stTypes, '#d4e6f1', '<i class="fas fa-snowflake"></i> أجهزة تخزينية');
        bodyHtml += eqDevicesHtml(ctTypes, '#d5f5e3', '<i class="fas fa-flask"></i> أجهزة تجميعي');
        bodyHtml += `<div style="text-align:center;margin-top:10px">
          <button class="btn btn-primary" data-click="eqSave" style="padding:6px 24px"><i class="fas fa-save"></i> حفظ</button>
        </div>`;
      }
      openModal(hospName ? esc(entry.name) : 'إضافة أجهزة', bodyHtml,
        `<button class="btn btn-secondary" data-click="closeModal">إغلاق</button>`);
    } catch (e) { showToast('❌ '+e.message); }
  })();
}


async function eqCreateNewEntry() {
  const sel = document.getElementById('eqNewHospSelect');
  if (!sel || !sel.value) { showToast('⚠ اختر مستشفى'); return; }
  closeModal(); eqOpenForm(sel.value);
}

async function eqReviewHospital(name) {
  const curMonth = curMonthCairo();
  try {
    await api('POST', '/equipment/hospitals', { name, reviewed: true, review_month: curMonth });
    showToast('✅ تمت مراجعة أجهزة ' + name);
    renderEquipment();
  } catch (e) { showToast('❌ ' + e.message); }
}

async function eqSave() {
  const dataEl = document.getElementById('eqFormData');
  if (!dataEl) return;
  const name = dataEl.dataset.name;
  const governorate = dataEl.dataset.gov;
  if (!name) { showToast('⚠ اسم المستشفى مطلوب'); return; }
  const equipment = {};
  document.querySelectorAll('.eq-dev-row').forEach(function(row){
    const tid = parseInt(row.dataset.tid);
    if (isNaN(tid)) return;
    if (!equipment[tid]) equipment[tid] = [];
    const brand = row.querySelector('.eq-dev-brand')?.value || '';
    const status = row.querySelector('.eq-dev-status')?.value || '';
    equipment[tid].push({ brand, status });
  });
  try {
    await api('POST', '/equipment/hospitals', { name, governorate, equipment });
    showToast('✅ تم حفظ أجهزة ' + name);
    closeModal();
    const data = await api('GET', '/equipment');
    eqRenderTable(data.types || [], data.hospitals || []);
  } catch (e) { showToast('❌ ' + e.message); }
}

async function eqShowDeleteForm() {
  try {
    const eq = await api('GET', '/equipment');
    const h = eq.hospitals || [];
    if (!h.length) { showToast('⚠ لا توجد مستشفيات'); return; }
    openModal('حذف أجهزة مستشفى',
      `<div style="padding:10px">
        <label>اختر المستشفى:</label>
        <select id="eqDelHospSelect" class="form-input" style="width:100%;margin:8px 0">${h.map(function(x){return '<option value="'+esc(x.name)+'">'+esc(x.name)+(x.governorate?' ('+esc(x.governorate)+')':'')+'</option>';}).join('')}</select>
        <div style="text-align:center;margin-top:12px"><button class="btn btn-danger" data-click="eqDeleteHosp"><i class="fas fa-trash"></i> حذف</button></div>
      </div>`,
      `<button class="btn btn-secondary" data-click="closeModal">إلغاء</button>`);
  } catch(e) { showToast('❌ '+e.message); }
}

async function eqDeleteHosp(name) {
  openModal('حذف الأجهزة',
    `<div style="text-align:center;padding:10px">
      <i class="fas fa-exclamation-triangle" style="font-size:42px;color:#e74c3c;margin-bottom:8px"></i>
      <p style="font-size:13px;color:#666">هل أنت متأكد من حذف أجهزة</p>
      <p style="font-size:15px;font-weight:700;color:#e74c3c">${esc(name)}</p>
    </div>`,
    `<button class="btn btn-secondary" data-click="closeModal">إلغاء</button>
     <button class="btn btn-danger" data-click="eqDoDelete" data-args="'${esc(name)}'"><i class="fas fa-trash"></i> حذف</button>`);
}

async function eqDoDelete(name) {
  try {
    await api('DELETE', '/equipment/hospitals/' + encodeURIComponent(name));
    closeModal(); showToast('✅ تم حذف الأجهزة');
    const d = await api('GET', '/equipment');
    eqRenderTable(d.types||[], d.hospitals||[]);
  } catch (e) { showToast('❌ ' + e.message); }
}

async function eqImport() {
  showConfirmModal('سيتم استيراد الأجهزة من ملف Excel. هل تريد المتابعة؟', async function() {
    try {
      const res = await api('POST', '/equipment/import');
      showToast(res.message || '✅ تم الاستيراد');
      const d = await api('GET', '/equipment');
      eqRenderTable(d.types||[], d.hospitals||[]);
    } catch (e) { showToast('❌ ' + e.message); }
  });
}

function eqExportXlsx() {
  const a = document.createElement('a');
  a.href = '/api/equipment/export/xlsx';
  a.download = 'اجهزة_بنوك_الدم.xlsx'; a.click();
  showToast('✅ جاري تحميل ملف Excel');
}

function eqExportPdf() {
  let pivotTable = document.querySelector('#eqPivotTable table');
  if (!pivotTable) { showToast('❌ لا توجد بيانات'); return; }
  let clone = pivotTable.cloneNode(true);
  let rows = clone.querySelectorAll('tr');
  rows.forEach(function(r){
    let last = r.querySelector('td:last-child, th:last-child');
    if (last && last.querySelector('button')) last.remove();
  });
  let w = window.open('', '_blank');
  let style = '<style>'+
    '@page{size:landscape;margin:8mm}'+
    'body{font-family:Tahoma,Arial,sans-serif;margin:0;padding:8px;font-size:10px}'+
    'table{width:100%;border-collapse:collapse;border:1px solid #ccc;background:#fff}'+
    'th{background:#1a1a2e;color:#fff;padding:4px 6px;border:1px solid #333;text-align:center;font-weight:700;font-size:10px}'+
    'td{padding:3px 4px;border:1px solid #ddd;text-align:center;font-size:9px}'+
    'td:first-child,td:nth-child(2){text-align:right}'+
    '.gov-header{font-weight:700;text-align:right;padding:4px 8px;font-size:10px}'+
    '.count{font-weight:700;color:#1f2937}'+
    '.brand{color:#6b7280;font-size:8px}'+
    '.status-good{color:#10b981;font-weight:700}'+
    '.status-bad{color:#ef4444;font-weight:700}'+
    '.footer{text-align:center;font-size:10px;color:#666;margin-top:8px}'+
    '.toolbar{margin:4px 0 8px 0;text-align:left}'+
    '.toolbar button{background:#10b981;color:#fff;border:none;padding:5px 12px;border-radius:4px;margin:0 2px;font-size:11px;cursor:pointer}'+
    '.toolbar .pdf{background:#ef4444}'+
    'h1{text-align:center;color:#1a1a2e;margin:0 0 10px 0;font-size:16px}'+
    '@media print{body{margin:0;padding:0} .toolbar{display:none}}'+
  '</style>';
  w.document.write('<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>أجهزة بنوك الدم</title>'+style+'</head><body>'+
    '<h1>أجهزة بنوك الدم</h1>' +
    '<div class="toolbar">' +
      '<button onclick="window.print();">طباعة</button>' +
      '<button class="pdf" onclick="eqExportPdf();">تحميل PDF</button>' +
    '</div>' +
    clone.outerHTML +
    '<div class="footer">إعداد و برمجة محمد ندا 01068880999</div>' +
    '</body></html>');
  w.document.close();
  setTimeout(function(){w.focus();w.print();w.close();},500);
}

// ============== Equipment Type Management ==============

async function eqManageTypes() {
  try {
    const types = await api('GET', '/equipment/types');
    let html = `<div style="text-align:left;margin-bottom:8px">
      <button class="btn btn-primary btn-sm" data-click="eqAddType"><i class="fas fa-plus"></i> إضافة جهاز</button>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      <thead><tr style="background:#f0f0f0"><th style="padding:6px;text-align:right">الجهاز</th><th style="padding:6px;text-align:right">التصنيف</th><th style="padding:6px;width:80px">إجراءات</th></tr></thead>
      <tbody>`;
    types.forEach(t => {
      html += `<tr style="border-bottom:1px solid #eee">
        <td style="padding:6px">${esc(t.name)}</td>
        <td style="padding:6px"><span style="background:${t.category === 'تجميعي وتخزيني' ? '#8e44ad' : '#27ae60'}20;color:${t.category === 'تجميعي وتخزيني' ? '#8e44ad' : '#27ae60'};padding:2px 8px;border-radius:10px;font-size:10px">${esc(t.category||'تجميعي')}</span></td>
        <td style="padding:6px;text-align:center">
          <button class="btn btn-xs" data-click="eqEditType" data-args="${t.id}" style="color:#3498db" title="تعديل"><i class="fas fa-edit"></i></button>
          <button class="btn btn-xs" data-click="eqDeleteType" data-args="${t.id}" style="color:#e74c3c" title="حذف"><i class="fas fa-trash"></i></button>
        </td></tr>`;
    });
    html += `</tbody></table>`;
    openModal('إدارة أنواع الأجهزة', html, `<button class="btn btn-secondary" data-click="closeModalAndFilter">إغلاق</button>`);
  } catch (e) { showToast('❌ '+e.message); }
}

async function eqAddType() {
  const mb = document.querySelector('.modal-body') || document.getElementById('modalContent');
  if (!mb) return;
  mb.innerHTML = `<div style="padding:8px">
    <label>اسم الجهاز:</label>
    <input type="text" id="eqTypeName" class="form-input" style="width:100%;margin:6px 0" placeholder="أدخل اسم الجهاز" autofocus>
    <label>التصنيف:</label>
    <select id="eqTypeCategory" class="form-input" style="width:100%;margin:6px 0">
      <option value="تجميعي">تجميعي</option>
      <option value="تجميعي وتخزيني">تجميعي وتخزيني</option>
    </select>
    <div style="text-align:center;margin-top:10px">
      <button class="btn btn-primary" data-click="eqSaveNewType"><i class="fas fa-check"></i> حفظ</button>
      <button class="btn btn-secondary" data-click="eqManageTypes">إلغاء</button>
    </div>
  </div>`;
}

async function eqSaveNewType() {
  const name = document.getElementById('eqTypeName')?.value?.trim();
  if (!name) { showToast('⚠ أدخل اسم الجهاز'); return; }
  const category = document.getElementById('eqTypeCategory')?.value || 'تجميعي';
  try {
    await api('POST', '/equipment/types', { name, category });
    showToast('✅ تم إضافة الجهاز');
    eqManageTypes();
  } catch (e) { showToast('❌ '+e.message); }
}

async function eqEditType(id) {
  try {
    const types = await api('GET', '/equipment/types');
    const t = types.find(x => x.id === id);
    if (!t) return;
    const mb = document.querySelector('.modal-body') || document.getElementById('modalContent');
    if (!mb) return;
    mb.innerHTML = `<div style="padding:8px">
      <label>اسم الجهاز:</label>
      <input type="text" id="eqTypeName" class="form-input" style="width:100%;margin:6px 0" value="${esc(t.name)}" autofocus>
      <label>التصنيف:</label>
      <select id="eqTypeCategory" class="form-input" style="width:100%;margin:6px 0">
        <option value="تجميعي" ${t.category === 'تجميعي'?'selected':''}>تجميعي</option>
        <option value="تجميعي وتخزيني" ${t.category === 'تجميعي وتخزيني'?'selected':''}>تجميعي وتخزيني</option>
      </select>
      <div style="text-align:center;margin-top:10px">
        <button class="btn btn-primary" data-click="eqSaveEditType" data-args="${id}"><i class="fas fa-check"></i> حفظ</button>
        <button class="btn btn-secondary" data-click="eqManageTypes">إلغاء</button>
      </div>
    </div>`;
  } catch (e) { showToast('❌ '+e.message); }
}

async function eqSaveEditType(id) {
  const name = document.getElementById('eqTypeName')?.value?.trim();
  if (!name) { showToast('⚠ أدخل اسم الجهاز'); return; }
  const category = document.getElementById('eqTypeCategory')?.value || 'تجميعي';
  try {
    await api('PUT', '/equipment/types/' + id, { name, category });
    showToast('✅ تم تعديل الجهاز');
    eqManageTypes();
  } catch (e) { showToast('❌ '+e.message); }
}

async function eqDeleteType(id) {
  try {
    const types = await api('GET', '/equipment/types');
    const t = types.find(x => x.id === id);
    openModal('حذف جهاز',
      `<div style="text-align:center;padding:10px">
        <i class="fas fa-exclamation-triangle" style="font-size:42px;color:#e74c3c;margin-bottom:8px"></i>
        <p style="font-size:13px;color:#666">هل أنت متأكد من حذف</p>
        <p style="font-size:15px;font-weight:700;color:#e74c3c">${esc(t ? t.name : '')}</p>
        <p style="font-size:12px;color:#999">سيتم إزالة الجهاز من جميع المستشفيات</p>
      </div>`,
      `<button class="btn btn-secondary" data-click="eqManageTypes">إلغاء</button>
       <button class="btn btn-danger" data-click="eqDoDeleteType" data-args="${id}"><i class="fas fa-trash"></i> حذف</button>`);
  } catch (e) { showToast('❌ '+e.message); }
}

async function eqDoDeleteType(id) {
  try {
    await api('DELETE', '/equipment/types/' + id);
    showToast('✅ تم حذف الجهاز');
    eqManageTypes();
  } catch (e) { showToast('❌ '+e.message); }
}

// ============== Readiness Sheet (شيت الجاهزية) — Excel Template v2 ==============

function rdnDismissNotifAlert(idx) {
  const a = window._alertsData?.[idx];
  if (!a?._rdnNotifId) return;
  api('POST', '/readiness-notifications/dismiss/' + a._rdnNotifId).then(checkAlerts).catch(() => {});
}

// --- Helpers ---
function rdnGetDayLabels(occ) {
  const labels = occ.day_labels || [];
  const from = new Date(occ.date_from);
  const to = new Date(occ.date_to);
  const dayNames = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const days = [];
  let cur = new Date(from);
  while (cur <= to) {
    const dStr = cur.toISOString().slice(0,10);
    const dn = dayNames[cur.getDay()];
    const label = labels[days.length] || `${dn} ${dStr}`;
    days.push({ label, date: dStr, dayName: dn });
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}
function rdnShiftOpts(val) {
  const opts = ['12 A','12 P','24 AP','6 L 12 P'];
  let html = '<option value="">--</option>';
  opts.forEach(o => { html += `<option value="${o}"${val===o?' selected':''}>${o}</option>`; });
  html += `<option value="__other__"${val&&!opts.includes(val)?' selected':''}>أخرى</option>`;
  return html;
}
function rdnStockChanged() {
  const sel = document.querySelector('input[name="rdnStockRadio"]:checked');
  const wrap = document.getElementById('rdnCorrectionWrap');
  if (wrap) wrap.style.display = sel && sel.value === 'غير كافي' ? '' : 'none';
  rdnSyncFormToPrintTable();
}

function rdnGetStockVal() {
  const sel = document.querySelector('input[name="rdnStockRadio"]:checked');
  return sel ? sel.value : '';
}

function rdnMaintChanged() {
  const sel = document.querySelector('input[name="rdnMaintRadio"]:checked');
  const wrap = document.getElementById('rdnMaintReasonWrap');
  if (wrap) wrap.style.display = sel && sel.value === 'لا تتم' ? '' : 'none';
  rdnSyncFormToPrintTable();
}
function rdnGetMaintVal() {
  const sel = document.querySelector('input[name="rdnMaintRadio"]:checked');
  if (!sel) return '';
  if (sel.value === 'تتم') return 'تتم';
  const reason = document.getElementById('rdnMaintReason')?.value || '';
  return reason ? `لا تتم: ${reason}` : 'لا تتم';
}

function rdnBdChanged() {
  const sel = document.querySelector('input[name="rdnBdRadio"]:checked');
  const wrap = document.getElementById('rdnBdWrap');
  if (wrap) wrap.style.display = sel && sel.value === 'يوجد' ? '' : 'none';
  rdnSyncFormToPrintTable();
}
function rdnGetBdVal() {
  const sel = document.querySelector('input[name="rdnBdRadio"]:checked');
  if (!sel) return '';
  if (sel.value === 'لا يوجد') return 'لا يوجد';
  const device = document.getElementById('rdnBdDevice')?.value || '';
  const repl = document.getElementById('rdnBdReplacement')?.value || '';
  let r = 'يوجد';
  if (device) r += `: ${device}`;
  if (repl) r += ` (بديل: ${repl})`;
  return r;
}

function rdnConsChanged() {
  const sel = document.querySelector('input[name="rdnConsRadio"]:checked');
  const wrap = document.getElementById('rdnConsReasonWrap');
  if (wrap) wrap.style.display = sel && sel.value === 'غير كافية' ? '' : 'none';
  rdnSyncFormToPrintTable();
}
function rdnGetConsVal() {
  const sel = document.querySelector('input[name="rdnConsRadio"]:checked');
  if (!sel) return '';
  if (sel.value === 'كافية') return 'كافية';
  const reason = document.getElementById('rdnConsReason')?.value || '';
  return reason ? `غير كافية: ${reason}` : 'غير كافية';
}

function rdnShiftChanged(el) {
  if (el.value === '__other__') {
    const custom = prompt('أدخل الوردية المطلوبة:');
    if (custom && custom.trim()) {
      el.value = custom.trim();
    } else {
      el.value = '';
    }
  }
  rdnSyncFormToPrintTable();
}

async function renderReadinessSheet() {
  const el = document.getElementById('mainContent');
  const canAdd = hasPerm('readiness', 'add');
  const canDelete = hasPerm('readiness', 'delete');
  const canExport = hasPerm('readiness', 'export');
  try {
    const occasions = await api('GET', '/readiness-occasions');
    let html = `<div class="page-actions">
      <button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> الرئيسية</button>
      ${canAdd ? `<button class="btn btn-primary" data-click="rdnOpenOccasionModal"><i class="fas fa-plus"></i> إضافة مناسبة</button>` : ''}
      ${canExport ? `<button class="btn btn-success" data-click="rdnExportXlsx"><i class="fas fa-file-excel"></i> تحميل Excel</button><button class="btn btn-danger" data-click="rdnExportPdf" style="margin-right:6px"><i class="fas fa-file-pdf"></i> تحميل PDF</button>` : ''}
    </div><div id="rdnContent">
      <div class="filter-bar" style="flex-wrap:wrap;align-items:center">
        <label style="font-weight:600">اختر المناسبة:</label>
        <select id="rdnOccasionSelect" class="form-input" style="width:300px" data-change="rdnOccasionChanged">
          <option value="">-- اختر مناسبة --</option>
          ${occasions.map(o => `<option value="${o.id}">${esc(o.name)} (${o.date_from} → ${o.date_to})</option>`).join('')}
        </select>
        ${canAdd ? `<button class="btn btn-sm btn-outline-primary" data-click="rdnOpenOccasionModal" title="إضافة"><i class="fas fa-plus"></i></button>` : ''}
        ${canDelete ? `<button class="btn btn-sm btn-outline-danger" data-click="rdnDeleteSelectedOccasion" title="حذف"><i class="fas fa-trash"></i></button>` : ''}
        <span id="rdnStatusMsg" style="margin-right:auto;font-size:13px;color:#666"></span>
      </div>
      <div id="rdnSummaryTable"></div>
      <div id="rdnFormSection"></div>
    </div>`;
    el.innerHTML = html;
    // Auto-select latest occasion
    const sel = document.getElementById('rdnOccasionSelect');
    if (sel) {
      const lastId = localStorage.getItem('rdnLastOccasion');
      if (lastId && [...sel.options].some(o => o.value === lastId)) {
        sel.value = lastId;
      } else if (sel.options.length > 1) {
        sel.value = sel.options[1].value; // first real option (latest)
      }
      if (sel.value) rdnOccasionChanged();
    }
  } catch (e) { el.innerHTML = `<div class="empty-msg">${esc(e.message)}</div>`; }
}

function rdnDeleteSelectedOccasion() {
  const sel = document.getElementById('rdnOccasionSelect');
  if (!sel) return;
  const occId = parseInt(sel.value);
  if (!occId) { showToast('⚠ اختر مناسبة أولاً'); return; }
  const occName = sel.selectedOptions[0]?.textContent?.split(' (')[0] || 'المناسبة';
  openModal('حذف المناسبة',
    `<div style="text-align:center;padding:10px">
      <i class="fas fa-exclamation-triangle" style="font-size:48px;color:#e74c3c;margin-bottom:12px"></i>
      <p style="font-size:15px;color:#333;margin-bottom:8px">هل أنت متأكد من حذف المناسبة؟</p>
      <p style="font-size:13px;color:#e74c3c;font-weight:600">${esc(occName)}</p>
      <p style="font-size:12px;color:#999;margin-top:8px">سيتم حذف جميع تقارير الجاهزية والإشعارات المرتبطة بها</p>
    </div>`,
    `<button class="btn btn-secondary" data-click="closeModal">إلغاء</button>
     <button class="btn btn-danger" data-click="rdnDoDeleteOccasion" data-args="${occId}"><i class="fas fa-trash"></i> حذف</button>`);
}

async function rdnDeleteOccasion(id) {
  const sel = document.getElementById('rdnOccasionSelect');
  const occName = sel && sel.selectedOptions[0]?.textContent?.split(' (')[0] || 'المناسبة';
  openModal('حذف المناسبة',
    `<div style="text-align:center;padding:10px">
      <i class="fas fa-exclamation-triangle" style="font-size:48px;color:#e74c3c;margin-bottom:12px"></i>
      <p style="font-size:15px;color:#333;margin-bottom:8px">هل أنت متأكد من حذف المناسبة؟</p>
      <p style="font-size:13px;color:#e74c3c;font-weight:600">${esc(occName)}</p>
      <p style="font-size:12px;color:#999;margin-top:8px">سيتم حذف جميع تقارير الجاهزية والإشعارات المرتبطة بها</p>
    </div>`,
    `<button class="btn btn-secondary" data-click="closeModal">إلغاء</button>
     <button class="btn btn-danger" data-click="rdnDoDeleteOccasion" data-args="${id}"><i class="fas fa-trash"></i> حذف</button>`);
}

async function rdnDoDeleteOccasion(id) {
  try {
    await api('DELETE', '/readiness-occasions/' + id);
    closeModal(); showToast('✅ تم حذف المناسبة'); renderReadinessSheet();
  } catch (e) { showToast('❌ ' + e.message); }
}

async function rdnOccasionChanged() {
  const sel = document.getElementById('rdnOccasionSelect');
  const occId = parseInt(sel.value);
  const summaryEl = document.getElementById('rdnSummaryTable');
  const formEl = document.getElementById('rdnFormSection');
  const statusEl = document.getElementById('rdnStatusMsg');
  if (!occId) { summaryEl.innerHTML = ''; formEl.innerHTML = ''; statusEl.textContent = ''; return; }
  try {
    const [occasions, allHospitals, dailyData] = await Promise.all([
      api('GET', '/readiness-occasions'),
      api('GET', '/hospitals'),
      api('GET', '/daily-reports')
    ]);
    const dailyReports = dailyData.rows || dailyData || [];
    const occ = occasions.find(o => o.id === occId);
    if (!occ) { summaryEl.innerHTML = '<div class="empty-msg">المناسبة غير موجودة</div>'; return; }
    const reports = await api('GET', '/readiness-reports?occasion_id=' + occId);
    const user = window._user || {};
    const role = user.role || '';
    const userHospId = user.hospitalId;
    const userGov = user.governorate || '';
    // Filter hospitals by role
    let hospitals = allHospitals;
    if (role === 'hospital' && userHospId) {
      hospitals = allHospitals.filter(h => h.id === userHospId);
    } else if (role === 'branch_supervisor' && userGov) {
      hospitals = allHospitals.filter(h => h.governorate === userGov);
    }
    const days = rdnGetDayLabels(occ);
    window._rdnHospitals = hospitals;
    // Group hospitals by governorate
    const govMap = {};
    hospitals.forEach(h => {
      const g = h.governorate || 'أخرى';
      if (!govMap[g]) govMap[g] = [];
      govMap[g].push(h);
    });
    const govKeys = Object.keys(govMap).sort((a, b) => a.localeCompare(b, 'ar'));
    if (statusEl) statusEl.textContent = `✓ تم إدخال ${reports.length} من ${hospitals.length} مستشفى`;
    const doneHospitals = hospitals.filter(h => reports.find(rr => rr.hospital_id === h.id));
    // Build blood data map per hospital
    const bloodMap = {};
    hospitals.forEach(h => {
      const myDaily = dailyReports.filter(dr => dr.hospital_id === h.id).sort((a,b) => (b.id||0)-(a.id||0))[0];
      if (myDaily) {
        try { bloodMap[h.id] = JSON.parse(myDaily.blood_data); } catch (e) { bloodMap[h.id] = {}; }
      } else {
        bloodMap[h.id] = {};
      }
    });
    const summaryHtml = doneHospitals.length ? rdnRenderSummaryTable(occ, reports, hospitals, bloodMap) : '<div style="padding:10px;color:#999">لا توجد تقارير بعد</div>';
    summaryEl.innerHTML = `<div class="card"><div class="card-header">
      <h3>جاهزية بنوك الدم بمناسبة "${esc(occ.name)}" من ${occ.date_from} إلى ${occ.date_to}</h3>
    </div><div class="card-body">
      <div class="filter-bar" style="flex-wrap:wrap;row-gap:8px">
        <label style="font-weight:600">اختر المستشفى:</label>
        <select id="rdnHospitalSelect" class="form-input" style="width:300px" data-change="rdnHospitalChanged" data-args="${occId}">
          <option value="">-- اختر مستشفى --</option>
          ${govKeys.map(gov => `<optgroup label="${esc(gov)}">${govMap[gov].map(h => {
            const r = reports.find(rr => rr.hospital_id === h.id);
            const done = r ? '✅ ' : '';
            return `<option value="${h.id}" ${done?'style="color:#2e7d32"':''}>${done}${esc(h.name)}</option>`;
          }).join('')}</optgroup>`).join('')}
        </select>
        <span style="font-size:12px;color:#666">${reports.filter(r => r.staff_data).length} مستشفى مكتمل</span>
      </div>
      <div style="margin-top:12px">${summaryHtml}</div>
    </div></div>`;
    formEl.innerHTML = '';
    // Auto-open form for hospital role (only one hospital)
    if (role === 'hospital' && hospitals.length === 1) {
      const hospSel = document.getElementById('rdnHospitalSelect');
      if (hospSel) { hospSel.value = hospitals[0].id; rdnHospitalChanged(occId); }
    }
  } catch (e) { summaryEl.innerHTML = `<div class="empty-msg">${esc(e.message)}</div>`; }
}

function rdnHospitalChanged(occId) {
  const hospSel = document.getElementById('rdnHospitalSelect');
  const hospId = parseInt(hospSel.value);
  if (!hospId) { document.getElementById('rdnFormSection').innerHTML = ''; return; }
  const hospitals = window._rdnHospitals || [];
  const hosp = hospitals.find(h => h.id === hospId);
  const hospName = hosp ? hosp.name : '';
  const gov = hosp ? hosp.governorate : '';
  const user = window._user || {};
  rdnShowForm(occId, hospId, hospName, gov, false);
}

function rdnShowForm(occId, hospId, hospNameOrEl, gov, isViewOnly) {
  const formContainer = document.getElementById('rdnFormSection');
  let hospName, govt;
  if (typeof hospNameOrEl === 'object' && hospNameOrEl) {
    hospName = hospNameOrEl.dataset.hn || '';
    govt = hospNameOrEl.dataset.hg || '';
  } else {
    hospName = hospNameOrEl || '';
    govt = gov || '';
  }
  const occ = document.getElementById('rdnOccasionSelect');
  const occId2 = parseInt(occ.value);
  const isReadOnly = isViewOnly === true;
  (async () => {
    try {
      const occs = await api('GET', '/readiness-occasions');
      const oc = occs.find(o => o.id === occId2);
      const days = oc ? rdnGetDayLabels(oc) : [];
      const dayHtml = days.map(d => {
        return `<th style="font-size:9px;line-height:1.3">${esc(d.date)}<br>${esc(d.dayName)}</th>`;
      }).join('');
      // Load employee list for this hospital
      try {
        const empRes = await api('GET', '/employee-statements');
        const empData = empRes.rows || empRes || [];
        window._rdnEmpList = empData.filter(e => e.hospital_id === hospId);
      } catch (e) { window._rdnEmpList = window._rdnEmpList || []; }
      // Load stock from latest daily report for this hospital
      let stockHtml = '';
      try {
        const dailyRes = await api('GET', '/daily-reports');
        const dailyRows = dailyRes.rows || dailyRes || [];
        const myReport = dailyRows.filter(r => r.hospital_id === hospId).sort((a,b) => (b.id||0)-(a.id||0))[0];
        if (myReport) {
          const bd = tryParse(myReport.blood_data) || {};
          stockHtml = BTYPES.map(t => `<div style="font-size:10px;line-height:1.4"><strong>${t}:</strong> ${calcAvail(bd,t)}</div>`).join('');
        }
      } catch (e) { /* ignore */ }
      if (!stockHtml) stockHtml = '<div style="font-size:10px;color:#999">يوجد رصيد</div>';
      // Load existing report for this hospital
      const reports = await api('GET', '/readiness-reports?occasion_id=' + occId2);
      const existingReport = reports.find(r => r.hospital_id === hospId);
      if (existingReport) {
        if (isReadOnly) {
          // Show read-only view for branch supervisor
          const staff = (()=>{try{let s=existingReport.staff_data||[];if(typeof s==='string'){s=JSON.parse(s);if(!Array.isArray(s)&&typeof s==='string')s=JSON.parse(s);}if(!Array.isArray(s))s=[];return s;}catch(e){return [];}})();
          const staffRows = staff.length ? staff.map((s, i) => {
            const shifts = days.map((_, di) => `<td style="font-size:10px;text-align:center">${s.shifts?.[String(di)]||''}</td>`).join('');
            return `<tr><td>${i+1}</td><td>${esc(s.name||'')}</td><td>${esc(s.phone||'')}</td>${shifts}</tr>`;
          }).join('') : '<tr><td colspan="'+(3+days.length)+'" class="empty-msg">يوجد موظفين</td></tr>';
          formContainer.innerHTML = `
            <div class="card"><div class="card-header">
              <h3><i class="fas fa-eye"></i> عرض بيانات الجاهزية — ${esc(hospName)}</h3>
              <button class="btn btn-sm btn-secondary" data-click="rdnHideForm"><i class="fas fa-times"></i> إغلاق</button>
            </div><div class="card-body">
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">
                <div><strong>المخزون:</strong> ${esc(existingReport.stock||'-')}</div>
                <div><strong>العجز:</strong> ${esc(existingReport.shortage||'-')}</div>
                <div><strong>الصيانة:</strong> ${esc(existingReport.maintenance||'-')}</div>
                <div><strong>الأعطال:</strong> ${esc(existingReport.breakdowns||'-')}</div>
                <div><strong>المستهلكات:</strong> ${esc(existingReport.consumables||'-')}</div>
                <div><strong>الاستعاضة:</strong> ${esc(existingReport.correction||'-')}</div>
              </div>
              <h4 style="margin:8px 0 4px"><i class="fas fa-users"></i> القوى العاملة</h4>
              <table class="data-table" style="font-size:11px;width:100%">
                <thead><tr><th>#</th><th>الاسم</th><th>التليفون</th>${dayHtml}</tr></thead>
                <tbody>${staffRows}</tbody></table>
            </div></div>`;
          window.scrollTo({ top: formContainer.offsetTop - 10, behavior: 'smooth' });
          return;
        } else {
          // Render form pre-filled from existing report for editing
          const staff = (()=>{try{let s=existingReport.staff_data||[];if(typeof s==='string'){s=JSON.parse(s);if(!Array.isArray(s)&&typeof s==='string')s=JSON.parse(s);}if(!Array.isArray(s))s=[];return s;}catch(e){return [];}})();
          formContainer.innerHTML = `
            <div class="card"><div class="card-header">
              <h3><i class="fas fa-edit"></i> تعديل بيانات الجاهزية — ${esc(hospName)}</h3>
              <button class="btn btn-sm btn-secondary" data-click="rdnHideForm"><i class="fas fa-times"></i> إلغاء</button>
            </div><div class="card-body" id="rdnFormBody">
              <div style="display:none" id="rdnFormIds" data-occid="${occId}" data-hospid="${hospId}" data-hospname="${esc(hospName)}" data-gov="${esc(govt)}"></div>
              <div style="display:none" id="rdnReportId">${existingReport.id}</div>
              <!-- Staff -->
              <div class="card" style="margin-bottom:8px">
                <div class="card-header"><h4><i class="fas fa-users"></i> القوى العاملة</h4>
                </div>
                <div class="card-body" style="padding:8px;overflow-x:auto">
                  <table class="data-table" id="rdnStaffTable" style="font-size:11px;width:100%">
                    <thead><tr><th>#</th><th>الاسم</th><th>رقم التليفون</th>${dayHtml}<th style="width:40px"></th></tr></thead>
                    <tbody id="rdnStaffBody">${staff.map((s, i) => {
                      const dayCells = days.map((_, di) =>
                        `<td><select class="form-input rdnSShift" data-change="rdnShiftChanged">${rdnShiftOpts(s.shifts?.[String(di)]||'')}</select></td>`
                      ).join('');
                      return `<tr><td>${i+1}</td>
                        <td><select class="form-input rdnSName" style="width:100%;min-width:100px" data-change="rdnNameSelected">
                          <option value="">-- اختر --</option>
                          ${(window._rdnEmpList||[]).map(e => `<option value="${e.id}" ${e.employee===s.name?'selected':''}>${esc(e.employee)}</option>`).join('')}
                          <option value="__manual__">${esc(s.name)} (يدوي)</option>
                        </select></td>
                        <td><input type="text" class="form-input rdnSPhone" style="width:100px" value="${esc(s.phone||'')}"></td>
                        ${dayCells}
                        <td><button class="btn btn-xs btn-success" data-click="rdnAddStaffRow"><i class="fas fa-plus"></i></button>
                        <button class="btn btn-xs btn-danger" data-click="rdnRemoveStaffRow"><i class="fas fa-times"></i></button></td></tr>`;
                    }).join('')}</tbody>
                  </table>
                </div>
              </div>
              <div class="filter-bar" style="flex-wrap:wrap;row-gap:8px">
                <div style="flex:1;min-width:200px"><label>حالة الرصيد:</label>
                  <div style="display:flex;gap:16px;align-items:center;margin-top:4px">
                    <label><input type="radio" name="rdnStockRadio" value="كافي" ${existingReport.stock==='كافي'?'checked':''} data-change="rdnStockChanged"> كافي</label>
                    <label><input type="radio" name="rdnStockRadio" value="غير كافي" ${existingReport.stock==='غير كافي'?'checked':''} data-change="rdnStockChanged"> <span style="color:red">غير كافي</span></label>
                    <div style="font-size:11px;padding:3px 8px;background:#f5f5f5;border-radius:4px">${stockHtml}</div>
                  </div>
                </div>
                <div style="flex:1;min-width:200px"><label>مراجعة الصيانة:</label>
                  <div style="display:flex;gap:16px;align-items:center;margin-top:4px">
                    <label><input type="radio" name="rdnMaintRadio" value="تتم" ${existingReport.maintenance?.startsWith('تتم')?'checked':''} data-change="rdnMaintChanged"> تتم</label>
                    <label><input type="radio" name="rdnMaintRadio" value="لا تتم" ${existingReport.maintenance?.startsWith('لا تتم')?'checked':''} data-change="rdnMaintChanged"> <span style="color:red">لا تتم</span></label>
                  </div>
                  <div id="rdnMaintReasonWrap" style="${existingReport.maintenance?.startsWith('لا تتم')?'':'display:none'};margin-top:4px">
                    <input type="text" id="rdnMaintReason" class="form-input" placeholder="ذكر السبب" value="${esc(existingReport.maintenance?.replace(/^لا تتم:?\s*/,'')||'')}" data-input="rdnSyncFormToPrintTable" style="width:100%">
                  </div>
                </div>
                <div style="flex:1;min-width:200px"><label>الأعطال:</label>
                  <div style="display:flex;gap:16px;align-items:center;margin-top:4px">
                    <label><input type="radio" name="rdnBdRadio" value="لا يوجد" ${existingReport.breakdowns==='لا يوجد'||existingReport.breakdowns===''||!existingReport.breakdowns?'checked':''} data-change="rdnBdChanged"> لا يوجد</label>
                    <label><input type="radio" name="rdnBdRadio" value="يوجد" ${existingReport.breakdowns?.startsWith('يوجد')?'checked':''} data-change="rdnBdChanged"> <span style="color:red">يوجد</span></label>
                  </div>
                  <div id="rdnBdWrap" style="${existingReport.breakdowns?.startsWith('يوجد')?'':'display:none'};margin-top:4px">
                    <div style="display:flex;gap:8px;flex-wrap:wrap">
                      <input type="text" id="rdnBdDevice" class="form-input" placeholder="اذكر الجهاز" value="${esc(existingReport.breakdowns?.replace(/^يوجد:?\s*/,'').replace(/\(.*/,'')||'')}" data-input="rdnSyncFormToPrintTable" style="flex:1">
                      <input type="text" id="rdnBdReplacement" class="form-input" placeholder="هل يوجد بديل" value="${esc(existingReport.breakdowns?.match(/بديل:\s*(.+?)\)/)?.[1]||'')}" data-input="rdnSyncFormToPrintTable" style="flex:1">
                    </div>
                  </div>
                </div>
                <div style="flex:1;min-width:200px"><label>المستهلكات:</label>
                  <div style="display:flex;gap:16px;align-items:center;margin-top:4px">
                    <label><input type="radio" name="rdnConsRadio" value="كافية" ${existingReport.consumables==='كافية'||existingReport.consumables===''||!existingReport.consumables?'checked':''} data-change="rdnConsChanged"> كافية</label>
                    <label><input type="radio" name="rdnConsRadio" value="غير كافية" ${existingReport.consumables?.startsWith('غير كافية')?'checked':''} data-change="rdnConsChanged"> <span style="color:red">غير كافية</span></label>
                  </div>
                  <div id="rdnConsReasonWrap" style="${existingReport.consumables?.startsWith('غير كافية')?'':'display:none'};margin-top:4px">
                    <input type="text" id="rdnConsReason" class="form-input" placeholder="ذكر السبب" value="${esc(existingReport.consumables?.replace(/^غير كافية:?\s*/,'')||'')}" data-input="rdnSyncFormToPrintTable" style="width:100%">
                  </div>
                </div>
              </div>
              <div id="rdnCorrectionWrap" style="${existingReport.stock==='غير كافي'?'':'display:none'}">
                <div class="filter-bar" style="flex-wrap:wrap;row-gap:8px;margin-top:8px">
                  <div style="flex:1;min-width:200px"><label style="color:red;font-weight:700">الاستعاضة:</label>
                    <input type="text" id="rdnCorrection" class="form-input" value="${esc(existingReport.correction||'')}" data-input="rdnSyncFormToPrintTable">
                  </div>
                </div>
              </div>
              <div style="text-align:center;margin-top:12px">
                <button class="btn btn-primary" data-click="rdnSaveReport"><i class="fas fa-save"></i> حفظ التقرير</button>
              </div>
            </div></div>`;
          rdnRenumberStaffRows();
          window.scrollTo({ top: formContainer.offsetTop - 10, behavior: 'smooth' });
          return;
        }
      }
      if (isReadOnly) {
        formContainer.innerHTML = `<div class="card"><div class="card-header">
          <h3>${esc(hospName)}</h3>
          <button class="btn btn-sm btn-secondary" data-click="rdnHideForm"><i class="fas fa-times"></i> إغلاق</button>
        </div><div class="card-body"><div class="empty-msg" style="padding:30px">لم يتم إدخال بيانات الجاهزية لهذا المستشفى بعد</div></div></div>`;
        return;
      }
      formContainer.innerHTML = `
        <div class="card"><div class="card-header">
          <h3><i class="fas fa-edit"></i> إدخال بيانات الجاهزية — ${esc(hospName)}</h3>
          <button class="btn btn-sm btn-secondary" data-click="rdnHideForm"><i class="fas fa-times"></i> إلغاء</button>
        </div><div class="card-body" id="rdnFormBody">
          <div style="display:none" id="rdnFormIds" data-occid="${occId}" data-hospid="${hospId}" data-hospname="${esc(hospName)}" data-gov="${esc(govt)}"></div>
          <div style="display:none" id="rdnReportId"></div>
          <!-- Staff -->
          <div class="card" style="margin-bottom:8px">
            <div class="card-header"><h4><i class="fas fa-users"></i> القوى العاملة</h4>
${!window._rdnEmpList || !window._rdnEmpList.length ? `<div style="padding:12px;margin:8px;background:#fff3cd;color:#856404;border-radius:6px;font-size:12px;text-align:center">
  <i class="fas fa-exclamation-triangle"></i> لم تجد الأسماء في القائمة؟ قم بإضافتها أولاً في
  <button class="btn btn-sm btn-warning" style="font-weight:700;margin:2px 4px" data-click="navigateTo" data-args="'renderEmployeeStatement','other'">شيت العاملين</button>
  من القائمة الرئيسية
</div>` : ''}
            </div>
            <div class="card-body" style="padding:8px;overflow-x:auto">
              <table class="data-table" id="rdnStaffTable" style="font-size:11px;width:100%">
                <thead><tr><th>#</th><th>الاسم</th><th>رقم التليفون</th>${dayHtml}<th style="width:40px"></th></tr></thead>
                <tbody id="rdnStaffBody"></tbody>
              </table>
            </div>
          </div>
          <div class="filter-bar" style="flex-wrap:wrap;row-gap:8px">
            <div style="flex:1;min-width:200px"><label>حالة الرصيد:</label>
              <div style="display:flex;gap:16px;align-items:center;margin-top:4px">
                <label><input type="radio" name="rdnStockRadio" value="كافي" data-change="rdnStockChanged"> كافي</label>
                <label><input type="radio" name="rdnStockRadio" value="غير كافي" data-change="rdnStockChanged"> <span style="color:red">غير كافي</span></label>
                <div style="font-size:11px;padding:3px 8px;background:#f5f5f5;border-radius:4px">${stockHtml}</div>
              </div>
              <div id="rdnCorrectionWrap" style="display:none;margin-top:4px">
                <div style="flex:1;min-width:200px"><label style="color:red;font-weight:700">الاستعاضة:</label>
                  <input type="text" id="rdnCorrection" class="form-input" data-input="rdnSyncFormToPrintTable">
                </div>
              </div>
            </div>
            <div style="flex:1;min-width:200px"><label>مراجعة الصيانة:</label>
              <div style="display:flex;gap:16px;align-items:center;margin-top:4px">
                <label><input type="radio" name="rdnMaintRadio" value="تتم" data-change="rdnMaintChanged"> تتم</label>
                 <label><input type="radio" name="rdnMaintRadio" value="لا تتم" data-change="rdnMaintChanged"> <span style="color:red">لا تتم</span></label>
              </div>
              <div id="rdnMaintReasonWrap" style="display:none;margin-top:4px">
                <input type="text" id="rdnMaintReason" class="form-input" placeholder="ذكر السبب" data-input="rdnSyncFormToPrintTable" style="width:100%">
              </div>
            </div>
            <div style="flex:1;min-width:200px"><label>الأعطال:</label>
              <div style="display:flex;gap:16px;align-items:center;margin-top:4px">
                 <label><input type="radio" name="rdnBdRadio" value="لا يوجد" data-change="rdnBdChanged"> لا يوجد</label>
                <label><input type="radio" name="rdnBdRadio" value="يوجد" data-change="rdnBdChanged"> <span style="color:red">يوجد</span></label>
              </div>
              <div id="rdnBdWrap" style="display:none;margin-top:4px">
                <div style="display:flex;gap:8px;flex-wrap:wrap">
                  <input type="text" id="rdnBdDevice" class="form-input" placeholder="اذكر الجهاز" data-input="rdnSyncFormToPrintTable" style="flex:1">
                  <input type="text" id="rdnBdReplacement" class="form-input" placeholder="هل يوجد بديل" data-input="rdnSyncFormToPrintTable" style="flex:1">
                </div>
              </div>
            </div>
            <div style="flex:1;min-width:200px"><label>المستهلكات:</label>
              <div style="display:flex;gap:16px;align-items:center;margin-top:4px">
                <label><input type="radio" name="rdnConsRadio" value="كافية" data-change="rdnConsChanged"> كافية</label>
                <label><input type="radio" name="rdnConsRadio" value="غير كافية" data-change="rdnConsChanged"> <span style="color:red">غير كافية</span></label>
              </div>
              <div id="rdnConsReasonWrap" style="display:none;margin-top:4px">
                <input type="text" id="rdnConsReason" class="form-input" placeholder="ذكر السبب" data-input="rdnSyncFormToPrintTable" style="width:100%">
              </div>
            </div>
          </div>
          <div style="text-align:center;margin-top:12px">
            <button class="btn btn-primary" data-click="rdnSaveReport"><i class="fas fa-save"></i> حفظ التقرير</button>
          </div>
        </div></div>`;
      rdnAddStaffRow();
      window.scrollTo({ top: formContainer.offsetTop - 10, behavior: 'smooth' });
    } catch (e) { formContainer.innerHTML = `<div class="empty-msg">${esc(e.message)}</div>`; }
  })();
}

function rdnRenderSummaryTable(occ, reports, hospitals, bloodMap) {
  const days = rdnGetDayLabels(occ);
  const bm = bloodMap || {};
  const dayHeaders = days.map(d => `<th style="line-height:1.3">${esc(d.date)}<br><span style="font-weight:400;font-size:9px">${esc(d.dayName)}</span></th>`).join('');
  const staffColSpan = 2 + days.length;
  const rows = reports.map(r => {
    const hosp = hospitals.find(h => h.id === r.hospital_id);
    const gov = hosp ? (hosp.governorate || 'أخرى') : (r.governorate || 'أخرى');
    const name = hosp ? hosp.name : r.hospital_name;
    const bd = bm[r.hospital_id] || {};
    const bloodHtml = BTYPES.map(t => `<span style="font-size:9px;margin:0 2px"><strong>${t}:</strong> ${calcAvail(bd,t)}</span>`).join('');
    const stockVal = esc(r.stock || '—');
    const maintVal = esc(r.maintenance || '—');
    const bdVal = esc(r.breakdowns || '—');
    const consVal = esc(r.consumables || '—');
    let staffArr = r.staff_data || [];
    if (typeof staffArr === 'string') { try { staffArr = JSON.parse(staffArr); } catch (e) { staffArr = []; } }
    if (!Array.isArray(staffArr)) staffArr = [];
    if (!staffArr.length) {
      return `<tr>
        <td>${esc(gov)}</td>
        <td>${esc(name)}</td>
        <td colspan="${staffColSpan}" style="text-align:center;color:#999">—</td>
        <td style="font-size:10px">${stockVal}<br>${bloodHtml}</td>
        <td>${maintVal}</td>
        <td>${bdVal}</td>
        <td>${consVal}</td>
      </tr>`;
    }
    return staffArr.map((s, si) => {
      const dayCells = days.map((_, di) => `<td style="font-size:10px;mso-number-format:'\\@'">${esc(s.shifts && s.shifts[String(di)] ? s.shifts[String(di)] : '')}</td>`).join('');
      return `<tr>
        ${si === 0 ? `<td rowspan="${staffArr.length}">${esc(gov)}</td><td rowspan="${staffArr.length}">${esc(name)}</td>` : ''}
        <td style="font-size:10px">${esc(s.name)}</td>
        <td style="font-size:10px">${esc(s.phone||'')}</td>
        ${dayCells}
        ${si === 0 ? `<td rowspan="${staffArr.length}" style="font-size:10px">${stockVal}<br>${bloodHtml}</td><td rowspan="${staffArr.length}">${maintVal}</td><td rowspan="${staffArr.length}">${bdVal}</td><td rowspan="${staffArr.length}">${consVal}</td>` : ''}
      </tr>`;
    }).join('');
  }).join('');
  return `<table class="data-table" style="font-size:11px;width:100%">
    <thead>
      <tr>
        <th rowspan="2">المحافظة</th>
        <th rowspan="2">اسم بنك الدم</th>
        <th colspan="${staffColSpan}">القوى العاملة</th>
        <th rowspan="2">حالة الرصيد</th>
        <th rowspan="2">مراجعة الصيانة</th>
        <th rowspan="2">الأعطال</th>
        <th rowspan="2">المستهلكات</th>
      </tr>
      <tr>
        <th>الاسم</th>
        <th>التليفون</th>
        ${dayHeaders}
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function rdnSyncFormToPrintTable() {}
function rdnSyncFormToPrintStaff() {}

function rdnNameSelected(selectEl) {
  const empId = parseInt(selectEl.value);
  const phoneInput = selectEl.closest('tr').querySelector('.rdnSPhone');
  if (empId) {
    const emp = (window._rdnEmpList||[]).find(e => e.id === empId);
    if (emp) { phoneInput.value = emp.phone || ''; phoneInput.style.background = '#f5f5f5'; }
    else { phoneInput.value = ''; phoneInput.style.background = ''; }
  } else {
    const sel = selectEl.selectedOptions[0];
    if (sel && sel.value === '__manual__') {
      // manual name — keep stored phone (if any)
    } else {
      phoneInput.value = ''; phoneInput.style.background = '';
    }
  }
  rdnSyncFormToPrintTable();
}

function rdnStaffRowHtml(idx, dayCount) {
  const dayCells = Array.from({length: dayCount}, (_, di) =>
    `<td><select class="form-input rdnSShift" data-change="rdnShiftChanged">${rdnShiftOpts('')}</select></td>`
  ).join('');
  const empOpts = (window._rdnEmpList||[]).map(e => `<option value="${e.id}">${esc(e.employee)}</option>`).join('');
  return `<tr>
    <td>${idx + 1}</td>
    <td><select class="form-input rdnSName" style="width:100%;min-width:100px" data-change="rdnNameSelected">
      <option value="">-- اختر من العاملين --</option>
      ${empOpts}
    </select></td>
    <td><input type="text" class="form-input rdnSPhone" style="width:100px" placeholder="التليفون" readonly></td>
    ${dayCells}
    <td><button class="btn btn-xs btn-success" data-click="rdnAddStaffRow" title="إضافة موظف"><i class="fas fa-plus"></i></button>
    <button class="btn btn-xs btn-danger" data-click="rdnRemoveStaffRow" title="حذف"><i class="fas fa-times"></i></button></td>
  </tr>`;
}

function rdnAddStaffRow() {
  const tbody = document.querySelector('#rdnStaffTable tbody');
  if (!tbody) return;
  // Don't add new row if there's already a completely empty row
  const existingRows = tbody.querySelectorAll('tr');
  for (const row of existingRows) {
    const nameEl = row.querySelector('.rdnSName');
    let name = '';
    if (nameEl) {
      if (nameEl.tagName === 'SELECT') {
        const sel = nameEl.selectedOptions[0];
        name = sel && sel.value ? sel.textContent.trim() : '';
      } else {
        name = nameEl.value || '';
      }
    }
    const phone = row.querySelector('.rdnSPhone')?.value || '';
    const shifts = row.querySelectorAll('.rdnSShift');
    const hasShift = Array.from(shifts).some(inp => inp.value);
    if (!name && !phone && !hasShift) return; // empty row exists, don't add another
  }
  const header = document.querySelector('#rdnStaffTable thead tr');
  const dayCount = header ? header.querySelectorAll('th').length - 4 : 5; // subtract #, name, phone, action
  tbody.insertAdjacentHTML('beforeend', rdnStaffRowHtml(tbody.children.length, dayCount));
  rdnSyncFormToPrintTable();
}

function rdnRemoveStaffRow(btn) {
  const tr = btn.closest('tr');
  if (tr) tr.remove();
  rdnRenumberStaffRows();
  rdnSyncFormToPrintTable();
}

function rdnRenumberStaffRows() {
  const tbody = document.querySelector('#rdnStaffTable tbody');
  if (!tbody) return;
  tbody.querySelectorAll('tr').forEach((row, i) => {
    const td = row.querySelector('td:first-child');
    if (td) td.textContent = i + 1;
  });
}

async function rdnSaveReport() {
  const idsEl = document.getElementById('rdnFormIds');
  if (!idsEl) return;
  const occId = parseInt(idsEl.dataset.occid);
  const hospId = parseInt(idsEl.dataset.hospid);
  const hospName = idsEl.dataset.hospname || '';
  const gov = idsEl.dataset.gov || '';
  const reportIdEl = document.getElementById('rdnReportId');
  const isEdit = reportIdEl?.textContent ? parseInt(reportIdEl.textContent) : 0;
  // Collect staff data with shifts
  const header = document.querySelector('#rdnStaffTable thead tr');
  const dayCount = header ? header.querySelectorAll('th').length - 4 : 0;
  const staffRows = document.querySelectorAll('#rdnStaffTable tbody tr');
  const staffData = [];
  let valid = true;
  staffRows.forEach(row => {
    if (!valid) return;
    const nameEl = row.querySelector('.rdnSName');
    let name = '';
    if (nameEl) {
      if (nameEl.tagName === 'SELECT') {
        const sel = nameEl.selectedOptions[0];
        name = sel && sel.value ? sel.textContent.trim() : '';
      } else {
        name = nameEl.value || '';
      }
    }
    const phone = row.querySelector('.rdnSPhone')?.value || '';
    if (!name && !phone && !row.querySelector('.rdnSShift')?.value) return; // skip completely empty rows
    if (!name) { showToast('⚠ يجب اختيار اسم الموظف'); valid = false; return; }
    const shifts = {};
    row.querySelectorAll('.rdnSShift').forEach((inp, di) => {
      if (inp.value) shifts[String(di)] = inp.value;
    });
    if (!Object.keys(shifts).length) { showToast('⚠ يجب اختيار وردية واحدة على الأقل لكل موظف'); valid = false; return; }
    staffData.push({ name, phone, shifts });
  });
  if (!valid) return;
  const g = id => document.getElementById(id);
  const stockVal = rdnGetStockVal();
  const maintVal = rdnGetMaintVal();
  const bdVal = rdnGetBdVal();
  const consVal = rdnGetConsVal();
  if (stockVal === 'غير كافي' && !(g('rdnCorrection')?.value || '').trim()) {
    showToast('⚠ يجب كتابة مصدر الاستعاضة عند اختيار غير كافي'); return;
  }
  if (maintVal === 'لا تتم' && !(g('rdnMaintReason')?.value || '').trim()) {
    showToast('⚠ يجب ذكر سبب عدم إتمام الصيانة'); return;
  }
  if (bdVal.startsWith('يوجد') && !(g('rdnBdDevice')?.value || '').trim()) {
    showToast('⚠ يجب ذكر اسم الجهاز المعطل'); return;
  }
  if (consVal === 'غير كافية' && !(g('rdnConsReason')?.value || '').trim()) {
    showToast('⚠ يجب ذكر سبب عدم كفاية المستهلكات'); return;
  }
  const payload = {
    occasion_id: occId, hospital_id: hospId, hospital_name: hospName, governorate: gov,
    staff_data: staffData,
    stock: stockVal,
    shortage: '',
    maintenance: maintVal,
    breakdowns: bdVal,
    consumables: consVal,
    correction: g('rdnCorrection')?.value || ''
  };
  if (!staffData.length && !payload.stock && !payload.maintenance && !payload.breakdowns && !payload.consumables) {
    showToast('⚠ يجب إدخال حقل واحد على الأقل'); return;
  }
  try {
    if (isEdit) {
      await api('PUT', '/readiness-reports/' + isEdit, payload);
      showToast('✅ تم تحديث التقرير');
    } else {
      await api('POST', '/readiness-reports', payload);
      showToast('✅ تم حفظ التقرير');
    }
    rdnHideForm();
    await rdnOccasionChanged();
    // Auto-reopen form for the same hospital after save
    const hospSel = document.getElementById('rdnHospitalSelect');
    if (hospSel) { hospSel.value = hospId; rdnHospitalChanged(occId); }
  } catch (e) { showToast('❌ ' + e.message); }
}

function rdnHideForm() {
  const formEl = document.getElementById('rdnFormSection');
  if (formEl) formEl.innerHTML = '';
}

async function rdnEditReport(reportId) {
  try {
    const reports = await api('GET', '/readiness-reports');
    const r = reports.find(rr => rr.id === reportId);
    if (!r) { showToast('❌ التقرير غير موجود'); return; }
    rdnShowForm(r.occasion_id, r.hospital_id, r.hospital_name, r.governorate);
    // Wait for form to render, then populate
    const wait = setInterval(() => {
      if (document.getElementById('rdnFormIds')?.dataset.occid) {
        clearInterval(wait);
        setTimeout(() => {
          const sf = id => document.getElementById(id);
          if (r.stock) { const rb = document.querySelector(`input[name="rdnStockRadio"][value="${esc(r.stock)}"]`); if (rb) rb.checked = true; if (r.stock === 'غير كافي') { const wrap = document.getElementById('rdnCorrectionWrap'); if (wrap) wrap.style.display = ''; } }
          if (r.maintenance) {
            const rbM = document.querySelector(`input[name="rdnMaintRadio"][value="${r.maintenance.startsWith('لا تتم')?'لا تتم':'تتم'}"]`);
            if (rbM) rbM.checked = true;
            if (r.maintenance.startsWith('لا تتم')) {
              const mWrap = document.getElementById('rdnMaintReasonWrap');
              if (mWrap) mWrap.style.display = '';
              const mReason = document.getElementById('rdnMaintReason');
              if (mReason) mReason.value = r.maintenance.replace(/^لا تتم:?\s*/,'');
            }
          }
          if (r.breakdowns) {
            const rbBd = document.querySelector(`input[name="rdnBdRadio"][value="${r.breakdowns.startsWith('يوجد')?'يوجد':'لا يوجد'}"]`);
            if (rbBd) rbBd.checked = true;
            if (r.breakdowns.startsWith('يوجد')) {
              const bdWrap = document.getElementById('rdnBdWrap');
              if (bdWrap) bdWrap.style.display = '';
            }
          }
          if (r.consumables) {
            const rbC = document.querySelector(`input[name="rdnConsRadio"][value="${r.consumables.startsWith('غير كافية')?'غير كافية':'كافية'}"]`);
            if (rbC) rbC.checked = true;
            if (r.consumables.startsWith('غير كافية')) {
              const cWrap = document.getElementById('rdnConsReasonWrap');
              if (cWrap) cWrap.style.display = '';
              const cReason = document.getElementById('rdnConsReason');
              if (cReason) cReason.value = r.consumables.replace(/^غير كافية:?\s*/,'');
            }
          }
          if (r.correction) sf('rdnCorrection').value = r.correction;
          if (r.staff_data) {
            const staff = (()=>{try{let s=r.staff_data||[];if(typeof s==='string'){s=JSON.parse(s);if(!Array.isArray(s)&&typeof s==='string')s=JSON.parse(s);}if(!Array.isArray(s))s=[];return s;}catch(e){return [];}})();
            const tbody = document.querySelector('#rdnStaffTable tbody');
            if (tbody) {
              tbody.innerHTML = '';
              const header = document.querySelector('#rdnStaffTable thead tr');
              const dayCount = header ? header.querySelectorAll('th').length - 4 : 0;
              staff.forEach((s, i) => {
                const dayCells = Array.from({length: dayCount}, (_, di) =>
                  `<td><select class="form-input rdnSShift" data-change="rdnShiftChanged">${rdnShiftOpts(s.shifts?.[String(di)]||'')}</select></td>`
                ).join('');
                const tr = `<tr><td>${i+1}</td>
                  <td><input type="text" class="form-input rdnSName" style="width:100%;min-width:100px" value="${esc(s.name||'')}" data-input="rdnSyncFormToPrintTable"></td>
                  <td><input type="text" class="form-input rdnSPhone" style="width:100px" value="${esc(s.phone||'')}" data-input="rdnSyncFormToPrintTable"></td>
                  ${dayCells}
                  <td><button class="btn btn-xs btn-danger" data-click="rdnRemoveStaffRow"><i class="fas fa-times"></i></button></td></tr>`;
                if (tbody) tbody.insertAdjacentHTML('beforeend', tr);
              });
            }
          }
          sf('rdnReportId').textContent = r.id;
          rdnSyncFormToPrintTable();
        }, 100);
      }
    }, 50);
    setTimeout(() => clearInterval(wait), 5000); // safety timeout
  } catch (e) { showToast('❌ ' + e.message); }
}

async function rdnDeleteReport(reportId) {
  openModal('تأكيد الحذف',
    '<div style="text-align:center;padding:10px"><i class="fas fa-exclamation-triangle" style="font-size:36px;color:#e74c3c"></i><p style="margin:8px 0 0;font-size:14px">هل أنت متأكد من حذف التقرير؟</p></div>',
    '<button class="btn btn-danger" data-click="rdnDeleteReport" data-args="' + reportId + '"><i class="fas fa-trash"></i> حذف</button><button class="btn btn-secondary" data-click="closeModal">إلغاء</button>');
  try {
    await api('DELETE', '/readiness-reports/' + reportId);
    showToast('✅ تم حذف التقرير');
    rdnOccasionChanged();
  } catch (e) { showToast('❌ ' + e.message); }
}

function rdnPrint() {
  const sel = document.getElementById('rdnOccasionSelect');
  if (!sel || !sel.value) { showToast('⚠ اختر مناسبة أولاً'); return; }
  const occText = sel.selectedOptions[0]?.textContent || 'جاهزية بنوك الدم';
  const table = document.querySelector('#rdnSummaryTable .data-table');
  if (!table) { showToast('⚠ لا توجد بيانات للطباعة'); return; }
  const clone = table.cloneNode(true);
  clone.style.width = '100%';
  clone.style.borderCollapse = 'collapse';
  const w = window.open('', '_blank', 'width=1200,height=800');
  w.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>${occText}</title>
    <style>body{font-family:Tahoma,Arial,sans-serif;margin:20px}
    table{width:100%;border-collapse:collapse;font-size:11px}
    th,td{border:1px solid #333;padding:4px;text-align:center}
    th{background:#2c3e50;color:#fff}
    @media print{body{margin:10px}th{background:#2c3e50!important;color:#fff!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    </style></head><body>${clone.outerHTML}
    <p style="text-align:center;color:#95a5a6;font-size:9px;margin-top:14px">إعداد و برمجة محمد ندا 01068880999</p></body></html>`);
  w.document.close();
  setTimeout(() => { w.print(); w.close(); }, 500);
}

function rdnExportXlsx() {
  const table = document.querySelector('#rdnSummaryTable .data-table');
  if (!table) { showToast('⚠ لا توجد بيانات للتصدير'); return; }
  let html = table.outerHTML;
  html = html.replace(/<table/g, '<table style="border-collapse:collapse;width:100%;font-family:\'Segoe UI\',Arial;font-size:10px;"');
  html = html.replace(/<th(?!\s)/g, '<th style="background:#2c3e50;color:#fff;font-weight:700;padding:4px 6px;border:1px solid #1a252f;text-align:center;white-space:nowrap"');
  html = html.replace(/<th\s+([^>]*)>/g, (m, a) => `<th ${a} style="background:#2c3e50;color:#fff;font-weight:700;padding:4px 6px;border:1px solid #1a252f;text-align:center;white-space:nowrap">`);
  html = html.replace(/<td(?!\s)/g, '<td style="padding:3px 5px;border:1px solid #bdc3c7;text-align:center;font-size:10px;mso-number-format:\'\\@\'"');
  html = html.replace(/<td\s+([^>]*)>/g, (m, a) => `<td ${a} style="padding:3px 5px;border:1px solid #bdc3c7;text-align:center;font-size:10px;mso-number-format:'\\@'">`);
  const sel = document.getElementById('rdnOccasionSelect');
  const title = sel && sel.selectedOptions[0] ? sel.selectedOptions[0].textContent : 'جاهزية بنوك الدم';
  const full = `<html dir="rtl"><head><meta charset="utf-8"></head><body>
    <table style="width:100%;margin-bottom:8px"><tr><td style="text-align:center;font-size:16px;font-weight:700;color:#2c3e50;border:none">بيان بجاهزية بنوك الدم</td></tr>
      <tr><td style="text-align:center;font-size:11px;color:#7f8c8d;border:none">${esc(title)}</td></tr></table>
    ${html}
    <table style="width:100%;margin-top:10px"><tr><td style="text-align:center;font-size:10px;color:#95a5a6;border:none">إعداد و برمجة محمد ندا 01068880999</td></tr></table></body></html>`;
  downloadBlob(new Blob(['\ufeff' + full], { type: 'application/octet-stream' }), 'جاهزية_بنوك_الدم.xls');
}

function rdnExportPdf() {
  const table = document.querySelector('#rdnSummaryTable .data-table');
  if (!table) { showToast('⚠ لا توجد بيانات للتصدير'); return; }
  const sel = document.getElementById('rdnOccasionSelect');
  const occText = sel && sel.selectedOptions[0] ? sel.selectedOptions[0].textContent : 'جاهزية بنوك الدم';
  const clone = table.cloneNode(true);
  clone.style.width = '100%';
  clone.style.borderCollapse = 'collapse';
  const w = window.open('', '_blank', 'width=1200,height=800');
  w.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>${occText}</title>
    <style>body{font-family:Tahoma,Arial,sans-serif;margin:20px}
    table{width:100%;border-collapse:collapse;font-size:11px}
    th,td{border:1px solid #333;padding:4px;text-align:center}
    th{background:#2c3e50;color:#fff}
    @media print{body{margin:10px}th{background:#2c3e50!important;color:#fff!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    </style></head><body><h2 style="text-align:center;color:#2c3e50;margin-bottom:12px">بيان بجاهزية بنوك الدم</h2>
    <p style="text-align:center;color:#7f8c8d;font-size:12px;margin-bottom:16px">${esc(occText)}</p>
    ${clone.outerHTML}
    <p style="text-align:center;color:#95a5a6;font-size:9px;margin-top:14px">إعداد و برمجة محمد ندا 01068880999</p></body></html>`);
  w.document.close();
  setTimeout(() => { w.print(); w.close(); }, 500);
}

// --- Occasion CRUD ---
function rdnOpenOccasionModal(occasion) {
  const isEdit = !!occasion;
  const modalHtml = `<div class="card" style="margin:0;border:0;box-shadow:none">
    <div class="card-body" style="padding:0">
      <div style="display:grid;grid-template-columns:1fr;gap:12px">
        <div>
          <label style="font-weight:600;font-size:13px;color:#2c3e50;display:block;margin-bottom:4px">اسم المناسبة <span style="color:#e74c3c">*</span></label>
          <input type="text" id="rdnOccName" class="form-input" value="${occasion ? esc(occasion.name) : ''}" placeholder="مثال: عيد الأضحى 2026" style="width:100%">
        </div>
        <div>
          <label style="font-weight:600;font-size:13px;color:#2c3e50;display:block;margin-bottom:4px">تاريخ البداية <span style="color:#e74c3c">*</span></label>
          <input type="date" id="rdnOccFrom" class="form-input" value="${occasion ? occasion.date_from : ''}" style="width:100%">
        </div>
        <div>
          <label style="font-weight:600;font-size:13px;color:#2c3e50;display:block;margin-bottom:4px">تاريخ النهاية <span style="color:#e74c3c">*</span></label>
          <input type="date" id="rdnOccTo" class="form-input" value="${occasion ? occasion.date_to : ''}" style="width:100%">
        </div>
      </div>
      <div id="rdnOccError" style="color:#e74c3c;font-size:12px;margin-top:8px;display:none"></div>
    </div>
  </div>`;
  openModal(isEdit ? 'تعديل المناسبة' : 'إضافة مناسبة جديدة', modalHtml,
    `<button class="btn btn-secondary" data-click="closeModal">إلغاء</button>
     <button class="btn btn-primary" data-click="occFormAction" data-args="${isEdit ? 'edit,'+occasion.id : 'create'}"><i class="fas ${isEdit ? 'fa-save' : 'fa-plus'}"></i> ${isEdit ? 'تحديث' : 'إضافة'}</button>`);
  setTimeout(() => document.getElementById('rdnOccName')?.focus(), 100);
}

async function rdnCreateOccasion() {
  const name = document.getElementById('rdnOccName')?.value.trim();
  const date_from = document.getElementById('rdnOccFrom')?.value;
  const date_to = document.getElementById('rdnOccTo')?.value;
  const errEl = document.getElementById('rdnOccError');
  if (!name || !date_from || !date_to) {
    if (errEl) { errEl.textContent = '⚠ اسم المناسبة وتاريخ البداية والنهاية مطلوبة'; errEl.style.display = 'block'; }
    return;
  }
  if (date_from > date_to) {
    if (errEl) { errEl.textContent = '⚠ تاريخ البداية يجب أن يكون قبل تاريخ النهاية'; errEl.style.display = 'block'; }
    return;
  }
  if (errEl) errEl.style.display = 'none';
  try {
    const occ = await api('POST', '/readiness-occasions', { name, date_from, date_to, day_labels: [] });
    closeModal(); showToast('✅ تم إضافة المناسبة');
    localStorage.setItem('rdnLastOccasion', occ.id);
    renderReadinessSheet();
  } catch (e) { showToast('❌ ' + e.message); }
}

async function rdnUpdateOccasion(id) {
  const name = document.getElementById('rdnOccName')?.value.trim();
  const date_from = document.getElementById('rdnOccFrom')?.value;
  const date_to = document.getElementById('rdnOccTo')?.value;
  const errEl = document.getElementById('rdnOccError');
  if (!name || !date_from || !date_to) {
    if (errEl) { errEl.textContent = '⚠ اسم المناسبة وتاريخ البداية والنهاية مطلوبة'; errEl.style.display = 'block'; }
    return;
  }
  if (date_from > date_to) {
    if (errEl) { errEl.textContent = '⚠ تاريخ البداية يجب أن يكون قبل تاريخ النهاية'; errEl.style.display = 'block'; }
    return;
  }
  if (errEl) errEl.style.display = 'none';
  try {
    await api('PUT', '/readiness-occasions/' + id, { name, date_from, date_to, day_labels: [] });
    closeModal(); showToast('✅ تم تحديث المناسبة'); renderReadinessSheet();
  } catch (e) { showToast('❌ ' + e.message); }
}

// ============== Sync & Google Drive Module (المزامنة) ==============

function showSyncDialog() {
  pushNav(showMenu);
  let html = `<div class="page-actions"><button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> رجوع</button></div>
    <div class="card"><div class="card-header"><i class="fas fa-cloud-upload-alt"></i> المزامنة مع Google Drive</div>
    <div class="card-body" id="syncBody">
      <div style="text-align:center;padding:40px"><i class="fas fa-spinner fa-spin" style="font-size:32px;color:#1a73e8"></i><br>جاري تحميل معلومات المزامنة...</div>
    </div></div>`;
  document.getElementById('mainContent').innerHTML = html;
  loadSyncStatus();
}

async function loadSyncStatus() {
  try {
    const status = await api('GET', '/sync/status');
    const autoStatus = await api('GET', '/sync/auto-backup-status');
    const el = document.getElementById('syncBody');
    if (!el) return;
    const sizeKB = (status.fileSize / 1024).toFixed(1);
    const lastSync = status.fileDate ? new Date(status.fileDate).toLocaleString('ar-EG') : '—';
    const driveConnected = status.driveConnected;
    const driveConfigured = status.driveConfigured;
    const driveIcon = driveConnected ? 'fa-check-circle' : (driveConfigured ? 'fa-exclamation-triangle' : 'fa-times-circle');
    const driveColor = driveConnected ? '#28a745' : (driveConfigured ? '#ffc107' : '#dc3545');
    const driveText = driveConnected ? 'متصل' : (driveConfigured ? 'غير متصل (لم يتم المصادقة)' : 'غير مهيأ');
    const autoLast = autoStatus.lastBackup ? new Date(autoStatus.lastBackup).toLocaleString('ar-EG') : 'لم يتم بعد';
    el.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px">
        <div class="sync-stat"><i class="fas fa-server"></i> <span>الجهاز:</span> <strong>${esc(status.deviceName)}</strong></div>
        <div class="sync-stat"><i class="fas fa-database"></i> <span>حجم البيانات:</span> <strong>${esc(sizeKB)} KB</strong></div>
        <div class="sync-stat"><i class="fas fa-clock"></i> <span>آخر تعديل:</span> <strong>${esc(lastSync)}</strong></div>
        <div class="sync-stat"><i class="fas ${driveIcon}" style="color:${driveColor}"></i> <span>Google Drive:</span> <strong style="color:${driveColor}">${driveText}</strong></div>
      </div>
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:20px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;font-weight:600;font-size:15px">
          <i class="fas fa-rotate" style="color:var(--primary)"></i> النسخ الاحتياطي التلقائي
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
          <div class="sync-stat"><i class="fas fa-history"></i> <span>آخر نسخة:</span> <strong>${esc(autoLast)}</strong></div>
          <div class="sync-stat"><i class="fas fa-clock"></i> <span>الدورية:</span> <strong>${esc(autoStatus.interval)}</strong></div>
          <div class="sync-stat"><i class="fas fa-files"></i> <span>النسخ المحلية:</span> <strong>${autoStatus.backupCount}</strong></div>
        </div>
        <div style="margin-top:10px;font-size:12px;color:var(--text-muted);text-align:center">
          <i class="fas fa-info-circle"></i> ${autoStatus.enabled ? 'النسخ التلقائي نشط — يتم رفع نسخة إلى Drive كل 24 ساعة' : 'النسخ التلقائي غير نشط — قم بربط Drive أولاً'}
        </div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-bottom:20px">
        <button class="btn btn-primary" data-click="syncExport" title="تصدير نسخة احتياطية"><i class="fas fa-download"></i> تصدير</button>
        <button class="btn btn-secondary" data-click="syncImport2" title="استيراد نسخة احتياطية"><i class="fas fa-upload"></i> استيراد</button>
        ${driveConfigured ? `<button class="btn btn-info" data-click="syncDriveAuth" title="${driveConnected ? 'إعادة المصادقة' : 'المصادقة مع Google Drive'}"><i class="fas fa-cloud"></i> ${driveConnected ? 'إعادة ربط Drive' : 'ربط Drive'}</button>` : ''}
        ${driveConnected ? `<button class="btn btn-success" data-click="syncDriveUpload"><i class="fas fa-cloud-upload-alt"></i> رفع إلى Drive</button>` : ''}
        ${driveConnected ? `<button class="btn btn-warning" data-click="syncDriveDownload"><i class="fas fa-cloud-download-alt"></i> تنزيل من Drive</button>` : ''}
      </div>
      <div id="syncResult" style="text-align:center;margin-top:8px"></div>
      <div style="margin-top:20px;padding:16px;background:#f8f9fa;border-radius:8px;font-size:13px;color:#666;text-align:center">
        <i class="fas fa-info-circle"></i> عند استيراد نسخة سابقة، سيتم استبدال جميع البيانات الحالية. الرجاء أخذ نسخة احتياطية أولاً.
      </div>`;
  } catch (e) {
    const el = document.getElementById('syncBody');
    if (el) el.innerHTML = `<div class="alert alert-danger">❌ فشل تحميل معلومات المزامنة: ${esc(e.message)}</div>`;
  }
}

function syncResultMsg(msg, isError) {
  const el = document.getElementById('syncResult');
  if (el) el.innerHTML = `<div style="padding:12px;border-radius:8px;background:${isError ? '#fce4e4' : '#e8f5e9'};color:${isError ? '#c62828' : '#2e7d32'};font-weight:600">${msg}</div>`;
}

async function syncExport() {
  try {
    const result = await api('GET', '/sync/export');
    downloadBlob(new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' }), 'blood-bank-backup.json');
    syncResultMsg('✅ تم تصدير نسخة احتياطية', false);
  } catch (e) { syncResultMsg('❌ ' + e.message, true); }
}

async function syncImport() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = await api('POST', '/sync/import', { data });
      syncResultMsg('✅ تم استيراد البيانات بنجاح. سيتم إعادة تحميل الصفحة...', false);
      setTimeout(() => location.reload(), 2000);
    } catch (e) { syncResultMsg('❌ فشل الاستيراد: ' + e.message, true); }
  };
  input.click();
}

async function syncDriveAuth() {
  try {
    const result = await api('GET', '/sync/drive/auth-url');
    if (result.url) {
      openModal('ربط Google Drive',
        `<div style="text-align:center;margin-bottom:16px"><i class="fas fa-cloud" style="font-size:48px;color:#1a73e8"></i></div>
        <p style="margin-bottom:12px"><strong>الخطوة 1:</strong> افتح الرابط التالي في المتصفح وسجّل الدخول بحساب Google:</p>
        <div style="background:#f5f5f5;padding:12px;border-radius:8px;direction:ltr;text-align:left;word-break:break-all;margin-bottom:16px;border:1px solid #ddd">
          <a href="${esc(result.url)}" target="_blank" style="color:#1a73e8;font-size:13px">${esc(result.url)}</a>
        </div>
        <p style="margin-bottom:12px"><strong>الخطوة 2:</strong> بعد السماح، انسخ رمز التفويض (code) من المتصفح والصقه هنا:</p>
        <input class="form-control" id="driveAuthCode" placeholder="الصق رمز التفويض هنا" style="direction:ltr;text-align:left">`,
        `<button class="btn btn-secondary" data-click="closeModal">إلغاء</button>
        <button class="btn btn-primary" data-click="syncDriveSubmitCode"><i class="fas fa-check"></i> تأكيد</button>`);
    }
  } catch (e) { syncResultMsg('❌ ' + e.message, true); }
}

async function syncDriveSubmitCode() {
  const code = document.getElementById('driveAuthCode').value.trim();
  if (!code) { showToast('⚠ الرجاء لصق رمز التفويض'); return; }
  try {
    const cbResult = await api('POST', '/sync/drive/callback', { code });
    closeModal();
    syncResultMsg('✅ ' + cbResult.message, false);
    loadSyncStatus();
  } catch (e) { syncResultMsg('❌ ' + e.message, true); }
}

async function syncDriveUpload() {
  syncResultMsg('⏳ جاري رفع البيانات إلى Google Drive...', false);
  try {
    const result = await api('POST', '/sync/drive/upload');
    syncResultMsg('✅ ' + result.message, false);
    loadSyncStatus();
  } catch (e) { syncResultMsg('❌ ' + e.message, true); }
}

async function syncDriveDownload() {
  showConfirmModal('⚠️ سيتم استبدال جميع البيانات الحالية بنسخة Google Drive. هل أنت متأكد؟', async function() {
    syncResultMsg('⏳ جاري تنزيل البيانات من Google Drive...', false);
    try {
      const result = await api('GET', '/sync/drive/download');
      syncResultMsg('✅ ' + result.message + '. سيتم إعادة تحميل الصفحة...', false);
      setTimeout(() => location.reload(), 2000);
    } catch (e) { syncResultMsg('❌ ' + e.message, true); }
  });
}

// ============== About / User Guide (حول النظام) ==============

function showAbout() {
  pushNav(showMenu);
  const bodyHtml = `<div id="aboutBody" style="font-size:14px;line-height:1.8">

    <div style="text-align:center;margin-bottom:24px">
      <i class="fas fa-tint" style="font-size:48px;color:#dc3545;opacity:0.8"></i>
      <h2 style="color:#dc3545;margin:8px 0 4px">نظام إدارة بنوك الدم</h2>
      <div style="color:#999;font-size:13px">الإصدار 1.0 — هيئة التأمين الصحي الشامل</div>
    </div>

    <hr style="border:none;border-top:1px solid #eee;margin:20px 0">

    <h3 style="color:#1565c0;margin-bottom:12px"><i class="fas fa-code"></i> المطور</h3>
    <table style="width:100%;max-width:400px;border-collapse:collapse;margin-bottom:20px">
      <tr><td style="padding:6px 12px;font-weight:600;border:1px solid #e0e0e0;background:#f8f9fa">الاسم</td><td style="padding:6px 12px;border:1px solid #e0e0e0">محمد ندا</td></tr>
      <tr><td style="padding:6px 12px;font-weight:600;border:1px solid #e0e0e0;background:#f8f9fa">الهاتف</td><td style="padding:6px 12px;border:1px solid #e0e0e0;direction:ltr;text-align:left">01068880999</td></tr>
      <tr><td style="padding:6px 12px;font-weight:600;border:1px solid #e0e0e0;background:#f8f9fa">التخصص</td><td style="padding:6px 12px;border:1px solid #e0e0e0">Full Stack Developer</td></tr>
    </table>

    <h3 style="color:#17a2b8;margin-bottom:12px"><i class="fas fa-cubes"></i> التقنيات المستخدمة</h3>
    <table style="width:100%;max-width:500px;border-collapse:collapse;margin-bottom:20px">
      <tr><td style="padding:6px 12px;font-weight:600;border:1px solid #e0e0e0;background:#f8f9fa">الخادم</td><td style="padding:6px 12px;border:1px solid #e0e0e0">Node.js + Express</td></tr>
      <tr><td style="padding:6px 12px;font-weight:600;border:1px solid #e0e0e0;background:#f8f9fa">قاعدة البيانات</td><td style="padding:6px 12px;border:1px solid #e0e0e0">PostgreSQL (سحابي) + lowdb JSON (محلي) — سحابياً عبر Google Drive</td></tr>
      <tr><td style="padding:6px 12px;font-weight:600;border:1px solid #e0e0e0;background:#f8f9fa">الواجهة</td><td style="padding:6px 12px;border:1px solid #e0e0e0">Vanilla JS + CSS + Font Awesome 6.5.0</td></tr>
      <tr><td style="padding:6px 12px;font-weight:600;border:1px solid #e0e0e0;background:#f8f9fa">الأمان</td><td style="padding:6px 12px;border:1px solid #e0e0e0">bcryptjs + helmet + express-rate-limit + DOMPurify</td></tr>
      <tr><td style="padding:6px 12px;font-weight:600;border:1px solid #e0e0e0;background:#f8f9fa">التصدير</td><td style="padding:6px 12px;border:1px solid #e0e0e0">Excel (xlsx) + PDF (print-to-PDF)</td></tr>
      <tr><td style="padding:6px 12px;font-weight:600;border:1px solid #e0e0e0;background:#f8f9fa">المزامنة</td><td style="padding:6px 12px;border:1px solid #e0e0e0">Google Drive API (googleapis) — OAuth 2.0</td></tr>
    </table>

    <h3 style="color:#28a745;margin-bottom:12px"><i class="fas fa-check-circle"></i> المميزات والقدرات</h3>
    <ul style="padding-right:20px;margin-bottom:20px">
      <li>المخزون اليومي — إدارة رصيد الدم اليومي لكل فصيلة</li>
      <li>TOTAL STOCK Mang — عرض إجمالي المخزون والرصيد الاستراتيجي</li>
      <li>البيان اليومي وبيان الفرع — تقارير يومية للمستشفيات والفروع</li>
      <li>المؤشرات الشهرية — مؤشرات تجميعيه وتخزينيه مع معادلات تلقائية</li>
      <li>منصرف فصائل الدم — تتبع استهلاك الدم شهرياً</li>
      <li>بيان العاملين — إدارة الموظفين مع المراجعة والبيانات الناقصة</li>
      <li>شيت الجاهزية — جاهزية بنوك الدم للمناسبات (قوى عاملة، رصيد، صيانة، أعطال، مستهلكات)</li>
      <li>الأجهزة — إدارة أجهزة بنوك الدم مع الأنواع والفئات</li>
      <li>أرشيف — أرشيف المؤشرات الشهرية ومنصرف الفصائل</li>
      <li>نظام الصلاحيات — 6 أدوار، 21 صفحة، 5 صلاحيات لكل صفحة</li>
      <li>المزامنة مع Google Drive — نسخ احتياطي سحابي آلي</li>
      <li>وضع ليلي (Dark Mode) — مريح للعين</li>
      <li>تصدير Excel و PDF — لجميع التقارير</li>
      <li>توقيت صيفي/شتوي — تبديل تلقائي للتوقيت المحلي</li>
    </ul>

    <h3 style="color:#dc3545;margin-bottom:12px"><i class="fas fa-shield-alt"></i> الأمان</h3>
    <ul style="padding-right:20px;margin-bottom:20px">
      <li>تسجيل الدخول بجلسات (Session) مع httpOnly + SameSite</li>
      <li>كلمات المرور مشفرة بـ bcrypt</li>
      <li>تقييد محاولات الدخول (15 محاولة / 15 دقيقة)</li>
      <li>حماية XSS عبر DOMPurify + HTML entity escaping</li>
      <li>صلاحيات تفصيلية حسب الدور (عرض، إضافة، تعديل، حذف، تصدير)</li>
      <li>رؤوس أمان HTTP عبر Helmet</li>
    </ul>

    <h2 style="color:#7b1fa2;border-bottom:2px solid #7b1fa2;padding-bottom:8px;margin:32px 0 20px"><i class="fas fa-book"></i> دليل المستخدم الشامل</h2>

    <h4 style="color:#e65100;margin-bottom:8px">1. تسجيل الدخول</h4>
    <p style="margin-bottom:16px">افتح المتصفح على <code>http://localhost:3001</code>. أدخل اسم المستخدم وكلمة المرور في الحقول المخصصة. اضغط على زر "دخول" أو اضغط Enter. الجلسة تبقى نشطة لمدة 8 ساعات — حتى لو حدث Refresh للصفحة، هتكون لسه داخل. في حال نسيان كلمة المرور، تواصل مع مدير النظام.</p>

    <h4 style="color:#e65100;margin-bottom:8px">2. القائمة الرئيسية (Dashboard)</h4>
    <p style="margin-bottom:16px">بعد تسجيل الدخول تظهر القائمة الرئيسية مقسمة إلى فئات: <strong>يومي</strong>، <strong>شهري</strong>، <strong>أرشيف</strong>، <strong>أخرى</strong>، <strong>الإدارة</strong>. كل فئة تحتوي على أيقونات الصفحات المتاحة حسب صلاحياتك. في الشريط العلوي تجد: اسم المستخدم، التاريخ والوقت، أزرار التوقيت الصيفي/الشتوي، الوضع الليلي، الملف الشخصي، وتسجيل الخروج.</p>

    <h4 style="color:#e65100;margin-bottom:8px">3. المخزون اليومي</h4>
    <p style="margin-bottom:16px">يعرض رصيد الدم لكل فصيلة (A+, A-, B+, B-, O+, O-, AB+, AB-) مع التقسيم إلى مجموعات (تجميعي) وتحت (تخزيني) وإجمالي. يمكن التعديل المباشر (Inline Edit) بالنقر على الخلية. الزر <i class="fas fa-plus"></i> يضيف حركة جديدة (وارد/منصرف) مع التاريخ والوقت. زر <i class="fas fa-file-excel"></i> الأخضر لتصدير Excel. زر <i class="fas fa-undo-alt"></i> للتراجع عن التعديلات.</p>

    <h4 style="color:#e65100;margin-bottom:8px">4. TOTAL STOCK Mang</h4>
    <p style="margin-bottom:16px">يعرض إجمالي المخزون لكل المحافظات الست في جدول واحد. يتضمن أزرار تصدير Excel و PDF.</p>

    <h4 style="color:#e65100;margin-bottom:8px">5. البيان اليومي</h4>
    <p style="margin-bottom:16px">اختر مستشفى من القائمة المنسدلة، ثم شاهد أو حرر البيان اليومي. البيان يشمل: فصائل الدم (A+, A-, B+, B-, O+, O-, AB+, AB-) مع الرصيد السابق والوارد والمنصرف والتالف. وأيضاً الصفائح الدموية (A, B, AB, O) والبلازما والكريو. زر <i class="fas fa-print"></i> للطباعة.</p>

    <h4 style="color:#e65100;margin-bottom:8px">6. بيان الفرع</h4>
    <p style="margin-bottom:16px">اختر محافظة من القائمة، ثم اختر مستشفى لعرض بيان الفرع. يعرض نفس بيانات البيان اليومي ولكن موجهة لمشرفي الفروع. أزرار تصدير Excel و PDF متاحة.</p>

    <h4 style="color:#e65100;margin-bottom:8px">7. المؤشرات الشهرية — تجميعيه (Big Indicators)</h4>
    <p style="margin-bottom:16px">يعرض المؤشرات التجميعية لكل المستشفيات. الأعمدة تشمل: إجمالي التجميع، الدم الكامل، فصل البلازما، فصل الصفائح، التبرع العلاجي، الغير مكتمل، المرفوض (دهني/صفراوي)، الفيروسات (C/B/دوالر)، التوزيع (دم/بلازما/صفائح/كريو)، التالف (منصرف/مرتجع/تفاعل/مفتوح/أخرى)، نسبة التالف. اختر الشهر والسنة من القوائم. الخلايا الزرقاء تحسب تلقائياً. الخلايا الحمراء تظهر إذا تجاوزت النسبة المستهدفة. التعديل مباشر (Inline Edit) — انقر على الخلية لتعديل القيمة.</p>

    <h4 style="color:#e65100;margin-bottom:8px">8. المؤشرات الشهرية — تخزينيه (Small Indicators)</h4>
    <p style="margin-bottom:16px">يعرض المؤشرات التخزينية: الوارد (دم/بلازما/كريو/مركز/مغسول)، الصادر (دم/بلازما/صفائح/كريو/مركز/مغسول)، المرتجع، التالف (منتهي/مفتوح/تلف/أخرى)،百分比 التالف والمرتجع. نفس نظام التعديل المباشر والمؤشرات الحمراء.</p>

    <h4 style="color:#e65100;margin-bottom:8px">9. منصرف فصائل الدم (Blood Consumption)</h4>
    <p style="margin-bottom:16px">يعرض استهلاك الدم شهرياً لكل مستشفى وفصيلة. اختر السنة والشهر من القوائم. زر <i class="fas fa-plus"></i> لإضافة شهر جديد. بعد يوم 25 من الشهر، يتم قفل التعديل تلقائياً ويتم عرض الشهر السابق. يظهر شريط أصفر للتأكيد.</p>

    <h4 style="color:#e65100;margin-bottom:8px">10. بيان العاملين (Employee Statement)</h4>
    <p style="margin-bottom:16px">إدارة بيانات الموظفين لكل مستشفى. يشمل:
    <ul style="margin-bottom:12px">
      <li><strong>فلترة</strong> — اختر المحافظة أو المستشفى أو الفئة لعرض الموظفين المطابقين</li>
      <li><strong>التعديل المباشر</strong> — زر "تعديل" يحول الجدول إلى وضع التعديل المباشر (Inline Edit)</li>
      <li><strong>المراجعة</strong> — زر "مراجعة" لتأكيد صحة بيانات المستشفى. يظهر علامة صح خضراء بعد المراجعة</li>
      <li><strong>بيانات المشرفين</strong> — قسم منفصل يعرض المشرفين بالفروع مع صلاحياتهم</li>
      <li><strong>البيانات الناقصة</strong> — قسم يعرض الموظفين الذين لديهم بيانات ناقصة (الرقم القومي، الهاتف، البريد)</li>
      <li><strong>إضافة موظف</strong> — زر <i class="fas fa-plus"></i> يفتح نافذة لإضافة موظف جديد (الاسم، المحافظة، المستشفى، الفئة، الدرجة، الرقم القومي، الهاتف، البريد)</li>
      <li><strong>إضافة مشرف فرع</strong> — إضافة مشرف جديد مع تحديد المحافظة والمستشفيات والمستخدم المرتبط</li>
      <li><strong>طباعة</strong> — فتح نافذة طباعة بالجدول</li>
      <li><strong>Excel و PDF</strong> — تصدير الجدول إلى Excel أو PDF</li>
    </ul></p>

    <h4 style="color:#e65100;margin-bottom:8px">11. شيت الجاهزية (Readiness Sheet)</h4>
    <p style="margin-bottom:16px">إدارة جاهزية بنوك الدم في المناسبات (الأعياد، الطوارئ، إلخ):
    <ul style="margin-bottom:12px">
      <li><strong>المناسبات</strong> — اختر مناسبة من القائمة المنسدلة. زر <i class="fas fa-plus"></i> لإضافة مناسبة جديدة (الاسم، تاريخ البداية، تاريخ النهاية). زر <i class="fas fa-trash"></i> لحذف المناسبة الحالية.</li>
      <li><strong>اختيار المستشفى</strong> — بعد اختيار المناسبة، اختر المستشفى من القائمة المنسدلة لعرض/تعبئة بيانات الجاهزية.</li>
      <li><strong>القوى العاملة</strong> — جدول الموظفين مع الاسم، الهاتف، وورديات لكل يوم. خيارات الورديات: 12 A (صباحي)، 12 P (مسائي)، 24 AP (24 ساعة)، 6 L 12 P (ليل + مسائي) أو أدخل وردية مخصصة. زر <i class="fas fa-plus"></i> يضيف صف موظف جديد.</li>
      <li><strong>حالة الرصيد</strong> — اختار <span style="color:#28a745">كافي</span> أو <span style="color:#dc3545">غير كافي</span>. إذا اخترت غير كافي، يظهر حقل "من أين تمت الاستعاضة" ويظهر رصيد الفصائل الحالي.</li>
      <li><strong>مراجعة الصيانة</strong> — اختار <span style="color:#28a745">تتم</span> أو <span style="color:#dc3545">لا تتم</span>. إذا اخترت لا تتم، اكتب سبب عدم الصيانة.</li>
      <li><strong>الأعطال</strong> — اختار <span style="color:#28a745">لا يوجد</span> أو <span style="color:#dc3545">يوجد</span>. إذا اخترت يوجد، أدخل اسم الجهاز المعطل والجهاز البديل.</li>
      <li><strong>المستهلكات</strong> — اختار <span style="color:#28a745">كافية</span> أو <span style="color:#dc3545">غير كافية</span>. إذا اخترت غير كافية، اكتب سبب النقص.</li>
      <li><strong>الحفظ</strong> — زر <i class="fas fa-save"></i> لحفظ التقرير. يتم التحقق من ملء الحقول المطلوبة قبل الحفظ.</li>
      <li><strong>الجدول الملخص</strong> — بعد حفظ التقارير، يظهر جدول مكون من 7 أعمدة (المحافظة، اسم بنك الدم، القوى العاملة، حالة الرصيد، مراجعة الصيانة، الأعطال، المستهلكات) يعرض جميع المستشفيات وبياناتها.</li>
      <li><strong>التعديل</strong> — زر <i class="fas fa-edit"></i> في الجدول الملخص يفتح التقرير للتعديل.</li>
      <li><strong>الحذف</strong> — زر <i class="fas fa-trash"></i> في الجدول الملخص يحذف التقرير.</li>
      <li><strong>تصدير Excel</strong> — زر Excel يصدر جميع المناسبات في ملف واحد متعدد الصفحات (كل مناسبة في صفحة منفصلة).</li>
      <li><strong>PDF / طباعة</strong> — فتح نافذة طباعة بالجدول الملخص.</li>
      <li><strong>الإشعارات</strong> — عند إنشاء مناسبة جديدة، يتم إنشاء إشعار للمدير بالمستشفيات التي لم تدخل بياناتها بعد. الإشعار يختفي تلقائياً عندما تكمل جميع المستشفيات.</li>
    </ul></p>

    <h4 style="color:#e65100;margin-bottom:8px">12. الأجهزة (Equipment)</h4>
    <p style="margin-bottom:16px">إدارة أجهزة بنوك الدم:
    <ul style="margin-bottom:12px">
      <li><strong>الجدول المحوري</strong> — يعرض جميع أنواع الأجهزة (22 نوعاً) لكل مستشفى في جدول واحد. الأعمدة: العدد، الحالة، الماركة، السعة لكل جهاز.</li>
      <li><strong>الفلترة</strong> — فلترة بالمحافظة، الفئة (تجميعي/تخزيني)، الحالة، ونوع الجهاز.</li>
      <li><strong>عرض المجموعات</strong> — زر لتجميع العرض حسب الفئة أو المحافظة.</li>
      <li><strong>إضافة/تعديل</strong> — انقر على اسم المستشفى لفتح نافذة التعديل. أدخل العدد، الحالة، الماركة، والسعة لكل جهاز.</li>
      <li><strong>إدارة الأنواع</strong> — زر الترس <i class="fas fa-cog"></i> يفتح نافذة إدارة أنواع الأجهزة. يمكن إضافة نوع جديد (الاسم + الفئة)، تعديل النوع، حذف النوع (مع مسح بياناته من جميع المستشفيات).</li>
      <li><strong>استيراد</strong> — استيراد بيانات الأجهزة من ملف Excel.</li>
      <li><strong>تصدير</strong> — تصدير إلى Excel و PDF.</li>
    </ul></p>

    <h4 style="color:#e65100;margin-bottom:8px">13. أرشيف المؤشرات الشهرية</h4>
    <p style="margin-bottom:16px">يعرض المؤشرات الشهرية المؤرشفة (التجميعية والتخزينية) في جدول واحد. فلترة بالسنة والمحافظة. يمكن تعديل الخلايا مباشرة (Inline Edit) أو لصق بيانات من Excel (نسخ من Excel ولصق في الجدول). نسخ/لصق متعدد الخلايا مدعوم. تصدير Excel و PDF.</p>

    <h4 style="color:#e65100;margin-bottom:8px">14. أرشيف منصرف الفصائل</h4>
    <p style="margin-bottom:16px">يعرض منصرف الفصائل المؤرشف. فلترة بالسنة والشهر والمحافظة والمستشفى ونوع الفترة (شهرية/ربع سنوية/نصف سنوية/سنوية). أزرار تعديل وحذف لكل سجل. تصدير Excel و PDF.</p>

    <h4 style="color:#e65100;margin-bottom:8px">15. الرصيد الاستراتيجي</h4>
    <p style="margin-bottom:16px">يعرض الرصيد الاستراتيجي الحالي لكل محافظة/مستشفى وفصيلة. يمكن حساب الاحتياجات الاستراتيجية بناءً على معادلات محددة. تصدير Excel و PDF.</p>

    <h4 style="color:#e65100;margin-bottom:8px">16. إدارة المستخدمين</h4>
    <p style="margin-bottom:16px">إدارة المستخدمين وصلاحياتهم:
    <ul style="margin-bottom:12px">
      <li><strong>جدول المستخدمين</strong> — يعرض جميع المستخدمين (اسم المستخدم، الاسم، الدور، المحافظة). البحث والفلترة في الوقت الحقيقي. نسخ إلى الحافظة (Copy). تصدير Excel.</li>
      <li><strong>إضافة مستخدم</strong> — الاسم، اسم المستخدم، كلمة المرور (مع إظهار/إخفاء)، الدور (مدير، مشرف هيئة، مشرف فرع، مستشفى، زائر)، المحافظة (للمشرفين)، المستشفى (لدور مستشفى)</li>
      <li><strong>تعديل مستخدم</strong> — تعديل اسم المستخدم، الاسم، الدور، المحافظة. يمكن للمستخدم تعديل اسمه فقط من صفحة الملف الشخصي.</li>
      <li><strong>حذف مستخدم</strong> — تأكيد بحذف المستخدم مع عرض اسمه.</li>
      <li><strong>صلاحيات الأدوار</strong> — صفحة منفصلة تعرض جميع الأدوار مع صلاحياتهم لكل صفحة (عرض/إضافة/تعديل/حذف/تصدير). يمكن تعديل الصلاحيات لكل دور وكل صفحة. اختيار الكل/إلغاء الكل لكل فئة. إضافة/حذف أدوار جديدة.</li>
      <li><strong>تغيير كلمة المرور</strong> — من الملف الشخصي: أدخل كلمة المرور الحالية والجديدة والتأكيد. المدير يمكنه تغيير كلمة مرور أي مستخدم بدون الحالية.</li>
    </ul></p>

    <h4 style="color:#e65100;margin-bottom:8px">17. إدارة المستشفيات والمحافظات</h4>
    <p style="margin-bottom:16px">إضافة وتعديل وحذف المستشفيات. لكل مستشفى: الاسم، المحافظة، النوع (تجميعي/تخزيني). إدارة المحافظات (إضافة/حذف). إدارة أنواع المستشفيات (إضافة/حذف).</p>

    <h4 style="color:#e65100;margin-bottom:8px">18. بيانات المشرفين</h4>
    <p style="margin-bottom:16px">عرض بيانات المشرفين والمستخدمين مع فلترة متقدمة (اختيار المحافظات). نسخ البيانات المفلترة إلى الحافظة بتنسيق جدولي.</p>

    <h4 style="color:#e65100;margin-bottom:8px">19. المزامنة مع Google Drive (النسخ الاحتياطي السحابي)</h4>
    <p style="margin-bottom:8px"><strong>الهدف:</strong> عمل نسخ احتياطي سحابي آمن لقاعدة البيانات (<code>db.json</code>) على Google Drive، واستعادتها عند الحاجة — سواء لتثبيت النظام على جهاز جديد أو للرجوع لنسخة سابقة.</p>

    <h5 style="color:#c62828;margin-top:16px;margin-bottom:6px">الخطوة 0: الإعداد المسبق (مرة واحدة — يفعلها مدير النظام)</h5>
    <p style="margin-bottom:8px">قبل أن يتمكن أي مستخدم من ربط Google Drive، يجب على المدير إنشاء ملف الإعدادات:</p>
    <ol style="margin-bottom:12px">
      <li>افتح متصفح الإنترنت واذهب إلى <a href="https://console.cloud.google.com" target="_blank" style="color:#1a73e8">https://console.cloud.google.com</a></li>
      <li>سجّل الدخول بحساب Google الخاص بك.</li>
      <li>أنشئ مشروع جديد (أو استخدم مشروع موجود) — سمِّه مثلاً "NADA" أو "Blood Bank".</li>
      <li>اذهب إلى <strong>APIs & Services → Library</strong>، ابحث عن <strong>Google Drive API</strong> واضغط <strong>Enable</strong>.</li>
      <li>اذهب إلى <strong>APIs & Services → Credentials</strong>.</li>
      <li>اضغط <strong>Create Credentials → OAuth client ID</strong>.</li>
      <li>إذا طلب منك تهيئة شاشة الموافقة (Consent Screen):
        <ul>
          <li>User Type: <strong>External</strong></li>
          <li>App name: أي اسم (مثلاً "NADA")</li>
          <li>User support email: بريدك الإلكتروني</li>
          <li>Developer contact: بريدك الإلكتروني</li>
          <li>اضغط <strong>Save and Continue</strong> في كل الخطوات (مش لازم تضيف Scopes أو Test Users)</li>
        </ul>
      </li>
      <li>Application type: <strong>Desktop app</strong></li>
      <li>الاسم: أي اسم (مثلاً "Blood Bank")</li>
      <li>اضغط <strong>Create</strong> — ستظهر نافذة بالـ <strong>Client ID</strong> و <strong>Client Secret</strong></li>
      <li>انسخ القيمتين وأنشئ ملف <code>data/drive-config.json</code> بالمحتوى التالي (إذا لم يكن موجوداً):</li>
    </ol>
    <pre style="background:#f5f5f5;padding:12px;border-radius:8px;direction:ltr;text-align:left;font-size:12px;margin-bottom:16px;border:1px solid #e0e0e0;overflow-x:auto">{
  "client_id": "387378547551-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com",
  "client_secret": "GOCSPX-xxxxxxxxxxxxxxxxxxxx",
  "redirect_uri": "urn:ietf:wg:oauth:2.0:oob"
}</pre>

    <h5 style="color:#c62828;margin-top:20px;margin-bottom:6px">الخطوة 1: فتح صفحة المزامنة</h5>
    <ol style="margin-bottom:12px">
      <li>سجّل الدخول إلى النظام بحساب مدير (admin).</li>
      <li>من القائمة الرئيسية، اذهب إلى <strong>الإدارة</strong> ثم اختر <strong>المزامنة مع Drive</strong>.</li>
      <li>ستظهر شاشة المزامنة التي تعرض:
        <ul>
          <li>اسم الجهاز (Device Name)</li>
          <li>حجم قاعدة البيانات الحالية</li>
          <li>آخر تاريخ تعديل</li>
          <li>حالة اتصال Google Drive (غير مهيأ/غير متصل/متصل)</li>
        </ul>
      </li>
    </ol>

    <h5 style="color:#c62828;margin-top:20px;margin-bottom:6px">الخطوة 2: ربط Google Drive (مرة واحدة فقط)</h5>
    <ol style="margin-bottom:12px">
      <li>تأكد من وجود ملف <code>data/drive-config.json</code> بالإعدادات الصحيحة (انظر الخطوة 0).</li>
      <li>في شاشة المزامنة، اضغط على زر <strong>ربط Drive</strong>.</li>
      <li>ستظهر نافذة منبثقة (Modal) تحتوي على:
        <ul>
          <li>الخطوة 1: رابط طويل — اضغط عليه (أو انسخه)</li>
          <li>الخطوة 2: حقل فارغ — ستلصق فيه رمز التفويض لاحقاً</li>
        </ul>
      </li>
      <li>افتح الرابط في المتصفح (نفس المتصفح أو متصفح آخر).</li>
      <li>سجّل الدخول بحساب Google الذي تريد استخدامه للتخزين السحابي.</li>
      <li>ستظهر شاشة تفويض تقول "يتطلب تطبيق Blood_Banks الوصول إلى حسابك على Google". اضغط على <strong>متابعة</strong> أو <strong>Allow</strong>.</li>
      <li>سيظهر رمز طويل (code) — مثلاً: <code>4/1AdkVLPzogdXFCPp0aJ9jS_9rfEmUoyU8J894W1eqqrDS9B5qzz4PBWJeF2M</code></li>
      <li>انسخ الرمز بالكامل (بما فيه الشرطة والمائل).</li>
      <li>ارجع إلى نافذة التطبيق (لا تغلقها).</li>
      <li>الصق الرمز في حقل "الصق رمز التفويض هنا".</li>
      <li>اضغط <strong>تأكيد</strong>.</li>
      <li>ستظهر رسالة "✅ تم ربط Google Drive بنجاح".</li>
      <li>حالة Google Drive في الشاشة ستتغير إلى <span style="color:#28a745"><strong>متصل</strong></span>.</li>
    </ol>

    <h5 style="color:#c62828;margin-top:20px;margin-bottom:6px">الخطوة 3: رفع البيانات (Backup) إلى Google Drive</h5>
    <ol style="margin-bottom:12px">
      <li>في شاشة المزامنة، تأكد أن حالة Google Drive هي <span style="color:#28a745"><strong>متصل</strong></span>.</li>
      <li>اضغط على زر <strong>رفع إلى Drive</strong> (الزر الأخضر).</li>
      <li>سيظهر مؤقت "⏳ جاري رفع البيانات إلى Google Drive..."</li>
      <li>بعد نجاح الرفع، ستظهر رسالة "✅ تم رفع البيانات إلى Google Drive".</li>
      <li>الملف يُرفع باسم <code>blood-bank-db.json</code> في حساب Google Drive الخاص بك.</li>
      <li><strong>نصيحة:</strong> ارفع نسخة بعد كل جلسة عمل مهمة، أو في نهاية كل يوم.</li>
    </ol>

    <h5 style="color:#c62828;margin-top:20px;margin-bottom:6px">الخطوة 4: تنزيل البيانات (Restore) من Google Drive</h5>
    <p style="margin-bottom:6px">استخدم هذه الخطوة عندما:</p>
    <ul style="margin-bottom:12px">
      <li>تريد نقل النظام إلى جهاز جديد.</li>
      <li>حدث خطأ في قاعدة البيانات وتريد الرجوع لآخر نسخة سليمة.</li>
      <li>تريد التراجع عن تغييرات غير مرغوب فيها.</li>
    </ul>
    <ol style="margin-bottom:12px">
      <li>في شاشة المزامنة، اضغط على زر <strong>تنزيل من Drive</strong> (الزر الأصفر).</li>
      <li>سيظهر تأكيد: "⚠️ سيتم استبدال جميع البيانات الحالية بنسخة Google Drive. هل أنت متأكد؟"</li>
      <li>اضغط OK للمتابعة أو Cancel للإلغاء.</li>
      <li>سيظهر مؤقت "⏳ جاري تنزيل البيانات من Google Drive..."</li>
      <li>بعد نجاح التنزيل، ستظهر رسالة "✅ تم تنزيل البيانات من Google Drive. سيتم إعادة تحميل الصفحة..."</li>
      <li>سيتم إعادة تحميل الصفحة تلقائياً بعد ثانيتين.</li>
    </ol>

    <h5 style="color:#c62828;margin-top:20px;margin-bottom:6px">الخطوة البديلة: تصدير/استيراد يدوي (بدون Google Drive)</h5>
    <p style="margin-bottom:6px">إذا لم تقم بربط Google Drive (أو لا تريد استخدام السحابة)، يمكنك عمل نسخ احتياطي يدوي:</p>
    <ul style="margin-bottom:12px">
      <li><strong>تصدير (Download)</strong> — اضغط على زر "تصدير". سيتم تحميل ملف <code>blood-bank-backup.json</code> على جهاز الكمبيوتر الخاص بك. يمكنك حفظه على فلاشة، إيميل، أو أي وسيلة تخزين.</li>
      <li><strong>استيراد (Upload)</strong> — اضغط على زر "استيراد". اختر ملف JSON من جهازك (نفس الملف الذي صدرته سابقاً). سيتم استبدال جميع البيانات الحالية بالبيانات الموجودة في الملف.</li>
    </ul>
    <div style="background:#fff3e0;border:1px solid #ffcc80;border-radius:8px;padding:12px;margin-bottom:16px">
      <strong>⚠️ تنبيه مهم:</strong> عند استيراد نسخة سابقة، يتم استبدال جميع البيانات الحالية بالكامل. تأكد من أخذ نسخة احتياطية (تصدير) قبل الاستيراد.
    </div>

    <h5 style="color:#c62828;margin-top:16px;margin-bottom:6px">خطوات سريعة — ملخص للمستخدم اليومي</h5>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <tr style="background:#f8f9fa"><th style="padding:8px 12px;border:1px solid #e0e0e0;text-align:right">المهمة</th><th style="padding:8px 12px;border:1px solid #e0e0e0;text-align:right">الإجراء</th></tr>
      <tr><td style="padding:8px 12px;border:1px solid #e0e0e0">الربط الأولي لـ Drive</td><td style="padding:8px 12px;border:1px solid #e0e0e0">الإدارة ← المزامنة ← ربط Drive ← افتح الرابط ← فوض ← الصق الكود</td></tr>
      <tr><td style="padding:8px 12px;border:1px solid #e0e0e0">نسخ احتياطي يومي</td><td style="padding:8px 12px;border:1px solid #e0e0e0">الإدارة ← المزامنة ← رفع إلى Drive</td></tr>
      <tr><td style="padding:8px 12px;border:1px solid #e0e0e0">استعادة البيانات</td><td style="padding:8px 12px;border:1px solid #e0e0e0">الإدارة ← المزامنة ← تنزيل من Drive</td></tr>
      <tr><td style="padding:8px 12px;border:1px solid #e0e0e0">تصدير يدوي</td><td style="padding:8px 12px;border:1px solid #e0e0e0">الإدارة ← المزامنة ← تصدير (يحمل ملف JSON)</td></tr>
      <tr><td style="padding:8px 12px;border:1px solid #e0e0e0">استيراد يدوي</td><td style="padding:8px 12px;border:1px solid #e0e0e0">الإدارة ← المزامنة ← استيراد ← اختر ملف JSON</td></tr>
      <tr><td style="padding:8px 12px;border:1px solid #e0e0e0">تغيير حساب Google</td><td style="padding:8px 12px;border:1px solid #e0e0e0">الإدارة ← المزامنة ← إعادة ربط Drive (كرر الخطوات)</td></tr>
    </table>

    <h4 style="color:#e65100;margin-bottom:8px">20. الوضع الليلي (Dark Mode)</h4>
    <p style="margin-bottom:16px">اضغط على أيقونة القمر <i class="fas fa-moon"></i> في الشريط العلوي لتفعيل/إلغاء الوضع الليلي. الوضع الليلي يغير ألوان الواجهة إلى ألوان داكنة مريحة للعين في الإضاءة المنخفضة. يتم حفظ التفضيل في المتصفح (localStorage) ويستعيد تلقائياً عند تسجيل الدخول مرة أخرى.</p>

    <h4 style="color:#e65100;margin-bottom:8px">21. التوقيت الصيفي/الشتوي</h4>
    <p style="margin-bottom:16px">زر الساعة <i class="fas fa-clock"></i> في الشريط العلوي (يظهر للمدير فقط) يبدّل بين التوقيت الصيفي (+2 ساعة) والتوقيت الشتوي (+1 ساعة). يتم حفظ الإعداد في قاعدة البيانات ويؤثر على جميع المستخدمين.</p>

    <h4 style="color:#e65100;margin-bottom:8px">22. الملف الشخصي (My Profile)</h4>
    <p style="margin-bottom:16px">اضغط على أيقونة المستخدم <i class="fas fa-user-circle"></i> في الشريط العلوي. من هنا يمكنك: تعديل اسمك المعروض، تغيير كلمة المرور (تحتاج إدخال كلمة المرور الحالية أولاً).</p>

    <h4 style="color:#e65100;margin-bottom:8px">23. قفل التعديل بعد يوم 25</h4>
    <p style="margin-bottom:16px">في المؤشرات الشهرية ومنصرف فصائل الدم، بعد يوم 25 من كل شهر يُقفل التعديل تلقائياً. يظهر شريط أصفر في أعلى الصفحة للتأكيد. يتم عرض بيانات الشهر السابق تلقائياً. هذا يضمن عدم تعديل البيانات التاريخية بعد إغلاق الشهر.</p>

    <hr style="border:none;border-top:1px solid #ddd;margin:30px 0 20px">

    <div style="text-align:center;color:#999;font-size:13px;margin-bottom:24px">
      <i class="fas fa-code"></i> إعداد و برمجة محمد ندا 01068880999 | جميع الحقوق محفوظة &copy; 2026
    </div>

    </div>`;

  document.getElementById('mainContent').innerHTML = `<div class="page-actions">
    <button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> رجوع</button>
    <button class="btn btn-danger" data-click="printAboutPdf" style="float:left"><i class="fas fa-file-pdf"></i> تحميل PDF</button>
  </div>
  <div class="card"><div class="card-header"><i class="fas fa-info-circle"></i> حول النظام</div>
  <div class="card-body">${bodyHtml}</div></div>`;
}

function printAboutPdf() {
  const el = document.getElementById('aboutBody');
  if (!el) return;
  const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head>
    <meta charset="UTF-8"><title>دليل نظام إدارة بنوك الدم</title>
    <style>
      @page { size: A4; margin: 2cm }
      body { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 12px; line-height: 1.8; color: #333 }
      code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 11px; direction: ltr; display: inline-block }
      pre { background: #f5f5f5; padding: 10px; border-radius: 5px; font-size: 11px; direction: ltr; text-align: left; border: 1px solid #e0e0e0; overflow-x: auto }
      table { width: 100%; border-collapse: collapse; margin-bottom: 16px }
      td, th { padding: 5px 10px; border: 1px solid #ddd; text-align: right }
      th { background: #f0f0f0 }
      ul, ol { margin-bottom: 12px; padding-right: 20px }
      li { margin-bottom: 4px }
      h2 { color: #7b1fa2; border-bottom: 2px solid #7b1fa2; padding-bottom: 6px }
      h3 { color: #1565c0; margin-top: 24px }
      h4 { color: #e65100; margin-top: 18px; margin-bottom: 6px }
      h5 { color: #c62828; margin-top: 14px; margin-bottom: 4px }
      hr { border: none; border-top: 1px solid #ddd; margin: 20px 0 }
      .center { text-align: center }
      .note { background: #fff3e0; border: 1px solid #ffcc80; border-radius: 5px; padding: 10px; margin-bottom: 12px }
      @media print { .no-print { display: none } }
    </style>
  </head><body>${el.innerHTML}</body></html>`;
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 500);
}

// --- Sync CSS injected once ---
(function injectSyncStyles() {
  if (document.getElementById('syncStyles')) return;
  const style = document.createElement('style');
  style.id = 'syncStyles';
  style.textContent = `
    .sync-stat {background:var(--card-bg);border:1px solid var(--border);border-radius:10px;padding:16px 20px;font-size:14px;display:flex;align-items:center;gap:12px;box-shadow:var(--shadow-sm)}
    .sync-stat i {font-size:22px;width:28px;text-align:center;color:var(--primary)}
    .sync-stat span {color:var(--text-muted)}
  `;
  document.head.appendChild(style);
})();

// Fetch hospitals once for archive type filter
let _archHospitals = null;
async function getArchHospitals() {
  if (!_archHospitals) _archHospitals = await api('GET', '/hospitals');
  return _archHospitals;
}


document.addEventListener('DOMContentLoaded', () => { applyDarkMode(); checkSession(); });
