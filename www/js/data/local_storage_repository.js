'use strict';
(function (M, $) {
  function LocalStorageRepository(env, model) {
    M.data.Repository.call(this, env, model);
    this.keyPrefix = model.name;
    this.nextIdKey = buildKey(this.keyPrefix, '__nextId');
  }

  function acquireNextId() {
    var nextId = window.localStorage.getItem(this.nextIdKey) || 1;
    window.localStorage.setItem(this.nextIdKey, nextId + 1);
    return nextId;
  }

  function buildKey(prefix, suffix) {
    return prefix + ':' + suffix;
  }

  function saveToRepository(preppedInstance) {
    var key = buildKey(this.keyPrefix, preppedInstance.id);
    window.localStorage[key] = JSON.stringify(preppedInstance);
  }

  function getFromRepository(id) {
    var key = buildKey(this.keyPrefix, id);
    var serialized = window.localStorage[key];
    if (typeof serialized == 'string') {
      return JSON.parse(serialized);
    }

    return null;
  }

  function getAllIds() {
    var allIds = new M.Set();
    for (var i in window.localStorage) {
      if (window.localStorage.propertyIsEnumerable(i) && i.startsWith(this.keyPrefix + ':')) {
        var id = i.split(':')[1];
        if (!!parseInt(id)) {
          all.add(id);
        }
      }
    }

    return allIds;
  }

  LocalStorageRepository.prototype = $.extend(new M.data.Repository(), {
    acquireNextId: acquireNextId,
    getAllIds: getAllIds,
    getFromRepository: getFromRepository,
    saveToRepository: saveToRepository
  });

  M.data.LocalStorageRepository = LocalStorageRepository;
})(window.Mapstuck, jQuery);
