const SESSION_TYPES = {
  'compounds-a': {
    name: 'Compounds A',
    type: 'gym',
    exercises: [
      { id: 'squat', name: 'Barbell Squat', sets: 4, reps: '6-8' },
      { id: 'deadlift', name: 'Conventional Deadlift', sets: 3, reps: '5' },
      { id: 'bench', name: 'Barbell Bench Press', sets: 4, reps: '6-8' },
      { id: 'row', name: 'Barbell Row', sets: 3, reps: '8-10' },
      { id: 'ohp', name: 'Overhead Press', sets: 3, reps: '8-10' }
    ]
  },
  'compounds-b': {
    name: 'Compounds B',
    type: 'gym',
    exercises: [
      { id: 'rdl', name: 'Romanian Deadlift', sets: 4, reps: '8-10' },
      { id: 'incline', name: 'Incline DB Press', sets: 4, reps: '8-10' },
      { id: 'pullup', name: 'Weighted Pull-up', sets: 4, reps: '6-8' },
      { id: 'lateral', name: 'Lateral Raise', sets: 3, reps: '12-15' },
      { id: 'biceps', name: 'Incline DB Curl', sets: 3, reps: '10-12' },
      { id: 'triceps', name: 'Triceps Overhead Extension', sets: 3, reps: '10-12' }
    ]
  },
  'kettlebell': {
    name: 'Kettlebell Circuit A',
    type: 'circuit',
    rounds: 3,
    workSec: 45,
    restSec: 15,
    roundRestSec: 60,
    exercises: [
      { name: 'KB Two-Handed Swing', defaultWeight: '20kg' },
      { name: 'KB Goblet Squat', defaultWeight: '20kg' },
      { name: 'KB Overhead Press (R)', defaultWeight: '16kg' },
      { name: 'KB Overhead Press (L)', defaultWeight: '16kg' },
      { name: 'Burpees', defaultWeight: 'eigen gew.' },
      { name: 'KB Deadlifts', defaultWeight: '2x20kg' },
      { name: 'KB Gorilla Row', defaultWeight: '2x20kg' },
    ],
    finisher: [
      { name: 'Negatieve Pull-ups' },
      { name: 'Ab Wheel Rollouts' }
    ]
  },
  'kettlebell-b': {
    name: 'Kettlebell Circuit B',
    type: 'circuit',
    rounds: 3,
    workSec: 45,
    restSec: 15,
    roundRestSec: 60,
    exercises: [
      { name: 'KB Sumo Deadlift', defaultWeight: '2x20kg' },
      { name: 'KB Bulgarian Split Squat (R)', defaultWeight: '16kg' },
      { name: 'KB Bulgarian Split Squat (L)', defaultWeight: '16kg' },
      { name: 'KB Push Press (R)', defaultWeight: '20kg' },
      { name: 'KB Push Press (L)', defaultWeight: '20kg' },
      { name: 'KB Hand-to-Hand Swing', defaultWeight: '20kg' },
      { name: 'KB Clean & Thruster (R)', defaultWeight: '16kg' },
      { name: 'KB Clean & Thruster (L)', defaultWeight: '16kg' }
    ]
  },
  'kb-kracht': {
    name: 'KB Kracht',
    type: 'gym',
    exercises: [
      { id: 'kb-frontsquat', name: 'KB Front Squat (2 KB)', sets: 4, reps: '6-8' },
      { id: 'kb-rdl', name: 'KB Romanian Deadlift (2 KB)', sets: 4, reps: '6-8' },
      { id: 'kb-press', name: 'KB Strict Press (2 KB)', sets: 4, reps: '6-8' },
      { id: 'kb-row', name: 'KB Bent-Over Row (2 KB)', sets: 4, reps: '8-10' },
      { id: 'kb-gobletsquat', name: 'KB Goblet Squat (zwaar)', sets: 3, reps: '8-10' },
      { id: 'kb-pullup', name: 'Pull-up / Ring Row', sets: 3, reps: 'AMRAP' }
    ]
  },
  'kb-flow': {
    name: 'KB Flow',
    type: 'circuit',
    rounds: 4,
    workSec: 40,
    restSec: 0,
    roundRestSec: 90,
    exercises: [
      { name: '1. Curl vanuit hurk (2 KB)', defaultWeight: '2x16kg' },
      { name: '2. Front Squat', defaultWeight: '2x16kg' },
      { name: '3. KB Swing', defaultWeight: '2x16kg' },
      { name: '4. Snatch naar rack', defaultWeight: '2x16kg' },
      { name: '5. Swing (neergaand)', defaultWeight: '2x16kg' },
      { name: '6. Deadlift (neergaand)', defaultWeight: '2x16kg' },
      { name: '7. Gorilla Row', defaultWeight: '2x16kg' },
      { name: '8. Plank + Push-up', defaultWeight: '2x16kg' },
      { name: '9. Renegade Row', defaultWeight: '2x16kg' }
    ]
  },
  'kb-flow-terra': {
    name: 'KB Flow TERRAFLOW',
    type: 'circuit',
    rounds: 4,
    workSec: 40,
    restSec: 0,
    roundRestSec: 90,
    flowSingle: true,
    exercises: [
      { name: '1. Swingclean', defaultWeight: '16kg' },
      { name: '2. Lateral Clean', defaultWeight: '16kg' },
      { name: '3. Single-arm Hip Hinge Swing', defaultWeight: '16kg' },
      { name: '4. Bottoms-up Horn Grip Clean', defaultWeight: '16kg' },
      { name: '5. Slasher', defaultWeight: '16kg' }
    ]
  },
  'kb-flow-spezia': {
    name: 'KB Flow La Spezia',
    type: 'circuit',
    rounds: 4,
    workSec: 40,
    restSec: 0,
    roundRestSec: 90,
    flowSingle: true,
    exercises: [
      { name: '1. Squat', defaultWeight: '16kg' },
      { name: '2. Dead Curl', defaultWeight: '16kg' },
      { name: '3. Stand Up', defaultWeight: '16kg' },
      { name: '4. Lateral Clean', defaultWeight: '16kg' },
      { name: '5. Lateral Snatch', defaultWeight: '16kg' },
      { name: '6. Circular Clean', defaultWeight: '16kg' },
      { name: '7. Return to Dead', defaultWeight: '16kg' }
    ]
  },
  'horse-legs': {
    name: 'Muay Thai Horse Legs',
    type: 'circuit',
    rounds: 3,
    workSec: 0,
    restSec: 20,
    roundRestSec: 150,
    repsBased: true,
    exercises: [
      { name: 'Lunges met kniestoten (20x, 10 p/kant)', defaultWeight: 'eigen gew.' },
      { name: 'Reguliere Squats (50x)', defaultWeight: 'eigen gew.' },
      { name: 'Kneeling Sissy Squats (10x)', defaultWeight: 'eigen gew.' },
      { name: 'Knie-naar-sprong / Kneeling Jump (10x)', defaultWeight: 'eigen gew.' },
      { name: 'Wisselsprongen / Jumping Lunges (20x, 10 p/kant)', defaultWeight: 'eigen gew.' },
      { name: 'Squats met sprong / Jump Squats (20x)', defaultWeight: 'eigen gew.' },
      { name: 'Kuitheffen / Calf Raises (20x)', defaultWeight: 'eigen gew.' }
    ]
  },
  'alan-a': {
    name: 'Alan Hanik A',
    type: 'circuit',
    rounds: 3,
    workSec: 45,
    restSec: 15,
    roundRestSec: 60,
    exercises: [
      { name: 'Deficit KB Step-up (R)', defaultWeight: '2x16kg' },
      { name: 'Deficit KB Step-up (L)', defaultWeight: '2x16kg' },
      { name: 'KB Romanian Deadlift', defaultWeight: '2x20kg' },
      { name: 'KB Front Squat', defaultWeight: '2x20kg' },
      { name: 'Feet-Elevated Push-up', defaultWeight: 'eigen gew.' },
      { name: 'Inverted Ring Row', defaultWeight: 'eigen gew.' }
    ]
  },
  'alan-b': {
    name: 'Alan Hanik B',
    type: 'circuit',
    rounds: 3,
    workSec: 45,
    restSec: 15,
    roundRestSec: 60,
    exercises: [
      { name: 'KB Walking Lunge', defaultWeight: '2x16kg' },
      { name: 'KB Cleans', defaultWeight: '2x20kg' },
      { name: 'Heavy KB Swing', defaultWeight: '20kg' },
      { name: 'Ring Dip (Assisted)', defaultWeight: 'eigen gew.' },
      { name: 'KB Airborne Split Squat (R)', defaultWeight: '12kg' },
      { name: 'KB Airborne Split Squat (L)', defaultWeight: '12kg' }
    ]
  },
  'spartan-50': {
    name: 'The Spartan 50',
    type: 'circuit',
    rounds: 1,
    workSec: 0,
    restSec: 0,
    exercises: [
      { name: 'Burpee (3 Push-ups) + 3 Jump Squats', defaultWeight: 'Vest 10kg' }
    ]
  },
  'bodyweight-murph': {
    name: 'Bodyweight Murph Variant',
    type: 'circuit',
    rounds: 10,
    workSec: 0,
    restSec: 0,
    exercises: [
      { name: 'Negatieve Pull-ups', defaultWeight: 'Vest 10kg' },
      { name: 'Dips / Push-ups', defaultWeight: 'Vest 10kg' },
      { name: 'Air Squats', defaultWeight: 'Vest 10kg' }
    ]
  },
  'kb-rope-amrap': {
    name: 'KB & Springtouw AMRAP',
    type: 'circuit',
    rounds: 1,
    workSec: 1200,
    restSec: 0,
    exercises: [
      { name: 'Double Unders / Cleans / Front Squats / Presses', defaultWeight: '20kg' }
    ]
  },
  'ring-quest': {
    name: 'The Ring Quest',
    type: 'circuit',
    rounds: 3,
    workSec: 0,
    restSec: 90,
    exercises: [
      { name: 'Inverted Ring Rows', defaultWeight: 'eigen gew.' },
      { name: 'Assisted Pull-ups (Bar)', defaultWeight: 'eigen gew.' },
      { name: 'Ring Support Holds', defaultWeight: 'eigen gew.' },
      { name: 'Push-ups on Rings', defaultWeight: 'eigen gew.' },
      { name: 'Hanging Leg Raises', defaultWeight: 'eigen gew.' }
    ]
  },
  'snacks': {
    name: 'Kettlebell Snacks',
    type: 'snacks',
    options: [
      { id: 'snack-power', name: 'KB Power Snack', duration: '5 min', protocol: '10 Swings + 5 Burpees elke minuut (EMOM)', rounds: 5, restSec: 60, exercises: ['10 Live Swings + 5 Burpees'] },
      { id: 'snack-upper', name: 'KB Upper Body Snack', duration: '8 min', protocol: 'AMRAP van Clean, Press en Halo', rounds: 1, restSec: 480, exercises: ['Clean + Press + Halo AMRAP'] },
      { id: 'snack-lower', name: 'KB Lower Body Snack', duration: '6 min', protocol: 'Goblet Squats en Lunges non-stop', rounds: 6, restSec: 60, exercises: ['Goblet Squats + Lunges'] },
      { id: 'snack-core', name: 'KB Core Snack', duration: '5 min', protocol: 'Planks en Slingshots rondom het lichaam', rounds: 5, restSec: 60, exercises: ['Plank + Slingshot Combo'] },
      { id: 'snack-full', name: 'KB Full Body Snack', duration: '10 min', protocol: 'Thrusters en Swings piramide', rounds: 1, restSec: 600, exercises: ['Thrusters + Swings Piramide'] }
    ]
  }
};

