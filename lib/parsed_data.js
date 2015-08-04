'use strict';

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
 * @param newClass the class.
 */
ParsedData.prototype.addClass = function(id, newClass) {
  this.classes[id] = newClass;
};

/**
 * Adds a new field.
 * @param id its id.
 * @param newField the field.
 */
ParsedData.prototype.addField = function(id, newField) {
  this.fields[id] = newField;
};

/**
 * Adds a new association.
 * @param id its id.
 * @param newAssociation the association.
 */
ParsedData.prototype.addAssociation = function(id, newAssociation) {
  this.associations[id] = newAssociation;
};

/**
 * Adds a new injected field.
 * @param id its id.
 * @param newInjectedField the field.
 */
ParsedData.prototype.addInjectedField = function(id, newInjectedField) {
  this.injectedFields[id] = newInjectedField;
};

/**
 * Adds a new type.
 * @param id its id.
 * @param newType the type.
 */
ParsedData.prototype.addType = function(id, newType) {
  this.types[id] = newType;
};

/**
 * Adds a new enum.
 * @param id its id.
 * @param newEnum the enum.
 */
ParsedData.prototype.addEnum = function(id, newEnum) {
  this.enums[id] = newEnum;
};

/**
 * Gets the user class' id.
 * @return {Object} the id.
 */
ParsedData.prototype.getUserClassId = function() {
  return this.userClassId;
};

/**
 * Sets the user class' id.
 * @param id the id.
 */
ParsedData.prototype.setUserClassId = function(id) {
  this.userClassId = id;
};

/**
 * Gets the types.
 * @return {Object} the types.
 */
ParsedData.prototype.getTypes = function() {
  return this.types;
};

/**
 * Gets the enums.
 * @return {Object} the enums.
 */
ParsedData.prototype.getEnums = function() {
  return this.enums;
};

/**
 * Gets the classes.
 * @return {Object} the classes.
 */
ParsedData.prototype.getClasses = function() {
  return this.classes;
};

/**
 * Gets the (regular) fields.
 * @return {Object} the (regular) fields.
 */
ParsedData.prototype.getFields = function() {
  return this.fields;
};

/**
 * Gets the injected fields.
 * @return {Object} the injected fields.
 */
ParsedData.prototype.getInjectedFields = function() {
  return this.injectedFields;
};

/**
 * Gets the associations.
 * @return {Object} the associations.
 */
ParsedData.prototype.getAssociations = function() {
  return this.associations;
};
