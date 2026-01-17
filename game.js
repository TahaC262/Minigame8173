const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const storyText = document.getElementById('story-text');
const startBtn = document.getElementById('start-btn');
const storyScreen = document.getElementById('story-screen');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameActive = false;
let score = 0;
let charIndex = 0;

const hikaye = "Yıl 2026... Sistem çökmek üzere. Taha ve Gemini, çekirdekte hapsolmuş son veri paketini taşıyor. Güvenlik duvarları üzerinize geliyor. Kaçmak için sadece sınırlı vaktiniz var. Hazır mısın?";

// Daktilo Efekti
function typeWriter() {
    if (charIndex < hikaye.length) {
        storyText.innerHTML += hikaye.charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, 50);
    } else {
        startBtn.style.display = "block";
    }
}

typeWriter();

startBtn.onclick = () => {
    storyScreen.style.display = "none";
    initGame();
};

// --- Oyun Motoru Nesneleri ---
let stars = [];
let obstacles = [];

function initGame() {
    gameActive = true;
    score = 0;
    obstacles = [];
    stars = [];
    for(let i=0; i<100; i++) {
        stars.push({x: Math.random()*canvas.width, y: Math.random()*canvas.height, z: Math.random()*canvas.width});
    }
    gameLoop();
}

function update() {
    stars.forEach(s => {
        s.z -= 8;
        if(s.z <= 0) s.z = canvas.width;
    });

    if(Math.random() < 0.04) {
        obstacles.push({
            x: Math.random()*canvas.width - canvas.width/2,
            y: Math.random()*canvas.height - canvas.height/2,
            z: canvas.width,
            size: 20
        });
    }

    obstacles.forEach((o, i) => {
        o.z -= 15;
        if(o.z <= 0) {
            obstacles.splice(i, 1);
            score += 10;
        }
        
        // Çarpışma Kontrolü (Basitleştirilmiş)
        if(o.z < 50 && Math.abs(o.x) < 50 && Math.abs(o.y) < 50) {
            endGame();
        }
    });
}

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    stars.forEach(s => {
        let x = (s.x - canvas.width/2) * (canvas.width/s.z) + canvas.width/2;
        let y = (s.y - canvas.height/2) * (canvas.width/s.z) + canvas.height/2;
        let size = (1 - s.z/canvas.width) * 3;
        ctx.fillStyle = "white";
        ctx.fillRect(x, y, size, size);
    });

    obstacles.forEach(o => {
        let x = o.x * (canvas.width/o.z) + canvas.width/2;
        let y = o.y * (canvas.width/o.z) + canvas.height/2;
        let size = (1 - o.z/canvas.width) * 150;
        ctx.strokeStyle = "#0ff";
        ctx.lineWidth = 2;
        ctx.strokeRect(x - size/2, y - size/2, size, size);
    });

    ctx.fillStyle = "#0f0";
    ctx.font = "16px monospace";
    ctx.fillText("VERİ: " + score, 20, 30);
}

function gameLoop() {
    if(!gameActive) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameActive = false;
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = "center";
    ctx.fillStyle = "#ff0000";
    ctx.font = "30px monospace";
    ctx.fillText("SİSTEM ÇÖKTÜ!", canvas.width/2, canvas.height/2 - 60);

    ctx.fillStyle = "#ffffff";
    ctx.font = "22px monospace";
    ctx.fillText("Teşekkürler Yasin", canvas.width/2, canvas.height/2);

    ctx.fillStyle = "#00ffff";
    ctx.font = "18px monospace";
    ctx.fillText("Geliştirici: TAHA CENK", canvas.width/2, canvas.height/2 + 50);
    
    setTimeout(() => {
        location.reload();
    }, 5000);
}
