import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { Grabable } from './grabable.js'

class RawFood extends Grabable{

  constructor(interactables, scene){
    super(interactables, scene, new THREE.Vector3())

    this.isLoaded = false
    //this.rawFood
    this.scene = scene
    this.loadModel()
  }

  loadModel(){
    const loader = new GLTFLoader()

    loader.load('./assets/3d/sack.glb', (gltf) => {
      
      gltf.scene.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material.color.set(Math.random() * 0xffffff)
        }
      });

      this.object = gltf.scene
      this.rotation = this.object.rotation.y
      this.object.position.y = 1
      this.object.scale.set(7, 7, 7)
      this.scene.add(this.object)
      this.isLoaded = true
    })
  }
}

export { RawFood }
