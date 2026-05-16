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
