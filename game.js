const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = { x: 2, y: 2, dir: 0, ammo: 15, hp: 100, floor: 1, score: 0 };
let map = [
    [1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,3,1], // '3' Merdiven (Bir üst kata çıkarır)
    [1,0,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1]
];

let enemies = [];
function spawnEnemies() {
    if(player.floor < 5) {
        enemies = [{x: 5, y: 3, hp: 100, type: 'zombie'}];
    } else {
        enemies = [{x: 4, y: 2, hp: 500, type: 'BOSS'}]; // 5. Katta Boss gelir
    }
}
spawnEnemies();

window.addEventListener('touchstart', (e) => {
    if(player.ammo > 0) shoot(); else moveForward();
});

// KAFA ÇEVİRME SİSTEMİ (Senin istediğin gibi hassas)
let lastX = 0;
window.addEventListener('touchmove', (e) => {
    e.preventDefault();
    let dx = e.touches[0].clientX - lastX;
    player.dir += dx * 0.01;
    lastX = e.touches[0].clientX;
}, {passive: false});

function moveForward() {
    let nx = player.x + Math.cos(player.dir) * 0.2;
    let ny = player.y + Math.sin(player.dir) * 0.2;
    let cell = map[Math.floor(ny)][Math.floor(nx)];
    
    if(cell === 0) {
        player.x = nx; player.y = ny;
    } else if(cell === 3) { // MERDİVENE GELDİN
        nextFloor();
    }
}

function nextFloor() {
    player.floor++;
    player.x = 2; player.y = 2; // Başlangıca dön
    player.ammo += 10; // Yeni kat hediyesi
    spawnEnemies();
    alert("KAT " + player.floor + " Başlıyor!");
}

function shoot() {
    player.ammo--;
    enemies.forEach(en => {
        let dx = en.x - player.x, dy = en.y - player.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < 4) {
            en.hp -= 50;
            if(en.hp <= 0) { 
                en.alive = false; 
                player.score += 100;
                if(en.type === 'BOSS') alert("TEBRİKLER! BOSS ÖLDÜ, OYUN BİTTİ!");
            }
        }
    });
}

function render() {
    ctx.fillStyle = "black"; ctx.fillRect(0,0,canvas.width, canvas.height);
    
    // 3D ÇİZİM
    const rays = 80;
    for(let i=0; i<rays; i++) {
        let angle = (player.dir - 0.5) + (i/rays);
        let rx = player.x, ry = player.y, rd = 0;
        let cell = 0;
        while(rd < 10) {
            rx += Math.cos(angle)*0.1; ry += Math.sin(angle)*0.1; rd += 0.1;
            cell = map[Math.floor(ry)][Math.floor(rx)];
            if(cell === 1 || cell === 3) break;
        }
        let h = canvas.height / (rd * Math.cos(angle - player.dir));
        // Merdivenleri Mavi, Duvarları Yeşil çiz
        ctx.fillStyle = (cell === 3) ? `rgb(0,0,${200-rd*15})` : `rgb(0,${150-rd*10},0)`;
        ctx.fillRect(i*(canvas.width/rays), (canvas.height-h)/2, canvas.width/rays+1, h);
    }

    // HUD (Arayüz Bilgileri)
    ctx.fillStyle = "white";
    ctx.fillText(`KAT: ${player.floor} | MERMİ: ${player.ammo} | SKOR: ${player.score}`, 20, 30);
    
    requestAnimationFrame(render);
}
render();

