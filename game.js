const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");
const startBtn = document.getElementById("startBtn");

const groundHeight = 20;
const floorY = canvas.height - groundHeight;

// Images
const playerImage = new Image();
playerImage.src = "assets/images/player.png";

const groundObstacleImage = new Image();
groundObstacleImage.src = "assets/images/ground-obstacle.png";

const flyingObstacleImage = new Image();
flyingObstacleImage.src = "assets/images/flying-obstacle.png";

const boss1Image = new Image();
boss1Image.src = "assets/images/boss1.png";

const boss2Image = new Image();
boss2Image.src = "assets/images/boss2.png";

const boss3Image = new Image();
boss3Image.src = "assets/images/boss3.png";

const boss4Image = new Image();
boss4Image.src = "assets/images/boss4.png";

const boss5Image = new Image();
boss5Image.src = "assets/images/boss5.png";

const bg1Image = new Image();
bg1Image.src = "assets/images/bg1.png";

const bg2Image = new Image();
bg2Image.src = "assets/images/bg2.png";

const bg3Image = new Image();
bg3Image.src = "assets/images/bg3.png";

const bg4Image = new Image();
bg4Image.src = "assets/images/bg4.png";

const bg5Image = new Image();
bg5Image.src = "assets/images/bg5.png";

const backgrounds = [bg1Image, bg2Image, bg3Image, bg4Image, bg5Image];

let gameOver = false;
let gameStarted = false;
let score = 0;
let highScore = localStorage.getItem("voteForStainesHighScore") || 0;

let bossIncomingActive = false;
let bossIncomingStartTime = 0;
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

// Only one obstacle type can be active at any time
let currentObstacleType = "ground"; // "ground" or "flying"

const player = {
 x: 50,
 width: 80,
 height: 80,
 velocityY: 0,
 gravity: 0.7,
 jumpPower: -18,
 y: floorY - 80
};

const obstacle = {
 x: 400,
 width: 60,
 height: 80,
 y: floorY - 80,
 active: true,
 scored: false
};

const flyingObstacle = {
 x: canvas.width + 500,
 y: 200,
 width: 60,
 height: 60,
 active: false,
 scored: false
};

function getObstacleSpeed() {
 return Math.min(5 + Math.floor(score / 10), 10);
}

function getFlyingSpeed() {
 return Math.min(6 + Math.floor(score / 12), 11);
}

function getRandomObstacleStart() {
 return canvas.width + Math.floor(Math.random() * 250) + 150;
}

function getFlyingSpawnDistance() {
 if (score >= 25) {
 return canvas.width + Math.floor(Math.random() * 250) + 150;
 }
 return canvas.width + Math.floor(Math.random() * 300) + 200;
}

function getFlyingHeight() {
 if (score >= 25) {
 const heights = [140, 160, 180, 200];
 return heights[Math.floor(Math.random() * heights.length)];
 }
 return 200;
}

function chooseNextObstacleType() {
 if (score <= 10) {
 return "ground";
 }

 if (score >= 25) {
 return Math.random() < 0.5 ? "ground" : "flying";
 }

 return Math.random() < 0.7 ? "ground" : "flying";
}

function spawnNextObstacle() {
 currentObstacleType = chooseNextObstacleType();

 if (currentObstacleType === "ground") {
 obstacle.active = true;
 obstacle.scored = false;
 obstacle.x = getRandomObstacleStart();

 flyingObstacle.active = false;
 flyingObstacle.scored = false;
 } else {
 flyingObstacle.active = true;
 flyingObstacle.scored = false;
 flyingObstacle.x = getFlyingSpawnDistance();
 flyingObstacle.y = getFlyingHeight();

 obstacle.active = false;
 obstacle.scored = false;
 }
}

function addScoreAndCheckBoss() {
 score++;

 if (score % 15 === 0 && score !== lastBossTriggerScore) {
 lastBossTriggerScore = score;
 startBossIncoming();
 }
}

function getBossRequiredClicks(bossNumber) {
 if (bossNumber === 1) return 20;
 if (bossNumber === 2) return 25;
 if (bossNumber === 3) return 30;
 if (bossNumber === 4) return 35;
 if (bossNumber === 5) return 40;
 return 45;
}

