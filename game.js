const canvas = document.getElementById('raceCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let gameSpeed = 8;
let player = { x: canvas.width / 2 - 25, y: canvas.height - 180, w: 50, h: 100, color: '#00faff' };
let traffic = [];
let particles = [];
let keys = { left: false, right: false };

// ARABA ÇİZİCİ (Gölgeli ve Detaylı)
function drawAdvancedCar(x, y, color, isPlayer) {
    ctx.save();
    // Araba Gövdesi
    ctx.fillStyle = color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.fillRect(x, y, 50, 100);
    
    // Tavan/Cam Alanı
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(x + 8, y + 25, 34, 40);
    
    // Detay Çizgileri (Kaput)
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 5, y + 5, 40, 90);

    // Farlar (Neon Efekti)
    ctx.fillStyle = isPlayer ? "#fff" : "#f00";
    ctx.shadowBlur = 20;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fillRect(x + 5, y - 2, 12, 5); // Sol Far
    ctx.fillRect(x + 33, y - 2, 12, 5); // Sağ Far
    
    ctx.restore();
}

// YOL ÇİZGİLERİ (Hız hissi için)
let lineOffset = 0;
function drawRoad() {
    lineOffset += gameSpeed;
    if (lineOffset > 80) lineOffset = 0;
    
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = "#444";
    ctx.setLineDash([40, 40]);
    ctx.lineDashOffset = -lineOffset;
    ctx.lineWidth = 5;
    
    // Şeritler
    for(let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo((canvas.width / 4) * i, 0);
        ctx.lineTo((canvas.width / 4) * i, canvas.height);
        ctx.stroke();
    }
}

// KONTROLLER
const setupBtn = (id, key) => {
    const btn = document.getElementById(id);
    btn.ontouchstart = (e) => { e.preventDefault(); keys[key] = true; };
    btn.ontouchend = (e) => { e.preventDefault(); keys[key] = false; };
};
setupBtn('leftBtn', 'left'); setupBtn('rightBtn', 'right');

function update() {
    drawRoad();
    
    if (keys.left && player.x > 10) player.x -= 7;
    if (keys.right && player.x < canvas.width - 60) player.x += 7;

    drawAdvancedCar(player.x, player.y, player.color, true);

    if (Math.random() < 0.02) {
        let lanes = [canvas.width*0.1, canvas.width*0.35, canvas.width*0.6, canvas.width*0.8];
        traffic.push({ 
            x: lanes[Math.floor(Math.random()*lanes.length)], 
            y: -150, 
            color: `hsl(${Math.random()*360}, 70%, 50%)`,
            speed: gameSpeed * 0.5 + Math.random()*5 
        });
    }

    traffic.forEach((bot, i) => {
        bot.y += bot.speed;
        drawAdvancedCar(bot.x, bot.y, bot.color, false);

        // Çarpışma (Hitbox'ı biraz küçülttüm ki haksızlık olmasın)
        if (player.x < bot.x + 40 && player.x + 40 > bot.x && player.y < bot.y + 80 && player.y + 80 > bot.y) {
            alert("SİSTEM ÇÖKTÜ! SKOR: " + score);
            location.reload();
        }

        if (bot.y > canvas.height) {
            traffic.splice(i, 1);
            score += 10;
            gameSpeed += 0.1;
            document.getElementById('score').innerText = score;
            document.getElementById('speed').innerText = Math.floor(gameSpeed * 20);
        }
    });

    requestAnimationFrame(update);
}
update();
