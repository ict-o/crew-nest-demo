/* ============================================================
   CrewNest DEMO: 管理画面「ユーザー」タブの客先サブタブ（issue #54 稼働早見表）
   使い方: <script src="clients.js"></script>（CrewNest Admin.html に追加）
   本体 src/features/admin/components/AdminClientsClient.tsx・AdminUsersTabs.tsx の React 化前の静的再現。
   ソース: ~/.claude-tools/crew-nest-mock/issue54/fragments/admin-clients.js
   ============================================================ */
(function () {
  var style = document.createElement('style');
  style.textContent = '[data-upanel]:not(.active){display:none!important}';
  document.head.appendChild(style);

  function updateFabVisibility(tab) {
    var clientFab = document.querySelector('[data-open-slide="client-edit"][data-client-new="1"][aria-label="客先を追加"]');
    var userFab = document.querySelector('[data-open-slide="user-invite"][aria-label="ユーザーを招待"]');
    if (tab === 'clients') {
      if (clientFab) clientFab.style.display = '';
      if (userFab) userFab.style.display = 'none';
    } else {
      if (clientFab) clientFab.style.display = 'none';
      if (userFab) userFab.style.display = '';
    }
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
      updateFabVisibility(tab);
    });
  });
  updateFabVisibility('users');

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
    var q = input.value.trim();
    document.querySelectorAll('[data-client-row]').forEach(function (row) {
      var name = row.getAttribute('data-c-name') || '';
      row.style.display = name.indexOf(q) === -1 ? 'none' : '';
    });
  });
})();
