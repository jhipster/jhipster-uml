'use strict';

var  chalk = require('chalk'),
    fs = require('fs'),
    _s = require('underscore.string'),
    cardinalities = require('./cardinalities');

var EntitiesCreator = module.exports = function(xmiParser, isDto) {

  if(xmiParser === null || xmiParser === undefined){
    throw new NullArgumentException(
      "the xmi parser is null"
    );
  }

  //
  this.USER = 'User';
  this.entitiesToSuppress=[];
  //
  this.isDto = isDto;
 
  this.primitiveTypes = xmiParser.getTypes();
  this.classes = xmiParser.getClasses();
  this.fields = xmiParser.getFields();
  this.injectedFields = xmiParser.getInjectedFields();
  this.associations = xmiParser.getAssociations();

  this.entities = {};
};

EntitiesCreator.prototype.getEntities = function() {
  return this.entities;
};

EntitiesCreator.prototype.createEntities = function() {
  this.initializeEntities();
  for (var i in Object.keys(this.classes)){
    if (Object.keys(this.classes).hasOwnProperty(i)) {
      var classId= Object.keys(this.classes)[i];

    /**
     * If the user add a 'User' entity we consider it as the already created JHipster User entity
     *  thus none of his fields and ownerside relationships will be considerate
     */
      if(this.classes[classId].name.toLowerCase() === this.USER.toLowerCase()){

        console.warn(chalk.yellow("Warning:  An Entity called \'User\' was defined: \'User\' is an entity created by default by JHipster. All relationships toward it will be kept but all attributes and relationships from it will be disregarded."));
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
  for( var i in Object.keys(this.classes)){
    if (Object.keys(this.classes).hasOwnProperty(i)) {
      var classId = Object.keys(this.classes)[i];
      var initializedEntity={
        "relationships" : [],
        "fields" : [],
        "fieldsContainOwnerOneToOne": false,
        "fieldsContainOwnerManyToMany": false,
        "fieldsContainOneToMany" : false,
        "fieldsContainLocalDate": false,
        "fieldsContainCustomTime": false,
        "fieldsContainBigDecimal": false,
        "fieldsContainDateTime": false,
        "fieldsContainDate": false,
        "changelogDate": dateFormatForLiquibase(),
        "dto": "no",
        "pagination": "no",
        "validation": false
      };

      initializedEntity = this.setDTO(initializedEntity);

      this.entities[classId] = initializedEntity;
    }
  }
};

/**
 * fill the fields of the current entity
 * param {String} classId the id of the current entity
 */
EntitiesCreator.prototype.setFieldsOfEntity = function(classId) {

  for(var i = 0; i < this.classes[classId].fields.length; i++) {
    var fieldId = this.classes[classId].fields[i];

      var field = {
        fieldId: this.entities[classId].fields.length+1,
        fieldName: lowerCase(this.fields[fieldId].name),
        fieldType: this.primitiveTypes[this.fields[fieldId].type],
        fieldNameCapitalized: _s.capitalize(this.fields[fieldId].name),
        fieldNameUnderscored: _s.underscored(this.fields[fieldId].name),
        fieldInJavaBeanMethod: _s.capitalize(this.fields[fieldId].name),
        fieldValidate: false
      };

       this.setValidationsOfField(field, fieldId, classId);
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
    case "DateTime":
      this.entities[classId].fieldsContainDateTime = true;
      this.entities[classId].fieldsContainCustomTime = true;
      break;
    case "LocalDate":
      this.entities[classId].fieldsContainLocalDate = true;
      this.entities[classId].fieldsContainCustomTime = true;
      break;
    case "BigDecimal":
      this.entities[classId].fieldsContainBigDecimal = true;
      break;
    case "Date":
      this.entities[classId].fieldsContainDate = true;
      this.entities[classId].fieldsContainCustomTime = true;
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
EntitiesCreator.prototype.setValidationsOfField = function(field, fieldId, classId) {
  if (Object.keys(this.fields[fieldId].validations).length === 0) {
    return;
  }
  field.fieldValidate=true;
  field.fieldValidateRules=[];

  if(!this.entities[classId].validation){
    this.entities[classId].validation=true;
  }

  for(var j in this.fields[fieldId].validations){
    if (this.fields[fieldId].validations.hasOwnProperty(j)) {
      var validationName= j;
      field.fieldValidateRules.push(validationName);

      if(validationName === "maxlength"){
        field.fieldValidateRulesMaxlength = this.fields[fieldId].validations[j];
      }else if(validationName === "minlength"){
        field.fieldValidateRulesMinlength = this.fields[fieldId].validations[j];
      }else if(validationName === "pattern"){
        field.fieldValidateRulesPattern = this.fields[fieldId].validations[j];
      }
    }
  }
};

/**
 * fill the relationship of the current entity and also relationship of the
 * entity on the other side of the association
 */
EntitiesCreator.prototype.setRelationshipOfEntity = function(classId) {
 for(var k in this.classes[classId].injectedFields) {
    if (this.classes[classId].injectedFields.hasOwnProperty(k)) {
      var injectId = this.classes[classId].injectedFields[k];

      // We dont add a relation when it goes to a
      // User entity or others entities with a forbidden name
      if(this.entitiesToSuppress.indexOf(this.injectedFields[injectId].type) !== -1){
        continue;
      }

      // fill the ownerSide relationship
      var relationshipOwnerSide = {
        relationshipId: this.entities[classId].relationships.length + 1,
        relationshipName: lowerCase(this.injectedFields[injectId].name),
        relationshipNameCapitalized: upperCase(this.injectedFields[injectId].name),
        relationshipFieldName: this.injectedFields[injectId].name,
        otherEntityName: lowerCase(this.classes[this.injectedFields[injectId].type].name),
        relationshipType: this.injectedFields[injectId].cardinality,
        otherEntityNameCapitalized: upperCase(this.classes[this.injectedFields[injectId].type].name)
      };

      // fill the relationship on the other side of the association
      // according to the relationType
      var relationshipOtherSide = {
        relationshipId : this.entities[this.injectedFields[injectId].type].relationships.length + 1,
        relationshipName: this.getAssociationFieldName(this.injectedFields[injectId].association, lowerCase),
        relationshipNameCapitalized: this.getAssociationFieldName(this.injectedFields[injectId].association, upperCase),
        relationshipFieldName: this.getAssociationFieldName(this.injectedFields[injectId].association, lowerCase),
        otherEntityName: lowerCase(this.classes[this.associations[this.injectedFields[injectId].association].type].name),
        otherEntityNameCapitalized: upperCase(this.classes[this.associations[this.injectedFields[injectId].association].type].name)
      };

      switch(relationshipOwnerSide.relationshipType) {
        case cardinalities.ONE_TO_ONE:
          relationshipOwnerSide.ownerSide = true;
          relationshipOtherSide.relationshipType = cardinalities.ONE_TO_ONE;
          relationshipOtherSide.ownerSide = false;
          this.entities[classId].fieldsContainOwnerOneToOne = true;
          relationshipOtherSide.otherEntityRelationshipName = relationshipOwnerSide.relationshipFieldName;
          break;
        case cardinalities.ONE_TO_MANY:
          this.entities[classId].fieldsContainOneToMany = true;
          relationshipOtherSide.relationshipType = cardinalities.MANY_TO_ONE;
          relationshipOtherSide.otherEntityField = 'id'; //By default set at 'id'
          relationshipOwnerSide.otherEntityRelationshipName = relationshipOtherSide.relationshipFieldName;
          break;
        case cardinalities.MANY_TO_MANY:
          relationshipOwnerSide.ownerSide = true;
          relationshipOwnerSide.otherEntityField = 'id';
          this.entities[classId].fieldsContainOwnerManyToMany = true;
          relationshipOtherSide.relationshipType = cardinalities.MANY_TO_MANY;
          relationshipOtherSide.ownerSide = false;
          relationshipOtherSide.otherEntityRelationshipName = relationshipOwnerSide.relationshipFieldName;
          break;
        default:
      }

      if (classId === this.injectedFields[injectId].type) {
        relationshipOtherSide.relationshipId += 1;
      }

      this.entities[classId].relationships.push(relationshipOwnerSide);
      this.entities[this.injectedFields[injectId].type].relationships.push(relationshipOtherSide);
    }
  }
};

/**
 * Write a JSON file for each entity by default in a .jhipster folder
 * and creates it if it do not exist
 */
EntitiesCreator.prototype.writeJSON = function() {
  if(!fs.existsSync('.jhipster')){
    fs.mkdirSync('.jhipster');
  }

  for(var k in this.entities) {
    if (this.entities.hasOwnProperty(k)) {
      var file = '.jhipster/'+this.classes[k].name+'.json';
      fs.writeFileSync(file, JSON.stringify(this.entities[k], null, '  '));
    }
  }
};


/**
 * @param {String} associationId the id of the association
 * @param {function} modifCase the function applied to the field name at
 *                             the end. (lowerCase | upperCase)
 * @return the association field name with, by default, the name of it class in
 * lowercase if non informations about it are available
 */
 EntitiesCreator.prototype.getAssociationFieldName = function(associationId , modifCase) {
  var fieldName=this.associations[associationId].name;
  if( fieldName === undefined || fieldName.length === 0 || fieldName === ""){
    fieldName=this.classes[this.associations[associationId].type].name;
  }

  fieldName=modifCase(fieldName);
  return fieldName;
};


/*
 * @param {Object} entity   the initialized entity
 * @return {Object}         the entity with the 'dto' property set arcording
 *  to the isDto attribut
 */
EntitiesCreator.prototype.setDTO = function(entity){
  if(this.isDto) {
    entity.dto = "mapstruct";
  }
  return entity;

};

/**
 * Gets the classes.
 * @return {Object} the classes.
 */
EntitiesCreator.prototype.getClasses = function() {
  return this.classes;
};

/**
 * Gets the (regular) fields.
 * @return {Object} the (regular) fields.
 */
EntitiesCreator.prototype.getFields = function() {
  return this.fields;
};

/**
 * Gets the injected fields.
 * @return {Object} the injected fields.
 */
EntitiesCreator.prototype.getInjectedFields = function() {
  return this.injectedFields;
};

/**
 * Gets the associations.
 * @return {Object} the associations.
 */
EntitiesCreator.prototype.getAssociations = function() {
  return this.associations;
};

/**
 * Gets the primitives types.
 * @return {Object} the associations.
 */
EntitiesCreator.prototype.getPrimitiveTypes = function() {
  return this.primitiveTypes;
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
 * @param {string} elementName name of the element to change
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
