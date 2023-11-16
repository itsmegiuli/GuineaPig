import * as THREE from 'three'
import { Interactable } from './interactable.js';
import { RawFood } from './rawFood.js';
import { Pommes } from './pommes.js';
import { Logs } from './logs.js';
import { GuineaPig } from './guineaPig.js';

class InteractableCauldron extends Interactable{
  constructor(interactables, scene, position){
    const geometry = new THREE.CylinderGeometry( 3, 3, 15);
    super(interactables, scene, geometry, position)
    this.interactLabel.position.add(new THREE.Vector3(0, 3.5, 0))
    this.explosionSfx
    this.smokeSfx
    this.smokingTime = 0
    this.foodAmount = 0
    this.isExploding = false
    this.isSmoking = false

    this.light = new THREE.PointLight( 0xffaa00, 1, 100 );
    this.light.intensity = 100
    this.light.position.set(-22, 1, -33);
    this.scene.add(this.light)
    this.light.visible = false
  }

  onActivate() {
    super.onActivate()
    if (!this.isSmoking) {
      this.interactDiv.textContent = "Needs logs to be lit"
    }
    else {
      this.interactDiv.textContent = "Needs " + (4 - this.foodAmount) + " more ingredients"
    }
  }

  update(deltaTime) {
    if(this.isExploding)
      this.updateExposionSFX()
    
    if (this.isSmoking)
      this.updateSmokeSFX()

    this.smokingTime = Math.max(0, this.smokingTime - deltaTime)

    if (this.smokingTime <= 0 && this.isSmoking) {
      this.isSmoking = false
    }
  }

  onInteract(interactor) {
    super.onInteract(interactor)

    if (this.isSmoking && interactor.grabbedObject instanceof RawFood) {
      this.foodAmount++
      const grabbedObject = interactor.grabbedObject
      interactor.dropObject()
      grabbedObject.dispose()

      if (this.foodAmount > 3) {
        this.foodAmount = 0
        this.createExplosion('rgb(30,30,30)')
        this.disable(true)

        const pommes = new Pommes(this.interactables, this.scene)
        pommes.onInteract(interactor)
      }
    }
    else if (this.isSmoking && interactor.grabbedObject instanceof GuineaPig) {
      const grabbedObject = interactor.grabbedObject
      interactor.dropObject()
      grabbedObject.dispose()
      
      this.foodAmount = 0
      this.createExplosion('rgb(30,0,0)')
      this.disable(true)
    }
    else if (interactor.grabbedObject instanceof Logs) {
      const grabbedObject = interactor.grabbedObject
      interactor.dropObject()
      grabbedObject.dispose()

      this.smokingTime = Math.min(this.smokingTime + 20, 60)

      if (!this.isSmoking) {
        this.light.visible = true
        this.createSmoke()
      }
    }

  }

  createSmoke() {
    this.isSmoking = true;

    const geometry = new THREE.BufferGeometry();
  
    const positions = new Float32Array(3);
    positions[0] = THREE.MathUtils.randFloat(-22,-20);
    positions[1] = 5;
    positions[2] = THREE.MathUtils.randFloat(-33, -31);

    const velocities = new Float32Array(3);
    velocities[0] = THREE.MathUtils.randFloat(0.002, 0.004);
    velocities[1] = THREE.MathUtils.randFloat(0.01, 0.03);
    velocities[2] = THREE.MathUtils.randFloat(0.002, 0.004);;

    const texture = new THREE.TextureLoader().load('assets/2d/smokeparticle.png');
    const material = new THREE.PointsMaterial({
      size: 4,
      map: texture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      color: "white"
    });
  
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
  
    this.smokeSfx = new THREE.Points(geometry, material);
    this.scene.add(this.smokeSfx);

    setTimeout(() => {
      this.scene.remove(this.smokeSfx);
      this.smokeSfx = undefined;
      
      // Loop if still smoking
      if (this.isSmoking) {
        this.createSmoke()
      }
      else {
        this.foodAmount = 0
        this.light.visible = false
      }
    }, 4000);
  }
  
  updateSmokeSFX() {
    const positions = this.smokeSfx.geometry.attributes.position.array;
    const velocities = this.smokeSfx.geometry.attributes.velocity.array;
  
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += velocities[i];
      positions[i + 1] += velocities[i + 1];
      positions[i + 2] += velocities[i + 2]
    }
  
    this.smokeSfx.geometry.attributes.position.needsUpdate = true;
  }

  createExplosion(colorAsString) {
    this.isExploding = true;

    const geometry = new THREE.BufferGeometry();
    const particleCount = 500;
  
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
  
    const texture = new THREE.TextureLoader().load('assets/2d/smokeparticle.png');
    const material = new THREE.PointsMaterial({
      size: 4,
      map: texture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      color: colorAsString
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
  
    this.explosionSfx = new THREE.Points(geometry, material);
    this.scene.add(this.explosionSfx);

    setTimeout(() => {
      this.scene.remove(this.explosionSfx);
      this.explosionSfx = undefined;
      this.isExploding = false;
      this.disable(false)
    }, 6000);
  }
  
  updateExposionSFX() {
    const positions = this.explosionSfx.geometry.attributes.position.array;
    const velocities = this.explosionSfx.geometry.attributes.velocity.array;
  
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += velocities[i];
      positions[i + 1] += velocities[i + 1];
      positions[i + 2] += velocities[i + 2]
  
      //if (positions[i + 1] >= 100) positions[i + 1] = 0;
    }
  
    this.explosionSfx.geometry.attributes.position.needsUpdate = true;
  }
}

export { InteractableCauldron }

