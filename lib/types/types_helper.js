'use strict';

const SQLTypes = require('./sql_types');

module.exports = {
  isNoSQL: isNoSQL
};

/**
 * Returns true if type is an instance of a NoSQL database type.
 * @param {type} the type to check.
 * @return {boolean} whether the passed type is of a NoSQL type.
 */
function isNoSQL(type) {
  return !SQLTypes.prototype.isPrototypeOf(type);
}
