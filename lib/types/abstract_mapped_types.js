'use strict';

var Types = require('./types'),
    WrongDatabaseTypeException = require('../exceptions/wrong_database_type_exception');

var AbstractMappedTypes = module.exports = function() {};

// inheritance stuff
AbstractMappedTypes.prototype = Object.create(Types.prototype);
AbstractMappedTypes.prototype.constructor = Types;

/**
 * Method implementation from Type.
 */
AbstractMappedTypes.prototype.getTypes = function() {
  return Object.keys(this.types);
};

/**
 * Method implementation from Type.
 */
AbstractMappedTypes.prototype.getValidationsForType = function(type) {
  if (!this.contains(type)) {
    throw new WrongDatabaseTypeException(
      "The passed type: '"
      + type
      + "' is not a supported type.");
  }
  return this.types[type];
};
