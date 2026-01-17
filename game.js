const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// OYUN AYARLARI
let floor = 1, hp = 100, score = 0, gameActive = true;
const mapSize = 12;
const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,1],
    [1,1,1,0,1,0,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,1],
    [1,0,1,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1]
];

let player = { x: 1.5, y: 1.5, dir: 0 };
let zombies = [];

function spawnZombies() {
    zombies = [];
    let count = floor === 5 ? 1 : floor * 4;
    for(let i=0; i<count; i++) {
        zombies.push({
            x: 2 + Math.random() * 8,
            y: 2 + Math.random() * 8,
            alive: true,
            dist: 0,
            type: floor === 5 ? 'BOSS' : 'ZOM'
        });
    }
}

function drawRaycasting() {
    const numRays = 150; 
    const step = Math.PI / 3 / numRays; // 60 derece görüş açısı

    for(let i=0; i<numRays; i++) {
        let rayDir = player.dir - Math.PI/6 + i * step;
        let x = player.x, y = player.y;
        let dx = Math.cos(rayDir), dy = Math.sin(rayDir);
        let d = 0;

        while(d < 15) {
            x += dx * 0.05; y += dy * 0.05; d += 0.05;
            if(map[Math.floor(y)][Math.floor(x)] === 1) break;
        }

        // Duvar yüksekliği ve gölgelendirme
        d *= Math.cos(rayDir - player.dir); // Balık gözü düzeltme
        let h = canvas.height / d;
        let color = Math.max(20, 150 - d * 15);
        ctx.fillStyle = `rgb(0, ${color}, 0)`;
        ctx.fillRect(i * (canvas.width/numRays), (canvas.height-h)/2, canvas.width/numRays + 1, h);
    }
}

function updateZombies() {
    zombies.forEach(z => {
        if(!z.alive) return;
        let dx = player.x - z.x, dy = player.y - z.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        z.dist = dist;

        // Zombi hareketi
        if(dist > 0.5) {
            z.x += (dx/dist) * 0.01 * floor;
            z.y += (dy/dist) * 0.01 * floor;
        } else {
            hp -= 0.2; // Can azalması
            document.body.classList.add('flash');
            setTimeout(() => document.body.classList.remove('flash'), 50);
        }

        // Zombiyi çiz (Derinlikli)
        if(dist < 10) {
            let angle = Math.atan2(dy, dx) - player.dir;
            if(angle > Math.PI) angle -= 2*Math.PI;
            if(angle < -Math.PI) angle += 2*Math.PI;

            if(Math.abs(angle) < Math.PI/4) {
                let screenX = (angle / (Math.PI/3)) * canvas.width + canvas.width/2;
                let size = canvas.height / dist;
                ctx.font = size + "px Arial";
                ctx.textAlign = "center";
                ctx.fillText(z.type === 'BOSS' ? "👹" : "🧟", screenX, canvas.height/2 + size/2);
            }
        }
    });
}

window.onclick = () => {
    // Ateş etme mekaniği
    const weapon = document.getElementById('weapon');
    weapon.style.transform = "translateX(-50%) translateY(-40px) scale(1.2)";
    setTimeout(() => weapon.style.transform = "translateX(-50%)", 100);

    // En yakın canlı zombiyi vur
    let target = zombies.filter(z => z.alive).sort((a,b) => a.dist - b.dist)[0];
    if(target && target.dist < 4) {
        target.alive = false;
        score += 100;
        checkFloor();
    }
};

function checkFloor() {
    if(zombies.every(z => !z.alive)) {
        if(floor < 5) {
            floor++;
            player.x = 1.5; player.y = 1.5;
            spawnZombies();
            alert("TEBRİKLER! " + floor + ". KATA GİRİLİYOR.");
        } else {
            gameActive = false;
            alert("EFSANE! TAHA CENK TÜM KATLARI TEMİZLEDİ! REKOR: " + score);
            location.reload();
        }
    }
}

function gameLoop() {
    if(!gameActive) return;
    ctx.fillStyle = "#000"; ctx.fillRect(0,0,canvas.width, canvas.height);
    
    // Tavan ve zemin
    ctx.fillStyle = "#050505"; ctx.fillRect(0, canvas.height/2, canvas.width, canvas.height/2);
    
    drawRaycasting();
    updateZombies();
    
    document.getElementById('hp').innerText = Math.floor(hp);
    document.getElementById('floor').innerText = floor;
    document.getElementById('score').innerText = score;

    player.dir += 0.005; // Otomatik yavaş dönme efekti

    if(hp <= 0) {
        alert("SİSTEM ÇÖKTÜ! ZOMBİLER SENİ YAKALADI. SKOR: " + score);
        location.reload();
    }
    requestAnimationFrame(gameLoop);
}

spawnZombies();
gameLoop();
