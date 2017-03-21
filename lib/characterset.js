(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.CharacterSet = factory();
    }
}(this, function () {
  /**
   * @constructor
   * @struct
   * @param {number|string|CharacterSet.Range} input
   */
  function CharacterSet(input) {
    /**
     * @type {Object.<number, boolean>}
     */
    this.data = {};

    /**
     * @type {number}
     */
    this.size = 0;

    if (typeof input === 'string') {
      for (var i = 0; i < input.length; i += 1) {
        var codePoint = input.charCodeAt(i);

        if ((codePoint & 0xF800) === 0xD800 && i < input.length) {
          var nextCodePoint = input.charCodeAt(i + 1);
          if ((nextCodePoint & 0xFC00) === 0xDC00) {
            this.add(((codePoint & 0x3FF) << 10) + (nextCodePoint & 0x3FF) + 0x10000);
          } else {
            this.add(codePoint);
          }
          i += 1;
        } else {
          this.add(codePoint);
        }
      }
    } else if (typeof input === 'number') {
      this.add(input);
    } else if (Array.isArray(input)) {
      input = this.expandRange(input);

      for (var i = 0; i < input.length; i += 1) {
        this.add(input[i]);
      }
    }
  }

  /**
   * @typedef {Array.<number|Array.<number>>}
   */
  CharacterSet.Range;

  /**
   * @return {number}
   */
  CharacterSet.prototype.getSize = function () {
    return this.size;
  };

  /**
   * @private
   * @param {CharacterSet.Range} range
   * @return {Array.<number>}
   */
  CharacterSet.prototype.expandRange = function (range) {
    var result = [];

    for (var i = 0; i < range.length; i += 1) {
      if (Array.isArray(range[i])) {
        for (var j = range[i][0]; j < range[i][1] + 1; j += 1) {
          result.push(j);
        }
      } else {
        result.push(range[i]);
      }
    }

    return result;
  };

  /**
   * @private
   * @param {Array.<number>} codePoints
   * @return {CharacterSet.Range}
   */
  CharacterSet.prototype.compressRange = function (codePoints) {
    var result = [];

    for (var i = 0; i < codePoints.length; i += 1) {
      var previous = (i > 0) ? codePoints[i - 1] : null,
          next = (i < codePoints.length - 1) ? codePoints[i + 1] : null,
          current = codePoints[i];

      if ((current - 1 !== previous || previous === null) &&
          (current + 1 !== next || next === null)) {
        result.push(current);
      } else if ((current - 1 !== previous || previous === null) &&
                 (current + 1 === next || next === null)) {
        result.push(current);
      } else if ((current - 1 === previous || previous === null) &&
                 (current + 1 !== next || next === null)) {

        // Don't bother collapsing the range if the range only consists of two adjacent code points
        if (current - result[result.length - 1] > 1) {
          result[result.length - 1] = [result[result.length - 1], current];
        } else {
          result.push(current);
        }
      }
    }

    return result;
  };

  /**
   * @return {Array.<number>} Returns the code points in this set as an array.
   */
  CharacterSet.prototype.toArray = function () {
    var result = [];

    for (var codePoint in this.data) {
      if (this.data.hasOwnProperty(codePoint) && this.data[codePoint] === true) {
        result.push(parseInt(codePoint, 10));
      }
    }

    result.sort(function (a, b) {
      return a - b;
    });

    return result;
  };

  /**
   * @return {CharacterSet.Range}
   */
  CharacterSet.prototype.toRange = function () {
    return this.compressRange(this.toArray());
  };

  /**
   * @return {boolean} True if this set is empty.
   */
  CharacterSet.prototype.isEmpty = function () {
    return this.size === 0;
  };

  /**
   * @param {...number} var_args The code point to add to this set.
   */
  CharacterSet.prototype.add = function (var_args) {
    for (var i = 0; i < arguments.length; i += 1) {
      var codePoint = arguments[i];

      if (this.data[codePoint] !== true) {
        this.data[codePoint] = true;
        this.size += 1;
      }
    }
  };

  /**
   * @param {...number} var_args The code point to remove from this set.
   */
  CharacterSet.prototype.remove = function (var_args) {
    for (var i = 0; i < arguments.length; i += 1) {
      var codePoint = arguments[i];

      if (this.data[codePoint] === true) {
        this.data[codePoint] = false;
        this.size -= 1;
      }
    }
  };

  /**
   * @param {number} codePoint
   * @return {boolean} True if the code point is in this set.
   */
  CharacterSet.prototype.contains = function (codePoint) {
    return this.data[codePoint] === true;
  };

  /**
   * @param {CharacterSet} other
   * @return {boolean} True if this character set matches other.
   */
  CharacterSet.prototype.equals = function (other) {
    var codePoints = this.toArray();

    if (this.getSize() === other.getSize()) {
      for (var i = 0; i < codePoints.length; i += 1) {
        if (!other.contains(codePoints[i])) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  };

  /**
   * @param {CharacterSet} other
   * @return {CharacterSet} The combined code points of both character sets.
   */
  CharacterSet.prototype.union = function (other) {
    return new CharacterSet(this.toArray().concat(other.toArray()));
  };

  /**
   * @param {CharacerSet} other
   * @return {CharacterSet} A set containing only those code points both sets have in common.
   */
  CharacterSet.prototype.intersect = function (other) {
    var result = new CharacterSet(),
        codePoints = this.toArray();

    for (var i = 0; i < codePoints.length; i += 1) {
      if (other.contains(codePoints[i])) {
        result.add(codePoints[i]);
      }
    }

    return result;
  };

  /**
   * @param {CharacterSet} other
   * @return {CharacterSet} A set containing only those code points that are not in `other`.
   */
  CharacterSet.prototype.difference = function (other) {
    var result = new CharacterSet(),
        codePoints = this.toArray();

    for (var i = 0; i < codePoints.length; i += 1) {
      if (!other.contains(codePoints[i])) {
        result.add(codePoints[i]);
      }
    }

    return result;
  };

  /**
   * @param {CharacterSet} other
   * @return true if this is a subset of `other`
   */
  CharacterSet.prototype.subset = function (other) {
    var codePoints = this.toArray();

    for (var i = 0; i < codePoints.length; i += 1) {
      if (!other.contains(codePoints[i])) {
        return false;
      }
    }
    return true;
  };

  /**
   * @private
   * @param {number} codePoint
   * @return {number} The high surrogate for this code point.
   */
  CharacterSet.prototype.extractHighSurrogate = function (codePoint) {
    return Math.floor((codePoint - 0x10000) / 0x400) + 0xD800;
  };

  /**
   * @private
   * @param {number} codePoint
   * @return {number} The low surrogate for this code point.
   */
  CharacterSet.prototype.extractLowSurrogate = function (codePoint) {
    return (codePoint - 0x10000) % 0x400 + 0xDC00;
  };

  /**
   * @private
   * @param {number} codePoint The code point to encode
   * @return {string}
   */
  CharacterSet.prototype.encodeCodePoint = function (codePoint) {
    if ((codePoint >= 0x41 && codePoint <= 0x5A) || // A-Z
        (codePoint >= 0x61 && codePoint <= 0x7A) || // a-z
        (codePoint >= 0x30 && codePoint <= 0x39)) { // 0-9
      return String.fromCharCode(codePoint);
    } else if (codePoint <= 0xFFFF) {
      return '\\u' + (codePoint + 0x10000).toString(16).substr(-4).toUpperCase();
    } else {
      return this.encodeCodePoint(this.extractHighSurrogate(codePoint)) +
             this.encodeCodePoint(this.extractLowSurrogate(codePoint));
    }
  };

  /**
   * @return {string} A regular expression that can be used to match or test
   * this character set. The regular expression is returned as a string so
   * that the user can set flags and add capturing groups.
   *
   * Thanks to: http://inimino.org/~inimino/blog/javascript_cset for the
   * inspiration for this function.
   */
  CharacterSet.prototype.toRegExp = function () {
    var codePoints = this.toArray(),
        bmp = new CharacterSet(),
        surrogates = new CharacterSet(),
        highSurrogates = {},
        lowSurrogates = {},
        result = [];

    // Go through all the code points and split them into BMP code points,
    // code points in the surrogate range, and surrogate pairs.
    for (var i = 0; i < codePoints.length; i += 1) {
      if (codePoints[i] >= 0xD8000 && codePoints[i] <= 0xDBFF) {
        surrogates.add(codePoints[i]);
      } else if (codePoints[i] <= 0xFFFF) {
        bmp.add(codePoints[i]);
      } else {
        // We calculate the high and low surrogate code point for
        // each code point outside the BMP.
        var highSurrogate = this.extractHighSurrogate(codePoints[i]),
            lowSurrogate = this.extractLowSurrogate(codePoints[i]);

        if (!highSurrogates.hasOwnProperty(highSurrogate)) {
          highSurrogates[highSurrogate] = new CharacterSet();
        }
        // Store all low surrogate code points for each high code point.
        // This creates a mapping from high code points to matching low
        // code points.
        //
        // {
        //    103849: [104499, 189548, 103478],
        //    103478: [102819],
        //    120928: [104499, 189548, 103478]
        //    ...
        // }
        highSurrogates[highSurrogate].add(lowSurrogate);
      }
    }

    for (var highSurrogate in highSurrogates) {
      var lowSurrogateSet = highSurrogates[highSurrogate],
          lowSurrogateKey = lowSurrogateSet.toRangeString();

      // Make a unique set of low surrogates and their matching
      // high surrogate points
      // {
      //   '[103478,104499,189548]': [103849, 120928],
      //   '[102819]': [103478],
      //   ...
      // }
      if (!lowSurrogates.hasOwnProperty(lowSurrogateKey)) {
        lowSurrogates[lowSurrogateKey] = new CharacterSet();
      }

      lowSurrogates[lowSurrogateKey].add(parseInt(highSurrogate, 10));
    }

    if (!bmp.isEmpty()) {
      result.push(bmp.toRangeString());
    }

    for (var lowSurrogateRange in lowSurrogates) {
      // Combine the low and high surrogate sets into
      // a single group.
      //
      // [103849,120928][103478,104499,189548]
      // 103478[102819]
      var highSurrogateSet = lowSurrogates[lowSurrogateRange];
      result.push(highSurrogateSet.toRangeString() + lowSurrogateRange);
    }

    if (!surrogates.isEmpty()) {
      result.push(surrogates.toRangeString());
    }

    return result.join('|');
  };

  /**
   * Returns the set as a compressed code point string.
   * NOTE: this method handles code points outside
   * the BMP as if they are code points inside the BMP.
   * For a range outside the BMP it will thus return
   * four code points separated by a dash. It is up to
   * the consumer to correctly handle this case.
   *
   * @private
   * @return {string}
   */
  CharacterSet.prototype.toRangeString = function () {
    var containsRange = false,
        result = this.toRange().map(function (value) {
      if (Array.isArray(value)) {
        containsRange = true;
        return this.encodeCodePoint(value[0]) + '-' + this.encodeCodePoint(value[1]);
      } else {
        return this.encodeCodePoint(value);
      }
    }, this);

    if (result.length === 0) {
      return '';
    } else if (result.length === 1 && !containsRange) {
      return result[0];
    } else {
      return '[' + result.join('') + ']';
    }
  };

  /**
   * Returns the set as a list of comma separated hex
   * codepoints as seen in the CSS unicode-range syntax.
   *
   * @return {string}
   */
  CharacterSet.prototype.toHexString = function () {
    return this.toArray().map(function (codePoint) {
      return 'U+' + codePoint.toString(16).toUpperCase();
    }).join(',');
  };

  /**
   * Returns the set as a list of comma separated hex
   * ranges as seen in the CSS unicode-range syntax.
   *
   * @return {string}
   */
  CharacterSet.prototype.toHexRangeString = function () {
    return this.toRange().map(function (value) {
      if (Array.isArray(value)) {
        return 'U+' + value[0].toString(16).toUpperCase() + '-' + value[1].toString(16).toUpperCase();
      } else {
        return 'U+' + value.toString(16).toUpperCase();
      }
    }).join(',');
  };

  /**
   * @return {string}
   */
  CharacterSet.prototype.toString = function () {
    return this.toArray().map(this.encodeCodePoint.bind(this)).join('');
  };

  /**
   * @param {string} input
   *
   * @return {CharacterSet}
   */
  CharacterSet.parseUnicodeRange = function (input) {
    var ranges = input.split(/\s*,\s*/);
    var result = new CharacterSet();

    for (var i = 0; i < ranges.length; i++) {
      var match = /^(u\+([0-9a-f?]{1,6})(?:-([0-9a-f]{1,6}))?)$/i.exec(ranges[i]),
        start = null,
        end = null;

      if (match) {
        if (match[2].indexOf('?') !== -1) {
          start = parseInt(match[2].replace('?', '0'), 16);
          end = parseInt(match[2].replace('?', 'f'), 16);
        } else {
          start = parseInt(match[2], 16);

          if (match[3]) {
            end = parseInt(match[3], 16);
          } else {
            end = start;
          }
        }

        if (start !== end) {
          for (var codePoint = start; codePoint <= end; codePoint++) {
            result.add(codePoint);
          }
        } else {
          result.add(start);
        }
      }
    }

    return result;
  };

  return CharacterSet;
}));
