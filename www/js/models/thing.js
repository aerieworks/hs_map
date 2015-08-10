(function (M, $) {

  function Thing(model) {
    $.extend(this, model);
    if (this.color) {
      this.color = new M.draw.Color(this.color);
    }
  }

  M.models.Thing = Thing;
})(window.Mapstuck, jQuery);

