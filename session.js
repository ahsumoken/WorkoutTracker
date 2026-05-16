// ─── SESSION MODULE ────────────────────────────────────────────────────────

const Session = (() => {
  let currentType = null;
  let sessionData = {};
  let startTime   = null;
  let sessionIv   = null;
  let wl          = null;

  async function grabWL() {
    if ('wakeLock' in navigator) { try { wl = await navigator.wakeLock.request('screen'); } catch(e) {} }
  }
  async function dropWL() {
    if (wl) { try { await wl.release(); } catch(e) {} wl = null; }
  }

  function startClock() {
    startTime = Date.now();
    const el = document.getElementById('session-timer');
    sessionIv = setInterval(() => {
      const s = Math.floor((Date.now() - startTime) / 1000);
      el.textContent = `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
    }, 1000);
  }

  function stopClock() {
    clearInterval(sessionIv); sessionIv = null;
    return startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  }

  // ── PUBLIC: open ──────────────────────────────────────────────────────────

  function open(type) {
    currentType = type;
    sessionData = {};
    const def = SESSION_TYPES[type];
    document.getElementById('session-title').textContent = def.name;
    document.getElementById('session-timer').textContent = '00:00';
    const content = document.getElementById('session-content');
    content.innerHTML = '';

    if      (def.type === 'gym')    renderGym(def, content);
    else if (def.type === 'circuit') renderCircuit(def, content);
    else if (def.type === 'snacks')  renderSnacks(def, content);

    showScreen('screen-session');
    startClock();
    grabWL();
  }

  // ── GYM ───────────────────────────────────────────────────────────────────

  function renderGym(def, container) {
    const prev = DB.getLastByType(currentType);

    def.exercises.forEach((ex, i) => {
      const prevEx = prev?.exercises?.[ex.id] || null;
      const block  = document.createElement('div');
      block.className = 'exercise-block';

      // Header
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

      // Sets
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

      // Note
      const foot = document.createElement('div');
      foot.className = 'exercise-footer';
      foot.innerHTML = `<textarea class="note-input" placeholder="Notitie..." data-ex="${ex.id}"></textarea>`;
      foot.querySelector('textarea').addEventListener('input', e => { sessionData[ex.id].note = e.target.value; });
      block.appendChild(foot);
      container.appendChild(block);
    });

    container.appendChild(gymFooter());
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

  function gymFooter() {
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
    d.querySelector('#gym-rpe').addEventListener('input',  e => { sessionData._rpe  = parseInt(e.target.value)||null; });
    d.querySelector('#gym-note').addEventListener('input', e => { sessionData._note = e.target.value; });
    return d;
  }

  // ── CIRCUIT ───────────────────────────────────────────────────────────────

  function renderCircuit(def, container) {
    const prev = DB.getLastByType(currentType);
    sessionData = { rounds: 0, rpe: null, note: '', finisher: [] };

    // Timer launch block
    const startBlock = document.createElement('div');
    startBlock.className = 'circuit-block';
    const totalSets = def.exercises.length * def.rounds;
    startBlock.innerHTML = `
      <div class="circuit-start-row">
        <div>
          <div class="circuit-start-label">${def.name}</div>
          <div class="circuit-sub">${totalSets} sets · ${def.workSec}s werk / ${def.restSec}s rust · ${def.rounds} ronden · ${def.roundRestSec}s rondrust</div>
        </div>
        <button class="btn-start-timer" id="btn-cir-start">▶ START</button>
      </div>`;
    startBlock.querySelector('#btn-cir-start').addEventListener('click', () => {
      Timer.start({
        totalSets, totalRounds: def.rounds,
        workSec: def.workSec, restSec: def.restSec, roundRestSec: def.roundRestSec,
        exercises: def.exercises.map(e => e.name),
        onComplete: () => showToast('Circuit klaar! 🔥')
      });
    });

    // Exercise list
    const exBlock = document.createElement('div');
    exBlock.className = 'circuit-block';
    let exHtml = `<div style="padding:12px 14px;border-bottom:1px solid var(--border)"><div class="section-title">OEFENINGEN</div></div>
                  <div class="circuit-exercises">`;
    def.exercises.forEach((ex, i) => {
      exHtml += `<div class="circuit-ex-row">
        <div class="circuit-ex-num">${i+1}</div>
        <div class="circuit-ex-name">${ex.name}</div>
        <div class="circuit-ex-weight">${ex.defaultWeight}</div>
      </div>`;
    });
    exHtml += `</div>`;

    const prevBadge = prev?.rounds ? ` <span style="font-size:11px;color:var(--text-3)">Vorige: ${prev.rounds}</span>` : '';
    exHtml += `<div class="circuit-log">
      <div class="circuit-log-grid">
        <div class="log-field"><label>RONDEN${prevBadge}</label>
          <input type="number" inputmode="numeric" id="cir-rounds" placeholder="${def.rounds}" min="0" max="${def.rounds}"></div>
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
      sessionData.rounds = parseInt(e.target.value)||0;
      document.getElementById('cir-pr').style.display =
        (prev && sessionData.rounds > (prev.rounds||0)) ? 'flex' : 'none';
    });
    exBlock.querySelector('#cir-rpe').addEventListener('input',  e => { sessionData.rpe  = parseInt(e.target.value)||null; });
    exBlock.querySelector('#cir-note').addEventListener('input', e => { sessionData.note = e.target.value; });

    container.appendChild(startBlock);
    container.appendChild(exBlock);

    // Finisher
    if (def.finisher) {
      sessionData.finisher = def.finisher.map(f => ({ name: f.name, done: false }));
      const fin = document.createElement('div');
      fin.className = 'finisher-block';
      fin.innerHTML = `<div class="finisher-title">FINISHER</div>
        ${def.finisher.map(f=>`<div style="font-size:13px;color:var(--text-2);margin-bottom:3px">${f.name}</div>`).join('')}
        <div class="finisher-check" id="fin-checks"></div>`;
      def.finisher.forEach((f, i) => {
        const btn = document.createElement('button');
        btn.className = 'check-btn';
        btn.textContent = f.name.replace('3×10 ','');
        btn.addEventListener('click', () => {
          sessionData.finisher[i].done = !sessionData.finisher[i].done;
          btn.classList.toggle('done', sessionData.finisher[i].done);
          btn.textContent = (sessionData.finisher[i].done ? '✓ ' : '') + f.name.replace('3×10 ','');
        });
        fin.querySelector('#fin-checks').appendChild(btn);
      });
      container.appendChild(fin);
    }
  }

  // ── SNACKS ────────────────────────────────────────────────────────────────

  function renderSnacks(def, container) {
    sessionData = { snackId: null, snackName: '', rounds: 0, rpe: null, note: '' };

    // Title
    const title = document.createElement('div');
    title.className = 'section-title';
    title.style.marginBottom = '10px';
    title.textContent = 'KIES EEN SNACK';
    container.appendChild(title);

    // Snack option cards
    const optList = document.createElement('div');
    optList.className = 'snack-options';

    // Timer area (hidden until snack selected)
    const timerArea = document.createElement('div');
    timerArea.className = 'snack-timer-area';
    timerArea.id = 'snack-timer-area';

    def.options.forEach(opt => {
      const card = document.createElement('button');
      card.className = 'snack-option';
      card.dataset.id = opt.id;
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <div class="snack-option-name">${opt.name}</div>
          <div class="snack-option-badge">${opt.duration}</div>
        </div>
        <div class="snack-option-desc">${opt.protocol}</div>
        <div class="snack-exercises">${opt.exercises.join('<br>')}</div>`;

      card.addEventListener('click', () => {
        optList.querySelectorAll('.snack-option').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        sessionData.snackId   = opt.id;
        sessionData.snackName = opt.name;
        buildSnackTimerArea(opt, timerArea);
        timerArea.classList.add('visible');
      });

      optList.appendChild(card);
    });

    container.appendChild(optList);
    container.appendChild(timerArea);

    // Log block (always visible)
    const logBlock = document.createElement('div');
    logBlock.className = 'circuit-block';
    logBlock.innerHTML = `
      <div class="circuit-log">
        <div class="circuit-log-grid">
          <div class="log-field"><label>RONDEN</label>
            <input type="number" inputmode="numeric" id="snack-rounds" placeholder="3" min="0"></div>
          <div class="log-field"><label>RPE (1-10)</label>
            <input type="number" inputmode="numeric" id="snack-rpe" placeholder="7" min="1" max="10"></div>
        </div>
        <div class="field-group"><label>NOTITIE</label>
          <textarea id="snack-note" placeholder="Hoe voelde het?" style="background:var(--bg-3);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-family:'Barlow',sans-serif;font-size:14px;padding:9px 12px;width:100%;resize:none;height:70px;"></textarea>
        </div>
        <div class="improved-hint" id="snack-pr" style="display:none">↑ Meer ronden of betere RPE dan vorige keer!</div>
      </div>`;

    logBlock.querySelector('#snack-rounds').addEventListener('input', e => {
      sessionData.rounds = parseInt(e.target.value)||0;
      checkSnackPR();
    });
    logBlock.querySelector('#snack-rpe').addEventListener('input', e => {
      sessionData.rpe = parseInt(e.target.value)||null;
      checkSnackPR();
    });
    logBlock.querySelector('#snack-note').addEventListener('input', e => { sessionData.note = e.target.value; });

    container.appendChild(logBlock);
  }

  function buildSnackTimerArea(opt, area) {
    area.innerHTML = `<div class="snack-timer-title">TIMER — ${opt.name}</div>`;

    if (opt.protocol === 'AMRAP') {
      // Simple stopwatch for AMRAP
      let running = false, elapsed = 0, iv = null;
      const display = document.createElement('div');
      display.style.cssText = 'font-family:"Barlow Condensed",sans-serif;font-size:48px;font-weight:900;color:var(--text);margin-bottom:10px';
      display.textContent = '10:00';

      // Countdown from 10 min
      let remaining = 600;
      const btn = document.createElement('button');
      btn.className = 'btn-start-timer';
      btn.textContent = '▶ START AMRAP (10 min)';
      btn.addEventListener('click', () => {
        if (!running) {
          running = true; btn.textContent = '■ STOP';
          iv = setInterval(() => {
            remaining--;
            const m = Math.floor(remaining/60), s = remaining%60;
            display.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
            if (remaining <= 0) { clearInterval(iv); running = false; btn.textContent = '▶ OPNIEUW'; remaining = 600; showToast('AMRAP klaar! 🔥'); }
          }, 1000);
        } else {
          clearInterval(iv); running = false; remaining = 600;
          display.textContent = '10:00'; btn.textContent = '▶ START AMRAP (10 min)';
        }
      });
      area.appendChild(display);
      area.appendChild(btn);
    } else {
      // Ronden met rust-pauze
      let currentRound = 1;
      const totalRounds = opt.rounds || 3;
      const restSec = opt.restSec || 30;

      const info = document.createElement('div');
      info.style.cssText = 'font-family:"Barlow Condensed",sans-serif;font-size:22px;font-weight:800;color:var(--text);margin-bottom:10px';
      info.textContent = `Ronde ${currentRound} / ${totalRounds}`;

      const exList = document.createElement('div');
      exList.style.cssText = 'font-size:13px;color:var(--text-2);margin-bottom:12px;line-height:1.7';
      exList.innerHTML = opt.exercises.map(e => `• ${e}`).join('<br>');

      const btn = document.createElement('button');
      btn.className = 'btn-start-timer';
      btn.textContent = currentRound === 1 ? '▶ START' : `▶ RONDE ${currentRound}`;

      btn.addEventListener('click', () => {
        if (currentRound > totalRounds) return;
        btn.disabled = true;
        btn.textContent = 'BEZIG...';

        // After pressing: show rest countdown (except after last round)
        const doneRound = currentRound;
        currentRound++;
        sessionData.rounds = doneRound; // update live
        document.getElementById('snack-rounds').value = doneRound;

        if (currentRound <= totalRounds && restSec > 0) {
          info.textContent = `Ronde ${doneRound} klaar!`;
          RestBanner.show(restSec, () => {
            if (currentRound <= totalRounds) {
              info.textContent = `Ronde ${currentRound} / ${totalRounds}`;
              btn.textContent = `▶ RONDE ${currentRound}`;
              btn.disabled = false;
            } else {
              info.textContent = 'Klaar! 🔥';
              btn.textContent = '✓ VOLTOOID';
              btn.style.background = 'var(--accent-green)';
              showToast(`${opt.name} klaar! 💪`);
            }
          });
        } else if (currentRound <= totalRounds) {
          info.textContent = `Ronde ${currentRound} / ${totalRounds}`;
          btn.textContent = `▶ RONDE ${currentRound}`;
          btn.disabled = false;
        } else {
          info.textContent = 'Klaar! 🔥';
          btn.textContent = '✓ VOLTOOID';
          btn.style.background = 'var(--accent-green)';
          showToast(`${opt.name} klaar! 💪`);
        }
      });

      area.appendChild(info);
      area.appendChild(exList);
      area.appendChild(btn);
    }
  }

  function checkSnackPR() {
    if (!sessionData.snackId) return;
    const prev = DB.getLastSnack(sessionData.snackId);
    if (!prev) return;
    const better = sessionData.rounds > (prev.rounds||0) || (sessionData.rpe && prev.rpe && sessionData.rpe < prev.rpe);
    document.getElementById('snack-pr').style.display = better ? 'flex' : 'none';
  }

  // ── FINISH + SAVE ─────────────────────────────────────────────────────────

  function finish() {
    const def = SESSION_TYPES[currentType];
    const duration = stopClock();
    dropWL();

    let data = { type: currentType, timestamp: Date.now(), date: new Date().toISOString(), duration };

    if (def.type === 'gym') {
      // Collect set inputs from DOM
      const exercises = {};
      def.exercises.forEach(ex => {
        const sets = [];
        for (let s = 0; s < ex.sets; s++) {
          const w = document.querySelector(`input[data-ex="${ex.id}"][data-s="${s}"][data-f="weight"]`);
          const r = document.querySelector(`input[data-ex="${ex.id}"][data-s="${s}"][data-f="reps"]`);
          const p = document.querySelector(`input[data-ex="${ex.id}"][data-s="${s}"][data-f="rpe"]`);
          sets.push({ weight: w?.value||'', reps: r?.value||'', rpe: p?.value||'' });
        }
        const n = document.querySelector(`textarea[data-ex="${ex.id}"]`);
        exercises[ex.id] = { sets, note: n?.value||'', name: ex.name };
      });
      data = { ...data, exercises,
        globalRpe:  parseInt(document.getElementById('gym-rpe')?.value)||null,
        globalNote: document.getElementById('gym-note')?.value||'' };

    } else if (def.type === 'circuit') {
      data = { ...data,
        rounds:   parseInt(document.getElementById('cir-rounds')?.value)||sessionData.rounds,
        rpe:      parseInt(document.getElementById('cir-rpe')?.value)||sessionData.rpe,
        note:     document.getElementById('cir-note')?.value||sessionData.note,
        finisher: sessionData.finisher||[] };

    } else if (def.type === 'snacks') {
      data = { ...data,
        snackId:   sessionData.snackId,
        snackName: sessionData.snackName,
        rounds:    parseInt(document.getElementById('snack-rounds')?.value)||sessionData.rounds,
        rpe:       parseInt(document.getElementById('snack-rpe')?.value)||sessionData.rpe,
        note:      document.getElementById('snack-note')?.value||sessionData.note };
    }

    DB.saveSession(data);
    showToast('Sessie opgeslagen! 💪');
    showScreen('screen-home');
    App.refreshHome();
    setTimeout(() => Export.showForSession(data), 600);
  }

  function close() { stopClock(); dropWL(); currentType = null; sessionData = {}; }

  return { open, finish, close };
})();
