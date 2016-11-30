import Point = require("./Point");

function construct(constructor, args) {
  function F(): void {
    return constructor.apply(this, args);
  }
  F.prototype = constructor.prototype;
  return new F();
}

class Object  {

  point: Point;

  constructor (point: Point = new Point(0, 0, 0)) {
    this.point = point;
  }

  setPoint (x: number, y:number, z: number) {
    this.point = construct(Point, arguments);
  }

  getPoint (): Point {
    return this.point;
  }

  moveForward () {
    // forwards
    this.point.z -= 0.05;
    // down
    this.point.y -= 0.005;
  }

}

export = Object;