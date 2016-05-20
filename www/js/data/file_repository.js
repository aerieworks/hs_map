'use strict';
(function (M, $) {
  var logger = new M.Logger('M.data.FileRepository');

  function FileRepository(env, model) {
    M.data.Repository.call(this, env, model);
    this.keyPrefix = model.name;
    this.nextIdKey = buildKey(this.keyPrefix, '__nextId');
  }

  function fileReader_abort() {
    logger.error('Unable to load file "' + this.file.name + '", load aborted.');
  }

  function fileReader_error() {
    logger.error('Unable to load file "' + this.file.name + '", an error occurred:', this.reader.error);
  }

  function fileReader_load() {
    logger.debug('Loaded ' + reader.result.length + ' characters from "' + file.name + '"');
    me.itemList = JSON.parse(reader.result);
    me.itemMap = {};
    for (var i = 0; i < this.itemList.length; i++) {
      me.itemMap[me.itemList[i].id] = me.itemList[i];
    }
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

  function setDataSource(file) {
    this.file = file;
    this.reader = new FileReader();
    this.reader.addEventListener('abort', fileReader_abort.bind(this));
    this.reader.addEventListener('error', fileReader_error.bind(this));
    this.reader.addEventListener('load', fileReader_load.bind(this));
    this.reader.readAsText(file);
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

  FileRepository.prototype = $.extend(new M.data.Repository(), {
    acquireNextId: acquireNextId,
    getAllIds: getAllIds,
    getFromRepository: getFromRepository,
    saveToRepository: saveToRepository
  });

  M.data.FileRepository = FileRepository;
})(window.Mapstuck, jQuery);
