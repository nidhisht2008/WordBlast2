const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const finalScoreElement = document.getElementById('final-score');
const gameOverScreen = document.getElementById('game-over');

canvas.width = 800;
canvas.height = 600;

/* Game State */
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let isPaused=false;
let startTime= Date.now();
let wordsDestroyed=0;
let isGameOver = false;
let spawnRate = 2000;
let lastSpawnTime = 0;

highScoreElement.innerText = highScore;

/* Word List */
const wordList = [
    "code","bug","fix","git","push","pull","merge",
    "html","css","react","node","array","stack",
    "queue","hash","tree","graph","cloud","server"
];

/* Neon colors (Issue: Change Enemy Color) */
const neonColors = ["#00ffff", "#ff00ff", "#ffff00", "#00ff00", "#ff6600"];

let enemies = [];

/* Enemy Class */
class Enemy {
    constructor(x, y, text) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.speed = 1 + Math.random();
        this.color = neonColors[Math.floor(Math.random() * neonColors.length)];
    }

    draw() {
        ctx.font = "26px Courier New";
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.x, this.y);
    }

    update() {
        this.y += this.speed;
    }
}

/* Spawn Enemy */
function spawnEnemy() {
    const text = wordList[Math.floor(Math.random() * wordList.length)];

    let x;
    let safe = false;
    let attempts = 0;

    while (!safe && attempts < 10) {
        x = Math.random() * (canvas.width - 150) + 20;
        safe = true;

        for (let enemy of enemies) {
            if (Math.abs(enemy.x - x) < 120) { 
                safe = false;
                break;
            }
        }
        attempts++;
    }

    enemies.push(new Enemy(x, -20, text));
}

/* Game Over */
function gameOver() {
    isGameOver = true;
    finalScoreElement.innerText = score;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
        highScoreElement.innerText = highScore;
    }

    const elapsedTimeMs = Date.now() - startTime;
    const elapsedMinutes = elapsedTimeMs / 60000;

    const wpm = elapsedMinutes > 0
        ? Math.round(wordsDestroyed / elapsedMinutes)
        : 0;
    const wpmElement = document.createElement("p");
    wpmElement.innerHTML = `<strong>WPM:</strong> ${wpm}`;
    wpmElement.style.marginTop = "10px";
    gameOverScreen.appendChild(wpmElement);

    gameOverScreen.classList.remove("hidden");
}

/* Keyboard Input */
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        isPaused = !isPaused;
        return;
    }

    if (isGameOver||isPaused) return;

    const key = e.key.toLowerCase();

    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].text[0]?.toLowerCase() === key) {
            enemies[i].text = enemies[i].text.slice(1);

            if (enemies[i].text === "") {
                enemies.splice(i, 1);
                score += 10;
                scoreElement.innerText = score;
                wordsDestroyed += 1;
            }
            break;
        }
    }
});

/* Game Loop */
function gameLoop(timestamp) {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isPaused) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0f0";
    ctx.font = "40px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);

    ctx.font = "16px Courier New";
    ctx.fillText("Press ESC to resume", canvas.width / 2, canvas.height / 2 + 40);

    requestAnimationFrame(gameLoop);
    return;
    }

    if (timestamp - lastSpawnTime > spawnRate) {
        spawnEnemy();
        lastSpawnTime = timestamp;
        if (spawnRate > 500) spawnRate -= 20;
    }

    for (let enemy of enemies) {
        enemy.update();
        enemy.draw();

        if (enemy.y > canvas.height) {
            gameOver();
        }
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);