/* ============================================================
   BEWEGINGSPATROON-CLASSIFICATIE
   Gebaseerd op de 7-patronen-standaard (StrongFirst / functional
   fitness): hinge, squat, lunge, push, pull, carry, rotation,
   anti-rotation, + locomotion (hardlopen/wandelen).

   ONDERHOUD: nieuwe oefening toevoegen? Meestal hoef je niets te
   doen — de trefwoord-map hieronder herkent 'swing', 'squat',
   'press' etc. automatisch. Alleen samengestelde bewegingen
   (clean & press, thruster, burpee) staan in PATTERN_OVERRIDES.
   ============================================================ */

const MOVEMENT_PATTERNS = {
  hinge:        { label: 'Hinge',         color: '#f97316' },
  squat:        { label: 'Squat',         color: '#06b6d4' },
  lunge:        { label: 'Lunge',         color: '#22c55e' },
  push:         { label: 'Push',          color: '#a855f7' },
  pull:         { label: 'Pull',          color: '#3b82f6' },
  carry:        { label: 'Carry',         color: '#eab308' },
  rotation:     { label: 'Rotatie',       color: '#ec4899' },
  'anti-rotation': { label: 'Anti-rotatie', color: '#f43f5e' },
  locomotion:   { label: 'Locomotie',     color: '#14b8a6' },
  core:         { label: 'Core',          color: '#64748b' }
};

