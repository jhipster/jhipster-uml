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

/**
 * Generates the entities locally by using JHipster to create the JSON files, and
 * generate the different output files.
 * @param entityIdsToGenerate {array<String>} the entities to generate.
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
function generateEntities(entityIdsToGenerate, classes, entityNamesToGenerate, options) {
  if (shouldEntitiesBeGenerated(entityIdsToGenerate, entityNamesToGenerate, classes)) {
    winston.info('No entity has to be generated.');
    return;
  }

  displayEntitiesToGenerate(entityIdsToGenerate, entityNamesToGenerate, classes);

  entityIdsToGenerate.forEach((entityToGenerate, index) => {
    if (entityNamesToGenerate.includes(classes[entityToGenerate].name)) {
      const commandWrapper = createAndInitCommandBuilder(
        classes[entityToGenerate].name,
        options,
        index !== entityIdsToGenerate.length - 1
      );
      childProcess.spawnSync(
        commandWrapper.command,
        commandWrapper.args,
        { stdio: commandWrapper.stdio }
      );
      winston.info('\n');
    }
  });
}

function shouldEntitiesBeGenerated(entityIdsToGenerate, entityNamesToGenerate, classes) {
  return entityIdsToGenerate.length === 0 || entityNamesToGenerate.length === 0
    || Object.keys(classes).length === 0;
}

function displayEntitiesToGenerate(entityIdsToGenerate, entityNamesToGenerate, classes) {
  winston.info(chalk.green('Creating:'));
  for (let i = 0; i < entityIdsToGenerate.length; i++) {
    if (entityNamesToGenerate.includes(classes[entityIdsToGenerate[i]].name)) {
      winston.info(chalk.green(`\t${classes[entityIdsToGenerate[i]].name}`));
    }
  }
}

function createAndInitCommandBuilder(className, options, isLastEntity) {
  const builder = new JHipsterCommandBuilder().className(className);
  if (options.force) {
    builder.force();
  }
  if (options.listOfNoClient.includes(className)) {
    builder.skipClient();
  }
  if (options.listOfNoServer.includes(className)) {
    builder.skipServer();
  }
  if (options.fluentMethods.includes(className)) {
    builder.noFluentMethods();
  }
  if (options.angularSuffixes[className]) {
    builder.angularSuffix(`${options.angularSuffixes[className]}`);
  }
  if (options.noUserManagement) {
    builder.skipUserManagement();
  }
  // Run gulp inject just at the end to speed entity creation
  if (isLastEntity) {
    builder.skipInstall();
  }
  return builder.build();
}
