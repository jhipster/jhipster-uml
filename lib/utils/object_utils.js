'use strict';

module.exports = {
  merge: merge
};

/**
 * Merge two objects.
 * The order is important here: o1.merge(o2) means that the keys values of o2
 * will replace those identical to o1.
 * The keys that don't belong to the other object will be added.
 * @param object2 the object to be merged with.
 * @returns {Object} the object result of the merge
 */
function merge(object1, object2) {
  if (!object1 || Object.keys(object1).length === 0) {
    return object2;
  }
  if (!object2 || Object.keys(object2).length === 0) {
    return object1;
  }
  var merged = {};
  Object.keys(object1).forEach(function(key) {
    merged[key] = object1[key];
  });
  Object.keys(object2).forEach(function(key) {
    merged[key] = object2[key];
  });
  return merged;
}
