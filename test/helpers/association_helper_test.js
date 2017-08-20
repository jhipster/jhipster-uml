const expect = require('chai').expect;
const cardinalities = require('../../lib/cardinalities');
const checkValidityOfAssociation = require('../../lib/helpers/association_helper').checkValidityOfAssociation;

describe('#checkValidityOfAssociation', () => {
  describe('when passing a valid association', () => {
    describe('as it is a One-to-One association', () => {
      describe('that does possess a source end', () => {
        it('doesn\'t throw any exception', () => {
          checkValidityOfAssociation({
            type: cardinalities.ONE_TO_ONE,
            injectedFieldInFrom: 'notnull'
          });
        });
      });
      describe('that doesn\'t possess a source end', () => {
        it('throws an exception', () => {
          try {
            checkValidityOfAssociation({ type: cardinalities.ONE_TO_ONE });
          } catch (error) {
            expect(error.name).to.eq('MalformedAssociationException');
          }
        });
      });
    });

    describe('as it is a One-to-Many association', () => {
      it('is valid by default', () => {
        // do nothing
      });
    });

    describe('as it is a Many-to-One association', () => {
      describe('that only have a source or an destination end', () => {
        it('does not throw', () => {
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
      describe('that have both source and destination ends', () => {
        it('throws an exception', () => {
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

    describe('as it is a Many-to-Many association', () => {
      describe('that have both source and destination ends', () => {
        it('does not throw', () => {
          checkValidityOfAssociation({
            type: cardinalities.MANY_TO_MANY,
            injectedFieldInFrom: 'NOTNULL',
            injectedFieldInTo: 'NOTNULL'
          });
        });
      });

      describe('that only have a source or an destination end', () => {
        it('throws an exception', () => {
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
  describe('when passing an invalid association', () => {
    describe('as it is nil', () => {
      it('throws an exception', () => {
        try {
          checkValidityOfAssociation(null);
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('as its type is nil', () => {
      it('throws an exception', () => {
        try {
          checkValidityOfAssociation({});
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('as it is not a One-to-One, a One-to-Many, a Many-to-One or a Many-to-Many', () => {
      it('throws an exception', () => {
        try {
          checkValidityOfAssociation({ type: 'UNSUPPORTED' });
        } catch (error) {
          expect(error.name).to.eq('WrongAssociationException');
        }
      });
    });
  });
});
