/*
 * مولّد ملف «مصادر أعمدة مؤشرات الأداء» — ExcelJS
 * مصدر التعريفات: public/js/indicator-defs.js (المرجع الوحيد للأعمدة)
 * مصدر الحساب: server.js bbComputeRange (المفاتيح والزيادات الفعلية)
 * يشمل العدادات المكتملة: disp_exp_* / child_disp_exp (انتهاء الصلاحية)
 */
'use strict';
const path = require('path');
const ExcelJS = require('exceljs');

const defs = require(path.join(__dirname, 'public', 'js', 'indicator-defs.js'));
const BIG = defs.DEFAULT_BIG_DEFS;
const SMALL = defs.DEFAULT_SMALL_DEFS;

const BTYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// مصادر أعمدة مؤشرات التجميعي (big) — بحسب bbComputeRange
const BIG_SRC = {
  governorate: 'ثابت — محافظة (الفرع) التابع لها بنك الدم من جدول hospitals',
  hospital_name: 'ثابت — اسم بنك الدم التجميعي من جدول hospitals',

  collect_total: 'يُزاد مرة واحدة لكل تبرع دم (المنتج = دم) في النطاق حسب تاريخ التجميع (collection_date) لدى المستشفى التجميعي المصدر (source_hospital_id) — المكوّن الرئيسي فقط كي لا يتكرر التبرع الواحد',
  inc_blood: 'أكياس دم (المنتج = دم) استُلمت لدى المستشفى التجميعي حسب تاريخ الوارد (received_at) داخل النطاق',
  inc_plasma: 'أكياس بلازما استُلمت لدى المستشفى التجميعي حسب تاريخ الوارد (received_at) داخل النطاق',
  inc_sdp: 'أكياس صفائح SDP استُلمت لدى المستشفى التجميعي حسب تاريخ الوارد (received_at) داخل النطاق',
  inc_rdp: 'أكياس صفائح RDP استُلمت لدى المستشفى التجميعي حسب تاريخ الوارد (received_at) داخل النطاق',
  inc_regional: 'أكياس الوارد الإقليمي (source_hospital_id = 0) استُلمت لدى المستشفى التجميعي حسب تاريخ الوارد (received_at) داخل النطاق',

  out_blood_int: 'صرف كيس دم من رصيد المستشفى التجميعي حسب تاريخ الصرف (issued_at) بنوع صرف داخلي (الافتراضي عند عدم تحديد نوع آخر)',
  out_blood_branch: 'صرف كيس دم من رصيد المستشفى التجميعي حسب تاريخ الصرف (issued_at) بنوع صرف «فرع»',
  out_blood_auth: 'صرف كيس دم من رصيد المستشفى التجميعي حسب تاريخ الصرف (issued_at) بنوع صرف «هيئة»',
  out_blood_ext: 'صرف كيس دم من رصيد المستشفى التجميعي حسب تاريخ الصرف (issued_at) بنوع صرف «خارجي»',
  out_plasma_int: 'صرف كيس بلازما من رصيد المستشفى التجميعي حسب تاريخ الصرف (issued_at) بنوع صرف داخلي أو غير خارجي',
  out_plasma_ext: 'صرف كيس بلازما من رصيد المستشفى التجميعي حسب تاريخ الصرف (issued_at) بنوع صرف «خارجي»',
  out_sdp: 'صرف كيس صفائح SDP من رصيد المستشفى التجميعي حسب تاريخ الصرف (issued_at)',
  out_rdp: 'صرف كيس صفائح RDP من رصيد المستشفى التجميعي حسب تاريخ الصرف (issued_at)',

  blood_groups: 'عدد التبرعات (دم) داخل النطاق التي سُجّلت لها فصيلة دم وكانت غير إيجابية (blood_type موجود و status != positive)',
  compatibility: 'عدد حجوزات الأكياس داخل النطاق حسب تاريخ الحجز (reserved_at) لدى المستشفى التجميعي',
  ct: 'معادلة C/T: نسبة التوافق إلى إجمالي صرف الدم — round(div(compatibility, sum(out_blood_int, out_blood_branch, out_blood_auth, out_blood_ext)), 2)',

  donation_therapeutic: 'تبرعات دم بحالة (therapeutic) — سبب الإعدام عند التجميع «تبرع علاجي»',
  uncompleted: 'تبرعات دم بحالة (incomplete) — «تبرع لم يكتمل»',
  refused_fatty: 'تبرعات دم بحالة (fatty) — «دهون»',
  refused_icteric: 'تبرعات دم بحالة (icteric) — «Icteric»',

  disp_exp_blood: 'أكياس دم مُعدَمة لانتهاء الصلاحية (status = disposed و return_reason = انتهاء الصلاحية) في نطاق التجميع',
  disp_exp_plasma: '— معرّف في التعريفات؛ المحرك الحالي يجمع إعدام انتهاء الصلاحية في العمود disp_exp_blood فقط (يظهر هذا العمود 0)',
  disp_exp_sdp: '— معرّف في التعريفات؛ المحرك الحالي يجمع إعدام انتهاء الصلاحية في العمود disp_exp_blood فقط (يظهر هذا العمود 0)',
  disp_exp_rdp: '— معرّف في التعريفات؛ المحرك الحالي يجمع إعدام انتهاء الصلاحية في العمود disp_exp_blood فقط (يظهر هذا العمود 0)',
  disp_other_plasma: '— معرّف في التعريفات؛ المحرك الحالي يجمع إعدامات «أخرى» في العمود disp_other فقط (يظهر هذا العمود 0)',
  disp_other_sdp: '— معرّف في التعريفات؛ المحرك الحالي يجمع إعدامات «أخرى» في العمود disp_other فقط (يظهر هذا العمود 0)',
  disp_other_rdp: '— معرّف في التعريفات؛ المحرك الحالي يجمع إعدامات «أخرى» في العمود disp_other فقط (يظهر هذا العمود 0)',
  disp_returned: 'أكياس سبق صرفها ثم أُرجعت (return_reason = مرتجع) في نطاق التجميع لدى التجميعي',
  disp_reaction: 'أكياس حدث بها تفاعل (status = reaction) في نطاق التجميع لدى التجميعي',
  disp_open: 'أكياس مُعدَمة بنظام مفتوح (status = disposed و return_reason = نظام مفتوح) في نطاق التجميع لدى التجميعي',
  disp_other: 'إعدامات «أخرى» — بحسب الدالة bbIsDispOther: الحالة lipemic أو hemolyzed (إعدام تجميع) أو disposed بسبب (أخرى / شرخ أو كسر / تم الفك و تصرف / Lipemic / Hemolyzed) في نطاق التجميع',

  virology_c: 'تبرعات دم نتيجة فحص HCV (test_hcv) = إيجابي',
  virology_b: 'تبرعات دم نتيجة فحص HBV (test_hbv) = إيجابي',
  virology_i: 'تبرعات دم نتيجة فحص HIV (test_hiv) = إيجابي',
  virology_dollar: 'تبرعات دم نتيجة فحص Syphilis (test_syphilis) = إيجابي',
  virology_total: 'معادلة: إجمالي الفيروسات الإيجابية — sum(virology_c, virology_b, virology_i, virology_dollar)',

  tested: 'معادلة: إجمالي العينات المفحوصة = collect_total - refused_icteric - refused_fatty - uncompleted - donation_therapeutic',
  ratio_uncompleted: 'معادلة: نسبة «لم يكتمل» من التجميع — pct(uncompleted, collect_total)',
  ratio_refused: 'معادلة: نسبة المرفوضة (دهون + Icteric) من التجميع — pct(sum(refused_fatty, refused_icteric), collect_total)',
  ratio_c: 'معادلة: نسبة فيروس C من التجميع — pct(virology_c, collect_total)',
  ratio_b: 'معادلة: نسبة فيروس B من التجميع — pct(virology_b, collect_total)',
  ratio_i: 'معادلة: نسبة الإيدز من التجميع — pct(virology_i, collect_total)',
  ratio_dollar: 'معادلة: نسبة الزهري من التجميع — pct(virology_dollar, collect_total)',
  ratio_exp: 'معادلة: نسبة انتهاء الصلاحية من التجميع — pct(sum(disp_exp_blood, disp_exp_plasma, disp_exp_sdp, disp_exp_rdp), collect_total)',
  ratio_returned: 'معادلة: نسبة المرتجع من التجميع — pct(disp_returned, collect_total)',
  ratio_reaction: 'معادلة: نسبة التفاعل من التجميع — pct(disp_reaction, collect_total)',
  ratio_open: 'معادلة: نسبة نظام المفتوح من التجميع — pct(disp_open, collect_total)',
  ratio_other: 'معادلة: نسبة إعدامات أخرى من التجميع — pct(disp_other, collect_total)',

  child_inc_collected: 'وحدات فئة أطفال (unit_category = أطفال) وارد من التجميعي حسب تاريخ الوارد (received_at) لدى المستشفى التجميعي',
  child_inc_regional: 'وحدات فئة أطفال وارد إقليمي (source_hospital_id = 0) حسب تاريخ الوارد (received_at) لدى المستشفى التجميعي',
  child_out_blood: '— معرّف في التعريفات؛ المحرك الحالي لا يُزاده في مؤشرات التجميعي (يُحتسب في التخزيني فقط — يظهر هذا العمود 0)',
  child_blood_groups: 'تبرعات دم فئة أطفال بفصيلة مسجلة وغير إيجابية (في نطاق التجميع)',
  child_compatibility: 'حجوزات وحدات فئة أطفال (unit_category = أطفال) حسب تاريخ الحجز (reserved_at) لدى المستشفى التجميعي',
  child_ct: 'معادلة C/T للأطفال — round(div(child_compatibility, child_out_blood), 2)',
  child_disp_exp: 'وحدات أطفال مُعدَمة لانتهاء الصلاحية (status = disposed و return_reason = انتهاء الصلاحية) في نطاق التجميع',
  child_disp_returned: 'وحدات أطفال مُرجعة (return_reason = مرتجع) في نطاق التجميع',
  child_disp_reaction: 'وحدات أطفال حدث بها تفاعل (status = reaction) في نطاق التجميع',
  child_disp_open: 'وحدات أطفال مُعدَمة بنظام مفتوح (status = disposed و return_reason = نظام مفتوح) في نطاق التجميع',
  child_disp_other: 'وحدات أطفال مُعدَمة بأسباب أخرى (bbIsDispOther) في نطاق التجميع',

  child_pct_exp: 'معادلة: نسبة إعدام انتهاء الصلاحية للأطفال من منصرف الدم — pct(child_disp_exp, child_out_blood)',
  child_pct_returned: 'معادلة: نسبة المرتجع للأطفال — pct(child_disp_returned, child_out_blood)',
  child_pct_reaction: 'معادلة: نسبة التفاعل للأطفال — pct(child_disp_reaction, child_out_blood)',
  child_pct_open: 'معادلة: نسبة نظام المفتوح للأطفال — pct(child_disp_open, child_out_blood)',
  child_pct_other: 'معادلة: نسبة إعدامات أخرى للأطفال — pct(child_disp_other, child_out_blood)'
};

