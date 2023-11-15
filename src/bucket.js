import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { Grabable } from './grabable.js'

class Bucket extends Grabable{

  constructor(interactables, scene, position){
    super(interactables, scene, position)

    this.isLoaded = false
    //this.rawFood
    this.scene = scene
    this.loadModel()
  }

  loadModel(){
    const loader = new GLTFLoader()

    loader.load('./assets/3d/bucket.glb', (gltf) => {
      
      gltf.scene.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
      });

      this.object = gltf.scene
      this.rotation = this.object.rotation.y
      this.object.scale.set(2, 2, 2)
      this.object.position.copy(this.collider.position)
      this.scene.add(this.object)
      this.isLoaded = true
    })
  }
}

export { Bucket }
