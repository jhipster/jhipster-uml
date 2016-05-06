'use strict';

const chalk = require('chalk'),
    child_process = require('child_process');

module.exports = {
  generateEntities: generateEntities
};

/**
 * Generates the entities locally by using JHipster to create the files, and
 * generate the different files.
 * @param scheduledClasses {array<String>} the scheduled classes.
 * @param classes {object} the classes to add.
 * @param force {boolean} the force flag.
 * @param listOfNoClient {array} the array containing the classes that won't
 *                               have any client code.
 * @param listOfNoServer {array} the array containing the classes that won't
 *                               have any server code.
 * @param angularSuffixes {object} the angular suffixes for each entity.
 */
function generateEntities(scheduledClasses, classes, force, listOfNoClient,
                          listOfNoServer, angularSuffixes) {
  if (scheduledClasses.length === 0 || classes.length === 0) {
    console.info('No entity has to be generated.');
    return;
  }
  console.info(chalk.green('Creating:'));
  for (let i = 0; i < scheduledClasses.length; i ++) {
    console.info(chalk.green('\t' + classes[scheduledClasses[i]].name));
  }

  for (let i = 0; i < scheduledClasses.length; i ++) {
    var cmd, args;
    if (process.platform === 'win32') {
      cmd = process.env.comspec || 'cmd.exe';
      args = ['/s', '/c', 'yo jhipster:entity', classes[scheduledClasses[i]].name];
    } else {
      cmd = 'yo';
      args = ['jhipster:entity', classes[scheduledClasses[i]].name];
    }
    if (force) {
      args.push('--force');
    }
    if (listOfNoClient.indexOf(classes[scheduledClasses[i]].name) !== -1) {
      args.push('--skip-client');
    }
    if (listOfNoServer.indexOf(classes[scheduledClasses[i]].name) !== -1) {
      args.push('--skip-server');
    }
    if (angularSuffixes[classes[scheduledClasses[i]].name]) {
      args.push('--angular-suffix');
      args.push(`${angularSuffixes[classes[scheduledClasses[i]].name]}`);
    }
    args.push('--regenerate');
    child_process.spawnSync(
        cmd,
        args,
        {stdio: [process.stdin, process.stdout, process.stderr]}
    );
    console.info('\n');
  }
}