// مصادر أعمدة مؤشرات التخزيني (small) — بحسب bbComputeRange
const SMALL_SRC = {
  governorate: 'ثابت — محافظة (الفرع) التابع لها بنك الدم من جدول hospitals',
  hospital_name: 'ثابت — اسم بنك الدم التخزيني من جدول hospitals',

  inc_collected: 'أكياس وارد من التجميعي (source_hospital_id != 0) استُلمت لدى المستشفى التخزيني حسب تاريخ الوارد (received_at) داخل النطاق',
  inc_regional: 'أكياس وارد إقليمي (source_hospital_id = 0) استُلمت لدى المستشفى التخزيني حسب تاريخ الوارد (received_at) داخل النطاق',
  inc_plasma: '— معرّف في التعريفات؛ المحرك الحالي لا يفرّق استلام البلازما في التخزيني (يظهر هذا العمود 0)',
  inc_sdp: '— معرّف في التعريفات؛ المحرك الحالي لا يفرّق استلام صفائح SDP في التخزيني (يظهر هذا العمود 0)',
  inc_rdp: '— معرّف في التعريفات؛ المحرك الحالي لا يفرّق استلام صفائح RDP في التخزيني (يظهر هذا العمود 0)',

  out_blood: 'إجمالي أكياس الدم المُصرفة من المستشفى التخزيني حسب تاريخ الصرف (issued_at) داخل النطاق',
  out_blood_int: 'صرف كيس دم بنوع صرف داخلي (الافتراضي عند عدم تحديد نوع آخر)',
  out_blood_branch: 'صرف كيس دم بنوع صرف «فرع»',
  out_blood_auth: 'صرف كيس دم بنوع صرف «هيئة»',
  out_blood_ext: 'صرف كيس دم بنوع صرف «خارجي»',
  out_plasma: '— معرّف في التعريفات؛ المحرك الحالي لا يحسب صرف البلازما في التخزيني (يظهر هذا العمود 0)',
  out_sdp: '— معرّف في التعريفات؛ المحرك الحالي لا يحسب صرف صفائح SDP في التخزيني (يظهر هذا العمود 0)',
  out_rdp: '— معرّف في التعريفات؛ المحرك الحالي لا يحسب صرف صفائح RDP في التخزيني (يظهر هذا العمود 0)',

  blood_groups: '— معرّف في التعريفات؛ المحرك الحالي يحتسب فصائل الدم في مؤشرات التجميعي فقط (يظهر هذا العمود 0)',
  compatibility: 'عدد حجوزات الأكياس داخل النطاق حسب تاريخ الحجز (reserved_at) لدى المستشفى التخزيني',
  ct: 'معادلة C/T للتخزيني: round(div(compatibility, out_blood), 2)',

  disp_exp_blood: 'أكياس دم مُعدَمة لانتهاء الصلاحية (status = disposed و return_reason = انتهاء الصلاحية) من الرصيد المتاح غير المُصرف (بدون issued_at) حسب تاريخ الوارد (received_at) داخل النطاق',
  disp_exp_plasma: '— معرّف في التعريفات؛ المحرك الحالي يجمع إعدام انتهاء الصلاحية في العمود disp_exp_blood فقط (يظهر هذا العمود 0)',
  disp_exp_sdp: '— معرّف في التعريفات؛ المحرك الحالي يجمع إعدام انتهاء الصلاحية في العمود disp_exp_blood فقط (يظهر هذا العمود 0)',
  disp_exp_rdp: '— معرّف في التعريفات؛ المحرك الحالي يجمع إعدام انتهاء الصلاحية في العمود disp_exp_blood فقط (يظهر هذا العمود 0)',
  disp_returned: 'أكياس مُرجعة (return_reason = مرتجع) — من المُصرف (حسب issued_at) أو من الرصيد غير المُصرف (حسب received_at)',
  disp_reaction: 'أكياس حدث بها تفاعل (status = reaction) — من المُصرف أو من الرصيد غير المُصرف',
  disp_open: 'أكياس مُعدَمة بنظام مفتوح (status = disposed و return_reason = نظام مفتوح) — من المُصرف أو من الرصيد غير المُصرف',
  disp_other: 'إعدامات «أخرى» بحسب bbIsDispOther (lipemic / hemolyzed / أسباب أخرى) — من المُصرف أو من الرصيد غير المُصرف',

  pct_exp: 'معادلة: نسبة إعدام انتهاء الصلاحية من الوارد — pct(disp_exp_blood, sum(inc_collected, inc_regional))',
  pct_returned: 'معادلة: نسبة المرتجع من منصرف الدم — pct(disp_returned, out_blood)',
  pct_reaction: 'معادلة: نسبة التفاعل من منصرف الدم — pct(disp_reaction, out_blood)',
  pct_open: 'معادلة: نسبة نظام المفتوح من منصرف الدم — pct(disp_open, out_blood)',
  pct_other: 'معادلة: نسبة إعدامات أخرى من منصرف الدم — pct(disp_other, out_blood)',

  child_inc_collected: 'وحدات فئة أطفال وارد من التجميعي حسب تاريخ الوارد (received_at) لدى المستشفى التخزيني',
  child_inc_regional: 'وحدات فئة أطفال وارد إقليمي حسب تاريخ الوارد (received_at) لدى المستشفى التخزيني',
  child_out_blood: 'إجمالي أكياس الدم فئة أطفال المُصرفة من المستشفى التخزيني حسب تاريخ الصرف (issued_at) داخل النطاق',
  child_blood_groups: '— معرّف في التعريفات؛ المحرك الحالي يحتسب فصائل دم الأطفال في التجميعي فقط (يظهر هذا العمود 0)',
  child_compatibility: 'حجوزات وحدات فئة أطفال (unit_category = أطفال) حسب تاريخ الحجز (reserved_at) لدى المستشفى التخزيني',
  child_ct: 'معادلة C/T للأطفال — round(div(child_compatibility, child_out_blood), 2)',
  child_disp_exp: 'وحدات أطفال مُعدَمة لانتهاء الصلاحية من الرصيد غير المُصرف (بدون issued_at) حسب تاريخ الوارد داخل النطاق',
  child_disp_returned: 'وحدات أطفال مُرجعة (return_reason = مرتجع) — من المُصرف أو من الرصيد غير المُصرف',
  child_disp_reaction: 'وحدات أطفال حدث بها تفاعل (status = reaction) — من المُصرف أو من الرصيد غير المُصرف',
  child_disp_open: 'وحدات أطفال مُعدَمة بنظام مفتوح (status = disposed و return_reason = نظام مفتوح) — من المُصرف أو من الرصيد غير المُصرف',
  child_disp_other: 'وحدات أطفال مُعدَمة بأسباب أخرى (bbIsDispOther) — من المُصرف أو من الرصيد غير المُصرف',

  child_pct_exp: 'معادلة: نسبة إعدام انتهاء الصلاحية للأطفال من منصرف الدم — pct(child_disp_exp, child_out_blood)',
  child_pct_returned: 'معادلة: نسبة المرتجع للأطفال — pct(child_disp_returned, child_out_blood)',
  child_pct_reaction: 'معادلة: نسبة التفاعل للأطفال — pct(child_disp_reaction, child_out_blood)',
  child_pct_open: 'معادلة: نسبة نظام المفتوح للأطفال — pct(child_disp_open, child_out_blood)',
  child_pct_other: 'معادلة: نسبة إعدامات أخرى للأطفال — pct(child_disp_other, child_out_blood)'
};

