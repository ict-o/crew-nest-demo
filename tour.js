/* ============================================================
   CrewNest 操作ガイドツアー (共通エンジン)
   使い方:
     <script src="tour.js"></script>
     <script>CNTour.define('pageKey', [ {target, title, body}, ... ]);</script>
   - target: CSSセレクタ(カンマ区切り可)。省略時は画面中央のカード表示
   - 初回訪問時に自動起動 (localStorage: cn-tour-seen:<pageKey>)
   - デスクトップ: サイドナビ最下部（ユーザー行の上）に「操作ガイド」常設行を自動設置
   - モバイル: ヘッダー右アクション群の先頭に「?」ボタンを自動設置
   ============================================================ */
(function () {
  'use strict';
  if (window.CNTour) return;

  var PREFIX = 'cn-tour-seen:';
  var state = { key: null, base: [], steps: [], i: 0, active: false, el: null };

  var STYLE = [
    '#cn-tour-blocker{position:fixed;inset:0;z-index:300;cursor:pointer;}',
    '#cn-tour-spot{position:fixed;z-index:301;border-radius:12px;pointer-events:none;',
    '  box-shadow:0 0 0 3px rgba(198,167,94,.95), 0 0 0 200vmax rgba(2,22,64,.58);',
    '  transition:top .28s ease,left .28s ease,width .28s ease,height .28s ease,box-shadow .28s ease;}',
    '#cn-tour-spot.cn-center{box-shadow:0 0 0 0 rgba(198,167,94,0), 0 0 0 200vmax rgba(2,22,64,.58);}',
    '#cn-tour-tip{position:fixed;z-index:302;width:min(320px,calc(100vw - 24px));background:#fff;',
    '  border-radius:14px;box-shadow:0 12px 40px rgba(2,22,64,.35);padding:14px 16px;',
    '  font-family:Arial,Helvetica,sans-serif;color:#333;opacity:0;transform:translateY(6px);',
    '  transition:opacity .22s ease,transform .22s ease,top .28s ease,left .28s ease;}',
    '#cn-tour-tip.cn-show{opacity:1;transform:translateY(0);}',
    '.cn-tip-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;}',
    '.cn-tip-count{font-size:11px;font-weight:bold;color:#8A99B8;letter-spacing:.05em;}',
    '.cn-tip-skip{border:0;background:none;font-size:12px;color:#5C6B8A;cursor:pointer;padding:4px 8px;border-radius:6px;}',
    '.cn-tip-skip:hover{background:#F0F1F4;}',
    '.cn-tip-title{margin:0 0 6px;font-size:16px;font-weight:bold;color:#042154;line-height:1.4;}',
    '.cn-tip-body{margin:0 0 12px;font-size:13px;line-height:1.7;color:#333;}',
    '.cn-tip-foot{display:flex;align-items:center;justify-content:flex-end;gap:8px;}',
    '.cn-tip-back{white-space:nowrap;border:1px solid #E3E6ED;background:#fff;color:#5C6B8A;font-size:13px;padding:8px 14px;border-radius:9999px;cursor:pointer;}',
    '.cn-tip-back:hover{background:#F0F1F4;}',
    '.cn-tip-next{white-space:nowrap;border:0;background:#042154;color:#fff;font-size:13px;font-weight:bold;padding:8px 18px;border-radius:9999px;cursor:pointer;}',
    '.cn-tip-next:hover{background:#0d3b86;}',
    '.cn-tour-fab{position:fixed;left:16px;bottom:16px;z-index:60;width:44px;height:44px;border-radius:9999px;',
    '  background:#042154;color:#fff;border:0;cursor:pointer;display:flex;align-items:center;justify-content:center;',
    '  box-shadow:0 4px 12px rgba(2,22,64,.3);}'
  ].join('\n');

  var ICON = '<svg viewBox="0 0 24 24" fill="currentColor" style="width:22px;height:22px;" aria-hidden="true"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"></path></svg>';

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  function visible(el) {
    if (!el) return false;
    if (!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)) return false;
    var s = getComputedStyle(el);
    return s.visibility !== 'hidden' && s.opacity !== '0';
  }
  function findEl(sel) {
    var list = document.querySelectorAll(sel);
    for (var i = 0; i < list.length; i++) if (visible(list[i])) return list[i];
    return null;
  }
  function isFixed(el) {
    var n = el;
    while (n && n !== document.body) {
      if (getComputedStyle(n).position === 'fixed') return true;
      n = n.parentElement;
    }
    return false;
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function $(id) { return document.getElementById(id); }

  /* setTimeout 駆動の自前スムーススクロール（rAF/behavior:'smooth' が動かない環境対策） */
  var scrollAnim = null;
  function smoothScrollTo(targetY, done) {
    if (scrollAnim) { clearTimeout(scrollAnim); scrollAnim = null; }
    var startY = window.scrollY, dist = targetY - startY, dur = 300, t0 = Date.now();
    if (Math.abs(dist) < 2) { window.scrollTo(0, targetY); if (done) done(); return; }
    function step() {
      var p = Math.min(1, (Date.now() - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3); /* easeOutCubic */
      window.scrollTo(0, startY + dist * e);
      if (p < 1) scrollAnim = setTimeout(step, 16);
      else { scrollAnim = null; if (done) done(); }
    }
    step();
  }

  /* ---------- インフォメーションボタン ---------- */
  function makeBtn(cls) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', '操作ガイドを見る');
    b.title = '操作ガイドを見る';
    b.className = cls;
    b.innerHTML = ICON;
    b.addEventListener('click', function () { start(); });
    return b;
  }
  function injectButtons() {
    if (document.querySelector('.cn-tour-info, .cn-tour-fab')) return;
    /* デスクトップ: サイドナビ最下部（ユーザー行の上）に常設の「操作ガイド」行を挿入。
       ロゴ行には置かない（CREW NEST テキストが truncate されるため） */
    var userBtn = document.querySelector('aside [data-tour="user-menu"]');
    var userWrap = userBtn ? userBtn.parentElement : null;
    if (userWrap && userWrap.parentElement) {
      var row = document.createElement('div');
      row.className = 'border-t border-white/10 px-3 py-2';
      var b = makeBtn('cn-tour-info flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white');
      b.innerHTML = '<span class="inline-flex h-7 w-7 shrink-0 items-center justify-center">' + ICON + '</span><span class="truncate">操作ガイド</span>';
      row.appendChild(b);
      userWrap.parentElement.insertBefore(row, userWrap);
    } else {
      /* フォールバック: ユーザー行が無い画面では従来どおりロゴ行に置く */
      var desk = document.querySelector('aside .flex.shrink-0.items-center.gap-1');
      if (desk) desk.insertBefore(makeBtn('cn-tour-info inline-flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white'), desk.firstChild);
    }
    /* モバイル: ヘッダー右アクション群の先頭 */
    var mob = document.querySelector('header .flex.shrink-0.items-center');
    if (mob) mob.insertBefore(makeBtn('cn-tour-info inline-flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/10'), mob.firstChild);
    if (!document.querySelector('.cn-tour-info')) document.body.appendChild(makeBtn('cn-tour-fab'));
  }

  /* ---------- ツアーUI ---------- */
  function buildDom() {
    if (!$('cn-tour-style')) {
      var st = document.createElement('style');
      st.id = 'cn-tour-style';
      st.textContent = STYLE;
      document.head.appendChild(st);
    }
    var blocker = document.createElement('div');
    blocker.id = 'cn-tour-blocker';
    blocker.addEventListener('click', function () { next(); });

    var spot = document.createElement('div');
    spot.id = 'cn-tour-spot';

    var tip = document.createElement('div');
    tip.id = 'cn-tour-tip';
    tip.innerHTML =
      '<div class="cn-tip-head"><span class="cn-tip-count" id="cn-tip-count"></span>' +
      '<button type="button" class="cn-tip-skip" id="cn-tip-skip">スキップ</button></div>' +
      '<h3 class="cn-tip-title" id="cn-tip-title"></h3>' +
      '<p class="cn-tip-body" id="cn-tip-body"></p>' +
      '<div class="cn-tip-foot">' +
      '<button type="button" class="cn-tip-back" id="cn-tip-back">戻る</button>' +
      '<button type="button" class="cn-tip-next" id="cn-tip-next">次へ</button></div>';
    tip.addEventListener('click', function (e) { e.stopPropagation(); });

    document.body.appendChild(blocker);
    document.body.appendChild(spot);
    document.body.appendChild(tip);

    $('cn-tip-skip').addEventListener('click', function () { close(); });
    $('cn-tip-back').addEventListener('click', function () { show(state.i - 1, -1); });
    $('cn-tip-next').addEventListener('click', function () { next(); });
  }
  function destroyDom() {
    ['cn-tour-blocker', 'cn-tour-spot', 'cn-tour-tip'].forEach(function (id) {
      var el = $(id);
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight' || e.key === 'Enter') next();
    else if (e.key === 'ArrowLeft') show(state.i - 1, -1);
  }
  var scrollThrottle = null;
  function onScroll() {
    if (scrollThrottle) return;
    scrollThrottle = setTimeout(function () { scrollThrottle = null; if (state.active) place(); }, 32);
  }
  var resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { if (state.active) show(state.i, 1); }, 150);
  }

  /* ---------- 進行 ---------- */
  function start() {
    if (state.active || !state.base.length) return;
    state.steps = state.base.filter(function (s) { return !s.target || s.before || document.querySelector(s.target); });
    if (!state.steps.length) return;
    buildDom();
    state.active = true;
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    show(0, 1);
  }
  function next() {
    if (state.i >= state.steps.length - 1) close();
    else show(state.i + 1, 1);
  }
  function close() {
    if (!state.active) return;
    state.active = false;
    try { localStorage.setItem(PREFIX + state.key, '1'); } catch (e) { /* noop */ }
    try { if (state.opts && state.opts.onClose) state.opts.onClose(); } catch (e) { /* noop */ }
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    destroyDom();
  }

  function show(i, dir) {
    if (!state.active) return;
    if (i < 0) i = 0;
    // 非表示ターゲットのステップは読み飛ばす
    while (i >= 0 && i < state.steps.length) {
      var st = state.steps[i];
      if (!st.target || st.before || findEl(st.target)) break;
      i += (dir < 0 ? -1 : 1);
    }
    if (i < 0) i = 0;
    if (i >= state.steps.length) { close(); return; }

    state.i = i;
    var s = state.steps[i];
    if (s.before) { try { s.before(); } catch (e) { /* noop */ } }
    state.el = s.target ? findEl(s.target) : null;
    if (s.target && !state.el) { show(i + (dir < 0 ? -1 : 1), dir); return; }

    $('cn-tip-count').textContent = (i + 1) + ' / ' + state.steps.length;
    $('cn-tip-title').textContent = s.title || '';
    $('cn-tip-body').textContent = s.body || '';
    $('cn-tip-back').style.display = i === 0 ? 'none' : '';
    $('cn-tip-next').textContent = i === state.steps.length - 1 ? '完了' : '次へ';

    var el = state.el;
    if (el && !isFixed(el)) {
      var r = el.getBoundingClientRect(), vh = window.innerHeight;
      if (r.top < 80 || r.bottom > vh - 90) {
        var y;
        if (r.height >= vh - 170) y = window.scrollY + r.top - 80;
        else y = window.scrollY + r.top - Math.max(80, (vh - r.height) / 2);
        smoothScrollTo(Math.max(0, y), place);
        return;
      }
    }
    place();
  }

  function place() {
    if (!state.active) return;
    var spot = $('cn-tour-spot'), tip = $('cn-tour-tip');
    if (!spot || !tip) return;
    var vw = window.innerWidth, vh = window.innerHeight;
    var el = state.el;
    if (el && !visible(el)) {
      var sdef = state.steps[state.i];
      el = state.el = sdef.target ? findEl(sdef.target) : null;
    }
    var tw = tip.offsetWidth, th = tip.offsetHeight;

    if (!el) {
      spot.classList.add('cn-center');
      spot.style.left = (vw / 2) + 'px';
      spot.style.top = (vh / 2) + 'px';
      spot.style.width = '0px';
      spot.style.height = '0px';
      tip.style.left = ((vw - tw) / 2) + 'px';
      tip.style.top = ((vh - th) / 2) + 'px';
    } else {
      spot.classList.remove('cn-center');
      var r = el.getBoundingClientRect(), pad = 6, gap = 14;
      spot.style.left = (r.left - pad) + 'px';
      spot.style.top = (r.top - pad) + 'px';
      spot.style.width = (r.width + pad * 2) + 'px';
      spot.style.height = (r.height + pad * 2) + 'px';

      var top, left;
      var tall = r.height > vh * 0.5;
      if (tall && vw - r.right >= tw + gap + 12) {
        left = r.right + gap;
        top = clamp(r.top + r.height / 2 - th / 2, 12, vh - th - 12);
      } else if (tall && r.left >= tw + gap + 12) {
        left = r.left - tw - gap;
        top = clamp(r.top + r.height / 2 - th / 2, 12, vh - th - 12);
      } else if (vh - r.bottom >= th + gap + 12) {
        top = r.bottom + gap;
        left = clamp(r.left, 12, vw - tw - 12);
      } else if (r.top >= th + gap + 12) {
        top = r.top - th - gap;
        left = clamp(r.left, 12, vw - tw - 12);
      } else {
        top = vh - th - 16;
        left = (vw - tw) / 2;
      }
      tip.style.left = left + 'px';
      tip.style.top = top + 'px';
    }
    tip.classList.add('cn-show');
  }

  /* ---------- 公開API ---------- */
  window.CNTour = {
    define: function (key, steps, opts) {
      state.key = key;
      state.opts = opts || {};
      state.base = steps.concat([{
        target: '.cn-tour-info, .cn-tour-fab',
        title: 'いつでも見返せます',
        body: 'このボタンから、いつでもこのガイドをもう一度表示できます。'
      }]);
      ready(function () {
        injectButtons();
        var seen = false;
        try { seen = !!localStorage.getItem(PREFIX + key); } catch (e) { /* noop */ }
        if (!seen) setTimeout(start, 650);
      });
    },
    start: function () { start(); }
  };
})();
