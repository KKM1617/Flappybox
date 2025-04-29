const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const music = document.getElementById("bgMusic");
const leaderboardBtn = document.getElementById("leaderboardButton");

let playerName = localStorage.getItem("flappyPlayerName");
if (!playerName) {
  playerName = prompt("Enter your unique player name:")?.trim();
  while (!playerName || playerName.length < 2) {
    playerName = prompt("Please enter a valid name:")?.trim();
  }
  localStorage.setItem("flappyPlayerName", playerName);
}

music.volume = 0.3;
document.addEventListener("click", () => {
  if (music.paused || music.muted) {
    music.muted = false;
    music.play().catch(() => {});
  }
}, { once: true });

const W = canvas.width, H = canvas.height;
let bird, pipes, stars, frame, score, playing, pulsePhase = 0;
const gravity = 0.4, jumpStrength = -7;

let storyState = {
  shown: {},
  bubble: "",
  bubbleTimer: 0,
  typingText: "",
  typingIndex: 0
};

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
  storyState.typingText = "";
  storyState.bubble = "";
  storyState.typingIndex = 0;
  storyState.shown = {};
  triggerDialogue("start");
}

function spawnPipe() {
  const gap = 110;
  const topH = Math.random() * (H - gap - 120) + 40;
  pipes.push({ x: W, topH, passed: false });
}

function triggerDialogue(key) {
  const dialogues = {
    start: "Where am I? Is this... flight?",
    5: "You're good at this...",
    10: "I've seen these pipes before.",
    20: "What if we never escape?",
    die: "We failed. Again."
  };
  if (storyState.shown[key]) return;
  const text = dialogues[key];
  if (!text) return;
  storyState.typingText = text;
  storyState.typingIndex = 0;
  storyState.bubble = "";
  storyState.bubbleTimer = 180;
  storyState.shown[key] = true;
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
      if (score === 5 || score === 10 || score === 20) triggerDialogue(score);
    }
    if (bird.x < p.x + 52 && bird.x + bird.w > p.x) {
      if (bird.y < p.topH || bird.y + bird.h > p.topH + 110) playing = false;
    }
    if (p.x < -60) pipes.splice(i, 1);
  });

  if (bird.y < 0 || bird.y + bird.h > H) playing = false;

  if (storyState.typingText && storyState.bubbleTimer > 0) {
    if (storyState.typingIndex < storyState.typingText.length) {
      if (frame % 3 === 0) {
        storyState.typingIndex++;
        storyState.bubble = storyState.typingText.slice(0, storyState.typingIndex);
      }
    } else {
      storyState.bubbleTimer--;
    }
  }
}

function draw() {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#141e30");
  bg.addColorStop(1, "#0d0d0d");
  ctx.fillStyle = bg;
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
    ctx.fillStyle = "#00fff2";
    ctx.shadowColor = "#00fff2";
    ctx.shadowBlur = 15;
    ctx.fillRect(p.x, 0, 52, p.topH);
    ctx.fillRect(p.x, p.topH + 110, 52, H - p.topH - 110);
  });
  ctx.shadowBlur = 0;

  ctx.save();
  ctx.fillStyle = "#ff007c";
  ctx.shadowColor = "#ff007c";
  ctx.shadowBlur = 20;
  ctx.fillRect(bird.x, bird.y, bird.w, bird.h);
  ctx.restore();

  // Speech bubble
  if (storyState.bubble) {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "12px Orbitron";
    ctx.textAlign = "left";
    ctx.shadowColor = "#0ff";
    ctx.shadowBlur = 8;
    ctx.fillText(storyState.bubble, bird.x + 40, bird.y + 10);
    ctx.shadowBlur = 0;
  }

  ctx.fillStyle = "#fff";
  ctx.font = "32px Orbitron";
  ctx.textAlign = "center";
  ctx.fillText(score, W / 2, 60);

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
    triggerDialogue("die");
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
  }
}

canvas.addEventListener("click", flap);
leaderboardBtn.addEventListener("click", () => {
  window.open("leaderboard.html", "_blank");
});

reset();
loop();
      
