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
const _ = require('lodash');
const JHipsterCore = require('jhipster-core');

const JHipsterFieldTypes = JHipsterCore.JHipsterFieldTypes;
const JDLObject = JHipsterCore.JDLObject;
const JDLEntity = JHipsterCore.JDLEntity;
const JDLEnum = JHipsterCore.JDLEnum;
const JDLField = JHipsterCore.JDLField;
const JDLRelationship = JHipsterCore.JDLRelationship;
const JDLValidation = JHipsterCore.JDLValidation;
const JDLUnaryOption = JHipsterCore.JDLUnaryOption;
const JDLBinaryOption = JHipsterCore.JDLBinaryOption;
const UnaryOptions = JHipsterCore.JHipsterUnaryOptions;
const BinaryOptions = JHipsterCore.JHipsterBinaryOptions.Options;
const BinaryOptionValues = JHipsterCore.JHipsterBinaryOptions.Values;
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  toJDL,
  toJDLString
};

function toJDLString(parsedData, options) {
  return toJDL(parsedData, options).toString();
}

/**
 * Converts the parsed data from any XMI file to a JDLObject.
 * @param parsedData the parsed data.
 * @param options an object having as keys:
 *                - listDTO,
 *                - listPagination,
 *                - listService,
 *                - listOfNoClient,
 *                - listOfNoServer,
 *                - angularSuffixes,
 *                - microserviceNames,
 *                - searchEngines
 */
function toJDL(parsedData, options) {
  assertParsedDataIsValid(parsedData);
  const jdlObject = new JDLObject();
  const jdlEnumArray = convertEnums(parsedData.enums);
  addEnumsToJDLObject(jdlObject, jdlEnumArray);
  const jdlEntityObject = convertClasses(parsedData);
  addEntitiesToJDLObject(jdlObject, jdlEntityObject);
  const jdlRelationshipArray = convertAssociations(parsedData, jdlObject.entities);
  addRelationshipsToJDLObject(jdlObject, jdlRelationshipArray);
  if (options) {
    const jdlOptionArray = convertOptions(options, parsedData.classNames.length);
    addOptionsToJDLObject(jdlObject, jdlOptionArray);
  }
  return jdlObject;
}

function assertParsedDataIsValid(parsedData) {
  if (!parsedData) {
    throw new BuildException(exceptions.NullPointer, 'The parsed data must be passed');
  }
}

function convertEnums(enums) {
  const enumArray = [];
  for (let i = 0, enumIds = Object.keys(enums); i < enumIds.length; i++) {
    const enumData = enums[enumIds[i]];
    enumArray.push(new JDLEnum({
      name: enumData.name,
      values: enumData.values
    }));
  }
  return enumArray;
}

function convertClasses(parsedData) {
  const jdlEntities = {};
  for (let i = 0, classIds = Object.keys(parsedData.classes); i < classIds.length; i++) {
    const classData = parsedData.classes[classIds[i]];
    const jdlEntity = new JDLEntity({
      name: classData.name,
      tableName: classData.tableName,
      comment: classData.comment
    });
    addFieldsToEntity(jdlEntity, convertFields(classData.fields, parsedData));
    jdlEntities[jdlEntity.name] = jdlEntity;
  }
  return jdlEntities;
}

function addFieldsToEntity(jdlEntity, jdlFieldArray) {
  jdlFieldArray.forEach((jdlField) => {
    jdlEntity.addField(jdlField);
  });
}

function convertFields(classFields, parsedData) {
  const jdlFieldArray = [];
  for (let i = 0; i < classFields.length; i++) {
    const fieldData = parsedData.fields[classFields[i]];
    const jdlField = new JDLField({
      name: fieldData.name,
      type: getFieldType(fieldData, parsedData),
      comment: fieldData.comment
    });
    addValidationsToField(jdlField, convertValidations(fieldData.validations, parsedData.validations));
    jdlFieldArray.push(jdlField);
  }
  return jdlFieldArray;
}

function getFieldType(fieldData, parsedData) {
  const fieldType = fieldData.type;
  if (parsedData.enums[fieldType]) {
    return parsedData.enums[fieldType].name;
  }
  if (!JHipsterFieldTypes.isCommonDBType(fieldType)
    && !JHipsterFieldTypes.isCassandraType(fieldType)
    && !!parsedData.types[fieldType]) {
    return parsedData.types[fieldType].name;
  }
  return fieldType;
}

