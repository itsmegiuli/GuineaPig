import * as THREE from 'three'


import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as CSS2DRenderer from 'CSS2DRenderer'

class GuineaPig{

  constructor(scene, _onLoadCallbackfunction){
    this.steeringType = "smooth"
    this.isLoaded = false
    this.guineaPig
    this.scene = scene
    this.nameDiv = null
    this.nameLabel = null
    this.movementSpeed = 0.1
    this.hopTargetPosition = new THREE.Vector3()
    this.hopCounter = 0
    this.hopNewRotation = new THREE.Quaternion()
    this.loadGuineaPig(_onLoadCallbackfunction)
  }
  
  update(deltaTime){

    if (this.hopCounter <= 0) {
      this.updateHop()
    }
    else {
      const dir = new THREE.Vector3(
        this.hopTargetPosition.x - this.guineaPig.position.x,
        this.hopTargetPosition.y - this.guineaPig.position.y,
        this.hopTargetPosition.z - this.guineaPig.position.z)

      if (dir.lengthSq() > 1) {
        dir.normalize()

        this.guineaPig.quaternion.slerp(this.hopNewRotation, deltaTime)
        this.guineaPig.position.add(dir.multiplyScalar(this.movementSpeed))
      }
    }

    this.hopCounter -= deltaTime
  }

  updateHop() {
    this.hopTargetPosition = new THREE.Vector3(THREE.MathUtils.randFloat(-100, 100), 0, THREE.MathUtils.randFloat(-100, 100))
    this.hopCounter = THREE.MathUtils.randFloat(10, 15)

    const oldRotation = (new THREE.Quaternion()).copy(this.guineaPig.quaternion)
    this.guineaPig.lookAt(this.hopTargetPosition)
    this.hopNewRotation.copy(this.guineaPig.quaternion)
    this.guineaPig.setRotationFromQuaternion(oldRotation)
  }

  addLabel (label) {
    this.guineaPig.add(label);
  }

  loadGuineaPig(_onLoadCallbackfunction){
    const loader = new GLTFLoader()
    loader.load('./assets/3d/bunny.glb', (gltf) => {

      gltf.scene.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;

            child.receiveShadow = true;
        }
      });

      this.guineaPig = gltf.scene
      this.guineaPig.scale.set(0.5, 0.5, 0.5)
      this.scene.add(this.guineaPig)
      this.isLoaded = true

      if (_onLoadCallbackfunction != undefined)
      _onLoadCallbackfunction(this);

    })
  }
}

export { GuineaPig }

