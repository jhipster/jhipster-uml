'use strict';

var chalk = require('chalk'),
    fs = require('fs'),
    _s = require('underscore.string'),
    _  = require('underscore'),
    types_helper = require('./types/types_helper'),
    cardinalities = require('./cardinalities'),
    formatComment = require('./helper/comment_helper');

var EntitiesCreator = module.exports =
  function(parsedData, databaseTypes, listDTO, listPagination) {
  if(!parsedData) {
    throw new NullArgumentException('There is no parsed data.');
  }

  this.USER = 'User';
  this.entitiesToSuppress = [];

  //the option list
  this.listDTO = listDTO;
  this.listPagination = listPagination;
  //
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
  for (var i in Object.keys(this.parsedData.classes)){
    if (Object.keys(this.parsedData.classes).hasOwnProperty(i)) {
      var classId= Object.keys(this.parsedData.classes)[i];

      /**
       * If the user add a 'User' entity we consider it as the already
       * created JHipster User entity thus none of its fields and ownerside
       * relationships will be considered.
       */
      if(this.parsedData.getClass(classId).name.toLowerCase() === this.USER.toLowerCase()){
        console.warn(
          chalk.yellow(
            "Warning:  An Entity called \'User\' was defined: \'User\' is an" +
            " entity created by default by JHipster. All relationships toward" +
            " it will be kept but all attributes and relationships from it" +
            " will be disregarded."));
        this.entitiesToSuppress.push(classId);
      }

      this.setFieldsOfEntity(classId);
      this.setRelationshipOfEntity(classId);
    }
  }
  for(var j=0; j<this.entitiesToSuppress.length; j++){
    delete this.entities[this.entitiesToSuppress[j]];
  }
};


/**
 * Initialize all Entities with default values
 */
EntitiesCreator.prototype.initializeEntities = function() {
 this.onDiskEntities = this.readJSON(Object.keys(this.parsedData.classes));
  for(var i in Object.keys(this.parsedData.classes)){
    if (Object.keys(this.parsedData.classes).hasOwnProperty(i)) {
      var classId = Object.keys(this.parsedData.classes)[i];
      var initializedEntity={
        relationships : [],
        fields : [],
        changelogDate: this.getChangelogDate(classId),
        dto: "no",
        pagination: (this.onDiskEntities[classId] !== undefined ) ? this.onDiskEntities[classId].pagination : "no",
        javadoc: formatComment(this.parsedData.getClass(classId).comment)
      };

      initializedEntity = this.setDTO(
        initializedEntity,
        this.parsedData.getClass(classId).name);
      initializedEntity = this.setPagination(
        initializedEntity,
        this.parsedData.getClass(classId).name);

      this.entities[classId] = initializedEntity;
    }
  }
};

/**
 * fill the fields of the current entity
 * param{String} classId the id of the current entity
 */
EntitiesCreator.prototype.setFieldsOfEntity = function(classId) {
  for(var i = 0; i < this.parsedData.classes[classId].fields.length; i++) {
    var fieldId = this.parsedData.getClass(classId).fields[i];

    var field = {
      fieldId: this.entities[classId].fields.length+1,
      fieldName: lowerCase(this.parsedData.getField(fieldId).name),
      javadoc: formatComment(this.parsedData.getField(fieldId).comment)
    };

    if (this.parsedData.types[this.parsedData.getField(fieldId).type]) {
      field.fieldType = this.parsedData.getType(this.parsedData.getField(fieldId).type).name;
    } else if (this.parsedData.getEnum(this.parsedData.getField(fieldId).type)) {
      field.fieldType = this.parsedData.getEnum(this.parsedData.getField(fieldId).type).name;
      field.fieldValues = this.parsedData.getEnum(this.parsedData.getField(fieldId).type).values.join(',');
    }

    if (field.fieldType === 'ImageBlob') {
      field.fieldType = 'byte[]';
      field.fieldTypeBlobContent = 'image';
    } else if (field.fieldType === 'Blob' || field.fieldType === 'AnyBlob') {
      field.fieldType = 'byte[]';
      field.fieldTypeBlobContent = 'any';
    }

    this.setValidationsOfField(field, fieldId);
    this.setPropertyOfEntity(field.fieldType, classId);
    this.entities[classId].fields.push(field);
  }
};

