// ─── MAIN APPLICATION CONTROLLER ───────────────────────────────────────────

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

    const banner = document.getElementById('active-session-banner');
    if (Session.isActive()) {
      const type = Session.activeType();
      const def = SESSION_TYPES[type];
      document.getElementById('active-session-name').textContent = def?.name || '';
      banner.style.display = 'flex';
    } else {
      banner.style.display = 'none';
    }
  }

  function bindHome() {
    document.querySelectorAll('.session-card').forEach(card => {
      card.addEventListener('click', () => {
        if (Session.isActive()) {
          showToast('Herstel of stop eerst de actieve sessie.');
          return;
        }
        Session.open(card.dataset.type);
      });
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
    document.getElementById('btn-resume-session').addEventListener('click', () => {
      Session.resume();
    });
    document.getElementById('btn-discard-session').addEventListener('click', () => {
      if (confirm('Sessie definitief stoppen? Voortgang gaat verloren.')) {
        Session.close();
        refreshHome();
      }
    });
  }

  function bindSession() {
    document.getElementById('btn-back').addEventListener('click', () => {
      Session.pause();
      showScreen('screen-home');
      refreshHome();
    });
    document.getElementById('btn-finish').addEventListener('click', () => Session.finish());
  }

  function bindHistory() {
    document.getElementById('btn-back-history').addEventListener('click', () => showScreen('screen-home'));
  }

  function bindExportModal() {
    const close = () => document.getElementById('modal-export').style.display='none';
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

// ─── HISTORY CONTROLLER ────────────────────────────────────────────────────

const History = (() => {
  function render() {
    const container = document.getElementById('history-content');
    container.innerHTML = '';
    const sessions = DB.getAll();

    if (!sessions.length) {
      container.innerHTML = `<div class="history-empty">Nog geen sessies gelogd.<br>Begin met je eerste workout!</div>`;
      return;
    }

    sessions.forEach(s => container.appendChild(buildItem(s)));
  }

  function buildItem(s) {
    const def = SESSION_TYPES[s.type];
    if (!def) return document.createElement('div');

    const d = new Date(s.timestamp || s.date);
    const dateStr = d.toLocaleDateString('nl-NL', { weekday:'short', day:'numeric', month:'short', year:'numeric' });
    const timeStr = d.toLocaleTimeString('nl-NL', { hour:'2-digit', minute:'2-digit' });
    const dur = s.duration ? fmtDur(s.duration) : '';

    let tags = '';
    if (def.type === 'gym' && s.exercises) {
      Object.values(s.exercises).slice(0,3).forEach(ex => {
        const top = ex.sets?.find(st => st.weight && st.reps);
        if (top) tags += `<div class="history-tag">${ex.name}: ${top.weight}kg×${top.reps}</div>`;
      });
      if (s.globalRpe) tags += `<div class="history-tag">RPE ${s.globalRpe}</div>`;
    } else if (def.type === 'circuit') {
      if (s.rounds) tags += `<div class="history-tag">${s.rounds} ronden</div>`;
      if (s.rpe)    tags += `<div class="history-tag">RPE ${s.rpe}</div>`;
      if (s.finisher?.some(f => f.done)) tags += `<div class="history-tag green">Finisher ✓</div>`;
    } else if (s.type === 'snacks') {
      if (s.snackName) tags += `<div class="history-tag">${s.snackName}</div>`;
      if (s.rounds)    tags += `<div class="history-tag">${s.rounds} ronden</div>`;
      if (s.rpe)       tags += `<div class="history-tag">RPE ${s.rpe}</div>`;
    }

    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <div class="history-item-header">
        <div>
          <div class="history-date">${dateStr} · ${timeStr}</div>
          <div class="history-type">${def.name}</div>
        </div>
        <div class="history-duration">${dur}</div>
      </div>
      ${tags ? `<div class="history-meta">${tags}</div>` : ''}`;
    item.addEventListener('click', () => Export.showForSession(s));
    return item;
  }

  function fmtDur(sec) {
    const m = Math.floor(sec/60), s = sec%60;
    return m ? `${m}m${s?` ${s}s`:''}` : `${s}s`;
  }

  return { render };
})();

// ─── EXPORT CONTROLLER ─────────────────────────────────────────────────────

const Export = (() => {
  function showForSession(s) {
    document.getElementById('export-text').value = generate(s);
    document.getElementById('modal-export').style.display='flex';
  }

  function generate(s) {
    const def = SESSION_TYPES[s.type];
    if (!def) return 'Sessie niet gevonden.';

    const d = new Date(s.timestamp || s.date);
    const dateStr = d.toLocaleDateString('nl-NL', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    const timeStr = d.toLocaleTimeString('nl-NL', { hour:'2-digit', minute:'2-digit' });
    const dur = s.duration ? fmtDur(s.duration) : '—';

    const allOfType = DB.getAll().filter(x => x.type === s.type && x.timestamp !== s.timestamp);
    const prev = allOfType[0] || null;

    const L = [];
    L.push('═══════════════════════════════════');
    L.push('TRAINLOG — SESSIE VERSLAG');
    L.push('═══════════════════════════════════');
    L.push(`Datum:  ${dateStr}`);
    L.push(`Tijd:   ${timeStr}`);
    L.push(`Sessie: ${def.name} (${def.tag})`);
    L.push(`Duur:   ${dur}`);
    L.push('───────────────────────────────────');

    if (def.type === 'gym' && s.exercises) {
      L.push('OEFENINGEN:');
      L.push('');
      Object.entries(s.exercises).forEach(([id, ex]) => {
        const prevEx = prev?.exercises?.[id];
        L.push(`  ${ex.name.toUpperCase()}`);
        ex.sets?.forEach((set, i) => {
          if (!set.weight && !set.reps) return;
          let line = `     Set ${i+1}: ${set.weight||'—'}kg × ${set.reps||'—'} reps`;
          if (set.rpe) line += ` (RPE ${set.rpe})`;
          const ps = prevEx?.sets?.[i];
          if (ps) {
            const wd = parseFloat(set.weight) - parseFloat(ps.weight||0);
            const rd = parseInt(set.reps) - parseInt(ps.reps||0);
            if (wd > 0) line += ` ↑ +${wd}kg`;
            else if (wd < 0) line += ` ↓ ${wd}kg`;
            if (rd > 0) line += ` ↑ +${rd} reps`;
            else if (rd < 0) line += ` ↓ ${rd} reps`;
          }
          L.push(line);
        });
        if (prevEx) {
          const pw = Math.max(...(prevEx.sets?.map(st => parseFloat(st.weight)||0)||[0]));
          const cw = Math.max(...(ex.sets?.map(st => parseFloat(st.weight)||0)||[0]));
          if (cw > pw) L.push(`     ✅ Nieuw topgewicht! ${cw}kg (was ${pw}kg)`);
        }
        if (ex.note) L.push(`     📝 ${ex.note}`);
        L.push('');
      });
      if (s.globalRpe)  L.push(`Sessie RPE: ${s.globalRpe}/10`);
      if (s.globalNote) L.push(`Notitie: ${s.globalNote}`);

    } else if (def.type === 'circuit') {
      L.push('OEFENINGEN:');
      def.exercises?.forEach((ex, i) => L.push(`  ${i+1}. ${ex.name} — ${ex.defaultWeight || 'eigen gew.'}`));
      L.push('');
      L.push(`Ronden: ${s.rounds||'—'} / ${def.rounds}`);
      if (s.rpe) L.push(`RPE: ${s.rpe}/10`);
      if (prev) {
        const diff = (s.rounds||0) - (prev.rounds||0);
        if (diff > 0) L.push(`✅ +${diff} ronde(n) meer dan vorige sessie!`);
        else if (diff < 0) L.push(`↓ ${Math.abs(diff)} ronde(n) minder`);
        else L.push('→ Zelfde aantal ronden');
        const rpediff = (s.rpe||5) - (prev.rpe||5);
        if (rpediff < 0) L.push(`✅ RPE ${Math.abs(rpediff)} lager — efficiënter!`);
      }
      if (s.finisher?.length) {
        L.push(''); L.push('FINISHER:');
        s.finisher.forEach(f => L.push(`  ${f.done ? '✓' : '✗'} ${f.name}`));
      }
      if (s.note) L.push(`\nNotitie: ${s.note}`);

    } else if (s.type === 'snacks') {
      const opt = SESSION_TYPES.snacks?.options?.find(o => o.id === s.snackId);
      if (opt) {
        L.push(`Snack:    ${opt.name}`);
        L.push(`Protocol: ${opt.protocol}`);
        L.push('Oefeningen:');
        opt.exercises.forEach(e => L.push(`  • ${e}`));
        L.push('');
      }
      L.push(`Ronden: ${s.rounds||'—'}`);
      if (s.rpe) L.push(`RPE: ${s.rpe}/10`);
      const prevSnack = s.snackId ? DB.getAll().find(x => x.type==='snacks' && x.snackId===s.snackId && x.timestamp!==s.timestamp) : null;
      if (prevSnack) {
        const rd = (s.rounds||0) - (prevSnack.rounds||0);
        if (rd > 0) L.push(`✅ +${rd} ronde(n) meer dan vorige keer!`);
        if (s.rpe && prevSnack.rpe && s.rpe < prevSnack.rpe) L.push(`✅ RPE lager (${s.rpe} vs ${prevSnack.rpe}) — beter!`);
      }
      if (s.note) L.push(`\nNotitie: ${s.note}`);
    }

    L.push('');
    L.push('───────────────────────────────────');
    L.push('RPE TREND (laatste 5 sessies):');
    const trend = DB.getAll().filter(x => x.type === s.type).slice(0, 5)
      .map(x => {
        const xd = new Date(x.timestamp||x.date);
        const rpe = x.globalRpe || x.rpe || '—';
        return `${xd.toLocaleDateString('nl-NL',{day:'numeric',month:'short'})}: ${rpe}`;
      }).join(' | ');
    L.push(trend || '— nog niet genoeg data —');
    L.push('');
    L.push('═══════════════════════════════════');
    L.push('[Gegenereerd door TrainLog]');
    L.push('═══════════════════════════════════');

    return L.join('\n');
  }

  function fmtDur(sec) {
    const m = Math.floor(sec/60), s = sec%60;
    return m ? `${m}m${s?` ${s}s`:''}` : `${s}s`;
  }

  function generateAll() {
    const all = DB.getAll();
    if (!all.length) return 'Geen sessies.';
    return all.slice(0, 20).map(s => generate(s)).join('\n\n───────────────────────────────────\n\n');
  }

  return { showForSession, generateAll };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
