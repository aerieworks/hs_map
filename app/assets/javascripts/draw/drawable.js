(function (M, $) {

  function Drawable(options) {
    M.extend(this, options);
  }

  M.addGetterSetters(Drawable.prototype, ['context', 'location']);

  M.draw.Drawable = Drawable;
})(window.Mapstuck, jQuery);

