'use strict';

const _ = require('lodash'),
    JDLObject = require('jhipster-core').JDLObject,
    JDLEntity = require('jhipster-core').JDLEntity,
    JDLEnum = require('jhipster-core').JDLEnum,
    JDLField = require('jhipster-core').JDLField,
    JDLRelationship = require('jhipster-core').JDLRelationship,
    JDLValidation = require('jhipster-core').JDLValidation,
    JDLUnaryOption = require('jhipster-core').JDLUnaryOption,
    JDLBinaryOption = require('jhipster-core').JDLBinaryOption,
    UnaryOptions = require('jhipster-core').JHipsterUnaryOptions.UNARY_OPTIONS,
    BinaryOptions = require('jhipster-core').JHipsterBinaryOptions.BINARY_OPTIONS,
    BinaryOptionValues = require('jhipster-core').JHipsterBinaryOptions.BINARY_OPTION_VALUES,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  toJDL: toJDL,
  toJDLString: toJDLString
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
  if (!parsedData) {
    throw new buildException(
        exceptions.NullPointer,
        'The parsed data must be passed');
  }
  var jdlObject = new JDLObject();
  var jdlEntityObject = convertClasses(parsedData);
  addEntitiesToJDLObject(jdlObject, jdlEntityObject);
  var jdlRelationshipArray = convertAssociations(parsedData.associations, jdlObject.entities, parsedData.classes);
  addRelationshipsToJDLObject(jdlObject, jdlRelationshipArray);
  var jdlEnumArray = convertEnums(parsedData.enums);
  addEnumsToJDLObject(jdlObject, jdlEnumArray);
  if (options) {
    var jdlOptionArray = convertOptions(options);
    addOptionsToJDLObject(jdlObject, jdlOptionArray);
  }
  return jdlObject;
}

function convertClasses(parsedData) {
  var jdlEntities = {};
  for (let i = 0, classIds = Object.keys(parsedData.classes); i < classIds.length; i++) {
    let classData = parsedData.classes[classIds[i]];
    let jdlEntity = new JDLEntity({
      name: classData.name,
      tableName: classData.tableName,
      comment: classData.comment
    });
    addFieldsToEntity(jdlEntity, convertFields(classData.fields, parsedData.fields, parsedData.validations));
    jdlEntities[jdlEntity.name] = jdlEntity;
  }
  return jdlEntities;
}

function addFieldsToEntity(jdlEntity, jdlFieldArray) {
  for (let i = 0; i < jdlFieldArray.length; i++) {
    jdlEntity.addField(jdlFieldArray[i]);
  }
}

function convertFields(classFields, parsedFields, parsedValidations) {
  var jdlFieldArray = [];
  for (let i = 0;i < classFields.length; i++) {
    let fieldData = parsedFields[classFields[i]];
    let jdlField = new JDLField({
      name: fieldData.name,
      type: fieldData.type,
      comment: fieldData.comment
    });
    addValidationsToField(jdlField, convertValidations(fieldData.validations, parsedValidations));
    jdlFieldArray.push(jdlField);
  }
  return jdlFieldArray;
}

function addValidationsToField(jdlField, jdlValidationArray) {
  for (let i = 0; i < jdlValidationArray.length; i++) {
    jdlField.addValidation(jdlValidationArray[i]);
  }
}

function convertValidations(fieldsValidations, parsedValidations) {
  var jdlValidationArray = [];
  for (let i = 0; i < fieldsValidations.length; i++) {
    let validationData = parsedValidations[fieldsValidations[i]];
    jdlValidationArray.push(new JDLValidation({
      name: validationData.name,
      value: validationData.value
    }));
  }
  return jdlValidationArray;
}

function convertAssociations(associations, jdlEntities, parsedClasses) {
  var jdlRelationshipArray = [];
  for (let i = 0, associationIds = Object.keys(associations); i < associationIds.length; i++) {
    let associationData = associations[associationIds[i]];
    jdlRelationshipArray.push(new JDLRelationship({
      from: jdlEntities[parsedClasses[associationData.from].name],
      to: jdlEntities[parsedClasses[associationData.to].name],
      type: associationData.type.split('-').map(function(element) {
        return _.capitalize(element);
      }).join(''),
      injectedFieldInFrom: associationData.injectedFieldInFrom,
      injectedFieldInTo: associationData.injectedFieldInTo,
      commentInFrom: associationData.commentInFrom,
      commentInTo: associationData.commentInTo
    }));
  }
  return jdlRelationshipArray;
}

function convertEnums(enums) {
  var enumArray = [];
  for (let i = 0, enumIds = Object.keys(enums); i < enumIds.length; i++) {
    let enumData = enums[enumIds[i]];
    enumArray.push(new JDLEnum({
      name: enumData.name,
      values: enumData.values
    }));
  }
  return enumArray;
}

