(function (M, $) {
  function parseArgs(args, nullValue) {
    if (args.length == 1) {
      if (typeof args[0] == 'number') {
        return { x: args[0], y: args[0] };
      } else {
        return { x: args[0].x, y: args[0].y };
      }
    } else if (args.length == 2) {
      return { x: args[0], y: args[1] };
    } else {
      return { x: nullValue, y: nullValue };
    }
  }

  function Point(/* args */) {
    $.extend(this, parseArgs(arguments));
  }

  function distance(other) {
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
  }

  function add(/* args */) {
    var values = parseArgs(arguments, 0);
    this.x += values.x;
    this.y += values.y;
    return this;
  }

  function clone() {
    return new Point(this);
  }

  function multiply(/* args */) {
    var values = parseArgs(arguments, 1);
    this.x *= values.x;
    this.y *= values.y;
    return this;
  }

  function subtract(/* args */) {
    var values = parseArgs(arguments, 1);
    this.x -= values.x;
    this.y -= values.y;
    return this;
  }

  function toString() {
    return '(' + this.x + ', ' + this.y + ')';
  }

  Point.prototype = {
    add: add,
    clone: clone,
    distance: distance,
    multiply: multiply,
    subtract: subtract,
    toString: toString
  };

  M.Point = Point;
})(window.Mapstuck, jQuery);
