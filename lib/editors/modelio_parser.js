'use strict';

const _ = require('lodash'),
    AbstractParser = require('./abstract_parser'),
    parser_helper = require('./parser_helper'),
    cardinalities = require('../cardinalities'),
    checkForReservedClassName = require('../utils/jhipster_utils').checkForReservedClassName,
    checkForReservedTableName = require('../utils/jhipster_utils').checkForReservedTableName,
    checkForReservedFieldName = require('../utils/jhipster_utils').checkForReservedFieldName,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

/**
 * The parser for Modelio files.
 */
var ModelioParser = module.exports = function (root, databaseTypes, noUserManagement) {
  AbstractParser.call(this, root, databaseTypes, noUserManagement);
};

// inheritance stuff
ModelioParser.prototype = Object.create(AbstractParser.prototype);
ModelioParser.prototype.constructor = AbstractParser;

ModelioParser.prototype.parse = function () {
  this.findElements();
  this.findConstraints();
  this.fillTypes();
  this.fillEnums();
  this.fillAssociations();
  this.fillClassesAndFields();
  this.fillConstraints();
  return this.parsedData;
};

ModelioParser.prototype.findElements = function () {
  this.root.packagedElement.forEach(function (element, index) {
    switch (element.$['xmi:type']) {
      case 'uml:PrimitiveType':
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

ModelioParser.prototype.findConstraints = function () {
  if (!this.root.ownedRule) {
    return;
  }
  this.rawValidationRulesIndexes = this.root.ownedRule.map(function (element, index) {
    if (element.$['xmi:type'] === 'uml:Constraint') {
      return index;
    }
  });
};

ModelioParser.prototype.fillTypes = function () {
  this.rawTypesIndexes.forEach(function (element) {
    var type = this.root.packagedElement[element];
    this.addType(type.$.name, type.$['xmi:id']);
  }, this);
};

ModelioParser.prototype.addType = function (typeName, typeId) {
  if (!this.databaseTypes.contains(_.upperFirst(typeName))) {
    throw new buildException(
        exceptions.WrongType,
        `The type '${typeName}' isn't supported by JHipster.`);
  }
  this.parsedData.addType(typeId, {name: _.upperFirst(typeName)});
};

ModelioParser.prototype.fillEnums = function () {
  this.rawEnumsIndexes.forEach(function (index) {
    var enumElement = this.root.packagedElement[index];
    if (!enumElement.$.name) {
      throw new buildException(
          exceptions.NullPointer, "The enumeration's name can't be null.");
    }
    var enumData = {name: enumElement.$.name, values: []};
    if (enumElement.ownedLiteral) {
      enumElement.ownedLiteral.forEach(function (literalIndex) {
        if (!literalIndex.$.name.toUpperCase()) {
          throw new buildException(
              exceptions.NullPointer,
              "The Enumeration's values can't be null.");
        }
        enumData.values.push(literalIndex.$.name.toUpperCase());
      });
    }
    this.parsedData.addEnum(enumElement.$['xmi:id'], enumData);
  }, this);
};

ModelioParser.prototype.fillAssociations = function () {
  this.rawAssociationsIndexes.forEach(function (rawAssociationsIndex) {
    var association = this.root.packagedElement[rawAssociationsIndex];
    var associationData = {
      from: association.ownedEnd[0].$.type,
      injectedFieldInTo: association.ownedEnd[0].$.name
    };
    if (!association.ownedEnd[0].lowerValue) {
      associationData.isInjectedFieldInFromRequired = true;
    }
    if (association.ownedEnd[0].upperValue
        && association.ownedEnd[0].upperValue[0].$.value === '*') {
      associationData.type = {
        MANY_TO_ONE: null,
        MANY_TO_MANY: null
      }; // to be determined later
    } else {
      associationData.type = cardinalities.ONE_TO_MANY;
    }
    this.parsedData.addAssociation(association.$['xmi:id'], associationData);
  }, this);
};

ModelioParser.prototype.fillClassesAndFields = function () {
  this.rawClassesIndexes.forEach(function (classIndex) {
    var element = this.root.packagedElement[classIndex];
    if (!element.$.name) {
      throw new buildException(
          exceptions.NullPointer, 'Classes must have a name.');
    }
    this.checkForUserClass(element);
    this.addClass(element);

    if (element.ownedAttribute) {
      this.handleAttributes(element);
    }
  }, this);
};

ModelioParser.prototype.checkForUserClass = function (element) {
  if (!this.parsedData.userClassId && element.$.name.toLowerCase() === 'user') {
    this.parsedData.userClassId = element.$['xmi:id'];
  }
};

ModelioParser.prototype.handleAttributes = function (element) {
  element.ownedAttribute.forEach(function (attribute) {
    if (!attribute.$.name) {
      throw new buildException(
          exceptions.NullPointer,
          `No name is defined for the passed attribute, for class '${element.$.name}'.`);
    }
    if (!parser_helper.isAnId(attribute.$.name)) {
      this.addField(attribute, element.$['xmi:id']);
    }
  }, this);
};

/**
 * Adds a new class in the class map.
 * @param {Object} element the class to add.
 */
ModelioParser.prototype.addClass = function (element) {
  var names = parser_helper.extractClassName(element.$.name);
  var classData = {
    name: _.upperFirst(names.entityName),
    tableName: names.tableName
  };
  checkForReservedClassName({
    name: classData.name,
    shouldThrow: true
  });
  if (classData.tableName.toLowerCase() !== 'user'
      || (classData.tableName.toLowerCase() === 'user' && !this.noUserManagement)) {
    checkForReservedTableName({
      name: classData.tableName,
      databaseTypeName: this.databaseTypes.getName(),
      shouldThrow: true
    });
  }
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
ModelioParser.prototype.addField = function (element, classId) {
  if (element.$.association) {
    completeAssociation(
        this.parsedData.getAssociation(element.$.association),
        element);
  } else {
    this.addRegularField(element, classId);
  }
};

/**
 * Adds a (regular, not injected) field to the field map.
 * @param {Object} element the new field to add.
 * @param {string} classId the class' id.
 */
ModelioParser.prototype.addRegularField = function (element, classId) {
  checkForReservedFieldName({
    name: element.$.name,
    databaseTypeName: this.databaseTypes.getName(),
    shouldThrow: true
  });
  var fieldData = {name: _.lowerFirst(element.$.name)};
  if (element.$.type) {
    fieldData.type = element.$.type;
  } else if (!element.type) {
    throw new buildException(
        exceptions.WrongField,
        `The field '${element.$.name}' does not possess any type.`);
  } else {
    var typeName =
        _.upperFirst(parser_helper.getTypeNameFromURL(element.type[0].$.href));
    this.addType(typeName, typeName); // id = name
    fieldData.type = typeName;
  }

  if (element.ownedComment && element.ownedComment[0].body) {
    fieldData.comment = element.ownedComment[0].body[0];
  }
  this.parsedData.addField(classId, element.$['xmi:id'], fieldData);
};

function completeAssociation(association, element) {
  switch (element.$.aggregation) {
    case 'composite':
      if (association.type.hasOwnProperty('MANY_TO_ONE')) {
        association.type = cardinalities.MANY_TO_ONE;
      } else {
        association.type = cardinalities.ONE_TO_ONE;
      }
      break;
    case 'shared':
      if (element.upperValue && element.upperValue[0].$.value === '*'
          && association.type.hasOwnProperty('MANY_TO_MANY')) {
        association.type = cardinalities.MANY_TO_MANY;
      } else if (!element.upperValue || (element.upperValue[0] && element.upperValue[0].$.value !== '*')
          && association.type.hasOwnProperty('MANY_TO_ONE')) {
        association.type = cardinalities.MANY_TO_ONE;
      }
      break;
    default:
  }
  association.to = element.$.type;
  association.injectedFieldInFrom = element.$.name;
  if (!element.lowerValue) {
    association.isInjectedFieldInToRequired = true;
  }
}

/**
 * Fills the existing fields with the present validations.
 * @throws NoValidationNameException if no validation name exists for the
 *                                   validation value (1 for no minlength for
 *                                   instance).
 * @throws WrongValidationException if JHipster doesn't support the
 *                                  validation.
 */
ModelioParser.prototype.fillConstraints = function () {
  this.rawValidationRulesIndexes.forEach(function (index) {
    var constraint = this.root.ownedRule[index];

    if (!constraint.$.name) {
      throw new buildException(
          exceptions.WrongValidation, 'The validation has no name.');
    }
    var name = constraint.$.name;
    var type = this.parsedData.getType(this.parsedData.getField(constraint.$.constrainedElement).type);
    var enumType = this.parsedData.getEnum(this.parsedData.getField(constraint.$.constrainedElement).type);

    if ((type && !this.databaseTypes.isValidationSupportedForType(type.name, name))
        || (enumType && !this.databaseTypes.isValidationSupportedForType('Enum', name))) {
      throw new buildException(
          exceptions.WrongValidation,
          `The validation '${name}' isn't supported for the type '`
          + `${this.parsedData.getType(this.parsedData.getField(constraint.$.constrainedElement).type)}'.`);
    }

    // not nil, but ''
    var value = constraint.specification[0].$.value;

    this.parsedData.addValidationToField(
        constraint.$.constrainedElement,
        constraint.$['xmi:id'],
        {name: name, value: value}
    );

  }, this);
};
