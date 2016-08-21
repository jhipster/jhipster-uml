'use strict';

const expect = require('chai').expect,
    fail = expect.fail,
    createEntities = require('../lib/entitiescreator').createEntities,
    ParserFactory = require('../lib/editors/parser_factory'),
    MongoDBTypes = require('../lib/types/mongodb_types');

var parser = ParserFactory.createParser({
  file: './test/xmi/modelio.xmi',
  databaseType: 'sql'
});
var parsedData = parser.parse();
var generatedEntities = createEntities({
  parsedData: parsedData,
  databaseTypes: parser.databaseTypes
});

describe('EntitiesCreator', function () {
  describe('#createEntities', function () {
    describe('when passing invalid args', function () {
      describe('because there is no argument', function () {
        it('fails', function () {
          try {
            createEntities();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe('because there are empty args', function () {
        it('fails', function () {
          try {
            createEntities({});
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe('because there is no parsed data', function () {
        it('fails', function () {
          try {
            createEntities({databaseTypes: 'NotNull'});
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe('because there are no database types', function () {
        it('fails', function () {
          try {
            createEntities({parsedData: 'NotNull'});
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe('because the user has relationships with a NoSQL database type', function () {
        it('fails', function () {
          var parser = ParserFactory.createParser({
            file: './test/xmi/modelio.xmi',
            databaseType: 'sql'
          });
          try {
            createEntities({
              parsedData: parser.parse(),
              databaseTypes: new MongoDBTypes()
            });
          } catch (error) {
            expect(error.name).to.eq('NoSQLModelingException');
          }
        });
      });
    });
    describe('when passing valid args', function () {
      var parser = ParserFactory.createParser({
        file: './test/xmi/modelio.xmi',
        databaseType: 'sql'
      });
      var parsedData = parser.parse();
      var entities = null;
      it('works', function () {
        entities = createEntities({
          parsedData: parsedData,
          databaseTypes: parser.databaseTypes
        });
        expect(entities == null).to.be.false;
        expect(Object.keys(entities).length).to.eq(8);
      });
      describe('with fields and relationships', function () {
        it('sets them', function () {
          var expectedRegion = {
            fields: [
              {
                "fieldName": "regionId",
                "fieldType": "Long"
              },
              {
                "fieldName": "regionName",
                "fieldType": "String"
              }
            ],
            relationships: []
          };
          var expectedCountry = {
            fields: [
              {
                "fieldName": "countryId",
                "fieldType": "Long"
              },
              {
                "fieldName": "countryName",
                "fieldType": "String"
              }
            ],
            relationships: [
              {
                "relationshipType": "one-to-one",
                "relationshipName": "region",
                "otherEntityName": "region",
                "otherEntityField": "id",
                "ownerSide": true,
                "otherEntityRelationshipName": "country",
                "relationshipValidateRules": "required"
              }
            ]
          };
          var expectedLocation = {
            fields: [
              {
                "fieldName": "locationId",
                "fieldType": "Long"
              },
              {
                "fieldName": "streetAddress",
                "fieldType": "String"
              },
              {
                "fieldName": "postalCode",
                "fieldType": "String"
              },
              {
                "fieldName": "city",
                "fieldType": "String"
              },
              {
                "fieldName": "stateProvince",
                "fieldType": "String"
              }
            ],
            relationships: [
              {
                "relationshipType": "one-to-one",
                "relationshipName": "country",
                "otherEntityName": "country",
                "otherEntityField": "id",
                "ownerSide": true,
                "otherEntityRelationshipName": "location",
                "relationshipValidateRules": "required"
              }
            ]
          };
          var expectedDepartment = {
            fields: [
              {
                "fieldName": "departmentId",
                "fieldType": "Long"
              },
              {
                "fieldName": "departmentName",
                "fieldType": "String"
              }
            ],
            relationships: [
              {
                "relationshipType": "one-to-one",
                "relationshipName": "location",
                "otherEntityName": "location",
                "otherEntityField": "id",
                "ownerSide": true,
                "otherEntityRelationshipName": "department",
                "relationshipValidateRules": "required"
              },
              {
                "relationshipType": "one-to-many",
                "relationshipName": "employee",
                "otherEntityName": "employee",
                "otherEntityRelationshipName": "department"
              }
            ]
          };
          var expectedEmployee = {
            fields: [
              {
                "fieldName": "employeeId",
                "fieldType": "Long"
              },
              {
                "fieldName": "firstName",
                "fieldType": "String"
              },
              {
                "fieldName": "lastName",
                "fieldType": "String"
              },
              {
                "fieldName": "email",
                "fieldType": "String"
              },
              {
                "fieldName": "phoneNumber",
                "fieldType": "String"
              },
              {
                "fieldName": "hireDate",
                "fieldType": "ZonedDateTime"
              },
              {
                "fieldName": "salary",
                "fieldType": "Long"
              },
              {
                "fieldName": "commissionPct",
                "fieldType": "Long"
              }
            ],
            relationships: [
              {
                "relationshipName": "department",
                "otherEntityName": "department",
                "relationshipType": "many-to-one",
                "otherEntityField": "id"
              },
              {
                "relationshipType": "one-to-many",
                "relationshipName": "job",
                "otherEntityName": "job",
                "otherEntityRelationshipName": "employee"
              },
              {
                "relationshipType": "many-to-one",
                "relationshipName": "manager",
                "otherEntityName": "employee",
                "otherEntityField": "id"
              }

            ]
          };
          var expectedJobHistory = {
            fields: [
              {
                "fieldName": "startDate",
                "fieldType": "ZonedDateTime",
                "fieldValidateRules": [
                  "required"
                ]
              },
              {
                "fieldName": "endDate",
                "fieldType": "ZonedDateTime"
              }
            ],
            relationships: [
              {
                "relationshipType": "one-to-one",
                "relationshipName": "job",
                "otherEntityName": "job",
                "otherEntityField": "id",
                "ownerSide": true,
                "otherEntityRelationshipName": "jobHistory",
                "relationshipValidateRules": "required"
              },
              {
                "relationshipType": "one-to-one",
                "relationshipName": "department",
                "otherEntityName": "department",
                "otherEntityField": "id",
                "ownerSide": true,
                "otherEntityRelationshipName": "jobHistory",
                "relationshipValidateRules": "required"
              },
              {
                "relationshipType": "one-to-one",
                "relationshipName": "employee",
                "otherEntityName": "employee",
                "otherEntityField": "id",
                "ownerSide": true,
                "otherEntityRelationshipName": "jobHistory",
                "relationshipValidateRules": "required"
              }
            ]
          };
          var expectedJob = {
            fields: [
              {
                "fieldName": "jobId",
                "fieldType": "Long"
              },
              {
                "fieldName": "jobTitle",
                "fieldType": "String"
              },
              {
                "fieldName": "minSalary",
                "fieldType": "Long"
              },
              {
                "fieldName": "maxSalary",
                "fieldType": "Long"
              }
            ],
            relationships: [
              {
                "relationshipType": "many-to-many",
                "relationshipName": "task",
                "otherEntityRelationshipName": "job",
                "otherEntityName": "task",
                "otherEntityField": "id",
                "ownerSide": true
              },
              {
                "relationshipName": "employee",
                "otherEntityName": "employee",
                "relationshipType": "many-to-one",
                "otherEntityField": "id"
              }
            ]
          };
          var expectedTask = {
            fields: [
              {
                "fieldName": "taskId",
                "fieldType": "Long"
              },
              {
                "fieldName": "title",
                "fieldType": "String"
              },
              {
                "fieldName": "description",
                "fieldType": "String"
              }
            ],
            relationships: [
              {
                "relationshipType": "many-to-many",
                "relationshipName": "job",
                "otherEntityName": "job",
                "ownerSide": false,
                "otherEntityRelationshipName": "task"
              }
            ]
          };
          var expected = {
            Region: expectedRegion,
            Country: expectedCountry,
            Location: expectedLocation,
            Department: expectedDepartment,
            Employee: expectedEmployee,
            JobHistory: expectedJobHistory,
            Job: expectedJob,
            Task: expectedTask
          };
          for (let clazz in parsedData.classes) {
            if (parsedData.classes.hasOwnProperty(clazz)) {
              expect(
                  entities[clazz].fields
              ).to.deep.eq(
                  expected[parsedData.classes[clazz].name].fields
              );
              expect(
                  entities[clazz].relationships
              ).to.deep.eq(
                  expected[parsedData.classes[clazz].name].relationships
              );
            }
          }
          for (let i = 0, entityNames = Object.keys(entities); i < entityNames.length; i++) {
            expect(entities[entityNames[i]].fluentMethods).to.eq(true);
          }
        });
      });
      describe('with no option and no microservice', function () {
        it('initializes entities with default values', function () {
          for (let entity in entities) {
            if (entities.hasOwnProperty(entity)) {
              expect(entities[entity].hasOwnProperty('fields')).to.be.true;
              expect(entities[entity].hasOwnProperty('relationships')).to.be.true;
              expect(entities[entity].dto).to.eq('no');
              expect(entities[entity].pagination).to.eq('no');
              expect(entities[entity].service).to.eq('no');
              expect(entities[entity].changelogDate).not.to.be.null;
              expect(entities[entity].entityTableName).not.to.be.null;
            }
          }
        });
      });
      describe('with microservice and search engine', function () {
        it('adds the options in the JSON', function () {
          var microserviceNames = {};
          var searchEngines = {};
          for (let clazz in parsedData.classes) {
            if (parsedData.classes.hasOwnProperty(clazz)) {
              microserviceNames[parsedData.classes[clazz].name] = 'ms';
              searchEngines[parsedData.classes[clazz].name] = 'elasticsearch';
            }
          }
          entities = createEntities({
            parsedData: parsedData,
            databaseTypes: parser.databaseTypes,
            microserviceNames: microserviceNames,
            searchEngines: searchEngines
          });
          for (let clazz in parsedData.classes) {
            if (parsedData.classes.hasOwnProperty(clazz)) {
              expect(entities[clazz].microserviceName).to.eq('ms');
              expect(entities[clazz].searchEngine).to.eq('elasticsearch');
            }
          }
        });
      });
      describe('with options', function () {
        it('adds them', function () {
          var listDTO = {};
          var listPagination = {};
          var listService = {};
          for (let clazz in parsedData.classes) {
            if (parsedData.classes.hasOwnProperty(clazz)) {
              listDTO[parsedData.classes[clazz].name] = 'mapstruct';
              listPagination[parsedData.classes[clazz].name] = 'pager';
              listService[parsedData.classes[clazz].name] = 'serviceClass';
            }
          }
          entities = createEntities({
            parsedData: parsedData,
            databaseTypes: parser.databaseTypes,
            listDTO: listDTO,
            listPagination: listPagination,
            listService: listService
          });
          for (let clazz in parsedData.classes) {
            if (parsedData.classes.hasOwnProperty(clazz)) {
              expect(entities[clazz].dto).to.eq('mapstruct');
              expect(entities[clazz].service).to.eq('serviceClass');
              expect(entities[clazz].pagination).to.eq('pager');
            }
          }
        });
      });
    });
  });
});
