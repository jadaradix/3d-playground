import Object = require("./Object");

class Camera extends Object {

  moveForward (): this {
    this.point.z -= 0.05; //forwards
    this.point.y -= 0.005; // down
    return this;
  }

}

export = Camera;