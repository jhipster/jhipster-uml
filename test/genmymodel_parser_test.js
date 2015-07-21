'use strict';

var chai = require('chai'),
    expect = chai.expect,
    gmp = require('../lib/editors/genmymodel_parser'),
    ParserFactory = require('../lib/editors/parser_factory');

var parser = ParserFactory.createParser(
  './test/xmi/genmymodel_evolve.xmi',
  'sql');

var parserWrongType = ParserFactory.createParser(
  './test/xmi/genmymodel_wrong_type.xmi',
  'sql');

describe('GenMyModelParser', function() {
  describe('#findElements',function() {
    before(function() {
      parser.findElements();
    });

    it('finds the classes in the document', function() {
      expect(
        parser.rawClassesIndexes
      ).to.deep.equal([ 0, 3, 6]);
    });

    it('finds the types in the document', function() {
      expect(
        parser.rawTypesIndexes
      ).to.deep.equal([ 1,2]);
    });

    it('find the enumerations in the document', function() {
      var otherParser =
        ParserFactory.createParser('./test/xmi/genmymodel_enum_test.xml', 'sql');
      otherParser.findElements();
      expect(otherParser.rawEnumsIndexes).to.deep.equal([ 1, 2 ]);
    });

    it('finds the associations in the document', function() {
       expect(
        parser.rawAssociationsIndexes
      ).to.deep.equal([ 4,5,7 ]);
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
        var expectedTypes = [ 'LocalDate', 'BigDecimal' ];
        for(var element in parser.getTypes()) {
          if (parser.getTypes().hasOwnProperty(element)) {
            expect(
              expectedTypes
            ).to.include(parser.getTypes()[element]);
            expectedTypes.splice(
              expectedTypes.indexOf(parser.getTypes()[element]), 1);
          }
        }
        expect(expectedTypes.length).to.equal(0);
      });
    });

    describe('if the types are not capitalized', function() {
      it('capitalizes and adds them', function() {
        var otherParser = ParserFactory.createParser(
          './test/xmi/genmymodel_lowercased_string_type.xml',
          'sql');
        otherParser.fillTypes();
        Object.keys(otherParser.getTypes()).forEach(function(type) {
          expect(
            otherParser.getTypes()[type].name
          ).to.equal(_.capitalize(otherParser.getTypes()[type].name));
        });
      });
    });
  });

  describe('#fillConstraints', function() {
    describe('when an enum has no name', function() {
      it('throws an exception', function() {
        var otherParser = ParserFactory.createParser(
          './test/xmi/genmymodel_enum_no_name_test.xml',
          'sql');
        try {
          otherParser.parse();
          throw new ExpectationError();
        } catch (error) {
          expect(error.name).to.equal('NullPointerException');
        }
      });
    });

    describe('when an enum attribute has no name', function() {
      it('throws an exception', function() {
        var otherParser = ParserFactory.createParser(
          './test/xmi/genmymodel_enum_no_attribute_name_test.xml',
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
          './test/xmi/genmymodel_enum_test.xml',
          'sql');
        otherParser.parse();
        var expectedNames = ['MyEnumeration', 'MyEnumeration2'];
        var expectedNValues = ['LITERAL1', 'LITERAL2', 'LITERAL'];
        var names = [];
        var values = [];
        Object.keys(otherParser.getEnums()).forEach(function(element) {
          names.push(otherParser.getEnums()[element].name);
          otherParser.getEnums()[element].values.forEach(function(value) {
            values.push(value);
          });
        });
        expect(names).to.deep.equal(expectedNames);
        expect(values).to.deep.equal(expectedNValues);
      });
    });
  });

  describe('#fillAssociations', function() {
    before(function() {
      parser.fillClassesAndFields();
      parser.fillAssociations();
    });

    it('inserts the found associations', function() {
      expect(Object.keys(parser.getAssociations()).length).to.equal(3);
    });

    describe("when trying to access an element's attributes", function() {
      var firstElementKeys;

      before(function() {
        firstElementKeys = Object.keys(
          parser.getAssociations()[Object.keys(parser.getAssociations())[0]]);
      })

      it('has a name', function() {
        expect(firstElementKeys).to.include('name');
      });

      it('has a type', function() {
        expect(firstElementKeys).to.include('type');
      });

      it('has a flag telling if it has an upper value', function() {
        expect(firstElementKeys).to.include('isUpperValuePresent');
      });
    });
  });

  describe('#fillClassesAndFields', function() {
    before(function() {
      parser.fillClassesAndFields();
    });

    describe('#addClass', function() {
      it('adds the found classes', function() {
        expect(Object.keys(parser.getClasses()).length).to.equal(3);
      });

      describe("when trying to access an element's attributes", function() {
        var firstElementKeys;

        before(function() {
          firstElementKeys = Object.keys(
            parser.getClasses()[Object.keys(parser.getClasses())[0]]);
        });

        it('has a name', function() {
          expect(firstElementKeys).to.include('name');
        });

        it('has fields', function() {
          expect(firstElementKeys).to.include('fields');
        });

        it('has injected fields', function() {
          expect(firstElementKeys).to.include('injectedFields');
        });

      });
    });

    describe('#addField', function() {
      describe('#addInjectedField', function() {

        describe("when trying to access an element's attributes", function() {
          var firstElementKeys;

          before(function() {
            firstElementKeys = Object.keys(
              parser.getInjectedFields()[
                Object.keys(parser.getInjectedFields())[0]]);
          });

          it('has a name', function() {
            expect(firstElementKeys).to.include('name');
          });

          it('has a type', function() {
            expect(firstElementKeys).to.include('type');
          });

          it('has a association', function() {
            expect(firstElementKeys).to.include('association');
          });

          it('has a class', function() {
            expect(firstElementKeys).to.include('class');
          });

          it('has a flag if the upper value is present', function() {
            expect(firstElementKeys).to.include('isUpperValuePresent');
          });

          it('has a cardinality', function() {
            expect(firstElementKeys).to.include('cardinality');
          });
        });
      });

      describe('#addRegularField', function() {
        it('adds the fields', function() {
          expect(Object.keys(parser.getFields()).length).to.equal(2);
        });

        it('adds the fields to the classes', function() {
          var count = 0;
          for(var element in parser.getClasses()) {
            if (parser.getClasses().hasOwnProperty(element)) {
              count += parser.getClasses()[element]['fields'].length;
            }
          }
          expect(count).to.equal(Object.keys(parser.getFields()).length);
        });

        describe("when trying to add an injectedFields with an invalid type", function(){
          before(function() {
            parserWrongType.findElements();
            parserWrongType.fillTypes();
          });
          it('thows an exception',  function() {
            try {
              parserWrongType.fillClassesAndFields();
              throw new ExpectationError();
            } catch (error) {
              expect(error.name).to.equal('InvalidTypeException');
            }
          });
        });

        describe("when trying to access an element's attributes", function() {
          var firstElementKeys;

          before(function() {
            firstElementKeys = Object.keys(
              parser.getFields()[
                Object.keys(parser.getFields())[0]]);
          });

          it('has a name', function() {
            expect(firstElementKeys).to.include('name');
          });

          it('has validations', function() {
            expect(firstElementKeys).to.include('validations');
          });

          it('has a type', function() {
            expect(firstElementKeys).to.include('type');
          });
        });

        describe(
            'when a type was not defined in a primitiveType tag',
            function() {
          it('is deduced from the field element, and added', function() {
            expect(parser.getTypes()['String']).to.equal('String');
          });
        });
      });
    });
  });
});


function ExpectationError(message) {
  this.name = 'ExpectationError';
  this.message = (message || '');
}
ExpectationError.prototype = new Error();

function WrongValidationException(message) {
  this.name = 'WrongValidationException';
  this.message = (message || '');
}
WrongValidationException.prototype = new Error();
