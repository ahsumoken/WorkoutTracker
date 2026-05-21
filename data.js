// ─── SESSION DEFINITIONS ───────────────────────────────────────────────────

const SESSION_TYPES = {
  'compounds-a': {
    name: 'Compounds A',
    tag: 'GYM A',
    color: '#3b82f6',
    type: 'gym',
    exercises: [
      { id: 'squat',      name: 'Squat',              sets: 4, reps: '8-10'  },
      { id: 'deadlift',   name: 'Deadlift',            sets: 3, reps: '6-8'   },
      { id: 'bench',      name: 'Bench Press',         sets: 4, reps: '8-10'  },
      { id: 'bbrow',      name: 'Barbell Row',         sets: 4, reps: '8-10'  },
      { id: 'ohp',        name: 'OHP',                 sets: 3, reps: '10-12' },
      { id: 'plank',      name: 'Plank',               sets: 3, reps: '45sec' },
    ]
  },
  'compounds-b': {
    name: 'Compounds B',
    tag: 'GYM B',
    color: '#06b6d4',
    type: 'gym',
    exercises: [
      { id: 'rdl',        name: 'RDL',                     sets: 4, reps: '10-12' },
      { id: 'incbench',   name: 'Incline Bench',           sets: 4, reps: '10-12' },
      { id: 'pullup',     name: 'Pull-up / Lat Pulldown',  sets: 4, reps: '8-10'  },
      { id: 'dbshoulder', name: 'DB Shoulder Press',       sets: 3, reps: '12-15' },
      { id: 'latraise',   name: 'Lateral Raise',           sets: 3, reps: '15'    },
      { id: 'cablerow',   name: 'Cable Row',               sets: 3, reps: '12-15' },
      { id: 'abwheel',    name: 'Ab Wheel',                sets: 3, reps: '12-15' },
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
      { id: 'kbswing',  name: 'Kettlebell Swing',  defaultWeight: '20kg'        },
      { id: 'goblet',   name: 'Goblet Squat',      defaultWeight: '20kg'        },
      { id: 'cp',       name: 'Clean & Press',     defaultWeight: '2×16kg'      },
      { id: 'burpees',  name: 'Burpees',           defaultWeight: 'eigen gew.'  },
      { id: 'kbrdl',    name: 'Romanian Deadlift', defaultWeight: '2×20kg'      },
      { id: 'renrow',   name: 'Renegade Row',      defaultWeight: '2×16kg'      },
    ],
    finisher: [
      { name: '3×10 Negatieve Pull-ups' },
      { name: '3×10 Bench Dips'         },
    ]
  },
  'kettlebell-b': {
    name: 'Kettlebell Circuit B',
    tag: 'CIRCUIT B',
    color: '#f97316',
    type: 'circuit',
    rounds: 3,
    workSec: 45,
    restSec: 15,
    roundRestSec: 90,
    exercises: [
      { id: 'sumodl',     name: 'Sumo Deadlift',        defaultWeight: '2×20kg'      },
      { id: 'bulgsplit',  name: 'Bulgarian Split Squat', defaultWeight: '2×16kg'      },
      { id: 'pushpress',  name: 'Push Press',            defaultWeight: '2×16kg'      },
      { id: 'sqthruster', name: 'Squat Thrusters',       defaultWeight: '20kg'        },
      { id: 'slrdl_l',    name: 'Single Leg RDL (L)',    defaultWeight: '1×20kg'      },
      { id: 'slrdl_r',    name: 'Single Leg RDL (R)',    defaultWeight: '1×20kg'      },
      { id: 'sarow_l',    name: 'Single Arm Row (L)',    defaultWeight: '1×20kg'      },
      { id: 'sarow_r',    name: 'Single Arm Row (R)',    defaultWeight: '1×20kg'      },
    ],
    finisher: null
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
      { id: 'stepupcurl', name: 'Step-up + KB Curl',   defaultWeight: '1×16kg'     },
      { id: 'aardl',      name: 'Romanian Deadlift',   defaultWeight: '2×20kg'     },
      { id: 'aagoblet',   name: 'Goblet Squat',        defaultWeight: '20kg'       },
      { id: 'pushup',     name: 'Push-up normaal',     defaultWeight: 'eigen gew.' },
      { id: 'negpull',    name: 'Negatieve Pull-up',   defaultWeight: 'eigen gew.' },
      { id: 'aaburpees',  name: 'Burpees',             defaultWeight: 'eigen gew.' },
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
      { id: 'lungecurl',  name: 'Lunge + KB Curl',        defaultWeight: '1×16kg'     },
      { id: 'abswing',    name: 'Kettlebell Swing',       defaultWeight: '20kg'       },
      { id: 'ringrow',    name: 'Ring Row / TRX Row',     defaultWeight: 'eigen gew.' },
      { id: 'elevpush',   name: 'Push-up voeten op bank', defaultWeight: 'eigen gew.' },
      { id: 'splitsq',    name: 'Split Squat',            defaultWeight: '2×16kg'     },
      { id: 'mtclimb',    name: 'Mountain Climbers',      defaultWeight: 'eigen gew.' },
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
        protocol: '5 ronden · geen rust',
        rounds: 5,
        restSec: 0,
        exercises: [ 'KB Swing 20kg × 10', 'Burpees × 5' ]
      },
      {
        id: 'upper',
        name: 'Snack 2 — Upper Body',
        duration: '7 min',
        protocol: '3 ronden · 30sec rust',
        rounds: 3,
        restSec: 30,
        exercises: [ 'Renegade Row 2×16kg × 10', 'Clean & Press 2×16kg × 10', 'Bench Dips × 10' ]
      },
      {
        id: 'lower',
        name: 'Snack 3 — Lower Body',
        duration: '7 min',
        protocol: '3 ronden · 30sec rust',
        rounds: 3,
        restSec: 30,
        exercises: [ 'KB Swing 20kg × 15', 'Goblet Squat 20kg × 10', 'RDL 2×20kg × 10' ]
      },
      {
        id: 'core',
        name: 'Snack 4 — Core & Pull',
        duration: '5 min',
        protocol: '3 ronden · 30sec rust',
        rounds: 3,
        restSec: 30,
        exercises: [ 'Negatieve pull-ups × 10', 'Renegade Row 2×16kg × 10' ]
      },
      {
        id: 'fullbody',
        name: 'Snack 5 — Full Body Express',
        duration: '10 min',
        protocol: 'AMRAP',
        rounds: null,
        restSec: 0,
        exercises: [ 'KB Swing 20kg × 10', 'Goblet Squat 20kg × 5', 'Burpees × 5', 'Clean & Press 2×16kg × 5' ]
      },
    ]
  }
};

// ─── STORAGE ───────────────────────────────────────────────────────────────

const DB = {
  KEY: 'trainlog_sessions',

  getSessions() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); }
    catch { return []; }
  },

  saveSession(s) {
    const all = this.getSessions();
    all.unshift(s);
    localStorage.setItem(this.KEY, JSON.stringify(all));
  },

  getLastByType(type) {
    return this.getSessions().find(s => s.type === type) || null;
  },

  getLastSnack(snackId) {
    return this.getSessions().find(s => s.type === 'snacks' && s.snackId === snackId) || null;
  },

  getAll() { return this.getSessions(); }
};