// Sessie -> modaliteit (hoofdcategorie)
const SESSION_CATEGORY = {
  'compounds-a': 'kracht', 'compounds-b': 'kracht', 'kb-kracht': 'kracht',
  'kettlebell': 'conditie', 'kettlebell-b': 'conditie',
  'alan-a': 'conditie', 'alan-b': 'conditie',
  'kb-flow': 'flow', 'kb-flow-terra': 'flow', 'kb-flow-spezia': 'flow',
  'horse-legs': 'conditie',
  'spartan-50': 'conditie', 'bodyweight-murph': 'conditie',
  'kb-rope-amrap': 'conditie', 'ring-quest': 'kracht',
  'snacks': 'snack'
};

const CATEGORY_LABELS = {
  kracht:   { label: 'KRACHT',   color: '#a855f7' },
  conditie: { label: 'CONDITIE', color: '#f97316' },
  flow:     { label: 'FLOW',     color: '#06b6d4' },
  snack:    { label: 'SNACKS',   color: '#eab308' }
};

const CARD_META = {
  'compounds-a': { accent: "var(--accent-blue)", tag: "GYM A", name: "Compounds A", sub: "Squat · Deadlift · Bench · Row · OHP", sets: "6 oefeningen · ~60 min" },
  'compounds-b': { accent: "var(--accent-cyan)", tag: "GYM B", name: "Compounds B", sub: "RDL · Incline · Pull-up · Press", sets: "7 oefeningen · ~65 min" },
  'kettlebell': { accent: "var(--accent-orange)", tag: "CIRCUIT A", name: "Kettlebell Circuit A", sub: "18 sets · 0:45/0:15 · 3 ronden", sets: "6 oefeningen + finisher" },
  'kettlebell-b': { accent: "var(--accent-orange)", tag: "CIRCUIT B", name: "Kettlebell Circuit B", sub: "Sumo · Split Squat · Push Press · Thrusters", sets: "24 sets · 0:45/0:15 · 3 ronden" },
  'kb-kracht': { accent: "var(--accent-red)", tag: "KB KRACHT", name: "KB Kracht", sub: "Front Squat · RDL · Press · Row · zwaar/laag", sets: "6 oefeningen · log kg & reps" },
  'kb-flow': { accent: "var(--accent-orange)", tag: "FLOW", name: "KB Flow", sub: "Curl → Squat → Swing → Snatch → Row → Plank", sets: "9 bewegingen · 1 doorlopende keten · 4 ronden" },
  'kb-flow-terra': { accent: "var(--accent-orange)", tag: "FLOW · TERRA", name: "TERRAFLOW", sub: "Swingclean → Lateral Clean → Slasher", sets: "5 bewegingen · enkele KB · Cavemantraining" },
  'kb-flow-spezia': { accent: "var(--accent-orange)", tag: "FLOW · SPEZIA", name: "La Spezia Flow", sub: "Squat → Dead Curl → Snatch → Return", sets: "7 bewegingen · enkele KB · Cavemantraining" },
  'horse-legs': { accent: "var(--accent-red)", tag: "MUAY THAI", name: "Horse Legs", sub: "Lunges · Squats · Jumps · Calf Raises", sets: "7 oefeningen · reps · 3 ronden" },
  'alan-a': { accent: "var(--accent-purple)", tag: "ALAN A", name: "Alan Hanik A", sub: "Step-up · RDL · Squat · Push-up", sets: "18 sets · 0:45/0:15 · 3 ronden" },
  'alan-b': { accent: "var(--accent-green)", tag: "ALAN B", name: "Alan Hanik B", sub: "Lunge · Swing · Ring Row · Split Squat", sets: "18 sets · 0:45/0:15 · 3 ronden" },
  'spartan-50': { accent: "var(--accent-red)", tag: "SPARTAN 50", name: "The Spartan 50", sub: "Burpees (3 Push-ups) + 3 Jump Squats", sets: "1 set · Gewichtsvest" },
  'bodyweight-murph': { accent: "var(--accent-indigo)", tag: "MURPH", name: "Bodyweight Murph Variant", sub: "Negatieve Pull-ups · Dips · Air Squats", sets: "30 sets · 10 ronden · Met Vest" },
  'kb-rope-amrap': { accent: "var(--accent-rose)", tag: "AMRAP", name: "KB & Springtouw AMRAP", sub: "Double Unders · Cleans · Front Squats · Presses", sets: "20 minuten · Maximaal resultaat" },
  'ring-quest': { accent: "var(--accent-sky)", tag: "RING QUEST", name: "The Ring Quest", sub: "Ring Rows · Assisted Pull-ups · Support Holds", sets: "5 oefeningen · Kracht & Controle" },
  'snacks': { accent: "var(--accent-yellow)", tag: "SNACK", name: "Kettlebell Snacks", sub: "5 mini-workouts · 5-10 min", sets: "Power · Upper · Lower · Core · Full Body" },
};