/**
 * Set the entity's properties about the type
 * like "fieldsContainLocalDate", "fieldsContainBigDecimal", ...
 * param {String} fieldType  the type of the fields
 * param {String} classId the id of the current entity
 */
EntitiesCreator.prototype.setPropertyOfEntity = function(fieldType, classId) {
  switch(fieldType){
    case 'DateTime':
      this.entities[classId].fieldsContainDateTime = true;
      this.entities[classId].fieldsContainCustomTime = true;
      break;
    case 'LocalDate':
      this.entities[classId].fieldsContainLocalDate = true;
      this.entities[classId].fieldsContainCustomTime = true;
      break;
    case 'BigDecimal':
      this.entities[classId].fieldsContainBigDecimal = true;
      break;
    case 'Date':
      this.entities[classId].fieldsContainDate = true;
      this.entities[classId].fieldsContainCustomTime = true;
      break;
    case 'byte[]':
      this.entities[classId].fieldsContainBlob = true;
      break;
    default:
  }
};

/**
 * get a field, add the related validations and return it.
 * @param{field}
 * @param{fieldId}
 * @return the field with the validations
 */
EntitiesCreator.prototype.setValidationsOfField = function(field, fieldId) {
  if (Object.keys(this.parsedData.fields[fieldId].validations).length === 0) {
    return;
  }
  field.fieldValidateRules=[];

  for(var j in this.parsedData.getField(fieldId).validations){
    if (this.parsedData.getField(fieldId).validations.hasOwnProperty(j)) {
      var validationName= j;
      field.fieldValidateRules.push(validationName);

      if(validationName !== "required"){
        field["fieldValidateRules"+_s.capitalize(validationName)] = this.parsedData.getField(fieldId).validations[j];
      }
    }
  }
};

/**
 * fill the relationship of the current entity and also relationship of the
 * entity on the other side of the association
 */
EntitiesCreator.prototype.setRelationshipOfEntity = function(classId) {
 for(var k in this.parsedData.getClass(classId).injectedFields) {
    if (this.parsedData.getClass(classId).injectedFields.hasOwnProperty(k)) {
      var injectId = this.parsedData.getClass(classId).injectedFields[k];

      if (this.parsedData.getClass(classId).name.toLowerCase() === this.USER.toLowerCase()) {
        continue;
      }

      //// We don't add a relation when it comes from a
      //// User entity or others entities with a forbidden name
      //if(this.entitiesToSuppress.indexOf(this.injectedFields[injectId].type) !== -1
      //  || this.entitiesToSuppress.indexOf(this.classes[classId].name) !== -1){
      //  continue;
      //}

      var relationshipName = this.splitField(this.parsedData.getInjectedField(injectId).name).relationshipName;
      // fill the ownerSide relationship
      var relationshipOwnerSide = {
        relationshipId: this.entities[classId].relationships.length + 1,
        relationshipName: lowerCase(relationshipName),
        relationshipFieldName: relationshipName,
        otherEntityName: lowerCase(this.parsedData.getClass(this.parsedData.getInjectedField(injectId).type).name),
        relationshipType: this.parsedData.getInjectedField(injectId).cardinality,
        javadoc: formatComment(this.parsedData.getInjectedField(injectId).comment)
      };

      // fill the relationship on the other side of the association
      // according to the relationType
      var relationshipOtherSide = {
        relationshipId : this.entities[this.parsedData.getInjectedField(injectId).type].relationships.length + 1,
        relationshipName: this.getAssociationFieldName(this.parsedData.getInjectedField(injectId).association, lowerCase),
        relationshipFieldName: this.getAssociationFieldName(this.parsedData.getInjectedField(injectId).association, lowerCase),
        otherEntityName: lowerCase(this.parsedData.getClass(this.parsedData.getAssociation(this.parsedData.getInjectedField(injectId).association).type).name)
      };

      switch(relationshipOwnerSide.relationshipType) {
        case cardinalities.ONE_TO_ONE:
          relationshipOwnerSide.otherEntityRelationshipName = relationshipOtherSide.relationshipName;
          relationshipOwnerSide.otherEntityField = this.splitField(this.parsedData.getInjectedField(injectId).name).otherEntityField;
          relationshipOwnerSide.ownerSide = true;

          relationshipOtherSide.relationshipType = cardinalities.ONE_TO_ONE;
          relationshipOtherSide.ownerSide = false;
          relationshipOtherSide.otherEntityRelationshipName = relationshipOwnerSide.relationshipFieldName;
          break;
        case cardinalities.ONE_TO_MANY:
          relationshipOtherSide.relationshipType = cardinalities.MANY_TO_ONE;
          relationshipOtherSide.otherEntityField = this.getOtherEntityField(this.parsedData.getInjectedField(injectId).association);//By default set at 'id'
          relationshipOwnerSide.otherEntityRelationshipName = relationshipOtherSide.relationshipFieldName;
          break;
        case cardinalities.MANY_TO_MANY:
          relationshipOwnerSide.otherEntityField = this.splitField(this.parsedData.getInjectedField(injectId).name).otherEntityField;
          relationshipOwnerSide.ownerSide = true;

          relationshipOtherSide.relationshipType = cardinalities.MANY_TO_MANY;
          relationshipOtherSide.ownerSide = false;
          relationshipOtherSide.otherEntityRelationshipName = relationshipOwnerSide.relationshipFieldName;
          break;
        default:
      }

      if (classId === this.parsedData.injectedFields[injectId].type) {
        relationshipOtherSide.relationshipId += 1;
      }

      this.entities[classId].relationships.push(relationshipOwnerSide);
      this.entities[this.parsedData.getInjectedField(injectId).type].relationships.push(relationshipOtherSide);
    }
  }
};


