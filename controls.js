function Controls() {
  var keys = {};
  var running = false;
  var PER_TICK_ACCELERATION = 0.1;
  var PER_TICK_FRICTION = 0.01;
  var VELOCITY_CAP = 10;

  var vel = {};

  // Load key bindings
  var loadKeyBindings = function() {
    keys = {};

    console.log('Loading key bindings...');

    $('#controls table').each(function(i, eli) {
      var player = parseInt($(eli).attr('data-player'));

      console.log('loading controls for player ' + player);

      $(eli).find('input').each(function(j, elj) {
        var command = $(elj).attr('name');
        var key = $(elj).val();

        keys[key] = [player, command, false];
      });
    });
  };

  var onkey = function(event) {
    switch (event.keyCode) {
      case  37: key = 'LEFT'; break;
      case  38: key = 'UP'; break;
      case  39: key = 'RIGHT'; break;
      case  40: key = 'DOWN'; break;
      case  97: key = 'NUM1'; break;
      case  98: key = 'NUM2'; break;
      case  99: key = 'NUM3'; break;
      case 100: key = 'NUM4'; break;
      case 101: key = 'NUM5'; break;
      case 102: key = 'NUM6'; break;
      case 103: key = 'NUM7'; break;
      case 104: key = 'NUM8'; break;
      case 105: key = 'NUM9'; break;
      default: key = String.fromCharCode(event.keyCode).toUpperCase();
    }

    if (key in keys) {
      if (event.type == 'keydown') {
        keys[key][2] = true;
      } else if (event.type == 'keyup') {
        keys[key][2] = false;
      }
    }
  };

  var tick = function(event) {
    $.each(keys, function(i, el) {
      var player = el[0];
      var command = el[1];
      var active = el[2];

      $game = $('#tiles');
      $tile = $('#tiles *[data-player="' + player + '"]');

      if (active) {
        if (command == 'up') {
          vel[player][1] -= PER_TICK_ACCELERATION;
        } else if (command == 'down') {
          vel[player][1] += PER_TICK_ACCELERATION;
        } else if (command == 'left') {
          vel[player][0] -= PER_TICK_ACCELERATION;
        } else if (command == 'right') {
          vel[player][0] += PER_TICK_ACCELERATION;
        }
      }

      // Use friction to slow each box down over time
      // If we're close enough to zero that friction will accelerate us, just stop
      if (Math.abs(vel[player][0]) < PER_TICK_FRICTION) {
        vel[player][0] = 0;
      } else {
        vel[player][0] += (vel[player][0] > 0 ? -PER_TICK_FRICTION : PER_TICK_FRICTION);
      }

      if (Math.abs(vel[player][1]) < PER_TICK_FRICTION) {
        vel[player][1] = 0;
      } else {
        vel[player][1] += (vel[player][1] > 0 ? -PER_TICK_FRICTION : PER_TICK_FRICTION);
      }

      // Cap velcity so we don't go too fast
      vel[player][0] = Math.min(VELOCITY_CAP, Math.max(-VELOCITY_CAP, vel[player][0]));
      vel[player][1] = Math.min(VELOCITY_CAP, Math.max(-VELOCITY_CAP, vel[player][1]));

      // Update the current position based on velocity
      var left = $tile[0].offsetLeft + vel[player][0];
      var top = $tile[0].offsetTop + vel[player][1];

      // Bounce off the edges of the screen
      if (left < 0) {
        left = 0;
        vel[player][0] = Math.abs(vel[player][0]);
      } else if (left > $game.width() - $tile.width()) {
        left = $game.width() - $tile.width();
        vel[player][0] = -1 * Math.abs(vel[player][0]);
      }

      if (top < 0) {
        top = 0;
        vel[player][1] = Math.abs(vel[player][1]);
      } else if (top > $game.height() - $tile.height()) {
        top =  $game.height() - $tile.height();
        vel[player][1] = -1 * Math.abs(vel[player][1]);
      }

      // Finally, update the position
      $tile.css({'top': top, 'left': left});
    });

    if (running) {
      setTimeout(tick, 1000/30);
    }
  };

  this.run = function() {
    // Reload keybindings in case they've changed
    loadKeyBindings();

    // Initialize velocities to zero
    $game = $('#tiles');
    $('#tiles canvas').each(function(i, eli) {
      vel[i] = [0, 0];
      $(eli).css({
        top: Math.random() * ($game.height() - $(eli).height()),
        left: Math.random() * ($game.width() - $(eli).width())
      });
    });

    // Add keybindings, we can use the same function since it can check type
    $(document).unbind('keydown').bind('keydown', onkey);
    $(document).unbind('keyup').bind('keyup', onkey);

    running = true;
    tick();
  }

  this.stop = function() {
    running = false;

    $(document).unbind('keydown');
    $(document).unbind('keyup');
  }
};
