var tiles = new Tiles();
var controls = new Controls();

var frames = 0;
var MS_PER_GAME = 60 * 1000;
var startTime = new Date().getTime();
var running = true;

$(function() {
  controls.init();
});

function tick() {
  frames += 1;

  var soFar = new Date().getTime() - startTime;
  var remainingSec = Math.floor((MS_PER_GAME - soFar) / 1000);

  if (remainingSec > 0) {
    $('#countdown').text(remainingSec + ' sec remaining');
    $('#debug').text(
      frames + ' frames in ' +
      soFar + ' seconds, ' +
      (frames / Math.floor(soFar / 1000)) + ' fps'
    );

    tiles.tick();
    controls.tick();

  } else {
    stop();
  }

  if (running) {
    setTimeout(tick, 1000/60);
  }
}

function run() {
  tiles.init();
  controls.init();

  frames = 0;
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
  $('#countdown').text('game over');

  return false;
}
