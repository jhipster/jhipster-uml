'use strict';

const JDLObject = require('jhipster-core').JDLObject,
    JDLEntity = require('jhipster-core').JDLEntity,
    JDLEnum = require('jhipster-core').JDLEnum,
    JDLField = require('jhipster-core').JDLField,
    JDLRelationship = require('jhipster-core').JDLRelationship,
    JDLValidation = require('jhipster-core').JDLValidation,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  toJDL: toJDL
};

function toJDL(parsedData) {
  if (!parsedData) {
    throw new buildException(
        exceptions.NullPointer,
        'The parsed data must be passed');
  }
  var jdlObject = new JDLObject();
  var jdlEntityObject = convertClasses(parsedData.classes);
  addEntitiesToJDLObject(jdlObject, jdlEntityObject);
  var jdlRelationshipArray = convertAssociations(parsedData.associations, jdlEntityObject);
  addRelationshipsToJDLObject(jdlObject, jdlRelationshipArray);
}

function convertClasses(classes) {
  var jdlEntities = {};
  for (let i = 0, classIds = Object.keys(classes); i < classIds.length; i++) {
    let classData = classes[classIds[i]];
    let jdlEntity = new JDLEntity({
      name: classData.name,
      tableName: classData.tableName,
      comment: classData.comment
    });
    addFieldsToEntity(jdlEntity, convertFields(classData.fields));
    jdlEntities[jdlEntity.name] = jdlEntity;
  }
  return jdlEntities;
}

function addFieldsToEntity(jdlEntity, jdlFieldArray) {
  for (let i = 0; i < jdlFieldArray.length; i++) {
    jdlEntity.addField(jdlFieldArray[i]);
  }
}

function convertFields(fields) {
  var jdlFieldArray = [];
  for (let i = 0, fieldIds = Object.keys(fields); i < fieldIds.length; i++) {
    let fieldData = fields[fieldIds[i]];
    let jdlField = new JDLField({
      name: fieldData.name,
      type: fieldData.type,
      comment: fieldData.comment
    });
    addValidationsToField(jdlField, convertValidations(fieldData.validations));
    jdlFieldArray.push(jdlField);
  }
  return jdlFieldArray;
}

function addValidationsToField(jdlField, jdlValidationArray) {
  for (let i = 0; i < jdlValidationArray.length; i++) {
    jdlField.addValidation(jdlValidationArray[i]);
  }
}

function convertValidations(validations) {
  var jdlValidationArray = [];
  for (let i = 0, validationIds = Object.keys(validations); i < validationIds.length; i++) {
    let validationData = validations[validationIds[i]];
    jdlValidationArray.push(new JDLValidation({
      name: validationData.name,
      value: validationData.value
    }));
  }
  return jdlValidationArray;
}

function convertAssociations(associations, jdlEntities) {
  var jdlRelationshipArray = [];
  for (let i = 0, associationIds = Object.keys(associations); i < associationIds.length; i++) {
    let associationData = associations[associationIds[i]];
    jdlRelationshipArray.push(new JDLRelationship({
      from: jdlEntities[associationData.from],
      to: jdlEntities[associationData.from],
      type: associationData.type,
      injectedFieldInFrom: associationData.injectedFieldInFrom,
      injectedFieldInTo: associationData.injectedFieldInTo,
      commentInFrom: associationData.commentInFrom,
      commentInTo: associationData.commentInTo
    }));
  }
  return jdlRelationshipArray;
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

