'use strict';

const chalk = require('chalk'),
    _ = require('lodash'),
    merge = require('./utils/object_utils').merge,
    isNoSQL = require('./types/types_helper').isNoSQL,
    autoFixAssociation = require('./helpers/association_helper').autoFixAssociation,
    checkValidityOfAssociation = require('./helpers/association_helper').checkValidityOfAssociation,
    cardinalities = require('./cardinalities'),
    formatComment = require('./helpers/comment_helper').formatComment,
    readJSONFiles = require('./utils/jhipster_utils').readJSONFiles,
    dateFormatForLiquibase = require('./utils/jhipster_utils').dateFormatForLiquibase,
    buildException = require('./exceptions/exception_factory').buildException,
    exceptions = require('./exceptions/exception_factory').exceptions;

const USER = 'user';

let entitiesToSuppress;
let listDTO;
let listPagination;
let listService;
let microserviceNames;
let entities;
let onDiskEntities;
let searchEngines;
let databaseTypes;
let parsedData;
let noUserManagement;
let autoFixModel;

module.exports = {
  /**
   * Keys of options:
   *   - listDTO,
   *   - listPagination,
   *   - listService,
   *   - microserviceNames,
   *   - searchEngines.
   */
  createEntities: createEntities
};

function createEntities(parsedData, databaseTypes, options) {
  const merged = merge(defaults(), options);
  if (!parsedData || !databaseTypes) {
    throw new buildException(
        exceptions.NullPointer,
        'The parsed data and database types are mandatory.');
  }
  init(merged, parsedData, databaseTypes);
  checkNoSQLModeling();
  onDiskEntities = readJSONFiles(parsedData.classNames);
  if(autoFixModel)
  {
    for (let associationId in parsedData.associations) {
      let association = parsedData.associations[associationId];
      autoFixAssociation(
        association,
        parsedData.getClass(association.from).name,
        parsedData.getClass(association.to).name);
    }
  }
  initializeEntities();
  fillEntities();
  return entities;
}

function init(args, passedParsedData, passedDatabaseTypes) {
  entitiesToSuppress = [];
  listDTO = args.listDTO;
  listPagination = args.listPagination;
  listService = args.listService;
  microserviceNames = args.microserviceNames;
  searchEngines = args.searchEngines;
  databaseTypes = passedDatabaseTypes;
  parsedData = passedParsedData;
  entities = {};
  onDiskEntities = {};
  noUserManagement = args.noUserManagement;
  autoFixModel = args.autoFixModel;
}

function checkNoSQLModeling() {
  if (isNoSQL(databaseTypes) && Object.keys(parsedData.associations).length !== 0) {
    throw new buildException(
        exceptions.NoSQLModeling, "NoSQL entities don't have relationships.");
  }
}

function initializeEntities() {
  let index = 0;
  for (let classId in parsedData.classes) {
    if (parsedData.classes.hasOwnProperty(classId)) {
      let initializedEntity = {
        fluentMethods: true,
        relationships: [],
        fields: [],
        changelogDate: getChangelogDate(classId, index),
        dto: parsedData.getClass(classId).dto,
        pagination: parsedData.getClass(classId).pagination,
        service: parsedData.getClass(classId).service,
        microserviceName: parsedData.getClass(classId).microserviceName,
        searchEngine: parsedData.getClass(classId).searchEngine,
        javadoc: formatComment(parsedData.getClass(classId).comment),
        entityTableName: _.snakeCase(parsedData.getClass(classId).tableName)
      };

      initializedEntity =
          setOptions(initializedEntity, parsedData.getClass(classId).name);

      entities[classId] = initializedEntity;
      index++;
    }
  }
}

function getChangelogDate(classId, increment) {
  if (onDiskEntities[parsedData.getClass(classId).name]) {
    return onDiskEntities[parsedData.getClass(classId).name].changelogDate;
  }
  return dateFormatForLiquibase({ increment: increment });
}

