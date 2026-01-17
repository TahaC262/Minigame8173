let scene, camera, renderer;
let car;
let speed = 0.3;
let score = 0;

let turnLeft = false;
let turnRight = false;
let direction = 0;
let forwardZ = 0;

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Işıklar
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    // Araba
    const carGeo = new THREE.BoxGeometry(1, 0.5, 2);
    const carMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    car = new THREE.Mesh(carGeo, carMat);
    car.position.y = 0.25;
    scene.add(car);

    // Yol (birden fazla parça)
    for (let i = 0; i < 5; i++) {
        const roadGeo = new THREE.PlaneGeometry(20, 50);
        const roadMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const road = new THREE.Mesh(roadGeo, roadMat);
        road.rotation.x = -Math.PI / 2;
        road.position.z = -i * 50;
        scene.add(road);
    }

    // Kontroller
    document.getElementById("left").ontouchstart = () => turnLeft = true;
    document.getElementById("left").ontouchend = () => turnLeft = false;
    document.getElementById("right").ontouchstart = () => turnRight = true;
    document.getElementById("right").ontouchend = () => turnRight = false;

    window.addEventListener("resize", onResize);
}

function animate() {
    requestAnimationFrame(animate);

    speed += 0.0002;

    if (turnLeft) direction += 0.03;
    if (turnRight) direction -= 0.03;

    // Araba yönü
    car.rotation.y = direction;

    // İleri hareket (ASIL ÖNEMLİ KISIM)
    forwardZ -= speed;
    car.position.x += Math.sin(direction) * speed;
    car.position.z = forwardZ;

    // Kamera ARKADAN TAKİP
    camera.position.x = car.position.x - Math.sin(direction) * 4;
    camera.position.z = car.position.z + Math.cos(direction) * 4;
    camera.position.y = 1.5;
    camera.lookAt(car.position);

    score += speed;
    document.getElementById("score").innerText = "Skor: " + Math.floor(score);
    document.getElementById("speed").innerText = "Hız: " + Math.floor(speed * 200) + " km/s";

    renderer.render(scene, camera);
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
