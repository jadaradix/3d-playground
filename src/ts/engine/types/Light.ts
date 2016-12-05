import Object = require("./Object");
import Color = require("./Color");

class Light extends Object {

  power: number;
  color: Color;

  constructor (color: Color = new Color(255, 0, 0), power: number = 1) {
    super();
    this.color = color;
    this.power = power;
  }

}

export = Light;