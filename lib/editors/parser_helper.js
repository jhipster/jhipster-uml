'use strict';

const _ = require('lodash');

module.exports = {
  isAnId: isAnId,
  getTypeNameFromURL: getTypeNameFromURL,
  extractClassName: extractClassName
};



/**
 * Checks whether the passed name is an id.
 * @param {string} name the field's name.
 * @return {boolean} whether the field is an id.
 */
function isAnId(name) {
  return /^id$/.test(name.toLowerCase());
}

/**
 * Extracts a type's name from a URI (URL or path).
 * @param {string} uri the string containing the type.
 * @return {string} the type's name.
 */
function getTypeNameFromURL(uri) {
  return /\W([A-z]*)$/.exec(uri)[1];
}

/**
 * Extracts the entity name and the table name from the name parsed from
 * the XMI file.
 *
 * @param name the name from the XMI file.
 * @return {Object} the object containing the entity name and the table name.
 */
function extractClassName(name) {
  if (name.indexOf('(') === -1) {
    return { entityName: name, tableName: _.snakeCase(name).toLowerCase() };
  }
  var split = name.split('(');
  return {
    entityName: split[0].trim(),
    tableName: _.snakeCase(
      split[1].slice(0, split[1].length - 1).trim()
    ).toLowerCase()
  };
}
