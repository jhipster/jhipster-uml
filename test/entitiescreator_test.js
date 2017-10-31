/* eslint-disable no-unused-expressions */
const expect = require('chai').expect;

const fail = expect.fail;
const createEntities = require('../lib/entitiescreator').createEntities;
const ParserFactory = require('../lib/editors/parser_factory');
const MongoDBTypes = require('../lib/types/mongodb_types');
const winston = require('winston');

describe('EntitiesCreator', () => {
  describe('#createEntities', () => {
    describe('when passing invalid args', () => {
      describe('because there is no argument', () => {
        it('fails', () => {
          try {
            createEntities();
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe('because there are empty args, no parsed data and no database types', () => {
        it('fails', () => {
          try {
            createEntities({});
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe('because there is no parsed data', () => {
        it('fails', () => {
          try {
            createEntities(null, 'databaseTypes', {});
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe('because there are no database types', () => {
        it('fails', () => {
          try {
            createEntities('parsedData', null, {});
            fail();
          } catch (error) {
            winston.error(error);
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe('because the user has relationships with a NoSQL database type', () => {
        const parserData = ParserFactory.createParser({
          file: './test/xmi/modelio.xmi',
          databaseType: 'sql'
        });
        const parser = parserData.parser;
        const parsedData = parser.parse(parserData.data);

        it('fails', () => {
          try {
            createEntities(parsedData, new MongoDBTypes(), {});
            fail();
          } catch (error) {
            expect(error.name).to.eq('NoSQLModelingException');
          }
        });
      });
    });
    describe('when passing valid args', () => {
      const parserData = ParserFactory.createParser({
        file: './test/xmi/modelio.xmi',
        databaseType: 'sql'
      });
      const parser = parserData.parser;
      const parsedData = parser.parse(parserData.data);
      let entities;
      const invalidRequiredRelationshipParserData = ParserFactory.createParser({
        file: './test/xmi/modelio_required_one_to_many.xmi',
        databaseType: 'sql'
      });
      const invalidParser = invalidRequiredRelationshipParserData.parser;
      const invalidParsedData = invalidParser.parse(invalidRequiredRelationshipParserData.data);

      it('works', () => {
        entities = createEntities(parsedData, parserData.data.databaseTypes, {});
        expect(entities === null).to.be.false;
        expect(Object.keys(entities).length).to.eq(8);
      });
      describe('with fields and relationships', () => {
        it('sets them', () => {
          const expectedRegion = {
            fields: [
              {
                fieldName: 'regionId',
                fieldType: 'Long'
              },
              {
                fieldName: 'regionName',
                fieldType: 'String'
              }
            ],
            relationships: []
          };
          const expectedCountry = {
            fields: [
              {
                fieldName: 'countryId',
                fieldType: 'Long'
              },
              {
                fieldName: 'countryName',
                fieldType: 'String'
              }
            ],
            relationships: [
              {
                relationshipType: 'one-to-one',
                relationshipName: 'region',
                otherEntityName: 'region',
                otherEntityField: 'id',
                ownerSide: true,
                otherEntityRelationshipName: 'country',
                relationshipValidateRules: 'required'
              }
            ]
          };
          const expectedLocation = {
            fields: [
              {
                fieldName: 'locationId',
                fieldType: 'Long'
              },
              {
                fieldName: 'streetAddress',
                fieldType: 'String'
              },
              {
                fieldName: 'postalCode',
                fieldType: 'String'
              },
              {
                fieldName: 'city',
                fieldType: 'String'
              },
              {
                fieldName: 'stateProvince',
                fieldType: 'String'
              }
            ],
            relationships: [
              {
                relationshipType: 'one-to-one',
                relationshipName: 'country',
                otherEntityName: 'country',
                otherEntityField: 'id',
                ownerSide: true,
                otherEntityRelationshipName: 'location',
                relationshipValidateRules: 'required'
              }
            ]
          };
          const expectedDepartment = {
            fields: [
              {
                fieldName: 'departmentId',
                fieldType: 'Long'
              },
              {
                fieldName: 'departmentName',
                fieldType: 'String'
              }
            ],
            relationships: [
              {
                relationshipType: 'one-to-one',
                relationshipName: 'location',
                otherEntityName: 'location',
                otherEntityField: 'id',
                ownerSide: true,
                otherEntityRelationshipName: 'department',
                relationshipValidateRules: 'required'
              },
              {
                relationshipType: 'one-to-many',
                relationshipName: 'employee',
                otherEntityName: 'employee',
                otherEntityRelationshipName: 'department'
              }
            ]
          };
          const expectedEmployee = {
            fields: [
              {
                fieldName: 'employeeId',
                fieldType: 'Long'
              },
              {
                fieldName: 'firstName',
                fieldType: 'String'
              },
              {
                fieldName: 'lastName',
                fieldType: 'String'
              },
              {
                fieldName: 'email',
                fieldType: 'String'
              },
              {
                fieldName: 'phoneNumber',
                fieldType: 'String'
              },
              {
                fieldName: 'hireDate',
                fieldType: 'ZonedDateTime'
              },
              {
                fieldName: 'salary',
                fieldType: 'Long'
              },
              {
                fieldName: 'commissionPct',
                fieldType: 'Long'
              }
            ],
            relationships: [
              {
                relationshipName: 'department',
                otherEntityName: 'department',
                relationshipType: 'many-to-one',
                otherEntityField: 'id'
              },
              {
                relationshipType: 'one-to-many',
                relationshipName: 'job',
                otherEntityName: 'job',
                otherEntityRelationshipName: 'employee'
              },
              {
                relationshipType: 'many-to-one',
                relationshipName: 'manager',
                otherEntityName: 'employee',
                otherEntityField: 'id'
              }

            ]
          };
          const expectedJobHistory = {
            fields: [
              {
                fieldName: 'startDate',
                fieldType: 'ZonedDateTime',
                fieldValidateRules: [
                  'required'
                ]
              },
              {
                fieldName: 'endDate',
                fieldType: 'ZonedDateTime'
              }
            ],
            relationships: [
              {
                relationshipType: 'one-to-one',
                relationshipName: 'job',
                otherEntityName: 'job',
                otherEntityField: 'id',
                ownerSide: true,
                otherEntityRelationshipName: 'jobHistory',
                relationshipValidateRules: 'required'
              },
              {
                relationshipType: 'one-to-one',
                relationshipName: 'department',
                otherEntityName: 'department',
                otherEntityField: 'id',
                ownerSide: true,
                otherEntityRelationshipName: 'jobHistory',
                relationshipValidateRules: 'required'
              },
              {
                relationshipType: 'one-to-one',
                relationshipName: 'employee',
                otherEntityName: 'employee',
                otherEntityField: 'id',
                ownerSide: true,
                otherEntityRelationshipName: 'jobHistory',
                relationshipValidateRules: 'required'
              }
            ]
          };
          const expectedJob = {
            fields: [
              {
                fieldName: 'jobId',
                fieldType: 'Long'
              },
              {
                fieldName: 'jobTitle',
                fieldType: 'String'
              },
              {
                fieldName: 'minSalary',
                fieldType: 'Long'
              },
              {
                fieldName: 'maxSalary',
                fieldType: 'Long'
              }
            ],
            relationships: [
              {
                relationshipType: 'many-to-many',
                relationshipName: 'task',
                otherEntityRelationshipName: 'job',
                otherEntityName: 'task',
                otherEntityField: 'id',
                ownerSide: true
              },
              {
                relationshipName: 'employee',
                otherEntityName: 'employee',
                relationshipType: 'many-to-one',
                otherEntityField: 'id'
              }
            ]
          };
          const expectedTask = {
            fields: [
              {
                fieldName: 'taskId',
                fieldType: 'Long'
              },
              {
                fieldName: 'title',
                fieldType: 'String'
              },
              {
                fieldName: 'description',
                fieldType: 'String'
              }
            ],
            relationships: [
              {
                relationshipType: 'many-to-many',
                relationshipName: 'job',
                otherEntityName: 'job',
                ownerSide: false,
                otherEntityRelationshipName: 'task'
              }
            ]
          };
          const expected = {
            Region: expectedRegion,
            Country: expectedCountry,
            Location: expectedLocation,
            Department: expectedDepartment,
            Employee: expectedEmployee,
            JobHistory: expectedJobHistory,
            Job: expectedJob,
            Task: expectedTask
          };
          Object.keys(parsedData.classes).forEach((clazz) => {
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
          });
          for (let i = 0, entityNames = Object.keys(entities); i < entityNames.length; i++) {
            expect(entities[entityNames[i]].fluentMethods).to.eq(false);
          }
        });
      });
      describe('with no option and no microservice', () => {
        it('initializes entities with default values', () => {
          Object.keys(entities).forEach((entity) => {
            expect('fields' in entities[entity]).to.be.true;
            expect('relationships' in entities[entity]).to.be.true;
            expect(entities[entity].dto).to.eq('no');
            expect(entities[entity].pagination).to.eq('no');
            expect(entities[entity].service).to.eq('no');
            expect(entities[entity].changelogDate).not.to.be.null;
            expect(entities[entity].entityTableName).not.to.be.null;
          });
        });
      });
      describe('with microservice and search engine', () => {
        it('adds the options in the JSON', () => {
          const microserviceNames = {};
          const searchEngines = {};
          Object.keys(parsedData.classes).forEach((clazz) => {
            microserviceNames[parsedData.classes[clazz].name] = 'ms';
            searchEngines[parsedData.classes[clazz].name] = 'elasticsearch';
          });
          entities = createEntities(parsedData, parserData.data.databaseTypes, {
            microserviceNames,
            searchEngines
          });
          Object.keys(parsedData.classes).forEach((clazz) => {
            microserviceNames[parsedData.classes[clazz].name] = 'ms';
            searchEngines[parsedData.classes[clazz].name] = 'elasticsearch';
          });
        });
      });
      describe('with options', () => {
        it('adds them', () => {
          const listDTO = {};
          const listPagination = {};
          const listService = {};
          Object.keys(parsedData.classes).forEach((clazz) => {
            listDTO[parsedData.classes[clazz].name] = 'mapstruct';
            listPagination[parsedData.classes[clazz].name] = 'pager';
            listService[parsedData.classes[clazz].name] = 'serviceClass';
          });
          entities = createEntities(parsedData, parserData.data.databaseTypes, {
            listDTO,
            listPagination,
            listService
          });
          Object.keys(parsedData.classes).forEach((clazz) => {
            expect(entities[clazz].dto).to.eq('mapstruct');
            expect(entities[clazz].service).to.eq('serviceClass');
            expect(entities[clazz].pagination).to.eq('pager');
          });
        });
      });
      describe('when passing a model with a one-to-many (required)', () => {
        it('does not fail', () => {
          createEntities(
            invalidParsedData,
            invalidRequiredRelationshipParserData.data.databaseTypes,
            {});
        });
      });
    });
  });
});
