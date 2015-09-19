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
    EntitiesCreator = require('./lib/entitiescreator'),
    ClassScheduler = require('./lib/scheduler'),
    ParserFactory = require('./lib/editors/parser_factory'),
    inquirer = require('inquirer'),
    generateEntities = require('./lib/entity_generator');


var type;

//option DTO
var dto = false;
var listDTO = [];
//option force
var force= false;
//option pagination
var paginate = false;
var listPagination = {};

process.argv.forEach(function(val, index) {
  switch(val) {
    case '-db':
      if(!fs.existsSync('./.yo-rc.json') ){
        type = process.argv[index+1];
      }
      break;
    case '-f':
      force = true;
      break;
    case '-dto':
      dto = true;
      break;
    case '-paginate':
      paginate = true;
      break;
    case '-help':
      dislayHelp();
      process.exit(0);
      break;
    default:
  }
});

if (fs.existsSync('.yo-rc.json')) {
  type = JSON.parse(fs.readFileSync('./.yo-rc.json'))['generator-jhipster'].databaseType;
}
if (!fs.existsSync('.yo-rc.json') && type === undefined) {
  throw new ArgumentException(
    'The database type must either be supplied with the -db option, '
    + 'or a .yo-rc.json file must exist in the current directory. \n'
    + "Use the command \'jhipster-uml -help\' to know more."
  );
}

try {
  var parser = ParserFactory.createParser(process.argv[2], type);
  var parsedData = parser.parse();

  var scheduler = new ClassScheduler(
    Object.keys(parsedData.classes),
    parsedData.injectedFields
  );

  var scheduledClasses = scheduler.schedule();
  if (parsedData.userClassId) {
    scheduledClasses =
      filterScheduledClasses(parsedData.userClassId, scheduledClasses);
  }

  if(paginate){
    listPagination = askForPagination(parsedData.classes);
  }

  if(dto){
    listDTO = askForDTO(parsedData.classes);
  }

  var creator = new EntitiesCreator(
    parsedData,
    parser.databaseTypes,
    listDTO,
    listPagination);

  creator.createEntities();
  if(!force) {
    scheduledClasses = creator.filterOutUnchangedEntities(scheduledClasses);
  }
  creator.writeJSON(scheduledClasses);
  generateEntities(scheduledClasses, parsedData.classes);
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

function dislayHelp() {
  console.info(
    'Syntax: jhipster-uml <xmi file> [-options]\n'
    + 'The options are:\n'
    + '\t-db <the database name>\tDefines which database type your app uses;\n'
    + '\t-dto\t[BETA] Generates DTO with MapStruct for the selected entities;\n'
    + '\t-paginate \tChoose your entities\' for pagination.'
  );
}

/*
 * @param{Map} All the entities we want to choose from
 * Display in prompt the list of the entities you want to choose pagination for
 */
function askForPagination(classes) {
  var shouldContinueAsking = true;

  while(shouldContinueAsking){
    var done = null;

    var ctp = askForClassesToPaginate(classes);
    var style = askForStylePagination();
    ctp.forEach(function(element){
      listPagination[element] = style;
    });
    inquirer.prompt([
        {
          type: 'confirm',
          name: 'addPagination',
          message: 'Do you want to add an other pagination style?',
          default: true
        }
      ], function(answer){
        shouldContinueAsking = answer.addPagination;
        done = true;
      }
    );
    while(!done) {
      require('deasync').sleep(100);
    }
  }
  return listPagination;
}

function askForClassesToPaginate(classes){
  var choice = null;
  var allEntityMessage = '*** All Entities ***';
  var choicesList = [allEntityMessage];

  Array.prototype.push.apply(
    choicesList,
    Object.keys(classes).map(function(e) {
      return classes[e].name;
    })
  );

  inquirer.prompt([
      {
        type: 'checkbox',
        name: 'answer',
        message: 'Please choose the entities you want to paginate:',
        choices: choicesList,
        filter: function(val) {
          return val;
        }
      }
    ], function(answers) {
      //if '*** All Entities ***' is selected return all Entities
      if(answers.answer.indexOf(allEntityMessage) !== -1) {
        choice = choicesList;
      }else{
        choice = answers.answer;
      }
    }
  );
  while(!choice) {
    require('deasync').sleep(100);
  }
  return choice;
}

function askForStylePagination(){
  var inquirer = require('inquirer');
  var choice = null;
  var choicesList = [
    {name : "Pagination links", value : "pagination"},
    {name : "Simple pager", value : "pager"},
    {name : "Infinite Scroll", value : "infinite-scroll"}
  ];

  inquirer.prompt([
      {
        type: 'list',
        name: 'answer',
        message: 'Please choose the pagination style:',
        choices: choicesList,
        filter: function(val) {
          return val;
        }
      }
    ],
    function(answers){
      choice = answers.answer;
    }
  );

  while(!choice) {
    require('deasync').sleep(100);
  }
  return choice;
}

/*
 * @param{Map} All the entities we want to choose from
 * Display in prompt the list of the entities you want to add DTO for
 */
function askForDTO(classes) {
  var inquirer = require('inquirer');
  var choice = null;
  var allEntityMessage = '*** All Entities ***';
  var choicesList = [allEntityMessage];

  Array.prototype.push.apply(
    choicesList,
    Object.keys(classes)
      .map(function(e){
        return classes[e].name;
      })
  );

  inquirer.prompt([
      {
        type: 'checkbox',
        name: 'answer',
        message: 'Please choose the entities you want to generate DTO:',
        choices: choicesList,
        filter: function(val) {
          return val;
        }
      }
    ], function(answers) {
      //if '*** All Entities ***' is selected return all Entities
      if(answers.answer.indexOf(allEntityMessage) !== -1) {
        choice = choicesList;
      }else{
        choice = answers.answer;
      }
    }
  );
  while(!choice) {
    require('deasync').sleep(100);
  }
  return choice;
}

function ArgumentException(message) {
  this.name = 'ArgumentException';
  this.message = (message || '');
}
ArgumentException.prototype = new Error();
