/* ============================================================
   CrewNest DEMO issue33: 処理中のローディング表示
   使い方: <script src="loading-feedback.js"></script>
   - サイドナビ・ボトムナビの内部リンクをクリックした瞬間、画面上部に
     indeterminate バーを表示する（本体 NavigationProgress.tsx の再現）
   - [data-loading-sim="receive"] のボタンをクリックすると、
     ボタン内に小さな白リングスピナーを1秒ほど表示する
     （本体 ClaimableQuestWidgetClient.tsx / Spinner.tsx の再現）
   ============================================================ */
(function () {
  'use strict';
  if (document.getElementById('cn-nav-progress-bar')) return;

  var STYLE = [
    '@keyframes refresh-indeterminate {',
    '  0% { left: -40%; width: 40%; }',
    '  60% { left: 100%; width: 60%; }',
    '  100% { left: 100%; width: 60%; }',
    '}',
    '.refresh-indeterminate-bar {',
    '  position: absolute; inset-block: 0; left: 0; width: 100%;',
    '  background-color: var(--color-accent);',
    '}',
    '@media (prefers-reduced-motion: no-preference) {',
    '  .refresh-indeterminate-bar { width: 40%; animation: refresh-indeterminate 1.3s cubic-bezier(0.4, 0, 0.2, 1) infinite; }',
    '}',
    '@media (min-width: 768px) and (prefers-reduced-motion: no-preference) {',
    '  .refresh-indeterminate-bar { animation-duration: 2.4s; }',
    '}',
    '#cn-nav-progress-bar { display: none; }',
    '#cn-nav-progress-bar.is-active { display: block; }'
  ].join('\n');

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var style = document.createElement('style');
    style.id = 'cn-nav-progress-style';
    style.textContent = STYLE;
    document.head.appendChild(style);

    /* 画面遷移バー: モバイルはヘッダー下端、デスクトップは画面最上部 */
    var bar = document.createElement('div');
    bar.id = 'cn-nav-progress-bar';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-label', 'ページを読み込み中');
    bar.className = 'pointer-events-none fixed inset-x-0 top-14 z-[60] h-1 overflow-hidden bg-primary/20 md:top-0';
    bar.innerHTML = '<span class="refresh-indeterminate-bar"></span>';
    document.body.appendChild(bar);

    document.querySelectorAll('nav[aria-label="メインナビゲーション"] a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      a.addEventListener('click', function (e) {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        bar.classList.add('is-active');
      });
    });

    /* 受け取るボタン: ボタン内リングスピナー（擬似処理1秒。デモなので実処理なし） */
    var RECEIVE_DURATION_MS = 1000;
    document.querySelectorAll('[data-loading-sim="receive"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        var originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.classList.add('opacity-70', 'cursor-wait');
        btn.innerHTML =
          '<span class="inline-flex items-center justify-center">' +
            '<span class="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true"></span>' +
            '<span class="sr-only">受け取る</span>' +
          '</span>';
        window.setTimeout(function () {
          btn.innerHTML = originalHTML;
          btn.disabled = false;
          btn.classList.remove('opacity-70', 'cursor-wait');
        }, RECEIVE_DURATION_MS);
      });
    });
  });
})();
