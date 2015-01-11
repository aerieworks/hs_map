(function (M, $) {

  function Cache() {
    this.items = {};
    this.callbacks = {};
  }

  function get(id) {
    return this.items[id];
  }

  function getWhenReady(id, callback) {
    if (this.items[id]) {
      callback(this.items[id]);
    } else {
      if (!this.callbacks[id]) {
        this.callbacks[id] = [];
      }
      this.callbacks[id].push(callback);
    }
  }

  function put(item) {
    this.items[item.id] = item;
    if (this.callbacks[item.id]) {
      var callbacks = this.callbacks[item.id];
      delete this.callbacks[item.id];
      for (var i = 0; i < callbacks.length; i++) {
        callbacks[i](item);
      }
    }
  }

  function each(callback) {
    for (var key in this.items) {
      if (!this.items.hasOwnProperty(key)) {
        continue;
      }
      callback(key, this.items[key]);
    }
  }

  Cache.prototype = {
    get: get,
    getWhenReady: getWhenReady,
    each: each,
    put: put
  };

  M.Cache = Cache;
})(window.Mapstuck, jQuery);
