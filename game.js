const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = { x: 2, y: 2, dir: 0, hp: 100 };
let map = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1]
];

let enemies = [{x: 7, y: 2.5, alive: true, d: 0}];
let lastX = 0;

// KONTROLLER: Sürükle (Bakış), Tıkla (İlerle & Ateş)
window.addEventListener('touchstart', (e) => {
    lastX = e.touches[0].clientX;
    movePlayer(); // Tıklayınca ileri gider
    shoot(); // Tıklayınca ateş eder
});

window.addEventListener('touchmove', (e) => {
    e.preventDefault();
    let dx = e.touches[0].clientX - lastX;
    player.dir += dx * 0.01; // Kafa sağa sola döner
    lastX = e.touches[0].clientX;
}, {passive: false});

function movePlayer() {
    let nextX = player.x + Math.cos(player.dir) * 0.3;
    let nextY = player.y + Math.sin(player.dir) * 0.3;
    if(map[Math.floor(nextY)][Math.floor(nextX)] === 0) {
        player.x = nextX; player.y = nextY;
    }
}

function shoot() {
    enemies.forEach(en => {
        if(en.alive && en.d < 2) en.alive = false;
    });
}

function render() {
    ctx.fillStyle = "#000"; ctx.fillRect(0,0,canvas.width, canvas.height);
    
    // Zemin ve Tavan
    ctx.fillStyle = "#111"; ctx.fillRect(0, canvas.height/2, canvas.width, canvas.height/2);

    // DUVARLAR (Raycasting)
    const res = 120;
    for(let i=0; i<res; i++) {
        let angle = (player.dir - 0.5) + (i/res);
        let x = player.x, y = player.y, dist = 0;
        while(map[Math.floor(y)][Math.floor(x)] === 0 && dist < 12) {
            x += Math.cos(angle)*0.1; y += Math.sin(angle)*0.1; dist += 0.1;
        }
        let h = canvas.height / (dist * Math.cos(angle - player.dir));
        ctx.fillStyle = `rgb(0, ${150 - dist*10}, 0)`;
        ctx.fillRect(i*(canvas.width/res), (canvas.height-h)/2, canvas.width/res+1, h);
    }

    // ZOMBİLER (Kırmızı Karanlık Silüetler)
    enemies.forEach(en => {
        if(!en.alive) return;
        let dx = en.x - player.x, dy = en.y - player.y;
        en.d = Math.sqrt(dx*dx + dy*dy);
        let angle = Math.atan2(dy, dx) - player.dir;
        if(angle < -Math.PI) angle += 2*Math.PI;
        if(angle > Math.PI) angle -= 2*Math.PI;

        if(Math.abs(angle) < 0.5) {
            let sx = (angle + 0.5) * canvas.width;
            let sh = canvas.height / en.d;
            ctx.fillStyle = "#400"; // Koyu kırmızı zombi gövdesi
            ctx.fillRect(sx - sh/4, canvas.height/2 - sh/2, sh/2, sh);
        }
    });

    requestAnimationFrame(render);
}
render();
