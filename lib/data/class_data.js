'use strict';

var merge = require('../helpers/object_helper').merge;

/**
 * The class holding class data.
 */
var ClassData = module.exports = function(values) {
  var defaults = {
    name: '',
    fields: [],
    comment: '',
    dto: '',
    pagination: '',
    service: ''
  };

  var merged = merge(defaults, values);
  this.name = merged.name;
  this.fields = merged.fields;
  this.comment = merged.comment;
  this.dto = merged.dto || 'no';
  this.pagination = merged.pagination || 'no';
  this.service = merged.service || 'no';
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
