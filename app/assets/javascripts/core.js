(function ($) {
  var dynamicControls = {};

  function registerDynamicControl(type, fn) {
    dynamicControls[type] = fn;
  }

  function initializeUi(root) {
    $('.dynamic-control', root).each(function (index, el) {
      var node = $(el);
      if (!node.data('control-bound')) {
        var type = node.data('control-type');
        if (dynamicControls[type]) {
          console.log('Binding ' + node.prop('id') + ' as ' + type);
          dynamicControls[type](node);
          node.data('control-bound', true);
        }
      }
    });
  }

  window.Mapstuck = {
    ui: {
      registerControl: registerDynamicControl,
      initialize: initializeUi
    }
  };
})(jQuery);
jQuery(function ($) {
  window.Mapstuck.ui.initialize($('body'));
});
