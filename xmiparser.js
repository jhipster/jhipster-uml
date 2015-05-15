'use strict';

var xml2js = require('xml2js'), // for reading and parsing the XMI
    chalk = require('chalk'),
    fs = require('fs'),
    _s = require('underscore.string'),
    types = require('./types');

// constants used throughout the script
var ONE_TO_ONE = 'one-to-one';
var ONE_TO_MANY = 'one-to-many';
var MANY_TO_ONE = 'many-to-one';
var MANY_TO_MANY = 'many-to-many';

/**
 * This class parses a XMI document.
 * @param {string} file the input file's name.
 * @databaseTypeName {string} the database type's name.
 */
var XMIParser = module.exports = function XMIParser(file, databaseTypeName) {
  this.root = getRootElement(readFileContent(file));
  this.types = initDatabaseTypeHolder(databaseTypeName);

  // arrays used for the XML parsing
  this.rawPrimitiveTypesIndexes = [];
  this.rawClassesIndexes = [];
  this.rawAssociationsIndexes = [];
  this.rawValidationRulesIndexes = [];

  // maps that store the parsed elements from the XML, ready to be exported
  this.primitiveTypes = {};
  this.classes = {};
  this.fields = {};
  this.injectedFields = {};
  this.associations = {};
}

/**
 * Gets the primitive types.
 * @return {Object} the primitive types.
 */
XMIParser.prototype.getPrimitiveTypes = function() {
  return this.primitiveTypes;
};

/**
 * Gets the classes.
 * @return {Object} the classes.
 */
XMIParser.prototype.getClasses = function() {
  return this.classes;
};

/**
 * Gets the (regular) fields.
 * @return {Object} the (regular) fields.
 */
XMIParser.prototype.getFields = function() {
  return this.fields;
};

/**
 * Gets the injected fields.
 * @return {Object} the injected fields.
 */
XMIParser.prototype.getInjectedFields = function() {
  return this.injectedFields;
};

/**
 * Gets the associations.
 * @return {Object} the associations.
 */
XMIParser.prototype.getAssociations = function() {
  return this.associations;
};

/**
 * Parses the XMI document.
 */
XMIParser.prototype.parse = function() {
  this.findElements();
  this.fillPrimitiveTypes();
  this.fillAssociations();
  this.fillClassesAndFields();
  this.fillValidationRules();
};

/**
 * Parses the document from the root, and gathers the index of each relevent
 * element in the document(classes, types, associations, etc.).
 */
XMIParser.prototype.findElements = function() {
  this.findRawPackagedElements();
  this.findRawOwnedRules();
};

/**
 * Gets the elements named 'PackagedElement' in order to gather the ids of
 * classes, types and associations.
 */
XMIParser.prototype.findRawPackagedElements = function() {
  for (var i = 0, n = this.root.packagedElement.length; i < n; i++) {
    switch (this.root.packagedElement[i].$['xmi:type']) {
      case 'uml:PrimitiveType':
        this.rawPrimitiveTypesIndexes.push(i);
        break;
      case 'uml:Class':
        this.rawClassesIndexes.push(i);
        break;
      case 'uml:Association':
        this.rawAssociationsIndexes.push(i);
        break;
      default:
    }
  }
};

/**
 * Gets the elements named 'OwnedRule' in order to gather the validation ids.
 */
XMIParser.prototype.findRawOwnedRules = function() {
  if (!this.root.ownedRule) {
    return;
  }
  for (var i = 0, n = this.root.ownedRule.length; i < n; i++) {
    switch (this.root.ownedRule[i].$['xmi:type']) {
      case 'uml:Constraint':
        this.rawValidationRulesIndexes.push(i);
        break;
      default:
    }
  }
};

/**
 * Fills the primitiveTypes map with type names.
 * @throws InvalidTypeException if the type isn't supported by JHipster.
 */
XMIParser.prototype.fillPrimitiveTypes = function() {
  for (var i = 0; i < this.rawPrimitiveTypesIndexes.length; i++) {
    var element = this.root.packagedElement[this.rawPrimitiveTypesIndexes[i]];
    var typeName = _s.capitalize(element.$['name']);
    if (!this.types.contains(typeName)) {
      throw new InvalidTypeException(
        "The type '"
        + typeName
        + "' isn't supported by JHipster, exiting now.");
    }
    this.primitiveTypes[element.$['xmi:id']] = typeName;
  }
};

