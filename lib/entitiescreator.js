'use strict';

var chalk = require('chalk'),
    fs = require('fs'),
    _s = require('underscore.string'),
    areJHipsterEntitiesEqual = require('./helpers/object_helper').areJHipsterEntitiesEqual,
    types_helper = require('./types/types_helper'),
    association_helper = require('./helpers/association_helper'),
    cardinalities = require('./cardinalities'),
    formatComment = require('./helpers/comment_helper'),
    NullPointerException = require('./exceptions/null_pointer_exception'),
    NoSQLModelingException = require('./exceptions/no_sql_modeling_exception');


var EntitiesCreator = module.exports = function(parsedData, databaseTypes, listDTO, listPagination, listService) {
  if (!parsedData) {
    throw new NullPointerException('There is no parsed data.');
  }

  this.USER = 'User';
  this.entitiesToSuppress = [];

  //the option list
  this.listDTO = listDTO;
  this.listPagination = listPagination;
  this.listService = listService;
  this.databaseTypes = databaseTypes;

  this.parsedData = parsedData;

  this.checkNoSQLModeling();

  this.entities = {};
  // cache for the the entities read on the disk
  this.onDiskEntities = {};
};

EntitiesCreator.prototype.getEntities = function() {
  return this.entities;
};

EntitiesCreator.prototype.createEntities = function() {
  this.initializeEntities();

  Object.keys(this.parsedData.classes).forEach(function(classId) {

    /*
     * If the user adds a 'User' entity we consider it as the already
     * created JHipster User entity and none of its fields and ownerside
     * relationships will be considered.
     */
    if (this.parsedData.getClass(classId).name.toLowerCase() === this.USER.toLowerCase()) {
      console.warn(
        chalk.yellow(
          "Warning:  An Entity called 'User' was defined: 'User' is an" +
          ' entity created by default by JHipster. All relationships toward' +
          ' it will be kept but all attributes and relationships from it' +
          ' will be disregarded.'));
      this.entitiesToSuppress.push(classId);
    }
    this.setFieldsOfEntity(classId);
    this.setRelationshipOfEntity(classId);
  },this);

  this.entitiesToSuppress.forEach(function(entity) {
    delete this.entities[entity];
  }, this);
};

/**
 * Initialize all Entities with default values
 */
EntitiesCreator.prototype.initializeEntities = function() {
  this.onDiskEntities = this.readJSON(Object.keys(this.parsedData.classes));

  Object.keys(this.parsedData.classes).forEach(function(classId, index) {
    var initializedEntity = {
      relationships: [],
      fields: [],
      changelogDate: this.getChangelogDate(classId, index),
      dto: this.parsedData.getClass(classId).dto,
      pagination: this.parsedData.getClass(classId).pagination,
      service: this.parsedData.getClass(classId).service,
      javadoc: formatComment(this.parsedData.getClass(classId).comment)
    };

    initializedEntity = this.setDTO(
      initializedEntity,
      this.parsedData.getClass(classId).name);
    initializedEntity = this.setPagination(
      initializedEntity,
      this.parsedData.getClass(classId).name);
    initializedEntity = this.setService(
      initializedEntity,
      this.parsedData.getClass(classId).name);

    this.entities[classId] = initializedEntity;
  }, this);
};

/**
 * If the entity already have a json file we get the changelogDate in it
 * else we create the changelogDate with liquibase date format
 * @param{String} classId  the id of the class to set the changelogDate property
 * @param{Integer} increment the optional increment in the timestamp?
 * @return the date on liquibase format
 */
EntitiesCreator.prototype.getChangelogDate = function(classId, increment) {
  if (this.onDiskEntities[classId]) {
    return this.onDiskEntities[classId].changelogDate;
  }
  return dateFormatForLiquibase(increment);
};

/**
 * fill the fields of the current entity
 * param{String} classId the id of the current entity
 */
