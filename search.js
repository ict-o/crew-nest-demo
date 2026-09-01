// CrewNest 共通: サイト内横断検索
// デスクトップ: 画面上部寄り中央のオーバーレイモーダル / モバイル: 下から出るボトムシート
// 開閉は既存の slide-panels.js（data-open-dialog / data-close-dialog / 背景クリック / Esc）に相乗り。
// ダイアログ DOM は more-sheet.js のシートと同じ流儀で、DOMContentLoaded 時に body へ注入する（9ページに同じマークアップを重複させない）
(function () {
  var DIALOG_HTML =
    '<div data-dialog="search" class="fixed inset-0 z-[110] items-end justify-center bg-black/45 md:items-start md:justify-center md:p-4 md:pt-24" style="display:none;">' +
    '<div role="dialog" aria-modal="true" aria-labelledby="search-modal-title" tabindex="-1" class="flex h-[85dvh] w-full flex-col rounded-t-2xl bg-background-light shadow-md outline-none md:h-auto md:max-h-[min(70vh,600px)] md:max-w-lg md:rounded-[20px]">' +
    '<div aria-hidden="true" class="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-border md:hidden"></div>' +
    '<h2 id="search-modal-title" class="sr-only">検索</h2>' +
    '<div class="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">' +
    '<span aria-hidden="true" class="flex h-5 w-5 shrink-0 items-center justify-center text-subtle-light">' +
    '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>' +
    '</span>' +
    '<input id="search-input" type="search" placeholder="アプリ内をまとめて検索" autocomplete="off" class="min-w-0 flex-1 border-none bg-transparent text-sm text-text placeholder:text-subtle-light focus:outline-none">' +
    '<button type="button" data-close-dialog aria-label="閉じる" class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-subtle transition-colors hover:bg-black/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">' +
    '<svg viewBox="0 -960 960 960" width="16" height="16" fill="currentColor"><path d="M256-200 200-256l224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"></path></svg>' +
    '</button>' +
    '</div>' +
    '<div id="search-results" class="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-2 py-2"></div>' +
    '</div>' +
    '</div>';

  var MIN_QUERY_LENGTH = 2;

  // 検索対象の種類ごとのアイコンは、サイドナビ・その他シートで使っている実ファイルをそのまま参照する（base64化して二重に埋め込まない）
  var GROUP_ORDER = ['notification', 'quest', 'proposal', 'announcement', 'document', 'quicklink', 'user'];
  var GROUP_LABEL = { notification: '通知', quest: 'クエスト', proposal: 'アイデア', announcement: 'お知らせ', document: '書類提出', quicklink: 'クイックリンク', user: 'ユーザー' };
  // 「設定」は SEARCH_ITEMS/GROUP_ORDER に含めず、常に末尾に別枠で描画する（本体 SearchDialog.tsx と同じ並び）
  var SETTINGS_LABEL = '設定';
  var ICON_SRC = {
    notification: 'public/icons/notification.png',
    quest: 'public/icons/quest.png',
    proposal: 'public/icons/proposal.png',
    announcement: 'public/icons/megaphone.png',
    document: 'public/icons/airplane.png',
    quicklink: 'public/icons/ui/open_in_new.svg'
  };
  // user / settings は既存の png アセットが無いため、user-menu.js の ICONS.person / ICONS.settings と同じパスをインライン化する
  var ICON_SVG_PATH = {
    user: 'M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z',
    settings: 'm370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-1 13.5l103 78-110 190-119-50q-11 8-23 15t-24 12L590-80H370Zm112-260q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Z'
  };

  // 設定カタログ。本体 settingsCatalog.ts の8件から4件（デモ用の抜粋）。description はキーワードにも使う
  var SETTINGS_CATALOG = [
    { id: 'home-address', label: '自宅の市区町村', description: 'ユーザー設定で自宅の都道府県・市区町村を登録します', keywords: ['自宅', '住所', '自宅の住所', '都道府県'] },
    { id: 'push-notification', label: 'プッシュ通知', description: '通知設定でプッシュ通知の受け取りを切り替えます', keywords: ['通知', 'プッシュ', 'push'] },
    { id: 'email-notification', label: 'メール通知', description: '通知設定でメール通知の受け取りを切り替えます', keywords: ['メール', '通知', 'mail'] },
    { id: 'calendar-integration', label: 'カレンダー連携', description: '外部カレンダーの追加・表示設定を変更します', keywords: ['カレンダー', '予定', '連携', 'google', 'outlook', 'ics'] }
  ];

  function searchSettingsCatalog(qLower) {
    return SETTINGS_CATALOG.filter(function (entry) {
      return entry.label.toLowerCase().indexOf(qLower) !== -1 ||
        entry.description.toLowerCase().indexOf(qLower) !== -1 ||
        entry.keywords.some(function (k) { return k.toLowerCase().indexOf(qLower) !== -1; });
    });
  }

  var SEARCH_ITEMS = [
    // 通知
    { type: 'notification', title: 'クエスト「日報を提出する」が承認されました', body: '+10 pt を獲得しました', meta: '2時間前' },
    { type: 'notification', title: '書類提出の依頼が届いています', body: '健康診断結果の提出をお願いします', meta: '1週間前' },
    { type: 'notification', title: 'アイデアの投票が始まりました', body: '「社内サークル活動費補助」への投票が始まりました', meta: '3日前' },
    { type: 'notification', title: 'アイデアが採用されました', body: '「ペーパーレス化推進」が採用されました', meta: '5日前' },
    { type: 'notification', title: '年末年始の休業期間について', body: '12/29〜1/4を休業とさせていただきます。', meta: '2時間前' },
    // クエスト
    { type: 'quest', title: '日報を提出する', body: 'その日の業務内容と進捗を報告する', meta: '日々の業務 ・ 10 pt' },
    { type: 'quest', title: '月次目標を達成する', body: '月間の個人目標を達成し報告する', meta: '日々の業務' },
    { type: 'quest', title: '忘年会に参加する', body: '年末の全社イベントに参加する', meta: '会社行事' },
    { type: 'quest', title: '社内表彰式に参加する', body: '年次の社内表彰式に出席する', meta: '会社行事' },
    { type: 'quest', title: '社内勉強会に参加する', body: '月次の社内勉強会に参加し学びを共有する', meta: '自己啓発' },
    { type: 'quest', title: '資格試験に合格する', body: '業務に関連する資格試験に合格する', meta: '自己啓発' },
    // アイデア
    { type: 'proposal', title: 'リモートワーク手当の新設', body: '月額のリモートワーク手当を新設する提案', meta: '投票中' },
    { type: 'proposal', title: '社内サークル活動費補助', body: '社内サークル活動への費用補助を行う提案', meta: '投票中' },
    { type: 'proposal', title: 'フリーアドレス制の導入', body: 'オフィスの座席をフリーアドレス制にする提案', meta: '審査中' },
    { type: 'proposal', title: '有給休暇の時間単位取得', body: '有給休暇を時間単位で取得できるようにする提案', meta: '採用済み' },
    { type: 'proposal', title: 'ペーパーレス化推進', body: '社内手続きの電子化を進める提案', meta: '採用済み' },
    { type: 'proposal', title: 'フリーアドレス制の導入', body: 'まずは3階フロアで試験導入してみましょう、というコメントが届いています', meta: 'コメント' },
    // お知らせ
    { type: 'announcement', title: '台風接近に伴う明日の出社について', body: '台風の接近に伴い、明日の出社時間を調整します。', meta: '重要' },
    { type: 'announcement', title: '社内勉強会「生成AI活用術」開催のお知らせ', body: '生成AIの業務活用をテーマにした勉強会を開催します。', meta: '' },
    { type: 'announcement', title: '駐車場利用ルールの変更', body: '来月より駐車場の利用ルールを変更します。', meta: '' },
    { type: 'announcement', title: '9月の防災訓練の実施について', body: '9月に全社防災訓練を実施します。', meta: '' },
    { type: 'announcement', title: '夏季休暇の申請期限について', body: '夏季休暇の申請期限は7/31までです。', meta: '' },
    // 書類提出
    { type: 'document', title: '健康診断結果', body: '提出済み ・ 提出日: 2026/06/01', meta: '提出済み' },
    { type: 'document', title: '雇用契約書', body: '承認済み ・ 承認者: 人事担当', meta: '承認済み' },
    { type: 'document', title: '扶養控除等申告書', body: '期限: 2026/07/15 ・ 依頼者: 総務部', meta: '依頼中' },
    { type: 'document', title: 'マイナンバー届出', body: '期限: 2026/07/01 ・ 依頼者: 人事部', meta: '依頼中' },
    { type: 'document', title: '雇用契約書', body: '押印箇所を確認してほしいというコメントが届いています', meta: 'コメント' },
    // クイックリンク
    { type: 'quicklink', title: '給与明細', body: 'https://example.com/payroll', meta: null, url: 'https://example.com/payroll' },
    { type: 'quicklink', title: 'NETFLIX', body: 'https://www.netflix.com/jp/', meta: null, url: 'https://www.netflix.com/jp/' },
    // ユーザー
    { type: 'user', title: '田中 佑樹', body: 'tanaka@ict-o.com', meta: null },
    { type: 'user', title: '佐藤 恵子', body: 'sato@ict-o.com', meta: null }
  ];

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function highlight(text, q) {
    if (!q) return escapeHtml(text);
    var idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return escapeHtml(text);
    var before = escapeHtml(text.slice(0, idx));
    var match = escapeHtml(text.slice(idx, idx + q.length));
    var after = escapeHtml(text.slice(idx + q.length));
    return before + '<strong class="font-semibold">' + match + '</strong>' + after;
  }

  var ROW_CLASS = 'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50';

  function iconHtml(type) {
    var inner = ICON_SVG_PATH[type]
      ? '<svg viewBox="0 -960 960 960" width="20" height="20" fill="currentColor" aria-hidden="true" class="text-subtle"><path d="' + ICON_SVG_PATH[type] + '"></path></svg>'
      : '<img src="' + ICON_SRC[type] + '" alt="" style="width:20px;height:20px;object-fit:contain;">';
    return '<span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background">' + inner + '</span>';
  }

  function rowBodyHtml(item, q) {
    return iconHtml(item.type) +
      '<span class="min-w-0 flex-1">' +
      '<span class="block truncate text-sm font-medium text-text">' + highlight(item.title, q) + '</span>' +
      '<span class="mt-0.5 block line-clamp-2 text-xs text-subtle">' + highlight(item.body, q) + '</span>' +
      (item.meta ? '<span class="mt-0.5 block text-[11px] text-subtle-light">' + escapeHtml(item.meta) + '</span>' : '') +
      '</span>';
  }

  // 行の3形態: クイックリンク=外部リンク（新しいタブ） / ユーザー=内部リンク相当 / それ以外=no-op ボタン
  function rowHtml(item, q) {
    var content = rowBodyHtml(item, q);
    if (item.type === 'quicklink') {
      return '<a href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener noreferrer" class="' + ROW_CLASS + '">' + content + '</a>';
    }
    if (item.type === 'user') {
      return '<a href="#" class="' + ROW_CLASS + '">' + content + '</a>';
    }
    return '<button type="button" class="' + ROW_CLASS + '">' + content + '</button>';
  }

  // 設定行（クライアント専用カタログ）。no-op ボタン
  function settingsRowHtml(entry, q) {
    return '<button type="button" class="' + ROW_CLASS + '">' +
      iconHtml('settings') +
      '<span class="min-w-0 flex-1">' +
      '<span class="block truncate text-sm font-medium text-text">' + highlight(entry.label, q) + '</span>' +
      '<span class="mt-0.5 block line-clamp-2 text-xs text-subtle">' + highlight(entry.description, q) + '</span>' +
      '</span></button>';
  }

  function emptyStateHtml() {
    return '<div class="flex flex-col items-center justify-center px-6 py-16 text-center">' +
      '<p class="text-sm font-medium text-subtle">キーワードを入力してください</p>' +
      '<p class="mt-1 text-xs text-subtle-light">通知・クエスト・アイデア・お知らせ・書類提出・クイックリンク・ユーザー・設定を検索できます</p>' +
      '</div>';
  }

  function noResultHtml(q) {
    return '<div class="flex flex-col items-center justify-center px-6 py-16 text-center">' +
      '<p class="text-sm font-medium text-subtle">「' + escapeHtml(q) + '」に一致する結果は見つかりませんでした</p>' +
      '<p class="mt-1 text-xs text-subtle-light">別のキーワードでお試しください</p>' +
      '</div>';
  }

  function renderResults(query) {
    var q = query.trim();
    var html;
    if (q.length < MIN_QUERY_LENGTH) {
      html = emptyStateHtml();
    } else {
      var qLower = q.toLowerCase();
      var matched = SEARCH_ITEMS.filter(function (item) {
        return item.title.toLowerCase().indexOf(qLower) !== -1 || item.body.toLowerCase().indexOf(qLower) !== -1;
      });
      // 「設定」はサーバー枠と独立したクライアント専用カタログ。常に末尾に描画する（本体 SearchDialog.tsx と同じ並び）
      var settingsHits = searchSettingsCatalog(qLower);
      if (matched.length === 0 && settingsHits.length === 0) {
        html = noResultHtml(q);
      } else {
        html = '';
        GROUP_ORDER.forEach(function (type) {
          var items = matched.filter(function (i) { return i.type === type; });
          if (items.length === 0) return;
          html += '<p class="px-3 pb-1 pt-3 text-[10.5px] font-semibold tracking-wide text-subtle first:pt-1">' + GROUP_LABEL[type] + '</p>';
          items.forEach(function (item) { html += rowHtml(item, q); });
        });
        if (settingsHits.length > 0) {
          html += '<p class="px-3 pb-1 pt-3 text-[10.5px] font-semibold tracking-wide text-subtle first:pt-1">' + SETTINGS_LABEL + '</p>';
          settingsHits.forEach(function (entry) { html += settingsRowHtml(entry, q); });
        }
      }
    }
    var el = document.getElementById('search-results');
    if (el) el.innerHTML = html;
  }

  // 検索を開くトリガー（サイドナビの検索行・その他シートの検索タイル）: 開くたびに入力をリセットしフォーカスする
  // その他シートの検索タイルは more-sheet.js が DOMContentLoaded 時に生成するため、
  // <script src="more-sheet.js"> を <script src="search.js"> より先に読み込む前提で、ここでの querySelectorAll を later に走らせる
  function attachSearchTriggers(input) {
    document.querySelectorAll('[data-open-dialog="search"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!input) return;
        input.value = '';
        renderResults('');
        setTimeout(function () { input.focus(); }, 0);
      });
    });
  }

  function init() {
    if (!document.querySelector('[data-dialog="search"]')) {
      var host = document.createElement('div');
      host.innerHTML = DIALOG_HTML;
      document.body.appendChild(host.firstElementChild);
    }
    var input = document.getElementById('search-input');
    if (input) {
      input.addEventListener('input', function (e) { renderResults(e.target.value); });
    }
    renderResults('');
    attachSearchTriggers(input);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
