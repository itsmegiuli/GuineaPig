import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { Grabable } from './grabable.js'

class Pommes extends Grabable{

  constructor(interactables, scene, _onLoadCallbackfunction){
    super(interactables, scene, new THREE.Vector3())

    this.isLoaded = false
    //this.pommes
    this.scene = scene
    this.loadModel(_onLoadCallbackfunction)
  }

  loadModel(_onLoadCallbackfunction){
    const loader = new GLTFLoader()

    loader.load('./assets/3d/french_fries.glb', (gltf) => {
      
      gltf.scene.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
      });
      
      this.object = gltf.scene
      this.rotation = this.object.rotation.y
      this.object.position.y = 1
      this.object.scale.set(0.5, 0.7, 0.5)
      this.scene.add(this.object)
      this.isLoaded = true

      if (_onLoadCallbackfunction != undefined)
      _onLoadCallbackfunction(this);
    })
  }
}

export { Pommes }
