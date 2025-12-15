const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const gameOverScreen = document.getElementById('game-over');


canvas.width = 800;
canvas.height = 600;


let score = 0;
let isGameOver = false;
let spawnRate = 2000; 
let lastSpawnTime = 0;


const wordList = [
    "code", "bug", "fix", "git", "push", "pull", "merge", 
    "java", "node", "html", "css", "react", "vue", "data",
    "loop", "if", "else", "var", "let", "const", "array","binary", "cache", "thread", "process", "memory",
  "pointer", "stack", "queue", "heap", "tree",
  "graph", "hash", "index", "search", "sort",
  "encrypt", "decrypt", "token", "auth", "login",
  "logout", "session", "cookie", "middleware", "router",
  "endpoint", "request", "response", "status", "timeout",
  "latency", "bandwidth", "cloud", "aws", "azure",
  "gcp", "ci", "cd", "pipeline", "monitor",
  "log", "trace", "error", "exception", "retry"
];


let enemies = [];

class Enemy {
    constructor(x, y, text) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.speed = 1 + Math.random(); 
        this.color = '#0f0';
    }

    draw() {
        ctx.font = '20px Courier New';
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.x, this.y);
    }

    update() {
        this.y += this.speed;
    }
}

function spawnEnemy() {
    const text = wordList[Math.floor(Math.random() * wordList.length)];
    const x = Math.random() * (canvas.width - 100) + 50;
    const y = -20; 
    enemies.push(new Enemy(x, y, text));
}

function gameOver() {
    isGameOver = true;
    finalScoreElement.innerText = score;
    gameOverScreen.classList.remove('hidden');
}


window.addEventListener('keydown', (e) => {
    if (isGameOver) return;

    const key = e.key.toLowerCase();

    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].text[0] && enemies[i].text[0].toLowerCase() === key) {
            enemies[i].text = enemies[i].text.slice(1);

            if (enemies[i].text === "") {
                enemies.splice(i, 1);
                score += 10;
                scoreElement.innerText = score;
            }
            break;
        }
    }
});

function gameLoop(timestamp) {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);


    if (timestamp - lastSpawnTime > spawnRate) {
        spawnEnemy();
        lastSpawnTime = timestamp;

        if (spawnRate > 500) spawnRate -= 10;
    }


    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];
        enemy.update();
        enemy.draw();

        if (enemy.y > canvas.height) {
            gameOver();
        }
    }

    requestAnimationFrame(gameLoop);
}


requestAnimationFrame(gameLoop);