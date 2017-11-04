/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://jhipster.github.io/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const argv = require('./jhipsteruml/command_line_option_handler').handle().argv;
const CommandLineOptionHandler = require('./jhipsteruml/command_line_option_handler');
const BuildException = require('./exceptions/exception_factory').BuildException;
const exceptions = require('./exceptions/exception_factory').exceptions;

if (CommandLineOptionHandler.isNumberOfPassedArgumentsInvalid(argv)) {
  throw new BuildException(
    exceptions.WrongCall,
    'Wrong argument number specified, an input file and (optionally) '
    + 'the database type (\'sql\', \'mongodb\' or \'cassandra\') must be supplied.\n'
    + 'Use the command \'jhipster-uml -h\' to see the available commands.');
}

const fs = require('fs');
const chalk = require('chalk');
const EntityCreator = require('./entitiescreator');
const ParserFactory = require('./editors/parser_factory');
const JHipsterOptionHelper = require('./helpers/jhipster_option_helper');
const EntityGenerator = require('./entity_generator');
const JHipsterUtils = require('./utils/jhipster_utils');
const JHipsterUMLFileHandler = require('./jhipsteruml/jhipster_uml_file_handler');
const areJHipsterEntitiesEqual = require('./helpers/object_helper').areJHipsterEntitiesEqual;
const values = require('jhipster-core').ObjectUtils.values;
const exportToJSON = require('./export/json_exporter').exportToJSON;
const toJDLString = require('./export/jdl_exporter').toJDLString;
const getEntitiesToGenerate = require('./jhipsteruml/entities_to_generate_handler').getEntitiesToGenerate;
const writeFile = require('./export/file_writer').writeFile;
const winston = require('winston');

if (!JHipsterUtils.isYoRcFilePresent()) {
  winston.info(
    chalk.yellow(
      'Warning: you are using JHipster UML outside a JHipster project and '
      + 'some files might not be correctly generated.'));
}

if (!argv.db && !JHipsterUtils.isYoRcFilePresent()) {
  throw new BuildException(
    exceptions.WrongCall,
    'The database type must either be supplied with the -db option, '
    + 'or a .yo-rc.json file must exist in the current directory.\n'
    + 'Use the command \'jhipster-uml -help\' to see the available options.'
  );
} else {
  argv.db = argv.db || JSON.parse(
    fs.readFileSync('./.yo-rc.json')
  )['generator-jhipster'].databaseType;
}

const noUserManagement = !!argv['skip-user-management'];
const parserData = ParserFactory.createParser(initParserFactoryArgs());
const parser = parserData.parser;
const parsedData = parser.parse(parserData.data);

const options = {
  force: argv.f,
  listDTO: (argv.dto) ? JHipsterOptionHelper.askForDTO(parsedData.classes, argv.dto) : {},
  listPagination: (argv.paginate) ? JHipsterOptionHelper.askForPagination(parsedData.classes, argv.paginate) : {},
  listService: (argv.service) ? JHipsterOptionHelper.askForService(parsedData.classes, argv.service) : {},
  listOfNoClient: (argv['skip-client']) ? JHipsterOptionHelper.askForClassesToSkipClientCode(parsedData.classes) : [],
  listOfNoServer: (argv['skip-server']) ? JHipsterOptionHelper.askForClassesToSkipServerCode(parsedData.classes) : [],
  angularSuffixes: (argv['angular-suffix']) ? JHipsterOptionHelper.askForAngularSuffixes(parsedData.classes, argv['angular-suffix']) : {},
  microserviceNames: (argv['microservice-name']) ? JHipsterOptionHelper.askForMicroserviceNames(parsedData.classes, argv['microservice-name']) : {},
  searchEngines: (argv['search-engine']) ? JHipsterOptionHelper.askForSearchEngines(parsedData.classes, argv['search-engine']) : {},
  fluentMethods: (argv['fluent-methods']) ? JHipsterOptionHelper.askForClassesWithFluentMethods(parsedData.classes) : [],
  jpaMetamodelFiltering: (argv['jpa-metamodel-filtering']) ? JHipsterOptionHelper.askForClassesWithJPAMetamodelFiltering(parsedData.classes) : []
};


if (argv['to-jdl']) {
  writeJdlFile(argv['to-jdl'], parsedData, options);
  process.exit(0);
}

const entities = EntityCreator.createEntities(parsedData, parserData.data.databaseTypes, options);

const entityIdsByName = {};
for (let i = 0, entityIds = Object.keys(parsedData.classes); i < parsedData.classNames.length; i++) {
  entityIdsByName[parsedData.getClass(entityIds[i]).name] = entityIds[i];
}
let entityNamesToGenerate = filterOutUnchangedEntities(entities, parsedData);

if (JHipsterUMLFileHandler.isJHipsterUMLFilePresent()) {
  if (entityNamesToGenerate.length !== 0) {
    entityNamesToGenerate = getEntitiesToGenerate(entityNamesToGenerate);
  }
} else {
  options.force = true;
  writeFile({
    fileName: 'jumlfile',
    content: ''
  });
}

exportToJSON(entities, values(entityIdsByName), parsedData, entityNamesToGenerate);
EntityGenerator.generateEntities(Object.keys(entities), parsedData.classes, entityNamesToGenerate, options);

function initParserFactoryArgs() {
  const parserFactoryArgs = {
    databaseType: argv.db,
    noUserManagement,
    editor: argv.editor
  };
  if (argv._.length >= 1) {
    parserFactoryArgs.file = argv._[0];
  } else {
    winston.error('At least one file to parse must be passed.');
    process.exit(1);
  }
  return parserFactoryArgs;
}
function filterOutUnchangedEntities(entities, parsedData) {
  const onDiskEntities = JHipsterUtils.readJSONFiles(parsedData.classNames);
  return parsedData.classNames.filter((name) => {
    const currEntity = onDiskEntities[name];
    const newEntity = entities[entityIdsByName[name]];
    if (!newEntity) {
      // if the entity is not in entities, we don't want it generated at all
      return false;
    }
    if (!currEntity) {
      return true;
    }
    return !areJHipsterEntitiesEqual(currEntity, newEntity);
  });
}
function writeJdlFile(fileName, parsedData, options) {
  writeFile({
    fileName,
    content: toJDLString(parsedData, options)
  });
  winston.info(`The file '${fileName}' has been written.`);
}
