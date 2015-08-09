'use strict';

var merge = require('../helper/object_helper').merge;

/**
 * The class holding the class data.
 */
var ClassData = module.exports = function(values) {
  var defaults = {
    name: '',
    fields: [],
    injectedFields: []
  };

  var merged = merge(defaults, values);
  this.name = merged.name;
  this.fields = merged.fields;
  this.injectedFields = merged.injectedFields;
};

/**
 * Adds a field to the class.
 * @param {Object} field the field to add.
 */
ClassData.prototype.addField = function(field) {
  this.fields.push(field);
};

/**
 * Adds an injected field to the class.
 * @param {Object} injectedField the injected field to add.
 */
ClassData.prototype.addInjectedField = function(injectedField) {
  this.injectedFields.push(injectedField);
};
