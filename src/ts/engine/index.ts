///<reference path="./three.d.ts"/>
import THREE = require("three");

import Space = require("./types/Space");
import Point = require("./types/Point");
import Light = require("./types/Light");
import Shape = require("./types/Shape");
import Camera = require("./types/Camera");
import Colors from "./sets/Colors";

function processObjects (objects: Array<any>, internals: Object): void {
  objects.forEach((object: any, objectIndex: number) => {
    internals[objectIndex].position.set(object.point.x, object.point.y, object.point.z);
    internals[objectIndex].rotation.set(
      THREE.Math.degToRad(object.rotation.x),
      THREE.Math.degToRad(object.rotation.y),
      THREE.Math.degToRad(object.rotation.z)
    );
    object.renderCallback();
  });
};

class HTMLCanvasElementWithFeatureDetection extends HTMLCanvasElement {
  msRequestFullscreen?(): boolean;
  mozRequestFullScreen?(): boolean;
}

class Engine {

  internals: {
    renderer?: THREE.WebGLRenderer,
    element?: HTMLCanvasElement,
    scene?: THREE.Scene,
    camera?: THREE.PerspectiveCamera,
    stereoCamera?: THREE.StereoCamera,
    textureLoader?: THREE.TextureLoader,
    width?: number,
    height?: number,
    lights?: Array<THREE.AmbientLight>,
    shapes?: Array <THREE.Mesh>,
    renderCallback?: Function
  };

  Colors: Colors;
  spaces: Array<Space> = [];
  currentSpace: Space;
  camera: Camera;
  stereoEffect: boolean;

  constructor (stereoEffect: boolean = false) {
    this.Colors = new Colors();
    this.internals = {};
    this.internals.renderCallback = () => {};
    this.stereoEffect = stereoEffect;
    this.camera = new Camera();
  }

  resize (): void {
    this.internals.width = window.innerWidth;
    this.internals.height = window.innerHeight;
    // renderer
    this.internals.renderer.setSize(this.internals.width, this.internals.height);
  }

  start (element: HTMLElement): void {
    if (this.spaces.length === 0) {
      throw new Error("You need to add a Space via addSpace");
    }
    // renderer
    this.internals.renderer = new THREE.WebGLRenderer();
    // stereoCamera
    this.internals.stereoCamera = new THREE.StereoCamera();
    this.internals.stereoCamera.aspect = 0.5;
    this.internals.stereoCamera.eyeSep = 1.0;
    // textureLoader
    this.internals.textureLoader = new THREE.TextureLoader();
    // element
    this.internals.element = this.internals.renderer.domElement;
    this.internals.element.addEventListener("click", (event) => {
      var element = event.srcElement as HTMLCanvasElementWithFeatureDetection;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      }
    }, false);
    element.appendChild(this.internals.element);
    // size (width/height)
    this.resize();
    //
    // RENDER
    //
    this.goToSpace(this.spaces[0]);
    this.render();
  }

  goToSpace (space: Space) {
    this.currentSpace = space;
    // camera
    if (!this.camera) this.camera = new Camera();
    // scene
    this.internals.scene = new THREE.Scene();
    // camera
    this.internals.camera = new THREE.PerspectiveCamera(45, this.internals.width / this.internals.height, 0.01, 10000);
    this.internals.camera.aspect = this.internals.width / this.internals.height;
    this.internals.scene.add(this.internals.camera);
    // lights
    this.internals.lights = [];
    space.lights.forEach((light: Light) => {
      const threeLight = new THREE.AmbientLight(0x999999);
      this.internals.lights.push(threeLight);
      this.internals.scene.add(threeLight);
    });
    // shapes
    this.internals.shapes = [];
    space.shapes.forEach((shape: Shape) => {
      let texture = this.internals.textureLoader.load('images/texture.jpg');
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat = new THREE.Vector2(1, 1);
      texture.anisotropy = this.internals.renderer.getMaxAnisotropy();
      let material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        specular: 0xffffff,
        shininess: 20,
        shading: THREE.FlatShading,
        map: texture
      });
      let geometry = new THREE.PlaneBufferGeometry(shape.width, shape.height);
      let threeShape = new THREE.Mesh(geometry, material);
      // threeShape.rotation.x = -Math.PI / 2;
      this.internals.shapes.push(threeShape);
      this.internals.scene.add(threeShape);
    });
  }

  addSpace (): Space {
    const space = new Space();
    this.spaces.push(space);
    return space;
  }

  setRenderCallback (f: Function): void {
    this.internals.renderCallback = f;
  }

  render (): void {
    (function (renderer, scene) {
      // positions
      processObjects(this.currentSpace.lights, this.internals.lights);
      processObjects(this.currentSpace.shapes, this.internals.shapes);
      this.internals.camera.position.set(this.camera.point.x, this.camera.point.y, this.camera.point.z);
      this.camera.renderCallback();
      if (this.internals.camera.parent === null) this.internals.camera.updateMatrixWorld(false);
      // stereo effect
      if (this.stereoEffect) {
        this.internals.stereoCamera.update(this.internals.camera);
      }
      if (this.stereoEffect) {
        const size = renderer.getSize();
        if (renderer.autoClear) renderer.clear();
        renderer.setScissorTest(true);
        renderer.setScissor(0, 0, size.width / 2, size.height);
        renderer.setViewport(0, 0, size.width / 2, size.height);
        renderer.render(scene, this.internals.stereoCamera.cameraL);
        renderer.setScissor(size.width / 2, 0, size.width / 2, size.height);
        renderer.setViewport(size.width / 2, 0, size.width / 2, size.height);
        renderer.render(scene, this.internals.stereoCamera.cameraR);
        renderer.setScissorTest(false);
      } else {
        renderer.render(scene, this.internals.camera);
      }
      this.internals.renderCallback();
      this.resize();
    }.bind(this))(this.internals.renderer, this.internals.scene);
    window.requestAnimationFrame(this.render.bind(this));
  }

}

export = Engine;