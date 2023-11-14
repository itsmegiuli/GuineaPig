import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { InteractableCrop } from './interactableCrop.js'
import { InteractableCauldron } from './interactableCauldron.js'

class Island{

  constructor(interactables, scene){
    this.isLoaded = false
    this.island
    this.scene = scene
    this.cauldron
    this.loadModel()
    this.InitInteractables(scene, interactables)
  }

  loadModel(){
    const loader = new GLTFLoader()

    loader.load('./assets/3d/sky.glb', (gltf) => {
      this.scene.add(gltf.scene)
    })

    loader.load('./assets/3d/island.glb', (gltf) => {
      
      gltf.scene.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
      });
      
      this.island = gltf.scene
      this.rotation = this.island.rotation.y
      this.island.scale.set(0.02, 0.02, 0.02)
      this.island.position.y -= 14
      this.scene.add(this.island)
      this.isLoaded = true
    })
  }

  update(deltaTime) {
    if (!this.isLoaded)
      return

    this.cauldron.update()
  }

  InitInteractables(scene, interactables) {
    new InteractableCrop(interactables, scene, new THREE.Vector3(-1.8, 0, -7))
    new InteractableCrop(interactables, scene, new THREE.Vector3(-1.8, 0, -2.3))
    new InteractableCrop(interactables, scene, new THREE.Vector3(3.8, 0, -2.3))
    new InteractableCrop(interactables, scene, new THREE.Vector3(3.9, 0, -6.5))
    new InteractableCrop(interactables, scene, new THREE.Vector3(10.5, 0, -1.8))
    new InteractableCrop(interactables, scene, new THREE.Vector3(10.3, 0, -6.5))
    new InteractableCrop(interactables, scene, new THREE.Vector3(16, 0, -6.5))
    new InteractableCrop(interactables, scene, new THREE.Vector3(16.2, 0, -1.5))

    this.cauldron = new InteractableCauldron(interactables, scene, new THREE.Vector3(-21.5, 0, -32.5))
    
  }
}

export { Island }

