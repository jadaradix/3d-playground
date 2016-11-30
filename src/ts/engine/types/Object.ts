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
  // setPoint (x: number, y: number, z: number);
  // setPoint (point: Point);
  // setPoint (pointOrX: Point | number, y?: number, z?: number) {
  //   // if (pointOrX instanceof Point) {
  //   //   this.point = pointOrX;
  //   // } else if (typeof pointOrX === "number") {
  //   //   this.point = Function.prototype.bind.apply(Point, arguments);
  //   // } else {
  //   //   throw new Error("setPoint called with invalid argument set");
  //   // }
  // }

  getPoint (): Point {
    return this.point;
  }

}

export = Object;