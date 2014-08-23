var tiles = new Tiles();
var controls = new Controls();

$(function() {
  controls.run();
});

function run() {
  tiles.run();
  controls.run();
  return false;
}

function stop() {
  tiles.stop();
  controls.stop();
  return false;
}
