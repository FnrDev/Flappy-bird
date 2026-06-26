const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const playButton = document.getElementById("playButton");

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
    bird.y = canvas.height / 2
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

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    drawBackground();
    drawBird();
}

function startLoop() {
  if (gameLoop) return // avoid stacking loops
  gameLoop = setInterval(render, 1000 / FPS)
}

function stopLoop() {
  clearInterval(gameLoop);
  gameLoop = null;
}

function startGame() {
  state = "playing";
  playButton.style.display = "none";
  resetBird();
}

playButton.addEventListener('click', startGame)

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