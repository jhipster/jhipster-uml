'use strict';

/**
 * Checks whether the passed name is an id.
 * @param {string} name the field's name.
 * @param {string} className the name of the class possessing the field.
 * @return {boolean} whether the field is an id.
 */
exports.isAnId = function(name, className) {
  var regex = new RegExp('^' + className.toLowerCase() + 'Id$');
  return name.length === 2 && /^id$/.test(name.toLowerCase())
    || regex.test(name) || /^id[A-Z].*/.test(name) || /.*?Id$/.test(name);
};

/**
 * Extracts a type's name from a URI (URL or path).
 * @param {string} uri the string containing the type.
 * @return {string} the type's name.
 */
exports.getTypeNameFromURL = function(uri) {
  return /\W([A-z]*)$/.exec(uri)[1];
};
