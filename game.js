let scene, camera, renderer;
let car, road;
let speed = 0.25;
let score = 0;

let turnLeft = false;
let turnRight = false;
let roadAngle = 0;

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

    // Işık
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    // Araba
    const carGeo = new THREE.BoxGeometry(1, 0.5, 2);
    const carMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    car = new THREE.Mesh(carGeo, carMat);
    car.position.y = 0.25;
    scene.add(car);

    // Yol
    const roadGeo = new THREE.PlaneGeometry(20, 1000);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.z = -400;
    scene.add(road);

    // Kontroller
    document.getElementById("left").ontouchstart = () => turnLeft = true;
    document.getElementById("left").ontouchend = () => turnLeft = false;
    document.getElementById("right").ontouchstart = () => turnRight = true;
    document.getElementById("right").ontouchend = () => turnRight = false;

    window.addEventListener("resize", onResize);
}

function animate() {
    requestAnimationFrame(animate);

    // Hız artışı
    speed += 0.0002;

    // Viraj yönü
    if (turnLeft) roadAngle += 0.002;
    if (turnRight) roadAngle -= 0.002;

    // Yol gerçekten kıvrılıyor
    road.rotation.z = roadAngle;

    // Araba yol yönünü takip ediyor
    car.rotation.y = roadAngle;

    // Kamera arkadan takip
    camera.position.x = car.position.x - Math.sin(roadAngle) * 4;
    camera.position.z = car.position.z + Math.cos(roadAngle) * 4;
    camera.position.y = 1.5;
    camera.lookAt(car.position);

    // Skor ve hız
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
