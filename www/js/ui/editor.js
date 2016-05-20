'use strict';
(function (M, $) {
  function Editor(control, model) {
    this.model = model;
    this.instance = null;
    this.control = control;
  }

  function autoFormToInstance() {
    var me = this;
    $('input.editor-field', this.control).each(function (index, el) {
      var editor = $(el);
      if (editor.data('editor')) {
        me.instance[fieldName] = editor.data('editor').getInstance();
        return;
      }

      var fieldName = editor.attr('name');
      var type = editor.attr('type');
      if (type == 'text') {
        me.instance[fieldName] = editor.val();
      } else if (type == 'radio') {
        if (editor.attr('checked')) {
          me.instance[fieldName] = editor.val();
        }
      } else if (type == 'checkbox') {
        me.instance[fieldName] = !!editor.attr('checked');
      }
    });
  }

  function autoInstanceToForm() {
    var me = this;
    $('input.editor-field', this.control).each(function (index, el) {
      var editor = $(el);
      if (editor.data('editor')) {
        editor.data('editor').setInstance(me.instance[fieldName]);
        return;
      }

      var fieldName = editor.attr('name');
      var type = editor.attr('type');
      if (type == 'text') {
        editor.val(me.instance[fieldName]);
      } else if (type == 'radio') {
        editor.attr('checked', me.instance[fieldName] == editor.val());
      } else if (type == 'checkbox') {
        editor.attr('checked', !!me.instance[fieldName]);
      }
    });
  }

  function edit(instance) {
    this.instance = instance || new (this.model)();
    autoInstanceToForm.call(this);
    this.instanceToForm();
  }

  function save() {
    if (false === this.validate()) {
      return undefined;
    }

    autoFormToInstance.call(this);
    this.formToInstance();
    return this.instance;
  }

  Editor.prototype = {
    edit: edit,
    formToInstance: $.noop,
    instanceToForm: $.noop,
    save: save,
    validate: $.noop
  };
  M.ui.Editor = Editor;
})(window.Mapstuck, jQuery);
