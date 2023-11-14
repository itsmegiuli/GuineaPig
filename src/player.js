import * as THREE from 'three'
import { Interactable } from './interactable.js'
import { Grabable } from './grabable.js'

class Player{

  constructor(cam) {
    this.isLoaded = false
    this.cam = cam
    this.rotation = new THREE.Quaternion()
    this.translation = new THREE.Vector3()
    this.phi = 0
    this.theta = 0
    this.moveDelta = new THREE.Vector3()
    this.offset = new THREE.Vector3()
    this.offset.copy(cam.position)
    this.movementSpeed = 0.2
    this.rotationSpeed = 0.6
    this.selectedInteractable = null

    this.grabbedObject = null

    this.heldItem = null
    this.heldItemData = null
    this.load(window)
  }

  onPointerMove(event, player) {
    /*prevPointer.x = pointer.x
    prevPointer.y = pointer.y
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1*/

    const delta = new THREE.Vector2()
    delta.x = -(event.movementX / window.innerWidth)
    delta.y = (event.movementY / window.innerHeight)
    
    player.phi += delta.x * 5 * player.rotationSpeed

    player.theta += -delta.y * 5 * player.rotationSpeed
    const clamp = Math.PI / 3
    if (player.theta < -clamp)
    player.theta = -clamp
    if (player.theta > clamp)
    player.theta = clamp

    const qx = new THREE.Quaternion()
    
    qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), player.phi)
    const qz = new THREE.Quaternion()
    
    qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), player.theta)

    const q = new THREE.Quaternion()
    q.multiply(qx)
    q.multiply(qz)

    player.rotation.copy(q)
  }

  update(deltaTime){
    if (!this.isLoaded)
      return

    this.updatePlayerMovement()
    this.updateGrabbedItem()
  }

  updatePlayerMovement() {
    // rotation
    this.cam.quaternion.copy(this.rotation)

    // translation
    const qx = new THREE.Quaternion()
    qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi)
    
    const forward = new THREE.Vector3(0, 0, -1)
    forward.applyQuaternion(qx)
    forward.multiplyScalar(this.moveDelta.z * this.movementSpeed)

    const left = new THREE.Vector3(-1, 0, 0)
    left.applyQuaternion(qx)
    left.multiplyScalar(this.moveDelta.x * this.movementSpeed)

    this.translation.add(forward)
    this.translation.add(left)

    const newPos = new THREE.Vector3(this.translation.x + this.offset.x, this.translation.y + this.offset.y, this.translation.z + this.offset.z)
    this.cam.position.copy(newPos)
  }

  updateGrabbedItem() {
    if (this.grabbedObject == null)
      return

    const itemForward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.cam.quaternion);
    const itemRight = new THREE.Vector3(1, 0, 0).applyQuaternion(this.cam.quaternion);
    const itemDown = new THREE.Vector3(0, -1, 0).applyQuaternion(this.cam.quaternion);
    const newPosition = this.cam.position.clone().add(itemForward.multiplyScalar(3).add(itemRight.multiplyScalar(2)).add(itemDown.multiplyScalar(1)));
    // undefined can happen when the model is just loaded for some reason
    if (this.grabbedObject.object != undefined) {
      this.grabbedObject.object.position.copy(newPosition)
      this.grabbedObject.object.rotation.copy(this.cam.rotation)
    }
  }

  load(){
    window.addEventListener( 'pointermove', (event) => this.onPointerMove(event, this) )

    document.addEventListener('keydown',(event) => {
      const key = event.key
      if(key == 'w'){
        this.moveDelta.z = 1
      }else if(key == 'a'){
        this.moveDelta.x = 1
      }else if(key == 's'){
        this.moveDelta.z = -1
      }else if(key == 'd'){
        this.moveDelta.x = -1
      } 
    })

    document.addEventListener('keyup',(event) => {
      const key = event.key
      if(key == 'w'){
        if (this.moveDelta.z == 1)
          this.moveDelta.z = 0
      }else if(key == 'a'){
        if (this.moveDelta.x == 1)
          this.moveDelta.x = 0
      }else if(key == 's'){
        if (this.moveDelta.z == -1)
          this.moveDelta.z = 0
      }else if(key == 'd'){
        if (this.moveDelta.x == -1)
          this.moveDelta.x = 0
      } 
    })

    document.addEventListener('keydown', (event) => {
      const key = event.key
      if (key != 'f')
        return

      this.interact()
    })

    this.isLoaded = true
  }

  checkInteractables(interactables) {
    if (!this.isLoaded)
      return

    // De-/Activate interactables based on proximity
    for(var i = 0; i< interactables.length; i++){
      const obj = interactables[i]
      const lengthSq = new THREE.Vector2(obj.collider.position.x - this.cam.position.x, obj.collider.position.z - this.cam.position.z).lengthSq()

      if (lengthSq < 200 && !obj.isDisabled) {
        obj.onActivate()
      }
      else {
        obj.onDeactivate()
      }
    }

    // De-/Select closest interactable based on raycasting
    const raycaster = new THREE.Raycaster();
    const forward = new THREE.Vector3();
    this.cam.getWorldDirection(forward);
    raycaster.set(this.cam.position, forward)
    // Do raycasting with all active and non-disabled interactable objects
    const intersections = raycaster.intersectObjects(interactables.filter(obj => obj.isActive && !obj.isDisabled).map(obj => obj.collider), true)

    if (intersections.length > 0) {
      // Find the interactable from its attatched collider
      const nearest = interactables.find(o => o.collider == intersections[0].object)

      // If it's the same one as before, do nothing
      if (this.selectedInteractable == nearest)
        return

      // If it changed, then deselect previous one
      if (this.selectedInteractable != null)
        this.selectedInteractable.onDeselected()

      // Select interactable
      this.selectedInteractable = nearest
      this.selectedInteractable.onSelected()
    }
    // Deselect if no interactable found
    else if (this.selectedInteractable != null) {
      this.selectedInteractable.onDeselected()
      this.selectedInteractable = null
    }

  }

  interact() {
    if (this.selectedInteractable != null) {
      this.selectedInteractable.onInteract(this)
      this.selectedInteractable = null
    }
    else if (this.grabbedObject != null) {
      this.dropObject()
    }
  }
  
  grabObject(object) {
    if (!(object instanceof Grabable))
      console.warn("The given object is not an instance of the Grabable-class. Are you sure you can grab it?")

    if (this.grabbedObject != null)
      return

    this.grabbedObject = object
    this.grabbedObject.disable(true)
  }

  dropObject() {
    if (this.grabbedObject == null)
      return

      this.grabbedObject.onDropped(this)
      this.grabbedObject = null
  }
}

export { Player }

