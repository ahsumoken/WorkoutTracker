function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  window.scrollTo(0, 0);
}

function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1e1e28;color:#f0f0f8;padding:12px 24px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);font-weight:600;z-index:400;box-shadow:0 4px 20px rgba(0,0,0,0.5);font-size:14px;white-space:nowrap;';
  t.textContent = msg; document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

const App = (() => {
  function init() { setDate(); refreshHome(); bindHome(); bindSession(); bindHistory(); bindExportModal(); }
  function setDate() { document.getElementById('hero-date').textContent = new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' }); }

  function refreshHome() {
    const all = DB.getAll();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
    weekStart.setHours(0, 0, 0, 0);
    const weekCount = all.filter(s => new Date(s.timestamp || s.date) >= weekStart).length;
    const last = all[0];
    const lastStr = last ? new Date(last.timestamp || last.date).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' }) : '—';

    document.getElementById('hero-stats').innerHTML = `
      <div class="hero-stat"><div class="hero-stat-val">${weekCount}</div><div class="hero-stat-lbl">DEZE WEEK</div></div>
      <div class="hero-stat"><div class="hero-stat-val">${all.length}</div><div class="hero-stat-lbl">TOTAAL</div></div>
      <div class="hero-stat"><div class="hero-stat-val" style="font-size:17px;margin-top:4px">${lastStr}</div><div class="hero-stat-lbl">LAATSTE</div></div>`;

    const banner = document.getElementById('active-session-banner');
    if (typeof Session !== 'undefined' && Session.isActive()) {
      const def = SESSION_TYPES[Session.activeType()];
      document.getElementById('active-session-name').textContent = def?.name || '';
      banner.style.display = 'flex';
    } else { banner.style.display = 'none'; }
  }

  function bindHome() {
    document.querySelectorAll('.session-card').forEach(card => {
      card.addEventListener('click', () => {
        if (typeof Session !== 'undefined') {
          if (Session.isActive()) { showToast('Herstel of stop eerst de actieve sessie.'); return; }
          Session.open(card.dataset.type);
        }
      });
    });
    document.getElementById('btn-history').addEventListener('click', () => { History.render(); showScreen('screen-history'); });
    document.getElementById('btn-export').addEventListener('click', () => { const all = DB.getAll(); if (!all.length) { showToast('Nog geen sessies.'); return; } Export.showForSession(all[0]); });
    document.getElementById('btn-resume-session').addEventListener('click', () => { if (typeof Session !== 'undefined') Session.resume(); });
    document.getElementById('btn-discard-session').addEventListener('click', () => { if (confirm('Sessie stoppen? Voortgang gaat verloren.')) { if (typeof Session !== 'undefined') Session.close(); refreshHome(); } });
  }

  function bindSession() {
    document.getElementById('btn-back').addEventListener('click', () => { if (typeof Session !== 'undefined') Session.pause(); showScreen('screen-home'); refreshHome(); });
    document.getElementById('btn-finish').addEventListener('click', () => { if (typeof Session !== 'undefined') Session.finish(); });
  }

  function bindHistory() { document.getElementById('btn-back-history').addEventListener('click', () => showScreen('screen-home')); }

  function bindExportModal() {
    const cls = () => document.getElementById('modal-export').style.display = 'none';
    document.getElementById('btn-modal-close').addEventListener('click', cls);
    document.getElementById('modal-export-backdrop').addEventListener('click', cls);
    document.getElementById('btn-copy').addEventListener('click', () => { const txt = document.getElementById('export-text').value; if (navigator.clipboard) { navigator.clipboard.writeText(txt).then(() => showToast('Gekopieerd! ✓')); } });
    document.getElementById('btn-copy-all').addEventListener('click', () => { const txt = Export.generateAll(); if (navigator.clipboard) { navigator.clipboard.writeText(txt).then(() => showToast('Alle logs gekopieerd! ✓')); } });
  }

  return { init, refreshHome };
})();

const History = (() => {
  function render() {
    const container = document.getElementById('history-content'); container.innerHTML = '';
    const sessions = DB.getAll();
    if (!sessions.length) { container.innerHTML = '<div class="history-empty">Nog geen sessies gelogd.</div>'; return; }
    sessions.forEach(s => {
      const def = SESSION_TYPES[s.type]; if (!def) return;
      const d = new Date(s.timestamp || s.date);
      const item = document.createElement('div'); item.className = 'history-item';
      item.innerHTML = `<div class="history-item-header"><div><div class="history-date">${d.toLocaleDateString('nl-NL')}</div><div class="history-type">${s.snackName || def.name}</div></div><div class="history-duration">${Math.floor(s.duration / 60)}m</div></div>`;
      item.addEventListener('click', () => Export.showForSession(s));
      container.appendChild(item);
    });
  }
  return { render };
})();

const Export = (() => {
  function showForSession(s) {
    const def = SESSION_TYPES[s.type];
    let txt = `TRAINLOG VERSLAG\nSessie: ${s.snackName || def?.name || s.type}\nDatum: ${new Date(s.timestamp || s.date).toLocaleDateString('nl-NL')}\nDuur: ${Math.floor(s.duration / 60)} min\n`;
    
    if (s.globalRpe || s.rpe) txt += `Sessie RPE: ${s.globalRpe || s.rpe}/10\n`;
    if (s.globalNote || s.note) txt += `Notitie: ${s.globalNote || s.note}\n`;
    txt += `\n--- PRESTATIES ---\n`;

    if (s.exercises) {
      Object.keys(s.exercises).forEach(k => {
        const ex = s.exercises[k]; txt += `\n${ex.name}:\n`;
        ex.sets.forEach((set, idx) => { if (set.weight || set.reps) txt += `  Set ${idx + 1}: ${set.weight || 0}kg × ${set.reps || 0} reps (RPE ${set.rpe || '—'})\n`; });
        if (ex.note) txt += `  Opmerking: ${ex.note}\n`;
      });
    } else {
      if (s.rounds) txt += `Behaalde Ronden: ${s.rounds}\n`;
      if (s.finisher && s.finisher.length > 0) {
        txt += `\nFinisher Resultaten:\n`;
        s.finisher.forEach(f => { txt += `  - ${f.name}: ${f.weight ? f.weight + 'kg' : 'eigen gew.'} × ${f.reps || 0} reps\n`; });
      }
    }
    document.getElementById('export-text').value = txt;
    document.getElementById('modal-export').style.display = 'flex';
  }

  function generateAll() {
    return DB.getAll().map(s => {
      const def = SESSION_TYPES[s.type];
      return `${new Date(s.timestamp || s.date).toLocaleDateString('nl-NL')} - ${s.snackName || def?.name || s.type} (${Math.floor(s.duration / 60)}m) -> Ronden/RPE: ${s.rounds || '—'}/${s.rpe || s.globalRpe || '—'}`;
    }).join('\n');
  }
  return { showForSession, generateAll };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
