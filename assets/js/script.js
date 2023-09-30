// Handles import for questions as a JSON object
import questions from "./questions.json" assert { type: "json" };

var startMenu = document.querySelector(".start-menu");
var startButton = document.querySelector("#start-button");
var leaderboardButton = document.querySelector("#leaderboard-button");

var questionView = document.querySelector(".question");
var questionTitle = document.querySelector(".question-title");
var questionAnswers = document.querySelector(".answers");
var timerEl = document.querySelector("#time");
var timeInterval; // Global time variable to prevent overlapping conflict
var answerReply = document.querySelector("#answer-reply");
var scoreEl = document.querySelector("#score");
var submitButton = document.querySelector("#submit-answer");
var quitButton = document.querySelector("#quit-game");

var endGameView = document.querySelector("#end-game");

// List of questions, index of current question,
// and selected answer object
var questionList = questions.list;
var currentQuestion = 0;
var selectedAnswer = { default: "value" };
var secondsRemaining = 540;
var currentScore = 0;

var correctAnswer = "Correct! ✅";
var incorrectAnswer = "Incorrect! ❌";

// Implementation of the Fisher-Yates shuffle
// To randomize order of questions each game start
function fisherYates(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = i;

    // Ensures no wasted moves in the instance
    // that the same index as i is chosen
    while (j === i) {
      j = Math.floor(Math.random() * i);
    }

    // Make swap
    var palceholder = array[i];
    array[i] = array[j];
    array[j] = palceholder;
  }

  return array;
}

// Purely decorational. Fades elements in and out.
function fadeElement(element) {
  var opacity = 1; // initial opacity
  var transitionTimer = setInterval(function () {
    if (opacity <= 0.05) {
      clearInterval(transitionTimer);
      element.textContent = "";
    }
    element.style.opacity = opacity;
    element.style.filter = `alpha(opacity= ${opacity} * 100)`;
    opacity -= opacity * 0.05;
  }, 20);
}

// Needs work
function endScreen() {
  questionView.removeAttribute("style", "display: none");
  endGameView.setAttribute("style", "display: flex");
}

function countdown() {
  // Prevents delay in load time,
  timerEl.textContent = "#:##";
  secondsRemaining = 60;

  timeInterval = setInterval(function () {
    // If 60 seconds, should display "1:00" and then "0:59" sequentially to 0
    //
    //  [Integer division of 60 to get minutes]
    // : [Modulo time % 60 with minimum padding of 2 characters with slice]
    timerEl.textContent =
      Math.floor(secondsRemaining / 60) +
      ":" +
      ("00" + (secondsRemaining % 60)).slice(-2);

    // Displays time in red when running low
    if (timerEl.textContent === "0:10") {
      timerEl.setAttribute("style", "color: red");
    }

    // Stop timer and go to endScreen if user fails
    if (secondsRemaining === 0) {
      timerEl.textContent = "";
      timerEl.removeAttribute("style", "color: red");
      clearInterval(timeInterval);
      endScreen();
    }

    secondsRemaining--;
  }, 1000);
}

// Gets answer information and time remaining
// to calculate how many points the user
// earned. Only called by submitButton event listener,
// abstracted for readability.
function updateScore() {
  // Signifies default value, prints 0's to scoreEl
  if (selectedAnswer === `{ default: "value" }`) {
    scoreEl.textContent = ("00000" + currentScore).slice(-5);
  }

  // User earns points with remaining time / 5 + 250 for right answer
  // as well as 15 additional seconds to their quiz time
  if (selectedAnswer["correct"] === true) {
    currentScore += Math.floor(secondsRemaining / 5) + 250;
    scoreEl.textContent = ("00000" + currentScore).slice(-5);
    secondsRemaining += 15;
  }
}

// Takes in index of question child and occupies text
// fields with corresponding values
function fillQuestion() {
  questionTitle.textContent = questionList[currentQuestion].questionPrompt;

  // Shuffle answers in random order for
  // each occurance and fills text conent
  var answers = fisherYates(questionList[currentQuestion].answers);
  for (var i = 0; i < 4; i++) {
    questionAnswers.children[i].textContent = answers[i].text;
  }
}

// Hides main menu and displays questions
startButton.addEventListener("click", function () {
  currentScore = 0; // Reset score if previous game was played
  scoreEl.textContent = "00000"; // Reset score display
  questionList = fisherYates(questionList);
  fillQuestion();
  startMenu.setAttribute("style", "display: none");
  questionView.setAttribute("style", "display: flex");
  countdown();
});

// Monitors user activity for selected answer and stores
// corresponding selection's data in selectedAnswer
questionAnswers.addEventListener("click", function () {
  var answerIndex = document.activeElement.getAttribute("tabindex") - 1;
  selectedAnswer = questionList[currentQuestion].answers[answerIndex];
});

// Submits question and progresses to next question
submitButton.addEventListener("click", function () {
  // If question index is equal to last index in
  // questionList, close game.
  if (currentQuestion === questionList.length - 1) {
    endScreen();
  }

  if (selectedAnswer["correct"] === true) {
    answerReply.textContent = correctAnswer;
  } else {
    answerReply.textContent = incorrectAnswer;
  }
  fadeElement(answerReply);

  updateScore(); // Update user score
  currentQuestion++; // Increment to next question in list
  fillQuestion(); // Occupy text fields with new question
});

// If user decides to quit mid-game, this returns them to
// home screen. Timer is immediately terminated.
quitButton.addEventListener("click", function () {
  clearInterval(timeInterval);
  startMenu.removeAttribute("style", "display: none");
  questionView.removeAttribute("style", "display: flex");
});
