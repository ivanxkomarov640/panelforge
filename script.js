(() => {
  const root = document.querySelector('.pf-app');
  if (!root) return;
  const $ = (id) => document.getElementById(id);
  const defaults = {
    panelTitle: 'Admin panel', panelVersion: '1.0.0',
    panelSubtitle: 'starve.io · press J to hide', panelAuthor: '',
    hotkey: 'J', workerUrl: 'https://dark-boat-9eea.ivan-komarov640.workers.dev/',
    panelScale: 100, panelWidth: 780, panelRadius: 16, accentColor: '#b9c8e7',
    liveUpdate: true, darkMode: true
  };
  const readSettings = () => ({
    panelTitle: $('panelTitle').value.trim() || defaults.panelTitle,
    panelVersion: $('panelVersion').value.trim() || defaults.panelVersion,
    panelSubtitle: $('panelSubtitle').value,
    panelAuthor: $('panelAuthor').value,
    hotkey: ($('hotkey').value.trim() || 'J').slice(0,1).toUpperCase(),
    workerUrl: $('workerUrl').value.trim(),
    panelScale: Number($('panelScale').value),
    panelWidth: Number($('panelWidth').value),
    panelRadius: Number($('panelRadius').value),
    accentColor: $('accentColor').value,
    liveUpdate: $('liveUpdate').checked && $('toolbarLive').checked,
    darkMode: $('darkMode').checked
  });
  function applySettings() {
    const s = readSettings();
    $('previewTitle').textContent = s.panelTitle;
    $('previewVersion').textContent = 'v' + s.panelVersion;
    $('previewSubtitle').textContent = s.panelSubtitle;
    $('authorFooter').textContent = s.panelAuthor ? 'Created by ' + s.panelAuthor : '';
    $('scaleValue').textContent = s.panelScale + '%';
    $('widthValue').textContent = s.panelWidth + 'px';
    $('radiusValue').textContent = s.panelRadius + 'px';
    $('preview').style.setProperty('--preview-width', s.panelWidth + 'px');
    $('preview').style.setProperty('--preview-scale', s.panelScale / 100);
    $('preview').style.setProperty('--pf-radius', s.panelRadius + 'px');
    root.style.setProperty('--pf-accent', s.accentColor);
    root.classList.toggle('pf-light', !s.darkMode);
  }
  ['panelTitle','panelVersion','panelSubtitle','panelAuthor','hotkey','panelScale','panelWidth','panelRadius','accentColor','darkMode','liveUpdate','toolbarLive'].forEach(id => {
    $(id).addEventListener('input', () => { if (readSettings().liveUpdate) applySettings(); });
    $(id).addEventListener('change', () => { if (readSettings().liveUpdate) applySettings(); });
  });
  $('applySettings').addEventListener('click', applySettings);
  $('resetSettings').addEventListener('click', () => {
    Object.entries(defaults).forEach(([key, value]) => {
      const el = $(key);
      if (!el) return;
      if (el.type === 'checkbox') el.checked = value;
      else el.value = value;
    });
    $('toolbarLive').checked = true;
    applySettings();
    setWorkerStatus('Not checked', false);
  });
  document.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active', b === btn));
    const login = btn.dataset.view === 'login';
    $('loginView').hidden = !login;
    $('panelView').hidden = login;
  }));
  document.querySelectorAll('[data-inner]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-inner]').forEach(b => b.classList.toggle('active', b === btn));
    $('commandGrid').style.gridTemplateColumns = btn.dataset.inner === 'list' ? '1fr' : '';
  }));
  document.querySelectorAll('[data-tab]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b === btn));
    $('previewSubtitle').textContent = btn.dataset.tab === 'script' ? 'Script panel preview' : readSettings().panelSubtitle;
  }));
  $('moonButton').addEventListener('click', () => {
    $('darkMode').checked = ! $('darkMode').checked;
    applySettings();
  });
  $('minimizeButton').addEventListener('click', () => {
    $('panelView').hidden = !$('panelView').hidden;
    $('loginView').hidden = true;
  });
  $('closeButton').addEventListener('click', () => $('preview').style.display = 'none');
  document.addEventListener('keydown', e => {
    if (e.key.toUpperCase() === readSettings().hotkey && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
      $('preview').style.display = $('preview').style.display === 'none' ? '' : 'none';
    }
  });
  $('commandSearch').addEventListener('input', () => {
    const q = $('commandSearch').value.toLowerCase();
    document.querySelectorAll('.pf-command-card').forEach(card => card.hidden = !card.textContent.toLowerCase().includes(q));
  });
  document.querySelectorAll('.pf-command-card').forEach(card => card.addEventListener('click', () => {
    $('loginStatus').textContent = 'Preview only. No command was sent to the Worker.';
    document.querySelector('[data-view="login"]').click();
  }));
  function setWorkerStatus(text, online) {
    $('workerStatus').textContent = text;
    document.querySelector('.pf-dot').classList.toggle('online', !!online);
  }
  async function checkWorker() {
    const base = $('workerUrl').value.trim().replace(/\/+$/, '');
    if (!base) return setWorkerStatus('Enter a Worker URL', false);
    setWorkerStatus('Checking…', false);
    try {
      const response = await fetch(base + '/', { method: 'GET' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error('HTTP ' + response.status);
      setWorkerStatus((data.service || 'Worker') + ' · ' + (data.status || 'responded'), true);
    } catch (err) {
      setWorkerStatus('Could not connect (check CORS / URL)', false);
    }
  }
  $('checkWorker').addEventListener('click', checkWorker);
  $('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const base = $('workerUrl').value.trim().replace(/\/+$/, '');
    $('loginStatus').textContent = 'Sending sign-in request…';
    try {
      const res = await fetch(base + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: $('username').value, password: $('password').value }),
        credentials: 'include'
      });
      const data = await res.json().catch(() => ({}));
      $('loginStatus').textContent = res.ok ? (data.message || 'Worker accepted the request.') : (data.error || 'Sign-in failed: HTTP ' + res.status);
    } catch (_) {
      $('loginStatus').textContent = 'Request failed. Ensure your Worker enables CORS for this CodePen origin.';
    }
  });
  $('getCode').addEventListener('click', () => {
    const s = readSettings();
    $('generatedCode').value = JSON.stringify({
      title: s.panelTitle, version: s.panelVersion, subtitle: s.panelSubtitle,
      author: s.panelAuthor, hotkey: s.hotkey, workerUrl: s.workerUrl,
      width: s.panelWidth, scale: s.panelScale, radius: s.panelRadius,
      accent: s.accentColor, darkMode: s.darkMode
    }, null, 2);
    $('codeDialog').showModal();
  });
  $('copyCode').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($('generatedCode').value);
      $('copyCode').textContent = 'Copied!';
    } catch (_) {
      $('generatedCode').select();
      document.execCommand('copy');
      $('copyCode').textContent = 'Selected / copied';
    }
  });
  applySettings();
})();