/**
 * param{array} classesToRead   all the classes we want to read
 * For each classes in classesToRead, reads the corresponding JSON in .jhipster
 */
EntitiesCreator.prototype.readJSON = function(classesToRead){
  var entitiesRead = {};
  for(var k = 0; k<classesToRead.length; k++){
    var classId = classesToRead[k];
    var file = '.jhipster/'+this.parsedData.getClass(classId).name+'.json';

    if(this.onDiskEntities[classId] !== undefined){
      entitiesRead[classId] = this.onDiskEntities[classId];
    }else if(fs.existsSync(file)){
      entitiesRead[classId] = JSON.parse(fs.readFileSync(file, "utf8"));
    }
  }
  return entitiesRead;
};

/**
 * @param{Array} classList  the classes we want to create a JSON for
 * Write a JSON file for each entity in classList in the .jhipster folder
 */
EntitiesCreator.prototype.writeJSON = function(classList) {
  if(!fs.existsSync('.jhipster')){
    fs.mkdirSync('.jhipster');
  }

  for(var k in this.entities) {
    if (this.entities.hasOwnProperty(k) && classList.indexOf(k)!==-1){
      var file = '.jhipster/'+this.parsedData.getClass(k).name+'.json';
      fs.writeFileSync(file, JSON.stringify(this.entities[k], null, '  '));
    }
  }
};


/**
 *@param{Array}  the ids  of the entities
 * Removes every entities which are unchanged
 * if an entity is  new we add it without checking
 */
EntitiesCreator.prototype.filterOutUnchangedEntities = function(entities) {
  var onDiskEntities = this.readJSON(entities);
  return entities.filter(function(id) {
    var currEntity = onDiskEntities[id];
    var newEntity = this.entities[id];
    if(currEntity === undefined)
      return true ;
    return !this.isEqualEntity(currEntity, newEntity);
  }, this);
};

/**
 *@param{Object} entity1
 *@param{Object} entity2
 * Tells if two entities are equal or not
 */
EntitiesCreator.prototype.isEqualEntity = function(entity1, entity2) {
  return _.isEqual(entity1, entity2);
};


/**
 * @param {String} associationId the id of the association
 * @param {function} modifCase the function applied to the field name at
 *                             the end. (lowerCase | upperCase)
 * @return the association field name with, by default, the name of it class in
 * lowercase if non informations about it are available
 *
 */
 EntitiesCreator.prototype.getAssociationFieldName = function(associationId , modifCase) {
  if (!this.parsedData.getAssociation(associationId).name
      && !this.parsedData.getAssociation(associationId).type) {
    throw new BidirectionalAssociationUseException(
      'Bidirectional associations are forbidden.');
  }
  var fieldName=this.parsedData.getAssociation(associationId).name;
  //get the relationshipName if the otherEntityField was declared in the name
  fieldName = this.splitField(fieldName).relationshipName;

  if( fieldName === undefined || fieldName.length === 0 || fieldName === ""){
    fieldName=this.parsedData.classes[this.parsedData.getAssociation(associationId).type].name;
  }

  fieldName=modifCase(fieldName);
  return fieldName;
};

 /**
  * get the otherEntityField for a one-to-many relation
  */
 EntitiesCreator.prototype.getOtherEntityField = function(associationId){
   return this.splitField(this.parsedData.getAssociation(associationId).name).otherEntityField;
 };

