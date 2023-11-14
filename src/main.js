import * as THREE from 'three'
import { GuineaPig } from './guineaPig.js'
import { Island } from './island.js'

import * as CSS2DRenderer from 'CSS2DRenderer'

import { Player } from './player.js'
import { RawFood } from './rawFood.js'
import { Pommes } from './pommes.js'
import { FrameClock } from './frameClock.js'

let scene
let camera
let renderer
let labelRenderer
let frameClock
let directionalLight
let interactDiv
let interactLabel
let interactedObject
let iterator = -1
let ProcessingText = 'e'
let smoke;
let isSmoking = false

let island
let guineaPig = {}
let player
let interactIsActive = false
let rawFood = undefined
let pommes

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
  if (interactIsActive) {
    if(key == 'e'){
      switch(interactedObject){
        case guineaPig.guineaPig:
          //console.log("e");
          guineaPig.nameLabel.visible = true;
          setTimeout(function(){guineaPig.nameLabel.visible = false}, 5000);
          break;
        case crops:
          if(player.heldItem == null){
          rawFood = new RawFood(scene, OnLoadRawMeatLoaded);
          }
          break;
        case cauldron:
          if(player.heldItem != null && player.heldItem.name == "rawFood"){
            if(interactables.indexOf(player.heldItem) != -1) interactables.splice(interactables.indexOf(player.heldItem), 1);
            scene.remove(player.heldItem);
            player.heldItem = null;
            createsmoke();
            isSmoking = true;
            ProcessingText = 'Processing...';
            interactDiv.textContent = ProcessingText;
            setTimeout(function(){
              pommes = new Pommes(scene,OnLoadPommesLoaded);
              ProcessingText = 'Completed!';
              interactDiv.textContent = ProcessingText;
            }, 5000);
            setTimeout(function(){
              ProcessingText = 'E';
              interactDiv.textContent = ProcessingText;
              scene.remove(smoke);
              smoke = undefined;
              isSmoking = false;
            }, 6000);
          }
          else{
            ProcessingText = 'You dont have the ingredients to use this!'
            setTimeout(function(){ProcessingText = 'E'}, 5000);
          }
          break;
      }
    }
  }
    if(key == 'f'){
      if(player.heldItem != null){
        if(rawFood != undefined){
          insertToInteractables(rawFood.rawFood);
        }
        if(pommes != undefined){
          insertToInteractables(pommes.pommes);
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
            player.heldItem = interactables[iterator];
            player.heldItemData = [interactables[iterator].position.y, new THREE.Euler(interactables[iterator].rotation.x,interactables[iterator].rotation.y,interactables[iterator].rotation.z)];
            camera.lookAt(interactedObject.position);
          }
        }
      }
    }
  
})
function insertToInteractables(instance){
  var isMember = false;
  for(var i = 0; i <interactables.length;i++){
    if(interactables[i] == instance){
      isMember = true;
      break;
    }
  }
  if(isMember == false && player.heldItem == instance){
    interactables.push(instance);
  }
}

function init(){

  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x000000, 0.0008);
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
  guineaPig = new GuineaPig(scene, OnLoadGuineaPigLoaded)
  
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
  interactLabel.position.set( 0, 0, 0 );
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

  ///////////////////////////////////
  //FrameClock
  frameClock = new FrameClock()

}

function OnLoadPommesLoaded(obj){
  pommes.pommes.position.set(-19, 1, -30);
  pommes.pommes.name = "pommes";
  if(player.heldItem == null){
    player.heldItem = pommes.pommes;
    player.heldItemData = [0.5,new THREE.Euler(0,0,0)];
    camera.lookAt(pommes.pommes.position);
  }
  else{
    interactables.push(pommes.pommes);
    pommes.pommes.position.y = 0.5;
    pommes.pommes.rotation.copy(new THREE.Euler(0,0,0));
  }
}

function OnLoadRawMeatLoaded(obj){
  rawFood.rawFood.position.set(0,0,0);
  rawFood.rawFood.name = "rawFood";
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
  //console.log(guineaPig,  guineaPig.guineaPig);
  guineaPig.addLabel( guineaPig.nameLabel );
  interactables.push(guineaPig.guineaPig);
  //console.log("guineapig", guineaPig)
  
  ///////////////////////////////////
  //test object
  //scene.add(object); 
  //interactables.push(object);
  //object.position.set(-1, 3, -5);
  animate()
}

function animate() {
	requestAnimationFrame( animate )
	renderer.render( scene, camera )
  labelRenderer.render( scene, camera )

  frameClock.update()
  const deltaTime = frameClock.deltaTime

  if(guineaPig.isLoaded){
    guineaPig.update(deltaTime)
  }

  if (player.isLoaded)
    player.update(deltaTime)

  intercept()
  if(isSmoking == true){
    smokeAnimation();
  } 

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
        switch(i){
          case 0:
            interactDiv.textContent = ProcessingText;
            interactLabel.position.set( 0, 0, 0 );
            break;
          case 1:
            interactDiv.textContent = 'e';
            interactLabel.position.set( 0, 0, 0 );
            break;
          case 2:
            interactLabel.position.set( 0, 3, 0 );
            interactDiv.textContent = 'e';
            break;
          default:
            interactLabel.position.set( 0, 0, 0 );
            interactDiv.textContent = 'f';
            break;
        }
        if(interactables[i].name == "pommes"){
          interactLabel.position.set( 1.8, 1, 1.8 );
        }
      }
      //console.log("ProcessingText",ProcessingText);
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

function createsmoke() {
	const geometry = new THREE.BufferGeometry();
  const particleCount = 500;

  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);

  const texture = new THREE.TextureLoader().load('http://stemkoski.github.io/Three.js/images/smokeparticle.png');
  const material = new THREE.PointsMaterial({
    size: 4,
    map: texture,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    color: 'rgb(30,30,30)'
  });

  for (let i = 0; i < particleCount; i++) {
    const x = THREE.MathUtils.randInt(-20, -22);
    const y = THREE.MathUtils.randInt(4, 6);
    const z = THREE.MathUtils.randInt(-31, -33);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    velocities[i * 3] = THREE.MathUtils.randFloat(0.0, 0.05) * Math.sign(positions[i]);
    velocities[i * 3 + 1] = THREE.MathUtils.randFloat(0.01, 0.1);
    velocities[i * 3 + 2] = THREE.MathUtils.randFloat(0.0, 0.1) * Math.sign(positions[i + 2]);

  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

  smoke = new THREE.Points(geometry, material);
  scene.add(smoke);
}

function smokeAnimation() {
	const positions = smoke.geometry.attributes.position.array;
  const velocities = smoke.geometry.attributes.velocity.array;

  for (let i = 0; i < positions.length; i += 3) {
    positions[i] += velocities[i];
    positions[i + 1] += velocities[i + 1];
    positions[i + 2] += velocities[i + 2]

    //if (positions[i + 1] >= 100) positions[i + 1] = 0;
  }

  smoke.geometry.attributes.position.needsUpdate = true;
}