(function(root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.FormulaEngine = factory();
})(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  function tokenize(src) {
    const tokens = [];
    let i = 0;
    while (i < src.length) {
      const ch = src[i];
      if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') { i++; continue; }
      if (/[0-9.]/.test(ch)) {
        let j = i;
        while (j < src.length && /[0-9.]/.test(src[j])) j++;
        tokens.push({ t: 'num', v: parseFloat(src.slice(i, j)) });
        i = j;
        continue;
      }
      if (/[a-zA-Z_$]/.test(ch)) {
        let j = i;
        while (j < src.length && /[a-zA-Z0-9_$]/.test(src[j])) j++;
        tokens.push({ t: 'id', v: src.slice(i, j) });
        i = j;
        continue;
      }
      if ('+-*/%'.includes(ch)) { tokens.push({ t: 'op', v: ch }); i++; continue; }
      if (ch === '(' || ch === ')' || ch === ',') { tokens.push({ t: ch, v: ch }); i++; continue; }
      i++;
    }
    return tokens;
  }

  function Parser(tokens) {
    this.tokens = tokens;
    this.i = 0;
  }
  Parser.prototype.peek = function() { return this.tokens[this.i]; };
  Parser.prototype.next = function() { return this.tokens[this.i++]; };
  Parser.prototype.expect = function(t) {
    const tok = this.next();
    if (!tok || tok.t !== t) throw new Error('expected ' + t);
    return tok;
  };
  Parser.prototype.parseExpr = function() { return this.parseAddSub(); };
  Parser.prototype.parseAddSub = function() {
    let node = this.parseMulDiv();
    while (this.peek() && this.peek().t === 'op' && (this.peek().v === '+' || this.peek().v === '-')) {
      const op = this.next().v;
      node = { t: 'bin', op: op, l: node, r: this.parseMulDiv() };
    }
    return node;
  };
  Parser.prototype.parseMulDiv = function() {
    let node = this.parseUnary();
    while (this.peek() && this.peek().t === 'op' && (this.peek().v === '*' || this.peek().v === '/' || this.peek().v === '%')) {
      const op = this.next().v;
      node = { t: 'bin', op: op, l: node, r: this.parseUnary() };
    }
    return node;
  };
  Parser.prototype.parseUnary = function() {
    const tok = this.peek();
    if (tok && tok.t === 'op' && (tok.v === '-' || tok.v === '+')) {
      this.next();
      return { t: tok.v === '-' ? 'neg' : 'pos', operand: this.parseUnary() };
    }
    return this.parsePrimary();
  };
  Parser.prototype.parsePrimary = function() {
    const tok = this.next();
    if (!tok) throw new Error('unexpected end');
    if (tok.t === 'num') return { t: 'num', v: tok.v };
    if (tok.t === 'id') {
      if (this.peek() && this.peek().t === '(') {
        this.next();
        const args = [];
        if (this.peek() && this.peek().t !== ')') {
          args.push(this.parseExpr());
          while (this.peek() && this.peek().t === ',') { this.next(); args.push(this.parseExpr()); }
        }
        this.expect(')');
        return { t: 'call', name: tok.v, args: args };
      }
      return { t: 'field', name: tok.v };
    }
    if (tok.t === '(') {
      const e = this.parseExpr();
      this.expect(')');
      return e;
    }
    throw new Error('unexpected token');
  };

  var UNRES = { ok: false };

  function ev(node, ctx, isFormulaKey) {
    switch (node.t) {
      case 'num': return { ok: true, v: node.v };
      case 'field': {
        const k = node.name;
        if (ctx[k] === undefined || ctx[k] === null) {
          if (isFormulaKey(k)) return UNRES;
          return { ok: true, v: 0 };
        }
        const n = Number(ctx[k]);
        return { ok: true, v: isNaN(n) ? 0 : n };
      }
      case 'neg': {
        const r = ev(node.operand, ctx, isFormulaKey);
        return r.ok ? { ok: true, v: -r.v } : UNRES;
      }
      case 'pos': return ev(node.operand, ctx, isFormulaKey);
      case 'bin': {
        const l = ev(node.l, ctx, isFormulaKey);
        if (!l.ok) return UNRES;
        const r = ev(node.r, ctx, isFormulaKey);
        if (!r.ok) return UNRES;
        switch (node.op) {
          case '+': return { ok: true, v: l.v + r.v };
          case '-': return { ok: true, v: l.v - r.v };
          case '*': return { ok: true, v: l.v * r.v };
          case '/': return { ok: true, v: l.v / r.v };
          case '%': return { ok: true, v: l.v % r.v };
        }
        return UNRES;
      }
      case 'call': {
        const args = [];
        for (let a = 0; a < node.args.length; a++) {
          const r = ev(node.args[a], ctx, isFormulaKey);
          if (!r.ok) return UNRES;
          args.push(r.v);
        }
        const n = function(x) { const z = Number(x); return isNaN(z) ? 0 : z; };
        switch (node.name) {
          case 'pct': return { ok: true, v: n(args[1]) ? Math.round((n(args[0]) / n(args[1])) * 10000) / 100 : 0 };
          case 'round': {
            const x = n(args[0]);
            const d = args.length > 1 ? n(args[1]) : 0;
            const f = Math.pow(10, d);
            return { ok: true, v: Math.round(x * f) / f };
          }
          case 'div': return { ok: true, v: n(args[1]) ? n(args[0]) / n(args[1]) : 0 };
          case 'sum': { let s = 0; for (let a = 0; a < args.length; a++) s += n(args[a]); return { ok: true, v: s }; }
          case 'min': { let m = args.length ? n(args[0]) : 0; for (let a = 1; a < args.length; a++) m = Math.min(m, n(args[a])); return { ok: true, v: m }; }
          case 'max': { let m = args.length ? n(args[0]) : 0; for (let a = 1; a < args.length; a++) m = Math.max(m, n(args[a])); return { ok: true, v: m }; }
          case 'abs': return { ok: true, v: Math.abs(n(args[0])) };
          case 'floor': return { ok: true, v: Math.floor(n(args[0])) };
          case 'ceil': return { ok: true, v: Math.ceil(n(args[0])) };
        }
        return UNRES;
      }
    }
    return UNRES;
  }

  function evaluate(expr, ctx, isFormulaKey) {
    try {
      const ast = new Parser(tokenize(expr)).parseExpr();
      const r = ev(ast, ctx, isFormulaKey || function() { return false; });
      return r.ok ? r.v : undefined;
    } catch (e) {
      return undefined;
    }
  }

  function parseExprExpr(expr) {
    try { return new Parser(tokenize(expr)).parseExpr(); } catch (e) { return null; }
  }

  function computeFormulas(colDefs, rawData) {
    if (!colDefs || !colDefs.length || !rawData || typeof rawData !== 'object') return {};
    const formulaKeys = new Set();
    const colMap = {};
    for (let i = 0; i < colDefs.length; i++) {
      const c = colDefs[i];
      if (!c || !c.key) continue;
      colMap[c.key] = c;
      if (c.formula) formulaKeys.add(c.key);
    }
    if (!formulaKeys.size) return {};
    const ctx = {};
    for (const k of Object.keys(rawData)) {
      const n = Number(rawData[k]);
      ctx[k] = isNaN(n) ? (rawData[k] === null || rawData[k] === undefined ? null : rawData[k]) : n;
    }
    const isFormulaKey = function(k) { return formulaKeys.has(k); };
    const out = {};
    const pending = [];
    for (let i = 0; i < colDefs.length; i++) if (colDefs[i] && colDefs[i].formula) pending.push(colDefs[i].key);
    let guard = pending.length * 2 + 5;
    let changed = true;
    while (changed && guard-- > 0) {
      changed = false;
      for (let i = pending.length - 1; i >= 0; i--) {
        const key = pending[i];
        if (out[key] !== undefined) continue;
        const c = colMap[key];
        if (!c || !c.formula_expr) { out[key] = 0; pending.splice(i, 1); changed = true; continue; }
        const v = evaluate(c.formula_expr, ctx, isFormulaKey);
        if (v !== undefined) {
          out[key] = v;
          ctx[key] = v;
          pending.splice(i, 1);
          changed = true;
        }
      }
    }
    for (let i = 0; i < pending.length; i++) out[pending[i]] = 0;
    return out;
  }

  function isAboveTarget(colDefs, key, val) {
    let def = null;
    for (let i = 0; i < colDefs.length; i++) { if (colDefs[i] && colDefs[i].key === key) { def = colDefs[i]; break; } }
    if (!def || !def.target) return val > 0;
    const t = String(def.target);
    if (t === '> last') return false;
    const num = parseFloat(t.replace(/[<>=%\s]/g, ''));
    if (isNaN(num)) return false;
    if (t.indexOf('<') === 0) return val > num;
    if (t.indexOf('>') === 0) return val < num;
    return val > num;
  }

  function syncColKeys(colDefs, keys) {
    for (let i = 0; i < colDefs.length; i++) {
      const c = colDefs[i];
      if (!c || !c.key) continue;
      if (c.formula) keys.push(c.key);
    }
  }

  /* ───────── Arabic formula translation (المعادلة بالعربي) ───────── */
  function _normAr(t) {
    return String(t)
      .replace(/[\u064B-\u0652\u0640]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
      .replace(/٫/g, '.')
      .replace(/（/g, '(').replace(/）/g, ')')
      .replace(/[،]/g, ',')
      .trim();
  }

  function _isPref(k, prefs) {
    for (let i = 0; i < prefs.length; i++) if (k.indexOf(prefs[i]) === 0) return true;
    return false;
  }

  /* Build label→key aliases from defs (big+small). Context aliases first, bare labels
     only when unambiguous or when a clear raw field exists (no ratio_/pct_/child_ prefix). */
  function _buildArAliases(defs) {
    const entries = [];
    for (let i = 0; i < (defs || []).length; i++) {
      const d = defs[i];
      if (!d || !d.key || !d.label) continue;
      const L = _normAr(d.label);
      const G = d.group ? _normAr(d.group) : '';
      const S = d.sg ? _normAr(d.sg) : '';
      const SS = d.ssg ? _normAr(d.ssg) : '';
      entries.push({ bare: true, t: L, key: d.key });
      if (G) entries.push({ bare: false, t: G + ' ' + L, key: d.key });
      if (S) entries.push({ bare: false, t: S + ' ' + L, key: d.key });
      if (SS) entries.push({ bare: false, t: SS + ' ' + S + ' ' + L, key: d.key });
    }
    const bareMap = {};
    for (let i = 0; i < entries.length; i++) if (entries[i].bare) (bareMap[entries[i].t] = bareMap[entries[i].t] || []).push(entries[i].key);
    const out = [];
    const seen = {};
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      let key = e.key;
      if (e.bare) {
        const unique = [];
        for (const k of bareMap[e.t]) if (unique.indexOf(k) === -1) unique.push(k);
        if (unique.length === 1) key = unique[0];
        else {
          const prefs = ['ratio_', 'pct_', 'child_'];
          const filtered = unique.filter(k => !_isPref(k, prefs));
          if (filtered.length === 1) key = filtered[0];
          else continue; // ambiguous → only context aliases remain
        }
      }
      if (!e.t || seen[e.t + '|' + key]) continue;
      seen[e.t + '|' + key] = 1;
      out.push({ t: e.t, key: key });
    }
    out.sort((a, b) => b.t.length - a.t.length);
    return out;
  }

  function _replaceArFields(s, aliases) {
    let r = s;
    for (let i = 0; i < aliases.length; i++) {
      r = r.split(aliases[i].t).join(aliases[i].key);
    }
    return r;
  }

  /* Convert Arabic function/operator words into engine syntax.
     NOTE: input is normalized (أ→ا, ة→ه, ى→ي) so keywords use normalized forms. */
  function _translateArCore(s) {
    let r = s;
    const ATOM = '([a-zA-Z_$][\\w$]*|\\d+(?:\\.\\d+)?)';
    // مجموع X و Y و Z  (simple atom list)
    r = r.replace(new RegExp('مجموع\\s+' + ATOM + '(?:\\s+(?:و|،|,)\\s+' + ATOM + ')+', 'g'), function(mm) {
      const parts = mm.split(/\s+(?:و|،|,)\s+/);
      parts[0] = parts[0].replace(/^مجموع\s+/, '');
      return 'sum(' + parts.join(', ') + ')';
    });
    // نسبة X من Y | نسبة X ÷ Y | نسبة X على Y  (second arg stops at 'إلى' round marker)
    r = r.replace(/نسبه\s+(.+?)\s+(?:من|علي|÷)\s+([^,،]+?)(?=\s+الي(?![\u0600-\u06FF])|$)/g, 'pct($1, $2)');
    // قسمة X على Y
    r = r.replace(/قسمه\s+(.+?)\s+علي\s+(.+)/g, 'div($1, $2)');
    // ÷ بين المقدارين
    r = r.replace(/\s*÷\s*/g, '/');
    // operators in words (× is the multiplication sign — NOT the letter x)
    r = r.replace(/\s*×\s*/g, ' * ').replace(/\s*في\s+/g, ' * ').replace(/\s*ضرب\s+/g, ' * ');
    r = r.replace(/\s*زايد\s+/g, ' + ').replace(/\s*ناقص\s+/g, ' - ');
    // تقريب X إلى N
    r = r.replace(/تقريب\s+(.+?)(?:\s+الي\s+(\d+))?\s*$/g, function(mm, x, n) { return 'round(' + x + (n ? ', ' + n : '') + ')'; });
    r = r.replace(/قيمه\s+مطلقه\s+(.+)/g, 'abs($1)');
    return r;
  }

  /* Translate an Arabic formula text to engine expression.
     Returns { expr, leftover, ok } (expr = null when it cannot be parsed;
     ok = false when there are untranslated Arabic leftovers or parse failed). */
  function translateArabic(text, defs) {
    if (text == null) return { expr: '', leftover: [], ok: true };
    const norm = _normAr(text);
    if (!norm) return { expr: '', leftover: [], ok: true };
    const aliases = _buildArAliases(defs);
    let r = _replaceArFields(norm, aliases);
    r = _translateArCore(r);
    r = r.replace(/\s+/g, ' ').trim();
    const leftover = [];
    const m = r.match(/[\u0600-\u06FF]+/g);
    if (m) for (let i = 0; i < m.length; i++) leftover.push(m[i]);
    const parsed = parseExprExpr(r);
    if (!parsed) return { expr: null, leftover: leftover, ok: false };
    return { expr: r, leftover: leftover, ok: leftover.length === 0 };
  }

  return {
    tokenize: tokenize,
    parseExpr: parseExprExpr,
    evaluate: evaluate,
    computeFormulas: computeFormulas,
    isAboveTarget: isAboveTarget,
    syncColKeys: syncColKeys,
    translateArabic: translateArabic
  };
});
