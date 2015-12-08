'use strict';


var NOTHING_TO_GENERATE = 'nothing';
var dtoOptions = { mapstruct: null };
var paginationOptions = {
  pager: null,
  pagination: null,
  'infinite-scroll': null
};
var serviceOptions = {
  serviceClass: null,
  serviceImpl: null
};

function askForClassesToPaginate(classes) {
  var choice;
  var allEntityMessage = '*** All ***';
  var choicesList = [allEntityMessage];

  Array.prototype.push.apply(
    choicesList,
    Object.keys(classes).map(function(e) {
      return classes[e].name;
    })
  );
  require('inquirer').prompt([
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
      // if '*** All ***' is selected return all Entities
      if (answers.answer.toString().length === 0) {
        choice = NOTHING_TO_GENERATE;
      } else {
        choice = answers.answer.indexOf(allEntityMessage) !== -1
          ? choicesList
          : answers.answer;
      }
    }
  );
  while (!choice) {
    require('deasync').sleep(100);
  }
  return choice;
}

function askForStylePagination(className) {
  var choice;
  var choicesList = [
    { name : 'Pagination links', value : 'pagination' },
    { name : 'Simple pager', value : 'pager' },
    { name : 'Infinite Scroll', value : 'infinite-scroll' }
  ];

  require('inquirer').prompt([
      {
        type: 'list',
        name: 'answer',
        message: 'Please choose the pagination style for ' + className + ':',
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
  while (!choice) {
    require('deasync').sleep(100);
  }
  return choice;
}

exports.askForPagination = function(classes) {
  var listPagination = {};
  var shouldContinueAsking = true;

  while (shouldContinueAsking) {
    var done;

    var classesToPaginate = askForClassesToPaginate(classes);
    if (classesToPaginate === NOTHING_TO_GENERATE) {
      return listPagination;
    }
    classesToPaginate.forEach(function(className) {
      listPagination[className] = askForStylePagination(className);
    });
    require('inquirer').prompt([
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
    while (!done) {
      require('deasync').sleep(100);
    }
  }
  return listPagination;
};

exports.askForService = function(classes) {
  var shouldContinueAsking = true;
  while (shouldContinueAsking) {
    var done;
    var classesToTreat = askForClassesToTreatWithServices(classes);
    if (classesToTreat === NOTHING_TO_GENERATE) {
      return {};
    }
    var listService = {};
    classesToTreat.forEach(function(className) {
      listService[className] = askForServiceType(className);
    });
    require('inquirer').prompt([
        {
          type: 'confirm',
          name: 'addService',
          message: 'Do you want to add an other service?',
          default: true
        }
      ], function(answer) {
        shouldContinueAsking = answer.addService;
        done = true;
      }
    );
    while (!done) {
      require('deasync').sleep(100);
    }
  }
  return listService;
};

function askForClassesToTreatWithServices(classes) {
  var choice;
  var all = '*** All ***';
  var choicesList = [all];

  Array.prototype.push.apply(
    choicesList,
    Object.keys(classes).map(function(e) {
      return classes[e].name;
    })
  );
  require('inquirer').prompt([
      {
        type: 'checkbox',
        name: 'answer',
        message: 'Please choose the entities you want to add a service to:',
        choices: choicesList,
        filter: function(val) {
          return val;
        }
      }
    ], function(answers) {
      // if '*** All ***' is selected, return all
      if (answers.answer.toString().length === 0) {
        choice = NOTHING_TO_GENERATE;
      } else {
        choice = answers.answer.indexOf(all) !== -1
          ? choicesList
          : answers.answer;
      }
    }
  );
  while (!choice) {
    require('deasync').sleep(100);
  }
  return choice;
}

function askForServiceType(className) {
  var choice;
  var choicesList = [
    { name : 'A separate service class', value : 'serviceClass' },
    { name : 'A separate service interface and implementation', value : 'serviceImpl' }
  ];

  require('inquirer').prompt([
      {
        type: 'list',
        name: 'answer',
        message: 'Please choose the service type for ' + className + ':',
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
  while (!choice) {
    require('deasync').sleep(100);
  }
  return choice;
}

exports.askForDTO = function(classes) {
  var choice;
  var allEntityMessage = '*** All ***';
  var choicesList = [allEntityMessage];

  Array.prototype.push.apply(
    choicesList,
    Object.keys(classes).map(function(e) {
      return classes[e].name;
    })
  );

  require('inquirer').prompt([
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
      // if '*** All ***' is selected return all Entities
      choice = answers.answer.indexOf(allEntityMessage) !== -1
        ? choicesList
        : answers.answer;
    }
  );
  while (!choice) {
    require('deasync').sleep(100);
  }
  return choice;
};

exports.isAValidDTO = function(dto) {
  return dtoOptions.hasOwnProperty(dto);
};
exports.isAValidPagination = function(pagination) {
  return paginationOptions.hasOwnProperty(pagination);
};
exports.isAValidService = function(service) {
  return serviceOptions.hasOwnProperty(service);
};
