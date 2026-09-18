/* ============================================================
   CrewNest DEMO: 契約条件の追加・編集ダイアログ(issue #54 稼働早見表 + 契約タブ追補 + 契約の情報追加モック 3版)
   使い方: contracts-data.js の直後に <script src="contracts-form.js"></script> で読み込む
   (CrewNest Admin.html に追加)。データ(CT・CM)と表記ヘルパー(nm・fn・yen・sameProject・
   computedRate・rAll)は contracts-data.js が作る window.CNContracts から参照する(データ側が
   フォーム側に依存しない向きを保つ)。フォームは body 直下のモーダル(PC 中央/モバイル ボトムシート)
   に出す。器の構成は home-card.js の buildDetail() に揃えている。
   ソース: ~/.claude-tools/crew-nest-mock/issue54/fragments/admin-contract.js
   ============================================================ */
(function () {
var CNContracts = window.CNContracts;
var CT = CNContracts.CT, CM = CNContracts.CM;
var DLG = null, CS = null;
var DF = ['6.5', '7', '7.5', '7.75', '8'];
function he() { var er = DLG.querySelector('[data-ct="error"]'); er.textContent = ''; er.style.display = 'none'; }
function se(m) { var er = DLG.querySelector('[data-ct="error"]'); er.textContent = m; er.style.display = ''; }
function gv(t) {
  DLG.querySelectorAll('[data-ct-group]').forEach(function (g) { g.style.display = g.getAttribute('data-ct-group') === t ? '' : 'none'; });
  uo();
  refreshODPreview();
}
// 超過・控除ブロックの表示切替。固定(精算なし)と時間単価(精算幅が無い)のときは出さない
function uo() {
  var ty = DLG.querySelector('[data-ct-f="type"]').value;
  var unit = DLG.querySelector('[data-ct-f="unitPriceUnit"]').value;
  DLG.querySelector('[data-ct-group-not="NONE"]').style.display = (ty === 'NONE' || unit === 'HOURLY') ? 'none' : '';
}
// フォームの現在値から computedRate() に渡す ap 相当のオブジェクトを作る
function formToAp() {
  function num(sel) { var s = DLG.querySelector(sel).value; return s === '' ? null : parseFloat(s); }
  return {
    type: DLG.querySelector('[data-ct-f="type"]').value,
    unit: DLG.querySelector('[data-ct="unitToggle"]').getAttribute('data-value'),
    unitPrice: num('[data-ct-f="unitPrice"]'),
    rounding: DLG.querySelector('[data-ct-f="rounding"]').value,
    upper: num('[data-ct-f="upper"]'),
    lower: num('[data-ct-f="lower"]'),
    base: num('[data-ct-f="base"]')
  };
}
// 超過・控除の計算値プレビュー。mode: 'no-price'(単価未入力)/'business-days'/'ratio'(月ごとに計算)/'ok'(oc・dc に計算値)
function odCalc() {
  var tmp = formToAp();
  if (tmp.unitPrice == null) return { mode: 'no-price' };
  if (tmp.type === 'BUSINESS_DAYS') return { mode: 'business-days' };
  if (tmp.type === 'RANGE' && tmp.unit === 'RATIO') return { mode: 'ratio' };
  if (tmp.type !== 'RANGE' && tmp.type !== 'MIDPOINT') return { mode: 'no-price' };
  return { mode: 'ok', oc: CNContracts.computedRate(tmp, 'overtime'), dc: CNContracts.computedRate(tmp, 'deduction') };
}
function refreshODPreview() {
  var r = odCalc();
  var el = DLG.querySelector('[data-ct="odComputed"]'), note = DLG.querySelector('[data-ct="odNote"]');
  if (r.mode === 'no-price') { el.textContent = '単価を入力すると計算します'; note.style.display = 'none'; }
  else if (r.mode === 'business-days') { el.textContent = '月ごとに計算(単価 ÷ その月の上限・下限)'; note.style.display = 'none'; }
  else if (r.mode === 'ratio') { el.textContent = '% 指定は月ごとに計算'; note.style.display = 'none'; }
  else {
    el.textContent = '超過 ' + (r.oc != null ? CNContracts.yen(r.oc) + '／h' : '未設定') + ' ／ 控除 ' + (r.dc != null ? CNContracts.yen(r.dc) + '／h' : '未設定');
    note.style.display = '';
  }
}
function setEf(ym) { var p = ym.split('-'); DLG.querySelector('[data-ct-f="effYear"]').value = p[0]; DLG.querySelector('[data-ct-f="effMonth"]').value = p[1]; }
function getEf() { return DLG.querySelector('[data-ct-f="effYear"]').value + '-' + DLG.querySelector('[data-ct-f="effMonth"]').value; }
// 確約期間(committedUntil)。年 Select が「未定」(空文字)のときは null
function setEt(ym) {
  var y = DLG.querySelector('[data-ct-f="endYear"]'), m = DLG.querySelector('[data-ct-f="endMonth"]');
  if (!ym) { y.value = ''; m.value = '01'; } else { var p = ym.split('-'); y.value = p[0]; m.value = p[1]; }
  seh();
}
function getEt() {
  var y = DLG.querySelector('[data-ct-f="endYear"]').value;
  return y ? (y + '-' + DLG.querySelector('[data-ct-f="endMonth"]').value) : null;
}
// 確約期間の年が「未定」のとき月 Select を隠す
function seh() { var y = DLG.querySelector('[data-ct-f="endYear"]').value; DLG.querySelector('[data-ct-f="endMonth"]').style.display = y ? '' : 'none'; }
function dv() { var sel = DLG.querySelector('[data-ct-f="daily"]'), c = DLG.querySelector('[data-ct-f="dailyCustom"]'); c.style.display = sel.value === 'custom' ? '' : 'none'; }
function su(u) {
  var tg = DLG.querySelector('[data-ct="unitToggle"]'); tg.setAttribute('data-value', u);
  tg.querySelectorAll('[data-ct-unit]').forEach(function (b) {
    var a = b.getAttribute('data-ct-unit') === u;
    b.setAttribute('aria-pressed', a ? 'true' : 'false');
    b.className = 'flex-1 rounded-full border py-1.5 text-xs font-medium ' + (a ? 'border-primary bg-primary-lightest text-primary' : 'border-border text-subtle');
  });
  refreshODPreview();
}
function fd(v) {
  var sel = DLG.querySelector('[data-ct-f="daily"]'), c = DLG.querySelector('[data-ct-f="dailyCustom"]'), str = CNContracts.fn(v);
  if (DF.indexOf(str) !== -1) { sel.value = str; c.style.display = 'none'; c.value = ''; }
  else { sel.value = 'custom'; c.style.display = ''; c.value = str; }
}
// 「前の契約からの継続として扱う」スイッチ(見た目は支援費スイッチと同じ)
function scp(on) {
  var btn = DLG.querySelector('[data-ct-f="continuesPrevious"]');
  btn.setAttribute('aria-checked', on ? 'true' : 'false');
  var knob = btn.querySelector('span');
  knob.classList.toggle('translate-x-0', !on);
  knob.classList.toggle('translate-x-[18px]', on);
  btn.classList.toggle('bg-primary', on);
  btn.classList.toggle('bg-border', !on);
}
function cpOn() { return DLG.querySelector('[data-ct-f="continuesPrevious"]').getAttribute('aria-checked') === 'true'; }
// 支援費契約スイッチ。demo の客先パネル data-ce="owncal" と同じ見た目(src/components/ui/Switch.tsx 相当)
function ssf(on) {
  var btn = DLG.querySelector('[data-ct-f="supportFee"]');
  btn.setAttribute('aria-checked', on ? 'true' : 'false');
  var knob = btn.querySelector('span');
  knob.classList.toggle('translate-x-0', !on);
  knob.classList.toggle('translate-x-[18px]', on);
  btn.classList.toggle('bg-primary', on);
  btn.classList.toggle('bg-border', !on);
  DLG.querySelector('[data-ct="supportFeeFields"]').style.display = on ? '' : 'none';
}
// 契約書の額を入力するスイッチ。ON のときだけ超過・控除の2欄を出す(見た目は他のスイッチと同じ)
function sod(on) {
  var btn = DLG.querySelector('[data-ct-f="odOverride"]');
  btn.setAttribute('aria-checked', on ? 'true' : 'false');
  var knob = btn.querySelector('span');
  knob.classList.toggle('translate-x-0', !on);
  knob.classList.toggle('translate-x-[18px]', on);
  btn.classList.toggle('bg-primary', on);
  btn.classList.toggle('bg-border', !on);
  DLG.querySelector('[data-ct="odOverrideFields"]').style.display = on ? '' : 'none';
}
// プロジェクトが「待機」(空)のときは確約期間以下(確約期間〜支援費)を隠し、注釈を出す
function updateStandby() {
  var standby = DLG.querySelector('[data-ct-f="client"]').value === '';
  // 待機の注釈は出さない(依頼者の指示。待機のフォームは適用開始月とプロジェクトだけ)
  DLG.querySelector('[data-ct="standbyNote"]').style.display = 'none';
  DLG.querySelector('[data-ct="committedBlock"]').style.display = standby ? 'none' : '';
  DLG.querySelector('[data-ct="belowCommitted"]').style.display = standby ? 'none' : '';
}
// 開始月がこの契約(ef)より前で最も近い契約(編集中の行 editingEf 自身は除く)
function findPrevEntry(ef, editingEf) {
  var h = CT[CNContracts.getCU()] || [];
  var best = null;
  h.forEach(function (x) {
    if (editingEf && x.effectiveFrom === editingEf) return;
    if (x.effectiveFrom < ef && (!best || x.effectiveFrom > best.effectiveFrom)) best = x;
  });
  return best;
}
// 直前の契約が別のプロジェクト(待機を含む)のときだけ「前の契約からの継続として扱う」チェック行を出す。
// 直前が同じプロジェクトなら自動でつながるためチェック行は出さない
function updatePrevProjectCheck() {
  var ef = getEf();
  var cl = DLG.querySelector('[data-ct-f="client"]').value;
  var editing = DLG.getAttribute('data-editing');
  var prev = findPrevEntry(ef, editing);
  // 待機(cl が空)ではトグルを出さない(待機の契約には継続の印を付けられない)
  var diff = !!prev && cl !== '' && !CNContracts.sameProject(prev.client, cl);
  DLG.querySelector('[data-ct="continuesWrap"]').style.display = diff ? '' : 'none';
  if (!diff) scp(false);
}
var YEAR_OPTS = ['2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028'].map(function (y) { return '<option value="' + y + '">' + y + '年</option>'; }).join('');
var MONTH_OPTS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(function (m) { return '<option value="' + m + '">' + parseInt(m, 10) + '月</option>'; }).join('');
// モーダルの器(body 直下に 1 つだけ)。PC 中央/モバイル ボトムシートの切り替えは home-card.js の buildDetail() と同じ構成
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
            '<select data-ct-f="effYear" aria-label="適用開始月(年)" class="w-full rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">' + YEAR_OPTS + '</select>' +
            '<select data-ct-f="effMonth" aria-label="適用開始月(月)" class="w-full rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">' + MONTH_OPTS + '</select>' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<label class="mb-2 block text-[10.5px] font-semibold uppercase tracking-wide text-subtle">プロジェクト</label>' +
          '<select data-ct-f="client" class="w-full rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">' +
            '<option value="">待機</option>' +
            '<option value="株式会社アルファ ／ 基幹刷新PJ">株式会社アルファ ／ 基幹刷新PJ</option>' +
            '<option value="株式会社アルファ ／ 保守PJ">株式会社アルファ ／ 保守PJ</option>' +
            '<option value="ベータ商事">ベータ商事</option>' +
            '<option value="ガンマ技研">ガンマ技研</option>' +
            '<option value="デルタシステムズ">デルタシステムズ</option>' +
          '</select>' +
          '<div data-ct="continuesWrap" style="display:none" class="mt-2">' +
            '<div class="flex items-center justify-between">' +
              '<span class="text-sm text-text">前の契約からの継続として扱う</span>' +
              '<button type="button" role="switch" aria-checked="false" aria-label="前の契約からの継続として扱う" data-ct-f="continuesPrevious" class="relative inline-flex h-[22px] w-10 shrink-0 rounded-full border-2 border-transparent bg-border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">' +
                '<span class="pointer-events-none inline-block h-[18px] w-[18px] translate-x-0 rounded-full bg-background-light shadow-sm transition-transform duration-200"></span>' +
              '</button>' +
            '</div>' +
            '<p class="mt-1 text-[11px] text-subtle">プロジェクト名が変わっても同じ案件の続きなら ON にします。同じプロジェクトの契約は自動でつながります</p>' +
          '</div>' +
        '</div>' +
        '<div data-ct="committedBlock">' +
          '<label class="mb-2 block text-[10.5px] font-semibold uppercase tracking-wide text-subtle">確約期間</label>' +
          '<div class="grid grid-cols-2 gap-2">' +
            '<select data-ct-f="endYear" aria-label="確約期間(年)" class="w-full rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"><option value="">未定</option>' + YEAR_OPTS + '</select>' +
            '<select data-ct-f="endMonth" aria-label="確約期間(月)" class="w-full rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">' + MONTH_OPTS + '</select>' +
          '</div>' +
          '<p class="mt-2 text-[11px] text-subtle">客先と確約している最終月。過ぎても契約は続きます</p>' +
        '</div>' +
        '<div data-ct="standbyNote" style="display:none">' +
          '<p class="text-xs text-subtle">待機中は定時 8h の固定(精算なし)として扱います</p>' +
        '</div>' +
        '<div data-ct="belowCommitted" class="space-y-3">' +
        '<div>' +
          '<label class="mb-2 block text-[10.5px] font-semibold uppercase tracking-wide text-subtle">契約種別</label>' +
          '<select data-ct-f="type" class="w-full rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">' +
            '<option value="RANGE">上限下限</option>' +
            '<option value="MIDPOINT">中間</option>' +
            '<option value="BUSINESS_DAYS">営業日数連動</option>' +
            '<option value="NONE">固定(精算なし)</option>' +
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
              '<span class="mb-1 block text-[10px] text-subtle">下限調整(h)</span>' +
              '<input type="number" data-ct-f="lowerAdj" value="-20" class="w-full rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">' +
            '</div>' +
            '<div>' +
              '<span class="mb-1 block text-[10px] text-subtle">上限調整(h、任意)</span>' +
              '<input type="number" data-ct-f="upperAdj" class="w-full rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">' +
            '</div>' +
          '</div>' +
          '<p class="text-[11px] text-subtle">客先の営業日数 × 定時 に足した値が下限と上限になります</p>' +
        '</div>' +
        '<div data-ct-group="NONE" class="space-y-2">' +
          '<p class="text-xs text-subtle">精算なし。ホームの「プロジェクト」カードには予定稼働・有休・見込み稼働が出ます</p>' +
        '</div>' +
        '<div>' +
          '<label class="mb-2 block text-[10.5px] font-semibold uppercase tracking-wide text-subtle">出社／リモート(週あたりの日数)</label>' +
          '<div class="grid grid-cols-2 gap-2">' +
            '<div>' +
              '<span class="mb-1 block text-[10px] text-subtle">出社</span>' +
              '<input type="number" min="0" max="7" step="0.5" data-ct-f="workOnsite" class="w-full rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">' +
            '</div>' +
            '<div>' +
              '<span class="mb-1 block text-[10px] text-subtle">リモート</span>' +
              '<input type="number" min="0" max="7" step="0.5" data-ct-f="workRemote" class="w-full rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<label class="mb-2 block text-[10.5px] font-semibold uppercase tracking-wide text-subtle">単価</label>' +
          '<div class="flex items-center gap-2">' +
            '<input type="number" min="0" data-ct-f="unitPrice" class="w-full rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">' +
            '<select data-ct-f="unitPriceUnit" aria-label="単価の単位" class="w-28 shrink-0 rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">' +
              '<option value="MONTHLY">円／月</option>' +
              '<option value="HOURLY">円／時間</option>' +
            '</select>' +
          '</div>' +
        '</div>' +
        '<div data-ct-group-not="NONE" class="space-y-3">' +
          '<div>' +
            '<span class="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-subtle">超過・控除</span>' +
            '<div class="flex items-center justify-between gap-2">' +
              '<p data-ct="odComputed" class="min-w-0 text-sm text-text"></p>' +
              '<select data-ct-f="rounding" aria-label="端数" class="w-28 shrink-0 rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">' +
                '<option value="FLOOR">切り捨て</option><option value="ROUND">四捨五入</option><option value="CEIL">切り上げ</option>' +
              '</select>' +
            '</div>' +
            '<p data-ct="odNote" class="mt-1 text-[11px] text-subtle">単価 ÷ 上限時間、単価 ÷ 下限時間</p>' +
          '</div>' +
          '<div class="flex items-center justify-between">' +
            '<span class="text-sm text-text">契約書の額を入力する</span>' +
            '<button type="button" role="switch" aria-checked="false" aria-label="契約書の額を入力する" data-ct-f="odOverride" class="relative inline-flex h-[22px] w-10 shrink-0 rounded-full border-2 border-transparent bg-border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">' +
              '<span class="pointer-events-none inline-block h-[18px] w-[18px] translate-x-0 rounded-full bg-background-light shadow-sm transition-transform duration-200"></span>' +
            '</button>' +
          '</div>' +
          '<div data-ct="odOverrideFields" style="display:none" class="grid grid-cols-2 gap-2">' +
            '<div>' +
              '<span class="mb-1 block text-[10px] text-subtle">超過金額(円／時間)</span>' +
              '<input type="number" min="0" data-ct-f="overtimeRate" class="w-full rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">' +
            '</div>' +
            '<div>' +
              '<span class="mb-1 block text-[10px] text-subtle">控除金額(円／時間)</span>' +
              '<input type="number" min="0" data-ct-f="deductionRate" class="w-full rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<div class="flex items-center justify-between">' +
            '<span class="text-sm text-text">支援費契約</span>' +
            '<button type="button" role="switch" aria-checked="false" aria-label="支援費契約" data-ct-f="supportFee" class="relative inline-flex h-[22px] w-10 shrink-0 rounded-full border-2 border-transparent bg-border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">' +
              '<span class="pointer-events-none inline-block h-[18px] w-[18px] translate-x-0 rounded-full bg-background-light shadow-sm transition-transform duration-200"></span>' +
            '</button>' +
          '</div>' +
          '<div data-ct="supportFeeFields" style="display:none" class="mt-2 space-y-2">' +
            '<div>' +
              '<span class="mb-1 block text-[10px] text-subtle">契約先</span>' +
              '<input type="text" data-ct-f="supportFeeCompany" class="w-full rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">' +
            '</div>' +
            '<div>' +
              '<span class="mb-1 block text-[10px] text-subtle">金額(円／月)</span>' +
              '<input type="number" min="0" data-ct-f="supportFeeAmount" class="w-full rounded-lg border border-border bg-background-light px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">' +
            '</div>' +
          '</div>' +
        '</div>' +
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
    var odBtn = e.target.closest('[data-ct-f="odOverride"]');
    if (odBtn) {
      var turningOn = odBtn.getAttribute('aria-checked') !== 'true';
      sod(turningOn);
      if (turningOn) {
        var r = odCalc();
        DLG.querySelector('[data-ct-f="overtimeRate"]').value = (r.mode === 'ok' && r.oc != null) ? r.oc : '';
        DLG.querySelector('[data-ct-f="deductionRate"]').value = (r.mode === 'ok' && r.dc != null) ? r.dc : '';
      }
      return;
    }
    var sfBtn = e.target.closest('[data-ct-f="supportFee"]');
    if (sfBtn) { ssf(sfBtn.getAttribute('aria-checked') !== 'true'); return; }
    var cpBtn = e.target.closest('[data-ct-f="continuesPrevious"]');
    if (cpBtn) { scp(!cpOn()); return; }
  });
  wrap.addEventListener('change', function (e) {
    if (e.target.matches('[data-ct-f="type"]')) { gv(e.target.value); return; }
    if (e.target.matches('[data-ct-f="daily"]')) { dv(); return; }
    if (e.target.matches('[data-ct-f="endYear"]')) { seh(); return; }
    if (e.target.matches('[data-ct-f="unitPriceUnit"]')) { uo(); refreshODPreview(); return; }
    if (e.target.matches('[data-ct-f="rounding"]')) { refreshODPreview(); return; }
    if (e.target.matches('[data-ct-f="client"]')) { updateStandby(); updatePrevProjectCheck(); return; }
    if (e.target.matches('[data-ct-f="effYear"],[data-ct-f="effMonth"]')) { updatePrevProjectCheck(); return; }
  });
  wrap.addEventListener('input', function (e) {
    if (e.target.matches('[data-ct-f="unitPrice"],[data-ct-f="lower"],[data-ct-f="upper"],[data-ct-f="base"]')) refreshODPreview();
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
  setEf(CNContracts.nm(CM));
  setEt(null);
  DLG.querySelector('[data-ct-f="client"]').value = '';
  scp(false);
  DLG.querySelector('[data-ct-f="type"]').value = 'RANGE';
  fd(8); su('HOURS');
  DLG.querySelector('[data-ct-f="lower"]').value = '140';
  DLG.querySelector('[data-ct-f="upper"]').value = '180';
  DLG.querySelector('[data-ct-f="base"]').value = '160';
  DLG.querySelector('[data-ct-f="lowerAdj"]').value = '-20';
  DLG.querySelector('[data-ct-f="upperAdj"]').value = '';
  DLG.querySelector('[data-ct-f="workOnsite"]').value = '';
  DLG.querySelector('[data-ct-f="workRemote"]').value = '';
  DLG.querySelector('[data-ct-f="unitPrice"]').value = '';
  DLG.querySelector('[data-ct-f="unitPriceUnit"]').value = 'MONTHLY';
  DLG.querySelector('[data-ct-f="rounding"]').value = 'FLOOR';
  DLG.querySelector('[data-ct-f="overtimeRate"]').value = '';
  DLG.querySelector('[data-ct-f="deductionRate"]').value = '';
  sod(false);
  DLG.querySelector('[data-ct-f="supportFeeCompany"]').value = '';
  DLG.querySelector('[data-ct-f="supportFeeAmount"]').value = '';
  ssf(false);
  gv('RANGE');
  // 直近の契約（適用開始月が最新）があれば丸ごと複製し、適用開始月だけ「直近の翌月」か「来月」の遅い方にする
  // （条件の追加は前の契約の一部を変える場面が大半。依頼者の指示 2026-09-16）
  var latest = null;
  (CT[CNContracts.getCU()] || []).forEach(function (x) { if (!latest || x.effectiveFrom > latest.effectiveFrom) latest = x; });
  if (latest) {
    fillFrom(latest);
    var next = CNContracts.nm(latest.effectiveFrom);
    setEf(next > CNContracts.nm(CM) ? next : CNContracts.nm(CM));
    gv(latest.type);
  }
  updateStandby();
  updatePrevProjectCheck();
  scp(false);
  DLG.querySelector('[data-ct="delete"]').style.display = 'none';
  he();
  DLG.hidden = false;
  DLG.querySelector('[role="dialog"]').focus();
}
function oe(idx) {
  var h = CT[CNContracts.getCU()] || [], e = h[idx]; if (!e) return;
  if (!DLG) DLG = buildDialog();
  DLG.setAttribute('data-editing', e.effectiveFrom);
  DLG.querySelector('[data-ct="title"]').textContent = '契約条件を編集';
  setEf(e.effectiveFrom);
  fillFrom(e);
  gv(e.type);
  updateStandby();
  updatePrevProjectCheck();
  scp(!!e.continuesPrevious);
  DLG.querySelector('[data-ct="delete"]').style.display = '';
  he();
  DLG.hidden = false;
  DLG.querySelector('[role="dialog"]').focus();
}
// 契約 e の内容（適用開始月以外）をフォームに入れる。編集（oe）と、直近の契約を複製する追加（oa）で共用
function fillFrom(e) {
  setEt(e.committedUntil || null);
  DLG.querySelector('[data-ct-f="client"]').value = e.client || '';
  DLG.querySelector('[data-ct-f="type"]').value = e.type;
  fd(e.daily); su(e.unit || 'HOURS');
  DLG.querySelector('[data-ct-f="lower"]').value = e.lower != null ? CNContracts.fn(e.lower) : '';
  DLG.querySelector('[data-ct-f="upper"]').value = e.upper != null ? CNContracts.fn(e.upper) : '';
  DLG.querySelector('[data-ct-f="base"]').value = e.base != null ? CNContracts.fn(e.base) : '160';
  DLG.querySelector('[data-ct-f="lowerAdj"]').value = e.lowerAdj != null ? CNContracts.fn(e.lowerAdj) : '-20';
  DLG.querySelector('[data-ct-f="upperAdj"]').value = e.upperAdj != null ? CNContracts.fn(e.upperAdj) : '';
  DLG.querySelector('[data-ct-f="workOnsite"]').value = e.workOnsite != null ? CNContracts.fn(e.workOnsite) : '';
  DLG.querySelector('[data-ct-f="workRemote"]').value = e.workRemote != null ? CNContracts.fn(e.workRemote) : '';
  DLG.querySelector('[data-ct-f="unitPrice"]').value = e.unitPrice != null ? e.unitPrice : '';
  DLG.querySelector('[data-ct-f="unitPriceUnit"]').value = e.unitPriceUnit || 'MONTHLY';
  DLG.querySelector('[data-ct-f="rounding"]').value = e.rounding || 'FLOOR';
  DLG.querySelector('[data-ct-f="overtimeRate"]').value = e.overtimeRate != null ? e.overtimeRate : '';
  DLG.querySelector('[data-ct-f="deductionRate"]').value = e.deductionRate != null ? e.deductionRate : '';
  sod(e.overtimeRate != null || e.deductionRate != null);
  var sf = e.supportFee || {};
  DLG.querySelector('[data-ct-f="supportFeeCompany"]').value = sf.company || '';
  DLG.querySelector('[data-ct-f="supportFeeAmount"]').value = sf.amount != null ? sf.amount : '';
  ssf(!!sf.enabled);
}
function rd() { var sel = DLG.querySelector('[data-ct-f="daily"]'); return sel.value === 'custom' ? DLG.querySelector('[data-ct-f="dailyCustom"]').value : sel.value; }
function vb() {
  var ef = getEf();
  var et = getEt();
  if (et && et < ef) return { error: '確約期間は適用開始月以降にしてください' };
  var cl = DLG.querySelector('[data-ct-f="client"]').value;
  var editing = DLG.getAttribute('data-editing');
  var h = CT[CNContracts.getCU()] || [];
  var dup = h.some(function (x) { return x.effectiveFrom === ef && x.effectiveFrom !== editing; });
  if (dup) return { error: '同じ適用開始月の条件があります' };
  var continuesPrevious = cpOn();
  var entry;
  if (cl === '') {
    // 待機: 種別 NONE・定時 8h 固定で保存し、他の欄は空にする
    entry = { effectiveFrom: ef, committedUntil: et, client: '', type: 'NONE', daily: 8, workOnsite: null, workRemote: null, unitPrice: null, unitPriceUnit: null, overtimeRate: null, deductionRate: null, supportFee: { enabled: false } };
  } else {
    var ty = DLG.querySelector('[data-ct-f="type"]').value;
    var dr = rd(), d = parseFloat(dr);
    if (!dr || isNaN(d) || d < 1 || d > 12 || Math.abs(d * 4 - Math.round(d * 4)) > 1e-9) return { error: '定時は1〜12の範囲で0.25刻みで入力してください' };
    entry = { effectiveFrom: ef, committedUntil: et, client: cl, type: ty, daily: d };
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
      if (lar === '' || isNaN(la)) return { error: '下限調整(h)は必須です' };
      var uar = DLG.querySelector('[data-ct-f="upperAdj"]').value;
      entry.lowerAdj = la; entry.upperAdj = uar === '' ? null : parseFloat(uar);
    }
    var woStr = DLG.querySelector('[data-ct-f="workOnsite"]').value, wrStr = DLG.querySelector('[data-ct-f="workRemote"]').value;
    entry.workOnsite = woStr === '' ? null : parseFloat(woStr);
    entry.workRemote = wrStr === '' ? null : parseFloat(wrStr);
    var upStr = DLG.querySelector('[data-ct-f="unitPrice"]').value;
    entry.unitPrice = upStr === '' ? null : parseFloat(upStr);
    var upu = DLG.querySelector('[data-ct-f="unitPriceUnit"]').value;
    entry.unitPriceUnit = upu;
    entry.rounding = DLG.querySelector('[data-ct-f="rounding"]').value;
    if (ty !== 'NONE' && upu !== 'HOURLY') {
      var odOn = DLG.querySelector('[data-ct-f="odOverride"]').getAttribute('aria-checked') === 'true';
      if (odOn) {
        var orStr = DLG.querySelector('[data-ct-f="overtimeRate"]').value, drStr = DLG.querySelector('[data-ct-f="deductionRate"]').value;
        entry.overtimeRate = orStr === '' ? null : parseFloat(orStr);
        entry.deductionRate = drStr === '' ? null : parseFloat(drStr);
      } else {
        entry.overtimeRate = null; entry.deductionRate = null;
      }
    } else {
      entry.overtimeRate = null; entry.deductionRate = null;
    }
    var sfOn = DLG.querySelector('[data-ct-f="supportFee"]').getAttribute('aria-checked') === 'true';
    if (sfOn) {
      var sfAmountStr = DLG.querySelector('[data-ct-f="supportFeeAmount"]').value;
      entry.supportFee = { enabled: true, company: DLG.querySelector('[data-ct-f="supportFeeCompany"]').value, amount: sfAmountStr === '' ? null : parseFloat(sfAmountStr) };
    } else {
      entry.supportFee = { enabled: false };
    }
  }
  if (continuesPrevious) entry.continuesPrevious = true;
  return { entry: entry, editing: editing };
}
function hSave() {
  if (!CNContracts.getCU()) return;
  var r = vb();
  if (r.error) { se(r.error); return; }
  var cu = CNContracts.getCU();
  var h = CT[cu] || (CT[cu] = []);
  if (r.editing) { var i = h.findIndex(function (x) { return x.effectiveFrom === r.editing; }); if (i !== -1) h[i] = r.entry; else h.push(r.entry); }
  else { h.push(r.entry); }
  CNContracts.rAll();
  cf();
}
function hDel() {
  if (!CNContracts.getCU()) return;
  var editing = DLG.getAttribute('data-editing');
  if (!editing) return;
  if (!window.confirm('この契約条件を削除します。よろしいですか?')) return;
  var h = CT[CNContracts.getCU()] || [];
  var i = h.findIndex(function (x) { return x.effectiveFrom === editing; });
  if (i !== -1) h.splice(i, 1);
  CNContracts.rAll();
  cf();
}
// contract-members.js から呼ばれる追加・編集の入口。contracts-data.js が作った window.CNContracts に追加する
window.CNContracts.openAdd = function (trigger) { CS = trigger || null; oa(); };
window.CNContracts.openEdit = function (idx, trigger) { CS = trigger || null; oe(idx); };
})();
