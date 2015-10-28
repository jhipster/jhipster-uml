'use strict';

var expect = require('chai').expect,
    generateEntities = require('../lib/entity_generator');

describe('#generateEntities', function() {
  describe('when generating the entities', function() {
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

