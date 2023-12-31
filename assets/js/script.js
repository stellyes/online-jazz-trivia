// Handles import for questions as a JSON object
import questions from "./questions.json" assert { type: "json" };

var startMenu = document.querySelector(".start-menu");
var startButton = document.querySelector("#start-button");
var leaderboardButton = document.querySelector("#leaderboard-button");

var questionView = document.querySelector(".question");
var questionTitle = document.querySelector(".question-title");
var questionAnswers = document.querySelector(".answers");
var timerEl = document.querySelector("#time");
var timeInterval; // Global time variable to prevent overlapping session conflict
var answerReply = document.querySelector(".spacer");
var scoreEl = document.querySelector("#score");
var submitButton = document.querySelector("#submit-answer");
var quitButton = document.querySelector("#quit-game");

var endGameView = document.querySelector("#end-game");
var endGameTitle = document.querySelector(".game-header");
var endGameTime = document.querySelector("#time-remaining");
var endGameScore = document.querySelector("#end-score");
var returnHomeButton = document.querySelector("#return-home");

var leaderboardView = document.querySelector("#leaderboard-view");
var leaderboardPosition = document.querySelector("#leaderboard-positions");
var leaderboardPrevious = ""; // To redirect user back to previous view
getLeaderboardList();
var backButton = document.querySelector("#back-button");
var clearButton = document.querySelector("#clear-button");

var credits = document.querySelector("#credits");

// List of questions, index of current question,
// and selected answer object
const questionList = questions.list;
var questionListGrab = questionList;
var currentQuestion = 0;
var selectedAnswer = { default: "value" };

// Stats used globally and reset when game sarts
var secondsRemaining = 60;
var currentScore = 0;

// Displayed when user answers question
var correctAnswer = "Correct! ✅";
var incorrectAnswer = "Incorrect! ❌";

// Displayed when game is finished
var playerLost = "❌ You lose! ❌";
var playerWon = "✨ You Win! ✨";

// Implementation of the Fisher-Yates shuffle
// To randomize order of questions each game start
// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
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

