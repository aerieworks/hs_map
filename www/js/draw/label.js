(function (M, $) {
  var defaults = {
    doFill: true,
    doStroke: false
  };

  function Label(options) {
    M.extend(this, defaults, options);
  }

  function draw() {
    this.context().batch(this, function () {
      this.context().font(this.font(), true)
        .textAlign(this.textAlign(), true)
        .textBaseline(this.textBaseline(), true);
      if (this.doFill()) {
        this.context().fillStyle(this.fillStyle(), true)
          .fillText(this.text(), this.position());
      }
      if (this.doStroke()) {
        this.context().strokeStyle(this.strokeStyle, true)
          .lineWidth(this.lineWidth(), true)
          .strokeText(this.text(), this.position());
      }
    });
  }

  M.addGetterSetters(Label.prototype, ['context', 'font', 'textAlign', 'textBaseline', 'fillStyle', 'strokeStyle', 'lineWidth', 'doFill', 'doStroke', 'text', 'position']);

  $.extend(Label.prototype, {
    draw: draw
  });

  Label.draw = function (options) {
    (new Label(options)).draw();
  };

  M.draw.Label = Label;
})(window.Mapstuck, jQuery);
