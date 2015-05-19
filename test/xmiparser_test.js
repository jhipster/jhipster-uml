'use strict';

var chai = require('chai'),
    expect = chai.expect,
    XMIParser = require('../xmiparser');

var parser = new XMIParser('./test/modelio.xmi', 'sql');

describe('XMIParser', function() {
  describe('#initialize', function() {
    describe('when passing valid arguuments', function() {
      it('successfully creates a parser', function() {
        new XMIParser('./test/modelio.xmi', 'sql');
      });

      it('initializes each of its attributes', function() {
        expect(parser.getPrimitiveTypes()).not.to.equal(undefined);
        expect(parser.getClasses()).not.to.equal(undefined);
        expect(parser.getFields()).not.to.equal(undefined);
        expect(parser.getInjectedFields()).not.to.equal(undefined);
        expect(parser.getAssociations()).not.to.equal(undefined);

        expect(parser.rawPrimitiveTypesIndexes).not.to.equal(undefined);
        expect(parser.rawClassesIndexes).not.to.equal(undefined);
        expect(parser.rawAssociationsIndexes).not.to.equal(undefined);
        expect(parser.rawValidationRulesIndexes).not.to.equal(undefined);
      });
    });

    describe('when passing invalid arguments', function() {
      describe('such as an invalid XMI file', function() {
        describe('because it is null', function() {
          it('throws an exception', function() {
            try {
              new XMIParser(null, 'sql');
              fail();
            } catch (error) {
              expect(error.name).to.equal('WrongPassedArgumentException');
            }
          })
        });

        describe('because it is blank', function() {
          it('throws an exception', function() {
            try {
              new XMIParser('', 'sql');
              fail();
            } catch (error) {
              expect(error.name).to.equal('WrongPassedArgumentException');
            }
          })
        });

        describe('because it does not exist', function() {
          it('throws an exception', function() {
            try {
              new XMIParser('nofileatall', 'sql');
              fail();
            } catch (error) {
              expect(error.name).to.equal('WrongPassedArgumentException');
            }
          })
        });

        describe('because it is a folder', function() {
          it('throws an exception', function() {
            try {
              new XMIParser('.', 'sql');
              fail();
            } catch (error) {
              expect(error.name).to.equal('WrongPassedArgumentException');
            }
          })
        });
      });

      describe('such as an invalid database type name', function() {
        describe('because it is null', function() {
          it('throws an exception', function() {
            try {
              new XMIParser('./test/modelio.xmi', null);
              fail();
            } catch (error) {
              expect(error.name).to.equal('WrongDatabaseTypeException');
            }
          })
        });

        describe('because it is blank', function() {
          it('throws an exception', function() {
            try {
              new XMIParser('./test/modelio.xmi', '');
              fail();
            } catch (error) {
              expect(error.name).to.equal('WrongDatabaseTypeException');
            }
          })
        });

        describe('because it is not supported', function() {
          it('throws an exception', function() {
            try {
              new XMIParser('./test/modelio.xmi', 'isnotsupported');
              fail();
            } catch (error) {
              expect(error.name).to.equal('WrongDatabaseTypeException');
            }
          })
        });
      });
    })
  });

  describe('#parse', function() {
    describe('#findElements', function() {
      before(function() {
        parser.findElements();
      });

      describe('#findRawPackagedElements', function() {
        it('correctly fills the index arrays', function() {
          expect(parser.rawPrimitiveTypesIndexes).to.deep.equal([ 19, 20, 21] );
          expect(
            parser.rawClassesIndexes
          ).to.deep.equal([ 0, 4, 6, 9, 12, 14, 16, 17, 18 ]);
          expect(
            parser.rawAssociationsIndexes
          ).to.deep.equal([ 1, 2, 3, 5, 7, 8, 10, 11, 13, 15 ]);
        });
      });

      describe('#findRawOwnedRules', function() {
        it('correctly fills the validation index array', function() {
          expect(parser.rawValidationRulesIndexes).to.deep.equal([ 0 ]);
        });
      });
    });

    describe('#fillPrimitiveTypes', function() {
      // we need this var to roll back to the previous state after the test.
      var previousTypes = parser.types.types;

      describe('when the types do not have a type from the XMI', function() {
        before(function() {
          parser.types.types = {};
        });

        after(function() {
          parser.types.types = previousTypes;
        });

        it('throws an exception', function() {
          try {
            parser.fillPrimitiveTypes();
            fail();
          } catch (error) {
            expect(error.name).to.equal('InvalidTypeException');
          }
        });
      });

      describe('when types have the types from the XMI', function() {
        before(function() {
          parser.fillPrimitiveTypes();
        });
        it('assigns their id with their capitalized name', function() {
          var expectedTypes = [ 'DateTime', 'Long', 'Long' ];
          for(var element in parser.getPrimitiveTypes()) {
            expect(
              expectedTypes
            ).to.include(parser.getPrimitiveTypes()[element]);
            expectedTypes.splice(
              expectedTypes.indexOf(parser.getPrimitiveTypes()[element]), 1);
          }
          expect(expectedTypes.length).to.equal(0);
        });
      });
    });

    describe('#fillAssociations', function() {
      before(function() {
        parser.fillAssociations();
      });

      it('inserts the found associations', function() {
        expect(Object.keys(parser.getAssociations()).length).to.equal(10);
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
          expect(Object.keys(parser.getClasses()).length).to.equal(9);
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

      describe('#isAnId', function() {
        describe(
            "when passing fields that match 'id', with non-sensitive case",
            function() {
          it('returns true', function() {
            expect(parser.isAnId('id', 'Class')).to.equal(true);
            expect(parser.isAnId('Id', 'Class')).to.equal(true);
            expect(parser.isAnId('iD', 'Class')).to.equal(true);
            expect(parser.isAnId('ID', 'Class')).to.equal(true);
          });
        });

        describe('when passing fields matching : className + Id', function() {
          it('returns true', function() {
            expect(parser.isAnId('classId', 'Class')).to.equal(true);
          });
        });
      });

      describe('#addField', function() {
        describe('#addInjectedField', function() {
          it('adds the injected fields', function() {
            expect(Object.keys(parser.getClasses()).length).to.equal(9);
          });

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

          describe('#getCardinality', function() {
            describe('when passing an invalid injected field', function() {
              var falseInjectedField;

              before(function() {
                for (var element in parser.getInjectedFields()) {
                  if (parser.getInjectedFields()[element].cardinality == 'many-to-many') {
                    falseInjectedField = parser.getInjectedFields()[element];
                  }
                }
                falseInjectedField.aggregation = 'composition';
              });
              it('throws an exception', function() {
                try {
                  parser.getCardinality(falseInjectedField);
                } catch (error) {
                  expect(error.name).to.equal('NoCardinalityException');
                }
              })
            });

            describe('when passing a valid injected field', function() {
              describe('#isOneToOne', function() {
                describe('when passing valid parameters', function() {
                  it('returns true', function() {
                    expect(parser.isOneToOne(false, false)).to.equal(true);
                  });
                });

                describe('when passing invalid parameters', function() {
                  it('returns false', function() {
                    expect(parser.isOneToOne(true, true)).to.equal(false);
                    expect(parser.isOneToOne(true, false)).to.equal(false);
                    expect(parser.isOneToOne(false, true)).to.equal(false);
                  });
                });
              });

              describe('#isOneToMany', function() {
                describe('when passing valid parameters', function() {
                  it('returns true', function() {
                    expect(parser.isOneToMany(true, false)).to.equal(true);

                    expect(parser.isOneToMany(false, true)).to.equal(true);
                  });
                });

                describe('when passing invalid parameters', function() {
                  it('returns false', function() {
                    expect(parser.isOneToMany(true, true)).to.equal(false);

                    expect(parser.isOneToMany(false, false)).to.equal(false);
                  });
                });
              });

              describe('#isManyToMany', function() {
                describe('when passing valid parameters', function() {
                  it('returns true', function() {
                    expect(parser.isManyToMany(true, true)).to.equal(true);
                  });
                });

                describe('when passing invalid parameters', function() {
                  it('returns false', function() {
                    expect(parser.isManyToMany(false, false)).to.equal(false);

                    expect(parser.isManyToMany(false, true)).to.equal(false);

                    expect(parser.isManyToMany(true, false)).to.equal(false);
                  });
                });
              });
            });
          });
        });

        describe('#addRegularField', function() {
          it('adds the fields', function() {
            expect(Object.keys(parser.getFields()).length).to.equal(22);
          });

          it('adds the fields to the classes', function() {
            var count = 0;
            for(var element in parser.getClasses()) {
              count += parser.getClasses()[element]['fields'].length;
            }
            expect(count).to.equal(Object.keys(parser.getFields()).length);
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
              expect(parser.getPrimitiveTypes()['String']).to.equal('String');
              expect(parser.getPrimitiveTypes()['Integer']).to.equal('Integer');
            });
          });
        });
      });
    });

    describe('#fillValidationRules', function() {
      describe('when adding validations to the fields', function() {
        describe('if there is an invalid validation', function() {
          describe('because it has a value but no name', function() {
            it('throws an exception', function() {
              try {
                var otherParser = new XMIParser(
                  './test/NoValidationNameExceptionSample.xmi', 'sql');
                otherParser.parse();
                fail();
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
              previousTypes = parser.types.types;
              parser.types.types = {};
              var keys = Object.keys(previousTypes);
              for(var i = 0; i < keys.length; i++) {
                parser.types.types[keys[i]] = ['Nothing']
              }
            });

            after(function() {
              parser.types.types = previousTypes;
            });

            it('throws an exception', function() {
              try {
                parser.fillValidationRules();
                fail();
              } catch (error) {
                expect(error.name).to.equal('WrongValidationException');
              }
            });
          });
        });

        before(function() {
          parser.fillValidationRules();
        });

        it('adds the validations to the fields', function() {
          var count = 0;
          for (var element in parser.getFields()) {
            count += 
              Object.keys(parser.getFields()[element]['validations']).length;
          }
          expect(count).to.equal(1);
        });
      });
    });
  });
});
