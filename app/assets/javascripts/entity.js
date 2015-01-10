jQuery(function ($) {
  function addEditor(ev) {
    console.log('Adding editor.');
    ev.preventDefault();
    var addEditorButton = $(this);
    var editorMarkup = $('<div></div>').html(addEditorButton.data('editor-content')).text();
    var mockId = addEditorButton.data('mock-id');
    console.log('Markup: ' + editorMarkup);
    console.log('Mock ID: ' + mockId);

    var id = Date.now();
    console.log('New ID: ' + id);
    addEditorButton.before(editorMarkup.replace(new RegExp(mockId, 'g'), id));
    window.Mapstuck.ui.initialize(addEditorButton.parent());
  }

  var editorAdders = $('.add-editor');
  editorAdders.bind('click', addEditor);
});
