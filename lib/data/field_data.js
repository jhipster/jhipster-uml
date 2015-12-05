'use strict';

var merge = require('../helper/object_helper').merge;

/**
 * The class holding field data.
 */
var FieldData = module.exports = function(values) {
  var defaults = {
    name: '',
    type: '',
    validations: {},
    comment: ''
  };

  var merged = merge(defaults, values);
  this.name = merged.name;
  this.type = merged.type;
  this.validations = merged.validations;
  this.comment = merged.comment;
};

/**
 * Adds a validation.
 *
 * @param name the validation's name.
 * @param value its value, or null if none.
 * @returns {FieldData} this modified class.
 */
FieldData.prototype.addValidation = function(name, value) {
  this.validations[name] = value;
  return this;
};
