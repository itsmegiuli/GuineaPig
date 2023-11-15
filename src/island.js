import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { InteractableCrop } from './interactableCrop.js'
import { InteractableCauldron } from './interactableCauldron.js'
import { InteractablePumpkin } from './interactablePumpkin.js'
import { Axe } from './axe.js'
import { InteractableTree } from './interactableTree.js'
import { Bucket } from './bucket.js'
import { Logs } from './logs.js'

class Island{

  constructor(interactables, scene){
    this.isLoaded = false
    this.island
    this.scene = scene
    this.interactables = interactables
    this.cauldron
    this.updateables = []
    this.loadEnvironment()
  }

  loadEnvironment(){
    const loader = new GLTFLoader()

    loader.load('./assets/3d/sky.glb', (gltf) => {
      this.scene.add(gltf.scene)
    })

    loader.load('./assets/3d/island_empty.glb', (gltf) => {
      
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
      
      this.InitInteractables(this.scene, this.interactables)
    })
  }

  update(deltaTime) {
    if (!this.isLoaded)
      return

    for(var i = 0; i < this.updateables.length; i++) {
      this.updateables[i].update(deltaTime)
    }
  }

  InitInteractables(scene, interactables) {
    this.updateables.push(new InteractableCrop(interactables, scene, new THREE.Vector3(-1.8, 0, -7)))
    this.updateables.push(new InteractableCrop(interactables, scene, new THREE.Vector3(-1.8, 0, -2.3)))
    this.updateables.push(new InteractableCrop(interactables, scene, new THREE.Vector3(3.8, 0, -2.3)))
    this.updateables.push(new InteractableCrop(interactables, scene, new THREE.Vector3(3.9, 0, -6.5)))
    this.updateables.push(new InteractableCrop(interactables, scene, new THREE.Vector3(10.5, 0, -1.8)))
    this.updateables.push(new InteractableCrop(interactables, scene, new THREE.Vector3(10.3, 0, -6.5)))
    this.updateables.push(new InteractableCrop(interactables, scene, new THREE.Vector3(16, 0, -6.5)))
    this.updateables.push(new InteractableCrop(interactables, scene, new THREE.Vector3(16.2, 0, -1.5)))

    this.updateables.push(new InteractablePumpkin(interactables, scene, new THREE.Vector3(-0.8, 0, 11.5)))
    this.updateables.push(new InteractablePumpkin(interactables, scene, new THREE.Vector3(-2.4, 0, 6.3)))
    this.updateables.push(new InteractablePumpkin(interactables, scene, new THREE.Vector3(8.3, 0, 7.5)))
    this.updateables.push(new InteractablePumpkin(interactables, scene, new THREE.Vector3(5.4, 0, 13)))
    this.updateables.push(new InteractablePumpkin(interactables, scene, new THREE.Vector3(15.6, 0, 9)))

    new Axe(interactables, scene, new THREE.Vector3(7.5, 4.8, -16))
    new Bucket(interactables, scene, new THREE.Vector3(0.3, 1, -43.5))
    new Logs(interactables, scene, new THREE.Vector3(12, 1, -16))

    this.island.traverse((obj) => {
      if (obj.name.includes("tree")) {
        this.updateables.push(new InteractableTree(interactables, scene, obj))
      }
    });

    this.updateables.push(new InteractableCauldron(interactables, scene, new THREE.Vector3(-21.5, 0, -32.5)))
    
  }
}

export { Island }

