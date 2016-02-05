'use strict';

var expect = require('chai').expect,
    fail = expect.fail,
    ParserFactory = require('../../lib/editors/parser_factory');

var parser = ParserFactory.createParser('./test/xmi/modelio.xmi', 'sql');

describe('ModelioParser', function() {
  describe('#findElements',function() {
    before(function() {
      parser.findElements();
    });

    it('finds the classes in the document', function() {
      expect(
        parser.rawClassesIndexes
      ).to.deep.equal([ 0, 4, 6, 9, 12, 14, 16, 17 ]);
    });

    it('finds the types in the document', function() {
      expect(
        parser.rawTypesIndexes
      ).to.deep.equal([ 18, 19 ]);
    });

    it('finds the enumerations in the document', function() {
      var otherParser =
        ParserFactory.createParser('./test/xmi/modelio_enum_test.xmi', 'sql');
      otherParser.findElements();
      expect(otherParser.rawEnumsIndexes).to.deep.equal([ 1, 2 ]);
    });

    it('finds the associations in the document', function() {
      expect(
        parser.rawAssociationsIndexes
      ).to.deep.equal([ 1, 2, 3, 5, 7, 8, 10, 11, 13, 15 ]);
    });
  });

  describe('#findConstraints', function() {
    before(function() {
      parser.findConstraints();
    });

    describe('when having a document with a validation', function() {
      it('finds the constraints in the document', function() {
        expect(parser.rawValidationRulesIndexes).to.deep.equal([ 0 ]);
      });
    });

    describe('when having a document with no validation', function() {
      it('does not do anything', function() {
        var otherParser = ParserFactory.createParser(
          './test/xmi/modelio_user_class_test.xmi',
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
        var expectedTypes = [ 'ZonedDateTime', 'Long' ];
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

      describe('if the types are not capitalized', function() {
        it('capitalizes and adds them', function() {
          var otherParser = ParserFactory.createParser(
            './test/xmi/modelio_lowercased_string_type.xmi',
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
  });

  describe('#fillEnums', function() {
    describe('when an enum has no name', function() {
      it('throws an exception', function() {
        var otherParser = ParserFactory.createParser(
          './test/xmi/modelio_enum_no_name_test.xmi',
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
          './test/xmi/modelio_enum_no_value_test.xmi',
          'sql');
        otherParser.parse();
      });
    });

    describe('when an enum attribute has no name', function() {
      it('throws an exception', function() {
        var otherParser = ParserFactory.createParser(
          './test/xmi/modelio_enum_no_attribute_name_test.xmi',
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
          './test/xmi/modelio_enum_test.xmi',
          'sql');
        otherParser.parse();
        var expectedNames = ['MyEnumeration', 'MySecondEnumeration'];
        var expectedNValues = ['VALUE_A', 'VALUE_B', 'VALUE_A'];
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
      parser.fillAssociations();
    });

    it('inserts the found associations', function() {
      expect(Object.keys(parser.parsedData.associations).length).to.equal(10);
    });
  });

  describe('#fillClassesAndFields', function() {
    before(function() {
      parser.fillClassesAndFields();
    });

    describe('when a class has no name', function() {
      it('throws an exception', function() {
        var otherParser = ParserFactory.createParser(
          './test/xmi/modelio_no_class_name_test.xmi',
          'sql');
        otherParser.findElements();
        try {
          otherParser.fillClassesAndFields();
          throw new ExpectationError();
        } catch (error) {
          expect(error.name).to.equal('NullPointerException');
        }
      });
    });

    describe('when an attribute has no name', function() {
      it('throws an exception', function() {
        var otherParser = ParserFactory.createParser(
          './test/xmi/modelio_no_attribute_name_test.xmi',
          'sql');
        otherParser.findElements();
        try {
          otherParser.fillClassesAndFields();
          throw new ExpectationError();
        } catch (error) {
          expect(error.name).to.equal('NullPointerException');
        }
      });
    });

    describe('#addClass', function() {
      it('adds the found classes', function() {
        expect(Object.keys(parser.parsedData.classes).length).to.equal(8);
      });

      it("adds the comment if there's any", function(){
        var otherParser = ParserFactory.createParser('./test/xmi/modelio_comments.xmi', 'sql');
        var parsedData = otherParser.parse();
        Object.keys(parsedData.classes).forEach(function(classData) {
          expect(parsedData.getClass(classData).comment).not.to.be.undefined;
          expect(parsedData.getClass(classData).comment).not.to.equal('');
        });
      });
    });

    describe('#addField', function() {
      describe('#addRegularField', function() {
        it('adds the fields', function() {
          expect(Object.keys(parser.parsedData.fields).length).to.equal(28);
        });

        it("adds the comment if there's any", function(){
          var otherParser = ParserFactory.createParser('./test/xmi/modelio_comments.xmi', 'sql');
          var parsedData = otherParser.parse();
          Object.keys(parsedData.fields).forEach(function(fieldData) {
            expect(parsedData.getField(fieldData).comment).not.to.be.undefined;
            expect(parsedData.getField(fieldData).comment).not.to.equal('');
          });
        });

        describe('when trying to add a field whose name is capitalized', function() {
          it('decapitalizes and adds it', function() {
            var otherParser = ParserFactory.createParser('./test/xmi/modelio_capitalized_field_names.xmi', 'sql');
            var parsedData = otherParser.parse();
            if (Object.keys(parsedData.fields).length === 0) {
              fail();
            }
            Object.keys(parsedData.fields).forEach(function(fieldData) {
              if (parsedData.fields[fieldData].name.match('^[A-Z].*')) {
                fail();
              }
            });
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

        describe('when having an invalid type in the XMI', function() {
          it('throws an exception', function() {
            var otherParser = ParserFactory.createParser(
              './test/xmi/modelio_wrong_typename.xmi',
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

    describe('#fillConstraints', function() {
      describe('when adding validations to the fields', function() {
        describe('if there is an invalid validation', function() {

          describe('because it has a value but no name', function() {
            it('throws an exception', function() {
              var otherParser = ParserFactory.createParser(
                './test/xmi/modelio_no_validation_name_test.xmi',
                'sql');
              otherParser.findConstraints();
              try {
                otherParser.fillConstraints();
                throw new ExpectationError();
              } catch (error) {
                expect(
                  error.name
                ).to.equal('NoValidationNameException');
              }
            });
          });

          describe('because it is not supported by the database', function() {
            var previousTypes;

            before(function() {
              previousTypes = parser.databaseTypes.types;
              parser.databaseTypes.types = {};
              var keys = Object.keys(previousTypes);
              for(var i = 0; i < keys.length; i++) {
                parser.databaseTypes.types[keys[i]] = ['Nothing'];
              }
            });

            after(function() {
              parser.databaseTypes.types = previousTypes;
            });

            it('throws an exception', function() {
              try {
                parser.fillConstraints();
                fail();
              } catch (error) {
                expect(error.name).to.equal('WrongValidationException');
              }
            });
          });
        });

        before(function() {
          parser.fillConstraints();
        });

        it('adds the validations to the fields', function() {
          var count = 0;
          for (var element in parser.parsedData.fields) {
            if (parser.parsedData.fields.hasOwnProperty(element)) {
              count +=
                Object.keys(parser.parsedData.getField(element)['validations']).length;
            }
          }
          expect(count).to.equal(1);
        });
      });
    });
  });
});
