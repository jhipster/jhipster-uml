'use strict';

var merge = require('../helpers/object_helper').merge;

/**
 * The class holding validation data.
 */
var ValidationData = module.exports = function(values) {
  var defaults = {
    name: '',
    value: null
  };

  var merged = merge(defaults, values);
  this.name = merged.name;
  this.value = merged.value;
};