/**
 * Fills the association map with the extracted associations from the document.
 */
XMIParser.prototype.fillAssociations = function() {
  for (var i = 0; i < this.rawAssociationsIndexes.length; i++) {
    var element = this.root.packagedElement[this.rawAssociationsIndexes[i]];
    var name = (element['ownedEnd'] != null) 
                 ? element['ownedEnd'][0].$['name'] 
                 : '';
    var type = (element['ownedEnd'] != null) 
                 ? element['ownedEnd'][0].$['type'] 
                 : '';

    this.associations[element.$['xmi:id']] = {
      isUpperValuePresent: element['ownedEnd'] != null 
                            && element['ownedEnd'][0]['upperValue'] != null,
      name: name,
      type: type
    }
  }
}

/**
 * Fills the classes and the fields that compose them.
 */
XMIParser.prototype.fillClassesAndFields = function() {
  for (var i = 0; i < this.rawClassesIndexes.length; i++) {
    var element = this.root.packagedElement[this.rawClassesIndexes[i]];
    this.addClass(element);   

    for (var j = 0; j < element.ownedAttribute.length; j++) {
      if (!this.isAnId(
          element.ownedAttribute[j].$['name'],
          element.$['name'])) {
        this.addField(element.ownedAttribute[j], element.$['xmi:id']);
      }
    }
  }
}

/**
 * Adds a new class in the class map.
 * @param {Object} element the class to add.
 */
XMIParser.prototype.addClass = function(element) {
  this.classes[element.$['xmi:id']] = {
    name: element.$['name'],
    fields: [],
    injectedFields: []
  }
}

/**
 * Adds a new field to the field map.
 * @param {Object} element the field to add.
 * @param {string} classId the encapsulating class' id.
 */
XMIParser.prototype.addField = function(element, classId) {
  if (element.$['association']) {
    this.addInjectedField(element, classId);
  } else {
    this.addRegularField(element, classId);
  }
}

/**
 * Adds a (regular, not injected) field to the field map.
 * @param {Object} element the new field to add.
 */
XMIParser.prototype.addRegularField = function(element, classId) {
  this.fields[element.$['xmi:id']] = {
    name: element.$['name'],
    validations: {}
  }
  if (element.$['type'] != null) {
    this.fields[element.$['xmi:id']]['type'] = element.$['type'];
  } else {
    if (!element['type']) { // this field doesn't possess any type at all
      throw new NoTypeException(
        "The field '" 
        + element.$['name'] 
        + "' does not possess any type, exiting now.");
    }
    var typeName = this.getTypeName(element['type'][0].$['href']);
    this.fields[element.$['xmi:id']]['type'] = typeName;
    this.primitiveTypes[typeName] = typeName;
  }
  this.classes[classId].fields.push(element.$['xmi:id']);
}

/**
 * Adds an injected field to the corresponding map.
 * @param {Object} element the field to add.
 * @param {string} classId the id of the class containing this field.
 */
XMIParser.prototype.addInjectedField = function(element, classId) {
  this.injectedFields[element.$['xmi:id']] = {
    name: element.$['name'],
    type: element.$['type'],
    association: element.$['association'],
    'class': classId,
    isUpperValuePresent: false
  }
  if (element['upperValue'] != null 
      && element['upperValue'][0].$['value'] != null) {
    this.injectedFields[element.$['xmi:id']]['isUpperValuePresent'] =
      element['upperValue'][0].$['value'] == '*';
  }

  this.injectedFields[element.$['xmi:id']]['cardinality'] =
    this.getCardinality(this.injectedFields[element.$['xmi:id']]);
  this.classes[classId].injectedFields.push(element.$['xmi:id']);
}

/**
 * Fills the existing fields with the present validations 
 * (no iteration is performed over the fields).
 * @throws NoValidationNameForValueException if no validation name exists for
 *                                           the validation value (1 for no
 *                                           minlength for instance).
 * @throws WrongValidationException if JHipster doesn't support the validation.
 */
