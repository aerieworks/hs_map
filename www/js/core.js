'use strict';
(function ($) {
  var dynamicControls = {};
  var controlInstances = [];

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

    function each(callback) {
      var isMethodName = (typeof callback == 'string');
      for (var i = 0; i < this.list.length; i++) {
        if (isMethodName) {
          this.list[i][callback].call(this.list[i]);
        } else {
          callback(i, this.list[i]);
        }
      }
    }

    function get(index) {
      return this.list[index];
    }

    function getLength() {
      return this.list.length;
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
      each: each,
      get: get,
      getLength: getLength,
      isEmpty: isEmpty,
      remove: remove
    };

    return Set;
  })();

  function addGetterSetters(proto/*, args */) {
    var fields = arguments[arguments.length - 1];
    var prefix = arguments.length > 2 ? arguments[1] : null;

    for (var i = 0; i < fields.length; i++) {
      proto[fields[i]] = buildGetterSetter(prefix, fields[i]);
    }
  }

  function addWrappers(proto, wrapped, fields) {
    for (var i = 0; i < fields.length; i++) {
      proto[fields[i]] = buildWrapper(wrapped, fields[i]);
    }
  }

  function buildGetterSetter(prefix, field) {
    if (prefix) {
      return function (value, ifNotNull) {
        if (value === undefined && !ifNotNull) {
          return this[prefix][field];
        } else if (value != null || !ifNotNull) {
          this[prefix][field] = value;
        }
        return this;
      };
    } else {
      return function (value, ifNotNull) {
        if (value === undefined && !ifNotNull) {
          return this['_' + field];
        } else if (value != null || !ifNotNull) {
          this['_' + field] = value;
        }
        return this;
      };
    }
  }

  function buildWrapper(wrapped, field) {
    return function (/* args */) {
      var wrappedObject = typeof wrapped == 'string' ? this[wrapped] : wrapped;
      var result = wrappedObject[field].apply(wrappedObject, arguments);
      return (result === undefined ? this : result);
    };
  }

  function extend(object/*, args */) {
    var properties = {};
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      if (source != null) {
        for (var key in source) {
          if (source.hasOwnProperty(key)) {
            properties[key] = source[key];
          }
        }
      }
    }
    for (var key in properties) {
      if (properties.hasOwnProperty(key)) {
        if (typeof object[key] == 'function') {
          object[key].call(object, properties[key]);
        }
      }
    }
  }

  function toFriendlyName(name) {
    return name.replace(/[a-z][A-Z]/, function (x) {
      return x.charAt(0) + ' ' + x.charAt(1);
    });
  }

  function toPluralProperty(name) {
    return name.charAt(0).toLowerCase() + name.substring(1) + 's';
  }

  function registerDynamicControl(fn) {
    dynamicControls[fn.name] = fn;
  }

  function initialize(env, root) {
    initializeUi(env, root || $('body'));
  }

  function initializeUi(env, root) {
    $('.dynamic-control', root).each(function (index, el) {
      var node = $(el);
      if (!node.data('control-bound')) {
        var type = node.data('control-type');
        if (dynamicControls[type]) {
          var id = node.prop('id');
          console.log('Binding ' + id + ' as ' + type);
          controlInstances.push(new dynamicControls[type](env, node));
          node.data('control-bound', true);
        }
      }
    });
  }

  function parseScalar(value) {
    if (typeof value != 'string' && typeof value.length != 'undefined') {
      return value.length > 0 ? value[0] : null;
    } else {
      return value;
    }
  }

  window.Mapstuck = {
    Set: Set,
    addGetterSetters: addGetterSetters,
    addWrappers: addWrappers,
    data: {},
    draw: {},
    extend: extend,
    models: {},
    parseScalar: parseScalar,
    initialize: initialize,
    toFriendlyName: toFriendlyName,
    toPluralProperty: toPluralProperty,
    ui: {
      registerControl: registerDynamicControl
    }
  };
})(jQuery);
