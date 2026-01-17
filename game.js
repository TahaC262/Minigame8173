const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Oyun Ayarları
let score = 0;
let speed = 0;
const maxSpeed = 300;
let pos = 0; // Yol üzerindeki mesafe
let playerX = 0; // -1 (sol) ile 1 (sağ) arası
let roadWidth = 2000;
let segmentLength = 200;
let cameraHeight = 1000;
let drawDistance = 300; // Kaç segment çizilecek
let fieldOfView = 100;
let cameraDepth = 1 / Math.tan((fieldOfView / 2) * Math.PI / 180);

let segments = [];
let cars = [];
let backgroundOffset = 0;
let gameActive = false;

// Kontroller
let keyLeft = false;
let keyRight = false;

// Yol Geometrisi Üretimi
function resetRoad() {
    segments = [];
    for (let n = 0; n < 5000; n++) {
        segments.push({
            index: n,
            p1: { world: { z: n * segmentLength }, screen: {} },
            p2: { world: { z: (n + 1) * segmentLength }, screen: {} },
            curve: (n > 500 && n < 1000) ? 2 : (n > 1500 && n < 2200) ? -3 : 0, // Virajlar
            sprites: []
        });
        
        // Yol kenarı öğeleri (Ağaç ve Çiçekler)
        if (n % 20 === 0) {
            segments[n].sprites.push({ x: -1.5, type: 'tree' });
            segments[n].sprites.push({ x: 1.5, type: 'tree' });
        }
        if (n % 5 === 0) {
            segments[n].sprites.push({ x: -1.2, type: 'flower', color: ['#ffff00', '#ff00ff', '#ff0000'][n % 3] });
        }
    }
}

// Projeksiyon Fonksiyonu
function project(p, cameraX, cameraZ) {
    p.screen.scale = cameraDepth / (p.world.z - cameraZ);
    p.screen.x = Math.round((canvas.width / 2) + (p.screen.scale * (p.world.x - cameraX) * canvas.width / 2));
    p.screen.y = Math.round((canvas.height / 2) - (p.screen.scale * (cameraHeight) * canvas.height / 2));
    p.screen.w = Math.round(p.screen.scale * roadWidth * canvas.width / 2);
}

// Çizim Fonksiyonları
function drawRender() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let baseSegment = segments[Math.floor(pos / segmentLength) % segments.length];
    let playerPercent = (pos % segmentLength) / segmentLength;
    let playerSegment = segments[(Math.floor(pos / segmentLength) + 5) % segments.length];
    
    let dx = -(baseSegment.curve * playerPercent);
    let x = 0;

    // Gökyüzü ve Arka Plan
    ctx.fillStyle = "#000033";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Yol Çizimi (Arkadan Öne)
    for (let n = 0; n < drawDistance; n++) {
        let segment = segments[(baseSegment.index + n) % segments.length];
        
        project(segment.p1, playerX * roadWidth - x, pos);
        project(segment.p2, playerX * roadWidth - x - dx, pos);
        
        x = x + dx;
        dx = dx + segment.curve;

        if (segment.p1.screen.y <= segment.p2.screen.y) continue;

        // Çimen
        ctx.fillStyle = (n % 2) ? "#107810" : "#0d630d";
        ctx.fillRect(0, segment.p2.screen.y, canvas.width, segment.p1.screen.y - segment.p2.screen.y);

        // Yol
        drawPolygon(segment.p1.screen.x, segment.p1.screen.y, segment.p1.screen.w, 
                    segment.p2.screen.x, segment.p2.screen.y, segment.p2.screen.w, 
                    (n % 2) ? "#333" : "#383838");
        
        // Yol Çizgileri
        if (n % 3 === 0) {
            drawPolygon(segment.p1.screen.x, segment.p1.screen.y, segment.p1.screen.w * 0.05, 
                        segment.p2.screen.x, segment.p2.screen.y, segment.p2.screen.w * 0.05, "#fff");
        }
        
        // Nesneler (Ağaç/Çiçek)
        segment.sprites.forEach(s => {
            let sx = segment.p1.screen.x + (segment.p1.screen.w * s.x);
            let sy = segment.p1.screen.y;
            let sw = segment.p1.screen.scale * 500;
            if(s.type === 'tree') drawTree(sx, sy, sw);
            else drawFlower(sx, sy, sw, s.color);
        });
    }

    // Oyuncu Arabası
    drawPlayerCar();

    // UI Güncelleme
    if(gameActive) {
        document.getElementById('score').innerText = `PUAN: ${Math.floor(score)}`;
        document.getElementById('speed').innerText = `${Math.floor(speed)} KM/S`;
    }
}

