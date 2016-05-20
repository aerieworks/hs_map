'use strict';
(function (M, $) {
  function TimelinePointSelector(env, control, model) {
    //Editor.
  }

  function setInstance(instance) {
    this.instance = instance;
  }

  function getInstance() {
    return this.instance;
  }

  TimelinePointSelector.prototype = {
    setInstance: setInstance,
    getInstance: getInstance
  };

  M.ui.TimelinePointSelector = TimelinePointSelector;
})(window.Mapstuck, jQuery);
