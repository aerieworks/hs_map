jQuery(function ($) {
  function fromCamelCase(str) {
    return str.replace(/([A-Z])/g, function (x) {
      return '_' + x.toLowerCase();
    });
  }

  function aggregateRelations(objects, relationName) {
    var result = {};
    for (var objectId in objects) {
      if (!objects.hasOwnProperty(objectId)) {
        continue;
      }

      var relations = objects[objectId][relationName];
      for (var i = 0; i < relations.length; i++) {
        result[relations[i].id] = relations[i];
      }
    }

    return result;
  }

  function mapRelations(objects, relationList) {
    for (var i = 0; i < relationList.length; i++) {
      var r = relationList[i];
      r.id = fromCamelCase(r.name) + '_id';
    }

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

  function buildInstanceExperienceLists(experiences) {
    var instances = [];
    for (var exId in experiences) {
      if (!experiences.hasOwnProperty(exId)) {
        continue;
      }

      var ex = experiences[exId];
      if (ex.thingInstance.experiences == null) {
        instances.push(ex.thingInstance);
        ex.thingInstance.experiences = [];
      }
      ex.thingInstance.experiences.push(ex);
    }

    for (var i = 0; i < instances.length; i++) {
      instances[i].experiences.sort(function (a, b) {
        var aIndex = a.sequence_index;
        var bIndex = b.sequence_index;
        if (aIndex < bIndex) {
          return -1;
        } else if (aIndex == bIndex) {
          return 0;
        } else {
          return 1;
        }
      });
    }
  }

  function initializeData(data) {
    data.thingInstances = aggregateRelations(data.things, 'instances');
    mapRelations(data.thingInstances, [
      { objects: data.things, name: 'thing' },
      { objects: data.thingInstances, name: 'initialLocation' },
      { objects: data.spaceTimes, name: 'spaceTime' }
    ]);

    data.experiences = aggregateRelations(data.events, 'event_participants');
    mapRelations(data.experiences, [
      { objects: data.events, name: 'event' },
      { objects: data.thingInstances, name: 'thingInstance' },
      { objects: data.thingInstances, name: 'location' }
    ]);
    buildInstanceExperienceLists(data.experiences);
    console.log(data.experiences);
  }

  function getDistance(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }

  function findClickableTarget(coords) {
    for (var id in hsMapData.experiences) {
      if (!hsMapData.experiences.hasOwnProperty(id)) {
        continue;
      }
      var ex = hsMapData.experiences[id];
      if (ex.coords && getDistance(ex.coords, coords) <= 10) {
        return ex;
      }
    }

    return null;
  }

  function getMouseCoords(ev) {
    var bbox = ev.target.getBoundingClientRect();
    return {
      x: ev.clientX - bbox.left * (ev.target.width / bbox.width),
      y: ev.clientY - bbox.top * (ev.target.height / bbox.height)
    };
  }

  function map_mouseover(ev) {
    var clickable = findClickableTarget(getMouseCoords(ev));
    $(this)
      .toggleClass('clickable-hover', clickable != null)
      .attr('title', clickable ? clickable.event.summary : '');
  }

  function map_click(ev) {
    var ex = findClickableTarget(getMouseCoords(ev));
    if (ex) {
      alert('Experience for ' + ex.thingInstance.spaceTime.name + '!' + ex.thingInstance.thing.name + ': ' + ex.event.summary + '\n\t' + ex.event.descriptions.join('\n\t'));
    }
  }

  function drawCircle(x, y, r, fill, stroke) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  function drawLabel(text, x, y) {
    ctx.font = '12pt Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(text, x, y);
  }

  function drawInsetBox(x, y, width, height, thickness, color) {
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
      console.log('Side');
      console.log(c.box);
      var grad = ctx.createLinearGradient(c.grad.x1, c.grad.y1, c.grad.x2, c.grad.y2);
      grad.addColorStop(0, color);
      grad.addColorStop(1.0, 'white');
      ctx.fillStyle = grad;
      ctx.fillRect(c.box.x, c.box.y, c.box.w, c.box.h);
    }

    var xOffsets = [ 0, width ];
    var yOffsets = [ 0, height ];
    for (var i = 0; i < xOffsets.length; i++) {
      for (var j = 0; j < yOffsets.length; j++) {
        var xOff = xOffsets[i];
        var yOff = yOffsets[j];
        var rect = {
          x: x + xOff - (xOff > 0 ? thickness : 0),
          y: y + yOff - (yOff > 0 ? thickness : 0)
        };
        var o = {
          x: x + xOff + thickness * (xOff > 0 ? -1 : 1),
          y: y + yOff + thickness * (yOff > 0 ? -1 : 1)
        };
        console.log('Corner');
        console.log(rect);
        console.log(o);
        var grad = ctx.createRadialGradient(o.x, o.y, thickness, o.x, o.y, 0);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'white');
        ctx.fillStyle = grad;
        ctx.save();
          ctx.beginPath();
          ctx.rect(rect.x, rect.y, rect.x + thickness, rect.y + thickness);
          ctx.clip();
          drawCircle(o.x, o.y, thickness, true, false);
        ctx.restore();
      }
    }
  }

  function drawExperiences(x, color, experiences) {
    ctx.strokeStyle = 'black';
    for (var i = 0; i < experiences.length; i++) {
      var y = experiences[i].local_time;
      experiences[i].coords = { x: x, y: y };
      console.log('\tExperience: ' + experiences[i].event.summary + '; ' + x + ', ' + y);
      if (i + 1 < experiences.length) {
        ctx.fillStyle = color;
        var nextY = experiences[i + 1].local_time;
        ctx.fillRect(x - 5, y, 10, nextY - y);
      }

      ctx.fillStyle = 'white';
      console.log(y);
      drawCircle(x, y, 10, true, true);
      ctx.fillStyle = color;
      drawCircle(x, y, 5, true, true);
    }
  }

  if (window.hsMapData) {
    initializeData(window.hsMapData);

    var rose = 'rgba(181, 54, 218, 0.8)';
    var mapCanvas = document.getElementById('mapCanvas');
    var ctx = mapCanvas.getContext('2d');

    drawInsetBox(0, 0, 200, 400, 5, rose);
    drawLabel('LOLAR', 100, 10);

    var colors = [ '#b536da', '#ff6ff2', 'purple' ];
    var index = 0;
    for (var id in hsMapData.thingInstances) {
      if (!hsMapData.thingInstances.hasOwnProperty(id)) {
        continue;
      }

      var inst = hsMapData.thingInstances[id];
      if (inst.thing.category == 'character' && inst.experiences) {
        console.log('Rendering events for ' + inst.spaceTime.name + '!' + inst.thing.name);
        drawExperiences(50 + index * 100, colors[index], inst.experiences);
        index += 1;
      }
    }

    $('#mapCanvas')
      .bind('mousemove', map_mouseover)
      .bind('click', map_click);
  }
});
