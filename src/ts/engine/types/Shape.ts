import Object = require("./Object");

class Shape extends Object {

  width: number;
  height: number;

  constructor (width: number = 1, height: number = 1) {
    super();
    this.width = width;
    this.height = height;
  }

  setSize (width: number = 1, height: number = 1) {
    this.width = width;
    this.height = height;
  }

}

export = Shape;