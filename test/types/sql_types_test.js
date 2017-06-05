'use strict';

const expect = require('chai').expect,
  fail = expect.fail,
  SQLTypes = require('../../lib/types/sql_types');


describe('SQLTypes', () => {
  let sqlTypes;

  before(() => {
    sqlTypes = new SQLTypes();
  });

  describe('#getTypes', () => {
    it('only returns the supported type list', () => {
      const types = sqlTypes.getTypes();
      expect(types).to.deep.have.members(
        [
          'String',
          'Integer',
          'Long',
          'BigDecimal',
          'Float',
          'Double',
          'Enum',
          'Boolean',
          'LocalDate',
          'ZonedDateTime',
          'Blob',
          'AnyBlob',
          'ImageBlob',
          'TextBlob',
          'Instant'
        ]
      );
    });
  });

  describe('#contains', () => {
    describe('when passing a contained type', () => {
      it('returns true', () => {
        expect(sqlTypes.contains('String')).to.be.true;
      });
    });

    describe('when passing a not contained type', () => {
      describe('that is null', () => {
        it('returns false', () => {
          expect(sqlTypes.contains(null)).to.be.false;
        });
      });

      describe('that is blank', () => {
        it('returns false', () => {
          expect(sqlTypes.contains('')).to.be.false;
        });
      });

      describe('that has a valid name, but is not contained', () => {
        it('returns false', () => {
          expect(sqlTypes.contains('NoTypeAtAll')).to.be.false;
        });
      });
    });
  });

  describe('#isValidationSupportedForType', () => {
    describe('when the passed types and validation exist', () => {
      it('returns true', () => {
        expect(
          sqlTypes.isValidationSupportedForType('String', 'required')
        ).to.be.true;
      });
    });

    describe('when the passed type is invalid', () => {
      describe('because it is null', () => {
        it('throws an exception', () => {
          try {
            sqlTypes.isValidationSupportedForType(null, 'required');
            fail();
          } catch (error) {
            expect(error.name).to.equal('NullPointerException');
          }
        });
      });

      describe('because it is blank', () => {
        it('throws an exception', () => {
          try {
            sqlTypes.isValidationSupportedForType('', 'required');
            fail();
          } catch (error) {
            expect(error.name).to.equal('NullPointerException');
          }
        });
      });

      describe('because it does not exist', () => {
        it('returns false', () => {
          expect(sqlTypes.isValidationSupportedForType('NoTypeAtAll', 'required')).to.be.false;
        });
      });
    });

    describe('when the passed validation is invalid', () => {
      describe('because it is null', () => {
        it('throws an exception', () => {
          try {
            sqlTypes.isValidationSupportedForType('String', null);
            fail();
          } catch (error) {
            expect(error.name).to.equal('NullPointerException');
          }
        });
      });

      describe('because it is blank', () => {
        it('throws an exception', () => {
          try {
            sqlTypes.isValidationSupportedForType('String', '');
            fail();
          } catch (error) {
            expect(error.name).to.equal('NullPointerException');
          }
        });
      });

      describe('because it does not exist', () => {
        it('returns false', () => {
          expect(
            sqlTypes.isValidationSupportedForType('String', 'NoValidationAtAll')
          ).to.be.false;
        });
      });
    });

    describe('when both the passed type and validation are invalid', () => {
      describe('because they are null', () => {
        it('throws an exception', () => {
          try {
            sqlTypes.isValidationSupportedForType(null, null);
            fail();
          } catch (error) {
            expect(error.name).to.equal('NullPointerException');
          }
        });
      });

      describe('because they are blank', () => {
        it('throws an exception', () => {
          try {
            sqlTypes.isValidationSupportedForType('', '');
            fail();
          } catch (error) {
            expect(error.name).to.equal('NullPointerException');
          }
        });
      });

      describe('because they do not exist', () => {
        it('returns false', () => {
          expect(sqlTypes.isValidationSupportedForType('NoTypeAtAll', 'NoValidation')).to.be.false;
        });
      });
    });
  });
});