function setOptions(entity, entityName) {
  if (listDTO.hasOwnProperty(entityName)) {
    entity.dto = listDTO[entityName];
  }
  if (listPagination.hasOwnProperty(entityName)) {
    entity.pagination = listPagination[entityName];
  }
  if (listService.hasOwnProperty(entityName)) {
    entity.service = listService[entityName];
  }
  if (microserviceNames.hasOwnProperty(entityName)) {
    entity.microserviceName = microserviceNames[entityName];
  }
  if (searchEngines.hasOwnProperty(entityName)) {
    entity.searchEngine = searchEngines[entityName];
  }
  return entity;
}

function defaults() {
  return {
    listDTO: [],
    listPagination: {},
    listService: {},
    microserviceNames: {},
    searchEngines: []
  };
}

function fillEntities() {
  for (let classId in parsedData.classes) {
    if (parsedData.classes.hasOwnProperty(classId)) {
      /*
       * If the user adds a 'User' entity we consider it as the already
       * created JHipster User entity and none of its fields and ownerside
       * relationships will be considered.
       */
      if (parsedData.getClass(classId).name.toLowerCase() === USER && !noUserManagement) {
        console.warn(
          chalk.yellow(
            "Warning:  An Entity called 'User' was defined: 'User' is an" +
            ' entity created by default by JHipster. All relationships toward' +
            ' it will be kept but all attributes and relationships from it' +
            ' will be disregarded.'));
        entitiesToSuppress.push(classId);
      }
      setFieldsOfEntity(classId);
      setRelationshipOfEntity(classId);
    }
  }
  for (let entity in entitiesToSuppress) {
    if (entitiesToSuppress.hasOwnProperty(entity)) {
      delete entities[entitiesToSuppress[entity]];
    }
  }
}

function setFieldsOfEntity(classId) {
  for (let i = 0; i < parsedData.classes[classId].fields.length; i++) {
    let fieldId = parsedData.classes[classId].fields[i];
    let fieldData = {
      fieldName: _.camelCase(parsedData.getField(fieldId).name)
    };
    let comment = formatComment(parsedData.getField(fieldId).comment);
    if (comment) {
      fieldData.comment = comment;
    }

    if (parsedData.types[parsedData.getField(fieldId).type]) {
      fieldData.fieldType = parsedData.getType(parsedData.getField(fieldId).type).name;
    } else if (parsedData.getEnum(parsedData.getField(fieldId).type)) {
      fieldData.fieldType = parsedData.getEnum(parsedData.getField(fieldId).type).name;
      fieldData.fieldValues = parsedData.getEnum(parsedData.getField(fieldId).type).values.join(',');
    }

    switch (fieldData.fieldType) {
    case 'Blob':
    case 'AnyBlob':
      fieldData.fieldType = 'byte[]';
      fieldData.fieldTypeBlobContent = 'any';
      break;
    case 'ImageBlob':
      fieldData.fieldType = 'byte[]';
      fieldData.fieldTypeBlobContent = 'image';
      break;
    case 'TextBlob':
      fieldData.fieldType = 'byte[]';
      fieldData.fieldTypeBlobContent = 'text';
      break;
    default:
    }

    setValidationsOfField(fieldData, fieldId);
    entities[classId].fields.push(fieldData);
  }
}

function setValidationsOfField(field, fieldId) {
  if (parsedData.getField(fieldId).validations.length === 0) {
    return;
  }
  field.fieldValidateRules = [];
  for (let i = 0; i < parsedData.getField(fieldId).validations.length; i++) {
    let validation = parsedData.getValidation(parsedData.getField(fieldId).validations[i]);
    field.fieldValidateRules.push(validation.name);
    if (validation.name !== 'required') {
      field['fieldValidateRules' + _.capitalize(validation.name)] =
          validation.value;
    }
  }
}

function getRelatedAssociations(classId, associations) {
  const relationships = {
    from: [],
    to: []
  };
  for (let associationId in associations) {
    if (associations.hasOwnProperty(associationId)) {
      let association = associations[associationId];
      if (association.from === classId) {
        relationships.from.push(associationId);
      }
      if (association.to === classId && association.injectedFieldInTo) {
        relationships.to.push(associationId);
      }
    }
  }
  return relationships;
}

