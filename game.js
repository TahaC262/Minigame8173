// SAHNE AYARLARI
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// IŞIKLANDIRMA (Karanlık Ev Atmosferi)
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);
const flashLight = new THREE.PointLight(0xffffff, 1, 15);
scene.add(flashLight);

// EV TASARIMI (Zemin ve Duvarlar)
const wallMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
const floorGeo = new THREE.PlaneGeometry(40, 40);
const floor = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({ color: 0x111111 }));
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// DUVAR VE KAT OLUŞTURMA FONKSİYONU
function createBox(w, h, d, x, y, z, color = 0x333333) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({ color: color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
}

// 1. KAT DUVARLARI
createBox(20, 4, 0.5, 0, 2, -10); // Arka duvar
createBox(0.5, 4, 20, -10, 2, 0); // Sol duvar
createBox(0.5, 4, 20, 10, 2, 0);  // Sağ duvar

// MERDİVEN (Basit 3D Merdiven Yapısı)
for(let i=0; i<5; i++) {
    createBox(3, 0.4, 0.6, 7, i * 0.4, -8 + (i * 0.6), 0x555555);
}

// SİLAH (3D Model Temsili)
const gunGroup = new THREE.Group();
const barrel = createBox(0.1, 0.1, 0.8, 0, 0, 0, 0x111111);
gunGroup.add(barrel);
scene.add(gunGroup);

// ZOMBİLER (3D Robotik Figürler)
let zombies = [];
function spawnZombie(x, z) {
    const body = createBox(0.8, 1.8, 0.5, x, 0.9, z, 0x114411);
    zombies.push(body);
}
spawnZombie(0, -5);
spawnZombie(5, -7);

// KONTROLLER
camera.position.set(0, 1.6, 5);

function animate() {
    requestAnimationFrame(animate);

    // Silahın Kamerayı Takibi
    flashLight.position.copy(camera.position);
    gunGroup.position.set(camera.position.x + 0.3, camera.position.y - 0.3, camera.position.z - 0.5);
    gunGroup.rotation.copy(camera.rotation);

    // Zombilerin Takibi (Basit Yapay Zeka)
    zombies.forEach(z => {
        let dirX = camera.position.x - z.position.x;
        let dirZ = camera.position.z - z.position.z;
        let dist = Math.sqrt(dirX*dirX + dirZ*dirZ);
        if(dist > 0.6) {
            z.position.x += dirX/dist * 0.01;
            z.position.z += dirZ/dist * 0.01;
        }
    });

    renderer.render(scene, camera);
}

// ATEŞ ETME (Tıklama)
window.addEventListener('mousedown', () => {
    gunGroup.position.z += 0.05; // Geri tepme efekti
    setTimeout(() => gunGroup.position.z -= 0.05, 50);
});

animate();
