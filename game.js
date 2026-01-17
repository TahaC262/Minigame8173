const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 1 = DUVAR, 0 = YOL (5 Katlı Ev Planı)
const world = [
    [1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,0,0,0,1,1,1,0,1],
    [1,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,0,1,1,1,1,0,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1]
];

let player = { x: 2, y: 2, dir: 0, speed: 0 };
let zombies = [{x: 8, y: 3, alive: true, health: 100}];
let floor = 1;

// Kontroller: Ekrana dokunduğunda karakter ilerler ve ateş eder
window.addEventListener('touchstart', () => { player.speed = 0.05; shoot(); });
window.addEventListener('touchend', () => { player.speed = 0; });

function shoot() {
    zombies.forEach(z => {
        if(z.alive) { z.health -= 50; if(z.health <= 0) z.alive = false; }
    });
}

function draw() {
    ctx.fillStyle = "black"; ctx.fillRect(0,0,canvas.width, canvas.height);
    
    // RAYCASTING MOTORU (3D GÖRÜNÜM)
    const rays = 100;
    for(let i=0; i<rays; i++) {
        let angle = (player.dir - 0.5) + (i/rays);
        let x = player.x, y = player.y;
        let d = 0;
        while(world[Math.floor(y)][Math.floor(x)] === 0 && d < 10) {
            x += Math.cos(angle)*0.1; y += Math.sin(angle)*0.1; d += 0.1;
        }
        let h = canvas.height / d;
        ctx.fillStyle = `rgb(0, ${150 - d*10}, 0)`; // Mesafe karartması
        ctx.fillRect(i*(canvas.width/rays), (canvas.height-h)/2, canvas.width/rays+1, h);
    }

    // ZOMBİ ÇİZİMİ (Kare yerine gerçekçi silüet)
    zombies.forEach(z => {
        if(!z.alive) return;
        let dx = z.x - player.x, dy = z.y - player.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < 0.5) { alert("YAKALANDIN!"); location.reload(); }
        // Basit zombi takibi
        z.x -= dx/dist * 0.01; z.y -= dy/dist * 0.01;
        
        // Zombiyi ekrana çiz
        ctx.fillStyle = "red";
        ctx.fillRect(canvas.width/2 - 20/dist, canvas.height/2, 40/dist, 80/dist);
    });

    player.x += Math.cos(player.dir) * player.speed;
    player.y += Math.sin(player.dir) * player.speed;
    player.dir += 0.01; // Etrafa bakma etkisi

    requestAnimationFrame(draw);
}
draw();
