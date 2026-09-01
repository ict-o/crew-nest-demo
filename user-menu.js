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

  // public/icons/ui/*.svg（24x24 の Material Icons）と同一パス。ui/Icon の mask 方式を静的モックではインライン SVG で再現する
  var ICONS24 = {
    calendar_today: 'M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z',
    chevron_right: 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z',
    refresh: 'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
    add: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'
  };
  function icon24(name, size, cls) {
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="currentColor" aria-hidden="true" class="' + (cls || 'shrink-0') + '"><path d="' + ICONS24[name] + '"></path></svg>';
  }

  // Microsoft Loop ロゴ（public/icons/links/loop.svg は別用途で使用中のため、ここではインライン化する）
  var LOOP_ICON_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<defs>' +
    '<radialGradient id="loopA" cx="0" cy="0" gradientTransform="matrix(13.40004 -2.3 6.04701 35.2304 .3 8.2)" gradientUnits="userSpaceOnUse" r="1"><stop offset="0" stop-color="#6d05e8"></stop><stop offset="1" stop-color="#6d05e8" stop-opacity="0"></stop></radialGradient>' +
    '<linearGradient id="loopB" gradientUnits="userSpaceOnUse" x1="14.2" x2="10.9" y1="9.1" y2="22.6"><stop offset="0" stop-color="#9237e3"></stop><stop offset="1" stop-color="#48e6f3"></stop></linearGradient>' +
    '<linearGradient id="loopC" gradientUnits="userSpaceOnUse" x1="8.5" x2="17.3" y1="20.5" y2="18.5"><stop offset="0" stop-color="#51e6ff"></stop><stop offset="1" stop-color="#71d4ff" stop-opacity="0"></stop></linearGradient>' +
    '<linearGradient id="loopD" gradientUnits="userSpaceOnUse" x1="6.1" x2="11.2" y1="12.7" y2="5.5"><stop offset="0" stop-color="#6e06e9"></stop><stop offset="1" stop-color="#ab5add" stop-opacity="0"></stop></linearGradient>' +
    '</defs>' +
    '<path d="m12 2a10 10 0 0 0 -10 10v10h10a10 10 0 0 0 0-20zm0 6.5a3.5 3.5 0 1 1 0 7h-3.5v-3.5a3.5 3.5 0 0 1 3.5-3.5z" fill="url(#loopB)"></path>' +
    '<path d="m22 12a10 10 0 0 1 -10 10h-10a6.5 6.5 0 0 1 6.5-6.5h3.5a3.5 3.5 0 0 0 3.5-3.5z" fill="url(#loopC)"></path>' +
    '<path d="m12 2a10 10 0 0 0 -10 10v10a6.5 6.5 0 0 0 6.5-6.48l.02-.02h-.02v-3.5a3.5 3.5 0 0 1 6-2.46l4.6-4.58a9.97 9.97 0 0 0 -7.1-2.96z" fill="url(#loopD)"></path>' +
    '<path d="m12 2a10 10 0 0 0 -10 10v10a6.5 6.5 0 0 0 6.5-6.48l.02-.02h-.02v-3.5a3.5 3.5 0 0 1 6-2.46l4.6-4.58a9.97 9.97 0 0 0 -7.1-2.96z" fill="url(#loopA)"></path>' +
    '</svg>';

  // マークダウンエディタ共通ツールバー（CrewNest Admin.html の ann-body-m と同一の見た目・アイコン）
  var MD_TOOLBAR_HTML = '<div class="flex flex-nowrap items-center gap-0.5 overflow-x-auto rounded-t-lg border border-b-0 border-border bg-background px-2 py-1">' +
    '<button type="button" aria-label="太字" title="太字" class="flex h-7 min-w-7 items-center justify-center rounded px-1 text-subtle transition-colors hover:bg-border hover:text-text"><svg viewBox="0 -960 960 960" width="16" height="16" fill="currentColor"><path d="M272-200v-560h221q65 0 120 40t55 111q0 51-23 78.5T602-491q25 11 55.5 41t30.5 90q0 89-65 124.5T501-200H272Zm121-112h104q48 0 58.5-24.5T566-372q0-11-10.5-35.5T494-432H393v120Zm0-228h93q33 0 48-17t15-38q0-24-17-39t-44-15h-95v109Z"></path></svg></button>' +
    '<button type="button" aria-label="斜体" title="斜体" class="flex h-7 min-w-7 items-center justify-center rounded px-1 text-subtle transition-colors hover:bg-border hover:text-text"><svg viewBox="0 -960 960 960" width="16" height="16" fill="currentColor"><path d="M200-200v-100h160l120-360H320v-100h400v100H580L460-300h140v100H200Z"></path></svg></button>' +
    '<button type="button" aria-label="取り消し線" title="取り消し線" class="flex h-7 min-w-7 items-center justify-center rounded px-1 text-subtle transition-colors hover:bg-border hover:text-text"><svg viewBox="0 -960 960 960" width="16" height="16" fill="currentColor"><path d="m486-160q-76 0-135-45t-85-123l88-38q14 48 48.5 79t85.5 31q42 0 76-20t34-64q0-18-7-33t-19-27h112q5 14 7.5 28.5T694-340q0 86-61.5 133T486-160ZM80-480v-80h800v80H80Zm402-326q66 0 115.5 32.5T674-674l-88 39q-9-29-33.5-52T484-710q-41 0-68 18.5T386-640h-96q2-69 54.5-117.5T482-806Z"></path></svg></button>' +
    '<span aria-hidden="true" class="mx-1 h-4 w-px bg-border"></span>' +
    '<button type="button" aria-label="見出し" title="見出し" class="flex h-7 min-w-7 items-center justify-center rounded px-1 text-subtle transition-colors hover:bg-border hover:text-text"><svg viewBox="0 -960 960 960" width="16" height="16" fill="currentColor"><path d="M120-280v-400h80v160h160v-160h80v400h-80v-160H200v160h-80Zm400 0v-160q0-33 23.5-56.5T600-520h160v-80H520v-80h240q33 0 56.5 23.5T840-600v80q0 33-23.5 56.5T760-440H600v80h240v80H520Z"></path></svg></button>' +
    '<span aria-hidden="true" class="mx-1 h-4 w-px bg-border"></span>' +
    '<button type="button" aria-label="箇条書き" title="箇条書き" class="flex h-7 min-w-7 items-center justify-center rounded px-1 text-subtle transition-colors hover:bg-border hover:text-text"><svg viewBox="0 -960 960 960" width="16" height="16" fill="currentColor"><path d="M360-200v-80h480v80H360Zm0-240v-80h480v80H360Zm0-240v-80h480v80H360ZM200-160q-33 0-56.5-23.5T120-240q0-33 23.5-56.5T200-320q33 0 56.5 23.5T280-240q0 33-23.5 56.5T200-160Zm0-240q-33 0-56.5-23.5T120-480q0-33 23.5-56.5T200-560q33 0 56.5 23.5T280-480q0 33-23.5 56.5T200-400Zm0-240q-33 0-56.5-23.5T120-720q0-33 23.5-56.5T200-800q33 0 56.5 23.5T280-720q0 33-23.5 56.5T200-640Z"></path></svg></button>' +
    '<button type="button" aria-label="番号付きリスト" title="番号付きリスト" class="flex h-7 min-w-7 items-center justify-center rounded px-1 text-subtle transition-colors hover:bg-border hover:text-text"><svg viewBox="0 -960 960 960" width="16" height="16" fill="currentColor"><path d="M120-80v-60h100v-30h-60v-60h60v-30H120v-60h120q17 0 28.5 11.5T280-280v40q0 17-11.5 28.5T240-200q17 0 28.5 11.5T280-160v40q0 17-11.5 28.5T240-80H120Zm0-280v-110q0-17 11.5-28.5T160-510h60v-30H120v-60h120q17 0 28.5 11.5T280-560v70q0 17-11.5 28.5T240-450h-60v30h100v60H120Zm60-280v-180h-60v-60h120v240h-60Zm180 440v-80h480v80H360Zm0-240v-80h480v80H360Zm0-240v-80h480v80H360Z"></path></svg></button>' +
    '<span aria-hidden="true" class="mx-1 h-4 w-px bg-border"></span>' +
    '<button type="button" aria-label="引用" title="引用" class="flex h-7 min-w-7 items-center justify-center rounded px-1 text-subtle transition-colors hover:bg-border hover:text-text"><svg viewBox="0 -960 960 960" width="16" height="16" fill="currentColor"><path d="m228-240 92-160q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 23-5.5 42.5T458-480L320-240h-92Zm360 0 92-160q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 23-5.5 42.5T818-480L680-240h-92ZM320-500q25 0 42.5-17.5T380-560q0-25-17.5-42.5T320-620q-25 0-42.5 17.5T260-560q0 25 17.5 42.5T320-500Zm360 0q25 0 42.5-17.5T740-560q0-25-17.5-42.5T680-620q-25 0-42.5 17.5T620-560q0 25 17.5 42.5T680-500Zm0-60Zm-360 0Z"></path></svg></button>' +
    '<button type="button" aria-label="リンク" title="リンク" class="flex h-7 min-w-7 items-center justify-center rounded px-1 text-subtle transition-colors hover:bg-border hover:text-text"><svg viewBox="0 -960 960 960" width="16" height="16" fill="currentColor"><path d="M680-160v-120H560v-80h120v-120h80v120h120v80H760v120h-80ZM440-280H280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h160v80H280q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h320v80H320Zm560-40h-80q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480Z"></path></svg></button>' +
    '</div>';
  function switchHtml(on, disabled, label) {
    return '<button type="button" role="switch" aria-checked="' + on + '"' + (label ? ' aria-label="' + label + '"' : '') + ' data-switch ' + (disabled ? 'disabled' : '') + ' class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ' + (on ? 'bg-primary' : 'bg-border') + (disabled ? ' opacity-50' : '') + '">' +
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
  var SETTINGS_TAB_LABEL = { user: 'ユーザー設定', notification: '通知', calendar: 'カレンダー' };

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

  /* ---- カレンダータブ (CalendarSettingsTab.tsx / CalendarSourceDetail.tsx) ---- */
  // 色プリセットは src/lib/calendar/constants.ts の CALENDAR_COLOR_PRESETS と同じ並び
  var CAL_COLORS = ['#2D5BBA', '#5A9E74', '#C46A6A', '#D89B4A', '#8A6FC0', '#4AA3A3', '#C77BA3', '#8A99B8'];
  var CAL_COLOR_NAMES = ['ネイビー', 'グリーン', 'レッド', 'オレンジ', 'パープル', 'ティール', 'ピンク', 'グレー'];
  var CAL_INPUT = 'w-full rounded-lg border border-border bg-background-light px-3 py-2 text-sm text-text placeholder:text-subtle-light focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-[0.38] disabled:cursor-not-allowed';
  // サンプルデータ。色は CrewNest Home.html のカレンダーウィジェットの予定ドットと対応させている
  var CAL_SOURCES = [
    { id: 'ms', provider: 'microsoft', name: 'Outlook 予定表', color: '#2D5BBA', sub: 'サインインアカウントに連動' },
    { id: 'gcal', provider: 'ics', name: '個人の予定', color: '#5A9E74', sub: '最終取得: 12分前', host: 'calendar.google.com' },
    { id: 'gomi', provider: 'ics', name: 'ゴミ収集の日', color: '#C46A6A', sub: '最終取得: 1時間前', host: 'www.example-city.lg.jp' }
  ];

  function calSwatchesHtml(selected) {
    return '<div data-cal-swatches class="flex flex-wrap gap-2">' + CAL_COLORS.map(function (c, i) {
      var on = c === selected;
      return '<button type="button" data-cal-swatch="' + c + '" aria-label="色を' + CAL_COLOR_NAMES[i] + 'に設定" aria-pressed="' + on + '" ' +
        'class="h-6 w-6 rounded-full border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ' +
        (on ? 'border-text shadow-[0_0_0_1px_#333333]' : 'border-transparent') + '" style="background-color:' + c + ';"></button>';
    }).join('') + '</div>';
  }

  function calRowHtml(s, i) {
    var isIcs = s.provider === 'ics';
    var badgeBase = 'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium';
    var badge = isIcs
      ? '<span class="' + badgeBase + ' border border-info-border bg-info-surface text-info">ICS</span>'
      : '<span class="' + badgeBase + ' bg-primary-lightest text-primary">Microsoft</span>';
    return '<div data-cal-row="' + s.id + '" class="' + (i > 0 ? 'border-t border-border ' : '') + 'px-3 py-2.5">' +
      '<div class="flex items-center gap-2">' +
      '<button type="button" data-cal-open="' + s.id + '" title="個別設定を開く" class="group flex min-w-0 flex-1 flex-col items-start gap-0.5 rounded-lg py-0.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">' +
      // min-w-0 max-w-full は名前の truncate を効かせるために必要（アプリ側は付いておらず、長い名前が更新ボタン・スイッチに重なる）
      '<span class="flex min-w-0 max-w-full items-center gap-1.5 text-sm font-semibold text-text">' +
      '<span aria-hidden="true" class="h-2.5 w-2.5 shrink-0 rounded-full" style="background-color:' + s.color + ';"></span>' +
      '<span class="truncate group-hover:underline">' + s.name + '</span>' + badge + '</span>' +
      '<span data-cal-sub="' + s.id + '" class="truncate text-xs text-subtle-light">' + s.sub + '</span>' +
      '</button>' +
      (isIcs
        ? '<button type="button" data-cal-refresh="' + s.id + '" aria-label="' + s.name + 'を今すぐ更新" title="今すぐ更新" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-subtle transition-colors hover:bg-black/[0.08] disabled:opacity-[0.38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">' + icon24('refresh', 16) + '</button>'
        : '') +
      switchHtml(true, false, s.name + 'を表示') +
      '<button type="button" data-cal-open="' + s.id + '" aria-label="' + s.name + 'の設定" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-subtle transition-colors hover:bg-black/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">' + icon24('chevron_right', 16) + '</button>' +
      '</div></div>';
  }

  function calDetailHtml(s) {
    var isIcs = s.provider === 'ics';
    return '<div data-cal-detail="' + s.id + '" style="display:none;">' +
      '<button type="button" data-cal-back class="mb-3.5 inline-flex items-center gap-0.5 rounded text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">' + icon24('chevron_right', 14, 'shrink-0 rotate-180') + 'カレンダー</button>' +
      '<div class="mb-1 flex items-center gap-2">' +
      '<span data-cal-dot aria-hidden="true" class="h-3 w-3 shrink-0 rounded-full" style="background-color:' + s.color + ';"></span>' +
      '<h4 class="text-sm font-bold text-text">' + s.name + '</h4></div>' +
      '<p class="mb-4 text-xs text-subtle-light">' + s.sub + '</p>' +
      (isIcs
        ? '<div class="mb-3"><label class="mb-1 block text-xs text-subtle" for="cal-name-' + s.id + '">表示名</label>' +
          '<input id="cal-name-' + s.id + '" value="' + s.name + '" class="' + CAL_INPUT + '"></div>'
        : '') +
      '<p class="mb-1 text-xs text-subtle">色</p>' + calSwatchesHtml(s.color) +
      (isIcs
        ? '<div class="mt-3"><label class="mb-1 block text-xs text-subtle" for="cal-url-' + s.id + '">iCal 形式の URL（ICS）</label>' +
          '<input id="cal-url-' + s.id + '" value="' + s.host + '" readonly class="' + CAL_INPUT + ' bg-background text-subtle">' +
          '<p class="mt-1.5 text-xs text-subtle-light">URL を変更する場合は、このカレンダーを削除してから追加し直してください。</p></div>'
        : '<p class="mt-3 text-xs leading-relaxed text-subtle-light">Outlook 予定表はサインインアカウントに連動しているため、削除や名前の変更はできません。表示したくない場合は一覧の表示スイッチをオフにしてください。</p>') +
      '<div class="mt-4 flex justify-end gap-2">' +
      '<button type="button" data-cal-back class="rounded-full border border-border bg-background-light px-4 py-1.5 text-xs font-medium text-text transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">キャンセル</button>' +
      '<button type="button" data-cal-back class="rounded-full bg-primary px-5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-mid active:bg-primary-darkest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">保存する</button>' +
      '</div>' +
      (isIcs
        ? '<div class="mt-4 border-t border-border pt-4">' +
          '<p class="text-xs font-semibold text-subtle">このカレンダーを削除</p>' +
          '<p class="mt-1 text-xs text-subtle-light">ウィジェットにこのカレンダーの予定が表示されなくなります。</p>' +
          '<button type="button" data-cal-delete="' + s.id + '" class="mt-2 rounded-full border border-danger-border bg-danger-surface px-4 py-1.5 text-xs font-semibold text-danger transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">削除</button></div>'
        : '') +
      '</div>';
  }

  // 追加フォーム（既定色は既存ソースで未使用の最初の色 = firstUnusedColor 相当）
  function calAddFormHtml() {
    var used = CAL_SOURCES.map(function (s) { return s.color; });
    var defaultColor = CAL_COLORS.filter(function (c) { return used.indexOf(c) === -1; })[0] || CAL_COLORS[0];
    return '<div data-cal-add-form class="mt-3 rounded-lg border border-border bg-background p-3.5" style="display:none;">' +
      '<label class="mb-1 block text-xs text-subtle" for="cal-add-name">表示名</label>' +
      '<input id="cal-add-name" data-cal-add-input placeholder="例: Google 個人カレンダー" class="' + CAL_INPUT + '">' +
      '<label class="mb-1 mt-3 block text-xs text-subtle" for="cal-add-url">iCal 形式の URL（ICS）</label>' +
      '<input id="cal-add-url" data-cal-add-input placeholder="https://calendar.google.com/calendar/ical/…/basic.ics" class="' + CAL_INPUT + '">' +
      '<p class="mb-1 mt-3 text-xs text-subtle">色</p>' + calSwatchesHtml(defaultColor) +
      '<div class="mt-3.5 flex justify-end gap-2">' +
      '<button type="button" data-cal-add-close class="rounded-full border border-border bg-background-light px-4 py-1.5 text-xs font-medium text-text transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">キャンセル</button>' +
      '<button type="button" data-cal-add-close data-cal-add-submit disabled class="rounded-full bg-primary px-5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-mid active:bg-primary-darkest disabled:opacity-[0.38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">追加する</button>' +
      '</div>' +
      '<p class="mt-3 text-xs leading-relaxed text-subtle-light"><b class="font-semibold text-subtle">Google カレンダーの URL の取得方法:</b> ' +
      'Google カレンダーの設定 → 対象のカレンダー → 「カレンダーの統合」→「iCal 形式の非公開 URL」をコピーして貼り付けてください。</p>' +
      '</div>';
  }

  var CAL_TAB_HTML =
    '<p class="mb-5 hidden text-sm font-bold text-text md:block">カレンダー</p>' +
    '<div data-cal-list>' +
    '<div class="rounded-lg border border-border">' + CAL_SOURCES.map(calRowHtml).join('') + '</div>' +
    calAddFormHtml() +
    '<div data-cal-add-actions>' +
    '<button type="button" data-cal-add-open class="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-background-light px-3.5 py-1.5 text-xs text-text transition-colors hover:bg-background">' + icon24('add', 14) + 'カレンダーを追加</button>' +
    '</div>' +
    '<p class="mt-3 text-xs leading-relaxed text-subtle-light">購読カレンダーは表示専用です。予定の反映には最大15分ほどかかります（更新ボタンですぐに再取得できます）。追加できるのは最大5件です。</p>' +
    '</div>' +
    CAL_SOURCES.map(calDetailHtml).join('');

  // 削除確認（AlertDialog nested 相当。設定モーダル z-[120] の上に出すため z-[130]）
  function calDeleteDialogHtml() {
    return '<div data-cal-dialog class="fixed inset-0 z-[130] items-center justify-center bg-black/50 p-4" style="display:none;">' +
      '<div role="alertdialog" aria-modal="true" aria-labelledby="cal-delete-title" class="w-full max-w-sm rounded-2xl bg-background-light p-6 shadow-md">' +
      '<p id="cal-delete-title" class="text-base font-bold text-text">カレンダーを削除しますか？</p>' +
      '<p data-cal-dialog-desc class="mt-2 text-sm text-subtle"></p>' +
      '<div class="mt-5 flex flex-col-reverse gap-2 md:flex-row md:justify-end">' +
      '<button type="button" data-cal-dialog-close class="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-background-light px-5 text-sm font-medium text-text transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">キャンセル</button>' +
      '<button type="button" data-cal-dialog-close data-cal-dialog-confirm class="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary-mid active:bg-primary-darkest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">削除する</button>' +
      '</div></div></div>';
  }

  function settingsModalHtml() {
    return '' +
      '<div data-modal-overlay class="fixed inset-0 z-[120] flex items-center justify-center bg-primary/30 p-4 md:bg-black/45">' +
      '<div role="dialog" aria-modal="true" aria-labelledby="user-settings-title" tabindex="-1" class="fixed inset-x-0 bottom-0 flex h-[85dvh] max-h-[85vh] w-full flex-col rounded-t-2xl bg-background-light shadow-md outline-none md:static md:h-auto md:max-h-[min(80vh,560px)] md:max-w-xl md:rounded-[20px]">' +
      /* ドラッグハンドル（モバイルのみ） */
      '<div class="flex flex-shrink-0 justify-center py-2 md:hidden"><span class="h-1 w-9 rounded-full bg-border"></span></div>' +
      /* ヘッダー */
      '<div class="flex flex-shrink-0 items-center gap-2 border-b border-border px-5 py-4">' +
      '<button type="button" data-settings-back aria-label="戻る" class="hidden shrink-0 items-center text-sm text-primary md:!hidden">&lt;</button>' +
      '<h2 id="user-settings-title" class="flex-1 text-base font-bold text-text"><span class="md:hidden" data-settings-mobile-title>設定</span><span class="hidden md:inline">設定</span></h2>' +
      '<button type="button" data-modal-close aria-label="閉じる" class="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-subtle transition-colors hover:bg-black/[0.08]">' + icon('close', 16) + '</button>' +
      '</div>' +
      /* ボディ */
      '<div class="flex flex-1 overflow-hidden">' +
      /* モバイル: メニューリスト */
      '<div data-settings-mobile-list class="flex flex-1 flex-col overflow-y-auto bg-background px-4 pt-2 md:hidden">' +
      '<span class="mb-1.5 mt-2 block text-[10.5px] font-semibold tracking-wide text-subtle">一般</span>' +
      '<div class="divide-y divide-border rounded-lg border border-border bg-background-light shadow-sm">' +
      '<button type="button" data-settings-tab-btn="user" class="flex w-full items-center gap-3 rounded-t-lg px-4 py-3.5 text-left transition-colors hover:bg-background"><span aria-hidden="true" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background">' + icon('person', 20, 'text-primary') + '</span><span class="min-w-0 flex-1 text-sm font-semibold text-text">ユーザー設定</span>' + icon24('chevron_right', 16, 'shrink-0 text-subtle-light') + '</button>' +
      '<button type="button" data-settings-tab-btn="notification" class="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-background"><span aria-hidden="true" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background">' + icon('notifications', 20, 'text-primary') + '</span><span class="min-w-0 flex-1 text-sm font-semibold text-text">通知</span>' + icon24('chevron_right', 16, 'shrink-0 text-subtle-light') + '</button>' +
      '<button type="button" data-settings-tab-btn="calendar" class="flex w-full items-center gap-3 rounded-b-lg px-4 py-3.5 text-left transition-colors hover:bg-background"><span aria-hidden="true" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background">' + icon24('calendar_today', 20, 'text-primary') + '</span><span class="min-w-0 flex-1 text-sm font-semibold text-text">カレンダー</span>' + icon24('chevron_right', 16, 'shrink-0 text-subtle-light') + '</button>' +
      '</div>' +
      '</div>' +
      /* デスクトップ: 左タブレール */
      '<div role="tablist" aria-label="設定タブ" aria-orientation="vertical" class="hidden md:flex md:w-44 md:flex-shrink-0 md:flex-col gap-1 rounded-bl-[20px] border-r border-border bg-background p-3">' +
      '<button type="button" role="tab" data-settings-tab="user" aria-selected="true" class="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-left text-sm font-semibold text-primary transition-colors">' + icon('person', 15) + 'ユーザー設定</button>' +
      '<button type="button" role="tab" data-settings-tab="notification" aria-selected="false" class="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-subtle transition-colors hover:bg-background-light">' + icon('notifications', 15) + '通知</button>' +
      '<button type="button" role="tab" data-settings-tab="calendar" aria-selected="false" class="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-subtle transition-colors hover:bg-background-light">' + icon24('calendar_today', 15) + 'カレンダー</button>' +
      '</div>' +
      /* コンテンツ */
      '<div data-settings-content class="hidden flex-1 flex-col overflow-hidden md:flex">' +
      '<div role="tabpanel" class="flex-1 overflow-y-auto px-6 py-5">' +
      '<div data-settings-panel="user">' + USER_TAB_HTML + '</div>' +
      '<div data-settings-panel="notification" style="display:none;">' + NOTIF_TAB_HTML + '</div>' +
      '<div data-settings-panel="calendar" style="display:none;">' + CAL_TAB_HTML + '</div>' +
      '</div></div>' +
      '</div>' +
      /* フッター（変更時のみ） */
      '<div data-settings-footer class="hidden flex-shrink-0 justify-end gap-2 border-t border-border px-5 py-3">' +
      '<button type="button" data-modal-close class="rounded-lg border border-border bg-background-light px-4 py-1.5 text-sm text-text transition-colors hover:bg-background">キャンセル</button>' +
      '<button type="button" data-modal-close class="rounded-lg bg-primary px-5 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-85">保存する</button>' +
      '</div>' +
      '</div></div>' +
      calDeleteDialogHtml();
  }

  /* ============ プロフィールモーダル ============ */
  function profileModalHtml() {
    return '' +
      '<div data-modal-overlay class="fixed inset-0 z-[120] flex items-center justify-center bg-primary/30 p-4 md:bg-black/45">' +
      '<div role="dialog" aria-modal="true" aria-label="プロフィール" tabindex="-1" class="fixed inset-x-0 bottom-0 flex h-[85dvh] max-h-[85vh] w-full flex-col rounded-t-2xl bg-background-light shadow-md outline-none md:static md:h-auto md:max-h-[min(80vh,560px)] md:max-w-sm md:rounded-2xl">' +
      /* ドラッグハンドル（モバイルのみ） */
      '<div class="flex flex-shrink-0 justify-center py-2 md:hidden"><span class="h-1 w-9 rounded-full bg-border"></span></div>' +
      /* ヒーローヘッダー（ネイビーグラデーション） */
      '<div class="relative flex-shrink-0 rounded-t-2xl py-6 text-center" style="background:linear-gradient(160deg, #042154 0%, #0d3b86 100%);">' +
      '<button type="button" data-modal-close aria-label="閉じる" class="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white">' + icon('close', 16) + '</button>' +
      '<p class="text-xs font-semibold tracking-wide text-white/70">プロフィール</p>' +
      '<div class="mx-auto mt-3 flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-white/25 text-2xl font-bold text-primary" style="background:linear-gradient(135deg, #C6A75E, #7A6030);">田</div>' +
      '<a href="https://myprofile.microsoft.com/" target="_blank" rel="noopener noreferrer" class="mt-2 inline-flex items-center gap-1 text-[11px] text-white/50 underline underline-offset-2 hover:text-white/80">M365で変更' +
      '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>' +
      '<a href="https://loop.cloud.microsoft/" target="_blank" rel="noopener noreferrer" aria-label="Loopの自己紹介ページを見る" title="Loopの自己紹介ページを見る" class="absolute bottom-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-white/90">' + LOOP_ICON_SVG + '</a>' +
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
      '<div data-mdgroup="profile-bio" class="flex flex-col">' +
      '<div class="flex items-center justify-between">' +
      '<div class="flex gap-1" role="tablist">' +
      '<button type="button" data-mdtab="write" class="border-b-2 border-primary px-3 py-2 text-xs font-semibold text-primary">Write</button>' +
      '<button type="button" data-mdtab="preview" class="border-b-2 border-transparent px-3 py-2 text-xs text-subtle transition-colors hover:border-border hover:text-text">Preview</button>' +
      '</div>' +
      '<p data-profile-bio-count class="text-[11px] text-subtle-light">0 / 500</p>' +
      '</div>' +
      '<div data-mdpanel="write" class="mt-1">' +
      MD_TOOLBAR_HTML +
      '<textarea data-profile-bio rows="3" aria-label="自己紹介（500字以内）" placeholder="自己紹介を入力してください（500字以内）" class="w-full min-w-0 max-w-full resize-none overflow-y-auto rounded-b-lg border border-border bg-background-light px-3 py-2 text-sm text-text outline-none placeholder:text-subtle-light focus:outline-none focus:ring-2 focus:ring-primary/50 [field-sizing:content] max-h-[40vh]" style="min-height:5.25rem;"></textarea>' +
      '</div>' +
      '<div data-mdpanel="preview" class="mt-1 hidden max-h-[40vh] overflow-y-auto rounded-lg border border-border px-3.5 py-2.5 text-sm leading-relaxed text-text [&_p]:my-2 [&_strong]:font-bold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-0.5" style="min-height:5.25rem;">' +
      '<p><strong>営業部所属です。</strong>気軽に話しかけてください。</p><ul><li>出身: 神奈川県</li><li>趣味: キャンプ・カメラ</li></ul>' +
      '</div>' +
      '</div>' +
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
    // 設定モーダル（カレンダータブ）: 一覧 ⇄ 個別設定
    var calOpen = e.target.closest('[data-cal-open]');
    if (calOpen) { calShowDetail(calOpen.getAttribute('data-cal-open')); return; }
    if (e.target.closest('[data-cal-back]')) { calShowList(); return; }
    // 設定モーダル（カレンダータブ）: 追加フォームの開閉
    if (e.target.closest('[data-cal-add-open]')) { calToggleAddForm(true); return; }
    if (e.target.closest('[data-cal-add-close]')) { calToggleAddForm(false); return; }
    // 設定モーダル（カレンダータブ）: 色の選択
    var calSwatch = e.target.closest('[data-cal-swatch]');
    if (calSwatch) {
      var swGroup = calSwatch.closest('[data-cal-swatches]');
      swGroup.querySelectorAll('[data-cal-swatch]').forEach(function (b) {
        var on = b === calSwatch;
        b.setAttribute('aria-pressed', String(on));
        b.classList.toggle('border-text', on);
        b.classList.toggle('shadow-[0_0_0_1px_#333333]', on);
        b.classList.toggle('border-transparent', !on);
      });
      var detail = calSwatch.closest('[data-cal-detail]');
      var dot = detail && detail.querySelector('[data-cal-dot]');
      if (dot) dot.style.backgroundColor = calSwatch.getAttribute('data-cal-swatch');
      return;
    }
    // 設定モーダル（カレンダータブ）: 今すぐ更新
    var calRefresh = e.target.closest('[data-cal-refresh]');
    if (calRefresh && !calRefresh.disabled) {
      var refreshIcon = calRefresh.querySelector('svg');
      var refreshId = calRefresh.getAttribute('data-cal-refresh');
      calRefresh.disabled = true;
      if (refreshIcon) refreshIcon.classList.add('animate-spin');
      setTimeout(function () {
        calRefresh.disabled = false;
        if (refreshIcon) refreshIcon.classList.remove('animate-spin');
        var sub = document.querySelector('[data-cal-sub="' + refreshId + '"]');
        if (sub) sub.textContent = '最終取得: たった今';
      }, 900);
      return;
    }
    // 設定モーダル（カレンダータブ）: 削除確認ダイアログ
    var calDelete = e.target.closest('[data-cal-delete]');
    if (calDelete) { calOpenDeleteDialog(calDelete.getAttribute('data-cal-delete')); return; }
    var calDialogClose = e.target.closest('[data-cal-dialog-close]');
    if (calDialogClose) {
      calCloseDeleteDialog(calDialogClose.hasAttribute('data-cal-dialog-confirm'));
      return;
    }
    // マークダウンエディタ共通: Write/Preview タブ（プロフィールの自己紹介で使用。CrewNest Admin.html と同じ挙動）
    var mdt = e.target.closest('[data-mdtab]');
    if (mdt) {
      var mdkey = mdt.getAttribute('data-mdtab');
      var mdgroup = mdt.closest('[data-mdgroup]');
      if (mdgroup) {
        mdgroup.querySelectorAll('[data-mdtab]').forEach(function (b) {
          var act = b.getAttribute('data-mdtab') === mdkey;
          b.classList.toggle('border-primary', act); b.classList.toggle('font-semibold', act); b.classList.toggle('text-primary', act);
          b.classList.toggle('border-transparent', !act); b.classList.toggle('text-subtle', !act);
        });
        mdgroup.querySelectorAll('[data-mdpanel]').forEach(function (p) {
          p.classList.toggle('hidden', p.getAttribute('data-mdpanel') !== mdkey);
        });
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
    if (mt) mt.textContent = SETTINGS_TAB_LABEL[key] || '設定';
    if (key === 'calendar') { calShowList(); calToggleAddForm(false); }
  }

  /* ---- カレンダータブのビュー切替 ---- */
  function calShowList() {
    var host = document.querySelector('[data-modal-host]');
    if (!host) return;
    var list = host.querySelector('[data-cal-list]');
    if (list) list.style.display = '';
    host.querySelectorAll('[data-cal-detail]').forEach(function (d) { d.style.display = 'none'; });
  }
  function calShowDetail(id) {
    var host = document.querySelector('[data-modal-host]');
    if (!host) return;
    var list = host.querySelector('[data-cal-list]');
    if (list) list.style.display = 'none';
    host.querySelectorAll('[data-cal-detail]').forEach(function (d) {
      d.style.display = d.getAttribute('data-cal-detail') === id ? '' : 'none';
    });
  }
  function calToggleAddForm(open) {
    var host = document.querySelector('[data-modal-host]');
    if (!host) return;
    var form = host.querySelector('[data-cal-add-form]');
    var actions = host.querySelector('[data-cal-add-actions]');
    if (form) form.style.display = open ? '' : 'none';
    if (actions) actions.style.display = open ? 'none' : '';
  }
  function calOpenDeleteDialog(id) {
    var dialog = document.querySelector('[data-cal-dialog]');
    if (!dialog) return;
    var source = CAL_SOURCES.filter(function (s) { return s.id === id; })[0];
    var desc = dialog.querySelector('[data-cal-dialog-desc]');
    if (desc) desc.textContent = '「' + (source ? source.name : '') + '」の購読を解除します。ウィジェットにこのカレンダーの予定が表示されなくなります。';
    dialog.setAttribute('data-cal-dialog-target', id);
    dialog.style.display = 'flex';
  }
  function calCloseDeleteDialog(confirmed) {
    var dialog = document.querySelector('[data-cal-dialog]');
    if (!dialog) return;
    var id = dialog.getAttribute('data-cal-dialog-target');
    dialog.style.display = 'none';
    dialog.removeAttribute('data-cal-dialog-target');
    if (!confirmed) return;
    var host = document.querySelector('[data-modal-host]');
    if (host) {
      var row = host.querySelector('[data-cal-row="' + id + '"]');
      if (row) row.remove();
      var detail = host.querySelector('[data-cal-detail="' + id + '"]');
      if (detail) detail.remove();
      // 先頭行に区切り線が残らないよう付け直す
      host.querySelectorAll('[data-cal-row]').forEach(function (r, i) {
        r.classList.toggle('border-t', i > 0);
        r.classList.toggle('border-border', i > 0);
      });
    }
    calShowList();
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

  // カレンダー追加フォーム: 表示名と URL の両方が入るまで「追加する」を押せない（AddForm の disabled 条件を再現）
  document.addEventListener('input', function (e) {
    var calInput = e.target.closest('[data-cal-add-input]');
    if (!calInput) return;
    var form = calInput.closest('[data-cal-add-form]');
    var filled = Array.prototype.every.call(form.querySelectorAll('[data-cal-add-input]'), function (i) {
      return i.value.trim().length > 0;
    });
    var submit = form.querySelector('[data-cal-add-submit]');
    if (submit) submit.disabled = !filled;
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    // 削除確認ダイアログが開いているときは、まずダイアログだけ閉じる
    var calDialog = document.querySelector('[data-cal-dialog]');
    if (calDialog && calDialog.style.display === 'flex') { calCloseDeleteDialog(false); return; }
    closeModal(); closeMenus();
  });

  /* ============ 初期化: ボタンにメニューを取り付け ============ */
  function init() {
    // サイドナビ下部のユーザーボタン（名前+メール表示のボタン）
    // 検索行を追加すると border-t.border-white/10 の button が複数になるため、
    // 最初に一致した button を拾う書き方ではなくユーザー行だけを一意に指す data-tour="user-menu" で取得する
    var sideBtn = document.querySelector('aside [data-tour="user-menu"]');
    attachMenu(sideBtn, 'bottom-full left-2 right-2 mb-1 w-auto', false);
    // モバイルヘッダーのアカウントボタン
    var mobileBtn = document.querySelector('header button[aria-label="アカウント"]');
    attachMenu(mobileBtn, 'right-0 top-full mt-1', true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
