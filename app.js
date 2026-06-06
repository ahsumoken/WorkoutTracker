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

// ─── AUTOMATISCHE INTERFACE FIX (TITELS & STYLING SKIP-KNOP) ────────────────

(function injectInterfaceStyles() {
  const style = document.createElement('style');
  style.textContent = `
    #screen-session, 
    #screen-session h3, 
    #screen-session div, 
    .workout-title, 
    [id*="exercise"], 
    .session-exercise-title,
    .timer-container div { 
      color: #ffffff !important; 
    }
    
    .btn-control-skip {
      background: #1e293b;
      border: 1px solid #334155;
      color: #ffffff;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.1s ease;
      margin: 0 10px;
    }
    .btn-control-skip:active {
      background: #475569;
    }
  `;
  document.head.appendChild(style);
})();

// ─── APP ───────────────────────────────────────────────────────────────────

const App = (() => {
  function init() {
    setDate();
    refreshHome();
    bindHome();
    bindSession();
    startInterfaceWatcher();
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

  function startInterfaceWatcher() {
    const observer = new MutationObserver(() => {
      const stopBtn = document.getElementById('btn-stop');
      if (stopBtn && !document.getElementById('btn-skip')) {
        const skipBtn = document.createElement('button');
        skipBtn.id = 'btn-skip';
        skipBtn.className = 'btn-control-skip';
        skipBtn.title = 'Sla deze set over';
        skipBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 4 15 12 5 20 5 4" fill="currentColor"></polygon>
            <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="3"></line>
          </svg>`;
        stopBtn.parentNode.insertBefore(skipBtn, stopBtn);
        
        skipBtn.addEventListener('click', () => {
          if (typeof Timer !== 'undefined') {
            if (Timer.stop) Timer.stop(); 
            if (typeof nextStep === 'function') nextStep();
            else if (typeof handleNext === 'function') handleNext();
            else if (Timer.next) Timer.next();
            showToast('Oefening overgeslagen ➔');
          }
        });
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
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
