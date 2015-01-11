(function (M, $) {
  function toMap(objects, key) {
    if (!key) {
      key = 'id';
    }

    var map = {};
    for (var i = 0; i < objects.length; i++) {
      map[objects[i][key]] = objects[i];
    }

    return map;
  }

  function collectAssociations(objects, name) {
    var result = [];
    for (var objectId in objects) {
      if (!objects.hasOwnProperty(objectId)) {
        continue;
      }

      var association = objects[objectId][name];
      if ($.isArray(association)) {
        for (var i = 0; i < association.length; i++) {
          result.push(association[i]);
        }
      } else {
        result.push(association);
      }
    }

    return result;
  }

  function mapRelations(objects, relationList) {
    for (var objectId in objects) {
      if (!objects.hasOwnProperty(objectId)) {
        continue;
      }

      var o = objects[objectId];
      for (var i = 0; i < relationList.length; i++) {
        var relation = relationList[i];
        o[relation.name] = relation.objects[o[relation.id]] || null;
      }
    }
  }

  function TimelineMapView(canvas) {
    this.canvas = canvas;
    this.ctx = canvas[0].getContext('2d');

    this.nowhere = { id: null, contents: new M.Set(), thing: { name: 'Nowhere' } };
    this.events = canvas.data('events');
    this.spaceTimes = canvas.data('spaceTimes');
    this.spaceTimesMap = toMap(this.spaceTimes);
    this.things = canvas.data('things');
    this.thingsMap = toMap(this.things);
    this.timelines = collectAssociations(this.things, 'instances');
    this.timelinesMap = toMap(this.timelines);
    for (var i = 0; i < this.timelines.length; i++) {
      var t = this.timelines[i];
      t.spaceTime = this.spaceTimesMap[t.space_time_id];
      t.temp_subLocations = new M.Set();
      t.contents = new M.Set();
      t.thing = this.thingsMap[t.thing_id];
    }

    this.timelinePoints = canvas.data('timelinePoints');
    this.timelinePointsMap = toMap(this.timelinePoints);
    this.buildTimelines();
    this.calculateTimes();
    this.calculateWidths();
    this.alignPoints();
    this.drawLocations(this.nowhere.contents.list, 0);

    var rose = 'rgba(181, 54, 218, 0.8)';

    drawInsetBox(this.ctx, 500, 0, 200, 400, 5, rose);

    var colors = [ '#b536da', '#ff6ff2', 'purple' ];
    var index = 0;
    for (var i = 0; i < this.timelines.length; i++) {
      var timeline = this.timelines[i];
      if (timeline.thing.category == 'character') {
        console.log('Rendering events for ' + timeline.spaceTime.name + '!' +
            timeline.thing.name);
        //this.drawTimeline(timelineStart, index, colors[index]);
        index += 1;
      }
    }

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

    buildTimelines: function buildTimelines() {
      for (var i = 0; i < this.timelinePoints.length; i++) {
        var p = this.timelinePoints[i];
        p.coords = {x : null, y: null };
        p.timeline = this.timelinesMap[p.thing_instance_id];
        if (p.previous_id == null) {
          p.timeline.start = p;
        }

        p.characterCount = 0;
        p.whenAndWhere = this.timelinePointsMap[p.when_and_where_id];
        p.previous = this.timelinePointsMap[p.previous_id];
        p.next = this.timelinePointsMap[p.next_id];
      }

      for (var i = 0; i < this.timelinePoints.length; i++) {
        var p = this.timelinePoints[i];
        if (p.whenAndWhere) {
          if (p.timeline.thing.category == 'location') {
            p.whenAndWhere.timeline.temp_subLocations.add(p.timeline);
            p.whenAndWhere.timeline.contents.add(p.timeline);
          } else {
            p.whenAndWhere.characterCount += 1;
          }
        } else {
          this.nowhere.contents.add(p.timeline);
        }
      }
    },

    calculateTimes: function calcuateTimes() {
      for (var i = 0; i < this.nowhere.contents.list.length; i++) {
        var line = this.nowhere.contents.list[i];
        var p = line.start;
        var y = 0;
        while (p) {
          if (p.whenAndWhere == null) {
            p.coords.y = y;
            y += 1;
          } else {
            y = 0;
          }
          p = p.next;
        }
      }

      for (var i = 0; i < this.timelinePoints.length; i++) {
        var p = this.timelinePoints[i];
        var q = p;
        while (q.coords.y == null) {
          q = q.whenAndWhere;
        }
        while (p.coords.y == null) {
          p.coords.y = q.coords.y;
          p = p.whenAndWhere;
        }
      }
    },

    calculateWidths: function calculateWidths() {
      // Calculate max direct character counts and find parent locations.
      var locations = [];
      for (var i = 0; i < this.timelines.length; i++) {
        var line = this.timelines[i];
        if (!line.temp_subLocations.isEmpty()) {
          locations.push(line);
        }
        line.maxCharacterCount = 0;
        var p = line.start;
        while (p) {
          if (p.characterCount > line.maxCharacterCount) {
            line.maxCharacterCount = p.characterCount;
          }
          p = p.next;
        }
      }

      while (locations.length > 0) {
        for (var i = 0; i < locations.length; i++) {
          var l = locations[i];
          for (var j = 0; j < l.temp_subLocations.list.length; j++) {
            var sub = l.temp_subLocations.list[j];
            if (sub.temp_subLocations.isEmpty()) {
              l.maxCharacterCount += sub.maxCharacterCount;
              l.temp_subLocations.remove(sub);
              j -= 1;
            }
          }
          if (l.temp_subLocations.isEmpty()) {
            locations.splice(i, 1);
            i -= 1;
          }
        }
      }
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
            console.log('Coords: ' + p.id + ': (' + p.coords.x + ', ' + p.coords.y + ')');
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

    drawLocations: function drawLocations(locations, depth) {
      for (var i = 0; i < locations.length; i++) {
        var line = locations[i];
        var p = line.start;
        var topLeft = null;
        while (p) {
          console.log(line.thing.name + ': (' + p.coords.x + ', ' + p.coords.y + ')');
          if (topLeft == null) {
            topLeft = p.coords;
          }

          if (p.next == null || p.next.coords.x != p.coords.x || p.next.coords.y != p.coords.y + 1) {
            console.log('Draw: ' + line.thing.name + ': (' + topLeft.x + ', ' + topLeft.y +
                  ')-(' + (p.coords.x + line.maxCharacterCount - 1) + ', ' + p.coords.y + ')');
            var externalFrames = depth * 6;
            var x = topLeft.x * 100 + externalFrames;
            var y = topLeft.y * 100 + externalFrames;
            var w = line.maxCharacterCount * 100 - 2 * externalFrames;
            var h = (p.coords.y - topLeft.y + 1) * 100 - 2 * externalFrames;
            console.log(line.thing.name + ': (' + x + ', ' + y + '), ' + w + 'x' + h);
            var color = line.thing.color || 'black';
            this.ctx.font = '12pt Verdana, sans-serif';
            this.ctx.fillStyle = color;
            this.ctx.fillText(line.thing.name, x, y);
            drawInsetBox(this.ctx, x, y, w, h, 5, color);
            topLeft = null;
          }
          p = p.next;
        }
        this.drawLocations(line.contents.list, depth + 1);
      }
    },

    drawTimeline: function drawTimeline(timelineStart, index, color) {
      this.ctx.strokeStyle = 'black';
      var x = index * 100;
      var point = timelineStart;
      /*
      while (point) {
        var y = this.experiences[i].local_time;
        this.experiences[i].coords = { x: x, y: y };
        if (i + 1 < this.experiences.length) {
          this.ctx.fillStyle = color;
          var nextY = this.experiences[i + 1].local_time;
          this.ctx.fillRect(x - 5, y, 10, nextY - y);
        }

        this.ctx.fillStyle = 'white';
        console.log(y);
        drawCircle(this.ctx, x, y, 10, true, true);
        this.ctx.fillStyle = color;
        drawCircle(this.ctx, x, y, 5, true, true);

        point = timelineStart.next;
      }*/
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
