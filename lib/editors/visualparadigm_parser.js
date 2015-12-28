'use strict';

var _s = require('underscore.string'),
    AbstractParser = require('./abstract_parser'),
    parser_helper = require('./parser_helper'),
    InvalidTypeException = require('../exceptions/invalid_type_exception'),
    NullPointerException = require('../exceptions/null_pointer_exception'),
    NoValidationNameException = require('../exceptions/no_validation_name_exception'),
    WrongValidationException = require('../exceptions/wrong_validation_exception'),
    NoTypeException = require('../exceptions/no_type_exception');

/**
 * The parser for Visual Paradigm files.
 */
var VisualParadigmParser = module.exports = function(root, databaseTypes) {
  AbstractParser.call(this, root, databaseTypes);
};

// inheritance stuff
VisualParadigmParser.prototype = Object.create(AbstractParser.prototype);
VisualParadigmParser.prototype.constructor = AbstractParser;

VisualParadigmParser.prototype.parse = function() {
  this.findElements();
  this.findConstraints();
  this.fillTypes();
  this.fillEnums();
  this.fillAssociations();
  this.fillClassesAndFields();
  this.fillConstraints();
  return this.parsedData;
};

VisualParadigmParser.prototype.findElements = function() {
  this.root.packagedElement.forEach(function(element, index) {
    switch (element.$['xmi:type']) {
      case 'uml:PrimitiveType':
      case 'uml:DataType':
        this.rawTypesIndexes.push(index);
        break;
      case 'uml:Enumeration':
        this.rawEnumsIndexes.push(index);
        break;
      case 'uml:Class':
        this.rawClassesIndexes.push(index);
        break;
      case 'uml:Association':
        this.rawAssociationsIndexes.push(index);
        break;
      default:
    }
  }, this);
};

VisualParadigmParser.prototype.findConstraints = function() {
  if (!this.root.ownedRule) {
    return;
  }

  this.root.ownedRule.forEach(function(element, index) {
    if (this.rawValidationRulesIndexes.indexOf(element) === -1) {
      this.rawValidationRulesIndexes.push(index);
    }
  }, this);
};

VisualParadigmParser.prototype.fillTypes = function() {
  this.rawTypesIndexes.forEach(function(element) {
    var type = this.root.packagedElement[element];
    this.addType(type.$.name, type.$['xmi:id']);
  }, this);
};

VisualParadigmParser.prototype.addType = function(typeName, typeId) {
  if (!this.databaseTypes.contains(_s.capitalize(typeName))) {
    throw new InvalidTypeException(
      "The type '"
      + typeName
      + "' isn't supported by JHipster.");
  }
  this.parsedData.addType(typeId, { name: _s.capitalize(typeName) });
};

VisualParadigmParser.prototype.fillEnums = function() {
  this.rawEnumsIndexes.forEach(function(index) {
    var enumElement = this.root.packagedElement[index];
    if (!enumElement.$.name) {
      throw new NullPointerException("The Enumeration's name can't be null.");
    }
    var enumData = { name: enumElement.$.name, values: [] };
    if (enumElement.ownedLiteral) {
      enumElement.ownedLiteral.forEach(function(literalIndex) {
        if(!literalIndex.$.name.toUpperCase()) {
          throw new NullPointerException(
            "The Enumeration's values can't be null.");
        }
        enumData.values.push(literalIndex.$.name.toUpperCase());
      });
    }
    this.parsedData.addEnum(enumElement.$['xmi:id'], enumData);
  }, this);
};

VisualParadigmParser.prototype.fillAssociations = function() {
  this.rawAssociationsIndexes.forEach(function(rawAssociationsIndex) {
    var association = this.root.packagedElement[rawAssociationsIndex];

    var associationData = {
      name: (association.ownedEnd) ? association.ownedEnd[0].$.name : '',
      type: (association.ownedEnd) ? association.ownedEnd[0].$.type : ''
    };

    associationData.isUpperValuePresent = !association.ownedEnd || association.ownedEnd
      && association.ownedEnd[0].upperValue
      && association.ownedEnd[0].upperValue[0].$.value === '*';

    this.parsedData.addAssociation(association.$['xmi:id'], associationData);
  }, this);
};

VisualParadigmParser.prototype.fillClassesAndFields = function() {
  this.rawClassesIndexes.forEach(function(classIndex) {
    var element = this.root.packagedElement[classIndex];

    if (!element.$.name) {
      throw new NullPointerException('Classes must have a name.');
    }
    this.checkForUserClass(element);
    this.addClass(element);

    if (element.ownedAttribute) {
      this.handleAttributes(element);
    }
  }, this);
};

