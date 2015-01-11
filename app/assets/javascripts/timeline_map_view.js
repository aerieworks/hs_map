(function (M, $) {
  var GRID_CELL_WIDTH = 50;
  var GRID_CELL_HEIGHT = 50;

  function toModels(objects, constructor) {
    var models = new M.Set();
    for (var i = 0; i < objects.length; i++) {
      models.add(new constructor(objects[i]));
    }
    return models;
  }

  function computeCellCorner(cellCoords) {
    return { x: cellCoords.x * GRID_CELL_WIDTH, y: cellCoords.y * GRID_CELL_HEIGHT };
  }

  function computeCellCenter(cellCoords) {
    var cellCorner = computeCellCorner(cellCoords);
    return { x: cellCorner.x + GRID_CELL_WIDTH / 2, y: cellCorner.y + GRID_CELL_HEIGHT / 2 };
  }

  function TimelineMapView(canvas) {
    this.canvas = canvas;
    this.ctx = canvas[0].getContext('2d');

    this.events = toModels(canvas.data('events'), M.models.Event);
    this.spaceTimes = toModels(canvas.data('spaceTimes'), M.models.SpaceTime);
    this.things = toModels(canvas.data('things'), M.models.Thing);
    this.timelines = toModels(canvas.data('timelines'), M.models.Timeline);
    this.timelinePoints = toModels(canvas.data('timelinePoints'), M.models.TimelinePoint);
    this.nowhere = new M.models.Thing({ id: -1, name: 'Nowhere', category: 'location' });
    this.never = new M.models.SpaceTime({ id: -1, name: 'Never' });
    this.void = new M.models.Timeline({ id: null, thing_id: -1, space_time_id: -1 });

    for (var i = 0; i < this.timelinePoints.getLength(); i++) {
      var p = this.timelinePoints.get(i);
      if (p.whenAndWhere == null) {
        this.void.contents.add(p.timeline);
      }
    }

    // Force width calculation.
    M.models.Timeline.cache.each(function (i, l) { l.getWidth(); });
    var me = this;
    this.timelines.each(function (index, line) {
      console.log(line.getName() + ': ' + line.getWidth());
      var p = line.start;
      while (p) {
        var container = p.whenAndWhere ? p.whenAndWhere.timeline.getName() : '<>';
        console.log('\t' + p.id + ' -> ' + container + ' (' + p.getRow() + ', ' + p.getColumn() + ')');
        p = p.next;
      }
    });


    this.drawGridPoints();
    this.drawTimelines(this.void, 0);
    this.drawEvents();

    this.canvas
      .bind('mousemove', { me: this }, map_mouseover)
      .bind('click', { me: this }, map_click);
  }

  TimelineMapView.prototype = {
    findClickableTarget: function findClickableTarget(ev) {
      var coords = this.toMapCoords({ x: ev.clientX, y: ev.clientY });
      for (var id in this.experiences) {
        if (!this.experiences.hasOwnProperty(id)) {
          continue;
        }
        var ex = this.experiences[id];
        if (ex.coords && getDistance(ex.coords, coords) <= 10) {
          return ex;
        }
      }

      return null;
    },

    toMapCoords: function toMapCoords(coords) {
      var bbox = this.canvas[0].getBoundingClientRect();
      return {
        x: coords.x - bbox.left * (this.canvas[0].width / bbox.width),
        y: coords.y - bbox.top * (this.canvas[0].height / bbox.height)
      };
    },

    alignPoints: function alignPoints() {
      // Determine column offsets for sublocations within locations.
      var xOffsets = {};
      var nextX = {};
      for (var i = 0; i < this.timelines.length; i++) {
        var line = this.timelines[i];
        nextX[line.id] = 0;
        for (var j = 0; j < line.contents.list.length; j++) {
          var sub = line.contents.list[j];
          if (!xOffsets[sub.id]) {
            xOffsets[sub.id] = {};
          }
          xOffsets[sub.id][line.id] = nextX[line.id];
          console.log('X Offset: ' + sub.spaceTime.name + '!' + sub.thing.name + ' < ' +
              line.spaceTime.name + '!' + line.thing.name + ': ' + nextX[line.id]);
          nextX[line.id] += sub.maxCharacterCount;
        }
      }

      // Determine nowhere contents' timeline point coordinates.
      var x = 0;
      for (var i = 0; i < this.nowhere.contents.list.length; i++) {
        var line = this.nowhere.contents.list[i];
        var p = line.start;
        while (p) {
          if (p.whenAndWhere == null) {
            p.coords.x = x;
          }
          p = p.next;
        }
        x += line.maxCharacterCount;
      }

      // Determine coordinates for remaining timeline points.
      for (var i = 0; i < this.timelinePoints.length; i++) {
        var p = this.timelinePoints[i];
        if (p.timeline.thing.category == 'location') {
          var xOffset = 0;
          var q = p;
          while (q.coords.x == null) {
            xOffset += xOffsets[q.timeline.id][q.whenAndWhere.timeline.id];
            q = q.whenAndWhere;
          }
          while (p.coords.x == null) {
            p.coords.x = q.coords.x + xOffset;
            xOffset -= xOffsets[p.timeline.id][p.whenAndWhere.timeline.id];
            p = p.whenAndWhere;
          }
        }
      }
    },

    drawTimelines: function drawTimelines(container, depth) {
      for (var i = 0; i < container.contents.getLength(); i++) {
        var line = container.contents.get(i);
        if (line.isLocation()) {
          this.drawLocation(line, depth);
        } else {
          this.drawObject(line);
        }
      }
    },

    drawLocation: function drawLocation(line, depth) {
      var p = line.start;
      var topLeft = null;
      while (p) {
        var coords = { x: p.getColumn(), y: p.getRow() };
        console.log(line.thing.name + ': (' + coords.x + ', ' + coords.y + ')');
        if (topLeft == null) {
          topLeft = coords;
        }

        if (p.next == null || p.next.getColumn() != topLeft.x) {

          console.log('Draw: ' + line.thing.name + ': (' + topLeft.x + ', ' + topLeft.y +
                ')-(' + (coords.x + line.getWidth() - 1) + ', ' + coords.y + ')');
          var externalFrames = depth * 6;
          var corner = computeCellCenter(topLeft);
          //corner.x += externalFrames;
          corner.y -= 20;
          var size = computeCellCenter({ x: line.getWidth(), y: coords.y - topLeft.y + 1 });
          //size.x -= 2 * externalFrames;
          size.y += 20;
          var color = line.thing.color || 'black';
          this.ctx.fillStyle = color;
          drawLabel(this.ctx, line.thing.name, corner.x + size.x / 2, corner.y + 6);
          drawInsetBox(this.ctx, corner.x, corner.y, size.x, size.y, 5, color);
          topLeft = null;
        }
        p = p.next;
      }
      this.drawTimelines(line, depth + 1);
    },

    drawObject: function drawObject(line) {
      this.ctx.strokeStyle = line.thing.color || 'black';
      this.ctx.lineWidth = 6;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.beginPath();

      var p = line.start;
      var coords = computeCellCenter({ x: p.getColumn(), y: p.getRow() });
      coords.y -= 1;
      this.ctx.moveTo(coords.x, coords.y);
      while (p) {
        coords = computeCellCenter({ x: p.getColumn(), y: p.getRow() });
        coords.y += 1;
        this.ctx.lineTo(coords.x, coords.y);
        p = p.next;
      }
      this.ctx.stroke();
    },

    drawEvents: function drawEvents() {
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = 'black';
      for (var i = 0; i < this.events.getLength(); i++) {
        var e = this.events.get(i);
        for (var j = 0; j < e.experiences.length; j++) {
          var ex = e.experiences[j];
          var coords = computeCellCenter({ x: ex.getColumn(), y: ex.getRow() });
          this.ctx.fillStyle = 'white';
          this.ctx.beginPath();
          this.ctx.arc(coords.x, coords.y, 10, 0, Math.PI * 2);
          this.ctx.stroke();
          this.ctx.fill();
          this.ctx.fillStyle = ex.timeline.thing.color || 'black';
          this.ctx.beginPath();
          this.ctx.arc(coords.x, coords.y, 5, 0, Math.PI * 2);
          this.ctx.stroke();
          this.ctx.fill();
        }
      }
    },

    drawGridPoints: function drawGridPoints() {
      this.ctx.fillStyle = 'gray';
      var cell = { x: 0, y: 0 };
      var px = computeCellCenter(cell);
      while (px.x < this.canvas[0].width) {
        while (px.y < this.canvas[0].height) {
          this.ctx.beginPath();
          this.ctx.arc(px.x, px.y, 3, 0, Math.PI * 2);
          this.ctx.fill();
          cell.y += 1;
          px = computeCellCenter(cell);
        }
        cell.y = 0;
        cell.x += 1;
        px = computeCellCenter(cell);
      }
    }
  };

  function map_mouseover(ev) {
    var me = ev.data.me;
    var clickable = me.findClickableTarget(ev);
    me.canvas
      .toggleClass('clickable-hover', clickable != null)
      .attr('title', clickable ? clickable.event.summary : '');
  }

  function map_click(ev) {
    var me = ev.data.me;
    var ex = me.findClickableTarget(ev);
    if (ex) {
      alert('Experience for ' + ex.thingInstance.spaceTime.name + '!' + ex.thingInstance.thing.name + ': ' + ex.event.summary + '\n\t' + ex.event.descriptions.join('\n\t'));
    }
  }

  function getDistance(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }

  function drawLabel(ctx, text, x, y) {
    ctx.font = '12pt Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(text, x, y);
  }

  function drawInsetBox(ctx, x, y, width, height, thickness, color) {
    /*
      0, 0, 5, 0      0, 5, 5, 195
      100, 0, 95, 0  100, 5, 95, 195

      0, 0, 0, 5      5, 0, 95, 5
      0, 200, 0, 195  5, 200, 95, 195
     */
    var coords = [
      { // Left side
        box: { x: x, y: y + thickness, w: thickness, h: height - thickness * 2 },
        grad: { x1: x, y1: 0, x2: x + thickness, y2: 0 }
      },
      { // Right side
        box: { x: x + width - thickness, y: y + thickness, w: thickness, h: height - thickness * 2 },
        grad: { x1: x + width, y1: 0, x2: x + width - thickness, y2: 0 }
      },
      { // Top side
        box: { x: x + thickness, y: y, w: width - thickness * 2, h: thickness },
        grad: { x1: 0, y1: y, x2: 0, y2: y + thickness }
      },
      { // Bottom side
        box: { x: x + thickness, y: y + height - thickness, w: width - thickness * 2, h: thickness },
        grad: { x1: 0, y1: y + height, x2: 0, y2: y + height - thickness }
      }
    ];
    for (var i = 0; i < coords.length; i++) {
      var c = coords[i];
      var grad = ctx.createLinearGradient(c.grad.x1, c.grad.y1, c.grad.x2, c.grad.y2);
      grad.addColorStop(0, color);
      grad.addColorStop(1.0, 'white');
      ctx.fillStyle = grad;
      ctx.fillRect(c.box.x, c.box.y, c.box.w, c.box.h);
    }

    var offsets = [
      { x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }
    ];
    var startAngle = Math.PI;
    for (var i = 0; i < offsets.length; i++) {
      var o = {
        x: x + offsets[i].x + thickness * (offsets[i].x > 0 ? -1 : 1),
        y: y + offsets[i].y + thickness * (offsets[i].y > 0 ? -1 : 1)
      };
      var grad = ctx.createRadialGradient(o.x, o.y, thickness, o.x, o.y, 0);
      grad.addColorStop(0, color);
      grad.addColorStop(1, 'white');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(o.x, o.y);
      ctx.arc(o.x, o.y, thickness, startAngle, startAngle + Math.PI / 2, false);
      ctx.fill();
      startAngle += Math.PI / 2;
    }
  }

  function initializeTimelineMapView(canvas) {
    new TimelineMapView(canvas);
  }

  M.ui.registerControl('timeline-map-view', initializeTimelineMapView);
})(window.Mapstuck, jQuery);
