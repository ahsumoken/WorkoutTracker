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
      { name: 'KB Sumo Deadlift', defaultWeight: '32kg' },
      { name: 'KB Bulgarian Split Squat (R)', defaultWeight: '16kg' },
      { name: 'KB Bulgarian Split Squat (L)', defaultWeight: '16kg' },
      { name: 'KB Push Press (R)', defaultWeight: '20kg' },
      { name: 'KB Push Press (L)', defaultWeight: '20kg' },
      { name: 'KB Hand-to-Hand Swing', defaultWeight: '24kg' },
      { name: 'KB Clean & Thruster (R)', defaultWeight: '16kg' },
      { name: 'KB Clean & Thruster (L)', defaultWeight: '16kg' }
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
      { name: 'KB Romanian Deadlift', defaultWeight: '2x24kg' },
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
      { name: 'Heavy KB Swing', defaultWeight: '40kg' },
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
      { name: 'Double Unders / Cleans / Front Squats / Presses', defaultWeight: '24kg' }
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

const DB = (() => {
  const KEY = 'trainlog_workout_history';
  function getAll() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch(e) { return []; } }
  function saveSession(s) { const all = getAll(); all.unshift(s); localStorage.setItem(KEY, JSON.stringify(all)); }
  function getLastByType(t) { return getAll().find(s => s.type === t) || null; }
  return { getAll, saveSession, getLastByType };
})();
