const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let score = 0;
const POINTS_PER_KILL = 100;

// Game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Main update (per frame)
function update() {
  // Move player
  player.x += player.dx;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > WIDTH) player.x = WIDTH - player.width;

  // Move bullets
  bullets.forEach((b) => {
    b.y += b.dy;
  });

  bullets = bullets.filter((b) => b.y + b.height > 0);

  // Check for bullet collision, remove hit bullets
  bullets.forEach((bullet) => {
    invaders.forEach((inv) => {
      if (!inv.alive) return;

      if (isColliding(bullet, inv)) {
        inv.alive = false;
        bullet.hit = true;
        spawnExplosion(inv.x + inv.width / 2, inv.y + inv.height / 2);
        score += POINTS_PER_KILL;
      }
    });
  });

  bullets = bullets.filter((b) => !b.hit && b.y + b.height > 0);

  particles.forEach((p) => {
    p.x += p.dx;
    p.y += p.dy;
    p.life--;
  });
  particles = particles.filter((p) => p.life > 0);

  // Move invaders
  let shouldBounce = false;
  invaders.forEach((invader) => {
    if (!invader.alive) return;
    invader.x += INVADER_SPEED * invaderDirection;

    if (
      invader.x + invader.width > WIDTH - INVADER_PADDING ||
      invader.x < INVADER_PADDING
    ) {
      shouldBounce = true;
    }
  });

  if (shouldBounce) {
    invaderDirection *= -1;
    invaders.forEach((invader) => {
      if (invader.alive) invader.y += INVADER_HEIGHT;
    });
  }
}

// Main draw 
function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // placeholder for the ship
  ctx.fillStyle = "#ff69b4"; // hot pink
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Bullets
  ctx.fillStyle = "#c6c1ff"; //sparkle purple
  bullets.forEach((b) => {
    ctx.fillRect(b.x, b.y, b.width, b.height);
  });

  particles.forEach((p) => {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 2, 2);
  });

  // Invaders
  invaders.forEach((inv) => {
    if (!inv.alive) return;
    ctx.fillStyle = "#93fcff";
    ctx.fillRect(inv.x, inv.y, inv.width, inv.height);
  });

  // Score
  ctx.fillStyle = "515154";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 20, 30);
}

// Player
const player = {
  width: 50,
  height: 20,
  x: WIDTH / 2 - 25,
  y: HEIGHT - 40,
  speed: 5,
  dx: 0
};

// Invaders
const INVADER_ROWS = 4;
const INVADER_COLS = 8;
const INVADER_WIDTH = 40;
const INVADER_HEIGHT = 20;
const INVADER_PADDING = 20;
const INVADER_SPACING = 10;
const INVADER_START_Y = 60;
const INVADER_SPEED = 1;

let invaders = [];
let invaderDirection = 1;

// Bullets
let bullets = [];
let particles = [];
let lastFireTime = 0;
const FIRE_COOLDOWN = 300;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 10;
const BULLET_SPEED = 7;

// Listeners
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

// Event handlers
function keyDownHandler(e) {
  if (e.code === "ArrowLeft" || e.code === "KeyA") {
    player.dx = -player.speed;
  } else if (e.code === "ArrowRight" || e.code === "KeyD") {
    player.dx = player.speed;
  } else if (e.code === "Space") {
    fireBullet();
  }
}

function keyUpHandler(e) {
  if (
    (e.code === "ArrowLeft" && player.dx < 0) || 
    (e.code === "KeyA" && player.dx < 0) ||
    (e.code === "ArrowRight" && player.dx > 0) ||
    (e.code === "KeyD" && player.dx > 0)
  ) {
    player.dx = 0;
  }
}

// Helper functions
function fireBullet() {
  const now = Date.now();
  if (now - lastFireTime < FIRE_COOLDOWN) return;

  const bullet = {
    x: player.x + player.width / 2 - BULLET_WIDTH / 2,
    y: player.y,
    width: BULLET_WIDTH,
    height: BULLET_HEIGHT,
    dy: -BULLET_SPEED
  };
  bullets.push(bullet);
  lastFireTime = now;
}

function createInvaders() {
  invaders = [];
  for (let row = 0; row < INVADER_ROWS; row++) {
    for (let col = 0; col < INVADER_COLS; col++) {
      const x = col * (INVADER_WIDTH + INVADER_SPACING) + INVADER_PADDING;
      const y = INVADER_START_Y + row * (INVADER_HEIGHT + INVADER_SPACING);
      invaders.push({
        x,
        y,
        width: INVADER_WIDTH,
        height: INVADER_HEIGHT,
        alive: true
      });
    }
  }
}

function isColliding(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function spawnExplosion(x, y, color="#ff93e4") {
  for (let i = 0; i < 10; i++) {
    particles.push({
      x,
      y,
      dx: (Math.random() - 0.5) * 4,
      dy: (Math.random() - 0.5) * 4,
      life: 30,
      color
    });
  }
}

gameLoop();
createInvaders();
