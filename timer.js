const Timer = (() => {
  let iv = null;
  let isPaused = false;
  let timeLeft = 0;
  let currentPhase = 'WERK';
  let currentSet = 0;
  let currentRound = 1;
  let opts = {};

  const CIRCUMFERENCE = 2 * Math.PI * 88; // r=88

  function el(id) { return document.getElementById(id); }

  function setRingProgress(fraction) {
    const fg = el('timer-ring-fg');
    if (fg) fg.style.strokeDashoffset = CIRCUMFERENCE * (1 - fraction);
  }

  function render() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    el('timer-display').textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
    el('timer-phase').textContent = currentPhase;

    const maxTime = currentPhase === 'WERK' ? opts.workSec : opts.restSec;
    setRingProgress(maxTime > 0 ? timeLeft / maxTime : 1);

    const totalSets = opts.totalSets || 1;
    el('timer-set-info').textContent = `Set ${currentSet} / ${totalSets}`;
    el('timer-round-info').textContent = `Ronde ${currentRound} / ${opts.totalRounds || 1}`;

    const exList = opts.exercises || [];
    const exIdx = (currentSet - 1) % exList.length;
    el('timer-exercise-name').textContent = exList[exIdx] || '';

    const nextSet = currentPhase === 'WERK' ? currentSet : currentSet + 1;
    if (nextSet <= totalSets) {
      const nextIdx = (nextSet - 1) % exList.length;
      el('timer-next-exercise-name').textContent = `Volgende: ${exList[nextIdx] || ''}`;
    } else {
      el('timer-next-exercise-name').textContent = 'Laatste set!';
    }
  }

  function advance() {
    if (currentPhase === 'WERK') {
      if (opts.restSec > 0) {
        currentPhase = 'RUST';
        timeLeft = opts.restSec;
      } else {
        nextSet();
      }
    } else {
      // Check if this was a round-rest (after last exercise of round)
      nextSet();
    }
  }

  function nextSet() {
    currentSet++;
    const perRound = (opts.exercises || []).length;
    currentRound = Math.ceil(currentSet / (perRound || 1));

    if (currentSet > (opts.totalSets || 1)) {
      stop();
      el('modal-timer').style.display = 'none';
      if (typeof opts.onComplete === 'function') opts.onComplete();
      return;
    }

    // Check if we just finished a round and need a round rest
    const justFinishedRound = currentSet > 1 && ((currentSet - 1) % perRound === 0);
    if (justFinishedRound && opts.roundRestSec > 0) {
      currentPhase = 'RONDE RUST';
      timeLeft = opts.roundRestSec;
    } else {
      currentPhase = 'WERK';
      timeLeft = opts.workSec;
    }
  }

  function tick() {
    if (isPaused) return;
    timeLeft--;
    if (timeLeft <= 0) {
      advance();
    }
    render();
  }

  function start(options) {
    stop();
    opts = options;
    currentSet = 1;
    currentRound = 1;
    isPaused = false;
    currentPhase = opts.workSec > 0 ? 'WERK' : 'RUST';
    timeLeft = opts.workSec > 0 ? opts.workSec : opts.restSec;

    el('modal-timer').style.display = 'flex';
    render();
    iv = setInterval(tick, 1000);
  }

  function stop() {
    if (iv) { clearInterval(iv); iv = null; }
    isPaused = false;
  }

  function skip() {
    timeLeft = 0;
    advance();
    render();
  }

  // Button bindings
  document.addEventListener('DOMContentLoaded', () => {
    el('btn-timer-pause').addEventListener('click', () => {
      isPaused = !isPaused;
      const svg_pause = `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
      const svg_play  = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
      el('btn-timer-pause').innerHTML = isPaused ? svg_play : svg_pause;
    });

    el('btn-timer-skip').addEventListener('click', skip);

    el('btn-timer-stop').addEventListener('click', () => {
      stop();
      el('modal-timer').style.display = 'none';
    });

    el('modal-timer-backdrop').addEventListener('click', () => {
      // backdrop click does nothing — prevent accidental close during workout
    });
  });

  return { start, stop, skip };
})();
