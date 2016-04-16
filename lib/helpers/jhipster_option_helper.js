'use strict';

const QuestionAsker = require('./question_asker');

module.exports = {
  askForPagination: askForPagination,
  askForService: askForService,
  askForDTO: askForDTO,
  askForClassesToSkipClientCode: askForClassesToSkipClientCode,
  askForClassesToSkipServerCode: askForClassesToSkipServerCode,
  isAValidDTO: isAValidDTO,
  isAValidPagination: isAValidPagination,
  isAValidService: isAValidService
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

function askForClassesToPaginate(classes) {
  return QuestionAsker.selectMultipleChoices({
    classes: classes,
    question: 'Please choose the entities you want to paginate:'
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

function askForPagination(classes) {
  var listPagination = {};
  var shouldContinueAsking = true;
  while (shouldContinueAsking) {
    let classesToPaginate = askForClassesToPaginate(classes);
    if (classesToPaginate.length === 0) {
      return listPagination;
    }
    for (let i = 0; i < classesToPaginate.length; i++) {
      listPagination[classesToPaginate[i]] =
          askForStylePagination(classesToPaginate[i]);
    }
    shouldContinueAsking = QuestionAsker.askConfirmation({
      question: 'Do you want to add an other pagination style?',
      defaultValue: false
    });
  }
  return listPagination;
}

function askForClassesToTreatWithServices(classes) {
  return QuestionAsker.selectMultipleChoices({
    classes: classes,
    question: 'Please choose the entities you want to add a service to:'
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

function askForService(classes) {
  var shouldContinueAsking = true;
  var listService = {};
  while (shouldContinueAsking) {
    let classesToTreat = askForClassesToTreatWithServices(classes);
    if (classesToTreat.length === 0) {
      return listService;
    }
    for (let i = 0; i < classesToTreat.length; i++) {
      listService[classesToTreat[i]] = askForServiceType(classesToTreat[i]);
    }
    shouldContinueAsking = QuestionAsker.askConfirmation({
      question: 'Do you want to add an other service?',
      defaultValue: false
    });
  }
  return listService;
}

function askForDTO(classes) {
  return QuestionAsker.selectMultipleChoices({
    classes: classes,
    question: 'Please choose the entities you want to generate the DTO for:'
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

function isAValidDTO(dto) {
  return DTO_OPTIONS.hasOwnProperty(dto);
}
function isAValidPagination(pagination) {
  return PAGINATION_OPTIONS.hasOwnProperty(pagination);
}
function isAValidService(service) {
  return SERVICE_OPTIONS.hasOwnProperty(service);
}
