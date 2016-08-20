'use strict';

const QuestionAsker = require('./question_asker');

module.exports = {
  askForPagination: askForPagination,
  askForService: askForService,
  askForDTO: askForDTO,
  askForClassesToSkipClientCode: askForClassesToSkipClientCode,
  askForClassesToSkipServerCode: askForClassesToSkipServerCode,
  askForAngularSuffixes: askForAngularSuffixes,
  isAValidDTO: isAValidDTO,
  isAValidPagination: isAValidPagination,
  isAValidService: isAValidService,
  askForMicroserviceNames: askForMicroserviceNames,
  askForSearchEngines: askForSearchEngines
};

const DTO_OPTIONS = {mapstruct: null};
const PAGINATION_OPTIONS = {
  pager: null,
  pagination: null,
  'infinite-scroll': null
};
const SERVICE_OPTIONS = {
  serviceClass: null,
  serviceImpl: null
};
const SEARCH_ENGINE_OPTIONS = {elasticsearch: null};

function askForClassesToPaginate(classes, value) {
  return QuestionAsker.selectMultipleChoices({
    classes: classes,
    question: `Please choose the entities you want to paginate ${value ? `with ${value}` : ''}:`
  });
}

function askForStylePagination(className) {
  var choicesList = [
    {name: 'Pagination links', value: 'pagination'},
    {name: 'Simple pager', value: 'pager'},
    {name: 'Infinite Scroll', value: 'infinite-scroll'}
  ];
  return QuestionAsker.selectSingleChoice({
    choices: choicesList,
    question: `Please choose the pagination style for ${className}:`
  });
}

function askForPagination(classes, value) {
  var listPagination = {};
  var shouldContinueAsking = true;
  while (shouldContinueAsking) {
    let classesToPaginate = askForClassesToPaginate(classes, value);
    if (classesToPaginate.length === 0) {
      return listPagination;
    }
    for (let i = 0; i < classesToPaginate.length; i++) {
      listPagination[classesToPaginate[i]] = value || askForStylePagination(classesToPaginate[i]);
    }
    if (!value) {
      shouldContinueAsking = QuestionAsker.askConfirmation({
        question: 'Do you want to add an other pagination style?',
        defaultValue: false
      });
    } else {
      shouldContinueAsking = false;
    }
  }
  return listPagination;
}

function askForClassesToTreatWithServices(classes, value) {
  return QuestionAsker.selectMultipleChoices({
    classes: classes,
    question: `Please choose the entities you want to add a service ${value ? `with ${value}` : ''}:`
  });
}

function askForServiceType(className) {
  var choicesList = [
    {name: 'A separate service class', value: 'serviceClass'},
    {
      name: 'A separate service interface and implementation',
      value: 'serviceImpl'
    }
  ];
  return QuestionAsker.selectSingleChoice({
    choices: choicesList,
    question: `Please choose the service type for ${className}:`
  });
}

function askForService(classes, value) {
  var shouldContinueAsking = true;
  var listService = {};
  while (shouldContinueAsking) {
    let classesToTreat = askForClassesToTreatWithServices(classes, value);
    if (classesToTreat.length === 0) {
      return listService;
    }
    for (let i = 0; i < classesToTreat.length; i++) {
      listService[classesToTreat[i]] = value || askForServiceType(classesToTreat[i]);
    }
    if (!value) {
      shouldContinueAsking = QuestionAsker.askConfirmation({
        question: 'Do you want to add an other service?',
        defaultValue: false
      });
    } else {
      shouldContinueAsking = false;
    }
  }
  return listService;
}

function askForDTO(classes, value) {
  return QuestionAsker.selectMultipleChoices({
    classes: classes,
    question: `Please choose the entities you want to generate the DTO ${value ? `with ${value}` : ''}:`
  });
}

function askForClassesToSkipClientCode(classes) {
  return QuestionAsker.selectMultipleChoices({
    classes: classes,
    question: "Please choose the entities that won't have any client code:"
  });
}

function askForClassesToSkipServerCode(classes) {
  return QuestionAsker.selectMultipleChoices({
    classes: classes,
    question: "Please choose the entities that won't have any server code:"
  });
}

function askForAngularSuffixes(classes, value) {
  var shouldContinueAsking = true;
  var angularSuffixes = {};
  while (shouldContinueAsking) {
    let classesToTreat = askForAngularSuffixesClasses(classes, value);
    if (classesToTreat.length === 0) {
      return angularSuffixes;
    }
    for (let i = 0; i < classesToTreat.length; i++) {
      angularSuffixes[classesToTreat[i]] = value || askForAngularSuffix(classesToTreat[i]);
    }
    if (!value) {
      shouldContinueAsking = QuestionAsker.askConfirmation({
        question: 'Do you want to add an other angular suffix?',
        defaultValue: false
      });
    } else {
      shouldContinueAsking = false;
    }
  }
  return angularSuffixes;
}

function askForAngularSuffixesClasses(classes, value) {
  return QuestionAsker.selectMultipleChoices({
    classes: classes,
    question: `Please choose the entities you want to add an angular suffix ${value ? `with ${value}` : ''}:`
  });
}

function askForAngularSuffix(className) {
  return QuestionAsker.askForInput({
    question: `Please choose the angular suffix type for ${className}:`
  });
}

function askForMicroserviceNames(classes, value) {
  var shouldContinueAsking = true;
  var microserviceNames = {};
  while (shouldContinueAsking) {
    let classesToTreat = askForMicroserviceNamesClasses(classes, value);
    if (classesToTreat.length === 0) {
      return microserviceNames;
    }
    for (let i = 0; i < classesToTreat.length; i++) {
      microserviceNames[classesToTreat[i]] = value || askForMicroserviceName(classesToTreat[i]);
    }
    if (!value) {
      shouldContinueAsking = QuestionAsker.askConfirmation({
        question: "Do you want to add an other microservice's name?",
        defaultValue: false
      });
    } else {
      shouldContinueAsking = false;
    }
  }
  return microserviceNames;
}

function askForMicroserviceNamesClasses(classes) {
  return QuestionAsker.selectMultipleChoices({
    classes: classes,
    question: `Please choose the entities included in a microservice ${value ? `(${value})` : ''}:.`
  });
}

function askForMicroserviceName(className) {
  return QuestionAsker.askForInput({
    question: `Please choose the microservice's name for ${className}:`
  });
}

function askForSearchEngines(classes, value) {
  return QuestionAsker.selectMultipleChoices({
    classes: classes,
    question: `Please choose the entities that can be searched ${value ? `with ${value}` : ''}:`
  });
}

function isAValidDTO(dto) {
  return DTO_OPTIONS.hasOwnProperty(dto);
}
function isAValidPagination(pagination) {
  return PAGINATION_OPTIONS.hasOwnProperty(pagination);
}
function isAValidService(service) {
  return SERVICE_OPTIONS.hasOwnProperty(service);
}
