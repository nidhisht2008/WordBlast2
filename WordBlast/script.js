const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.focus();

const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const finalScoreElement = document.getElementById('final-score');
const gameOverScreen = document.getElementById('game-over');
const livesElement = document.getElementById('lives');
const typeFeedback = document.getElementById('type-feedback');

canvas.width = 800;
canvas.height = 600;

/* -------------------- GAME STATE -------------------- */
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let lives = 3;
let isPaused = false;
let isGameOver = false;

let startTime = Date.now();
let wordsDestroyed = 0;

let spawnRate = 2000;
let lastSpawnTime = 0;

let level = 1;
let speedMultiplier = 1;
let showLevelUp = false;
let levelUpTime = 0;

/* -------------------- BOSS SYSTEM -------------------- */
let boss = null;
let isBossActive = false;
let nextBossScore = 1000;

/* -------------------- UI INIT -------------------- */
highScoreElement.innerText = highScore;
updateLivesUI();

/* -------------------- WORD DATA -------------------- */
const wordList = [
  "code","bug","fix","git","push","pull","merge",
  "html","css","react","node","array","stack",
  "queue","hash","tree","graph","cloud","server"
];

const neonColors = ["#00ffff", "#ff00ff", "#ffff00", "#00ff00", "#ff6600"];
let enemies = [];

/* -------------------- ENEMY CLASS -------------------- */
class Enemy {
  constructor(x, y, text) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.speed = (1 + Math.random()) * speedMultiplier;
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

/* -------------------- BOSS CLASS -------------------- */
class BossWord {
  constructor(text) {
    this.text = text;
    this.maxHealth = text.length;
    this.health = text.length;
    this.x = canvas.width / 2 - 260;
    this.y = 80;
    this.speed = 0.3;
  }

  draw() {
    // Boss word
    ctx.font = "32px Courier New";
    ctx.fillStyle = "#ff4444";
    ctx.fillText(this.text, this.x, this.y);

    // Health bar background
    ctx.fillStyle = "#333";
    ctx.fillRect(this.x, this.y - 35, 520, 14);

    // Health bar
    ctx.fillStyle = "#ff0000";
    const healthWidth = (this.health / this.maxHealth) * 520;
    ctx.fillRect(this.x, this.y - 35, healthWidth, 14);
  }

  update() {
    this.y += this.speed;
  }
}

/* -------------------- SPAWN ENEMY -------------------- */
function spawnEnemy() {
  if (isBossActive) return;

  const text = wordList[Math.floor(Math.random() * wordList.length)];
  let x, safe = false, attempts = 0;

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

/* -------------------- UI HELPERS -------------------- */
function updateLivesUI() {
  livesElement.innerText = "❤️".repeat(lives);
}

function gameOver() {
  isGameOver = true;
  finalScoreElement.innerText = score;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    highScoreElement.innerText = highScore;
  }

  const elapsedMinutes = (Date.now() - startTime) / 60000;
  const wpm = elapsedMinutes > 0 ? Math.round(wordsDestroyed / elapsedMinutes) : 0;
  document.getElementById("wpm-score").innerHTML = `<strong>WPM:</strong> ${wpm}`;

  gameOverScreen.classList.remove("hidden");
}

/* -------------------- INPUT HANDLER -------------------- */
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    isPaused = !isPaused;
    return;
  }

  if (isGameOver || isPaused) return;

  const key = e.key.toLowerCase();

  typeFeedback.innerText = e.key.toUpperCase();
  typeFeedback.style.opacity = 1;
  setTimeout(() => (typeFeedback.style.opacity = 0), 150);

  /* ----- BOSS INPUT ----- */
  if (isBossActive && boss) {
    if (boss.text[0]?.toLowerCase() === key) {
      boss.text = boss.text.slice(1);
      boss.health--;

      if (boss.health <= 0) {
        boss = null;
        isBossActive = false;
        nextBossScore += 100;
      }
    }
    return;
  }

  /* ----- NORMAL ENEMIES ----- */
  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].text[0]?.toLowerCase() === key) {
      enemies[i].text = enemies[i].text.slice(1);
      enemies[i].color = "#ffffff";

      if (enemies[i].text === "") {
        enemies.splice(i, 1);
        score += 10;
        scoreElement.innerText = score;
        wordsDestroyed++;

        if (score >= level * 100) {
          level++;
          speedMultiplier += 0.35;
          showLevelUp = true;
          levelUpTime = Date.now();
        }

        if (score >= nextBossScore && !isBossActive) {
          isBossActive = true;
          boss = new BossWord("supercalifragilisticexpialidocious");
          enemies = [];
        }
      }
      break;
    }
  }
});

/* -------------------- GAME LOOP -------------------- */
function gameLoop(timestamp) {
  if (isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (showLevelUp) {
    ctx.fillStyle = "#ffff00";
    ctx.font = "40px Courier New";
    ctx.textAlign = "center";
    ctx.fillText(`LEVEL ${level}!`, canvas.width / 2, canvas.height / 2);
    if (Date.now() - levelUpTime > 1200) showLevelUp = false;
  }

  if (isPaused) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0f0";
    ctx.font = "40px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
    requestAnimationFrame(gameLoop);
    return;
  }

  if (!isBossActive && timestamp - lastSpawnTime > spawnRate) {
    spawnEnemy();
    lastSpawnTime = timestamp;
    if (spawnRate > 500) spawnRate -= 20;
  }

  /* ----- BOSS UPDATE ----- */
  if (isBossActive && boss) {
    boss.update();
    boss.draw();
  }

  /* ----- ENEMY UPDATE ----- */
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.update();
    enemy.draw();

    if (enemy.y > canvas.height) {
      enemies.splice(i, 1);
      lives--;
      updateLivesUI();

      if (lives <= 0) {
        gameOver();
        return;
      }
    }
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);