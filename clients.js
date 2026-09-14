/* ============================================================
   CrewNest DEMO: 管理画面「ユーザー」タブの客先サブタブ（issue #54 稼働早見表）
   使い方: <script src="clients.js"></script>（CrewNest Admin.html に追加）
   本体 src/features/admin/components/AdminClientsClient.tsx・AdminUsersTabs.tsx の React 化前の静的再現。
   ソース: ~/.claude-tools/crew-nest-mock/issue54/fragments/admin-clients.js
   ============================================================ */
(function () {
  var style = document.createElement('style');
  style.textContent = '[data-upanel]:not(.active){display:none!important}[data-uctab-panel]:not(.active){display:none!important}';
  document.head.appendChild(style);

  function currentUctab() {
    var active = document.querySelector('[data-uctab].is-active');
    return active ? active.getAttribute('data-uctab') : 'members';
  }

  // primary: 'users' | 'contracts'。secondary（primary==='contracts' のときだけ意味を持つ）: 'members' | 'clients'
  function updateFabVisibility(primary, secondary) {
    var clientFab = document.querySelector('[data-open-slide="client-edit"][data-client-new="1"][aria-label="客先を追加"]');
    var userFab = document.querySelector('[data-open-slide="user-invite"][aria-label="ユーザーを招待"]');
    if (clientFab) clientFab.style.display = (primary === 'contracts' && secondary === 'clients') ? '' : 'none';
    if (userFab) userFab.style.display = (primary === 'users') ? '' : 'none';
  }

  function selectUctab(sub) {
    document.querySelectorAll('[data-uctab]').forEach(function (b) {
      var active = b.getAttribute('data-uctab') === sub;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    document.querySelectorAll('[data-uctab-panel]').forEach(function (p) {
      p.classList.toggle('active', p.getAttribute('data-uctab-panel') === sub);
    });
  }

  document.querySelectorAll('[data-utab]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var tab = btn.getAttribute('data-utab');
      document.querySelectorAll('[data-utab]').forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      document.querySelectorAll('[data-upanel]').forEach(function (p) {
        p.classList.toggle('active', p.getAttribute('data-upanel') === tab);
      });
      updateFabVisibility(tab, currentUctab());
    });
  });
  document.querySelectorAll('[data-uctab]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var sub = btn.getAttribute('data-uctab');
      selectUctab(sub);
      updateFabVisibility('contracts', sub);
    });
  });
  updateFabVisibility('users', 'members');

  function setFieldValue(panel, key, value) {
    var el = panel.querySelector('[data-ce="' + key + '"]');
    if (el) el.value = value;
  }

  function applyOwncal(state) {
    document.querySelectorAll('[data-ce="owncal"]').forEach(function (btn) {
      btn.setAttribute('aria-checked', state ? 'true' : 'false');
      var knob = btn.querySelector('span');
      if (knob) {
        knob.classList.toggle('translate-x-0', !state);
        knob.classList.toggle('translate-x-[18px]', state);
        btn.classList.toggle('bg-primary', state);
        btn.classList.toggle('bg-border', !state);
      }
    });
    document.querySelectorAll('[data-ce="calendar-btn"]').forEach(function (btn) {
      btn.hidden = !state;
    });
  }

  document.addEventListener('slidewillopen', function (e) {
    if (!e.detail || e.detail.id !== 'client-edit') return;
    var trigger = e.detail.trigger;
    var isNew = !!(trigger && trigger.getAttribute('data-client-new') === '1');
    var data = { name: '', project: '', contact: '', sales: '', leader: '', owncal: false, count: 0 };
    if (!isNew && trigger) {
      data.name = trigger.getAttribute('data-c-name') || '';
      data.project = trigger.getAttribute('data-c-project') || '';
      data.contact = trigger.getAttribute('data-c-contact') || '';
      data.sales = trigger.getAttribute('data-c-sales') || '';
      data.leader = trigger.getAttribute('data-c-leader') || '';
      data.owncal = trigger.getAttribute('data-c-owncal') === '1';
      data.count = parseInt(trigger.getAttribute('data-c-count') || '0', 10);
    }
    document.querySelectorAll('[data-slide="client-edit"]').forEach(function (panel) {
      var titleEl = panel.querySelector('[data-ce="title"]');
      if (titleEl) titleEl.textContent = isNew ? '客先を追加' : '客先を編集';
      setFieldValue(panel, 'name', data.name);
      setFieldValue(panel, 'project', data.project);
      setFieldValue(panel, 'contact', data.contact);
      setFieldValue(panel, 'sales', data.sales);
      setFieldValue(panel, 'leader', data.leader);
      var deleteWrap = panel.querySelector('[data-ce="delete-wrap"]');
      var deleteBtn = panel.querySelector('[data-ce="delete"]');
      var deleteNote = panel.querySelector('[data-ce="delete-note"]');
      if (isNew) {
        if (deleteWrap) deleteWrap.style.display = 'none';
      } else {
        if (deleteWrap) deleteWrap.style.display = '';
        var hasResident = data.count > 0;
        if (deleteBtn) deleteBtn.disabled = hasResident;
        if (deleteNote) deleteNote.style.display = hasResident ? '' : 'none';
      }
    });
    applyOwncal(data.owncal);
  });

  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-ce="owncal"]');
    if (toggle) applyOwncal(toggle.getAttribute('aria-checked') !== 'true');
  });

  document.addEventListener('input', function (e) {
    var input = e.target.closest('[data-c-search]');
    if (!input) return;
    var q = input.value.trim().toLowerCase();
    document.querySelectorAll('[data-client-row]').forEach(function (row) {
      var hit = !q || ['data-c-name', 'data-c-project', 'data-c-contact', 'data-c-sales', 'data-c-leader'].some(function (attr) {
        return (row.getAttribute(attr) || '').toLowerCase().indexOf(q) !== -1;
      });
      row.style.display = hit ? '' : 'none';
    });
  });

  // ---- 並び替え（ユーザー一覧 UsersTable の data-u-sort-* と同じ方式。CL_ プレフィックスで独立させる） ----
  var clSort = { key: 'client', dir: 'asc' };
  var CL_SORT_DEFAULT_DIR = { client: 'asc', contact: 'asc', sales: 'asc', leader: 'asc', count: 'desc' };
  var CL_SORT_ICON_SWAP = '<svg viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5 text-subtle-light" data-cl-sort-icon><path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z"/></svg>';
  var CL_SORT_ICON_ASC = '<svg viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5 text-primary" data-cl-sort-icon><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/></svg>';
  var CL_SORT_ICON_DESC = '<svg viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5 text-primary" data-cl-sort-icon><path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/></svg>';

  function clDisplayCmp(a, b) {
    return a.getAttribute('data-c-name').localeCompare(b.getAttribute('data-c-name'), 'ja')
      || (a.getAttribute('data-c-project') || '').localeCompare(b.getAttribute('data-c-project') || '', 'ja');
  }
  function clCmpStr(a, b, attr, sign) {
    var av = a.getAttribute(attr) || null, bv = b.getAttribute(attr) || null;
    if (av === '') av = null;
    if (bv === '') bv = null;
    if (av === null && bv === null) return clDisplayCmp(a, b);
    if (av === null) return sign;   // 欠損は昇順で末尾・降順で先頭
    if (bv === null) return -sign;
    return av.localeCompare(bv, 'ja') * sign || clDisplayCmp(a, b);
  }
  function clSortRows() {
    var sign = clSort.dir === 'asc' ? 1 : -1;
    ['mobile', 'desktop'].forEach(function (which) {
      var box = document.querySelector('[data-c-list="' + which + '"]');
      if (!box) return;
      var rows = Array.prototype.slice.call(box.querySelectorAll('[data-client-row]'));
      rows.sort(function (a, b) {
        if (clSort.key === 'contact') return clCmpStr(a, b, 'data-c-contact', sign);
        if (clSort.key === 'sales') return clCmpStr(a, b, 'data-c-sales', sign);
        if (clSort.key === 'leader') return clCmpStr(a, b, 'data-c-leader', sign);
        if (clSort.key === 'count') {
          var ac = Number(a.getAttribute('data-c-count')), bc = Number(b.getAttribute('data-c-count'));
          var d = ac - bc;
          return d !== 0 ? d * sign : clDisplayCmp(a, b);
        }
        return clDisplayCmp(a, b) * sign;
      });
      rows.forEach(function (r) { box.appendChild(r); });
    });
  }
  function clSyncSortUi() {
    var sel = document.querySelector('[data-cl-sort-select]');
    if (sel) sel.value = clSort.key;
    var dirBtn = document.querySelector('[data-cl-sort-dir]');
    if (dirBtn) {
      var asc = clSort.dir === 'asc';
      dirBtn.setAttribute('aria-label', asc ? '昇順（押すと降順に切替）' : '降順（押すと昇順に切替）');
      dirBtn.innerHTML = (asc ? CL_SORT_ICON_ASC : CL_SORT_ICON_DESC).replace('data-cl-sort-icon', '').replace('h-3.5 w-3.5', 'h-4 w-4');
    }
    document.querySelectorAll('[data-cl-sort-btn]').forEach(function (btn) {
      var active = btn.getAttribute('data-cl-sort-btn') === clSort.key;
      var icon = active ? (clSort.dir === 'asc' ? CL_SORT_ICON_ASC : CL_SORT_ICON_DESC) : CL_SORT_ICON_SWAP;
      var cur = btn.querySelector('[data-cl-sort-icon]');
      if (cur) cur.outerHTML = icon;
      var th = btn.closest('th');
      if (th) {
        if (active) th.setAttribute('aria-sort', clSort.dir === 'asc' ? 'ascending' : 'descending');
        else th.removeAttribute('aria-sort');
      }
    });
  }
  function clApplySort() { clSortRows(); clSyncSortUi(); }
  clApplySort();
  document.addEventListener('change', function (e) {
    if (e.target.matches('[data-cl-sort-select]')) {
      if (e.target.value === clSort.key) return;
      clSort.key = e.target.value;
      clSort.dir = CL_SORT_DEFAULT_DIR[clSort.key];
      clApplySort();
    }
  });
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-cl-sort-dir]')) {
      clSort.dir = clSort.dir === 'asc' ? 'desc' : 'asc';
      clApplySort();
      return;
    }
    var sortBtn = e.target.closest('[data-cl-sort-btn]');
    if (sortBtn) {
      var key = sortBtn.getAttribute('data-cl-sort-btn');
      if (clSort.key === key) clSort.dir = clSort.dir === 'asc' ? 'desc' : 'asc';
      else { clSort.key = key; clSort.dir = CL_SORT_DEFAULT_DIR[key]; }
      clApplySort();
    }
  });

  // 契約 › メンバーのパネル（contract-members.js）が「現在の契約」ブロックに客先の詳細（連絡先・担当者・
  // リーダー・営業日）を出すための参照 API。客先データは DOM の data-client-row にしか無いため、
  // 呼ばれた時点の DOM から都度組み立てる（客先の数が少ないデモなのでキャッシュはしない）
  function findClientRow(displayName) {
    var found = null;
    document.querySelectorAll('[data-c-list="desktop"] [data-client-row]').forEach(function (row) {
      if (found) return;
      var name = row.getAttribute('data-c-name') || '';
      var project = row.getAttribute('data-c-project') || '';
      var display = project ? name + ' ／ ' + project : name;
      if (display === displayName) found = row;
    });
    return found;
  }

  window.CNClients = {
    get: function (displayName) {
      var row = findClientRow(displayName);
      if (!row) return null;
      return {
        name: row.getAttribute('data-c-name') || '',
        project: row.getAttribute('data-c-project') || '',
        contact: row.getAttribute('data-c-contact') || '',
        sales: row.getAttribute('data-c-sales') || '',
        leader: row.getAttribute('data-c-leader') || '',
        owncal: row.getAttribute('data-c-owncal') === '1'
      };
    },
    // 契約 › メンバーのパネルから、客先名で「契約 › 客先」サブタブへ切り替えて編集パネルを開く
    open: function (displayName) {
      var row = findClientRow(displayName);
      if (!row) return;
      var contractsTab = document.querySelector('[data-utab="contracts"]');
      if (contractsTab) contractsTab.click();
      var clientsSub = document.querySelector('[data-uctab="clients"]');
      if (clientsSub) clientsSub.click();
      document.dispatchEvent(new CustomEvent('slidewillopen', { detail: { id: 'client-edit', trigger: row } }));
      if (window.openSlide) window.openSlide('client-edit', row);
    }
  };
})();
