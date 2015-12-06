"use strict";

var _s = require('underscore.string'),
    chalk = require('chalk'),
    fs = require('fs'),
    pegParser = require('./jhGrammar'),
    AbstractParser = require('../editors/abstract_parser'),
    parser_helper = require('../editors/parser_helper'),
    isAValidDTO = require('../helper/jhipster_option_helper').isAValidDTO,
    isAValidPagination = require('../helper/jhipster_option_helper').isAValidPagination,
    InvalidTypeException = require('../exceptions/invalid_type_exception'),
    WrongValidationException = require('../exceptions/wrong_validation_exception'),
    UndeclaredEntityException = require('../exceptions/undeclared_entity_exception');

/**
 * Constants used to differentiate unidirectionality and anonymous declaration.
 */
 var UNIDIR = '*unidir*';
 var ANON = '*anonymous*';

/**
 * The parser for our DSL files.
 */
var DSLParser = module.exports = function(root, databaseTypes) {
  AbstractParser.call(this, root, databaseTypes);
};

// inheritance stuff
DSLParser.prototype = Object.create(AbstractParser.prototype);
DSLParser.prototype.constructor = AbstractParser;

DSLParser.prototype.parse = function() {
  var jh = fs.readFileSync(this.root).toString();

  this.result = pegParser.parse(jh);

  this.fillEnums();
  this.fillClassesAndFields();
  this.fillAssociations();
  return this.parsedData;
};

/*
* Fills the enums
*/
DSLParser.prototype.fillEnums = function() {
  this.result.enums.forEach(function(enumObject) {
    this.addEnum(enumObject);
  }, this);
};

/**
 * Fills the associations with the extracted associations from the document.
 */
DSLParser.prototype.fillAssociations = function() {
  this.result.relationships.forEach(function(relationshipObject) {
    var relationship = relationshipObject;
    if(relationshipObject.cardinality === 'many-to-one') {
      relationship = this.changeMtOtoOtM(relationshipObject);
    }

    var associationsID = relationship.from.name + '_' + relationship.from.injectedfield
      + '_to_'
      + relationship.to.name + '_' + relationship.to.injectedfield;

    this.checkEntityDeclaration(relationship, associationsID);

    var name = '';
    switch (relationship.to.injectedfield) {
      case UNIDIR:
        name = null;
        break;
      case ANON:
        name = relationship.from.name.toLowerCase();
        break;
      default:
        name = relationship.to.injectedfield;
    }
    this.parsedData.addAssociation(
      associationsID,
      {
        name : name,
        type : relationship.from.name
      });

    this.addInjectedField(relationship, associationsID);
  }, this);
};

/**
 * Fills the classes and the fields that compose them.
 * @throws NullPointerException if a class' name, or an attribute, is nil.
 */
DSLParser.prototype.fillClassesAndFields = function() {
  this.result.entities.forEach(function(entity) {
    this.addClass(entity);
    entity.body.forEach(function(bodyData) {
      this.addField(bodyData, entity.name);
    }, this);
  }, this);
  addDTOOptions(this.result.dto, this.parsedData);
  addPaginationOptions(this.result.pagination, this.parsedData);
};

function addDTOOptions(dtos, parsedData) {
  Object.keys(dtos).forEach(function(option) {
    if (isAValidDTO(option)) {
      dtos[option].forEach(function(className) {
        parsedData.getClass(className).dto = option;
      });
    } else {
      console.error(
        chalk.red(
          "The DTO option '" + option + "' is not supported."));
    }
  });
}

function addPaginationOptions(paginations, parsedData) {
  Object.keys(paginations).forEach(function(option) {
    if (isAValidPagination(option)) {
      paginations[option].forEach(function(className) {
        parsedData.getClass(className).pagination = option;
      });
    } else {
      console.error(
        chalk.red(
          "The pagination option '" + option + "' is not supported."));
    }
  });
}

