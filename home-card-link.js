// CrewNest Home.html 専用: 横断検索のホーム行（CrewNest Home.html?card=<id>）を受け取る。
// 該当カード（data-card="<id>"）へ window.scrollTo で寄せ、ring-2 ring-primary rounded-lg を2秒付ける
// （本体 HomeCardBoard.tsx と同じ流儀。scrollIntoView は使わない）。
// URL の card は処理の有無に関わらず history.replaceState で掃除する（存在しない id は掃除だけ）。
(function () {
  var HIGHLIGHT_MS = 2000;
  // モバイル固定ヘッダー（h-14 = 56px）＋ 余白。寄せた後にヘッダーへ隠れないためのオフセット
  var HEADER_OFFSET_PX = 56 + 16;

  // デスクトップ・モバイルの両ボードが常に DOM 上に同時存在し（CSS の hidden md:grid / md:hidden で
  // 片方だけ表示）、同じ data-card がその2つに付く。本体（HomeCardBoard.tsx）も highlightedId を両ボードへ
  // 同時に渡すため、ここでも一致する要素すべてに ring を当てる（スクロール先は表示中の方だけ使う）
  function findCards(cardId) {
    var els = [];
    document.querySelectorAll('[data-card]').forEach(function (node) {
      if (node.getAttribute('data-card') === cardId) els.push(node);
    });
    return els;
  }

  function isVisible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  function init() {
    var params = new URLSearchParams(window.location.search);
    var cardId = params.get('card');
    if (!cardId) return;

    params.delete('card');
    var qs = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));

    var els = findCards(cardId);
    if (els.length === 0) return; // 存在しないカード id は何もしない（掃除だけ）

    var target = els.find(isVisible) || els[0];
    var top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET_PX;
    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
    els.forEach(function (el) { el.classList.add('ring-2', 'ring-primary', 'rounded-lg'); });
    window.setTimeout(function () {
      els.forEach(function (el) { el.classList.remove('ring-2', 'ring-primary', 'rounded-lg'); });
    }, HIGHLIGHT_MS);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
