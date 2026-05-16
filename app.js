// ─── HELPERS ───────────────────────────────────────────────────────────────

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const t = document.getElementById(id);
  if (t) { t.classList.add('active'); t.scrollTop = 0; }
}

function showToast(msg) {
  document.querySelector('.toast')?.remove();
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2100);
}

// ─── APP ───────────────────────────────────────────────────────────────────

const App = (() => {
  function init() {
    setDate();
    refreshHome();
    bindHome();
    bindSession();
    bindHistory();
    bindExportModal();
    registerSW();
  }

  function setDate() {
    document.getElementById('hero-date').textContent =
      new Date().toLocaleDateString('nl-NL', { weekday:'long', day:'numeric', month:'long' });
  }

  function refreshHome() {
    const all = DB.getAll();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay()+6)%7));
    weekStart.setHours(0,0,0,0);
    const weekCount = all.filter(s => new Date(s.timestamp||s.date) >= weekStart).length;
    const last = all[0];
    const lastStr = last
      ? new Date(last.timestamp||last.date).toLocaleDateString('nl-NL',{weekday:'short',day:'numeric',month:'short'})
      : '—';

    document.getElementById('hero-stats').innerHTML = `
      <div class="hero-stat">
        <div class="hero-stat-val">${weekCount}</div>
        <div class="hero-stat-lbl">DEZE WEEK</div>
      </div>
      <div class="hero-stat">
        <div class="hero-stat-val">${all.length}</div>
        <div class="hero-stat-lbl">TOTAAL</div>
      </div>
      <div class="hero-stat">
        <div class="hero-stat-val" style="font-size:17px;margin-top:4px">${lastStr}</div>
        <div class="hero-stat-lbl">LAATSTE</div>
      </div>`;
  }

  function bindHome() {
    document.querySelectorAll('.session-card').forEach(card => {
      card.addEventListener('click', () => Session.open(card.dataset.type));
    });
    document.getElementById('btn-history').addEventListener('click', () => {
      History.render();
      showScreen('screen-history');
    });
    document.getElementById('btn-export').addEventListener('click', () => {
      const all = DB.getAll();
      if (!all.length) { showToast('Nog geen sessies gelogd.'); return; }
      Export.showForSession(all[0]);
    });
  }

  function bindSession() {
    document.getElementById('btn-back').addEventListener('click', () => {
      if (confirm('Sessie stoppen? Voortgang gaat verloren.')) {
        Session.close(); Timer.stop(); RestBanner.hide();
        showScreen('screen-home');
      }
    });
    document.getElementById('btn-finish').addEventListener('click', () => Session.finish());
  }

  function bindHistory() {
    document.getElementById('btn-back-history').addEventListener('click', () => showScreen('screen-home'));
  }

  function bindExportModal() {
    const close = () => document.getElementById('modal-export').classList.add('hidden');
    document.getElementById('btn-modal-close').addEventListener('click', close);
    document.querySelector('#modal-export .modal-backdrop').addEventListener('click', close);

    document.getElementById('btn-copy').addEventListener('click', () => {
      const txt = document.getElementById('export-text').value;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(txt).then(() => showToast('Gekopieerd! ✓'));
      } else {
        document.getElementById('export-text').select();
        document.execCommand('copy');
        showToast('Gekopieerd! ✓');
      }
    });

    document.getElementById('btn-copy-all').addEventListener('click', () => {
      const txt = Export.generateAll();
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(() => showToast('Alle logs gekopieerd! ✓'));
    });
  }

  function registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(e => console.warn('SW:', e));
    }
  }

  return { init, refreshHome };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
