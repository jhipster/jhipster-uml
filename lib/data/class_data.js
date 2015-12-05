'use strict';

var merge = require('../helper/object_helper').merge;

/**
 * The class holding class data.
 */
var ClassData = module.exports = function(values) {
  var defaults = {
    name: '',
    fields: [],
    injectedFields: [],
    comment: '',
    dto: 'no',
    pagination: 'no'
  };

  var merged = merge(defaults, values);
  this.name = merged.name;
  this.fields = merged.fields;
  this.injectedFields = merged.injectedFields;
  this.comment = merged.comment;
  this.dto = merged.dto;
  this.pagination = merged.pagination;
};

/**
 * Adds a field to the class.
 * @param {Object} field the field to add.
 * @return {ClassData} this modified class.
 */
ClassData.prototype.addField = function(field) {
  this.fields.push(field);
  return this;
};

/**
 * Adds an injected field to the class.
 * @param {Object} injectedField the injected field to add.
 * @return {ClassData} this modified class.
 */
ClassData.prototype.addInjectedField = function(injectedField) {
  this.injectedFields.push(injectedField);
  return this;
};
