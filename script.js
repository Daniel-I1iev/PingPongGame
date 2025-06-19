// Game states
const GAME_STATE = {
    WELCOME: 'welcome',
    PLAYING: 'playing',
    WIN: 'win',
    LOSE: 'lose'
};

// Current game state
let currentState = GAME_STATE.WELCOME;

// Get DOM elements
const welcomeScreen = document.getElementById('welcome-screen');
const gameScreen = document.getElementById('game-screen');
const winScreen = document.getElementById('win-screen');
const loseScreen = document.getElementById('lose-screen');
const startBtn = document.getElementById('start-btn');
const playAgainWinBtn = document.getElementById('play-again-win');
const playAgainLoseBtn = document.getElementById('play-again-lose');
const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Win score
const WIN_SCORE = 10;

// Game objects
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    velocityX: 5,
    velocityY: 5,
    speed: 7,
    initialSpeed: 7,
    color: 'white'
};

const player = {
    x: 0,
    y: (canvas.height - 100) / 2,
    width: 10,
    height: 100,
    score: 0,
    color: 'white'
};

const computer = {
    x: canvas.width - 10,
    y: (canvas.height - 100) / 2,
    width: 10,
    height: 100,
    score: 0,
    color: 'white'
};

const net = {
    x: (canvas.width - 2) / 2,
    y: 0,
    width: 2,
    height: 10,
    color: 'white'
};

// Game loop reference
let gameLoop = null;

// Change game state
function changeState(newState) {
    currentState = newState;
    
    // Hide all screens
    welcomeScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    winScreen.classList.add('hidden');
    loseScreen.classList.add('hidden');
    
    // Show the appropriate screen
    switch(newState) {
        case GAME_STATE.WELCOME:
            welcomeScreen.classList.remove('hidden');
            break;
        case GAME_STATE.PLAYING:
            gameScreen.classList.remove('hidden');
            break;
        case GAME_STATE.WIN:
            winScreen.classList.remove('hidden');
            break;
        case GAME_STATE.LOSE:
            loseScreen.classList.remove('hidden');
            break;
    }
}

// Start the game
function startGame() {
    // Reset scores
    player.score = 0;
    computer.score = 0;
    updateScores();
    
    // Reset ball
    resetBall();
    
    // Change state to playing
    changeState(GAME_STATE.PLAYING);
    
    // Start game loop
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(game, 1000/50);
}

// Check for win condition
function checkWinCondition() {
    if (player.score >= WIN_SCORE) {
        changeState(GAME_STATE.WIN);
        clearInterval(gameLoop);
        gameLoop = null;
    } else if (computer.score >= WIN_SCORE) {
        changeState(GAME_STATE.LOSE);
        clearInterval(gameLoop);
        gameLoop = null;
    }
}

// Draw functions
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    for (let i = 0; i <= canvas.height; i += 15) {
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
}

// Control the player paddle with mouse
canvas.addEventListener('mousemove', (e) => {
    if (currentState === GAME_STATE.PLAYING) {
        const rect = canvas.getBoundingClientRect();
        player.y = e.clientY - rect.top - player.height / 2;
        
        // Keep the paddle inside the canvas
        if (player.y < 0) {
            player.y = 0;
        }
        if (player.y + player.height > canvas.height) {
            player.y = canvas.height - player.height;
        }
    }
});

// Control the player paddle with arrow keys
document.addEventListener('keydown', (e) => {
    if (currentState === GAME_STATE.PLAYING) {
        const key = e.key;
        const paddleSpeed = 10;
        
        if (key === 'ArrowUp') {
            player.y -= paddleSpeed;
            if (player.y < 0) {
                player.y = 0;
            }
        } else if (key === 'ArrowDown') {
            player.y += paddleSpeed;
            if (player.y + player.height > canvas.height) {
                player.y = canvas.height - player.height;
            }
        }
    }
});

// Collision detection
function collision(b, p) {
    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;
    
    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;
    
    return b.right > p.left && b.left < p.right && b.bottom > p.top && b.top < p.bottom;
}

// Reset ball
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    // Make sure the ball goes in a different direction after reset
    ball.velocityX = -ball.velocityX;
    // Reset ball speed to initial value
    ball.speed = ball.initialSpeed;
}

// Update scores on the display
function updateScores() {
    // Get the score elements
    const playerScoreElement = document.getElementById('player-score');
    const computerScoreElement = document.getElementById('computer-score');
    
    // Update the text content with current scores
    if (playerScoreElement) playerScoreElement.textContent = player.score;
    if (computerScoreElement) computerScoreElement.textContent = computer.score;
}

// Update game state
function update() {
    // Move the ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    
    // Simple AI to control the computer paddle - MADE LESS EFFECTIVE
    const computerLevel = 0.05; // Difficulty level (0 = impossible, 1 = easy)
    // Add some randomness to make the computer miss sometimes
    if (Math.random() > 0.1) { // 10% chance the computer won't move at all
        // Add some delay and inaccuracy to computer movements
        computer.y += (ball.y - (computer.y + computer.height/2)) * computerLevel;
        
        // Sometimes move in the wrong direction
        if (Math.random() < 0.05) { // 5% chance the computer moves in wrong direction
            computer.y += (Math.random() * 10) - 5;
        }
    }
    
    // Keep computer paddle in bounds
    if (computer.y < 0) {
        computer.y = 0;
    }
    if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }
    
    // Ball wall collision (top and bottom)
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.velocityY = -ball.velocityY;
    }
    
    // Check which player the ball is hitting
    let paddle = (ball.x < canvas.width/2) ? player : computer;
    
    // If the ball hits a paddle
    if (collision(ball, paddle)) {
        // Where the ball hit the paddle
        let collidePoint = ball.y - (paddle.y + paddle.height/2);
        
        // Normalize the value of collidePoint (between -1 and 1)
        collidePoint = collidePoint / (paddle.height/2);
        
        // Calculate the angle of the ball
        let angleRad = collidePoint * Math.PI/4;
        
        // X direction of the ball when it hit the paddle
        let direction = (ball.x < canvas.width/2) ? 1 : -1;
        
        // Change velocity X and Y
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        
        // Increase ball speed more significantly each time a paddle hits it
        ball.speed += 0.4;
    }
    
    // Update score if ball goes out of bounds
    if (ball.x - ball.radius < 0) {
        // Computer scores
        computer.score++;
        updateScores();
        resetBall();
        
        // Check if computer won
        checkWinCondition();
    } else if (ball.x + ball.radius > canvas.width) {
        // Player scores
        player.score++;
        updateScores();
        resetBall();
        
        // Check if player won
        checkWinCondition();
    }
}

// Render game
function render() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, '#000');
    
    // Draw net
    drawNet();
    
    // Draw paddles
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(computer.x, computer.y, computer.width, computer.height, computer.color);
    
    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

// Game loop
function game() {
    update();
    render();
}

// Event listeners for buttons
startBtn.addEventListener('click', startGame);
playAgainWinBtn.addEventListener('click', startGame);
playAgainLoseBtn.addEventListener('click', startGame);

// Initialize the game
changeState(GAME_STATE.WELCOME);