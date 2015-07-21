'use strict';

var _s = require('underscore.string'),
    AbstractParser = require('./abstract_parser'),
    parser_helper = require('./parser_helper');

/**
 * The parser for GenMyModel files.
 */
var GenMyModelParser = module.exports = function(root, databaseTypes) {
  AbstractParser.call(this, root, databaseTypes);
};

GenMyModelParser.prototype = Object.create(AbstractParser.prototype);
GenMyModelParser.prototype.constructor = AbstractParser;

GenMyModelParser.prototype.parse = function() {
  this.findElements();
  this.fillTypes();
  this.fillEnums();
  this.fillClassesAndFields();
  this.fillAssociations();
};

GenMyModelParser.prototype.findElements = function() {
  this.root.packagedElement.forEach(function(element, index) {
    switch (element.$['xsi:type']) {
      case 'uml:PrimitiveType':
      case 'uml:DataType':
        this.rawTypesIndexes.push(index);
        break;
      case 'uml:Enumeration':
        this.rawEnumsIndexes.push(index);
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
};

/*SEE IF IT'S POSSIBLE*/
GenMyModelParser.prototype.findConstraints = function() {
  if (!this.root.ownedRule) {
    return;
  }

  this.root.ownedRule.forEach(function(element, index) {
    switch (element.$['xsi:type']) {
      case 'uml:Constraint':
        this.rawValidationRulesIndexes.push(index);
        break;
      default:
    }
  }, this);
};

GenMyModelParser.prototype.fillTypes = function() {
  this.rawTypesIndexes.forEach(function(element) {
    var type = this.root.packagedElement[element];
    this.addType(_s.capitalize(type.$.name), type.$['xmi:id']);
  }, this);
};

GenMyModelParser.prototype.addType = function(typeName, typeId) {
  if (!this.databaseTypes.contains(typeName)) {
    throw new InvalidTypeException(
      "The type '"
      + typeName
      + "' isn't supported by JHipster, exiting now.");
  }
  this.types[typeId] = typeName;
};

GenMyModelParser.prototype.fillEnums = function() {
  this.rawEnumsIndexes.forEach(function(index) {
    var enumElement = this.root.packagedElement[index];
    if (!enumElement.$.name) {
      throw new NullPointerException("The Enumeration's name can't be null.");
    }
    this.enums[enumElement.$['xmi:id']] = {
      name: enumElement.$.name,
      values: [],
    };
    enumElement.ownedLiteral.forEach(function(literalIndex) {
      if(!literalIndex.$.name.toUpperCase()) {
        throw new NullPointerException(
          "The Enumeration's values can't be null.");
      }
      this.enums[enumElement.$['xmi:id']].values.push(
        literalIndex.$.name.toUpperCase()
      );
    }, this);
  }, this);
};

GenMyModelParser.prototype.fillAssociations = function() {
  this.rawAssociationsIndexes.forEach(function(element) {
    var association = this.root.packagedElement[element];
    //the first ownerdEnd is the OwnerSide
    var name = (association.ownedEnd)
                 ? association.ownedEnd[1].$.name
                 : '';
    var type = (association.ownedEnd)
                 ? association.ownedEnd[1].$.type
                 : '';
    this.associations[association.$['xmi:id']] = {
      isUpperValuePresent: association.ownedEnd
                            && association.ownedEnd[1].upperValue[0].$.value === '*',
      name: name,
      type: type
    };

    var classId = type;
    this.addInjectedField(association.ownedEnd[0],classId );

  }, this);
};

/**
 * Fills the classes and the fields that compose them.
 * @throws NullPointerException if a class' name, or an attribute, is nil.
 */
GenMyModelParser.prototype.fillClassesAndFields = function() {
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
          "No name is defined for the passed attribute, for class '"
          + element.$.name
          + "'.");
      }
      if (!parser_helper.isAnId(
          element.ownedAttribute[j].$.name,
          element.$.name)) {
        this.addField(element.ownedAttribute[j], element.$['xmi:id']);
      }
    }
  }
};

GenMyModelParser.prototype.checkForUserClass = function(element) {
  if (!this.userClassId && element.$.name.toLowerCase() === 'user') {
    this.userClassId = element.$['xmi:id'];
  }
};

/**
 * Adds a new class in the class map.
 * @param {Object} element the class to add.
 */
GenMyModelParser.prototype.addClass = function(element) {
  this.classes[element.$['xmi:id']] = {
    name: element.$.name,
    fields: [],
    injectedFields: []
  };
};

/**
 * Adds a new field to the field map.
 * @param {Object} element the field to add.
 * @param {string} classId the encapsulating class' id.
 */
GenMyModelParser.prototype.addField = function(element, classId) {
  this.addRegularField(element, classId);
};

/**
 * Adds a (regular, not injected) field to the field map.
 * @param {Object} element the new field to add.
 */
GenMyModelParser.prototype.addRegularField = function(element, classId) {
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
    var typeName = _s.capitalize(parser_helper.getTypeNameFromURL(element.type[0].$.href));

    this.addType(typeName, typeName); // id = name

    this.fields[element.$['xmi:id']].type = typeName;
  }
  this.classes[classId].fields.push(element.$['xmi:id']);
};

/**
* Adds an injected field to the corresponding map.
* @param {Object} element the field to add.
* @param {string} classId the id of the class containing this field.
*/
GenMyModelParser.prototype.addInjectedField  = function(element, classId) {
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
      parser_helper.getCardinality(
        this.injectedFields[element.$['xmi:id']],
        this.associations);
  this.classes[classId].injectedFields.push(element.$['xmi:id']);

};

/**
 * Fills the existing fields with the present validations.
 * @throws NoValidationNameException if no validation name exists for the
 *                                   validation value (1 for no minlength for
 *                                   instance).
 * @throws WrongValidationException if JHipster doesn't support the validation.
 */
GenMyModelParser.prototype.fillConstraints = function() {
  throw new UnimplementedOperationException(
    'This method must be implemented by a subclass to be called.');
};

// exception definitions
function UnimplementedOperationException(message) {
  this.name = 'UnimplementedOperationException';
  this.message = (message || '');
}
UnimplementedOperationException.prototype = new Error();

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
