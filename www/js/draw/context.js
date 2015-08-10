(function (M, $) {
  function Context2d(canvas) {
    this.context = M.parseScalar(canvas).getContext('2d');
  }

  function arc(point, radius, startAngle, endAngle, antiClockwise) {
    this.context.arc(point.x, point.y, radius, startAngle, endAngle, antiClockwise);
    return this;
  }

  function batch(callbackThis, callback) {
    this.context.save();
    callback.call(callbackThis, this);
    this.context.restore();
  }

  function circle(position, radius) {
    return this.arc(position, radius, 0, Math.PI * 2);
  }

  function fill() {
    this.context.fill();
    return this;
  }

  function fillCircle(position, radius) {
    return this.circle(position, radius).fill();
  }

  function fillRect(topLeft, size) {
    this.context.fillRect(topLeft.x, topLeft.y, size.x, size.y);
    return this;
  }

  function fillText(text, position) {
    this.context.fillText(text, position.x, position.y);
    return this;
  }

  function lineTo(position) {
    this.context.lineTo(position.x, position.y);
    return this;
  }

  function moveTo(position) {
    this.context.moveTo(position.x, position.y);
    return this;
  }

  function stroke() {
    this.context.stroke();
    return this;
  }

  function strokeCircle(position, radius) {
    return this.circle(position, radius).stroke();
  }

  function strokeRect(topLeft, size) {
    this.context.strokeRect(topLeft.x, topLeft.y, size.x, size.y);
    return this;
  }

  function strokeText(text, position) {
    this.context.strokeText(text, position.x, position.y);
    return this;
  }

  function getOrSetStyle(field) {
    if (arguments.length == 1) {
      return this['_' + field];
    } else {
      var value = arguments[1];
      this['_' + field] = value;
      if (value != null && typeof value.toStyle == 'function') {
        value = value.toStyle();
      }
      this.context[field] = value;
      return this;
    }
  }

  function fillStyle(value) {
    var args = ['fillStyle'];
    if (arguments.length > 0) {
      args.push(value);
    }
    return getOrSetStyle.apply(this, args);
  }

  function strokeStyle(value) {
    var args = ['strokeStyle'];
    if (arguments.length > 0) {
      args.push(value);
    }
    return getOrSetStyle.apply(this, args);
  }

  $.extend(Context2d.prototype, {
    arc: arc,
    batch: batch,
    circle: circle,
    fill: fill,
    fillCircle: fillCircle,
    fillRect: fillRect,
    fillStyle: fillStyle,
    fillText: fillText,
    lineTo: lineTo,
    moveTo: moveTo,
    stroke: stroke,
    strokeCircle: strokeCircle,
    strokeRect: strokeRect,
    strokeStyle: strokeStyle,
    strokeText: strokeText
  });

  M.addGetterSetters(Context2d.prototype, 'context', [
    'globalAlpha', 'globalCompositeOperation', 'imageSmoothingEnabled',
    'lineCap', 'lineJoin', 'lineWidth', 'miterLimit',
    'font', 'textAlign', 'textBaseline',
    'shadowBlur', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY'
  ]);

  M.addWrappers(Context2d.prototype, 'context', [
    'save', 'restore',
    'createLinearGradient', 'createRadialGradient',
    'beginPath', 'clip', 'fill', 'fillRect', 'stroke'
  ]);

  M.draw.Context2d = Context2d;
})(window.Mapstuck, jQuery);