/**
 * Parses the string "<relationshipName>(<otherEntityField>)"
 * @param{String} field
 * @return{Object} where 'relationshipName' is the relationship name and
 *                'otherEntityField' is the other entity field name
 */
function extractField(field) {
  const splitField = {
    otherEntityField: 'id', // id by default
    relationshipName: ''
  };
  if (field) {
    const chunks = field.replace('(', '/').replace(')', '').split('/');
    splitField.relationshipName = chunks[0];
    if (chunks.length > 1) {
      splitField.otherEntityField = chunks[1];
    }
  }
  return splitField;
}

function setRelationshipOfEntity(classId) {
  const relatedAssociations = getRelatedAssociations(
      classId,
      parsedData.associations);
  setSourceAssociationsForClass(relatedAssociations, classId);
  setDestinationAssociationsForClass(relatedAssociations, classId);
}

function setSourceAssociationsForClass(relatedAssociations, classId) {
  for (let i = 0; i < relatedAssociations.from.length; i++) {
    let otherSplitField;
    let splitField;
    let association = parsedData.getAssociation(relatedAssociations.from[i]);
    checkValidityOfAssociation(
        association,
        parsedData.getClass(association.from).name,
        parsedData.getClass(association.to).name);
    let relationship = {
      relationshipType: association.type
    };
    if (association.isInjectedFieldInToRequired && association.type === cardinalities.ONE_TO_MANY) {
      console.warn(
        chalk.yellow(
          `From ${parsedData.getClass(association.from).name} to ${parsedData.getClass(association.to).name}, a One-to-Many exists and the Many side can't be required. Removing the required flag or use auto-fix option.`));
      association.isInjectedFieldInToRequired = false;
    }
    if (association.isInjectedFieldInFromRequired && association.type === cardinalities.MANY_TO_ONE) {
      console.warn(
        chalk.yellow(
          `From ${parsedData.getClass(association.from).name} to ${parsedData.getClass(association.to).name}, a Many-to-One exists and the Many side can't be required. Removing the required flag or use auto-fix option.`));
      association.isInjectedFieldInFromRequired = false;
    }
    if ((association.isInjectedFieldInToRequired || association.isInjectedFieldInFromRequired) && association.type === cardinalities.MANY_TO_MANY) {
      console.warn(
        chalk.yellow(
          `From ${parsedData.getClass(association.from).name} to ${parsedData.getClass(association.to).name}, a Many-to-Many exists and none of its sides can be required. Removing the required flag.`));
      association.isInjectedFieldInToRequired = false;
      association.isInjectedFieldInFromRequired = false;
    }
    if (association.isInjectedFieldInFromRequired) {
      relationship.relationshipValidateRules = 'required';
    }
    if (association.type === cardinalities.ONE_TO_ONE) {
      splitField = extractField(association.injectedFieldInFrom);
      relationship.relationshipName = _.camelCase(splitField.relationshipName);
      relationship.otherEntityName = _.lowerFirst(_.camelCase(parsedData.getClass(association.to).name));
      relationship.otherEntityField = _.lowerFirst(splitField.otherEntityField);
      relationship.ownerSide = true;
      relationship.otherEntityRelationshipName = _.lowerFirst(association.injectedFieldInTo || parsedData.getClass(association.from).name);
    } else if (association.type === cardinalities.ONE_TO_MANY) {
      splitField = extractField(association.injectedFieldInFrom);
      otherSplitField = extractField(association.injectedFieldInTo);
      relationship.relationshipName = _.lowerFirst(_.camelCase(splitField.relationshipName || parsedData.getClass(association.to).name));
      relationship.otherEntityName = _.lowerFirst(_.camelCase(parsedData.getClass(association.to).name));
      relationship.otherEntityRelationshipName = _.lowerFirst(otherSplitField.relationshipName);
      if (!association.injectedFieldInTo) {
        relationship.otherEntityRelationshipName = _.lowerFirst(parsedData.getClass(association.from).name);
        otherSplitField = extractField(association.injectedFieldInTo);
        let otherSideRelationship = {
          relationshipName: _.camelCase(_.lowerFirst(parsedData.getClass(association.from).name)),
          otherEntityName: _.lowerFirst(_.camelCase(parsedData.getClass(association.from).name)),
          relationshipType: cardinalities.MANY_TO_ONE,
          otherEntityField: _.lowerFirst(otherSplitField.otherEntityField)
        };
        association.type = cardinalities.MANY_TO_ONE;
        entities[association.to].relationships.push(otherSideRelationship);
      }
    } else if (association.type === cardinalities.MANY_TO_ONE && association.injectedFieldInFrom) {
      splitField = extractField(association.injectedFieldInFrom);
      relationship.relationshipName = _.camelCase(splitField.relationshipName);
      relationship.otherEntityName = _.lowerFirst(_.camelCase(parsedData.getClass(association.to).name));
      relationship.otherEntityField = _.lowerFirst(splitField.otherEntityField);
    } else if (association.type === cardinalities.MANY_TO_MANY) {
      splitField = extractField(association.injectedFieldInFrom);
      relationship.otherEntityRelationshipName = _.lowerFirst(extractField(association.injectedFieldInTo).relationshipName);
      relationship.relationshipName = _.camelCase(splitField.relationshipName);
      relationship.otherEntityName = _.lowerFirst(_.camelCase(parsedData.getClass(association.to).name));
      relationship.otherEntityField = _.lowerFirst(splitField.otherEntityField);
      relationship.ownerSide = true;
    }
    entities[classId].relationships.push(relationship);
  }
}