const _XBN = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

function titleRow(ws, row, title, sub, mc) {
  ws.mergeCells(row, 1, row, mc);
  const c = ws.getRow(row).getCell(1);
  c.value = title;
  c.font = { bold: true, size: 14, color: { argb: 'FF2C3E50' } };
  c.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(row).height = 28;
  if (sub) {
    ws.mergeCells(row + 1, 1, row + 1, mc);
    const c2 = ws.getRow(row + 1).getCell(1);
    c2.value = sub;
    c2.font = { size: 10, color: { argb: 'FF7F8C8D' } };
    c2.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(row + 1).height = 18;
    return row + 2;
  }
  return row + 1;
}

function footer(ws, row, mc) {
  ws.mergeCells(row, 1, row, mc);
  const c = ws.getRow(row).getCell(1);
  c.value = 'إعداد و برمجة محمد ندا 01068880999';
  c.font = { size: 9, color: { argb: 'FF95A5A6' }, italic: true };
  c.alignment = { horizontal: 'center', vertical: 'middle' };
}

function fillSheet(ws, headers, rows, title) {
  const mc = headers.length;
  const sr = titleRow(ws, 1, title, 'مصادر أعمدة مؤشرات الأداء — تلقائي حسب indicator-defs.js و bbComputeRange', mc);
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
      c.value = (v === null || v === undefined) ? '' : String(v);
      c.alignment = { horizontal: j === 0 ? 'center' : 'right', vertical: 'middle', wrapText: true };
      c.border = _XBN;
      c.font = { size: 9 };
      if (i % 2) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4ECF7' } };
    });
    row.height = 30;
  });
  headers.forEach((h, i) => {
    const maxLen = Math.max(h.length, ...rows.map(r => String(r[i] || '').length));
    ws.getColumn(i + 1).width = Math.min(70, Math.max(12, maxLen * 1.1 + 4));
  });
  footer(ws, sr + 1 + rows.length, mc);
}

