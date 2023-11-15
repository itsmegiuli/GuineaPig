import * as THREE from 'three'


import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as CSS2DRenderer from 'CSS2DRenderer'
import { Grabable } from './grabable.js'
import { Pommes } from './pommes.js'

class GuineaPig extends Grabable{

  constructor(interactables, scene, island){
    super(interactables, scene, new THREE.Vector3())

    this.isLoaded = false
    this.scene = scene
    this.movementSpeed = 0.1
    this.hopTargetPosition = new THREE.Vector3()
    this.hopCounter = 0
    this.hopNewRotation = new THREE.Quaternion()
    this.loadModel()
    this.island = island
    this.raycaster = new THREE.Raycaster();
    this.lastValidPosition = new THREE.Vector3();

    this.satiety = 60

    this.infoDiv = document.createElement( 'div' );
    this.infoDiv.className = 'label';
    this.infoDiv.textContent = 'The Bunny is happy.';
    this.infoDiv.style.fontSize = "xx-large"
    this.infoDiv.style.color = "green"
    this.infoDiv.style.backgroundColor = 'transparent';
    this.infoDiv.style.textShadow = "-1px 0 white, 0 1px white, 1px 0 white, 0 -1px white"
    this.infoLabel = new CSS2DRenderer.CSS2DObject( this.infoDiv );
    this.infoLabel.position.copy(this.collider.position).add(new THREE.Vector3(0, 4, 0))
    this.infoLabel.center.set( 0.5, 0.5 );
    this.infoLabel.visible = false
    this.scene.add(this.infoLabel)
    this.collider.attach(this.infoLabel)
  }

  dispose() {
    super.dispose()
    this.scene.remove(this.infoLabel)
  }

  onActivate() {
    if(this.isActive)
      return

    super.onActivate()

    this.infoLabel.visible = true
  }

  onDeactivate() {
    if(!this.isActive)
      return

    super.onDeactivate()

    this.infoLabel.visible = false
  }

  onInteract(interactor) {
    if (!(interactor.grabbedObject instanceof Pommes)) {
      super.onInteract(interactor)
      return
    }

    const grabbedObject = interactor.grabbedObject
    interactor.dropObject()
    grabbedObject.dispose()
    this.satiety += 30
  }
  
  update(deltaTime){
    //console.log(this.island)
    if (!this.isLoaded || !this.island.island) {
      return
    }

  this.satiety = Math.max(0, this.satiety - deltaTime)

  if (this.isActive) {
    if (this.satiety >= 90) {
      this.infoDiv.textContent = "The bunny can't eat much more!!"
      this.infoDiv.style.color = "red"
    }
    else if (this.satiety >= 60) {
      this.infoDiv.textContent = "The bunny is full!"
      this.infoDiv.style.color = "green"
    }
    else if (this.satiety >= 20) {
      this.infoDiv.textContent = "The bunny is hungry."
      this.infoDiv.style.color = "brown"
    }
    else if (this.satiety > 0) {
      this.infoDiv.textContent = "The bunny is starving!"
      this.infoDiv.style.color = "red"
    }
    else {
      this.infoDiv.textContent = "The bunny is dead."
      this.infoDiv.style.color = "black"
    }
    
  }

  const raycaster = new THREE.Raycaster(this.object.position, new THREE.Vector3(0, -1, 0));
  const intersects = raycaster.intersectObject(this.island.island);

  if (intersects.length > 0) { //inside the island
    //console.log("inside")

    this.lastValidPosition.copy(this.object.position); //save position to "go back inside"

    
    if (this.hopCounter <= 0) {
      this.updateHop();
    } else {
      const dir = new THREE.Vector3(
        this.hopTargetPosition.x - this.object.position.x,
        this.hopTargetPosition.y - this.object.position.y,
        this.hopTargetPosition.z - this.object.position.z
      );

      if (dir.lengthSq() > 1) {
        dir.normalize();

        this.object.quaternion.slerp(this.hopNewRotation, deltaTime);
        let newPosition = this.object.position.add(dir.multiplyScalar(this.movementSpeed));

        // Check if the new position is inside the island
        const islandBoundingBox = new THREE.Box3().setFromObject(this.island.island);
        islandBoundingBox.expandByScalar(-10) //buffer zone not working?
        if (islandBoundingBox.containsPoint(newPosition)) {
          this.object.position.copy(newPosition);
          this.collider.position.copy(newPosition);
        }
      }
    }

    this.hopCounter -= deltaTime;
  } else {
    // The guinea pig is outside the island
    //console.log("outside");
    
    // Move the guinea pig back to the last valid position inside the island
    this.object.position.copy(this.lastValidPosition);
    this.collider.position.copy(this.lastValidPosition);
    this.hopCounter = 0;
  }
}

  updateHop() {
    this.hopTargetPosition = new THREE.Vector3(THREE.MathUtils.randFloat(-100, 100), 0, THREE.MathUtils.randFloat(-100, 100))
    this.hopCounter = THREE.MathUtils.randFloat(10, 15)
    const oldRotation = (new THREE.Quaternion()).copy(this.object.quaternion)
    this.object.lookAt(this.hopTargetPosition)
    this.hopNewRotation.copy(this.object.quaternion)
    this.object.setRotationFromQuaternion(oldRotation)
  }

  loadModel(){
    const loader = new GLTFLoader()
    loader.load('./assets/3d/bunny.glb', (gltf) => {

      gltf.scene.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;

            child.receiveShadow = true;
        }
      });

      this.object = gltf.scene
      this.object.scale.set(0.5, 0.5, 0.5)
      this.scene.add(this.object)
      this.isLoaded = true
    })
  }


  boundarybox() {
    //console.log(this.island.island)

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
    }

    //console.log(islandSphere)
  }

  /*
    if(this.island.island) {
      console.log("loaded:"+this.island.island)
    }
    if (this.guineaPig) {
      console.log("loaded:"+this.guineaPig)

    } 

    if(this.island.island && this.guineaPig) {
      console.log("Loaded")
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
        console.log("inside")
      } else {
        console.log("outside")
      }
  
    } else {
      console.log("Not loaded yet")
    }
  
   
  */
  

}

export { GuineaPig }
