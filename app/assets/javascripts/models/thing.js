(function (M, $) {

  function Thing(model) {
    $.extend(this, model);
    if (this.color) {
      this.color = new M.draw.Color(this.color);
    }
    Thing.cache.put(this);
  }

  Thing.cache = new M.Cache();

  M.models.Thing = Thing;
})(window.Mapstuck, jQuery);

