/* ============================================================
   CrewNest DEMO: 契約条件の共通データ・ダイアログ（issue #54 稼働早見表 + 契約タブ追補）
   使い方: <script src="contracts.js"></script>（CrewNest Admin.html に追加）
   本体 src/features/admin/components/ContractSection.tsx・ContractMemberPanel.tsx の
   React 化前の静的再現。フォームは body 直下のモーダル（PC 中央／モバイル ボトムシート）に出す。
   器の構成は home-card.js の buildDetail() に揃えている。
   ユーザー編集パネルの「契約」セクション（data-contract-section）はサマリー表示だけを担い、
   契約の追加・編集・履歴は「契約 › メンバー」パネル（contract-members.js）で行う。
   このファイルは契約データ（CT）とダイアログ（buildDialog/oa/oe）を window.CNContracts で公開し、
   contract-members.js から使う。
   ソース: ~/.claude-tools/crew-nest-mock/issue54/fragments/admin-contract.js
   ============================================================ */
(function () {
var CM = '2026-09', CU = null, DLG = null, CS = null;
var TL = { RANGE: '上限下限', MIDPOINT: '中間', BUSINESS_DAYS: '営業日数連動', NONE: '固定（精算なし）' };
var DF = ['6.5', '7', '7.5', '7.75', '8'];
var CT = {
  '鈴木 一郎': [
    { effectiveFrom: '2026-04', client: '株式会社アルファ ／ 基幹刷新PJ', type: 'RANGE', daily: 8, unit: 'HOURS', lower: 140, upper: 180 },
    { effectiveFrom: '2025-10', client: '株式会社アルファ ／ 基幹刷新PJ', type: 'RANGE', daily: 8, unit: 'HOURS', lower: 120, upper: 180 },
    { effectiveFrom: '2027-01', client: '株式会社アルファ ／ 基幹刷新PJ', type: 'MIDPOINT', daily: 8, base: 160 }
  ],
  '佐藤 恵子': [{ effectiveFrom: '2026-01', client: 'ベータ商事', type: 'BUSINESS_DAYS', daily: 7.75, lowerAdj: -20, upperAdj: null }],
  '田中 佑樹': [{ effectiveFrom: '2026-07', client: 'ガンマ技研', type: 'MIDPOINT', daily: 8, base: 160 }],
  // 履歴の「11 件以上で折りたたむ」動作確認用。2015-04 から毎年 4 月開始の上限下限契約 12 件（客先はベータ商事）
  '伊藤 健太': [
    { effectiveFrom: '2015-04', client: 'ベータ商事', type: 'RANGE', daily: 8, unit: 'HOURS', lower: 140, upper: 180 },
    { effectiveFrom: '2016-04', client: 'ベータ商事', type: 'RANGE', daily: 8, unit: 'HOURS', lower: 140, upper: 180 },
    { effectiveFrom: '2017-04', client: 'ベータ商事', type: 'RANGE', daily: 8, unit: 'HOURS', lower: 140, upper: 180 },
    { effectiveFrom: '2018-04', client: 'ベータ商事', type: 'RANGE', daily: 8, unit: 'HOURS', lower: 140, upper: 180 },
    { effectiveFrom: '2019-04', client: 'ベータ商事', type: 'RANGE', daily: 8, unit: 'HOURS', lower: 140, upper: 180 },
    { effectiveFrom: '2020-04', client: 'ベータ商事', type: 'RANGE', daily: 8, unit: 'HOURS', lower: 140, upper: 180 },
    { effectiveFrom: '2021-04', client: 'ベータ商事', type: 'RANGE', daily: 8, unit: 'HOURS', lower: 140, upper: 180 },
    { effectiveFrom: '2022-04', client: 'ベータ商事', type: 'RANGE', daily: 8, unit: 'HOURS', lower: 140, upper: 180 },
    { effectiveFrom: '2023-04', client: 'ベータ商事', type: 'RANGE', daily: 8, unit: 'HOURS', lower: 140, upper: 180 },
    { effectiveFrom: '2024-04', client: 'ベータ商事', type: 'RANGE', daily: 8, unit: 'HOURS', lower: 140, upper: 180 },
    { effectiveFrom: '2025-04', client: 'ベータ商事', type: 'RANGE', daily: 8, unit: 'HOURS', lower: 140, upper: 180 },
    { effectiveFrom: '2026-04', client: 'ベータ商事', type: 'RANGE', daily: 8, unit: 'HOURS', lower: 140, upper: 180 }
  ],
  '渡辺 さゆり': [{ effectiveFrom: '2025-04', client: '', type: 'NONE', daily: 8 }],
  '小林 直人': []
};
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function fn(n) { return String(Math.round(n * 100) / 100); }
function ml(ym) { var p = ym.split('-'); return p[0] + '年' + parseInt(p[1], 10) + '月'; }
function nm(ym) { var p = ym.split('-'), y = +p[0], m = +p[1] + 1; if (m > 12) { m = 1; y += 1; } return y + '-' + (m < 10 ? '0' + m : m); }
function cd(c) { return c ? c : 'なし'; }
function ga(h) { var a = null; h.forEach(function (e) { if (e.effectiveFrom <= CM && (!a || e.effectiveFrom > a.effectiveFrom)) a = e; }); return a; }
// 適用開始月から当月（CM）までの月数（当月を含む）。12か月未満は「Nか月目」、12か月以上は「N年目」／端数があれば「N年Mか月目」。
// 未来の開始月（月数が0以下）は null（一覧・パネルとも表示しない）
function durationLabel(effectiveFrom) {
  var f = effectiveFrom.split('-'), fy = +f[0], fm = +f[1];
  var c = CM.split('-'), cy = +c[0], cm = +c[1];
  var n = (cy - fy) * 12 + (cm - fm) + 1;
  if (n <= 0) return null;
  if (n < 12) return n + 'か月目';
  var y = Math.floor(n / 12), r = n % 12;
  return r === 0 ? (y + '年目') : (y + '年' + r + 'か月目');
}
// 契約種別に応じた「下限〜上限」相当のラベル・値（NONE は精算なしなのでこの行を出さない）
function rangeCell(e) {
  if (e.type === 'RANGE') {
    var sfx = e.unit === 'RATIO' ? '%' : 'h';
    var lt = e.lower != null ? fn(e.lower) + sfx : null, ut = e.upper != null ? fn(e.upper) + sfx : null;
    var rt = lt && ut ? '下限 ' + lt + ' 〜 上限 ' + ut : lt ? '下限 ' + lt : '上限 ' + ut;
    return { label: '下限〜上限', value: rt };
  }
  if (e.type === 'MIDPOINT') return { label: '基準時間', value: fn(e.base) + 'h' };
  if (e.type === 'BUSINESS_DAYS') {
    var adj = '下限調整 ' + fn(e.lowerAdj) + 'h';
    if (e.upperAdj != null) adj += ' ／ 上限調整 ' + fn(e.upperAdj) + 'h';
    return { label: '下限〜上限', value: adj };
  }
  return null;
}
// h（契約履歴）を適用開始月の降順で全件返す（パネルの履歴一覧用。current/past の分類はしない）
function allRows(h) {
  var rows = h.map(function (e, i) { return { e: e, idx: i }; });
  rows.sort(function (a, b) { return b.e.effectiveFrom.localeCompare(a.e.effectiveFrom); });
  return rows;
}
// withDate=false のとき末尾の「○年○月から適用」を付けない（一覧の「現在の契約」列は適用開始月を別列に出すため）
function dl(e, withDate) {
  var d = fn(e.daily) + 'h', parts;
  if (e.type === 'RANGE') {
    var sfx = e.unit === 'RATIO' ? '%' : 'h';
    var lt = e.lower != null ? fn(e.lower) + sfx : null, ut = e.upper != null ? fn(e.upper) + sfx : null;
    var rt = lt && ut ? '下限 ' + lt + ' 〜 上限 ' + ut : lt ? '下限 ' + lt : '上限 ' + ut;
    parts = ['定時 ' + d, rt];
  } else if (e.type === 'MIDPOINT') { parts = ['定時 ' + d, '基準 ' + fn(e.base) + 'h']; }
  else if (e.type === 'BUSINESS_DAYS') { var adj = '下限調整 ' + fn(e.lowerAdj) + 'h'; if (e.upperAdj != null) adj += ' ／ 上限調整 ' + fn(e.upperAdj) + 'h'; parts = ['定時 ' + d, adj]; }
  else { parts = ['精算なし']; }
  if (withDate !== false) parts.push(ml(e.effectiveFrom) + 'から適用');
  return parts.join(' ／ ');
}
// nextFuture: ap が無いときに「N年M月からの契約があります」を出すための直近の未来契約（無ければ null）
function rs(el, ap, nextFuture) {
  if (!ap) {
    if (nextFuture) { el.innerHTML = '<p class="text-xs text-subtle">現在適用中の契約はありません（' + esc(ml(nextFuture.effectiveFrom)) + 'からの契約があります）</p>'; return; }
    el.innerHTML = '<p class="text-xs text-subtle">契約が登録されていません</p>';
    return;
  }
  var l1 = cd(ap.client) + ' ・ ' + TL[ap.type];
  el.innerHTML = '<p class="text-sm font-semibold text-text">' + esc(l1) + '</p><p class="text-xs text-subtle">' + esc(dl(ap)) + '</p>';
}
// rows: allRows()/classify() が返す { e, idx }[]（idx は CT[名前] 配列内での本来の位置。編集ボタンの対象解決に使う）
// ap: 適用中の契約（無ければ null）。cm: 当月（渡すと未来の行に「予定」チップを付ける）
function rh(el, rows, ap, cm) {
  if (!rows.length) { el.innerHTML = ''; el.style.display = 'none'; return; }
  el.style.display = '';
  el.innerHTML = rows.map(function (row) {
    var e = row.e;
    var chip = '';
    if (ap && e.effectiveFrom === ap.effectiveFrom) chip = '<span class="rounded-full bg-primary-lightest px-2 py-0.5 text-[10px] font-bold text-primary">適用中</span>';
    else if (cm && e.effectiveFrom > cm) chip = '<span class="rounded-full bg-background px-2 py-0.5 text-[10px] text-subtle">予定</span>';
    return '<div class="flex items-center gap-2 px-3 py-2 text-xs"><span class="shrink-0 text-text font-semibold">' + esc(ml(e.effectiveFrom)) + 'から</span><span class="min-w-0 flex-1 truncate text-subtle">' + esc(TL[e.type]) + ' ・ ' + esc(cd(e.client)) + '</span>' + chip + '<button type="button" data-ct-edit="' + row.idx + '" class="inline-flex h-8 shrink-0 items-center rounded-full border border-border px-3 text-xs text-subtle hover:bg-black/[0.08]">編集</button></div>';
  }).join('');
}
// current（適用中。無ければ null）と、常時表示すべき visible（current＋未来。適用開始月の降順）、
// 折りたたむ past（visible に入らない、current より前の行。適用開始月の降順）に分ける
function classify(h, cm) {
  var rows = h.map(function (e, i) { return { e: e, idx: i }; });
  var current = ga(h);
  var visible = [], past = [];
  rows.forEach(function (row) {
    if (current && row.e.effectiveFrom < current.effectiveFrom) past.push(row); else visible.push(row);
  });
  visible.sort(function (a, b) { return b.e.effectiveFrom.localeCompare(a.e.effectiveFrom); });
  past.sort(function (a, b) { return b.e.effectiveFrom.localeCompare(a.e.effectiveFrom); });
  return { current: current, visible: visible, past: past };
}
function he() { var er = DLG.querySelector('[data-ct="error"]'); er.textContent = ''; er.style.display = 'none'; }
function se(m) { var er = DLG.querySelector('[data-ct="error"]'); er.textContent = m; er.style.display = ''; }
function gv(t) { DLG.querySelectorAll('[data-ct-group]').forEach(function (g) { g.style.display = g.getAttribute('data-ct-group') === t ? '' : 'none'; }); }
function setEf(ym) { var p = ym.split('-'); DLG.querySelector('[data-ct-f="effYear"]').value = p[0]; DLG.querySelector('[data-ct-f="effMonth"]').value = p[1]; }
function getEf() { return DLG.querySelector('[data-ct-f="effYear"]').value + '-' + DLG.querySelector('[data-ct-f="effMonth"]').value; }
function dv() { var sel = DLG.querySelector('[data-ct-f="daily"]'), c = DLG.querySelector('[data-ct-f="dailyCustom"]'); c.style.display = sel.value === 'custom' ? '' : 'none'; }
function su(u) {
  var tg = DLG.querySelector('[data-ct="unitToggle"]'); tg.setAttribute('data-value', u);
  tg.querySelectorAll('[data-ct-unit]').forEach(function (b) {
    var a = b.getAttribute('data-ct-unit') === u;
    b.setAttribute('aria-pressed', a ? 'true' : 'false');
    b.className = 'flex-1 rounded-full border py-1.5 text-xs font-medium ' + (a ? 'border-primary bg-primary-lightest text-primary' : 'border-border text-subtle');
  });
}
function fd(v) {
  var sel = DLG.querySelector('[data-ct-f="daily"]'), c = DLG.querySelector('[data-ct-f="dailyCustom"]'), str = fn(v);
  if (DF.indexOf(str) !== -1) { sel.value = str; c.style.display = 'none'; c.value = ''; }
  else { sel.value = 'custom'; c.style.display = ''; c.value = str; }
}
// モーダルの器（body 直下に 1 つだけ）。PC 中央／モバイル ボトムシートの切り替えは home-card.js の buildDetail() と同じ構成
function buildDialog() {
  var wrap = document.createElement('div');
  wrap.id = 'ct-dialog';
  wrap.hidden = true;
  wrap.innerHTML =
    '<div data-ct-close class="fixed inset-0 z-[96] bg-black/50"></div>' +
    '<div role="dialog" aria-modal="true" aria-labelledby="ct-dialog-title" class="fixed z-[96] flex flex-col bg-background-light shadow-md outline-none ' +
      'inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl pb-[env(safe-area-inset-bottom)] ' +
      'md:inset-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:pb-0">' +
      '<div class="mx-auto mt-2 h-1.5 w-12 shrink-0 rounded-full bg-border md:hidden"></div>' +
      '<div class="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">' +
        '<h2 id="ct-dialog-title" data-ct="title" class="text-[15px] font-bold text-text"></h2>' +
        '<button type="button" data-ct-close aria-label="閉じる" class="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full text-subtle transition-colors hover:bg-black/[0.08]"><svg viewBox="0 -960 960 960" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M256-200 200-256l224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"></path></svg></button>' +
      '</div>' +
      '<div class="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">' +
        '<div>' +
          '<label class="mb-2 block text-[10.5px] font-semibold uppercase tracking-wide text-subtle">適用開始月</label>' +
          '<div class="grid grid-cols-2 gap-2">' +
            '<select data-ct-f="effYear" aria-label="適用開始月（年）" class="w-full rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"><option value="2021">2021年</option><option value="2022">2022年</option><option value="2023">2023年</option><option value="2024">2024年</option><option value="2025">2025年</option><option value="2026">2026年</option><option value="2027">2027年</option><option value="2028">2028年</option></select>' +
            '<select data-ct-f="effMonth" aria-label="適用開始月（月）" class="w-full rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"><option value="01">1月</option><option value="02">2月</option><option value="03">3月</option><option value="04">4月</option><option value="05">5月</option><option value="06">6月</option><option value="07">7月</option><option value="08">8月</option><option value="09">9月</option><option value="10">10月</option><option value="11">11月</option><option value="12">12月</option></select>' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<label class="mb-2 block text-[10.5px] font-semibold uppercase tracking-wide text-subtle">客先</label>' +
          '<select data-ct-f="client" class="w-full rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">' +
            '<option value="">なし</option>' +
            '<option value="株式会社アルファ ／ 基幹刷新PJ">株式会社アルファ ／ 基幹刷新PJ</option>' +
            '<option value="株式会社アルファ ／ 保守PJ">株式会社アルファ ／ 保守PJ</option>' +
            '<option value="ベータ商事">ベータ商事</option>' +
            '<option value="ガンマ技研">ガンマ技研</option>' +
            '<option value="デルタシステムズ">デルタシステムズ</option>' +
          '</select>' +
        '</div>' +
        '<div>' +
          '<label class="mb-2 block text-[10.5px] font-semibold uppercase tracking-wide text-subtle">契約種別</label>' +
          '<select data-ct-f="type" class="w-full rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">' +
            '<option value="RANGE">上限下限</option>' +
            '<option value="MIDPOINT">中間</option>' +
            '<option value="BUSINESS_DAYS">営業日数連動</option>' +
            '<option value="NONE">固定（精算なし）</option>' +
          '</select>' +
        '</div>' +
        '<div>' +
          '<label class="mb-2 block text-[10.5px] font-semibold uppercase tracking-wide text-subtle">定時</label>' +
          '<div class="flex items-center gap-2">' +
            '<select data-ct-f="daily" class="w-full rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">' +
              '<option value="6.5">6.5</option>' +
              '<option value="7">7</option>' +
              '<option value="7.5">7.5</option>' +
              '<option value="7.75">7.75</option>' +
              '<option value="8">8</option>' +
              '<option value="custom">その他</option>' +
            '</select>' +
            '<input type="number" step="0.25" min="1" max="12" data-ct-f="dailyCustom" style="display:none" class="w-24 shrink-0 rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">' +
          '</div>' +
        '</div>' +
        '<div data-ct-group="RANGE" class="space-y-2">' +
          '<div>' +
            '<span class="mb-1 block text-[10px] text-subtle">単位</span>' +
            '<div data-ct="unitToggle" data-value="HOURS" role="group" aria-label="下限・上限の単位" class="grid grid-cols-2 gap-1.5">' +
              '<button type="button" data-ct-unit="HOURS" aria-pressed="true" class="flex-1 rounded-full border py-1.5 text-xs font-medium border-primary bg-primary-lightest text-primary">時間</button>' +
              '<button type="button" data-ct-unit="RATIO" aria-pressed="false" class="flex-1 rounded-full border py-1.5 text-xs font-medium border-border text-subtle">%</button>' +
            '</div>' +
          '</div>' +
          '<div class="grid grid-cols-2 gap-2">' +
            '<div>' +
              '<span class="mb-1 block text-[10px] text-subtle">下限</span>' +
              '<input type="number" data-ct-f="lower" value="140" class="w-full rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">' +
            '</div>' +
            '<div>' +
              '<span class="mb-1 block text-[10px] text-subtle">上限</span>' +
              '<input type="number" data-ct-f="upper" value="180" class="w-full rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">' +
            '</div>' +
          '</div>' +
          '<p class="text-[11px] text-subtle">片方だけの契約は空欄にしてください</p>' +
        '</div>' +
        '<div data-ct-group="MIDPOINT" class="space-y-2">' +
          '<div>' +
            '<span class="mb-1 block text-[10px] text-subtle">基準時間</span>' +
            '<input type="number" data-ct-f="base" value="160" class="w-full rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">' +
          '</div>' +
          '<p class="text-[11px] text-subtle">基準を下回れば減額、上回れば加算</p>' +
        '</div>' +
        '<div data-ct-group="BUSINESS_DAYS" class="space-y-2">' +
          '<div class="grid grid-cols-2 gap-2">' +
            '<div>' +
              '<span class="mb-1 block text-[10px] text-subtle">下限調整（h）</span>' +
              '<input type="number" data-ct-f="lowerAdj" value="-20" class="w-full rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">' +
            '</div>' +
            '<div>' +
              '<span class="mb-1 block text-[10px] text-subtle">上限調整（h、任意）</span>' +
              '<input type="number" data-ct-f="upperAdj" class="w-full rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">' +
            '</div>' +
          '</div>' +
          '<p class="text-[11px] text-subtle">客先の営業日数 × 定時 に足した値が下限と上限になります</p>' +
        '</div>' +
        '<div data-ct-group="NONE" class="space-y-2">' +
          '<p class="text-xs text-subtle">精算なし。ホームの「プロジェクト」カードには予定稼働と有休の見込みだけが出ます</p>' +
        '</div>' +
        '<p data-ct="error" style="display:none" class="text-xs text-danger"></p>' +
      '</div>' +
      '<div class="flex shrink-0 items-center gap-2 border-t border-border bg-background-light px-5 py-3 md:rounded-b-2xl">' +
        '<button type="button" data-ct="delete" style="display:none" class="mr-auto inline-flex h-12 md:h-10 items-center justify-center rounded-full border border-danger-border bg-danger-surface px-5 text-sm font-medium text-danger">削除</button>' +
        '<button type="button" data-ct="cancel" class="inline-flex h-12 md:h-10 items-center justify-center rounded-full border border-border px-5 text-sm font-medium text-subtle hover:bg-black/[0.08]">キャンセル</button>' +
        '<button type="button" data-ct="save" class="inline-flex h-12 md:h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-white hover:bg-primary-mid">保存する</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(wrap);
  wrap.addEventListener('click', function (e) {
    if (e.target.closest('[data-ct-close]')) { cf(); return; }
    if (e.target.closest('[data-ct="cancel"]')) { cf(); return; }
    if (e.target.closest('[data-ct="save"]')) { hSave(); return; }
    if (e.target.closest('[data-ct="delete"]')) { hDel(); return; }
    var ub = e.target.closest('[data-ct-unit]');
    if (ub) { su(ub.getAttribute('data-ct-unit')); return; }
  });
  wrap.addEventListener('change', function (e) {
    if (e.target.matches('[data-ct-f="type"]')) { gv(e.target.value); return; }
    if (e.target.matches('[data-ct-f="daily"]')) { dv(); return; }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !wrap.hidden) cf(); });
  return wrap;
}
function cf() {
  if (!DLG || DLG.hidden) return;
  DLG.hidden = true;
  DLG.removeAttribute('data-editing');
  he();
  if (CS && document.body.contains(CS)) CS.focus();
  CS = null;
}
function oa() {
  if (!DLG) DLG = buildDialog();
  DLG.removeAttribute('data-editing');
  DLG.querySelector('[data-ct="title"]').textContent = '契約条件を追加';
  setEf(nm(CM));
  DLG.querySelector('[data-ct-f="client"]').value = '';
  DLG.querySelector('[data-ct-f="type"]').value = 'RANGE';
  fd(8); su('HOURS');
  DLG.querySelector('[data-ct-f="lower"]').value = '140';
  DLG.querySelector('[data-ct-f="upper"]').value = '180';
  DLG.querySelector('[data-ct-f="base"]').value = '160';
  DLG.querySelector('[data-ct-f="lowerAdj"]').value = '-20';
  DLG.querySelector('[data-ct-f="upperAdj"]').value = '';
  gv('RANGE');
  DLG.querySelector('[data-ct="delete"]').style.display = 'none';
  he();
  DLG.hidden = false;
  DLG.querySelector('[role="dialog"]').focus();
}
function oe(idx) {
  var h = CT[CU] || [], e = h[idx]; if (!e) return;
  if (!DLG) DLG = buildDialog();
  DLG.setAttribute('data-editing', e.effectiveFrom);
  DLG.querySelector('[data-ct="title"]').textContent = '契約条件を編集';
  setEf(e.effectiveFrom);
  DLG.querySelector('[data-ct-f="client"]').value = e.client || '';
  DLG.querySelector('[data-ct-f="type"]').value = e.type;
  fd(e.daily); su(e.unit || 'HOURS');
  DLG.querySelector('[data-ct-f="lower"]').value = e.lower != null ? fn(e.lower) : '';
  DLG.querySelector('[data-ct-f="upper"]').value = e.upper != null ? fn(e.upper) : '';
  DLG.querySelector('[data-ct-f="base"]').value = e.base != null ? fn(e.base) : '160';
  DLG.querySelector('[data-ct-f="lowerAdj"]').value = e.lowerAdj != null ? fn(e.lowerAdj) : '-20';
  DLG.querySelector('[data-ct-f="upperAdj"]').value = e.upperAdj != null ? fn(e.upperAdj) : '';
  gv(e.type);
  DLG.querySelector('[data-ct="delete"]').style.display = '';
  he();
  DLG.hidden = false;
  DLG.querySelector('[role="dialog"]').focus();
}
function rd() { var sel = DLG.querySelector('[data-ct-f="daily"]'); return sel.value === 'custom' ? DLG.querySelector('[data-ct-f="dailyCustom"]').value : sel.value; }
function vb() {
  var ef = getEf();
  var cl = DLG.querySelector('[data-ct-f="client"]').value;
  var ty = DLG.querySelector('[data-ct-f="type"]').value;
  var dr = rd(), d = parseFloat(dr);
  if (!dr || isNaN(d) || d < 1 || d > 12 || Math.abs(d * 4 - Math.round(d * 4)) > 1e-9) return { error: '定時は1〜12の範囲で0.25刻みで入力してください' };
  var entry = { effectiveFrom: ef, client: cl, type: ty, daily: d };
  if (ty === 'RANGE') {
    var u = DLG.querySelector('[data-ct="unitToggle"]').getAttribute('data-value');
    var lr = DLG.querySelector('[data-ct-f="lower"]').value, ur = DLG.querySelector('[data-ct-f="upper"]').value;
    var lo = lr === '' ? null : parseFloat(lr), up = ur === '' ? null : parseFloat(ur);
    if (lo == null && up == null) return { error: '下限または上限のどちらかを入力してください' };
    if (lo != null && up != null && lo > up) return { error: '下限は上限以下にしてください' };
    if (u === 'RATIO') {
      if (lo != null && (lo <= 0 || lo > 100)) return { error: '%は0より大きく100以下で入力してください' };
      if (up != null && (up <= 0 || up > 100)) return { error: '%は0より大きく100以下で入力してください' };
    }
    entry.unit = u; entry.lower = lo; entry.upper = up;
  } else if (ty === 'MIDPOINT') {
    var br = DLG.querySelector('[data-ct-f="base"]').value, ba = parseFloat(br);
    if (!br || isNaN(ba) || ba <= 0) return { error: '基準時間は0より大きい値を入力してください' };
    entry.base = ba;
  } else if (ty === 'BUSINESS_DAYS') {
    var lar = DLG.querySelector('[data-ct-f="lowerAdj"]').value, la = parseFloat(lar);
    if (lar === '' || isNaN(la)) return { error: '下限調整（h）は必須です' };
    var uar = DLG.querySelector('[data-ct-f="upperAdj"]').value;
    entry.lowerAdj = la; entry.upperAdj = uar === '' ? null : parseFloat(uar);
  }
  var editing = DLG.getAttribute('data-editing');
  var h = CT[CU] || [];
  var dup = h.some(function (x) { return x.effectiveFrom === ef && x.effectiveFrom !== editing; });
  if (dup) return { error: '同じ適用開始月の条件があります' };
  return { entry: entry, editing: editing };
}
// ユーザー編集パネルの「契約」セクション（適用中サマリーだけ。履歴・追加は「契約 › メンバー」へ移した）
function rSec(s) {
  var h = CT[CU] || [];
  var c = classify(h, CM);
  var nextFuture = !c.current && c.visible.length ? c.visible[c.visible.length - 1].e : null;
  rs(s.querySelector('[data-ct="summary"]'), c.current, nextFuture);
}
function rAll() {
  document.querySelectorAll('[data-contract-section]').forEach(rSec);
  document.dispatchEvent(new CustomEvent('cn-contracts-changed', { detail: { name: CU } }));
}
function hSave() {
  if (!CU) return;
  var r = vb();
  if (r.error) { se(r.error); return; }
  var h = CT[CU] || (CT[CU] = []);
  if (r.editing) { var i = h.findIndex(function (x) { return x.effectiveFrom === r.editing; }); if (i !== -1) h[i] = r.entry; else h.push(r.entry); }
  else { h.push(r.entry); }
  rAll();
  cf();
}
function hDel() {
  if (!CU) return;
  var editing = DLG.getAttribute('data-editing');
  if (!editing) return;
  if (!window.confirm('この契約条件を削除します。よろしいですか？')) return;
  var h = CT[CU] || [];
  var i = h.findIndex(function (x) { return x.effectiveFrom === editing; });
  if (i !== -1) h.splice(i, 1);
  rAll();
  cf();
}
document.addEventListener('slidewillopen', function (e) {
  if (!e.detail) return;
  var tr = e.detail.trigger;
  if (e.detail.id === 'user-edit') {
    CU = tr && tr.getAttribute ? tr.getAttribute('data-u-name') : null;
    rAll();
    return;
  }
  if (e.detail.id === 'contract-member') {
    CU = tr && tr.getAttribute ? tr.getAttribute('data-m-name') : null;
    document.dispatchEvent(new CustomEvent('cn-contract-member-open', { detail: { name: CU } }));
  }
});
// ユーザー編集パネルの「契約タブで管理 →」リンク: パネルを閉じて契約タブ›メンバーへ切り替え、その人のパネルを開く
document.addEventListener('click', function (e) {
  var link = e.target.closest('[data-ct="manage-link"]');
  if (!link) return;
  e.preventDefault();
  var name = CU;
  if (!name) return;
  if (window.closeSlide) window.closeSlide('user-edit');
  var utab = document.querySelector('[data-utab="contracts"]');
  if (utab) utab.click();
  var uctab = document.querySelector('[data-uctab="members"]');
  if (uctab) uctab.click();
  var row = document.querySelector('[data-member-row][data-m-name="' + name + '"]');
  if (row && window.openSlide) {
    document.dispatchEvent(new CustomEvent('slidewillopen', { detail: { id: 'contract-member', trigger: row } }));
    window.openSlide('contract-member', row);
  }
});
// contract-members.js（契約 › メンバーの一覧・パネル）へ公開する API
window.CNContracts = {
  CT: CT,
  CM: CM,
  ml: ml,
  fn: fn,
  cd: cd,
  TL: TL,
  ga: ga,
  dl: dl,
  rs: rs,
  rh: rh,
  classify: classify,
  durationLabel: durationLabel,
  rangeCell: rangeCell,
  allRows: allRows,
  openAdd: function (trigger) { CS = trigger || null; oa(); },
  openEdit: function (idx, trigger) { CS = trigger || null; oe(idx); }
};
})();
