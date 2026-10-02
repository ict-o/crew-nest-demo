/* CrewNest DEMO: 勤怠ページ（本人）。実装 AttendanceClient / WorkTable / WorkCardList / DayEditFields に合わせた下書き（本体 next の下書き） */
(function () {
  var YEAR = 2026, MONTH = 9, TODAY = 18;
  var HOLIDAYS = { 21: "敬老の日", 22: "国民の休日", 23: "秋分の日" };
  var COMPANY_HOLIDAYS = { 25: "休業日" };           // 弊社の休業日（客先は営業日想定）
  var CLIENT_HOLIDAYS = { 11: "客先休業日" };         // 客先だけ休みの日（弊社は営業日）
  var W = ["日", "月", "火", "水", "木", "金", "土"];
  var KIND_LABEL = { WORK: "出勤", PAID_LEAVE: "有休", HALF_AM: "午前半休", HALF_PM: "午後半休", COMP_LEAVE: "代休", SUBSTITUTE: "振替休日", SPECIAL_LEAVE: "特別休暇", ABSENCE: "欠勤", OTHER: "その他" };
  var DAY_KINDS = ["WORK", "PAID_LEAVE", "HALF_AM", "HALF_PM", "COMP_LEAVE", "SUBSTITUTE", "SPECIAL_LEAVE", "ABSENCE", "OTHER"];
  var FARE_ROUND_TRIP = 760;
  var SCHEDULED_MIN = 480; // 所定 8:00

  // 日別データ（無い日は行なし＝未入力 or 休み）。18 日 09:53〜 は打刻中（endedAt 無し）
  var DAYS = {
    1: { kind: "WORK", s: "09:52", e: "19:05", b: 60, loc: "REMOTE", note: "担当タスク対応、MTG、" },
    2: { kind: "WORK", s: "09:58", e: "19:01", b: 60, loc: "REMOTE", note: "担当タスク対応、" },
    3: { kind: "WORK", s: "10:03", e: "21:32", b: 60, loc: "REMOTE", note: "本番リリーステスト、担当タスク対応、" },
    4: null,
    7: { kind: "WORK", s: "09:55", e: "19:00", b: 60, loc: "REMOTE", note: "担当タスク対応、" },
    8: { kind: "PAID_LEAVE", note: "有休" },
    9: { kind: "WORK", s: "10:00", e: "23:10", b: 60, loc: "REMOTE", note: "本番反映前テスト、障害対応、" },
    10: { kind: "WORK", s: "09:47", e: "19:05", b: 60, loc: "OFFICE", note: "担当タスク対応、客先定例、" },
    11: { kind: "WORK", s: "10:01", e: "19:00", b: 60, loc: "REMOTE", note: "担当タスク対応、MTG、" },
    14: { kind: "WORK", s: "09:50", e: "19:02", b: 60, loc: "OFFICE", note: "担当タスク対応、", fare: 1240 },
    15: { kind: "WORK", s: "09:49", e: "19:01", b: 60, loc: "REMOTE", note: "担当タスク対応、" },
    16: { kind: "WORK", s: "09:55", e: "19:00", b: 60, loc: "REMOTE", note: "担当タスク対応、" },
    17: { kind: "WORK", s: "10:00", e: "15:00", b: 60, loc: "REMOTE", note: "休日出勤（リリース立会い）" }, // 木 → 実際は平日だが例として休日出勤の表示例に流用しない。差し替え対象
    18: { kind: "WORK", s: "09:53", e: null, b: 60, loc: "REMOTE", note: "" },
  };
  // 17 は本来平日なので休日出勤の表示例は使わない。休日出勤の例は 12 日（土）に置く
  delete DAYS[17];
  DAYS[12] = { kind: "WORK", s: "10:00", e: "15:00", b: 60, loc: "REMOTE", note: "休日出勤（リリース立会い）" };
  DAYS[17] = { kind: "WORK", s: "09:48", e: "19:03", b: 60, loc: "OFFICE", note: "客先定例、担当タスク対応、" };

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function toMin(t) { var p = t.split(":"); return +p[0] * 60 + +p[1]; }
  function fmt(min) { return Math.floor(min / 60) + ":" + pad(min % 60); }
  function calc(d) {
    if (!d || (d.kind !== "WORK" && d.kind !== "HALF_AM" && d.kind !== "HALF_PM") || !d.s || !d.e) return null;
    var work = toMin(d.e) - toMin(d.s) - d.b;
    var night = Math.max(0, toMin(d.e) - 22 * 60);
    var ot = Math.max(0, work - SCHEDULED_MIN - night);
    return { work: work, ot: ot, night: night };
  }
  function dow(day) { return new Date(YEAR, MONTH - 1, day).getDay(); }
  function isBizDay(day) { var w = dow(day); return w !== 0 && w !== 6 && !HOLIDAYS[day] && !COMPANY_HOLIDAYS[day]; }
  function daysInMonth() { return new Date(YEAR, MONTH, 0).getDate(); }

  function chip(text, tone) {
    var cls = {
      warning: "bg-warning-surface text-warning border-warning-border", info: "bg-info-surface text-info border-info-border",
      accent: "bg-accent-light text-accent-dark border-accent-border", neutral: "bg-neutral-surface text-subtle border-neutral-border", success: "bg-success-surface text-success border-success-border",
      danger: "bg-danger-surface text-danger border-danger-border",
    }[tone];
    return '<span class="whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ' + cls + '">' + text + "</span>";
  }
  // 日付の横に出す暦の補足（dayDisplay.ts dayLabel 相当）
  function dayLabel(day) {
    if (CLIENT_HOLIDAYS[day] && isBizDay(day)) return { text: CLIENT_HOLIDAYS[day], tone: "warning" };
    if (HOLIDAYS[day]) return { text: HOLIDAYS[day], tone: "danger" };
    if (COMPANY_HOLIDAYS[day]) return { text: COMPANY_HOLIDAYS[day], tone: "danger" };
    return null;
  }
  // 行の背景（dayDisplay.ts rowBackground 相当）
  function rowBackground(day) {
    var w = dow(day);
    if (HOLIDAYS[day] || COMPANY_HOLIDAYS[day] || w === 0 || w === 6) return w === 6 ? "bg-info-surface/50" : "bg-danger-surface/60";
    if (CLIENT_HOLIDAYS[day]) return "bg-warning-surface";
    return "";
  }
  function statusOf(day, d) {
    var biz = isBizDay(day);
    if (!d) {
      if (!biz) return { label: "休日", tone: null, dim: true };
      if (day > TODAY) return { label: "", tone: null, dim: true, future: true };
      return { label: "未入力", tone: "warning" };
    }
    if (d.kind === "WORK" && !biz) return { label: "休日出勤", tone: "accent" };
    if (d.kind === "WORK" && !d.e) return { label: "勤務中", tone: "success" };
    if (d.kind === "WORK") return { label: KIND_LABEL.WORK, tone: null };
    return { label: KIND_LABEL[d.kind], tone: "info" };
  }
  function fareOf(d) { if (!d || d.kind !== "WORK" || d.loc !== "OFFICE") return null; return d.fare != null ? d.fare : FARE_ROUND_TRIP; }
  function yen(n) { return "¥" + n.toLocaleString("ja-JP"); }

  var editing = null;          // その場編集中の日（デスクトップ）
  var clip = null;             // コピー中の内容
  var selected = {};           // 貼り付け先に選んだ日
  var ICON_COPY = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';
  var ICON_EDIT = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
  var ICON_CHECK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
  var ICON_X = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
  var ICON_SCHEDULE = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>';
  var INPUT = "h-9 rounded-lg border border-border bg-background-light px-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50";
  var FILL_BTN = "inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-background-light px-3 h-9 text-xs font-medium text-text transition-colors hover:bg-black/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";
  var iconBtn = "inline-flex h-8 w-8 items-center justify-center rounded-full text-subtle transition-colors hover:bg-black/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";
  function pasteMode() { return clip != null; }
  function checkbox(day) { return '<input type="checkbox" data-att-check="' + day + '" aria-label="' + MONTH + '/' + day + ' を貼り付け先に選ぶ" tabindex="-1" class="pointer-events-none h-3.5 w-3.5 accent-primary"' + (selected[day] ? " checked" : "") + ">"; }
  function kindOptions(v) { return DAY_KINDS.map(function (k) { return '<option value="' + k + '"' + (k === v ? " selected" : "") + ">" + KIND_LABEL[k] + "</option>"; }).join(""); }

  function locSegment(current) {
    return '<div role="group" aria-label="作業場所" class="relative inline-grid grid-cols-2 rounded-full border border-border p-0.5">' +
      '<span aria-hidden="true" data-ie-loc-thumb class="absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-primary-lightest transition-transform duration-200 ease-in-out" style="transform:' + (current === "OFFICE" ? "translateX(100%)" : "translateX(0)") + '"></span>' +
      '<button type="button" data-ie-loc="REMOTE" aria-pressed="' + (current !== "OFFICE") + '" class="relative h-9 rounded-full px-3 text-xs font-medium transition-colors duration-200 ' + (current !== "OFFICE" ? "text-primary" : "text-subtle") + '">リモート</button>' +
      '<button type="button" data-ie-loc="OFFICE" aria-pressed="' + (current === "OFFICE") + '" class="relative h-9 rounded-full px-3 text-xs font-medium transition-colors duration-200 ' + (current === "OFFICE" ? "text-primary" : "text-subtle") + '">出社</button>' +
      "</div>";
  }

  function editRow(day) {
    var d = DAYS[day] || { kind: "WORK", s: "", e: "", b: 60, loc: "REMOTE", note: "" }, w = dow(day), timed = d.kind === "WORK" || d.kind === "HALF_AM" || d.kind === "HALF_PM";
    var dayCls = w === 0 || HOLIDAYS[day] || COMPANY_HOLIDAYS[day] ? "text-danger" : w === 6 ? "text-info" : "text-text";
    var loc = d.loc || "REMOTE";
    return '<tr data-att-edit-row="' + day + '" class="border-b border-border bg-primary-lightest/40 last:border-b-0"><td colspan="11" class="px-3 py-2">' +
      '<div class="flex items-end gap-3">' +
        '<span class="w-20 shrink-0 self-start pt-5 text-sm font-medium tabular-nums ' + dayCls + '">' + MONTH + "/" + day + "（" + W[w] + "）</span>" +
        '<div class="min-w-0 flex-1"><div class="flex flex-wrap items-end gap-2">' +
        '<label class="block w-28"><span class="mb-0.5 block text-[11px] text-subtle">日種別</span><select data-ie="kind" class="' + INPUT + ' w-full">' + kindOptions(d.kind) + "</select></label>" +
        (timed ?
          '<label class="block w-28"><span class="mb-0.5 block text-[11px] text-subtle">開始</span><input type="time" data-ie="s" value="' + (d.s || "") + '" class="' + INPUT + ' w-full"></label>' +
          '<label class="block w-28"><span class="mb-0.5 block text-[11px] text-subtle">終了</span><input type="time" data-ie="e" value="' + (d.e || "") + '" class="' + INPUT + ' w-full"></label>' +
          '<label class="block w-20"><span class="mb-0.5 block text-[11px] text-subtle">休憩（分）</span><input type="number" data-ie="b" value="' + (d.b != null ? d.b : 60) + '" class="' + INPUT + ' w-full text-right"></label>' +
          '<button type="button" data-ie-default class="' + FILL_BTN + '">' + ICON_SCHEDULE + "定時を入力</button>" +
          '<div class="block"><span class="mb-0.5 block text-[11px] text-subtle">作業場所</span>' + locSegment(loc) + "</div>" +
          (loc === "OFFICE" ? '<label class="block w-24"><span class="mb-0.5 block text-[11px] text-subtle">交通費（円）</span><input type="number" data-ie="fare" value="' + (d.fare != null ? d.fare : "") + '" placeholder="' + FARE_ROUND_TRIP + '" class="' + INPUT + ' w-full text-right placeholder:text-subtle-light"></label>' : "")
          : "") +
        "</div></div>" +
        '<span class="shrink-0 pb-2 text-xs tabular-nums text-subtle" data-ie="calc"></span>' +
        '<span class="ml-auto inline-flex shrink-0 items-center gap-1 pb-0.5">' +
          '<button type="button" data-ie-save aria-label="変更を確定" class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-mid">' + ICON_CHECK + "</button>" +
          '<button type="button" data-ie-cancel aria-label="編集をキャンセル" class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-subtle transition-colors hover:bg-black/[0.04]">' + ICON_X + "</button>" +
        "</span></div>" +
        '<div class="mt-2"><label class="block"><span class="mb-0.5 block text-[11px] text-subtle">作業内容</span><input type="text" data-ie="note" value="' + (d.note || "").replace(/"/g, "&quot;") + '" class="' + INPUT + ' w-full"></label></div>' +
      "</td></tr>";
  }

  function renderDesktop() {
    var tb = document.querySelector("[data-att-list-desktop]"); if (!tb) return;
    var rows = [];
    for (var day = 1; day <= daysInMonth(); day++) {
      if (editing === day) { rows.push(editRow(day)); continue; }
      var d = DAYS[day], st = statusOf(day, d), c = calc(d), w = dow(day);
      var dayCls = w === 0 || HOLIDAYS[day] || COMPANY_HOLIDAYS[day] ? "text-danger" : w === 6 ? "text-info" : (st.dim ? "text-subtle-light" : "text-text");
      var label = dayLabel(day);
      var otTxt = c ? (c.ot || c.night ? fmt(c.ot) + (c.night ? '<span class="block text-[11px] leading-tight text-subtle">深夜 ' + fmt(c.night) + "</span>" : "") : "—") : '<span class="text-subtle-light">—</span>';
      var canCopy = !!d && (d.kind !== "WORK" || !!d.e);
      var isToday = day === TODAY;
      var dateCell = isToday
        ? '<span aria-label="今日" class="-ml-2 inline-block rounded-full bg-primary px-2 py-0.5 font-bold text-white">' + MONTH + "/" + day + "（" + W[w] + "）</span>"
        : MONTH + "/" + day + "（" + W[w] + "）";
      var bg = selected[day] ? "bg-primary-lightest/60" : rowBackground(day);
      rows.push(
        '<tr data-att-day="' + day + '" class="h-12 border-b border-border transition-colors last:border-b-0 hover:bg-background' + (pasteMode() && st.label !== "" ? " cursor-pointer" : "") + (bg ? " " + bg : "") + '">' +
        (pasteMode() ? '<td class="px-2 py-2">' + checkbox(day) + "</td>" : "") +
        '<td class="whitespace-nowrap px-3 py-2 tabular-nums ' + dayCls + '">' + dateCell + (label ? '<span class="ml-1.5 text-[11px] ' + (label.tone === "warning" ? "text-warning" : "text-danger") + '">' + label.text + "</span>" : "") + "</td>" +
        '<td class="px-3 py-2">' + (st.tone ? chip(st.label, st.tone) : '<span class="text-sm ' + (st.dim ? "text-subtle-light" : "text-text") + '">' + st.label + "</span>") + "</td>" +
        '<td class="px-3 py-2 text-right tabular-nums text-text">' + (d && d.s ? d.s : "") + "</td>" +
        '<td class="px-3 py-2 text-right tabular-nums text-text">' + (d && d.e ? d.e : d && d.s ? '<span class="text-subtle">—</span>' : "") + "</td>" +
        '<td class="px-3 py-2 text-right tabular-nums text-text">' + (c ? fmt(d.b) : "") + "</td>" +
        '<td class="px-3 py-2 text-right tabular-nums font-medium text-text">' + (c ? fmt(c.work) : "") + "</td>" +
        '<td class="whitespace-nowrap px-3 py-2 text-right tabular-nums leading-tight text-text">' + otTxt + "</td>" +
        '<td class="whitespace-nowrap px-3 py-2 leading-tight text-text">' + (d && d.kind === "WORK" ? (d.loc === "OFFICE" ? "出社" : "リモート") + '<span class="block text-[11px] leading-tight tabular-nums ' + (fareOf(d) != null ? "text-subtle" : "text-subtle-light") + '">' + (fareOf(d) != null ? yen(fareOf(d)) : "—") + "</span>" : "") + "</td>" +
        '<td class="px-3 py-2 text-text"><span class="block truncate">' + (d ? (d.note || '<span class="text-subtle-light">—</span>') : '<span class="text-subtle-light">—</span>') + "</span></td>" +
        '<td class="whitespace-nowrap px-2 py-2 text-right" onclick="event.stopPropagation()"><span class="inline-flex items-center gap-0.5">' +
          (canCopy ? '<button type="button" data-att-copy="' + day + '" aria-label="' + MONTH + '/' + day + ' の内容をコピー" class="' + iconBtn + '">' + ICON_COPY + "</button>" : "") +
          (st.future ? "" : '<button type="button" data-att-edit="' + day + '" aria-label="' + MONTH + '/' + day + ' を編集" class="' + iconBtn + '">' + ICON_EDIT + "</button>") +
        "</span></td></tr>");
    }
    tb.innerHTML = rows.join("");
    var selcol = document.querySelector("[data-att-selcol]"); if (selcol) selcol.hidden = !pasteMode();
    document.querySelectorAll("[data-att-edit-row] input,[data-att-edit-row] select").forEach(function (el) { el.addEventListener("input", onEditInput); });
    if (editing != null) { var er = document.querySelector("[data-att-edit-row]"); if (er) { syncEditRowCalc(er); var first = er.querySelector('[data-ie="s"]') || er.querySelector('[data-ie="kind"]'); if (first) first.focus(); } }
  }
  function syncEditRowCalc(r) {
    var g = function (f) { var el = r.querySelector('[data-ie="' + f + '"]'); return el ? el.value : ""; };
    var k = g("kind"), timed = k === "WORK" || k === "HALF_AM" || k === "HALF_PM";
    var c = timed ? calc({ kind: k, s: g("s"), e: g("e"), b: +g("b") || 0 }) : null;
    var out = r.querySelector('[data-ie="calc"]'); if (out) out.textContent = c ? "実働 " + fmt(c.work) + " ・ 残業 " + fmt(c.ot + c.night) : "";
  }
  function onEditInput(e) {
    if (e.target.getAttribute("data-ie") === "kind") { editing = editing; renderDesktop(); return; }
    var r = e.target.closest("[data-att-edit-row]"); if (r) syncEditRowCalc(r);
  }

  function renderMobile() {
    var host = document.querySelector("[data-att-list-mobile]"); if (!host) return;
    var cards = [];
    for (var day = 1; day <= daysInMonth(); day++) {
      var d = DAYS[day], st = statusOf(day, d), c = calc(d), w = dow(day);
      var dayCls = w === 0 || HOLIDAYS[day] || COMPANY_HOLIDAYS[day] ? "text-danger" : w === 6 ? "text-info" : "text-text";
      var top, right = "", chips = [], note = "";
      var label = dayLabel(day);
      if (c) {
        top = '<span class="text-sm font-semibold text-text tabular-nums">' + d.s + " 〜 " + d.e + "</span>";
        right = '<span class="shrink-0 text-right"><span class="block text-[10px] leading-none text-subtle">実働</span><span class="text-lg font-bold text-primary tabular-nums">' + fmt(c.work) + "</span></span>";
        if (c.ot || c.night) chips.push(chip("残業 " + fmt(c.ot + c.night), "warning"));
        chips.push(chip(d.loc === "OFFICE" ? "出社" : "リモート", d.loc === "OFFICE" ? "accent" : "neutral"));
        if (fareOf(d) != null) chips.push(chip(yen(fareOf(d)), "neutral"));
        note = d.note;
      } else if (d && d.s) {
        top = '<span class="text-sm font-semibold text-text tabular-nums">' + d.s + " 〜</span>";
        chips.push(chip(d.loc === "OFFICE" ? "出社" : "リモート", "neutral"));
        note = d.note;
      } else if (d) {
        top = '<span class="text-sm font-semibold text-text">' + KIND_LABEL[d.kind] + "</span>";
      } else {
        top = '<span class="text-sm ' + (st.dim && !label ? "text-subtle-light" : "text-text") + '">' + (label ? "" : (st.label === "休日" ? "休日" : "—")) + "</span>";
      }
      if (st.tone) chips.unshift(chip(st.label, st.tone));
      if (label) chips.unshift(chip(label.text, label.tone));
      var isToday = day === TODAY;
      var dayNum = isToday
        ? '<span aria-label="今日" class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-lg font-bold tabular-nums text-white">' + day + "</span>"
        : '<span class="text-lg font-bold tabular-nums ' + dayCls + '">' + day + "</span>";
      var disabled = st.future;
      cards.push(
        '<button type="button" data-att-day="' + day + '"' + (disabled ? " disabled" : "") + (pasteMode() ? ' aria-pressed="' + (selected[day] ? "true" : "false") + '"' : "") + ' class="flex w-full items-center gap-3 rounded-lg border ' + (rowBackground(day) || "bg-background-light") + ' p-3 text-left shadow-sm transition-colors' + (st.dim ? " opacity-70" : "") + (selected[day] ? " border-primary bg-primary-lightest/40" : " border-border") + ' disabled:cursor-default">' +
        (pasteMode() ? '<input type="checkbox" tabindex="-1" aria-hidden="true" class="pointer-events-none h-5 w-5 shrink-0 accent-primary"' + (selected[day] ? " checked" : "") + ">" : "") +
        '<span class="flex w-10 shrink-0 flex-col items-center border-r border-border pr-2 leading-tight">' + dayNum + '<span class="text-[11px] ' + dayCls + '">' + W[w] + "</span></span>" +
        '<span class="min-w-0 flex-1">' +
          '<span class="flex items-center gap-2">' + top + "</span>" +
          (chips.length ? '<span class="mt-1 flex flex-wrap items-center gap-1">' + chips.join("") + "</span>" : "") +
          (note ? '<span class="mt-1 block truncate text-xs text-subtle">' + note + "</span>" : "") +
        "</span>" + right +
        (!pasteMode() && !disabled ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" class="shrink-0 text-subtle-light" aria-hidden="true"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"></path></svg>' : "") +
        "</button>");
    }
    host.innerHTML = cards.join("");
  }
  function renderAll() { renderDesktop(); renderMobile(); renderBar(); renderWarnings(); }

  // 確認事項
  function renderWarnings() {
    var host = document.querySelector("[data-att-warnings]"); if (!host) return;
    var items = [];
    var missing = [];
    for (var day = 1; day <= TODAY; day++) { if (isBizDay(day) && !DAYS[day]) missing.push(day); }
    if (missing.length) {
      var shown = missing.slice(0, 3).map(function (d) { return MONTH + "/" + d; }).join("、");
      var rest = missing.length - 3;
      items.push({ text: "未入力の平日が " + missing.length + " 日あります（" + shown + (rest > 0 ? " ほか " + rest + " 日" : "") + "）。日種別か打刻を入れてください", jump: missing[0], tone: "warning" });
    }
    items.push({ text: "勤怠の有休 1 日 ＜ 申請済みの有休 2 日（16h）。記載ミスの可能性があります", jump: null, tone: "warning" });
    host.innerHTML = items.map(function (w) {
      var cls = w.tone === "danger" ? "border-danger-border bg-danger-surface text-danger" : "border-warning-border bg-warning-surface text-warning";
      var inner = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true" class="shrink-0"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg><span class="min-w-0 flex-1">' + w.text + "</span>" + (w.jump ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" class="shrink-0"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"></path></svg>' : "");
      return w.jump
        ? '<button type="button" data-att-jump="' + w.jump + '" class="flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors hover:brightness-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ' + cls + '">' + inner + "</button>"
        : '<div role="status" class="flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-sm ' + cls + '">' + inner + "</div>";
    }).join("");
  }

  // コピー中／選択中のアクションバー
  var bar = document.createElement("div");
  bar.className = "fixed inset-x-0 bottom-[var(--bottom-nav-h)] z-40 hidden flex-col gap-2 border-t border-border bg-background-light p-3 shadow-md md:inset-x-auto md:bottom-3 md:right-3 md:z-[var(--z-header)] md:[left:calc(var(--sidebar-w)+0.75rem)] md:flex-row md:items-center md:justify-between md:rounded-lg md:border md:border-border";
  document.body.appendChild(bar);
  function clipLabel(c) { return MONTH + "/" + c.day + " " + (c.kind === "WORK" ? "出勤 " + c.s + "〜" + c.e + "（" + (c.loc === "OFFICE" ? "出社" : "リモート") + "）" : KIND_LABEL[c.kind]); }
  function renderBar() {
    var n = Object.keys(selected).length, mb = document.querySelector("[data-att-mobile-bar]");
    if (!clip) { bar.classList.add("hidden"); bar.classList.remove("flex"); if (mb) mb.style.display = ""; return; }
    bar.classList.remove("hidden"); bar.classList.add("flex"); if (mb) mb.style.display = "none";
    bar.innerHTML =
      '<p class="min-w-0 text-sm text-text"><span class="font-bold text-primary">' + (n ? n + " 日を選択中" : "貼り付ける日をタップ") + '</span><span class="block text-xs text-subtle md:ml-2 md:inline">コピー中: ' + clipLabel(clip) + "</span></p>" +
      '<div class="flex gap-2">' +
        '<button type="button" data-att-clear class="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-border px-4 text-sm font-medium text-primary hover:bg-black/[0.04] md:h-10 md:flex-none">やめる</button>' +
        '<button type="button" data-att-paste ' + (n ? "" : "disabled ") + 'class="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-white hover:bg-primary-mid disabled:cursor-not-allowed disabled:opacity-[0.38] md:h-10 md:flex-none">' + (n ? n + " 日に貼り付け" : "貼り付け") + "</button>" +
      "</div>";
  }

  // 日の編集パネル（モバイル ボトムシート / PC 右 SlideOver）
  var panel = document.querySelector('[data-slide="att-day"]');
  function q(f) { return panel.querySelector('[data-day="' + f + '"]'); }
  function openDay(day) {
    editing = day;
    var d = DAYS[day] || { kind: "WORK", s: "", e: "", b: 60, loc: "REMOTE", note: "" };
    var w = dow(day);
    q("title").textContent = MONTH + "月" + day + "日（" + W[w] + "）";
    q("subtitle").textContent = HOLIDAYS[day] ? "祝日（" + HOLIDAYS[day] + "）" : COMPANY_HOLIDAYS[day] ? "休業日" : isBizDay(day) ? "営業日 ・ 所定 8:00" : "休日";
    q("kind").value = d.kind; q("start").value = d.s || ""; q("end").value = d.e || ""; q("break").value = d.b != null ? d.b : 60; q("note").value = d.note || "";
    q("fare").value = d.fare != null ? d.fare : "";
    panel.querySelectorAll("[data-day-loc]").forEach(function (b) { setLoc(b, (d.loc || "REMOTE") === b.getAttribute("data-day-loc")); });
    var copyBtn = panel.querySelector('[data-day="copy"]');
    if (copyBtn) copyBtn.hidden = !(d && (d.kind !== "WORK" || !!d.e));
    syncKind(); syncCalc();
    window.openSlide("att-day");
  }
  function setLoc(b, on) {
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.className = "relative h-9 rounded-full px-4 text-xs font-medium transition-colors duration-200 " + (on ? "text-primary" : "text-subtle");
    if (on) { var t = q("locThumb"); if (t) t.style.transform = b.getAttribute("data-day-loc") === "OFFICE" ? "translateX(100%)" : "translateX(0)"; }
  }
  function syncKind() {
    var k = q("kind").value, hasTime = k === "WORK" || k === "HALF_AM" || k === "HALF_PM";
    q("timeBlock").hidden = !hasTime; q("locBlock").hidden = !hasTime;
    var fareBlock = q("fareBlock");
    var loc = panel.querySelector('[data-day-loc][aria-pressed="true"]');
    if (fareBlock) fareBlock.hidden = !hasTime || !loc || loc.getAttribute("data-day-loc") !== "OFFICE";
    if (!hasTime && !q("note").value) q("note").value = KIND_LABEL[k];
  }
  function syncCalc() {
    var s = q("start").value, e = q("end").value, b = +q("break").value || 0;
    if (!s || !e) { q("calc").textContent = "終了時刻を入れると実働・残業を計算します"; return; }
    var c = calc({ kind: "WORK", s: s, e: e, b: b });
    q("calc").textContent = "実働 " + fmt(c.work) + " ・ 普通残業 " + fmt(c.ot) + " ・ 深夜 " + fmt(c.night);
  }
  panel.addEventListener("input", function (e) { if (e.target.matches("[data-day]")) { if (e.target.getAttribute("data-day") === "kind") syncKind(); syncCalc(); } });
  panel.addEventListener("click", function (e) {
    var loc = e.target.closest("[data-day-loc]");
    if (loc) { panel.querySelectorAll("[data-day-loc]").forEach(function (b) { setLoc(b, b === loc); }); syncKind(); return; }
    if (e.target.closest('[data-day="copy"]')) { var src = DAYS[editing]; if (!src) { toast("記録の無い日はコピーできません"); return; } clip = { day: editing, kind: src.kind, s: src.s, e: src.e, b: src.b, loc: src.loc, note: src.note }; window.closeSlide("att-day"); renderAll(); toast(MONTH + "/" + editing + " の内容をコピーしました。貼り付ける日をタップしてください"); return; }
    if (e.target.closest('[data-day="fillDefault"]')) { q("start").value = "10:00"; q("end").value = "19:00"; q("break").value = 60; syncCalc(); return; }
    if (e.target.closest('[data-day="save"]')) {
      var k = q("kind").value;
      var loc2 = panel.querySelector('[data-day-loc][aria-pressed="true"]').getAttribute("data-day-loc");
      DAYS[editing] = { kind: k, s: q("start").value || null, e: q("end").value || null, b: +q("break").value || 0, loc: loc2, note: q("note").value, fare: q("fare").value === "" ? undefined : +q("fare").value };
      if (k !== "WORK" && k !== "HALF_AM" && k !== "HALF_PM") { DAYS[editing].s = null; DAYS[editing].e = null; }
      renderAll(); window.closeSlide("att-day");
      toast(MONTH + "/" + editing + " の勤怠を保存しました");
    }
  });
  function isDesktop() { return window.matchMedia("(min-width: 768px)").matches; }
  function startEdit(day) { editing = day; renderDesktop(); var r = document.querySelector('[data-att-edit-row="' + day + '"]'); if (r) r.scrollIntoView({ block: "center" }); }
  function readEdit() {
    var r = document.querySelector("[data-att-edit-row]"); if (!r) return null;
    var g = function (f) { var el = r.querySelector('[data-ie="' + f + '"]'); return el ? el.value : ""; };
    var k = g("kind"), hasTime = k === "WORK" || k === "HALF_AM" || k === "HALF_PM";
    var loc = r.querySelector('[data-ie-loc][aria-pressed="true"]');
    return { kind: k, s: hasTime ? g("s") || null : null, e: hasTime ? g("e") || null : null, b: +g("b") || 0, loc: loc ? loc.getAttribute("data-ie-loc") : "REMOTE", note: g("note") || (hasTime ? "" : KIND_LABEL[k]), fare: g("fare") === "" ? undefined : +g("fare") };
  }
  document.addEventListener("click", function (e) {
    var ieLoc = e.target.closest("[data-ie-loc]");
    if (ieLoc) {
      var r0 = ieLoc.closest("[data-att-edit-row]");
      r0.querySelectorAll("[data-ie-loc]").forEach(function (b) { var on = b === ieLoc; b.setAttribute("aria-pressed", on); b.className = "relative h-9 rounded-full px-3 text-xs font-medium transition-colors duration-200 " + (on ? "text-primary" : "text-subtle"); if (on) { var t = r0.querySelector("[data-ie-loc-thumb]"); if (t) t.style.transform = b.getAttribute("data-ie-loc") === "OFFICE" ? "translateX(100%)" : "translateX(0)"; } });
      startEdit(editing); // 出社/リモートで交通費欄の有無が変わるので再描画
      return;
    }
    var copy = e.target.closest("[data-att-copy]");
    if (copy) { var cd = +copy.getAttribute("data-att-copy"), src = DAYS[cd]; clip = { day: cd, kind: src.kind, s: src.s, e: src.e, b: src.b, loc: src.loc, note: src.note }; renderBar(); toast(MONTH + "/" + cd + " の内容をコピーしました。貼り付け先にチェックを入れてください"); return; }
    if (e.target.closest("[data-att-clear]")) { clip = null; selected = {}; renderAll(); return; }
    if (e.target.closest("[data-att-paste]")) {
      var days = Object.keys(selected).map(Number), n = days.length;
      days.forEach(function (dd) { var prev = DAYS[dd]; DAYS[dd] = { kind: clip.kind, s: clip.s, e: clip.e, b: clip.b, loc: clip.loc, note: clip.note, fare: prev ? prev.fare : undefined }; });
      selected = {}; clip = null; renderAll(); toast(n + " 日に貼り付けました"); return;
    }
    if (e.target.closest("[data-ie-save]")) { var v = readEdit(), ed = editing; DAYS[ed] = v; editing = null; renderAll(); toast(MONTH + "/" + ed + " の勤怠を保存しました"); return; }
    if (e.target.closest("[data-ie-cancel]")) { editing = null; renderDesktop(); return; }
    if (e.target.closest("[data-ie-default]")) { var er = document.querySelector("[data-att-edit-row]"); er.querySelector('[data-ie="s"]').value = "10:00"; er.querySelector('[data-ie="e"]').value = "19:00"; er.querySelector('[data-ie="b"]').value = 60; syncEditRowCalc(er); return; }
    if (e.target.closest("[data-att-edit-row]")) return;
    var edit = e.target.closest("[data-att-edit]"); if (edit) { startEdit(+edit.getAttribute("data-att-edit")); return; }
    var row = e.target.closest("[data-att-day]");
    if (row && !row.disabled) {
      var dd2 = +row.getAttribute("data-att-day");
      if (pasteMode()) { if (selected[dd2]) delete selected[dd2]; else selected[dd2] = true; renderAll(); }
      else if (isDesktop()) startEdit(dd2); else openDay(dd2);
      return;
    }
    var jump = e.target.closest("[data-att-jump]");
    if (jump) { var jd = +jump.getAttribute("data-att-jump"); if (isDesktop()) startEdit(jd); else { var t = document.querySelector('button[data-att-day="' + jd + '"]'); if (t) t.scrollIntoView({ block: "center" }); openDay(jd); } return; }
    if (e.target.closest("[data-att-notes-save]")) { toast("その他事項を保存しました"); return; }
    if (e.target.closest("[data-att-export]")) { toast("作業報告書_202609_田中佑樹.xlsx をダウンロードしました"); return; }
    if (e.target.closest("[data-att-save-settings]")) { toast("設定を保存しました"); return; }
    var tab = e.target.closest('[data-tabgroup="primary"]');
    if (tab) { var settings = tab.getAttribute("data-tabkey") === "settings"; document.querySelectorAll("[data-att-actions],[data-att-mobile-bar]").forEach(function (el) { el.style.display = settings ? "none" : ""; }); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && editing != null && !isDesktopSheetOpen()) { editing = null; renderDesktop(); }
    if (e.key === "Enter" && e.target.closest && e.target.closest("[data-att-edit-row] input")) { var b = document.querySelector("[data-ie-save]"); if (b) b.click(); }
  });
  function isDesktopSheetOpen() { return panel.getAttribute("data-open") != null; }

  function toast(msg) {
    var el = document.createElement("div");
    el.setAttribute("role", "status");
    el.className = "fixed left-1/2 z-[120] -translate-x-1/2 rounded-full bg-primary px-4 py-2 text-sm text-white shadow-md";
    el.style.bottom = "calc(var(--bottom-nav-h) + 4.5rem)";
    el.textContent = msg; document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2200);
  }
  // モバイルではシートは下から出す（初期の隠し位置も下に）
  function syncSheets() { var mobile = !isDesktop(); document.querySelectorAll('[data-slide="att-day"],[data-slide="att-notes"]').forEach(function (p) { if (p.hasAttribute("data-open")) return; var t = mobile ? "translateY(100%)" : "translateX(100%)"; p.setAttribute("data-hidden-transform", t); p.style.transform = t; }); }
  syncSheets(); window.matchMedia("(min-width: 768px)").addEventListener("change", syncSheets);
  renderAll();
})();
