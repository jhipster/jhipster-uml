'use strict';

var chai = require('chai'),
    expect = chai.expect,
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
        var otherParser = ParserFactory.createParser(
          './test/xmi/genmymodel_lowercased_string_type.xml',
          'sql');
        otherParser.fillTypes();
        Object.keys(otherParser.parsedData.types).forEach(function(type) {
          expect(
            parser.parsedData.getType(type).name
          ).to.equal(_.capitalize(parser.parsedData.getType(type).name));
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

    describe('when an enum has no value', function() {
      it("doesn't throw any exception", function() {
        var otherParser = ParserFactory.createParser(
          './test/xmi/genmymodel_enum_no_value_test.xml',
          'sql');
        otherParser.parse();
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

  describe('#fillAssociations', function() {
    before(function() {
      parser.fillClassesAndFields();
      parser.fillAssociations();
    });

    it('inserts the found associations', function() {
      expect(Object.keys(parser.parsedData.associations).length).to.equal(3);
    });
  });

  describe('#fillClassesAndFields', function() {
    before(function() {
      parser.fillClassesAndFields();
    });

    describe('#addClass', function() {
      it('adds the found classes', function() {
        expect(Object.keys(parser.parsedData.classes).length).to.equal(3);
      });

      it("adds the comment if there's any", function(){
        var otherParser = ParserFactory.createParser('./test/xmi/genmymodel_comments.xml', 'sql');
        var parsedData = otherParser.parse();
        Object.keys(parsedData.classes).forEach(function(classData) {
          expect(parsedData.getClass(classData)).not.to.be.undefined;
          expect(parsedData.getClass(classData)).not.to.equal('');
        });
      });
    });

    describe('#addField', function() {
      describe('#addInjectedField', function() {
        it('adds the injected fields', function() {
          expect(Object.keys(parser.parsedData.injectedFields).length).to.equal(3);
        });


        it("adds the comment if there's any", function(){
          var otherParser = ParserFactory.createParser('./test/xmi/genmymodel_comments.xml', 'sql');
          var parsedData = otherParser.parse();
          Object.keys(parsedData.injectedFields).forEach(function(injectedFieldData) {
            expect(parsedData.getInjectedField(injectedFieldData)).not.to.be.undefined;
            expect(parsedData.getInjectedField(injectedFieldData)).not.to.equal('');
          });
        });
      });

      describe('#addRegularField', function() {
        it('adds the fields', function() {
          expect(Object.keys(parser.parsedData.fields).length).to.equal(2);
        });

        it("adds the comment if there's any", function(){
          var otherParser = ParserFactory.createParser('./test/xmi/genmymodel_comments.xml', 'sql');
          var parsedData = otherParser.parse();
          Object.keys(parsedData.fields).forEach(function(fieldData) {
            expect(parsedData.getField(fieldData)).not.to.be.undefined;
            expect(parsedData.getField(fieldData)).not.to.equal('');
          });
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
