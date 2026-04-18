import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.177.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.177.0/examples/jsm/controls/OrbitControls.js';

const categories = {
  devices: { color: 0x78b9ff },
  materials: { color: 0xff9d66 },
  fabrication: { color: 0x9cff8e },
  systems: { color: 0xd6a4ff }
};

const nodes = [
  { id: 'SOI Platform', category: 'materials', description: 'Silicon-on-insulator is the core wafer platform for high-index-contrast photonics.' },
  { id: 'Waveguide', category: 'devices', description: 'Submicron silicon waveguides confine and route optical modes on-chip.' },
  { id: 'Ring Resonator', category: 'devices', description: 'Compact filter/modulator cavity with wavelength-selective resonance.' },
  { id: 'Mach-Zehnder Modulator', category: 'devices', description: 'Interferometric modulator that maps phase shift into intensity modulation.' },
  { id: 'Grating Coupler', category: 'devices', description: 'Diffractive structure that couples light between fiber and chip.' },
  { id: 'Germanium Photodetector', category: 'devices', description: 'Ge-on-Si detector supports efficient near-IR optical-to-electrical conversion.' },
  { id: 'Silicon Nitride', category: 'materials', description: 'Low-loss platform often used for passive routing and nonlinear optics.' },
  { id: 'III-V Integration', category: 'materials', description: 'Heterogeneous bonding adds gain media for lasers on silicon.' },
  { id: 'Lithography', category: 'fabrication', description: 'Pattern transfer step defining critical waveguide and coupler dimensions.' },
  { id: 'Etching', category: 'fabrication', description: 'Anisotropic dry etch sculpts rib/strip waveguide profiles.' },
  { id: 'CMOS Foundry', category: 'fabrication', description: 'Scalable process infrastructure enabling MPW and volume manufacturing.' },
  { id: 'WDM Transceiver', category: 'systems', description: 'System-level block combining multiple wavelengths for high aggregate throughput.' },
  { id: 'Co-Packaged Optics', category: 'systems', description: 'Places optics near switch/compute die to reduce electrical I/O bottlenecks.' },
  { id: 'LiDAR PIC', category: 'systems', description: 'Photonic integrated circuits for beam steering and ranging in sensing systems.' },
  { id: 'Thermal Tuning', category: 'systems', description: 'Microheaters shift effective index to align resonances and compensate drift.' },
];

const links = [
  ['SOI Platform', 'Waveguide'],
  ['SOI Platform', 'Ring Resonator'],
  ['SOI Platform', 'Mach-Zehnder Modulator'],
  ['SOI Platform', 'Grating Coupler'],
  ['SOI Platform', 'Germanium Photodetector'],
  ['Waveguide', 'Ring Resonator'],
  ['Waveguide', 'Mach-Zehnder Modulator'],
  ['Waveguide', 'Grating Coupler'],
  ['Waveguide', 'WDM Transceiver'],
  ['Ring Resonator', 'WDM Transceiver'],
  ['Mach-Zehnder Modulator', 'WDM Transceiver'],
  ['Germanium Photodetector', 'WDM Transceiver'],
  ['Silicon Nitride', 'Waveguide'],
  ['III-V Integration', 'Co-Packaged Optics'],
  ['III-V Integration', 'LiDAR PIC'],
  ['Lithography', 'Waveguide'],
  ['Lithography', 'Grating Coupler'],
  ['Etching', 'Waveguide'],
  ['Etching', 'Ring Resonator'],
  ['CMOS Foundry', 'Lithography'],
  ['CMOS Foundry', 'Etching'],
  ['Thermal Tuning', 'Ring Resonator'],
  ['Thermal Tuning', 'Mach-Zehnder Modulator'],
  ['Co-Packaged Optics', 'WDM Transceiver'],
  ['LiDAR PIC', 'Waveguide']
];

const canvas = document.getElementById('canvas');
const detail = document.getElementById('detail');
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x070a10, 40, 150);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 300);
camera.position.set(0, 0, 42);

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 100;
controls.minDistance = 10;

const ambient = new THREE.AmbientLight(0xbfd7ff, 0.6);
const key = new THREE.DirectionalLight(0xffffff, 0.75);
key.position.set(10, 16, 8);
const rim = new THREE.DirectionalLight(0x7ba8ff, 0.35);
rim.position.set(-8, -6, -8);
scene.add(ambient, key, rim);

const starGeo = new THREE.BufferGeometry();
const starCount = 1300;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i += 1) {
  const r = 120;
  starPositions[i * 3 + 0] = (Math.random() - 0.5) * r * 2;
  starPositions[i * 3 + 1] = (Math.random() - 0.5) * r * 2;
  starPositions[i * 3 + 2] = (Math.random() - 0.5) * r * 2;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.22, color: 0x6f88b6 }));
scene.add(stars);

const nodeMap = new Map();
const graphGroup = new THREE.Group();
scene.add(graphGroup);

