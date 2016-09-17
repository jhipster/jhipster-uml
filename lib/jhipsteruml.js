'use strict';

const argv = require('./jhipsteruml/command_line_handler').argv,
    buildException = require('./exceptions/exception_factory').buildException,
    exceptions = require('./exceptions/exception_factory').exceptions;

if (Object.keys(argv).length < 3) {
  throw new buildException(
      exceptions.WrongCall,
      'Wrong argument number specified, an input file and (optionally) '
      + "the database type ('sql', 'mongodb' or 'cassandra') must be supplied.\n"
      + "Use the command 'jhipster-uml -help' to see the available commands.");
}

const fs = require('fs'),
    chalk = require('chalk'),
    createEntities = require('./entitiescreator').createEntities,
    ParserFactory = require('./editors/parser_factory'),
    jhipsterOptionHelper = require('./helpers/jhipster_option_helper'),
    generateEntities = require('./entity_generator').generateEntities,
    isYoRcFilePresent = require('./utils/jhipster_utils').isYoRcFilePresent,
    readJSONFiles = require('./utils/jhipster_utils').readJSONFiles,
    areJHipsterEntitiesEqual = require('./helpers/object_helper').areJHipsterEntitiesEqual,
    values = require('./utils/object_utils').values,
    exportToJSON = require('./export/json_exporter').exportToJSON,
    toJDLString = require('./export/jdl_exporter').toJDLString,
    getEntitiesToGenerate = require('./jhipsteruml/entities_to_generate_handler').getEntitiesToGenerate,
    writeFile = require('./export/file_writer').writeFile;

if (!isYoRcFilePresent()) {
  console.info(
      chalk.yellow(
          'Warning: you are using JHipster UML outside a JHipster project and '
          + 'some files might not be correctly generated.'));
}

if (!argv.db && !isYoRcFilePresent()) {
  throw new buildException(
      exceptions.WrongCall,
      'The database type must either be supplied with the -db option, '
      + 'or a .yo-rc.json file must exist in the current directory.\n'
      + "Use the command 'jhipster-uml -help' to see the available options."
  );
} else {
  argv.db = argv.db || JSON.parse(
          fs.readFileSync('./.yo-rc.json')
      )['generator-jhipster'].databaseType;
}

var noUserManagement = argv['skip-user-management'] != null;

var parser = ParserFactory.createParser(initParserFactoryArgs());
var parsedData = parser.parse();

var force = false;
// todo: have an object instead of several variables
var listDTO = (argv.dto) ? jhipsterOptionHelper.askForDTO(parsedData.classes, argv.dto) : {};
var listPagination = (argv.paginate) ? jhipsterOptionHelper.askForPagination(parsedData.classes, argv.paginate) : {};
var listService = (argv.service) ? jhipsterOptionHelper.askForService(parsedData.classes, argv.service) : {};
var listOfNoClient = (argv['skip-client']) ? jhipsterOptionHelper.askForClassesToSkipClientCode(parsedData.classes) : [];
var listOfNoServer = (argv['skip-server']) ? jhipsterOptionHelper.askForClassesToSkipServerCode(parsedData.classes) : [];
var angularSuffixes = (argv['angular-suffix']) ? jhipsterOptionHelper.askForAngularSuffixes(parsedData.classes, argv['angular-suffix']) : {};
var microserviceNames = (argv['microservice-name']) ? jhipsterOptionHelper.askForMicroserviceNames(parsedData.classes, argv['microservice-name']) : {};
var searchEngines = (argv['search-engine']) ? jhipsterOptionHelper.askForSearchEngines(parsedData.classes, argv['search-engine']) : {};
var noFluentMethods = (argv['no-fluent-methods']) ? jhipsterOptionHelper.askForClassesWithNoFluentMethods(parsedData.classes) : [];

if (argv['to-jdl']) {
  writeJdlFile(argv['to-jdl'], parsedData, {
    listDTO: listDTO,
    listPagination: listPagination,
    listService: listService,
    listOfNoClient: listOfNoClient,
    listOfNoServer: listOfNoServer,
    angularSuffixes: angularSuffixes,
    microserviceNames: microserviceNames,
    searchEngines: searchEngines
  });
  process.exit(0);
}

var entities = createEntities({
  parsedData: parsedData,
  databaseTypes: parser.databaseTypes,
  listDTO: listDTO,
  listPagination: listPagination,
  listService: listService,
  microserviceNames: microserviceNames,
  searchEngines: searchEngines,
  noUserManagement: noUserManagement
});

var entityIdsByName = {};
for (let i = 0, entityIds = Object.keys(parsedData.classes); i < parsedData.classNames.length; i++) {
  entityIdsByName[parsedData.getClass(entityIds[i]).name] = entityIds[i];
}
var entityNamesToGenerate = filterOutUnchangedEntities(entities, parsedData); // todo change it, or the next called functions?

try {
  fs.statSync('.juml').isFile();
  if (entityNamesToGenerate.length !== 0) {
    entityNamesToGenerate = getEntitiesToGenerate(entityNamesToGenerate);
  }
} catch (error) {
  force = true;
  writeFile({
    fileName: '.juml',
    content: ''
  });
}

exportToJSON(entities, values(entityIdsByName), parsedData, entityNamesToGenerate);
generateEntities(values(entityIdsByName), parsedData.classes, entityNamesToGenerate, force,
    listOfNoClient, listOfNoServer, angularSuffixes, noUserManagement, noFluentMethods);

function initParserFactoryArgs() {
  var parserFactoryArgs = {databaseType: argv.db, noUserManagement: noUserManagement};
  if (argv['_'].length >= 1) {
    parserFactoryArgs.file = argv['_'][0];
  } else {
    console.error('At least one file to parse must be passed.');
    process.exit(1);
  }
  return parserFactoryArgs;
}
function filterOutUnchangedEntities(entities, parsedData) {
  var onDiskEntities = readJSONFiles(parsedData.classNames);
  return parsedData.classNames.filter(function (name) {
    var currEntity = onDiskEntities[name];
    var newEntity = entities[entityIdsByName[name]];
    if (!currEntity) {
      return true;
    }
    return !areJHipsterEntitiesEqual(currEntity, newEntity);
  });
}
function writeJdlFile(fileName, parsedData, options) {
  writeFile({
    fileName: argv['to-jdl'],
    content: toJDLString(parsedData, options)
  });
  console.log(`The file '${argv['to-jdl']}' has been written.`);
}
