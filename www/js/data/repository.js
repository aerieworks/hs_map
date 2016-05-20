'use strict';
(function (M, $) {
  function Repository(env, model) {
    this.env = env;
    this.model = model;
    this.cache = new M.Cache();
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

  function prepForSerialization(obj) {
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

    return cleaned;
  }

  function save(instance) {
    if (instance.id == null) {
      instance.id = this.acquireNextId();
    }
    var prepped = prepForSerialization.call(this, instance);
    this.saveToRepository(prepped);
    this.cache.put(instance.id, instance);
    instance.__loaded = true;
  }

  function get(id) {
    var instance = this.cache.get(id);
    if (instance === undefined) {
      var loaded = this.getFromRepository(id);
      if (typeof loaded == 'object' && loaded != null) {
        instance = new (this.model)(loaded);
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
    this.getAllIds().each(function (id) {
      all.add(this.get(id));
    });

    return all;
  }

  $.extend(Repository.prototype, {
    acquireNextId: M.virtualStub,
    get: get,
    getAll, getAll,
    getAllIds: M.virtualStub,
    getFromRepository: M.virtualStub,
    save: save,
    saveToRepository: M.virtualStub
  });

  M.data.LocalStorageRepository = LocalStorageRepository;
})(window.Mapstuck, jQuery);

