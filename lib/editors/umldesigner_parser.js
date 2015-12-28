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
 * The parser for UML Designer files.
 */
var UMLDesignerParser = module.exports = function(root, databaseTypes) {
  AbstractParser.call(this, root, databaseTypes);
};

UMLDesignerParser.prototype = Object.create(AbstractParser.prototype);
UMLDesignerParser.prototype.constructor = AbstractParser;

UMLDesignerParser.prototype.parse = function() {
  this.findElements();
  this.fillTypes();
  this.fillEnums();
  this.fillClassesAndFields();
  this.fillAssociations();
  return this.parsedData;
};

UMLDesignerParser.prototype.findElements = function() {
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
  this.findConstraints();
};

UMLDesignerParser.prototype.findConstraints = function() {
  // not supported by UML Designer yet
};

UMLDesignerParser.prototype.fillTypes = function() {
  this.rawTypesIndexes.forEach(function(element) {
    var type = this.root.packagedElement[element];
    this.addType(type.$.name, type.$['xmi:id']);
  }, this);
};

UMLDesignerParser.prototype.addType = function(typeName, typeId) {
  if (!this.databaseTypes.contains(_s.capitalize(typeName))) {
    throw new InvalidTypeException(
      "The type '"
      + typeName
      + "' isn't supported by JHipster.");
  }
  this.parsedData.addType(typeId, { name: _s.capitalize(typeName) });
};

UMLDesignerParser.prototype.fillEnums = function() {
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

UMLDesignerParser.prototype.fillClassesAndFields = function() {
  this.rawClassesIndexes.forEach(function(index) {
    var element = this.root.packagedElement[index];

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

UMLDesignerParser.prototype.handleAttributes = function(element) {
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

UMLDesignerParser.prototype.checkForUserClass = function(element) {
  if (!this.userClassId && element.$.name.toLowerCase() === 'user') {
    this.userClassId = element.$['xmi:id'];
  }
};

/**
 * Adds a new class in the class map.
 * @param {Object} element the class to add.
 */
UMLDesignerParser.prototype.addClass = function(element) {
  var classData = {
    name: element.$.name
  };
  if (element.ownedComment && element.ownedComment[0].body) {
    classData.comment = element.ownedComment[0].body[0];
  }
  this.parsedData.addClass(element.$['xmi:id'], classData);
};

/**
 * Adds a new field to the field map.
 * @param {Object} element the field to add.
 * @param {string} classId the encapsulating class' id.
 */
UMLDesignerParser.prototype.addField = function(element, classId) {
  this.addRegularField(element, classId);
};

/**
 * Adds a (regular, not injected) field to the field map.
 * @param {Object} element the new field to add.
 * @param {string} classId the class' id.
 */
UMLDesignerParser.prototype.addRegularField = function(element, classId) {
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

  if (element.ownedComment && element.ownedComment[0].body) {
    fieldData.comment = element.ownedComment[0].body[0];
  }

  this.parsedData.addField(element.$['xmi:id'], fieldData);
  this.parsedData.addFieldToClass(classId, element.$['xmi:id']);
};

UMLDesignerParser.prototype.fillAssociations = function() {
  this.rawAssociationsIndexes.forEach(function(rawAssociationsIndex) {
    var association = this.root.packagedElement[rawAssociationsIndex];

    if (association.ownedEnd[0].$['xmi:id'] === association.$.navigableOwnedEnd) {
      this.parsedData.addAssociation(
        association.$['xmi:id'], {
          isUpperValuePresent: association.ownedEnd[1].upperValue[0].$.value === '*',
          name: association.ownedEnd[1].$.name,
          type: association.ownedEnd[1].$.type
        });

      this.addInjectedField(
        association.ownedEnd[0],
        association.ownedEnd[1].$.type);
    } else {
      this.parsedData.addAssociation(
        association.$['xmi:id'], {
          isUpperValuePresent: association.ownedEnd[0].upperValue[0].$.value === '*',
          name: association.ownedEnd[0].$.name,
          type: association.ownedEnd[0].$.type
        });

      this.addInjectedField(
        association.ownedEnd[1],
        association.ownedEnd[0].$.type);
    }
  }, this);
};

/**
 * Adds an injected field to the corresponding map.
 * @param {Object} element the field to add.
 * @param {string} classId the id of the class containing this field.
 */
UMLDesignerParser.prototype.addInjectedField = function(element, classId) {
  var injectedFieldData = {
    name: _s.decapitalize(element.$.name),
    type: element.$.type,
    association: element.$.association,
    'class': classId,
    isUpperValuePresent: element.upperValue[0].$.value === '*'
  };

  injectedFieldData.cardinality = parser_helper.getCardinality(
    injectedFieldData,
    this.parsedData.associations);

  if (element.ownedComment && element.ownedComment[0].body) {
    injectedFieldData.comment = element.ownedComment[0].body[0];
  }

  this.parsedData.addInjectedField(element.$['xmi:id'], injectedFieldData);
  this.parsedData.addInjectedFieldToClass(classId, element.$['xmi:id']);
};

UMLDesignerParser.prototype.fillConstraints = function() {
  // not supported by UML Designer yet
};
