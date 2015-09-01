'use strict';

var ClassData = require('./class_data'),
    FieldData = require('./field_data'),
    TypeData = require('./type_data'),
    EnumData = require('./enum_data'),
    InjectedFieldData = require('./injected_field_data'),
    AssociationData = require('./association_data');

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
 * @param id its id.
 * @param data the field data.
 */
ParsedData.prototype.addField = function(id, data) {
  this.fields[id] = new FieldData(data);
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
ParsedData.prototype.addFieldToClass = function(classId, field) {
  this.classes[classId].addField(field);
};

/**
 * Adds an injected field to a class.
 * @param classId the class' id.
 * @param injectedField the field to add.
 */
ParsedData.prototype.addInjectedFieldToClass = function(classId, injectedField) {
  this.classes[classId].addInjectedField(injectedField);
};

/**
 * Adds a validation to a field.
 * @param fieldId the field's id.
 * @param name the validation's name.
 * @param value the validation's value.
 */
ParsedData.prototype.addValidationToField = function(fieldId, name, value) {
  this.fields[fieldId].addValidation(name, value);
};
