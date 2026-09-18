/* ============================================================
   CrewNest DEMO: 管理画面「契約」タブの › メンバー一覧・契約パネル（issue #54 契約タブ追補 + 契約の情報追加モック）
   使い方: <script src="contract-members.js"></script>（CrewNest Admin.html の一番最後、
   contracts.js が公開する window.CNContracts・clients.js が公開する window.CNClients、
   UE_AVA（アバター色）より後に読み込む）
   本体 src/features/admin/components/ContractMembersClient.tsx・ContractMemberPanel.tsx の
   React 化前の静的再現。一覧・パネルの中身はこのファイルが window.CNContracts（contracts.js）の
   CT（契約データ）・dl/rs/rh/classify/allRows/durationLabel/rangeCell/committedInfo/periodShort と、
   window.CNClients（clients.js）の客先（プロジェクト）データを使って描く。
   部署・有休データ突合の可否は User に列が無く有休 CSV の取込行にしかない（設計書 §1）ため、
   デモではメンバーごとに固定値で持つ。
   並び替えは管理画面のユーザー一覧（data-u-sort-*、UsersTable の React 化前再現）と同じ方式を
   data-cm-sort-* で独立させて使う。
   MEMBERS の氏名は window.CNMembers で公開する（clients.js の「自社の営業担当者」Select の選択肢に使う）。
   ソース: ~/.claude-tools/crew-nest-mock/issue54/fragments/admin-contract-members.js
   ============================================================ */
