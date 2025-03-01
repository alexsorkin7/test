const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const ROWS = 18;
const COLUMNS = 10;
const BLOCK_SIZE = 30;

const fallSound = new Audio("fall.wav");

canvas.width = COLUMNS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;
context.scale(BLOCK_SIZE, BLOCK_SIZE);

const COLORS = ["cyan", "blue", "orange", "yellow", "green", "purple", "red"];
const SHAPES = [
   [[1, 1, 1, 1]], // I
   [[1, 1, 1], [0, 0, 1]], // J
   [[1, 1, 1], [1, 0, 0]], // L
   [[1, 1], [1, 1]], // O
   [[0, 1, 1], [1, 1, 0]], // S
   [[0, 1, 0], [1, 1, 1]], // T
   [[1, 1, 0], [0, 1, 1]]  // Z
];

function createMatrix(rows, cols) {
   return Array.from({ length: rows }, () => Array(cols).fill(0));
}

let board = createMatrix(ROWS, COLUMNS);
let score = 0;
let piece;
let dropCounter = 0;
let lastTime = 0;
let gameRunning = false;
let gamePaused = false;

function createPiece() {
   const index = Math.floor(Math.random() * SHAPES.length);
   return {
      shape: SHAPES[index],
      color: COLORS[index],
      x: Math.floor(COLUMNS / 2) - 1,
      y: 0
   };
}

function drawMatrix(matrix, offset) {
   matrix.forEach((row, y) => {
      row.forEach((value, x) => {
         if (value) {
            context.fillStyle = piece.color;
            context.fillRect(x + offset.x, y + offset.y, 1, 1);
         }
      });
   });
}

function mergeBoard() {
   piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
         if (value) {
            board[piece.y + y][piece.x + x] = piece.color;
         }
      });
   });
}

function collide() {
   return piece.shape.some((row, y) => {
      return row.some((value, x) => {
         if (
            value &&
            (board[piece.y + y]?.[piece.x + x] !== 0 || piece.y + y >= ROWS)
         ) {
            return true;
         }
         return false;
      });
   });
}

function clearLines() {
   board = board.filter(row => row.some(cell => !cell));
   while (board.length < ROWS) {
      board.unshift(new Array(COLUMNS).fill(0));
      score += 10;
   }
}

function drop() {
   piece.y++;
   if (collide()) { fallSound.play(); }
   if (collide()) {
      piece.y--;
      mergeBoard();
      clearLines();
      piece = createPiece();
      if (collide()) {
         alert("Game Over! Score: " + score);
         board = createMatrix(ROWS, COLUMNS);
         score = 0;
         piece = createPiece();
      }
   }
   dropCounter = 0;
}

function move(dir) {
   piece.x += dir;
   if (collide()) piece.x -= dir;
}

function rotate() {
   const rotated = piece.shape[0].map((_, i) =>
      piece.shape.map(row => row[i]).reverse()
   );
   const prevShape = piece.shape;
   piece.shape = rotated;
   if (collide()) piece.shape = prevShape;
}

function update(time = 0) {
   if (!gameRunning || gamePaused) return;
   if (!gameRunning) return;
   const deltaTime = time - lastTime;
   lastTime = time;
   dropCounter += deltaTime;
   if (dropCounter > 1000) drop();
   draw();
   requestAnimationFrame(update);
}

function draw() {
   context.fillStyle = "black";
   context.fillRect(0, 0, canvas.width, canvas.height);
   drawMatrix(board, { x: 0, y: 0 });
   drawMatrix(piece.shape, { x: piece.x, y: piece.y });
   document.getElementById("score").innerText = "Score: " + score;
}

document.addEventListener("keydown", event => {
   if (event.key === "ArrowLeft") move(-1);
   else if (event.key === "ArrowRight") move(1);
   else if (event.key === "ArrowDown") drop();
   else if (event.key === "ArrowUp") rotate();
});

startButton.addEventListener("click", () => {
   if (!gameRunning) {
      gameRunning = true;
      gamePaused = false;
      piece = createPiece();
      update();
   }
   document.querySelector('audio').play()
});

pauseButton.addEventListener("click", () => {
   if (gameRunning) {
      gamePaused = !gamePaused;
      if (!gamePaused) {
         update();
      }
      document.getElementById('pauseButton').innerHTML = gamePaused ? 'resume' : 'pause'
   }
});

