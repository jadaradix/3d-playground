import Object = require("./Object");
import Light = require("./Light");
import Shape = require("./Shape");

class Space extends Object {

  lights: Array<Light> = [];
  shapes: Array <Shape> = [];

  addLight (): Light {
    let light = new Light();
    this.lights.push(light);
    return light;
  }

  addShape (): Shape {
    let shape = new Shape();
    this.shapes.push(shape);
    return shape;
  }

}

export = Space;