function addValidationsToField(jdlField, jdlValidationArray) {
  jdlValidationArray.forEach((jdlValidation) => {
    jdlField.addValidation(jdlValidation);
  });
}
function convertValidations(fieldsValidations, parsedValidations) {
  const jdlValidationArray = [];
  for (let i = 0; i < fieldsValidations.length; i++) {
    const validationData = parsedValidations[fieldsValidations[i]];
    jdlValidationArray.push(new JDLValidation({
      name: validationData.name,
      value: validationData.value
    }));
  }
  return jdlValidationArray;
}
function convertAssociations(parsedData, jdlEntities) {
  const jdlRelationshipArray = [];
  for (let i = 0, associationIds = Object.keys(parsedData.associations); i < associationIds.length; i++) {
    const associationData = parsedData.associations[associationIds[i]];
    jdlRelationshipArray.push(new JDLRelationship({
      from: jdlEntities[parsedData.classes[associationData.from].name],
      to: jdlEntities[parsedData.classes[associationData.to].name],
      type: associationData.type.split('-').map(element => _.capitalize(element)).join(''),
      injectedFieldInFrom: associationData.injectedFieldInFrom,
      injectedFieldInTo: associationData.injectedFieldInTo,
      commentInFrom: associationData.commentInFrom,
      commentInTo: associationData.commentInTo
    }));
  }
  return jdlRelationshipArray;
}
function convertOptions(options, numberOfClasses) {
  const optionArray = [];
  addDTOOptions(optionArray, options, numberOfClasses);
  addPaginationOptions(optionArray, options, numberOfClasses);
  addServiceOptions(optionArray, options, numberOfClasses);
  addSkipClientOption(optionArray, options, numberOfClasses);
  addSkipServerOption(optionArray, options, numberOfClasses);
  addMicroserviceOption(optionArray, options, numberOfClasses);
  addSearchEngineOptions(optionArray, options, numberOfClasses);
  addAngularSuffixOption(optionArray, options, numberOfClasses);
  return optionArray;
}
function addDTOOptions(optionArray, options, numberOfClasses) {
  if (!options.listDTO || Object.keys(options.listDTO).length === 0) {
    return;
  }
  optionArray.push(new JDLBinaryOption({
    name: BinaryOptions.DTO,
    entityNames: options.listDTO.length === numberOfClasses ? ['*'] : options.listDTO,
    value: BinaryOptionValues.dto.MAPSTRUCT
  }));
}
function addPaginationOptions(optionArray, options, numberOfClasses) {
  if (!options.listPagination || Object.keys(options.listPagination).length === 0) {
    return;
  }
  const entitiesByPaginationType = {};
  for (let i = 0, entityNames = Object.keys(options.listPagination); i < entityNames.length; i++) {
    if (!entitiesByPaginationType[options.listPagination[entityNames[i]]]) {
      entitiesByPaginationType[options.listPagination[entityNames[i]]] = [];
    }
    entitiesByPaginationType[options.listPagination[entityNames[i]]].push(entityNames[i]);
  }
  for (let i = 0, paginationTypes = Object.keys(entitiesByPaginationType); i < paginationTypes.length; i++) {
    optionArray.push(new JDLBinaryOption({
      name: BinaryOptions.PAGINATION,
      entityNames: entitiesByPaginationType[paginationTypes[i]].length === numberOfClasses ? ['*'] : entitiesByPaginationType[paginationTypes[i]],
      value: paginationTypes[i]
    }));
  }
}
function addServiceOptions(optionArray, options, numberOfClasses) {
  if (!options.listService || Object.keys(options.listService).length === 0) {
    return;
  }
  const entitiesByServiceType = {};
  for (let i = 0, entityNames = Object.keys(options.listService); i < entityNames.length; i++) {
    if (!entitiesByServiceType[options.listService[entityNames[i]]]) {
      entitiesByServiceType[options.listService[entityNames[i]]] = [];
    }
    entitiesByServiceType[options.listService[entityNames[i]]].push(entityNames[i]);
  }
  for (let i = 0, serviceTypes = Object.keys(entitiesByServiceType); i < serviceTypes.length; i++) {
    optionArray.push(new JDLBinaryOption({
      name: BinaryOptions.SERVICE,
      entityNames: entitiesByServiceType[serviceTypes[i]].length === numberOfClasses ? ['*'] : entitiesByServiceType[serviceTypes[i]],
      value: serviceTypes[i]
    }));
  }
}
function addMicroserviceOption(optionArray, options, numberOfClasses) {
  if (!options.microserviceNames || Object.keys(options.microserviceNames).length === 0) {
    return;
  }
  const entitiesByMicroservice = {};
  for (let i = 0, entityNames = Object.keys(options.microserviceNames); i < entityNames.length; i++) {
    if (!entitiesByMicroservice[options.microserviceNames[entityNames[i]]]) {
      entitiesByMicroservice[options.microserviceNames[entityNames[i]]] = [];
    }
    entitiesByMicroservice[options.microserviceNames[entityNames[i]]].push(entityNames[i]);
  }
  for (let i = 0, microservices = Object.keys(entitiesByMicroservice); i < microservices.length; i++) {
    optionArray.push(new JDLBinaryOption({
      name: BinaryOptions.MICROSERVICE,
      entityNames: entitiesByMicroservice[microservices[i]].length === numberOfClasses ? ['*'] : entitiesByMicroservice[microservices[i]],
      value: microservices[i]
    }));
  }
}
function addSearchEngineOptions(optionArray, options, numberOfClasses) {
  if (!options.searchEngines || Object.keys(options.searchEngines).length === 0) {
    return;
  }
  optionArray.push(new JDLBinaryOption({
    name: BinaryOptions.SEARCH_ENGINE,
    entityNames: options.searchEngines.length === numberOfClasses ? ['*'] : options.searchEngines,
    value: BinaryOptionValues.searchEngine.ELASTIC_SEARCH
  }));
}
function addSkipClientOption(optionArray, options, numberOfClasses) {
  if (!options.listOfNoClient || options.listOfNoClient.length === 0) {
    return;
  }
  optionArray.push(new JDLUnaryOption({
    name: UnaryOptions.SKIP_CLIENT,
    entityNames: options.listOfNoClient.length === numberOfClasses ? ['*'] : options.listOfNoClient
  }));
}
function addSkipServerOption(optionArray, options, numberOfClasses) {
  if (!options.listOfNoServer || options.listOfNoServer.length === 0) {
    return;
  }
  optionArray.push(new JDLUnaryOption({
    name: UnaryOptions.SKIP_SERVER,
    entityNames: options.listOfNoServer.length === numberOfClasses ? ['*'] : options.listOfNoServer
  }));
}
function addAngularSuffixOption(optionArray, options, numberOfClasses) {
  if (!options.angularSuffixes || Object.keys(options.angularSuffixes).length === 0) {
    return;
  }
  const entitiesBySuffix = {};
  for (let i = 0, entityNames = Object.keys(options.angularSuffixes); i < entityNames.length; i++) {
    if (!entitiesBySuffix[options.angularSuffixes[entityNames[i]]]) {
      entitiesBySuffix[options.angularSuffixes[entityNames[i]]] = [];
    }
    entitiesBySuffix[options.angularSuffixes[entityNames[i]]].push(entityNames[i]);
  }
  for (let i = 0, suffixes = Object.keys(entitiesBySuffix); i < suffixes.length; i++) {
    optionArray.push(new JDLBinaryOption({
      name: BinaryOptions.ANGULAR_SUFFIX,
      entityNames: entitiesBySuffix[suffixes[i]].length === numberOfClasses ? ['*'] : entitiesBySuffix[suffixes[i]],
      value: suffixes[i]
    }));
  }
}
function addOptionsToJDLObject(jdlObject, jdlOptionArray) {
  for (let i = 0; i < jdlOptionArray.length; i++) {
    jdlObject.addOption(jdlOptionArray[i]);
  }
}
function addEntitiesToJDLObject(jdlObject, jdlEntityObject) {
  for (let i = 0, entityNames = Object.keys(jdlEntityObject); i < entityNames.length; i++) {
    jdlObject.addEntity(jdlEntityObject[entityNames[i]]);
  }
}
function addRelationshipsToJDLObject(jdlObject, jdlRelationshipArray) {
  for (let i = 0; i < jdlRelationshipArray.length; i++) {
    jdlObject.addRelationship(jdlRelationshipArray[i]);
  }
}
function addEnumsToJDLObject(jdlObject, jdlEnumArray) {
  for (let i = 0; i < jdlEnumArray.length; i++) {
    jdlObject.addEnum(jdlEnumArray[i]);
  }
}
