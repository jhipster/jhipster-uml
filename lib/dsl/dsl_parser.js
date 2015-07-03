"use strict";

var PEG = require("pegjs"),
 fs = require('fs'),
 pegParser = require('./jhGrammar'),
 parser = require('../editors/parser');



exports.DSL = parser.AbstractParser.extend({

  parse: function() {
    var jh = fs.readFileSync(this.file).toString();

    this.result = pegParser.parse(jh);

    this.fillClassesAndFields();
    this.fillAssociations();

  },

  /**
   * Fills the associations with the extracted associations from the document.
   */
  fillAssociations: function() {
    var relationships = this.result.relationships;
    for (var i = 0; i < relationships.length; i++){
      var relationship = this.changeMtOtoOtM(relationships[i]); //we change a many-to-one to a one-to-many

      var associationsID = relationship.from.name+'_to_'+relationship.to.name;

      this.checkEntityDeclation(relationship, associationsID);

      this.associations[associationsID] = {
        name : (relationship.to.injectedfield === '') ? type.toLowerCase() : relationship.to.injectedfield,
        type : relationship.from.name
      };
      this.addInjectedField(relationship, associationsID );
    }
  },

  /**
   * Fills the classes and the fields that compose them.
   * @throws NullPointerException if a class' name, or an attribute, is nil.
   */
  fillClassesAndFields: function() {
    var entities = this.result.entities;

    for (var i = 0; i < entities.length; i++){
      this.addClass(entities[i]);
      for (var j = 0; j < entities[i].body.length; j++){
        this.addField(entities[i].body[j], entities[i].name);
      }
    }
  },



  addClass: function(entity){
    this.classes[entity.name] = {
      name: entity.name,
      fields: [],
      injectedFields: []
    };
  },

  addField: function(element, classId) {

    if(this.isAnId(element.name, this.classes[classId].name)){
      return;
    }

    var fieldId = element.name;
    this.fields[fieldId] = {
      name : element.name,
      type : element.type,
      validations : []
    };
    this.classes[classId].fields.push(fieldId);

    if (!this.databaseTypes.contains(element.type)) {
      throw new InvalidTypeException(
        "The type '"
        + element.type
        + "' isn't supported by JHipster, exiting now.");
    }
    //add the type to the types map
    this.types[element.type] =  element.type;

    this.addConstraint(element.validations, fieldId);
  },

  addConstraint: function(constraintList, fieldId ){
    constraintList.forEach(function(element){
      var validationName = element.key;
      this.fields[fieldId].validations[validationName] = element.value;
    },this);
  },

 /*
  * add the injected field from the relationship in the injectedFields map
  *   and add the its id the corresponding class
  * @param{Object} element  the relationships that we add the InjectedField for
  * @param{String} associationId  the id of the assiciation
  */
  addInjectedField: function(element, associationId){
    var injectedFieldName = (element.from.injectedfield === '')
    ? type.toLowerCase() : element.from.injectedfield;
    var injectedFieldId = element.from.name+'_'+injectedFieldName;

    this.injectedFields[injectedFieldId] = {
      name : injectedFieldName,
      type : element.to.name,
      association : associationId,
      'class' : element.from.name,
      cardinality : element.cardinality
    };

    this.classes[element.from.name].injectedFields.push(injectedFieldId);
  },


  /*
   * @param{Object} relationship  the relationship to check
   *  checks if all the entities stated in the relationship are
   *  declared
   */
  checkEntityDeclation: function(relationship, associationId){

    if(this.classes[relationship.from.name] === undefined){
      throw new UndeclaredEntityExecption(
        "In the association " + associationId + ", the entity "+ relationship.from.name + " is not declared."
      );
    }

    if(this.classes[relationship.to.name] === undefined){
      throw new UndeclaredEntityExecption(
        "In the association " + associationId + ", the entity "+ relationship.to.name + " is not declared."
      );
    }
  },

/**
 * @param{Object} relationsip the relationship to change
 * If the relationship a Many to One, changes it to a One to Many
 */
  changeMtOtoOtM : function(relationship){
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
  },

  /**
   * Checks whether the passed name is an id.
   * @param {string} name the field's name.
   * @param {string} className the name of the class possessing the field.
   * @return {boolean} whether the field is an id.
   */
  isAnId: function(name, className) {
    var regex = new RegExp('^' + className.toLowerCase() + 'Id$');
    return name.length === 2 && /^id$/.test(name.toLowerCase()) || regex.test(name);
  },


  /**
   * Super constructor.
   */
  initialize: function(root, databaseTypes) {
    this.file = root;
    this.databaseTypes = databaseTypes;

    // maps that store the parsed elements from the XML, ready to be exported
    this.types = {};
    this.classes = {};
    this.fields = {};
    this.injectedFields = {};
    this.associations = {};

    // the use class's id holder
    this.userClassId = null;
  }

});



function UndeclaredEntityExecption(message) {
  this.name = 'UndeclaredEntityExecption';
  this.message = (message || '');
}
UndeclaredEntityExecption.prototype = new Error();