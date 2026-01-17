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

// Senin konumun (Ekranın ortasında başlar)
let player = { x: canvas.width / 2, y: canvas.height / 2, size: 20 };

const hikaye = "Yıl 2026... Sistem çökmek üzere. Taha ve Gemini son veri paketini taşıyor. Kare duvarlardan parmağınla kaç! Hazır mısın?";

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

// DOKUNMATİK KONTROL: Parmağını nereye koyarsan karakter oraya gider
window.addEventListener('touchmove', (e) => {
    if(!gameActive) return;
    player.x = e.touches[0].clientX;
    player.y = e.touches[0].clientY;
    e.preventDefault(); 
}, {passive: false});

let stars = [];
let obstacles = [];

function initGame() {
    gameActive = true;
    score = 0;
    obstacles = [];
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    for(let i=0; i<80; i++) {
        stars.push({x: Math.random()*canvas.width, y: Math.random()*canvas.height, z: Math.random()*canvas.width});
    }
    gameLoop();
}

function update() {
    stars.forEach(s => {
        s.z -= 10;
        if(s.z <= 0) s.z = canvas.width;
    });

    if(Math.random() < 0.05) {
        obstacles.push({
            x: Math.random()*canvas.width - canvas.width/2,
            y: Math.random()*canvas.height - canvas.height/2,
            z: canvas.width
        });
    }

    obstacles.forEach((o, i) => {
        o.z -= 15;
        if(o.z <= 0) {
            obstacles.splice(i, 1);
            score += 10;
        }
        
        // ÇARPIŞMA KONTROLÜ
        let ox = o.x * (canvas.width/o.z) + canvas.width/2;
        let oy = o.y * (canvas.width/o.z) + canvas.height/2;
        let oSize = (1 - o.z/canvas.width) * 200;

        if(o.z < 150 && Math.abs(ox - player.x) < oSize/3 && Math.abs(oy - player.y) < oSize/3) {
            endGame();
        }
    });
}

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Yıldızlar
    stars.forEach(s => {
        let x = (s.x - canvas.width/2) * (canvas.width/s.z) + canvas.width/2;
        let y = (s.y - canvas.height/2) * (canvas.width/s.z) + canvas.height/2;
        let size = (1 - s.z/canvas.width) * 3;
        ctx.fillStyle = "white";
        ctx.fillRect(x, y, size, size);
    });

    // Engeller (Kareler)
    obstacles.forEach(o => {
        let x = o.x * (canvas.width/o.z) + canvas.width/2;
        let y = o.y * (canvas.width/o.z) + canvas.height/2;
        let size = (1 - o.z/canvas.width) * 200;
        ctx.strokeStyle = "#0ff";
        ctx.lineWidth = 2;
        ctx.strokeRect(x - size/2, y - size/2, size, size);
    });

    // SEN (Karakterin - Parlayan bir üçgen)
    ctx.fillStyle = "#0f0";
    ctx.beginPath();
    ctx.moveTo(player.x, player.y - 15);
    ctx.lineTo(player.x - 15, player.y + 15);
    ctx.lineTo(player.x + 15, player.y + 15);
    ctx.fill();

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
    ctx.fillStyle = "#f00";
    ctx.font = "30px monospace";
    ctx.fillText("SİSTEM ÇÖKTÜ!", canvas.width/2, canvas.height/2 - 40);
    ctx.fillStyle = "#fff";
    ctx.font = "20px monospace";
    ctx.fillText("Teşekkürler Yasin", canvas.width/2, canvas.height/2 + 20);
    ctx.fillStyle = "#0ff";
    ctx.fillText("Geliştirici: TAHA CENK", canvas.width/2, canvas.height/2 + 60);
    setTimeout(() => { location.reload(); }, 4000);
}
