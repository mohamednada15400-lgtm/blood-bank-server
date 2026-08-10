(function(root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.IndicatorDefs = factory();
})(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  function def(extra) { return Object.assign({ enabled: 1, static: 0 }, extra); }

  var DEFAULT_BIG_DEFS = [
    // ===== الثابتات =====
    def({ static: 1, key: 'governorate', label: 'الفرع', cls: 'gov-col', group: '' }),
    def({ static: 1, key: 'hospital_name', label: 'بنك الدم', cls: 'hosp-col', group: '' }),

    // ===== التجميع =====
    def({ key: 'collect_total', label: 'التجميع', group: 'التجميع' }),

    // ===== إجمالي الوارد =====
    def({ key: 'inc_blood', label: 'دم', group: 'إجمالي الوارد', sg: 'دم' }),
    def({ key: 'inc_plasma', label: 'بلازما', group: 'إجمالي الوارد', sg: 'بلازما' }),
    def({ key: 'inc_sdp', label: 'SDP', group: 'إجمالي الوارد', sg: 'صفائح' }),
    def({ key: 'inc_rdp', label: 'RDP', group: 'إجمالي الوارد', sg: 'صفائح' }),

    // ===== إجمالي المنصرف =====
    def({ key: 'out_blood_int', label: 'داخلي', group: 'إجمالي المنصرف', sg: 'دم' }),
    def({ key: 'out_blood_branch', label: 'فرع', group: 'إجمالي المنصرف', sg: 'دم' }),
    def({ key: 'out_blood_auth', label: 'هيئة', group: 'إجمالي المنصرف', sg: 'دم' }),
    def({ key: 'out_blood_ext', label: 'خارجي', group: 'إجمالي المنصرف', sg: 'دم' }),
    def({ key: 'out_plasma_int', label: 'داخلي', group: 'إجمالي المنصرف', sg: 'بلازما' }),
    def({ key: 'out_plasma_ext', label: 'خارجي', group: 'إجمالي المنصرف', sg: 'بلازما' }),
    def({ key: 'out_sdp', label: 'SDP', group: 'إجمالي المنصرف', sg: 'صفائح' }),
    def({ key: 'out_rdp', label: 'RDP', group: 'إجمالي المنصرف', sg: 'صفائح' }),

    // ===== الفصائل، التوافق، C/T =====
    def({ key: 'blood_groups', label: 'الفصائل', group: 'الفصائل والتوافق' }),
    def({ key: 'compatibility', label: 'التوافق', group: 'الفصائل والتوافق' }),
    def({ key: 'ct', label: 'C/T', formula: true, formula_expr: 'round(div(compatibility, sum(out_blood_int, out_blood_branch, out_blood_auth, out_blood_ext)), 2)', group: 'الفصائل والتوافق', target: '<2' }),

    // ===== عينات غير مفحوصة =====
    def({ key: 'donation_therapeutic', label: 'تبرع علاجي', group: 'عينات غير مفحوصة' }),
    def({ key: 'uncompleted', label: 'لم يكتمل', group: 'عينات غير مفحوصة' }),
    def({ key: 'refused_fatty', label: 'دهون', group: 'عينات غير مفحوصة', sg: 'عينات مرفوضة' }),
    def({ key: 'refused_icteric', label: 'Icteric', group: 'عينات غير مفحوصة', sg: 'عينات مرفوضة' }),

    // ===== الإعدامات =====
    def({ key: 'disp_exp_blood', label: 'دم', group: 'الإعدامات', sg: 'انتهاء الصلاحيه' }),
    def({ key: 'disp_exp_plasma', label: 'بلازما', group: 'الإعدامات', sg: 'انتهاء الصلاحيه' }),
    def({ key: 'disp_exp_sdp', label: 'SDP', group: 'الإعدامات', sg: 'انتهاء الصلاحيه', ssg: 'صفائح' }),
    def({ key: 'disp_exp_rdp', label: 'RDP', group: 'الإعدامات', sg: 'انتهاء الصلاحيه', ssg: 'صفائح' }),
    def({ key: 'disp_returned', label: 'مرتجع', group: 'الإعدامات' }),
    def({ key: 'disp_reaction', label: 'تفاعل', group: 'الإعدامات' }),
    def({ key: 'disp_open', label: 'نظام مفتوح', group: 'الإعدامات' }),
    def({ key: 'disp_other', label: 'أخرى', group: 'الإعدامات' }),
    def({ key: 'virology_c', label: 'C', group: 'الإعدامات', sg: 'الفيروسات' }),
    def({ key: 'virology_b', label: 'B', group: 'الإعدامات', sg: 'الفيروسات' }),
    def({ key: 'virology_i', label: 'I', group: 'الإعدامات', sg: 'الفيروسات' }),
    def({ key: 'virology_dollar', label: '$', group: 'الإعدامات', sg: 'الفيروسات' }),
    def({ key: 'virology_total', label: 'إجمالي', group: 'الإعدامات', sg: 'الفيروسات', formula: true, formula_expr: 'sum(virology_c, virology_b, virology_i, virology_dollar)' }),

    // ===== تحليل نسب المؤشرات / الإعدام =====
    def({ key: 'tested', label: 'المفحوص', formula: true, formula_expr: 'collect_total - refused_icteric - refused_fatty - uncompleted - donation_therapeutic', cls: 'formula-cell', group: 'تحليل نسب المؤشرات', target: '> last' }),
    def({ key: 'ratio_uncompleted', label: 'لم يكتمل', formula: true, formula_expr: 'pct(uncompleted, collect_total)', unit: '%', cls: 'formula-cell', group: 'تحليل نسب المؤشرات', target: '<2%' }),
    def({ key: 'ratio_refused', label: 'مرفوضه', formula: true, formula_expr: 'pct(sum(refused_fatty, refused_icteric), collect_total)', unit: '%', cls: 'formula-cell', group: 'تحليل نسب المؤشرات', target: '<1%' }),
    def({ key: 'ratio_c', label: 'C', formula: true, formula_expr: 'pct(virology_c, collect_total)', unit: '%', cls: 'formula-cell', group: 'تحليل نسب المؤشرات', sg: 'الفيروسات', target: '<3%' }),
    def({ key: 'ratio_b', label: 'B', formula: true, formula_expr: 'pct(virology_b, collect_total)', unit: '%', cls: 'formula-cell', group: 'تحليل نسب المؤشرات', sg: 'الفيروسات', target: '<1%' }),
    def({ key: 'ratio_i', label: 'I', formula: true, formula_expr: 'pct(virology_i, collect_total)', unit: '%', cls: 'formula-cell', group: 'تحليل نسب المؤشرات', sg: 'الفيروسات', target: '<0.5%' }),
    def({ key: 'ratio_dollar', label: '$', formula: true, formula_expr: 'pct(virology_dollar, collect_total)', unit: '%', cls: 'formula-cell', group: 'تحليل نسب المؤشرات', sg: 'الفيروسات', target: '<0.5%' }),
    def({ key: 'ratio_exp', label: 'Exp', formula: true, formula_expr: 'pct(sum(disp_exp_blood, disp_exp_plasma, disp_exp_sdp, disp_exp_rdp), collect_total)', unit: '%', cls: 'formula-cell', group: 'تحليل نسب المؤشرات', target: '0' }),
    def({ key: 'ratio_returned', label: 'مرتجع', formula: true, formula_expr: 'pct(disp_returned, collect_total)', unit: '%', cls: 'formula-cell', group: 'تحليل نسب المؤشرات', target: '<1%' }),
    def({ key: 'ratio_reaction', label: 'تفاعل', formula: true, formula_expr: 'pct(disp_reaction, collect_total)', unit: '%', cls: 'formula-cell', group: 'تحليل نسب المؤشرات', target: '<2%' }),
    def({ key: 'ratio_open', label: 'مفتوح', formula: true, formula_expr: 'pct(disp_open, collect_total)', unit: '%', cls: 'formula-cell', group: 'تحليل نسب المؤشرات', target: '<1%' }),
    def({ key: 'ratio_other', label: 'أخرى', formula: true, formula_expr: 'pct(disp_other, collect_total)', unit: '%', cls: 'formula-cell', group: 'تحليل نسب المؤشرات', target: '<1%' }),

    // ===== مؤشرات وحدات دم الأطفال =====
    def({ key: 'child_inc_collected', label: 'تجميعي', group: 'مؤشرات وحدات دم الأطفال', sg: 'وارد الدم' }),
    def({ key: 'child_inc_regional', label: 'إقليمي', group: 'مؤشرات وحدات دم الأطفال', sg: 'وارد الدم' }),
    def({ key: 'child_out_blood', label: 'منصرف الدم', group: 'مؤشرات وحدات دم الأطفال' }),
    def({ key: 'child_blood_groups', label: 'الفصائل', group: 'مؤشرات وحدات دم الأطفال' }),
    def({ key: 'child_compatibility', label: 'التوافق', group: 'مؤشرات وحدات دم الأطفال' }),
    def({ key: 'child_ct', label: 'C/T', group: 'مؤشرات وحدات دم الأطفال', formula: true, formula_expr: 'round(div(child_compatibility, child_out_blood), 2)', target: '<2' }),
    def({ key: 'child_disp_exp', label: 'EXP', group: 'مؤشرات وحدات دم الأطفال', sg: 'اعدامات الدم' }),
    def({ key: 'child_disp_returned', label: 'مرتجع', group: 'مؤشرات وحدات دم الأطفال', sg: 'اعدامات الدم' }),
    def({ key: 'child_disp_reaction', label: 'تفاعل', group: 'مؤشرات وحدات دم الأطفال', sg: 'اعدامات الدم' }),
    def({ key: 'child_disp_open', label: 'نظام مفتوح', group: 'مؤشرات وحدات دم الأطفال', sg: 'اعدامات الدم' }),
    def({ key: 'child_disp_other', label: 'أخرى', group: 'مؤشرات وحدات دم الأطفال', sg: 'اعدامات الدم' }),

    // ===== النسب المئوية للاعدام - أطفال =====
    def({ key: 'child_pct_exp', label: 'Exp الدم', formula: true, formula_expr: 'pct(child_disp_exp, child_out_blood)', unit: '%', cls: 'formula-cell', group: 'النسب المئوية للاعدام - أطفال', target: '0%' }),
    def({ key: 'child_pct_returned', label: 'مرتجع', formula: true, formula_expr: 'pct(child_disp_returned, child_out_blood)', unit: '%', cls: 'formula-cell', group: 'النسب المئوية للاعدام - أطفال', target: '<2%' }),
    def({ key: 'child_pct_reaction', label: 'تفاعل', formula: true, formula_expr: 'pct(child_disp_reaction, child_out_blood)', unit: '%', cls: 'formula-cell', group: 'النسب المئوية للاعدام - أطفال', target: '<1%' }),
    def({ key: 'child_pct_open', label: 'نظام مفتوح', formula: true, formula_expr: 'pct(child_disp_open, child_out_blood)', unit: '%', cls: 'formula-cell', group: 'النسب المئوية للاعدام - أطفال', target: '<1%' }),
    def({ key: 'child_pct_other', label: 'أخرى', formula: true, formula_expr: 'pct(child_disp_other, child_out_blood)', unit: '%', cls: 'formula-cell', group: 'النسب المئوية للاعدام - أطفال', target: '<1%' })
  ];

  var DEFAULT_SMALL_DEFS = [
    // ===== الثابتات =====
    def({ static: 1, key: 'governorate', label: 'الفرع', cls: 'gov-col', group: '' }),
    def({ static: 1, key: 'hospital_name', label: 'بنك الدم', cls: 'hosp-col', group: '' }),

    // ===== إجمالي الوارد =====
    def({ key: 'inc_collected', label: 'تجميعي', group: 'إجمالي الوارد', sg: 'دم' }),
    def({ key: 'inc_regional', label: 'إقليمي', group: 'إجمالي الوارد', sg: 'دم' }),
    def({ key: 'inc_plasma', label: 'بلازما', group: 'إجمالي الوارد', sg: 'بلازما' }),
    def({ key: 'inc_sdp', label: 'SDP', group: 'إجمالي الوارد', sg: 'صفائح' }),
    def({ key: 'inc_rdp', label: 'RDP', group: 'إجمالي الوارد', sg: 'صفائح' }),

    // ===== إجمالي المنصرف =====
    def({ key: 'out_blood', label: 'دم', group: 'إجمالي المنصرف', sg: 'دم' }),
    def({ key: 'out_plasma', label: 'بلازما', group: 'إجمالي المنصرف', sg: 'بلازما' }),
    def({ key: 'out_sdp', label: 'SDP', group: 'إجمالي المنصرف', sg: 'صفائح' }),
    def({ key: 'out_rdp', label: 'RDP', group: 'إجمالي المنصرف', sg: 'صفائح' }),

    // ===== الفصائل، التوافق، C/T =====
    def({ key: 'blood_groups', label: 'الفصائل', group: 'الفصائل والتوافق' }),
    def({ key: 'compatibility', label: 'التوافق', group: 'الفصائل والتوافق' }),
    def({ key: 'ct', label: 'C/T', formula: true, formula_expr: 'round(div(compatibility, out_blood), 2)', group: 'الفصائل والتوافق', target: '<2' }),

    // ===== الإعدامات =====
    def({ key: 'disp_exp_blood', label: 'دم', group: 'الإعدامات', sg: 'انتهاء الصلاحيه' }),
    def({ key: 'disp_exp_plasma', label: 'بلازما', group: 'الإعدامات', sg: 'انتهاء الصلاحيه' }),
    def({ key: 'disp_exp_sdp', label: 'SDP', group: 'الإعدامات', sg: 'انتهاء الصلاحيه', ssg: 'صفائح' }),
    def({ key: 'disp_exp_rdp', label: 'RDP', group: 'الإعدامات', sg: 'انتهاء الصلاحيه', ssg: 'صفائح' }),
    def({ key: 'disp_returned', label: 'مرتجع', group: 'الإعدامات' }),
    def({ key: 'disp_reaction', label: 'تفاعل', group: 'الإعدامات' }),
    def({ key: 'disp_open', label: 'نظام مفتوح', group: 'الإعدامات' }),
    def({ key: 'disp_other', label: 'أخرى', group: 'الإعدامات' }),

    // ===== النسب المئوية للاعدام =====
    def({ key: 'pct_exp', label: 'Exp الدم', formula: true, formula_expr: 'pct(disp_exp_blood, sum(inc_collected, inc_regional))', unit: '%', cls: 'formula-cell', group: 'النسب المئوية للاعدام', target: '0%' }),
    def({ key: 'pct_returned', label: 'مرتجع', formula: true, formula_expr: 'pct(disp_returned, out_blood)', unit: '%', cls: 'formula-cell', group: 'النسب المئوية للاعدام', target: '<2%' }),
    def({ key: 'pct_reaction', label: 'تفاعل', formula: true, formula_expr: 'pct(disp_reaction, out_blood)', unit: '%', cls: 'formula-cell', group: 'النسب المئوية للاعدام', target: '<1%' }),
    def({ key: 'pct_open', label: 'نظام مفتوح', formula: true, formula_expr: 'pct(disp_open, out_blood)', unit: '%', cls: 'formula-cell', group: 'النسب المئوية للاعدام', target: '<1%' }),
    def({ key: 'pct_other', label: 'أخرى', formula: true, formula_expr: 'pct(disp_other, out_blood)', unit: '%', cls: 'formula-cell', group: 'النسب المئوية للاعدام', target: '<1%' }),

    // ===== مؤشرات وحدات دم الأطفال =====
    def({ key: 'child_inc_collected', label: 'تجميعي', group: 'مؤشرات وحدات دم الأطفال', sg: 'وارد الدم' }),
    def({ key: 'child_inc_regional', label: 'إقليمي', group: 'مؤشرات وحدات دم الأطفال', sg: 'وارد الدم' }),
    def({ key: 'child_out_blood', label: 'منصرف الدم', group: 'مؤشرات وحدات دم الأطفال' }),
    def({ key: 'child_blood_groups', label: 'الفصائل', group: 'مؤشرات وحدات دم الأطفال' }),
    def({ key: 'child_compatibility', label: 'التوافق', group: 'مؤشرات وحدات دم الأطفال' }),
    def({ key: 'child_ct', label: 'C/T', group: 'مؤشرات وحدات دم الأطفال', formula: true, formula_expr: 'round(div(child_compatibility, child_out_blood), 2)', target: '<2' }),
    def({ key: 'child_disp_exp', label: 'EXP', group: 'مؤشرات وحدات دم الأطفال', sg: 'اعدامات الدم' }),
    def({ key: 'child_disp_returned', label: 'مرتجع', group: 'مؤشرات وحدات دم الأطفال', sg: 'اعدامات الدم' }),
    def({ key: 'child_disp_reaction', label: 'تفاعل', group: 'مؤشرات وحدات دم الأطفال', sg: 'اعدامات الدم' }),
    def({ key: 'child_disp_open', label: 'نظام مفتوح', group: 'مؤشرات وحدات دم الأطفال', sg: 'اعدامات الدم' }),
    def({ key: 'child_disp_other', label: 'أخرى', group: 'مؤشرات وحدات دم الأطفال', sg: 'اعدامات الدم' }),

    // ===== النسب المئوية للاعدام (أطفال) =====
    def({ key: 'child_pct_exp', label: 'Exp الدم', formula: true, formula_expr: 'pct(child_disp_exp, child_out_blood)', unit: '%', cls: 'formula-cell', group: 'النسب المئوية للاعدام - أطفال', target: '0%' }),
    def({ key: 'child_pct_returned', label: 'مرتجع', formula: true, formula_expr: 'pct(child_disp_returned, child_out_blood)', unit: '%', cls: 'formula-cell', group: 'النسب المئوية للاعدام - أطفال', target: '<2%' }),
    def({ key: 'child_pct_reaction', label: 'تفاعل', formula: true, formula_expr: 'pct(child_disp_reaction, child_out_blood)', unit: '%', cls: 'formula-cell', group: 'النسب المئوية للاعدام - أطفال', target: '<1%' }),
    def({ key: 'child_pct_open', label: 'نظام مفتوح', formula: true, formula_expr: 'pct(child_disp_open, child_out_blood)', unit: '%', cls: 'formula-cell', group: 'النسب المئوية للاعدام - أطفال', target: '<1%' }),
    def({ key: 'child_pct_other', label: 'أخرى', formula: true, formula_expr: 'pct(child_disp_other, child_out_blood)', unit: '%', cls: 'formula-cell', group: 'النسب المئوية للاعدام - أطفال', target: '<1%' })
  ];

  function makePerm(v, a, e, d, x) { return { v: v, a: a, e: e, d: d, x: x }; }

  var INDICATOR_COLUMN_PERMS = {
    admin: makePerm(1, 1, 1, 1, 1),
    org_supervisor: makePerm(0, 0, 0, 0, 0),
    branch_supervisor: makePerm(0, 0, 0, 0, 0),
    hospital: makePerm(0, 0, 0, 0, 0),
    hospital_manager: makePerm(0, 0, 0, 0, 0),
    visitor: makePerm(0, 0, 0, 0, 0)
  };

  var INDICATOR_DEFAULT_ROLE_PERMS = {};
  Object.keys(INDICATOR_COLUMN_PERMS).forEach(function(r) {
    INDICATOR_DEFAULT_ROLE_PERMS[r] = {
      indicator_columns: INDICATOR_COLUMN_PERMS[r]
    };
  });

  var INDICATOR_DEFAULT_ROLE_LABELS = {
    admin: 'مدير عام',
    org_supervisor: 'مشرف هيئة',
    branch_supervisor: 'مشرف فرع',
    hospital: 'مستخدم مستشفي',
    hospital_manager: 'مدير بنك دم',
    visitor: 'زائر'
  };

  var INDICATOR_DEFAULT_ROLE_COLORS = {
    admin: '#dc3545',
    org_supervisor: '#1976d2',
    branch_supervisor: '#7b1fa2',
    hospital: '#27ae60',
    hospital_manager: '#e67e22',
    visitor: '#95a5a6'
  };

  var INDICATOR_DEFAULT_ROLE_CATS = {
    admin: '1',
    org_supervisor: '2',
    branch_supervisor: '3',
    hospital: '4',
    hospital_manager: '5',
    visitor: '6'
  };

  return {
    DEFAULT_BIG_DEFS: DEFAULT_BIG_DEFS,
    DEFAULT_SMALL_DEFS: DEFAULT_SMALL_DEFS,
    INDICATOR_COLUMN_PERMS: INDICATOR_COLUMN_PERMS,
    INDICATOR_DEFAULT_ROLE_PERMS: INDICATOR_DEFAULT_ROLE_PERMS,
    INDICATOR_DEFAULT_ROLE_LABELS: INDICATOR_DEFAULT_ROLE_LABELS,
    INDICATOR_DEFAULT_ROLE_COLORS: INDICATOR_DEFAULT_ROLE_COLORS,
    INDICATOR_DEFAULT_ROLE_CATS: INDICATOR_DEFAULT_ROLE_CATS
  };
});
