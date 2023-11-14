import * as THREE from 'three'
import { Interactable } from './interactable.js';
import { RawFood } from './rawFood.js';

class InteractableCrop extends Interactable{
  constructor(interactables, scene, position){
    const geometry = new THREE.CylinderGeometry( 1.5, 1.5, 18);
    super(interactables, scene, geometry, position)
    this.interactLabel.position.add(new THREE.Vector3(0, 4.5, 0))
  }

  onInteract(interactor) {
    super.onInteract(interactor)

    // If there's already something in hand, cancel interact.
    if (interactor.grabbedObject != null)
      return

    const rawFood = new RawFood(this.interactables, this.scene)
    rawFood.onInteract(interactor)
  }
}

export { InteractableCrop }

