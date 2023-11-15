import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Grabable } from './grabable.js';
import * as CSS2DRenderer from 'CSS2DRenderer';

class GuineaPig extends Grabable {
  constructor(interactables, scene) {
    super(interactables, scene, new THREE.Vector3());

    this.isLoaded = false;
    this.scene = scene;
    this.movementSpeed = 0.1;
    this.hopTargetPosition = new THREE.Vector3();
    this.hopCounter = 0;
    this.hopNewRotation = new THREE.Quaternion();

    // Health bar properties
    this.healthBar = null;
    this.healthBarGroup = new THREE.Group(); // Initialize healthBarGroup
    this.health = 1.0; // Initial health value

    this.loadGuineaPig();
  }

  update(deltaTime) {
    if (!this.isLoaded) return;

    if (this.hopCounter <= 0) {
      this.updateHop();
    } else {
      const dir = new THREE.Vector3(
        this.hopTargetPosition.x - this.object.position.x,
        this.hopTargetPosition.y - this.object.position.y,
        this.hopTargetPosition.z - this.object.position.z
      );

      if (dir.lengthSq() > 1) {
        dir.normalize();

        this.object.quaternion.slerp(this.hopNewRotation, deltaTime);
        this.object.position.add(dir.multiplyScalar(this.movementSpeed));
        this.collider.position.copy(this.object.position);

        // Update health bar position along with the guinea pig
        if (this.healthBar) {
          this.healthBar.position.copy(this.object.position);
          this.healthBar.position.y += 1.5; // Adjust the vertical offset
        }
      }
    }

    this.hopCounter -= deltaTime;
  }

  updateHop() {
    this.hopTargetPosition = new THREE.Vector3(
      THREE.MathUtils.randFloat(-100, 100),
      0,
      THREE.MathUtils.randFloat(-100, 100)
    );
    this.hopCounter = THREE.MathUtils.randFloat(10, 15);

    const oldRotation = new THREE.Quaternion().copy(this.object.quaternion);
    this.object.lookAt(this.hopTargetPosition);
    this.hopNewRotation.copy(this.object.quaternion);
    this.object.setRotationFromQuaternion(oldRotation);
  }

  addLabel(label) {
    this.object.add(label);
  }

addHealthBar() {
  console.log('Adding health bar');

  // Ensure that this.object is defined
  if (!this.object) {
    console.error('Guinea Pig object is null or undefined. Cannot add health bar.');
    return;
  }

  console.log('Guinea Pig Position:', this.object.position);

  // Health Bar
  const healthBarGeometry = new THREE.PlaneGeometry(1, 0.1);
  const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
  this.healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);

  // Set an initial position for the health bar relative to the guinea pig
  const healthBarOffset = new THREE.Vector3(0, 1.5, 0); // Adjust as needed
  this.healthBar.position.copy(this.object.position).add(healthBarOffset);

  // Add the health bar to the scene
  this.scene.add(this.healthBar);

  console.log('Health Bar Position:', this.healthBar.position);
}

  
  

  loadGuineaPig() {
    const loader = new GLTFLoader();

    loader.register(parser => {
      // Assuming that KHR_materials_pbrSpecularGlossiness is used for the guinea pig
      parser.json.extensionsUsed = parser.json.extensionsUsed || [];
      parser.json.extensionsUsed.push('KHR_materials_pbrSpecularGlossiness');

      return new THREE.MeshPhysicalMaterial(); // Replace with your desired material type
    });

    loader.load('./assets/3d/bunny.glb', (gltf) => {
      gltf.scene.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      this.object = gltf.scene;
      this.object.scale.set(0.5, 0.5, 0.5);
      this.scene.add(this.object);
      this.isLoaded = true;

      // Add health bar after the guinea pig is loaded
      this.addHealthBar();
      this.scene.add(this.healthBarGroup); // Make sure to add the health bar group to the scene

      console.log('Guinea Pig Loaded:', this.object);
    });
  }
}

export { GuineaPig };
