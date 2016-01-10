'use strict';

var merge = require('../helpers/object_helper').merge;

/**
 * The class holding field data.
 */
var FieldData = module.exports = function(values) {
  var defaults = {
    name: '',
    type: '',
    comment: '',
    validations: []
  };

  var merged = merge(defaults, values);
  this.name = merged.name;
  this.type = merged.type;
  this.comment = merged.comment;
  this.validations = merged.validations;
};

/**
 * Adds a validation to the field.
 * @param {Object} validation the validation to add.
 * @return {FieldData} this modified class.
 */
FieldData.prototype.addValidation = function(validation) {
  this.validations.push(validation);
  return this;
};
