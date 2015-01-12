(function (M, $) {
  var rgbaRegex = new RegExp('^rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*(1(?:\\.0)?|0|0?\\.\\d+))?\\)$');
  var hexRegex = new RegExp('^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$');
  var namedColors = {
    black: [0x00, 0x00, 0x00], silver: [0xc0, 0xc0, 0xc0], gray: [0x80, 0x80, 0x80],
    white: [0xff, 0xff, 0xff], maroon: [0x80, 0x00, 0x00], red: [0xff, 0x00, 0x00],
    purple: [0x80, 0x00, 0x80], fuchsia: [0xff, 0x00, 0xff], green: [0x00, 0x80, 0x00],
    lime: [0x00, 0xff, 0x00], olive: [0x80, 0x80, 0x00], yellow: [0xff, 0xff, 0x00],
    navy: [0x00, 0x00, 0x80], blue: [0x00, 0x00, 0xff], teal: [0x00, 0x80, 0x80],
    aqua: [0x00, 0xff, 0xff], aliceblue: [0xf0, 0xf8, 0xff], antiquewhite: [0xfa, 0xeb, 0xd7],
    aqua: [0x00, 0xff, 0xff], aquamarine: [0x7f, 0xff, 0xd4], azure: [0xf0, 0xff, 0xff],
    beige: [0xf5, 0xf5, 0xdc], bisque: [0xff, 0xe4, 0xc4], black: [0x00, 0x00, 0x00],
    blanchedalmond: [0xff, 0xeb, 0xcd], blue: [0x00, 0x00, 0xff], blueviolet: [0x8a, 0x2b, 0xe2],
    brown: [0xa5, 0x2a, 0x2a], burlywood: [0xde, 0xb8, 0x87], cadetblue: [0x5f, 0x9e, 0xa0],
    chartreuse: [0x7f, 0xff, 0x00], chocolate: [0xd2, 0x69, 0x1e], coral: [0xff, 0x7f, 0x50],
    cornflowerblue: [0x64, 0x95, 0xed], cornsilk: [0xff, 0xf8, 0xdc], crimson: [0xdc, 0x14, 0x3c],
    cyan: [0x00, 0xff, 0xff], darkblue: [0x00, 0x00, 0x8b], darkcyan: [0x00, 0x8b, 0x8b],
    darkgoldenrod: [0xb8, 0x86, 0x0b], darkgray: [0xa9, 0xa9, 0xa9],
    darkgreen: [0x00, 0x64, 0x00], darkgrey: [0xa9, 0xa9, 0xa9], darkkhaki: [0xbd, 0xb7, 0x6b],
    darkmagenta: [0x8b, 0x00, 0x8b], darkolivegreen: [0x55, 0x6b, 0x2f],
    darkorange: [0xff, 0x8c, 0x00], darkorchid: [0x99, 0x32, 0xcc], darkred: [0x8b, 0x00, 0x00],
    darksalmon: [0xe9, 0x96, 0x7a], darkseagreen: [0x8f, 0xbc, 0x8f],
    darkslateblue: [0x48, 0x3d, 0x8b], darkslategray: [0x2f, 0x4f, 0x4f],
    darkslategrey: [0x2f, 0x4f, 0x4f], darkturquoise: [0x00, 0xce, 0xd1],
    darkviolet: [0x94, 0x00, 0xd3], deeppink: [0xff, 0x14, 0x93], deepskyblue: [0x00, 0xbf, 0xff],
    dimgray: [0x69, 0x69, 0x69], dimgrey: [0x69, 0x69, 0x69], dodgerblue: [0x1e, 0x90, 0xff],
    firebrick: [0xb2, 0x22, 0x22], floralwhite: [0xff, 0xfa, 0xf0],
    forestgreen: [0x22, 0x8b, 0x22], fuchsia: [0xff, 0x00, 0xff], gainsboro: [0xdc, 0xdc, 0xdc],
    ghostwhite: [0xf8, 0xf8, 0xff], gold: [0xff, 0xd7, 0x00], goldenrod: [0xda, 0xa5, 0x20],
    gray: [0x80, 0x80, 0x80], green: [0x00, 0x80, 0x00], greenyellow: [0xad, 0xff, 0x2f],
    grey: [0x80, 0x80, 0x80], honeydew: [0xf0, 0xff, 0xf0], hotpink: [0xff, 0x69, 0xb4],
    indianred: [0xcd, 0x5c, 0x5c], indigo: [0x4b, 0x00, 0x82], ivory: [0xff, 0xff, 0xf0],
    khaki: [0xf0, 0xe6, 0x8c], lavender: [0xe6, 0xe6, 0xfa], lavenderblush: [0xff, 0xf0, 0xf5],
    lawngreen: [0x7c, 0xfc, 0x00], lemonchiffon: [0xff, 0xfa, 0xcd],
    lightblue: [0xad, 0xd8, 0xe6], lightcoral: [0xf0, 0x80, 0x80], lightcyan: [0xe0, 0xff, 0xff],
    lightgoldenrodyellow: [0xfa, 0xfa, 0xd2], lightgray: [0xd3, 0xd3, 0xd3],
    lightgreen: [0x90, 0xee, 0x90], lightgrey: [0xd3, 0xd3, 0xd3], lightpink: [0xff, 0xb6, 0xc1],
    lightsalmon: [0xff, 0xa0, 0x7a], lightseagreen: [0x20, 0xb2, 0xaa],
    lightskyblue: [0x87, 0xce, 0xfa], lightslategray: [0x77, 0x88, 0x99],
    lightslategrey: [0x77, 0x88, 0x99], lightsteelblue: [0xb0, 0xc4, 0xde],
    lightyellow: [0xff, 0xff, 0xe0], lime: [0x00, 0xff, 0x00], limegreen: [0x32, 0xcd, 0x32],
    linen: [0xfa, 0xf0, 0xe6], magenta: [0xff, 0x00, 0xff], maroon: [0x80, 0x00, 0x00],
    mediumaquamarine: [0x66, 0xcd, 0xaa], mediumblue: [0x00, 0x00, 0xcd],
    mediumorchid: [0xba, 0x55, 0xd3], mediumpurple: [0x93, 0x70, 0xdb],
    mediumseagreen: [0x3c, 0xb3, 0x71], mediumslateblue: [0x7b, 0x68, 0xee],
    mediumspringgreen: [0x00, 0xfa, 0x9a], mediumturquoise: [0x48, 0xd1, 0xcc],
    mediumvioletred: [0xc7, 0x15, 0x85], midnightblue: [0x19, 0x19, 0x70],
    mintcream: [0xf5, 0xff, 0xfa], mistyrose: [0xff, 0xe4, 0xe1], moccasin: [0xff, 0xe4, 0xb5],
    navajowhite: [0xff, 0xde, 0xad], navy: [0x00, 0x00, 0x80], oldlace: [0xfd, 0xf5, 0xe6],
    olive: [0x80, 0x80, 0x00], olivedrab: [0x6b, 0x8e, 0x23], orange: [0xff, 0xa5, 0x00],
    orangered: [0xff, 0x45, 0x00], orchid: [0xda, 0x70, 0xd6], palegoldenrod: [0xee, 0xe8, 0xaa],
    palegreen: [0x98, 0xfb, 0x98], paleturquoise: [0xaf, 0xee, 0xee],
    palevioletred: [0xdb, 0x70, 0x93], papayawhip: [0xff, 0xef, 0xd5],
    peachpuff: [0xff, 0xda, 0xb9], peru: [0xcd, 0x85, 0x3f], pink: [0xff, 0xc0, 0xcb],
    plum: [0xdd, 0xa0, 0xdd], powderblue: [0xb0, 0xe0, 0xe6], purple: [0x80, 0x00, 0x80],
    red: [0xff, 0x00, 0x00], rosybrown: [0xbc, 0x8f, 0x8f], royalblue: [0x41, 0x69, 0xe1],
    saddlebrown: [0x8b, 0x45, 0x13], salmon: [0xfa, 0x80, 0x72], sandybrown: [0xf4, 0xa4, 0x60],
    seagreen: [0x2e, 0x8b, 0x57], seashell: [0xff, 0xf5, 0xee], sienna: [0xa0, 0x52, 0x2d],
    silver: [0xc0, 0xc0, 0xc0], skyblue: [0x87, 0xce, 0xeb], slateblue: [0x6a, 0x5a, 0xcd],
    slategray: [0x70, 0x80, 0x90], slategrey: [0x70, 0x80, 0x90], snow: [0xff, 0xfa, 0xfa],
    springgreen: [0x00, 0xff, 0x7f], steelblue: [0x46, 0x82, 0xb4], tan: [0xd2, 0xb4, 0x8c],
    teal: [0x00, 0x80, 0x80], thistle: [0xd8, 0xbf, 0xd8], tomato: [0xff, 0x63, 0x47],
    turquoise: [0x40, 0xe0, 0xd0], violet: [0xee, 0x82, 0xee], wheat: [0xf5, 0xde, 0xb3],
    white: [0xff, 0xff, 0xff], whitesmoke: [0xf5, 0xf5, 0xf5], yellow: [0xff, 0xff, 0x00],
    yellowgreen: [0x9a, 0xcd, 0x32]
  };

  function Color(src) {
    this.values = null;

    var match;
    if (typeof src.getValues == 'function') {
      this.values = src.getValues();
    } else if (typeof src == 'string' && namedColors[src.toLowerCase()]) {
      this.values = namedColors[src.toLowerCase()];
    } else if (match = rgbaRegex.exec(src)) {
      this.values = match.slice(1).map(function (x, i) {;
        return i < 3 ? parseInt(x, 10) : (x == undefined ? 1.0 : parseFloat(x));
      });
    } else if (match = hexRegex.exec(src)) {
      this.values = match.slice(1).map(function (x, i) {
        return parseInt(x + (x.length == 1 ? x : ''), 16);
      });
    } else {
      throw 'Unknown color definition: ' + JSON.stringify(src);
    }

    if (this.values.length == 3) {
      this.values.push(1.0);
    }
  }

  function getValues() {
    return this.values.slice();
  }

  function setAlpha(alpha) {
    this.values[3] = parseFloat(alpha);
    return this;
  }

  function setBlue(blue) {
    this.values[2] = parseInt(blue);
    return this;
  }

  function setGreen(green) {
    this.values[1] = parseInt(green);
    return this;
  }

  function setRed(red) {
    this.values[0] = parseInt(red);
    return this;
  }

  function toCss() {
    return 'rgba(' + this.values.join(', ') + ')';
  }

  Color.prototype = {
    getValues: getValues,
    setAlpha: setAlpha,
    setBlue: setBlue,
    setGreen: setGreen,
    setRed: setRed,
    toCss: toCss
  };

  for (var name in namedColors) {
    if (namedColors.hasOwnProperty(name)) {
      Color[name] = new Color(name);
    }
  }

  M.Color = Color;
})(window.Mapstuck, jQuery);

