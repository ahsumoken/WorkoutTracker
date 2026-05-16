// ─── HISTORY MODULE ────────────────────────────────────────────────────────

const History = (() => {
  function render() {
    const container = document.getElementById('history-content');
    container.innerHTML = '';

    const sessions = DB.getAllSessions();

    if (sessions.length === 0) {
      container.innerHTML = `<div class="history-empty">Nog geen sessies gelogd.<br>Begin met je eerste workout!</div>`;
      return;
    }

    sessions.forEach(session => {
      const item = buildHistoryItem(session);
      container.appendChild(item);
    });
  }

  function buildHistoryItem(session) {
    const def = SESSION_TYPES[session.type];
    if (!def) return document.createElement('div');

    const d = new Date(session.timestamp || session.date);
    const dateStr = d.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    const durStr = session.duration ? formatDuration(session.duration) : '';

    const item = document.createElement('div');
    item.className = 'history-item';

    let metaTags = '';

    if (def.type === 'gym' && session.exercises) {
      // Show a few exercise highlights
      const exKeys = Object.keys(session.exercises).slice(0, 3);
      exKeys.forEach(k => {
        const ex = session.exercises[k];
        const topSet = ex.sets?.find(s => s.weight && s.reps);
        if (topSet) {
          metaTags += `<div class="history-tag">${ex.name}: ${topSet.weight}kg×${topSet.reps}</div>`;
        }
      });
      if (session.globalRpe) metaTags += `<div class="history-tag">RPE ${session.globalRpe}</div>`;
    } else if (def.type === 'circuit') {
      if (session.rounds) metaTags += `<div class="history-tag">${session.rounds} ronden</div>`;
      if (session.rpe) metaTags += `<div class="history-tag">RPE ${session.rpe}</div>`;
      if (session.finisher?.some(f => f.done)) metaTags += `<div class="history-tag green">Finisher ✓</div>`;
    } else if (session.type === 'snacks') {
      if (session.snackId) {
        const snackDef = SESSION_TYPES.snacks?.options?.find(o => o.id === session.snackId);
        if (snackDef) metaTags += `<div class="history-tag">${snackDef.name}</div>`;
      }
      if (session.rounds) metaTags += `<div class="history-tag">${session.rounds} ronden</div>`;
      if (session.rpe) metaTags += `<div class="history-tag">RPE ${session.rpe}</div>`;
    }

    item.innerHTML = `
      <div class="history-item-header">
        <div>
          <div class="history-date">${dateStr} · ${timeStr}</div>
          <div class="history-type">${def.name}</div>
        </div>
        <div class="history-duration">${durStr}</div>
      </div>
      ${metaTags ? `<div class="history-meta">${metaTags}</div>` : ''}
    `;

    item.addEventListener('click', () => {
      Export.showForSession(session);
    });

    return item;
  }

  function formatDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m${s > 0 ? ` ${s}s` : ''}`;
  }

  return { render };
})();