/**
 * @param{String} field
 * parse out the string "<relationshipName>(<otherEntityField>)"
 * @return{Object}  where 'relationshipName' is the relationship name and
 *                        'otherEntityField' is the other entity field name
 */
EntitiesCreator.prototype.splitField = function(field){
  var splitedField = {
    otherEntityField : 'id', //id by default
    relationshipName : ''
  };
  if(field){
    var t = field.replace("(", "/").replace(")","").split("/");
    splitedField.relationshipName= t[0];
    if(t.length >1){
      splitedField.otherEntityField= t[1];
    }
  }
  return splitedField;
};

/*
 * Thows an error if the user declared relationships when
 *   using a NoSQL database
 */
EntitiesCreator.prototype.checkNoSQLModeling = function(){
  if(types_helper.isNoSQL(this.databaseTypes)
      && Object.keys(this.parsedData.associations).length !== 0 ){
    throw new NoSQLModelingException(
      "While using a NoSQL database do not create relationships "
      + "between entities, exiting now."
    );
  }
};

/**
 * @param{String} classId  the id of the class to set the changelogDate property
 * If the entity already have a json file we get the changelogDate in it
 *    else we create the changelogDate with liquidbase date format
 * @return the date on liquibase format
 */
EntitiesCreator.prototype.getChangelogDate = function(classId){
  if(this.onDiskEntities[classId] !== undefined ){
    return  this.onDiskEntities[classId].changelogDate;
  }
    return dateFormatForLiquibase();
};


/*
 * @param {Object} entity   the initialized entity
 * @param {Object} entityName   the name of the entity
 * @return {Object}         the entity with the 'dto' property set arcording
 *  to listDTO
 */
EntitiesCreator.prototype.setDTO = function(entity, entityName){
  if(this.listDTO.indexOf(entityName) !== -1) {
    entity.dto = "mapstruct";
  }
  return entity;
};


/*
 * @param {Object} entity       the initialized entity
 * @param {Object} entityName   the name of the entity
 * @return {Object}             the entity with the 'pagination' property set arcording
 *  to listPagination
 */
EntitiesCreator.prototype.setPagination = function(entity, entityName){
  if(Object.keys(this.listPagination).indexOf(entityName) !== -1) {
    entity.pagination = this.listPagination[entityName];
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
 * Gets the injected fields.
 * @return {Object} the injected fields.
 */
EntitiesCreator.prototype.getInjectedFields = function() {
  return this.parsedData.injectedFields;
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


// Errors definition
function NullArgumentException(message) {
  this.name = 'NullArgumentException';
  this.message = (message || '');
}
NullArgumentException.prototype = new Error();

function BidirectionalAssociationUseException(message) {
  this.name = 'BidirectionalAssociationUseException';
  this.message = (message || '');
}
BidirectionalAssociationUseException.prototype = new Error();

function NoSQLModelingException(message) {
  this.name = 'NoSQLModelingException';
  this.message = (message || '');
}
NoSQLModelingException.prototype = new Error();

/**
 * Change the first letter of the string to a lowercase
 * @param {string} className the name of the class to change
 *
 */
function lowerCase(className){
  return _s.camelize(className, true);
};

/**
 * Change the first letter of the string to a uppercase
 * @param {string} elementName   name of the element to change
 *
 */
function upperCase(elementName){
  return _s.capitalize(elementName);
};


/*
 *
 */
function dateFormatForLiquibase(){
  var now = new Date();
  var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
  var year = "" + now_utc.getFullYear();
  var month = "" + (now_utc.getMonth() + 1); if (month.length === 1) { month = "0" + month; }
  var day = "" + now_utc.getDate(); if (day.length === 1) { day = "0" + day; }
  var hour = "" + now_utc.getHours(); if (hour.length === 1) { hour = "0" + hour; }
  var minute = "" + now_utc.getMinutes(); if (minute.length === 1) { minute = "0" + minute; }
  var second = "" + now_utc.getSeconds(); if (second.length === 1) { second = "0" + second; }
  return year + "" + month + "" + day + "" + hour + "" + minute + "" + second;
};
