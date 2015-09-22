'use strict';

var chalk = require('chalk'),
    child_process = require('child_process');

/**
 * Generates the entities locally by using JHipster to create the files, and
 * generate the different files.
 * @param scheduledClasses {array<String>} the scheduled classes.
 * @param classes {object} the classes to add.
 */
var generateEntities = module.exports = function(scheduledClasses, classes) {
  if (scheduledClasses.length !== Object.keys(classes).length) {
    throw new IllegalArgumentException(
      'The scheduled classes do not correspond to the passed classes.');
  }
  if(scheduledClasses.length === 0 || classes === 0) {
    console.info(chalk.red('No modification was made to your entities.'));
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

    child_process.spawnSync(
      cmd,
      args,
      { stdio: [process.stdin, process.stdout, process.stderr] }
    );
    console.info('\n');
  });
};

function IllegalArgumentException(message) {
  this.name = 'IllegalArgumentException';
  this.message = (message || '');
}
IllegalArgumentException.prototype = new Error();
