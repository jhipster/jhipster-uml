'use strict';

/**
 * Modified Object equality method, taken from:
 * http://stackoverflow.com/questions/201183/how-to-determine-equality-for-two-javascript-objects?page=2&tab=votes#tab-top
 */
exports.equal = function (object1, object2) {
  if (object1.constructor !== object2.constructor
      || Object.keys(object1).length !== Object.keys(object2).length) {
    return false;
  }
  return areRelationshipsEqual(object1.relationships, object2.relationships)
          && areFieldsEqual(object1.fields, object2.fields);
}

function areRelationshipsEqual(relationships1, relationships2) {
  if (Object.keys(relationships1) !== Object.keys(relationships2)) {
    return false;
  }
  for (var relationship in relationships1) {
    if (relationships1[relationship] !== relationships2[relationship]) {
      return false;
    }
  }
  return true;
}

function areFieldsEqual(fields1, fields2) {
  if (Object.keys(fields1) !== Object.keys(fields2)) {
    return false;
  }
  for (var field in fields1) {
    if (fields1[field] !== fields2[field]) {
      return false;
    }
  }
  return true;
}
