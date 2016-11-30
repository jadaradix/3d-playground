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
  velocity: Point;
  rotation: Point;
  renderCallback: Function;

  constructor (point: Point = new Point(0, 0, 0)) {
    this.point = point;
    this.velocity = new Point(0, 0, 0);
    this.rotation = new Point(0, 0, 0);
    this.renderCallback = function () {
      this.point.x += -this.velocity.x;
      this.point.y += -this.velocity.y;
      this.point.z += -this.velocity.z;
    };
  }

  setPoint (x: number, y:number, z: number) {
    this.point = construct(Point, arguments);
  }

  setVelocity (x: number, y:number, z: number) {
    this.velocity = construct(Point, arguments);
  }

  setRotation (x: number, y:number, z: number) {
    this.rotation = construct(Point, arguments);
  }

}

export = Object;