import * as THREE from 'three'
import { Interactable } from './interactable.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { Axe } from './axe.js';
import { Logs } from './logs.js';

class InteractableTree extends Interactable{
  constructor(interactables, scene, treeObject){
    const geometry = new THREE.CylinderGeometry( 4, 4, 25);
    const pos = new THREE.Vector3()
    treeObject.getWorldPosition(pos)
    super(interactables, scene, geometry, pos)
    this.interactLabel.position.add(new THREE.Vector3(0, 4.5, 0))
    this.treeObject = treeObject

    this.initialScale = new THREE.Vector3().copy(treeObject.scale)
    this.choppedScale = new THREE.Vector3()
    this.isChopped = false
  }

  update(deltaTime) {
    const clampedDeltaTime = Math.min(Math.max(deltaTime, 0), 1);

    if (this.isChopped) {
      this.treeObject.scale.lerp(this.choppedScale, clampedDeltaTime * 5)
    }
    else {
      this.treeObject.scale.lerp(this.initialScale, clampedDeltaTime * 5)
    }
  }

  onInteract(interactor) {
    super.onInteract(interactor)

    // If there's already something in hand, cancel interact.
    if (interactor.grabbedObject == null)
      return

    if (!(interactor.grabbedObject instanceof Axe))
      return

    new Logs(
      this.interactables, 
      this.scene, 
      new THREE.Vector3().copy(this.collider.position).add(new THREE.Vector3(
        THREE.MathUtils.randFloat(1, 4), 
        2, 
        THREE.MathUtils.randFloat(1, 4))))

    this.isChopped = true
    this.disable(true)

    setTimeout(() => {
      //ProcessingText = 'E';
      //interactDiv.textContent = ProcessingText;
      this.isChopped = false
      this.disable(false)
    }, 12000);
    
  }
}

export { InteractableTree }

