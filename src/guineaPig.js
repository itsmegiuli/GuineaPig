import * as THREE from 'three'


import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as CSS2DRenderer from 'CSS2DRenderer'
import { Grabable } from './grabable.js'

class GuineaPig extends Grabable{

  constructor(interactables, scene, island){
    super(interactables, scene, new THREE.Vector3())

    this.isLoaded = false
    //this.guineaPig
    this.scene = scene
    this.nameDiv = null
    this.nameLabel = null
    this.movementSpeed = 0.1
    this.hopTargetPosition = new THREE.Vector3()
    this.hopCounter = 0
    this.hopNewRotation = new THREE.Quaternion()
    this.loadGuineaPig()
    this.island = island
    this.raycaster = new THREE.Raycaster();
    this.lastValidPosition = new THREE.Vector3();


    

  }
  
  update(deltaTime){
    console.log(this.island)


    if (!this.isLoaded || !this.island.island) {
      return
    }

  const raycaster = new THREE.Raycaster(this.object.position, new THREE.Vector3(0, -1, 0));
  const intersects = raycaster.intersectObject(this.island.island);

  if (intersects.length > 0) { //inside the island
    console.log("inside")

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
    console.log("outside");
    
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


  addLabel (label) {
    this.object.add(label);
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

      this.object = gltf.scene
      this.object.scale.set(0.5, 0.5, 0.5)
      this.scene.add(this.object)
      this.isLoaded = true
    })
  }


  boundarybox() {

    console.log(this.island.island)

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




  
      

      


      console.log(islandSphere)
  
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