// Creates new leaderboard in local storage. Abstracted for readability
function getLeaderboardList() {
  // Try and pull first place name/score
  var testLeaderboard = localStorage.getItem("0");

  // If first place doesn't exist, neither does the rest
  // of the positions, so we generate the filler data
  if (testLeaderboard === null) {
    for (var i = 0; i < 10; i++) {
      localStorage.setItem(`${i}`, `BOT ${1000 - i * 100}`);
    }
  }
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

// Displays ending screen for user
function endScreen() {
  // If user makes it through all the questitons such that
  // currentQuestion === last index of questionListGrab
  if (currentQuestion === questionListGrab.length - 1) {
    endGameTitle.textContent = playerWon;
  } else {
    endGameTitle.textContent = playerLost;
  }

  // Display final score and time
  endGameTime.textContent =
    Math.floor(secondsRemaining / 60) +
    ":" +
    ("00" + (secondsRemaining % 60)).slice(-2);
  endGameScore.textContent = ("00000" + currentScore).slice(-5);

  endGameView.setAttribute("style", "display: flex");
  questionView.removeAttribute("style", "display: flex");

  // One second delay on checkLeaderboard to
  // allow endScreen to render
  setTimeout(function () {
    checkLeaderboard();
  }, 1000);
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

  // User earns points with remaining time / 5 + 500 for right answer
  // as well as 15 additional seconds to their quiz time. Inverse time
  // effect if they answer incorrectly
  if (selectedAnswer["correct"] === true) {
    currentScore += Math.floor(secondsRemaining / 5) + 500;
    scoreEl.textContent = ("00000" + currentScore).slice(-5);
    secondsRemaining += 15;
  } else {
    secondsRemaining -= 15;
  }
}

// Takes in index of question child and occupies text
// fields with corresponding values
function fillQuestion() {
  questionTitle.textContent = questionListGrab[currentQuestion].questionPrompt;

  // Shuffle answers in random order for
  // each occurance and fills text conent
  var answers = fisherYates(questionListGrab[currentQuestion].answers);
  for (var i = 0; i < 4; i++) {
    questionAnswers.children[i].textContent = answers[i].text;
  }
}

// Checks leaderboard for new high score
function checkLeaderboard() {
  // Checks current score against
  for (var i = 0; i < 10; i++) {
    var testAgainst = localStorage.getItem(i).split(" ");
    if (currentScore > testAgainst[1]) {
      // Proper prompt output for placement
      if (i === 0) {
        var place = "1st";
      } else if (i === 1) {
        var place = "2nd";
      } else if (i === 2) {
        var place = "3rd";
      } else {
        var place = `${i + 1}th`;
      }

      // Gets user input and checks for proper formatting
      var initials = prompt(
        `Congratulations! You placed ${place} on the leaderboard!`,
        "Enter your initials"
      );

      // Validate user input
      while (initials.length > 3) {
        initials = prompt(
          "Please enter your initials, maximum of three characters",
          "Enter your initials"
        );
      }

      // Remove last item in localStorage to make room
      // for new entry
      localStorage.removeItem("9");

      // Used to shuffle rest of positions in localStorage
      for (var j = 9; j != i; j--) {
        var placeholder = localStorage.getItem(j - 1);
        localStorage.setItem(`${j}`, placeholder);
      }
      // Update entry in local storage
      localStorage.setItem(`${i}`, `${initials} ${currentScore}`);
      break;
    }
  }
}

function fillLeaderboard() {
  var leaderboardStats = "";
  // Fill leaderboard with corresponding values
  for (var i = 0; i < 10; i++) {
    // Split item by space to get initials and score
    leaderboardStats = localStorage.getItem(i).split(" ");
    leaderboardPosition.children[i].children[0].textContent =
      leaderboardStats[0];
    leaderboardPosition.children[i].children[2].textContent = (
      "00000" + leaderboardStats[1]
    ).slice(-5);

    // Even placements alternate background color
    // for increased contrast and readability
    if (i % 2 !== 0) {
      leaderboardPosition.children[i].setAttribute(
        "style",
        "background-color: rgba(144, 101, 196, 0.5)"
      );
    }
  }
}

// Hides main menu and displays questions
startButton.addEventListener("click", function () {
  currentScore = 0; // Reset score if previous game was played
  currentQuestion = 0; // Reset currentQuestion
  scoreEl.textContent = "00000"; // Reset score display
  // Get fresh copy of questionListGrab to sort

  var questionCopy = questionListGrab;
  fillQuestion();
  startMenu.setAttribute("style", "display: none");
  questionView.setAttribute("style", "display: flex");
  credits.setAttribute("style", "display: none");
  countdown();
});

// Monitors user activity for selected answer and stores
// corresponding selection's data in selectedAnswer
questionAnswers.addEventListener("click", function () {
  var answerIndex = document.activeElement.getAttribute("tabindex") - 1;
  selectedAnswer = questionListGrab[currentQuestion].answers[answerIndex];
});

// Submits question and progresses to next question
submitButton.addEventListener("click", function () {
  // If question index is equal to last index in
  // questionListGrab, close game.
  if (currentQuestion === 9) {
    clearInterval(timeInterval);
    endScreen();
  } else {
    // Display correct/incorrect message when user
    // answers a question
    if (selectedAnswer["correct"] === true) {
      answerReply.textContent = correctAnswer;
    } else {
      answerReply.textContent = incorrectAnswer;
    }
    fadeElement(answerReply);

    updateScore(); // Update user score
    currentQuestion++; // Increment to next question in list
    fillQuestion(); // Occupy text fields with new question
  }
});

// If user decides to quit mid-game, this returns them to
// home screen. Timer is immediately terminated.
quitButton.addEventListener("click", function () {
  clearInterval(timeInterval);
  startMenu.removeAttribute("style", "display: none");
  questionView.removeAttribute("style", "display: flex");
  credits.removeAttribute("style", "display: none");
});

returnHomeButton.addEventListener("click", function () {
  endGameView.removeAttribute("style", "display: flex");
  startMenu.removeAttribute("style", "display: none");
  credits.removeAttribute("style", "display: none");
});

leaderboardButton.addEventListener("click", function () {
  // Fill leaderboard with most recent stats
  fillLeaderboard();
  startMenu.setAttribute("style", "display: none");
  leaderboardView.setAttribute("style", "display: flex");
  credits.setAttribute("style", "display: none");
});

backButton.addEventListener("click", function () {
  leaderboardView.removeAttribute("style", "display: flex");
  startMenu.removeAttribute("style", "display: none");
  credits.removeAttribute("style", "display: none");
});

// Resets leaderboard stats
clearButton.addEventListener("click", function () {
  localStorage.clear();
  getLeaderboardList();
  alert(
    "Leaderboard has been cleared, refresh the page for updated leaderboard stats."
  );
});
