/* ============================================================
   CrewNest DEMO: 今月の稼働カード（ホーム。issue #54 稼働早見表）
   使い方: <script src="home-card.js"></script>（CrewNest Home.html の badges.js の後に追加）
   本体 src/features/utilization/ の React 化前の静的再現。カードの状態は "ok" 固定。
   ソース: ~/.claude-tools/crew-nest-mock/issue54/fragments/home-card.js
   ============================================================ */
(function () {
  // 状態ごとの表示値。card = カードの 3 行目、detail = タップで開く詳細
  var UTIL_MOCK_STATES = {
    ok: {
      clientLabel: "株式会社アルファ ／ 基幹刷新PJ ・ 上限下限 120〜180h",
      sinceLabel: "2026年4月から ・ 6か月目",
      restDays: "4.0", restHours: "32h",
      plannedNote: "営業日 19日 × 8h", planned: "152h", leave: "0h", expected: "152h",
      limitLabel: "精算下限", limitNote: "上限 180h", limit: "120h",
      status: null, missing: false, importedAt: "有休データ: 9/8 取込",
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
    if (s.status) statusLine.textContent = s.status;
    else { setText(card, "restDays", s.restDays); setText(card, "restHours", s.restHours); }
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
          '<h2 id="util-detail-title" class="text-[15px] font-bold text-text">今月の稼働</h2>' +
          '<button type="button" data-util-close aria-label="閉じる" class="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full text-subtle transition-colors hover:bg-black/[0.08]"><svg viewBox="0 -960 960 960" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M256-200 200-256l224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"></path></svg></button>' +
        '</div>' +
        '<div class="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">' +
          '<div class="space-y-0.5"><p class="text-xs text-subtle" data-util-field="clientLabel"></p><p class="text-xs text-subtle" data-util-field="sinceLabel"></p></div>' +
          '<p class="text-sm text-text" data-util-field="headline">下限まで あと <span class="text-lg font-bold text-primary" data-util-field="restDays"></span> 日（<span data-util-field="restHours"></span>）</p>' +
          '<p class="text-sm text-danger" data-util-field="missingLine" hidden>有休データと突合できません。社員番号の登録を管理者に確認してください</p>' +
          '<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm" data-util-field="details">' +
            '<dt class="text-subtle">予定稼働</dt><dd class="flex items-baseline justify-end gap-2 text-text"><span class="text-xs text-subtle" data-util-field="plannedNote"></span><span class="tabular-nums" data-util-field="planned"></span></dd>' +
            '<dt class="text-subtle">有休</dt><dd class="text-right text-text tabular-nums" data-util-field="leave"></dd>' +
            '<dt class="text-subtle">見込み稼働</dt><dd class="text-right text-text tabular-nums" data-util-field="expected"></dd>' +
            '<dt class="text-subtle" data-util-field="limitLabel">精算下限</dt><dd class="flex items-baseline justify-end gap-2 text-text"><span class="text-xs text-subtle" data-util-field="limitNote"></span><span class="tabular-nums" data-util-field="limit"></span></dd>' +
          '</dl>' +
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
    var row = q(detail, "statusRow");
    row.hidden = !s.status || s.missing;
    if (s.status) row.textContent = s.status;
    if (!s.missing) {
      setText(detail, "restDays", s.restDays); setText(detail, "restHours", s.restHours);
      setText(detail, "plannedNote", s.plannedNote); setText(detail, "planned", s.planned); setText(detail, "leave", s.leave); setText(detail, "expected", s.expected);
      setText(detail, "limitLabel", s.limitLabel); setText(detail, "limitNote", s.limitNote); setText(detail, "limit", s.limit);
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
