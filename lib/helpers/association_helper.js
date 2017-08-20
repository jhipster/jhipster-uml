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
const chalk = require('chalk');
const cardinalities = require('../cardinalities');
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;


module.exports = {
  checkValidityOfAssociation
};

/**
 * Checks the validity of the association.
 * @param {AssociationData} association the association to check.
 * @param {String} sourceName the source's name.
 * @param {String} destinationName the destination's name.
 * @throws NullPointerException if the association is nil.
 * @throws AssociationException if the association is invalid.
 */
function checkValidityOfAssociation(association, sourceName, destinationName) {
  if (!association || !association.type) {
    throw new BuildException(
      exceptions.NullPointer, 'The association must not be nil.');
  }
  switch (association.type) {
  case cardinalities.ONE_TO_ONE:
    checkOneToOne(association, sourceName, destinationName);
    break;
  case cardinalities.ONE_TO_MANY:
    checkOneToMany(association, sourceName, destinationName);
    break;
  case cardinalities.MANY_TO_ONE:
    checkManyToOne(association, sourceName, destinationName);
    break;
  case cardinalities.MANY_TO_MANY:
    checkManyToMany(association, sourceName, destinationName);
    break;
  default:
    throw new BuildException(
      exceptions.WrongAssociation,
      `The association type ${association.type} isn't supported.`);
  }
}

function checkOneToOne(association, sourceName, destinationName) {
  if (!association.injectedFieldInFrom) {
    throw new BuildException(
      exceptions.MalformedAssociation,
      `In the One-to-One relationship from ${sourceName} to ${destinationName}, `
      + 'the source entity must possess the destination in a One-to-One '
      + ' relationship, or you must invert the direction of the relationship.');
  }
}

function checkOneToMany(association, sourceName, destinationName) {
  if (!association.injectedFieldInFrom || !association.injectedFieldInTo) {
    console.warn(
      chalk.yellow(
        `In the One-to-Many relationship from ${sourceName} to  ${destinationName}, `
        + 'only bidirectionality is supported for a One-to-Many association. '
        + 'The other side will be automatically added.'));
  }
}

function checkManyToOne(association, sourceName, destinationName) {
  if (association.injectedFieldInFrom && association.injectedFieldInTo) {
    throw new BuildException(
      exceptions.MalformedAssociation,
      `In the Many-to-One relationship from ${sourceName} to ${destinationName}, `
      + 'only unidirectionality is supported for a Many-to-One relationship, '
      + 'you should create a bidirectional One-to-Many relationship instead.');
  }
}

function checkManyToMany(association, sourceName, destinationName) {
  if (!association.injectedFieldInFrom || !association.injectedFieldInTo) {
    throw new BuildException(
      exceptions.MalformedAssociation,
      `In the Many-to-Many relationship from ${sourceName} to ${destinationName}, `
      + 'only bidirectionality is supported for a Many-to-Many relationship.');
  }
}
