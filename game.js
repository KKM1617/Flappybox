const canvas = document.getElementById('gameCanvas'),
      ctx = canvas.getContext('2d'),
      scoreEl = document.getElementById('score');
let bird = { x: 50, y: 240, w: 20, h: 20, vy: 0 },
    pipes = [], frame = 0, score = 0, playing = false;
const gravity = 0.5, jump = -8, pipeGap = 120, pipeSpeed = 2;

function reset() {
  bird.y = 240; bird.vy = 0;
  pipes = []; frame = 0; score = 0; playing = true;
  scoreEl.textContent = 'Score: ' + score;
}

function spawnPipe() {
  const topH = Math.random() * (canvas.height - pipeGap - 40) + 20;
  pipes.push({ x: canvas.width, y: 0, w: 40, h: topH });
  pipes.push({ x: canvas.width, y: topH + pipeGap, w: 40, h: canvas.height - (topH + pipeGap) });
}

function update() {
  if (!playing) return;
  frame++;
  // bird physics
  bird.vy += gravity;
  bird.y += bird.vy;
  // spawn pipes every 90 frames
  if (frame % 90 === 0) spawnPipe();
  // move pipes & check pass/collision
  pipes.forEach((p, i) => {
    p.x -= pipeSpeed;
    // passed?
    if (!p.counted && p.y == 0 && bird.x > p.x + p.w) {
      score++; scoreEl.textContent = 'Score: ' + score; p.counted = true;
    }
    // collision
    if (bird.x < p.x + p.w && bird.x + bird.w > p.x &&
        bird.y < p.y + p.h && bird.y + bird.h > p.y) {
      playing = false;
    }
    // remove off-screen
    if (p.x + p.w < 0) pipes.splice(i, 1);
  });
  // ground / ceiling
  if (bird.y + bird.h > canvas.height || bird.y < 0) playing = false;
}

function draw() {
  // clear
  ctx.fillStyle = '#70c5ce';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // bird
  ctx.fillStyle = '#ff0';
  ctx.fillRect(bird.x, bird.y, bird.w, bird.h);
  // pipes
  ctx.fillStyle = '#0f0';
  pipes.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));
  if (playing) requestAnimationFrame(loop);
  else showGameOver();
}

function loop() { update(); draw(); }

function flap() {
  if (!playing) return reset(), loop();
  bird.vy = jump;
}

function showGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = '32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
  ctx.font = '20px sans-serif';
  ctx.fillText('Click to Restart', canvas.width / 2, canvas.height / 2 + 20);
}

// start
canvas.addEventListener('click', flap);
document.addEventListener('keydown', e => e.code === 'Space' && flap());
reset(); loop();
