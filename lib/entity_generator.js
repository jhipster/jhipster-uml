'use strict';

var chalk = require('chalk'),
    child_process = require('child_process');

/**
 * Generates the entities locally by using JHipster to create the files, and
 * generate the different files.
 * @param scheduledClasses {array<String>} the scheduled classes.
 * @param classes {object} the classes to add.
 */
var generateEntities = module.exports = function(scheduledClasses, classes, force, regenerateFlag) {
  if (scheduledClasses.length === 0 || classes.length === 0) {
    console.info('No entity has to be generated.');
    return;
  }
  console.info(chalk.green('Creating:'));
  scheduledClasses.forEach(function(scheduledClass) {
    console.info(chalk.green('\t' + classes[scheduledClass].name));
  });

  scheduledClasses.forEach(function(scheduledClass) {
    var cmd, args;
    if (process.platform === 'win32') {
      cmd = process.env.comspec || 'cmd.exe';
      args = ['/s', '/c', 'yo jhipster:entity', classes[scheduledClass].name];
    } else {
      cmd = 'yo';
      args = ['jhipster:entity', classes[scheduledClass].name];
    }
    if (force) {
      args.push('--force');
    }
    if (regenerateFlag) {
      args.push('--regenerate');
    }
    child_process.spawnSync(
      cmd,
      args,
      { stdio: [process.stdin, process.stdout, process.stderr] }
    );
    console.info('\n');
  });
};
