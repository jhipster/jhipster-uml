'use strict';

var ClassData = require('../data/class_data'),
    NullPointerException = require('../exceptions/null_pointer_exception');

/**
 * Gets the class' names.
 * @param classes the classes
 * @returns {Object} an object containing all the class' names by their id.
 * @throws {NullPointerException} if the passed object is nil.
 */
exports.getClassNames = function(classes) {
  if (!classes) {
    throw new NullPointerException('The classes object cannot be nil.');
  }
  var object = {};
  Object.keys(classes).forEach(function(classId) {
    object[classId] = classes[classId].name;
  });
  return object;
};
