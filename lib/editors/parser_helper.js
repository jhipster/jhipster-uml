'use strict';

var _s = require('underscore.string');

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

/**
 * Extracts the entity name and the table name from the name parsed from
 * the XMI file.
 *
 * @param name the name from the XMI file.
 * @return {Object} the object containing the entity name and the table name.
 */
exports.extractClassName = function (name) {
  if (name.indexOf('(') === -1) {
    return { entityName: name, tableName: _s.underscored(name).toLowerCase() }
  }
  var split = name.split('(');
  return {
    entityName: split[0].trim(),
    tableName: _s.underscored(
      split[1].slice(0, split[1].length - 1).trim()
    ).toLowerCase()
  }
};
