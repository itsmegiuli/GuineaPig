import * as THREE from 'three';
import { GuineaPig } from './guineaPig.js';
import { Island } from './island.js';
import * as CSS2DRenderer from 'CSS2DRenderer';
import { Player } from './player.js';
import { FrameClock } from './frameClock.js';

let scene, camera, renderer, labelRenderer, frameClock;
let island, guineaPig, player;
const interactables = [];

window.addEventListener('resize', (event) => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('click', async () => {
  await renderer.domElement.requestPointerLock();
});

function init() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.0008);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);

  renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  labelRenderer = new CSS2DRenderer.CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  document.body.appendChild(labelRenderer.domElement);

  frameClock = new FrameClock();

  const light = new THREE.AmbientLight(0x707070);
  scene.add(light);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
  directionalLight.position.set(5, 20, 10);
  scene.add(directionalLight);

  island = new Island(interactables, scene);
  guineaPig = new GuineaPig(interactables, scene);
  camera.position.z = 15;
  camera.position.y = 7;
  camera.position.x = -10;
  player = new Player(camera);
}

function update() {
  requestAnimationFrame(update);
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);

  frameClock.update();
  const deltaTime = frameClock.deltaTime;

  guineaPig.update(deltaTime);
  player.update(deltaTime);
  player.checkInteractables(interactables);
  island.update(deltaTime);
}

init();
update();
