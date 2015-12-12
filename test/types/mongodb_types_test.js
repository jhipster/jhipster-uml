'use strict';

var expect = require('chai').expect,
    fail = expect.fail,
    MongoDBTypes = require('../../lib/types/mongodb_types');

var mongoDBTypes;

describe('MongoDBTypes', function() {
  before(function() {
    mongoDBTypes = new MongoDBTypes();
  });

  describe('#getTypes', function() {
    it('only returns the supported type list', function() {
      var types = mongoDBTypes.getTypes();
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
        var validations = mongoDBTypes.getValidationsForType('String');
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
            mongoDBTypes.getValidationsForType(null);
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because it is blank', function() {
        it('throws an exception', function() {
          try {
            mongoDBTypes.getValidationsForType('');
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because it does not exist', function() {
        it('throws an exception', function() {
          try {
            mongoDBTypes.getValidationsForType('NoTypeAtAll');
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
        expect(mongoDBTypes.toValueNameObjectArray()).to.deep.have.members(
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
        expect(mongoDBTypes.contains('String')).to.be.true;
      });
    });

    describe('when passing a not contained type', function() {
      describe('that is null', function() {
        it('returns false', function() {
          expect(mongoDBTypes.contains(null)).to.be.false;
        });
      });

      describe('that is blank', function() {
        it('returns false', function() {
          expect(mongoDBTypes.contains('')).to.be.false;
        });
      });

      describe('that has a valid name, but is not contained', function() {
        it('returns false', function() {
          expect(mongoDBTypes.contains('NoTypeAtAll')).to.be.false;
        });
      });
    });
  });

  describe('#isValidationSupportedForType', function() {
    describe('when the passed types and validation exist', function() {
      it('returns true', function() {
        expect(
          mongoDBTypes.isValidationSupportedForType('String', 'required')
        ).to.be.true;
      });
    });

    describe('when the passed type is invalid', function() {
      describe('because it is null', function() {
        it('throws an exception', function() {
          try {
            mongoDBTypes.isValidationSupportedForType(null, 'required');
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because it is blank', function() {
        it('throws an exception', function() {
          try {
            mongoDBTypes.isValidationSupportedForType('', 'required');
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because it does not exist', function() {
        it('throws an exception', function() {
          try {
            mongoDBTypes.isValidationSupportedForType(
              'NoTypeAtAll',
              'required');
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
            mongoDBTypes.isValidationSupportedForType('String', null)
          ).to.be.false
        });
      });

      describe('because it is blank', function() {
        it('returns false', function() {
          expect(
            mongoDBTypes.isValidationSupportedForType('String', '')
          ).to.be.false
        });
      });

      describe('because it does not exist', function() {
        it('returns false', function() {
          expect(
            mongoDBTypes.isValidationSupportedForType(
              'String',
              'NoValidationAtAll')
          ).to.be.false
        });
      });
    });

    describe(
        'when both the passed type and validation are invalid',
        function() {
      describe('because they are null', function() {
        it('throws an exception', function() {
          try {
            mongoDBTypes.isValidationSupportedForType(null, null);
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because they are blank', function() {
        it('throws an exception', function() {
          try {
            mongoDBTypes.isValidationSupportedForType('', '');
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because they do not exist', function() {
        it('throws an exception', function() {
          try {
            mongoDBTypes.isValidationSupportedForType(
              'NoTypeAtAll',
              'NoValidation');
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });
    });
  });
});
