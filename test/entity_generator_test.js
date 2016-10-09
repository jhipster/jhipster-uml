'use strict';

var expect = require('chai').expect,
    generateEntities = require('../lib/entity_generator').generateEntities;

describe('#generateEntities', () => {
  describe('when generating the entities', () => {
    describe('with valid parameters', () => {
      describe('such as empty classes', () => {
        it("doesn't throw any error", () => {
          expect(generateEntities([], {}));
        });
      });

      describe('with non-empty classes', () => {
        it("doesn't throw any error", () => {
          // can't test it because it is dependant on JHipster
        });
      });
    });
  });
});

