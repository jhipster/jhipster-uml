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
    EntitiesCreator = require('./entitiescreator'),
    ClassScheduler = require('./scheduler'),
    ParserFactory = require('./editors/parser_factory'),
    jhipsterOptionHelper = require('./helpers/jhipster_option_helper'),
    generateEntities = require('./entity_generator').generateEntities,
    displayHelp = require('./jhipsteruml/help').displayHelp,
    displayVersion = require('./jhipsteruml/version').displayVersion;

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

var scheduler = new ClassScheduler(parsedData.classes, parsedData.associations);

var scheduledClasses = scheduler.schedule();
if (parsedData.userClassId) {
  scheduledClasses =
      filterScheduledClasses(parsedData.userClassId, scheduledClasses);
}

var listDTO = [];
var listPagination = {};
var listService = {};
var listOfNoClient = [];
var listOfNoServer = [];
var angularSuffixes = {};
var microserviceNames = {};
var searchEngines = [];

if (options.dto) {
  listDTO = jhipsterOptionHelper.askForDTO(parsedData.classes);
}
if (options.paginate) {
  listPagination = jhipsterOptionHelper.askForPagination(parsedData.classes);
}
if (options.service) {
  listService = jhipsterOptionHelper.askForService(parsedData.classes);
}
if (options.skipClient) {
  listOfNoClient =
      jhipsterOptionHelper.askForClassesToSkipClientCode(parsedData.classes);
}
if (options.skipServer) {
  listOfNoServer =
      jhipsterOptionHelper.askForClassesToSkipServerCode(parsedData.classes);
}
if (options.angularSuffix) {
  angularSuffixes =
      jhipsterOptionHelper.askForAngularSuffixes(parsedData.classes);
}
if (options.microserviceName) {
  microserviceNames =
      jhipsterOptionHelper.askForMicroserviceNames(parsedData.classes);
}
if (options.searchEngine) {
  searchEngines = jhipsterOptionHelper.askForSearchEngines(parsedData.classes);
}

var creator = new EntitiesCreator({
  parsedData: parsedData,
  databaseTypes: parser.databaseTypes,
  listDTO: listDTO,
  listPagination: listPagination,
  listService: listService,
  microserviceNames: microserviceNames,
  searchEngines: searchEngines
});

creator.createEntities();
if (!options.force) {
  scheduledClasses = creator.filterOutUnchangedEntities(scheduledClasses);
}
creator.writeJSON(scheduledClasses);
generateEntities(scheduledClasses, parsedData.classes, options.force,
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

/**
 * Removes every class corresponding to the class to filter out.
 */
function filterScheduledClasses(classToFilter, scheduledClasses) {
  return scheduledClasses.filter(function (element) {
    return element !== classToFilter;
  });
}
