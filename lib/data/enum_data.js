'use strict';

var merge = require('../helper/object_helper').merge;

var EnumData = module.exports = function(values) {
  var defaults = {
    name: '',
    values: []
  };

  var merged = merge(defaults, values);
  this.name = merged.name;
  this.values = merged.values;
};

EnumData.prototype.addValue = function(value) {
  this.values.push(value);
};
