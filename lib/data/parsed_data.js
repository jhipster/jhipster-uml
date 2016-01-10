'use strict';

var ClassData = require('./class_data'),
    FieldData = require('./field_data'),
    TypeData = require('./type_data'),
    EnumData = require('./enum_data'),
    InjectedFieldData = require('./injected_field_data'),
    AssociationData = require('./association_data'),
    ValidationData = require('./validation_data');

/**
 * The parsed data class holds the various information taken from the UML file.
 */
var ParsedData = module.exports = function() {
  this.classes = {};
  this.fields = {};
  this.injectedFields = {};
  this.associations = {};
  this.types = {};
  this.enums = {};
  this.validations = {};

  this.userClassId = null;
};

/**
 * Adds a new class.
 * @param id its id.
 * @param data the class data.
 */
ParsedData.prototype.addClass = function(id, data) {
  this.classes[id] = new ClassData(data);
};

/**
 * Adds a new field.
 * @param classId the class' id.
 * @param fieldId its id.
 * @param data the field data.
 */
ParsedData.prototype.addField = function(classId, fieldId, data) {
  this.fields[fieldId] = new FieldData(data);
  this.classes[classId].addField(fieldId);
};

/**
 * Adds a validation to a field.
 * @param fieldId the field's id.
 * @param validationId the validation's id.
 * @param data the validation data.
 */
ParsedData.prototype.addValidationToField = function(fieldId, validationId, data) {
  this.validations[validationId] = new ValidationData(data);
  this.fields[fieldId].addValidation(validationId);
};

/**
 * Adds a new association.
 * @param id its id.
 * @param data the association data.
 */
ParsedData.prototype.addAssociation = function(id, data) {
  this.associations[id] = new AssociationData(data);
};

/**
 * Adds a new injected field.
 * @param id its id.
 * @param data the field data.
 */
ParsedData.prototype.addInjectedField = function(id, data) {
  this.injectedFields[id] = new InjectedFieldData(data);
};

/**
 * Adds a new type.
 * @param id its id.
 * @param data the type data.
 */
ParsedData.prototype.addType = function(id, data) {
  this.types[id] = new TypeData(data);
};

/**
 * Adds a new enum.
 * @param id its id.
 * @param data the enum data.
 */
ParsedData.prototype.addEnum = function(id, data) {
  this.enums[id] = new EnumData(data);
};

/**
 * Gets a type by its id.
 * @param id the id.
 * @returns {TypeData} the type.
 */
ParsedData.prototype.getType = function(id) {
  return this.types[id];
};

/**
 * Gets a class by its id.
 * @param id the id.
 * @returns {ClassData} the class.
 */
ParsedData.prototype.getClass = function(id) {
  return this.classes[id];
};

/**
 * Gets a field by its id.
 * @param id the id.
 * @returns {FieldData} the field.
 */
ParsedData.prototype.getField = function(id) {
  return this.fields[id];
};

/**
 * Gets an injected field by its id.
 * @param id the id.
 * @returns {InjectedFieldData} the injected field.
 */
ParsedData.prototype.getInjectedField = function(id) {
  return this.injectedFields[id];
};

/**
 * Gets an association by its id.
 * @param id the id.
 * @return {AssociationData} the association.
 */
ParsedData.prototype.getAssociation = function(id) {
  return this.associations[id];
};

/**
 * Gets an enum by its id.
 * @param id the id.
 * @returns {EnumData} the enumeration.
 */
ParsedData.prototype.getEnum = function(id) {
  return this.enums[id];
};

/**
 * Adds a field to a class.
 * @param classId the class' id.
 * @param field the field to add.
 */
//ParsedData.prototype.addFieldToClass = function(classId, field) {
//  this.fields
//  this.classes[classId].addField(field);
//};

/**
 * Adds an injected field to a class.
 * @param classId the class' id.
 * @param injectedField the field to add.
 */
ParsedData.prototype.addInjectedFieldToClass = function(classId, injectedField) {
  this.classes[classId].addInjectedField(injectedField);
};
