/* ============================================================
   CrewNest DEMO: 契約条件の共通データ・表記ヘルパー(issue #54 稼働早見表 + 契約タブ追補 + 契約の情報追加モック 3版)
   使い方: <script src="contracts-data.js"></script> を先に読み込み、続けて
   <script src="contracts-form.js"></script>(追加・編集ダイアログ側。本ファイルが作る
   window.CNContracts を参照する)を読み込む(CrewNest Admin.html に追加)。
   本体 src/features/admin/components/ContractSection.tsx・ContractMemberPanel.tsx の
   React 化前の静的再現のうち、本ファイルは契約データ(CT)・種別ラベル(TL)・一覧やパネルの
   表記ヘルパー・ユーザー編集パネルの「契約」セクション(data-contract-section、サマリー表示のみ)の
   再描画を持つ。フォーム(追加・編集ダイアログ)は contracts-form.js が持つ。
   契約の追加・編集・履歴は「契約 › メンバー」パネル(contract-members.js)で行う。
   「契約の情報追加」モック(実アプリ未実装。demo 専用フィールド): 確約期間(committedUntil。
   客先と確約している最終月で、契約は終了しない)・勤務形態(workOnsite/workRemote)・
   単価と単位(unitPrice/unitPriceUnit)・超過/控除(overtimeRate/deductionRate。未入力時は
   単価と上限下限・基準時間からの計算値を表示)・支援費契約(supportFee)・
   プロジェクト継続(continuesPrevious。同じプロジェクトの契約は自動でつながり、プロジェクト名が変わる
   ときだけ「前の契約からの継続として扱う」チェックで明示的につなげるフラグ)。
   待機(プロジェクト未選択)を選ぶと、確約期間より下の欄は隠れ、種別 NONE・定時 8h 固定として保存する。
   ソース: ~/.claude-tools/crew-nest-mock/issue54/fragments/admin-contract.js
   ============================================================ */
