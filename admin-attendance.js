/* CrewNest DEMO: 管理 › 勤怠（AdminAttendanceClient / AdminMemberMonthModal / TodayStatusModal に合わせた下書き。本体 next の下書き） */
(function () {
  var CHIP = { warning: "bg-warning-surface text-warning border-warning-border", danger: "bg-danger-surface text-danger border-danger-border", info: "bg-info-surface text-info border-info-border", success: "bg-success-surface text-success border-success-border", neutral: "bg-neutral-surface text-subtle border-neutral-border" };
  function chip(text, tone) { return '<span class="whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ' + CHIP[tone] + '">' + text + "</span>"; }

  var MEMBERS = [
    { id: 1, name: "田中 佑樹", empId: "No.101", client: "株式会社アルファ", today: { label: "勤務中 09:53〜 ・ リモート", tone: "success" }, days: 11, work: "90:47", ot: "4:30", otOver: false, night: "1:10", office: 2, missing: 1, chips: [chip("未入力 1", "warning"), chip("有休差異", "warning")] },
    { id: 2, name: "佐藤 美咲", empId: "No.102", client: "株式会社ベータ", today: { label: "出社 09:30〜", tone: "neutral" }, days: 12, work: "96:00", ot: "6:15", otOver: false, night: "0:00", office: 8, missing: 0, chips: [] },
    { id: 3, name: "鈴木 大輔", empId: "No.103", client: "株式会社アルファ", today: { label: "有休", tone: "info" }, days: 10, work: "80:15", ot: "2:00", otOver: false, night: "0:20", office: 0, missing: 0, chips: [] },
    { id: 4, name: "高橋 陽菜", empId: "No.104", client: null, today: { label: "未出勤", tone: "warning" }, days: 9, work: "72:30", ot: "1:00", otOver: false, night: "0:00", office: 3, missing: 2, chips: [chip("未入力 2", "warning")] },
    { id: 5, name: "伊藤 直人", empId: "No.105", client: "株式会社ガンマ", today: { label: "勤務中 08:45〜 ・ 出社", tone: "success" }, days: 12, work: "112:00", ot: "48:10", otOver: true, night: "3:40", office: 12, missing: 0, chips: [chip("45h 超の見込み", "danger")] },
    { id: 6, name: "渡辺 玲", empId: "No.106", client: "株式会社ベータ", today: { label: "退勤済", tone: "neutral" }, days: 11, work: "88:00", ot: "3:00", otOver: false, night: "0:00", office: 1, missing: 0, chips: [] },
  ];

  var filter = null;
  var search = "";
  var clientFilter = "all";

  function matches(m) {
    if (search && m.name.indexOf(search) === -1 && m.empId.indexOf(search) === -1) return false;
    if (clientFilter !== "all" && m.client !== clientFilter) return false;
    if (filter === "working") return m.today.tone === "success";
    if (filter === "leave") return m.today.label.indexOf("休") !== -1 || m.today.tone === "info";
    if (filter === "missing") return m.missing > 0;
    if (filter === "warn") return m.chips.length > 0;
    return true;
  }

  function renderList() {
    var list = MEMBERS.filter(matches);
    var mobile = document.querySelector("[data-att-adm-list-mobile]");
    var desktop = document.querySelector("[data-att-adm-list-desktop]");
    if (mobile) {
      mobile.innerHTML = list.map(function (m) {
        return '<button type="button" data-att-adm-open="' + m.id + '" class="flex w-full items-start gap-3 rounded-lg border border-border bg-background-light p-3 text-left shadow-sm transition-colors hover:bg-background">' +
          '<span class="min-w-0 flex-1"><span class="flex flex-wrap items-center gap-1.5"><span class="text-sm font-medium text-text">' + m.name + "</span>" + chip(m.today.label, m.today.tone) + "</span>" +
          '<span class="mt-0.5 block text-xs text-subtle">' + (m.client || "客先なし") + " ・ 実働 " + m.work + " ・ 残業 " + m.ot + "</span>" +
          (m.chips.length ? '<span class="mt-1.5 flex flex-wrap gap-1">' + m.chips.join("") + "</span>" : "") +
          "</span><svg viewBox='0 0 24 24' width='18' height='18' fill='currentColor' class='mt-1 shrink-0 text-subtle-light' aria-hidden='true'><path d='M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z'></path></svg></button>";
      }).join("") || '<p class="py-6 text-center text-sm text-subtle">該当するメンバーはいません</p>';
    }
    if (desktop) {
      desktop.innerHTML = list.map(function (m) {
        return '<tr data-att-adm-open="' + m.id + '" role="button" tabindex="0" class="cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-background">' +
          '<td class="whitespace-nowrap px-4 py-2.5"><span class="font-medium text-text">' + m.name + '</span><span class="ml-1.5 text-xs text-subtle">' + m.empId + "</span></td>" +
          "<td class=\"px-4 py-2.5\">" + chip(m.today.label, m.today.tone) + "</td>" +
          '<td class="px-4 py-2.5 text-right tabular-nums text-text">' + m.days + "</td>" +
          '<td class="px-4 py-2.5 text-right tabular-nums text-text">' + m.work + "</td>" +
          '<td class="px-4 py-2.5 text-right tabular-nums ' + (m.otOver ? "font-medium text-danger" : "text-text") + '">' + m.ot + "</td>" +
          '<td class="px-4 py-2.5 text-right tabular-nums text-text">' + m.night + "</td>" +
          '<td class="px-4 py-2.5 text-right tabular-nums text-text">' + m.office + "</td>" +
          '<td class="px-4 py-2.5 text-right tabular-nums ' + (m.missing ? "font-medium text-warning" : "text-subtle") + '">' + (m.missing || "—") + "</td>" +
          '<td class="px-4 py-2.5"><span class="flex flex-nowrap gap-1">' + m.chips.join("") + "</span></td>" +
          '<td class="whitespace-nowrap px-4 py-2.5 text-subtle">' + (m.client || "—") + "</td></tr>";
      }).join("") || '<tr><td colspan="10" class="px-4 py-6 text-center text-sm text-subtle">該当するメンバーはいません</td></tr>';
    }
  }
  renderList();

  document.addEventListener("input", function (e) {
    if (e.target.closest("[data-att-adm-search]")) { search = e.target.value; renderList(); }
  });
  document.addEventListener("click", function (e) {
    var f = e.target.closest("[data-att-adm-filter]");
    if (f) {
      var key = f.getAttribute("data-att-adm-filter");
      filter = filter === key ? null : key;
      document.querySelectorAll("[data-att-adm-filter]").forEach(function (b) {
        var on = b.getAttribute("data-att-adm-filter") === filter;
        b.setAttribute("aria-pressed", on);
        b.className = "h-9 whitespace-nowrap rounded-full px-3 text-xs font-medium transition-colors " + (on ? "bg-primary text-white" : "border border-border text-subtle hover:bg-background");
      });
      renderList();
      return;
    }
    var open = e.target.closest("[data-att-adm-open]");
    if (open) { openMember(+open.getAttribute("data-att-adm-open")); return; }
    if (e.target.closest("[data-att-kpi-today]")) { openToday(); return; }
    if (e.target.closest("[data-att-bulk-export]")) { runBulkExport(); return; }
    if (e.target.closest("[data-att-member-export]")) { toast("作業報告書_202609_" + (currentMember ? currentMember.name : "") + ".xlsx をダウンロードしました"); return; }
    if (e.target.closest("[data-att-member-tune]")) {
      document.querySelectorAll("[data-att-member-tracking]").forEach(function (el) { el.hidden = !el.hidden; });
      return;
    }
  });

  // --- メンバー月次モーダル ---
  var currentMember = null;
  var SAMPLE_ROWS = [
    { d: "9/14（月）", status: "出勤", s: "09:50", e: "19:02", work: "8:12", ot: "0:12", loc: "出社", fare: "¥1,240", note: "担当タスク対応、" },
    { d: "9/15（火）", status: "出勤", s: "09:49", e: "19:01", work: "8:12", ot: "0:12", loc: "リモート", fare: "", note: "担当タスク対応、" },
    { d: "9/16（水）", status: "出勤", s: "09:55", e: "19:00", work: "8:05", ot: "0:05", loc: "リモート", fare: "", note: "担当タスク対応、" },
    { d: "9/17（木）", status: "出勤", s: "09:48", e: "19:03", work: "8:15", ot: "0:15", loc: "出社", fare: "¥760", note: "客先定例、担当タスク対応、" },
    { d: "9/18（金）", status: "勤務中", s: "09:53", e: "—", work: "—", ot: "—", loc: "リモート", fare: "", note: "" },
  ];
  function memberBody(m) {
    var tiles = [
      ["calendar_today", "作業日数", m.days + " 日"],
      ["schedule", "実働", m.work],
      ["bar_chart", "普通残業", m.ot],
      ["bedtime", "深夜残業", m.night],
    ];
    var tilesHtml = '<div class="grid grid-cols-2 gap-2 md:grid-cols-4">' + tiles.map(function (t) {
      return '<div class="rounded-lg border border-border bg-background-light p-2.5 shadow-sm"><p class="text-[11px] text-subtle">' + t[1] + '</p><p class="mt-1 text-lg font-bold tabular-nums text-text">' + t[2] + "</p></div>";
    }).join("") + "</div>";
    var tracking = '<div data-att-member-tracking hidden class="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-background px-3 py-2">' +
      '<span class="pb-2 text-sm font-semibold text-text">未入力の判定</span>' +
      '<label class="block"><span class="mb-0.5 block text-[11px] text-subtle">判定を始める日</span><input type="date" class="h-9 rounded-lg border border-border bg-background-light px-2 text-sm text-text"></label>' +
      '<label class="flex h-9 items-center gap-2 text-sm text-text"><input type="checkbox" class="h-4 w-4 accent-primary">勤怠を記録しない人</label>' +
      '<button type="button" class="inline-flex h-9 items-center rounded-full border border-border px-4 text-xs font-medium text-text hover:bg-background">保存</button></div>';
    var warn = m.missing > 0
      ? '<div role="status" class="flex items-center gap-3 rounded-lg border border-warning-border bg-warning-surface px-4 py-3 text-sm text-warning"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg><span>未入力の平日が ' + m.missing + ' 日あります</span></div>'
      : "";
    var rows = SAMPLE_ROWS.map(function (r) {
      return '<tr class="h-12 border-b border-border last:border-b-0"><td class="px-3 py-2 text-text">' + r.d + '</td><td class="px-3 py-2 text-text">' + r.status + '</td>' +
        '<td class="px-3 py-2 text-right tabular-nums text-text">' + r.s + '</td><td class="px-3 py-2 text-right tabular-nums text-text">' + r.e + '</td>' +
        '<td class="px-3 py-2 text-right tabular-nums text-text">' + r.work + '</td><td class="px-3 py-2 text-right tabular-nums text-text">' + r.ot + '</td>' +
        '<td class="px-3 py-2 text-text">' + r.loc + (r.fare ? '<span class="block text-[11px] text-subtle">' + r.fare + '</span>' : '') + '</td>' +
        '<td class="px-3 py-2 text-text"><span class="block truncate max-w-[220px]">' + (r.note || '<span class="text-subtle-light">—</span>') + '</span></td></tr>';
    }).join("");
    var table = '<div class="rounded-lg border border-border bg-background-light"><div class="overflow-x-auto"><table class="w-full min-w-[720px] text-sm">' +
      '<thead><tr class="border-b border-border text-xs text-subtle"><th class="px-3 py-2.5 text-left font-medium">日付</th><th class="px-3 py-2.5 text-left font-medium">状態</th><th class="px-3 py-2.5 text-right font-medium">開始</th><th class="px-3 py-2.5 text-right font-medium">終了</th><th class="px-3 py-2.5 text-right font-medium">実働</th><th class="px-3 py-2.5 text-right font-medium">残業</th><th class="px-3 py-2.5 text-left font-medium">場所・交通費</th><th class="px-3 py-2.5 text-left font-medium">作業内容</th></tr></thead>' +
      "<tbody>" + rows + "</tbody></table></div>" +
      '<p class="border-t border-border px-3 py-2 text-[11px] text-subtle">直近 5 日分の表示例です（デモ）。実際は月初から当日までの全日を表示します。</p></div>';
    return tilesHtml + tracking + warn + table;
  }
  function openMember(id) {
    var m = MEMBERS.filter(function (x) { return x.id === id; })[0];
    if (!m) return;
    currentMember = m;
    var titleText = m.name + " の勤怠 ・ 2026年9月";
    var subText = (m.client || "客先なし") + " ・ 所定 8:00 ・ 代理編集";
    document.querySelectorAll('[data-att-member="title"],[data-att-member="title-m"]').forEach(function (el) { el.textContent = titleText; });
    document.querySelectorAll('[data-att-member="subtitle"],[data-att-member="subtitle-m"]').forEach(function (el) { el.textContent = subText; });
    var html = memberBody(m);
    var body = document.querySelector('[data-att-member="body"]'); if (body) body.innerHTML = html;
    var bodyM = document.querySelector('[data-att-member="body-m"]'); if (bodyM) bodyM.innerHTML = html;
    document.querySelectorAll("[data-att-member-tracking]").forEach(function (el) { el.hidden = true; });
    if (window.matchMedia("(min-width: 768px)").matches) window.openDialog ? window.openDialog("att-member") : document.querySelector('[data-modal="att-member"]').style.display = "flex";
    else window.openSlide("att-member");
  }

  // --- 今日の出勤状況（タイムライン） ---
  var RANGE = { start: 6, end: 24 };
  function pct(hour) { return ((hour - RANGE.start) / (RANGE.end - RANGE.start)) * 100; }
  function toHour(hm) { var p = hm.split(":"); return +p[0] + (+p[1] || 0) / 60; }
  var TODAY_ROWS = [
    { name: "田中 佑樹", client: "株式会社アルファ", kind: "working", loc: "リモート", s: "09:53", e: null },
    { name: "佐藤 美咲", client: "株式会社ベータ", kind: "done", loc: "出社", s: "09:30", e: "18:10" },
    { name: "鈴木 大輔", client: "株式会社アルファ", kind: "leave", label: "有休" },
    { name: "高橋 陽菜", client: "客先なし", kind: "none" },
    { name: "伊藤 直人", client: "株式会社ガンマ", kind: "working", loc: "出社", s: "08:45", e: null },
    { name: "渡辺 玲", client: "株式会社ベータ", kind: "done", loc: "リモート", s: "09:40", e: "18:30" },
  ];
  function todayBody() {
    var now = new Date();
    var nowHour = now.getHours() + now.getMinutes() / 60;
    var nowLeft = nowHour >= RANGE.start && nowHour <= RANGE.end ? pct(nowHour) : null;
    var ticks = [];
    for (var h = RANGE.start; h <= RANGE.end; h += 3) ticks.push(h);
    var ticksHtml = ticks.map(function (h) { return '<span aria-hidden class="absolute -translate-x-1/2 text-[10px] tabular-nums text-subtle" style="left:' + pct(h) + '%">' + h + "</span>"; }).join("");
    var rows = TODAY_ROWS.map(function (r) {
      var band = "";
      if ((r.kind === "working" || r.kind === "done") && r.s) {
        var left = pct(toHour(r.s));
        var endHour = r.e ? toHour(r.e) : nowHour;
        var width = Math.max(1, pct(endHour) - left);
        var label = r.s + (r.e ? "〜" + r.e : "〜");
        var cls = r.loc === "出社" ? "bg-primary text-white" : "border-2 border-primary bg-primary/10 text-primary";
        band = '<span class="absolute top-[14px] h-5 truncate rounded px-1.5 text-[11px] tabular-nums ' + cls + '" style="left:' + left + '%;width:' + width + '%">' + label + "</span>";
      } else if (r.kind === "leave") {
        band = '<span class="absolute inset-x-0 top-[14px] h-5 truncate rounded bg-info-surface px-1.5 text-[11px] text-info">' + r.label + "</span>";
      }
      var badge = r.kind === "none" ? '<span class="whitespace-nowrap rounded-full border border-warning-border bg-warning-surface px-2 py-0.5 text-[11px] font-medium text-warning">未出勤</span>' : "";
      return '<li class="grid grid-cols-[9rem_1fr] items-center gap-2 border-b border-border py-1.5 last:border-b-0 md:grid-cols-[13rem_1fr]">' +
        '<span class="min-w-0"><span class="flex flex-wrap items-center gap-1.5"><span class="truncate text-sm font-medium text-text">' + r.name + "</span>" + badge + "</span>" +
        '<span class="block truncate text-[11px] text-subtle">' + r.client + "</span></span>" +
        '<div class="relative h-10 rounded bg-background">' + ticks.map(function (h) { return '<span aria-hidden class="absolute inset-y-0 border-l border-border" style="left:' + pct(h) + '%"></span>'; }).join("") +
        (nowLeft !== null ? '<span aria-hidden class="absolute inset-y-0 w-px bg-danger" style="left:' + nowLeft + '%"></span>' : "") +
        band + "</div></li>";
    }).join("");
    return '<div class="grid grid-cols-[9rem_1fr] items-center gap-2 md:grid-cols-[13rem_1fr]"><span></span><div class="relative h-4">' + ticksHtml + "</div></div><ol>" + rows + "</ol>";
  }
  function openToday() {
    var html = todayBody();
    var body = document.querySelector('[data-att-today="body"]'); if (body) body.innerHTML = html;
    var bodyM = document.querySelector('[data-att-today="body-m"]'); if (bodyM) bodyM.innerHTML = html;
    if (window.matchMedia("(min-width: 768px)").matches) document.querySelector('[data-modal="att-today"]').style.display = "flex";
    else window.openSlide("att-today");
  }

  // --- 一括出力 ---
  function runBulkExport() {
    var list = MEMBERS.filter(matches);
    var total = list.length;
    if (total === 0) return;
    var progressWrap = document.querySelector("[data-att-bulk-progress]");
    var bar = document.querySelector("[data-att-bulk-bar]");
    var label = document.querySelector("[data-att-bulk-label]");
    var done = 0;
    progressWrap.hidden = false;
    label.textContent = "0 / " + total;
    var timer = setInterval(function () {
      done += 1;
      bar.style.width = Math.round((done / total) * 100) + "%";
      label.textContent = done + " / " + total;
      if (done >= total) {
        clearInterval(timer);
        setTimeout(function () {
          progressWrap.hidden = true;
          label.textContent = "一括出力";
          toast("勤務表_202609.zip をダウンロードしました");
        }, 300);
      }
    }, 350);
  }

  function toast(msg) {
    var el = document.createElement("div");
    el.setAttribute("role", "status");
    el.className = "fixed left-1/2 z-[var(--z-modal-nested)] -translate-x-1/2 rounded-full bg-primary px-4 py-2 text-sm text-white shadow-md";
    el.style.bottom = "1.5rem";
    el.textContent = msg; document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2200);
  }
})();
