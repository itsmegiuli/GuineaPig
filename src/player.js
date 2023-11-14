import * as THREE from 'three'

const pointer = new THREE.Vector2()
const prevPointer = new THREE.Vector2()

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
    this.isLoaded = true
  }
  
  itemPickup(){
    const itemForward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.cam.quaternion);
    const itemRight = new THREE.Vector3(1, 0, 0).applyQuaternion(this.cam.quaternion);
    const itemDown = new THREE.Vector3(0, -1, 0).applyQuaternion(this.cam.quaternion);
    const newPosition = this.cam.position.clone().add(itemForward.multiplyScalar(3).add(itemRight.multiplyScalar(2)).add(itemDown.multiplyScalar(1)));
    this.heldItem.position.copy(newPosition);
    this.heldItem.rotation.copy(this.cam.rotation);
  }
}

export { Player }

