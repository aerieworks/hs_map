(function (M, $) {
  function Event(model) {
    $.extend(this, model);
    this.experiences = [];
  }

  Event.onLoad = {
    experiences:
      function () {
        for (var i = 0; i < this.experiences.length; i++) {
          this.experiences[i].events.push(this);
        }
      }
  };

  M.models.Event = Event;
})(window.Mapstuck, jQuery);
