import * as THREE from 'three'
import { GuineaPig } from './guineaPig.js'
import { Island } from './island.js'

import * as CSS2DRenderer from 'CSS2DRenderer'

import { Player } from './player.js'
import { RawFood } from './rawFood.js'

let scene
let camera
let renderer
let labelRenderer
let directionalLight
let interactDiv
let interactLabel
let interactedObject
let iterator = -1

let island
let guineaPig = {}
let player
let interactIsActive = false
let rawFood = undefined

const positionScreenSpace = new THREE.Vector3();
const threshold = 0.2;
const interactables = [];
const immovables = [];

const object = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
const cauldron = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
const crops = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));

init()
//animate() 



window.addEventListener("resize", (event) => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize( window.innerWidth, window.innerHeight )
  labelRenderer.setSize( window.innerWidth, window.innerHeight )
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
  if (interactIsActive) {
    if(key == 'e'){
      switch(interactedObject){
        case guineaPig.guineaPig:
          console.log("e");
          guineaPig.nameLabel.visible = true;
          setTimeout(function(){guineaPig.nameLabel.visible = false}, 5000);
          break;
        case crops:
          if(player.heldItem == null){
          rawFood = new RawFood(scene, OnLoadRawMeatLoaded);
          }
          break;
      }
    }
  }
    if(key == 'f'){
      if(player.heldItem != null){
        if(rawFood != undefined){
          var isMember = false;
          for(var i = 0; i <interactables.length;i++){
            if(interactables[i] == rawFood.rawFood){
              isMember = true;
              break;
            }
          }
          if(isMember == false && player.heldItem == rawFood.rawFood){
            interactables.push(rawFood.rawFood);
          }
        }
        player.heldItem.position.y = player.heldItemData[0];
        player.heldItem.rotation.copy(player.heldItemData[1]);
        player.heldItem = null
        
      } 
      else{
        if (interactIsActive){
          var isMovable = true;
          for(var i = 0; i< immovables.length; i++){
            if(interactables[iterator] == immovables[i]){
              isMovable = false;
            }
          }
          if(isMovable){
            console.log("rotation",interactables[iterator].rotation);
            player.heldItem = interactables[iterator];
            player.heldItemData = [interactables[iterator].position.y, new THREE.Euler(interactables[iterator].rotation.x,interactables[iterator].rotation.y,interactables[iterator].rotation.z)];
            camera.lookAt(interactedObject.position);
          }
        }
      }
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

  island = new Island(scene/*,OnLoadIslandLoaded*/)
  console.log("island")
  guineaPig = new GuineaPig(scene, island, OnLoadGuineaPigLoaded)
  
  camera.position.z = 15
  camera.position.y = 7
  camera.position.x = -10

  ///////////////////////////////////
  //Player
  player = new Player(camera)
  ///////////////////////////////////
  
  labelRenderer = new CSS2DRenderer.CSS2DRenderer();
  labelRenderer.setSize( window.innerWidth, window.innerHeight );
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  document.body.appendChild( labelRenderer.domElement );

  ///////////////////////////////////
  
  interactDiv = document.createElement( 'div' );
  interactDiv.className = 'label';
  interactDiv.textContent = 'E';
  interactDiv.style.backgroundColor = 'transparent';

  interactLabel = new CSS2DRenderer.CSS2DObject( interactDiv );
  interactLabel.position.set( 0, 3, 0 );
  interactLabel.center.set( 0.5, 0.5 );

  ///////////////////////////////////
  //Cauldron
  scene.add(cauldron);
  interactables.push(cauldron);
  immovables.push(cauldron);
  cauldron.position.set(-21.45, 3.6, -32.5);
  cauldron.scale.set(4,3,4);
  cauldron.name = "cauldron";
  cauldron.visible = false;

  ///////////////////////////////////
  //crops
  crops.position.set(7.4 , 5, -4.5);
  crops.scale.set(20, 7, 8);
  scene.add(crops); 
  interactables.push(crops);
  immovables.push(crops);
  crops.name = "crops";
  crops.visible = false;

}

function OnLoadRawMeatLoaded(obj){
  rawFood.position = [0,0,0];
  player.heldItem = rawFood.rawFood;
  player.heldItemData = [0.5,new THREE.Euler(0,0,0)];
  camera.lookAt(rawFood.rawFood.position);
  /*var meatName = "rawFood";
  eval('var ' + meatName + rawFoods.length + ' = new RawFood(scene);');
  eval(meatName + rawFoods.length + '.push(interactables);');
  eval(meatName + rawFoods.length + '.push(rawMeats);');
  eval('player.heldItem = '+ meatName + rawFoods.length);*/

}

function OnLoadGuineaPigLoaded (obj){
  //Nametag
  guineaPig.nameDiv = document.createElement( 'div' );
  guineaPig.nameDiv.className = 'label';
  guineaPig.nameDiv.textContent = 'guineapig';
  guineaPig.nameDiv.style.backgroundColor = 'transparent';

  guineaPig.nameLabel = new CSS2DRenderer.CSS2DObject( guineaPig.nameDiv );
  guineaPig.nameLabel.position.set( 0, 6, 0 );
  guineaPig.nameLabel.center.set( 0.5, 0.5 );
  guineaPig.nameLabel.visible = false;

  console.log(guineaPig,  guineaPig.guineaPig);
  guineaPig.addLabel( guineaPig.nameLabel );

  interactables.push(guineaPig.guineaPig);
  console.log("guineapig", guineaPig)
  
  scene.add(object); 
  interactables.push(object);
  object.position.set(-1, 3, -5);
  animate()
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

  intercept()

  if(player.heldItem != null){
    player.itemPickup();
  }
}

function intercept(){
  for(var i = 0; i< interactables.length; i++){
    positionScreenSpace.copy(interactables[i].position).project(camera);
    positionScreenSpace.setZ(0);
    if(positionScreenSpace.length() < threshold && camera.position.distanceTo(interactables[i].position) < 10){
      if(interactLabel.parent != interactables[i]){
        interactables[i].add(interactLabel);
      }
      interactLabel.visible = true;
      interactIsActive = true;
      interactedObject =interactables[i];
      iterator = i; 
    }
    else {
      if(interactLabel.parent == interactables[i] && (positionScreenSpace.length() > threshold || camera.position.distanceTo(interactables[i].position) > 10)){
        interactLabel.visible = false;
      }
      if (interactIsActive && i == iterator) {
        interactIsActive = false;
      }
    }
    //console.log("interactIsActive", interactIsActive);
  }
}