function getCurrentBossImage() {
 const bossIndex = (bossBattleCount - 1) % 5;

 if (bossIndex === 0) return boss1Image;
 if (bossIndex === 1) return boss2Image;
 if (bossIndex === 2) return boss3Image;
 if (bossIndex === 3) return boss4Image;
 return boss5Image;
}

function getCurrentBackgroundImage() {
 const bgIndex = Math.min(bossBattleCount, backgrounds.length - 1);
 return backgrounds[bgIndex];
}

function drawBackground() {
 const bgImage = getCurrentBackgroundImage();

 if (bgImage.complete && bgImage.naturalWidth > 0) {
 ctx.save();
 ctx.globalAlpha = 0.5;
 ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
 ctx.restore();
 } else {
 ctx.save();
 ctx.globalAlpha = 0.5;
 ctx.fillStyle = "#dfefff";
 ctx.fillRect(0, 0, canvas.width, canvas.height);
 ctx.restore();
 }
}

function drawPlayer() {
 if (playerImage.complete && playerImage.naturalWidth > 0) {
 ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
 } else {
 ctx.fillStyle = "blue";
 ctx.fillRect(player.x, player.y, player.width, player.height);
 }
}

function drawGround() {
 ctx.fillStyle = "black";
 ctx.fillRect(0, floorY, canvas.width, groundHeight);
}

function drawObstacle() {
 if (!obstacle.active || bossBattleActive || bossIncomingActive || bossDefeated) return;

 if (groundObstacleImage.complete && groundObstacleImage.naturalWidth > 0) {
 ctx.drawImage(
 groundObstacleImage,
 obstacle.x,
 obstacle.y,
 obstacle.width,
 obstacle.height
 );
 } else {
 ctx.fillStyle = "red";
 ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
 }
}

