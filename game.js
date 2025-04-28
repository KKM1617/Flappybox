const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
const W      = canvas.width, H = canvas.height;

// game vars
let bird, pipes, frame, score, best, playing, gravity, jumpStrength;

// initialize/reset
function reset() {
  bird = { x: 50, y: H/2, w: 34, h: 24, dy: 0, rot: 0 };
  pipes = [];
  frame = 0;
  score = 0;
  best  = +localStorage.getItem('best') || 0;
  playing = true;
  gravity     = 0.5;
  jumpStrength = -8;
}

// spawn a new pipe-pair
function spawnPipe() {
  const gap = 100;
  const topH = Math.random()*(H - gap - 120) + 40;
  pipes.push({
    x: W,
    top:   { y: 0,    h: topH },
    bot:   { y: topH + gap, h: H - topH - gap - 80 } // reserve 80px for ground
  });
}

// game update
function update() {
  if (!playing) return;

  frame++;
  bird.dy += gravity;
  bird.y  += bird.dy;

  // rotation (tilt up on flap, then tilt down)
  bird.rot = Math.min(Math.max(bird.dy * 3, -25), 90) * Math.PI/180;

  // spawn pipes every 100 frames
  if (frame % 100 === 0) spawnPipe();

  // move pipes and check collisions
  pipes.forEach((p, i) => {
    p.x -= 2;
    // score when bird passes a top pipe
    if (!p.counted && p.x + 34 < bird.x) {
      score++;
      p.counted = true;
    }
    // AABB collision
    ['top','bot'].forEach(part => {
      const r = p[part];
      if (bird.x < p.x + 52 && bird.x + bird.w > p.x &&
          bird.y < r.y + r.h && bird.y + bird.h > r.y) {
        playing = false;
      }
    });
    // remove off-screen
    if (p.x < -52) pipes.splice(i,1);
  });

  // ground/ceiling
  if (bird.y + bird.h > H - 80 || bird.y < 0) playing = false;
}

// draw everything
function draw() {
  // clear
  ctx.fillStyle = '#70c5ce';
  ctx.fillRect(0,0,W,H);

  // pipes
  ctx.fillStyle = '#5ec576';
  pipes.forEach(p => {
    // top
    ctx.fillRect(p.x, p.top.y, 52, p.top.h);
    // bottom
    ctx.fillRect(p.x, p.bot.y, 52, p.bot.h);
  });

  // ground
  ctx.fillStyle = '#ded895';
  ctx.fillRect(0, H-80, W, 80);

  // bird (rotated)
  ctx.save();
  ctx.translate(bird.x + bird.w/2, bird.y + bird.h/2);
  ctx.rotate(bird.rot);
  ctx.fillStyle = '#ffcc00';
  ctx.fillRect(-bird.w/2, -bird.h/2, bird.w, bird.h);
  ctx.restore();

  // score
  ctx.fillStyle = '#fff';
  ctx.font = '32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(score, W/2, 60);

  if (playing) requestAnimationFrame(loop);
  else showGameOver();
}

function loop() {
  update();
  draw();
}

// flap/jump
function flap() {
  if (!playing) {
    reset();
    loop();
  } else {
    bird.dy = jumpStrength;
  }
}

// game over overlay
function showGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0,0,W,H);
  ctx.fillStyle = '#fff';
  ctx.font = '28px sans-serif';
  ctx.fillText('Game Over', W/2, H/2 - 20);
  ctx.font = '20px sans-serif';
  ctx.fillText('Click or Space to restart', W/2, H/2 + 20);

  // best score save
  best = Math.max(best, score);
  localStorage.setItem('best', best);
  ctx.fillText(`Best: ${best}`, W/2, H/2 + 60);
}

// input
canvas.addEventListener('click', flap);
document.addEventListener('keydown', e => e.code === 'Space' && flap());

// start
reset();
loop();
