/* ============================================================
   CrewNest DEMO: バッジ機能（プロフィール・ランキングの収集要素）
   使い方: <script src="badges.js"></script>（user-menu.js を読み込む全ページに追加）
   本体 src/features/badges/ の React 化前の静的再現。
   ソース: docs/superpowers/mock/2026-09-01-badge-ui-mock.html
   （バッジ機能モック追加分。デモの CrewNest Quests.html をベースに作られたモック）
   - プロフィールモーダル（user-menu.js の profileModalHtml）とユーザープロフィールパネル
     （CrewNest Quests.html の user-profile スライド）にバッジ行＋図鑑リンクを描画する
   - 図鑑モーダル・説明モーダル・獲得演出プレビューのクリック挙動を提供する
   ============================================================ */
(function () {
  'use strict';

  var STYLE = [
    '/* バッジ獲得演出（モック）: prefers-reduced-motion では無効化 */',
    '.cn-badge-pop { animation: cnBadgePop .35s ease-out; }',
    '@keyframes cnBadgePop { 0% { transform: scale(.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }',
    '/* 最上位（シリーズ最終段階）バッジのグロー */',
    '.cn-badge-max { animation: cnBadgeGlow 2.2s ease-in-out infinite; }',
    '@keyframes cnBadgeGlow {',
    '  0%, 100% { filter: drop-shadow(0 0 2px rgba(240, 215, 140, 0.5)); }',
    '  50% { filter: drop-shadow(0 0 7px rgba(240, 215, 140, 0.95)); }',
    '}',
    '/* キラッと走るシャイン（強調CTAセルのシャインと同系の表現） */',
    '.cn-badge-shine { animation: cnShineSweep 3s ease-in-out infinite; }',
    '@keyframes cnShineSweep {',
    '  0%, 55% { transform: translateX(-48px); }',
    '  75%, 100% { transform: translateX(48px); }',
    '}',
    '@media (prefers-reduced-motion: reduce) {',
    '  .cn-badge-pop { animation: none; }',
    '  .cn-badge-max { animation: none; filter: drop-shadow(0 0 5px rgba(240, 215, 140, 0.8)); }',
    '  .cn-badge-shine { display: none; }',
    '}'
  ].join('\n');

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  ready(function () {
    if (document.getElementById('cn-badge-style')) return;
    var style = document.createElement('style');
    style.id = 'cn-badge-style';
    style.textContent = STYLE;
    document.head.appendChild(style);
  });

  var METALS = {
    bronze:   { base: '#C08552', light: '#EFD2B4', dark: '#8F5D33', rim: '#77502C' },
    silver:   { base: '#B9C2CE', light: '#EDF1F6', dark: '#8B96A6', rim: '#76818F' },
    gold:     { base: '#D4B36A', light: '#F3E3B6', dark: '#9C7B3C', rim: '#7A6030' },
    platinum: { base: '#B9CBE3', light: '#F2F7FF', dark: '#8CA3C4', rim: '#7387A8' },
    locked:   { base: '#D8DCE4', light: '#F1F3F7', dark: '#B4BAC7', rim: '#A2A9B8' }
  };
  var METAL_BY_TIER = ['bronze', 'silver', 'gold', 'platinum'];

  function burst(cx, cy, rIn, rOut, n, color) {
    var polys = '';
    for (var i = 0; i < n; i++) {
      var a0 = (Math.PI * 2 * i) / n, a1 = a0 + Math.PI / n, a2 = a0 + (Math.PI * 2) / n;
      polys += '<polygon points="' +
        (cx + Math.cos(a0) * rIn).toFixed(1) + ',' + (cy + Math.sin(a0) * rIn).toFixed(1) + ' ' +
        (cx + Math.cos(a1) * rOut).toFixed(1) + ',' + (cy + Math.sin(a1) * rOut).toFixed(1) + ' ' +
        (cx + Math.cos(a2) * rIn).toFixed(1) + ',' + (cy + Math.sin(a2) * rIn).toFixed(1) +
        '" fill="' + color + '"/>';
    }
    return polys;
  }
  function sparkle(x, y, r, m) {
    return '<path transform="translate(' + x + ' ' + y + ') scale(' + r + ')" d="M0 -1 L0.27 -0.27 L1 0 L0.27 0.27 L0 1 L-0.27 0.27 L-1 0 L-0.27 -0.27 Z" fill="' + m.light + '" stroke="' + m.dark + '" stroke-width="' + (0.6 / r).toFixed(2) + '"/>';
  }
  function laurel(cx, cy, m) {
    var out = '', sides = [-1, 1];
    for (var s = 0; s < 2; s++) {
      for (var i = 0; i < 5; i++) {
        var a = Math.PI / 2 + sides[s] * (0.55 + i * 0.36);
        var x = cx + Math.cos(a) * 35.5, y = cy + Math.sin(a) * 35.5;
        var rot = (a * 180 / Math.PI) + 90;
        out += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="2.6" ry="6.2" transform="rotate(' + rot.toFixed(1) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')" fill="' + m.dark + '" opacity="0.9"/>';
      }
    }
    return out;
  }
  function sunLine() {
    var out = '<circle cx="12" cy="13" r="4"/>';
    for (var i = 0; i < 8; i++) {
      var a = (Math.PI * 2 * i) / 8 - Math.PI / 2;
      out += '<line x1="' + (12 + Math.cos(a) * 6.4).toFixed(1) + '" y1="' + (13 + Math.sin(a) * 6.4).toFixed(1) + '" x2="' + (12 + Math.cos(a) * 9).toFixed(1) + '" y2="' + (13 + Math.sin(a) * 9).toFixed(1) + '"/>';
    }
    return out;
  }

  var LINE = {
    login: '<rect x="4" y="5" width="16" height="15" rx="2"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="8.5" y1="3" x2="8.5" y2="7"/><line x1="15.5" y1="3" x2="15.5" y2="7"/><path d="M12 12.4 l0.8 1.8 1.8 0.8 -1.8 0.8 -0.8 1.8 -0.8 -1.8 -1.8 -0.8 1.8 -0.8 Z" fill="CURRENT" stroke="none"/>',
    streak: '<path d="M12 3 C 8.5 8.5 6.5 11 6.5 14.5 A 5.5 5.5 0 0 0 17.5 14.5 C 17.5 11 15.5 8.5 12 3 Z"/><path d="M12 12 C 10.5 14.2 9.7 15.4 9.7 17 A 2.3 2.3 0 0 0 14.3 17 C 14.3 15.4 13.5 14.2 12 12 Z" fill="CURRENT" stroke="none"/>',
    early: sunLine(),
    idea: '<path d="M12 4 a5.5 5.5 0 0 1 3.2 10 c-0.9 0.7 -1.2 1.5 -1.2 2.5 h-4 c0 -1 -0.3 -1.8 -1.2 -2.5 A5.5 5.5 0 0 1 12 4 Z"/><line x1="10" y1="19.5" x2="14" y2="19.5"/><line x1="10.5" y1="22" x2="13.5" y2="22"/>',
    adopt: '<line x1="7" y1="4" x2="7" y2="21"/><path d="M7 5 h10 l-2.8 3.5 L17 12 H7 Z"/><polyline points="9.5,8 10.8,9.3 13.5,6.6"/>',
    like: '<path d="M12 19.5 C 6 14.5 4.6 10.6 7.4 8.4 C 9.6 6.7 12 9 12 9 C 12 9 14.4 6.7 16.6 8.4 C 19.4 10.6 18 14.5 12 19.5 Z"/>',
    quest: '<path d="M12 3 L19.5 5.8 V10.5 C19.5 15.5 16.5 18.8 12 20.8 C7.5 18.8 4.5 15.5 4.5 10.5 V5.8 Z"/><polyline points="8.5,11.5 11,14 15.5,8.5"/>',
    points: '<circle cx="12" cy="12" r="8.5"/><text x="12" y="16.2" text-anchor="middle" font-size="11.5" font-weight="700" font-family="Arial, sans-serif" stroke="none" fill="CURRENT">P</text>',
    reaction: '<path d="M5 5.5 h14 a1.5 1.5 0 0 1 1.5 1.5 v8 a1.5 1.5 0 0 1 -1.5 1.5 h-8.5 l-4 4 v-4 H5 a1.5 1.5 0 0 1 -1.5 -1.5 v-8 A1.5 1.5 0 0 1 5 5.5 Z"/><path d="M12 13.4 c-2.4 -2 -3 -3.6 -1.8 -4.5 c0.9 -0.7 1.8 0.2 1.8 0.2 s0.9 -0.9 1.8 -0.2 c1.2 0.9 0.6 2.5 -1.8 4.5 Z" fill="CURRENT" stroke="none"/>',
    survey: '<rect x="5" y="3.5" width="14" height="17" rx="2"/><polyline points="8,8.5 9.5,10 12,7.5"/><line x1="14.5" y1="9" x2="16.5" y2="9"/><polyline points="8,14.5 9.5,16 12,13.5"/><line x1="14.5" y1="15" x2="16.5" y2="15"/>',
    rank: '<path d="M5.5 17.5 V9.5 L9.5 12.5 L12 6.5 L14.5 12.5 L18.5 9.5 V17.5 Z"/><line x1="5.5" y1="20.5" x2="18.5" y2="20.5"/>',
    xmas: '<path d="M12 3.5 L16.5 10 H7.5 Z"/><path d="M12 8 L18 16 H6 Z"/><line x1="12" y1="16" x2="12" y2="20.5"/>',
    newyear: '<line x1="4" y1="17" x2="20" y2="17"/><path d="M7.5 17 a4.5 4.5 0 0 1 9 0"/><line x1="12" y1="7" x2="12" y2="9.5"/><line x1="6.5" y1="9.5" x2="8.2" y2="11.2"/><line x1="17.5" y1="9.5" x2="15.8" y2="11.2"/>',
    tanabata: '<path d="M12 3.5 L14.2 9 L20 9.4 L15.5 13.2 L17 19 L12 15.8 L7 19 L8.5 13.2 L4 9.4 L9.8 9 Z"/>',
    sisi: '<circle cx="12" cy="12" r="8.5"/><line x1="12" y1="12" x2="14.4" y2="15"/><line x1="12" y1="12" x2="7.6" y2="14.2"/>',
    always: '<path d="M12 12 C 9.5 8.5 4.5 9 4.5 12 C 4.5 15 9.5 15.5 12 12 C 14.5 8.5 19.5 9 19.5 12 C 19.5 15 14.5 15.5 12 12 Z"/>',
    unread: '<path d="M6 17 V11 a6 6 0 0 1 12 0 v6"/><line x1="4.5" y1="17" x2="19.5" y2="17"/><line x1="10.5" y1="20" x2="13.5" y2="20"/><line x1="5" y1="4.5" x2="19" y2="19.5"/>',
    question: '<text x="12" y="18" text-anchor="middle" font-size="16" font-weight="700" font-family="Arial, sans-serif" stroke="none" fill="CURRENT">?</text>'
  };

  var DEEP = {
    login: '#2D5BBA', streak: '#C9511F', early: '#C07E1F', idea: '#B08A1E', adopt: '#2E7A4C',
    like: '#C24763', quest: '#26437C', points: '#A5843B', reaction: '#2F7FB5', survey: '#6A58BD', rank: '#B0821F',
    xmas: '#B23A3A', newyear: '#8C2F39', tanabata: '#3E4FA3', sisi: '#4A5568', always: '#8E44AD', unread: '#6B7280'
  };

  var uid = 0;
  function lineMotif(key, dx, dy, color) {
    var body = LINE[key].split('CURRENT').join(color);
    return '<g transform="translate(' + dx + ' ' + dy + ') scale(1.5)" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + body + '</g>';
  }
  function badgeSVG(key, tier, size, locked) {
    var m = METALS[locked ? 'locked' : METAL_BY_TIER[tier - 1]];
    var level = locked ? 1 : tier;
    var id = 'bz' + (uid++);
    var defs = '<linearGradient id="' + id + 'r" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + m.light + '"/><stop offset="0.45" stop-color="' + m.base + '"/><stop offset="1" stop-color="' + m.dark + '"/></linearGradient>' +
      '<radialGradient id="' + id + 'w" cx="0.5" cy="0.5" r="0.5"><stop offset="0.55" stop-color="' + m.base + '" stop-opacity="0.55"/><stop offset="1" stop-color="' + m.base + '" stop-opacity="0"/></radialGradient>';
    var b = '';
    if (level >= 4) b += '<circle cx="50" cy="58" r="46" fill="url(#' + id + 'w)"/>';
    b += '<g><rect x="43" y="2" width="14" height="34" rx="2" transform="rotate(-20 50 14)" fill="#042154"/>' +
         '<rect x="48" y="2" width="4" height="34" transform="rotate(-20 50 14)" fill="#C6A75E"/>' +
         '<rect x="43" y="2" width="14" height="34" rx="2" transform="rotate(20 50 14)" fill="#021640"/>' +
         '<rect x="48" y="2" width="4" height="34" transform="rotate(20 50 14)" fill="#C6A75E"/></g>';
    if (level >= 3) b += burst(50, 58, 29, 36, 14, m.base);
    if (level >= 4) b += laurel(50, 58, m);
    b += '<circle cx="50" cy="58" r="30" fill="url(#' + id + 'r)" stroke="' + m.rim + '" stroke-width="1.5"/>';
    if (locked) {
      b += '<circle cx="50" cy="58" r="23" fill="' + m.light + '" stroke="' + m.dark + '" stroke-width="1"/>';
      b += lineMotif('question', 32, 40, m.rim);
    } else {
      b += '<circle cx="50" cy="58" r="23" fill="' + DEEP[key] + '" stroke="' + m.rim + '" stroke-width="1"/>';
      b += '<circle cx="50" cy="58" r="20.5" fill="none" stroke="' + m.light + '" stroke-width="1.2" opacity="0.9"/>';
      b += lineMotif(key, 32, 40, '#FFFFFF');
      b += '<ellipse cx="42" cy="47" rx="10" ry="6" transform="rotate(-30 42 47)" fill="#FFFFFF" opacity="0.22"/>';
    }
    if (level >= 2) b += '<circle cx="50" cy="58" r="26.5" fill="none" stroke="' + m.dark + '" stroke-width="1.8" stroke-dasharray="0 5.6" stroke-linecap="round"/>';
    if (level >= 4) b += sparkle(17, 32, 5, m) + sparkle(85, 26, 4, m) + sparkle(76, 92, 3.4, m);
    var isMax = !locked && BY_KEY[key] && tier >= BY_KEY[key].conds.length;
    if (isMax) {
      defs += '<clipPath id="' + id + 'mc"><circle cx="50" cy="58" r="30"/></clipPath>' +
        '<linearGradient id="' + id + 's" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="0.5" stop-color="#FFFFFF" stop-opacity="0.9"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>';
      b += '<g clip-path="url(#' + id + 'mc)"><g transform="rotate(25 50 58)"><rect class="cn-badge-shine" x="36" y="-10" width="16" height="140" fill="url(#' + id + 's)"/></g></g>';
    }
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 100 100"' + (isMax ? ' class="cn-badge-max"' : '') + ' aria-hidden="true"><defs>' + defs + '</defs>' + b + '</svg>';
  }

  /* ---- 定義（11シリーズ＋シークレット6種） ---- */
  var SERIES = [
    { key: 'login',    fixed: 'こつこつログイン', conds: ['累計10日', '累計100日', '累計300日', '累計1000日'] },
    { key: 'streak',   names: ['三日坊主卒業', '皆勤賞', '鉄壁の習慣'], conds: ['連続5営業日', '連続20営業日', '連続60営業日'] },
    { key: 'early',    names: ['早起きは三文の徳', '朝型人間', '太陽より早い'], conds: ['8時前ログイン累計10日', '8時前ログイン累計50日', '8時前ログイン累計150日'] },
    { key: 'idea',     names: ['とりあえず言ってみた', '改善したがり', '黙っていられない人', 'アイデアの泉'], conds: ['アイデア投稿1件', 'アイデア投稿5件', 'アイデア投稿10件', 'アイデア投稿30件'] },
    { key: 'adopt',    names: ['はじめての採用', '会社を動かす人', '改革の立役者'], conds: ['アイデア採用1件', 'アイデア採用5件', 'アイデア採用15件'] },
    { key: 'like',     fixed: '共感を呼ぶ人', conds: ['もらったいいね10', 'もらったいいね50', 'もらったいいね150'] },
    { key: 'quest',    fixed: 'クエストハンター', conds: ['クエスト達成10件', 'クエスト達成50件', 'クエスト達成200件', 'クエスト達成500件'] },
    { key: 'points',   fixed: 'ポイントコレクター', conds: ['累計1,000pt', '累計5,000pt', '累計20,000pt'] },
    { key: 'reaction', names: ['応援団員', '応援団長', '総応援団長'], conds: ['リアクション送信30回', 'リアクション送信100回', 'リアクション送信300回'] },
    { key: 'survey',   names: ['聞かれたら答える人', '意見箱の主', '全社の声'], conds: ['アンケート回答3回', 'アンケート回答10回', 'アンケート回答30回'] },
    { key: 'rank',     names: ['初優勝', '常勝', '殿堂入り'], conds: ['月間ランキング1位 1回', '月間ランキング1位 3回', '月間ランキング1位 10回'] }
  ];
  var SECRETS = [
    { key: 'xmas',     name: 'クリスマス', cond: '12/25にログインする' },
    { key: 'newyear',  name: '正月', cond: '1/1にログインする' },
    { key: 'tanabata', name: '七夕', cond: '7/7にログインする' },
    { key: 'sisi',     name: 'シッシッシ', cond: '午前4:44にログインする' },
    { key: 'always',   name: 'いつでも一緒', cond: '同じ日に 0-4 / 4-8 / 8-12 / 12-16 / 16-20 / 20-24時 すべてでアプリを開く' },
    { key: 'unread',   name: '未読スルー', cond: '通知を20件以上未読のままにする' }
  ];
  var BY_KEY = {};
  SERIES.forEach(function (s) { BY_KEY[s.key] = s; });
  var SECRET_BY_KEY = {};
  SECRETS.forEach(function (s) { SECRET_BY_KEY[s.key] = s; });
  function tierName(s, tier) { return s.fixed || s.names[tier - 1]; }

  /* ---- 自分（田中）のデモデータ（d = 現在段階の獲得日） ---- */
  var MY = {
    login:    { t: 3, cur: 412,  next: 1000,  d: '2026/04/02' },
    streak:   { t: 2, cur: 34,   next: 60,    d: '2026/08/18' },
    early:    { t: 1, cur: 23,   next: 50,    d: '2026/07/29' },
    idea:     { t: 3, cur: 14,   next: 30,    d: '2026/06/11' },
    adopt:    { t: 1, cur: 2,    next: 5,     d: '2026/05/23' },
    like:     { t: 2, cur: 87,   next: 150,   d: '2026/07/03' },
    quest:    { t: 3, cur: 214,  next: 500,   d: '2026/08/02' },
    points:   { t: 2, cur: 8420, next: 20000, d: '2026/06/30' },
    reaction: { t: 3, complete: true,         d: '2026/08/21' },
    survey:   { t: 1, cur: 6,    next: 10,    d: '2026/07/15' },
    rank:     { t: 0, cur: 0,    next: 1 }
  };
  var MY_SECRETS = { xmas: '2025/12/25', sisi: '2026/03/04' };

  /* ---- 他人（ランキングのメンバー）のデモデータ: [キー, 段階, 獲得日] ---- */
  var PROFILE_BADGES = {
    sato:      [['login', 4, '2026/05/10'], ['streak', 3, '2026/04/22'], ['early', 3, '2026/06/14'], ['idea', 4, '2026/07/09'], ['adopt', 3, '2026/08/11'], ['like', 3, '2026/07/30'], ['quest', 4, '2026/08/26'], ['points', 3, '2026/06/01'], ['reaction', 3, '2026/05/28'], ['survey', 3, '2026/03/19'], ['rank', 3, '2026/08/01'], ['xmas', 0, '2025/12/25'], ['newyear', 0, '2026/01/01'], ['tanabata', 0, '2026/07/07'], ['sisi', 0, '2026/02/13'], ['always', 0, '2026/08/29'], ['unread', 0, '2026/04/04']],
    suzuki:    [['login', 2, '2026/01/20'], ['quest', 2, '2026/04/12'], ['reaction', 2, '2026/06/28'], ['adopt', 1, '2026/03/05'], ['survey', 1, '2026/05/11']],
    takahashi: [['login', 3, '2026/03/08'], ['early', 2, '2026/05/19'], ['idea', 3, '2026/07/24'], ['like', 2, '2026/06/02'], ['quest', 2, '2026/04/29'], ['tanabata', 0, '2026/07/07']],
    tanaka:    [['login', 3, '2026/04/02'], ['streak', 2, '2026/08/18'], ['idea', 3, '2026/06/11'], ['quest', 3, '2026/08/02'], ['reaction', 3, '2026/08/21'], ['xmas', 0, '2025/12/25'], ['sisi', 0, '2026/03/04']],
    ito:       [['login', 1, '2026/02/03'], ['quest', 1, '2026/03/17'], ['survey', 1, '2026/06/20']],
    watanabe:  [['login', 2, '2026/01/28'], ['adopt', 2, '2026/05/08'], ['like', 1, '2026/04/16'], ['rank', 1, '2026/07/01'], ['newyear', 0, '2026/01/01']]
  };
  var PROFILE_NAMES = { sato: '佐藤 恵子', suzuki: '鈴木 一郎', takahashi: '高橋 美咲', tanaka: '田中 佑樹', ito: '伊藤 健太', watanabe: '渡辺 さゆり' };
  function findBadge(userKey, key) {
    var list = PROFILE_BADGES[userKey] || [];
    for (var i = 0; i < list.length; i++) { if (list[i][0] === key) return list[i]; }
    return null;
  }

  window.cnMyBadgeRowHtml = function (size) {
    var items = [];
    SERIES.forEach(function (s) {
      var st = MY[s.key];
      if (st.t > 0) items.push({ kind: 'series', key: s.key, t: st.t, d: st.d || '', label: tierName(s, st.t) });
    });
    SECRETS.forEach(function (s) {
      if (MY_SECRETS[s.key]) items.push({ kind: 'secret', key: s.key, t: 3, d: MY_SECRETS[s.key], label: s.name });
    });
    /* 新しく獲得した順（アップグレードで獲得日が更新される想定）。最大5個 */
    items.sort(function (a, b) { return a.d < b.d ? 1 : -1; });
    return items.slice(0, 5).map(function (it) {
      return '<button type="button" data-bdetail="' + it.kind + ':me:' + it.key + '" aria-label="' + it.label + '" class="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">' + badgeSVG(it.key, it.t, size, false) + '</button>';
    }).join('');
  };
  function earnedCount(userKey) {
    var earned = 0;
    if (userKey === 'me') {
      SERIES.forEach(function (s) { if (MY[s.key].t > 0) earned++; });
      SECRETS.forEach(function (s) { if (MY_SECRETS[s.key]) earned++; });
    } else {
      earned = (PROFILE_BADGES[userKey] || []).length;
    }
    return earned + '/' + (SERIES.length + SECRETS.length);
  }
  window.cnMyBadgeCount = function () { return earnedCount('me'); };

  /* ---- 図鑑モーダル（タイルはメダルのみ・カテゴリ別セクション。詳細はタップで説明モーダル） ---- */
  var TILE_CLASS = 'flex items-center justify-center rounded-lg p-1 transition-colors hover:bg-black/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50';
  var CATEGORIES = [
    { label: 'ログイン', keys: ['login', 'streak', 'early'] },
    { label: 'アイデア', keys: ['idea', 'adopt', 'like'] },
    { label: 'クエスト', keys: ['quest', 'points', 'rank'] },
    { label: '交流', keys: ['reaction', 'survey'] }
  ];
  function seriesTile(userKey, s) {
    var t = userKey === 'me' ? MY[s.key].t : (function () { var e = findBadge(userKey, s.key); return e ? e[1] : 0; })();
    var earned = t > 0;
    return '<button type="button" data-bdetail="series:' + userKey + ':' + s.key + '" aria-label="' + (earned ? tierName(s, t) : '未獲得のバッジ') + '" class="' + TILE_CLASS + '">' +
      badgeSVG(s.key, earned ? t : 1, 56, !earned) + '</button>';
  }
  function secretTile(userKey, s) {
    var earned = userKey === 'me' ? !!MY_SECRETS[s.key] : !!findBadge(userKey, s.key);
    return '<button type="button" data-bdetail="secret:' + userKey + ':' + s.key + '" aria-label="' + (earned ? s.name : 'シークレットバッジ') + '" class="' + TILE_CLASS + '">' +
      badgeSVG(s.key, 3, 56, !earned) + '</button>';
  }
  function zukanSection(label, tiles) {
    return '<p class="mb-1.5 mt-5 text-[10px] font-bold tracking-wider text-subtle-light first:mt-0">' + label + '</p>' +
      '<div class="grid grid-cols-4 gap-2 md:grid-cols-6">' + tiles + '</div>';
  }
  function zukanHtml(userKey) {
    var body = '';
    CATEGORIES.forEach(function (c) {
      body += zukanSection(c.label, c.keys.map(function (k) { return seriesTile(userKey, BY_KEY[k]); }).join(''));
    });
    body += zukanSection('シークレット', SECRETS.map(function (s) { return secretTile(userKey, s); }).join(''));
    var title = userKey === 'me' ? 'バッジ図鑑' : PROFILE_NAMES[userKey] + 'さんのバッジ';
    var preview = userKey === 'me'
      ? '<button type="button" data-badge-celebrate class="inline-flex h-8 items-center rounded-full border border-border bg-background-light px-3 text-[11px] font-medium text-subtle transition-colors hover:bg-black/[0.08]">獲得演出プレビュー</button>'
      : '';
    return '<div data-modal-overlay class="fixed inset-0 z-[120] flex items-center justify-center bg-primary/30 p-4 md:bg-black/45">' +
      '<div role="dialog" aria-modal="true" aria-label="' + title + '" tabindex="-1" class="fixed inset-x-0 bottom-0 flex h-[85dvh] max-h-[85vh] w-full flex-col rounded-t-2xl bg-background-light shadow-md outline-none md:static md:h-auto md:max-h-[min(85vh,640px)] md:max-w-lg md:rounded-2xl">' +
      '<div class="flex flex-shrink-0 justify-center py-2 md:hidden"><span class="h-1 w-9 rounded-full bg-border"></span></div>' +
      '<div class="flex flex-shrink-0 items-center gap-2 border-b border-border px-5 py-3">' +
      '<h2 class="flex-1 text-base font-bold text-text">' + title + ' <span class="text-xs font-medium text-subtle">' + earnedCount(userKey) + '</span></h2>' +
      preview +
      '<button type="button" data-modal-close aria-label="閉じる" class="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-subtle transition-colors hover:bg-black/[0.08]"><svg viewBox="0 -960 960 960" width="16" height="16" fill="currentColor"><path d="M256-200 200-256l224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg></button>' +
      '</div>' +
      '<div class="flex-1 overflow-y-auto overscroll-y-contain px-5 py-4">' + body + '</div>' +
      '</div></div>';
  }

  /* ---- 説明モーダル ---- */
  function detailShell(inner) {
    return '<div data-bdetail-host class="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 p-6">' +
      '<div class="cn-badge-pop relative w-full max-w-xs rounded-2xl bg-background-light p-6 text-center shadow-md">' +
      '<button type="button" data-bdetail-close aria-label="閉じる" class="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-subtle transition-colors hover:bg-black/[0.08]"><svg viewBox="0 -960 960 960" width="16" height="16" fill="currentColor"><path d="M256-200 200-256l224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg></button>' +
      inner + '</div></div>';
  }
  function earnedDateLine(d) {
    return '<p class="mt-1.5 text-[11px] text-subtle">獲得日: ' + d + '</p>';
  }
  function gaugeHtml(cur, next) {
    var pct = Math.min(100, Math.round((cur / next) * 100));
    return '<div class="mx-auto mt-2 h-1 w-4/5 rounded-full bg-border"><div class="h-1 rounded-full bg-accent" style="width:' + pct + '%"></div></div>' +
      '<p class="mt-1 text-[11px] text-subtle">' + cur.toLocaleString() + ' / ' + next.toLocaleString() + '</p>';
  }
  function seriesDetailInner(userKey, key) {
    var s = BY_KEY[key];
    if (userKey === 'me') {
      var st = MY[key];
      var earned = st.t > 0;
      var body;
      if (st.complete) {
        body = '<span class="mt-3 inline-block rounded-full bg-accent-surface px-3 py-1 text-[11px] font-bold text-accent-dark">コンプリート</span>' +
          '<p class="mt-2 text-xs text-subtle">' + s.conds[s.conds.length - 1] + ' を達成</p>';
      } else {
        body = '<p class="mt-3 text-xs text-subtle">' + (earned ? '次: ' : '条件: ') + s.conds[st.t] + '</p>' + gaugeHtml(st.cur, st.next);
      }
      return '<span class="flex justify-center">' + badgeSVG(key, earned ? st.t : 1, 96, !earned) + '</span>' +
        '<p class="mt-2 text-base font-bold ' + (earned ? 'text-text' : 'text-subtle-light') + '">' + (earned ? tierName(s, st.t) : tierName(s, 1)) + '</p>' +
        (earned && st.d ? earnedDateLine(st.d) : '') + body;
    }
    var e = findBadge(userKey, key);
    if (e) {
      return '<span class="flex justify-center">' + badgeSVG(key, e[1], 96, false) + '</span>' +
        '<p class="mt-2 text-base font-bold text-text">' + tierName(s, e[1]) + '</p>' +
        '<p class="mt-1.5 text-xs text-subtle">' + s.conds[e[1] - 1] + '</p>' +
        earnedDateLine(e[2]);
    }
    return '<span class="flex justify-center">' + badgeSVG(key, 1, 96, true) + '</span>' +
      '<p class="mt-2 text-base font-bold text-subtle-light">' + tierName(s, 1) + '</p>' +
      '<p class="mt-1.5 text-xs text-subtle">条件: ' + s.conds[0] + '</p>' +
      '<p class="mt-1 text-[11px] text-subtle-light">未獲得</p>';
  }
  function secretDetailInner(userKey, key) {
    var s = SECRET_BY_KEY[key];
    if (userKey === 'me') {
      var d = MY_SECRETS[key];
      if (d) {
        return '<span class="flex justify-center">' + badgeSVG(key, 3, 96, false) + '</span>' +
          '<p class="mt-2 text-base font-bold text-text">' + s.name + '</p>' +
          '<p class="mt-1.5 text-xs text-subtle">' + s.cond + '</p>' + earnedDateLine(d);
      }
      return '<span class="flex justify-center">' + badgeSVG(key, 3, 96, true) + '</span>' +
        '<p class="mt-2 text-base font-bold text-subtle-light">？？？</p>' +
        '<p class="mt-1.5 text-xs text-subtle">条件は獲得すると表示されます</p>';
    }
    var e = findBadge(userKey, key);
    if (e) {
      /* 自分が未獲得のシークレットは、他人の獲得バッジでも名前・条件・獲得日を明かさない（獲得日も条件のヒントになる） */
      if (!MY_SECRETS[key]) {
        return '<span class="flex justify-center">' + badgeSVG(key, 3, 96, false) + '</span>' +
          '<p class="mt-2 text-base font-bold text-subtle-light">？？？</p>' +
          '<p class="mt-1.5 text-xs text-subtle">条件は獲得すると表示されます</p>';
      }
      return '<span class="flex justify-center">' + badgeSVG(key, 3, 96, false) + '</span>' +
        '<p class="mt-2 text-base font-bold text-text">' + s.name + '</p>' +
        '<p class="mt-1.5 text-xs text-subtle">' + s.cond + '</p>' + earnedDateLine(e[2]);
    }
    return '<span class="flex justify-center">' + badgeSVG(key, 3, 96, true) + '</span>' +
      '<p class="mt-2 text-base font-bold text-subtle-light">？？？</p>' +
      '<p class="mt-1.5 text-xs text-subtle">シークレットバッジ</p>';
  }

  /* ---- 獲得演出（プレビュー） ---- */
  function celebrateHtml() {
    return '<div data-celebrate-host class="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 p-6">' +
      '<div class="cn-badge-pop w-full max-w-xs rounded-2xl bg-background-light p-6 text-center shadow-md">' +
      '<p class="text-[11px] font-bold tracking-[0.2em] text-accent-dark">バッジ獲得！</p>' +
      '<div class="mx-auto mt-2 flex justify-center">' + badgeSVG('login', 4, 120, false) + '</div>' +
      '<p class="mt-2 text-base font-bold text-text">こつこつログイン <span class="text-[10px] font-bold tracking-[0.12em] text-subtle">PLATINUM</span></p>' +
      '<p class="mt-1 text-xs text-subtle">累計1000日ログインを達成しました</p>' +
      '<button type="button" data-celebrate-close class="mt-5 inline-flex min-h-10 items-center justify-center rounded-full bg-primary px-6 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-mid">閉じる</button>' +
      '</div></div>';
  }

  function openZukan(userKey) {
    document.querySelectorAll('[data-modal-host]').forEach(function (m) { m.remove(); });
    var host = document.createElement('div');
    host.setAttribute('data-modal-host', '');
    host.innerHTML = zukanHtml(userKey);
    document.body.appendChild(host);
    var dialog = host.querySelector('[role="dialog"]');
    if (dialog) dialog.focus();
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-open-badge-zukan]')) { openZukan('me'); return; }
    var userZukanBtn = e.target.closest('[data-open-badge-zukan-user]');
    if (userZukanBtn) {
      var uk = userZukanBtn.getAttribute('data-zukan-user');
      if (uk) openZukan(uk);
      return;
    }
    if (e.target.closest('[data-badge-celebrate]')) {
      var h = document.createElement('div');
      h.innerHTML = celebrateHtml();
      document.body.appendChild(h.firstChild);
      return;
    }
    if (e.target.closest('[data-celebrate-close]')) {
      document.querySelectorAll('[data-celebrate-host]').forEach(function (m) { m.remove(); });
      return;
    }
    var detailBtn = e.target.closest('[data-bdetail]');
    if (detailBtn) {
      var parts = detailBtn.getAttribute('data-bdetail').split(':');
      var inner = parts[0] === 'series' ? seriesDetailInner(parts[1], parts[2]) : secretDetailInner(parts[1], parts[2]);
      var dv = document.createElement('div');
      dv.innerHTML = detailShell(inner);
      document.body.appendChild(dv.firstChild);
      return;
    }
    if (e.target.closest('[data-bdetail-close]')) {
      document.querySelectorAll('[data-bdetail-host]').forEach(function (m) { m.remove(); });
      return;
    }
    var dh = e.target.closest('[data-bdetail-host]');
    if (dh && e.target === dh) { dh.remove(); return; }
  });

  /* ---- 他人プロフィールパネルのバッジ行＋図鑑リンク（user-profile スライドがあるページのみ発火） ---- */
  document.addEventListener('slidewillopen', function (ev) {
    if (ev.detail.id !== 'user-profile') return;
    var trigger = ev.detail.trigger;
    var key = trigger ? trigger.getAttribute('data-profile') : null;
    var list = (key && PROFILE_BADGES[key]) || [];
    document.querySelectorAll('[data-slide="user-profile"]').forEach(function (panel) {
      var row = panel.querySelector('[data-u="badges"]');
      if (!row) return;
      var html = '';
      var sorted = list.slice().sort(function (a, b) { return (a[2] || '') < (b[2] || '') ? 1 : -1; }).slice(0, 5);
      sorted.forEach(function (b) {
        var k = b[0], t = b[1];
        var kind, label;
        if (SECRET_BY_KEY[k]) { kind = 'secret'; label = MY_SECRETS[k] ? SECRET_BY_KEY[k].name : 'シークレットバッジ'; t = 3; }
        else { kind = 'series'; label = tierName(BY_KEY[k], t); }
        html += '<button type="button" data-bdetail="' + kind + ':' + key + ':' + k + '" aria-label="' + label + '" class="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">' + badgeSVG(k, t, 44, false) + '</button>';
      });
      if (!html) html = '<p class="text-[11px] text-subtle-light">まだバッジがありません</p>';
      row.innerHTML = html;
      row.style.justifyContent = sorted.length >= 5 ? 'space-between' : 'flex-start';
      var link = panel.querySelector('[data-open-badge-zukan-user]');
      if (link) link.setAttribute('data-zukan-user', key || '');
    });
  });
})();
