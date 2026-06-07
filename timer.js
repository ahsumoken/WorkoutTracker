let timerInterval = null;
let currentSet = 1;
let currentRound = 1;
let isPause = false;
let timeLeft = 45; 
let currentPhase = "WERK"; // WERK of RUST

const workoutData = WorkoutDatabase["Kettlebell Circuit A"];
const totalExercises = workoutData.exercises.length; // 6
const totalSets = totalExercises * 3; // 18

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById('timer-display').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  
  // Progressiering updaten
  const circle = document.getElementById('timer-ring-fg');
  if (circle) {
    const maxTime = currentPhase === "WERK" ? 45 : 15;
    const offset = 552.92 - (timeLeft / maxTime) * 552.92;
    circle.style.strokeDashoffset = offset;
  }
}

function updateExerciseNames() {
  const currentExerciseIdx = (currentSet - 1) % totalExercises;
  const nextExerciseIdx = currentSet % totalExercises;
  
  document.getElementById('timer-set-info').textContent = `Set ${currentSet} / ${totalSets}`;
  document.getElementById('timer-round-info').textContent = `Ronde ${currentRound} / 3`;
  
  document.getElementById('timer-exercise-name').textContent = workoutData.exercises[currentExerciseIdx];
  
  if (currentSet < totalSets) {
    document.getElementById('timer-next-exercise-name').textContent = `Volgende: ${workoutData.exercises[nextExerciseIdx]}`;
  } else {
    document.getElementById('timer-next-exercise-name').textContent = `Laatste set!`;
  }
}

function startTimerLogic() {
  if (timerInterval) clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    if (!isPause) {
      timeLeft--;
      updateTimerDisplay();
      
      if (timeLeft <= 0) {
        if (currentPhase === "WERK") {
          // Naar rustfase
          currentPhase = "RUST";
          timeLeft = 15;
          document.getElementById('timer-phase').textContent = "RUST";
          document.getElementById('timer-phase').style.color = "#ff3333";
        } else {
          // Naar volgende werkset
          currentPhase = "WERK";
          timeLeft = 45;
          document.getElementById('timer-phase').textContent = "WERK";
          document.getElementById('timer-phase').style.color = "#00ff00";
          
          currentSet++;
          currentRound = Math.ceil(currentSet / totalExercises);
          
          if (currentSet > totalSets) {
            clearInterval(timerInterval);
            document.getElementById('modal-timer').style.display = 'none';
            alert("Workout Voltooid!");
            return;
          }
        }
        updateExerciseNames();
        updateTimerDisplay();
      }
    }
  }, 1000);
}

// Event Listeners voor de knoppen
document.getElementById('btn-start-workout').addEventListener('click', () => {
  currentSet = 1;
  currentRound = 1;
  currentPhase = "WERK";
  timeLeft = 45;
  isPause = false;
  
  document.getElementById('modal-timer').style.display = 'flex';
  document.getElementById('timer-phase').textContent = "WERK";
  
  updateExerciseNames();
  updateTimerDisplay();
  startTimerLogic();
});

document.getElementById('btn-timer-pause').addEventListener('click', () => {
  isPause = !isPause;
  document.getElementById('btn-timer-pause').textContent = isPause ? "START" : "PAUZE";
});

document.getElementById('btn-timer-stop').addEventListener('click', () => {
  clearInterval(timerInterval);
  document.getElementById('modal-timer').style.display = 'none';
});

document.getElementById('btn-timer-skip').addEventListener('click', () => {
  timeLeft = 0; // Knal direct naar 0 om de fase-wissel te triggeren
});
