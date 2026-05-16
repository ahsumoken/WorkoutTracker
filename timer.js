// ─── TIMER MODULE ─────────────────────────────────────────────────────────

const Timer = (() => {
  let interval = null;
  let wakeLock = null;
  let state = null;

  // Exercise names for circuit sessions
  let exerciseNames = [];

  const circumference = 2 * Math.PI * 88; // r=88

  function el(id) { return document.getElementById(id); }

  async function acquireWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => { wakeLock = null; });
      } catch (e) {
        console.warn('WakeLock not available:', e);
      }
    }
  }

  async function releaseWakeLock() {
    if (wakeLock) {
      try { await wakeLock.release(); } catch (e) {}
      wakeLock = null;
    }
  }

  function showModal() { el('modal-timer').classList.remove('hidden'); }
  function hideModal() { el('modal-timer').classList.add('hidden'); }

  function updateDisplay() {
    if (!state) return;

    const { seconds, phase, currentSet, totalSets, currentRound, totalRounds } = state;

    // Time display
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    el('timer-display').textContent = `${mins}:${secs.toString().padStart(2,'0')}`;

    // Phase label
    const phaseEl = el('timer-phase');
    const ringFg = el('timer-ring-fg');
    if (phase === 'work') {
      phaseEl.textContent = 'WERK';
      phaseEl.className = 'timer-phase';
      ringFg.className = 'timer-ring-fg';
      const progress = 1 - (seconds / state.workSec);
      ringFg.style.strokeDashoffset = circumference * progress;
    } else if (phase === 'rest') {
      phaseEl.textContent = 'RUST';
      phaseEl.className = 'timer-phase rest-phase';
      ringFg.className = 'timer-ring-fg rest';
      const progress = 1 - (seconds / state.restSec);
      ringFg.style.strokeDashoffset = circumference * progress;
    } else if (phase === 'roundRest') {
      phaseEl.textContent = 'RONDE RUST';
      phaseEl.className = 'timer-phase round-rest-phase';
      ringFg.className = 'timer-ring-fg round-rest';
      const progress = 1 - (seconds / state.roundRestSec);
      ringFg.style.strokeDashoffset = circumference * progress;
    }

    // Meta
    el('timer-set-info').textContent = `Set ${currentSet} / ${totalSets}`;
    el('timer-round-info').textContent = `Ronde ${currentRound} / ${totalRounds}`;

    const exIdx = (currentSet - 1) % exerciseNames.length;
    el('timer-exercise-name').textContent = phase === 'roundRest' ? '— rust —' : (exerciseNames[exIdx] || '');
  }

  function beep(type = 'work') {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      if (type === 'work') {
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'rest') {
        osc.frequency.value = 440;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'done') {
        // triple beep
        [0, 0.2, 0.4].forEach(t => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.value = 1100;
          g.gain.setValueAtTime(0.4, ctx.currentTime + t);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.15);
          o.start(ctx.currentTime + t);
          o.stop(ctx.currentTime + t + 0.15);
        });
      }
    } catch(e) {}
  }

  function nextPhase() {
    if (!state) return;

    const exercisesPerRound = state.totalSets / state.totalRounds; // = 6 sets per round

    if (state.phase === 'work') {
      // After work: rest or round rest
      const isLastSetInRound = state.currentSet % exercisesPerRound === 0;
      const isLastSet = state.currentSet === state.totalSets;

      if (isLastSet) {
        // Done!
        beep('done');
        stop();
        if (state.onComplete) state.onComplete();
        return;
      } else if (isLastSetInRound) {
        // Round rest
        state.currentRound++;
        state.phase = 'roundRest';
        state.seconds = state.roundRestSec;
        beep('rest');
      } else {
        // Normal rest
        state.phase = 'rest';
        state.seconds = state.restSec;
        beep('rest');
      }
    } else if (state.phase === 'rest') {
      state.currentSet++;
      state.phase = 'work';
      state.seconds = state.workSec;
      beep('work');
    } else if (state.phase === 'roundRest') {
      state.currentSet++;
      state.phase = 'work';
      state.seconds = state.workSec;
      beep('work');
    }

    updateDisplay();
  }

  function tick() {
    if (!state) return;
    state.seconds--;
    if (state.seconds <= 0) {
      nextPhase();
    } else {
      updateDisplay();
    }
  }

  function start({ totalSets, totalRounds, workSec, restSec, roundRestSec, exercises, onComplete }) {
    exerciseNames = exercises || [];
    state = {
      totalSets,
      totalRounds,
      workSec,
      restSec,
      roundRestSec,
      phase: 'work',
      currentSet: 1,
      currentRound: 1,
      seconds: workSec,
      paused: false,
      onComplete
    };
    acquireWakeLock();
    showModal();
    updateDisplay();
    beep('work');
    interval = setInterval(tick, 1000);
  }

  function pause() {
    if (!state) return;
    if (state.paused) {
      state.paused = false;
      interval = setInterval(tick, 1000);
      el('btn-timer-pause').innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
    } else {
      state.paused = true;
      clearInterval(interval);
      interval = null;
      el('btn-timer-pause').innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
    }
  }

  function stop() {
    clearInterval(interval);
    interval = null;
    state = null;
    exerciseNames = [];
    releaseWakeLock();
    hideModal();
  }

  // Re-acquire wake lock on visibility change
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && interval && !wakeLock) {
      await acquireWakeLock();
    }
  });

  // Wire up buttons
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-timer-pause').addEventListener('click', pause);
    document.getElementById('btn-timer-stop').addEventListener('click', stop);
  });

  return { start, stop, pause };
})();

// ─── REST BANNER (between sets, separate from circuit timer) ───────────────

const RestBanner = (() => {
  let restInterval = null;
  let remaining = 0;
  let total = 0;

  function show(seconds, onDone) {
    clearInterval(restInterval);
    remaining = seconds;
    total = seconds;
    const banner = document.getElementById('rest-banner');
    const timeEl = document.getElementById('rest-time-display');
    const barEl = document.getElementById('rest-bar');

    banner.classList.remove('hidden');
    timeEl.textContent = remaining;
    barEl.style.width = '100%';

    restInterval = setInterval(() => {
      remaining--;
      timeEl.textContent = remaining;
      barEl.style.width = `${(remaining / total) * 100}%`;
      if (remaining <= 0) {
        hide();
        if (onDone) onDone();
      }
    }, 1000);

    document.getElementById('btn-skip-rest').onclick = () => {
      hide();
      if (onDone) onDone();
    };
  }

  function hide() {
    clearInterval(restInterval);
    restInterval = null;
    document.getElementById('rest-banner').classList.add('hidden');
  }

  return { show, hide };
})();
