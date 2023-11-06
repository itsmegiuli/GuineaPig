import * as THREE from 'three'
import { GuineaPig } from './guineaPig.js'
import { Island } from './island.js'


let scene
let camera
let renderer
let directionalLight

let guineaPig
let island


// const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

init()
animate()

function onPointerMove( event ) {
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1
  //console.log(event.clientX, event.clientY, pointer.x, pointer.y)
  //deselectAll()
  //raycast(true)
}
function onPointerDown( event ) {
  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1
  //raycast(false)
}

window.addEventListener( 'pointermove', onPointerMove )
window.addEventListener( 'pointerdown', onPointerDown )




window.addEventListener("resize", onWindowResize)

document.addEventListener('keydown',(event) => {
  const key = event.key
  if(key == 'w'){
    guineaPig.accelerate()
  }else if(key == 'a'){
    guineaPig.steerLeft()
  }else if(key == 's'){
    guineaPig.reverse()
  }else if(key == 'd'){
    guineaPig.steerRight()
  } 
})

document.addEventListener('keyup',(event) => {
  const key = event.key
  if(key == 'w'){
    guineaPig.deccelerate()
  }else if(key == 'a'){
    guineaPig.releaseSteer()
  }else if(key == 's'){
    guineaPig.deccelerate()
  }else if(key == 'd'){
    guineaPig.releaseSteer()
  } 
})




function onWindowResize(event){
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize( window.innerWidth, window.innerHeight )
}

function init(){

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100000 )

  renderer = new THREE.WebGLRenderer()
  renderer.setSize( window.innerWidth, window.innerHeight )
  document.body.appendChild( renderer.domElement )

  //const light = new THREE.HemisphereLight( 0xffff00, 0x0000ff, 0.1 );
  //scene.add( light );

  // Makes dark spots brighter
  const light = new THREE.AmbientLight( 0x707070 );
  scene.add( light );

  // Directional light adjusted to skybox sun
  directionalLight = new THREE.DirectionalLight( 0xffffff, 2.5 );
  directionalLight.position.set(5, 20, 10)
  scene.add( directionalLight )

  ///////////////////////////////////

  guineaPig = new GuineaPig(scene)

  camera.position.z = 15
  camera.position.y = 7
  camera.position.x = -10

  ///////////////////////////////////

  // Loads island + skybox
  island = new Island(scene)
  
   /*
  // Create floor plane
  const floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
  const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xf2be8e, side: THREE.DoubleSide });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = Math.PI / 2; // Rotate the floor 90 degrees

  // Add the floor to the scene
  floor.position.set(0,-1,0)
  scene.add(floor);*/

}


function animate() {
	requestAnimationFrame( animate )



	renderer.render( scene, camera )

   if(guineaPig.isLoaded){
     camera.lookAt(guineaPig.guineaPig.position)
     guineaPig.animate()
   }
  directionalLight.position.x += 0.02

}


