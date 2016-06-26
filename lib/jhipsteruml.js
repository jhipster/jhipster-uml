'use strict';

const buildException = require('./exceptions/exception_factory').buildException,
    exceptions = require('./exceptions/exception_factory').exceptions;

if (process.argv.length < 3) {
  throw new buildException(
      exceptions.WrongCall,
      'Wrong argument number specified, an input file and (optionally) '
      + "the database type ('sql', 'mongodb' or 'cassandra') must be supplied.\n"
      + "Use the command 'jhipster-uml -help' to see the available commands.");
}

const fs = require('fs'),
    chalk = require('chalk'),
    parseOptions = require('./jhipsteruml/jhipsteruml_options').parseOptions,
    createEntities = require('./entitiescreator').createEntities,
    ParserFactory = require('./editors/parser_factory'),
    jhipsterOptionHelper = require('./helpers/jhipster_option_helper'),
    generateEntities = require('./entity_generator').generateEntities,
    displayHelp = require('./jhipsteruml/help').displayHelp,
    displayVersion = require('./jhipsteruml/version').displayVersion,
    readJSONFiles = require('./utils/jhipster_utils').readJSONFiles,
    areJHipsterEntitiesEqual = require('./helpers/object_helper').areJHipsterEntitiesEqual,
    values = require('./utils/object_utils').values,
    exportToJSON = require('./export/json_exporter').exportToJSON;

var options = parseOptions(process.argv);

if (options.displayHelp) {
  displayHelp();
  process.exit(0);
}
if (options.displayVersion) {
  displayVersion();
  process.exit(0);
}

if (!fs.existsSync('./.yo-rc.json')) {
  console.info(
      chalk.yellow(
          'Warning: you are using JHipster UML outside a JHipster project and '
          + 'some files might not be correctly generated.'));
}

try {
  fs.statSync('.juml').isFile();
} catch (error) {
  options.force = true;
  fs.writeFileSync('.juml', '');
}

if (!options.db && !fs.existsSync('./.yo-rc.json')) {
  throw new buildException(
      exceptions.WrongCall,
      'The database type must either be supplied with the -db option, '
      + 'or a .yo-rc.json file must exist in the current directory.\n'
      + "Use the command 'jhipster-uml -help' to see the available options."
  );
} else {
  options.type = options.type || JSON.parse(
          fs.readFileSync('./.yo-rc.json')
      )['generator-jhipster'].databaseType;
}

var parser = ParserFactory.createParser(initParserFactoryArgs());
var parsedData = parser.parse();

var entityNamesToGenerate = filterOutUnchangedEntities(parsedData);
var listDTO = (options.dto) ? jhipsterOptionHelper.askForDTO(parsedData.classes): [];
var listPagination = (options.paginate) ? jhipsterOptionHelper.askForPagination(parsedData.classes) : {};
var listService = (options.service) ? jhipsterOptionHelper.askForService(parsedData.classes) : {};
var listOfNoClient = (options.skipClient) ? jhipsterOptionHelper.askForClassesToSkipClientCode(parsedData.classes) : [];
var listOfNoServer = (options.skipServer) ? jhipsterOptionHelper.askForClassesToSkipServerCode(parsedData.classes) : [];
var angularSuffixes = (options.angularSuffix) ? jhipsterOptionHelper.askForAngularSuffixes(parsedData.classes) : {};
var microserviceNames = (options.microserviceName) ? jhipsterOptionHelper.askForMicroserviceNames(parsedData.classes) : {};
var searchEngines = (options.searchEngine) ? jhipsterOptionHelper.askForSearchEngines(parsedData.classes) : [];

var entities = createEntities({
  parsedData: parsedData,
  databaseTypes: parser.databaseTypes,
  listDTO: listDTO,
  listPagination: listPagination,
  listService: listService,
  microserviceNames: microserviceNames,
  searchEngines: searchEngines
});

exportToJSON(entities, values(entityIdsByName), parsedData);
generateEntities(values(entityIdsByName), parsedData.classes, options.force,
    listOfNoClient, listOfNoServer, angularSuffixes);

function initParserFactoryArgs() {
  var parserFactoryArgs = {databaseType: options.type};
  if (options.files.length === 1) {
    parserFactoryArgs.file = options.files[0];
  } else if (options.files.length > 1) {
    parserFactoryArgs.files = options.files;
  } else {
    console.error('At least one file to parse must be passed.');
    process.exit(1);
  }
  return parserFactoryArgs;
}
function filterOutUnchangedEntities(parsedData) {
  var onDiskEntities = readJSONFiles(parsedData.classNames);
  var entityIdsByName = {};
  for (let i = 0, entityIds = Object.keys(parsedData.classes); i < parsedData.classNames.length; i++) {
    entityIdsByName[parsedData.getClass(entityIds[i]).name] = entityIds[i];
  }
  return parsedData.classNames.filter(function (name) {
    var currEntity = onDiskEntities[name];
    var newEntity = parsedData.getClass(entityIdsByName[name]);
    if (!currEntity) {
      return true;
    }
    return !areJHipsterEntitiesEqual(currEntity, newEntity);
  });
}
