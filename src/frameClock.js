class FrameClock{

  constructor(){
    this.lastTime = (new Date()).getTime(),
    this.currentTime = 0,
    this.deltaTime = 0;
  }

  update() {
    this.currentTime = (new Date()).getTime();
    this.deltaTime = (this.currentTime - this.lastTime) / 1000;
    this.lastTime = this.currentTime;
  }
}

export { FrameClock }

