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
  	XMIParser = require('./xmiparser'),
  	EntitiesCreator = require('./entitiescreator'),
    ClassScheduler = require('./scheduler'),
    _ = require('underscore.string');


if (!fs.existsSync('.yo-rc.json') && process.argv.length == 3) {
 throw new ArgumentException(
    'The database type must either be supplied, or a .yo-rc.json file must'
    + 'exist in the current directory.');
}

var type;

if (fs.existsSync('.yo-rc.json')) {
  type = JSON.parse(
    fs.readFileSync('./.yo-rc.json'))['generator-jhipster']['databaseType'];
} else if (!fs.existsSync('./.yo-rc.json') && process.argv.length >= 4) {
  type = process.argv[3];
}

var parser = new XMIParser(process.argv[2], type); 

parser.parse();

var scheduler = new ClassScheduler(
  Object.keys(parser.getClasses()),
  parser.getInjectedFields()
);

scheduler.schedule();

var scheduledClasses = scheduler.getOrderedPool();

var creator = new EntitiesCreator(parser);
creator.createEntities();
creator.writeJSON();

createEntities(scheduledClasses, parser.getClasses());
//createReflexives(parser.reflexives);

/**
 * Execute the command yo jhipster:entity for all the classes in the right order
 */
function createEntities(scheduledClasses, classes) {
  console.log(chalk.red('Creating:'));
  for (var i = 0; i < scheduledClasses.length; i++) {
    console.log(chalk.red('\t' + classes[scheduledClasses[i]].name));
  }

  var StringDecoder = require('string_decoder').StringDecoder;
  var decoder = new StringDecoder('utf8');

  scheduledClasses.forEach(function(element, index, array) {
    shelljs.exec('yo jhipster:entity ' +  classes[element].name + ' --force');
    console.log('\n');
  });
}

function createReflexives(reflexives) {
  if (reflexives.length == 0) {
    return;
  }
  console.log(chalk.green('Generating reflexive associations'));

  reflexives.forEach(function(element, index, array) {
    var newJson = JSON.parse(
      fs.readFileSync(
        '.jhipster/' + _.capitalize(element.className) + '.json'));
    newJson['relationships'].push({
      relationshipId: newJson['relationships'].length + 1,
      relationshipName: element.fieldName,
      relationshipNameCapitalized: _.capitalize(element.fieldName),
      relationshipFieldName: element.fieldName,
      otherEntityName: element.className,
      relationshipType: 'one-to-one',
      otherEntityNameCapitalized: _.capitalize(element.className),
      ownerSide: true
    });
    fs.writeFileSync(
      '.jhipster/' + _.capitalize(element.className) + '.json',
      JSON.stringify(newJson, null, '  '));
    shelljs.exec('yo jhipster:entity ' + element.className + ' --force');
  });
}


function ArgumentException(message) {
  this.name = 'ArgumentException';
  this.message = (message || '');
}
ArgumentException.prototype = new Error();