function makeLabel(text) {
  const cvs = document.createElement('canvas');
  const ctx = cvs.getContext('2d');
  cvs.width = 512;
  cvs.height = 128;
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, cvs.width, cvs.height);
  ctx.font = 'bold 44px sans-serif';
  ctx.fillStyle = '#ebf2ff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cvs.width / 2, cvs.height / 2);

  const tex = new THREE.CanvasTexture(cvs);
  tex.needsUpdate = true;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(8, 2, 1);
  return sprite;
}

const nodeGeometry = new THREE.SphereGeometry(0.9, 20, 20);
for (const node of nodes) {
  const material = new THREE.MeshStandardMaterial({
    color: categories[node.category].color,
    emissive: categories[node.category].color,
    emissiveIntensity: 0.2,
    roughness: 0.25,
    metalness: 0.15
  });

  const mesh = new THREE.Mesh(nodeGeometry, material);
  const pos = new THREE.Vector3(
    (Math.random() - 0.5) * 28,
    (Math.random() - 0.5) * 24,
    (Math.random() - 0.5) * 24
  );
  mesh.position.copy(pos);
  mesh.userData = node;

  const velocity = new THREE.Vector3();

  const label = makeLabel(node.id);
  label.position.set(pos.x, pos.y + 1.8, pos.z);

  graphGroup.add(mesh);
  graphGroup.add(label);
  nodeMap.set(node.id, { mesh, velocity, label, links: [] });
}

const edgeMaterial = new THREE.LineBasicMaterial({
  color: 0xa4b9e8,
  transparent: true,
  opacity: 0.42
});

const edgeObjects = [];
for (const [a, b] of links) {
  const start = nodeMap.get(a).mesh.position;
  const end = nodeMap.get(b).mesh.position;
  const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
  const line = new THREE.Line(geometry, edgeMaterial);
  graphGroup.add(line);

  nodeMap.get(a).links.push(b);
  nodeMap.get(b).links.push(a);
  edgeObjects.push({ line, a, b });
}

const center = new THREE.Vector3();
const temp = new THREE.Vector3();

function stepLayout() {
  const ids = Array.from(nodeMap.keys());

  for (let i = 0; i < ids.length; i += 1) {
    const left = nodeMap.get(ids[i]);
    for (let j = i + 1; j < ids.length; j += 1) {
      const right = nodeMap.get(ids[j]);
      temp.subVectors(left.mesh.position, right.mesh.position);
      const d2 = Math.max(temp.lengthSq(), 0.25);
      const force = 1.5 / d2;
      temp.normalize().multiplyScalar(force);
      left.velocity.add(temp);
      right.velocity.sub(temp);
    }
  }

  for (const [a, b] of links) {
    const left = nodeMap.get(a);
    const right = nodeMap.get(b);
    temp.subVectors(right.mesh.position, left.mesh.position);
    const dist = temp.length();
    const target = 8.3;
    const stretch = dist - target;
    temp.normalize().multiplyScalar(stretch * 0.012);
    left.velocity.add(temp);
    right.velocity.sub(temp);
  }

  for (const { mesh, velocity, label } of nodeMap.values()) {
    velocity.addScaledVector(mesh.position, -0.0025);
    velocity.multiplyScalar(0.93);
    mesh.position.addScaledVector(velocity, 1);
    label.position.set(mesh.position.x, mesh.position.y + 1.8, mesh.position.z);
  }

  for (const edge of edgeObjects) {
    const a = nodeMap.get(edge.a).mesh.position;
    const b = nodeMap.get(edge.b).mesh.position;
    const points = edge.line.geometry.attributes.position.array;
    points[0] = a.x;
    points[1] = a.y;
    points[2] = a.z;
    points[3] = b.x;
    points[4] = b.y;
    points[5] = b.z;
    edge.line.geometry.attributes.position.needsUpdate = true;
  }
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let selected = null;

function handlePointer(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const meshes = Array.from(nodeMap.values(), (entry) => entry.mesh);
  const hit = raycaster.intersectObjects(meshes, false);

  if (!hit.length) {
    selected = null;
    detail.textContent = 'Drag to orbit, scroll to zoom, and click a node to pin its description.';
    return;
  }

  selected = hit[0].object.userData.id;
  const node = hit[0].object.userData;
  const neighbors = nodeMap.get(node.id).links.join(', ') || 'No direct links';
  detail.textContent = `${node.id}: ${node.description} Connected to: ${neighbors}.`;
}

window.addEventListener('click', handlePointer);
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);

  stepLayout();
  controls.update();

  const t = performance.now() * 0.0006;
  stars.rotation.y = t * 0.12;
  graphGroup.rotation.y = Math.sin(t * 0.4) * 0.08;

  for (const [id, entry] of nodeMap.entries()) {
    const isSel = id === selected;
    entry.mesh.scale.setScalar(isSel ? 1.23 : 1);
    entry.mesh.material.emissiveIntensity = isSel ? 0.5 : 0.2;
  }

  graphGroup.getWorldPosition(center);
  controls.target.lerp(center, 0.08);

  renderer.render(scene, camera);
}

animate();
