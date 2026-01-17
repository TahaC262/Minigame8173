const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = { x: 2, y: 2, dir: 0, hp: 100, ammo: 15 };
let map = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,0,1,1,0,1],
    [1,0,0,4,0,0,0,3,0,1], // 4: Mermi, 3: Merdiven
    [1,1,1,1,1,1,1,1,1,1]
];

let enemies = [{x: 7, y: 2.5, alive: true, hp: 100}];
let lastX = 0;
let moveState = { forward: false, backward: false, left: false, right: false };

// --- KONTROL PANELİ ---
// Sol tarafa sanal oklar/joystick mantığı, sağ tarafa ateş butonu
window.addEventListener('touchstart', (e) => {
    let tx = e.touches[0].clientX;
    let ty = e.touches[0].clientY;
    
    // Sağ alt köşeye yakınsa ATEŞ ET
    if(tx > canvas.width * 0.7 && ty > canvas.height * 0.6) {
        shoot();
    } else {
        lastX = tx; // Bakış açısı başlangıcı
    }
});

window.addEventListener('touchmove', (e) => {
    e.preventDefault();
    let tx = e.touches[0].clientX;
    let ty = e.touches[0].clientY;

    // Ekranın sol yarısı HAREKET (Oklar yerine dokunmatik sürükleme)
    if(tx < canvas.width * 0.5) {
        player.x += Math.cos(player.dir) * 0.05;
        player.y += Math.sin(player.dir) * 0.05;
    } else {
        // Ekranın sağ yarısı KAFA ÇEVİRME
        let dx = tx - lastX;
        player.dir += dx * 0.01;
        lastX = tx;
    }
}, {passive: false});

function shoot() {
    if(player.ammo <= 0) return;
    player.ammo--;
    enemies.forEach(en => {
        let dx = en.x - player.x, dy = en.y - player.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        let angle = Math.atan2(dy, dx) - player.dir;
        if(Math.abs(angle) < 0.3 && dist < 5) en.hp -= 50;
    });
}

function render() {
    // 1. ZEMİN VE TAVAN (Renkler değişti)
    ctx.fillStyle = "#222"; ctx.fillRect(0,0,canvas.width, canvas.height/2); // Tavan
    ctx.fillStyle = "#443"; ctx.fillRect(0,canvas.height/2,canvas.width, canvas.height/2); // Yer

    // 2. 3D DUVARLAR (Gri Tuğla Görünümü)
    const rays = 100;
    for(let i=0; i<rays; i++) {
        let angle = (player.dir - 0.5) + (i/rays);
        let rx = player.x, ry = player.y, rd = 0;
        let hit = 0;
        while(rd < 12) {
            rx += Math.cos(angle)*0.1; ry += Math.sin(angle)*0.1; rd += 0.1;
            hit = map[Math.floor(ry)][Math.floor(rx)];
            if(hit > 0 && hit !== 4) break; 
        }
        let h = canvas.height / (rd * Math.cos(angle - player.dir));
        let c = hit === 3 ? "blue" : `rgb(${100-rd*5},${100-rd*5},${100-rd*5})`;
        ctx.fillStyle = c;
        ctx.fillRect(i*(canvas.width/rays), (canvas.height-h)/2, canvas.width/rays+1, h);
    }

    // 3. ZOMBİLER (Artık sana doğru yürüyorlar)
    enemies.forEach(en => {
        if(en.hp <= 0) return;
        let dx = en.x - player.x, dy = en.y - player.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < 0.5) player.hp -= 0.5; // Değince can azalır
        
        // Zombi Zekası: Oyuncuyu takip et
        en.x -= (dx/dist) * 0.01;
        en.y -= (dy/dist) * 0.01;

        let angle = Math.atan2(dy, dx) - player.dir;
        if(Math.abs(angle) < 0.6) {
            let sx = (angle + 0.6) * canvas.width;
            let sh = canvas.height / dist;
            ctx.fillStyle = "red";
            ctx.fillRect(sx - sh/4, canvas.height/2 - sh/4, sh/2, sh/2);
        }
    });

    // 4. ARAYÜZ (Sağ alta Ateş Butonu Çizimi)
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.beginPath(); ctx.arc(canvas.width*0.85, canvas.height*0.8, 50, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "white"; ctx.fillText("ATEŞ", canvas.width*0.82, canvas.height*0.81);
    
    ctx.fillText(`CAN: %${Math.floor(player.hp)} | MERMİ: ${player.ammo}`, 20, 40);
    requestAnimationFrame(render);
}
render();
