'use strict';

var Types = require('./types');

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
    throw new NoElementFoundException(
      "The passed type: '"
      + type
      + "' is not a supported supported types.");
  }
  return this.types[type];
};

function NoElementFoundException(message) {
  this.name = 'NoElementFoundException';
  this.message = (message || '');
}
NoElementFoundException.prototype = new Error();
