import Object = require("./Object");
import Color = require("./Color");

class Light extends Object {

  power: number;
  color: Color;

  constructor (power: number = 5, color: Color = new Color(255, 0, 0)) {
    super();
    this.power = power;
    this.color = color;
  }

}

export = Light;