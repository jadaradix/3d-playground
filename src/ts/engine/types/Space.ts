import Object = require("./Object");
import Light = require("./Light");

class Space extends Object {

  lights: Array<Light> = [];

  addLight (): Light {
    let light = new Light();
    this.lights.push(light);
    return light;
  }

}

export = Space;