import * as THREE from 'three'
import { Interactable } from './interactable.js';
import { RawFood } from './rawFood.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

class InteractablePumpkin extends Interactable{
  constructor(interactables, scene, position){
    const geometry = new THREE.DodecahedronGeometry(3)
    super(interactables, scene, geometry, position)
    this.interactLabel.position.add(new THREE.Vector3(0, 1.5, 0))
    this.initialScale = new THREE.Vector3()
    this.choppedScale = new THREE.Vector3()
    this.isHarvested = false
    this.isLoaded = false
    this.loadModel()
  }

  loadModel(){
    const loader = new GLTFLoader()
    loader.load('./assets/3d/pumpkin_plant.glb', (gltf) => {

      gltf.scene.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;

            child.receiveShadow = true;
        }
      });

      this.object = gltf.scene
      
      const multiplier = THREE.MathUtils.randFloat(1, 1.5)
      this.object.scale.set(2, 2, 2).multiplyScalar(multiplier)
      this.object.position.copy(this.collider.position)
      this.object.rotation.y = THREE.MathUtils.randFloat(0, 2 * Math.PI)
      this.initialScale.copy(this.object.scale)
      this.scene.add(this.object)
      this.isLoaded = true
    })
  }
  
  update(deltaTime) {
    if (!this.isLoaded)
      return

    const clampedDeltaTime = Math.min(Math.max(deltaTime, 0), 1);

    if (this.isHarvested) {
      this.object.scale.lerp(this.choppedScale, clampedDeltaTime * 5)
    }
    else {
      this.object.scale.lerp(this.initialScale, clampedDeltaTime * 5)
    }
  }

  onInteract(interactor) {
    super.onInteract(interactor)

    // If there's already something in hand, cancel interact.
    if (interactor.grabbedObject != null)
      return

    const rawFood = new RawFood(this.interactables, this.scene)
    rawFood.onInteract(interactor)
    
    this.isHarvested = true
    this.disable(true)

    setTimeout(() => {
      //ProcessingText = 'E';
      //interactDiv.textContent = ProcessingText;
      this.isHarvested = false
      this.disable(false)
    }, 6000);
  }
}

export { InteractablePumpkin }

