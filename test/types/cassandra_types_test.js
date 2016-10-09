'use strict';

var expect = require('chai').expect,
    fail = expect.fail,
    CassandraTypes = require('../../lib/types/cassandra_types');

var cassandraTypes;

describe('CassandraTypes', () => {
  before(() => {
    cassandraTypes = new CassandraTypes();
  });

  describe('#getTypes', () => {
    it('only returns the supported type list', () => {
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

  describe('#getValidationsForType', () => {
    describe('when passing a valid type', () => {
      it('returns only the validation list for it', () => {
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

    describe('when passing an invalid type', () => {
      describe('because it is null', () => {
        it('throws an exception', () => {
          try {
            cassandraTypes.getValidationsForType(null);
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because it is blank', () => {
        it('throws an exception', () => {
          try {
            cassandraTypes.getValidationsForType('');
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because it does not exist', () => {
        it('throws an exception', () => {
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

  describe('#toValueNameObjectArray', () => {
    it('correctly transposes the type list into a name/value object array', () => {
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
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because it is blank', () => {
        it('throws an exception', () => {
          try {
            cassandraTypes.isValidationSupportedForType('', 'required');
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because it does not exist', () => {
        it('throws an exception', () => {
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

    describe('when the passed validation is invalid', () => {
      describe('because it is null', () => {
        it('returns false', () => {
          expect(
            cassandraTypes.isValidationSupportedForType('String', null)
          ).to.be.false;
        });
      });

      describe('because it is blank', () => {
        it('returns false', () => {
          expect(
            cassandraTypes.isValidationSupportedForType('String', '')
          ).to.be.false;
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
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because they are blank', () => {
        it('throws an exception', () => {
          try {
            cassandraTypes.isValidationSupportedForType('', '');
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongDatabaseTypeException');
          }
        });
      });

      describe('because they do not exist', () => {
        it('throws an exception', () => {
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
