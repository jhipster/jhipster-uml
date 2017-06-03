/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://jhipster.github.io/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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

let root;
let databaseTypes;
let rawObjects;
let parsedData;
let noUserManagement;

module.exports = {
  parse: parse
};

function parse(args) {
  initParser(args);
  findElements();
  fillTypes();
  fillEnums();
  fillClassesAndFields();
  fillAssociations();
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
    rawAssociationsIndexes: []
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
    case 'uml:DataType':
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
      findElementsInNode(element, _.concat(path, i));
      break;
    default:
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
  const values = [];
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

function fillClassesAndFields() {
  for (let i = 0; i < rawObjects.rawClassesIndexes.length; i++) {
    addClassAndFields(parser_helper.getXmlElementFromRawIndexes(root, rawObjects.rawClassesIndexes[i]));
  }
}

function addClassAndFields(classElement) {
  if (!classElement.$.name) {
    throw new buildException(exceptions.NullPointer, 'Classes must have a name.');
  }
  checkForUserClass(classElement);
  addClass(classElement);

  if (classElement.ownedAttribute) {
    handleAttributes(classElement);
  }
}

function checkForUserClass(element) {
  if (!parsedData.userClassId && element.$.name.toLowerCase() === 'user') {
    parsedData.userClassId = element.$['xmi:id'];
  }
}

function addClass(element) {
  const names = parser_helper.extractClassName(element.$.name);
  const classData = {
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
  if (element.ownedComment && element.ownedComment[0].body) {
    classData.comment = element.ownedComment[0].body[0];
  }
  parsedData.addClass(element.$['xmi:id'], classData);
}

function handleAttributes(element) {
  for (let i = 0; i < element.ownedAttribute.length; i++) {
    let attribute = element.ownedAttribute[i];
    if (!attribute.$.name) {
      throw new buildException(
        exceptions.NullPointer,
        `No name is defined for the passed attribute, for class '${element.$.name}'.`);
    }
    if (!parser_helper.isAnId(attribute.$.name)) {
      addField(attribute, element.$['xmi:id']);
    }
  }
}

function addField(element, classId) {
  addRegularField(element, classId);
}

function addRegularField(element, classId) {
  checkForReservedFieldName({
    name: element.$.name,
    databaseTypeName: databaseTypes.getName(),
    shouldThrow: true
  });
  const fieldData = {name: _.lowerFirst(element.$.name)};

  if (element.$.type) {
    fieldData.type = element.$.type;
  } else if (!element.type) {
    throw new buildException(
      exceptions.WrongField,
      `The field '${element.$.name}' does not possess any type.`);
  } else {
    const typeName =
      _.upperFirst(parser_helper.getTypeNameFromURL(element.type[0].$.href));
    addType(typeName, typeName); // id = name
    fieldData.type = typeName;
  }

  if (element.ownedComment && element.ownedComment[0].body) {
    fieldData.comment = element.ownedComment[0].body[0];
  }

  parsedData.addField(classId, element.$['xmi:id'], fieldData);
}

function fillAssociations() {
  for (let i = 0; i < rawObjects.rawAssociationsIndexes.length; i++) {
    addAssociation(parser_helper.getXmlElementFromRawIndexes(root, rawObjects.rawAssociationsIndexes[i]));
  }
}

function addAssociation(associationElement) {
  const associationData = getAssociationEnds(associationElement);
  associationData.type = getAssociationType(associationElement);
  const comments = getAssociationComments(associationElement);
  associationData.commentInFrom = comments.commentInFrom;
  associationData.commentInTo = comments.commentInTo;
  parsedData.addAssociation(associationElement.$['xmi:id'], associationData);
}

function getAssociationEnds(association) {
  const data = {
    from: association.ownedEnd[0].$.type,
    to: association.ownedEnd[1].$.type,
    injectedFieldInFrom: association.ownedEnd[1].$.name,
    injectedFieldInTo: association.ownedEnd[0].$.name
  };
  if (association.ownedEnd[0].lowerValue[0].$.value !== '0' && association.ownedEnd[0].lowerValue[0].$.value !== undefined) {
    data.isInjectedFieldInToRequired = true;
  }
  if (association.ownedEnd[1].lowerValue[0].$.value !== '0' && association.ownedEnd[1].lowerValue[0].$.value !== undefined) {
    data.isInjectedFieldInFromRequired = true;
  }
  return data;
}

function getAssociationType(association) {
  if (association.ownedEnd[1].upperValue[0].$.value === '*'
    && association.ownedEnd[0].upperValue[0].$.value === '*') {
    return cardinalities.MANY_TO_MANY;
  } else if (association.ownedEnd[1].upperValue[0].$.value === '*'
    && association.ownedEnd[0].upperValue[0].$.value !== '*') {
    return cardinalities.ONE_TO_MANY;
  } else if (association.ownedEnd[1].upperValue[0].$.value !== '*'
    && association.ownedEnd[0].upperValue[0].$.value === '*') {
    return cardinalities.MANY_TO_ONE;
  }
  return cardinalities.ONE_TO_ONE;
}

function getAssociationComments(association) {
  const comments = {
    commentInFrom: '',
    commentInTo: ''
  };
  if (association.ownedComment && association.ownedComment[0].body) {
    comments.commentInFrom = association.ownedComment[0].body[0];
    comments.commentInTo = comments.commentInFrom;
  }
  return comments;
}
