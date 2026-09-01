// CrewNest 共通: モバイル用ボトムナビ「その他」シート
// mock-bottomnav.html（variant-grid）のマークアップ・挙動を9ページで共通化するために DOM 生成で注入する
(function () {
  var SHEET_HTML =
    '<div id="more-sheet-overlay" class="absolute inset-0" style="background:rgba(4,33,84,0.3);"></div>' +
    '<div id="more-sheet" role="dialog" aria-label="その他" ' +
    'class="absolute inset-x-0 bottom-0 flex max-h-[70vh] flex-col rounded-t-2xl bg-background-light shadow-md" ' +
    'style="transform:translateY(105%);transition:transform .25s ease;">' +
    '<div aria-hidden="true" class="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-border"></div>' +
    '<div class="flex shrink-0 items-baseline gap-2 px-4 pb-2 pt-1"><span class="text-base font-bold text-text">その他</span></div>' +
    '<div class="min-h-0 flex-1 overflow-y-auto border-t border-border px-4 py-4">' +
    '<div class="grid grid-cols-4 gap-3">' +
    '<a href="CrewNest Announcements.html" class="flex flex-col items-center gap-1.5">' +
    '<span class="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background">' +
    '<img src="public/icons/megaphone.png" alt="" style="width:26px;height:26px;object-fit:contain;">' +
    '</span>' +
    '<span class="text-[11px] text-text">お知らせ</span>' +
    '</a>' +
    '<a href="CrewNest Documents.html" class="flex flex-col items-center gap-1.5">' +
    '<span class="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background">' +
    '<img src="public/icons/airplane.png" alt="" style="width:26px;height:26px;object-fit:contain;">' +
    '<span class="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-accent px-1 text-[0.6rem] font-bold text-primary">1</span>' +
    '</span>' +
    '<span class="text-[11px] text-text">書類提出</span>' +
    '</a>' +
    '<button type="button" data-open-dialog="search" onclick="closeMoreSheetForSearch()" class="flex flex-col items-center gap-1.5">' +
    '<span class="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background">' +
    '<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true" class="text-text"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>' +
    '</span>' +
    '<span class="text-[11px] text-text">検索</span>' +
    '</button>' +
    '</div>' +
    '</div>' +
    '<div class="shrink-0 pb-2"></div>' +
    '</div>';

  function init() {
    var btn = document.getElementById('more-nav-btn');
    if (!btn) return;

    var root = document.createElement('div');
    root.id = 'more-sheet-root';
    root.className = 'fixed inset-x-0 top-0 z-40';
    root.style.bottom = '3rem';
    root.style.display = 'none';
    root.innerHTML = SHEET_HTML;
    document.body.appendChild(root);

    var sheet = root.querySelector('#more-sheet');
    var overlay = root.querySelector('#more-sheet-overlay');
    var btnIcon = btn.querySelector('span[style]');
    // その他がこのページのアクティブ項目（お知らせ・書類提出ページ）の場合、閉じても text-primary を保つ
    var isPageActive = btn.hasAttribute('data-nav-active');

    function isOpen() {
      return root.style.display !== 'none';
    }

    function open() {
      root.style.display = '';
      requestAnimationFrame(function () { sheet.style.transform = 'translateY(0)'; });
      btn.classList.remove('text-subtle');
      btn.classList.add('text-primary');
      if (btnIcon) btnIcon.style.opacity = '1';
    }

    function close() {
      sheet.style.transform = 'translateY(100%)';
      if (!isPageActive) {
        btn.classList.add('text-subtle');
        btn.classList.remove('text-primary');
        if (btnIcon) btnIcon.style.opacity = '0.55';
      }
      setTimeout(function () { root.style.display = 'none'; }, 250);
    }

    btn.addEventListener('click', function () {
      if (isOpen()) close(); else open();
    });
    overlay.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) close();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

// 検索タイル: その他シートを閉じてから検索ダイアログを開く（data-open-dialog="search" は slide-panels.js が処理）
function closeMoreSheetForSearch() {
  var overlay = document.getElementById('more-sheet-overlay');
  if (overlay) overlay.click();
}
