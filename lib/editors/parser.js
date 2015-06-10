'use strict';

var base = require('selfish').Base; // for inheritance

/**
 * The main parser interface every abstract parser should implement.
 * Defines the various base methods to implements.
 */
var Parser = base.extend({

  parse: function() {
    this.findElements();
    this.fillTypes();
    this.fillAssociations();
    this.fillClassesAndFields();
    this.fillConstraints();
  },

  /**
   * Parses the document from the root, and gathers the index of each relevent
   * element in the document(classes, types, associations, etc.).
   */
  findElements: function() {
    this.findTypes();
    this.findClasses();
    this.findAssociations();
    this.findConstraints();
  },

  /**
   * Finds the types.
   */
  findTypes: function() {
    throw new UnimplementedOperationException(
      'This method must be implemented by a subclass to be called.');
  },

  /**
   * Finds the classes.
   */
  findClasses: function() {
    throw new UnimplementedOperationException(
      'This method must be implemented by a subclass to be called.');
  },

  /**
   * Finds the associations.
   */
  findAssociations: function() {
    throw new UnimplementedOperationException(
      'This method must be implemented by a subclass to be called.');
  },

  /**
   * Finds the constraints.
   */
  findConstraints: function() {
    throw new UnimplementedOperationException(
      'This method must be implemented by a subclass to be called.');
  },

  /**
   * Fills the types with type names.
   * @throws InvalidTypeException if the type isn't supported by JHipster.
   */
  fillTypes: function() {
    throw new UnimplementedOperationException(
      'This method must be implemented by a subclass to be called.');
  },

  /**
   * Fills the associations with the extracted associations from the document.
   */
  fillAssociations: function() {
    throw new UnimplementedOperationException(
      'This method must be implemented by a subclass to be called.');
  },

  /**
   * Fills the classes and the fields that compose them.
   * @throws NullPointerException if a class' name, or an attribute, is nil.
   */
  fillClassesAndFields: function() {
    throw new UnimplementedOperationException(
      'This method must be implemented by a subclass to be called.');
  },

  /**
   * Fills the existing fields with the present validations.
   * @throws NoValidationNameException if no validation name exists for the 
   *                                   validation value (1 for no minlength for
   *                                   instance).
   * @throws WrongValidationException if JHipster doesn't support the validation.
   */
  fillConstraints: function() {
    throw new UnimplementedOperationException(
      'This method must be implemented by a subclass to be called.');
  },

  /**
   * Gets the user class' id.
   * @return {Object} the id.
   */
  getUserClassId: function() {
    throw new UnimplementedOperationException(
      'This method must be implemented by a subclass to be called.');
  },

  /**
   * Gets the types.
   * @return {Object} the types.
   */
  getTypes: function() {
    throw new UnimplementedOperationException(
      'This method must be implemented by a subclass to be called.');
  },

  /**
   * Gets the classes.
   * @return {Object} the classes.
   */
  getClasses: function() {
    throw new UnimplementedOperationException(
      'This method must be implemented by a subclass to be called.');
  },

  /**
   * Gets the (regular) fields.
   * @return {Object} the (regular) fields.
   */
  getFields: function() {
    throw new UnimplementedOperationException(
      'This method must be implemented by a subclass to be called.');
  },

  /**
   * Gets the injected fields.
   * @return {Object} the injected fields.
   */
  getInjectedFields: function() {
    throw new UnimplementedOperationException(
      'This method must be implemented by a subclass to be called.');
  },

  /**
   * Gets the associations.
   * @return {Object} the associations.
   */
  getAssociations: function() {
    throw new UnimplementedOperationException(
      'This method must be implemented by a subclass to be called.');
  }
});

/**
 * The main abstract parser containing the fields needed by the concrete
  * subclasses.
 */
exports.AbstractParser = Parser.extend({

  /**
   * Super constructor.
   */
  initialize: function(root, databaseTypes) { 
    this.root = root;
    this.databaseTypes = databaseTypes;

    // arrays used for the XML parsing
    this.rawTypesIndexes = [];
    this.rawClassesIndexes = [];
    this.rawAssociationsIndexes = [];
    this.rawValidationRulesIndexes = [];

    // maps that store the parsed elements from the XML, ready to be exported
    this.types = {};
    this.classes = {};
    this.fields = {};
    this.injectedFields = {};
    this.associations = {};

    // the use class's id holder
    this.userClassId = null;
  },

  getUserClassId: function() {
    return this.userClassId;
  },

  getTypes: function() {
    return this.types;
  },

  getClasses: function() {
    return this.classes;
  },

  getFields: function() {
    return this.fields;
  },

  getInjectedFields: function() {
    return this.injectedFields;
  },

  getAssociations: function() {
    return this.associations;
  }
});

// exception definitions 
function UnimplementedOperationException(message) {
  this.name = 'UnimplementedOperationException';
  this.message = (message || '');
}
UnimplementedOperationException.prototype = new Error();
