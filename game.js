const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let running = false;
let score = 0;
let speed = 5;
let mapType = 1;
let playerX = 0;
let roadOffset = 0;
let roadCurve = 0;
let obstacles = [];
let rivals = [];

function startGame(map) {
  mapType = map;
  document.getElementById("menu").style.display = "none";
  document.getElementById("score").style.display = "block";
  document.getElementById("controls").style.display = "flex";
  running = true;
  score = 0;
  playerX = 0;
  roadOffset = 0;
  roadCurve = 0;
  obstacles = [];
  rivals = [];

  // 4 araba (1 oyuncu + 3 rakip)
  for (let i = 0; i < 3; i++) {
    rivals.push({ x: Math.random() * 400 - 200, z: 1000 + i * 500 });
  }

  loop();
}

function loop() {
  if (!running) return;
  update();
  draw();
  requestAnimationFrame(loop);
}

function update() {
  roadOffset += speed;
  score += 1;

  // Map'e göre viraj
  if (mapType === 1) {
    roadCurve = Math.sin(roadOffset / 200) * 150;
  } else {
    roadCurve = Math.cos(roadOffset / 300) * 200;
  }

  // Engeller
  if (Math.random() < 0.02) {
    obstacles.push({ x: Math.random() * 400 - 200, z: 1000 });
  }

  for (let o of obstacles) {
    o.z -= speed * 10;
    if (o.z < 50 && Math.abs(o.x - playerX) < 50) {
      running = false;
      gameOver();
    }
  }
  obstacles = obstacles.filter(o => o.z > 0);

  // Rakip arabalar
  for (let r of rivals) {
    r.z -= speed * 8;
    if (r.z < 100) {
      r.z = 1000 + Math.random() * 500;
      r.x = Math.random() * 400 - 200;
    }
  }

  document.getElementById("score").innerText = "Puan: " + score;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Yol
  for (let i = 0; i < 30; i++) {
    const z = (i * 100 + roadOffset) % 3000;
    const scale = 300 / z;
    const roadWidth = 200 * scale;
    const y = canvas.height - i * 20;
    const offset = roadCurve * scale;
    ctx.fillStyle = i % 2 === 0 ? "#222" : "#555";
    ctx.fillRect(canvas.width / 2 - roadWidth / 2 + offset, y, roadWidth, 20);
  }

  // Rakipler
  for (let r of rivals) {
    const scale = 300 / r.z;
    const x = canvas.width / 2 + (r.x + roadCurve) * scale;
    const y = canvas.height - 200 * scale;
    const size = 80 * scale;
    drawCar(x, y, size, "red");
  }

  // Engeller
  for (let o of obstacles) {
    const scale = 300 / o.z;
    const x = canvas.width / 2 + (o.x + roadCurve) * scale;
    const y = canvas.height - 200 * scale;
    const size = 50 * scale;
    ctx.fillStyle = "yellow";
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
  }

  // Oyuncu arabası
  drawCar(canvas.width / 2 + playerX, canvas.height - 100, 60, "#00ff99");
}

function drawCar(x, y, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - size / 2, y);
  ctx.lineTo(x + size / 2, y);
  ctx.lineTo(x + size / 3, y + size);
  ctx.lineTo(x - size / 3, y + size);
  ctx.closePath();
  ctx.fill();
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") playerX -= 20;
  if (e.key === "ArrowRight") playerX += 20;
});

document.getElementById("left").addEventListener("touchstart", () => playerX -= 20);
document.getElementById("right").addEventListener("touchstart", () => playerX += 20);

function gameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#00ff99";
  ctx.font = "40px Courier New";
  ctx.fillText("OYUN BİTTİ!", canvas.width / 2 - 100, canvas.height / 2);
  ctx.font = "20px Courier New";
  ctx.fillText("Puan: " + score, canvas.width / 2 - 40, canvas.height / 2 + 40);
  ctx.fillText("Yeniden başlamak için F5’e bas", canvas.width / 2 - 150, canvas.height / 2 + 80);
}
