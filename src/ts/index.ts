import Engine = require("./engine");

window.onload = () => {

  const game = new Engine();

  let space = game.addSpace();
  let light = space.addLight();
  light.setPoint(0, 15, 0);

  game.setRenderCallback(() => {
    game.camera.moveForward();
  });

  game.start(document.getElementById("here"));

  setInterval(() => {
    game.goToSpace(space);
  }, 10000);

};
