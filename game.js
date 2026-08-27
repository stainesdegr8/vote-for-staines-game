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

let highScore = localStorage.getItem("voteForStainesHighScore") || 0;

let bossBattleActive = false;
let bossBattleCount = 0;
let bossClicks = 0;
let bossRequiredClicks = 0;
let bossBattleStartTime = 0;
let lastBossTriggerScore = 0;

let bossButtons = [];
let lastBossButtonSpawnTime = 0;

let bossDefeated = false;
let bossDefeatedStartTime = 0;

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
  y: floorY - 40
};

const flyingObstacle = {
  x: canvas.width + 500,
  y: 460,
  width: 30,
  height: 30,
  color: "purple"
};

function getObstacleSpeed() {
  return Math.min(5 + Math.floor(score / 10), 10);
}

function getFlyingSpeed() {
  return Math.min(6 + Math.floor(score / 12), 11);
}

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
    const heights = [360, 340, 320];
    return heights[Math.floor(Math.random() * heights.length)];
  } else {
    return 350;
  }
}

function shouldSpawnFlyingObstacle() {
  if (score <= 10) return false;
  if (score >= 25) return Math.random() < 0.6;
  return Math.random() < 0.25;
}

function getBossRequiredClicks(bossNumber) {
  if (bossNumber === 1) return 20;
  if (bossNumber === 2) return 25;
  if (bossNumber === 3) return 30;
  if (bossNumber === 4) return 35;
  if (bossNumber === 5) return 40;
  return 45;
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
  if (!bossBattleActive && !bossDefeated) {
    ctx.fillStyle = obstacle.color;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  }
}

function drawFlyingObstacle() {
  if (flyingActive && !bossBattleActive && !bossDefeated) {
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
  ctx.fillText("Best: " + highScore, 20, 70);

  if (bossBattleActive) {
    ctx.font = "18px Arial";
    ctx.fillText("Need: " + bossRequiredClicks + " clicks", 20, 100);
    ctx.fillText("Current: " + bossClicks, 20, 125);
  }
}

function drawStartScreen() {
  ctx.fillStyle = "black";
  ctx.font = "28px Arial";
  ctx.fillText("Ready to Play?", 100, 250);
}

function drawBossBattleScreen() {
  const elapsed = (Date.now() - bossBattleStartTime) / 1000;
  const timeLeft = Math.max(0, (15 - elapsed).toFixed(1));

  ctx.fillStyle = "red";
  ctx.fillRect(265, 110, 110, 110);

  ctx.fillStyle = "white";
  ctx.fillRect(285, 140, 15, 15);
  ctx.fillRect(340, 140, 15, 15);
  ctx.fillRect(300, 180, 40, 8);

  ctx.fillStyle = "darkred";
  ctx.font = "22px Arial";
  ctx.fillText("BOSS BATTLE", 220, 30);

  ctx.fillStyle = "black";
  ctx.font = "18px Arial";
  ctx.fillText("Time: " + timeLeft + "s", 285, 55);
  ctx.fillText("Tap buttons to defeat boss", 180, 80);
  ctx.fillText("Boss " + bossBattleCount, 295, 105);
}

function drawBossDefeatedScreen() {
  ctx.fillStyle = "red";
  ctx.fillRect(265, 110, 110, 110);

  ctx.fillStyle = "white";
  ctx.fillRect(285, 140, 15, 15);
  ctx.fillRect(340, 140, 15, 15);
  ctx.fillRect(300, 180, 40, 8);

  ctx.fillStyle = "limegreen";
  ctx.font = "28px Arial";
  ctx.fillText("DEFEATED", 250, 95);
}

function getRandomBossButtonCount() {
  return Math.floor(Math.random() * 3) + 1;
}

function spawnBossButtons() {
  const count = getRandomBossButtonCount();

  for (let i = 0; i < count; i++) {
    const buttonWidth = 120;
    const buttonHeight = 36;

    let tries = 0;
    let valid = false;
    let x, y;

    while (!valid && tries < 50) {
      x = Math.random() * (canvas.width - buttonWidth);
      y = Math.random() * (floorY - buttonHeight - 20);

      const overlapsScoreboard = x < 180 && y < 140;
      const overlapsBoss = x + buttonWidth > 265 && x < 375 && y + buttonHeight > 110 && y < 220;
      const overlapsPlayer = x + buttonWidth > player.x && x < player.x + player.width && y + buttonHeight > player.y && y < player.y + player.height;
      const overlapsTopRightText = x + buttonWidth > 180 && y < 120;

      if (!overlapsScoreboard && !overlapsBoss && !overlapsPlayer && !overlapsTopRightText) {
        valid = true;
      }

      tries++;
    }

    if (valid) {
      bossButtons.push({
        x,
        y,
        width: buttonWidth,
        height: buttonHeight,
        text: "Vote for Staines",
        createdAt: Date.now()
      });
    }
  }
}

function drawBossButtons() {
  bossButtons.forEach((button) => {
    ctx.fillStyle = "#007bff";
    ctx.fillRect(button.x, button.y, button.width, button.height);

    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      button.text,
      button.x + button.width / 2,
      button.y + button.height / 2
    );

    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
  });
}

function removeExpiredBossButtons() {
  bossButtons = bossButtons.filter((button) => Date.now() - button.createdAt < 1000);
}

