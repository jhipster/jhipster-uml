'use strict';

const chalk = require('chalk'),
    child_process = require('child_process'),
    JHipsterCommandBuilder = require('./utils/jhipster_command_builder');

module.exports = {
  generateEntities: generateEntities
};

function displayEntitiesToGenerate(entityNamesToGenerate, entitiesToGenerate, classes) {
  console.info(chalk.green('Creating:'));
  for (let i = 0; i < entitiesToGenerate.length; i ++) {
    if (entityNamesToGenerate.indexOf(classes[entitiesToGenerate[i]].name) !== -1) {
      console.info(chalk.green(`\t${classes[entitiesToGenerate[i]].name}`));
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
    console.info('No entity has to be generated.');
    return;
  }

  displayEntitiesToGenerate(entityNamesToGenerate, entitiesToGenerate, classes);

  for (let i = 0; i < entitiesToGenerate.length; i ++) {
    if (entityNamesToGenerate.indexOf(classes[entitiesToGenerate[i]].name) === -1) {
      continue;
    }
    let builder = new JHipsterCommandBuilder()
      .className(classes[entitiesToGenerate[i]].name);
    if (options.force) {
      builder.force();
    }
    if (options.listOfNoClient.indexOf(classes[entitiesToGenerate[i]].name) !== -1) {
      builder.skipClient();
    }
    if (options.listOfNoServer.indexOf(classes[entitiesToGenerate[i]].name) !== -1) {
      builder.skipServer();
    }
    if (options.noFluentMethods.indexOf(classes[entitiesToGenerate[i]].name) !== -1) {
      builder.noFluentMethods();
    }
    if (options.angularSuffixes[classes[entitiesToGenerate[i]].name]) {
      builder.angularSuffix(`${angularSuffixes[classes[entitiesToGenerate[i]].name]}`);
    }
    if (options.noUserManagement) {
      builder.skipUserManagement();
    }
    // Run gulp inject just at the end to speed entity creation
    if (i !== entitiesToGenerate.length - 1) {
      builder.skipInstall();
    }
    let built = builder.build();
    child_process.spawnSync(
      built.command,
      built.args,
      { stdio: built.stdio }
    );
    console.info('\n');
  }
}
