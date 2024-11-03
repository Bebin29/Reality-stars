// main.js

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

const tooltip = document.getElementById("tooltip");
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const data = [
    { person: "Alice", shows: ["Show 1", "Show 2", "Show 4"] },
    { person: "Bob", shows: ["Show 1", "Show 3"] },
    { person: "Charlie", shows: ["Show 2", "Show 3"] },
    { person: "Dave", shows: ["Show 3", "Show 4"] },
    { person: "Eve", shows: ["Show 1", "Show 4"] },
];

const nodes = [];
const lines = [];
const personMaterial = new THREE.MeshStandardMaterial({ color: 0xff6347 });

// Helles Punktlicht für bessere Sichtbarkeit
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
const pointLight = new THREE.PointLight(0xffffff, 1.5, 100);
pointLight.position.set(15, 10, 10);
scene.add(ambientLight, pointLight);

data.forEach((entry, i) => {
    const personGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const personMesh = new THREE.Mesh(personGeometry, personMaterial.clone());
    personMesh.userData = { name: entry.person, shows: entry.shows };
    personMesh.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
    );
    nodes.push(personMesh);
    scene.add(personMesh);
});

// Verbindungen basierend auf Shows erstellen
nodes.forEach((node1, i) => {
    nodes.forEach((node2, j) => {
        if (i < j && data[i].shows.some(show => data[j].shows.includes(show))) {
            const geometry = new THREE.BufferGeometry().setFromPoints([node1.position, node2.position]);
            const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x88c0d0 }));
            lines.push(line);
            scene.add(line);
        }
    });
});

// Kamera-Positionierung
camera.position.z = 30;

// Kraft-basiertes Layout - Kräfte zwischen den Knoten simulieren
function applyForces() {
    nodes.forEach((node1, i) => {
        nodes.forEach((node2, j) => {
            if (i !== j) {
                const dist = node1.position.distanceTo(node2.position);
                const minDist = 5;
                const repulsiveForce = (minDist - dist) * 0.01;

                // Abstoßung zwischen Knoten
                if (dist < minDist) {
                    const direction = new THREE.Vector3().subVectors(node1.position, node2.position).normalize();
                    node1.position.add(direction.multiplyScalar(repulsiveForce));
                    node2.position.add(direction.multiplyScalar(-repulsiveForce));
                }
            }
        });
    });

    // Linien aktualisieren
    lines.forEach((line, idx) => {
        line.geometry.setFromPoints([nodes[idx].position, nodes[(idx + 1) % nodes.length].position]);
        line.geometry.attributes.position.needsUpdate = true;
    });
}

function animate() {
    requestAnimationFrame(animate);
    applyForces();
    renderer.render(scene, camera);
}
animate();

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(nodes);
    if (intersects.length > 0) {
        const intersected = intersects[0].object;
        tooltip.style.opacity = 1;
        tooltip.style.left = event.clientX + "px";
        tooltip.style.top = event.clientY - 30 + "px";
        tooltip.innerHTML = `Name: ${intersected.userData.name}<br>Shows: ${intersected.userData.shows.join(", ")}`;
    } else {
        tooltip.style.opacity = 0;
    }
}

window.addEventListener("mousemove", onMouseMove);
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
