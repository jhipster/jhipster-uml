'use strict';

var expect = require('chai').expect,
    merge = require('../../lib/helper/object_helper').merge;

describe('ObjectHelper', function() {
  describe('#merge', function() {
    var object1 = {
      a: 1,
      b: 2
    };

    var object2 = {
      b: 3,
      c: 4
    };

    describe('when merging two object', function() {
      it('returns the merged object by merging the second into the first', function() {
        expect(
          merge(object1, object2)
        ).to.deep.equal({ a: 1, b: 3, c: 4 });

        expect(
          merge(object2, object1)
        ).to.deep.equal({ a: 1, b: 2, c: 4 });
      });

      it('does not modify any of the two objects', function() {
        merge(object1, object2);
        expect(
          object1
        ).to.deep.equal({ a: 1, b: 2 });
        expect(
          object2
        ).to.deep.equal({ b: 3,  c: 4 });
      });
    });
  });
});
