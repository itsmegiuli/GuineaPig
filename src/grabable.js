import * as THREE from 'three'
import { Interactable } from './interactable.js';

class Grabable extends Interactable{
  constructor(interactables, scene, offset){
    super(interactables, scene, new THREE.DodecahedronGeometry(3), offset)
    this.interactDiv.textContent = "Press F to grab"
    this.object
  }

  /**
   * Removes collider and object from scene. Make sure there are no other references so gc can take over.
   */
  dispose() {
    super.dispose()
    this.scene.remove(this.object)
  }

  onInteract(interactor) {
    super.onInteract(interactor)

    // Interactor is already holding something, cancle interract.
    if (interactor.grabbedObject != null)
        return

    interactor.grabObject(this)

    // Hide interactable while picked up
    this.disable(true)
  }

  onDropped(interactor) {
    //Enable interactable again
    this.object.position.y -= 4
    this.collider.position.copy(this.object.position)
    this.disable(false)
  }
}

export { Grabable }

