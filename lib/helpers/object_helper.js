'use strict';

const _ = require('lodash'),
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  areJHipsterEntitiesEqual: areJHipsterEntitiesEqual
};

function areJHipsterEntitiesEqual(firstEntity, secondEntity) {
  if (!firstEntity || !secondEntity) {
    throw new buildException(exceptions.NullPointer, "The objects to compare can't be nil.")
  }
  return areFieldsEqual(firstEntity.fields, secondEntity.fields)
      && areRelationshipsEqual(firstEntity.relationships, secondEntity.relationships)
      && areOptionsEqual(firstEntity, secondEntity);
}

function areFieldsEqual(firstFields, secondFields) {
  if (firstFields.length !== secondFields.length) {
    return false;
  }
  return _.isEqual(firstFields, secondFields);
}

function areRelationshipsEqual(firstRelationships, secondRelationships) {
  if (firstRelationships.length !== secondRelationships.length) {
    return false;
  }
  return _.isEqual(firstRelationships, secondRelationships);
}

function areOptionsEqual(firstEntity, secondEntity) {
  return firstEntity.entityTableName === secondEntity.entityTableName
      && firstEntity.dto === secondEntity.dto
      && firstEntity.pagination === secondEntity.pagination
      && firstEntity.service === secondEntity.service
      && firstEntity.microserviceName === secondEntity.microserviceName
      && firstEntity.searchEngine === secondEntity.searchEngine
      && firstEntity.fluentMethods === secondEntity.fluentMethods;
}