function convertOptions(options) {
  var optionArray = [];
  addDTOOptions(optionArray, options);
  addPaginationOptions(optionArray, options);
  addServiceOptions(optionArray, options);
  addSkipClientOption(optionArray, options);
  addSkipServerOption(optionArray, options);
  addMicroserviceOption(optionArray, options);
  addSearchEngineOptions(optionArray, options);
  return optionArray;
}

function addDTOOptions(optionArray, options) {
  if (!options.listDTO) {
    return;
  }
  optionArray.push(new JDLBinaryOption({
    name: BinaryOptions.DTO,
    entityNames: options.listDTO,
    value: BinaryOptionValues.dto.MAPSTRUCT
  }));
}
function addPaginationOptions(optionArray, options) {
  if (!options.listPagination) {
    return;
  }
  var entitiesByPaginationType = {};
  for (let i = 0, entityNames = Object.keys(options.listPagination); i < entityNames.length; i++) {
    if (!entitiesByPaginationType[options.listPagination[entityNames[i]]]) {
      entitiesByPaginationType[options.listPagination[entityNames[i]]] = [];
    }
    entitiesByPaginationType[options.listPagination[entityNames[i]]].push(options.listPagination[entityNames[i]]);
  }
  for (let i = 0, paginationTypes = Object.keys(entitiesByPaginationType); i < paginationTypes.length; i++) {
    optionArray.push(new JDLBinaryOption({
      name: BinaryOptions.PAGINATION,
      entityNames: entitiesByPaginationType[paginationTypes[i]],
      value: paginationTypes[i]
    }));
  }
}
function addServiceOptions(optionArray, options) {
  if (!options.listService) {
    return;
  }
  var entitiesByServiceType = {};
  for (let i = 0, entityNames = Object.keys(options.listService); i < entityNames.length; i++) {
    if (!entitiesByServiceType[options.listService[entityNames[i]]]) {
      entitiesByServiceType[options.listService[entityNames[i]]] = [];
    }
    entitiesByServiceType[options.listService[entityNames[i]]].push(options.listService[entityNames[i]]);
  }
  for (let i = 0, serviceTypes = Object.keys(entitiesByServiceType); i < serviceTypes.length; i++) {
    optionArray.push(new JDLBinaryOption({
      name: BinaryOptions.SERVICE,
      entityNames: entitiesByServiceType[serviceTypes[i]],
      value: serviceTypes[i]
    }));
  }
}

function addMicroserviceOption(optionArray, options) {
  if (!options.microserviceNames) {
    return;
  }
  var entitiesByMicroservice = {};
  for (let i = 0, entityNames = Object.keys(options.microserviceNames); i < entityNames.length; i++) {
    if (!entitiesByMicroservice[options.microserviceNames[entityNames[i]]]) {
      entitiesByMicroservice[options.microserviceNames[entityNames[i]]] = [];
    }
    entitiesByMicroservice[options.microserviceNames[entityNames[i]]].push(options.microserviceNames[entityNames[i]]);
  }
  for (let i = 0, microservices = Object.keys(entitiesByMicroservice); i < microservices.length; i++) {
    optionArray.push(new JDLBinaryOption({
      name: BinaryOptions.MICROSERVICE,
      entityNames: entitiesByMicroservice[microservices[i]],
      value: microservices[i]
    }));
  }
}

function addSearchEngineOptions(optionArray, options) {
  if (!options.searchEngines) {
    return;
  }
  optionArray.push(new JDLBinaryOption({
    name: BinaryOptions.SEARCH_ENGINE,
    entityNames: options.searchEngines,
    value: BinaryOptionValues.searchEngine.ELASTIC_SEARCH
  }));
}

function addSkipClientOption(optionArray, options) {
  if (!options.listOfNoClient) {
    return;
  }
  optionArray.push(new JDLUnaryOption({
    name: UnaryOptions.SKIP_CLIENT,
    entityNames: options.listOfNoClient
  }));
}

function addSkipServerOption(optionArray, options) {
  if (!options.listOfNoServer) {
    return;
  }
  optionArray.push(new JDLUnaryOption({
    name: UnaryOptions.SKIP_SERVER,
    entityNames: options.listOfNoServer
  }));
}

function addAngularSuffixOption(optionArray, options) {
  if (!options.angularSuffixes) {
    return;
  }
  var entitiesBySuffix = {};
  for (let i = 0, entityNames = Object.keys(options.angularSuffixes); i < entityNames.length; i++) {
    if (!entitiesBySuffix[options.angularSuffixes[entityNames[i]]]) {
      entitiesBySuffix[options.angularSuffixes[entityNames[i]]] = [];
    }
    entitiesBySuffix[options.angularSuffixes[entityNames[i]]].push(options.angularSuffixes[entityNames[i]]);
  }
  for (let i = 0, suffixes = Object.keys(entitiesBySuffix); i < suffixes.length; i++) {
    optionArray.push(new JDLBinaryOption({
      name: BinaryOptions.ANGULAR_SUFFIX,
      entityNames: entitiesBySuffix[suffixes[i]],
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
