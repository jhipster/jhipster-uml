'use strict';

const _ = require('lodash'),
    AbstractParser = require('./abstract_parser'),
    parser_helper = require('./parser_helper'),
    cardinalities = require('../cardinalities'),
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

/**
 * The parser for Visual Paradigm files.
 */
var VisualParadigmParser = module.exports = function (root, databaseTypes) {
  AbstractParser.call(this, root, databaseTypes);
};

// inheritance stuff
VisualParadigmParser.prototype = Object.create(AbstractParser.prototype);
VisualParadigmParser.prototype.constructor = AbstractParser;

VisualParadigmParser.prototype.parse = function () {
  this.findElements();
  this.findConstraints();
  this.fillTypes();
  this.fillEnums();
  this.fillAssociations();
  this.fillClassesAndFields();
  this.fillConstraints();
  return this.parsedData;
};

VisualParadigmParser.prototype.findElements = function () {
  this.root.packagedElement.forEach(function (element, index) {
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

VisualParadigmParser.prototype.findConstraints = function () {
  if (!this.root.ownedRule) {
    return;
  }
  this.rawValidationRulesIndexes = this.root.ownedRule.map(function (element, index) {
    if (this.rawValidationRulesIndexes.indexOf(element) === -1) {
      return index;
    }
  }, this);
};

VisualParadigmParser.prototype.fillTypes = function () {
  this.rawTypesIndexes.forEach(function (element) {
    var type = this.root.packagedElement[element];
    this.addType(type.$.name, type.$['xmi:id']);
  }, this);
};

VisualParadigmParser.prototype.addType = function (typeName, typeId) {
  if (!this.databaseTypes.contains(_.upperFirst(typeName))) {
    throw new buildException(
        exceptions.WrongType,
        `The type '${typeName}' isn't supported by JHipster.`);
  }
  this.parsedData.addType(typeId, {name: _.upperFirst(typeName)});
};

VisualParadigmParser.prototype.fillEnums = function () {
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

VisualParadigmParser.prototype.fillAssociations = function () {
  this.rawAssociationsIndexes.forEach(function (rawAssociationsIndex) {
    var association = this.root.packagedElement[rawAssociationsIndex];
    var associationData = {};
    if (association.ownedEnd) {
      associationData.from = association.ownedEnd[0].$.type;
      associationData.injectedFieldInTo = association.ownedEnd[0].$.name;
      if (association.ownedEnd[0].upperValue
          && association.ownedEnd[0].upperValue[0].$.value === '*') {
        associationData.type = {
          MANY_TO_ONE: null,
          MANY_TO_MANY: null
        }; // to be determined later
      } else {
        associationData.type = {
          ONE_TO_MANY: null,
          ONE_TO_ONE: null
        };
      }
    } else {
      var injectedFields = association.$.memberEnd.split(' ');
      associationData.injectedFieldInTo = injectedFields[0];
      associationData.injectedFieldInFrom = injectedFields[1];
    }
    this.parsedData.addAssociation(association.$['xmi:id'], associationData);
  }, this);
};

function completeAssociation(association, element) {
  if (!association.type) { // bidirectional, and not encountered before
    if (element.$['xmi:id'] === association.injectedFieldInTo) {
      if (element.upperValue && element.upperValue[0].$.value === '*') {
        association.type = {
          ONE_TO_MANY: null,
          MANY_TO_MANY: null
        };
      } else {
        association.type = {
          ONE_TO_ONE: null,
          MANY_TO_ONE: null
        };
      }
    } else if (element.$['xmi:id'] === association.injectedFieldInFrom) {
      if (element.upperValue && element.upperValue[0].$.value === '*') {
        association.type = {
          ONE_TO_ONE: null,
          ONE_TO_MANY: null
        };
      } else {
        association.type = {
          MANY_TO_ONE: null,
          MANY_TO_MANY: null
        };
      }
    }
  } else { // encountered once, we're in the destination entity
    if (element.upperValue && element.upperValue[0].$.value === '*') {
      association.type = (association.type.ONE_TO_ONE)
          ? cardinalities.ONE_TO_ONE
          : cardinalities.MANY_TO_ONE;
    } else {
      association.type = (association.type.MANY_TO_MANY)
          ? cardinalities.MANY_TO_MANY
          : cardinalities.ONE_TO_MANY;
    }
  }

  if (element.$['xmi:id'] === association.injectedFieldInTo) { // in the to side
    association.from = element.$.type;
    association.injectedFieldInTo = element.$.name;
  } else if (element.$['xmi:id'] === association.injectedFieldInFrom) {
    association.to = element.$.type;
    association.injectedFieldInFrom = element.$.name;
  }
}

VisualParadigmParser.prototype.fillClassesAndFields = function () {
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

VisualParadigmParser.prototype.handleAttributes = function (element) {
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

VisualParadigmParser.prototype.checkForUserClass = function (element) {
  if (!this.parsedData.userClassId && element.$.name.toLowerCase() === 'user') {
    this.parsedData.userClassId = element.$['xmi:id'];
  }
};

/**
 * Adds a new class in the class map.
 * @param {Object} element the class to add.
 */
VisualParadigmParser.prototype.addClass = function (element) {
  var names = parser_helper.extractClassName(element.$.name);
  var classData = {
    name: _.upperFirst(names.entityName),
    tableName: names.tableName
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
VisualParadigmParser.prototype.addField = function (element, classId) {
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
VisualParadigmParser.prototype.addRegularField = function (element, classId) {
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

  if (element['xmi:Extension'] && element['xmi:Extension'][0].comments
      && element['xmi:Extension'][0].comments[0].comment) {
    fieldData.comment =
        element['xmi:Extension'][0].comments[0].comment[0].$.documentation;
  }
  this.parsedData.addField(classId, element.$['xmi:id'], fieldData);
};

/**
 * Fills the existing fields with the present validations.
 * @throws NoValidationNameException if no validation name exists for the
 *                                   validation value (1 for no minlength for
 *                                   instance).
 * @throws WrongValidationException if JHipster doesn't support the
 *                                  validation.
 */
VisualParadigmParser.prototype.fillConstraints = function () {
  this.rawValidationRulesIndexes.forEach(function (index) {
    var constraint = this.root.ownedRule[index];

    if (!constraint.$.name) {
      throw new buildException(
          exceptions.WrongValidation, 'The validation has no name.');
    }

    var name = constraint.$.name;
    var type = this.parsedData.getType(
        this.parsedData.getField(constraint.$.constrainedElement).type);
    var enumType = this.parsedData.getEnum(
        this.parsedData.getField(constraint.$.constrainedElement).type);


    if ((type && !this.databaseTypes.isValidationSupportedForType(type.name, name))
        || (enumType && !this.databaseTypes.isValidationSupportedForType('Enum', name))) {
      throw new buildException(
          exceptions.WrongValidation,
          `The validation '${name}' isn't supported for the type '`
          + `${this.parsedData.getType(this.parsedData.getField(constraint.$.constrainedElement).type)}'.`);
    }

    // not nil, but ''
    var value = constraint.specification[0].$.body;

    this.parsedData.addValidationToField(
        constraint.$.constrainedElement,
        constraint.$['xmi:id'],
        {name: name, value: value}
    );
  }, this);
};