VisualParadigmParser.prototype.handleAttributes = function(element) {
  element.ownedAttribute.forEach(function(attribute) {
    if (!attribute.$.name) {
      throw new NullPointerException(
        "No name is defined for the passed attribute, for class '"
        + element.$.name
        + "'.");
    }
    if (!parser_helper.isAnId(
        attribute.$.name,
        element.$.name)) {
      this.addField(attribute, element.$['xmi:id']);
    }
  }, this);
};

VisualParadigmParser.prototype.checkForUserClass = function(element) {
  if (!this.parsedData.userClassId && element.$.name.toLowerCase() === 'user') {
    this.parsedData.userClassId = element.$['xmi:id'];
  }
};

/**
 * Adds a new class in the class map.
 * @param {Object} element the class to add.
 */
VisualParadigmParser.prototype.addClass = function(element) {
  var classData = {
    name: element.$.name
  };
  if (element['xmi:Extension'] && element['xmi:Extension'][0].comments
      && element['xmi:Extension'][0].comments[0].comment) {
    classData.comment =
      element['xmi:Extension'][0].comments[0].comment[0].$.documentation;
  }
  this.parsedData.addClass(element.$['xmi:id'], classData);
};

/**
 * Adds a new field to the field map.
 * @param {Object} element the field to add.
 * @param {string} classId the encapsulating class' id.
 */
VisualParadigmParser.prototype.addField = function(element, classId) {
  if (element.$.association) {
    this.addInjectedField(element, classId);
  } else {
    this.addRegularField(element, classId);
  }
};

/**
 * Adds a (regular, not injected) field to the field map.
 * @param {Object} element the new field to add.
 */
VisualParadigmParser.prototype.addRegularField = function(element, classId) {
  var fieldData = { name: _s.decapitalize(element.$.name) };
  if (element.$.type) {
    fieldData.type = element.$.type;
  } else if (!element.type) {
    throw new NoTypeException(
      "The field '"
      + element.$.name
      + "' does not possess any type.");
  } else {
    var typeName =
      _s.capitalize(parser_helper.getTypeNameFromURL(element.type[0].$.href));
    this.addType(typeName, typeName); // id = name
    fieldData.type = typeName;
  }

  if (element['xmi:Extension'] && element['xmi:Extension'][0].comments
      && element['xmi:Extension'][0].comments[0].comment) {
    fieldData.comment =
      element['xmi:Extension'][0].comments[0].comment[0].$.documentation;
  }

  this.parsedData.addField(element.$['xmi:id'], fieldData);
  this.parsedData.addFieldToClass(classId, element.$['xmi:id']);
};

/**
 * Adds an injected field to the corresponding map.
 * @param {Object} element the field to add.
 * @param {string} classId the id of the class containing this field.
 */
VisualParadigmParser.prototype.addInjectedField = function(element, classId) {
  var injectedFieldData = {
    name: _s.decapitalize(element.$.name),
    type: element.$.type,
    association: element.$.association,
    'class': classId
  };
  if (element.upperValue && element.upperValue[0].$.value) {
    injectedFieldData.isUpperValuePresent =
      element.upperValue[0].$.value === '*';
  }

  injectedFieldData.cardinality = parser_helper.getCardinality(
    injectedFieldData,
    this.parsedData.associations);

  if (element['xmi:Extension'] && element['xmi:Extension'][0].comments
      && element['xmi:Extension'][0].comments[0].comment) {
    injectedFieldData.comment =
      element['xmi:Extension'][0].comments[0].comment[0].$.documentation;
  }

  this.parsedData.addInjectedField(element.$['xmi:id'], injectedFieldData);
  this.parsedData.addInjectedFieldToClass(classId, element.$['xmi:id']);
};

/**
 * Fills the existing fields with the present validations.
 * @throws NoValidationNameException if no validation name exists for the
 *                                   validation value (1 for no minlength for
 *                                   instance).
 * @throws WrongValidationException if JHipster doesn't support the
 *                                  validation.
 */
VisualParadigmParser.prototype.fillConstraints = function() {
  this.rawValidationRulesIndexes.forEach(function(index) {
    var constraint = this.root.ownedRule[index];
    var name = constraint.$.name;

    if (!name) {
      throw new NoValidationNameException('The validation has no name.');
    }

    // not nil, but ''
    var value = constraint.specification[0].$.body;

    if (!name && !value) {
      return;
    }

    if (!this.databaseTypes.isValidationSupportedForType(
        this.parsedData.getType(this.parsedData.getField(constraint.$.constrainedElement).type).name,
        name)) {
      throw new WrongValidationException(
        "The validation '"
        + name
        + "' isn't supported for the type '"
        + this.parsedData.getType(this.parsedData.getField(constraint.$.constrainedElement).type).name
        + "'.");
    }
    this.parsedData.addValidationToField(
      constraint.$.constrainedElement,
      name,
      value);
  }, this);
};
