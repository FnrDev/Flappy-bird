const canvas = document.querySelector("#gameCanvas")
const ctx = canvas.getContext("2d");
const playButton = document.querySelector("#playButton")
const gameOverText = document.querySelector('#game-over-text')

// Physics
const gravity = 0.5;
const jumpStrength = -9;
const maxFall = 12;

// Pipes
const pipes = []
const pipeWidth = 80
const pipeGap = 200
const pipeSpacing = 350
const pipeSpeed = 3
let frameCount = 0;

// score
let score = 0

// ---- Make canvas fill the screen ----
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();

window.addEventListener('resize', resizeCanvas)

// game start variables
let state = 'start' // start, playing, gameover
let bgX = 0;

// ---- Load images ----
// Three backgrounds, used later to swap theme as score increases
const backgrounds = [];
["images/bg1.jpg", "images/bg2.png", "images/bg3.jpg"].forEach(src => {
  const img = new Image();
  img.src = src;
  backgrounds.push(img);
});
let currentBg = 0; // index into backgrounds[]

const birdImage = new Image();
birdImage.src = "images/bird.png";

const pipeImage = new Image();
pipeImage.src = "images/pipe.png";

const bird = {
    x: 150,
    y: 0,
    width: 50,
    height: 38,
    velocity: 0
}

// Reset bird to vertical center of the screen
function resetBird() {
    bird.y = canvas.height / 2 // middle of the height screen
    bird.velocity = 0
}

function drawBackground() {
    const bg = backgrounds[currentBg];
    ctx.drawImage(bg, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(bg, bgX + canvas.width, 0, canvas.width, canvas.height);

    if (state === "playing") {
        bgX -= 1.5;
        if (bgX <= -canvas.width) bgX = 0;
    }
}

function drawBird() {
  ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);
}

// main game loop
const FPS = 60
let gameLoop = null

function spawnPipe() {
  // spawn pipe at random position
  const minTop = 80
  const maxTop = canvas.height - pipeGap - 120
  const gapTop = Math.random() * (maxTop - minTop) + minTop

  pipes.push({
    x: canvas.width,
    gapTop,
    passed: false
  })
}

function updatePipes() {
  if (frameCount % Math.floor(pipeSpacing / pipeSpeed) === 0) {
    console.log('spawn pipe')
    spawnPipe()
  }

  for (let i = pipes.length - 1; i >= 0; i--) {
    pipes[i].x -= pipeSpeed;

    if (!pipes[i].passed && pipes[i].x + pipeWidth < bird.x) {
      pipes[i].passed = true
      score++
    }

    // Remove pipes that have gone off-screen
    if (pipes[i].x + pipeWidth < 0) {
      pipes.splice(i, 1);
    }

    // change the background when score is multiple
    currentBg = Math.floor(score / 10) % backgrounds.length;
  }
}

function drawPipes() {
  pipes.forEach(pipe => {
    const bottomY = pipe.gapTop + pipeGap
    ctx.save()
    ctx.translate(pipe.x, pipe.gapTop)
    ctx.scale(1, -1)
    ctx.drawImage(pipeImage, 0, 0, pipeWidth, pipe.gapTop)
    ctx.restore()

    ctx.drawImage(
      pipeImage,
      pipe.x,
      bottomY,
      pipeWidth,
      canvas.height - bottomY
    )
  })
}

function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 4;
  ctx.font = "bold 48px sans-serif";
  ctx.textAlign = "center";
  // Outline first, then fill, so it's readable on any background
  ctx.strokeText(score, canvas.width / 2, 80);
  ctx.fillText(score, canvas.width / 2, 80);
}

// this function will update the Physics variables, to pull the bird down, or make the bird jump
function update() {
  if (state !== 'playing') return;

  frameCount++
  bird.velocity += gravity
  if (bird.velocity > maxFall) bird.velocity = maxFall
  bird.y += bird.velocity

  if (bird.y + bird.height > canvas.height) {
    endGame()
    return
  }

  if (checkPipeCollision()) {
    endGame()
  }

  updatePipes()
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    update()
    drawBackground()
    drawPipes()
    drawBird()
    drawScore()
}

function startLoop() {
  if (gameLoop) return // avoid stacking loops
  gameLoop = setInterval(render, 1000 / FPS)
}

function stopLoop() {
  clearInterval(gameLoop);
  gameLoop = null;
}

function resetGameOverText() {
  gameOverText.style.display = 'none'
}

function showGameOverText() {
  gameOverText.textContent = 'Game Over'
  gameOverText.style.display = 'block'
}

function checkPipeCollision() {
  const margin = 6;   // shrink hitbox for fairer feel
  for (const pipe of pipes) {
    const inPipeX = bird.x + bird.width - margin > pipe.x && bird.x + margin < pipe.x + pipeWidth;
    const hitTop = bird.y + margin < pipe.gapTop;
    const hitBottom = bird.y + bird.height - margin > pipe.gapTop + pipeGap;

    if (inPipeX && (hitTop || hitBottom)) {
      return true;
    }
  }
  return false;
}

function startGame() {
  console.log(state)
  if (state === 'gameover') {
    resetGameOverText()
  }
  state = "playing";

  playButton.style.display = "none";
  resetBird();

  pipes.length = 0
  frameCount = 0
  score = 0

  spawnPipe()
}

function endGame() {
  console.log('end ame')
  state = 'gameover'
  playButton.style.display = 'block'
  resetBird()
  showGameOverText()
}

function jumpBird() {
  if (state === 'playing') {
    bird.velocity = jumpStrength
  }
}

function keyPress(event) {
  // space key is clicked, and game have't started yet, then start the game
  if (event.key === ' ' && state !== 'playing') {
    startGame()
  }

  // make the bird jump when space key is clicked and game state is playing
  if (event.key === ' ' && state === 'playing') {
    jumpBird()
  }
}

playButton.addEventListener('click', startGame)
window.addEventListener('keydown', (event) => {
  keyPress(event)
})

// preload images on first so the images doesnt lag when we switch them later
// Wait for all 5 images (3 backgrounds + bird + pipe)
let imagesLoaded = 0;
const totalImages = backgrounds.length + 2;

function onImageLoad() {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    resetBird();
    startLoop();
  }
}

backgrounds.forEach(img => { img.onload = onImageLoad; });
birdImage.onload = onImageLoad;
pipeImage.onload = onImageLoad;