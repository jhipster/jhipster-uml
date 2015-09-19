'use strict';

var chai = require('chai'),
    expect = chai.expect,
    generateEntities = require('../lib/entity_generator');

describe('#generateEntities', function() {
  describe('when generating the entities', function() {
    describe('with invalid parameters', function() {
      describe('such as invalid classes', function() {
        it("throws an exception because they don't have the same content", function() {
          try {
            generateEntities([], { key: 'value' });
            throw new ExpectationError();
          } catch (error) {
            expect(error.name).to.equal('IllegalArgumentException');
          }
          try {
            generateEntities([ 'element' ], {});
            throw new ExpectationError();
          } catch (error) {
            expect(error.name).to.equal('IllegalArgumentException');
          }
        });
      });
    });

    describe('with valid parameters', function() {
      describe('such as empty classes', function() {
        it("doesn't throw any error", function() {
          expect(generateEntities([], {}));
        });
      });

      describe('with non-empty classes', function() {
        it("doesn't throw any error", function() {
          // can't test it because it is dependant on JHipster
        });
      });
    });
  });
});

function ExpectationError(message) {
  this.name = 'ExpectationError';
  this.message = (message || '');
}
ExpectationError.prototype = new Error();