(function () {
var CM = '2026-09', CU = null;
var TL = { RANGE: '上限下限', MIDPOINT: '中間', BUSINESS_DAYS: '営業日数連動', NONE: '固定(精算なし)' };
var CT = {
  '鈴木 一郎': [
    { effectiveFrom: '2026-04', committedUntil: '2026-12', client: '株式会社アルファ ／ 基幹刷新PJ', type: 'RANGE', daily: 8, unit: 'HOURS', lower: 140, upper: 180, workOnsite: 3, workRemote: 2, unitPrice: 650000, overtimeRate: 4000, deductionRate: 3500, supportFee: { enabled: false } },
    { effectiveFrom: '2025-10', client: '株式会社アルファ ／ 基幹刷新PJ', type: 'RANGE', daily: 8, unit: 'HOURS', lower: 120, upper: 180 },
    { effectiveFrom: '2027-01', client: '株式会社アルファ ／ 基幹刷新PJ', type: 'MIDPOINT', daily: 8, base: 160 }
  ],
  // 確約が未定(committedUntil 無し)の確認用
  '佐藤 恵子': [{ effectiveFrom: '2026-01', client: 'ベータ商事', type: 'BUSINESS_DAYS', daily: 7.75, lowerAdj: -20, upperAdj: null, workOnsite: 0, workRemote: 5, unitPrice: 600000, overtimeRate: 3800, deductionRate: 3800, supportFee: { enabled: true, company: '株式会社イプシロン', amount: 30000 } }],
  // 確約期間を過ぎている(2026-09 時点で committedUntil が過去)の一覧・パネル表示確認用。
  // 超過/控除は未入力なので、単価 ÷ 基準時間の計算値((計算値)付き)が出る。プロジェクト継続(継続チェック
  // continuesPrevious)確認用に、直前のデルタシステムズの契約からの継続として扱う設定にしている
  '田中 佑樹': [
    { effectiveFrom: '2026-01', client: 'デルタシステムズ', type: 'MIDPOINT', daily: 8, base: 160, unitPrice: 580000 },
    { effectiveFrom: '2026-07', committedUntil: '2026-08', client: 'ガンマ技研', type: 'MIDPOINT', daily: 8, base: 160, unitPrice: 600000, continuesPrevious: true }
  ],
  // 履歴の「11 件以上で折りたたむ」動作確認用。2015-04 から毎年 4 月開始の上限下限契約 12 件(客先はベータ商事)。
  // 直近(2026-04)だけ時間単価(超過/控除の行が出ない確認用)。全件同じプロジェクトなので継続期間は自動で
  // 2015-04 起点までつながる(継続チェックは出ない)
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
    { effectiveFrom: '2026-04', client: 'ベータ商事', type: 'RANGE', daily: 8, unit: 'HOURS', lower: 140, upper: 180, unitPriceUnit: 'HOURLY', unitPrice: 4500 }
  ],
  // 客先が無い(=待機)の一覧・パネル表示確認用。待機では勤務形態・単価は持たない
  '渡辺 さゆり': [{ effectiveFrom: '2025-04', client: '', type: 'NONE', daily: 8 }],
  '小林 直人': []
};
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function fn(n) { return String(Math.round(n * 100) / 100); }
function ml(ym) { var p = ym.split('-'); return p[0] + '年' + parseInt(p[1], 10) + '月'; }
function nm(ym) { var p = ym.split('-'), y = +p[0], m = +p[1] + 1; if (m > 12) { m = 1; y += 1; } return y + '-' + (m < 10 ? '0' + m : m); }
function cd(c) { return c ? c : '待機'; }
// 「適用中」の契約。開始月が当月(CM)以前で一番新しいもの
function ga(h) { var a = null; h.forEach(function (e) { if (e.effectiveFrom <= CM && (!a || e.effectiveFrom > a.effectiveFrom)) a = e; }); return a; }
// 確約期間(committedUntil)の表示情報。未定(無し)なら null(呼び出し側で「未設定」を出す)。
// past: cm(当月)より前=確約期間を過ぎている
function committedInfo(committedUntil, cm) {
  if (!committedUntil) return null;
  return { label: ml(committedUntil) + 'まで', past: committedUntil < cm };
}
// 適用開始月から当月(CM)までの月数(当月を含む)。12か月未満は「Nか月目」、12か月以上は「N年目」/端数があれば「N年Mか月目」。
// 未来の開始月(月数が0以下)は null(一覧・パネルとも表示しない)
function durationLabel(effectiveFrom) {
  var f = effectiveFrom.split('-'), fy = +f[0], fm = +f[1];
  var c = CM.split('-'), cy = +c[0], cm = +c[1];
  var n = (cy - fy) * 12 + (cm - fm) + 1;
  if (n <= 0) return null;
  if (n < 12) return n + 'か月目';
  var y = Math.floor(n / 12), r = n % 12;
  return r === 0 ? (y + '年目') : (y + '年' + r + 'か月目');
}
// 客先(プロジェクト)が同じか(待機同士も同じとみなす)
function sameProject(clientA, clientB) { return (clientA || '') === (clientB || ''); }
// プロジェクト継続の起点(適用開始月)。適用中の契約(ap)から履歴を古い方へ遡り、「直前の契約が同じ
// プロジェクト」または「今見ている契約の continuesPrevious が true」の間はさらに遡る(同じプロジェクトは
// 常に自動でつながる)。止まった契約の開始月を返す(ap が無ければ null)
function projectStart(h, ap) {
  if (!ap) return null;
  var sorted = h.slice().sort(function (x, y) { return x.effectiveFrom.localeCompare(y.effectiveFrom); });
  var idx = sorted.indexOf(ap);
  if (idx === -1) {
    for (var i = 0; i < sorted.length; i++) { if (sorted[i].effectiveFrom === ap.effectiveFrom) { idx = i; break; } }
  }
  if (idx === -1) return ap.effectiveFrom;
  var cur = sorted[idx];
  while (idx > 0) {
    var prev = sorted[idx - 1];
    if (!sameProject(prev.client, cur.client) && cur.continuesPrevious !== true) break;
    cur = prev;
    idx -= 1;
  }
  return cur.effectiveFrom;
}
// 適用開始の表示(フル・「2026年4月から」)。パネルの「適用開始」で使う
function periodFull(from) { return ml(from) + 'から'; }
// 一覧の「期間」セル1行目用(空白なし・「2026年4月から」)
function periodShort(from) { return ml(from) + 'から'; }
// 履歴行の要約用(空白なし・「2026年4月から」)
function historyLabel(from) { return ml(from) + 'から'; }
function yen(v) { return '¥' + Math.round(v).toLocaleString('ja-JP'); }
// 勤務形態(出社/リモート週日数)。両方未入力なら null(呼び出し側で「未設定」を出す)
function workStyleLabel(ap) {
  if (ap.workOnsite == null && ap.workRemote == null) return null;
  var o = fn(ap.workOnsite != null ? ap.workOnsite : 0), r = fn(ap.workRemote != null ? ap.workRemote : 0);
  return '出社 週' + o + '日 ／ リモート 週' + r + '日';
}
function unitPriceLabel(ap) {
  if (ap.unitPrice == null) return null;
  return yen(ap.unitPrice) + (ap.unitPriceUnit === 'HOURLY' ? '／時間' : '／月');
}
// 超過/控除の計算値(B方式)。上限下限は 単価÷上限(超過)/単価÷下限(控除)、中間は 単価÷基準時間(両方同じ値)。
// 上限下限が%単位・営業日数連動(月ごとに変わる)は計算しない
// 端数の丸め(契約ごとに選ぶ。既定は切り捨て)
var ROUNDING_LABEL = { FLOOR: '切り捨て', ROUND: '四捨五入', CEIL: '切り上げ' };
function roundYen(v, rounding) {
  if (rounding === 'CEIL') return Math.ceil(v);
  if (rounding === 'ROUND') return Math.round(v);
  return Math.floor(v);
}
function computedRate(ap, side) {
  if (ap.unitPrice == null) return null;
  var r = ap.rounding || 'FLOOR';
  if (ap.type === 'RANGE') {
    if (ap.unit === 'RATIO') return null;
    var v = side === 'overtime' ? ap.upper : ap.lower;
    return v ? roundYen(ap.unitPrice / v, r) : null;
  }
  if (ap.type === 'MIDPOINT') return ap.base ? roundYen(ap.unitPrice / ap.base, r) : null;
  return null;
}
// 超過/控除の表示。入力値があればそれを使い、無ければ計算値を使って末尾に「(計算値)」を添える。
// 営業日数連動で未入力のときは月ごとに変わる旨の文言。計算も入力も無ければ null(呼び出し側で「未設定」を出す)
function overtimeDeductionLabel(ap) {
  if (ap.type === 'BUSINESS_DAYS' && ap.overtimeRate == null && ap.deductionRate == null) {
    return '月ごとに計算(単価 ÷ その月の上限・下限)';
  }
  var oc = computedRate(ap, 'overtime'), dc = computedRate(ap, 'deduction');
  var ov = ap.overtimeRate != null ? ap.overtimeRate : oc;
  var dv = ap.deductionRate != null ? ap.deductionRate : dc;
  if (ov == null && dv == null) return null;
  var usedCalc = (ap.overtimeRate == null && oc != null) || (ap.deductionRate == null && dc != null);
  var o = ov != null ? yen(ov) + '／h' : '未設定';
  var d = dv != null ? yen(dv) + '／h' : '未設定';
  return o + ' ／ ' + d + (usedCalc ? '(計算値)' : '');
}
// 支援費。ON/OFF の二値なので null は返さない(OFF は「なし」)
function supportFeeLabel(ap) {
  var sf = ap.supportFee;
  if (!sf || !sf.enabled) return 'なし';
  var parts = ['あり'];
  if (sf.company) parts.push(sf.company);
  if (sf.amount != null) parts.push(yen(sf.amount) + '／月');
  return parts.join(' ・ ');
}
// 契約種別に応じた「下限〜上限」相当のラベル・値(NONE は精算なしなのでこの行を出さない)
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
// h(契約履歴)を適用開始月の降順で全件返す(パネルの履歴一覧用。current/past の分類はしない)
function allRows(h) {
  var rows = h.map(function (e, i) { return { e: e, idx: i }; });
  rows.sort(function (a, b) { return b.e.effectiveFrom.localeCompare(a.e.effectiveFrom); });
  return rows;
}
// withDate=false のとき末尾の「○年○月から適用」を付けない(一覧の「現在の契約」列は適用開始月を別列に出すため)
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
// nextFuture: ap が無いときに「N年M月からの契約があります」を出すための直近の未来契約(無ければ null)
function rs(el, ap, nextFuture) {
  if (!ap) {
    if (nextFuture) { el.innerHTML = '<p class="text-xs text-subtle">現在適用中の契約はありません(' + esc(ml(nextFuture.effectiveFrom)) + 'からの契約があります)</p>'; return; }
    el.innerHTML = '<p class="text-xs text-subtle">契約が登録されていません</p>';
    return;
  }
  var l1 = cd(ap.client) + ' ・ ' + TL[ap.type];
  el.innerHTML = '<p class="text-sm font-semibold text-text">' + esc(l1) + '</p><p class="text-xs text-subtle">' + esc(dl(ap)) + '</p>';
}
// rows: allRows()/classify() が返す { e, idx }[](idx は CT[名前] 配列内での本来の位置。編集ボタンの対象解決に使う)
// ap: 適用中の契約(無ければ null)。cm: 当月(渡すと未来の行に「予定」チップを付ける)
function rh(el, rows, ap, cm) {
  if (!rows.length) { el.innerHTML = ''; el.style.display = 'none'; return; }
  el.style.display = '';
  el.innerHTML = rows.map(function (row) {
    var e = row.e;
    var chip = '';
    if (ap && e.effectiveFrom === ap.effectiveFrom) chip = '<span class="rounded-full bg-primary-lightest px-2 py-0.5 text-[10px] font-bold text-primary">適用中</span>';
    else if (cm && e.effectiveFrom > cm) chip = '<span class="rounded-full bg-background px-2 py-0.5 text-[10px] text-subtle">予定</span>';
    return '<div class="flex items-center gap-2 px-3 py-2 text-xs"><span class="shrink-0 text-text font-semibold">' + esc(historyLabel(e.effectiveFrom)) + '</span><span class="min-w-0 flex-1 truncate text-subtle">' + esc(TL[e.type]) + ' ・ ' + esc(cd(e.client)) + '</span>' + chip + '<button type="button" data-ct-edit="' + row.idx + '" class="inline-flex h-8 shrink-0 items-center rounded-full border border-border px-3 text-xs text-subtle hover:bg-black/[0.08]">編集</button></div>';
  }).join('');
}
// current(適用中。無ければ null)と、常時表示すべき visible(current+未来。適用開始月の降順)、
// 折りたたむ past(visible に入らない、current より前の行。適用開始月の降順)に分ける
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
// ユーザー編集パネルの「契約」セクション(適用中サマリーだけ。履歴・追加は「契約 › メンバー」へ移した)
function rSec(s) {
  var h = CT[CU] || [];
  var c = classify(h, CM);
  var nextFuture = !c.current && c.visible.length ? c.visible[c.visible.length - 1].e : null;
  // visible には「current が無いときの全行」が入るため、開始月が当月以前(=未来ではない)行を
  // nextFuture 扱いしない
  if (nextFuture && nextFuture.effectiveFrom <= CM) nextFuture = null;
  rs(s.querySelector('[data-ct="summary"]'), c.current, nextFuture);
}
function rAll() {
  document.querySelectorAll('[data-contract-section]').forEach(rSec);
  document.dispatchEvent(new CustomEvent('cn-contracts-changed', { detail: { name: CU } }));
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
// contract-members.js(契約 › メンバーの一覧・パネル)・contracts-form.js(追加・編集ダイアログ)へ
// 公開する API。openAdd/openEdit は contracts-form.js が読み込み後にこのオブジェクトへ追加する
window.CNContracts = {
  CT: CT,
  CM: CM,
  ml: ml,
  nm: nm,
  fn: fn,
  cd: cd,
  TL: TL,
  ga: ga,
  dl: dl,
  rs: rs,
  rh: rh,
  rAll: rAll,
  classify: classify,
  durationLabel: durationLabel,
  sameProject: sameProject,
  projectStart: projectStart,
  rangeCell: rangeCell,
  allRows: allRows,
  committedInfo: committedInfo,
  periodFull: periodFull,
  periodShort: periodShort,
  historyLabel: historyLabel,
  yen: yen,
  workStyleLabel: workStyleLabel,
  unitPriceLabel: unitPriceLabel,
  computedRate: computedRate,
  overtimeDeductionLabel: overtimeDeductionLabel,
  supportFeeLabel: supportFeeLabel,
  getCU: function () { return CU; }
};
})();
