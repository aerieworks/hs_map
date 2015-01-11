(function (M, $) {
  function Thing(model) {
    $.extend(this, model);
    Thing.cache.put(this);
  }

  Thing.cache = new M.Cache();

  M.models.Thing = Thing;
})(window.Mapstuck, jQuery);

