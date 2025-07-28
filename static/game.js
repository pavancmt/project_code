let currentQuestions = [];
let usedQuestions = [];
let index = 0;
let correctCount = 0;
let currentLevel = 1;
let score = 0;

const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");
const levelupSound = document.getElementById("levelupSound");

async function startQuiz(topic) {
  // Fetch questions from backend
  const res = await fetch(`/api/questions?topic=${topic}`);
  let data = await res.json();
  if (!Array.isArray(data)) {
    document.getElementById("result").textContent = data.error || "Failed to load questions.";
    document.getElementById("result").style.color = "#ff5050";
    return;
  }
  currentQuestions = data;
  // Reset state
  usedQuestions = [];
  index = 0;
  correctCount = 0;
  score = 0;
  currentLevel = 1;
  document.getElementById("topic-select").style.display = "none";
  document.getElementById("quiz-box").style.display = "block";
  document.getElementById("result").textContent = "";
  document.getElementById("hint").textContent = "";
  document.getElementById("skip-btn").disabled = false;
  loadQuestion();
}

function updateProgressBar() {
  const total = currentQuestions.filter(q => q.level === currentLevel).length;
  const done = usedQuestions.filter(q => q.level === currentLevel).length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  document.getElementById("progress-bar").style.width = percent + "%";
}

function loadQuestion() {
  // Find next unused question for current level
  const q = currentQuestions.find(q => q.level === currentLevel && !usedQuestions.includes(q));
  updateProgressBar();
  if (!q) {
    document.getElementById("question").textContent = `🏁 Quiz Complete - Level ${currentLevel} cleared!`;
    document.getElementById("options").innerHTML = "";
    document.getElementById("skip-btn").disabled = true;
    updateProgressBar();
    return;
  }
  usedQuestions.push(q);
  document.getElementById("level").textContent = "Level " + currentLevel;
  document.getElementById("question").textContent = q.question;
  const optionsBox = document.getElementById("options");
  optionsBox.innerHTML = "";
  document.getElementById("hint").textContent = "";
  document.getElementById("skip-btn").disabled = false;
  q.options.forEach(opt => {
    const div = document.createElement("div");
    div.className = "option";
    div.textContent = opt;
    div.onclick = () => checkAnswer(opt, q);
    optionsBox.appendChild(div);
  });
  updateProgressBar();
}

function checkAnswer(selected, question) {
  const result = document.getElementById("result");
  const hint = document.getElementById("hint");
  const correct = question.answer;
  document.getElementById("skip-btn").disabled = true;
  if (selected === correct) {
    result.textContent = "✅ Correct! Speed Boost!";
    result.style.color = "#00ffae";
    hint.textContent = "";
    correctSound.play();
    correctCount++;
    score += 10;
    if (correctCount >= currentLevel * 2) {
      currentLevel++;
      levelupSound.play();
    }
  } else {
    result.textContent = `❌ Wrong! Correct answer: ${correct}`;
    result.style.color = "#ff5050";
    wrongSound.play();
    hint.textContent = question.hint ? `Hint: ${question.hint}` : "Hint: Try reviewing this topic!";
  }
  document.getElementById("score").textContent = `Score: ${score}`;
}

function skipQuestion() {
  document.getElementById("result").textContent = "";
  document.getElementById("hint").textContent = "";
  loadQuestion();
}

function exitQuiz() {
  // Reset state and return to topic selection
  currentQuestions = [];
  usedQuestions = [];
  index = 0;
  correctCount = 0;
  currentLevel = 1;
  score = 0;
  document.getElementById("quiz-box").style.display = "none";
  document.getElementById("topic-select").style.display = "block";
  document.getElementById("result").textContent = "";
  document.getElementById("hint").textContent = "";
  document.getElementById("question").textContent = "";
  document.getElementById("options").innerHTML = "";
  document.getElementById("score").textContent = "Score: 0";
  document.getElementById("level").textContent = "Level 1";
  document.getElementById("skip-btn").disabled = false;
  document.getElementById("progress-bar").style.width = "0%";
}

// Expose startQuiz, skipQuestion, and exitQuiz to global scope
window.startQuiz = startQuiz;
window.skipQuestion = skipQuestion;
window.exitQuiz = exitQuiz; 