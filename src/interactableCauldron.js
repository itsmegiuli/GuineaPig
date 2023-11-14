import * as THREE from 'three'
import { Interactable } from './interactable.js';
import { RawFood } from './rawFood.js';
import { Pommes } from './pommes.js';

class InteractableCauldron extends Interactable{
  constructor(interactables, scene, position){
    const geometry = new THREE.CylinderGeometry( 3, 3, 15);
    super(interactables, scene, geometry, position)
    this.interactLabel.position.add(new THREE.Vector3(0, 3.5, 0))
    this.smoke
    this.foodAmount = 0
    this.isSmoking = false
  }

  update() {
    if(this.isSmoking)
      this.smokeAnimation()
  }

  onInteract(interactor) {
    super.onInteract(interactor)

    if (interactor.grabbedObject != null && interactor.grabbedObject instanceof RawFood) {
      this.foodAmount++
      const grabbedObject = interactor.grabbedObject
      interactor.dropObject()
      grabbedObject.dispose()

      if (this.foodAmount > 3) {
        this.foodAmount = 0
        this.createsmoke()
        this.disable(true)

        const pommes = new Pommes(this.interactables, this.scene)
        pommes.onInteract(interactor)
      }
    }
  }

  createsmoke() {
    this.isSmoking = true;

    const geometry = new THREE.BufferGeometry();
    const particleCount = 500;
  
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
  
    const texture = new THREE.TextureLoader().load('http://stemkoski.github.io/Three.js/images/smokeparticle.png');
    const material = new THREE.PointsMaterial({
      size: 4,
      map: texture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      color: 'rgb(30,30,30)'
    });
  
    for (let i = 0; i < particleCount; i++) {
      const x = THREE.MathUtils.randInt(-20, -22);
      const y = THREE.MathUtils.randInt(4, 6);
      const z = THREE.MathUtils.randInt(-31, -33);
  
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
  
      velocities[i * 3] = THREE.MathUtils.randFloat(0.0, 0.05) * Math.sign(positions[i]);
      velocities[i * 3 + 1] = THREE.MathUtils.randFloat(0.01, 0.1);
      velocities[i * 3 + 2] = THREE.MathUtils.randFloat(0.0, 0.1) * Math.sign(positions[i + 2]);
  
    }
  
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
  
    this.smoke = new THREE.Points(geometry, material);
    this.scene.add(this.smoke);

    setTimeout(() => {
      //ProcessingText = 'E';
      //interactDiv.textContent = ProcessingText;
      this.scene.remove(this.smoke);
      this.smoke = undefined;
      this.isSmoking = false;
      this.disable(false)
    }, 6000);
  }
  
  smokeAnimation() {
    const positions = this.smoke.geometry.attributes.position.array;
    const velocities = this.smoke.geometry.attributes.velocity.array;
  
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += velocities[i];
      positions[i + 1] += velocities[i + 1];
      positions[i + 2] += velocities[i + 2]
  
      //if (positions[i + 1] >= 100) positions[i + 1] = 0;
    }
  
    this.smoke.geometry.attributes.position.needsUpdate = true;
  }
}

export { InteractableCauldron }

