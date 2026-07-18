// CrewNest 共通: サイドナビ/モバイルヘッダーのユーザーメニュー + 設定モーダル
// UserMenu.tsx / UserSettingsModal.tsx (crew-nest@develop) を忠実に再現した静的モック
(function () {
  var ICONS = {
    person: 'M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z',
    settings: 'm370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-1 13.5l103 78-110 190-119-50q-11 8-23 15t-24 12L590-80H370Zm112-260q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Z',
    info: 'M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z',
    logout: 'M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z',
    notifications: 'M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80Z',
    close: 'M256-200 200-256l224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z'
  };
  function icon(name, size, cls) {
    return '<svg viewBox="0 -960 960 960" width="' + size + '" height="' + size + '" fill="currentColor" aria-hidden="true" class="' + (cls || 'shrink-0') + '"><path d="' + ICONS[name] + '"></path></svg>';
  }
  function switchHtml(on, disabled) {
    return '<button type="button" role="switch" aria-checked="' + on + '" data-switch ' + (disabled ? 'disabled' : '') + ' class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ' + (on ? 'bg-primary' : 'bg-border') + (disabled ? ' opacity-50' : '') + '">' +
      '<span class="absolute h-5 w-5 rounded-full bg-white shadow transition-all" style="' + (on ? 'right:2px;' : 'left:2px;') + '"></span></button>';
  }

  /* ============ ドロップダウンメニュー ============ */
  var MENU_ITEMS =
    '<button type="button" data-um-action="profile" class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-text hover:bg-background">' + icon('person', 16) + 'プロフィール</button>' +
    '<button type="button" data-um-action="settings" class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-text hover:bg-background">' + icon('settings', 16) + '設定</button>' +
    '<button type="button" data-um-action="release-notes" class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-text hover:bg-background">' + icon('info', 16) + 'アップデート情報</button>' +
    '<button type="button" data-um-action="logout" class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-text hover:bg-background">' + icon('logout', 16) + 'ログアウト</button>';

  function buildMenu(positionCls, withHeader) {
    var el = document.createElement('div');
    el.setAttribute('data-user-menu', '');
    el.className = 'absolute z-[110] w-48 rounded-lg border border-border bg-background-light py-1 shadow-md ' + positionCls;
    el.innerHTML = (withHeader
      ? '<div class="border-b border-border px-4 py-2"><p class="truncate text-sm font-semibold text-text">田中 佑樹</p><p class="truncate text-xs text-subtle">tanaka@ict-o.com</p></div>'
      : '') + MENU_ITEMS;
    return el;
  }

  function closeMenus() {
    document.querySelectorAll('[data-user-menu]').forEach(function (m) { m.remove(); });
  }

  function attachMenu(btn, positionCls, withHeader) {
    if (!btn) return;
    var wrap = btn.parentElement;
    if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';
    btn.setAttribute('aria-haspopup', 'true');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var existing = wrap.querySelector('[data-user-menu]');
      closeMenus();
      if (!existing) wrap.appendChild(buildMenu(positionCls, withHeader));
    });
  }

  /* ============ 設定モーダル (UserSettingsModal) ============ */
  var PREFS = ['お知らせ', 'クエスト', 'アイデア', '書類提出', '経費精算', '安否確認'];

  function prefListHtml(channel) {
    return '<div class="mt-3 overflow-hidden rounded-lg">' + PREFS.map(function (label, i) {
      return '<div class="bg-background px-3 py-2.5 text-sm text-text' + (i > 0 ? ' border-t border-border' : '') + '"><div class="flex items-center justify-between"><span>' + label + '</span>' + switchHtml(channel === 'push' ? true : (i === 0), false) + '</div></div>';
    }).join('') + '</div>';
  }

  function prefSelectHtml(id, selected) {
    var prefs = ['-- 選択してください --', '東京都', '神奈川県', '埼玉県', '千葉県', '大阪府'];
    return '<select id="' + id + '" class="h-9 w-full rounded-lg border border-border bg-background-light px-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50">' +
      prefs.map(function (p) { return '<option' + (p === selected ? ' selected' : '') + '>' + p + '</option>'; }).join('') + '</select>';
  }
  function munSelectHtml(id, selected) {
    var muns = ['-- 選択してください --', '千代田区', '中央区', '港区', '新宿区', '渋谷区'];
    return '<select id="' + id + '" class="h-9 w-full rounded-lg border border-border bg-background-light px-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50">' +
      muns.map(function (m) { return '<option' + (m === selected ? ' selected' : '') + '>' + m + '</option>'; }).join('') + '</select>';
  }

  var USER_TAB_HTML =
    '<p class="mb-5 hidden text-sm font-bold text-text md:block">ユーザー設定</p>' +
    '<div class="space-y-4">' +
    '<div><p class="mb-1.5 text-xs font-semibold text-text">自宅の市区町村</p><div class="space-y-2">' +
    '<div><label class="mb-1 block text-xs text-subtle" for="homePref">都道府県</label>' + prefSelectHtml('homePref', '東京都') + '</div>' +
    '<div><label class="mb-1 block text-xs text-subtle" for="homeMun">市区町村</label>' + munSelectHtml('homeMun', '新宿区') + '</div>' +
    '</div></div>' +
    '<div><p class="mb-1.5 text-xs font-semibold text-text">勤務地の市区町村</p><div class="space-y-2">' +
    '<div><label class="mb-1 block text-xs text-subtle" for="officePref">都道府県</label>' + prefSelectHtml('officePref', '東京都') + '</div>' +
    '<div><label class="mb-1 block text-xs text-subtle" for="officeMun">市区町村</label>' + munSelectHtml('officeMun', '港区') + '</div>' +
    '</div></div>' +
    '</div>';

  var NOTIF_TAB_HTML =
    '<p class="mb-5 hidden text-sm font-bold text-text md:block">通知</p>' +
    '<div><div class="flex items-start justify-between gap-4"><div>' +
    '<p class="text-sm font-semibold text-text">プッシュ通知</p>' +
    '<p class="mt-0.5 text-xs text-subtle">アプリを開いていなくても通知を受け取る</p>' +
    '</div>' + switchHtml(true, false) + '</div>' + prefListHtml('push') + '</div>' +
    '<div class="my-4 border-t border-border"></div>' +
    '<div><div class="flex items-start justify-between gap-4"><div>' +
    '<p class="text-sm font-semibold text-text">メール通知</p>' +
    '<p class="mt-0.5 text-xs text-subtle">初期状態はオフです</p>' +
    '</div><div class="flex items-center gap-2">' +
    '<button type="button" class="whitespace-nowrap rounded-full border border-border bg-background-light px-3 py-1 text-xs text-text transition-colors hover:bg-background">テスト配信</button>' +
    switchHtml(false, false) + '</div></div></div>';

  function settingsModalHtml() {
    return '' +
      '<div data-modal-overlay class="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4">' +
      '<div role="dialog" aria-modal="true" aria-labelledby="user-settings-title" tabindex="-1" class="flex w-full max-w-xl flex-col rounded-[20px] bg-background-light shadow-md outline-none" style="height:min(80vh,560px);">' +
      /* ヘッダー */
      '<div class="flex flex-shrink-0 items-center gap-2 border-b border-border px-5 py-4">' +
      '<button type="button" data-settings-back aria-label="戻る" class="hidden shrink-0 items-center text-sm text-primary md:!hidden">&lt;</button>' +
      '<h2 id="user-settings-title" class="flex-1 text-base font-bold text-text"><span class="md:hidden" data-settings-mobile-title>設定</span><span class="hidden md:inline">設定</span></h2>' +
      '<button type="button" data-modal-close aria-label="閉じる" class="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-subtle transition-colors hover:bg-black/[0.08]">' + icon('close', 16) + '</button>' +
      '</div>' +
      /* ボディ */
      '<div class="flex flex-1 overflow-hidden">' +
      /* モバイル: メニューリスト */
      '<div data-settings-mobile-list class="flex flex-1 flex-col overflow-y-auto md:hidden">' +
      '<button type="button" data-settings-tab-btn="user" class="flex items-center justify-between border-b border-border px-6 py-4 text-sm text-subtle transition-colors hover:bg-background"><span class="flex items-center gap-2.5 text-text">' + icon('person', 16) + 'ユーザー設定</span><span aria-hidden="true">&gt;</span></button>' +
      '<button type="button" data-settings-tab-btn="notification" class="flex items-center justify-between border-b border-border px-6 py-4 text-sm text-subtle transition-colors hover:bg-background"><span class="flex items-center gap-2.5 text-text">' + icon('notifications', 16) + '通知</span><span aria-hidden="true">&gt;</span></button>' +
      '</div>' +
      /* デスクトップ: 左タブレール */
      '<div role="tablist" aria-label="設定タブ" aria-orientation="vertical" class="hidden md:flex md:w-44 md:flex-shrink-0 md:flex-col gap-1 rounded-bl-[20px] border-r border-border bg-background p-3">' +
      '<button type="button" role="tab" data-settings-tab="user" aria-selected="true" class="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-left text-sm font-semibold text-primary transition-colors">' + icon('person', 15) + 'ユーザー設定</button>' +
      '<button type="button" role="tab" data-settings-tab="notification" aria-selected="false" class="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-subtle transition-colors hover:bg-background-light">' + icon('notifications', 15) + '通知</button>' +
      '</div>' +
      /* コンテンツ */
      '<div data-settings-content class="hidden flex-1 flex-col overflow-hidden md:flex">' +
      '<div role="tabpanel" class="flex-1 overflow-y-auto px-6 py-5">' +
      '<div data-settings-panel="user">' + USER_TAB_HTML + '</div>' +
      '<div data-settings-panel="notification" style="display:none;">' + NOTIF_TAB_HTML + '</div>' +
      '</div></div>' +
      '</div>' +
      /* フッター（変更時のみ） */
      '<div data-settings-footer class="hidden flex-shrink-0 justify-end gap-2 border-t border-border px-5 py-3">' +
      '<button type="button" data-modal-close class="rounded-lg border border-border bg-background-light px-4 py-1.5 text-sm text-text transition-colors hover:bg-background">キャンセル</button>' +
      '<button type="button" data-modal-close class="rounded-lg bg-primary px-5 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-85">保存する</button>' +
      '</div>' +
      '</div></div>';
  }

  /* ============ プロフィールモーダル ============ */
  function profileModalHtml() {
    return '' +
      '<div data-modal-overlay class="fixed inset-0 z-[120] flex items-end justify-center bg-black/45 md:items-center md:p-4">' +
      '<div role="dialog" aria-modal="true" aria-label="プロフィール" tabindex="-1" class="flex w-full flex-col rounded-t-2xl bg-background-light shadow-md outline-none h-[calc(100dvh-3.5rem)] md:h-auto md:max-h-[min(80vh,560px)] md:max-w-sm md:rounded-2xl">' +
      /* ドラッグハンドル（モバイルのみ） */
      '<div class="flex flex-shrink-0 justify-center py-2 md:hidden"><span class="h-1 w-9 rounded-full bg-border"></span></div>' +
      /* ヒーローヘッダー（ネイビーグラデーション） */
      '<div class="relative flex-shrink-0 rounded-t-2xl py-6 text-center" style="background:linear-gradient(160deg, #042154 0%, #0d3b86 100%);">' +
      '<button type="button" data-modal-close aria-label="閉じる" class="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white">' + icon('close', 16) + '</button>' +
      '<p class="text-xs font-semibold tracking-wide text-white/70">プロフィール</p>' +
      '<div class="mx-auto mt-3 flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-white/25 text-2xl font-bold text-primary" style="background:linear-gradient(135deg, #C6A75E, #7A6030);">田</div>' +
      '<a href="https://myprofile.microsoft.com/" target="_blank" rel="noopener noreferrer" class="mt-2 inline-flex items-center gap-1 text-[11px] text-white/50 underline underline-offset-2 hover:text-white/80">M365で変更' +
      '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>' +
      '</div>' +
      /* フィールド群 */
      '<div class="flex-1 overflow-y-auto px-5 py-4">' +
      '<div class="space-y-4">' +
      '<div>' +
      '<p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-subtle-light">名前</p>' +
      '<div class="flex items-center justify-between border-b border-border py-2">' +
      '<span class="text-sm text-subtle">田中 佑樹</span>' +
      '<span class="text-[10px] text-subtle-light">Entra IDで管理</span>' +
      '</div></div>' +
      '<div>' +
      '<p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-subtle-light">メールアドレス</p>' +
      '<div class="flex items-center justify-between border-b border-border py-2">' +
      '<span class="text-sm text-subtle">tanaka@ict-o.com</span>' +
      '<span class="text-[10px] text-subtle-light">Entra IDで管理</span>' +
      '</div></div>' +
      '<div>' +
      '<p aria-hidden="true" class="mb-1 text-[10px] font-bold uppercase tracking-wider text-subtle-light">自己紹介</p>' +
      '<textarea data-profile-bio rows="3" aria-label="自己紹介（500字以内）" placeholder="自己紹介を入力してください（500字以内）" class="w-full resize-none border-b-2 border-border bg-transparent py-2 text-sm text-text outline-none placeholder:text-subtle-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"></textarea>' +
      '<p data-profile-bio-count class="mt-1 text-right text-[10px] text-subtle-light">0 / 500</p>' +
      '</div>' +
      '</div>' +
      '</div>' +
      /* フッター（変更時のみ表示） */
      '<div data-profile-footer class="hidden flex-shrink-0 justify-end gap-2 border-t border-border px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">' +
      '<button type="button" data-modal-close class="inline-flex min-h-10 items-center rounded-full border border-border bg-background-light px-4 py-1.5 text-sm font-medium text-text transition-colors hover:bg-black/[0.08]">キャンセル</button>' +
      '<button type="button" data-profile-save data-modal-close class="inline-flex min-h-10 items-center rounded-full bg-primary px-5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-mid disabled:opacity-[0.38] disabled:cursor-not-allowed">保存する</button>' +
      '</div>' +
      '</div></div>';
  }

  /* ============ アップデート情報モーダル (簡易) ============ */
  function releaseNotesModalHtml() {
    return '' +
      '<div data-modal-overlay class="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4">' +
      '<div role="dialog" aria-modal="true" tabindex="-1" class="flex w-full max-w-md flex-col rounded-[20px] bg-background-light shadow-md outline-none" style="max-height:min(80vh,560px);">' +
      '<div class="flex flex-shrink-0 items-center gap-2 border-b border-border px-5 py-4">' +
      '<h2 class="flex-1 text-base font-bold text-text">アップデート情報</h2>' +
      '<button type="button" data-modal-close aria-label="閉じる" class="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-subtle transition-colors hover:bg-black/[0.08]">' + icon('close', 16) + '</button>' +
      '</div>' +
      '<div class="flex-1 overflow-y-auto px-6 py-5">' +
      '<div class="mb-5"><div class="mb-1.5 flex items-center gap-2"><span class="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-primary">v2.4.0</span><span class="text-xs text-subtle">2026/06/28</span></div>' +
      '<ul class="list-disc space-y-1 pl-5 text-sm text-text"><li>経費精算の受領依頼フローを追加</li><li>クエストボードのフィルタを改善</li></ul></div>' +
      '<div class="mb-5"><div class="mb-1.5 flex items-center gap-2"><span class="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-bold text-subtle">v2.3.0</span><span class="text-xs text-subtle">2026/05/15</span></div>' +
      '<ul class="list-disc space-y-1 pl-5 text-sm text-text"><li>安否確認の自動発報に洪水警戒レベルを追加</li><li>通知のカテゴリ別設定に対応</li></ul></div>' +
      '</div>' +
      '</div></div>';
  }

  /* ============ モーダル制御 ============ */
  function openModal(html) {
    closeModal();
    var host = document.createElement('div');
    host.setAttribute('data-modal-host', '');
    host.innerHTML = html;
    document.body.appendChild(host);
    var dialog = host.querySelector('[role="dialog"]');
    if (dialog) dialog.focus();
  }
  function closeModal() {
    document.querySelectorAll('[data-modal-host]').forEach(function (m) { m.remove(); });
  }

  document.addEventListener('click', function (e) {
    var action = e.target.closest('[data-um-action]');
    if (action) {
      closeMenus();
      var kind = action.getAttribute('data-um-action');
      if (kind === 'settings') openModal(settingsModalHtml());
      else if (kind === 'profile') openModal(profileModalHtml());
      else if (kind === 'release-notes') openModal(releaseNotesModalHtml());
      else if (kind === 'logout') window.location.href = 'CrewNest Login.html';
      return;
    }
    if (e.target.closest('[data-modal-close]')) { closeModal(); return; }
    var overlay = e.target.closest('[data-modal-overlay]');
    if (overlay && e.target === overlay) { closeModal(); return; }

    // 設定モーダル: デスクトップタブ切替
    var tabBtn = e.target.closest('[data-settings-tab]');
    if (tabBtn) { selectSettingsTab(tabBtn.getAttribute('data-settings-tab')); return; }
    // 設定モーダル: モバイルのメニュー → パネル
    var mTabBtn = e.target.closest('[data-settings-tab-btn]');
    if (mTabBtn) {
      selectSettingsTab(mTabBtn.getAttribute('data-settings-tab-btn'));
      var host = document.querySelector('[data-modal-host]');
      if (host) {
        host.querySelector('[data-settings-mobile-list]').style.display = 'none';
        var content = host.querySelector('[data-settings-content]');
        content.classList.remove('hidden');
        content.style.display = 'flex';
        var back = host.querySelector('[data-settings-back]');
        back.style.display = 'flex';
        back.classList.remove('hidden', 'md:!hidden');
        back.classList.add('md:!hidden');
      }
      return;
    }
    // 設定モーダル: モバイル戻る
    if (e.target.closest('[data-settings-back]')) {
      var host2 = document.querySelector('[data-modal-host]');
      if (host2) {
        host2.querySelector('[data-settings-mobile-list]').style.display = '';
        var content2 = host2.querySelector('[data-settings-content]');
        content2.style.display = '';
        content2.classList.add('hidden');
        e.target.closest('[data-settings-back]').style.display = 'none';
        host2.querySelector('[data-settings-mobile-title]').textContent = '設定';
      }
      return;
    }
    // スイッチ切替
    var sw = e.target.closest('[data-switch]');
    if (sw && !sw.disabled) {
      var on = sw.getAttribute('aria-checked') === 'true';
      sw.setAttribute('aria-checked', String(!on));
      sw.classList.toggle('bg-primary', !on);
      sw.classList.toggle('bg-border', on);
      var knob = sw.querySelector('span');
      knob.style.left = !on ? '' : '2px';
      knob.style.right = !on ? '2px' : '';
      return;
    }
    // メニュー外クリックで閉じる
    if (!e.target.closest('[data-user-menu]')) closeMenus();
  });

  function selectSettingsTab(key) {
    var host = document.querySelector('[data-modal-host]');
    if (!host) return;
    host.querySelectorAll('[data-settings-tab]').forEach(function (b) {
      var active = b.getAttribute('data-settings-tab') === key;
      b.setAttribute('aria-selected', String(active));
      b.classList.toggle('bg-primary/10', active);
      b.classList.toggle('text-primary', active);
      b.classList.toggle('font-semibold', active);
      b.classList.toggle('text-subtle', !active);
    });
    host.querySelectorAll('[data-settings-panel]').forEach(function (p) {
      p.style.display = p.getAttribute('data-settings-panel') === key ? '' : 'none';
    });
    var mt = host.querySelector('[data-settings-mobile-title]');
    if (mt) mt.textContent = key === 'user' ? 'ユーザー設定' : '通知';
  }

  // ユーザー設定変更でフッター表示（保存フローの再現）
  document.addEventListener('change', function (e) {
    if (e.target.closest('[data-settings-panel="user"]')) {
      var footer = document.querySelector('[data-settings-footer]');
      if (footer) { footer.classList.remove('hidden'); footer.classList.add('flex'); }
    }
  });

  // プロフィール: 自己紹介の文字数カウンタ + 変更時のみフッター表示（ProfileModal の hasChanges / overLimit を再現）
  document.addEventListener('input', function (e) {
    var bio = e.target.closest('[data-profile-bio]');
    if (!bio) return;
    var over = bio.value.length > 500;
    var count = document.querySelector('[data-profile-bio-count]');
    if (count) {
      count.textContent = bio.value.length + ' / 500';
      count.classList.toggle('text-danger', over);
      count.classList.toggle('text-subtle-light', !over);
    }
    bio.classList.toggle('border-danger', over);
    bio.classList.toggle('border-border', !over);
    bio.setAttribute('aria-invalid', String(over));
    var save = document.querySelector('[data-profile-save]');
    if (save) save.disabled = over;
    var footer = document.querySelector('[data-profile-footer]');
    if (footer) {
      var changed = bio.value !== bio.defaultValue; // 現在値と保存済み値の比較（hasChanges 相当）
      footer.classList.toggle('hidden', !changed);
      footer.classList.toggle('flex', changed);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeModal(); closeMenus(); }
  });

  /* ============ 初期化: ボタンにメニューを取り付け ============ */
  function init() {
    // サイドナビ下部のユーザーボタン（名前+メール表示のボタン）
    var sideBtn = document.querySelector('aside .border-t.border-white\\/10 button');
    attachMenu(sideBtn, 'bottom-full left-2 right-2 mb-1 w-auto', false);
    // モバイルヘッダーのアカウントボタン
    var mobileBtn = document.querySelector('header button[aria-label="アカウント"]');
    attachMenu(mobileBtn, 'right-0 top-full mt-1', true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
