'use strict';

const ClassData = require('../data/class_data'),
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  getClassNames: getClassNames
};

/**
 * Gets the class' names.
 * @param classes the classes
 * @returns {Object} an object containing all the class' names by their id.
 * @throws {NullPointerException} if the passed object is nil.
 */
function getClassNames (classes) {
  if (!classes) {
    throw new buildException(
        exceptions.NullPointer, 'The classes object cannot be nil.');
  }
  var object = {};
  Object.keys(classes).forEach(function (classId) {
    object[classId] = classes[classId].name;
  });
  return object;
}
