/* ============================================================
   CrewNest DEMO: ユーザー編集パネルの契約条件セクション（issue #54 稼働早見表）
   使い方: <script src="contracts.js"></script>（CrewNest Admin.html に追加）
   本体 src/features/admin/components/ContractSection.tsx の React 化前の静的再現。
   ソース: ~/.claude-tools/crew-nest-mock/issue54/fragments/admin-contract.js
   ============================================================ */
(function () {
var CM = '2026-09', CU = null;
var TL = { RANGE: '上限下限', MIDPOINT: '中間', BUSINESS_DAYS: '営業日数連動', NONE: '固定（精算なし）' };
var DF = ['6.5', '7', '7.5', '7.75', '8'];
var CT = {
  '鈴木 一郎': [
    { effectiveFrom: '2026-04', client: '株式会社アルファ ／ 基幹刷新PJ', type: 'RANGE', daily: 8, unit: 'HOURS', lower: 140, upper: 180 },
    { effectiveFrom: '2025-10', client: '株式会社アルファ ／ 基幹刷新PJ', type: 'RANGE', daily: 8, unit: 'HOURS', lower: 120, upper: 180 }
  ],
  '佐藤 恵子': [{ effectiveFrom: '2026-01', client: 'ベータ商事', type: 'BUSINESS_DAYS', daily: 7.75, lowerAdj: -20, upperAdj: null }],
  '田中 佑樹': [{ effectiveFrom: '2026-07', client: 'ガンマ技研', type: 'MIDPOINT', daily: 8, base: 160 }],
  '伊藤 健太': [],
  '渡辺 さゆり': [{ effectiveFrom: '2025-04', client: '', type: 'NONE', daily: 8 }],
  '小林 直人': []
};
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function fn(n) { return String(Math.round(n * 100) / 100); }
function ml(ym) { var p = ym.split('-'); return p[0] + '年' + parseInt(p[1], 10) + '月'; }
function nm(ym) { var p = ym.split('-'), y = +p[0], m = +p[1] + 1; if (m > 12) { m = 1; y += 1; } return y + '-' + (m < 10 ? '0' + m : m); }
function cd(c) { return c ? c : 'なし'; }
function ga(h) { var a = null; h.forEach(function (e) { if (e.effectiveFrom <= CM && (!a || e.effectiveFrom > a.effectiveFrom)) a = e; }); return a; }
function dl(e) {
  var d = fn(e.daily) + 'h', parts;
  if (e.type === 'RANGE') {
    var sfx = e.unit === 'RATIO' ? '%' : 'h';
    var lt = e.lower != null ? fn(e.lower) + sfx : null, ut = e.upper != null ? fn(e.upper) + sfx : null;
    var rt = lt && ut ? '下限 ' + lt + ' 〜 上限 ' + ut : lt ? '下限 ' + lt : '上限 ' + ut;
    parts = ['定時 ' + d, rt];
  } else if (e.type === 'MIDPOINT') { parts = ['定時 ' + d, '基準 ' + fn(e.base) + 'h']; }
  else if (e.type === 'BUSINESS_DAYS') { var adj = '下限調整 ' + fn(e.lowerAdj) + 'h'; if (e.upperAdj != null) adj += ' ／ 上限調整 ' + fn(e.upperAdj) + 'h'; parts = ['定時 ' + d, adj]; }
  else { parts = ['精算なし']; }
  parts.push(ml(e.effectiveFrom) + 'から適用');
  return parts.join(' ／ ');
}
function rs(el, ap) {
  if (!ap) { el.innerHTML = '<p class="text-xs text-subtle">契約条件が登録されていません</p>'; return; }
  var l1 = cd(ap.client) + ' ・ ' + TL[ap.type];
  el.innerHTML = '<p class="text-sm font-semibold text-text">' + esc(l1) + '</p><p class="text-xs text-subtle">' + esc(dl(ap)) + '</p>';
}
function rh(el, h, ap) {
  if (!h.length) { el.innerHTML = ''; el.style.display = 'none'; return; }
  el.style.display = '';
  var rows = h.map(function (e, i) { return { e: e, idx: i }; }).sort(function (a, b) { return b.e.effectiveFrom.localeCompare(a.e.effectiveFrom); });
  el.innerHTML = rows.map(function (row) {
    var e = row.e;
    var chip = ap && e.effectiveFrom === ap.effectiveFrom ? '<span class="rounded-full bg-primary-lightest px-2 py-0.5 text-[10px] font-bold text-primary">適用中</span>' : '';
    return '<div class="flex items-center gap-2 px-3 py-2 text-xs"><span class="shrink-0 text-text font-semibold">' + esc(ml(e.effectiveFrom)) + 'から</span><span class="min-w-0 flex-1 truncate text-subtle">' + esc(TL[e.type]) + ' ・ ' + esc(cd(e.client)) + '</span>' + chip + '<button type="button" data-ct-edit="' + row.idx + '" class="inline-flex h-8 shrink-0 items-center rounded-full border border-border px-3 text-xs text-subtle hover:bg-black/[0.08]">編集</button></div>';
  }).join('');
}
function he(s) { var er = s.querySelector('[data-ct="error"]'); er.textContent = ''; er.style.display = 'none'; }
function se(s, m) { var er = s.querySelector('[data-ct="error"]'); er.textContent = m; er.style.display = ''; }
function cf(s) { var f = s.querySelector('[data-ct="form"]'); f.style.display = 'none'; f.removeAttribute('data-editing'); he(s); }
function gv(s, t) { s.querySelectorAll('[data-ct-group]').forEach(function (g) { g.style.display = g.getAttribute('data-ct-group') === t ? '' : 'none'; }); }
function setEf(s, ym) { var p = ym.split('-'); s.querySelector('[data-ct-f="effYear"]').value = p[0]; s.querySelector('[data-ct-f="effMonth"]').value = p[1]; }
function getEf(s) { return s.querySelector('[data-ct-f="effYear"]').value + '-' + s.querySelector('[data-ct-f="effMonth"]').value; }
function dv(s) { var sel = s.querySelector('[data-ct-f="daily"]'), c = s.querySelector('[data-ct-f="dailyCustom"]'); c.style.display = sel.value === 'custom' ? '' : 'none'; }
function su(s, u) {
  var tg = s.querySelector('[data-ct="unitToggle"]'); tg.setAttribute('data-value', u);
  tg.querySelectorAll('[data-ct-unit]').forEach(function (b) {
    var a = b.getAttribute('data-ct-unit') === u;
    b.setAttribute('aria-pressed', a ? 'true' : 'false');
    b.className = 'flex-1 rounded-full border py-1.5 text-xs font-medium ' + (a ? 'border-primary bg-primary-lightest text-primary' : 'border-border text-subtle');
  });
}
function fd(s, v) {
  var sel = s.querySelector('[data-ct-f="daily"]'), c = s.querySelector('[data-ct-f="dailyCustom"]'), str = fn(v);
  if (DF.indexOf(str) !== -1) { sel.value = str; c.style.display = 'none'; c.value = ''; }
  else { sel.value = 'custom'; c.style.display = ''; c.value = str; }
}
function oa(s) {
  var f = s.querySelector('[data-ct="form"]'); f.removeAttribute('data-editing');
  setEf(s, nm(CM));
  s.querySelector('[data-ct-f="client"]').value = '';
  s.querySelector('[data-ct-f="type"]').value = 'RANGE';
  fd(s, 8); su(s, 'HOURS');
  s.querySelector('[data-ct-f="lower"]').value = '140';
  s.querySelector('[data-ct-f="upper"]').value = '180';
  s.querySelector('[data-ct-f="base"]').value = '160';
  s.querySelector('[data-ct-f="lowerAdj"]').value = '-20';
  s.querySelector('[data-ct-f="upperAdj"]').value = '';
  gv(s, 'RANGE');
  s.querySelector('[data-ct="delete"]').style.display = 'none';
  he(s); f.style.display = '';
}
function oe(s, idx) {
  var h = CT[CU] || [], e = h[idx]; if (!e) return;
  var f = s.querySelector('[data-ct="form"]'); f.setAttribute('data-editing', e.effectiveFrom);
  setEf(s, e.effectiveFrom);
  s.querySelector('[data-ct-f="client"]').value = e.client || '';
  s.querySelector('[data-ct-f="type"]').value = e.type;
  fd(s, e.daily); su(s, e.unit || 'HOURS');
  s.querySelector('[data-ct-f="lower"]').value = e.lower != null ? fn(e.lower) : '';
  s.querySelector('[data-ct-f="upper"]').value = e.upper != null ? fn(e.upper) : '';
  s.querySelector('[data-ct-f="base"]').value = e.base != null ? fn(e.base) : '160';
  s.querySelector('[data-ct-f="lowerAdj"]').value = e.lowerAdj != null ? fn(e.lowerAdj) : '-20';
  s.querySelector('[data-ct-f="upperAdj"]').value = e.upperAdj != null ? fn(e.upperAdj) : '';
  gv(s, e.type);
  s.querySelector('[data-ct="delete"]').style.display = '';
  he(s); f.style.display = '';
}
function rd(s) { var sel = s.querySelector('[data-ct-f="daily"]'); return sel.value === 'custom' ? s.querySelector('[data-ct-f="dailyCustom"]').value : sel.value; }
function vb(s) {
  var ef = getEf(s);
  var cl = s.querySelector('[data-ct-f="client"]').value;
  var ty = s.querySelector('[data-ct-f="type"]').value;
  var dr = rd(s), d = parseFloat(dr);
  if (!dr || isNaN(d) || d < 1 || d > 12 || Math.abs(d * 4 - Math.round(d * 4)) > 1e-9) return { error: '定時は1〜12の範囲で0.25刻みで入力してください' };
  var entry = { effectiveFrom: ef, client: cl, type: ty, daily: d };
  if (ty === 'RANGE') {
    var u = s.querySelector('[data-ct="unitToggle"]').getAttribute('data-value');
    var lr = s.querySelector('[data-ct-f="lower"]').value, ur = s.querySelector('[data-ct-f="upper"]').value;
    var lo = lr === '' ? null : parseFloat(lr), up = ur === '' ? null : parseFloat(ur);
    if (lo == null && up == null) return { error: '下限または上限のどちらかを入力してください' };
    if (lo != null && up != null && lo > up) return { error: '下限は上限以下にしてください' };
    if (u === 'RATIO') {
      if (lo != null && (lo <= 0 || lo > 100)) return { error: '%は0より大きく100以下で入力してください' };
      if (up != null && (up <= 0 || up > 100)) return { error: '%は0より大きく100以下で入力してください' };
    }
    entry.unit = u; entry.lower = lo; entry.upper = up;
  } else if (ty === 'MIDPOINT') {
    var br = s.querySelector('[data-ct-f="base"]').value, ba = parseFloat(br);
    if (!br || isNaN(ba) || ba <= 0) return { error: '基準時間は0より大きい値を入力してください' };
    entry.base = ba;
  } else if (ty === 'BUSINESS_DAYS') {
    var lar = s.querySelector('[data-ct-f="lowerAdj"]').value, la = parseFloat(lar);
    if (lar === '' || isNaN(la)) return { error: '下限調整（h）は必須です' };
    var uar = s.querySelector('[data-ct-f="upperAdj"]').value;
    entry.lowerAdj = la; entry.upperAdj = uar === '' ? null : parseFloat(uar);
  }
  var editing = s.querySelector('[data-ct="form"]').getAttribute('data-editing');
  var h = CT[CU] || [];
  var dup = h.some(function (x) { return x.effectiveFrom === ef && x.effectiveFrom !== editing; });
  if (dup) return { error: '同じ適用開始月の条件があります' };
  return { entry: entry, editing: editing };
}
function rSec(s) {
  var h = CT[CU] || [], ap = ga(h);
  rs(s.querySelector('[data-ct="summary"]'), ap);
  rh(s.querySelector('[data-ct="history"]'), h, ap);
  cf(s);
}
function rAll() { document.querySelectorAll('[data-contract-section]').forEach(rSec); }
function hSave(s) {
  if (!CU) return;
  var r = vb(s);
  if (r.error) { se(s, r.error); return; }
  var h = CT[CU] || (CT[CU] = []);
  if (r.editing) { var i = h.findIndex(function (x) { return x.effectiveFrom === r.editing; }); if (i !== -1) h[i] = r.entry; else h.push(r.entry); }
  else { h.push(r.entry); }
  rAll();
}
function hDel(s) {
  if (!CU) return;
  var editing = s.querySelector('[data-ct="form"]').getAttribute('data-editing');
  if (!editing) return;
  if (!window.confirm('この契約条件を削除します。よろしいですか？')) return;
  var h = CT[CU] || [];
  var i = h.findIndex(function (x) { return x.effectiveFrom === editing; });
  if (i !== -1) h.splice(i, 1);
  rAll();
}
document.addEventListener('slidewillopen', function (e) {
  if (!e.detail || e.detail.id !== 'user-edit') return;
  var tr = e.detail.trigger;
  CU = tr && tr.getAttribute ? tr.getAttribute('data-u-name') : null;
  rAll();
});
document.addEventListener('click', function (e) {
  var s = e.target.closest('[data-contract-section]'); if (!s) return;
  if (e.target.closest('[data-ct="add"]')) { oa(s); return; }
  var eb = e.target.closest('[data-ct-edit]');
  if (eb) { oe(s, parseInt(eb.getAttribute('data-ct-edit'), 10)); return; }
  if (e.target.closest('[data-ct="cancel"]')) { cf(s); return; }
  if (e.target.closest('[data-ct="save"]')) { hSave(s); return; }
  if (e.target.closest('[data-ct="delete"]')) { hDel(s); return; }
  var ub = e.target.closest('[data-ct-unit]');
  if (ub) { su(s, ub.getAttribute('data-ct-unit')); return; }
});
document.addEventListener('change', function (e) {
  var s = e.target.closest('[data-contract-section]'); if (!s) return;
  if (e.target.matches('[data-ct-f="type"]')) { gv(s, e.target.value); return; }
  if (e.target.matches('[data-ct-f="daily"]')) { dv(s); return; }
});
})();