function drawPolygon(x1, y1, w1, x2, y2, w2, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1 - w1, y1); ctx.lineTo(x1 + w1, y1);
    ctx.lineTo(x2 + w2, y2); ctx.lineTo(x2 - w2, y2);
    ctx.fill();
}

function drawTree(x, y, scale) {
    ctx.fillStyle = "#4d2600"; // Gövde
    ctx.fillRect(x - scale/4, y - scale, scale/2, scale);
    ctx.fillStyle = "#004d00"; // Yapraklar
    ctx.beginPath();
    ctx.moveTo(x - scale, y - scale); ctx.lineTo(x + scale, y - scale);
    ctx.lineTo(x, y - scale * 2.5); ctx.fill();
}

function drawFlower(x, y, scale, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y - scale/2, scale/3, 0, Math.PI * 2);
    ctx.fill();
}

function drawPlayerCar() {
    let carX = canvas.width / 2;
    let carY = canvas.height - 150;
    
    // Basit ama gerçekçi oranlı spor araba çizimi
    ctx.fillStyle = "#e60000"; // Gövde
    ctx.fillRect(carX - 60, carY, 120, 50);
    ctx.fillStyle = "#333"; // Camlar
    ctx.fillRect(carX - 50, carY - 25, 100, 30);
    ctx.fillStyle = "#000"; // Tekerlekler
    ctx.fillRect(carX - 70, carY + 30, 20, 30);
    ctx.fillRect(carX + 50, carY + 30, 20, 30);
}

// Oyun Döngüsü
function update(dt) {
    if(!gameActive) return;

    pos += speed * 2;
    score += speed * 0.01;
    if(speed < maxSpeed) speed += 0.2; // Otomatik hızlanma

    // Dönüş mantığı
    let currentSegment = segments[Math.floor(pos / segmentLength) % segments.length];
    playerX -= (speed/maxSpeed) * currentSegment.curve * 0.015;

    if(keyLeft) playerX -= 0.03;
    if(keyRight) playerX += 0.03;

    // Pist dışı kontrolü
    if(Math.abs(playerX) > 1.8) endGame();

    drawRender();
    requestAnimationFrame(update);
}

// Başlatma ve Olaylar
function initGame() {
    document.getElementById('start-menu').style.display = 'none';
    resetRoad();
    gameActive = true;
    speed = 50;
    requestAnimationFrame(update);
}

function endGame() {
    gameActive = false;
    document.getElementById('game-over').style.display = 'flex';
    document.getElementById('final-score').innerText = `SKOR: ${Math.floor(score)}`;
}

// Kontrol Dinleyicileri
const bLeft = document.getElementById('btn-left');
const bRight = document.getElementById('btn-right');

const startLeft = () => keyLeft = true;
const stopLeft = () => keyLeft = false;
const startRight = () => keyRight = true;
const stopRight = () => keyRight = false;

bLeft.addEventListener('touchstart', startLeft); bLeft.addEventListener('touchend', stopLeft);
bRight.addEventListener('touchstart', startRight); bRight.addEventListener('touchend', stopRight);
bLeft.addEventListener('mousedown', startLeft); bLeft.addEventListener('mouseup', stopLeft);
bRight.addEventListener('mousedown', startRight); bRight.addEventListener('mouseup', stopRight);

window.addEventListener('keydown', e => {
    if(e.code === 'ArrowLeft') keyLeft = true;
    if(e.code === 'ArrowRight') keyRight = true;
});
window.addEventListener('keyup', e => {
    if(e.code === 'ArrowLeft') keyLeft = false;
    if(e.code === 'ArrowRight') keyRight = false;
});
