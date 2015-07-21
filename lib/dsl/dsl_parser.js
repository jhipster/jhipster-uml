"use strict";

var fs = require('fs'),
    pegParser = require('./jhGrammar'),
    AbstractParser = require('../editors/abstract_parser'),
    parser_helper = require('../editors/parser_helper');

/**
 * The parser for our DSL files.
 */
var DSLParser = module.exports = function(root, databaseTypes) {
  this.file = root;
  this.databaseTypes = databaseTypes;

  // maps that store the parsed elements from the XML, ready to be exported
  this.types = {};
  this.enums = {};
  this.classes = {};
  this.fields = {};
  this.injectedFields = {};
  this.associations = {};

  // the use class's id holder
  this.userClassId = null;
};

// inheritance stuff
DSLParser.prototype = Object.create(AbstractParser.prototype);
DSLParser.prototype.constructor = AbstractParser;

DSLParser.prototype.parse = function() {
  var jh = fs.readFileSync(this.file).toString();

  this.result = pegParser.parse(jh);

  this.fillEnums();
  this.fillClassesAndFields();
  this.fillAssociations();

};

/*
* Fills the enums
*/
DSLParser.prototype.fillEnums = function() {
  var enums = this.result.enums;
  for(var i =0; i < enums.length; i++){
    this.addEnum(enums[i]);
  }
};

/**
 * Fills the associations with the extracted associations from the document.
 */
DSLParser.prototype.fillAssociations = function() {
  var relationships = this.result.relationships;
  for (var i = 0; i < relationships.length; i++){
    var relationship = this.changeMtOtoOtM(relationships[i]); //we change a many-to-one to a one-to-many

    var associationsID = relationship.from.name+'_to_'+relationship.to.name;

    this.checkEntityDeclation(relationship, associationsID);

    this.associations[associationsID] = {
      name : (relationship.to.injectedfield === '') ?
          relationship.from.name.toLowerCase()
          : relationship.to.injectedfield,
      type : relationship.from.name
    };
    this.addInjectedField(relationship, associationsID );
  }
};

/**
 * Fills the classes and the fields that compose them.
 * @throws NullPointerException if a class' name, or an attribute, is nil.
 */
DSLParser.prototype.fillClassesAndFields = function() {
  var entities = this.result.entities;

  for (var i = 0; i < entities.length; i++){
    this.addClass(entities[i]);
    for (var j = 0; j < entities[i].body.length; j++){
      this.addField(entities[i].body[j], entities[i].name);
    }
  }
};

DSLParser.prototype.addEnum = function(element){
  this.enums[element.name] = {
    name : element.name,
    values : element.values
  }
};

DSLParser.prototype.addClass = function(entity){
  var classId = entity.name
  if(entity.name === "User"){
    this.userClassId= classId;
  }
  this.classes[classId] = {
    name: entity.name,
    fields: [],
    injectedFields: []
  };
};

DSLParser.prototype.addField = function(element, classId) {
  if(parser_helper.isAnId(element.name, this.classes[classId].name)){
    return;
  }

  var fieldId = this.classes[classId].name+"_"+element.name;
  this.fields[fieldId] = {
    name : element.name,
    type : element.type,
    validations : []
  };
  this.classes[classId].fields.push(fieldId);
  if (this.databaseTypes.contains(element.type)){
    this.types[element.type] = element.type; //add the type to the types map
    this.addConstraint(element.validations, fieldId, element.type );
  }else if (Object.keys(this.enums).indexOf(element.type) !== -1){
    this.addConstraint(element.validations,fieldId, "Enum");
  }else{
    throw new InvalidTypeException(
      "The type '"
      + element.type
      + "' isn't supported by JHipster or declared as an Enum, exiting now.");
  }
};

DSLParser.prototype.addConstraint = function(constraintList, fieldId, type ){
  constraintList.forEach(function(element){
    var validationName = element.key;

    if (!this.databaseTypes.isValidationSupportedForType(
        type,
        validationName)) {
      throw new WrongValidationException(
        "The validation '"
        + validationName
        + "' isn't supported for the type '"
        + type
        + "', exiting now.");
  }

    this.fields[fieldId].validations[validationName] = element.value;
  },this);
};

/*
* add the injected field from the relationship in the injectedFields map
*   and add the its id the corresponding class
* @param{Object} element  the relationships that we add the InjectedField for
* @param{String} associationId  the id of the association
*/
DSLParser.prototype.addInjectedField = function(element, associationId){
  var injectedFieldName = (element.from.injectedfield === '')
  ? element.to.name.toLowerCase() : element.from.injectedfield;
  var injectedFieldId = element.from.name+'_'+injectedFieldName;

  this.injectedFields[injectedFieldId] = {
    name : injectedFieldName,
    type : element.to.name,
    association : associationId,
    'class' : element.from.name,
    cardinality : element.cardinality
  };

  this.classes[element.from.name].injectedFields.push(injectedFieldId);
};

/*
 * @param{Object} relationship  the relationship to check
 *  checks if all the entities stated in the relationship are
 *  declared, and create a class User if the entity User is declared implicitly
 */
DSLParser.prototype.checkEntityDeclation = function(relationship, associationId){

  if ((relationship.from.name === "User" || relationship.to.name === "User") && this.classes["User"] === undefined ){
    this.userClassId= "User";
    this.classes["User"] = {
      name: "User",
      fields: [],
      injectedFields: []
    };
  }

  if(this.classes[relationship.from.name] === undefined){
    throw new UndeclaredEntityExecption(
      "In the association "
      + associationId
      + ", the entity "
      + relationship.from.name 
      + " is not declared."
    );
  }

  if(this.classes[relationship.to.name] === undefined){
    throw new UndeclaredEntityExecption(
      "In the association " 
      + associationId 
      + ", the entity "
      + relationship.to.name 
      + " is not declared."
    );
  }
};

/**
* @param{Object} relationship the relationship to change
* If the relationship a Many to One, changes it to a One to Many
*/
DSLParser.prototype.changeMtOtoOtM = function(relationship){
  var changeRelationship = {};
    if(relationship.cardinality === "many-to-one"){
      changeRelationship.cardinality = "one-to-many";
      changeRelationship.from={};
      changeRelationship.to={};
      changeRelationship.from.name = relationship.to.name;
      changeRelationship.to.name = relationship.from.name;
      changeRelationship.from.injectedfield = relationship.to.injectedfield;
      changeRelationship.to.injectedfield = relationship.from.injectedfield;
    }else{
      changeRelationship = relationship;
    }
  return changeRelationship;
};

function InvalidTypeException(message) {
  this.name = 'InvalidTypeException';
  this.message = (message || '');
}
InvalidTypeException.prototype = new Error();

function WrongValidationException(message) {
  this.name = 'WrongValidationException';
  this.message = (message || '');
}
WrongValidationException.prototype = new Error();

function UndeclaredEntityExecption(message) {
  this.name = 'UndeclaredEntityExecption';
  this.message = (message || '');
}
UndeclaredEntityExecption.prototype = new Error();
