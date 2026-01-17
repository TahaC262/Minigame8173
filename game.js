const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let floor = 1;
let hp = 100;
let enemies = [];
let gameActive = true;

// Zombi Sınıfı
class Zombie {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = 1000; // Uzaklık
        this.speed = 2 + floor;
        this.dead = false;
    }
    update() {
        this.z -= this.speed;
        if (this.z <= 0) {
            hp -= 10; // Sana ulaştıysa canın gider
            this.reset();
        }
    }
    draw() {
        let size = (1000 / this.z) * 50;
        let screenX = (this.x - canvas.width/2) * (1000/this.z) + canvas.width/2;
        let screenY = (this.y - canvas.height/2) * (1000/this.z) + canvas.height/2;
        
        ctx.font = size + "px Arial";
        ctx.fillText(floor === 5 ? "👹" : "🧟", screenX, screenY);
    }
}

function initFloor() {
    enemies = [];
    let count = floor === 5 ? 1 : floor * 5; // Boss katında 1 dev, diğerlerinde kat başına 5 zombi
    for(let i=0; i < count; i++) enemies.push(new Zombie());
}

// Ateş etme
window.addEventListener('mousedown', () => {
    // En yakındaki zombiyi vur (Basit mantık)
    let hit = false;
    enemies.forEach(z => {
        if (z.z < 500 && !z.dead) {
            z.dead = true;
            hit = true;
        }
    });
    if(hit) checkFloorClear();
});

function checkFloorClear() {
    if (enemies.every(z => z.dead)) {
        if (floor < 5) {
            floor++;
            alert(floor + ". KATA ÇIKILIYOR!");
            initFloor();
        } else {
            gameWin();
        }
    }
}

function gameWin() {
    gameActive = false;
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width, canvas.height);
    ctx.fillStyle = "gold";
    ctx.textAlign = "center";
    ctx.fillText("BOSS YENİLDİ! EV TEMİZLENDİ.", canvas.width/2, canvas.height/2);
    ctx.fillText("Teşekkürler Yasin | Geliştirici: TAHA CENK", canvas.width/2, canvas.height/2 + 50);
}

function gameLoop() {
    if(!gameActive) return;
    ctx.fillStyle = "black"; ctx.fillRect(0,0,canvas.width, canvas.height);
    
    document.getElementById('hp').innerText = hp;
    document.getElementById('floor').innerText = floor;

    enemies.forEach(z => {
        if(!z.dead) {
            z.update();
            z.draw();
        }
    });

    if(hp <= 0) { alert("ZOMBİLER SENİ YEDİ!"); location.reload(); }
    requestAnimationFrame(gameLoop);
}

initFloor();
gameLoop();
