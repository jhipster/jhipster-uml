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

ParsedData.prototype.getType = function(id) {
  return this.types[id];
};

ParsedData.prototype.getClass = function(id) {
  return this.classes[id];
};

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

ParsedData.prototype.getEnum = function(id) {
  return this.enums[id];
};

ParsedData.prototype.addFieldToClass = function(classId, field) {
  this.classes[classId].addField(field);
};

ParsedData.prototype.addInjectedFieldToClass = function(classId, injectedField) {
  this.classes[classId].addInjectedField(injectedField);
};

ParsedData.prototype.addValidationToField = function(id, name, value) {
  this.fields[id].addValidation(name, value);
};