function setDestinationAssociationsForClass(relatedAssociations, classId) {
  for (let i = 0; i < relatedAssociations.to.length; i++) {
    let splitField;
    let otherSplitField;
    let association = parsedData.getAssociation(relatedAssociations.to[i]);
    let relationship = {
      relationshipType: (association.type === cardinalities.ONE_TO_MANY ? cardinalities.MANY_TO_ONE : association.type)
    };
    if (association.isInjectedFieldInToRequired) {
      relationship.relationshipValidateRules = 'required';
    }
    if (association.type === cardinalities.ONE_TO_ONE) {
      splitField = extractField(association.injectedFieldInTo);
      otherSplitField = extractField(association.injectedFieldInFrom);
      relationship.relationshipName = _.camelCase(splitField.relationshipName);
      relationship.otherEntityName = _.lowerFirst(_.camelCase(parsedData.getClass(association.from).name));
      relationship.ownerSide = false;
      relationship.otherEntityRelationshipName = _.lowerFirst(otherSplitField.relationshipName);
    } else if (association.type === cardinalities.ONE_TO_MANY) {
      association.injectedFieldInTo = association.injectedFieldInTo || _.lowerFirst(association.from);
      splitField = extractField(association.injectedFieldInTo);
      relationship.relationshipName = _.lowerFirst(_.camelCase(splitField.relationshipName || parsedData.getClass(association.from).name));
      relationship.otherEntityName = _.lowerFirst(_.camelCase(parsedData.getClass(association.from).name));
      relationship.otherEntityField = _.lowerFirst(splitField.otherEntityField);
    } else if (association.type === cardinalities.MANY_TO_ONE && association.injectedFieldInTo) {
      splitField = extractField(association.injectedFieldInTo);
      relationship.relationshipName = _.camelCase(splitField.relationshipName);
      relationship.otherEntityName = _.lowerFirst(_.camelCase(parsedData.getClass(association.from).name));
      relationship.otherEntityField = _.lowerFirst(splitField.otherEntityField);
    } else if (association.type === cardinalities.MANY_TO_MANY) {
      splitField = extractField(association.injectedFieldInTo);
      relationship.relationshipName = _.camelCase(splitField.relationshipName);
      relationship.otherEntityName = _.lowerFirst(_.camelCase(parsedData.getClass(association.from).name));
      relationship.ownerSide = false;
      relationship.otherEntityRelationshipName = _.lowerFirst(extractField(association.injectedFieldInFrom).relationshipName);
    }
    entities[classId].relationships.push(relationship);
  }
}
