const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = { x: 2, y: 2, dir: 0 };
let lastX = 0;
let isMoving = false;

// Ev Haritası (1: Duvar, 0: Oda)
const world = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1]
];

// DOKUNMATİK KONTROLLER (Bakış ve Ateş)
window.addEventListener('touchstart', (e) => {
    lastX = e.touches[0].clientX;
    isMoving = true;
});

window.addEventListener('touchmove', (e) => {
    let touchX = e.touches[0].clientX;
    let deltaX = touchX - lastX;
    
    // Parmağı sağa çekince sağa, sola çekince sola bak
    player.dir += deltaX * 0.005; 
    lastX = touchX;
    isMoving = false; // Eğer parmak hareket ediyorsa sadece bakıyordur
});

window.addEventListener('touchend', (e) => {
    // Eğer parmak hiç kaydırılmadan bırakıldıysa bu bir "Ateş" komutudur
    if (isMoving) {
        shootEffect();
    }
});

function shootEffect() {
    const weapon = document.getElementById('weapon');
    weapon.style.transform = "translateX(-50%) translateY(-30px) scale(1.1)";
    setTimeout(() => {
        weapon.style.transform = "translateX(-50%) translateY(0) scale(1)";
    }, 100);
    console.log("Ateş edildi!");
}

function render() {
    ctx.fillStyle = "black"; ctx.fillRect(0,0,canvas.width, canvas.height);
    
    // RAYCASTING (3D Duvarlar)
    const numRays = 100;
    for(let i=0; i<numRays; i++) {
        let rayAngle = (player.dir - 0.5) + (i / numRays);
        let x = player.x, y = player.y;
        let d = 0;
        
        while(world[Math.floor(y)] && world[Math.floor(y)][Math.floor(x)] === 0 && d < 10) {
            x += Math.cos(rayAngle) * 0.1;
            y += Math.sin(rayAngle) * 0.1;
            d += 0.1;
        }
        
        let h = canvas.height / (d * Math.cos(rayAngle - player.dir));
        ctx.fillStyle = `rgb(0, ${200 - d * 20}, 0)`;
        ctx.fillRect(i * (canvas.width / numRays), (canvas.height - h) / 2, canvas.width / numRays + 1, h);
    }
    requestAnimationFrame(render);
}
render();
