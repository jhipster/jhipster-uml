"use strict";

var _s = require('underscore.string'),
    chalk = require('chalk'),
    fs = require('fs'),
    pegParser = require('./jhGrammar'),
    AbstractParser = require('../editors/abstract_parser'),
    parser_helper = require('../editors/parser_helper'),
    isAValidDTO = require('../helpers/jhipster_option_helper').isAValidDTO,
    isAValidPagination = require('../helpers/jhipster_option_helper').isAValidPagination,
    isAValidService = require('../helpers/jhipster_option_helper').isAValidService,
    InvalidTypeException = require('../exceptions/invalid_type_exception'),
    WrongValidationException = require('../exceptions/wrong_validation_exception'),
    UndeclaredEntityException = require('../exceptions/undeclared_entity_exception');

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

    var associationId = relationship.from.name
      + '_'
      + relationship.from.injectedfield
      + '_to_'
      + relationship.to.name
      + '_'
      + relationship.to.injectedfield;
    this.checkEntityDeclaration(relationship, associationId);

    var associationData = {
      from: _s.capitalize(relationship.from.name),
      to: _s.capitalize(relationship.to.name),
      type: relationship.cardinality,
      injectedFieldInFrom: relationship.from.injectedfield,
      injectedFieldInTo: relationship.to.injectedfield,
      commentInFrom: relationship.from.javadoc,
      commentInTo:relationship.to.javadoc
    };

    this.parsedData.addAssociation(associationId, associationData);
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
  addServiceOptions(this.result.service, this.parsedData);
};

function addDTOOptions(dtos, parsedData) {
  Object.keys(dtos).forEach(function(option) {
    if (isAValidDTO(option)) {
      var collection = (dtos[option].length === 1 && dtos[option][0] === '*')
        ? Object.keys(parsedData.classes)
        : dtos[option];
      collection.forEach(function(className) {
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
      var collection = (paginations[option].length === 1 && paginations[option][0] === '*')
        ? Object.keys(parsedData.classes)
        : paginations[option];
      collection.forEach(function(className) {
        parsedData.getClass(className).pagination = option;
      });
    } else {
      console.error(
        chalk.red(
          "The pagination option '" + option + "' is not supported."));
    }
  });
}

function addServiceOptions(services, parsedData) {
  Object.keys(services).forEach(function(option) {
    if (isAValidService(option)) {
      var collection = (services[option].length === 1 && services[option][0] === '*')
        ? Object.keys(parsedData.classes)
        : services[option];
      collection.forEach(function(className) {
        parsedData.getClass(className).service = option;
      });
    } else {
      console.error(
        chalk.red(
          "The service option '" + option + "' is not supported."));
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
  if (parser_helper.isAnId(element.name)) {
    return;
  }

  var fieldId = this.parsedData.getClass(classId).name + '_' + element.name;
  this.parsedData.addField(
    classId,
    fieldId,
    {
      name: _s.decapitalize(element.name),
      type: element.type,
      comment: element.javadoc
    });

  if (this.databaseTypes.contains(element.type)) {
    this.parsedData.addType(element.type, { name: element.type });
    this.addConstraint(element.validations, fieldId, element.type);
  } else if (this.parsedData.getEnum(element.type) !== -1) {
    this.addConstraint(element.validations, fieldId, 'Enum');
  } else {
    throw new InvalidTypeException(
      "The type '"
      + element.type
      + "' isn't supported by JHipster or declared as an Enum, exiting now.");
  }
};

DSLParser.prototype.addConstraint = function(constraintList, fieldId, type) {
  constraintList.forEach(function(element) {
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
    this.parsedData.addValidationToField(
      fieldId,
      fieldId + "_" + element.key,
      { name: element.key, value: element.value });
  },this);
};

/*
 * Checks if all the entities stated in the relationship are
 * declared, and create a class User if the entity User is declared implicitly.
 * @param {Object} relationship the relationship to check.
 * @param {String} associationId the association's id.
 */
DSLParser.prototype.checkEntityDeclaration = function(association, associationId) {

  if (!this.parsedData.getClass('User')
      && (association.from.name === 'User' || association.to.name === 'User')) {
    this.parsedData.userClassId = 'User';
    this.parsedData.addClass('User', { name: 'User' });
  }

  if (!this.parsedData.getClass(association.from.name)) {
    throw new UndeclaredEntityException(
      'In the association '
      + associationId
      + ', the entity '
      + association.from.name
      + ' is not declared.'
    );
  }

  if (!this.parsedData.getClass(association.to.name)) {
    throw new UndeclaredEntityException(
      'In the association '
      + associationId
      + ', the entity '
      + association.to.name
      + ' is not declared.'
    );
  }
};
