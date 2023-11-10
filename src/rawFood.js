import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

class RawFood{

  constructor(scene, _onLoadCallbackfunction){
    this.isLoaded = false
    this.rawFood
    this.scene = scene
    this.loadModel(_onLoadCallbackfunction)
  }

  loadModel(_onLoadCallbackfunction){
    const loader = new GLTFLoader()

    loader.load('./assets/3d/muscle.glb', (gltf) => {
      
      gltf.scene.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
      });
      
      this.rawFood = gltf.scene
      this.rotation = this.rawFood.rotation.y
      this.rawFood.position.y = 1
      this.rawFood.scale.set(0.5, 0.7, 0.5)
      this.scene.add(this.rawFood)
      this.isLoaded = true

      if (_onLoadCallbackfunction != undefined)
      _onLoadCallbackfunction(this);
    })
  }
}

export { RawFood }
