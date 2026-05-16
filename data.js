// ─── SESSION DEFINITIONS ───────────────────────────────────────────────────

const SESSION_TYPES = {
  'compounds-a': {
    name: 'Compounds A',
    tag: 'GYM A',
    color: '#3b82f6',
    type: 'gym',
    exercises: [
      { id: 'squat',    name: 'Squat',        sets: 4, reps: '8-10', note: '' },
      { id: 'deadlift', name: 'Deadlift',      sets: 3, reps: '6-8',  note: '' },
      { id: 'bench',    name: 'Bench Press',   sets: 4, reps: '8-10', note: '' },
      { id: 'bbrow',    name: 'Barbell Row',   sets: 4, reps: '8-10', note: '' },
      { id: 'ohp',      name: 'OHP',           sets: 3, reps: '10-12',note: '' },
      { id: 'plank',    name: 'Plank',         sets: 3, reps: '45sec',note: 'tijd in sec' },
    ]
  },
  'compounds-b': {
    name: 'Compounds B',
    tag: 'GYM B',
    color: '#06b6d4',
    type: 'gym',
    exercises: [
      { id: 'rdl',      name: 'RDL',                 sets: 4, reps: '10-12', note: '' },
      { id: 'incbench', name: 'Incline Bench',        sets: 4, reps: '10-12', note: '' },
      { id: 'pullup',   name: 'Pull-up / Lat Pulldown', sets: 4, reps: '8-10', note: '' },
      { id: 'dbshoulder', name: 'DB Shoulder Press',  sets: 3, reps: '12-15', note: '' },
      { id: 'latraise', name: 'Lateral Raise',        sets: 3, reps: '15',    note: '' },
      { id: 'cablerow', name: 'Cable Row',            sets: 3, reps: '12-15', note: '' },
      { id: 'abwheel',  name: 'Ab Wheel',             sets: 3, reps: '12-15', note: '' },
    ]
  },
  'kettlebell': {
    name: 'Kettlebell Circuit',
    tag: 'CIRCUIT',
    color: '#f97316',
    type: 'circuit',
    rounds: 3,
    workSec: 45,
    restSec: 15,
    roundRestSec: 90,
    exercises: [
      { id: 'kbswing',  name: 'Kettlebell Swing',    defaultWeight: '20kg' },
      { id: 'goblet',   name: 'Goblet Squat',        defaultWeight: '20kg' },
      { id: 'cp',       name: 'Clean & Press',       defaultWeight: '2x16kg' },
      { id: 'burpees',  name: 'Burpees',             defaultWeight: 'eigen gewicht' },
      { id: 'kbrdl',    name: 'Romanian Deadlift',   defaultWeight: '2x20kg' },
      { id: 'renrow',   name: 'Renegade Row',        defaultWeight: '2x16kg' },
    ],
    finisher: [
      { name: '3x10 Negatieve Pull-ups', done: false },
      { name: '3x10 Bench Dips', done: false },
    ]
  },
  'alan-a': {
    name: 'Alan Hanik A',
    tag: 'ALAN A',
    color: '#a855f7',
    type: 'circuit',
    rounds: 3,
    workSec: 45,
    restSec: 15,
    roundRestSec: 90,
    exercises: [
      { id: 'stepupcurl', name: 'Step-up + KB Curl',      defaultWeight: '1x16kg' },
      { id: 'aardl',      name: 'Romanian Deadlift',      defaultWeight: '2x20kg' },
      { id: 'aagoblet',   name: 'Goblet Squat',           defaultWeight: '20kg' },
      { id: 'pushup',     name: 'Push-up normaal',        defaultWeight: 'eigen gewicht' },
      { id: 'negpull',    name: 'Negatieve Pull-up',      defaultWeight: 'eigen gewicht' },
      { id: 'aaburpees',  name: 'Burpees',                defaultWeight: 'eigen gewicht' },
    ],
    finisher: null
  },
  'alan-b': {
    name: 'Alan Hanik B',
    tag: 'ALAN B',
    color: '#22c55e',
    type: 'circuit',
    rounds: 3,
    workSec: 45,
    restSec: 15,
    roundRestSec: 90,
    exercises: [
      { id: 'lungecurl',  name: 'Lunge + KB Curl',        defaultWeight: '1x16kg' },
      { id: 'abswing',    name: 'Kettlebell Swing',       defaultWeight: '20kg' },
      { id: 'ringrow',    name: 'Ring Row / TRX Row',     defaultWeight: 'eigen gewicht' },
      { id: 'elevpush',   name: 'Push-up voeten op bank', defaultWeight: 'eigen gewicht' },
      { id: 'splitsq',    name: 'Split Squat',            defaultWeight: '2x16kg' },
      { id: 'mtclimb',    name: 'Mountain Climbers',      defaultWeight: 'eigen gewicht' },
    ],
    finisher: null
  },
  'snacks': {
    name: 'Kettlebell Snacks',
    tag: 'SNACK',
    color: '#eab308',
    type: 'snacks',
    options: [
      {
        id: 'power',
        name: 'Snack 1 — Power',
        duration: '5 min',
        protocol: '5 ronden, geen rust',
        exercises: [
          'KB Swing 20kg × 10',
          'Burpees × 5',
        ]
      },
      {
        id: 'upper',
        name: 'Snack 2 — Upper Body',
        duration: '7 min',
        protocol: '3 ronden, 30sec rust',
        exercises: [
          'Renegade Row 2×16kg × 10',
          'Clean & Press 2×16kg × 10',
          'Bench Dips × 10',
        ]
      },
      {
        id: 'lower',
        name: 'Snack 3 — Lower Body',
        duration: '7 min',
        protocol: '3 ronden, 30sec rust',
        exercises: [
          'KB Swing 20kg × 15',
          'Goblet Squat 20kg × 10',
          'RDL 2×20kg × 10',
        ]
      },
      {
        id: 'core',
        name: 'Snack 4 — Core & Pull',
        duration: '5 min',
        protocol: '3 ronden, 30sec rust',
        exercises: [
          'Negatieve pull-ups × 10',
          'Renegade Row 2×16kg × 10',
        ]
      },
      {
        id: 'fullbody',
        name: 'Snack 5 — Full Body Express',
        duration: '10 min',
        protocol: 'AMRAP',
        exercises: [
          'KB Swing 20kg × 10',
          'Goblet Squat 20kg × 5',
          'Burpees × 5',
          'Clean & Press 2×16kg × 5',
        ]
      },
    ]
  }
};

// ─── STORAGE HELPERS ───────────────────────────────────────────────────────

const DB = {
  SESSIONS_KEY: 'trainlog_sessions',

  getSessions() {
    try {
      return JSON.parse(localStorage.getItem(this.SESSIONS_KEY) || '[]');
    } catch { return []; }
  },

  saveSession(session) {
    const sessions = this.getSessions();
    sessions.unshift(session);
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
  },

  getLastSessionByType(type) {
    const sessions = this.getSessions();
    return sessions.find(s => s.type === type) || null;
  },

  getLastCircuitByType(type) {
    return this.getLastSessionByType(type);
  },

  getLastSnackById(snackId) {
    const sessions = this.getSessions();
    return sessions.find(s => s.type === 'snacks' && s.snackId === snackId) || null;
  },

  getAllSessions() {
    return this.getSessions();
  }
};
