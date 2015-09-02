'use strict';

var merge = require('../helper/object_helper').merge;

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

FieldData.prototype.addValidation = function(name, value) {
  this.validations[name] = value;
};