const BIG_HEADERS = ['المفتاح', 'التسمية', 'المجموعة', 'المجموعة الفرعية', 'مجموعة فرعية 2', 'النوع', 'معادلة الحساب', 'الهدف', 'الوحدة', 'مصدر القيمة'];
const SMALL_HEADERS = BIG_HEADERS;

function defRow(d, srcMap) {
  return [
    d.key,
    d.label || '',
    d.group || '',
    d.sg || '',
    d.ssg || '',
    d.static ? 'ثابت' : (d.formula ? 'معادلة' : 'قيمة'),
    d.formula_expr || '',
    d.target || '',
    d.unit || '',
    srcMap[d.key] || '—'
  ];
}

const CONS_ROWS = BTYPES.map(t => [
  t,
  'يُزاد لكل كيس دم مُصرف داخل النطاق (issued_at في الفترة) لدى هذا المستشفى بفصيلة ' + t + ' — cons[hospital_id]["' + t + '"]++ (الأكياس ذات الفصيلة المسجلة فقط)'
]);

const RULES = [
  ['pct(a, b)', 'نسبة مئوية: a ÷ b × 100 — تُرجع 0 عند غياب b أو صفره'],
  ['sum(...)', 'الجمع الحسابي لقائمة القيم'],
  ['div(a, b)', 'القسمة: a ÷ b — تُرجع 0 عند غياب b أو صفره'],
  ['round(x, n)', 'تقريب القيمة x إلى n منازل عشرية'],
  ['التجميع (collect_total)', 'يُحسب مرة واحدة لكل تبرع دم (المنتج = دم فقط) حسب تاريخ التجميع collection_date لدى المستشفى التجميعي المصدر source_hospital_id — لا يتكرر مع المكونات المنفصلة'],
  ['الإعدامات والمرتجعات والتفاعل', 'تُحسب لكل وحدة فعلية (المكونات المنفصلة تُحسب كل منها)'],
  ['إعدام انتهاء الصلاحية (disp_exp_*)', 'status = disposed و return_reason = «انتهاء الصلاحية» — يُحتسب تلقائياً مع الإعدام المستقل عن التجميع/الصرف'],
  ['إعدامات أخرى (disp_other) — الدالة bbIsDispOther', 'الحالة lipemic أو hemolyzed (إعدام تجميع) أو status = disposed بسبب (أخرى / شرخ أو كسر / تم الفك و تصرف / Lipemic / Hemolyzed) — «انتهاء الصلاحية» ليست منها'],
  ['مرتجع / تفاعل / نظام مفتوح', 'return_reason = مرتجع | status = reaction | status = disposed و return_reason = نظام مفتوح'],
  ['الحجوزات (compatibility / child_compatibility)', 'تُحسب حسب تاريخ الحجز reserved_at داخل النطاق; فئة الأطفال = unit_category = «أطفال»'],
  ['منصرف فصائل الدم (cons)', 'تُحسب حسب تاريخ الصرف issued_at داخل النطاق لكل فصيلة من فصائل الدم الثماني'],
  ['نوع المستشفى', 'مؤشرات تجميعيه (big) = بنوك الدم التجميعي — مؤشرات تخزينيه (small) = بنوك الدم التخزيني'],
  ['الفئة أطفال', 'isChild = (unit_category || «كبار») === «أطفال» — تُزاد مفاتيح child_* فقط لهذه الوحدات']
];

