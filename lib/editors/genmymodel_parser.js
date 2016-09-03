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
 * The parser for GenMyModel files.
 */
var GenMyModelParser = module.exports = function (root, databaseTypes, noUserManagement) {
  AbstractParser.call(this, root, databaseTypes, noUserManagement);
};

GenMyModelParser.prototype = Object.create(AbstractParser.prototype);
GenMyModelParser.prototype.constructor = AbstractParser;

GenMyModelParser.prototype.parse = function () {
  this.findElements();
  this.fillTypes();
  this.fillEnums();
  this.fillClassesAndFields();
  this.fillAssociations();
  return this.parsedData;
};

GenMyModelParser.prototype.findElements = function () {
  this.root.packagedElement.forEach(function (element, index) {
    switch (element.$['xsi:type']) {
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

GenMyModelParser.prototype.fillTypes = function () {
  this.rawTypesIndexes.forEach(function (element) {
    var type = this.root.packagedElement[element];
    this.addType(type.$.name, type.$['xmi:id']);
  }, this);
};

GenMyModelParser.prototype.addType = function (typeName, typeId) {
  if (!this.databaseTypes.contains(_.upperFirst(typeName))) {
    throw new buildException(
        exceptions.WrongType,
        `The type '${typeName}' isn't supported by JHipster.`);
  }
  this.parsedData.addType(typeId, {name: _.upperFirst(typeName)});
};

GenMyModelParser.prototype.fillEnums = function () {
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

function getAssociationEnds(association) {
  var data = {
    from: association.ownedEnd[1].$.type,
    to: association.ownedEnd[0].$.type,
    injectedFieldInFrom: association.ownedEnd[0].$.name,
    injectedFieldInTo: association.ownedEnd[1].$.name
  };
  if (association.ownedEnd[0].lowerValue[0].$.value === '1' || association.ownedEnd[0].lowerValue[0].$.value === '*') {
    data.isInjectedFieldInFromRequired = true;
  }
  if (association.ownedEnd[1].lowerValue[0].$.value === '1' || association.ownedEnd[1].lowerValue[0].$.value === '*') {
    data.isInjectedFieldInToRequired = true;
  }

  return data;
}

function getAssociationType(association) {
  if (association.ownedEnd[0].upperValue[0].$.value === '*'
      && association.ownedEnd[1].upperValue[0].$.value === '*') {
    return cardinalities.MANY_TO_MANY;
  } else if (association.ownedEnd[0].upperValue[0].$.value === '*'
      && association.ownedEnd[1].upperValue[0].$.value !== '*') {
    return cardinalities.ONE_TO_MANY;
  } else if (association.ownedEnd[0].upperValue[0].$.value !== '*'
      && association.ownedEnd[1].upperValue[0].$.value === '*') {
    return cardinalities.MANY_TO_ONE;
  }
  return cardinalities.ONE_TO_ONE;
}

function getAssociationComments(association) {
  var comments = {
    commentInFrom: '',
    commentInTo: ''
  };
  if (association.eAnnotations && association.eAnnotations[0].details
      && association.eAnnotations[0].details.length > 1
      && association.eAnnotations[0].details[1].$.key === 'gmm-documentation') {
    comments.commentInFrom = association.eAnnotations[0].details[1].$.value;
    comments.commentInTo = associationData.commentInFrom;
  }
  return comments;
}

GenMyModelParser.prototype.fillAssociations = function () {
  this.rawAssociationsIndexes.forEach(function (element) {
    var association = this.root.packagedElement[element];

    var associationData = getAssociationEnds(association);
    associationData.type = getAssociationType(association);
    var comments = getAssociationComments(association);
    associationData.commentInFrom = comments.commentInFrom;
    associationData.commentInTo = comments.commentInTo;

    this.parsedData.addAssociation(association.$['xmi:id'], associationData);

  }, this);
};

/**
 * Fills the classes and the fields that compose them.
 * @throws NullPointerException if a class' name, or an attribute, is nil.
 */
GenMyModelParser.prototype.fillClassesAndFields = function () {
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

GenMyModelParser.prototype.checkForUserClass = function (element) {
  if (!this.parsedData.userClassId && element.$.name.toLowerCase() === 'user') {
    this.parsedData.userClassId = element.$['xmi:id'];
  }
};

GenMyModelParser.prototype.handleAttributes = function (element) {
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
GenMyModelParser.prototype.addClass = function (element) {
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
  if (element.eAnnotations && element.eAnnotations[0].details
      && element.eAnnotations[0].details.length > 1
      && element.eAnnotations[0].details[1].$.key === 'gmm-documentation') {
    classData.comment = element.eAnnotations[0].details[1].$.value;
  }

  this.parsedData.addClass(element.$['xmi:id'], classData);
};

/**
 * Adds a new field to the field map.
 * @param {Object} element the field to add.
 * @param {string} classId the encapsulating class' id.
 */
GenMyModelParser.prototype.addField = function (element, classId) {
  this.addRegularField(element, classId);
};

/**
 * Adds a (regular, not injected) field to the field map.
 * @param {Object} element the new field to add.
 */
GenMyModelParser.prototype.addRegularField = function (element, classId) {
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

  if (element.eAnnotations && element.eAnnotations[0].details
      && element.eAnnotations[0].details.length > 1
      && element.eAnnotations[0].details[1].$.key === 'gmm-documentation') {
    fieldData.comment = element.eAnnotations[0].details[1].$.value;
  }

  this.parsedData.addField(classId, element.$['xmi:id'], fieldData);
};

/**
 * Fills the existing fields with the present validations.
 * @throws NoValidationNameException if no validation name exists for the
 *                                   validation value (1 for no minlength for
 *                                   instance).
 * @throws WrongValidationException if JHipster doesn't support the validation.
 */
GenMyModelParser.prototype.fillConstraints = function () {
  throw new buildException(
      exceptions.UnimplementedOperation,
      'GenMyModel does not support constraints.');
};
