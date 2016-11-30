class Point {
  x: number;
  y: number;
  z: number;
  constructor (x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  }
}

export = Point;