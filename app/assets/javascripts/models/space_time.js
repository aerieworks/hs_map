(function (M, $) {
  function SpaceTime(model) {
    $.extend(this, model);
    SpaceTime.cache.put(this);
  }

  SpaceTime.cache = new M.Cache();

  M.models.SpaceTime = SpaceTime;
})(window.Mapstuck, jQuery);

