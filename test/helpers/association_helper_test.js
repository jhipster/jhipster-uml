'use strict';

var expect = require('chai').expect,
    cardinalities = require('../../lib/cardinalities'),
    checkValidityOfAssociation = require('../../lib/helpers/association_helper').checkValidityOfAssociation;

describe('#checkValidityOfAssociation', function () {
  describe('when passing a valid association', function () {
    describe('as it is a One-to-One association', function () {
      describe('that does possess a source end', function () {
        it("doesn't throw any exception", function () {
          checkValidityOfAssociation({
            type: cardinalities.ONE_TO_ONE,
            injectedFieldInFrom: 'notnull'
          });
        });
      });
      describe("that doesn't possess a source end", function () {
        it('throws an exception', function () {
          try {
            checkValidityOfAssociation({type: cardinalities.ONE_TO_ONE});
          } catch (error) {
            expect(error.name).to.eq('MalformedAssociationException');
          }
        });
      });
    });

    describe('as it is a One-to-Many association', function () {
      it('is valid by default', function () {
        // do nothing
      });
    });

    describe('as it is a Many-to-One association', function () {
      describe('that only have a source or an destination end', function () {
        it('does not throw', function () {
          checkValidityOfAssociation({
            type: cardinalities.MANY_TO_ONE,
            injectedFieldInTo: 'NOTNULL'
          });
          checkValidityOfAssociation({
            type: cardinalities.MANY_TO_ONE,
            injectedFieldInFrom: 'NOTNULL'
          });
        });
      });
      describe('that have both source and destination ends', function () {
        it('throws an exception', function () {
          try {
            checkValidityOfAssociation({
              type: cardinalities.MANY_TO_ONE,
              injectedFieldInFrom: 'NOTNULL',
              injectedFieldInTo: 'NOTNULL'
            });
          } catch (error) {
            expect(error.name).to.eq('MalformedAssociationException');
          }
        });
      });
    });

    describe('as it is a Many-to-Many association', function () {
      describe('that have both source and destination ends', function () {
        it('does not throw', function () {
          checkValidityOfAssociation({
            type: cardinalities.MANY_TO_MANY,
            injectedFieldInFrom: 'NOTNULL',
            injectedFieldInTo: 'NOTNULL'
          });
        });
      });

      describe('that only have a source or an destination end', function () {
        it('throws an exception', function () {
          try {
            checkValidityOfAssociation({
              type: cardinalities.MANY_TO_MANY,
              injectedFieldInFrom: 'NOTNULL'
            });
          } catch (error) {
            expect(error.name).to.eq('MalformedAssociationException');
          }
          try {
            checkValidityOfAssociation({
              type: cardinalities.MANY_TO_MANY,
              injectedFieldInTo: 'NOTNULL'
            });
          } catch (error) {
            expect(error.name).to.eq('MalformedAssociationException');
          }
        });
      });
    });
  });
  describe('when passing an invalid association', function () {
    describe('as it is nil', function () {
      it('throws an exception', function () {
        try {
          checkValidityOfAssociation(null);
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('as its type is nil', function () {
      it('throws an exception', function () {
        try {
          checkValidityOfAssociation({});
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('as it is not a One-to-One, a One-to-Many, a Many-to-One or a Many-to-Many', function () {
      it('throws an exception', function () {
        try {
          checkValidityOfAssociation({type: 'UNSUPPORTED'});
        } catch (error) {
          expect(error.name).to.eq('WrongAssociationException');
        }
      });
    });
  });
});
