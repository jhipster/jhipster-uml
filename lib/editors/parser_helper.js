'use strict';

var cardinalities = require('../cardinalities');

/**
 * Checks whether the passed name is an id.
 * @param {string} name the field's name.
 * @param {string} className the name of the class possessing the field.
 * @return {boolean} whether the field is an id.
 */
exports.isAnId = function(name, className) {
  var regex = new RegExp('^' + className.toLowerCase() + 'Id$');
  return name.length === 2 && /^id$/.test(name.toLowerCase()) || regex.test(name);
};

/**
 * Returns field's cardinality based on the association and the field's
 * attributes.
 * @param {Object} the field.
 * @return {string} the cardinality (one of ONE_TO_ONE, ONE_TO_MANY or
 *                  MANY_TO_MANY).
 */
exports.getCardinality = function(injectedField, associations) {
  if (this.isOneToOne(
      injectedField.isUpperValuePresent,
      associations[injectedField.association].isUpperValuePresent)) {
    return cardinalities.ONE_TO_ONE;
  } else if (this.isOneToMany(
      injectedField.isUpperValuePresent,
      associations[injectedField.association].isUpperValuePresent)) {
    return cardinalities.ONE_TO_MANY;
  } else if (this.isManyToMany(
      injectedField.isUpperValuePresent,
      associations[injectedField.association].isUpperValuePresent)) {
    return cardinalities.MANY_TO_MANY;
  }
  throw new NoCardinalityException(
    "The injected field '"
    + injectedField.name
    + "' does not belong to any valid association,"
    + 'because there is no cardinality. Exiting now.');
};

/**
 * Checks whether the relationship is a "one-to-one".
 * @param {boolean} injectedFieldUpperValuePresence if the UpperValue flag is
 *                                                  set in the injected field.
 * @param {boolean} associationUpperValuePresence if the UpperValue flag is
 *                                                set in the association.
 * @return {boolean} the result.
 */
exports.isOneToOne = function (injectedFieldUpperValuePresence, associationUpperValuePresence) {
  return !injectedFieldUpperValuePresence && !associationUpperValuePresence;
};

/**
 * Checks whether the relationship is a "one-to-many".
 * @param {boolean} injectedFieldUpperValuePresence if the UpperValue flag is
 *                                                  set in the injected field.
 * @param {boolean} associationUpperValuePresence if the UpperValue flag is
 *                                                set in the association.
 * @return {boolean} the result.
 */
exports.isOneToMany = function (injectedFieldUpperValuePresence, associationUpperValuePresence) {
  return (injectedFieldUpperValuePresence && !associationUpperValuePresence)
         || !injectedFieldUpperValuePresence && associationUpperValuePresence;
};

/**
 * Checks whether the relationship is a "many-to-many".
 * @param {boolean} injectedFieldUpperValuePresence if the UpperValue flag is
 *                                                  set in the injected field.
 * @param {boolean} associationUpperValuePresence if the UpperValue flag is
 *                                                set in the association.
 * @return {boolean} the result.
 */
exports.isManyToMany = function (injectedFieldUpperValuePresence, associationUpperValuePresence) {
  return injectedFieldUpperValuePresence && associationUpperValuePresence;
};

/**
 * Extracts a type's name from a URI (URL or path).
 * @param {string} uri the string containing the type.
 * @return {string} the type's name.
 */
exports.getTypeNameFromURL = function(uri) {
  return /\W([A-z]*)$/.exec(uri)[1];
};

function NoCardinalityException(message) {
  this.name = 'NoCardinalityException';
  this.message = (message || '');
}
NoCardinalityException.prototype = new Error();