DSLParser.prototype.addEnum = function(element) {
  this.parsedData.addEnum(
    element.name,{
      name : element.name,
      values : element.values
    });
};

DSLParser.prototype.addClass = function(entity) {
  var classId = entity.name;
  if (entity.name === 'User') {
    this.parsedData.userClassId = classId;
  }
  this.parsedData.addClass(classId, { name: entity.name, comment: entity.javadoc });
};

DSLParser.prototype.addField = function(element, classId) {
  if (parser_helper.isAnId(element.name, this.parsedData.getClass(classId).name)) {
    return;
  }

  var fieldId = this.parsedData.getClass(classId).name + '_' + element.name;
  this.parsedData.addField(
    fieldId,
    {
      name : _s.decapitalize(element.name),
      type : element.type,
      comment: element.javadoc
    });
  this.parsedData.addFieldToClass(classId, fieldId);

  if (this.databaseTypes.contains(element.type)) {
    this.parsedData.addType(element.type, { name: element.type });
    this.addConstraint(element.validations, fieldId, element.type );
  } else if (this.parsedData.getEnum(element.type) !== -1) {
    this.addConstraint(element.validations,fieldId, 'Enum');
  } else {
    throw new InvalidTypeException(
      "The type '"
      + element.type
      + "' isn't supported by JHipster or declared as an Enum, exiting now.");
  }
};

DSLParser.prototype.addConstraint = function(constraintList, fieldId, type) {
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
    this.parsedData.getField(fieldId).addValidation(validationName, element.value);
  },this);
};

/*
* add the injected field from the relationship in the injectedFields map
*   and add the its id the corresponding class
* @param{Object} element  the relationships that we add the InjectedField for
* @param{String} associationId  the id of the association
*/
DSLParser.prototype.addInjectedField = function(element, associationId) {
  var injectedFieldName = (element.from.injectedfield === ANON)
    ? element.to.name
    : element.from.injectedfield;
  var injectedFieldId = element.from.name+'_'+injectedFieldName;
  
  this.parsedData.addInjectedField(
    injectedFieldId,
    {
      //name : injectedFieldName,
      name: _s.decapitalize(injectedFieldName),
      //customName: injectedFieldName,
      type: element.to.name,
      association: associationId,
      'class': element.from.name,
      cardinality: element.cardinality,
      comment: element.from.javadoc,
      otherSideComment: element.to.javadoc
    }
  );

  this.parsedData.addInjectedFieldToClass(element.from.name, injectedFieldId);
};

/*
 * @param{Object} relationship  the relationship to check
 * checks if all the entities stated in the relationship are
 * declared, and create a class User if the entity User is declared implicitly
 */
DSLParser.prototype.checkEntityDeclaration = function(relationship, associationId) {

  if (!this.parsedData.getClass('User')
      && (relationship.from.name === 'User' || relationship.to.name === 'User')) {
    this.parsedData.userClassId = 'User';
    this.parsedData.addClass('User', { name: 'User' });
  }

  if (!this.parsedData.getClass(relationship.from.name)) {
    throw new UndeclaredEntityException(
      'In the association '
      + associationId
      + ', the entity '
      + relationship.from.name
      + ' is not declared.'
    );
  }

  if (!this.parsedData.getClass(relationship.to.name)) {
    throw new UndeclaredEntityException(
      'In the association '
      + associationId
      + ', the entity '
      + relationship.to.name
      + ' is not declared.'
    );
  }
};

/**
* @param{Object} relationship the relationship to change
* If the relationship a Many to One, changes it to a One to Many
*/
DSLParser.prototype.changeMtOtoOtM = function(relationship) {
  return {
    cardinality: 'one-to-many',
    from: {
      name: relationship.to.name,
      injectedfield: relationship.to.injectedfield
    },
    to: {
      name: relationship.from.name,
      injectedfield: relationship.from.injectedfield
    }
  };
};
