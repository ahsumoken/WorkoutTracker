// ─── MAIN APP ──────────────────────────────────────────────────────────────

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    target.scrollTop = 0;
  }
}

function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2100);
}

const App = (() => {
  function init() {
    setupHome();
    setupSessionScreen();
    setupHistoryScreen();
    setupExportModal();
    refreshHome();
    registerSW();
  }

  function setupHome() {
    // Date
    const now = new Date();
    const dateStr = now.toLocaleDateString('nl-NL', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
    document.getElementById('hero-date').textContent = dateStr;

    // Session cards
    document.querySelectorAll('.session-card').forEach(card => {
      card.addEventListener('click', () => {
        const type = card.dataset.type;
        Session.open(type);
      });
    });

    // History btn
    document.getElementById('btn-history').addEventListener('click', () => {
      History.render();
      showScreen('screen-history');
    });

    // Export btn (shows last session or all)
    document.getElementById('btn-export').addEventListener('click', () => {
      const sessions = DB.getAllSessions();
      if (sessions.length === 0) {
        showToast('Nog geen sessies gelogd.');
        return;
      }
      Export.showForSession(sessions[0]);
    });
  }

  function refreshHome() {
    const sessions = DB.getAllSessions();
    const statsEl = document.getElementById('hero-stats');

    // Count sessions this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    weekStart.setHours(0,0,0,0);
    const weekCount = sessions.filter(s => new Date(s.timestamp || s.date) >= weekStart).length;

    // Total sessions
    const total = sessions.length;

    // Last session
    const last = sessions[0];
    const lastStr = last
      ? new Date(last.timestamp || last.date).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })
      : '—';

    statsEl.innerHTML = `
      <div class="hero-stat">
        <div class="hero-stat-val">${weekCount}</div>
        <div class="hero-stat-lbl">DEZE WEEK</div>
      </div>
      <div class="hero-stat">
        <div class="hero-stat-val">${total}</div>
        <div class="hero-stat-lbl">TOTAAL</div>
      </div>
      <div class="hero-stat">
        <div class="hero-stat-val" style="font-size:18px;margin-top:2px;">${lastStr}</div>
        <div class="hero-stat-lbl">LAATSTE</div>
      </div>
    `;
  }

  function setupSessionScreen() {
    document.getElementById('btn-back').addEventListener('click', () => {
      if (confirm('Sessie stoppen? Voortgang gaat verloren.')) {
        Session.close();
        Timer.stop();
        RestBanner.hide();
        showScreen('screen-home');
      }
    });

    document.getElementById('btn-finish').addEventListener('click', () => {
      Session.finish();
    });
  }

  function setupHistoryScreen() {
    document.getElementById('btn-back-history').addEventListener('click', () => {
      showScreen('screen-home');
    });
  }

  function setupExportModal() {
    document.getElementById('btn-modal-close').addEventListener('click', closeExportModal);
    document.querySelector('#modal-export .modal-backdrop').addEventListener('click', closeExportModal);

    document.getElementById('btn-copy').addEventListener('click', () => {
      const text = document.getElementById('export-text').value;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => showToast('Gekopieerd! ✓'));
      } else {
        // Fallback
        const ta = document.getElementById('export-text');
        ta.select();
        document.execCommand('copy');
        showToast('Gekopieerd! ✓');
      }
    });

    document.getElementById('btn-copy-all').addEventListener('click', () => {
      const text = Export.generateAllReport();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => showToast('Alle logs gekopieerd! ✓'));
      }
    });
  }

  function closeExportModal() {
    document.getElementById('modal-export').classList.add('hidden');
  }

  function registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(e => {
        console.warn('SW registration failed:', e);
      });
    }
  }

  return { init, refreshHome };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
