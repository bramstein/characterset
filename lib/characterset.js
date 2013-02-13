/**
 * @constructor
 * @param {number|string|Array.<number>} input
 */
function CharacterSet(input) {
  this.data = {};
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
    for (var i = 0; i < input.length; i += 1) {
      this.add(input[i]);
    }
  }
}

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
  // TODO: Should this be sorted?
  return result;
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

CharacterSet.extractHighSurrogate = function (codePoint) {
  return Math.floor((codePoint - 0x10000) / 0x400) + 0xD800;
};

CharacterSet.extractLowSurrogate = function (codePoint) {
  return (codePoint - 0x10000) % 0x400 + 0xDC00;
};

CharacterSet.encodeCodePoint = function (codePoint) {
  if ((codePoint >= 0x41 && codePoint <= 0x5A) || // A-Z
      (codePoint >= 0x61 && codePoint <= 0x7A) || // a-z
      (codePoint >= 0x30 && codePoint <= 0x39)) { // 0-9
    return String.fromCharCode(codePoint);
  } else if (codePoint <= 0xFFFF) {
    return '\\u' + (codePoint + 0x10000).toString(16).substr(-4).toUpperCase();
  } else {
    return CharacterSet.encodeCodePoint(CharacterSet.extractHighSurrogate(codePoint)) +
           CharacterSet.encodeCodePoint(CharacterSet.extractLowSurrogate(codePoint));
  }
};

CharacterSet.prototype.toRegExp = function () {
  return //g;
};

CharacterSet.prototype.toString = function () {
  return this.toArray().map(CharacterSet.encodeCodePoint).join('');
};
