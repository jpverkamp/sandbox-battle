var tiles = new Tiles();
var controls = new Controls();

var frames = 0;
var MS_PER_GAME = 60 * 1000;
var startTime = new Date().getTime();

var running = false;
var scoring = false;

$(function() {
  controls.init();
});

function tick() {
  frames += 1;

  var soFar = new Date().getTime() - startTime;
  var remainingSec = Math.floor((MS_PER_GAME - soFar) / 1000);

  if (running && remainingSec > 0) {

    $('#countdown').text(remainingSec + ' sec remaining');
    $('#debug').text(
      frames + ' frames in ' +
      soFar + ' seconds, ' +
      (frames / Math.floor(soFar / 1000)) + ' fps'
    );

    tiles.tick(scoring);
    controls.tick();

  } else if (scoring) {

    scoring = tiles.tick(scoring);

  } else {

    stop();

  }

  if (running || scoring) {
    setTimeout(tick, 1000/60);
  }
}

function run() {
  tiles.init();
  controls.init();

  frames = 0;
  startTime = new Date().getTime();
  running = true;
  scoring = false;

  tick();

  return false;
}

function stop() {
  tiles.stop();
  controls.stop();

  startTime = new Date().getTime() - MS_PER_GAME;
  running = false;
  scoring = true;
  $('#countdown').text('game over');

  return false;
}
