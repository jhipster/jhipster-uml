'use strict';

var MongoDBTypes = require('./mongodb_types'),
    CassandraTypes = require('./cassandra_types');

/**
 * Returns true if type is an instance of a NoSQL database type.
 * @param {type} the type to check.
 * @return {boolean} whether the passed type is of a NoSQL type.
 */
exports.isNoSQL = function(type) {
  return MongoDBTypes.prototype.isPrototypeOf(type)
    || CassandraTypes.prototype.isPrototypeOf(type);
};
