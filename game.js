
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = {
  x: canvas.width / 2,
  y: canvas.height - 80,
  width: 50,
  height: 50,
  speed: 8
};

const shipImage = document.getElementById('ship');

let bullets = [];
let enemies = [];
let score = 0;
let lives = 3;
let level = 1;
let isTouching = false;
let touchX = player.x;
let canShoot = true;
let turboActive = false;
let turboCooldown = false;

function drawText(text, x, y, size = "20px", color = "#fff") {
  ctx.font = `${size} Arial`;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function drawShip() {
  ctx.drawImage(shipImage, player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
}

function drawCircle(obj, label = "") {
  ctx.beginPath();
  ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
  ctx.fillStyle = obj.color;
  ctx.shadowBlur = 10;
  ctx.shadowColor = obj.color;
  ctx.fill();
  ctx.closePath();
  if (label) {
    ctx.font = "bold 14px Arial";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.fillText(label, obj.x, obj.y + 5);
  }
}

function shoot() {
  if (canShoot) {
    bullets.push({ x: player.x, y: player.y - 30, radius: 5, color: '#ff007f' });
    if (!turboActive) {
      canShoot = false;
      setTimeout(() => canShoot = true, 400);
    }
  }
}

function spawnEnemies() {
  if (enemies.length < 15 && Math.random() < 0.02 + level * 0.002) {
    const hp = Math.ceil(Math.random() * level);
    enemies.push({
      x: Math.random() * canvas.width,
      y: -30,
      radius: 25,
      color: `hsl(${Math.random() * 360}, 100%, ${60 - hp * 2}%)`,
      speedY: 2 + Math.random() * level * 0.5,
      speedX: 0,
      bounce: 0.9,
      hp: hp
    });
  }
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Player
  player.x += (touchX - player.x) * 0.2;
  drawShip();

  // Bullets
  bullets.forEach((b, i) => {
    b.y -= 6;
    drawCircle(b);
    if (b.y < 0) bullets.splice(i, 1);
  });

  // Enemies
  enemies.forEach((e, ei) => {
    e.y += e.speedY;
    if (e.y + e.radius >= canvas.height) {
      e.y = canvas.height - e.radius;
      e.speedY *= -e.bounce;
    }
    e.speedY += 0.3; // gravity
    drawCircle(e, e.hp);
    bullets.forEach((b, bi) => {
      const dx = b.x - e.x;
      const dy = b.y - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < b.radius + e.radius) {
        bullets.splice(bi, 1);
        e.hp--;
        score++;
        if (e.hp <= 0) enemies.splice(ei, 1);
      }
    });

    // Collision with player
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < player.width / 2 + e.radius) {
      enemies.splice(ei, 1);
      lives--;
      if (lives <= 0) {
        alert("Game Over! Your score: " + score);
        document.location.reload();
      }
    }
  });

  // UI
  drawText("Score: " + score, 20, 30);
  drawText("Lives: " + lives, 20, 60);
  drawText("Level: " + level, 20, 90);

  if (score >= level * 15 && level < 15) {
    level++;
  }

  spawnEnemies();
  requestAnimationFrame(update);
}

// Touch input
canvas.addEventListener('touchstart', (e) => {
  isTouching = true;
  touchX = e.touches[0].clientX;
  shoot();
});

canvas.addEventListener('touchmove', (e) => {
  touchX = e.touches[0].clientX;
});

canvas.addEventListener('touchend', () => {
  isTouching = false;
});

// Turbo mode on double tap
let lastTap = 0;
canvas.addEventListener("touchstart", (e) => {
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTap;
  if (tapLength < 300 && !turboActive && !turboCooldown) {
    turboActive = true;
    let turboInterval = setInterval(() => {
      if (isTouching) shoot();
    }, 100);
    setTimeout(() => {
      turboActive = false;
      clearInterval(turboInterval);
      turboCooldown = true;
      setTimeout(() => turboCooldown = false, 60000);
    }, 15000);
  }
  lastTap = currentTime;
});

update();
