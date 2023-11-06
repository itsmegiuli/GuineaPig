import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

class Island{

  constructor(scene){
    this.isLoaded = false
    this.island
    this.scene = scene
    this.loadModel()
  }

  loadModel(){
    const loader = new GLTFLoader()

    loader.load('./assets/3d/sky.glb', (gltf) => {
      //this.island.scale.set(1, 1, 1)
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
      //this.island.rotation.y -= Math.PI/4
      this.rotation = this.island.rotation.y
      this.island.scale.set(0.02, 0.02, 0.02)
      this.island.position.y -= 14
      this.scene.add(this.island)
      this.isLoaded = true
    })
  }
}

export { Island }

