const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");
const startBtn = document.getElementById("startBtn");

const groundHeight = 20;
const floorY = canvas.height - groundHeight;

let gameOver = false;
let gameStarted = false;
let score = 0;
let scored = false;
let animationId;

const player = {
  x: 50,
  width: 40,
  height: 40,
  color: "blue",
  velocityY: 0,
  gravity: 0.8,
  jumpPower: -12,
  y: floorY - 40
};

const obstacle = {
  x: 400,
  width: 30,
  height: 40,
  color: "red",
  speed: 5,
  y: floorY - 40
};

function getRandomObstacleStart() {
  return canvas.width + Math.floor(Math.random() * 200) + 100;
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawGround() {
  ctx.fillStyle = "green";
  ctx.fillRect(0, floorY, canvas.width, groundHeight);
}

function drawObstacle() {
  ctx.fillStyle = obstacle.color;
  ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
}

function drawScore() {
  ctx.fillStyle = "black";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, 20, 40);
}

function drawStartScreen() {
  ctx.fillStyle = "black";
  ctx.font = "28px Arial";
  ctx.fillText("Ready to Play?", 100, 250);
}

function updatePlayer() {
  player.velocityY += player.gravity;
  player.y += player.velocityY;

  if (player.y > floorY - player.height) {
    player.y = floorY - player.height;
    player.velocityY = 0;
  }
}

function updateObstacle() {
  obstacle.x -= obstacle.speed;

  if (obstacle.x + obstacle.width < 0) {
    obstacle.x = getRandomObstacleStart();
    scored = false;
  }

  if (!scored && obstacle.x + obstacle.width < player.x) {
    score++;
    scored = true;
  }
}

function checkCollision() {
  if (
    player.x < obstacle.x + obstacle.width &&
    player.x + player.width > obstacle.x &&
    player.y < obstacle.y + obstacle.height &&
    player.y + player.height > obstacle.y
  ) {
    gameOver = true;
    restartBtn.style.display = "inline-block";
  }
}

function drawGameOver() {
  ctx.fillStyle = "black";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over", 120, 250);

  ctx.font = "22px Arial";
  ctx.fillText("Final Score: " + score, 125, 290);
}

function jump() {
  if (gameStarted && !gameOver && player.velocityY === 0) {
    player.velocityY = player.jumpPower;
  }
}

function startGame() {
  gameStarted = true;
  gameOver = false;
  score = 0;
  scored = false;
  player.y = floorY - player.height;
  player.velocityY = 0;
  obstacle.x = getRandomObstacleStart();
  startBtn.style.display = "none";
  restartBtn.style.display = "none";
  gameLoop();
}

function resetGame() {
  startGame();
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGround();
  drawPlayer();
  drawScore();

  if (!gameStarted) {
    drawStartScreen();
    return;
  }

  drawObstacle();

  if (!gameOver) {
    updatePlayer();
    updateObstacle();
    checkCollision();
    animationId = requestAnimationFrame(gameLoop);
  } else {
    drawGameOver();
  }
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") jump();
});

document.addEventListener("click", (e) => {
  if (e.target !== restartBtn && e.target !== startBtn && gameStarted && !gameOver) {
    jump();
  }
});

document.addEventListener("touchstart", (e) => {
  if (e.target !== restartBtn && e.target !== startBtn && gameStarted && !gameOver) {
    jump();
  }
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", resetGame);

gameLoop();
