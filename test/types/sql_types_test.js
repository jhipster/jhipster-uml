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
          'LocalDate',
          'ZonedDateTime',
          'Boolean',
          'Enum',
          'Blob',
          'AnyBlob',
          'ImageBlob',
          'TextBlob',
          'Float',
          'Double'
        ]
      );
    });
  });

  describe('#getValidationsForType', () => {
    describe('when passing a valid type', () => {
      it('returns only the validation list for it', () => {
        const validations = sqlTypes.getValidationsForType('String');
        expect(validations).to.deep.have.members(
          [
            'required',
            'minlength',
            'maxlength',
            'pattern'
          ]
        );
      });
    });

    describe('when passing an invalid type', () => {
      describe('because it is null', () => {
        it('throws an exception', () => {
          try {
            sqlTypes.getValidationsForType(null);
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because it is blank', () => {
        it('throws an exception', () => {
          try {
            sqlTypes.getValidationsForType('');
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because it does not exist', () => {
        it('throws an exception', () => {
          try {
            sqlTypes.getValidationsForType('NoTypeAtAll');
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });
    });
  });

  describe('#toValueNameObjectArray', () => {
    it('correctly transposes the type list into a name/value object array', () => {
      expect(sqlTypes.toValueNameObjectArray()).to.deep.have.members(
        [
          {
            value: 'String',
            name: 'String'
          },
          {
            value: 'Integer',
            name: 'Integer'
          },
          {
            value: 'Long',
            name: 'Long'
          },
          {
            value: 'BigDecimal',
            name: 'BigDecimal'
          },
          {
            value: 'LocalDate',
            name: 'LocalDate'
          },
          {
            value: 'ZonedDateTime',
            name: 'ZonedDateTime'
          },
          {
            value: 'Boolean',
            name: 'Boolean'
          },
          {
            value: 'Enum',
            name: 'Enum'
          },
          {
            value: 'Blob',
            name: 'Blob'
          },
          {
            value: 'AnyBlob',
            name: 'AnyBlob'
          },
          {
            value: 'ImageBlob',
            name: 'ImageBlob'
          },
          {
            value: 'TextBlob',
            name: 'TextBlob'
          },
          {
            value: 'Float',
            name: 'Float'
          },
          {
            value: 'Double',
            name: 'Double'
          }
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
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because it is blank', () => {
        it('throws an exception', () => {
          try {
            sqlTypes.isValidationSupportedForType('', 'required');
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because it does not exist', () => {
        it('throws an exception', () => {
          try {
            sqlTypes.isValidationSupportedForType('NoTypeAtAll', 'required');
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });
    });

    describe('when the passed validation is invalid', () => {
      describe('because it is null', () => {
        it('returns false', () => {
          expect(
            sqlTypes.isValidationSupportedForType('String', null)
          ).to.be.false;
        });
      });

      describe('because it is blank', () => {
        it('returns false', () => {
          expect(
            sqlTypes.isValidationSupportedForType('String', '')
          ).to.be.false;
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
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because they are blank', () => {
        it('throws an exception', () => {
          try {
            sqlTypes.isValidationSupportedForType('', '');
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because they do not exist', () => {
        it('throws an exception', () => {
          try {
            sqlTypes.isValidationSupportedForType('NoTypeAtAll', 'NoValidation');
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });
    });
  });
});
