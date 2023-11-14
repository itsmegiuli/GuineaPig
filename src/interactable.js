import * as THREE from 'three'
import * as CSS2DRenderer from 'CSS2DRenderer'

class Interactable{
  static ACTIVE_COLOR = 0xffffaa
  static ACTIVE_OPACITY = 0.15
  static SELECTED_COLOR = 0xccccff
  static SELECTED_OPACITY = 0.5

  constructor(interactables, scene, geometry, position){
    //Flags & References
    this.isActive = false
    this.isSelected = false
    this.isDisabled = false // This is checked by the interactor
    this.scene = scene
    this.interactables = interactables

    //Trigger
    this.collider = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xffffaa, transparent: true, opacity: 0.15, visible: false}));
    this.collider.position.copy(position)
    this.collider.name = "Collider"
    this.scene.add( this.collider );
    this.interactables.push(this)

    //Label
    this.interactDiv = document.createElement( 'div' );
    this.interactDiv.className = 'label';
    this.interactDiv.textContent = 'Press F to interact';
    this.interactDiv.style.fontSize = "xx-large"
    this.interactDiv.style.color = "black"
    this.interactDiv.style.backgroundColor = 'transparent';
    this.interactDiv.style.textShadow = "-1px 0 white, 0 1px white, 1px 0 white, 0 -1px white"
    this.interactLabel = new CSS2DRenderer.CSS2DObject( this.interactDiv );
    this.interactLabel.position.copy(this.collider.position).add(new THREE.Vector3(0, 2, 0))
    this.interactLabel.center.set( 0.5, 0.5 );
    this.interactLabel.visible = false
    this.scene.add(this.interactLabel)
    this.collider.attach(this.interactLabel)
  }

  /**
   * Removes collider from scene and interactable from list. Make sure there are no other references so gc can take over.
   */
  dispose() {
    this.scene.remove(this.interactLabel)
    this.scene.remove(this.collider)
    const index = this.interactables.indexOf(this)
    this.interactables.splice(index, 1)
  }

  /**
   * Flags this interactable object as disabled. Interactor ignores disabled interactables.
   */
  disable(disable) {
    if (disable) {
      this.isDisabled = true
      this.collider.material.visible = false
      this.onDeselected()
      this.onDeactivate()
    }
    //enable
    else {
      this.isDisabled = false
    }


  }

  /**
   * Is called when interactable object is in range, but not yet targeted.
   */
  onActivate() {
    if(this.isActive)
      return

    this.isActive = true

    this.collider.material.visible = true
    this.collider.material.opacity = Interactable.ACTIVE_OPACITY
    this.collider.material.color.setHex(Interactable.ACTIVE_COLOR)
  }

  /**
   * Is called when interactable object is out of range.
   */
  onDeactivate() {
    if (!this.isActive)
      return

    this.isActive = false

    this.collider.material.visible = false
  }

  /**
   * Is called when interactable object is in range and targeted.
   */
  onSelected() {
    if (this.isSelected)
      return

    this.isSelected = true

    this.interactLabel.visible = true
    this.collider.material.visible = true
    this.collider.material.opacity = Interactable.SELECTED_OPACITY
    this.collider.material.color.setHex(Interactable.SELECTED_COLOR)
  }

  /**
   * Is called when interactable object in in range and no longer targeted.
   */
  onDeselected() {
    if (!this.isSelected)
      return

    this.isSelected = false

    this.interactLabel.visible = false
    this.collider.material.opacity = Interactable.ACTIVE_OPACITY
    this.collider.material.color.setHex(Interactable.ACTIVE_COLOR)
  }

  /**
   * Is called when interactable object is triggered
   * @param interactor The interactor that triggered this event
   */
  onInteract(interactor) { }
}

export { Interactable }

