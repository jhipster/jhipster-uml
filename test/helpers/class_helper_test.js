'use strict';

var expect = require('chai').expect,
    getClassNames = require('../../lib/helpers/class_helper').getClassNames;

describe('#getClassNames', function() {
  describe('when passing a valid classes object', function() {
    var classDataHolder = {};
    before(function() {
      classDataHolder[0] = { name: 'a' };
      classDataHolder[1] = { name: 'b' };
      classDataHolder[2] = { name: 'c' };
      classDataHolder[3] = { name: 'd' };
    });

    it("returns the classes' names", function() {
      var classNames = getClassNames(classDataHolder);
      expect(classNames).to.deep.equal({0: 'a', 1: 'b', 2: 'c', 3: 'd'});
    });
  });

  describe('when passing an invalid classes object', function() {
    describe('such as an empty object', function() {
      it('returns an empty object', function() {
        var classNames = getClassNames({});
        expect(classNames).to.deep.equal({});
      });
    });
    describe('such as a null object', function() {
      it('throws an error', function() {
        try {
          getClassNames(null);
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
  });
});
