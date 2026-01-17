const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');
const gameOverScreen = document.getElementById('game-over');

canvas.width = Math.min(window.innerWidth, 400);
canvas.height = window.innerHeight;

let gameRunning = false;
let score = 0;
let speed = 8;
let frame = 0;
let roadY = 0;

let player = { x: canvas.width / 2 - 25, y: canvas.height - 150, w: 46, h: 80 };
let traffic = [];
let decoration = [];

function startGame() {
    menu.style.display = 'none';
    gameRunning = true;
    animate();
}

// DETAYLI PİKSEL ARABA ÇİZİCİ
function drawCar(x, y, color, type) {
    ctx.save();
    
    if (type === 'player') {
        // Ana Gövde (Kırmızı Spor Araba)
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 46, 80);
        // Tavan ve Cam
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(x + 6, y + 20, 34, 30);
        // Arka Rüzgarlık
        ctx.fillStyle = '#962d22';
        ctx.fillRect(x, y + 70, 46, 10);
        // Farlar (Sarı/Beyaz)
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(x + 5, y, 8, 4);
        ctx.fillRect(x + 33, y, 8, 4);
    } else if (type === 'truck') {
        // Mavi Kamyon
        ctx.fillStyle = '#2980b9';
        ctx.fillRect(x, y, 55, 120);
        // Kamyon Üst Detayı
        ctx.fillStyle = '#3498db';
        ctx.fillRect(x + 5, y + 5, 45, 100);
        // Ön Izgara
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(x + 10, y + 105, 35, 10);
        // Gölgelendirme
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x + 55, y + 10, 8, 110);
    }
    
    ctx.restore();
}

// DOĞA VE ÇEVRE ÇİZİMİ
function drawEnvironment() {
    // Çimenler
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(0, 0, 60, canvas.height);
    ctx.fillRect(canvas.width - 60, 0, 60, canvas.height);

    // Çiçekler ve Kayalar
    if (frame % 20 === 0) {
        decoration.push({
            x: Math.random() < 0.5 ? Math.random() * 40 : canvas.width - 40,
            y: -50,
            color: Math.random() < 0.5 ? '#e74c3c' : '#f1c40f',
            size: 5 + Math.random() * 5
        });
    }

    decoration.forEach((d, i) => {
        d.y += speed;
        ctx.fillStyle = d.color;
        ctx.fillRect(d.x, d.y, d.size, d.size);
        if (d.y > canvas.height) decoration.splice(i, 1);
    });
}

function animate() {
    if (!gameRunning) return;
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawEnvironment();

    // YOL ÇİZİMİ
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(60, 0, canvas.width - 120, canvas.height);
    
    // Orta Çizgiler
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([40, 40]);
    ctx.lineDashOffset = -frame * speed;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // OYUNCU
    drawCar(player.x, player.y, '#e74c3c', 'player');

    // TRAFİK ÜRETİMİ
    if (frame % 70 === 0) {
        let isTruck = Math.random() < 0.4;
        traffic.push({
            x: 70 + Math.random() * (canvas.width - 180),
            y: -150,
            type: isTruck ? 'truck' : 'player',
            color: isTruck ? '#2980b9' : '#d35400',
            s: speed * 0.7
        });
    }

    traffic.forEach((bot, i) => {
        bot.y += bot.s;
        drawCar(bot.x, bot.y, bot.color, bot.type);

        // ÇARPIŞMA (Hassas Piksel Kontrolü)
        let botW = bot.type === 'truck' ? 55 : 46;
        let botH = bot.type === 'truck' ? 120 : 80;
        
        if (player.x < bot.x + botW && player.x + 46 > bot.x && 
            player.y < bot.y + botH && player.y + 80 > bot.y) {
            gameRunning = false;
            gameOverScreen.style.display = 'flex';
            document.getElementById('final-score').innerText = "SKOR: " + score;
        }

        if (bot.y > canvas.height) {
            traffic.splice(i, 1);
            score += 10;
            speed += 0.1;
        }
    });

    // HUD (Üst Bilgi Paneli)
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, 50);
    ctx.fillStyle = "#fff";
    ctx.font = "14px 'Press Start 2P'";
    ctx.fillText(`SKOR:${score}`, 20, 35);
    ctx.fillText(`HIZ:${Math.floor(speed * 10)}`, canvas.width - 140, 35);

    requestAnimationFrame(animate);
}

// KONTROL (Dokunmatik)
window.addEventListener('touchmove', (e) => {
    if (!gameRunning) return;
    let tX = e.touches[0].clientX - canvas.offsetLeft;
    if (tX > 60 && tX < canvas.width - 106) {
        player.x = tX;
    }
}, {passive: false});
