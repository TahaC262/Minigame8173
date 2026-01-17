let scene, camera, renderer;
let car;
let speed = 0.35;
let score = 0;

let turnLeft = false;
let turnRight = false;

let roadSegments = [];
let segmentSize = 20;

let directionAngle = 0;
let carZ = 0;

let enemyCars = [];
let trees = [];

let gameState = "menu"; // menu | playing | gameover

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x7ec8e3);

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(5, 10, 5);
    sun.castShadow = true;
    scene.add(sun);

    car = createCar(Math.random());
    car.position.y = 0.25;
    scene.add(car);

    let x = 0, z = 0, angle = 0;
    for (let i = 0; i < 40; i++) {
        const seg = createRoadSegment(x, z, angle);
        roadSegments.push(seg);
        x += Math.sin(angle) * segmentSize;
        z -= Math.cos(angle) * segmentSize;
        angle += (Math.random() - 0.5) * 0.05;
    }

    document.getElementById("left").ontouchstart = () => turnLeft = true;
    document.getElementById("left").ontouchend = () => turnLeft = false;
    document.getElementById("right").ontouchstart = () => turnRight = true;
    document.getElementById("right").ontouchend = () => turnRight = false;

    setInterval(() => {
        if (gameState === "playing") spawnEnemyCar();
    }, 1600);

    setInterval(() => {
        if (gameState === "playing") spawnTrees();
    }, 900);

    createUI();
    window.addEventListener("resize", onResize);
}

function createUI() {
    const ui = document.createElement("div");
    ui.id = "ui";
    ui.style = `
        position:fixed;
        top:0;left:0;
        width:100%;height:100%;
        display:flex;
        flex-direction:column;
        justify-content:center;
        align-items:center;
        background:rgba(0,0,0,0.6);
        color:white;
        font-family:Arial;
        z-index:10;
        text-align:center;
    `;
    document.body.appendChild(ui);
    showMenu();
}

function showMenu() {
    gameState = "menu";
    document.getElementById("ui").innerHTML = `
        <h1 style="font-size:48px;letter-spacing:4px;">RETRO RACER</h1>
        <button onclick="startGame()" style="font-size:22px;padding:15px 40px;">START</button>
    `;
}

function showGameOver() {
    gameState = "gameover";
    document.getElementById("ui").innerHTML = `
        <h1 style="font-size:42px;">GAME OVER</h1>
        <p style="font-size:22px;">Skor: ${Math.floor(score)}</p>
        <button onclick="location.reload()" style="font-size:20px;padding:12px 30px;">RESTART</button>
    `;
}

function startGame() {
    gameState = "playing";
    document.getElementById("ui").style.display = "none";
}

function createCar(typeSeed) {
    const g = new THREE.Group();
    let color = typeSeed < 0.33 ? 0xff3b3b : typeSeed < 0.66 ? 0x2f80ff : 0x2ecc71;
    let length = typeSeed < 0.33 ? 2.3 : typeSeed < 0.66 ? 2.6 : 2.0;

    const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.4, length),
        new THREE.MeshStandardMaterial({ color, metalness: 0.3, roughness: 0.4 })
    );
    body.position.y = 0.35;
    g.add(body);

    const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 0.3, length * 0.5),
        new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    cabin.position.set(0, 0.6, -0.2);
    g.add(cabin);

    const wheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.3, 10);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x000000 });

    [[-0.6,0.2,0.7],[0.6,0.2,0.7],[-0.6,0.2,-0.7],[0.6,0.2,-0.7]].forEach(p=>{
        const w = new THREE.Mesh(wheelGeo, wheelMat);
        w.rotation.z = Math.PI/2;
        w.position.set(...p);
        g.add(w);
    });

    return g;
}

function createRoadSegment(x, z, angle) {
    const group = new THREE.Group();
    const road = new THREE.Mesh(
        new THREE.PlaneGeometry(20, segmentSize),
        new THREE.MeshStandardMaterial({ color: 0x2b2b2b })
    );
    road.rotation.x = -Math.PI / 2;
    group.add(road);

    const line = new THREE.Mesh(
        new THREE.PlaneGeometry(0.3, segmentSize),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    line.rotation.x = -Math.PI / 2;
    line.position.y = 0.01;
    group.add(line);

    group.rotation.z = angle;
    group.position.set(x, 0, z);
    scene.add(group);
    return { mesh: group, angle };
}

function animate() {
    requestAnimationFrame(animate);
    if (gameState !== "playing") {
        renderer.render(scene, camera);
        return;
    }

    speed += 0.00015;

    if (turnLeft) directionAngle += 0.002;
    if (turnRight) directionAngle -= 0.002;

    car.rotation.y = directionAngle;
    car.position.x += Math.sin(directionAngle) * speed;
    carZ -= Math.cos(directionAngle) * speed;
    car.position.z = carZ;

    camera.position.x = car.position.x - Math.sin(directionAngle) * 4;
    camera.position.z = car.position.z + Math.cos(directionAngle) * 4;
    camera.position.y = 1.6;
    camera.lookAt(car.position);

    updateEnemies();
    updateRoad();

    score += speed;
    document.getElementById("score").innerText = "Skor: " + Math.floor(score);
    document.getElementById("speed").innerText = "Hız: " + Math.floor(speed * 200) + " km/s";

    renderer.render(scene, camera);
}

function spawnEnemyCar() {
    const enemy = createCar(Math.random());
    enemy.position.y = 0.25;
    enemy.position.x = car.position.x + (Math.random() * 6 - 3);
    enemy.position.z = car.position.z - 50;
    scene.add(enemy);
    enemyCars.push(enemy);
}

function updateEnemies() {
    for (let i = enemyCars.length - 1; i >= 0; i--) {
        const e = enemyCars[i];
        e.position.z += speed * 0.8;

        if (
            Math.abs(e.position.z - car.position.z) < 1.5 &&
            Math.abs(e.position.x - car.position.x) < 1
        ) {
            document.getElementById("ui").style.display = "flex";
            showGameOver();
        }
    }
}

function spawnTrees() {}

function updateRoad() {}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
