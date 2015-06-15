'use strict';

var _s = require('underscore.string'),
    parser = require('./parser'),
    cardinalities = require('../cardinalities');

/**
 * The parser for the XMI files exported by Visual Paradigm.
 */
exports.VisualParadigmParser = parser.AbstractParser.extend({
  parse: function() {
    this.findElements();
    this.findConstraints();
    this.fillTypes();
    this.fillAssociations();
    this.fillClassesAndFields();
    this.fillConstraints();
  },

  findElements: function() {
    this.root.packagedElement.forEach(function(element, index) {
      switch (element.$['xmi:type']) {
        case 'uml:PrimitiveType':
        case 'uml:DataType':
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
  },

  findConstraints: function() {
    if (!this.root.ownedRule) {
      return;
    }

    this.root.ownedRule.forEach(function(element, index) {
      if (this.rawValidationRulesIndexes.indexOf(element) == -1) {
        this.rawValidationRulesIndexes.push(index);
      }
    }, this);
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

  fillAssociations: function() {
    this.rawAssociationsIndexes.forEach(function(element) {
      var association = this.root.packagedElement[element];

      var name = (association.ownedEnd)
                   ? association.ownedEnd[0].$.name
                   : '';
      var type = (association.ownedEnd)
                   ? association.ownedEnd[0].$.type
                   : '';

      var isUpperValuePresent = false;
      if (!association.ownedEnd || association.ownedEnd
          && association.ownedEnd[0].upperValue
          && association.ownedEnd[0].upperValue[0].$.value === '*') {
        isUpperValuePresent = true;
      }

      this.associations[association.$['xmi:id']] = {
        name: name,
        type: type,
        isUpperValuePresent: isUpperValuePresent
      };
    }, this);
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
    if (element.$.association) {
      this.addInjectedField(element, classId);
    } else {
      this.addRegularField(element, classId);
    }
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
      isUpperValuePresent: false
    };
    if (element.upperValue && element.upperValue[0].$.value) {
      this.injectedFields[element.$['xmi:id']].isUpperValuePresent =
        element.upperValue[0].$.value === '*';
    }

    this.injectedFields[element.$['xmi:id']].cardinality =
      this.getCardinality(this.injectedFields[element.$['xmi:id']]);
    this.classes[classId].injectedFields.push(element.$['xmi:id']);
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

      var value = constraint.specification[0].$.body; // not nil, but ''

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
  isOneToOne: function(injectedFieldUpperValuePresence,
      associationUpperValuePresence) {
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
  isOneToMany: function(injectedFieldUpperValuePresence,
      associationUpperValuePresence) {
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
  isManyToMany: function(injectedFieldUpperValuePresence,
      associationUpperValuePresence) {
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
