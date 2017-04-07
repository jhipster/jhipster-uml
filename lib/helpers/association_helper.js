'use strict';

const chalk = require('chalk'),
    cardinalities = require('../cardinalities'),
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;


module.exports = {
  checkValidityOfAssociation: checkValidityOfAssociation,
  autoFixAssociation: autoFixAssociation
};

/**
 * Checks the validity of the association.
 * @param {AssociationData} association the association to check.
 * @param {String} sourceName the source's name.
 * @param {String} destinationName the destination's name.
 * @throws NullPointerException if the association is nil.
 * @throws AssociationException if the association is invalid.
 */
function checkValidityOfAssociation (association, sourceName, destinationName) {
  if (!association || !association.type) {
    throw new buildException(
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
    throw new buildException(
        exceptions.WrongAssociation,
        `The association type ${association.type} isn't supported.`);
  }
}

function checkOneToOne(association, sourceName, destinationName) {
  if (!association.injectedFieldInFrom) {
    throw new buildException(
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
    throw new buildException(
        exceptions.MalformedAssociation,
        `In the Many-to-One relationship from ${sourceName} to ${destinationName}, `
        + 'only unidirectionality is supported for a Many-to-One relationship, '
        + 'you should create a bidirectional One-to-Many relationship instead.');
  }
}

function checkManyToMany(association, sourceName, destinationName) {
  if (!association.injectedFieldInFrom || !association.injectedFieldInTo) {
    throw new buildException(
        exceptions.MalformedAssociation,
        `In the Many-to-Many relationship from ${sourceName} to ${destinationName}, `
        + 'only bidirectionality is supported for a Many-to-Many relationship.');
  }
}

/**
 * Automatically fix the association.
 * @param {AssociationData} association the association to check.
 * @param {String} sourceName the source's name.
 * @param {String} destinationName the destination's name.
 * @throws NullPointerException if the association is nil.
 * @throws AssociationException if the association is invalid.
 */
function autoFixAssociation (association, sourceName, destinationName) {
  if (!association || !association.type) {
    throw new buildException(
      exceptions.NullPointer, 'The association must not be nil.');
  }
  switch (association.type) {
    case cardinalities.ONE_TO_ONE:
      //checkOneToOne(association, sourceName, destinationName);
      break;
    case cardinalities.ONE_TO_MANY:
      //checkOneToMany(association, sourceName, destinationName);
      break;
    case cardinalities.MANY_TO_ONE:
      autoFixManyToOne(association, sourceName, destinationName);
      break;
    case cardinalities.MANY_TO_MANY:
      //checkManyToMany(association, sourceName, destinationName);
      break;
    default:
      throw new buildException(
        exceptions.WrongAssociation,
        `The association type ${association.type} isn't supported.`);
  }
}


function autoFixManyToOne(association, sourceName, destinationName) {
  if (association.injectedFieldInFrom && association.injectedFieldInTo) {
    console.warn(
      chalk.yellow(
        `Warning:  In the Many-to-One relationship from ${sourceName} to ${destinationName}, `
        + 'only unidirectionality is supported for a Many-to-One relationship, '
        + 'you should create a bidirectional One-to-Many relationship instead.'
        +'So I auto fix this by replacing this relation by the bidirectional One-to-Many.'));
    let tmpFrom = association.from;
    let tmpCommentInFrom = association.commentInFrom;
    let tmpInjectedFieldInFrom = association.injectedFieldInFrom;
    let tmpIsInjectedFieldInFromRequired = association.isInjectedFieldInFromRequired;
    association.from = association.to;
    association.injectedFieldInFrom = association.injectedFieldInTo;
    association.commentInFrom = association.commentInTo;
    association.isInjectedFieldInFromRequired = association.isInjectedFieldInToRequired;
    association.to = tmpFrom;
    association.commentInTo = tmpCommentInFrom;
    association.injectedFieldInTo = tmpInjectedFieldInFrom;
    association.isInjectedFieldInToRequired = tmpIsInjectedFieldInFromRequired;
    association.type = cardinalities.ONE_TO_MANY;
  }
}
