const WorkoutDatabase = {
  "Kettlebell Circuit A": {
    meta: "18 sets · 45s werk / 15s rust · 3 ronden",
    exercises: [
      "Kettlebell Swing (20kg)",
      "Goblet Squat (20kg)",
      "Clean & Press (2x16kg)",
      "Burpees (Eigen gewicht)",
      "Romanian Deadlift (2x20kg)",
      "Renegade Row (2x16kg)"
    ],
    finisher: "3x10 Negatieve Pull-ups & 3x10 Bench Dips"
  }
};

// Zorgt ervoor dat de app direct de juiste lijst pakt en toont op het scherm
function getWorkoutForToday() {
  return WorkoutDatabase["Kettlebell Circuit A"];
}

// UI herstel: Overschrijft de foute elementen in het scherm direct met de juiste data
function fixTrainLogUI() {
  const workout = WorkoutDatabase["Kettlebell Circuit A"];
  
  // Herstel meta-data bovenin
  const metaEl = document.querySelector('.workout-meta') || document.querySelector('.subtitle');
  if (metaEl) metaEl.textContent = workout.meta;

  // Herstel de oefeningenlijst (Burpees erin, push-ups en foute gewichten eruit)
  const listContainer = document.querySelector('.exercises-list') || document.getElementById('exercises-container');
  if (listContainer) {
    listContainer.innerHTML = '';
    workout.exercises.forEach((ex, idx) => {
      const nameOnly = ex.split(' (')[0];
      const weightOnly = ex.includes('(') ? ex.split('(')[1].replace(')', '') : 'eigen gew.';
      
      listContainer.innerHTML += `
        <div class="exercise-row">
          <span class="ex-num">${idx + 1}</span>
          <span class="ex-name">${nameOnly}</span>
          <span class="ex-weight">${weightOnly}</span>
        </div>
      `;
    });
  }

  // Herstel de finisher onderin (Bench Dips erin, Ab Wheel eruit)
  const finisherContainer = document.querySelector('.finisher-list') || document.getElementById('finisher-container');
  if (finisherContainer) {
    finisherContainer.innerHTML = `
      <div class="finisher-row"><span>3 x 10 Negatieve Pull-ups</span></div>
      <div class="finisher-row"><span>3 x 10 Bench Dips</span></div>
    `;
  }
}

// Direct uitvoeren bij laden
document.addEventListener('DOMContentLoaded', fixTrainLogUI);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  fixTrainLogUI();
}
