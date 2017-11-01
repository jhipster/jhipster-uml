/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://jhipster.github.io/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const QuestionAsker = require('./question_asker');

module.exports = {
  askForPagination,
  askForService,
  askForDTO,
  askForClassesToSkipClientCode,
  askForClassesToSkipServerCode,
  askForAngularSuffixes,
  askForMicroserviceNames,
  askForSearchEngines,
  askForClassesWithFluentMethods,
  askForClassesWithJPAMetamodelFiltering
};

function askForClassesToPaginate(classes, value) {
  return QuestionAsker.selectMultipleChoices({
    classes,
    question: `Please choose the entities you want to paginate with ${value}:`
  });
}

function askForPagination(classes, values) {
  if (!(values instanceof Array)) {
    values = [values];
  }
  const listPagination = {};
  for (let i = 0; i < values.length; i++) {
    const classesToPaginate = askForClassesToPaginate(classes, values[i]);
    for (let j = 0; j < classesToPaginate.length; j++) {
      listPagination[classesToPaginate[j]] = values[i];
    }
  }
  return listPagination;
}

function askForClassesToService(classes, value) {
  return QuestionAsker.selectMultipleChoices({
    classes,
    question: `Please choose the entities you want to add a service ${value ? `with ${value}` : ''}:`
  });
}

function askForService(classes, values) {
  if (!(values instanceof Array)) {
    values = [values];
  }
  const listService = {};
  for (let i = 0; i < values.length; i++) {
    const classesToService = askForClassesToService(classes, values[i]);
    for (let j = 0; j < classesToService.length; j++) {
      listService[classesToService[j]] = values[i];
    }
  }
  return listService;
}

function askForClassesToDto(classes, value) {
  return QuestionAsker.selectMultipleChoices({
    classes,
    question: `Please choose the entities you want to generate the DTO with ${value}:`
  });
}

function askForDTO(classes, values) {
  if (!(values instanceof Array)) {
    values = [values];
  }
  const listDto = {};
  for (let i = 0; i < values.length; i++) {
    const classesToDto = askForClassesToDto(classes, values[i]);
    for (let j = 0; j < classesToDto.length; j++) {
      listDto[classesToDto[j]] = values[i];
    }
  }
  return listDto;
}

function askForClassesToSkipClientCode(classes) {
  return QuestionAsker.selectMultipleChoices({
    classes,
    question: 'Please choose the entities that won\'t have any client code:'
  });
}

function askForClassesWithFluentMethods(classes) {
  return QuestionAsker.selectMultipleChoices({
    classes,
    question: 'Please choose the entities that will have fluent methods:'
  });
}

function askForClassesWithJPAMetamodelFiltering(classes) {
  return QuestionAsker.selectMultipleChoices({
    classes,
    question: 'Please choose the entities that will be filtered (JPA metamodel filtering):'
  });
}

function askForClassesToSkipServerCode(classes) {
  return QuestionAsker.selectMultipleChoices({
    classes,
    question: 'Please choose the entities that won\'t have any server code:'
  });
}

function askForAngularSuffixes(classes, values) {
  if (!(values instanceof Array)) {
    values = [values];
  }
  const angularSuffixes = {};
  for (let i = 0; i < values.length; i++) {
    const classesToSuffix = askForAngularSuffixesClasses(classes, values[i]);
    for (let j = 0; j < classesToSuffix.length; j++) {
      angularSuffixes[classesToSuffix[j]] = values[i];
    }
  }
  return angularSuffixes;
}

function askForAngularSuffixesClasses(classes, value) {
  return QuestionAsker.selectMultipleChoices({
    classes,
    question: `Please choose the entities you want to add an angular suffix with ${value}:`
  });
}

function askForMicroserviceNames(classes, values) {
  if (!(values instanceof Array)) {
    values = [values];
  }
  const microserviceNames = {};
  for (let i = 0; i < values.length; i++) {
    const classesToTreat = askForMicroserviceNamesClasses(classes, values[i]);
    for (let j = 0; j < classesToTreat.length; j++) {
      microserviceNames[classesToTreat[j]] = values[i];
    }
  }
  return microserviceNames;
}

function askForMicroserviceNamesClasses(classes, value) {
  return QuestionAsker.selectMultipleChoices({
    classes,
    question: `Please choose the entities included in microservice ${value}:`
  });
}

function askForClassesToBeSearched(classes, value) {
  return QuestionAsker.selectMultipleChoices({
    classes,
    question: `Please choose the entities that can be searched with ${value}:`
  });
}

function askForSearchEngines(classes, values) {
  if (!(values instanceof Array)) {
    values = [values];
  }
  const listSearchEngine = {};
  for (let i = 0; i < values.length; i++) {
    const classesToSearch = askForClassesToBeSearched(classes, values[i]);
    for (let j = 0; j < classesToSearch.length; j++) {
      listSearchEngine[classesToSearch[j]] = values[i];
    }
  }
  return listSearchEngine;
}
