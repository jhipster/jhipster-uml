'use strict';

const _ = require('lodash'),
    ParsedData = require('../data/parsed_data'),
    parser_helper = require('./parser_helper'),
    cardinalities = require('../cardinalities'),
    checkForReservedClassName = require('../utils/jhipster_utils').checkForReservedClassName,
    checkForReservedTableName = require('../utils/jhipster_utils').checkForReservedTableName,
    checkForReservedFieldName = require('../utils/jhipster_utils').checkForReservedFieldName,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

var root;
var databaseTypes;
var rawObjects;
var parsedData;
var noUserManagement;

module.exports = {
  parse: parse
};

function parse(args) {
  initParser(args);
  findElements();
  fillTypes();
  fillEnums();
  fillAssociations();
  fillClassesAndFields();
  fillConstraints();
  return parsedData;
}

function initParser(args) {
  if (!args.root || !args.databaseTypes) {
    throw new buildException(
      exceptions.NullPointer,
      'The root object and the database types must be passed.');
  }
  root = args.root;
  databaseTypes = args.databaseTypes;
  noUserManagement = args.noUserManagement || false;
  rawObjects = {
    rawTypesIndexes: [],
    rawEnumsIndexes: [],
    rawClassesIndexes: [],
    rawAssociationsIndexes: [],
    rawValidationRulesIndexes: [],
  };
  parsedData = new ParsedData();
}


function findElements() {
  findElementsInNode(root, []);
}

function findElementsInNode(node, path) {
  for (let i = 0; i < node.packagedElement.length; i++) {
    let element = node.packagedElement[i];
    let indexInfo = {index: i, path: path};
    switch (element.$['xmi:type']) {
    case 'uml:PrimitiveType':
      rawObjects.rawTypesIndexes.push(indexInfo);
      break;
    case 'uml:Enumeration':
      rawObjects.rawEnumsIndexes.push(indexInfo);
      break;
    case 'uml:Class':
      rawObjects.rawClassesIndexes.push(indexInfo);
      break;
    case 'uml:Association':
      rawObjects.rawAssociationsIndexes.push(indexInfo);
      break;
      case 'uml:Package':
        findElementsInNode(element, _.concat(path,i));
        break;
    default:
    }
  }
  findConstraints();
}

function findConstraints() {
  if (!root.ownedRule) {
    return;
  }
  for (let i = 0; i < root.ownedRule.length; i++) {
    let element = root.ownedRule[i];
    if (element.$['xmi:type'] === 'uml:Constraint') {
      rawObjects.rawValidationRulesIndexes.push(i);
    }
  }
}

function fillTypes() {
  for (let i = 0; i < rawObjects.rawTypesIndexes.length; i++) {
    addType(parser_helper.getXmlElementFromRawIndexes(root, rawObjects.rawTypesIndexes[i]));
  }
}

function addType(typeElement) {
  if (!typeElement.$) {
    typeElement = {
      $: {
        'xmi:id': typeElement,
        name: typeElement
      }
    };
  }
  if (!databaseTypes.contains(_.upperFirst(typeElement.$.name))) {
    throw new buildException(
        exceptions.WrongType,
        `The type '${typeElement.$.name}' isn't supported by JHipster.`);
  }
  parsedData.addType(typeElement.$['xmi:id'], {name: _.upperFirst(typeElement.$.name)});
}

function fillEnums() {
  for (let i = 0; i < rawObjects.rawEnumsIndexes.length; i++) {
    addEnum(parser_helper.getXmlElementFromRawIndexes(root, rawObjects.rawEnumsIndexes[i]));
  }
}

function addEnum(enumElement) {
  if (!enumElement.$.name) {
    throw new buildException(
        exceptions.NullPointer, "The enumeration's name can't be null.");
  }
  let values = [];
  if (enumElement.ownedLiteral) {
    values = getEnumValues(enumElement);
  }
  parsedData.addEnum(
    enumElement.$['xmi:id'],
    {name: enumElement.$.name, values: values});
}

function getEnumValues(enumElement) {
  var values = [];
  for (let i = 0; i < enumElement.ownedLiteral.length; i++) {
    let ownedLiteral = enumElement.ownedLiteral[i];
    if (!ownedLiteral.$.name.toUpperCase()) {
      throw new buildException(
          exceptions.NullPointer,
          "An enumeration's value can't be null.");
    }
    values.push(ownedLiteral.$.name.toUpperCase());
  }
  return values;
}

function fillAssociations() {
  for (let i = 0; i < rawObjects.rawAssociationsIndexes.length; i++) {
    addAssociation(parser_helper.getXmlElementFromRawIndexes(root, rawObjects.rawAssociationsIndexes[i]));
  }
}

