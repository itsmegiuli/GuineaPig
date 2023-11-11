import * as THREE from 'three'


import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as CSS2DRenderer from 'CSS2DRenderer'

class GuineaPig{

  constructor(scene, island, _onLoadCallbackfunction){
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
    this.nameDiv = null
    this.nameLabel = null
    this.loadGuineaPig(_onLoadCallbackfunction)
    this.isStopped = false
    this.newX
    this.NewZ
    
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
    console.log("left")
  }

  steerRight(){
    this.steerTo = 1
    console.log("right")
  }

  releaseSteer(){
    this.steerTo = 0
  }

  animate(){
    // RUNNING
    this.speed += (this.speedTo - this.speed) / 10 * 0.1
    const dx = Math.sin(this.angle) * this.speed
    const dz = Math.cos(this.angle) * this.speed

    //saves the guinea pig position
    this.newX = this.guineaPig.position.x += dx
    this.newZ = this.guineaPig.position.z += dz


    

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


  
    if (this.guineaPig && this.island.island) {
      const islandBoundingBox = new THREE.Box3().setFromObject(this.island.island);
      const size = new THREE.Vector3();
      islandBoundingBox.getSize(size);
      

      // Mesh to visually check bounding box //delete
      const islandBoundingBoxMesh = new THREE.Mesh(
      new THREE.SphereGeometry(size.x*0.4,32,32),
      new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
      );

      

      // Position
      const center = new THREE.Vector3();
      islandBoundingBox.getCenter(center); //keep, needed for islandSphere
      islandBoundingBoxMesh.position.copy(center);

      const islandSphere = new THREE.Sphere(center, size.x*0.4)


      this.scene.add(islandBoundingBoxMesh);
    
      
    
      const guineaPigBoundingBox = new THREE.Box3().setFromObject(this.guineaPig);


      if(islandSphere.intersectsBox(guineaPigBoundingBox)) {
        //update position only if inside boundaries
        this.guineaPig.position.x = this.newX
        this.guineaPig.position.z = this.newZ
      } else {
          //goback
      }




  
      }

      


  
    }

}

randomMovement() {
   //random Movements
   setTimeout(() => {
    this.moveRandom();
  }, 13000);
}

moveRandom() {
  //if not stopped = keeps going
  if(!this.isStopped) {
   let x = Math.floor(Math.random()*4)
   console.log(x)

   if(x == 0){
     this.isStopped = true
     console.log("stopping")
     this.deccelerate();
     this.releaseSteer();
     setTimeout(() => {
       this.isStopped = false;
     }, 10000); //waits 10 sec
     
   } else if(x == 1){
     this.isStopped = false
     for (let i = 0; i < 60; i++) {
       this.accelerate();
       console.log("walking")
       
     }

   } else if(x == 2){
     for (let i = 0; i < 60; i++) {
      this.steerLeft()
      this.accelerate(); 
     }
     this.isStopped = false
 
   }else if(x == 3){
     for (let i = 0; i < 60; i++) {
     this.steerRight()
     }
     this.isStopped = false
   } 
  }
   


}

addLabel (label) {
  this.guineaPig.add(label);
}



loadGuineaPig(_onLoadCallbackfunction){
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

      if (_onLoadCallbackfunction != undefined)
      _onLoadCallbackfunction(this);

    })


  }
}

export { GuineaPig }

