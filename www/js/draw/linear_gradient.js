(function (M, $) {

  function LinearGradient() {
    this.colorStops = [];
  }

  function toStyle(context) {
    var loc = this.location();
    if (loc == null) {
      loc = new M.Point(0, 0);
    }
    var width = this.width() || 0;
    var height = this.width() || 0;
    var grad = context.createLinearGradient(loc.x, loc.y, loc.x + width, loc.y + height);
    for (var i = 0; i < this.colorStops.length; i++) {
      grad.addColorStop(this.colorStops[i].percent, this.colorStops[i].color.toCss());
    }
    return grad;
  }

  function addColorStop(percent, color) {
    this.colorStops.push({ percent: percent, color: color });
    return this;
  }

  function location(point) {
    if (arguments.length == 0) {
      return this._point;
    } else if (arguments.length == 2) {
      point = new M.Point(arguments[0], arguments[1]);
    }
    this._point = point;
    return this;
  }

  LinearGradient.prototype = {
    addColorStop: addColorStop,
    location: location,
    toStyle: toStyle
  };

  M.addGetterSetters(LinearGradient.prototype, ['width', 'height']);
  M.draw.LinearGradient = LinearGradient;
})(window.Mapstuck, jQuery);

