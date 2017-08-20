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
const merge = require('../utils/object_utils').merge;
const checkForReservedFieldName = require('../utils/jhipster_utils').checkForReservedFieldName;

/**
 * The class holding field data.
 */
class FieldData {
  constructor(values) {
    const merged = merge(defaults(), values);
    checkForReservedFieldName({ name: merged.name, shouldThrow: false });
    this.name = merged.name;
    this.type = merged.type;
    this.comment = merged.comment;
    this.validations = merged.validations;
  }

  /**
   * Adds a validation to the field.
   * @param {Object} validation the validation to add.
   * @return {FieldData} this modified class.
   */
  addValidation(validation) {
    this.validations.push(validation);
    return this;
  }
}

module.exports = FieldData;

function defaults() {
  return {
    name: '',
    type: '',
    comment: '',
    validations: []
  };
}
