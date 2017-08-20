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
const jhCore = require('jhipster-core');
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

const hasValidation = jhCore.JHipsterFieldTypes.hasValidation;

/**
 * This interface provides base methods for handling the types.
 */
const Types = module.exports = function () {
};

/**
 * Must be implemented by subclasses.
 * Returns the type list.
 * @return {Array} the type list.
 * @throws UnimplementedOperationException if the method has not been
 *                                         implemented by the subclass.
 */
Types.prototype.getTypes = function () {
  throw new BuildException(
    exceptions.UnimplementedOperation,
    'This method must be implemented by a subclass to be called.');
};

/**
 * Checks whether the type is contained in the supported types.
 * @param {string} type the type to check.
 * @return {boolean} whether the type is contained in the supported types.
 */
Types.prototype.contains = function (type) {
  return this.getTypes().indexOf(type) !== -1;
};

/**
 * Checks whether the type possesses the also passed validation.
 * @param type {string} the type.
 * @param validation {string} the validation to check.
 * @return {boolean} whether the type is validated by the validation.
 * @throws NoElementFoundException if no type exists for the passed type.
 */
Types.prototype.isValidationSupportedForType = function (type, validation) {
  if (!type || !validation) {
    throw new BuildException(
      exceptions.NullPointer,
      'The type and validation must not be nil.');
  }
  return hasValidation(type, validation);
};

Types.prototype.getName = function () {
  throw new BuildException(
    exceptions.UnimplementedOperation,
    'This method must be implemented by a subclass to be called.');
};
