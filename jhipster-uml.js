'use strict';

if (process.argv.length < 4) {
  throw new NoArgumentSuppliedException(
    'Wrong argument number specified, an input file and '
    + "the database type ('sql', 'mongodb' or 'cassandra') must be supplied, "
    + "exiting now.");
}

var fs = require('fs'),
	chalk = require('chalk'),
	XMIParser = require('./xmiparser'),
	EntitiesCreator = require('./entitiescreator'),
  ClassScheduler = require('./scheduler');

var parser = new XMIParser(
  process.argv[2],
  process.argv[3]); 

parser.parse();

var creator = new EntitiesCreator(parser);
creator.createEntities();
creator.writeJSON();

var scheduler = new ClassScheduler(
  Object.keys(parser.getClasses()),
  parser.getInjectedFields()
);

scheduler.schedule();

var scheduledClasses = scheduler.getOrderedPool();

function NoArgumentSuppliedException(message) {
  this.name = 'NoArgumentSuppliedException';
  this.message = (message || '');
}
NoArgumentSuppliedException.prototype = new Error();
