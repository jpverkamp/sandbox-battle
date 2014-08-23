function Tiles() {
  var running = false;
  var allData = {};
  var ordering = [];

  // Assign an index to each canvas so we can order them
  $('canvas').each(function(index, canvas) {
     $(canvas).attr('data-index', index);
  });

  // Keep a list of the current z-ordering of the canvases
  $('canvas').each(function(i) { ordering.push(i); });

  // Make them draggable, on drag udate the index
  $('canvas').draggable({
      stack: '*',
      drag: function(event, ui) {

      },
      stop: function(event, ui) {
          var i = parseInt($(event.target).attr('data-index'));
          var index = ordering.indexOf(i);
          ordering.splice(index, 1);
          ordering.unshift(i);
      }
  });

  // Make a 2D array initialized all to a given valu
  var make2DArray = function(width, height, def) {
      var array = new Array(width);
      for (var x = 0; x < width; x++) {
          array[x] = new Array(height);
          for (var y = 0; y < height; y++) {
              array[x][y] = def;
          }
      }
      return array;
  }

  // Update the given grid
  var update = function(data, buffer, width, height) {
      // Clear the buffer
      for (var x = 0; x < width; x++) {
          for (var y = 0; y < height; y++) {
              buffer[x][y] = 0;
          }
      }

      // Update the buffer with falling cells
      var r = 0, xt = 0, yt = 0;
      for (var y = height - 1; y >= 0; y--) {
          for (var x = 0; x < width; x++) {
              // Skip empty cells
              if (data[x][y] == 0) continue;
              xt = x;
              yt = y;

              // Determine which way it's going to fall
              r = Math.random();
              if (r < 0.5) { // Straight down
                  if (y > 0 && buffer[x][y - 1] == 0) { xt = x; yt = y - 1; }
              } else if (r < 0.7) { // Down left
                  if (x > 0 && y > 0 && buffer[x - 1][y - 1] == 0) { xt = x - 1; yt = y - 1; }
              } else if (r < 0.9) { // Down right
                  if (x < width - 1 && y > 1 && buffer[x + 1][y - 1] == 0) { xt = x + 1; yt = y - 1; }
              } else if (r < 0.95) { // Straight left
                  if (x > 0 && buffer[x - 1][y] == 0) { xt = x - 1; yt = y; }
              } else { // Straight right
                  if (x < width - 1 && buffer[x + 1][y] == 0) { xt = x + 1; yt = y; }
              }

              if (data[xt][yt] != 0) { xt = x; yt = y; }

              // Update the buffer
              buffer[xt][yt] = data[x][y];
          }
      }
  }

  // Animate a given frame
  var animate = function(frameIndex, frame) {
      var start = new Date().getTime();

      var frame_ctx = frame.getContext('2d');
      frame_ctx.imageSmoothingEnabled = false;

      var width = frame.width;
      var height = frame.height;

      var data = make2DArray(width, height, 0);
      var buffer = make2DArray(width, height, 0);
      var temp;
      var i = 0, r = 0, g = 0, b = 0, a = 0;

      allData[frameIndex] = data;
      var imageData = frame_ctx.createImageData(width, height);

      var tick = function() {
          // Debug: For add a pixel
          data[width / 2][height - 1] = frameIndex + 1;

          // Update from data to buffer; swap the arrays for the next iteration
          update(data, buffer, width, height);
          temp = data;
          data = buffer;
          buffer = temp;

          // Detect overlapping buffers, if so swap randomly
          $('canvas').each(function(otherIndex, other) {
              // If we're comparing to ourself, we'll always overlap, skip
              if (frame == other) return;

              // If the two canvases don't overlap, don't look at them
              var frameBounds = frame.getBoundingClientRect();
              var otherBounds = other.getBoundingClientRect();
              if (frameBounds.right < otherBounds.left ||
                  frameBounds.left > otherBounds.right ||
                  frameBounds.bottom < otherBounds.top ||
                  frameBounds.top > otherBounds.bottom) {
                  return;
              }

              // We only want this once, so give priority to whichever frame is 'lower' on the screen
              if (frameBounds.top < otherBounds.top) return;

              // TODO: Find the actual offset rather than looping over an entire image
              var otherX, otherY, temp;
              for (var frameY = 0; frameY < height; frameY++) {
                  for (var frameX = 0; frameX < width; frameX++) {
                      otherX = Math.floor(frameBounds.left - otherBounds.left + frameX);
                      otherY = Math.floor(otherBounds.top - frameBounds.top + frameY);

                      if (0 <= otherX && otherX < width && 0 <= otherY && otherY < height) {
                          if (allData[frameIndex][frameX][frameY] == 0
                              /* && allData[otherIndex][otherX][otherY] != 0*/) {
                              temp = allData[frameIndex][frameX][frameY];
                              allData[frameIndex][frameX][frameY] = allData[otherIndex][otherX][otherY];
                              allData[otherIndex][otherX][otherY] = temp;
                          }
                      }
                  }
              }
          });

          // Render to the image data
          for (var y = 0; y < height; y++) {
              for (var x = 0; x < width; x++) {
                  i = x + (height - y) * width;

                  r = g = b = 0;
                  a = 255;

                  if (data[x][y] == 0) {
                      a = 0;
                  } else if (data[x][y] == 1) {
                      b = 255;
                  } else if (data[x][y] == 2) {
                      r = 255;
                  } else if (data[x][y] == 3) {
                      g = 255;
                  }

                  imageData.data[i * 4 + 0] = r;
                  imageData.data[i * 4 + 1] = g;
                  imageData.data[i * 4 + 2] = b;
                  imageData.data[i * 4 + 3] = a;
              }
          }

          // Copy back to the GUI
          frame_ctx.putImageData(imageData, 0, 0);

          if (running) {
              setTimeout(tick, 1000/60);
          }
      }
      tick();
  };

  this.run = function() {
    running = true;
    $('canvas').each(animate);
  };

  this.stop = function() {
    running = false;
  };
};
