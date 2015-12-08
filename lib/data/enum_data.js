'use strict';

var merge = require('../helpers/object_helper').merge;

/**
 * The class holding enumeration data.
 */
var EnumData = module.exports = function(values) {
  var defaults = {
    name: '',
    values: []
  };

  var merged = merge(defaults, values);
  this.name = merged.name;
  this.values = merged.values;
};