// Expliciete overrides voor samengestelde/dubbelzinnige bewegingen.
// Sleutel = kleine-letter substring die in de oefeningnaam voorkomt.
const PATTERN_OVERRIDES = [
  { match: 'clean & thruster', patterns: ['hinge','squat','push'] },
  { match: 'clean & press',    patterns: ['hinge','push'] },
  { match: 'thruster',         patterns: ['squat','push'] },
  { match: 'curl',             patterns: ['hinge','pull'] },       // curl vanuit hurk / dead curl
  { match: 'burpee',           patterns: ['squat','push','locomotion'] },
  { match: 'renegade row',     patterns: ['pull','anti-rotation'] },
  { match: 'gorilla row',      patterns: ['hinge','pull'] },
  { match: 'plank + push-up',  patterns: ['push','anti-rotation','core'] },
  { match: 'hand-to-hand',     patterns: ['hinge','anti-rotation'] },
  { match: 'single-arm',       patterns: ['hinge','anti-rotation'] },
  { match: 'slasher',          patterns: ['rotation','hinge'] },
  { match: 'halo',             patterns: ['rotation','core'] },
  { match: 'windmill',         patterns: ['rotation','core'] },
  { match: 'snatch',           patterns: ['hinge','push'] },
  { match: 'step-up',          patterns: ['lunge'] },
  { match: 'sumo deadlift',    patterns: ['hinge','squat'] },
  { match: 'sissy squat',      patterns: ['squat'] },
  { match: 'kneeling jump',    patterns: ['squat','locomotion'] },
  { match: 'knie-naar-sprong', patterns: ['squat','locomotion'] },
  { match: 'jump squat',       patterns: ['squat','locomotion'] },
  { match: 'jumping lunge',    patterns: ['lunge','locomotion'] },
  { match: 'wisselsprongen',   patterns: ['lunge','locomotion'] },
  { match: 'kniestoten',       patterns: ['lunge','core'] },
  { match: 'ab wheel',         patterns: ['core','anti-rotation'] },
  { match: 'hanging leg raise', patterns: ['core'] },
  { match: 'plank',            patterns: ['core','anti-rotation'] },
  { match: 'support hold',     patterns: ['push','core'] }
];

