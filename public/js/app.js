/* event delegation for CSP compliance */
(function(){var H={},E={click:1,change:1,input:1,focusin:1,paste:1,focusout:1,keydown:1,mouseover:1,mouseout:1};window._dh=function(n,f){H[n]=f;};for(var K in E){if(E.hasOwnProperty(K)){(function(et){document.addEventListener(et,function(e){try{var attr='data-'+et;if(et==='focusin')attr='data-focus';if(et==='focusout')attr='data-blur';if(et==='keydown')attr='data-keydown';var el=e.target.closest('['+attr+']');if(!el)return;var n=el.getAttribute(attr);if(!n)return;var fn=H[n];if(typeof fn!=='function')fn=window[n];if(typeof fn!=='function')return;var args=el.getAttribute('data-args');var parsed=[];if(args){var parts=args.split(',');for(var i=0;i<parts.length;i++){var a=parts[i].trim();if(a==='null'){parsed.push(null);continue;}if(a==='undefined'){parsed.push(undefined);continue;}if(a==='true'){parsed.push(true);continue;}if(a==='false'){parsed.push(false);continue;}var num=Number(a);if(!isNaN(num)&&a.length>0){parsed.push(num);continue;}var s=a;if((s[0]==='"'&&s[s.length-1]==='"')||(s[0]==="'"&&s[s.length-1]==="'"))s=s.slice(1,-1);parsed.push(s);}}fn.apply(el,parsed);}catch(ex){console.error('[delegation]',et,n,ex.message);}});})(K);}}})();
/* ─── ExcelJS Shared Helpers ─── */
const _XB={style:'thin',color:{argb:'FFB0BEC5'}};
const _XBN={top:_XB,bottom:_XB,left:_XB,right:_XB};
function _xlsxDl(wb,fn){
  wb.creator='نظام بنك الدم';wb.created=new Date();
  wb.xlsx.writeBuffer().then(function(b){
    const bl=new Blob([b],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    const u=URL.createObjectURL(bl),a=document.createElement('a');
    a.href=u;a.download=fn;document.body.appendChild(a);a.click();
    setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(u);},1000);
    showToast('✅ تم التصدير بنجاح');
  }).catch(function(err){
    console.error('[ExcelJS] writeBuffer error:',err);
    showToast('❌ خطأ في إنشاء ملف Excel: '+err.message,'error');
  });
}
function _xlsxTbl(table,opts){
  if(!table)return null;
  if(typeof ExcelJS==='undefined'){showToast('❌ مكتبة ExcelJS غير محمّلة — تأكد من اتصال الإنترنت ثم أعد تحميل الصفحة','error');return null;}
  opts=opts||{};
  const wb=new ExcelJS.Workbook(),ws=wb.addWorksheet(opts.sheetName||'بيانات');
  const hBg=opts.headerBg||'FF2C3E50',hFg=opts.headerFg||'FFFFFFFF';
  const skipAct=opts.skipActions!==false;
  const trs=Array.from(table.querySelectorAll('tr'));
  if(!trs.length)return{wb:wb,ws:ws,r:1,mc:0};
  let mc=0;trs.forEach(function(tr){const n=tr.querySelectorAll('th,td').length;if(n>mc)mc=n;});
  if(skipAct&&mc>0)mc--;
  let maxAc=0;
  const occ={};
  const merged=[];
  function _m(r1,c1,r2,c2){
    for(let i=0;i<merged.length;i++){const m=merged[i];
      if(r1<=m[2]&&r2>=m[0]&&c1<=m[3]&&c2>=m[1])return;}
    merged.push([r1,c1,r2,c2]);
    try{ws.mergeCells(r1,c1,r2,c2);}catch(e){}
  }
  let r=opts.startRow||1;
  trs.forEach(function(tr,tri){
    const cells=Array.from(tr.querySelectorAll('th,td'));
    const isH=cells.length>0&&cells[0].tagName==='TH';
    if(skipAct&&cells.length===mc+1)cells.pop();
    const rw=ws.getRow(r);rw.height=isH?24:18;
    let ac=1;
    cells.forEach(function(td){
      while(occ[tri+','+ac])ac++;
      const v=td.textContent.trim();
      const cs=parseInt(td.getAttribute('colspan'))||1;
      const rs=parseInt(td.getAttribute('rowspan'))||1;
      const c=ws.getCell(r,ac);
      const nm=parseFloat(v.replace(/[,]/g,''));
      if(!isNaN(nm)&&v.replace(/[,.\-\s]/g,'').length===0&&v.length>0){c.value=nm;c.numFmt='#,##0';}
      else{c.value=v;}
      c.alignment={horizontal:'center',vertical:'middle',wrapText:true};
      c.border=_XBN;
      if(isH){c.font={bold:true,color:{argb:hFg},size:10};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:hBg}};}
      else{c.font={size:9};if(r%2===0)c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF8F9FA'}};}
      if(cs>1&&rs>1)_m(r,ac,r+rs-1,ac+cs-1);
      else if(cs>1)_m(r,ac,r,ac+cs-1);
      else if(rs>1)_m(r,ac,r+rs-1,ac);
      for(let dr=0;dr<rs;dr++)for(let dc=0;dc<cs;dc++)occ[(tri+dr)+','+(ac+dc)]=1;
      ac+=cs;
    });
    if(ac-1>maxAc)maxAc=ac-1;
    r++;
  });
  const actualMc=maxAc||mc;
  for(let i=1;i<=actualMc;i++)ws.getColumn(i).width=i===1?22:14;
  return{wb:wb,ws:ws,r:r,mc:actualMc};
}
function _xlsxTitleRow(ws,row,title,sub,mc){
  ws.mergeCells(row,1,row,mc);const c=ws.getCell(row,1);c.value=title;
  c.font={bold:true,size:14,color:{argb:'FF2C3E50'}};c.alignment={horizontal:'center',vertical:'middle'};
  ws.getRow(row).height=28;
  if(sub){ws.mergeCells(row+1,1,row+1,mc);const s=ws.getCell(row+1,1);s.value=sub;
  s.font={size:10,color:{argb:'FF7F8C8D'}};s.alignment={horizontal:'center'};ws.getRow(row+1).height=18;return row+2;}
  return row+1;
}
function _xlsxFooter(ws,row,mc){
  ws.mergeCells(row,1,row,mc);const c=ws.getCell(row,1);
  c.value='إعداد و برمجة محمد ندا 01068880999';
  c.font={size:9,color:{argb:'FF95A5A6'},italic:true};c.alignment={horizontal:'center'};
}

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
_dh('goBack',function(){goBack();});
_dh('loadIndicatorAnalysis',function(){loadIndicatorAnalysis();});
_dh('iaPickerSelectAll',function(){iaPickerSelectAll();});
_dh('iaPickerClearAll',function(){iaPickerClearAll();});
_dh('iaPickerChanged',function(){iaPickerChanged();});
_dh('toggleIaPicker',function(){toggleIaPicker();});
_dh('autoFillEmpNameEdit',function(){autoFillEmpName('euName','euHosp');});
_dh('autoFillEmpNameAdd',function(){autoFillEmpName('auName','auHosp');});
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

function formatTimeAmPm(t) {
  if (!t) return '';
  const p = String(t).split(':');
  const h = parseInt(p[0], 10) || 0;
  const m = parseInt(p[1], 10) || 0;
  const ap = h < 12 ? 'صباحًا' : 'مساءً';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ap}`;
}

function buildLastUpdateNote(reports) {
  const roll = (reports || []).reduce((a, r) => ((r.last_rollover || '') > a ? r.last_rollover : a), '');
  const latest = (reports || []).reduce((a, r) => {
    const lu = r.last_update || ((r.date ? r.date + ' ' : '') + (r.time || ''));
    return lu > a.k ? { k: lu, last_update: r.last_update, date: r.date || '', time: r.time || '' } : a;
  }, { k: '', last_update: '', date: '', time: '' });
  let date = '', time = '';
  if (roll) {
    date = roll.slice(0, 10);
    time = roll.slice(11, 16);
  } else if (latest.k) {
    date = latest.last_update ? latest.last_update.slice(0, 10) : latest.date;
    time = latest.last_update ? latest.last_update.slice(11, 16) : latest.time;
  }
  if (!date && !time) return '';
  return `<div style="margin:0 0 10px;padding:9px 14px;background:var(--card-bg);border:1px solid var(--border);border-right:4px solid #2c3e50;border-radius:8px;font-weight:700;color:var(--text)">آخر تحديث: ${date} الساعة ${formatTimeAmPm(time)}</div>`;
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
    const note = buildLastUpdateNote(reports);
    const SUB = ['رصيد سابق', 'وارد', 'منصرف', 'اعدام', 'رصيد متاح'];
    const SUB_TOT = ['رصيد سابق', 'وارد', 'منصرف', 'اعدام', 'رصيد متاح'];
    let h = '<table class="data-table" id="dailyStockTable"><thead>';
    h += '<tr><th rowspan="3">الفرع</th><th rowspan="3">اسم بنك الدم</th><th rowspan="3">تحت فحص</th>';
    h += `<th colspan="${BTYPES.length * 5}" class="blood-header">رصيــــــد الـــــــــــدم</th>`;
    h += '<th colspan="5" class="total-header">المجموع</th>';
    h += `<th colspan="${PTYPES.length * 5}" class="plasma-header">رصيد البلازما المفحوص</th>`;
    h += '<th colspan="5" class="total-header">المجموع</th>';
    h += '<th rowspan="3">الصفائح</th><th rowspan="3">الكرايو</th><th rowspan="3">الترخيص</th><th rowspan="3">وضع الترخيص</th></tr>';
    h += '<tr>';
    BTYPES.forEach(t => h += `<th colspan="5">${t}</th>`);
    SUB_TOT.forEach(l => h += `<th>${l}</th>`);
    PTYPES.forEach(t => h += `<th colspan="5">${t}</th>`);
    SUB_TOT.forEach(l => h += `<th>${l}</th>`);
    h += '</tr>';
    h += '<tr>';
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
        h += `<td>${r.hospital_name || ''}</td>`;
        h += `<td class="cell-under" title="تحت الفحص — تلقائياً من أكياس الدم (الدم غير المفحوص)">${r.under_inspection || 0}</td>`;
        BTYPES.forEach(t => {
          const d = bd[t] || {};
          bTot.previous += d.previous || 0; bTot.incoming += d.incoming || 0;
          bTot.outgoing += d.outgoing || 0; bTot.disposal += d.disposal || 0;
          const av = calcAvail(bd, t); bTot.available += av;
          h += `<td class="cell-auto-inc" title="رصيد سابق — تلقائياً (آخر متاح × نقل تلقائي كل 08:30 و20:30)" data-group="blood" data-type="${t}" data-sub="previous" data-rid="${r.id}">${d.previous || 0}</td>`;
          h += `<td class="cell-auto-inc" title="وارد — تلقائياً من أكياس الدم المفحوصة (المتاحة)" data-group="blood" data-type="${t}" data-sub="incoming" data-rid="${r.id}">${d.incoming || 0}</td>`;
          h += `<td class="cell-auto-inc" title="المنصرف — تلقائياً من أكياس الدم (إرسال لمستشفى آخر / صرف لمريض أو هيئة)" data-group="blood" data-type="${t}" data-sub="outgoing" data-rid="${r.id}">${d.outgoing || 0}</td>`;
          h += `<td class="cell-auto-inc" title="الإعدام — تلقائياً من أكياس الدم (مرتجع / نظام مفتوح / أخرى / انتهاء صلاحية / تفاعل) — بدون إعدام التجميع (فيروسات / لم يكتمل / غيرها)" data-group="blood" data-type="${t}" data-sub="disposal" data-rid="${r.id}">${d.disposal || 0}</td>`;
          h += `<td class="avail-cell" data-group="blood" data-type="${t}" data-sub="available" data-rid="${r.id}">${av}</td>`;
        });
        h += `<td class="total-cell" data-role="btotal" data-sub="previous">${bTot.previous}</td><td class="total-cell" data-role="btotal" data-sub="incoming">${bTot.incoming}</td><td class="total-cell" data-role="btotal" data-sub="outgoing">${bTot.outgoing}</td><td class="total-cell" data-role="btotal" data-sub="disposal">${bTot.disposal}</td><td class="total-cell" data-role="btotal" data-sub="available">${bTot.available}</td>`;
        PTYPES.forEach(t => {
          const d = pd[t] || {};
          pTot.previous += d.previous || 0; pTot.incoming += d.incoming || 0;
          pTot.outgoing += d.outgoing || 0; pTot.disposal += d.disposal || 0;
          const av = calcAvail(pd, t); pTot.available += av;
          h += `<td class="cell-auto-inc" title="رصيد سابق — تلقائياً (آخر متاح × نقل تلقائي كل 08:30 و20:30)" data-group="plasma" data-type="${t}" data-sub="previous" data-rid="${r.id}">${d.previous || 0}</td>`;
          h += `<td class="cell-auto-inc" title="وارد — تلقائياً من أكياس البلازما المفحوصة (المتاحة)" data-group="plasma" data-type="${t}" data-sub="incoming" data-rid="${r.id}">${d.incoming || 0}</td>`;
          h += `<td class="cell-auto-inc" title="المنصرف — تلقائياً من أكياس البلازما (إرسال لمستشفى آخر / صرف لمريض أو هيئة)" data-group="plasma" data-type="${t}" data-sub="outgoing" data-rid="${r.id}">${d.outgoing || 0}</td>`;
          h += `<td class="cell-auto-inc" title="الإعدام — تلقائياً من أكياس البلازما (مرتجع / نظام مفتوح / أخرى / انتهاء صلاحية / تفاعل / Lipemic / Hemolyzed) — بدون إعدام التجميع (فيروسات / لم يكتمل / ولادة)" data-group="plasma" data-type="${t}" data-sub="disposal" data-rid="${r.id}">${d.disposal || 0}</td>`;
          h += `<td class="avail-cell" data-group="plasma" data-type="${t}" data-sub="available" data-rid="${r.id}">${av}</td>`;
        });
        h += `<td class="total-cell" data-role="ptotal" data-sub="previous">${pTot.previous}</td><td class="total-cell" data-role="ptotal" data-sub="incoming">${pTot.incoming}</td><td class="total-cell" data-role="ptotal" data-sub="outgoing">${pTot.outgoing}</td><td class="total-cell" data-role="ptotal" data-sub="disposal">${pTot.disposal}</td><td class="total-cell" data-role="ptotal" data-sub="available">${pTot.available}</td>`;
        h += `<td class="${canEdit ? 'editable' : ''}" data-group="plat_cryo" data-sub="platelets" data-rid="${r.id}">${r.platelets || 0}</td><td class="${canEdit ? 'editable' : ''}" data-group="plat_cryo" data-sub="cryo" data-rid="${r.id}">${r.cryo || 0}</td><td class="${canEdit ? 'editable' : ''}" data-group="license" data-sub="license_type" data-rid="${r.id}">${r.license_type || ''}</td><td class="${canEdit ? 'editable' : ''}" data-group="license" data-sub="license_status" data-rid="${r.id}">${r.license_status || ''}</td></tr>`;
      });
    });
    if (!Object.keys(groups).length) h += '<tr><td colspan="77" class="empty-msg">لا توجد بيانات</td></tr>';
    h += '</tbody></table>';
    document.getElementById('dailyStockWrap').innerHTML = note + h;
    if (canEdit) setupInlineEdit();
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

function exportStockExcel() {
  try {
    const table = document.getElementById('dailyStockTable');
    if (!table) { showToast('❌ لا يوجد جدول بيانات', 'error'); return; }
    const res = _xlsxTbl(table, { headerBg:'FF2C3E50', skipActions:true, startRow:3 });
    if (!res) return;
    _xlsxTitleRow(res.ws, 1, 'المخزون اليومي لبنوك الدم', fmtCairoDate('full'), res.mc);
    _xlsxFooter(res.ws, res.r, res.mc);
    _xlsxDl(res.wb, 'stock-management-' + fmtCairoDate('date') + '.xlsx');
  } catch(e) {
    console.error('[exportStockExcel]', e);
    showToast('❌ خطأ في التصدير: ' + e.message, 'error');
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
  let platelets = null; let cryo = null; let license_type = null; let license_status = null;
  const cells = table.querySelectorAll(`[data-rid="${rid}"]`);
  cells.forEach(cell => {
    const g = cell.dataset.group;
    const t = cell.dataset.type;
    const s = cell.dataset.sub;
    const v = parseInt(cell.textContent.trim()) || 0;
    const tv = cell.textContent.trim();
    if (g === 'blood' && bd[t]) bd[t][s] = v;
    if (g === 'plasma' && pd[t]) pd[t][s] = v;
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
    const body = { blood: bd, plasma: pd, date, time };
    if (platelets !== null) body.platelets = platelets;
    if (cryo !== null) body.cryo = cryo;
    if (license_type !== null) body.licenseType = license_type;
    if (license_status !== null) body.licenseStatus = license_status;
    await api('PUT', '/daily-reports/' + rid, body);
    const row = table.querySelector(`tr[data-rid="${rid}"]`);
    if (row) updateRow(row, bd, pd, bTot, pTot, date, time);
  } catch(e) { console.error(e); }
}
function updateRow(row, bd, pd, bTot, pTot, date, time) {
  const todayStr = fmtCairoDate('date');
  const dateCell = row.querySelector('[data-role="date"]');
  if (dateCell) {
    dateCell.textContent = date;
    dateCell.style.color = date && date.slice(0,10) !== todayStr ? 'red' : '';
    dateCell.style.fontWeight = date && date.slice(0,10) !== todayStr ? '700' : '';
  }
  const timeCell = row.querySelector('[data-role="time"]');
  if (timeCell) timeCell.textContent = time;
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
  try {
    const wrap = document.getElementById('strategicTableWrap');
    if (!wrap) { showToast('❌ لا يوجد جدول بيانات', 'error'); return; }
    const tbl = wrap.querySelector('table');
    if (!tbl) { showToast('❌ لا يوجد جدول بيانات', 'error'); return; }
    const res = _xlsxTbl(tbl, { headerBg:'FF2E7D32', skipActions:true, startRow:3 });
    if (!res) return;
    _xlsxTitleRow(res.ws, 1, 'الرصيد الاستراتيجي', 'تاريخ التقرير: ' + new Date().toLocaleDateString('ar-EG'), res.mc);
    _xlsxFooter(res.ws, res.r, res.mc);
    _xlsxDl(res.wb, 'strategic-stock.xlsx');
  } catch(e) { console.error('[exportStrategicExcel]', e); showToast('❌ خطأ في التصدير: ' + e.message, 'error'); }
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
      <div class="card"><div class="card-body table-scroll"><div id="totalNote"></div><table id="totalTable"><thead id="totalThead"></thead><tbody id="totalTbody"></tbody></table></div></div>`;
    const data = await api('GET', '/daily-reports');
    renderTotalTable(data);
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

renderTotal = renderTotal;

function renderTotalTable(data) {
  const nCols = 3 + BTYPES.length + 1 + PTYPES.length + 1 + 4;
  const noteEl = document.getElementById('totalNote');
  if (noteEl) noteEl.innerHTML = buildLastUpdateNote(data);
  document.getElementById('totalThead').innerHTML = `
    <tr><th rowspan="2">الفرع</th><th rowspan="2">اسم بنك الدم</th><th rowspan="2">تحت فحص</th>
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
      tbody += `<td class="hosp-name">${r.hospital_name || ''}</td><td>${r.under_inspection || 0}</td>`;
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
  try {
    const table = document.getElementById('totalTable');
    if (!table) { showToast('❌ لا يوجد جدول بيانات', 'error'); return; }
    const res = _xlsxTbl(table, { headerBg:'FF2E7D32', skipActions:true, startRow:3 });
    if (!res) return;
    _xlsxTitleRow(res.ws, 1, 'إجمالي الرصيد ببنوك الدم', 'تاريخ التقرير: ' + new Date().toLocaleDateString('ar-EG'), res.mc);
    _xlsxFooter(res.ws, res.r, res.mc);
    _xlsxDl(res.wb, 'total-stock.xlsx');
  } catch(e) { console.error('[exportTotalExcel]', e); showToast('❌ خطأ في التصدير: ' + e.message, 'error'); }
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

  let html = buildLastUpdateNote([report]) + `
    <div class="stmt-header">
      <div class="stmt-title">البيان اليومي</div>
      <div><strong>المستشفى</strong> ${hosp.name}</div>
      <div><strong>عن يوم</strong> ${dd} ${dayName} ${m} ${y} الموافق ${reportDate}</div>
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
    if (!govHospIds.length) { document.getElementById('branchStmtReport').innerHTML = `<div class="empty-msg">لا توجد تقارير للفرع: ${esc(gov)}</div>`; return; }
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
          <th>اسم بنك الدم</th>
          <th>نوع المشتق</th>
          ${BTYPES.map(t => `<th>${t}</th>`).join('')}
          <th>الاجمالي</th>
          <th>المنصرف</th>
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
      html += `<tr>
        <td rowspan="2">${r.hospital_name || ''}</td>
        <td class="deriv-label">الدم</td>
        ${bVals.map(v => `<td>${v}</td>`).join('')}
        <td class="total-cell">${bSum}</td><td>${bOut}</td>
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
      <td class="total-cell">${grandBTotal}</td><td>${grandBDisp}</td>
    </tr>
    <tr class="avail-row">
      <td></td>
      <td class="deriv-label">البلازما</td>
      ${PTYPES.map(t => `<td colspan="2">${grandPVals[t]}</td>`).join('')}
      <td class="total-cell">${grandPTotal}</td><td>${grandPDisp}</td>
    </tr>`;
    html += '</tbody></table>';
    document.getElementById('branchStmtReport').innerHTML = html;
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}

function branchExportExcel() {
  try {
    const table = document.querySelector('#branchStmtReport table');
    if (!table) { showToast('❌ لا يوجد جدول بيانات', 'error'); return; }
    const title = (document.querySelector('.stmt-title') || {}).textContent || 'بيان الفرع';
    const res = _xlsxTbl(table, { headerBg:'FF2C3E50', skipActions:true, startRow:2 });
    if (!res) return;
    _xlsxTitleRow(res.ws, 1, title, '', res.mc);
    _xlsxFooter(res.ws, res.r, res.mc);
    _xlsxDl(res.wb, 'branch-statement-' + fmtCairoDate('date') + '.xlsx');
  } catch(e) { console.error('[branchExportExcel]', e); showToast('❌ خطأ في التصدير: ' + e.message, 'error'); }
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
    // Default to previous month
    let year = now.getUTCFullYear();
    let monthVal = now.getUTCMonth(); // 0-indexed
    monthVal -= 1;
    if (monthVal < 0) { monthVal = 11; year -= 1; }
    monthVal += 1; // 1-indexed

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
  hospEl.innerHTML = '<option value="">كل بنوك الدم</option>' + filtered.map(h => `<option value="${esc(h)}" ${h === curVal ? 'selected' : ''}>${esc(h)}</option>`).join('');
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
    <button onclick="windowPrint()" style="padding:10px 20px;background:#795548;color:white;border:none;border-radius:4px;cursor:pointer;font-size:14px">
      <i class="fas fa-print"></i> طباعة / حفظ PDF
    </button>
    <button onclick="downloadExcel()" style="padding:10px 20px;background:#28a745;color:white;border:none;border-radius:4px;cursor:pointer;font-size:14px;margin-right:10px">
      <i class="fas fa-file-excel"></i> تحميل Excel
    </button>
  </div>
  <script>
    function windowPrint() { window.print(); }
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
  try {
  const data = window._empData || [];
  if (!data.length) return showToast('لا توجد بيانات');
  const gov = document.getElementById('empFilterGov')?.value || '';
  const hosp = document.getElementById('empFilterHosp')?.value || '';
  const cat = document.getElementById('empFilterCat')?.value || '';
  const cls = document.getElementById('empFilterClass')?.value || '';
  const search = (document.getElementById('empSearch')?.value || '').trim().toLowerCase();
  const filtered = data.filter(function(d) {
    if (gov && d.governorate !== gov) return false;
    if (hosp && d.hospital_name !== hosp) return false;
    if (cat && d.category !== cat) return false;
    if (cls && d.classification !== cls) return false;
    if (search && (!d.employee || !d.employee.toLowerCase().includes(search)) && !(d.national_id||'').includes(search)) return false;
    return true;
  });
  const branchName = gov || 'جميع الفروع';
  const hospitalName = hosp || 'جميع بنوك الدم';
  const egroups = {};
  filtered.forEach(function(d) {
    const gk = d.governorate || 'أخرى'; const hk = d.hospital_name || 'غير معروف';
    if (!egroups[gk]) egroups[gk] = {};
    if (!egroups[gk][hk]) egroups[gk][hk] = [];
    egroups[gk][hk].push(d);
  });
  if (typeof ExcelJS === 'undefined') { showToast('مكتبة ExcelJS غير محملة', 'error'); return; }
  const wb = new ExcelJS.Workbook(); wb.creator = 'نظام بنك الدم'; wb.created = new Date();
  const ws = wb.addWorksheet('بيان العاملين', { views:[{state:'frozen',ySplit:2,xSplit:1}] });
  const mc = 7;
  const dateStr = new Date().toLocaleDateString('ar-EG');
  _xlsxTitleRow(ws, 1, 'بيان العاملين ببنوك الدم', dateStr + ' | ' + branchName + ' | ' + hospitalName, mc);
  const hdrs = ['م','الموظف','الفئه','التصنيف','الرقم القومي','التليفون','البريد'];
  const hBg = 'FF795548';
  const hRow = ws.getRow(3); hRow.height = 24;
  hdrs.forEach(function(h, ci) {
    const c = ws.getCell(3, ci+1); c.value = h;
    c.font = {bold:true, color:{argb:'FFFFFFFF'}, size:10};
    c.fill = {type:'pattern',pattern:'solid',fgColor:{argb:hBg}};
    c.alignment = {horizontal:'center',vertical:'middle',wrapText:true}; c.border = _XBN;
  });
  const egKeys = Object.keys(egroups).sort(function(a,b){return a.localeCompare(b,'ar');});
  let r = 4, ei = 0;
  egKeys.forEach(function(g) {
    const ehKeys = Object.keys(egroups[g]).sort(function(a,b){return a.localeCompare(b,'ar');});
    const total = ehKeys.reduce(function(s,k){return s+egroups[g][k].length;},0);
    ws.mergeCells(r,1,r,mc);
    const gc = ws.getCell(r,1); gc.value = 'محافظة ' + g + '  (' + total + ')';
    gc.font = {bold:true, size:11, color:{argb:'FF1565C0'}};
    gc.fill = {type:'pattern',pattern:'solid',fgColor:{argb:'FFE3F2FD'}};
    gc.alignment = {horizontal:'right',vertical:'middle'}; gc.border = _XBN;
    ws.getRow(r).height = 22; r++;
    ehKeys.forEach(function(h) {
      const emps = egroups[g][h];
      ws.mergeCells(r,1,r,mc);
      const hc = ws.getCell(r,1); hc.value = h + '  (' + emps.length + ')';
      hc.font = {bold:true, size:10, color:{argb:'FFE65100'}};
      hc.fill = {type:'pattern',pattern:'solid',fgColor:{argb:'FFFFF8E1'}};
      hc.alignment = {horizontal:'right',vertical:'middle',indent:1}; hc.border = _XBN;
      ws.getRow(r).height = 20; r++;
      emps.forEach(function(d) {
        ei++;
        const row = ws.getRow(r); row.height = 18;
        const vals = [ei, d.employee, d.category, d.classification, d.national_id, d.phone, d.email];
        vals.forEach(function(v, ci) {
          const c = ws.getCell(r, ci+1); c.value = v || '';
          c.font = {size:9}; c.alignment = {horizontal:'center',vertical:'middle'};
          c.border = _XBN;
          if (r % 2 === 0) c.fill = {type:'pattern',pattern:'solid',fgColor:{argb:'FFFAFAFA'}};
        });
        r++;
      });
    });
  });
  for (let i = 1; i <= mc; i++) ws.getColumn(i).width = [6,22,18,16,18,16,20][i-1] || 14;
  _xlsxFooter(ws, r, mc);
  _xlsxDl(wb, 'بيان_العاملين.xlsx');
  } catch(e) { console.error('[exportEmployeeExcel]', e); showToast('❌ خطأ في التصدير: ' + e.message, 'error'); }
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
    const isAdmin = me.user.role === 'admin';
    const canSeeAll = me.user.role === 'admin' || me.user.role === 'org_supervisor';
    window._isArchiveAdmin = canSeeAll;
    window._archiveCanEdit = isAdmin;

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
      document.getElementById('addArchHosp').innerHTML = hospitals.map(h => `<option value="${h.id}">${esc(h.name)}</option>`).join('');
    }

    // Populate filter dropdowns
    const allHospitals = await api('GET', '/hospitals');
    const govs = [...new Set(allHospitals.map(h => h.governorate))];
    const govEl = document.getElementById('filterGov');
    if (canSeeAll) {
      govs.forEach(g => { govEl.innerHTML += `<option value="${esc(g)}">${esc(g)}</option>`; });
    } else if (me.user.governorate) {
      govEl.innerHTML = `<option value="${esc(me.user.governorate)}" selected>${esc(me.user.governorate)}</option>`;
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
          <td>${r._archiveId && r.hospital_id && window._archiveCanEdit ? `<button class="btn btn-sm btn-outline" data-click="editArchiveRecord" data-args="${r._archiveId},${r.hospital_id},${r.year},${r.month||0},'${r.period||'monthly'}'" style="color:#1976d2;font-size:10px;margin-left:4px"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-outline" data-click="deleteArchiveRecord" data-args="${r._archiveId},${r.hospital_id},${r.year},${r.month||0},'${r.period||'monthly'}'" style="color:#dc3545;font-size:10px"><i class="fas fa-trash"></i></button>` : ''}</td>
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
    await ensureIndicatorColumnsLoaded();
    const me = await api('GET', '/me');
    const isAdmin = me.user.role === 'admin';
    const canSeeAll = me.user.role === 'admin' || me.user.role === 'org_supervisor';
    window._isArchiveAdmin = canSeeAll;
    window._archiveCanEdit = isAdmin;
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
      govs.forEach(g => { govEl.innerHTML += `<option value="${esc(g)}">${esc(g)}</option>`; });
    } else if (me.user.governorate) {
      govEl.innerHTML = `<option value="${esc(me.user.governorate)}" selected>${esc(me.user.governorate)}</option>`;
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
    const isAdmin = window._archiveCanEdit;
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
      const _hasSSG = colDefs.some(c => c.ssg);
      const _rs = _hasSSG ? 4 : 3;
      const mh = makeGroupHeader(colDefs).replace(/(rowspan="[234]">بنك الدم<\/th>)/, `$1<th rowspan="${_rs}" style="min-width:44px;font-size:11px;color:#5A7A9A">الشهر</th>`);
      let h = `<div style="margin-top:20px"><div class="table-scroll"><table class="data-table ind-table" style="min-width:800px"><thead>
        <tr><th colspan="${colDefs.length + 1 + (canEditDel ? 1 : 0)}" style="text-align:center;background:linear-gradient(135deg,#5A80A8,#7BA0C8);color:#fff;font-size:15px;font-weight:800;padding:10px 16px;letter-spacing:0.5px;border-bottom:3px solid #90b8d8">${title}</th></tr>
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
            const isEditable = !c.formula && !isAgg && c.key !== 'governorate' && c.key !== 'hospital_name' && !window._archiveEditLocked && window._archiveCanEdit;
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
  if (!window._archiveCanEdit || window._archiveEditLocked) return;
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
  try {
  const tables = document.querySelectorAll('#archIndTable table.ind-table');
  if (!tables.length) return;
  if (typeof ExcelJS === 'undefined') { showToast('❌ مكتبة ExcelJS غير محمّلة — تأكد من اتصال الإنترنت ثم أعد تحميل الصفحة','error'); return; }
  const wb = new ExcelJS.Workbook(); wb.creator = 'نظام بنك الدم'; wb.created = new Date();
  const ws = wb.addWorksheet('أرشيف مؤشرات الأداء');
  const hBg = 'FF5A7A9A';
  let maxAc = 0;
  const occ = {};
  const merged = [];
  function _m(r1, c1, r2, c2) {
    for (let i = 0; i < merged.length; i++) { const m = merged[i]; if (r1 <= m[2] && r2 >= m[0] && c1 <= m[3] && c2 >= m[1]) return; }
    merged.push([r1, c1, r2, c2]);
    try { ws.mergeCells(r1, c1, r2, c2); } catch (e) { /* skip overlap */ }
  }
  let r = 1;
  tables.forEach(function(table, ti) {
    const trs = Array.from(table.querySelectorAll('tr'));
    if (ti > 0) r++;
    trs.forEach(function(tr, tri) {
      if (tri === 0) { r++; return; }
      const cells = Array.from(tr.querySelectorAll('th,td'));
      const isH = cells.length > 0 && cells[0].tagName === 'TH';
      if (!isH) cells.pop();
      const rw = ws.getRow(r); rw.height = isH ? 24 : 18;
      let ac = 1;
      cells.forEach(function(td) {
        while (occ[ti + '_' + tri + ',' + ac]) ac++;
        const v = td.textContent.trim();
        const cs = parseInt(td.getAttribute('colspan')) || 1;
        const rs = parseInt(td.getAttribute('rowspan')) || 1;
        const c = ws.getCell(r, ac);
        const nm = parseFloat(v.replace(/[,]/g, ''));
        if (!isNaN(nm) && v.replace(/[,.\-\s]/g, '').length === 0 && v.length > 0) { c.value = nm; c.numFmt = '#,##0'; }
        else { c.value = v; }
        c.alignment = {horizontal:'center',vertical:'middle',wrapText:true}; c.border = _XBN;
        if (isH) { c.font = {bold:true,color:{argb:'FFFFFFFF'},size:10}; c.fill = {type:'pattern',pattern:'solid',fgColor:{argb:hBg}}; }
        else { c.font = {size:9}; if (r%2===0) c.fill = {type:'pattern',pattern:'solid',fgColor:{argb:'FFF8F9FA'}}; }
        if (cs > 1 && rs > 1) _m(r, ac, r + rs - 1, ac + cs - 1);
        else if (cs > 1) _m(r, ac, r, ac + cs - 1);
        else if (rs > 1) _m(r, ac, r + rs - 1, ac);
        for (let dr = 0; dr < rs; dr++) for (let dc = 0; dc < cs; dc++) occ[ti + '_' + (tri + dr) + ',' + (ac + dc)] = 1;
        ac += cs;
      });
      if (ac - 1 > maxAc) maxAc = ac - 1;
      r++;
    });
  });
  const actualMc = maxAc || 5;
  const sr = _xlsxTitleRow(ws, 1, 'أرشيف مؤشرات الأداء', '', actualMc);
  for (let i = 1; i <= actualMc; i++) ws.getColumn(i).width = i === 1 ? 22 : 14;
  _xlsxFooter(ws, r, actualMc);
  _xlsxDl(wb, 'archive_indicators_' + fmtCairoDate('date') + '.xlsx');
  } catch(e) { console.error('[exportArchiveIndicatorsExcel]', e); showToast('❌ خطأ في التصدير: ' + e.message, 'error'); }
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
  try {
  const table = document.querySelector('#exportTable table');
  if (!table) { showToast('❌ لا يوجد جدول بيانات', 'error'); return; }
  const fGov = document.getElementById('filterGov')?.value || '';
  const fYear = document.getElementById('filterYear')?.value || '';
  const fPeriod = document.getElementById('filterPeriod')?.value || '';
  const fHosp = document.getElementById('filterHosp')?.value || '';
  const periodLabels = { '': 'شهري', q1: 'الربع الأول', q2: 'الربع الثاني', q3: 'الربع الثالث', q4: 'الربع الرابع', h1: 'النصف الأول', h2: 'النصف الثاني', year: 'سنوي', all: 'الكل' };
  const hospName = fHosp ? (document.getElementById('filterHosp')?.selectedOptions[0]?.text || '') : '';
  let title = 'معدل صرف فصائل الدم';
  const parts = [];
  if (fYear) parts.push('سنة ' + fYear);
  if (fPeriod !== undefined && periodLabels[fPeriod]) parts.push(periodLabels[fPeriod]);
  if (fGov) parts.push('فرع ' + fGov);
  if (hospName) parts.push(hospName);
  if (parts.length) title += ' (' + parts.join(' - ') + ')';
  const res = _xlsxTbl(table, { headerBg:'FF2E7D32', skipActions:true, startRow:2 });
  if (!res) return;
  _xlsxTitleRow(res.ws, 1, title, '', res.mc);
  _xlsxFooter(res.ws, res.r, res.mc);
  _xlsxDl(res.wb, 'consumption_archive_' + fmtCairoDate('date') + '.xlsx');
  } catch(e) { console.error('[exportExcel]', e); showToast('❌ خطأ في التصدير: ' + e.message, 'error'); }
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

const DEFAULT_ROLES = ['admin','hospital_manager','hospital','branch_supervisor','org_supervisor','visitor'];
const DEFAULT_ROLE_LABELS = { admin:'مدير عام', hospital_manager:'مدير بنك دم', hospital:'مستخدم مستشفي', branch_supervisor:'مشرف فرع', org_supervisor:'مشرف هيئة', visitor:'زائر' };
const DEFAULT_ROLE_COLORS = { admin:'#dc3545', hospital_manager:'#6f42c1', hospital:'#17a2b8', branch_supervisor:'#fd7e14', org_supervisor:'#28a745', visitor:'#6c757d' };
async function getRoleList() {
  try {
    const rps = await api('GET', '/role-permissions');
    return (rps || []).map(rp => ({ key: rp.role, label: (rp.permissions && rp.permissions._label) || DEFAULT_ROLE_LABELS[rp.role] || rp.role }));
  } catch(e) { return DEFAULT_ROLES.map(r => ({ key: r, label: DEFAULT_ROLE_LABELS[r] || r })); }
}
async function renderUsers() {
  const el = document.getElementById('mainContent');
  try {
    const me = (await api('GET', '/me')).user;
    const isMaster = me.id === 1;
    const roleOpts = await getRoleList();
    el.innerHTML = `<div class="page-actions"><button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> الرئيسية</button>
      <div class="search-input-wrap" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <input class="search-input" id="userSearchName" placeholder="بحث بالاسم..." data-input="filterUserTable" style="min-width:150px">
        <input class="search-input" id="userSearchUser" placeholder="اسم المستخدم..." data-input="filterUserTable" style="min-width:150px">
        <select class="form-control" id="userFilterRole" data-change="filterUserTable" style="min-width:150px"><option value="">كل الأدوار</option>${roleOpts.map(r => `<option value="${r.key}">${r.label}</option>`).join('')}</select>
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
  const roleColors = DEFAULT_ROLE_COLORS;
  const roleLabels = { admin:'مدير عام', hospital_manager:'مدير بنك دم', hospital:'مستخدم مستشفي', branch_supervisor:'مشرف فرع', org_supervisor:'مشرف هيئة', visitor:'زائر' };
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
  try {
  const table = document.getElementById('userTable');
  if (!table) { showToast('❌ لا يوجد جدول بيانات', 'error'); return; }
  const clone = table.cloneNode(true);
  clone.querySelectorAll('tr').forEach(function(tr) {
    const last = tr.querySelector('td:last-child, th:last-child');
    if (last) last.remove();
  });
  const res = _xlsxTbl(clone, { headerBg:'FF333333', skipActions:false, startRow:2 });
  if (!res) return;
  _xlsxTitleRow(res.ws, 1, 'قائمة المستخدمين', '', res.mc);
  _xlsxFooter(res.ws, res.r, res.mc);
  _xlsxDl(res.wb, 'users_' + fmtCairoDate('date') + '.xlsx');
  } catch(e) { console.error('[exportUsersExcel]', e); showToast('❌ خطأ في التصدير: ' + e.message, 'error'); }
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
async function showAddUserModal() {
  const [hospitals, govs, roleOpts] = await Promise.all([api('GET', '/hospitals'), api('GET', '/governorates'), getRoleList()]);
  const roles = roleOpts.filter(r => r.key !== 'admin');
  openModal('إضافة مستخدم',
    `<div class="form-group"><label>الاسم</label><div style="display:flex;gap:6px"><input class="form-control" id="auName" style="flex:1"> <button class="btn btn-sm btn-outline" data-click="pickEmpName" data-args="'auName','auHosp'" title="اختيار الاسم من بيان العاملين" style="white-space:nowrap"><i class="fas fa-user-tie"></i></button></div></div>
    <div class="form-group"><label>اسم المستخدم</label><input class="form-control" id="auUsername"></div>
    <div class="form-group" style="position:relative"><label>كلمة المرور</label><input class="form-control" id="auPassword" value="123" style="padding-left:36px"><span data-click="togglePasswordVisibility" data-args="'auPassword'" style="position:absolute;left:10px;bottom:8px;cursor:pointer;color:#999;font-size:16px"><i class="fas fa-eye"></i></span></div>
    <div class="form-group"><label>الدور</label><select class="form-control" id="auRole" data-change="toggleUserFields">
      ${roles.map(r => `<option value="${r.key}">${r.label}</option>`).join('')}</select></div>
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
          <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--card-bg);border-bottom:1px solid var(--border)">
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
async function editUser(id) {
  const [me, users, hospitals, govs, roleOpts] = await Promise.all([api('GET', '/me'), api('GET', '/users'), api('GET', '/hospitals'), api('GET', '/governorates'), getRoleList()]);
  const u = users.find(x => x.id === id); if (!u) return;
  const isMaster = me.user.id === 1;
  const govArr = Array.isArray(govs) ? govs : [];
  openModal('تعديل المستخدم - ' + u.name,
    `<div class="form-group"><label>الاسم</label><div style="display:flex;gap:6px"><input class="form-control" id="euName" value="${String(u.name||'').replace(/"/g,'"')}" style="flex:1"> <button class="btn btn-sm btn-outline" data-click="pickEmpName" data-args="'euName','euHosp'" title="اختيار الاسم من بيان العاملين" style="white-space:nowrap"><i class="fas fa-user-tie"></i></button></div></div>
    ${isMaster ? `<div class="form-group"><label>الدور</label><select class="form-control" id="euRole" data-change="toggleEditUserFields">
      ${roleOpts.map(r => `<option value="${r.key}" ${r.key===u.role?'selected':''}>${r.label}</option>`).join('')}</select></div>` : ''}
      <div class="form-group" style="position:relative"><label>كلمة المرور</label><input class="form-control" id="euPassword" value="123" style="padding-left:36px"><span data-click="togglePasswordVisibility" data-args="'euPassword'" style="position:absolute;left:10px;bottom:8px;cursor:pointer;color:#999;font-size:16px"><i class="fas fa-eye"></i></span></div>
      ${isMaster ? `<div class="form-group" id="euGovGroup" style="${u.role==='branch_supervisor'?'':'display:none'}"><label>الفرع</label><select class="form-control" id="euGov">${govArr.map(g => `<option value="${g}" ${g===u.governorate?'selected':''}>${g}</option>`).join('')}</select></div>` : ''}
      ${isMaster ? `<div class="form-group" id="euHospGroup" style="${(u.role==='hospital' || u.role==='hospital_manager')?'':'display:none'}"><label>المستشفى</label><select class="form-control" id="euHosp" data-change="autoFillEmpNameEdit">${hospitals.map(h => `<option value="${h.id}" ${h.id===u.hospital_id?'selected':''}>${h.name}</option>`).join('')}</select></div>` : ''}
      ${isMaster ? `<div class="form-group" id="euVisHospGroup" style="${u.role==='visitor'?'':'display:none'}"><label>المستشفيات المسموحة (للزائر)</label><select class="form-control" id="euVisHospitals" multiple style="height:120px">${hospitals.map(h => `<option value="${h.id}" ${(u.view_hospital_ids||[]).includes(h.id)?'selected':''}>${h.name}</option>`).join('')}</select><small style="color:var(--text-muted);display:block;margin-top:4px">Ctrl+Click لتحديد أكثر من مستشفى</small></div>` : ''}
      <div class="form-group"><label>التليفون</label><input class="form-control" id="euPhone" value="${String(u.phone||'').replace(/"/g,'"')}" dir="ltr"></div>
      <div class="form-group"><label>البريد الالكتروني</label><input class="form-control" id="euEmail" value="${String(u.email||'').replace(/"/g,'"')}" dir="ltr"></div>
      ${isMaster ? `<div style="margin-top:8px;padding:8px 10px;background:#e8f5e9;border-radius:8px;font-size:12px;color:#2e7d32"><i class="fas fa-info-circle"></i> الصلاحيات تتحكم فيها من <strong>صلاحيات الأدوار</strong></div>` : ''}`,
      `<button class="btn btn-secondary" data-click="closeModal">إلغاء</button>
      <button class="btn btn-primary" data-click="saveUser" data-args="${id}">حفظ</button>`);
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
      const perms = typeof rp.permissions === 'string' ? (() => { try { return JSON.parse(rp.permissions); } catch { return {}; } })() : (rp.permissions || {});
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
    await api('PUT', '/role-permissions', { role: key, permissions: {}, label: label });
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
  return FormulaEngine.computeFormulas(SMALL_COL_DEFS, d);
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
  let def = null;
  for (const c of BIG_COL_DEFS) { if (c.key === key) { def = c; break; } }
  if (!def) for (const c of SMALL_COL_DEFS) { if (c.key === key) { def = c; break; } }
  if (def && def.unit === '%') {
    const s = String(n);
    const dec = s.includes('.') ? s.split('.')[1] : '';
    if (dec.length <= 1) return n.toFixed(1) + '%';
    return n + '%';
  }
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
    await ensureIndicatorColumnsLoaded();
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

    const _hasSSGBig = BIG_COL_DEFS.some(c => c.ssg);
    const _rsBig = _hasSSGBig ? 4 : 3;
    const mh = makeGroupHeader(BIG_COL_DEFS).replace(/(rowspan="[234]">بنك الدم<\/th>)/, `$1<th rowspan="${_rsBig}" style="min-width:44px;font-size:11px;color:#5A7A9A">الشهر</th>`);
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
    await ensureIndicatorColumnsLoaded();
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

    const _hasSSGSmall = SMALL_COL_DEFS.some(c => c.ssg);
    const _rsSmall = _hasSSGSmall ? 4 : 3;
    const smh = makeGroupHeader(SMALL_COL_DEFS).replace(/(rowspan="[234]">بنك الدم<\/th>)/, `$1<th rowspan="${_rsSmall}" style="min-width:44px;font-size:11px;color:#5A7A9A">الشهر</th>`);
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
    await ensureIndicatorColumnsLoaded();
    const hospitals = await api('GET', '/hospitals');
    window._monIndHospitals = hospitals;
    const now = getCairoDate();
    const prevMonth = (now.getUTCMonth() + 11) % 12; // month before current
    const prevMonthVal = prevMonth + 1;
    const prevYear = now.getUTCMonth() === 0 ? now.getUTCFullYear() - 1 : now.getUTCFullYear();
    if (!window._indCmpYear1) window._indCmpYear1 = prevYear;
    if (!window._indCmpYear2) window._indCmpYear2 = now.getUTCFullYear();
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
        <label style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#fff3cd;border:1px solid #ffc107;border-radius:6px;font-size:12px;cursor:pointer;white-space:nowrap">
          <input type="checkbox" id="indCompareMode" data-change="onIndCompareToggle" ${window._indCompareState ? 'checked' : ''} style="accent-color:#e65100;width:15px;height:15px">
          مقارنة بين فترتين
        </label>
      </div>
      <div id="indCompareSection" style="${window._indCompareState ? '' : 'display:none'};background:linear-gradient(135deg,#e3f2fd,#f3e5f5);border:1px solid #bbdefb;border-radius:10px;padding:12px 16px;margin-bottom:12px">
        <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:start">
          <div style="background:var(--card-bg);border:1px solid var(--border);border-radius:8px;padding:10px">
            <div style="font-weight:700;margin-bottom:8px;color:#1a237e;font-size:13px"><i class="fas fa-calendar"></i> الفترة الأولى (الأقدم)</div>
            <div style="display:flex;gap:8px">
              <input type="number" class="form-control" id="indCmpYear1" value="${window._indCmpYear1 || (now.getUTCFullYear()-1)}" style="width:90px;height:32px;font-size:12px">
              <select class="form-control" id="indCmpMonth1" style="width:110px;height:32px;font-size:12px">
                <option value="">سنوي</option>
                ${MONTHS_AR.map((m, i) => `<option value="${i+1}" ${String(i+1) === String(window._indCmpMonth1||'') ? 'selected' : ''}>${m}</option>`).join('')}
              </select>
            </div>
          </div>
          <div style="display:flex;align-items:center;padding-top:24px;font-size:20px;color:#1a237e;font-weight:700">VS</div>
          <div style="background:var(--card-bg);border:1px solid var(--border);border-radius:8px;padding:10px">
            <div style="font-weight:700;margin-bottom:8px;color:#b71c1c;font-size:13px"><i class="fas fa-calendar"></i> الفترة الثانية (الأحدث)</div>
            <div style="display:flex;gap:8px">
              <input type="number" class="form-control" id="indCmpYear2" value="${window._indCmpYear2 || now.getUTCFullYear()}" style="width:90px;height:32px;font-size:12px">
              <select class="form-control" id="indCmpMonth2" style="width:110px;height:32px;font-size:12px">
                <option value="">سنوي</option>
                ${MONTHS_AR.map((m, i) => `<option value="${i+1}" ${String(i+1) === String(window._indCmpMonth2||prevMonthVal) ? 'selected' : ''}>${m}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div id="indNormalFilter" style="${window._indCompareState ? 'display:none' : 'display:flex'};gap:8px;margin-bottom:12px;flex-wrap:wrap">
        <input type="number" class="search-input" id="indYearFilter" value="${now.getUTCFullYear()}" style="width:80px" data-change="renderMonthlyIndicators">
        <select class="search-input" id="indMonthFilter" data-change="renderMonthlyIndicators">
          <option value="">الشهرين الأخيرين</option>
          ${MONTHS_AR.map((m, i) => `<option value="${i+1}">${m}</option>`).join('')}
        </select>
      </div>
      <div class="card" style="margin-bottom:12px">
        <div class="card-header" style="padding:8px 16px;background:linear-gradient(135deg,#37474f,#546e7a);color:#fff;cursor:pointer;display:flex;justify-content:space-between;align-items:center" data-click="miTogglePicker" data-args="'miPickerBody','miPickerChevron'">
          <span><i class="fas fa-list-check"></i> اختيار الأعمدة</span>
          <i class="fas fa-chevron-down" id="miPickerChevron" style="transition:transform .2s"></i>
        </div>
        <div id="miPickerBody" style="display:none;padding:12px;border-top:1px solid var(--border)">
          <div id="miPickerContent"></div>
          <div style="margin-top:8px;display:flex;gap:6px">
            <button class="btn btn-sm btn-outline" data-click="miPickerSelectAll"><i class="fas fa-check-double"></i> تحديد الكل</button>
            <button class="btn btn-sm btn-outline" data-click="miPickerClearAll"><i class="fas fa-xmark"></i> إلغاء الكل</button>
          </div>
        </div>
      </div>
      <div class="card"><div class="card-body table-scroll" id="indTableWrap"></div></div>`;
    const pickerContent = document.getElementById('miPickerContent');
    if (pickerContent) {
      const typeFilter = document.getElementById('indTypeFilter')?.value || presetType || '';
      let pickerHtml = '';
      if (!typeFilter || typeFilter === 'تجميعي') {
        pickerHtml += `<div style="margin-bottom:8px"><strong style="font-size:12px;color:#1565c0"><i class="fas fa-layer-group"></i> تجميعي</strong></div>`;
        pickerHtml += miRenderPickerHtml(BIG_COL_DEFS, MI_PICKER_BIG);
      }
      if (!typeFilter || typeFilter === 'تخزيني') {
        pickerHtml += `<div style="margin-top:10px;margin-bottom:8px"><strong style="font-size:12px;color:#6a1b9a"><i class="fas fa-layer-group"></i> تخزيني</strong></div>`;
        pickerHtml += miRenderPickerHtml(SMALL_COL_DEFS, MI_PICKER_SMALL);
      }
      pickerContent.innerHTML = pickerHtml;
    }
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
    const isCompare = document.getElementById('indCompareMode')?.checked;
    if (isCompare) {
      await loadCompareData(hospitals, canEdit, presetType);
    } else {
      const filtMonth = document.getElementById('indMonthFilter')?.value;
      const params = new URLSearchParams({ year: document.getElementById('indYearFilter')?.value || '' });
      if (filtMonth) params.set('month', filtMonth);
      const hId = document.getElementById('indHospitalFilter')?.value;
      if (hId) params.set('hospitalId', hId);
      const data = await api('GET', '/monthly-indicators?' + params.toString());
      renderIndicatorsTable(hospitals, data, canEdit, presetType);
    }
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

function onIndCompareToggle() {
  const cmp = document.getElementById('indCompareMode')?.checked;
  window._indCompareState = !!cmp;
  window._indCmpYear1 = document.getElementById('indCmpYear1')?.value || '';
  window._indCmpYear2 = document.getElementById('indCmpYear2')?.value || '';
  window._indCmpMonth1 = document.getElementById('indCmpMonth1')?.value || '';
  window._indCmpMonth2 = document.getElementById('indCmpMonth2')?.value || '';
  renderMonthlyIndicators();
}

async function loadCompareData(hospitals, canEdit, presetType) {
  const wrap = document.getElementById('indTableWrap');
  if (!wrap) return;
  const typeFilter = document.getElementById('indTypeFilter')?.value || presetType || '';
  const year1 = document.getElementById('indCmpYear1')?.value || window._indCmpYear1 || '';
  const year2 = document.getElementById('indCmpYear2')?.value || window._indCmpYear2 || '';
  const month1 = document.getElementById('indCmpMonth1')?.value || window._indCmpMonth1 || '';
  const month2 = document.getElementById('indCmpMonth2')?.value || window._indCmpMonth2 || '';
  window._indCmpYear1 = year1; window._indCmpYear2 = year2;
  window._indCmpMonth1 = month1; window._indCmpMonth2 = month2;
  if (!year1 || !year2) { wrap.innerHTML = '<div class="empty-msg">اختر سنتين للمقارنة</div>'; return; }
  const hId = document.getElementById('indHospitalFilter')?.value;
  const gov = document.getElementById('indGovFilter')?.value || '';
  const months = ['يناير','فبراير','مارس','ابريل','مايو','يونيو','يوليو','اغسطس','سبتمبر','اكتوبر','نوفمبر','ديسمبر'];
  const pLabel1 = year1 + (month1 ? '/' + months[parseInt(month1)-1] : ' (سنوي)');
  const pLabel2 = year2 + (month2 ? '/' + months[parseInt(month2)-1] : ' (سنوي)');
  async function fetchPeriod(year, month) {
    const params = new URLSearchParams({ year });
    if (month) params.set('month', month);
    if (hId) params.set('hospitalId', hId);
    return api('GET', '/monthly-indicators?' + params.toString());
  }
  let p1Data, p2Data;
  try {
    [p1Data, p2Data] = await Promise.all([fetchPeriod(year1, month1), fetchPeriod(year2, month2)]);
  } catch (e) { wrap.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; return; }
  let showHospitals = hospitals;
  if (hId) showHospitals = hospitals.filter(h => h.id == hId);
  else if (typeFilter) showHospitals = hospitals.filter(h => h.type === typeFilter);
  else if (gov) showHospitals = hospitals.filter(h => h.governorate === gov);
  const govMap = new Map();
  showHospitals.forEach(h => {
    const g = h.governorate || 'غير محدد';
    if (!govMap.has(g)) govMap.set(g, []);
    govMap.get(g).push(h);
  });
  function aggHosp(hospId, dataArr, computeFn) {
    const records = dataArr.filter(r => r.hospital_id == hospId);
    if (!records.length) return { raw: {}, formulas: computeFn({}) };
    const merged = {};
    records.forEach(r => {
      const d = r.data || {};
      for (const k in d) {
        merged[k] = (Number(merged[k]) || 0) + (Number(d[k]) || 0);
      }
    });
    return { raw: merged, formulas: computeFn(merged) };
  }
  function getVal(hospAgg, c) {
    if (c.formula) return (hospAgg.formulas[c.key] || 0);
    return (hospAgg.raw[c.key] || 0);
  }
  function renderCompareTable(colDefs, label, computeFn, type) {
    const filteredCols = type === 'big' ? miGetFilteredCols(colDefs, MI_PICKER_BIG) : miGetFilteredCols(colDefs, MI_PICKER_SMALL);
    if (!filteredCols.length || filteredCols.every(c => c.key === 'governorate' || c.key === 'hospital_name')) return '';
    const dynamicCols = filteredCols.filter(c => c.key !== 'governorate' && c.key !== 'hospital_name');
    if (!dynamicCols.length) return '';
    const grpColors = {
      'التجميع':'#6a90b8','إجمالي الوارد':'#2e7d32','إجمالي المنصرف':'#c8a050',
      'الفصائل والتوافق':'#1565c0','عينات غير مفحوصة':'#8a7aa8','الإعدامات':'#e65100',
      'تحليل نسب المؤشرات':'#00695c','مؤشرات وحدات دم الأطفال':'#ad1457',
      'النسب المئوية للاعدام - أطفال':'#c2185b','النسب المئوية للاعدام':'#c2185b',
      'الوارد':'#2e7d32','المنصرف':'#6a1b9a','الفحص':'#1565c0','الصرف':'#e65100',
      'الفيروسات':'#d32f2f','الفيروسات (نسب)':'#e53935','النسب':'#00695c',
      'الاطفال':'#ad1457','الاطفال (نسب)':'#c2185b'
    };
    const groups = [];
    for (const c of dynamicCols) {
      const g = c.group || '';
      let grp = groups.find(x => x.name === g);
      if (!grp) { grp = { name: g, items: [] }; groups.push(grp); }
      grp.items.push(c);
    }
    let html = `<h3 style="margin:24px 0 10px;font-size:16px;color:#2c3e50;border-right:4px solid #dc3545;padding-right:10px">${label}</h3>`;
    html += '<div style="overflow-x:auto"><table class="ind-table" style="width:100%;border-collapse:collapse;font-size:13px"><thead>';
    html += `<tr>
      <th rowspan="2" style="background:#263238;color:#fff;padding:6px 8px;position:sticky;right:0;z-index:2;min-width:140px">المحافظة / بنك الدم</th>`;
    for (const grp of groups) {
      const bg = grpColors[grp.name] || '#455a64';
      html += `<th colspan="${grp.items.length * 2}" style="background:${bg};color:#fff;text-align:center;padding:3px 4px;font-size:11px;border:1px solid rgba(255,255,255,.2)">${esc(grp.name)}</th>`;
    }
    html += `<th rowspan="2" style="background:#333;color:#fff;padding:4px 8px;min-width:60px;text-align:center;font-size:11px">التغيير</th></tr><tr>`;
    for (const grp of groups) {
      for (const c of grp.items) {
        html += `<th style="background:#1a237e;color:#cfd8dc;padding:2px 3px;font-size:9px;min-width:50px;border-right:2px solid #5c6bc0">${esc(c.label)}</th>`;
        html += `<th style="background:#b71c1c;color:#ffcdd2;padding:2px 3px;font-size:9px;min-width:50px;border-left:2px solid #ef5350">${esc(c.label)}</th>`;
      }
    }
    html += '</tr></thead><tbody>';
    let grand1 = {}, grand2 = {};
    for (const c of dynamicCols) { grand1[c.key] = 0; grand2[c.key] = 0; }
    const sortedGovs = [...govMap.entries()].sort((a,b) => a[0].localeCompare(b[0], 'ar'));
    for (const [govName, hosps] of sortedGovs) {
      let gov1 = {}, gov2 = {};
      for (const c of dynamicCols) { gov1[c.key] = 0; gov2[c.key] = 0; }
      const hospRows = [];
      for (const h of hosps) {
        const d1 = aggHosp(h.id, p1Data, computeFn);
        const d2 = aggHosp(h.id, p2Data, computeFn);
        for (const c of dynamicCols) {
          gov1[c.key] += (Number(getVal(d1, c)) || 0);
          gov2[c.key] += (Number(getVal(d2, c)) || 0);
        }
        hospRows.push({ id: h.id, name: h.name, d1, d2 });
      }
      for (const c of dynamicCols) { grand1[c.key] += gov1[c.key]; grand2[c.key] += gov2[c.key]; }
      html += `<tr style="background:#e8eaf6;font-weight:700;border-bottom:2px solid #9fa8da">`;
      html += `<td style="padding:6px 8px;position:sticky;right:0;background:inherit;z-index:1;font-weight:700">${esc(govName)}</td>`;
      for (const c of dynamicCols) {
        html += `<td style="text-align:center;padding:3px 6px;font-size:12px;background:#e8eaf6">${_iaFmt(gov1[c.key])}</td>`;
        html += `<td style="text-align:center;padding:3px 6px;font-size:12px;font-weight:700;background:#e8eaf6">${_iaFmt(gov2[c.key])}</td>`;
      }
      { let t1=0,t2=0; for(const c of dynamicCols){t1+=Number(gov1[c.key])||0;t2+=Number(gov2[c.key])||0;} html += _iaDeltaHtml(t1,t2); }
      html += '</tr>';
      for (const hr of hospRows) {
        html += `<tr>`;
        html += `<td style="padding:4px 8px;position:sticky;right:0;background:inherit;z-index:1;padding-right:24px;font-size:12px;color:var(--text-muted)">${esc(hr.name)}</td>`;
        for (const c of dynamicCols) {
          html += `<td style="text-align:center;padding:3px 6px;font-size:11px">${_iaFmt(getVal(hr.d1, c))}</td>`;
          html += `<td style="text-align:center;padding:3px 6px;font-size:11px">${_iaFmt(getVal(hr.d2, c))}</td>`;
        }
        html += '<td style="text-align:center;color:#ccc">-</td></tr>';
      }
    }
    html += `<tr style="background:#263238;color:#fff;font-weight:700;border-bottom:2px solid #555">`;
    html += `<td style="padding:6px 8px;position:sticky;right:0;background:#263238;z-index:1;color:#fff">اجمالي الهيئة</td>`;
    for (const c of dynamicCols) {
      html += `<td style="text-align:center;padding:3px 6px;font-size:12px">${_iaFmt(grand1[c.key])}</td>`;
      html += `<td style="text-align:center;padding:3px 6px;font-size:12px;font-weight:700">${_iaFmt(grand2[c.key])}</td>`;
    }
    { let t1=0,t2=0; for(const c of dynamicCols){t1+=Number(grand1[c.key])||0;t2+=Number(grand2[c.key])||0;} html += _iaDeltaHtml(t1,t2); }
    html += '</tr>';
    html += '</tbody></table></div>';
    return html;
  }
  let html = '';
  if (!typeFilter || typeFilter === 'تجميعي') {
    html += renderCompareTable(BIG_COL_DEFS, 'التجميعي - مؤشرات أداء البنوك التجميعية', computeBigFormulas, 'big');
  }
  if (!typeFilter || typeFilter === 'تخزيني') {
    html += renderCompareTable(SMALL_COL_DEFS, 'التخزيني - مؤشرات أداء البنوك التخزينية', computeSmallFormulas, 'child');
  }
  wrap.innerHTML = html || '<div class="empty-msg">لا توجد بيانات للمقارنة</div>';
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
  return FormulaEngine.computeFormulas(BIG_COL_DEFS, d);
}

let BIG_COL_DEFS = (window.IndicatorDefs && window.IndicatorDefs.DEFAULT_BIG_DEFS && window.IndicatorDefs.DEFAULT_BIG_DEFS.length) ? window.IndicatorDefs.DEFAULT_BIG_DEFS.slice() : [
  { key: 'governorate', label: 'الفرع', cls: 'gov-col', group: '' },
  { key: 'hospital_name', label: 'بنك الدم', cls: 'hosp-col', group: '' },

  // ===== التجميع =====
  { key: 'collect_total', label: 'التجميع', group: 'التجميع' },

  // ===== إجمالي الوارد =====
  { key: 'inc_blood', label: 'دم', group: 'إجمالي الوارد', sg: 'دم' },
  { key: 'inc_plasma', label: 'بلازما', group: 'إجمالي الوارد', sg: 'بلازما' },
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
  { key: 'disp_exp_blood', label: 'دم', group: 'الإعدامات', sg: 'انتهاء الصلاحيه' },
  { key: 'disp_exp_plasma', label: 'بلازما', group: 'الإعدامات', sg: 'انتهاء الصلاحيه' },
  { key: 'disp_exp_sdp', label: 'SDP', group: 'الإعدامات', sg: 'انتهاء الصلاحيه', ssg: 'صفائح' },
  { key: 'disp_exp_rdp', label: 'RDP', group: 'الإعدامات', sg: 'انتهاء الصلاحيه', ssg: 'صفائح' },
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

let SMALL_COL_DEFS = (window.IndicatorDefs && window.IndicatorDefs.DEFAULT_SMALL_DEFS && window.IndicatorDefs.DEFAULT_SMALL_DEFS.length) ? window.IndicatorDefs.DEFAULT_SMALL_DEFS.slice() : [
  { key: 'governorate', label: 'الفرع', cls: 'gov-col', group: '' },
  { key: 'hospital_name', label: 'بنك الدم', cls: 'hosp-col', group: '' },

  // ===== إجمالي الوارد =====
  { key: 'inc_collected', label: 'تجميعي', group: 'إجمالي الوارد', sg: 'دم' },
  { key: 'inc_regional', label: 'إقليمي', group: 'إجمالي الوارد', sg: 'دم' },
  { key: 'inc_plasma', label: 'بلازما', group: 'إجمالي الوارد', sg: 'بلازما' },
  { key: 'inc_sdp', label: 'SDP', group: 'إجمالي الوارد', sg: 'صفائح' },
  { key: 'inc_rdp', label: 'RDP', group: 'إجمالي الوارد', sg: 'صفائح' },

  // ===== إجمالي المنصرف =====
  { key: 'out_blood', label: 'دم', group: 'إجمالي المنصرف', sg: 'دم' },
  { key: 'out_plasma', label: 'بلازما', group: 'إجمالي المنصرف', sg: 'بلازما' },
  { key: 'out_sdp', label: 'SDP', group: 'إجمالي المنصرف', sg: 'صفائح' },
  { key: 'out_rdp', label: 'RDP', group: 'إجمالي المنصرف', sg: 'صفائح' },

  // ===== الفصائل، التوافق، C/T =====
  { key: 'blood_groups', label: 'الفصائل', group: 'الفصائل والتوافق' },
  { key: 'compatibility', label: 'التوافق', group: 'الفصائل والتوافق' },
  { key: 'ct', label: 'C/T', formula: true, group: 'الفصائل والتوافق', target: '<2' },

  // ===== الإعدامات =====
  { key: 'disp_exp_blood', label: 'دم', group: 'الإعدامات', sg: 'انتهاء الصلاحيه' },
  { key: 'disp_exp_plasma', label: 'بلازما', group: 'الإعدامات', sg: 'انتهاء الصلاحيه' },
  { key: 'disp_exp_sdp', label: 'SDP', group: 'الإعدامات', sg: 'انتهاء الصلاحيه', ssg: 'صفائح' },
  { key: 'disp_exp_rdp', label: 'RDP', group: 'الإعدامات', sg: 'انتهاء الصلاحيه', ssg: 'صفائح' },
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

let _indColsLoaded = null;
function ensureIndicatorColumnsLoaded() {
  if (!_indColsLoaded) {
    _indColsLoaded = api('GET', '/indicator-columns').then(res => {
      const big = (res && res.big) || [];
      const small = (res && res.small) || [];
      if (big.length) BIG_COL_DEFS = big;
      if (small.length) SMALL_COL_DEFS = small;
      _iaBigFields = _iaFieldsFor('big');
      _iaSmallFields = _iaFieldsFor('small');
      _iaRebuildFormulaKeys();
      return true;
    }).catch(e => {
      console.error('loadIndicatorColumns failed:', e);
      _indColsLoaded = null;
      return false;
    });
  }
  return _indColsLoaded;
}
window.refreshIndicatorColumns = function () {
  _indColsLoaded = null;
  return ensureIndicatorColumnsLoaded();
};

// ============== العمليات الحسابية (صفحة الإدارة) ==============
let _icTab = 'big';
function icToggleFormulaFields() {
  document.getElementById('icFormulaFields').style.display = document.getElementById('icFormFormula').checked ? '' : 'none';
}
function icToggleEditFormulaFields() {
  document.getElementById('icEditFormulaFields').style.display = document.getElementById('icEditFormula').checked ? '' : 'none';
}
function icLiveTranslateAr(el) {
  const isEdit = !!document.getElementById('icEditExpr');
  const arInput = isEdit ? document.getElementById('icEditExprAr') : document.getElementById('icFormExprAr');
  const exprInput = isEdit ? document.getElementById('icEditExpr') : document.getElementById('icFormExpr');
  const preview = document.getElementById('icArPreview');
  if (!arInput || !exprInput || !preview) return;
  const text = arInput.value;
  _icSuggestCols(arInput);
  if (!text.trim()) { preview.style.display = 'none'; exprInput.value = ''; return; }
  const defs = [...(window._icData?.big || []), ...(window._icData?.small || [])];
  let tr;
  try { tr = window.FormulaEngine ? FormulaEngine.translateArabic(text, defs) : null; } catch (e) { tr = null; }
  if (tr && tr.expr) {
    exprInput.value = tr.expr;
    if (tr.leftover.length) {
      preview.style.display = '';
      preview.style.background = '#fff3cd';
      preview.style.color = '#856404';
      preview.innerHTML = '⚠️ كلمات لم تُترجم: <strong>' + esc(tr.leftover.join('، ')) + '</strong> — النتيجة قد تكون ناقصة';
    } else {
      preview.style.display = '';
      preview.style.background = '#d4edda';
      preview.style.color = '#155724';
      preview.innerHTML = '✅ الترجمة: <code dir="ltr">' + esc(tr.expr) + '</code>';
    }
  } else if (tr && !tr.expr) {
    preview.style.display = '';
    preview.style.background = '#f8d7da';
    preview.style.color = '#721c24';
    preview.innerHTML = '❌ تعذر الترجمة — تأكد من صياغة المعادلة' + (tr.leftover.length ? ' (بقيت: ' + esc(tr.leftover.join('، ')) + ')' : '');
    exprInput.value = '';
  } else {
    preview.style.display = '';
    preview.style.background = '#f8d7da';
    preview.style.color = '#721c24';
    preview.innerHTML = '❌ مكتبة الترجمة غير محملة — اكتب المعادلة بالإنجليزية مباشرة';
  }
}
function _icSuggestToken(text, pos) {
  const re = /[\u0600-\u06FF\w]/;
  let s = pos, e = pos;
  while (s > 0 && re.test(text[s - 1])) s--;
  while (e < text.length && re.test(text[e])) e++;
  return { s: s, e: e, token: text.slice(s, e) };
}
let _icSugBound = false;
function _icBindSuggestClose() {
  if (_icSugBound) return;
  _icSugBound = true;
  document.addEventListener('mousedown', function (ev) {
    const box = document.getElementById('icArSuggest');
    if (!box || box.style.display === 'none') return;
    if (box.contains(ev.target)) return;
    const t = ev.target;
    if (t && t.id && (t.id === 'icFormExprAr' || t.id === 'icEditExprAr')) return;
    _icHideSuggest();
  }, true);
}
function _icHideSuggest() {
  const box = document.getElementById('icArSuggest');
  if (box) { box.style.display = 'none'; box.innerHTML = ''; }
  window._icArInsert = null;
}
function _icSuggestCols(input) {
  const box = document.getElementById('icArSuggest');
  if (!box || !input) return;
  const text = input.value || '';
  const pos = input.selectionStart != null ? input.selectionStart : text.length;
  const tok = _icSuggestToken(text, pos);
  const defs = [...(window._icData?.big || []), ...(window._icData?.small || [])];
  if (!defs.length) { _icHideSuggest(); return; }
  const q = tok.token.trim().toLowerCase();
  const norm = t => String(t || '').toLowerCase().replace(/[\u0623\u0625\u0622]/g, 'ا').replace(/ة/g, 'ه').replace(/[ىئ]/g, 'ي');
  let items;
  if (q) {
    items = defs.filter(d =>
      (d.key && d.key.toLowerCase().indexOf(q) !== -1) ||
      (norm(d.label).indexOf(q) !== -1) ||
      (norm(d.group).indexOf(q) !== -1) ||
      (norm(d.sg).indexOf(q) !== -1));
  } else {
    items = text.trim() ? defs.slice(0, 8) : [];
  }
  if (!items.length) { _icHideSuggest(); return; }
  items = items.slice(0, 10);
  window._icArInsert = { inputId: input.id, s: tok.s, e: tok.e };
  box.innerHTML = items.map(d => {
    return `<div data-click="icPickSuggestion" data-args="${esc(d.key)}" data-mouseover="hoverOn" data-mouseout="hoverOff" data-hover-bg="var(--hover-bg,#eef6ff)" data-hover-off="" style="padding:6px 10px;cursor:pointer;border-bottom:1px solid var(--border,#f0f0f0)"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><span>${esc(d.label)}</span><code dir="ltr" style="font-size:11px;color:#7f8c8d">${esc(d.key)}</code></div><div style="font-size:10px;color:#95a5a6">إدراج المفتاح: <code dir="ltr">${esc(d.key)}</code></div></div>`;
  }).join('');
  box.style.display = '';
  _icBindSuggestClose();
}
function icPickSuggestion(key) {
  const ins = window._icArInsert;
  const isEdit = !!document.getElementById('icEditExpr');
  const input = isEdit ? document.getElementById('icEditExprAr') : document.getElementById('icFormExprAr');
  if (!input) return;
  const defs = [...(window._icData?.big || []), ...(window._icData?.small || [])];
  const d = defs.find(x => String(x.key) === String(key));
  if (!d) return;
  const text = input.value || '';
  let s = (ins && ins.inputId === input.id && ins.s != null) ? ins.s : text.length;
  let e = (ins && ins.inputId === input.id && ins.e != null) ? ins.e : text.length;
  if (s < 0 || s > text.length) s = text.length;
  if (e < s || e > text.length) e = text.length;
  input.value = text.slice(0, s) + d.key + ' ' + text.slice(e);
  input.focus();
  const np = s + d.key.length;
  input.setSelectionRange(np, np);
  icLiveTranslateAr(input);
}
async function renderIndicatorColumnsPage() {
  const el = document.getElementById('mainContent');
  await ensureIndicatorColumnsLoaded();
  let res = { big: BIG_COL_DEFS, small: SMALL_COL_DEFS };
  try {
    res = await api('GET', '/indicator-columns');
  } catch (e) { showToast('❌ ' + e.message); }
  window._icData = { big: res.big || BIG_COL_DEFS, small: res.small || SMALL_COL_DEFS };
  const canEdit = hasPerm('indicator_columns', 'edit');
  const big = window._icData.big, small = window._icData.small;
  el.innerHTML = `
    <div class="page-actions"><button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> رجوع</button>
    ${canEdit ? `<button class="btn btn-success" style="margin-inline-start:auto" data-click="icShowAddModal" data-args="'${_icTab}'"><i class="fas fa-plus"></i> إضافة عمود</button>` : ''}
    </div>
    <div class="card" style="margin-top:12px">
      <div class="card-header"><strong><i class="fas fa-calculator"></i> العمليات الحسابية لمؤشرات الأداء</strong></div>
      <div class="card-body">
        <div style="display:flex;gap:8px;margin-bottom:12px">
          <button class="btn ${_icTab === 'big' ? 'btn-primary' : 'btn-secondary'}" data-click="icSetTab" data-args="'big'">التجميعي (${big.length})</button>
          <button class="btn ${_icTab === 'small' ? 'btn-primary' : 'btn-secondary'}" data-click="icSetTab" data-args="'small'">التخزيني (${small.length})</button>
        </div>
        <div id="icTableWrap"></div>
      </div>
    </div>`;
  renderIcTable(big, small);
}
function icSetTab(t) { _icTab = t; renderIndicatorColumnsPage(); }
function renderIcTable(big, small) {
  const defs = _icTab === 'big' ? big : small;
  const canEdit = hasPerm('indicator_columns', 'edit');
  let h = '<div style="overflow:auto"><table class="data-table" style="font-size:12px"><thead><tr>' +
    '<th>ترتيب</th><th>المفتاح</th><th>التسمية</th><th>المجموعة</th><th>sg</th><th>ssg</th><th>المعادلة</th><th>الوحدة</th><th>البنش</th><th>مفعل</th><th>ثابت</th><th>إجراءات</th>' +
    '</tr></thead><tbody>';
  for (const c of defs) {
    h += '<tr>' +
      `<td style="text-align:center">${c.ord ?? ''}</td>` +
      `<td><code style="direction:ltr">${esc(c.key)}</code></td>` +
      `<td>${esc(c.label)}</td>` +
      `<td>${esc(c.group || '')}</td>` +
      `<td>${esc(c.sg || '')}</td>` +
      `<td>${esc(c.ssg || '')}</td>` +
      `<td style="max-width:280px;font-size:11px;direction:ltr;text-align:left;word-break:break-all">${c.formula ? esc(c.formula_expr) : '—'}</td>` +
      `<td style="text-align:center">${esc(c.unit || '')}</td>` +
      `<td style="text-align:center">${esc(c.target || '')}</td>` +
      `<td style="text-align:center">${c.enabled === 0 ? '<span style="color:#e74c3c">✗</span>' : '<span style="color:#27ae60">✓</span>'}</td>` +
      `<td style="text-align:center">${c.static === 1 ? '<span style="color:#95a5a6">ثابت</span>' : ''}</td>` +
      `<td style="white-space:nowrap">${canEdit ? `<button class="btn btn-sm btn-secondary" data-click="icMove" data-args="${c.id},'up'">↑</button> <button class="btn btn-sm btn-secondary" data-click="icMove" data-args="${c.id},'down'">↓</button> <button class="btn btn-sm btn-info" data-click="icShowEditModal" data-args="${c.id}">تعديل</button> ${c.static === 1 ? '' : `<button class="btn btn-sm btn-danger" data-click="icDelete" data-args="${c.id}">حذف</button>`}` : ''}</td>` +
      '</tr>';
  }
  h += '</tbody></table></div>';
  document.getElementById('icTableWrap').innerHTML = h;
}
function icShowAddModal(cat) {
  if (!hasPerm('indicator_columns', 'edit')) { showToast('❌ ليس لديك صلاحية'); return; }
  openModal('إضافة عمود مؤشرات', `
    <div class="form-group"><label>الفئة</label>
      <select id="icFormCat" class="form-control"><option value="big" ${cat === 'big' ? 'selected' : ''}>تجميعي</option><option value="small" ${cat === 'small' ? 'selected' : ''}>تخزيني</option></select></div>
    <div class="form-group"><label>المفتاح (key)</label><input id="icFormKey" class="form-control" dir="ltr" placeholder="collect_total"></div>
    <div class="form-group"><label>التسمية</label><input id="icFormLabel" class="form-control"></div>
    <div class="form-group"><label>المجموعة</label><input id="icFormGroup" class="form-control"></div>
    <div class="form-group"><label>sg</label><input id="icFormSg" class="form-control"></div>
    <div class="form-group"><label>ssg</label><input id="icFormSsg" class="form-control"></div>
    <div class="form-group"><label><input type="checkbox" id="icFormFormula" data-change="icToggleFormulaFields"> عمود محسوب (معادلة)</label></div>
    <div id="icFormulaFields" style="display:none">
      <div class="form-group"><label>المعادلة (بالعربي أو بالإنجليزية)</label>
        <div style="position:relative">
          <input id="icFormExprAr" class="form-control" data-input="icLiveTranslateAr" autocomplete="off" placeholder="مثال: نسبة الفيروسات C من التجميع">
          <div id="icArSuggest" style="display:none;position:absolute;top:100%;right:0;left:0;z-index:99;background:var(--card-bg,#fff);border:1px solid var(--border,#ddd);border-radius:8px;box-shadow:0 6px 16px rgba(0,0,0,0.15);max-height:220px;overflow-y:auto;font-size:12px"></div>
        </div>
      </div>
      <div id="icArPreview" style="display:none;font-size:12px;padding:8px 10px;border-radius:6px;margin-bottom:10px"></div>
      <div class="form-group"><label>المعادلة المترجمة (readonly)</label><input id="icFormExpr" class="form-control" dir="ltr" placeholder="pct(a, b)"></div>
      <div class="form-group"><label>الوحدة</label><select id="icFormUnit" class="form-control"><option value="">عدد</option><option value="%">%</option></select></div>
      <div class="form-group"><label>البنش مارك (مثال: &lt;2 أو &lt;2%)</label><input id="icFormTarget" class="form-control" dir="ltr" placeholder="<2"></div>
    </div>
    <div style="font-size:11px;color:#7f8c8d;line-height:1.5">الدوال المتاحة: <code dir="ltr">pct(a,b)</code>, <code dir="ltr">round(x,n)</code>, <code dir="ltr">div(a,b)</code>, <code dir="ltr">sum(...)</code>, <code dir="ltr">min/max/abs/floor/ceil</code>, والعمليات <code dir="ltr">+ - * / %</code> مع مراجع الحقول مباشرة.</div>
  `, `<button class="btn btn-primary" data-click="icSaveAdd">حفظ</button>`);
}
async function icSaveAdd() {
  const payload = {
    category: document.getElementById('icFormCat').value,
    key: document.getElementById('icFormKey').value.trim(),
    label: document.getElementById('icFormLabel').value.trim(),
    group: document.getElementById('icFormGroup').value.trim(),
    sg: document.getElementById('icFormSg').value.trim(),
    ssg: document.getElementById('icFormSsg').value.trim(),
    formula: document.getElementById('icFormFormula').checked,
    formula_expr: document.getElementById('icFormExpr').value.trim(),
    unit: document.getElementById('icFormUnit').value,
    target: document.getElementById('icFormTarget').value.trim()
  };
  if (!payload.key || !payload.label) { showToast('❌ المفتاح والتسمية مطلوبان'); return; }
  try {
    const res = await api('POST', '/indicator-columns', payload);
    if (!res.ok) throw new Error(res.error || 'فشل الإضافة');
    closeModal();
    showToast('✅ تمت الإضافة');
    await window.refreshIndicatorColumns();
    renderIndicatorColumnsPage();
  } catch (e) { showToast('❌ ' + e.message); }
}
async function icShowEditModal(id) {
  if (!hasPerm('indicator_columns', 'edit')) { showToast('❌ ليس لديك صلاحية'); return; }
  const all = [...(window._icData?.big || []), ...(window._icData?.small || [])];
  const c = all.find(x => String(x.id) === String(id));
  if (!c) { showToast('❌ العمود غير موجود'); return; }
  openModal('تعديل العمود: ' + c.key, `
    <div class="form-group"><label>التسمية</label><input id="icEditLabel" class="form-control" value="${esc(c.label)}"></div>
    <div class="form-group"><label>المجموعة</label><input id="icEditGroup" class="form-control" value="${esc(c.group || '')}"></div>
    <div class="form-group"><label>sg</label><input id="icEditSg" class="form-control" value="${esc(c.sg || '')}"></div>
    <div class="form-group"><label>ssg</label><input id="icEditSsg" class="form-control" value="${esc(c.ssg || '')}"></div>
    <div class="form-group"><label><input type="checkbox" id="icEditFormula" ${c.formula ? 'checked' : ''} data-change="icToggleEditFormulaFields"> عمود محسوب</label></div>
    <div id="icEditFormulaFields" style="display:${c.formula ? '' : 'none'}">
      <div class="form-group"><label>المعادلة (بالعربي أو بالإنجليزية)</label>
        <div style="position:relative">
          <input id="icEditExprAr" class="form-control" data-input="icLiveTranslateAr" autocomplete="off" value="${esc(c.formula_expr || '')}" placeholder="مثال: نسبة الفيروسات C من التجميع">
          <div id="icArSuggest" style="display:none;position:absolute;top:100%;right:0;left:0;z-index:99;background:var(--card-bg,#fff);border:1px solid var(--border,#ddd);border-radius:8px;box-shadow:0 6px 16px rgba(0,0,0,0.15);max-height:220px;overflow-y:auto;font-size:12px"></div>
        </div>
      </div>
      <div id="icArPreview" style="display:none;font-size:12px;padding:8px 10px;border-radius:6px;margin-bottom:10px"></div>
      <div class="form-group"><label>المعادلة المترجمة (readonly)</label><input id="icEditExpr" class="form-control" dir="ltr" value="${esc(c.formula_expr || '')}"></div>
      <div class="form-group"><label>الوحدة</label><select id="icEditUnit" class="form-control"><option value="" ${!c.unit ? 'selected' : ''}>عدد</option><option value="%" ${c.unit === '%' ? 'selected' : ''}>%</option></select></div>
      <div class="form-group"><label>البنش مارك (مثال: &lt;2 أو &lt;2%)</label><input id="icEditTarget" class="form-control" dir="ltr" value="${esc(c.target || '')}"></div>
    </div>
    <div class="form-group"><label><input type="checkbox" id="icEditEnabled" ${c.enabled !== 0 ? 'checked' : ''}> مفعل</label></div>
  `, `<button class="btn btn-primary" data-click="icSaveEdit" data-args="${c.id}">حفظ</button>`);
}
async function icSaveEdit(id) {
  const payload = {
    label: document.getElementById('icEditLabel').value.trim(),
    group: document.getElementById('icEditGroup').value.trim(),
    sg: document.getElementById('icEditSg').value.trim(),
    ssg: document.getElementById('icEditSsg').value.trim(),
    formula: document.getElementById('icEditFormula').checked,
    formula_expr: document.getElementById('icEditExpr').value.trim(),
    unit: document.getElementById('icEditUnit').value,
    target: document.getElementById('icEditTarget').value.trim(),
    enabled: document.getElementById('icEditEnabled').checked ? 1 : 0
  };
  if (!payload.label) { showToast('❌ التسمية مطلوبة'); return; }
  try {
    const res = await api('PUT', '/indicator-columns/' + id, payload);
    if (!res.ok) throw new Error(res.error || 'فشل الحفظ');
    closeModal();
    showToast('✅ تم الحفظ');
    await window.refreshIndicatorColumns();
    renderIndicatorColumnsPage();
  } catch (e) { showToast('❌ ' + e.message); }
}
function icDelete(id) {
  showConfirmModal('هل تريد حذف هذا العمود؟', async () => {
    try {
      const res = await api('DELETE', '/indicator-columns/' + id);
      if (!res.ok) throw new Error(res.error || 'فشل الحذف');
      showToast('✅ تم الحذف');
      await window.refreshIndicatorColumns();
      renderIndicatorColumnsPage();
    } catch (e) { showToast('❌ ' + e.message); }
  });
}
async function icMove(id, dir) {
  const data = window._icData || {};
  const defs = _icTab === 'big' ? data.big : data.small;
  const idx = defs.findIndex(x => String(x.id) === String(id));
  if (idx < 0) return;
  const swap = dir === 'up' ? idx - 1 : idx + 1;
  if (swap < 0 || swap >= defs.length) return;
  const arr = defs.slice();
  const a = arr[idx], b = arr[swap];
  arr[idx] = b; arr[swap] = a;
  try {
    const res = await api('POST', '/indicator-columns/reorder', { category: _icTab, ids: arr.map(x => x.id) });
    if (!res.ok) throw new Error(res.error || 'فشل الترتيب');
    await window.refreshIndicatorColumns();
    renderIndicatorColumnsPage();
  } catch (e) { showToast('❌ ' + e.message); }
}

const MI_PICKER_BIG = 'mi_picker_big';
const MI_PICKER_SMALL = 'mi_picker_small';

function miRenderPickerHtml(colDefs, storageKey) {
  const groups = [];
  for (const c of colDefs) {
    if (c.key === 'governorate' || c.key === 'hospital_name') continue;
    const g = c.group || '';
    let grp = groups.find(x => x.name === g);
    if (!grp) { grp = { name: g, items: [] }; groups.push(grp); }
    grp.items.push(c);
  }
  const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
  const checkedKeys = stored || groups.flatMap(g => g.items.map(c => c.key));
  let h = '';
  for (const grp of groups) {
    const grpColor = grp.name.includes('الوارد') ? '#2e7d32' : grp.name.includes('المنصرف') ? '#6a1b9a' : grp.name.includes('الفيروس') || grp.name.includes('نسب') ? '#c62828' : grp.name.includes('الإعدام') || grp.name.includes('الصرف') ? '#e65100' : grp.name.includes('الأطفال') ? '#ad1457' : grp.name.includes('الفصائل') || grp.name.includes('التوافق') || grp.name.includes('عينات') ? '#1565c0' : grp.name.includes('الجمع') || grp.name.includes('الفحص') ? '#1565c0' : '#455a64';
    h += `<div style="width:100%;font-size:11px;font-weight:700;color:${grpColor};margin:6px 0 3px;border-bottom:1px solid var(--border);padding-bottom:2px">${esc(grp.name)}</div>`;
    h += '<div style="display:flex;flex-wrap:wrap;gap:4px">';
    for (const c of grp.items) {
      const chk = checkedKeys.includes(c.key) ? 'checked' : '';
      h += `<label style="display:inline-flex;align-items:center;gap:4px;padding:3px 7px;background:var(--card-bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:11px;white-space:nowrap;transition:all .15s"><input type="checkbox" class="miColChk" data-storage="${storageKey}" value="${c.key}" ${chk} data-change="miOnPickerChange" style="accent-color:${grpColor};width:13px;height:13px">${esc(c.label)}</label>`;
    }
    h += '</div>';
  }
  return h;
}
function miSavePickerState(storageKey) {
  const els = document.querySelectorAll(`.miColChk[data-storage="${storageKey}"]`);
  const checked = Array.from(els).filter(e => e.checked).map(e => e.value);
  localStorage.setItem(storageKey, JSON.stringify(checked));
}
function miGetFilteredCols(colDefs, storageKey) {
  const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
  if (!stored) return colDefs;
  const staticCols = colDefs.filter(c => c.key === 'governorate' || c.key === 'hospital_name');
  const dynamicCols = colDefs.filter(c => c.key !== 'governorate' && c.key !== 'hospital_name');
  return [...staticCols, ...dynamicCols.filter(c => stored.includes(c.key))];
}
function miPickerSelectAll() {
  document.querySelectorAll('.miColChk').forEach(c => c.checked = true);
  [MI_PICKER_BIG, MI_PICKER_SMALL].forEach(k => miSavePickerState(k));
}
function miPickerClearAll() {
  document.querySelectorAll('.miColChk').forEach(c => c.checked = false);
  [MI_PICKER_BIG, MI_PICKER_SMALL].forEach(k => miSavePickerState(k));
}
function miTogglePicker(bodyId, chevronId) {
  const body = document.getElementById(bodyId);
  const chevron = document.getElementById(chevronId);
  if (!body) return;
  const show = body.style.display === 'none';
  body.style.display = show ? '' : 'none';
  if (chevron) chevron.style.transform = show ? 'rotate(180deg)' : '';
}
function miOnPickerChange(el) {
  const storageKey = el?.dataset?.storage || MI_PICKER_BIG;
  miSavePickerState(storageKey);
  const isCompare = document.getElementById('indCompareMode')?.checked;
  if (isCompare) {
    renderMonthlyIndicators();
  } else {
    const wrap = document.getElementById('indTableWrap');
    if (!wrap) return;
    const hospitals = window._monIndHospitals || [];
    const canEdit = hasPerm('monthly_indicators', 'edit');
    const presetType = document.getElementById('indTypeFilter')?.value || '';
    const filtMonth = document.getElementById('indMonthFilter')?.value;
    const params = new URLSearchParams({ year: document.getElementById('indYearFilter')?.value || '' });
    if (filtMonth) params.set('month', filtMonth);
    const hId = document.getElementById('indHospitalFilter')?.value;
    if (hId) params.set('hospitalId', hId);
    api('GET', '/monthly-indicators?' + params.toString()).then(data => {
      renderIndicatorsTable(hospitals, data, canEdit, presetType);
    }).catch(() => {});
  }
}

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
  let hasSubSub = false;
  groups.forEach(g => { g.subs.forEach(cols => { if (cols.some(c => c.ssg)) hasSubSub = true; }); });
  const hasSub = groups.some(g => g.subs.size > 0);
  const rs = hasSubSub ? 4 : hasSub ? 3 : 2;
  let r1 = '<tr class="grp1">';
  let r2 = '<tr class="grp2">';
  let r3 = '<tr class="grp3">';
  let r4 = hasSubSub ? '<tr class="grp4">' : '';
  groups.forEach(g => {
    if (!g.label) {
      g.cols.forEach(c => { r1 += `<th rowspan="${rs}">${c.label}</th>`; });
    } else if (g.subs.size > 0) {
      r1 += `<th colspan="${g.cols.length}" class="grp-parent" data-group="${g.label}">${g.label}</th>`;
      let colIdx = 0;
      while (colIdx < g.cols.length) {
        const c = g.cols[colIdx];
        if (c.sg && g.subs.has(c.sg)) {
          const subCols = g.subs.get(c.sg);
          r2 += `<th colspan="${subCols.length}" class="grp-child" data-sg="${c.sg}">${c.sg}</th>`;
          const ssgMap = new Map();
          subCols.forEach(sc => {
            if (sc.ssg) {
              if (!ssgMap.has(sc.ssg)) ssgMap.set(sc.ssg, []);
              ssgMap.get(sc.ssg).push(sc);
            }
          });
          if (ssgMap.size > 0) {
            let subIdx = 0;
            while (subIdx < subCols.length) {
              const sc = subCols[subIdx];
              if (sc.ssg && ssgMap.has(sc.ssg)) {
                const ssgCols = ssgMap.get(sc.ssg);
                r3 += `<th colspan="${ssgCols.length}" class="grp-child" data-ssg="${sc.ssg}">${sc.ssg}</th>`;
                ssgCols.forEach(ssc => { r4 += `<th class="grp-detail">${ssc.label}</th>`; });
                subIdx += ssgCols.length;
              } else {
                r3 += `<th rowspan="2" class="grp-child">${sc.label}</th>`;
                subIdx++;
              }
            }
          } else {
            subCols.forEach(sc => { r3 += `<th${hasSubSub ? ' rowspan="2"' : ''} class="grp-detail">${sc.label}</th>`; });
          }
          colIdx += subCols.length;
        } else {
          r2 += `<th rowspan="${rs}" class="grp-child">${c.label}</th>`;
          colIdx++;
        }
      }
    } else if (g.cols.length > 1) {
      r1 += `<th colspan="${g.cols.length}" class="grp-parent" data-group="${g.label}">${g.label}</th>`;
      g.cols.forEach(c => { r2 += `<th rowspan="${hasSubSub ? 3 : hasSub ? 2 : 1}" class="grp-child">${c.label}</th>`; });
    } else {
      r1 += `<th rowspan="${rs}" data-group="${g.label}">${g.label}</th>`;
    }
  });
  return r1 + '</tr>' + r2 + '</tr>' + r3 + '</tr>' + (r4 ? r4 + '</tr>' : '');
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
    const _hasSSGMain = colDefs.some(c => c.ssg);
    const _rsMain = _hasSSGMain ? 4 : 3;
    headerHtml = headerHtml.replace(/(rowspan="[234]">بنك الدم<\/th>)/, `$1<th rowspan="${_rsMain}" style="min-width:44px;font-size:11px;color:#5A7A9A">الشهر</th><th rowspan="${_rsMain}" style="min-width:55px;font-size:11px;color:#5A7A9A">المدخل</th>`);
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
    const filteredBig = miGetFilteredCols(BIG_COL_DEFS, MI_PICKER_BIG);
    wrap.innerHTML = renderTable(filteredBig, 'مؤشرات أداء البنوك التجميعية', computeBigFormulas, 'big');
  } else if (tableType === 'تخزيني') {
    const filteredSmall = miGetFilteredCols(SMALL_COL_DEFS, MI_PICKER_SMALL);
    wrap.innerHTML = renderTable(filteredSmall, 'مؤشرات أداء البنوك التخزينية', computeSmallFormulas, 'child');
  } else {
    const filteredBig = miGetFilteredCols(BIG_COL_DEFS, MI_PICKER_BIG);
    const filteredSmall = miGetFilteredCols(SMALL_COL_DEFS, MI_PICKER_SMALL);
    wrap.innerHTML = renderTable(filteredBig, 'التجميعي - مؤشرات أداء البنوك التجميعية', computeBigFormulas, 'big') +
      renderTable(filteredSmall, 'التخزيني - مؤشرات أداء البنوك التخزينية', computeSmallFormulas, 'child');
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
  try {
  showToast('جاري التجهيز...');
  api('GET', '/equipment').then(function(eq) {
    if (typeof ExcelJS === 'undefined') { showToast('❌ مكتبة ExcelJS غير محمّلة — تأكد من اتصال الإنترنت ثم أعد تحميل الصفحة','error'); return; }
    const types = eq.types || [], hospitals = eq.hospitals || [];
    const wb = new ExcelJS.Workbook(); wb.creator = 'نظام بنك الدم'; wb.created = new Date();
    const ws = wb.addWorksheet('الأجهزة', { views:[{state:'frozen',ySplit:2,xSplit:1}] });
    const mc = 2 + types.length * 4;
    const sr = _xlsxTitleRow(ws, 1, 'أجهزة بنوك الدم', '', mc);
    const hRow = ws.getRow(sr); hRow.height = 22;
    ws.getCell(sr,1).value = 'المحافظة'; ws.getCell(sr,2).value = 'اسم بنك الدم';
    for (let ci = 1; ci <= 2; ci++) {
      const c = ws.getCell(sr, ci); c.font = {bold:true,color:{argb:'FFFFFFFF'},size:10};
      c.fill = {type:'pattern',pattern:'solid',fgColor:{argb:'FF2C3E50'}}; c.alignment = {horizontal:'center',vertical:'middle'}; c.border = _XBN;
    }
    let cIdx = 3;
    types.forEach(function(t) {
      ws.mergeCells(sr, cIdx, sr, cIdx + 3);
      const tc = ws.getCell(sr, cIdx); tc.value = t.name;
      tc.font = {bold:true,color:{argb:'FFFFFFFF'},size:10};
      tc.fill = {type:'pattern',pattern:'solid',fgColor:{argb:'FF2C3E50'}}; tc.alignment = {horizontal:'center',vertical:'middle'}; tc.border = _XBN;
      cIdx += 4;
    });
    const r2 = ws.getRow(sr + 1); r2.height = 20;
    ws.getCell(sr+1,1).value = ''; ws.getCell(sr+1,2).value = '';
    ws.getCell(sr+1,1).font = {bold:true,color:{argb:'FFFFFFFF'},size:9};
    ws.getCell(sr+1,1).fill = {type:'pattern',pattern:'solid',fgColor:{argb:'FF34495E'}}; ws.getCell(sr+1,1).border = _XBN;
    ws.getCell(sr+1,2).font = {bold:true,color:{argb:'FFFFFFFF'},size:9};
    ws.getCell(sr+1,2).fill = {type:'pattern',pattern:'solid',fgColor:{argb:'FF34495E'}}; ws.getCell(sr+1,2).border = _XBN;
    cIdx = 3;
    types.forEach(function(t) {
      ['عدد','حالة','ماركة','سعة'].forEach(function(h) {
        const c = ws.getCell(sr+1, cIdx); c.value = h;
        c.font = {bold:true,color:{argb:'FFFFFFFF'},size:9};
        c.fill = {type:'pattern',pattern:'solid',fgColor:{argb:'FF34495E'}}; c.alignment = {horizontal:'center',vertical:'middle'}; c.border = _XBN;
        cIdx++;
      });
    });
    let dr = sr + 2;
    const sorted = hospitals.slice().sort(function(a,b) {
      return (a.governorate || '').localeCompare(b.governorate || '', 'ar') || (a.name || '').localeCompare(b.name || '', 'ar');
    });
    sorted.forEach(function(h) {
      const row = ws.getRow(dr); row.height = 18;
      ws.getCell(dr,1).value = h.governorate || '';
      ws.getCell(dr,2).value = h.name || '';
      ws.getCell(dr,1).font = {size:9}; ws.getCell(dr,1).alignment = {horizontal:'right',vertical:'middle'}; ws.getCell(dr,1).border = _XBN;
      ws.getCell(dr,2).font = {size:9}; ws.getCell(dr,2).alignment = {horizontal:'right',vertical:'middle'}; ws.getCell(dr,2).border = _XBN;
      cIdx = 3;
      types.forEach(function(t) {
        const eqEntry = (h.equipment || {})[t.id];
        ['count','status','brand','capacity'].forEach(function(f) {
          let val = '';
          if (eqEntry) {
            if (Array.isArray(eqEntry)) val = eqEntry.map(function(e){return e[f]||'';}).filter(Boolean).join(', ');
            else if (eqEntry && typeof eqEntry === 'object') val = eqEntry[f] != null ? eqEntry[f] : '';
          }
          const c = ws.getCell(dr, cIdx); c.value = val;
          c.font = {size:9}; c.alignment = {horizontal:'center',vertical:'middle'}; c.border = _XBN;
          if (dr % 2 === 0) c.fill = {type:'pattern',pattern:'solid',fgColor:{argb:'FFF8F9FA'}};
          cIdx++;
        });
      });
      dr++;
    });
    ws.getColumn(1).width = 16; ws.getColumn(2).width = 24;
    for (let i = 3; i <= mc; i++) ws.getColumn(i).width = 12;
    _xlsxFooter(ws, dr, mc);
    _xlsxDl(wb, 'اجهزة_بنوك_الدم.xlsx');
  }).catch(function(e) { console.error('[eqExportXlsx]', e); showToast('❌ خطأ في التصدير: ' + e.message, 'error'); });
  } catch(e) { console.error('[eqExportXlsx]', e); showToast('❌ خطأ في التصدير: ' + e.message, 'error'); }
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
      '<button class="pdf" onclick="window.print();">تحميل PDF</button>' +
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
  try {
  const table = document.querySelector('#rdnSummaryTable .data-table');
  if (!table) { showToast('⚠ لا توجد بيانات للتصدير'); return; }
  const sel = document.getElementById('rdnOccasionSelect');
  const title = sel && sel.selectedOptions[0] ? sel.selectedOptions[0].textContent : 'جاهزية بنوك الدم';
  const res = _xlsxTbl(table, { headerBg:'FF2C3E50', skipActions:true, startRow:3 });
  if (!res) return;
  _xlsxTitleRow(res.ws, 1, 'بيان بجاهزية بنوك الدم', title, res.mc);
  _xlsxFooter(res.ws, res.r, res.mc);
  _xlsxDl(res.wb, 'جاهزية_بنوك_الدم.xlsx');
  } catch(e) { console.error('[rdnExportXlsx]', e); showToast('❌ خطأ في التصدير: ' + e.message, 'error'); }
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
      <div style="background:var(--card-bg);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:20px">
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

// ============== Indicator Analysis (تحليل مؤشرات الأداء) ==============
const _iaPeriodMonths = {
  yearly: [1,2,3,4,5,6,7,8,9,10,11,12],
  h1: [1,2,3,4,5,6], h2: [7,8,9,10,11,12],
  q1: [1,2,3], q2: [4,5,6], q3: [7,8,9], q4: [10,11,12]
};
const _iaPeriodLabels = {
  yearly: 'سنوي', h1: 'النصف الأول', h2: 'النصف الثاني',
  q1: 'الربع الأول', q2: 'الربع الثاني', q3: 'الربع الثالث', q4: 'الربع الرابع', monthly: 'شهري'
};
function _iaCalcBig(d) {
  const ct = d.collect_total || 0, ts = d.tested || 0;
  const rf = (d.refused_fatty || 0) + (d.refused_icteric || 0);
  const un = d.uncompleted || 0, dt = d.donation_therapeutic || 0;
  const unscreened = rf + un + dt;
  const vt = (d.virology_c||0)+(d.virology_b||0)+(d.virology_i||0)+(d.virology_dollar||0);
  const neg = ts - vt;
  return { ct, ts, rf, un, dt, unscreened, neg, vt, hc: d.virology_c||0, hb: d.virology_b||0, hi: d.virology_i||0, hs: d.virology_dollar||0 };
}
function _iaCalcSmall(d) {
  const inc = (d.inc_collected||0)+(d.inc_regional||0);
  const compat = d.compatibility||0, out = d.out_blood||0;
  const vt = (d.virology_c||0)+(d.virology_b||0)+(d.virology_i||0)+(d.virology_dollar||0);
  return { inc, compat, out, vt, hc: d.virology_c||0, hb: d.virology_b||0, hi: d.virology_i||0, hs: d.virology_dollar||0,
    exp: d.disp_exp_blood||0, open: d.disp_open||0, ret: d.disp_returned||0, react: d.disp_reaction||0, other: d.disp_other||0 };
}
function _iaPct(num, den) { return den ? ((num / den) * 100).toFixed(2) : '0.00'; }
function _iaFmt(v) { if (v === 0 || v === null || v === undefined) return '0'; if (typeof v === 'number') return v % 1 !== 0 ? v.toFixed(2) : String(v); return String(v); }
let _IA_FORMULA_KEYS = new Set();
function _iaRebuildFormulaKeys() {
  _IA_FORMULA_KEYS = new Set([...BIG_COL_DEFS, ...SMALL_COL_DEFS].filter(c => c.formula).map(c => c.key));
}
function _iaIsFormula(key) { return _IA_FORMULA_KEYS.has(key); }
function _iaRecomputeFormulas(rawData, typeKey) {
  if (!rawData) return {};
  if (typeKey === 'big') return computeBigFormulas(rawData);
  if (typeKey === 'small') return computeSmallFormulas(rawData);
  return {};
}
function _iaMergeWithFormulas(rawData, typeKey) {
  if (!rawData || typeKey === 'disp') return rawData || {};
  const f = _iaRecomputeFormulas(rawData, typeKey);
  return Object.assign({}, rawData, f);
}

function _iaFieldsFor(cat) {
  const src = cat === 'big' ? BIG_COL_DEFS : SMALL_COL_DEFS;
  return src.filter(c => c.key !== 'governorate' && c.key !== 'hospital_name').map(c => {
    const o = { g: c.group || '', key: c.key, label: c.label };
    if (c.sg) o.sg = c.sg;
    if (c.ssg) o.ssg = c.ssg;
    return o;
  });
}
let _iaBigFields = _iaFieldsFor('big');
const _iaBigFields_legacy = [
  // ===== التجميع =====
  { g:'التجميع', key:'collect_total', label:'التجميع' },

  // ===== إجمالي الوارد =====
  { g:'إجمالي الوارد', key:'inc_blood', label:'دم', sg:'دم' },
  { g:'إجمالي الوارد', key:'inc_plasma', label:'بلازما', sg:'بلازما' },
  { g:'إجمالي الوارد', key:'inc_sdp', label:'SDP', sg:'صفائح' },
  { g:'إجمالي الوارد', key:'inc_rdp', label:'RDP', sg:'صفائح' },

  // ===== إجمالي المنصرف =====
  { g:'إجمالي المنصرف', key:'out_blood_int', label:'داخلي', sg:'دم' },
  { g:'إجمالي المنصرف', key:'out_blood_branch', label:'فرع', sg:'دم' },
  { g:'إجمالي المنصرف', key:'out_blood_auth', label:'هيئة', sg:'دم' },
  { g:'إجمالي المنصرف', key:'out_blood_ext', label:'خارجي', sg:'دم' },
  { g:'إجمالي المنصرف', key:'out_plasma_int', label:'داخلي', sg:'بلازما' },
  { g:'إجمالي المنصرف', key:'out_plasma_ext', label:'خارجي', sg:'بلازما' },
  { g:'إجمالي المنصرف', key:'out_sdp', label:'SDP', sg:'صفائح' },
  { g:'إجمالي المنصرف', key:'out_rdp', label:'RDP', sg:'صفائح' },

  // ===== الفصائل والتوافق =====
  { g:'الفصائل والتوافق', key:'blood_groups', label:'الفصائل' },
  { g:'الفصائل والتوافق', key:'compatibility', label:'التوافق' },
  { g:'الفصائل والتوافق', key:'ct', label:'C/T' },

  // ===== عينات غير مفحوصة =====
  { g:'عينات غير مفحوصة', key:'donation_therapeutic', label:'تبرع علاجي' },
  { g:'عينات غير مفحوصة', key:'uncompleted', label:'لم يكتمل' },
  { g:'عينات غير مفحوصة', key:'refused_fatty', label:'دهون', sg:'عينات مرفوضة' },
  { g:'عينات غير مفحوصة', key:'refused_icteric', label:'Icteric', sg:'عينات مرفوضة' },

  // ===== الإعدامات =====
  { g:'الإعدامات', key:'disp_exp_blood', label:'دم', sg:'انتهاء الصلاحيه' },
  { g:'الإعدامات', key:'disp_exp_plasma', label:'بلازما', sg:'انتهاء الصلاحيه' },
  { g:'الإعدامات', key:'disp_exp_sdp', label:'SDP', sg:'انتهاء الصلاحيه', ssg:'صفائح' },
  { g:'الإعدامات', key:'disp_exp_rdp', label:'RDP', sg:'انتهاء الصلاحيه', ssg:'صفائح' },
  { g:'الإعدامات', key:'disp_returned', label:'مرتجع' },
  { g:'الإعدامات', key:'disp_reaction', label:'تفاعل' },
  { g:'الإعدامات', key:'disp_open', label:'نظام مفتوح' },
  { g:'الإعدامات', key:'disp_other', label:'أخرى' },
  { g:'الإعدامات', key:'virology_c', label:'C', sg:'الفيروسات' },
  { g:'الإعدامات', key:'virology_b', label:'B', sg:'الفيروسات' },
  { g:'الإعدامات', key:'virology_i', label:'I', sg:'الفيروسات' },
  { g:'الإعدامات', key:'virology_dollar', label:'$', sg:'الفيروسات' },
  { g:'الإعدامات', key:'virology_total', label:'إجمالي', sg:'الفيروسات' },

  // ===== تحليل نسب المؤشرات =====
  { g:'تحليل نسب المؤشرات', key:'tested', label:'المفحوص' },
  { g:'تحليل نسب المؤشرات', key:'ratio_uncompleted', label:'لم يكتمل' },
  { g:'تحليل نسب المؤشرات', key:'ratio_refused', label:'مرفوضه' },
  { g:'تحليل نسب المؤشرات', key:'ratio_c', label:'C', sg:'الفيروسات' },
  { g:'تحليل نسب المؤشرات', key:'ratio_b', label:'B', sg:'الفيروسات' },
  { g:'تحليل نسب المؤشرات', key:'ratio_i', label:'I', sg:'الفيروسات' },
  { g:'تحليل نسب المؤشرات', key:'ratio_dollar', label:'$', sg:'الفيروسات' },
  { g:'تحليل نسب المؤشرات', key:'ratio_exp', label:'Exp' },
  { g:'تحليل نسب المؤشرات', key:'ratio_returned', label:'مرتجع' },
  { g:'تحليل نسب المؤشرات', key:'ratio_reaction', label:'تفاعل' },
  { g:'تحليل نسب المؤشرات', key:'ratio_open', label:'مفتوح' },
  { g:'تحليل نسب المؤشرات', key:'ratio_other', label:'أخرى' },

  // ===== مؤشرات وحدات دم الأطفال =====
  { g:'مؤشرات وحدات دم الأطفال', key:'child_inc_collected', label:'تجميعي', sg:'وارد الدم' },
  { g:'مؤشرات وحدات دم الأطفال', key:'child_inc_regional', label:'إقليمي', sg:'وارد الدم' },
  { g:'مؤشرات وحدات دم الأطفال', key:'child_out_blood', label:'منصرف الدم' },
  { g:'مؤشرات وحدات دم الأطفال', key:'child_blood_groups', label:'الفصائل' },
  { g:'مؤشرات وحدات دم الأطفال', key:'child_compatibility', label:'التوافق' },
  { g:'مؤشرات وحدات دم الأطفال', key:'child_ct', label:'C/T' },
  { g:'مؤشرات وحدات دم الأطفال', key:'child_disp_exp', label:'EXP', sg:'اعدامات الدم' },
  { g:'مؤشرات وحدات دم الأطفال', key:'child_disp_returned', label:'مرتجع', sg:'اعدامات الدم' },
  { g:'مؤشرات وحدات دم الأطفال', key:'child_disp_reaction', label:'تفاعل', sg:'اعدامات الدم' },
  { g:'مؤشرات وحدات دم الأطفال', key:'child_disp_open', label:'نظام مفتوح', sg:'اعدامات الدم' },
  { g:'مؤشرات وحدات دم الأطفال', key:'child_disp_other', label:'أخرى', sg:'اعدامات الدم' },

  // ===== النسب المئوية للاعدام - أطفال =====
  { g:'النسب المئوية للاعدام - أطفال', key:'child_pct_exp', label:'Exp الدم' },
  { g:'النسب المئوية للاعدام - أطفال', key:'child_pct_returned', label:'مرتجع' },
  { g:'النسب المئوية للاعدام - أطفال', key:'child_pct_reaction', label:'تفاعل' },
  { g:'النسب المئوية للاعدام - أطفال', key:'child_pct_open', label:'نظام مفتوح' },
  { g:'النسب المئوية للاعدام - أطفال', key:'child_pct_other', label:'أخرى' }
];
let _iaSmallFields = _iaFieldsFor('small');
const _iaSmallFields_legacy = [
  // ===== إجمالي الوارد =====
  { g:'إجمالي الوارد', key:'inc_collected', label:'تجميعي', sg:'دم' },
  { g:'إجمالي الوارد', key:'inc_regional', label:'إقليمي', sg:'دم' },
  { g:'إجمالي الوارد', key:'inc_plasma', label:'بلازما', sg:'بلازما' },
  { g:'إجمالي الوارد', key:'inc_sdp', label:'SDP', sg:'صفائح' },
  { g:'إجمالي الوارد', key:'inc_rdp', label:'RDP', sg:'صفائح' },

  // ===== إجمالي المنصرف =====
  { g:'إجمالي المنصرف', key:'out_blood', label:'دم', sg:'دم' },
  { g:'إجمالي المنصرف', key:'out_plasma', label:'بلازما', sg:'بلازما' },
  { g:'إجمالي المنصرف', key:'out_sdp', label:'SDP', sg:'صفائح' },
  { g:'إجمالي المنصرف', key:'out_rdp', label:'RDP', sg:'صفائح' },

  // ===== الفصائل والتوافق =====
  { g:'الفصائل والتوافق', key:'blood_groups', label:'الفصائل' },
  { g:'الفصائل والتوافق', key:'compatibility', label:'التوافق' },
  { g:'الفصائل والتوافق', key:'ct', label:'C/T' },

  // ===== الإعدامات =====
  { g:'الإعدامات', key:'disp_exp_blood', label:'دم', sg:'انتهاء الصلاحيه' },
  { g:'الإعدامات', key:'disp_exp_plasma', label:'بلازما', sg:'انتهاء الصلاحيه' },
  { g:'الإعدامات', key:'disp_exp_sdp', label:'SDP', sg:'انتهاء الصلاحيه', ssg:'صفائح' },
  { g:'الإعدامات', key:'disp_exp_rdp', label:'RDP', sg:'انتهاء الصلاحيه', ssg:'صفائح' },
  { g:'الإعدامات', key:'disp_returned', label:'مرتجع' },
  { g:'الإعدامات', key:'disp_reaction', label:'تفاعل' },
  { g:'الإعدامات', key:'disp_open', label:'نظام مفتوح' },
  { g:'الإعدامات', key:'disp_other', label:'أخرى' },

  // ===== النسب المئوية للاعدام =====
  { g:'النسب المئوية للاعدام', key:'pct_exp', label:'Exp الدم' },
  { g:'النسب المئوية للاعدام', key:'pct_returned', label:'مرتجع' },
  { g:'النسب المئوية للاعدام', key:'pct_reaction', label:'تفاعل' },
  { g:'النسب المئوية للاعدام', key:'pct_open', label:'نظام مفتوح' },
  { g:'النسب المئوية للاعدام', key:'pct_other', label:'أخرى' },

  // ===== مؤشرات وحدات دم الأطفال =====
  { g:'مؤشرات وحدات دم الأطفال', key:'child_inc_collected', label:'تجميعي', sg:'وارد الدم' },
  { g:'مؤشرات وحدات دم الأطفال', key:'child_inc_regional', label:'إقليمي', sg:'وارد الدم' },
  { g:'مؤشرات وحدات دم الأطفال', key:'child_out_blood', label:'منصرف الدم' },
  { g:'مؤشرات وحدات دم الأطفال', key:'child_blood_groups', label:'الفصائل' },
  { g:'مؤشرات وحدات دم الأطفال', key:'child_compatibility', label:'التوافق' },
  { g:'مؤشرات وحدات دم الأطفال', key:'child_ct', label:'C/T' },
  { g:'مؤشرات وحدات دم الأطفال', key:'child_disp_exp', label:'EXP', sg:'اعدامات الدم' },
  { g:'مؤشرات وحدات دم الأطفال', key:'child_disp_returned', label:'مرتجع', sg:'اعدامات الدم' },
  { g:'مؤشرات وحدات دم الأطفال', key:'child_disp_reaction', label:'تفاعل', sg:'اعدامات الدم' },
  { g:'مؤشرات وحدات دم الأطفال', key:'child_disp_open', label:'نظام مفتوح', sg:'اعدامات الدم' },
  { g:'مؤشرات وحدات دم الأطفال', key:'child_disp_other', label:'أخرى', sg:'اعدامات الدم' },

  // ===== النسب المئوية للاعدام - أطفال =====
  { g:'النسب المئوية للاعدام - أطفال', key:'child_pct_exp', label:'Exp الدم' },
  { g:'النسب المئوية للاعدام - أطفال', key:'child_pct_returned', label:'مرتجع' },
  { g:'النسب المئوية للاعدام - أطفال', key:'child_pct_reaction', label:'تفاعل' },
  { g:'النسب المئوية للاعدام - أطفال', key:'child_pct_open', label:'نظام مفتوح' },
  { g:'النسب المئوية للاعدام - أطفال', key:'child_pct_other', label:'أخرى' }
];
const _iaDispFields = [
  { key:'A+', label:'A+' }, { key:'A-', label:'A-' },
  { key:'B+', label:'B+' }, { key:'B-', label:'B-' },
  { key:'O+', label:'O+' }, { key:'O-', label:'O-' },
  { key:'AB+', label:'AB+' }, { key:'AB-', label:'AB-' },
];
function _iaRenderFieldCheckboxes(fields, cls, accentColor) {
  const groups = [];
  for (const f of fields) {
    const g = f.g || '';
    let grp = groups.find(x => x.name === g);
    if (!grp) { grp = { name: g, items: [], sgMap: new Map() }; groups.push(grp); }
    grp.items.push(f);
    if (f.sg) {
      if (!grp.sgMap.has(f.sg)) grp.sgMap.set(f.sg, []);
      grp.sgMap.get(f.sg).push(f);
    }
  }
  const cb = `accent-color:${accentColor};width:12px;height:12px;margin:0;vertical-align:middle`;
  const chip = 'display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border:1px solid var(--border);border-radius:4px;cursor:pointer;font-size:10px;white-space:nowrap;background:var(--card-bg)';
  let h = '<div style="columns:3;column-gap:8px">';
  for (const grp of groups) {
    if (!grp.name) continue;
    const hasSg = grp.sgMap.size > 0;
    h += `<div style="break-inside:avoid;background:var(--card-bg);border:1px solid var(--border);border-radius:6px;margin-bottom:8px;overflow:hidden">`;
    h += `<div style="background:${accentColor};color:#fff;font-size:11px;font-weight:700;padding:4px 8px;display:flex;justify-content:space-between;align-items:center"><span>${esc(grp.name)}</span><span style="opacity:.7;font-size:9px">${grp.items.length}</span></div>`;
    h += '<div style="padding:6px 8px">';
    if (hasSg) {
      const standalone = grp.items.filter(f => !f.sg);
      if (standalone.length) {
        h += '<div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:4px">';
        for (const f of standalone) {
          h += `<label style="${chip}"><input type="checkbox" class="${cls}" value="${f.key}" checked style="${cb}"> ${esc(f.label)}</label>`;
        }
        h += '</div>';
      }
      const seen = new Set();
      for (const f of grp.items) {
        if (f.sg && !seen.has(f.sg)) {
          seen.add(f.sg);
          const sgItems = grp.sgMap.get(f.sg);
          h += `<div style="background:${accentColor}10;border:1px solid ${accentColor}20;border-radius:4px;padding:4px 6px;margin-bottom:3px">`;
          h += `<div style="font-size:9px;font-weight:600;color:${accentColor};margin-bottom:3px;text-transform:uppercase;letter-spacing:.5px">${esc(f.sg)}</div>`;
          h += '<div style="display:flex;flex-wrap:wrap;gap:3px">';
          for (const sf of sgItems) {
            h += `<label style="${chip}"><input type="checkbox" class="${cls}" value="${sf.key}" checked style="${cb}"> ${esc(sf.label)}</label>`;
          }
          h += '</div></div>';
        }
      }
    } else {
      h += '<div style="display:flex;flex-wrap:wrap;gap:3px">';
      for (const f of grp.items) {
        h += `<label style="${chip}"><input type="checkbox" class="${cls}" value="${f.key}" checked style="${cb}"> ${esc(f.label)}</label>`;
      }
      h += '</div>';
    }
    h += '</div></div>';
  }
  return h + '</div>';
}

function _iaGetCheckedCols(section) {
  const cls = section === 'big' ? '.iaBigColChk' : section === 'small' ? '.iaSmallColChk' : '.iaDispColChk';
  const els = document.querySelectorAll(cls);
  if (!els.length) return [];
  return Array.from(els).filter(e => e.checked).map(e => e.value);
}
function _iaGetAllCheckedCols() {
  return [..._iaGetCheckedCols('big'), ..._iaGetCheckedCols('small'), ..._iaGetCheckedCols('disp')];
}
function iaPickerSelectAll() {
  document.querySelectorAll('.iaBigColChk,.iaSmallColChk,.iaDispColChk').forEach(c => c.checked = true);
  loadIndicatorAnalysis();
}
function iaPickerClearAll() {
  document.querySelectorAll('.iaBigColChk,.iaSmallColChk,.iaDispColChk').forEach(c => c.checked = false);
  loadIndicatorAnalysis();
}
function iaPickerChanged() { loadIndicatorAnalysis(); }
function toggleIaPicker() {
  const body = document.getElementById('iaPickerBody');
  const chevron = document.getElementById('iaPickerChevron');
  if (!body) return;
  const show = body.style.display === 'none';
  body.style.display = show ? '' : 'none';
  if (chevron) chevron.style.transform = show ? 'rotate(180deg)' : '';
}
function _iaSumRows(data, cols) {
  const s = {};
  for (const c of cols) s[c.key] = 0;
  for (const h of data) { const d = h.data||{}; for (const c of cols) s[c.key] += (Number(d[c.key])||0); }
  return s;
}
function _iaDeltaHtml(v1, v2) {
  if (!v1 && !v2) return '<td style="text-align:center;color:#999">-</td>';
  const d = v1 ? ((v2 - v1) / v1 * 100) : null;
  const color = d === null ? '#999' : d > 0 ? '#c62828' : d < 0 ? '#2e7d32' : '#666';
  const sign = d > 0 ? '+' : '';
  return `<td style="text-align:center;color:${color};font-weight:600;font-size:12px">${d !== null ? sign + d.toFixed(1) + '%' : '-'}</td>`;
}
function _iaBuildSummaryTable(p1Data, p2Data, pL1, pL2, allGovs, cols, typeKey) {
  const showGrandTotal = document.getElementById('iaShowGrand')?.checked;
  const showGovTotal = document.getElementById('iaShowGov')?.checked;
  const showHospDetail = document.getElementById('iaShowHosp')?.checked;
  if (!showGrandTotal && !showGovTotal && !showHospDetail) return '';
  if (!cols.length) return '';
  const G = _iaBuildGovGroups(p1Data, p2Data, allGovs);
  const grpColors = { 'التجميع':'#c5cae9', 'إجمالي الوارد':'#c8e6c9', 'إجمالي المنصرف':'#e1bee7', 'الفصائل والتوافق':'#bbdefb', 'عينات غير مفحوصة':'#ffcdd2', 'الإعدامات':'#ffe0b2', 'تحليل نسب المؤشرات':'#b2dfdb', 'مؤشرات وحدات دم الأطفال':'#f8bbd0', 'النسب المئوية للاعدام - أطفال':'#f8bbd0', 'النسب المئوية للاعدام':'#f8bbd0' };
  const grpTextColors = { 'التجميع':'#283593', 'إجمالي الوارد':'#1b5e20', 'إجمالي المنصرف':'#4a148c', 'الفصائل والتوافق':'#0d47a1', 'عينات غير مفحوصة':'#b71c1c', 'الإعدامات':'#e65100', 'تحليل نسب المؤشرات':'#004d40', 'مؤشرات وحدات دم الأطفال':'#880e4f', 'النسب المئوية للاعدام - أطفال':'#ad1457', 'النسب المئوية للاعدام':'#ad1457' };
  const grpBgs = { 'التجميع':'#f3f0ff', 'إجمالي الوارد':'#f1f8e9', 'إجمالي المنصرف':'#faf0ff', 'الفصائل والتوافق':'#f0f7ff', 'عينات غير مفحوصة':'#fff5f5', 'الإعدامات':'#fffaf0', 'تحليل نسب المؤشرات':'#f0faf8', 'مؤشرات وحدات دم الأطفال':'#fdf0f5', 'النسب المئوية للاعدام - أطفال':'#fdf0f5', 'النسب المئوية للاعدام':'#fdf0f5' };
  const hasSub = cols.some(c => c.sg);
  const hasSubSub = cols.some(c => c.ssg);
  const dataRowSpan = hasSubSub ? 5 : hasSub ? 4 : 3;
  let html = '<div style="overflow-x:auto;padding:2px"><style>.ia-row:hover{background:#f5f8ff!important}.ia-row[data-row-bg="#f5f6fa"]:hover{background:#eef1f7!important}</style><table style="width:100%;border-collapse:collapse;font-size:12px;letter-spacing:0">';
  const groups = [];
  for (const c of cols) {
    const g = c.g || '';
    let grp = groups.find(x => x.name === g);
    if (!grp) { grp = { name: g, items: [], subs: new Map() }; groups.push(grp); }
    grp.items.push(c);
    if (c.sg) {
      if (!grp.subs.has(c.sg)) grp.subs.set(c.sg, []);
      grp.subs.get(c.sg).push(c);
    }
  }
  html += `<thead><tr>`;
  html += `<th rowspan="${dataRowSpan}" style="background:#e8eaf6;color:#283593;padding:10px 12px;position:sticky;right:0;z-index:3;min-width:160px;text-align:right;font-size:13px;border-bottom:3px solid #90caf9;white-space:nowrap">البيان</th>`;
  for (const grp of groups) {
    const bg = grpColors[grp.name] || '#e0e0e0';
    const tc = grpTextColors[grp.name] || '#37474f';
    html += `<th colspan="${grp.items.length * 2}" style="background:${bg};color:${tc};text-align:center;padding:6px 8px;font-size:11px;font-weight:700;border:1px solid rgba(0,0,0,.06);white-space:nowrap">${esc(grp.name)}</th>`;
  }
  html += `</tr><tr>`;
  for (const grp of groups) {
    const bg = grpColors[grp.name] || '#e0e0e0';
    const tc = grpTextColors[grp.name] || '#37474f';
    let ci = 0;
    while (ci < grp.items.length) {
      const f = grp.items[ci];
      if (f.sg && grp.subs.has(f.sg)) {
        const subCols = grp.subs.get(f.sg);
        if (subCols.length === 1) {
          const r2rs = hasSubSub ? 3 : hasSub ? 2 : 1;
          subCols.forEach(sc => {
            html += `<th colspan="2" rowspan="${r2rs}" style="background:${bg};color:${tc};text-align:center;padding:5px 4px;font-size:10px;font-weight:600;border:1px solid rgba(0,0,0,.06);white-space:nowrap">${esc(sc.label)}</th>`;
          });
        } else {
          html += `<th colspan="${subCols.length * 2}" style="background:${bg};color:${tc};text-align:center;padding:5px 4px;font-size:10px;font-weight:600;border:1px solid rgba(0,0,0,.06);white-space:nowrap">${esc(f.sg)}</th>`;
        }
        ci += subCols.length;
      } else {
        html += `<th colspan="2" rowspan="${hasSubSub ? 3 : hasSub ? 2 : 1}" style="background:${bg};color:${tc};text-align:center;padding:5px 4px;font-size:10px;font-weight:600;border:1px solid rgba(0,0,0,.06);white-space:nowrap">${esc(f.label)}</th>`;
        ci++;
      }
    }
  }
  if (hasSub) {
    html += `</tr><tr>`;
    for (const grp of groups) {
      const bg = grpColors[grp.name] || '#e0e0e0';
      const tc = grpTextColors[grp.name] || '#37474f';
      for (const f of grp.items) {
        if (f.sg && grp.subs.has(f.sg) && grp.subs.get(f.sg).length > 1) {
          const subCols = grp.subs.get(f.sg);
          if (subCols[0].key === f.key) {
            const subHasSSG = subCols.some(sc => sc.ssg);
            if (subHasSSG) {
              const ssgMap = new Map();
              subCols.forEach(sc => {
                const ssgKey = sc.ssg || '_default';
                if (!ssgMap.has(ssgKey)) ssgMap.set(ssgKey, []);
                ssgMap.get(ssgKey).push(sc);
              });
              for (const [ssgKey, ssgCols] of ssgMap) {
                if (ssgKey === '_default') {
                  ssgCols.forEach(sc => {
                    html += `<th colspan="2" rowspan="2" style="background:${bg};color:${tc};text-align:center;padding:5px 4px;font-size:10px;font-weight:600;border:1px solid rgba(0,0,0,.06);white-space:nowrap">${esc(sc.label)}</th>`;
                  });
                } else {
                  html += `<th colspan="${ssgCols.length * 2}" style="background:${bg};color:${tc};text-align:center;padding:5px 4px;font-size:10px;font-weight:600;border:1px solid rgba(0,0,0,.06);white-space:nowrap">${esc(ssgKey)}</th>`;
                }
              }
            } else {
              const rs = hasSubSub ? '2' : '1';
              subCols.forEach(sc => {
                html += `<th colspan="2" rowspan="${rs}" style="background:${bg};color:${tc};text-align:center;padding:5px 4px;font-size:10px;font-weight:600;border:1px solid rgba(0,0,0,.06);white-space:nowrap">${esc(sc.label)}</th>`;
              });
            }
          }
        }
      }
    }
  }
  if (hasSubSub) {
    html += `</tr><tr>`;
    for (const grp of groups) {
      const bg = grpColors[grp.name] || '#e0e0e0';
      const tc = grpTextColors[grp.name] || '#37474f';
      for (const f of grp.items) {
        if (f.sg && grp.subs.has(f.sg) && grp.subs.get(f.sg).length > 1) {
          const subCols = grp.subs.get(f.sg);
          if (subCols[0].key === f.key && subCols.some(sc => sc.ssg)) {
            const ssgMap = new Map();
            subCols.forEach(sc => {
              const ssgKey = sc.ssg || '_default';
              if (!ssgMap.has(ssgKey)) ssgMap.set(ssgKey, []);
              ssgMap.get(ssgKey).push(sc);
            });
            for (const [ssgKey, ssgCols] of ssgMap) {
              if (ssgKey !== '_default') {
                ssgCols.forEach(sc => {
                  html += `<th colspan="2" style="background:${bg};color:${tc};text-align:center;padding:5px 4px;font-size:10px;font-weight:600;border:1px solid rgba(0,0,0,.06);white-space:nowrap">${esc(sc.label)}</th>`;
                });
              }
            }
          }
        }
      }
    }
  }
  html += `</tr><tr>`;
  for (const c of cols) {
    html += `<th style="background:#e3f2fd;color:#1565c0;padding:3px 5px;font-size:9px;min-width:44px;border-bottom:2px solid #90caf9">${esc(pL1)}</th>`;
    html += `<th style="background:#fce4ec;color:#c62828;padding:3px 5px;font-size:9px;min-width:44px;border-bottom:2px solid #ef9a9a">${esc(pL2)}</th>`;
  }
  html += '</tr></thead><tbody>';
  let rowIdx = 0;
  function addRow(label, d1, d2, bg, isBold, isGov) {
    const isDark = bg === '#f5f6fa';
    const rowBg = isDark ? '#f5f6fa' : (isBold ? '#f5f6fa' : (rowIdx % 2 === 0 ? '#fff' : '#fafbfc'));
    const txtColor = isBold ? '#263238' : '#455a64';
    const borderBot = isDark ? '2px solid #90a4ae' : (isBold ? '1.5px solid #cfd8dc' : '1px solid #f0f0f0');
    const labelIndent = isBold ? '0' : '20px';
    html += `<tr class="ia-row" data-row-bg="${rowBg}" style="background:${rowBg};font-weight:${isBold?'700':'400'};border-bottom:${borderBot};color:${txtColor};transition:background .15s">`;
    html += `<td style="padding:7px 12px;position:sticky;right:0;background:inherit;z-index:1;font-size:${isBold?'13':'12'}px;text-align:right;border-left:3px solid ${isGov?'#90caf9':'transparent'};padding-left:${labelIndent};white-space:nowrap">${isBold?'<strong>':''}${esc(label)}${isBold?'</strong>':''}</td>`;
    for (let ci = 0; ci < cols.length; ci++) {
      const c = cols[ci];
      const v1 = d1[c.key] || 0;
      const v2 = d2[c.key] || 0;
      const cellBg1 = isBold ? '#f0f4ff' : '';
      const cellBg2 = isBold ? '#fff5f7' : '';
      html += `<td style="text-align:center;padding:5px 6px;font-size:${isBold?'12':'11'}px;background:${cellBg1};color:#1565c0;border-left:1px solid rgba(0,0,0,.03)">${_iaFmt(v1)}</td>`;
      html += `<td style="text-align:center;padding:5px 6px;font-size:${isBold?'12':'11'}px;background:${cellBg2};color:#c62828;border-right:1px solid rgba(0,0,0,.03);${isBold?'font-weight:700':''}">${_iaFmt(v2)}</td>`;
    }
    html += '</tr>';
    rowIdx++;
  }
  let grand1 = {}, grand2 = {};
  for (const c of cols) { grand1[c.key] = 0; grand2[c.key] = 0; }
  const useFormulas = (typeKey === 'big' || typeKey === 'small');
  let grandRaw1 = {}, grandRaw2 = {};
  for (const [gov, hosps] of G.govG) {
    let govRaw1 = {}, govRaw2 = {};
    const hospRows = [];
    for (const h of hosps) {
      const d1raw = G.p1M.get(h.hid)||{}, d2raw = G.p2M.get(h.hid)||{};
      const d1 = _iaMergeWithFormulas(d1raw, typeKey);
      const d2 = _iaMergeWithFormulas(d2raw, typeKey);
      for (const [k, v] of Object.entries(d1raw)) {
        if (_iaIsFormula(k)) continue;
        if (typeof v === 'number') govRaw1[k] = (govRaw1[k]||0) + v;
      }
      for (const [k, v] of Object.entries(d2raw)) {
        if (_iaIsFormula(k)) continue;
        if (typeof v === 'number') govRaw2[k] = (govRaw2[k]||0) + v;
      }
      hospRows.push({ name: h.name, d1, d2 });
    }
    let gov1 = {}, gov2 = {};
    if (useFormulas) {
      Object.assign(gov1, govRaw1, _iaRecomputeFormulas(govRaw1, typeKey));
      Object.assign(gov2, govRaw2, _iaRecomputeFormulas(govRaw2, typeKey));
    } else {
      gov1 = govRaw1; gov2 = govRaw2;
    }
    for (const [k, v] of Object.entries(govRaw1)) {
      if (_iaIsFormula(k)) continue;
      grandRaw1[k] = (grandRaw1[k]||0) + v;
    }
    for (const [k, v] of Object.entries(govRaw2)) {
      if (_iaIsFormula(k)) continue;
      grandRaw2[k] = (grandRaw2[k]||0) + v;
    }
    if (showGovTotal) {
      const g1 = {}, g2 = {};
      for (const c of cols) { g1[c.key] = gov1[c.key] || 0; g2[c.key] = gov2[c.key] || 0; }
      addRow(gov, g1, g2, '', true, true);
    }
    if (showHospDetail) {
      for (const hr of hospRows) addRow(hr.name, hr.d1, hr.d2, '', false, false);
    }
  }
  if (useFormulas) {
    Object.assign(grand1, grandRaw1, _iaRecomputeFormulas(grandRaw1, typeKey));
    Object.assign(grand2, grandRaw2, _iaRecomputeFormulas(grandRaw2, typeKey));
  } else {
    Object.assign(grand1, grandRaw1); Object.assign(grand2, grandRaw2);
  }
  const gFinal1 = {}, gFinal2 = {};
  for (const c of cols) { gFinal1[c.key] = grand1[c.key] || 0; gFinal2[c.key] = grand2[c.key] || 0; }
  if (showGrandTotal) addRow('اجمالي الهيئة', gFinal1, gFinal2, '#f5f6fa', true, false);
  html += '</tbody></table></div>';
  return html;
}
function _iaBuildGovGroups(p1Data, p2Data, allGovs) {
  const all = new Map();
  for (const h of p1Data) all.set(h.hospital_id, { name: h.hospital_name, gov: h.governorate });
  for (const h of p2Data) if (!all.has(h.hospital_id)) all.set(h.hospital_id, { name: h.hospital_name, gov: h.governorate });
  const govG = new Map();
  if (Array.isArray(allGovs)) allGovs.forEach(g => { if (!govG.has(g)) govG.set(g, []); });
  for (const [hid, info] of all) { const g = info.gov || 'غير محدد'; if (!govG.has(g)) govG.set(g, []); govG.get(g).push({ hid, ...info }); }
  return { all, govG: [...govG.entries()].sort((a,b) => a[0].localeCompare(b[0], 'ar')), p1M: new Map(p1Data.map(h => [h.hospital_id, h.data||{}])), p2M: new Map(p2Data.map(h => [h.hospital_id, h.data||{}])) };
}

async function renderIndicatorAnalysis() {
  const c = document.getElementById('mainContent');
  const now = new Date();
  const curYear = now.getFullYear();
  const years = [curYear, curYear - 1, curYear - 2, curYear - 3, curYear - 4];
  const govs = await api('GET', '/governorates');
  const hospList = await api('GET', '/hospitals');
  let govOpts = '<option value="">كل المحافظات</option>';
  if (Array.isArray(govs)) govs.forEach(g => { const n = typeof g === 'string' ? g : g.name; govOpts += `<option value="${esc(n)}">${esc(n)}</option>`; });
  let hospOpts = '<option value="">كل المستشفيات</option>';
  if (Array.isArray(hospList)) hospList.forEach(h => { hospOpts += `<option value="${h.id}">${esc(h.name)} (${esc(h.governorate)})</option>`; });
  c.innerHTML = `
    <div style="margin-bottom:16px"><button class="btn-back" data-click="goBack"><i class="fas fa-arrow-right"></i> رجوع</button></div>
    <div class="card" style="margin-bottom:16px"><div class="card-header" style="background:linear-gradient(135deg,#ff6f00,#ff8f00);color:#fff">
      <h2 style="margin:0;font-size:18px"><i class="fa-solid fa-magnifying-glass-chart"></i> تحليل مؤشرات الأداء</h2>
    </div><div class="card-body">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
        <div style="background:var(--card-bg);border:1px solid var(--border);border-radius:10px;padding:14px">
          <div style="font-weight:700;margin-bottom:10px;color:var(--primary)">الفترة الأولى (الأقدم)</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <select id="iaYear1" class="form-control" style="flex:1;min-width:80px">${years.map(y=>`<option value="${y}">${y}</option>`).join('')}</select>
            <select id="iaPeriod1" class="form-control" style="flex:1;min-width:100px">
              <option value="yearly">سنوي</option><option value="h1">النصف الأول</option><option value="h2">النصف الثاني</option>
              <option value="q1">الربع الأول</option><option value="q2">الربع الثاني</option>
              <option value="q3">الربع الثالث</option><option value="q4">الربع الرابع</option><option value="monthly">شهري</option>
            </select>
            <select id="iaMonth1" class="form-control" style="flex:0.6;min-width:70px;display:none">${[1,2,3,4,5,6,7,8,9,10,11,12].map(m=>`<option value="${m}">${m}</option>`).join('')}</select>
          </div>
        </div>
        <div style="background:var(--card-bg);border:1px solid var(--border);border-radius:10px;padding:14px">
          <div style="font-weight:700;margin-bottom:10px;color:#c0392b">الفترة الثانية (الأحدث)</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <select id="iaYear2" class="form-control" style="flex:1;min-width:80px">${years.map(y=>`<option value="${y}" ${y===curYear?'selected':''}>${y}</option>`).join('')}</select>
            <select id="iaPeriod2" class="form-control" style="flex:1;min-width:100px">
              <option value="yearly">سنوي</option><option value="h1">النصف الأول</option><option value="h2">النصف الثاني</option>
              <option value="q1">الربع الأول</option><option value="q2">الربع الثاني</option>
              <option value="q3" selected>الربع الثالث</option><option value="q4">الربع الرابع</option><option value="monthly">شهري</option>
            </select>
            <select id="iaMonth2" class="form-control" style="flex:0.6;min-width:70px;display:none">${[1,2,3,4,5,6,7,8,9,10,11,12].map(m=>`<option value="${m}">${m}</option>`).join('')}</select>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:end;margin-bottom:16px">
        <div style="flex:1;min-width:150px"><label style="font-size:12px;font-weight:600">المحافظة</label><select id="iaGov" class="form-control" style="width:100%">${govOpts}</select></div>
        <div style="flex:1.5;min-width:200px"><label style="font-size:12px;font-weight:600">المستشفى</label><select id="iaHosp" class="form-control" style="width:100%">${hospOpts}</select></div>
        <div style="flex:0.8;min-width:120px"><label style="font-size:12px;font-weight:600">النوع</label>
          <select id="iaType" class="form-control" style="width:100%"><option value="all">الكل</option><option value="big">تجميعي</option><option value="small">تخزيني</option><option value="disp">فصائل</option></select></div>
        <button data-click="loadIndicatorAnalysis" style="padding:10px 24px;background:var(--primary);color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;white-space:nowrap"><i class="fa-solid fa-search"></i> عرض</button>
        <button data-click="exportIndicatorAnalysisExcel" style="padding:10px 16px;background:#28a745;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer"><i class="fa-solid fa-file-excel"></i> Excel</button>
      </div>
      <div id="iaPeriod1Label" style="display:inline-block;padding:4px 12px;background:#e3f2fd;border-radius:6px;font-size:12px;margin-right:8px"></div>
      <div id="iaPeriod2Label" style="display:inline-block;padding:4px 12px;background:#fce4ec;border-radius:6px;font-size:12px"></div>
    </div></div>
    <div class="card" style="margin-bottom:16px"><div class="card-header" style="background:linear-gradient(135deg,#37474f,#455a64);color:#fff;padding:10px 16px;cursor:pointer" data-click="toggleIaPicker">
      <h3 style="margin:0;font-size:15px;display:flex;align-items:center;gap:8px"><i class="fa-solid fa-sliders"></i> اختر المؤشرات اللي تتعرض <span style="margin-right:auto;font-size:12px;font-weight:400;opacity:.7">(اضغط لاختيار الأعمدة)</span><i class="fa-solid fa-chevron-down" id="iaPickerChevron" style="font-size:12px;transition:transform .2s"></i></h3>
    </div><div class="card-body" id="iaPickerBody" style="padding:14px;display:none">
      <div style="margin-bottom:14px">
        <div style="font-size:13px;font-weight:700;color:#1a237e;margin-bottom:8px"><i class="fa-solid fa-building-columns" style="font-size:8px;margin-left:4px"></i>ارشيف التجميعي (${_iaBigFields.length} حقل)</div>
        ${_iaRenderFieldCheckboxes(_iaBigFields, 'iaBigColChk', '#1a237e')}
      </div>
      <div style="margin-bottom:14px;padding-top:12px;border-top:1px solid var(--border)">
        <div style="font-size:13px;font-weight:700;color:#4a148c;margin-bottom:8px"><i class="fa-solid fa-warehouse" style="font-size:8px;margin-left:4px"></i>ارشيف التخزيني (${_iaSmallFields.length} حقل)</div>
        ${_iaRenderFieldCheckboxes(_iaSmallFields, 'iaSmallColChk', '#4a148c')}
      </div>
      <div style="margin-bottom:14px;padding-top:12px;border-top:1px solid var(--border)">
        <div style="font-size:13px;font-weight:700;color:#00695c;margin-bottom:8px"><i class="fa-solid fa-droplet" style="font-size:8px;margin-left:4px"></i>ارشيف الفصائل</div>
        <div style="display:flex;flex-wrap:wrap;gap:5px">${_iaDispFields.map(c => `<label style="display:inline-flex;align-items:center;gap:4px;padding:4px 8px;background:var(--card-bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:11px;white-space:nowrap;transition:all .15s"><input type="checkbox" class="iaDispColChk" value="${c.key}" checked data-change="iaPickerChanged" style="accent-color:#00695c;width:13px;height:13px">${esc(c.label)}</label>`).join('')}</div>
      </div>
      <div style="padding-top:12px;border-top:1px solid var(--border);margin-bottom:14px">
        <div style="font-size:13px;font-weight:700;color:#ff6f00;margin-bottom:8px"><i class="fa-solid fa-layer-group" style="font-size:8px;margin-left:4px"></i>طريقة العرض</div>
        <div style="display:flex;flex-wrap:wrap;gap:5px">
          <label style="display:inline-flex;align-items:center;gap:4px;padding:5px 12px;background:#fff3e0;border:1px solid #ffcc80;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600"><input type="checkbox" id="iaShowGrand" checked data-change="iaPickerChanged" style="accent-color:#ff6f00;width:14px;height:14px">اجمالي الهيئه</label>
          <label style="display:inline-flex;align-items:center;gap:4px;padding:5px 12px;background:#fff3e0;border:1px solid #ffcc80;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600"><input type="checkbox" id="iaShowGov" checked data-change="iaPickerChanged" style="accent-color:#ff6f00;width:14px;height:14px">اجمالي المحافظات</label>
          <label style="display:inline-flex;align-items:center;gap:4px;padding:5px 12px;background:#fff3e0;border:1px solid #ffcc80;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600"><input type="checkbox" id="iaShowHosp" checked data-change="iaPickerChanged" style="accent-color:#ff6f00;width:14px;height:14px">تفاصيل المستشفيات</label>
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:center">
        <button data-click="iaPickerSelectAll" style="padding:6px 16px;background:#e3f2fd;border:1px solid #90caf9;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600">تحديد الكل</button>
        <button data-click="iaPickerClearAll" style="padding:6px 16px;background:#ffebee;border:1px solid #ef9a9a;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600">إلغاء الكل</button>
        <button data-click="loadIndicatorAnalysis" style="padding:6px 20px;background:var(--primary);color:#fff;border:none;border-radius:6px;font-weight:700;cursor:pointer;font-size:13px"><i class="fa-solid fa-rotate"></i> تحديث</button>
      </div>
    </div></div>
    <div id="iaResults"></div>
    <div style="text-align:center;margin-top:20px;padding:12px;border-top:1px solid var(--border);font-size:10px;color:var(--text-muted)">إعداد و برمجة محمد ندا 01068880999</div>`;
  document.getElementById('iaPeriod1').addEventListener('change', function() { document.getElementById('iaMonth1').style.display = this.value === 'monthly' ? '' : 'none'; });
  document.getElementById('iaPeriod2').addEventListener('change', function() { document.getElementById('iaMonth2').style.display = this.value === 'monthly' ? '' : 'none'; });
  document.getElementById('iaGov').addEventListener('change', function() {
    const h = document.getElementById('iaHosp'), g = this.value;
    h.innerHTML = '<option value="">كل المستشفيات</option>';
    (Array.isArray(hospList) ? hospList : []).filter(x => !g || x.governorate === g).forEach(x => { h.innerHTML += `<option value="${x.id}">${esc(x.name)}</option>`; });
  });
  document.getElementById('iaType').addEventListener('change', function() {});
  loadIndicatorAnalysis();
}
async function loadIndicatorAnalysis() {
  await ensureIndicatorColumnsLoaded();
  const y1 = document.getElementById('iaYear1')?.value, p1 = document.getElementById('iaPeriod1')?.value, m1 = document.getElementById('iaMonth1')?.value;
  const y2 = document.getElementById('iaYear2')?.value, p2 = document.getElementById('iaPeriod2')?.value, m2 = document.getElementById('iaMonth2')?.value;
  const gov = document.getElementById('iaGov')?.value, hosp = document.getElementById('iaHosp')?.value;
  const months1 = p1 === 'monthly' ? m1 : _iaPeriodMonths[p1].join(',');
  const months2 = p2 === 'monthly' ? m2 : _iaPeriodMonths[p2].join(',');
  document.getElementById('iaPeriod1Label').innerHTML = `<strong>${y1}</strong> — ${_iaPeriodLabels[p1]}${p1==='monthly'?'/'+m1:''}`;
  document.getElementById('iaPeriod2Label').innerHTML = `<strong>${y2}</strong> — ${_iaPeriodLabels[p2]}${p2==='monthly'?'/'+m2:''}`;
  const wrap = document.getElementById('iaResults');
  wrap.innerHTML = '<div style="text-align:center;padding:40px"><i class="fa-solid fa-spinner fa-spin" style="font-size:24px;color:var(--primary)"></i><br>جاري تحميل البيانات...</div>';
  try {
    const params = new URLSearchParams({ year1: y1, months1, year2: y2, months2 });
    if (gov) params.set('governorate', gov);
    if (hosp) params.set('hospitalId', hosp);
    const [result, allGovsRaw] = await Promise.all([api('GET', '/indicator-analysis?' + params.toString()), api('GET', '/governorates')]);
    const bigP1 = result.big?.period1 || [], bigP2 = result.big?.period2 || [];
    const smallP1 = result.small?.period1 || [], smallP2 = result.small?.period2 || [];
    const dispP1 = result.disp?.period1 || [], dispP2 = result.disp?.period2 || [];
    const dataGovSet = new Set();
    [bigP1,bigP2,smallP1,smallP2,dispP1,dispP2].forEach(arr => arr.forEach(h => { if (h.governorate) dataGovSet.add(h.governorate); }));
    const allGovs = gov ? [gov] : (dataGovSet.size ? [...dataGovSet].sort((a,b) => a.localeCompare(b,'ar')) : allGovsRaw.map(g => typeof g === 'string' ? g : g.name));
    window._iaLastResult = result;
    window._iaLastGovs = allGovs;
    const iaType = document.getElementById('iaType')?.value || 'all';
    const pL1 = document.getElementById('iaPeriod1Label')?.textContent || 'الفترة 1';
    const pL2 = document.getElementById('iaPeriod2Label')?.textContent || 'الفترة 2';
    let tablesHtml = '';
    const hasBig = bigP1.length || bigP2.length, hasSmall = smallP1.length || smallP2.length, hasDisp = dispP1.length || dispP2.length;
    const checkedBig = _iaGetCheckedCols('big').map(k => _iaBigFields.find(f => f.key === k)).filter(Boolean);
    const checkedSmall = _iaGetCheckedCols('small').map(k => _iaSmallFields.find(f => f.key === k)).filter(Boolean);
    const checkedDisp = _iaGetCheckedCols('disp').map(k => _iaDispFields.find(f => f.key === k)).filter(Boolean);
    const _secAnalysis = [];
    function _buildSection(secId, secLabel, icon, grad, p1, p2, checked, typeKey) {
      if (!checked.length) return;
      const groups = [...new Set(checked.map(c => c.g || 'أخرى'))];
      let h = `<div class="card" style="margin-bottom:16px" id="iaCard${secId}"><div class="card-header" style="background:linear-gradient(135deg,${grad});color:#fff;padding:10px 16px"><h3 style="margin:0;font-size:14px"><i class="fa-solid ${icon}" style="margin-left:8px"></i>${secLabel} <span style="font-size:11px;opacity:.7;font-weight:400">(${checked.length} حقل)</span></h3></div><div class="card-body" style="padding:0">`;
      h += _iaBuildSummaryTable(p1, p2, pL1, pL2, allGovs, checked, typeKey);
      const grpBgMap = {'التجميع':'#e8eaf6,#c5cae9','إجمالي الوارد':'#e8f5e9,#c8e6c9','إجمالي المنصرف':'#f3e5f5,#e1bee7','الفصائل والتوافق':'#e3f2fd,#bbdefb','عينات غير مفحوصة':'#ffebee,#ffcdd2','الإعدامات':'#fff3e0,#ffe0b2','تحليل نسب المؤشرات':'#e0f2f1,#b2dfdb','مؤشرات وحدات دم الأطفال':'#fce4ec,#f8bbd0','النسب المئوية للاعدام - أطفال':'#fce4ec,#f8bbd0','النسب المئوية للاعدام':'#fce4ec,#f8bbd0'};
      const grpTxtMap = {'التجميع':'#1a237e','إجمالي الوارد':'#1b5e20','إجمالي المنصرف':'#4a148c','الفصائل والتوافق':'#0d47a1','عينات غير مفحوصة':'#b71c1c','الإعدامات':'#e65100','تحليل نسب المؤشرات':'#004d40','مؤشرات وحدات دم الأطفال':'#880e4f','النسب المئوية للاعدام - أطفال':'#ad1457','النسب المئوية للاعدام':'#ad1457'};
      for (const grp of groups) {
        const gCols = checked.filter(c => (c.g || 'أخرى') === grp);
        const safeId = grp.replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '_');
        const bg = (grpBgMap[grp] || '#f5f5f5,#eeeeee').split(',');
        const tc = grpTxtMap[grp] || '#333';
        h += `<div style="margin:0;border-top:1px solid var(--border)">`;
        h += `<div data-click="toggleIaGroup" data-args="'iaGrp${safeId}'" style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;cursor:pointer;background:linear-gradient(135deg,${bg[0]},${bg[1]});transition:background .15s">`;
        h += `<span style="font-size:13px;font-weight:700;color:${tc}"><i class="fa-solid fa-magnifying-glass-chart" style="margin-left:6px;font-size:11px"></i>${esc(grp)} <span style="font-size:10px;opacity:.6">(${gCols.length} حقل)</span></span>`;
        h += `<i class="fa-solid fa-chevron-down" id="chev_iaGrp${safeId}" style="font-size:10px;color:${tc};transition:transform .2s"></i></div>`;
        h += `<div id="iaGrp${safeId}" style="display:none"><div class="ia-analysis" id="iaAnalysis${secId}_${safeId}"></div></div></div>`;
        _secAnalysis.push({ divId: `iaAnalysis${secId}_${safeId}`, p1, p2, cols: gCols, label: grp, pL1, pL2 });
      }
      h += '</div></div>';
      tablesHtml += h;
    }
    if (hasBig && checkedBig.length && (iaType === 'all' || iaType === 'big')) _buildSection('Big', 'المؤشرات التجميعية', 'fa-building-columns', '#1a237e,#283593', bigP1, bigP2, checkedBig, 'big');
    if (hasSmall && checkedSmall.length && (iaType === 'all' || iaType === 'small')) _buildSection('Small', 'المؤشرات التخزينية', 'fa-warehouse', '#4a148c,#6a1b9a', smallP1, smallP2, checkedSmall, 'small');
    if (hasDisp && checkedDisp.length && (iaType === 'all' || iaType === 'big' || iaType === 'disp')) _buildSection('Disp', 'منصرف الفصائل', 'fa-droplet', '#00695c,#00897b', dispP1, dispP2, checkedDisp, 'disp');
    if (!tablesHtml) tablesHtml = '<div class="card"><div class="card-body" style="text-align:center;padding:48px 20px;color:var(--text-muted)"><i class="fa-solid fa-table-columns" style="font-size:40px;margin-bottom:12px;opacity:.4"></i><br><div style="font-size:14px;font-weight:600;margin-bottom:6px">لا توجد أعمدة محددة</div><div style="font-size:12px;opacity:.7">افتح بانل اختيار المؤشرات حدد الأعمدة المطلوبة ثم اضغط تحديث</div></div></div>';
    wrap.innerHTML = tablesHtml;
    for (const a of _secAnalysis) {
      _iaRenderGroupAnalysis(a.divId, a.p1, a.p2, a.cols, a.label, a.pL1, a.pL2);
    }
  } catch (err) { wrap.innerHTML = `<div style="color:red;padding:20px;text-align:center">خطأ: ${esc(err.message||'')}</div>`; }
}

/* ─── Excel Export (professional) ─── */
function exportIndicatorAnalysisExcel() {
  showToast('جاري التجهيز...');
  try {
    if (typeof ExcelJS === 'undefined') { showToast('مكتبة ExcelJS غير محملة', 'error'); return; }
    const iaType = document.getElementById('iaType')?.value || 'all';
    const pL1 = document.getElementById('iaPeriod1Label')?.textContent || 'الفترة 1';
    const pL2 = document.getElementById('iaPeriod2Label')?.textContent || 'الفترة 2';
    const checkedBig = _iaGetCheckedCols('big').map(k => _iaBigFields.find(f => f.key === k)).filter(Boolean);
    const checkedSmall = _iaGetCheckedCols('small').map(k => _iaSmallFields.find(f => f.key === k)).filter(Boolean);
    const checkedDisp = _iaGetCheckedCols('disp').map(k => _iaDispFields.find(f => f.key === k)).filter(Boolean);
    if (!checkedBig.length && !checkedSmall.length && !checkedDisp.length) { showToast('لا توجد أعمدة محددة للتصدير', 'warning'); return; }
    const wb = new ExcelJS.Workbook();
    wb.creator = 'نظام بنك الدم';
    wb.created = new Date();
    const grpColorMap = { 'التجميع':'7986CB', 'إجمالي الوارد':'81C784', 'إجمالي المنصرف':'CE93D8', 'الفصائل والتوافق':'64B5F6', 'عينات غير مفحوصة':'EF9A9A', 'الإعدامات':'FFAB91', 'تحليل نسب المؤشرات':'80CBC4', 'مؤشرات وحدات دم الأطفال':'F48FB1', 'النسب المئوية للاعدام - أطفال':'F48FB1', 'النسب المئوية للاعدام':'F48FB1' };
    const grpBgLight = { 'التجميع':'E8EAF6', 'إجمالي الوارد':'E8F5E9', 'إجمالي المنصرف':'F3E5F5', 'الفصائل والتوافق':'E3F2FD', 'عينات غير مفحوصة':'FFEBEE', 'الإعدامات':'FBE9E7', 'تحليل نسب المؤشرات':'E0F2F1', 'مؤشرات وحدات دم الأطفال':'FCE4EC', 'النسب المئوية للاعدام - أطفال':'FCE4EC', 'النسب المئوية للاعدام':'FCE4EC' };
    const borderStyle = { style:'thin', color:{ argb:'FFB0BEC5' } };
    const thinBorder = { top:borderStyle, bottom:borderStyle, left:borderStyle, right:borderStyle };
    const noBorder = { top:{style:'none'}, bottom:{style:'none'}, left:{style:'none'}, right:{style:'none'} };
    function buildSheet(title, cols, cardType) {
      if (!cols.length) return;
      const groups = [];
      for (const f of cols) {
        const g = f.g || '';
        let grp = groups.find(x => x.name === g);
        if (!grp) { grp = { name: g, items: [] }; groups.push(grp); }
        grp.items.push(f);
      }
      const ws = wb.addWorksheet(title, { views:[{ state:'frozen', ySplit:3, xSplit:1 }] });
      const data = cardType === 'big' ? window._iaLastResult?.big : cardType === 'small' ? window._iaLastResult?.small : window._iaLastResult?.disp;
      const p1Data = data?.period1 || [], p2Data = data?.period2 || [];
      const G = _iaBuildGovGroups(p1Data, p2Data, window._iaLastGovs || []);
      const showGrand = document.getElementById('iaShowGrand')?.checked;
      const showGov = document.getElementById('iaShowGov')?.checked;
      const showHosp = document.getElementById('iaShowHosp')?.checked;
      ws.getColumn(1).width = 26;
      let colIdx = 2;
      for (const c of cols) { ws.getColumn(colIdx).width = 11; ws.getColumn(colIdx + 1).width = 11; colIdx += 2; }
      ws.getColumn(colIdx).width = 10;
      const totalCols = cols.length * 2 + 2;
      ws.getRow(1).height = 28;
      ws.getRow(2).height = 22;
      ws.getRow(3).height = 18;
      ws.getCell(1,1).value = 'البيان';
      ws.getCell(1,1).font = { bold:true, color:{ argb:'FF283593' }, size:12 };
      ws.getCell(1,1).fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFE8EAF6' } };
      ws.getCell(1,1).alignment = { horizontal:'center', vertical:'middle', wrapText:true };
      ws.getCell(1,1).border = thinBorder;
      ws.mergeCells(1,1,3,1);
      ws.getCell(1,2).value = 'التغيير %';
      ws.getCell(1,2).font = { bold:true, color:{ argb:'FF37474F' }, size:10 };
      ws.getCell(1,2).fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFE8EAF6' } };
      ws.getCell(1,2).alignment = { horizontal:'center', vertical:'middle' };
      ws.getCell(1,2).border = thinBorder;
      ws.mergeCells(1, totalCols, 3, totalCols);
      let cIdx = 2;
      for (const grp of groups) {
        const startC = cIdx;
        const grpBg = grpColorMap[grp.name] || '455A64';
        for (const f of grp.items) {
          ws.getCell(2, cIdx).value = f.label;
          ws.getCell(2, cIdx).font = { bold:true, color:{ argb: 'FF' + grpBg }, size:9 };
          ws.getCell(2, cIdx).fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF' + (grpBgLight[grp.name] || 'F5F5F5') } };
          ws.getCell(2, cIdx).alignment = { horizontal:'center', vertical:'middle' };
          ws.getCell(2, cIdx).border = thinBorder;
          ws.mergeCells(2, cIdx, 2, cIdx + 1);
          ws.getCell(3, cIdx).value = pL1;
          ws.getCell(3, cIdx).font = { bold:true, color:{ argb:'FF1565C0' }, size:8 };
          ws.getCell(3, cIdx).fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFE8F0FE' } };
          ws.getCell(3, cIdx).alignment = { horizontal:'center', vertical:'middle' };
          ws.getCell(3, cIdx).border = thinBorder;
          ws.getCell(3, cIdx + 1).value = pL2;
          ws.getCell(3, cIdx + 1).font = { bold:true, color:{ argb:'FF880E4F' }, size:8 };
          ws.getCell(3, cIdx + 1).fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFFCE4EC' } };
          ws.getCell(3, cIdx + 1).alignment = { horizontal:'center', vertical:'middle' };
          ws.getCell(3, cIdx + 1).border = thinBorder;
          cIdx += 2;
        }
        ws.getCell(1, startC).value = grp.name;
        ws.getCell(1, startC).font = { bold:true, color:{ argb: 'FF' + (grpColorMap[grp.name] || '455A64') }, size:10 };
        ws.getCell(1, startC).fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF' + (grpBgLight[grp.name] || 'ECEFF1') } };
        ws.getCell(1, startC).alignment = { horizontal:'center', vertical:'middle' };
        ws.getCell(1, startC).border = thinBorder;
        ws.mergeCells(1, startC, 1, cIdx - 1);
      }
      let r = 4;
      function addRow(label, d1, d2, style) {
        const row = ws.getRow(r);
        row.height = style === 'grand' ? 26 : style === 'gov' ? 22 : 18;
        ws.getCell(r, 1).value = label;
        ws.getCell(r, 1).font = { bold: style !== 'hosp', size: style === 'grand' ? 11 : 10, color:{ argb: 'FF263238' } };
        ws.getCell(r, 1).alignment = { horizontal:'right', vertical:'middle', indent: style === 'hosp' ? 1 : 0 };
        ws.getCell(r, 1).border = thinBorder;
        if (style === 'grand') ws.getCell(r, 1).fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFE8EAF6' } };
        else if (style === 'gov') ws.getCell(r, 1).fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFF3F0FF' } };
        else if (r % 2 === 0) ws.getCell(r, 1).fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFFAFAFA' } };
        cIdx = 2;
        for (const c of cols) {
          const v1 = Number(d1[c.key]) || 0;
          const v2 = Number(d2[c.key]) || 0;
          ws.getCell(r, cIdx).value = v1;
          ws.getCell(r, cIdx).numFmt = '#,##0';
          ws.getCell(r, cIdx).font = { bold: style !== 'hosp', size: style === 'grand' ? 10 : 9, color:{ argb: 'FF1565C0' } };
          ws.getCell(r, cIdx).alignment = { horizontal:'center', vertical:'middle' };
          ws.getCell(r, cIdx).border = thinBorder;
          if (style === 'grand') ws.getCell(r, cIdx).fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFE3F2FD' } };
          else if (style === 'gov') ws.getCell(r, cIdx).fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFF0F4FF' } };
          ws.getCell(r, cIdx + 1).value = v2;
          ws.getCell(r, cIdx + 1).numFmt = '#,##0';
          ws.getCell(r, cIdx + 1).font = { bold: style !== 'hosp', size: style === 'grand' ? 10 : 9, color:{ argb: 'FFAD1457' } };
          ws.getCell(r, cIdx + 1).alignment = { horizontal:'center', vertical:'middle' };
          ws.getCell(r, cIdx + 1).border = thinBorder;
          if (style === 'grand') ws.getCell(r, cIdx + 1).fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFFCE4EC' } };
          else if (style === 'gov') ws.getCell(r, cIdx + 1).fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFFFF0F3' } };
          cIdx += 2;
        }
        if (style === 'hosp') {
          ws.getCell(r, cIdx).value = '';
        } else {
          let t1 = 0, t2 = 0;
          for (const c of cols) { if (_iaIsFormula(c.key)) continue; t1 += (Number(d1[c.key]) || 0); t2 += (Number(d2[c.key]) || 0); }
          const pct = t1 ? ((t2 - t1) / t1 * 100) : 0;
          ws.getCell(r, cIdx).value = t1 ? pct / 100 : '';
          ws.getCell(r, cIdx).numFmt = '0.00%';
          const pctColor = pct > 0 ? 'FF66BB6A' : pct < 0 ? 'FFEF5350' : 'FF78909C';
          ws.getCell(r, cIdx).font = { bold:true, size:10, color:{ argb: pctColor } };
        }
        ws.getCell(r, cIdx).alignment = { horizontal:'center', vertical:'middle' };
        ws.getCell(r, cIdx).border = thinBorder;
        if (style === 'grand') ws.getCell(r, cIdx).fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFE8EAF6' } };
        else if (style === 'gov') ws.getCell(r, cIdx).fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFF3F0FF' } };
        r++;
      }
      let grand1 = {}, grand2 = {};
      let grandRaw1 = {}, grandRaw2 = {};
      for (const c of cols) { grand1[c.key] = 0; grand2[c.key] = 0; if (!_iaIsFormula(c.key)) { grandRaw1[c.key] = 0; grandRaw2[c.key] = 0; } }
      for (const [gov, hosps] of G.govG) {
        let gov1 = {}, gov2 = {};
        for (const c of cols) { gov1[c.key] = 0; gov2[c.key] = 0; }
        for (const h of hosps) {
          const d1 = G.p1M.get(h.hid) || {}, d2 = G.p2M.get(h.hid) || {};
          for (const c of cols) { if (_iaIsFormula(c.key)) continue; gov1[c.key] += (Number(d1[c.key]) || 0); gov2[c.key] += (Number(d2[c.key]) || 0); }
        }
        if (cardType === 'big' || cardType === 'small') { Object.assign(gov1, _iaRecomputeFormulas(gov1, cardType)); Object.assign(gov2, _iaRecomputeFormulas(gov2, cardType)); }
        for (const c of cols) { if (_iaIsFormula(c.key)) continue; grandRaw1[c.key] += gov1[c.key]; grandRaw2[c.key] += gov2[c.key]; }
        if (showGov) addRow(gov, gov1, gov2, 'gov');
        if (showHosp) {
          for (const h of hosps) {
            const d1raw = G.p1M.get(h.hid) || {}, d2raw = G.p2M.get(h.hid) || {};
            const d1 = _iaMergeWithFormulas(d1raw, cardType), d2 = _iaMergeWithFormulas(d2raw, cardType);
            addRow(h.name, d1, d2, 'hosp');
          }
        }
      }
      if (cardType === 'big' || cardType === 'small') {
        Object.assign(grand1, grandRaw1); Object.assign(grand2, grandRaw2);
        Object.assign(grand1, _iaRecomputeFormulas(grand1, cardType)); Object.assign(grand2, _iaRecomputeFormulas(grand2, cardType));
      }
      if (showGrand) addRow('اجمالي الهيئة', grand1, grand2, 'grand');
    }
    if (checkedBig.length && (iaType === 'all' || iaType === 'big')) buildSheet('المؤشرات التجميعية', checkedBig, 'big');
    if (checkedSmall.length && (iaType === 'all' || iaType === 'small')) buildSheet('المؤشرات التخزينية', checkedSmall, 'small');
    if (checkedDisp.length && (iaType === 'all' || iaType === 'big' || iaType === 'disp')) buildSheet('منصرف الفصائل', checkedDisp, 'disp');
    if (!wb._worksheets || !wb._worksheets.length) { showToast('لا توجد جداول للتصدير', 'warning'); return; }
    wb.xlsx.writeBuffer().then(function(buffer) {
      const blob = new Blob([buffer], { type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'تحليل_مؤشرات_الأداء.xlsx';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('تم التصدير بنجاح', 'success');
    });
  } catch (e) { showToast('خطأ في التصدير: ' + e.message, 'error'); }
}

/* ─── Toggle Group (chart + analysis accordion) ─── */
function toggleIaGroup(arg) {
  const divId = typeof arg === 'string' ? arg : (this.getAttribute('data-args') || '');
  if (!divId) return;
  const body = document.getElementById(divId);
  const chev = document.getElementById('chev_' + divId);
  if (!body) return;
  const show = body.style.display === 'none';
  body.style.display = show ? '' : 'none';
  if (chev) chev.style.transform = show ? 'rotate(180deg)' : '';
}

/* --- Group Narrative Analysis (bullet-point Arabic text + contextual domain analysis) --- */
function _iaRenderGroupAnalysis(divId, p1Data, p2Data, cols, label, lP1, lP2) {
  const el = document.getElementById(divId);
  if (!el) return;
  const showGrand = document.getElementById('iaShowGrand')?.checked;
  const showGov = document.getElementById('iaShowGov')?.checked;
  const showHosp = document.getElementById('iaShowHosp')?.checked;
  const G = _iaBuildGovGroups(p1Data, p2Data, []);
  const bullets = [];

  for (let ci = 0; ci < cols.length; ci++) {
    const col = cols[ci];
    if (_iaIsFormula(col.key)) continue;
    const colBullets = [];

    /* --- Grand total --- */
    if (showGrand) {
      let s1 = 0, s2 = 0;
      for (let i = 0; i < p1Data.length; i++) s1 += (Number(p1Data[i].data?.[col.key]) || 0);
      for (let i = 0; i < p2Data.length; i++) s2 += (Number(p2Data[i].data?.[col.key]) || 0);
      const diff = s2 - s1;
      const dir = diff > 0 ? 'ارتفاع' : (diff < 0 ? 'انخفاض' : 'ثبات');
      const pct = s1 ? (((s2 - s1) / s1) * 100).toFixed(1) : (s2 ? '-' : '0');
      const sign = diff > 0 ? '+' : '';
      colBullets.push(col.label + ' — الإجمالي: ' + _iaFmt(s1) + ' ← ' + _iaFmt(s2) + ' (' + dir + ' ' + _iaFmt(Math.abs(diff)) + (pct !== '0' ? ' بنسبة ' + sign + pct + '%' : '') + ')');
    }

    /* --- Governorate totals --- */
    if (showGov) {
      const govArr = Array.from(G.govG);
      const govResults = [];
      for (let gi = 0; gi < govArr.length; gi++) {
        const govName = govArr[gi][0], hosps = govArr[gi][1];
        let sum1 = 0, sum2 = 0;
        for (let hi = 0; hi < hosps.length; hi++) {
          const d1raw = G.p1M.get(hosps[hi].hid) || {}, d2raw = G.p2M.get(hosps[hi].hid) || {};
          sum1 += Number(d1raw[col.key]) || 0;
          sum2 += Number(d2raw[col.key]) || 0;
        }
        if (sum1 !== 0 || sum2 !== 0) {
          govResults.push({ name: govName, v1: sum1, v2: sum2 });
        }
      }
      if (govResults.length) {
        govResults.sort(function(a, b) { return b.v2 - a.v2; });
        const parts = [];
        for (let gi = 0; gi < govResults.length; gi++) {
          const g = govResults[gi];
          const d = g.v2 - g.v1;
          const arrow = d > 0 ? '▲' : (d < 0 ? '▼' : '=');
          parts.push(g.name + ' ' + _iaFmt(g.v2) + ' ' + arrow);
        }
        colBullets.push(col.label + ' — المحافظات: ' + parts.join(' | '));
      }
    }

    /* --- Hospital breakdown with intra-governorate comparison --- */
    if (showHosp) {
      const govArr = Array.from(G.govG);
      for (let gi = 0; gi < govArr.length; gi++) {
        const govName = govArr[gi][0], hosps = govArr[gi][1];
        const vals = [];
        for (let hi = 0; hi < hosps.length; hi++) {
          const h = hosps[hi];
          const d1raw = G.p1M.get(h.hid) || {}, d2raw = G.p2M.get(h.hid) || {};
          const v1 = Number(d1raw[col.key]) || 0, v2 = Number(d2raw[col.key]) || 0;
          if (v1 !== 0 || v2 !== 0) vals.push({ name: h.name, v1: v1, v2: v2 });
        }
        if (vals.length) {
          vals.sort(function(a, b) { return b.v2 - a.v2; });
          const parts = [];
          for (let vi = 0; vi < vals.length; vi++) {
            const v = vals[vi];
            const d = v.v2 - v.v1;
            let dirStr = '';
            if (d > 0) dirStr = ' ▲' + v.v1 + '→' + v.v2;
            else if (d < 0) dirStr = ' ▼' + v.v1 + '→' + v.v2;
            else if (v.v1 === v.v2 && v.v1 > 0) dirStr = ' =' + _iaFmt(v.v1);
            parts.push('#' + (vi + 1) + ' ' + v.name + ' ' + _iaFmt(v.v2) + dirStr);
          }
          colBullets.push(col.label + ' — ' + govName + ': ' + parts.join(' | '));
        }
      }
    }

    for (let bi = 0; bi < colBullets.length; bi++) bullets.push(colBullets[bi]);
    if (colBullets.length) bullets.push('');
  }

  /* ===== Contextual Domain Analysis ===== */
  const ctxBullets = [];
  const ctxGroups = new Set(cols.map(function(c) { return c.g || ''; }));

  function _ctxSum(dataArr, key) {
    let s = 0;
    dataArr.forEach(function(h) { s += Number((h.data || {})[key]) || 0; });
    return s;
  }
  function _ctxAggFormulas(dataArr, cardType) {
    const agg = {};
    dataArr.forEach(function(h) {
      const d = h.data || {};
      for (const k in d) {
        if (_iaIsFormula(k)) continue;
        if (typeof d[k] === 'number') agg[k] = (agg[k] || 0) + d[k];
      }
    });
    if (cardType === 'big' || cardType === 'small') {
      const f = _iaRecomputeFormulas(agg, cardType);
      for (const k in f) agg[k] = f[k];
    }
    return agg;
  }

  /* ===== الفصائل والتوافق ===== */
  if (ctxGroups.has('الفصائل والتوافق')) {
    const ctKey = cols.some(function(c) { return c.key === 'child_ct'; }) ? 'child_ct' : 'ct';
    const compatKey = ctKey === 'child_ct' ? 'child_compatibility' : 'compatibility';
    const bgKey = ctKey === 'child_ct' ? 'child_blood_groups' : 'blood_groups';
    const isChild = ctKey === 'child_ct';
    function _ctxOutVal(d) {
      if (isChild) return Number(d.child_out_blood) || 0;
      return (Number(d.out_blood_int)||0) + (Number(d.out_blood_branch)||0) + (Number(d.out_blood_auth)||0) + (Number(d.out_blood_ext)||0);
    }
    const hasCt = cols.some(function(c) { return c.key === 'ct' || c.key === 'child_ct'; });
    const hasCompat = cols.some(function(c) { return c.key === 'compatibility' || c.key === 'child_compatibility'; });
    const hasBgroups = cols.some(function(c) { return c.key === 'blood_groups' || c.key === 'child_blood_groups'; });

    if (hasCt) {
      /* Hospital-level C/T analysis */
      if (showHosp) {
        const lowCtHosps = [], okCtHosps = [];
        const govArr2 = Array.from(G.govG);
        for (let gi = 0; gi < govArr2.length; gi++) {
          const hosps2 = govArr2[gi][1];
          for (let hi = 0; hi < hosps2.length; hi++) {
            const h = hosps2[hi];
            const d2 = G.p2M.get(h.hid) || {};
            const compatVal = Number(d2[compatKey]) || 0;
            const outVal = _ctxOutVal(d2);
            if (compatVal === 0 && outVal === 0) continue;
            const ctCalc = outVal ? (compatVal / outVal) : 0;
            if (ctCalc < 2) lowCtHosps.push({ name: h.name, gov: govArr2[gi][0], ct: ctCalc });
            else okCtHosps.push({ name: h.name, gov: govArr2[gi][0], ct: ctCalc });
          }
        }
        if (lowCtHosps.length) {
          const lowNames = lowCtHosps.map(function(h) { return h.name + ' (' + h.ct.toFixed(2) + ')'; }).join('\u060c ');
          ctxBullets.push('نسبة C/T أقل من 2 في ' + lowCtHosps.length + ' مستشفى: ' + lowNames + ' \u2014 يُنصح بمراجعة سياسة الصرف والتوافق');
        }
        if (okCtHosps.length) {
          ctxBullets.push('نسبة C/T مقبولة (2 أو أعلى) في ' + okCtHosps.length + ' مستشفى \u2014 الأداء مقبول');
        }
      }

      /* Governorate-level C/T analysis */
      if (showGov && !showHosp) {
        const govArr3 = Array.from(G.govG);
        for (let gi = 0; gi < govArr3.length; gi++) {
          const govName2 = govArr3[gi][0], hosps3 = govArr3[gi][1];
          let gCp2 = 0, gOt2 = 0;
          for (let hi = 0; hi < hosps3.length; hi++) {
            const d2 = G.p2M.get(hosps3[hi].hid) || {};
            gCp2 += Number(d2[compatKey]) || 0; gOt2 += _ctxOutVal(d2);
          }
          const ctGov2 = gOt2 ? (gCp2 / gOt2) : 0;
          if (ctGov2 > 0 && ctGov2 < 2) ctxBullets.push('نسبة C/T في ' + govName2 + ' = ' + ctGov2.toFixed(2) + ' (أقل من 2) في ' + lP2);
          else if (ctGov2 >= 2) ctxBullets.push('نسبة C/T في ' + govName2 + ' = ' + ctGov2.toFixed(2) + ' (مقبولة) في ' + lP2);
        }
      }

      /* Grand total C/T analysis */
      if (showGrand) {
        const tc1 = _ctxSum(p1Data, compatKey);
        let to1 = 0;
        const tc2 = _ctxSum(p2Data, compatKey);
        let to2 = 0;
        for (let ti = 0; ti < p1Data.length; ti++) to1 += _ctxOutVal(p1Data[ti].data || {});
        for (let ti = 0; ti < p2Data.length; ti++) to2 += _ctxOutVal(p2Data[ti].data || {});
        const ctG1 = to1 ? (tc1 / to1) : 0;
        const ctG2 = to2 ? (tc2 / to2) : 0;
        if (ctG2 > 0 && ctG2 < 1) ctxBullets.push('نسبة C/T الإجمالية في ' + lP2 + ' = ' + ctG2.toFixed(2) + ' \u2014 أقل من 1: صرف زائد جداً عن التوافق');
        else if (ctG2 >= 1 && ctG2 < 2) ctxBullets.push('نسبة C/T الإجمالية في ' + lP2 + ' = ' + ctG2.toFixed(2) + ' \u2014 أقل من 2: يُنصح بمراجعة كمية الصرف');
        else if (ctG2 >= 2) ctxBullets.push('نسبة C/T الإجمالية في ' + lP2 + ' = ' + ctG2.toFixed(2) + ' \u2014 مقبولة (2 أو أعلى)');
        if (ctG1 > 0 && ctG2 > 0) {
          const ctDiff = ctG2 - ctG1;
          if (ctDiff > 0.1) ctxBullets.push('تحسن نسبة C/T من ' + ctG1.toFixed(2) + ' في ' + lP1 + ' إلى ' + ctG2.toFixed(2) + ' في ' + lP2);
          else if (ctDiff < -0.1) ctxBullets.push('تدهور نسبة C/T من ' + ctG1.toFixed(2) + ' في ' + lP1 + ' إلى ' + ctG2.toFixed(2) + ' في ' + lP2);
        }
      }
    }

    /* Compatibility rate analysis */
    if (hasCompat && hasBgroups) {
      if (showGrand) {
        const tBg1 = _ctxSum(p1Data, bgKey), tCp1 = _ctxSum(p1Data, compatKey);
        const tBg2 = _ctxSum(p2Data, bgKey), tCp2 = _ctxSum(p2Data, compatKey);
        const r1 = tBg1 ? ((tCp1 / tBg1) * 100).toFixed(1) : '0';
        const r2 = tBg2 ? ((tCp2 / tBg2) * 100).toFixed(1) : '0';
        ctxBullets.push('نسبة التوافق من الفصائل المفحوصة: ' + r2 + '% في ' + lP2 + ' مقارنة بـ ' + r1 + '% في ' + lP1);
        if (Number(r2) < 80) ctxBullets.push('نسبة التوافق أقل من 80% \u2014 يُنصح بمراجعة طرق الفحص والتوافق');
        else if (Number(r2) >= 95) ctxBullets.push('نسبة التوافق 95% أو أعلى \u2014 أداء ممتاز');
      }
    }
  }

  /* ===== منصرف الفصائل (disp blood types) ===== */
  if (label === 'منصرف الفصائل') {
    const dispKeys = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];
    if (showGrand) {
      const t1 = {}, t2 = {};
      dispKeys.forEach(function(k) { t1[k] = _ctxSum(p1Data, k); t2[k] = _ctxSum(p2Data, k); });
      let gT1 = 0, gT2 = 0;
      dispKeys.forEach(function(k) { gT1 += t1[k]; gT2 += t2[k]; });
      if (gT2 > 0) {
        const sorted2 = dispKeys.slice().sort(function(a, b) { return t2[b] - t2[a]; });
        ctxBullets.push('أكثر فصيلة منصرف في ' + lP2 + ': ' + sorted2[0] + ' (' + _iaFmt(t2[sorted2[0]]) + ' وحدة = ' + ((t2[sorted2[0]]/gT2)*100).toFixed(1) + '%)');
        const last = sorted2[sorted2.length - 1];
        ctxBullets.push('أقل فصيلة منصرف في ' + lP2 + ': ' + last + ' (' + _iaFmt(t2[last]) + ' وحدة = ' + ((t2[last]/gT2)*100).toFixed(1) + '%)');
      }
      /* Positive vs Negative ratio */
      const posT = ['A+','B+','O+','AB+'], negT = ['A-','B-','O-','AB-'];
      const pT2 = posT.reduce(function(s,k){return s+t2[k];},0), nT2 = negT.reduce(function(s,k){return s+t2[k];},0);
      if (pT2 + nT2 > 0) ctxBullets.push('النسبة المئوية للسالب في ' + lP2 + ': ' + ((nT2/(pT2+nT2))*100).toFixed(1) + '% من إجمالي الصرف (' + _iaFmt(nT2) + ' من ' + _iaFmt(pT2+nT2) + ')');
      /* Per-type changes */
      dispKeys.forEach(function(k) {
        const v1 = t1[k], v2 = t2[k];
        if (v1 === 0 && v2 === 0) return;
        const d = v2 - v1;
        if (Math.abs(d) < 1) return;
        const pctCh = v1 ? ((d / v1) * 100).toFixed(0) : null;
        const dir = d > 0 ? 'ارتفاع' : 'انخفاض';
        const detail = pctCh ? ' بنسبة ' + (d > 0 ? '+' : '') + pctCh + '%' : '';
        ctxBullets.push(dir + ' منصرف ' + k + ' من ' + _iaFmt(v1) + ' إلى ' + _iaFmt(v2) + detail);
      });
    }
    if (showGov && !showHosp) {
      const dk2 = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];
      const gArr4 = Array.from(G.govG);
      for (let gi = 0; gi < gArr4.length; gi++) {
        const gN = gArr4[gi][0], hs4 = gArr4[gi][1];
        const gT = {}; dk2.forEach(function(k){gT[k]=0;}); let gG = 0;
        for (let hi = 0; hi < hs4.length; hi++) {
          const d2 = G.p2M.get(hs4[hi].hid) || {};
          dk2.forEach(function(k){const v=Number(d2[k])||0; gT[k]+=v; gG+=v;});
        }
        if (gG === 0) continue;
        const mx = dk2.reduce(function(a,b){return gT[a]>=gT[b]?a:b;});
        const mn = dk2.reduce(function(a,b){return gT[a]<=gT[b]?a:b;});
        ctxBullets.push(gN + ': أكثر فصيلة ' + mx + ' (' + _iaFmt(gT[mx]) + ') وأقل فصيلة ' + mn + ' (' + _iaFmt(gT[mn]) + ')');
      }
    }
    if (showHosp) {
      const dk3 = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];
      const hAlerts = [];
      const gArr5 = Array.from(G.govG);
      for (let gi = 0; gi < gArr5.length; gi++) {
        const hs5 = gArr5[gi][1];
        for (let hi = 0; hi < hs5.length; hi++) {
          const h2 = hs5[hi];
          const d2 = G.p2M.get(h2.hid) || {};
          let total = 0; dk3.forEach(function(k){total+=Number(d2[k])||0;});
          if (total === 0) continue;
          const zeros = dk3.filter(function(k){return (Number(d2[k])||0)===0;});
          if (zeros.length >= 3) hAlerts.push(h2.name + ' (' + zeros.join('/') + ' = 0)');
        }
      }
      if (hAlerts.length) ctxBullets.push('مستشفيات بها 3 فصائل أو أكثر منصرفها صفر: ' + hAlerts.join('\u060c '));
    }
  }

  /* ===== إجمالي المنصرف ===== */
  if (ctxGroups.has('إجمالي المنصرف')) {
    if (showGrand) {
      const hasBlood = cols.some(function(c){return c.key==='out_blood'||c.key==='out_blood_int';});
      const hasPlasma = cols.some(function(c){return c.key==='out_plasma'||c.key==='out_plasma_int';});
      if (hasBlood && hasPlasma) {
        const bk2 = cols.some(function(c){return c.key==='out_blood_int';}) ? 'out_blood_int' : 'out_blood';
        const pk2 = cols.some(function(c){return c.key==='out_plasma_int';}) ? 'out_plasma_int' : 'out_plasma';
        const tb1 = _ctxSum(p1Data, bk2), tp1 = _ctxSum(p1Data, pk2);
        const tb2 = _ctxSum(p2Data, bk2), tp2 = _ctxSum(p2Data, pk2);
        const totO2 = tb2 + tp2;
        if (totO2 > 0) ctxBullets.push('توزيع الصرف في ' + lP2 + ': دم ' + ((tb2/totO2)*100).toFixed(1) + '% (' + _iaFmt(tb2) + ') | بلازما ' + ((tp2/totO2)*100).toFixed(1) + '% (' + _iaFmt(tp2) + ')');
      }
    }
  }

  /* ===== إجمالي الوارد ===== */
  if (ctxGroups.has('إجمالي الوارد')) {
    if (showGrand) {
      const hasIncBlood = cols.some(function(c){return c.key==='inc_blood';});
      const hasIncPlasma = cols.some(function(c){return c.key==='inc_plasma';});
      if (hasIncBlood && hasIncPlasma) {
        const ib2 = _ctxSum(p2Data, 'inc_blood'), ip2 = _ctxSum(p2Data, 'inc_plasma');
        const is2 = _ctxSum(p2Data, 'inc_sdp');
        const totIn2 = ib2 + ip2 + is2;
        if (totIn2 > 0) ctxBullets.push('توزيع الوارد في ' + lP2 + ': دم ' + ((ib2/totIn2)*100).toFixed(1) + '% | بلازما ' + ((ip2/totIn2)*100).toFixed(1) + '% | SDP ' + ((is2/totIn2)*100).toFixed(1) + '%');
      }
      const hasIncCollect = cols.some(function(c){return c.key==='inc_collected';});
      if (hasIncCollect) {
        const ic2 = _ctxSum(p2Data, 'inc_collected');
        const ir2 = _ctxSum(p2Data, 'inc_regional');
        const totI2 = ic2 + ir2;
        if (totI2 > 0) ctxBullets.push(' مصدر الوارد في ' + lP2 + ': تجميعي ' + ((ic2/totI2)*100).toFixed(1) + '% (' + _iaFmt(ic2) + ') | إقليمي ' + ((ir2/totI2)*100).toFixed(1) + '% (' + _iaFmt(ir2) + ')');
      }
    }
  }

  /* ===== الإعدامات ===== */
  if (ctxGroups.has('الإعدامات')) {
    if (showGrand) {
      const expKeys = ['disp_exp_blood','disp_exp_plasma','disp_exp_sdp','disp_exp_rdp'];
      const expLbl = {'disp_exp_blood':'دم','disp_exp_plasma':'بلازما','disp_exp_sdp':'SDP','disp_exp_rdp':'RDP'};
      const hasExp = expKeys.some(function(k){return cols.some(function(c){return c.key===k;});});
      if (hasExp) {
        let totE2 = 0; expKeys.forEach(function(k){totE2+=_ctxSum(p2Data,k);});
        if (totE2 > 0) {
          const ep = [];
          expKeys.forEach(function(k){const v=_ctxSum(p2Data,k);if(v>0)ep.push(expLbl[k]+' '+_iaFmt(v)+' ('+((v/totE2)*100).toFixed(1)+'%)');});
          ctxBullets.push('توزيع الإعدامات في ' + lP2 + ': ' + ep.join(' | '));
        }
      }
      const hasViral = cols.some(function(c){return c.key==='virology_c';});
      if (hasViral) {
        const vc=_ctxSum(p2Data,'virology_c'),vb=_ctxSum(p2Data,'virology_b');
        const vi=_ctxSum(p2Data,'virology_i'),vd=_ctxSum(p2Data,'virology_dollar');
        const vtot=vc+vb+vi+vd;
        if (vtot > 0) {
          ctxBullets.push('إجمالي الإعدامات الفيروسية في ' + lP2 + ': C=' + _iaFmt(vc) + ' (' + ((vc/vtot)*100).toFixed(1) + '%) | B=' + _iaFmt(vb) + ' (' + ((vb/vtot)*100).toFixed(1) + '%) | I=' + _iaFmt(vi) + ' (' + ((vi/vtot)*100).toFixed(1) + '%) | $=' + _iaFmt(vd) + ' (' + ((vd/vtot)*100).toFixed(1) + '%)');
          if (vc > vb * 2) ctxBullets.push('فيروس C متفوق على B بمرتين أو أكثر \u2014 يُنصح بمراجعة مصادر التلوث');
        }
      }
    }
  }

  /* ===== تحليل نسب المؤشرات ===== */
  if (ctxGroups.has('تحليل نسب المؤشرات')) {
    if (showGrand) {
      const ratioKeys = ['ratio_uncompleted','ratio_refused','ratio_c','ratio_b','ratio_i','ratio_dollar','ratio_exp','ratio_returned','ratio_reaction','ratio_open','ratio_other'];
      const ratioLbl = {'ratio_uncompleted':'لم يكتمل','ratio_refused':'مرفوضة','ratio_c':'فيروس C','ratio_b':'فيروس B','ratio_i':'فيروس I','ratio_dollar':'فيروس $','ratio_exp':'انتهاء الصلاحية','ratio_returned':'مرتجع','ratio_reaction':'تفاعل','ratio_open':'نظام مفتوح','ratio_other':'أخرى'};
      const hasRatio = ratioKeys.some(function(k){return cols.some(function(c){return c.key===k;});});
      if (hasRatio) {
        const aggP2 = _ctxAggFormulas(p2Data, 'big');
        let maxR = 0, maxK = '', totR = 0;
        ratioKeys.forEach(function(k){const v=Number(aggP2[k])||0;totR+=v;if(v>maxR){maxR=v;maxK=k;}});
        if (maxK && totR > 0) ctxBullets.push('أعلى نسبة إعدام في ' + lP2 + ': ' + ratioLbl[maxK] + ' (' + _iaFmt(maxR) + '% = ' + ((maxR/totR)*100).toFixed(1) + '% من الإجمالي)');
        const coll2 = Number(aggP2.collect_total)||0, test2 = Number(aggP2.tested)||0;
        const ref2 = (Number(aggP2.refused_fatty)||0)+(Number(aggP2.refused_icteric)||0);
        const unc2 = Number(aggP2.uncompleted)||0, thr2 = Number(aggP2.donation_therapeutic)||0;
        const totReject = ref2+unc2+thr2;
        if (coll2 > 0) ctxBullets.push('نسبة عدم الفحص من التجميع: ' + ((totReject/coll2)*100).toFixed(1) + '% (' + _iaFmt(totReject) + ' من ' + _iaFmt(coll2) + ')');
        const vC=Number(aggP2.virology_c)||0,vB=Number(aggP2.virology_b)||0,vI=Number(aggP2.virology_i)||0,vD=Number(aggP2.virology_dollar)||0;
        const totVirus=vC+vB+vI+vD;
        if (test2 > 0 && totVirus > 0) ctxBullets.push('نسبة الإيجابية الفيروسية من المفحوص: ' + ((totVirus/test2)*100).toFixed(1) + '% (' + _iaFmt(totVirus) + ' من ' + _iaFmt(test2) + ')');
      }
    }
  }

  /* ===== عينات غير مفحوصة ===== */
  if (ctxGroups.has('عينات غير مفحوصة')) {
    if (showGrand) {
      const unKeys = ['donation_therapeutic','uncompleted','refused_fatty','refused_icteric'];
      const unLbl = {'donation_therapeutic':'تبرع علاجي','uncompleted':'لم يكتمل','refused_fatty':'دهون','refused_icteric':'Icteric'};
      let totUn = 0;
      unKeys.forEach(function(k){totUn+=_ctxSum(p2Data,k);});
      if (totUn > 0) {
        let maxU = 0, maxUK = '';
        unKeys.forEach(function(k){const v=_ctxSum(p2Data,k);if(v>maxU){maxU=v;maxUK=k;}});
        ctxBullets.push('أكبر سبب عدم الفحص في ' + lP2 + ': ' + unLbl[maxUK] + ' (' + _iaFmt(maxU) + ' = ' + ((maxU/totUn)*100).toFixed(1) + '%)');
      }
    }
  }

  /* ===== نسب الإعدامات (percentages) ===== */
  if (ctxGroups.has('النسب المئوية للاعدام') || ctxGroups.has('النسب المئوية للاعدام - أطفال')) {
    if (showGrand) {
      const pctCols = cols.filter(function(c){return c.key.startsWith('pct_')||c.key.startsWith('child_pct_');});
      if (pctCols.length) {
        const pctType = cols.some(function(c){return c.key.startsWith('ratio_');}) ? 'big' : 'small';
        const aggPct = _ctxAggFormulas(p2Data, pctType);
        let maxP = 0, maxPC = null;
        pctCols.forEach(function(c){const v=Number(aggPct[c.key])||0;if(v>maxP){maxP=v;maxPC=c;}});
        if (maxPC) ctxBullets.push('أعلى نسبة إعدام في ' + lP2 + ': ' + maxPC.label + ' (' + maxP.toFixed(2) + '%)');
      }
    }
  }

  /* ===== مؤشرات وحدات دم الأطفال ===== */
  if (ctxGroups.has('مؤشرات وحدات دم الأطفال')) {
    const hasChildCt = cols.some(function(c){return c.key==='child_ct';});
    if (hasChildCt && showGrand) {
      const cCp = _ctxSum(p2Data, 'child_compatibility');
      const cOt = _ctxSum(p2Data, 'child_out_blood');
      const cCt = cOt ? (cCp / cOt) : 0;
      if (cCt < 2) ctxBullets.push('نسبة C/T للأطفال في ' + lP2 + ' = ' + cCt.toFixed(2) + ' \u2014 أقل من 2: يُنصح بمراجعة سياسة الصرف');
      else ctxBullets.push('نسبة C/T للأطفال في ' + lP2 + ' = ' + cCt.toFixed(2) + ' \u2014 مقبولة');
    }
  }

  /* ===== Render HTML ===== */
  let html = '<div style="padding:16px 20px"><div style="font-weight:700;font-size:13px;color:#333;margin-bottom:10px;padding-bottom:8px;border-bottom:2px solid var(--border)"><i class="fa-solid fa-magnifying-glass-chart" style="margin-left:6px;color:#e65100"></i>تحليل ' + esc(label) + '</div>';
  if (ctxBullets.length) {
    html += '<div style="margin-bottom:12px;padding:10px 14px;background:#fff8e1;border:1px solid #ffe082;border-radius:8px;font-size:12px;color:#f57f17;font-weight:600"><i class="fa-solid fa-lightbulb" style="margin-left:6px"></i> تحليل خاص بالمجموعات</div>';
    html += '<ul style="margin:0;padding-right:20px;list-style:none">';
    for (let i = 0; i < ctxBullets.length; i++) {
      html += '<li style="padding:5px 0;border-bottom:1px solid rgba(0,0,0,.04);font-size:13px;line-height:1.9;color:#333">\u2022 ' + esc(ctxBullets[i]) + '</li>';
    }
    html += '</ul>';
  }
  if (bullets.length) {
    if (ctxBullets.length) html += '<div style="margin-top:10px;padding:6px 12px;background:#e8f5e9;border:1px solid #a5d6a7;border-radius:6px;font-size:11px;color:#2e7d32;font-weight:600"><i class="fa-solid fa-chart-line" style="margin-left:4px"></i> تفاصيل التغييرات</div>';
    html += '<ul style="margin:0;padding-right:20px;list-style:none">';
    let prevField = '';
    for (let i = 0; i < bullets.length; i++) {
      if (bullets[i] === '') {
        html += '<li style="height:1px;background:linear-gradient(to right,transparent,rgba(0,0,0,.08),transparent);margin:4px 0;list-style:none;border:none"></li>';
        continue;
      }
      const curField = bullets[i].split(' — ')[0];
      if (curField !== prevField && prevField !== '') {
        html += '<li style="height:6px;list-style:none;border:none"></li>';
      }
      prevField = curField;
      html += '<li style="font-size:13px;line-height:1.9;color:#37474f;padding:1px 0">\u2022 ' + esc(bullets[i]) + '</li>';
    }
    html += '</ul>';
  }
  if (!ctxBullets.length && !bullets.length) {
    html += '<div style="padding:20px;text-align:center;color:#999;font-size:12px">لا توجد تغييرات بين الفترةتين</div>';
  }
  html += '</div>';
  el.innerHTML = html;
}

/* ================= أكياس الدم — التتبع الكامل ================= */
const _bb = { hospitals: [], bags: [], patients: [], reservations: [], departments: [], user: null, tab: 'dash', tTab: null, cTab: null, rowN: 0, selPatient: null, selBagIds: [], lastFilteredBags: [], lastFilteredInLog: [], lastFilteredBagReport: [], lastExpLog: [], lastDispLog: [], lastMonthly: null, selResPatient: null, selResv: null, lastResLog: [], barPat: {}, barTyped: {}, histHidden: false, statsSel: '' };
const BB_BTYPES_CLI = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const BB_BTYPES_SIMPLE = ['A','B','O','AB'];
const BB_PRODUCT_TYPES = ['دم','دم كلي','بلازما','صفائح SDP','صفائح RDP','كرايو'];
const BB_PROD_STYLE = { 'دم': { c: '#c0392b', i: 'fa-droplet' }, 'دم كلي': { c: '#c0392b', i: 'fa-droplet' }, 'بلازما': { c: '#16a085', i: 'fa-fill-drip' }, 'صفائح SDP': { c: '#8e44ad', i: 'fa-layer-group' }, 'صفائح RDP': { c: '#8e44ad', i: 'fa-layer-group' }, 'كرايو': { c: '#d35400', i: 'fa-snowflake' } };
const BB_UNIT_PRODUCTS = ['صفائح SDP', 'صفائح RDP'];
const BB_ST_LABELS = {
  collected: 'تم التجميع', incomplete: 'لم يكتمل', therapeutic: 'تبرع علاجي', fatty: 'دهون', icteric: 'صفراء',
  lipemic: 'Lipemic plasma', hemolyzed: 'Hemolyzed plasma',
  positive: 'إيجابي فيروس', available: 'متاح', returned: 'مرتجع', dispatched: 'مُرسل', reserved: 'محجوز',
  issued: 'مُصرف', reaction: 'تفاعل', disposed: 'مُعدَم'
};
const BB_ST_COLORS = {
  collected: '#0d7377', incomplete: '#e67e22', therapeutic: '#8e44ad', fatty: '#d4ac0d', icteric: '#c0392b',
  lipemic: '#b7950b', hemolyzed: '#7f8c8d',
  positive: '#c0392b', available: '#27ae60', returned: '#2e86c1', dispatched: '#6c3483', reserved: '#f39c12',
  issued: '#16a085', reaction: '#e74c3c', disposed: '#7f8c8d'
};
const BB_ISSUE_TYPES_CLI = ['داخلي','فرع','هيئة','خارجي'];
const BB_MONTHS_AR = ['يناير','فبراير','مارس','ابريل','مايو','يونيو','يوليو','اغسطس','سبتمبر','اكتوبر','نوفمبر','ديسمبر'];
const BB_COMPAT_CLI = {
  'O-': ['O-'], 'O+': ['O+', 'O-'], 'A-': ['A-', 'O-'], 'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'], 'B+': ['B+', 'B-', 'O+', 'O-'], 'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-']
};
function bbCanDonateTo(donorBt, recipientBt) {
  if (!donorBt || !recipientBt) return null;
  const list = BB_COMPAT_CLI[recipientBt];
  if (!list) return donorBt === recipientBt;
  return list.indexOf(donorBt) !== -1;
}
function bbDonorsFor(recipientBt) { return BB_BTYPES_CLI.filter(bt => bbCanDonateTo(bt, recipientBt)); }

async function bbHospitals() {
  try { _bb.hospitals = await api('GET', '/hospitals'); } catch (e) {}
  return _bb.hospitals;
}
function bbStBadge(st) { const c = BB_ST_COLORS[st] || '#95a5a6'; return `<span style="display:inline-block;padding:2px 10px;border-radius:20px;background:${c}22;color:${c};font-size:11px;font-weight:700">${esc(BB_ST_LABELS[st] || st)}</span>`; }
function bbDaysBadge(days) {
  if (days === null || days === undefined) return '<span style="color:#999">—</span>';
  if (days < 0) return `<span style="color:#fff;background:#e74c3c;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700">منتهي</span>`;
  if (days <= 10) return `<span style="color:#fff;background:#f39c12;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700">${days} يوم</span>`;
  return `<span style="color:#27ae60">${days} يوم</span>`;
}
function bbSelHospFilter(list) {
  const u = _bb.user;
  if (u && (u.role === 'hospital' || u.role === 'hospital_manager')) return list.filter(h => h.id === u.hospitalId);
  if (u && u.role === 'branch_supervisor') return list.filter(h => h.governorate === u.governorate);
  return list;
}
function bbOptHosp(sel, filterType) {
  let list = bbSelHospFilter(_bb.hospitals);
  if (filterType) list = list.filter(h => !filterType || h.type === filterType);
  return `<option value="">— اختر بنك الدم —</option>` + list.map(h => `<option value="${h.id}" ${sel === h.id ? 'selected' : ''}>${esc(h.name)}</option>`).join('');
}
function bbOptTargetHosp(sel, gov) {
  let list = _bb.hospitals;
  const my = _bb.user && _bb.user.hospitalId;
  if (my) list = list.filter(h => h.id !== my);
  if (gov) list = list.filter(h => h.governorate === gov);
  return `<option value="">— اختر بنك الدم —</option>` + list.map(h => `<option value="${h.id}" ${sel === h.id ? 'selected' : ''}>${esc(h.name)}</option>`).join('');
}
function bbOptGov(sel, fromBank) {
  const allGovs = [...new Set((_bb.hospitals || []).map(h => h.governorate).filter(Boolean))];
  let govs;
  if (fromBank && fromBank.type === 'تخزيني' && fromBank.governorate) {
    govs = [fromBank.governorate];
  } else {
    govs = allGovs;
  }
  const def = fromBank && fromBank.governorate ? fromBank.governorate : '';
  const preselect = sel || def;
  govs.sort((a, b) => {
    let ia = GOV_ORDER.indexOf(a), ib = GOV_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b, 'ar');
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  return `<option value="">— اختر الفرع —</option>` + govs.map(g => `<option value="${g}" ${preselect === g ? 'selected' : ''}>${esc(g)}</option>`).join('');
}
function bbDispFromChanged() {
  const from = document.getElementById('bbDispFrom');
  const gov = document.getElementById('bbDispGov');
  if (!from || !gov) return;
  const bank = (from.value && (_bb.hospitals || []).find(h => h.id == from.value)) || null;
  gov.innerHTML = bbOptGov('', bank);
  bbDispGovChanged();
  bbRenderDisp();
}
function bbDispGovChanged() {
  const gov = document.getElementById('bbDispGov');
  const to = document.getElementById('bbDispTo');
  if (!gov || !to) return;
  if (!gov.value) { to.innerHTML = `<option value="">— اختر الفرع أولاً —</option>`; return; }
  to.innerHTML = bbOptTargetHosp(null, gov.value);
}
function bbAutoHosp(id) {
  const sel = document.getElementById(id);
  if (!sel) return;
  const u = _bb.user;
  if (!(u && (u.role === 'hospital' || u.role === 'hospital_manager') && u.hospitalId)) return;
  if (sel.value) return;
  const opt = sel.querySelector('option[value="' + u.hospitalId + '"]');
  if (opt) sel.value = u.hospitalId;
}
function bbOptBt(sel, simple) {
  const types = simple ? BB_BTYPES_SIMPLE : BB_BTYPES_CLI;
  return `<option value="">غير محدد</option>` + types.map(t => `<option value="${t}" ${sel === t ? 'selected' : ''}>${t}</option>`).join('');
}
function bbOptProduct(sel) {
  return BB_PRODUCT_TYPES.map(t => `<option value="${t}" ${sel === t ? 'selected' : ''}>${t}</option>`).join('');
}
// منتجات التجميع: دم أو دم كلي أو صفائح فقط — البلازما والكرايو تابعتان للدم وتُفصلان تلقائياً من كيس الدم، فلا تُجمعان منفردتين
function bbOptCollectProduct(sel) {
  return ['دم', 'دم كلي', 'صفائح SDP', 'صفائح RDP'].map(t => `<option value="${t}" ${sel === t ? 'selected' : ''}>${t}</option>`).join('');
}
// فئة الوحدة: كبار / أطفال (تغذي أعمدة child_* في مؤشرات التجميع والتخزين)
function bbCatOpts(sel) {
  const v = sel === 'أطفال' ? 'أطفال' : 'كبار';
  return `<option value="كبار" ${v === 'كبار' ? 'selected' : ''}>كبار</option><option value="أطفال" ${v === 'أطفال' ? 'selected' : ''}>أطفال</option>`;
}
// الفحص لدم فقط: كيس دم (فردي أو قائد التبرع المفصول) أو كيس مستقل (صفائح) — بلازما/كرايو تتبعان نتيجة فحص الدم
function bbCanTest(b) { return !!(b && b.status === 'collected' && ((b.product_type || 'دم') === 'دم' || !b.donation_id)); }
// تغيير الحالة: أي كيس مجمّع (دم / بلازما / كرايو / صفائح) — دم يُعدِم التبرع كاملاً، بلازما وكرايو بسببيّن خاصين، صفائح بأسباب عامة
function bbCanStatus(b) { return !!(b && b.status === 'collected'); }
function bbStOpts(prod) {
  const p = prod || 'دم';
  if (p === 'بلازما' || p === 'كرايو') return ['lipemic', 'hemolyzed'];
  return ['incomplete', 'therapeutic', 'fatty', 'icteric'];
}
function bbProdHasUnits(p) { return BB_UNIT_PRODUCTS.indexOf(p) !== -1; }
// صلاحية الكيس المتوقعة حسب المنتج (أيام): دم ودم كلي 35 / بلازما وكرايو سنة / صفائح 5
const BB_SHELF_DAYS = { 'دم': 35, 'دم كلي': 35, 'بلازما': 365, 'كرايو': 365, 'صفائح SDP': 5, 'صفائح RDP': 5 };
function bbShelfDays(p) { return BB_SHELF_DAYS[p] != null ? BB_SHELF_DAYS[p] : 35; }
function bbAddDays(dateStr, days) {
  let d;
  if (dateStr) {
    d = new Date(String(dateStr).slice(0, 10) + 'T00:00:00');
    if (isNaN(d.getTime())) d = null;
  }
  if (!d) d = getCairoDate();
  d.setDate(d.getDate() + days);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function bbDefaultExpiry(dateStr, productType) {
  return bbAddDays(dateStr, bbShelfDays(productType));
}
/* ==== كارت بيانات المتبرع في التجميع (اختياري): الرقم الطبي → مشتقاته + سجل تبرعاته + فحص + قرار ==== */
const BB_GOV_CODES = { '01':'القاهرة','02':'الجيزة','03':'الإسكندرية','04':'الدقهلية','05':'البحيرة','06':'الإسماعيلية','07':'السويس','08':'الشرقية','09':'بورسعيد','10':'دمياط','11':'كفر الشيخ','12':'الغربية','13':'المنوفية','14':'قنا','15':'أسيوط','16':'سوهاج','17':'المنيا','18':'الأقصر','19':'أسوان','21':'بني سويف','22':'الفيوم','23':'مطروح','24':'شمال سيناء','25':'جنوب سيناء','26':'البحر الأحمر','27':'الوادي الجديد','29':'أكتوبر','31':'الإسكندرية','32':'بني سويف','33':'القاهرة','34':'الإسماعيلية','35':'أسوان','88':'خارج الجمهورية' };
function parseNationalId(id) {
  if (!id || !/^\d{14}$/.test(id)) return null;
  const c = String(id[0]);
  if (c !== '2' && c !== '3') return null;
  const y = (c === '2' ? 1900 : 2000) + parseInt(id.slice(1, 3), 10);
  const m = parseInt(id.slice(3, 5), 10);
  const dd = parseInt(id.slice(5, 7), 10);
  if (!m || m > 12 || !dd || dd > 31) return null;
  const now = getCairoDate();
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < dd)) age--;
  if (age < 0) age = 0;
  return {
    birthDate: y + '-' + String(m).padStart(2, '0') + '-' + String(dd).padStart(2, '0'),
    age,
    governorate: BB_GOV_CODES[id.slice(7, 9)] || 'غير محدد',
    gender: parseInt(id[12], 10) % 2 === 1 ? 'ذكر' : 'أنثى'
  };
}
function bbDonorCardHtml() {
  return `<div class="card" style="margin-bottom:14px;border-right:4px solid #1e8449">
    <div class="card-header" style="padding:10px 16px;display:flex;justify-content:space-between;align-items:center">
      <strong><i class="fas fa-user-injured" style="margin-left:6px"></i> بيانات المتبرع <span style="font-size:11px;color:#c0392b;font-weight:700">(إجباري — الرقم القومي والاسم مطلوبان لفتح إدخال الأكياس)</span></strong>
    </div>
    <div class="card-body" style="padding:10px 16px">
      <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin-bottom:8px">
        <div class="form-group"><label>الرقم الطبي / القومي</label><input class="form-control" type="text" id="bbD_nid" maxlength="14" dir="ltr" placeholder="14 رقم" style="min-width:190px"></div>
        <button class="btn btn-outline" data-click="bbDNidSearch" style="border-color:#1e8449;color:#1e8449"><i class="fas fa-search"></i> بحث</button>
        <button class="btn btn-outline" data-click="bbDNidClear" style="border-color:#7f8c8d;color:#7f8c8d"><i class="fas fa-eraser"></i> مسح</button>
      </div>
      <div id="bbD_derived"></div>
      <div id="bbD_donations"></div>
      <div id="bbD_details" style="display:none">
        <div style="font-size:12px;font-weight:700;color:#1e8449;margin:4px 0"><i class="fas fa-address-card"></i> بيانات المتبرع</div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end">
          <div class="form-group" style="flex:1;min-width:160px"><label>الاسم رباعي</label><input class="form-control" type="text" id="bbD_name" data-input="bbSyncCollectRows"></div>
          <div class="form-group" style="flex:1;min-width:160px"><label>العنوان</label><input class="form-control" type="text" id="bbD_address"></div>
          <div class="form-group" style="flex:1;min-width:130px"><label>الهاتف</label><input class="form-control" type="text" id="bbD_phone" dir="ltr"></div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin-top:6px">
          <div class="form-group" style="flex:1;min-width:160px"><label>السن</label><input class="form-control" type="text" id="bbD_age" readonly style="background:#f4f6f7;color:#7f8c8d"></div>
          <div class="form-group" style="flex:1;min-width:130px"><label>الجنس</label><input class="form-control" type="text" id="bbD_gender" readonly style="background:#f4f6f7;color:#7f8c8d"></div>
          <div class="form-group" style="flex:1;min-width:160px"><label>الفصيلة</label><select class="form-control" id="bbD_bt"><option value="">غير محدد</option>${BB_BTYPES_CLI.map(t => `<option value="${t}">${t}</option>`).join('')}</select></div>
        </div>
        <div id="bbD_cooldown" style="display:none;margin-top:8px;background:#eaf2f8;border:1px solid #aed6f1;border-radius:8px;padding:8px 10px">
          <div style="font-size:12px;font-weight:700;color:#1a5276;margin-bottom:6px"><i class="fas fa-clock"></i> مدة الأمان بين التبرعات</div>
          <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end">
            <div class="form-group" style="flex:1;min-width:150px"><label>تاريخ آخر تبرع</label><input class="form-control" type="text" id="bbD_lastDon" readonly style="background:#f4f6f7;color:#7f8c8d"></div>
            <div class="form-group" style="flex:1;min-width:150px"><label>تاريخ التبرع القادم</label><input class="form-control" type="text" id="bbD_nextDon" readonly style="background:#f4f6f7;color:#7f8c8d"></div>
          </div>
        </div>
      </div>
      
      <div id="bbD_decision" style="display:none;margin-top:8px;background:#fdf6ec;border:1px solid #f0c36d;border-radius:8px;padding:8px 10px">
        <div style="font-size:12px;font-weight:700;color:#7b5e0a;margin-bottom:6px"><i class="fas fa-clipboard-check"></i> قرار التبرع (يُختار يدوياً)</div>
        <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center">
          <label style="display:flex;align-items:center;gap:4px;margin:0;font-weight:400"><input type="radio" name="bbD_decision" id="bbD_now" value="مقبول" checked data-change="bbDDecisionChanged"> <span>مقبول</span></label>
          <label style="display:flex;align-items:center;gap:4px;margin:0;font-weight:400"><input type="radio" name="bbD_decision" id="bbD_defer" value="موجل" data-change="bbDDecisionChanged"> <span>موجل</span></label>
          <label style="display:flex;align-items:center;gap:4px;margin:0;font-weight:400"><input type="radio" name="bbD_decision" id="bbD_refused" value="مرفوض" data-change="bbDDecisionChanged"> <span>مرفوض</span></label>
        </div>
        <div id="bbD_deferWrap" style="display:none;margin-top:6px">
          <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end">
            <div class="form-group" style="flex:1;min-width:200px"><label>سبب التأجيل</label><input class="form-control" type="text" id="bbD_deferReason"></div>
            <div class="form-group" style="width:140px"><label>المدة (أيام)</label><input class="form-control" type="number" id="bbD_deferDays" min="1" data-change="bbDDeferDaysChanged"></div>
            <div class="form-group" style="width:150px"><label>تاريخ العودة</label><input class="form-control" type="text" id="bbD_returnDate" readonly style="background:#f4f6f7;color:#7f8c8d"></div>
          </div>
        </div>
        <div id="bbD_refuseWrap" style="display:none;margin-top:6px">
          <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end">
            <div class="form-group" style="flex:1;min-width:240px"><label>سبب الرفض</label><input class="form-control" type="text" id="bbD_refuseReason" placeholder="سبب الرفض (يُمنع المتبرع من التبرع لاحقاً)"></div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}
function bbDReadCard() {
  const dd = document.getElementById('bbD_deferDays');
  const ret = document.getElementById('bbD_returnDate');
  if (dd && ret) { const days = parseInt(dd.value || ''); ret.value = days > 0 ? bbAddDays('', days) : ''; }
}
function bbDDeferDaysChanged() { bbDReadCard(); }
function bbDDecisionChanged() {
  const wrap = document.getElementById('bbD_deferWrap');
  if (!wrap) return;
  const defer = document.getElementById('bbD_defer');
  wrap.style.display = defer && defer.checked ? '' : 'none';
  if (defer && defer.checked) bbDReadCard();
  const rwrap = document.getElementById('bbD_refuseWrap');
  if (rwrap) {
    const refused = document.getElementById('bbD_refused');
    rwrap.style.display = refused && refused.checked ? '' : 'none';
  }
  bbSyncCollectRows();
}
function bbSyncCollectRows() {
  const rows = document.getElementById('bbCollRows');
  if (!rows) return;
  const nid = (document.getElementById('bbD_nid') ? document.getElementById('bbD_nid').value : '').trim();
  const name = (document.getElementById('bbD_name') ? document.getElementById('bbD_name').value : '').trim();
  const now = document.getElementById('bbD_now');
  const ready = /^\d{14}$/.test(nid) && name.length > 0 && !!now && now.checked;
  let hint = document.getElementById('bbCollRowsHint');
  if (ready) {
    rows.style.display = '';
    if (hint) { hint.remove(); hint = null; }
    return;
  }
  rows.style.display = 'none';
  const missing = [];
  if (!/^\d{14}$/.test(nid)) missing.push('الرقم القومي (14 رقم)');
  if (!name.length) missing.push('الاسم رباعي');
  if (!now || !now.checked) missing.push('القرار «مقبول»');
  const msg = '<i class="fas fa-lock" style="margin-left:4px"></i> قائمة إدخال اللي والباركود مقفولة — أكمل: ' + missing.join('، ');
  if (!hint) {
    hint = document.createElement('div');
    hint.id = 'bbCollRowsHint';
    hint.style.cssText = 'background:#fdecea;border:1px solid #e74c3c;color:#c0392b;padding:6px 10px;border-radius:8px;font-size:11px;margin-bottom:8px';
    hint.innerHTML = msg;
    rows.parentNode.insertBefore(hint, rows);
  } else {
    hint.innerHTML = msg;
  }
}
function bbDaysBetween(a, b) {
  const p = s => { const m = String(s).split('-').map(Number); return Date.UTC(m[0], (m[1] || 1) - 1, m[2] || 1); };
  return Math.round((p(b) - p(a)) / 86400000);
}
async function bbDNidSearch() {
  const nid = (document.getElementById('bbD_nid') ? document.getElementById('bbD_nid').value : '').trim();
  const derivedEl = document.getElementById('bbD_derived');
  if (!derivedEl) return;
  if (!/^\d{14}$/.test(nid)) { showToast('❌ الرقم الطبي يجب أن يكون 14 رقماً', 'error'); return; }
  const parsed = parseNationalId(nid);
  if (!parsed) { showToast('❌ رقم طبي غير صالح', 'error'); return; }
  let found = null;
  let donations = [];
  try {
    const r = await api('GET', '/api/donors?q=' + encodeURIComponent(nid));
    const list = (r && r.donors) || [];
    found = list[0] || null;
    if (found) donations = found.donations || [];
  } catch (e) { found = null; }
  if (found && String(found.donor_status) === 'مرفوض') {
    const rr = (donations[0] && donations[0].rejection_reason) || '';
    derivedEl.innerHTML = `<div style="background:#fdecea;border:1px solid #f5b7b1;color:#c0392b;padding:6px 10px;border-radius:8px;font-size:12px;margin-bottom:8px">
      <i class="fas fa-ban" style="margin-left:4px"></i> <b>ممنوع من التبرع</b>${rr ? ' — السبب: ' + esc(rr) : ''}
    </div>`;
    const donationsEl = document.getElementById('bbD_donations');
    if (donationsEl) donationsEl.innerHTML = '';
['bbD_details', 'bbD_decision', 'bbD_cooldown'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
    showToast('❌ المتبرع ممنوع من التبرع', 'error');
    if (_bb) _bb.bannedDonorNid = nid;
    return;
  }
  if (_bb) _bb.bannedDonorNid = null;
  const btLine = found && found.blood_type
    ? ` — الفصيلة: <b style="color:#8e44ad">${esc(found.blood_type)}</b>`
    : (found ? ' — <span style="color:#b7950b">الفصيلة غير محددة بعد (تُسجَّل من الفحص)</span>' : '');
  derivedEl.innerHTML = `<div style="background:#eaf7f0;border:1px solid #a9dfbf;color:#1e8449;padding:6px 10px;border-radius:8px;font-size:12px;margin-bottom:8px">
    <i class="fas fa-id-card" style="margin-left:4px"></i> <b>${esc(parsed.governorate)}</b> — تاريخ الميلاد: <b dir="ltr">${parsed.birthDate}</b> — السن: <b>${parsed.age} سنة</b> — النوع: <b>${parsed.gender}</b>
    ${btLine}
    ${found ? ' — <b>متبرع مسجّل</b> (بياناته مُعبأة)' : ' — <span style="color:#b7950b">متبرع جديد — أدخل بياناته</span>'}
  </div>`;
  const donationsEl = document.getElementById('bbD_donations');
  if (donationsEl) {
    if (donations.length) {
      donationsEl.innerHTML = `<div style="font-size:12px;font-weight:700;color:#1e8449;margin:4px 0"><i class="fas fa-history"></i> سجل التبرعات السابقة (${donations.length})</div>
        <table class="data-table" style="width:100%;font-size:11px;margin-bottom:8px"><thead><tr><th>التاريخ</th><th>القرار</th><th>الملاحظات</th></tr></thead><tbody>
        ${donations.slice(0, 5).map(d => `<tr><td>${esc(String(d.collected_at || d.created_at || '').slice(0, 10))}</td><td>${esc(d.status || 'تبرع')}</td><td>${esc(d.defer_reason || '—')}</td></tr>`).join('')}
        </tbody></table>`;
    } else donationsEl.innerHTML = '';
  }
  const details = document.getElementById('bbD_details');
  const decision = document.getElementById('bbD_decision');
  if (details) {
    details.style.display = '';
    const nameEl = document.getElementById('bbD_name'), addrEl = document.getElementById('bbD_address'), phoneEl = document.getElementById('bbD_phone');
    if (nameEl) nameEl.value = found ? (found.name || '') : '';
    if (addrEl) addrEl.value = found ? (found.address || '') : '';
    if (phoneEl) phoneEl.value = found ? (found.phone || '') : '';
    const ageEl = document.getElementById('bbD_age'), btEl = document.getElementById('bbD_bt'), genderEl = document.getElementById('bbD_gender');
    if (ageEl) ageEl.value = parsed.age;
    if (btEl) btEl.value = found ? (found.blood_type || '') : '';
    if (genderEl) genderEl.value = parsed.gender;
  }
  if (decision) decision.style.display = '';
  const todayStr = fmtCairoDate('date');
  let forceDefer = false;
  let lastDon = '';
  let nextDon = '';
  let autoReason = '';
  let autoDays = 0;
  const cooldownEl = document.getElementById('bbD_cooldown');
  const lastDonEl = document.getElementById('bbD_lastDon');
  const nextDonEl = document.getElementById('bbD_nextDon');
  if (parsed.age < 18) {
    forceDefer = true;
    const by = parseInt(parsed.birthDate.slice(0, 4), 10);
    const bd18 = (by + 18) + parsed.birthDate.slice(4);
    autoDays = Math.max(1, bbDaysBetween(todayStr, bd18));
    autoReason = 'السن أقل من 18 سنة';
  } else if (parsed.age > 60) {
    forceDefer = true;
    autoReason = 'السن أكبر من 60 سنة';
  } else {
    donations.forEach(d => {
      if (String(d.status) === 'مقبول') {
        const dt = String(d.collected_at || d.created_at || '').slice(0, 10);
        if (dt && dt > lastDon) lastDon = dt;
      }
    });
    if (lastDon) {
      nextDon = bbAddDays(lastDon, parsed.gender === 'أنثى' ? 120 : 90);
      if (cooldownEl) cooldownEl.style.display = '';
      if (lastDonEl) lastDonEl.value = lastDon;
      if (nextDonEl) nextDonEl.value = nextDon;
      if (todayStr < nextDon) {
        forceDefer = true;
        autoDays = bbDaysBetween(todayStr, nextDon);
        autoReason = 'لم تمضِ مدة الأمان منذ آخر تبرع';
      }
    } else if (cooldownEl) cooldownEl.style.display = 'none';
  }
  if (forceDefer) {
    const deferEl = document.getElementById('bbD_defer');
    if (deferEl) deferEl.checked = true;
    const deferReasonEl = document.getElementById('bbD_deferReason');
    if (deferReasonEl) deferReasonEl.value = autoReason;
    const ddEl = document.getElementById('bbD_deferDays');
    if (ddEl) ddEl.value = autoDays > 0 ? autoDays : '';
    const rdEl = document.getElementById('bbD_returnDate');
    if (rdEl) rdEl.value = autoDays > 0 ? (nextDon || bbAddDays('', autoDays)) : '';
    bbDDecisionChanged();
  }
}
function bbDNidClear() {
  const nid = document.getElementById('bbD_nid'); if (nid) nid.value = '';
  ['bbD_derived', 'bbD_donations'].forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = ''; });
  ['bbD_details', 'bbD_decision', 'bbD_cooldown'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
  ['bbD_name', 'bbD_address', 'bbD_phone', 'bbD_age', 'bbD_gender', 'bbD_deferReason', 'bbD_deferDays', 'bbD_returnDate', 'bbD_refuseReason', 'bbD_lastDon', 'bbD_nextDon'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  ['bbD_bt'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const now = document.getElementById('bbD_now'); if (now) now.checked = true;
  if (_bb) _bb.bannedDonorNid = null;
  bbDDecisionChanged();
}
function bbDCollect() {
  const nidEl = document.getElementById('bbD_nid');
  if (!nidEl) return null;
  const nid = nidEl.value.trim();
  if (!nid) return null;
  if (!/^\d{14}$/.test(nid)) { showToast('❌ الرقم الطبي يجب أن يكون 14 رقماً', 'error'); return 'ERROR'; }
  const parsed = parseNationalId(nid);
  if (!parsed) { showToast('❌ رقم طبي غير صالح', 'error'); return 'ERROR'; }
  if (_bb && _bb.bannedDonorNid === nid) { showToast('❌ المتبرع ممنوع من التبرع', 'error'); return 'ERROR'; }
  const defer = document.getElementById('bbD_defer'), refused = document.getElementById('bbD_refused');
  let decision = refused && refused.checked ? 'مرفوض' : (defer && defer.checked ? 'موجل' : 'مقبول');
  const v = id => { const el = document.getElementById(id); return el ? el.value : ''; };
  const forceDefer = (reason, days, retDate) => {
    decision = 'موجل';
    if (defer) defer.checked = true;
    if (refused) refused.checked = false;
    const rEl = document.getElementById('bbD_deferReason'), dEl = document.getElementById('bbD_deferDays'), rtEl = document.getElementById('bbD_returnDate');
    if (rEl) rEl.value = reason;
    if (dEl) dEl.value = days > 0 ? days : '';
    if (rtEl) rtEl.value = retDate || '';
    if (typeof bbDDecisionChanged === 'function') bbDDecisionChanged();
  };
  if (decision !== 'مرفوض') {
    const todayStr = fmtCairoDate('date');
    if (parsed.age != null && parsed.age < 18) {
      const by = parseInt(parsed.birthDate.slice(0, 4), 10);
      const bd18 = (by + 18) + parsed.birthDate.slice(4);
      forceDefer('السن أقل من 18 سنة', Math.max(1, bbDaysBetween(todayStr, bd18)), bd18);
    } else if (parsed.age != null && parsed.age > 60) {
      forceDefer('السن أكبر من 60 سنة', 0, '');
    } else {
      const lastDon = v('bbD_lastDon'), nextDon = v('bbD_nextDon');
      if (nextDon && todayStr < nextDon) {
        forceDefer('لم تمضِ مدة الأمان منذ آخر تبرع', Math.max(1, bbDaysBetween(todayStr, nextDon)), nextDon);
      } else if (lastDon && !nextDon) {
        forceDefer('لم تمضِ مدة الأمان منذ آخر تبرع', 0, '');
      }
    }
  }
  const deferDays = parseInt(v('bbD_deferDays')) || 0;
  const deferReason = v('bbD_deferReason');
  const refuseReason = v('bbD_refuseReason');
  const returnDate = deferDays > 0 ? bbAddDays('', deferDays) : null;
  if (decision === 'مرفوض' && !refuseReason.trim()) { showToast('❌ حدد سبب الرفض للمتبرع', 'error'); return 'ERROR'; }
  if (decision === 'موجل' && !deferReason.trim()) { showToast('❌ حدد سبب التأجيل', 'error'); return 'ERROR'; }
  return {
    donor: {
      national_id: nid,
      name: v('bbD_name'),
      birth_date: parsed.birthDate,
      age: parsed.age,
      blood_type: v('bbD_bt'),
      governorate: parsed.governorate,
      gender: parsed.gender,
      address: v('bbD_address'),
      phone: v('bbD_phone'),
      notes: ''
    },
    screening: {
      deferral_reason: deferReason,
      deferral_duration: deferDays,
      return_date: returnDate,
      rejection_reason: refuseReason
    },
    decision,
    defer_reason: deferReason,
    defer_days: deferDays,
    rejection_reason: refuseReason
  };
}
/* ==== تعلم نمط الباركود (أرقام فقط): بعد 5 إدخالات بنفس الشكل يتعلم النمط ويكمل تصاعدياً لكل بنك ==== */
function bbBarList(hospId) {
  const out = [];
  const seen = {};
  (_bb.bags || []).forEach(b => {
    if (Number(b.hospital_id) === Number(hospId) && b.barcode) {
      const v = String(b.barcode).trim();
      if (v && !seen[v]) { seen[v] = 1; out.push(v); }
    }
  });
  (_bb.barTyped[hospId] || []).forEach(v => { if (v && !seen[v]) { seen[v] = 1; out.push(v); } });
  return out;
}
function bbBarPattern(hospId) {
  const list = bbBarList(hospId).filter(v => /^\d+$/.test(v));
  if (list.length < 5) return null;
  const byLen = {};
  list.forEach(v => { (byLen[v.length] = byLen[v.length] || []).push(v); });
  for (const len of Object.keys(byLen)) {
    const arr = byLen[len];
    if (arr.length < 5) continue;
    let pre = arr[0];
    for (const v of arr) {
      while (v.indexOf(pre) !== 0 && pre.length) pre = pre.slice(0, -1);
      if (!pre) break;
    }
    if (!pre) continue;
    const w = len - pre.length;
    if (w < 1 || w > 2) continue;
    const tails = arr.map(v => parseInt(v.slice(pre.length), 10));
    if (tails.some(isNaN)) continue;
    const next = Math.max.apply(null, tails) + 1;
    return { pre, w, next };
  }
  return null;
}
function bbBarLearn(hospId) {
  const p = bbBarPattern(hospId);
  if (p) _bb.barPat[hospId] = p;
}
function bbBarNext(hospId) {
  const p = _bb.barPat[hospId];
  if (!p) return '';
  let tail = String(p.next);
  if (p.next < Math.pow(10, p.w)) tail = String(p.next).padStart(p.w, '0');
  return p.pre + tail;
}
function bbBarAdvance(hospId) { if (_bb.barPat[hospId]) _bb.barPat[hospId].next++; }
function bbBarFill(i) {
  const el = document.getElementById(`bbR${i}_barcode`);
  const hospEl = document.getElementById('bbCollHosp');
  if (!el || !hospEl) return;
  const hospId = parseInt(hospEl.value, 10);
  if (!hospId) return;
  bbBarLearn(hospId);
  const v = bbBarNext(hospId);
  if (v) { el.value = v; bbBarAdvance(hospId); }
}
function bbRBarChanged(i) {
  const el = document.getElementById(`bbR${i}_barcode`);
  const hospEl = document.getElementById('bbCollHosp');
  if (!el || !hospEl) return;
  const hospId = hospEl.value;
  if (!hospId) return;
  const v = el.value.trim();
  _bb.barTyped[hospId] = _bb.barTyped[hospId] || [];
  if (v && _bb.barTyped[hospId].indexOf(v) === -1) _bb.barTyped[hospId].push(v);
  bbBarLearn(parseInt(hospId, 10));
}
function bbCollHospChanged() {
  for (let i = 0; i < _bb.rowN; i++) {
    const el = document.getElementById(`bbR${i}_barcode`);
    if (el) { el.value = ''; bbBarFill(i); }
  }
}
function bbProdCell(b) {
  const p = b.product_type || 'دم';
  const st = BB_PROD_STYLE[p] || { c: '#7f8c8d', i: 'fa-droplet' };
  const units = bbProdHasUnits(p) ? ` <span style="font-size:10px;color:#666;font-weight:600">(${b.units || 1} وحدة)</span>` : '';
  return `<span style="font-weight:700;color:${st.c};white-space:nowrap"><i class="fas ${st.i}" style="font-size:10px;margin-left:3px"></i>${esc(p)}</span>${units}`;
}
function bbOptStatus(sel, opts) {
  const keys = opts || ['collected','incomplete','therapeutic','fatty','icteric','lipemic','hemolyzed'];
  return keys.map(s => `<option value="${s}" ${sel === s ? 'selected' : ''}>${BB_ST_LABELS[s]}</option>`).join('');
}

async function renderBloodBags(tab) {
  const el = document.getElementById('mainContent');
  try {
    if (!hasPerm('blood_bags', 'view')) { showToast('❌ ليس لديك صلاحية لعرض أكياس الدم', 'error'); return; }
    const me = await api('GET', '/me');
    _bb.user = me.user;
    _bb.hospitals = await bbHospitals();
    const myHospType = (() => { const u = _bb.user; if (!u || !u.hospitalId) return null; const h = _bb.hospitals.find(x => x.id === parseInt(u.hospitalId)); return h ? h.type : null; })();
    const isCollectAllowed = myHospType === null || myHospType === 'تجميعي';
    _bb.isCollectAllowed = isCollectAllowed;
    const defTab = isCollectAllowed ? 'collect' : 'trans';
    _bb.tab = tab || null;
    if (tab && !isCollectAllowed && tab === 'collect') _bb.tab = defTab;
    const tabs = [
      ...(isCollectAllowed ? [['collect', 'fa-vial-circle-check', 'التجميع والفحص', '#0d7377']] : []),
      ['trans', 'fa-right-left', 'الوارد والإرسال والاستلام', '#1976d2'],
      ['compat', 'fa-arrows-to-circle', 'الفصائل والتوافق', '#8e44ad'],
      ['reserve', 'fa-hand-holding-droplet', 'الحجز والصرف', '#f39c12'],
      ['stock', 'fa-boxes-stacked', 'الرصيد المتاح', '#27ae60'],
      ['monthly', 'fa-calendar-check', 'الشهري التلقائي', '#16a085'],
      ['stats', 'fa-chart-line', 'اداره و الاحصائيات', '#e67e22']
    ];
    const showContent = !!_bb.tab;
    el.innerHTML = `<div class="page-actions">
      <button class="btn-back" data-click="bbBack"><i class="fas fa-arrow-right"></i> رجوع</button>
      <button class="btn btn-refresh" data-click="bbRefresh" style="height:34px"><i class="fas fa-sync-alt"></i> تحديث</button>
    </div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
      <i class="fas fa-droplet" style="color:#c2185b;font-size:22px"></i>
      <h2 style="margin:0;font-size:19px">أكياس الدم — التتبع الكامل</h2>
    </div>
    <div class="sub-icons-grid" id="bbTabs" style="margin:10px auto 18px${showContent ? ';display:none' : ''}">
      ${tabs.map(t => `<div class="sub-icon-card bb-tab-card ${_bb.tab === t[0] ? 'active' : ''}" data-tab="${t[0]}" data-click="bbGoTab" data-args="'${t[0]}'" title="${t[2]}">
        <div class="sub-icon-circle" style="background:${t[3]}"><i class="fas ${t[1]}"></i></div>
        <div class="sub-icon-label">${t[2]}</div>
      </div>`).join('')}
    </div>
    <div id="bbBody"></div>`;
    if (showContent) bbRenderTab(_bb.tab);
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}
function bbRenderTab(t) {
  if (t === 'collect') bbCollect();
  else if (t === 'trans') bbTrans();
  else if (t === 'compat') bbCompat();
  else if (t === 'reserve') bbReserve();
  else if (t === 'stock') bbStock();
  else if (t === 'monthly') bbMonthly();
  else if (t === 'stats') bbStats();
  else bbTrans();
}
function bbGoTab(t) {
  if (_bb.tab === t) return;
  _bb.tab = t;
  const tb = document.getElementById('bbTabs');
  if (tb) tb.style.display = 'none';
  bbRenderTab(t);
}
function bbBack() {
  if (_bb.tab) { _bb.tab = null; renderBloodBags(); }
  else goBack();
}
function bbRefresh() { renderBloodBags(_bb.tab); }

/* ----- التجميع والفحص ----- */
async function bbCollect() {
  const el = document.getElementById('bbBody');
  showPageLoading(el, 'جاري التحميل...');
  try {
    const canAdd = hasPerm('blood_bags', 'add');
    const showContent = !!_bb.cTab;
    const tabs = [
      ...(canAdd ? [['collect', 'fa-vial-circle-check', 'التجميع', '#0d7377']] : []),
      ['test', 'fa-flask-vial', 'فحص الأكياس', '#c2185b']
    ];
    el.innerHTML = `<div class="page-actions">
      <button class="btn-back" data-click="bbCollectBack"><i class="fas fa-arrow-right"></i> رجوع</button>
    </div>
    <div class="sub-icons-grid" id="bbCollectTabs" style="margin:10px auto 18px${showContent ? ';display:none' : ''}">
      ${tabs.map(t => `<div class="sub-icon-card bb-tab-card ${_bb.cTab === t[0] ? 'active' : ''}" data-tab="${t[0]}" data-click="bbCollectGo" data-args="'${t[0]}'" title="${t[2]}">
        <div class="sub-icon-circle" style="background:${t[3]}"><i class="fas ${t[1]}"></i></div>
        <div class="sub-icon-label">${t[2]}</div>
      </div>`).join('')}
    </div>
    <div id="bbCollectBody"></div>`;
    if (showContent) bbRenderCollectTab(_bb.cTab);
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}
async function bbRenderCollectTab(t) {
  const el = document.getElementById('bbCollectBody');
  if (!el) return;
  const canAdd = hasPerm('blood_bags', 'add'), canEdit = hasPerm('blood_bags', 'edit'), canDelete = hasPerm('blood_bags', 'delete');
  try {
    await bbLoadBags();
    if (t === 'collect') {
      if (!canAdd) { _bb.cTab = null; bbCollect(); return; }
      const now = getCairoDate();
      const today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
      el.innerHTML = `<div class="card" style="margin-bottom:16px;border-right:4px solid #0d7377">
        <div class="card-header" style="padding:10px 16px"><strong><i class="fas fa-vial-circle-check" style="margin-left:6px"></i> التجميع</strong></div>
        <div class="card-body" style="padding:10px 16px">
          <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin-bottom:10px">
            <div class="form-group"><label>بنك الدم</label><select class="form-control" id="bbCollHosp" data-change="bbCollHospChanged" style="min-width:220px">${bbOptHosp(null, 'تجميعي')}</select></div>
            <div class="form-group"><label>تاريخ التجميع</label><input class="form-control" type="date" id="bbCollDate" data-change="bbCollDateChanged" value="${today}"></div>
          </div>
          <div style="background:#eaf7f0;border:1px solid #a9dfbf;color:#1e8449;padding:6px 10px;border-radius:8px;font-size:11px;margin-bottom:8px"><i class="fas fa-fill-drip" style="margin-left:4px"></i> كيس الدم يُفصل تلقائياً إلى دم + بلازما بنفس رقم اللي والباركود (كرايو مكوّن ثالث اختياري بدون وحدات) — البلازما والكرايو تابعتان للدم ولا تُجمعان منفردتين، والدم يُفحص يدوياً لاحقاً. ولادة : تُعدَم البلازما والكرايو فوراً بدون فحص والدم يُفحص ويُحفظ. الصفائح والدم الكلي: كيس واحد مستقل — فحص الصفائح تلقائي، والدم الكلي يدوي لاحقاً.</div>
          ${bbDonorCardHtml()}
          <div id="bbCollRows"></div>
          <div style="display:flex;gap:10px;margin-top:6px">
            <button class="btn btn-outline" data-click="bbAddRow" style="border-color:#0d7377;color:#0d7377"><i class="fas fa-plus"></i> إضافة كيس</button>
            <button class="btn btn-primary" data-click="bbDoCollect"><i class="fas fa-vial-circle-check"></i> تجميع وفحص</button>
          </div>
        </div>
      </div>`;
      _bb.rowN = 0;
      bbAddRow();
      bbAutoHosp('bbCollHosp');
      bbSyncCollectRows();
    } else if (t === 'test') {
      el.innerHTML = `<div class="card" style="margin-bottom:16px;border-right:4px solid #c2185b">
        <div class="card-header" style="padding:10px 16px"><strong><i class="fas fa-flask-vial" style="margin-left:6px"></i> سجل الأكياس</strong> <span style="font-size:11px;color:#c2185b;font-weight:400"><i class="fas fa-eye" style="margin-left:3px"></i> يُعرض تحت الفحص فقط — الأكياس المفحوصة تختفي من السجل بعد فحصها</span></div>
        <div class="card-body" style="padding:10px 16px">
          <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin-bottom:10px">
            <div class="form-group"><label>بنك الدم</label><select class="form-control" id="bbListHosp" data-change="bbRenderBags" style="min-width:200px"><option value="">الكل</option>${_bb.hospitals.filter(h => h.type === 'تجميعي').map(h => `<option value="${h.id}">${esc(h.name)}</option>`).join('')}</select></div>
            <div class="form-group"><label>المنتج</label><select class="form-control" id="bbListProd" data-change="bbRenderBags" style="min-width:130px"><option value="">الكل</option>${BB_PRODUCT_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}</select></div>
            <div class="form-group"><label>بحث (رقم/باركود)</label><input class="form-control" id="bbListQ" data-input="bbRenderBags" style="min-width:180px"></div>
            <div class="form-group"><label>تاريخ التجميع من</label><input class="form-control" type="date" id="bbListFrom" data-change="bbRenderBags" style="min-width:130px"></div>
            <div class="form-group"><label>إلى</label><input class="form-control" type="date" id="bbListTo" data-change="bbRenderBags" style="min-width:130px"></div>
            <button class="btn btn-outline" data-click="bbExportBags" style="border-color:#c2185b;color:#c2185b;height:32px" title="تحميل القائمة المفلترة حالياً"><i class="fas fa-file-excel"></i> تحميل Excel</button>
          </div>
          <div class="bb-count-bar" id="bbListCount"></div>
          <div class="table-scroll"><table class="data-table" style="font-size:12px"><thead>
            <tr><th>رقم اللي</th><th>الباركود</th><th>بنك الدم</th><th>التجميع</th><th>الصلاحية</th><th>المتبقي</th><th>الفصيلة</th><th>المنتج</th>${canEdit || canDelete ? '<th>إجراءات</th>' : ''}</tr>
          </thead><tbody id="bbBagsBody"></tbody></table></div>
        </div>
      </div>`;
      bbRenderBags();
    } else {
      _bb.cTab = null;
      bbCollect();
    }
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}
function bbCollectGo(t) {
  if (_bb.cTab === t) return;
  _bb.cTab = t;
  const tb = document.getElementById('bbCollectTabs');
  if (tb) tb.style.display = 'none';
  bbRenderCollectTab(t);
}
function bbCollectBack() {
  if (_bb.cTab) { _bb.cTab = null; bbCollect(); }
  else bbBack();
}
function bbAddRow() {
  const wrap = document.getElementById('bbCollRows');
  if (!wrap) return;
  const i = _bb.rowN++;
  wrap.insertAdjacentHTML('beforeend', `<div class="bb-row" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(95px,1fr));gap:6px;align-items:end;margin-bottom:6px;padding:8px;background:var(--card-bg);border:1px solid var(--border);border-radius:8px">
    <div><label style="font-size:10px">رقم اللي</label><input class="form-control" id="bbR${i}_no" placeholder="تلقائي" dir="ltr" style="height:30px;font-size:11px"></div>
    <div><label style="font-size:10px">الباركود</label><input class="form-control" id="bbR${i}_barcode" dir="ltr" data-change="bbRBarChanged" data-args="${i}" style="height:30px;font-size:11px"></div>
    <div><label style="font-size:10px">المنتج</label><select class="form-control" id="bbR${i}_prod" data-change="bbRProdChanged" data-args="${i}" style="height:auto;min-height:30px;font-size:11px;padding:2px 6px;line-height:1.4">${bbOptCollectProduct('دم')}</select></div>
    <div><label style="font-size:10px">الفئة</label><select class="form-control" id="bbR${i}_cat" style="height:30px;font-size:11px"><option value="كبار" selected>كبار</option><option value="أطفال">أطفال</option></select></div>
    <div id="bbR${i}_unitWrap" style="display:none"><label style="font-size:10px">عدد الوحدات</label><input class="form-control" id="bbR${i}_units" type="number" min="1" value="1" style="height:30px;font-size:11px"></div>
    <div><label style="font-size:10px">تاريخ انتهاء الصلاحية</label><input class="form-control" id="bbR${i}_exp" type="date" style="height:30px;font-size:11px"></div>
    <div id="bbR${i}_cryoWrap" style="display:flex;align-items:center;padding-top:14px"><label style="font-size:11px;color:#d35400;cursor:pointer;font-weight:700;background:#fff3e0;border:1px solid #ffcc80;border-radius:16px;padding:5px 12px;display:inline-flex;align-items:center;gap:5px"><input type="checkbox" id="bbR${i}_cryo" style="width:15px;height:15px;margin:0"> كرايو</label></div>
    <div id="bbR${i}_pregWrap" style="display:flex;align-items:center;padding-top:14px"><label title="المتبرعة حامل أو ولدت — تُعدم البلازما والكرايو مباشرة بدون فحص" style="font-size:11px;color:#e74c3c;cursor:pointer;font-weight:700;background:#fdecea;border:1px solid #f5b7b1;border-radius:16px;padding:5px 12px;display:inline-flex;align-items:center;gap:5px"><input type="checkbox" id="bbR${i}_preg" style="width:15px;height:15px;margin:0"> ولادة</label></div>
    <div style="display:flex;align-items:end"><button class="btn btn-sm btn-outline" data-click="bbDelRow" data-args="${i}" style="height:30px;color:#dc3545"><i class="fas fa-trash"></i></button></div>
  </div>`);
  bbRSetExpiry(i);
  bbBarFill(i);
}
function bbRSetExpiry(i) {
  const collDate = document.getElementById('bbCollDate');
  const prod = document.getElementById(`bbR${i}_prod`);
  const exp = document.getElementById(`bbR${i}_exp`);
  if (!prod || !exp) return;
  const base = collDate && collDate.value ? collDate.value : '';
  if (base) exp.value = bbDefaultExpiry(base, prod.value);
}
function bbCollDateChanged() {
  for (let i = 0; i < _bb.rowN; i++) {
    const no = document.getElementById(`bbR${i}_no`);
    if (no) bbRSetExpiry(i);
  }
}
function bbRProdChanged(i) {
  const prod = document.getElementById(`bbR${i}_prod`);
  if (!prod) return;
  const isPlatelets = bbProdHasUnits(prod.value);
  const isWholeBlood = prod.value === 'دم كلي';
  const unitWrap = document.getElementById(`bbR${i}_unitWrap`);
  if (unitWrap) unitWrap.style.display = isPlatelets ? 'block' : 'none';
  const cryoWrap = document.getElementById(`bbR${i}_cryoWrap`);
  if (cryoWrap) cryoWrap.style.display = (isPlatelets || isWholeBlood) ? 'none' : 'flex';
  const pregWrap = document.getElementById(`bbR${i}_pregWrap`);
  if (pregWrap) pregWrap.style.display = (isPlatelets || isWholeBlood) ? 'none' : 'flex';
  if (isWholeBlood) {
    const cryo = document.getElementById(`bbR${i}_cryo`);
    if (cryo) cryo.checked = false;
    const preg = document.getElementById(`bbR${i}_preg`);
    if (preg) preg.checked = false;
  }
  bbRSetExpiry(i);
}
function bbDelRow(i) { const row = document.querySelector(`[id="bbR${i}_no"]`)?.closest('.bb-row'); if (row) row.remove(); }
async function bbDoCollect() {
  const hospitalId = parseInt(document.getElementById('bbCollHosp').value);
  const collectionDate = document.getElementById('bbCollDate').value;
  if (!hospitalId) { showToast('❌ اختر بنك الدم', 'error'); return; }
  if (!collectionDate) { showToast('❌ أدخل تاريخ التجميع', 'error'); return; }
  const bags = [];
  const missing = [];
  for (let i = 0; i < _bb.rowN; i++) {
    const no = document.getElementById(`bbR${i}_no`);
    if (!no) continue;
    const prodEl = document.getElementById(`bbR${i}_prod`);
    const prod = prodEl ? prodEl.value : 'دم';
    const catEl = document.getElementById(`bbR${i}_cat`);
    const unitCat = catEl ? catEl.value : 'كبار';
    const bar = document.getElementById(`bbR${i}_barcode`).value.trim();
    const exp = document.getElementById(`bbR${i}_exp`).value;
    const unitsEl = document.getElementById(`bbR${i}_units`);
    const units = prodEl ? parseInt(unitsEl ? unitsEl.value : '') : 1;
    const labels = [];
    if (!no.value.trim()) labels.push('رقم اللي');
    if (!bar) labels.push('الباركود');
    if (!exp) labels.push('الصلاحية');
    if (bbProdHasUnits(prod) && (!units || units < 1)) labels.push('عدد الوحدات');
    if (labels.length) { missing.push('صف ' + (i + 1) + ' («' + prod + '»: ' + labels.join('، ') + ')'); continue; }
    bags.push({
      bag_no: no.value.trim(),
      barcode: bar,
      product_type: prod,
      unit_category: unitCat,
      units: prodEl ? units : 1,
      cryo: document.getElementById(`bbR${i}_cryo`) ? document.getElementById(`bbR${i}_cryo`).checked : false,
      preg: document.getElementById(`bbR${i}_preg`) ? document.getElementById(`bbR${i}_preg`).checked : false,
      expiry_date: exp || null
    });
  }
  if (!bags.length) { showToast('❌ أضف كيس واحد على الأقل', 'error'); return; }
  if (missing.length) { showToast('❌ أكمل البيانات الناقصة: ' + missing.join('، '), 'error'); return; }
  const dc = bbDCollect();
  if (dc === 'ERROR') return;
  if (dc && dc.decision !== 'مقبول') {
    showToast('❌ لا يمكن الحفظ — قرار التبرع يجب أن يكون «مقبول» (القرار الحالي: «' + (dc.decision || 'غير محدد') + '»). اختر «مقبول» لتسجيل التبرع والأكياس', 'error');
    return;
  }
  try {
    const r = await api('POST', '/blood-bags', Object.assign({ hospitalId, collectionDate, bags }, dc ? { donor: dc.donor, screening: dc.screening, decision: dc.decision } : {}));
    const comps = r.bags || [];
    const groups = new Set();
    comps.forEach(b => groups.add(b.donation_id || ('s:' + b.id)));
    const autoTest = comps.filter(b => b.status === 'collected' && !b.donation_id && (b.product_type || '') !== 'دم كلي');
    showToast(`✅ تم تسجيل ${comps.length} كيس من ${groups.size} تبرع${autoTest.length ? ' — فحص الصفائح تلقائياً' : ''}`);
    _bb.pendingTest = autoTest.map(b => b.id);
    if (dc) bbDNidClear();
    await bbCollect();
    bbTestNext();
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}
async function bbLoadBags() { try { const r = await api('GET', '/blood-bags'); _bb.bags = r.bags || []; } catch (e) { _bb.bags = []; } }
function bbRenderBags() {
  const body = document.getElementById('bbBagsBody');
  if (!body) return;
  const hid = document.getElementById('bbListHosp') ? parseInt(document.getElementById('bbListHosp').value) : 0;
  const prod = document.getElementById('bbListProd') ? document.getElementById('bbListProd').value : '';
  const q = document.getElementById('bbListQ') ? document.getElementById('bbListQ').value.trim().toLowerCase() : '';
  const dateFrom = document.getElementById('bbListFrom') ? document.getElementById('bbListFrom').value : '';
  const dateTo = document.getElementById('bbListTo') ? document.getElementById('bbListTo').value : '';
  let list = _bb.bags;
  const collTypes = _bb.hospitals.filter(h => h.type === 'تجميعي').map(h => h.id);
  list = list.filter(b => collTypes.indexOf(b.hospital_id) !== -1);
  list = list.filter(b => b.status === 'collected');
  if (hid) list = list.filter(b => b.hospital_id === hid);
  if (prod) list = list.filter(b => (b.product_type || 'دم') === prod);
  if (q) list = list.filter(b => (b.bag_no || '').toLowerCase().indexOf(q) !== -1 || (b.barcode || '').toLowerCase().indexOf(q) !== -1);
  if (dateFrom) list = list.filter(b => b.collection_date && String(b.collection_date).slice(0, 10) >= dateFrom);
  if (dateTo) list = list.filter(b => b.collection_date && String(b.collection_date).slice(0, 10) <= dateTo);
  _bb.lastFilteredBags = list;
  const canEdit = hasPerm('blood_bags', 'edit'), canDelete = hasPerm('blood_bags', 'delete');
  const cnt = document.getElementById('bbListCount');
  if (cnt) cnt.innerHTML = `<i class="fas fa-boxes-stacked" style="font-size:10px"></i> عرض <b>${list.length}</b> من أصل <b>${_bb.bags.filter(x => collTypes.indexOf(x.hospital_id) !== -1 && x.status === 'collected').length}</b> كيس تحت الفحص`;
  const span = 8 + ((canEdit || canDelete) ? 1 : 0);
  body.innerHTML = list.map(b => `<tr>
    <td style="text-align:center;direction:ltr;font-weight:700;color:#0d7377">${esc(b.bag_no)}</td>
    <td style="text-align:center;direction:ltr;font-size:11px;color:#888">${esc(b.barcode || '—')}</td>
    <td style="text-align:right;font-weight:600">${esc(b.hospital_name)}</td>
    <td style="text-align:center">${b.collection_date ? esc(String(b.collection_date).slice(0, 10)) : '—'}</td>
    <td style="text-align:center">${b.expiry_date ? esc(String(b.expiry_date).slice(0, 10)) : '—'}</td>
    <td style="text-align:center">${bbDaysBadge(b.days_left)}</td>
    <td style="text-align:center;font-weight:700;color:${b.blood_type && b.blood_type.endsWith('+') ? '#c0392b' : '#27ae60'}">${esc(b.blood_type || '—')}</td>
    <td style="text-align:center">${bbProdCell(b)}${b.donation_id ? ` <span title="مفصول من تبرع" style="font-size:10px;color:#fff;background:#7d3c98;border-radius:10px;padding:1px 6px"><i class="fas fa-fill-drip" style="margin-left:2px"></i>مفصول</span>` : ''}</td>
    ${(canEdit || canDelete) ? `<td style="text-align:center;white-space:nowrap">
      ${bbCanTest(b) ? `<button class="btn btn-sm" data-click="bbTest" data-args="${b.id}" style="background:#27ae60;color:#fff" title="فحص"><i class="fas fa-flask"></i></button> ` : ''}
      ${bbCanStatus(b) ? `<button class="btn btn-sm btn-outline" data-click="bbStatus" data-args="${b.id}" title="تغيير الحالة" style="margin-right:4px"><i class="fas fa-arrows-rotate"></i></button> ` : ''}
      ${canEdit ? `<button class="btn btn-sm btn-outline" data-click="bbEdit" data-args="${b.id}" style="margin-right:4px" title="تعديل"><i class="fas fa-pen"></i></button> ` : ''}
      <button class="btn btn-sm btn-outline" data-click="bbEvents" data-args="${b.id}" style="margin-right:4px" title="الأحداث"><i class="fas fa-history"></i></button>
      ${canDelete && window._user && window._user.role === 'admin' ? `<button class="btn btn-sm btn-outline" data-click="bbDelete" data-args="${b.id}" style="margin-right:4px;color:#dc3545" title="حذف"><i class="fas fa-trash"></i></button>` : ''}
    </td>` : ''}
  </tr>`).join('') || `<tr><td colspan="${span}" class="empty-msg">لا توجد أكياس تحت الفحص — الأكياس المفحوصة لا تظهر في سجل التجميع</td></tr>`;
}
/* تصدير Excel عام لوحدة الأكياس — يستخدم ExcelJS + العناوين المدمجة مثل بقية الوحدة */
function _bbNum(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/[٬,]/g, '');
  if (s.trim() === '') return null;
  const latin = s.replace(/[٠-٩]/g, ch => String('٠١٢٣٤٥٦٧٨٩'.indexOf(ch)));
  if (isNaN(Number(latin))) return null;
  return Number(latin);
}
function bbXlsx(headers, rows, sheetName, fileName, sub) {
  if (typeof ExcelJS === 'undefined') { showToast('❌ مكتبة ExcelJS غير محمّلة — تأكد من الاتصال ثم أعد تحميل الصفحة', 'error'); return; }
  try {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(sheetName);
    const mc = headers.length;
    const sr = _xlsxTitleRow(ws, 1, sheetName, sub, mc);
    const hr = ws.getRow(sr);
    headers.forEach((h, i) => {
      const c = hr.getCell(i + 1);
      c.value = h;
      c.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8E44AD' } };
      c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      c.border = _XBN;
    });
    hr.height = 24;
    rows.forEach((r, i) => {
      const row = ws.getRow(sr + 1 + i);
      headers.forEach((h, j) => {
        const c = row.getCell(j + 1);
        const v = r[j];
        const num = _bbNum(v);
        if (num !== null) { c.value = num; c.numFmt = '#,##0'; }
        else c.value = (v === null || v === undefined) ? '' : String(v);
        c.alignment = { horizontal: 'center', vertical: 'middle' };
        c.border = _XBN;
        c.font = { size: 9 };
        if (i % 2) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F3FA' } };
      });
      row.height = 18;
    });
    headers.forEach((h, i) => ws.getColumn(i + 1).width = Math.min(34, Math.max(12, (String(h).length || 6) * 2 + 4)));
    _xlsxFooter(ws, sr + 1 + rows.length, mc);
    _xlsxDl(wb, fileName);
  } catch (e) {
    showToast('❌ خطأ في التصدير: ' + e.message, 'error');
  }
}
function bbExportBags() {
  const list = _bb.lastFilteredBags || [];
  if (!list.length) { showToast('❌ لا توجد أكياس مطابقة للتصدير', 'error'); return; }
  bbXlsx(
    ['رقم اللي', 'الباركود', 'بنك الدم', 'تاريخ التجميع', 'تاريخ الصلاحية', 'المتبقي (يوم)', 'الفصيلة', 'المنتج', 'عدد الوحدات'],
    list.map(b => [b.bag_no, b.barcode || '—', b.hospital_name || '',
      b.collection_date ? String(b.collection_date).slice(0, 10) : '—', b.expiry_date ? String(b.expiry_date).slice(0, 10) : '—',
      b.days_left !== null && b.days_left !== undefined ? b.days_left : '—', b.blood_type || '—', b.product_type || 'دم', b.units || 1]),
    'سجل الأكياس', 'سجل_أكياس_الدم.xlsx', 'نظام بنك الدم — سجل الأكياس (القائمة المفلترة حالياً)');
}
function bbTestNext() {
  if (!_bb.pendingTest || !_bb.pendingTest.length) { _bb.pendingTest = []; return; }
  const id = _bb.pendingTest.shift();
  const bag = _bb.bags.find(b => b.id === id);
  if (!bag || bag.status !== 'collected') { bbTestNext(); return; }
  if (bag.donation_id) {
    const still = _bb.bags.find(x => x.donation_id === bag.donation_id && (x.product_type || 'دم') === 'دم' && x.status === 'collected');
    if (!still) { bbTestNext(); return; }
    bbTest(still.id);
    return;
  }
  bbTest(id);
}
function bbTest(id) {
  const bag = _bb.bags.find(b => b.id === id);
  if (!bag) return;
  const v = (sel, d) => `<select class="form-control" id="bbT_${sel}" style="width:110px"><option value="" ${d === '' ? 'selected' : ''}>—</option><option value="سلبي" ${d === 'سلبي' ? 'selected' : ''}>سلبي</option><option value="إيجابي" ${d === 'إيجابي' ? 'selected' : ''}>إيجابي</option></select>`;
  const group = bag.donation_id ? _bb.bags.filter(x => x.donation_id === bag.donation_id) : [bag];
  const groupLine = group.length > 1 ? `<div style="background:#eaf2f8;border:1px solid #aed6f1;color:#1a5276;padding:8px 12px;border-radius:8px;font-size:12px;margin-top:10px;line-height:1.8"><i class="fas fa-layer-group" style="margin-left:4px"></i> <strong>مكونات هذا التبرع (${group.length}):</strong><br>${group.map(g => `<span style="display:inline-block;margin:2px 4px 2px 0;padding:2px 8px;border:1px solid #d5dbdb;border-radius:14px;background:#fff">${bbProdCell(g)} &nbsp;${bbStBadge(g.status)}</span>`).join('')}<br><span style="font-size:11px;color:#1a5276">الفحص يسري على التبرع كاملاً — أي نتيجة إيجابية تُعدِم كل المكونات.</span></div>` : '';
  openModal('فحص الكيس ' + esc(bag.bag_no),
    `<div style="font-size:13px;margin-bottom:12px">المنتج: ${bbProdCell(bag)} &nbsp;|&nbsp; المتبرع: <strong>${esc(bag.donor_name || '—')}</strong> | تاريخ التجميع: <strong>${bag.collection_date ? esc(String(bag.collection_date).slice(0, 10)) : '—'}</strong></div>
    <div class="form-group"><label>الفصيلة</label><select class="form-control" id="bbT_bt" style="width:140px">${bbOptBt(bag.blood_type, (bag.product_type || 'دم') !== 'دم' && (bag.product_type || '') !== 'دم كلي')}</select></div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:10px">
      <div class="form-group"><label>فيروس سي (HCV)</label>${v('hcv', bag.test_hcv)}</div>
      <div class="form-group"><label>فيروس بي (HBV)</label>${v('hbv', bag.test_hbv)}</div>
      <div class="form-group"><label>الايدز (HIV)</label>${v('hiv', bag.test_hiv)}</div>
      <div class="form-group"><label>الزهري (Syphilis)</label>${v('syphilis', bag.test_syphilis)}</div>
    </div>
    <div class="form-group" style="margin-top:10px"><label>النات (NAT)</label>${v('nat', bag.test_nat)}</div>
    ${groupLine}
    <div style="background:#e8f5e9;border:1px solid #a5d6a7;color:#2e7d32;padding:8px 12px;border-radius:8px;font-size:12px;margin-top:10px"><i class="fas fa-info-circle" style="margin-left:4px"></i> عند وجود أي نتيجة إيجابية يُعدَم التبرع كاملاً (كل المكونات) تلقائياً</div>`,
    `<button class="btn btn-secondary" data-click="closeModal"><i class="fas fa-times"></i> إلغاء</button>
     <button class="btn btn-primary" data-click="bbDoTest" data-args="${id}"><i class="fas fa-flask"></i> حفظ النتائج</button>`);
}
async function bbDoTest(id) {
  const bt = document.getElementById('bbT_bt').value;
  if (!bt) { showToast('❌ أدخل الفصيلة أولاً', 'error'); return; }
  const hcv = document.getElementById('bbT_hcv').value, hbv = document.getElementById('bbT_hbv').value, hiv = document.getElementById('bbT_hiv').value, syph = document.getElementById('bbT_syphilis').value, nat = document.getElementById('bbT_nat') ? document.getElementById('bbT_nat').value : '';
  const missing = [];
  if (!hcv) missing.push('HCV');
  if (!hbv) missing.push('HBV');
  if (!hiv) missing.push('HIV');
  if (!syph) missing.push('Syphilis');
  if (!nat) missing.push('NAT');
  if (missing.length) { showToast('❌ أكمل نتائج الفحص: ' + missing.join('، '), 'error'); return; }
  const body = { blood_type: bt, hcv, hbv, hiv, syphilis: syph, test_nat: nat };
  try {
    const r = await api('POST', '/blood-bags/' + id + '/test', body);
    const affected = r.affected > 1 ? ` (${r.affected} مكونات)` : '';
    showToast(r.status === 'positive' ? '🩸 نتيجة إيجابية — تم إعدام التبرع كاملاً' + affected : '✅ الفحص سليم — التبرع أصبح متاحاً' + affected);
    closeModal();
    await bbLoadBags(); bbRenderBags();
    bbTestNext();
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}
function bbStatus(id) {
  const bag = _bb.bags.find(b => b.id === id);
  if (!bag) return;
  const prod = bag.product_type || 'دم';
  const opts = bbStOpts(prod);
  const note = prod === 'دم'
    ? `<div style="font-size:12px;color:#8e44ad;background:#f4ecf7;border:1px solid #d7bde2;padding:8px 12px;border-radius:8px;margin-top:8px"><i class="fas fa-skull-crossbones" style="margin-left:4px"></i> اختيار أي سبب يُعدِم <b>التبرع كاملاً</b> — كل المكونات (دم + بلازما + كرايو) ستُسجَّل بنفس الحالة.</div>`
    : (prod === 'بلازما' || prod === 'كرايو')
      ? `<div style="font-size:12px;color:#b7950b;background:#fef9e7;border:1px solid #f9e79f;padding:8px 12px;border-radius:8px;margin-top:8px"><i class="fas fa-skull-crossbones" style="margin-left:4px"></i> سبب خاص بالمنتج — إعدام <b>فردي</b> لهذا الكيس فقط (بقية مكونات التبرع تبقى كما هي).</div>`
      : `<div style="font-size:12px;color:#666;margin-top:6px">إعدام فردي لهذا الكيس.</div>`;
  openModal('تغيير حالة الكيس ' + esc(bag.bag_no) + ' — ' + bbProdCell(bag),
    `<div class="form-group"><label>الحالة</label><select class="form-control" id="bbStSel">${bbOptStatus('', opts)}</select></div>
    ${note}
    <div class="form-group" style="margin-top:10px"><label>ملاحظة / سبب</label><input class="form-control" id="bbStReason" placeholder="اختياري"></div>`,
    `<button class="btn btn-secondary" data-click="closeModal"><i class="fas fa-times"></i> إلغاء</button>
     <button class="btn btn-primary" data-click="bbDoStatus" data-args="${id}"><i class="fas fa-save"></i> حفظ</button>`);
}
async function bbDoStatus(id) {
  const status = document.getElementById('bbStSel').value;
  const reason = document.getElementById('bbStReason').value;
  if (!status) { showToast('❌ اختر الحالة', 'error'); return; }
  try {
    await api('POST', '/blood-bags/' + id + '/status', { status, reason });
    showToast('✅ تم تحديث الحالة');
    closeModal();
    await bbLoadBags(); bbRenderBags();
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}
function bbEdit(id) {
  const b = _bb.bags.find(x => x.id === id);
  if (!b) return;
  openModal('تعديل الكيس ' + esc(b.bag_no),
    `<div class="form-group"><label>رقم اللي</label><input class="form-control" id="bbE_no" value="${esc(b.bag_no)}" dir="ltr"></div>
    <div class="form-group"><label>الباركود</label><input class="form-control" id="bbE_barcode" value="${esc(b.barcode || '')}" dir="ltr"></div>
    <div class="form-group"><label>اسم المتبرع</label><input class="form-control" id="bbE_donor" value="${esc(b.donor_name || '')}"></div>
    <div class="form-group"><label>الرقم القومي</label><input class="form-control" id="bbE_nid" value="${esc(b.donor_national_id || '')}" dir="ltr"></div>
    <div class="form-group"><label>السن</label><input class="form-control" type="number" id="bbE_age" value="${b.donor_age || ''}"></div>
    <div class="form-group"><label>النوع</label><select class="form-control" id="bbE_gender"><option ${b.donor_gender === 'ذكر' ? 'selected' : ''}>ذكر</option><option ${b.donor_gender === 'أنثى' ? 'selected' : ''}>أنثى</option></select></div>
    <div class="form-group"><label>الفصيلة</label><select class="form-control" id="bbE_bt">${bbOptBt(b.blood_type, (b.product_type || 'دم') !== 'دم' && (b.product_type || '') !== 'دم كلي')}</select></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="form-group"><label>المنتج</label><select class="form-control" id="bbE_prod" data-change="bbEProdChanged">${bbOptProduct(b.product_type || 'دم')}</select></div>
      <div class="form-group" id="bbE_unitWrap" style="${bbProdHasUnits(b.product_type || 'دم') ? '' : 'display:none'}"><label>عدد الوحدات</label><input class="form-control" type="number" min="1" id="bbE_units" value="${b.units || 1}"></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div class="form-group"><label>تاريخ التجميع</label><input class="form-control" type="date" id="bbE_cdate" data-change="bbECdateChanged" value="${b.collection_date ? String(b.collection_date).slice(0, 10) : ''}"></div>
    <div class="form-group"><label>تاريخ الصلاحية</label><input class="form-control" type="date" id="bbE_exp" value="${b.expiry_date ? String(b.expiry_date).slice(0, 10) : ''}"></div></div>
    <div class="form-group"><label>ملاحظات</label><input class="form-control" id="bbE_notes" value="${esc(b.notes || '')}"></div>
    ${b.donation_id ? `<div style="background:#eaf2f8;border:1px solid #aed6f1;color:#1a5276;padding:8px 12px;border-radius:8px;font-size:12px"><i class="fas fa-layer-group" style="margin-left:4px"></i> <strong>مفصول من تبرع</strong> — التعديل على رقم اللي / الباركود / التاريخ / الفصيلة / بيانات المتبرع سينسحب على كل مكونات هذا التبرع تلقائياً.</div>` : ''}`,
    `<button class="btn btn-secondary" data-click="closeModal"><i class="fas fa-times"></i> إلغاء</button>
     <button class="btn btn-primary" data-click="bbDoEdit" data-args="${id}"><i class="fas fa-save"></i> حفظ</button>`);
}
function bbECdateChanged() {
  const cdate = document.getElementById('bbE_cdate');
  const prod = document.getElementById('bbE_prod');
  const exp = document.getElementById('bbE_exp');
  if (prod && exp) exp.value = bbDefaultExpiry(cdate ? cdate.value : '', prod.value);
}
function bbEProdChanged() {
  const prod = document.getElementById('bbE_prod');
  const unitWrap = document.getElementById('bbE_unitWrap');
  const bt = document.getElementById('bbE_bt');
  if (prod) {
    const simple = prod.value !== 'دم' && prod.value !== 'دم كلي';
    if (unitWrap) unitWrap.style.display = bbProdHasUnits(prod.value) ? '' : 'none';
    if (bt) {
      const cur = bt.value;
      bt.innerHTML = bbOptBt(simple && cur && cur.length === 1 ? cur : '', simple);
    }
    const cdate = document.getElementById('bbE_cdate');
    const exp = document.getElementById('bbE_exp');
    if (exp) exp.value = bbDefaultExpiry(cdate ? cdate.value : '', prod.value);
  }
}
async function bbDoEdit(id) {
  const g = x => document.getElementById(x).value;
  try {
    await api('PUT', '/blood-bags/' + id, {
      bag_no: g('bbE_no'), barcode: g('bbE_barcode'), donor_name: g('bbE_donor'), donor_national_id: g('bbE_nid'),
      donor_age: g('bbE_age'), donor_gender: g('bbE_gender'), blood_type: g('bbE_bt'),
      product_type: g('bbE_prod'), units: parseInt(g('bbE_units')) || 1,
      collection_date: g('bbE_cdate') || null, expiry_date: g('bbE_exp') || null, notes: g('bbE_notes')
    });
    showToast('✅ تم التعديل');
    closeModal();
    await bbLoadBags(); bbRenderBags();
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}
function bbDelete(id) {
  const b = _bb.bags.find(x => x.id === id);
  if (!b) return;
  showConfirmModal('هل تريد حذف الكيس ' + b.bag_no + ' نهائياً؟ (سيتم حذف أحداثه وحجوزاته)', () => bbDoDelete(id));
}
async function bbDoDelete(id) {
  try { await api('DELETE', '/blood-bags/' + id); showToast('✅ تم الحذف'); await bbLoadBags(); bbRenderBags(); }
  catch (e) { showToast('❌ ' + e.message, 'error'); }
}
async function bbEvents(id) {
  try {
    const r = await api('GET', '/blood-bags/events?bagId=' + id);
    const evs = r.events || [];
    openModal('سجل أحداث الكيس',
      `<div class="table-scroll" style="max-height:380px"><table class="data-table" style="font-size:12px"><thead><tr><th>الحدث</th><th>التفاصيل</th><th>من</th><th>إلى</th><th>المستخدم</th><th>التاريخ</th></tr></thead><tbody>
      ${evs.map(e => `<tr><td style="text-align:center;font-weight:600">${esc(e.event)}</td><td style="text-align:right;font-size:11px">${esc(e.detail || '')}</td><td style="text-align:center;font-size:11px">${esc(e.from_hospital_name || '—')}</td><td style="text-align:center;font-size:11px">${esc(e.to_hospital_name || '—')}</td><td style="text-align:center;font-size:11px">${esc(e.user_name || '')}</td><td style="text-align:center;font-size:11px">${e.created_at ? esc(new Date(e.created_at).toLocaleString('ar-EG')) : ''}</td></tr>`).join('') || '<tr><td colspan="6" class="empty-msg">لا توجد أحداث</td></tr>'}
      </tbody></table></div>`,
      `<button class="btn btn-secondary" data-click="closeModal"><i class="fas fa-times"></i> إغلاق</button>`);
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}

/* ----- الوارد والإرسال والاستلام ----- */
async function bbTrans() {
  const el = document.getElementById('bbBody');
  showPageLoading(el, 'جاري التحميل...');
  try {
    const canAdd = hasPerm('blood_bags', 'add');
    const showContent = !!_bb.tTab;
    const tabs = [
      ['disp', 'fa-truck-ramp-box', 'إرسال أكياس إلى بنك دم آخر', '#6c3483'],
      ['recv', 'fa-box-open', 'استلام أكياس واردة', '#16a085'],
      ...(canAdd ? [['in', 'fa-warehouse', 'تسجيل وحدات دم واردة (وارد إقليمي)', '#2e86c1']] : [])
    ];
    el.innerHTML = `<div class="page-actions">
      <button class="btn-back" data-click="bbTransBack"><i class="fas fa-arrow-right"></i> رجوع</button>
    </div>
    <div class="sub-icons-grid" id="bbTransTabs" style="margin:10px auto 18px${showContent ? ';display:none' : ''}">
      ${tabs.map(t => `<div class="sub-icon-card bb-tab-card ${_bb.tTab === t[0] ? 'active' : ''}" data-tab="${t[0]}" data-click="bbTransGo" data-args="'${t[0]}'" title="${t[2]}">
        <div class="sub-icon-circle" style="background:${t[3]}"><i class="fas ${t[1]}"></i></div>
        <div class="sub-icon-label">${t[2]}</div>
      </div>`).join('')}
    </div>
    <div id="bbTransBody"></div>`;
    if (showContent) bbRenderTransTab(_bb.tTab);
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}
async function bbRenderTransTab(t) {
  const el = document.getElementById('bbTransBody');
  if (!el) return;
  const canEdit = hasPerm('blood_bags', 'edit'), canAdd = hasPerm('blood_bags', 'add');
  try {
    await bbLoadBags();
    if (t === 'disp') {
      el.innerHTML = `<div class="card" style="margin-bottom:16px;border-right:4px solid #6c3483">
        <div class="card-header" style="padding:10px 16px"><strong><i class="fas fa-truck-ramp-box" style="margin-left:6px"></i> إرسال أكياس إلى بنك دم آخر</strong></div>
        <div class="card-body" style="padding:10px 16px">
          <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin-bottom:10px">
            <div class="form-group"><label>من بنك الدم</label><select class="form-control" id="bbDispFrom" data-change="bbDispFromChanged" style="min-width:220px">${bbOptHosp(null)}</select></div>
            <div class="form-group"><label>الفرع</label><select class="form-control" id="bbDispGov" data-change="bbDispGovChanged" style="min-width:170px">${bbOptGov('')}</select></div>
            <div class="form-group"><label>إلى بنك الدم</label><select class="form-control" id="bbDispTo" style="min-width:220px"></select></div>
            <div class="form-group"><label>نوع الوحدات المرسلة</label><select class="form-control" id="bbDispProd" data-change="bbRenderDisp" style="min-width:170px"><option value="">كل الأنواع</option>${bbOptProduct('')}</select></div>
            <div class="form-group"><label>ملاحظة</label><input class="form-control" id="bbDispNote" style="min-width:180px" placeholder="اختياري"></div>
            ${canEdit ? `<button class="btn btn-primary" data-click="bbDoDispatch"><i class="fas fa-paper-plane"></i> إرسال المحدد</button>` : ''}
          </div>
          <div class="table-scroll"><table class="data-table" style="font-size:12px"><thead>
            <tr><th style="width:40px"></th><th>رقم اللي</th><th>الباركود</th><th>المنتج</th><th>الفصيلة</th><th>الصلاحية</th><th>الحالة</th></tr>
          </thead><tbody id="bbDispBody"></tbody></table></div>
        </div>
      </div>`;
      bbAutoHosp('bbDispFrom');
      bbDispFromChanged();
      bbRenderDisp();
    } else if (t === 'recv') {
      el.innerHTML = `<div class="card" style="margin-bottom:16px;border-right:4px solid #16a085">
        <div class="card-header" style="padding:10px 16px"><strong><i class="fas fa-box-open" style="margin-left:6px"></i> استلام أكياس واردة</strong></div>
        <div class="card-body" style="padding:10px 16px">
          <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin-bottom:10px">
            <div class="form-group"><label>بنك الدم المستقبِل</label><select class="form-control" id="bbRecvHosp" data-change="bbRenderRecv" style="min-width:220px">${bbOptHosp(null)}</select></div>
          </div>
          <div class="table-scroll"><table class="data-table" style="font-size:12px"><thead>
            <tr><th>رقم اللي</th><th>الباركود</th><th>من</th><th>المنتج</th><th>الفصيلة</th><th>الصلاحية</th><th>أُرسل في</th>${canEdit ? '<th>إجراءات</th>' : ''}</tr>
          </thead><tbody id="bbRecvBody"></tbody></table></div>
        </div>
      </div>`;
      bbAutoHosp('bbRecvHosp');
      bbRenderRecv();
    } else if (t === 'in' && canAdd) {
      const now = getCairoDate();
      const today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
      el.innerHTML = `<div class="card" style="margin-bottom:16px;border-right:4px solid #2e86c1">
        <div class="card-header" style="padding:10px 16px"><strong><i class="fas fa-warehouse" style="margin-left:6px"></i> تسجيل وحدات دم واردة (وارد إقليمي)</strong></div>
        <div class="card-body" style="padding:10px 16px">
          <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin-bottom:10px">
            <div class="form-group"><label>بنك الدم المستلَم</label><select class="form-control" id="bbInHosp" data-change="bbInHospChanged" style="min-width:220px">${bbOptHosp(null)}</select></div>
            <div class="form-group" style="position:relative"><label>الجهة الواردة منها</label><input class="form-control" id="bbInSrcName" data-input="bbInSrcChanged" data-focus="bbInSrcChanged" style="min-width:220px" placeholder="اكتب الجهة الواردة منها (مثال: جهاز المدينة الطبية)" dir="rtl"><div id="bbInSrcSuggest" style="display:none;position:absolute;top:100%;right:0;left:0;z-index:99;background:var(--card-bg,#fff);border:1px solid var(--border,#ddd);border-radius:8px;box-shadow:0 6px 16px rgba(0,0,0,.12);max-height:220px;overflow:auto"></div></div>
            <div class="form-group"><label>تاريخ الوارد</label><input class="form-control" type="date" id="bbInDate" value="${today}"></div>
          </div>
          <div id="bbInRows"></div>
          <div style="display:flex;gap:10px;margin-top:6px">
            <button class="btn btn-outline" data-click="bbAddInRow" style="border-color:#2e86c1;color:#2e86c1"><i class="fas fa-plus"></i> إضافة كيس</button>
            <button class="btn btn-primary" data-click="bbDoInSave"><i class="fas fa-save"></i> حفظ الوارد</button>
          </div>
        </div>
      </div>`;
      _bb.inRowN = 0;
      bbAutoHosp('bbInHosp');
      bbAddInRow();
    } else {
      _bb.tTab = null;
      bbTrans();
    }
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}
function bbTransGo(t) {
  if (_bb.tTab === t) return;
  _bb.tTab = t;
  const tb = document.getElementById('bbTransTabs');
  if (tb) tb.style.display = 'none';
  bbRenderTransTab(t);
}
function bbTransBack() {
  if (_bb.tTab) { _bb.tTab = null; bbTrans(); }
  else bbBack();
}
function bbRenderDisp() {
  const body = document.getElementById('bbDispBody');
  if (!body) return;
  const hid = document.getElementById('bbDispFrom') ? parseInt(document.getElementById('bbDispFrom').value) : 0;
  const prod = document.getElementById('bbDispProd') ? document.getElementById('bbDispProd').value : '';
  _bb.selBagIds = [];
  const list = _bb.bags.filter(b => hid && b.hospital_id === hid && (b.status === 'available' || b.status === 'returned') && (!prod || (b.product_type || 'دم') === prod));
  body.innerHTML = list.map(b => `<tr>
    <td><input type="checkbox" class="bb-disp-chk" data-bagid="${b.id}" ${_bb.selBagIds.indexOf(b.id) !== -1 ? 'checked' : ''}></td>
    <td style="text-align:center;direction:ltr;font-weight:700;color:#6c3483">${esc(b.bag_no)}</td>
    <td style="text-align:center;direction:ltr;font-size:11px;color:#888">${esc(b.barcode || '—')}</td>
    <td style="text-align:center">${bbProdCell(b)}</td>
    <td style="text-align:center;font-weight:700;color:${b.blood_type && b.blood_type.endsWith('+') ? '#c0392b' : '#27ae60'}">${esc(b.blood_type || '—')}</td>
    <td style="text-align:center;font-size:11px">${b.expiry_date ? esc(String(b.expiry_date).slice(0, 10)) : '—'}</td>
    <td style="text-align:center">${bbStBadge(b.status)}</td>
  </tr>`).join('') || '<tr><td colspan="7" class="empty-msg">لا توجد أكياس متاحة للإرسال</td></tr>';
}
async function bbDoDispatch() {
  const to = parseInt(document.getElementById('bbDispTo').value);
  if (!to) { showToast('❌ اختر بنك الدم المستهدَف', 'error'); return; }
  const bagIds = Array.from(document.querySelectorAll('.bb-disp-chk:checked')).map(c => parseInt(c.getAttribute('data-bagid')));
  if (!bagIds.length) { showToast('❌ اختر كيساً واحداً على الأقل', 'error'); return; }
  try {
    const r = await api('POST', '/blood-bags/dispatch', { bagIds, toHospitalId: to, note: document.getElementById('bbDispNote').value });
    showToast(`✅ تم إرسال ${r.sent.length} كيس`);
    await bbLoadBags(); bbRenderDisp(); bbRenderRecv();
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}
function bbRenderRecv() {
  const body = document.getElementById('bbRecvBody');
  if (!body) return;
  const hid = document.getElementById('bbRecvHosp') ? parseInt(document.getElementById('bbRecvHosp').value) : 0;
  const list = _bb.bags.filter(b => b.status === 'dispatched' && b.dispatch_to === hid);
  body.innerHTML = list.map(b => `<tr>
    <td style="text-align:center;direction:ltr;font-weight:700;color:#16a085">${esc(b.bag_no)}</td>
    <td style="text-align:center;direction:ltr;font-size:11px;color:#888">${esc(b.barcode || '—')}</td>
    <td style="text-align:center;font-size:11px">${esc(b.source_hospital_name || '—')}</td>
    <td style="text-align:center">${bbProdCell(b)}</td>
    <td style="text-align:center;font-weight:700;color:${b.blood_type && b.blood_type.endsWith('+') ? '#c0392b' : '#27ae60'}">${esc(b.blood_type || '—')}</td>
    <td style="text-align:center">${bbDaysBadge(b.days_left)}</td>
    <td style="text-align:center;font-size:11px">${b.dispatched_at ? esc(new Date(b.dispatched_at).toLocaleDateString('ar-EG')) : '—'}</td>
    ${hasPerm('blood_bags', 'edit') ? `<td style="text-align:center;white-space:nowrap">
      <button class="btn btn-sm" data-click="bbDoAccept" data-args="${b.id}" style="background:#27ae60;color:#fff" title="قبول"><i class="fas fa-check"></i> قبول</button>
      <button class="btn btn-sm btn-outline" data-click="bbReject" data-args="${b.id}" style="margin-right:4px;color:#dc3545" title="رفض"><i class="fas fa-xmark"></i> رفض</button>
    </td>` : ''}
  </tr>`).join('') || `<tr><td colspan="${hasPerm('blood_bags', 'edit') ? 8 : 7}" class="empty-msg">لا توجد أكياس واردة</td></tr>`;
}
async function bbDoAccept(id) {
  try {
    const r = await api('POST', '/blood-bags/receive', { items: [{ id, action: 'accept' }] });
    showToast(`✅ تم استلام ${r.accepted.length} كيس`);
    await bbLoadBags(); bbRenderRecv(); bbRenderDisp();
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}
function bbReject(id) {
  const b = _bb.bags.find(x => x.id === id);
  openModal('رفض استلام الكيس ' + (b ? esc(b.bag_no) : ''),
    `<div class="form-group"><label>سبب الرفض</label><textarea class="form-control" id="bbRejReason" rows="3"></textarea></div>
    <div style="background:#fdecea;border:1px solid #f5b7b1;color:#c0392b;padding:8px 12px;border-radius:8px;font-size:12px;margin-top:8px"><i class="fas fa-info-circle" style="margin-left:4px"></i> سيُعاد الكيس تلقائياً إلى بنك الدم المُرسل</div>`,
    `<button class="btn btn-secondary" data-click="closeModal"><i class="fas fa-times"></i> إلغاء</button>
     <button class="btn btn-danger" data-click="bbDoReject" data-args="${id}"><i class="fas fa-xmark"></i> رفض</button>`);
}
async function bbDoReject(id) {
  const reason = document.getElementById('bbRejReason').value;
  try {
    const r = await api('POST', '/blood-bags/receive', { items: [{ id, action: 'reject', reason }] });
    showToast(`✅ تم رفض ${r.rejected.length} كيس وإعادته للمصدر`);
    closeModal();
    await bbLoadBags(); bbRenderRecv(); bbRenderDisp();
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}

function bbAddInRow() {
  const wrap = document.getElementById('bbInRows');
  if (!wrap) return;
  const i = _bb.inRowN++;
  wrap.insertAdjacentHTML('beforeend', `<div class="bb-row" style="display:grid;grid-template-columns:repeat(9,minmax(80px,1fr));gap:6px;align-items:end;margin-bottom:6px;padding:8px;background:var(--card-bg);border:1px solid var(--border);border-radius:8px">
    <div><label style="font-size:10px">رقم اللي</label><input class="form-control" id="bbIN${i}_no" placeholder="تلقائي" dir="ltr" style="height:30px;font-size:11px"></div>
    <div><label style="font-size:10px">رقم الكود</label><input class="form-control" id="bbIN${i}_barcode" dir="ltr" style="height:30px;font-size:11px"></div>
    <div><label style="font-size:10px">المنتج</label><select class="form-control" id="bbIN${i}_prod" data-change="bbInProdChanged" data-args="${i}" style="height:auto;min-height:30px;font-size:11px;padding:2px 6px;line-height:1.4">${bbOptProduct('دم')}</select></div>
    <div><label style="font-size:10px">الفئة</label><select class="form-control" id="bbIN${i}_cat" style="height:30px;font-size:11px"><option value="كبار" selected>كبار</option><option value="أطفال">أطفال</option></select></div>
    <div><label style="font-size:10px">الفصيلة</label><select class="form-control" id="bbIN${i}_bt" style="height:auto;min-height:30px;font-size:11px;padding:2px 6px;line-height:1.4">${bbOptBt('')}</select></div>
    <div id="bbIN${i}_unitWrap" style="display:none"><label style="font-size:10px">عدد الوحدات</label><input class="form-control" id="bbIN${i}_units" type="number" min="1" value="1" style="height:30px;font-size:11px"></div>
    <div><label style="font-size:10px">تاريخ انتهاء الصلاحية</label><input class="form-control" id="bbIN${i}_exp" type="date" style="height:30px;font-size:11px"></div>
    <div><label style="font-size:10px">ملاحظات</label><input class="form-control" id="bbIN${i}_notes" style="height:30px;font-size:11px"></div>
    <div style="display:flex;align-items:end"><button class="btn btn-sm btn-outline" data-click="bbDelInRow" data-args="${i}" style="height:30px;color:#dc3545"><i class="fas fa-trash"></i></button></div>
  </div>`);
}
function bbInProdChanged(i) {
  const prod = document.getElementById(`bbIN${i}_prod`);
  const unitWrap = document.getElementById(`bbIN${i}_unitWrap`);
  const bt = document.getElementById(`bbIN${i}_bt`);
  if (prod) {
    const simple = prod.value !== 'دم' && prod.value !== 'دم كلي';
    if (unitWrap) unitWrap.style.display = bbProdHasUnits(prod.value) ? 'block' : 'none';
    if (bt) {
      const cur = bt.value;
      bt.innerHTML = bbOptBt(simple && cur && cur.length === 1 ? cur : '', simple);
    }
  }
}
function bbDelInRow(i) { const row = document.querySelector(`[id="bbIN${i}_no"]`)?.closest('.bb-row'); if (row) row.remove(); }
function bbInSrcKnown(hid) {
  const set = [];
  (_bb.bags || []).forEach(b => {
    if (b.hospital_id === hid && b.source_name && b.source_name.trim()) {
      const n = b.source_name.trim();
      if (set.indexOf(n) === -1) set.push(n);
    }
  });
  return set;
}
function bbInSrcChanged() {
  const input = document.getElementById('bbInSrcName');
  const sug = document.getElementById('bbInSrcSuggest');
  if (!input || !sug) return;
  const hospEl = document.getElementById('bbInHosp');
  const hid = hospEl && hospEl.value ? parseInt(hospEl.value) : 0;
  const q = input.value.trim().toLowerCase();
  let list = hid ? bbInSrcKnown(hid) : [];
  if (q) list = list.filter(n => n.toLowerCase().indexOf(q) !== -1);
  const typed = input.value.trim();
  if (typed && list.indexOf(typed) === -1) list = [typed, ...list];
  if (!list.length) { sug.style.display = 'none'; sug.innerHTML = ''; return; }
  sug.innerHTML = list.slice(0, 8).map(n => `<div data-click="bbInSrcPick" data-val="${esc(n)}" style="padding:7px 10px;cursor:pointer;border-bottom:1px solid var(--border,#f0f0f0);font-size:12px;color:#333" data-mouseover="hoverOn" data-mouseout="hoverOff" data-hover-bg="var(--hover-bg,#eef6ff)" data-hover-off="">${esc(n)}</div>`).join('');
  sug.style.display = '';
  if (!window._bbInSugBound) {
    window._bbInSugBound = true;
    document.addEventListener('mousedown', function (ev) {
      const box = document.getElementById('bbInSrcSuggest');
      if (!box || box.style.display === 'none') return;
      if (box.contains(ev.target)) return;
      const inp = document.getElementById('bbInSrcName');
      if (inp && (ev.target === inp || inp.contains(ev.target))) return;
      box.style.display = 'none'; box.innerHTML = '';
    }, true);
  }
}
function bbInSrcPick() {
  const v = this.getAttribute('data-val') || '';
  const input = document.getElementById('bbInSrcName');
  const sug = document.getElementById('bbInSrcSuggest');
  if (input) input.value = v;
  if (sug) { sug.style.display = 'none'; sug.innerHTML = ''; }
}
function bbInHospChanged() {
  const sug = document.getElementById('bbInSrcSuggest');
  if (sug) { sug.style.display = 'none'; sug.innerHTML = ''; }
  bbInSrcChanged();
}
async function bbDoInSave() {
  const hospitalId = parseInt(document.getElementById('bbInHosp').value);
  const sourceName = document.getElementById('bbInSrcName').value.trim();
  const receivedDate = document.getElementById('bbInDate').value;
  if (!hospitalId) { showToast('❌ اختر بنك الدم المستلَم', 'error'); return; }
  if (!sourceName) { showToast('❌ اكتب الجهة الواردة منها', 'error'); return; }
  const bags = [];
  for (let i = 0; i < _bb.inRowN; i++) {
    const no = document.getElementById(`bbIN${i}_no`);
    if (!no) continue;
    bags.push({
      bag_no: no.value,
      barcode: document.getElementById(`bbIN${i}_barcode`).value,
      product_type: document.getElementById(`bbIN${i}_prod`).value || 'دم',
      units: parseInt(document.getElementById(`bbIN${i}_units`).value) || 1,
      unit_category: (document.getElementById(`bbIN${i}_cat`) ? document.getElementById(`bbIN${i}_cat`).value : '') || 'كبار',
      blood_type: document.getElementById(`bbIN${i}_bt`).value,
      expiry_date: document.getElementById(`bbIN${i}_exp`).value || null,
      notes: document.getElementById(`bbIN${i}_notes`).value
    });
  }
  if (!bags.length) { showToast('❌ أضف كيس واحد على الأقل', 'error'); return; }
  try {
    const r = await api('POST', '/blood-bags/external-in', { hospitalId, sourceName, receivedDate, bags });
    showToast(`✅ تم تسجيل ${r.bags.length} كيس وارد من «${sourceName}» وتمت إضافته لرصيد ${_bb.hospitals.find(h => h.id === hospitalId)?.name || 'المستشفى'}`);
    await bbTrans();
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}
function bbRenderInLog() {
  const body = document.getElementById('bbInLogBody');
  if (!body) return;
  const q = bbStatsQ();
  const { from, to } = bbStatsPeriod();
  let list = _bb.bags
    .filter(b => b.received_at && bbInPeriod(b.received_at, from, to))
    .sort((a, b) => (b.received_at || '').localeCompare(a.received_at || ''));
  if (q) list = list.filter(b =>
    (b.bag_no || '').toLowerCase().indexOf(q) !== -1 ||
    (b.barcode || '').toLowerCase().indexOf(q) !== -1 ||
    (b.source_hospital_name || '').toLowerCase().indexOf(q) !== -1 ||
    (b.received_by || '').toLowerCase().indexOf(q) !== -1);
  _bb.lastFilteredInLog = list;
  body.innerHTML = list.map(b => `<tr>
    <td style="text-align:center;direction:ltr;font-weight:700;color:#2e86c1">${esc(b.bag_no)}</td>
    <td style="text-align:center;direction:ltr;font-size:11px;color:#888">${esc(b.barcode || '—')}</td>
    <td style="text-align:center;font-size:11px">${esc(b.source_hospital_name || '—')}</td>
    <td style="text-align:center;font-size:11px">${esc(b.hospital_name || '—')}</td>
    <td style="text-align:center">${bbProdCell(b)}</td>
    <td style="text-align:center;font-weight:700;color:${b.blood_type && b.blood_type.endsWith('+') ? '#c0392b' : '#27ae60'}">${esc(b.blood_type || '—')}</td>
    <td style="text-align:center">${bbDaysBadge(b.days_left)}</td>
    <td style="text-align:center;font-size:11px">${b.received_at ? esc(new Date(b.received_at).toLocaleDateString('ar-EG')) : '—'}</td>
    <td style="text-align:center;font-size:11px">${esc(b.received_by || '—')}</td>
    <td style="text-align:center">${bbStBadge(b.status)}</td>
  </tr>`).join('') || '<tr><td colspan="10" class="empty-msg">لا توجد وحدات واردة مسجلة</td></tr>';
}
function bbExportInLog() {
  const list = _bb.lastFilteredInLog || [];
  if (!list.length) { showToast('❌ لا توجد وحدات واردة مطابقة للتصدير', 'error'); return; }
  bbXlsx(
    ['رقم اللي', 'رقم الكود', 'من (الجهة)', 'إلى', 'المنتج', 'الفصيلة', 'تاريخ الصلاحية', 'المتبقي (يوم)', 'تاريخ الوصول', 'بواسطة', 'الحالة'],
    list.map(b => [b.bag_no, b.barcode || '—', b.source_hospital_name || '—', b.hospital_name || '—', b.product_type || 'دم', b.blood_type || '—',
      b.expiry_date ? String(b.expiry_date).slice(0, 10) : '—', b.days_left !== null && b.days_left !== undefined ? b.days_left : '—',
      b.received_at ? String(b.received_at).slice(0, 10) : '—', b.received_by || '—', BB_ST_LABELS[b.status] || b.status]),
    'سجل الوارد', 'سجل_الوارد.xlsx', 'نظام بنك الدم — سجل الوارد (القائمة المفلترة حالياً)');
}

function bbUndoBtns(b) {
  if (!hasPerm('blood_bags', 'edit')) return '';
  let h = '';
  if (b.status === 'disposed') h += `<button class="btn btn-sm" data-click="bbUndoDispose" data-args="${b.id}" title="إلغاء الإعدام — إعادة الكيس إلى الرصيد المتاح" style="background:#27ae6022;color:#27ae60;border:1px solid #27ae60;padding:3px 8px;border-radius:6px;font-size:11px;margin-right:4px"><i class="fas fa-rotate-left"></i> إلغاء الإعدام</button>`;
  if (b.status === 'issued') h += `<button class="btn btn-sm" data-click="bbUndoIssue" data-args="${b.id}" title="إلغاء الصرف — إعادة الكيس إلى الرصيد المتاح" style="background:#16a08522;color:#16a085;border:1px solid #16a085;padding:3px 8px;border-radius:6px;font-size:11px;margin-right:4px"><i class="fas fa-rotate-left"></i> إلغاء الصرف</button>`;
  return h;
}
function bbUndoDispose(id) {
  const b = _bb.bags.find(x => x.id === id);
  if (!b) return;
  showConfirmModal(`إلغاء الإعدام — الكيس ${esc(b.bag_no || '')}؟ سيُعاد الكيس إلى الرصيد المتاح (${esc(b.product_type || 'دم')}).`, () => bbUndoGo(id, 'dispose'));
}
function bbUndoIssue(id) {
  const b = _bb.bags.find(x => x.id === id);
  if (!b) return;
  showConfirmModal(`إلغاء الصرف — الكيس ${esc(b.bag_no || '')}؟ سيُلغى الصرف ويُعاد الكيس إلى الرصيد المتاح.`, () => bbUndoGo(id, 'issue'));
}
async function bbUndoGo(id, mode) {
  try {
    await api('POST', '/blood-bags/' + id + '/undo', { mode });
    showToast(mode === 'dispose' ? '✅ تم إلغاء الإعدام — عاد الكيس إلى الرصيد' : '✅ تم إلغاء الصرف — عاد الكيس إلى الرصيد');
    await bbLoadBags(); await bbLoadReservations();
    bbRenderBagReport(); bbRenderExpLog(); bbRenderDispLog(); bbRenderResLog(); bbResRefresh();
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}
function bbRenderBagReport() {
  const body = document.getElementById('bbBagReportBody');
  if (!body) return;
  const canEdit = hasPerm('blood_bags', 'edit');
  const q = bbStatsQ();
  const { from, to } = bbStatsPeriod();
  const prod = document.getElementById('bbBagRptProd') ? document.getElementById('bbBagRptProd').value : '';
  const st = document.getElementById('bbBagRptSt') ? document.getElementById('bbBagRptSt').value : '';
  let list = (_bb.bags || []).slice().filter(b => bbInPeriod(b.created_at || b.updated_at, from, to)).sort((a, b) => (b.created_at || b.updated_at || '').localeCompare(a.created_at || a.updated_at || ''));
  if (q) list = list.filter(b =>
    (b.bag_no || '').toLowerCase().indexOf(q) !== -1 ||
    (b.barcode || '').toLowerCase().indexOf(q) !== -1 ||
    (b.hospital_name || bbHospName(b.hospital_id) || '').toLowerCase().indexOf(q) !== -1 ||
    (b.blood_type || '').toLowerCase().indexOf(q) !== -1);
  if (prod) list = list.filter(b => (b.product_type || 'دم') === prod);
  if (st) list = list.filter(b => b.status === st);
  _bb.lastFilteredBagReport = list;
  const raiseColor = (b) => {
    const r = String(b.return_reason || '');
    if (bbStBadge && r) return `<span style="display:inline-block;padding:2px 8px;border-radius:10px;background:#fdecea;color:#e74c3c;font-size:11px;font-weight:700">${esc(r)}</span>`;
    return '—';
  };
  body.innerHTML = list.map(b => `<tr>
    <td style="text-align:center;font-size:11px">${esc(b.hospital_governorate || (_bb.hospitals.find(h => h.id === parseInt(b.hospital_id))?.governorate || '—'))}</td>
    <td style="text-align:right;font-weight:600">${esc(b.hospital_name || bbHospName(b.hospital_id) || '—')}</td>
    <td style="text-align:center">${bbProdCell(b)}</td>
    <td style="text-align:center;font-weight:700;color:${b.blood_type && b.blood_type.endsWith('+') ? '#c0392b' : '#27ae60'}">${esc(b.blood_type || '—')}</td>
    <td style="text-align:center;direction:ltr;font-weight:700;color:#f39c12">${esc(b.bag_no)}</td>
    <td style="text-align:center;direction:ltr;font-size:11px;color:#8e44ad">${esc(b.barcode || '—')}</td>
    <td style="text-align:center;font-size:11px">${b.expiry_date ? esc(String(b.expiry_date).slice(0, 10)) : '—'}</td>
    <td style="text-align:center">${bbStBadge(b.status)}</td>
    <td style="text-align:center">${bbDaysBadge(b.days_left)}</td>
    <td style="text-align:center">${raiseColor(b)}</td>
    <td style="text-align:center;white-space:nowrap">${canEdit ? bbUndoBtns(b) : ''}<button class="btn btn-sm" data-click="bbEvents" data-args="${b.id}" title="سجل أحداث الكيس" style="background:#2e86c122;color:#2e86c1;border:none;padding:3px 10px;border-radius:6px;font-size:11px"><i class="fas fa-clock-rotate-left"></i></button></td>
  </tr>`).join('') || `<tr><td colspan="11" class="empty-msg">لا توجد أكياس مطابقة</td></tr>`;
}

function bbExportBagReport() {
  const list = _bb.lastFilteredBagReport || [];
  if (!list.length) { showToast('❌ لا توجد أكياس مطابقة للتصدير', 'error'); return; }
  bbXlsx(
    ['الفرع', 'اسم المستشفي', 'المنتج', 'فصيلة الوحدة', 'رقم اللي', 'الباركود', 'تاريخ الانتهاء', 'الحالة', 'المتبقي (يوم)', 'سبب الإعدام'],
    list.map(b => [(b.hospital_governorate || (_bb.hospitals.find(h => h.id === parseInt(b.hospital_id))?.governorate || '—')), (b.hospital_name || bbHospName(b.hospital_id) || '—'),
      b.product_type || 'دم', b.blood_type || '—', b.bag_no, b.barcode || '—',
      b.expiry_date ? String(b.expiry_date).slice(0, 10) : '—', BB_ST_LABELS[b.status] || b.status,
      b.days_left !== null && b.days_left !== undefined ? b.days_left : '—', (b.return_reason || '—')]),
    'تقرير الأكياس التفصيلي', 'تقرير_الأكياس.xlsx', 'نظام بنك الدم — تقرير الأكياس التفصيلي (القائمة المفلترة حالياً)');
}

function bbRenderExpLog() {
  const body = document.getElementById('bbExpLogBody');
  if (!body) return;
  const canEdit = hasPerm('blood_bags', 'edit');
  const stEl = document.getElementById('bbExpLogSt');
  const q = bbStatsQ();
  const { from, to } = bbStatsPeriod();
  const st = stEl ? stEl.value : '';
  let list = (_bb.bags || []).slice().filter(b => bbInPeriod(b.received_at || b.collection_date || b.created_at, from, to));
  if (st) {
    if (st === 'expired') list = list.filter(b => (b.return_reason || '') === 'انتهاء الصلاحية');
    else if (st === 'issued') list = list.filter(b => b.status === 'issued');
    else if (st === 'disposed') list = list.filter(b => ['disposed','therapeutic','incomplete','fatty','icteric','lipemic','hemolyzed'].indexOf(b.status) !== -1);
    else if (st === 'returned') list = list.filter(b => b.status === 'returned');
    else if (st === 'reaction') list = list.filter(b => b.status === 'reaction');
  }
  if (q) list = list.filter(b => [b.bag_no, b.barcode, b.hospital_name || bbHospName(b.hospital_id), b.blood_type, b.recipient_name].join(' ').toLowerCase().indexOf(q) !== -1);
  list.sort((a, b) => (b.received_at || b.collection_date || b.created_at || '').localeCompare(a.received_at || a.collection_date || a.created_at || ''));
  _bb.lastExpLog = list;
  const rc = (b) => { const r = b.return_reason || ''; if (!r) return '—'; return `<span style="background:#fdecea;color:#e74c3c;padding:2px 8px;border-radius:10px;font-size:11px">${esc(r)}</span>`; };
  const expiryRow = (b) => String(b.return_reason || '') === 'انتهاء الصلاحية';
  body.innerHTML = list.map(b => `<tr style="${expiryRow(b) ? 'background:#fdf2f2;' : ''}">
    <td style="text-align:center;font-size:11px">${esc(b.hospital_governorate || (_bb.hospitals.find(h => h.id === parseInt(b.hospital_id))?.governorate || '—'))}</td>
    <td style="text-align:right;font-weight:600">${esc(b.hospital_name || bbHospName(b.hospital_id) || '—')}</td>
    <td style="text-align:center;direction:ltr;font-weight:700;color:#f39c12">${esc(b.bag_no || '—')}</td>
    <td style="text-align:center;direction:ltr;color:#8e44ad">${esc(b.barcode || '—')}</td>
    <td style="text-align:center">${bbProdCell(b)}</td>
    <td style="text-align:center;font-weight:700;color:${(b.blood_type || '').indexOf('-') !== -1 ? '#27ae60' : '#c0392b'}">${esc(b.blood_type || '—')}</td>
    <td style="text-align:center;font-size:11px">${b.received_at ? esc(String(b.received_at).slice(0, 10)) : (b.collection_date ? esc(String(b.collection_date).slice(0, 10)) : '—')}</td>
    <td style="text-align:center;font-size:11px">${b.collection_date ? esc(String(b.collection_date).slice(0, 10)) : '—'}</td>
    <td style="text-align:center;font-size:11px">${b.expiry_date ? esc(String(b.expiry_date).slice(0, 10)) : '—'}</td>
    <td style="text-align:center">${bbDaysBadge(b.days_left)}</td>
    <td style="text-align:center">${bbStBadge(b.status)}</td>
    <td style="text-align:center">${rc(b)}</td>
    <td style="text-align:center;font-size:11px">${b.issued_at ? esc(String(b.issued_at).slice(0, 10)) : '—'}</td>
    <td style="text-align:center;font-size:11px">${esc(b.recipient_name || '—')}</td>
    <td style="text-align:center;white-space:nowrap">${canEdit ? bbUndoBtns(b) : ''}<button class="btn btn-sm" data-click="bbEvents" data-args="${b.id}" title="سجل أحداث الكيس" style="background:#2e86c122;color:#2e86c1;border:none;padding:3px 10px;border-radius:6px;font-size:11px"><i class="fas fa-clock-rotate-left"></i></button></td>
  </tr>`).join('') || `<tr><td colspan="15" class="empty-msg">لا توجد أكياس مطابقة</td></tr>`;
}
function bbExportExpLog() {
  const list = _bb.lastExpLog || [];
  if (!list.length) { showToast('❌ لا توجد أكياس مطابقة للتصدير', 'error'); return; }
  bbXlsx(
    ['الفرع', 'اسم المستشفي', 'رقم اللي', 'الباركود', 'المنتج', 'فصيلة الوحدة', 'تاريخ الوارد', 'تاريخ الجمع', 'تاريخ الانتهاء', 'المتبقي (يوم)', 'الحالة', 'سبب الإعدام', 'تاريخ الصرف', 'المصروف إليه'],
    list.map(b => [(b.hospital_governorate || (_bb.hospitals.find(h => h.id === parseInt(b.hospital_id))?.governorate || '—')), (b.hospital_name || bbHospName(b.hospital_id) || '—'),
      b.bag_no, b.barcode || '—', b.product_type || 'دم', b.blood_type || '—',
      b.received_at ? String(b.received_at).slice(0, 10) : (b.collection_date ? String(b.collection_date).slice(0, 10) : '—'),
      b.collection_date ? String(b.collection_date).slice(0, 10) : '—',
      b.expiry_date ? String(b.expiry_date).slice(0, 10) : '—',
      b.days_left !== null && b.days_left !== undefined ? b.days_left : '—', BB_ST_LABELS[b.status] || b.status,
      (b.return_reason || '—'),
      b.issued_at ? String(b.issued_at).slice(0, 10) : '—', (b.recipient_name || '—')]),
    'سجل انتهاء صلاحيه', 'سجل_انتهاء_الصلاحية.xlsx', 'نظام بنك الدم — كل الأكياس الواردة كاملة + بيانات الصرف + الإعدام بانتهاء الصلاحية (القائمة المفلترة حالياً)');
}

function bbRenderDispLog() {
  const body = document.getElementById('bbDispLogBody');
  if (!body) return;
  const canEdit = hasPerm('blood_bags', 'edit');
  const stEl = document.getElementById('bbDispLogSt');
  const q = bbStatsQ();
  const { from, to } = bbStatsPeriod();
  const st = stEl ? stEl.value : '';
  let list = (_bb.bags || []).slice().filter(b => {
    if (!bbInPeriod(b.issued_at || b.updated_at, from, to)) return false;
    if (b.status === 'issued') return true;
    if (b.status === 'reaction' || b.status === 'returned') return true;
    if (b.status === 'disposed' && b.return_reason && String(b.return_reason) !== 'انتهاء الصلاحية') return true;
    return false;
  });
  if (st) {
    if (st === 'issued') list = list.filter(b => b.status === 'issued');
    else if (st === 'reaction') list = list.filter(b => b.status === 'reaction');
    else if (st === 'returned') list = list.filter(b => b.status === 'returned');
    else if (st === 'disposed') list = list.filter(b => b.status === 'disposed');
  }
  if (q) list = list.filter(b => [b.bag_no, b.barcode, b.hospital_name || bbHospName(b.hospital_id), b.blood_type, b.recipient_name, b.issued_by, b.issue_type].join(' ').toLowerCase().indexOf(q) !== -1);
  list.sort((a, b) => (b.issued_at || b.updated_at || '').localeCompare(a.issued_at || a.updated_at || ''));
  _bb.lastDispLog = list;
  const rc = (b) => { const r = b.return_reason || ''; if (!r) return '—'; return `<span style="background:#fdecea;color:#e74c3c;padding:2px 8px;border-radius:10px;font-size:11px">${esc(r)}</span>`; };
  body.innerHTML = list.map(b => `<tr>
    <td style="text-align:center;font-size:11px">${esc(b.hospital_governorate || (_bb.hospitals.find(h => h.id === parseInt(b.hospital_id))?.governorate || '—'))}</td>
    <td style="text-align:right;font-weight:600">${esc(b.hospital_name || bbHospName(b.hospital_id) || '—')}</td>
    <td style="text-align:center;direction:ltr;font-weight:700;color:#f39c12">${esc(b.bag_no || '—')}</td>
    <td style="text-align:center;direction:ltr;color:#8e44ad">${esc(b.barcode || '—')}</td>
    <td style="text-align:center">${bbProdCell(b)}</td>
    <td style="text-align:center;font-weight:700;color:${(b.blood_type || '').indexOf('-') !== -1 ? '#27ae60' : '#c0392b'}">${esc(b.blood_type || '—')}</td>
    <td style="text-align:center;font-size:11px">${b.issued_at ? esc(String(b.issued_at).slice(0, 10)) : '—'}</td>
    <td style="text-align:center;font-size:11px">${esc(b.recipient_name || '—')}</td>
    <td style="text-align:center;font-size:11px">${esc(b.issued_by || '—')}</td>
    <td style="text-align:center;font-size:11px">${esc(b.issue_type || '—')}</td>
    <td style="text-align:center">${bbStBadge(b.status)}</td>
    <td style="text-align:center">${rc(b)}</td>
    <td style="text-align:center;white-space:nowrap">${canEdit ? bbUndoBtns(b) : ''}<button class="btn btn-sm" data-click="bbEvents" data-args="${b.id}" title="سجل أحداث الكيس" style="background:#2e86c122;color:#2e86c1;border:none;padding:3px 10px;border-radius:6px;font-size:11px"><i class="fas fa-clock-rotate-left"></i></button></td>
  </tr>`).join('') || `<tr><td colspan="13" class="empty-msg">لا توجد أكياس مطابقة</td></tr>`;
}
function bbExportDispLog() {
  const list = _bb.lastDispLog || [];
  if (!list.length) { showToast('❌ لا توجد أكياس مطابقة للتصدير', 'error'); return; }
  bbXlsx(
    ['الفرع', 'اسم المستشفي', 'رقم اللي', 'الباركود', 'المنتج', 'فصيلة الوحدة', 'تاريخ الصرف', 'المصروف إليه', 'بواسطة', 'نوع الصرف', 'الحالة', 'سبب الإعدام'],
    list.map(b => [(b.hospital_governorate || (_bb.hospitals.find(h => h.id === parseInt(b.hospital_id))?.governorate || '—')), (b.hospital_name || bbHospName(b.hospital_id) || '—'),
      b.bag_no, b.barcode || '—', b.product_type || 'دم', b.blood_type || '—',
      b.issued_at ? String(b.issued_at).slice(0, 10) : '—', (b.recipient_name || '—'),
      (b.issued_by || '—'), (b.issue_type || '—'), BB_ST_LABELS[b.status] || b.status, (b.return_reason || '—')]),
    'سجل الصرف والتفاعل والمرتجع', 'سجل_الصرف_والتفاعل.xlsx', 'نظام بنك الدم — سجل الصرف كاملاً + ما تم إعدامه (تفاعل / مرتجع / نظام مفتوح / أخرى)');
}

/* ----- الفصائل والتوافق ----- */
async function bbCompat() {
  const el = document.getElementById('bbBody');
  showPageLoading(el, 'جاري التحميل...');
  try {
    const canAdd = hasPerm('blood_bags', 'add');
    const canEdit = hasPerm('blood_bags', 'edit');
    const canDelete = hasPerm('blood_bags', 'delete');
    const myHosp = (window._user && parseInt(window._user.hospitalId)) || 0;
    const showHosp = !myHosp;
    let html = `<div class="card" style="margin-bottom:16px;border-right:4px solid #e91e63">
      <div class="card-header" style="padding:10px 16px"><strong><i class="fas fa-user-plus" style="margin-left:6px"></i> بيانات المريض</strong></div>
      <div class="card-body" style="padding:10px 16px">
        <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end">
          ${showHosp ? `<div class="form-group"><label>بنك الدم</label><select class="form-control" id="bbC_hosp" data-change="bbCompatDeptChanged" style="min-width:200px">${bbOptHosp('')}</select></div>` : ''}
          <div class="form-group"><label>الرقم الطبي *</label><input class="form-control" id="bbC_nid" dir="ltr" style="min-width:150px" data-input="bbCompatLookupPatient"></div>
          <div class="form-group"><label>الاسم *</label><input class="form-control" id="bbC_name" style="min-width:180px"></div>
          <div class="form-group"><label>السن</label><input class="form-control" type="number" id="bbC_age" style="width:70px"></div>
          <div class="form-group"><label>النوع</label><select class="form-control" id="bbC_gender" style="width:90px"><option value="">—</option><option>ذكر</option><option>أنثى</option></select></div>
          <div class="form-group"><label>القسم</label><select class="form-control" id="bbC_dept" style="min-width:150px"><option value="">—</option></select></div>
          <div class="form-group"><label>الفصيلة</label><select class="form-control" id="bbC_bt" data-change="bbCompatBtChanged" style="min-width:90px">${bbOptBt('')}</select></div>
          <div class="form-group"><label>تاريخ آخر عمل فصيلة</label><input class="form-control" type="date" id="bbC_btDate" style="width:150px"></div>
          <div class="form-group"><label>عدد كروت الفصيلة</label><input class="form-control" type="number" id="bbC_cards" value="0" min="0" style="width:80px" data-change="bbCompatCardsChanged"></div>
          ${canAdd ? `<button class="btn btn-primary" data-click="bbCompatSavePatient" style="height:32px"><i class="fas fa-save"></i> حفظ المريض</button>` : ''}
        </div>
        <div id="bbCompatInfo"></div>
      </div>
    </div>
    <div class="card" style="margin-bottom:16px;border-right:4px solid #1976d2">
      <div class="card-header" style="padding:10px 16px"><strong><i class="fas fa-clipboard-list" style="margin-left:6px"></i> المطلوب</strong></div>
      <div class="card-body" style="padding:10px 16px">
        <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end">
          <div class="form-group"><label>كرات دم</label><input class="form-control" type="number" id="bbC_reqRbc" value="0" min="0" style="width:80px"></div>
          <div class="form-group"><label>بلازما</label><input class="form-control" type="number" id="bbC_reqPlasma" value="0" min="0" style="width:80px"></div>
          <div class="form-group"><label>صفائح</label><input class="form-control" type="number" id="bbC_reqPlt" value="0" min="0" style="width:80px"></div>
          <div class="form-group"><label>كرايو</label><input class="form-control" type="number" id="bbC_reqCryo" value="0" min="0" style="width:80px"></div>
          <span style="font-size:11px;color:#777;margin-bottom:8px">كميات الأكياس المطلوبة لهذا المريض</span>
        </div>
      </div>
    </div>
    <div class="card" style="margin-bottom:16px;border-right:4px solid #f39c12">
      <div class="card-header" style="padding:10px 16px"><strong><i class="fas fa-arrows-to-circle" style="margin-left:6px"></i> توافق الكيس — حجز / تجديد / فك حجز</strong></div>
      <div class="card-body" style="padding:10px 16px">
        <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin-bottom:10px">
          <div class="form-group" style="position:relative"><label>رقم اللي / الباركود *</label><input class="form-control" id="bbC_bagNo" dir="ltr" style="min-width:180px" autocomplete="off" data-input="bbCompatBagLookupInput"><div id="bbCbagSuggest" style="position:absolute;top:100%;right:0;left:0;z-index:99;background:var(--card-bg,#fff);border:1px solid var(--border,#d5dbdb);border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,.18);max-height:230px;overflow:auto;display:none"></div></div>
          <div class="form-group"><label>عدد كروت التوافق</label><input class="form-control" type="number" id="bbC_compatCards" value="0" min="0" style="width:90px"></div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end">
          <div class="form-group"><label>الباركود</label><input class="form-control" id="bbC_bagBarcode" readonly style="width:120px;background:#f4f6f7"></div>
          <div class="form-group"><label>المنتج</label><input class="form-control" id="bbC_bagProd" readonly style="width:120px;background:#f4f6f7"></div>
          <div class="form-group"><label>عدد الوحدات</label><input class="form-control" type="number" id="bbC_bagUnits" readonly style="width:80px;background:#f4f6f7"></div>
          <div class="form-group"><label>الفصيلة</label><input class="form-control" id="bbC_bagBt" readonly style="width:80px;background:#f4f6f7"></div>
          <div class="form-group"><label>تاريخ انتهاء الصلاحية</label><input class="form-control" id="bbC_bagExp" readonly style="width:140px;background:#f4f6f7"></div>
        </div>
        <div id="bbCbagInfo"></div>
        <div id="bbCbagActions" style="display:flex;flex-wrap:wrap;gap:10px;margin-top:10px"></div>
      </div>
    </div>`;
    el.innerHTML = html;
    await Promise.all([bbLoadPatients(), bbLoadDepartments(), bbLoadBags(), bbLoadReservations()]);
    if (myHosp) {
      const hs = document.createElement('input');
      hs.type = 'hidden'; hs.id = 'bbC_hosp'; hs.value = myHosp;
      el.appendChild(hs);
    }
    bbCompatDeptChanged();
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}
async function bbLoadPatients() { try { const r = await api('GET', '/patients'); _bb.patients = r.patients || []; } catch (e) { _bb.patients = []; } }
async function bbLoadDepartments() { try { const r = await api('GET', '/hospital-departments'); _bb.departments = r.departments || []; } catch (e) { _bb.departments = []; } }
function bbHospName(hid) { const h = _bb.hospitals.find(x => x.id === parseInt(hid)); return h ? h.name : (hid ? '—' : '—'); }
function bbCompatDeptChanged() {
  const hospSel = document.getElementById('bbC_hosp');
  const deptSel = document.getElementById('bbC_dept');
  if (!hospSel || !deptSel) return;
  const hid = parseInt(hospSel.value);
  const list = _bb.departments.filter(d => d.hospital_id === hid);
  deptSel.innerHTML = `<option value="">—</option>` + list.map(d => `<option value="${esc(d.name)}">${esc(d.name)}</option>`).join('');
}
function bbCompatBtChanged() {
  const bt = document.getElementById('bbC_bt');
  const dt = document.getElementById('bbC_btDate');
  if (!bt || !dt) return;
  if (bt.value) { dt.value = fmtCairoDate('date'); }
}
function bbCompatCardsChanged() {
  const c = document.getElementById('bbC_cards');
  const dt = document.getElementById('bbC_btDate');
  if (!c || !dt) return;
  const v = parseInt(c.value) || 0;
  if (v > 0) { dt.value = fmtCairoDate('date'); }
}
function bbCompatClearPatient(showPrompt) {
  _bb.selPatient = null;
  _bb.histHidden = false;
  const clr = { bbC_name: '', bbC_age: '', bbC_cards: '0', bbC_reqRbc: '0', bbC_reqPlasma: '0', bbC_reqPlt: '0', bbC_reqCryo: '0' };
  for (const k in clr) { const el = document.getElementById(k); if (el) el.value = clr[k]; }
  const genEl = document.getElementById('bbC_gender'); if (genEl) genEl.value = '';
  const btEl = document.getElementById('bbC_bt'); if (btEl) { btEl.value = ''; btEl.disabled = false; btEl.removeAttribute('title'); }
  const btDEl = document.getElementById('bbC_btDate'); if (btDEl) btDEl.value = '';
  const deptEl = document.getElementById('bbC_dept'); if (deptEl) deptEl.innerHTML = '<option value="">—</option>';
  const div = document.getElementById('bbCompatInfo');
  if (div) div.innerHTML = showPrompt ? '<div style="background:#fff8e1;border:1px solid #ffe082;color:#f57f17;padding:8px 12px;border-radius:8px;font-size:12px;margin-top:8px"><i class="fas fa-plus" style="margin-left:4px"></i> رقم طبي جديد — أكمل البيانات ثم اضغط حفظ المريض</div>' : '';
}
function bbCompatLookupPatient() {
  const div = document.getElementById('bbCompatInfo');
  const nid = document.getElementById('bbC_nid').value.trim();
  if (!nid) { if (div) div.innerHTML = ''; return; }
  const p = _bb.patients.find(x => x.national_id === nid);
  if (p && div) {
    _bb.selPatient = p.id;
    const nameEl = document.getElementById('bbC_name'); if (nameEl) { nameEl.value = p.name || ''; }
    const ageEl = document.getElementById('bbC_age'); if (ageEl && p.age != null) { ageEl.value = p.age; }
    const genEl = document.getElementById('bbC_gender'); if (genEl && p.gender) { genEl.value = p.gender; }
    const btEl = document.getElementById('bbC_bt'); if (btEl) { if (p.blood_type) { btEl.value = p.blood_type; btEl.disabled = true; btEl.title = 'فصيلة المريض ثابتة ولا تتغير نهائياً'; } else { btEl.disabled = false; btEl.removeAttribute('title'); } }
    const btDEl = document.getElementById('bbC_btDate'); if (btDEl && p.bt_date) { btDEl.value = String(p.bt_date).slice(0, 10); }
    const rbcEl = document.getElementById('bbC_reqRbc'); if (rbcEl && p.req_rbc != null) { rbcEl.value = p.req_rbc; }
    const plaEl = document.getElementById('bbC_reqPlasma'); if (plaEl && p.req_plasma != null) { plaEl.value = p.req_plasma; }
    const pltEl = document.getElementById('bbC_reqPlt'); if (pltEl && p.req_plt != null) { pltEl.value = p.req_plt; }
    const cryEl = document.getElementById('bbC_reqCryo'); if (cryEl && p.req_cryo != null) { cryEl.value = p.req_cryo; }
    const hospEl = document.getElementById('bbC_hosp'); if (hospEl && p.hospital_id) { hospEl.value = p.hospital_id; bbCompatDeptChanged(); }
    const deptEl = document.getElementById('bbC_dept'); if (deptEl && p.department) { deptEl.value = p.department; }
    div.innerHTML = bbCompatPatientChips(p) + bbCompatPatientHistory(p);
  } else {
    bbCompatClearPatient(true);
  }
}
function bbCompatPatientChips(p) {
  if (!p || !p.blood_type) return '';
  const own = p.blood_type;
  const donors = bbDonorsFor(own);
  if (!donors.length) return '';
  const chip = bt => {
    const isOwn = bt === own;
    const col = bt.endsWith('+') ? '#c0392b' : '#27ae60';
    return `<span style="display:inline-block;padding:4px 12px;border-radius:20px;background:${isOwn ? col : col + '1a'};color:${isOwn ? '#fff' : col};border:1px solid ${col};font-size:12px;font-weight:700;margin:3px 3px 0 0;cursor:default" title="${isOwn ? 'فصيلة المريض — الأكثر تفضيلاً' : 'متوافق مع المريض'}">${esc(bt)}${isOwn ? ' <i class="fas fa-user" style="font-size:10px"></i>' : ''}</span>`;
  };
  return `<div style="margin-top:10px;border:1px solid var(--border,#d5dbdb);border-radius:8px;overflow:hidden">
    <div style="background:#eaf7ec;color:#1e8449;padding:7px 12px;font-size:12px;font-weight:700"><i class="fas fa-hand-holding-medical" style="margin-left:6px"></i> الفصائل المتوافقة للمريض <strong>${esc(own)}</strong></div>
    <div style="padding:8px 12px">${donors.map(chip).join('')}</div>
  </div>`;
}
function bbCompatPatientHistory(p) {
  if (!p || !p.id) return '';
  const rows = (_bb.reservations || [])
    .filter(r => r.patient_id === p.id && r.status === 'issued')
    .sort((a, b) => String(b.issued_at || '').localeCompare(String(a.issued_at || '')));
  if (!rows.length) return '';
  const dateFmt = d => { if (!d) return '—'; const s = String(d).slice(0, 10); return s; };
  const trs = rows.map(r => {
    const prod = r.product_type || 'دم';
    const prodStyle = { 'دم': 'color:#c0392b', 'بلازما': 'color:#16a085', 'كرايو': 'color:#d35400', 'صفائح SDP': 'color:#8e44ad', 'صفائح RDP': 'color:#8e44ad' };
    const pBt = p.blood_type || r.patient_blood_type || '—';
    return `<tr>
      <td style="text-align:center">${dateFmt(r.issued_at)}</td>
      <td>${esc(r.hospital_name || '—')}</td>
      <td style="text-align:center">${esc(pBt)}</td>
      <td><span style="${prodStyle[prod] || ''};font-weight:600">${esc(prod)}</span></td>
      <td style="text-align:center">${esc(r.blood_type || '—')}</td>
      <td dir="ltr" style="text-align:center">${esc(r.bag_no || '—')}</td>
      <td dir="ltr" style="text-align:center">${esc(r.barcode || '—')}</td>
    </tr>`;
  }).join('');
  const hidden = !!_bb.histHidden;
  return `<div style="margin-top:12px;border:1px solid var(--border,#d5dbdb);border-radius:8px;overflow:hidden">
    <div data-click="bbCompatHistToggle" style="cursor:pointer;background:#e8f4f8;color:#0d7377;padding:8px 12px;font-size:13px;font-weight:700;display:flex;justify-content:space-between;align-items:center;user-select:none"><span><i class="fas fa-history" style="margin-left:6px"></i> المنتجات التي حصل عليها المريض</span><i id="bbCompatHistIco" class="fas fa-chevron-${hidden ? 'down' : 'up'}" style="font-size:11px;opacity:.8"></i></div>
    <table id="bbCompatHistTbl" class="data-table" style="font-size:12px;width:100%;${hidden ? 'display:none' : ''}"><thead><tr><th>التاريخ</th><th>بنك الدم</th><th>فصيلة المريض</th><th>المنتج</th><th>فصيلة الوحدة</th><th>رقم اللي</th><th>رقم الباركود</th></tr></thead><tbody>${trs}</tbody></table>
  </div>`;
}
function bbCompatHistToggle() {
  const tbl = document.getElementById('bbCompatHistTbl');
  if (!tbl) return;
  _bb.histHidden = !_bb.histHidden;
  tbl.style.display = _bb.histHidden ? 'none' : '';
  const ic = document.getElementById('bbCompatHistIco');
  if (ic) ic.className = 'fas fa-chevron-' + (_bb.histHidden ? 'down' : 'up');
}
async function bbCompatSavePatient() {
  const g = x => { const el = document.getElementById(x); return el ? el.value : ''; };
  const body = { national_id: g('bbC_nid').trim(), name: g('bbC_name').trim(), gender: g('bbC_gender'), age: g('bbC_age'), blood_type: g('bbC_bt'), bt_cards: g('bbC_cards'), bt_date: g('bbC_btDate') || null, req_rbc: parseInt(g('bbC_reqRbc')) || 0, req_plasma: parseInt(g('bbC_reqPlasma')) || 0, req_plt: parseInt(g('bbC_reqPlt')) || 0, req_cryo: parseInt(g('bbC_reqCryo')) || 0, hospital_id: g('bbC_hosp') ? parseInt(g('bbC_hosp')) : null, department: g('bbC_dept') };
  if (!body.national_id || !body.name) { showToast('❌ الرقم الطبي والاسم مطلوبان', 'error'); return; }
  try {
    const r = await api('POST', '/patients', body);
    showToast('✅ تم حفظ بيانات المريض');
    _bb.selPatient = r.patient.id;
    await bbLoadPatients();
    document.getElementById('bbC_name').value = r.patient.name;
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}
function bbCompatBagLookupInput() {
  const input = document.getElementById('bbC_bagNo');
  const sug = document.getElementById('bbCbagSuggest');
  if (!input) return;
  const q = input.value.trim().toLowerCase();
  if (sug) {
    if (!q || q.length < 2) { sug.style.display = 'none'; sug.innerHTML = ''; }
    else {
      const matches = _bb.bags.filter(x => (
        (x.product_type || 'دم') === 'دم' &&
        ((x.bag_no && x.bag_no.toLowerCase().indexOf(q) !== -1) ||
        (x.barcode && x.barcode.toLowerCase().indexOf(q) !== -1))
      )).slice(0, 8);
      if (!matches.length) { sug.style.display = 'none'; sug.innerHTML = ''; }
      else {
        sug.innerHTML = matches.map(b => {
          const rr = _bb.reservations.find(r => r.bag_id === b.id && r.status === 'active');
          return `<div data-click="bbCompatBagPick" data-args="${b.id}" style="padding:7px 10px;cursor:pointer;border-bottom:1px solid var(--border,#f0f0f0);display:flex;justify-content:space-between;align-items:center;gap:8px" data-mouseover="hoverOn" data-mouseout="hoverOff" data-hover-bg="var(--hover-bg,#eef6ff)" data-hover-off="">
            <span dir="ltr" style="font-weight:700;font-size:12px">${esc(b.bag_no)}</span>
            <span style="display:flex;align-items:center;gap:6px;font-size:11px;color:#666"><span style="color:#8e44ad">${esc(b.hospital_name || bbHospName(b.hospital_id))}</span>${esc(b.blood_type || 'غير محدد')}${b.barcode ? ' — ' + esc(b.barcode) : ''}${rr ? '<span style="color:#c0392b;font-weight:600">محجوز</span>' : bbStBadge(b.status)}</span>
          </div>`;
        }).join('');
        sug.style.display = '';
        if (!window._bbSugBound) {
          window._bbSugBound = true;
          document.addEventListener('mousedown', function (ev) {
            const box = document.getElementById('bbCbagSuggest');
            if (!box || box.style.display === 'none') return;
            if (box.contains(ev.target)) return;
            const inp = document.getElementById('bbC_bagNo');
            if (inp && (ev.target === inp || inp.contains(ev.target))) return;
            box.style.display = 'none'; box.innerHTML = '';
          }, true);
        }
      }
    }
  }
  bbCompatLookupBag();
}
function bbCompatBagPick(id) {
  const b = _bb.bags.find(x => x.id === id);
  const input = document.getElementById('bbC_bagNo');
  const sug = document.getElementById('bbCbagSuggest');
  if (b && input) input.value = b.bag_no;
  if (sug) { sug.style.display = 'none'; sug.innerHTML = ''; }
  bbCompatLookupBag();
}
function bbCompatLookupBag() {
  const info = document.getElementById('bbCbagInfo');
  const acts = document.getElementById('bbCbagActions');
  const bagNo = document.getElementById('bbC_bagNo').value.trim();
  const setBox = (id, v) => { const el = document.getElementById(id); if (el) el.value = v == null ? '' : v; };
  if (!bagNo) { if (info) info.innerHTML = ''; if (acts) acts.innerHTML = ''; ['bbC_bagBarcode','bbC_bagProd','bbC_bagUnits','bbC_bagBt','bbC_bagExp'].forEach(setBox, ''); return; }
  const byNo = _bb.bags.find(x => x.bag_no === bagNo);
  const b = byNo || _bb.bags.find(x => x.barcode === bagNo);
  if (!b) {
    if (info) info.innerHTML = `<div style="background:#fdecea;border:1px solid #f5b7b1;color:#c0392b;padding:8px 12px;border-radius:8px;font-size:12px;margin-top:4px"><i class="fas fa-times-circle" style="margin-left:4px"></i> لا يوجد كيس بهذا الرقم أو الباركود في رصيد بنوك الدم المتاحة لك</div>`;
    if (acts) acts.innerHTML = '';
    ['bbC_bagBarcode','bbC_bagProd','bbC_bagUnits','bbC_bagBt','bbC_bagExp'].forEach(setBox, '');
    return;
  }
  setBox('bbC_bagBarcode', b.barcode || 'غير مسجل');
  setBox('bbC_bagProd', b.product_type || 'دم');
  setBox('bbC_bagUnits', (b.units != null ? b.units : 1));
  setBox('bbC_bagBt', b.blood_type || 'غير محدد');
  setBox('bbC_bagExp', b.expiry_date ? String(b.expiry_date).slice(0, 10) : 'غير مسجل');
  const group = b.donation_id ? _bb.bags.filter(x => x.donation_id === b.donation_id) : [b];
  const availGroup = group.filter(x => ['available', 'returned', 'reserved'].indexOf(x.status) !== -1);
  const canEdit = hasPerm('blood_bags', 'edit');
  const selP = _bb.selPatient ? _bb.patients.find(p => p.id === _bb.selPatient) : null;
  const pBt = selP && selP.blood_type ? selP.blood_type : '';
  const bBt = b.blood_type || '';
  const isBlood = (b.product_type || 'دم') === 'دم';
  const compat = isBlood && bBt && pBt ? (bbCanDonateTo(bBt, pBt) === true) : null;
  const compatBanner = isBlood && bBt && pBt ? `<div style="background:${compat ? '#e8f5e9' : '#fdecea'};border:1px solid ${compat ? '#a5d6a7' : '#f5b7b1'};color:${compat ? '#2e7d32' : '#c0392b'};padding:7px 12px;border-radius:8px;font-size:12px;margin-top:6px;line-height:1.6"><i class="fas fa-${compat ? 'check-circle' : 'times-circle'}" style="margin-left:4px"></i> توافق الفصائل: كيس <strong>${esc(bBt)}</strong> ${compat ? 'متوافق مع' : 'غير متوافق مع'} المريض <strong>${esc(pBt)}</strong>${compat ? '' : ' — لا يمكن حجز هذا الكيس لهذا المريض'}</div>` : '';
  if (!availGroup.length) {
    const sb = group[0] || b;
    if (info) info.innerHTML = `<div style="background:#fff8e1;border:1px solid #ffe082;color:#f57f17;padding:8px 12px;border-radius:8px;font-size:12px;margin-top:4px;line-height:1.8"><i class="fas fa-exclamation-triangle" style="margin-left:4px"></i> هذا الكيس موجود في <strong>${esc(sb.hospital_name || bbHospName(sb.hospital_id))}</strong> لكنه <strong>ليس من الرصيد المتاح</strong> — الحالة: ${bbStBadge(sb.status)}</div>`;
    if (acts) acts.innerHTML = '';
    return;
  }
  const resvsOf = rid => _bb.reservations.filter(r => r.bag_id === rid && r.status === 'active');
  const resvLine = rid => {
    const rrs = resvsOf(rid);
    if (!rrs.length) return '';
    return ' — ' + rrs.map(rr => `<strong style="color:#c0392b"><i class="fas fa-user-lock" style="margin-left:2px"></i> تم الحجز:</strong> <strong>${esc(rr.patient_name || '')}</strong> — كروت التوافق: <strong>${rr.compat_cards || 0}</strong>${rr.remaining_hours != null ? ' — المتبقي: <strong>' + rr.remaining_hours + ' ساعة</strong>' : ''}`).join(' <span style="color:#999">|</span> ') + (rrs.length > 1 ? ` <strong style="color:#c0392b">(محجوز لـ ${rrs.length} مرضى)</strong>` : '');
  };
  const memberRows = group.map(m => {
    const rrs = resvsOf(m.id);
    const badge = rrs.length ? `<strong style="color:#c0392b;font-size:11px"><i class="fas fa-user-lock" style="margin-left:2px"></i> ${esc(rrs[0].patient_name || '')}${rrs.length > 1 ? ' +' + (rrs.length - 1) + ' آخر' : ''} — ${rrs[0].compat_cards || 0} كارت</strong>` : '';
    return `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:5px 8px;border:1px solid #d5dbdb;border-radius:8px;background:#fff;margin-top:5px">
      <span style="display:flex;align-items:center;gap:6px;font-size:12px">${bbProdCell(m)} ${bbStBadge(m.status)}${badge}</span>
      <span style="white-space:nowrap">${bbReserveBtn(m, rrs, canEdit, pBt)}</span>
    </div>`;
  }).join('');
  if (info) info.innerHTML = `<div style="background:#eaf2f8;border:1px solid #aed6f1;color:#1a5276;padding:10px 12px;border-radius:8px;font-size:12px;margin-top:4px;line-height:1.9">
    <i class="fas fa-box" style="margin-left:4px"></i> <strong>رقم اللي:</strong> <span dir="ltr" style="font-weight:700">${esc(b.bag_no)}</span> —
    <strong>الفصيلة:</strong> <span style="font-weight:700;color:${b.blood_type && b.blood_type.endsWith('+') ? '#c0392b' : '#27ae60'}">${esc(b.blood_type || 'غير محدد')}</span><br>
    <strong>الباركود:</strong> <span dir="ltr">${b.barcode ? esc(b.barcode) : 'غير مسجل'}</span> —
    <strong>تاريخ انتهاء الصلاحية:</strong> ${b.expiry_date ? esc(String(b.expiry_date).slice(0, 10)) : 'غير مسجل'}${b.expiry_date ? ' ' + bbDaysBadge(b.days_left) : ''}<br>
    <strong>بنك الدم (مكان الكيس):</strong> ${esc(b.hospital_name || bbHospName(b.hospital_id))}${resvLine(b.id)}
    ${group.length > 1 ? `<br><i class="fas fa-layer-group" style="margin-left:2px"></i> <strong>مكونات التبرع (${group.length})</strong>${memberRows}` : ''}
  </div>${compatBanner}`;
  if (!acts) return;
  if (group.length > 1) { acts.innerHTML = ''; return; }
  const rrs = resvsOf(b.id);
  if (!canEdit) { acts.innerHTML = ''; return; }
  if (!isBlood) {
    if (b.status === 'available' || b.status === 'returned') {
      acts.innerHTML = `<div style="background:#f4f6f7;border:1px solid #d5dbdb;color:#2c3e50;padding:8px 12px;border-radius:8px;font-size:12px;margin-top:6px;line-height:1.7"><i class="fas fa-arrow-right" style="margin-left:4px"></i> ${bbProdCell(b)} <strong>لا يُحجز</strong> — يُصرف مباشرةً (بدون حجز) للمريض من تبويب <strong>الحجز والصرف</strong></div>`;
    }
    return;
  }
  const myRr = _bb.selPatient ? rrs.find(r => r.patient_id === _bb.selPatient) : null;
  const others = myRr ? rrs.filter(r => r.id !== myRr.id) : rrs;
  const othersBox = others.length ? `<div style="background:#fef9e7;border:1px solid #f9e79f;color:#9a7d0a;padding:6px 10px;border-radius:8px;font-size:11px;margin-top:6px;line-height:1.7"><i class="fas fa-users" style="margin-left:4px"></i> <strong>محجوز أيضاً لـ:</strong> ${others.map(o => '<strong>' + esc(o.patient_name || '') + '</strong>').join('، ')} — تُفكّك تلقائياً عند صرف الكيس لأي مريض</div>` : '';
  if (myRr) {
    acts.innerHTML = `<button class="btn btn-primary" data-click="bbCompatRenew" data-args="${myRr.id}" style="background:#f39c12;color:#fff"><i class="fas fa-clock"></i> تجديد الحجز (48 ساعة)</button>
      <button class="btn btn-outline" data-click="bbCompatRelease" data-args="${myRr.id}" style="color:#e74c3c"><i class="fas fa-unlock"></i> فك الحجز</button>${othersBox}`;
  } else if (b.status === 'available' || b.status === 'returned' || b.status === 'reserved') {
    if (compat === false) {
      acts.innerHTML = `<button class="btn" disabled style="background:#e0e0e0;color:#999;cursor:not-allowed"><i class="fas fa-ban"></i> غير متوافق مع المريض — لا يمكن الحجز</button>${othersBox}`;
    } else {
      acts.innerHTML = `<button class="btn btn-primary" data-click="bbCompatReserve" data-args="${b.id}"><i class="fas fa-lock"></i> حجز الكيس (48 ساعة)</button>${othersBox}`;
    }
  } else {
    acts.innerHTML = othersBox;
  }
}
function bbReserveBtn(m, rrs, canEdit, pBt) {
  if (!canEdit) return '';
  if ((m.product_type || 'دم') !== 'دم') return ''; // غير الدم يُصرف مباشرة من الحجز والصرف
  const myRr = _bb.selPatient ? rrs.find(r => r.patient_id === _bb.selPatient) : null;
  const others = myRr ? rrs.filter(r => r.id !== myRr.id) : rrs;
  if (myRr) return `<button class="btn btn-sm" data-click="bbCompatRenew" data-args="${myRr.id}" style="background:#f39c12;color:#fff" title="تجديد"><i class="fas fa-clock"></i></button> <button class="btn btn-sm btn-outline" data-click="bbCompatRelease" data-args="${myRr.id}" style="color:#e74c3c" title="فك الحجز"><i class="fas fa-unlock"></i></button>${others.length ? ` <span style="color:#c0392b;font-size:10px" title="${others.map(o => esc(o.patient_name || '')).join('، ')}">+${others.length} حجز آخر</span>` : ''}`;
  if (m.status === 'available' || m.status === 'returned' || m.status === 'reserved') {
    const mComat = m.blood_type && pBt ? (bbCanDonateTo(m.blood_type, pBt) === true) : null;
    if (mComat === false) return `<button class="btn btn-sm" disabled style="background:#e0e0e0;color:#999;cursor:not-allowed" title="غير متوافق مع المريض"><i class="fas fa-ban"></i></button>${others.length ? ` <span style="color:#c0392b;font-size:10px" title="${others.map(o => esc(o.patient_name || '')).join('، ')}">+${others.length} حجز آخر</span>` : ''}`;
    return `<button class="btn btn-sm btn-primary" data-click="bbCompatReserve" data-args="${m.id}"><i class="fas fa-lock"></i> حجز</button>${others.length ? ` <span style="color:#c0392b;font-size:10px" title="${others.map(o => esc(o.patient_name || '')).join('، ')}">+${others.length} حجز آخر</span>` : ''}`;
  }
  return '';
}
async function bbCompatReserve(bid) {
  if (!_bb.selPatient) { showToast('❌ احفظ المريض أو ابحث برقمه الطبي أولاً', 'error'); return; }
  const bag = _bb.bags.find(x => x.id === bid);
  if (!bag) return;
  const compatCards = parseInt(document.getElementById('bbC_compatCards').value) || 0;
  try {
    await api('POST', '/blood-bags/reserve', { bagId: bid, patientId: _bb.selPatient, hospitalId: bag.hospital_id, issueType: 'داخلي', compatCards });
    showToast('✅ تم حجز الكيس لمدة 48 ساعة');
    await Promise.all([bbLoadBags(), bbLoadReservations()]);
    bbCompatClearPatient(false);
    const nidEl = document.getElementById('bbC_nid'); if (nidEl) nidEl.value = '';
    bbCompatLookupBag();
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}
async function bbCompatRenew(rid) {
  try {
    await api('POST', '/blood-bags/renew-reservation', { reservationId: rid });
    showToast('✅ تم تجديد الحجز 48 ساعة إضافية');
    await Promise.all([bbLoadBags(), bbLoadReservations()]);
    bbCompatLookupBag();
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}
function bbCompatRelease(rid) {
  const r = _bb.reservations.find(x => x.id === rid);
  openModal('فك حجز الكيس ' + (r ? esc(r.bag_no) : ''),
    `<div class="form-group"><label>سبب فك الحجز</label><textarea class="form-control" id="bbCRelReason" rows="2">لم يُصرف خلال 48 ساعة</textarea></div>
    <div style="background:#e8f5e9;border:1px solid #a5d6a7;color:#2e7d32;padding:8px 12px;border-radius:8px;font-size:12px"><i class="fas fa-info-circle" style="margin-left:4px"></i> سيُعاد الكيس إلى الرصيد المتاح تلقائياً</div>`,
    `<button class="btn btn-secondary" data-click="closeModal"><i class="fas fa-times"></i> إلغاء</button>
     <button class="btn btn-primary" data-click="bbCompatDoRelease" data-args="${rid}"><i class="fas fa-unlock"></i> فك الحجز</button>`);
}
async function bbCompatDoRelease(rid) {
  const reason = document.getElementById('bbCRelReason').value;
  try {
    await api('POST', '/blood-bags/release-reservation', { reservationId: rid, reason });
    showToast('✅ تم فك الحجز وإعادة الكيس للرصيد');
    closeModal();
    await Promise.all([bbLoadBags(), bbLoadReservations()]);
    bbCompatLookupBag();
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}
function bbRenderDepts() {
  const listEl = document.getElementById('bbDeptList');
  if (!listEl) return;
  const sel = document.getElementById('bbDepHosp');
  const hid = sel ? parseInt(sel.value) : 0;
  const list = _bb.departments.filter(d => d.hospital_id === hid);
  if (!list.length) { listEl.innerHTML = '<div style="color:#999;font-size:12px">لا توجد أقسام مسجلة لهذا المستشفى — أضف أول قسم.</div>'; return; }
  listEl.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:6px">` + list.map(d => `<span style="display:inline-flex;align-items:center;gap:6px;background:#f3e5f5;color:#4a148c;border:1px solid #ce93d8;padding:4px 10px;border-radius:16px;font-size:12px;font-weight:600">${esc(d.name)}${hasPerm('blood_bags', 'delete') ? `<button class="btn btn-sm" data-click="bbDeleteDept" data-args="${d.id}" style="padding:0 6px;height:18px;line-height:16px;background:#e91e63;color:#fff;border-radius:8px;font-size:10px" title="حذف">&times;</button>` : ''}</span>`).join('') + '</div>';
}
async function bbAddDept() {
  const sel = document.getElementById('bbDepHosp');
  const nameInput = document.getElementById('bbDepName');
  const hid = sel ? parseInt(sel.value) : 0;
  const name = nameInput ? nameInput.value.trim() : '';
  if (!hid) { showToast('❌ اختر بنك الدم أولاً', 'error'); return; }
  if (!name) { showToast('❌ اكتب اسم القسم', 'error'); return; }
  try {
    await api('POST', '/hospital-departments', { hospital_id: hid, name });
    if (nameInput) nameInput.value = '';
    await bbLoadDepartments(); bbRenderDepts(); bbCompatDeptChanged();
    showToast('✅ تم إضافة القسم');
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}
async function bbDeleteDept(id) {
  try {
    await api('DELETE', '/hospital-departments/' + id);
    await bbLoadDepartments(); bbRenderDepts(); bbCompatDeptChanged();
    showToast('✅ تم حذف القسم');
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}

/* ----- الحجز والصرف ----- */
async function bbReserve() {
  const el = document.getElementById('bbBody');
  showPageLoading(el, 'جاري التحميل...');
  try {
    const canEdit = hasPerm('blood_bags', 'edit');
    let html = `<div class="card" style="margin-bottom:16px;border-right:4px solid #f39c12">
      <div class="card-header" style="padding:10px 16px"><strong><i class="fas fa-hand-holding-heart" style="margin-left:6px"></i> الصرف لمريض — الكيس المحجوز</strong></div>
      <div class="card-body" style="padding:10px 16px">
        <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin-bottom:10px">
          <div class="form-group"><label>الرقم الطبي</label>
            <input class="form-control" id="bbResNid" placeholder="اكتب الرقم الطبي ليظهر المريض وكيسه المحجوز" data-input="bbResLookupPatient" style="min-width:280px;direction:ltr">
          </div>
          <button class="btn btn-sm btn-outline" data-click="bbGoPatients" style="color:#e91e63"><i class="fas fa-user-plus"></i> تسجيل مريض جديد</button>
        </div>
        <div id="bbResPatInfo"></div>
        <div id="bbResReserved"></div>
        <div id="bbResBagDetail"></div>
      </div>
    </div>
    <div class="card" style="margin-bottom:16px;border-right:4px solid #8e44ad">
      <div class="card-header" style="padding:10px 16px"><strong><i class="fas fa-fill-drip" style="margin-left:6px"></i> الصرف المباشر — بلازما / صفائح / كرايو (بدون حجز)</strong></div>
      <div class="card-body" style="padding:10px 16px">
        <div style="background:#f9ebea;border:1px solid #f5b7b1;color:#922b21;padding:8px 12px;border-radius:8px;font-size:12px;margin-bottom:10px;line-height:1.7"><i class="fas fa-info-circle" style="margin-left:4px"></i> كيس <strong>الدم</strong> يُحجز أولاً (48 ساعة) من تبويب <strong>الفصائل والتوافق</strong> — أما <strong>البلازما / الصفائح / الكرايو</strong> فتُصرف مباشرةً بدون حجز: ابحث بالرقم الطبي أعلاه ثم اضغط «صرف مباشر» على الكيس المطلوب.</div>
        <div id="bbResDirect"></div>
      </div>
    </div>
    <div class="card" style="margin-bottom:16px;border-right:4px solid #16a085">
      <div class="card-header" style="padding:10px 16px"><strong><i class="fas fa-table-list" style="margin-left:6px"></i> سجل الحجوزات والصرف (كل الحالات)</strong>
        <div style="float:left;display:flex;gap:8px;align-items:center;margin-top:-2px">
          <select class="form-control" id="bbResLogSt" data-change="bbRenderResLog" style="min-width:120px">
            <option value="">كل الحالات</option>
            <option value="active">محجوز (نشط)</option>
            <option value="issued">مُصرف</option>
          </select>
          <input class="form-control" id="bbResLogQ" placeholder="بحث برقم اللي / الباركود / المريض / البنك / الفصيلة..." data-input="bbRenderResLog" style="min-width:220px">
          <button class="btn btn-sm btn-outline" data-click="bbExportResLog" style="border-color:#16a085;color:#16a085" title="تحميل السجل كاملاً Excel"><i class="fas fa-file-excel"></i> تحميل</button>
        </div>
      </div>
      <div class="card-body table-scroll"><table class="data-table" style="font-size:12px"><thead>
        <tr><th>الفرع</th><th>اسم المستشفي</th><th>تاريخ الحجز</th><th>الرقم الطبي</th><th>الاسم رباعي</th><th>السن</th><th>النوع</th><th>القسم المصرف له</th><th>فصيلة المريض</th><th>المنتج</th><th>فصيلة الوحدة</th><th>رقم اللي</th><th>الباركود</th><th>تاريخ الانتهاء</th><th>الحالة</th><th>المتبقي / الصرف</th><th>سبب الإعدام</th>${canEdit ? '<th>إجراءات</th>' : ''}</tr>
      </thead><tbody id="bbResLogBody"></tbody></table></div>
    </div>`;
    el.innerHTML = html;
    await bbLoadBags(); await bbLoadPatients(); await bbLoadReservations();
    bbRenderResLog();
  } catch (e) { el.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}
async function bbLoadReservations() { try { const r = await api('GET', '/blood-bags/reservations'); _bb.reservations = r.reservations || []; } catch (e) { _bb.reservations = []; } }
function bbFindPatient(q) {
  const t = q.toLowerCase();
  return _bb.patients.find(x =>
    (x.national_id && x.national_id.toLowerCase().indexOf(t) !== -1) ||
    (x.name && x.name.toLowerCase().indexOf(t) !== -1)
  );
}
function bbResLookupPatient() {
  const input = document.getElementById('bbResNid');
  const info = document.getElementById('bbResPatInfo');
  const resBox = document.getElementById('bbResReserved');
  const det = document.getElementById('bbResBagDetail');
  const dirBox = document.getElementById('bbResDirect');
  if (!input) return;
  _bb.selResPatient = null;
  _bb.selResv = null;
  if (det) det.innerHTML = '';
  if (dirBox) dirBox.innerHTML = '';
  const q = input.value.trim();
  if (!q) { if (info) info.innerHTML = ''; if (resBox) resBox.innerHTML = ''; return; }
  const p = bbFindPatient(q);
  if (!p) {
    if (info) info.innerHTML = '<div style="background:#fff8e1;border:1px solid #ffe082;color:#f57f17;padding:8px 12px;border-radius:8px;font-size:12px;margin-bottom:10px"><i class="fas fa-exclamation-triangle" style="margin-left:4px"></i> لا يوجد مريض بهذا الرقم الطبي — سجّله أولاً من «الفصائل والتوافق»</div>';
    if (resBox) resBox.innerHTML = '';
    return;
  }
  _bb.selResPatient = p.id;
  if (info) info.innerHTML = bbResPatientInfoHtml(p);
  bbResShowReserved(p);
  bbResShowDirect(p);
}
function bbResPatientInfoHtml(p) {
  const req = (p.req_rbc || 0) + (p.req_plasma || 0) + (p.req_plt || 0) + (p.req_cryo || 0);
  return `<div style="background:#fce4ec;border:1px solid #f5b7b1;color:#c2185b;padding:8px 12px;border-radius:8px;font-size:12px;margin-bottom:10px;font-weight:600"><i class="fas fa-user" style="margin-left:4px"></i> المريض: ${esc(p.name)} — السن: ${esc(p.age != null ? p.age : '—')} — النوع: ${esc(p.gender || '—')} — الفصيلة: <strong>${esc(p.blood_type || 'غير محدد')}</strong>${p.department ? ' — القسم: <strong>' + esc(p.department) + '</strong>' : ''}${req ? ' — المطلوب: كرات دم <strong>' + (p.req_rbc || 0) + '</strong> / بلازما <strong>' + (p.req_plasma || 0) + '</strong> / صفائح <strong>' + (p.req_plt || 0) + '</strong> / كرايو <strong>' + (p.req_cryo || 0) + '</strong>' : ''}${p.blood_type ? ' <span style="background:#e8f5e9;color:#2e7d32;padding:1px 8px;border-radius:10px;font-size:10px">فصيلة محددة</span>' : ' <span style="background:#fff8e1;color:#f57f17;padding:1px 8px;border-radius:10px;font-size:10px">الفصيلة غير محددة</span>'}</div>`;
}
function bbResRow(r) {
  const sel = _bb.selResv === r.id;
  const rh = r.remaining_hours;
  const color = rh === null ? '#999' : rh <= 6 ? '#e74c3c' : rh <= 12 ? '#f39c12' : '#27ae60';
  const badge = rh === null ? '—' : rh <= 0 ? 'منتهي' : Math.floor(rh) + ' ساعة';
  return `<div data-click="bbResPickBag" data-args="${r.id}" style="cursor:pointer;border:2px solid ${sel ? '#f39c12' : 'var(--border,#d5dbdb)'};background:${sel ? '#fff8e1' : 'var(--card-bg,#fff)'};border-radius:10px;padding:8px 12px;margin-bottom:6px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;font-size:12px">
    <span style="font-weight:700;color:#f39c12;direction:ltr">${esc(r.bag_no)}</span>
    <span>${bbProdCell(r)}</span>
    <span style="font-weight:700;color:${r.blood_type && r.blood_type.endsWith('+') ? '#c0392b' : '#27ae60'}">${esc(r.blood_type || '—')}</span>
    <span style="color:#777;font-size:11px">${esc(r.hospital_name || '')}</span>
    <span style="font-size:11px">المتبقي: <strong style="color:${color}">${badge}</strong></span>
    <span style="font-size:11px">كروت التوافق: <strong>${r.compat_cards || 0}</strong></span>
    ${sel ? '<span style="color:#f39c12;font-weight:700"><i class="fas fa-check-circle"></i> المحدد</span>' : ''}
  </div>`;
}
function bbResShowReserved(p) {
  const resBox = document.getElementById('bbResReserved');
  if (!resBox) return;
  const mine = _bb.reservations.filter(r => r.status === 'active' && r.patient_id === p.id);
  if (!mine.length) {
    resBox.innerHTML = '<div class="empty-msg" style="margin:2px 0;text-align:right">لا يوجد كيس محجوز لهذا المريض حالياً</div>';
    return;
  }
  resBox.innerHTML = `<div style="font-size:12px;font-weight:700;color:#16a085;margin-bottom:6px"><i class="fas fa-clock" style="margin-left:4px"></i> الكيس المحجوز (الدم يُحجز أولاً) — اختر الكيس ثم اضغط «صرف»:</div>` +
    mine.map(r => bbResRow(r)).join('');
}
function bbResShowDirect(p) {
  const box = document.getElementById('bbResDirect');
  if (!box) return;
  const list = _bb.bags.filter(b => (b.product_type || 'دم') !== 'دم' && (b.status === 'available' || b.status === 'returned'));
  if (!list.length) {
    box.innerHTML = '<div class="empty-msg" style="margin:2px 0;text-align:right">لا توجد منتجات أخرى (بلازما / صفائح / كرايو) متاحة للصرف المباشر</div>';
    return;
  }
  box.innerHTML = `<div style="font-size:12px;font-weight:700;color:#8e44ad;margin-bottom:6px"><i class="fas fa-box-open" style="margin-left:4px"></i> المنتجات المتاحة للصرف المباشر (بدون حجز) — اختر الكيس ثم اضغط «صرف مباشر»:</div>` +
    list.map(b => {
      const exp = b.expiry_date ? String(b.expiry_date).slice(0, 10) : '';
      return `<div style="border:1px solid var(--border,#d5dbdb);border-radius:10px;padding:7px 12px;margin-bottom:6px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;font-size:12px;background:var(--card-bg,#fff)">
        <span style="font-weight:700;color:#8e44ad;direction:ltr">${esc(b.bag_no)}</span>
        <span>${bbProdCell(b)}</span>
        <span style="font-weight:700;color:${b.blood_type && b.blood_type.endsWith('+') ? '#c0392b' : '#27ae60'}">${esc(b.blood_type || '—')}</span>
        <span style="color:#777;font-size:11px">${esc(b.hospital_name || bbHospName(b.hospital_id))}</span>
        <span style="font-size:11px">الصلاحية: ${exp ? exp + ' ' + bbDaysBadge(b.days_left) : '—'}</span>
        <span style="margin-right:auto"></span>
        <button class="btn btn-sm btn-primary" data-click="bbDoIssueDirect" data-args="${b.id}" style="background:#8e44ad;border-color:#8e44ad" title="صرف مباشر بدون حجز"><i class="fas fa-hand-holding-heart"></i> صرف مباشر</button>
      </div>`;
    }).join('');
}
function bbDoIssueDirect(bid) {
  if (!_bb.selResPatient) { showToast('❌ ابحث عن المريض أولاً بالرقم الطبي', 'error'); return; }
  const b = _bb.bags.find(x => x.id === bid);
  const p = _bb.patients.find(x => x.id === _bb.selResPatient);
  const depts = (_bb.departments || []).filter(d => d.hospital_id === b.hospital_id);
  const def = (p && p.department) || '';
  const opts = '<option value="">—</option>' + depts.map(d => `<option value="${esc(d.name)}" ${d.name === def ? 'selected' : ''}>${esc(d.name)}</option>`).join('');
  openModal('صرف مباشر — الكيس ' + (b ? esc(b.bag_no) : ''),
    `<div class="form-group"><label>القسم المصرف له</label><select class="form-control" id="bbIssueDirectDept">${opts}</select></div>
    <div class="form-group"><label>الفئة</label><select class="form-control" id="bbIssueDirectCat">${bbCatOpts(b ? b.unit_category : '')}</select></div>
    <div style="background:#e8f5e9;border:1px solid #a5d6a7;color:#2e7d32;padding:8px 12px;border-radius:8px;font-size:12px"><i class="fas fa-info-circle" style="margin-left:4px"></i> سيُصرف الكيس مباشرةً للمريض <b>${p ? esc(p.name) : ''}</b> (${b ? esc(b.product_type || 'دم') : ''}) بدون حجز — يُخصم من الرصيد مع القسم المحدد</div>`,
    `<button class="btn btn-secondary" data-click="closeModal"><i class="fas fa-times"></i> إلغاء</button>
     <button class="btn btn-primary" data-click="bbDoIssueDirect2" data-args="${bid}"><i class="fas fa-hand-holding-heart"></i> صرف مباشر</button>`);
}
async function bbDoIssueDirect2(bid) {
  const dept = document.getElementById('bbIssueDirectDept').value;
  const catEl = document.getElementById('bbIssueDirectCat');
  const cat = catEl ? catEl.value : '';
  try {
    await api('POST', '/blood-bags/issue-direct', { bagId: bid, patientId: _bb.selResPatient, issueType: 'داخلي', issuedDepartment: dept, unitCategory: cat });
    showToast('✅ تم الصرف المباشر وخصم الكيس من الرصيد (' + (dept || 'بدون قسم') + ')');
    closeModal();
    await bbLoadBags(); await bbLoadReservations();
    bbResRefresh();
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}
function bbResPickBag(rid) {
  _bb.selResv = rid;
  const r = _bb.reservations.find(x => x.id === rid);
  if (!r) return;
  const p = _bb.patients.find(x => x.id === r.patient_id);
  if (p) bbResShowReserved(p);
  const det = document.getElementById('bbResBagDetail');
  if (!det) return;
  const rh = r.remaining_hours;
  const color = rh === null ? '#999' : rh <= 6 ? '#e74c3c' : rh <= 12 ? '#f39c12' : '#27ae60';
  const badge = rh === null ? '—' : rh <= 0 ? 'منتهي' : Math.floor(rh) + ' ساعة';
  const depts = (_bb.departments || []).filter(d => d.hospital_id === r.hospital_id);
  const defDept = r.patient_department || '';
  const opts = '<option value="">— اختر القسم —</option>' + depts.map(d => `<option value="${esc(d.name)}" ${d.name === defDept ? 'selected' : ''}>${esc(d.name)}</option>`).join('');
  det.innerHTML = `<div style="border:1px solid var(--border,#d5dbdb);border-radius:10px;padding:10px 14px;background:var(--card-bg,#fff);margin-top:4px">
    <div style="display:flex;flex-wrap:wrap;gap:10px;font-size:12px;margin-bottom:10px">
      <span>رقم اللي: <strong style="color:#f39c12;direction:ltr">${esc(r.bag_no)}</strong></span>
      <span>الباركود: <strong style="direction:ltr">${esc(r.barcode || '—')}</strong></span>
      <span>المنتج: ${bbProdCell(r)}</span>
      <span>الفصيلة: <strong style="color:${r.blood_type && r.blood_type.endsWith('+') ? '#c0392b' : '#27ae60'}">${esc(r.blood_type || '—')}</strong></span>
      <span>بنك الدم: ${esc(r.hospital_name || '—')}</span>
      <span>المتبقي: <strong style="color:${color}">${badge}</strong></span>
      <span>كروت التوافق: <strong>${r.compat_cards || 0}</strong></span>
    </div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap">
      <span style="font-size:12px;color:#555;white-space:nowrap"><i class="fas fa-users" style="margin-left:4px"></i> القسم المصرف له:</span>
      <select class="form-control" id="bbResDept" style="flex:1;max-width:280px;height:auto;min-height:30px;padding:4px 8px">${opts}</select>
      <span style="font-size:12px;color:#555;white-space:nowrap"><i class="fas fa-baby" style="margin-left:4px"></i> الفئة:</span>
      <select class="form-control" id="bbResCat" style="flex:1;max-width:120px;height:auto;min-height:30px;padding:4px 8px">${bbCatOpts(r.unit_category)}</select>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-primary" data-click="bbDoIssueInline" data-args="${r.id}" style="background:#16a085;border-color:#16a085"><i class="fas fa-hand-holding-heart"></i> صرف الكيس</button>
      <button class="btn btn-sm btn-outline" data-click="bbRelease" data-args="${r.id}" style="color:#e74c3c"><i class="fas fa-undo"></i> تفكيك الحجز</button>
    </div>
  </div>`;
}
function bbResRefresh() {
  bbRenderResLog();
  const p = _bb.patients.find(x => x.id === _bb.selResPatient);
  if (p) {
    bbResShowReserved(p);
    bbResShowDirect(p);
    const r = _bb.selResv ? _bb.reservations.find(x => x.id === _bb.selResv && x.status === 'active') : null;
    if (r) bbResPickBag(r.id);
    else {
      _bb.selResv = null;
      const det = document.getElementById('bbResBagDetail');
      if (det) det.innerHTML = '';
    }
  } else {
    const dirBox = document.getElementById('bbResDirect');
    if (dirBox) dirBox.innerHTML = '';
  }
}
async function bbDoIssue(rid) {
  const r = _bb.reservations.find(x => x.id === rid);
  const depts = (_bb.departments || []).filter(d => d.hospital_id === r.hospital_id);
  const def = r.patient_department || '';
  const opts = '<option value="">—</option>' + depts.map(d => `<option value="${esc(d.name)}" ${d.name === def ? 'selected' : ''}>${esc(d.name)}</option>`).join('');
  openModal('صرف الكيس ' + (r ? esc(r.bag_no) : ''),
    `<div class="form-group"><label>القسم المصرف له</label><select class="form-control" id="bbIssueDept">${opts}</select></div>
    <div class="form-group"><label>الفئة</label><select class="form-control" id="bbIssueCat">${bbCatOpts(r ? r.unit_category : '')}</select></div>
    <div style="background:#e8f5e9;border:1px solid #a5d6a7;color:#2e7d32;padding:8px 12px;border-radius:8px;font-size:12px"><i class="fas fa-info-circle" style="margin-left:4px"></i> سيُخصم الكيس من الرصيد ويُسجَّل صرفه للمريض مع القسم المحدد</div>`,
    `<button class="btn btn-secondary" data-click="closeModal"><i class="fas fa-times"></i> إلغاء</button>
     <button class="btn btn-primary" data-click="bbDoIssue2" data-args="${rid}"><i class="fas fa-check"></i> صرف</button>`);
}
async function bbDoIssue2(rid) {
  const dept = document.getElementById('bbIssueDept').value;
  const catEl = document.getElementById('bbIssueCat');
  const cat = catEl ? catEl.value : '';
  try {
    await api('POST', '/blood-bags/issue', { reservationId: rid, issuedDepartment: dept, unitCategory: cat });
    showToast('✅ تم الصرف وخصم الكيس من الرصيد');
    closeModal();
    await bbLoadBags(); await bbLoadReservations();
    bbResRefresh();
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}
async function bbDoIssueInline(rid) {
  const deptEl = document.getElementById('bbResDept');
  const dept = deptEl ? deptEl.value : '';
  const catEl = document.getElementById('bbResCat');
  const cat = catEl ? catEl.value : '';
  try {
    await api('POST', '/blood-bags/issue', { reservationId: rid, issuedDepartment: dept, unitCategory: cat });
    showToast('✅ تم الصرف وخصم الكيس من الرصيد (' + (dept || 'بدون قسم') + ')');
    const det = document.getElementById('bbResBagDetail');
    if (det) det.innerHTML = '';
    _bb.selResv = null;
    await bbLoadBags(); await bbLoadReservations();
    bbResRefresh();
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}
function bbRelease(rid) {
  const r = _bb.reservations.find(x => x.id === rid);
  openModal('تفكيك حجز الكيس ' + (r ? esc(r.bag_no) : ''),
    `<div class="form-group"><label>سبب التفكيك</label><textarea class="form-control" id="bbRelReason" rows="2">لم يُصرف خلال 48 ساعة</textarea></div>
    <div style="background:#e8f5e9;border:1px solid #a5d6a7;color:#2e7d32;padding:8px 12px;border-radius:8px;font-size:12px"><i class="fas fa-info-circle" style="margin-left:4px"></i> سيُعاد الكيس إلى الرصيد المتاح تلقائياً</div>`,
    `<button class="btn btn-secondary" data-click="closeModal"><i class="fas fa-times"></i> إلغاء</button>
     <button class="btn btn-primary" data-click="bbDoRelease" data-args="${rid}"><i class="fas fa-undo"></i> تفكيك</button>`);
}
async function bbDoRelease(rid) {
  const reason = document.getElementById('bbRelReason').value;
  try {
    await api('POST', '/blood-bags/release-reservation', { reservationId: rid, reason });
    showToast('✅ تم التفكيك وإعادة الكيس للرصيد');
    closeModal();
    await bbLoadBags(); await bbLoadReservations();
    bbResRefresh();
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}
function bbResStBadge(r) {
  const map = {
    active: ['محجوز', '#f39c12'], issued: ['مُصرف', '#16a085'], released: ['مُحرر', '#95a5a6'], expired: ['منتهي', '#e74c3c']
  };
  const m = map[r.status] || [BB_ST_LABELS[r.status] || r.status, BB_ST_COLORS[r.status] || '#95a5a6'];
  return `<span style="display:inline-block;padding:2px 10px;border-radius:20px;background:${m[1]}22;color:${m[1]};font-size:11px;font-weight:700">${esc(r.status_label || m[0])}</span>`;
}
function bbRenderResLog() {
  const body = document.getElementById('bbResLogBody');
  if (!body) return;
  const canEdit = hasPerm('blood_bags', 'edit');
  const q = (document.getElementById('bbResLogQ') || {}).value || '';
  const st = (document.getElementById('bbResLogSt') || {}).value || '';
  const t = q.trim().toLowerCase();
  let list = _bb.reservations.slice();
  if (st) list = list.filter(r => r.status === st);
  if (t) list = list.filter(r =>
    (r.bag_no || '').toLowerCase().indexOf(t) !== -1 ||
    (r.barcode || '').toLowerCase().indexOf(t) !== -1 ||
    (r.patient_name || '').toLowerCase().indexOf(t) !== -1 ||
    (r.patient_national_id || '').toLowerCase().indexOf(t) !== -1 ||
    (r.patient_blood_type || '').toLowerCase().indexOf(t) !== -1 ||
    (r.blood_type || '').toLowerCase().indexOf(t) !== -1 ||
    (r.hospital_name || '').toLowerCase().indexOf(t) !== -1 ||
    (r.governorate || '').toLowerCase().indexOf(t) !== -1 ||
    (r.product_type || 'دم').toLowerCase().indexOf(t) !== -1
  );
  _bb.lastResLog = list;
  const btCell = bt => `<span style="font-weight:700;color:${bt && bt.endsWith('+') ? '#c0392b' : '#27ae60'}">${esc(bt || '—')}</span>`;
  body.innerHTML = list.map(r => {
    const active = r.status === 'active';
    const bag = _bb.bags.find(x => x.id === r.bag_id);
    const bagIssued = !!bag && bag.status === 'issued';
    // إعدام الكيس المُصرف متاح فقط خلال 4 ساعات من الصرف (مرتجع/تفاعل/نظام مفتوح/أخرى)
    const canReturn = bagIssued && !!bag.issued_at && (Date.now() - new Date(bag.issued_at).getTime()) <= 4 * 3600000;
    const rh = r.remaining_hours;
    const color = active && rh !== null ? (rh <= 6 ? '#e74c3c' : rh <= 12 ? '#f39c12' : '#27ae60') : '#999';
    const badge = active ? (rh === null ? '—' : rh <= 0 ? 'منتهي' : Math.floor(rh) + ' ساعة') : (r.issued_at ? esc(new Date(r.issued_at).toLocaleDateString('ar-EG')) : '—');
    return `<tr>
      <td style="text-align:center;font-size:11px">${esc((function(){var hh=_bb.hospitals.find(function(x){return String(x.id)===String(r.hospital_id)});return hh?hh.governorate:'—'})())}</td>
      <td style="text-align:right;font-size:11px">${esc((function(){var hh=_bb.hospitals.find(function(x){return String(x.id)===String(r.hospital_id)});return hh?hh.name:'—'})())}</td>
      <td style="text-align:center;font-size:11px">${r.reserved_at ? esc(new Date(r.reserved_at).toLocaleString('ar-EG')) : ''}</td>
      <td style="text-align:center;direction:ltr;font-weight:700;color:#8e44ad">${esc(r.patient_national_id || '—')}</td>
      <td style="text-align:right;font-weight:600">${esc(r.patient_name || '—')}</td>
      <td style="text-align:center">${r.patient_age != null ? esc(r.patient_age) : '—'}</td>
      <td style="text-align:center">${esc(r.patient_gender || '—')}</td>
      <td style="text-align:right;font-size:11px">${esc(r.issued_department || '—')}</td>
      <td style="text-align:center">${btCell(r.patient_blood_type)}</td>
      <td style="text-align:center">${bbProdCell(r)}</td>
      <td style="text-align:center">${btCell(r.blood_type)}</td>
      <td style="text-align:center;direction:ltr;font-weight:700;color:#f39c12">${esc(r.bag_no)}</td>
      <td style="text-align:center;direction:ltr;font-size:11px">${esc(r.barcode || '—')}</td>
      <td style="text-align:center;direction:ltr;font-size:11px">${esc(String(r.expiry_date || '').slice(0, 10) || '—')}</td>
      <td style="text-align:center">${bbResStBadge(r)}</td>
      <td style="text-align:center"><span style="color:#fff;background:${color};padding:2px 10px;border-radius:12px;font-size:11px;font-weight:700">${badge}</span></td>
      <td style="text-align:center">${bag && bag.return_reason ? `<span style="display:inline-block;padding:2px 10px;border-radius:20px;background:#e74c3c22;color:#e74c3c;font-size:11px;font-weight:700">${esc(bag.return_reason)}</span>` : '—'}</td>
      ${canEdit ? `<td style="text-align:center;white-space:nowrap">${active
        ? `<button class="btn btn-sm" data-click="bbDoIssue" data-args="${r.id}" style="background:#16a085;color:#fff" title="صرف"><i class="fas fa-hand-holding-heart"></i> صرف</button>
           <button class="btn btn-sm btn-outline" data-click="bbRelease" data-args="${r.id}" style="margin-right:4px" title="تفكيك"><i class="fas fa-undo"></i></button>`
        : bagIssued
          ? `${canReturn
            ? `<button class="btn btn-sm btn-outline" data-click="bbReturn" data-args="${r.bag_id}" title="مرتجع / تفاعل / نظام مفتوح / أخرى — خلال 4 ساعات من الصرف" style="color:#e74c3c"><i class="fas fa-trash-can"></i> إعدام</button>`
            : ''}<button class="btn btn-sm btn-outline" data-click="bbUndoIssue" data-args="${bag.id}" title="إلغاء الصرف — إعادة الكيس إلى الرصيد" style="color:#16a085;margin-right:4px"><i class="fas fa-rotate-left"></i> إلغاء الصرف</button>`
          : `<span style="color:#7f8c8d;font-size:11px;font-weight:700">${bag ? esc(BB_ST_LABELS[bag.status] || bag.status) : ''}</span>`}</td>` : ''}
    </tr>`;
  }).join('') || `<tr><td colspan="${canEdit ? 18 : 17}" class="empty-msg">لا توجد بيانات</td></tr>`;
}
function bbExportResLog() {
  const list = _bb.lastResLog || [];
  if (!list.length) { showToast('❌ لا توجد بيانات للتصدير', 'error'); return; }
  bbXlsx(
    ['الفرع', 'اسم المستشفي', 'تاريخ الحجز', 'الرقم الطبي', 'الاسم رباعي', 'السن', 'النوع', 'القسم المصرف له', 'فصيلة المريض', 'المنتج', 'فصيلة الوحدة', 'رقم اللي', 'الباركود', 'تاريخ الانتهاء', 'الحالة', 'المتبقي / الصرف', 'سبب الإعدام'],
    list.map(r => {
      const bag = _bb.bags.find(x => x.id === r.bag_id);
      const hh = _bb.hospitals.find(function(x){return String(x.id)===String(r.hospital_id)});
      return [
        hh ? hh.governorate : '—', hh ? hh.name : '—',
        r.reserved_at ? String(r.reserved_at).slice(0, 10) : '—',
        r.patient_national_id || '—', r.patient_name || '—',
        r.patient_age != null ? r.patient_age : '—', r.patient_gender || '—',
        r.issued_department || '—',
        r.patient_blood_type || '—', r.product_type || 'دم', r.blood_type || '—',
        r.bag_no, r.barcode || '—',
        r.expiry_date ? String(r.expiry_date).slice(0, 10) : '—',
        r.status_label || r.status,
        r.status === 'active'
          ? (r.remaining_hours === null ? '—' : r.remaining_hours <= 0 ? 'منتهي' : Math.floor(r.remaining_hours) + ' ساعة')
          : (r.issued_at ? String(r.issued_at).slice(0, 10) : '—'),
        (bag && bag.return_reason) || '—'];
    }),
    'سجل الحجوزات والصرف', 'سجل_الحجوزات_والصرف.xlsx', 'نظام بنك الدم — سجل الحجوزات والصرف (كل الحالات)');
}
function bbReturn(id) {
  const b = _bb.bags.find(x => x.id === id);
  if (!b) return;
  openModal('إرجاع / إعدام — الكيس ' + esc(b.bag_no),
    `<div class="form-group"><label>النوع</label><select class="form-control" id="bbRetType"><option value="returned">مرتجع (تجاوز المدة قبل تعلق الكيس بالمريض)</option><option value="reaction">تفاعل (حدث تفاعل للمريض)</option><option value="open">نظام مفتوح</option><option value="other">أخرى</option></select></div>
    <div class="form-group" style="margin-top:10px"><label>التفاصيل</label><textarea class="form-control" id="bbRetDetail" rows="3"></textarea></div>`,
    `<button class="btn btn-secondary" data-click="closeModal"><i class="fas fa-times"></i> إلغاء</button>
     <button class="btn btn-primary" data-click="bbDoReturn" data-args="${id}"><i class="fas fa-save"></i> حفظ</button>`);
}
async function bbDoReturn(id) {
  const returnType = document.getElementById('bbRetType').value;
  const detail = document.getElementById('bbRetDetail').value;
  try {
    const r = await api('POST', '/blood-bags/return', { bagId: id, returnType, detail });
    showToast(r.status === 'returned' ? '✅ تم إرجاع الكيس للرصيد' : '✅ تم التسجيل');
    closeModal();
    await bbLoadBags(); await bbLoadReservations();
    bbResRefresh();
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}
function bbGoPatients() { renderBloodBags('compat'); }

/* ----- الرصيد المتاح (إعدام من الرصيد) ----- */
async function bbStock() {
  const el = document.getElementById('bbBody');
  if (!el) return;
  await bbLoadBags();
  const canEdit = hasPerm('blood_bags', 'edit');
  el.innerHTML = `<div class="card" style="margin-bottom:16px;border-right:4px solid #27ae60">
    <div class="card-header" style="padding:10px 16px"><strong><i class="fas fa-boxes-stacked" style="margin-left:6px"></i> الرصيد المتاح — إعدام من الرصيد</strong></div>
    <div class="card-body" style="padding:10px 16px">
      <div style="background:#e8f8f5;border:1px solid #a2d9ce;color:#117864;padding:8px 12px;border-radius:8px;font-size:12px;margin-bottom:10px"><i class="fas fa-info-circle" style="margin-left:4px"></i> هنا تُعدَم الأكياس في رصيد بنوك الدم. <b>دم / صفائح / كرايو</b>: نظام مفتوح أو أخرى — <b>بلازما</b>: شرخ أو كسر / تم الفك و تصرف / Lipemic / Hemolyzed. الإعدام فردي على الكيس.</div>
      <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end">
        <div class="form-group"><label>بحث</label><input class="form-control" id="bbStkQ" data-input="bbRenderStock" placeholder="رقم اللي / باركود / بنك / فصيلة"></div>
        <div class="form-group"><label>بنك الدم</label><select class="form-control" id="bbStkHosp" data-change="bbRenderStock">${bbOptHosp('', '')}</select></div>
        <div class="form-group"><label>المنتج</label><select class="form-control" id="bbStkProd" data-change="bbRenderStock">${bbOptProduct('')}</select></div>
        <div class="form-group"><label>الحالة</label><select class="form-control" id="bbStkSt" data-change="bbRenderStock"><option value="stock">المتاح</option><option value="reserved">محجوز</option><option value="all">كل الأكياس</option></select></div>
      </div>
      <div id="bbStockBody" style="margin-top:10px"></div>
    </div>
  </div>`;
  bbRenderStock();
}
function bbRenderStock() {
  const body = document.getElementById('bbStockBody');
  if (!body) return;
  const g = id => { const e = document.getElementById(id); return e ? e.value : ''; };
  const q = g('bbStkQ').toLowerCase();
  const hid = g('bbStkHosp');
  const prod = g('bbStkProd');
  const st = g('bbStkSt') || 'stock';
  let list = _bb.bags.filter(function (b) {
    if (st === 'stock') return b.status === 'available' || b.status === 'returned';
    if (st === 'reserved') return b.status === 'reserved';
    return true;
  });
  if (hid) list = list.filter(function (b) { return String(b.hospital_id) === String(hid); });
  if (prod) list = list.filter(function (b) { return (b.product_type || 'دم') === prod; });
  if (q) list = list.filter(function (b) {
    return (b.bag_no || '').toLowerCase().indexOf(q) !== -1 ||
      (b.barcode || '').toLowerCase().indexOf(q) !== -1 ||
      (b.hospital_name || bbHospName(b.hospital_id) || '').toLowerCase().indexOf(q) !== -1 ||
      (b.blood_type || '').toLowerCase().indexOf(q) !== -1;
  });
  _bb.lastStock = list;
  const canEdit = hasPerm('blood_bags', 'edit');
  const btCell = bt => `<span style="font-weight:700;color:${bt && bt.endsWith('+') ? '#c0392b' : '#27ae60'}">${esc(bt || '—')}</span>`;
  body.innerHTML = `<div style="margin-bottom:8px;color:#555;font-size:12px"><b>${list.length}</b> كيس</div>
  <div style="overflow-x:auto"><table class="data-table" style="width:100%">
    <thead><tr><th>رقم اللي</th><th>الباركود</th><th>بنك الدم</th><th>المنتج</th><th>الفصيلة</th><th>تاريخ الانتهاء</th><th>المتبقي</th><th>الحالة</th>${canEdit ? '<th>إجراءات</th>' : ''}</tr></thead>
    <tbody>${list.map(b => `<tr>
      <td style="text-align:center;direction:ltr;font-weight:700;color:#f39c12">${esc(b.bag_no)}</td>
      <td style="text-align:center;direction:ltr;font-size:11px;color:#8e44ad">${esc(b.barcode || '—')}</td>
      <td style="text-align:right;font-size:11px">${esc(b.hospital_name || bbHospName(b.hospital_id))}</td>
      <td style="text-align:center">${bbProdCell(b)}</td>
      <td style="text-align:center">${btCell(b.blood_type)}</td>
      <td style="text-align:center;direction:ltr;font-size:11px">${esc(String(b.expiry_date || '').slice(0, 10) || '—')}</td>
      <td style="text-align:center">${bbDaysBadge(b.days_left)}</td>
      <td style="text-align:center">${bbStBadge(b.status)}</td>
      ${canEdit ? `<td style="text-align:center">${(b.status === 'available' || b.status === 'returned') ? `<button class="btn btn-sm" data-click="bbStockDispose" data-args="${b.id}" style="background:#e74c3c;color:#fff" title="إعدام من الرصيد"><i class="fas fa-skull"></i> إعدام</button>` : '—'}</td>` : ''}
    </tr>`).join('') || `<tr><td colspan="${canEdit ? 9 : 8}" class="empty-msg">لا توجد أكياس</td></tr>`}</tbody>
  </table></div>`;
}
function bbStockDispose(id) {
  const b = _bb.bags.find(x => x.id === id);
  if (!b) return;
  const prod = b.product_type || 'دم';
  const opts = prod === 'بلازما'
    ? ['شرخ أو كسر', 'تم الفك و تصرف', 'Lipemic', 'Hemolyzed']
    : ['نظام مفتوح', 'أخرى'];
  openModal('إعدام الكيس ' + esc(b.bag_no) + ' — ' + bbProdCell(b),
    `<div class="form-group"><label>سبب الإعدام</label><select class="form-control" id="bbStkReason">${opts.map(s => `<option value="${s}" ${s === opts[0] ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
    <div class="form-group"><label>الفئة</label><select class="form-control" id="bbStkCat">${bbCatOpts(b.unit_category)}</select></div>
    <div style="font-size:12px;color:#e74c3c;background:#fdecea;border:1px solid #f5b7b1;padding:8px 12px;border-radius:8px;margin-top:8px"><i class="fas fa-skull-crossbones" style="margin-left:4px"></i> إعدام <b>فردي</b> لهذا الكيس فقط من الرصيد المتاح — بقية مكونات التبرع تبقى كما هي.</div>`,
    `<button class="btn btn-secondary" data-click="closeModal"><i class="fas fa-times"></i> إلغاء</button>
     <button class="btn btn-primary" data-click="bbDoStockDispose" data-args="${id}" style="background:#e74c3c;border-color:#e74c3c"><i class="fas fa-skull"></i> إعدام</button>`);
}
async function bbDoStockDispose(id) {
  const reason = document.getElementById('bbStkReason').value;
  const catEl = document.getElementById('bbStkCat');
  const cat = catEl ? catEl.value : '';
  try {
    const r = await api('POST', '/blood-bags/' + id + '/status', { status: 'disposed', reason, unitCategory: cat });
    showToast('✅ تم إعدام الكيس (' + reason + ')' + (r.affected > 1 ? ' — ' + r.affected + ' مكونات' : ''));
    closeModal();
    await bbLoadBags(); bbRenderStock();
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}

/* ----- الشهري التلقائي ----- */
async function bbMonthly() {
  const el = document.getElementById('bbBody');
  const now = getCairoDate();
  let year = now.getFullYear();
  let month = now.getMonth();
  month -= 1; if (month < 0) { month = 11; year -= 1; }
  el.innerHTML = `<div class="card" style="margin-bottom:16px;border-right:4px solid #27ae60">
    <div class="card-header" style="padding:10px 16px"><strong><i class="fas fa-calendar-check" style="margin-left:6px"></i> توليد البيانات الشهرية تلقائياً من الأكياس</strong></div>
    <div class="card-body" style="padding:10px 16px">
      <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end">
        <div class="form-group"><label>السنة</label><select class="form-control" id="bbMy" style="min-width:110px">${[year, year - 1, year - 2].map(y => `<option value="${y}" ${y === year ? 'selected' : ''}>${y}</option>`).join('')}</select></div>
        <div class="form-group"><label>الشهر</label><select class="form-control" id="bbMm" style="min-width:120px">${BB_MONTHS_AR.map((m, i) => `<option value="${i + 1}" ${i + 1 === month ? 'selected' : ''}>${m}</option>`).join('')}</select></div>
        <button class="btn btn-outline" data-click="bbPreviewMonthly" style="border-color:#27ae60;color:#27ae60"><i class="fas fa-eye"></i> معاينة الحساب</button>
        <button class="btn btn-outline" data-click="bbExportMonthly" style="border-color:#16a085;color:#16a085" title="تحميل نتائج المعاينة Excel"><i class="fas fa-file-excel"></i> تحميل Excel</button>
        ${hasPerm('blood_bags', 'edit') ? `<button class="btn btn-primary" data-click="bbDoGenerate" style="background:#27ae60;border-color:#27ae60"><i class="fas fa-upload"></i> توليد وحفظ في الشهري</button>` : ''}
      </div>
      <div style="background:#e8f5e9;border:1px solid #a5d6a7;color:#2e7d32;padding:8px 12px;border-radius:8px;font-size:12px;margin-top:10px"><i class="fas fa-info-circle" style="margin-left:4px"></i> تُحسب المؤشرات والتجميع والمنصرف تلقائياً من سجلات الأكياس وتُحفظ في شاشات مؤشرات الأداء ومنصرف فصائل الدم (تحديث بدلاً من الإدخال اليدوي).</div>
    </div>
  </div>
  <div id="bbMonthOut"></div>`;
}
async function bbPreviewMonthly() {
  const out = document.getElementById('bbMonthOut');
  const year = parseInt(document.getElementById('bbMy').value);
  const month = parseInt(document.getElementById('bbMm').value);
  showPageLoading(out, 'جاري حساب البيانات الشهرية...');
  try {
    const r = await api('GET', '/blood-bags/monthly-preview?year=' + year + '&month=' + month);
    const big = Object.keys(r.big || {}), small = Object.keys(r.small || {}), cons = Object.keys(r.cons || {});
    const hosp = r.hospitals || {};
    let html = '';
    if (big.length) {
      html += `<div class="card" style="margin-bottom:14px"><div class="card-header" style="padding:10px 16px;background:#c0392b22;color:#c0392b"><strong><i class="fas fa-chart-simple" style="margin-left:6px"></i> مؤشرات تجميعيه (${BB_MONTHS_AR[month - 1]} ${year})</strong></div>
      <div class="card-body table-scroll"><table class="data-table" style="font-size:12px">        <thead><tr><th>بنك الدم</th><th>المحافظة</th><th>إجمالي التجميع</th><th>وارد</th><th>تبرع علاجي</th><th>لم يكتمل</th><th>دهون</th><th>صفراء</th><th>سي</th><th>بي</th><th>ايدز</th><th>زهري</th><th>فحوصات الدم</th><th>مرتجع</th><th>تفاعل</th><th>نظام مفتوح</th><th>إعدامات أخرى</th></tr></thead><tbody>
      ${big.map(hid => { const d = r.big[hid]; return `<tr><td style="text-align:right;font-weight:600">${esc(hosp[hid]?.name || '')}</td><td style="text-align:center">${esc(hosp[hid]?.governorate || '')}</td>
      <td style="text-align:center;font-weight:700">${d.collect_total || 0}</td><td style="text-align:center;font-weight:700;color:#2e86c1">${d.inc_regional || 0}</td><td style="text-align:center">${d.donation_therapeutic || 0}</td><td style="text-align:center">${d.uncompleted || 0}</td>
      <td style="text-align:center">${d.refused_fatty || 0}</td><td style="text-align:center">${d.refused_icteric || 0}</td><td style="text-align:center">${d.virology_c || 0}</td>
      <td style="text-align:center">${d.virology_b || 0}</td><td style="text-align:center">${d.virology_i || 0}</td><td style="text-align:center">${d.virology_dollar || 0}</td>
      <td style="text-align:center">${d.blood_groups || 0}</td><td style="text-align:center">${d.disp_returned || 0}</td><td style="text-align:center">${d.disp_reaction || 0}</td><td style="text-align:center">${d.disp_open || 0}</td><td style="text-align:center;font-weight:700;color:#c0392b">${d.disp_other || 0}</td></tr>`; }).join('')}
      </tbody></table></div></div>`;
    }
    if (small.length) {
      html += `<div class="card" style="margin-bottom:14px"><div class="card-header" style="padding:10px 16px;background:#16a08522;color:#16a085"><strong><i class="fas fa-boxes-stacked" style="margin-left:6px"></i> مؤشرات تخزينيه (${BB_MONTHS_AR[month - 1]} ${year})</strong></div>
      <div class="card-body table-scroll"><table class="data-table" style="font-size:12px">        <thead><tr><th>بنك الدم</th><th>المحافظة</th><th>وارد من التجميعي</th><th>وارد إقليمي</th><th>إجمالي الصرف</th><th>داخلي</th><th>فرع</th><th>هيئة</th><th>خارجي</th><th>مرتجع</th><th>تفاعل</th><th>نظام مفتوح</th><th>إعدامات أخرى</th></tr></thead><tbody>
      ${small.map(hid => { const d = r.small[hid]; return `<tr><td style="text-align:right;font-weight:600">${esc(hosp[hid]?.name || '')}</td><td style="text-align:center">${esc(hosp[hid]?.governorate || '')}</td>
      <td style="text-align:center;font-weight:700">${d.inc_collected || 0}</td><td style="text-align:center">${d.inc_regional || 0}</td><td style="text-align:center;font-weight:700">${d.out_blood || 0}</td>
      <td style="text-align:center">${d.out_blood_int || 0}</td><td style="text-align:center">${d.out_blood_branch || 0}</td><td style="text-align:center">${d.out_blood_auth || 0}</td>
      <td style="text-align:center">${d.out_blood_ext || 0}</td><td style="text-align:center">${d.disp_returned || 0}</td><td style="text-align:center">${d.disp_reaction || 0}</td><td style="text-align:center">${d.disp_open || 0}</td><td style="text-align:center;font-weight:700;color:#c0392b">${d.disp_other || 0}</td></tr>`; }).join('')}
      </tbody></table></div></div>`;
    }
    if (cons.length) {
      html += `<div class="card" style="margin-bottom:14px"><div class="card-header" style="padding:10px 16px;background:#e91e6322;color:#e91e63"><strong><i class="fas fa-droplet" style="margin-left:6px"></i> منصرف فصائل الدم (${BB_MONTHS_AR[month - 1]} ${year})</strong></div>
      <div class="card-body table-scroll"><table class="data-table" style="font-size:12px"><thead><tr><th>بنك الدم</th><th>المحافظة</th>${BB_BTYPES_CLI.map(t => `<th>${t}</th>`).join('')}</tr></thead><tbody>
      ${cons.map(hid => { const d = r.cons[hid]; return `<tr><td style="text-align:right;font-weight:600">${esc(hosp[hid]?.name || '')}</td><td style="text-align:center">${esc(hosp[hid]?.governorate || '')}</td>${BB_BTYPES_CLI.map(t => `<td style="text-align:center">${d[t] || 0}</td>`).join('')}</tr>`; }).join('')}
      </tbody></table></div></div>`;
    }
    if (!html) html = '<div class="empty-msg">لا توجد أكياس مسجلة في هذا الشهر</div>';
    _bb.lastMonthly = { r, year, month };
    out.innerHTML = html;
  } catch (e) { out.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}
function bbExportMonthly() {
  const d = _bb.lastMonthly;
  if (!d || !d.r || !(d.r.big || d.r.small || d.r.cons)) { showToast('❌ اعمل معاينة الحساب أولاً', 'error'); return; }
  const { r, year, month } = d;
  const hosp = r.hospitals || {};
  const label = BB_MONTHS_AR[month - 1] + ' ' + year;
  const big = Object.keys(r.big || {}), small = Object.keys(r.small || {}), cons = Object.keys(r.cons || {});
  if (typeof ExcelJS === 'undefined') { showToast('❌ مكتبة ExcelJS غير محمّلة', 'error'); return; }
  try {
    const wb = new ExcelJS.Workbook();
    if (big.length) {
      const ws = wb.addWorksheet('مؤشرات تجميعيه');
      const rows = big.map(hid => { const d = r.big[hid]; return [hosp[hid]?.name || '', hosp[hid]?.governorate || '', d.collect_total || 0, d.inc_regional || 0, d.donation_therapeutic || 0, d.uncompleted || 0, d.refused_fatty || 0, d.refused_icteric || 0, d.virology_c || 0, d.virology_b || 0, d.virology_i || 0, d.virology_dollar || 0, d.blood_groups || 0, d.disp_returned || 0, d.disp_reaction || 0, d.disp_open || 0, d.disp_other || 0]; });
      _bbFillSheet(ws, ['بنك الدم', 'المحافظة', 'إجمالي التجميع', 'وارد', 'تبرع علاجي', 'لم يكتمل', 'دهون', 'صفراء', 'سي', 'بي', 'ايدز', 'زهري', 'فحوصات الدم', 'مرتجع', 'تفاعل', 'نظام مفتوح', 'إعدامات أخرى'], rows, 'مؤشرات تجميعيه — ' + label);
    }
    if (small.length) {
      const ws = wb.addWorksheet('مؤشرات تخزينيه');
      const rows = small.map(hid => { const d = r.small[hid]; return [hosp[hid]?.name || '', hosp[hid]?.governorate || '', d.inc_collected || 0, d.inc_regional || 0, d.out_blood || 0, d.out_blood_int || 0, d.out_blood_branch || 0, d.out_blood_auth || 0, d.out_blood_ext || 0, d.disp_returned || 0, d.disp_reaction || 0, d.disp_open || 0, d.disp_other || 0]; });
      _bbFillSheet(ws, ['بنك الدم', 'المحافظة', 'وارد من التجميعي', 'وارد إقليمي', 'إجمالي الصرف', 'داخلي', 'فرع', 'هيئة', 'خارجي', 'مرتجع', 'تفاعل', 'نظام مفتوح', 'إعدامات أخرى'], rows, 'مؤشرات تخزينيه — ' + label);
    }
    if (cons.length) {
      const ws = wb.addWorksheet('منصرف فصائل الدم');
      const rows = cons.map(hid => { const d = r.cons[hid]; return [hosp[hid]?.name || '', hosp[hid]?.governorate || '', ...BB_BTYPES_CLI.map(t => d[t] || 0)]; });
      _bbFillSheet(ws, ['بنك الدم', 'المحافظة', ...BB_BTYPES_CLI], rows, 'منصرف فصائل الدم — ' + label);
    }
    if (!wb.worksheets.length) { showToast('❌ لا توجد بيانات للتصدير', 'error'); return; }
    _xlsxDl(wb, 'الشهري_' + year + '_' + month + '.xlsx');
  } catch (e) { showToast('❌ خطأ في التصدير: ' + e.message, 'error'); }
}
function _bbFillSheet(ws, headers, rows, title) {
  const mc = headers.length;
  const sr = _xlsxTitleRow(ws, 1, title, 'نظام بنك الدم — بيانات شهرية تلقائية', mc);
  const hr = ws.getRow(sr);
  headers.forEach((h, i) => {
    const c = hr.getCell(i + 1);
    c.value = h;
    c.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF27AE60' } };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    c.border = _XBN;
  });
  hr.height = 24;
  rows.forEach((r, i) => {
    const row = ws.getRow(sr + 1 + i);
    headers.forEach((h, j) => {
      const c = row.getCell(j + 1);
      const v = r[j];
      const num = _bbNum(v);
      if (num !== null) { c.value = num; c.numFmt = '#,##0'; }
      else c.value = (v === null || v === undefined) ? '' : String(v);
      c.alignment = { horizontal: 'center', vertical: 'middle' };
      c.border = _XBN;
      c.font = { size: 9 };
      if (i % 2) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F9F4' } };
    });
    row.height = 18;
  });
  headers.forEach((h, i) => ws.getColumn(i + 1).width = Math.min(34, Math.max(12, (String(h).length || 6) * 2 + 4)));
  _xlsxFooter(ws, sr + 1 + rows.length, mc);
}

/* ----- الإحصائيات (بين فترتين — نطاق تاريخ من/إلى) + إدارة الأقسام + سجل الوارد ----- */
async function bbStats() {
  const el = document.getElementById('bbBody');
  const canEdit = hasPerm('blood_bags', 'edit');
  const canDelete = hasPerm('blood_bags', 'delete');
  const dfltTo = fmtCairoDate('date');
  const dfltFrom = fmtCairoDate('date');
  let html = `<div class="card" style="margin-bottom:16px;border-right:4px solid #e67e22">
    <div class="card-header" style="padding:10px 16px"><strong><i class="fas fa-chart-line" style="margin-left:6px"></i> إحصائيات بين فترتين — حساب تلقائي من الأكياس</strong></div>
    <div class="card-body" style="padding:10px 16px">
      <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end">
        <div class="form-group"><label>بحث في كل الجداول</label><input class="form-control" id="bbStatsQ" data-input="bbStatsQChanged" style="min-width:220px" placeholder="رقم لي / باركود / مستشفى / فصيلة / مريض"></div>
        <div class="form-group"><label>من تاريخ</label><input type="date" class="form-control" id="bbStFrom" data-change="bbStatsPeriodChanged" value="${dfltFrom}" style="min-width:150px"></div>
        <div class="form-group"><label>إلى تاريخ</label><input type="date" class="form-control" id="bbStTo" data-change="bbStatsPeriodChanged" value="${dfltTo}" style="min-width:150px"></div>
        <button class="btn btn-outline" data-click="bbPreviewStats" style="border-color:#e67e22;color:#e67e22"><i class="fas fa-eye"></i> معاينة الحساب</button>
        <button class="btn btn-outline" data-click="bbExportStats" style="border-color:#16a085;color:#16a085" title="تحميل نتائج المعاينة Excel"><i class="fas fa-file-excel"></i> تحميل Excel</button>
      </div>
      <div style="background:#fde9e0;border:1px solid #f5c6aa;color:#a04000;padding:8px 12px;border-radius:8px;font-size:12px;margin-top:10px"><i class="fas fa-info-circle" style="margin-left:4px"></i> تُحسب مؤشرات التجميع والوارد والمنصرف والإعدامات تلقائياً من سجلات الأكياس خلال الفترة المحددة (من/إلى) — بدون حفظ في الشهري.</div>
    </div>
  </div>`;
  html += `<div class="card" style="margin-bottom:16px;border-right:4px solid #6c3483">
    <div class="card-header" style="padding:10px 16px"><strong><i class="fas fa-filter" style="margin-left:6px"></i> تصفية الجداول</strong></div>
    <div class="card-body" style="padding:10px 16px">
      <div class="form-group" style="max-width:320px"><label>عرض جدول</label><select class="form-control" id="bbStatsTab" data-change="bbStatsFilterTables">
        <option value="">كل الجداول</option>
        <option value="inlog"${_bb.statsSel === 'inlog' ? ' selected' : ''}>سجل الوارد</option>
        <option value="bagrpt"${_bb.statsSel === 'bagrpt' ? ' selected' : ''}>تقرير الأكياس التفصيلي</option>
        <option value="explog"${_bb.statsSel === 'explog' ? ' selected' : ''}>سجل انتهاء صلاحيه</option>
        <option value="displog"${_bb.statsSel === 'displog' ? ' selected' : ''}>سجل التفاعل والمرتجع ونظام مفتوح</option>
        <option value="dept"${_bb.statsSel === 'dept' ? ' selected' : ''}>الصرف حسب القسم</option>
        <option value="big"${_bb.statsSel === 'big' ? ' selected' : ''}>مؤشرات تجميعيه (معاينة)</option>
        <option value="small"${_bb.statsSel === 'small' ? ' selected' : ''}>مؤشرات تخزينيه (معاينة)</option>
        <option value="cons"${_bb.statsSel === 'cons' ? ' selected' : ''}>منصرف فصائل الدم (معاينة)</option>
      </select></div>
    </div>
  </div>`;
  if (canEdit || canDelete) {
    html += `<div class="card" style="margin-bottom:16px;border-right:4px solid #6a1b9a">
    <div class="card-header" style="padding:10px 16px"><strong><i class="fas fa-building-columns" style="margin-left:6px"></i> إدارة أقسام المستشفيات</strong></div>
    <div class="card-body" style="padding:10px 16px">
      <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin-bottom:10px">
        <div class="form-group"><label>بنك الدم</label><select class="form-control" id="bbDepHosp" data-change="bbRenderDepts" style="min-width:220px">${bbOptHosp('')}</select></div>
        ${canEdit ? `<div class="form-group"><label>اسم القسم</label><input class="form-control" id="bbDepName" style="min-width:160px" placeholder="مثال: قسم الطوارئ"></div>
        <button class="btn btn-primary" data-click="bbAddDept" style="height:32px"><i class="fas fa-plus"></i> إضافة قسم</button>` : ''}
      </div>
      <div id="bbDeptList"></div>
    </div>
  </div>`;
  }
  html += `<div id="bbStatsCardInLog"><div class="card"><div class="card-header" style="padding:10px 16px"><strong><i class="fas fa-clock-rotate-left" style="margin-left:6px"></i> سجل الوارد</strong></div>
    <div class="card-body table-scroll"><div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin-bottom:8px">
      <button class="btn btn-outline" data-click="bbExportInLog" style="border-color:#16a085;color:#16a085;height:32px" title="تحميل القائمة المفلترة حالياً"><i class="fas fa-file-excel"></i> تحميل Excel</button>
    </div>
    <table class="data-table" style="font-size:12px"><thead>
      <tr><th>رقم اللي</th><th>رقم الكود</th><th>من (الجهة)</th><th>إلى</th><th>المنتج</th><th>الفصيلة</th><th>الصلاحية</th><th>تاريخ الوصول</th><th>بواسطة</th><th>الحالة</th></tr>
    </thead><tbody id="bbInLogBody"></tbody></table></div></div></div>`;
  if (canEdit || canDelete) {
    html += `<div id="bbStatsCardBagRpt"><div class="card" style="margin-top:16px;border-right:4px solid #27ae60"><div class="card-header" style="padding:10px 16px;background:#27ae6022;color:#27ae60"><strong><i class="fas fa-table" style="margin-left:6px"></i> تقرير الأكياس التفصيلي</strong></div>
      <div class="card-body table-scroll"><div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin-bottom:8px">
        <div class="form-group"><label>المنتج</label><select class="form-control" id="bbBagRptProd" data-change="bbRenderBagReport" style="min-width:140px">${bbOptProduct('')}</select></div>
        <div class="form-group"><label>الحالة</label><select class="form-control" id="bbBagRptSt" data-change="bbRenderBagReport" style="min-width:140px"><option value="">كل الحالات</option><option value="collected">تحت الفحص</option><option value="available">مُفحوص / متاح</option><option value="returned">مرتجع</option><option value="reserved">محجوز</option><option value="issued">مُصرف</option><option value="disposed">مُعدَم</option><option value="reaction">تفاعل</option></select></div>
        <button class="btn btn-outline" data-click="bbExportBagReport" style="border-color:#27ae60;color:#27ae60;height:32px" title="تحميل القائمة المفلترة حالياً"><i class="fas fa-file-excel"></i> تحميل Excel</button>
      </div>
      <table class="data-table" style="font-size:12px"><thead>
        <tr><th>الفرع</th><th>اسم المستشفي</th><th>المنتج</th><th>فصيلة الوحدة</th><th>رقم اللي</th><th>الباركود</th><th>تاريخ الانتهاء</th><th>الحالة</th><th>المتبقي</th><th>سبب الإعدام</th><th>إجراءات</th></tr>
      </thead><tbody id="bbBagReportBody"></tbody></table></div></div></div>`;
    html += `<div id="bbStatsCardExpLog"><div class="card" style="margin-top:16px;border-right:4px solid #b7950b"><div class="card-header" style="padding:10px 16px;background:#b7950b22;color:#b7950b"><strong><i class="fas fa-hourglass-half" style="margin-left:6px"></i> سجل انتهاء صلاحيه — كل الأكياس الواردة + بيان الصرف + ما تم إعدامه</strong></div>
      <div class="card-body table-scroll"><div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin-bottom:8px">
        <div class="form-group"><label>النوع</label><select class="form-control" id="bbExpLogSt" data-change="bbRenderExpLog" style="min-width:150px"><option value="">كل الحالات</option><option value="expired">انتهاء الصلاحية (المنتهية صلاحيتها)</option><option value="issued">مُصرف</option><option value="disposed">مُعدَم (الرصيد + التجميع)</option><option value="returned">مرتجع</option><option value="reaction">تفاعل</option></select></div>
        <button class="btn btn-outline" data-click="bbExportExpLog" style="border-color:#b7950b;color:#b7950b;height:32px" title="تحميل القائمة المفلترة حالياً"><i class="fas fa-file-excel"></i> تحميل Excel</button>
      </div>
      <table class="data-table" style="font-size:12px"><thead>
        <tr><th>الفرع</th><th>اسم المستشفي</th><th>رقم اللي</th><th>الباركود</th><th>المنتج</th><th>فصيلة الوحدة</th><th>تاريخ الوارد</th><th>تاريخ الجمع</th><th>تاريخ الانتهاء</th><th>المتبقي</th><th>الحالة</th><th>سبب الإعدام</th><th>تاريخ الصرف</th><th>المصروف إليه</th><th>إجراءات</th></tr>
      </thead><tbody id="bbExpLogBody"></tbody></table></div></div></div>`;
    html += `<div id="bbStatsCardDispLog"><div class="card" style="margin-top:16px;border-right:4px solid #8e44ad"><div class="card-header" style="padding:10px 16px;background:#8e44ad22;color:#8e44ad"><strong><i class="fas fa-rotate-right" style="margin-left:6px"></i> سجل التفاعل والمرتجع ونظام مفتوح — سجل الصرف كاملاً + ما تم إعدامه (تفاعل / غيره)</strong></div>
      <div class="card-body table-scroll"><div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin-bottom:8px">
        <div class="form-group"><label>النوع</label><select class="form-control" id="bbDispLogSt" data-change="bbRenderDispLog" style="min-width:150px"><option value="">كل الحالات</option><option value="issued">مُصرف</option><option value="reaction">تفاعل</option><option value="returned">مرتجع</option><option value="disposed">إعدام آخر (نظام مفتوح / أخرى)</option></select></div>
        <button class="btn btn-outline" data-click="bbExportDispLog" style="border-color:#8e44ad;color:#8e44ad;height:32px" title="تحميل القائمة المفلترة حالياً"><i class="fas fa-file-excel"></i> تحميل Excel</button>
      </div>
      <table class="data-table" style="font-size:12px"><thead>
        <tr><th>الفرع</th><th>اسم المستشفي</th><th>رقم اللي</th><th>الباركود</th><th>المنتج</th><th>فصيلة الوحدة</th><th>تاريخ الصرف</th><th>المصروف إليه</th><th>بواسطة</th><th>نوع الصرف</th><th>الحالة</th><th>سبب الإعدام</th><th>إجراءات</th></tr>
      </thead><tbody id="bbDispLogBody"></tbody></table></div></div></div>`;
    html += `<div id="bbStatsCardDept"><div class="card" style="margin-top:16px;border-right:4px solid #1e88e5"><div class="card-header" style="padding:10px 16px;background:#1e88e522;color:#1e88e5"><strong><i class="fas fa-building" style="margin-left:6px"></i> الصرف حسب القسم — خلال الفترة المحددة</strong></div>
      <div class="card-body table-scroll">
      <table class="data-table" style="font-size:12px"><thead>
        <tr><th>القسم المصرف له</th><th>عدد الأكياس المُصرفة</th></tr>
      </thead><tbody id="bbStatsDeptBody"></tbody></table></div></div></div>`;
  }
  html += `<div id="bbStatsOut"></div>`;
  el.innerHTML = html;
  await bbLoadDepartments();
  await bbLoadBags();
  await bbLoadReservations();
  bbRenderDepts();
  bbRenderInLog();
  bbRenderBagReport();
  bbRenderExpLog();
  bbRenderDispLog();
  bbRenderDeptStats();
  bbStatsFilterTables();
  bbPreviewStats();
}
function bbStatsFilterTables() {
  const sel = document.getElementById('bbStatsTab');
  const v = sel ? sel.value : (_bb.statsSel || '');
  _bb.statsSel = v;
  const show = (id, on) => { const elm = document.getElementById(id); if (elm) elm.style.display = on ? '' : 'none'; };
  const kpi = document.getElementById('bbStatsKpi');
  if (kpi) kpi.style.display = v === '' ? '' : 'none';
  show('bbStatsCardInLog', v === '' || v === 'inlog');
  show('bbStatsCardBagRpt', v === '' || v === 'bagrpt');
  show('bbStatsCardExpLog', v === '' || v === 'explog');
  show('bbStatsCardDispLog', v === '' || v === 'displog');
  show('bbStatsCardBig', v === 'big');
  show('bbStatsCardSmall', v === 'small');
  show('bbStatsCardCons', v === 'cons');
  show('bbStatsCardDept', v === '' || v === 'dept');
}
function bbStatsQ() {
  const el = document.getElementById('bbStatsQ');
  return el ? el.value.trim().toLowerCase() : '';
}
function bbStatsPeriod() {
  const f = document.getElementById('bbStFrom'), t = document.getElementById('bbStTo');
  return { from: f ? f.value : '', to: t ? t.value : '' };
}
function bbInPeriod(d, from, to) {
  if (!from && !to) return true;
  if (!d) return false;
  const s = String(d).slice(0, 10);
  return (from ? s >= from : true) && (to ? s <= to : true);
}
function bbStatsQChanged() {
  bbRenderInLog(); bbRenderBagReport(); bbRenderExpLog(); bbRenderDispLog(); bbRenderDeptStats(); bbRenderStatsPreview();
}
function bbStatsPeriodChanged() {
  bbRenderInLog(); bbRenderBagReport(); bbRenderExpLog(); bbRenderDispLog(); bbRenderDeptStats(); bbPreviewStats();
}
function bbRenderDeptStats() {
  const body = document.getElementById('bbStatsDeptBody');
  if (!body) return;
  const q = bbStatsQ();
  const { from, to } = bbStatsPeriod();
  const counts = {};
  (_bb.reservations || []).forEach(r => {
    if (r.status !== 'issued') return;
    if (!bbInPeriod(r.issued_at, from, to)) return;
    const dept = (r.issued_department && String(r.issued_department).trim()) || 'بدون قسم';
    counts[dept] = (counts[dept] || 0) + 1;
  });
  let rows = Object.keys(counts).map(k => [k, counts[k]]);
  if (q) rows = rows.filter(x => String(x[0]).toLowerCase().indexOf(q) !== -1);
  rows.sort((a, b) => b[1] - a[1]);
  body.innerHTML = rows.length
    ? rows.map(x => `<tr><td style="text-align:right;font-weight:600">${esc(x[0])}</td><td style="text-align:center;font-weight:700">${x[1]}</td></tr>`).join('')
    : `<tr><td colspan="2" class="empty-msg">لا توجد بيانات</td></tr>`;
}
async function bbPreviewStats() {
  const out = document.getElementById('bbStatsOut');
  const from = document.getElementById('bbStFrom').value;
  const to = document.getElementById('bbStTo').value;
  if (!from || !to) { showToast('❌ حدد تاريخ البداية والنهاية', 'error'); return; }
  showPageLoading(out, 'جاري حساب الإحصائيات...');
  try {
    const r = await api('GET', '/blood-bags/stats-range?from=' + from + '&to=' + to);
    _bb.lastStats = { r, from, to };
    bbRenderStatsPreview();
  } catch (e) { out.innerHTML = `<div class="empty-msg">${sanitize(e.message)}</div>`; }
}
function bbRenderStatsPreview() {
  const d = _bb.lastStats;
  if (!d || !d.r) return;
  const { r, from, to } = d;
  const big = Object.keys(r.big || {}), small = Object.keys(r.small || {}), cons = Object.keys(r.cons || {});
  const hosp = r.hospitals || {};
  const sum = (m, k) => Object.keys(m || {}).reduce((a, h) => a + (m[h][k] || 0), 0);
  const q = bbStatsQ();
  const qf = hid => (hosp[hid]?.name || '').toLowerCase().indexOf(q) !== -1;
  let html = '';
  const kp = [];
  if (big.length) {
    kp.push(['إجمالي التجميع', '#c0392b', sum(r.big, 'collect_total')]);
    kp.push(['وارد إقليمي', '#2e86c1', sum(r.big, 'inc_regional')]);
    kp.push(['إعدامات أخرى', '#c0392b', sum(r.big, 'disp_other')]);
  }
  if (small.length) {
    kp.push(['وارد من التجميعي', '#16a085', sum(r.small, 'inc_collected')]);
    kp.push(['إجمالي الصرف', '#e67e22', sum(r.small, 'out_blood')]);
    kp.push(['مرتجع', '#f39c12', sum(r.small, 'disp_returned')]);
    kp.push(['تفاعل', '#8e44ad', sum(r.small, 'disp_reaction')]);
    kp.push(['نظام مفتوح', '#e74c3c', sum(r.small, 'disp_open')]);
    kp.push(['إعدامات أخرى', '#7f8c8d', sum(r.small, 'disp_other')]);
  }
  if (kp.length) {
    html += `<div id="bbStatsKpi" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:14px">` +
      kp.map(k => `<div class="bb-stat-card" style="text-align:center;padding:12px;border-radius:10px;background:var(--card-bg);border:1px solid var(--border)">
        <div style="font-size:22px;font-weight:700;color:${k[1]}">${_bbNum(k[2]) ?? k[2]}</div>
        <div style="font-size:12px;color:var(--text-soft);margin-top:2px">${k[0]}</div></div>`).join('') + `</div>`;
  }
  if (big.length) {
    const rows = big.filter(qf);
    html += `<div id="bbStatsCardBig"><div class="card" style="margin-bottom:14px"><div class="card-header" style="padding:10px 16px;background:#c0392b22;color:#c0392b"><strong><i class="fas fa-chart-simple" style="margin-left:6px"></i> مؤشرات تجميعيه — ${from} إلى ${to}</strong></div>
    <div class="card-body table-scroll"><table class="data-table" style="font-size:12px"><thead><tr><th>بنك الدم</th><th>المحافظة</th><th>إجمالي التجميع</th><th>وارد</th><th>تبرع علاجي</th><th>لم يكتمل</th><th>دهون</th><th>صفراء</th><th>سي</th><th>بي</th><th>ايدز</th><th>زهري</th><th>فحوصات الدم</th><th>مرتجع</th><th>تفاعل</th><th>نظام مفتوح</th><th>إعدامات أخرى</th></tr></thead><tbody>
    ${rows.length ? rows.map(hid => { const d = r.big[hid]; return `<tr><td style="text-align:right;font-weight:600">${esc(hosp[hid]?.name || '')}</td><td style="text-align:center">${esc(hosp[hid]?.governorate || '')}</td>
    <td style="text-align:center;font-weight:700">${d.collect_total || 0}</td><td style="text-align:center;font-weight:700;color:#2e86c1">${d.inc_regional || 0}</td><td style="text-align:center">${d.donation_therapeutic || 0}</td><td style="text-align:center">${d.uncompleted || 0}</td>
    <td style="text-align:center">${d.refused_fatty || 0}</td><td style="text-align:center">${d.refused_icteric || 0}</td><td style="text-align:center">${d.virology_c || 0}</td>
    <td style="text-align:center">${d.virology_b || 0}</td><td style="text-align:center">${d.virology_i || 0}</td><td style="text-align:center">${d.virology_dollar || 0}</td>
    <td style="text-align:center">${d.blood_groups || 0}</td><td style="text-align:center">${d.disp_returned || 0}</td><td style="text-align:center">${d.disp_reaction || 0}</td><td style="text-align:center">${d.disp_open || 0}</td><td style="text-align:center;font-weight:700;color:#c0392b">${d.disp_other || 0}</td></tr>`; }).join('') : `<tr><td colspan="17" class="empty-msg">لا توجد بيانات</td></tr>`}
    </tbody></table></div></div></div>`;
  }
  if (small.length) {
    const rows = small.filter(qf);
    html += `<div id="bbStatsCardSmall"><div class="card" style="margin-bottom:14px"><div class="card-header" style="padding:10px 16px;background:#16a08522;color:#16a085"><strong><i class="fas fa-boxes-stacked" style="margin-left:6px"></i> مؤشرات تخزينيه — ${from} إلى ${to}</strong></div>
    <div class="card-body table-scroll"><table class="data-table" style="font-size:12px"><thead><tr><th>بنك الدم</th><th>المحافظة</th><th>وارد من التجميعي</th><th>وارد إقليمي</th><th>إجمالي الصرف</th><th>داخلي</th><th>فرع</th><th>هيئة</th><th>خارجي</th><th>مرتجع</th><th>تفاعل</th><th>نظام مفتوح</th><th>إعدامات أخرى</th></tr></thead><tbody>
    ${rows.length ? rows.map(hid => { const d = r.small[hid]; return `<tr><td style="text-align:right;font-weight:600">${esc(hosp[hid]?.name || '')}</td><td style="text-align:center">${esc(hosp[hid]?.governorate || '')}</td>
    <td style="text-align:center;font-weight:700">${d.inc_collected || 0}</td><td style="text-align:center">${d.inc_regional || 0}</td><td style="text-align:center;font-weight:700">${d.out_blood || 0}</td>
    <td style="text-align:center">${d.out_blood_int || 0}</td><td style="text-align:center">${d.out_blood_branch || 0}</td><td style="text-align:center">${d.out_blood_auth || 0}</td>
    <td style="text-align:center">${d.out_blood_ext || 0}</td><td style="text-align:center">${d.disp_returned || 0}</td><td style="text-align:center">${d.disp_reaction || 0}</td><td style="text-align:center">${d.disp_open || 0}</td><td style="text-align:center;font-weight:700;color:#c0392b">${d.disp_other || 0}</td></tr>`; }).join('') : `<tr><td colspan="13" class="empty-msg">لا توجد بيانات</td></tr>`}
    </tbody></table></div></div></div>`;
  }
  const consRows = cons.filter(qf);
  html += `<div id="bbStatsCardCons"><div class="card" style="margin-bottom:14px"><div class="card-header" style="padding:10px 16px;background:#e91e6322;color:#e91e63"><strong><i class="fas fa-droplet" style="margin-left:6px"></i> منصرف فصائل الدم — ${from} إلى ${to}</strong></div>
  <div class="card-body table-scroll"><table class="data-table" style="font-size:12px"><thead><tr><th>بنك الدم</th><th>المحافظة</th>${BB_BTYPES_CLI.map(t => `<th>${t}</th>`).join('')}</tr></thead><tbody>
  ${consRows.length ? consRows.map(hid => { const d = r.cons[hid]; return `<tr><td style="text-align:right;font-weight:600">${esc(hosp[hid]?.name || '')}</td><td style="text-align:center">${esc(hosp[hid]?.governorate || '')}</td>${BB_BTYPES_CLI.map(t => `<td style="text-align:center">${d[t] || 0}</td>`).join('')}</tr>`; }).join('') : `<tr><td colspan="${BB_BTYPES_CLI.length + 2}" class="empty-msg">لا توجد بيانات</td></tr>`}
  </tbody></table></div></div></div>`;
  if (!big.length && !small.length && !cons.length) html = '<div class="empty-msg">لا توجد أكياس مسجلة في هذه الفترة</div>';
  const out = document.getElementById('bbStatsOut');
  out.innerHTML = html;
  bbStatsFilterTables();
}
function bbExportStats() {
  const d = _bb.lastStats;
  if (!d || !d.r || !(d.r.big || d.r.small || d.r.cons)) { showToast('❌ اعمل معاينة الحساب أولاً', 'error'); return; }
  const { r, from, to } = d;
  const hosp = r.hospitals || {};
  const label = from + ' إلى ' + to;
  const big = Object.keys(r.big || {}), small = Object.keys(r.small || {}), cons = Object.keys(r.cons || {});
  if (typeof ExcelJS === 'undefined') { showToast('❌ مكتبة ExcelJS غير محمّلة', 'error'); return; }
  try {
    const wb = new ExcelJS.Workbook();
    if (big.length) {
      const ws = wb.addWorksheet('مؤشرات تجميعيه');
      const rows = big.map(hid => { const d = r.big[hid]; return [hosp[hid]?.name || '', hosp[hid]?.governorate || '', d.collect_total || 0, d.inc_regional || 0, d.donation_therapeutic || 0, d.uncompleted || 0, d.refused_fatty || 0, d.refused_icteric || 0, d.virology_c || 0, d.virology_b || 0, d.virology_i || 0, d.virology_dollar || 0, d.blood_groups || 0, d.disp_returned || 0, d.disp_reaction || 0, d.disp_open || 0, d.disp_other || 0]; });
      _bbFillSheet(ws, ['بنك الدم', 'المحافظة', 'إجمالي التجميع', 'وارد', 'تبرع علاجي', 'لم يكتمل', 'دهون', 'صفراء', 'سي', 'بي', 'ايدز', 'زهري', 'فحوصات الدم', 'مرتجع', 'تفاعل', 'نظام مفتوح', 'إعدامات أخرى'], rows, 'مؤشرات تجميعيه — ' + label);
    }
    if (small.length) {
      const ws = wb.addWorksheet('مؤشرات تخزينيه');
      const rows = small.map(hid => { const d = r.small[hid]; return [hosp[hid]?.name || '', hosp[hid]?.governorate || '', d.inc_collected || 0, d.inc_regional || 0, d.out_blood || 0, d.out_blood_int || 0, d.out_blood_branch || 0, d.out_blood_auth || 0, d.out_blood_ext || 0, d.disp_returned || 0, d.disp_reaction || 0, d.disp_open || 0, d.disp_other || 0]; });
      _bbFillSheet(ws, ['بنك الدم', 'المحافظة', 'وارد من التجميعي', 'وارد إقليمي', 'إجمالي الصرف', 'داخلي', 'فرع', 'هيئة', 'خارجي', 'مرتجع', 'تفاعل', 'نظام مفتوح', 'إعدامات أخرى'], rows, 'مؤشرات تخزينيه — ' + label);
    }
    if (cons.length) {
      const ws = wb.addWorksheet('منصرف فصائل الدم');
      const rows = cons.map(hid => { const d = r.cons[hid]; return [hosp[hid]?.name || '', hosp[hid]?.governorate || '', ...BB_BTYPES_CLI.map(t => d[t] || 0)]; });
      _bbFillSheet(ws, ['بنك الدم', 'المحافظة', ...BB_BTYPES_CLI], rows, 'منصرف فصائل الدم — ' + label);
    }
    if (!wb.worksheets.length) { showToast('❌ لا توجد بيانات للتصدير', 'error'); return; }
    _xlsxDl(wb, 'احصائيات_' + from + '_' + to + '.xlsx');
  } catch (e) { showToast('❌ خطأ في التصدير: ' + e.message, 'error'); }
}
async function bbDoGenerate() {
  const year = parseInt(document.getElementById('bbMy').value);
  const month = parseInt(document.getElementById('bbMm').value);
  showConfirmModal(`سيتم توليد بيانات ${BB_MONTHS_AR[month - 1]} ${year} من الأكياس وحفظها في مؤشرات الأداء ومنصرف فصائل الدم (تحديث أي بيانات يدوية موجودة). متابعة؟`, async () => {
    try {
      const r = await api('POST', '/blood-bags/generate-monthly', { year, month });
      showToast(`✅ تم التوليد: تجميعي ${r.big} / تخزيني ${r.small} / منصرف ${r.consumption}`);
    } catch (e) { showToast('❌ ' + e.message, 'error'); }
  });
}