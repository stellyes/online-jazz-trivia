var startMenu = document.querySelector(".start-menu");
var startButton = document.querySelector("#start-button");
var leaderboardButton = document.querySelector("#leaderboard-button");
var questionView = document.querySelector(".question");
var quitButton = document.querySelector("#quit-game");
var endGameView = document.querySelector("#end-game");
var timerEl = document.querySelector("#time");

var secondsRemaining = 60;

// Hides main menu and displays questions
startButton.addEventListener("click", function () {
  startMenu.setAttribute("style", "display: none");
  questionView.setAttribute("style", "display: flex");
  countdown();
});

// If user decides to quit mid-game, this returns them to
quitButton.addEventListener("click", function () {
  startMenu.removeAttribute("style", "display: none");
  questionView.removeAttribute("style", "display: flex");
});

function endScreen() {
  questionView.removeAttribute("style", "display: flex");
  endGameView.setAttribute("style", "display: flex");
}

function countdown() {
  // Prevents delay in load time,
  timerEl.textContent = "#:##";

  // Resets value if game was previously run
  secondsRemaining = 60;

  // Gets local variable as to not directly reference
  // and modify global value

  var timeInterval = setInterval(function () {
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
