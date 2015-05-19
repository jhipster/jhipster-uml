#!/usr/bin/env node
'use strict';

if (process.argv.length < 4) {
  throw new NoArgumentSuppliedException(
    'Wrong argument number specified, an input file and '
    + "the database type ('sql', 'mongodb' or 'cassandra') must be supplied, "
    + "exiting now.");
}

var fs = require('fs'),
	chalk = require('chalk'),
  child_process = require('child_process'),
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

createEntities(scheduledClasses, parser.getClasses());
/**
 * Execute the command yo jhipster:entity for all the classes in the right order
 */
function createEntities(scheduledClasses, classes){

for (var i =0; i< scheduledClasses.length; i++) {
  console.log(chalk.red(classes[scheduledClasses[i]].name));
};

 var i= 0;
 executeEntity(scheduledClasses, classes, i);

}
function executeEntity(scheduledClasses, classes, index){
   var child;
  console.log(chalk.red("================= "+classes[scheduledClasses[index]].name+ " ================="));
  child =child_process.exec("yo jhipster:entity "+classes[scheduledClasses[index]].name + " --force", function (error, stdout, stderr) {

    console.log(chalk.green(stdout));
    console.log();
     if (error !== null) {
      console.log(chalk.red(error));
    }

    if(stderr == '' || stderr != null){
      console.log( stderr);
    }

    //the end condition
    if(index+1 >= scheduledClasses.length){
      return;
    }
    executeEntity(scheduledClasses, classes, index+1);
  });
}


function NoArgumentSuppliedException(message) {
  this.name = 'NoArgumentSuppliedException';
  this.message = (message || '');
}
NoArgumentSuppliedException.prototype = new Error();
