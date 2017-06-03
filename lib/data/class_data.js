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

const merge = require('../utils/object_utils').merge,
  checkForReservedClassName = require('../utils/jhipster_utils').checkForReservedClassName,
  checkForReservedTableName = require('../utils/jhipster_utils').checkForReservedTableName;

/**
 * The class holding class data.
 */
class ClassData {
  constructor(values) {
    const merged = merge(defaults(), values);
    checkForReservedClassName({name: merged.name, shouldThrow: true});
    checkForReservedTableName({name: merged.tableName, shouldThrow: false});
    this.name = merged.name;
    this.tableName = merged.tableName || this.name;
    this.fields = merged.fields;
    this.comment = merged.comment;
    this.dto = merged.dto;
    this.pagination = merged.pagination;
    this.service = merged.service;
    if (merged.microserviceName) {
      this.microserviceName = merged.microserviceName;
    }
    if (merged.searchEngine) {
      this.searchEngine = merged.searchEngine;
    }
  }

  /**
   * Adds a field to the class.
   * @param {Object} field the field to add.
   * @return {ClassData} this modified class.
   */
  addField(field) {
    this.fields.push(field);
    return this;
  }
}

module.exports = ClassData;

function defaults() {
  return {
    name: '',
    tableName: '',
    fields: [],
    comment: '',
    dto: 'no',
    pagination: 'no',
    service: 'no'
  };
}
