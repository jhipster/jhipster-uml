'use strict';

var ArgumentException = require('./exceptions/argument_exception');

if (process.argv.length < 3) {
  throw new ArgumentException(
    'Wrong argument number specified, an input file and (optionally) '
    + "the database type ('sql', 'mongodb' or 'cassandra') must be supplied. \n"
    + "Use the command 'jhipster-uml -help' to see the available commands.");
}

var fs = require('fs'),
    EntitiesCreator = require('./entitiescreator'),
    ClassScheduler = require('./scheduler'),
    ParserFactory = require('./editors/parser_factory'),
    jhipsterOptionHelper = require('./helpers/jhipster_option_helper'),
    generateEntities = require('./entity_generator'),
    displayHelp = require('./jhipsteruml/help').displayHelp,
    displayVersion = require('./jhipsteruml/version').displayVersion;


var type;

// option DTO
var dto = false;
var listDTO = [];
// option force
var force = false;
// option pagination
var paginate = false;
var listPagination = {};
// option service
var service = false;
var listService = {};

process.argv.forEach(function(val, index) {
  switch(val) {
    case '-db':
      if (!fs.existsSync('./.yo-rc.json')) {
        type = process.argv[index+1];
      }
      break;
    case '-f':
    case '-force':
      force = true;
      break;
    case '-dto':
      dto = true;
      break;
    case '-paginate':
      paginate = true;
      break;
    case '-service':
      service = true;
      break;
    case '-h':
    case '-help':
      displayHelp();
      process.exit(0);
      break;
    case '-v':
    case '-version':
      displayVersion();
      process.exit(0);
      break;
    default:
  }
});

try {
  fs.statSync('.juml').isFile(); // first-time user
} catch (error) {
  force = true;
  fs.writeFileSync('.juml', '');
}

if (!type && !fs.existsSync('./.yo-rc.json')) {
  throw new ArgumentException(
    'The database type must either be supplied with the -db option, '
    + 'or a .yo-rc.json file must exist in the current directory.\n'
    + "Use the command 'jhipster-uml -help' to see the available options."
  );
} else {
  type = type || JSON.parse(
      fs.readFileSync('./.yo-rc.json')
    )['generator-jhipster'].databaseType;
}

var parser = ParserFactory.createParser(initParserFactoryArgs(type));
var parsedData = parser.parse();

var scheduler = new ClassScheduler(parsedData.classes, parsedData.associations);

var scheduledClasses = scheduler.schedule();
if (parsedData.userClassId) {
  scheduledClasses =
    filterScheduledClasses(parsedData.userClassId, scheduledClasses);
}

if (dto) {
  listDTO = jhipsterOptionHelper.askForDTO(parsedData.classes);
}

if (paginate) {
  listPagination = jhipsterOptionHelper.askForPagination(parsedData.classes);
}

if (service) {
  listService = jhipsterOptionHelper.askForService(parsedData.classes);
}

var creator = new EntitiesCreator(
  parsedData,
  parser.databaseTypes,
  listDTO,
  listPagination,
  listService);

creator.createEntities();
if (!force) {
  scheduledClasses = creator.filterOutUnchangedEntities(scheduledClasses);
}
creator.writeJSON(scheduledClasses);
generateEntities(scheduledClasses, parsedData.classes, force);

function initParserFactoryArgs(type) {
  var parserFactoryArgs = { databaseType: type };
  if (process.argv.length === 3) {
    parserFactoryArgs.file = process.argv[2];
  } else {
    parserFactoryArgs.files = process.argv.slice(2);
  }
  return parserFactoryArgs;
}

/**
 * Removes every class corresponding to the class to filter out.
 */
function filterScheduledClasses(classToFilter, scheduledClasses) {
  return scheduledClasses.filter(function(element) {
    return element !== classToFilter;
  });
}
