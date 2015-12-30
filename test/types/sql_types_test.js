'use strict';

var expect = require('chai').expect,
    fail = expect.fail,
    SQLTypes = require('../../lib/types/sql_types');

var sqlTypes;

describe('SQLTypes', function() {
  before(function() {
    sqlTypes = new SQLTypes();
  });

  describe('#getTypes', function() {
    it('only returns the supported type list', function() {
      var types = sqlTypes.getTypes();
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
          'Float',
          'Double'
        ]
      );
    });
  });

  describe('#getValidationsForType', function() {
    describe('when passing a valid type', function() {
      it('returns only the validation list for it', function() {
        var validations = sqlTypes.getValidationsForType('String');
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

    describe('when passing an invalid type', function() {
      describe('because it is null', function() {
        it('throws an exception', function() {
          try {
            sqlTypes.getValidationsForType(null);
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because it is blank', function() {
        it('throws an exception', function() {
          try {
            sqlTypes.getValidationsForType('');
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because it does not exist', function() {
        it('throws an exception', function() {
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

  describe('#toValueNameObjectArray', function() {
    it(
      'correctly transposes the type list into a name/value object array',
      function() {
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

  describe('#contains', function() {
    describe('when passing a contained type', function() {
      it('returns true', function() {
        expect(sqlTypes.contains('String')).to.be.true;
      });
    });

    describe('when passing a not contained type', function() {
      describe('that is null', function() {
        it('returns false', function() {
          expect(sqlTypes.contains(null)).to.be.false;
        });
      });

      describe('that is blank', function() {
        it('returns false', function() {
          expect(sqlTypes.contains('')).to.be.false;
        });
      });

      describe('that has a valid name, but is not contained', function() {
        it('returns false', function() {
          expect(sqlTypes.contains('NoTypeAtAll')).to.be.false;
        });
      });
    });
  });

  describe('#isValidationSupportedForType', function() {
    describe('when the passed types and validation exist', function() {
      it('returns true', function() {
        expect(
          sqlTypes.isValidationSupportedForType('String', 'required')
        ).to.be.true;
      });
    });

    describe('when the passed type is invalid', function() {
      describe('because it is null', function() {
        it('throws an exception', function() {
          try {
            sqlTypes.isValidationSupportedForType(null, 'required');
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because it is blank', function() {
        it('throws an exception', function() {
          try {
            sqlTypes.isValidationSupportedForType('', 'required');
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because it does not exist', function() {
        it('throws an exception', function() {
          try {
            sqlTypes.isValidationSupportedForType('NoTypeAtAll', 'required');
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });
    });

    describe('when the passed validation is invalid', function() {
      describe('because it is null', function() {
        it('returns false', function() {
          expect(
            sqlTypes.isValidationSupportedForType('String', null)
          ).to.be.false
        });
      });

      describe('because it is blank', function() {
        it('returns false', function() {
          expect(
            sqlTypes.isValidationSupportedForType('String', '')
          ).to.be.false
        });
      });

      describe('because it does not exist', function() {
        it('returns false', function() {
          expect(
            sqlTypes.isValidationSupportedForType('String', 'NoValidationAtAll')
          ).to.be.false
        });
      });
    });

    describe('when both the passed type and validation are invalid', function() {
      describe('because they are null', function() {
        it('throws an exception', function() {
          try {
            sqlTypes.isValidationSupportedForType(null, null);
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because they are blank', function() {
        it('throws an exception', function() {
          try {
            sqlTypes.isValidationSupportedForType('', '');
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because they do not exist', function() {
        it('throws an exception', function() {
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
