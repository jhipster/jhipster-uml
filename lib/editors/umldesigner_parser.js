'use strict';

var _s = require('underscore.string'),
    parser = require('./parser'),
    cardinalities = require('../cardinalities');

/**
 * The parser for the XMI files exported by UML Designer.
 */
exports.UMLDesignerParser = parser.AbstractParser.extend({

  parse: function() {
    this.findElements();
    this.fillTypes();
    this.fillClassesAndFields();
    this.fillAssociations();
    this.fillConstraints(); // not supported by UML Designer yet
  },

  findElements: function() {
    this.root.packagedElement.forEach(function(element, index) {
      switch (element.$['xmi:type']) {
        case 'uml:PrimitiveType':
        case 'uml:DataType': // shouldn't happen, but just in case...
          this.rawTypesIndexes.push(index);
          break;
        case 'uml:Class':
          this.rawClassesIndexes.push(index);
          break;
        case 'uml:Association':
          this.rawAssociationsIndexes.push(index);
          break;
        default:
      }
    }, this);
    this.findConstraints();
  },

  findConstraints: function() {
    // not supported by UML Designer yet
  },

  fillTypes: function() {
    this.rawTypesIndexes.forEach(function(element) {
      var type = this.root.packagedElement[element];
      this.addType(_s.capitalize(type.$.name), type.$['xmi:id']);
    }, this);
  },

  addType: function(typeName, typeId) {
    if (!this.databaseTypes.contains(typeName)) {
      throw new InvalidTypeException(
        "The type '"
        + typeName
        + "' isn't supported by JHipster, exiting now.");
    }
    this.types[typeId] = typeName;
  },

  fillClassesAndFields: function() {
    for (var i = 0; i < this.rawClassesIndexes.length; i++) {
      var element = this.root.packagedElement[this.rawClassesIndexes[i]];

      if (!element.$.name) {
        throw new NullPointerException('Classes must have a name.');
      }
      this.checkForUserClass(element);
      this.addClass(element);

      if (!element.ownedAttribute) {
        continue;
      }

      for (var j = 0; j < element.ownedAttribute.length; j++) {
        if (!element.ownedAttribute[j].$.name) {
          throw new NullPointerException(
            "No name is defined for the passed attribute, for class'"
            + element.$.name
            + "'.");
        }
        if (!this.isAnId(
            element.ownedAttribute[j].$.name,
            element.$.name)) {
          this.addField(element.ownedAttribute[j], element.$['xmi:id']);
        }
      }
    }
  },

  checkForUserClass: function(element) {
    if (!this.userClassId && element.$.name.toLowerCase() === 'user') {
      this.userClassId = element.$['xmi:id'];
    }
  },

  /**
   * Adds a new class in the class map.
   * @param {Object} element the class to add.
   */
  addClass: function(element) {
    this.classes[element.$['xmi:id']] = {
      name: element.$.name,
      fields: [],
      injectedFields: []
    };
  },

  /**
   * Adds a new field to the field map.
   * @param {Object} element the field to add.
   * @param {string} classId the encapsulating class' id.
   */
  addField: function(element, classId) {
    this.addRegularField(element, classId);
  },

  /**
   * Adds a (regular, not injected) field to the field map.
   * @param {Object} element the new field to add.
   */
  addRegularField: function(element, classId) {
    this.fields[element.$['xmi:id']] = {
      name: element.$.name,
      validations: {}
    };
    if (element.$.type) {
      this.fields[element.$['xmi:id']].type = element.$.type;
    } else {
      if (!element.type) { // this field doesn't possess any type at all
        throw new NoTypeException(
          "The field '" 
          + element.$.name 
          + "' does not possess any type, exiting now.");
      }
      var typeName = _s.capitalize(this.getTypeName(element.type[0].$.href));

      this.addType(typeName, typeName); // id = name

      this.fields[element.$['xmi:id']].type = typeName;
    }
    this.classes[classId].fields.push(element.$['xmi:id']);
  },

  fillAssociations: function() {
    this.rawAssociationsIndexes.forEach(function(element) {
      var association = this.root.packagedElement[element];

      if (association.ownedEnd[0].$['xmi:id'] === association.$.navigableOwnedEnd) {
        this.associations[association.$['xmi:id']] = {
          isUpperValuePresent: association.ownedEnd[1].upperValue[0].$.value === '*',
          name: association.ownedEnd[1].$.name,
          type: association.ownedEnd[1].$.type
        };

        this.addInjectedField(
          association.ownedEnd[0],
          association.ownedEnd[1].$.type);
      } else {
        this.associations[association.$['xmi:id']] = {
          isUpperValuePresent: association.ownedEnd[0].upperValue[0].$.value === '*',
          name: association.ownedEnd[0].$.name,
          type: association.ownedEnd[0].$.type
        };

        this.addInjectedField(
          association.ownedEnd[1],
          association.ownedEnd[0].$.type);
      }
    }, this);
  },

  /**
   * Adds an injected field to the corresponding map.
   * @param {Object} element the field to add.
   * @param {string} classId the id of the class containing this field.
   */
  addInjectedField: function(element, classId) {
    this.injectedFields[element.$['xmi:id']] = {
      name: element.$.name,
      type: element.$.type,
      association: element.$.association,
      'class': classId,
      isUpperValuePresent: element.upperValue[0].$.value === '*'
    };

    this.injectedFields[element.$['xmi:id']].cardinality =
      this.getCardinality(this.injectedFields[element.$['xmi:id']]);
    this.classes[classId].injectedFields.push(element.$['xmi:id']);
  },

  fillConstraints: function() {
    // not supported by UML Designer yet
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
   * Returns field's cardinality based on the association and the field's
   * attributes.
   * @param {Object} the field.
   * @return {string} the cardinality (one of ONE_TO_ONE, ONE_TO_MANY or
   *                  MANY_TO_MANY).
   */
  getCardinality: function(injectedField) {
    if (this.isOneToOne( 
        injectedField.isUpperValuePresent, 
        this.associations[injectedField.association].isUpperValuePresent)) {
      return cardinalities.ONE_TO_ONE;
    } else if (this.isOneToMany(
        injectedField.isUpperValuePresent,
        this.associations[injectedField.association].isUpperValuePresent)) {
      return cardinalities.ONE_TO_MANY;
    } else if (this.isManyToMany(
        injectedField.isUpperValuePresent,
        this.associations[injectedField.association].isUpperValuePresent)) {
      return cardinalities.MANY_TO_MANY;
    }
    throw new NoCardinalityException(
      "The injected field '" 
      + injectedField.name
      + "' does not belong to any valid association,"
      + 'because there is no cardinality. Exiting now.');
  },

  /**
   * Checks whether the relationship is a "one-to-one".
   * @param {boolean} injectedFieldUpperValuePresence if the UpperValue flag is 
   *                                                  set in the injected field. 
   * @param {boolean} associationUpperValuePresence if the UpperValue flag is 
   *                                                set in the association.
   * @return {boolean} the result.
   */
  isOneToOne: function(injectedFieldUpperValuePresence, associationUpperValuePresence) {
    return !injectedFieldUpperValuePresence && !associationUpperValuePresence;
  },

  /**
   * Checks whether the relationship is a "one-to-many".
   * @param {boolean} injectedFieldUpperValuePresence if the UpperValue flag is
   *                                                  set in the injected field.
   * @param {boolean} associationUpperValuePresence if the UpperValue flag is 
   *                                                set in the association.
   * @return {boolean} the result.
   */
  isOneToMany: function(injectedFieldUpperValuePresence, associationUpperValuePresence) {
    return (injectedFieldUpperValuePresence && !associationUpperValuePresence)
           || !injectedFieldUpperValuePresence && associationUpperValuePresence;
  },

  /**
   * Checks whether the relationship is a "many-to-many".
   * @param {boolean} injectedFieldUpperValuePresence if the UpperValue flag is
   *                                                  set in the injected field.
   * @param {boolean} associationUpperValuePresence if the UpperValue flag is 
   *                                                set in the association.
   * @return {boolean} the result.
   */
  isManyToMany: function(injectedFieldUpperValuePresence, associationUpperValuePresence) {
    return injectedFieldUpperValuePresence && associationUpperValuePresence;
  },

  /**
   * Extracts a type's name from a URI (URL or path).
   * @param {string} uri the string containing the type.
   * @return {string} the type's name.
   */
  getTypeName: function(uri) {
    return /\W([A-z]*)$/.exec(uri)[1];
  }
});

function InvalidTypeException(message) {
  this.name = 'InvalidTypeException';
  this.message = (message || '');
}
InvalidTypeException.prototype = new Error();

function NullPointerException(message) {
  this.name = 'NullPointerException';
  this.message = (message || '');
}
NullPointerException.prototype = new Error();

function NoValidationNameException(message) {
  this.name = 'NoValidationNameException';
  this.message = (message || '');
}
NoValidationNameException.prototype = new Error();

function WrongValidationException(message) {
  this.name = 'WrongValidationException';
  this.message = (message || '');
}
WrongValidationException.prototype = new Error();

function NoTypeException(message) {
  this.name = 'NoTypeException';
  this.message = (message || '');
}
NoTypeException.prototype = new Error();

function NoCardinalityException(message) {
  this.name = 'NoCardinalityException';
  this.message = (message || '');
}
NoCardinalityException.prototype = new Error();
