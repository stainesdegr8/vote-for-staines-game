const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = {
  x: 50,
  y: 500,
  width: 40,
  height: 40,
  color: "blue",
  velocityY: 0,
  gravity: 0.8,
  jumpPower: -12
};

const groundY = 550;

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawGround() {
  ctx.fillStyle = "green";
  ctx.fillRect(0, groundY + player.height, canvas.width, canvas.height - groundY);
}

function updatePlayer() {
  player.velocityY += player.gravity;
  player.y += player.velocityY;

  if (player.y > groundY - player.height + 40) {
    player.y = groundY - player.height + 40;
    player.velocityY = 0;
  }
}

function jump() {
  if (player.velocityY === 0) {
    player.velocityY = player.jumpPower;
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPlayer();
  drawGround();
  updatePlayer();

  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") jump();
});

document.addEventListener("click", jump);
document.addEventListener("touchstart", jump);

gameLoop();

