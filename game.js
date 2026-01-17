// === Başlangıç Ayarları ===
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreElement = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');

// Canvas boyutlarını mobil ekrana göre ayarla
canvas.width = window.innerWidth > 600 ? 600 : window.innerWidth * 0.9;
canvas.height = window.innerHeight > 800 ? 800 : window.innerHeight * 0.9;

let player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    speed: 7,
    lives: 3,
    color: '#00FFFF', // Turkuaz uzay gemisi
    cooldown: 0, // Atış bekleme süresi
    maxCooldown: 15 // Frame cinsinden
};

let bullets = [];
let enemies = [];
let stars = [];
let score = 0;
let gameOver = false;
let lastTouchX = player.x; // Mobil kontrol için son dokunma konumu

// === Görsel Kaynaklar (Basit Çizimler veya URL'den Emojiler) ===
// Daha iyi görseller için buraya resim URL'leri yüklenebilir.
// Şimdilik basit şekiller ve emojiler kullanalım.
const playerEmoji = '🚀'; // Uzay gemisi emojisi
const enemyEmoji = '👾'; // Düşman emojisi
const bulletEmoji = '⚡'; // Mermi emojisi
const starEmoji = '✨'; // Yıldız emojisi

function drawObject(obj, emoji) {
    ctx.font = `${obj.width}px Arial`; // Emoji boyutu için
    ctx.fillText(emoji, obj.x, obj.y + obj.height);
}

// === Oyun Döngüsü ve Mekanikler ===
function gameLoop() {
    if (gameOver) {
        return; // Oyun bittiyse döngüyü durdur
    }

    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    // Player atış cooldown'u
    if (player.cooldown > 0) {
        player.cooldown--;
    }

    // Mermi güncelleme
    bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });

    // Düşman oluşturma
    if (Math.random() < 0.02 + (score / 2000)) { // Skor arttıkça düşman daha sık çıkar
        let size = Math.random() * 40 + 30;
        enemies.push({
            x: Math.random() * (canvas.width - size),
            y: -size,
            width: size,
            height: size,
            speed: Math.random() * 2 + 1 + (score / 1000), // Skor arttıkça düşman hızlanır
            health: 1
        });
    }

    // Düşman güncelleme ve Player ile çarpışma
    enemies.forEach((enemy, eIndex) => {
        enemy.y += enemy.speed;

        // Player ile çarpışma
        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            player.lives--;
            livesElement.innerText = player.lives;
            enemies.splice(eIndex, 1); // Düşman yok olsun
            if (player.lives <= 0) {
                endGame();
            }
        }

        // Mermi ile düşman çarpışması
        bullets.forEach((bullet, bIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                enemy.health--;
                bullets.splice(bIndex, 1); // Mermi yok olsun
                if (enemy.health <= 0) {
                    enemies.splice(eIndex, 1); // Düşman yok olsun
                    score += 10;
                    scoreElement.innerText = score;
                    // Yıldız düşürme şansı
                    if (Math.random() < 0.3) {
                        stars.push({ x: enemy.x, y: enemy.y, width: 20, height: 20, speed: 3 });
                    }
                }
            }
        });

        if (enemy.y > canvas.height) {
            enemies.splice(eIndex, 1);
        }
    });

    // Yıldız güncelleme ve toplama
    stars.forEach((star, index) => {
        star.y += star.speed;
        if (
            player.x < star.x + star.width &&
            player.x + player.width > star.x &&
            player.y < star.y + star.height &&
            player.y + player.height > star.y
        ) {
            score += 50; // Yıldız toplama puanı
            scoreElement.innerText = score;
            stars.splice(index, 1);
        }
        if (star.y > canvas.height) {
            stars.splice(index, 1);
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Ekranı temizle

    // Player'ı çiz
    drawObject(player, playerEmoji);

    // Mermileri çiz
    bullets.forEach(bullet => drawObject(bullet, bulletEmoji));

    // Düşmanları çiz
    enemies.forEach(enemy => drawObject(enemy, enemyEmoji));

    // Yıldızları çiz
    stars.forEach(star => drawObject(star, starEmoji));
}

// === Kontroller ===
// Dokunmatik ekran kontrolü
canvas.addEventListener('touchstart', (e) => {
    if (gameOver) return;
    lastTouchX = e.touches[0].clientX; // İlk dokunuş noktası
    shootBullet(); // Dokunur dokunmaz ateş et
});

canvas.addEventListener('touchmove', (e) => {
    if (gameOver) return;
    let touchX = e.touches[0].clientX;
    let dx = touchX - lastTouchX;
    player.x += dx;

    // Ekran sınırları içinde kalmasını sağla
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    lastTouchX = touchX; // Yeni dokunuş noktasını güncelle
});

canvas.addEventListener('touchend', () => {
    // Belki burada araba durabilir veya bir sonraki atış için zamanlayıcı başlatılabilir
});

// Klavye kontrolü (Eğer Termux'u klavyeyle kullanıyorsan işe yarar)
document.addEventListener('keydown', (e) => {
    if (gameOver) return;
    if (e.key === 'ArrowLeft') {
        player.x -= player.speed;
    } else if (e.key === 'ArrowRight') {
        player.x += player.speed;
    } else if (e.key === ' ') { // Space tuşu ile ateş et
        shootBullet();
    }

    // Ekran sınırları içinde kalmasını sağla
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
});

function shootBullet() {
    if (player.cooldown <= 0) {
        bullets.push({
            x: player.x + player.width / 2 - 5,
            y: player.y,
            width: 10,
            height: 20,
            speed: 10,
            color: '#FFD700' // Altın sarısı mermi
        });
        player.cooldown = player.maxCooldown; // Cooldown'u sıfırla
    }
}

function endGame() {
    gameOver = true;
    finalScoreElement.innerText = score;
    
    // Oyun bitti ekranına ismini ekleyelim
    const devCredit = document.createElement("p");
    devCredit.innerHTML = "Geliştirici: <span style='color:#00ffff'>Taha Cenk</span>";
    devCredit.style.fontSize = "14px";
    devCredit.style.marginTop = "20px";
    
    // Eğer daha önce eklenmediyse ekle
    if(!gameOverScreen.querySelector('.dev-name')){
        devCredit.className = 'dev-name';
        gameOverScreen.insertBefore(devCredit, restartButton);
    }
    
    gameOverScreen.style.display = 'flex';
}


// Oyunu başlat
gameLoop();
