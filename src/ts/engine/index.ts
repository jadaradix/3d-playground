///<reference path="./three.d.ts"/>
import THREE = require("three");

import Space = require("./types/Space");
import Point = require("./types/Point");
import Light = require("./types/Light");
import Camera = require("./types/Camera");
import Colors from "./sets/Colors";

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
    lights?: Array<THREE.PointLight>,
    renderCallback?: Function
  };

  Colors: Colors;
  spaces: Array<Space> = [];
  currentSpace: Space;
  camera: Camera;

  constructor (stereoEffect: boolean = false) {
    this.Colors = new Colors();
    this.internals = {};
    // renderCallback
    this.internals.renderCallback = () => {};
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
    this.camera = new Camera();
    this.camera.setPoint(0, 15, 0);
    // scene
    this.internals.scene = new THREE.Scene();
    // camera
    this.internals.camera = new THREE.PerspectiveCamera(90, this.internals.width / this.internals.height, 0.001, 700);
    this.internals.camera.aspect = this.internals.width / this.internals.height;
    this.internals.scene.add(this.internals.camera);
    // lights
    this.internals.lights = [];
    space.lights.forEach((light: Light) => {
      const threeLight = new THREE.PointLight(0x999999, 8, 100);
      this.internals.lights.push(threeLight);
      this.internals.scene.add(threeLight);
    });
    //etc
    var floorTexture = this.internals.textureLoader.load('images/texture.jpg');
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat = new THREE.Vector2(50, 50);
    floorTexture.anisotropy = this.internals.renderer.getMaxAnisotropy();
    var floorMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        specular: 0xffffff,
        shininess: 20,
        shading: THREE.FlatShading,
        map: floorTexture
    });
    var geometry = new THREE.PlaneBufferGeometry(1000, 1000);
    var floor = new THREE.Mesh(geometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    this.internals.scene.add(floor);
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
      this.internals.camera.position.set(this.camera.point.x, this.camera.point.y, this.camera.point.z);
      if (this.internals.camera.parent === null) this.internals.camera.updateMatrixWorld(false);
      this.internals.stereoCamera.update(this.internals.camera);
      this.currentSpace.lights.forEach((light: Light, lightIndex: number) => {
        const point = light.getPoint();
        this.internals.lights[lightIndex].position.set(point.x, point.y, point.z);
      });
      renderer.render(scene, this.internals.camera);
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
      this.internals.renderCallback();
      this.resize();
    }.bind(this))(this.internals.renderer, this.internals.scene);
    window.requestAnimationFrame(this.render.bind(this));
  }

}

export = Engine;