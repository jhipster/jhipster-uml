'use strict';

/**
 * Checks whether the passed name is an id.
 * @param {string} name the field's name.
 * @return {boolean} whether the field is an id.
 */
exports.isAnId = function(name) {
  return /^id$/.test(name.toLowerCase());
};

/**
 * Extracts a type's name from a URI (URL or path).
 * @param {string} uri the string containing the type.
 * @return {string} the type's name.
 */
exports.getTypeNameFromURL = function(uri) {
  return /\W([A-z]*)$/.exec(uri)[1];
};
