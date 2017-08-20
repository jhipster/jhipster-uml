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
const argv = require('./jhipsteruml/command_line_handler').handle().argv;
const BuildException = require('./exceptions/exception_factory').BuildException;
const exceptions = require('./exceptions/exception_factory').exceptions;

if (Object.keys(argv).length < 3) {
  throw new BuildException(
    exceptions.WrongCall,
    'Wrong argument number specified, an input file and (optionally) '
    + 'the database type (\'sql\', \'mongodb\' or \'cassandra\') must be supplied.\n'
    + 'Use the command \'jhipster-uml -help\' to see the available commands.');
}

const fs = require('fs');
const chalk = require('chalk');
const createEntities = require('./entitiescreator').createEntities;
const ParserFactory = require('./editors/parser_factory');
const jhipsterOptionHelper = require('./helpers/jhipster_option_helper');
const generateEntities = require('./entity_generator').generateEntities;
const isYoRcFilePresent = require('./utils/jhipster_utils').isYoRcFilePresent;
const isJumlFilePresent = require('./utils/jhipster-uml_utils').isJumlFilePresent;
const readJSONFiles = require('./utils/jhipster_utils').readJSONFiles;
const areJHipsterEntitiesEqual = require('./helpers/object_helper').areJHipsterEntitiesEqual;
const values = require('./utils/object_utils').values;
const exportToJSON = require('./export/json_exporter').exportToJSON;
const toJDLString = require('./export/jdl_exporter').toJDLString;
const getEntitiesToGenerate = require('./jhipsteruml/entities_to_generate_handler').getEntitiesToGenerate;
const writeFile = require('./export/file_writer').writeFile;

if (!isYoRcFilePresent()) {
  console.info(
    chalk.yellow(
      'Warning: you are using JHipster UML outside a JHipster project and '
      + 'some files might not be correctly generated.'));
}

if (!argv.db && !isYoRcFilePresent()) {
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
  listDTO: (argv.dto) ? jhipsterOptionHelper.askForDTO(parsedData.classes, argv.dto) : {},
  listPagination: (argv.paginate) ? jhipsterOptionHelper.askForPagination(parsedData.classes, argv.paginate) : {},
  listService: (argv.service) ? jhipsterOptionHelper.askForService(parsedData.classes, argv.service) : {},
  listOfNoClient: (argv['skip-client']) ? jhipsterOptionHelper.askForClassesToSkipClientCode(parsedData.classes) : [],
  listOfNoServer: (argv['skip-server']) ? jhipsterOptionHelper.askForClassesToSkipServerCode(parsedData.classes) : [],
  angularSuffixes: (argv['angular-suffix']) ? jhipsterOptionHelper.askForAngularSuffixes(parsedData.classes, argv['angular-suffix']) : {},
  microserviceNames: (argv['microservice-name']) ? jhipsterOptionHelper.askForMicroserviceNames(parsedData.classes, argv['microservice-name']) : {},
  searchEngines: (argv['search-engine']) ? jhipsterOptionHelper.askForSearchEngines(parsedData.classes, argv['search-engine']) : {},
  fluentMethods: (argv['fluent-methods']) ? jhipsterOptionHelper.askForClassesWithFluentMethods(parsedData.classes) : []
};


if (argv['to-jdl']) {
  writeJdlFile(argv['to-jdl'], parsedData, options);
  process.exit(0);
}

const entities = createEntities(parsedData, parserData.data.databaseTypes, options);

const entityIdsByName = {};
for (let i = 0, entityIds = Object.keys(parsedData.classes); i < parsedData.classNames.length; i++) {
  entityIdsByName[parsedData.getClass(entityIds[i]).name] = entityIds[i];
}
let entityNamesToGenerate = filterOutUnchangedEntities(entities, parsedData);

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
generateEntities(Object.keys(entities), parsedData.classes, entityNamesToGenerate, options);

function initParserFactoryArgs() {
  const parserFactoryArgs = {
    databaseType: argv.db,
    noUserManagement,
    editor: argv.editor
  };
  if (argv._.length >= 1) {
    parserFactoryArgs.file = argv._[0];
  } else {
    console.error('At least one file to parse must be passed.');
    process.exit(1);
  }
  return parserFactoryArgs;
}
function filterOutUnchangedEntities(entities, parsedData) {
  const onDiskEntities = readJSONFiles(parsedData.classNames);
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
  console.info(`The file '${fileName}' has been written.`);
}
