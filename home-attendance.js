/* CrewNest DEMO: ホームの勤怠カード（出勤/退勤）。AttendanceHomeCardView.tsx に合わせた下書き（本体 next の下書き） */
(function () {
  var phase = "idle";        // idle | working | done
  var location = "REMOTE";
  var startClock = null;     // "HH:MM"
  var endClock = null;
  var note = "";
  var DEFAULT_NOTE = "担当タスク対応、";

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function nowClock() { var d = new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  function statusText() {
    if (phase === "idle") return "未出勤";
    var loc = location === "OFFICE" ? "出社" : "リモート";
    if (phase === "working") return "勤務中 " + startClock + "〜 ・ " + loc;
    return "退勤済 " + startClock + "〜" + endClock + " ・ " + loc;
  }

  function renderAll() {
    document.querySelectorAll("[data-att-home-card]").forEach(function (card) {
      var primary = card.querySelector("[data-att-home-primary]");
      var fix = card.querySelector("[data-att-home-fix]");
      var noteRow = card.querySelector("[data-att-home-note-row]");
      var status = card.querySelector("[data-att-home-status]");
      var noteInput = card.querySelector("[data-att-home-note]");
      status.textContent = statusText();
      // class に display を持つ要素は真偽値の hidden 属性だけでは隠れないため style.display で切り替える
      var show = function (el, on) { el.style.display = on ? "" : "none"; };
      if (phase === "idle") {
        show(primary, true); primary.textContent = "出勤"; primary.setAttribute("data-att-home-action", "clockin");
        show(fix, false); show(noteRow, false);
      } else if (phase === "working") {
        show(primary, true); primary.textContent = "退勤"; primary.setAttribute("data-att-home-action", "clockout");
        show(fix, false); show(noteRow, true);
        if (!noteInput.value) noteInput.placeholder = DEFAULT_NOTE;
      } else {
        show(primary, false); show(fix, true); show(noteRow, true);
      }
    });
  }
  function tickClock() {
    var t = nowClock();
    document.querySelectorAll("[data-att-home-clock]").forEach(function (el) { el.textContent = t; });
  }
  tickClock(); setInterval(tickClock, 15000);
  renderAll();

  document.addEventListener("click", function (e) {
    var loc = e.target.closest("[data-att-home-loc-opt]");
    if (loc) {
      var group = loc.closest("[data-att-home-loc]");
      location = loc.getAttribute("data-att-home-loc-opt");
      group.querySelectorAll("[data-att-home-loc-opt]").forEach(function (b) {
        var on = b === loc;
        b.setAttribute("aria-pressed", on);
        b.className = "relative h-9 rounded-full px-3 text-xs font-medium transition-colors duration-200 md:h-8 " + (on ? "text-primary" : "text-subtle");
      });
      var thumb = group.querySelector("[data-att-home-loc-thumb]");
      if (thumb) thumb.style.transform = location === "OFFICE" ? "translateX(100%)" : "translateX(0)";
      renderAll();
      return;
    }
    var primary = e.target.closest("[data-att-home-primary]");
    if (primary) {
      var action = primary.getAttribute("data-att-home-action");
      if (action === "clockin") { phase = "working"; startClock = nowClock(); }
      else if (action === "clockout") { phase = "done"; endClock = nowClock(); }
      renderAll();
      return;
    }
    if (e.target.closest("[data-att-home-save]")) {
      var card = e.target.closest("[data-att-home-card]");
      note = card.querySelector("[data-att-home-note]").value;
      toast("保存しました");
      return;
    }
  });

  function toast(msg) {
    var el = document.createElement("div");
    el.setAttribute("role", "status");
    el.className = "fixed left-1/2 z-[120] -translate-x-1/2 rounded-full bg-primary px-4 py-2 text-sm text-white shadow-md";
    el.style.bottom = "calc(var(--bottom-nav-h) + 1.5rem)";
    el.textContent = msg; document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2200);
  }
})();
