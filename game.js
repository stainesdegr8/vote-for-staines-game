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

let flyingActive = false;
let flyingScored = false;

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

const flyingObstacle = {
  x: canvas.width + 500,
  y: 420,
  width: 30,
  height: 30,
  color: "purple",
  speed: 6
};

function getRandomObstacleStart() {
  return canvas.width + Math.floor(Math.random() * 200) + 100;
}

function getFlyingSpawnDistance() {
  if (score >= 25) {
    return canvas.width + Math.floor(Math.random() * 250) + 120;
  } else {
    return canvas.width + Math.floor(Math.random() * 400) + 350;
  }
}

function getFlyingHeight() {
  if (score >= 25) {
    const heights = [470, 450, 430];
    return heights[Math.floor(Math.random() * heights.length)];
  } else {
    return 460;
  }
}


function shouldSpawnFlyingObstacle() {
  if (score <= 10) return false;

  if (score >= 25) {
    return Math.random() < 0.6;
  }

  return Math.random() < 0.25;
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

function drawFlyingObstacle() {
  if (flyingActive) {
    ctx.fillStyle = flyingObstacle.color;
    ctx.fillRect(
      flyingObstacle.x,
      flyingObstacle.y,
      flyingObstacle.width,
      flyingObstacle.height
    );
  }
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

function updateFlyingObstacle() {
  if (!flyingActive) return;

  flyingObstacle.x -= flyingObstacle.speed;

  if (
    !flyingScored &&
    flyingObstacle.x + flyingObstacle.width < player.x
  ) {
    score++;
    flyingScored = true;
  }

  if (flyingObstacle.x + flyingObstacle.width < 0) {
    flyingActive = false;
  }
}

function maybeSpawnFlyingObstacle() {
  if (!flyingActive && shouldSpawnFlyingObstacle()) {
    flyingActive = true;
    flyingScored = false;
    flyingObstacle.x = getFlyingSpawnDistance();
    flyingObstacle.y = getFlyingHeight();
  }
}

function hitBoxCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function checkCollision() {
  if (hitBoxCollision(player, obstacle)) {
    gameOver = true;
    restartBtn.style.display = "inline-block";
  }

  if (flyingActive && hitBoxCollision(player, flyingObstacle)) {
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
  flyingActive = false;
  flyingScored = false;

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
  drawFlyingObstacle();

  if (!gameOver) {
    updatePlayer();
    updateObstacle();
    maybeSpawnFlyingObstacle();
    updateFlyingObstacle();
    checkCollision();
    requestAnimationFrame(gameLoop);
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
