'use strict';

module.exports = {
  areJHipsterEntitiesEqual: areJHipsterEntitiesEqual
};

function areJHipsterEntitiesEqual(firstEntity, secondEntity) {
  if (firstEntity.fields.length !== secondEntity.fields.length
      || firstEntity.relationships.length !== secondEntity.relationships.length) {
    return false;
  }
  return areFieldsEqual(firstEntity.fields, secondEntity.fields)
    && areRelationshipsEqual(firstEntity.relationships, secondEntity.relationships);
}

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