(function () {
  var MEMBERS = [
    { name: '鈴木 一郎', email: 'suzuki@ict-o.com', dept: '営業部', leaveOk: true },
    { name: '佐藤 恵子', email: 'sato@ict-o.com', dept: '開発部', leaveOk: true },
    { name: '田中 佑樹', email: 'tanaka@ict-o.com', dept: '開発部', leaveOk: true },
    { name: '伊藤 健太', email: 'ito@ict-o.com', dept: null, leaveOk: true },
    { name: '渡辺 さゆり', email: 'watanabe@ict-o.com', dept: '営業部', leaveOk: true },
    { name: '小林 直人', email: 'kobayashi@ict-o.com', dept: null, leaveOk: false }
  ];
  window.CNMembers = MEMBERS.map(function (m) { return m.name; });
  var pastOpen = false; // パネルの「過去の条件を表示」開閉状態。パネルを閉じると戻る
  var openName = null;  // 現在パネルを開いているメンバー名（開いていなければ null）

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function memberOf(name) { return MEMBERS.filter(function (m) { return m.name === name; })[0] || null; }
  function avatarColor(name) { return (window.UE_AVA && window.UE_AVA[name]) || '#5C6B8A'; }

  // 一覧の「現在の契約」列。適用中の契約があれば客先（プロジェクト）・種別、無ければ「未設定」
  function contractCellHtml(m) {
    var C = window.CNContracts;
    var ap = C.ga(C.CT[m.name] || []);
    if (!ap) return '<span class="text-xs text-subtle">未設定</span>';
    var l1 = C.cd(ap.client) + ' ・ ' + C.TL[ap.type];
    return '<p class="text-sm font-semibold text-text">' + esc(l1) + '</p><p class="text-xs text-subtle">' + esc(C.dl(ap, false)) + '</p>';
  }
  // 1行目「2026年4月から ・ 3か月目」（プロジェクト継続の起点で数える）、2行目に契約更新の予定があれば
  // 「2026年12月まで契約済み」（過ぎていれば text-warning で「・ 更新が必要」を追加）。契約なしは呼び出し側で「-」を出す
  function effectiveCellHtml(m) {
    var C = window.CNContracts;
    var h = C.CT[m.name] || [];
    var ap = C.ga(h);
    if (!ap) return '<span class="text-[11.5px] text-subtle-light">-</span>';
    var origin = C.projectStart(h, ap);
    var dur = C.durationLabel(origin);
    var period = C.periodShort(origin);
    var html = '<p class="whitespace-nowrap text-[11.5px] text-subtle">' + esc(period) + (dur ? ' ・ ' + esc(dur) : '') + '</p>';
    var ci = C.committedInfo(ap.committedUntil, C.CM);
    if (ci) {
      var cls = ci.past ? 'text-warning' : 'text-subtle';
      var txt = ci.label + (ci.past ? ' ・ 更新が必要' : '');
      html += '<p class="whitespace-nowrap text-[11px] ' + cls + '">' + esc(txt) + '</p>';
    }
    return html;
  }
  // モバイルカードの契約要約（1行「客先 ・ 種別 ・ 2026年4月から ・ 3か月目」、プロジェクト継続の起点で数える）。
  // 契約なしは「未設定」
  function mobileContractSummary(m) {
    var C = window.CNContracts;
    var h = C.CT[m.name] || [];
    var ap = C.ga(h);
    if (!ap) return '未設定';
    var origin = C.projectStart(h, ap);
    var dur = C.durationLabel(origin);
    return C.cd(ap.client) + ' ・ ' + C.TL[ap.type] + ' ・ ' + C.periodShort(origin) + (dur ? ' ・ ' + dur : '');
  }
  function deptHtml(m) { return m.dept ? esc(m.dept) : '<span class="text-subtle-light">部署未設定</span>'; }
  // 有休データと突合できない人は営業への警告(ホームのカードが概算になる)なので注意色のチップにする
  function leaveChipHtml(m) { return m.leaveOk ? '' : '<span class="rounded-full border border-warning-border bg-warning-surface px-2 py-0.5 text-[10px] font-medium text-warning">有休データなし</span>'; }

  // 並び替え用のデータ属性。data-m-dept／data-m-contract／data-m-effective は「無い」ことと「空文字」を
  // 区別するため、値が無いときは属性自体を付けない（欠損は末尾・先頭に固定するソートで使う）
  function rowSortAttrs(m) {
    var C = window.CNContracts;
    var ap = C.ga(C.CT[m.name] || []);
    var out = '';
    if (m.dept) out += ' data-m-dept="' + esc(m.dept) + '"';
    if (ap) {
      out += ' data-m-contract="' + esc(ap.client || '') + '"';
      out += ' data-m-effective="' + esc(ap.effectiveFrom) + '"';
    }
    return out;
  }

  function mobileRowHtml(m) {
    return '<div data-member-row data-m-name="' + esc(m.name) + '"' + rowSortAttrs(m) + ' data-open-slide="contract-member" class="cursor-pointer px-4 py-2.5 transition-colors hover:bg-background">' +
      '<div class="flex items-center gap-2.5">' +
        '<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style="background:' + avatarColor(m.name) + ';">' + esc(m.name.charAt(0)) + '</span>' +
        '<div class="min-w-0 flex-1">' +
          '<div class="flex items-center gap-1.5"><div class="truncate text-sm font-semibold text-text">' + esc(m.name) + '</div>' + leaveChipHtml(m) + '</div>' +
          '<div class="truncate text-xs text-subtle-light">' + deptHtml(m) + '</div>' +
        '</div>' +
      '</div>' +
      '<p class="mt-1 text-xs text-subtle truncate" data-m="summary">' + esc(mobileContractSummary(m)) + '</p>' +
    '</div>';
  }
  function desktopRowHtml(m) {
    var chip = leaveChipHtml(m);
    return '<tr data-member-row data-m-name="' + esc(m.name) + '"' + rowSortAttrs(m) + ' data-open-slide="contract-member" class="cursor-pointer border-b border-border transition-colors hover:bg-background">' +
      '<td class="px-4 py-2.5"><div class="flex items-center gap-2.5">' +
        '<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style="background:' + avatarColor(m.name) + ';">' + esc(m.name.charAt(0)) + '</span>' +
        '<div class="min-w-0"><div class="truncate text-sm font-semibold text-text">' + esc(m.name) + '</div>' + (chip ? '<div class="mt-0.5">' + chip + '</div>' : '') + '</div>' +
      '</div></td>' +
      '<td class="px-4 py-2.5"><div class="text-[11.5px] text-subtle">' + deptHtml(m) + '</div></td>' +
      '<td class="px-4 py-2.5" data-m="contract">' + contractCellHtml(m) + '</td>' +
      '<td class="px-4 py-2.5" data-m="effective">' + effectiveCellHtml(m) + '</td>' +
    '</tr>';
  }

  function renderList() {
    var sorted = MEMBERS.slice().sort(function (a, b) { return a.name.localeCompare(b.name, 'ja'); });
    var mob = document.querySelector('[data-cm-list="mobile"]');
    var desk = document.querySelector('[data-cm-list="desktop"]');
    if (mob) mob.innerHTML = sorted.map(mobileRowHtml).join('');
    if (desk) desk.innerHTML = sorted.map(desktopRowHtml).join('');
  }

  // 部署の絞り込み Select の選択肢（「すべての部署」「部署未設定」＋データにある部署名の昇順）
  function initDeptFilter() {
    var sel = document.querySelector('[data-cm-deptfilter]');
    if (!sel) return;
    var depts = [];
    MEMBERS.forEach(function (m) { if (m.dept && depts.indexOf(m.dept) === -1) depts.push(m.dept); });
    depts.sort(function (a, b) { return a.localeCompare(b, 'ja'); });
    var html = '<option value="all" selected>すべての部署</option><option value="__none__">部署未設定</option>';
    depts.forEach(function (d) { html += '<option value="' + esc(d) + '">' + esc(d) + '</option>'; });
    sel.innerHTML = html;
  }

  function refreshRow(name) {
    var m = memberOf(name);
    if (!m) return;
    var C = window.CNContracts;
    var ap = C.ga(C.CT[name] || []);
    document.querySelectorAll('[data-member-row][data-m-name="' + name + '"]').forEach(function (row) {
      if (row.tagName === 'TR') {
        var c = row.querySelector('[data-m="contract"]'); if (c) c.innerHTML = contractCellHtml(m);
        var ef = row.querySelector('[data-m="effective"]'); if (ef) ef.innerHTML = effectiveCellHtml(m);
      } else {
        var sum = row.querySelector('[data-m="summary"]'); if (sum) sum.textContent = mobileContractSummary(m);
      }
      if (ap) { row.setAttribute('data-m-contract', ap.client || ''); row.setAttribute('data-m-effective', ap.effectiveFrom); }
      else { row.removeAttribute('data-m-contract'); row.removeAttribute('data-m-effective'); }
    });
    cmApplySort();
  }

  function filterList() {
    var searchEl = document.querySelector('[data-cm-search]');
    var chipEl = document.querySelector('[data-cm-chip="none"]');
    var deptEl = document.querySelector('[data-cm-deptfilter]');
    var q = (searchEl ? searchEl.value : '').trim().toLowerCase();
    var noneOnly = !!chipEl && chipEl.getAttribute('aria-pressed') === 'true';
    var dept = deptEl ? deptEl.value : 'all';
    var C = window.CNContracts;
    document.querySelectorAll('[data-member-row]').forEach(function (row) {
      var name = row.getAttribute('data-m-name');
      var m = memberOf(name);
      if (!m) return;
      var ok = true;
      if (q && name.toLowerCase().indexOf(q) === -1 && m.email.toLowerCase().indexOf(q) === -1) ok = false;
      if (noneOnly && (C.CT[name] || []).length > 0) ok = false;
      if (dept === '__none__') { if (m.dept) ok = false; }
      else if (dept !== 'all' && m.dept !== dept) ok = false;
      row.style.display = ok ? '' : 'none';
    });
  }

  // ---- 並び替え（ユーザー一覧 data-u-sort-* と同じ方式。CM_ プレフィックスで独立させる） ----
  var cmSort = { key: 'name', dir: 'asc' };
  var CM_SORT_DEFAULT_DIR = { name: 'asc', dept: 'asc', contract: 'asc', effective: 'asc' };
  var CM_SORT_ICON_SWAP = '<svg viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5 text-subtle-light" data-cm-sort-icon><path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z"/></svg>';
  var CM_SORT_ICON_ASC = '<svg viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5 text-primary" data-cm-sort-icon><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/></svg>';
  var CM_SORT_ICON_DESC = '<svg viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5 text-primary" data-cm-sort-icon><path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/></svg>';

  function cmNameCmp(a, b) { return a.getAttribute('data-m-name').localeCompare(b.getAttribute('data-m-name'), 'ja'); }
  function cmSortRows() {
    var sign = cmSort.dir === 'asc' ? 1 : -1;
    ['mobile', 'desktop'].forEach(function (which) {
      var box = document.querySelector('[data-cm-list="' + which + '"]');
      if (!box) return;
      var rows = Array.prototype.slice.call(box.querySelectorAll('[data-member-row]'));
      rows.sort(function (a, b) {
        if (cmSort.key === 'dept') {
          var ad = a.getAttribute('data-m-dept'), bd = b.getAttribute('data-m-dept');
          if (ad === null && bd === null) return cmNameCmp(a, b);
          if (ad === null) return sign;   // 部署未設定は昇順で末尾・降順で先頭
          if (bd === null) return -sign;
          return ad.localeCompare(bd, 'ja') * sign || cmNameCmp(a, b);
        }
        if (cmSort.key === 'contract') {
          var ac = a.getAttribute('data-m-contract'), bc = b.getAttribute('data-m-contract');
          if (ac === null && bc === null) return cmNameCmp(a, b);
          if (ac === null) return sign;   // 契約なしは昇順で末尾・降順で先頭
          if (bc === null) return -sign;
          return ac.localeCompare(bc, 'ja') * sign || cmNameCmp(a, b);
        }
        if (cmSort.key === 'effective') {
          var ae = a.getAttribute('data-m-effective'), be = b.getAttribute('data-m-effective');
          if (ae === null && be === null) return cmNameCmp(a, b);
          if (ae === null) return sign;
          if (be === null) return -sign;
          return ae.localeCompare(be) * sign || cmNameCmp(a, b);
        }
        return a.getAttribute('data-m-name').localeCompare(b.getAttribute('data-m-name'), 'ja') * sign;
      });
      rows.forEach(function (r) { box.appendChild(r); });
    });
  }
  function cmSyncSortUi() {
    var sel = document.querySelector('[data-cm-sort-select]');
    if (sel) sel.value = cmSort.key;
    var dirBtn = document.querySelector('[data-cm-sort-dir]');
    if (dirBtn) {
      var asc = cmSort.dir === 'asc';
      dirBtn.setAttribute('aria-label', asc ? '昇順（押すと降順に切替）' : '降順（押すと昇順に切替）');
      dirBtn.innerHTML = (asc ? CM_SORT_ICON_ASC : CM_SORT_ICON_DESC).replace('data-cm-sort-icon', '').replace('h-3.5 w-3.5', 'h-4 w-4');
    }
    document.querySelectorAll('[data-cm-sort-btn]').forEach(function (btn) {
      var active = btn.getAttribute('data-cm-sort-btn') === cmSort.key;
      var icon = active ? (cmSort.dir === 'asc' ? CM_SORT_ICON_ASC : CM_SORT_ICON_DESC) : CM_SORT_ICON_SWAP;
      var cur = btn.querySelector('[data-cm-sort-icon]');
      if (cur) cur.outerHTML = icon;
      var th = btn.closest('th');
      if (th) {
        if (active) th.setAttribute('aria-sort', cmSort.dir === 'asc' ? 'ascending' : 'descending');
        else th.removeAttribute('aria-sort');
      }
    });
  }
  function cmApplySort() { cmSortRows(); cmSyncSortUi(); }

  // ---- パネル ----
  function unsetSpan() { return '<span class="text-subtle-light">未設定</span>'; }
  function gridItem(label, valueHtml, extraClass) {
    return '<div' + (extraClass ? ' class="' + extraClass + '"' : '') + '><p class="text-[10px] text-subtle">' + esc(label) + '</p><p class="text-sm text-text">' + valueHtml + '</p></div>';
  }
  // マイナー要素（客先名・休業日カレンダー）へのリンク。demo 既存リンク（`data-ct="manage-link"`）と同じクラス
  function linkBtn(attrHtml, label) {
    return '<button type="button" ' + attrHtml + ' class="text-left text-xs text-primary hover:underline">' + label + '</button>';
  }
  // 「現在の契約」ブロック（適用中の契約があるときだけ使う）。客先の詳細は window.CNClients から引く。
  // h は本人の契約履歴全体（プロジェクト継続の起点計算に使う）。待機は「待機」「種別」「定時」「適用開始」
  // 「プロジェクト継続（該当時）」だけで、契約更新・勤務形態・単価・精算単位・超過／控除・支援費は出さない
  function currentContractBlockHtml(ap, h) {
    var C = window.CNContracts;
    var items = [];
    var isStandby = !ap.client;
    if (!isStandby) {
      var cl = window.CNClients ? window.CNClients.get(ap.client) : null;
      items.push(gridItem('プロジェクト', linkBtn('data-cm-open-client="' + esc(ap.client) + '"', esc(ap.client))));
      items.push(gridItem('客先の連絡先', cl && cl.contact ? esc(cl.contact) : unsetSpan()));
      items.push(gridItem('客先リーダー', cl && cl.leader ? esc(cl.leader) : unsetSpan()));
      var salesVal;
      if (!cl || !cl.sales) {
        salesVal = unsetSpan();
      } else {
        salesVal = esc(cl.sales);
        if (cl.salesPhone) salesVal += '<br><span class="text-xs text-subtle">' + esc(cl.salesPhone) + '</span>';
        if (cl.salesEmail) salesVal += '<br><span class="text-xs text-subtle">' + esc(cl.salesEmail) + '</span>';
      }
      items.push(gridItem('客先営業担当者', salesVal));
      items.push(gridItem('自社の営業担当者', cl && cl.ourSales ? esc(cl.ourSales) : unsetSpan()));
      items.push(gridItem('契約締結企業', cl && cl.primaryCompany ? esc(cl.primaryCompany) : '<span class="text-subtle-light">客先と同じ</span>'));
      if (cl && cl.primaryCompany) {
        var primaryVal = cl.primaryContact ? esc(cl.primaryContact) : unsetSpan();
        if (cl.primaryContact) {
          if (cl.primaryPhone) primaryVal += '<br><span class="text-xs text-subtle">' + esc(cl.primaryPhone) + '</span>';
          if (cl.primaryEmail) primaryVal += '<br><span class="text-xs text-subtle">' + esc(cl.primaryEmail) + '</span>';
        }
        items.push(gridItem('締結企業の担当者', primaryVal));
      }
      var bizVal;
      if (!cl) bizVal = unsetSpan();
      else if (cl.owncal) bizVal = linkBtn('data-open-slide="business-calendar"', '客先の休業日カレンダー');
      else bizVal = '自社の休業日カレンダー';
      items.push(gridItem('営業日', bizVal, 'col-span-2'));
    } else {
      items.push('<div class="col-span-2"><p class="text-sm text-text">待機</p></div>');
    }
    items.push(gridItem('種別', esc(C.TL[ap.type])));
    items.push(gridItem('定時', esc(C.fn(ap.daily)) + '時間'));
    var rc = C.rangeCell(ap);
    if (rc) items.push(gridItem(rc.label, esc(rc.value)));
    if (ap.type !== 'NONE') items.push(gridItem('精算単位', esc(C.settlementUnitLabel(ap))));
    items.push(gridItem('適用開始', esc(C.periodFull(ap.effectiveFrom)), 'col-span-2'));
    var origin = C.projectStart(h || [], ap);
    if (origin && origin !== ap.effectiveFrom) {
      var pdur = C.durationLabel(origin);
      items.push(gridItem('プロジェクト継続', esc(C.periodFull(origin)) + (pdur ? ' ・ ' + esc(pdur) : ''), 'col-span-2'));
    }
    if (isStandby) {
      return '<div class="grid grid-cols-2 gap-x-3 gap-y-2">' + items.join('') + '</div>';
    }
    var ci = C.committedInfo(ap.committedUntil, C.CM);
    var cuVal = ci ? esc(ci.label) + (ci.past ? ' <span class="text-xs text-warning">契約更新が必要です</span>' : '') : unsetSpan();
    items.push(gridItem('契約更新', cuVal, 'col-span-2'));
    var ws = C.workStyleLabel(ap);
    // 「出社 週3日 ／ リモート 週2日」は 1 列に収まらず「週2／日」で折れるので 1 行に伸ばす
    items.push(gridItem('勤務形態', ws ? esc(ws) : unsetSpan(), 'col-span-2'));
    var up = C.unitPriceLabel(ap);
    items.push(gridItem('単価', up ? esc(up) : unsetSpan()));
    if (ap.type !== 'NONE' && ap.unitPriceUnit !== 'HOURLY') {
      var od = C.overtimeDeductionLabel(ap);
      items.push(gridItem('超過／控除', od ? esc(od) : unsetSpan()));
    }
    items.push(gridItem('支援費', esc(C.supportFeeLabel(ap)), 'col-span-2'));
    return '<div class="grid grid-cols-2 gap-x-3 gap-y-2">' + items.join('') + '</div>';
  }

  function renderPanel(name) {
    var C = window.CNContracts;
    var m = memberOf(name);
    if (!m || !C) return;
    var h = C.CT[name] || [];
    var cls = C.classify(h, C.CM);
    var current = cls.current;
    var nextFuture = !current && cls.visible.length ? cls.visible[cls.visible.length - 1].e : null;
    // visible には「current が無いときの全行」が入るため、開始月が当月以前（＝未来ではない）行を
    // nextFuture 扱いしない
    if (nextFuture && nextFuture.effectiveFrom <= C.CM) nextFuture = null;
    var all = C.allRows(h);
    var shown = all.slice(0, 10);
    var rest = all.slice(10);
    document.querySelectorAll('[data-slide="contract-member"]').forEach(function (p) {
      var ava = p.querySelector('[data-cm-p="avatar"]');
      if (ava) { ava.textContent = m.name.charAt(0); ava.style.background = avatarColor(m.name); }
      var nameEl = p.querySelector('[data-cm-p="name"]'); if (nameEl) nameEl.textContent = m.name;
      var deptEl = p.querySelector('[data-cm-p="dept"]'); if (deptEl) deptEl.textContent = m.dept || '部署未設定';
      var curEl = p.querySelector('[data-cm-p="current"]');
      if (curEl) {
        if (current) curEl.innerHTML = currentContractBlockHtml(current, h);
        else C.rs(curEl, null, nextFuture);
      }
      var note = p.querySelector('[data-cm-p="note"]');
      if (note) {
        if (!m.leaveOk) { note.textContent = '有休データと突合できません。ホームの「プロジェクト」カードは有休を差し引かない概算になります。有休の取込で社員番号を確認してください'; note.style.display = ''; }
        else { note.style.display = 'none'; }
      }
      C.rh(p.querySelector('[data-cm-p="history"]'), shown, current, C.CM);
      var toggle = p.querySelector('[data-cm-p="past-toggle"]');
      var pastEl = p.querySelector('[data-cm-p="past-history"]');
      if (toggle && pastEl) {
        if (!rest.length) {
          toggle.style.display = 'none';
          pastEl.style.display = 'none';
        } else {
          toggle.style.display = '';
          toggle.textContent = pastOpen ? '残りを隠す' : '過去の条件を表示（残り ' + rest.length + ' 件）';
          if (pastOpen) { pastEl.style.display = ''; C.rh(pastEl, rest, current, C.CM); }
          else { pastEl.style.display = 'none'; }
        }
      }
    });
  }

  document.addEventListener('cn-contract-member-open', function (e) {
    openName = e.detail && e.detail.name;
    pastOpen = false;
    if (openName) renderPanel(openName);
  });
  document.addEventListener('cn-contracts-changed', function (e) {
    var name = e.detail && e.detail.name;
    if (!name) return;
    refreshRow(name);
    if (openName === name) renderPanel(name);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { pastOpen = false; openName = null; } });

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-close-slide="contract-member"]')) { pastOpen = false; openName = null; return; }
    var ov = e.target.closest('[data-overlay="contract-member"]');
    if (ov && e.target === ov) { pastOpen = false; openName = null; return; }
    var toggle = e.target.closest('[data-cm-p="past-toggle"]');
    if (toggle) { pastOpen = !pastOpen; if (openName) renderPanel(openName); return; }
    var addBtn = e.target.closest('[data-cm-p="add"]');
    if (addBtn) { if (window.CNContracts) window.CNContracts.openAdd(addBtn); return; }
    var clientLink = e.target.closest('[data-cm-open-client]');
    if (clientLink) {
      var clientName = clientLink.getAttribute('data-cm-open-client');
      pastOpen = false; openName = null;
      if (window.closeSlide) window.closeSlide('contract-member');
      if (window.CNClients && window.CNClients.open) window.CNClients.open(clientName);
      return;
    }
    var editBtn = e.target.closest('[data-ct-edit]');
    if (editBtn) { if (window.CNContracts) window.CNContracts.openEdit(parseInt(editBtn.getAttribute('data-ct-edit'), 10), editBtn); return; }
    var chip = e.target.closest('[data-cm-chip="none"]');
    if (chip) {
      var on = chip.getAttribute('aria-pressed') !== 'true';
      chip.setAttribute('aria-pressed', on ? 'true' : 'false');
      chip.className = 'rounded-full border px-3 py-2 text-xs ' + (on ? 'border-warning-border bg-warning-surface font-semibold text-warning' : 'border-border bg-background-light text-subtle');
      filterList();
      return;
    }
    if (e.target.closest('[data-cm-sort-dir]')) {
      cmSort.dir = cmSort.dir === 'asc' ? 'desc' : 'asc';
      cmApplySort();
      return;
    }
    var sortBtn = e.target.closest('[data-cm-sort-btn]');
    if (sortBtn) {
      var key = sortBtn.getAttribute('data-cm-sort-btn');
      if (cmSort.key === key) cmSort.dir = cmSort.dir === 'asc' ? 'desc' : 'asc';
      else { cmSort.key = key; cmSort.dir = CM_SORT_DEFAULT_DIR[key]; }
      cmApplySort();
    }
  });
  document.addEventListener('input', function (e) { if (e.target.closest('[data-cm-search]')) filterList(); });
  document.addEventListener('change', function (e) {
    if (e.target.matches('[data-cm-deptfilter]')) { filterList(); return; }
    if (e.target.matches('[data-cm-sort-select]')) {
      if (e.target.value === cmSort.key) return;
      cmSort.key = e.target.value;
      cmSort.dir = CM_SORT_DEFAULT_DIR[cmSort.key];
      cmApplySort();
    }
  });

  renderList();
  initDeptFilter();
  cmApplySort();
})();
