'use strict';

var inquirer = require('inquirer');


var NOTHING_TO_GENERATE = 'nothing';

function askForClassesToPaginate(classes) {
  var choice;
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
      if (answers.answer.toString().length === 0) {
        choice = NOTHING_TO_GENERATE;
      } else {
        choice = answers.answer.indexOf(allEntityMessage) !== -1
          ? choicesList
          : answers.answer;
      }
    }
  );
  while(!choice) {
    require('deasync').sleep(100);
  }
  return choice;
}

function askForStylePagination() {
  var choice;
  var choicesList = [
    { name : 'Pagination links', value : 'pagination' },
    { name : 'Simple pager', value : 'pager' },
    { name : 'Infinite Scroll', value : 'infinite-scroll' }
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
    function(answers) {
      choice = answers.answer;
    }
  );
  while(!choice) {
    require('deasync').sleep(100);
  }
  return choice;
}

exports.askForPagination = function(classes) {
  var listPagination = {};
  var shouldContinueAsking = true;

  while(shouldContinueAsking) {
    var done;

    var ctp = askForClassesToPaginate(classes);
    if (ctp === NOTHING_TO_GENERATE) {
      return listPagination;
    }
    var style = askForStylePagination();
    ctp.forEach(function(element) {
      listPagination[element] = style;
    });
    inquirer.prompt([
        {
          type: 'confirm',
          name: 'addPagination',
          message: 'Do you want to add an other pagination style?',
          default: true
        }
      ], function(answer) {
        shouldContinueAsking = answer.addPagination;
        done = true;
      }
    );
    while(!done) {
      require('deasync').sleep(100);
    }
  }
  return listPagination;
};

exports.askForDTO = function(classes) {
  var choice;
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
        message: 'Please choose the entities you want to generate the DTO for:',
        choices: choicesList,
        filter: function(val) {
          return val;
        }
      }
    ], function(answers) {
      //if '*** All Entities ***' is selected return all Entities
      choice = answers.answer.indexOf(allEntityMessage) !== -1
        ? choicesList
        : answers.answer;
    }
  );
  while(!choice) {
    require('deasync').sleep(100);
  }
  return choice;
};
