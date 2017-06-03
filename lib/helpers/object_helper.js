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
'use strict';

const _ = require('lodash'),
  buildException = require('../exceptions/exception_factory').buildException,
  exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  areJHipsterEntitiesEqual: areJHipsterEntitiesEqual
};

function areJHipsterEntitiesEqual(firstEntity, secondEntity) {
  if (!firstEntity || !secondEntity) {
    throw new buildException(exceptions.NullPointer, "The objects to compare can't be nil.");
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
