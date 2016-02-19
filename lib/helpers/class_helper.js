'use strict';

var ClassData = require('../data/class_data'),
    NullPointerException = require('../exceptions/null_pointer_exception');

/**
 * Gets the class' names.
 * @param classes the classes
 * @returns {Array} an array containing all the class' names.
 * @throws {NullPointerException} if the passed object is nil.
 */
exports.getClassNames = function(classes) {
  if (!classes) {
    throw new NullPointerException('The classes object cannot be nil.');
  }
  return Object.keys(classes).map(function(classId) {
    return classes[classId].name;
  });
};
