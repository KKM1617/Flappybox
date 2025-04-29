const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const music = document.getElementById("bgMusic");
const leaderboardBtn = document.getElementById("leaderboardButton");

document.addEventListener("click", () => {
  if (music.paused || music.muted) {
    music.muted = false;
    music.play().catch(() => {});
  }
}, { once: true });

music.volume = 0.3;

// Ask for name only once
let playerName = localStorage.getItem("flappyPlayerName");
if (!playerName) {
  playerName = prompt("Enter your unique player name:")?.trim();
  while (!playerName || playerName.length < 2) {
    playerName = prompt("Please enter a valid name:")?.trim();
  }
  localStorage.setItem("flappyPlayerName", playerName);
}

const W = canvas.width, H = canvas.height;
let bird, pipes, stars, frame, score, playing, pulsePhase = 0;
const gravity = 0.4, jumpStrength = -7;

function reset() {
  bird = { x: 50, y: H / 2, w: 34, h: 24, dy: 0 };
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
  leaderboardBtn.style.display = "none";
}

function spawnPipe() {
  const gap = 110;
  const topH = Math.random() * (H - gap - 120) + 40;
  pipes.push({ x: W, topH, passed: false });
}

function getBackgroundColors() {
  if (score < 10) return ["#141e30", "#0d0d0d"];
  else if (score < 30) return ["#2c003e", "#0d0d0d"];
  else if (score < 60) return ["#3e0000", "#0d0d0d"];
  else return ["#004d00", "#0d0d0d"];
}

function update() {
  if (!playing) return;
  frame++;
  pulsePhase += 0.1;
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
  const [top, bottom] = getBackgroundColors();
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, top);
  bgGrad.addColorStop(1, bottom);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  stars.forEach((s) => {
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    s.x -= 0.3;
    if (s.x < 0) s.x = W;
  });
  ctx.globalAlpha = 1;

  pipes.forEach((p) => {
    const grad = ctx.createLinearGradient(p.x, 0, p.x, p.topH);
    grad.addColorStop(0, "#00fff2");
    grad.addColorStop(1, "#008c85");
    ctx.fillStyle = grad;
    ctx.shadowColor = "#00fff2";
    ctx.shadowBlur = 15;
    ctx.fillRect(p.x, 0, 52, p.topH);
    ctx.fillRect(p.x, p.topH + 110, 52, H - p.topH - 110);
  });
  ctx.shadowBlur = 0;

  const pulse = Math.sin(pulsePhase) * 3;
  ctx.save();
  ctx.fillStyle = "#ff007c";
  ctx.shadowColor = "#ff007c";
  ctx.shadowBlur = 20 + pulse * 2;
  ctx.fillRect(bird.x - pulse / 2, bird.y - pulse / 2, bird.w + pulse, bird.h + pulse);
  ctx.restore();

  ctx.shadowColor = "#fff";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#fff";
  ctx.font = "32px Orbitron";
  ctx.textAlign = "center";
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
    saveScore(score);
    reset();
    loop();
  } else {
    bird.dy = jumpStrength;
  }
}

function showGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "#fff";
  ctx.shadowBlur = 20;
  ctx.font = "36px Orbitron";
  ctx.fillText("Game Over", W / 2, H / 2 - 30);
  ctx.font = "20px Orbitron";
  ctx.fillText("Tap to Restart", W / 2, H / 2 + 10);
  ctx.shadowBlur = 0;

  leaderboardBtn.style.display = "block";
}

function saveScore(score) {
  const record = { name: playerName, score };
  if (window.firebaseDatabase && window.firebaseRef && window.firebasePush) {
    const db = window.firebaseDatabase;
    const ref = window.firebaseRef;
    const push = window.firebasePush;
    push(ref(db, "leaderboard"), record);
  } else {
    console.warn("Firebase not available. Score not saved.");
  }
}

canvas.addEventListener("click", flap);
leaderboardBtn.addEventListener("click", () => {
  window.open("leaderboard.html", "_blank");
});

reset();
loop();
