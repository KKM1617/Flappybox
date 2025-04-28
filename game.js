const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

const W = canvas.width, H = canvas.height;
let bird, pipes, stars, frame, score, playing;
const gravity = 0.4, jumpStrength = -7;

function reset() {
  bird = { x: 50, y: H/2, w: 34, h: 24, dy: 0 };
  pipes = [];
  stars = Array.from({ length: 80 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.5 + 0.5
  }));
  frame = 0;
  score = 0;
  playing = true;
  scoreEl.textContent = `Score: ${score}`;
}

function spawnPipe() {
  const gap = 110;
  const topH = Math.random() * (H - gap - 120) + 40;
  pipes.push({ x: W, topH, passed: false });
}

function update() {
  if (!playing) return;
  frame++;
  bird.dy += gravity;
  bird.y += bird.dy;

  if (frame % 90 === 0) spawnPipe();

  pipes.forEach((p, i) => {
    p.x -= 2.5;
    if (!p.passed && bird.x > p.x + 34) {
      score++;
      scoreEl.textContent = `Score: ${score}`;
      p.passed = true;
    }
    if (bird.x < p.x + 52 && bird.x + bird.w > p.x) {
      if (bird.y < p.topH || bird.y + bird.h > p.topH + 110) playing = false;
    }
    if (p.x < -60) pipes.splice(i, 1);
  });

  if (bird.y < 0 || bird.y + bird.h > H) playing = false;
}

function draw() {
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#141e30');
  bgGrad.addColorStop(1, '#0d0d0d');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#fff';
  stars.forEach(s => {
    ctx.globalAlpha = Math.random() * 0.5 + 0.2;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    s.x -= 0.3;
    if (s.x < 0) s.x = W;
  });
  ctx.globalAlpha = 1;

  pipes.forEach(p => {
    const grad = ctx.createLinearGradient(p.x, 0, p.x, p.topH);
    grad.addColorStop(0, '#00fff2');
    grad.addColorStop(1, '#008c85');
    ctx.fillStyle = grad;
    ctx.shadowColor = '#00fff2';
    ctx.shadowBlur = 15;
    ctx.fillRect(p.x, 0, 52, p.topH);
    ctx.fillRect(p.x, p.topH + 110, 52, H - p.topH - 110);
  });
  ctx.shadowBlur = 0;

  ctx.save();
  ctx.fillStyle = '#ff007c';
  ctx.shadowColor = '#ff007c';
  ctx.shadowBlur = 20;
  ctx.fillRect(bird.x, bird.y, bird.w, bird.h);
  ctx.restore();

  ctx.shadowColor = '#fff';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#fff';
  ctx.font = '32px Orbitron';
  ctx.textAlign = 'center';
  ctx.fillText(score, W / 2, 60);
  ctx.shadowBlur = 0;

  if (playing) requestAnimationFrame(loop);
  else showGameOver();
}

function loop() {
  update();
  draw();
}

function flap() {
  if (!playing) {
    reset();
    loop();
  } else {
    bird.dy = jumpStrength;
  }
}

function showGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff';
  ctx.shadowColor = '#fff';
  ctx.shadowBlur = 20;
  ctx.font = '36px Orbitron';
  ctx.fillText('Game Over', W / 2, H / 2 - 20);
  ctx.font = '20px Orbitron';
  ctx.fillText('Click to Restart', W / 2, H / 2 + 20);
  ctx.shadowBlur = 0;
}

canvas.addEventListener('click', flap);
document.addEventListener('keydown', e => e.code === 'Space' && flap());

reset();
loop();
          
