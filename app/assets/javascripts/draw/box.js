(function (M, $) {
  var defaults = {};

  function Box(options) {
    M.extend(this, defaults, options);
  }

  function drawLine(ctx, loc, size, startColor, endColor, thickness) {
    var grad;
    if (Math.abs(size.x) > thickness) {
      grad = ctx.createLinearGradient(0, loc.y, 0, loc.y + size.y);
    } else {
      grad = ctx.createLinearGradient(loc.x, 0, loc.x + size.x, 0);
    }
    grad.addColorStop(0, startColor);
    grad.addColorStop(1.0, endColor);
    ctx.fillStyle(grad)
      .fillRect(loc.x, loc.y, size.x, size.y);
  }

  function drawCorner(ctx, loc, radius, startAngle, startColor, endColor) {
    console.log('Corner: (' + loc.x + ', ' + loc.y + '), R=' + radius + '; Theta=' + startAngle);
    var grad = ctx.createRadialGradient(loc.x, loc.y, radius, loc.x, loc.y, 0);
    grad.addColorStop(0, startColor);
    grad.addColorStop(1.0, endColor);
    ctx.fillStyle(grad)
      .beginPath()
      .moveTo(loc)
      .arc(loc, radius, startAngle, startAngle + Math.PI / 2, false)
      .fill();
  }

  function draw() {
    this.context().batch(this, function () {
      var loc = this.location();
      var size = this.size();
      var thickness = this.frameWidth() || 1;
      var startColor = this.color().toCss();
      var endColor = new M.draw.Color(this.color()).setAlpha(0).toCss();

      var tLoc= new M.Point(loc.x + thickness / 2, loc.y - thickness / 2);
      var tSize = new M.Point(size.x - thickness, thickness);
      drawLine(this.context(), tLoc, tSize, startColor, endColor, thickness);
      var rLoc = new M.Point(loc.x + size.x + thickness / 2, loc.y + thickness / 2);
      var rSize = new M.Point(-thickness, size.y - thickness);
      drawLine(this.context(), rLoc, rSize, startColor, endColor, thickness);
      var bLoc = new M.Point(loc.x + size.x - thickness / 2, loc.y + size.y + thickness / 2);
      var bSize = new M.Point(-(size.x - thickness), -thickness);
      drawLine(this.context(), bLoc, bSize, startColor, endColor, thickness);
      var lLoc = new M.Point(loc.x - thickness / 2, loc.y + size.y - thickness / 2);
      var lSize = new M.Point(thickness, -(size.y - thickness));
      drawLine(this.context(), lLoc, lSize, startColor, endColor, thickness);

      var tlLoc = new M.Point(loc.x + thickness / 2, loc.y + thickness / 2);
      var startAngle = Math.PI;
      drawCorner(this.context(), tlLoc, thickness, startAngle, startColor, endColor);
      startAngle += Math.PI / 2;
      var trLoc = tlLoc.clone().add(size.x - thickness, 0);
      drawCorner(this.context(), trLoc, thickness, startAngle, startColor, endColor);
      startAngle += Math.PI / 2;
      var brLoc = trLoc.clone().add(0, size.y - thickness);
      drawCorner(this.context(), brLoc, thickness, startAngle, startColor, endColor);
      startAngle += Math.PI / 2;
      var blLoc = brLoc.clone().add(-size.x + thickness, 0);
      drawCorner(this.context(), blLoc, thickness, startAngle, startColor, endColor);
    });
  }

  M.addGetterSetters(Box.prototype, ['context', 'location', 'size', 'frameWidth', 'color']);

  $.extend(Box.prototype, {
    draw: draw
  });

  Box.draw = function (options) {
    new Box(options).draw();
  };
  M.draw.Box = Box;
})(window.Mapstuck, jQuery);
