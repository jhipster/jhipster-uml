"use strict"

var PEG = require("pegjs"),
 fs = require('fs'),
 pegParser = require('./jhGrammar'),
 parser = require('../editors/parser');



exports.DSL = parser.AbstractParser.extend({

  parse: function() {

   // var grammar = fs.readFileSync("lib/dsl/grammar.txt").toString();
    var jh = fs.readFileSync(this.file).toString();

    //var pegParser = PEG.buildParser(grammar);
    this.result = pegParser.parse(jh);
    
    this.fillClassesAndFields();
    this.fillAssociations();

  }, 
 


  /**
   * Fills the types with type names.
   * @throws InvalidTypeException if the type isn't supported by JHipster.
   */
  fillTypes: function() {

  },

  /**
   * Fills the associations with the extracted associations from the document.
   */
  fillAssociations: function() {
    var relationships = this.result.relationships;
    for (var i = 0; i < relationships.length; i++){
      var associationsID = relationships[i].from.name+'_to_'+relationships[i].to.name;

      this.checkEntityDeclation(relationships[i], associationsID);

      this.associations[associationsID] = {
        name : (relationships[i].to.injectedFields === '') ? type.toLowerCase() : relationships[i].to.injectedFields,
        type : relationships[i].from.name
      }

      this.addInjectedField(relationships[i], associationsID );
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

  /**
   * Fills the existing fields with the present validations.
   * @throws NoValidationNameException if no validation name exists for the
   *                                   validation value (1 for no minlength for
   *                                   instance).
   * @throws WrongValidationException if JHipster doesn't support the
   *                                  validation.
   */
  fillConstraints: function() {
    this.rawValidationRulesIndexes.forEach(function(index) {
      var constraint = this.root.ownedRule[index];
      var name = constraint.$.name;

      if (!name) {
        throw new NoValidationNameException('The validation has no name.');
      }

      var value = constraint.specification[0].$.value; // not nil, but ''

      if (!name && !value) {
        return;
      }

      var previousValidations = {};

      if (this.fields[constraint.$.constrainedElement]) {
        previousValidations = this.fields[constraint.$.constrainedElement].validations;
      }

      if (!this.databaseTypes.isValidationSupportedForType(
          this.types[this.fields[constraint.$.constrainedElement].type],
          name)) {
        throw new WrongValidationException(
          "The validation '"
          + name
          + "' isn't supported for the type '"
          + this.types[this.fields[constraint.$.constrainedElement].type]
          + "', exiting now.");
      }
      previousValidations[name] = value;
      this.fields[constraint.$.constrainedElement].validations = previousValidations;
    }, this);
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
    //add the type to the types map
    if (!this.databaseTypes.contains(element.type)) {
      throw new InvalidTypeException(
        "The type '"
        + element.type
        + "' isn't supported by JHipster, exiting now.");
    }
    this.types[element.type] =  element.type;
    
    this.addConstraint(element.validations, fieldId);
  }, 

  addConstraint: function(constraintList, fieldId ){
    constraintList.forEach(function(element, index){
      var validationName = element.key;
      this.fields[fieldId].validations[validationName] = element.value;
    },this); 
  },

  addInjectedField: function(element, associationId){
    //console.log(element.from);
    var injectedFieldName = (element.from.injectedfield === ''  ) 
    ? type.toLowerCase() : element.from.injectedfield;
    var injectedFieldId = element.from.name+'_'+injectedFieldName;

    this.injectedFields[injectedFieldId] = {
      name : injectedFieldName,
      type : element.to.name,
      association : associationId,
      cardinality : element.cardinality
    };
    
    this.classes[element.from.name].injectedFields.push(injectedFieldId); 
  },


  /*
   * @param relationship  the relationship to check 
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

    // arrays used for the XML parsing
    this.rawTypesIndexes = [];
    this.rawClassesIndexes = [];
    this.rawAssociationsIndexes = [];
    this.rawValidationRulesIndexes = [];

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