const Timer = (() => {
  let iv = null;
  let wl = null;
  let wakeLockEnabled = false;
  let st = null;
  let exNames = [];
  const CIRC = 2 * Math.PI * 88;

  function el(id) {
    return document.getElementById(id);
  }

  async function grabWakeLock() {
    if (!('wakeLock' in navigator)) return;
    if (document.visibilityState !== 'visible') return;
    wakeLockEnabled = true;
    try {
      wl = await navigator.wakeLock.request('screen');
      wl.addEventListener('release', () => {
        wl = null;
        if (wakeLockEnabled && document.visibilityState === 'visible') {
          setTimeout(grabWakeLock, 500);
        }
      });
    } catch (e) {
      if (wakeLockEnabled) setTimeout(grabWakeLock, 30000);
    }
  }

  async function dropWakeLock() {
    wakeLockEnabled = false;
    if (wl) {
      try { await wl.release(); } catch (e) {}
      wl = null;
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && wakeLockEnabled) {
      if (wl) { try { wl.release(); } catch (e) {} wl = null; }
      grabWakeLock();
    } else if (document.visibilityState === 'hidden') {
      wl = null;
    }
  });

  function beep(type) {
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
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'rest') {
        osc.frequency.value = 440;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        [0, 0.2, 0.4].forEach(t => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.value = 1100;
          g.gain.setValueAtTime(0.4, ctx.currentTime + t);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.15);
          o.start(ctx.currentTime + t);
          o.stop(ctx.currentTime + t + 0.15);
        });
      }
    } catch (e) {}
  }

  function draw() {
    if (!st) return;
    const { seconds, phase, workSec, restSec, roundRestSec, currentSet, totalSets, currentRound, totalRounds } = st;

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    el('timer-display').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

    const phaseEl = el('timer-phase');
    const fg = el('timer-ring-fg');
    let duration = workSec || 1;

    if (phase === 'work') {
      phaseEl.textContent = 'WERK';
      phaseEl.className = 'timer-phase';
      fg.className = 'timer-ring-fg';
      duration = workSec;
    } else if (phase === 'rest') {
      phaseEl.textContent = 'RUST';
      phaseEl.className = 'timer-phase rest-phase';
      fg.className = 'timer-ring-fg rest';
      duration = restSec;
    } else {
      phaseEl.textContent = 'RONDE RUST';
      phaseEl.className = 'timer-phase round-rest-phase';
      fg.className = 'timer-ring-fg round-rest';
      duration = roundRestSec;
    }

    fg.style.strokeDashoffset = CIRC * (1 - seconds / duration);

    el('timer-set-info').textContent = `Set ${currentSet} / ${totalSets}`;
    el('timer-round-info').textContent = `Ronde ${currentRound} / ${totalRounds}`;
    const exIdx = (currentSet - 1) % exNames.length;
    el('timer-exercise-name').textContent = phase === 'roundRest' ? '— rust —' : (exNames[exIdx] || '');
  }

  function next() {
    if (!st) return;
    const perRound = st.totalSets / st.totalRounds;
    const isLastSetInRound = st.currentSet % perRound === 0;
    const isLast = st.currentSet === st.totalSets;

    if (st.phase === 'work') {
      if (isLast) {
        beep('done');
        stop();
        if (st.onComplete) st.onComplete();
        return;
      } else if (isLastSetInRound) {
        st.currentRound++;
        st.phase = 'roundRest';
        st.seconds = st.roundRestSec;
        beep('rest');
      } else {
        st.phase = 'rest';
        st.seconds = st.restSec;
        beep('rest');
      }
    } else {
      st.currentSet++;
      st.phase = 'work';
      st.seconds = st.workSec;
      beep('work');
    }
    draw();
  }

  function skip() {
    if (!st) return;
    next();
  }

  function tick() {
    if (!st) return;
    st.seconds--;
    if (st.seconds <= 0) {
      next();
    } else {
      draw();
    }
  }

  function start({ totalSets, totalRounds, workSec, restSec, roundRestSec, exercises, onComplete }) {
    exNames = exercises || [];
    st = {
      totalSets,
      totalRounds,
      workSec,
      restSec,
      roundRestSec,
      phase: 'work',
      currentSet: 1,
      currentRound: 1,
      seconds: workSec || 1,
      paused: false,
      onComplete
    };
    grabWakeLock();
    el('modal-timer').style.display = 'flex';
    draw();
    beep('work');
    if (workSec > 0) {
      iv = setInterval(tick, 1000);
    } else {
      el('timer-display').textContent = 'GO!';
    }
  }

  function pause() {
    if (!st || st.workSec === 0) return;
    if (st.paused) {
      st.paused = false;
      iv = setInterval(tick, 1000);
      el('btn-timer-pause').innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
    } else {
      st.paused = true;
      clearInterval(iv);
      iv = null;
      el('btn-timer-pause').innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
    }
  }

  function stop() {
    clearInterval(iv);
    iv = null;
    st = null;
    exNames = [];
    dropWakeLock();
    el('modal-timer').style.display = 'none';
  }

  document.addEventListener('DOMContentLoaded', () => {
    el('btn-timer-pause').addEventListener('click', pause);
    el('btn-timer-skip').addEventListener('click', skip);
    el('btn-timer-stop').addEventListener('click', stop);
  });

  return { start, stop, pause, skip, releaseWakeLock: dropWakeLock };
})();

const RestBanner = (() => {
  let iv = null;

  function show(seconds, onDone) {
    clearInterval(iv);
    let rem = seconds;
    const banner = document.getElementById('rest-banner');
    const timeEl = document.getElementById('rest-time-display');
    const barEl = document.getElementById('rest-bar');
    
    banner.style.display = 'block';
    timeEl.textContent = rem;
    barEl.style.width = '100%';

    iv = setInterval(() => {
      rem--;
      timeEl.textContent = rem;
      barEl.style.width = `${(rem / seconds) * 100}%`;
      if (rem <= 0) {
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
    clearInterval(iv);
    iv = null;
    document.getElementById('rest-banner').style.display = 'none';
  }

  return { show, hide };
})();