(async () => {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'نظام بنك الدم';
  wb.created = new Date();

  const wsBig = wb.addWorksheet('مؤشرات تجميعيه');
  fillSheet(wsBig, BIG_HEADERS, BIG.filter(d => !d.static).map(d => defRow(d, BIG_SRC)).concat(
    BIG.filter(d => d.static).map(d => defRow(d, BIG_SRC))
  ), 'مصادر أعمدة مؤشرات الأداء — مؤشرات تجميعيه (تجميعي)');

  const wsSmall = wb.addWorksheet('مؤشرات تخزينيه');
  fillSheet(wsSmall, SMALL_HEADERS, SMALL.filter(d => !d.static).map(d => defRow(d, SMALL_SRC)).concat(
    SMALL.filter(d => d.static).map(d => defRow(d, SMALL_SRC))
  ), 'مصادر أعمدة مؤشرات الأداء — مؤشرات تخزينيه (تخزيني)');

  const wsCons = wb.addWorksheet('منصرف فصائل الدم');
  fillSheet(wsCons, ['فصيلة الدم', 'مصدر القيمة'], CONS_ROWS, 'مصادر أعمدة مؤشرات الأداء — منصرف فصائل الدم');

  const wsRules = wb.addWorksheet('دوال الحساب والمعايير');
  fillSheet(wsRules, ['القاعدة / الدالة', 'الوصف'], RULES, 'دوال الحساب وقواعد مصادر مؤشرات الأداء');

  const out = path.join(__dirname, 'مصادر_اعمدة_مؤشرات_الاداء.xlsx');
  await wb.xlsx.writeFile(out);
  console.log('OK: ' + out);
  console.log('big defs: ' + BIG.length + ' (static ' + BIG.filter(d => d.static).length + ', raw ' + BIG.filter(d => !d.static && !d.formula).length + ', formula ' + BIG.filter(d => d.formula).length + ')');
  console.log('small defs: ' + SMALL.length + ' (static ' + SMALL.filter(d => d.static).length + ', raw ' + SMALL.filter(d => !d.static && !d.formula).length + ', formula ' + SMALL.filter(d => d.formula).length + ')');
  console.log('cons rows: ' + CONS_ROWS.length + ', rules rows: ' + RULES.length);
})().catch(e => { console.error('ERR:', e.message); process.exit(1); });
