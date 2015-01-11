(function (M, $) {
  function Event(model) {
    $.extend(this, model);
    this.experiences = [];

    var me = this;
    for (var i = 0; i < this.timeline_point_ids.length; i++) {
      M.models.TimelinePoint.cache.getWhenReady(this.timeline_point_ids[i], function (x) {
        me.experiences.push(x);
      });
    }
  }

  Event.cache = new M.Cache();

  M.models.Event = Event;
})(window.Mapstuck, jQuery);
