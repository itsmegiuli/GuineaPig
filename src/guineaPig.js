import * as THREE from 'three'


import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as CSS2DRenderer from 'CSS2DRenderer'

class GuineaPig{

  constructor(scene, island){
    this.steeringType = "smooth"
    this.isLoaded = false
    this.guineaPig
    this.scene = scene
    this.steer = 0
    this.steerTo = 0
    this.speed = 0
    this.speedTo = 0
    this.angle = 0
    this.rotation
    this.island = island
    this.loadGuineaPig()
    
  }

  accelerate(){
    this.speedTo = 1
  }

  reverse(){
    this.speedTo = -1
  }

  deccelerate(){
    this.speedTo = 0
  }

  steerLeft(){
    this.steerTo = -1
  }

  steerRight(){
    this.steerTo = 1
  }

  releaseSteer(){
    this.steerTo = 0
  }

  animate(){
    // RUNNING
    this.speed += (this.speedTo - this.speed) / 10 * 0.1
    const dx = Math.sin(this.angle) * this.speed
    const dz = Math.cos(this.angle) * this.speed

    //updates the guinea pig position
    this.guineaPig.position.x += dx
    this.guineaPig.position.z += dz



    // STEERING
    this.angle += -this.steer * this.speed * 0.1
    this.guineaPig.rotation.y = this.rotation + this.angle
    if(this.steeringType == "linear"){
      if(this.steer < this.steerTo){
        this.steer += 0.1
      }
      if(this.steer > this.steerTo){
        this.steer -= 0.1
      }
    }else{
      this.steer += (this.steerTo - this.steer) / 10
    }

/*
    if (this.guineaPig instanceof THREE.Object3D) {
      console.log("yes")
    } else {
      console.log("no")
    }

    if (this.island.island instanceof THREE.Object3D) {
      console.log("yes")
    } else {
      console.log("no")
    }
    */

    if (this.guineaPig && this.island.island) {
      const islandBoundingBox = new THREE.Box3().setFromObject(this.island.island);
    
      const guineaPigBoundingBox = new THREE.Box3().setFromObject(this.guineaPig);

      if (!islandBoundingBox.intersectsBox(guineaPigBoundingBox)) {
        console.log("outside the island")

      }

  
    }


}

loadGuineaPig(){
    const loader = new GLTFLoader()
    loader.load('./assets/3d/bunny.glb', (gltf) => {

      gltf.scene.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;

            child.receiveShadow = true;
        }
      });

      this.guineaPig = gltf.scene
      //this.guineaPig.rotation.y -= Math.PI/4
      this.rotation = this.guineaPig.rotation.y
      this.guineaPig.scale.set(0.5, 0.5, 0.5)
      this.scene.add(this.guineaPig)
      this.isLoaded = true


      //Nametag
    var nameDiv = document.createElement( 'div' );
    nameDiv.className = 'label';
    nameDiv.textContent = 'guineapig';
    nameDiv.style.backgroundColor = 'transparent';
  
    var nameLabel = new CSS2DRenderer.CSS2DObject( nameDiv );
    nameLabel.position.set( 0, 6, 0 );
    nameLabel.center.set( 0.5, 0.5 );
    this.guineaPig.add( nameLabel );
    })


  }
}

export { GuineaPig }

