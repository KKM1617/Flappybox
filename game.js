const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const unlockPopup = document.getElementById('unlockPopup');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const homeBtn = document.getElementById('homeBtn');
const closeUnlock = document.getElementById('closeUnlock');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let bird, pipes, score, level, speed, highScore, stars, unlocked;

const gravity = 0.5;
const jumpStrength = -8;

function initGame() {
  bird = { x: 80, y: 300, width: 30, height: 30, dy: 0, color: 'cyan' };
  pipes = [];
  score = 0;
  level = 1;
  speed = 2;
  stars = Array.from({ length: 50 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 2
  }));
  unlocked = localStorage.getItem('unlocked') || 0;
}

function startGame() {
  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  unlockPopup.classList.add('hidden');
  canvas.style.display = 'block';
  initGame();
  loop();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function update() {
  bird.dy += gravity;
  bird.y += bird.dy;

  if (bird.y + bird.height > canvas.height || bird.y < 0) {
    gameOver();
  }

  pipes.forEach(pipe => {
    pipe.x -= speed;
    if (collide(bird, pipe)) gameOver();
  });

  pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);

  if (Math.random() < 0.02) {
    const gap = 120;
    const topHeight = Math.random() * (canvas.height - gap - 100);
    pipes.push({ x: canvas.width, y: 0, width: 40, height: topHeight });
    pipes.push({ x: canvas.width, y: topHeight + gap, width: 40, height: canvas.height - topHeight - gap });
  }

  stars.forEach(star => {
    star.x -= 0.5;
    if (star.x < 0) {
      star.x = canvas.width;
      star.y = Math.random() * canvas.height;
    }
  });

  score++;
  levelUp();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Stars
  ctx.fillStyle = '#0ff';
  stars.forEach(star => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw Bird
  ctx.fillStyle = bird.color;
  ctx.fillRect(bird.x, bird.y, bird.width, bird.height);

  // Draw Pipes
  ctx.fillStyle = 'lime';
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
  });

  // Draw Score
  ctx.fillStyle = 'white';
  ctx.font = '24px Orbitron';
  ctx.fillText('Score: ' + score, 10, 30);
}

function levelUp() {
  if (score === 300) {
    speed = 3;
    level = 2;
  }
  if (score === 600) {
    speed = 4;
    level = 3;
    if (unlocked < 1) {
      unlocked = 1;
      localStorage.setItem('unlocked', unlocked);
      showUnlock();
    }
  }
}

function gameOver() {
  cancelAnimationFrame(loop);
  canvas.style.display = 'none';
  gameOverScreen.classList.remove('hidden');

  document.getElementById('currentScore').innerText = `Score: ${score}`;
  highScore = Math.max(score, localStorage.getItem('highScore') || 0);
  localStorage.setItem('highScore', highScore);
  document.getElementById('highScore').innerText = `High Score: ${highScore}`;
}

function showUnlock() {
  unlockPopup.classList.remove('hidden');
}

function collide(bird, pipe) {
  return bird.x < pipe.x + pipe.width &&
         bird.x + bird.width > pipe.x &&
         bird.y < pipe.y + pipe.height &&
         bird.y + bird.height > pipe.y;
}

canvas.addEventListener('click', () => {
  bird.dy = jumpStrength;
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
homeBtn.addEventListener('click', () => {
  startScreen.classList.remove('hidden');
  gameOverScreen.classList.add('hidden');
});
closeUnlock.addEventListener('click', () => {
  unlockPopup.classList.add('hidden');
});
      
