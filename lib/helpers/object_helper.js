'use strict';

/**
 * Merge two objects.
 * The order is important here: o1.merge(o2) means that the keys values of o2
 * will replace those identical to o1.
 * The keys that don't belong to the other object will be added.
 * @param object2 the object to be merged with.
 * @returns {Object} the object result of the merge
 */
exports.merge = function(object1, object2) {
  var merged = {};
  Object.keys(object1).forEach(function(key) {
    merged[key] = object1[key];
  });
  Object.keys(object2).forEach(function(key) {
    merged[key] = object2[key];
  });
  return merged;
};

exports.areJHipsterEntitiesEqual = function(firstEntity, secondEntity) {
  if (firstEntity.fields.length !== secondEntity.fields.length
      || firstEntity.relationships.length !== secondEntity.relationships.length) {
    return false;
  }
  return areFieldsEqual(firstEntity.fields, secondEntity.fields)
    && areRelationshipsEqual(firstEntity.relationships, secondEntity.relationships);
};

function areFieldsEqual(firstFields, secondFields) {
  return firstFields.every(function(field, index) {
    if (Object.keys(field).length !== Object.keys(secondFields[index]).length) {
      return false;
    }
    var secondEntityField = secondFields[index];
    return Object.keys(field).every(function(key) {
      return field[key] === secondEntityField[key];
    });
  });
}

function areRelationshipsEqual(firstRelationships, secondRelationships) {
  return firstRelationships.every(function(relationship, index) {
    if (Object.keys(relationship).length !== Object.keys(secondRelationships[index]).length) {
      return false;
    }
    var secondEntityRelationship = secondRelationships[index];
    return Object.keys(relationship).every(function(key) {
      return relationship[key] === secondEntityRelationship[key];
    });
  });
}

