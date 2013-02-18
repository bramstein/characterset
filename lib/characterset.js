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
    var codePoints = this.expandRange(input);

    for (var i = 0; i < codePoints.length; i += 1) {
      this.add(codePoints[i]);
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
 * @param {number} codePoint The code point to add to this set.
 */
CharacterSet.prototype.add = function (codePoint) {
  if (this.data[codePoint] !== true) {
    this.data[codePoint] = true;
    this.size += 1;
  }
};

/**
 * @param {number} codePoint The code point to remove from this set.
 */
CharacterSet.prototype.remove = function (codePoint) {
  if (this.data[codePoint] === true) {
    this.data[codePoint] = false;
    this.size -= 1;
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

CharacterSet.prototype.toRegExp = function () {
  return //g;
};

/**
 * Returns the set as a compressed code point string.
 * NOTE: this method does handles code points outside
 * the BMP as if they are code points inside the BMP.
 * For a range it will thus return four code points
 * separated by a dash. It is up to the consumer to
 * correctly handle this case.
 *
 * @private
 * @return {string}
 */
CharacterSet.prototype.toRangeString = function () {
  return this.toRange().map(function (value) {
    if (Array.isArray(value)) {
      return this.encodeCodePoint(value[0]) + '-' + this.encodeCodePoint(value[1]);
    } else {
      return this.encodeCodePoint(value);
    }
  }, this).join('');
};

/**
 * @return {string}
 */
CharacterSet.prototype.toString = function () {
  return this.toArray().map(this.encodeCodePoint.bind(this)).join('');
};
