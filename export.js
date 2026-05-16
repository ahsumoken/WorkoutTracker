// ─── EXPORT MODULE ─────────────────────────────────────────────────────────

const Export = (() => {
  function showForSession(session) {
    const text = generateReport(session);
    document.getElementById('export-text').value = text;
    document.getElementById('modal-export').classList.remove('hidden');
  }

  function generateReport(session) {
    const def = SESSION_TYPES[session.type];
    if (!def) return 'Sessie niet gevonden.';

    const d = new Date(session.timestamp || session.date);
    const dateStr = d.toLocaleDateString('nl-NL', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    const timeStr = d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    const dur = session.duration ? formatDuration(session.duration) : '—';

    const prev = session.type === 'snacks'
      ? (session.snackId ? DB.getLastSnackById(session.snackId) : null)
      : DB.getSessions().filter(s => s.type === session.type && s.timestamp !== session.timestamp)[0] || null;

    let lines = [];
    lines.push(`═══════════════════════════════════`);
    lines.push(`TRAINLOG — SESSIE VERSLAG`);
    lines.push(`═══════════════════════════════════`);
    lines.push(`Datum:    ${dateStr}`);
    lines.push(`Tijd:     ${timeStr}`);
    lines.push(`Sessie:   ${def.name} (${def.tag})`);
    lines.push(`Duur:     ${dur}`);
    lines.push(`───────────────────────────────────`);

    if (def.type === 'gym' && session.exercises) {
      lines.push(`OEFENINGEN:`);
      lines.push('');

      Object.entries(session.exercises).forEach(([id, ex]) => {
        const prevEx = prev?.exercises?.[id];
        lines.push(`  ${ex.name.toUpperCase()}`);

        ex.sets?.forEach((set, i) => {
          if (!set.weight && !set.reps) return;
          let line = `    Set ${i+1}: ${set.weight || '—'}kg × ${set.reps || '—'} reps`;
          if (set.rpe) line += ` (RPE ${set.rpe})`;

          // Compare with previous
          const prevSet = prevEx?.sets?.[i];
          if (prevSet) {
            const wDiff = parseFloat(set.weight) - parseFloat(prevSet.weight || 0);
            const rDiff = parseInt(set.reps) - parseInt(prevSet.reps || 0);
            if (wDiff > 0) line += ` ↑ +${wDiff}kg`;
            else if (wDiff < 0) line += ` ↓ ${wDiff}kg`;
            if (rDiff > 0) line += ` ↑ +${rDiff}reps`;
            else if (rDiff < 0) line += ` ↓ ${rDiff}reps`;
          }

          lines.push(line);
        });

        if (prevEx) {
          const prevTopW = Math.max(...(prevEx.sets?.map(s => parseFloat(s.weight) || 0) || [0]));
          const curTopW = Math.max(...(ex.sets?.map(s => parseFloat(s.weight) || 0) || [0]));
          if (curTopW > prevTopW) lines.push(`    ✅ Nieuw topgewicht! ${curTopW}kg (was ${prevTopW}kg)`);
        }

        if (ex.note) lines.push(`    📝 ${ex.note}`);
        lines.push('');
      });

      if (session.globalRpe) lines.push(`Sessie RPE: ${session.globalRpe}/10`);
      if (session.globalNote) lines.push(`Notitie: ${session.globalNote}`);

    } else if (def.type === 'circuit') {
      lines.push(`CIRCUIT:`);
      def.exercises?.forEach((ex, i) => {
        lines.push(`  ${i+1}. ${ex.name} — ${ex.defaultWeight}`);
      });
      lines.push('');
      lines.push(`Ronden voltooid: ${session.rounds || '—'} / ${def.rounds}`);
      if (session.rpe) lines.push(`RPE: ${session.rpe}/10`);

      if (prev) {
        const rDiff = (session.rounds || 0) - (prev.rounds || 0);
        if (rDiff > 0) lines.push(`✅ ${rDiff} meer ronde(n) dan vorige sessie!`);
        else if (rDiff < 0) lines.push(`⬇ ${Math.abs(rDiff)} minder ronde(n) dan vorige sessie`);
        else lines.push(`→ Zelfde aantal ronden als vorige sessie`);

        const rpeDiff = (session.rpe || 5) - (prev.rpe || 5);
        if (rpeDiff < 0) lines.push(`✅ RPE ${Math.abs(rpeDiff)} lager — efficiënter!`);
        else if (rpeDiff > 0) lines.push(`⬆ RPE ${rpeDiff} hoger dan vorige sessie`);
      }

      if (session.finisher?.length > 0) {
        lines.push('');
        lines.push('FINISHER:');
        session.finisher.forEach(f => {
          lines.push(`  ${f.done ? '✓' : '✗'} ${f.name}`);
        });
      }

      if (session.note) lines.push(`\nNotitie: ${session.note}`);

    } else if (session.type === 'snacks') {
      const snackDef = SESSION_TYPES.snacks?.options?.find(o => o.id === session.snackId);
      if (snackDef) {
        lines.push(`Snack: ${snackDef.name}`);
        lines.push(`Protocol: ${snackDef.protocol}`);
        lines.push('Oefeningen:');
        snackDef.exercises.forEach(ex => lines.push(`  • ${ex}`));
        lines.push('');
      }
      lines.push(`Ronden: ${session.rounds || '—'}`);
      if (session.rpe) lines.push(`RPE: ${session.rpe}/10`);

      if (prev) {
        const rDiff = (session.rounds || 0) - (prev.rounds || 0);
        const rpeDiff = (session.rpe || 5) - (prev.rpe || 5);
        if (rDiff > 0) lines.push(`✅ Meer ronden dan vorige keer (+${rDiff})`);
        if (rpeDiff < 0) lines.push(`✅ Lager RPE — beter gerecovered of efficiënter!`);
      }

      if (session.note) lines.push(`\nNotitie: ${session.note}`);
    }

    lines.push('');
    lines.push(`───────────────────────────────────`);
    lines.push(`RPE TREND (laatste 5 sessies):`);
    const recent = DB.getAllSessions()
      .filter(s => s.type === session.type)
      .slice(0, 5);
    const rpeLine = recent.map(s => {
      const rpe = s.globalRpe || s.rpe || '—';
      const d = new Date(s.timestamp || s.date);
      return `${d.toLocaleDateString('nl-NL', {day:'numeric',month:'short'})}: ${rpe}`;
    }).join(' | ');
    lines.push(rpeLine || '— nog niet genoeg data —');

    lines.push('');
    lines.push(`═══════════════════════════════════`);
    lines.push(`[Gegenereerd door TrainLog]`);
    lines.push(`Plak dit verslag in een nieuwe chat`);
    lines.push(`voor interpretatie en advies.`);
    lines.push(`═══════════════════════════════════`);

    return lines.join('\n');
  }

  function generateAllReport() {
    const sessions = DB.getAllSessions();
    if (sessions.length === 0) return 'Geen sessies gevonden.';

    let parts = [`TRAINLOG — VOLLEDIG LOGBOEK (${sessions.length} sessies)\n`];
    sessions.slice(0, 20).forEach(s => {
      parts.push(generateReport(s));
      parts.push('\n\n');
    });
    return parts.join('');
  }

  function formatDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}sec`;
    return `${m}min${s > 0 ? ` ${s}sec` : ''}`;
  }

  return { showForSession, generateReport, generateAllReport };
})();
