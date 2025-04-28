const bird = document.getElementById('bird');
const pipe = document.getElementById('pipe');
const pipe2 = document.getElementById('pipe2');
const scoreDisplay = document.getElementById('score');
const startScreen = document.getElementById('startScreen');
const game = document.getElementById('game');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreText = document.getElementById('finalScore');
const unlockPopup = document.getElementById('unlockPopup');

let birdTop = 200;
let gravity = 2;
let isJumping = false;
let pipeLeft = 400;
let pipeHeight = 200;
let pipe2Left = 700;
let pipe2Height = 150;
let score = 0;
let speed = 2;
let gap = 150;
let birdSkins = ['#ff00ff', '#00ffea', '#ffea00', '#ff0077'];
let currentSkin = 0;
let highScore = localStorage.getItem('highScore') || 0;
let intervalId;

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', restartGame);

function startGame() {
    startScreen.classList.add('hidden');
    game.classList.remove('hidden');
    scoreDisplay.classList.remove('hidden');
    document.addEventListener('keydown', jump);
    document.addEventListener('click', jump);
    intervalId = setInterval(update, 20);
}

function update() {
    if (!isJumping) {
        birdTop += gravity;
        bird.style.top = birdTop + 'px';
    }

    pipeLeft -= speed;
    pipe2Left -= speed;

    if (pipeLeft < -60) {
        pipeLeft = 400;
        pipeHeight = Math.floor(Math.random() * 300) + 100;
        score++;
        checkLevelUp();
    }
    if (pipe2Left < -60) {
        pipe2Left = 400 + Math.random() * 300;
        pipe2Height = Math.floor(Math.random() * 300) + 100;
        score++;
        checkLevelUp();
    }

    pipe.style.left = pipeLeft + 'px';
    pipe.style.height = pipeHeight + 'px';

    pipe2.style.left = pipe2Left + 'px';
    pipe2.style.top = pipe2Height + gap + 'px';
    pipe2.style.height = (600 - pipe2Height - gap) + 'px';

    if (
        (pipeLeft < 90 && pipeLeft > 30 && birdTop < pipeHeight) ||
        (pipe2Left < 90 && pipe2Left > 30 && birdTop > (pipe2Height + gap))
    ) {
        gameOver();
    }

    if (birdTop > 560 || birdTop < 0) {
        gameOver();
    }

    scoreDisplay.innerText = `Score: ${score} | High Score: ${highScore}`;
}

function jump() {
    if (birdTop > 0) {
        birdTop -= 50;
        isJumping = true;
        setTimeout(() => {
            isJumping = false;
        }, 200);
    }
}

function checkLevelUp() {
    if (score % 5 === 0) {
        speed += 0.5;
        gap -= 10;
        if (gap < 80) gap = 80;
    }

    if (score % 10 === 0) {
        unlockBird();
    }
}

function unlockBird() {
    currentSkin = (currentSkin + 1) % birdSkins.length;
    bird.style.background = birdSkins[currentSkin];
    bird.style.boxShadow = `0 0 10px ${birdSkins[currentSkin]}`;

    unlockPopup.classList.remove('hidden');
    setTimeout(() => {
        unlockPopup.classList.add('hidden');
    }, 1500);
}

function gameOver() {
    clearInterval(intervalId);
    document.removeEventListener('keydown', jump);
    document.removeEventListener('click', jump);
    game.classList.add('hidden');
    scoreDisplay.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    finalScoreText.innerText = `Your Score: ${score}\nHigh Score: ${highScore}`;
}

function restartGame() {
    window.location.reload();
}