function drawFlyingObstacle() {
 if (!flyingObstacle.active || bossBattleActive || bossIncomingActive || bossDefeated) return;

 if (flyingObstacleImage.complete && flyingObstacleImage.naturalWidth > 0) {
 ctx.drawImage(
 flyingObstacleImage,
 flyingObstacle.x,
 flyingObstacle.y,
 flyingObstacle.width,
 flyingObstacle.height
 );
 } else {
 ctx.fillStyle = "purple";
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

function drawBossFallback(x, y, w, h) {
 ctx.fillStyle = "red";
 ctx.fillRect(x, y, w, h);

 ctx.fillStyle = "white";
 ctx.fillRect(x + 20, y + 30, 15, 15);
 ctx.fillRect(x + 75, y + 30, 15, 15);
 ctx.fillRect(x + 35, y + 70, 40, 8);
}

function drawBossIncomingScreen() {
 // Draw semi-transparent dark overlay for blur effect
 ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
 ctx.fillRect(0, 0, canvas.width, canvas.height);

 // Calculate elapsed time and countdown
 const elapsed = (Date.now() - bossIncomingStartTime) / 1000;
 const countdownTime = Math.max(0, (3 - elapsed).toFixed(1));

 // Draw "BOSS INCOMING" text (smaller size)
 ctx.fillStyle = "red";
 ctx.font = "bold 48px Arial";
 ctx.textAlign = "center";
 ctx.textBaseline = "middle";
 ctx.fillText("BOSS INCOMING", canvas.width / 2, canvas.height / 2 - 50);

 // Draw countdown
 ctx.fillStyle = "yellow";
 ctx.font = "bold 48px Arial";
 ctx.fillText(countdownTime, canvas.width / 2, canvas.height / 2 + 50);

 ctx.textAlign = "start";
 ctx.textBaseline = "alphabetic";
}

function drawBossBattleScreen() {
 const elapsed = (Date.now() - bossBattleStartTime) / 1000;
 const timeLeft = Math.max(0, (15 - elapsed).toFixed(1));

 const currentBossImage = getCurrentBossImage();
 if (currentBossImage.complete && currentBossImage.naturalWidth > 0) {
 ctx.drawImage(currentBossImage, 200, 110, 180, 180);
 } else {
 drawBossFallback(200, 110, 180, 180);
 }

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
 const currentBossImage = getCurrentBossImage();
 if (currentBossImage.complete && currentBossImage.naturalWidth > 0) {
 ctx.drawImage(currentBossImage, 200, 110, 180, 180);
 } else {
 drawBossFallback(200, 110, 180, 180);
 }

 ctx.fillStyle = "limegreen";
 ctx.font = "28px Arial";
 ctx.fillText("DEFEATED", 250, 70);
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
 const overlapsBoss =
 x + buttonWidth > 200 && x < 380 &&
 y + buttonHeight > 80 && y < 260;
 const overlapsPlayer =
 x + buttonWidth > player.x && x < player.x + player.width &&
 y + buttonHeight > player.y && y < player.y + player.height;
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

function updateGroundObstacle() {
 if (!obstacle.active) return;

 obstacle.x -= getObstacleSpeed();

 if (!obstacle.scored && obstacle.x + obstacle.width < player.x) {
 obstacle.scored = true;
 addScoreAndCheckBoss();
 }

 if (obstacle.x + obstacle.width < 0 && !bossBattleActive && !bossIncomingActive) {
 obstacle.active = false;
 spawnNextObstacle();
 }
}

function updateFlyingObstacle() {
 if (!flyingObstacle.active) return;

 flyingObstacle.x -= getFlyingSpeed();

 if (!flyingObstacle.scored && flyingObstacle.x + flyingObstacle.width < player.x) {
 flyingObstacle.scored = true;
 addScoreAndCheckBoss();
 }

 if (flyingObstacle.x + flyingObstacle.width < 0 && !bossBattleActive && !bossIncomingActive) {
 flyingObstacle.active = false;
 spawnNextObstacle();
 }
}

function updateBossIncoming() {
 const elapsed = (Date.now() - bossIncomingStartTime) / 1000;

 if (elapsed >= 3) {
 bossIncomingActive = false;
 startBossBattle();
 }
}

function updateBossDefeatedState() {
 if (!bossDefeated) return;

 const elapsed = (Date.now() - bossDefeatedStartTime) / 1000;
 if (elapsed >= 1.5) {
 bossDefeated = false;
 obstacle.active = false;
 flyingObstacle.active = false;
 spawnNextObstacle();
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
 if (!bossBattleActive && !bossIncomingActive && !bossDefeated && obstacle.active && hitBoxCollision(player, obstacle)) {
 endGame();
 return;
 }

 if (!bossBattleActive && !bossIncomingActive && !bossDefeated && flyingObstacle.active && hitBoxCollision(player, flyingObstacle)) {
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
 if (!gameStarted || gameOver || bossBattleActive || bossIncomingActive || bossDefeated) return;

 if (player.velocityY === 0) {
 player.velocityY = player.jumpPower;
 }
}

function startBossIncoming() {
 bossIncomingActive = true;
 bossIncomingStartTime = Date.now();
 obstacle.active = false;
 flyingObstacle.active = false;
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
 bossIncomingActive = false;
 bossIncomingStartTime = 0;
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

 obstacle.active = false;
 obstacle.scored = false;
 obstacle.x = getRandomObstacleStart();

 flyingObstacle.active = false;
 flyingObstacle.scored = false;
 flyingObstacle.x = getFlyingSpawnDistance();
 flyingObstacle.y = getFlyingHeight();

 spawnNextObstacle();

 startBtn.style.display = "none";
 restartBtn.style.display = "none";

 gameLoop();
}

function resetGame() {
 startGame();
}

function gameLoop() {
 ctx.clearRect(0, 0, canvas.width, canvas.height);

 drawBackground();
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
 if (bossIncomingActive) {
 drawBossIncomingScreen();
 updateBossIncoming();
 } else if (bossBattleActive) {
 drawBossBattleScreen();
 drawBossButtons();
 updateBossBattle();
 } else if (bossDefeated) {
 drawBossDefeatedScreen();
 updateBossDefeatedState();
 } else {
 updatePlayer();
 updateGroundObstacle();
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
 } else if (!bossDefeated && !bossIncomingActive) {
 jump();
 }
});

canvas.addEventListener("touchstart", (e) => {
 if (!gameStarted || gameOver) return;

 const touch = e.touches;
 if (!touch) return;

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
 } else if (!bossDefeated && !bossIncomingActive) {
 jump();
 }
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", resetGame);

gameLoop();
