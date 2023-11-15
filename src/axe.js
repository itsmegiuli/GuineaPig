import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { Grabable } from './grabable.js'

class Axe extends Grabable{

  constructor(interactables, scene, position){
    super(interactables, scene, position)

    this.isLoaded = false
    this.scene = scene
    this.loadModel()
  }

  loadModel(){
    const loader = new GLTFLoader()

    loader.load('./assets/3d/axe.glb', (gltf) => {
      
      gltf.scene.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
      });

      this.object = gltf.scene
      this.rotation = this.object.rotation.y
      this.object.position.copy(this.collider.position).add(new THREE.Vector3(0, 1.5, 1.5))
      this.object.rotation.x = 0.25
      this.object.rotation.z = 2
      this.object.scale.set(2, 2, 2)
      this.scene.add(this.object)
      this.isLoaded = true
    })
  }
}

export { Axe }
