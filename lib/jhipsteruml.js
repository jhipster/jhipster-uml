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
    isJumlFilePresent = require('./utils/jhipster-uml_utils').isJumlFilePresent,
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
var parserData = ParserFactory.createParser(initParserFactoryArgs());
var parser = parserData.parser;
var parsedData = parser.parse(parserData.data);

var options = {
  force: false,
  listDTO: (argv.dto) ? jhipsterOptionHelper.askForDTO(parsedData.classes, argv.dto) : {},
  listPagination: (argv.paginate) ? jhipsterOptionHelper.askForPagination(parsedData.classes, argv.paginate) : {},
  listService: (argv.service) ? jhipsterOptionHelper.askForService(parsedData.classes, argv.service) : {},
  listOfNoClient: (argv['skip-client']) ? jhipsterOptionHelper.askForClassesToSkipClientCode(parsedData.classes) : [],
  listOfNoServer: (argv['skip-server']) ? jhipsterOptionHelper.askForClassesToSkipServerCode(parsedData.classes) : [],
  angularSuffixes: (argv['angular-suffix']) ? jhipsterOptionHelper.askForAngularSuffixes(parsedData.classes, argv['angular-suffix']) : {},
  microserviceNames: (argv['microservice-name']) ? jhipsterOptionHelper.askForMicroserviceNames(parsedData.classes, argv['microservice-name']) : {},
  searchEngines: (argv['search-engine']) ? jhipsterOptionHelper.askForSearchEngines(parsedData.classes, argv['search-engine']) : {},
  noFluentMethods: (argv['no-fluent-methods']) ? jhipsterOptionHelper.askForClassesWithNoFluentMethods(parsedData.classes) : []
};


if (argv['to-jdl']) {
  writeJdlFile(argv['to-jdl'], parsedData, options);
  process.exit(0);
}

var entities = createEntities(parsedData, parserData.data.databaseTypes, options);

var entityIdsByName = {};
for (let i = 0, entityIds = Object.keys(parsedData.classes); i < parsedData.classNames.length; i++) {
  entityIdsByName[parsedData.getClass(entityIds[i]).name] = entityIds[i];
}
var entityNamesToGenerate = filterOutUnchangedEntities(entities, parsedData);

if (isJumlFilePresent()) {
  if (entityNamesToGenerate.length !== 0) {
    entityNamesToGenerate = getEntitiesToGenerate(entityNamesToGenerate);
  }
} else {
  options.force = true;
  writeFile({
    fileName: '.juml',
    content: ''
  });
}

exportToJSON(entities, values(entityIdsByName), parsedData, entityNamesToGenerate);
generateEntities(values(entityIdsByName), parsedData.classes, entityNamesToGenerate, options);

function initParserFactoryArgs() {
  var parserFactoryArgs = {
    databaseType: argv.db,
    noUserManagement: noUserManagement
  };
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
    fileName: fileName,
    content: toJDLString(parsedData, options)
  });
  console.info(`The file '${fileName}' has been written.`);
}
