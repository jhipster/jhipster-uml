'use strict';

var Parser = require('./parser');

/**
 * The main abstract parser containing the fields needed by the concrete
 * subclasses.
 */
var AbstractParser = module.exports = function(root, databaseTypes) {
  this.root = root;
  this.databaseTypes = databaseTypes;

  // arrays used for the XML parsing
  this.rawTypesIndexes = [];
  this.rawEnumsIndexes = [];
  this.rawClassesIndexes = [];
  this.rawAssociationsIndexes = [];
  this.rawValidationRulesIndexes = [];

  // maps that store the parsed elements from the XML, ready to be exported
  this.types = {};
  this.enums = {};
  this.classes = {};
  this.fields = {};
  this.injectedFields = {};
  this.associations = {};

  // the use class's id holder
  this.userClassId = null;
};

// inheritance stuff
AbstractParser.prototype = Object.create(Parser.prototype);
AbstractParser.prototype.constructor = Parser;


AbstractParser.prototype.getUserClassId = function() {
  return this.userClassId;
};

AbstractParser.prototype.getTypes = function() {
  return this.types;
};

AbstractParser.prototype.getEnums = function() {
  return this.enums;
};

AbstractParser.prototype.getClasses = function() {
  return this.classes;
};

AbstractParser.prototype.getFields = function() {
  return this.fields;
};

AbstractParser.prototype.getInjectedFields = function() {
  return this.injectedFields;
};

AbstractParser.prototype.getAssociations = function() {
  return this.associations;
};
