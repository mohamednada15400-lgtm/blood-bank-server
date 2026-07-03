const fs = require('fs');
const path = require('path');

const ALL_PAGES = ['daily_stock','daily_total','daily_statement','daily_branch','monthly_storage','monthly_aggregate','monthly_indicators','monthly_consumption','monthly_big','monthly_small','employees','archive','strategic_stock','users','hospitals','governorates','inventory','role_perms','readiness'];

function makePerm(v,a,e,d,x) { return {v,a,e,d,x}; }

function pagePerms(v,a,e,d,x) {
  const p = {};
  ALL_PAGES.forEach(k => { p[k] = makePerm(v,a,e,d,x); });
  return p;
}

const DEF_PERMS = {
  admin: pagePerms(1,1,1,1,1),
  org_supervisor: Object.assign(pagePerms(1,1,1,1,1), { users:makePerm(0,0,0,0,0), hospitals:makePerm(1,0,0,0,1), governorates:makePerm(1,0,0,0,1) }),
  branch_supervisor: Object.assign(pagePerms(1,1,1,1,1), { archive:makePerm(0,0,0,0,0), users:makePerm(0,0,0,0,0), hospitals:makePerm(1,0,0,0,1), governorates:makePerm(1,0,0,0,1), inventory:makePerm(1,0,0,0,1), daily_branch:makePerm(1,0,0,0,0) }),
  hospital: Object.assign(pagePerms(1,1,1,1,1), { daily_total:makePerm(0,0,0,0,0), archive:makePerm(0,0,0,0,0), users:makePerm(0,0,0,0,0), hospitals:makePerm(0,0,0,0,0), governorates:makePerm(0,0,0,0,0), inventory:makePerm(1,0,0,0,0), daily_branch:makePerm(0,0,0,0,0) }),
  hospital_manager: Object.assign(pagePerms(1,0,0,0,1), { archive:makePerm(0,0,0,0,0), users:makePerm(0,0,0,0,0), hospitals:makePerm(0,0,0,0,0), governorates:makePerm(0,0,0,0,0), daily_branch:makePerm(0,0,0,0,0) }),
  visitor: Object.assign(pagePerms(1,0,0,0,0), { archive:makePerm(0,0,0,0,0), users:makePerm(0,0,0,0,0), hospitals:makePerm(0,0,0,0,0), governorates:makePerm(0,0,0,0,0), daily_branch:makePerm(0,0,0,0,0) })
};

