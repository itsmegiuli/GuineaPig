import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

class GuineaPig{

  constructor(scene){
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
  }

  loadGuineaPig(){
    const loader = new GLTFLoader()
    loader.load('./assets/3d/bunny.glb', (gltf) => {
      this.guineaPig = gltf.scene
      //this.guineaPig.rotation.y -= Math.PI/4
      this.rotation = this.guineaPig.rotation.y
      this.guineaPig.scale.set(0.5, 0.5, 0.5)
      this.scene.add(this.guineaPig)
      this.isLoaded = true
    })
  }
}

export { GuineaPig }