EntitiesCreator.prototype.setFieldsOfEntity = function(classId) {
  this.parsedData.classes[classId].fields.forEach(function(fieldId) {
    var fieldData = {
      fieldId: this.entities[classId].fields.length + 1,
      fieldName: _s.camelize(this.parsedData.getField(fieldId).name),
      javadoc: formatComment(this.parsedData.getField(fieldId).comment)
    };

    if (this.parsedData.types[this.parsedData.getField(fieldId).type]) {
      fieldData.fieldType = this.parsedData.getType(this.parsedData.getField(fieldId).type).name;
    } else if (this.parsedData.getEnum(this.parsedData.getField(fieldId).type)) {
      fieldData.fieldType = this.parsedData.getEnum(this.parsedData.getField(fieldId).type).name;
      fieldData.fieldValues = this.parsedData.getEnum(this.parsedData.getField(fieldId).type).values.join(',');
    }

    if (fieldData.fieldType === 'ImageBlob') {
      fieldData.fieldType = 'byte[]';
      fieldData.fieldTypeBlobContent = 'image';
    } else if (fieldData.fieldType === 'Blob' || fieldData.fieldType === 'AnyBlob') {
      fieldData.fieldType = 'byte[]';
      fieldData.fieldTypeBlobContent = 'any';
    }

    this.setValidationsOfField(fieldData, fieldId);
    this.entities[classId].fields.push(fieldData);
  }, this);
};

/**
 * Gets a fields and adds the related validations.
 * @param {Object} field the field.
 * @param {String} fieldId the field's id.
 */
EntitiesCreator.prototype.setValidationsOfField = function(field, fieldId) {
  if (this.parsedData.getField(fieldId).validations.length === 0) {
    return;
  }
  field.fieldValidateRules = [];

  this.parsedData.getField(fieldId).validations.forEach(function(validationId) {
    var validation = this.parsedData.getValidation(validationId);
    field.fieldValidateRules.push(validation.name);
    if(validation.name !== 'required') {
      field['fieldValidateRules' + _s.capitalize(validation.name)] =
        validation.value;
    }
  }, this);

};

function getRelatedAssociations(classId, associationIds, associations) {
  var relationships = {
    from: [],
    to: []
  };
  associationIds.forEach(function(associationId) {
    var association = associations[associationId];
    if (association.from === classId) {
      relationships.from.push(associationId);
    }
    if (association.to === classId && association.injectedFieldInTo) {
      relationships.to.push(associationId);
    }
  }, this);
  return relationships;
}

/**
 * Parses the string "<relationshipName>(<otherEntityField>)"
 * @param{String} field
 * @return{Object} where 'relationshipName' is the relationship name and
 *                'otherEntityField' is the other entity field name
 */
function extractField(field) {
  var splitField = {
    otherEntityField: 'id', // id by default
    relationshipName: ''
  };
  if (field) {
    var chunks = field.replace('(', '/').replace(')', '').split('/');
    splitField.relationshipName = chunks[0];
    if (chunks.length > 1) {
      splitField.otherEntityField = chunks[1];
    }
  }
  return splitField;
}

