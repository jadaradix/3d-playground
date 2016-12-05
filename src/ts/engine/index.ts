///<reference path="./three.d.ts"/>
import THREE = require("three");

import Object = require("./types/Object");
import Space = require("./types/Space");
import Point = require("./types/Point");
import Light = require("./types/Light");
import Shape = require("./types/Shape");
import Camera = require("./types/Camera");
import Colors from "./sets/Colors";

function processObject (object: Object, internalObject: any) {
  internalObject.position.set(object.point.x, object.point.y, object.point.z);
  internalObject.rotation.set(
    THREE.Math.degToRad(object.rotation.x),
    THREE.Math.degToRad(object.rotation.y),
    THREE.Math.degToRad(object.rotation.z)
  );
  object.renderCallback();
}

function processObjects (objects: Array<Object>, internals: any): void {
  objects.forEach((object: Object, objectIndex: number) => {
    processObject(object, internals[objectIndex]);
  });
};

class HTMLCanvasElementWithFeatureDetection extends HTMLCanvasElement {
  msRequestFullscreen?(): boolean;
  mozRequestFullScreen?(): boolean;
}

class WindowWithFeatureDetection extends Window {
  orientation: string;
  mozOrientation?: string;
  screen: WindowScreenWithFeatureDetection;
}

class WindowScreenWithFeatureDetection extends Screen {
  orientation: string;
  mozOrientation: string;
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
    renderCallback?: Function,
    deviceOrientation?: any,
    screenOrientation?: number
  };

  Colors: Colors;
  spaces: Array<Space> = [];
  currentSpace: Space;
  camera: Camera;
  stereoEffect: boolean;
  vrCamera: boolean;

  constructor (stereoEffect: boolean = false, vrCamera: boolean = false) {
    this.Colors = new Colors();
    this.internals = {};
    this.internals.renderCallback = () => {};
    this.stereoEffect = stereoEffect;
    this.vrCamera = vrCamera;
    this.camera = new Camera();
  }

  onResize (): void {
    this.internals.width = window.innerWidth;
    this.internals.height = window.innerHeight;
    this.internals.renderer.setSize(this.internals.width, this.internals.height);
  }

  onOrientationChange (): void {
    const windowWithFeatureDetection = window as WindowWithFeatureDetection;
    this.internals.screenOrientation = (() => {
      switch (windowWithFeatureDetection.screen.orientation || windowWithFeatureDetection.screen.mozOrientation) {
        case 'landscape-primary':
          return 90;
        case 'landscape-secondary':
          return -90;
        case 'portrait-secondary':
          return 180;
        case 'portrait-primary':
          return 0;
      }
      return 0;
    })();
  }

  onDeviceOrientation (e: any): void {
    if (!e.alpha) {
      return;
    }
    this.internals.camera.rotation.reorder('YXZ');



    let movementSpeed = 1.0;
    let autoAlign = true;
    let autoForward = false;

    let alpha = 0;
    let beta = 0;
    let gamma = 0;
    let orient = 0;

    let alignQuaternion = new THREE.Quaternion();
    let orientationQuaternion = new THREE.Quaternion();

    let quaternion = new THREE.Quaternion();
    let quaternionLerp = new THREE.Quaternion();

    let tempVector3 = new THREE.Vector3();
    let tempMatrix4 = new THREE.Matrix4();
    let tempEuler = new THREE.Euler(0, 0, 0, 'YXZ');
    let tempQuaternion = new THREE.Quaternion();

    let zee = new THREE.Vector3(0, 0, 1);
    let up = new THREE.Vector3(0, 1, 0);
    let v0 = new THREE.Vector3(0, 0, 0);
    let euler = new THREE.Euler();
    let q0 = new THREE.Quaternion(); // - PI/2 around the x-axis
    let q1 = new THREE.Quaternion(- Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));


    let update = function () {

      alpha = e.gamma ?
        THREE.Math.degToRad(e.alpha) : 0; // Z
      beta = e.beta ?
        THREE.Math.degToRad(e.beta) : 0; // X'
      gamma = e.gamma ?
        THREE.Math.degToRad(e.gamma) : 0; // Y''
      orient = this.internals.screenOrientation ?
        THREE.Math.degToRad(this.internals.screenOrientation) : 0; // O

      // The angles alpha, beta and gamma
      // form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

      // 'ZXY' for the device, but 'YXZ' for us
      euler.set(beta, alpha, - gamma, 'YXZ');

      quaternion.setFromEuler(euler);
      quaternionLerp.slerp(quaternion, 0.5); // interpolate

      // orient the device
      if (autoAlign) orientationQuaternion.copy(quaternion); // interpolation breaks the auto alignment
      else orientationQuaternion.copy(quaternionLerp);

      // camera looks out the back of the device, not the top
      orientationQuaternion.multiply(q1);

      // adjust for screen orientation
      orientationQuaternion.multiply(q0.setFromAxisAngle(zee, - this.orient));

      this.internals.camera.quaternion.copy(alignQuaternion);
      this.internals.camera.quaternion.multiply(orientationQuaternion);

      if (autoForward) {
        tempVector3.applyQuaternion(this.internals.camera.quaternion)
        tempVector3
          .set(0, 0, -1)
          .applyQuaternion(this.internals.camera.quaternion)
          .setLength(movementSpeed / 50); // TODO: why 50 :S
        this.internals.camera.position.add(tempVector3);
      }

      if (autoAlign && alpha !== 0) {
        autoAlign = false;
        align();
      }

    };


    let align = function () {
      tempVector3
        .set(0, 0, -1)
        .applyQuaternion( tempQuaternion.copy(orientationQuaternion).inverse());
      tempEuler.setFromQuaternion(
        tempQuaternion.setFromRotationMatrix(
          tempMatrix4.lookAt(tempVector3, v0, up)
       )
     );
      tempEuler.set(0, tempEuler.y, 0);
      alignQuaternion.setFromEuler(tempEuler);
    };

    update();




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


    window.addEventListener('onresize', this.onResize, false);
    this.onResize();
    window.addEventListener('orientationchange', this.onOrientationChange, false);
    this.onOrientationChange();
    window.addEventListener('deviceorientation', this.onDeviceOrientation, false);


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
      const threeLight = new THREE.AmbientLight(
        new THREE.Color(`rgb(${light.color.r}, ${light.color.g}, ${light.color.b})`).getHex(),
        light.power
      );
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

  setRenderCallback (callback: Function): void {
    this.internals.renderCallback = callback;
  }

  render (): void {
    (function (renderer, scene) {
      // positions
      processObjects(this.currentSpace.lights, this.internals.lights);
      processObjects(this.currentSpace.shapes, this.internals.shapes);
      if (!this.vrCamera) {
        processObject(this.camera, this.internals.camera);
      }
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
    }.bind(this))(this.internals.renderer, this.internals.scene);
    window.requestAnimationFrame(this.render.bind(this));
  }

}

export = Engine;