function addAssociation(associationElement) {
  var associationData = {
    from: associationElement.ownedEnd[0].$.type,
    injectedFieldInTo: associationElement.ownedEnd[0].$.name
  };
  if (!associationElement.ownedEnd[0].lowerValue) {
    associationData.isInjectedFieldInFromRequired = true;
  }
  if (associationElement.ownedEnd[0].upperValue
      && associationElement.ownedEnd[0].upperValue[0].$.value === '*') {
    associationData.type = {
      MANY_TO_ONE: null,
      MANY_TO_MANY: null
    }; // to be determined later
  } else {
    associationData.type = cardinalities.ONE_TO_MANY;
  }
  if (associationElement.ownedEnd[0] && associationElement.ownedEnd[0].ownedComment) {
    associationData.commentInTo = associationElement.ownedEnd[0].ownedComment[0].body[0];
  }
  parsedData.addAssociation(associationElement.$['xmi:id'], associationData);
}

function fillClassesAndFields() {
  for (let i = 0; i < rawObjects.rawClassesIndexes.length; i++) {
    addClassAndFields(parser_helper.getXmlElementFromRawIndexes(root, rawObjects.rawClassesIndexes[i]));
  }
}

function addClassAndFields(classElement) {
  if (!classElement.$.name) {
    throw new buildException(
        exceptions.NullPointer, 'Classes must have a name.');
  }
  checkForUserClass(classElement);
  addClass(classElement);

  if (classElement.ownedAttribute) {
    handleAttributes(classElement);
  }
}

function checkForUserClass(classElement) {
  if (!parsedData.userClassId && classElement.$.name.toLowerCase() === 'user') {
    parsedData.userClassId = classElement.$['xmi:id'];
  }
}

function handleAttributes(classElement) {
  for (let i = 0; i < classElement.ownedAttribute.length; i++) {
    let attribute = classElement.ownedAttribute[i];
    if (!attribute.$.name) {
      throw new buildException(
          exceptions.NullPointer,
          `No name is defined for the passed attribute, for class '${attribute.$.name}'.`);
    }
    if (!parser_helper.isAnId(attribute.$.name)) {
      addField(attribute, classElement.$['xmi:id']);
    }
  }
}

function addClass(classElement) {
  var names = parser_helper.extractClassName(classElement.$.name);
  var classData = {
    name: _.upperFirst(names.entityName),
    tableName: names.tableName
  };
  checkForReservedClassName({
    name: classData.name,
    shouldThrow: true
  });
  if (classData.tableName.toLowerCase() !== 'user'
      || (classData.tableName.toLowerCase() === 'user' && !noUserManagement)) {
    checkForReservedTableName({
      name: classData.tableName,
      databaseTypeName: databaseTypes.getName(),
      shouldThrow: true
    });
  }
  if (classElement.ownedComment && classElement.ownedComment[0].body) {
    classData.comment = classElement.ownedComment[0].body[0];
  }
  parsedData.addClass(classElement.$['xmi:id'], classData);
}

function addField(element, classId) {
  if (element.$.association) {
    completeAssociation(parsedData.getAssociation(element.$.association), element);
  } else {
    addRegularField(element, classId);
  }
}

function addRegularField(element, classId) {
  checkForReservedFieldName({
    name: element.$.name,
    databaseTypeName: databaseTypes.getName(),
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
    var typeName = _.upperFirst(parser_helper.getTypeNameFromURL(element.type[0].$.href));
    addType(typeName, typeName); // id = name
    fieldData.type = typeName;
  }
  if (element.ownedComment && element.ownedComment[0].body) {
    fieldData.comment = element.ownedComment[0].body[0];
  }
  parsedData.addField(classId, element.$['xmi:id'], fieldData);
}

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
  if (element.ownedComment && element.ownedComment[0]) {
    association.commentInFrom = element.ownedComment[0].body[0];
  }
}

function fillConstraints() {
  for (let i = 0; i < rawObjects.rawValidationRulesIndexes.length; i++) {
    addConstraint(root.ownedRule[rawObjects.rawValidationRulesIndexes[i]]);
  }
}

function addConstraint(constraintElement) {
  if (!constraintElement.$.name) {
    throw new buildException(
        exceptions.WrongValidation, 'The validation has no name.');
  }
  var name = constraintElement.$.name;
  var type = parsedData.getType(parsedData.getField(constraintElement.$.constrainedElement).type);
  var enumType = parsedData.getEnum(parsedData.getField(constraintElement.$.constrainedElement).type);

  if ((type && !databaseTypes.isValidationSupportedForType(type.name, name))
      || (enumType && !databaseTypes.isValidationSupportedForType('Enum', name))) {
    throw new buildException(
        exceptions.WrongValidation,
        `The validation '${name}' isn't supported for the type '`
        + `${parsedData.getType(parsedData.getField(constraintElement.$.constrainedElement).type)}'.`);
  }
  // not nil, but ''
  var value = constraintElement.specification[0].$.value;
  parsedData.addValidationToField(
      constraintElement.$.constrainedElement,
      constraintElement.$['xmi:id'],
      {name: name, value: value}
  );
}