EntitiesCreator.prototype.setRelationshipOfEntity = function(classId) {
  var associations = getRelatedAssociations(
    classId,
    Object.keys(this.parsedData.associations),
    this.parsedData.associations);
  associations.from.forEach(function(associationId) {
    var otherSplitField;
    var relationship;
    var splitField;
    var association = this.parsedData.getAssociation(associationId);
    association_helper.checkValidityOfAssociation(association);
    if (association.type === cardinalities.ONE_TO_ONE) {
      splitField = extractField(association.injectedFieldInFrom);
      relationship = {
        relationshipId: this.entities[classId].relationships.length + 1,
        relationshipName: _s.camelize(splitField.relationshipName),
        otherEntityName: _s.decapitalize(_s.camelize(this.parsedData.getClass(association.to).name)),
        relationshipType: association.type,
        otherEntityField: _s.decapitalize(splitField.otherEntityField),
        ownerSide: true,
        otherEntityRelationshipName: _s.decapitalize(association.injectedFieldInTo || this.parsedData.getClass(association.from).name)
      };
      this.entities[classId].relationships.push(relationship);
    } else if (association.type === cardinalities.ONE_TO_MANY) {
      splitField = extractField(association.injectedFieldInFrom);
      otherSplitField = extractField(association.injectedFieldInTo);
      relationship = {
        relationshipId: this.entities[classId].relationships.length + 1,
        relationshipName: _s.decapitalize(_s.camelize(splitField.relationshipName || this.parsedData.getClass(association.to).name)),
        otherEntityName: _s.decapitalize(_s.camelize(this.parsedData.getClass(association.to).name)),
        relationshipType: association.type,
        otherEntityRelationshipName: _s.decapitalize(otherSplitField.relationshipName)
      };
      if (!association.injectedFieldInTo) {
        relationship.otherEntityRelationshipName = _s.decapitalize(this.parsedData.getClass(association.from).name);
        otherSplitField = extractField(association.injectedFieldInTo);
        var otherSideRelationship = {
          relationshipId: this.entities[association.to].relationships.length + 1,
          relationshipName: _s.camelize(_s.decapitalize(this.parsedData.getClass(association.from).name)),
          otherEntityName: _s.decapitalize(_s.camelize(this.parsedData.getClass(association.from).name)),
          relationshipType: cardinalities.MANY_TO_ONE,
          otherEntityField: _s.decapitalize(otherSplitField.otherEntityField)
        };
        this.entities[association.to].relationships.push(otherSideRelationship);
      }
      this.entities[classId].relationships.push(relationship);
    } else if (association.type === cardinalities.MANY_TO_ONE && association.injectedFieldInFrom) {
      splitField = extractField(association.injectedFieldInFrom);
      relationship = {
        relationshipId: this.entities[classId].relationships.length + 1,
        relationshipName: _s.camelize(splitField.relationshipName),
        otherEntityName: _s.decapitalize(_s.camelize(this.parsedData.getClass(association.to).name)),
        relationshipType: association.type,
        otherEntityField: _s.decapitalize(splitField.otherEntityField)
      };
      this.entities[classId].relationships.push(relationship);
    } else  if (association.type === cardinalities.MANY_TO_MANY) {
      splitField = extractField(association.injectedFieldInFrom);
      relationship = {
        relationshipId: this.entities[classId].relationships.length + 1,
        relationshipName: _s.camelize(splitField.relationshipName),
        otherEntityName: _s.decapitalize(_s.camelize(this.parsedData.getClass(association.to).name)),
        relationshipType: association.type,
        otherEntityField: _s.decapitalize(splitField.otherEntityField),
        ownerSide: true
      };
      this.entities[classId].relationships.push(relationship);
    }
  }, this);
  associations.to.forEach(function(associationId) {
    var relationship;
    var splitField;
    var association = this.parsedData.getAssociation(associationId);
    if (association.type === cardinalities.ONE_TO_ONE) {
      splitField = extractField(association.injectedFieldInTo);
      relationship = {
        relationshipId: this.entities[classId].relationships.length + 1,
        relationshipName: _s.camelize(splitField.relationshipName),
        otherEntityName: _s.decapitalize(_s.camelize(this.parsedData.getClass(association.from).name)),
        relationshipType: association.type,
        ownerSide: false,
        otherEntityRelationshipName: _s.decapitalize(association.injectedFieldInFrom)
      };
      this.entities[classId].relationships.push(relationship);
    } else if (association.type === cardinalities.ONE_TO_MANY) {
      association.injectedFieldInTo = association.injectedFieldInTo || _s.decapitalize(association.from);
      splitField = extractField(association.injectedFieldInTo);
      relationship = {
        relationshipId: this.entities[classId].relationships.length + 1,
        relationshipName: _s.decapitalize(_s.camelize(splitField.relationshipName || this.parsedData.getClass(association.from).name)),
        otherEntityName: _s.decapitalize(_s.camelize(this.parsedData.getClass(association.from).name)),
        relationshipType: cardinalities.MANY_TO_ONE,
        otherEntityField: _s.decapitalize(splitField.otherEntityField)
      };
      this.entities[classId].relationships.push(relationship);
    } else if (association.type === cardinalities.MANY_TO_ONE && association.injectedFieldInTo) {
      splitField = extractField(association.injectedFieldInTo);
      relationship = {
        relationshipId: this.entities[classId].relationships.length + 1,
        relationshipName: _s.camelize(splitField.relationshipName),
        otherEntityName: _s.decapitalize(_s.camelize(this.parsedData.getClass(association.from).name)),
        relationshipType: association.type,
        otherEntityField: _s.decapitalize(splitField.otherEntityField)
      };
      this.entities[classId].relationships.push(relationship);
    } else if (association.type === cardinalities.MANY_TO_MANY) {
      splitField = extractField(association.injectedFieldInTo);
      relationship = {
        relationshipId: this.entities[classId].relationships.length + 1,
        relationshipName: _s.camelize(splitField.relationshipName),
        otherEntityName: _s.decapitalize(_s.camelize(this.parsedData.getClass(association.from).name)),
        relationshipType: association.type,
        ownerSide: false,
        otherEntityRelationshipName: _s.decapitalize(extractField(association.injectedFieldInFrom).relationshipName)
      };
      this.entities[classId].relationships.push(relationship);
    }
  }, this);
};

/**
 * For each class in classesToRead, reads the corresponding JSON in .jhipster.
 * @param{array} classesToRead all the classes we want to read.
 * @return {object} the read entities.
 */