class JSONDB {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = null;
    this.idCounters = {};
  }

  init() {
    try {
      this.data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
    } catch {
      this.data = this._getDefaultData();
      this._save();
    }
    this._ensureTables();
  }

  _getDefaultData() {
    return {
      users: [], hospitals: [], governorates: [], hospital_types: [],
      inventory: [],       daily_stock: [], daily_statements: [], daily_reports: [],
      monthly_storage: [], monthly_aggregate: [], monthly_indicators: [], monthly_consumption: [], monthly_big_indicators: [], monthly_small_indicators: [], consumption: [],
      employee_statements: [],
      employee_monthly_updates: [],
      readiness_occasions: [],
      readiness_reports: [],
      readiness_notifications: [],
      archives: [],
      role_perms: Object.entries(DEF_PERMS).map(([role, perms]) => ({ role, permissions: JSON.parse(JSON.stringify(perms)) })),
_counters: { users: 1, hospitals: 1, governorates: 1, hospital_types: 1, daily_stock: 1, daily_statements: 1, daily_reports: 1, monthly_storage: 1, monthly_aggregate: 1, monthly_indicators: 1, monthly_consumption: 1, monthly_big_indicators: 1, monthly_small_indicators: 1, consumption: 1, archives: 1, strategic_reserves: 1, employee_statements: 1, employee_monthly_updates: 1, readiness_occasions: 1, readiness_reports: 1, readiness_notifications: 1 }
    };
  }

  _ensureTables() {
    if (!this.data.users || this.data.users.length === 0) {
      this.data.users = [
        { id: 1, username: 'admin', password: 'admin123', name: 'المدير العام', role: 'admin', hospital_id: null, governorate: null, view_permission: 'all' },
        { id: 2, username: 'por', password: '123456', name: 'مشرف بورسعيد', role: 'branch_supervisor', hospital_id: null, governorate: 'بورسعيد', view_permission: 'governorate', national_id: '', phone: '', email: '' },
        { id: 3, username: 'ism', password: '123456', name: 'مشرف الإسماعيلية', role: 'branch_supervisor', hospital_id: null, governorate: 'الإسماعيلية', view_permission: 'governorate', national_id: '', phone: '', email: '' },
        { id: 4, username: 'lux', password: '123456', name: 'مشرف الأقصر', role: 'branch_supervisor', hospital_id: null, governorate: 'الأقصر', view_permission: 'governorate', national_id: '', phone: '', email: '' },
        { id: 5, username: 'south', password: '123456', name: 'مشرف جنوب سيناء', role: 'branch_supervisor', hospital_id: null, governorate: 'جنوب سيناء', view_permission: 'governorate', national_id: '', phone: '', email: '' },
        { id: 6, username: 'asw', password: '123456', name: 'مشرف أسوان', role: 'branch_supervisor', hospital_id: null, governorate: 'أسوان', view_permission: 'governorate', national_id: '', phone: '', email: '' },
        { id: 7, username: 'org', password: '123456', name: 'مشرف الهيئة', role: 'org_supervisor', hospital_id: null, governorate: null, view_permission: 'all' },
        { id: 8, username: 'visitor', password: '123456', name: 'زائر', role: 'visitor', hospital_id: null, governorate: null, view_permission: 'limited' }
      ];
      this.data.hospitals = [
        // بورسعيد
        { id: 1, name: 'التضامن (مجمع الشفاء)*', governorate: 'بورسعيد', type: 'تجميعي' },
        { id: 2, name: 'النصر *', governorate: 'بورسعيد', type: 'تجميعي' },
        { id: 3, name: 'الحياة بورفؤاد *', governorate: 'بورسعيد', type: 'تجميعي' },
        { id: 4, name: 'الزهور', governorate: 'بورسعيد', type: 'تخزيني' },
        { id: 5, name: '٣٠ يونيو', governorate: 'بورسعيد', type: 'تخزيني' },
        { id: 6, name: 'السلام', governorate: 'بورسعيد', type: 'تخزيني' },
        { id: 38, name: 'صحة المرأة', governorate: 'بورسعيد', type: 'تخزيني' },
        // الإسماعيلية
        { id: 7, name: 'المجمع الطبي *', governorate: 'الإسماعيلية', type: 'تجميعي' },
        { id: 8, name: 'طوارئ ابو خليفه', governorate: 'الإسماعيلية', type: 'تخزيني' },
        { id: 9, name: 'مركز 30 يونيو', governorate: 'الإسماعيلية', type: 'تخزيني' },
        { id: 10, name: 'فايد التخصصي', governorate: 'الإسماعيلية', type: 'تخزيني' },
        { id: 11, name: 'القصاصين التخصصي', governorate: 'الإسماعيلية', type: 'تخزيني' },
        { id: 12, name: 'القنطرة غرب التخصصي', governorate: 'الإسماعيلية', type: 'تخزيني' },
        { id: 13, name: 'القنطرة شرق التخصصي', governorate: 'الإسماعيلية', type: 'تخزيني' },
        { id: 14, name: 'التل الكبيرالتخصصي', governorate: 'الإسماعيلية', type: 'تخزيني' },
        // السويس
        { id: 15, name: 'مجمع السويس الطبي *', governorate: 'السويس', type: 'تجميعي' },
        { id: 16, name: 'المرأه والطفل ( حوض الدرس )', governorate: 'السويس', type: 'تخزيني' },
        { id: 17, name: 'المناظير و الجهاز الهضمي', governorate: 'السويس', type: 'تخزيني' },
        // الأقصر
        { id: 18, name: 'طيبة التخصصي *', governorate: 'الأقصر', type: 'تجميعي' },
        { id: 19, name: 'المجمع الطبي الاقصر', governorate: 'الأقصر', type: 'تخزيني' },
        { id: 20, name: 'ايزيس التخصصي', governorate: 'الأقصر', type: 'تخزيني' },
        { id: 21, name: 'الاطفال التخصصي', governorate: 'الأقصر', type: 'تخزيني' },
        { id: 22, name: 'الكرنك الدولي *', governorate: 'الأقصر', type: 'تجميعي' },
        { id: 23, name: 'حورس', governorate: 'الأقصر', type: 'تخزيني' },
        // جنوب سيناء
        { id: 24, name: 'راس سدر *', governorate: 'جنوب سيناء', type: 'تجميعي' },
        { id: 25, name: 'شرم الشيخ الدولي', governorate: 'جنوب سيناء', type: 'تخزيني' },
        { id: 26, name: 'طابا', governorate: 'جنوب سيناء', type: 'تخزيني' },
        { id: 27, name: 'سانت كاترين', governorate: 'جنوب سيناء', type: 'تخزيني' },
        { id: 28, name: 'مجمع الفيروز *', governorate: 'جنوب سيناء', type: 'تجميعي' },
        { id: 29, name: 'دهب', governorate: 'جنوب سيناء', type: 'تخزيني' },
        { id: 39, name: 'الطور', governorate: 'جنوب سيناء', type: 'تخزيني' },
        // أسوان
        { id: 30, name: 'النيل التخصصي*(حورس ادفو)', governorate: 'أسوان', type: 'تجميعي' },
        { id: 31, name: 'اسوان التخصصي (الصداقه)', governorate: 'أسوان', type: 'تخزيني' },
        { id: 32, name: 'كوم امبو *', governorate: 'أسوان', type: 'تجميعي' },
        { id: 33, name: 'دراو', governorate: 'أسوان', type: 'تخزيني' },
        { id: 34, name: 'معهد الاورام', governorate: 'أسوان', type: 'تخزيني' },
        { id: 35, name: 'ابوسمبل الدولي', governorate: 'أسوان', type: 'تخزيني' },
        { id: 36, name: 'المسلة التخصصي', governorate: 'أسوان', type: 'تخزيني' },
        { id: 37, name: 'السباعية التخصصي', governorate: 'أسوان', type: 'تخزيني' },
      ];
      this.data.governorates = [
        { id: 1, name: 'بورسعيد' }, { id: 2, name: 'الإسماعيلية' }, { id: 3, name: 'السويس' },
        { id: 4, name: 'الأقصر' }, { id: 5, name: 'جنوب سيناء' }, { id: 6, name: 'أسوان' }
      ];
      const types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      this.data.inventory = types.map((t, i) => ({ id: i + 1, blood_type: t, storage: 0, total_received: 0, total_consumed: 0 }));
      if (!this.data._counters.daily_reports) this.data._counters.daily_reports = this.data.daily_reports ? this.data.daily_reports.length + 1 : 1;
      this.data._counters = { users: 9, hospitals: 40, governorates: 7, inventory: 9, daily_stock: 1, daily_statements: 1, daily_reports: this.data._counters.daily_reports || 1, monthly_storage: 1, monthly_aggregate: 1, monthly_indicators: 1, monthly_consumption: 1, monthly_big_indicators: 1, monthly_small_indicators: 1, consumption: 1, archives: 1, employee_statements: 1, employee_monthly_updates: 1, readiness_occasions: 1, readiness_reports: 1 };
    }
    // Ensure tables exist even when loading existing db
    if (!this.data.daily_reports) this.data.daily_reports = [];
    if (!this.data._counters.daily_reports) this.data._counters.daily_reports = this.data.daily_reports.length + 1 || 1;
    // Migration: is_aggregation -> type
    if (this.data.hospitals && this.data.hospitals.length && this.data.hospitals[0].is_aggregation !== undefined) {
      this.data.hospitals.forEach(h => {
        h.type = h.is_aggregation ? 'تجميعي' : 'تخزيني';
        delete h.is_aggregation;
      });
    }
    if (!this.data.monthly_indicators) this.data.monthly_indicators = [];
    if (!this.data.monthly_consumption) this.data.monthly_consumption = [];
    if (!this.data.monthly_big_indicators) this.data.monthly_big_indicators = [];
    if (!this.data.monthly_small_indicators) this.data.monthly_small_indicators = [];
    if (!this.data.strategic_reserves) this.data.strategic_reserves = [];
    if (!this.data.strategic_settings) this.data.strategic_settings = null;
    if (!this.data.employee_statements) this.data.employee_statements = [];
    if (!this.data._counters.employee_statements) this.data._counters.employee_statements = this.data.employee_statements.length + 1 || 1;
    if (!this.data.employee_monthly_updates) this.data.employee_monthly_updates = [];
    if (!this.data._counters.employee_monthly_updates) this.data._counters.employee_monthly_updates = 1;
    if (!this.data.readiness_occasions) this.data.readiness_occasions = [];
    if (!this.data._counters.readiness_occasions) this.data._counters.readiness_occasions = 1;
    if (!this.data.readiness_reports) this.data.readiness_reports = [];
    if (!this.data._counters.readiness_reports) this.data._counters.readiness_reports = 1;
    if (!this.data.readiness_notifications) this.data.readiness_notifications = [];
    if (!this.data._counters.readiness_notifications) this.data._counters.readiness_notifications = 1;
    if (!this.data.hospital_types || !this.data.hospital_types.length) this.data.hospital_types = [{ id: 1, name: 'تجميعي' }, { id: 2, name: 'تخزيني' }];
    if (!this.data._counters.hospital_types) this.data._counters.hospital_types = this.data.hospital_types.length + 1;
    if (!this.data.role_perms || !Array.isArray(this.data.role_perms)) {
      this.data.role_perms = Object.entries(DEF_PERMS).map(([role, perms]) => ({ role, permissions: JSON.parse(JSON.stringify(perms)) }));
    } else {
      // Add missing pages to existing role_perms
      this.data.role_perms.forEach(rp => {
        const defPerms = DEF_PERMS[rp.role];
        if (defPerms) {
          ALL_PAGES.forEach(k => {
            if (rp.permissions[k] === undefined) {
              rp.permissions[k] = JSON.parse(JSON.stringify(defPerms[k] || { v: 0, a: 0, e: 0, d: 0, x: 0 }));
            }
          });
        }
      });
      // Migration: consumption -> employees in role_perms
      this.data.role_perms.forEach(rp => {
        if (rp.permissions.consumption !== undefined && rp.permissions.employees === undefined) {
          rp.permissions.employees = rp.permissions.consumption;
        }
        delete rp.permissions.consumption;
      });
    }
    this._save();
  }

  _save() {
    this._write();
  }

  _write() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
  }

  _nextId(table) {
    if (!this.data._counters) this.data._counters = {};
    if (!this.data._counters[table]) this.data._counters[table] = 1;
    return this.data._counters[table]++;
  }

  _getTable(sql) {
    let m = sql.match(/FROM\s+(\w+)/i);
    if (m) return m[1];
    m = sql.match(/INTO\s+(\w+)/i);
    if (m) return m[1];
    m = sql.match(/UPDATE\s+(\w+)/i);
    if (m) return m[1];
    return null;
  }

  _getCols(row, prefix = '') {
    const result = {};
    for (const [k, v] of Object.entries(row)) {
      result[prefix + k] = v;
    }
    return result;
  }

  async query(text, params) {
    const sql = text.trim();
    const table = this._getTable(sql);

    if (!table || !this.data[table]) {
      return { rows: [] };
    }

    if (/^SELECT/i.test(sql)) {
      let rows = [...this.data[table]];
      const whereMatch = sql.match(/WHERE\s+(.+?)(?:ORDER BY|GROUP BY|LIMIT|$)/is);
      if (whereMatch) {
        const whereClause = whereMatch[1].trim();
        rows = rows.filter(row => this._evalWhere(row, whereClause, params));
      }

      if (/JOIN/i.test(sql)) {
        const joinMatch = sql.match(/JOIN\s+(\w+)\s+(\w+)\s+ON\s+(.+?)(?:WHERE|ORDER BY|GROUP BY|LIMIT|$)/is);
        if (joinMatch) {
          const joinTable = joinMatch[1];
          const joinAlias = joinMatch[2];
          const onClause = joinMatch[3];
          if (this.data[joinTable]) {
            rows = rows.map(row => {
              const joinRow = this.data[joinTable].find(jr => this._evalOn(row, jr, onClause, joinAlias));
              if (!joinRow) return null;
              const joined = { ...row };
              for (const [k, v] of Object.entries(joinRow)) {
                joined[`${joinAlias}_${k}`] = v;
              }
              return joined;
            }).filter(r => r !== null);
          }
        }
      }

      const groupMatch = sql.match(/GROUP\s+BY\s+(.+?)(?:ORDER BY|LIMIT|$)/is);
      if (groupMatch) {
        const groupCols = groupMatch[1].split(',').map(c => c.trim());
        const groups = {};
        const sumCols = {};
        const selectMatch = sql.match(/SELECT\s+(.+?)\s+FROM/i);
        if (selectMatch) {
          selectMatch[1].split(',').map(c => c.trim()).forEach(c => {
            const m = c.match(/(?:SUM|COUNT|AVG|MAX|MIN)\s*\((\w+)\)\s+as\s+(\w+)/i);
            if (m) sumCols[m[2]] = m[1];
          });
        }
        rows.forEach(row => {
          const key = groupCols.map(c => row[c]).join('|');
          if (!groups[key]) {
            const base = {};
            groupCols.forEach(c => base[c] = row[c]);
            groups[key] = base;
          }
          for (const [alias, col] of Object.entries(sumCols)) {
            groups[key][alias] = (groups[key][alias] || 0) + (row[col] || 0);
          }
        });
        rows = Object.values(groups);
      }

      const orderMatch = sql.match(/ORDER\s+BY\s+(.+?)(?:LIMIT|$)/is);
      if (orderMatch) {
        const orders = orderMatch[1].split(',').map(o => o.trim());
        orders.forEach(order => {
          const parts = order.split(/\s+/);
          const col = parts[0].replace(/^ds\.|^h\.|^c\.|^ms\.|^ma\.|^mi\.|^mc\./i, '');
          const dir = parts[1] && parts[1].toUpperCase() === 'DESC' ? -1 : 1;
          rows.sort((a, b) => {
            if ((a[col] || '') < (b[col] || '')) return -1 * dir;
            if ((a[col] || '') > (b[col] || '')) return 1 * dir;
            return 0;
          });
        });
      }

      const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
      if (limitMatch) {
        rows = rows.slice(0, parseInt(limitMatch[1]));
      }

      const aliasMap = {};
      const selectMatch = sql.match(/SELECT\s+(.+?)\s+FROM/i);
      if (selectMatch) {
        const cols = selectMatch[1].split(',').map(c => c.trim());
        cols.forEach(c => {
          let m2 = c.match(/(\w+)\.(\w+)\s+as\s+(\w+)/i);
          if (m2) {
            aliasMap[m2[3]] = { table: m2[1], col: m2[2] };
          } else {
            m2 = c.match(/(\w+)\.(\w+)/i);
            if (m2) aliasMap[m2[2]] = { table: m2[1], col: m2[2] };
          }
        });
      }
      if (Object.keys(aliasMap).length > 0) {
        rows = rows.map(row => {
          const newRow = { ...row };
          for (const [alias, info] of Object.entries(aliasMap)) {
            newRow[alias] = row[`${info.table}_${info.col}`] || row[info.col];
          }
          return newRow;
        });
      }

      return { rows };
    }

    if (/^INSERT/i.test(sql)) {
      const m = sql.match(/VALUES\s*\((.+)\)\s*(?:RETURNING|;|$)/i);
      if (m) {
        const id = this._nextId(table);
        const newRow = { id };
        const vals = m[1].split(',').map(v => v.trim());
        const colMatch = sql.match(/\((.*?)\)\s*VALUES/i);
        if (colMatch) {
          const cols = colMatch[1].split(',').map(c => c.trim().replace(/"/g, ''));
          cols.forEach((col, i) => {
            let val = vals[i];
            if (val.startsWith('$')) {
              const idx = parseInt(val.substring(1)) - 1;
              val = params[idx];
            } else if (val.startsWith("'") || val.includes("'")) {
              val = val.replace(/'/g, '').trim();
            } else if (val === 'NOW()') {
              val = new Date().toISOString();
            } else {
              try { val = JSON.parse(val); } catch { }
            }
            const colName = col.replace(/"/g, '');
            newRow[colName] = val;
          });
        }
        this.data[table].unshift(newRow);
        if (table === 'daily_stock') {
          const bt = newRow.blood_type;
          const invItem = this.data.inventory.find(i => i.blood_type === bt);
          if (invItem) {
            if (newRow.type === 'داخل') { invItem.storage += newRow.quantity; invItem.total_received += newRow.quantity; }
            else { invItem.storage = Math.max(0, invItem.storage - newRow.quantity); }
          }
        }
        if (table === 'consumption') {
          const invItem = this.data.inventory.find(i => i.blood_type === newRow.blood_type);
          if (invItem) invItem.total_consumed += newRow.quantity;
        }
        this._save();
        const result = await this.query(`SELECT * FROM ${table} WHERE id = ${id}`, []);
        return { rows: result.rows };
      }
    }

    if (/^UPDATE/i.test(sql)) {
      const setMatch = sql.match(/SET\s+(.+?)(?:WHERE|$)/is);
      const whereMatch = sql.match(/WHERE\s+(.+?)$/is);
      if (setMatch && whereMatch) {
        const sets = setMatch[1].split(',').map(s => s.trim());
        let updatedRows = [...this.data[table]];
        updatedRows = updatedRows.filter(row => this._evalWhere(row, whereMatch[1], params));
        updatedRows.forEach(row => {
          sets.forEach(s => {
            const parts = s.match(/(\w+)\s*=\s*(.+)/);
            if (parts) {
              let val = parts[2].trim();
              if (val.startsWith('$')) {
                const idx = parseInt(val.substring(1)) - 1;
                val = params[idx];
              } else if (val.startsWith("'")) {
                val = val.replace(/'/g, '');
              } else if (val.includes('GREATEST')) {
                const gm = val.match(/GREATEST\(0,\s*(.+?)\)/i);
                if (gm) {
                  let inner = gm[1].trim();
                  if (inner.startsWith('$')) inner = params[parseInt(inner.substring(1)) - 1];
                  else if (/^(\w+)\s*-\s*(.+)/.test(inner)) {
                    const mm = inner.match(/^(\w+)\s*-\s*(.+)/);
                    let sub = mm[2].trim();
                    if (sub.startsWith('$')) sub = params[parseInt(sub.substring(1)) - 1];
                    val = Math.max(0, (row[mm[1]] || 0) - parseInt(sub));
                  } else {
                    val = Math.max(0, parseInt(inner));
                  }
                }
              } else if (/\+/.test(val)) {
                const addMatch = val.match(/^(\w+)\s*\+\s*(.+)/);
                if (addMatch) {
                  const colName = addMatch[1];
                  let addVal = addMatch[2].trim();
                  if (addVal.startsWith('$')) addVal = params[parseInt(addVal.substring(1)) - 1];
                  val = (row[colName] || 0) + parseInt(addVal);
                }
              } else {
                val = parseInt(val);
              }
              row[parts[1]] = val;
            }
          });
        });
        this._save();
        return { rows: updatedRows };
      }
    }

    if (/^DELETE/i.test(sql)) {
      const whereMatch = sql.match(/WHERE\s+(.+?)$/is);
      if (whereMatch) {
        this.data[table] = this.data[table].filter(row => !this._evalWhere(row, whereMatch[1], params));
      } else {
        this.data[table] = [];
      }
      this._save();
      return { rows: [] };
    }

    return { rows: [] };
  }

  _evalWhere(row, clause, params) {
    const conditions = clause.split(/\s+AND\s+/i);
    return conditions.every(cond => this._evalCondition(row, cond, params));
  }

  _evalCondition(row, cond, params) {
    cond = cond.replace(/::date/g, '').trim();
    if (/^\d+=\d+$/.test(cond)) return true;
    if (/^\d+!=\d+$/.test(cond)) return false;
    const notMatch = cond.match(/NOT\s+(\w+\.\w+)/);
    if (notMatch) return false;
    const inMatch = cond.match(/(\w+)\s+IN\s+\((.+?)\)/i);
    if (inMatch) {
      const col = inMatch[1].replace(/^\w+\./i, '');
      const vals = inMatch[2].split(',').map(v => {
        v = v.trim();
        if (v.startsWith('$')) return params[parseInt(v.substring(1)) - 1];
        return v.replace(/'/g, '');
      });
      return vals.includes(row[col]);
    }

    cond = cond.replace(/(\w+\.\w+|\w+)::date/g, '$1');
    const operMatch = cond.match(/(\w+\.\w+|\w+)\s*(=|!=|>=|<=|>|<)\s*(.+)/);
    if (operMatch) {
      let col = operMatch[1].replace(/^\w+\./i, '');
      const oper = operMatch[2];
      let val = operMatch[3].trim().replace(/::date/g, '');
      if (val.startsWith('$')) val = params[parseInt(val.substring(1)) - 1];
      else if (val.startsWith("'") || val.endsWith("'")) {
        val = val.replace(/'/g, '').trim();
      } else val = parseInt(val);

      if (val == null) return false;

      const rowVal = row[col];
      if (rowVal === undefined) return true;

      const isDateCol = col === 'date' || cond.includes('date');
      if (isDateCol) {
        const d1 = new Date(rowVal).toISOString().split('T')[0];
        const d2 = String(val).split('T')[0];
        if (oper === '=') return d1 === d2;
        if (oper === '>=') return d1 >= d2;
        if (oper === '<=') return d1 <= d2;
      }

      if (typeof val === 'number' && typeof rowVal === 'number') {
        if (oper === '=') return rowVal === val;
        if (oper === '!=') return rowVal !== val;
        if (oper === '>=') return rowVal >= val;
        if (oper === '<=') return rowVal <= val;
        if (oper === '>') return rowVal > val;
        if (oper === '<') return rowVal < val;
      }
      if (typeof val === 'string') {
        const rv = String(rowVal);
        if (oper === '=') return rv === val;
        if (oper === '!=') return rv !== val;
        if (oper === '>=') return rv >= val;
        if (oper === '<=') return rv <= val;
      }
    }
    return true;
  }

  _evalOn(row, joinRow, onClause, joinAlias) {
    const m = onClause.match(/(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)/);
    if (m) {
      if (m[1] === joinAlias) return joinRow[m[2]] === row[m[4]];
      return row[m[2]] === joinRow[m[4]];
    }
    return true;
  }
}

module.exports = { JSONDB, DEF_PERMS };
