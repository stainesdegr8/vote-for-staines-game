const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");

const groundHeight = 20;
const floorY = canvas.height - groundHeight;

let gameOver = false;

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

function resetGame() {
  player.y = floorY - player.height;
  player.velocityY = 0;
  obstacle.x = canvas.width;
  gameOver = false;
  restartBtn.style.display = "none";
  gameLoop();
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
    obstacle.x = canvas.width;
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
}

function jump() {
  if (!gameOver && player.velocityY === 0) {
    player.velocityY = player.jumpPower;
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGround();
  drawPlayer();
  drawObstacle();

  if (!gameOver) {
    updatePlayer();
    updateObstacle();
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
  if (e.target !== restartBtn && !gameOver) jump();
});

document.addEventListener("touchstart", (e) => {
  if (e.target !== restartBtn && !gameOver) jump();
});

restartBtn.addEventListener("click", resetGame);

gameLoop();