EntitiesCreator.prototype.readJSON = function(classesToRead) {
  var entitiesRead = {};
  classesToRead.forEach(function(classToRead) {
    var file = '.jhipster/' + this.parsedData.getClass(classToRead).name + '.json';

    if (this.onDiskEntities[classToRead]) {
      entitiesRead[classToRead] = this.onDiskEntities[classToRead];
    } else if(fs.existsSync(file)) {
      entitiesRead[classToRead] = JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  }, this);
  return entitiesRead;
};

/**
 * @param{Array} classList  the classes we want to create a JSON for
 * Write a JSON file for each entity in classList in the .jhipster folder
 */
EntitiesCreator.prototype.writeJSON = function(classList) {
  if (!fs.existsSync('.jhipster')) {
    fs.mkdirSync('.jhipster');
  }

  for (var k in this.entities) {
    if (this.entities.hasOwnProperty(k) && classList.indexOf(k) !== -1) {
      var file = '.jhipster/' + this.parsedData.getClass(k).name + '.json';
      fs.writeFileSync(file, JSON.stringify(this.entities[k], null, '  '));
    }
  }
};

/**
 * Removes all unchanged entities.
 * @param {Array} entities all the entities to filter.
 * @returns {Array} the changed entities.
 */
EntitiesCreator.prototype.filterOutUnchangedEntities = function(entities) {
  var onDiskEntities = this.readJSON(entities);
  return entities.filter(function(id) {
    var currEntity = onDiskEntities[id];
    var newEntity = this.entities[id];
    if (!currEntity) {
      return true;
    }
    return !areJHipsterEntitiesEqual(currEntity, newEntity);
  }, this);
};

/*
 * Throws an error if the user declared relationships when using a NoSQL database
 */
EntitiesCreator.prototype.checkNoSQLModeling = function() {
  if(types_helper.isNoSQL(this.databaseTypes)
      && Object.keys(this.parsedData.associations).length !== 0) {
    throw new NoSQLModelingException(
      'While using a NoSQL database do not create relationships between entities, exiting now.');
  }
};

/*
 * @param {Object} entity the initialized entity
 * @param {Object} entityName the name of the entity
 * @return {Object} the entity with the 'dto' property set according to listDTO.
 */
EntitiesCreator.prototype.setDTO = function(entity, entityName) {
  if (this.listDTO.indexOf(entityName) !== -1) {
    entity.dto = 'mapstruct';
  }
  return entity;
};

/*
 * @param {Object} entity the initialized entity
 * @param {Object} entityName the name of the entity
 * @return {Object} the entity with the 'pagination' property set according
 *                  to listPagination.
 */
EntitiesCreator.prototype.setPagination = function(entity, entityName) {
  if (this.listPagination.hasOwnProperty(entityName)) {
    entity.pagination = this.listPagination[entityName];
  }
  return entity;
};

EntitiesCreator.prototype.setService = function(entity, entityName) {
  if (this.listService.hasOwnProperty(entityName)) {
    entity.service = this.listService[entityName];
  }
  return entity;
};

/**
 * Gets the classes.
 * @return {Object} the classes.
 */
EntitiesCreator.prototype.getClasses = function() {
  return this.parsedData.classes;
};

/**
 * Gets the (regular) fields.
 * @return {Object} the (regular) fields.
 */
EntitiesCreator.prototype.getFields = function() {
  return this.parsedData.fields;
};

/**
 * Gets the associations.
 * @return {Object} the associations.
 */
EntitiesCreator.prototype.getAssociations = function() {
  return this.parsedData.associations;
};

/**
 * Gets the primitives types.
 * @return {Object} the associations.
 */
EntitiesCreator.prototype.getPrimitiveTypes = function() {
  return this.parsedData.types;
};

/**
 * Gets the entities.
 * @return {Object} the entities.
 */
EntitiesCreator.prototype.getEntities = function() {
  return this.entities;
};

function dateFormatForLiquibase(increment) {
  var now = new Date();
  var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
  var year = '' + now_utc.getFullYear();
  var month = '' + (now_utc.getMonth() + 1);
  if (month.length === 1) {
    month = '0' + month;
  }
  var day = '' + now_utc.getDate();
  if (day.length === 1) {
    day = '0' + day;
  }
  var hour = '' + now_utc.getHours();
  if (hour.length === 1) {
    hour = '0' + hour;
  }
  var minute = '' + now_utc.getMinutes();
  if (minute.length === 1) {
    minute = '0' + minute;
  }
  var second = '' + (now_utc.getSeconds() + increment) % 60;
  if (second.length === 1) {
    second = '0' + second;
  }
  return year + '' + month + '' + day + '' + hour + '' + minute + '' + second;
}