XMIParser.prototype.fillValidationRules = function() {
  for (var i = 0; i < this.rawValidationRulesIndexes.length; i++) {
    var element = this.root.ownedRule[this.rawValidationRulesIndexes[i]];

    var name = element.$['name'];
    var value = element['specification'][0].$['value']; // not nil, but ''

    var previousValidations = {};
    if (this.fields[element.$['constrainedElement']] != null) {
      previousValidations = 
        this.fields[element.$['constrainedElement']]['validations'];
    }

    if (!name && value) {
      throw new NoValidationNameForValueException(
        "The validation value '"
        + value
        + "' does not belong to any validation.");
    } else if (!name && !value) {
      continue;
    }

    if (!this.types.isValidationSupportedForType(
        this.primitiveTypes[
          this.fields[element.$['constrainedElement']].type], name)) {
      throw new WrongValidationException(
        "The validation '"
        + name
        + "' isn't supported for the type '"
        + this.primitiveTypes[this.fields[element.$['constrainedElement']].type]
        + "', exiting now.");
    }
    previousValidations[name] = value;
    this.fields[element.$['constrainedElement']]['validations'] = 
      previousValidations;
  }
}

/**
 * Checks whether the passed name is an id.
 * @param {string} name the field's name.
 * @param {string} className the name of the class possessing the field.
 * @return {boolean} whether the field is an id.
 */
XMIParser.prototype.isAnId = function(name, className) {
  var regex = new RegExp('^' + className.toLowerCase() + 'Id$');
  return name.length == 2 
    && /^id$/.test(name.toLowerCase()) || regex.test(name);
}

/**
 * Returns field's cardinality based on the association and the field's
 * attributes.
 * @param {Object} the field.
 * @return {string} the cardinality (one of ONE_TO_ONE, ONE_TO_MANY or
 *                  MANY_TO_MANY).
 * @throws NoCardinalityException if the relationship doesn't have any
 *                                cardinality (it shouldn't happen).
 */
XMIParser.prototype.getCardinality = function(injectedField) {
  if (this.isOneToOne( 
      injectedField.isUpperValuePresent, 
      this.associations[injectedField.association].isUpperValuePresent)) {
    return ONE_TO_ONE;
  } else if (this.isOneToMany(
      injectedField.isUpperValuePresent,
      this.associations[injectedField.association].isUpperValuePresent)) {
    return ONE_TO_MANY;
  } else if (this.isManyToMany(
      injectedField.isUpperValuePresent,
      this.associations[injectedField.association].isUpperValuePresent)) {
    return MANY_TO_MANY;
  }
  throw new NoCardinalityException(
    "The injected field '" 
    + injectedField.name
    + "' does not belong to any valid association,"
    + 'because there is no cardinality. Exiting now.');
}

/**
 * Checks whether the relationship is a "one-to-one".
 * @param {boolean} injectedFieldUpperValuePresence if the UpperValue flag is 
 *                                                  set in the injected field. 
 * @param {boolean} associationUpperValuePresence if the UpperValue flag is set
 *                                                set in the association.
 * @return {boolean} the result.
 */
XMIParser.prototype.isOneToOne = function(
    injectedFieldUpperValuePresence,
    associationUpperValuePresence) {
  return !injectedFieldUpperValuePresence && !associationUpperValuePresence;
}

/**
 * Checks whether the relationship is a "one-to-many".
 * @param {boolean} injectedFieldUpperValuePresence if the UpperValue flag is
 *                                                  set in the injected field.
 * @param {boolean} associationUpperValuePresence if the UpperValue flag is set
 *                                                in the association.
 * @return {boolean} the result.
 */
XMIParser.prototype.isOneToMany = function(
    injectedFieldUpperValuePresence, associationUpperValuePresence) {
  return (injectedFieldUpperValuePresence && !associationUpperValuePresence)
         || !injectedFieldUpperValuePresence && associationUpperValuePresence;
}

/**
 * Checks whether the relationship is a "many-to-many".
 * @param {boolean} injectedFieldUpperValuePresence if the UpperValue flag is
 *                                                  set in the injected field.
 * @param {boolean} associationUpperValuePresence if the UpperValue flag is set
 *                                                in the association.
 * @return {boolean} the result.
 */
