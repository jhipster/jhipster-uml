'use strict';

var expect = require('chai').expect,
    fail = expect.fail,
    CassandraTypes = require('../../lib/types/cassandra_types');

var cassandraTypes;

describe('CassandraTypes', function() {
  before(function() {
    cassandraTypes = new CassandraTypes();
  });

  describe('#getTypes', function() {
    it('only returns the supported type list', function() {
      var types = cassandraTypes.getTypes();
      expect(types).to.deep.have.members(
        [
          'UUID',
          'String',
          'Integer',
          'Long',
          'BigDecimal',
          'Date',
          'Boolean',
          'Float',
          'Double'
        ]
      );
    });
  });

  describe('#getValidationsForType', function() {
    describe('when passing a valid type', function() {
      it('returns only the validation list for it', function() {
        var validations = cassandraTypes.getValidationsForType('String');
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
            cassandraTypes.getValidationsForType(null);
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because it is blank', function() {
        it('throws an exception', function() {
          try {
            cassandraTypes.getValidationsForType('');
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because it does not exist', function() {
        it('throws an exception', function() {
          try {
            cassandraTypes.getValidationsForType('NoTypeAtAll');
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
        expect(cassandraTypes.toValueNameObjectArray()).to.deep.have.members(
          [
            {
              value: 'UUID',
              name: 'UUID'
            },
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
              value: 'Date',
              name: 'Date'
            },
            {
              value: 'Boolean',
              name: 'Boolean'
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
        expect(cassandraTypes.contains('String')).to.be.true;
      });
    });

    describe('when passing a not contained type', function() {
      describe('that is null', function() {
        it('returns false', function() {
          expect(cassandraTypes.contains(null)).to.be.false;
        });
      });

      describe('that is blank', function() {
        it('returns false', function() {
          expect(cassandraTypes.contains('')).to.be.false;
        });
      });

      describe('that has a valid name, but is not contained', function() {
        it('returns false', function() {
          expect(cassandraTypes.contains('NoTypeAtAll')).to.be.false;
        });
      });
    });
  });

  describe('#isValidationSupportedForType', function() {
    describe('when the passed types and validation exist', function() {
      it('returns true', function() {
        expect(
          cassandraTypes.isValidationSupportedForType('String', 'required')
        ).to.be.true;
      });
    });

    describe('when the passed type is invalid', function() {
      describe('because it is null', function() {
        it('throws an exception', function() {
          try {
            cassandraTypes.isValidationSupportedForType(null, 'required');
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because it is blank', function() {
        it('throws an exception', function() {
          try {
            cassandraTypes.isValidationSupportedForType('', 'required');
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because it does not exist', function() {
        it('throws an exception', function() {
          try {
            cassandraTypes.isValidationSupportedForType(
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
            cassandraTypes.isValidationSupportedForType('String', null)
          ).to.be.false
        });
      });

      describe('because it is blank', function() {
        it('returns false', function() {
          expect(
            cassandraTypes.isValidationSupportedForType('String', '')
          ).to.be.false
        });
      });

      describe('because it does not exist', function() {
        it('returns false', function() {
          expect(
            cassandraTypes.isValidationSupportedForType(
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
            cassandraTypes.isValidationSupportedForType(null, null);
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because they are blank', function() {
        it('throws an exception', function() {
          try {
            cassandraTypes.isValidationSupportedForType('', '');
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because they do not exist', function() {
        it('throws an exception', function() {
          try {
            cassandraTypes.isValidationSupportedForType(
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
