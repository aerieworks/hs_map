'use strict';
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

  function computeCellCorner(coords) {
    return coords.multiply(GRID_CELL_WIDTH, GRID_CELL_HEIGHT);
  }

  function computeCellCenter(coords) {
    return computeCellCorner(coords).add(GRID_CELL_WIDTH / 2, GRID_CELL_HEIGHT / 2);
  }

  function TimelineMapView(env, control) {
    this.env = env;
    this.timelineCanvas = $('.timeline-map-timeline-layer', control);
    this.labelCanvas = $('.timeline-map-label-layer', control);
    this.timelineCtx = new M.draw.Context2d(this.timelineCanvas);
    this.labelCtx = new M.draw.Context2d(this.labelCanvas);

    this.events = env.events.getAll()
    this.spaceTimes = env.spaceTimes.getAll();
    this.things = env.things.getAll();
    this.timelines = env.timelines.getAll();
    this.timelinePoints = env.timelinePoints.getAll();
    this.nowhere = new M.models.Thing({ id: -1, name: 'Nowhere', category: 'location' });
    this.never = new M.models.SpaceTime({ id: -1, name: 'Never' });
    this.void = new M.models.Timeline({ id: -1, thing: this.nowhere, spaceTime: this.never });

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

    gridWidth = Math.max(gridWidth, 1);
    console.log('Grid: ' + gridWidth + 'x' + gridHeight);
    this.timelineCanvas
      .prop('width', gridWidth * GRID_CELL_WIDTH)
      .prop('height', gridHeight * GRID_CELL_HEIGHT);
    this.labelCanvas
      .prop('width', gridWidth * GRID_CELL_WIDTH)
      .prop('height', gridHeight * GRID_CELL_HEIGHT);

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
      var coords = this.toMapCoords(new M.Point(ev.clientX, ev.clientY));
      for (var i = 0; i < this.events.getLength(); i++) {
        var e = this.events.get(i);
        for (var j = 0; j < e.experiences.length; j++) {
          var ex = e.experiences[j];
          var exCoords = computeCellCenter(new M.Point(ex.getColumn(), ex.getRow()));
          if (exCoords.distance(coords) <= 10) {
            return ex;
          }
        }
      }

      return null;
    },

    toMapCoords: function toMapCoords(coords) {
      var bbox = this.labelCanvas[0].getBoundingClientRect();
      return coords.subtract({
        x: bbox.left * (this.labelCanvas[0].width / bbox.width),
        y: bbox.top * (this.labelCanvas[0].height / bbox.height)
      });
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
        var coords = new M.Point(p.getColumn(), p.getRow());
        if (topLeft == null) {
          topLeft = coords;
        }

        if (p.next == null || p.next.getColumn() != topLeft.x) {

          console.log('Draw: ' + line.thing.name + ': (' + topLeft.x + ', ' + topLeft.y +
                ')-(' + (coords.x + line.getWidth() - 1) + ', ' + coords.y + ')');
          var externalFrames = depth * 6;
          var corner = computeCellCenter(topLeft.clone());
          corner.y -= 20;
          var size = computeCellCorner(new M.Point(line.getWidth() - 1, coords.y - topLeft.y + 1));
          var color = line.thing.color || M.draw.Color.black;
          M.draw.Label.draw({
            context: this.labelCtx,
            font: '14pt Verdana, sans-serif',
            text: line.thing.name,
            position: corner.clone().add(size.x / 2, 6),
            textAlign: 'center',
            textBaseline: 'top'
          });
          this.timelineCtx.globalCompositeOperation('source-over');
          M.draw.Box.draw({
            context: this.timelineCtx,
            location: corner,
            size: size,
            frameWidth: 10,
            color: color
          });
          //drawInsetBox(this.timelineCtx, corner, size, 10, color);
          topLeft = null;
        }
        p = p.next;
      }
      this.drawTimelines(line, depth + 1);
    },

    drawObject: function drawObject(line) {
      this.timelineCtx.globalCompositeOperation('destination-over')
        .strokeStyle((line.thing.color || M.draw.Color.black).toCss())
        .lineWidth(6)
        .lineCap('round')
        .lineJoin('round')
        .beginPath();

      var p = line.start;
      var coords = computeCellCenter(new M.Point(p.getColumn(), p.getRow()));
      coords.y -= 1;
      this.timelineCtx.moveTo(coords);
      while (p) {
        coords = computeCellCenter(new M.Point(p.getColumn(), p.getRow()));
        coords.y += 1;
        this.timelineCtx.lineTo(coords);
        p = p.next;
      }
      this.timelineCtx.stroke();
    },

    drawEvents: function drawEvents() {
      this.timelineCtx.globalCompositeOperation('source-over')
        .lineWidth(1)
        .strokeStyle('black');
      for (var i = 0; i < this.events.getLength(); i++) {
        var e = this.events.get(i);
        for (var j = 0; j < e.experiences.length; j++) {
          var ex = e.experiences[j];
          var coords = computeCellCenter(new M.Point(ex.getColumn(), ex.getRow()));
          M.draw.Circle.draw({
            context: this.timelineCtx, fillStyle: 'white', position: coords, radius: 10
          });

          var color1 = ex.timeline.thing.color || M.draw.Color.black;
          var color2 = new M.draw.Color(color1).setAlpha(0.2);
          var grad = this.timelineCtx.createRadialGradient(coords.x, coords.y, 10.5,
              coords.x, coords.y, 2);
          grad.addColorStop(0, color1.toCss());
          grad.addColorStop(1, color2.toCss());
          M.draw.Circle.draw({
            context: this.timelineCtx, fillStyle: grad, position: coords, radius: 10.5
          });
        }
      }
    },

    drawGridPoints: function drawGridPoints() {
      this.timelineCtx.globalCompositeOperation('destination-over');
      var cell = new M.Point(0, 0);
      var px = computeCellCenter(cell.clone());
      while (px.x < this.timelineCanvas[0].width) {
        while (px.y < this.timelineCanvas[0].height) {
          new M.draw.Circle.draw(
            { context: this.timelineCtx, fillStyle: 'gray', position: px, radius: 2.5 }
          );
          cell.y += 1;
          px = computeCellCenter(cell.clone());
        }
        cell.y = 0;
        cell.x += 1;
        px = computeCellCenter(cell.clone());
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

  function drawInsetBox(ctx, loc, size, thickness, color) {
    /*
      0, 0, 5, 0      0, 5, 5, 195
      100, 0, 95, 0  100, 5, 95, 195

      0, 0, 0, 5      5, 0, 95, 5
      0, 200, 0, 195  5, 200, 95, 195
     */
    console.log(loc);
    var coords = [
      { // Left side
        box: { x: loc.x - thickness / 2, y: loc.y + thickness, w: thickness, h: size.y - thickness * 2 },
        grad: { x1: loc.x - thickness / 2, y1: 0, x2: loc.x + thickness / 2, y2: 0 }
      },
      { // Right side
        box: { x: loc.x + size.x - thickness / 2, y: loc.y + thickness, w: thickness, h: size.y - thickness * 2 },
        grad: { x1: loc.x + size.x + thickness / 2, y1: 0, x2: loc.x + size.x - thickness / 2, y2: 0 }
      },
      { // Top side
        box: { x: loc.x + thickness / 2, y: loc.y, w: size.x - thickness, h: thickness },
        grad: { x1: 0, y1: loc.y, x2: 0, y2: loc.y + thickness }
      },
      { // Bottom side
        box: { x: loc.x + thickness / 2, y: loc.y + size.y - thickness, w: size.x - thickness, h: thickness },
        grad: { x1: 0, y1: loc.y + size.y, x2: 0, y2: loc.y + size.y - thickness }
      }
    ];
    console.log(coords);
    for (var i = 0; i < coords.length; i++) {
      var c = coords[i];
      var grad = ctx.createLinearGradient(c.grad.x1, c.grad.y1, c.grad.x2, c.grad.y2);
      var secondColor = new M.draw.Color(color).setAlpha(0);
      grad.addColorStop(0, color.toCss());
      grad.addColorStop(1.0, secondColor.toCss());
      ctx.fillStyle(grad);
      ctx.fillRect(c.box.x, c.box.y, c.box.w, c.box.h);
    }

    var offsets = [
      { x: 0, y: 0 }, { x: size.x, y: 0 }, { x: size.x, y: size.y }, { x: 0, y: size.y }
    ];
    var startAngle = Math.PI;
    for (var i = 0; i < offsets.length; i++) {
      var o = {
        x: loc.x + offsets[i].x + thickness / (offsets[i].x > 0 ? -2 : 2),
        y: loc.y + offsets[i].y + thickness * (offsets[i].y > 0 ? -1 : 1)
      };
      var grad = ctx.createRadialGradient(o.x, o.y, thickness, o.x, o.y, 0);
      grad.addColorStop(0, color.toCss());
      grad.addColorStop(1.0, secondColor.toCss());
      ctx.fillStyle(grad);

      ctx.beginPath();
      ctx.moveTo(o.x, o.y);
      ctx.arc(o.x, o.y, thickness, startAngle, startAngle + Math.PI / 2, false);
      ctx.fill();
      startAngle += Math.PI / 2;
    }
  }

  M.ui.registerControl(TimelineMapView);
})(window.Mapstuck, jQuery);
