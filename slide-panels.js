// CrewNest 共通: スライドパネル/ボトムシート/ダイアログ制御
(function () {
  function openSlide(id, trigger) {
    document.querySelectorAll('[data-slide="' + id + '"]').forEach(function (p) {
      p.style.transform = 'translate(0,0)';
      p.setAttribute('data-open', '1');
    });
    document.querySelectorAll('[data-overlay="' + id + '"]').forEach(function (o) { o.style.display = 'block'; });
    document.querySelectorAll('[data-modal="' + id + '"]').forEach(function (m) { m.style.display = 'flex'; });
  }
  function closeSlide(id) {
    document.querySelectorAll('[data-slide="' + id + '"]').forEach(function (p) {
      p.style.transform = p.getAttribute('data-hidden-transform') || 'translateX(100%)';
      p.removeAttribute('data-open');
    });
    document.querySelectorAll('[data-overlay="' + id + '"]').forEach(function (o) { o.style.display = 'none'; });
    document.querySelectorAll('[data-modal="' + id + '"]').forEach(function (m) { m.style.display = 'none'; });
  }
  function closeAll() {
    document.querySelectorAll('[data-slide][data-open]').forEach(function (p) { closeSlide(p.getAttribute('data-slide')); });
    document.querySelectorAll('[data-modal]').forEach(function (m) { if (m.style.display !== 'none' && m.style.display !== '') m.style.display = 'none'; });
    document.querySelectorAll('[data-dialog]').forEach(function (d) { d.style.display = 'none'; });
  }
  window.openSlide = openSlide;
  window.closeSlide = closeSlide;
  window.closeAllSlides = closeAll;

  document.addEventListener('click', function (e) {
    // 中央ダイアログ（確認系）
    var dOpen = e.target.closest('[data-open-dialog]');
    if (dOpen) {
      e.stopPropagation();
      var did = dOpen.getAttribute('data-open-dialog');
      document.querySelectorAll('[data-dialog="' + did + '"]').forEach(function (d) { d.style.display = 'flex'; });
      return;
    }
    var dClose = e.target.closest('[data-close-dialog]');
    if (dClose) {
      var host = dClose.closest('[data-dialog]');
      if (host) host.style.display = 'none';
      return;
    }
    var dlgOverlay = e.target.closest('[data-dialog]');
    if (dlgOverlay && e.target === dlgOverlay) { dlgOverlay.style.display = 'none'; return; }

    // スライドパネル
    var opener = e.target.closest('[data-open-slide]');
    if (opener) {
      var id = opener.getAttribute('data-open-slide');
      document.dispatchEvent(new CustomEvent('slidewillopen', { detail: { id: id, trigger: opener } }));
      openSlide(id, opener);
      return;
    }
    var closer = e.target.closest('[data-close-slide]');
    if (closer) {
      var cid = closer.getAttribute('data-close-slide');
      if (!cid) {
        var pp = closer.closest('[data-slide]');
        cid = pp ? pp.getAttribute('data-slide') : null;
      }
      if (cid) closeSlide(cid);
      return;
    }
    var ov = e.target.closest('[data-overlay]');
    if (ov && e.target === ov) { closeSlide(ov.getAttribute('data-overlay')); return; }

    // モーダル背景クリック
    var mo = e.target.closest('[data-modal]');
    if (mo && e.target === mo) { closeSlide(mo.getAttribute('data-modal')); return; }
  });

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
})();
