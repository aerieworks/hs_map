(function (M, $) {
  function TimelinePoint(model) {
    $.extend(this, model);
    this.row = null;
    this.column = null;
    this.characterOrObjectCount = null;
    this.events = [];
  }

  TimelinePoint.onLoad = {
    whereAndWhen:
      function () {
        if (this.whereAndWhen != null) {
          this.whereAndWhen.contents.add(this);
        }
      },
    previous:
      function () {
        if (this.previous == null) {
          this.timeline.start = this;
      }
    }
  };


  function getColumn() {
    if (this.column == null) {
      var line;
      if (this.whenAndWhere) {
        line = this.whenAndWhere.timeline;
        this.column = this.whenAndWhere.getColumn();
      } else {
        line = M.models.Timeline.cache.get(null);
        this.column = 0;
      }

      var offset = line.getColumnAssignment(this);
      if (offset == null) {
        this.column = this.previous.getColumn();
      } else {
        this.column += offset;
      }
    }

    return this.column;
  }

  function getRow() {
    if (this.row == null) {
      if (this.whenAndWhere) {
        this.row = this.whenAndWhere.getRow();
      } else if (this.when_and_where_id == null) {
        if (this.previous_id == null || (this.previous && this.previous.when_and_where_id != null)) {
          // In the void, all timelines start at 0.
          this.row = 0;
        } else if (this.previous && this.previous.when_and_where_id == null) {
          var prevRow = this.previous.getRow();
          if (!isNaN(prevRow)) {
            // In the void, points immediately follow the previous point on the timeline.
            this.row = prevRow + 1;
          }
        }
      }
    }

    return this.row;
  }

  TimelinePoint.prototype = {
    getColumn: getColumn,
    getRow: getRow
  };

  M.models.TimelinePoint = TimelinePoint;
})(window.Mapstuck, jQuery);

