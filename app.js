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
  // ===== Voeding =====
  let mealOffset = 0; // 0 = vandaag, -1 = gisteren, +1 = morgen
  const MEAL_START = new Date(2026, 0, 1); // dag 1 van de cyclus (ankerdatum)

  function mealDayIndex(date) {
    const diff = Math.floor((date - MEAL_START) / 86400000);
    return ((diff % 30) + 30) % 30; // 0..29, altijd positief
  }

  function renderNutrition() {
    const container = document.getElementById('nutrition-content');
    if (!container || typeof MEAL_PLAN === 'undefined') return;
    const date = new Date();
    date.setDate(date.getDate() + mealOffset);
    const idx = mealDayIndex(date);
    const day = MEAL_PLAN[idx];

    // dag-label
    const lbl = document.getElementById('meal-day-label');
    const dayName = date.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
    lbl.textContent = mealOffset === 0 ? 'Vandaag · ' + dayName : dayName;

    const moments = [
      { key: 'ontbijt', label: 'ONTBIJT', icon: '🌅' },
      { key: 'lunch', label: 'LUNCH', icon: '🥗' },
      { key: 'diner', label: 'DINER', icon: '🍽️' },
      { key: 'snack1', label: 'SNACK', icon: '🥤' },
      { key: 'snack2', label: 'SNACK', icon: '🥤' }
    ];
    let html = '';
    // dag-totaal bovenaan
    const t = day.tot;
    html += `<div class="meal-total-card">
      <div class="meal-total-title">DAGTOTAAL</div>
      <div class="meal-total-macros">
        <div class="mt-macro"><span class="mt-val">${t.kcal}</span><span class="mt-lbl">kcal</span></div>
        <div class="mt-macro"><span class="mt-val" style="color:var(--accent-purple)">${t.p}g</span><span class="mt-lbl">eiwit</span></div>
        <div class="mt-macro"><span class="mt-val" style="color:var(--accent-cyan)">${t.c}g</span><span class="mt-lbl">koolh</span></div>
        <div class="mt-macro"><span class="mt-val" style="color:var(--accent-orange)">${t.f}g</span><span class="mt-lbl">vet</span></div>
      </div>
    </div>`;
    moments.forEach(m => {
      const meal = day.meals[m.key];
      if (!meal) return;
      html += `<div class="meal-card">
        <div class="meal-card-head">
          <span class="meal-icon">${m.icon}</span>
          <span class="meal-moment">${m.label}</span>
          <span class="meal-fat ${meal.f > 20 ? 'over' : ''}">${meal.f}g vet</span>
        </div>
        <div class="meal-name">${meal.naam}</div>
        ${meal.boost ? `<div class="meal-boost">💪 ${meal.boost}</div>` : ''}
        <div class="meal-macros">
          <span class="mm kcal">${meal.kcal} kcal</span>
          <span class="mm p">${meal.p}g eiwit</span>
          <span class="mm c">${meal.c}g koolh</span>
        </div>
      </div>`;
    });
    html += `<div class="meal-disclaimer">Voorbeelden ter inspiratie. Elke maaltijd blijft onder 20g vet. Macro's zijn schattingen — weeg/track voor precisie. Voor advies afgestemd op het ontbreken van je galblaas: raadpleeg een diëtist.</div>`;
    html += `<div style="height:100px"></div>`;
    container.innerHTML = html;
  }

  function renderFoodDB() {
    const container = document.getElementById('fooddb-content');
    if (!container || typeof FOOD_DB === 'undefined') return;
    let html = '<div class="fooddb-list">';
    html += `<div class="fooddb-hint">Producten uit je database. "(geschat)" betekent: nog checken tegen de verpakking.</div>`;
    FOOD_DB.forEach(item => {
      html += `<div class="fooddb-row">
        <div class="fooddb-name">${item.product}</div>
        <div class="fooddb-amount">${item.hoeveelheid}</div>
        <div class="fooddb-macros">
          <span class="fdm">${item.kcal} kcal</span>
          <span class="fdm p">${item.eiwit} eiwit</span>
          <span class="fdm c">${item.koolh} kh</span>
          <span class="fdm f">${item.vet} vet</span>
        </div>
      </div>`;
    });
    html += '<div style="height:100px"></div></div>';
    container.innerHTML = html;
  }

  function init() { setDate(); renderCards(); refreshHome(); bindHome(); bindSession(); bindHistory(); bindExportModal(); bindNutrition(); }
  function setDate() { document.getElementById('hero-date').textContent = new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' }); }

  // Bouwt de sessiekaarten dynamisch, gegroepeerd per categorie (modaliteit).
  // Nieuwe workout toevoegen? Zet hem in SESSION_TYPES + SESSION_CATEGORY +
  // CARD_META in data.js — hij verschijnt hier automatisch onder de juiste kop.
  function renderCards() {
    const container = document.getElementById('session-cards');
    if (!container) return;
    // groepeer sessietypes op categorie, in vaste volgorde
    const order = ['kracht', 'conditie', 'flow', 'snack'];
    const groups = {};
    Object.keys(SESSION_TYPES).forEach(type => {
      const cat = (typeof SESSION_CATEGORY !== 'undefined' && SESSION_CATEGORY[type]) || 'conditie';
      (groups[cat] = groups[cat] || []).push(type);
    });
    let html = '';
    order.forEach(cat => {
      if (!groups[cat] || !groups[cat].length) return;
      const catInfo = (typeof CATEGORY_LABELS !== 'undefined' && CATEGORY_LABELS[cat]) || { label: cat.toUpperCase(), color: 'var(--text-3)' };
      html += `<div class="cat-header" style="border-left:3px solid ${catInfo.color}"><span>${catInfo.label}</span></div>`;
      groups[cat].forEach(type => {
        const m = (typeof CARD_META !== 'undefined' && CARD_META[type]) || { accent: 'var(--accent-orange)', tag: '', name: type, sub: '', sets: '' };
        // patroon-chips: verzamel unieke patronen over alle oefeningen van deze sessie
        let chips = '';
        const def = SESSION_TYPES[type];
        if (def && def.exercises && typeof getPatterns === 'function') {
          const pats = new Set();
          def.exercises.forEach(ex => getPatterns(ex.name).forEach(p => pats.add(p)));
          chips = [...pats].map(p => {
            const info = (typeof MOVEMENT_PATTERNS !== 'undefined' && MOVEMENT_PATTERNS[p]) || { label: p, color: '#888' };
            return `<span class="pat-chip" style="background:${info.color}22;color:${info.color};border:1px solid ${info.color}55">${info.label}</span>`;
          }).join('');
        }
        html += `<button class="session-card" data-type="${type}">
          <div class="session-card-accent" style="background:${m.accent};"></div>
          <div class="session-tag">${m.tag}</div>
          <div class="session-name">${m.name}</div>
          <div class="session-sub">${m.sub}</div>
          <div class="session-sets">${m.sets}</div>
          ${chips ? `<div class="pat-chips">${chips}</div>` : ''}
        </button>`;
      });
    });
    html += `<div style="height:100px"></div>`;
    container.innerHTML = html;
  }

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

  function bindNutrition() {
    const openBtn = document.getElementById('btn-nutrition');
    if (openBtn) openBtn.addEventListener('click', () => { mealOffset = 0; renderNutrition(); showScreen('screen-nutrition'); });
    const backBtn = document.getElementById('btn-back-nutrition');
    if (backBtn) backBtn.addEventListener('click', () => { showScreen('screen-home'); });
    const prev = document.getElementById('btn-meal-prev');
    if (prev) prev.addEventListener('click', () => { mealOffset--; renderNutrition(); });
    const next = document.getElementById('btn-meal-next');
    if (next) next.addEventListener('click', () => { mealOffset++; renderNutrition(); });
    const openDb = document.getElementById('btn-open-fooddb');
    if (openDb) openDb.addEventListener('click', () => { renderFoodDB(); showScreen('screen-fooddb'); });
    const backDb = document.getElementById('btn-back-fooddb');
    if (backDb) backDb.addEventListener('click', () => { showScreen('screen-nutrition'); });
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
