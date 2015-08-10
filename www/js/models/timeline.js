(function (M, $) {
  function Timeline(model) {
    $.extend(this, model);
    this.contents = new M.Set();
    this.columnAssignments = null;
    this.width = null;

    var me = this;
  }

  function getColumnAssignment(point) {
    if (this.columnAssignments == null) {
      // Calculate width to identify column assignments.
      this.getWidth();
    }

    return this.columnAssignments[point.id];
  }

  function getName() {
    return this.spaceTime.name + '!' + this.thing.name;
  }

  function getWidth() {
    if (this.columnAssignments == null) {
      this.columnAssignments = {};
    }

    if (this.width == null) {
      console.log('Computing width for ' + this.getName());
      if (!this.isLocation()) {
        // Characters and objects always occupy one column.
        this.width = 1;
      } else {
        // Calculate width based on the width of all Things that ever exist within this location.
        var nextColumn;
        if (this.id == null) {
          // Void doesn't have frames, no need to leave room for them.
          console.log('Void has no frames');
          nextColumn = 0;
          this.width = 0;
        } else {
          nextColumn = 1;
          this.width = 2;
        }
        for (var i = 0; i < this.contents.getLength(); i++) {
          var line = this.contents.get(i);
          var lineWidth = line.getWidth();
          if (line.isLocation()) {
            // Locations are assumed to only ever exist once within another location.
            // TODO: Make sure this is always the case.
            this.width += lineWidth;
            this.columnAssignments[line.start.id] = nextColumn;
            nextColumn += lineWidth;
          } else {
            // Scan the character or object's timeline to determine how many disjoint timeline
            // fragments occur within the location.  Add its width for each one.
            // TODO: Replace this with a more visual space-efficient packing of timelines.
            var p = line.start;
            var lastTime = null;
            while (p) {
              if (p.whenAndWhere && p.whenAndWhere.timeline == this) {
                if (lastTime == null || p.whenAndWhere.getRow() <= lastTime) {
                  this.width += lineWidth;
                  this.columnAssignments[p.id] = nextColumn;
                  nextColumn += lineWidth;
                }
                lastTime = p.whenAndWhere.getRow();
              } else if (lastTime != null) {
                lastTime = null;
              }
              p = p.next;
            }
          }
        }
      }
      console.log('Width for ' + this.getName() + ': ' + this.width);
      console.log('Column assignments: ' + JSON.stringify(this.columnAssignments));
    }

    return this.width;
  }

  function isLocation() {
    return this.thing.category == 'location';
  }

  Timeline.prototype = {
    getColumnAssignment: getColumnAssignment,
    getName: getName,
    getWidth: getWidth,
    isLocation: isLocation
  };

  M.models.Timeline = Timeline;
})(window.Mapstuck, jQuery);
