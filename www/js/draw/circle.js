(function (M, $) {
  var defaults = {
    doFill: true,
    doStroke: false
  };

  function Circle(options) {
    M.extend(this, defaults, options);
  }

  function draw() {
    this.context().batch(this, function () {
      if (this.doFill()) {
        this.context().fillStyle(this.fillStyle(), true);
      }
      if (this.doStroke()) {
        this.context().strokeStyle(this.strokeStyle(), true).lineWidth(this.lineWidth(), true);
      }

      this.context().beginPath()
        .moveTo(this.position())
        .circle(this.position(), this.radius());
      if (this.doFill()) {
        this.context().fill();
      }
      if (this.doStroke()) {
        this.context().stroke();
      }
    });
  }

  M.addGetterSetters(Circle.prototype, ['context', 'location', 'radius', 'fillStyle', 'strokeStyle', 'doFill', 'doStroke', 'lineWidth', 'position']);

  $.extend(Circle.prototype, {
    draw: draw
  });

  Circle.draw = function (options) {
    new Circle(options).draw();
  };
  M.draw.Circle = Circle;
})(window.Mapstuck, jQuery);