XMIParser.prototype.isManyToMany = function(
    injectedFieldUpperValuePresence, associationUpperValuePresence) {
  return injectedFieldUpperValuePresence && associationUpperValuePresence;
}

/**
 * Extracts a type's name from a URI (URL or path).
 * @param {string} uri the string containing the type.
 * @return {string} the type's name.
 */
XMIParser.prototype.getTypeName = function(uri) {
  return /\W([A-z]*)$/.exec(uri)[1];
}

// internal functions definitions

/**
 * Reads the passed file's content, and returns it.
 * @param {string} file the name of the file to read.
 * @return {string} the file's content.
 * @throws WrongPassedArgumentException if the passed file doesn't exist, or is
 *                                      a directory.
 */
function readFileContent(file) {
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    throw new WrongPassedArgumentException(
      "The passed file '"
      + file
      + "' must exist and must not be a directory, exiting now.'");
  }
  return fs.readFileSync(file, 'utf-8');
}

/**
 * Gets the root element of the passed XML content.
 * This method has a fail-fast behavior: if the 'uml:Model' element isn't found
 * immediately (the root), this methods throws an exception. 
 * @param {string} content the XML content.
 * @return {Object} the root element.
 * @throws NoRootElementException if the document doesn't possess any root.
 */
function getRootElement(content) {
  var root;
  var parser = new xml2js.Parser(); // as an option: {explicitArray : false}
  var result = parser.parseString(content, function (err, result) {
    if (result.hasOwnProperty('uml:Model')) {
      root = result['uml:Model'];
    } else if (result.hasOwnProperty('xmi:XMI')) {
      root = result['xmi:XMI']['uml:Model'][0];
    } else { // TODO: find the root, if there is one at all.
      throw new NoRootElementException(
        'The passed document has no immediate root element,'
        + ' exiting now.');
    }
  });
  return root;
}

/**
 * Gets and returns the correct Types the script must refer to.
 * @param {string} databaseTypeName the database type name (either 'sql', 
 *                                  'mongodb' or 'cassandra').
 * @return {Types} a concrete implementation of the Types interface.
 * @throws WrongDatabaseTypeException if the passed database type is invalid.
 */
function initDatabaseTypeHolder(databaseTypeName) {
  switch (databaseTypeName) {
    case 'sql':
      return new types.SQLTypes();
    case 'mongodb':
      return new types.MongoDBTypes();
    case 'cassandra':
      return new types.CassandraTypes();
    default:
      throw new WrongDatabaseTypeException(
        'The passed database type is incorrect. '
        + "Must either be 'sql', 'mongodb', or 'cassandra'. Got '"
        + databaseTypeName
        + "', exiting now.");
  }
}

// exception definitions
function WrongDatabaseTypeException(message) {
  this.name = 'WrongDatabaseTypeException';
  this.message = (message || '');
}
WrongDatabaseTypeException.prototype = new Error();

function WrongPassedArgumentException(message) {
  this.name = 'WrongPassedArgumentException';
  this.message = (message || '');
}
WrongPassedArgumentException.prototype = new Error();

function NoRootElementException(message) {
  this.name = 'NoRootElementException';
  this.message = (message || '');
}
NoRootElementException.prototype = new Error();

function InvalidTypeException(message) {
  this.name = 'InvalidTypeException';
  this.message = (message || '');
}
InvalidTypeException.prototype = new Error();

function NoTypeException(message) {
  this.name = 'NoTypeException';
  this.message = (message || '');
}
NoTypeException.prototype = new Error();

function NoValidationNameForValueException(message) {
  this.name = 'NoValidationNameForValueException';
  this.message = (message || '');
}
NoValidationNameForValueException.prototype = new Error();

function WrongValidationException(message) {
  this.name = 'WrongValidationException';
  this.message = (message || '');
}
WrongValidationException.prototype = new Error();

function WrongCardinalityException(message) {
  this.name = 'WrongCardinalityException';
  this.message = (message || '');
}
WrongCardinalityException.prototype = new Error();

function NoCardinalityException(message) {
  this.name = 'NoCardinalityException';
  this.message = (message || '');
}
NoCardinalityException.prototype = new Error();