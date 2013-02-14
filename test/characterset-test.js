describe('CharacterSet', function () {
  describe('#constructor', function () {
    it('should create a CharacterSet instance that is empty', function () {
      var cs = new CharacterSet();

      expect(cs).not.to.be(null);
      expect(cs.data).to.be.empty();
    });

    it('should create a CharacterSet instance with a single code point', function () {
      var cs = new CharacterSet(1);

      expect(cs).not.to.be(null);
      expect(cs.data).to.eql({1: true});
    });

    it('should create a CharacterSet instance from an ASCII string', function () {
      var cs = new CharacterSet('abc');

      expect(cs).not.to.be(null);
      expect(cs.data).to.eql({
        97: true,
        98: true,
        99: true
      });
    });

    it('should create a CharacterSet instance from a BMP string', function () {
      var cs = new CharacterSet('中国');

      expect(cs).not.to.be(null);
      expect(cs.data).to.eql({
        20013: true,
        22269: true
      });
    });

    it('should create a CharacterSet instance from a string containing surrogate pairs', function () {
      var cs = new CharacterSet('a\uD834\uDF06bc');

      expect(cs).not.to.be(null);
      expect(cs.data).to.eql({
        97: true,
        98: true,
        99: true,
        119558: true
      });
    });
  });

  describe('#toArray', function () {
    var cs = new CharacterSet();

    it('should return the correct code points', function () {
      var cs = new CharacterSet([1, 2]);

      expect(cs.toArray()).to.eql([1, 2]);
    });

    it('should return the correct code points in sorted order', function () {
      var cs = new CharacterSet([2, 1, 3, 0]);

      expect(cs.toArray()).to.eql([0, 1, 2, 3]);
    });
  });

  describe('#isEmpty', function () {
    it('should return true when empty', function () {
      var cs = new CharacterSet();

      expect(cs.isEmpty()).to.be(true);
    });

    it('should return false when not empty', function () {
      var cs = new CharacterSet(119558);

      expect(cs.isEmpty()).to.be(false);
    });
  });

  describe('#add', function () {
    var cs = new CharacterSet();

    it('should add a single code point', function () {
      cs.add(1);

      expect(cs.size).to.eql(1);
      expect(cs.data).to.eql({
        1: true
      });
    });

    it('should add another code point', function () {
      cs.add(2);

      expect(cs.size).to.eql(2);
      expect(cs.data).to.eql({
        1: true,
        2: true
      });
    });

    it('should not add the same code point twice', function () {
      cs.add(1);
      cs.add(2);

      expect(cs.size).to.eql(2);
      expect(cs.data).to.eql({
        1: true,
        2: true
      });
    });
  });

  describe('#remove', function () {
    var cs = new CharacterSet([1, 2, 3, 4]);

    it('should remove a single code point', function () {
      cs.remove(1);

      expect(cs.size).to.eql(3);
      expect(cs.data).to.eql({
        1: false,
        2: true,
        3: true,
        4: true
      });
    });

    it('should remove another code point', function () {
      cs.remove(2);

      expect(cs.size).to.eql(2);
      expect(cs.data).to.eql({
        1: false,
        2: false,
        3: true,
        4: true
      });
    });

    it('should not remove the same code point twice', function () {
      cs.remove(1);
      cs.remove(2);

      expect(cs.size).to.eql(2);
      expect(cs.data).to.eql({
        1: false,
        2: false,
        3: true,
        4: true
      });
    });
  });

  describe('encodeCodePoint', function () {
    var characterSet = null;

    beforeEach(function () {
      characterSet = new CharacterSet();
    });

    it('should encode ASCII safe characters as themselves', function () {
      expect(characterSet.encodeCodePoint(65)).to.eql('A');
      expect(characterSet.encodeCodePoint(57)).to.eql('9');
      expect(characterSet.encodeCodePoint(97)).to.eql('a');
    });

    it('should encode ASCII unsafe code points encoded', function () {
      expect(characterSet.encodeCodePoint(0)).to.eql('\\u0000');
      expect(characterSet.encodeCodePoint(36)).to.eql('\\u0024');
      expect(characterSet.encodeCodePoint(62)).to.eql('\\u003E');
      expect(characterSet.encodeCodePoint(127)).to.eql('\\u007F');
    });

    it('should always encode code points in the BMP that are not safe characters', function () {
      expect(characterSet.encodeCodePoint(20013)).to.eql('\\u4E2D');
      expect(characterSet.encodeCodePoint(22269)).to.eql('\\u56FD');
    });

    it('should encode code points outside the BMP as surrogate pairs', function () {
      expect(characterSet.encodeCodePoint(119558)).to.eql('\\uD834\\uDF06');
    });
  });

  describe('#toString', function () {
    it('should return ASCII as ASCII', function () {
      var cs = new CharacterSet('abc');

      expect(cs.toString()).to.eql('abc');
    });

    it('should not contain duplicates', function () {
      var cs = new CharacterSet('abcabc');

      expect(cs.toString()).to.eql('abc');
    });

    it('should encode characters inside the BMP as using hex escapes', function () {
      var cs = new CharacterSet([20013, 22269]);

      expect(cs.toString()).to.eql('\\u4E2D\\u56FD');
    });

    it('should encode characters outside the BMP as surrogate pairs', function () {
      var cs = new CharacterSet(119558);

      expect(cs.toString()).to.eql('\\uD834\\uDF06');
    });
  });

  describe('#union', function () {
    it('should union two distinct character sets', function () {
      var a = new CharacterSet([1, 2]),
          b = new CharacterSet([3, 4]);

      expect(a.union(b).data).to.eql({
        1: true,
        2: true,
        3: true,
        4: true
      });
    });

    it('should union two overlapping character sets', function () {
      var a = new CharacterSet([1, 2, 3]),
          b = new CharacterSet([2, 3, 4]);

      expect(a.union(b).data).to.eql({
        1: true,
        2: true,
        3: true,
        4: true
      });
    });
  });

  describe('#intersection', function () {
    it('should not find any code points in common', function () {
      var a = new CharacterSet([1, 2]),
          b = new CharacterSet([3, 4]);

      expect(a.intersect(b).data).to.eql({});
    });

    it('should find code points in common', function () {
      var a = new CharacterSet([1, 2, 3]),
          b = new CharacterSet([2, 3, 4]);

      expect(a.intersect(b).data).to.eql({
        2: true,
        3: true
      });
    });
  });

  describe('#difference', function () {
    it('should return the same set if there are now common code points', function () {
      var a = new CharacterSet([1, 2]),
          b = new CharacterSet([3, 4]);

      expect(a.difference(b).data).to.eql({
        1: true,
        2: true
      });
      expect(b.difference(a).data).to.eql({
        3: true,
        4: true
      });
      expect(a.difference(a).data).to.eql({});
    });

    it('should only return those code points that are not in common', function () {
      var a = new CharacterSet([1, 2, 3]),
          b = new CharacterSet([2, 3, 4]);

      expect(a.difference(b).data).to.eql({
        1: true
      });
      expect(b.difference(a).data).to.eql({
        4: true
      });
    });
  });

  describe('#subset', function () {
    it('should consider an empty character set as a subset of any character set', function () {
      var a = new CharacterSet(),
          b = new CharacterSet([1, 2]);

      expect(a.subset(b)).to.be(true);
      expect(b.subset(a)).to.be(false);
    });

    it('should consider a character set a subset only if all its codepoints are present in another character set', function () {
      var a = new CharacterSet([1, 2]),
          b = new CharacterSet([1, 2, 3]);

      expect(a.subset(b)).to.be(true);
      expect(b.subset(a)).to.be(false);
    });

    it('should consider a character set a subset of itself', function () {
      var a = new CharacterSet([1, 2]);

      expect(a.subset(a)).to.be(true);
    });
  });

  describe('#toRegExp', function () {
  });
});
