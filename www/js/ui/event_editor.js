'use strict';
(function (M, $) {
  function EventEditor(env, control) {
    M.ui.EntityEditor.call(this, env, control, M.models.Event);
    this.txtDescription = $('.field-description', control);
  }

  EventEditor.prototype = Object.create(M.ui.EntityEditor.prototype);
  EventEditor.prototype.constructor = M.ui.EntityEditor;
  M.ui.EventEditor = EventEditor;
})(window.Mapstuck, jQuery);

