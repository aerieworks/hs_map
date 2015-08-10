'use strict';
(function (M, $) {
  function EntityEditor(env, control, model) {
    this.model = model;
    this.repo = env[M.toPluralProperty(model.name)];
    this.instance = null;
    this.control = control;
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

  function saveInstance() {
    if (false !== this.validate()) {
      autoFormToInstance.call(this);
      this.formToInstance();
      this.repo.save(this.instance);
    }
  }

  function edit(instance) {
    this.instance = instance || new (this.model)();
    autoInstanceToForm.call(this);
    this.instanceToForm();
    var title = (instance ? 'Edit' : 'Add') + ' ' + M.toFriendlyName(this.model.name);
    this.control
      .dialog('option', 'title', title)
      .dialog('open');
  }

  function forEachEditorField(typeHandlers) {
    var me = this;
    $('input.editor-field', this.control).each(function (index, el) {
      var editor = $(el);
      if (editor.hasClass('editor-field-custom')) {
        return;
      }

      var handler = typeHandlers[editor.attr('type')];
      if (handler) {
        handler.call(me, editor.attr('name'), editor);
      }
    });
  }

  function autoFormToInstance() {
    forEachEditorField.call(this, {
      text:
        function (fieldName, editor) {
          this.instance[fieldName] = editor.val();
        },
      radio:
        function (fieldName, editor) {
          if (editor.attr('checked')) {
            this.instance[fieldName] = editor.val();
          }
        },
      checkbox:
        function (fieldName, editor) {
          this.instance[fieldName] = !!editor.attr('checked');
        }
    });
  }

  function autoInstanceToForm() {
    forEachEditorField.call(this, {
      text:
        function (fieldName, editor) {
          editor.val(this.instance[fieldName]);
        },
      radio:
        function (fieldName, editor) {
          editor.attr('checked', this.instance[fieldName] == editor.val());
        },
      checkbox:
        function (fieldName, editor) {
          editor.attr('checked', !!this.instance[fieldName]);
        }
    });
  }

  $.extend(EntityEditor.prototype, {
    edit: edit,
    instanceToForm: $.noop,
    formToInstance: $.noop,
    validate: $.noop
  });

  M.ui.EntityEditor = EntityEditor;
})(window.Mapstuck, jQuery);
