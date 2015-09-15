'use strict';

var chai = require('chai'),
    expect = chai.expect,
    ParserFactory = require('../lib/editors/parser_factory');

var parser = ParserFactory.createParser('./test/xmi/visualparadigm.uml', 'sql');

describe('VisualParadigmParser', function() {
  describe('#findElements',function() {
    before(function() {
      parser.findElements();
    });

    it('finds the classes in the document', function() {
      expect(
        parser.rawClassesIndexes
      ).to.deep.equal([ 0, 1, 2, 5, 6, 7, 8, 9, 10 ]);
    });

    it('finds the types in the document', function() {
      expect(
        parser.rawTypesIndexes
      ).to.deep.equal([ 3, 4, 21 ]);
    });

    it('find the enumerations in the document', function() {
      var otherParser =
        ParserFactory.createParser('./test/xmi/visualparadigm_enum_test.uml', 'sql');
      otherParser.findElements();
      expect(otherParser.rawEnumsIndexes).to.deep.equal([ 1, 2 ]);
    });

    it('finds the associations in the document', function() {
      expect(
        parser.rawAssociationsIndexes
      ).to.deep.equal([ 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 ]);
    });
  });

  describe('#findConstraints', function() {
    before(function() {
      parser.findConstraints();
    });

    describe('when having a document with a validation', function() {
      it('finds the constraints in the document', function() {
        expect(parser.rawValidationRulesIndexes).to.deep.equal([ 0, 1 ]);
      });
    });

    describe('when having a document with no validation', function() {
      it('does not do anything', function() {
        var otherParser = ParserFactory.createParser(
          './test/xmi/visualparadigm_user_class_test.uml',
          'sql');
        otherParser.findConstraints();
        expect(otherParser.rawValidationRulesIndexes).to.deep.equal([]);
      });
    });
  });

  describe('#fillTypes', function() {
    // we need this var to roll back to the previous state after the test.
    var previousTypes = parser.databaseTypes.types;

    describe('when the types do not have a type from the XMI', function() {
      before(function() {
        parser.databaseTypes.types = {};
      });

      after(function() {
        parser.databaseTypes.types = previousTypes;
      });

      it('throws an exception', function() {
        try {
          parser.fillTypes();
          throw new ExpectationError();
        } catch (error) {
          expect(error.name).to.equal('InvalidTypeException');
        }
      });
    });

    describe('when types have the types from the XMI', function() {
      before(function() {
        parser.fillTypes();
      });

      it('assigns their id with their capitalized name', function() {
        var expectedTypes = [ 'BigDecimal', 'DateTime', 'Long' ];
        Object.keys(parser.parsedData.types).forEach(function(type) {
          if(parser.parsedData.types.hasOwnProperty(type)) {
            expect(
              expectedTypes
            ).to.include(parser.parsedData.getType(type).name);
            expectedTypes.splice(
              expectedTypes.indexOf(parser.parsedData.getType(type).name), 1);
          }
        });
        expect(expectedTypes.length).to.equal(0);
      });
    });

    describe('if the types are not capitalized', function() {
      it('capitalizes and adds them', function() {
        var otherParser =
          ParserFactory.createParser('./test/xmi/visualparadigm.uml', 'sql');
        otherParser.fillTypes();
        Object.keys(otherParser.parsedData.types).forEach(function(type) {
          expect(
            parser.parsedData.getType(type).name
          ).to.equal(_.capitalize(parser.parsedData.getType(type).name));
        });
      });
    });
  });

  describe('#fillEnums', function() {
    describe('when an enum has no name', function() {
      it('throws an exception', function() {
        var otherParser = ParserFactory.createParser(
          './test/xmi/visualparadigm_enum_no_name_test.uml',
          'sql');
        try {
          otherParser.parse();
          throw new ExpectationError();
        } catch (error) {
          expect(error.name).to.equal('NullPointerException');
        }
      });
    });

    describe('when an enum has no value', function() {
      it("doesn't throw any exception", function() {
        var otherParser = ParserFactory.createParser(
          './test/xmi/visualparadigm_enum_no_value_test.uml',
          'sql');
        otherParser.parse();
      });
    });

    describe('when an enum attribute has no name', function() {
      it('throws an exception', function() {
        var otherParser = ParserFactory.createParser(
          './test/xmi/visualparadigm_enum_no_attribute_name_test.uml',
          'sql');
        try {
          otherParser.parse();
          throw new ExpectationError();
        } catch (error) {
          expect(error.name).to.equal('NullPointerException');
        }
      });
    });

    describe('when an enum is well formed', function() {
      it('is parsed', function() {
        var otherParser = ParserFactory.createParser(
          './test/xmi/visualparadigm_enum_test.uml',
          'sql');
        otherParser.parse();
        var expectedNames = ['MyEnumeration2', 'MyEnumeration'];
        var expectedNValues = ['VALUE_A', 'VALUE_A', 'VALUE_B'];
        var names = [];
        var values = [];
        Object.keys(otherParser.parsedData.enums).forEach(function(enumId) {
          names.push(otherParser.parsedData.getEnum(enumId).name);
          otherParser.parsedData.getEnum(enumId).values.forEach(function(value) {
            values.push(value);
          });
        });
        expect(names).to.deep.equal(expectedNames);
        expect(values).to.deep.equal(expectedNValues);
      });
    });
  });

  describe('#fillClassesAndFields', function() {
    before(function() {
      parser.parse();
    });

    describe('when a class has no name', function() {
      it('throws an exception', function() {
        var otherParser = ParserFactory.createParser(
          './test/xmi/visualparadigm_no_class_name_test.uml',
          'sql'
        );
        try {
          otherParser.parse();
          throw new ExpectationError();
        } catch (error) {
          expect(error.name).to.equal('NullPointerException');
        }
      });
    });

    describe('when an attribute has no name', function() {
      it('throws an exception', function() {
        var otherParser = ParserFactory.createParser(
          './test/xmi/visualparadigm_no_attribute_name_test.uml',
          'sql');
        try {
          otherParser.parse();
          throw new ExpectationError();
        } catch (error) {
          expect(error.name).to.equal('NullPointerException');
        }
      });
    });

    describe('#addClass', function() {
      it('adds the found classes', function() {
        expect(Object.keys(parser.parsedData.classes).length).to.equal(9);
      });
    });

    describe('#addField', function() {
      describe('#addRegularField', function() {
        it('adds the fields', function() {
          expect(Object.keys(parser.parsedData.fields).length).to.equal(21);
        });

        it('adds the fields to the classes', function() {
          var count = 0;
          Object.keys(parser.parsedData.classes).forEach(function(element) {
            if (parser.parsedData.classes.hasOwnProperty(element)) {
              count += parser.parsedData.getClass(element).fields.length;
            }
          });
          expect(count).to.equal(Object.keys(parser.parsedData.fields).length);
        });

        describe('when having an invalid type in the XMI', function() {
          it('throws an exception', function() {
            var otherParser = ParserFactory.createParser(
              './test/xmi/visualparadigm_wrong_typename.uml',
              'sql');
            try {
              otherParser.parse();
              throw new ExpectationError();
            } catch (error) {
              expect(error.name).to.equal('InvalidTypeException');
            }
          });
        });

        describe(
            'when a type was not defined in a primitiveType tag',
            function() {
          it('is deduced from the field element, and added', function() {
            expect(parser.parsedData.getType('String').name).to.equal('String');
          });
        });
      });
    });
  });

  describe('#fillAssociations', function() {
    it('inserts the found associations', function() {
      expect(Object.keys(parser.parsedData.associations).length).to.equal(10);
    });

    describe('#addInjectedField', function() {
      it('adds the injected fields', function() {
        expect(Object.keys(parser.parsedData.injectedFields).length).to.equal(10);
      });
    });
  });
});


// external functions

function ExpectationError(message) {
  this.name = 'ExpectationError';
  this.message = (message || '');
}
ExpectationError.prototype = new Error();
