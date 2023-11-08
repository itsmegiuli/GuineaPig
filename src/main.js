import * as THREE from 'three'
import { GuineaPig } from './guineaPig.js'
import { Island } from './island.js'

import * as CSS2DRenderer from 'CSS2DRenderer'

import { Player } from './player.js'

let scene
let camera
let renderer
let labelRenderer
let directionalLight

let island
let guineaPig
let player

init()
animate() 

window.addEventListener("resize", (event) => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize( window.innerWidth, window.innerHeight )
})

window.addEventListener("click", async () => {
  await renderer.domElement.requestPointerLock();
});


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
  labelRenderer.setSize( window.innerWidth, window.innerHeight )
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

  island = new Island(scene)
  console.log("island")
  guineaPig = new GuineaPig(scene, island)
  console.log("guineapig")

  camera.position.z = 15
  camera.position.y = 7
  camera.position.x = -10

  ///////////////////////////////////
  //Player
  player = new Player(camera)


  labelRenderer = new CSS2DRenderer.CSS2DRenderer();
  labelRenderer.setSize( window.innerWidth, window.innerHeight );
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  document.body.appendChild( labelRenderer.domElement );


}

function animate() {
	requestAnimationFrame( animate )
	renderer.render( scene, camera )
  labelRenderer.render( scene, camera )

  if(guineaPig.isLoaded){
    guineaPig.animate()
  }

  if (player.isLoaded)
    player.animate()

}


