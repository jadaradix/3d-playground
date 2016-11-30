import Engine = require("./engine");

// left/right
// depth
// height

let cameraPan = 0;
let cameraZoom = 20;

window.onload = () => {

  const game = new Engine(true);

  // space
  let space = game.addSpace();

  // camera
  game.camera.setPoint(cameraPan, 0, cameraZoom);

  // light
  window["light"] = space.addLight();
  window["light"].setPoint(0, 5, 0);

  // floor
  window["floor"] = space.addShape();
  window["floor"].setPoint(0, 0, 0);
  window["floor"].setSize(5, 5);

  // wall LEFT
  window["wall"] = space.addShape();
  window["wall"].setPoint(-2.5, 0, 2.5);
  window["wall"].setSize(5, 5);
  window["wall"].setRotation(0, 90, 0);

  // wall RIGHT
  window["wall2"] = space.addShape();
  window["wall2"].setPoint(2.5, 0, 2.5);
  window["wall2"].setSize(5, 5);
  window["wall2"].setRotation(0, 270, 0);

  // wall CEILING
  window["wall3"] = space.addShape();
  window["wall3"].setPoint(0, 2.5, 2.5);
  window["wall3"].setSize(5, 5);
  window["wall3"].setRotation(90, 0, 0);

  // wall FLOOR
  window["wall3"] = space.addShape();
  window["wall3"].setPoint(0, -2.5, 2.5);
  window["wall3"].setSize(5, 5);
  window["wall3"].setRotation(270, 0, 0);

  game.setRenderCallback(() => {
    // cameraPan += 0.01;
    // cameraZoom -= 0.01;
    game.camera.setPoint(cameraPan, 0, cameraZoom);
    // game.camera.setVelocity(0, 0.005, 0.05);
  });

  game.start(document.getElementById("here"));

  setInterval(() => {
    cameraPan = 0;
    cameraZoom = 20;
    game.goToSpace(space);
  }, 10 * 1000);

};
