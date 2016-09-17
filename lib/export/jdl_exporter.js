'use strict';

const _ = require('lodash'),
    JHipsterFieldTypes = require('jhipster-core').JHipsterFieldTypes,
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
    var jdlOptionArray = convertOptions(options, parsedData.classNames.length);
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
    addFieldsToEntity(jdlEntity, convertFields(classData.fields, parsedData.fields, parsedData.types, parsedData.validations));
    jdlEntities[jdlEntity.name] = jdlEntity;
  }
  return jdlEntities;
}

function addFieldsToEntity(jdlEntity, jdlFieldArray) {
  for (let i = 0; i < jdlFieldArray.length; i++) {
    jdlEntity.addField(jdlFieldArray[i]);
  }
}

function convertFields(classFields, parsedFields, parsedTypes, parsedValidations) {
  var jdlFieldArray = [];
  for (let i = 0; i < classFields.length; i++) {
    let fieldData = parsedFields[classFields[i]];
    let fieldType = fieldData.type;
    if (!JHipsterFieldTypes.isSQLType(fieldType)
        && !JHipsterFieldTypes.isCassandraType(fieldType)
        && !JHipsterFieldTypes.isMongoDBType(fieldType)) {
      fieldType = parsedTypes[fieldType].name;
    }
    let jdlField = new JDLField({
      name: fieldData.name,
      type: fieldType,
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
      type: associationData.type.split('-').map(function (element) {
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

function convertOptions(options, numberOfClasses) {
  var optionArray = [];
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
  if (!options.listPagination || Object.keys(options.listPagination ).length === 0) {
    return;
  }
  var entitiesByPaginationType = {};
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
  if (!options.listService || Object.keys(options.listService ).length === 0) {
    return;
  }
  var entitiesByServiceType = {};
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
  var entitiesByMicroservice = {};
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
  var entitiesBySuffix = {};
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
