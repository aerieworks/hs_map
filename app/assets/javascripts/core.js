(function ($) {
  var dynamicControls = {};

  var Set = (function () {
    function Set(contents, keyName) {
      this.keyName = keyName || 'id';
      this.list = [];
      this.map = {};
      addAll.call(this, contents);
    }

    function addAll(list) {
      if (list != null) {
        for (var i = 0; i < list.length; i++) {
          this.add(list[i]);
        }
      }
    }

    function add(o) {
      var key = o[this.keyName];
      if (this.map[key] == null) {
        this.list.push(o);
        this.map[key] = o;
      }
    }

    function isEmpty() {
      return this.list.length == 0;
    }

    function remove(o) {
      var index = this.list.indexOf(o);
      if (index >= 0) {
        var key = o[this.keyName];
        delete this.map[key];
        this.list.splice(index, 1);
      }
    }

    Set.prototype = {
      add: add,
      addAll: addAll,
      isEmpty: isEmpty,
      remove: remove
    };

    return Set;
  })();

  function registerDynamicControl(type, fn) {
    dynamicControls[type] = fn;
  }

  function initializeUi(root) {
    $('.dynamic-control', root).each(function (index, el) {
      var node = $(el);
      if (!node.data('control-bound')) {
        var type = node.data('control-type');
        if (dynamicControls[type]) {
          var id = node.prop('id');
          console.log('Binding ' + id + ' as ' + type);

          if (Mapstuck.data.hasOwnProperty(id)) {
            node.data(Mapstuck.data[id]);
          }

          dynamicControls[type](node);
          node.data('control-bound', true);
        }
      }
    });
  }

  window.Mapstuck = {
    Set: Set,
    data: {},
    ui: {
      registerControl: registerDynamicControl,
      initialize: initializeUi
    }
  };
})(jQuery);
jQuery(function ($) {
  window.Mapstuck.ui.initialize($('body'));
});
