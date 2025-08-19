const quizDiv = document.getElementById('quiz');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const nextBtn = document.getElementById('nextBtn');
const resultEl = document.getElementById('result');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');
const progressBar = document.getElementById('progress-bar');
const timerEl = document.getElementById('time');

let quizData = [];
let currentQuestion = 0;
let score = 0;
let timer;
let timeLeft = 15;

async function fetchQuestions() {
  try {
    const res = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
    const data = await res.json();
    quizData = data.results.map(q => {
      
      const decode = str => new DOMParser().parseFromString(str, 'text/html').documentElement.textContent;
      const options = [...q.incorrect_answers.map(decode), decode(q.correct_answer)];
      return {
        question: decode(q.question),
        options: shuffleArray(options),
        answer: decode(q.correct_answer)
      };
    });
    loadQuestion();
  } catch (err) {
    questionEl.textContent = 'Failed to fetch quiz questions.';
    console.error(err);
  }
}


function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function loadQuestion() {
  const currentQuiz = quizData[currentQuestion];
  questionEl.textContent = currentQuiz.question;
  optionsEl.innerHTML = '';
  nextBtn.disabled = true;
  timeLeft = 15;
  timerEl.textContent = timeLeft;

  currentQuiz.options.forEach(option => {
    const li = document.createElement('li');
    li.textContent = option;
    li.addEventListener('click', () => selectOption(li, currentQuiz.answer));
    optionsEl.appendChild(li);
  });

  startTimer();
  updateProgressBar();
}

function selectOption(selectedLi, correctAnswer) {
  const allOptions = optionsEl.querySelectorAll('li');
  allOptions.forEach(li => li.style.pointerEvents = 'none');
  clearInterval(timer);

  if(selectedLi.textContent === correctAnswer) {
    selectedLi.classList.add('correct');
    score++;
  } else {
    selectedLi.classList.add('wrong');
    allOptions.forEach(li => {
      if(li.textContent === correctAnswer) li.classList.add('correct');
    });
  }
  nextBtn.disabled = false;
}

function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if(timeLeft <= 0) {
      clearInterval(timer);
      const correctAnswer = quizData[currentQuestion].answer;
      optionsEl.querySelectorAll('li').forEach(li => {
        li.style.pointerEvents = 'none';
        if(li.textContent === correctAnswer) li.classList.add('correct');
      });
      nextBtn.disabled = false;
    }
  }, 1000);
}

function updateProgressBar() {
  const progressPercent = ((currentQuestion)/quizData.length) * 100;
  progressBar.style.width = `${progressPercent}%`;
}

nextBtn.addEventListener('click', () => {
  currentQuestion++;
  if(currentQuestion < quizData.length) {
    loadQuestion();
  } else {
    showResult();
  }
});

function showResult() {
  quizDiv.style.display = 'none';
  resultEl.classList.remove('hidden');
  scoreEl.textContent = `${score} / ${quizData.length} (${Math.round((score/quizData.length)*100)}%)`;
}

restartBtn.addEventListener('click', () => {
  currentQuestion = 0;
  score = 0;
  resultEl.classList.add('hidden');
  quizDiv.style.display = 'block';
  fetchQuestions();
});

fetchQuestions();
