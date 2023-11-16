import * as THREE from 'three'


import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as CSS2DRenderer from 'CSS2DRenderer'
import { Grabable } from './grabable.js'
import { Pommes } from './pommes.js'

class GuineaPig extends Grabable{

  constructor(interactables, scene, island){
    super(interactables, scene, new THREE.Vector3())

    this.interactDiv.textContent = ""
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
    this.onDeathRotation = new THREE.Quaternion();
    this.isDead = false;
    this.satiety = 40;
    this.initialScale = new THREE.Vector3();
    this.sfx

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
    this.collider.remove(this.infoLabel)
    this.scene.remove(this.infoLabel)
    super.dispose()
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

  onDeath() {
    this.isDead = true
    const forward = new THREE.Vector3()
    this.object.getWorldDirection(forward)
    this.onDeathRotation.setFromAxisAngle(forward, Math.PI / 2)
  }

  onExplode() {
    this.createExplosion('rgb(30,0,0)')
    this.onDeath()
    this.dispose()
  }
  
  update(deltaTime){
    //console.log(this.island)
    if (!this.isLoaded || !this.island.island) {
      return
    }

    if (this.sfx != undefined) {
      this.updateSFX()
    }

    if (this.isDead) {
      this.object.quaternion.copy(this.onDeathRotation)
      return
    }

    this.updateSatiety(deltaTime)
    this.updateMovement(deltaTime)
  }

  updateSatiety(deltaTime) {
    this.satiety = Math.max(0, this.satiety - (deltaTime / 4))
    const newScale = new THREE.Vector3().copy(this.initialScale)
    this.object.scale.copy(newScale.multiplyScalar(Math.max(0.9, this.satiety * 0.015)))
    
    if (this.isActive) {
      if (this.satiety > 100) {
        this.onExplode()
      }
      else if (this.satiety >= 80) {
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
        this.onDeath()
      }
    }
  }

  updateMovement(deltaTime) {
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
      this.initialScale.copy(this.object.scale);
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

  createExplosion(colorAsString) {
    const geometry = new THREE.BufferGeometry();
    const particleCount = 500;
  
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
  
    const texture = new THREE.TextureLoader().load('assets/2d/smokeparticle.png');
    const material = new THREE.PointsMaterial({
      size: 4,
      map: texture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      color: colorAsString
    });
  
    for (let i = 0; i < particleCount; i++) {
      const x = THREE.MathUtils.randInt(this.object.position.x - 1, this.object.position.x + 1);
      const y = THREE.MathUtils.randInt(0, 2);
      const z = THREE.MathUtils.randInt(this.object.position.z - 1, this.object.position.z + 2);
  
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
  
      velocities[i * 3] = THREE.MathUtils.randFloat(0.0, 0.1) * Math.sign(positions[i]);
      velocities[i * 3 + 1] = THREE.MathUtils.randFloat(0.01, 0.1);
      velocities[i * 3 + 2] = THREE.MathUtils.randFloat(0.0, 0.1) * Math.sign(positions[i + 2]);
  
    }
  
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
  
    this.sfx = new THREE.Points(geometry, material);
    this.scene.add(this.sfx);

    setTimeout(() => {
      //ProcessingText = 'E';
      //interactDiv.textContent = ProcessingText;
      this.scene.remove(this.sfx);
      this.sfx = undefined;
      this.disable(false)
    }, 6000);
  }
  
  updateSFX() {
    const positions = this.sfx.geometry.attributes.position.array;
    const velocities = this.sfx.geometry.attributes.velocity.array;
  
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += velocities[i];
      positions[i + 1] += velocities[i + 1];
      positions[i + 2] += velocities[i + 2]
  
      //if (positions[i + 1] >= 100) positions[i + 1] = 0;
    }
  
    this.sfx.geometry.attributes.position.needsUpdate = true;
  }
}

export { GuineaPig }
