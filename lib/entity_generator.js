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
const chalk = require('chalk');
const childProcess = require('child_process');
const JHipsterCommandBuilder = require('./utils/jhipster_command_builder');
const winston = require('winston');

module.exports = {
  generateEntities
};

function displayEntitiesToGenerate(entityNamesToGenerate, entitiesToGenerate, classes) {
  winston.info(chalk.green('Creating:'));
  for (let i = 0; i < entitiesToGenerate.length; i++) {
    if (entityNamesToGenerate.indexOf(classes[entitiesToGenerate[i]].name) !== -1) {
      winston.info(chalk.green(`\t${classes[entitiesToGenerate[i]].name}`));
    }
  }
}

/**
 * Generates the entities locally by using JHipster to create the JSON files, and
 * generate the different output files.
 * @param entitiesToGenerate {array<String>} the entities to generate.
 * @param classes {object} the classes to add.
 * @param entityNamesToGenerate {array} the names of the entities to generate.
 * @param options {object} an object containing:
 *  - force {boolean} the force flag.
 *  - listOfNoClient {array} the array containing the classes that won't
 *                               have any client code.
 *  - listOfNoServer {array} the array containing the classes that won't
 *                               have any server code.
 *  - angularSuffixes {object} the angular suffixes for each entity.
 *  - noFluentMethods {array} the array containing the classes that won't
 *                                have fluent methods.
 */
function generateEntities(entitiesToGenerate, classes, entityNamesToGenerate, options) {
  if (entitiesToGenerate.length === 0 || entityNamesToGenerate.length === 0
      || classes.length === 0) {
    winston.info('No entity has to be generated.');
    return;
  }

  displayEntitiesToGenerate(entityNamesToGenerate, entitiesToGenerate, classes);

  for (let i = 0; i < entitiesToGenerate.length; i++) {
    if (entityNamesToGenerate.indexOf(classes[entitiesToGenerate[i]].name) !== -1) {
      const builder = new JHipsterCommandBuilder().className(classes[entitiesToGenerate[i]].name);
      if (options.force) {
        builder.force();
      }
      if (options.listOfNoClient.indexOf(classes[entitiesToGenerate[i]].name) !== -1) {
        builder.skipClient();
      }
      if (options.listOfNoServer.indexOf(classes[entitiesToGenerate[i]].name) !== -1) {
        builder.skipServer();
      }
      if (options.fluentMethods.indexOf(classes[entitiesToGenerate[i]].name) === -1) {
        builder.noFluentMethods();
      }
      if (options.angularSuffixes[classes[entitiesToGenerate[i]].name]) {
        builder.angularSuffix(`${options.angularSuffixes[classes[entitiesToGenerate[i]].name]}`);
      }
      if (options.noUserManagement) {
        builder.skipUserManagement();
      }
      // Run gulp inject just at the end to speed entity creation
      if (i !== entitiesToGenerate.length - 1) {
        builder.skipInstall();
      }
      const built = builder.build();
      childProcess.spawnSync(
        built.command,
        built.args,
        { stdio: built.stdio }
      );
      winston.info('\n');
    }
  }
}
