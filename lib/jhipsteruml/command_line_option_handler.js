/* eslint-disable global-require */
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
const yargs = require('yargs');
const JHipsterCore = require('jhipster-core');
const Editors = require('../editors/editors');
const JHipsterUMLFileHandler = require('./jhipster_uml_file_handler');

const DatabaseTypes = JHipsterCore.JHipsterDatabaseTypes.Types;
const JHipsterBinaryOptionsValues = JHipsterCore.JHipsterBinaryOptions.BINARY_OPTION_VALUES;
const values = JHipsterCore.ObjectUtils.values;

const MINIMUM_ARGS_NUMBER = 3;

module.exports = {
  MINIMUM_ARGS_NUMBER,
  isNumberOfPassedArgumentsInvalid,
  handle
};

function isNumberOfPassedArgumentsInvalid(passedArguments) {
  return Object.keys(passedArguments).length < MINIMUM_ARGS_NUMBER;
}

function handle(realArgs) {
  if (!realArgs) {
    realArgs = process.argv.slice(2);
  }
  return yargs(realArgs)
    .usage('Usage: jhipster-uml <xmi file> [-options]')
    .option({
      db: {
        describe: 'Defines which database type your app uses',
        choices: [DatabaseTypes.sql, DatabaseTypes.mongodb, DatabaseTypes.cassandra]
      },
      dto: {
        describe: 'Generates DTO',
        choices: values(JHipsterBinaryOptionsValues.dto)
      },
      paginate: {
        describe: 'Generates pagination',
        choices: values(JHipsterBinaryOptionsValues.pagination)
      },
      service: {
        describe: 'Generates services',
        choices: values(JHipsterBinaryOptionsValues.service)
      },
      'skip-client': {
        describe: 'Skips client code generation',
        nargs: 0
      },
      'skip-server': {
        describe: 'Skips server code generation',
        nargs: 0
      },
      'angular-suffix': {
        describe: 'Adds a suffix to angular files'
      },
      'microservice-name': {
        describe: 'Adds the microservice/s possessing the entity/ies'
      },
      'search-engine': {
        describe: 'Specifies the search engine',
        choices: values(JHipsterBinaryOptionsValues.searchEngine)
      },
      'skip-user-management': {
        describe: 'Tells JHipster not to manage the User entity',
        nargs: 0
      },
      'fluent-methods': {
        describe: 'Enables the fluent method generation',
        nargs: 0,
        default: true,
      },
      'jpa-metamodel-filtering': {
        describe: 'Enables the JPA metamodel filtering',
        nargs: 0,
        default: false
      },
      'to-jdl': {
        describe: 'Converts the parsed XMI to a JDL file'
      },
      f: {
        alias: 'force',
        describe: 'Overrides entities',
        nargs: 0
      },
      editor: {
        describe: 'Force editor usage for parsing input file(s)',
        choices: Object.keys(Editors.Parsers)
      }
    })
    .help('h')
    .alias('h', 'help')
    .showHelpOnFail(false, 'See  -h/--help for available options')
    .detectLocale(false)
    .strict()
    .version(`The current version of JHipster UML is ${require('../../package.json').version}`)
    .alias('version', 'v')
    .config(JHipsterUMLFileHandler.readJHipsterUMLFile())
    .wrap(null);
}
