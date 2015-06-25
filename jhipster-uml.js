#!/usr/bin/env node
'use strict';

if (process.argv.length < 3) {
  throw new ArgumentException(
  	'Wrong argument number specified, an input file and (optionally) '
  	+ "the database type ('sql', 'mongodb' or 'cassandra') must be supplied. \n"
  	+ "Use the command 'jhipster-uml -help' to see the available commands. \n"
  	+ "Exiting now.");
}

var fs = require('fs'),
	chalk = require('chalk'),
	shelljs = require('shelljs'),
	ParserFactory = require('./lib/editors/parser_factory'),
	EntitiesCreator = require('./lib/entitiescreator'),
	ClassScheduler = require('./lib/scheduler'),
	ParserFactory = require('./lib/editors/parser_factory');


var type;
var dto = false;

process.argv.forEach(function(val, index) {
  switch(val) {
	case '-db':
	  if(!fs.existsSync('./.yo-rc.json') ){
		  type = process.argv[index+1];
	  }
	break;
	case '-dto':
	  dto = true;
	break;
	case '-help':
	  dislayHelp();
	  process.exit(0);
	break;
	default:
  }
});

if (fs.existsSync('.yo-rc.json')) {
  type = JSON.parse(
	fs.readFileSync('./.yo-rc.json'))['generator-jhipster'].databaseType;
}
if (!fs.existsSync('.yo-rc.json') && type === undefined) {
 throw new ArgumentException(
	'The database type must either be supplied with the -db option, or a .yo-rc.json file must'
	+ ' exist in the current directory. \n'
	+ "Use the command \'jhipster-uml -help\' to know more."
  );
}

try {

  var parser = ParserFactory.createParser(process.argv[2], type);
  parser.parse();

/***************************/
  console.log("**** THE F-ING PARSER ******");
  var file = 'DEBUGSHIT.txt';
  fs.writeFileSync(file, JSON.stringify(parser.getClasses(), null, '  '));
  console.log("** associations **");
  console.log(parser.getAssociations());
  console.log("** getInjectedFields **");
  console.log(parser.getInjectedFields());
  console.log();
  console.log("** getFields **");
    console.log(parser.getFields());    
/**************************/

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

  var creator = new EntitiesCreator(parser, dto);
  creator.createEntities();
  creator.writeJSON();

  createEntities(scheduledClasses, parser.getClasses());
} catch (error) {
  console.error(error.message);
  console.error(error.stack);
  process.exit(1);
}

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
	console.info('\n');
  });
}

function ArgumentException(message) {
  this.name = 'ArgumentException';
  this.message = (message || '');
}
ArgumentException.prototype = new Error();

function dislayHelp() {
  console.info(
	'Syntax: jhipster-uml <xmi file> [-options]\n'
	+ 'The options are:\n'
	+ '\t-db <the database name>\tDefines which database type your app uses;\n'
	+ '\t-dto\t[BETA] Generates DTO with MapStruct for all your entites.'
  );
}