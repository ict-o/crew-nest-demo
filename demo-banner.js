/* ============================================================
   CrewNest DEMO → サービスサイトへ戻る固定リンク
   使い方: <script src="demo-banner.js"></script>
   - 全画面共通の固定ピルを body 末尾に自動挿入
   - モバイル下部ナビ / クエスト一覧のページネーションバーなど
     画面固有の下部固定UIの実高さを検知し、重ならないよう bottom を動的調整
   ============================================================ */
(function () {
  'use strict';
  if (document.getElementById('cn-demo-banner')) return;

  var GAP = 12; /* 直上のUIからの余白(px) */

  var STYLE = [
    '#cn-demo-banner{position:fixed;left:50%;transform:translateX(-50%);z-index:200;',
    '  display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px 6px;',
    '  max-width:calc(100vw - 24px);background:#fff;border:1px solid #E3E6ED;border-radius:9999px;',
    '  box-shadow:0 1px 3px rgba(2,22,64,.12);padding:6px 14px;margin:0;',
    '  font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#5C6B8A;',
    '  text-align:center;}',
    '#cn-demo-banner a{color:#042154;font-weight:bold;text-decoration:none;}',
    '#cn-demo-banner a:hover{text-decoration:underline;}'
  ].join('\n');

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  /* モバイル下部ナビ・クエスト一覧のページネーションバーなど、
     画面下部に固定表示されるUIの合計高さを実測する */
  function reservedBottom() {
    var total = 0;
    ['nav.fixed[aria-label="メインナビゲーション"]', '[data-quest-pagination]'].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el && getComputedStyle(el).display !== 'none') {
        total += el.getBoundingClientRect().height;
      }
    });
    return total;
  }

  function place(el) {
    el.style.bottom = (reservedBottom() + GAP) + 'px';
  }

  ready(function () {
    if (!document.getElementById('cn-demo-banner-style')) {
      var st = document.createElement('style');
      st.id = 'cn-demo-banner-style';
      st.textContent = STYLE;
      document.head.appendChild(st);
    }
    var el = document.createElement('div');
    el.id = 'cn-demo-banner';
    el.setAttribute('role', 'note');
    el.innerHTML =
      '<span>これはデモ画面です &mdash;</span>' +
      '<a href="https://crew-nest.jp/" target="_blank" rel="noopener">CrewNest サービスサイトへ</a>';
    document.body.appendChild(el);
    place(el);
    window.addEventListener('resize', function () { place(el); });
  });
})();
