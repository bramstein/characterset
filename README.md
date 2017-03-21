## CharacterSet

CharacterSet is a library for creating and manipulating Unicode character sets in JavaScript. Its main purpose is to help in building regular expressions for validation and matching. It fully supports all Unicode characters and correctly handles surrogate pairs in JavaScript strings and regular expressions.

## Installation

If you are using Node.js you can install it using npm:

    $ npm install characterset

If you want to use CharacterSet in the browser, use the global `CharacterSet` constructor or include CharacterSet as an AMD module.

## API

The constructor takes a single input value, which can either be a number, a string or a range. A range is an array of numbers or number pairs.

    // Creates a character set with a single code point for [97]
    var cs = new CharacterSet(97);

    // Creates a character set for the code points [97, 98, 99]
    var cs = new CharacterSet('abc');

    // Creates a character set for the code points [97, 98, 99]
    var cs = new CharacterSet([97, 98, 99]);

    // Creates a character set for the code points [97, 98, 99] using a range
    var cs = new CharacterSet([[97, 99]]);

    // Combines pairs and numbers in ranges for [0, 97, 98, 99]
    var cs = new CharacterSet([48, [97, 99]]);

Or you can use the `parseUnicodeRange` method to return a CharacterSet instance from a comma-delimited unicode range string.

    // Creates a character set for the code points [34, 35]
    var cs = CharacterSet.parseUnicodeRange('u+23,u+22');

    // Creates a character set for the code points [34, 35, 36, 37]
    var cs = CharacterSet.parseUnicodeRange('u+22-25');

Once you have an instance of CharacterSet you can use the following methods on it:

<dl>
  <dt>getSize()</dt>
  <dd>Returns the number of code points in this set.</dd>

  <dt>toArray()</dt>
  <dd>Returns all code points in this set as a sorted array.</dd>

  <dt>toRange()</dt>
  <dd>Returns all code points in this set as a range (i.e. compressed.)</dd>

  <dt>isEmpty()</dt>
  <dd>Returns true if this set is empty.</dd>

  <dt>add(codePoint, ...)</dt>
  <dd>Adds the given code point(s) to this set.</dd>

  <dt>remove(codePoint, ...)</dt>
  <dd>Removes the given code point(s) from this set.</dd>

  <dt>contains(codePoint)</dt>
  <dd>Returns true if the given code point is in this set.</dd>

  <dt>equals(other)</dt>
  <dd>Returns true if the `other` set is equal to this set.</dd>

  <dt>union(other)</dt>
  <dd>Returns a new character set from the combined code points from `other` and this character set.</dd>

  <dt>intersect(other)</dt>
  <dd>Returns a new character set containing only the code points `other` and this character set have in common.</dd>

  <dt>difference(other)</dt>
  <dd>Returns a new character set containing only the code points from this that are not in `other`.</dd>

  <dt>subset(other)</dt>
  <dd>Returns true if this character set is a subset of `other`.</dd>

  <dt>toRegExp()</dt>
  <dd>Returns a RegExp matching the code points in this character set</dd>

  <dt>toString()</dt>
  <dd>Returns a string representation of this character set.</dd>

  <dt>toHexString()</dt>
  <dd>Returns a hex string representation of this character set.</dd>

  <dt>ToHexRangeString()</dt>
  <dd>Returns a hex string representation with ranges of this character set.</dd>
</dl>

## License

CharacterSet is licensed under the three clause BSD license (see [BSD.txt](BSD.txt).)
