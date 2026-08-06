// 確認ダイアログ（アプリの AlertDialog を再現した静的モック）
// 取り下げ系ボタンのクリックを document で委譲監視し、アプリと同じ文言の確認ダイアログを表示する。
// 確定・キャンセルとも閉じるだけで実処理はしない（デモのため）。
(function () {
  function openConfirm(opts) {
    var overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[120] bg-black/50';
    var card = document.createElement('div');
    card.className = 'fixed left-1/2 top-1/2 z-[121] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background-light p-6 shadow-md';
    card.setAttribute('role', 'alertdialog');
    card.setAttribute('aria-modal', 'true');
    card.innerHTML =
      '<p data-c="title" class="text-base font-bold text-text"></p>' +
      '<div class="mt-5 flex flex-col-reverse gap-2 md:flex-row md:justify-end">' +
      '<button type="button" data-c="cancel" class="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-background-light px-5 text-sm font-medium text-text transition-colors hover:bg-background">キャンセル</button>' +
      '<button type="button" data-c="ok" class="inline-flex min-h-12 items-center justify-center rounded-full bg-red-600 px-5 text-sm font-medium text-white transition-colors hover:bg-red-700"></button>' +
      '</div>';
    card.querySelector('[data-c="title"]').textContent = opts.title;
    card.querySelector('[data-c="ok"]').textContent = opts.confirmLabel;
    function close() {
      overlay.remove();
      card.remove();
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    overlay.addEventListener('click', close);
    card.querySelector('[data-c="cancel"]').addEventListener('click', close);
    card.querySelector('[data-c="ok"]').addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    document.body.appendChild(overlay);
    document.body.appendChild(card);
  }

  // 取り下げ系ボタンの委譲ハンドラ（各ページの静的ボタンに後付けの確認を挟む）
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('button') : null;
    if (!btn) return;
    var text = btn.textContent.trim();
    if (btn.getAttribute('data-f') === 'withdraw' || text === '提案を取り下げる') {
      openConfirm({ title: '提案を取り下げますか？', confirmLabel: '取り下げる' });
    } else if (btn.getAttribute('data-f') === 'footbtn' && text === '取り下げる') {
      openConfirm({ title: '提出を取り下げますか？', confirmLabel: '取り下げる' });
    } else if (text === '申請を取り下げる') {
      openConfirm({ title: '申告を取り下げますか？', confirmLabel: '取り下げる' });
    }
  });
})();
