import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

class Pommes{

  constructor(scene, _onLoadCallbackfunction){
    this.isLoaded = false
    this.pommes
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
      
      this.pommes = gltf.scene
      this.rotation = this.pommes.rotation.y
      this.pommes.position.y = 1
      this.pommes.scale.set(0.5, 0.7, 0.5)
      this.scene.add(this.pommes)
      this.isLoaded = true

      if (_onLoadCallbackfunction != undefined)
      _onLoadCallbackfunction(this);
    })
  }
}

export { Pommes }
