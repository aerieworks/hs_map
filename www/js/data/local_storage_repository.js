'use strict';
(function (M, $) {
  function LocalStorageRepository(env, model) {
    this.env = env;
    this.model = model;
    this.cache = new M.Cache();
    this.keyPrefix = model.name;
    this.nextId = window.localStorage[buildKey(this.keyPrefix, '__nextId')] || 1;
  }

  function buildKey(prefix, suffix) {
    return prefix + ':' + suffix;
  }

  function loadRelation(obj, prop) {
    var repoName = M.toPluralProperty(obj[prop].__type.name);
    var repo = this.env[repoName];

    repo.cache.getWhenReady(obj[prop].id, function (x) {
      obj[prop] = x;
    });

    repo.get(obj[prop].id);
  }

  function callOnLoad(obj, prop) {
    if (obj.onLoad && obj.onLoad[prop]) {
      obj.onLoad[prop].call(obj);
    }
  }

  function isModelInstance(obj) {
    return typeof obj == 'object' && obj != null && obj['__loaded'];
  }

  function isCleanInstance(obj) {
    return typeof obj == 'object' && obj != null && typeof obj['__type'] == 'string';
  }

  function toCleanVersion(obj) {
    return { id: obj.id, __type: obj.constructor.name };
  }

  function serialize(obj) {
    var cleaned = {};
    for (var prop in obj) {
      if (obj.propertyIsEnumerable(prop) && prop != '__loaded') {
        if (isModelInstance(obj[prop])) {
          cleaned[prop] = toCleanVersion(obj[prop]);
        } else if (typeof obj[prop] != 'string' && obj[prop].hasOwnProperty('length')
            && obj[prop].length > 0 && isModelInstance(obj[prop][0])) {
          cleaned[prop] = [];
          for (var i = 0; i < obj[prop].length; i++) {
            cleaned[prop].push(toCleanVersion(obj[prop][i]));
          }
        } else {
          cleaned[prop] = obj[prop];
        }
      }
    }

    return JSON.stringify(cleaned);
  }

  function save(instance) {
    if (instance.id == null) {
      instance.id = this.nextId;
      this.nextId += 1;
      window.localStorage[buildKey(this.getPrefix, '__nextId')] = this.nextId;
    }
    var serialized = serialize.call(this, instance);
    var key = buildKey(this.keyPrefix, instance.id);
    window.localStorage[key] = serialized;
    this.cache.put(instance.id, instance);
    instance.__loaded = true;
  }

  function get(id) {
    var instance = this.cache.get(id);
    if (instance === undefined) {
      var key = buildKey(this.keyPrefix, id);
      var serialized = window.localStorage[key];
      if (typeof serialized == 'string') {
        var deserialized = JSON.parse(serialized);
        instance = new (this.model)(deserialized);
        instance.__loaded = true;
        this.cache.put(id, instance);
        console.log('Loaded ' + this.model.name + ': ', instance);
        for (var prop in instance) {
          if (instance.propertyIsEnumerable(prop)) {
            if (isCleanInstance(instance[prop])) {
              loadRelation.call(this, instance, prop);
            } else if ($.isArray(instance[prop]) && isCleanInstance(instance[prop][0])) {
              for (var i = 0; i < instance[prop].length; i++) {
                loadRelation.call(this, instance[prop], i);
              }
            } else {
              callOnLoad(instance, prop);
            }
          }
        }
      }
    }

    return instance;
  }

  function getAll() {
    var all = new M.Set();
    for (var i in window.localStorage) {
      if (window.localStorage.propertyIsEnumerable(i) && i.startsWith(this.keyPrefix + ':')) {
        all.add(this.get(i.split(':')[1]));
      }
    }

    return all;
  }

  $.extend(LocalStorageRepository.prototype, {
    get: get,
    getAll, getAll,
    save: save
  });

  M.data.LocalStorageRepository = LocalStorageRepository;
})(window.Mapstuck, jQuery);