// Trefwoord -> patroon (fallback als geen override matcht).
const PATTERN_KEYWORDS = [
  { kw: 'swing',        p: ['hinge'] },
  { kw: 'clean',        p: ['hinge'] },
  { kw: 'deadlift',     p: ['hinge'] },
  { kw: 'romanian',     p: ['hinge'] },
  { kw: 'rdl',          p: ['hinge'] },
  { kw: 'hip hinge',    p: ['hinge'] },
  { kw: 'goblet squat', p: ['squat'] },
  { kw: 'front squat',  p: ['squat'] },
  { kw: 'split squat',  p: ['lunge'] },
  { kw: 'airborne',     p: ['lunge'] },
  { kw: 'squat',        p: ['squat'] },
  { kw: 'air squat',    p: ['squat'] },
  { kw: 'lunge',        p: ['lunge'] },
  { kw: 'press',        p: ['push'] },
  { kw: 'push press',   p: ['push'] },
  { kw: 'bench',        p: ['push'] },
  { kw: 'push-up',      p: ['push'] },
  { kw: 'push up',      p: ['push'] },
  { kw: 'dip',          p: ['push'] },
  { kw: 'lateral raise', p: ['push'] },
  { kw: 'triceps',      p: ['push'] },
  { kw: 'row',          p: ['pull'] },
  { kw: 'pull-up',      p: ['pull'] },
  { kw: 'pull up',      p: ['pull'] },
  { kw: 'pullup',       p: ['pull'] },
  { kw: 'pulldown',     p: ['pull'] },
  { kw: 'carry',        p: ['carry'] },
  { kw: 'waiter',       p: ['carry'] },
  { kw: 'farmer',       p: ['carry'] },
  { kw: 'calf',         p: ['locomotion'] },
  { kw: 'kuitheffen',   p: ['locomotion'] },
  { kw: 'run',          p: ['locomotion'] },
  { kw: 'double under',  p: ['locomotion'] }
];

// Bepaal patronen voor een oefeningnaam.
function getPatterns(name) {
  if (!name) return [];
  const n = name.toLowerCase();
  const found = new Set();
  // 1) overrides eerst (samengestelde bewegingen)
  PATTERN_OVERRIDES.forEach(o => { if (n.includes(o.match)) o.patterns.forEach(p => found.add(p)); });
  // 2) trefwoorden (vullen aan, dubbele worden door de Set genegeerd)
  PATTERN_KEYWORDS.forEach(k => { if (n.includes(k.kw)) k.p.forEach(p => found.add(p)); });
  return [...found];
}

const DB = (() => {
  const KEY = 'trainlog_workout_history';
  function getAll() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch(e) { return []; } }
  function saveSession(s) { const all = getAll(); all.unshift(s); localStorage.setItem(KEY, JSON.stringify(all)); }
  function getLastByType(t) { return getAll().find(s => s.type === t) || null; }
  return { getAll, saveSession, getLastByType };
})();