function maybeSpawnBossButtons() {
  const now = Date.now();
  const sinceLast = now - lastBossButtonSpawnTime;
  const randomSpawnGap = 300 + Math.random() * 500;

  if (sinceLast >= randomSpawnGap) {
    spawnBossButtons();
    lastBossButtonSpawnTime = now;
  }
}

function handleBossButtonClick(mouseX, mouseY) {
  for (let i = bossButtons.length - 1; i >= 0; i--) {
    const button = bossButtons[i];
    const clicked =
      mouseX >= button.x &&
      mouseX <= button.x + button.width &&
      mouseY >= button.y &&
      mouseY <= button.y + button.height;

    if (clicked) {
      bossClicks++;
      bossButtons.splice(i, 1);

      if (bossClicks >= bossRequiredClicks) {
        bossBattleActive = false;
        bossDefeated = true;
        bossDefeatedStartTime = Date.now();
        bossButtons = [];
      }

      return true;
    }
  }

  return false;
}

function getCanvasClickPosition(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
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
  const speed = getObstacleSpeed();
  obstacle.x -= speed;

  if (obstacle.x + obstacle.width < 0) {
    obstacle.x = getRandomObstacleStart();
    scored = false;
  }

  if (!scored && obstacle.x + obstacle.width < player.x) {
    score++;
    scored = true;

    // TESTING MODE
    if (score % 3 === 0 && score !== lastBossTriggerScore) {
      lastBossTriggerScore = score;
      startBossBattle();
    }
  }
}

function updateFlyingObstacle() {
  if (!flyingActive) return;

  const speed = getFlyingSpeed();
  flyingObstacle.x -= speed;

  if (!flyingScored && flyingObstacle.x + flyingObstacle.width < player.x) {
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

function updateBossDefeatedState() {
  if (!bossDefeated) return;

  const elapsed = (Date.now() - bossDefeatedStartTime) / 1000;
  if (elapsed >= 1.5) {
    bossDefeated = false;
    obstacle.x = getRandomObstacleStart();
    scored = false;
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

function endGame() {
  gameOver = true;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("voteForStainesHighScore", highScore);
  }

  restartBtn.style.display = "inline-block";
}

function checkCollision() {
  if (!bossBattleActive && !bossDefeated && hitBoxCollision(player, obstacle)) {
    endGame();
  }

  if (!bossBattleActive && !bossDefeated && flyingActive && hitBoxCollision(player, flyingObstacle)) {
    endGame();
  }
}

function drawGameOver() {
  ctx.fillStyle = "black";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over", 120, 250);

  ctx.font = "22px Arial";
  ctx.fillText("Final Score: " + score, 125, 290);
  ctx.fillText("Best Score: " + highScore, 118, 320);
}

function jump() {
  if (gameStarted && !gameOver && !bossBattleActive && !bossDefeated && player.velocityY === 0) {
    player.velocityY = player.jumpPower;
  }
}

function startBossBattle() {
  bossBattleActive = true;
  bossBattleCount++;
  bossClicks = 0;
  bossRequiredClicks = getBossRequiredClicks(bossBattleCount);
  bossBattleStartTime = Date.now();
  lastBossButtonSpawnTime = 0;
  bossButtons = [];
  bossDefeated = false;
  flyingActive = false;
}

function updateBossBattle() {
  const elapsed = (Date.now() - bossBattleStartTime) / 1000;

  maybeSpawnBossButtons();
  removeExpiredBossButtons();

  if (elapsed >= 15) {
    if (bossClicks >= bossRequiredClicks) {
      bossBattleActive = false;
      bossDefeated = true;
      bossDefeatedStartTime = Date.now();
      bossButtons = [];
    } else {
      endGame();
    }
  }
}

function startGame() {
  gameStarted = true;
  gameOver = false;
  score = 0;
  scored = false;
  flyingActive = false;
  flyingScored = false;
  bossBattleActive = false;
  bossBattleCount = 0;
  bossClicks = 0;
  bossRequiredClicks = 0;
  bossBattleStartTime = 0;
  lastBossTriggerScore = 0;
  bossButtons = [];
  lastBossButtonSpawnTime = 0;
  bossDefeated = false;
  bossDefeatedStartTime = 0;

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
    if (bossBattleActive) {
      drawBossBattleScreen();
      drawBossButtons();
      updateBossBattle();
    } else if (bossDefeated) {
      drawBossDefeatedScreen();
      updateBossDefeatedState();
    } else {
      updatePlayer();
      updateObstacle();
      maybeSpawnFlyingObstacle();
      updateFlyingObstacle();
      checkCollision();
    }

    requestAnimationFrame(gameLoop);
  } else {
    drawGameOver();
  }
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") jump();
});

canvas.addEventListener("click", (e) => {
  if (!gameStarted || gameOver) return;

  const pos = getCanvasClickPosition(e);

  if (bossBattleActive) {
    const clickedBossButton = handleBossButtonClick(pos.x, pos.y);
    if (clickedBossButton) return;
  } else if (!bossDefeated) {
    jump();
  }
});

canvas.addEventListener("touchstart", (e) => {
  if (!gameStarted || gameOver) return;

  const touch = e.touches;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = (touch.clientX - rect.left) * scaleX;
  const y = (touch.clientY - rect.top) * scaleY;

  if (bossBattleActive) {
    const clickedBossButton = handleBossButtonClick(x, y);
    if (clickedBossButton) {
      e.preventDefault();
      return;
    }
  } else if (!bossDefeated) {
    jump();
  }
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", resetGame);

gameLoop();
