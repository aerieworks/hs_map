'use strict';
(function (M, $) {
  function EntityEditorDialog(env, control, model) {
    M.ui.Editor.call(this, control, model);
    this.repo = env[M.toPluralProperty(model.name)];
    this.control.dialog({
      autoOpen: false,
      modal: true,
      width: 'auto',
      buttons: [
        { text: 'Cancel', click: onCancelClicked.bind(this) },
        { text: 'Save', click: onOkClicked.bind(this) }
      ],
      close: onClosed.bind(this)
    });
  }

  function onClosed() {
    this.instance = null;
  }

  function onCancelClicked() {
    this.control.dialog('close');
  }

  function onOkClicked() {
    saveInstance.call(this);
    this.control.dialog('close');
  }

  function edit(instance) {
    M.ui.Editor.prototype.edit.apply(this, arguments);
    var title = (instance ? 'Edit' : 'Add') + ' ' + M.toFriendlyName(this.model.name);
    this.control
      .dialog('option', 'title', title)
      .dialog('open');
  }

  function save() {
    var result = M.ui.Editor.prototype.edit.apply(this, arguments);
    if (result === undefined) {
      return undefined;
    }

    this.repo.save(this.instance);
    return this.instance;
  }

  EntityEditorDialog.prototype = Object.create(M.ui.Editor.prototype, {
    edit: edit
  });
  EntityEditorDialog.prototype.constructor = M.ui.EditorDialog;

  M.ui.EntityEditorDialog = EntityEditorDialog;
})(window.Mapstuck, jQuery);
