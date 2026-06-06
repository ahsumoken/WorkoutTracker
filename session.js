const Session = (() => {
  let currentType = null;
  let sessionData = {};
  let startTime   = null;
  let sessionIv   = null;
  const STORAGE_KEY = 'trainlog_active_session';

  function startClock() {
    startTime = Date.now();
    const el = document.getElementById('session-timer');
    sessionIv = setInterval(() => {
      const s = Math.floor((Date.now() - startTime) / 1000);
      el.textContent = `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
    }, 1000);
  }

  function stopClock() {
    clearInterval(sessionIv); 
    sessionIv = null;
    return startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  }

  function saveState() {
    if (!currentType) return;
    
    const def = SESSION_TYPES[currentType];
    if (def.type === 'gym') {
      document.querySelectorAll('[data-ex]').forEach(inp => {
        const ex = inp.dataset.ex, s = inp.dataset.s, f = inp.dataset.f;
        if (ex && s !== undefined && f) {
          if (!sessionData[ex]) sessionData[ex] = { sets: [], note: '', name: ex };
          if (!sessionData[ex].sets[parseInt(s)]) sessionData[ex].sets[parseInt(s)] = {};
          sessionData[ex].sets[parseInt(s)][f] = inp.value;
        }
      });
      document.querySelectorAll('[data-ex].note-input').forEach(ta => {
        const ex = ta.dataset.ex;
        if (ex && sessionData[ex]) sessionData[ex].note = ta.value;
      });
      sessionData._rpe = parseInt(document.getElementById('gym-rpe')?.value) || null;
      sessionData._note = document.getElementById('gym-note')?.value || '';
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      type: currentType,
      data: sessionData,
      elapsed: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
    }));
  }

  function open(type) {
    currentType = type;
    sessionData = {};
    sessionStorage.removeItem(STORAGE_KEY);
    const def = SESSION_TYPES[type];
    document.getElementById('session-title').textContent = def.name;
    document.getElementById('session-timer').textContent = '00:00';
    const content = document.getElementById('session-content');
    content.innerHTML = '';

    if (def.type === 'gym') renderGym(def, content);
    else if (def.type === 'circuit') renderCircuit(def, content);
    else if (def.type === 'snacks') renderSnacks(def, content);

    document.querySelectorAll('#session-content input, #session-content textarea').forEach(el => {
      el.addEventListener('input', saveState);
    });

    showScreen('screen-session');
    startClock();
    saveState();
  }

  function renderGym(def, container) {
    const prev = DB.getLastByType(currentType);

    def.exercises.forEach((ex, i) => {
      const prevEx = prev?.exercises?.[ex.id] || null;
      const block  = document.createElement('div');
      block.className = 'exercise-block';

      const hdr = document.createElement('div');
      hdr.className = 'exercise-block-header';
      hdr.innerHTML = `
        <div class="exercise-num">${String(i+1).padStart(2,'0')}</div>
        <div class="exercise-name-block">
          <div style="display:flex;align-items:center;gap:8px;">
            <div class="exercise-name">${ex.name}</div>
            <div class="pr-badge" id="pr-${ex.id}" style="display:none">↑ PR</div>
          </div>
          <div class="exercise-spec">${ex.sets} sets × ${ex.reps}${prevEx ? ` · Vorige: ${prevEx.sets?.[0]?.weight||'?'}kg` : ''}</div>
        </div>`;
      block.appendChild(hdr);

      const tbl = document.createElement('div');
      tbl.className = 'sets-table';
      tbl.innerHTML = `<div class="set-headers">
        <div class="set-label">SET</div>
        <div class="set-label">KG</div>
        <div class="set-label">REPS</div>
        <div class="set-label">RPE</div>
      </div>`;
      sessionData[ex.id] = { sets: [], note: '', name: ex.name };

      for (let s = 0; s < ex.sets; s++) {
        const ps = prevEx?.sets?.[s];
        sessionData[ex.id].sets[s] = { weight: '', reps: '', rpe: '' };
        const row = document.createElement('div');
        row.className = 'set-row';
        row.innerHTML = `
          <div class="set-num">${s+1}</div>
          <input class="set-input" type="number" inputmode="decimal" placeholder="${ps?.weight||'—'}" data-ex="${ex.id}" data-s="${s}" data-f="weight">
          <input class="set-input" type="number" inputmode="numeric" placeholder="${ps?.reps||'—'}" data-ex="${ex.id}" data-s="${s}" data-f="reps">
          <input class="set-input" type="number" inputmode="numeric" placeholder="RPE" min="1" max="10" data-ex="${ex.id}" data-s="${s}" data-f="rpe" style="font-size:13px">`;
        
        row.querySelectorAll('.set-input').forEach(inp => {
          inp.addEventListener('input', () => {
            sessionData[ex.id].sets[parseInt(inp.dataset.s)][inp.dataset.f] = inp.value;
            checkPR(ex.id, prevEx);
          });
        });
        tbl.appendChild(row);
      }
      block.appendChild(tbl);

      const foot = document.createElement('div');
      foot.className = 'exercise-footer';
      foot.innerHTML = `<textarea class="note-input" placeholder="Notitie..." data-ex="${ex.id}"></textarea>`;
      foot.querySelector('textarea').addEventListener('input', e => { sessionData[ex.id].note = e.target.value; });
      block.appendChild(foot);
      container.appendChild(block);
    });

    const d = document.createElement('div');
    d.style.marginTop = '8px';
    d.innerHTML = `
      <div class="circuit-block">
        <div class="circuit-log">
          <div class="field-group"><label>SESSIE RPE (1-10)</label>
            <input type="number" inputmode="numeric" id="gym-rpe" placeholder="7" min="1" max="10"></div>
          <div class="field-group"><label>SESSIE NOTITIE</label>
            <textarea id="gym-note" placeholder="Algemene notitie..." style="background:var(--bg-3);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-family:'Barlow',sans-serif;font-size:14px;padding:9px 12px;width:100%;resize:none;height:80px;"></textarea>
          </div>
        </div>
      </div>`;
    container.appendChild(d);
  }

  function checkPR(exId, prevEx) {
    if (!prevEx) return;
    const badge = document.getElementById(`pr-${exId}`);
    if (!badge) return;
    const improved = sessionData[exId].sets.some((set, i) => {
      const p = prevEx.sets?.[i];
      if (!p) return false;
      return parseFloat(set.weight) > parseFloat(p.weight||0) || parseInt(set.reps) > parseInt(p.reps||0);
    });
    badge.style.display = improved ? '' : 'none';
  }

  function renderCircuit(def, container) {
    const prev = DB.getLastByType(currentType);
    sessionData = { rounds: 0, rpe: null, note: '', finisher: [] };

    const startBlock = document.createElement('div');
    startBlock.className = 'circuit-block';
    const totalSets = def.exercises.length * def.rounds;
    startBlock.innerHTML = `
      <div class="circuit-start-row">
        <div>
          <div class="circuit-start-label">${def.name}</div>
          <div class="circuit-sub">${totalSets} sets · ${def.workSec}s werk / ${def.restSec}s rust · ${def.rounds} ronden</div>
        </div>
        <button class="btn-start-timer" id="btn-cir-start">▶ START</button>
      </div>`;
    
    startBlock.querySelector('#btn-cir-start').addEventListener('click', () => {
      if (typeof Timer !== 'undefined') {
        Timer.start({
          totalSets, totalRounds: def.rounds,
          workSec: def.workSec, restSec: def.restSec, roundRestSec: def.roundRestSec || 0,
          exercises: def.exercises.map(e => e.name),
          onComplete: () => showToast('Circuit klaar! 🔥')
        });
      }
    });

    const exBlock = document.createElement('div');
    exBlock.className = 'circuit-block';
    let exHtml = `<div style="padding:12px 14px;border-bottom:1px solid var(--border)"><div class="section-title">OEFENINGEN</div></div><div class="circuit-exercises">`;
    def.exercises.forEach((ex, i) => {
      exHtml += `<div class="circuit-ex-row">
        <div class="circuit-ex-num">${i+1}</div>
        <div class="circuit-ex-name">${ex.name}</div>
        <div class="circuit-ex-weight">${ex.defaultWeight || 'eigen gew.'}</div>
      </div>`;
    });
    exHtml += `</div>`;

    const prevBadge = prev?.rounds ? ` <span style="font-size:11px;color:var(--text-3)">Vorige: ${prev.rounds}</span>` : '';
    exHtml += `<div class="circuit-log">
      <div class="circuit-log-grid">
        <div class="log-field"><label>RONDEN${prevBadge}</label>
          <input type="number" inputmode="numeric" id="cir-rounds" placeholder="${def.rounds}" min="0"></div>
        <div class="log-field"><label>RPE (1-10)</label>
          <input type="number" inputmode="numeric" id="cir-rpe" placeholder="7" min="1" max="10"></div>
      </div>
      <div class="field-group"><label>NOTITIE</label>
        <textarea id="cir-note" placeholder="Hoe voelde het?" style="background:var(--bg-3);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-family:'Barlow',sans-serif;font-size:14px;padding:9px 12px;width:100%;resize:none;height:70px;"></textarea>
      </div>
      <div class="improved-hint" id="cir-pr" style="display:none">↑ Meer ronden dan vorige sessie!</div>
    </div>`;
    exBlock.innerHTML = exHtml;

    exBlock.querySelector('#cir-rounds').addEventListener('input', e => {
      sessionData.rounds = parseInt(e.target.value) || 0;
      document.getElementById('cir-pr').style.display = (prev && sessionData.rounds > (prev.rounds || 0)) ? 'flex' : 'none';
    });
    exBlock.querySelector('#cir-rpe').addEventListener('input', e => { sessionData.rpe = parseInt(e.target.value) || null; });
    exBlock.querySelector('#cir-note').addEventListener('input', e => { sessionData.note = e.target.value; });

    container.appendChild(startBlock);
    container.appendChild(exBlock);

    if (def.finisher) {
      sessionData.finisher = def.finisher.map(f => ({ name: f.name, done: false }));
      const fin = document.createElement('div');
      fin.className = 'finisher-block';
      fin.innerHTML = `<div class="finisher-title">FINISHER</div><div class="finisher-check" id="fin-checks"></div>`;
      
      def.finisher.forEach((f, i) => {
        const btn = document.createElement('button');
        btn.className = 'check-btn';
        btn.textContent = f.name;
        btn.addEventListener('click', () => {
          sessionData.finisher[i].done = !sessionData.finisher[i].done;
          btn.classList.toggle('done', sessionData.finisher[i].done);
        });
        fin.querySelector('#fin-checks').appendChild(btn);
      });
      container.appendChild(fin);
    }
  }

  function renderSnacks(def, container) {
    sessionData = { snackId: null, snackName: '', rounds: 0, rpe: null, note: '' };
    const title = document.createElement('div');
    title.className = 'section-title';
    title.textContent = 'KIES EEN SNACK';
    container.appendChild(title);

    const optList = document.createElement('div');
    optList.className = 'snack-options';
    const timerArea = document.createElement('div');
    timerArea.className = 'snack-timer-area';
    timerArea.id = 'snack-timer-area';

    def.options.forEach(opt => {
      const card = document.createElement('button');
      card.className = 'snack-option';
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <div class="snack-option-name">${opt.name}</div>
          <div class="snack-option-badge">${opt.duration}</div>
        </div>
        <div class="snack-option-desc">${opt.protocol}</div>`;

      card.addEventListener('click', () => {
        optList.querySelectorAll('.snack-option').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        sessionData.snackId = opt.id;
        sessionData.snackName = opt.name;
        buildSnackTimerArea(opt, timerArea);
        timerArea.classList.add('visible');
      });
      optList.appendChild(card);
    });

    container.appendChild(optList);
    container.appendChild(timerArea);

    const logBlock = document.createElement('div');
    logBlock.className = 'circuit-block';
    logBlock.innerHTML = `
      <div class="circuit-log">
        <div class="circuit-log-grid">
          <div class="log-field"><label>RONDEN</label><input type="number" inputmode="numeric" id="snack-rounds" placeholder="0"></div>
          <div class="log-field"><label>RPE (1-10)</label><input type="number" inputmode="numeric" id="snack-rpe" placeholder="7"></div>
        </div>
        <div class="field-group"><label>NOTITIE</label><textarea id="snack-note" placeholder="Hoe voelde het?"></textarea></div>
      </div>`;
    
    logBlock.querySelector('#snack-rounds').addEventListener('input', e => { sessionData.rounds = parseInt(e.target.value) || 0; });
    logBlock.querySelector('#snack-rpe').addEventListener('input', e => { sessionData.rpe = parseInt(e.target.value) || null; });
    logBlock.querySelector('#snack-note').addEventListener('input', e => { sessionData.note = e.target.value; });
    container.appendChild(logBlock);
  }

  function buildSnackTimerArea(opt, area) {
    area.innerHTML = `<div class="snack-timer-title">TIMER — ${opt.name}</div>`;
    const btn = document.createElement('button');
    btn.className = 'btn-start-timer';
    btn.textContent = '▶ START SNACK KLOK';
    btn.addEventListener('click', () => {
      if (typeof Timer !== 'undefined') {
        Timer.start({
          totalSets: opt.rounds || 1, totalRounds: 1,
          workSec: opt.restSec || 30, restSec: 0, roundRestSec: 0,
          exercises: opt.exercises,
          onComplete: () => showToast('Snack voltooid! ⚡')
        });
      }
    });
    area.appendChild(btn);
  }

  function finish() {
    const def = SESSION_TYPES[currentType];
    const duration = stopClock();

    let data = { type: currentType, timestamp: Date.now(), date: new Date().toISOString(), duration };

    if (def.type === 'gym') {
      const exercises = {};
      def.exercises.forEach(ex => {
        const sets = [];
        for (let s = 0; s < ex.sets; s++) {
          const w = document.querySelector(`input[data-ex="${ex.id}"][data-s="${s}"][data-f="weight"]`);
          const r = document.querySelector(`input[data-ex="${ex.id}"][data-s="${s}"][data-f="reps"]`);
          const p = document.querySelector(`input[data-ex="${ex.id}"][data-s="${s}"][data-f="rpe"]`);
          sets.push({ weight: w?.value || '', reps: r?.value || '', rpe: p?.value || '' });
        }
        const n = document.querySelector(`textarea[data-ex="${ex.id}"]`);
        exercises[ex.id] = { sets, note: n?.value || '', name: ex.name };
      });
      data = { ...data, exercises, globalRpe: sessionData._rpe, globalNote: sessionData._note };
    } else {
      data = { ...data, rounds: sessionData.rounds, rpe: sessionData.rpe, note: sessionData.note, finisher: sessionData.finisher || [] };
      if (def.type === 'snacks') {
        data.snackId = sessionData.snackId;
        data.snackName = sessionData.snackName;
      }
    }

    DB.saveSession(data);
    sessionStorage.removeItem(STORAGE_KEY);
    currentType = null;
    sessionData = {};
    showToast('Sessie succesvol opgeslagen! 💪');
    showScreen('screen-home');
    if (typeof App !== 'undefined') App.refreshHome();
  }

  function pause() { stopClock(); }
  function close() { stopClock(); currentType = null; sessionData = {}; sessionStorage.removeItem(STORAGE_KEY); if (typeof Timer !== 'undefined') Timer.stop(); }
  function isActive() { return currentType !== null || sessionStorage.getItem(STORAGE_KEY) !== null; }
  function activeType() { if (currentType) return currentType; try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY))?.type; } catch(e) { return null; } }
  function resume() {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      open(parsed.type);
    } catch(e) {}
  }

  return { open, finish, close, pause, resume, isActive, activeType };
})();
