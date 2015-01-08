(function (M, $) {
  function ajaxErrorHandler(jqXHR, textStatus, errorThrown) {
    console.log('AJAX error: ' + textStatus + '; ' + errorThrown);
    console.log(jqXHR);
  }

  function getTimeline(instanceId, success, error) {
    var errorHandlers = [ ajaxErrorHandler ];
    if (error) {
      errorHandlers.push(error);
    }

    $.ajax('/timelines/' + instanceId, {
      dataType: 'json',
      error: errorHandlers,
      success: success
    });
  }

  function updatePointSelector(ev) {
    var selector = ev.data.pointSelector;
    var instanceId = selector.data('instanceSelector').val();
    selector.prop('disabled', true).empty();
    if (instanceId != null && instanceId != '') {
      getTimeline(instanceId,
        function success(points) {
          if (points.length == 0) {
            selector.append($('<option>empty timeline</option>'));
          } else {
            for (var i = 0; i < points.length; i++) {
              var point = points[i];
              selector.append($('<option></option>').val(point.id).text(point.description));
            }
            selector.prop('disabled', false);
          }
        }
      );
    }
  }

  function bindTimelinePointSelector(selector, options) {
    var pointSelector = $(selector);
    var instanceSelector = $(options.instanceSelector);
    pointSelector.data('instanceSelector', instanceSelector);
    instanceSelector.on('change', { pointSelector: pointSelector }, updatePointSelector);
  }

  M.Timelines = {
    get: getTimeline
  };

  M.Timelines.ui = {
    selector: bindTimelinePointSelector
  };
})(window.Mapstuck, jQuery);
