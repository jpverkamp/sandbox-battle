var tiles = new Tiles();
var controls = new Controls();

var MS_PER_GAME = 60 * 1000;
var startTime = new Date().getTime();
var running = true;

$(function() {
  controls.run();
});

function tick() {
  var soFar = new Date().getTime() - startTime;
  var remainingSec = Math.floor((MS_PER_GAME - soFar) / 1000);

  if (remainingSec > 0) {
    $('#tiles #countdown').text(remainingSec + ' sec remaining');
  } else {
    stop();
  }

  if (running) {
    setTimeout(tick, 1000/30);
  }
}

function run() {
  tiles.run();
  controls.run();

  startTime = new Date().getTime();
  running = true;
  tick();

  return false;
}

function stop() {
  tiles.stop();
  controls.stop();

  startTime = new Date().getTime() - MS_PER_GAME;
  running = false;
  $('#tiles #countdown').text('game over');

  return false;
}
