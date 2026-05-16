// ─── SESSION MODULE ────────────────────────────────────────────────────────

const Session = (() => {
  let currentType = null;
  let sessionData = {};
  let startTime = null;
  let sessionInterval = null;
  let wakeLock = null;

  async function acquireWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
      } catch(e) {}
    }
  }

  async function releaseWakeLock() {
    if (wakeLock) {
      try { await wakeLock.release(); } catch(e) {}
      wakeLock = null;
    }
  }

  function startSessionTimer() {
    startTime = Date.now();
    const timerEl = document.getElementById('session-timer');
    sessionInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const s = (elapsed % 60).toString().padStart(2, '0');
      timerEl.textContent = `${m}:${s}`;
    }, 1000);
  }

  function stopSessionTimer() {
    clearInterval(sessionInterval);
    sessionInterval = null;
    return startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  }

  function open(type) {
    currentType = type;
    sessionData = {};
    const def = SESSION_TYPES[type];
    document.getElementById('session-title').textContent = def.name;
    document.getElementById('session-timer').textContent = '00:00';

    const content = document.getElementById('session-content');
    content.innerHTML = '';

    if (def.type === 'gym') renderGym(def, content);
    else if (def.type === 'circuit') renderCircuit(def, content);
    else if (def.type === 'snacks') renderSnacks(def, content);

    showScreen('screen-session');
    startSessionTimer();
    acquireWakeLock();
  }

  // ── GYM SESSION ────────────────────────────────────────────────────────────

  function renderGym(def, container) {
    const prev = DB.getLastSessionByType(currentType);

    def.exercises.forEach((ex, i) => {
      const prevEx = prev ? prev.exercises?.[ex.id] : null;
      const block = document.createElement('div');
      block.className = 'exercise-block';

      // Determine sets/reps display
      const setsLabel = `${ex.sets} sets × ${ex.reps}`;

      // Header
      const header = document.createElement('div');
      header.className = 'exercise-block-header';

      const nameBlock = document.createElement('div');
      nameBlock.className = 'exercise-name-block';
      nameBlock.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;">
          <div class="exercise-name">${ex.name}</div>
          <div class="pr-badge" id="pr-${ex.id}" style="display:none">↑ PR</div>
        </div>
        <div class="exercise-spec">${setsLabel}${prevEx ? ` · Vorige: ${prevEx.sets?.[0]?.weight || '?'}kg` : ''}</div>
      `;

      header.innerHTML = `<div class="exercise-num">${String(i+1).padStart(2,'0')}</div>`;
      header.appendChild(nameBlock);
      block.appendChild(header);

      // Sets table
      const setsWrap = document.createElement('div');
      setsWrap.className = 'sets-table';

      // Column headers
      const hdrs = document.createElement('div');
      hdrs.className = 'set-headers';
      hdrs.innerHTML = `
        <div class="set-label">SET</div>
        <div class="set-label">KG</div>
        <div class="set-label">REPS</div>
        <div class="set-label">RPE</div>
      `;
      setsWrap.appendChild(hdrs);

      // Initialize sessionData for this exercise
      sessionData[ex.id] = { sets: [] };

      for (let s = 0; s < ex.sets; s++) {
        const prevSet = prevEx?.sets?.[s];
        const row = document.createElement('div');
        row.className = 'set-row';
        row.innerHTML = `
          <div class="set-num">${s+1}</div>
          <input class="set-input" type="number" inputmode="decimal" placeholder="${prevSet?.weight || '—'}"
            data-ex="${ex.id}" data-set="${s}" data-field="weight">
          <input class="set-input" type="number" inputmode="numeric" placeholder="${prevSet?.reps || '—'}"
            data-ex="${ex.id}" data-set="${s}" data-field="reps">
          <input class="set-input" type="number" inputmode="numeric" placeholder="RPE" min="1" max="10"
            data-ex="${ex.id}" data-set="${s}" data-field="rpe" style="font-size:13px;">
        `;

        sessionData[ex.id].sets[s] = { weight: '', reps: '', rpe: '' };

        // Input listeners
        row.querySelectorAll('.set-input').forEach(inp => {
          inp.addEventListener('input', () => {
            const field = inp.dataset.field;
            const setIdx = parseInt(inp.dataset.set);
            sessionData[ex.id].sets[setIdx][field] = inp.value;
            checkImprovement(ex.id, prevEx);
          });
        });

        setsWrap.appendChild(row);
      }
      block.appendChild(setsWrap);

      // Footer: note
      const footer = document.createElement('div');
      footer.className = 'exercise-footer';
      footer.innerHTML = `
        <div style="flex:1">
          <textarea class="note-input" placeholder="Notitie (optioneel)..."
            data-ex="${ex.id}"></textarea>
        </div>
      `;
      footer.querySelector('textarea').addEventListener('input', e => {
        sessionData[ex.id].note = e.target.value;
      });
      block.appendChild(footer);

      container.appendChild(block);
    });

    // Global RPE + session note
    container.appendChild(buildSessionFooter());
  }

  function checkImprovement(exId, prevEx) {
    if (!prevEx) return;
    const current = sessionData[exId];
    const prBadge = document.getElementById(`pr-${exId}`);
    if (!prBadge) return;

    let improved = false;
    current.sets.forEach((set, i) => {
      const prev = prevEx.sets?.[i];
      if (!prev) return;
      if (parseFloat(set.weight) > parseFloat(prev.weight)) improved = true;
      if (parseInt(set.reps) > parseInt(prev.reps)) improved = true;
    });

    prBadge.style.display = improved ? '' : 'none';
  }

  // ── CIRCUIT SESSION ────────────────────────────────────────────────────────

  function renderCircuit(def, container) {
    const prev = DB.getLastCircuitByType(currentType);
    sessionData = { rounds: 0, weights: {}, rpe: 5, note: '', finisher: [] };

    // Timer start block
    const startBlock = document.createElement('div');
    startBlock.className = 'circuit-block';
    startBlock.innerHTML = `
      <div class="circuit-start-row">
        <div>
          <div class="circuit-start-label">${def.name}</div>
          <div class="circuit-sub">${def.totalSets || def.exercises.length * def.rounds} sets · ${def.workSec}s/${def.restSec}s · ${def.rounds} ronden · ${def.roundRestSec}s rusttijd</div>
        </div>
        <button class="btn-start-timer" id="btn-circuit-timer">▶ START</button>
      </div>
    `;

    startBlock.querySelector('#btn-circuit-timer').addEventListener('click', () => {
      const totalSets = def.exercises.length * def.rounds;
      Timer.start({
        totalSets,
        totalRounds: def.rounds,
        workSec: def.workSec,
        restSec: def.restSec,
        roundRestSec: def.roundRestSec,
        exercises: def.exercises.map(e => e.name),
        onComplete: () => { showToast('Circuit klaar! 🔥'); }
      });
    });

    // Exercises list
    const exBlock = document.createElement('div');
    exBlock.className = 'circuit-block';
    const exHeader = document.createElement('div');
    exHeader.style.cssText = 'padding:12px 14px;border-bottom:1px solid var(--border);';
    exHeader.innerHTML = `<div class="section-title">OEFENINGEN</div>`;
    exBlock.appendChild(exHeader);

    const exList = document.createElement('div');
    exList.className = 'circuit-exercises';
    def.exercises.forEach((ex, i) => {
      const row = document.createElement('div');
      row.className = 'circuit-ex-row';
      row.innerHTML = `
        <div class="circuit-ex-num">${i+1}</div>
        <div class="circuit-ex-name">${ex.name}</div>
        <div class="circuit-ex-weight">${ex.defaultWeight}</div>
      `;
      exList.appendChild(row);
    });
    exBlock.appendChild(exList);

    // Log area
    const logArea = document.createElement('div');
    logArea.className = 'circuit-log';

    const prevRounds = prev?.rounds;
    const prevBadge = prevRounds ? `<span style="font-size:11px;color:var(--text-3);margin-left:8px;">Vorige: ${prevRounds} ronden</span>` : '';

    logArea.innerHTML = `
      <div class="circuit-log-grid">
        <div class="log-field">
          <label>RONDEN VOLTOOID ${prevBadge}</label>
          <input type="number" inputmode="numeric" id="circuit-rounds" placeholder="${prevRounds || def.rounds}" min="0" max="${def.rounds}">
        </div>
        <div class="log-field">
          <label>RPE (1-10)</label>
          <input type="number" inputmode="numeric" id="circuit-rpe" placeholder="7" min="1" max="10">
        </div>
      </div>
      <div class="field-group">
        <label>NOTITIE</label>
        <textarea style="background:var(--bg-3);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-family:'Barlow',sans-serif;font-size:14px;padding:9px 12px;width:100%;resize:none;height:70px;" id="circuit-note" placeholder="Hoe voelde het?"></textarea>
      </div>
    `;
    exBlock.appendChild(logArea);
    container.appendChild(startBlock);
    container.appendChild(exBlock);

    // Progress indicator
    if (prev) {
      const prevR = prev.rounds || 0;
      const indic = document.createElement('div');
      indic.className = 'improved-hint';
      indic.id = 'circuit-improve-hint';
      indic.style.display = 'none';
      indic.textContent = '↑ Meer ronden dan vorige sessie!';
      logArea.appendChild(indic);
    }

    logArea.querySelector('#circuit-rounds')?.addEventListener('input', e => {
      sessionData.rounds = parseInt(e.target.value) || 0;
      if (prev && sessionData.rounds > (prev.rounds || 0)) {
        const h = document.getElementById('circuit-improve-hint');
        if (h) h.style.display = 'flex';
      } else {
        const h = document.getElementById('circuit-improve-hint');
        if (h) h.style.display = 'none';
      }
    });

    logArea.querySelector('#circuit-rpe')?.addEventListener('input', e => {
      sessionData.rpe = parseInt(e.target.value) || 5;
    });

    logArea.querySelector('#circuit-note')?.addEventListener('input', e => {
      sessionData.note = e.target.value;
    });

    // Finisher
    if (def.finisher) {
      const finBlock = document.createElement('div');
      finBlock.className = 'finisher-block';
      finBlock.innerHTML = `<div class="finisher-title">FINISHER</div>`;

      sessionData.finisher = def.finisher.map(f => ({ name: f.name, done: false }));

      def.finisher.forEach((fin, i) => {
        const row = document.createElement('div');
        row.className = 'finisher-row';
        row.innerHTML = `${fin.name}`;
        finBlock.appendChild(row);
      });

      const checks = document.createElement('div');
      checks.className = 'finisher-check';
      def.finisher.forEach((fin, i) => {
        const btn = document.createElement('button');
        btn.className = 'check-btn';
        btn.textContent = fin.name.replace(/3x10 /, '');
        btn.addEventListener('click', () => {
          sessionData.finisher[i].done = !sessionData.finisher[i].done;
          btn.classList.toggle('done', sessionData.finisher[i].done);
          btn.textContent = sessionData.finisher[i].done ? '✓ ' + fin.name.replace(/3x10 /,'') : fin.name.replace(/3x10 /,'');
        });
        checks.appendChild(btn);
      });
      finBlock.appendChild(checks);
      container.appendChild(finBlock);
    }

    container.appendChild(buildSessionFooter(false));
  }

  // ── SNACKS SESSION ─────────────────────────────────────────────────────────

  function renderSnacks(def, container) {
    sessionData = { snackId: null, rounds: 0, rpe: 5, note: '' };

    const title = document.createElement('div');
    title.className = 'section-title';
    title.textContent = 'KIES EEN SNACK';
    title.style.marginBottom = '10px';
    container.appendChild(title);

    const opts = document.createElement('div');
    opts.className = 'snack-options';

    def.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'snack-option';
      btn.dataset.snackId = opt.id;
      btn.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div class="snack-option-name">${opt.name}</div>
          <div class="snack-option-desc">${opt.duration}</div>
        </div>
        <div class="snack-option-desc">${opt.protocol}</div>
        <div class="snack-exercises">${opt.exercises.join(' · ')}</div>
      `;

      btn.addEventListener('click', () => {
        opts.querySelectorAll('.snack-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        sessionData.snackId = opt.id;
      });

      opts.appendChild(btn);
    });

    container.appendChild(opts);

    // Log block
    const logBlock = document.createElement('div');
    logBlock.className = 'circuit-block';
    logBlock.innerHTML = `
      <div class="circuit-log">
        <div class="circuit-log-grid">
          <div class="log-field">
            <label>RONDEN VOLTOOID</label>
            <input type="number" inputmode="numeric" id="snack-rounds" placeholder="3" min="0">
          </div>
          <div class="log-field">
            <label>RPE (1-10)</label>
            <input type="number" inputmode="numeric" id="snack-rpe" placeholder="7" min="1" max="10">
          </div>
        </div>
        <div class="field-group">
          <label>NOTITIE</label>
          <textarea style="background:var(--bg-3);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-family:'Barlow',sans-serif;font-size:14px;padding:9px 12px;width:100%;resize:none;height:70px;" id="snack-note" placeholder="Hoe voelde het?"></textarea>
        </div>
        <div class="improved-hint" id="snack-improve-hint" style="display:none">↑ Meer ronden / betere RPE dan vorige keer!</div>
      </div>
    `;

    logBlock.querySelector('#snack-rounds').addEventListener('input', e => {
      sessionData.rounds = parseInt(e.target.value) || 0;
      checkSnackImprovement();
    });
    logBlock.querySelector('#snack-rpe').addEventListener('input', e => {
      sessionData.rpe = parseInt(e.target.value) || 5;
      checkSnackImprovement();
    });
    logBlock.querySelector('#snack-note').addEventListener('input', e => {
      sessionData.note = e.target.value;
    });

    container.appendChild(logBlock);
    container.appendChild(buildSessionFooter(false));
  }

  function checkSnackImprovement() {
    if (!sessionData.snackId) return;
    const prev = DB.getLastSnackById(sessionData.snackId);
    if (!prev) return;
    const hint = document.getElementById('snack-improve-hint');
    if (!hint) return;
    const better = sessionData.rounds > (prev.rounds || 0) || sessionData.rpe < (prev.rpe || 10);
    hint.style.display = better ? 'flex' : 'none';
  }

  // ── SESSION FOOTER ─────────────────────────────────────────────────────────

  function buildSessionFooter(showRPE = true) {
    const div = document.createElement('div');
    div.style.marginTop = '8px';
    if (showRPE) {
      div.innerHTML = `
        <div class="circuit-block">
          <div class="circuit-log">
            <div class="field-group">
              <label>SESSIE RPE (1-10)</label>
              <input type="number" inputmode="numeric" id="session-global-rpe" placeholder="7" min="1" max="10" style="background:var(--bg-3);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-family:'Barlow',sans-serif;font-size:15px;padding:9px 12px;width:100%;-webkit-appearance:none;">
            </div>
            <div class="field-group">
              <label>SESSIE NOTITIE</label>
              <textarea id="session-global-note" placeholder="Algemene notitie voor deze sessie..." style="background:var(--bg-3);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-family:'Barlow',sans-serif;font-size:14px;padding:9px 12px;width:100%;resize:none;height:80px;"></textarea>
            </div>
          </div>
        </div>
      `;
      div.querySelector('#session-global-rpe').addEventListener('input', e => {
        sessionData._globalRpe = parseInt(e.target.value) || 5;
      });
      div.querySelector('#session-global-note').addEventListener('input', e => {
        sessionData._globalNote = e.target.value;
      });
    }
    return div;
  }

  // ── COLLECT + SAVE ─────────────────────────────────────────────────────────

  function collectGymData(def) {
    const exercises = {};
    def.exercises.forEach(ex => {
      const sets = [];
      for (let s = 0; s < ex.sets; s++) {
        const wEl = document.querySelector(`input[data-ex="${ex.id}"][data-set="${s}"][data-field="weight"]`);
        const rEl = document.querySelector(`input[data-ex="${ex.id}"][data-set="${s}"][data-field="reps"]`);
        const rpeEl = document.querySelector(`input[data-ex="${ex.id}"][data-set="${s}"][data-field="rpe"]`);
        sets.push({
          weight: wEl?.value || '',
          reps: rEl?.value || '',
          rpe: rpeEl?.value || ''
        });
      }
      const noteEl = document.querySelector(`textarea[data-ex="${ex.id}"]`);
      exercises[ex.id] = { sets, note: noteEl?.value || '', name: ex.name };
    });
    return exercises;
  }

  function finish() {
    const def = SESSION_TYPES[currentType];
    const duration = stopSessionTimer();
    releaseWakeLock();

    let finalData = {
      type: currentType,
      timestamp: Date.now(),
      date: new Date().toISOString(),
      duration,
    };

    if (def.type === 'gym') {
      const exercises = collectGymData(def);
      const globalRpe = parseInt(document.getElementById('session-global-rpe')?.value) || null;
      const globalNote = document.getElementById('session-global-note')?.value || '';
      finalData = { ...finalData, exercises, globalRpe, globalNote };
    } else if (def.type === 'circuit') {
      const rounds = parseInt(document.getElementById('circuit-rounds')?.value) || sessionData.rounds;
      const rpe = parseInt(document.getElementById('circuit-rpe')?.value) || sessionData.rpe;
      const note = document.getElementById('circuit-note')?.value || sessionData.note;
      finalData = { ...finalData, rounds, rpe, note, finisher: sessionData.finisher || [] };
    } else if (def.type === 'snacks') {
      const rounds = parseInt(document.getElementById('snack-rounds')?.value) || sessionData.rounds;
      const rpe = parseInt(document.getElementById('snack-rpe')?.value) || sessionData.rpe;
      const note = document.getElementById('snack-note')?.value || sessionData.note;
      finalData = { ...finalData, snackId: sessionData.snackId, rounds, rpe, note };
    }

    DB.saveSession(finalData);
    showToast('Sessie opgeslagen! 💪');
    showScreen('screen-home');
    App.refreshHome();

    // Auto open export
    setTimeout(() => Export.showForSession(finalData), 600);
  }

  function close() {
    stopSessionTimer();
    releaseWakeLock();
    currentType = null;
    sessionData = {};
  }

  return { open, finish, close };
})();
