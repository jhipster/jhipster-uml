'use strict';

var Parser = require('./parser'),
    ParsedData = require('../data/parsed_data');

/**
 * The main abstract parser containing the fields needed by the concrete
 * subclasses.
 */
var AbstractParser = module.exports = function(root, databaseTypes) {
  this.root = root;
  this.databaseTypes = databaseTypes;

  // arrays used for the XML parsing, not to be shared
  this.rawTypesIndexes = [];
  this.rawEnumsIndexes = [];
  this.rawClassesIndexes = [];
  this.rawAssociationsIndexes = [];
  this.rawValidationRulesIndexes = [];

  this.parsedData = new ParsedData();
};

// inheritance stuff
AbstractParser.prototype = Object.create(Parser.prototype);
AbstractParser.prototype.constructor = Parser;
