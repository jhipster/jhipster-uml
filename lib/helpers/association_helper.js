'use strict';

var chalk = require('chalk'),
    AssociationData = require('../data/association_data'),
    AssociationException = require('../exceptions/association_exception'),
    cardinalities = require('../cardinalities');

/**
 * Checks the validity of the association.
 * @param association the association to check.
 * @throws AssociationException if the association is invalid.
 */
exports.checkValidityOfAssociation = function(association) {
  switch (association.type) {
    case cardinalities.ONE_TO_ONE:
      if (!association.injectedFieldInFrom) {
        throw new AssociationException(
          'The source entity must possess the destination in a One-to-One '
          + ' relationship, or you must invert the direction of the relationship.');
      }
      return;
    case cardinalities.ONE_TO_MANY:
      if (!association.injectedFieldInFrom || !association.injectedFieldInTo) {
        console.warn(
          chalk.yellow(
            'Only bidirectionality is supported for a One-to-Many association. '
            + 'The other side will be automatically added.'));
      }
      return;
    case cardinalities.MANY_TO_ONE:
      if (association.injectedFieldInFrom && association.injectedFieldInTo) {
        throw new AssociationException(
          'Only unidirectionality is supported for a Many-to-One relationship, '
          + 'you should create a bidirectional One-to-Many relationship instead.');
      }
      return;
    case cardinalities.MANY_TO_MANY:
      if (!association.injectedFieldInFrom || !association.injectedFieldInTo) {
        throw new AssociationException(
          'Only bidirectionality is supported for a Many-to-Many relationship.');
      }
      return;
    default:
  }
};
