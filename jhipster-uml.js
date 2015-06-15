#!/usr/bin/env node
'use strict';

if (process.argv.length < 3) {
  throw new ArgumentException(
    'Wrong argument number specified, an input file and (optionally)'
    + "the database type ('sql', 'mongodb' or 'cassandra') must be supplied, "
    + "exiting now.");
}

var fs = require('fs'),
    chalk = require('chalk'),
    shelljs = require('shelljs'),
    ParserFactory = require('./lib/editors/parser_factory'),
    EntitiesCreator = require('./lib/entitiescreator'),
    ClassScheduler = require('./lib/scheduler'),
    ParserFactory = require('./lib/editors/parser_factory');


if (!fs.existsSync('.yo-rc.json') && process.argv.length === 3) {
 throw new ArgumentException(
    'The database type must either be supplied, or a .yo-rc.json file must'
    + ' exist in the current directory.');
}

var type;

if (fs.existsSync('.yo-rc.json')) {
  type = JSON.parse(
    fs.readFileSync('./.yo-rc.json'))['generator-jhipster'].databaseType;
} else if (!fs.existsSync('./.yo-rc.json') && process.argv.length >= 4) {
  type = process.argv[3];
}

var parser = ParserFactory.createParser(process.argv[2], type);

parser.parse();

var scheduler = new ClassScheduler(
  Object.keys(parser.getClasses()),
  parser.getInjectedFields()
);

scheduler.schedule();

var scheduledClasses = scheduler.getOrderedPool();
if (parser.getUserClassId()) {
  scheduledClasses =
    filterScheduledClasses(parser.getUserClassId(), scheduledClasses);
}

var creator = new EntitiesCreator(parser);
creator.createEntities();
creator.writeJSON();

createEntities(scheduledClasses, parser.getClasses());

/**
 * Removes every class corresponding to the class to filter out.
 */
function filterScheduledClasses(classToFilter, scheduledClasses) {
  return scheduledClasses.filter(function(element) {
    return element !== classToFilter;
  });
}

/**
 * Execute the command yo jhipster:entity for all the classes in the right order
 */
function createEntities(scheduledClasses, classes) {
  console.log(chalk.red('Creating:'));
  for (var i = 0; i < scheduledClasses.length; i++) {
    console.log(chalk.red('\t' + classes[scheduledClasses[i]].name));
  }

  scheduledClasses.forEach(function(element) {
    shelljs.exec('yo jhipster:entity ' +  classes[element].name + ' --force');
    console.log('\n');
  });
}

function ArgumentException(message) {
  this.name = 'ArgumentException';
  this.message = (message || '');
}
ArgumentException.prototype = new Error();
