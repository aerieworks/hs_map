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

  function TimelineMapView(control) {
    this.timelineCanvas = $('.timeline-map-timeline-layer', control);
    this.labelCanvas = $('.timeline-map-label-layer', control);
    this.timelineCtx = this.timelineCanvas[0].getContext('2d');
    this.labelCtx = this.labelCanvas[0].getContext('2d');

    this.events = toModels(control.data('events'), M.models.Event);
    this.spaceTimes = toModels(control.data('spaceTimes'), M.models.SpaceTime);
    this.things = toModels(control.data('things'), M.models.Thing);
    this.timelines = toModels(control.data('timelines'), M.models.Timeline);
    this.timelinePoints = toModels(control.data('timelinePoints'), M.models.TimelinePoint);
    this.nowhere = new M.models.Thing({ id: -1, name: 'Nowhere', category: 'location' });
    this.never = new M.models.SpaceTime({ id: -1, name: 'Never' });
    this.void = new M.models.Timeline({ id: null, thing_id: -1, space_time_id: -1 });

    for (var i = 0; i < this.timelinePoints.getLength(); i++) {
      var p = this.timelinePoints.get(i);
      if (p.whenAndWhere == null) {
        this.void.contents.add(p.timeline);
      }
    }

    // Calculate canvas size requirements.
    var gridWidth = this.void.getWidth();
    var gridHeight = 0;
    for (var i = 0; i < this.void.contents.getLength(); i++) {
      var line = this.void.contents.get(i);
      var p = line.start;
      while (p) {
        if (!p.whenAndWhere && p.getRow() > gridHeight) {
          gridHeight = p.getRow();
        }
        p = p.next;
      }
    }
    gridHeight += 2;

    console.log('Grid: ' + gridWidth + 'x' + gridHeight);
    this.timelineCanvas
      .prop('width', gridWidth * GRID_CELL_WIDTH)
      .prop('height', gridHeight * GRID_CELL_HEIGHT);
    this.labelCanvas
      .prop('width', gridWidth * GRID_CELL_WIDTH)
      .prop('height', gridHeight * GRID_CELL_HEIGHT);

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


    this.drawTimelines(this.void, 0);
    this.drawEvents();
    this.drawGridPoints();

    this.labelCanvas
      .bind('mousemove', { me: this }, map_mouseover)
      .bind('click', { me: this }, map_click);
  }

  TimelineMapView.prototype = {
    findClickableTarget: function findClickableTarget(ev) {
      var coords = this.toMapCoords({ x: ev.clientX, y: ev.clientY });
      for (var i = 0; i < this.events.getLength(); i++) {
        var e = this.events.get(i);
        for (var j = 0; j < e.experiences.length; j++) {
          var ex = e.experiences[j];
          var exCoords = computeCellCenter({ x: ex.getColumn(), y: ex.getRow() });
          if (exCoords && getDistance(exCoords, coords) <= 10) {
            return ex;
          }
        }
      }

      return null;
    },

    toMapCoords: function toMapCoords(coords) {
      var bbox = this.labelCanvas[0].getBoundingClientRect();
      return {
        x: coords.x - bbox.left * (this.labelCanvas[0].width / bbox.width),
        y: coords.y - bbox.top * (this.labelCanvas[0].height / bbox.height)
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
        if (topLeft == null) {
          topLeft = coords;
        }

        if (p.next == null || p.next.getColumn() != topLeft.x) {

          console.log('Draw: ' + line.thing.name + ': (' + topLeft.x + ', ' + topLeft.y +
                ')-(' + (coords.x + line.getWidth() - 1) + ', ' + coords.y + ')');
          var externalFrames = depth * 6;
          var corner = computeCellCenter(topLeft);
          corner.y -= 20;
          var size = computeCellCorner({ x: line.getWidth() - 1, y: coords.y - topLeft.y + 1 });
          var color = line.thing.color || M.Color.black;
          drawLabel(this.labelCtx, line.thing.name, corner.x + size.x / 2, corner.y + 6);
          this.timelineCtx.globalCompositeOperation = 'source-over';
          drawInsetBox(this.timelineCtx, corner.x, corner.y, size.x, size.y, 5, color);
          topLeft = null;
        }
        p = p.next;
      }
      this.drawTimelines(line, depth + 1);
    },

    drawObject: function drawObject(line) {
      this.timelineCtx.globalCompositeOperation = 'destination-over';
      this.timelineCtx.strokeStyle = (line.thing.color || M.Color.black).toCss();
      this.timelineCtx.lineWidth = 6;
      this.timelineCtx.lineCap = 'round';
      this.timelineCtx.lineJoin = 'round';
      this.timelineCtx.beginPath();

      var p = line.start;
      var coords = computeCellCenter({ x: p.getColumn(), y: p.getRow() });
      coords.y -= 1;
      this.timelineCtx.moveTo(coords.x, coords.y);
      while (p) {
        coords = computeCellCenter({ x: p.getColumn(), y: p.getRow() });
        coords.y += 1;
        this.timelineCtx.lineTo(coords.x, coords.y);
        p = p.next;
      }
      this.timelineCtx.stroke();
    },

    drawEvents: function drawEvents() {
      this.timelineCtx.globalCompositeOperation = 'source-over';
      this.timelineCtx.lineWidth = 1;
      this.timelineCtx.strokeStyle = 'black';
      for (var i = 0; i < this.events.getLength(); i++) {
        var e = this.events.get(i);
        for (var j = 0; j < e.experiences.length; j++) {
          var ex = e.experiences[j];
          var coords = computeCellCenter({ x: ex.getColumn(), y: ex.getRow() });
          this.timelineCtx.fillStyle = 'white';
          this.timelineCtx.beginPath();
          this.timelineCtx.arc(coords.x, coords.y, 10, 0, Math.PI * 2);
          this.timelineCtx.fill();

          var color1 = ex.timeline.thing.color || M.Color.black;
          var color2 = new M.Color(color1).setAlpha(0.2);
          var grad = this.timelineCtx.createRadialGradient(coords.x, coords.y, 10.5,
              coords.x, coords.y, 2);
          grad.addColorStop(0, color1.toCss());
          grad.addColorStop(1, color2.toCss());
          this.timelineCtx.fillStyle = grad;
          this.timelineCtx.beginPath();
          this.timelineCtx.arc(coords.x, coords.y, 10.5, 0, Math.PI * 2);
          this.timelineCtx.fill();
        }
      }
    },

    drawGridPoints: function drawGridPoints() {
      this.timelineCtx.globalCompositeOperation = 'destination-over';
      this.timelineCtx.fillStyle = 'gray';
      var cell = { x: 0, y: 0 };
      var px = computeCellCenter(cell);
      while (px.x < this.timelineCanvas[0].width) {
        while (px.y < this.timelineCanvas[0].height) {
          this.timelineCtx.beginPath();
          this.timelineCtx.arc(px.x, px.y, 2.5, 0, Math.PI * 2);
          this.timelineCtx.fill();
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
    $(ev.target)
      .toggleClass('clickable-hover', clickable != null)
      .attr('title', clickable ? clickable.events[0].summary : '');
  }

  function map_click(ev) {
    var me = ev.data.me;
    var ex = me.findClickableTarget(ev);
    if (ex) {
      alert('Experience for ' + ex.timeline.getName() + ': ' + ex.events[0].summary + '\n\t' + ex.events[0].details.join('\n\t'));
    }
  }

  function getDistance(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }

  function drawLabel(ctx, text, x, y) {
    ctx.font = '14pt Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'black';
    ctx.lineWidth = 1;
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
        box: { x: x - thickness / 2, y: y + thickness, w: thickness, h: height - thickness * 2 },
        grad: { x1: x - thickness / 2, y1: 0, x2: x + thickness / 2, y2: 0 }
      },
      { // Right side
        box: { x: x + width - thickness / 2, y: y + thickness, w: thickness, h: height - thickness * 2 },
        grad: { x1: x + width + thickness / 2, y1: 0, x2: x + width - thickness / 2, y2: 0 }
      },
      { // Top side
        box: { x: x + thickness / 2, y: y, w: width - thickness, h: thickness },
        grad: { x1: 0, y1: y, x2: 0, y2: y + thickness }
      },
      { // Bottom side
        box: { x: x + thickness / 2, y: y + height - thickness, w: width - thickness, h: thickness },
        grad: { x1: 0, y1: y + height, x2: 0, y2: y + height - thickness }
      }
    ];
    for (var i = 0; i < coords.length; i++) {
      var c = coords[i];
      var grad = ctx.createLinearGradient(c.grad.x1, c.grad.y1, c.grad.x2, c.grad.y2);
      var secondColor = new M.Color(color).setAlpha(0);
      grad.addColorStop(0, color.toCss());
      grad.addColorStop(1.0, secondColor.toCss());
      ctx.fillStyle = grad;
      ctx.fillRect(c.box.x, c.box.y, c.box.w, c.box.h);
    }

    var offsets = [
      { x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }
    ];
    var startAngle = Math.PI;
    for (var i = 0; i < offsets.length; i++) {
      var o = {
        x: x + offsets[i].x + thickness / (offsets[i].x > 0 ? -2 : 2),
        y: y + offsets[i].y + thickness * (offsets[i].y > 0 ? -1 : 1)
      };
      var grad = ctx.createRadialGradient(o.x, o.y, thickness, o.x, o.y, 0);
      grad.addColorStop(0, color.toCss());
      grad.addColorStop(1.0, secondColor.toCss());
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(o.x, o.y);
      ctx.arc(o.x, o.y, thickness, startAngle, startAngle + Math.PI / 2, false);
      ctx.fill();
      startAngle += Math.PI / 2;
    }
  }

  function initializeTimelineMapView(control) {
    new TimelineMapView(control);
  }

  M.ui.registerControl('timeline-map-view', initializeTimelineMapView);
})(window.Mapstuck, jQuery);
