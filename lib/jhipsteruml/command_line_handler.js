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
'use strict';

const yargs = require('yargs'),
    DatabaseTypes = require('jhipster-core').JHipsterDatabaseTypes.Types,
    JHipsterBinaryOptionsValues = require('jhipster-core').JHipsterBinaryOptions.BINARY_OPTION_VALUES,
    Editors = require('../editors/editors'),
    values = require('../utils/object_utils').values,
    fs = require('fs');

module.exports = {
  handle: handle
};

function isJumlFilePresent() {
  try {
    fs.statSync('jumlfile').isFile();
    return true;
  } catch (error) {
    return false;
  }
}

function loadJumlFile() {
  try {
    if (isJumlFilePresent()) {
      return JSON.parse(fs.readFileSync('jumlfile', 'utf8'));
    }
  } catch (error) {
  }
  return {};
}


function handle(realArgs) {
  if(realArgs === undefined) {
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
      .version(function() {
        return `The current version of JHipster UML is ${require('../../package.json').version}`;
      })
      .alias('version', 'v')
      .config(loadJumlFile())
      .wrap(null);
}
