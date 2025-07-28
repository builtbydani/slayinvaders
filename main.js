const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let score = 0;
let lives = 3;
let gameState = "title";
const POINTS_PER_KILL = 100;
let sparkles = [];
const NUM_SPARKLES = 60;

function createSparkles() {
  sparkles = [];
  for (let i = 0; i < NUM_SPARKLES; i++) {
    sparkles.push({
      x: Math.random() * WIDTH,
      y: Math.random() * HEIGHT,
      radius: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.3 + 0.2,
      alpha: Math.random() * 0.5 + 0.3
    });
  }
}

// Game loop
function gameLoop() {
  if (gameState === "playing") {
    update();
  } else { 
    sparkles.forEach((s) => {
    s.y -= s.speed;
    if (s.y < 0) {
      s.y = HEIGHT;
      s.x = Math.random() * WIDTH;
    }
    });
  }
  draw();
  requestAnimationFrame(gameLoop);
}

// Main update (per frame)
function update() {
  // Update sparkles
  sparkles.forEach(s => {
    s.y -= s.speed;
    if (s.y < 0) {
      s.y = HEIGHT;
      s.x = Math.random() * WIDTH;
    }
  });

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

  // Particle motion
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

  // Invader firing logic
  const now = Date.now();
  if (now - lastInvaderFireTime > INVADER_FIRE_RATE) {
    const shooters = invaders.filter(inv => inv.alive);
    if (shooters.length > 0) {
      const shooter = shooters[Math.floor(Math.random() * shooters.length)];
      invaderBullets.push({
        x: shooter.x + shooter.width / 2 - INVADER_BULLET_WIDTH / 2,
        y: shooter.y + shooter.height,
        width: INVADER_BULLET_WIDTH,
        height: INVADER_BULLET_HEIGHT,
        dy: INVADER_BULLET_SPEED
      });
      lastInvaderFireTime = now;
    }
  }

  invaderBullets.forEach((b) => {
    b.y += b.dy;
  });

  invaderBullets.forEach((b) => {
    if (b.hit) return;

    if (isColliding(b, player)) {
      lives--;
      b.hit = true;
      spawnExplosion(player.x + player.width / 2, player.y, "#ff4249");
    }
  });

  invaderBullets = invaderBullets.filter(b => !b.hit && b.y < HEIGHT);

  if (invaders.every(inv => !inv.alive)) {
    gameState = "win";
  }

  if (lives <= 0) {
    gameState = "lose";
  }
}

// Main draw 
function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  ctx.save();
  sparkles.forEach((s) => {
    ctx.beginPath();
    ctx.globalAlpha = s.alpha;
    ctx.fillStyle = "#ffffff";
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
  ctx.globalAlpha = 1.0;

  // placeholder for the ship
  ctx.fillStyle = "#ff69b4"; // hot pink
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Bullets
  ctx.fillStyle = "#c6c1ff"; //sparkle purple
  bullets.forEach((b) => {
    ctx.fillRect(b.x, b.y, b.width, b.height);
  });



  // Invaders
  invaders.forEach((inv) => {
    if (!inv.alive) return;
    ctx.fillStyle = "#93fcff";
    ctx.fillRect(inv.x, inv.y, inv.width, inv.height);
  });

  // Invader bullets
  ctx.fillStyle = "#91482f";
  invaderBullets.forEach(b => {
    ctx.fillRect(b.x, b.y, b.width, b.height);
  });

  particles.forEach((p) => {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 2, 2);
  });

  // Score
  ctx.fillStyle = "#515154";
  ctx.font = `20px 'Press Start 2P'`;
  ctx.fillText(`Score: ${score}`, 120, 30);

  // Lives
  ctx.fillStyle = "#ff4249";
  ctx.font = `20px 'Press Start 2P'`;
  ctx.fillText(`Lives: ${lives}`, WIDTH - 100, 30);

  // Screens
  ctx.fillStyle = "#515154";
  ctx.font = `36px 'Press Start 2P'`;
  ctx.textAlign = "center";

  if (gameState === "title") {
    ctx.fillText("INVADERS", WIDTH / 2, HEIGHT / 2 - 40);
    ctx.font = `20px 'Press Start 2P'`;
    ctx.fillText("Press SPACE to begin", WIDTH / 2, HEIGHT / 2 + 10);
  }

  if (gameState === "win") {
    ctx.fillText("YOU WIN 💖", WIDTH / 2, HEIGHT / 2 - 40);
    ctx.font = `20px 'Press Start 2P'`;
    ctx.fillText("Press SPACE to play again", WIDTH / 2, HEIGHT / 2 + 10);
  }

  if (gameState === "lose") {
    ctx.fillText("GAME OVER 💀", WIDTH / 2, HEIGHT / 2 - 40);
    ctx.font = `20px 'Press Start 2P'`;
    ctx.fillText("Press SPACE to play again", WIDTH / 2, HEIGHT / 2 + 10);
  }
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
const INVADER_SPEED = 2;

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

// Invader bullets
let invaderBullets = [];
const INVADER_BULLET_WIDTH = 4;
const INVADER_BULLET_HEIGHT = 10;
const INVADER_BULLET_SPEED = 3;
const INVADER_FIRE_RATE = 1000;

let lastInvaderFireTime = 0;


// Listeners
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

// Event handlers
function keyDownHandler(e) {
  // Handle game state transitions first
  if (gameState === "title" && e.code === "Space") {
    startGame();
    return;
  }

  if ((gameState === "win" || gameState === "lose") && e.code === "Space") {
    startGame();
    return;
  }

  // If not playing, ignore input
  if (gameState !== "playing") return;

  // Now handle controls
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

function startGame() {
  gameState = "playing";
  lives = 3;
  score = 0;
  bullets = [];
  invaderBullets = [];
  particles = [];
  lastFireTime = 0;
  lastInvaderFireTime = 0;
  player.x = WIDTH / 2 - player.width / 2;
  createInvaders();
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
      life: 35,
      color
    });
  }
}

gameLoop();
createInvaders();
createSparkles();
