'use strict';

const QuestionAsker = require('./question_asker');

module.exports = {
  askForPagination: askForPagination,
  askForService: askForService,
  askForDTO: askForDTO,
  askForClassesToSkipClientCode: askForClassesToSkipClientCode,
  askForClassesToSkipServerCode: askForClassesToSkipServerCode,
  askForAngularSuffixes: askForAngularSuffixes,
  askForMicroserviceNames: askForMicroserviceNames,
  askForSearchEngines: askForSearchEngines,
  askForClassesWithNoFluentMethods: askForClassesWithNoFluentMethods
};

function askForClassesToPaginate(classes, value) {
  return QuestionAsker.selectMultipleChoices({
    classes: classes,
    question: `Please choose the entities you want to paginate with ${value}:`
  });
}

function askForPagination(classes, values) {
  if (!(values instanceof Array)) {
    values = [values];
  }
  var listPagination = {};
  for (let i = 0; i < values.length; i++) {
    let classesToPaginate = askForClassesToPaginate(classes, values[i]);
    if (classesToPaginate.length === 0) {
      continue;
    }
    for (let j = 0; j < classesToPaginate.length; j++) {
      listPagination[classesToPaginate[j]] = values[i];
    }
  }
  return listPagination;
}

function askForClassesToService(classes, value) {
  return QuestionAsker.selectMultipleChoices({
    classes: classes,
    question: `Please choose the entities you want to add a service ${value ? `with ${value}` : ''}:`
  });
}

function askForService(classes, values) {
  if (!(values instanceof Array)) {
    values = [values];
  }
  var listService = {};
  for (let i = 0; i < values.length; i++) {
    let classesToService = askForClassesToService(classes, values[i]);
    if (classesToService.length === 0) {
      continue;
    }
    for (let j = 0; j < classesToService.length; j++) {
      listService[classesToService[j]] = values[i];
    }
  }
  return listService;
}

function askForClassesToDto(classes, value) {
  return QuestionAsker.selectMultipleChoices({
    classes: classes,
    question: `Please choose the entities you want to generate the DTO ${value}:`
  });
}

function askForDTO(classes, values) {
  if (!(values instanceof Array)) {
    values = [values];
  }
  var listDto = {};
  for (let i = 0; i < values.length; i++) {
    let classesToDto = askForClassesToDto(classes, values[i]);
    if (classesToDto.length === 0) {
      continue;
    }
    for (let j = 0; j < classesToDto.length; j++) {
      listDto[classesToDto[j]] = values[i];
    }
  }
  return listDto;
}

function askForClassesToSkipClientCode(classes) {
  return QuestionAsker.selectMultipleChoices({
    classes: classes,
    question: "Please choose the entities that won't have any client code:"
  });
}

function askForClassesWithNoFluentMethods(classes) {
  return QuestionAsker.selectMultipleChoices({
    classes: classes,
    question: "Please choose the entities that won't have any fluent methods:"
  });
}

function askForClassesToSkipServerCode(classes) {
  return QuestionAsker.selectMultipleChoices({
    classes: classes,
    question: "Please choose the entities that won't have any server code:"
  });
}

function askForAngularSuffixes(classes, values) {
  if (!(values instanceof Array)) {
    values = [values];
  }
  var angularSuffixes = {};
  for (let i = 0; i < values.length; i++) {
    let classesToSuffix = askForAngularSuffixesClasses(classes, values[i]);
    if (classesToSuffix.length === 0) {
      continue;
    }
    for (let j = 0; j < classesToSuffix.length; j++) {
      angularSuffixes[classesToSuffix[j]] = values[i];
    }
  }
  return angularSuffixes;
}

function askForAngularSuffixesClasses(classes, value) {
  return QuestionAsker.selectMultipleChoices({
    classes: classes,
    question: `Please choose the entities you want to add an angular suffix with ${value}:`
  });
}

function askForMicroserviceNames(classes, values) {
  if (!(values instanceof Array)) {
    values = [values];
  }
  var microserviceNames = {};
  for (let i = 0; i < values.length; i++) {
    let classesToTreat = askForMicroserviceNamesClasses(classes, values[i]);
    if (classesToTreat.length === 0) {
      continue;
    }
    for (let j = 0; j < classesToTreat.length; j++) {
      microserviceNames[classesToTreat[j]] = values[i];
    }
  }
  return microserviceNames;
}

function askForMicroserviceNamesClasses(classes, value) {
  return QuestionAsker.selectMultipleChoices({
    classes: classes,
    question: `Please choose the entities included in microservice ${value}:`
  });
}

function askForClassesToBeSearched(classes, value) {
  return QuestionAsker.selectMultipleChoices({
    classes: classes,
    question: `Please choose the entities that can be searched with ${value}:`
  });
}

function askForSearchEngines(classes, values) {
  if (!(values instanceof Array)) {
    values = [values];
  }
  var listSearchEngine = {};
  for (let i = 0; i < values.length; i++) {
    let classesToSearch = askForClassesToBeSearched(classes, values[i]);
    if (classesToSearch.length === 0) {
      continue;
    }
    for (let j = 0; j < classesToSearch.length; j++) {
      listSearchEngine[classesToSearch[j]] = values[i];
    }
  }
  return listSearchEngine;
}
