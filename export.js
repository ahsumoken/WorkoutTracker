const Export = (() => {
  function showForSession(s) {
    document.getElementById('export-text').value = generate(s);
    document.getElementById('modal-export').classList.remove('hidden');
  }

  function generate(s) {
    const def = SESSION_TYPES[s.type];
    if (!def) return 'Sessie niet gevonden.';

    const d = new Date(s.timestamp || s.date);
    const dateStr = d.toLocaleDateString('nl-NL', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    const timeStr = d.toLocaleTimeString('nl-NL', { hour:'2-digit', minute:'2-digit' });
    const dur = s.duration ? fmtDur(s.duration) : '—';

    // Previous session for comparison
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
          let line = `    Set ${i+1}: ${set.weight||'—'}kg × ${set.reps||'—'} reps`;
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
          if (cw > pw) L.push(`    ✅ Nieuw topgewicht! ${cw}kg (was ${pw}kg)`);
        }
        if (ex.note) L.push(`    📝 ${ex.note}`);
        L.push('');
      });
      if (s.globalRpe)  L.push(`Sessie RPE: ${s.globalRpe}/10`);
      if (s.globalNote) L.push(`Notitie: ${s.globalNote}`);

    } else if (def.type === 'circuit') {
      L.push('OEFENINGEN:');
      def.exercises?.forEach((ex, i) => L.push(`  ${i+1}. ${ex.name} — ${ex.defaultWeight}`));
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
    L.push('Plak dit in een nieuwe chat voor');
    L.push('interpretatie en advies.');
    L.push('═══════════════════════════════════');

    return L.join('\n');
  }

  function generateAll() {
    const all = DB.getAll();
    if (!all.length) return 'Geen sessies.';
    return all.slice(0, 20).map(s => generate(s)).join('\n\n───────────────────────────────────\n\n');
  }

  function fmtDur(sec) {
    const m = Math.floor(sec/60), s = sec%60;
    return m ? `${m}min${s?` ${s}sec`:''}` : `${sec}sec`;
  }

  return { showForSession, generateAll };
})();
