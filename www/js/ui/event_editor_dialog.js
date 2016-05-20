'use strict';
(function (M, $) {
  function EventEditorDialog(env, control) {
    M.ui.EntityEditorDialog.call(this, env, control, M.models.Event);
    this.txtDescription = $('.field-description', control);
  }

  EventEditorDialog.prototype = Object.create(M.ui.EntityEditorDialog.prototype);
  EventEditorDialog.prototype.constructor = M.ui.EntityEditorDialog;
  M.ui.EventEditorDialog = EventEditorDialog;
})(window.Mapstuck, jQuery);

