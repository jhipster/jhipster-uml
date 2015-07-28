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
    child_process = require('child_process'),
    EntitiesCreator = require('./lib/entitiescreator'),
    ClassScheduler = require('./lib/scheduler'),
    ParserFactory = require('./lib/editors/parser_factory'),
    inquirer = require('inquirer');


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

  if(paginate){
    listPagination = askForPagination(parser.classes);
  }

  if(dto){
    listDTO = askForDTO(parser.classes);
  }
  
  var creator = new EntitiesCreator(parser, listDTO, listPagination);

  creator.createEntities();
  if(!force) {
    scheduledClasses = creator.filterOutUnchangedEntities(scheduledClasses);
  }
  creator.writeJSON(scheduledClasses);
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
};


/**
 * Execute the command yo jhipster:entity for all the classes in the right order
 */
function createEntities(scheduledClasses, classes) {
  console.log(chalk.red('Creating:'));

  if(scheduledClasses.length === 0){
    console.log(chalk.red('\t No modification was made to your entities'));
    return;
  }
  for (var i = 0; i < scheduledClasses.length; i++) {
    console.log(chalk.red('\t' + classes[scheduledClasses[i]].name));
  }

  scheduledClasses.forEach(function(element) {
    var cmd, args;
    if (process.platform === 'win32') {
      cmd = process.env.comspec || 'cmd.exe';
      args = ['/s', '/c', 'yo jhipster:entity', classes[element].name];
    } else {
      cmd = 'yo';
      args = ['jhipster:entity', classes[element].name];
    }

    child_process.spawnSync(
      cmd,
      args,
      { stdio: [process.stdin, process.stdout, process.stderr] }
    );
    console.info('\n');
  });
};

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
    + '\t-dto\t[BETA] Generates DTO with MapStruct the selected entities.'
    + '\t-paginate \tChoose your entities\' pagination '
  );
};


/*
 * @param{Map} All the entities we want to choose from
 * Display in prompt the list of the entities you want to choose pagination for
 */
function askForPagination(classes) {
  var _continue = true;

  while(_continue){
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
        _continue = answer.addPagination;
        done = true;
      }
    );
    while(!done) {
      require('deasync').sleep(100);
    }
  }
    return listPagination;
};

function askForClassesToPaginate(classes){
 
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
};

function askForStylePagination(){
  var inquirer = require('inquirer');
  var choice = null;
  var choicesList = [
    {name : "Pagination links", value : "pagination"},
    {name : "Simple pager", value : "pager"},
    {name : "Infinit Scroll", value : "infinite-scroll"}
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
};


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
};