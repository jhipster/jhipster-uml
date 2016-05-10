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
          var searchEngines = [];
          for (let clazz in parsedData.classes) {
            if (parsedData.classes.hasOwnProperty(clazz)) {
              microserviceNames[parsedData.classes[clazz].name] = 'ms';
              searchEngines.push(parsedData.classes[clazz].name);
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
        it('adds them', function() {
          var listDTO = [];
          var listPagination = {};
          var listService = {};
          for (let clazz in parsedData.classes) {
            if (parsedData.classes.hasOwnProperty(clazz)) {
              listDTO.push(parsedData.classes[clazz].name);
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
