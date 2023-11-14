import * as THREE from 'three'


import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as CSS2DRenderer from 'CSS2DRenderer'
import { Grabable } from './grabable.js'

class GuineaPig extends Grabable{

  constructor(interactables, scene){
    super(interactables, scene, new THREE.Vector3())

    this.isLoaded = false
    //this.guineaPig
    this.scene = scene
    this.nameDiv = null
    this.nameLabel = null
    this.movementSpeed = 0.1
    this.hopTargetPosition = new THREE.Vector3()
    this.hopCounter = 0
    this.hopNewRotation = new THREE.Quaternion()
    this.loadGuineaPig()
  }
  
  update(deltaTime){
    if (!this.isLoaded)
      return

    if (this.hopCounter <= 0) {
      this.updateHop()
    }
    else {
      const dir = new THREE.Vector3(
        this.hopTargetPosition.x - this.object.position.x,
        this.hopTargetPosition.y - this.object.position.y,
        this.hopTargetPosition.z - this.object.position.z)

      if (dir.lengthSq() > 1) {
        dir.normalize()

        this.object.quaternion.slerp(this.hopNewRotation, deltaTime)
        this.object.position.add(dir.multiplyScalar(this.movementSpeed))
        this.collider.position.copy(this.object.position)
      }
    }

    this.hopCounter -= deltaTime
  }

  updateHop() {
    this.hopTargetPosition = new THREE.Vector3(THREE.MathUtils.randFloat(-100, 100), 0, THREE.MathUtils.randFloat(-100, 100))
    this.hopCounter = THREE.MathUtils.randFloat(10, 15)

    const oldRotation = (new THREE.Quaternion()).copy(this.object.quaternion)
    this.object.lookAt(this.hopTargetPosition)
    this.hopNewRotation.copy(this.object.quaternion)
    this.object.setRotationFromQuaternion(oldRotation)
  }

  addLabel (label) {
    this.object.add(label);
  }

  loadGuineaPig(){
    const loader = new GLTFLoader()
    loader.load('./assets/3d/bunny.glb', (gltf) => {

      gltf.scene.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;

            child.receiveShadow = true;
        }
      });

      this.object = gltf.scene
      this.object.scale.set(0.5, 0.5, 0.5)
      this.scene.add(this.object)
      this.isLoaded = true
    })
  }
}

export { GuineaPig }

