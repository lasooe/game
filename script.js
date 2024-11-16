// Game state variables
let gameStarted = false;
let score = 0;
let lives = 3;
let upPressed = false;
let downPressed = false;
let leftPressed = false;
let rightPressed = false;

const main = document.querySelector('main');
const startDiv = document.querySelector('.startDiv');
const startButton = document.querySelector('.start');
const scoreElement = document.querySelector('.score p');
const livesElement = document.querySelector('.lives ul');

// Initial maze configuration
let maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 0, 1, 0, 0, 0, 0, 3, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 1, 0, 3, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 3, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Initialize game board
// Initialize game board
function initializeGame() {
    main.innerHTML = '';
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            let block = document.createElement('div');
            block.classList.add('block');
            block.style.gridColumnStart = x + 1;
            block.style.gridRowStart = y + 1;

            switch (maze[y][x]) {
                case 1:
                    block.classList.add('wall');
                    break;
                case 2:
                    block.id = 'player';
                    let mouth = document.createElement('div');
                    mouth.classList.add('right'); // Default direction
                    block.appendChild(mouth);
                    break;
                case 3:
                    block.classList.add('enemy');
                    break;
                case 0:
                    block.classList.add('point');
                    block.style.height = '1vh';
                    block.style.width = '1vh';
                    break;
            }
            main.appendChild(block);
        }
    }
}


// Player movement functions
function movePlayer(direction) {
    if (!gameStarted) return;

    const player = document.querySelector('#player');
    const playerPos = getElementPosition(player);
    let newX = playerPos.x;
    let newY = playerPos.y;

    switch (direction) {
        case 'up':
            newY--;
            player.querySelector('div').className = 'up';
            break;
        case 'down':
            newY++;
            player.querySelector('div').className = 'down';
            break;
        case 'left':
            newX--;
            player.querySelector('div').className = 'left';
            break;
        case 'right':
            newX++;
            player.querySelector('div').className = 'right';
            break;
    }

    if (isValidMove(newX, newY)) {
        maze[playerPos.y][playerPos.x] = 0;
        maze[newY][newX] = 2;
        player.style.gridColumnStart = newX + 1;
        player.style.gridRowStart = newY + 1;
        checkCollisions(newX, newY);
    }
}

function isValidMove(x, y) {
    return x >= 0 && x < 10 && y >= 0 && y < 10 && maze[y][x] !== 1;
}

function getElementPosition(element) {
    return {
        x: parseInt(element.style.gridColumnStart) - 1,
        y: parseInt(element.style.gridRowStart) - 1
    };
}

// Collision detection
function checkCollisions(x, y) {
    // Check if player is on a point (value 0 in the maze)
    if (maze[y][x] === 0) {
        // Remove the point from the maze
        maze[y][x] = 0;

        // Find the point block and remove it
        const targetElement = document.querySelector(`[style*="grid-column-start: ${x + 1}"][style*="grid-row-start: ${y + 1}"]`);
        if (targetElement) {
            targetElement.remove();
            score += 10;
            scoreElement.textContent = score;
            checkWinCondition();
        }
    }
    
    // Check for enemy collision
    if (maze[y][x] === 3) {
        handleEnemyCollision();
    }
}


function handleEnemyCollision() {
    const player = document.querySelector('#player');
    player.classList.add('hit');
    lives--;
    updateLives();
    
    setTimeout(() => {
        player.classList.remove('hit');
        if (lives <= 0) {
            gameOver();
        }
    }, 1500);
}

function updateLives() {
    livesElement.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        const life = document.createElement('li');
        livesElement.appendChild(life);
    }
}

// Game state functions
function checkWinCondition() {
    const remainingPoints = document.querySelectorAll('.point').length;
    if (remainingPoints === 0) {
        showGameOver("You Win! All points collected!");
    }
}

function gameOver(message = "Game Over!") {
    gameStarted = false;
    const player = document.querySelector('#player');
    player.classList.add('dead');

    const gameOverDiv = document.createElement('div');
    gameOverDiv.classList.add('game-over');
    gameOverDiv.innerHTML = `
        <h2>${message}</h2>
        <p>Final Score: ${score}</p>
        <button onclick="resetGame()">Play Again</button>
    `;
    document.body.appendChild(gameOverDiv);
    
    saveScore();
}

function resetGame() {
    location.reload();
}

// Event listeners
document.addEventListener('keydown', (event) => {
    if (!gameStarted) return;
    
    switch (event.key) {
        case 'ArrowUp':
            movePlayer('up');
            break;
        case 'ArrowDown':
            movePlayer('down');
            break;
        case 'ArrowLeft':
            movePlayer('left');
            break;
        case 'ArrowRight':
            movePlayer('right');
            break;
    }
});

// Button controls
document.getElementById('ubttn').addEventListener('click', () => movePlayer('up'));
document.getElementById('dbttn').addEventListener('click', () => movePlayer('down'));
document.getElementById('lbttn').addEventListener('click', () => movePlayer('left'));
document.getElementById('rbttn').addEventListener('click', () => movePlayer('right'));

// Start game
startButton.addEventListener('click', () => {
    startDiv.style.display = 'none';
    gameStarted = true;
    initializeGame();
    updateLives();
});

// Enemy movement
function moveEnemies() {
    if (!gameStarted) return;
    
    const enemies = document.querySelectorAll('.enemy');
    enemies.forEach(enemy => {
        const directions = ['up', 'down', 'left', 'right'];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const pos = getElementPosition(enemy);
        let newX = pos.x;
        let newY = pos.y;

        switch (direction) {
            case 'up': newY--; break;
            case 'down': newY++; break;
            case 'left': newX--; break;
            case 'right': newX++; break;
        }

        if (isValidMove(newX, newY)) {
            enemy.style.gridColumnStart = newX + 1;
            enemy.style.gridRowStart = newY + 1;
        }
    });
}

// Start enemy movement
setInterval(moveEnemies, 1000);

// Score saving
function saveScore() {
    const playerName = prompt("Enter your name for the leaderboard:");
    if (playerName) {
        const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
        leaderboard.push({ name: playerName, score: score });
        leaderboard.sort((a, b) => b.score - a.score);
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard.slice(0, 5)));
        updateLeaderboard();
    }
}

function updateLeaderboard() {
    const leaderboardElement = document.querySelector('.leaderboard ol');
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    leaderboardElement.innerHTML = leaderboard
        .map(entry => `<li>${entry.name}........${entry.score}</li>`)
        .join('');
}

// Initialize leaderboard on load
updateLeaderboard();