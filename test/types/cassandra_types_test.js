/* eslint-disable no-unused-expressions */
const expect = require('chai').expect;

const fail = expect.fail;
const CassandraTypes = require('../../lib/types/cassandra_types');

describe('CassandraTypes', () => {
  let cassandraTypes;

  before(() => {
    cassandraTypes = new CassandraTypes();
  });

  describe('#getTypes', () => {
    it('only returns the supported type list', () => {
      const types = cassandraTypes.getTypes();
      expect(types).to.deep.have.members(
        [
          'String',
          'Integer',
          'Long',
          'BigDecimal',
          'Float',
          'Double',
          'Boolean',
          'Date',
          'UUID',
          'Instant'
        ]
      );
    });
  });

  describe('#contains', () => {
    describe('when passing a contained type', () => {
      it('returns true', () => {
        expect(cassandraTypes.contains('String')).to.be.true;
      });
    });

    describe('when passing a not contained type', () => {
      describe('that is null', () => {
        it('returns false', () => {
          expect(cassandraTypes.contains(null)).to.be.false;
        });
      });

      describe('that is blank', () => {
        it('returns false', () => {
          expect(cassandraTypes.contains('')).to.be.false;
        });
      });

      describe('that has a valid name, but is not contained', () => {
        it('returns false', () => {
          expect(cassandraTypes.contains('NoTypeAtAll')).to.be.false;
        });
      });
    });
  });

  describe('#isValidationSupportedForType', () => {
    describe('when the passed types and validation exist', () => {
      it('returns true', () => {
        expect(
          cassandraTypes.isValidationSupportedForType('String', 'required')
        ).to.be.true;
      });
    });

    describe('when the passed type is invalid', () => {
      describe('because it is null', () => {
        it('throws an exception', () => {
          try {
            cassandraTypes.isValidationSupportedForType(null, 'required');
            fail();
          } catch (error) {
            expect(error.name).to.equal('NullPointerException');
          }
        });
      });

      describe('because it is blank', () => {
        it('throws an exception', () => {
          try {
            cassandraTypes.isValidationSupportedForType('', 'required');
            fail();
          } catch (error) {
            expect(error.name).to.equal('NullPointerException');
          }
        });
      });

      describe('because it does not exist', () => {
        it('returns false', () => {
          expect(
            cassandraTypes.isValidationSupportedForType(
              'NoTypeAtAll',
              'required')
          ).to.be.false;
        });
      });
    });

    describe('when the passed validation is invalid', () => {
      describe('because it is null', () => {
        it('throws an exception', () => {
          try {
            cassandraTypes.isValidationSupportedForType('String', null);
            fail();
          } catch (error) {
            expect(error.name).to.equal('NullPointerException');
          }
        });
      });

      describe('because it is blank', () => {
        it('throws an exception', () => {
          try {
            cassandraTypes.isValidationSupportedForType('String', '');
            fail();
          } catch (error) {
            expect(error.name).to.equal('NullPointerException');
          }
        });
      });

      describe('because it does not exist', () => {
        it('returns false', () => {
          expect(
            cassandraTypes.isValidationSupportedForType(
              'String',
              'NoValidationAtAll')
          ).to.be.false;
        });
      });
    });

    describe('when both the passed type and validation are invalid', () => {
      describe('because they are null', () => {
        it('throws an exception', () => {
          try {
            cassandraTypes.isValidationSupportedForType(null, null);
            fail();
          } catch (error) {
            expect(error.name).to.equal('NullPointerException');
          }
        });
      });

      describe('because they are blank', () => {
        it('throws an exception', () => {
          try {
            cassandraTypes.isValidationSupportedForType('', '');
            fail();
          } catch (error) {
            expect(error.name).to.equal('NullPointerException');
          }
        });
      });

      describe('because they do not exist', () => {
        it('returns false', () => {
          expect(
            cassandraTypes.isValidationSupportedForType(
              'NoTypeAtAll',
              'NoValidation')
          ).to.be.false;
        });
      });
    });
  });
});
