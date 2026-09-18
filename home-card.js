/* ============================================================
   CrewNest DEMO: 今月の稼働カード（ホーム。issue #54 稼働早見表 + 契約の情報追加モック）
   使い方: <script src="home-card.js"></script>（CrewNest Home.html の badges.js の後に追加）
   本体 src/features/utilization/ の React 化前の静的再現。カードの状態は "ok" 固定。
   「契約の情報追加」モック（実アプリ未実装。demo 専用）: 予定稼働などの既存 dl の下に「契約」見出し＋
   契約更新・勤務形態・単価・精算単位・超過／控除の dl を追加する（先頭の sinceLabel 行はそのまま。契約更新は未定なら
   行を出さない。超過／控除は時間単価のときは行を出さない）。
   ソース: ~/.claude-tools/crew-nest-mock/issue54/fragments/home-card.js
   ============================================================ */
(function () {
  // 状態ごとの表示値。card = カードの 3 行目、detail = タップで開く詳細
  var UTIL_MOCK_STATES = {
    ok: {
      clientLabel: "株式会社アルファ ／ 基幹刷新PJ ・ 上限下限 120〜180時間",
      // プロジェクト継続の起点(鈴木は2025-10に同じプロジェクトの契約があるためそこから数える)
      sinceLabel: "2025年10月から ・ 1年目",
      restDays: "4.0", restHours: "32時間",
      plannedNote: "営業日 19日 × 8時間", planned: "152時間", leave: "0時間", expected: "152時間",
      limitLabel: "精算下限", limitNote: "上限 180時間", limit: "120時間",
      // approx: 有休データと突合できない人。有休 0 で計算し、カードに「概算」チップと詳細に注意を出す
      status: null, missing: false, approx: true, importedAt: "有休データ: 9/8 取込",
      committed: "2026年12月まで契約済み",
      workStyle: "出社 週3日 ／ リモート 週2日",
      unitPrice: "¥650,000／月",
      settlementUnit: "15分",
      overtimeDeduction: "¥4,000／時間 ／ ¥3,500／時間",
    },
  };
  var current = "ok";

  function q(root, field) { return root.querySelector('[data-util-field="' + field + '"]'); }
  function setText(root, field, value) { var el = q(root, field); if (el && value != null) el.textContent = value; }

  // カード: 見出し・客先ラベル・3 行目（休める日数 ／ 状態文 ／ 突合不可）だけ
  function applyCard(card, s) {
    var headline = q(card, "headline"), statusLine = q(card, "statusLine");
    headline.hidden = !!s.status;
    statusLine.hidden = !s.status;
    var chip = q(card, "approxChip"); if (chip) chip.hidden = !s.approx;
    if (s.status) statusLine.textContent = s.status;
    else { setText(card, "restDays", s.restDays); setText(card, "restHours", s.restHours); }
    setText(card, "sinceLabel", s.sinceLabel);
  }

  // 詳細（PC: 中央モーダル ／ モバイル: ボトムシート）。両方 1 つの DOM で、md ブレークポイントで器のクラスを切り替える
  function buildDetail() {
    var wrap = document.createElement("div");
    wrap.id = "util-detail";
    wrap.hidden = true;
    wrap.innerHTML =
      '<div data-util-close class="fixed inset-0 z-[95] bg-black/50"></div>' +
      '<div role="dialog" aria-modal="true" aria-labelledby="util-detail-title" class="fixed z-[95] flex flex-col bg-background-light shadow-md outline-none ' +
        'inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl pb-[env(safe-area-inset-bottom)] ' +
        'md:inset-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:pb-0">' +
        '<div class="mx-auto mt-2 h-1.5 w-12 shrink-0 rounded-full bg-border md:hidden"></div>' +
        '<div class="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">' +
          '<h2 id="util-detail-title" class="flex items-center gap-2 text-[15px] font-bold text-text"><svg viewBox="0 -960 960 960" width="20" height="20" fill="currentColor" class="text-primary" aria-hidden="true"><path d="M160-200v-440 440-15 15Zm0 80q-33 0-56.5-23.5T80-200v-440q0-33 23.5-56.5T160-720h160v-80q0-33 23.5-56.5T400-880h160q33 0 56.5 23.5T640-800v80h160q33 0 56.5 23.5T880-640v171q-18-13-38-22.5T800-508v-132H160v440h283q3 21 9 41t15 39H160Zm240-600h160v-80H400v80ZM720-40q-83 0-141.5-58.5T520-240q0-83 58.5-141.5T720-440q83 0 141.5 58.5T920-240q0 83-58.5 141.5T720-40Zm20-208v-112h-40v128l86 86 28-28-74-74Z"/></svg>プロジェクト</h2>' +
          '<button type="button" data-util-close aria-label="閉じる" class="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full text-subtle transition-colors hover:bg-black/[0.08]"><svg viewBox="0 -960 960 960" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M256-200 200-256l224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"></path></svg></button>' +
        '</div>' +
        '<div class="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">' +
          '<div class="space-y-0.5"><p class="text-xs text-subtle" data-util-field="clientLabel"></p><p class="text-xs text-subtle" data-util-field="sinceLabel"></p></div>' +
          '<p class="text-sm text-text" data-util-field="headline">下限まで あと <span class="text-lg font-bold text-primary" data-util-field="restDays"></span> 日（<span data-util-field="restHours"></span>）</p>' +
          '<p class="text-sm text-danger" data-util-field="missingLine" hidden>有休データと突合できません。社員番号の登録を管理者に確認してください</p>' +
          '<p class="rounded-lg border border-warning-border bg-warning-surface px-3 py-2 text-xs text-warning" data-util-field="approxLine" hidden>有休を差し引かない概算です</p>' +
          '<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm" data-util-field="details">' +
            '<dt class="text-subtle">予定稼働</dt><dd class="flex items-baseline justify-end gap-2 text-text"><span class="text-xs text-subtle" data-util-field="plannedNote"></span><span class="tabular-nums" data-util-field="planned"></span></dd>' +
            '<dt class="text-subtle">有休</dt><dd class="text-right text-text tabular-nums" data-util-field="leave"></dd>' +
            '<dt class="text-subtle">見込み稼働</dt><dd class="text-right text-text tabular-nums" data-util-field="expected"></dd>' +
            '<dt class="text-subtle" data-util-field="limitLabel">精算下限</dt><dd class="flex items-baseline justify-end gap-2 text-text"><span class="text-xs text-subtle" data-util-field="limitNote"></span><span class="tabular-nums" data-util-field="limit"></span></dd>' +
          '</dl>' +
          '<div>' +
            '<p class="text-[10.5px] font-semibold uppercase tracking-wide text-subtle">契約</p>' +
            '<dl class="mt-1.5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm" data-util-field="contractDl">' +
              '<div class="contents" data-util-field="committedRow"><dt class="text-subtle">契約更新</dt><dd class="text-right text-text tabular-nums" data-util-field="committed"></dd></div>' +
              '<dt class="text-subtle">勤務形態</dt><dd class="text-right text-text" data-util-field="workStyle"></dd>' +
              '<dt class="text-subtle">単価</dt><dd class="text-right text-text tabular-nums" data-util-field="unitPrice"></dd>' +
              '<div class="contents" data-util-field="settlementUnitRow"><dt class="text-subtle">精算単位</dt><dd class="text-right text-text tabular-nums" data-util-field="settlementUnit"></dd></div>' +
              '<div class="contents" data-util-field="odRow"><dt class="text-subtle">超過／控除</dt><dd class="text-right text-text tabular-nums" data-util-field="overtimeDeduction"></dd></div>' +
            '</dl>' +
          '</div>' +
          '<div class="rounded-lg border border-warning-border bg-warning-surface px-3 py-2 text-xs text-warning" data-util-field="statusRow" role="status" hidden></div>' +
          '<p class="text-xs text-subtle" data-util-field="importedAt"></p>' +
          '<p class="text-[11px] text-subtle">有休は有休ノートに申請済みの分を差し引いています</p>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);
    wrap.addEventListener("click", function (e) { if (e.target.closest("[data-util-close]")) closeDetail(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !wrap.hidden) closeDetail(); });
    return wrap;
  }
  var detail = null;
  function applyDetail(s) {
    setText(detail, "clientLabel", s.clientLabel); setText(detail, "sinceLabel", s.sinceLabel);
    setText(detail, "importedAt", s.importedAt);
    q(detail, "headline").hidden = !!s.missing;
    q(detail, "details").hidden = !!s.missing;
    q(detail, "missingLine").hidden = !s.missing;
    q(detail, "approxLine").hidden = !s.approx;
    var row = q(detail, "statusRow");
    row.hidden = !s.status || s.missing;
    if (s.status) row.textContent = s.status;
    if (!s.missing) {
      setText(detail, "restDays", s.restDays); setText(detail, "restHours", s.restHours);
      setText(detail, "plannedNote", s.plannedNote); setText(detail, "planned", s.planned); setText(detail, "leave", s.leave); setText(detail, "expected", s.expected);
      setText(detail, "limitLabel", s.limitLabel); setText(detail, "limitNote", s.limitNote); setText(detail, "limit", s.limit);
      q(detail, "committedRow").hidden = !s.committed;
      setText(detail, "committed", s.committed); setText(detail, "workStyle", s.workStyle);
      setText(detail, "unitPrice", s.unitPrice);
      q(detail, "settlementUnitRow").hidden = !s.settlementUnit;
      setText(detail, "settlementUnit", s.settlementUnit);
      q(detail, "odRow").hidden = !s.overtimeDeduction;
      setText(detail, "overtimeDeduction", s.overtimeDeduction);
    }
  }
  function openDetail() { if (!detail) detail = buildDetail(); applyDetail(UTIL_MOCK_STATES[current]); detail.hidden = false; detail.querySelector('[role="dialog"]').focus(); }
  function closeDetail() { if (detail) detail.hidden = true; }

  function applyUtilState(key) {
    var s = UTIL_MOCK_STATES[key];
    if (!s) return;
    current = key;
    document.querySelectorAll('[data-card="utilization"]').forEach(function (card) { applyCard(card, s); });
    if (detail && !detail.hidden) applyDetail(s);
  }

  function init() {
    document.addEventListener("click", function (e) { if (e.target.closest("[data-util-open]")) openDetail(); });
    applyUtilState("ok");
  }
  if (document.body) init(); else document.addEventListener("DOMContentLoaded", init);

  window.UTIL_MOCK_STATES = UTIL_MOCK_STATES;
  window.applyUtilState = applyUtilState;
})();
