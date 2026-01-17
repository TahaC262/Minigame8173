/**
 * FPS MASTER ENGINE v2.0 - 5 FLOOR ZOMBIE HOUSE
 * DETAYLAR: Kafa çevirme, Silah animasyonu, Kat sistemi, Boss AI, Dinamik Gölgeler
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- AYARLAR VE DURUM ---
let game = {
    floor: 1,
    state: 'PLAYING', // 'PLAYING', 'FLOOR_UP', 'GAME_OVER'
    score: 0,
    bossKilled: false
};

let player = {
    x: 2.5, y: 2.5, dir: 0, 
    hp: 100, ammo: 20,
    weaponY: 0, weaponSwing: 0,
    isShooting: false
};

// --- 5 KATLI EV HARİTASI ---
// 1: Duvar, 0: Yol, 3: Merdiven (Üst Kat), 4: Mermi Paketi
const worldMaps = {
    1: [
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,1,0,0,0,0,1],
        [1,0,1,0,1,0,1,1,0,1],
        [1,0,1,0,0,0,0,1,3,1],
        [1,1,1,1,1,1,1,1,1,1]
    ],
    5: [ // BOSS KATI (Geniş Alan)
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1]
    ]
};

let enemies = [];
function initEnemies() {
    enemies = [];
    if(game.floor < 5) {
        for(let i=0; i<game.floor + 1; i++) {
            enemies.push({ x: 5 + i, y: 2, hp: 80, alive: true, type: 'zombie', speed: 0.01 + (game.floor * 0.005) });
        }
    } else {
        enemies.push({ x: 5, y: 2.5, hp: 1000, alive: true, type: 'BOSS', speed: 0.02 });
    }
}
initEnemies();

// --- KONTROLLER ---
let lastTouchX = 0;
window.addEventListener('touchstart', (e) => {
    lastTouchX = e.touches[0].clientX;
    if(player.ammo > 0 && !player.isShooting) shoot();
}, {passive: false});

window.addEventListener('touchmove', (e) => {
    e.preventDefault();
    let touchX = e.touches[0].clientX;
    let deltaX = touchX - lastTouchX;
    player.dir += deltaX * 0.008; // Hassas kafa çevirme
    lastTouchX = touchX;
    
    // Yürüme simülasyonu
    player.x += Math.cos(player.dir) * 0.05;
    player.y += Math.sin(player.dir) * 0.05;
    checkCollision();
}, {passive: false});

function checkCollision() {
    let map = worldMaps[game.floor] || worldMaps[1];
    let ix = Math.floor(player.x);
    let iy = Math.floor(player.y);
    if(map[iy][ix] === 1) { // Duvara çarptıysa geri it
        player.x -= Math.cos(player.dir) * 0.1;
        player.y -= Math.sin(player.dir) * 0.1;
    } else if(map[iy][ix] === 3) { // Merdiven
        game.floor++;
        player.x = 2.5; player.y = 2.5;
        player.ammo += 15;
        initEnemies();
    }
}

function shoot() {
    player.isShooting = true;
    player.ammo--;
    player.weaponY = 30; // Tepme efekti
    
    enemies.forEach(en => {
        if(!en.alive) return;
        let dx = en.x - player.x, dy = en.y - player.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        let angleToEn = Math.atan2(dy, dx);
        let angleDiff = Math.abs(angleToEn - player.dir);
        if(angleDiff < 0.2 && dist < 5) {
            en.hp -= 40;
            if(en.hp <= 0) { en.alive = false; game.score += 50; }
        }
    });
    setTimeout(() => { player.isShooting = false; player.weaponY = 0; }, 150);
}

// --- RENDER MOTORU ---
function render() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let map = worldMaps[game.floor] || worldMaps[1];

    // 1. Gökyüzü ve Yer (Gradient)
    let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#050505');
    grad.addColorStop(0.5, '#1a0000'); // Karanlık ev atmosferi
    grad.addColorStop(1, '#050505');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0, canvas.width, canvas.height);

    // 2. Raycasting (Detaylı 3D Duvarlar)
    const rays = 120;
    for(let i=0; i<rays; i++) {
        let rAngle = (player.dir - 0.5) + (i / rays);
        let rx = player.x, ry = player.y, dist = 0;
        let hit = 0;
        while(dist < 15) {
            rx += Math.cos(rAngle) * 0.1;
            ry += Math.sin(rAngle) * 0.1;
            dist += 0.1;
            if(map[Math.floor(ry)] && map[Math.floor(ry)][Math.floor(rx)] === 1) { hit = 1; break; }
            if(map[Math.floor(ry)] && map[Math.floor(ry)][Math.floor(rx)] === 3) { hit = 3; break; }
        }
        
        let wallH = canvas.height / (dist * Math.cos(rAngle - player.dir));
        let color = hit === 3 ? 200 : 150 - (dist * 10);
        ctx.fillStyle = hit === 3 ? `rgb(0,0,${color})` : `rgb(0,${color},0)`;
        ctx.fillRect(i * (canvas.width/rays), (canvas.height - wallH)/2, (canvas.width/rays)+1, wallH);
    }

    // 3. Düşmanlar (Zombiler ve Boss)
    enemies.forEach(en => {
        if(!en.alive) return;
        let dx = en.x - player.x, dy = en.y - player.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        let angle = Math.atan2(dy, dx) - player.dir;
        if(angle < -Math.PI) angle += Math.PI*2;
        if(angle > Math.PI) angle -= Math.PI*2;

        if(Math.abs(angle) < 0.6) {
            let sx = (angle + 0.5) * canvas.width;
            let sh = canvas.height / dist;
            ctx.fillStyle = en.type === 'BOSS' ? '#ff0000' : '#440000';
            ctx.fillRect(sx - sh/4, canvas.height/2 - sh/2, sh/2, sh);
            // Zombi Zekası: Oyuncuya yaklaş
            if(dist > 0.6) { en.x -= (dx/dist)*en.speed; en.y -= (dy/dist)*en.speed; }
            else { player.hp -= 0.1; } // Oyuncuya zarar ver
        }
    });

    // 4. Silah (Profesyonel Çizim)
    ctx.fillStyle = '#222';
    ctx.fillRect(canvas.width/2 - 40, canvas.height - 150 + player.weaponY, 80, 150);
    ctx.fillStyle = '#444';
    ctx.fillRect(canvas.width/2 - 10, canvas.height - 180 + player.weaponY, 20, 100);

    // 5. HUD (Arayüz)
    ctx.fillStyle = "white";
    ctx.font = "bold 20px Monospace";
    ctx.fillText(`KAT: ${game.floor}  CAN: %${Math.floor(player.hp)}  MERMİ: ${player.ammo}`, 20, 40);
    ctx.fillText(`SKOR: ${game.score}`, 20, 70);

    if(player.hp <= 0) { ctx.fillText("ÖLDÜN! YENİDEN BAŞLA", canvas.width/2-100, canvas.height/2); return; }
    requestAnimationFrame(render);
}
render();
