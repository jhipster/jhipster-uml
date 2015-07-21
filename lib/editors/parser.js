'use strict';

/**
 * The main parser interface every abstract parser should implement.
 * Defines the various base methods to implements.
 */
var Parser = module.exports = function() {};

/**
 * Parses a document.
 */
Parser.prototype.parse = function() {
  this.findElements();
  this.fillTypes();
  this.fillAssociations();
  this.fillClassesAndFields();
  this.fillConstraints();
};

/**
 * Parses the document from the root, and gathers the index of each relevant
 * element in the document (classes, types, associations, etc.).
 */
Parser.prototype.findElements = function() {
  this.findTypes();
  this.findClasses();
  this.findAssociations();
  this.findConstraints();
};

/**
 * Finds the types.
 */
Parser.prototype.findTypes = function() {
  throw new UnimplementedOperationException(
    'This method must be implemented by a subclass to be called.');
};

/**
 * Finds the classes.
 */
Parser.prototype.findClasses = function() {
  throw new UnimplementedOperationException(
    'This method must be implemented by a subclass to be called.');
};

/**
 * Finds the associations.
 */
Parser.prototype.findAssociations = function() {
  throw new UnimplementedOperationException(
    'This method must be implemented by a subclass to be called.');
};

/**
 * Finds the constraints.
 */
Parser.prototype.findConstraints = function() {
  throw new UnimplementedOperationException(
    'This method must be implemented by a subclass to be called.');
};

/**
 * Fills the types with type names.
 * @throws InvalidTypeException if the type isn't supported by JHipster.
 */
Parser.prototype.fillTypes = function() {
  throw new UnimplementedOperationException(
    'This method must be implemented by a subclass to be called.');
};

/**
 * Fills the enums with their names and values.
 */
Parser.prototype.fillEnums = function() {
  throw new UnimplementedOperationException(
    'This method must be implemented by a subclass to be called.');
};

/**
 * Fills the associations with the extracted associations from the document.
 */
Parser.prototype.fillAssociations = function() {
  throw new UnimplementedOperationException(
    'This method must be implemented by a subclass to be called.');
};

/**
 * Fills the classes and the fields that compose them.
 * @throws NullPointerException if a class' name, or an attribute, is nil.
 */
Parser.prototype.fillClassesAndFields = function() {
  throw new UnimplementedOperationException(
    'This method must be implemented by a subclass to be called.');
};

/**
 * Fills the existing fields with the present validations.
 * @throws NoValidationNameException if no validation name exists for the
 *                                   validation value (1 for no minlength for
 *                                   instance).
 * @throws WrongValidationException if JHipster doesn't support the validation.
 */
Parser.prototype.fillConstraints = function() {
  throw new UnimplementedOperationException(
    'This method must be implemented by a subclass to be called.');
};


/**
 * Gets the user class' id.
 * @return {Object} the id.
 */
Parser.prototype.getUserClassId = function() {
  throw new UnimplementedOperationException(
    'This method must be implemented by a subclass to be called.');
};

/**
 * Gets the types.
 * @return {Object} the types.
 */
Parser.prototype.getTypes = function() {
  throw new UnimplementedOperationException(
    'This method must be implemented by a subclass to be called.');
};

/**
 * Gets the enums.
 * @return {Object} the enums.
 */
Parser.prototype.getEnums = function() {
  throw new UnimplementedOperationException(
    'This method must be implemented by a subclass to be called.');
};

/**
 * Gets the classes.
 * @return {Object} the classes.
 */
Parser.prototype.getClasses = function() {
  throw new UnimplementedOperationException(
    'This method must be implemented by a subclass to be called.');
};

/**
 * Gets the (regular) fields.
 * @return {Object} the (regular) fields.
 */
Parser.prototype.getFields = function() {
  throw new UnimplementedOperationException(
    'This method must be implemented by a subclass to be called.');
};

/**
 * Gets the injected fields.
 * @return {Object} the injected fields.
 */
Parser.prototype.getInjectedFields = function() {
  throw new UnimplementedOperationException(
    'This method must be implemented by a subclass to be called.');
};

/**
 * Gets the associations.
 * @return {Object} the associations.
 */
Parser.prototype.getAssociations = function() {
  throw new UnimplementedOperationException(
    'This method must be implemented by a subclass to be called.');
};

// exception definitions
function UnimplementedOperationException(message) {
  this.name = 'UnimplementedOperationException';
  this.message = (message || '');
}
UnimplementedOperationException.prototype = new Error();
